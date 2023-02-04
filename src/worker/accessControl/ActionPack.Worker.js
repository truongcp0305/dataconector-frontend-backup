import { permissionApi } from '@/api/permissionPack';
import { appManagementApi } from '@/api/AppManagement';
import { accessControlApi } from '@/api/accessControl';
import _groupBy from 'lodash/groupBy';
import { kanbanApi } from '@/api/kanban.js';
import { dashboardApi } from '@/api/dashboard.js';
import { documentApi } from '@/api/Document';
self.onmessage = async function (event) {
    var workerDataReceive = event.data;
    let action = workerDataReceive.action;
    let data = workerDataReceive.data;
    switch (action) {
        case 'deleteActionPack':
            let deleteActionPackRes = await deleteActionPack(data.ids);
            postMessage({
                action: 'handleDeleteActionPack',
                dataAfter: deleteActionPackRes,
            });
            break;
        case 'updateActionPack':
            let updateActionPackRes = await updateActionPack(data);
            postMessage({
                action: 'updateActionPack',
                dataAfter: updateActionPackRes,
            });
            break;
        case 'createActionPack':
            let createActionPackRes = await createActionPack(data);
            postMessage({
                action: 'createActionPack',
                dataAfter: createActionPackRes,
            });
            break;
        case 'detailActionPack':
            let dataDetail = await detailActionPack(data);
            postMessage({
                action: 'detailActionPack',
                dataAfter: dataDetail,
            });
            break;
        case 'detailAppAndOperationInApp':
            let detailAppAndOperationInApp = await getdetailAppInActionPack(data);
            postMessage({
                action: 'detailAppAndOperationInApp',
                dataAfter: detailAppAndOperationInApp,
            });
            break;
        case 'getDetailKanban':
            let detailKanban = await getDetailKanban(data);
            postMessage({
                action: 'getDetailKanban',
                dataAfter: detailKanban,
            });
            break;

        case 'getControlInDoc':
            let controlInDoc = await getAllControl(data.id);
            postMessage({
                action: 'getControlInDoc',
                dataAfter: controlInDoc,
            });
        default:
            break;
    }
};
const objectTypeInApp = ['document_definition', 'document_instance', 'dashboard', 'orgchart', 'workflow_definition']

export const deleteActionPack = async function (ids) {
    let arr = [];
    ids.forEach(async function (e) {
        let res = await permissionApi.deleteActionPackById(e);
        if (res.status == 200) {
            arr.push('success');
        } else {
            arr.push('error');
        }
    });
    return arr;
};
export const updateActionPack = async function (data) {
    let listNewOperations = await createNewOperations(data.operations);
    let operationsIds = {};
    listNewOperations.map((el) => {
        let filter = getActionPackFilter(
            el.objectIdentifier,
            el.action, data.operations
        );
        operationsIds[el.id] = filter
    });
    let dataToSave = {
        name: data.itemData.name,
        type: 'ba',
        description: data.itemData.description,
        listOperations: JSON.stringify(operationsIds),
        listFilter: getListFilter(data.operations)
    };
    let res = await permissionApi.updateActionPack(
        data.itemData.id,
        dataToSave,
    );
    return {
        status: res.status,
        message: res.message
    };

};
export const createActionPack = async function (data) {
    let listNewOperations = await createNewOperations(data.operations);
    let operationsIds = {};
    listNewOperations.map((el) => {
        operationsIds[el.id] = ""
    });
    let dataToSave = {
        name: data.itemData.name,
        type: 'ba',
        description: data.itemData.description,
        listOperations: JSON.stringify(operationsIds),
        listFilter: JSON.stringify([])
    };
    let res = await permissionApi.createActionPack(
        dataToSave
    );
    return {
        status: res.status,
        message: res.message ? res.message : ""
    };
};
const getListFilter = (operations) => {
    let listFilters = [];
    for (let objType in operations) {
        for (let objIden in operations[objType]) {
            if (operations[objType][objIden].filter.length > 0) {
                let filter = operations[objType][objIden].filter
                filter.map((e) => {
                    let filterStruct = [{
                        conditions: e.conditions,
                        actions: e.actions
                    }]
                    listFilters.push({
                        id: e.id,
                        action: [],
                        filterValues: JSON.stringify(e.filterValues),
                        filterStruct: JSON.stringify(filterStruct)
                    })
                })
            }
        }
    }
    return JSON.stringify(listFilters);
}
const getActionPackFilter = (obj, act, operations) => {
    let listCondition = [];
    for (let objType in operations) {
        for (let objIden in operations[objType]) {
            if (objIden == obj && operations[objType][objIden].filter.length > 0) {
                let filters = operations[objType][objIden].filter;
                for (let filter of filters) {
                    filter.actions.map((action) => {
                        if (action.field == act) {
                            listCondition.push(filter.id);
                        }
                    });
                }
            }
        }
    }
    listCondition = Array.from(new Set(listCondition)); // loại fiterid trùng
    return listCondition.join(',');
}
const createNewOperations = async function (operations) {
    return new Promise(async (resolve, reject) => {
        let newOperations = getNewOperationData(operations);
        let data = {
            operations: JSON.stringify(newOperations)
        };
        let res = await permissionApi.createMultipleOperation(data);
        if (res.status == 200) {
            resolve(res.data);
        } else {
            reject(res);
        }
    });
};

const getNewOperationData = function (operations) {
    let newOperations = []
    for (let objType in operations) {
        for (let objIden in operations[objType]) {
            if (operations[objType][objIden].action.length > 0) {
                operations[objType][objIden].action.forEach((e) => {
                    if (objType != 'stateflow_flow') {
                        newOperations.push({
                            objectType: objType,
                            action: e,
                            objectIdentifier: objIden,
                            name: e + ' ' + objIden.replace('_', ' ').replace(':', ' ')
                        })
                        if (objType == 'department' && objIden == 'department:0') {
                            newOperations[newOperations.length - 1].name = e
                        } else if (objType == 'department' && objIden != 'department:0') {
                            newOperations[newOperations.length - 1].name = objIden
                        }
                    } else {
                        newOperations.push({
                            objectType: objType,
                            action: e,
                            objectIdentifier: objIden,
                            name: e + ' ' + objIden.split(':')[0] + ' - ' + operations[objType][objIden].title,
                            objectName: operations[objType][objIden].idKanban
                        })
                    }
                })

            }
        }
    }
    return newOperations
};

export const detailActionPack = async function (id) {
    let promises = [
        permissionApi.getActionPackOperations(id),
    ];
    try {
        let res = await Promise.all(promises);
        let operations = _groupBy(res[0].data, 'objectType');
        let data = {};
        data.appsInActionPack = await getAppInActionPack(operations.application_definition);
        data.operations = await getAllOperations(operations, data.appsInActionPack);
        data.operations = await getFilterInActionPack(id, data.operations);
        data.selectedKanban = await getSelectedKanban(data.operations);
        if (data.operations.dashboard && Object.keys(data.operations.dashboard).length > 0) {
            data.operations = await getDashboardTab(data.operations);
        }
        return data
    } catch (error) {
        console.log('error when get data from action pack and app ', error);
    }
}


export const getdetailAppInActionPack = async function (idApp) {
    let data = {}
    let apps = await getDetailApp([], idApp)
    let listObjectIdentifier = []
    let operations = {}
    for (let obj of objectTypeInApp) {
        if (obj != 'document_instance')
            listObjectIdentifier = [...new Set(listObjectIdentifier.concat(apps[idApp].children[obj]))]
        operations[obj] = {}
    }
    let search = {
        ids: listObjectIdentifier,
        page: 1,
        pageSize: 1000
    };
    let res = await accessControlApi.getObjectIdentifier(search);
    if (res.status == 200) {
        res.data.forEach(function (e) {
            operations[e.type][e.objectIdentifier] = {
                id: e.objectIdentifier.split(':')[1],
                action: [],
                title: e.title == null ? e.name : e.title,
                filter: []
            }
            if (e.type == 'document_definition') {
                operations.document_instance[e.objectIdentifier + ':0'] = {
                    id: e.objectIdentifier.split(':')[1],
                    action: [],
                    title: e.title == null ? e.name : e.title,
                    filter: []
                }
            }
        })
    }
    if (operations.dashboard && Object.keys(operations.dashboard).length > 0) {
        operations = await getDashboardTab(operations);
    }
    data.apps = apps
    data.operations = operations
    return data
}

export const getDetailKanban = async function (idKanban) {
    let kanban = {
        id: idKanban,
        stateflow_flow: []
    };
    let operations = {};
    let res = await kanbanApi.getBoard(idKanban)
    if (res.status == 200) {
        kanban.name = res.data[0].name
        let data = JSON.parse(res.data[0].state_config).links
        let idDoc = res.data[0].id_doc;
        for (let key in data) {
            operations['stateflow_flow:' + idDoc + '_' + data[key].oldId] = {
                action: [],
                filter: [],
                id: idDoc + '_' + data[key].oldId,
                idKanban: idKanban,
                title: data[key].name

            }
            kanban.stateflow_flow.push('stateflow_flow:' + idDoc + '_' + data[key].oldId)
        }
    }
    return {
        kanban: kanban,
        operations: operations,
        id: idKanban
    }
}

const getSelectedKanban = async (operations) => {
    let kanban = {}
    let promises = [];
    if (operations.stateflow_flow) {
        let data = _groupBy(operations.stateflow_flow, 'idKanban');
        for (let id in data) {
            promises.push(kanbanApi.getBoard(id));
        }
    }
    try {
        await Promise.all(promises).then((rsl) => {
            rsl.forEach((res) => {
                let id = res.id
                kanban[id] = {
                    stateflow_flow: getStateflow(id, operations.stateflow_flow, res),
                    id: id,
                }
            })
        })
    } catch (e) {
        console.log('err when get detail kanban ' + e);
    }
    return kanban
}

const getStateflow = (idKanban, operations, res) => {
    let stateflowArr = []
    if (res.status == 200) {
        let data = JSON.parse(res.data[0].state_config).links
        let idDoc = res.data[0].id_doc;
        let arr = [];
        for (let key in data) {
            arr.push({ id: idDoc + '_' + data[key].oldId, title: data[key].name })
            stateflowArr.push('stateflow_flow:' + idDoc + '_' + data[key].oldId)
        }
        arr.forEach((e) => {
            if (!operations['stateflow_flow:' + e.id]) {
                operations['stateflow_flow:' + e.id] = {
                    action: [],
                    filter: [],
                    id: e.id,
                    idKanban: idKanban,
                    title: e.title
                }
            } else {
                operations['stateflow_flow:' + e.id].id = e.id;
                operations['stateflow_flow:' + e.id].idKanban = idKanban;
                operations['stateflow_flow:' + e.id].title = e.title;
            }
        })
    }
    return stateflowArr
}

const getAppInActionPack = async function (operations) {
    let apps = {};
    for (let key in operations) {
        let idApp = operations[key].objectIdentifier.split(':')[1];
        if (idApp && idApp != 0) {
            debugger
            apps = await getDetailApp(apps, idApp)
        }
    }
    return apps
}

export const getDetailApp = async function (apps, idApp) {
    let rsl = await appManagementApi.getAppDetails(idApp, false)
    if (rsl.status == 200) {
        let children = rsl.data.listObject.childrenApp
        let data = {
            id: idApp,
            name: rsl.data.listObject.name,
            children: {}
        }
        for (let objectIdentifier of objectTypeInApp) {
            data.children[objectIdentifier] = getObjectIdentifierInApp(children, objectIdentifier)
        }
        apps[idApp] = data
    }
    return apps
}

const getObjectIdentifierInApp = function (data, objectType) {
    let arr = [];
    if (objectType == 'document_instance') {
        for (let key in data.document_definition) {
            arr.push('document_definition:' + data.document_definition[key] + ':0')
        }
    } else
        for (let key in data[objectType]) {
            arr.push(objectType + ':' + data[objectType][key])
        }
    return arr
}

const getAllOperations = async function (data, apps) {
    let operations = {}
    let listObjectIdentifier = []
    for (let idx in apps) {
        for (let obj of objectTypeInApp) {
            if (obj != 'document_instance')
                listObjectIdentifier = [...new Set(listObjectIdentifier.concat(apps[idx].children[obj]))]
        }
    }
    for (let key in data) {
        if (!operations[key]) {
            operations[key] = {}
        }
        for (let i in data[key]) {
            let objIden = data[key][i].objectIdentifier;
            if (!(objIden.includes(key + ':0')) && !objIden.includes('department') && !objIden.includes('stateflow_flow') && !objIden.includes('control') && !listObjectIdentifier.includes(objIden)) {
                listObjectIdentifier.push(objIden)
            } else if (((objIden.includes(key + ':0')) || objIden.includes('department') || objIden.includes('stateflow_flow') || objIden.includes('control')) && !operations[key][objIden]) {
                operations[key][objIden] = {
                    id: '0',
                    action: [],
                    title: '',
                    filter: []
                }
            }
        }
    }
    operations = await getObjectIdentify(data, listObjectIdentifier, operations)
    return operations
}
const getObjectIdentify = async function (data, listObjectIdentifier, operations) {
    let search = {
        ids: listObjectIdentifier,
        page: 1,
        pageSize: 1000
    };
    let res = await accessControlApi.getObjectIdentifier(search);
    if (res.status == 200) {
        res.data.forEach(function (e) {
            if (!operations[e.type]) {
                operations[e.type] = {};
            }
            operations[e.type][e.objectIdentifier] = {
                id: e.objectIdentifier.split(':')[1],
                action: [],
                title: e.title == null ? e.name : e.title,
                filter: []
            }
        })
    }
    operations.document_instance = {}
    for (let i in operations.document_definition) {
        if (i != 'document_definition:0') {
            let objIden = i + ':0'
            operations.document_instance[objIden] = {
                id: operations.document_definition[i].id,
                title: operations.document_definition[i].title,
                filter: [],
                action: []
            }
        }
    }
    for (let objType in data) {
        for (let key in data[objType]) {
            if (operations[objType] && operations[objType][data[objType][key].objectIdentifier])
                operations[objType][data[objType][key].objectIdentifier].action.push(data[objType][key].action)
            if (objType == 'stateflow_flow') {
                if (!operations[objType][data[objType][key].objectIdentifier].idKanban) {
                    operations[objType][data[objType][key].objectIdentifier].idKanban = data[objType][key].objectName
                }
            }
        }
    }
    return operations;
}

const getFilterInActionPack = async function (id, operations) {
    let res = await accessControlApi.getFilterInActionPack(id);
    if (res.status == 200 && res.data != false) {
        res.data.map((e) => {
            let objType = e.object_identifier.split(':')[0];
            let objIden = e.object_identifier
            if (objType == 'document_instance') {
                objIden = objIden.replace('document_instance', 'document_definition') + ':0'
            }
            if (e.filter_struct) {
                let struct = JSON.parse(e.filter_struct);
                struct.map((filter) => {
                    if (operations[objType] && operations[objType][objIden]) {
                        if (e.id == filter.conditions[0].children[0].column.id)
                            operations[objType][objIden].filter.push({
                                id: e.id,
                                actions: filter.actions,
                                conditions: filter.conditions,
                                filterValues: JSON.parse(e.filter_values)
                            })
                    }
                })
            }
        })
    }
    return operations
}

const getDashboardTab = async function (operations) {
    let dashboard = operations.dashboard
    let ids = [];
    for (let key in dashboard) {
        ids.push(key.split(':')[1]);
    }
    let filter = {
        filter: [
            {
                column: 'id',
                operation: 'and',
                conditions: [
                    {
                        name: 'in',
                        value: ids
                    }
                ]
            }
        ],
    };
    let res = await dashboardApi.getDetailDashboard(filter);
    if (res.status == 200) {
        let data = res.data.listObject;
        if (!operations.dashboard_tab)
            operations.dashboard_tab = {}
        for (let i in data) {
            let idDashboard = data[i].id
            let tabs = data[i].configs.tabsAndPages.tabs;
            for (let j in tabs) {
                if (tabs[j].name != "") {
                    if (!operations.dashboard_tab['dashboard_tab:' + idDashboard + '_' + tabs[j].id]) {
                        operations.dashboard_tab['dashboard_tab:' + idDashboard + '_' + tabs[j].id] = {
                            id: tabs[j].id, title: tabs[j].name, filter: [], action: [], nameDashboard: data[i].name
                        }
                    }
                }
            }
        }
    }
    return operations
}
const getAllControl = async function (id) {
    let data = {
        control: {
            table: [],
            controlInTable: {}
        },
        operations: {},
        id: id
    }
    await documentApi.getAllControl(id).then((res) => {
        if (res.status == 200) {
            let allControl = res.data;
            allControl.forEach((t) => {
                if (t.type == 'table' && t.isHidden == 0) {
                    let idTable = 'control:' + id + ':' + t.name
                    data.control.table.push(idTable);
                    data.control.controlInTable[idTable] = []
                    setOperationControl(data.operations, idTable, t.name, t.title, id)
                }
            })
            allControl.forEach((c) => {
                if (c.table && c.table != false && c.isHidden == 0) {
                    let idTable = 'control:' + id + ':' + c.table.name
                    if (data.control.controlInTable[idTable]) {
                        data.control.controlInTable[idTable].push('control:' + id + ':' + c.name)
                        setOperationControl(data.operations, 'control:' + id + ':' + c.name, c.name, c.title, id)
                    }
                }
            })
        }
    })
    return data;
}
const setOperationControl = (operations, objIden, name, title, id) => {
    operations[objIden] = {
        action: [],
        filter: [],
        title: title,
        name: name,
        id: id + ':' + name
    }
}

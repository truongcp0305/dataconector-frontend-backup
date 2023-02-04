import { documentApi } from '@/api/Document';
import { orgchartApi } from '@/api/orgchart';
import { dashboardApi } from '@/api/dashboard';
import BpmnEngine from '@/api/BPMNEngine';
import { appManagementApi } from '@/api/AppManagement.js';

self.onmessage = async function (event) {
    var workerDataReceive = event.data;
    let action = workerDataReceive.action;
    let data = workerDataReceive.data;
    switch (action) {
        case 'search':
            let searchData = await searchItem(data);
            postMessage({ action: 'search', dataAfter: searchData });
            break;
        case 'updateApp':
            let updateAppData = await updateApp(data);
            postMessage({ action: 'updateApp', dataAfter: updateAppData });
            break;
        case 'createApp':
            let createAppData = await createApp(data);
            postMessage({ action: 'createApp', dataAfter: createAppData });
            break;
        case 'deleteApp':
            let deleteAppData = await deleteApp(data.id);
            postMessage({ action: 'deleteApp', dataAfter: deleteAppData });
            break;
        case 'getChildItemInApp':
            let dataAfter = await getChildItemInApp(data.data);
            postMessage({ action: 'getChildItemInApp', dataAfter: dataAfter });
            break;

        default:
            break;
    }
};

export const searchItem = async function (data) {
    let obj = {};
    let orgchartData = await orgchartApi.getOrgchartList({
        search: data.value,
        pageSize: 50,
    });
    obj.orgchart = orgchartData.data.listObject;
    let documnentData = await documentApi.searchListDocuments({
        search: data.value,
        pageSize: 100,
    });
    let arrCategory = [];
    let arrMajor = [];
    documnentData.data.listObject.forEach(function (e) {
        if (e.type == 'Nghiệp vụ') {
            arrMajor.push(e);
        } else if (e.type == 'Danh mục') {
            arrCategory.push(e);
        }
    });
    obj.document_category = arrCategory;
    obj.document_major = arrMajor;

    let workflowData = await BpmnEngine.getListModels({
        search: data.value,
        pageSize: 50,
    });
    obj.workflow_definition = workflowData.data.listObject;

    let dashboardData = await dashboardApi.getDashboardsApp({
        search: data.value,
        pageSize: 50,
    });
    obj.dashboard = dashboardData.data.listObject;
    sortApps(obj);
    return obj;
};
export const updateListItem = function (
    listItemSelected,
    childrenAppData,
    currentAppData,
) {
    for (let i in childrenAppData) {
        childrenAppData[i] = [];
    }
    if (listItemSelected.document_category.item.length > 0) {
        listItemSelected.document_category.item.forEach(function (e) {
            childrenAppData.document_definition.push(e.id);
        });
    }
    if (listItemSelected.document_major.item.length > 0) {
        listItemSelected.document_major.item.forEach(function (e) {
            childrenAppData.document_definition.push(e.id);
        });
    }
    if (listItemSelected.orgchart.item.length > 0) {
        listItemSelected.orgchart.item.forEach(function (e) {
            childrenAppData.orgchart.push(e.id);
        });
    }
    if (listItemSelected.dashboard.item.length > 0) {
        listItemSelected.dashboard.item.forEach(function (e) {
            childrenAppData.dashboard.push(e.id);
        });
    }
    if (listItemSelected.workflow_definition.item.length > 0) {
        listItemSelected.workflow_definition.item.forEach(function (e) {
            childrenAppData.workflow_definition.push(e.id);
        });
    }
    currentAppData.childrenApp = childrenAppData;
    return currentAppData;
};
export const updateApp = async function (data) {
    let dataApp = updateListItem(
        data.listItemSelected,
        data.childrenAppData,
        data.currentAppData,
    );
    // dataApp.childrenApp = JSON.stringify(dataApp.childrenApp)
    let res = await appManagementApi.updateApp(dataApp);
    return res;
};
export const createApp = async function (data) {
    let dataApp = updateListItem(
        data.listItemSelected,
        data.childrenAppData,
        data.currentAppData,
    );
    // dataApp.childrenApp = JSON.stringify(dataApp.childrenApp)
    let res = await appManagementApi.addApp(dataApp);
    return res;
};
export const deleteApp = async function (id) {
    let res = await appManagementApi.deleteApp(id);
    return res;
};
export const getChildItemInApp = async function (data) {
    let obj = {};
    if (data.orgchart.length > 0) {
        let dataOrg = data.orgchart;
        let resOrg = await orgchartApi.getOrgchartList({
            search: '',
            pageSize: 50,
            filter: [
                {
                    column: 'id',
                    valueFilter: {
                        operation: 'IN',
                        values: dataOrg,
                    },
                },
            ],
        });
        obj.orgchart = resOrg.data.listObject;
    }
    if (data.document_definition.length > 0) {
        let dataDoc = data.document_definition;
        let resDoc = await documentApi.searchListDocuments({
            search: '',
            pageSize: 400,
            filter: [
                {
                    column: 'id',
                    valueFilter: {
                        operation: 'IN',
                        values: dataDoc,
                    },
                },
            ],
        });
        let arrCategory = [];
        let arrMajor = [];
        resDoc.data.listObject.forEach(function (e) {
            if (e.type == 'Nghiệp vụ') {
                arrMajor.push(e);
            } else if (e.type == 'Danh mục') {
                arrCategory.push(e);
            }
        });
        obj.document_major = arrMajor;
        obj.document_category = arrCategory;
    }
    if (data.workflow_definition.length > 0) {
        let dataW = data.workflow_definition;
        let resW = await BpmnEngine.getListModels({
            search: '',
            pageSize: 50,
            filter: [
                {
                    column: 'id',
                    valueFilter: {
                        operation: 'IN',
                        values: dataW,
                    },
                },
            ],
        });
        obj.workflow_definition = resW.data.listObject;
    }
    if (data.dashboard.length > 0) {
        let dataRep = data.dashboard;
        let resRp = await dashboardApi.getDashboardsApp({
            search: '',
            pageSize: 50,
            filter: [
                {
                    column: 'id',
                    valueFilter: {
                        operation: 'IN',
                        values: dataRep,
                    },
                },
            ],
        });
        obj.dashboard = resRp.data.listObject;
    }
    sortApps(obj);
    return obj;
};

export const sortApps = function (obj, haveItem = false) {
    let keys = Object.keys(obj);
    for (let key of keys) {
        if (
            key == 'document_category' ||
            key == 'document_major'
        ) {
            let data = !haveItem ? obj[key] : obj[key].item
            data.sort(
                (a, b) =>
                    a.title
                        .toLowerCase()
                        .localeCompare(b.title.toLowerCase())
            );
        } else {
            let data = !haveItem ? obj[key] : obj[key].item
            data.sort(
                (a, b) =>
                    a.name
                        .toLowerCase()
                        .localeCompare(b.name.toLowerCase())
            );
        }
    }
    return obj;
}
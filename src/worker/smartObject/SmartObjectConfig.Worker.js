import { registerPromiseWorker } from '@/worker/registerPromiseWorker.js';
import { documentApi } from '@/api/Document.js';
import _isEmpty from 'lodash/isEmpty';
import workflowApi from '@/api/BPMNEngine.js';
import { orgchartApi } from '@/api/orgchart.js';
import { smartObjectApi } from '@/api/smartObject.js';
import { util } from '@/plugins/util';



var handler = {
    async searchObject(data) {
        let dataSearchDocument = util.cloneDeep(data)
        let dataSearchOrg = util.cloneDeep(data)
        dataSearchDocument.searchColumns = 'id,name,title'
        dataSearchOrg.searchColumns = 'id,name,code'
        try {
            let promises = [
                documentApi.getListDocumentFilter(dataSearchDocument),
                orgchartApi.getOrgchartList(dataSearchOrg)
            ];

            let res = await Promise.all(promises);

            if (res[0].status == 200 && res[1].status == 200) {
                res[1].data.listObject.map((org) => {
                    org.type = 'orgchart'
                    org.title = org.name
                    org.name = org.code
                })
                return [...res[0].data.listObject, ...res[1].data.listObject]
            }

        } catch (error) {
            console.error(error);
            return false;
        }
    },
    // lấy tất cả control trong doc
    async getAllControlInDoc(documentId) {
        try {
            var listColumn = [];
            let res = await documentApi.getAllControl(documentId)
            if (res.status === 200) {
                for (let f in res.data) {
                    let data = {
                        id: res.data[f].id,
                        name: res.data[f].name,
                        title: res.data[f].title,
                        type: res.data[f].type,
                    }
                    if (res.data[f].inTable) {
                        data.inTable = {
                            id: res.data[f].inTable,
                            name: res.data[f].table.name,
                            title: res.data[f].table.title,
                            type: res.data[f].table.type,
                        }
                    }
                    listColumn.push(data);
                }
                return listColumn
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    async getAllWorflow() {
        try {
            let res = await workflowApi.getListModels();
            if (res.status === 200) {
                return res.data.listObject
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    async checkExistName(name) {
        try {
            let res = await smartObjectApi.checkExistNameSmartObject(name);
            if (res.status === 200) {
                return res.data
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    async restoreSmartObjectConfig(data) {
        try {
            let res = await smartObjectApi.getSmartObject(data.id);
            if (res.status == 200) {
                let dataSMO = {}
                dataSMO.nameEdit = res.data.generalInfor.name;
                dataSMO.nameSmartObject =
                    res.data.generalInfor.name;
                dataSMO.desSmartObject =
                    res.data.generalInfor.description;
                // object
                let listObject = res.data.objects;
                dataSMO.listObject = {}
                for (let object in listObject) {
                    let listAction = [];
                    if (listObject[object].type.trim() == 'document') {
                        // custom action
                        listAction = JSON.parse(listObject[object].action);
                        for (let action of listAction) {
                            let customAction = {
                                type: {
                                    title: 'Loại',
                                    placeholder: 'Chọn loại',
                                    type: 'select',
                                    value: action.value.type,
                                    appendIcon: 'mdi-chevron-down',
                                    showId: false,
                                    options: [
                                        {
                                            text: 'Theo công thức',
                                            value: 'formula',
                                        },
                                        {
                                            text: 'Theo quy trình',
                                            value: 'workflow',
                                        },
                                    ],
                                },
                                formula: {
                                    title: 'Công thức',
                                    type: 'script',
                                    value: '',
                                },
                                workflow: {
                                    title: 'Quy trình',
                                    placeholder: 'Chọn quy trình',
                                    type: 'select',
                                    appendIcon: 'mdi-chevron-down',
                                    value: '',
                                    showId: false,
                                    options: data.listWorkflow,
                                    returnOject: true,
                                    itemValue: 'id',
                                    itemText: 'name',
                                },
                            };
                            if (action.value.type == 'formula') {
                                customAction.formula.value =
                                    action.value.value;
                            } else if (action.value.type == 'workflow') {
                                customAction.workflow.value =
                                    action.value.value;
                            }
                            action.value = customAction;
                        }
                    }
                    let config = JSON.parse(listObject[object].config);
                    // custom config, mapping lại data control
                    if (listObject[object].type.trim() == 'document') {
                        let listControl = await this.getAllControlInDoc(
                            listObject[object].idObject,
                        );
                        config.displayInfor.allColumn = listControl;

                        let mapIdControlToDataControl = {};
                        for (
                            let index = 0;
                            index < listControl.length;
                            index++
                        ) {
                            const element = listControl[index];
                            mapIdControlToDataControl[element.id] = element;
                        }
                        for (let colSelected in config.displayInfor
                            .listColSelected) {
                            let col =
                                mapIdControlToDataControl[
                                config.displayInfor.listColSelected[
                                    colSelected
                                ].id
                                ];
                            if (col) {
                                config.displayInfor.listColSelected[
                                    colSelected
                                ] = col;
                            } else {
                                config.displayInfor.listColSelected.splice(
                                    colSelected,
                                    1,
                                );
                            }
                        }
                    }
                    let obj = {
                        idObject: listObject[object].idObject,
                        type: listObject[object].type,
                        config: config,
                    };

                    if (listAction) {
                        obj.action = listAction;
                    }
                    dataSMO.listObject[
                        listObject[object].id
                    ] = obj;
                }
                dataSMO.links = res.data.links
                return dataSMO

            } else {
                console.error(error);
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }
};
registerPromiseWorker(self, handler);

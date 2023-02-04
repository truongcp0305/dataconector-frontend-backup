import { documentApi } from '@/api/Document.js';
import { documentServiceApi } from '@/api/DocumentService.js';
import { formulasApi } from '@/api/Formulas.js';
import { uiConfigApi } from '@/api/uiConfig';
onmessage = function (event) {
    let data = event.data;
    let action = data.action;
    if (handler[action]) {
        handler[action](data.data);
    } else {
        console.error(` action ${action} not found `);
    }
};

var handler = {
    async getListDocumentBefor(data) {
        let filter = data.filter;
        let res = await documentApi.getListDocumentFilter(filter);
        if (res.status == 200 && res.data && res.data.listObject.length > 0) {
            self.postMessage({
                action: 'getListDocumentBeforAfter',
                data: { listDocument: res.data.listObject },
            });
        }
    },

    async saveUpdateGanttBefor(data) {
        let dataPost = {
            formula: data.data.formula,
            dataInput: JSON.stringify(data.data.dataInput),
        };
        let isErr = false;
        let res;
        try {
            res = await formulasApi.getMultiData(dataPost); // res là arr
        } catch (error) {
            self.postMessage({
                action: 'handleError',
                data: { dataError: error },
            });
        }
        if (res && res.status == 200) {
            self.postMessage({ action: 'saveUpdateGanttAfter' });
        }
    },
    async getListDocumentSubmitTaskBefor(data) {
        let filter = data.filter;
        let res = await documentApi.getListDocumentFilter(filter);
        if (res.status == 200 && res.data && res.data.listObject.length > 0) {
            self.postMessage({
                action: 'getListDocumentSubmitTaskAfter',
                data: { listDocument: res.data.listObject },
            });
        }
    },

    async ganttChartRemoveTask(data) {
        let defInfor = data.defInfor;
        let res;
        if (defInfor.documentParentId == '0') {
            res = await documentApi.deleteDocumentObject({
                objectIds: JSON.stringify([data.documentObjectId]),
            });
        } else {
            let obj = {
                documentName: defInfor.documentParentName,
                tableName: defInfor.documentOriginName,
                ids: data.documentObjectId,
            };
            res = await documentServiceApi.deleteRowInTable(obj);
        }
        if (res && res.status == 200) {
            self.postMessage({ action: 'ganttChartRemoveTaskAfter' });
        }
    },
    async getZoomLevel(data) {
        let res = await uiConfigApi.getUiConfig(data.widgetIdentifier);
        self.postMessage({
            action: 'handleGetZoomLevel',
            data: res,
        });
    },
    setZoomLevel(data) {
        uiConfigApi.saveUiConfig(data);
    },
    setShowableColumns(data) {
        uiConfigApi.saveUiConfig(data);
    },
    saveExtraGanttConfig(data) {
        uiConfigApi.saveUiConfig(data);
    },
    async getExtraGanttConfig(data) {
        let res = await uiConfigApi.getUiConfig(data.widgetIdentifier);
        self.postMessage({
            action: 'handleGetExtraGanttConfig',
            data: res,
        });
    },
    async getShowableColumn(data) {
        let res = await uiConfigApi.getUiConfig(data.personalWidget);
        self.postMessage({
            action: 'handleGetShowableColumn',
            data: res,
        });
    },
    setColumnWidth(data) {
        uiConfigApi.saveUiConfig(data);
    },
    setTaskIndex(data) {
        uiConfigApi.saveUiConfig(data);
    },
    async getTaskIndex(data) {
        let res = await uiConfigApi.getUiConfig(data.widgetIdentifier);
        self.postMessage({
            action: 'handleGetTaskIndex',
            data: res,
        });
    },
    async getColumnWidth(data) {
        let res = await uiConfigApi.getUiConfig(data.widgetIdentifier);
        self.postMessage({
            action: 'handleGetColumnWidth',
            data: res,
        });
    },
    async getObjectDefinition(data) {
        if (data.list.length > 0) {
            let ids = [];
            data.list.forEach(function (e) {
                if (e && e.documentObjectId) {
                    ids.push(e.documentObjectId);
                }
            });
            let res = await documentApi.getDocumentDefinitionByObject({
                ids: JSON.stringify(ids),
            });
            self.postMessage({
                action: 'handleGetObjectDefinition',
                data: res,
            });
        }
    },
};

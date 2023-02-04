import Api from './api';
import { appConfigs } from './../configs.js';
let fileManagement = new Api(appConfigs.apiDomain.fileManagement);
let document = new Api(appConfigs.apiDomain.sdocumentManagement);
let workfloweExtend = new Api(appConfigs.apiDomain.workflowExtend);
let logService = new Api(appConfigs.apiDomain.log);

export const taskApi = {
    getFileByList(data) {
        return fileManagement.get('getFileByObjectIdentifier', {
            objectIdentifier: data.objectIdentifier,
            objectType: data.objectType,
        });
    },
    countInstant(data) {
        return workfloweExtend.post('works/count', data);
    },
    downloadFile(id) {
        window.open(
            appConfigs.apiDomain.fileManagement + 'downloadS/' + id,
            '_blank',
        );
    },
    deleteFile(data) {
        return fileManagement.put('changeStatusSymperFile', data);
    },
    renameFile(data) {
        return fileManagement.put('renameFile', data);
    },
    getDocumentObjIds(data) {
        return document.post('documents/object/batch', data);
    },
    getListDocumentWithUserSubmit(userId) {
        return document.get('documents/objects-out-workflow/' + userId);
    },
    getListNodeInProcess() {
        return workfloweExtend.get('activities');
    },
    getVariableWorkflow(filter) {
        if (filter.size) {
            filter.pageSize = filter.size;
            delete filter.size;
        }
        return workfloweExtend.post('variables/query', filter);
    },
    getDocumentInVariables(filter) {
        return workfloweExtend.get('variables/documents', {
            page: filter.page,
            pageSize: filter.pageSize,
            search: filter.search,
        });
    },
    getListWork(filter) {
        return workfloweExtend.get('works', filter);
    },

    getHistoryTask(id) {
        let data = {
            query: {
                bool: {
                    must: [
                        {
                            term: {
                                logObjectType: 'task',
                            },
                        },
                        {
                            term: {
                                'logObjectId.keyword': id,
                            },
                        },
                    ],
                },
            },
        };
        return logService.post('query', data);
    },
};

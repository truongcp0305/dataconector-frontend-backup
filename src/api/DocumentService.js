import Api from './api';
import { appConfigs } from './../configs.js';

var api = new Api(appConfigs.apiDomain.documentService);
export const documentServiceApi = {
    query(data) {
        return api.post('documents/query', data);
    },
    deleteRowInTable(data) {
        return api.delete(
            `documents/${data.documentName}/${data.tableName}/rows`,
            { ids: data.ids },
        );
    },
    getInforOrgchart(data) {
        return api.get('documents/orgchart-nodes/' + data);
    },
};

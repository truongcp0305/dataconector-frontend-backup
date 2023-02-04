import Api from './api';
import { appConfigs } from './../configs.js';

var api = new Api(appConfigs.apiDomain.sdocumentManagement);
export const systemDataMappingApi = {
    save(data) {
        return api.post('system-mapping', data);
    },
    saveBatch(data) {
        return api.post('system-mapping/batch', data);
    },
    edit(id, data) {
        return api.put('system-mapping/' + id, data);
    },
    editBatch(data) {
        return api.put('system-mapping/batch', data);
    },
    getByDoc(documentId) {
        return api.get('system-mapping/' + documentId);
    },
    delete(id) {
        return api.delete('system-mapping/' + id);
    },
    deleteInDoc(documentId) {
        return api.delete('system-mapping/documents/' + documentId);
    },
};

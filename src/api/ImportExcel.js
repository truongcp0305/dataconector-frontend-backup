import Api from './api';
import { appConfigs } from './../configs.js';

let api = new Api(appConfigs.apiDomain.importExcel);
export default {
    pushDataExcel(data) {
        return api.post('mapping-file', data);
    },
    getProcessing(key) {
        return api.get('getProcessStatus' + '/' + key);
    },
    getMapping(objId) {
        return api.get('mapping/document/' + objId);
    },
    cancelImport(fileName) {
        return api.get('stop-process/' + fileName);
    },
    downloadExcel(fileName) {
        return api.get('download/' + fileName);
    },
};

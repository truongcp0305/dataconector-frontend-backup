import Api from './api';
import { appConfigs } from '../configs.js';

let api = new Api(appConfigs.apiDomain.exportExcel);
export default {
    getProcessing(uuid) {
        return api.get('process' + '/' + uuid);
    },
    cancelExport(uuid) {
        return api.post('process/stop', uuid);
    },
};

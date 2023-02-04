import Api from './api';
import { appConfigs } from './../configs.js';
import { util } from '../plugins/util';

let api = new Api(appConfigs.apiDomain.biService);

export const dataflowApi = {
    getInfo(id, experimentalMode) {
        let query = experimentalMode ? `?experimentalMode=${experimentalMode}` : '';
        return api.get(`dataflow/${id}/get_info` + query);
    },
    createDataflow(config) {
        return api.post('dataflow', JSON.stringify(config), {}, {
            contentType: "application/json",
        });
    },
    updateDataflow(id, config) {
        return api.put(`dataflow/${id}`, JSON.stringify(config), {}, {
            contentType: "application/json",
        });
    },
    deleteDataflow(ids) {
        return api.delete('dataflow/' + ids)
    },
    restoreDataflow(id) {
        return api.put('dataflow/' + id + '/restore')
    },
    getProcessingRunningDataflow(session) {
        return api.get('dataflow/progressing/' + session);
    },
    stopRunDataflow(session) {
        return api.get('dataflow/stop/' + session);
    },
};
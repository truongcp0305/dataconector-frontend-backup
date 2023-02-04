import Api from './api';
import { appConfigs } from './../configs.js';

var coreApi = new Api(appConfigs.apiDomain.core);
export const serviceApi = {
    add(data) {
        return coreApi.post('service', data);
    },
    edit(data) {
        return coreApi.put('service', data);
    },
    delete(data) {
        return coreApi.delete('service', data);
    },
};

import Api from './api';
import { appConfigs } from './../configs.js';

let api = new Api(appConfigs.apiDomain.nofitication);

export default {
    showAllModuleConfig() {
        return api.get('sources');
    },
    showAllLists() {
        return api.get('channels');
    },
    showListsSubcribed(data) {
        return api.get('channels', data);
    },
    addChanel(data) {
        return api.post('channels', data);
    },
    updateChanel(id, data) {
        return api.put('channels/' + id, data);
    },
    subscribeChanel(id, data) {
        return api.post('channels/' + id + '/filter', data);
    },
    deleteNotification(id) {
        return api.delete('channels/' + id);
    },
};

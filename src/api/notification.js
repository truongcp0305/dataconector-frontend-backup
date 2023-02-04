import Api from './api';
import { appConfigs } from './../configs.js';

let api = new Api(appConfigs.apiDomain.nofitication);

export default {
    showAllModuleConfig() {
        return api.get('sources');
    },
    showListsSubcribed() {
        return apiSyql.post('channels');
    },
};

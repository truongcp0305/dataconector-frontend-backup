import Api from './api';
import { appConfigs } from './../configs.js';

let api = new Api(appConfigs.apiDomain.account);

export default {
    getListBA(page, pageSize) {
        return api.get('supporters?search=' + page + '&pageSize=' + pageSize);
    },
    detailBa(id) {
        return api.get('supporters/' + id);
    },
};

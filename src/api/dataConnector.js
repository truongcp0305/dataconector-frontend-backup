import Api from './api';
import { appConfigs } from './../configs.js';

// let api = new Api(appConfigs.apiDomain.dataConnector);
let api = new Api(appConfigs.uniqueApiDomain.dataConnector);

export default {
    // danh sách showlist
    getAllData() {
        return api.get('apiQueries');
    },
    // thông tin api
    getDetailData() {
        return api.get('apiQueries');
    },
    stopApi(uuid) {
        return api.put('apiQueries/cronjobs/' + uuid);
    },
    // chạy định kỳ
    excuteJob(data) {
        return api.post('apiQueries/executeJob', data);
    },
    //chạy thử
    runApi(data) {
        return api.post('apiQueries/extractData', data);
    },
    //
    loadApi(data) {
        return api.post('apiQueries/loadData', data);
    },
    saveApi(data) {
        return api.post('apiQueries', data);
    },
    updateApi(data) {
        return api.put('apiQueries/' + data.uuid, data);
    },
    deleteApi(uuid) {
        return api.delete('apiQueries/' + uuid);
    },
    viewApi(uuid) {
        return api.get('apiQueries/' + uuid);
    },
    getProcess(uuid) {
        return api.get('apiQueries/progress/' + uuid);
    },
    getPartnerConfigs() {
        return api.get('partner');
    }
};

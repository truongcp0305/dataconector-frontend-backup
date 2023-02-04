import Api from './api';
import { appConfigs } from './../configs.js';

let api = new Api(appConfigs.apiDomain.smartObject);

export const smartObjectApi = {
    getSmartObjectList() {
        return api.get('smart-object');
    },
    getListTrash() {
        return api.get('smart-object/trash');
    },
    deleteSmartObject(id) {
        return api.put('delete/' + id);
    },
    createSmartObject(data) {
        return api.post('smart-object', data);
    },
    updateSmartObject(id, data) {
        return api.put('smart-object/' + id, data);
    },
    checkExistNameSmartObject(name) {
        return api.post('smart-object/checkExistSmartObject/' + name);
    },
    getSmartObject(id) {
        return api.get('smart-object/' + id);
    },
    getSmartObjectByIdObject(type, idObject) {
        return api.get('view-smart-object/' + type +'/' + idObject);
    },
    restore(id) {
        return api.put('restore/' + id);
    },
};
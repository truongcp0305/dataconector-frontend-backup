import Api from './api';
import { appConfigs } from './../configs.js';

var api = new Api(appConfigs.apiDomain.permission);
var appApi = new Api(appConfigs.apiDomain.appManagement);
export const accessControlApi = {
    getAllTypeAction() {
        return api.get('operations/actions');
    },
    getAllApp() {
        return appApi.get('application');
    },
    getObjectIdentifier(data) {
        return api.post('operations/objects', data);
    },
    getNodePermission(id) {
        return api.get('roles/' + id + '/permissions');
    },
    savePermission(data) {
        return api.post('roles/set-permissions', {
            permissions: data,
        });
    },
    getListSeverKey() {
        return api.get('server_keys');
    },
    addServerKey(data) {
        return api.post('server_keys', data);
    },
    updateServerKey(id, data) {
        return api.put('server_keys/' + id, data);
    },
    deleteServerKey(id) {
        return api.delete('server_keys/' + id);
    },
    getDetailServerKey(id) {
        return api.get('server_keys/' + id, id);
    },
    getListFilter() {
        return api.get('filters');
    },
    saveFilter(data) {
        return api.post('filters', data);
    },
    deleteFilter(data) {
        return api.delete('filters/' + data);
    },
    updateFilter(id, data) {
        return api.put('filters/' + id, data);
    },
    getFilterInActionPack(actionPackId) {
        return api.get('filters-in-action-pack/' + actionPackId);
    },
};

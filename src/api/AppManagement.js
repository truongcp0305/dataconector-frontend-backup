import Api from './api';
import { appConfigs } from './../configs.js';

var coreApi = new Api(appConfigs.apiDomain.appManagement);
var accessControlApi = new Api(appConfigs.apiDomain.operations);
let trashApi = new Api(appConfigs.apiDomain.trash);
// var formulasApi = new Api(appConfigs.apiDomain.formulasService)
export const appManagementApi = {
    listApps(filter) {
        return coreApi.get('application', filter);
    },
    addApp(data) {
        return coreApi.post(
            'application',
            data,
            {},
            { contentType: 'application/json' },
        );
    },
    deleteApp(id) {
        return coreApi.delete('application/' + id);
    },
    getAppDetails(id, getAction = true) {
        return coreApi.get('application/' + id, { getAction: getAction });
    },
    getApps(ids) {
        return coreApi.get('applications/multiple/' + ids);
    },
    getActiveApp() {
        return coreApi.get('application-active');
    },
    getActiveAppSBS(ids) {
        let uri = 'application-active/side-by-side';
        if (typeof ids == 'string' && ids) {
            uri += `?ids=${ids}`;
        }
        return coreApi.get(uri);
    },
    updateApp(data) {
        return coreApi.put(
            'application',
            data,
            {},
            { contentType: 'application/json' },
        );
    },
    addFavoriteItem(userId, objectIdentifier, objectType, action, appId) {
        return coreApi.post('app-item-favorite', {
            userId: userId,
            objectIdentifier: objectIdentifier,
            objectType: objectType,
            action: action,
            appId: appId,
        });
    },
    getItemFavorite(userId) {
        return coreApi.get('app-item-favorite/' + userId);
    },
    getAppDetailBa(id) {
        return coreApi.get('application-ba/' + id);
    },
    getListObjectIdentifier(data) {
        return accessControlApi.post('objects', data);
    },
    restore(id) {
        return coreApi.put('application/restore', { id: id });
    },
    deleteTrashItem(id) {
        return trashApi.delete('items/object/application_definition:' + id);
    },
};

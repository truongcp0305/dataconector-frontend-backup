import Api from './api';
import { appConfigs } from '../configs.js';
import { util } from '../plugins/util';

var permissionModuleApi = new Api(appConfigs.apiDomain.permission);
var actionModuleApi = new Api(appConfigs.apiDomain.actionPacks);
var permissionPackApi = new Api(appConfigs.apiDomain.permissionPacks);
var operationPackApi = new Api(appConfigs.apiDomain.operations);

export const permissionApi = {
    createPermission(data) {
        data.status = 1;
        return permissionPackApi.post('', data);
    },

    updatePermission(id, data) {
        data.status = 1;
        return permissionPackApi.put(id, data);
    },

    getAllPermission() {
        return permissionPackApi.get('');
    },
    getPermissionOfRole(roleId) {
        return permissionModuleApi.get('roles/' + roleId + '/permissions');
    },

    deletePermissionPack(idPacks) {
        if (typeof idPacks == 'string') {
            idPacks = idPacks.split(',');
        }
        let prms = [];
        for (let id of idPacks) {
            prms.push(permissionPackApi.delete(id));
        }
        return Promise.all(prms);
    },
    deletePermissionPackBeta(ids) {
        return permissionPackApi.delete(ids);
    },
    getActionPackOfPermission(permissionId) {
        return permissionPackApi.get(permissionId + '/action_packs');
    },
    getAllActionPack() {
        return actionModuleApi.get('');
    },
    deleteActionPack(idPacks) {
        if (idPacks.length > 1) {
            idPacks = idPacks.join(',');
        }
        return actionModuleApi.delete('/' + idPacks, idPacks);
    },
    deleteActionPackById(id) {
        return actionModuleApi.delete('/' + id);
    },

    createMultipleOperation(data) {
        return operationPackApi.post('save-batch', data);
    },

    getOperationOfActionPack(actionId) {
        return operationPackApi.get('/' + actionId + '/operations');
    },

    getAllActionByObjectType() {
        return operationPackApi.get('actions');
    },

    createActionPack(data) {
        return actionModuleApi.post('', data);
    },

    updateActionPack(id, data) {
        return actionModuleApi.put(id, data);
    },

    getActionPackOperations(actionPackId) {
        return actionModuleApi.get(actionPackId + '/operations');
    },

    getObjectsByObjectType(data) {
        return operationPackApi.post('objects', data);
    },
};

import { permissionApi } from '@/api/permissionPack';
import { systemRoleApi } from '@/api/systemRole.js';
import { accessControlApi } from '@/api/accessControl';

self.onmessage = async function (event) {
    var workerDataReceive = event.data;
    let action = workerDataReceive.action;
    let data = workerDataReceive.data;
    switch (action) {
        case 'getDetailSystemRole':
            let getDetailSystemRoleRes = await getDetailSystemRole(data);
            postMessage({
                action: 'getDetailSystemRole',
                dataAfter: getDetailSystemRoleRes,
            });
            break;
        case 'deleteRole':
            let deleteRes = await deleteRole(data.ids);
            postMessage({ action: 'deleteRole', dataAfter: deleteRes });
            break;
        case 'updateRole':
            let updateRoleRes = await updateRole(data);
            postMessage({ action: 'updateRole', dataAfter: updateRoleRes });
            break;
        case 'createRole':
            let createRoleRes = await createRole(data.dataToSave);
            postMessage({ action: 'createRole', dataAfter: createRoleRes });
            break;
        case 'getNodePermission':
            let getNodePermissionRes = await getNodePermission(data.id);
            postMessage({
                action: 'getNodePermission',
                dataAfter: getNodePermissionRes,
            });
            break;
        case 'savePermission':
            let savePermissionRes = await savePermission(data.dataToSave);
            postMessage({
                action: 'savePermission',
                dataAfter: savePermissionRes,
            });
            break;
        default:
            break;
    }
};

export const getDetailSystemRole = async function (data) {
    let res = await systemRoleApi.detail(data.id);
    let resPermission = await permissionApi.getPermissionOfRole(
        data.getPermissionOfRole,
    );
    return {
        dataSystemRole: res,
        dataPermission: resPermission,
    };
};
export const deleteRole = async function (ids) {
    let res = await systemRoleApi.delete(ids);
    if (res.status == 200) {
        return 'success';
    } else {
        return 'error';
    }
};
export const createRole = async function (data) {
    let res = await systemRoleApi.create(data);
    if (res.status == 200) {
        return 'success';
    } else {
        return 'error';
    }
};
export const updateRole = async function (data) {
    let res = await systemRoleApi.update(data.id, data.dataToSave);
    if (res.status == 200) {
        return 'success';
    } else {
        return 'error';
    }
};
export const getNodePermission = async function (id) {
    let res = await accessControlApi.getNodePermission(id);
    return {
        res: res,
        id: id,
    };
};
export const savePermission = async function (data) {
    let res = await accessControlApi.savePermission(data);
    if (res.status == 200) {
        return 'success';
    } else {
        return 'error';
    }
};

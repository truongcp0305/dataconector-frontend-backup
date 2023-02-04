import { uiConfigApi } from '@/api/uiConfig';
import { permissionApi } from '@/api/permissionPack';

self.onmessage = async function (event) {
    var workerDataReceive = event.data;
    let action = workerDataReceive.action;
    let data = workerDataReceive.data;
    switch (action) {
        case 'deletePermission':
            let deletePermissionRes = await deletePermission(data.ids);
            postMessage({
                action: 'deletePermission',
                dataAfter: deletePermissionRes,
            });
            break;
        case 'getActionPackOfPermission':
            let getActionPackOfPermissionRes = await getActionPackOfPermission(
                data.packId,
            );
            postMessage({
                action: 'getActionPackOfPermission',
                dataAfter: getActionPackOfPermissionRes,
            });
            break;
        case 'updatePermission':
            let updatePermissionRes = await updatePermission(data);
            postMessage({
                action: 'updatePermission',
                dataAfter: updatePermissionRes,
            });
            break;
        case 'createPermission':
            let createPermissionRes = await createPermission(data.dataToSave);
            postMessage({
                action: 'createPermission',
                dataAfter: createPermissionRes,
            });
            break;
        default:
            break;
    }
};

export const deletePermission = async function (ids) {
    ids = ids.join(',');
    let res = await permissionApi.deletePermissionPackBeta(ids);
    if (res.status == 200) {
        return 'success';
    } else {
        return 'error';
    }
};
export const updatePermission = async function (data) {
    let res = await permissionApi.updatePermission(data.id, data.dataToSave);
    if (res.status == 200) {
        return 'success';
    } else {
        return 'error';
    }
};
export const createPermission = async function (data) {
    let res = await permissionApi.createPermission(data);
    if (res.status == 200) {
        return 'success';
    } else {
        return 'error';
    }
};
export const getActionPackOfPermission = async function (id) {
    let res = await permissionApi.getActionPackOfPermission(id);
    if (res.status == 200) {
        return res.data;
    } else {
        return [];
    }
};

import { appManagementApi } from '@/api/AppManagement.js';
import { uiConfigApi } from '@/api/uiConfig';

self.onmessage = async function (event) {
    var workerDataReceive = event.data;
    let action = workerDataReceive.action;
    let data = workerDataReceive.data;
    switch (action) {
        case 'getActiveAppSBS':
            let res = await getActiveAppSBS(data.ids);
            await postMessage({ action: 'getActiveAppSBS', dataAfter: res });
            break;
        case 'getActiveApp':
            let resApp = await getActiveApp();
            await postMessage({ action: 'getActiveApp', dataAfter: resApp });
            break;
        case 'getItemByAccessControl':
            let resItem = await getItemByAccessControl(data.ids);
            await postMessage({
                action: 'getItemByAccessControl',
                dataAfter: resItem,
            });
            break;
        case 'getFavorite':
            let resFavorite = await getFavorite(data.userId);
            await postMessage({
                action: 'getFavorite',
                dataAfter: resFavorite,
            });
            break;
        case 'getAppDetails':
            let dataDetail = await getAppDetails(data.id);
            await postMessage({
                action: 'getAppDetails',
                dataAfter: dataDetail,
            });
            break;
        case 'getItemByType':
            let dataByType = await getItemByType(data);
            await postMessage({
                action: 'getItemByType',
                dataAfter: dataByType,
            });
            break;
        case 'saveExtraConfig':
            await saveExtraConfig(data);
        case 'restoreExtraConfig':
            await restoreExtraConfig(data);
            break;
        default:
            break;
    }
};
export const getActiveAppSBS = async function (ids) {
    let res = await appManagementApi.getActiveAppSBS(ids);
    return res;
};
export const getActiveApp = async function () {
    let res = await appManagementApi.getActiveApp();
    return res;
};
export const getItemByAccessControl = async function (ids) {
    let res = await appManagementApi.getListObjectIdentifier({
        pageSize: 1000,
        ids: ids,
    });
    return res;
};
export const getItemByType = async function (data) {
    let res = await appManagementApi.getListObjectIdentifier({
        pageSize: 1000,
        ids: data.ids,
    });
    let obj = {
        type: data.type,
        res: res,
    };
    return obj;
};
export const saveExtraConfig = async function (data) {
    await uiConfigApi.saveUiConfig(data);
};
export const restoreExtraConfig = async function (data) {
    let res = await uiConfigApi.getUiConfig(data.widgetIdentifier);
    self.postMessage({
        action: 'handleRestoreExtraConfig',
        data: res,
    });
};
export const getFavorite = async function (userId) {
    let res = await appManagementApi.getItemFavorite(userId);
    return res;
};
export const getAppDetails = async function (id) {
    let res = await appManagementApi.getAppDetails(id);
    return res;
};

import { appManagementApi } from '@/api/AppManagement.js';
import { uiConfigApi } from '@/api/uiConfig';
import { accessControlApi } from '@/api/accessControl';
import { registerPromiseWorker } from '@/worker/registerPromiseWorker.js';
import { sortApps } from '@/worker/application/Application.Worker.js'
var handler = {
    async getItemByAccessControl(data) {
        let resItem = await getItemByAccessControl(data.ids);
        return resItem;
    },
    async getAllTypeAction() {
        let dataAction = await getAllTypeAction();
        return dataAction;
    },
    async getApps(data) {
        let dataApps = await getApps(data.ids);
        dataApps.data.sort((a, b) =>
            a.name
                .toLowerCase()
                .localeCompare(b.name.toLowerCase())
        );
        return dataApps;
    },
    async getFavorite(data) {
        let resFavorite = await getFavorite(data.userId, data.operations);
        return resFavorite;
    },
    async getItemByType(data) {
        let dataByType = await getItemByType(data);

        return dataByType;
    },
    async restoreExtraConfig(data) {
        let res = await uiConfigApi.getUiConfig(data.widgetIdentifier);
        return res;
    },
    async saveExtraConfig(data) {
        await saveExtraConfig(data);
    },
    sortDetailApps(data) {
        for (let id in data) {
            sortApps(data[id].childrenAppReduce, true)
        }
        return data
    }
};

export const getApps = async function (ids) {
    let res = await appManagementApi.getApps(ids);
    return res;
};
export const getActiveAppSBS = async function () {
    let res = await appManagementApi.getActiveAppSBS();
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
export const getFavorite = async function (userId, operations) {
    let res = await appManagementApi.getItemFavorite(userId);
    let rsl = {
        status: res.status,
        data: {
            listObject: []
        }
    };
    if (operations['GET_ALL']) {
        rsl.data.listObject = res.data.listObject
    } else
        if (res.status == 200) {
            let data = res.data.listObject;
            for (let obj of data) {
                if (operations[obj.objectType][obj.objectIdentifier]) {
                    if (obj.objectType == 'workflow_definition') {
                        rsl.data.listObject.push(obj)
                    } else if (obj.objectType != 'workflow_definition' && operations[obj.objectType][obj.objectIdentifier].list) {
                        rsl.data.listObject.push(obj)
                    }
                }
            }
        }
    return rsl;
};
export const getAppDetails = async function (id) {
    let res = await appManagementApi.getAppDetails(id);
    return res;
};

export const getAllTypeAction = async function () {
    let res = await accessControlApi.getAllTypeAction();
    return res;
};
registerPromiseWorker(self, handler);

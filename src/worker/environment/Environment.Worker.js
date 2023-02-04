import { environmentManagementApi } from '@/api/EnvironmentManagement';

self.onmessage = async function (event) {
    var workerDataReceive = event.data;
    let action = workerDataReceive.action;
    let data = workerDataReceive.data;
    switch (action) {
        case 'addVersion':
            let addVersionRes = await addVersion(data);
            await postMessage({
                action: 'addVersion',
                dataAfter: addVersionRes,
            });
            break;
        case 'deployVersion':
            let deployVersionRes = await deployVersion(data);
            await postMessage({
                action: 'deployVersion',
                dataAfter: deployVersionRes,
            });
            break;
        case 'updateVersion':
            let updateVersionRes = await updateVersion(data);
            await postMessage({
                action: 'updateVersion',
                dataAfter: updateVersionRes,
            });
            break;
        case 'upgradeVersion':
            let upgradeVersionRes = await upgradeVersion(data);
            await postMessage({
                action: 'upgradeVersion',
                dataAfter: upgradeVersionRes,
            });
            break;
        case 'changeServer':
            let changeServerRes = await changeServer(data);
            await postMessage({
                action: 'changeServer',
                dataAfter: changeServerRes,
            });
            break;
        case 'migrateData':
            let migrateDataRes = await migrateData(data);
            await postMessage({
                action: 'migrateData',
                dataAfter: migrateDataRes,
            });
            break;
        case 'syncData':
            let syncDataRes = await syncData(data);
            await postMessage({ action: 'syncData', dataAfter: syncDataRes });
            break;
        default:
            break;
    }
};
export const addVersion = async function (data) {
    let res = await environmentManagementApi.addVersion(data);
    return res;
};
export const deployVersion = async function (data) {
    let res = await environmentManagementApi.getServerId(data.dataGetServerId);
    let formData = {
        serverId: res.data[0].serverId,
        versionId: data.versionId,
        environmentId: data.environmentId,
    };
    let resDeploy = await environmentManagementApi.deloy(formData);
    return resDeploy;
};
export const upgradeVersion = async function (data) {
    let upgradeVersionRes = await environmentManagementApi.deloy(data.formData);
    return upgradeVersionRes;
};
export const updateVersion = async function (data) {
    let res = await environmentManagementApi.getServerId(data.dataGetServerId);
    let formData = {
        serverId: res.data[0].serverId,
        versionId: data.versionId,
        environmentId: data.environmentId,
    };
    let resUpdateVersion = await environmentManagementApi.updateVersion(
        formData,
    );
    return resUpdateVersion;
};
export const changeServer = async function (data) {
    let res = await environmentManagementApi.changeServer(data);
    return res;
};
export const migrateData = async function (data) {
    let res = await environmentManagementApi.getServerId(data.dataGetServerId);
    data.formData.targetInstanceId = res.data[0].id;
    let migrateDataRes = await environmentManagementApi.migrateData(
        data.formData,
    );
    return migrateDataRes;
};
export const syncData = async function (data) {
    let arrRes = [];
    let res = await environmentManagementApi.getServerId(data.dataGetServerId);
    data.dataSync.targetInstanceId = res.data[0].id;
    for (let i in data.listItemSelected) {
        let ids = [];
        if (data.listItemSelected[i].title == 'document_definition') {
            ids = {
                ids: data.listItemSelected[i].arr,
            };
        } else {
            let arr = [];
            arr.push(data.listItemSelected[i].arr);
            ids = {
                ids: arr,
            };
        }
        data.dataSync.data = {
            [data.listItemSelected[i].title]: ids,
        };
        let resMigrate = await environmentManagementApi.migrateData(
            data.dataSync,
        );
        arrRes.push(resMigrate);
    }
    return arrRes;
};

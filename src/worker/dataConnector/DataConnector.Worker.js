import dataConnectorApi from '@/api/dataConnector';
self.onmessage = async function (event) {
    var workerDataReceive = event.data;
    let action = workerDataReceive.action;
    let data = workerDataReceive.data;
    switch (action) {
        case 'getDetailData':
            let detailData = await getDetailData(data);
            await postMessage({
                action: 'getDetailData',
                dataAfter: detailData,
            });
            break;
        case 'stopApi':
            let stopApiRes = await stopApi(data);
            await postMessage({ action: 'stopApi', dataAfter: stopApiRes });
            break;
        case 'viewApi':
            let viewApiRes = await viewApi(data);
            await postMessage({ action: 'viewApi', dataAfter: viewApiRes });
            break;
        case 'deleteApi':
            let deleteApiRes = await deleteApi(data);
            await postMessage({ action: 'deleteApi', dataAfter: deleteApiRes });
            break;
        case 'runApi':
            let runApiRes = await runApi(data);
            await postMessage({ action: 'runApi', dataAfter: runApiRes });
            break;
        case 'updateApi':
            let updateApiRes = await updateApi(data);
            await postMessage({ action: 'updateApi', dataAfter: updateApiRes });
            break;
        case 'saveApi':
            let saveApiRes = await saveApi(data);
            await postMessage({ action: 'saveApi', dataAfter: saveApiRes });
            break;
        default:
            break;
    }
};
export const getDetailData = async function () {
    let res = await dataConnectorApi.getDetailData();
    return res;
};
export const stopApi = async function (uuid) {
    let res = await dataConnectorApi.stopApi(uuid);
    return res;
};
export const deleteApi = async function (uuid) {
    let res = await dataConnectorApi.deleteApi(uuid);
    return res;
};
export const runApi = async function (data) {
    let res = await dataConnectorApi.runApi(data);
    return res;
};
export const saveApi = async function (data) {
    let res = await dataConnectorApi.saveApi(data);
    return res;
};
export const updateApi = async function (data) {
    let res = await dataConnectorApi.updateApi(data);
    return res;
};
export const viewApi = async function (uuid) {
    let res = await dataConnectorApi.viewApi(uuid);
    return res;
};

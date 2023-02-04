import { adminApi } from '@/api/Admin.js';
export const getDetailWorkflow = async function (id) {
    let obj = {};
    let res = await adminApi.getLatestWD(id);
    if (res.data[0]) {
        obj.processDefination = res.data[0];
        obj.processId = id;
        let model = res.data[0].id.split(':')[0];
        let dataTracking = await adminApi.trackingProcess(res.data[0].id);
        if (dataTracking.status == 200) {
            obj.currentTrackingProcess = dataTracking.data;
        }
        let dataAggreate = await adminApi.aggregateWorkflow(model);
        if (dataAggreate.status == 200) {
            obj.aggregateWorkflow = dataAggreate.data;
        }
    }
    return obj;
};
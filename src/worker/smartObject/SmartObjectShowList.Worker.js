import { registerPromiseWorker } from '@/worker/registerPromiseWorker.js';
import { smartObjectApi } from '@/api/smartObject.js';


var handler = {
    async deleteRows(data) {
        try {
            let arr = [];
            data.rows.forEach(function (e) {
                arr.push(e.id);
            });
            let res = await smartObjectApi.deleteSmartObject(arr);
            return res.status

        } catch (error) {
            console.error(error);
            return false;
        }
    },
    async restore(data) {
        try {
            let res = await smartObjectApi.restore(data.id);
            return res.status

        } catch (error) {
            console.error(error);
            return false;
        }
    }
};
registerPromiseWorker(self, handler);
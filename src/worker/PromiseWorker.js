import { str } from '../plugins/utilModules/str';
class PromiseWorker {
    /**
     * Object chứa các worker đang bị pendding, chưa xử lý xong, có dạng:
     * {
     *      SYMPER_PROMISE_WORKER_CALL_ID: Resolve function ứng với SYMPER_PROMISE_WORKER_CALL_ID
     * }
     */
    penddingPromises = {};
    constructor() {}

    /**
     *
     * @param {Object} worker object worker được khởi tạo
     * @param {String} funcName tên function cần gọi trong file worker
     */
    async runByWorker(worker, funcName, data) {
        this.listenMsgIfNeeded(worker);
        let callId = this.sendToWorker(worker, funcName, data);
        let pr = this.registerPrmomise(callId);
        return pr;
    }

    sendToWorker(worker, funcName, data) {
        let callId = this.getUID();
        worker.postMessage({
            funcName,
            SYMPER_PROMISE_WORKER_CALL_ID: callId,
            data,
        });
        return callId;
    }

    registerPrmomise(callId) {
        let pr = new Promise((resolve, reject) => {
            this.penddingPromises[callId] = resolve;
        });
        return pr;
    }

    getUID() {
        return str.randomString(10) + Date.now();
    }

    listenMsgIfNeeded(worker) {
        if (!worker.SYMPER_PROMISE_WORKER_ID) {
            worker.SYMPER_PROMISE_WORKER_ID = this.getUID();
            let self = this;
            worker.addEventListener('message', function (event) {
                let data = event.data;
                let callId = data.SYMPER_PROMISE_WORKER_CALL_ID;
                if (callId) {
                    if (self.penddingPromises[callId]) {
                        self.penddingPromises[callId](data.data);
                    } else {
                        console.warn(
                            'SYMPER_PROMISE_WORKER_CALL_ID in data not found in penddingPromises',
                            data,
                            self,
                        );
                    }
                } else {
                    console.warn(
                        'Can not find property SYMPER_PROMISE_WORKER_CALL_ID in data',
                        data,
                    );
                }
            });
        }
    }
}

export const registerPromiseWorker = function () {
    var SYMPER_PROMISE_WORKER = new PromiseWorker();
    window.runBySymperPromiseWorker = function (worker, funcName, data) {
        return new Promise(async (resolve, reject) => {
            let rsl = await SYMPER_PROMISE_WORKER.runByWorker(
                worker,
                funcName,
                data,
            );
            resolve(rsl);
        });
    };
};

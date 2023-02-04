export const registerPromiseWorker = function (context, handler) {
    context.onmessage = async function (event) {
        handleRequestByPromiseWorker(context, handler, event);
    };
};

export const handleRequestByPromiseWorker = async function (
    context,
    handler,
    event,
) {
    let func = event.data.funcName;
    let data = event.data.data;
    let callId = event.data.SYMPER_PROMISE_WORKER_CALL_ID;
    if (typeof handler[func] == 'function') {
        let output = handler[func].call(handler, data);
        if (output instanceof Promise) {
            output = await output;
        }
        context.postMessage({
            SYMPER_PROMISE_WORKER_CALL_ID: callId,
            data: output,
        });
    } else {
        console.warn(`Function ${func} not found in context :`, context);
    }
};

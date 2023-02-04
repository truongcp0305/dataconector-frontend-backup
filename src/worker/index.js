import PromiseWorker from 'promise-worker';
import Worker from 'worker-loader!./app.worker';

const promiseWorker = new PromiseWorker(new Worker());

const send = (message) =>
    promiseWorker.postMessage({
        type: 'message',
        message,
    });

promiseWorker.onmessage = ({ data }) => {
    console.log('aaaaa', data);
};
export default {
    send,
};

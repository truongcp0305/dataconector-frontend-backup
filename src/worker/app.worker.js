import registerPromiseWorker from 'promise-worker/register';

registerPromiseWorker((message) => {
    if (message.type === 'message') {
        return `Worker replies: ${JSON.stringify(message)}`;
    }
});

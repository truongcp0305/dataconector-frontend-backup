onmessage = function (event) {
    var workerResult = event.data;
    console.log(workerResult, 'okokokokokokoosubmit');
    postMessage(workerResult);
};

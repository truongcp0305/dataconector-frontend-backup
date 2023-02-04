import Vue from 'vue';

const setProcessDefination = (state, data) => {
    Vue.set(state, 'processDefination', data);
};
const setProcessKey = (state, data) => {
    Vue.set(state, 'processKey', data);
};
const setTimerJobDetail = (state, data) => {
    Vue.set(state, 'timerJobDetail', data);
};
const setCurrentAggregateWorkflow = (state, data) => {
    let sum = parseInt(data.done) + parseInt(data.running);
    if (sum > 0) {
        Vue.set(state, 'sumProcess', sum);
        let donePercent = (parseInt(data.done) / sum) * 100;
        let runningPercent = (parseInt(data.running) / sum) * 100;
        Vue.set(state, 'currentAggregateWorkflow', [
            runningPercent,
            donePercent,
        ]);
    } else {
        Vue.set(state, 'currentAggregateWorkflow', []);
    }
};
const setProcessId = (state, data) => {
    state.processId = data;
};
const setCurrentTrackingProcess = (state, data) => {
    state.currentTrackingProcess = data;
};

export {
    setProcessDefination,
    setProcessKey,
    setCurrentAggregateWorkflow,
    setTimerJobDetail,
    setProcessId,
    setCurrentTrackingProcess,
};

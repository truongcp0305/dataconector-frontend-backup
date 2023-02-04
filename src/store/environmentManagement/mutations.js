import Vue from 'vue';

const setAllEnvironment = (state, data) => {
    Vue.set(state, 'allEnvironment', data);
};
const setServiceInstanceInEnvironment = (state, data) => {
    Vue.set(state.serviceInstanceInEnv, state.currentEnvId, data);
};
const setCurrentEnvId = (state, data) => {
    Vue.set(state, 'currentEnvId', data);
};
const setCurrentServieId = (state, data) => {
    Vue.set(state, 'currentServiceId', data);
};
const setCurrentVersionId = (state, data) => {
    Vue.set(state, 'currentVersionId', data);
};
const setObjectTypeOfService = (state, data) => {
    Vue.set(state.listObjectTypeInService, state.currentServiceType, data);
};
const setCurrentServiceType = (state, data) => {
    Vue.set(state, 'currentServiceType', data);
};
const setSourceInstanceId = (state, data) => {
    Vue.set(state, 'sourceInstanceId', data);
};
const setCurrentService = (state, data) => {
    Vue.set(state, 'currentService', data);
};
const setVersionOfService = (state, data) => {
    Vue.set(state.allVersionOfService, state.currentServiceType, data);
};

export {
    setAllEnvironment,
    setServiceInstanceInEnvironment,
    setCurrentEnvId,
    setCurrentServieId,
    setCurrentVersionId,
    setObjectTypeOfService,
    setCurrentServiceType,
    setSourceInstanceId,
    setCurrentService,
    setVersionOfService,
};

const setDetailFunction = (state, data) => {
    Vue.set(state.detailFunction, state.currentFunctionId, data);
};
const setCurrentFunctionId = (state, data) => {
    Vue.set(state, 'currentFunctionId', data);
};

export { setCurrentFunctionId, setDetailFunction };

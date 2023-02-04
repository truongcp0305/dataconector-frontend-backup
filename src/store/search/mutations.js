const setSearch = (state, newValue) => {
    state.newSearch = newValue;
};
const setSearchAll = (state, newValue) => {
    state.newSearchAll = newValue;
};
const setWordSearch = (state, newValue) => {
    state.wordSearch = newValue;
};
const setType = (state, newValue) => {
    state.type = newValue;
};
const setMenu = (state, newValue) => {
    state.menu = newValue;
};
const setShowGeneral = (state, newValue) => {
    state.showGeneral = newValue;
};
const setCountResult = (state, newValue) => {
    state.countResult = newValue;
};
export {
    setSearch,
    setSearchAll,
    setWordSearch,
    setType,
    setMenu,
    setShowGeneral,
    setCountResult,
};

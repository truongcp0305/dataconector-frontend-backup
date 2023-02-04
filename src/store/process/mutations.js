import Vue from 'vue';

const addNewNode = (state, info) => {
    let instanceKey = info.instanceKey;
    let nodeData = info.data;
    Vue.set(state.editor[instanceKey].allNodes, nodeData.id, nodeData);
};

const initInstance = (state, instanceKey) => {
    if (!state.editor[instanceKey]) {
        Vue.set(state.editor, instanceKey, {
            allNodes: {},
            selectingNode: {},
        });
    }
};

const changeSelectingNode = (state, info) => {
    let instanceKey = info.instanceKey;
    let nodeData = info.data;
    Vue.set(state.editor[instanceKey], 'selectingNode', nodeData);
};

const getInfoTask = (state, info) => {
    Vue.set(state, 'allTaskInfo', info);
};

const setAllDefinition = (state, data) => {
    let info = data.reduce((map, item) => {
        map[item.processKey] = item;
        return map;
    }, {});
    Vue.set(state, 'allDefinitions', info);
};

const setAllWorkflowModel = (state, data) => {
    Vue.set(state, 'allProcessModel', data);
};

const updateSelectingNodeExtraConfig = (state, data) => {
    Vue.set(
        state.editor[data.instanceKey].selectingNode,
        'extraNodeConfig',
        data.extraNodeConfig,
    );
};

export {
    getInfoTask,
    addNewNode,
    changeSelectingNode,
    initInstance,
    setAllDefinition,
    setAllWorkflowModel,
    updateSelectingNodeExtraConfig,
};

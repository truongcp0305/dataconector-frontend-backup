import { getNewCellConfigLayout } from '@/components/dashboard/configPool/cellLayout.js';
import { autoLoadNodeClasses } from '@/components/dataflow/configPool/dataflowConfig.js';
import Vue from 'vue';
import { SYMPER_APP } from './../../main.js';
let mapTypeToNodeClass = autoLoadNodeClasses();

export const setDataflowConfig = function (state, data) {
    Vue.set(state.allDataflow, data.instanceKey, data.data);
};
export const removeAndAddDatasetNameArr = function (state, data) {
    
    let duplicateNameDataset
    if(state.allDataflow[data.instanceKey].allWidget.home.datasetNameByNodeId){
        duplicateNameDataset=state.allDataflow[data.instanceKey].allWidget.home.datasetNameByNodeId
    }else{
        Vue.set(state.allDataflow[data.instanceKey].allWidget.home,'datasetNameByNodeId',{})
        duplicateNameDataset=state.allDataflow[data.instanceKey].allWidget.home.datasetNameByNodeId
    }
    if(data.oldName!=''){
        duplicateNameDataset[data.oldName]=duplicateNameDataset[data.oldName].filter(item => item != data.id)
    }
    if(data.newName!=''){
        if(duplicateNameDataset[data.newName]){
            if(!duplicateNameDataset[data.newName].includes(data.id)){
                duplicateNameDataset[data.newName].push(data.id)
            }
        }else{
            Vue.set(duplicateNameDataset,data.newName,[data.id])
        }
    }
};
export const setSelectingWidget = function (state, data) {
    let nodeData = state.allDataflow[data.instanceKey].allWidget[data.id];
    console.log(nodeData, 'node selected', nodeData.id);
    Vue.set(state.allDataflow[data.instanceKey], 'selectedWidget', nodeData);
};

export const setAllNodeRunning = function (state, data) {
    state.allDataflow[data.instanceKey].allWidget = Object.assign(
        state.allDataflow[data.instanceKey].allWidget,
        data.allNode,
    );
};

export const addNewNodeData = function (state, data) {
    let newNode = new mapTypeToNodeClass[data.type](data.id);
    if(typeof data.customProps == 'object'){
        newNode = Object.assign(newNode, data.customProps)
        if(data.customProps.hasOwnProperty('changeColGeneration')){
            newNode.configs.changeColGeneration = data.customProps.changeColGeneration
        }
    }
    state.allDataflow[data.instanceKey].allWidget[data.id] = newNode;
};

export const removeNodeData = function (state, data) {
    setSelectingWidget(state, {
        id: 'home',
        instanceKey: data.instanceKey,
    });

    setTimeout(() => {
        delete state.allDataflow[data.instanceKey].allWidget[data.id];
    }, 0);
};

export const disconnectLink = function (state, data) {
    let allNodes = state.allDataflow[data.instanceKey].allWidget;
    let sourceNode = allNodes[data.sourceId];
    let targetNode = allNodes[data.targetId];

    if (sourceNode) {
        delete sourceNode.nextNodes[data.targetId];
    }

    if (targetNode) {
        delete targetNode.prevNodes[data.sourceId];
        targetNode.loadInputFromPrevNodes();
    }
};

export const connectLink = function (state, data) {
    let allNodes = state.allDataflow[data.instanceKey].allWidget;
    let sourceNode = allNodes[data.sourceId];
    let targetNode = allNodes[data.targetId];

    sourceNode.nextNodes[data.targetId] = targetNode;
    targetNode.prevNodes[data.sourceId] = sourceNode;
    targetNode.loadInputFromPrevNodes();
};

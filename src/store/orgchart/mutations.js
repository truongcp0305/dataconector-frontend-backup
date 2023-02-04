import { param } from 'jquery';
import vueHtml2canvas from 'vue-html2canvas';
import { SYMPER_HOME_ORGCHART } from '../../components/orgchart/editor/nodeAttrFactory';

function normalizeNodeStyle(node) {
    if (typeof node.content != 'object') {
        try {
            node.content = JSON.parse(node.content);
        } catch (error) {
            node.content = {};
        }
    }
    return node;
}

const setOrgchartData = (state, params) => {
    Vue.set(state.editor, params.instanceKey, params.data);
};

const setNodeConfig = (state, params) => {
    Vue.set(
        state.editor[params.instanceKey].allNode,
        params.nodeId,
        params.data,
    );
};

const setNodeStyle = (state, nodeStyles) => {
    for (let i in nodeStyles) {
        nodeStyles[i] = normalizeNodeStyle(nodeStyles[i]);
    }
    Vue.set(state, 'allNodeStyle', nodeStyles);
};

const changeSelectingNode = (state, params) => {
    let selectingNode = null;
    if (params.nodeId == SYMPER_HOME_ORGCHART) {
        selectingNode = state.editor[params.instanceKey].homeConfig;
    } else {
        selectingNode = state.editor[params.instanceKey].allNode[params.nodeId];
    }
    Vue.set(state.editor[params.instanceKey], 'selectingNode', selectingNode);
    if (selectingNode) {
    } else {
        SYMPER_APP.$snotifyError(
            params,
            'Lỗi dữ liệu',
            'Đối tượng bạn chọn bị lỗi dữ liệu, vui lòng xóa đối tượng này và tạo mới đối tượng khác!',
        );
    }
};

const deleteNodeStyle = (state, idx) => {
    state.allNodeStyle.splice(idx, 1);
};

const addNodeStyle = (state, nodeData) => {
    nodeData = normalizeNodeStyle(nodeData);
    state.allNodeStyle.push(nodeData);
};
const updateInstanceKey = (state, data) => {
    state.instanceKey = data;
};
const updateUserChildNode = (state, data) => {
    if (state.editor[data.currentInstanceKey].allNode[data.id]) {
        state.editor[data.currentInstanceKey].allNode[data.id].users =
            data.users;
    } else {
        let key =
            state.editor[data.currentInstanceKey].selectingNode
                .positionDiagramCells.instanceKey;
        state.editor[key].allNode[data.id].users = data.users;
    }
};
const updateCurrentChildrenNodeId = (state, data) => {
    state.currentChildrenNodeId = data;
};
const updateCurrentFatherNode = (state, data) => {
    state.currentFatherNode = data;
};
const updateUserFatherNode = (state, data) => {
    state.editor[state.currentFatherNode.instanceKey].allNode[
        state.currentFatherNode.id
    ].users = data;
};
const updateFirstChildNodeId = (state, data) => {
    state.firstChildNodeId = data;
};
const deleteNode = (state, params) => {
    state.editor[params.instanceKey].splice(
        state.editor[params.instanceKey].indexOf(
            state.editor[params.instanceKey][params.id],
        ),
        1,
    );
};
const setAllUserInOrgchart = (state, params) => {
    Vue.set(state.allUserInOrgChart, params.orgchartId, params.listUsers);
};
const setDataOrgchartSideBySide = (state, params) => {
    state.orgChartData[params.orgchartId] = params.object;
};
const updateDpmListChildrenNode = (state, params) => {
    params.data.forEach((e) => {
        if (e.vizId == params.vizId && params.list.includes(e) == false) {
            params.list.push(e);
            e.orgchartId = params.orgchartId;
            e.data = params.data;
            e.list = params.list;
            updateDpmListChildrenNode(state, e);
            if (
                typeof state.listChildrenOfNode[params.orgchartId] ==
                'undefined'
            ) {
                state.listChildrenOfNode[params.orgchartId] = [];
            }
            if (
                state.listChildrenOfNode[params.orgchartId].includes(e) == false
            ) {
                state.listChildrenOfNode[params.orgchartId].push(e);
            }
        }
        if (e.vizParentId == params.vizId) {
            params.list.push(e);
            e.orgchartId = params.orgchartId;
            e.data = params.data;
            e.list = params.list;
            updateDpmListChildrenNode(state, e);
            if (
                typeof state.listChildrenOfNode[params.orgchartId] ==
                'undefined'
            ) {
                state.listChildrenOfNode[params.orgchartId] = [];
            }
            if (
                state.listChildrenOfNode[params.orgchartId].includes(e) == false
            ) {
                state.listChildrenOfNode[params.orgchartId].push(e);
            }
        }
    });
};
const updatePosListChildrenNode = (state, params) => {
    params.data.forEach((e) => {
        if (e.vizId == params.vizId && params.list.includes(e) == false) {
            params.list.push(e);
            e.orgchartId = params.orgchartId;
            e.data = params.data;
            e.list = params.list;
            updatePosListChildrenNode(state, e);
            if (
                typeof state.listChildrenOfNode[params.orgchartId] ==
                'undefined'
            ) {
                state.listChildrenOfNode[params.orgchartId] = [];
            }
            if (
                state.listChildrenOfNode[params.orgchartId].includes(e) == false
            ) {
                state.listChildrenOfNode[params.orgchartId].push(e);
            }
        }
    });
};
const getUserByVizId = (state, params) => {
    params.data.forEach((e) => {
        if (e.vizId == params.vizId && params.list.includes(e) == false) {
            params.list.push(e);
            e.orgchartId = params.orgchartId;
            e.data = params.data;
            e.list = params.list;
            getUserByVizId(state, e);
            if (state.listChildInCurrentNode.includes(e) == false) {
                state.listChildInCurrentNode.push(e);
            }
        }
        if (e.vizParentId == params.vizId) {
            params.list.push(e);
            e.orgchartId = params.orgchartId;
            e.data = params.data;
            e.list = params.list;
            getUserByVizId(state, e);
            if (state.listChildInCurrentNode.includes(e) == false) {
                state.listChildInCurrentNode.push(e);
            }
        }
    });
};
const getPosUserByVizId = (state, params) => {
    params.data.forEach((e) => {
        if (e.vizId == params.vizId && params.list.includes(e) == false) {
            params.list.push(e);
            e.orgchartId = params.orgchartId;
            e.data = params.data;
            e.list = params.list;
            getPosUserByVizId(state, e);
            if (state.listChildInCurrentNode.includes(e) == false) {
                state.listChildInCurrentNode.push(e);
            }
        }
    });
};
const emptyListChildrenNode = (state, param) => {
    state.listChildrenOfNode[param] = [];
};
const emptyListChildInCurrentNode = (state) => {
    state.listChildInCurrentNode = [];
};
const updatePermissionsSelectingNode = (state, params) => {
    Vue.set(
        state.editor[params.instanceKey].selectingNode,
        'permissions',
        params.data,
    );
};

const setAllOrgchartStruct = (state, params) => {
    Vue.set(state, 'allOrgchartStruct', params);
};
const changeViewOnlySub = (state, data) => {
    Vue.set(state, 'viewOnlySub', data);
};
const updateListVizParentId = (state, data) => {
    state.listVizParentId.push(data);
};

export {
    setAllOrgchartStruct,
    setOrgchartData,
    setNodeConfig,
    changeSelectingNode,
    setNodeStyle,
    deleteNodeStyle,
    addNodeStyle,
    updateInstanceKey,
    updateUserChildNode,
    updateCurrentChildrenNodeId,
    updateCurrentFatherNode,
    updateUserFatherNode,
    updateFirstChildNodeId,
    deleteNode,
    setAllUserInOrgchart,
    setDataOrgchartSideBySide,
    emptyListChildInCurrentNode,
    emptyListChildrenNode,
    getUserByVizId,
    updatePermissionsSelectingNode,
    changeViewOnlySub,
    updateListVizParentId,
    getPosUserByVizId,
    updatePosListChildrenNode,
    updateDpmListChildrenNode
};

import { dataflowApi } from '@/api/dataflow.js';
import { autoLoadNodeClasses } from '@/components/dataflow/configPool/dataflowConfig.js';
import _cloneDeep from 'lodash/cloneDeep';
let mapTypeToNodeClass = autoLoadNodeClasses();

onmessage = function (event) {
    let data = event.data;
    let action = data.action;
    if (handler[action]) {
        handler[action](data.data);
    } else {
        console.error(` action ${action} not found `);
    }
};

var handler = {
    getGrapData(res) {
        let nodes = res.data.nodes;
        let mapVisualNodes = {};
        for (let nodeId in nodes) {
            mapVisualNodes[nodeId] = nodes[nodeId].jointInfo;
        }
        return {
            nodes: mapVisualNodes,
            links: res.data.links,
        };
    },
    getInitOrderOneField(idNode, mapNodes, nodesOrder) {
        if (nodesOrder[idNode]) {
            delete nodesOrder[idNode];
        }
        nodesOrder[idNode] = true;
        if (
            mapNodes[idNode] &&
            mapNodes[idNode].symperConfigs &&
            mapNodes[idNode].symperConfigs.nextNodes
        ) {
            for (let nextNodeId of mapNodes[idNode].symperConfigs.nextNodes) {
                this.getInitOrderOneField(nextNodeId, mapNodes, nodesOrder);
            }
        }
    },

    /**
     * Lấy thứ tự thực thi của các node, đảm bảo việc: khi đến một node nào thì các input của node đó đã được xử lý đầy đủ
     * @param {Object} mapNodes map id với saved node config khi lấy từ db lên
     */
    getNodeExeOrder(mapNodes) {
        let nodesOrder = {};
        for (let nodeId in mapNodes) {
            this.getInitOrderOneField(nodeId, mapNodes, nodesOrder);
        }
        return Object.keys(nodesOrder);
    },

    makeMapDatasetAndColumn(datasetColumns) {
        let rsl = {};
        let dtsColMap = datasetColumns.columns;

        for (let id in datasetColumns.datasetInfo) {
            rsl[id] = {
                columns: {},
                info: datasetColumns.datasetInfo[id],
                subDatasets: [],
            };
            rsl[id].columns[id] = dtsColMap[id];
        }

        for (let subDts of datasetColumns.subDatasets) {
            let parentId = subDts.id_parent;
            rsl[parentId].columns[subDts.id] = dtsColMap[subDts.id];
            rsl[parentId].subDatasets.push(subDts);
        }
        return rsl;
    },

    restoreRunningNodeData(datasetColumns, nodes, changeColGeneration) {
        let nodesIdOrder = this.getNodeExeOrder(nodes);
        let mapRunNode = {};
        let savedNode = null;
        let type = '';
        let nodeObj = null;
        let mapDatasetAndColumn = this.makeMapDatasetAndColumn(datasetColumns);

        for (let id of nodesIdOrder) {
            savedNode = nodes[id];
            if (!savedNode) {
                continue;
            }
            type = savedNode.jointInfo.type.replace('app.', '');
            nodeObj = new mapTypeToNodeClass[type](id);
            nodeObj.changeColGeneration = changeColGeneration
            nodeObj.configs.changeColGeneration = changeColGeneration
            for (let prevId of savedNode.symperConfigs.prevNodes) {
                if (!nodes[prevId]) {
                    continue;
                }
                if (!mapRunNode[prevId]) {
                    let prevSavedNode = nodes[prevId];
                    let prevSavedNodeType =
                        prevSavedNode.jointInfo.type.replace('app.', '');
                    let prevSavedNodeObj = new mapTypeToNodeClass[
                        prevSavedNodeType
                    ](prevId);
                    mapRunNode[prevId] = prevSavedNodeObj;
                }
                nodeObj.prevNodes[prevId] = mapRunNode[prevId];
            }
            nodeObj.restoreNodeFromSavedConfig(
                savedNode.symperConfigs,
                mapDatasetAndColumn,
            );
            if (typeof nodeObj.setLastConfigCache == 'function') {
                nodeObj.setLastConfigCache();
            }
            if (!mapRunNode[id]) {
                mapRunNode[id] = nodeObj;
            }
        }
        for (let id of nodesIdOrder) {
            savedNode = nodes[id];
            if (!savedNode) {
                continue;
            }
            let nodeObj = mapRunNode[id];
            for (let nextId of savedNode.symperConfigs.nextNodes) {
                nodeObj.nextNodes[nextId] = mapRunNode[nextId];
            }
        }
        return mapRunNode;
    },

    async getDataflowInfo(data) {
        let idDataflow = data.id;
        let res = await dataflowApi.getInfo(idDataflow, data.experimentalMode);
        let graph = this.getGrapData(res);
        let info = res.data;
        let dataflow = info.dataflow;

        graph.homeConfigs = {
            name: dataflow.name,
            variables: dataflow.variables,
            description: dataflow.description ? dataflow.description : '',
        };

        // gửi data lên để hiển thị
        self.postMessage({
            action: 'restoreDataflowDisplay',
            data: {
                graph,
            },
        });

        let changeColGeneration = false
        // gán lại thuộc tính changeColGeneration của từng node theo changeColGeneration của homeconfig
        if(typeof dataflow.extra == "object"){
            changeColGeneration = dataflow.extra.changeColGeneration ? true : false
        }

        // gửi data lên để chạy logic
        let runningNodeData = this.restoreRunningNodeData(
            info.columnsAndSubdatasets,
            res.data.nodes,
            changeColGeneration
        );

        let home = new mapTypeToNodeClass['home']();
        home.name = dataflow.name;
        home.variables = dataflow.variables;
        home.description = dataflow.description;
        typeof dataflow.extra == "object"?home.extra = dataflow.extra:'';
        
        
        runningNodeData['home'] = home;
        self.postMessage({
            action: 'restoreRunningNodeData',
            data: runningNodeData,
        });
    },
    async deleteRows(data) {
        let arr = [];
        data.rows.forEach(async function (e) {
            arr.push(e.id);
        });
        let res = await dataflowApi.deleteDataflow(arr);
        self.postMessage({
            action: 'handleDeleteRows',
            data: res.status,
        });
    },
};

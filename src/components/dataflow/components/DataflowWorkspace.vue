<template>
    <div>
        <dataflow-paper
            :height="height"
            :instanceKey="instanceKey"
            :isAddStencil="isAddStencil"
            ref="dataflowPaper"
            @node-selected="selectNode"
            @node-added="addNewNode"
            @node-removed="removeNode"
            @link-removed="removeLink"
            @link-connected="connectLink"
            @paper-selected="selectPaper"
            :runDataFlowInfo="selectingNode"
            :viewMode="viewMode"
        />
    </div>
</template>

<script>
import DataflowPaper from '@/components/dataflow/components/DataflowPaper.vue';
import { DISPLAY_CONFIGS } from '@/components/dataflow/configPool/nodeDisplayConfig.js';

export default {
    data() {
        return {
            needRerunNodeIds: {},
        };
    },
    computed: {
        selectingNode() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .selectedWidget;
        },
    },
    components: {
        DataflowPaper,
    },
    methods: {
        setRunningDataflow(){
            return this.$refs.dataflowPaper.setRunningDataflow()
        },
        getLinks() {
            return this.$refs.dataflowPaper.getLinks();
        },
        getNodeAttr(id) {
            return this.$refs.dataflowPaper.getNodeAttr(id);
        },
        actionOnCanvas(action) {
            this.$refs.dataflowPaper.actionOnToolbar(action);
        },
        changeCurrentNodeName(newName) {
            this.$refs.dataflowPaper.setNodeName(
                this.selectingNode.id,
                newName,
            );
        },
        selectPaper() {
            this.$store.commit('dataflow/setSelectingWidget', {
                id: 'home',
                instanceKey: this.instanceKey,
            });
        },
        connectLink(data) {
            if (!this.recivePaperEvent) {
                return;
            }
            this.$store.commit('dataflow/connectLink', {
                ...data,
                instanceKey: this.instanceKey,
            });
            setTimeout(
                (self) => {
                    let allNodes =
                        self.$store.state.dataflow.allDataflow[self.instanceKey]
                            .allWidget;
                    let targetNode = allNodes[data.targetId];
                    self.setLinkOrderForNodes([targetNode]);
                    targetNode.impact();
                },
                0,
                this,
            );
        },
        setLinkOrderForNodes(nodes = null) {
            let allNodes =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .allWidget;
            if (nodes == null) {
                nodes = [];
                let node = null;
                for (let id in allNodes) {
                    node = allNodes[id];
                    if (node.stackInput) {
                        nodes.push(node);
                    }
                }
            }
            for (let node of nodes) {
                if (node.stackInput) {
                    let c = 1;
                    for (let sourceId in node.prevNodes) {
                        this.$refs.dataflowPaper.updateLinkNumber(
                            sourceId,
                            node.id,
                            c,
                        );
                        c += 1;
                    }
                }
            }
        },
        removeLink(data) {
            if (!this.recivePaperEvent) {
                return;
            }
            let allNodes =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .allWidget;
            this.$store.commit('dataflow/disconnectLink', {
                ...data,
                instanceKey: this.instanceKey,
            });
            if(allNodes[data.targetId]){
                allNodes[data.targetId].impact();
                
                this.needRerunNodeIds[data.targetId] = true;

                setTimeout(
                    (self) => {
                        let targetNode = allNodes[data.targetId];
                        if (targetNode) {
                            self.setLinkOrderForNodes([targetNode]);
                        }
                    },
                    0,
                    this,
                );
            }
        },
        removeNode(data) {
            if (!this.recivePaperEvent) {
                return;
            }
            this.$store.commit('dataflow/removeNodeData', {
                ...data,
                instanceKey: this.instanceKey,
            });
        },
        addNewNode(data) {
            if (!this.recivePaperEvent) {
                return;
            }
            if (this.status == 'editing') {
                this.$store.commit('dataflow/addNewNodeData', {
                    ...data,
                    instanceKey: this.instanceKey,
                    customProps: this.getNewNodeCustomCommonProps()
                });
            }
        },
        getNewNodeCustomCommonProps(){
            let rsl = {};
            let allNodes = this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .allWidget;
            if(allNodes.home.extra.changeColGeneration){
                rsl.changeColGeneration = true;
            }
            return rsl;
        },
        selectNode(data) {
            this.$store.commit('dataflow/setSelectingWidget', {
                id: data.id,
                instanceKey: this.instanceKey,
            });
            this.$store.state.dataflow.allDataflow[
                this.instanceKey
            ].selectedWidget.afterSelectNode();
        
        },
        center() {
            this.$refs.dataflowPaper.center();
        },
        restoreGraphDisplay(grapData) {
            for (let nodeId in grapData.nodes) {
                this.$refs.dataflowPaper.addNodeToWorkspace(
                    grapData.nodes[nodeId],
                );
            }
            this.$refs.dataflowPaper.addLinks(grapData.links);
            if(this.$route.query.nodeId){
                setTimeout(()=>{
                    this.$refs.dataflowPaper.focusAndHightLightNode(this.$route.query.nodeId)
                },300)
            }
        },
        clearAll() {
            this.$refs.dataflowPaper.clearAll();
        },
        resetNodeStatus() {
            this.$refs.dataflowPaper.resetNodeStatus();
        },
        highlightProgressRunningDataflow(currentNode) {
            this.$refs.dataflowPaper.runDataflow(currentNode);
        },
        handleRunDoneDataflow() {
            this.$refs.dataflowPaper.resetViewToDefault();
        },
        runDataflow(idNode) {
            this.$refs.dataflowPaper.setRunningTargetNode(idNode);
        },
        setNodeErr(nodeId){
            this.$refs.dataflowPaper.setNodeErr(nodeId);
        },
        setNodeSuccess(nodeId){
            this.$refs.dataflowPaper.setNodeSuccess(nodeId);
        }
    },
    props: {
        viewMode:{
            type: Boolean,
            default: false
        },
        isAddStencil:{
            type: Boolean,
            default: true,
        },
        action: {
            default: 'create',
        },
        instanceKey: {
            default: '',
        },
        height: {
            default: 250,
        },
        status: {
            default: 'init',
        },
    },
    mounted() {
        // this.$evtBus.$on(
        //     'dataflow-node-validate-has-err',
        //     (instanceKey, nodeId) => {
        //         if (this.instanceKey == instanceKey) {
        //             this.$refs.dataflowPaper.setNodeErr(nodeId);
        //         }
        //     },
        // );
        // this.$evtBus.$on(
        //     'dataflow-node-validate-has-success',
        //     (instanceKey, nodeId) => {
        //         if (this.instanceKey == instanceKey) {
        //             this.$refs.dataflowPaper.setNodeSuccess(nodeId);
        //         }
        //     },
        // );
    },
    created() {
        this.recivePaperEvent = true;
    },
};
</script>

<style></style>

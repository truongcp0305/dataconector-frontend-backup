<template>
    <div
        class="symper-datafow-editor h-100 w-100 position-relative"
        ref="dataflowEditor"
    >
        <div class="d-inline-block workspace-left-pane" ref="workspaceLeftPane">
            <DataflowToolBar
                ref="toolBar"
                class="border-bottom-1 tool-bar"
                :style="{
                    height: toolbarHeight + 'px',
                    lineHeight: toolbarHeight + 'px'
                }"
                :width="rightSidebarWidth"
                :height="runInfoHeight"
                :action="action"
                :isAddStencil="isAddStencil"
                
                :title="title"
                :idDataflow="idObject"
                :instanceKey="instanceKey"
                :disableButtonRun="homeConfig.isRunningDataflow"
                @action-on-workspace="handleActionOnWorkspace"
                @run-dataflow="runDataflow"
                @go-to-edit-page="handleGoToEditPage"
                @save-dataflow="saveDataflow"
                @stop-run-dataflow="stopRunDataflow"
                :hideRunInfoPanel="hideRunInfoPanel"
            />

            <DataflowWorkspace
                :isAddStencil="isAddStencil"
                :class="{ 'd-none': isRenderDataFlow }"
                :height="workspaceHeight"
                ref="dataflowWorkspace"
                :instanceKey="instanceKey"
                :action="action"
                :status="status"
                :viewMode="viewMode"
            />

            <vue-resizable
                ref="dataflowRunningInfo"
                class="border-top-1 dataflow-running-info bg-white"
                height="200px"
                :class="{ 'd-none': hideRunInfoPanel }"
                :active="['t']"
                :width="widthOutPut"
                @resize:end="handleResizeBottomPane"
                @resize:move="resizeHandle('dataflowRunningInfo')"
            >
                <DataflowRunningInfo
                    ref="runningOutput"
                    :instanceKey="instanceKey"
                    :action="action"
                    @run-success="handleRunDoneSuccess"
                    @run-failed="handleRunDoneFailed"
                    @click-custom-btn="handleClickCustomBtn"
                    :customBtn="customBtn"
                />
            </vue-resizable>
        </div>
        <vue-resizable
            ref="dataflowSidebarConfig"
            class="border-left-1 h-100 bg-white dataflow-sidebar-config"
            :active="action == 'view' ? [] : ['l']"
            width="350px"
            @resize:end="handleResizePane"
            @resize:move="resizeHandle('dataflowSidebarConfig')"
        >
            <DataflowSidebarConfig
                ref="sidebarConfig"
                :sideBarWidth="rightSidebarWidth"
                :idObject="idObject"
                @node-name-changed="handleChangeNodeName"
                :instanceKey="instanceKey"
                :action="action"
            />
        </vue-resizable>
    </div>
</template>

<script>
import DataflowRunningInfo from '@/components/dataflow/components/DataflowRunningInfo.vue';
import DataflowSidebarConfig from '@/components/dataflow/components/DataflowSidebarConfig.vue';
import DataflowToolBar from '@/components/dataflow/components/DataflowToolBar.vue';
import DataflowWorkspace from '@/components/dataflow/components/DataflowWorkspace.vue';
import VueResizable from 'vue-resizable';
import DataflowEditorWorker from 'worker-loader!@/worker/dataflow/DataflowEditor.Worker.js';
import {
    getDefaultDataflowConfig,
    castAllMapObjsToNodes
} from '@/components/dataflow/configPool/dataflowConfig.js';
import { dataflowApi } from '@/api/dataflow.js';
import { util } from '../../plugins/util';
import { appConfigs } from '../../configs';
import AutoSaveConfigWorker from 'worker-loader!@/worker/dataflow/autoSaveConfig.Worker.js';
export default {
    created() {
        let self = this;
        this.dataflowEditorWorker = new DataflowEditorWorker();
        this.listenFromWorker();
        this.getDataflowInfo();
        this.initData();
        this.$evtBus.$on('bi-dataflow-run-export-data', (data) => {
            if (data.instanceKey == self.instanceKey) {
                self.exportDataForCurrentNode();
            }
        });
        this.autoSaveConfigWorker = new AutoSaveConfigWorker();

        this.$evtBus.$on(
            'bi-dataflow-change-auto-save-config',
            async (data) => {
                if (
                    data.instanceKey == self.instanceKey &&
                    !self.homeConfig.autoSaveConfig.restoring
                ) {
                    self.changeAutoSaveConfig();
                }
            }
        );

        this.$evtBus.$on(
            'bi-dataflow-log-dataflow-change-config',
            async (data) => {
                if (data.instanceKey == self.instanceKey) {
                    self.logDataflowChangeConfig(data.data);
                }
            },
        );

        this.$evtBus.$on('bi-dataflow-restore-cached-config', (data) => {
            if (data.instanceKey == self.instanceKey) {
                self.restoreCachedConfig();
            }
        });
    },
    mounted() {
        this.runInfoHeight=$(this.$refs.dataflowRunningInfo.$el).height()
        this.rightSidebarWidth=$(this.$refs.dataflowSidebarConfig.$el).width()
        
        this.calcWorkspaceHeight();
        if (this.action == 'create') {
            this.status = 'editing';
        }
        this.changeAutoSaveConfig();
        window.addEventListener('resize', () => {
            if(this.$refs.dataflowEditor?.isConnected){
                this.calcwidthOutPut()
            }
        });
    },
    methods: {
        resizeHandle(val){
            let self = this;
            if(val=='dataflowRunningInfo'){
                if(this.$refs.dataflowRunningInfo){
                    self.runInfoHeight=$(this.$refs.dataflowRunningInfo.$el).height()
                    self.workspaceHeight =$(self.$el).height() -(self.toolbarHeight +$(self.$refs.dataflowRunningInfo.$el).height());
                }
            }else if(val=='dataflowSidebarConfig'){
                if(self.$refs.dataflowSidebarConfig){
                    self.rightSidebarWidth=$(self.$refs.dataflowSidebarConfig.$el).width()
                }
            }
        },
        setHeightRunningInfo(){
            $(this.$refs.dataflowRunningInfo.$el).height(200)
            setTimeout(() => {
                this.$refs.runningOutput.reCalcHeight();                
            }, 100);
        },
        logDataflowChangeConfig(data) {
            try {
                JSON.stringify(data);
            } catch (error) {
                data = this.$t('v2.dataflow.dataCantPassToWorker');
                this.$snotifyWarning(
                    error,
                    this.$t('v2.dataflow.cantPassChangeConfigLogDataToWorkerToSave'),
                    this.$t('v2.dataflow.pleaseContactDeveloper')
                );
            } finally {
                runBySymperPromiseWorker(
                    this.autoSaveConfigWorker,
                    'logChangeConfig',
                    {
                        dataflowId: this.idObject,
                        data: data,
                        node: {
                            id: this.selectingNode.id,
                            name: this.selectingNode.configs.wgName,
                            type: this.selectingNode.type
                        }
                    }
                );
            }
        },
        handleRunDoneSuccess(data) {
            this.handleRunDone('success', data);
            if(this.isNotiRunDataFlowSuccess){
                this.$snotify({
                    type: 'success',
                    title: this.$t('bi.dataflow.dataflow-run-success')
                });
            }
            this.$refs.dataflowWorkspace.setNodeSuccess([this.selectingNode.id]);
        },
        handleRunDoneFailed() {
            this.handleRunDone('failed');
            this.$snotify({
                type: 'error',
                title: this.$t('bi.dataflow.dataflow-run-failed-title'),
                text: this.$t('bi.dataflow.dataflow-run-failed-content')
            });
            if(this.selectingNode.id){
                this.$refs.dataflowWorkspace.setNodeErr([this.selectingNode.id]);
            }
        },
        handleRunDone(status, data) {
            if(data){
                this.$emit('run-done', {
                    status,
                    data: {
                        outputDatasetName: data.tempTable,
                    },
                });                
            }
            this.homeConfig.isRunningDataflow = false;
        },
        selectNode(id) {
            this.$refs.dataflowWorkspace.selectNode(id);
        },
        async saveDataflow() {
            let self = this;
            try {
                let dataToSave = this.getDataflowConfigs();
                dataToSave.id = this.idObject;
                dataToSave.action = this.action;
                dataToSave.runToNode = false;
                let res = {};
                dataToSave.experimentalMode = this.experimentalMode;
                if (this.action == 'clone' || this.action == 'create') {
                    res = await dataflowApi.createDataflow(dataToSave);
                } else if (this.action == 'edit') {
                    res = await dataflowApi.updateDataflow(
                        this.idObject,
                        dataToSave
                    );
                }
                if (res.status == '200') {
                    this.$snotifySuccess(self.$t('v2.dataflow.savedataflowSuccess'));
                    if (this.action == 'clone' || this.action == 'create') {
                        this.$router.push(`/dataflows/${res.data.id}/edit`);
                    }
                } else {
                    this.$snotifyError(res, self.$t('v2.dataflow.savedataflowFailed'));
                }
            } catch (error) {
            } finally {
                this.$refs.toolBar.restoreSaveBtn();
            }
        },
        getCacheConfigKey() {
            return 'dataflow_config_' + this.idObject;
        },

        changeAutoSaveConfig() {
            if (this.homeConfig.autoSaveConfig.active) {
                let self = this;
                this.autoSaveConfigInterval = setInterval(async () => {
                    if (window.location.href.includes('dataflow')) {
                        self.homeConfig.autoSaveConfig.saving = true;
                        try {
                            let dataToSave = self.getDataflowConfigToCache();
                            await self.saveDataConfigCacheToStorage(
                                self.getCacheConfigKey(),
                                dataToSave
                            );
                        } catch (error) {
                            console.error(error);
                        } finally {
                            self.homeConfig.autoSaveConfig.saving = false;
                        }
                    }
                }, 5000);
            } else {
                if (this.autoSaveConfigInterval) {
                    clearInterval(this.autoSaveConfigInterval);
                }
            }
        },
        async restoreCachedConfig() {
            let self = this;
            let workspace = this.$refs.dataflowWorkspace;
            workspace.recivePaperEvent = false;
            self.homeConfig.autoSaveConfig.restoring = true;
            let key = this.getCacheConfigKey();
            let data = await runBySymperPromiseWorker(
                this.autoSaveConfigWorker,
                'getConfig',
                key
            );
            if (!data) {
                this.$snotifyWarning({}, this.$t('v2.dataflow.noRecordFind'));
                self.homeConfig.autoSaveConfig.restoring = false;
                workspace.recivePaperEvent = true;
                return;
            } else {
                workspace.clearAll();
                setTimeout(() => {
                    workspace.restoreGraphDisplay(data.graphDisplay);
                    self.restoreRunningNodeData(data.nodeConfig);
                    self.homeConfig.autoSaveConfig.restoring = false;
                    workspace.recivePaperEvent = true;
                    setTimeout(this.isDoneRenderDataFlow(),500)
                }, 300);
            }
        },

        async saveDataConfigCacheToStorage(key, data) {
            await runBySymperPromiseWorker(
                this.autoSaveConfigWorker,
                'saveConfig',
                {
                    key,
                    data
                }
            );
        },
        getDataflowConfigToCache() {
            let df = this.$store.state.dataflow.allDataflow[this.instanceKey];
            let nodeConfig = {};
            let links = this.getAllLinkToSave();
            let nodeDisplay = {};
            for (const nodeId in df.allWidget) {
                nodeConfig[nodeId] = Object.assign({}, df.allWidget[nodeId]);
                nodeConfig[nodeId].nextNodes &&
                    (nodeConfig[nodeId].nextNodes = Object.keys(
                        nodeConfig[nodeId].nextNodes
                    ));
                nodeConfig[nodeId].prevNodes &&
                    (nodeConfig[nodeId].prevNodes = Object.keys(
                        nodeConfig[nodeId].prevNodes
                    ));

                if (nodeId != 'home') {
                    nodeDisplay[nodeId] = this.getNodeDisplayAttrs(nodeId);
                }
            }
            return {
                nodeConfig,
                nodeDisplay,
                links
            };
        },
        getNodeDisplayAttrs(id) {
            let nodeAttrs = this.$refs.dataflowWorkspace.getNodeAttr(id);
            return {
                id: id,
                name: nodeAttrs.attrs['.symper-widget-label'].text,
                position: nodeAttrs.position,
                type: nodeAttrs.type
            };
        },
        getAllLinkToSave() {
            let jointLinks = this.$refs.dataflowWorkspace.getLinks();
            let links = [];
            for (let link of jointLinks) {
                links.push({
                    source: link.attributes.source.id,
                    target: link.attributes.target.id
                });
            }
            return links;
        },
        getDataflowConfigs(inputData = {}) {
            let allNodes =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .allWidget;
            let nodes = {};
            let count = 1;
            let currentNode = null;
            for (let id in allNodes) {
                currentNode = allNodes[id];
                if (id == 'home') {
                    allNodes.home.setConfigForRunning(inputData.home);
                    continue;
                }
                let nodeAttrs = this.getNodeDisplayAttrs(id);
                nodes[id] = {
                    jointInfo: {
                        ...nodeAttrs,
                        nodeNum: count
                    },
                    symperConfigs: currentNode.getConfigsToSave(inputData[id])
                };
                count += 1;
            }
            let dataflow = {
                name: allNodes.home.name,
                variables: allNodes.home.getVariables(),
                extra: allNodes.home.extra
            };

            let links = this.getAllLinkToSave();
            let experimentalMode = this.experimentalMode;
            return {
                dataflow: dataflow,
                nodes: nodes,
                links: links,
                experimentalMode: experimentalMode
            };
        },
        checkCanRun() {
            return true;
        },
        async exportDataForCurrentNode() {
            this.$refs.runningOutput.showPreloader();
            let dataflowInfo = this.getDataflowInfoForRunning();
            let idNode = this.selectingNode.id;
            let data = {
                idNode: idNode,
                info: dataflowInfo
            };
            await util.getExcelFile(
                data,
                appConfigs.apiDomain.biService +
                    `dataflow/node/${idNode}/export-data`,
                this.selectingNode.configs.wgName
            );
            this.$refs.runningOutput.hidePreloader();
        },
        getDataflowInfoForRunning(inputData) {
            if (!this.checkCanRun()) {
                return;
            }
            let dataflowInfo = this.getDataflowConfigs(inputData);
            dataflowInfo.dataflow_id = this.idObject;
            return dataflowInfo;
        },
        runDataflow(inputData = {}, needStableData = false) {
            this.$refs.dataflowWorkspace.resetNodeStatus();
            this.$refs.dataflowWorkspace.setRunningDataflow();
            this.homeConfig.isRunningDataflow = true;
            this.$refs.runningOutput.showPreloader();
            let dataflowInfo = this.getDataflowInfoForRunning(inputData);
            dataflowInfo.needStableData = needStableData;
            this.$refs.runningOutput.getRunningData(
                this.selectingNode.id,
                dataflowInfo
            );
            this.$refs.dataflowWorkspace.runDataflow(this.selectingNode.id);
            setTimeout(() => {
                this.checkRunningDataflow(this.selectingNode.id);
            }, 500);
        },
        async stopRunDataflow() {
            let self = this;
            try {
                let res = await dataflowApi.stopRunDataflow(self.session);
                if (res.status == 200) {
                    self.homeConfig.isRunningDataflow = false;
                }
            } catch (err) {
                this.$snotifyError(
                    this.$t('v2.dataflow.errDetectCantNotStopRunDataFlow')
                );
            }
        },
        handleActionOnWorkspace(action) {
            this.$refs.dataflowWorkspace.actionOnCanvas(action);
        },
        handleChangeNodeName(data) {
            if (data.name == 'wgName') {
                this.$refs.dataflowWorkspace.changeCurrentNodeName(data.value);
            }
        },
        initData() {
            let defaultData = getDefaultDataflowConfig();
            let data = {
                ...defaultData,
            };
            if(this.action == 'create'){
                data.allWidget.home.extra.changeColGeneration = true;
            }
            this.$store.commit('dataflow/setDataflowConfig', {
                instanceKey: this.instanceKey,
                data
            });

            this.$store.commit('dataflow/setSelectingWidget', {
                instanceKey: this.instanceKey,
                id: 'home'
            });
        },
        calcWorkspaceHeight() {
            this.workspaceHeight =
                $(this.$el).height() -
                (this.toolbarHeight + this.runInfoHeight);
        },
        handleResizePane(eventName, left, top, width, height) {
            $(this.$refs.workspaceLeftPane).css(
                'width',
                $(this.$refs.dataflowEditor).width() -
                    $(this.$refs.dataflowSidebarConfig.$el).width()
            );
            this.rightSidebarWidth = $(this.$refs.dataflowSidebarConfig.$el).width();
        },
        handleResizeBottomPane(eventName, left, top, width, height) {
            this.workspaceHeight =
                $(this.$el).height() -
                (this.toolbarHeight +
                    $(this.$refs.dataflowRunningInfo.$el).height());
            this.$refs.runningOutput.reCalcHeight();
            this.runInfoHeight = $(
                this.$refs.dataflowRunningInfo.$el
            ).height();
        },
        restoreDataflowDisplay(data) {
            // khôi phục data từ server cho hiển thị dataflow
            let graphData = data.graph;
            this.title = this.customTitle ? this.customTitle : data.graph.homeConfigs.name;
            this.$refs.dataflowWorkspace.restoreGraphDisplay(graphData);
            setTimeout(
                (self) => {
                    self.$refs.dataflowWorkspace.center();
                },
                0,
                this
            );
            setTimeout(this.isDoneRenderDataFlow(),500)
        },
        isDoneRenderDataFlow(){
            this.isRenderDataFlow=this.hideRunInfoPanel
        },
        restoreRunningNodeData(data) {
            // Khôi phục lại data từ server phục vụ cho việc chạy dataflow
            let allNode = castAllMapObjsToNodes(data);
            this.$store.commit('dataflow/setAllNodeRunning', {
                allNode,
                instanceKey: this.instanceKey
            });

            setTimeout(
                (self) => {
                    self.status = 'editing';
                    self.$refs.dataflowWorkspace.setLinkOrderForNodes();
                    self.$refs.dataflowWorkspace.selectPaper();
                    self.$refs.sidebarConfig.setCommonValue();
                    self.$refs.sidebarConfig.createHomeConfigForDatasetName()
                },
                0,
                this
            );
        },
        getDataflowInfo() {
            if (this.idObject) {
                this.dataflowEditorWorker.postMessage({
                    action: 'getDataflowInfo',
                    data: {
                        id: this.idObject,
                        experimentalMode: this.experimentalMode
                    }
                });
            }
        },
        listenFromWorker() {
            let self = this;
            this.dataflowEditorWorker.addEventListener(
                'message',
                function (event) {
                    let data = event.data;
                    let action = data.action;
                    if (self[action]) {
                        self[action](data.data);
                    } else {
                        console.error(` action ${action} not found `);
                    }
                }
            );
        },
        handleGoToEditPage() {
            this.$goToPage(`/dataflows/${this.idObject}/edit`, this.$t('v2.dataflow.edit'));
        },
        checkRunningDataflow(idNodeRunning) {
            let self = this;
            let loopCheckProcess = setInterval(async () => {
                try {
                    if (this.changeRouter) {
                        clearInterval(loopCheckProcess);
                    }
                    // stop run dataflow
                    if (!self.homeConfig.isRunningDataflow) {
                        this.finishRunDataflow(loopCheckProcess);
                    }
                    let res = await dataflowApi.getProcessingRunningDataflow(
                        self.session
                    );
                    if (res.status == 200) {
                        if (res.data.length != 0) {
                            var currentNode = '';
                            for (let node in res.data) {
                                let status = JSON.parse(res.data[node]);
                                if (status.end) {
                                    // lấy ra idNode
                                    let idNode = node.slice(
                                        node.indexOf('_') + 1
                                    );
                                    currentNode = idNode;
                                }
                            }
                            // high light node cũ
                            self.$refs.dataflowWorkspace.highlightProgressRunningDataflow(
                                currentNode
                            );
                            if (
                                res.data[self.idObject + '_' + idNodeRunning] &&
                                res.data['done']
                            ) {
                                let statusNodeEnd = JSON.parse(
                                    res.data[
                                        self.idObject + '_' + idNodeRunning
                                    ]
                                );
                                if (statusNodeEnd.end) {
                                    if (!self.homeConfig.isRunningDataflow) {
                                        setTimeout(() => {
                                            self.finishRunDataflow(
                                                loopCheckProcess
                                            );
                                        },200)
                                    }
                                }
                            }
                        } else {
                                self.finishRunDataflow(loopCheckProcess);
                        }
                    } else {
                            self.finishRunDataflow(loopCheckProcess);
                    }
                } catch (err) {
                    self.finishRunDataflow(loopCheckProcess);
                    
                }
            }, 200);
        },
        finishRunDataflow(loopCheckProcess) {
            clearInterval(loopCheckProcess);
            this.homeConfig.isRunningDataflow = false;
                setTimeout(() => {this.$refs.dataflowWorkspace.handleRunDoneDataflow()},500)
            
        },
        handleClickCustomBtn() {
            {
                this.$emit('click-custom-btn');
            }
        },
        calcwidthOutPut() {
             this.widthOutPut=$(this.$refs.dataflowEditor).width() - this.rightSidebarWidth ;
        },
    },
    data() {
        return {
            isRenderDataFlow: false,
            runInfoHeight:250,
            rightSidebarWidth: 350,
            title: '',
            toolbarHeight: 35,
            workspaceHeight: 250,
            contentWidth: 'calc(100% - 350px)',
            instanceKey: Date.now(),
            status: 'init', // trạng thái cả editor, nhận một trong các giá trị: init, editing, saving
            changeRouter: false,
            widthOutPut:'100%'
        };
    },
    computed: {
        selectingNode() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .selectedWidget;
        },
        
        homeConfig() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .allWidget.home;
        }
    },
    components: {
        DataflowToolBar,
        DataflowWorkspace,
        DataflowSidebarConfig,
        DataflowRunningInfo,
        'vue-resizable': VueResizable
    },
    props: {
        viewMode:{
            type: Boolean,
            default: false
        },
        isAddStencil: {
            type: Boolean,
            default: true,
        },
        action: {
            type: String,
            default: 'create'
        },
        idObject: {
            default: 0
        },
        experimentalMode: {
            default: ''
        },
        hideRunInfoPanel: {
            default: false
        },
        customBtn: {
            type: Object,
            default() {
                return {};
            }
        },
        isNotiRunDataFlowSuccess: {
            default: true
        },
        customTitle: {
            default: ''
        }
    },
    watch: {
        hideRunInfoPanel(){
            this.isDoneRenderDataFlow()
        },
        $route(to, from) {
            this.changeRouter = true;
        },
        rightSidebarWidth(){
            this.calcwidthOutPut()
        }
    }
};
</script>

<style>
.workspace-left-pane {
    width: calc(100% - 350px);
    height: 100%;
}

.dataflow-sidebar-config {
    left: unset !important;
    position: absolute !important;
    right: 0px;
    top: 0px !important;
    max-width: 600px !important;
}

.dataflow-running-info {
    min-height: 10%;
    max-height: 80%;
    position: absolute !important;
    bottom: 0 !important;
    top: unset !important;
    z-index: 2;
}
</style>

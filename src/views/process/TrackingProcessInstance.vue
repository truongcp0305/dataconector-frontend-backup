<template>
    <div
        class="w-100 tracking-process-instance"
        :id="'tracking-process-instance' + instanceKey"
        :style="{}"
    >
        <Preloader
            :style="{
                width: '100% !important',
                height: callByDialog ? '570px !important' : '100% !important',
                'max-width': callByDialog ? '1000px' : ''
            }"
            v-show="onLoading"
        ></Preloader>
        <div
            v-if="!callByDialog"
            class="action-diagram-bpmn read-only-modeler"
            style="text-align: right; padding: 10px"
        >
            <span class="fs-13 pl-1" style="float: left">{{
                definitionName
            }}</span>
            <v-icon class="action-btn" @click="handleZoomOut"
                >mdi-plus-circle-outline</v-icon
            >
            <v-icon class="action-btn" @click="handleZoomIn"
                >mdi-minus-circle-outline</v-icon
            >
            <v-icon class="action-btn" @click="handleFocus"
                >mdi-image-filter-center-focus</v-icon
            >
            <v-icon
                v-if="stask.statusPopupTracking == false"
                class="action-btn"
                @click="handleShowPopup"
                >mdi-fullscreen</v-icon
            >
            <v-icon v-else class="action-btn" @click="handleClosePopup"
                >mdi-close</v-icon
            >
        </div>
        <div v-else>
            <div
                style="
                    text-align: right;
                    margin-top: 3px;
                    height: 42px;
                    border-bottom: 0.2px solid #777777;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                "
            >
                <span
                    class="fs-13 pl-1"
                    style="
                        float: left;
                        font-size: 15px !important;
                        font-weight: 500;
                    "
                    >{{ processDefinitionName }}</span
                >

                <v-icon class="action-btn" @click="handleClosePopup"
                    >mdi-close</v-icon
                >
            </div>
        </div>
        <symper-bpmn
            class="symper-bpmn"
            style="height: 95% !important"
            @node-clicked="handleNodeSelected"
            ref="symperBpmn"
            @handle-call-activity-selected="handleCallActivitySelected"
            :instanceKey="instanceKey"
            :readOnly="true"
            :diagramXML="diagramXML"
            :customModules="customRender"
            @after-render-diagram-from-xml="eventAfterRender"
        ></symper-bpmn>
        <div
            style="display: flex; flex-direction: row-reverse"
            v-if="callByDialog"
        >
            <div
                style="
                    margin-right: 20px;
                    width: 126px;
                    height: 32px;
                    border-radius: 22px;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-content: center;
                    justify-content: space-around;
                "
            >
                <v-icon class="action-btn-bottom" @click="handleZoomOut"
                    >mdi-plus-circle-outline</v-icon
                >
                <v-icon class="action-btn-bottom" @click="handleZoomIn"
                    >mdi-minus-circle-outline</v-icon
                >
                <v-icon class="action-btn-bottom" @click="handleFocus"
                    >mdi-image-filter-center-focus</v-icon
                >
            </div>
        </div>
        <symper-drag-panel
            @before-close="closeDetailPanel()"
            :showPanel="nodeDetailPanel.show"
            :actionTitle="nodeDetailPanel.title"
            :panelData="nodeDetailPanel.data"
            :titleIcon="nodeDetailPanel.titleIcon"
            :topPosition="nodeDetailPanel.position.top"
            :leftPosition="nodeDetailPanel.position.left"
            :dragPanelWidth="300"
            :dragPanelHeight="400"
        >
        </symper-drag-panel>
        <v-dialog
            style="z-index: 10000"
            v-if="showDialog"
            v-model="showDialog"
            persistent
            max-width="1000"
            :showModal="true"
            content-class="dialog-call-activity-modeler"
        >
            <div class="w-100" style="height: 570px !important">
                <TrackingProcessInstance
                    :definitionId="dialogDefinitionId"
                    style="height: 88.3% !important"
                    ref="trackingProcessInstanceDialog"
                    :callByDialog="true"
                    @close-dialog="showDialog = false"
                    :instanceId="callActivitySelected.calledProcessInstanceId"
                />
            </div>
        </v-dialog>
    </div>
</template>

<script>
import Preloader from '@/components/common/Preloader';
import SymperBpmn from '@/components/common/SymperBpmn.vue';
import { defaultXML } from '@/components/process/reformatGetListData';
import bpmneApi from '@/api/BPMNEngine';
import CustomRenderInstance from '@/components/process/CustomRenderInstance';
import customContextPadProvider from '../../components/process/customContextPadForReadOnlyModeler';
import SymperDragPanel from '@/components/common/SymperDragPanel.vue';
import { appConfigs } from '@/configs';
import { orgchartApi } from '@/api/orgchart';
const nodeStatusColors = {
    failed: {
        fill: '#e24747',
        stroke: '#fff7f7'
    },
    todo: {
        fill: '#ffffff',
        stroke: '#0760D9'
    },
    done: {
        fill: '#edffee',
        stroke: '#4CAF50'
    },
    notStart: {
        fill: '#f3f3f3',
        stroke: '#797979'
    }
};

export default {
    name: 'TrackingProcessInstance',
    props: {
        definitionId: {
            default: ''
        },
        callByDialog: {
            type: Boolean,
            default: false
        },
        instanceId: {
            type: String,
            default: ''
        },
        elementId: {
            type: String,
            default: ''
        },
        definitionName: {
            type: String,
            default: ''
        },
        needFocus: {
            type: Boolean,
            default: true
        }
    },
    watch: {
        instanceId() {
            this.setInstanceXML();
            // this.getInstanceRuntimeData();
        },
        elementId() {
            this.setInstanceXML();
            this.eventAfterRender();
        }
    },
    created() {
        let self = this;
        this.$evtBus.$on(
            'show-call-activity-process-instace',
            (instanceKey) => {
                if (instanceKey == this.instanceKey) {
                    self.showDialog = true;
                    $('.modal-diagram').attr('style', 'display:none');
                }
            }
        );
        this.setInstanceXML();
    },
    data() {
        return {
            onLoading: true,
            instanceKey: Date.now(),
            callActivitySelected: {},
            dialogDefinitionId: '',
            processDefinitionName: '',
            diagramXML: defaultXML,
            runtimeNodeMap: null, // Thông tin chạy của các node trong process instance. có dạng: {idNode : {thông tin}}
            customRender: [
                {
                    __init__: ['customRenderer', 'customContextPad'],
                    customRenderer: ['type', CustomRenderInstance],
                    customContextPad: ['type', customContextPadProvider]
                },
                {
                    dragging: [
                        'value',
                        {
                            init: function () {}
                        }
                    ]
                }
            ],
            nodeDetailPanel: {
                title: '',
                show: false,
                position: {
                    left: 0,
                    top: 0
                },
                data: {}
            },
            processDefinitionId: '',
            elementMapsRunTime: [],
            showDialog: false,

            flowElementMap: [] //thông tin model của process instance có dạng: {idNode : {thông tin}}
        };
    },
    components: {
        Preloader,
        'symper-bpmn': SymperBpmn,
        'symper-drag-panel': SymperDragPanel
    },
    computed: {
        stask() {
            return this.$store.state.task;
        }
    },
    methods: {
        handleDialogZoomOut() {
            this.$refs.trackingProcessInstanceDialog.handleZoomOut();
        },
        handleDialogZoomIn() {
            this.$refs.trackingProcessInstanceDialog.handleZoomIn();
        },
        handleDialogFocus() {
            this.$refs.trackingProcessInstanceDialog.handleFocus();
        },
        handleCallActivitySelected(node, evt) {
            let callActivitySelected = this.elementMapsRunTime.find((nod) => {
                if (nod.activityId == node.id) {
                    return true;
                }
                return false;
            });
            if (callActivitySelected) {
                this.dialogDefinitionId = '';
                this.callActivitySelected = callActivitySelected;
            } else {
                this.dialogDefinitionId = node.calledElement;
                this.callActivitySelected = {};
            }
        },
        eventAfterRender() {
            if (this.needFocus) {
                setTimeout(
                    (self) => {
                        self.$refs.symperBpmn.focus();
                    },
                    200,
                    this
                );
            }
        },
        handleClosePopup() {
            if (
                $('.tracking-process-instance').length >
                $('.popup-model-diagram').length
            ) {
                this.$emit('close-dialog');
                setTimeout(() => {
                    if (
                        $('.tracking-process-instance').length ==
                        $('.popup-model-diagram').length
                    ) {
                        $('.modal-diagram').attr('style', 'display:block');
                    }
                });
            } else {
                this.$store.commit('task/setStatusPopupTracking', false);
            }
        },
        handleShowPopup() {
            this.$emit('showPopupDiagram');
        },
        handleFocus() {
            this.$refs.symperBpmn.focus();
        },
        handleZoomIn() {
            this.$refs.symperBpmn.zoomIn();
        },
        handleZoomOut() {
            this.$refs.symperBpmn.zoomOut();
        },
        closeDetailPanel() {
            this.nodeDetailPanel.show = false;
        },
        //lấy model của processDefinition
        async getDefinitionModel() {
            let self = this;
            if (this.processDefinitionId) {
                bpmneApi
                    .getDefinitionModel(this.processDefinitionId)
                    .then((res) => {
                        let data = res.mainProcess.flowElementMap;
                        for (const key in data) {
                            if (
                                data[key].assignee &&
                                !self.runtimeNodeMap[key]
                            ) {
                                self.flowElementMap.push(data[key]);
                            }
                        }
                        self.getVariableProcessInstance(self.instanceId);
                        console.log('aaaax', res);
                    })
                    .catch((err) => {
                        self.$snotifyError(
                            err,
                            this.$t('v2.workflow.cantGetModelProcessDefinition')
                        );
                    });
            }
        },
        async getVariableProcessInstance(instanceId) {
            let self = this;
            let filter = {};
            filter.includeProcessVariables = true;
            filter.processInstanceId = instanceId;
            bpmneApi
                .getProcessInstanceHistory(filter)
                .then((res) => {
                    if (res.data.length) {
                        self.updateDrawDataInDiagram(res.data[0].variables);
                    }
                })
                .catch((err) => {
                    self.$snotifyError(
                        err,
                        this.$t('v2.workflow.cantGetVariableProcess')
                    );
                });
        },
        async updateDrawDataInDiagram(variables) {
            let self = this;
            let symBpmn = this.$refs.symperBpmn;
            let mapUser = this.$store.getters['app/mapIdToUser'];
            for (let index = 0; index < this.flowElementMap.length; index++) {
                if (!isFinite(this.flowElementMap[index].assignee)) {
                    // kiểm tra assginee có phải dạng number
                    let dataInput = {};
                    for (let i = 0; i < variables.length; i++) {
                        dataInput[variables[i].name] = variables[i].value;
                    }
                    let data = {};
                    data.dataInput = JSON.stringify(dataInput);
                    data.data = this.flowElementMap[index].assignee;
                    data.type = 'multiple';
                    let res =
                        await orgchartApi.getUserIdentifiFromProcessModeler(
                            data
                        );
                    self.flowElementMap[index].assignee = res;
                }

                let infoAssignee = {};
                let roleInfo = {};
                infoAssignee.assignee = {};
                infoAssignee.role = {};
                let task = self.flowElementMap[index];
                let assigneeId = task.assignee;
                if (task.assignee.indexOf(':') > 0) {
                    //check assinee là userId hay userId:role
                    let arrDataAssignee = task.assignee.split(':');
                    assigneeId = arrDataAssignee[0];
                    if (arrDataAssignee.length > 3) {
                        // loại trừ trường hợp role=0
                        let roleIdentify = task.assignee.slice(
                            assigneeId.length + 1
                        );
                        roleInfo = self.getRoleUser(roleIdentify);
                    }
                }
                if (mapUser[assigneeId]) {
                    infoAssignee.assignee = mapUser[assigneeId];
                    infoAssignee.role = roleInfo;
                }

                if (self.flowElementMap[index].id) {
                    setTimeout(
                        (self) => {
                            symBpmn.updateElementProperties(
                                self.flowElementMap[index].id,
                                {
                                    infoAssignee: infoAssignee,
                                    setColor: nodeStatusColors.notStart
                                }
                            );
                        },
                        200,
                        this
                    );
                }
            }
        },
        // Lấy ra thông tin chạy của các node của instance
        async getInstanceRuntimeData() {
            let self = this;
            let idInstance = this.$route.params.idInstance
                ? this.$route.params.idInstance
                : this.instanceId;
            if (this.instanceId && this.callByDialog) {
                idInstance = this.instanceId;
            }
            try {
                let res = await bpmneApi.getProcessInstanceRuntimeHistory(
                    idInstance
                );
                if (res.data) {
                    self.elementMapsRunTime = res.data;
                    console.log('elementMap', res.data);
                    self.setElementMap(res.data);
                    self.setColorForNodes().then(() => {
                        self.setTasksStatus();
                    });
                    self.$emit('dataInstanceRuntime', res.data);
                }
            } catch (error) {
                self.$snotifyError(
                    error,
                    this.$t('v2.workflow.cantGetNodesRuntimeDataOfInstance')
                );
            }
        },
        setElementMap(els) {
            let map = {};
            let nodeStatus = '';
            for (let item of els) {
                if (item.endTime) {
                    nodeStatus = 'done';
                } else {
                    nodeStatus = 'todo';
                } // chưa có overdue, server cần trả về thêm thông tin của deadline
                if (!map[item.activityId]) {
                    map[item.activityId] = {
                        activityId: item.activityId,
                        activityName: item.activityName,
                        activityType: item.activityType,
                        nodeStatus: nodeStatus,
                        isMultiInstance: false,
                        instancesMap: {}, // map các id instance của task với thông tin của task đó
                        instancesStatusCount: {
                            done: 0,
                            todo: 0,
                            overdue: 0
                        }
                    };
                }
                map[item.activityId].instancesStatusCount[nodeStatus] += 1;
                map[item.activityId].instancesMap[item.id] = item;
            }
            this.runtimeNodeMap = map;
        },
        getRoleUser(roleIdentify) {
            let arrDataRole = roleIdentify.split(':');
            let allSymperRole = this.$store.state.app.allSymperRoles;
            if (Object.keys(allSymperRole).length > 0) {
                if (allSymperRole[arrDataRole[0]]) {
                    let role = allSymperRole[arrDataRole[0]].find(
                        (element) => element.roleIdentify === roleIdentify
                    );
                    return role;
                }
            }
            return {};
        },
        // set các ô màu cho task
        setTasksStatus() {
            console.log('dattaaa', this.runtimeNodeMap);
            for (let eleId in this.runtimeNodeMap) {
                let nodeInfo = this.runtimeNodeMap[eleId];
                if (nodeInfo.activityType) {
                    if (
                        nodeInfo.activityType.includes('Task') ||
                        nodeInfo.activityType.includes('callActivity')
                    ) {
                        let symBpmn = this.$refs.symperBpmn;
                        let currentNode = false;
                        if (nodeInfo.currentNode) {
                            currentNode = true;
                        }
                        let mapUser = this.$store.getters['app/mapIdToUser'];
                        let infoAssignee = {};
                        let roleInfo = {};
                        infoAssignee.assignee = {};
                        infoAssignee.role = {};
                        let taskInfo = nodeInfo.instancesMap;
                        Object.keys(taskInfo).forEach((item) => {
                            let task = taskInfo[item];
                            let assigneeId = task.assignee;
                            if (task.assignee) {
                                if (task.assignee.indexOf(':') > 0) {
                                    //check assinee là userId hay userId:role
                                    let arrDataAssignee =
                                        task.assignee.split(':');
                                    assigneeId = arrDataAssignee[0];
                                    if (arrDataAssignee.length > 3) {
                                        // loại trừ trường hợp role=0
                                        let roleIdentify = task.assignee.slice(
                                            assigneeId.length + 1
                                        );
                                        roleInfo =
                                            this.getRoleUser(roleIdentify);
                                    }
                                }
                                if (mapUser[assigneeId]) {
                                    infoAssignee.assignee = mapUser[assigneeId];
                                    infoAssignee.role = roleInfo;
                                }
                            }
                        });
                        symBpmn.updateElementProperties(eleId, {
                            statusCount: nodeInfo.instancesStatusCount,
                            currentNode: currentNode,
                            infoAssignee: infoAssignee
                        });
                    }
                }
            }
            this.onLoading = false;
        },
        // Đặt màu cho các node trong diagram
        setColorForNodes() {
            let self = this;
            return new Promise((resolve, reject) => {
                if (
                    self.diagramXML !== defaultXML &&
                    self.runtimeNodeMap !== null
                ) {
                    setTimeout(() => {
                        let symBpmn = self.$refs.symperBpmn;
                        let allNode = symBpmn.getAllNodes();
                        let nodeStatus = '';
                        if (self.elementId) {
                            if (self.runtimeNodeMap[self.elementId]) {
                                self.runtimeNodeMap[
                                    self.elementId
                                ].currentNode = true;
                            }
                        }
                        for (let node of allNode) {
                            if (node.$type != 'bpmn:Process') {
                                if (self.runtimeNodeMap[node.id]) {
                                    nodeStatus =
                                        self.runtimeNodeMap[node.id].nodeStatus;
                                } else {
                                    nodeStatus = 'notStart';
                                }
                                symBpmn.changeElementColor(
                                    node.id,
                                    nodeStatusColors[nodeStatus]
                                );
                            }
                            symBpmn.updateElementProperties(node.id, {
                                nodeStatus: self.runtimeNodeMap[node.id]
                                    ? self.runtimeNodeMap[node.id].nodeStatus
                                    : 'notStart'
                            });
                        }
                        resolve();
                    }, 500);
                }
            });
        },
        // Lấy xml của process instance này
        async setInstanceXML() {
            let self = this;
            if (this.definitionId == '') {
                this.getInstanceData()
                    .then((res) => {
                        self.processDefinitionId =
                            res.data[0].processDefinitionId;
                        self.processDefinitionName =
                            res.data[0].processDefinitionName;
                        return self.getDefinitionData(
                            res.data[0].processDefinitionId
                        );
                    })
                    .then((res) => {
                        let resourceDataUrl =
                            appConfigs.apiDomain.bpmne.general +
                            'symper-rest/service/repository/deployments/' +
                            res.deploymentId +
                            '/resourcedata/process_draft.bpmn';
                        return self.getDefinitionXML(resourceDataUrl);
                    })
                    .then(async (res) => {
                        self.diagramXML = res;
                        await self.getInstanceRuntimeData();
                        self.setColorForNodes().then(() => {
                            self.setTasksStatus();
                        });
                        self.getDefinitionModel();
                    })
                    .catch((errInfo) => {
                        let err = errInfo.err;
                        if (!err) {
                            err = errInfo;
                        }
                        self.$snotifyError(err, errInfo.msg);
                    });
            } else {
                let res = await bpmneApi.getProcessByProcessKey(
                    this.definitionId
                );
                if (res.status == 200) {
                    this.diagramXML = res.data.content;
                    this.processDefinitionName = res.data.name;
                    self.onLoading = false;
                }
            }
        },

        // Lấy data của instance
        getInstanceData() {
            let instanceId = this.instanceId
                ? this.instanceId
                : this.$route.params.idInstance;
            let self = this;
            return new Promise((resolve, reject) => {
                bpmneApi
                    .getProcessInstanceData(instanceId)
                    .then((res) => {
                        resolve(res);
                    })
                    .catch((err) => {
                        reject({
                            err,
                            msg: this.$t(
                                'v2.workflow.cantGetProcessInstanceData'
                            )
                        });
                    });
            });
        },
        // Lấy data của process definition
        getDefinitionData(idDifinition) {
            let self = this;
            return new Promise((resolve, reject) => {
                bpmneApi
                    .getDefinitionData(idDifinition)
                    .then((res) => {
                        resolve(res);
                    })
                    .catch((err) => {
                        reject({
                            err,
                            msg: this.$t(
                                'v2.workflow.cantGetProcessDefinitionData'
                            )
                        });
                    });
            });
        },
        // Lấy xml của process definition
        getDefinitionXML(url) {
            let self = this;
            return new Promise((resolve, reject) => {
                bpmneApi
                    .getDefinitionXML(url)
                    .then((xml) => {
                        resolve(xml);
                    })
                    .catch((err) => {
                        reject({
                            err,
                            msg: this.$t(
                                'v2.workflow.cantGetProcessDefinitionXML'
                            )
                        });
                    });
            });
        },
        handleNodeSelected(bizNode, evt) {
            console.log(bizNode, evt);
            this.nodeDetailPanel.position.left = evt.originalEvent.clientX + 10;
            this.nodeDetailPanel.position.top = evt.originalEvent.clientY + 10;
            this.nodeDetailPanel.title = bizNode.name;
            this.nodeDetailPanel.titleIcon = 'mdi-account';
            this.nodeDetailPanel.show = true;
            this.$emit('node-clicked', bizNode, evt);
        }
    }
};
</script>

<style scoped>
.action-diagram-bpmn {
    width: 100%;
    margin-right: 10px;
}
.action-btn {
    cursor: pointer;
    font-size: 20px;
    margin-right: 5px;
}
</style>
<style>
.dialog-call-activity-modeler {
    z-index: 100000000 !important ;
    background-color: #ffffff !important;
}
.action-btn-bottom {
    color: #ffffff !important;
    font-size: 17px !important;
}
</style>

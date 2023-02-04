<template>
    <div class="modal-diagram" style="max-width: 1000px">
        <div
            v-if="stask.statusPopupTracking"
            class="wraper-tracking pa-0"
            style="max-width: 1000px !important"
        >
            <div
                class="tracking-process"
                style="height: 100%"
                v-if="showType == 'work'"
            >
                <v-row
                    class="ma-0 pl-2 pt-2 fs-13"
                    style="height: 5%; border-bottom: 1px solid #cecece"
                >
                    {{ definitionName }}
                </v-row>
                <v-row class="w-100 ma-0" style="height: 95%">
                    <v-col
                        cols="4"
                        class="h-100 pa-0"
                        style="border-right: 1px solid #cecece"
                    >
                        <timeLineAuditTrail
                            class="timeLineAuditTrail pl-2 pt-2"
                            :treeData="listInstanceRuntime"
                        />
                    </v-col>
                    <v-col cols="8" class="h-100 pa-0 ma-0">
                        <v-row class="ma-0" style="height: 60%">
                            <trackingProcessInstance
                                class="popup-model-diagram"
                                v-if="workInfo.id"
                                @node-clicked="handlerNodeCLicked"
                                :instanceId="workInfo.id"
                                @dataInstanceRuntime="dataInstanceRuntime"
                            >
                            </trackingProcessInstance>
                        </v-row>
                        <v-row
                            class="ma-0"
                            style="height: 40%; border-top: 1px solid #cecece"
                        >
                            <detailItemAuditTrail
                                :infoItem="itemAuditTrail"
                                :listInstanceRuntime="listInstanceRuntime"
                            />
                        </v-row>
                    </v-col>
                </v-row>
            </div>
            <div
                class="tracking-process"
                style="height: 100%"
                v-else-if="showType == ''"
            >
                <trackingProcessInstance
                    :callByDialog="true"
                    style="height: 88.3% !important"
                    class="popup-model-diagram"
                    v-if="taskInfo.action.parameter.processInstanceId"
                    :instanceId="taskInfo.action.parameter.processInstanceId"
                    :elementId="taskInfo.action.parameter.activityId"
                    @node-clicked="handlerNodeCLicked"
                    :definitionName="definitionName"
                >
                </trackingProcessInstance>
            </div>
        </div>
        <TrackingProcessDefinition
            :processDefinitionId="processDefinitionId"
            :showDialog="showDialog"
            @cancel="showDialog = false"
        />
    </div>
</template>

<script>
import trackingProcessInstance from '@/views/process/TrackingProcessInstance.vue';
import TrackingProcessDefinition from '@/views/process/TrackingProcessDefinition.vue';
import bpmneApi from '@/api/BPMNEngine';
import timeLineAuditTrail from '@/components/common/TimelineTreeview/index.vue';
import detailItemAuditTrail from './DetailItemAuditTrail.vue';
import { taskApi } from '@/api/task.js';

export default {
    components: {
        trackingProcessInstance,
        timeLineAuditTrail,
        detailItemAuditTrail,
        TrackingProcessDefinition
    },
    watch: {
        'stask.statusPopupTracking': function (newVl) {
            if (newVl) {
                $('.modal-diagram').attr('style', 'display:block');
            } else {
                $('.modal-diagram').attr('style', 'display:none');
            }
        }
    },
    data() {
        return {
            listInstanceRuntime: {},
            itemAuditTrail: {},
            processDefinitionId: '',
            icon: {
                processName: 'mdi-progress-check	',
                startEvent: 'mdi-play-outline',
                submitTask: 'mdi-file-document-edit-outline',
                approvalTask: 'mdi-check',
                updateTask: 'mdi-file-document-edit-outline',
                callActivity: 'mdi-cog-outline',
                endEvent: 'mdi-record',
                httpServiceTask: 'mdi-email-send-outline'
            },
            showDialog: false,
            filterVariables: {
                names: '',
                page: 1,
                processInstanceIds: []
            }
        };
    },
    props: {
        taskInfo: {
            type: Object,
            default: () => {}
        },
        workInfo: {
            type: Object,
            default: () => {}
        },
        definitionName: {
            type: String,
            default: ''
        },
        showType: {
            type: String,
            default: ''
        }
    },
    methods: {
        handlerNodeCLicked(a) {
            if (a.$type == 'bpmn:CallActivity') {
                // this.processDefinitionId = a.calledElement;
                // this.showDialog = true;
            }
        },
        async dataInstanceRuntime(data, isCheck = false) {
            let arrIndexRemove = [];
            for (let index in data) {
                let nodeInfo = data[index];
                if (nodeInfo.activityType) {
                    if (
                        nodeInfo.activityType.includes('Flow') ||
                        nodeInfo.activityType.includes('Gateway')
                    ) {
                        arrIndexRemove.push(Number(index));
                    } else {
                        if (nodeInfo.activityType.includes('httpServiceTask')) {
                            this.checkServiceTask(data[index]);
                            data[index].name = data[index].activityName;
                            data[index].time = data[index].startTime;
                            data[index].icon =
                                this.icon[data[index].activityType];
                        } else {
                            let typeTask = data[index].activityType;
                            if (data[index].taskId) {
                                typeTask = await this.checkTypeTask(
                                    data[index].taskId
                                ); // kiểm tra task là task submit or duyệt or update
                            }
                            data[index].name = data[index].activityName;
                            data[index].time = data[index].startTime;
                            data[index].icon = this.icon[typeTask];
                        }
                    }
                }
            }
            for (var i = arrIndexRemove.length - 1; i >= 0; i--) {
                data.splice(arrIndexRemove[i], 1);
            }
            if (isCheck == false) {
                await this.getChildrenCallActivity(data);
            } else {
                return data;
            }
        },
        async getChildrenCallActivity(data) {
            let self = this;
            for (let index in data) {
                let nodeInfo = data[index];
                if (nodeInfo.activityType) {
                    if (nodeInfo.activityType.includes('callActivity')) {
                        let res = {};
                        let detailProcess = {};
                        let idInstance = nodeInfo.calledProcessInstanceId;
                        if (idInstance) {
                            res =
                                await bpmneApi.getProcessInstanceRuntimeHistory(
                                    idInstance
                                );
                            detailProcess =
                                await bpmneApi.getProcessInstanceHistory({
                                    processInstanceId: idInstance
                                });
                            if (res.total > 0) {
                                let child = await self.dataInstanceRuntime(
                                    res.data,
                                    true
                                );
                                data[index]['children'] = child;
                                data[index]['name'] = nodeInfo.activityName;
                                data[index]['time'] =
                                    detailProcess.data[0].startTime;
                                data[index]['icon'] = self.icon.callActivity;
                            }
                        }
                    }
                }
            }
            await self.getNameProcessInstance(data);
        },
        async getNameProcessInstance(data) {
            let res = {};
            let treeData = {};
            res = await bpmneApi.getProcessInstanceHistory({
                processInstanceId: data[0].processInstanceId
            });
            treeData.name = res.data[0].name;
            treeData.icon = this.icon.processName;
            treeData.time = res.data[0].startTime;
            treeData.children = data;
            this.$set(this.listInstanceRuntime, 'icon', treeData.icon);
            this.$set(this.listInstanceRuntime, 'name', treeData.name);
            this.$set(this.listInstanceRuntime, 'time', treeData.time);
            this.$set(this.listInstanceRuntime, 'children', treeData.children);
        },
        async checkServiceTask(nodeId) {
            let self = this;
            self.filterVariables.names =
                'symper_' + nodeId.activityId + '_notification_response';
            self.filterVariables.processInstanceIds = JSON.stringify([
                nodeId.processInstanceId
            ]);
            let res = {};
            res = await taskApi.getVariableWorkflow(self.filterVariables);
            if (res.data.length > 0) {
                let value = JSON.parse(res.data[0].value);
                nodeId.assignee = String(value.data.userId);
                nodeId.type = 'symper_service_notification';
                nodeId.dataType = value.data;
            }
        },
        async checkTypeTask(taskId) {
            let filter = {};
            filter.taskId = taskId;
            let res = await bpmneApi.postTaskHistory(filter);
            if (res.total > 0) {
                let desc = JSON.parse(res.data[0].description);
                if (desc.action.action == 'submit') {
                    return 'submitTask';
                } else if (desc.action.action == 'approval') {
                    return 'approvalTask';
                } else if (desc.action.action == 'update') {
                    return 'updateTask';
                }
            } else {
                return 'submitTask';
            }
        }
    },
    computed: {
        stask() {
            return this.$store.state.task;
        }
    },
    created() {
        let self = this;
        this.$evtBus.$on('selected-item-audit-trail', (data) => {
            if (data.id) {
                self.itemAuditTrail = data;
            } else {
                self.itemAuditTrail = {};
            }
        });
    }
};
</script>

<style scoped>
.wraper-tracking {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70%;
    height: 570px;
    background: white;
    padding: 12px 6px 6px 11px;
    transition: all ease-in-out 250ms;
    border-radius: 4px;
}
.modal-diagram {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 999; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

.popup-model-diagram >>> .djs-hit-stroke {
    pointer-events: none;
}
</style>

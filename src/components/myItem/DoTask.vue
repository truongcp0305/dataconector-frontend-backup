<template>
    <div class="w-100" v-if="data.originData.id">
        <DetailTask
            v-if="showTaskDetail"
            :showCompleteWhenSubmitBtn="true"
            :taskInfo="data.taskInfo"
            :originData="data.originData"
            :parentHeight="taskDetailHeight"
            :allVariableProcess="variableProcess"
            :completeWhenSubmit="
                originConfigs.completeWhenSubmit
                    ? originConfigs.completeWhenSubmit
                    : false
            "
            @close-detail="closeDetail"
            @task-submited="handleTaskSubmited"
            @reload-detail="handleReloadDetail"
            @change-complete-when-submit="handleChangeCompleteWhenSubmit"
            @change-info-task="handleChangeInfoTask"
        >
        </DetailTask>
    </div>
</template>

<script>
import TaskDetail from './TaskDetail';
import DetailTask from './DetailTask';
import BPMNEngine from '@/api/BPMNEngine';
import {
    extractTaskInfoFromObject,
    addMoreInfoToTask
} from '@/components/process/processAction';
import { uiConfigApi } from '@/api/uiConfig';
import { util } from '@/plugins/util';
import { taskApi } from '@/api/task.js';
import ListTaskMyItemWorker from 'worker-loader!@/worker/myItem/ListTaskMyItem.Worker.js';
import workFlowApi from '@/api/BPMNEngine.js';
export default {
    name: 'DoTask',
    data: function () {
        return {
            data: {
                taskInfo: {},
                originData: {}
            },
            taskDetailHeight: 500,
            variableProcess: [],
            listTaskMyItemWorker: null,
            completeWhenSubmit: false,
            filterVariables: {
                names: 'symper_application_id',
                page: 1,
                processInstanceIds: []
            },
            showTaskDetail: true,
            originConfigs: {
                completeWhenSubmit: false
            }
        };
    },
    watch: {
        $route(to, from) {
            if (this.$el.isConnected) {
                this.setTaskInfo();
            }
        }
    },
    components: {
        TaskDetail: TaskDetail,
        DetailTask
    },
    beforeCreate() {},
    created() {
        let self = this;
        this.listTaskMyItemWorker = new ListTaskMyItemWorker();
        this.listenWorkerMessage();
        this.restoreUiConfig();
        this.$store
            .dispatch('process/getAllDefinitions')
            .then((res) => {
                self.setTaskInfo();
            })
            .catch((err) => {});
    },
    mounted() {
        this.taskDetailHeight = util.getComponentSize(this).h;
    },
    methods: {
        listenWorkerMessage() {
            let self = this;
            this.listTaskMyItemWorker.addEventListener(
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
        handleRestoreUiConfig(data) {
            if (data.resExtraConfig && data.resExtraConfig.status == 200) {
                let configs = JSON.parse(data.resExtraConfig.data.detail);
                this.originConfigs = configs;
            }
        },
        saveExtraConfig() {
            let rsl = {
                widgetIdentifier: this.getWidgetIdentifier() + ':extra-config',
                detail: JSON.stringify(this.originConfigs)
            };
            uiConfigApi
                .saveUiConfig(rsl)
                .then((res) => {})
                .catch((err) => {});
        },
        restoreUiConfig() {
            let widgetIdentifierExtraConfig =
                this.getWidgetIdentifier() + ':extra-config';
            this.listTaskMyItemWorker.postMessage({
                action: 'restoreUiConfig',
                data: {
                    widgetIdentifierExtraConfig: widgetIdentifierExtraConfig
                }
            });
        },
        getWidgetIdentifier() {
            let widgetIdentifier = '';
            if (this.widgetIdentifier) {
                widgetIdentifier = this.widgetIdentifier;
            } else {
                widgetIdentifier = 'my-item:';
            }
            widgetIdentifier = widgetIdentifier.replace(/(\/|\?|=)/g, '');
            return widgetIdentifier;
        },
        handleReloadDetail() {
            let self = this;
            this.showTaskDetail = false;
            setTimeout(() => {
                self.showTaskDetail = true;
            }, 0);
        },
        async setTaskInfo() {
            let self = this;
            if (self.$route.params.id) {
                let filter = {};
                filter.taskId = self.$route.params.id;
                let res = await BPMNEngine.postTaskHistory(filter);
                if (res.total > 0) {
                    let task = res.data[0];
                    let taskInfo = extractTaskInfoFromObject(task);
                    task = addMoreInfoToTask(task);
                    self.$set(self.data, 'taskInfo', taskInfo);
                    self.$set(self.data, 'originData', task);
                    self.addStatusToTask();
                    if (
                        task.processInstanceId &&
                        task.processInstanceId != null
                    ) {
                        await self.getVariablesProcess(task.processInstanceId);
                    }
                }
            }
        },
        handleChangeInfoTask(data) {
            this.data.originData = data.originData;
            this.data.taskInfo = data.taskInfo;
        },
        handleChangeCompleteWhenSubmit(value) {
            this.originConfigs.completeWhenSubmit = value;
            this.saveExtraConfig();
        },
        async addStatusToTask() {
            let self = this;
            if (!self.data.originData.statusText) {
                let status = '';
                if (!self.data.originData.endTime) {
                    let res = await workFlowApi.getTaskDetail(
                        self.data.originData.id
                    );
                    self.data.originData.delegationState = res.delegationState;
                    if (res.delegationState) {
                        status =
                            res.delegationState == 'pending'
                                ? 'delegate'
                                : 'assign';
                    } else {
                        if (self.data.originData.assignee) {
                            status = 'assign';
                        } else if (self.data.originData.isDone == '1') {
                            status = 'complete';
                        } else {
                            status = 'unAssign';
                        }
                    }
                } else {
                    status = 'complete';
                }
                self.$set(self.data.originData, 'statusText', status);
            }
        },
        async getVariablesProcess(processInstanceId) {
            let self = this;
            let arrProcess = [];
            arrProcess.push(processInstanceId);
            self.filterVariables.processInstanceIds =
                JSON.stringify(arrProcess);
            let resVariable = {};
            resVariable = await taskApi.getVariableWorkflow(
                self.filterVariables
            );
            self.variableProcess = resVariable.data;
        },
        closeDetail() {
            this.$router.push('/myitem');
        },
        handleTaskSubmited() {
            this.$store.commit('task/setIsStatusSubmit', true);
            this.$router.push('/myitem');
        }
    }
};
</script>

<style></style>

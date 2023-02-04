<template>
    <div class="h-100 w-100">
        <div v-if="startWorkflowStatus == 'init'" class="h-100 w-100">
            <Preloader ref="preloader" />
        </div>
        <div v-else-if="startWorkflowStatus == 'success'" class="h-100 w-100">
            <taskDetail
                v-if="taskInfo.action.parameter.documentId > 0"
                :isInitInstance="true"
                @task-submited="handleTaskSubmited"
                :taskInfo="taskInfo"
                :originData="originTaskData"
                :parentHeight="thisHeight"
                @close-detail="closeDetail"
            >
            </taskDetail>
            <div v-else class="mt-10 text-center green--text">
                <i
                    class="mdi mdi-check mr-2 d-inline-block"
                    style="font-size: 25px"
                ></i>
                <h1 class="d-inline-block">
                    {{ $t('process.instance.startSuccessfully') }}
                </h1>
            </div>
        </div>
        <div v-else class="mt-10 red--text text-center">
            <i
                class="mdi mdi-alert-outline mr-2 d-inline-block"
                style="font-size: 25px"
            ></i>
            <h1 class="d-inline-block">
                {{ $t('process.instance.startFailed') }}
            </h1>
        </div>
        <div
            v-if="startWorkflowStatus == 'failed'"
            class="text-center fs-14 mt-2"
        >
            {{ failedReason }}
        </div>
        <RoleSectorWhenStartProcess
            :processKey="processKey"
            ref="roleSelector"
        />
    </div>
</template>

<script>
import BPMNEApi from './../../api/BPMNEngine';
import taskDetail from '@/components/myItem/TaskDetail.vue';
import {
    runProcessDefinition,
    getVarsFromSubmitedDoc,
} from '../../components/process/processAction';
import { formulasApi } from '../../api/Formulas';
import { util } from '../../plugins/util';
import Preloader from '@/components/common/Preloader';
import RoleSectorWhenStartProcess from '@/views/process/RoleSectorWhenStartProcess.vue';

export default {
    computed: {
        processKey() {
            return this.$route.params.id.split(':')[0];
        },
    },
    components: {
        taskDetail: taskDetail,
        Preloader,
        RoleSectorWhenStartProcess,
    },
    data() {
        return {
            failedReason: '',
            originTaskData: {
                assigneeInfo: {
                    id: 0,
                },
            },
            startWorkflowStatus: 'init', // init | started
            taskInfo: {
                action: {
                    parameter: {
                        documentId: 0,
                    },
                    action: 'submit',
                },
            },
            thisHeight: 300,
            startType: 'submit', // các loại bắt đầu quy trình khác nhau: hiện tại chỉ có 1 loại là submit
            definitionModel: {}, // các cấu hình của process definition,
        };
    },
    mounted() {
        this.thisHeight = util.getComponentSize(this).h;
    },
    created() {
        let self = this;
        this.$store
            .dispatch('process/getAllDefinitions')
            .then((res) => {
                self.getFirstNodeData();
            })
            .catch((err) => {});
        this.originTaskData.assigneeInfo.id =
            this.$store.state.app.endUserInfo.id;
    },
    methods: {
        async getFirstNodeData() {
            let self = this;
            let idDefinition = this.$route.params.id;

            if (
                !this.$route.params.extraData ||
                !this.$route.params.extraData.noNeedCheckRole
            ) {
                let canStart =
                    await this.$refs.roleSelector.startBySelectRole();
                if (!canStart.status) {
                    this.startWorkflowStatus = 'failed';
                    this.failedReason = canStart.reason;
                    return;
                }
            }

            let definitionModel = await BPMNEApi.getDefinitionModel(
                idDefinition,
            );
            this.definitionModel = definitionModel;
            let documentToStart = this.getStartDocId(definitionModel);
            if (documentToStart && documentToStart != 'null') {
                this.taskInfo.action.parameter.documentId = documentToStart;
            } else {
                let processDef = await BPMNEApi.getDefinitionData(
                    this.$route.params.id,
                );
                try {
                    let instanceName = await self.getInstanceName([]);
                    let vars = [];
                    let extraData = this.$route.params.extraData;
                    if (extraData) {
                        vars = Array.isArray(extraData.processInstanceVars)
                            ? extraData.processInstanceVars
                            : [];
                    }
                    let newProcessInstance = await runProcessDefinition(
                        this,
                        processDef,
                        vars,
                        instanceName,
                    );
                    await self.checkAndGotoMyTask(newProcessInstance);
                    this.$snotifySuccess(
                        this.$t('process.instance.startSuccessfully'),
                    );
                    this.startWorkflowStatus = 'success';
                } catch (error) {
                    this.$snotifyError(error);
                    this.startWorkflowStatus = 'failed';
                }
            }
        },
        async checkAndGotoMyTask(newProcessInstance) {
            let filter = {};
            let arrTask = [];
            filter.processInstanceId = newProcessInstance.id;
            let dataTaskNew = await BPMNEApi.getTask(filter); // lấy task theo quy trình hiện tại
            if (dataTaskNew.total > 0) {
                arrTask = dataTaskNew.data;
            } else {
                // lấy task theo quy trình con
                let childProcessInstances = await BPMNEApi.getProcessInstance({
                    superProcessInstanceId: newProcessInstance.id,
                });
                if (childProcessInstances.data.length > 0) {
                    let myTasks = [];
                    for (let instance of childProcessInstances.data) {
                        myTasks.push(
                            BPMNEApi.getTask({
                                processInstanceId: instance.id,
                            }),
                        );
                    }
                    myTasks = await Promise.all(myTasks);
                    for (let res of myTasks) {
                        arrTask = arrTask.concat(res.data);
                    }
                }
            }
            for (let task of arrTask) {
                let assignee = task.assignee;
                if (assignee && assignee.indexOf(':') > 0) {
                    assignee = assignee.split(':')[0];
                }
                if (assignee == this.$store.state.app.endUserInfo.id) {
                    if (
                        this.$attrs['symper-parent-component-context'] &&
                        this.$attrs['symper-parent-component-context'] ==
                            'application'
                    ) {
                        this.$evtBus.$emit('symper-change-action-view-url', {
                            link: '/myitem/tasks/' + task.id,
                        });
                    } else {
                        this.$router.push('/myitem/tasks/' + task.id);
                    }
                    break;
                }
            }
        },
        getStartDocId(definitionModel) {
            return Number(
                definitionModel.mainProcess.initialFlowElement.formKey,
            );
        },

        async saveTaskOutcome(outcomeData) {
            let processDef = await BPMNEApi.getDefinitionData(
                this.$route.params.id,
            );
            let vars = []; // các biến cần đưa vào process instance
            let startNode = this.definitionModel.mainProcess.initialFlowElement;
            let startNodeId = startNode.id;
            let dataInputForFormula = {};

            try {
                let varsForBackend = await getVarsFromSubmitedDoc(
                    outcomeData,
                    startNodeId,
                    startNode.formKey,
                );
                vars = varsForBackend.vars;
                dataInputForFormula = varsForBackend.nameAndValueMap;

                let instanceName = await this.getInstanceName(
                    dataInputForFormula,
                );
                let newProcessInstance = await runProcessDefinition(
                    this,
                    processDef,
                    vars,
                    instanceName,
                );
                this.$snotifySuccess(this.$t('v2.workflow.taskSubmitedSuccessfully'));
                this.$router.push(
                    '/documents/objects/' + outcomeData.document_object_id,
                );
            } catch (error) {
                this.$snotifyError(error, this.$t('v2.workflow.errorOnRunProcessDefinition'));
            }
        },
        async getInstanceName(dataInput) {
            let self = this;
            return new Promise((resolve, reject) => {
                let dataObjs = self.definitionModel.processes[0].dataObjects;
                let dataObjsMap = {};

                for (let obj of dataObjs) {
                    let objKey = obj.id.replace(
                        self.definitionModel.mainProcess.id + '_',
                        '',
                    );
                    dataObjsMap[objKey] = obj;
                }

                let formula = dataObjsMap.instanceDisplayText
                    ? dataObjsMap.instanceDisplayText.value
                    : '';
                if (!formula || String(formula).trim() == '') {
                    resolve('');
                } else {
                    if (dataObjsMap.instanceDisplayText) {
                        formulasApi
                            .getDataByAllScriptType(
                                dataObjsMap.instanceDisplayText.value,
                                JSON.stringify(dataInput),
                            )
                            .then((formulaData) => {
                                resolve(formulaData);
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    } else {
                        resolve('');
                    }
                }
            });
        },
        handleTaskSubmited(outcomeData) {
            this.saveTaskOutcome(outcomeData);
        },
        closeDetail() {
            this.$router.push('/workflow');
        },
    },
};
</script>

<style></style>

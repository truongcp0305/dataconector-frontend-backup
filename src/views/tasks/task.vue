<template>
    <div class="h-100 w-100 d-flex justify-center task-style">
        <DocumentSubmit
            v-if="
                showDoTaskComponent &&
                (action == 'submit' || action == 'update')
            "
            ref="submitComponent"
            :docId="docId"
            :workflowVariable="workflowVariable"
            :showSubmitButton="false"
            :documentObjectTaskId="workflowInfo.documentObjectTaskId"
            :documentObjectWorkflowId="workflowInfo.documentObjectWorkflowId"
            :documentObjectWorkflowObjectId="
                workflowInfo.documentObjectWorkflowObjectId
            "
            :action="action"
            :documentObjectId="documentObjectId"
            @submit-document-success="onSubmitDone"
        >
        </DocumentSubmit>
        <Detail
            v-else-if="
                (showDoTaskComponent && action == 'approval') ||
                filter == 'done'
            "
            :docObjInfo="docObjInfo"
        >
        </Detail>
        <div style="width: 100%" v-else-if="filter == 'done-noneObj'">
            <h3 style="text-align: left; margin-top: 20px; color: #4e4e4e">
                {{ $t('v2.myItem.descriptionText') + taskInfo.extraLabel }}
            </h3>
        </div>
        <div v-else-if="action == 'undefined'">
            <div class="text-md-center mt-6">
                <span class="fs-16 font-weight-bold">
                    {{ taskInfo.action.parameter.title }}
                </span>
            </div>
            <div class="text-md-center">
                <span class="text--grey fs-14 mt-6">
                    {{ taskInfo.action.parameter.description }}
                </span>
            </div>
        </div>
    </div>
</template>
<script>
import DocumentSubmit from './../document/submit/Submit.vue';
import Detail from './../document/detail/Detail';
import { getProcessInstanceVarsMap } from '../../components/process/processAction';
export default {
    components: {
        DocumentSubmit: DocumentSubmit,
        Detail
    },
    created() {
        console.log(this, 'thissthissthissthissthissthissthissthiss');
    },
    data() {
        return {
            docId: 0,
            docObjInfo: {
                docObjId: 0
            },
            action: 'submit',
            workflowVariable: {},
            workflowInfo: {
                documentObjectWorkflowObjectId: '',
                documentObjectWorkflowId: '',
                documentObjectTaskId: ''
            },
            showDoTaskComponent: false,
            documentObjectId: 0,
            filter: 'notDone'
        };
    },
    props: {
        taskInfo: {
            type: Object,
            default() {
                return {
                    docId: 0
                };
            }
        }
    },
    computed: {
        stask() {
            return this.$store.state.task;
        }
    },
    watch: {
        taskInfo: {
            deep: true,
            immediate: true,
            handler: async function (after, before) {
                this.showDoTaskComponent = false;
                let filter = this.stask.filter;
                this.filter = filter;
                if (filter != 'done') {
                    if (this.taskInfo.action) {
                        if (
                            !this.taskInfo.action.parameter.documentObjectId &&
                            this.taskInfo.action.parameter.documentObjectId == 0
                        ) {
                            this.filter = 'done-noneObj';
                        } else {
                            let action = this.taskInfo.action.action;
                            this.action = action;
                            let varsMap = await getProcessInstanceVarsMap(
                                this.taskInfo.action.parameter.processInstanceId
                            );
                            this.workflowInfo.documentObjectWorkflowId =
                                this.taskInfo.action.parameter.processDefinitionId;
                            this.workflowInfo.documentObjectWorkflowObjectId =
                                this.taskInfo.action.parameter.processInstanceId;
                            this.workflowInfo.documentObjectTaskId =
                                this.taskInfo.action.parameter.taskId;
                            // cần activityId  của task truyền vào nữa
                            let workflowVariable = {};
                            for (let key in varsMap) {
                                workflowVariable['workflow_' + key] =
                                    varsMap[key].value;
                            }
                            this.workflowVariable = null;
                            this.workflowVariable = workflowVariable;
                            if (action == 'submit') {
                                this.docId =
                                    this.taskInfo.action.parameter.documentId;
                                this.documentObjectId = 0;
                            } else if (
                                action == 'approval' ||
                                action == 'update' ||
                                filter == 'done'
                            ) {
                                if (
                                    !this.taskInfo.action.parameter
                                        .documentObjectId
                                ) {
                                    let approvaledElId =
                                        this.taskInfo.targetElement;
                                    let docObjId =
                                        varsMap[
                                            approvaledElId +
                                                '_document_object_id'
                                        ];
                                    this.docObjInfo.docObjId = docObjId.value;
                                } else {
                                    this.docObjInfo.docObjId =
                                        this.taskInfo.action.parameter.documentObjectId;
                                }
                                this.documentObjectId =
                                    this.docObjInfo.docObjId;
                            }
                            this.showDoTaskComponent = true;
                        }
                    } else if (
                        (this.docId && this.docId) ||
                        this.documentObjectId
                    ) {
                        this.showDoTaskComponent = true;
                    }
                } else {
                    if (this.taskInfo.action.parameter.documentObjectId) {
                        this.docObjInfo.docObjId =
                            this.taskInfo.action.parameter.documentObjectId;
                    } else {
                        this.filter = 'done-noneObj';
                    }
                }
            }
        }
    },
    methods: {
        async handleTaskDetailChange(defId, nodeId) {
            if (!defId || !nodeId) {
                return;
            }
            this.docId = 0;
            let defModel = await BPMNEnginfe.getDefinitionModel(defId);

            let nodeData = defModel.processes[0].flowElementMap[nodeId];
            let symperActionMap = {};
            for (let item of nodeData.formProperties) {
                let name = item.id
                    .replace(nodeData.id + '___', '')
                    .replace(/([0-9]+)/g, '');
                symperActionMap[name] = item;
            }

            let action = symperActionMap.taskAction.defaultExpression.replace(
                /([0-9]+)/g,
                ''
            );
            if (action == 'submit') {
                this.docId = nodeData.formKey;
            }
        },
        onSubmitDone(data) {
            this.$emit('task-submited', data);
        },
        submitForm() {
            this.$refs.submitComponent.handlerSubmitDocumentClick();
        }
    },
    name: 'task'
};
</script>

<style scoped>
.task-style {
    overflow: hidden !important;
}
.task-style >>> .wrap-content-submit {
    width: 96% !important;
}
</style>

<template>
    <div class="h-100 w-100 d-flex justify-center task-style">
        <DocumentSubmit
            :key="originData.id"
            v-if="showDocObjectSubmit"
            ref="submitComponent"
            :taskAction="taskInfo.action.action"
            :showSnackbarSuccess="false"
            :docId="taskInfo.action.parameter.documentId"
            :workflowVariable="workflowVariable"
            :showSubmitButton="false"
            :overridePropertiesControls="overridePropertiesControls"
            :overrideControls="overrideControls"
            :appId="appId"
            :showInfoBtn="false"
            :documentObjectTaskId="workflowInfo.documentObjectTaskId"
            :documentObjectWorkflowId="workflowInfo.documentObjectWorkflowId"
            :documentObjectWorkflowObjectId="
                workflowInfo.documentObjectWorkflowObjectId
            "
            :action="getDocumentAction()"
            :documentObjectId="
                taskInfo.action
                    ? taskInfo.action.parameter.documentObjectId
                        ? taskInfo.action.parameter.documentObjectId
                        : docObjInfo.docObjId
                    : 0
            "
            :editableControls="editableControlsProps"
            @submit-document-error="onSubmitError"
            @cancel-delete-blank-row="handleCancelDelteBlankRow"
            @submit-document-success="onSubmitDone"
        >
        </DocumentSubmit>
        <Detail
            ref="detailDoc"
            class="doc-detail"
            :showInfoBtn="false"
            :showCommentInDoc="false"
            v-else-if="showDocObjectDetail"
            :docObjInfo="docObjInfo"
        >
        </Detail>
        <div style="width: 100%" v-else-if="taskAction == 'submitAdhocTask'">
            <h3
                class="pl-2"
                style="text-align: left; margin-top: 20px; color: #4e4e4e"
            >
                {{ $t('v2.myItem.descriptionText') + taskInfo.extraLabel }}
            </h3>
        </div>
        <div v-else-if="taskAction == 'undefined'">
            <div class="text-md-center mt-6">
                <span class="fs-16 font-weight-bold">
                    {{ taskInfo.content }}
                </span>
            </div>
            <div class="text-md-center">
                <span class="text--grey fs-14 mt-6">
                    {{ taskInfo.extraLabel }}
                </span>
            </div>
        </div>
        <SideBarDetail
            :sidebarWidth="sidebarWidth"
            :isShowSidebar="isShowSidebar"
            :taskInfo="taskInfo"
            :originData="originData"
            @after-hide-sidebar="handleHideSidebar"
            :tabsData="tabsData"
            :appId="appId"
            :showCommentInSideBar="docObjInfo.docObjId == 0"
            @changeUpdateAsignee="changeUpdateAsignee"
            @showContentFile="showContentFile"
            @showPopupTracking="showPopupTracking"
        />
        <KHShowFile
            @downloadOrBackupFile="downloadOrBackupFile"
            v-bind:fileId="fileId"
            v-bind:name="name"
            v-bind:serverPath="serverPath"
            v-bind:type="type"
        />
        <PopupProcessTracking
            :taskInfo="taskInfo"
            :definitionName="definitionName"
        />
    </div>
</template>
<script>
import DocumentSubmit from '@/views/document/submit/Submit.vue';
import Detail from '@/views/document/detail/Detail';
import SideBarDetail from './SideBarDetail';
import { getProcessInstanceVarsMap } from '@/components/process/processAction';
import KHShowFile from '@/components/common/ImageDisplay.vue';
import { taskApi } from '@/api/task.js';
import PopupProcessTracking from './PopupProcessTracking';
import BPMNEngine from '@/api/BPMNEngine';
import { documentApi } from '../../api/Document';

export default {
    components: {
        DocumentSubmit: DocumentSubmit,
        Detail,
        SideBarDetail,
        KHShowFile,
        PopupProcessTracking
    },
    created() {},
    data() {
        return {
            fileId: '',
            serverPath: '',
            name: '',
            type: '',
            sidebarWidth: 400,
            docId: 0,
            docObjInfo: {
                docObjId: 0
            },
            submitCpnKey: 0,
            workflowVariable: {},
            workflowInfo: {
                documentObjectWorkflowObjectId: '',
                documentObjectWorkflowId: '',
                documentObjectTaskId: ''
            },

            overrideControlsConfigs: {},
            variableLoaded: false
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
        },
        overridePropertiesControls: {
            type: Object,
            default() {
                return {
                    abc: {
                        isRequireChange: true,
                        isRequired: true
                    },
                    input_2: {
                        isRequireChange: true,
                        isRequired: true
                    }
                };
            }
        },
        definitionName: {
            type: String,
            default: ''
        },
        originData: {
            type: Object,
            default: () => {}
        },
        isShowSidebar: {
            type: Boolean,
            default: false
        },
        tabsData: {
            type: Object,
            default: () => {}
        },
        appId: {
            type: String,
            default: ''
        }
    },
    computed: {
        showDocObjectSubmit() {
            let hasDocInfo =
                this.taskInfo.action &&
                (this.taskInfo.action.parameter.documentObjectId ||
                    this.taskInfo.action.parameter.documentId);
            let rsl =
                hasDocInfo &&
                (['submit', 'update', 'approval'].includes(this.taskAction) ||
                    this.taskStatus != 'notSubmit') &&
                this.originData.statusText != 'complete' &&
                this.variableLoaded;
            
            if(this.taskAction == 'approval'){
                rsl = rsl && this.editOnApprovalCheck()
            }            
            return rsl;
        },
        showDocObjectDetail() {
            if(this.taskAction == 'approval' && this.originData.statusText != 'complete'){
                return !this.editOnApprovalCheck()
            }

            let rsl = (
                ['submited', 'done'].includes(this.taskStatus) ||
                this.originData.statusText == 'delegate'
            );
            return rsl;
        },
        stask() {
            return this.$store.state.task;
        },
        taskAction() {
            return this.taskInfo.action ? this.taskInfo.action.action : '';
        },
        taskStatus() {
            let status = '';
            if (this.originData.endTime) {
                status = 'done';
            } else if (this.taskInfo.action) {
                if (
                    this.taskAction != 'submit' &&
                    this.taskInfo.action.parameter.documentObjectId
                ) {
                    status = 'submited';
                } else {
                    status = 'notSubmit';
                }
            }
            return status;
        },
        overrideControls() {
            let overrideValueControls = {};
            let controlDefaultValue =
                this.taskInfo.selectDefaultControlDocument;
            controlDefaultValue =
                typeof controlDefaultValue == 'string'
                    ? JSON.parse(controlDefaultValue)
                    : controlDefaultValue;
            if (controlDefaultValue) {
                if (controlDefaultValue.length > 0) {
                    let selectDefaultControlDocument = controlDefaultValue;
                    for (
                        let index = 0;
                        index < selectDefaultControlDocument.length;
                        index++
                    ) {
                        if (
                            selectDefaultControlDocument[index].name &&
                            selectDefaultControlDocument[index].value
                        ) {
                            overrideValueControls[
                                selectDefaultControlDocument[index].name
                            ] = {
                                formulas:
                                    selectDefaultControlDocument[index].value
                            };
                        }
                    }
                }
            }
            let obj = Object.assign(
                this.overrideControlsConfigs,
                overrideValueControls
            );
            return obj;
        },
        editableControlsProps() {
            let controls = null;
            if (this.taskAction == 'approval') {
                if (typeof this.taskInfo.approvalEditableControls == 'string') {
                    if (this.taskInfo.approvalEditableControls.length > 0) {
                        controls = JSON.parse(
                            this.taskInfo.approvalEditableControls
                        );
                    } else {
                        controls = [];
                    }
                } else {
                    controls = this.taskInfo.approvalEditableControls;
                }
            }
            return controls;
        }
    },
    watch: {
        taskInfo: {
            deep: true,
            immediate: true,
            handler: async function (after, before) {
                this.handleTaskInfoChange();
            }
        }
    },
    methods: {
        editOnApprovalCheck(){
            return this.taskInfo.approvalEditableControls && Array.isArray(this.taskInfo.approvalEditableControls) && this.taskInfo.approvalEditableControls.length
        },
        getDocumentAction() {
            if (['approval', 'update'].includes(this.taskAction)) {
                return 'update';
            } else if (this.taskAction == 'submit') {
                if (this.taskInfo.action.parameter.documentObjectId) {
                    return 'update';
                } else {
                    return 'submit';
                }
            }
        },
        async handleTaskInfoChange() {
            let self = this;
            this.submitCpnKey = Date.now();

            try {
                if (this.taskStatus != 'done') {
                    if (self.taskInfo.action) {
                        let varsMap = await getProcessInstanceVarsMap(
                            this.taskInfo.action.parameter.processInstanceId
                        );
                        this.workflowInfo.documentObjectWorkflowId =
                            this.taskInfo.action.parameter.processDefinitionId;
                        this.workflowInfo.documentObjectWorkflowObjectId =
                            this.taskInfo.action.parameter.processInstanceId;
                        this.workflowInfo.documentObjectTaskId =
                            this.taskInfo.action.parameter.taskId;
                        this.workflowVariable = {};
                        this.taskVarsMap = {};
                        for (let key in varsMap) {
                            this.taskVarsMap[key] = this.workflowVariable[
                                'workflow_' + key
                            ] = varsMap[key].value;
                        }
                        if (this.taskAction == 'submit') {
                            this.docId = this.taskInfo.action.parameter.documentId;
                            if (this.taskStatus == 'submited') {
                                this.docObjInfo.docObjId =
                                    this.taskInfo.action.parameter.documentObjectId;
                                    await this.setDocIdFromObjectId(this.docObjInfo.docObjId)
                            }
                        } else if (
                            ['approval', 'update'].includes(this.taskAction)
                        ) {
                            if (!this.taskInfo.action.parameter.documentObjectId) {
                                this.getDocumentObjectId(varsMap);
                                this.$set(
                                    this.taskInfo.action.parameter,
                                    'documentObjectId',
                                    this.docObjInfo.docObjId
                                );
                            } else {
                                this.docObjInfo.docObjId =
                                    this.taskInfo.action.parameter.documentObjectId;
                                await this.setDocIdFromObjectId(this.docObjInfo.docObjId)
                            }
                        }
                    }
                } else if (this.taskInfo.action.parameter.documentObjectId) {
                    this.docObjInfo.docObjId =
                        this.taskInfo.action.parameter.documentObjectId;
                        await this.setDocIdFromObjectId(this.taskInfo.action.parameter.documentObjectId)
                } else {
                    let vars = await getProcessInstanceVarsMap(
                        this.taskInfo.action.parameter.processInstanceId
                    );
                    let key =
                        this.originData.taskDefinitionKey + '_document_object_id';
                    if (vars[key] && vars[key].value) {
                        this.docObjInfo.docObjId = vars[key].value;
                        await this.setDocIdFromObjectId(this.docObjInfo.docObjId)

                        if (
                            this.taskInfo.action &&
                            this.taskInfo.action.parameter
                        ) {
                            this.taskInfo.action.parameter.documentObjectId =
                                this.docObjInfo.docObjId;
                        }
                        try {
                            let description = this.originData.description;
                            if (typeof description == 'string') {
                                description = JSON.parse(description);
                            }
                            description.action.parameter.documentObjectId =
                                vars[key].value;
                            description = JSON.stringify(description);
                            let data = {
                                description: description
                            };
                            let taskId = this.originData.id;
                            this.originData.description = description;
                            BPMNEngine.updateDoneTaskInfo(taskId, data);
                        } catch (error) {
                            this.$snotifyWarning(
                                error,
                                this.$t('v2.myItem.updateTaskDescriptionErr')
                            );
                        }
                    }
                }
            } catch (error) {
                this.$snotifyWarning(error, this.$t("v2.myItem.errorWhenChangeInfo"), "")
            } finally {
                this.variableLoaded = true;
            }
        },
        async setDocIdFromObjectId(objId){
            if(!this.cacheObjIdToDocId){
                this.cacheObjIdToDocId = {};
            }

            if(this.cacheObjIdToDocId[objId]){
                this.taskInfo.action.parameter.documentId = this.cacheObjIdToDocId[objId];
                return;
            }

            try {
                let res = await documentApi.getDocumentDefinitionByObject({ids: JSON.stringify([objId])});
                if(res.status == '200'){
                    this.taskInfo.action.parameter.documentId = res.data[objId].documentId;
                }else{
                    throw this.$t('v2.myItem.docIdFromObjectIdErr');
                }
            } catch (error) {
                console.error(error);
                throw this.$t('v2.myItem.docIdFromObjectIdErr');
            }
        },
        getDocumentObjectId(varsMap) {
            let approvaledElId = this.taskInfo.targetElement;
            let docObjId = 0;
            if (approvaledElId == 'DOC_INSTANCE_FROM_STARTING_WORKFLOW') {
                docObjId = varsMap['docInstanceFromStartingWorkflow'];
                docObjId = docObjId ? docObjId : 0;
            } else {
                docObjId = varsMap[approvaledElId + '_document_object_id']
                    ? varsMap[approvaledElId + '_document_object_id'].value
                    : 0;
            }

            let newObjId = docObjId ? docObjId.value : 0;

            let description = this.originData.description;
            if (typeof description == 'string') {
                description = JSON.parse(description);
            }
            if (description.approvalDocObjValue) {
                newObjId = description.approvalDocObjValue;
            }
            this.docObjInfo.docObjId = newObjId;
        },
        getVarsMap() {
            return this.taskVarsMap;
        },
        onDocumentUpdateSuccess(data) {
            this.$emit('task-submited', data);
        },
        updateSubmitedDocument() {
            this.$refs.panelUpdateSubmitedDocument.handlerSubmitDocumentClick();
        },

        showPopupTracking() {
            this.$store.commit('task/setStatusPopupTracking', true);
        },
        showContentFile(data) {
            this.serverPath = data.serverPath;
            this.name = data.name;
            this.type = data.type;
            this.fileId = data.id;
            this.$store.commit('kh/changeStatusShowImage', true);
        },
        downloadOrBackupFile(data) {
            this.downLoadFile(data.fileId);
        },
        downLoadFile(id) {
            taskApi
                .downloadFile(id)
                .then((res) => {})
                .catch((err) => {
                    console.log('error download file!!!', err);
                })
                .finally(() => {});
        },
        changeUpdateAsignee() {
            this.$emit('changeUpdateAsignee');
        },
        handleHideSidebar() {
            this.$emit('hide-sidebar');
        },
        onSubmitError() {
            this.$emit('task-submit-error');
        },
        onSubmitDone(data) {
            this.$emit('task-submited', data);
        },
        handleCancelDelteBlankRow() {
            this.$emit('cancel-delete-blank-row');
        },
        submitForm() {
            this.$refs.submitComponent.handlerSubmitDocumentClick();
        },
        convertNumber(documentObjectId) {
            documentObjectId;
        },
        async getDocDataSubmit() {
            if(this.$refs.submitComponent){
                let rsl = await this.$refs.submitComponent.getDataForSubmit();
                return rsl;
            }else if(this.$refs.detailDoc){
                return {
                    data: this.$refs.detailDoc.sDocumentDetail.allData,
                    action: 'detail'
                }
            }
        }
    },
    name: 'task'
};
</script>

<style scoped>
.task-style {
    overflow: hidden !important;
    position: relative;
}
.task-style >>> .wrap-content-submit {
    width: 96% !important;
}
::v-deep .dialog-edit-doc {
    overflow: hidden;
}
.doc-detail {
    height: 100% !important;
}
</style>

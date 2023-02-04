<template>
    <div class="w-100" style="height: 100%">
        <v-row
            class="ml-0 mr-0 justify-space-between task-header"
            id="taskHeader"
            style="line-height: 36px; height: 44px"
        >
            <div class="d-flex">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <div
                            v-on="on"
                            class="fs-13 pl-2 pt-1 float-left text-ellipsis"
                            :style="{ width: widthInfoTask + 'px' }"
                        >
                            <span>
                                {{ taskBreadcrumb }}
                            </span>
                            <v-chip
                                x-small
                                label
                                class="ma-2"
                                :color="taskStatus.color"
                                text-color="white"
                            >
                                <span class="fs-11">
                                    {{ $t('tasks.status.' + taskStatus.value) }}
                                </span>
                            </v-chip>
                        </div>
                    </template>
                    <span>{{ taskBreadcrumb }}</span>
                </v-tooltip>
            </div>

            <div id="action-task" class="text-right pt-1 pb-1 pr-0 float-right">
                <span
                    v-if="!originData.endTime && !hideActionTask"
                    class="mr-10"
                >
                    <span
                        v-if="
                            originData.assigneeInfo &&
                            checkRole(originData.assigneeInfo.id) == true
                        "
                        style="margin-right: 85px !important"
                    >
                        <v-btn
                            small
                            depressed
                            v-for="(action, idx) in taskActionBtns"
                            :dark="!loadingAction || idx == indexAction"
                            :key="idx"
                            :color="action.color"
                            class="mr-1"
                            @click="
                                saveTaskOutcome(action.value, idx, action.text)
                            "
                            :loading="loadingAction && idx == indexAction"
                            :disabled="loadingAction && idx != indexAction"
                        >
                            {{ action.text }}
                        </v-btn>
                    </span>
                    <span v-else style="margin-right: 82px !important">
                        <v-btn
                            small
                            depressed
                            disabled
                            v-for="(action, idx) in taskActionBtns"
                            :key="idx"
                            :color="action.color"
                            class="mr-2"
                        >
                            {{ action.text }}
                        </v-btn>
                    </span>
                </span>

                <ListActionMenu
                    id="action-task-life-cycle"
                    @action-clicked="handlerActionClick"
                    :userType="userType"
                    :taskType="taskStatus.value"
                    :taskInfo="taskInfo"
                    :showResolveAction="!showSubmitBtn"
                    :style="{
                        position: 'absolute',
                        right: '90px ',
                        top: '4px'
                    }"
                />
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            class="ml-18"
                            v-on="on"
                            text
                            small
                            @click="toggleSidebar"
                            icon
                            tile
                        >
                            <v-icon small>mdi-information-outline</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('tasks.seeDetails') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            icon
                            tile
                            @click="$copyTextToClipboard(linkTask)"
                            v-on="on"
                            text
                            small
                        >
                            <v-icon small>mdi-page-next-outline</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('task.copyLink') }}</span>
                </v-tooltip>
                <v-btn small tile icon text @click="closeDetail">
                    <v-icon small>mdi-close</v-icon>
                </v-btn>
            </div>
        </v-row>
        <v-divider style="border-color: #dedede"></v-divider>
        <v-row class="ma-0 detail-task" style="height: calc(100% - 45px)">
            <task
                @task-submited="handleTaskSubmited"
                @task-submit-error="submitError"
                :is="`task`"
                :taskInfo="taskInfo"
                :appId="appId"
                :isShowSidebar="isShowSidebar"
                :originData="originData"
                :tabsData="tabsData['people']"
                @changeUpdateAsignee="changeUpdateAsignee"
                @cancel-delete-blank-row="loadingAction = false"
                :definitionName="breadcrumb.definitionName"
                :overridePropertiesControls="overridePropertiesControls"
                :overrideControlsConfigs="overrideControls"
                ref="task"
            >
            </task>
        </v-row>
        <v-dialog v-model="showDialogAlert" max-width="350">
            <v-card>
                <v-card-title class="headline">{{
                    $t('myItem.alert.title_aproval')
                }}</v-card-title>
                <v-card-text>{{
                    $t('myItem.alert.contentPermissionDenied')
                }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="red darken-1"
                        text
                        @click="showDialogAlert = false"
                        >Ok</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackBarSubmit
            ref="snackbar"
            :userType="userType"
            :taskType="taskStatus.value"
            @edit-clicked="showUpdateSubmitedDocument"
            :showResolveAction="!showSubmitBtn"
            @action-clicked="handlerActionClick"
        />
        <AssignDialog
            :showDialog="modelDialog.reAssignShowDialog"
            @cancel="modelDialog.reAssignShowDialog = false"
            :originData="originData"
            @success="refreshMyItem('reAssign')"
        />
        <ClaimDialog
            :showDialog="modelDialog.claimShowDialog"
            @cancel="modelDialog.claimShowDialog = false"
            :taskId="originData.id"
            @success="refreshMyItem('claim')"
        />
        <CompleteDialog
            ref="completeDialog"
            :showDialog="modelDialog.completeShowDialog"
            @cancel="modelDialog.completeShowDialog = false"
            :taskId="originData.id"
            :varsForBackend="varsForBackend"
            :taskInfo="taskInfo"
            :repeatSubmit="repeatSubmit"
            @success="handleSuccessActionOnTask"
        />
        <DelegateDialog
            :showDialog="modelDialog.delegateShowDialog"
            @cancel="modelDialog.delegateShowDialog = false"
            :taskStatus="taskStatus"
            @success="refreshMyItem('delegate')"
            :taskId="originData.id"
            :originData="originData"
        />
        <ResolveDialog
            :showDialog="modelDialog.resolveShowDialog"
            @cancel="modelDialog.resolveShowDialog = false"
            :originData="originData"
            :taskId="originData.id"
            @success="refreshMyItem('resolve')"
        />
        <UnClaimDialog
            :showDialog="modelDialog.unClaimShowDialog"
            @cancel="modelDialog.unClaimShowDialog = false"
            @success="refreshMyItem('unClaim')"
            :taskId="originData.id"
        />
    </div>
</template>

<script>
import icon from '../../components/common/SymperIcon';
import attachment from './Attachment';
import comment from './Comment';
import info from './Info';
import people from './People';
import relatedItems from './RelatedItems';
import task from './Task';
import BPMNEngine from '../../api/BPMNEngine';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { documentApi } from '../../api/Document';
import {
    extractTaskInfoFromObject,
    addMoreInfoToTask,
    getAssigneeForRunProcess,
    getVarsFromSubmitedDoc
} from '@/components/process/processAction';
import ListActionMenu from './taskLifeCycle/ListActionMenu';
import SnackBarSubmit from './taskLifeCycle/SnackBarSubmit';
import { util } from '../../plugins/util';
import AssignDialog from './taskLifeCycle/Dialogs/AssignDialog';
import ClaimDialog from './taskLifeCycle/Dialogs/ClaimDialog';
import CompleteDialog from './taskLifeCycle/Dialogs/CompleteDialog';
import DelegateDialog from './taskLifeCycle/Dialogs/DelegateDialog';
import ResolveDialog from './taskLifeCycle/Dialogs/ResolveDialog';
import UnClaimDialog from './taskLifeCycle/Dialogs/UnClaimDialog';
import { taskApi } from '@/api/task';
import myItemWorker from 'worker-loader!@/worker/myItem/myItem.Worker.js';
import { getFirstNodeData as handleStartProcess } from '@/components/process/StartProcess';
import workFlowApi from '@/api/BPMNEngine.js';

export default {
    async created() {},
    mounted() {
        this.myItemWorkerInstance = new myItemWorker();
    },
    name: 'taskDetail',
    props: {
        currentTask: {
            type: Object,
            default: () => {
                return {};
            }
        },
        taskInfo: {
            type: Object,
            default: () => {
                return {};
            }
        },
        originData: {
            type: Object,
            default: () => {
                let self = this;
                return {
                    assigneeInfo: {
                        id: 0
                    }
                };
            }
        },
        isInitInstance: {
            type: Boolean,
            default: false
        },
        repeatedSubmit: {
            type: Boolean,
            default: false
        },
        parentHeight: {
            type: Number,
            default: 300
        },
        hideActionTask: {
            type: Boolean,
            default: false
        },
        allVariableProcess: {
            type: Array,
            default: () => {
                return [];
            }
        },
        appId: {
            type: String,
            default: ''
        },
        reload: {
            type: Boolean,
            default: true
        }
    },
    watch: {
        taskInfo: {
            deep: true,
            immediate: true,
            handler(valueAfter) {
                this.changeTaskDetail();
                this.setCustomDocControls();
                this.repeatSubmit = false;
            }
        },
        originData: {
            deep: true,
            immediate: true,
            handler(valueAfter) {
                this.isShowSidebar = false;
                this.varsForBackend = {};
                this.getWidthHeaderTask();
                this.checkActionOfUser(valueAfter);
                this.addStatusToTask();
            }
        }
    },
    components: {
        icon: icon,
        attachment,
        comment,
        info,
        people,
        relatedItems,
        task,
        VuePerfectScrollbar,
        ListActionMenu,
        SnackBarSubmit,
        AssignDialog,
        ClaimDialog,
        CompleteDialog,
        DelegateDialog,
        ResolveDialog,
        UnClaimDialog
    },
    data: function () {
        return {
            indexAction: -1,
            varsForBackend: {},
            loadingRepeatSubmit: false,
            repeatSubmit: false,
            outcomeValue: '',
            outcomeText: null,
            modelDialog: {
                unClaimShowDialog: false,
                claimShowDialog: false,
                resolveShowDialog: false,
                completeShowDialog: false,
                delegateShowDialog: false,
                reAssignShowDialog: false
            },
            loadingAction: false,
            showSnackbar: false,
            showDialogAlert: false,
            isRole: false, //value = falses khi assignee = userId, =true khi assignee = userId:role
            widthInfoTask: 330,
            isShowSidebar: false,
            breadcrumb: {
                appName: '',
                definitionName: '',
                instanceName: '',
                taskName: ''
            },
            descriptionTask: '',
            tabsData: {
                people: {
                    owner: [],
                    assignee: [],
                    participant: [],
                    watcher: []
                },
                task: {},
                'sub-task': {},
                attachment: {},
                comment: {},
                info: {},
                'related-items': {}
            },
            userType: '',
            linkTask: '',
            taskActionBtns: [],
            taskAction: undefined,
            tab: null,
            overridePropertiesControls: {},
            overrideControls: {}
        };
    },
    computed: {
        stask() {
            return this.$store.state.task;
        },
        showSubmitBtn() {
            if (this.taskInfo.action) {
                if (
                    (this.taskInfo.action.parameter.documentId != undefined ||
                        this.taskInfo.action.parameter.documentObjectId !=
                            undefined) &&
                    ['update', 'submit'].includes(this.taskInfo.action.action)
                ) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        },
        sapp() {
            return this.$store.state.app;
        },
        taskStatus() {
            let classColor = {
                complete: 'success',
                assign: 'orange',
                unAssign: 'primary',
                delegate: '#8E2D8C'
            };
            return {
                value: this.originData.statusText,
                color: classColor[this.originData.statusText]
            };
        },
        usersMap() {
            return this.$store.state.app.allUsers.reduce((map, el) => {
                map[el.id] = el;
                return map;
            }, {});
        },
        taskBreadcrumb() {
            let bsr = this.breadcrumb.taskName;
            let allDef = this.$store.state.process.allDefinitions;
            if (this.breadcrumb.definitionName) {
                if (this.breadcrumb.appName && this.breadcrumb.appName != '') {
                    bsr = `${this.breadcrumb.appName} / ${this.breadcrumb.definitionName} / ${bsr}`;
                } else {
                    bsr = `${this.breadcrumb.definitionName} / ${bsr}`;
                }
            } else if (this.isInitInstance && !$.isEmptyObject(allDef)) {
                if (allDef[this.$route.params.id]) {
                    bsr = `${
                        allDef[this.$route.params.id].name
                    } / Start workflow`;
                } else {
                    bsr = `... / Start workflow`;
                }
            }
            return bsr;
        }
    },
    methods: {
        async addStatusToTask() {
            let thisCpn = this;
            if (!thisCpn.originData.statusText) {
                if (!thisCpn.originData.endTime) {
                    let res = await workFlowApi.getTaskDetail(
                        thisCpn.originData.id
                    );
                    thisCpn.originData.delegationState = res.delegationState;
                    if (res.delegationState) {
                        thisCpn.$set(
                            thisCpn.originData,
                            'statusText',
                            res.delegationState == 'pending'
                                ? 'delegate'
                                : 'assign'
                        );
                    } else {
                        if (thisCpn.originData.assignee) {
                            thisCpn.$set(
                                thisCpn.originData,
                                'statusText',
                                'assign'
                            );
                        } else if (thisCpn.originData.isDone == '1') {
                            thisCpn.$set(
                                thisCpn.originData,
                                'statusText',
                                'complete'
                            );
                        } else {
                            thisCpn.$set(
                                thisCpn.originData,
                                'statusText',
                                'unAssign'
                            );
                        }
                    }
                } else {
                    thisCpn.$set(thisCpn.originData, 'statusText', 'complete');
                }
            }
        },
        handleSuccessActionOnTask(taskData) {
            let vars = taskData.variables.reduce((map, el) => {
                map[el.name] = el.value;
                return map;
            }, {});
            this.updateProcessInstanceName(vars);
            this.refreshMyItem('complete');
        },
        needComplyFormula(str) {
            return /ref\s*\(|select |\$\{/i.test(str);
        },
        async updateProcessInstanceName(variables = {}) {
            if (
                this.taskAction != '' &&
                this.taskAction != undefined &&
                this.taskAction != 'submitAdhocTask'
            ) {
                let dataInput = this.$refs.task.getVarsMap();
                let processName = '';
                let processKey =
                    this.originData.processDefinitionId.split(':')[0];
                let processInstanceNameKey =
                    processKey + '_instanceDisplayText';
                let formulaName = dataInput[processInstanceNameKey];
                dataInput = Object.assign(dataInput, variables);
                this.myItemWorkerInstance.postMessage({
                    action: 'updateTasksInfoAndProcessName',
                    data: {
                        processInstance: {
                            formulaName: dataInput[processInstanceNameKey],
                            dataInput: dataInput,
                            processInstanceId: this.originData.processInstanceId
                        },
                        taskInfo: {
                            task: this.originData,
                            vars: dataInput,
                            currentVars: variables
                        }
                    }
                });
            }
        },
        submitError() {
            this.loadingAction = false;
        },
        refreshMyItem(type) {
            this.modelDialog[type + 'ShowDialog'] = false;
            if (['reAssign', 'resolve'].includes(type)) {
                type = 'assign';
            }
            setTimeout(
                (self) => {
                    if (self.repeatSubmit) {
                        self.$emit('re-select-first-object');
                    } else {
                        self.reloadDetailTask(type);
                    }
                },
                400,
                this
            );
        },
        handlerDelegateSuccess() {
            this.modelDialog.delegateShowDialog = false;
            this.$emit('reload-data');
        },

        checkActionOfUser(originData) {
            let userInfor = this.$store.state.app.endUserInfo;
            if (this.originData.assigneeInfo) {
                if (userInfor.id == this.originData.assigneeInfo.id) {
                    this.userType = 'assignee';
                }
            }
            if (this.originData.ownerInfo) {
                if (userInfor.id == this.originData.ownerInfo.id) {
                    this.userType = 'owner';
                }
            }
        },
        handlerActionClick(action) {
            this.modelDialog[action + 'ShowDialog'] = true;
        },
        getWidthHeaderTask() {
            setTimeout(
                (self) => {
                    let width =
                        $('#taskHeader').width() -
                        $('#action-task').width() -
                        40;
                    self.widthInfoTask = width;
                },
                210,
                this
            );
        },
        checkRole(assigneeId) {
            if (assigneeId == this.$store.state.app.endUserInfo.id) {
                return true;
            } else {
                return false;
            }
        },
        setCustomDocControls() {
            let editableControls = this.taskInfo.approvalEditableControls;
            if (editableControls && $.isArray(editableControls)) {
                for (let ctrl of editableControls) {
                    if (ctrl == 'SYMPER_NONE_CONTROLS') {
                        editableControls = [];
                        break;
                    } else if (ctrl == 'SYMPER_ALL_CONTROLS') {
                        editableControls = null;
                        break;
                    }
                }
            }
            this.taskInfo.approvalEditableControls = editableControls;
        },
        showUpdateSubmitedDocument() {
            this.$refs.task.showUpdateSubmitedDocument = true;
        },
        changeUpdateAsignee() {
            this.$emit('changeUpdateAsignee');
        },
        toggleSidebar() {
            this.$set(this, 'isShowSidebar', !this.isShowSidebar);
        },
        changeTaskDetailInfo(taskId) {
            let copyText = this.taskInfo.action.parameter.taskId;
            copyText = util.addEnvToUrl(
                'https://apps.symper.vn/#/myitem/tasks/' + copyText
            );
            this.linkTask = copyText;

            if (!taskId) {
                return;
            }
            let self = this;
            for (let role in self.tabsData.people) {
                self.tabsData.people[role] = [];
                if (this.originData[role]) {
                    let userIdentifier = this.originData[role];
                    if (userIdentifier.indexOf(':') > 0) {
                        userIdentifier = userIdentifier.split(':')[0];
                    }
                    self.tabsData.people[role] = userIdentifier
                        .split(',')
                        .reduce((arr, el) => {
                            if (self.usersMap[el]) {
                                arr.push(self.usersMap[el]);
                            } else {
                                console.warn('user id not found : ', el);
                            }
                            return arr;
                        }, []);
                }
            }
            self.setTaskBreadcrumb(this.originData);
        },
        setTaskBreadcrumb(task) {
            if (!task.name) {
                try {
                    task.description = JSON.parse(task.description);
                } catch (error) {
                    task.description = {};
                }
                task.name = task.description.content;
            }

            this.descriptionTask = task.description;
            this.breadcrumb.taskName = task.name;
            if (task.processDefinitionId) {
                let processDefinitionId = task.processDefinitionId;
                var arrProcessDefinitionId = processDefinitionId.split(':'); //tách chuỗi để lấy DefinitionKey
                if (
                    this.$store.state.process.allDefinitions[
                        arrProcessDefinitionId[0]
                    ]
                ) {
                    this.breadcrumb.definitionName =
                        this.$store.state.process.allDefinitions[
                            arrProcessDefinitionId[0]
                        ].name;
                }
                this.breadcrumb.instanceName =
                    this.taskInfo.extraLabel + ' ' + this.taskInfo.extraValue;
            } else {
                this.breadcrumb.definitionName = '';
                this.breadcrumb.instanceName = '';
            }
            if (task.processInstanceId && task.processInstanceId != null) {
                this.getAppName(task.processInstanceId);
            }
        },
        async getAppName(processInstanceId) {
            let self = this;
            if (this.appId) {
                if (this.$store.state.task.allAppActive.length == 0) {
                    await self.$store.dispatch('task/getAllAppActive');
                }
                let allApp = this.$store.state.task.allAppActive;
                let app = allApp.find((element) => element.id == self.appId);
                if (app) {
                    self.breadcrumb.appName = app.name;
                } else {
                    self.breadcrumb.appName = '';
                }
            } else {
                const dataVariable = this.allVariableProcess.find(
                    (element) => element.processInstanceId === processInstanceId
                );
                if (dataVariable) {
                    self.appId = dataVariable.value;
                    if (this.$store.state.task.allAppActive.length == 0) {
                        await self.$store.dispatch('task/getAllAppActive');
                    }
                    let allApp = this.$store.state.task.allAppActive;
                    let app = allApp.find(
                        (element) => element.id == self.appId
                    );
                    if (app) {
                        self.breadcrumb.appName = app.name;
                    } else {
                        self.breadcrumb.appName = '';
                    }
                } else {
                    self.breadcrumb.appName = '';
                }
            }
        },
        closeDetail() {
            this.$emit('close-detail', {});
        },
        isAssigneeCurrentUser(assigneeId) {
            let userIdInAssignee = (assigneeId + '').split(':')[0];
            return userIdInAssignee == this.$store.state.app.endUserInfo.id;
        },
        checkOverrideNodeConfig(action) {
            if (
                this.taskInfo.extraNodeConfig &&
                this.taskInfo.extraNodeConfig.overrideNodeConfig
            ) {
                let config =
                    this.taskInfo.extraNodeConfig.overrideNodeConfig.filter(
                        function (e) {
                            return e.value == action;
                        }
                    );
                this.overridePropertiesControls = {};
                this.overrideControls = {};
                if (config && config[0]) {
                    if (config[0].controls) {
                        for (let i in config[0].controls) {
                            if (config[0].controls[i].properties) {
                                let objProperties = {};
                                let objScript = {};
                                for (let k in config[0].controls[i]
                                    .properties) {
                                    if (
                                        ['require', 'requireChange'].includes(
                                            config[0].controls[i].properties[k]
                                                .key
                                        )
                                    ) {
                                        objScript[
                                            config[0].controls[i].properties[
                                                k
                                            ].key
                                        ] =
                                            config[0].controls[i].properties[
                                                k
                                            ].value;
                                    } else {
                                        objProperties[
                                            config[0].controls[i].properties[
                                                k
                                            ].key
                                        ] =
                                            config[0].controls[i].properties[
                                                k
                                            ].value;
                                    }
                                }
                                if (Object.keys(objProperties).length) {
                                    this.overridePropertiesControls[
                                        config[0].controls[i].id
                                    ] = objProperties;
                                }
                                if (Object.keys(objScript).length) {
                                    this.overrideControls[
                                        config[0].controls[i].id
                                    ] = objScript;
                                }
                            }
                        }
                    }
                }
            }
        },
        async saveTaskOutcome(value, idx, text = null) {
            let self = this;
            this.checkOverrideNodeConfig(value);
            if (value == 'submitAndCreate') {
                self.repeatSubmit = true;
                self.saveTaskOutcome('submit', idx);
            } else {
                // hành động khi người dùng submit task của họ
                this.indexAction = idx;
                //check xem user có phải assignee
                this.loadingAction = true;
                // kiểm tra xem user hiện tại có role được phân quyền trong task không?
                if (
                    !this.isAssigneeCurrentUser(this.originData.assigneeInfo.id)
                ) {
                    this.showDialogAlert = true;
                    this.loadingAction = false;
                } else if (this.checkRoleUser(this.originData)) {
                    if (
                        this.taskAction == 'submit' ||
                        this.taskAction == 'update' ||
                        this.taskAction == 'approval'
                    ) {
                        this.$refs.task.submitForm(value);
                        this.outcomeValue = value;
                        this.outcomeText = text;
                    } else if (
                        this.taskAction == '' ||
                        this.taskAction == undefined ||
                        this.taskAction == 'submitAdhocTask'
                    ) {
                        let taskData = {
                            action: 'complete',
                            outcome: value
                        };
                        let res = await this.submitTask(taskData);
                        if (this.reload) {
                            this.$emit('task-submited', res);
                        } else {
                            this.reloadDetailTask();
                        }
                        this.loadingAction = false;
                        this.$emit('re-select-object');
                    }
                } else {
                    this.showDialogAlert = true;
                    this.loadingAction = false;
                }
            }
        },
        saveApprovalHistory(value) {
            let title = this.taskActionBtns.reduce((tt, el) => {
                if (el.value == value) {
                    tt = el.text;
                }
                return tt;
            }, '');

            let dataToSave = {
                objectId: this.taskInfo.action.parameter.documentObjectId,
                userId: this.$store.state.app.endUserInfo.id,
                actionTitle: title,
                actionName: value,
                note: ''
            };
            documentApi.saveApprovalHistory(dataToSave);
        },
        async submitTask(taskData) {
            let self = this;
            if (this.taskAction == 'submit' || this.isRole == false) {
                await this.updateTask(taskData);
            }
            return new Promise(async (resolve, reject) => {
                try {
                    let taskId = self.taskInfo.action.parameter.taskId;
                    let result = await BPMNEngine.actionOnTask(
                        taskId,
                        taskData
                    );
                    resolve(result);
                } catch (error) {
                    let detail = '';
                    if (error.responseText) {
                        detail = JSON.parse(error.responseText);
                        detail = detail.exception;
                    }
                    self.$snotifyError(
                        error,
                        self.$t('v2.myItem.canNotSubmitTask'),
                        detail
                    );
                    reject(error);
                }
            });
        },
        checkRoleUser(originData) {
            let self = this;
            if (originData.assignee.indexOf(':') > 0) {
                let arrDataAssignee = originData.assignee.split(':');
                let assigneeId = arrDataAssignee[0];
                let roleIdentify = originData.assignee.slice(
                    assigneeId.length + 1
                );
                if (roleIdentify != '0') {
                    let rolesUser = self.$store.state.app.endUserInfo.roles;
                    let roleType =
                        arrDataAssignee[1] == 'system'
                            ? 'systemRole'
                            : arrDataAssignee[1];
                    let role = rolesUser[roleType].find(
                        (element) => element.id == roleIdentify
                    );
                    if (role) {
                        self.isRole = true;
                        return true;
                    } else {
                        self.isRole = false;
                        return true;
                    }
                } else {
                    self.isRole = false;
                    return true;
                }
            } else {
                self.isRole = false;
                return true;
            }
        },
        async updateTask(taskData) {
            let data = {};
            if (this.isRole == false) {
                data.assignee = getAssigneeForRunProcess();
            }
            if (this.taskAction == 'submit') {
                let description;
                if (typeof this.descriptionTask == 'string') {
                    description = JSON.parse(this.descriptionTask);
                } else {
                    description = this.descriptionTask;
                }
                if (this.isSubmited) {
                    description.action.parameter.documentObjectId =
                        this.documentObjectId;
                } else {
                    description.action.parameter.documentObjectId =
                        taskData.variables[0].value;
                }
                data.description = JSON.stringify(description);
            }

            let taskId = this.originData.id;
            return BPMNEngine.updateTask(taskId, data);
        },
        async handleTaskSubmited(data, reload = false) {
            let self = this;
            if (this.taskInfo.action) {
                this.taskInfo.action.parameter.documentObjectId =
                    data.document_object_id;
            }
            self.$emit('submited-doc', data.document_object_id);
            if (reload) {
                self.reloadDetailTask();
            }
            if (self.taskAction != 'approval') {
                self.$refs.snackbar.clickShowSnackbar();
            }
            let elId = self.taskInfo.action.parameter.activityId;
            let docId = data.document_id;
            if (!docId) {
                docId = self.taskInfo.action.parameter.documentId;
            }
            self.varsForBackend = await getVarsFromSubmitedDoc(
                data,
                elId,
                docId
            );
            let taskData = {
                outcome: 'submit',
                variables: self.varsForBackend.vars
            };
            if (data.document_object_id) {
                self.taskInfo.action.parameter.documentObjectId =
                    data.document_object_id;
                self.$refs.task.changeStatusTask({
                    status: 'submited',
                    documentObjectId: data.document_object_id
                });
            }
            await self.updateTask(taskData);
            self.updateProcessInstanceName();
            self.loadingAction = false;
            if (self.repeatSubmit) {
                handleStartProcess(this.originData.processDefinitionId, true);
                self.$refs.completeDialog.completeTask();
            }
            if (self.$route.fullPath.includes('/myitem/tasks/')) {
                self.taskActionBtns = [];
            }
            if (self.taskAction == 'approval') {
                self.handleApprovalTaskAction(self.varsForBackend.vars);
            }
        },
        async handleApprovalTaskAction(vars = []) {
            let elId = this.originData.taskDefinitionKey;
            if (!Array.isArray(vars)) {
                vars = [];
            }
            let varsForRun = [
                {
                    name: elId + '_outcome',
                    type: 'string',
                    value: this.outcomeValue
                },
                {
                    name: elId + '_executor_fullname',
                    type: 'string',
                    value: this.$store.state.app.endUserInfo.displayName
                },
                {
                    name: elId + '_executor_id',
                    type: 'string',
                    value: this.$store.state.app.endUserInfo.id
                }
            ];
            if (this.outcomeText !== null) {
                varsForRun.push({
                    name: elId + '_outcome_text',
                    type: 'string',
                    value: this.outcomeText
                });
            }
            if (vars.length > 0) {
                let usedVarNames = varsForRun.reduce((map, el) => {
                    map[el.name] = true;
                    return map;
                }, {});

                for (let v of vars) {
                    if (!usedVarNames[v.name]) {
                        varsForRun.push(v);
                    }
                }
            }
            let taskData = {
                action: 'complete',
                assignee: '1',
                outcome: this.outcomeValue,
                variables: varsForRun
            };
            await this.submitTask(taskData);
            this.saveApprovalHistory(this.outcomeValue);
            this.reloadDetailTask('complete');
            this.updateProcessInstanceName();
            this.loadingAction = false;
        },
        showApprovalOutcomes(approvalActions) {
            if (typeof approvalActions == 'string') {
                approvalActions = JSON.parse(approvalActions);
            }
            approvalActions = approvalActions.filter((el) => {
                return Boolean(el.value);
            });

            this.taskActionBtns = approvalActions;
        },

        async changeTaskDetail() {
            let self = this;
            self.loadingAction = false;
            if (!self.taskInfo.action) {
                return;
            }
            self.taskAction = self.taskInfo.action.action;
            if (self.taskAction == 'approval') {
                self.showApprovalOutcomes(
                    JSON.parse(self.taskInfo.approvalActions)
                );
            } else if (self.showSubmitBtn == true) {
                if (self.taskAction == 'update') {
                    self.taskActionBtns = [
                        {
                            text: self.$t('v2.myItem.update'),
                            value: 'submit',
                            color: 'blue'
                        }
                    ];
                } else {
                    self.taskActionBtns = [
                        {
                            text: self.$t('v2.myItem.submit'),
                            value: 'submit',
                            color: 'blue'
                        },
                        {
                            text: self.$t('v2.myItem.submitAndCreate'),
                            value: 'submitAndCreate',
                            color: 'success'
                        }
                    ];
                }
            } else if (self.taskAction == 'submitAdhocTask') {
                self.taskActionBtns = [
                    {
                        text: self.$t('v2.myItem.submit'),
                        value: 'submit',
                        color: 'blue'
                    }
                ];
            }
            self.changeTaskDetailInfo(self.taskInfo.action.parameter.taskId);
        },
        async reloadDetailTask(action = false) {
            if (action == 'delegate') {
                delete this.originData.assigneeInfo;
            }
            let self = this;
            let filter = {};
            filter.taskId = this.originData.id;
            let res = await BPMNEngine.postTaskHistory(filter);
            if (res.total > 0) {
                let task = res.data[0];
                let taskInfo = extractTaskInfoFromObject(task);
                task = addMoreInfoToTask(task);
                task.isDone = '1';
                task.symperApplicationId = this.appId;
                let infoTask = {};
                infoTask.taskInfo = taskInfo;
                if (action) {
                    task.statusText = action;
                }
                infoTask.originData = task;
                this.originData = task;
                this.taskInfo = taskInfo;
                self.$emit('change-info-task', infoTask);
            }
        },
        /**
         * Hàm kiểm tra khi load task:
         * kiểm tra nếu task chưa hoàn thành sẽ call api sang document check xem có documentObject nào đc tạo
         * từ taskId chưa.. nếu có (trường hợp chưa đưa task life circle vào sử dụng) thì sẽ cho update documentObjectId vào task
         * và complete task
         */
        async checkTaskSubmitedDocument() {
            let taskId = this.originData.id;
            let self = this;
            this.descriptionTask = this.originData.description;
            if (!this.originData.endTime) {
                let res = await taskApi.getDocumentObjectIdWithTaskId(taskId);
                if (res.data != false) {
                    self.isSubmited = true;
                    self.documentObjectId = res.data.id;
                    self.handleTaskSubmited({});
                }
            }
        }
    }
};
</script>

<style scoped>
.v-tab {
    padding: 0px !important;
    border-width: 20px !important;
    text-transform: none !important;
}
.task-header {
    position: relative;
}
.task-header #action-task {
    position: absolute;
    right: 10px;
}
</style>
<style>
.menu-action-task-life-cycle .v-btn {
    box-shadow: unset !important;
}
</style>

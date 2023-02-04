<template>
    <div class="w-100 h-100">
        <RoleSectorWhenStartProcess
            ref="roleSelector"
            :displayData="displayDataToSelectRole"
        />
        <v-row
            class="ml-0 mr-0 justify-space-between task-header"
            ref="taskHeader"
            style="line-height: 36px; height: 44px"
        >
            <div class="d-flex">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <div
                            v-on="on"
                            class="
                                fs-13
                                d-flex
                                pl-2
                                pt-1
                                float-left
                                text-ellipsis
                            "
                            :style="{ width: widthInfoTask + 'px' }"
                        >
                            <span class="text-ellipsis">
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

            <div
                ref="actionTask"
                class="d-flex pt-1 pb-1"
                v-if="!stopDoingTask.status"
            >
                <span v-if="!originData.endTime && originData.assigneeInfo">
                    <v-btn
                        small
                        depressed
                        v-for="(action, idx) in listTaskActions"
                        :key="idx"
                        :color="action.color"
                        class="mr-1 white--text"
                        @click="
                            handleTaskActionClickV2(
                                action.value,
                                idx,
                                action.text
                            )
                        "
                        :loading="loadingAction && idx == actionIndex"
                        :disabled="
                            !checkRole(originData.assigneeInfo.id) ||
                            (loadingAction && idx != actionIndex) ||
                            disabledHeaderButton
                        "
                    >
                        {{ action.text }}
                    </v-btn>
                </span>
                <ListActionMenu
                    id="action-task-life-cycle"
                    @action-clicked="handleActionClick"
                    :userType="userType"
                    :taskType="taskStatus.value"
                    :taskInfo="taskInfo"
                    class="my-item-menu-action mr-1"
                    :style="{ right: showDeleteButton ? '145px' : '115px' }"
                />
                <v-tooltip bottom v-if="showDeleteButton">
                    <template v-slot:activator="{ on }">
                        <v-btn
                            class="ml-18 mt-1"
                            v-on="on"
                            text
                            small
                            @click="deleteTask"
                            icon
                            tile
                        >
                            <v-icon small>mdi-trash-can-outline</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('tasks.deleteTask') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            class="ml-18 mt-1"
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
                            class="mt-1"
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
                    <span>{{ $t('tasks.copyLink') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            class="mt-1"
                            icon
                            tile
                            @click="handleShowDraft"
                            v-on="on"
                            text
                            small
                        >
                            <v-icon small>mdi-database-sync</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('tasks.restoreDraft') }}</span>
                </v-tooltip>
                <v-menu
                    offset-y
                    :max-width="230"
                    :min-width="210"
                    :close-on-content-click="false"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn
                            icon
                            tile
                            small
                            v-on="on"
                            class="mt-1"
                            v-show="showCompleteWhenSubmitBtn"
                        >
                            <v-icon small>mdi-dots-horizontal</v-icon>
                        </v-btn>
                    </template>
                    <div
                        class="d-flex flex-column bg-white px-4 py-3"
                        style="width: 230px"
                    >
                        <div class="font-weight-bold fs-13">
                            {{ $t('tasks.settingTask') }}
                        </div>
                        <div class="d-flex">
                            <div style="width: 160px" class="mt-2">
                                {{ $t('tasks.autoComplete') }}
                            </div>
                            <v-switch
                                v-model="completeWhenSubmitClone"
                                @change="handleChangeCompleteWhenSubmit"
                                color="orange"
                                hide-details
                            ></v-switch>
                        </div>
                    </div>
                </v-menu>
                <v-btn class="mt-1" small tile icon text @click="closeDetail">
                    <v-icon small>mdi-close</v-icon>
                </v-btn>
            </div>
        </v-row>
        <v-divider style="border-color: #dedede"></v-divider>
        <v-row
            class="ma-0 detail-task"
            :style="{
                height: isPopUp
                    ? 'calc(90vh - 120px) !important'
                    : 'height: calc(100% - 45px)!important'
            }"
            v-if="!stopDoingTask.status"
        >
            <Task
                @task-submit-error="handleSubmitError"
                @cancel-delete-blank-row="handleDeleteBlankRow"
                :is="`task`"
                :taskInfo="taskInfo"
                :appId="appId"
                :isShowSidebar="isShowSidebar"
                :originData="originData"
                :tabsData="tabsData['people']"
                @hide-sidebar="toggleSidebar"
                @changeUpdateAsignee="changeUpdateAsignee"
                :definitionName="breadcrumb.definitionName"
                :overridePropertiesControls="overridePropertiesControls"
                ref="task"
            >
            </Task>
        </v-row>
        <div class="w-100 text-center" v-else>
            <div class="mt-10 red--text">
                <i
                    class="mdi mdi-alert-outline mr-2 d-inline-block"
                    style="font-size: 25px"
                ></i>
                <h1 class="d-inline-block">{{ $t('myItem.cantDoTask') }}</h1>
            </div>
            <div class="w-100">
                {{ stopDoingTask.reason }}
            </div>
        </div>

        <SnackBarSubmit
            ref="snackbar"
            :userType="userType"
            :taskType="taskStatus.value"
            :showResolveAction="!showSubmitBtn"
            @action-clicked="handleActionClick"
        />
        <component
            :is="taskLifeCycleActionTag"
            :taskId="originData.id"
            :varsForBackend="varsForBackend"
            :taskInfo="taskInfo"
            :taskStatus="taskStatus"
            :originData="originData"
            :showDialog="modelDialog[dialogType + 'ShowDialog']"
            :repeatSubmit="repeatSubmit"
            @cancel="handleTaskActionCancel"
            @on-task-complete-clicked="handleConfirmCompletTask"
            @doc-not-submit="enableButtons"
            ref="taskLifeCycleAction"
        >
        </component>
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
        <SymperConfirm ref="symperConfirm" @confirm="confirmDeleteTask" />
    </div>
</template>

<script>
import ListActionMenu from '@/components/myItem/taskLifeCycle/ListActionMenu';
import Task from '@/components/myItem/Task';
import BPMNEngine from '@/api/BPMNEngine';
import ReAssignDialog from '@/components/myItem/taskLifeCycle/Dialogs/AssignDialog';
import ClaimDialog from '@/components/myItem/taskLifeCycle/Dialogs/ClaimDialog';
import CompleteDialog from '@/components/myItem/taskLifeCycle/Dialogs/CompleteDialog';
import DelegateDialog from '@/components/myItem/taskLifeCycle/Dialogs/DelegateDialog';
import ResolveDialog from '@/components/myItem/taskLifeCycle/Dialogs/ResolveDialog';
import UnClaimDialog from '@/components/myItem/taskLifeCycle/Dialogs/UnClaimDialog';
import SnackBarSubmit from '@/components/myItem/taskLifeCycle/SnackBarSubmit';
import { getFirstNodeData as handleStartProcess } from '@/components/process/StartProcess';
import {
    extractTaskInfoFromObject,
    addMoreInfoToTask,
    getAssigneeForRunProcess,
    getVarsFromSubmitedDoc
} from '@/components/process/processAction';
import myItemWorker from 'worker-loader!@/worker/myItem/myItem.Worker.js';
import SymperConfirm from '@/components/common/SymperConfirm';
import { documentApi } from '@/api/Document';
import RoleSectorWhenStartProcess from '@/views/process/RoleSectorWhenStartProcess.vue';
import { checkIsDeleted } from './utilMyitem.js';

export default {
    components: {
        ListActionMenu,
        Task,
        ReAssignDialog,
        ClaimDialog,
        CompleteDialog,
        DelegateDialog,
        ResolveDialog,
        UnClaimDialog,
        SymperConfirm,
        SnackBarSubmit,
        RoleSectorWhenStartProcess
    },
    watch: {
        completeWhenSubmit() {
            this.completeWhenSubmitClone = this.completeWhenSubmit;
        },
        originData: {
            deep: true,
            immediate: true,
            async handler(valueAfter) {
                if (this.changeOriginDataWithImpact) {
                    if (valueAfter.statusText != 'complete') {
                        await this.checkAssigneeRoleInListRole(valueAfter);
                    }
                    this.getWidthHeaderTask();
                    this.checkActionOfUser(valueAfter);
                }
            }
        },
        collapseSidebar() {
            this.getWidthHeaderTask();
        },
        'originData.processDefinitionId'() {
            this.getModleterInfor();
        },
        taskInfo: {
            deep: true,
            immediate: true,
            handler() {
                if (this.actionWhenChangeTaskInfo) {
                    this.setCustomDocControls();
                    this.changeTaskDetail();
                }
                this.actionWhenChangeTaskInfo = true;
            }
        },
        modelerInfo: {
            deep: true,
            immediate: true,
            handler() {
                this.handleModelerInfoChange();
            }
        }
    },
    mounted() {
        this.myItemWorkerInstance = new myItemWorker();
        this.completeWhenSubmitClone = this.completeWhenSubmit;
        this.listenFromWorker();
        this.getModleterInfor();
        let self = this;
        window.addEventListener('resize', () => {
            if (self.$el.isConnected) {
                self.getWidthHeaderTask();
            }
        });
    },
    computed: {
        collapseSidebar() {
            return this.$store.state.app.collapseSideBar;
        },
        showDeleteButton() {
            return (
                this.firstUserTaskNode == this.originData.taskDefinitionKey &&
                checkIsDeleted(
                    this.originData,
                    this.$store.state.app.endUserInfo.id
                )
            );
        },
        modelerInfo() {
            let obj = {};
            if (
                this.$store.state.task.allModelerInfo[
                    this.originData.processDefinitionId
                ]
            ) {
                obj =
                    this.$store.state.task.allModelerInfo[
                        this.originData.processDefinitionId
                    ];
            }
            return obj;
        },
        checkRoleUser() {
            let self = this;
            if (this.originData.assignee.indexOf(':') > 0) {
                let arrDataAssignee = this.originData.assignee.split(':');
                let assigneeId = arrDataAssignee[0];
                let roleIdentify = this.originData.assignee.slice(
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
                        return true;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            } else {
                return true;
            }
        },
        taskAction() {
            return this.taskInfo.action ? this.taskInfo.action.action : '';
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
        taskLifeCycleActionTag() {
            let tag = '';
            if (this.dialogType != '') {
                tag = this.dialogType + 'Dialog';
            }
            return tag;
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
    created() {
        let self = this;
        self.$evtBus.$on('myitem-complete-task-success', (taskData) => {
            if (self.$el.isConnected) {
                self.handleTaskActionSuccess(taskData);
            }
        });
    },
    data() {
        return {
            showDialogAlert: false,
            widthInfoTask: 100,
            breadcrumb: {
                appName: '',
                definitionName: '',
                instanceName: '',
                taskName: ''
            },
            isShowSidebar: false,
            descriptionTask: '',
            userType: '',
            linkTask: '',
            listTaskActions: [],
            loadingAction: false,
            repeatSubmit: false,
            varsForBackend: {},
            firstUserTaskNode: '',
            actionIndex: 0,
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
            overridePropertiesControls: {},
            dialogType: '',
            modelDialog: {
                unClaimShowDialog: false,
                claimShowDialog: false,
                resolveShowDialog: false,
                completeShowDialog: false,
                delegateShowDialog: false,
                reAssignShowDialog: false
            },
            outcomeValue: '',
            disabledHeaderButton: false,
            completeWhenSubmitClone: false,
            actionWhenChangeTaskInfo: true, // Cờ đánh dấu có thực thi các hành động cần thiết khi theo dõi được sự thay đổi của biến taskInfo hay không
            displayDataToSelectRole: {
                subTitle: '',
                roles: {
                    orgchart: [],
                    system: []
                }
            },
            stopDoingTask: {
                status: false,
                reason: ''
            },
            changeOriginDataWithImpact: true // thay đổi originData một cách có chủ ý ngay trong component này, ko muốn phải tải lại các component khác
        };
    },

    props: {
        isPopUp: {
            type: Boolean,
            default: false
        },
        completeWhenSubmit: {
            type: Boolean,
            default: false
        },
        showCompleteWhenSubmitBtn: {
            type: Boolean,
            default: false
        },
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

    methods: {
        getInfoInAssignee(assignee) {
            let rsl = {
                userId: '',
                roleId: ''
            };
            if (typeof assignee == 'string') {
                let sections = assignee.split(':');
                rsl.userId = sections[0];
                if (sections.length > 1) {
                    rsl.roleId = [];
                    for (let index = 1; index < sections.length; index++) {
                        rsl.roleId.push(sections[index]);
                    }
                    rsl.roleId = rsl.roleId.join(':');
                }
            }

            return rsl;
        },
        waitAMoment(time = 100) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, time);
            });
        },
        // Kiểm tra role trong assignee có nằm trong danh sách các role mà user này được phân không
        async checkAssigneeRoleInListRole(task) {
            let info = this.getInfoInAssignee(task.assignee);
            if (info.roleId) {
                let userRoles = this.$store.state.app.endUserInfo.roles;
                let listRole = userRoles.orgchart.concat(userRoles.systemRole);
                let assigneedRole = null;
                for (let role of listRole) {
                    if (role.id == info.roleId) {
                        assigneedRole = role;
                        break;
                    }
                }
                if (!this.$refs.roleSelector) {
                    await this.waitAMoment(700); // đợi 1 lúc để render component RoleSectorWhenStartProcess
                }
                // Nếu role trong task nằm trong danh sách role thì set luôn role đó để thực thi task
                if (assigneedRole) {
                    this.$refs.roleSelector.setRoleToContinue(assigneedRole);
                    this.resetStopDoingTask();
                } else {
                    // Nếu role trong task ko nằm trong list role thì đợi cho user chọn role trong component rồi mới tiếp tục
                    this.displayDataToSelectRole.subTitle = this.$t(
                        'process.instance.subtitleSelectRoleWhenDoTask'
                    );
                    this.displayDataToSelectRole.roles.orgchart =
                        userRoles.orgchart;
                    this.displayDataToSelectRole.roles.system =
                        userRoles.systemRole;

                    let res = await this.$refs.roleSelector.startBySelectRole();
                    if (!res.status) {
                        this.stopDoingTask.status = true;
                        this.stopDoingTask.reason = res.reason;
                    } else {
                        this.updateAssignee();
                        this.resetStopDoingTask();
                    }
                }
            } else {
                this.resetStopDoingTask();
            }
        },
        updateAssignee() {
            let self = this;
            let newAssignee = getAssigneeForRunProcess();
            BPMNEngine.updateTask(this.originData.id, {
                assignee: newAssignee
            });
            this.changeOriginDataWithImpact = false;
            this.originData.assignee = newAssignee;
            setTimeout(() => {
                self.changeOriginDataWithImpact = true;
            }, 200);
        },
        resetStopDoingTask() {
            this.stopDoingTask.status = false;
            this.stopDoingTask.reason = '';
        },
        handleChangeCompleteWhenSubmit() {
            this.$emit(
                'change-complete-when-submit',
                this.completeWhenSubmitClone
            );
        },
        handleModelerInfoChange() {
            if (this.modelerInfo && this.modelerInfo.mainProcess) {
                let firstId =
                    this.modelerInfo.mainProcess.initialFlowElement.id;
                let value = this.getFirstUserTaskNode(
                    this.modelerInfo.mainProcess.flowElementMap[firstId],
                    firstId
                );
                if (value) {
                    this.$set(this, 'firstUserTaskNode', value);
                }
            }
        },
        getFirstUserTaskNode(nodeInfo, id) {
            if (nodeInfo.candidateUsers && nodeInfo.assignee) {
                return id;
            } else {
                if (id.includes('Flow')) {
                    return this.getFirstUserTaskNode(
                        this.modelerInfo.mainProcess.flowElementMap[
                            nodeInfo.targetRef
                        ],
                        nodeInfo.targetRef
                    );
                } else if (nodeInfo.outgoingFlows[0]) {
                    return this.getFirstUserTaskNode(
                        this.modelerInfo.mainProcess.flowElementMap[
                            nodeInfo.outgoingFlows[0].id
                        ],
                        nodeInfo.outgoingFlows[0].id
                    );
                } else {
                    return id;
                }
            }
        },
        getModleterInfor() {
            this.$store.dispatch(
                'task/getModelerInfor',
                this.originData.processDefinitionId
            );
        },
        isAssigneeCurrentUser(assigneeId) {
            let userIdInAssignee = (assigneeId + '').split(':')[0];
            return userIdInAssignee == this.$store.state.app.endUserInfo.id;
        },
        async handleApprovalTaskAction() {
            this.saveApprovalHistory(this.outcomeValue);
            this.reloadDetailTask('complete');
            this.loadingAction = false;
        },
        async submitTask(taskData) {
            let self = this;
            if (this.taskAction == 'submit' || !this.checkRoleUser) {
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
                        self.$t('v2.myItem.submitTaskErr'),
                        detail
                    );
                    reject(error);
                }
            });
        },
        async reloadDetailTask(action) {
            if (action == 'delegate') {
                delete this.originData.assigneeInfo;
            }
            let self = this;
            let filter = {};
            filter.taskId = this.originData.id;
            let res = await BPMNEngine.postTaskHistory(filter);
            if (res.total > 0) {
                let infoTask = {
                    taskInfo: extractTaskInfoFromObject(res.data[0]),
                    originData: res.data[0]
                };
                infoTask.originData = addMoreInfoToTask(infoTask.originData);
                infoTask.originData.symperApplicationId = this.appId;
                infoTask.originData.isDone = '1';
                if (action) {
                    infoTask.originData.statusText = action;
                }
                self.$emit('change-info-task', infoTask);
            }
            this.$emit('reload-detail');
        },
        saveApprovalHistory(value) {
            let title = this.listTaskActions.reduce((tt, el) => {
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
        listenFromWorker() {
            let self = this;
            this.myItemWorkerInstance.addEventListener(
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
        handleUpdatedTaskInfoInWorker() {
            if (this.$el.isConnected) {
                this.$emit('refresh-list-task');
            }
        },

        async updateProcessInstanceName(variables = {}) {
            if (
                this.$refs.task &&
                this.taskAction != '' &&
                this.taskAction != undefined &&
                this.taskAction != 'submitAdhocTask'
            ) {
                let dataInput = this.$refs.task.getVarsMap();
                let processKey =
                    this.originData.processDefinitionId.split(':')[0];
                let processInstanceNameKey =
                    processKey + '_instanceDisplayText';
                if (!dataInput) {
                    return;
                }
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
        /**
         * Check xem node config này có cần override trước khi submit hay ko
         * Nếu có thì override để doc tính toán lại quá trình submit
         */
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
                if (config && config[0]) {
                    if (config[0].controls) {
                        for (let i in config[0].controls) {
                            if (config[0].controls[i].properties) {
                                let objProperties = {};
                                let objScript = {};
                                for (let k in config[0].controls[i]
                                    .properties) {
                                    objProperties[
                                        config[0].controls[i].properties[k].key
                                    ] =
                                        config[0].controls[i].properties[
                                            k
                                        ].value;
                                }
                                if (Object.keys(objProperties).length) {
                                    this.$set(
                                        this.overridePropertiesControls,
                                        config[0].controls[i].id,
                                        objProperties
                                    );
                                }
                            }
                        }
                    }
                }
            }
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, 50);
            });
        },
        async handleTaskSubmited(data) {
            let self = this;
            if (this.taskInfo.action) {
                this.actionWhenChangeTaskInfo = false;
                this.taskInfo.action.parameter.documentObjectId =
                    data.document_object_id;
            }

            if (self.taskAction != 'approval' && !self.completeWhenSubmit) {
                if (!self.repeatSubmit) {
                    self.$refs.snackbar.clickShowSnackbar();
                    this.$emit('reload-detail');
                }
            } else if (self.taskAction == 'approval') {
                await self.handleApprovalTaskAction(self.varsForBackend.vars);
            } else {
                if (!self.repeatSubmit) {
                    this.$emit('reload-detail');
                }
            }

            if (self.repeatSubmit) {
                // await self.$refs.completeDialog.completeTask()
                handleStartProcess(this.originData.processDefinitionId, true);
            }

            if (self.repeatSubmit) {
                setTimeout(() => {
                    self.loadingAction = false;
                }, 2000);
            } else {
                self.loadingAction = false;
            }
        },
        async updateTaskInfoAfterSubmited(data) {
            let flag = true;
            let self = this;
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
            try {
                await self.updateTask(taskData);
            } catch (err) {
                self.loadingAction = false;
                flag = false;
                self.$snotifyInfo(
                    '',
                    self.$t('v2.myItem.workCompletedByOther')
                );
                self.$emit('close-sbs-and-reload');
            }
            return flag;
        },
        async updateTask(taskData) {
            let data = {};
            if (this.isRole == false) {
                data.assignee = getAssigneeForRunProcess();
            }
            if (this.taskAction == 'submit' || this.taskAction == 'update') {
                let description;
                if (typeof this.descriptionTask == 'string') {
                    description = JSON.parse(this.descriptionTask);
                } else {
                    description = this.descriptionTask;
                }
                description.action.parameter.documentObjectId =
                    taskData.variables[0].value;
                data.description = JSON.stringify(description);
                this.originData.description = data.description;
            }
            let taskId = this.originData.id;
            return await BPMNEngine.updateTask(taskId, data);
        },
        handleDeleteBlankRow() {
            this.loadingAction = false;
        },
        handleSubmitError() {
            this.loadingAction = false;
        },
        changeUpdateAsignee() {
            this.$emit('changeUpdateAsignee');
        },
        showApprovalOutcomes(approvalActions) {
            if (typeof approvalActions == 'string') {
                approvalActions = JSON.parse(approvalActions);
            }
            approvalActions = approvalActions.filter((el) => {
                return Boolean(el.value);
            });
            this.listTaskActions = approvalActions;
        },
        changeTaskDetail() {
            let self = this;
            self.disabledHeaderButton = false;
            self.loadingAction = false;
            if (!self.taskInfo.action) {
                return;
            }
            if (this.taskAction == 'approval') {
                self.showApprovalOutcomes(
                    JSON.parse(self.taskInfo.approvalActions)
                );
            } else if (self.showSubmitBtn == true) {
                self.listTaskActions = [
                    {
                        text: this.$t('tasks.submit'),
                        value: 'submit',
                        color: 'blue'
                    },
                    {
                        text: this.$t('tasks.submitAndCreate'),
                        value: 'submitAndCreate',
                        color: 'success'
                    }
                ];
                if (this.taskAction == 'update') {
                    self.listTaskActions[0].text = this.$t('common.update');
                    self.listTaskActions.splice(1, 1);
                }
            } else if (this.taskAction == 'submitAdhocTask') {
                self.listTaskActions = [
                    {
                        text: this.$t('tasks.submit'),
                        value: 'submit',
                        color: 'blue'
                    }
                ];
            }
            self.changeTaskDetailInfo(self.taskInfo.action.parameter.taskId);
        },
        changeTaskDetailInfo(taskId) {
            let self = this;
            if (!taskId) {
                return;
            }
            let hostname = window.location.hostname;
            this.linkTask = 'https://' + hostname + '/#/myitem/tasks/' + taskId;
            let mapIdToUser = this.$store.getters['app/mapIdToUser'];
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
                            if (mapIdToUser[el]) {
                                arr.push(mapIdToUser[el]);
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
        setCustomDocControls() {
            let editableControls = this.taskInfo.approvalEditableControls;
            if (editableControls && editableControls.length > 0) {
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
        async getAppName(processInstanceId) {
            let self = this;
            if (this.appId) {
                if (this.$store.state.task.allAppActive.length == 0) {
                    await self.$store.dispatch('task/getAllAppActive');
                }
                let allApp = this.$store.state.task.allAppActive;
                let app = allApp.find((element) => element.id == self.appId);
                self.breadcrumb.appName = app ? app.name : '';
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
                    self.breadcrumb.appName = app ? app.name : '';
                } else {
                    self.breadcrumb.appName = '';
                }
            }
        },

        getWidthHeaderTask(immediate = false) {
            let self = this;
            if (immediate) {
                self.widthInfoTask =
                    $(self.$refs.taskHeader).width() -
                    $(self.$refs.actionTask).width() -
                    40;
            } else {
                setTimeout(() => {
                    self.widthInfoTask =
                        $(self.$refs.taskHeader).width() -
                        $(self.$refs.actionTask).width() -
                        40;
                }, 210);
            }
        },
        closeDetail() {
            this.$emit('close-detail', {});
        },
        handleShowDraft() {
            if (this.$refs.task.$refs.submitComponent) {
                this.$refs.task.$refs.submitComponent.checkDataFromLocalStorage();
            }
        },
        ///////////////////////////////////
        async checkIsValidTask() {
            try {
                let taskId = this.originData.id;
                let rsl = await BPMNEngine.getATaskInfo(taskId, 'done');
                if (rsl.endTime) {
                    this.$snotifyWarning(
                        rsl,
                        this.$t('myItem.alert.cant_complete_task'),
                        this.$t('myItem.alert.completed_task')
                    );
                    return false;
                } else {
                    return true;
                }
            } catch (error) {
                this.$snotifyWarning(
                    error,
                    this.$t('myItem.alert.cant_complete_task'),
                    this.$t('myItem.alert.removed_task')
                );
                return false;
            }
        },
        checkNeedCompleteTaskImmediately() {
            if (this.taskAction == 'approval' || this.repeatSubmit) {
                return true;
            } else {
                return this.completeWhenSubmitClone ? true : false;
            }
        },
        updateOtherTaskInfo(res) {
            let data = {
                task: this.originData,
                vars: res.allVars,
                currentVars: res.taskVars
            };
            this.myItemWorkerInstance.postMessage({
                action: 'updateOtherTasksInfo',
                data: data
            });
        },
        async handleTaskActionClickV2(outcome, idx, outcomeText = null) {
            if (this.loadingAction) {
                return;
            }
            this.loadingAction = true;
            let self = this;
            try {
                await this.checkOverrideNodeConfig(outcome);
                self.repeatSubmit = outcome == 'submitAndCreate' ? true : false;
                this.actionIndex = idx;
                if (
                    !this.isAssigneeCurrentUser(this.originData.assigneeInfo.id)
                ) {
                    this.showDialogAlert = true;
                } else if (this.checkRoleUser) {
                    if (
                        [
                            'submit',
                            'update',
                            'approval',
                            'submitAndCreate'
                        ].includes(this.taskAction)
                    ) {
                        let completeAfterSubmit =
                            this.checkNeedCompleteTaskImmediately();
                        this.outcomeValue = outcome;
                        let res = await this.$refs.task.getDocDataSubmit();
                        let postData = {
                            data: res.data,
                            outcome: outcome,
                            docAction: res.action,
                            taskAction: this.taskAction,
                            taskId: this.originData.id,
                            completeAfterSubmit: completeAfterSubmit,
                            assignee: getAssigneeForRunProcess()
                        };
                        if (outcomeText != null) {
                            postData.outcomeText = outcomeText;
                        }
                        res = await BPMNEngine.submitTask(postData);
                        if (res.status == 200) {
                            let data = res.data;
                            if (this.taskInfo.action) {
                                this.actionWhenChangeTaskInfo = false;
                                this.taskInfo.action.parameter.documentObjectId =
                                    data.docObj.document_object_id;
                            }

                            if (!completeAfterSubmit) {
                                this.$refs.snackbar.clickShowSnackbar();
                                this.$emit('reload-detail');
                            } else if (this.taskAction == 'approval') {
                                this.saveApprovalHistory(this.outcomeValue);
                            }

                            if (this.repeatSubmit) {
                                await handleStartProcess(
                                    this.originData.processDefinitionId,
                                    true,
                                    true
                                );
                            }

                            this.dialogType = 'complete';
                            this.updateOtherTaskInfo(res.data);
                            this.handleTaskActionCancel();
                            this.refreshMyItem(this.dialogType);
                        } else {
                            this.$snotifyError(res, res.data);
                            this.reloadDetailTask(this.getTaskStatus(res.task));
                        }
                    } else if (
                        ['', undefined, 'submitAdhocTask'].includes(
                            this.taskAction
                        )
                    ) {
                        let taskData = {
                            action: 'complete',
                            outcome: action
                        };
                        await this.submitTask(taskData);
                        this.reloadDetailTask('assign');
                    }
                } else {
                    this.loadingAction = false;
                    this.showDialogAlert = true;
                }
            } catch (error) {
                console.error(error);
                this.$snotifyError(
                    error,
                    this.$t('v2.myItem.submitError'),
                    this.$t('v2.myItem.resendTask')
                );
                this.reloadDetailTask('assign');
            } finally {
                this.loadingAction = false;
            }
        },
        getTaskStatus(task) {
            if (task.endTime !== null) {
                return 'complete';
            } else if (task.assignee === null) {
                return 'unAssign';
            } else {
                return 'assign';
            }
        },
        /////////////////////////////////
        async handleTaskActionClick(action, idx) {
            if (this.loadingAction) {
                return;
            }
            this.loadingAction = true;
            let self = this;
            let checkValidTask = await this.checkIsValidTask();
            if (!checkValidTask) {
                this.loadingAction = false;
                return;
            }
            await this.checkOverrideNodeConfig(action);
            self.repeatSubmit = action == 'submitAndCreate' ? true : false;
            this.actionIndex = idx;

            if (!this.isAssigneeCurrentUser(this.originData.assigneeInfo.id)) {
                this.showDialogAlert = true;
            } else if (this.checkRoleUser) {
                if (
                    [
                        'submit',
                        'update',
                        'approval',
                        'submitAndCreate'
                    ].includes(this.taskAction)
                ) {
                    this.$refs.task.submitForm();
                    this.outcomeValue = action;
                } else if (
                    ['', undefined, 'submitAdhocTask'].includes(this.taskAction)
                ) {
                    let taskData = {
                        action: 'complete',
                        outcome: action
                    };
                    await this.submitTask(taskData);
                    this.reloadDetailTask();
                    this.loadingAction = false;
                }
            } else {
                this.loadingAction = false;
                this.showDialogAlert = true;
            }
        },
        deleteTask() {
            this.$refs.symperConfirm.show(
                this.$t('v2.myItem.deleteTask'),
                this.$t('v2.myItem.deleteTaskConfirm')
            );
        },
        toggleSidebar() {
            this.$set(this, 'isShowSidebar', !this.isShowSidebar);
        },
        checkRole(assigneeId) {
            if (assigneeId == this.$store.state.app.endUserInfo.id) {
                return true;
            } else {
                return false;
            }
        },
        handleTaskActionCancel() {
            this.modelDialog[this.dialogType + 'ShowDialog'] = false;
        },
        confirmDeleteTask() {
            this.myItemWorkerInstance.postMessage({
                action: 'deleteTask',
                data: this.originData
            });
        },
        handleDeleteTask() {
            this.$snotifySuccess('', this.$t('v2.myItem.deleteSuccess'));
            if (this.$route.fullPath.includes('/myitem/tasks/')) {
                this.$goToPage('/myitem', this.$t('process.taskList'));
            } else {
                this.$emit('close-sbs-and-reload', true);
            }
        },
        handleDeleteTaskError(err) {
            this.$snotifyError('', err);
        },
        async handleConfirmCompletTask() {
            this.disabledHeaderButton = true;
            let oldCompleteWhenSubmit = this.completeWhenSubmitClone;
            this.completeWhenSubmitClone = true;
            await this.handleTaskActionClickV2(
                'submit',
                0,
                this.$t('tasks.submit')
            );
            if (this.$refs.taskLifeCycleAction) {
                this.$refs.taskLifeCycleAction.loading = false;
            }
            this.modelDialog.completeShowDialog = false;
            this.completeWhenSubmitClone = oldCompleteWhenSubmit;
        },
        enableButtons() {
            this.disabledHeaderButton = false;
        },
        handleTaskActionSuccess(taskData) {
            if (taskData && taskData.action && taskData.action == 'complete') {
                this.dialogType = 'complete';
                let vars = {};
                if (
                    taskData.variables &&
                    Object.keys(taskData.variables).length > 0
                ) {
                    vars = taskData.variables.reduce((map, el) => {
                        map[el.name] = el.value;
                        return map;
                    }, {});
                }
                this.updateProcessInstanceName(vars);
            }
            this.handleTaskActionCancel();
            this.refreshMyItem(this.dialogType);
        },
        refreshMyItem(type) {
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
        handleActionClick(action) {
            this.dialogType = action;
            this.modelDialog[action + 'ShowDialog'] = true;
        },
        checkActionOfUser() {
            let userInfor = this.$store.state.app.endUserInfo;
            if (
                this.originData.assigneeInfo &&
                userInfor.id == this.originData.assigneeInfo.id
            ) {
                this.$set(this, 'userType', 'assignee');
            } else if (
                this.originData.ownerInfo &&
                userInfor.id == this.originData.ownerInfo.id
            ) {
                this.$set(this, 'userType', 'owner');
            } else {
                this.$set(this, 'userType', 'undefined');
            }
        }
    }
};
</script>

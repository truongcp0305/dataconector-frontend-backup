<template>
    <div class="list-objects w-100" style="height: calc(100vh - 90px)">
        <div v-if="listNode.length != 0" class="h-100">
            <v-row
                style="
                    border-bottom: 1px solid #dedede;
                    margin: 0px;
                    height: 30px;
                "
            >
                <v-col
                    v-if="!sideBySideMode"
                    cols="3"
                    class="fs-13 pt-1 pl-3 font-weight-medium"
                    style="padding: 0px; height: 30px"
                    >{{ $t('tasks.header.groupApproval') }}</v-col
                >
                <v-col
                    :cols="!sideBySideMode ? 9 : 12"
                    style="padding: 0px; height: 30px"
                >
                    <v-row
                        style="margin: 0px; position: relative; height: 30px"
                    >
                        <v-col
                            :cols="!sideBySideMode ? 1 : 1"
                            class="
                                fs-13
                                pl-1
                                pt-1 pt-0
                                pb-0
                                pr-0
                                font-weight-medium
                            "
                            style="flex: 0 !important"
                        >
                            <v-checkbox
                                @click="handleCheckAll"
                                ref="checkBoxAll"
                                :input-value="
                                    countRecordSelected == totalRecord
                                "
                                :indeterminate="
                                    countRecordSelected > 0 &&
                                    countRecordSelected < totalRecord
                                "
                                class="pa-0 ma-0 checkBox"
                            ></v-checkbox>
                        </v-col>
                        <v-col
                            :cols="!sideBySideMode ? 2 : 2"
                            class="fs-13 pt-1 pb-0 pl-0 font-weight-medium"
                            style="flex: 0 0 25.6667%; max-width: 25.6667%"
                            >{{ $t('tasks.header.name') }}</v-col
                        >
                        <v-col
                            cols="2"
                            v-if="!sideBySideMode"
                            class="fs-13 pt-1 pb-0 font-weight-medium"
                            >{{ $t('tasks.header.assignee') }}</v-col
                        >
                        <v-col
                            v-if="!sideBySideMode"
                            cols="2"
                            class="fs-13 pt-1 pb-0 font-weight-medium"
                            >{{ $t('tasks.header.owner') }}</v-col
                        >
                        <v-col
                            v-if="!sideBySideMode"
                            cols="2"
                            class="fs-13 pt-1 pb-0 font-weight-medium"
                            style="flex: 0 0 11.666667%"
                            >{{ $t('tasks.header.dueDate') }}</v-col
                        >
                        <v-col
                            v-if="!sideBySideMode"
                            cols="3"
                            class="fs-13 pt-1 pb-0 font-weight-medium"
                            >{{ $t('tasks.header.app') }}</v-col
                        >
                    </v-row>
                </v-col>
            </v-row>
            <v-row class="listDetail" style="margin: 0px; height: 100%">
                <v-col v-if="!sideBySideMode" cols="3" class="pa-0 h-100">
                    <VuePerfectScrollbar
                        @ps-y-reach-end="handleReachEndList"
                        style="height: calc(100% - 30px)"
                    >
                        <div>
                            <v-row
                                v-for="(obj, idx) in listNode"
                                :key="idx"
                                :class="{
                                    'mr-0 ml-0 py-2 single-row': true,
                                    'd-active': index == idx || selectObj == idx
                                }"
                                @mouseover="index = idx"
                                @mouseout="index = null"
                                @click="selectObject(obj, idx)"
                            >
                                <div class="pl-2 w-100">
                                    <div class="d-flex">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <div
                                                    v-on="on"
                                                    class="
                                                        text-left
                                                        fs-13
                                                        pr-6
                                                        text-ellipsis
                                                        w-100
                                                    "
                                                >
                                                    {{ obj.activity_name }}
                                                </div>
                                            </template>
                                            <span>{{ obj.activity_name }}</span>
                                        </v-tooltip>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-chip
                                                    v-on="on"
                                                    class="px-2"
                                                    style="
                                                        margin-right: 15px;
                                                        color: black;
                                                        border-radius: 4px;
                                                        background-color: rgba(
                                                            0,
                                                            0,
                                                            0,
                                                            0.1
                                                        );
                                                        font-size: 10px;
                                                    "
                                                    color="#EE6B60"
                                                    x-small
                                                >
                                                    {{ obj.number_of_task }}
                                                </v-chip>
                                            </template>
                                            <span>{{
                                                $t(
                                                    'v2.myItem.numberTaskToReview'
                                                )
                                            }}</span>
                                        </v-tooltip>
                                    </div>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <div
                                                v-on="on"
                                                class="
                                                    pa-0
                                                    grey--text
                                                    lighten-2
                                                    d-flex
                                                    justify-space-between
                                                "
                                            >
                                                <div
                                                    class="
                                                        fs-11
                                                        pr-6
                                                        text-ellipsis
                                                    "
                                                >
                                                    v{{
                                                        obj.process_definition_version
                                                    }}
                                                    |
                                                    {{
                                                        obj.process_definition_name
                                                    }}
                                                </div>
                                            </div>
                                        </template>
                                        <span>
                                            {{
                                                $t('v2.myItem.workflow') +
                                                obj.process_definition_name
                                            }}<br />
                                            {{
                                                $t('v2.myItem.version') +
                                                obj.process_definition_version
                                            }}
                                        </span>
                                    </v-tooltip>
                                </div>
                            </v-row>
                        </div>
                    </VuePerfectScrollbar>
                </v-col>
                <v-col
                    :cols="!sideBySideMode ? 9 : 12"
                    class="pa-0 ma-0"
                    height="30"
                    style="border-left: 1px solid #e0e0e0"
                >
                    <detailNode
                        ref="detailNode"
                        :selectedNode="selectedNode"
                        :nodeInfo="listNode[selectedNode]"
                        :countRecordSelected="Number(countRecordSelected)"
                        :sideBySideMode="sideBySideMode"
                        @changeValueCheckBox="changeValueCheckBox"
                        @changeSideBySide="changeSideBySide"
                        @closeDetail="closeDetail"
                        @size-query-task="setTotalCurrentTask"
                    />
                </v-col>
            </v-row>

            <v-dialog
                class="dialog-approval"
                v-model="dialogApproval"
                max-width="350"
            >
                <v-card>
                    <v-card-title class="headline">{{
                        $t('myItem.alert.title_aproval')
                    }}</v-card-title>
                    <v-card-text
                        >{{
                            $t('v2.myItem.confirmActionBegin') +
                            action +
                            $t('v2.myItem.confirmActionMiddle')
                        }}
                        {{ countRecordSelected }}/{{ totalRecord }}
                        {{ $t('v2.myItem.confirmActionEnd') }}
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="red darken-1"
                            text
                            @click="dialogApproval = false"
                            >{{ $t('common.close') }}</v-btn
                        >
                        <v-btn
                            color="green darken-1"
                            text
                            @click="approvalMoreTask"
                            >{{ $t('common.ok') }}</v-btn
                        >
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <BottomSheet
                :persistent="true"
                :isShadow="false"
                ref="bottomSheetView"
                class="h-100"
            >
                <div slot="content" class="sheet-content d-flex">
                    <div class="count-selection" style="padding-top: 15px">
                        <span style="margin-left: 50px"
                            >{{ $t('document.instance.showlist.select') }}
                            {{ countRecordSelected }}/{{ totalRecord }}
                            {{ $t('document.instance.showlist.record') }}</span
                        >
                    </div>
                    <div class="sheet-action">
                        <v-btn
                            small
                            depressed
                            v-for="(action, idx) in taskActionBtns"
                            dark
                            :key="idx"
                            :color="action.color"
                            @click="saveTaskOutcome(action.value, action.text)"
                            class="mr-2"
                        >
                            {{ action.text }}
                        </v-btn>
                        <v-btn @click="hideBottomSheet" tile small>
                            {{ $t('common.close') }}
                        </v-btn>
                    </div>
                </div>
            </BottomSheet>
        </div>
        <NotFoundScreen :emptyDataKey="'myitem-batch-approval-list'" v-else />
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import detailNode from './DetailNode';
import { util } from '@/plugins/util';
import BottomSheet from '@/components/common/BottomSheet';
import BPMNEngine from '@/api/BPMNEngine';
import { documentApi } from '@/api/Document';
import { getAssigneeForRunProcess } from '@/components/process/processAction';
import NotFoundScreen from '@/components/common/NotFoundScreen';

export default {
    name: 'listNodeInProcess',
    components: {
        VuePerfectScrollbar: VuePerfectScrollbar,
        detailNode,
        BottomSheet,
        NotFoundScreen
    },
    props: {
        changeStatusMoreApproval: {
            type: Boolean,
            default: true
        }
    },
    watch: {
        changeStatusMoreApproval(newVl) {
            if (newVl == true) {
                this.getData();
            }
        },
        countRecordSelected(vl) {
            if (vl == 0) {
                setTimeout(
                    (self) => {
                        self.hideBottomSheet();
                    },
                    100,
                    this
                );
            } else {
                this.$refs.bottomSheetView.show();
            }
        }
    },
    computed: {
        stask() {
            return this.$store.state.task;
        },
        listNode() {
            return this.stask.listNodeInProcess;
        }
    },
    data() {
        return {
            isRole: false,
            dialogApproval: false,
            sideBySideMode: false,
            index: 0,
            selectObj: -1,
            selectedNode: 0,
            selectAll: false,
            listTaskHeight: 500,
            countRecordSelected: 0,
            totalRecord: 0,
            recordSelected: {},
            listTaskInNode: [],
            taskActionBtns: [],
            taskAction: undefined,
            listTaskChecked: [],
            action: '',
            isShowBottom: true,
            selectingObject: {},
            nodeSelected: {},
            detailNodeKey: 0
        };
    },
    methods: {
        setTotalCurrentTask(size) {
            this.totalRecord = size;
        },
        handleCheckAll() {
            if (this.countRecordSelected == this.totalRecord) {
                this.countRecordSelected = 0;
            } else {
                this.countRecordSelected = this.totalRecord;
            }
        },
        closeDetail() {
            this.sideBySideMode = false;
        },
        changeSideBySide(value) {
            this.sideBySideMode = value;
        },
        getData() {
            this.$store.dispatch('task/getListNodeInProcess');
        },
        selectObject(obj, idx) {
            this.selectingObject = obj;
            this.countRecordSelected = 0;
            this.isShowBottom = true;
            this.selectAll = false;
            this.selectedNode = idx;
            this.selectObj = idx;
            this.totalRecord = obj.number_of_task;
            this.nodeSelected = null;
            this.nodeSelected = obj;
            this.taskActionBtns = [];
        },
        handleReachEndList() {},
        reCalcListTaskHeight() {
            this.listTaskHeight =
                util.getComponentSize(this.$el.parentElement).h - 125;
        },
        hideBottomSheet() {
            this.$refs.bottomSheetView.toggle();
        },
        changeValueCheckBox(data) {
            if (this.isShowBottom) {
                this.$refs.bottomSheetView.show();
                this.listTaskInNode = data;
                let listTaskChecked = [];
                for (var key in data) {
                    if (data[key].checked == true) {
                        listTaskChecked.push(data[key]);
                    }
                }
                this.listTaskChecked = listTaskChecked;
                this.countRecordSelected = listTaskChecked.length;
                this.getActionNode(data[0]);
            }
        },
        getActionNode(task) {
            let self = this;
            let taskInfo = JSON.parse(task.description);
            let varsMap = {};
            self.taskAction = taskInfo.action.action;
            if (self.taskAction == 'approval') {
                self.showApprovalOutcomes(JSON.parse(taskInfo.approvalActions));
            }
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
        saveTaskOutcome(value, text = null) {
            this.action = value;
            this.actionText = text;
            this.dialogApproval = true;
        },
        async approvalMoreTask() {
            this.dialogApproval = false;
            let self = this;
            let allRes = [];
            let value = self.action;
            let allResSaveApprovalHistory = [];
            if (self.listTaskChecked.length > 0) {
                self.$snotifyInfo('', this.$t('v2.myItem.processing'));
                for (let key in self.listTaskChecked) {
                    let originData = self.listTaskChecked[key];
                    let taskInfo = JSON.parse(originData.description);
                    let elId = originData.taskDefinitionKey;
                    let taskData = {
                        // action nhận 1 trong 4 giá trị: complete, claim, resolve, delegate
                        action: 'complete',
                        assignee: '1',
                        outcome: value,
                        variables: [
                            {
                                name: elId + '_outcome',
                                type: 'string',
                                value: value
                            },
                            {
                                name: elId + '_executor_fullname',
                                type: 'string',
                                value: self.$store.state.app.endUserInfo
                                    .displayName
                            },
                            {
                                name: elId + '_executor_id',
                                type: 'string',
                                value: self.$store.state.app.endUserInfo.id
                            }
                        ]
                    };
                    if (self.actionText !== null) {
                        taskData.variables.push({
                            name: elId + '_outcome_text',
                            type: 'string',
                            value: self.actionText
                        });
                    }
                    if (this.checkRoleUser(originData)) {
                        let res = self.submitTask(
                            taskData,
                            taskInfo,
                            originData
                        );
                        allResSaveApprovalHistory.push(
                            self.saveApprovalHistory(value, taskInfo)
                        );
                        allRes.push(res);
                    } else {
                        self.$snotifyError(
                            '',
                            this.$t('v2.myItem.permissionDenied')
                        );
                    }
                }
                Promise.all(allRes)
                    .then((result) => {
                        setTimeout(() => {
                            self.$refs.detailNode.getData();
                        });
                        self.selectingObject.number_of_task =
                            Number(self.selectingObject.number_of_task) -
                            result.length;

                        self.countRecordSelected = 0;
                        self.countRecordSelected(0);
                    })
                    .catch((err) => {});
                Promise.all(allResSaveApprovalHistory)
                    .then((result) => {})
                    .catch((err) => {});
            }
        },

        async submitTask(taskData, taskInfo, originData) {
            let self = this;
            if (this.isRole == false) {
                // isRole == false thi update task cập nhật role hiện tại
                await this.updateTask(originData);
            }
            try {
                let taskId = taskInfo.action.parameter.taskId;
                let result = await BPMNEngine.actionOnTask(taskId, taskData);
                self.$snotifySuccess(this.$t('v2.myItem.taskCompleted'));
            } catch (error) {
                let detail = '';
                if (error.responseText) {
                    detail = JSON.parse(error.responseText);
                    detail = detail.exception;
                }
                self.$snotifyError(
                    error,
                    this.$t('v2.myItem.canNotSubmitTask'),
                    detail
                );
            }
        },
        checkRoleUser(originData) {
            let self = this;
            if (originData.assignee.indexOf(':') > 0) {
                let arrDataAssignee = originData.assignee.split(':');
                let assigneeId = arrDataAssignee[0];
                let roleIdentify = originData.assignee.slice(
                    assigneeId.length + 1
                );
                // ktra enduser có tồn tại role trong assignee không
                let rolesUser = self.$store.state.app.endUserInfo.roles;
                let role = rolesUser[arrDataAssignee[1]].find(
                    (element) => element.id == roleIdentify
                );
                if (role) {
                    self.isRole = true;
                    return true;
                } else {
                    self.isRole = true;
                    return false;
                }
            } else {
                self.isRole = false;
                return true;
            }
        },
        async updateTask(originData) {
            let data = {};
            data.assignee = getAssigneeForRunProcess();
            let taskId = originData.id;
            await BPMNEngine.updateTask(taskId, data);
        },
        saveApprovalHistory(value, taskInfo) {
            let title = this.taskActionBtns.reduce((tt, el) => {
                if (el.value == value) {
                    tt = el.text;
                }
                return tt;
            }, '');

            let dataToSave = {
                objectId: taskInfo.action.parameter.documentObjectId,
                userId: this.$store.state.app.endUserInfo.id,
                actionTitle: title,
                actionName: value,
                note: ''
            };
            return documentApi.saveApprovalHistory(dataToSave);
        }
    },
    created() {
        this.getData();
    },
    mounted() {
        let self = this;
        this.$store
            .dispatch('process/getAllDefinitions')
            .then((res) => {
                self.getTasks();
            })
            .catch((err) => {});
        self.reCalcListTaskHeight();
    },
    activated() {
        this.selectAll = false;
        this.isShowBottom = false;
    }
};
</script>

<style scoped>
.d-active {
    background: #f5f5f5;
}
.checkBox {
    height: 22px;
}

.sheet-action {
    margin-left: auto;
}

.sheet-action >>> button {
    margin: 6px 8px !important;
    border-radius: 4px;
    box-shadow: none;
}
.sheet-action >>> button:last-child {
    color: red;
}
</style>

<template>
    <div class="h-100 w-100">
        <v-skeleton-loader
            v-if="loadingActionTask"
            :type="'table-tbody'"
            class="mx-auto"
            width="100%"
            height="100%"
        ></v-skeleton-loader>
        <v-row
            class="ml-0 mr-0 justify-space-between"
            style="line-height: 36px"
        >
            <div class="fs-13 pl-2 pt-1 float-left">
                {{ taskBreadcrumb }}
            </div>
            <div class="text-right pt-1 pb-1 pr-0 float-right">
                <span v-if="!originData.endTime">
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
                </span>
                <!-- <input class="d-none" type="text" id="myInputLink" v-model="linkTask" > -->
                <!-- <v-text-field class="d-none"  v-model="linkTask"></v-text-field> -->
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
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

                <!-- <button @click="getTaskTest">Click</button> -->

                <v-btn small text @click="closeDetail">
                    <v-icon small>mdi-close</v-icon>
                </v-btn>
            </div>
        </v-row>
        <v-divider style="border-color: #ff7400"></v-divider>
        <v-row class="ma-0">
            <v-col cols="12" class="pa-0">
                <v-card flat>
                    <v-tabs
                        v-model="tab"
                        background-color="transparent"
                        color="grey"
                        light
                        height="30"
                        flat
                        grow
                    >
                        <v-tab
                            v-for="item in items"
                            :key="item.tab"
                            class="fs-13"
                        >
                            <v-icon small class="mr-2">{{ item.icon }}</v-icon>
                            {{ item.title }}
                        </v-tab>
                    </v-tabs>

                    <v-tabs-items v-model="tab">
                        <v-tab-item v-for="item in items" :key="item.tab">
                            <VuePerfectScrollbar
                                :style="{ height: parentHeight + 'px' }"
                            >
                                <component
                                    @task-submited="handleTaskSubmited"
                                    :is="item.content"
                                    :taskInfo="taskInfo"
                                    :originData="originData"
                                    :tabData="tabsData[item.tab]"
                                    :ref="item.tab"
                                >
                                </component>
                            </VuePerfectScrollbar>
                        </v-tab-item>
                    </v-tabs-items>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import icon from '../../components/common/SymperIcon';
import attachment from './attachment';
import comment from './comment';
import flow from './flow';
import info from './info';
import people from './people';
import relatedItems from './relatedItems';
import subtask from './subtask';
import task from './task';
import BPMNEngine from '../../api/BPMNEngine';
import { getVarsFromSubmitedDoc } from '../../components/process/processAction';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { documentApi } from '../../api/Document';
import { util } from '../../plugins/util';
export default {
    name: 'taskDetail',
    props: {
        // Thông tin của một task, cấu trúc giống như một item khi lấy danh sách task
        taskInfo: {
            type: Object,
            default: () => {
                return {};
            }
        },
        originData: {
            type: Object,
            default: () => {
                return {};
            }
        },
        isInitInstance: {
            type: Boolean,
            default: false
        },
        parentHeight: {
            type: Number,
            default: 300
        }
    },
    watch: {
        taskInfo: {
            deep: true,
            immediate: true,
            handler(valueAfter) {
                this.changeTaskDetail();
            }
        }
    },
    components: {
        icon: icon,
        attachment,
        comment,
        flow,
        info,
        people,
        relatedItems,
        subtask,
        task,
        VuePerfectScrollbar
    },
    data: function () {
        return {
            loadingActionTask: false,
            breadcrumb: {
                definitionName: '',
                instanceName: '',
                taskName: ''
            },
            descriptionTask: '',
            tabsData: {
                people: {
                    assignee: [],
                    owner: [],
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
            linkTask: '',
            taskActionBtns: [
                {
                    text: this.$t('v2.myItem.submit'),
                    value: 'submit',
                    color: 'blue'
                }
            ],
            taskAction: undefined,
            tab: null,
            items: [
                {
                    tab: 'task',
                    icon: 'mdi-file-document',
                    title: this.$t('v2.myItem.task'),
                    content: task
                },
                {
                    tab: 'people',
                    icon: 'mdi-account',
                    title: this.$t('v2.myItem.people'),
                    content: people
                },
                {
                    tab: 'sub-task',
                    icon: 'mdi-format-list-bulleted',
                    title: this.$t('v2.myItem.subtask'),
                    content: subtask
                },
                {
                    tab: 'attachment',
                    icon: 'mdi-paperclip',
                    title: this.$t('v2.myItem.attachments'),
                    content: attachment
                },
                {
                    tab: 'comment',
                    icon: 'mdi-message-text-outline',
                    title: this.$t('v2.myItem.comment'),
                    content: comment
                },
                {
                    tab: 'info',
                    icon: 'mdi-information-outline',
                    title: this.$t('v2.myItem.info'),
                    content: info
                },
                {
                    tab: 'related-items',
                    icon: 'mdi-trending-up',
                    title: this.$t('v2.myItem.relatedItems'),
                    content: relatedItems
                }
            ]
        };
    },
    computed: {
        stask() {
            return this.$store.state.task;
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
                // bsr = `App name / ${this.breadcrumb.definitionName} / ${this.breadcrumb.instanceName} / ${bsr}`;
                bsr = `${this.breadcrumb.definitionName} / ${bsr}`;
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
        this.checkAndSwitchToTab();
    },
    methods: {
        checkAndSwitchToTab() {
            if (
                this.$route.params.extraData &&
                this.$route.params.extraData.subAction
            ) {
                let tabAction = {
                    view_comment: 'comment'
                };
                let tab = tabAction[this.$route.params.extraData.subAction];
                for (let i = 0; i < this.items.length; i++) {
                    if (this.items[i].tab == tab) {
                        this.tab = i;
                        break;
                    }
                }
            }
        },
        onCopySuccess() {
            this.$snotify({
                type: 'success',
                title: this.$t('v2.myItem.copyToClipboard'),
                text: this.$t('v2.myItem.copySuccess')
            });
        },
        changeTaskDetailInfo(taskId) {
            let hostname = window.location.hostname;
            let copyText = this.taskInfo.action.parameter.taskId;
            copyText = util.addEnvToUrl(
                'https://' + hostname + '/#/tasks/' + copyText
            );
            this.linkTask = copyText;

            if (!taskId) {
                return;
            }
            let self = this;
            let filter = this.stask.filter;
            BPMNEngine.getATaskInfo(taskId, filter).then((res) => {
                console.log(res, 'task');
                for (let role in self.tabsData.people) {
                    if (res[role]) {
                        self.tabsData.people[role] = res[role]
                            .split(',')
                            .reduce((arr, el) => {
                                arr.push(self.usersMap[el]);
                                return arr;
                            }, []);
                    }
                }
                self.setTaskBreadcrumb(res);
            });
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
                this.breadcrumb.definitionName =
                    this.$store.state.process.allDefinitions[
                        task.processDefinitionId
                    ].name;
                this.breadcrumb.instanceName =
                    this.taskInfo.extraLabel + ' ' + this.taskInfo.extraValue;
            } else {
                this.breadcrumb.definitionName = '';
                this.breadcrumb.instanceName = '';
            }
        },
        closeDetail() {
            this.$emit('close-detail', {});
        },
        async saveTaskOutcome(value, text = null) {
            // hành động khi người dùng submit task của họ
            this.loadingActionTask = true;
            if (this.taskAction == 'submit' || this.taskAction == 'update') {
                this.$refs.task[0].submitForm(value);
            } else if (this.taskAction == 'approval') {
                let elId = this.originData.taskDefinitionKey;
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
                            value: this.$store.state.app.endUserInfo.displayName
                        },
                        {
                            name: elId + '_executor_id',
                            type: 'string',
                            value: this.$store.state.app.endUserInfo.id
                        }
                    ]
                    // "transientVariables": []
                };
                if (text !== null) {
                    taskData.variables.push({
                        name: elId + '_outcome_text',
                        type: 'string',
                        value: text
                    });
                }
                let res = await this.submitTask(taskData);
                this.saveApprovalHistory(value);
                this.$emit('task-submited', res);
            } else if (this.taskAction == '' || this.taskAction == undefined) {
                let taskData = {
                    action: 'complete',
                    outcome: value
                };
                let res = await this.submitTask(taskData);
                this.$emit('task-submited', res);
            }
            this.loadingActionTask = false;
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
            if (this.taskAction == 'submit') {
                await this.updateTask(taskData);
            }
            return new Promise(async (resolve, reject) => {
                try {
                    let taskId = self.taskInfo.action.parameter.taskId;
                    let result = await BPMNEngine.actionOnTask(
                        taskId,
                        taskData
                    );
                    self.$snotifySuccess(
                        self.$t('v2.myItem.taskCompleted')
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
        async updateTask(taskData) {
            let description;
            if (typeof this.descriptionTask == 'string') {
                description = JSON.parse(this.descriptionTask);
            } else {
                description = this.descriptionTask;
            }
            description.action.parameter.documentObjectId =
                taskData.variables[0].value;
            let taskId = taskData.variables[5].value;
            let data = {};
            data.description = JSON.stringify(description);
            return BPMNEngine.updateTask(taskId, data);
        },
        async handleTaskSubmited(data) {
            if (this.isInitInstance) {
                this.$emit('task-submited', data);
            } else {
                let elId = this.taskInfo.action.parameter.activityId;
                let docId = data.document_id;
                if (!docId) {
                    docId = this.taskInfo.action.parameter.documentId;
                }
                let varsForBackend = await getVarsFromSubmitedDoc(
                    data,
                    elId,
                    docId
                );
                let taskData = {
                    // action nhận 1 trong 4 giá trị: complete, claim, resolve, delegate
                    action: 'complete',
                    assignee: '1',
                    outcome: 'submit',
                    variables: varsForBackend.vars
                };
                let res = await this.submitTask(taskData);
                this.$emit('task-submited', res);
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

        // lấy data mới dựa theo data của task
        async changeTaskDetail() {
            if (!this.taskInfo.action) {
                return;
            }
            let varsMap = {};
            this.taskAction = this.taskInfo.action.action;
            if (this.taskAction == 'approval') {
                this.showApprovalOutcomes(
                    JSON.parse(this.taskInfo.approvalActions)
                );
            } else if (this.taskAction == 'submit') {
                this.taskActionBtns = [
                    {
                        text: this.$t('v2.myItem.submit'),
                        value: 'submit',
                        color: 'blue'
                    }
                ];
            } else if (this.taskAction == 'undefined') {
                this.taskActionBtns = [
                    {
                        text: this.$t('v2.myItem.complete'),
                        value: 'complete',
                        color: 'green'
                    }
                ];
            }
            this.changeTaskDetailInfo(this.taskInfo.action.parameter.taskId);
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
</style>

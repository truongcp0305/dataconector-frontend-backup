<template>
    <div class="h-100 w-100" style="position: relative">
        <preloader
            v-if="loadingAction"
            :style="{ height: 100 + '%' }"
            class="mx-auto"
        />
        <div
            class="list-task"
            style="height: 100%"
            v-else-if="filterObject == 1 && statusDetailWork == false"
        >
            <MyItemShowList :processInstanceId="workInfo.id"></MyItemShowList>
        </div>
        <div v-if="statusDetailWork">
            <workDetailSub
                :workId="idWorkSelected"
                :appName="workInfo.appName"
            />
        </div>
        <SideBarDetail
            style="top: 45px !important; height: calc(100% - 45px)"
            class="side-bar"
            :sidebarWidth="sidebarWidth"
            :isShowSidebar="isShowSidebar"
            v-if="isShowSidebar"
            :objSideBar="`work`"
            :workInfo="workInfo"
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
            :workInfo="workInfo"
            :definitionName="breadcrumb.definitionName"
            :showType="`work`"
        />
    </div>
</template>

<script>
import icon from '@/components/common/SymperIcon';
import BPMNEngine from '@/api/BPMNEngine.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import workDetailSub from './WorkDetailSub';
import SideBarDetail from './SideBarDetail';
import KHShowFile from '@/components/common/ImageDisplay.vue';
import { taskApi } from '@/api/task.js';
import PopupProcessTracking from '../PopupProcessTracking';
import MyItemShowList from '@/views/myItem/MyItemShowList.vue';
import {
    extractTaskInfoFromObject,
    addMoreInfoToTask
} from '@/components/process/processAction';
import infoUser from './../InfoUser';

export default {
    name: 'WorkDetail',
    props: {
        workInfo: {
            type: Object,
            default: () => {
                return {};
            }
        },
        isInitInstance: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        workInfo: {
            deep: true,
            immediate: true,
            handler(valueAfter) {
                this.changeWorkDetail();
            }
        },
        taskBreadcrumb: function () {
            this.getWidthHeaderWork();
        },
        'sapp.collapseSideBar': function (newVl) {
            this.getWidthHeaderWork();
        }
    },
    components: {
        icon: icon,
        VuePerfectScrollbar,
        workDetailSub,
        SideBarDetail,
        KHShowFile,
        PopupProcessTracking,
        infoUser,
        MyItemShowList
    },
    data: function () {
        return {
            widthInfoWork: 330,
            fileId: '',
            serverPath: '',
            name: '',
            type: '',
            sidebarWidth: 400,
            filterObject: 1,
            indexObj: null,
            indexSub: null,
            panel: [0, 1, 2, 3, 4],
            closeOnClick: true,
            appId: '',
            isShowSidebar: false,
            loadingAction: false,
            breadcrumb: {
                appName: '',
                definitionName: '',
                instanceName: '',
                name: ''
            },
            taskActionBtns: [
                {
                    text: 'Submit',
                    value: 'submit',
                    color: 'blue'
                }
            ],
            taskAction: undefined,
            tab: null,
            objectType: [
                {
                    title: 'Work',
                    icon: 'mdi-briefcase-check-outline'
                },
                {
                    title: 'Task',
                    icon: 'mdi-check-all'
                }
            ],
            processParent: {},
            listTaskCurrent: [],
            processSibling: [],
            processSub: [],
            statusDetailWork: false,
            idWorkSelected: null
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
            let bsr = this.breadcrumb.name;
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
        },
        listTaskComputed() {
            let self = this;
            let arrListTask = this.listTaskCurrent;
            arrListTask.forEach((task) => {
                task.taskData = self.getTaskData(task);
                task = addMoreInfoToTask(task);
            });
            return arrListTask;
        }
    },
    created() {},
    methods: {
        getWidthHeaderWork() {
            setTimeout(
                (self) => {
                    let width =
                        $('#taskHeader').width() -
                        $('#action-task').width() -
                        40;
                    self.widthInfoWork = width;
                },
                210,
                this
            );
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
        showPopupTracking() {
            this.$store.commit('task/setStatusPopupTracking', true);
        },
        toggleSidebar() {
            this.isShowSidebar = !this.isShowSidebar;
        },
        backToListWork() {
            this.statusDetailWork = false;
            this.setTaskBreadcrumb({}, '');
        },
        handleReachEndList() {},
        changeObjectType(index) {
            this.filterObject = index;
            this.statusDetailWork = false;
        },
        toggleSidebar() {
            this.isShowSidebar = !this.isShowSidebar;
        },
        onCopySuccess() {
            this.$snotify({
                type: 'success',
                title: this.$t('v2.myItem.copyToClipboard'),
                text: this.$t('v2.myItem.copySuccess')
            });
        },
        getTaskData(task) {
            let rsl = {
                content: '',
                extraLabel: '',
                extraValue: ''
            };
            try {
                let taskData = JSON.parse(task.description);
                if (taskData) {
                    rsl = taskData;
                }
            } catch (error) {
                rsl.content = task.description;
            }
            return rsl;
        },
        selectedWork(obj) {
            this.statusDetailWork = true;
            this.idWorkSelected = obj.id;
            this.setTaskBreadcrumb(obj, 'workDetail');
        },
        async setTaskBreadcrumb(processInstance = {}, isCheck = '') {
            if (isCheck == '') {
                // set for work
                this.breadcrumb.name = this.workInfo.name;
                this.breadcrumb.definitionName =
                    this.workInfo.processDefinitionName;
            } else {
                this.breadcrumb.name = processInstance.name;
                this.breadcrumb.definitionName =
                    processInstance.processDefinitionName;
            }
            this.breadcrumb.appName = this.workInfo.appName;
        },

        closeDetail() {
            this.$emit('close-detail', {});
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
        async changeWorkDetail() {
            let self = this;
            if (Object.keys(this.workInfo).length == 0) {
                return;
            }
            let processInstanceCurrent = self.workInfo.id;
            await self.getTaskCurrent(processInstanceCurrent); // get process parent
            if (
                self.workInfo.superProcessInstanceId &&
                self.workInfo.superProcessInstanceId != null
            ) {
                await self.getParentWork(self.workInfo.superProcessInstanceId);
                await self.getSiblingOrSubWork(
                    self.workInfo.superProcessInstanceId,
                    'siblingWork'
                );
            } else {
                self.processParent = [];
                self.processSibling = [];
            }
            await self.getSiblingOrSubWork(processInstanceCurrent, 'subWork');

            this.setTaskBreadcrumb();
        },
        async getParentWork(superProcessInstanceId) {
            let self = this;
            try {
                let filter = {};
                filter.processInstanceId = superProcessInstanceId;
                let res = await BPMNEngine.getProcessInstanceHistory(filter);
                self.processParent = res.data[0];
            } catch (error) {
                self.processParent = [];
                self.$snotifyError(
                    error,
                    this.$t('v2.myItem.getProcessParentFailed')
                );
            }
        },
        async getTaskCurrent(processInstanceId) {
            let self = this;
            try {
                let filter = {};
                filter.processInstanceId = processInstanceId;
                filter.sort = 'startTime';
                filter.order = 'desc';
                let res = await BPMNEngine.postTaskHistory(filter);
                if (res.total > 0) {
                    self.listTaskCurrent = res.data;
                } else {
                    self.listTaskCurrent = [];
                }
            } catch (error) {
                self.listTaskCurrent = [];
                self.$snotifyError(
                    error,
                    this.$t('v2.myItem.getProcessCurrentFailed')
                );
            }
        },
        async getSiblingOrSubWork(superProcessInstanceId, isCheck = '') {
            let self = this;
            if (isCheck != '') {
                try {
                    let filter = {};
                    filter.superProcessInstanceId = superProcessInstanceId;
                    let res = await BPMNEngine.getProcessInstanceHistory(
                        filter
                    );
                    if (isCheck == 'siblingWork') {
                        if (res.total > 0) {
                            self.processSibling = res.data;
                        } else {
                            self.processSibling = [];
                        }
                    } else if (isCheck == 'subWork') {
                        if (res.total > 0) {
                            self.processSub = res.data;
                        } else {
                            self.processSub = [];
                        }
                    }
                } catch (error) {
                    if (isCheck == 'siblingWork') {
                        self.processSibling = [];
                    } else {
                        self.processSub = [];
                    }
                    self.$snotifyError(
                        error,
                        this.$t('v2.myItem.getProcessSiblingFailed')
                    );
                }
            } else {
                self.processSibling = [];
                self.processSub = [];
            }
        }
    }
};
</script>

<style scoped>
.task-header {
    position: relative;
}
.task-header #action-task {
    position: absolute;
    right: 10px;
}
.v-tab {
    padding: 0px !important;
    border-width: 20px !important;
    text-transform: none !important;
}
.listWork >>> .v-expansion-panel-content__wrap {
    padding: 0px;
    padding-left: 15px;
}
.listWork >>> .v-expansion-panel::before {
    box-shadow: none !important;
}
.listWork >>> .v-expand-header {
    color: #ff8003;
    font-size: 13px;
    padding: 0px;
    padding-left: 15px;
    min-height: 30px;
}
.item-work {
    cursor: pointer;
}
.d-active {
    background: #f5f5f5;
}
.title-quytrinh {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box !important;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}
.col-4 {
    flex: 0 0 32.3333333333%;
    max-width: 32.3333333333%;
}
.user-create {
    flex: 0 0 17.6666666667%;
    max-width: 17.6666666667%;
    padding: 4px;
}
.col {
    padding: 4px;
}
</style>

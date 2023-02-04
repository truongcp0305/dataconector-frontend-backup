<template>
    <div class="list-objects h-100 w-100" style="overflow: hidden">
        <v-row class="mx-0 h-100 d-flex">
            <VueResizable
                ref="sidebar"
                :minWidth="sideBySideMode ? 250 : componentWidth"
                :active="sideBySideMode ? ['r'] : []"
                :width="sideBySideMode ? sidebarWidth : componentWidth"
                :maxWidth="sideBySideMode ? 500 : componentWidth"
                @resize:start="handleSidebarResizeStart"
                @resize:end="handleSidebarResizeEnd"
                @resize:move="handleSidebarResizing"
            >
                <div class="pa-0">
                    <listHeader
                        ref="listHeader"
                        :isSmallRow="isSmallRow"
                        :objectType="objectType"
                        :sideBySideMode="sideBySideMode"
                        :compackMode="compackMode"
                        :selectedFilterName="selectedFilterName"
                        :parentTaskId="filterFromParent.parentTaskId"
                        :changeStatusMoreApproval="changeStatusMoreApproval"
                        :totalObject="totalObject"
                        :listFilters="listFilters"
                        :showCloseBtn="showCloseBtn"
                        @change-density="isSmallRow = !isSmallRow"
                        @changeObjectType="changeObjectType"
                        @filter-change-value="handleChangeFilterValue"
                        @refresh-filter="handleRefreshFilter"
                        @add-filter-config="handleAddFilterConfig"
                        @config-filter-action="handleConfigFilterAction"
                        @select-filter="handleSelectFilter"
                        @create-task="getData({})"
                        @refresh-task-list="getData({})"
                        @goToPageApproval="goToPageApproval"
                        @complete-when-submit-toggle="handleExtraMenuItemToggle"
                        @close="closeMyItem"
                        @open-check-box="openCheckBox"
                        :disableAction="isShowNotFoundScreen"
                        :disableBoxSearch="disableActionOnFirstLoadWithNoData"
                    ></listHeader>
                    <hr
                        v-if="
                            !sideBySideMode &&
                            !disableActionOnFirstLoadWithNoData
                        "
                        role="separator"
                        class="v-divider theme--light"
                    />
                    <AddFilter
                        v-if="showAddFilter"
                        :filterName="filterName"
                        @add-filter="handleAddFilter"
                    />
                    <DeleteTasks
                        v-if="bottomSheet"
                        :task-id-length="taskId.length"
                        :total-object="totalObject"
                        :is-deleting="isDeleting"
                        @delete-tasks="deleteTasks"
                        @cancel-delete="cancelDeleteTasks"
                    />
                    <div class="h-100" v-if="!changeStatusMoreApproval">
                        <div
                            v-if="!disableActionOnFirstLoadWithNoData"
                            class="myitem-header-row-container"
                            ref="headerRowContainer"
                            @scroll.passive="handleHeaderScroll"
                        >
                            <HeaderRow
                                ref="headerRow"
                                :sideBySideMode="sideBySideMode"
                                :filteredColumns="filteredColumns"
                                :mappingWidth="mappingWidth"
                                :compackMode="compackMode"
                                :smallSize="smallSize"
                                :disableDrag="disableDrag"
                                :smallComponentMode="smallComponentMode"
                                :mapRealColWidth="mapRealColWidth[objectType]"
                                :objectType="objectType"
                                :open-check-box="openCheckbox"
                                @choose-all-tasks="chooseAllTasks"
                                @resize-end="handleResizeEnd"
                                @on-column-filter="showFilterColumn"
                            />
                        </div>
                        <hr role="separator" class="v-divider theme--light" />

                        <div
                            @scroll="handleScrollX"
                            ref="taskListContainer"
                            v-if="!loadingTaskList"
                            :style="{
                                height: listTasksHeight + 'px',
                                overflow: 'auto'
                            }"
                        >
                            <NotFoundScreen
                                :changeWidth="changeWidth"
                                :emptyDataKey="emptyDataKey"
                                v-if="
                                    (data.length == 0 && objectType != 2) ||
                                    (listAllDocumentObjectId.length == 0 &&
                                        objectType == 2)
                                "
                                class="width-not-found-screen"
                            />
                            <div v-if="objectType == 0 || objectType == 1">
                                <div
                                    v-for="(group, idex) in groupFlatTasks"
                                    :key="idex"
                                >
                                    <div
                                        :class="{
                                            'mr-0 ml-0 single-row time-group-task': true,
                                            'py-0': isSmallRow
                                        }"
                                        :style="{
                                            minHeight: '30px'
                                        }"
                                    >
                                        <span
                                            style="
                                                color: #ff8003;
                                                font-size: 13px;
                                                margin-left: 16px;
                                                margin-top: 6px;
                                                height: 100%;
                                                display: inline-block;
                                            "
                                            >{{ group.fromNow }}</span
                                        >
                                    </div>
                                    <div
                                        v-for="(task, idx) in group.tasks"
                                        :key="idx"
                                        :index="task.id"
                                        :class="{
                                            'mr-0 ml-0 single-row': true,
                                            'py-0': isSmallRow,
                                            'd-active':
                                                index == idx &&
                                                dataIndex == idex
                                        }"
                                        :style="{
                                            minHeight: '50px',
                                            'border-bottom':
                                                '1px solid #eeeeee!important',
                                            width: sideBySideMode
                                                ? '100%'
                                                : 'fit-content'
                                        }"
                                        @click="selectObject(task, idx, idex)"
                                    >
                                        <TableItemRow
                                            ref="tableItemRow"
                                            :obj="task"
                                            :smallSize="smallSize"
                                            :objectType="objectType"
                                            :commentCountPerTask="
                                                commentCountPerTask
                                            "
                                            :mapRealColWidth="
                                                mapRealColWidth[objectType]
                                            "
                                            :fileCountPerTask="fileCountPerTask"
                                            :sideBySideMode="sideBySideMode"
                                            :smallComponentMode="
                                                smallComponentMode
                                            "
                                            :compackMode="compackMode"
                                            :open-check-box="openCheckbox"
                                            @check-box-change="
                                                handlerChangeCheckbox
                                            "
                                        />
                                    </div>
                                </div>
                            </div>
                            <div v-else>
                                <div
                                    class="single-row"
                                    :class="{
                                        'd-active': index == idx
                                    }"
                                    v-for="(
                                        obj, idx
                                    ) in listAllDocumentObjectId"
                                    :key="idx"
                                    @click="selectObject(obj, idx)"
                                >
                                    <TableItemRow
                                        :obj="obj"
                                        ref="tableItemRow"
                                        :objectType="objectType"
                                        :commentCountPerTask="
                                            commentCountPerTask
                                        "
                                        :mapRealColWidth="
                                            mapRealColWidth[objectType]
                                        "
                                        :smallSize="smallSize"
                                        :mappingWidth="mappingWidth"
                                        :fileCountPerTask="fileCountPerTask"
                                        :sideBySideMode="sideBySideMode"
                                        :smallComponentMode="smallComponentMode"
                                        :compackMode="compackMode"
                                    />
                                </div>
                            </div>
                        </div>
                        <preloader
                            v-else
                            :style="{
                                height: listTaskHeight - 30 + 'px!important'
                            }"
                            class="mx-auto"
                        />
                        <hr role="separator" class="v-divider theme--light" />
                        <Pagination
                            @on-change-page="getListByPage"
                            @on-change-page-size="getListByPage"
                            :totalVisible="sideBySideMode ? 3 : 7"
                            :showRange="!sideBySideMode"
                            :contentSize="'mini'"
                            class="mt-2 px-4"
                            :total="totalObject"
                        />
                    </div>
                    <div v-else>
                        <listTaskApproval
                            :changeStatusMoreApproval="changeStatusMoreApproval"
                        />
                    </div>
                </div>
            </VueResizable>
            <div
                v-if="sideBySideMode"
                class="pa-0 ma-0 h-100"
                style="border-left: 1px solid #e0e0e0"
                :style="{ width: 'calc(100% - ' + sidebarWidth + 'px)' }"
            >
                <detail-task
                    ref="detailTask"
                    v-if="objectType == 0 && showTaskDetail"
                    :parentHeight="listTaskHeight"
                    :currentTask="currentTask"
                    :completeWhenSubmit="completeWhenSubmit"
                    :taskInfo="selectedTask.taskInfo"
                    @re-select-object="reSelectObject"
                    @close-sbs-and-reload="handleCloseSbsAndReload"
                    @re-select-first-object="reSelectFirstObject"
                    :originData="selectedTask.originData"
                    :appId="String(selectedTask.originData.symperApplicationId)"
                    :reload="false"
                    @change-info-task="changeInfoTask"
                    @close-detail="closeDetail"
                    @reload-detail="handleReloadDetail"
                    @task-submited="handleTaskSubmited"
                    @refresh-list-task="refreshListTaskByDebounce"
                    @changeUpdateAsignee="changeUpdateAsignee"
                    :isPopUp="isPopUp"
                ></detail-task>
                <workDetail
                    v-else-if="objectType == 1"
                    class="workDetail"
                    :parentHeight="listTaskHeight"
                    :workInfo="selectedWork.workInfo"
                    @close-detail="closeDetail"
                ></workDetail>
                <v-row
                    v-if="objectType == 2"
                    class="ma-0 justify-space-between"
                    style="
                        line-height: 36px;
                        border-bottom: 1px solid #dedede;
                        display: flex;
                    "
                >
                    <div class="fs-13 pl-2 pt-1 float-left">
                        {{ titleDocument }}
                    </div>
                    <div
                        class="text-right pt-1 pb-1 pr-0"
                        style="margin-left: auto; margin-right: 12px"
                    >
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-on="on"
                                    small
                                    text
                                    @click="sideBySideMode = !sideBySideMode"
                                >
                                    <v-icon small>mdi-close</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('common.back') }}</span>
                        </v-tooltip>
                    </div>
                </v-row>
                <detailDocument
                    v-if="objectType == 2"
                    class="detail-doc"
                    :showCommentInDoc="true"
                    :docObjInfo="docObjInfo"
                />
            </div>
        </v-row>
        <table-filter
            ref="tableFilter"
            :columnFilter="columnFilter()"
            :currentColumn="currentColumn"
            @apply-filter-value="applyFilter"
            :customGetDataForFilter="customGetDataForFilter"
            :height="400"
            @search-autocomplete-items="searchAutocompleteItems"
        ></table-filter>
        <SymperDialogConfirm
            @confirm="confirmDeleteFilter"
            @cancel="showDelPopUp = false"
            :title="$t('v2.myItem.delete')"
            :content="contentDelete"
            :showDialog="showDelPopUp"
        />
        <SymperConfirm ref="symperConfirm" @confirm="confirmDeleteTask" />
    </div>
</template>

<script>
import icon from '@/components/common/SymperIcon';
import DetailTask from '@/components/myItem/DetailTask';
import workDetail from '@/components/myItem/work/WorkDetail';
import detailDocument from '@/views/document/detail/Detail';
import listHeader from '@/components/myItem/ListHeader';
import { util } from '@/plugins/util';
import { appConfigs } from '@/configs';
import listTaskApproval from '@/components/myItem/featureApproval/List';
import Preloader from '@/components/common/Preloader';
import {
    getDefaultFilterConfig,
    customConditionsForFilter
} from '@/components/common/customTable/defaultFilterConfig.js';
import TableFilter from '@/components/common/customTable/TableFilter.vue';
import Pagination from '@/components/common/Pagination.vue';
import AddFilter from '@/components/common/ListItemAddFilter';
import DeleteTasks from '@/components/common/ListItemConfirmDeleteTasks.vue';
import ListTaskMyItemWorker from 'worker-loader!@/worker/myItem/ListTaskMyItem.Worker.js';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
import HeaderRow from '@/components/myItem/showList/HeaderRow';
import TableItemRow from '@/components/myItem/showList/TableItemRow';
import { taskApi } from '@/api/task';
import { userApi } from '@/api/user';
import { uiConfigApi } from '@/api/uiConfig';
import VueResizable from 'vue-resizable';
import {
    extractTaskInfoFromObject,
    addMoreInfoToTask
} from '@/components/process/processAction';
import SymperConfirm from '@/components/common/SymperConfirm';
import myItemWorker from 'worker-loader!@/worker/myItem/myItem.Worker.js';
import NotFoundScreen from '@/components/common/NotFoundScreen';
import _cloneDeep from 'lodash/cloneDeep';
export default {
    computed: {
        changeWidth() {
            $(window).on('load resize', function () {
                $('.width-not-found-screen').width($(this).width());
            });
        },
        fileCountPerTask() {
            return this.$store.state.file.fileCountPerObj.list;
        },
        windowWidth() {
            return window.innerWidth;
        },
        stask() {
            return this.$store.state.task;
        },
        sapp() {
            return this.$store.state.app;
        },
        wrapperTag() {
            return this.sideBySideMode ? 'div' : 'v-col';
        },
        listAllDocumentObjectId() {
            let listObjRelated = this.stask.listDocumentObjId;
            let listObjUserSubmit = this.stask.listDocumentObjIdWithUserSubmit;
            let arrDocument = listObjRelated.concat(listObjUserSubmit);
            let mapIdToDocObj = {};
            let rsl = [];
            arrDocument.forEach((element) => {
                if (!mapIdToDocObj[element.id]) {
                    mapIdToDocObj[element.id] = true;
                    if (element.userCreate && element.userCreate != null) {
                        let arrUser = this.sapp.allUsers;
                        let user = arrUser.find(
                            (data) => data.email === element.userCreate
                        );
                        if (user) {
                            element.displayName = user.displayName;
                            element.userId = user.id;
                        } else {
                            element.displayName = '';
                        }
                    } else {
                        element.displayName = '';
                    }
                    rsl.push(element);
                }
            });
            rsl.sort(function (a, b) {
                var keyA = new Date(a.createAt),
                    keyB = new Date(b.createAt);
                if (keyA > keyB) return -1;
                if (keyA < keyB) return 1;
                return 0;
            });
            return rsl;
        },
        getDataUrl() {
            let type = '';
            if (this.objectType == 0) {
                type = 'tasks';
            } else if (this.objectType == 1) {
                type = 'works';
            }
            this.setKeyforNotFoundScreen();
            return appConfigs.apiDomain.workflowExtend + type;
        },
        commentCountPerTask() {
            return this.$store.state.comment.commentCountPerObj.list;
        },
        groupFlatTasks() {
            let allTask = this.data;
            if (allTask.length > 0) {
                let allUserById = this.$store.getters['app/mapIdToUser'];
                let self = this;
                const groups = allTask.reduce((groups, task) => {
                    if (task.startUserId) {
                        let roleInfo = {};
                        let userIdStart = task.startUserId;
                        if (userIdStart.indexOf(':') > 0) {
                            //check là userId hay userId:role
                            let arrDataUserIden = userIdStart.split(':');
                            userIdStart = arrDataUserIden[0];
                            if (arrDataUserIden.length > 3) {
                                // loại trừ trường hợp role=0
                                let roleIdentify = task.startUserId.slice(
                                    userIdStart.length + 1
                                );
                                roleInfo = self.getRoleUser(roleIdentify);
                            }
                        }
                        task.startUserId = userIdStart;
                        task.startUserName = allUserById[task.startUserId]
                            ? allUserById[task.startUserId].displayName
                            : '';
                        task.roleInfo = roleInfo;
                    }
                    let appName = '';
                    if (task.symperApplicationId) {
                        let allApp = this.$store.state.task.allAppActive;
                        let app = allApp.find(
                            (element) => element.id == task.symperApplicationId
                        );
                        if (app) {
                            appName = app.name;
                        }
                    }
                    task.symperApplicationName = appName;
                    let date;
                    if (task.createTime && this.objectType == 0) {
                        date = task.createTime;
                    }
                    if (task.startTime && this.objectType == 1) {
                        date = task.startTime;
                    }
                    let fromNow = this.getDateFormNow(date);
                    if (!groups[fromNow]) {
                        groups[fromNow] = [];
                    }
                    groups[fromNow].push(task);
                    return groups;
                }, {});
                const groupArraysTask = Object.keys(groups).map((fromNow) => {
                    return {
                        fromNow,
                        tasks: groups[fromNow]
                    };
                });
                return groupArraysTask;
            } else {
                return {};
            }
        },
        stask() {
            return this.$store.state.task;
        },
        sapp() {
            return this.$store.state.app;
        },
        currentColumn() {
            return this.tableFilter[this.objectType].currentColumn.name;
        },
        collapseSidebar() {
            return this.$store.state.app.collapseSideBar;
        },
        taskIdLength() {
            return this.taskId.length;
        },
        isShowNotFoundScreen() {
            return (
                (this.data.length == 0 && this.objectType != 2) ||
                (this.listAllDocumentObjectId.length == 0 &&
                    this.objectType == 2)
            );
        },
        disableActionOnFirstLoadWithNoData() {
            return (
                ((this.data.length == 0 && this.objectType != 2) ||
                    (this.listAllDocumentObjectId.length == 0 &&
                        this.objectType == 2)) &&
                (this.timeGetData == 1 || this.timeGetData == 0)
            );
        }
    },
    watch: {
        taskIdLength(val) {
            if (val == 0) {
                this.listTasksHeight = this.getListTaskHeight() + 20;
                this.bottomSheet = false;
            } else if (val > 0) {
                this.listTasksHeight = this.getListTaskHeight() - 20;
                this.bottomSheet = true;
            }
        },
        totalObject(val) {
            for (let i = 1; i <= Math.ceil(val / this.pageSize); i++) {
                let k = {
                    page: i,
                    isChecked: false
                };
                this.checkedAllTaskArray.push(k);
            }
        },
        collapseSidebar() {
            setTimeout(
                (self) => {
                    self.setComponentWidth();
                },
                500,
                this
            );
        },
        sideBySideMode(val) {
            if (!val) {
                this.currentTask = {};
                this.index = -1;
                this.dataIndex = -1;
            }
            this.setComponentWidth();
            this.setNameColWidth();
        },
        'stask.isStatusSubmit': function (newVl) {
            if (newVl == true) {
                this.getData();
                this.$store.commit('task/setIsStatusSubmit', false);
            }
        },
        groupFlatTasks: {
            deep: true,
            immediate: true,
            handler(arr) {
                this.checkAndGoToWorkDetail(arr);
            }
        },
        getDataUrl() {
            if (!this.preventGetDataWhenChangeObjectType) {
                this.getData();
            }
            this.preventGetDataWhenChangeObjectType = false;
        }
    },
    name: 'listTask',
    components: {
        DeleteTasks,
        icon: icon,
        DetailTask,
        workDetail,
        listHeader: listHeader,
        detailDocument,
        SymperDialogConfirm,
        VueResizable,
        HeaderRow,
        TableItemRow,
        listTaskApproval,
        TableFilter,
        Pagination,
        AddFilter,
        Preloader,
        SymperConfirm,
        NotFoundScreen
    },
    props: {
        isPopUp: {
            type: Boolean,
            default: false
        },
        selectFirstTaskAfterGetList: {
            type: String,
            default: ''
        },
        showCloseBtn: {
            type: Boolean,
            default: false
        },
        compackMode: {
            type: Boolean,
            default: false
        },

        height: {
            type: String,
            default: 'calc(100vh - 120px)'
        },
        // component này có ở chế độ là component con của một component khác hay ko, false nếu component này là view
        smallComponentMode: {
            type: Boolean,
            default: false
        },
        filterFromParent: {
            type: Object,
            default() {
                return {};
            }
        },
        filterTaskAction: {
            type: String,
            default: 'getList'
        },
        /**
         * Dữ liệu mặc định cho table
         */
        defaultData: {
            type: Object,
            default() {
                return {
                    listObject: {},
                    columns: {},
                    total: 0
                };
            }
        },
        /**
         * Dùng Trong trường hợp mà gọi đến một API mà không thể thay đổi định dạng trả về của API đó  theo đúng với định dạng chung của ListItem
         * định dạng:
         * {
         *     reformatData(res){} // Lấy ra các cột cần hiển thị
         * }
         **/
        customAPIResult: {
            type: Object,
            default() {
                return {};
            }
        },
        conditionByFormula: {
            type: String
        },
        processInstanceId: {
            type: String
        }
    },
    data: function () {
        let self = this;
        return {
            checkedAllTaskArray: [],
            listTasksHeight: '',
            isDeleting: false,
            taskId: [],
            bottomSheet: false,
            debounceGetData: null,
            docObjInfo: {
                docObjId: 0
            },
            titleDocument: '',
            showAddFilter: false,
            contentDelete: '',
            listFilters: [],
            data: [],
            lazyLoad: false,
            filterName: '',
            showDelPopUp: false,
            customGetDataForFilter: {
                async statusText(colFilter) {
                    let statusTextData = [
                        {
                            label: self.$t('v2.myItem.unComplete'),
                            value: 'assign'
                        },
                        {
                            label: self.$t('v2.myItem.complete'),
                            value: 'complete'
                        }
                    ];
                    if (colFilter.searchKey != '') {
                        statusTextData = statusTextData.filter((e) => {
                            let value = colFilter.searchKey.toLowerCase();
                            return (
                                e.label.toLowerCase().includes(value) ||
                                e.value.toLowerCase().includes(value)
                            );
                        });
                    }
                    return statusTextData;
                },
                async assignee(colFilter) {
                    let userData = await self.getListUser(colFilter.searchKey);
                    return userData;
                },
                async owner(colFilter) {
                    let userData = await self.getListUser(colFilter.searchKey);
                    return userData;
                }
            },
            getListUser: async function (searchKey) {
                let userData = [];
                let listUser = await userApi.getListUser(1, 50, searchKey);
                if (
                    listUser.status == 200 &&
                    listUser.data.listObject.length > 0
                ) {
                    listUser.data.listObject.forEach(function (k) {
                        let obj = {
                            label: k.displayName,
                            value: k.id
                        };
                        userData.push(obj);
                    });
                }
                return userData;
            },
            smallSize: false,
            filterIdx: 0,
            objectType: 0,
            completeWhenSubmit: true,
            listTaskIds: [],
            isDrangging: false,
            sidebarWidth: 400,
            page: 1, // trang hiện tại
            pageSize: 50,
            disableDrag: false,
            searchKey: '', //Từ khóa cần tìm kiếm trên tất cả các cột,
            totalObject: 0, // Tổng số trang của danh sách này
            myOwnFilter: {
                pageSize: 50,
                page: 1
            },
            componentWidth: 0,
            mapRealColWidth: {
                0: {},
                1: {},
                2: {}
            },
            mappingWidth: {
                0: {},
                1: {},
                2: {}
            },
            tableFilter: {
                0: {
                    allColumn: {
                        // cấu hình filter của tất cả các cột trong bảng này dạng {tên cột : cấu hình filter}
                    },
                    currentColumn: {
                        colFilter: getDefaultFilterConfig(),
                        name: ''
                    }
                },
                1: {
                    allColumn: {
                        // cấu hình filter của tất cả các cột trong bảng này dạng {tên cột : cấu hình filter}
                    },
                    currentColumn: {
                        colFilter: getDefaultFilterConfig(),
                        name: ''
                    }
                },
                2: {
                    allColumn: {
                        // cấu hình filter của tất cả các cột trong bảng này dạng {tên cột : cấu hình filter}
                    },
                    currentColumn: {
                        colFilter: getDefaultFilterConfig(),
                        name: ''
                    }
                }
                // cấu hình filter của danh sách này
            },
            filteredColumns: {}, // tên các cột đã có filter, dạng {tên cột : true},
            currentTask: {},
            showTaskDetail: false,
            selectedWork: {
                workInfo: {},
                idx: -1
            },
            /**
             * Thêm điều kiện để quy vấn qua api
             */
            tableColumns: [],
            listTaskMyItemWorker: null,
            index: -1,
            dataIndex: -1,
            changeStatusMoreApproval: false,
            isUpdateFilter: false,
            loadingTaskList: true,
            listTaskHeight: 300,
            selectedTask: {
                taskInfo: {},
                idx: -1,
                originData: {}
            },
            isSmallRow: false,
            sideBySideMode: false,
            selectedFilterName: '',
            widthColMapping: {
                0: {
                    type: 0.3,
                    name: 3,
                    startDate: 1,
                    assignee: 2,
                    owner: 1.7,
                    dueDate: 1.3,
                    processDefinitionName: 1.3,
                    statusText: 1
                },
                1: {
                    name: 5,
                    timeCreate: 2,
                    userCreate: 2,
                    processDefinitionName: 2.5,
                    status: 1
                },
                2: {
                    name: 3,
                    timeCreate: 3,
                    userCreate: 3,
                    processDefinitionName: 3
                }
            },
            openCheckbox: false,
            emptyDataKey: 'no-data',
            timeGetData: 0
        };
    },
    created() {
        this.preventGetDataWhenChangeObjectType = true;
        this.calcDefaultColWidth();
        let self = this;
        this.listTaskMyItemWorker = new ListTaskMyItemWorker();
        this.listenWorkerMessage();
        this.restoreUiConfig();
        this.$store
            .dispatch('process/getAllDefinitions')
            .then((res) => {})
            .catch((err) => {});
        this.$evtBus.$on('symper-update-task-assignment', (updatedTask) => {
            updatedTask.taskData = self.getTaskData(updatedTask);
            self.selectObject(updatedTask, self.selectedTask.idx);
            self.$set(self.data, self.selectedTask.idx, updatedTask);
        });
        this.$evtBus.$on('comment-change', () => {
            if (self.$el.isConnected) {
                self.getAttackmentComment();
            }
        });
        if (
            this.$route.meta &&
            this.$route.meta.sRouteName == 'ListWorkOfAWorkflow'
        ) {
            this.$set(this, 'objectType', 1);
        }
        if (this.$route.params.type == 'work') {
            this.objectType = 1;
        }
        this.$evtBus.$on('caculated-myitem-width', (data) => {
            self.reCaculatedStyle(data.componentWidth);
        });
        if (this.$route.path.includes('my-application')) {
            this.smallSize = true;
        }
    },
    mounted() {
        let self = this;
        self.reCalcListTaskHeight();
        this.$evtBus.$on('app-receive-remote-msg', (payload) => {
            if (!self._inactive) {
                self.refreshListTaskByDebounce();
            }
        });
        this.setComponentWidth();
        this.myItemWorkerInstance = new myItemWorker();
        this.listenFromWorker();
        this.listTasksHeight = this.getListTaskHeight();
    },
    methods: {
        cancelDeleteTasks() {
            this.$refs.listHeader.openCheckbox = false;
        },
        confirmDeleteTask() {
            this.isDeleting = true;
            this.myItemWorkerInstance.postMessage({
                action: 'deleteTasks',
                data: this.taskId
            });
        },
        handleDeleteTasks() {
            this.isDeleting = false;
            this.taskId.length = 0;
            this.bottomSheet = false;
            this.listTasksHeight = this.getListTaskHeight() + 20;
            this.$refs.listHeader.openCheckbox = false;
            this.$snotifySuccess('', this.$t('v2.myItem.deleteSuccess'));
            if (this.$route.fullPath.includes('/myitem/tasks/')) {
                this.$goToPage('/myitem', this.$t('process.taskList'));
            } else {
                this.handleCloseSbsAndReload();
            }
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
        deleteTasks() {
            this.$refs.symperConfirm.show(
                this.$t('common.remove_confirm_title'),
                this.$t('common.remove_confirm_message', {
                    count: this.taskId.length
                })
            );
        },
        chooseAllTasks(val, isAllTasks = false) {
            if (!val && isAllTasks) {
                this.taskId.length = 0;
            }
            this.$refs.tableItemRow.forEach((e) => {
                if ((e.openCheckBox || !val) && e.haveCheckBox) {
                    e.checkbox = val;
                }
            });
            for (let i = 0; i < this.checkedAllTaskArray.length; i++) {
                if (this.checkedAllTaskArray[i].page == this.page) {
                    this.checkedAllTaskArray[i].isChecked = val;
                    break;
                }
            }
        },
        handlerChangeCheckbox(data) {
            if (data.isChosen) {
                let isExisted = false;
                if (this.taskId.length > 0) {
                    for (let i = 0; i < this.taskId.length; i++) {
                        if (data.task.id == this.taskId[i].task.id) {
                            return;
                        }
                    }
                }
                let k = {
                    page: this.page,
                    task: data.task
                };
                this.taskId.push(k);
            } else {
                let k = this.taskId.filter(
                    (value) => value.task.id != data.task.id
                );
                this.taskId = k;
                if (this.$refs.headerRow.checkbox) {
                    this.$refs.headerRow.isCheckBox = true;
                    this.$refs.headerRow.checkbox = false;
                    for (let i = 0; i < this.checkedAllTaskArray.length; i++) {
                        if (this.checkedAllTaskArray[i].page == this.page) {
                            this.checkedAllTaskArray[i].isChecked = false;
                            break;
                        }
                    }
                }
            }
        },
        openCheckBox(val) {
            this.openCheckbox = val;
            if (!val) {
                this.chooseAllTasks(false, true);
                this.$refs.headerRow.checkbox = false;
                for (let i = 0; i < this.checkedAllTaskArray.length; i++) {
                    this.checkedAllTaskArray[i].isChecked = false;
                }
            }
        },
        closeMyItem() {
            this.$emit('close');
        },
        convertTime(time) {
            return this.$moment(time).lang(this.$i18n.locale).fromNow();
        },
        replaceTime(time) {
            return time;
        },
        getListTaskHeight() {
            let h = this.sideBySideMode
                ? this.listTaskHeight + 20
                : this.listTaskHeight;
            return this.groupFlatTasks.length ? h : h + 20;
        },
        refreshListTaskByDebounce() {
            if (this.debounceGetData2) {
                clearTimeout(this.debounceGetData2);
            }
            let self = this;
            this.debounceGetData2 = setTimeout(() => {
                self.getData(false, false, true, true, false);
            }, 1000);
        },
        checkAndGoToWorkDetail(arr) {
            let self = this;
            if (arr.length > 0) {
                if (
                    this.$route.params.type == 'work' &&
                    this.$route.params.processInstanceId
                ) {
                    for (let i in self.groupFlatTasks) {
                        self.groupFlatTasks[i].tasks.forEach(function (e) {
                            if (e.id == self.$route.params.processInstanceId) {
                                self.selectWork(e, i, i);
                            }
                        });
                    }
                }
            }
        },
        handleScrollX(evt) {
            this.$refs.headerRowContainer.scrollLeft =
                this.$refs.taskListContainer.scrollLeft;
            this.prevScrollTop = this.$refs.taskListContainer.scrollTop;
        },
        handleHeaderScroll() {
            this.$refs.taskListContainer.scrollLeft =
                this.$refs.headerRowContainer.scrollLeft;
        },
        reCaculatedStyle(componentWidth = false) {
            this.componentWidth = componentWidth
                ? componentWidth
                : util.getComponentSize(this.$el.parentElement).w;
            this.calcDefaultColWidth();
        },
        getRoleUser(roleIdentify) {
            let arrDataRole = roleIdentify.split(':');
            let allSymperRole = this.$store.state.app.allSymperRoles;
            if (allSymperRole[arrDataRole[0]]) {
                let role = allSymperRole[arrDataRole[0]].find(
                    (element) => element.roleIdentify === roleIdentify
                );
                return role;
            } else {
                return {};
            }
        },
        confirmDeleteFilter() {
            let filter = this.listFilters.filter(
                (item, idx) => idx != this.deleteFilterIdx
            );
            this.listFilters = filter;
            this.saveUiConfig();
            this.showDelPopUp = false;
        },
        restoreUiConfig() {
            let widgetIdentifier = this.getWidgetIdentifier();
            let widgetIdentifierExtraConfig =
                this.getWidgetIdentifier() + ':extra-config';
            this.listTaskMyItemWorker.postMessage({
                action: 'restoreUiConfig',
                data: {
                    widgetIdentifier: widgetIdentifier,
                    widgetIdentifierExtraConfig: widgetIdentifierExtraConfig
                }
            });
        },
        handleRestoreUiConfig(data) {
            let self = this;
            let res = data.res;
            let resExtraConfig = data.resExtraConfig;
            if (resExtraConfig.status == 200) {
                let extraConfig = JSON.parse(resExtraConfig.data.detail);
                self.objectType = extraConfig.objectType
                    ? extraConfig.objectType
                    : 0;
                self.preventGetDataWhenChangeObjectType = true;
                if (extraConfig.mapRealColWidth) {
                    for (let key in extraConfig.mapRealColWidth) {
                        if (
                            !$.isEmptyObject(extraConfig.mapRealColWidth[key])
                        ) {
                            self.mapRealColWidth[key] =
                                extraConfig.mapRealColWidth[key];
                        }
                    }
                }
                if (extraConfig.sidebarWidth) {
                    self.sidebarWidth =
                        extraConfig.sidebarWidth > 400
                            ? 400
                            : extraConfig.sidebarWidth;
                }
                self.completeWhenSubmit = extraConfig.hasOwnProperty(
                    'completeWhenSubmit'
                )
                    ? extraConfig.completeWhenSubmit
                    : true;
            }
            this.$refs.listHeader.setValueCompleteWhenSubmit(
                self.completeWhenSubmit
            );
            if (res.status == 200) {
                let configs = JSON.parse(res.data.detail);
                this.listFilters = configs.filter;
            }
            let defaultFilter = this.listFilters.filter((e) => {
                return e.isDefault == 1;
            });
            if (defaultFilter.length && this.objectType == 0) {
                self.selectedFilterName = defaultFilter[0].name;
                self.tableFilter[self.objectType].allColumn =
                    defaultFilter[0].columns;
            }
            self.getData();
        },
        listenWorkerMessage() {
            let self = this;
            this.listTaskMyItemWorker.addEventListener(
                'message',
                function (event) {
                    let data = event.data;
                    if (data.action == 'handleGetData') {
                        self.$emit('get-doc-related-success', data.data.data);
                    }
                    let action = data.action;
                    if (self[action]) {
                        self[action](data.data);
                    } else {
                        console.error(` action ${action} not found `);
                    }
                }
            );
        },
        getListByPage(data) {
            this.page = data.page;
            this.pageSize = data.pageSize;
            this.getData();
        },
        columnFilter() {
            if (
                this.tableFilter[this.objectType].currentColumn.name == 'isDone'
            ) {
                if (
                    this.tableFilter[this.objectType].currentColumn.colFilter
                        .selectItems.length > 0
                ) {
                    let items =
                        this.tableFilter[this.objectType].currentColumn
                            .colFilter.selectItems;
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].value == 1) {
                            this.tableFilter[
                                this.objectType
                            ].currentColumn.colFilter.selectItems[i].label =
                                this.$t('common.done');
                        } else if (items[i].value == 0) {
                            this.tableFilter[
                                this.objectType
                            ].currentColumn.colFilter.selectItems[i].label =
                                this.$t('myItem.unfinished');
                        }
                    }
                }
            }
            return this.tableFilter[this.objectType].currentColumn.colFilter;
        },
        checkIsAddFilter() {
            if (!this.isUpdateFilter) {
                this.listFilters.push({
                    name: this.filterName,
                    searchKey: this.searchKey,
                    isDefault: false,
                    columns: this.tableFilter[this.objectType].allColumn
                });
                this.handleSelectFilter(this.listFilters.length - 1);
            } else {
                this.listFilters[this.filterIdx].name = this.filterName;
                this.listFilters[this.filterIdx].searchKey = this.searchKey;
                this.listFilters[this.filterIdx].columns =
                    this.tableFilter[this.objectType].allColumn;
            }
            this.isNotiSuccess = true;
        },

        /**
         * Kiểm tra xem một cột trong table có đang áp dụng filter hay ko
         */
        checkColumnHasFilter(colName, filter = false) {
            if (!filter) {
                filter = this.tableFilter[this.objectType].allColumn[colName];
            }
            if (!filter) {
                return false;
            } else {
                if (
                    filter.sort == '' &&
                    $.isEmptyObject(filter.valuesIn) &&
                    $.isEmptyObject(filter.valuesNotIn) &&
                    filter.conditionFilter.items[0].type == 'none' &&
                    filter.searchKey == ''
                ) {
                    return false;
                } else {
                    return true;
                }
            }
        },
        /**
         * Thực hiện filter khi người dùng click vào nút apply của filter
         */
        applyFilter(filter, source = 'filter') {
            this.page = 1; // gán lại page=1 để reset data
            if (this.tableFilter[this.objectType].allColumn.createTime) {
                delete this.tableFilter[this.objectType].allColumn.createTime;
            }
            if (this.tableFilter[this.objectType].allColumn.startTime) {
                delete this.tableFilter[this.objectType].allColumn.startTime;
            }
            let colName = this.tableFilter[this.objectType].currentColumn.name;
            this.$set(
                this.tableFilter[this.objectType].allColumn,
                colName,
                filter
            );
            if (source == 'clear-filter') {
                delete this.tableFilter[this.objectType].allColumn[colName];
            }
            this.addDeffaultFilter();
            let hasFilter = this.checkColumnHasFilter(colName, filter);
            this.$set(this.filteredColumns, colName, hasFilter);
            let icon = $(this.$el).find(
                '.symper-table-dropdown-button[col-name=' + colName + ']'
            );
            this.getData(false, false, true);
            if (hasFilter && source != 'clear-filter') {
                icon.addClass('applied-filter');
            } else {
                this.$delete(
                    this.tableFilter[this.objectType].allColumn,
                    colName
                );
                icon.removeClass('applied-filter');
            }
        },
        calcDefaultColWidth() {
            if (!$.isEmptyObject(this.mapRealColWidth[this.objectType])) {
                return;
            }
            let mappingObject =
                Object.keys(this.mappingWidth[this.objectType]).length > 0
                    ? this.mappingWidth[this.objectType]
                    : this.widthColMapping[this.objectType];
            for (let colKey in mappingObject) {
                this.$set(
                    this.mapRealColWidth[this.objectType],
                    colKey,
                    this.caculatorWidth(colKey, mappingObject)
                );
            }
        },
        caculatorWidth(key, mappingObject = null) {
            let unitWidth = window.innerWidth / 12;
            let width = unitWidth * mappingObject[key];
            return width + 'px';
        },
        handleResizeEnd() {
            this.saveExtraConfig();
        },
        setComponentWidth() {
            this.componentWidth =
                util.getComponentSize(this.$el.parentElement).w - 60;
        },
        showFilterColumn(event, colName) {
            let x = event.clientX;
            let y = event.clientY;
            var windowWidth = $(window).width() / 1.1;
            if (event.clientX > windowWidth) {
                x -= 210;
            }
            event.preventDefault();
            event.stopPropagation();
            let filterDom = $(this.$refs.tableFilter.$el);
            filterDom.css('left', x + 'px').css('top', y + 20 + 'px');
            this.$refs.tableFilter.show();
            let colFilter =
                this.tableFilter[this.objectType].allColumn[colName];
            if (!colFilter) {
                colFilter = getDefaultFilterConfig();
                this.$set(
                    this.tableFilter[this.objectType].allColumn,
                    colName,
                    colFilter
                );
            }

            this.$set(this.tableFilter[this.objectType], 'currentColumn', {
                name: colName,
                colFilter: colFilter
            });
            this.getItemForValueFilter();
        },
        /**
         * Lấy các item phục vụ cho việc lựa chọn trong autocomplete cuar filter
         */
        async getItemForValueFilter() {
            let self = this;
            let columns = [
                this.tableFilter[this.objectType].currentColumn.name
            ];
            if (this.customGetDataForFilter.hasOwnProperty(columns[0])) {
                let tbFilter = self.tableFilter[self.objectType];
                let items = await this.customGetDataForFilter[columns[0]](
                    tbFilter.currentColumn.colFilter
                );
                tbFilter.currentColumn.colFilter.fullOptions =
                    _cloneDeep(items);
                let reduceItems = self.createSelectableItems(items);
                tbFilter.currentColumn.colFilter.selectItems = reduceItems;
                if (reduceItems.length > 0) {
                    self.tableFilter[
                        self.objectType
                    ].currentColumn.colFilter.valuesIn = {};
                    reduceItems.forEach((e) => {
                        if (e.checked) {
                            self.tableFilter[
                                self.objectType
                            ].currentColumn.colFilter.valuesIn[e.value] = true;
                        }
                    });
                }
                tbFilter.allColumn[columns[0]].customGetDataForFilter = true;
                self.$refs.tableFilter.loading = false;
            } else {
                let options = {
                    pageSize: 300,
                    getDataMode: 'autocomplete',
                    distinct: true,
                    page: 1
                };
                let extraConfigs = this.getConfigsForApiCall(options);
                this.listTaskMyItemWorker.postMessage({
                    action: 'getItemForValueFilter',
                    data: {
                        columns: columns,
                        options: extraConfigs
                    }
                });
            }
        },
        handleGetItemForValueFilter(res) {
            let columns = [
                this.tableFilter[this.objectType].currentColumn.name
            ];
            let self = this;
            if (res.status == 200) {
                self.tableFilter[
                    self.objectType
                ].currentColumn.colFilter.selectItems = null;
                let items = res.data.listObject.reduce((arr, el) => {
                    arr.push(el[columns[0]]);
                    return arr;
                }, []);
                self.tableFilter[
                    self.objectType
                ].currentColumn.colFilter.selectItems =
                    self.createSelectableItems(items);
            }
            self.$refs.tableFilter.loading = false;
        },
        /* Lấy ra cấu hình cho việc sort
         */
        getConfigsForApiCall(configs) {
            configs.url = this.getDataUrl;
            if (configs.url != '') {
                let emptyOption = false;
                configs.header = {};
                let routeName = this.$getRouteName();
                if (
                    routeName == 'deployHistory' ||
                    routeName == 'listProcessInstances'
                ) {
                    configs.header = {};
                    emptyOption = true;
                }
                configs.searchKey = this.searchKey;
                configs.page = configs.page ? configs.page : this.page;
                configs.pageSize = this.pageSize;
                configs.formulaCondition = this.conditionByFormula;
                configs.tableFilter = this.tableFilter[this.objectType];
                configs.tableFilter.allColumnInTable = [];
                configs.emptyOption = emptyOption;
                configs.distinct = true;
                if (this.processInstanceId) {
                    configs.processInstanceId = this.processInstanceId;
                }
                configs.moreApiParam = {
                    variables:
                        'symper_last_executor_id, symper_user_id_start_workflow, symper_last_executor_name'
                };
                if (this.filterFromParent) {
                    if (this.filterFromParent.relatedTasksByDocObjId) {
                        configs.moreApiParam.relatedTasksByDocObjId =
                            this.filterFromParent.relatedTasksByDocObjId;
                    }
                }
            }
            return configs;
        },

        searchAutocompleteItems(vl) {
            this.tableFilter[
                this.objectType
            ].currentColumn.colFilter.searchKey = vl;
            this.getItemForValueFilter();
        },
        /**
         * Tạo ra các item có check box với trạng thái đã check hay chưa
         * @param items danh sách các value dạng ['ccc','xxc', ....]
         */
        createSelectableItems(items) {
            let colFilter =
                this.tableFilter[this.objectType].currentColumn.colFilter;
            let selectableItems = [];
            if (colFilter.clickedSelectAll) {
                // chọn tất cả
                selectableItems = items.reduce((arr, el) => {
                    let object = {
                        checked: true
                    };
                    if (typeof el == 'object') {
                        object = Object.assign(object, el);
                    } else {
                        object.value = el;
                    }
                    arr.push(object);
                    return arr;
                }, []);
            } else if (colFilter.selectAll) {
                // not in
                selectableItems = items.reduce((arr, el) => {
                    let checkCol = typeof el == 'object' ? el.value : el;
                    let object = {
                        checked: colFilter.valuesNotIn[checkCol] ? false : true
                    };
                    if (typeof el == 'object') {
                        object = Object.assign(object, el);
                    } else {
                        object.value = el;
                    }
                    arr.push(object);
                    return arr;
                }, []);
            } else {
                // in
                selectableItems = items.reduce((arr, el) => {
                    let checkCol = typeof el == 'object' ? el.value : el;
                    let object = {
                        checked: colFilter.valuesIn[checkCol] ? true : false
                    };
                    if (typeof el == 'object') {
                        object = Object.assign(object, el);
                    } else {
                        object.value = el;
                    }
                    arr.push(object);
                    return arr;
                }, []);
            }
            return selectableItems;
        },
        goToPageApproval() {
            this.$set(
                this,
                'changeStatusMoreApproval',
                !this.changeStatusMoreApproval
            );
        },
        changeUpdateAsignee() {
            this.handleTaskSubmited();
        },
        handleReloadDetail() {
            let self = this;
            this.showTaskDetail = false;
            setTimeout(() => {
                self.showTaskDetail = true;
            }, 0);
        },
        handleDocSubmited(docObjId) {
            let obj = JSON.parse(this.currentTask.obj.description);
            obj.action.parameter.documentObjectId = docObjId;
            this.currentTask.obj.description = JSON.stringify(obj);
        },
        getDateFormNow(time) {
            var today = this.$moment().format('YYYY-MM-DD');
            if (time === today) {
                return this.$t('myItem.today');
            } else {
                let str = this.$moment(time).lang(this.$i18n.locale).fromNow();
                str = util.capitalizeFirstLetter(str);
                if (str.includes('Một')) {
                    str = str.replace('Một', '1');
                }
                return str;
            }
        },
        changeObjectType(index) {
            this.objectType = index ? index : 0;
            this.calcDefaultColWidth();
            this.saveExtraConfig();
            this.setKeyforNotFoundScreen();
            if (this.objectType == 1) {
                this.timeGetData++;
            }
        },
        saveExtraConfig() {
            let data = {
                objectType: this.objectType,
                sidebarWidth: this.sidebarWidth,
                completeWhenSubmit: this.completeWhenSubmit,
                mapRealColWidth: this.mapRealColWidth
            };
            let rsl = {
                widgetIdentifier: this.getWidgetIdentifier() + ':extra-config',
                detail: JSON.stringify(data)
            };
            uiConfigApi
                .saveUiConfig(rsl)
                .then((res) => {})
                .catch((err) => {});
        },
        handleTaskSubmited() {
            this.sideBySideMode = false;
            this.refreshListTaskByDebounce();
        },
        handleAddFilterConfig() {
            this.showAddFilter = true;
        },
        handleSidebarResizeStart() {
            this.isDrangging = true;
        },
        handleSidebarResizing(params) {
            this.sidebarWidth = params.width;
            this.$refs.detailTask.getWidthHeaderTask(true);
        },
        handleSidebarResizeEnd() {
            this.isDrangging = false;
            if (this.sideBySideMode) {
                this.saveExtraConfig();
            }
            this.setNameColWidth();
        },
        setNameColWidth() {
            let map = this.mapRealColWidth;
            let type = this.objectType;
            if (this.sideBySideMode) {
                this.prevNameColWidth = map[type].name;
                map[type].name = this.sidebarWidth - 30 + 'px';
            } else {
                map[type].name = this.prevNameColWidth;
            }
        },
        handleRefreshFilter() {
            this.filterName = '';
            this.selectedFilterName = '';
            this.isClose = false;
            this.searchValue = '';
            this.searchKey = '';
            this.tableFilter[this.objectType].allColumn = {};
            this.getData();
        },
        handleExtraMenuItemToggle(value) {
            this.completeWhenSubmit = value;
            this.saveExtraConfig();
        },
        handleConfigFilterAction(data) {
            let type = data.type;
            switch (type) {
                case 'setDefaultFilter':
                    this.setDefaultFilter(data.filterIdx);
                    break;
                case 'unsetDefaultFilter':
                    this.unsetDefaultFilter(data.filterIdx);
                    break;
                case 'editFilter':
                    this.editFilter(data.filterIdx);
                    break;
                case 'deleteFilter':
                    this.typeDelete = 'filter';
                    this.deleteFilter(data.filterIdx);
                    break;
            }
        },
        setDefaultFilter(filterIdx) {
            this.listFilters[filterIdx].isDefault = true;
            this.listFilters.map((fil, i) => {
                if (i !== filterIdx) {
                    fil.isDefault = false;
                }
            });
            this.saveUiConfig();
        },
        editFilter(filterIdx) {
            this.showAddFilter = true;
            this.isUpdateFilter = true;
            this.handleSelectFilter(filterIdx, false);
        },
        deleteFilter(filterIdx) {
            this.showDelPopUp = true;
            this.contentDelete =
                this.$t('v2.myItem.deleteFilterConfirmBegin') +
                this.listFilters[filterIdx].name +
                this.$t('v2.myItem.deleteFilterConfirmEnd');
            this.deleteFilterIdx = filterIdx;
        },
        unsetDefaultFilter(filterIdx) {
            this.listFilters[filterIdx].isDefault = false;
            this.saveUiConfig();
        },
        handleSelectFilter(filterIdx, reload = true) {
            this.searchValue = this.listFilters[filterIdx].searchKey
                ? this.listFilters[filterIdx].searchKey
                : '';
            this.searchKey = this.searchValue;
            this.filterName = this.listFilters[filterIdx].name;
            this.tableFilter[this.objectType].allColumn =
                this.listFilters[filterIdx].columns;
            this.filterIdx = filterIdx;
            this.closeBtnFilter = true;
            this.selectedFilterName = this.listFilters[filterIdx].name;
            if (reload) {
                this.getData();
            }
        },
        getWidgetIdentifier() {
            let widgetIdentifier = '';
            if (this.widgetIdentifier) {
                widgetIdentifier = this.widgetIdentifier;
            } else {
                widgetIdentifier = 'my-item';
            }
            widgetIdentifier = widgetIdentifier.replace(/(\/|\?|=)/g, '');
            return widgetIdentifier;
        },
        handleSaveUiConfig(res) {
            if (res.status == 200) {
                this.$snotify({
                    type: 'success',
                    title: this.$t('v2.myItem.configFilterSuccess')
                });
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.myItem.configFilterFail')
                });
            }
            this.showAddFilter = false;
        },
        saveUiConfig() {
            let rsl = {
                widgetIdentifier: this.getWidgetIdentifier(),
                detail: JSON.stringify({
                    filter: this.listFilters
                })
            };
            this.listTaskMyItemWorker.postMessage({
                action: 'saveUiConfig',
                data: rsl
            });
        },
        handleAddFilter(data) {
            this.showAddFilter = false;
            if (data.type == 'save') {
                this.filterName = data.filterName;
                if (!this.checkExistNameFilter(this.filterName)) {
                    this.checkIsAddFilter();
                    this.saveUiConfig();
                } else {
                    this.$snotify({
                        type: 'error',
                        title: this.$t('table.error.name_exist')
                    });
                }
            }
        },
        checkExistNameFilter(filterName) {
            let check = false;
            this.listFilters.forEach(function (e) {
                if (e.name == filterName) {
                    check = true;
                }
            });
            return check;
        },
        handleChangeFilterValue(data) {
            this.searchKey = data.nameLike;
            if (this.debounceGetData) {
                clearTimeout(this.debounceGetData);
            }
            this.debounceGetData = setTimeout(
                (self) => {
                    self.page = 1;
                    self.getData();
                },
                300,
                this
            );
        },
        reCalcListTaskHeight() {
            this.listTaskHeight =
                util.getComponentSize(this.$el.parentElement).h - 130;
        },
        reSelectObject() {
            this.$refs.preLoaderView.show();
            this.getData();
            setTimeout(
                (self) => {
                    let obj =
                        this.groupFlatTasks[this.currentTask.idex].tasks[
                            this.currentTask.idx
                        ];
                    self.selectObject(
                        obj,
                        self.currentTask.idx,
                        self.currentTask.idex
                    );
                },
                2000,
                this
            );
        },
        handleCloseSbsAndReload(scrollToPrevPosition = false) {
            this.sideBySideMode = false;
            this.scrollToPrevPosition = scrollToPrevPosition;
            this.getData();
        },
        reSelectFirstObject() {
            this.$refs.preLoaderView.show();
            this.getData();
            setTimeout(
                (self) => {
                    let obj = self.groupFlatTasks[0].tasks[0];
                    self.selectObject(obj, 0, 0);
                },
                2000,
                this
            );
        },
        async selectObject(obj, idx, idex) {
            if (this.objectType == 0) {
                this.selectTask(obj, idx, idex);
            } else if (this.objectType == 1) {
                this.selectWork(obj, idx, idex);
            } else {
                this.selectDocument(obj, idx, idex);
            }
        },
        selectDocument(obj, idx) {
            this.index = idx;
            this.docObjInfo.docObjId = obj.id;
            this.titleDocument = obj.titleObject;
            if (!this.compackMode) {
                this.$set(this, 'sideBySideMode', true);
                this.$emit('change-height', 'calc(100vh - 88px)');
            }
        },
        selectWork(obj, idx, idex) {
            this.index = idx;
            this.dataIndex = idex;
            this.$set(this.selectedWork, 'workInfo', obj);
            this.selectedWork.workInfo.appName = obj.symperApplicationName;
            this.selectedWork.idx = idx;
            if (!this.compackMode) {
                this.$set(this, 'sideBySideMode', true);
                this.$emit('change-height', 'calc(100vh - 88px)');
            }
        },
        selectTask(obj, idx, idex) {
            if (
                this.currentTask &&
                this.currentTask.obj &&
                obj.id == this.currentTask.obj.id
            ) {
                return;
            }
            let self = this;
            this.showTaskDetail = false;
            this.currentTask = {
                obj: obj,
                idx: idx,
                idex: idex
            };
            this.index = idx;
            this.dataIndex = idex;
            this.$set(this.selectedTask, 'originData', obj);
            if (this.smallComponentMode) {
                this.$goToPage('/tasks/' + obj.id, this.$t('v2.myItem.doTask'));
            } else {
                this.selectedTask.idx = idx;
                if (!this.compackMode) {
                    this.$set(this, 'sideBySideMode', true);
                    let taskInfo = extractTaskInfoFromObject(obj);
                    this.$set(this.selectedTask, 'taskInfo', taskInfo);
                    this.$emit('change-height', 'calc(100vh - 88px)');
                }
            }
            setTimeout(() => {
                self.showTaskDetail = true;
            }, 0);
        },
        closeDetail() {
            this.$set(this, 'sideBySideMode', false);
            this.$emit('change-height', 'calc(100vh - 120px)');
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
        async getDataDocuments(filter = {}) {
            let self = this;
            this.allFlatDocumentObjId = [];
            this.loadingTaskList = true;
            this.myOwnFilter.page = this.page;
            this.myOwnFilter.pageSize = this.pageSize;
            this.myOwnFilter.search = this.searchKey;
            filter = Object.assign(this.myOwnFilter, this.filterFromParent);
            let res = await taskApi.getDocumentInVariables(filter);
            if (res.status == 200) {
                this.totalObject = res.total ? parseInt(res.total) : 0;
                await self.getListDocumentObjIdInVariables(res.data);
                await self.getListDocumentObjectId(
                    this.$store.state.app.endUserInfo.id
                );
            }
            self.loadingTaskList = false;
            self.setKeyforNotFoundScreen();
            self.timeGetData++;
        },
        async getListDocumentObjectId(userId) {
            let self = this;
            await self.$store.dispatch(
                'task/getListDocumentObjIdWithUserSubmit',
                userId
            );
        },
        async getListDocumentObjIdInVariables(listVariablesDocumentObj) {
            let self = this;
            if (listVariablesDocumentObj.length > 0) {
                for (let element of listVariablesDocumentObj) {
                    if (
                        this.allFlatDocumentObjId.indexOf(element.value) === -1
                    ) {
                        this.allFlatDocumentObjId.push(element.value);
                    }
                }
                await self.$store.dispatch(
                    'task/getListDocumentObjId',
                    self.allFlatDocumentObjId
                );
            }
        },
        /**
         * Lấy data từ server
         * @param {Array} columns chứa thông tin của các cột cần trả về.
         * @param {Boolean} cache có ưu tiên dữ liệu từ cache hay ko
         *
         */
        getData(
            columns = false,
            cache = false,
            applyFilter = true,
            lazyLoad = true,
            showLoading = true
        ) {
            if (this.objectType == 2) {
                this.getDataDocuments();
            } else {
                if (showLoading) {
                    this.loadingTaskList = true;
                }
                this.addDeffaultFilter();
                this.$store.dispatch('task/getAllAppActive');
                this.lazyLoad = lazyLoad;
                let extraConfigs = this.getConfigsForApiCall({});
                extraConfigs.tableFilter.customConditionsForFilter = {
                    assignee: function (option, filter) {
                        if (Object.keys(filter.valuesIn).length > 0) {
                            for (let i in filter.valuesIn) {
                                option.conditions.push({
                                    name: 'begins_with',
                                    value: i
                                });
                            }
                        }
                        if (Object.keys(filter.valuesNotIn).length > 0) {
                            filter.selectItems.forEach((e) => {
                                if (e.checked) {
                                    option.conditions.push({
                                        name: 'begins_with',
                                        value: e.value
                                    });
                                }
                            });
                        }
                        option.operation = 'or';
                    },
                    owner: function (option, filter) {
                        if (Object.keys(filter.valuesIn).length > 0) {
                            for (let i in filter.valuesIn) {
                                option.conditions.push({
                                    name: 'begins_with',
                                    value: i
                                });
                            }
                        }
                        if (Object.keys(filter.valuesNotIn).length > 0) {
                            filter.selectItems.forEach((e) => {
                                if (e.checked) {
                                    option.conditions.push({
                                        name: 'begins_with',
                                        value: e.value
                                    });
                                }
                            });
                        }
                        option.operation = 'or';
                    },
                    statusText: function (option, filter) {
                        if (Object.keys(filter.valuesIn).length > 0) {
                            for (let i in filter.valuesIn) {
                                option.conditions.push({
                                    name: 'equal',
                                    value: i
                                });
                            }
                        }
                        if (Object.keys(filter.valuesNotIn).length > 0) {
                            filter.selectItems.forEach((e) => {
                                if (e.checked) {
                                    option.conditions.push({
                                        name: 'equal',
                                        value: e.value
                                    });
                                }
                            });
                        }
                        option.operation = 'or';
                    }
                };
                for (let key in extraConfigs.tableFilter
                    .customConditionsForFilter) {
                    extraConfigs.tableFilter.customConditionsForFilter[key] =
                        extraConfigs.tableFilter.customConditionsForFilter[
                            key
                        ].toString();
                }
                this.listTaskMyItemWorker.postMessage({
                    action: 'getData',
                    data: {
                        configs: {
                            columns: columns,
                            cache: cache,
                            applyFilter: applyFilter
                        },
                        extraConfigs: extraConfigs
                    }
                });
            }
            this.timeGetData++;
        },
        addDeffaultFilter() {
            if (
                Object.keys(this.tableFilter[this.objectType].allColumn)
                    .length == 0
            ) {
                let col = this.objectType == 0 ? 'createTime' : 'startTime';
                this.tableFilter[this.objectType].allColumn[col] =
                    getDefaultFilterConfig();
                this.tableFilter[this.objectType].allColumn[col].sort = 'desc';
            }
        },
        handleGetData(data) {
            let thisCpn = this;
            if (thisCpn.customAPIResult.reformatData) {
                data = thisCpn.customAPIResult.reformatData(data);
            } else {
                data = data.data;
            }
            this.totalObject = data.total ? parseInt(data.total) : 0;
            let resData = data.listObject ? data.listObject : [];
            let newListTask = [];
            if (this.lazyLoad) {
                resData.forEach(function (e) {
                    let des = e.description;
                    try {
                        let desObj = JSON.parse(des);
                        des = desObj;
                    } catch (error) {}

                    if (
                        typeof des == 'object' &&
                        des.action &&
                        des.action.parameter &&
                        des.action.parameter.documentObjectId
                    ) {
                        thisCpn.listTaskIds.push(
                            'document-instance:' +
                                des.action.parameter.documentObjectId
                        );
                    } else {
                        thisCpn.listTaskIds.push('task:' + e.id);
                    }

                    e.taskData = thisCpn.getTaskData(e);
                    addMoreInfoToTask(e);
                    thisCpn.setDueDateInfoDisplay(e);
                    newListTask.push(e);
                });
                this.data = newListTask;
            }
            this.$store.commit(
                'file/setWaitingFileCountPerObj',
                thisCpn.listTaskIds
            );
            this.$store.commit(
                'comment/setWaitingCommentCountPerObj',
                thisCpn.listTaskIds
            );
            thisCpn.$emit('data-get', data.listObject);
            thisCpn.loadingTaskList = false;
            this.getAttackMentFile();
            this.getAttackmentComment();
            if (this.$refs.preLoaderView) {
                this.$refs.preLoaderView.hide();
            }
            if (this.selectFirstTaskAfterGetList == 'byIndex') {
                setTimeout(() => {
                    let obj = thisCpn.groupFlatTasks[0].tasks[0];
                    thisCpn.selectObject(obj, 0, 0);
                }, 500);
            } else if (this.selectFirstTaskAfterGetList == 'byUncompleteTask') {
                setTimeout(() => {
                    let obj = {};
                    for (let i in thisCpn.groupFlatTasks) {
                        for (let j in thisCpn.groupFlatTasks[i].tasks) {
                            if (
                                thisCpn.groupFlatTasks[i].tasks[j].statusText !=
                                'complete'
                            ) {
                                obj = thisCpn.groupFlatTasks[i].tasks[j];
                                break;
                            }
                        }
                    }
                    if (Object.keys(obj).length == 0) {
                        obj = thisCpn.groupFlatTasks[0].tasks[0];
                    }
                    thisCpn.selectObject(obj, 0, 0);
                }, 500);
            }

            if (this.openCheckbox) {
                for (let i = 0; i < this.checkedAllTaskArray.length; i++) {
                    if (this.checkedAllTaskArray[i].page == this.page) {
                        if (this.checkedAllTaskArray[i].isChecked) {
                            if (this.$refs.headerRow.checkbox) {
                                let waitForRefs = setInterval(function () {
                                    if (
                                        typeof thisCpn.$refs.tableItemRow ==
                                        'object'
                                    ) {
                                        clearInterval(waitForRefs);
                                        thisCpn.chooseAllTasks(true);
                                    }
                                }, 500);
                            } else {
                                this.$refs.headerRow.checkbox = true;
                            }
                        } else {
                            if (this.$refs.headerRow.checkbox) {
                                this.$refs.headerRow.isCheckBox = true;
                                this.$refs.headerRow.checkbox = false;
                            }
                            let waitForRefs = setInterval(function () {
                                if (
                                    typeof thisCpn.$refs.tableItemRow ==
                                    'object'
                                ) {
                                    if (thisCpn.taskId.length > 0) {
                                        for (
                                            let j = 0;
                                            j <
                                            thisCpn.$refs.tableItemRow.length;
                                            j++
                                        ) {
                                            for (
                                                let i = 0;
                                                i < thisCpn.taskId.length;
                                                i++
                                            ) {
                                                if (
                                                    thisCpn.taskId[i].task.id ==
                                                    thisCpn.$refs.tableItemRow[
                                                        j
                                                    ].obj.id
                                                ) {
                                                    thisCpn.$refs.tableItemRow[
                                                        j
                                                    ].checkbox = true;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }, 500);
                        }
                        break;
                    }
                }
            }

            setTimeout(() => {
                if (thisCpn.scrollToPrevPosition) {
                    thisCpn.$refs.taskListContainer.scrollTop =
                        thisCpn.prevScrollTop;
                    thisCpn.scrollToPrevPosition = false;
                }
            }, 500);
        },
        getAttackMentFile() {
            this.$store.commit(
                'file/setWaitingFileCountPerObj',
                this.listTaskIds
            );
            this.$store.dispatch('file/getWaitingFileCountPerObj');
        },
        getAttackmentComment() {
            this.$store.commit(
                'comment/setWaitingCommentCountPerObj',
                this.listTaskIds
            );
            this.$store.dispatch('comment/getWaitingCommentCountPerObj');
        },
        setDueDateInfoDisplay(e) {
            let dueDateInfo = this.getDueDateInfo(e);
            e.dueDateClass = dueDateInfo.class;
            e.dueDateText = dueDateInfo.text;
            e.createTimeDisplay = e.createTime
                ? this.$moment(e.createTime).lang('vi').format('DD/MM/YY HH:mm')
                : this.$moment(e.endTime).lang('vi').format('DD/MM/YY HH:mm');
            e.dueDateFromNow = e.dueDate ? this.convertTime(e.dueDate) : '';
        },
        getDueDateInfo(obj) {
            let classColor = {
                complete: 'success',
                assign: 'orange',
                unAssign: 'primary',
                delegate: '#8E2D8C'
            };
            return {
                text: this.$t('tasks.status.' + obj.statusText),
                class: classColor[obj.statusText]
            };
        },

        changeInfoTask(selectedTask) {
            selectedTask.originData.createTime =
                selectedTask.originData.startTime;
            this.$set(this.selectedTask, 'originData', selectedTask.originData);
            this.$set(this.selectedTask, 'taskInfo', selectedTask.taskInfo);
            for (let i = 0; i < this.groupFlatTasks.length; i++) {
                for (let j = 0; j < this.groupFlatTasks[i].tasks.length; j++) {
                    let task = this.groupFlatTasks[i].tasks[j];
                    if (task.id == selectedTask.originData.id) {
                        this.groupFlatTasks[i].tasks[j].endTime = this.$moment(
                            selectedTask.originData.endTime
                        )
                            .lang('vi')
                            .format('DD/MM/YY HH:mm:ss');
                        this.groupFlatTasks[i].tasks[j].description =
                            selectedTask.originData.description;
                        if (selectedTask.originData.statusText) {
                            this.groupFlatTasks[i].tasks[j].statusText =
                                selectedTask.originData.statusText;
                        }
                        if (selectedTask.originData.isDone) {
                            this.groupFlatTasks[i].tasks[j].isDone =
                                selectedTask.originData.isDone;
                        }
                        this.setDueDateInfoDisplay(
                            this.groupFlatTasks[i].tasks[j]
                        );
                        return;
                    }
                }
            }
        },
        setKeyforNotFoundScreen() {
            if (this.objectType == 0) {
                this.emptyDataKey = 'myitem-task-list';
                this.timeGetData = 0;
            } else if (this.objectType == 1) {
                this.emptyDataKey = 'myitem-work-list';
                this.timeGetData = 0;
            } else if (this.objectType == 2) {
                this.emptyDataKey = 'myitem-document-list';
                this.timeGetData = 0;
            }
        }
    }
};
</script>

<style scoped>
.v-expansion-panels .v-expansion-panel-content {
    padding: 0;
}
.v-expansion-panels
    .v-expansion-panel-content
    >>> .v-expansion-panel-content__wrap {
    padding: 0 0 0px;
}
.single-row:hover {
    background: #f5f5f5;
    cursor: pointer;
}
.theme--light.v-list-item--active:hover::before,
.theme--light.v-list-item--active::before {
    opacity: 0;
}
.v-list--nav.v-list--dense .v-list-item:not(:last-child):not(:only-child),
.v-list--nav .v-list-item--dense:not(:last-child):not(:only-child) {
    margin-bottom: 0;
}
.scrollable {
    overflow: auto;
    overflow-x: hidden;
}
.v-text-field >>> .v-input__control >>> .v-input__slot,
.theme--light.v-text-field--solo >>> .v-input__control >>> .v-input__slot,
.list-objects .v-application >>> .v-input__control >>> .v-input__slot {
    padding-left: 5px !important;
    padding-right: 5px !important;
}
.v-application
    >>> .v-input__control
    >>> .v-input__slot
    >>> .v-input__append-inner
    >>> .v-input__icon {
    min-width: 10px;
    width: 5px;
}
.list-objects
    >>> .v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)
    >>> .v-input__control
    >>> .v-input__slot,
.list-objects >>> .v-text-field.v-text-field--enclosed .v-text-field__details {
    padding-left: 5px !important;
    padding-right: 5px !important;
}
.v-list-item >>> .v-list-item__icon,
.v-list-group
    >>> .v-list-item__icon:first-child
    .v-list-group
    >>> .v-list-item--dense
    >>> .v-list-item__icon,
.v-list-group >>> .v-list--dense >>> .v-list-item >>> .v-list-item__icon {
    margin-top: 3px;
    margin-bottom: 3px;
}
.title-quytrinh {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box !important;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}
.d-active {
    background: #f5f5f5;
}
.colName {
    flex: 0 0 90%;
    max-width: 90%;
}
.d-active-color {
    color: #f58634;
}
.task-done {
    background-color: #408137 !important;
}

.task-over-due {
    background-color: #ee6b60 !important;
}

.task-to-do {
    background-color: #0760d9 !important;
}

.myitem-header-row-container {
    width: 100%;
    overflow: auto;
}

.myitem-header-row-container::-webkit-scrollbar {
    display: none;
}

.myitem-header-row-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.time-group-task + .single-row {
    border-top: 1px solid #eeeeee !important;
}
</style>

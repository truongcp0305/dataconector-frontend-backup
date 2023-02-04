<template>
    <div class="list-objects">
        <v-row class="mr-0 ml-0">
            <v-col
                :cols="!sideBySideMode ? 12 : 4"
                :md="!sideBySideMode ? 12 : 3"
                class="pt-0 pl-0 pr-0 pb-0"
            >
                <listHeader
                    :isSmallRow="isSmallRow"
                    :headerTitle="headerTitle"
                    :sideBySideMode="sideBySideMode"
                    :compackMode="compackMode"
                    :parentTaskId="filterFromParent.parentTaskId"
                    @change-density="isSmallRow = !isSmallRow"
                    @filter-change-value="handleChangeFilterValue"
                    @create-task="getTasks({})"
                    @refresh-task-list="getTasks()"
                    @get-list-process-instance="listProrcessInstances = $event"
                ></listHeader>
                <v-divider v-if="!sideBySideMode"></v-divider>
                <v-row class="ml-0 mr-0" v-if="!sideBySideMode">
                    <v-col cols="12" class="list-tasks pt-0 pb-0">
                        <v-row>
                            <v-col
                                cols="1"
                                class="pl-3 fs-13 font-weight-medium"
                                style="flex: 0 !important"
                                >{{ $t('tasks.header.type') }}</v-col
                            >
                            <v-col
                                :cols="
                                    sideBySideMode ? 12 : compackMode ? 5 : 3
                                "
                                class="pl-3 fs-13 font-weight-medium"
                                >{{ $t('tasks.header.name') }}</v-col
                            >
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-medium"
                                >{{ $t('tasks.header.assignee') }}</v-col
                            >
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-medium"
                                >{{ $t('tasks.header.dueDate') }}</v-col
                            >
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-medium"
                                >{{ $t('tasks.header.owner') }}</v-col
                            >
                            <v-col
                                cols="2"
                                v-if="
                                    !sideBySideMode &&
                                    !compackMode &&
                                    !smallComponentMode
                                "
                                class="fs-13 font-weight-medium"
                            >
                                {{ $t('common.workflows') }}
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-divider></v-divider>

                <VuePerfectScrollbar
                    v-if="!loadingTaskList"
                    @ps-y-reach-end="handleReachEndList"
                    :style="{ height: listTaskHeight + 'px' }"
                >
                    <v-row
                        v-for="(obj, idx) in allFlatTasks"
                        :key="idx"
                        :index="obj.id"
                        :class="{
                            'mr-0 ml-0 single-row': true,
                            'py-1': !isSmallRow,
                            'py-0': isSmallRow,
                            'd-active': index == idx
                        }"
                        :style="{
                            minHeight: '50px'
                        }"
                        @click="selectObject(obj, idx)"
                    >
                        <v-col
                            style="line-height: 42px; flex: 0 !important"
                            cols="1"
                            class="fs-12 px-1 py-0 pl-3"
                        >
                            <v-icon v-if="obj.taskData.action">{{
                                obj.taskData.action.action == 'submit' ||
                                obj.taskData.action.action == ''
                                    ? 'mdi-file-document-edit-outline'
                                    : 'mdi-seal-variant'
                            }}</v-icon>
                            <v-icon v-else
                                >mdi-checkbox-marked-circle-outline</v-icon
                            >
                        </v-col>
                        <v-col
                            :cols="sideBySideMode ? 10 : compackMode ? 5 : 3"
                            class="pl-3 pr-1 pb-1 pt-2"
                        >
                            <div class="pl-1">
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
                                            <span
                                                v-if="
                                                    obj.taskData.action &&
                                                    obj.taskData.action
                                                        .action == 'approval'
                                                "
                                                style="color: #ffc107"
                                                >{{
                                                    obj.taskData.action
                                                        .parameter
                                                        .documentObjectId
                                                        ? checkData(
                                                              obj.taskData
                                                                  .action
                                                                  .parameter
                                                                  .documentObjectId
                                                          )
                                                        : ''
                                                }}</span
                                            >
                                            {{ obj.taskData.content }}
                                        </div>
                                    </template>
                                    <span>{{ obj.taskData.content }}</span>
                                </v-tooltip>
                                <div
                                    class="
                                        pa-0
                                        grey--text
                                        mt-1
                                        lighten-2
                                        d-flex
                                        justify-space-between
                                    "
                                >
                                    <div class="fs-11 pr-6 text-ellipsis">
                                        {{ obj.taskData.extraLabel }}
                                        {{ obj.taskData.extraValue }}
                                    </div>

                                    <div class="fs-11 py-0 pr-2 text-ellipsis">
                                        {{
                                            obj.createTime
                                                ? $moment(
                                                      obj.createTime
                                                  ).format('DD/MM/YY  HH:mm:ss')
                                                : $moment(obj.endTime).format(
                                                      'DD/MM/YY  HH:mm:ss'
                                                  )
                                        }}
                                        <v-icon
                                            class="grey--text lighten-2 ml-1"
                                            x-small
                                            >mdi-clock-time-nine-outline</v-icon
                                        >
                                    </div>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            v-if="!sideBySideMode"
                            style="line-height: 42px"
                            cols="2"
                            class="fs-12 px-1 py-0"
                        >
                            <symperAvatar
                                :size="20"
                                :userId="obj.assigneeInfo.id"
                            />
                            {{ obj.assigneeInfo.displayName }}
                        </v-col>
                        <v-col
                            v-if="!sideBySideMode"
                            style="line-height: 42px"
                            cols="2"
                            class="fs-13 px-1 py-0"
                        >
                            <span class="mt-1">{{
                                obj.dueDate == null
                                    ? ''
                                    : $moment(obj.dueDate).fromNow()
                            }}</span>
                        </v-col>
                        <v-col
                            v-if="!sideBySideMode"
                            style="line-height: 42px"
                            cols="2"
                            class="fs-12 px-1 py-0"
                        >
                            <symperAvatar
                                v-if="obj.ownerInfo.id"
                                :size="20"
                                :userId="obj.ownerInfo.id"
                            />
                            <symperAvatar
                                v-else
                                :size="20"
                                :userId="obj.assigneeInfo.id"
                            />
                            {{
                                obj.ownerInfo.id
                                    ? obj.ownerInfo.displayName
                                    : obj.assigneeInfo.displayName
                            }}
                        </v-col>
                        <v-col
                            class="py-0"
                            cols="2"
                            v-if="!sideBySideMode && !smallComponentMode"
                            style="line-height: 42px"
                        >
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <span
                                        v-on="on"
                                        v-if="obj.processDefinitionName"
                                        class="
                                            mt-1
                                            d-inline-block
                                            fs-13
                                            title-quytrinh
                                        "
                                        >{{ obj.processDefinitionName }}</span
                                    >
                                    <span
                                        v-on="on"
                                        v-else
                                        class="
                                            mt-1
                                            d-inline-block
                                            fs-13
                                            title-quytrinh
                                        "
                                        >ad hoc</span
                                    >
                                </template>
                                <span>{{ obj.processDefinitionName }}</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </VuePerfectScrollbar>
                <v-skeleton-loader
                    v-else
                    ref="skeleton"
                    :type="'table-tbody'"
                    class="mx-auto"
                ></v-skeleton-loader>
                <v-skeleton-loader
                    v-if="loadingMoreTask"
                    ref="skeleton"
                    :type="'table-tbody'"
                    class="mx-auto"
                ></v-skeleton-loader>
            </v-col>
            <v-col
                :cols="!sideBySideMode ? 0 : 8"
                :md="!sideBySideMode ? 0 : 9"
                v-if="sideBySideMode"
                class="pa-0 ma-0"
                height="30"
                style="border-left: 1px solid #e0e0e0"
            >
                <taskDetail
                    :parentHeight="listTaskHeight"
                    :taskInfo="selectedTask.taskInfo"
                    :originData="selectedTask.originData"
                    @close-detail="closeDetail"
                    @task-submited="handleTaskSubmited"
                ></taskDetail>
            </v-col>
            <userSelector ref="user" class="d-none"></userSelector>
        </v-row>
    </div>
</template>

<script>
import BPMNEngine from './../../api/BPMNEngine';
import icon from '../../components/common/SymperIcon';
import taskDetail from './taskDetail';
import listHeader from './listHeader';
import userSelector from './userSelector';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { util } from '../../plugins/util';
import { appConfigs } from '../../configs';
import {
    extractTaskInfoFromObject,
    addMoreInfoToTask
} from '../../components/process/processAction';
import symperAvatar from '@/components/common/SymperAvatar.vue';

export default {
    computed: {
        // Liệt kê danh sách các task dưới dạng phẳng - ko phân cấp
        flatTasks() {
            let tasks = [];
            for (let def of this.listProrcessInstances) {
                for (let instances of def.objects) {
                    for (let task of instances.tasks) {
                        task.bizKey = ''; // Business key của process instance
                        tasks.push(task);
                    }
                }
            }
            return tasks;
        },
        stask() {
            return this.$store.state.task;
        },
        sapp() {
            return this.$store.state.app;
        }
    },
    name: 'listTask',
    components: {
        icon: icon,
        taskDetail: taskDetail,
        listHeader: listHeader,
        userSelector: userSelector,
        VuePerfectScrollbar: VuePerfectScrollbar,
        symperAvatar: symperAvatar
    },
    props: {
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
        headerTitle: {
            type: String,
            default() {
                return this.$t('process.taskList');
            }
        },
        filterTaskAction: {
            type: String,
            default: 'getList'
        }
    },
    data: function () {
        return {
            index: -1,
            loadingTaskList: false,
            loadingMoreTask: false,
            listTaskHeight: 300,
            totalTask: 0,
            selectedTask: {
                taskInfo: {},
                idx: -1,
                originData: null
            },
            listProrcessInstances: [],
            isSmallRow: false,
            sideBySideMode: false,
            openPanel: [0, 1, 2, 3, 4],
            allFlatTasks: [],
            myOwnFilter: {
                size: 100,
                sort: 'createTime',
                order: 'desc',
                page: 1,
                assignee: this.$store.state.app.endUserInfo.id
            },
            defaultAvatar: appConfigs.defaultAvatar,
            arrdocObjId: []
        };
    },
    created() {
        let self = this;
        this.$evtBus.$on('symper-update-task-assignment', (updatedTask) => {
            updatedTask.taskData = self.getTaskData(updatedTask);
            self.selectObject(updatedTask, self.selectedTask.idx);
            self.$set(self.allFlatTasks, self.selectedTask.idx, updatedTask);
        });
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
    methods: {
        checkData(documentObjectId) {
            if (documentObjectId != '' || documentObjectId != undefined) {
                let arr = this.stask.arrDocObjId;
                let obj = arr.find((data) => data.id === documentObjectId);
                if (obj) {
                    let arrUser = this.sapp.allUsers;
                    let user = arrUser.find(
                        (data) => data.email === obj.userCreate
                    );
                    if (user) {
                        return user.displayName;
                    } else {
                        return '';
                    }
                } else {
                    return '';
                }
            } else {
                return '';
            }
        },
        handleReachEndList() {
            if (
                this.allFlatTasks.length < this.totalTask &&
                this.allFlatTasks.length > 0
            ) {
                this.myOwnFilter.page += 1;
                this.myOwnFilter.size = 50;

                this.getTasks();
            }
        },
        handleTaskSubmited() {
            this.sideBySideMode = false;
            this.getTasks();
        },
        handleChangeFilterValue(data) {
            for (let key in data) {
                this.$set(this.myOwnFilter, key, data[key]);
            }
            this.getTasks();
        },
        reCalcListTaskHeight() {
            this.listTaskHeight =
                util.getComponentSize(this.$el.parentElement).h - 125;
        },
        getUser(id) {
            this.$refs.user.getUser(id);
        },
        selectObject(obj, idx) {
            this.index = idx;
            this.$set(this.selectedTask, 'originData', obj);
            if (this.smallComponentMode) {
                this.$goToPage(
                    '/tasks/' + obj.id,
                    this.$t('v2.myItem.doTask')
                );
            } else {
                this.selectedTask.idx = idx;
                if (!this.compackMode) {
                    this.sideBySideMode = true;
                    let taskInfo = extractTaskInfoFromObject(obj);
                    this.$set(this.selectedTask, 'taskInfo', taskInfo);
                    this.$emit('change-height', 'calc(100vh - 88px)');
                }
            }
        },
        closeDetail() {
            this.sideBySideMode = false;
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
        async getTasks(filter = {}) {
            if (this.loadingTaskList || this.loadingMoreTask) {
                return;
            }
            let self = this;
            if (this.myOwnFilter.page == 1) {
                this.allFlatTasks = [];
                this.loadingTaskList = true;
            } else {
                this.loadingMoreTask = true;
            }
            this.listProrcessInstances = [];
            filter = Object.assign(filter, this.filterFromParent);
            filter = Object.assign(filter, this.myOwnFilter);
            let res = {};
            let listTasks = [];

            if (this.filterTaskAction == 'subtasks') {
                res = await BPMNEngine.getSubtasks(
                    this.filterFromParent.parentTaskId,
                    filter
                );
                if (filter.status == 'done') {
                    listTasks = res.data;
                } else {
                    listTasks = res;
                }
            } else {
                if (!filter.assignee) {
                    filter.assignee = this.$store.state.app.endUserInfo.id;
                }
                res = await BPMNEngine.getTask(filter);
                listTasks = res.data;
            }
            this.totalTask = Number(res.total);
            // let allDefinitions=this.$store.state.process.allDefinitions;
            // if(Object.entries(allDefinitions).length === 0){
            //     this.$store.dispatch('process/getAllDefinitions');
            // }
            for (let task of listTasks) {
                task.taskData = self.getTaskData(task);
                task = addMoreInfoToTask(task);
                self.allFlatTasks.push(task);
            }
            this.listProrcessInstances.forEach((process, processIndex) => {
                process.objects.forEach((instance, instanceIndex) => {
                    this.listProrcessInstances[processIndex].objects[
                        instanceIndex
                    ].tasks = [];
                    // let index = 0;
                    for (let index in listTasks) {
                        listTasks[index].assignee = this.getUser(
                            parseInt(listTasks[index].assignee)
                        );
                        listTasks[index].owner = this.getUser(
                            parseInt(listTasks[index].owner)
                        );
                        if (listTasks[index].processInstanceId == instance.id) {
                            this.listProrcessInstances[processIndex].objects[
                                instanceIndex
                            ].tasks.push(listTasks[index]);
                            listTasks.splice(index, 1);
                        }
                    }
                });
            });

            console.log(listTasks, 'listTassk');
            this.addOtherProcess(listTasks);
            this.loadingTaskList = false;
            this.loadingMoreTask = false;
        },
        addOtherProcess(listTasks) {
            for (let index in listTasks) {
                listTasks[index].assignee = this.getUser(
                    parseInt(listTasks[index].assignee)
                );
                listTasks[index].owner = this.getUser(
                    parseInt(listTasks[index].owner)
                );
                if (listTasks[index].description) {
                    let description = JSON.parse(listTasks[index].description);
                    if (
                        description.action.action == 'approval' &&
                        description.action.parameter.documentObjectId !=
                            undefined
                    ) {
                        this.arrdocObjId.push(
                            description.action.parameter.documentObjectId
                        );
                    }
                }
            }
            this.$store.dispatch('task/getArrDocObjId', this.arrdocObjId);
            this.listProrcessInstances.push({
                processDefinitionId: null,
                processDefinitionName: this.$t('common.other'),
                objects: [
                    {
                        id: null,
                        name: null,
                        tasks: listTasks
                    }
                ]
            });
        }
    }
};
</script>

<style scoped>
.list-tasks .fs-13 {
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 5px;
    padding-bottom: 5px;
}
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
</style>

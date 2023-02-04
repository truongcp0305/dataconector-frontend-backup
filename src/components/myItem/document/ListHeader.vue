<template>
    <div class="w-100 d-flex justify-space-between py-2">
        <div class="pl-3 symper-title" v-if="!sideBySideMode">
            {{ headerTitle }}
        </div>
        <div
            :class="{
                'pr-0 d-flex': true,
                'w-100': sideBySideMode
            }"
        >
            <!-- Tìm kiếm -->
            <v-text-field
                class="d-inline-block mx-2 sym-small-size"
                single-line
                append-icon="mdi-magnify"
                outlined
                hide-details
                dense
                flat
                v-model="searchTaskKey"
                label="Search"
                :placeholder="$t('common.search')"
            ></v-text-field>
            <!-- Add task -->
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn
                        v-on="on"
                        v-show="!sideBySideMode"
                        small
                        class="mr-2"
                        depressed
                        @click="openCreateTaskDialog"
                    >
                        <v-icon size="18">mdi-plus</v-icon>
                        <span class="ml-2">{{
                            $t('tasks.createTask.title')
                        }}</span>
                    </v-btn>
                </template>
                <span>{{ $t('tasks.createTask.title') }}</span>
            </v-tooltip>
            <!-- Bo loc cho  loai doi tuong -->
            <v-menu
                :close-on-content-click="false"
                :close-on-click="closeOnClick"
                offset-y
                class="mr-2"
                style="z-index: 1000 !important"
            >
                <template v-slot:activator="{ on: onMenu }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on: onTooltip }">
                            <v-btn
                                v-on="{ ...onMenu, ...onTooltip }"
                                depressed
                                class="mr-2"
                                small
                            >
                                <v-icon size="18">mdi-filter-menu</v-icon>
                                <span v-if="!sideBySideMode" class="ml-2">{{
                                    listObjectType[2].title
                                }}</span>
                            </v-btn>
                        </template>
                        <span>{{ listObjectType[2].title }}</span>
                    </v-tooltip>
                </template>
                <v-list>
                    <v-list-item
                        v-for="(item, index) in listObjectType"
                        :key="index"
                        @click="changeObjectType(index)"
                    >
                        <v-list-item-title> {{ item.title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <!-- Bộ lọc cho  task -->
            <!-- <v-menu
        offset-y
        light
        :close-on-content-click="false"
        :min-width="300"
        class="mr-2"
        style="z-index:1000!important"
      >
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" depressed class="mr-2" small>
            <v-icon size="18">mdi-filter-menu-outline</v-icon>
            <span v-if="!sideBySideMode" class="ml-2">{{$t('common.filter')}}</span>
          </v-btn>
        </template>
        <div>
          <TaskListFilter @filter-change-value="handleChangeFilterValue"></TaskListFilter>
        </div>
      </v-menu> -->

            <!-- Bộ lọc loại đối tượng -->
            <v-menu
                offset-y
                light
                :close-on-content-click="false"
                :min-width="200"
                class="mr-2"
                style="z-index: 1000 !important"
            >
                <template v-slot:activator="{ on: onMenu }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on: onTooltip }">
                            <v-btn
                                v-on="{ ...onMenu, ...onTooltip }"
                                depressed
                                class="mr-2"
                                small
                            >
                                <v-icon size="18">mdi-swap-vertical</v-icon>
                                <span v-show="!sideBySideMode" class="ml-2">{{
                                    $t('common.sort')
                                }}</span>
                            </v-btn>
                        </template>
                        <span>{{ $t('common.sort') }}</span>
                    </v-tooltip>
                </template>
                <v-list dense light nav>
                    <v-subheader
                        class="font-weight-bold fs-14"
                        style="height: 25px"
                        >{{ this.$t('sortBy') }}</v-subheader
                    >
                    <v-list-item-group v-model="sortBy">
                        <v-list-item
                            dense
                            flat
                            v-for="(item, i) in sortOption"
                            :key="i"
                        >
                            <template v-slot:default="{ active }">
                                <v-list-item-content class="pt-0 pb-0">
                                    <v-list-item-title
                                        class="font-weight-regular ml-4 fs-14"
                                        v-text="item.label"
                                    ></v-list-item-title>
                                </v-list-item-content>
                                <v-list-item-action class="mt-0 mb-0">
                                    <v-icon v-if="active" color="success" small
                                        >mdi-check</v-icon
                                    >
                                </v-list-item-action>
                            </template>
                        </v-list-item>
                    </v-list-item-group>
                    <v-subheader
                        class="font-weight-bold fs-14"
                        style="height: 25px"
                        >{{ this.$t('orderBy') }}</v-subheader
                    >
                    <v-list-item-group v-model="orderBy">
                        <v-list-item v-for="(item, i) in orderOption" :key="i">
                            <template v-slot:default="{ active }">
                                <v-list-item-content class="pt-0 pb-0">
                                    <v-list-item-title
                                        class="font-weight-regular fs-14 ml-4"
                                        v-text="item.label"
                                    ></v-list-item-title>
                                </v-list-item-content>
                                <v-list-item-action class="mt-0 mb-0">
                                    <v-icon v-if="active" color="success" small
                                        >mdi-check</v-icon
                                    >
                                </v-list-item-action>
                            </template>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-menu>

            <!-- Dãn nở dòng -->
            <v-btn
                small
                solo
                depressed
                class="mr-2"
                @click="refreshTaskList"
                v-show="!sideBySideMode"
            >
                <v-icon size="18">mdi-refresh</v-icon>
            </v-btn>
            <v-btn
                small
                solo
                depressed
                class="mr-2"
                @click="changeDensity"
                v-show="!sideBySideMode"
            >
                <v-icon size="18">{{
                    isSmallRow ? 'mdi-view-headline' : 'mdi-menu'
                }}</v-icon>
            </v-btn>
        </div>
        <v-dialog v-model="dialog" width="400">
            <v-card>
                <v-card-title>{{ $t('tasks.createTask.title') }}</v-card-title>
                <div class="mr-0 ml-0 pl-6 pr-6">
                    <div class="label pt-2">{{ $t('tasks.header.name') }}</div>
                    <div>
                        <v-text-field
                            class="sym-small-size"
                            dense
                            solo
                            flat
                            background-color=" grey lighten-3"
                            v-model="taskObject.name"
                        ></v-text-field>
                    </div>
                    <div class="label pt-2">
                        {{ $t('tasks.header.assignee') }}
                    </div>
                    <div>
                        <userSelector
                            ref="userSelector"
                            :isMulti="false"
                            :compactChip="true"
                            :color="'transparent'"
                            :textColor="''"
                            :flat="true"
                            @input="inputAssignee"
                        ></userSelector>
                    </div>
                    <div class="label pt-2">
                        {{ $t('tasks.header.dueDate') }}
                    </div>
                    <div>
                        <datePicker v-model="taskObject.dueDate"></datePicker>
                    </div>

                    <div class="label pt-2">
                        {{ $t('tasks.header.submitForm') }}
                    </div>
                    <div>
                        <symper-document-selec
                            v-model="taskObject.docId"
                        ></symper-document-selec>
                    </div>
                    <div class="label pt-2">
                        {{ $t('tasks.header.description') }}
                    </div>
                    <div>
                        <v-textarea
                            class="sym-small-size sym-small-lineheight"
                            dense
                            solo
                            flat
                            background-color="grey lighten-3"
                            v-model="taskObject.description"
                        ></v-textarea>
                    </div>
                </div>
                <v-card-actions class="pt-4">
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        small
                        :disabled="
                            taskObject.name.length == 0 ||
                            taskObject.dueDate.length == 0 ||
                            taskObject.assignee.length == 0
                        "
                        @click="saveTask"
                        :loading="loading"
                        >{{ $t('common.add') }}</v-btn
                    >
                    <v-btn text small @click="dialog = false" class="mr-2">{{
                        $t('common.close')
                    }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import BPMNEngine from '@/api/BPMNEngine';
import icon from '@/components/common/SymperIcon';
import datePicker from '@/components/common/datePicker';
import userSelector from '../UserSelector';
import TaskListFilter from '@/components/tasks/list/TaskListFilter.vue';
import SymperDocSelect from '@/components/common/symperInputs/SymperDocumentSelect.vue';
import { defaultTaskDescription } from '@/components/process/elementDefinitions/customExtToModel';
import { util } from '@/plugins/util';

export default {
    created() {
        this.$store.dispatch('process/getAllDefinitions');
    },
    name: 'listHeaderDoc',
    watch: {
        sortBy: {
            deep: true,
            immediate: true,
            handler(after) {
                this.handleChangeFilterValue();
            }
        },
        orderBy: {
            deep: true,
            immediate: true,
            handler(after) {
                this.handleChangeFilterValue();
            }
        },
        searchTaskKey(vl) {
            this.handleChangeFilterValue();
        }
    },
    components: {
        icon: icon,
        userSelector: userSelector,
        datePicker: datePicker,
        TaskListFilter: TaskListFilter,
        'symper-document-selec': SymperDocSelect
    },
    props: {
        isSmallRow: {
            type: Boolean,
            default: true
        },
        sideBySideMode: {
            type: Boolean,
            default: true
        },
        compackMode: {
            type: Boolean,
            default: true
        },
        headerTitle: {
            type: String,
            default() {
                return this.$t('myItem.headerDoc');
            }
        },
        parentTaskId: {
            type: String,
            default: ''
        }
    },
    data: function () {
        return {
            loading: false,
            closeOnClick: true,
            workStatus: 'notDone',
            searchTaskKey: '',
            sortOption: [
                {
                    label: this.$t('tasks.header.date'),
                    value: 'createTime',
                    callback: (e) => {}
                },
                {
                    label: this.$t('tasks.header.dueDate'),
                    value: 'dueDate',
                    callback: (e) => {}
                },
                {
                    label: this.$t('tasks.header.description'),
                    value: 'description',
                    callback: (e) => {}
                }
            ],
            orderOption: [
                {
                    label: this.$t('order.ascending'),
                    value: 'asc',
                    callback: (e) => {}
                },
                {
                    label: this.$t('order.descending'),
                    value: 'desc',
                    callback: (e) => {}
                }
            ],
            sortBy: null,
            orderBy: null,
            queryProcessInstance: 'runtime/process-instances',
            listProrcessInstances: [],
            dialog: false,
            selectedProcess: null,
            taskObject: {
                name: '',
                assignee: '',
                dueDate: '',
                description: '',
                docId: ''
            },
            filterList: {},
            listObjectType: [
                {
                    title: this.$t('v2.myItem.task'),
                    icon: 'mdi-check-all'
                },
                {
                    title: this.$t('v2.myItem.work'),
                    icon: 'mdi-briefcase-check-outline'
                },
                {
                    title: this.$t('v2.myItem.document'),
                    icon: 'mdi-file-document-outline'
                }
            ]
        };
    },
    mounted() {
        //this.getProcessInstance();
    },
    methods: {
        changeObjectType(index) {
            this.$emit('changeObjectType', index);
        },
        inputAssignee(data) {
            console.log('userId', data);
            this.taskObject.assignee = data;
        },
        refreshTaskList() {
            this.$emit('refresh-task-list');
        },
        handleChangeFilterValue(data = {}) {
            if ($.isEmptyObject(data)) {
                if (this.orderBy !== null) {
                    this.filterList.order =
                        this.orderOption[this.orderBy].value;
                }
                if (this.sortBy !== null) {
                    this.filterList.sort = this.sortOption[this.sortBy].value;
                }
            } else {
                this.filterList = Object.assign(this.filterList, data);
            }
            this.filterList.nameLike = `%${this.searchTaskKey}%`;
            this.$emit('filter-change-value', this.filterList);
            if (data.status) {
                this.workStatus = data.status;
            }
        },
        openCreateTaskDialog() {
            this.dialog = true;
        },
        changeDensity() {
            this.$emit('change-density');
        },
        getProcessInstance() {
            BPMNEngine.getProcessInstance()
                .then((res) => {
                    if (res.total > 0) {
                        let listProccess = [];
                        let objects = [];
                        res.data.forEach((item) => {
                            if (
                                listProccess.indexOf(item.processDefinitionId) <
                                0
                            ) {
                                listProccess.push(item.processDefinitionId);
                            }
                            let index = listProccess.indexOf(
                                item.processDefinitionId
                            );
                            item.tasks = [];
                            if (objects[index] != undefined) {
                                objects[index].objects.push(item);
                            } else {
                                objects.push({
                                    processDefinitionId:
                                        item.processDefinitionId,
                                    processDefinitionName:
                                        item.processDefinitionName,
                                    objects: [item]
                                });
                            }
                        });
                        this.listProrcessInstances = objects;
                        this.$emit('get-list-process-instance', objects);
                    }
                })
                .catch((err) => {});
        },
        selectProcess(process) {
            this.selectedProcess = process;
            this.openCreateTaskDialog();
        },
        showError() {
            this.$snotify({
                type: 'error',
                title: this.$t('notification.errorTitle'),
                text: this.$t('notification.error')
            });
        },
        async saveTask() {
            this.loading = true;
            if (!this.taskObject.assignee) {
                this.$snotifyError(
                    {},
                    this.$t('tasks.error.canNotCreateTask'),
                    this.$t('tasks.error.emptyAssignee')
                );
                return;
            }
            let data = {
                ...this.taskObject,
                assignee: this.taskObject.assignee,
                parentTaskId: this.parentTaskId ? this.parentTaskId : '',
                owner: this.$store.state.app.endUserInfo.id
            };
            let description = util.cloneDeep(defaultTaskDescription);
            description.action.module = 'task';
            description.action.resource = 'task';
            if (this.taskObject.docId) {
                description.action.action = 'submit';
                description.action.parameter.documentId = this.taskObject.docId;
            } else {
                description.action.action = 'submitAdhocTask';
            }

            description.content = this.taskObject.name;

            if (
                this.taskObject.description == '' ||
                this.taskObject.description == null
            ) {
                description.extraLabel = this.$t(
                    'tasks.header.alertDescription'
                );
            } else {
                description.extraLabel = this.taskObject.description;
            }
            data.description = JSON.stringify(description);
            let res = await BPMNEngine.addTask(JSON.stringify(data));
            if (res.id != undefined) {
                this.selectedProcess = null;
                this.dialog = false;
                this.$emit('create-task', res);
                this.$snotifySuccess(this.$t('tasks.created'));
            } else {
                this.showError();
            }
            this.loading = false;
        }
    }
};
</script>

<style scoped>
.v-list-item {
    cursor: pointer;
}
.v-list-item:hover {
    background-color: #f5f5f5 !important                                                                                ;
}
</style>

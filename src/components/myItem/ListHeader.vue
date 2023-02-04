<template>
    <div class="w-100 d-flex justify-space-between py-2">
        <div class="pl-3 symper-title" v-if="!sideBySideMode">
            {{ headerTitle }}
        </div>
        <div
            :class="{
                'pr-0 d-flex': true,
                'w-100': sideBySideMode,
            }"
        >
            <SearchBox
                style="margin-right: 8px; height: 28px !important"
                v-if="!changeStatusMoreApproval"
                v-model="searchTaskKey"
                :searchBlank="true"
                @search-input-change="handleChangeFilterValue"
                :disableBoxSearch="disableBoxSearch"
            />
            <!-- Add task -->
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn
                        v-on="on"
                        v-if="!sideBySideMode && !changeStatusMoreApproval"
                        small
                        class="mr-2"
                        depressed
                        @click="openCreateTaskDialog"
                    >
                        <v-icon size="18">mdi-plus</v-icon>
                        <span class="ml-2">{{ $t('myItem.createTask') }}</span>
                    </v-btn>
                </template>
                <span>{{ $t('myItem.createTask') }}</span>
            </v-tooltip>
            <v-menu
                :close-on-content-click="true"
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
                                v-show="
                                    !changeStatusMoreApproval && !sideBySideMode
                                "
                                small
                            >
                                <v-icon size="18"
                                    >mdi-filter-menu-outline</v-icon
                                >
                                <span v-if="!sideBySideMode" class="ml-2">{{
                                    listObjectType[objectType].title
                                }}</span>
                            </v-btn>
                        </template>
                        <span>{{ listObjectType[objectType].title }}</span>
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
            <v-menu offset-y nudge-bottom="8" :max-width="210" :min-width="210">
                <template v-slot:activator="{ on: menu }">
                    <v-tooltip top>
                        <template v-slot:activator="{ on: tooltip }">
                            <v-btn
                                @click="isClose = true"
                                depressed
                                small
                                v-show="
                                    !sideBySideMode &&
                                    objectType == 0 &&
                                    !changeStatusMoreApproval
                                "
                                class="mr-2"
                                v-on="{ ...tooltip, ...menu }"
                                :disabled="disableAction"
                            >
                                <v-icon
                                    dark
                                    class="mr-0"
                                    :style="{
                                        color: selectedFilterName
                                            ? '#FF8C00!important'
                                            : 'black',
                                    }"
                                    >mdi-filter-outline</v-icon
                                >
                                <span style="color: #ff8c00 !important">{{
                                    selectedFilterName
                                }}</span>

                                <v-icon
                                    v-if="selectedFilterName"
                                    class="ml-2"
                                    style="font-size: 14px"
                                    @click.prevent.stop="refreshFilter"
                                    >mdi-close</v-icon
                                >
                            </v-btn>
                        </template>
                        <span>{{ $t('common.filter') }}</span>
                    </v-tooltip>
                </template>
                <config-filter
                    @select-filter="selectedFilter"
                    @config-filter-action="configFilterAction"
                    @add-filter-config="addFilterConfig"
                    :filter="listFilters"
                />
            </v-menu>
            <!-- duyệt theo lô -->
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn
                        v-show="!sideBySideMode && objectType == 0"
                        v-on="on"
                        small
                        class="mr-3"
                        depressed
                        @click="handleMoreApproval"
                    >
                        <v-icon size="18" v-if="!changeStatusMoreApproval"
                            >mdi-format-list-checks</v-icon
                        >
                        <span v-else
                            ><i
                                class="mdi mdi-clipboard-text-play-outline fs-18"
                            ></i
                            >{{ $t('common.all_task') }}</span
                        >
                    </v-btn>
                </template>
                <span>{{
                    changeStatusMoreApproval
                        ? $t('tasks.backTaskList')
                        : $t('tasks.batchApproval')
                }}</span>
            </v-tooltip>
            <v-btn
                small
                solo
                depressed
                class="mr-2"
                @click="refreshTaskList"
                v-show="!sideBySideMode && !changeStatusMoreApproval"
            >
                <v-icon size="18">mdi-refresh</v-icon>
            </v-btn>
            <v-menu
                offset-y
                nudge-bottom="8"
                :max-width="230"
                :min-width="210"
                :close-on-content-click="false"
            >
                <template v-slot:activator="{ on }">
                    <v-btn
                        small
                        v-on="on"
                        solo
                        depressed
                        class="mr-2"
                        v-show="
                            !sideBySideMode &&
                            objectType == 0 &&
                            !changeStatusMoreApproval
                        "
                        :disabled="disableAction"
                    >
                        <v-icon size="18">mdi-dots-horizontal</v-icon>
                    </v-btn>
                </template>
                <div
                    class="d-flex flex-column bg-white px-4 py-3"
                    style="width: 230px"
                >
                    <div class="font-weight-bold fs-13">
                        {{ $t('tasks.settingTask') }}
                    </div>
                    <div>
                        <div class="d-flex w-100">
                            <div style="width: 160px" class="mt-2">
                                {{ $t('tasks.autoComplete') }}
                            </div>
                            <v-switch
                                v-model="completeWhenSubmit"
                                @change="handleChangeCompleteWhenSubmit"
                                color="orange"
                                hide-details
                                class="mt-0"
                            ></v-switch>
                        </div>
                        <div class="d-flex w-100 mt-2">
                            <div style="width: 160px" class="mt-2">
                                {{ $t('tasks.deleteTasks') }}
                            </div>
                            <v-switch
                                v-model="openCheckbox"
                                color="orange"
                                hide-details
                                class="mt-0"
                            ></v-switch>
                        </div>
                    </div>
                </div>
            </v-menu>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn v-if="showCloseBtn"
                        v-on="on"
                        small
                        class="mr-3"
                        v-show="
                            !sideBySideMode &&
                            objectType == 0 &&
                            !changeStatusMoreApproval
                        "
                        depressed
                        @click="$emit('close')"
                    >
                        <v-icon size="18">mdi-close</v-icon>
                    </v-btn>
                </template>
                <span>{{ $t('common.close') }}</span>
            </v-tooltip>
        </div>
        <DialogCreateAdhocTask
            ref="dialogCreateAdhocTask"
            :taskObject="taskObject"
            @create-task="handleCreateAdhocTaskSuccess"
            :parentTaskId="parentTaskId"
        />
    </div>
</template>

<script>
import icon from '@/components/common/SymperIcon';
import ConfigFilter from '@/components/common/ListItemConfigFilter';
import DialogCreateAdhocTask from '@/components/myItem/DialogCreateAdhocTask';
import MenuTpl from '@/components/common/MenuTpl';
import SearchBox from '@/components/common/SearchBox';

export default {
    created() {
        this.$store.dispatch('process/getAllDefinitions');
    },
    name: 'listHeader',
    components: {
        icon: icon,
        ConfigFilter,
        DialogCreateAdhocTask,
        MenuTpl,
        SearchBox,
    },
    props: {
        showCloseBtn: {
            type: Boolean,
            default: false,
        },
        objectType: {
            type: Number,
        },
        changeStatusMoreApproval: {
            type: Boolean,
            default: false,
        },
        sideBySideMode: {
            type: Boolean,
            default: true,
        },
        listFilters: {
            type: Array,
            default() {
                return [];
            },
        },
        parentTaskId: {
            type: String,
            default: '',
        },
        selectedFilterName: {
            type: String,
            default: '',
        },
        disableAction: {
            type: Boolean,
            default: false,
        },
        disableBoxSearch: {
            type: Boolean,
            default: false,
        },
    },
    data: function () {
        return {
            closeOnClick: true,
            taskStatus: 'notDone',
            isClose: true,
            searchTaskKey: '',
            sortOption: [
                {
                    label: this.$t('tasks.header.date'),
                    value: 'createTime',
                    callback: (e) => {},
                },
                {
                    label: this.$t('tasks.header.dueDate'),
                    value: 'dueDate',
                    callback: (e) => {},
                },
                {
                    label: this.$t('tasks.header.description'),
                    value: 'description',
                    callback: (e) => {},
                },
            ],
            orderOption: [
                {
                    label: this.$t('order.ascending'),
                    value: 'asc',
                    callback: (e) => {},
                },
                {
                    label: this.$t('order.descending'),
                    value: 'desc',
                    callback: (e) => {},
                },
            ],
            sortBy: null,
            orderBy: null,
            queryProcessInstance: 'runtime/process-instances',
            addFilter: false,
            selectedProcess: null,
            completeWhenSubmit: false,
            taskObject: {
                name: '',
                assignee: '',
                dueDate: '',
                description: '',
                docId: '',
            },
            filterList: {},
            listObjectType: [
                {
                    title: this.$t('myItem.objectType.task'),
                    icon: 'mdi-check-all',
                },
                {
                    title: this.$t('myItem.objectType.work'),
                    icon: 'mdi-briefcase-check-outline',
                },
                {
                    title: this.$t('myItem.objectType.document'),
                    icon: 'mdi-file-document-outline',
                },
            ],
            openCheckbox: false,
            headerTitle: this.$t('process.taskList'),
        };
    },
    methods: {
        handleChangeCompleteWhenSubmit(val) {
            this.$emit('complete-when-submit-toggle', val);
        },
        setValueCompleteWhenSubmit(value) {
            this.$set(this, 'completeWhenSubmit', value);
        },
        handleCreateAdhocTaskSuccess(res) {
            this.$emit('create-task', res);
        },
        changeObjectType(index) {
            this.$emit('changeObjectType', index);
        },
        handleMoreApproval() {
            this.$emit('goToPageApproval');
        },
        inputAssignee(data) {
            this.taskObject.assignee = data;
        },
        refreshTaskList() {
            this.$emit('refresh-task-list');
        },
        refreshFilter() {
            this.$emit('refresh-filter');
        },
        selectedFilter(filterIdx) {
            this.$emit('select-filter', filterIdx);
        },
        configFilterAction(data) {
            this.$emit('config-filter-action', data);
        },
        addFilterConfig() {
            this.$emit('add-filter-config');
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
            this.filterList.nameLike = this.searchTaskKey;
            this.$emit('filter-change-value', this.filterList);
            if (data.status) {
                this.taskStatus = data.status;
            }
        },
        openCreateTaskDialog() {
            this.$refs.dialogCreateAdhocTask.show();
        },
        selectProcess(process) {
            this.selectedProcess = process;
            this.openCreateTaskDialog();
        },
        showError() {
            this.$snotify({
                type: 'error',
                title: this.$t('notification.errorTitle'),
                text: this.$t('notification.error'),
            });
        },
    },
    watch: {
        openCheckbox(val) {
            this.$emit('open-check-box', val);
        },
        objectType() {
            if (this.objectType == 0) {
                this.headerTitle = this.$t('process.taskList');
            } else if (this.objectType == 1) {
                this.headerTitle = this.$t('myItem.header');
            } else if (this.objectType == 2) {
                this.headerTitle = this.$t('myItem.headerDoc');
            }
        },
    },
};
</script>

<style scoped>
.v-list-item {
    cursor: pointer;
}
.v-list-item:hover {
    background-color: #f5f5f5 !important                                                                                ;
}
/* .v-text-field >>> .v-input--dense:not(.v-text-field--outlined) >>> input {
    padding: 10px 0 11px !important;
} */
.color-orange {
    background-color: orange !important;
}
</style>

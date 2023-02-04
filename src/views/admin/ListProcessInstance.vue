<template>
    <div
        :class="{
            'd-flex flex-column w-100 h-100': true,
            'fullscreen-mode': showSwitchBtn == false,
            'list-process-instance': true
        }"
    >
        <div class="d-flex align-center">
            <div class="ml-2 mt-2" style="flex-grow: 1;font-size: 18px !important">
                <h3>{{ $t('v2.admin.listProcessInstance') }}</h3>
            </div>

            <v-btn
                v-show="checkHasPermission('delete_instance')"
                class="mr-2 white--text"
                depressed
                color="error"
                small
                :disabled="disableBtn"
                @click="confirmDelete"
            >
                {{ $t('common.delete') }}
            </v-btn>
            <v-btn
                v-show="checkHasPermission('stop_instance')"
                class="mr-2 white--text"
                depressed
                color="orange"
                small
                :disabled="disableBtn"
                @click="stopProcessInstance"
            >
                {{ $t('v2.admin.stop') }}
            </v-btn>
            <v-btn
                v-show="checkHasPermission('run_instance')"
                :class="{ 'mr-2 white--text': true }"
                depressed
                color="primary"
                small
                :disabled="disableBtn"
                @click="activeProcessInstance"
            >
                {{ $t('v2.admin.run') }}
            </v-btn>
            <v-btn
                v-show="checkHasPermission('complete_instance')"
                :class="{
                    'mr-2 white--text': true,
                    'mr-8': showSwitchBtn == false
                }"
                depressed
                color="success"
                small
                :disabled="disableBtn"
                @click="endProcessInstance"
            >
                {{ $t('v2.admin.complete') }}
            </v-btn>

            <v-tooltip bottom v-if="showSwitchBtn">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        tile
                        v-bind="attrs"
                        v-on="on"
                        class="mr-3 white--text"
                        color="primary"
                        small
                        @click="switchFullScreen"
                    >
                        <v-icon small> mdi-monitor-share </v-icon>
                    </v-btn>
                </template>
                <span>{{ $t('v2.admin.fullScreen') }}</span>
            </v-tooltip>
        </div>
        <ConfirmDelete
            :showDialog="showDialog"
            v-if="showDialog"
            @cancel="cancel"
            @confirm="deleteProcessInstance"
            :idItem="componentData.id"
        />
        <ListItems
            ref="listWorkFlow"
            :pageTitle="$t('v2.admin.listProcessInstance')"
            :showButtonAdd="false"
            :getDataUrl="apiUrl"
            :showExportButton="false"
            :showImportButton="false"
            :useDefaultContext="false"
            :customAPIResult="customAPIResult"
            :containerHeight="containerHeight"
            :headerPrefixKeypath="'v2.admin'"
            :tableContextMenu="tableContextMenu"
            :showToolbar="false"
            @row-selected-change="handleRowSelectionChanged"
            :isTablereadOnly="false"
            :customRenderForFilter="customRenderForFilter"
            @after-selected-row="afterSelectedRow"
            :showImportHistoryBtn="false"
            :showActionPanelInDisplayConfig="false"
            :emptyDataKey="'workflow-deploy-history-ran'"
            :commonActionProps="commonActionProps"
        />
    </div>
</template>

<script>
import ConfirmDelete from './ConfirmDelete';
import { util } from '@/plugins/util.js';
import { appConfigs } from './../../configs.js';
import { adminApi } from '@/api/Admin.js';
import ListItems from '@/components/common/ListItems.vue';
import WorkflowAdminWorker from 'worker-loader!@/worker/admin/WorkflowAdmin.Worker.js';
export default {
    components: {
        ConfirmDelete,
        ListItems
    },
    props: {
        showSwitchBtn: {
            type: Boolean,
            default: false
        },
        itemData: {
            type: Object
        }
    },
    created() {},
    data() {
        let self = this;
        return {
            showDialog: false,
            disableBtn: true,
            customRenderForFilter(columnName, items) {
                if (columnName == 'status') {
                    items.forEach(function (e) {
                        if (columnName == 'status') {
                            items.forEach(function (e) {
                                if (e.value == '1') {
                                    e.label = self.$t('v2.admin.running');
                                } else if (e.value == '2') {
                                    e.label = self.$t('v2.admin.stop');
                                } else if (e.value == '3') {
                                    e.label = self.$t('v2.admin.complete');
                                }
                            });
                        }
                    });
                }
                return items;
            },
            listItemSelected: [],
            customAPIResult: {
                async reformatData(res) {
                    if (res.data.listObject.length > 0) {
                        let arr = [];
                        res.data.listObject.forEach(function (e) {
                            arr.push(e.id);
                            let processDefId = e.processDefinitionId.split(':');
                            e.nameVersion = processDefId[1];
                        });
                        let obj = res.data.listObject;
                        let userId = await adminApi.getStartUserName(arr);
                        obj.forEach(function (e) {
                            userId.data.forEach(function (k) {
                                if (e.id == k.processInstanceId) {
                                    let mapIdToUser =
                                        self.$store.getters['app/mapIdToUser'];
                                    let newName = k.value.split(':')[0];
                                    if (mapIdToUser[newName]) {
                                        e.startUserName =
                                            mapIdToUser[newName].displayName;
                                    } else e.startUserName = '';
                                }
                            });
                        });
                        res.data.listObject.sort(function (a, b) {
                            var c = new Date(a.startTime);
                            var d = new Date(b.startTime);
                            return d - c;
                        });
                    }
                    self.$refs.listWorkFlow.rerenderTable();
                    return {
                        columns: [
                            { name: 'id', title: 'id', type: 'numeric' },
                            { name: 'name', title: 'name', type: 'text' },
                            {
                                name: 'startUserName',
                                title: 'startUserId',
                                type: 'text',
                                noFilter: true
                            },
                            {
                                name: 'status',
                                title: 'status',
                                type: 'date',
                                cellRenderer: function (params) {
                                    if (params.value == '1') {
                                        return `<span style="color: blue">${self.$t(
                                            'v2.admin.running'
                                        )}</span>`;
                                    }
                                    if (params.value == '2') {
                                        return `<span style="color: orange">${self.$t(
                                            'v2.admin.stop'
                                        )}</span>`;
                                    }
                                    if (params.value == '3') {
                                        return `<span style="color: green">${self.$t(
                                            'v2.admin.complete'
                                        )}</span>`;
                                    }
                                }
                            },
                            {
                                name: 'nameVersion',
                                title: 'nameVersion',
                                type: 'text',
                                noFilter: true
                            },
                            {
                                name: 'startTime',
                                title: 'startTime',
                                type: 'text',
                                cellRenderer: function (params) {
                                    let newValue = self
                                        .$moment(params.value)
                                        .format('YYYY-MM-DD HH:mm:ss');
                                    return '<span>' + newValue + '</span>';
                                }
                            },
                            {
                                name: 'endTime',
                                title: 'endTime',
                                type: 'text',
                                cellRenderer: function (params) {
                                    let newValue = self
                                        .$moment(params.value)
                                        .format('YYYY-MM-DD HH:mm:ss');
                                    return '<span>' + newValue + '</span>';
                                }
                            }
                        ],
                        listObject: res.data.listObject,
                        total: res.data.total
                    };
                }
            },
            containerHeight: null,
            workflowAdminWorker: null,
            tableContextMenu: {
                view_instance: {
                    name: 'View details instance',
                    text: self.$t('v2.admin.viewDetailTask'),
                    callback: (obj, callback) => {
                        self.$goToPage(
                            '/work/' + obj.id,
                            self.$t('v2.admin.detail') +
                                (obj.name ? obj.name : '')
                        );
                    }
                },
                tracking: {
                    name: 'detail',
                    text: self.$t('common.tracking'),
                    alwaysShow: true,
                    callback: (row, callback) => {
                        self.$goToPage(
                            `/workflow/process-instances/${row.id}/tracking`
                        );
                    }
                }
            }
        };
    },
    computed: {
        apiUrl() {
            let processKey = this.$store.state.admin.processKey;
            if (!processKey) {
                processKey = this.$route.params.processKey;
            }
            return (
                appConfigs.apiDomain.workflowExtend +
                processKey +
                '/process-instances'
            );
        },
        processKey() {
            return this.$store.state.admin.processKey;
        },
        commonActionProps() {
            return {
                module: 'workflow_definition',
                resource: 'workflow_definition',
                scope: 'workflow_definition',
                parentId: this.componentData ? this.componentData.id : 0
            };
        },
        componentData() {
            if (!this.showSwitchBtn) {
                if (this.$route.params.extraData)
                    return this.$route.params.extraData;
            } else if (Object.keys(this.itemData).length > 0) {
                return this.itemData;
            } else
                return {
                    id: this.$route.params.id
                };
        }
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
        this.workflowAdminWorker = new WorkflowAdminWorker();
        let self = this;
        this.workflowAdminWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'endProcessInstance':
                    self.notifyMessage(
                        data.dataAfter,
                        self.$t('v2.admin.taskCompleted'),
                        self.$t('v2.admin.completeTaskSuccess')
                    );
                    break;
                case 'stopProcessInstance':
                    self.notifyMessage(
                        data.dataAfter,
                        self.$t('v2.admin.taskCompleted'),
                        self.$t('v2.admin.stopTaskSuccess')
                    );
                    break;
                case 'activeProcessInstance':
                    self.notifyMessage(
                        data.dataAfter,
                        self.$t('v2.admin.taskCompleted'),
                        self.$t('v2.admin.runTaskSuccess')
                    );
                    break;
                case 'deleteProcessInstance':
                    if (data.dataAfter.resDoc == 'notFound') {
                        self.$snotify({
                            type: 'error',
                            title: self.$t('v2.admin.notFoundRelatedDoc')
                        });
                    } else if (data.dataAfter.resDoc == 'done') {
                        self.$snotify({
                            type: 'success',
                            title: self.$t('v2.admin.deleteRelatedDocSuccess')
                        });
                    }
                    self.notifyMessage(
                        data.dataAfter.newLists,
                        self.$t('v2.admin.taskCompleted'),
                        self.$t('v2.admin.deleteTaskSuccess')
                    );
                    break;
                default:
                    break;
            }
        });
        this.$refs.listWorkFlow.addCheckBoxColumn();
    },
    watch: {
        processKey(val) {
            this.listItemSelected = [];
        },
        listItemSelected: {
            deep: true,
            immediate: true,
            handler(obj) {
                if (Object.keys(obj).length == 0) {
                    this.disableBtn = true;
                } else {
                    this.disableBtn = false;
                }
            }
        }
    },
    methods: {
        checkHasPermission(action) {
            let objectTypePermission =
                this.$store.state.app.userOperations['workflow_definition'];
            let hasCreatePermission = true;
            if (!util.auth.isSupportter()) {
                hasCreatePermission =
                    objectTypePermission &&
                    objectTypePermission[this.componentData.id] &&
                    objectTypePermission[this.componentData.id][action];
            }
            return hasCreatePermission;
        },
        afterSelectedRow(items) {
            this.$set(this, 'listItemSelected', items);
            if (Object.keys(this.listItemSelected).length == 0) {
                this.disableBtn = true;
            } else {
                this.disableBtn = false;
            }
        },
        handleRowSelectionChanged(arr) {
            this.$set(this, 'listItemSelected', arr);
            if (this.listItemSelected.length == 0) {
                this.disableBtn = true;
            } else {
                this.disableBtn = false;
            }
        },
        notifyMessage(data, titleError, titleSuccess) {
            let self = this;
            data.forEach(function (e) {
                if (e == 'isDone') {
                    self.$snotify({
                        type: 'error',
                        title: titleError
                    });
                } else if (e == 'done') {
                    self.$snotify({
                        type: 'success',
                        title: titleSuccess
                    });
                } else if (e == 'isStop') {
                    self.$snotify({
                        type: 'error',
                        title: self.$t('v2.admin.taskIsStopped')
                    });
                } else if (e == 'isRunning') {
                    self.$snotify({
                        type: 'error',
                        title: self.$t('v2.admin.taskIsRunning')
                    });
                }
            });
            setTimeout(() => {
                self.$refs.listWorkFlow.refreshList();
                self.$refs.listWorkFlow.clearRowSelected();
            }, 200);
        },
        switchFullScreen() {
            let processKey = this.$store.state.admin.processKey;
            this.$goToPage(
                '/workflow/process-key/' + processKey + '/list-instances',
                this.$t('process.instance.listModelInstance') + processKey,
                false,
                false,
                {
                    id: this.componentData.id
                }
            );
        },
        stopProcessInstance() {
            this.workflowAdminWorker.postMessage({
                action: 'stopProcessInstance',
                data: {
                    listItemSelected: this.listItemSelected
                }
            });
        },
        endProcessInstance() {
            this.workflowAdminWorker.postMessage({
                action: 'endProcessInstance',
                data: {
                    listItemSelected: this.listItemSelected
                }
            });
        },
        activeProcessInstance() {
            this.workflowAdminWorker.postMessage({
                action: 'activeProcessInstance',
                data: {
                    listItemSelected: this.listItemSelected
                }
            });
        },
        confirmDelete() {
            this.showDialog = true;
        },
        addCheckBoxColumn() {
            this.$refs.listWorkFlow.addCheckBoxColumn();
        },
        deleteProcessInstance(value) {
            this.showDialog = false;
            this.workflowAdminWorker.postMessage({
                action: 'deleteProcessInstance',
                data: {
                    listItemSelected: this.listItemSelected,
                    isDeleteDoc: value
                }
            });
        },
        cancel() {
            this.showDialog = false;
        }
    }
};
</script>

<style scoped>
.fullscreen-mode >>> button {
    margin-top: 10px !important;
}
.list-process-instance >>> .ag-selection-checkbox {
    height: 18px !important;
}
</style>

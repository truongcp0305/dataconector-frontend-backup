<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listDashboard"
            :getDataUrl="apiUrl"
            :headerPrefixKeypath="'table'"
            :pageTitle="$t('bi.dashboard.title-show-list')"
            :containerHeight="containerHeight"
            :tableContextMenu="tableContextMenu"
            :showExportButton="false"
            :customAPIResult="customAPIResult"
            :useDefaultContext="false"
            :useActionPanel="false"
            :emptyDataKey="'bi-dashboard-list'"
            :commonActionProps="{
                module: 'dashboard',
                resource: 'dashboard',
                scope: 'dashboard'
            }"
            @on-add-item-clicked="addDashboard"
        >
        </ListItems>
    </div>
</template>
<script>
import ListItems from '@/components/common/ListItems';
import DashboardEditorWorker from 'worker-loader!@/worker/dashboard/DasboardEditor.Worker.js';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs';
export default {
    name: 'listApps',
    components: {
        ListItems
    },
    created() {
        this.dashboardEditorWorker = new DashboardEditorWorker();
        this.listenFromWorker();
        this.$setTabTitle(this.$t('bi.dashboard.title-show-list'));
    },
    data: function () {
        let self = this;
        let dt = {
            containerHeight: 0,
            apiUrl: appConfigs.apiDomain.biService + '/dashboards',
            dashboardEditorWorker: null,
            tableContextMenu: {
                update: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: (obj, callback) => {
                        self.$goToPage(
                            '/dashboards/' + obj.id + '/edit',
                            self.$t('common.edit') +
                                ' ' +
                                (obj.name ? obj.name : '')
                        );
                    }
                },
                view: {
                    name: 'view',
                    text: this.$t('common.view'),
                    callback: (obj, callback) => {
                        self.$goToPage(
                            '/dashboards/' + obj.id + '/view',
                            self.$t('common.detail') +
                                ' ' +
                                (obj.name ? obj.name : '')
                        );
                    }
                },
                clone: {
                    name: 'clone',
                    text: this.$t('common.clone'),
                    callback: (obj, callback) => {
                        self.$goToPage(
                            '/dashboards/' + obj.id + '/clone',
                            self.$t('common.clone') +
                                ' ' +
                                (obj.name ? obj.name : '')
                        );
                    }
                },
                delete: {
                    name: 'delete',
                    text: this.$t('common.delete'),
                    callback: (rows, callback) => {
                        self.deleteRows(rows);
                    }
                }
            },
            customAPIResult: {
                reformatData(res) {
                    return {
                        columns: [
                            { name: 'id', title: 'id', type: 'text' },
                            {
                                name: 'createdAt',
                                title: 'createdAt',
                                type: 'date',
                                flex: 1
                            },
                            {
                                name: 'name',
                                title: 'name',
                                type: 'text',
                                flex: 1
                            },
                            { name: 'id', title: 'id', type: 'text', flex: 1 },
                            {
                                name: 'updatedAt',
                                title: 'updatedAt',
                                type: 'text',
                                flex: 1
                            },
                            {
                                name: 'userCreate',
                                title: 'userCreate',
                                type: 'text',
                                flex: 1
                            },
                            {
                                name: 'userLastUpdate',
                                title: 'userLastUpdate',
                                type: 'text',
                                flex: 1
                            }
                        ],
                        listObject: res.data.listObject,
                        total: res.data.total
                    };
                }
            }
        };
        if (!window.origin.includes(`inter-apps.${SYMPER_ENV.tenant_domain}`)) {
            dt.tableContextMenu.editOnClickhouseMode = {
                name: 'editOnClickhouseMode',
                text: self.$t(
                    'v2.dashboard.checkPerformanceWithLargeData'
                ),
                callback: (obj, callback) => {
                    self.$goToPage(
                        '/dashboards/' + obj.id + '/edit-in-clickhouse-mode',
                        self.$t(
                            'v2.dashboard.editDashboardWithClickhouseMode'
                        )
                    );
                }
            };
        }
        return dt;
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
    methods: {
        addDashboard() {
            this.$goToPage(
                '/dashboards/create',
                this.$t('v2.dashboard.createDashboard')
            );
        },
        listenFromWorker() {
            let self = this;
            this.dashboardEditorWorker.addEventListener(
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
        deleteRows(rows) {
            this.dashboardEditorWorker.postMessage({
                action: 'deleteRows',
                data: {
                    rows: rows
                }
            });
        },
        handleDeleteRows(data) {
            if (data == 200) {
                this.$snotifySuccess(
                    this.$t('v2.dashboard.deleteSuccess')
                );
            } else {
                this.$snotifyError(this.$t('v2.dashboard.deleteFail'));
            }
            this.$refs.listDashboard.refreshList();
        }
    }
};
</script>

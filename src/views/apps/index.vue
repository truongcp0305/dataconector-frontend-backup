<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listApp"
            :getDataUrl="apiUrl"
            :headerPrefixKeypath="'apps.header'"
            :pageTitle="$t('apps.titleApplication')"
            :containerHeight="tableHeight"
            :tableContextMenu="tableContextMenu"
            :useDefaultContext="false"
            :customGetDataForFilter="customGetDataForFilter"
            :customConditionsForFilter="customConditionsForFilter"
            :actionPanelWidth="600"
            :flexMode="true"
            :showExportButton="false"
            @after-open-add-panel="showAddModal"
            :customAPIResult="customAPIResult"
            :showActionPanelInDisplayConfig="true"
            :commonActionProps="commonActionProps"
            :customRenderForFilter="customRenderForFilter"
            @row-selected="onRowSelected"
            :emptyDataKey="'application-list'"
        >
            <div slot="right-panel-content" class="h-100">
                <updateApp
                    ref="actionPanel"
                    :isEdit="isEdit"
                    @add-app="addApp"
                    @update-app="updateApp"
                    @close-app-form="closeAppForm"
                ></updateApp>
            </div>
        </ListItems>
    </div>
</template>
<script>
import ListItems from '@/components/common/ListItems';
import UpdateApp from './Update';
import { appManagementApi } from '@/api/AppManagement.js';
import ApplicationWorker from 'worker-loader!@/worker/application/Application.Worker.js';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs';
export default {
    name: 'listApps',
    components: {
        ListItems,
        UpdateApp,
    },
    created() {
        this.$store.dispatch('actionPack/getAllActionByObjectType');
    },
    data: function () {
        let self = this;
        return {
            customConditionsForFilter: {
                status: function (option, filter) {
                    if (Object.keys(filter.valuesIn).length > 0) {
                        for (let i in filter.valuesIn) {
                            option.conditions.push({
                                name: 'equal',
                                value: i,
                            });
                        }
                    }
                    if (Object.keys(filter.valuesNotIn).length > 0) {
                        filter.selectItems.forEach((e) => {
                            if (e.checked) {
                                option.conditions.push({
                                    name: 'equal',
                                    value: e.value,
                                });
                            }
                        });
                    }
                    option.operation = 'or';
                },
            },
            customGetDataForFilter: {
                async status(colFilter) {
                    let statusTextData = [
                        {
                            label: self.$t('v2.app.active'),
                            value: '1',
                        },
                        {
                            label: self.$t('v2.app.inActive'),
                            value: '0',
                        },
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
            },
            commonActionProps: {
                module: 'application',
                resource: 'application_definition',
                scope: 'application',
            },
            customRenderForFilter(columnName, items) {
                if (columnName == 'status') {
                    items.forEach(function (e) {
                        if (e.value == '0') {
                            e.label = self.$t('v2.app.inActive');
                        } else {
                            e.label = self.$t('v2.app.active');
                        }
                    });
                }
                return items;
            },
            apiUrl: appConfigs.apiDomain.appManagement + 'application',
            isEdit: false,
            applicationWorker: null,
            customAPIResult: {
                reformatData(res) {
                    return {
                        listObject: res.data.listObject,
                        total: res.data.listObject.length,
                        columns: [
                            { name: 'id', title: 'id', type: 'text' },
                            { name: 'name', title: 'name', type: 'text' },
                            {
                                name: 'iconName',
                                title: 'icon',
                                type: 'text',
                                cellRenderer: function (params) {
                                    if (params.value != '') {
                                        return params.value.includes('mdi-')
                                            ? '<span class="mdi ' +
                                                  params.value +
                                                  '"></span>'
                                            : '<img src="' +
                                                  params.value +
                                                  '" alt="Girl in a jacket" width="20px" height="20px">';
                                    } else {
                                        return '';
                                    }
                                },
                            },
                            {
                                name: 'status',
                                title: 'status',
                                type: 'text',
                                cellRenderer: function (params) {
                                    return params.value == '1'
                                        ? `<span>${self.$t('v2.app.active')}</span>`
                                        : `<span>${self.$t('v2.app.inActive')}</span>`;
                                },
                            },
                            {
                                name: 'createdAt',
                                title: 'created_at',
                                type: 'text',
                                cellRenderer: function (params) {
                                    let newValue = params.value.slice(
                                        0,
                                        params.value.length - 3,
                                    );
                                    return '<span>' + newValue + '</span>';
                                },
                            },
                            {
                                name: 'updatedAt',
                                title: 'updated_at',
                                type: 'text',
                                cellRenderer: function (params) {
                                    let newValue = params.value.slice(
                                        0,
                                        params.value.length - 3,
                                    );
                                    return '<span>' + newValue + '</span>';
                                },
                            },
                        ],
                    };
                },
            },
            tableContextMenu: {
                update: {
                    name: 'edit',
                    text: this.$t('apps.contextMenu.edit'),
                    callback: (app, callback) => {
                        this.editCallback = callback;
                        self.openUpdateApp(app);
                    },
                },
                remove: {
                    name: 'remove',
                    text: this.$t('apps.contextMenu.remove'),
                    callback: (app, callback) => {
                        this.removeCallback = callback;
                        this.deleteApp(app);
                    },
                },
            },
            tableHeight: 0,
            arrType: {
                document_definition: [],
                orgchart: [],
                dashboard: [],
                workflow_definition: [],
            },
        };
    },
    mounted() {
        this.tableHeight = util.getComponentSize(this).h;
        let self = this;
        this.applicationWorker = new ApplicationWorker();
        this.applicationWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'deleteApp':
                    self.handlerDeleteAppMessage(data.dataAfter);
                    break;
                case 'getChildItemInApp':
                    for (let i in data.dataAfter) {
                        let newObj = {
                            obj: data.dataAfter[i],
                            type: i,
                        };
                        self.$store.commit(
                            'appConfig/updateChildrenApps',
                            newObj,
                        );
                    }
                    break;
                default:
                    break;
            }
        });
    },
    methods: {
        handlerDeleteAppMessage(res) {
            if (res.status == 200) {
                this.removeCallback(res);
                this.$snotify({
                    type: 'success',
                    title: this.$t('notification.successTitle'),
                    text: this.$t('apps.deleted'),
                });
            } else {
                this.showError();
            }
        },
        closeAppForm() {
            this.$refs.listApp.closeactionPanel();
        },
        openUpdateApp(app) {
            this.$refs.listApp.actionPanel = true;
            this.$store.commit('appConfig/emptyItemSelected');
            appManagementApi
                .getAppDetailBa(app.id)
                .then((res) => {
                    if (res.status == 200) {
                        if (
                            Object.keys(res.data.listObject.childrenApp)
                                .length > 0
                        ) {
                            this.checkChildrenApp(
                                res.data.listObject.childrenApp,
                            );
                        } else {
                            this.$store.commit('appConfig/emptyItemSelected');
                        }
                        this.showEditAppPanel(res.data.listObject);
                    } else {
                        this.showError();
                    }
                })
                .catch((err) => {
                    this.showError();
                });
        },
        onRowSelected(row) {
            if (this.$refs.listApp.alwaysShowActionPanel) {
                this.$refs.listApp.openactionPanel();
                this.openUpdateApp(row);
            }
        },
        showEditAppPanel(app) {
            this.isEdit = true;
            this.$refs.actionPanel.setAppObject(app);
        },

        showAddModal() {
            this.isEdit = false;
            this.$refs.actionPanel.setAppObject({
                name: '',
                status: false,
            });
            this.$store.commit('appConfig/emptyItemSelected');
        },
        closeSidebar() {
            this.$refs.listApp.actionPanel = false;
        },
        showError() {
            this.$snotify({
                type: 'error',
                title: this.$t('notification.errorTitle'),
                text: this.$t('notification.error'),
            });
        },
        deleteApp(app) {
            this.applicationWorker.postMessage({
                action: 'deleteApp',
                data: {
                    id: app[0].id,
                },
            });
        },
        addApp(res) {
            if (res.status == 200) {
                this.closeSidebar();
                this.$snotify({
                    type: 'success',
                    title: this.$t('notification.successTitle'),
                    text: this.$t('apps.added'),
                });
                setTimeout(
                    (self) => {
                        self.$refs.listApp.refreshList();
                    },
                    500,
                    this,
                );
            } else {
                this.showError();
            }
        },
        updateApp(res) {
            if (res.status == 200) {
                this.$refs.listApp.refreshList();
                this.closeSidebar();
                this.$snotify({
                    type: 'success',
                    title: this.$t('notification.successTitle'),
                    text: this.$t('apps.updated'),
                });
            } else {
                this.showError();
            }
        },
        checkChildrenApp(data) {
            let self = this;
            for (let i in data) {
                data[i].forEach(function (e) {
                    self.arrType[i].push(e.id);
                });
            }
            this.applicationWorker.postMessage({
                action: 'getChildItemInApp',
                data: {
                    data: self.arrType,
                },
            });
            for (let i in self.arrType) {
                self.arrType[i] = [];
            }
        },
    },
};
</script>

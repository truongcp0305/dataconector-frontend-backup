<template>
    <div class="w-100 h-100">
        <ListItems
            class="h-100"
            :flexMode="true"
            ref="listFilter"
            :actionPanelWidth="500"
            :actionPanelHeaderConfig="actionPanelHeaderConfig"
            :containerHeight="containerHeight"
            :pageTitle="$t('filterAccessControl.name')"
            :showExportButton="false"
            :headerPrefixKeypath="'table'"
            :tableContextMenu="tableContextMenu"
            :commonActionProps="commonActionProps"
            :customAPIResult="customAPIResult"
            @close-panel="closePanel"
            @show-info="$refs.filterForm.showInfo = true"
            :showCloseIcon="true"
            :getDataUrl="dataUrl"
            :emptyDataKey="'access-control-filter-list'"
            :actionPanelType="'modal'"
            @save-item="saveData"
        >
            <template slot="right-panel-content">
                <FilterForm
                    @save-success="closePanel"
                    @save-fail="saveFail"
                    :listTypeAction="listTypeAction"
                    :type="type"
                    :open="open"
                    ref="filterForm"
                />
            </template>
        </ListItems>
    </div>
</template>
<script>
import { accessControlApi } from '@/api/accessControl';
import { appConfigs } from '@/configs';
import { uiConfigApi } from '@/api/uiConfig';
import { util } from '@/plugins/util.js';

import ListItems from './../../../components/common/ListItems.vue';
import FilterForm from './FilterForm.vue';
export default {
    components: {
        ListItems,
        FilterForm
    },
    created() {
        this.getListTypeAction();
    },
    mounted() {
        const self = this;
        this.containerHeight = util.getComponentSize(this).h;
    },
    data() {
        const self = this;
        return {
            commonActionProps: {
                module: 'filter',
                resource: 'filter',
                scope: 'filter'
            },
            open: false,
            dataUrl: appConfigs.apiDomain.permission + 'filters',
            customAPIResult: {
                reformatData(res) {
                    if (res.status == 200) {
                        res.data.columns.push({
                            name: 'group',
                            title: 'group',
                            type: 'text'
                        });
                        let listUser = self.$store.state.app.allBA;
                        res.data.listObject.map((d) => {
                            d.group = d.objectIdentifier.split(':')[0];
                            if (d.status == 1) {
                                d.status = self.$t('v2.acessControl.active');
                            } else {
                                d.status = self.$t(
                                    'v2.acessControl.doNotActive'
                                );
                            }
                            listUser.map((user) => {
                                if (d.userId == user.id) {
                                    d.userId = user.name;
                                }
                            });
                        });
                        return res.data;
                    } else {
                        this.$snotifyError(
                            res,
                            this.$t('v2.acessControl.cannotGetFilterList')
                        );
                    }
                }
            },
            tableContextMenu: {
                detail: {
                    name: 'view',
                    text: this.$t('common.view'),
                    callback: (data, callback) => {
                        self.type = 'detail';
                        self.actionPanelHeaderConfig.showBtnSaveHeader = false;
                        self.$refs.listFilter.openactionPanel();
                        self.setDataFilter(data);
                        self.open = true;
                        // self.disable()
                    }
                },
                update: {
                    name: 'update',
                    text: this.$t('common.update'),
                    callback: (data, callback) => {
                        self.type = 'update';
                        self.$refs.listFilter.openactionPanel();
                        self.setDataFilter(data);
                        self.open = true;
                    }
                },
                delete: {
                    name: 'delete',
                    text: this.$t('common.delete'),
                    callback: (data, callback) => {
                        self.deleteFilter(data);
                    }
                },
                clone: {
                    name: 'clone',
                    text: this.$t('common.copy'),
                    callback: (data, callback) => {
                        self.type = 'copy';
                        self.$refs.listFilter.openactionPanel();
                        self.setDataFilter(data);
                        self.open = true;
                    }
                }
            },
            listTypeAction: [],
            type: 'add',
            actionPanelHeaderConfig: {
                nameHeaderPanel: this.$t('common.filter'),
                iconHeaderPanel: 'mdi-filter-variant',
                showBtnSaveHeader: true,
                hideHeaderPopUp: false
            }
        };
    },
    methods: {
        saveFail() {
            this.$refs.listFilter.saveFail();
        },
        saveData() {
            this.$refs.filterForm.save();
        },
        refreshPanel() {
            this.type = 'add';
            this.actionPanelHeaderConfig.showBtnSaveHeader = true;
            this.$refs.filterForm.refreshData();
        },
        closePanel() {
            this.open = false;
            this.$refs.listFilter.closeactionPanel();
            this.$refs.listFilter.refreshList();
            this.refreshPanel();
        },
        deleteFilter(data) {
            data.map((d) => {
                accessControlApi.deleteFilter(d.id).then((res) => {
                    if (res.status == 200) {
                        this.$snotifySuccess(
                            this.$t('common.notification.delete_success')
                        );
                        this.$refs.listFilter.refreshList();
                    } else {
                        this.$snotifyError(
                            this.$t('common.notification.error')
                        );
                    }
                });
            });
        },
        // lấy danh sách objectType
        getListTypeAction() {
            const self = this;
            accessControlApi.getAllTypeAction().then((res) => {
                if (res.status == 200) {
                    let listActive = [
                        'document_definition',
                        'document_instance'
                    ];
                    Object.keys(res.data).map((obj) => {
                        if (listActive.includes(obj)) {
                            self.listTypeAction.push({
                                text: obj.replace('_', ' '),
                                value: obj
                            });
                        }
                    });
                    let extraType = [
                        {
                            text: 'dataset',
                            value: 'dataset'
                        },
                        {
                            text: 'control',
                            value: 'control'
                        }
                    ];
                    self.listTypeAction = [
                        ...self.listTypeAction,
                        ...extraType
                    ];
                }
            });
        },
        setDataFilter(data) {
            const self = this;
            uiConfigApi
                .getUiConfig('filter-access-control:' + data.id)
                .then((res) => {
                    if (res.status == 200) {
                        let detail = JSON.parse(res.data.detail);
                        if (detail && !data.formulaStruct) {
                            data.treeConfigData = detail.treeConfigData;
                            data.formulaStruct = JSON.stringify({
                                treeConfigData: detail.treeConfigData
                            });
                        }
                    }
                    self.$refs.filterForm.setData(data);
                });
        }
    }
};
</script>

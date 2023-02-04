<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listApp"
            :getDataUrl="apiUrl"
            :headerPrefixKeypath="'table'"
            :pageTitle="$t('bi.dashboard.title-show-list-trash')"
            :containerHeight="containerHeight"
            :tableContextMenu="tableContextMenu"
            :customAPIResult="customAPIResult"
            :showExportButton="false"
            :useDefaultContext="false"
            @after-open-add-panel="addDashboard"
            :emptyDataKey="'bi-dashboard-deleted-list'"
            :disableButtonAdd="disableButtonAdd"
        >
        </ListItems>
    </div>
</template>
<script>
import ListItems from '@/components/common/ListItems';
import { dashboardApi } from '@/api/dashboard.js';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs';
export default {
    name: 'listApps',
    components: {
        ListItems
    },
    data: function () {
        let self = this;
        return {
            containerHeight: 0,
            apiUrl: appConfigs.apiDomain.biService + '/dashboards/trash',
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
                    name: 'restore',
                    text: this.$t('common.restore'),
                    callback: async (obj, refreshList) => {
                        await dashboardApi.restore(obj.id);
                        self.$snotifySuccess(
                            self.$t('v2.dashboard.restoreDashboardSuccess')
                        );
                        refreshList();
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
            },
            disableButtonAdd: true
        };
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
    methods: {
        addDashboard() {}
    },
    created() {
        this.$setTabTitle(this.$t('bi.dashboard.list-trash'));
    }
};
</script>

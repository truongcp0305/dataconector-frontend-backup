<template>
    <div class="w-100 h-100">
        <list-items
            ref="listOrgchart"
            :useDefaultContext="false"
            :pageTitle="$t('orgchart.list.title')"
            :tableContextMenu="tableContextMenu"
            :commonActionProps="commonActionProps"
            :containerHeight="containerHeight"
            :showExportButton="false"
            :getDataUrl="getListUrl"
            :customAPIResult="customAPIResult"
            :useActionPanel="false"
            :flexMode="true"
            :headerPrefixKeypath="'common'"
            @on-add-item-clicked="goToCreatePage()"
            :emptyDataKey="'orgchart-list'"
        ></list-items>
    </div>
</template>
<script>
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs.js';
import ListItems from '@/components/common/ListItems.vue';
import { orgchartApi } from '@/api/orgchart';
export default {
    data() {
        let self = this;
        return {
            commonActionProps: {
                module: 'orgchart',
                resource: 'orgchart',
                scope: 'orgchart',
            },
            containerHeight: 300,
            listItemOptions: {},
            getListUrl: appConfigs.apiDomain.orgchart + 'orgchart',
            customAPIResult: {
                reformatData(res) {
                    return {
                        columns: [
                            { name: 'id', title: 'id', type: 'numeric' },
                            { name: 'code', title: 'code', type: 'text' },
                            { name: 'name', title: 'name', type: 'text' },
                            {
                                name: 'isDefault',
                                title: 'isDefault',
                                type: 'text',
                                cellRenderer: function (params) {
                                    let newValue =
                                        params.value == '1' ? self.$t('v2.orgchart.default') : '';
                                    return (
                                        '<span style="color: blue">' +
                                        newValue +
                                        '</span>'
                                    );
                                },
                            },
                            {
                                name: 'description',
                                title: 'description',
                            type: 'text',
                            },
                            {
                                name: 'createAt',
                                title: 'create_at',
                                type: 'date',
                            },
                            {
                                name: 'lastUpdateAt',
                                title: 'last_update_at',
                                type: 'date',
                            },
                        ],
                        listObject: res.data.listObject,
                        total: res.data.listObject.length,
                    };
                },
            },
            tableContextMenu: {
                structureManagement: {
                    name: 'structureManagement',
                    text: this.$t('common.structureManagement'),
                    callback: (row, callback) => {
                        self.$goToPage(
                            '/orgchart/' + row.id + '/structure-management',
                            this.$t('v2.orgchart.edit') + (row.name ? row.name : row.key),
                        );
                    },
                },
                update: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: (row, callback) => {
                        self.$goToPage(
                            '/orgchart/' + row.id + '/edit',
                            this.$t('v2.orgchart.edit') + (row.name ? row.name : row.key),
                        );
                    },
                },
                drop: {
                    name: 'remove',
                    text: this.$t('common.delete'),
                    callback: async (rows, refreshList) => {
                        let ids = [];
                        for (let item of rows) {
                            ids.push(item.id);
                        }
                        try {
                            let res = await orgchartApi.deleteOrgcharts(ids);
                            if (res.status == 200) {
                                self.$snotifySuccess(
                                    this.$t('v2.orgchart.deleted') + ids.length + this.$t('v2.orgchart.items'),
                                );
                            } else {
                                self.$snotifyError(
                                    res,
                                    this.$t('v2.orgchart.cantDeleteSelectedItems'),
                                );
                            }
                        } catch (error) {
                            self.$snotifyError(
                                error,
                                this.$t('v2.orgchart.cantDeleteSelectedItems'),
                            );
                        }
                        refreshList();
                    },
                },
                detail: {
                    name: 'detail',
                    text: this.$t('common.detail'),
                    callback: (row, callback) => {
                        self.$goToPage(
                            '/orgchart/' + row.id + '/view',
                            self.$t('common.detail') +
                                '  ' +
                                (row.name ? row.name : row.key),
                        );
                    },
                },
                clone: {
                    name: 'clone',
                    text: this.$t('common.clone'),
                    callback: (row, callback) => {
                        self.$goToPage(
                            '/orgchart/' + row.id + '/clone',
                            this.$t('v2.orgchart.clone') + (row.name ? row.name : row.key),
                        );
                    },
                },
            },
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    created() {},
    watch: {},
    methods: {
        goToCreatePage() {
            this.$goToPage(
                '/orgchart/create',
                this.$t('orgchart.create.title'),
            );
        },
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
        getDataAnddeploy(processId) {},
    },
    components: {
        ListItems: ListItems,
    },
};
</script>

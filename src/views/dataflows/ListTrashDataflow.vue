<template>
    <ListItems
        ref="listServer"
        :pageTitle="$t('bi.dataflow.title-show-list-trash')"
        :containerHeight="containerHeight"
        :getDataUrl="getListUrl"
        :headerPrefixKeypath="'table'"
        :showExportButton="false"
        :useDefaultContext="false"
        :tableContextMenu="tableContextMenu"
        :actionPanelWidth="550"
        :customAPIResult="customAPIResult"
        :showButtonAdd="false"
        :emptyDataKey="'bi-deleted-dataflow-list'"
    >
        <template slot="right-panel-content" slot-scope="{}"> </template>
    </ListItems>
</template>

<script>
import ListItems from '@/components/common/ListItems';
import { appConfigs } from '@/configs.js';
import { util } from '@/plugins/util.js';
import { dataflowApi } from '@/api/dataflow.js';
export default {
    components: {
        ListItems,
    },
    methods: {
        handleAddSuccess() {
            this.showDialog = false;
            this.$refs.listService.refreshList();
        },
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
    data() {
        let self = this;
        return {
            containerHeight: 0,
            showDialog: false,
            tableContextMenu: {
                restore: {
                    name: 'restore',
                    text: self.$t('common.restore'),
                    callback: async (row, refreshList) => {
                        await dataflowApi.restoreDataflow(row.id);
                        refreshList();
                    },
                },
            },
            customAPIResult: {
                reformatData(res) {
                    return {
                        columns: res.data.columns,
                        listObject: res.data.listObject,
                        total: res.total,
                    };
                },
            },
            getListUrl: appConfigs.apiDomain.biService + '/dataflows/trash',
        };
    },
};
</script>

<style></style>

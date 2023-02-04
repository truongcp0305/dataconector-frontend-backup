<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listApp"
            :getDataUrl="apiUrl"
            :headerPrefixKeypath="'table'"
            :pageTitle="$t('bi.relation.title-show-list-trash')"
            :containerHeight="tableHeight"
            :tableContextMenu="tableContextMenu"
            :customAPIResult="customAPIResult"
            :useDefaultContext="false"
            @after-open-add-panel="addDataset"
            :emptyDataKey="'bi-deleted-relation-list'"
            :disableButtonAdd="disableButtonAdd"
        >
        </ListItems>
    </div>
</template>
<script>
import ListItems from '@/components/common/ListItems';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs';
import { relationApi } from '../../api/relation';
export default {
    name: 'listApps',
    components: {
        ListItems,
    },
    created() {},
    data: function () {
        let self = this;
        return {
            apiUrl: appConfigs.apiDomain.biService + '/relations/trash',
            tableContextMenu: {
                restore: {
                    name: 'restore',
                    text: this.$t('common.restore'),
                   callback: async (row, refreshList) => {
                        await relationApi.restore(row.id);
                        refreshList();
                    },
                },
            },
            customAPIResult: {
                reformatData(res) {
                    res.data.columns.forEach(function (e) {
                        e.flex = 1;
                    });
                    return {
                        columns: res.data.columns,
                        listObject: res.data.listObject,
                        total: res.data.total,
                    };
                },
            },
            tableHeight: 0,
            disableButtonAdd: true,
        };
    },
    mounted() {
        this.tableHeight = util.getComponentSize(this).h;
    },
    methods: {
        addDataset() {},
    },
};
</script>

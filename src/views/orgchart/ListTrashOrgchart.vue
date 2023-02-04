<template>
    <div class="w-100 h-100">
        <list-items
            ref="listOrgchart"
            :useDefaultContext="false"
            :pageTitle="$t('orgchart.list.titleTrash')"
            :tableContextMenu="tableContextMenu"
            :commonActionProps="commonActionProps"
            :containerHeight="containerHeight"
            :getDataUrl="getListUrl"
            :customAPIResult="customAPIResult"
            :useActionPanel="false"
            :headerPrefixKeypath="'common'"
            @on-add-item-clicked="goToCreatePage()"
            :emptyDataKey="'orgchart-deleted-list'"
            :disableButtonAdd="disableButtonAdd"
        ></list-items>
    </div>
</template>
<script>
import { util } from './../../plugins/util.js';
import { appConfigs } from './../../configs.js';
import ListItems from './../../components/common/ListItems.vue';
import { orgchartApi } from '../../api/orgchart';

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
            getListUrl: appConfigs.apiDomain.trash + '/items?type=orgchart',
            customAPIResult: {
                reformatData(res) {
                    res.data.forEach(function (e) {
                        if (e.data != '') {
                            let newData = JSON.parse(e.data);
                            e.orgchartId = newData.orgchart.id;
                            e.orgchartCode = newData.orgchart.code;
                            e.orgchartName = newData.orgchart.name;
                        }
                    });
                    return {
                        columns: [
                        {
                                name: 'orgchartId',
                                title: 'id',
                                type: 'numeric',
                                noFilter: true,
                            },
                            {
                                name: 'orgchartCode',
                                title: 'code',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'orgchartName',
                                title: 'name',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'userDeleted',
                                title: 'userDeletedName',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'userAgent',
                                title: 'userAgent',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'roleDeleted',
                                title: 'roleDeleted',
                                type: 'date',
                                noFilter: true,
                            },
                            {
                                name: 'deletedAt',
                                title: 'deletedAt',
                                type: 'date',
                                noFilter: true,
                            },
                        ],
                        listObject: res.data,
                        total: res.data.length,
                    };
                },
            },
            tableContextMenu: {
                restore: {
                    name: 'restore',
                    text: this.$t('common.restore'),
                    callback: (row, refreshList) => {
                        orgchartApi
                            .restore(row.orgchartId)
                            .then((res) => {
                                if (res.status == 200) {
                                    orgchartApi
                                        .deleteTrashItem(row.orgchartId)
                                        .then((resA) => {
                                            if (resA.status == 200) {
                                                refreshList();
                                                self.$snotify({
                                                    type: 'success',
                                                    title: this.$t('v2.orgchart.restoreSuccess'),
                                                });
                                            }
                                        });
                                }
                            })
                            .catch((err) => {});
                    },
                },
            },
            disableButtonAdd: true,
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
        gettrash() {},
    },
    components: {
        ListItems: ListItems,
    },
};
</script>

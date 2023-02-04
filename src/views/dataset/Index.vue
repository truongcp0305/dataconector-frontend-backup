<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listDataset"
            :getDataUrl="apiUrl"
            :headerPrefixKeypath="'table'"
            :pageTitle="$t('bi.dataset.title-show-list')"
            :containerHeight="tableHeight"
            :tableContextMenu="tableContextMenu"
            :customAPIResult="customAPIResult"
            :useActionPanel="false"
            :useDefaultContext="false"
            @on-add-item-clicked="addDataset"
            :emptyDataKey="'bi-dataset-list'"
        >
        </ListItems>
    </div>
</template>
<script>
import ListItems from '@/components/common/ListItems';
import DashboardDatasetWorker from 'worker-loader!@/worker/dashboard/dashboard/DashboardDataset.Worker.js';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs';
export default {
    name: 'listApps',
    components: {
        ListItems,
    },
    created() {
        this.dashboardDatasetWorker = new DashboardDatasetWorker();
        this.listenFromWorker();
    },
    data: function () {
        let self = this;
        return {
            apiUrl: appConfigs.apiDomain.biService + '/datasets/get-list',
            dashboardDatasetWorker: null,
            tableContextMenu: {
                edit: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: (obj, callback) => {
                        self.handleViewDatasetDetail(obj);
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
        };
    },
    mounted() {
        this.tableHeight = util.getComponentSize(this).h;
    },
    methods: {
        addDataset() {},
        listenFromWorker() {
            let self = this;
            this.dashboardDatasetWorker.addEventListener(
                'message',
                function (event) {
                    let data = event.data;
                    let action = data.action;
                    if (self[action]) {
                        self[action](data.data);
                    } else {
                        console.error(` action ${action} not found `);
                    }
                },
            );
        },
        handleGetDatasetDetail(data) {
            if (data.status == 200) {
                let nodeId=data.data[0].nodeVizId;
                let id = data.data[0].dataflowId;
                this.$goToPage('/dataflows/' + id + '/edit?nodeId='+nodeId, this.$t('v2.importExport.updateDataflow'));
            } else {
                this.$snotifyError(this.$t('v2.importExport.cantFindDataSetDetail'));
            }
        },
        handleViewDatasetDetail(obj) {
            if (obj.type == 'doc') {
                this.$goToPage(
                    '/documents/' + obj.symperId + '/objects',
                    this.$t('v2.importExport.listRecord'),
                );
            } else {
                this.dashboardDatasetWorker.postMessage({
                    action: 'getDatasetDetail',
                    data: {
                        id: obj.id,
                    },
                });
            }
        },
        handleDeleteRows(data) {
            if (data == 200) {
                this.$snotifySuccess(this.$t('v2.dataset.deleteSuccess'));
            } else {
                this.$snotifyError(this.$t('v2.dataset.errHappen'));
            }
            this.$refs.listDataset.refreshList();
        },
        
    },
};
</script>

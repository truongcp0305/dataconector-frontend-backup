<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listScheduler"
            :getDataUrl="apiUrl"
            :headerPrefixKeypath="'table'"
            :pageTitle="$t('scheduler.list.title')"
            :containerHeight="containerHeight"
            :tableContextMenu="tableContextMenu"
            :showExportButton="false"
            :useDefaultContext="false"
            :useActionPanel="false"
            @on-add-item-clicked="addScheduler"
            :isConfigScheduler="true"
        >
        </ListItems>
    </div>
</template>
<script>
import ListItems from '@/components/common/ListItems';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs';
import SchedulerShowListWorker from 'worker-loader!@/worker/scheduler/SchedulerShowList.Worker.js';
export default {
    name: 'listSchedulers',
    components: {
        ListItems,
    },
    created() {
        this.schedulerShowListWorker = new SchedulerShowListWorker();
        this.listenFromWorker();
    },
    data: function () {
        let self = this;
        return {
            containerHeight: 0,
            apiUrl: appConfigs.apiDomain.scheduler + 'scheduler',
            schedulerShowListWorker: null,
            tableContextMenu: {
                update: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: (obj, callback) => {
                        self.$goToPage('/scheduler/' + obj.id + '/edit');
                    },
                },
                view: {
                    name: 'view',
                    text: this.$t('common.view'),
                    callback: (obj, callback) => {
                        self.$goToPage('/scheduler/' + obj.id + '/view');
                    },
                },
                delete: {
                    name: 'delete',
                    text: this.$t('common.delete'),
                    callback: (rows, callback) => {
                        self.deleteRows(rows);
                    },
                },
            },
        };
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
    methods: {
        addScheduler() {
            this.$goToPage('/scheduler/config', 'Tạo scheduler');
        },
        listenFromWorker() {
            let self = this;
            this.schedulerShowListWorker.addEventListener(
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
        deleteRows(rows) {
            this.schedulerShowListWorker.postMessage({
                action: 'deleteRows',
                data: {
                    rows: rows,
                },
            });
        },
        handleDeleteRows(data) {
            if (data == 200) {
                this.$snotifySuccess(this.$t('v2.acessControl.successfullDelete'));
            } else {
                this.$snotifyError(this.$t('v2.acessControl.anErrorOccurred'));
            }
            this.$refs.listScheduler.refreshList();
        },
    },
};
</script>

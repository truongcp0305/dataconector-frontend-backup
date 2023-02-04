<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listKanban"
            :getDataUrl="apiUrl"
            :headerPrefixKeypath="'table'"
            :pageTitle="$t('kanban.list.title')"
            :containerHeight="containerHeight"
            :tableContextMenu="tableContextMenu"
            :showExportButton="false"
            :useDefaultContext="false"
            :useActionPanel="false"
            @on-add-item-clicked="addKanban"
            :emptyDataKey="'kanban-record-list'"
            :isConfigKanban="true"
        >
        </ListItems>
    </div>
</template>
<script>
import ListItems from '@/components/common/ListItems';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs';
import KanbanShowListWorker from 'worker-loader!@/worker/kanban/KanbanShowList.Worker.js';
export default {
    name: 'listKanbans',
    components: {
        ListItems,
    },
    created() {
        this.kanbanShowListWorker = new KanbanShowListWorker();
        this.listenFromWorker();
    },
    data: function () {
        let self = this;
        return {
            containerHeight: 0,
            apiUrl: appConfigs.apiDomain.kanban + '/kanban',
            kanbanShowListWorker: null,
            tableContextMenu: {
                update: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: (obj, callback) => {
                        self.$goToPage('/kanban/' + obj.id + '/edit');
                    },
                },
                view: {
                    name: 'view',
                    text: this.$t('common.view'),
                    callback: (obj, callback) => {
                        self.$goToPage('/kanban/' + obj.id + '/view');
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
        addKanban() {
            this.$goToPage('/kanban/config', 'Tạo kanban');
        },
        listenFromWorker() {
            let self = this;
            this.kanbanShowListWorker.addEventListener(
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
            this.kanbanShowListWorker.postMessage({
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
            this.$refs.listKanban.refreshList();
        },
    },
};
</script>

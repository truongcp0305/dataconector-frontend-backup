<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listSmartObject"
            :getDataUrl="apiUrl"
            :headerPrefixKeypath="'table'"
            :pageTitle="$t('smartObject.list.title')"
            :containerHeight="containerHeight"
            :tableContextMenu="tableContextMenu"
            :showExportButton="false"
            :useDefaultContext="false"
            :useActionPanel="false"
            @on-add-item-clicked="addSmartObject"
            :emptyDataKey="'smartObject-record-list'"
        >
        </ListItems>
    </div>
</template>
<script>
import ListItems from '@/components/common/ListItems';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs';
import SmartObjectShowListWorker from 'worker-loader!@/worker/smartObject/SmartObjectShowList.Worker.js';
export default {
    name: 'listSmartObjects',
    components: {
        ListItems,
    },
    created() {
        this.smartObjectShowListWorker = new SmartObjectShowListWorker();
    },
    data: function () {
        let self = this;
        return {
            containerHeight: 0,
            apiUrl: appConfigs.apiDomain.smartObject + '/smart-object',
            smartObjectShowListWorker: null,
            tableContextMenu: {
                update: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: (obj, callback) => {
                        self.$goToPage('/smart-object/' + obj.id + '/edit');
                    },
                },
                view: {
                    name: 'view',
                    text: this.$t('common.view'),
                    callback: (obj, callback) => {
                        self.$goToPage('/smart-object/' + obj.id + '/view');
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
        addSmartObject() {
            this.$goToPage('/smart-object/config', 'Tạo smart object');
        },
        async deleteRows(rows) {
            let res = await runBySymperPromiseWorker(
                this.smartObjectShowListWorker,
                'deleteRows',
                {rows: rows}
            );
            if (res == 200) {
                this.$snotifySuccess(this.$t('v2.acessControl.successfullDelete'));
            } else {
                this.$snotifyError(this.$t('v2.acessControl.anErrorOccurred'));
            }
            this.$refs.listSmartObject.refreshList();
        }
    },
};
</script>

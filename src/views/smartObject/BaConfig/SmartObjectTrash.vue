<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listSmartObjectTrash"
            :getDataUrl="apiUrl"
            :headerPrefixKeypath="'table'"
            :pageTitle="$t('smartObject.trash.title')"
            :containerHeight="containerHeight"
            :tableContextMenu="tableContextMenu"
            :showExportButton="false"
            :useDefaultContext="false"
            :useActionPanel="false"
            :emptyDataKey="'smartObject-deleted-list'"
            :isConfigSmartObject="true"
            :showButtonAdd="false"
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
    name: 'listSmartObjectTrash',
    components: {
        ListItems,
    },
    created() {
        this.smartObjectShowListWorker = new SmartObjectShowListWorker();
    },
    data: function () {
        return {
            containerHeight: 0,
            apiUrl: appConfigs.apiDomain.smartObject + '/smart-object/trash',
            smartObjectShowListWorker: null,
            tableContextMenu: {
                restore: {
                    name: 'restore',
                    text: this.$t('common.restore'),
                    callback: async (obj, callback) => {
                        let res = await runBySymperPromiseWorker(
                            this.smartObjectShowListWorker,
                            'restore',
                            {id: obj.id}
                        );
                        if (res == 200) {
                            this.$snotifySuccess(this.$t('v2.app.restoreSuccess'));
                        } else {
                            this.$snotifyError(this.$t('v2.acessControl.anErrorOccurred'));
                        }
                        this.$refs.listSmartObjectTrash.refreshList();
                    },
                }
            },
        };
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
};
</script>
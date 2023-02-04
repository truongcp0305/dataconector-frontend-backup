<template>
    <div class="w-100 h-100">
        <list-items
            ref="listModels"
            :useDefaultContext="false"
            :pageTitle="$t('process.list.titleTrash')"
            :tableContextMenu="tableContextMenu"
            :containerHeight="containerHeight"
            :getDataUrl="getListUrl"
            :useActionPanel="false"
            :headerPrefixKeypath="'common'"
        ></list-items>
    </div>
</template>

<script>
import ListItems from './../../components/common/ListItems.vue';
import bpmnApi from './../../api/BPMNEngine.js';
import { appConfigs } from './../../configs.js';
import { util } from './../../plugins/util.js';

export default {
    components: {
        ListItems: ListItems,
    },
    data() {
        let self = this;
        return {
            containerHeight: 300,
            listItemOptions: {},
            getListUrl: appConfigs.apiDomain.bpmne.models + '/trash',
            tableContextMenu: {
                restore: {
                    name: 'restore',
                    multipleSelection: true,
                    text: this.$t('actions.listActions.document.restore'),
                    callback: async (rows, refreshList) => {
                        let ids = [];
                        for (let item of rows) {
                            ids.push(item.id);
                        }
                        try {
                            let res = await bpmnApi.restoreListModels(ids);
                            if (res.status == 200) {
                                self.$snotifySuccess(
                                    self.$t('v2.workflow.restore') + ids.length + this.$t('v2.workflow.itemsSuccess'),
                                );
                            } else {
                                self.$snotifyError(
                                    res,
                                    self.$t('v2.workflow.cantRestoreSelectedItems'),
                                );
                            }
                        } catch (error) {
                            self.$snotifyError(
                                error,
                                self.$t('v2.workflow.cantDeleteSelectedItems'),
                            );
                        }
                        refreshList();
                    },
                },
                update: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: (row, callback) => {
                        self.$goToPage(
                            '/workflow/' + row.id + '/edit',
                            this.$t('common.edit') +
                                ' ' +
                                (row.name ? row.name : row.key),
                        );
                    },
                },
            },
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    methods: {
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
    },
};
</script>

<style></style>

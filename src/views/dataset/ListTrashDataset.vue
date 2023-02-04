<template>
    <ListItems
        ref="listServer"
        :pageTitle="$t('bi.dataset.title-show-list-trash')"
        :containerHeight="containerHeight"
        :getDataUrl="getListUrl"
        :headerPrefixKeypath="'table'"
        :showExportButton="false"
        :useDefaultContext="false"
        :tableContextMenu="tableContextMenu"
        :actionPanelWidth="550"
        :customAPIResult="customAPIResult"
        :showButtonAdd="false"
        :emptyDataKey="'bi-deleted-dataset-list'"
    >
        <template slot="right-panel-content" slot-scope="{}"> </template>
    </ListItems>
</template>

<script>
import ListItems from '@/components/common/ListItems';
import { appConfigs } from '@/configs.js';
import { util } from '@/plugins/util.js';
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
                    callback: (row, callback) => {},
                },
            },
            customAPIResult: {
                reformatData(res) {
                    let listBA = self.$store.state.app.allBA;
                    res.data.listObject.forEach(function (e) {
                        if (!e.userCreate) {
                            e.userCreateName = '';
                        } else {
                            listBA.forEach(function (k) {
                                if (k.id == e.userCreate) {
                                    e.userCreateName = k.name;
                                }
                            });
                        }
                        if (!e.userUpdate) {
                            e.userUpdateName = '';
                        } else {
                            listBA.forEach(function (k) {
                                if (k.id == e.userUpdate) {
                                    e.userUpdateName = k.name;
                                }
                            });
                        }
                    });
                    return {
                        columns: [
                            { name: 'id', title: this.$t('v2.importExport.id'), type: 'text' },
                            { name: 'ip', title: this.$t('v2.importExport.ip'), type: 'text' },
                            {
                                name: 'description',
                                title: this.$t('v2.importExport.description'),
                                type: 'text',
                            },
                            { name: 'os', title: this.$t('v2.importExport.os'), type: 'text' },
                            {
                                name: 'userCreateName',
                                title: this.$t('v2.importExport.userCreate'),
                                type: 'text',
                            },
                            {
                                name: 'userUpdateName',
                                title: this.$t('v2.importExport.userUpdate'),
                                type: 'text',
                            },
                            {
                                name: 'createAt',
                                title: this.$t('v2.importExport.createAt'),
                                type: 'text',
                            },
                            {
                                name: 'updateAt',
                                title: this.$t('v2.importExport.updateAt'),
                                type: 'text',
                            },
                        ],
                        listObject: res.data.listObject,
                        total: res.total,
                    };
                },
            },
            getListUrl:
                appConfigs.uniqueApiDomain.environmentManagement + 'servers',
        };
    },
};
</script>

<style></style>

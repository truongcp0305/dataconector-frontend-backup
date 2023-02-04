<template>
    <div>
        <ListItems
            ref="listServer"
            :pageTitle="$t('v2.environment.listServer')"
            :containerHeight="containerHeight"
            :getDataUrl="getListUrl"
            :headerPrefixKeypath="'table'"
            :showExportButton="false"
            :useDefaultContext="false"
            :tableContextMenu="tableContextMenu"
            :actionPanelWidth="550"
            :customAPIResult="customAPIResult"
            :showButtonAdd="false"
        >
            <template slot="right-panel-content" slot-scope="{}"> </template>
        </ListItems>
    </div>
</template>

<script>
import ListItems from '@/components/common/ListItems';
import { appConfigs } from '@/configs.js';
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
    props: {
        containerHeight: {
            type: Number,
            default: 0,
        },
    },
    data() {
        let self = this;
        return {
            showDialog: false,
            tableContextMenu: {
                viewInstance: {
                    name: 'viewInstance',
                    text: this.$t('v2.environment.listInstance'),
                    callback: (row, callback) => {
                        self.$goToPage(
                            '/server/' + row.id + '/instances',
                            this.$t('v2.environment.listInstance'),
                        );
                    },
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
                            { name: 'id', title: 'id', type: 'text' },
                            { name: 'ip', title: 'ip', type: 'text' },
                            {
                                name: 'description',
                                title: 'description',
                                type: 'text',
                            },
                            { name: 'os', title: 'os', type: 'text' },
                            {
                                name: 'userCreateName',
                                title: 'userCreate',
                                type: 'text',
                            },
                            {
                                name: 'userUpdateName',
                                title: 'userUpdate',
                                type: 'text',
                            },
                            {
                                name: 'createAt',
                                title: 'createAt',
                                type: 'text',
                            },
                            {
                                name: 'updateAt',
                                title: 'updateAt',
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

<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listService"
            :pageTitle="$t('v2.environment.listInstance')"
            :containerHeight="containerHeight"
            :getDataUrl="getListUrl"
            :headerPrefixKeypath="'table'"
            :useDefaultContext="false"
            :showExportButton="false"
            :showButtonAdd="false"
            :tableContextMenu="tableContextMenu"
            :customAPIResult="customAPIResult"
            :apiMethod="'POST'"
            :customDataForApi="customDataForApi"
        />
        <DialogUpgrade
            :showDialog="showDialog"
            :currentInstance="currentInstance"
            @cancel="showDialog = false"
        />
    </div>
</template>

<script>
import ListItems from '@/components/common/ListItems';
import { appConfigs } from '@/configs.js';
import { util } from '@/plugins/util.js';
import DialogUpgrade from './dialogs/DialogUpgrade';
import DialogDeloy from './dialogs/DialogDeloy';
export default {
    components: {
        ListItems,
        DialogDeloy,
        DialogUpgrade,
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
    data() {
        let self = this;
        return {
            showDialog: false,
            currentInstance: {},
            containerHeight: 0,
            customDataForApi(configs, columns, filterData) {
                let serviceId = self.$route.params.serviceId;
                return {
                    serviceId: serviceId,
                };
            },
            tableContextMenu: {
                upgrade: {
                    name: 'upgrade',
                    text: 'Upgrade',
                    callback: (row, callback) => {
                        // self.$store.commit('environmentManagement/setCurrentVersionId', row.id)
                        self.currentInstance = row;
                        self.showDialog = true;
                    },
                },
            },
            customAPIResult: {
                reformatData(res) {
                    let listBA = self.$store.state.app.allBA;
                    res.data.forEach(function (e) {
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
                            {
                                name: 'id',
                                title: 'id',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'ip',
                                title: 'ip	',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'versionName',
                                title: 'versionName',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'environmentIdentifier',
                                title: 'environmentIdentifier',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'environmentName',
                                title: 'environmentName',
                                type: 'numeric',
                                noFilter: true,
                            },
                            {
                                name: 'userCreateName',
                                title: 'userCreate',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'userUpdateName',
                                title: 'userUpdate',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'createAt',
                                title: 'createAt',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'updateAt',
                                title: 'updateAt',
                                type: 'text',
                                noFilter: true,
                            },
                        ],
                        listObject: res.data,
                        total: res.data.length,
                    };
                },
            },
        };
    },
    computed: {
        getListUrl() {
            return (
                appConfigs.apiDomain.environmentManagement + 'instances/query'
            );
        },
    },
};
</script>

<style></style>

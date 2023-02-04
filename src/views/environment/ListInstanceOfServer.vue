<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listInstance"
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
        <DialogChangeServer
            :showDialog="showDialog"
            :allServer="allServer"
            :instanceId="instanceId"
            @cancel="showDialog = false"
            @success="handleSuccess"
        />
    </div>
</template>

<script>
import ListItems from '@/components/common/ListItems';
import { appConfigs } from '@/configs.js';
import { util } from '@/plugins/util.js';
import { environmentManagementApi } from '@/api/EnvironmentManagement';
import DialogChangeServer from './dialogs/DialogChangeServer';

export default {
    components: {
        ListItems,
        DialogChangeServer,
    },
    methods: {
        handleSuccess() {
            this.showDialog = false;
            this.$refs.listInstance.refreshList();
        },
    },
    mounted() {
        let self = this;
        this.containerHeight = util.getComponentSize(this).h;
        environmentManagementApi
            .getAllServer()
            .then((res) => {
                if (res.status == 200) {
                    self.allServer = res.data.listObject;
                }
            })
            .catch((err) => {});
    },
    data() {
        let self = this;
        return {
            showDialog: false,
            allServer: [],
            instanceId: '',
            currentInstance: {},
            containerHeight: 0,
            customDataForApi(configs, columns, filterData) {
                let serverId = self.$route.params.serverId;
                return {
                    serverId: serverId,
                };
            },
            tableContextMenu: {
                changeServer: {
                    name: 'changeServer',
                    text: this.$t('v2.environment.changeServer'),
                    callback: (row, callback) => {
                        self.showDialog = true;
                        self.instanceId = row.id;
                    },
                },
            },
            customAPIResult: {
                reformatData(res) {
                    let listBA = self.$store.state.app.allBA;
                    res.data.forEach(function (e) {
                        let prefix = e.environmentIdentifier
                            ? e.environmentIdentifier + '.'
                            : '';
                        e.domainName =
                            prefix +
                            e.serviceIdentifier +
                            `.${SYMPER_ENV.tenant_domain}`;
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
                                title: this.$t('v2.enviroment.id'),
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'ip',
                                title: this.$t('v2.enviroment.ip'),
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'domainName',
                                title: this.$t('v2.enviroment.domainName'),
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'versionName',
                                title: this.$t('v2.enviroment.versionName'),
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'serviceIdentifier',
                                title: this.$t('v2.enviroment.serviceIdentifier'),
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'serviceName',
                                title: this.$t('v2.enviroment.nameService'),
                                type: 'numeric',
                                noFilter: true,
                            },
                            {
                                name: 'environmentIdentifier',
                                title: this.$t('v2.enviroment.environmentIdentifier'),
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'environmentName',
                                title: this.$t('v2.enviroment.environmentName'),
                                type: 'numeric',
                                noFilter: true,
                            },
                            {
                                name: 'userCreateName',
                                title: this.$t('v2.enviroment.userCreateName'),
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'userUpdateName',
                                title: this.$t('v2.enviroment.userUpdateName'),
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'createAt',
                                title: this.$t('v2.enviroment.createAt'),
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'updateAt',
                                title: this.$t('v2.enviroment.updateAt'),
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

<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listVersionOfService"
            :pageTitle="$t('v2.environment.listVersion')"
            :containerHeight="containerHeight"
            :getDataUrl="getListUrl"
            :headerPrefixKeypath="'table'"
            :useDefaultContext="false"
            :showExportButton="false"
            :tableContextMenu="tableContextMenu"
            :customAPIResult="customAPIResult"
            @on-add-item-clicked="handleAddClick"
        />
        <DialogDeloy :showDialog="showDialog" @cancel="showDialog = false" />
        <DialogUpdateVersion
            :showDialog="showDialogUpdate"
            @cancel="showDialogUpdate = false"
        />
        <AddVersion
            :showDialog="showDialogAdd"
            @cancel="showDialogAdd = false"
            @add-success="handleAddSuccess"
            :mode="'listItem'"
            :routerSerViceId="routerSerViceId"
        />
    </div>
</template>

<script>
import ListItems from '@/components/common/ListItems';
import { appConfigs } from '@/configs.js';
import { util } from '@/plugins/util.js';
import DialogUpdateVersion from './dialogs/DialogUpdateVersion';
import DialogDeloy from './dialogs/DialogDeloy';
import AddVersion from './dialogs/AddVersion';
export default {
    components: {
        ListItems,
        DialogDeloy,
        AddVersion,
        DialogUpdateVersion,
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
    data() {
        let self = this;
        return {
            showDialogUpdate: false,
            showDialog: false,
            showDialogAdd: false,
            containerHeight: 0,
            tableContextMenu: {
                deploy: {
                    name: 'deploy',
                    text: 'Deploy',
                    callback: (row, callback) => {
                        self.$store.commit(
                            'environmentManagement/setCurrentVersionId',
                            row.id,
                        );
                        self.showDialog = true;
                    },
                },
                updateVersion: {
                    name: 'Update',
                    text: 'Update version',
                    callback: (row, callback) => {
                        self.$store.commit(
                            'environmentManagement/setCurrentVersionId',
                            row.id,
                        );
                        self.showDialogUpdate = true;
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
                            { name: 'id', title: 'id', type: 'text' },
                            {
                                name: 'versionName',
                                title: 'versionName',
                                type: 'text',
                            },
                            {
                                name: 'releaseAt',
                                title: 'releaseAt',
                                type: 'text',
                            },
                            {
                                name: 'status',
                                title: 'status',
                                type: 'numeric',
                            },
                            { name: 'git', title: 'git', type: 'numeric' },
                            {
                                name: 'description',
                                title: 'description',
                                type: 'text',
                            },
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
                        listObject: res.data,
                        total: res.data.length,
                    };
                },
            },
        };
    },
    computed: {
        getListUrl() {
            let serviceId = this.$route.params.serviceId;
            return (
                appConfigs.apiDomain.environmentManagement +
                'services/' +
                serviceId +
                '/versions'
            );
        },
        routerSerViceId() {
            return this.$route.params.serviceId;
        },
    },
    methods: {
        handleAddClick() {
            this.showDialogAdd = true;
            this.$refs.listVersionOfService.actionPanel = false;
        },
        handleAddSuccess() {
            this.showDialogAdd = false;
            this.$refs.listVersionOfService.refreshList();
        },
    },
};
</script>

<style></style>

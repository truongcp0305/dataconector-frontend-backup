<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listPermission"
            :actionPanelType="'modal'"
            :getDataUrl="getDataUrl"
            :headerPrefixKeypath="'table'"
            :pageTitle="$t('permissions.title')"
            :containerHeight="tableHeight"
            :tableContextMenu="tableContextMenu"
            :useDefaultContext="false"
            :actionPanelWidth="600"
            @after-open-add-panel="handleAddItem"
            :currentItemData="currentItemData"
            :commonActionProps="commonActionProps"
            :showExportButton="false"
            :emptyDataKey="'access-control-permission-list'"
        >
            <template slot="right-panel-content" slot-scope="{ itemData }">
                <PermissionForm
                    class="overflow-scroll"
                    @close-form="closeForm"
                    @saved-item-data="handleSavedItem"
                    :action="actionOnItem"
                    :itemData="itemData"
                >
                </PermissionForm>
            </template>
        </ListItems>
    </div>
</template>

<script>
import ListItems from '@/components/common/ListItems';
import { appConfigs } from '@/configs';
import PermissionForm from '@/components/permission/PermissionForm.vue';
import { util } from '@/plugins/util';
import PermissionWorker from 'worker-loader!@/worker/accessControl/Permission.Worker.js';

export default {
    name: 'ListPermissions',
    components: {
        ListItems,
        PermissionForm
    },
    computed: {
        getDataUrl: function () {
            return appConfigs.apiDomain.permissionPacks;
        }
    },
    created() {
        this.$store.dispatch('app/getAllBA');
        this.$store.dispatch('permission/getAllActionPack');
    },
    data: function () {
        let self = this;
        return {
            listUser: [],
            permissionWorker: null,
            nameUser: [],
            commonActionProps: {
                module: 'permission_pack',
                resource: 'permission_pack',
                scope: 'permission_pack'
            },
            containerHeight: 300,
            actionOnItem: 'create',
            currentItemData: {
                id: '',
                name: '',
                description: '',
                actionPacks: []
            },
            tableContextMenu: {
                viewDetails: {
                    name: 'view',
                    text: this.$t('permissions.contextMenu.viewDetails'),
                    callback: async (pack, callback) => {
                        self.updatePermissionData(pack, true);
                    }
                },
                update: {
                    name: 'edit',
                    text: this.$t('permissions.contextMenu.edit'),
                    callback: async (pack, callback) => {
                        self.updatePermissionData(pack);
                    }
                },
                remove: {
                    name: 'remove',
                    text: this.$t('permissions.contextMenu.remove'),
                    callback: async (rows, refreshList) => {
                        let ids = [];
                        for (let item of rows) {
                            ids.push(item.id);
                        }
                        debugger;
                        this.permissionWorker.postMessage({
                            action: 'deletePermission',
                            data: {
                                ids: ids
                            }
                        });
                    }
                }
            },
            tableHeight: 0
        };
    },
    mounted() {
        this.tableHeight = util.getComponentSize(this).h;
        this.permissionWorker = new PermissionWorker();
        let self = this;
        this.permissionWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'deletePermission':
                    if (data.dataAfter == 'success') {
                        self.$snotifySuccess(
                            self.$t('v2.acessControl.successfullDelete')
                        );
                    } else {
                        self.$snotifyError(
                            self.$t('v2.acessControl.anErrorOccurred')
                        );
                    }
                    self.$refs.listPermission.refreshList();
                    break;
                case 'getActionPackOfPermission':
                    let listActionPacks = data.dataAfter;
                    let mapActionPack =
                        self.$store.state.permission.allActionPack;
                    self.currentItemData.actionPacks = listActionPacks.reduce(
                        (arr, el) => {
                            if (mapActionPack[el.actionPackId])
                                arr.push(mapActionPack[el.actionPackId]);
                            return arr;
                        },
                        []
                    );
                    break;

                default:
                    break;
            }
        });
    },
    methods: {
        refreshData() {
            this.currentItemData.id = '';
            this.currentItemData.name = '';
            this.currentItemData.description = '';
            this.currentItemData.actionPacks = [];
        },
        closeForm() {
            this.$refs.listPermission.closeactionPanel();
            this.refreshData();
        },
        async updatePermissionData(pack, view = false) {
            let self = this;
            self.$refs.listPermission.actionPanel = true;
            for (let key in pack) {
                self.$set(self.currentItemData, key, pack[key]);
            }
            self.actionOnItem = view == false ? 'update' : 'detail';
            this.permissionWorker.postMessage({
                action: 'getActionPackOfPermission',
                data: {
                    packId: pack.id
                }
            });
        },
        setNameForUserId(listData) {
            let list = this.$store.state.app.allBA;
            for (let i = 0; i < listData.length; i++) {
                listData[i].userCreate = this.getBAName(
                    list,
                    listData[i].userCreate
                );
                listData[i].userUpdate = this.getBAName(
                    list,
                    listData[i].userUpdate
                );
            }
            return listData;
        },
        getBAName(list, id) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].id == id) {
                    return list[i].name;
                }
            }
        },
        handleSavedItem() {
            this.$refs.listPermission.refreshList();
            this.$refs.listPermission.actionPanel = false;
            this.refreshData();
        },
        handleAddItem() {
            this.actionOnItem = 'create';
        }
    }
};
</script>

<style></style>

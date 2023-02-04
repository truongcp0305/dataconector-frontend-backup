<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listPermission"
            :getDataUrl="getDataUrl"
            :headerPrefixKeypath="'permissions.header'"
            :pageTitle="$t('permissions.title')"
            :containerHeight="tableHeight"
            :tableContextMenu="tableContextMenu"
            :useDefaultContext="false"
            :actionPanelWidth="600"
            @after-open-add-panel="handleAddItem"
            :currentItemData="currentItemData"
            :customAPIResult="customAPIResult"
            :commonActionProps="commonActionProps"
            :showActionPanelInDisplayConfig="true"
            @row-selected="onRowSelected"
        >
            <template slot="right-panel-content" slot-scope="{ itemData }">
                <PermissionForm
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
import ListItems from '../../components/common/ListItems';
import { appConfigs } from '../../configs';
import { permissionApi } from '../../api/permissionPack';
import PermissionForm from '@/components/permission/PermissionForm.vue';
import { util } from '../../plugins/util';

let defaultItemData = {
    id: '',
    name: '',
    description: '',
    actionPacks: [],
};

export default {
    name: 'ListPermissions',
    components: {
        ListItems,
        PermissionForm,
    },
    computed: {
        getDataUrl: function () {
            return appConfigs.apiDomain.permissionPacks;
        },
    },
    created() {
        this.$store.dispatch('app/getAllBA');
        this.getUserName();
    },
    data: function () {
        let self = this;
        return {
            listUser: [],
            nameUser: [],
            commonActionProps: {
                module: 'permission_pack',
                resource: 'permission_pack',
                scope: 'permission_pack',
            },
            customAPIResult: {
                reformatData(res) {
                    if (res.status == 200) {
                        return {
                            listObject: self.setNameForUserId(res.data),
                            columns: [
                                {
                                    name: 'id',
                                    title: 'id',
                                    type: 'numeric',
                                },
                                {
                                    name: 'name',
                                    title: 'name',
                                    type: 'text',
                                },
                                {
                                    name: 'description',
                                    title: 'description',
                                    type: 'text',
                                },
                                {
                                    name: 'type',
                                    title: 'type',
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
                                {
                                    name: 'userCreate',
                                    title: 'userCreate',
                                    type: 'text',
                                },
                                {
                                    name: 'userUpdate',
                                    title: 'userUpdate',
                                    type: 'text',
                                },
                            ],
                        };
                    } else {
                        this.$snotifyError(res, this.$t('v2.acessControl.cannotGetPermissonList'));
                    }
                },
            },
            containerHeight: 300,
            actionOnItem: 'create',
            currentItemData: util.cloneDeep(defaultItemData),
            tableContextMenu: {
                update: {
                    name: 'edit',
                    text: this.$t('permissions.contextMenu.edit'),
                    callback: async (pack, callback) => {
                        self.updatePermissionData(pack);
                    },
                },
                remove: {
                    name: 'remove',
                    text: this.$t('permissions.contextMenu.remove'),
                    callback: async (rows, refreshList) => {
                        let ids = [];
                        for (let item of rows) {
                            ids.push(item.id);
                        }
                        try {
                            let res = await permissionApi.deletePermissionPack(
                                ids,
                            );
                            // if(res.status == 200){
                            self.$snotifySuccess(
                                'Deleted ' + ids.length + ' items',
                            );
                            // }else{
                            //     self.$snotifyError(res, "Can not delete selected items");
                            // }
                        } catch (error) {
                            self.$snotifyError(
                                error,
                                self.$t('v2.acessControl.cannotDeleteSelectedItem')
                            );
                        }
                        refreshList();
                    },
                },
            },
            tableHeight: 0,
        };
    },
    mounted() {
        this.tableHeight = util.getComponentSize(this).h;
    },
    methods: {
        closeForm() {
            this.$refs.listPermission.closeactionPanel();
        },
        async updatePermissionData(pack) {
            let self = this;
            for (let key in pack) {
                self.$set(self.currentItemData, key, pack[key]);
            }

            self.actionOnItem = 'update';
            let res = await permissionApi.getActionPackOfPermission(pack.id);

            if (res.status == 200) {
                let listActionPacks = res.data;
                let mapActionPack = self.$store.state.permission.allActionPack;
                self.currentItemData.actionPacks = listActionPacks.reduce(
                    (arr, el) => {
                        arr.push(mapActionPack[el.actionPackId]);
                        return arr;
                    },
                    [],
                );
            } else {
                self.$snotifyError(
                    res,
                    self.$t('v2.acessControl.cannotGetListActionPack') + pack.name,
                );
            }
        },
        onRowSelected(row) {
            if (this.$refs.listPermission.alwaysShowActionPanel) {
                this.$refs.listPermission.openactionPanel();
                this.updatePermissionData(row);
            }
        },
        setNameForUserId(listData) {
            let list = this.$store.state.app.allBA;
            for (let i = 0; i < listData.length; i++) {
                listData[i].userCreate = this.getBAName(
                    list,
                    listData[i].userCreate,
                );
                listData[i].userUpdate = this.getBAName(
                    list,
                    listData[i].userUpdate,
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
        async getDetailSystemRole(id) {
            let res = await systemRoleApi.detail(id);
            if (res.status == 200) {
                for (let key in res.data) {
                    this.$set(this.currentItemData, key, res.data[key]);
                }
            } else {
                this.$snotifyError(res, this.$t('v2.acessControl.cannotGetItemDetail'));
            }

            res = await permissionApi.getPermissionOfRole('system:' + id);
            if (res.status == 200) {
                let mapIdToPermission =
                    this.$store.state.permission.allPermissionPack;
                let permissions = res.data.reduce((arr, el) => {
                    if (mapIdToPermission[el.permissionPackId]) {
                        arr.push(mapIdToPermission[el.permissionPackId]);
                    }
                    return arr;
                }, []);
                this.$set(this.currentItemData, 'permissions', permissions);
            } else {
                this.$snotifyError(res, this.$t('v2.acessControl.cannotGetPermisson'));
            }
        },
        handleSavedItem() {
            this.$refs.listPermission.refreshList();
        },
        handleAddItem() {
            this.actionOnItem = 'create';
            this.currentItemData = null;
            this.currentItemData = util.cloneDeep(defaultItemData);
        },
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
        applyDataToForm(row) {
            for (let key in row) {
                this.$set(this.currentItemData, key, row[key]);
            }
        },
    },
};
</script>

<style></style>

<template>
    <div class="w-100 h-100">
        <list-items
            ref="listSystemRole"
            :useDefaultContext="false"
            :pageTitle="$t('systemRole.list.title')"
            :tableContextMenu="tableContextMenu"
            :containerHeight="containerHeight"
            :getDataUrl="getListUrl"
            :useActionPanel="true"
            :showCloseIcon="true"
            :headerPrefixKeypath="'common'"
            :currentItemData="currentItemData"
            @after-open-add-panel="handleAddItem"
            :commonActionProps="commonActionProps"
        >
            <template slot="right-panel-content" slot-scope="{ itemData }">
                <SystemRoleForm
                    @close="closePanel"
                    @saved-item-data="handleSavedItem"
                    :action="actionOnItem"
                    :itemData="itemData"
                >
                </SystemRoleForm>
            </template>
        </list-items>
    </div>
</template>
<script>
import { util } from './../../plugins/util.js';
import { reformatGetListProcess } from './../../components/process/reformatGetListData.js';
import { appConfigs } from './../../configs.js';
import { systemRoleApi } from '@/api/systemRole.js';
import ListItems from '@/components/common/ListItems.vue';

import SystemRoleForm from '@/components/systemRole/SystemRoleForm.vue';
import { permissionPackageApi } from '../../api/PermissionPackage';
import { permissionApi } from '../../api/permissionPack';
export default {
    data() {
        let self = this;
        return {
            commonActionProps: {
                module: 'system_role',
                resource: 'system_role',
                scope: 'system_role',
            },
            containerHeight: 300,
            actionOnItem: 'create',
            getListUrl: appConfigs.apiDomain.systemRole + 'system-role',
            currentItemData: {
                name: '',
                description: '',
                users: [],
                permissions: [],
            },
            tableContextMenu: {
                update: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: (row, callback) => {
                        self.getDetailSystemRole(row.id);
                        self.actionOnItem = 'update';
                        self.applyDataToForm(row);
                    },
                },
                delete: {
                    name: 'remove',
                    text: this.$t('common.delete'),
                    callback: async (rows, refreshList) => {
                        let ids = [];
                        for (let item of rows) {
                            ids.push(item.id);
                        }
                        try {
                            let res = await systemRoleApi.delete(ids);
                            if (res.status == 200) {
                                self.$snotifySuccess(
                                    this.$t('v2.account.deleted') + ids.length + this.$t('v2.account.items'),
                                );
                            } else {
                                self.$snotifyError(
                                    res,
                                    this.$t('v2.account.canNotDeleteSelectedItems'),
                                );
                            }
                        } catch (error) {
                            self.$snotifyError(
                                error,
                                this.$t('v2.account.canNotDeleteSelectedItems'),
                            );
                        }
                        refreshList();
                    },
                },
                detail: {
                    name: 'detail',
                    text: this.$t('common.detail'),
                    callback: (row, callback) => {
                        self.$refs.listSystemRole.actionPanel = true;
                        self.getDetailSystemRole(row.id);
                        self.actionOnItem = 'detail';
                        self.applyDataToForm(row);
                    },
                },
            },
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    created() {},
    watch: {},
    methods: {
        closePanel() {
            this.$refs.listSystemRole.closeactionPanel();
        },
        async getDetailSystemRole(id) {
            let res = await systemRoleApi.detail(id);
            if (res.status == 200) {
                for (let key in res.data) {
                    this.$set(this.currentItemData, key, res.data[key]);
                }
            } else {
                this.$snotifyError(res, this.$t('v2.account.canNotGetItemDetail'));
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
                this.$snotifyError(res, this.$t('v2.account.canNotGetPermissionOfRole'));
            }
        },
        handleSavedItem() {
            this.$refs.listSystemRole.refreshList();
        },
        handleAddItem() {
            this.actionOnItem = 'create';
            for (let key in this.currentItemData) {
                if (key == 'users' || key == 'permissions') {
                    this.currentItemData.users = [];
                } else {
                    this.currentItemData[key] = '';
                }
            }
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
    components: {
        ListItems: ListItems,
        SystemRoleForm,
    },
};
</script>

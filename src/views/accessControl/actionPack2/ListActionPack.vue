<template>
    <div class="w-100 h-100">
        <list-items
            ref="listActionPack"
            :actionPanelWidth="'100%'"
            :pageTitle="$t('permissions.actionPack.list')"
            :tableContextMenu="tableContextMenu"
            :containerHeight="containerHeight"
            :getDataUrl="getListUrl"
            :flexMode="true"
            :commonActionProps="commonActionProps"
            :actionPanelType="'modal'"
            :headerPrefixKeypath="'table'"
            :showExportButton="false"
            :currentItemData="currentItemData"
            @after-open-add-panel="handleAddItem"
        >
            <template slot="right-panel-content">
                <ActionPackForm
                    class="action-pack-form overflow-hidden"
                    ref="actionPackForm"
                    @close-form="closeForm"
                    :action="action"
                    :itemData="currentItemData"
                    @refresh-list="refreshList"
                ></ActionPackForm>
            </template>
        </list-items>
    </div>
</template>
<script>
import _groupBy from 'lodash/groupBy';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs.js';
import ActionPackWorker from 'worker-loader!@/worker/accessControl/ActionPack.Worker.js';
import ListItems from '@/components/common/ListItems.vue';
import ActionPackForm from './actionPackPanel/ActionPackForm';
export default {
    components: {
        ListItems: ListItems,
        ActionPackForm
    },
    data() {
        let self = this;
        return {
            time: 1,
            commonActionProps: {
                module: 'action_pack',
                resource: 'action_pack',
                scope: 'action_pack'
            },
            action: 'edit',
            containerHeight: 300,
            actionOnItem: 'create',
            currentItemData: {
                id: '',
                name: '',
                description: ''
            },
            getListUrl: appConfigs.apiDomain.actionPacks,
            actionPackWorker: null,
            actionPackFormKey: 0,
            //chứa thông tin action pack
            tableContextMenu: {
                update: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: async (row, callback) => {
                        self.action = 'update';
                        await self.updateActionPack(row);
                    }
                },
                copy: {
                    name: 'copy',
                    text: this.$t('common.copy'),
                    callback: async (row, callback) => {
                        self.action = 'copy';
                        await self.updateActionPack(row);
                    }
                },
                delete: {
                    name: 'remove',
                    text: this.$t('common.delete'),
                    callback: async (rows, refreshList) => {
                        let ids = [];
                        for (let item of rows) {
                            ids.push(item.id);
                        }
                        this.actionPackWorker.postMessage({
                            action: 'deleteActionPack',
                            data: {
                                ids: ids
                            }
                        });
                    }
                },
                detail: {
                    name: 'detail',
                    text: this.$t('common.detail'),
                    callback: async (row, callback) => {
                        self.action = 'view';
                        await self.updateActionPack(row);
                    }
                }
            },
            listFilter: [],
            objectTypeOneRow: [
                'account',
                'data_connector',
                'action_pack',
                'permission_pack',
                'system_role',
                'orgchart_role',
                'filter'
            ]
        };
    },
    mounted() {
        let self = this;
        // $(window).on('beforeunload', function (e) {
        //     if (self.$refs.actionPackForm) return false;
        // });
        this.containerHeight = util.getComponentSize(this).h;
        this.actionPackWorker = new ActionPackWorker();
        this.actionPackWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'handleDeleteActionPack':
                    self.$snotifySuccess(
                        self.$t('v2.acessControl.successfullDelete')
                    );
                    setTimeout(function (e) {
                        self.refreshList();
                    }, 1000);
                    break;
                default:
                    break;
            }
        });
    },
    methods: {
        updateActionPack(row) {
            this.$refs.listActionPack.openactionPanel();
            this.currentItemData.id = row.id;
            this.currentItemData.name = row.name;
            this.currentItemData.description = row.description;

            if (this.time != 1) {
                setTimeout(() => {
                    this.$refs.actionPackForm.getData(row.id);
                }, 0);
            } else this.time++;
        },
        closeForm() {
            this.$refs.listActionPack.closeactionPanel();
            this.currentItemData.id = '';
            this.currentItemData.name = '';
            this.currentItemData.description = '';
        },
        async handleAddItem() {
            this.action = 'create';
            if (this.time != 1) {
                setTimeout(() => {
                    this.$refs.actionPackForm.getData();
                }, 0);
            } else this.time++;
        },
        refreshList() {
            this.$refs.listActionPack.refreshList();
        }
    }
};
</script>

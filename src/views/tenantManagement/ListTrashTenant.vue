<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listTenant"
            :getDataUrl="apiUrl"
            :headerPrefixKeypath="'tenantManager.header'"
            :pageTitle="$t('tenantManager.listTrashTenant')"
            :containerHeight="tableHeight"
            :tableContextMenu="tableContextMenu"
            :useDefaultContext="false"
            :actionPanelWidth="600"
            :flexMode="true"
            :isShowSidebar="false"
            :showExportButton="false"
            :customAPIResult="customAPIResult"
            :emptyDataKey="'tenant-deleted-list'"
            :showButtonAdd="false"
        >
        </ListItems>
    </div>
</template>
<script>
import ListItems from '@/components/common/ListItems';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs';
import { tenantApi } from '@/api/tenantManagement.js';
export default {
    components: {
        ListItems
    },
    data: function () {
        let self = this;
        return {
            tableHeight: 0,
            tenantWorker: null,
            tableContextMenu: {
                restore: {
                    name: 'restore',
                    text: this.$t('common.restore'),
                    callback: async (obj, refreshList) => {
                        let res = await tenantApi.restore(obj.id);
                        if (res.status == 200) {
                            self.$snotifySuccess(
                                self.$t('tenantManager.restoreTenantSuccess')
                            );
                            refreshList();
                        } else {
                            self.$snotify({
                                type: 'error',
                                title: self.$t(
                                    'tenantManager.restoreTenantError'
                                )
                            });
                        }
                    }
                }
            },
            apiUrl: appConfigs.apiDomain.tenantManagement + 'tenant/list-trash',
            customAPIResult: {
                reformatData(res) {
                    let column = res.data.column;
                    column.map((e) => {
                        if (e.name == 'status') {
                            e.cellRenderer = function (params) {
                                let newValue =
                                    params.value == 1
                                        ? self.$t('tenantManager.active')
                                        : self.$t('tenantManager.inActive');
                                return '<span>' + newValue + '</span>';
                            };
                        } else if (e.name == 'createdAt') {
                            e.cellRenderer = function (params) {
                                let newValue = params.value.slice(
                                    0,
                                    params.value.length - 1
                                );
                                return '<span>' + newValue + '</span>';
                            };
                        } else if (e.name == 'updatedAt') {
                            e.cellRenderer = function (params) {
                                let newValue = params.value.slice(
                                    0,
                                    params.value.length - 1
                                );
                                return '<span>' + newValue + '</span>';
                            };
                        }
                    });
                    return {
                        columns: column,
                        listObject: res.data.listObject,
                        total: res.data.total
                    };
                }
            }
        };
    },
    mounted() {
        this.tableHeight = util.getComponentSize(this).h;
    }
};
</script>

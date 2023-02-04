<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listWork"
            :pageTitle="$t('v2.admin.listSystemService')"
            :getDataUrl="apiUrl"
            :showButtonAdd="false"
            :showExportButton="false"
            :showImportButton="false"
            :tableContextMenu="tableContextMenu"
            :useDefaultContext="false"
            :headerPrefixKeypath="'admin.table'"
            :useActionPanel="true"
            :customAPIResult="customAPIResult"
            :actionPanelWidth="700"
            :containerHeight="containerHeight"
            :showImportHistoryBtn="false"
            :showActionPanelInDisplayConfig="false"
            :emptyDataKey="'admin-system-service-list'"
        >
            <template slot="right-panel-content">
                <JobDetail />
            </template>
        </ListItems>
    </div>
</template>

<script>
import ListItems from '@/components/common/ListItems.vue';
import { util } from '@/plugins/util.js';
import JobDetail from './JobDetail';
import { adminApi } from '@/api/Admin.js';
import { appConfigs } from '@/configs';
export default {
    components: {
        ListItems,
        JobDetail
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
    data() {
        let self = this;
        return {
            containerHeight: null,
            apiUrl: appConfigs.apiDomain.workflowExtend + 'jobs',
            customAPIResult: {
                reformatData(res) {
                    let columns = [
                        {
                            name: 'id',
                            title: 'id',
                            type: 'numeric'
                        },
                        {
                            name: 'dueDate',
                            title: 'dueDate',
                            type: 'text'
                        },
                        {
                            name: 'processDefinitionId',
                            title: 'processDefinitionId',
                            type: 'text'
                        },
                        {
                            name: 'processInstanceId',
                            title: 'processInstanceId',
                            type: 'text'
                        },
                        {
                            name: 'repeat',
                            title: 'repeat',
                            type: 'text'
                        },
                        {
                            name: 'retries',
                            title: 'retries',
                            type: 'text'
                        },
                        {
                            name: 'tenantId',
                            title: 'tenantId',
                            type: 'date'
                        }
                    ];
                    return {
                        listObject: res.data.listObject,
                        total: res.data.total,
                        columns: columns
                    };
                }
            },
            tableContextMenu: {
                deleteWork: {
                    name: 'Delete work',
                    text: self.$t('v2.admin.deleteWork'),
                    callback: (obj, callback) => {
                        adminApi
                            .removeJob(obj.id)
                            .then((res) => {
                                if (res.status == 200) {
                                    self.$snotifySuccess(
                                        '',
                                        self.$t('v2.admin.deletedSuccess')
                                    );
                                } else {
                                    self.$snotifyError(
                                        '',
                                        self.$t('v2.admin.canNotDelete')
                                    );
                                }
                            })
                            .catch((err) => {
                                self.$snotifyError(
                                    '',
                                    self.$t('v2.admin.canNotDelete')
                                );
                            });
                        self.$refs.listWork.refreshList();
                    }
                }
            }
        };
    }
};
</script>

<style></style>

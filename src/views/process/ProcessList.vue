<template>
    <div class="w-100 h-100">
        <list-items
            ref="listModels"
            :useDefaultContext="false"
            :pageTitle="$t('process.list.title')"
            :tableContextMenu="tableContextMenu"
            :containerHeight="containerHeight"
            :showExportButton="false"
            :customAPIResult="customAPIResult"
            :getDataUrl="getListUrl"
            :exportLink="exportLink"
            :autoRefreshTopic="'workflow_definition'"
            :headerPrefixKeypath="'common'"
            :commonActionProps="commonActionProps"
            :emptyDataKey="'workflow-process-list'"
            :showCloseIcon="true"
            :useActionPanel="true"
            :actionPanelWidth="1000"
            @after-open-add-panel="goToCreatePage"
        >
            <template slot="right-panel-content">
                <DetailWorkflow
                    ref="detailWorkflow"
                    v-if="showPanel"
                    :itemData="selectedItem"
                    @show-panel="showDetailWorkflow"
                    @close-panel="closePanel"
                />
            </template>
        </list-items>
    </div>
</template>
<script>
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs.js';
import ListItems from '@/components/common/ListItems.vue';
import bpmnApi from '@/api/BPMNEngine.js';

import {
    deployProcess,
    deployProcessFromXML,
    getLastestDefinition
} from '@/components/process/processAction.js';
import { taskApi } from '@/api/task.js';

export default {
    data() {
        let self = this;
        return {
            commonActionProps: {
                module: 'workflow',
                resource: 'workflow_definition',
                scope: 'workflow'
            },
            showPanel: false,
            selectedItem: null,
            exportLink: appConfigs.apiDomain.bpmne.models + '/export',
            containerHeight: 300,
            deployProcessFromXML: deployProcessFromXML,
            listItemOptions: {},
            getListUrl: appConfigs.apiDomain.bpmne.models,
            tableContextMenu: {
                update: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: (row, callback) => {
                        self.$goToPage(
                            '/workflow/' + row.id + '/edit',
                            this.$t('common.edit') +
                                ' ' +
                                (row.name ? row.name : row.key)
                        );
                    }
                },
                clone: {
                    name: 'clone',
                    text: this.$t('common.clone'),
                    callback: (row, callback) => {
                        self.$goToPage(
                            '/workflow/' + row.id + '/clone',
                            this.$t('common.clone') +
                                ' ' +
                                (row.name ? row.name : row.key)
                        );
                    }
                },
                drop: {
                    name: 'remove',
                    text: this.$t('common.delete'),
                    multipleSelection: true,
                    callback: async (rows, refreshList) => {
                        let ids = [];
                        for (let item of rows) {
                            ids.push(item.id);
                        }
                        try {
                            let res = await bpmnApi.deleteModels(ids);
                            if (res.status == 200) {
                                self.$snotifySuccess(
                                    this.$t('v2.workflow.deleted') + ids.length + this.$t('v2.workflow.items')
                                );
                            } else {
                                self.$snotifyError(
                                    res,
                                    this.$t('v2.workflow.cantDeleteSelectedItems')
                                );
                            }
                        } catch (error) {
                            self.$snotifyError(
                                error,
                                this.$t('v2.workflow.cantDeleteSelectedItems')
                            );
                        }
                        refreshList();
                    }
                },
                deploy: {
                    name: 'deploy',
                    text: this.$t('common.deploy'),
                    callback: (row, callback) => {
                        deployProcess(self, row);
                    }
                },
                deploy_history: {
                    name: 'deployHistory',
                    text: this.$t('process.list.deploy_history'),
                    callback: (row, callback) => {
                        self.$goToPage(
                            `/workflow/${row.name}/deploy-history`,
                            self.$t('process.deployment.list')
                        );
                    }
                },
                start_instance: {
                    name: 'start',
                    text: this.$t('process.list.start'),
                    callback: async function (row, callback) {
                        let defData = await getLastestDefinition(row, true);
                        if (defData.data[0]) {
                            self.$goToPage(
                                `/workflow/process-definition/${defData.data[0].id}/run`,
                                self.$t('v2.workflow.startProcessInstance')
                            );
                        } else {
                            self.$snotifyError(
                                {},
                                self.$t('v2.workflow.cantFindProcessDefinitionHavingDeploymentId') +
                                    deploymentId
                            );
                        }
                    }
                },
                // list_instance: {
                //     name: 'instances',
                //     text: this.$t('process.list.instances'),
                //     callback: async function (row, callback) {
                //         self.$goToPage(
                //             '/workflow/process-key/' +
                //                 row.processKey +
                //                 '/instances',
                //             self.$t('process.instance.listModelInstance') +
                //                 row.name,
                //         );
                //     },
                // },
                view: {
                    name: 'view',
                    text: this.$t('common.view'),
                    callback: (row, callback) => {
                        self.$goToPage(
                            '/workflow/' + row.id + '/view',
                            self.$t('common.view') +
                                '  ' +
                                (row.name ? row.name : row.key)
                        );
                    }
                },
                list_task: {
                    name: 'listTask',
                    text: this.$t('tasks.header.list'),
                    callback: async (row, callback) => {
                        let lastestDefinition = await getLastestDefinition(
                            row,
                            false
                        );
                        if (lastestDefinition.data[0]) {
                            self.$goToPage('/myitem/work');
                        }
                    }
                },
                list_process: {
                    name: 'listProcess',
                    text: this.$t('v2.workflow.processStatistics'),
                    callback: (obj, callback) => {
                        self.selectedItem = obj;
                        self.showPanel = true;
                        if (self.$refs.detailWorkflow) {
                            self.$refs.detailWorkflow.getDetails(obj);
                        }
                    }
                }
            },
            customAPIResult: {
                reformatData(res) {
                    let listKey = [];
                    res.data.listObject.map((x) => listKey.push(x.processKey));
                    res.data.columns.push({
                        name: 'number_instance',
                        title: self.$t('v2.workflow.numberInstance'),
                        type: 'numeric',
                        noFilter: true
                    });
                    let listWork = res.data;
                    taskApi
                        .countInstant({ keys: JSON.stringify(listKey) })
                        .then((res) => {
                            if (res.status === 200) {
                                for (
                                    let i = 0;
                                    i < listWork.listObject.length;
                                    i++
                                ) {
                                    for (let j = 0; j < res.data.length; j++) {
                                        if (
                                            listWork.listObject[i].processKey ==
                                            res.data[j].key
                                        ) {
                                            listWork.listObject[
                                                i
                                            ].number_instance =
                                                res.data[
                                                    j
                                                ].number_of_process_instance;
                                        }
                                    }
                                }
                                self.$refs.listModels.rerenderTable();
                            }
                        });
                    return listWork;
                }
            }
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    created() {},
    watch: {},
    methods: {
        closePanel() {
            this.$refs.listModels.actionPanel = false;
        },
        showDetailWorkflow() {
            this.showPanel = true;
            this.$refs.listModels.actionPanel = true;
        },
        getListKey(res) {
            let listKey = [];
            res.map((x) => listKey.push(x.processKey));
            return listKey;
        },
        goToCreatePage() {
            this.$refs.listModels.actionPanel = false;
            this.$goToPage(
                '/workflow/create',
                this.$t('process.action.create')
            );
        },
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
        getDataAnddeploy(processId) {}
    },
    components: {
        ListItems: ListItems,
        DetailWorkflow: () => import('@/views/admin/DetailWorkflow')
    }
};
</script>

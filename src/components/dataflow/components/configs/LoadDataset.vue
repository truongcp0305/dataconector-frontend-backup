<template>
    <div class="h-100">
        <v-tabs
            color="orange"
            slider-color="orange text--darken-3"
            class="mb-2 s-tabs-dataflow-load-dataset"
            v-model="nodeData.configs.mode"
            @change="handleChangeMode"
            style="padding: 0 4px; margin-right: 4px"
        >
            <v-tab v-for="item in tabs" :key="item.value" class="s-tab-load-dataset">
                {{ item.text }}
            </v-tab>
        </v-tabs>

        <v-tabs-items v-model="nodeData.configs.mode">
            <v-tab-item>
                <NodeConfig
                    @dataset-selected="handleDatasetSelected"
                    :configs="nodeData.configs"
                />
                <DatasetColumnSelector
                    :style="{
                        height: height - 140 + 'px'
                    }"
                    :rowData="nodeData.configs.allColumns"
                    @change-configs="handleChangeConfigs"
                />
            </v-tab-item>

            <v-tab-item>
                <ColumnsCreator
                    :style="{
                        height: height - 140 + 'px'
                    }"
                    :columns="nodeData.configs.customData.columns"
                />
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
import NodeConfig from '@/components/dataflow/components/NodeConfig';
import DatasetColumnSelector from '@/components/dataset/DatasetColumnSelector';
import DashboardDatasetWorker from 'worker-loader!@/worker/dashboard/dashboard/DashboardDataset.Worker.js';
import { saveChangeColumnValueToHistory } from '@/components/dataflow/configPool/dataflowConfig.js';
import ColumnsCreator from '@/components/dataflow/components/utils/ColumnsCreator.vue';

export default {
    props: {
        nodeData: {
            type: Object,
            default() {
                return {};
            }
        },
        height: {
            default: 400
        }
    },
    watch: {
        'nodeData.configs.customData.columns': {
            deep: true,
            handler(newVal) {
                this.$emit('change-configs', {
                    type: 'change-custom-column',
                    newValue: newVal
                });
            }
        }
    },
    data() {
        return {
            currentId: 0,
            allDatasetColumn: {},
            tabs: [
                {
                    text: this.$t('v2.dataflow.configDataset'),
                    value: 'dataset'
                },
                {
                    text: this.$t('v2.dataflow.configTable'),
                    value: 'customData'
                }
            ]
        };
    },
    created() {
        this.dashboardDatasetWorker = new DashboardDatasetWorker();
        this.listenFromWorker();
    },
    methods: {
        handleChangeMode(newVl) {
            let data = {
                type: 'change-mode',
                newMode: newVl
            };
            this.$emit('change-configs', data);
        },
        handleChangeConfigs(data) {
            if (data.type == 'change-cell-value') {
                saveChangeColumnValueToHistory(
                    data.data,
                    this.nodeData.configs
                );
            }
            this.$emit('change-configs', data);
        },
        handleDatasetSelected(params) {
            setTimeout(
                (self) => {
                    self.changeNodeInfor(params);
                },
                200,
                this
            );
            this.currentId = params.id;
            if (!this.allDatasetColumn[params.id]) {
                this.dashboardDatasetWorker.postMessage({
                    action: 'getDatasetColumns',
                    data: {
                        id: params.id,
                        editInclickhouseMode: this.$route.path.includes(
                            'edit-in-clickhouse-mode'
                        )
                    }
                });
            } else {
                this.$set(
                    this.nodeData.configs,
                    'allColumns',
                    this.allDatasetColumn[params.id]
                );
                this.$emit('change-configs', {
                    type: 'change-dataset',
                    data: this.allDatasetColumn[params.id]
                });
            }
        },
        changeNodeInfor(params) {
            this.$set(this.nodeData.configs, 'idDataset', params.id);
            this.$set(this.nodeData.configs, 'title', params.aliasName);
            this.$set(this.nodeData.configs, 'name', params.name);
            this.$set(this.nodeData.configs, 'symperDocId', params.symperId);
        },
        handleGetDatasetColumns(data) {
            if (data.status == 200) {
                this.$set(this.allDatasetColumn, this.currentId, data.data);
                this.$set(this.nodeData.configs, 'allColumns', data.data);
                this.$emit('change-configs', {
                    type: 'change-dataset',
                    data: data.data
                });
            } else {
                this.$snotifyError(this.$t('v2.dataflow.dontGetColumnRecord'));
            }
        },
        listenFromWorker() {
            let self = this;
            this.dashboardDatasetWorker.addEventListener(
                'message',
                function (event) {
                    let data = event.data;
                    let action = data.action;
                    if (self[action]) {
                        self[action](data.data);
                    } else {
                        console.error(` action ${action} not found `);
                    }
                }
            );
        }
    },
    components: {
        NodeConfig,
        DatasetColumnSelector,
        ColumnsCreator
    }
};
</script>

<style >
.theme--light.v-tabs.s-tabs-dataflow-load-dataset .v-tab--active:hover::before, .theme--light.v-tabs .v-tab--active::before {
    opacity: 0; 
}
.s-tabs-dataflow-load-dataset .v-tabs-bar{
    height: 32px;
}
.s-tabs-dataflow-load-dataset .v-slide-group__wrapper{
    height:36px;
}
.theme--light.v-tabs.s-tabs-dataflow-load-dataset .v-tab:hover::before {
    opacity: 0;
}
.s-tabs-dataflow-load-dataset .v-tabs-bar__content:first-child .s-tab-load-dataset{
    margin: 0 16px 0 0 !important;
}

.s-tabs-dataflow-load-dataset .v-tab{
    padding: 0 0 !important;
    margin: 0 16px;
}
</style>

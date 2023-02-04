<template>
    <div class="h-100">
        <v-switch
            class="sym-small-size"
            v-model="homeConfig.autoSaveConfig.active"
            @change="changeAutoSaveConfig"
            :loading="homeConfig.autoSaveConfig.saving"
            :label="$t('v2.dataflow.autoSaveDataflowEach30s')"
        ></v-switch>

        <v-switch
            class="sym-small-size"
            v-model="homeConfig.extra.changeColGeneration"
            @change="handleChangeColGeneration"
            :label="$t('bi.dataflow.applyNewColumnGenerateMechanism')"
        ></v-switch>

        <v-btn
            small
            color="primary"
            depressed
            class="my-2 w-100 ml-1"
            style="width: calc(100% - 4px)"
            :disabled="homeConfig.autoSaveConfig.restoring"
            :loading="homeConfig.autoSaveConfig.restoring"
            @click="restoreCachedConfig"
        >
            {{ $t('v2.dataflow.restoreLastestCachedConfig') }}
        </v-btn>
        <ag-grid-vue
            :style="{ width: '100%', height: '100%' }"
            class="ag-theme-balham"
            id="myGrid"
            :columnDefs="columnDefs"
            :rowData="homeConfig.variables"
            @cell-editing-stopped="handleStopEditCell"
            :gridOptions="gridOptions"
        >
        </ag-grid-vue>
    </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue';

export default {
    components: {
        'ag-grid-vue': AgGridVue
    },
    props: {
        instanceKey: {
            default: ''
        },
        nodeData: {
            type: Object,
            default() {
                return {};
            }
        },
        mode: {
            default: 'define' // define, setValue
        },
        idObject: {
            default: ''
        }
    },
    watch: {
        nodeData: {
            deep: true,
            immediate: true,
            handler(vl) {
                if (vl && vl.variables && vl.variables.length == 0) {
                    vl.variables.push({
                        name: '',
                        type: 'number',
                        defaultValue: 0,
                        title: ''
                    });
                }
            }
        }
    },
    data() {
        return {
            gridOptions: {
                defaultColDef: {
                    editable: true
                },
                enableRangeSelection: true
            }
        };
    },
    computed: {
        columnDefs() {
            if (this.mode == 'define') {
                return [
                    {
                        field: 'name',
                        headerName: this.$t('v2.dataflow.name'),
                        width: 120
                    },
                    {
                        field: 'type',
                        headerName: this.$t('v2.dataflow.dataType'),
                        width: 100,
                        cellEditorSelector: function () {
                            return {
                                component: 'agRichSelectCellEditor',
                                params: {
                                    values: ['number', 'text', 'date']
                                }
                            };
                        }
                    },
                    {
                        field: 'defaultValue',
                        headerName: this.$t('v2.dataflow.defaultValue'),
                        width: 120
                    },
                    {
                        field: 'title',
                        headerName: this.$t('v2.dataflow.title')
                    }
                ];
            } else if (this.mode == 'setValue') {
                return [
                    {
                        field: 'name',
                        headerName: this.$t('v2.dataflow.name'),
                        width: 120,
                        editable: false
                    },
                    {
                        field: 'type',
                        headerName: this.$t('v2.dataflow.dataType'),
                        width: 100,
                        cellEditorSelector: function () {
                            return {
                                component: 'agRichSelectCellEditor',
                                params: {
                                    values: ['number', 'text', 'date']
                                }
                            };
                        },
                        editable: false
                    },
                    {
                        field: 'defaultValue',
                        headerName: this.$t('v2.dataflow.defaultValue'),
                        width: 120,
                        editable: false
                    },
                    {
                        field: 'title',
                        headerName: this.$t('v2.dataflow.title'),
                        editable: false
                    },
                    {
                        field: 'value',
                        headerName: this.$t('v2.dataflow.value'),
                        editable: true
                    }
                ];
            }
        },
        homeConfig() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .allWidget.home;
        }
    },
    mounted() {
        this.gridApi = this.gridOptions.api;
        this.gridColumnApi = this.gridOptions.columnApi;
    },
    methods: {
        handleChangeColGeneration(value) {
            let allNodes =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .allWidget;
            for (let key in allNodes) {
                allNodes[key].changeColGeneration = value;
                if(allNodes[key].configs){
                    allNodes[key].configs.changeColGeneration = value;
                }
            }

            for (let key in allNodes) {
                if(allNodes[key].type == 'Load'){
                    allNodes[key].run(true, 'run-node')
                }
            }
        },
        restoreCachedConfig() {
            if (this.homeConfig.autoSaveConfig.restoring) {
                return;
            }
            this.$evtBus.$emit('bi-dataflow-restore-cached-config', {
                instanceKey: this.instanceKey
            });
        },
        changeAutoSaveConfig() {
            this.$evtBus.$emit('bi-dataflow-change-auto-save-config', {
                instanceKey: this.instanceKey
            });
        },
        handleStopEditCell(row) {
            if (row.rowIndex == this.nodeData.variables.length - 1) {
                this.nodeData.variables.push({
                    name: '',
                    type: 'number',
                    defaultValue: 0,
                    title: ''
                });
                this.gridApi.setFocusedCell(row.rowIndex + 1, row.colDef.field);
            }
        }
    }
};
</script>

<style></style>

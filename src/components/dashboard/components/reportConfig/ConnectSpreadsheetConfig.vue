<template>
    <div class="w-100 h-100">
        <form-tpl
            class="px-2"
            :allInputs="inputs"
            @input-value-changed="handleChangeValue"
        ></form-tpl>
        <div class="mx-2 mt-2 mb-1">
            {{ $t('v2.dashboard.mapDatasetToSheetColumn') }}
        </div>
        <ag-grid-vue
            class="ag-theme-balham mx-2"
            :style="{
                width: 'calc(100% - 16px)',
                height: 'calc(100% - 180px)',
                minHeight: '100px'
            }"
            :columnDefs="mappingColumnsData.columns"
            :rowData="mappingColumnsData.value"
            :gridOptions="gridOptions"
        >
        </ag-grid-vue>
    </div>
</template>

<script>
import FormTpl from '@/components/common/FormTpl.vue';
import { AgGridVue } from 'ag-grid-vue';
import { MSIService } from '@/api/msi.js';

export default {
    methods: {
        async handleChangeValue(name, inputInfo, data) {
            this.currentReport.rawConfigs.connectConfig.file.value.info = {
                id: data.id,
                name: data.name,
                size: data.size,
                displayName: data.displayName,
                shareLink: data.shareLink,
                others: data.others ? data.others : {}
            };
            this.currentReport.rawConfigs.connectConfig.file.props.uploadDisplayName =
                data.displayName;
        }
    },
    components: {
        FormTpl,
        'ag-grid-vue': AgGridVue
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
        currentReport() {
            let data =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .currentCellConfigs;
            let connectConfig = data.rawConfigs.connectConfig;
            for (let key in connectConfig) {
                connectConfig[key].title = this.$t(connectConfig[key].title);
                if (connectConfig[key].hasOwnProperty('columns')) {
                    for (let i in connectConfig[key].columns) {
                        connectConfig[key].columns[i].headerName = this.$t(
                            connectConfig[key].columns[i].headerName
                        );
                    }
                }
            }
            return data;
        },
        inputs() {
            let report =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .currentCellConfigs;
            let connectConfig = report.rawConfigs.connectConfig;
            connectConfig.file.props.uploadFileFunction = MSIService.uploadFile;
            connectConfig.file.props.fileName =
                'report-' + report.sharedConfigs.cellId;
            connectConfig.file.title = this.$t(connectConfig.file.title);
            connectConfig.sheet.title = this.$t(connectConfig.sheet.title);
            connectConfig.range.title = this.$t(connectConfig.range.title);
            return {
                file: connectConfig.file,
                sheet: connectConfig.sheet,
                range: connectConfig.range
            };
        },
        mappingColumnsData() {
            let report =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .currentCellConfigs;
            let connectConfig = report.rawConfigs.connectConfig;
            let mapPrevConfigs = {};
            for (const iterator of connectConfig.mapping.value) {
                mapPrevConfigs[iterator.datasetColumn] =
                    iterator.spreadsheetColumn;
                mapPrevConfigs[iterator.colKey] = iterator.spreadsheetColumn;
            }

            let newMappingValue = [];
            for (const colInfo of report.rawConfigs.setting.value
                .selectedColums) {
                let row = {
                    colKey: colInfo.key,
                    datasetColumn: colInfo.as,
                    spreadsheetColumn: ''
                };

                if (mapPrevConfigs[colInfo.as]) {
                    row.spreadsheetColumn = mapPrevConfigs[colInfo.as];
                }

                if (colInfo.key && mapPrevConfigs[colInfo.key]) {
                    row.spreadsheetColumn = mapPrevConfigs[colInfo.key];
                }
                newMappingValue.push(row);
            }
            connectConfig.mapping.value = newMappingValue;
            connectConfig.mapping.title = this.$t(connectConfig.mapping.title);
            for (let key in connectConfig.mapping.columns) {
                connectConfig.mapping.columns[key].headerName = this.$t(
                    connectConfig.mapping.columns[key].headerName
                );
            }
            return connectConfig.mapping;
        }
    },
    props: {
        instanceKey: {
            type: Number,
            default: 0
        },
        height: {
            type: Number,
            default: 0
        },
        isView: {
            type: Boolean
        }
    }
};
</script>

<style></style>

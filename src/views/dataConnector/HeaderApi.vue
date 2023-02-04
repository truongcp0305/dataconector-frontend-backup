<template>
    <div class="mt-4">
        <div class="fw-430 fs-13 my-2">{{$t('v2.dataconnector.parameterDeclaration')}}</div>
        <div class="fs-11 color-grey d-flex justify-space-between">
            <span>
                {{$t('v2.dataconnector.doNotChangeTheDefaultInformationIfItIsNotNecessary')}}
            </span>
        </div>
        <div class="mt-2 mb-5" style="height: 180px !important">
            <AgGridVue class="ag-theme-alpine agrid-table h-100" style="width: 99%" :columnDefs="columnDefs"
                @cell-clicked="onCellClicked" @cell-key-down="onCellKeyDown" :gridOptions="gridOptions"
                @cell-value-changed="onValueChange" :defaultColDef="defaultColDef" :rowData="rowData" />
        </div>
        <SymperDragPanel ref="symDragPanel" :dragPanelWidth="dragPanelWidth" :dragPanelHeight="450" :topPosition="100"
            :leftPosition="500" :actionTitle="''" :titleIcon="''" :styleBody="{ 'overflow-y': 'scroll', width: '100%' }"
            @before-close="closeEditor">
            <template slot="panel-action">
                <v-icon v-if="isDebugMode && !isShowDebugMode" @click="showDebugMode">mdi-bug-outline</v-icon>
                <v-icon v-if="isShowDebugMode" @click="debug">mdi-play-outline</v-icon>
            </template>
            <template slot="drag-panel-content">
                <!-- @blur="handleEditor" -->
                <!-- <submitDocument :isQickSubmit="true" :docId="340" v-if="!isQickSubmit"/> -->
                <FormulaEditor v-model="editor" ref="edtFormula" :width="'100%'" :height="'200px'"></FormulaEditor>
            </template>
        </SymperDragPanel>
    </div>
</template>
<script>
import FormulaEditor from './../../components/formula/editor/FormulaEditor';
import SymperDragPanel from './../../components/common/SymperDragPanel.vue';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { AgGridVue } from 'ag-grid-vue';
export default {
    created() {
        if (this.headers != '') {
            this.setData(this.headers);
        }
    },
    mounted() {},
    props: {
        dataRunApi: {
            type: Object,
            default() {
                return {};
            },
        },
        typeAction: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default() {
                return false;
            },
        },
        headers: {
            type: String,
            default: '',
        },
    },
    watch: {
        typeAction() {
            this.columnDefs.map((col, index) => {
                this.columnDefs[index].editable =
                    this.typeAction == 'view' ? false : true;
            });
            this.gridOptions.api.setColumnDefs([]);
            this.gridOptions.api.setColumnDefs(this.columnDefs);
            this.gridOptions.api.setRowData(this.rowData);
        },
        editor() {
            this.currentRow.node.setDataValue('formula', this.editor);
        },
    },
    components: {
        AgGridVue,
        SymperDragPanel,
        FormulaEditor,
    },
    beforeMount() {
        this.defaultColDef = {
            minWidth: 40,
        };
    },
    methods: {
        showDebugMode() {
            this.isShowDebugMode = true;
            this.dragPanelWidth = 900;
            this.dragPanelHeight = 700;
            this.$refs.edtFormula.toggleDebugView();
        },
        hideDebugMode() {
            this.isShowDebugMode = false;
            this.dragPanelWidth = 500;
            this.dragPanelHeight = 400;
            this.$refs.edtFormula.toggleDebugView();
        },
        debug() {
            this.$refs.edtFormula.executeFormulas();
        },
        closeEditor() {
            if (this.isShowDebugMode) {
                this.hideDebugMode();
            }
            this.$refs.symDragPanel.hide();
        },
        refreshData() {
            this.isLoading = false;
            this.rowData = [{ key: '', value: '', formula: '' }];
            this.des = '';
            if (this.gridOptions) {
                this.gridOptions.api.setRowData(this.rowData);
                this.gridOptions.api.redrawRows();
            }
        },
        setData(data) {
            this.rowData = [];
            if (data != '{}' && data != '') {
                let listData = JSON.parse(data);
                Object.keys(listData).map((key) => {
                    this.rowData.push({
                        key: key,
                        value: listData[key].value,
                        formula: listData[key].formula
                            ? listData[key].formula
                            : '',
                    });
                });
            } else {
                this.rowData.push({ key: '', value: '', formula: '' });
            }
        },
        getRowHeight: function (params) {
            return 35;
        },
        onCellClicked(params) {
            this.currentRow = params;
            if (params.column.colDef.field == 'formula') {
                this.$refs.symDragPanel.show();
            }
        },
        onCellKeyDown(params) {
            let event = params.event;
            if (event.key == 'Enter' && event.shiftKey) {
                let row = { key: '', value: '', formula: '' };
                params.api.applyTransaction({
                    add: [row],
                    addIndex: params.rowIndex + 1,
                });
            }
        },
        run() {
            this.$emit('run-api');
        },
        onValueChange(params) {
            let rowData = [];
            params.api.forEachNode((node) => {
                rowData.push(Object.assign({}, node.data));
            });
            this.formatRowData(rowData);
        },
        formatRowData(rowData) {
            let value = {};
            let allValue = {};
            rowData.map((row) => {
                if (row.key != '' && row.key) {
                    value[row.key] = row.value;
                    allValue[row.key] = {
                        value: row.value,
                        formula: row.formula,
                    };
                }
            });
            this.$emit('change-header', JSON.stringify(allValue));
        },
    },
    data() {
        return {
            editor: ' ',
            dragPanelHeight: 400,
            dragPanelWidth: 500,
            currentRow: '',
            isLoading: false,
            isDebugMode: true,
            isShowDebugMode: false,
            gridOptions: {
                headerHeight: 35,
            },
            columnDefs: [
                {
                    field: 'key',
                    headerName: this.$t('v2.dataconnector.key'),
                    type: 'text',
                    editable: this.disabled ? false : true,
                },
                {
                    field: 'value',
                    headerName: this.$t('v2.dataconnector.value'),
                    type: 'text',
                    editable: this.disabled ? false : true,
                },
                {
                    field: 'formula',
                    headerName: this.$t('v2.dataconnector.formula'),
                    type: 'text',
                    editable: this.disabled ? false : true,
                },
            ],
            defaultColDef: {
                minWidth: 150,
                maxWidth: 150,
                editable: this.disabled ? false : true,
                wrapText: true,
            },
            rowData: [{ key: '', value: '', formula: '' }],
            des: '',
        };
    },
};
</script>
<style scoped>
.agrid-table>>>.ag-body-horizontal-scroll {
    display: none;
}

.agrid-table>>>.ag-cell-value {
    font-size: 11px !important;
}

.agrid-table>>>.ag-header-cell-text {
    font-size: 11px !important;
}
</style>

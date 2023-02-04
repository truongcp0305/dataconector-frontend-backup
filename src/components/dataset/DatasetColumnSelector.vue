<template>
    <div
        class="dataflow-output-column"
        :style="{
            height: componentHeight,
        }"
    >
        <v-text-field
            v-model="searchKey"
            single-line
            append-icon="mdi-magnify"
            solo
            class="s-input-search"
        >
        </v-text-field>
        <div class="ml-2 mr-2" style="height: calc(100% - 57px)">
            <ag-grid-vue
                :style="{
                    width: '100%',
                    height: '100%',
                }"
                :class="{ 'ag-theme-balham': true }"
                :defaultColDef="defaultColDef"
                :suppressRowClickSelection="true"
                :gridOptions="gridOptions"
                :columnDefs="columnDefs"
                :rowData="tableData"
                @grid-ready="onGridReady"
                @cell-mouse-over="onTableInteract"
                @cell-value-changed="onCellValueChanged"
                @row-selected="onSelectionChanged"
                @cell-context-menu="cellContextMenu"
                @model-updated="handleTableDataChange"
            >
            </ag-grid-vue>
        </div>
    </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue';
export default {
    created() {
        this.manualCheckSelected = false;
    },
    props: {
        rowData: {
            type: Array,
            default() {},
        },
        useCheckbox: {
            type: Boolean,
            default: true,
        },
        height: {
            default: '100%',
        },
    },
    data() {
        let self=this;
        return {
            defaultColDef: null,
            gridOptions: null,
            columnDefs: [
                {
                    checkboxSelection: true,
                    editable: false,
                    field: 'selected',
                    headerName: 'select',
                    width: 50,
                },
                {
                    headerName: self.$t('v2.importExport.name'),
                    field: 'columnName',
                    type: 'text',
                    width: 70,
                },
                {
                    headerName: self.$t('v2.importExport.type'),
                    field: 'type',
                    type: 'text',
                    editable: true,
                    cellEditor: 'agSelectCellEditor',
                    cellEditorParams: {
                        values: ['number', 'text', 'datetime', 'date', 'time'],
                    },
                    width: 70,
                },
                {
                    headerName: self.$t('v2.importExport.rename'),
                    field: 'title',
                    type: 'text',
                    editable: true,
                },
                {
                    headerName: self.$t('v2.importExport.description'),
                    field: 'description',
                    type: 'text',
                    editable: true,
                },
            ],
            tableHeight: 400,
            searchKey: '',
            gridApi: null,
        };
    },
    computed: {
        componentHeight() {
            if (isNaN(this.height)) {
                return this.height;
            } else {
                return this.height + 'px';
            }
        },
        tableData() {
            let self = this;
            this.manualCheckSelected = false;
            if (this.searchKey == '') {
                return this.rowData;
            } else {
                let arr = [];
                let searchKey = self.searchKey.toLowerCase();
                this.rowData.forEach(function (e) {
                    if (
                        e.columnName.toLowerCase().includes(searchKey) ||
                        e.type.toLowerCase().includes(searchKey) ||
                        e.title.toLowerCase().includes(searchKey)
                    ) {
                        arr.push(e);
                    }
                });
                return arr;
            }
        },
    },
    beforeMount() {
        this.defaultColDef = {
            minWidth: 40,
            filter: true,
            sortable: true,
            resizable: true,
            autoHeight: true,
            headerCheckboxSelection: function isFirstColumn(params) {
                var displayedColumns =
                    params.columnApi.getAllDisplayedColumns();
                var thisIsFirstColumn = displayedColumns[0] === params.column;
                return thisIsFirstColumn;
            },
        };
        this.gridOptions = {
            enableRangeSelection: true,
            rowSelection: 'multiple',
        };
    },
    methods: {
        onTableInteract() {
            this.manualCheckSelected = true;
        },
        handleTableDataChange() {
            if (!this.manualCheckSelected) {
                this.setSelectedRow();
            }
        },
        onCellValueChanged(event) {
            this.$emit('change-configs', {
                type: 'change-cell-value',
                data: {
                    fieldcolumn: event.colDef.field,
                    oldValue: event.oldValue,
                    newValue: event.newValue,
                    colUid: event.node.data.uid,
                    rowIndex: event.rowIndex,
                },
            });
        },
        onSelectionChanged(event) {
            let rowIndex = event.node.id;
            if (!this.tableData[rowIndex]) {
                return;
            }
            this.tableData[rowIndex].selected = event.node.selected;

            if (this.debounceChangeConfigEmit) {
                clearTimeout(this.debounceChangeConfigEmit);
            }
            if (this.manualCheckSelected) {
                this.debounceChangeConfigEmit = setTimeout(
                    (self) => {
                        self.$emit('change-configs', {
                            type: 'select-row-change',
                            data: {
                                row: event.data
                            },
                        });
                    },
                    50,
                    this,
                );
            }
        },
        cellContextMenu(params) {},
        onGridReady(params) {
            this.gridApi = params.api;
            this.setSelectedRow();
        },
        setSelectedRow() {
            if (this.gridApi) {
                this.gridApi.forEachNode((node) => {
                    if (node.data.selected) {
                        node.setSelected(true);
                    }
                });
            }
        },
    },
    mounted() {
        // this.gridApi = this.gridOptions.api;
    },
    components: {
        AgGridVue,
    },
    watch: {},
};
</script>

<style scoped>
.dataflow-output-column >>> .v-input__control .v-input__slot label,
.dataflow-output-column >>> .v-input__control .v-input__slot .v-icon,
.dataflow-output-column >>> .v-input__control .v-input__slot input {
    font: 13px roboto;
}
.dataflow-output-column >>> .v-input__control .v-text-field__details {
    display: none;
}
.dataflow-output-column >>> .v-input__control {
    margin: 4px 12px 4px 8px;
    min-height: unset;
}
.dataflow-output-column >>> .v-input__control .v-input__slot {
    box-shadow: unset !important;
    margin-top: 8px;
    border: 1px solid lightgray;
    height: 28px;
}
.dataflow-output-column >>> .v-input__control .v-input__slot .v-icon {
    font-size: 18px;
}

.s-input-search >>> .v-input__slot {
    margin: 0px !important;
}
</style>

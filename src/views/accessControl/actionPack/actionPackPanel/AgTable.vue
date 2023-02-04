<template>
    <ag-grid-vue
        class="ag-theme-balham agrid-table ag-list-items-table w-100 mb-3"
        :columnDefs="columnDefs"
        @rowClicked="handlerRowClicked"
        @cell-key-down="onCellKeyDown"
        :defaultColDef="defaultColDef"
        :gridOptions="gridOptions"
        :rowData="rowData"
    >
    </ag-grid-vue>
</template>
<script>
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import { AgGridVue } from 'ag-grid-vue';
import ConfigFilterCellRenderer from '../ConfigFilterCellRenderer';
export default {
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data() {
        return {
            gridOptions: {
                containerHeight: 450,
                suppressRowClickSelection: true,
                headerHeight: 25,
                rowHeight: 120,
                enableRangeSelection: true,
                enableRangeHandle: true,
                suppressClipboardPaste: true,
                applyColumnDefOrder: true,
                components: {
                    ConfigFilterCellRenderer: ConfigFilterCellRenderer,
                },
            },
            defaultColDef: {
                sortable: true,
                resizable: true,
                autoHeight: true,
                filter: true,
            },
        };
    },
    props: {
        name: {
            type: String,
            default: '',
        },
        rowData: {
            type: Array,
            default() {
                return [];
            },
        },
        columnDefs: {
            type: Array,
            default() {
                return [];
            },
        },
        styleTable: {
            type: String,
            default() {
                return '';
            },
        },
        autoHeight: {
            type: Boolean,
            default() {
                return false;
            },
        },
    },
    mounted() {
        const self = this;
        this.$evtBus.$on('set-config-filter-action-pack', (params) => {
            self.setConfigFilter(params);
        });
    },
    created() {
        if (this.autoHeight) {
            this.gridOptions.domLayout = 'autoHeight';
        }
    },
    methods: {
        handlerRowClicked(params) {
            this.$emit('row-click', this.name);
        },
        onCellKeyDown(params) {
            let event = params.event;
            let field = params.colDef.field;
            let allowAction =
                (event.key == 'Enter' || event.code == 'Space') &&
                field != 'object' &&
                field != 'index_increment' &&
                field != 'name';
            if (allowAction) {
                params.node.setDataValue(field, !params.value);
            }
        },
        setConfigFilter(params) {
            if (this.name == params.tableName) {
                params = params.params;
                let rowIndex = this.gridOptions.api.getFocusedCell();
                if (rowIndex) {
                    rowIndex = rowIndex.rowIndex;
                    let rowModel = this.gridOptions.api.getModel();
                    let rowNode = rowModel.rowsToDisplay[rowIndex];
                    rowNode.setDataValue('configFilter', []);
                    rowNode.setDataValue('configFilter', params);
                    this.gridOptions.api.applyTransaction({
                        update: [rowNode.data],
                    });
                    this.gridOptions.api.resetRowHeights();
                    this.$evtBus.$emit(
                        'set-config-filter-control',
                        rowNode.data,
                    );
                }
            }
        },
    },
};
</script>

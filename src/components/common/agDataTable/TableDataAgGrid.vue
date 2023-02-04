<template>
    <div class="dataflow-output-column h-100">
        <div class="ml-2 mr-2" style="height: calc(100% - 4px)">
            <ag-grid-vue
                :style="{
                    width: '100%',
                    height: '100%'
                }"
                :class="{ 'ag-theme-balham': true }"
                :defaultColDef="defaultColDef"
                :suppressRowClickSelection="true"
                :gridOptions="gridOptions"
                :columnDefs="columnDefs"
                :rowData="rowDataClone"
                @model-updated="onTableRender"
                @grid-ready="onGridReady"
                @cell-key-down="handleCellKeyDown"
            >
            </ag-grid-vue>
        </div>
    </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue';
export default {
    created() {
        this.applyChange = true;
    },
    props: {
        rowData: {
            type: Array,
            default() {}
        },
        columnDefs: {
            type: Array,
            default() {}
        },
        editable: {
            default: true
        }
    },
    data() {
        return {
            defaultColDef: null,
            gridOptions: null,
            gridApi: null,
            rowDataClone: null
        };
    },
    watch: {
        rowData: {
            deep: true,
            handler(newVl) {
                if (this.applyChange) {
                    this.rowDataClone = newVl;
                }
            }
        }
    },
    beforeMount() {
        this.defaultColDef = {
            minWidth: 40,
            filter: true,
            sortable: true,
            resizable: true,
            autoHeight: true,
            flex: 1
        };
        this.gridOptions = {
            enableRangeSelection: true,
            rowSelection: 'multiple'
        };
    },
    methods: {
        getAllRows() {
            let rowData = [];
            this.gridApi &&
                this.gridApi.forEachNode((node) => rowData.push(node.data));
            return rowData;
        },
        onGridReady(params) {
            this.gridApi = params.api;
        },
        onTableRender() {
            this.$emit('model-updated', this.getAllRows());
        },
        handleCellKeyDown(params) {
            if (this.editable) {
                let event = params.event;
                if (
                    event.key == 'Enter' &&
                    event.shiftKey &&
                    params.rowIndex == 0
                ) {
                    let firstRow = [];
                    let totalRow = 0;
                    this.gridOptions.api.forEachNodeAfterFilterAndSort(
                        function (rowNode, index) {
                            if (index == 0) {
                                firstRow = rowNode.data;
                            }
                            totalRow += 1;
                        }
                    );

                    let row = { ...firstRow };
                    for (let key in firstRow) {
                        firstRow[key] = '';
                    }
                    this.gridOptions.api.applyTransaction({
                        add: [row],
                        addIndex: totalRow + 1,
                        update: [firstRow]
                    });
                    // this.rowData[0] = firstRow;
                    // this.rowData.push(row);
                }
            }
        }
    },

    components: {
        AgGridVue
    }
};
</script>

<style scoped></style>

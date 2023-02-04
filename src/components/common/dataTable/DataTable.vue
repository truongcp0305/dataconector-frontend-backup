<template>
    <div>
        <v-text-field
            v-if="showSearchBox"
            v-model="searchKey"
            single-line
            append-icon="mdi-magnify"
            solo
            class="sym-small-size border-all mb-2"
            :placeholder="$t('v2.showlist.search')"
            flat
        />
        <AgGridVue
            :style="{
                width: '100%',
                height: tableHeight
            }"
            class="ag-theme-balham"
            :gridOptions="gridOptions"
            :rowData="rowData"
            :columnDefs="columns"
            :suppressRowClickSelection="true"
            @cell-key-down="handleCellKeyDown"
            @cell-focused="handleCellFocused"
            @cell-context-menu="handleContextMenu"
            @cell-value-changed="handleCellValueChange"
        />
    </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue';
import 'ag-grid-enterprise';
export default {
    components: {
        AgGridVue
    },
    props: {
        addNewRowByChangeBottomRow: {
            default: true
        },
        tableHeight: {
            type: String,
            default: 'calc(100% - 40px)'
        },
        showSearchBox: {
            default: true
        },
        columns: {
            default() {
                return [];
            }
        },
        rowData: {
            default() {
                return [];
            }
        }
    },
    computed: {
        tableData() {
            let self = this;
            this.manualCheckSelected = false;
            if (this.searchKey == '') {
                return this.columns;
            } else {
                let arr = [];
                let searchKey = self.searchKey.toLowerCase();
                this.columns.forEach(function (e) {
                    if (
                        e.name.toLowerCase().includes(searchKey) ||
                        e.type.toLowerCase().includes(searchKey) ||
                        e.title.toLowerCase().includes(searchKey)
                    ) {
                        arr.push(e);
                    }
                });
                return arr;
            }
        }
    },
    data() {
        let self = this;
        return {
            searchKey: '',
            gridOptions: {
                enableRangeSelection: true,
                rowSelection: 'multiple',
                defaultColDef: {
                    editable: true,
                    resizable: true
                },
                getContextMenuItems(params) {
                    return [
                        {
                            name: this.$t(
                                'v2.showlist.deleteSelectedLine'
                            ),
                            action: function () {
                                let deletedRows = [];
                                params.api.getSelectedNodes().map((el) => {
                                    for (
                                        let i = 0;
                                        i < self.rowData.length;
                                        i++
                                    ) {
                                        if (self.rowData[i] === el.data) {
                                            self.rowData.splice(i, 1);
                                        }
                                    }
                                    deletedRows.push(el.data);
                                });
                                setTimeout(() => {
                                    self.gridOptions.api.setFocusedCell(
                                        0,
                                        self.columns[0].field
                                    );
                                }, 200);
                            }
                        }
                    ];
                }
            }
        };
    },
    methods: {
        handleCellValueChange(params) {
            this.gridOptions.api.redrawRows({ rowNodes: [params.node] });
            this.gridOptions.api.setFocusedCell(
                params.rowIndex,
                params.colDef.field
            );
            if (this.addNewRowByChangeBottomRow) {
                if (params.node.lastChild) {
                    this.rowData.push({});
                }
            }
        },
        handleContextMenu(params) {
            params.node.setSelected(true);
        },
        handleCellFocused(data) {
            this.focusingCell = {
                row: data.rowIndex,
                col: data.column.colId
            };
        },
        handleCellKeyDown(params) {
            let event = params.event;
            if (
                event.key == 'Enter' &&
                event.shiftKey &&
                params.rowIndex == 0
            ) {
                let firstRow = [];
                this.gridOptions.api.forEachNodeAfterFilterAndSort(function (
                    rowNode,
                    index
                ) {
                    if (index == 0) {
                        firstRow = rowNode.data;
                    }
                });

                let newRow = { ...firstRow };

                let self = this;
                setTimeout(() => {
                    self.gridOptions.api.setFocusedCell(
                        self.focusingCell.row,
                        self.focusingCell.col
                    );
                    for (let key in self.columns[0]) {
                        self.columns[0][key] = '';
                    }

                    for (let key in firstRow) {
                        firstRow[key] = '';
                    }

                    self.gridOptions.api.applyTransaction({
                        update: [firstRow]
                    });
                }, 200);
                this.columns.push(newRow);
            }
        },
        addNewRow() {}
    }
};
</script>

<style></style>

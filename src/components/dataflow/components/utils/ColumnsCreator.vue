<template>
    <div>
        <v-text-field
            v-model="searchKey"
            single-line
            append-icon="mdi-magnify"
            solo
            class="sym-small-size border-all mb-2"
            :placeholder="$t('v2.dataflow.search')"
            flat
            @input="onQuickFilterChanged()"
        />
        <AgGridVue
            class="ag-theme-balham h-100"
            :gridOptions="gridOptions"
            :rowData="columns"
            :columnDefs="customDataColDefs"
            :suppressRowClickSelection="true"
            @cell-key-down="handleCellKeyDown"
            @cell-focused="handleCellFocused"
            @cell-context-menu="handleContextMenu"
        />
    </div>
</template>

<script>
import NodeLoadCustomDataRowRender from '@/components/dataflow/configPool/NodeLoadCustomDataRowRender.js';
import { AgGridVue } from 'ag-grid-vue';

export default {
    components: {
        AgGridVue,
    },
    props: {
        columns: {
            default() {
                return [];
            },
        },
    },
    computed: {},
    data() {
        let self = this;
        return {
            searchKey: '',
            gridOptions: {
                enableRangeSelection: true,
                rowSelection: 'multiple',
                defaultColDef: {
                    editable: true,
                    cellRenderer: NodeLoadCustomDataRowRender,
                },
                enableRangeSelection: true,
                getContextMenuItems(params) {
                    return [
                        {
                            name: this.$t('v2.dataflow.deleteRowChose'),
                            // shortcut: "Shift + Enter",
                            action: function () {
                                const selectedRows =
                                    params.api.getSelectedRows();
                                let needDeleteName = selectedRows.reduce(
                                    (map, el) => {
                                        map[el.name] = el;
                                        return map;
                                    },
                                    {},
                                );

                                let deletedRows = 0;
                                for (let i = 0; i < self.columns.length; i++) {
                                    if (
                                        i &&
                                        needDeleteName[self.columns[i].name]
                                    ) {
                                        self.columns.splice(i, 1);
                                        i = 0;
                                        deletedRows += 1;
                                    }
                                }

                                setTimeout(() => {
                                    self.gridOptions.api.setFocusedCell(
                                        0,
                                        'name',
                                    );
                                }, 400);
                            },
                            // cssClasses: ['blueFont'],
                            // icon:'mdi-table-row-plus-after'
                        },
                    ];
                },
            },
            customDataColDefs: [
                {
                    checkboxSelection: true,
                    editable: false,
                    field: 'selected',
                    headerName: '',
                    width: 50,
                    headerCheckboxSelection: function isFirstColumn(params) {
                        return true;
                    },
                },
                {
                    headerName: this.$t('v2.dataflow.name'),
                    field: 'name',
                    editable: true,
                    width: 100,
                },
                {
                    headerName: this.$t('v2.dataflow.title'),
                    field: 'title',
                    editable: true,
                    width: 150,
                },
                {
                    headerName: this.$t('v2.dataflow.dataType'),
                    field: 'type',
                    editable: true,
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorPopup: true,
                    keyCreator: (params) => {
                        return params.value.name;
                    },
                    cellEditorParams: {
                        values: ['Text', 'Number', 'Date', 'Date time'],
                    },
                    width: 100,
                },
            ],
        };
    },
    methods: {
        onQuickFilterChanged() {
            this.gridOptions.api.setQuickFilter(this.searchKey);
        },
        handleContextMenu(params) {
            params.node.setSelected(true);
        },
        handleCellFocused(data) {
            this.focusingCell = {
                row: data.rowIndex,
                col: data.column.colId,
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
                    index,
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
                        self.focusingCell.col,
                    );
                    for (let key in self.columns[0]) {
                        self.columns[0][key] = '';
                    }

                    for (let key in firstRow) {
                        firstRow[key] = '';
                    }

                    self.gridOptions.api.applyTransaction({
                        update: [firstRow],
                    });
                }, 200);
                this.columns.push(newRow);
            }
        },
        addNewRow() {},
    },
};
</script>

<style></style>

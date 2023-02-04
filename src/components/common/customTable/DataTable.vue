<template>
    <div>
        <ag-grid-vue
            class="
                ag-theme-balham
                agrid-table
                ag-list-items-table
                h-100
                w-100
                mb-3
            "
            id="sym-agrid-table"
            :columnDefs="columnDefs"
            @cell-value-changed="onCellValueChanged"
            @cell-key-down="onCellKeyDown"
            :defaultColDef="defaultColDef"
            @rowClicked="handlerRowClicked"
            :gridOptions="gridOptions"
            @row-drag-end="onRowDragEnd"
            :rowData="rowData"
        >
        </ag-grid-vue>

        <AutocompleteInput
            :usePositionBox="true"
            :customPosition="dragPanel"
            ref="autocompleteInput"
            @after-select-row="afterSelectRow"
        />
    </div>
</template>
<script>
import AutocompleteInput from './../../../views/document/submit/items/AutocompleteInput.vue';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import { AgGridVue } from 'ag-grid-vue';
import _isEmpty from 'lodash/isEmpty';
export default {
    components: {
        'ag-grid-vue': AgGridVue,
        AutocompleteInput
    },
    data() {
        return {
            dragPanel: {
                width: 300,
                top: 400,
                left: 0
            },
            dataFilter: [],
            defaultColDef: {
                sortable: true,
                resizable: true,
                autoHeight: true,
                filter: true
            }
        };
    },
    props: {
        columnDrag: {
            type: String,
            default: ''
        },
        autoHeight: {
            type: Boolean,
            default: true
        },
        rowData: {
            type: Array,
            default() {
                return [];
            }
        },
        columnDefs: {
            type: Array,
            default() {
                return [];
            }
        },
        positionBox: {
            type: Object,
            default() {
                return {};
            }
        },
        lists: {
            type: Object,
            default() {
                return {};
            }
        },
        gridOptions: {
            type: Object,
            default() {
                return {
                    containerHeight: 450,
                    suppressRowClickSelection: true,
                    headerHeight: 25,
                    rowHeight: 25,
                    enableRangeSelection: true,
                    enableRangeHandle: true,
                    suppressClipboardPaste: true,
                    applyColumnDefOrder: true,
                    animateRows: true,
                    rowDragManaged: true,
                    enableMultiRowDragging: true
                };
            }
        },
        controlValueKey: {
            // tên cột hiển thị ở autocomplete
            type: String,
            default: ''
        }
    },
    created() {
        if (this.autoHeight) {
            this.gridOptions.domLayout = 'autoHeight';
        }
    },
    mounted() {
        const self = this;
        this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
            if (!$(evt.target).hasClass('ag-cell')) {
                // trường hợp click ngoài
                if (self.$refs.autocompleteInput)
                    self.$refs.autocompleteInput.hide();
                try {
                    if (self.gridOptions.api) {
                        self.gridOptions.api.clearRangeSelection();
                        self.gridOptions.api.stopEditing(true);
                    }
                } catch (error) {}
            } else {
                // trường hợp click cell khác
                if (this.gridOptions && this.gridOptions.api) {
                    let currentCell = this.gridOptions.api.getFocusedCell();
                    if (
                        currentCell.column.colDef.field != self.controlValueKey
                    ) {
                        if (self.$refs.autocompleteInput)
                            self.$refs.autocompleteInput.hide();
                    }
                }
            }
        });
    },

    methods: {
        setValueCellTable(value, col) {
            let rowIndex = this.gridOptions.api.getFocusedCell().rowIndex;
            let rowModel = this.gridOptions.api.getModel();
            let rowNode = rowModel.rowsToDisplay[rowIndex];
            rowNode.setDataValue(col, value);
        },
        handlerRowClicked(params) {
            this.$emit('row-click', this.name);
        },
        onRowDragEnd(evt) {
            let data = {
                data: this.getAllData()
            };
            if (this.columnDrag) {
                let startRow = this.gridOptions.api.getRowNode(
                    evt.node.rowIndex
                );
                let endRow = this.gridOptions.api.getRowNode(
                    evt.overNode.rowIndex
                );
                let starRowValue = startRow.data[this.columnDrag];
                let endRowValue = endRow.data[this.columnDrag];
                startRow.setDataValue(this.columnDrag, endRowValue);
                endRow.setDataValue(this.columnDrag, starRowValue);
                data.startRow = startRow.rowIndex;
                data.endRow = endRow.rowIndex;
            }
            this.$emit('row-drag-end', data);
        },
        afterSelectRow(value) {
            let currentCell = this.gridOptions.api.getFocusedCell();
            let id = value.value.inputValue;
            let name = value.value.inputDislay;

            if (id) {
                let rowIndex = currentCell.rowIndex;
                let rowModel = this.gridOptions.api.getModel();
                let rowNode = rowModel.rowsToDisplay[rowIndex];
                rowNode.setDataValue(this.controlValueKey, name);
                rowNode.setDataValue(this.controlValueKey + 'Id', id);
                this.gridOptions.api.stopEditing(true);
                this.gridOptions.api.setFocusedCell(
                    rowIndex,
                    currentCell.column.colDef.field
                );
            }
            let rowData = this.getAllData();
            this.$emit('change', rowData);
        },
        getAllData() {
            let rowData = [];
            this.gridOptions.api.forEachNode((node) => {
                let data = node.data;
                rowData.push(Object.assign({}, node.data));
            });
            return rowData;
        },
        setListAutocomplete(data) {
            let colDef = data.colDef.field;
            let event = data.event;
            let searchValue = event.target.value;
            if (event.shiftKey || event.code == 'Enter') {
                return;
            }
            let list = {
                dataBody: [],
                headers: [
                    { text: colDef, value: colDef },
                    { text: 'id', value: 'id' }
                ]
            };
            if (this.lists[colDef]) {
                this.lists[colDef].map((l) => {
                    if (
                        searchValue &&
                        l.name.toLowerCase().includes(searchValue.toLowerCase())
                    ) {
                        let col = {};
                        col[colDef] = l.name;
                        col['id'] = l.id;
                        list.dataBody.push(col);
                    }
                });
            }
            if (this.$refs.autocompleteInput) {
                if (_isEmpty(this.positionBox)) {
                    let $target = $(data.event.target);
                    this.dragPanel.width = $target.width();
                    this.dragPanel.left = $target.offset().left - 50 + 'px';
                    this.dragPanel.top = $target.offset().top - 50 + 'px';
                } else {
                    this.dragPanel.width =
                        this.positionBox.width + 'px!important';
                    this.dragPanel.left = this.positionBox.left + 'px';
                    this.dragPanel.top =
                        this.positionBox.top + 25 * data.node.rowIndex + 'px';
                }

                this.$refs.autocompleteInput.show(event, colDef);
                this.$refs.autocompleteInput.setCurrentInput(event);
                this.$refs.autocompleteInput.setEvent();
                this.$refs.autocompleteInput.setTypeInput('autocomplete');
                this.$refs.autocompleteInput.setAliasControl(colDef);
                this.$refs.autocompleteInput.setControlValueKey('id');
                this.$refs.autocompleteInput.setData(list);
            }
        },
        onCellValueChanged() {
            let rowData = this.getAllData();
            this.$emit('change', rowData);
        },
        onCellKeyDown(params) {
            if (params.event.key == 'Enter' && params.event.shiftKey) {
                let rowIdx = params.rowIndex + 1;
                let row = {};
                Object.keys(params.data).map((data) => {
                    row[data] = '';
                });

                this.gridOptions.api.applyTransaction({
                    add: [row],
                    addIndex: rowIdx
                });
                this.rowData.push(row);
            }
            if (params.colDef.field == this.controlValueKey) {
                this.setListAutocomplete(params);
            }
        }
    }
};
</script>
<style scoped>
.ag-theme-balham >>> .ag-center-cols-clipper {
    height: 30px;
    min-height: 30px;
}
</style>
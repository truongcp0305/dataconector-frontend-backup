<template>
    <div
        :style="{ height: extraInfo.height + 'px' }"
        ref="unionBuilderWrapper"
        class="union-builder-component"
    >
        <ag-grid-vue
            :style="{
                width: '100%',
                height: height - 5 + 'px'
            }"
            class="ag-theme-balham"
            :gridOptions="gridOptions"
            :columnDefs="getColumnDefs"
            :rowDragManaged="rowDragManaged"
            :rowData="getRowData"
            :suppressRowClickSelection="true"
            :defaultColDef="defaultColDef"
            :stopEditingWhenGridLosesFocus="true"
            :components="agComponents"
            :icons="icons"
            :suppressScrollOnNewData="true"
            :animateRows="true"
            :class="{ 'ag-theme-balham': true }"
            @row-drag-enter="onRowDragEnter"
            @row-drag-move="onRowDragMove"
            @body-scroll="handleScrollTable"
            @cell-focused="handleCellFocus"
            @cell-key-press="onCellKeyPress"
            @cell-double-clicked="onDoubleCell"
            @row-drag-end="onRowDragEnd"
        >
        </ag-grid-vue>
    </div>
</template>
<script>
import { AgGridVue } from 'ag-grid-vue';
import _cloneDeep from 'lodash/cloneDeep';
import { DATATYPE_ICONS } from '@/components/dataflow/configPool/dataflowConfig.js';

function cellRenderer(params) {
    let col = params.data[params.colDef.field.replace('dataset', 'col')];
    if (!col.columnName) {
        return '';
    }
    return (
        `
        <i title="` +
        col.type +
        `" class=" pr-1 mdi ` +
        DATATYPE_ICONS[col.type] +
        `"></i>
        <span title="` +
        col.columnName +
        `">` +
        params.value +
        `</span>`
    );
}

export default {
    components: {
        'ag-grid-vue': AgGridVue
    },
    computed: {
        getColumnDefs() {
            let cols = [];
            if (this.nodeData.configs.tableConfig.length > 0) {
                cols = Object.keys(this.nodeData.configs.tableConfig[0]);
            }
            let checkListKeys = Object.keys(this.nodeData.validateChecklist);

            checkListKeys.forEach((key) => {
                this.nodeData.validateChecklist[key].title.includes(
                    'v2.dataflow.'
                )
                    ? (this.nodeData.validateChecklist[key].title = this.$t(
                          this.nodeData.validateChecklist[key].title
                      ))
                    : '';
            });
            let rsl = [
                {
                    field: 'columnNumber',
                    width: 70,
                    rowDrag: true,
                    cellClass: 'column-number-def',
                    icons: {
                        rowDrag: '<i class="mdi move-icon mdi-arrow-up-down"/>'
                    }
                }
            ];
            cols.forEach((element) => {
                if (element.includes('dataset')) {
                    rsl.push({
                        field: element,
                        headerName: element.replace('dataset', 'Input #'),
                        rowDrag: true,
                        width: 150,
                        cellRenderer: cellRenderer
                    });
                }
            });
            return rsl;
        },
        getRowData() {
            let rsl = [];
            this.nodeData.configs.tableConfig.forEach((element, idx) => {
                let newRow = _cloneDeep(element);
                newRow.columnNumber = idx + 1;
                rsl.push(newRow);
            });
            return rsl;
        }
    },
    props: {
        configs: {
            default() {
                let rsl = [];
                return rsl;
            }
        },
        nodeData: {
            default() {
                return {};
            }
        },
        height: {
            default: 200
        },
        extraInfo: {
            default() {
                return {
                    height: 300
                };
            }
        }
    },
    beforeMount() {
        this.columnDefs = [];
        this.gridOptions = {
            getRowStyle: (params) => {
                if (params.data.invalid) {
                    return { background: '#ff9393' };
                }
            }
        };
    },
    mounted() {
        this.gridApi = this.gridOptions.api;
        this.gridColumnApi = this.gridOptions.columnApi;
        this.agContainer = $(this.$refs.unionBuilderWrapper).find(
            '.ag-center-cols-container'
        );
    },
    methods: {
        getColumnIcon(type) {
            return (
                this.__dataIcon.iconPrefix +
                this.__dataIcon.columnTypeIcon[type]
            );
        },
        showInvalidRow(rows, showNotify = true) {
            this.invalidRowsInfo = rows;
            this.agContainer.find('.ag-row').removeClass('union-invalid-row');
            if (this.checkInvalidRows(rows)) {
                setTimeout(
                    (rows, thisCpn, showNotify) => {
                        for (let id of rows) {
                            thisCpn.agContainer
                                .find('.ag-row[row-id=' + id + ']')
                                .addClass('union-invalid-row');
                        }
                        if (showNotify) {
                            thisCpn.$notify({
                                title: thisCpn.$t(
                                    'v2.dataflow.youNeedReorderCellsInRedRows'
                                ),
                                message: thisCpn.$t(
                                    'v2.dataflow.notMatchDatatypeColumns'
                                ),
                                type: 'warning',
                                duration: 5000
                            });
                        }
                    },
                    100,
                    rows,
                    this,
                    showNotify
                );
            }
        },
        checkInvalidRows(rows) {
            return $.isArray(rows) && rows.length > 0;
        },
        handleScrollTable() {
            if (this.checkInvalidRows(this.invalidRowsInfo)) {
                if (this.invalidRowsDebounce) {
                    clearTimeout(this.invalidRowsDebounce);
                }
                this.invalidRowsDebounce = setTimeout(
                    (thisCpn) => {
                        thisCpn.showInvalidRow(thisCpn.invalidRowsInfo, false);
                    },
                    100,
                    this
                );
            }
        },
        onRowDragEnter(evt) {
            let cell = this.gridApi.getFocusedCell();
            this.dragColumnName = cell.column.colDef.field;
            this.dragColumnId = cell.column.colId;
            this.swapRowInfo.currentIdx = cell.rowIndex;
            this.swapCellBySelect.currentRowIdx = cell.rowIndex;
        },
        onRowDragMove(evt) {
            if (this.swapCellBySelect.columnName == 'columnNumber') {
                return;
            }
            let prevRow = this.prevRow ? this.prevRow : -1;
            let row = null;
            if (this.prevRow > 0) {
                row = this.agContainer.find('.ag-row[row-id=' + prevRow + ']');
                row.find(
                    '.ag-cell[col-id=' + this.dragColumnId + ']'
                ).removeClass('will-drop-cell');
            }
            this.prevRow = evt.overNode.rowIndex;
            row = this.agContainer.find('.ag-row[row-id=' + this.prevRow + ']');
            row.find('.ag-cell[col-id=' + this.dragColumnId + ']').addClass(
                'will-drop-cell'
            );
        },
        onRowDragEnd(evt) {
            this.agContainer
                .find('.ag-row[row-id=' + this.prevRow + ']')
                .find('.ag-cell[col-id=' + this.dragColumnId + ']')
                .removeClass('will-drop-cell');
            this.agContainer
                .find('.ag-row[row-id=' + evt.node.rowIndex + ']')
                .find('.ag-cell[col-id=' + this.dragColumnId + ']')
                .removeClass('will-drop-cell');
            if (this.dragColumnName == 'columnNumber') {
                this.reOrderConfigsRows(evt.node.rowIndex);
                return;
            }
            this.swapTwoFactor(
                evt.node.rowIndex,
                evt.overNode.rowIndex,
                this.dragColumnName
            );
        },
        reOrderConfigsRows(endRow) {
            let startRow = this.swapRowInfo.currentIdx;
            if (startRow == endRow) {
                return;
            }
            let newOrder = [];
            let rows = this.nodeData.configs.tableConfig;
            let i = 0;
            let startPoint = startRow < endRow ? startRow : endRow;
            let endPoint = startRow > endRow ? startRow : endRow;

            for (i = 0; i < startPoint; i++) {
                newOrder.push(rows[i]);
            }

            if (startRow < endRow) {
                for (i = startRow + 1; i <= endRow; i++) {
                    newOrder.push(rows[i]);
                }
                newOrder.push(rows[startRow]);
            } else {
                newOrder.push(rows[startRow]);
                for (i = endRow; i < startRow; i++) {
                    newOrder.push(rows[i]);
                }
            }
            for (i = endPoint + 1; i < rows.length; i++) {
                newOrder.push(rows[i]);
            }
            this.$emit('reset-configs-order', newOrder);
        },
        swapTwoFactor(startRow, endRow, colName, emit = true) {
            startRow = this.gridApi.getRowNode(startRow);
            endRow = this.gridApi.getRowNode(endRow);

            this.swapValueTwoCells(startRow, endRow, colName);
            this.swapValueTwoCells(
                startRow,
                endRow,
                colName.replace('dataset', 'col')
            );
            if (emit) {
                this.$emit('change-configs', { from: 'swap-union-cell' });
            }
        },
        swapValueTwoCells(startRow, endRow, colName) {
            //swap value beetwen two cell - value visible
            let startValue = startRow.data[colName];
            let endValue = endRow.data[colName];

            startRow.data[colName] = endValue;
            endRow.data[colName] = startValue;

            startRow.setData(startRow.data);
            endRow.setData(endRow.data);

            // startRow.setData(colName,endValue);
            // endRow.setData(colName,startValue);

            this.nodeData.configs.tableConfig[startRow.rowIndex][colName] =
                endValue;
            this.nodeData.configs.tableConfig[endRow.rowIndex][colName] =
                startValue;
        },
        marCellWillDrop() {},
        onCellKeyPress(e) {
            if (e.event.key.toLowerCase() == 'enter') {
                this.swapCellBySelect.currentRowIdx = e.rowIndex;
                this.setColumnSelection(e.colDef.field, e.event.target);
            }
        },
        onDoubleCell(e) {
            this.swapCellBySelect.currentRowIdx = e.rowIndex;
            let ele = $(e.event.target);
            ele = ele.hasClass('.ag-cell') ? ele : ele.parents('.ag-cell');

            this.setColumnSelection(e.colDef.field, ele[0]);
        },
        setColumnSelection(colName, ele) {
            let colOrderName = colName.replace('dataset', 'col');
            let columnSelect = this.$refs.columnSelect;
            this.classifyCell(colOrderName);
            ele = $(ele);
            this.swapCellBySelect.cellDom = ele;
            let selectEle = $(columnSelect.$el);

            selectEle.css('left', ele.css('left')).width(ele.outerWidth());
            ele.after(selectEle[0]);
            this.swapCellBySelect.showSelect = true;
            setTimeout(() => {
                columnSelect.focus();
            }, 300);
        },
        handleCellFocus(info) {
            let rowIndex = info.rowIndex;
            this.swapCellBySelect.showSelect = false;
            this.swapCellBySelect.tmpSelectValue = '';

            if (info.column) {
                let colKey = info.column.colDef.field;
                this.swapCellBySelect.columnName = colKey.replace(
                    'dataset',
                    'col'
                );

                if (colKey == 'columnNumber') {
                    this.rowDragManaged = true;
                } else {
                    this.rowDragManaged = false;
                }
            }
        },
        filterRows(vl = '') {
            this.classifyCell(this.swapCellBySelect.columnName, vl);
        },
        handleChangeSelectValue(newVl) {
            this.swapTwoFactor(
                this.swapCellBySelect.currentRowIdx,
                newVl,
                this.swapCellBySelect.columnName.replace('col', 'dataset')
            );
            this.swapCellBySelect.showSelect = false;
        },
        classifyCell(colOrderName, searchText = false) {
            let datasetCol = colOrderName.replace('col', 'dataset');
            this.swapCellBySelect.matches = [];
            this.swapCellBySelect.mismatches = [];

            for (let idx in this.nodeData.configs.tableConfig) {
                let row = this.nodeData.configs.tableConfig[idx];
                if (!_.isEmpty(row[colOrderName])) {
                    let isMatched = false;
                    for (let name in row) {
                        if (
                            datasetCol != name &&
                            name.includes('dataset') &&
                            row[name]
                        ) {
                            isMatched = true;
                            break;
                        }
                    }

                    row[colOrderName].index = idx;
                    let category = isMatched ? 'matches' : 'mismatches';

                    if (searchText) {
                        let tmpTxt = row[colOrderName].columnName;
                        row[colOrderName].columnName = tmpTxt ? tmpTxt : '';

                        tmpTxt = row[colOrderName].title;
                        row[colOrderName].title = tmpTxt ? tmpTxt : '';

                        if (
                            row[colOrderName].columnName
                                .toLowerCase()
                                .includes(searchText) ||
                            row[colOrderName].title
                                .toLowerCase()
                                .includes(searchText)
                        ) {
                            this.swapCellBySelect[category].push(
                                row[colOrderName]
                            );
                        }
                    } else {
                        this.swapCellBySelect[category].push(row[colOrderName]);
                    }
                }
            }
        }
    },
    data() {
        return {
            agComponents: {
                cellRenderer: cellRenderer
            },
            rowDragManaged: false,
            swapCellBySelect: {
                showSelect: false,
                mismatches: [],
                matches: [], // những cell mà dòng chứa cell đó có ít nhất 2 ô không trống,
                cellDom: false,
                currentRowIdx: -1,
                tmpSelectValue: '',
                columnName: '' // tên cột đang được focus : col1
            },
            swapRowInfo: {
                currentIdx: -1
            },
            gridOptions: null,
            icons: {
                rowDrag: '<i class="mdi move-icon mdi-drag-variant"/>'
            },
            gridApi: null,
            columnApi: null,
            columnDefs: null,
            defaultColDef: {
                resizable: true
            },
            searchColumns: ''
        };
    }
};
</script>
<style>
.union-invalid-row {
    background-color: #ffa0a0 !important;
}
.union-builder-component div.column-number-def .move-icon:before {
    content: '\F0E79';
}
.union-builder-component .ag-cell .move-icon {
    font-size: 15px;
    visibility: hidden;
}
.union-builder-component .ag-cell:hover .move-icon {
    visibility: visible;
}
.union-builder-component .ag-cell:not(.column-number-def):hover {
    background-color: #f58634;
}

.union-builder-component .will-drop-cell {
    background-color: yellow !important;
}
</style>

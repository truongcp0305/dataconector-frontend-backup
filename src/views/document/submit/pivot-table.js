import { util } from '@/plugins/util.js';
import { Grid } from 'ag-grid-community';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';
import store from './../../../store';
import { getControlInstanceFromStore } from './../common/common';
import sDocument from './../../../store/document';

window.addNewDataPivotTable = function (el, event, type) {
    let tableName = $(el).attr('table-name');
    event.preventDefault();
    event.stopPropagation();
    let thisListItem = util.getClosestVueInstanceFromDom(el, 'submitDocument');
    thisListItem.$evtBus.$emit('on-add-data-to-pivot-table', {
        type: type,
        tableName: tableName,
    });
};
export default class PivotTable {
    constructor(control, tableName, controlId, pivotConfig, keyInstance) {
        this.controlObj = control;
        this.tableName = tableName;
        this.tableControlId = controlId;
        this.instance = keyInstance;
        this.gridOptions = null;
        this.pivotConfig = pivotConfig;
        this.tableContainer = null;
        this.tableHeight = '400px';
        this.columnDefs = [];
    }
    /**
     * hoangnd
     * Hàm đọc thông tin pivot đã lưu để tạo cấu trúc các cột pivot (bao gồm header và các cột group)
     */
    setPivotColumns() {
        let rows = this.pivotConfig.rows;
        let cols = this.pivotConfig.cols;
        let values = this.pivotConfig.values;
        for (let index = 0; index < cols.length; index++) {
            let colItem = cols[index];
            let colPivot = {
                headerName: colItem.title,
                field: colItem.name,
                otherPivotName: colItem.name,
                pivot: true,
                enablePivot: true,
            };
            this.columnDefs.push(colPivot);
        }

        for (let index = 0; index < rows.length; index++) {
            let colItem = rows[index];
            let colPivot = {
                field: colItem.name,
                headerName: colItem.title,
                rowGroup: true,
                enableRowGroup: true,
                cellRendererParams: {
                    suppressCount: true, // turn off the row count
                },
            };
            this.columnDefs.push(colPivot);
        }
        for (let index = 0; index < values.length; index++) {
            let colItem = values[index];
            let colPivot = {
                headerName: colItem.title,
                otherName: colItem.name,
                field: colItem.name,
                aggFunc: this.customPivotFunc,
            };
            this.columnDefs.push(colPivot);
        }
    }
    /**
     * Hàm lấy thông tin các cột và đong được pivot
     */
    getDataGroup() {
        let allRowGroup = this.gridOptions.columnApi.getRowGroupColumns();
        let allPivotCol = this.gridOptions.columnApi.getPivotColumns();
        let rowGroup = [];
        let colPivotData = [];

        if (allRowGroup.length > 0) {
            rowGroup.push(allRowGroup[0].colDef.field);
        }
        if (allRowGroup.length > 0) {
            colPivotData.push(allPivotCol[0].colDef.field);
        }
        return { cols: colPivotData, rows: rowGroup };
    }
    /**
     * Hoangnd
     * Hàm xử lí data cho bảng
     * @param {} vl
     */
    setData(vl) {
        this.columnDefs = [];
        this.setPivotColumns();
        this.gridOptions.api.setColumnDefs(this.columnDefs);
        this.gridOptions.api.setRowData(vl);
        let viewType = sDocument.state.viewType[this.instance];
        if (viewType == 'print') {
            this.gridOptions.api.setDomLayout('print');
            // this.tableContainer.style.width = '';
            // this.tableContainer.style.height = '';
        }
        this.caculatorHeight();
    }
    /**
     * Hoangnd:
     * Hàm tính toán chiều cao cho table
     */
    caculatorHeight() {
        let dataHeight = this.gridOptions.api.getDisplayedRowCount() * 24;
        let headerHeight = 0;
        if (this.pivotConfig.cols.length > 0) {
            headerHeight += 24;
        }
        if (this.pivotConfig.values.length > 0) {
            headerHeight += 24;
        }
        let tableHeight = dataHeight + headerHeight + 3;
        if (tableHeight > 500) {
            tableHeight = 500;
        }
        $('#ag-' + this.controlObj.id).css({ height: tableHeight + 'px' });
    }
    render() {
        this.gridOptions = {
            columnDefs: this.columnDefs,
            pivotHeaderHeight: 24,
            pivotGroupHeaderHeight: 24,
            animateRows: true,
            rowHeight: 24,
            groupDefaultExpanded: -1,
            rowData: [],
            autoGroupColumnDef: {
                cellRendererParams: {
                    suppressCount: true,
                },
            },
            pivotMode: true,
            defaultColDef: {
                flex: 1,
                sortable: true,
                resizable: true,
                wrapText: true,
                autoHeight: true,
            },
            // groupMultiAutoColumn: true,
            sideBar: false,
            suppressAggFuncInHeader: true,
            onCellDoubleClicked: this.onCellDoubleClick,
            onCellKeyDown: this.onCellDoubleClick,
            tableIns: this,
        };
        let viewType = sDocument.state.viewType[this.instance];
        let actionBtn =
            ` <div class="dropdown">
                            <button class="ag-pivot-action"><span class="mdi mdi-plus"></span></button>
                            <div class="dropdown-content">
                                <a onclick="addNewDataPivotTable(this, event, 'rows')" table-name="` +
            this.tableName +
            `">${SYMPER_APP.$t('v2.doc.addRow')}</a>
                                <a onclick="addNewDataPivotTable(this, event, 'cols')" table-name="` +
            this.tableName +
            `">${SYMPER_APP.$t('v2.doc.addColumn')}</a>
                            </div>
                        </div>`;
        if (['detail', 'print'].includes(viewType)) {
            actionBtn = '';
        }
        this.tableContainer = $(
            `<div id="ag-` +
                this.controlObj.id +
                `" style="height: ` +
                this.tableHeight +
                `; width: auto;position:relative;" class="ag-theme-alpine" s-control-type="table">
                                    ` +
                actionBtn +
                `
                            </div>`,
        )[0];
        this.controlObj.ele.before(this.tableContainer);
        if (viewType == 'print') {
            this.controlObj.ele.parent().find('.wrap-s-control-table').remove();
        }
        new Grid(this.tableContainer, this.gridOptions, {
            modules: [ClientSideRowModelModule, RowGroupingModule],
        });
    }
    /**
     * double click vào cell thì edit cell đó
     * @param {} row
     */
    onCellDoubleClick(row) {
        if (row.type == 'cellKeyDown') {
            var charTyped = String.fromCharCode(row.event.which);
            if (!/[a-zA-Z0-9]/i.test(charTyped)) {
                return;
            }
            if (row.event.ctrlKey && row.event.code == 'KeyC') {
                let textArea = document.createElement('textarea');
                textArea.classList = 'hidden-textarea-for-copy';
                textArea.value = row.value;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return;
            }
        }
        let column = row.colDef;
        let columnNameSelected = column.otherName;
        let pivotKeys = column.pivotKeys;
        let controlName = '';
        if (row.node.level == 1) {
            let rowData = util.cloneDeep(
                row.node.childrenMapped[
                    Object.keys(row.node.childrenMapped)[0]
                ][0].data,
            );
            if (pivotKeys && row.node.childrenMapped[pivotKeys[0]]) {
                rowData = util.cloneDeep(
                    row.node.childrenMapped[pivotKeys[0]][0].data,
                );
            }
            if (columnNameSelected && pivotKeys) {
                let cols = this.tableIns.pivotConfig.cols;
                controlName = columnNameSelected;
                let key = cols[0].name;
                if (rowData[key] != pivotKeys[0]) {
                    //tao dong moi
                    rowData[key] = pivotKeys[0];
                    let rows = this.tableIns.pivotConfig.rows;
                    let newRowData = {};
                    newRowData[key] = pivotKeys[0];

                    for (let index = 0; index < rows.length; index++) {
                        let row = rows[index];
                        let colName = row['name'];
                        newRowData[colName] = rowData[colName];
                    }
                    rowData = newRowData;
                }
            } else {
                let rows = this.tableIns.pivotConfig.rows;
                controlName = rows[1].name;
            }
            store.commit('document/addToDocumentSubmitStore', {
                key: 'currentRowChangePivotMode',
                value: {
                    key: controlName,
                    value: rowData,
                    tableName: this.tableIns.tableName,
                },
                instance: this.tableIns.instance,
            });
        }
        if (
            (row.node.level == 0 && !column.otherName) ||
            (row.node.level == 0 && this.tableIns.pivotConfig.rows.length == 1)
        ) {
            // trường hợp sửa ở cell group hoặc chỉ có 1 dòng được group
            row.node.setExpanded(true);
            let allChildRowNode = row.node.childrenMapped;
            let allGroupRow = [];
            if (columnNameSelected && pivotKeys) {
                controlName = columnNameSelected;
                if (allChildRowNode[pivotKeys[0]]) {
                    allGroupRow.push(allChildRowNode[pivotKeys[0]][0]['data']);
                } else {
                    let newRowData = {};
                    let rowDefinition = row.node.field;
                    let colPivotDefinition =
                        this.tableIns.pivotConfig.cols[0].name;
                    newRowData[colPivotDefinition] = pivotKeys[0];
                    newRowData[rowDefinition] = row.node.key;
                    allGroupRow.push(newRowData);
                }
            } else {
                controlName = row.node.field;
                for (let key in allChildRowNode) {
                    let rowNode = allChildRowNode[key];
                    if (this.tableIns.pivotConfig.rows.length == 1) {
                        let childRow = rowNode[0].data;
                        allGroupRow.push(childRow);
                    } else {
                        for (let colPivot in rowNode.childrenMapped) {
                            let childRow =
                                rowNode.childrenMapped[colPivot][0].data;
                            allGroupRow.push(childRow);
                        }
                    }
                }
            }
            store.commit('document/addToDocumentSubmitStore', {
                key: 'currentRowChangePivotMode',
                value: {
                    key: controlName,
                    value: allGroupRow,
                    tableName: this.tableIns.tableName,
                    type: 'group',
                },
                instance: this.tableIns.instance,
            });
        }
        let controlIns = getControlInstanceFromStore(
            this.tableIns.instance,
            controlName,
        );
        if (controlIns && controlIns.checkProps('isReadOnly')) {
            return;
        }
        if (
            row.node.level > 0 ||
            (row.node.level == 0 && !column.otherName) ||
            (row.node.level == 0 && this.tableIns.pivotConfig.rows.length == 1)
        ) {
            let cellEl = $(row.event.target).closest('.ag-cell');
            let offset = cellEl.offset();
            let curCellValue = cellEl.text();
            curCellValue = curCellValue.replace(/\(\d\)$/g, '');
            $('.input-pivot').val(curCellValue.trim());
            $('.input-pivot')
                .css({
                    display: 'block',
                    top: offset.top,
                    left: offset.left,
                    width: cellEl.outerWidth(),
                    height: cellEl.outerHeight(),
                })
                .focus();
        }
    }
    /**
     * hoangnd
     * hàm set giá trị cho các cột được đưa vào values của pivot
     * @param {} values
     */
    customPivotFunc(values) {
        var v = 0;
        values.forEach(function (value) {
            if (!value) {
                value = 0;
            }
            v += Number(value);
        });
        if (v == 0) {
            v = '';
        }
        return v;
    }
    show() {
        this.tableContainer.style.maxHeight = 'unset';
        this.tableContainer.style.opacity = '1';
    }
    hide() {
        this.tableContainer.style.opacity = '0';
        this.tableContainer.style.maxHeight = '0';
    }
}

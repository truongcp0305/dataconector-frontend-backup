import { util } from '@/plugins/util.js';
import { Grid } from 'ag-grid-community';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';
import { getControlInstanceFromStore } from './../common/common';
import sDocument from '@/store/document';

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
export default class GroupTable {
    constructor(control, tableName, controlId, groupConfig, keyInstance) {
        this.controlObj = control;
        this.tableName = tableName;
        this.tableControlId = controlId;
        this.instance = keyInstance;
        this.gridOptions = null;
        this.groupConfig = groupConfig;
        this.rows = this.groupConfig.rows;
        this.cols = this.groupConfig.cols;
        this.values = this.groupConfig.values;
        this.tableContainer = null;
        this.tableHeight = '400px';
        this.columnDefs = this.getColDefs();
        this.allColumnAppend = [];
    }
    getColDefs() {
        let colDefs = [];

        for (let controlName in this.controlObj.listInsideControls) {
            let controlInstance = getControlInstanceFromStore(
                this.instance,
                controlName,
            );
            let col = {
                headerName: controlInstance.title,
                field: controlInstance.name,
                editable: true,
            };
            let rowGroup = this.rows.find((ele) => ele.name == controlName);
            if (rowGroup) {
                col = {
                    ...col,
                    ...{
                        rowGroup: true,
                        enableRowGroup: true,
                        hide: true,
                    },
                };
            }
            if (this.cols.length > 0) {
                if (this.cols[0].name == controlName) {
                    continue;
                }
            }
            if (this.values.length > 0) {
                if (this.values[0].name == controlName) {
                    continue;
                }
            }
            colDefs.push(col);
        }
        let colObjectId = {
            headerName: 'child_object_id',
            field: 'child_object_id',
            hide: true,
        };
        colDefs.push(colObjectId);
        return colDefs;
    }
    /**
     * hoangnd
     * Hàm đọc thông tin pivot đã lưu để tạo cấu trúc các cột pivot (bao gồm header và các cột group)
     */
    appendTableColumns(data) {
        if (this.cols.length > 0) {
            let col = this.cols[0];
            this.allColumnAppend = data.reduce((arr, obj) => {
                if (obj[col.name] && !arr.includes(obj[col.name])) {
                    arr.push(obj[col.name]);
                }
                return arr;
            }, []);
            for (let index = 0; index < this.allColumnAppend.length; index++) {
                let colItem = this.allColumnAppend[index];
                let colBinding = {
                    headerName: colItem,
                    field: colItem,
                };
                this.columnDefs.push(colBinding);
            }
        }
    }
    getHashRow(row) {
        let columnDataNotChange = [];
        for (let column in row) {
            if (
                this.cols[0].name != column &&
                this.values[0].name != column &&
                column != 'childObjectId'
            ) {
                columnDataNotChange.push(row[column]);
            }
        }
        return columnDataNotChange.join('__');
    }

    /**
     * Hàm chuyển data dạng flat sang data dạng đã được cấu hình theo group
     * @param {*} data
     */
    convertDataToGroup(data) {
        let mapRowWithData = [];
        let controlValue = this.values[0].name;
        if (this.cols.length > 0) {
            let newData = [];
            for (let index = 0; index < data.length; index++) {
                let newRow = data[index];
                let rowKey = this.getHashRow(newRow);
                if (!mapRowWithData.includes(rowKey)) {
                    mapRowWithData.push(rowKey);
                    for (let i = 0; i < this.allColumnAppend.length; i++) {
                        let column = this.allColumnAppend[i];
                        newRow[column] =
                            column == newRow[this.cols[0]['name']]
                                ? newRow[controlValue]
                                : '';
                    }
                    newData.push(newRow);
                } else {
                    newData[mapRowWithData.indexOf(rowKey)][
                        newRow[this.cols[0]['name']]
                    ] = newRow[controlValue];
                }
            }
            return newData;
        }
        return [];
    }
    /**
     * Hoangnd
     * Hàm xử lí data cho bảng
     * @param {} vl
     */
    setData(data) {
        this.appendTableColumns(data);
        this.gridOptions.api.setColumnDefs(this.columnDefs);
        data = this.convertDataToGroup(data);
        this.gridOptions.api.setRowData(data);
        let viewType = sDocument.state.viewType[this.instance];
        if (viewType == 'print') {
            this.gridOptions.api.setDomLayout('print');
        }
        this.caculatorHeight();
    }

    /**
     * chuyển data dạng pivot sang data dạng flat thì cần xóa các dữ liệu của các cột được thêm vào
     * @param {*} data
     */
    minimizeData(data) {
        for (let index = 0; index < this.allColumnAppend.length; index++) {
            delete data[this.allColumnAppend[index]];
        }
    }

    /**
     * ham trả về data của table
     */
    getGroupData() {
        let rowData = [];
        this.gridOptions.api.forEachNode((node) => {
            if (!node.group) {
                if (this.allColumnAppend.length > 0) {
                    for (
                        let index = 0;
                        index < this.allColumnAppend.length;
                        index++
                    ) {
                        const column = this.allColumnAppend[index];
                        let newRow = util.cloneDeep(node.data);
                        newRow[this.cols[0].name] = column;
                        newRow[this.values[0].name] = newRow[column];
                        this.minimizeData(newRow);
                        rowData.push(newRow);
                    }
                } else {
                    rowData.push(node.data);
                }
            }
        });
        let dataForSubmit = {};
        if (rowData.length > 0) {
            for (let index = 0; index < rowData.length; index++) {
                let row = rowData[index];
                for (let control in row) {
                    if (!dataForSubmit[control]) {
                        dataForSubmit[control] = [];
                    }
                    dataForSubmit[control].push(row[control]);
                }
            }
        }
        return dataForSubmit;
    }
    /**
     * Hoangnd:
     * Hàm tính toán chiều cao cho table
     */
    caculatorHeight() {
        let dataHeight = this.gridOptions.api.getDisplayedRowCount() * 24;
        let headerHeight = 0;
        if (this.cols.length > 0) {
            headerHeight += 24;
        }
        headerHeight += 24 * 2;
        let tableHeight = dataHeight + headerHeight + 3;
        if (tableHeight > 500) {
            tableHeight = 500;
        }
        $('#ag-' + this.controlObj.id).css({ height: tableHeight + 'px' });
    }
    render() {
        this.gridOptions = {
            columnDefs: this.columnDefs,
            animateRows: true,
            // rowHeight:24,
            groupDefaultExpanded: -1,
            rowData: [],
            // debounceVerticalScrollbar:true,
            autoGroupColumnDef: {
                minWidth: this.rows.length > 1 ? 250 : 150,
                cellRendererParams: {
                    suppressCount: true,
                },
            },
            defaultColDef: {
                filter: true,
                width: 150,
                height: 24,
                sortable: true,
                resizable: true,
                wrapText: true,
                autoHeight: true,
                editable: true,
            },
            sideBar: false,
        };
        let viewType = sDocument.state.viewType[this.instance];
        let actionBtn =
            ` <div class="dropdown">
                            <button class="ag-pivot-action"><span class="mdi mdi-plus"></span></button>
                            <div class="dropdown-content">
                                <a onclick="addNewDataPivotTable(this, event, 'rows')" table-name="` +
            this.tableName +
            `">${this.$t('v2.doc.addRow')}</a>
                                <a onclick="addNewDataPivotTable(this, event, 'cols')" table-name="` +
            this.tableName +
            `">${this.$t('v2.doc.addColumn')}</a>
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
                `; width: auto;position:relative;" class="ag-theme-alpine group-table" s-control-type="table">
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
    show() {
        this.tableContainer.style.maxHeight = 'unset';
        this.tableContainer.style.opacity = '1';
    }
    hide() {
        this.tableContainer.style.opacity = '0';
        this.tableContainer.style.maxHeight = '0';
    }
}

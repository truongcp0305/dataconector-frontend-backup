import { util } from '@/plugins/util.js';
import { SYMPER_APP } from '@/main.js';
import { Grid } from 'ag-grid-community';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import 'ag-grid-enterprise';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import {
    getControlInstanceFromStore,
    getListInputInDocument,
    getSDocumentSubmitStore,
    minimizeDataAfterRunFormula,
    SQLITE_COLUMN_IDENTIFIER
} from '../common/common';
import sDocument from '@/store/document';
import store from '../../../store';
import { AddChildrenRowCellRenderer } from './table/AddChildrenRowCellRenderer.js';
import { GroupRowCellRenderer } from './table/GroupRowCellRenderer.js';
import InputFilterCellRenderer from './table/cellrenderer/InputFilterCellRenderer';
import DepartmentCellRenderer from './table/cellrenderer/DepartmentCellRenderer';
import BaseCellRenderer from './table/cellrenderer/BaseCellRenderer';
import DateCellRenderer from './table/cellrenderer/DateCellRenderer';
import DateTimeCellRenderer from './table/cellrenderer/DateTimeCellRenderer';
import TimeCellRenderer from './table/cellrenderer/TimeCellRenderer';
import SelectCellRenderer from './table/cellrenderer/SelectCellRenderer';
import PercentCellRenderer from './table/cellrenderer/PercentCellRenderer';
import NumberCellRenderer from './table/cellrenderer/NumberCellRenderer';
import AutocompleteCellRenderer from './table/cellrenderer/AutocompleteCellRenderer';
import TextCellRenderer from './table/cellrenderer/TextCellRenderer';
import CheckboxCellRenderer from './table/cellrenderer/CheckboxCellRenderer';
import BottomPinnedRowRenderer from './table/cellrenderer/BottomPinnedRowRenderer';
import IndexCellRenderer from './table/cellrenderer/IndexCellRenderer';
import LocationCellRenderer from './table/cellrenderer/LocationCellRenderer';
import FileCellRenderer from './table/cellrenderer/FileCellRenderer';
import { AutoCompleteCellEditor } from './table/AutoCompleteCellEditor';
import { DepartmentCellEditor } from './table/DepartmentCellEditor';
import { LocationCellEditor } from './table/LocationCellEditor.js';
import { TextCellEditor } from './table/TextCellEditor';
import { checkCanBeBind } from './handlerCheckRunFormulas';
import {
    getDataInputFormula,
    prepareDataForRun
} from '../../../components/document/dataControl';
import { str } from '../../../plugins/utilModules/str';
import { uiConfigApi } from '../../../api/uiConfig';
import _isEmpty from 'lodash/isEmpty';
import { ColumnHeaderRenderer } from './table/ColumnHeaderRenderer.js';

window.addNewDataPivotTable = function (el, event, type) {
    let tableName = $(el).attr('table-name');
    event.preventDefault();
    event.stopPropagation();
    let thisListItem = util.getClosestVueInstanceFromDom(el, 'submitDocument');
    thisListItem.$evtBus.$emit('on-add-data-to-pivot-table', {
        type: type,
        tableName: tableName
    });
};

export default class SymperTable {
    constructor(
        tableControl,
        keyInstance,
        groupConfig = {},
        pivotConfig = {},
        matchingItemsConfig = {},
        formulasWorker
    ) {
        this.keyInstance = keyInstance;
        this.init();
        this.tableControl = tableControl;
        this.tableName = tableControl.name;
        this.gridOptions = null;
        this.rows = groupConfig.rows;
        this.showGroupName = groupConfig.showGroupName
            ? groupConfig.showGroupName
            : false;
        this.cols = groupConfig.cols;
        this.values = groupConfig.values;
        this.tableContainer = null;
        this.tableHeightDefault = '400px';
        this.tableHasRowSum = false;
        this.sumColumns = {};
        this.tableMode = this.tableControl.tableMode;
        this.columnDefs = this.getColDefs();
        this.allColumnAppend = [];
        this.agInstance = null;
        this.cellRendererValueMap = {};
        this.formulasWorker = formulasWorker;
        this.matchingItemsConfig = matchingItemsConfig;
        this.tableWorker = null;
        this.dataChange = {};
        this.allControlKeyCache = this.tableControl.getAllControlKeyCache();
        this.onEventReady = false;
        this.permissionConfig = {
            table: {},
            control: {},
            oldRowMaxIndex: 0
        }; // chứa thông tin phân quyền liên quan action control và các dòng dữ liệu cũ
        this.delaySetData = null;
        this.delayTimerGridEvent = null;
        this.delayTimerGridSize = null;
        this.styleForControl = {
            highlight: {},
            focusHighlight: ''
        };
    }
    init() {
        this.viewType = sDocument.state.viewType[this.keyInstance];
        /**
         * Các loại cell mà table hỗ trợ hiển thị
         */
        this.supportCellsType = {
            currency: 'NumberCellRenderer',
            number: 'NumberCellRenderer',
            date: 'DateCellRenderer',
            dateTime: 'DateTimeCellRenderer',
            time: 'TimeCellRenderer',
            percent: 'PercentCellRenderer',
            select: 'SelectCellRenderer',
            combobox: 'SelectCellRenderer',
            checkbox: 'CheckboxCellRenderer',
            image: 'FileCellRenderer',
            fileUpload: 'FileCellRenderer',
            inputFilter: 'InputFilterCellRenderer',
            department: 'DepartmentCellRenderer',
            group: 'GroupRowCellEditor',
            location: 'LocationCellRenderer'
        };
        this.isCellFilling = false;
        this.isCellPasting = false;
        this.dataForCellpasting = {};
        this.columnSelectCache = {};
        this.listItemSelectForClipboard = {};
        this.uiTableConfig = { pinnedColumn: {}, tableDefinition: {} };
        this.allowDeleteRowUpdate = true;
        this.hasRowInsertOnPaste = false;
        this.listColumnOnPaste = [];
    }
    getContextMenuItems(params) {
        let self = params.context.thisComponent;
        if (self.viewType == 'detail') {
            return [
                'autoSizeAll',
                'expandAll',
                'contractAll',
                'resetColumns',
                'excelExport'
            ];
        } else {
            let submitContextItem = [
                'autoSizeAll',
                'expandAll',
                'contractAll',
                'copy',
                'paste',
                'resetColumns',
                'excelExport'
            ];
            //
            if (self.tableControl.isInsertRow() && !self.checkTableReadOnly()) {
                submitContextItem.unshift(
                    {
                        name: SYMPER_APP.$t('v2.doc.deleteRowSelection'),
                        shortcut: 'Shift + Backspace',
                        action: function () {
                            self.onDeleteRowSelection(params);
                            // params.api.applyTransaction({ remove: [params.node.data]});
                        },
                        cssClasses: ['redFont']
                    },
                    {
                        name: SYMPER_APP.$t('v2.doc.deleteRowRangeSelection'),
                        shortcut: '',
                        action: function () {
                            self.onDeleteRowRangeSelection(params);
                        },
                        cssClasses: ['redFont']
                    },
                    {
                        name: SYMPER_APP.$t('v2.doc.addNewRowAfter'),
                        shortcut: 'Shift + Enter',
                        action: function () {
                            self.onAddNewRowAfter(params);
                        },
                        cssClasses: ['blueFont']
                        // icon:'mdi-table-row-plus-after'
                    }
                );
                submitContextItem.unshift({
                    name: SYMPER_APP.$t('v2.doc.addNewRowBefore'),
                    action: function () {
                        self.onAddNewRowBefore(params);
                    },
                    cssClasses: ['blueFont']
                    // icon:'mdi mdi-table-row-plus-before'
                });
            }
            return submitContextItem;
        }
    }
    /**
     * Lấy giá trị của biến check có được xóa dòng lúc update hay không
     * @returns
     */
    getAllowDeleteRowUpdate() {
        return this.allowDeleteRowUpdate;
    }
    /**
     * set giá trị của biến check có được xóa dòng lúc update hay không
     * @returns
     */
    setAllowDeleteRowUpdate(value) {
        let isTrue = value == 't' || value == 1;
        this.allowDeleteRowUpdate = isTrue;
    }
    showLoadingOverlay() {
        this.gridOptions.api.showLoadingOverlay();
    }
    hideOverlay() {
        this.gridOptions.api.hideOverlay();
    }
    // Check cột con cuối cùng được group
    checkLastColGroup() {
        return this.rows[this.rows.length - 1].name;
    }
    /**
     * Xử lý add thêm row mẹ trong group row table
     * @param:params: dòng đang focus trong table
     * @param: lastChildrenCol: tên cột con cuối cùng được group
     * @param: value: danh sách tên group thêm từ list input filter
     * @param: hasFormulas: control có hay không cấu hình công thức autocomplete
     */
    addRowGroupParent(params, lastChildrenCol, value, hasFormulas = false) {
        if (this.tableControl.isInsertRow() && !this.checkTableReadOnly()) {
            let rowIndex = params.node ? params.node.rowIndex : 0;
            let listRows = [];
            let groupedColumns = this.getGroupedColumns(lastChildrenCol);
            if (hasFormulas) {
                for (let index = 0; index < value.length; index++) {
                    let newGroupRow =
                        params.node.allLeafChildren.length > 0
                            ? util.cloneDeep(
                                  params.node.allLeafChildren[0].data
                              )
                            : this.getRowDefaultData()[0];
                    let i = 0;
                    for (let controlName in newGroupRow) {
                        if (controlName.indexOf('s_table_id_sql_lite') != -1) {
                            newGroupRow[controlName] = Date.now() + i;
                        }
                        if (controlName.indexOf('childObjectId') != -1) {
                            newGroupRow[controlName] = '';
                        }
                        if (controlName == lastChildrenCol) {
                            newGroupRow[controlName] = value[index].substring(
                                1,
                                value[index].length - 1
                            );
                        }
                        if (!groupedColumns.includes(controlName)) {
                            // set giá trị không phải group thành rỗng
                            newGroupRow[controlName] = '';
                        }
                        i++;
                    }
                    listRows.push(newGroupRow);
                }
                this.addNewRow(listRows, rowIndex, true);
            } else {
                let newGroupRow =
                    params.node.allLeafChildren.length > 0
                        ? util.cloneDeep(params.node.allLeafChildren[0].data)
                        : this.getRowDefaultData()[0];
                let nameNewGroup = 'Add New Group ';
                let countNewGroup = 1;
                params.node.parent.childrenAfterGroup.map((node) => {
                    if (node.key && node.key != '') {
                        if (node.key.includes(nameNewGroup)) countNewGroup++;
                    }
                });
                let i = 0;
                for (let controlName in newGroupRow) {
                    if (controlName.indexOf('s_table_id_sql_lite') != -1) {
                        newGroupRow[controlName] = Date.now() + i;
                    }
                    if (controlName.indexOf('childObjectId') != -1) {
                        newGroupRow[controlName] = '';
                    }
                    if (controlName == lastChildrenCol) {
                        newGroupRow[controlName] = nameNewGroup + countNewGroup;
                    }
                    if (!groupedColumns.includes(controlName)) {
                        // set giá trị không phải group thành rỗng
                        newGroupRow[controlName] = '';
                    }
                    i++;
                }
                this.addNewRow([newGroupRow], rowIndex, true);
            }
        }
    }
    /*
     * Xử lý lấy những cột được group từ mẹ đến con
     * @param: tên cột con cuối cùng đang trỏ đến
     */
    getGroupedColumns(lastChildrenCol) {
        let fieldGroup = store.state.document.submit.rowGroup;
        let groupedColumns = [];
        let check = true;
        fieldGroup.rowGroup.map((field) => {
            if (check) {
                groupedColumns.push(field.name);
            }
            if (field.name == lastChildrenCol) {
                check = false;
            }
        });
        return groupedColumns;
    }
    /*
     * Xử lý thêm list các dòng group row trong table khi được add từ input filter
     * @param: danh sách tên được chọn từ input filter
     */
    addListRowGroup(data) {
        let inputFilterSelected = data.value.split(',');
        let params = data.params;
        let currentGroup = data.controlName;
        let dataFieldGroup = this.getAllDataFieldGroup(
            data.params,
            data.controlName
        );
        let listGroupRowToAdd = this.getListGroupRowToAdd(
            inputFilterSelected,
            dataFieldGroup,
            data.controlName
        );
        this.addRowGroupParent(params, currentGroup, listGroupRowToAdd, true);
    }
    //lấy những giá trị của dòng có dữ liệu khớp với dataRow được truyền vào
    getRowDataByColumnAndDataRow(column, dataRow) {
        let allRow = [];
        this.gridOptions.api.forEachNode((node) => {
            if (node.data && node.data[column] == dataRow) {
                allRow.push(node.data);
            }
        });
        return allRow;
    }
    /*
     * Lọc những giá trị select trong input filter để lấy data group row cần được thêm vào bảng
     */
    getListGroupRowToAdd(inputFilterSelected, dataFieldGroup, controlName) {
        let listGroupRowToAdd = []; // danh sách list cần add
        if (dataFieldGroup.length > 0) {
            // trường hợp thêm row group từ input filter
            inputFilterSelected.map((select) => {
                if (
                    !dataFieldGroup.includes(
                        select.substring(1, select.length - 1)
                    )
                ) {
                    listGroupRowToAdd.push(select);
                }
            });
            // trường hợp bỏ chọn row group từ input filter
            dataFieldGroup.map((dataGroup) => {
                if (!inputFilterSelected.includes("'" + dataGroup + "'")) {
                    let rowSelection = this.getRowDataByColumnAndDataRow(
                        controlName,
                        dataGroup
                    );
                    let sqlRowId = rowSelection.reduce((arr, obj) => {
                        for (let controlName in obj) {
                            if (
                                controlName.indexOf('s_table_id_sql_lite') != -1
                            ) {
                                arr.push('"' + obj[controlName] + '"');
                            }
                        }
                        return arr;
                    }, []);
                    if (rowSelection.length > 0) {
                        this.deleteRow(rowSelection, sqlRowId.join(','));
                    }
                }
            });
        } else {
            listGroupRowToAdd = [...inputFilterSelected];
        }
        return listGroupRowToAdd;
    }
    /*
     * Lấy tất cả data của field đang được group
     */
    getAllDataFieldGroup(params, controlName) {
        let allLeafChildren = params.node.parent.allLeafChildren;
        let dataFieldGroup = [];
        if (allLeafChildren.length > 0) {
            allLeafChildren.map((chil) => {
                dataFieldGroup.push(chil.data[controlName]);
            });
        }
        return dataFieldGroup;
    }
    getUiConfig() {
        this.showLoadingOverlay();
        let docName =
            sDocument.state.submit[this.keyInstance].documentInfo.document.name;
        let tableDefinition =
            'table_document_instance:' + docName + ':' + this.tableName;
        let self = this;
        uiConfigApi.getUiConfig(tableDefinition).then((res) => {
            let uiConfig = {};
            let tableDefinition = {};
            let pinnedColumn = {};
            if (res.status == 200) {
                uiConfig = res.data.detail;
                try {
                    uiConfig = JSON.parse(uiConfig);
                    tableDefinition = uiConfig.tableDefinition;
                    pinnedColumn = uiConfig.pinnedColumn;
                    self.uiTableConfig['tableDefinition'] = tableDefinition;
                    self.uiTableConfig['pinnedColumn'] = pinnedColumn;
                } catch (error) {
                    console.warn(error);
                }
            }
            let newColdefs = [];
            if (Object.keys(tableDefinition).length > 0) {
                for (let control in tableDefinition) {
                    let colItem = self.columnDefs.find(
                        (el) => el.field == control
                    );
                    if (colItem) {
                        colItem.width = tableDefinition[control];
                        if (
                            pinnedColumn &&
                            pinnedColumn['left'] &&
                            pinnedColumn['left'].includes(control)
                        ) {
                            colItem.pinned = 'left';
                        }
                        if (
                            pinnedColumn &&
                            pinnedColumn['right'] &&
                            pinnedColumn['right'].includes(control)
                        ) {
                            colItem.pinned = 'right';
                        }
                        newColdefs.push(colItem);
                        self.columnDefs.splice(
                            self.columnDefs.indexOf(colItem),
                            1
                        );
                    }
                }
                newColdefs = newColdefs.concat(self.columnDefs);
                newColdefs.map(
                    (f) => {
                        if(self.tableControl.controlInTable[f.field] && self.tableControl.controlInTable[f.field].checkProps('isHidden') ){
                            f.hide = true
                        }
                    }
                );
                self.columnDefs = newColdefs;
                self.gridOptions.api.setColumnDefs([]);
                self.gridOptions.api.setColumnDefs(newColdefs);
                if (self.viewType != 'submit') {
                    // self.autoSizeAll();
                    self.gridOptions.api.resetRowHeights();
                }
            }else {
                this.hideOverlay();
            }
        });
    }

    /**
     * Hàm lấy các định nghĩa của cột
     */
    getColDefs() {
        let colDefs = [];
        let indexColdef = this.getIndexColdef();
        colDefs.push(indexColdef);
        for (let controlName in this.tableControl.controlInTable) {
            let controlInstance = this.tableControl.controlInTable[controlName];
            let col = {
                headerName: controlInstance.title,
                field: controlInstance.name,
                comparator: (valueA, valueB) => {
                    if (controlInstance.type == 'number') {
                        if (!valueA && !valueB === null) {
                            return 0;
                        }
                        if (valueA === null) {
                            return -1;
                        }
                        if (valueB === null) {
                            return 1;
                        }
                        return valueA - valueB;
                    } else {
                        if (
                            valueA &&
                            valueB &&
                            typeof valueA == 'string' &&
                            typeof valueB == 'string'
                        ) {
                            return valueA
                                .toLowerCase()
                                .localeCompare(valueB.toLowerCase());
                        }
                    }
                },
                editable: (params) => {
                    return this.checkEditableCell(controlInstance, params);
                },
                hide:
                    controlInstance.checkProps('isHidden') ||
                    this.checkPermissionCol('hide', controlInstance.name),
                width:
                    controlInstance.getWidth() == false
                        ? 100
                        : controlInstance.getWidth(),
                cellStyle: (params) => {
                    let style = {};
                    let check =
                        this.checkPermission(
                            params,
                            'old_rows_readonly',
                            'control'
                        ) ||
                        this.checkTableReadOnly() ||
                        controlInstance.checkProps('isReadOnly') ||
                        this.checkPermissionCol(
                            'readonly',
                            controlInstance.name,
                            params
                        ) ||
                        this.checkPermission(params, 'old_rows_readonly');
                    // return false;
                    if (check) {
                        style = { backgroundColor: '#f2f2f2' };
                    }

                    return style;
                },
                cellClassRules: {
                    'highlight-control': (params) => {
                        return this.getCellClassRulesForCell(
                            params,
                            'hightlight'
                        );
                    },
                    'highlight-control-focus': (params) => {
                        return this.getCellClassRulesForCell(params, 'focus');
                    }
                },
                headerComponentParams: { isRunFormulaManually : controlInstance.checkProps('isRunFormulaManually')}

            };
            if (controlInstance.getWidth() != false) {
                col.suppressSizeToFit = true;
            }
            if (controlInstance.type == 'textInput') {
                this.setTextInputColdef(col);
            }
            if (
                (controlInstance.type == 'label' ||
                    (!col.editable && controlInstance.type != 'fileUpload')) &&
                !this.checkDetailView()
            ) {
                col.cellStyle = (params) => {
                    if (!params.node.rowPinned) {
                        return { backgroundColor: 'rgba(0, 0, 0, 0.05)' };
                    }
                };
            }
            if (
                controlInstance.type == 'select' ||
                controlInstance.type == 'combobox'
            ) {
                this.setSelectControlColDef(col, controlInstance.type);
            }
            if (this.tableControl.isWrapText()) {
                col.wrapText = true;
                col.autoHeight = true;
            }
            if (controlInstance.checkProps('isSumTable')) {
                this.sumColumns[controlName] = controlInstance;
                this.tableHasRowSum = true;
                (col['pinnedRowCellRenderer'] = 'BottomPinnedRowRenderer'),
                    (col['pinnedRowCellRendererParams'] = {
                        control: controlInstance,
                        style: { 'font-style': 'italic' }
                    });
            }
            if (controlInstance.checkProps('isSumGroupRow')) {
                this.tableHasSumGroup = true;
                col['aggFunc'] = (params) => {
                    let sum = 0;
                    params.values.forEach((value) => {
                        sum += !isNaN(value) ? Number(value) : 0;
                    });
                    return sum;
                };
            }
            if (this.supportCellsType[controlInstance.type]) {
                col['cellRenderer'] =
                    this.supportCellsType[controlInstance.type];
            } else {
                col['cellRenderer'] = 'TextCellRenderer';
            }
            if (
                controlInstance.checkEmptyFormulas('autocomplete') ||
                controlInstance.type == 'user'
            ) {
                this.setAutocompleteControlColDef(col, controlInstance);
            }
            if (controlInstance.type == 'department') {
                this.setDepartmentControlColDef(col, controlInstance);
            }
            if (this.rows && this.rows.length > 0) {
                let rowGroup = this.rows.find((ele) => ele.name == controlName);
                if (rowGroup) {
                    col = {
                        ...col,
                        ...{
                            rowGroup: true,
                            enableRowGroup: true,
                            hide: true
                        }
                    };
                }
            }
            if (controlInstance.type == 'user') {
                controlInstance.setMappingUserId();
            }
            if (this.cols && this.cols.length > 0) {
                if (this.cols[0].name == controlName) {
                    continue;
                }
            }
            if (this.values && this.values.length > 0) {
                if (this.values[0].name == controlName) {
                    continue;
                }
            }
            col['cellRendererParams'] = (param) => {
                return {
                    control: controlInstance,
                    viewType: this.viewType,
                    tableEditable: this.checkTableEditable(param)
                };
            };
            colDefs.push(col);
        }
        let colObjectId = {
            headerName: 'child_object_id',
            field: 'childObjectId',
            hide: true
        };
        let colSqlId = {
            headerName: SQLITE_COLUMN_IDENTIFIER,
            field: SQLITE_COLUMN_IDENTIFIER,
            hide: true
        };
        colDefs.push(colObjectId);
        colDefs.push(colSqlId);
        return colDefs;
    }
    getCellClassRulesForCell(params, type) {
        let config = this.styleForControl;
        let check = false;
        if (type == 'focus') {
            if (
                config &&
                config.focusHighlight &&
                config.focusHighlight == params.colDef.field
            ) {
                check = true;
            }
        } else {
            if (
                config &&
                config.highlight &&
                config.highlight[params.colDef.field]
            ) {
                check = true;
            }
        }
        return check;
    }
    /**
     * Hàm lấy thông tin definition cột index trong table
     * @returns
     */
    getIndexColdef() {
        if (this.tableMode == 'Flat') {
            return {
                field: 'index_increment',
                headerName: '',
                resizable: true,
                minWidth: 60,
                width: 60,
                maxWidth: 80,
                valueGetter: function (params) {
                    if (params.node.rowPinned) {
                        return '';
                    }
                    return params.node.rowIndex + 1;
                },
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                cellRenderer: 'IndexCellRenderer',
                cellRendererParams: {
                    tableIns: this
                },
                pinned: 'left'
            };
        }
        if (this.tableMode == 'Group') {
            return {
                field: 'add-row-grouping',
                headerName: '',
                width: 90,
                lockPosition: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                minWidth: 90,
                minWidth: 90,
                isInsertRow: this.tableControl.isInsertRow() && !this.checkTableReadOnly(),
                cellRenderer: 'AddChildrenRowCellRenderer'
            };
        }
    }
    /**
     * Hàm thêm các thuộc tính cho cột có control autocomplete
     */
    setAutocompleteControlColDef(col, controlInstance) {
        col['cellEditor'] = 'AutoCompleteCellEditor';
        col['cellEditorParams'] = {
            control: controlInstance
        };
        col['cellRenderer'] = 'AutocompleteCellRenderer';
    }

    /**
     * Hàm thêm các thuộc tính cho cột có department
     */
    setDepartmentControlColDef(col, controlInstance) {
        col['cellEditor'] = 'DepartmentCellEditor';
        col['cellRendererParams'] = {
            control: controlInstance
        };
        col['cellRenderer'] = 'DepartmentCellRenderer';
    }
    /**
     * Hàm thêm các thuộc tính cho cột có kiểu là select
     */
    setSelectControlColDef(col, type) {
        let isSingle = type == 'select' ? true : false;
        let isCheck = false;
        const self = this;
        col.suppressKeyboardEvent = function (params) {
            let keyCode = params.event.keyCode;
            let event = params.event;
            if (event.key == 'Tab') {
                params.api.stopEditing();
            }
            if (
                (event.metaKey || event.ctrlKey) &&
                event.shiftKey &&
                event.key == 'ArrowDown'
            ) {
                return true;
            }
            if (
                (event.metaKey || event.ctrlKey) &&
                event.shiftKey &&
                event.key == 'ArrowUp'
            ) {
                return true;
            }
            if (
                (event.metaKey || event.ctrlKey) &&
                event.shiftKey &&
                event.key == 'ArrowLeft'
            ) {
                return true;
            }
            if (
                (event.metaKey || event.ctrlKey) &&
                event.shiftKey &&
                event.key == 'ArrowRight'
            ) {
                return true;
            }
            if ([37, 38, 39, 40].includes(keyCode)) {
                return false;
            }
            let checkPermissionEdit = self.checkPermission(
                params,
                'old_rows_readonly'
            );
            if (
                !isCheck &&
                [13, 9].includes(keyCode) &&
                !params.event.shiftKey &&
                !params.event.ctrlKey &&
                event.type == 'keydown' &&
                !checkPermissionEdit
            ) {
                isCheck = true;
                setTimeout(() => {
                    isCheck = false;
                }, 200);
                let e = params.event;
                e.curTarget = params.event.target;
                SYMPER_APP.$evtBus.$emit('document-submit-select-input', {
                    e: e,
                    controlName: col.field,
                    rowNodeId: [params.node.id],
                    type: type,
                    isSingleSelect: isSingle,
                    currentValue: params.data[col.field]
                });
                return false;
            }
            if (
                [67, 68, 86, 65].includes(keyCode) &&
                (params.event.metaKey || params.event.ctrlKey)
            ) {
                return false;
            }
            return true;
        };
    }
    /**
     * Hàm thêm các thuộc tính cho cột có kiểu là text input
     */
    setTextInputColdef(col) {
        col['cellEditor'] = 'TextCellEditor';
        (col['cellEditorParams'] = (params) => {
            return {
                maxLength: '1000',
                rows: 2
            };
        }),
            (col['suppressKeyboardEvent'] = (params) => {
                let keyCode = params.event.keyCode;
                let event = params.event;
                if (event.key == 'Tab') {
                    params.api.stopEditing();
                }
                if (keyCode == 13 && params.event.shiftKey) {
                    return true;
                } else if (keyCode == 46 || keyCode == 8) {
                    return true;
                }
                if (
                    (event.metaKey || event.ctrlKey) &&
                    event.shiftKey &&
                    event.key == 'ArrowDown'
                ) {
                    return true;
                }
                if (
                    (event.metaKey || event.ctrlKey) &&
                    event.shiftKey &&
                    event.key == 'ArrowUp'
                ) {
                    return true;
                }
                if (
                    (event.metaKey || event.ctrlKey) &&
                    event.shiftKey &&
                    event.key == 'ArrowLeft'
                ) {
                    return true;
                }
                if (
                    (event.metaKey || event.ctrlKey) &&
                    event.shiftKey &&
                    event.key == 'ArrowRight'
                ) {
                    return true;
                }
            });
    }
    getFilterConditional(param) {
        if (param) {
            let filter = [];
            JSON.parse(param).map((f) => {
                filter.push(this.getFilterValues(f));
            });
            return filter.join('AND');
        }
        return '';
    }
    // lấy từng công thức điều kiện cụ thể của 1 filter
    getFilterValues(node) {
        if (!node.condition) {
            let formula = store.state.app.allFilter.filter(
                (f) => f.id == node.column.id
            )[0].formula;
            let field = formula ? formula : '';
            let conditionName = `${field}`;
            return ` ${conditionName} `;
        } else if (node.condition) {
            let arrCond = [];
            for (let childNode of node.children) {
                let itemCond = this.getFilterValues(childNode);
                arrCond.push(itemCond);
            }
            let opr = node.name == 'OR' ? '||' : '&&';
            let cond = arrCond.join(opr);
            return ` (${cond}) `;
        }
    }
    /**
     * Hàm kiểm tra table có readonly hay không
     * @returns
     */
    checkTableReadOnly() {
        if (this.tableControl.checkProps('isReadOnly')) {
            return true;
        }
        return false;
    }
    /**
     * Ham kiểm tra xem cell có được editable hay ko
     * @param {*} control
     * @returns
     */
    checkEditableCell(control, params) {
        if (this.checkTableReadOnly()) {
            return false;
        }
        if (this.viewType == 'detail') {
            return false;
        }
        if (['label', 'fileUpload','location'].includes(control.type)) {
            return false;
        }
        if (control.checkProps('isReadOnly')) {
            return false;
        }
        // if(this.checkPermissionCol('readonly',control.name, params)){
        //     return false
        // }
        if (this.checkPermission(params, 'old_rows_readonly')) {
            return false;
        }
        if (this.checkPermission(params, 'old_rows_readonly', 'control')) {
            return false;
        }
        return true;
    }
    checkPermissionCol(action, col, params) {
        let hasAction = false; // được sửa
        if (
            store.state.app.userOperations &&
            store.state.app.userOperations.control
        ) {
            let docId =
                sDocument.state.submit[this.keyInstance].documentInfo.document
                    .id;
            let permissionControl = store.state.app.userOperations.control;
            let control = docId + ':' + col;
            if (
                permissionControl[control] &&
                permissionControl[control][action]
            ) {
                hasAction = true;
            }
            if (
                params &&
                permissionControl[control] &&
                action == 'readonly' &&
                this.permissionConfig.control[col] &&
                this.permissionConfig.control[col].readonly &&
                this.permissionConfig.control[col].filter
            ) {
                return this.checkPermissionByFilter(
                    params,
                    this.permissionConfig.control[col].filter
                );
            }
        }
        return hasAction;
    }
    // // check permission cho cột trong table với action: readonly, hide
    checkPermissionByFilter(params, filter) {
        let checkFilter = true;
        Object.keys(params.data).map((control) => {
            if (filter.indexOf(control) > -1) {
                if (params.data[control] == '') {
                    checkFilter = false;
                }
                filter = filter
                    .replace(control, "'" + params.data[control] + "'")
                    .replace('=', '==');
            }
        });
        checkFilter = eval(filter);
        return checkFilter;
    }
    // kiểm tra các permisison theo các action: không sửa dòng cũ, không xóa dòng cũ; trả về true nếu có action
    checkPermission(params, action, type = 'allTable') {
        // action: old_rows_readonly; remove; type == allTable, col
        // check trong quy trình nếu task submit và người sửa là người tạo luôn có quyền
        if (
            this.tableControl.documentObjectWorkflowObjectId &&
            this.tableControl.taskAction == 'submit'
        ) {
            return false;
        }
        if (type == 'allTable') {
            if (
                params &&
                this.permissionConfig &&
                this.permissionConfig.table[action]
            ) {
                if (
                    action == 'old_rows_readonly' ||
                    action == 'old_rows_not_remove'
                ) {
                    if (
                        Number(params.node.id) <=
                            Number(this.permissionConfig.oldRowMaxIndex) &&
                        this.viewType == 'update'
                    ) {
                        if (
                            action == 'old_rows_readonly' &&
                            this.permissionConfig.table.filter
                        ) {
                            return this.checkPermissionByFilter(
                                params,
                                this.permissionConfig.table.filter
                            );
                        }
                        if (
                            action == 'old_rows_not_remove' &&
                            this.permissionConfig.table.filter
                        ) {
                            return this.checkPermissionByFilter(
                                params.node,
                                this.permissionConfig.table.filter
                            );
                        }
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            } else {
                return false;
            }
        } else {
            if (
                params &&
                this.permissionConfig &&
                this.permissionConfig.control &&
                this.permissionConfig.control[params.colDef.field] &&
                this.permissionConfig.control[params.colDef.field][action]
            ) {
                if (action == 'old_rows_readonly') {
                    if (
                        Number(params.node.id) <=
                            Number(this.permissionConfig.oldRowMaxIndex) &&
                        this.viewType == 'update'
                    ) {
                        // có filter
                        if (
                            this.permissionConfig.control[params.colDef.field]
                                .filter
                        ) {
                            return this.checkPermissionByFilter(
                                params,
                                this.permissionConfig.control[
                                    params.colDef.field
                                ].filter
                            );
                        }
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            } else {
                return false;
            }
        }
    }
    /**
     * hoangnd
     * Hàm đọc thông tin pivot đã lưu để tạo cấu trúc các cột pivot (bao gồm header và các cột group)
     */
    appendTableColumns(data) {
        if (this.cols && this.cols.length > 0) {
            let col = this.cols[0];
            let value = this.values[0];
            this.allColumnAppend = data.reduce((arr, obj) => {
                if (obj[col.name] && !arr.includes(obj[col.name])) {
                    arr.push(obj[col.name]);
                    arr.push(obj[col.name] + '_____s_table_id_sql_lite');
                    arr.push(obj[col.name] + '_____childObjectId');
                }
                return arr;
            }, []);
            let controlValue = getControlInstanceFromStore(
                this.keyInstance,
                value.name
            );
            for (let index = 0; index < this.allColumnAppend.length; index++) {
                let colItem = this.allColumnAppend[index];
                let colField = colItem.replace('.', '_____');
                let colBinding = {
                    headerName: colItem,
                    field: colField,
                    cellRenderer: this.supportCellsType[value.type],
                    cellRendererParams: {
                        control: controlValue,
                        controlColumn: colField
                    },
                    hide:
                        colField.includes('_____s_table_id_sql_lite') ||
                        colField.includes('_____childObjectId'),
                    editable: this.checkEditableCell(controlValue)
                    // cellStyle: function(params) {
                    //     if (params.value=='R') {
                    //         return {color: 'white', backgroundColor: 'green'};
                    //     }
                    //     if (params.value=='A') {
                    //         return {color: 'white', backgroundColor: 'red'};
                    //     }
                    //     if (params.value=='C') {
                    //         return {color: 'white', backgroundColor: 'orange'};
                    //     }
                    //     if (params.value=='I') {
                    //         return {color: 'white', backgroundColor: 'gray'};
                    //     }
                    //     return null;
                    // }
                };
                this.columnDefs.push(colBinding);
            }
        }
    }
    checkTableEditable(params) {
        let check = true; //false la co old_rows_readonly
        if (
            this.checkTableReadOnly() ||
            // this.checkPermissionCol('readonly',params.colDef.field, params)||
            this.checkPermission(params, 'old_rows_readonly') ||
            this.checkPermission(params, 'old_rows_readonly', 'control')
        ) {
            check = false;
        }
        return check;
    }
    getHashRow(row) {
        let columnDataNotChange = [];
        for (let column in row) {
            if (
                this.cols[0].name != column &&
                this.values[0].name != column &&
                column != 'childObjectId' &&
                column != 's_table_id_sql_lite'
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
        if (this.cols && this.cols.length > 0) {
            let newData = [];
            let controlValue = this.values[0].name;
            for (let index = 0; index < data.length; index++) {
                let newRow = data[index];
                let rowKey = this.getHashRow(newRow);
                /**
                 * đánh dấu giá trị theo dòng những trường ko đưa vào cột
                 * tạo ra 1 key tương ứng để các dòng tiếp theo nếu trùng dữ liệu thì chỉ cần đẩy dữ liệu vào cell ứng với cột
                 */
                if (!mapRowWithData.includes(rowKey)) {
                    mapRowWithData.push(rowKey);
                    for (let i = 0; i < this.allColumnAppend.length; i++) {
                        let column = util.cloneDeep(this.allColumnAppend[i]);
                        let newColumn = util.cloneDeep(this.allColumnAppend[i]);
                        newColumn = newColumn.replace('.', '_____');
                        newRow[newColumn] =
                            column == newRow[this.cols[0]['name']]
                                ? newRow[controlValue]
                                : '';
                        if (
                            column ==
                            newRow[this.cols[0]['name']] +
                                '_____s_table_id_sql_lite'
                        ) {
                            newRow[newColumn] = newRow['s_table_id_sql_lite'];
                        }
                        if (
                            column ==
                            newRow[this.cols[0]['name']] + '_____childObjectId'
                        ) {
                            newRow[newColumn] = newRow['childObjectId'];
                        }
                    }
                    newData.push(newRow);
                } else {
                    let columnCache = newRow[this.cols[0]['name']];
                    columnCache = columnCache.replace('.', '_____');
                    newData[mapRowWithData.indexOf(rowKey)][
                        columnCache + '_____s_table_id_sql_lite'
                    ] = newRow['s_table_id_sql_lite'];
                    newData[mapRowWithData.indexOf(rowKey)][
                        columnCache + '_____childObjectId'
                    ] = newRow['childObjectId'];
                    newData[mapRowWithData.indexOf(rowKey)][columnCache] =
                        newRow[controlValue];
                }
            }
            return newData;
        }
        return data;
    }
    /**
     * Trước khi set data cho table thì lấy các giá trị khác từ cache đưa vào data
     * @param {*} newData
     */

    getDataFromCache(newData) {
        if (this.allControlKeyCache.length == 0) {
            return newData;
        }
        if (newData && newData.length > 0) {
            let keyFromOldData = this.getAllKeyFromOldData(newData[0]);
            let outSideDataColumn = keyFromOldData['outSideDataColumn'];
            let allOldKey = keyFromOldData['allKey'];
            for (let index = 0; index < newData.length; index++) {
                let rowData = newData[index];
                let newRowKey = this.getKeyCache(rowData);
                for (let i = 0; i < outSideDataColumn.length; i++) {
                    const element = outSideDataColumn[i];
                    if (allOldKey[newRowKey]) {
                        newData[index][element] = allOldKey[newRowKey][element];
                    } else {
                        newData[index][element] = '';
                    }
                }
                if (allOldKey[newRowKey]) {
                    delete allOldKey[newRowKey];
                }
            }
            let rowFromUser = this.getRowDataFromUser(allOldKey, newData[0]);
            newData = newData.concat(rowFromUser);
            return newData;
        } else {
            let oldData = this.getAllData(true);
            let rowFromUser = [];
            for (let index = 0; index < oldData.length; index++) {
                let row = oldData[index];
                if (!row[this.allControlKeyCache[0]]) {
                    rowFromUser.push(row);
                }
            }
            return rowFromUser;
        }
    }
    /**
     * lấy các row được nhập từ user
     * @param {*} listRow
     * @returns
     */
    getRowDataFromUser(listRow, currentRow) {
        let rowTmp = [];
        for (let k in listRow) {
            let check = false;
            for (let i in currentRow) {
                if (listRow[k][i]) {
                    check = true;
                    break;
                }
            }
            if (check && !listRow[k][this.allControlKeyCache[0]]) {
                rowTmp.push(listRow[k]);
            }
        }
        return rowTmp;
    }
    /**
     * Hàm lấy tát cả dữ liệu cũ và tạo key để set cache cho lần setData tiếp theo
     */
    getAllKeyFromOldData(newFirstRow) {
        let oldData = this.getAllData(true);
        let allKey = {};
        let outSideDataColumn = [];
        for (let index = 0; index < oldData.length; index++) {
            let row = oldData[index];
            let rowTmp = {};
            for (let k in row) {
                if (newFirstRow.hasOwnProperty(k)) {
                    rowTmp[k] = row[k];
                } else {
                    if (outSideDataColumn.indexOf(k) == -1) {
                        outSideDataColumn.push(k);
                    }
                }
            }
            let key = this.getKeyCache(rowTmp);
            allKey[key] = row;
        }
        return { allKey: allKey, outSideDataColumn: outSideDataColumn };
    }

    /**
     * Hàm tạo key từ dữ liệu
     * @param {*} rowData
     */
    getKeyCache(rowData) {
        return str.hashCode(JSON.stringify(rowData));
    }
    // Kiểm tra table có phải kiểu group
    isGroupTable() {
        return this.tableMode == 'Group' ? true : false;
    }

    debounceSetData(data, isRefreshView) {
        if (this.formulasWorker) {
            this.formulasWorker.postMessage({
                action: 'executeSQliteDB',
                data: {
                    func: 'delete',
                    keyInstance: this.keyInstance,
                    tableName: this.tableName
                }
            });
        }
        if (!data) {
            if (this.checkDetailView()) {
                data = [{}];
            } else {
                if (this.allControlKeyCache.length == 0) {
                    data = this.getRowDefaultData(true);
                } else {
                    data = this.getDataFromCache(data);
                }
            }
            this.gridOptions.api.setRowData(data);
            this.caculatorHeight();
            this.afterSetData(data);
            return;
        } else {
            if (!this.checkDetailView()) {
                data = this.getDataFromCache(data);
            }
            if (data.length == 0) {
                if (this.viewType == 'detail') {
                    this.gridOptions.api.setRowData([{}]);
                } else if (this.viewType == 'update') {
                    this.gridOptions.api.setRowData(this.getRowDefaultData());
                }
                return;
            }
            let dataToStore = {};
            let dataToSqlLite = [];
            let columnInsert = [];
            let rowDefault = this.getDefaultRowDataHasConfig();
            for (let index = 0; index < data.length; index++) {
                let rowId = Date.now() + index;
                data[index] = { ...rowDefault, ...data[index] };
                data[index]['s_table_id_sql_lite'] = rowId;
                let listKey = Object.keys(data[index]);
                let rowData = [];
                for (let j = 0; j < listKey.length; j++) {
                    let controlName = listKey[j];
                    if (
                        controlName == 's_table_id_sql_lite' ||
                        controlName == 'childObjectId' ||
                        this.tableControl.controlInTable[controlName]
                    ) {
                        rowData.push('"' + data[index][controlName] + '"');
                    }
                    if (
                        controlName == 's_table_id_sql_lite' ||
                        controlName == 'childObjectId'
                    ) {
                        continue;
                    }
                    if (!this.tableControl.controlInTable[controlName]) {
                        delete data[index][controlName];
                        continue;
                    }
                    if (!dataToStore.hasOwnProperty(controlName)) {
                        dataToStore[controlName] = [];
                    }
                    let controlIns = getControlInstanceFromStore(
                        this.keyInstance,
                        controlName
                    );
                    if (controlIns.type == 'date') {
                        data[index][controlName] =
                            controlIns.convertDateToStandard(
                                data[index][controlName]
                            );
                    }
                    if (controlIns.type == 'dateTime') {
                        data[index][controlName] =
                            controlIns.convertDateTimeToStandard(
                                data[index][controlName]
                            );
                    }
                    if (data[index] != undefined)
                        dataToStore[controlName].push(data[index][controlName]);
                }
                columnInsert = listKey;
                dataToSqlLite.push('(' + rowData.join() + ')');
            }
            columnInsert = this.clearKeyNotExist(columnInsert);
            if (this.formulasWorker) {
                this.formulasWorker.postMessage({
                    action: 'executeSQliteDB',
                    data: {
                        func: 'insertAll',
                        keyInstance: this.keyInstance,
                        tableName: this.tableName,
                        columns: columnInsert.join(),
                        allData: dataToSqlLite.join()
                    }
                });
            }
            for (let controlName in dataToStore) {
                store.commit('document/updateListInputInDocument', {
                    controlName: controlName,
                    key: 'value',
                    value: dataToStore[controlName],
                    instance: this.keyInstance
                });
            }
        }
        if (['Group', 'Pivot'].includes(this.tableMode)) {
            if (this.allColumnAppend.length > 0) {
                this.deleteAppendColumn(this.allColumnAppend);
            }
            this.appendTableColumns(data);
            this.gridOptions.api.setColumnDefs(this.columnDefs);
            data = this.convertDataToGroup(data);
        }
        this.showLoadingOverlay();
        this.gridOptions.api.setRowData([]);
        this.resetValidate();
        let self = this;
        this.gridOptions.api.applyTransactionAsync(
            { add: data, addIndex: 0 },
            function () {
                self.caculatorHeight();
                if (
                    sDocument.state.submit[self.keyInstance].docStatus != 'init'
                ) {
                    self.afterSetData(data);
                } else {
                    self.autoSizeAll();
                    self.checkRequireChange();
                    store.commit('document/addToDocumentSubmitStore', {
                        key: 'docStatus',
                        value: 'input',
                        instance: self.keyInstance
                    });
                }
                self.checkRequireAfterSetData();
                self.getOldRow();
            }
        );
    }
    /**
     * Hoangnd
     * Hàm xử lí data cho bảng
     * @param {} vl
     */
    setData(data, isRefreshView = false) {
        let self = this;
        clearTimeout(this.delaySetData);
        this.delaySetData = setTimeout(function () {
            self.debounceSetData(data, isRefreshView);
        }, 50);
    }
    /**
     * xóa bỏ các validate đang có ở các cell để set data mới
     */
    resetValidate() {
        for (let controlName in this.tableControl.controlInTable) {
            this.tableControl.controlInTable[controlName].setValueValidation();
        }
    }
    // hàm xử lý xóa cột đã được append
    deleteAppendColumn(appendCol) {
        let columnDefs = [];
        this.columnDefs.map((col) => {
            if (!appendCol.includes(col.headerName)) {
                columnDefs.push(col);
            }
        });
        this.columnDefs = columnDefs;
    }
    /**
     * Hàm xóa cột ko tồn tại trong table nhưng vẫn trả về từ công thức của bảng (dẫn đến ko thể insert vào sqlite)
     */
    clearKeyNotExist(listColumn) {
        let listNewColumn = [];
        for (let index = 0; index < listColumn.length; index++) {
            let column = listColumn[index];
            if (
                this.tableControl.controlInTable[column] ||
                column == 's_table_id_sql_lite' ||
                column == 'childObjectId'
            ) {
                listNewColumn.push(column);
            }
        }
        return listNewColumn;
    }
    /**
     * Hàm xử lý data sau khi set bất đồng bộ
     */
    afterSetData(data) {
        this.autoSizeAll();
        if (this.viewType != 'detail') {
            let controlBinding = Object.keys(data[0]);
            let self = this;
            let x = function tmp(impactedFromTable) {
                for (let index = 0; index < controlBinding.length; index++) {
                    if (controlBinding[index] != 's_table_id_sql_lite') {
                        self.handlerCheckEffectedControlInTable(
                            controlBinding[index],
                            'all',
                            null,
                            {
                                ignoreControl: controlBinding,
                                impactedFromTable: impactedFromTable
                            }
                        );
                    }
                }
            };
            this.getAllEffectedControlAfterSetDataTable(controlBinding, x);
            let listInput = getListInputInDocument(this.keyInstance);
            for (let controlName in this.tableControl.controlInTable) {
                if (controlBinding.indexOf(controlName) != -1) {
                    continue;
                }
                let controlInstance =
                    this.tableControl.controlInTable[controlName];
                let formulaIns = controlInstance.getFormulaInstance('formulas');
                if (formulaIns != false) {
                    let inputFormula = formulaIns.getInputControl();
                    if (Object.keys(inputFormula).length > 0) {
                        let isAlowRun = true;
                        for (let key in inputFormula) {
                            if (listInput.hasOwnProperty(key)) {
                                let controlSourceIns = listInput[key];
                                if (
                                    controlSourceIns.value === '' ||
                                    controlSourceIns.value == undefined ||
                                    controlSourceIns.value == null ||
                                    controlSourceIns.inTable == this.tableName
                                ) {
                                    isAlowRun = false;
                                }
                            }
                        }
                        if (isAlowRun) {
                            this.handleRunFormulaForControlInTable(
                                controlInstance,
                                formulaIns,
                                'all'
                            );
                        }
                    } else {
                        this.handleRunFormulaForControlInTable(
                            controlInstance,
                            formulaIns,
                            'all'
                        );
                    }
                }
                let formulaRequireIns =
                controlInstance.getFormulaInstance('require');
                if (formulaRequireIns != false) {
                    this.handleRunFormulaForControlInTable(
                        controlInstance,
                        formulaRequireIns,
                        'all'
                    );
                }
            }
        }
        if (this.tableHasRowSum) {
            this.gridOptions.api.setPinnedBottomRowData(
                this.createBottomTotalRow(data)
            );
        }
        if (this.viewType == 'print') {
            this.gridOptions.api.setDomLayout('print');
        }
    }
    getAllEffectedControlAfterSetDataTable(controlBinding, x) {
        let allControlEffected = {};
        for (let index = 0; index < controlBinding.length; index++) {
            if (controlBinding[index] != 's_table_id_sql_lite') {
                let controlName = controlBinding[index];
                let controlInstance = getControlInstanceFromStore(
                    this.keyInstance,
                    controlName
                );
                if (controlInstance != false) {
                    let controlEffected = controlInstance.getEffectedControl();
                    allControlEffected = {
                        ...allControlEffected,
                        ...controlEffected
                    };
                }
            }
        }
        let tmp = {};
        for (let k in allControlEffected) {
            if (controlBinding.indexOf(k) == -1) {
                tmp[k] = false;
            }
        }
        x(tmp);
    }
    toggle(display) {
        if (display == 'none') {
            $('#ag-' + this.tableControl.id).closest('.wrap-table').hide();
            $('#ag-' + this.tableControl.id)
                .parent()
                .find('.icon-trace-table')
                .hide();
        } else {
            $('#ag-' + this.tableControl.id).closest('.wrap-table').show();
            $('#ag-' + this.tableControl.id)
                .parent()
                .find('.icon-trace-table')
                .show();
        }
    }
    /**
     * Hoangnd:
     * Hàm tính toán chiều cao cho table
     */
    caculatorHeight() {
        let context =
            this.viewType == 'detail'
                ? $('#sym-Detail-' + this.keyInstance)
                : $('#sym-submit-' + this.keyInstance);
        let tableEl = context.find('#ag-' + this.tableControl.id);
        if (tableEl.length == 0) {
            tableEl = $('#ag-' + this.tableControl.id);
        }
        let contentEl = tableEl.find('.ag-center-cols-clipper');
        if (contentEl[0]) {
            let contentHeight = contentEl[0].style.height;
            if (tableEl[0].style.height) {
                this.setTableHeight(contentHeight, tableEl);
            } else {
                setTimeout(
                    (self) => {
                        self.setTableHeight(contentEl[0].style.height, tableEl);
                    },
                    200,
                    this
                );
            }
        }
    }
    setTableHeight(contentHeight, tableEl) {
        let scrollheight = 0;
        if (tableEl.find('.ag-body-horizontal-scroll').length > 0) {
            scrollheight = tableEl.find('.ag-body-horizontal-scroll').height();
        }
        contentHeight = contentHeight.split('px')[0];
        if (contentHeight < 500 || (this.tableControl.expandTable && contentHeight < tableEl.height() - 28)) {
            let fixedRowHeight = 28;
            if (this.tableHasRowSum) {
                fixedRowHeight += 29;
            }
            fixedRowHeight += scrollheight;
            tableEl.css({
                height: Number(contentHeight) + fixedRowHeight + 'px'
            });
        } else {
            tableEl.css({ height: this.tableControl.expandTable ? 'calc(100% - 54px)' : '500px' });
        }
    }
    /**
     * Chạy công thức check xem table được phép xóa các dòng đã có từ trước hay không
     */
    runDeleteAbleFormula() {
        if (this.viewType == 'update') {
            let formulaInstance =
                this.tableControl.getFormulaInstance('deleteAble');
            if (formulaInstance != false) {
                let listInput = getListInputInDocument(this.keyInstance);
                let optionalDataBinding =
                    sDocument.state.submit[this.keyInstance]
                        .optionalDataBinding;
                let dataInput = getDataInputFormula(
                    formulaInstance,
                    listInput,
                    optionalDataBinding,
                    null,
                    {},
                    this.tableName
                );
                this.formulasWorker.postMessage({
                    action: 'runFormula',
                    data: {
                        formulaInstance: formulaInstance,
                        keyInstance: this.keyInstance,
                        controlName: this.tableControl.name,
                        dataInput: dataInput
                    }
                });
            }
        }
    }

    render() {
        this.checkConfigValidation();
        this.runDeleteAbleFormula();
        this.createSqliteTable();
        this.gridOptions = {
            columnDefs: this.columnDefs,
            accentedSort: true,
            animateRows: true,
            rowDragManaged: true,
            rowSelection: 'multiple',
            enableMultiRowDragging: true,
            headerHeight: 25,
            groupDefaultExpanded: -1,
            suppressRowClickSelection: true,
            components: {
                IndexCellRenderer: IndexCellRenderer,
                AddChildrenRowCellRenderer: AddChildrenRowCellRenderer,
                GroupRowCellRenderer: GroupRowCellRenderer,
                NumberCellRenderer: NumberCellRenderer,
                InputFilterCellRenderer: InputFilterCellRenderer,
                BaseCellRenderer: BaseCellRenderer,
                // LabelCellRenderer:LabelCellRenderer,
                FileCellRenderer: FileCellRenderer,
                PercentCellRenderer: PercentCellRenderer,
                SelectCellRenderer: SelectCellRenderer,
                CheckboxCellRenderer: CheckboxCellRenderer,
                DateCellRenderer: DateCellRenderer,
                DateTimeCellRenderer: DateTimeCellRenderer,
                TimeCellRenderer: TimeCellRenderer,
                AutoCompleteCellEditor: AutoCompleteCellEditor,
                DepartmentCellEditor: DepartmentCellEditor,
                DepartmentCellRenderer: DepartmentCellRenderer,
                TextCellEditor: TextCellEditor,
                AutocompleteCellRenderer: AutocompleteCellRenderer,
                BottomPinnedRowRenderer: BottomPinnedRowRenderer,
                TextCellRenderer: TextCellRenderer,
                LocationCellRenderer: LocationCellRenderer,
                LocationCellEditor: LocationCellEditor,
                agColumnHeader: ColumnHeaderRenderer,

            },
            groupRowRendererParams: {
                innerRenderer: 'GroupRowCellRenderer',
                suppressCount: true,
                checkbox: true,
                suppressDoubleClickExpand: true //không cho click đúp để đóng row group
            },
            popupParent: document.querySelector('.wrapview-contextmenu'),
            getContextMenuItems: this.getContextMenuItems,
            rowDragManaged: true,
            pinnedBottomRowData: this.tableHasRowSum
                ? this.createBottomTotalRow()
                : false,
            getRowStyle: function (params) {
                if (params.node.rowPinned) {
                    return { 'font-weight': '500' };
                }
            },
            // debounceVerticalScrollbar:true,

            defaultColDef: {
                filter: true,
                sortable: true,
                resizable: true,
                suppressKeyboardEvent: function (params) {
                    let keyCode = params.event.keyCode;
                    let event = params.event;
                    if (event.key == 'Tab') {
                        params.api.stopEditing();
                    }
                    if (keyCode == 13 && params.event.shiftKey) {
                        return true;
                    } else if (keyCode == 46 || keyCode == 8) {
                        return true;
                    }
                    if (
                        (event.metaKey || event.ctrlKey) &&
                        event.shiftKey &&
                        event.key == 'ArrowDown'
                    ) {
                        return true;
                    }
                    if (
                        (event.metaKey || event.ctrlKey) &&
                        event.shiftKey &&
                        event.key == 'ArrowUp'
                    ) {
                        return true;
                    }
                    if (
                        (event.metaKey || event.ctrlKey) &&
                        event.shiftKey &&
                        event.key == 'ArrowLeft'
                    ) {
                        return true;
                    }
                    if (
                        (event.metaKey || event.ctrlKey) &&
                        event.shiftKey &&
                        event.key == 'ArrowRight'
                    ) {
                        return true;
                    }
                }
            },
            suppressAggFuncInHeader: true,
            suppressDragLeaveHidesColumns: true,
            enableRangeSelection: true,
            enableRangeHandle: true,
            onRowDragEnd: this.onRowDragEnd,
            onGridReady: this.onGridReady,
            onColumnResized: this.onColumnResized,
            onFilterChanged: this.onFilterChanged,
            onSortChanged: this.onSortChanged,
            onColumnMoved: this.onColumnMoved,
            onColumnPinned: this.onColumnPinned,
            onCellClicked: this.onCellClicked,
            onRowSelected:this.onRowSelected,
            tableInstance: this,
            cacheQuickFilter: true
        };
        if (this.tableMode == 'Group') {
            if (!this.tableHasSumGroup) {
                this.gridOptions = Object.assign(this.gridOptions, {
                    groupUseEntireRow: true
                });
            }
            if (this.rows && this.rows.length > 0) {
                let lastColGroup = this.checkLastColGroup();
                let controlGroup =
                    this.tableControl.controlInTable[lastColGroup];
                let cellRenderer = this.supportCellsType[controlGroup.type];
                let listSupportCell = [
                    'date',
                    'dateTime',
                    'select',
                    'autocomplete'
                ];
                if (!listSupportCell.includes(controlGroup.type)) {
                    cellRenderer = 'GroupRowCellRenderer';
                }
                if (this.showGroupName) {
                    this.gridOptions.autoGroupColumnDef = {
                        cellRenderer: cellRenderer,
                        showColName: true,
                        control: this.tableControl.controlInTable[lastColGroup],
                        valueGetter: (params) => {
                            return params.data ? params.data[lastColGroup] : '';
                        }
                    };
                } else {
                    this.gridOptions.autoGroupColumnDef = {
                        showColName: false,
                        control: controlGroup,
                        cellRenderer: cellRenderer
                    };
                }
                store.commit('document/updateListRowGroup', {
                    rowGroup: this.rows,
                    instance: this.keyInstance,
                    tableName: this.tableName,
                    controlInTable: this.tableControl.controlInTable
                });
            }
        }
        this.gridOptions.context = {
            thisComponent: this
        };
        if (['submit', 'update'].includes(this.viewType)) {
            let self = this;
            let moreOptions = {
                rowData: this.getRowDefaultData(true),
                groupSelectsChildren: true,
                suppressRowTransform: true,
                undoRedoCellEditing: true,
                enableFillHandle: true,
                enableCellTextSelection: false,
                onCellValueChanged: this.onCellValueChanged,
                onCellKeyDown: this.onCellKeyDown,
                onPasteEnd: this.onPasteEnd,
                onDragStarted: this.onDragStarted,
                onDragStopped: this.onDragStopped,
                onCellClicked: this.onCellClicked,
                onCellEditingStarted: this.onCellEditingStarted,
                // xử lý paste vào ô select thì ko làm thay đổi giá trị
                processCellForClipboard: function (params) {
                    let value = params.value;
                    if (
                        params.column.colDef.cellRenderer ==
                        'SelectCellRenderer'
                    ) {
                        self.tableControl.tableInstance.listItemSelectForClipboard[
                            params.column.colDef.field
                        ] = value;
                    }
                    if (
                        params.column.colDef.cellRenderer ==
                            'TextCellRenderer' &&
                        value != undefined
                    ) {
                        return value.replace(/\n/g, ' ');
                    } else {
                        return value;
                    }
                },
                processCellFromClipboard: function (params) {
                    self.listColumnOnPaste.push(params.column.colDef.field);
                    if (
                        params.column.colDef.cellRenderer ==
                        'SelectCellRenderer'
                    ) {
                        let controlName = params.column.colDef.field;
                        let listItems =
                            self.tableControl.tableInstance.getItemsColumnSelect(
                                controlName
                            );
                        if (listItems.includes(params.value)) {
                            return params.value;
                        } else {
                            if (
                                self.tableControl.tableInstance
                                    .listItemSelectForClipboard[controlName] ==
                                params.value
                            ) {
                                return self.tableControl.tableInstance
                                    .listItemSelectForClipboard[controlName];
                            } else {
                                return params.node.data[controlName];
                            }
                        }
                    }
                    if (
                        params.column.colDef.cellRenderer ==
                            'DateCellRenderer' &&
                        params.value
                    ) {
                        let control =
                            self.tableControl.controlInTable[
                                params.column.colDef.field
                            ];
                        return control.getDateChange(params.value);
                    }
                    if (
                        params.column.colDef.cellRenderer ==
                            'DateTimeCellRenderer' &&
                        params.value
                    ) {
                        let control =
                            self.tableControl.controlInTable[
                                params.column.colDef.field
                            ];
                        return control.getDateTimeChange(params.value);
                    }
                    return params.value;
                },
                processDataFromClipboard: function (params) {
                    try {
                        self.listColumnOnPaste = [];
                        let clipboardData = self.tableControl.dataClipBoard;
                        let data = params.data;
                        if (/(\r\n){1}$/.test(clipboardData)) {
                            data.pop();
                        }
                        let cell = self.getFocusedCell();
                        let forcusCellIndex = cell.rowIndex;
                        let dataNewRow = [];
                        let count = self.getDisplayedRowCount();
                        if (self.tableMode == 'Group') {
                            self.handlePasteGroupTable(forcusCellIndex, data);
                        } else {
                            if (count - forcusCellIndex < data.length) {
                                for (
                                    var i = forcusCellIndex;
                                    i < data.length + forcusCellIndex;
                                    i++
                                ) {
                                    if (i >= count) {
                                        let rowData = self.getRowDefaultData();
                                        rowData[0].s_table_id_sql_lite =
                                            Date.now() + i;
                                        rowData[0][cell.column.colDef.field] =
                                            data[i][0];
                                        dataNewRow.push(rowData[0]);
                                    }
                                }
                                self.hasRowInsertOnPaste = true;
                            } else {
                                self.hasRowInsertOnPaste = false;
                            }
                            self.addMultipleRow(dataNewRow, count, true);
                        }
                        return data;
                    } catch (err) {
                        console.log(err);
                    }
                }
            };
            this.gridOptions = Object.assign(this.gridOptions, moreOptions);
        }
        let actionBtn = '';
        // let actionBtn = ` <div class="dropdown">
        //                     <button class="ag-pivot-action"><span class="mdi mdi-plus"></span></button>
        //                     <div class="dropdown-content">
        //                         <a onclick="addNewDataPivotTable(this, event, 'rows')" table-name="`+this.tableName+`">Thêm dòng</a>
        //                         <a onclick="addNewDataPivotTable(this, event, 'cols')" table-name="`+this.tableName+`">Thêm cột</a>
        //                     </div>
        //                 </div>`;
        if (['detail', 'print'].includes(this.viewType)) {
            actionBtn = '';
            this.gridOptions.defaultColDef.menuTabs = ['filterMenuTab'];
        }
        this.tableContainer = $(
            `<div id="ag-` +
                this.tableControl.id +
                `" style="width: auto;max-height:500px;position:relative" class="ag-theme-balham group-table" table-name="` +
                this.tableName +
                `" s-control-type="table">
                                    ` +
                actionBtn +
                `
                            </div>`
        )[0];
        this.tableControl.ele.before(this.tableContainer);
        if (this.viewType == 'print') {
            this.tableControl.ele
                .parent()
                .find('.wrap-s-control-table')
                .remove();
        }
        this.agInstance = new Grid(this.tableContainer, this.gridOptions, {
            modules: [
                ClientSideRowModelModule,
                RowGroupingModule,
                ClipboardModule
            ]
        });
        this.caculatorHeight();
    }
    // lấy những dòng cũ trong table lưu phần action phân quyền
    getOldRow() {
        let oldRow = {
            table: {},
            control: {},
            oldRowMaxIndex: 0
        };
        const self = this;
        if (
            !util.auth.isSupportter() &&
            store.state.app.userOperations &&
            store.state.app.userOperations.control
        ) {
            let permission = {};
            let permissionControlTable = {};
            let docId =
                sDocument.state.submit[this.keyInstance].documentInfo.document
                    .id;
            let permissionControl = store.state.app.userOperations.control;
            let permissionControlFilter = store.state.app.filterObject.control;
            let control = docId + ':' + this.tableName;
            // control table
            if (permissionControl[control]) {
                Object.keys(permissionControl[control]).map((act) => {
                    if (act) {
                        permission[act] = true;
                    }
                });
                if (
                    permissionControlFilter &&
                    permissionControlFilter[docId] &&
                    permissionControlFilter[docId][this.tableName]
                ) {
                    permission.filter = this.getFilterConditional(
                        permissionControlFilter[docId][this.tableName]
                    );
                }
                oldRow.table = permission;
            }
            // control in table
            Object.keys(self.tableControl.controlInTable).map((control) => {
                if (permissionControl[docId + ':' + control]) {
                    permissionControlTable[control] = {};
                    Object.keys(permissionControl[docId + ':' + control]).map(
                        (c) => {
                            if (permissionControl[docId + ':' + control][c]) {
                                permissionControlTable[control] = true;
                                if (!oldRow.control[control]) {
                                    oldRow.control[control] = {};
                                    oldRow.control[control][c] = true;
                                    /// get filter
                                    if (
                                        permissionControlFilter &&
                                        permissionControlFilter[docId] &&
                                        permissionControlFilter[docId][control]
                                    ) {
                                        oldRow.control[control].filter =
                                            this.getFilterConditional(
                                                permissionControlFilter[docId][
                                                    control
                                                ]
                                            );
                                    }
                                } else {
                                    oldRow.control[control][c] = true;
                                    if (
                                        permissionControlFilter &&
                                        permissionControlFilter[docId] &&
                                        permissionControlFilter[docId][control]
                                    ) {
                                        oldRow.control[control].filter =
                                            this.getFilterConditional(
                                                permissionControlFilter[docId][
                                                    control
                                                ]
                                            );
                                    }
                                }
                            }
                        }
                    );
                }
            });
            let max = -1;
            if (this.viewType == 'update') {
                this.gridOptions.api.forEachNode((node) => {
                    if (Number(node.id) > max) max = Number(node.id);
                });
            }
            oldRow.oldRowMaxIndex = max;
            this.permissionConfig = oldRow;
        }
    }
    /**
     * Hàm trả về các cell đang trong trạng thái editting
     * @returns
     */
    getEditingCells() {
        return this.gridOptions.api.getEditingCells();
    }
    // kiểm tra cấu hình hợp lệ của group/pivot table
    checkConfigValidation() {
        if (this.tableMode == 'Pivot' || this.tableMode == 'Group') {
            if (
                (!this.rows && !this.cols) ||
                (this.rows.length == 0 && this.cols.length == 0)
            ) {
                SYMPER_APP.$snotifyError(
                    'Error',
                    'Lỗi có thể xảy ra! Bạn chưa cấu hình hoặc cấu hình sai cho bảng ' +
                        this.tableMode
                );
            }
        }
    }

    /**
     * set auto fit size cho các trường hợp table
     * @param {*} isFirstLoading
     */
    autoSizeAll(isFirstLoading = false) {
        var allColumnIds = [];
        let self = this;
        this.gridOptions.columnApi
            .getAllDisplayedColumns()
            .forEach(function (column) {
                let control =
                    self.tableControl.controlInTable[column.colDef.field];
                if (control && control != false) {
                    let width = control.getWidth();
                    if (width == false) {
                        allColumnIds.push(column.colId);
                    }
                }
            });
        let tableWidth = $('#ag-' + this.tableControl.id).width();
        if (
            !this.checkDetailView() &&
            isFirstLoading &&
            allColumnIds.length < tableWidth / 100
        ) {
            this.gridOptions.api.sizeColumnsToFit();
        }
        if (!isFirstLoading) {
            if (
                !this.tableControl.isWrapText() &&
                allColumnIds.length > tableWidth / 100
            ) {
                this.gridOptions.columnApi.autoSizeColumns(allColumnIds, false);
            } else {
                if (this.tableMode != 'Flat') {
                    this.gridOptions.columnApi.autoSizeColumns(
                        ['ag-Grid-AutoColumn'],
                        false
                    );
                }
            }
        }
    }
    redrawRows() {
        this.gridOptions.api.redrawRows();
    }
    /**
     * Hàm lấy list các item của 1 control select
     * @param {*} controlName
     * @returns
     */
    getItemsColumnSelect(controlName) {
        if (this.columnSelectCache[controlName]) {
            return this.columnSelectCache[controlName];
        }
        let sDocumentSubmit = getSDocumentSubmitStore(this.keyInstance);
        if (sDocumentSubmit.autocompleteData[controlName]) {
            let autocompleteData =
                sDocumentSubmit.autocompleteData[controlName]['cacheData'];
            let listItemInCache =
                autocompleteData[Object.keys(autocompleteData)[0]];
            let listItem = listItemInCache.map((item) => {
                if (item[controlName]) {
                    return item[controlName];
                } else if (item['column1']) {
                    return item['column1'];
                } else {
                    return item[Object.keys(item)[0]];
                }
            });
            this.columnSelectCache[controlName] = listItem;
            return listItem;
        }
        return [];
    }
    /**
     * Xử lí chạy công thức sau khi paste
     */
    onPasteEnd(params) {
        if (this.tableInstance.tableControl.isWrapText()) {
            this.tableInstance.gridOptions.api.resetRowHeights();
            this.tableInstance.caculatorHeight();
        }
        let dataForCellpasting = this.tableInstance.dataForCellpasting;
        this.tableInstance.checkRefreshValidate(dataForCellpasting);
        if (Object.keys(dataForCellpasting).length == 0) {
            return;
        }
        for (let column in dataForCellpasting) {
            let columnDataPaste = dataForCellpasting[column];
            dataForCellpasting[column] = [];
            if (columnDataPaste.length == 1) {
                columnDataPaste[0].source = 'edit';
                this.onCellValueChanged(columnDataPaste[0]);
            } else {
                if (columnDataPaste.length > 0) {
                    let startRow = columnDataPaste[0].rowIndex;
                    let endRow =
                        columnDataPaste[columnDataPaste.length - 1].rowIndex;
                    let controlIns = getControlInstanceFromStore(
                        this.tableInstance.keyInstance,
                        column
                    );
                    if (
                        this.tableInstance.tableHasRowSum &&
                        controlIns.checkProps('isSumTable')
                    ) {
                        this.tableInstance.refreshBottomPinnedCell();
                    }
                    this.tableInstance.handleAfterChangeCellBySystem(
                        column,
                        startRow,
                        endRow
                    );
                }
            }
        }
        if (this.tableInstance.hasRowInsertOnPaste) {
            this.tableInstance.gridOptions.api.refreshCells({
                columns: this.tableInstance.listColumnOnPaste,
                force: true
            });
        }
    }
    /**
     * Hàm kiểm ra require control sau khi paste ( cần check do những phần tử nằm ngoài viewport của table chưa được render trong table thì chưa dược check)
     * @param {*} dataForCellpasting
     */
    checkRefreshValidate(dataForCellpasting) {
        let x = util.cloneDeep(dataForCellpasting);
        if (Object.keys(x).length > 10 || x[Object.keys(x)[0]].length > 20) {
            let self = this;
            setTimeout(() => {
                for (let key in x) {
                    let controlIns = getControlInstanceFromStore(
                        self.keyInstance,
                        key
                    );
                    if (
                        controlIns &&
                        (controlIns.isRequired == true ||
                            controlIns.isRequiredControl())
                    ) {
                        let data = x[key];
                        for (let index = 0; index < data.length; index++) {
                            let id = data[index].node.id;
                            let value = data[index].newValue;
                            if (
                                value != '' &&
                                value != null &&
                                value != undefined
                            ) {
                                controlIns.valueValidation['Require'][id] = {
                                    isValid: false
                                };
                            }
                        }
                    }
                }
            }, 1000);
        }
    }
    /**
     * Hàm kiểm ra require control sau khi setdata ( cần check do những phần tử nằm ngoài viewport của table chưa được render trong table thì chưa dược check)
     * @param {*} dataForCellpasting
     */
    checkRequireAfterSetData() {
        let self = this;
        setTimeout(() => {
            self.gridOptions.api.forEachNode((node, index) => {
                if (!node.group) {
                    let rowData = node.data;
                    for (let controlName in rowData) {
                        let controlIns = getControlInstanceFromStore(
                            self.keyInstance,
                            controlName
                        );
                        if (
                            controlIns &&
                            (controlIns.isRequired == true ||
                                controlIns.isRequiredControl())
                        ) {
                            let value = rowData[controlName];
                            if (
                                value != '' &&
                                value != null &&
                                value != undefined
                            ) {
                                controlIns.valueValidation['Require'][node.id] =
                                    {
                                        isValid: false
                                    };
                            }
                        }
                    }
                }
            });
        }, 1000);
    }
    checkRequireOverrideControls(controlIns) {
        let self = this;
        self.gridOptions.api.forEachNode((node, index) => {
            if (!node.group) {
                let rowData = node.data;
                let value = rowData[controlIns.name];
                if (value != '' && value != null && value != undefined) {
                    controlIns.valueValidation['Require'][node.id] = {
                        isValid: false
                    };
                } else {
                    controlIns.valueValidation['Require'][node.id] = {
                        isValid: true,
                        msg:
                            SYMPER_APP.$t('v2.doc.notBlankInforField') +
                            controlIns.title
                    };
                }
            }
        });
        this.redrawRows();
    }
    clearRangeSelection() {
        this.gridOptions.api.clearRangeSelection();
    }
    /**
     * Sự kiến ném ra khi bắt đầu edit
     * để chặn edit vào control select, dòng tính tổng
     * @param {*} params
     */
    onCellEditingStarted(params) {
        if (params.rowPinned) {
            params.api.stopEditing();
        }
    }
    stopEditing() {
        this.gridOptions.api.stopEditing();
    }

    /**
     * Click vào cell
     */
    onCellClicked(params) {
        let field = params.colDef.field;
        let idField =
            this.tableInstance.tableControl.controlInTable[field].idField;
        if (this.tableInstance.styleForControl.highlight[field]) {
            SYMPER_APP.$evtBus.$emit('document-click-control-hightlight', {
                id: idField,
                dataControlInTable: params.node.data
            });
        }
        store.commit('document/addToDocumentSubmitStore', {
            key: 'tableInteractive',
            value: this.tableInstance.tableName,
            instance: this.tableInstance.keyInstance
        });
    }
    disableButtonDeleteRow(){
        $('#ag-' + this.tableControl.id)
            .parent()
            .find('.icon-options-table.delete-row')
            .addClass('disabled');
    }
    enableButtonDeleteRow(){
        $('#ag-' + this.tableControl.id)
            .parent()
            .find('.icon-options-table.delete-row.disabled')
            .removeClass('disabled');
    }
    /**
     * Click row
     */
    onRowSelected(event) {
        if(event.node.selected){
            this.tableInstance.enableButtonDeleteRow();
        }else if(this.tableInstance.getSelectedRows().length == 0){
            this.tableInstance.disableButtonDeleteRow();
        }
    }
    /**
     * Bắt đầu sự kiện kéo thả
     * @param {*} params
     */
    onDragStarted(params) {
        if ($(params.target).is('div.ag-fill-handle')) {
            this.tableInstance.isCellFilling = true;
        }
    }
    /**
     * kết thúc sự kiện kéo thả
     * @param {*} params
     */

    onDragStopped(params) {
        if ($(params.target).is('div.ag-fill-handle')) {
            let cellRanges = this.tableInstance.getCellRanges();
            let startRow = cellRanges[0].startRow.rowIndex;
            let endRow = cellRanges[0].endRow.rowIndex;
            if (startRow > endRow) {
                let tmp = startRow;
                startRow = endRow;
                endRow = tmp;
            }
            let columns = cellRanges[0].columns;
            for (let index = 0; index < columns.length; index++) {
                const col = columns[index];
                let colName = col.colDef.field;
                let controlIns = getControlInstanceFromStore(
                    this.tableInstance.keyInstance,
                    colName
                );
                if (
                    this.tableInstance.tableHasRowSum &&
                    controlIns.checkProps('isSumTable')
                ) {
                    this.tableInstance.refreshBottomPinnedCell();
                }
                this.tableInstance.handleAfterChangeCellBySystem(
                    colName,
                    startRow,
                    endRow
                );
            }
            this.tableInstance.isCellFilling = false;
        }
    }
    /**
     * Hàm lấy dữ liệu cho việc submit
     */
    getDataSubmit(dataDeleteRowTableConfig = false) {
        let data = {};
        if (dataDeleteRowTableConfig != false) {
            let self = this;
            try {
                this.gridOptions.api.forEachNode((node, index) => {
                    if (!node.group) {
                        let rowData = node.data;
                        for (let controlName in dataDeleteRowTableConfig) {
                            let controlValue = rowData[controlName];
                            if (controlValue == '') {
                                controlValue = "''";
                            }
                            if (
                                eval(
                                    controlValue +
                                        ' ' +
                                        dataDeleteRowTableConfig[controlName]
                                )
                            ) {
                                self.deleteRow(
                                    [rowData],
                                    rowData[SQLITE_COLUMN_IDENTIFIER]
                                );
                            }
                        }
                    }
                });
            } catch (error) {
                console.warn(error);
            }
        }
        if (this.tableMode == 'Flat') {
            data[this.tableName] = this.getDataTableForSubmit();
        } else if (this.tableMode == 'Group') {
            data[this.tableName] = this.getGroupData();
        } else {
            data[this.tableName] = {};
        }
        return data;
    }

    /**
     * chuyển data dạng pivot sang data dạng flat thì cần xóa các dữ liệu của các cột được thêm vào
     * @param {*} data
     */
    minimizeData(data) {
        for (let index = 0; index < this.allColumnAppend.length; index++) {
            let column = this.allColumnAppend[index];
            column = column.replace('.', '_____');
            delete data[column];
        }
    }
    /**
     * ham trả về data của table
     */

    getGroupData(isTranformData = true) {
        let rowData = [];
        let controlNumbers = this.getAllControlNumbersInTable();
        this.gridOptions.api.forEachNode((node) => {
            if (!node.group) {
                if (this.allColumnAppend.length > 0) {
                    for (
                        let index = 0;
                        index < this.allColumnAppend.length;
                        index++
                    ) {
                        let column = util.cloneDeep(
                            this.allColumnAppend[index]
                        );
                        let columnOld = util.cloneDeep(
                            this.allColumnAppend[index]
                        );
                        column = column.replace('.', '_____');
                        if (
                            column.indexOf('_____s_table_id_sql_lite') == -1 &&
                            column.indexOf('_____childObjectId') == -1
                        ) {
                            let newRow = util.cloneDeep(node.data);
                            newRow['child_object_id'] =
                                newRow[column + '_____childObjectId'];
                            newRow[this.cols[0].name] = columnOld;
                            newRow[this.values[0].name] = newRow[column]
                                ? newRow[column]
                                : '';
                            this.minimizeData(newRow);
                            rowData.push(newRow);
                        }
                    }
                } else {
                    rowData.push(node.data);
                }
            }
        });
        let rowNotTranform = [];
        let dataForSubmit = {};
        if (rowData.length > 0) {
            for (let index = 0; index < rowData.length; index++) {
                let row = rowData[index];
                delete row['s_table_id_sql_lite'];
                rowNotTranform.push(row);
                if (!isTranformData) {
                    continue;
                }
                delete row['childObjectId'];
                for (let control in row) {
                    if (!dataForSubmit[control]) {
                        dataForSubmit[control] = [];
                    }
                    dataForSubmit[control].push(row[control]);
                }
                if (this.viewType == 'submit') {
                    let controlNumberNotInRow = this.getControlNumbersNotInRow(
                        row,
                        controlNumbers
                    );
                    if (controlNumberNotInRow.length > 0) {
                        controlNumberNotInRow.map((controlNum) => {
                            if (!dataForSubmit[controlNum]) {
                                dataForSubmit[controlNum] = [];
                            }
                            dataForSubmit[controlNum].push(null);
                        });
                    }
                }
            }
        }
        if (!isTranformData) {
            return rowNotTranform;
        }
        return dataForSubmit;
    }
    // trả về những control chưa có giá trị trong dòng
    getControlNumbersNotInRow(row, controlNumbers) {
        let ctrlNumbersNotInRow = [];
        controlNumbers.map((control) => {
            if (row[control] == undefined) {
                ctrlNumbersNotInRow.push(control);
            }
        });
        return ctrlNumbersNotInRow;
    }
    // trả về những control number có trong bảng
    getAllControlNumbersInTable() {
        let controlNumbers = [];
        const self = this;
        let allCol = this.gridOptions.api.getColumnDefs();
        allCol.map((col) => {
            let nameControl = col.field;
            let type = self.tableControl.controlInTable[nameControl]
                ? self.tableControl.controlInTable[nameControl].type
                : '';
            if (type == 'number') {
                controlNumbers.push(nameControl);
            }
        });
        return controlNumbers;
    }
    selectAll() {
        return this.gridOptions.api.selectAll();
    }
    getRowEmpty() {
        const self = this;
        let rowData = [];
        let checkEmptyRow = (cell) => cell == '' || cell == null;
        this.gridOptions.api.forEachNode((node, index) => {
            rowData.push(node.data);
        });
        let emptyRow = [];
        rowData.map((row) => {
            if (row) {
                // row = undefined nếu là group table
                let filteredRow = { ...row };
                delete filteredRow.s_table_id_sql_lite;
                delete filteredRow.childObjectId;
                let onlyValueArray = Object.values(filteredRow);
                if (onlyValueArray.every(checkEmptyRow)) {
                    emptyRow.push(row);
                }
            }
        });
        return emptyRow;
    }
    findControlUser() {
        let controlIntable = Object.keys(this.tableControl.controlInTable);
        let listControlUser = [];
        controlIntable.map((control) => {
            if (this.tableControl.controlInTable[control].type == 'user') {
                listControlUser.push(
                    this.tableControl.controlInTable[control].name
                );
            }
        });
        return listControlUser;
    }
    getFilterData() {
        let rowData = [];
        let listControlUser = this.findControlUser();
        const self = this;
        this.gridOptions.api.forEachNodeAfterFilter((node) => {
            Object.keys(node.data).map((d) => {
                if (listControlUser.includes(d)) {
                    if (node.data[d]) {
                        node.data[d] =
                            self.tableControl.controlInTable[d].mapData[
                                node.data[d]
                            ];
                    }
                }
            });
            rowData.push(node.data);
        });
        return rowData;
    }
    getDataTableForSubmit() {
        let dataSubmit = {};
        for (let controlName in this.tableControl.controlInTable) {
            let controlInstance = this.tableControl.controlInTable[controlName];
            if (!controlInstance.checkProps('isSaveToDB')) {
                continue;
            }
            dataSubmit[controlName] = this.getColData(controlName);
            if (dataSubmit[controlName].length == 0) {
                return false;
            }
        }
        dataSubmit['child_object_id'] = this.getColData('childObjectId');

        return dataSubmit;
    }
    /**
     * Tạo dòng tính tổng
     * @param {*} data
     */
    createBottomTotalRow(data = []) {
        var result = {};
        for (let controlName in this.sumColumns) {
            result[controlName] = 0;
        }
        return [result];
    }
    caculatorRowHeightAfterColResize(params) {
        if (!this.onEventReady) {
            return;
        }
        if (params.source != 'uiColumnDragged') {
            return;
        }
        let self = this;
        clearTimeout(this.delayTimerGridSize);
        this.delayTimerGridSize = setTimeout(function () {
            self.gridOptions.api.resetRowHeights();
        }, 400);
    }
    /**
     * Sự kiện xảy ra sau khi resize cột
     * @param {*} params
     */
    onColumnResized(params) {
        let thisComponent = this.context.thisComponent;
        thisComponent.onSaveConfigUi(params);
        thisComponent.caculatorRowHeightAfterColResize(params);
    }
    /**
     * Sự kiện xảy ra sau khi filter cột
     * @param {*} params
     */
    onFilterChanged(params) {
        let thisComponent = this.context.thisComponent;
        thisComponent.caculatorHeight();
        thisComponent.refreshBottomPinnedCell();
    }
    /**
     * Sự kiện xảy ra sau khi sort cột
     * @param {*} params
     */
    onSortChanged(params) {
        params.api.refreshCells({ columns: ['index_increment'] });
    }
    /**
     * Sự kiện xảy ra sau khi ẩn cột
     * @param {*} params
     */
    onColumnMoved(params) {
        let thisComponent = this.context.thisComponent;
        thisComponent.onSaveConfigUi(params);
    }
    /**
     * xử lí sự kiện khi pin cột
     * @param {*} params
     */
    onColumnPinned(params) {
        let thisComponent = this.context.thisComponent;
        let colName = params.column.colDef.field;
        let type = params.pinned;
        if (!thisComponent.uiTableConfig['pinnedColumn']) {
            thisComponent.uiTableConfig['pinnedColumn'] = {};
        }
        if (
            type != null &&
            !thisComponent.uiTableConfig['pinnedColumn'].hasOwnProperty(type)
        ) {
            thisComponent.uiTableConfig['pinnedColumn'][type] = [];
        }
        if (type == null) {
            if (
                thisComponent.uiTableConfig['pinnedColumn']['left'] &&
                thisComponent.uiTableConfig['pinnedColumn']['left'].includes(
                    colName
                )
            ) {
                let itemIndex =
                    thisComponent.uiTableConfig['pinnedColumn']['left'].indexOf(
                        colName
                    );
                thisComponent.uiTableConfig['pinnedColumn']['left'].splice(
                    itemIndex,
                    1
                );
            }
            if (
                thisComponent.uiTableConfig['pinnedColumn']['right'] &&
                thisComponent.uiTableConfig['pinnedColumn']['right'].includes(
                    colName
                )
            ) {
                let itemIndex =
                    thisComponent.uiTableConfig['pinnedColumn'][
                        'right'
                    ].indexOf(colName);
                thisComponent.uiTableConfig['pinnedColumn']['right'].splice(
                    itemIndex,
                    1
                );
            }
        } else {
            thisComponent.uiTableConfig['pinnedColumn'][type].push(colName);
        }
        thisComponent.onSaveConfigUi(params);
    }
    /**
     * Lưu lại các cấu hình về kích thước, vị trí các cột sau khi user thay đổi
     * @param {*} params
     * @returns
     */
    onSaveConfigUi(params) {
        let self = this;
        if (!self.onEventReady) {
            return;
        }
        clearTimeout(this.delayTimerGridEvent);
        this.delayTimerGridEvent = setTimeout(function () {
            let configDetail = { tableDefinition: {} };
            params.columnApi
                .getAllDisplayedColumns()
                .forEach(function (column) {
                    let actualWidth = column.actualWidth;
                    let colName = column.colDef.field;
                    configDetail['tableDefinition'][colName] = actualWidth;
                });
            let userId = store.state.app.endUserInfo.id;
            let docName =
                sDocument.state.submit[self.keyInstance].documentInfo.document
                    .name;
            let tableDefinition =
                'table_document_instance:' + docName + ':' + self.tableName;
            self.uiTableConfig['tableDefinition'] =
                configDetail['tableDefinition'];
            uiConfigApi.saveUiConfig({
                detail: JSON.stringify(self.uiTableConfig),
                userId: userId,
                widgetIdentifier: tableDefinition
            });
        }, 500);
    }

    /**
     * Đổi thanh cuộn trong table
     * @param {*} params
     */
    onGridReady(params) {
        this.tableInstance.getUiConfig();
        setTimeout(
            (self) => {
                self.onEventReady = true;
            },
            2000,
            this.tableInstance
        );
        this.tableInstance.gridOptions.api.setDomLayout('normal');
        this.tableInstance.autoSizeAll(true);
        this.tableInstance.getDataControlSelect();
        if (this.tableInstance.viewType == 'submit') {
            this.tableInstance.checkRunFormulaOnNewRow(0);
        }
        setTimeout(
            (self) => {
                SYMPER_APP.$evtBus.$emit('document-table-ready', self.name);
            },
            100,
            this.tableInstance.tableControl
        );
    }

    /**
     * Hàm chạy trước các công thức danh sách của control select phục vụ cho việc paste vào table
     */
    getDataControlSelect() {
        let listInput = getListInputInDocument(this.keyInstance);
        let optionalDataBinding =
            sDocument.state.submit[this.keyInstance].optionalDataBinding;
        for (let controlName in this.tableControl.controlInTable) {
            let controlInstance = this.tableControl.controlInTable[controlName];
            let formulaIns = controlInstance.getFormulaInstance('list');
            if (
                formulaIns != false &&
                ['select', 'combobox'].includes(controlInstance.type)
            ) {
                let dataInput = getDataInputFormula(
                    formulaIns,
                    listInput,
                    optionalDataBinding,
                    0,
                    {},
                    controlName
                );
                this.formulasWorker.postMessage({
                    action: 'runFormula',
                    data: {
                        formulaInstance: formulaIns,
                        dataInput: dataInput,
                        controlName: controlName,
                        rowNodeId: 0,
                        keyInstance: this.keyInstance
                    }
                });
            }
        }
    }

    checkRequireChange() {
        for (let controlName in this.tableControl.controlInTable) {
            let controlInstance = this.tableControl.controlInTable[controlName];
            controlInstance.checkRequireChangeControl();
        }
    }

    /**
     * Hàm kiểm tra xem trong table đang có sort hay column hay không,
     * Nếu có thì bỏ sort và filter trước khi thêm dòng
     */
    checkSortingAndFilteringColumn() {
        let colSort = this.gridOptions.api.getSortModel();
        let colFilter = this.gridOptions.api.getFilterModel();
        if (colFilter.length > 0 || colSort.length > 0) {
            return true;
        }
        return false;
    }
    clearSortAndFilter() {
        this.gridOptions.api.setFilterModel(null);
        this.gridOptions.api.setSortModel(null);
        let dataInsertRow =
            sDocument.state.submit[this.keyInstance].dataInsertRow;
        if (
            dataInsertRow &&
            dataInsertRow.newRow &&
            dataInsertRow.rowIndex >= 0
        ) {
            this.addNewRow(
                dataInsertRow.newRow,
                dataInsertRow.rowIndex,
                dataInsertRow.isRunFormula
            );
        }
    }
    /**
     * Thêm mới dòng phía dưới
     */
    onAddNewRowAfter(params){
        let self = this;
        let rowIndex = params.node
            ? params.node.rowIndex
            : 0;
        if (self.tableMode == 'Group') {
            let groupRowData = self.getGroupRowData(
                params.node.data
            );
            let rowGroupIndex =
                params.node.parent.allLeafChildren[
                    params.node.parent.allChildrenCount - 1
                ].id;
            console.log(groupRowData, 'groupRowData');
            self.addNewRow(
                [groupRowData],
                Number(rowGroupIndex) + 1,
                true
            );
        } else {
            self.addNewRow(
                [{ s_table_id_sql_lite: Date.now() }],
                rowIndex + 1,
                true
            );
        }
    }
    /**
     * Thêm mới dòng phía trên
     */
    onAddNewRowBefore(params){
        let self = this;
        let rowIndex = params.node ? params.node.rowIndex : 0;
        if (self.tableMode == 'Group') {
            let rowGroupIndex =
                params.node.parent.allLeafChildren[0].id;
            let groupRowData = self.getGroupRowData(
                params.node.data
            );
            self.addNewRow([groupRowData], rowGroupIndex, true);
        } else {
            self.addNewRow(
                [{ s_table_id_sql_lite: Date.now() }],
                rowIndex,
                true
            );
        }
    }
    /**
     * Thêm mới dòng
     * Nếu có chạy công thức thì chạy các control có công thức để lấy dữ liệu mặc định
     * @param {*} newRow
     * @param {*} rowIndex
     */
    addNewRow(newRow, rowIndex, isRunFormula = false) {
        console.log(newRow);
        if (this.checkSortingAndFilteringColumn()) {
            SYMPER_APP.$evtBus.$emit('document-show-symper-dialog', {
                symperDialogType: 'sortAndFilterTable'
            });
            let dataInsertRow = {
                newRow: newRow,
                rowIndex: rowIndex,
                isRunFormula: isRunFormula
            };
            store.commit('document/addToDocumentSubmitStore', {
                key: 'dataInsertRow',
                value: dataInsertRow,
                instance: this.keyInstance
            });
            return;
        }
        if (newRow.length == 0) {
            return;
        }
        let dataToSqlite = [];
        let allColAppend = util.cloneDeep(this.allColumnAppend);
        if (allColAppend.length > 0 && this.tableMode == 'Group') {
            for (let index = 0; index < newRow.length; index++) {
                let rowAdd = util.cloneDeep(newRow[index]);
                for (let j = 0; j < allColAppend.length; j++) {
                    let column = allColAppend[j];
                    let colF = column.replace('.', '_____');
                    delete rowAdd[colF];
                }
                for (let i = 0; i < allColAppend.length; i++) {
                    let columnAppend = allColAppend[i];
                    let colField = columnAppend.replace('.', '_____');
                    newRow[index][colField] = '';
                    if (colField.includes('_____s_table_id_sql_lite')) {
                        let rowId = Date.now() + i;
                        newRow[index][colField] = rowId;
                        let newRowAdd = util.cloneDeep(rowAdd);
                        newRowAdd['s_table_id_sql_lite'] = rowId;
                        let col = columnAppend.replace(
                            '_____s_table_id_sql_lite',
                            ''
                        );
                        newRowAdd[this.cols[0].name] = col;
                        dataToSqlite.push(newRowAdd);
                    }
                }
            }
        }
        this.gridOptions.api.applyTransaction({
            add: newRow,
            addIndex: rowIndex
        });
        let rowToSql =
            dataToSqlite.length > 0
                ? util.cloneDeep(dataToSqlite)
                : util.cloneDeep(newRow);
        this.insertDataToTableSqlite(rowToSql);
        this.caculatorHeight();
        if (isRunFormula) {
            this.checkRunFormulaOnNewRow(rowIndex);
        }
    }
    addMultipleRow(newRow, rowIndex, isRunFormula = true) {
        if (newRow.length == 0) {
            return;
        }
        this.gridOptions.api.applyTransaction({
            add: newRow,
            addIndex: rowIndex
        });
        let rowToSql = util.cloneDeep(newRow);
        this.insertDataToTableSqlite(rowToSql);
        this.caculatorHeight();
        if (isRunFormula) {
            this.checkRunFormulaOnNewRow('all');
        }
    }

    /**
     * Hàm đẩy dữ liệu mới vào table sqlite
     * @param {} data
     */
    insertDataToTableSqlite(data) {
        let dataToSqlLite = [];
        let columnInsert = [];
        this.clearUselessColumn(data);
        let listKey = Object.keys(data[0]);
        for (let index = 0; index < data.length; index++) {
            let rowId = Date.now() + index;
            if (!data[index]['s_table_id_sql_lite']) {
                data[index]['s_table_id_sql_lite'] = rowId;
            }
            columnInsert = listKey;
            let rowData = [];
            for (let j = 0; j < listKey.length; j++) {
                let controlName = listKey[j];
                rowData.push('"' + data[index][controlName] + '"');
            }
            dataToSqlLite.push('(' + rowData.join() + ')');
        }
        if (this.formulasWorker) {
            this.formulasWorker.postMessage({
                action: 'executeSQliteDB',
                data: {
                    func: 'insertAll',
                    keyInstance: this.keyInstance,
                    tableName: this.tableName,
                    columns: columnInsert.join(),
                    allData: dataToSqlLite.join()
                }
            });
        }
    }

    clearUselessColumn(data) {
        for (let index = 0; index < data.length; index++) {
            for (let j = 0; j < this.allColumnAppend.length; j++) {
                let columnAppend = this.allColumnAppend[j];
                columnAppend = columnAppend.replace('.', '_____');
                delete data[index][columnAppend];
            }
        }
    }
    /**
     * Hàm kiểm tra xem sau khi thêm dòng thì có chạy công thức lấy giá trị mặc đinh cho các control hay không
     * @param {*} rowIndex
     */
    checkRunFormulaOnNewRow(rowIndex) {
        let listInput = getListInputInDocument(this.keyInstance);
        let rowNode = {};
        if (rowIndex == 'all') {
            rowNode.id = 'all';
        } else {
            rowNode = this.getRowNode(rowIndex);
        }
        for (let controlName in this.tableControl.controlInTable) {
            let controlInstance = this.tableControl.controlInTable[controlName];
            let formulaIns = controlInstance.getFormulaInstance('formulas');
            let formulaRequireIns =
                controlInstance.getFormulaInstance('require');
            let formulaValidateIns =
                controlInstance.getFormulaInstance('validate');
            let formulasRunNewRow = [
                formulaIns,
                formulaRequireIns,
                formulaValidateIns
            ];
            for (let index = 0; index < formulasRunNewRow.length; index++) {
                let formulaIns = formulasRunNewRow[index];
                if (formulaIns != false) {
                    let inputFormula = formulaIns.getInputControl();
                    if (Object.keys(inputFormula).length > 0) {
                        let isAlowRun = true;
                        for (let key in inputFormula) {
                            if (listInput.hasOwnProperty(key)) {
                                let controlSourceIns = listInput[key];
                                if (
                                    controlSourceIns.value === '' ||
                                    controlSourceIns.value == undefined ||
                                    controlSourceIns.value == null ||
                                    controlSourceIns.inTable == this.tableName
                                ) {
                                    isAlowRun = false;
                                }
                                if (
                                    controlSourceIns.getValueProp(
                                        'defaultValue'
                                    ) != ''
                                ) {
                                    isAlowRun = true;
                                }
                            }
                        }
                        if (isAlowRun) {
                            this.handleRunFormulaForControlInTable(
                                controlInstance,
                                formulaIns,
                                rowNode.id
                            );
                        }
                    } else {
                        this.handleRunFormulaForControlInTable(
                            controlInstance,
                            formulaIns,
                            rowNode.id
                        );
                    }
                }
            }
        }
    }
    /**
     * Xóa dòng
     * @param {*} rowData
     * @param {*} sqlRowId
     */
    deleteRow(rowData, sqlRowId) {
        let rowHasObjectId = rowData.find((el) => el.childObjectId);
        if (!this.getAllowDeleteRowUpdate() && rowHasObjectId) {
            SYMPER_APP.$evtBus.$emit('document-show-symper-dialog', {
                symperDialogType: 'canNotDeleteRow'
            });
            return;
        }
        this.gridOptions.api.applyTransaction({ remove: rowData });
        this.formulasWorker.postMessage({
            action: 'executeSQliteDB',
            data: {
                func: 'deleteRow',
                condition: 'where s_table_id_sql_lite IN (' + sqlRowId + ') ',
                keyInstance: this.keyInstance,
                tableName: this.tableName
            }
        });
        this.caculatorHeight();
        this.checkRunFormulaAfterDeleteRow();
        this.refreshBottomPinnedCell();
        this.addRowIfEmptyRowTable(rowData);
    }
    // check nếu xóa hết dòng thì thêm dòng mới
    addRowIfEmptyRowTable() {
        let allRow = this.gridOptions.api.getDisplayedRowCount();
        if (allRow == 0 && this.tableControl.isInsertRow()) {
            this.resetValidate();
            if (this.tableMode == 'Flat') {
                this.addNewRow([{ s_table_id_sql_lite: Date.now() }], 0, true);
            } else {
                let groupRowData = this.getRowDefaultData()[0];
                this.addNewRow([groupRowData], 0, true);
            }
        }
    }
    refreshBottomPinnedCell() {
        let pinnedRowNode = this.gridOptions.api.getPinnedBottomRow(0);
        if (pinnedRowNode) {
            this.gridOptions.api.refreshCells({
                rowNodes: [pinnedRowNode],
                force: true
            });
        }
    }

    /**
     * Hàm kiểm tra xem sau khi xóa dòng thì có chạy công thức cho các control bị ảnh hướng
     * @param {*} rowIndex
     */
    checkRunFormulaAfterDeleteRow() {
        for (let controlName in this.tableControl.controlInTable) {
            let controlInstance = this.tableControl.controlInTable[controlName];
            let controlEffected = controlInstance.getEffectedControl();
            for (let k in controlEffected) {
                if (!this.tableControl.controlInTable[k]) {
                    let controlEff = getControlInstanceFromStore(
                        this.keyInstance,
                        k
                    );
                    let formulaIns = controlEff.getFormulaInstance('formulas');
                    if (formulaIns != false) {
                        SYMPER_APP.$evtBus.$emit(
                            'run-formulas-control-outside-table',
                            {
                                formulaInstance: formulaIns,
                                controlName: k
                            }
                        );
                    }
                }
            }
        }
    }

    /**
     * Hàm chỉ dịnh focus 1 cell nào đó cua table
     * @param {*} rowIndex
     * @param {*} columnName
     */

    setFocusedCell(rowIndex, columnName) {
        this.gridOptions.api.setFocusedCell(rowIndex, columnName);
    }
    // xử lý khi kết thúc dragRow thì thay đổi giá trị cell hiện tại để agrid nhận ra hay đổi dữ liệu => fresh all giá trị của cột stt
    onRowDragEnd(params) {
        if (this.tableMode != 'Group') {
            params.node.setDataValue('index_increment', 0);
        }
    }
    /**
     * Xử lý sự kiện shift + enter xuống dòng
     * shift + enter để xóa dòng
     * @param {*} params
     */
    onCellKeyDown(params) {
        const self = this;
        let event = params.event;
        let rowData = params.data;
        let checkPermission =
            self.tableInstance.checkPermission(
                params,
                'old_rows_readonly',
                'control'
            ) ||
            self.tableInstance.checkPermission(params, 'old_rows_readonly');
        if (self.tableInstance.checkTableReadOnly()) {
            return;
        }
        if (!rowData) {
            return;
        }
        if (params.rowPinned) {
            return;
        }
        if (
            event.key == 'Enter' &&
            event.shiftKey &&
            this.tableInstance.tableControl.isInsertRow()
        ) {
            if (this.tableInstance.tableMode == 'Flat') {
                let rowData = this.tableInstance.getRowDefaultData();
                rowData[0].s_table_id_sql_lite = Date.now();
                this.tableInstance.addNewRow(
                    rowData,
                    params.rowIndex + 1,
                    true
                );
            } else {
                let groupRowData = this.tableInstance.getGroupRowData(rowData);
                let rowGroupIndex =
                    params.node.parent.allLeafChildren[
                        params.node.parent.allChildrenCount - 1
                    ].id;
                this.tableInstance.addNewRow(
                    [groupRowData],
                    rowGroupIndex + 1,
                    true
                );
            }
        } else if (
            !checkPermission &&
            (event.shiftKey || event.metaKey) &&
            event.key == 'Backspace'
        ) {
            this.tableInstance.deleteRowSelection(params);
        } else if (
            checkPermission &&
            (event.key == 'Backspace' ||
                event.key == 'Enter' ||
                event.key == 'Delete')
        ) {
            return;
        } else if (
            event.key == 'F2' &&
            store.state.app.baInfo &&
            store.state.app.baInfo.id
        ) {
            let controlName = params.colDef.field;
            let controlIns = getControlInstanceFromStore(
                this.tableInstance.keyInstance,
                controlName
            );
            SYMPER_APP.$evtBus.$emit('document-submit-show-trace-control', {
                control: controlIns
            });
        }
        //bổ sung tính năng shift + command + xuống để bôi đen hết
        else if (
            (event.metaKey || event.ctrlKey) &&
            event.shiftKey &&
            event.key == 'ArrowDown'
        ) {
            let lastRowIndex = this.tableInstance.getDisplayedRowCount();
            if (this.tableInstance.tableHasRowSum) {
                lastRowIndex = lastRowIndex - 1;
            }
            params.api.clearRangeSelection();
            params.api.addCellRange({
                rowStartIndex: params.rowIndex,
                rowEndIndex: lastRowIndex,
                columnStart: params.column,
                columnEnd: params.column
            });
        } else if (
            (event.metaKey || event.ctrlKey) &&
            event.shiftKey &&
            event.key == 'ArrowUp'
        ) {
            params.api.clearRangeSelection();
            params.api.addCellRange({
                rowStartIndex: params.rowIndex,
                rowEndIndex: 0,
                columnStart: params.column,
                columnEnd: params.column
            });
        } else if (
            (event.metaKey || event.ctrlKey) &&
            event.shiftKey &&
            event.key == 'ArrowLeft'
        ) {
            params.api.clearRangeSelection();
            params.api.addCellRange({
                rowStartIndex: params.rowIndex,
                rowEndIndex: params.rowIndex,
                columnStart: params.column,
                columnEnd: this.tableInstance.getFirstColumn()
            });
        } else if (
            (event.metaKey || event.ctrlKey) &&
            event.shiftKey &&
            event.key == 'ArrowRight'
        ) {
            params.api.clearRangeSelection();
            params.api.addCellRange({
                rowStartIndex: params.rowIndex,
                rowEndIndex: params.rowIndex,
                columnStart: params.column,
                columnEnd: this.tableInstance.getLastColumn()
            });
        } else if ((event.metaKey || event.ctrlKey) && event.code == 'KeyA') {
            params.api.clearRangeSelection();
            let lastRowIndex = this.tableInstance.getDisplayedRowCount();
            if (this.tableInstance.tableHasRowSum) {
                lastRowIndex = lastRowIndex - 1;
            }
            params.api.addCellRange({
                rowStartIndex: 0,
                rowEndIndex: lastRowIndex,
                columnStart: this.tableInstance.getFirstColumn(),
                columnEnd: this.tableInstance.getLastColumn()
            });
        } else {
            let keyCode = event.keyCode;
            if (keyCode === 8 || keyCode === 46) {
                let cellRanges = params.api.getCellRanges();
                for (let index = 0; index < cellRanges.length; index++) {
                    const cells = cellRanges[index];
                    if (cells.columns.length >= 1) {
                        let colIds = cells.columns.map((col) => col.colId);
                        let startRowIndex = Math.min(
                            cells.startRow.rowIndex,
                            cells.endRow.rowIndex
                        );
                        let endRowIndex = Math.max(
                            cells.startRow.rowIndex,
                            cells.endRow.rowIndex
                        );
                        this.tableInstance.clearCells(
                            startRowIndex,
                            endRowIndex,
                            colIds
                        );
                    }
                }
            }
        }
    }
    getFirstColumn() {
        let allColumn = this.gridOptions.columnApi.getAllDisplayedColumns();
        let firstColumn = allColumn[0];
        if (firstColumn.colDef.field != 'index_increment') {
            return firstColumn;
        }
        return allColumn[1];
    }
    getLastColumn() {
        let allCol = this.gridOptions.columnApi.getAllDisplayedColumns();
        return allCol[allCol.length - 1];
    }
    /**
     * Clear các dòng được selection
     * @param {*} start
     * @param {*} end
     * @param {*} columns
     */
    clearCells(start, end, columns) {
        let self = this;
        for (let i = start; i <= end; i++) {
            let rowNode = this.getRowNode(i);
            columns.forEach((column) => {
                if (
                    !self.tableControl.controlInTable[column].checkProps(
                        'isReadOnly'
                    )
                ) {
                    rowNode.setDataValue(column, '');
                }
            });
        }
    }
    getDisplayedRowCount() {
        return this.gridOptions.api.getDisplayedRowCount();
    }
    /**
     * Hàm xóa các dòng được chọn
     * @param {*} params
     */
    clearAll() {
        let rowSelection = this.getSelectedRows();
        let sqlRowId = rowSelection.reduce((arr, obj) => {
            for (let controlName in obj) {
                if (controlName.indexOf('s_table_id_sql_lite') != -1) {
                    arr.push('"' + obj[controlName] + '"');
                }
            }
            return arr;
        }, []);
        this.deleteRow(rowSelection, sqlRowId.join(','));
    }
    /**
     * Xóa các dòng đã chọn trong phạm vi selection
     * @param {} params
     */
    onDeleteRowRangeSelection(params){
        let self = this;
        let checkPermission =
            self.checkPermission(params, 'old_rows_not_remove') ||
            self.checkTableReadOnly() ||
            self.checkPermission(params, 'old_rows_readonly');
        if (!checkPermission) {
            self.deleteRowRangeSelection(params);
        } else {
            SYMPER_APP.$snotifyError(
                '',
                self.$t('permissions.notify.can_not_delete')
            );
        }
    }
    deleteRowRangeSelection(params) {
        let cellRanges = params.api.getCellRanges();
        let listRowNode = [];
        let self = this;
        let listRowIndexSelection = [];
        cellRanges.forEach((cells) => {
            if (cells.columns.length >= 1) {
                let startRowIndex = Math.min(
                    cells.startRow.rowIndex,
                    cells.endRow.rowIndex
                );
                let endRowIndex = Math.max(
                    cells.startRow.rowIndex,
                    cells.endRow.rowIndex
                );
                for (let index = startRowIndex; index <= endRowIndex; index++) {
                    let rowNode = self.getRowNode(index);
                    if (listRowIndexSelection.indexOf(index) == -1) {
                        listRowNode.push(rowNode.data);
                    }
                    listRowIndexSelection.push(index);
                }
            }
        });
        this.deleteRowSelection(params, listRowNode);
    }
    // kiểm tra có quyền xóa không
    checkPermissionDelete() {
        const self = this;
        let nodeSelection = this.getSelectedNodes();
        let checkPermissionDelete = true;
        for (let index = 0; index < nodeSelection.length; index++) {
            let param = { node: { id: '' } };
            param.node.id = nodeSelection[index].id;
            if (self.checkPermission(param, 'old_rows_not_remove')) {
                checkPermissionDelete = false;
                break;
            }
        }
        return checkPermissionDelete;
    }
    /**
     * Xóa các dòng đã chọn
     * @param {} params
     */
    onDeleteRowSelection(params){
        let self = this;
        let checkPermission =
            self.checkPermission(params, 'old_rows_not_remove') ||
            self.checkTableReadOnly() ||
            self.checkPermission(params, 'old_rows_readonly');
        if (!checkPermission) {
            self.deleteRowSelection(params);
        } else {
            SYMPER_APP.$snotifyError(
                '',
                self.$t('permissions.notify.can_not_delete')
            );
        }
    }
    deleteRowSelection(params, listRowNode = []) {
        if (!this.checkPermissionDelete()) {
            SYMPER_APP.$snotifyError(
                '',
                self.$t('permissions.notify.can_not_delete')
            );
            return;
        }
        let rowSelection = this.getSelectedRows();
        if (listRowNode.length > 0) {
            rowSelection = listRowNode;
        }
        let rowCount = params.api.getDisplayedRowCount();
        let sqlRowId = rowSelection.reduce((arr, obj) => {
            for (let controlName in obj) {
                if (controlName.indexOf('s_table_id_sql_lite') != -1) {
                    arr.push('"' + obj[controlName] + '"');
                }
            }
            return arr;
        }, []);
        this.deleteRow(rowSelection, sqlRowId.join(','));
        let newCellIndex = params.rowIndex;
        if (newCellIndex) {
            if (newCellIndex > rowCount - 1) {
                newCellIndex = rowCount - 1;
            }
            params.api.setFocusedCell(newCellIndex, params.colDef.field);
        }
    }
    getGroupRowData(rowData) {
        let newRow = util.cloneDeep(rowData);
        let i = 0;
        for (let controlName in newRow) {
            if (controlName.indexOf('childObjectId') != -1) {
                newRow[controlName] = '';
            }
            let rowGroup = this.rows.find((ele) => ele.name == controlName);
            if (!rowGroup) {
                newRow[controlName] = '';
            }
            if (controlName.indexOf('s_table_id_sql_lite') != -1) {
                newRow[controlName] = Date.now() + i;
            }
            i++;
        }
        return newRow;
    }
    /**
     * Kiểm tra xem đang ở view detail hay submit
     */
    checkDetailView() {
        if (this.viewType == 'detail') {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Hàm khởi tạo bảng sql lite
     */
    createSqliteTable() {
        let columns = [];
        for (let controlName in this.tableControl.controlInTable) {
            let controlInstance = this.tableControl.controlInTable[controlName];
            let type = controlInstance.type;
            if (['number', 'percent'].includes(type)) {
                type = 'numeric';
            } else {
                type = 'text';
            }
            columns.push(controlName + ' ' + type);
        }
        columns.push('s_table_id_sql_lite integer');
        columns.push('childObjectId text');
        this.formulasWorker.postMessage({
            action: 'executeSQliteDB',
            data: {
                func: 'createTable',
                columns: columns.join(','),
                keyInstance: this.keyInstance,
                tableName: this.tableName
            }
        });
    }
    /**
     * Hàm lấy ra các giá trị được cấu hình mặc định cho 1 dòng
     * @returns
     */
    getDefaultRowDataHasConfig() {
        let rowItem = {};
        for (let controlName in this.tableControl.controlInTable) {
            let controlInstance = this.tableControl.controlInTable[controlName];
            let defaultControlValue =
                controlInstance.getValueProp('defaultValue');
            if (defaultControlValue) {
                if (['number', 'percent'].includes(controlInstance.type)) {
                    rowItem[controlName] = 0;
                }
                rowItem[controlName] = defaultControlValue;
            }
        }
        return rowItem;
    }
    /**
     * Ham trả về dòng có giá trị mặc định
     */
    getRowDefaultData(isCreateFirstRow = false) {
        let rowItem = {};
        let columnInsert = [];
        let dataInsert = [];
        for (let controlName in this.tableControl.controlInTable) {
            let controlInstance = this.tableControl.controlInTable[controlName];
            let defaultControlValue =
                controlInstance.getValueProp('defaultValue');
            if (defaultControlValue) {
                columnInsert.push(controlName);
                dataInsert.push(defaultControlValue);
            }
            if (['number', 'percent'].includes(controlInstance.type)) {
                rowItem[controlName] = 0;
            }
            rowItem[controlName] = defaultControlValue
                ? defaultControlValue
                : '';
        }
        rowItem[SQLITE_COLUMN_IDENTIFIER] = Date.now();
        if (isCreateFirstRow) {
            if (!this.checkDetailView()) {
                columnInsert.push('s_table_id_sql_lite');
                dataInsert.push(rowItem[SQLITE_COLUMN_IDENTIFIER]);
                this.formulasWorker.postMessage({
                    action: 'executeSQliteDB',
                    data: {
                        func: 'insertRow',
                        columns: columnInsert,
                        rowData: dataInsert,
                        keyInstance: this.keyInstance,
                        tableName: this.tableName,
                        isPromise: false
                    }
                });
            }
        }
        return [rowItem];
    }
    setValueColumns(column, value) {
        this.gridOptions.api.forEachNode((node) => {
            let data = node.data;
            if (data[column] != undefined) {
                node.setDataValue(column, value);
            }
        });
    }
    /**
     * Refresh lại cell renderer của 1 cell
     */
    refreshCells(controlName, rowNodeId = null) {
        let allRowRefresh = [];
        for (let index = 0; index < rowNodeId.length; index++) {
            let rowNode = this.getRowNodeById(rowNodeId[index]);
            allRowRefresh.push(rowNode);
        }
        let params = {
            force: true
        };
        if (allRowRefresh.length > 0) {
            params['columns'] = [controlName];
            params['rowNodes'] = allRowRefresh;
        }
        this.gridOptions.api.refreshCells(params);
    }
    updateColDefs(colDefs = false) {
        if (colDefs == false) {
            colDefs = this.gridOptions.api.getColumnDefs();
            colDefs.forEach((d) => {
                Object.keys(d).forEach(
                    (key) => d[key] == null && delete d[key]
                );
            });
        }
        this.gridOptions.api.setColumnDefs(colDefs);
    }
    /**
     * Ham đặt readonly cho 1 column
     * @param {*} colName
     * @param {*} isReadOnly
     */
    setReadOnlyColumn(colName, isReadOnly) {
        let colDefs = this.gridOptions.api.getColumnDefs();
        let col = colDefs.find((c) => c.field == colName);
        let colIndex = colDefs.indexOf(col);
        colDefs[colIndex].editable = !isReadOnly;
        colDefs[colIndex].cellStyle = (params) => {
            if (!params.colDef.editable) {
                return { backgroundColor: 'rgba(0, 0, 0, 0.05)' };
            }
        };
        colDefs.forEach((d) => {
            Object.keys(d).forEach((key) => d[key] == null && delete d[key]);
        });
        this.gridOptions.api.setColumnDefs([]);
        this.gridOptions.api.setColumnDefs(colDefs);
    }
    /**
     * Hàm ẩn các cột trong table
     * @param ['col1','col2'] cols
     * @param true/false visible
     */
    setColumnsVisible(cols, visible) {
        this.gridOptions.columnApi.setColumnsVisible(cols, visible);
    }
    /**
     * Hàm lấy cell đang forcus
     */
    getFocusedCell() {
        return this.gridOptions.api.getFocusedCell();
    }

    getSelectedNodes() {
        return this.gridOptions.api.getSelectedNodes();
    }
    startEditingCell(params) {
        return this.gridOptions.api.startEditingCell(params);
    }
    /**
     * Hàm trả về rowNode theo index
     * @param {*} index
     */
    getDisplayedRowAtIndex(index) {
        return this.gridOptions.api.getDisplayedRowAtIndex(index);
    }

    /**
     * Hàm trả về các dòng đang được chọn của table
     */
    getSelectedRows() {
        return this.gridOptions.api.getSelectedRows();
    }
    getCellRanges() {
        return this.gridOptions.api.getCellRanges();
    }
    /**
     * Set dữ liệu cho 1 cell theo key (column name)
     */
    setDataAtCell(key, value, currentRowNodeId, forGroupRow = false) {
        if (forGroupRow) {
            this.setDataGroupAtCell(key, value, currentRowNodeId);
        }
        if (currentRowNodeId.includes('row-group')) {
            return;
        }
        this.gridOptions.api.stopEditing(true);
        let rowNode = this.getRowNodeById(currentRowNodeId);
        rowNode.setDataValue(key, value);
    }
    // hàm set dữ liệu cho row group
    setDataGroupAtCell(field, value, currentRowNodeId) {
        let updateRows = [];
        currentRowNodeId.setDataValue(field, value);
        currentRowNodeId.allLeafChildren.map((node) => {
            node.data[field] = value;
            updateRows.push(node.data);
        });
        this.gridOptions.api.applyTransaction({ update: updateRows });
    }
    /**
     * Hàm lấy model của 1 row
     * @param {*} rowIndex
     */
    getRowNode(rowIndex) {
        let rowModel = this.gridOptions.api.getModel();
        return rowModel.rowsToDisplay[rowIndex];
    }
    /**
     * Hàm lấy model của 1 row
     * @param {*} rowIndex
     */
    getRowNodeById(id) {
        return this.gridOptions.api.getRowNode(id);
    }
    getRowNodeByObjectId(objectId) {
        let n = null;
        this.gridOptions.api.forEachNode((node) => {
            let data = node.data;
            if (data['childObjectId'] == objectId) {
                n = node;
                return n;
            }
        });
        return n;
    }
    /**
     * Hàm trả về dữ liệu của 1 dòng theo index
     */
    getDataByRowIndex(rowIndexs) {
        let rowData = [];
        for (let index = 0; index < rowIndexs.length; index++) {
            const rowIndex = rowIndexs[index];
            rowData.push(this.getRowNode(rowIndex));
        }
        return rowData;
    }
    /**
     * Hàm trả về dữ liệu của 1 dòng theo id của row node
     */
    getDataByRowId(rowIds) {
        let rowData = [];
        for (let index = 0; index < rowIds.length; index++) {
            const rowId = rowIds[index];
            rowData.push(this.gridOptions.api.getRowNode(rowId));
        }
        return rowData;
    }
    /**
     * Hàm trả về tất cả dữ liệu của bảng
     */
    getAllData(isWithoutId = false) {
        let rowData = [];
        this.gridOptions.api.forEachNode((node) => {
            let data = node.data;
            if (isWithoutId && node.data) {
                delete data[SQLITE_COLUMN_IDENTIFIER];
            }
            rowData.push(Object.assign({}, node.data));
        });
        return rowData;
    }
    // hàm trả về dữ liệu của các dòng lọc theo giá trị cột được chọn
    getDataByColumn(columnList) {
        let row = [];
        this.gridOptions.api.forEachNode((node) => {
            let rowFilted = {};
            columnList.map((column) => {
                if (Object.keys(node.data).includes(column)) {
                    rowFilted[column] = node.data[column];
                }
            });
            row.push(rowFilted);
        });
        return row;
    }
    /**
     * Hàm trả về tất cả row node id cho trường  hợp chạy công thức cả cột
     */
    getAllRowNodeId() {
        let rowData = [];
        this.gridOptions.api.forEachNode((node) => rowData.push(node.id));
        return rowData;
    }
    /**
     * Hàm trả về dữ liệu của 1 cột
     * @param {*} colName
     */
    getColData(colName) {
        let allData = this.getAllData();
        let colData = allData.reduce((arr, obj) => {
            let value = obj[colName];
            if (value && typeof value == 'string') {
                value = value.replace(/\u00A0/g, ' ');
            }
            arr.push(value);
            return arr;
        }, []);
        return colData;
    }
    /**
     * Hàm lấy dữ liệu của 1 cột sau khi filter
     * @param {*} colName
     * @returns
     */
    getColDataAfterFilter(colName) {
        let colData = [];
        this.gridOptions.api.forEachNodeAfterFilter((node) => {
            if (node.data && node.data[colName]) {
                colData.push(node.data[colName]);
            }
        });
        return colData;
    }
    getColDataWithRowId(colName) {
        let colData = [];
        this.gridOptions.api.forEachNode((node) => {
            if (node.data && node.data[colName]) {
                colData[node.id] = node.data[colName];
            }
        });
        return colData;
    }
    /**
     * Hàm tính tổng 1 cột
     * @param {*} colName
     */
    getSumColumn(colName) {
        let allData = this.getAllData();
        let sum = allData.reduce((arr, obj) => {
            if (obj[colName]) {
                arr += Number(obj[colName]);
            }
            return arr;
        }, 0);
        return sum;
    }
    /**
     * Hàm trả về giá trị của 1 cell
     * @param {*} columnName
     * @param {*} rowIndex
     */
    getCellData(columnName, rowIndex) {
        let rowNode = this.gridOptions.api.getRowNode(rowIndex);
        return rowNode.data[columnName];
    }
    /**
     * Hàm trả về giá trị của 1 cell theo nodeId
     * @param {*} columnName
     * @param {*} rowIndex
     */
    getCellDataByNodeId(columnName, rowId) {
        if (rowId.includes('row-group')) {
            rowId = rowId.replace('row-group-', '');
        }
        let rowNode = this.getRowNodeById(rowId);
        return rowNode ? rowNode.data[columnName] : '';
    }

    /**
     * Update dữ liệu vào column
     * @param {*} mapIndexChange
     * @param {*} columnChange
     */
    updateColumnData(mapIndexChange, columnChange, rowNodeId) {
        var itemsToUpdate = [];
        let dataToSqlite = {};
        this.gridOptions.api.forEachNode(function (rowNode, index) {
            if (rowNode.group) {
                let allLeafChildren = rowNode.allLeafChildren;
                for (let i = 0; i < allLeafChildren.length; i++) {
                    let childRow = allLeafChildren[i];
                    if (mapIndexChange.hasOwnProperty(childRow.id)) {
                        var data = childRow.data;
                        dataToSqlite[data[SQLITE_COLUMN_IDENTIFIER]] =
                            mapIndexChange[childRow.id];
                        data[columnChange] = mapIndexChange[childRow.id];
                        itemsToUpdate.push(data);
                    }
                }
            } else {
                if (mapIndexChange.hasOwnProperty(rowNode.id)) {
                    var data = rowNode.data;
                    dataToSqlite[data[SQLITE_COLUMN_IDENTIFIER]] =
                        mapIndexChange[rowNode.id];
                    data[columnChange] = mapIndexChange[rowNode.id];
                    itemsToUpdate.push(data);
                }
            }
        });
        if (this.formulasWorker) {
            this.formulasWorker.postMessage({
                action: 'executeSQliteDB',
                data: {
                    func: 'updateMultiRow',
                    keyInstance: this.keyInstance,
                    columnName: columnChange,
                    tableName: this.tableName,
                    allData: dataToSqlite
                }
            });
        }
        let controlIns = getControlInstanceFromStore(
            this.keyInstance,
            columnChange
        );
        if (
            controlIns &&
            this.tableHasRowSum &&
            controlIns.checkProps('isSumTable')
        ) {
            this.refreshBottomPinnedCell();
        }
        this.gridOptions.api.applyTransaction({ update: itemsToUpdate });
        setTimeout(
            (self) => {
                if (!rowNodeId) {
                    rowNodeId = 'all';
                }
                self.handlerCheckEffectedControlInTable(
                    columnChange,
                    rowNodeId
                );
            },
            50,
            this
        );
    }

    /**
     * Nhận sự kiên khi giá trị của cell thay đổi => chạy công thức cho các control bị ảnh hưởng
     */
    onCellValueChanged(event) {
        console.log(event, 'eventevent');
        let cellFocusing = this.tableInstance.getFocusedCell();
        if (
            cellFocusing &&
            cellFocusing.column &&
            cellFocusing.column.colDef.field == event.colDef.field
        ) {
            store.commit('document/addToDocumentSubmitStore', {
                key: 'rootChangeFieldName',
                value: event.colDef.field,
                instance: this.tableInstance.keyInstance
            });
        }
        if (this.tableInstance.isCellFilling) {
            return;
        }
        if (event.source == 'paste') {
            if (!this.tableInstance.dataForCellpasting[event.colDef.field]) {
                this.tableInstance.dataForCellpasting[event.colDef.field] = [];
            }
            this.tableInstance.dataForCellpasting[event.colDef.field].push(
                event
            );
            return;
        }
        if (event.rowPinned) {
            return;
        }
        let cellValue = event.value;
        let columnChange = event.colDef.field;
        let rowId = event.node.id;
        let isValueChange = false;
        if (event.newValue != event.oldValue) {
            isValueChange = true;
            this.tableInstance.dataChange['columnName'] = columnChange;
            this.tableInstance.dataChange['currentRowData'] = event.data;
            let controlIns = getControlInstanceFromStore(
                this.tableInstance.keyInstance,
                columnChange
            );
            if (['number', 'percent'].includes(controlIns.type)) {
                let valueChange = event.value;
                if (
                    valueChange &&
                    /^=/.test(valueChange) &&
                    !/[a-zA-Z]/.test(valueChange)
                ) {
                    valueChange = valueChange + '';
                    valueChange = valueChange.replace(/=/g, '');
                    valueChange = eval(valueChange);
                    cellValue = valueChange;
                    event.node.setDataValue(columnChange, valueChange);
                }
            }
            if (controlIns.type == 'date') {
                let d = controlIns.getDateChange(cellValue);
                let date = d != false ? d : cellValue;
                event.node.setDataValue(columnChange, date);
            }
            if (controlIns.type == 'dateTime') {
                let dt = controlIns.getDateTimeChange(cellValue);
                let dateTime = dt != false ? dt : cellValue;
                event.node.setDataValue(columnChange, dateTime);
            }
            if (
                controlIns &&
                this.tableInstance.tableHasRowSum &&
                controlIns.checkProps('isSumTable')
            ) {
                this.tableInstance.refreshBottomPinnedCell();
            }
            if (controlIns && controlIns.checkProps('isTableOnly')) {
                this.tableInstance.checkUniqueTable(
                    controlIns,
                    event.value,
                    event.node.id,
                    event.rowIndex
                );
            }
        }
        console.log(event.data, 'event.data');
        this.tableInstance.handlerAfterChangeCellByUser(
            columnChange,
            cellValue,
            event.data,
            rowId,
            isValueChange
        );
        if (this.tableInstance.tableControl.isWrapText()) {
            this.tableInstance.gridOptions.api.resetRowHeights();
            this.tableInstance.caculatorHeight();
        }
    }

    /**
     * Hàm xử lí dữ liệu thay đổi ở cell bởi user
     */
    handlerAfterChangeCellByUser(
        columnName,
        valueChange,
        currentRowData,
        rowId,
        isValueChange
    ) {
        if(sDocument.state.submit[this.keyInstance].docStatus != 'beforeSubmit'){
            store.commit('document/addToDocumentSubmitStore', {
                key: 'docStatus',
                value: 'input',
                instance: this.keyInstance
            });
        }
        let currentCol = columnName;
        // nếu trường hợp là bảng group thì cần lấy control tương ứng với cột được binding vào
        let sqlRowId = currentRowData[SQLITE_COLUMN_IDENTIFIER];
        if (isValueChange) {
            if (this.checkInColumnAppend(columnName)) {
                if (
                    this.values &&
                    this.values.length > 0 &&
                    this.tableMode == 'Group'
                ) {
                    columnName = this.values[0].name;
                    sqlRowId =
                        currentRowData[
                            currentCol + '_____' + SQLITE_COLUMN_IDENTIFIER
                        ];
                }
                this.formulasWorker.postMessage({
                    action: 'executeSQliteDB',
                    data: {
                        func: 'editRow',
                        columns: columnName,
                        value: valueChange,
                        condition:
                            'WHERE ' +
                            SQLITE_COLUMN_IDENTIFIER +
                            ' = ' +
                            sqlRowId,
                        keyInstance: this.keyInstance,
                        tableName: this.tableName
                    }
                });
            } else {
                if (this.allColumnAppend.length > 0) {
                    for (
                        let index = 0;
                        index < this.allColumnAppend.length;
                        index++
                    ) {
                        let col = this.allColumnAppend[index];
                        if (col.includes('_____s_table_id_sql_lite')) {
                            col = col.replace('.', '_____');
                            sqlRowId = currentRowData[col];
                            this.formulasWorker.postMessage({
                                action: 'executeSQliteDB',
                                data: {
                                    func: 'editRow',
                                    columns: columnName,
                                    value: valueChange,
                                    condition:
                                        'WHERE ' +
                                        SQLITE_COLUMN_IDENTIFIER +
                                        ' = ' +
                                        sqlRowId,
                                    keyInstance: this.keyInstance,
                                    tableName: this.tableName
                                }
                            });
                        }
                    }
                } else {
                    this.formulasWorker.postMessage({
                        action: 'executeSQliteDB',
                        data: {
                            func: 'editRow',
                            columns: columnName,
                            value: valueChange,
                            condition:
                                'WHERE ' +
                                SQLITE_COLUMN_IDENTIFIER +
                                ' = ' +
                                sqlRowId,
                            keyInstance: this.keyInstance,
                            tableName: this.tableName
                        }
                    });
                }
            }
        }

        this.handlerCheckEffectedControlInTable(
            columnName,
            [rowId],
            currentCol
        );
    }
    /**
     * Hàm check xem cột thay đổi có nằm trong danh sách các cột được thêm vào ở trường hợp group table có cấu hình header
     * @param {*} columnName
     * @returns
     */
    checkInColumnAppend(columnName) {
        let col = columnName;
        col = col.replace('_____', '.');
        if (this.allColumnAppend.includes(col)) {
            return true;
        }
        return false;
    }
    /**
     * Hàm xử lí dữ liệu thay đổi ở cell bởi hệ thống (drag, pas)
     */
    async handleAfterChangeCellBySystem(columnName, startRow, endRow) {
        let currentCol = columnName;
        // nếu trường hợp là bảng group thì cần lấy control tương ứng với cột được binding vào
        if (
            this.values &&
            this.values.length > 0 &&
            this.tableMode == 'Group'
        ) {
            columnName = this.values[0].name;
        }

        let listRowId = [];
        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
            let rowNode = this.getRowNode(rowIndex);
            let rowData = rowNode.data;
            listRowId.push(rowNode.id);
            let sqlRowId = rowData[SQLITE_COLUMN_IDENTIFIER];
            if (
                this.values &&
                this.values.length > 0 &&
                this.tableMode == 'Group'
            ) {
                sqlRowId =
                    rowData[currentCol + '_____' + SQLITE_COLUMN_IDENTIFIER];
            }
            this.formulasWorker.postMessage({
                action: 'executeSQliteDB',
                data: {
                    func: 'editRow',
                    columns: columnName,
                    value: rowData[currentCol],
                    condition:
                        'WHERE ' + SQLITE_COLUMN_IDENTIFIER + ' = ' + sqlRowId,
                    keyInstance: this.keyInstance,
                    tableName: this.tableName
                }
            });
        }
        this.handlerCheckEffectedControlInTable(
            columnName,
            listRowId,
            currentCol
        );
    }
    /**
     * Sau khi thay đổi giá trị 1 cell thì lấy các control bị ảnh hưởng và chạy công thức
     * @param {*} controlName
     * @param {*} rowId
     */
    handlerCheckEffectedControlInTable(
        controlName,
        rowId = null,
        columnName = null,
        options = []
    ) {
        if (controlName == '') {
            return;
        }
        let controlInstance = getControlInstanceFromStore(
            this.keyInstance,
            controlName
        );
        if (controlInstance && controlInstance.checkValidValueLength(rowId)) {
            // chưa xử lý cho checkvalid
            if (controlInstance == null || controlInstance == undefined) {
                return;
            }

            if (controlInstance.checkProps('isDBOnly')) {
                this.handleRunFormulaForControlInTable(
                    controlInstance,
                    controlInstance.controlFormulas.uniqueDB.instance,
                    rowId
                );
            }
            let controlEffected = controlInstance.getEffectedControl();
            let controlRequireEffected =
                controlInstance.getEffectedRequireControl();
            let controlLinkEffected = controlInstance.getEffectedLinkControl();
            let controlValidateEffected =
                controlInstance.getEffectedValidateControl();
            controlRequireEffected[controlName] = true;
            controlValidateEffected[controlName] = true;
            this.handlerRunOtherFormulaControl(
                controlRequireEffected,
                'require',
                rowId,
                columnName
            );
            this.handlerRunOtherFormulaControl(controlLinkEffected, 'linkConfig', rowId, columnName);
            this.handlerRunOtherFormulaControl(
                controlValidateEffected,
                'validate',
                rowId,
                columnName
            );
            this.handlerRunValueFormulaControl(
                controlEffected,
                rowId,
                columnName,
                options
            );
        }
    }
    /**
     * Hàm kiểm tra sự phụ thuộc của công thức link sau khi set data cho trường hợp vừa load form update document
     * @param {*} controlName
     * @param {*} rowId
     * @param {*} columnName
     * @param {*} options
     * @returns
     */
    handleCheckLinkEffectedControlInTable(
        controlName,
        rowId = null,
        columnName = null,
        options = []
    ) {
        if (controlName == '') {
            return;
        }
        let controlInstance = getControlInstanceFromStore(
            this.keyInstance,
            controlName
        );
        if (controlInstance && controlInstance.checkValidValueLength(rowId)) {
            // chưa xử lý cho checkvalid
            if (controlInstance == null || controlInstance == undefined) {
                return;
            }
            let controlLinkEffected = controlInstance.getEffectedLinkControl();
            this.handlerRunOtherFormulaControl(
                controlLinkEffected,
                'linkConfig',
                rowId,
                columnName
            );
        }
    }
    /**
     * Kiểm tra các công thức giá trị bị ảnh hưởng để xem có được chạy công thức hay không
     * @param {*} controlEffected
     * @param {*} rowId
     */
    handlerRunValueFormulaControl(
        controlEffected,
        rowId,
        columnName,
        options = {}
    ) {
        if (Object.keys(controlEffected).length > 0) {
            for (let i in controlEffected) {
                if (
                    options.hasOwnProperty('ignoreControl') &&
                    options['ignoreControl'].includes(i)
                ) {
                    continue;
                }
                let impactedFromTable = options.hasOwnProperty(
                    'impactedFromTable'
                )
                    ? options['impactedFromTable']
                    : null;
                this.handlerCheckCanBeRunFormula(
                    i,
                    rowId,
                    columnName,
                    impactedFromTable
                );
            }
        }
    }
    /**
     * chạy các công thức khác bị ảnh hưởng trong table
     * @param {*} controlEffected
     * @param {*} formulasType
     */
    handlerRunOtherFormulaControl(
        controlEffected,
        formulasType,
        rowId,
        columnName
    ) {
        if (Object.keys(controlEffected).length > 0) {
            for (let i in controlEffected) {
                let controlEffectedInstance = getControlInstanceFromStore(
                    this.keyInstance,
                    i
                );
                let allFormulas = controlEffectedInstance.controlFormulas;
                if (allFormulas.hasOwnProperty(formulasType)) {
                    if (formulasType == 'linkConfig') {
                        // nếu có cấu hình công thức link thì cũng chạy các công thức của nó
                        // let configData = allFormulas[formulasType].configData;
                        // for (let ind = 0; ind < configData.length; ind++) {
                        //     let config = configData[ind];
                        //     let formulasInstance = config.instance;
                        //     let dataInput = this.getDataInputForFormulas(formulasInstance, rowId);
                        //     let fType = formulasType + "_" + config.formula.instance;
                        //     this.handleRunFormulaForControlInTable(controlEffectedInstance, dataInput, formulasInstance, rowId)
                        // }
                    } else {
                        if (
                            allFormulas[formulasType].hasOwnProperty('instance')
                        ) {
                            let formulaInstance =
                                allFormulas[formulasType].instance;
                            if (
                                controlEffectedInstance.hasOwnProperty(
                                    'inTable'
                                )
                            ) {
                                if (
                                    controlEffectedInstance.inTable ==
                                    this.tableName
                                ) {
                                    this.handleRunFormulaForControlInTable(
                                        controlEffectedInstance,
                                        formulaInstance,
                                        rowId,
                                        columnName
                                    );
                                } else {
                                    SYMPER_APP.$evtBus.$emit(
                                        'run-formulas-control-outside-table',
                                        {
                                            formulaInstance: formulaInstance,
                                            controlName: i
                                        }
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * Hàm xử lí kiểm tra control đủ điều kiện chạy công thức hay chưa (checkCanBeBind) và lấy ra formulasInstance để chạy
     * @param {String} control
     */
    handlerCheckCanBeRunFormula(
        controlName,
        rowId,
        columnName,
        impactedFromTable
    ) {
        let controlInstance = getControlInstanceFromStore(
            this.keyInstance,
            controlName
        );
        let sDocumentSubmit = getSDocumentSubmitStore(this.keyInstance);
        if (
            checkCanBeBind(
                this.keyInstance,
                controlName,
                '',
                impactedFromTable,
                columnName
            ) && (!controlInstance.checkProps('isRunFormulaManually') || sDocumentSubmit.isRunningAllFormulaManually)
        ) {
            if (controlInstance.controlFormulas.hasOwnProperty('formulas')) {
                let formulaInstance =
                    controlInstance.controlFormulas['formulas'].instance;
                if (
                    controlInstance.type != 'table' &&
                    controlInstance.inTable != false
                ) {
                    if (controlInstance.inTable == this.tableName) {
                        this.handleRunFormulaForControlInTable(
                            controlInstance,
                            formulaInstance,
                            rowId
                        );
                        return;
                    }
                } else {
                    SYMPER_APP.$evtBus.$emit(
                        'run-formulas-control-outside-table',
                        {
                            formulaInstance: formulaInstance,
                            controlName: controlName
                        }
                    );
                }
            }
        }
    }

    /**
     * trường hợp bảng đưa giá trị lên group mà công thức cần giá trị cho cột nào đó thì cần lấy giá trị tương ứng
     * @param {*} formulaInstance
     * @param {*} columnGroupName
     */
    getDataInputFromGroupTable(listInput, formulaInstance) {
        let columnGroupName = this.dataChange['columnName'];
        let currentRowData = this.dataChange['currentRowData'];
        let extraData = {};
        let inputControl = formulaInstance.getInputControl();
        for (let inputControlName in inputControl) {
            if (listInput.hasOwnProperty(inputControlName)) {
                let controlIns = listInput[inputControlName];
                if (controlIns.inTable == this.tableName && currentRowData) {
                    if (currentRowData[inputControlName]) {
                        extraData[inputControlName] =
                            currentRowData[inputControlName];
                    } else if (
                        this.values.length > 0 &&
                        this.values[0].name == inputControlName
                    ) {
                        extraData[inputControlName] =
                            currentRowData[columnGroupName];
                    } else if (
                        this.cols.length > 0 &&
                        this.cols[0].name == inputControlName
                    ) {
                        let colData = columnGroupName.replace('_____', '.');
                        extraData[inputControlName] = colData;
                    }
                }
            }
        }
        return extraData;
    }
    /**
     * Hàm xử lí chạy công thức theo cột trong bảng
     * @param {*} controlEffectedInstance   Object của 1 control bị ảnh hưởng
     * @param {*} dataInput    dữ liệu đầu vào cho công  thức
     * @param {*} formulaInstance  Object cua formulas giá trị của control bị ảnh hưởng
     * @param {*} controlInstance  control đang chạy công thức
     *
     */
    handleRunFormulaForControlInTable(
        controlInstance,
        formulaInstance,
        rowId = null,
        columnName = null,
        otherDataInput = {}
    ) {
        let listInput = getListInputInDocument(this.keyInstance);
        // trường hợp bảng group thì cần lấy data input của control đầu vào tương ứng
        let extraData = {};
        if (this.tableMode == 'Group' && Number(rowId) >= 0) {
            extraData = this.getDataInputFromGroupTable(
                listInput,
                formulaInstance
            );
        }
        let optionalDataBinding =
            sDocument.state.submit[this.keyInstance].optionalDataBinding;
        let rowIds = typeof rowId == 'object' ? rowId : [rowId];
        let dataInput = getDataInputFormula(
            formulaInstance,
            listInput,
            optionalDataBinding,
            rowIds,
            extraData,
            controlInstance.name
        );
        if (Object.keys(otherDataInput).length > 0) {
            dataInput = { ...dataInput, ...otherDataInput };
        }

        if (typeof rowId != 'object' && Number(rowId) >= 0) {
            let dataInputAll = prepareDataForRun(
                dataInput,
                rowId,
                listInput,
                formulaInstance,
                controlInstance.name
            );
            this.handleRunFormulaOnRow(
                controlInstance,
                dataInputAll,
                formulaInstance,
                rowId,
                columnName
            );
        } else if (rowId == 'all') {
            let rowNodeId = this.getAllRowNodeId();
            let dataInputAll = prepareDataForRun(
                dataInput,
                rowNodeId,
                listInput,
                formulaInstance,
                controlInstance.name
            );
            this.handleRunFormulaOnColumn(
                controlInstance,
                formulaInstance,
                dataInputAll,
                rowNodeId
            );
        } else {
            let dataInputAll = prepareDataForRun(
                dataInput,
                rowId,
                listInput,
                formulaInstance,
                controlInstance.name
            );
            this.handleRunFormulaOnColumn(
                controlInstance,
                formulaInstance,
                dataInputAll,
                rowId
            );
        }
    }
    //xử lý copy paste trong group table
    handlePasteGroupTable(forcusCellIndex, copyArray) {
        let rowGroup = this.getRowNode(forcusCellIndex);
        let childIndexFocus = rowGroup.childIndex; // index children của cell focus trong group
        let allLeafChildren = rowGroup.parent.allLeafChildren.length; // tổng con của group
        if (allLeafChildren - childIndexFocus < copyArray.length) {
            for (
                var i = childIndexFocus;
                i < copyArray.length + childIndexFocus;
                i++
            ) {
                if (i >= allLeafChildren) {
                    let lastColGroup = rowGroup.parent.field;
                    let groupedColumns = this.getGroupedColumns(lastColGroup);
                    let rowData = this.getRowDefaultData()[0];
                    let index = 0;
                    for (let controlName in rowData) {
                        if (controlName.indexOf('s_table_id_sql_lite') != -1) {
                            rowData[controlName] = Date.now() + index;
                        }
                        if (controlName.indexOf('childObjectId') != -1) {
                            rowData[controlName] = '';
                        }
                        if (controlName == lastColGroup) {
                            rowData[controlName] = rowGroup.data[lastColGroup];
                        }
                        if (!groupedColumns.includes(controlName)) {
                            // set giá trị không phải group thành rỗng
                            rowData[controlName] = '';
                        }
                        index++;
                    }
                    let rowGroupIndex = Number(
                        rowGroup.parent.allLeafChildren[
                            rowGroup.parent.allChildrenCount - 1
                        ].id
                    );
                    this.addNewRow([rowData], rowGroupIndex + 1, true);
                }
            }
        }
    }
    // hàm tìm rowData cho dòng group trong group table
    getRowDataFromGroupRow(rowId) {
        let rowData = this.getDataByRowId(rowId);
        return rowData;
    }
    /**
     * Hàm xử lí chạy công thức theo từng dòng trong bảng
     * @param {*} controlEffectedInstance   Object của 1 control bị ảnh hưởng
     * @param {*} dataInput    dữ liệu đầu vào cho công  thức
     * @param {*} formulasInstance  Object cua formulas giá trị của control bị ảnh hưởng
     * @param {*} controlInstance  control đang chạy công thức
     *
     */
    handleRunFormulaOnRow(
        controlInstance,
        dataInput,
        formulaInstance,
        rowId,
        columnName
    ) {
        this.formulasWorker.postMessage({
            action: 'runFormula',
            data: {
                formulaInstance: formulaInstance,
                keyInstance: this.keyInstance,
                controlName: controlInstance.name,
                rowNodeId: rowId,
                dataInput: dataInput,
                columnName: columnName
            }
        });
    }
    handleRunFormulaOnColumn(
        controlInstance,
        formulaInstance,
        dataInput,
        rowNodeId
    ) {
        this.formulasWorker.postMessage({
            action: 'runFormula',
            data: {
                formulaInstance: formulaInstance,
                controlName: controlInstance.name,
                keyInstance: this.keyInstance,
                rowNodeId: rowNodeId,
                controlType: controlInstance.type,
                runOnColumn: true,
                dataInput: dataInput
            }
        });
    }

    /**
     * Xử lí data sau khi chạy công thức
     * @param {*} res
     * @param {*} formulasType
     * @param {*} controlInstance
     * @param {*} dataRowId
     * @param {*} from
     */
    afterRunFormula(
        res,
        formulasType,
        controlInstance,
        rowNodeId,
        isMultiple = false
    ) {
        if (Number(rowNodeId) >= 0 && !isMultiple) {
            this.prepareDataAfterRunFormulaOnRow(
                res,
                formulasType,
                controlInstance,
                rowNodeId
            );
        } else {
            this.prepareDataAfterRunFormulaOnColumn(
                res,
                formulasType,
                controlInstance,
                rowNodeId
            );
        }
    }
    /**
     * Xử lí data sau khi chạy công thức theo dòng
     * data gửi lên từ worker
     * @param {*} res
     * @param {*} formulasType
     * @param {*} controlInstance
     * @param {*} sqlRowId
     */
    prepareDataAfterRunFormulaOnRow(
        res,
        formulasType,
        controlInstance,
        rowNodeId
    ) {
        if (res == undefined || !res.hasOwnProperty('data')) {
            return;
        }
        let value = minimizeDataAfterRunFormula(res);
        if (
            ['validate', 'require', 'requireChange', 'uniqueDB'].includes(
                formulasType
            )
        ) {
            let newValue = {};
            newValue[rowNodeId] = value;
            value = newValue;
        }
        this.handleDataAfterRunFormula(value, controlInstance, formulasType, [
            rowNodeId
        ]);
    }
    /**
     * Xử lí data sau khi chạy công thức theo cột
     * data gửi lên từ worker
     * @param {*} res
     * @param {*} formulasType
     * @param {*} controlInstance
     * @param {*} sqlRowId
     */
    prepareDataAfterRunFormulaOnColumn(
        res,
        formulasType,
        controlInstance,
        listIdRow
    ) {
        if (res == undefined || !res.hasOwnProperty('data')) {
            return;
        }
        this.handleDataAfterRunFormula(
            res.data.data,
            controlInstance,
            formulasType,
            listIdRow
        );
    }
    /**
     * Hàm xử lí dữ liệu sau khi chạy xong công thức của 1 cột, -> set data cho cột đó -> chạy công thức cho các control ngoài bảng bị ảnh hưởng
     * @param {Object} data
     * @param {String} controlEffectedName
     */
    handleDataAfterRunFormula(
        data,
        controlInstance,
        formulasType,
        rowNodeId = null
    ) {
        if (formulasType.includes('linkConfig')) {
            controlInstance.handlerDataAfterRunFormulasLink(data, formulasType);
        }
        switch (formulasType) {
            case 'formulas':
                controlInstance.handlerDataAfterRunFormulasValue(
                    data,
                    rowNodeId
                );
                break;
            case 'validate':
                controlInstance.handlerDataAfterRunFormulasValidate(data);
                break;
            case 'require':
                controlInstance.handlerDataAfterRunFormulasRequire(data);
                break;
            case 'requireChange':
                controlInstance.handlerDataAfterRunFormulasRequireChange(data);
                break;
            case 'hidden':
                controlInstance.handlerDataAfterRunFormulasHidden(data);
                break;
            case 'readOnly':
                controlInstance.handlerDataAfterRunFormulasReadonly(data);
                break;
            case 'uniqueDB':
                controlInstance.handlerDataAfterRunFormulasUniqueDB(data);
                break;
            case 'activeManualLocation':
                controlInstance.handlerDataAfterRunFormulasActiveManualLocation(data);
                break;
            case 'activeAutomaticLocation':
                controlInstance.handlerDataAfterRunFormulasActiveAutomaticLocation(data);
                break;
            case 'minDate':
                controlInstance.handlerDataAfterRunFormulasMinDate(data);
                break;
            case 'maxDate':
                controlInstance.handlerDataAfterRunFormulasMaxDate(data);
                break;
            default:
                break;
        }
    }
    /**
     * Kiểm tra dữ liệu của cell sau khi sửa đã tồn tại trong cột đó hay chưa ( trường hợp được tích duy nhất trong table)
     * @param {*} controlIns
     * @param {*} currentValue
     * @param {*} nodeId
     */
    checkUniqueTable(controlIns, currentValue, nodeId, rowIndex) {
        let colData = this.getColData(controlIns.name);
        let rowDuplicate = false;
        for (let index = 0; index < colData.length; index++) {
            const element = colData[index];
            if (currentValue === element && index != rowIndex) {
                rowDuplicate = true;
                break;
            }
        }
        if (rowDuplicate) {
            controlIns.valueValidation['UniqueTable'][nodeId] = {
                msg:
                SYMPER_APP.$t('v2.doc.data')  +
                    currentValue +
                    SYMPER_APP.$t('v2.doc.alreadyExistInDatabaseInColumn')  +
                    controlIns.title,
                isValid: true
            };
        } else {
            controlIns.valueValidation['UniqueTable'][nodeId] = {
                msg: '',
                isValid: false
            };
        }
        this.refreshCells(controlIns.name, [nodeId]);
    }

    show() {
        this.tableContainer.style.maxHeight = 'unset';
        this.tableContainer.style.opacity = '1';
    }
    hide() {
        this.tableContainer.style.opacity = '0';
        this.tableContainer.style.maxHeight = '0';
    }
    setStyleHighlight(data) {
        this.styleForControl.highlight = data;
        this.redrawRows();
    }
    setStyleFocusHighlight(data) {
        this.styleForControl.focusHighlight = data;
        this.redrawRows();
    }
    setStyle(data) {
        this.styleForControl = data;
        // let allData = this.getAllData();
        // this.gridOptions.api.setRowData(allData);
        this.redrawRows();
    }
    /**
     * Hàm thêm class thay đổi backgroud cho header của table
     * @param {*} colName tên cột
     * @param {*} className class cần thêm
     * @param {*} isRemove xóa class hay ko
     */
    traceInputTable() {}
    /**
     * Hàm search table
     */
    onSearchTable(value) {
        this.gridOptions.api.setQuickFilter(value);
    }
    onResetColumns() {
        this.gridOptions.columnApi.resetColumnState();
    }
    onExportExcel() {
        this.gridOptions.api.exportDataAsExcel();
    }
    onExpandAll() {
        this.gridOptions.api.expandAll();
    }
    onCollapseAll() {
        this.gridOptions.api.collapseAll();
    }
    onAutoSizeAll(){
        const allColumnIds = [];
        this.gridOptions.columnApi.getAllDisplayedColumns().forEach((column) => {
            allColumnIds.push(column.getId());
        });
        this.gridOptions.columnApi.autoSizeColumns(allColumnIds, false);
    }
    onSizeColumnsToFit(){
        this.gridOptions.api.sizeColumnsToFit();
    }
}

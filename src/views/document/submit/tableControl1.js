import Control from './control';
import sDocument from '@/store/document';
import store from '@/store';
import { SYMPER_APP } from '@/main.js';
import SymperTable from './table1';
import { getControlInstanceFromStore } from '../common/common';
import _isEmpty from 'lodash/isEmpty';
window.switchTableMode = function (el) {
    // let tableName = $(el).attr('table-name');
    // let viewType = $(el).attr('view-type');
    // let thisListItem = null;
    // if (viewType == 'detail') {
    //     thisListItem = util.getClosestVueInstanceFromDom(el, 'detailDocument');
    // } else if (viewType == 'submit') {
    //     thisListItem = util.getClosestVueInstanceFromDom(el, 'submitDocument');
    // }
    // if (thisListItem) {
    //     thisListItem.$evtBus.$emit('on-switch-pivot-table-mode', { tableName: tableName })
    // }
};
window.traceTable = function (el) {
    SYMPER_APP.$evtBus.$emit('document-submit-show-trace-control', {
        isTable: true,
        tableName: $(el).attr('table-name'),
    });
};
window.wrapTable = function (el) {
    let tableName = $(el).attr('table-name');
    let keyInstance = $(el).attr('instance');
    let tableControl = getControlInstanceFromStore(keyInstance, tableName);
    // tableControl.tableInstance.refreshTable(true)
};
export default class TableControl1 extends Control {
    constructor(
        idField,
        ele,
        controlProps,
        keyInstance,
        pivotConfig = {},
        groupConfig = {},
        matchingItems = {},
        isPrintView = false,
    ) {
        super(idField, ele, controlProps, keyInstance);
        /**
         * Chứa instance của table, mặc địn là null, control có type là table mới khác null
         */
        this.pivotConfig = pivotConfig;
        this.groupConfig = groupConfig;
        this.matchingItems = matchingItems;
        this.tableInstance = null;
        this.tablePrint = null;
        this.isPrintView = isPrintView;
        /**
         * tên các control nằm trong control này, mặc định là null, nếu control là table thì mới có giá trị là {'tên control':true}
         */
        this.controlInTable = {};
        this.tableMode = this.getTableMode();
        this.formulasWorker = null;
        this.expandTable = false
        this.init();
        this.ele.wrap(
            '<div><span style="position:relative;display: block;" class="wrap-table"></div>',
        );
    }
    getTableMode() {
        let tableMode = this.controlProperties.tableView.value;
        if (typeof tableMode == 'object') {
            tableMode = 'Flat';
        }
        return tableMode;
    }
    renderTable() {
        this.tableInstance = new SymperTable(
            this,
            this.keyInstance,
            this.groupConfig,
            this.pivotConfig,
            this.matchingItems,
            this.formulasWorker,
        );
        let viewType = sDocument.state.viewType[this.keyInstance];
        const self = this;
        // this.ele.parent().append('<span onclick="wrapTable(this)" table-name="' + this.name + '" instance="' + this.keyInstance + '" class="mdi mdi-format-text-wrapping-wrap  icon-options icon-wrap-table"></span>');
        if (viewType == 'submit' || viewType == 'update') {
            if (!_isEmpty(this.matchingItems)) {
                let div = `<div table-name=${this.name} class="matching-item d-flex justify-space-between align-center px-2">
                <span class="fw-500 fs-13 matching-item-name" >${SYMPER_APP.$t('document.editor.matchingItem.table_distribute')}</span>
                <span  class="matching-item-btn py-1 px-3">${SYMPER_APP.$t('document.editor.matchingItem.distribute')}</span>
                </div>`
                this.ele
                    .parent()
                    .prepend(div)
                $('[table-name=' + this.name + ']').on('click', function (e) {
                    SYMPER_APP.$evtBus.$emit('document-submit-show-matching-item', {
                        tableName: self.name,
                    });
                })
            }
        }
        if(!this.isPrintView){
            this.renderMenubarTable();
        }

        if (this.isPrintView) {
            this.ele.attr('table-id', this.ele.attr('id'));
            this.ele.removeAttr('id');
            this.ele.find('table').addClass('table-print');
            // this.ele.find('table tbody').empty();
        } else {
            this.tableInstance.render();
            if (
                this.controlProperties['isHidden'] != undefined &&
                this.checkProps('isHidden')
            ) {
                this.ele.closest('.wrap-table').css({ display: 'none' });
            }
            this.ele.detach().hide();
        }
    }
    renderMenubarTable(){
        let viewType = sDocument.state.viewType[this.keyInstance];
        let self = this;
        let tableOption = `<div class="title-table d-none" table-name="`+self.name+`">
            <span>${self.title}</span>
            <button class="close-expand-table icon-options-table">
                <i class="mdi mdi-close"></i>
                <span class="tooltiptext">${SYMPER_APP.$t('v2.doc.collapseTable')}</span>
            </button>
            </div>
        `
            this.ele.parent().on('click','.close-expand-table', function (e) {
                self.expandOrCollapseTable(e, false, viewType)
            });
        tableOption += `<div class="menubar-control-table" table-name="`+self.name+`">
            <div class="search-table">
                <i class="mdi mdi-magnify"></i>
                <input
                    type="text"
                    placeholder="${SYMPER_APP.$t('v2.doc.search')}"
                />
            </div>
            <span style="line-height: 31px;">
        `
            this.ele.parent().on('input','.menubar-control-table .search-table input', function (e) {
                self.tableInstance.onSearchTable($(this).val());
            });
        tableOption = this.renderButtonResizeTable(tableOption, viewType);
        if (this.checkProps('isRunFormulaManually') && viewType != 'detail') {
            tableOption += `
            <button class="icon-options-table button-run-formula-manually-control-table" control-name="`+self.name+`">
                <i class="mdi mdi-refresh document-submit-button-run-formula-manually"></i>
                <span style="font-weight: 500;">${SYMPER_APP.$t('v2.doc.refresh')}</span>
            </button>
            `
            this.ele.parent().on('click','.icon-options-table.button-run-formula-manually-control-table', function (e) {
                SYMPER_APP.$evtBus.$emit('document-submit-run-formula-manually-control-click', {
                        controlName: self.name
                });
            });
        }
        if(viewType != 'detail' && self.tableInstance.tableControl.isInsertRow() && !self.tableInstance.checkTableReadOnly()){
            tableOption += `
                <button class="icon-options-table add-row-after">
                    <i class="mdi mdi-table-row-plus-after"></i>
                    <span class="tooltiptext">${SYMPER_APP.$t('v2.doc.addNewRowAfter')}</span>
                </button>
                <button class="icon-options-table add-row-before">
                    <i class="mdi mdi-table-row-plus-before"></i>
                    <span class="tooltiptext">${SYMPER_APP.$t('v2.doc.addNewRowBefore')}</span>
                </button>
                <button class="icon-options-table delete-row disabled">
                    <i class="mdi mdi-table-row-remove"></i>
                    <span class="tooltiptext">${SYMPER_APP.$t('v2.doc.deleteRowSelection')}</span>
                </button>
            `
            this.ele.parent().on('click','.icon-options-table.add-row-after', function (e) {
                if(self.tableInstance.getCellRanges().length > 0){
                    self.tableInstance.onAddNewRowAfter({node:self.tableInstance.getRowNode(self.tableInstance.getCellRanges()[0].endRow.rowIndex)});
                }
            });
            this.ele.parent().on('click','.icon-options-table.add-row-before', function (e) {
                if(self.tableInstance.getCellRanges().length > 0){
                    self.tableInstance.onAddNewRowBefore({node:self.tableInstance.getRowNode(self.tableInstance.getCellRanges()[0].endRow.rowIndex)});
                }
            });
            this.ele.parent().on('click','.icon-options-table.delete-row', function (e) {
                if(self.tableInstance.getCellRanges().length > 0){
                    let data = {
                        node : self.tableInstance.getRowNode(self.tableInstance.getCellRanges()[0].endRow.rowIndex),
                        api: self.tableInstance.getRowNode(self.tableInstance.getCellRanges()[0].endRow.rowIndex).gridApi
                    }
                    self.tableInstance.onDeleteRowSelection(data);
                }
            });
        }
        tableOption += `
            <button class="icon-options-table auto-size-all">
                <i class="mdi mdi-arrow-split-vertical"></i>
                <span class="tooltiptext">${SYMPER_APP.$t('v2.doc.autoSizeAll')}</span>
            </button>
        `
            this.ele.parent().on('click','.icon-options-table.auto-size-all', function (e) {
                self.tableInstance.onAutoSizeAll();
            });
        if (store.state.app.baInfo && store.state.app.baInfo.id && viewType != 'detail') {
            tableOption += `
                    <button onclick="traceTable(this)" table-name="` +
                        this.name +
                        '" instance="' +
                        this.keyInstance +
                        `" class="icon-options-table icon-trace-table">
                        <i class="mdi mdi-information-outline"></i>
                        <span class="tooltiptext">${SYMPER_APP.$t('v2.doc.infor')}</span>
                    </button>
            `
        }
        tableOption += ` 
            <button class="icon-options-table more-action">
                <i class="mdi mdi-dots-vertical"></i>
                <span class="tooltiptext">${SYMPER_APP.$t('v2.doc.add')}</span>
                <div class="more-action-table" table-name="`+self.name+`">
        `
        if(self.tableMode == 'Group'){
            tableOption += `
            <div class="action-table expand-all">
                <i class="mdi mdi-arrow-expand-vertical"></i>
                <span>${SYMPER_APP.$t('v2.doc.expandAll')}</span>
            </div>
            <div class="action-table collapse-all">
                <i class="mdi mdi-arrow-collapse-vertical"></i>
                <span>${SYMPER_APP.$t('v2.doc.contractAll')}</span>
            </div>
            `
        }
        if(viewType != 'detail' && self.tableInstance.tableControl.isInsertRow() && !self.tableInstance.checkTableReadOnly()){
            tableOption += `
            <div class="action-table delete-range-selection">
                <i class="mdi mdi-vector-square-remove"></i>
                <span>${SYMPER_APP.$t('v2.doc.deleteRowRangeSelection')}</span>
            </div>
            `  
        }
        tableOption += `
                <div class="action-table reset-columns">
                    <i class="mdi mdi-autorenew"></i>
                    <span>${SYMPER_APP.$t('v2.doc.resetColumns')}</span>
                </div>
                <div class="action-table export-excell">
                    <i class="mdi mdi-file-excel-box-outline"></i>
                    <span>${SYMPER_APP.$t('v2.doc.excelExport')}</span>
                </div>                
            </div>
            </button>
        `
        tableOption += `</span></div>`

        this.ele.parent().on('click','.icon-options-table.more-action', function (e) {
            let menu = $(e.target).parent().find('.more-action-table')
            if(menu.hasClass('d-block')){
                menu.removeClass('d-block')
            }else {
                menu.addClass('d-block')
            }
        });
        this.ele.parent().on('click','.action-table', function (e) {
            $(e.target).closest(".more-action-table").removeClass("d-block")
            if($(e.target).closest('.expand-all').length>0){
                self.tableInstance.onExpandAll();
            }
            if($(e.target).closest('.collapse-all').length>0){
                self.tableInstance.onCollapseAll();
            }
            if($(e.target).closest('.delete-range-selection').length>0){
                if(self.tableInstance.getCellRanges().length > 0){
                    let data = {
                        node : self.tableInstance.getRowNode(self.tableInstance.getCellRanges()[0].endRow.rowIndex),
                        api: self.tableInstance.getRowNode(self.tableInstance.getCellRanges()[0].endRow.rowIndex).gridApi
                    }
                    self.tableInstance.onDeleteRowRangeSelection(data);
                }
            }
            if($(e.target).closest('.reset-columns').length>0){
                self.tableInstance.onResetColumns();
            }
            if($(e.target).closest('.export-excell').length>0){
                self.tableInstance.onExportExcel();
            }

        });
        this.ele.parent().prepend(tableOption)
    }
    renderButtonResizeTable(tableOption, viewType){
        let self = this;
        tableOption += `
            <button class="icon-options-table button-expand-table">
                <i class="mdi mdi-arrow-expand-all"></i>
                <span class="tooltiptext"">${SYMPER_APP.$t('v2.doc.expandTable')}</span>
            </button>
            `
        this.ele.parent().on('click','.icon-options-table.button-expand-table', function (e) {
            self.expandOrCollapseTable(e, true, viewType)
            if($(e.target).closest('.wrap-table').find('.ag-header-container')[0].clientWidth < $(e.target).closest('.wrap-table').find('.ag-header-viewport')[0].clientWidth){
                self.tableInstance.onSizeColumnsToFit();
            }
        });
        tableOption += `
            <button class="icon-options-table button-collapse-table d-none">
                <i class="mdi mdi-arrow-collapse-all"></i>
                <span class="tooltiptext"">${SYMPER_APP.$t('v2.doc.collapseTable')}</span>
            </button>
            `
        this.ele.parent().on('click','.icon-options-table.button-collapse-table', function (e) {
            self.expandOrCollapseTable(e, false, viewType)
        });
        return tableOption
    }
    expandOrCollapseTable(e, isExpand = true, viewType){
        if(isExpand){
            $(e.target).closest('.wrap-table').parent().addClass('document-expand-table')
            $(e.target).closest('.wrap-table').find('.button-expand-table').addClass('d-none')
            $(e.target).closest('.wrap-table').find('.button-collapse-table').removeClass('d-none')
            $(e.target).closest('.wrap-table').find('.title-table').removeClass('d-none')
            if ($('.symper-view-side-by-side').length > 0){
                $('.symper-view-side-by-side').css({
                    'position': 'fixed',
                    'width': '100%'
                });
            }else {
                if(viewType == 'detail'){
                    $('.wrap-content-detail').css({
                        'position': 'fixed',
                        'top': '0px',
                        'left': '0px'
                    });                
                }else {
                    $('.wrap-content-submit').css({
                        'position': 'fixed',
                        'top': '0px',
                        'left': '0px'
                    });
                }
            }
        }else {
            if ($('.symper-view-side-by-side').length > 0){
                $('.symper-view-side-by-side').css({
                    'position': 'absolute',
                    'width': '850px'
                });
            }else {
                if(viewType == 'detail'){
                    $('.wrap-content-detail').css({
                        'position': 'unset'
                    });
                }else {
                    $('.wrap-content-submit').css({
                        'position': 'unset'
                    });
                }
            }
            $(e.target).closest('.wrap-table').parent().removeClass('document-expand-table')
            $(e.target).closest('.wrap-table').find('.button-collapse-table').addClass('d-none')
            $(e.target).closest('.wrap-table').find('.button-expand-table').removeClass('d-none')
            $(e.target).closest('.wrap-table').find('.title-table').addClass('d-none')
        }
        this.expandTable = isExpand
        this.tableInstance.caculatorHeight();
    }
    setFormulasWorker(worker) {
        this.formulasWorker = worker;
    }
    /**
     * Hàm set data cho handson table, cho trường hợp viewdetail đã có data
     * @param {*} data
     */
    setData(data) {
        if (Object.keys(data).length == 0) {
            return;
        }
        if (
            data.hasOwnProperty('childObjectId') &&
            Object.keys(data).length == 1
        ) {
        }
        if (this.isPrintView) {
            let styleControl = [];
            let dataTablePrint = [];
            for (let controlName in this.controlInTable) {
                let dataControl = data[controlName];
                let controlIns = this.controlInTable[controlName];
                let controlId = this.controlInTable[controlName].id;
                let style = $('#' + controlId)[0].style.cssText;
                if (dataControl) {
                    for (let index = 0; index < dataControl.length; index++) {
                        if (dataTablePrint.length <= index) {
                            dataTablePrint.push([]);
                            styleControl.push([]);
                        }
                        let row = dataControl[index];
                        if (controlIns.type == 'number') {
                            row = controlIns.formatNumberValue(row);
                        }
                        dataTablePrint[index].push(row);
                        styleControl[index].push(style);
                    }
                }
            }

            let bodyHtml = '';
            for (let index = 0; index < dataTablePrint.length; index++) {
                const rowData = dataTablePrint[index];
                let tr = '<tr>';
                for (let j = 0; j < rowData.length; j++) {
                    let cellData = rowData[j];
                    if (cellData == null || cellData == undefined) {
                        cellData = '';
                    }
                    tr +=
                        '<td style="' +
                        styleControl[index][j] +
                        '">' +
                        cellData +
                        '</td>';
                }
                tr += '</tr>';
                bodyHtml += tr;
            }
            this.ele.find('table tbody').empty();
            this.ele.find('table tbody').append(bodyHtml);
            this.ele.find('table').attr('contenteditable', 'false');
        } else {
            let dataTable = [];
            let rowLength = data[Object.keys(data)[0]].length;
            for (let index = 0; index < rowLength; index++) {
                let rowData = {};
                for (let i = 0; i < Object.keys(data).length; i++) {
                    let key = Object.keys(data)[i];
                    rowData[key] = data[key][index];
                }
                dataTable.push(rowData);
            }
            this.tableInstance.setData(dataTable);
            if (this.currentDataStore.docStatus == 'init') {
                this.defaultValue = data;
            }
        }
    }
    isInsertRow() {
        return this.controlProperties.isInsertRow.value;
    }
    isWrapText() {
        return this.controlProperties.tableWrapText.value;
    }
    getPrimaryKey() {
        let primaryKey = this.controlProperties.tablePrimaryKey.value;
        if (typeof primaryKey == 'object') {
            return false;
        }
        return this.controlProperties.tablePrimaryKey.value;
    }
    getAllControlKeyCache() {
        let listControlKeyCache = [];
        for (let controlName in this.controlInTable) {
            let controlIns = this.controlInTable[controlName];
            if (controlIns.isKeyCacheInTable()) {
                listControlKeyCache.push(controlIns.name);
            }
        }
        return listControlKeyCache;
    }
    destroyed(){
        $('[table-name=' + this.name + ']').off('click')
        this.ele.parent().off('click','.icon-options-table.button-run-formula-manually-control-table')
        this.ele.parent().off('click','.icon-options-table.add-row-after')
        this.ele.parent().off('click','.icon-options-table.add-row-before')
        this.ele.parent().off('click','.icon-options-table.delete-row')
        this.ele.parent().off('click','.icon-options-table.auto-size-all')
        this.ele.parent().off('click','.action-table')
        this.ele.parent().off('click','.icon-options-table.more-action')
        this.ele.parent().off('click','.icon-options-table.button-expand-table')
        this.ele.parent().off('click','.icon-options-table.button-collapse-table')
    }
}

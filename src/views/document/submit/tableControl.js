import Control from './control';
import { util } from '@/plugins/util.js';
import sDocument from './../../../store/document';
import PivotTable from './pivot-table';
import GroupTable from './GroupTable';
import { SYMPER_APP } from './../../../main.js';
window.switchTableMode = function (el) {
    let tableName = $(el).attr('table-name');
    let viewType = $(el).attr('view-type');
    let thisListItem = null;
    if (viewType == 'detail') {
        thisListItem = util.getClosestVueInstanceFromDom(el, 'detailDocument');
    } else if (viewType == 'submit') {
        thisListItem = util.getClosestVueInstanceFromDom(el, 'submitDocument');
    }
    if (thisListItem) {
        thisListItem.$evtBus.$emit('on-switch-pivot-table-mode', {
            tableName: tableName,
        });
    }
};
window.viewTable = function (el) {
    SYMPER_APP.$evtBus.$emit('document-submit-show-trace-control', {
        isTable: true,
        tableName: $(el).attr('table-name'),
    });
};
export default class TableControl extends Control {
    constructor(idField, ele, controlProps, keyInstance) {
        super(idField, ele, controlProps, keyInstance);
    }
    initTableControl(isPrintView = false) {
        this.init();
        /**
         * Chứa instance của table, mặc địn là null, control có type là table mới khác null
         */
        this.tableInstance = null;
        this.tablePrint = null;
        this.agDataTable = null;
        this.isPrintView = isPrintView;
        /**
         * tên các control nằm trong control này, mặc định là null, nếu control là table thì mới có giá trị là {'tên control':true}
         */
        this.listInsideControls = null;
        this.controlInTable = {};
        this.mapControlToIndex = {};
        this.tableMode = this.controlProperties.tableView.value;
        this.ele.wrap(
            '<span style="position:relative;display: block;" class="wrap-table">',
        );
    }
    setPivotTableConfig(config) {
        if (this.tableMode == 'Pivot') {
            this.pivotTableConfig = config;
            this.agDataTable = new PivotTable(
                this,
                this.name,
                this.id,
                this.pivotTableConfig,
                this.keyInstance,
            );
        }
    }
    setGroupTableConfig(config) {
        if (this.tableMode == 'Group') {
            this.groupTableConfig = config;
            this.agDataTable = new GroupTable(
                this,
                this.name,
                this.id,
                this.groupTableConfig,
                this.keyInstance,
            );
        }
    }
    renderInfoButtonInRow(linkControl) {
        if (linkControl) {
            let allControlHasLink = Object.keys(linkControl);
            for (let index = 0; index < allControlHasLink.length; index++) {
                let controlLink = allControlHasLink[index];
                if (
                    Object.keys(this.listInsideControls).includes(controlLink)
                ) {
                    let listLinkInCol = linkControl[controlLink];
                    let curColIndex =
                        this.tableInstance.colName2Idx[controlLink];
                    for (let key in listLinkInCol) {
                        let rowIdx = key.replace(/linkConfig_(.+)_/g, '');
                        rowIdx = Number(rowIdx);
                        let cellPos = rowIdx + '_' + curColIndex;
                        this.tableInstance.addToValueMap(cellPos, {
                            type: 'linkControl',
                        });
                    }
                }
            }
        }
    }
    renderTable() {
        let viewType = sDocument.state.viewType[this.keyInstance];
        if (
            (viewType == 'submit' || viewType == 'update') &&
            !this.agDataTable
        ) {
            this.ele
                .parent()
                .append(
                    '<span onclick="viewTable(this)" table-name="' +
                        this.name +
                        '" instance="' +
                        this.keyInstance +
                        '" class="mdi mdi-information-outline icon-trace-table"></span>',
                );
        }
        if (this.isPrintView) {
            if (this.agDataTable) {
                this.agDataTable.render();
            } else {
                this.ele.attr('table-id', this.ele.attr('id'));
                this.ele.removeAttr('id');
                this.ele.find('table').addClass('table-print');
                this.ele.find('table tbody').empty();
                this.tablePrint.render();
            }
        } else {
            this.tableInstance.render();
            if (this.agDataTable) {
                this.agDataTable.render();
                if (this.tableMode == 'Pivot') {
                    let switchTableButton = $(
                        `<button onclick="switchTableMode(this)" view-type="` +
                            viewType +
                            `" table-name="` +
                            this.name +
                            `" class="swap-table-btn"><span class="mdi mdi-swap-horizontal"></button>`,
                    )[0];
                    this.ele.before(switchTableButton);
                }
                this.switchTable();
            }
            if (
                this.controlProperties['isHidden'] != undefined &&
                this.checkProps('isHidden')
            ) {
                this.ele.closest('.wrap-table').css({ display: 'none' });
            }
            this.ele.detach().hide();
        }
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
            if (this.tableInstance.tableInstance) {
                this.tableInstance.tableInstance.updateSettings({
                    data: [[]],
                });
                this.tableInstance.tableInstance.render();
            }
        }
        if (this.isPrintView) {
            let dataTablePrint = [];
            for (let controlName in this.mapControlToIndex) {
                let dataControl = data[controlName];
                let controlIns = this.controlInTable[controlName];
                for (let index = 0; index < dataControl.length; index++) {
                    if (dataTablePrint.length <= index) {
                        dataTablePrint.push([]);
                    }
                    let row = dataControl[index];
                    if (controlIns.type == 'number') {
                        row = controlIns.formatNumberValue(row);
                    }
                    dataTablePrint[index].push(row);
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
                    tr += '<td>' + cellData + '</td>';
                }
                tr += '</tr>';
                bodyHtml += tr;
            }
            if (!this.agDataTable) {
                this.ele.find('table tbody').append(bodyHtml);
                this.ele.find('table').attr('contenteditable', 'false');
            }
            let dataTable = [];
            let rowLength = data[Object.keys(data)[0]].length;
            for (let index = 0; index < rowLength; index++) {
                let rowData = {};
                for (let i = 0; i < Object.keys(data).length; i++) {
                    let key = Object.keys(data)[i];
                    let control = this.controlInTable[key];
                    if (control && control.type == 'date') {
                        data[key][index] = SYMPER_APP.$moment(
                            data[key][index],
                            'YYYY-MM-DD',
                        ).format(control.controlProperties.formatDate.value);
                    }
                    rowData[key] = data[key][index];
                }
                dataTable.push(rowData);
            }
            if (this.agDataTable) {
                this.agDataTable.setData(dataTable);
            }
        } else {
            if (
                data.hasOwnProperty('childObjectId') &&
                Object.keys(data).length == 1
            ) {
                return;
            }
            let dataTable = [];
            let rowLength = data[Object.keys(data)[0]].length;
            for (let index = 0; index < rowLength; index++) {
                let rowData = {};
                for (let i = 0; i < Object.keys(data).length; i++) {
                    let key = Object.keys(data)[i];
                    let control = this.controlInTable[key];
                    if (control && control.type == 'date') {
                        data[key][index] = SYMPER_APP.$moment(
                            data[key][index],
                            'YYYY-MM-DD',
                        ).format(control.controlProperties.formatDate.value);
                    }
                    rowData[key] = data[key][index];
                }
                dataTable.push(rowData);
            }
            if (this.agDataTable) {
                this.agDataTable.setData(dataTable);
            } else {
                this.tableInstance.setData(dataTable, false);
                setTimeout(
                    (self) => {
                        self.tableInstance.tableInstance.render();
                        SYMPER_APP.$evtBus.$emit('document-on-table-change', {
                            data: self.tableInstance.tableInstance.getSourceData(),
                            tableName: self.name,
                        });
                    },
                    100,
                    this,
                );
            }

            if (this.currentDataStore.docStatus == 'init') {
                this.defaultValue = data;
            }
        }
    }
    switchTable() {
        if (this.tableMode == 'Flat') {
            this.tableInstance.show();
            this.tableInstance.tableInstance.render();
            if (this.agDataTable) {
                this.agDataTable.hide();
            }
        } else {
            this.tableInstance.hide();
            if (this.agDataTable) {
                this.agDataTable.show();
            }
        }
    }
    isInsertRow() {
        return this.controlProperties.isInsertRow.value;
    }
}

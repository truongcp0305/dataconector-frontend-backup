import ReportBase from './ReportBase';
import {
    formatDataDisplay,
    addExtraInfoToColumns,
} from '@/components/dashboard/configPool/tableReportUtils.js';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
export default class Pivot extends ReportBase {
    constructor(symperId) {
        let columnSettingKeys = ['columns', 'rows', 'value'];
        let styleKeys = {
            headerFormat: {
                title: 'v2.dashboard.headerFormat',
                items: [
                    'alignment',
                    'bgColor',
                    'borderColor',
                    'borderWidth',
                    'borderStyle',
                    'fontColor',
                    'tableColumnWidthMode',
                    'textSize',
                    'verticalLine',
                    'verticalAlign',
                    'wrapText',
                ],
            },
            cellFormat: {
                title: 'v2.dashboard.cellFormat',
                items: [
                    'borderBottomColor',
                    'borderBottomWidth',
                    'fontColor',
                    'textSize',
                    'tooltipDecimalNumber',
                    'verticalLine',
                    'verticalAlign',
                    'zeroValueDisplay',
                ],
            },
            total: {
                title: 'v2.dashboard.total',
                items: [
                    'bgColor',
                    'fontColor',
                    'show',
                    'textSize',
                    'borderColor',
                    'borderWidth',
                    'borderStyle',
                    'totalDisplayrows',
                ],
            },
            groupTable:{
                title:'v2.dashboard.group-table',
                items:['groupMultiAutoColumn','autoCollapse','groupName']
            },
            subTotal: {
                title: 'v2.dashboard.subTotal',
                items: [
                    'showOnTop',
                    'showSubTotal',
                    'hideOpenParent',
                    'joinByValue',
                    'fontColor',
                    'fontweight',
                    'textSize',
                    'borderWidth',
                    'borderColor',
                    'borderStyle',
                    'bgColor',
                    'totalDisplayrows',
                    'parentFontColor',
                    'parentFontweight',
                    'parentTextSize',
                    'parentBorderWidth',
                    'parentBorderColor',
                    'parentBorderStyle',
                    'parentBgColor',
                ],
            },
            conditionalFormat: {
                title: 'v2.dashboard.conditionalFormat',
                items: ['conditionalFormatCondition'],
            },
            pagination: {
                title: 'v2.dashboard.pagination',
                items: [
                    'fontColor',
                    'borderWidth',
                    'borderColor',
                    'borderStyle',
                ],
            },
            general: {
                title: 'v2.dashboard.general',
                items: [
                    'bgColor',
                    'borderColor',
                    'borderWidth',
                    'colorPalette',
                    'fontFamily',
                ],
            },
            title: {
                title: 'v2.dashboard.titleConfig',
                items: [
                    'alignment',
                    'bgColor',
                    'fontColor',
                    'show',
                    'textSize',
                    'titleText',
                ],
            },
        };
        super('pivot', symperId, columnSettingKeys, styleKeys);
        this.sharedConfigs.pageSize = 50;
        this.sharedConfigs.currentPage = 1;
        this.sharedConfigs.conditionFormatFields = ['value', 'rows'];
        this.viewConfigs.excludeHeaderOptions = {
            viewDetail: true
        };
        this.setPrependIcons()
    }
    //overwrite hàm này vì đối với pivot sẽ thêm phần groupBy vào menuOptions
    setDefaultMenuOptions() {
        let setting = this.rawConfigs.setting;
        for (let key in setting) {
            if (setting[key].hasAgg) {
                setting[key].menuOptions = {
                    /**
                     * data của cột này khi backend translte thì sẽ lấy chính xác theo khoảng được filter
                     * Phục vụ cho bài toán xuất nhập tồn khi trong cùng một bảng dữ liệu trả về, có cột thì lấy theo khoảng gần nhất, có cột lại cần lấy chính xác
                     */
                    exactMatchWithFilter: {
                        title: 'v2.dashboard.exactMatchWithFilter',
                        type: 'simpleWithCheck',
                        value: false,
                        event: 'change-column-exact-match-with-filter',
                    },
                    wrapText:{
                        title: 'v2.dashboard.wrapText',
                        type: 'simpleWithCheck',
                        value: false,
                        event: 'wrap-text',
                    },
                    groupRowAgg: {
                        key: 'groupRowAgg',
                        prefixTitle: 'v2.dashboard.prefixSubTotal',
                        title: 'v2.dashboard.subTotal',
                        type: 'subMenus',
                        value: 'None',
                        event: 'bottom-row-agg-func-change',
                        notHandle: true,
                        subItems: [
                            {
                                title: 'v2.dashboard.sum',
                                value: 'Sum',
                                checked: false,
                            },
                            {
                                title: 'v2.dashboard.first',
                                value: 'First',
                                checked: false,
                            },
                            {
                                title: 'v2.dashboard.last',
                                value: 'Last',
                                checked: false,
                            },
                            {
                                title: 'v2.dashboard.concat',
                                value: 'Concat',
                                checked: false,
                            },
                            {
                                title: 'v2.dashboard.concatDistinct',
                                value: 'ConcatDistinct',
                                checked: false,
                            },
                            {
                                title: 'v2.dashboard.none',
                                value: 'None',
                                checked: true,
                            },
                        ],
                    },
                };
                
            }
            else if (key == 'rows') {
                setting[key].menuOptions = {
                    wrapText:{
                        title: 'v2.dashboard.wrapText',
                        type: 'simpleWithCheck',
                        value: false,
                        event: 'wrap-text',
                    },  
                    groupBy: {
                    title: 'v2.dashboard.groupBy',
                    type: 'simpleWithCheck',
                    value: false,
                    event: 'group-columns',
                },
                };
            }
        }
    }
    getPivotStaticCols(columns, cellStyle) {
        let rsl = this.makeDisplayColOptions(
            cellStyle,
            columns.rows.selectedColums,
            'as',
        );
        if (columns.columns.selectedColums.length == 0) {
            rsl = rsl.concat(
                this.makeDisplayColOptions(
                    cellStyle,
                    columns.value.selectedColums,
                    'as',
                ),
            );
        }
        return rsl;
    }
    getLeafColFromGroup(groupCols, rsl = []) {
        for (let i in groupCols) {
            let col = groupCols[i];
            if (!col.hasOwnProperty('children')) {
                rsl.push(col);
            } else {
                this.getLeafColFromGroup(col.children, rsl);
            }
        }
    }

    getHeaderRowCount(rawConfig) {
        if (rawConfig.setting.columns.selectedColums.length > 0) {
            if (rawConfig.setting.value.selectedColums.length > 1) {
                return rawConfig.setting.columns.selectedColums.length + 1;
            } else {
                return rawConfig.setting.columns.selectedColums.length;
            }
        } else {
            return 1;
        }
    }

    getCssDisplayPivotHeader(rawConfig) {
        let idCell = 'symper-table-wrapper-' + this.sharedConfigs.cellId;
        let headerRowCount = this.getHeaderRowCount(rawConfig);
        let rowColCount = rawConfig.setting.rows.selectedColums.length;
        if (rowColCount > 0) {
            if (headerRowCount == 1) {
                return '';
            } else {
                let style = '';

                if (rowColCount > 1) {
                    if (headerRowCount > 1) {
                        // Kiểu 1: các cell dòng cuối cùng ko merge với các cell phía trên
                        // for(let i = 1;  i < rowColCount; i++){
                        //     style += `
                        //         #${idCell} .ag-header-viewport .ag-header-row .ag-header-group-cell[aria-colindex='${i}'] {
                        //             border-right: none!important
                        //         }
                        //     `;

                        //     for(let j = 2; j < headerRowCount; j++ ){
                        //         style += `
                        //             #${idCell} .ag-header-viewport .ag-header-row[aria-rowindex='${j}'] .ag-header-group-cell[aria-colindex='${i}']{
                        //                 border-top: none!important
                        //             }
                        //         `;
                        //     }
                        // }

                        // for(let j = 2; j < headerRowCount; j++ ){
                        //     style += `
                        //         #${idCell} .ag-header-viewport .ag-header-row[aria-rowindex='${j}'] .ag-header-group-cell[aria-colindex='${rowColCount}']{
                        //             border-top: none!important
                        //         }
                        //     `;
                        // }

                        // kiểu 2: các cell dòng cuối merge với các cell phía trên
                        for (let i = 1; i <= rowColCount; i++) {
                            for (let j = 2; j <= headerRowCount; j++) {
                                style += `
                                    #${idCell} .ag-header-viewport .ag-header-row[aria-rowindex='${j}'] .ag-header-group-cell[aria-colindex='${i}']{
                                        border-top: none!important
                                    }
                                `;
                            }
                            style += `
                                #${idCell} .ag-header-viewport .ag-header-row[aria-rowindex='${headerRowCount}'] .ag-header-cell[aria-colindex='${i}']{
                                    border-top: none!important
                                }
                            `;
                        }
                    } else {
                        for (let i = 1; i < headerRowCount; i++) {
                            style += `
                                #${idCell} .ag-header-viewport .ag-header-row .ag-header-group-cell:nth-child(${i}) {
                                    border-right: none!important
                                }
                            `;
                        }
                    }
                }

                // if(headerRowCount > 2){
                //     horizontalApply = `
                //         #${idCell} .ag-header-row:not(:first-child), #${idCell} .ag-header-row:not(:last-child) {
                //             border-top: none!important
                //         }
                //     `;
                // }

                return style;
                // return '';
            }
        } else {
            return '';
        }
    }

    async translate(
        rawConfig,
        resData,
        extraData,
        changes = {},
        oldOutput = {},
    ) {
        let ratio = 1;
        let data = resData.data;
        let columns = rawConfig.setting;
        let style = rawConfig.style;
        let prevDisplayOptions = oldOutput;

        /** hàm cũ */
        let needTotal = style.total.children.show.value;
        let commonAttr = this.getCommonCellStyleAttr(style, ratio);
        let rsl = {
            needTotal: needTotal,
            totalRowCount: Number(resData.total),
            data: data,
            tableColumnWidthMode:
                style.headerFormat.children.tableColumnWidthMode.value,
            columns: [],
            cellStyle: this.getStyleItemsInConfig(
                style.cellFormat.children,
                'px',
                ratio,
            ),
            headerStyle: this.getStyleItemsInConfig(
                style.headerFormat.children,
                'px',
                ratio,
            ),
            contentSize: {
                h: extraData.size.h,
                w: extraData.size.w,
            },
            paginationStyle: {
                color: style.pagination.children.fontColor.value,
                borderWidth: style.pagination.children.borderWidth.value,
                borderStyle: style.pagination.children.borderStyle.value,
                borderColor: style.pagination.children.borderColor.value,
            },
            cssDisplayPivotHeader: '',
        };

        rsl.headerStyle.verticalLine =
            style.headerFormat.children.verticalLine.value;
        rsl.cellStyle.verticalLine =
            style.cellFormat.children.verticalLine.value;

        let cellStyle = rsl.cellStyle;
        cellStyle.borderStyle = 'solid';
        cellStyle.backgroundColor = commonAttr.general.backgroundColor;
        cellStyle.symperCellConfig = {
            zeroValueDisplay: this.getZeroValueDisplay(style),
            headerWrapText: style.headerFormat.children.wrapText.value,
            decimalTootip: style.cellFormat.children.tooltipDecimalNumber.value,
        };

        cellStyle.originStyle = style;
        cellStyle.extraData = rawConfig.extra;
        rsl.data = data.data;
        let staticCols = [];
        if (data.colDefs) {
            if (data.colDefs.group && data.colDefs.group.length > 0) {
                staticCols = this.getPivotStaticCols(columns, cellStyle);
                rsl.columns = staticCols.concat(data.colDefs.group);
                let leafCols = [];
                this.getLeafColFromGroup(rsl.columns, leafCols);
                rsl.leafCols = addExtraInfoToColumns(rawConfig.extra, leafCols, 'symperColumnName');
                if (rsl.leafCols[0].symperColumnName == 'Format entire row') {
                    rsl.leafCols.shift();
                }
                let computedCols = this.makeDisplayColOptions(
                    cellStyle,
                    leafCols,
                    'headerName',
                    'field',
                );
                if (rsl.columns[0].symperColumnName == 'Format entire row') {
                    // check xem có condition format cho toàn bộ row trong table hay ko
                    rsl.rowFormatCond = computedCols[0].formatConds;
                    rsl.columns.shift();
                }

                let map = computedCols.reduce((map, el) => {
                    map[el.field] = el;
                    return map;
                });
                for (let i = 0; i < leafCols.length; i++) {
                    leafCols[i] = Object.assign(
                        leafCols[i],
                        map[leafCols[i].field],
                    );
                }
                rsl.leafCols = leafCols;
                rsl.cssDisplayPivotHeader =
                    this.getCssDisplayPivotHeader(rawConfig);
            } else {
                let computedCols = staticCols.concat(
                    this.makeDisplayColOptions(
                        cellStyle,
                        data.colDefs.columns,
                        'title',
                    ),
                );
                if (computedCols[0].symperColumnName == 'Format entire row') {
                    // check xem có condition format cho toàn bộ row trong table hay ko
                    rsl.rowFormatCond = computedCols[0].formatConds;
                    computedCols.shift();
                }
                rsl.columns = computedCols;
                if (
                    cellStyle.extraData &&
                    cellStyle.extraData.pinnedColIdx &&
                    Object.keys(cellStyle.extraData.pinnedColIdx).length > 0
                ) {
                    for (let col of rsl.columns) {
                        if (cellStyle.extraData.pinnedColIdx[col.symperColumnName]) {
                            col.pinned =
                                cellStyle.extraData.pinnedColIdx[
                                col.symperColumnName
                                ];
                        }
                    }
                }
                addExtraInfoToColumns(rawConfig.extra, rsl.columns, 'symperColumnName');
                rsl.leafCols = rsl.columns;
            }
        }

        if (rsl.needTotal) {
            if (rsl.data && rsl.data.length > 0) {
                rsl.totalRow = [rsl.data.pop()];
                rsl.totalRowStyle = this.getStyleItemsInConfig(
                    style.total.children,
                    'px',
                    ratio,
                );
            }
        }

        // tìm cột đầu tiên ko phải là number để thêm chữ tổng

        let totalRowTitleField = '';
        if (Array.isArray(rsl.totalRow)) {
            let notNumberColumn = null;
            for (let col of rsl.columns) {
                if (col.symperType != 'number' || col.lastLineAgg == 'none') {
                    notNumberColumn = col;
                    break;
                }
            }

            if (notNumberColumn) {
                totalRowTitleField = notNumberColumn.field;
                rsl.totalRow[0][notNumberColumn.field] =
                    style.total.children.totalDisplayrows.value;
            }
        }
        if (rawConfig.setting.rows != undefined) {
            let selectedColumns = [];
            if (
                rawConfig.setting.hasOwnProperty('rows')
            ) {
                selectedColumns =
                    rawConfig.setting.rows.selectedColums;
            }

            for (let i = 0; i < selectedColumns.length; i++) {
                if (
                    selectedColumns[i].hasOwnProperty('menuOptions') &&
                    selectedColumns[i].menuOptions.hasOwnProperty(
                        'groupBy'
                    ) &&
                    selectedColumns[i].menuOptions.groupBy.value
                ) {
                    rsl.columns[i].rowGroup = true;
                    rsl.columns[i].hide = true;
                }
            }

            // for (let col of rsl) {
            //     if (col.hasOwnProperty('children')) {
            //         let firstChildren = _cloneDeep(col.children[0]);
            //         firstChildren.columnGroupShow = 'closed';
            //         col.children.forEach(
            //             (a) => (a.columnGroupShow = 'open')
            //         );
            //         col.children.push(firstChildren);
            //     }
            // }
        }
        rsl.data = formatDataDisplay(rsl, 'pivot', totalRowTitleField);
        rsl.styleConfig = {}
        rsl.styleConfig.footer = {
            backgroundColor: rawConfig.style.subTotal.children.bgColor.value,
            borderColor: rawConfig.style.subTotal.children.borderColor.value,
            borderStyle: rawConfig.style.subTotal.children.borderStyle.value,
            'border-width': rawConfig.style.subTotal.children
                .borderWidth.value + 'px',
            color: rawConfig.style.subTotal.children.fontColor.value,
            'font-size': rawConfig.style.subTotal.children
                .textSize.value + 'px',
            'font-weight': rawConfig.style.subTotal.children.fontweight.value

        }
        rsl.styleConfig.parentRow = {
            backgroundColor: rawConfig.style.subTotal.children.parentBgColor.value,
            borderColor: rawConfig.style.subTotal.children.parentBorderColor.value,
            borderStyle: rawConfig.style.subTotal.children.parentBorderStyle.value,
            'border-width': rawConfig.style.subTotal.children
                .parentBorderWidth.value + 'px',
            color: rawConfig.style.subTotal.children.parentFontColor.value,
            'font-size': rawConfig.style.subTotal.children
                .parentTextSize.value + 'px',
            'font-weight': rawConfig.style.subTotal.children.parentFontweight.value
        }
        return Object.assign(commonAttr, rsl);
    }
}

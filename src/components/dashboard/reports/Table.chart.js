import ReportBase from './ReportBase';
import {
    formatDataDisplay,
    addExtraInfoToColumns,
} from '@/components/dashboard/configPool/tableReportUtils.js';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
export default class Table extends ReportBase {
    constructor(symperId) {
        let columnSettingKeys = ['value'];
        let styleKeys = {
            headerFormat: {
                title: 'v2.dashboard.headerFormat',
                items: [
                    'fontColor',
                    'textSize',
                    'bgColor',
                    'tableColumnWidthMode',
                    'borderWidth',
                    'borderColor',
                    'borderStyle',
                    'alignment',
                    'verticalLine',
                    'wrapText',
                ],
            },
            cellFormat: {
                title: 'v2.dashboard.cellFormat',
                items: [
                    'fontColor',
                    'textSize',
                    'borderBottomWidth',
                    'borderBottomColor',
                    'borderStyle',
                    'verticalLine',
                    'zeroValueDisplay',
                    'tooltipDecimalNumber',
                ],
            },
            total: {
                title: 'v2.dashboard.total',
                items: [
                    'show',
                    'fontColor',
                    'textSize',
                    'borderWidth',
                    'borderColor',
                    'borderStyle',
                    'bgColor',
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
            pagination: {
                title: 'v2.dashboard.pagination',
                items: [
                    'fontColor',
                    'borderWidth',
                    'borderColor',
                    'borderStyle',
                ],
            },
            conditionalFormat: {
                title: 'v2.dashboard.conditionalFormat',
                items: ['conditionalFormatCondition'],
            },
        };
        super('table', symperId, columnSettingKeys, styleKeys);
        this.sharedConfigs.pageSize = 50;
        this.sharedConfigs.currentPage = 1;
        this.sharedConfigs.conditionFormatFields = ['value'];
        this.viewConfigs.excludeHeaderOptions = {
            viewDetail: true
        };
        this.customColumnOptions();
        this.setPrependIcons()
    }

    restoreConfigFromSavedData(cell, customUIData) {
        this.restoreByDefault(cell, customUIData);
        this.renameBottomRowAgg();
    }

    renameBottomRowAgg() {
        for (let col of this.rawConfigs.setting.value.selectedColums) {
            col.menuOptions.bottomRowAgg.title = `${col.menuOptions.bottomRowAgg.prefixTitle} (${col.menuOptions.bottomRowAgg.value}) `;
            for (let subItem of col.menuOptions.bottomRowAgg.subItems) {
                if (subItem.value == col.menuOptions.bottomRowAgg.value) {
                    subItem.checked = true;
                } else {
                    subItem.checked = false;
                }
            }
        }
    }
    customColumnOptions() {
        this.rawConfigs.setting.value.menuOptions = Object.assign(
            this.rawConfigs.setting.value.menuOptions,
            {
                bottomRowAgg: {
                    key: 'bottomRowAgg',
                    icon: 'mdi-sigma',
                    prefixTitle: 'v2.dashboard.prefixBottomRowAgg',
                    title: 'v2.dashboard.bottomRowAgg',
                    type: 'subMenus',
                    value: 'Sum',
                    event: 'bottom-row-agg-func-change',
                    notHandle: true,
                    subItems: [
                        {
                            title: 'v2.dashboard.sum',
                            value: 'Sum',
                            checked: true,
                        },
                        {
                            title: 'v2.dashboard.avg',
                            value: 'Avg',
                            checked: false,
                        },
                        {
                            title: 'v2.dashboard.min',
                            value: 'Min',
                            checked: false,
                        },
                        {
                            title: 'v2.dashboard.max',
                            value: 'Max',
                            checked: false,
                        },
                    ],
                },
                groupBy: {
                    title: 'v2.dashboard.groupBy',
                    type: 'simpleWithCheck',
                    value: false,
                    event: 'group-columns',
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
            },
        );
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
            data: data,
            totalRowCount: Number(resData.total),
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
            totalRow: [],
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
        };

        rsl.headerStyle.verticalLine =
            style.headerFormat.children.verticalLine.value;
        rsl.cellStyle.verticalLine =
            style.cellFormat.children.verticalLine.value;

        let cellStyle = rsl.cellStyle;
        cellStyle.backgroundColor = commonAttr.general.backgroundColor;
        cellStyle.symperCellConfig = {
            zeroValueDisplay: this.getZeroValueDisplay(style),
            headerWrapText: style.headerFormat.children.wrapText.value,
            decimalTootip: style.cellFormat.children.tooltipDecimalNumber.value,
        };

        cellStyle.originStyle = style;
        cellStyle.extraData = rawConfig.extra;
        rsl.columns = this.makeDisplayColOptions(
            cellStyle,
            columns.value.selectedColums,
            'as',
            'as',
            prevDisplayOptions,
            style,
        );
        if (rsl.columns[0].symperColumnName == 'Format entire row') {
            // check xem có condition format cho toàn bộ row trong table hay ko
            rsl.rowFormatCond = rsl.columns[0].formatConds;
            rsl.columns.splice(0, 1);
        }

        rsl.totalRow = [];

        if (needTotal) {
            if (rsl.data && rsl.data.length > 0) {
                rsl.totalRow = [rsl.data.pop()];
            }
            rsl.totalRowStyle = this.getStyleItemsInConfig(
                style.total.children,
                'px',
                ratio,
            );
        }

        let totalRowTitleField = '';
        // tìm cột đầu tiên ko phải là number để thêm chữ tổng
        if (rsl.totalRow.length > 0) {
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
        rsl.data = formatDataDisplay(rsl, 'table', totalRowTitleField);
        rsl.columns = addExtraInfoToColumns(rawConfig.extra, rsl.columns);
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

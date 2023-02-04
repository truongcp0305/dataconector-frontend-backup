import cloneDeep from 'lodash/cloneDeep';
import { str } from '@/plugins/utilModules/str.js';
import { number } from '@/plugins/utilModules/number.js';

function formatNumberCols(conf, value) {
    value = value === undefined ? null : value;
    if (value !== null && !isNaN(value)) {
        value = number.thousandsSeparateAndRound(
            value,
            conf.cellStyle.symperCellConfig.decimalTootip,
        );
        // value = conf.cellStyle.symperCellConfig.zeroValueDisplay;
    }
    return value;
}

export const addExtraInfoToColumns = function (extraDisplay, cols, key = 'headerName') {
    let colsWidth = extraDisplay.columnsWidth ? extraDisplay.columnsWidth : [];
    let pinnedCols = extraDisplay.pinnedColIdx ? extraDisplay.pinnedColIdx : {};
    let hiddenCols = extraDisplay.hiddenCols ? extraDisplay.hiddenCols : {};
    if (!extraDisplay.headerDescription) {
        extraDisplay.headerDescription = {};
    }
    let col;

    // Đánh dấu để phù hợp giữa cách lưu pin, width cũ và mới
    let useHeaderNameWidth = false;
    let useHeaderNamePin = false;

    let columnKey = '';
    for (let i = 0; i < cols.length; i++) {
        columnKey = cols[i][key];
        if (colsWidth[columnKey]) {
            useHeaderNameWidth = true;
        }

        if (pinnedCols[columnKey]) {
            useHeaderNamePin = true;
        }
    }
    for (let i = 0; i < cols.length; i++) {
        col = cols[i];
        columnKey = cols[i][key];

        if (colsWidth[columnKey]) {
            col.width = colsWidth[columnKey];
        }

        if (!useHeaderNameWidth && colsWidth[i]) {
            col.width = colsWidth[i];
        }

        if (pinnedCols[columnKey]) {
            col.pinned = pinnedCols[columnKey];
        }

        if (!useHeaderNamePin && pinnedCols[i]) {
            col.pinned = pinnedCols[i];
        }

        if (hiddenCols[col.field]) {
            col.hide = true;
        }
        col.headerTooltip = extraDisplay.headerDescription[columnKey]
            ? extraDisplay.headerDescription[columnKey]
            : col.headerTooltip;
    }
    return cols;
};

export const formatDataDisplay = function (
    conf,
    type = 'table',
    totalRowTitleField = '',
) {
    let cols = conf.columns;
    if (type == 'pivot') {
        cols = conf.leafCols;
    }
    let data = cloneDeep(conf.data);
    let mapColByTitle = {};
    let key = type == 'pivot' ? 'field' : 'headerName';

    for (let col of cols) {
        mapColByTitle[col[key]] = col;
    }

    let tmpColDef = null;
    let symperType = '';
    for (let row of data) {
        for (let colName in row) {
            tmpColDef = mapColByTitle[colName];
            symperType =
                tmpColDef && tmpColDef.symperType
                    ? tmpColDef.symperType
                    : 'text';
            if (symperType == 'text') {
                row[colName] = row[colName] ? row[colName] : '';
                if (typeof row[colName] == 'string') {
                    row[colName] = str.removeHTMLTags(row[colName]);
                } else {
                    console.warn(
                        '[SYMPER WARING] error when removeHTMLTags',
                        tmpColDef,
                        row,
                        colName,
                        row[colName],
                    );
                }
            }
        }
    }

    if (conf.totalRow && conf.totalRow.length > 0) {
        for (let row of conf.totalRow) {
            for (let colName in row) {
                tmpColDef = mapColByTitle[colName];
                symperType =
                    tmpColDef && tmpColDef.symperType
                        ? tmpColDef.symperType
                        : 'text';
                if (totalRowTitleField && colName == totalRowTitleField) {
                    continue;
                }
                if (
                    !tmpColDef ||
                    (tmpColDef.lastLineAgg != 'none' && !isNaN(row[colName]))
                ) {
                    // row[colName] = formatNumberCols(conf, row[colName]);
                } else {
                    row[colName] = '';
                }
            }
        }
    }
    return data;
};

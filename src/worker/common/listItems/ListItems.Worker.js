import {
    getDataFromConfig,
    getDefaultFilterConfig,
} from '@/components/common/customTable/defaultFilterConfig';
import { uiConfigApi } from '@/api/uiConfig';
var cacheGetData = {
    noFilter: {
        data: {},
        extra: {},
    },
};
import _isEmpty from 'lodash/isEmpty';

self.onmessage = async function (event) {
    var workerDataReceive = event.data;
    let action = workerDataReceive.action;
    let data = workerDataReceive.data;
    switch (action) {
        case 'getData':
            let getDataRes = await getData(data);
            postMessage({ action: 'getData', dataAfter: getDataRes });
            break;
        case 'customGetData':
            let customGetDataRes = await getData(data);
            postMessage({
                action: 'customGetData',
                dataAfter: customGetDataRes,
            });
            break;
        case 'getDataForTree':
            let getDataForTreeRes = await getDataForTree(data);
            postMessage({
                action: 'getDataForTree',
                dataAfter: getDataForTreeRes,
            });
            break;
        case 'getItemForValueFilter':
            let getItemForValueFilterRes = await getItemForValueFilter(data);
            postMessage({
                action: 'getItemForValueFilter',
                dataAfter: getItemForValueFilterRes,
            });
            break;
        case 'getItemForValueFilterSideBar':
            let getItemForValueFilterSideBarRes = await getItemForValueFilter(data);
            postMessage({
                action: 'getItemForValueFilterSideBar',
                dataAfter: getItemForValueFilterSideBarRes,
            });
            break;
        case 'setSelectItemForFilter':
            let setSelectItemForFilterRes = await setSelectItemForFilter(data);
            postMessage({
                action: 'setSelectItemForFilter',
                dataAfter: setSelectItemForFilterRes,
            });
            break;
        case 'saveTableDisplayConfig':
            let saveTableDisplayConfigRes = await saveTableDisplayConfig(data);
            postMessage({
                action: 'saveTableDisplayConfig',
                dataAfter: saveTableDisplayConfigRes,
            });
            break;
        case 'saveTableTypeViewConfig':
            let saveTableTypeViewConfigRes = await saveTableTypeViewConfig(
                data,
            );
            postMessage({
                action: 'saveTableTypeViewConfig',
                dataAfter: saveTableTypeViewConfigRes,
            });
            break;
        case 'getTableColumns':
            let getTableColumnsRes = await getTableColumns(
                data.column,
                data.forcedReOrder,
                data.savedOrderCols,
                data.filteredColumns,
            );
            postMessage({
                action: 'getTableColumns',
                dataAfter: getTableColumnsRes,
            });
            break;
        case 'saveUiConfig':
            let saveUiConfigRes = await saveUiConfig(data);
            postMessage({ action: 'saveUiConfig', dataAfter: saveUiConfigRes });
            break;
        case 'getUiConfig':
            let getUiConfigRes = await getUiConfig(data);
            postMessage({ action: 'getUiConfig', dataAfter: getUiConfigRes });
            break;
        case 'getCustomUIConfig':
            let res = await getCustomUIConfig(data);
            postMessage({ action: 'getCustomUIConfig', dataAfter: res });
            break;
        default:
            break;
    }
};

function isGetWithoutFilter(dataConfig) {
    if (dataConfig.configs.cache) {
        return false;
    }
    if (dataConfig.tableFilter && dataConfig.tableFilter.allColumn) {
        dataConfig.filteredColumns = Object.keys(
            dataConfig.tableFilter.allColumn,
        ).reduce((map, el) => {
            map[el] = true;
            return map;
        }, {});
    }
    let pageSizeCond =
        !cacheGetData.noFilter.extra.pageSize ||
        cacheGetData.noFilter.extra.pageSize == dataConfig.pageSize;
    if (
        !dataConfig.searchKey &&
        _isEmpty(dataConfig.filteredColumns) &&
        dataConfig.page == 1 &&
        pageSizeCond
    ) {
        return true;
    } else {
        return false;
    }
}

export const getData = function (dataConfig) {
    return new Promise((resolve, reject) => {
        if (
            isGetWithoutFilter(dataConfig) &&
            !_isEmpty(cacheGetData['noFilter']['data'])
        ) {
            resolve(cacheGetData['noFilter']['data']);
        } else {
            let handler = function (data) {
                if (isGetWithoutFilter(dataConfig)) {
                    cacheGetData['noFilter']['data'] = data;
                    cacheGetData['noFilter']['extra'].pageSize =
                        dataConfig.pageSize;
                }
                resolve(data);
            };
            let error = (err) => {
                self.postMessage({ action: 'getDataError', dataAfter: err });
            };
            prepareFilterAndCallApi(
                dataConfig.configs.columns,
                dataConfig.configs.cache,
                dataConfig.configs.applyFilter,
                handler,
                {},
                dataConfig,
                error,
            );
        }
    });
};

function getDataFromPath(data, path) {
    path = path.split('.');
    path.shift();
    for (let section of path) {
        if (data[section]) {
            data = data[section];
        } else {
            return [];
        }
    }
    return data;
}

export const getItemForValueFilter = function (options) {
    var dataConfig = options.dataConfig;
    return new Promise((resolve, reject) => {
        let success = (data) => {
            let obj = {};
            if (data.status == 200) {
                let arr = getDataFromPath(data, options.pathToListObject);
                let items = arr.reduce((arr, el) => {
                    arr.push(el[dataConfig.columns[0]]);
                    return arr;
                }, []);
                obj.selectItems = createSelectableItems(
                    items,
                    dataConfig.colFilter,
                );
            }
            resolve(obj);
        };
        let error = (err) => {
            self.postMessage({ action: 'getDataError', dataAfter: err });
        };
        dataConfig.searchKey = '';
        prepareFilterAndCallApi(
            dataConfig.columns,
            false,
            true,
            success,
            dataConfig.options,
            dataConfig,
            error,
        );
    });
};
export const getDataForTree = function (data) {
    let dataConfig = data.dataConfig
    let tableFilter = data.tableFilter
    dataConfig.tableFilter.allColumn = tableFilter.allColumn
    dataConfig.tableFilter.allColumnInTable = []
    return new Promise((resolve, reject) => {
        let success = (data) => {
            resolve(data);
        };
        let error = (err) => {
            self.postMessage({ action: 'getDataError', dataAfter: err });
        };
        prepareFilterAndCallApi(
            dataConfig.columns,
            false,
            true,
            success,
            dataConfig.options,
            dataConfig,
            error,
        );
    });
};
export const createSelectableItems = function (items, colFilter) {
    let selectableItems = [];
    if (colFilter.clickedSelectAll) {
        // chọn tất cả
        selectableItems = items.reduce((arr, el) => {
            arr.push({
                value: el,
                checked: true,
            });
            return arr;
        }, []);
    } else if (colFilter.selectAll) {
        // not in
        selectableItems = items.reduce((arr, el) => {
            arr.push({
                value: el,
                checked: colFilter.valuesNotIn[el] ? false : true,
            });
            return arr;
        }, []);
    } else {
        // in
        selectableItems = items.reduce((arr, el) => {
            arr.push({
                value: el,
                checked: colFilter.valuesIn[el] ? true : false,
            });
            return arr;
        }, []);
    }
    return selectableItems;
};
export const setSelectItemForFilter = function (data) {
    let obj = {};
    obj.selectItems = createSelectableItems(data.textItems, data.colFilter);
    return obj;
};

function convertToNewFormat(configs) {
    if (configs.columns && configs.widthColumns) {
        let mapColWidth = configs.widthColumns.reduce((map, el) => {
            map[el.colId] = el;
            return map;
        }, {});

        let rsl = configs.columns.reduce((arr, col) => {
            arr.push({
                field: col.data,
                width: mapColWidth[col.data]
                    ? mapColWidth[col.data].width
                    : null,
                pinned: col.symperFixed ? 'left' : null,
                hide: col.symperHide,
            });
            return arr;
        }, []);
        delete configs.hiddenColumns;
        delete configs.widthColumns;
        return rsl;
    } else {
        return configs.columns;
    }
}

export const restoreTableDisplayConfig = async function (data) {
    let obj = {};
    let res = await uiConfigApi.getUiConfig(data.widgetIdentifier);
    obj.sharedConfig = res.data.sharedConfig;
    obj.savedConfigs = {};
    delete res.data.sharedConfig
    if (res.status == 200) {
        obj.savedConfigs = res.data;
        if (data.columnDefs.length > 0) {
            obj.columnDefs = getTableColumns(data.columnDefs, true);
        }
    }
    if (obj.savedConfigs && obj.savedConfigs.columns) {
        obj.savedConfigs.columns = convertToNewFormat(obj.savedConfigs);
    }
    return obj;
};

export const saveTableDisplayConfig = async function (data) {
    let res = await uiConfigApi.saveUiConfig(data.dataToSave);
    return res;
};
export const saveTableTypeViewConfig = async function (data) {
    let res = await uiConfigApi.saveUiConfig(data.dataToSave);
    return res;
};

export const prepareFilterAndCallApi = function (
    columns = false,
    cache = false,
    applyFilter = false,
    success,
    configs = {},
    dataConfig,
    error,
) {
    if (dataConfig.url != '') {
        let emptyOption = false;
        let header = {};
        if (
            dataConfig.routeName == 'deployHistory' ||
            dataConfig.routeName == 'listProcessInstances' ||
            dataConfig.useWorkFlowHeader
        ) {
            header = {
                'Content-Type': 'application/json',
            };
            emptyOption = true;
        }

        configs.searchKey = dataConfig.searchKey;
        configs.page = configs.page ? configs.page : dataConfig.page;
        configs.pageSize = configs.pageSize
            ? configs.pageSize
            : dataConfig.pageSize;
        configs.formulaCondition = dataConfig.conditionByFormula
            ? dataConfig.conditionByFormula
            : null;
        let tableFilter = dataConfig.tableFilter;
        tableFilter.allColumnInTable = dataConfig.columnDefs;
        configs.emptyOption = emptyOption;
        configs.customDataForApi = dataConfig.customDataForApi;
        getDataFromConfig(
            dataConfig.url,
            configs,
            columns,
            tableFilter,
            success,
            dataConfig.method,
            header,
            dataConfig,
            error,
        );
    }
};

export const getTableColumns = function (
    columns,
    forcedReOrder = false,
    savedOrderCols,
    filteredColumns,
) {
    let colMap = {};
    if (forcedReOrder) {
        for (let item of columns) {
            colMap[item.field] = item;
        }
    } else {
        for (let item of columns) {
            colMap[item.name] = {
                headerName: item.title,
                field: item.name,
                type: item.type == 'richtext' ? 'text' : item.type == 'number' ? 'numeric' : item.type, // lưu ý khi loại dữ liệu của cột là number (cần format) và dạng html
                editor: false,
                columnTitle: item.title,
                cellRenderer: item.cellRenderer ? item.cellRenderer : null,
                cellRendererParams: item.cellRendererParams
                    ? item.cellRendererParams
                    : null,
                noFilter: item.noFilter ? item.noFilter : false,
                filtered: !filteredColumns
                    ? false
                    : filteredColumns[item.name]
                        ? true
                        : false,
                width: item.name == 'id' ? 50 : item.width ? item.width : 200,
                flex: item.flex ? item.flex : false,
                noFilter: item.noFilter ? true : false,
                hide: item.hide ? true : false,
            };
        }
    }
    if (savedOrderCols.length > 0) {
        let orderedCols = [];
        let noneOrderedCols = [];
        for (let col of savedOrderCols) {
            let dataCol = colMap[col.field];
            if (dataCol) {
                dataCol.checkedOrder = true;
                dataCol = Object.assign(dataCol, col);
                if (colMap[col.field].hide) {
                    dataCol.hide = true;
                }
                orderedCols.push(dataCol);
            }

        }

        for (let colName in colMap) {
            if (!colMap[colName].checkedOrder) {
                noneOrderedCols.push(colMap[colName]);
            }
        }
        return orderedCols.concat(noneOrderedCols);
    } else {
        return Object.values(colMap);
    }
};
export const saveUiConfig = async function (data) {
    let res = await uiConfigApi.saveUiConfig(data);
    return res;
};
export const getUiConfig = async function (data) {
    let res = await uiConfigApi.getUiConfig(data);
    return res;
};

export const getCustomUIConfig = async function (data) {
    let res = await restoreTableDisplayConfig(data);
    let sharedConfig = getSharedConfig(res.sharedConfig);
    for (let key in res.savedConfigs) {
        res.savedConfigs[key] = JSON.parse(res.savedConfigs[key])
    }
    let response = getAllConfig(sharedConfig, res.savedConfigs)
    sortConditionalFormat(response.conditionalFormat, response.listSharedConditionalFormat, response.listSelectedCondition)
    sortConditionalFormat(response.kanbanConfig.conditionalFormat, response.kanbanConfig.sharedConditionalFormat, response.listSelectedConditionKanban)
    sortConditionalFormat(response.schedulerConfig.conditionalFormat, response.schedulerConfig.sharedConditionalFormat, response.listSelectedConditionScheduler)
    return response;
};
const getSharedConfig = (data) => {
    let res = {}
    if (Object.keys(data).length > 0) {
        res.listSharedFilter = data.filter ? data.filter : [];
        res.listSharedConditionalFormat = data.conditionalFormat ? data.conditionalFormat : [];
        res.shareTree = data.treeView ? data.treeView : [];
        res.shareTreeKanban = data.treeViewKanban ? data.treeViewKanban : [];
        res.sharedConditionalFormatKanban = data.conditionalFormatKanban ? data.conditionalFormatKanban : [];
        res.sharedConditionalFormatScheduler = data.conditionalFormatScheduler ? data.conditionalFormatScheduler : [];
        res.shareTreeScheduler = data.treeViewScheduler ? data.treeViewScheduler : [];
    }
    return res
};
const getAllConfig = (sharedConfig, data) => {
    let res = {}
    let tableDisplayConfig = {
        show: false, // có hiển thị panel cấu hình ko
        width: 350, // Chiều rộng của panel cấu hình
        value: {
            wrapTextMode: 1,
            densityMode: 2,
            alwaysShowSidebar: false
        },
        dragOptions: {
            animation: 200,
            group: 'display-column-drag',
            disabled: false,
            ghostClass: 'ghost-item'
        },
        drag: false
    }
    if (data) {
        if (data.tableConfig) {
            if (data.tableConfig.treeviewWidth) {
                res.treeviewWidth = data.tableConfig.treeviewWidth;
            }
            if (data.tableConfig.wrapTextMode && data.tableConfig.wrapTextMode != 1) {
                tableDisplayConfig.value.wrapTextMode = 0;
            }
            if (
                data.tableConfig.densityMode ||
                data.tableConfig.densityMode == 0
            ) {
                tableDisplayConfig.value.densityMode = data.tableConfig.densityMode;
            }
            if (data.alwaysShowSidebar) {
                tableDisplayConfig.value.alwaysShowSidebar = data.tableConfig.alwaysShowSidebar;
            }
            if (data.tableConfig.columns) {
                res.savedTableDisplayConfig = data.tableConfig.columns;
            }
            if (data.tableConfig.columnDefs) {
                res.columnDefs = data.tableConfig.columnDefs;
            }
            if (data.tableConfig.tabView) {
                res.tabView = data.tableConfig.tabView;
            }
        }
        res.tableDisplayConfig = tableDisplayConfig

        if (data.treeView) {
            res.typeViewConfigs = data.treeView;
        }
        res.shareTree = sharedConfig.shareTree;
        res.schedulerConfig = {
            conditionalFormat: [],
            treeView: '',
            fieldCards: [],
            treeView: {
                productList: false,
                tableType: 'flat',
                selectedTree: '',
                treeData: [],
                shareTree: []
            },
            sharedConditionalFormat: []
        }
        if (data.treeViewScheduler) {
            res.schedulerConfig.treeView = data.treeViewScheduler;
        }
        res.schedulerConfig.treeView.shareTree = sharedConfig.shareTreeScheduler;
        res.kanbanConfig = {
            conditionalFormat: [],
            treeView: '',
            fieldCards: [],
            allControlInDoc: [],
            treeView: {
                productList: false,
                tableType: 'flat',
                selectedTree: '',
                treeData: [],
                shareTree: []
            },
            sharedConditionalFormat: []
        }
        if (data.treeViewKanban) {
            res.kanbanConfig.treeView = data.treeViewKanban;
        }
        res.kanbanConfig.treeView.shareTree = sharedConfig.shareTreeKanban;
        // xử lý phần filter
        res.filter = data.filter
            ? data.filter
            : {
                listFilters: [],
                defaultApplyedFilter: {
                    userFilter: [],
                    sharedFilter: []
                }
            };
        res.filter.listFilters.map(fil => {
            if (fil.computedSelfFilterConfig) {
                fil.computedSelfFilterConfig.map(col => {
                    col.config.fullOptions = []
                    col.config.selectItems = []
                    delete col.config.notResetFullOptions
                })
            }
        })
        res.listSharedFilter = sharedConfig.listSharedFilter
        res.listSharedFilter.map(fil => {
            if (fil.computedSelfFilterConfig) {
                fil.computedSelfFilterConfig.map(col => {
                    col.config.fullOptions = []
                    col.config.selectItems = []
                    delete col.config.notResetFullOptions
                })
            }
        })
        //conditional format
        res.conditionalFormat = data.conditionalFormat && data.conditionalFormat.listCondition ? data.conditionalFormat.listCondition : [];
        res.listSelectedCondition = data.conditionalFormat && data.conditionalFormat.listSelectedCondition ? data.conditionalFormat.listSelectedCondition : [];
        res.listSharedConditionalFormat = sharedConfig.listSharedConditionalFormat
        //conditional format scheduler
        res.schedulerConfig.conditionalFormat = data.conditionalFormatScheduler && data.conditionalFormatScheduler.listCondition
            ? data.conditionalFormatScheduler.listCondition : [];
        res.listSelectedConditionScheduler = data.conditionalFormatScheduler && data.conditionalFormatScheduler.listSelectedCondition
            ? data.conditionalFormatScheduler.listSelectedCondition : [];
        res.schedulerConfig.sharedConditionalFormat = sharedConfig.sharedConditionalFormatScheduler
        //conditional format kanban
        res.kanbanConfig.conditionalFormat = data.conditionalFormatKanban && data.conditionalFormatKanban.listCondition ? data.conditionalFormatKanban.listCondition : [];
        res.listSelectedConditionKanban = data.conditionalFormatKanban && data.conditionalFormatKanban.listSelectedCondition ? data.conditionalFormatKanban.listSelectedCondition : [];
        res.kanbanConfig.sharedConditionalFormat = sharedConfig.sharedConditionalFormatKanban
    }
    return res
}
const sortConditionalFormat = (userConfig, shareConfig, listSelected,) => {
    for (let idx in userConfig) {
        listSelected.map((e) => {
            if (userConfig[idx].key == e) {
                userConfig[idx].isSelected = true;
                userConfig.unshift(userConfig.splice(idx, 1)[0]);
            }
        });
        if (!listSelected.includes(userConfig[idx].key)) {
            userConfig[idx].isSelected = false;
        }
    }
    for (let i in shareConfig) {
        listSelected.map((e) => {
            if (shareConfig[i].key == e) {
                shareConfig[i].isSelected = true;
                shareConfig.unshift(shareConfig.splice(i, 1)[0]);
            }
        });
        if (!listSelected.includes(shareConfig[i].key)) {
            shareConfig[i].isSelected = false;
        }
    }
}
/**
 * File phục vụ cho việc lấy các cấu hình mặc định của report
 */
export const getDefaultReportConfig = function () {
    return {
        rawConfigs: {
            // config thô do BA setting
            condition: [], // cấu hình điều kiện cho report này
            setting: {}, // cấu hình cho các cột
            style: {} // cấu hình cho việc hiển thị của report
        },
        sharedConfigs: {
            // các cấu hình chung của report
            cellId: '', // id đánh tự động của report
            data: [], // dữ liệu thô được lấy từ server
            type: '', // loại report
            yAxisCount: 1 // số lượng yAxis được sử dụng
        },
        viewConfigs: {
            // cấu hình phục vụ cho việc hiển thị
            commentCount: 0, // số lượng comment
            displayOptions: {}, // cấu hình được translate từ các rawConfig thành cấu hình tương ứng của thư viện
            filter: {}, // filter áp dụng cho report này
            isSelecting: false, // có đang click để lựa chọn hay không
            loadingData: false, // có đang tải dữ liệu không
            needSaveExtraOptions: {}, // các cấu hình phụ cần lưu trong quá trình tương tác với report, vd: chiều rộng của các column trong table sau resize
            selectedDataset: {}, // chứa các cột trong các dataset  được lựa chọn cho report này
            showIcon: true // có hiển thị icon ko
        }
    };
};

var loadedClasses = {}; // map các class đã được map với key là
var mapReportTypeAndClasses;
/**
 * Hàm load tự động các class của các loại report
 * @returns {Object} object chứa các hàm khởi tạo của
 */
export const autoLoadChartClasses = function () {
    if (Object.keys(loadedClasses) == 0) {
        let context = require.context(
            '@/components/dashboard/reports',
            true,
            /\.(chart\.js)$/
        );
        let rsl = {};
        let obj;
        let reportClass = null;
        context.keys().forEach((filePath) => {
            reportClass = context(filePath).default;
            obj = new reportClass();
            rsl[obj.getType()] = reportClass;
        });
        loadedClasses = rsl;
        return rsl;
    } else {
        return loadedClasses;
    }
};

export const getUsedDatasetsFromSetting = function (setting) {
    let rsl = {};
    for (let key in setting) {
        for (let col of setting[key].selectedColums) {
            if (!col.calculation) {
                rsl[col.dataset] = true;
            }
        }
    }
    return rsl;
};

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

export const getSortData = function (cell) {
    let rsl = [];
    for (let name in cell.rawConfigs.setting) {
        let cols = cell.rawConfigs.setting[name].selectedColums;
        for (let col of cols) {
            if (col.sort && col.sort != 'none') {
                rsl.push({
                    mode: col.sort,
                    column: col
                });
            }
        }
    }
    return rsl;
};

/**
 * Kiểm tra xem cell này có cần tính total hay không
 * @param {Object} cell Object chứa thông tin của cell
 * @returns {Boolean}
 */
export const checkNeedTotal = function (cell) {
    if (
        cell.sharedConfigs.type == 'table' ||
        cell.sharedConfigs.type == 'pivot'
    ) {
        return cell.rawConfigs.style.total.children.show.value;
    } else {
        return false;
    }
};

function isDropListFilter(cell) {
    // return cell.sharedConfigs.type == 'filter' && cell.viewConfigs.queryKey;
    return cell.sharedConfigs.type == 'filter';
}

function getTreeTemplate() {
    return {
        id: 'root',
        conjunction: 'AND',
        children: [
            {
                id: 1,
                name: '',
                cond: {
                    type: 'notin',
                    val: ''
                },
                type: 'text',
                dataset: ''
            },
            {
                id: 1,
                name: '',
                cond: {
                    type: 'notin',
                    val: ''
                },
                type: 'text',
                dataset: ''
            }
        ],
        nodeType: 'group'
    };
}

function getRightOperand(operand) {
    let map = {
        empty: 'isblank',
        not_empty: 'notblank',
        begins_with: 'startwith',
        not_contain: 'notcontains'
    };
    return map[operand] ? map[operand] : operand;
}

function overrideTemplateItem(children, advancedCond, col, name, index) {
    name = extractDescriptionFromTitle(name).as;
    children[index].cond.val = advancedCond[index].value;
    children[index].name = name;
    children[index].cond.type = getRightOperand(advancedCond[index].type);
    children[index].type = col.dataType;
    children[index].dataset = col.dataset;
}

function getConditionFromSelfFilter(sharedConfigs) {
    let rsl = [];
    let selfFilter = sharedConfigs.selfFilter;
    for (let name in selfFilter.cols) {
        let col = selfFilter.cols[name];
        let advancedCond = col.conditionFilter.items;
        let condTree = getTreeTemplate();
        condTree.conjunction = col.conditionFilter.conjunction;
        condTree.id = name;
        condTree.dataset = col.dataset;
        // Nếu áp dụng bộ filter phức tạp
        if (advancedCond[0].type != 'none') {
            overrideTemplateItem(condTree.children, advancedCond, col, name, 0);
            if (advancedCond[1].type != 'none') {
                overrideTemplateItem(
                    condTree.children,
                    advancedCond,
                    col,
                    name,
                    1
                );
            } else {
                condTree.children.splice(1, 0);
            }
        } else {
            // Nếu áp dụng bộ filter đơn giản là chọn hoặc không các giá trị trong danh sách cho trước
            let value = '';
            let op = '';
            if (!isEmpty(col.valuesIn)) {
                value = Object.keys(col.valuesIn).join(',');
                op = 'in';
            } else if (!isEmpty(col.valuesNotIn)) {
                value = Object.keys(col.valuesNotIn).join(',');
                op = 'notin';
            }

            if (op != '') {
                condTree.children.splice(1, 0);
                condTree.children[0].cond.val = value;
                // condTree.children[0].name = name;
                condTree.children[0].name =
                    extractDescriptionFromTitle(name).as;
                condTree.children[0].cond.type = op;
                condTree.children[0].type = col.dataType;
                condTree.children[0].dataset = col.dataset;
                condTree.children = [condTree.children[0]];
            }

            if (col.searchKey) {
                let newChild = {
                    id: 1,
                    name: name,
                    cond: {
                        type: 'contains',
                        val: col.searchKey
                    },
                    type: col.dataType,
                    dataset: col.dataset
                };
                if (op) {
                    condTree.children.push(newChild);
                } else {
                    condTree.children = [newChild];
                }
            }
        }
        if (condTree.children.length > 1) {
            rsl.push(condTree);
        } else {
            rsl.push(condTree.children[0]);
        }
    }
    return rsl;
}

export const getDataInputForReport = function (
    cell,
    relations,
    deleteMenuOptions = true,
    useSelfFilter = true
) {
    let needGetAllDataForTablePivot = false;
    let columnsSetting = {};
    let selectedDataset = {};
    let cellType = cell.sharedConfigs.type;
    let hierarchy = {};
    if (
        (cellType == 'table' || cellType == 'pivot') &&
        cell.rawConfigs.setting.value &&
        cell.rawConfigs.setting.value.selectedColums
            .slice(0, cell.rawConfigs.setting.value.selectedColums.length - 1)
            .some((col) => col.menuOptions.groupBy.value)
    ) {
        delete cell.sharedConfigs.pageSize;
    }
    for (let name in cell.rawConfigs.setting) {
        columnsSetting[name] = cell.rawConfigs.setting[name].selectedColums;
        for (let col of columnsSetting[name]) {
            // if (cellType == 'table') {
            //     col.as = col.as.replace(/\./g, ' ');
            // }
            if (!selectedDataset.hasOwnProperty(col.dataset)) {
                selectedDataset[col.dataset] = {};
            }
            selectedDataset[col.dataset][col.name] = true;
        }
    }

    if (cellType == 'card') {
        columnsSetting['value'] = columnsSetting['value'].concat(
            columnsSetting['compareValue']
        );
    } else if (cellType == 'treeMap') {
        if (columnsSetting['group'][0]) {
            columnsSetting['group'][0].agg = 'not_agg';
        }
        if (columnsSetting['detail'][0]) {
            columnsSetting['detail'][0].agg = 'not_agg';
        }
    } else if (cellType == 'filter' && columnsSetting.value[0]) {
        columnsSetting.value[0].selectionMode =
            cell.rawConfigs.style.selectionControl.children.selectionMode.value;
    } else if (cellType == 'table') {
        for (let col of cell.rawConfigs.setting.value.selectedColums) {
            col.lastLineAgg = col.menuOptions.bottomRowAgg.value.toLowerCase();
            if (col.menuOptions.groupBy && col.menuOptions.groupBy.value) {
                needGetAllDataForTablePivot = true;
            }
            col.exactMatchWithFilter =
                col.menuOptions.exactMatchWithFilter.value;
            if (deleteMenuOptions) {
                delete col.menuOptions;
            }
        }
    } else if (cellType == 'gantt') {
        if (
            cell.rawConfigs.setting.id.selectedColums.length > 0 &&
            cell.rawConfigs.setting.parent.selectedColums.length > 0
        ) {
            hierarchy = {
                idColumn: cell.rawConfigs.setting.id.selectedColums[0],
                parentColumn: cell.rawConfigs.setting.parent.selectedColums[0]
            };
        }
    }
    let filter = [];
    for (let id in cell.sharedConfigs.filter) {
        filter = filter.concat(cell.sharedConfigs.filter[id]);
    }

    let condition = cell.rawConfigs.condition;

    /**Phát hiện drop list filter để giới hạn các giá trị hiển thị cho lựa chọn */
    if (isDropListFilter(cell)) {
        let cond = [];
        for (let item of condition) {
            cond.push(item);
        }

        let col = columnsSetting['value'][0];
        if (col && cell.sharedConfigs.queryKey) {
            let condCol = Object.assign({}, col);
            condCol.cond = {
                type: 'contains',
                val: cell.sharedConfigs.queryKey
            };
            cond.push(condCol);
        }
        condition = cond;
    }

    let sortData = getSortData(cell);

    let reportName = cell.rawConfigs.style.title.children.titleText.value;
    let rsl = {
        relations: relations,
        columns: columnsSetting,
        condition: condition,
        reportType: cell.sharedConfigs.type,
        cellId: cell.sharedConfigs.cellId,
        filter: filter,
        // searchData: cell.sharedConfigs.searchData,
        crossFilterCond: cell.sharedConfigs.crossFilterCond,
        sort: sortData,
        reportName: reportName,
        needTotal: checkNeedTotal(cell),
        hierarchical: hierarchy,
        afterQuery: {
            where: [],
            select: []
        }
    };

    if (cellType == 'spreadsheet') {
        rsl.connectConfig = {};
        for (const key in cell.rawConfigs.connectConfig) {
            rsl.connectConfig[key] = cell.rawConfigs.connectConfig[key].value;
        }
    }

    if (useSelfFilter) {
        rsl.afterQuery.where = getConditionFromSelfFilter(cell.sharedConfigs);
    }
    if (Object.keys(cell.sharedConfigs.searchData).length > 0) {
        rsl.searchData = cell.sharedConfigs.searchData;
    }

    let pageSize = 1000;
    if (cellType == 'table' || cellType == 'pivot' || cellType == 'gantt') {
        pageSize = 50;
        if (needGetAllDataForTablePivot) {
            pageSize = 10000;
        }
        rsl.pageSize = cell.sharedConfigs.pageSize
            ? cell.sharedConfigs.pageSize
            : pageSize;
    }
    rsl.currentPage = cell.sharedConfigs.currentPage
        ? cell.sharedConfigs.currentPage
        : 1;

    if (
        cell.rawConfigs.sortOnQuery &&
        cell.rawConfigs.sortOnQuery.sortOnQuery.selectedColums.length > 0
    ) {
        rsl.sortOnQuery = [];
        cell.rawConfigs.sortOnQuery.sortOnQuery.selectedColums.forEach((e) => {
            let obj = {
                column: e,
                mode: e.menuOptions.sortDesc.value ? 'DESC' : 'ASC'
            };
            rsl.sortOnQuery.push(obj);
        });
    }

    if (cell.sharedConfigs.experimentalMode) {
        rsl.experimentalMode = cell.sharedConfigs.experimentalMode;
    }
    return rsl;
};
export const getMenuOptionForYaxis = function () {
    return {
        independentLegend: {
            icon: 'mdi-pencil',
            title: 'v2.dashboard.indepentdentOnLegend',
            type: 'simpleWithCheck',
            value: false,
            event: 'on-column-independent-legend-toggle'
        }
    };
};

export const extractDescriptionFromTitle = function (title) {
    let s = title.split('//');
    return {
        as: s[0],
        des: s[1] ? s[1] : s[0]
    };
};

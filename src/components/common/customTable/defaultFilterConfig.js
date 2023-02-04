import { util } from './../../../plugins/util.js';
import Api from '@/api/api.js';
import _isEmpty from 'lodash/isEmpty';
var apiObj = new Api('');
const typesCanHaveEmptyValue = {
    empty: true,
    not_empty: true,
};
const defaultConfig = {
    sort: '',
    dataType: 'text', // Loại dữ liệu của cột này
    searchKey: '',
    selectAll: true,
    total: 0,
    valuesIn: {},
    valuesNotIn: {},
    selectItems: [], // danh sách các item hiển thị cho autocomplete trong  filter, mỗi item có dạng: {value: 'xx', checked: true}
    clickedSelectAll: true,
    searchLocal: false, // chỉ định là search ở local hay ở server
    fullOptions: [], // chứa tất cả các option có thể có để search local
    conditionFilter: {
        // Các giá trị của lọc theo điều kiện
        conjunction: 'and',
        items: [
            {
                type: 'none',
                value: '',
            },
            {
                type: 'none',
                value: '',
            },
        ],
    },
};

export const getDefaultFilterConfig = function () {
    return util.cloneDeep(defaultConfig);
};

export const getDefaultFilterConfigForNumeric = function () {
    let rsl = util.cloneDeep(defaultConfig);
    // rsl.conditionFilter.items[0].type = 'equal';
    return rsl;
};

export const convertDisplayFilterToQuery = function (
    colName,
    filter,
    filterData = null,
    option = null,
) {
    let condition = filter.conditionFilter;
    if (!option) {
        option = {
            column: colName, // tên cột cần filter
            operation: condition.conjunction,
            conditions: [],
        };
    }

    if (condition.items[0].type != 'none') {
        option.conditions = [
            {
                name: condition.items[0].type,
                value: condition.items[0].value,
            },
        ];
        if (condition.items[1].type != 'none') {
            option.conditions.push({
                name: condition.items[1].type,
                value: condition.items[1].value,
            });
        }
    }
    if (
        filter.searchKey != '' &&
        filter.clickedSelectAll &&
        !filter.customGetDataForFilter
    ) {
        option.conditions = [
            {
                name: 'contains',
                value: filter.searchKey,
            },
        ];
    }

    if (
        filterData &&
        filterData.customConditionsForFilter &&
        filterData.customConditionsForFilter[colName]
    ) {
        filterData.customConditionsForFilter[colName](option, filter);
    } else {
        if (filter.selectAll && Object.keys(filter.valuesNotIn).length > 0) {
            option.conditions.push({
                name: 'not_in',
                value: Object.keys(filter.valuesNotIn),
            });
        } else if (
            !filter.selectAll &&
            Object.keys(filter.valuesIn).length > 0
        ) {
            if(Object.keys(filter.valuesIn).some(key=>key!='')){
            option.conditions.push({
                name: 'in',
                value: Object.keys(filter.valuesIn),
            });}
            else{
                option.conditions.push({name:'empty'})
            }
        }
    }
    return option;
};

/**
 * Chuyển đổi cấu hình filter của component này sang dạng api hiểu được
 */
export const getFilterConfigs = function (getDataMode = '', filterData) {
    let configs = [];
    if (filterData.customConditionsForFilter) {
        for (let key in filterData.customConditionsForFilter) {
            if (typeof filterData.customConditionsForFilter[key] == 'string') {
                eval(
                    'filterData.customConditionsForFilter[key] = ' +
                    filterData.customConditionsForFilter[key],
                );
            }
        }
    }

    for (let colName in filterData.allColumn) {
        let filter = filterData.allColumn[colName];
        let condition = filter.conditionFilter;
        let option = {
            column: colName, // tên cột cần filter
            operation: condition.conjunction,
            conditions: [],
            dataType: filter.dataType ? filter.dataType : 'text',
        };

        if (
            getDataMode == 'autocomplete' &&
            colName == filterData.currentColumn.name
        ) {
            option.conditions = [
                {
                    name: 'contains',
                    value: filterData.currentColumn.colFilter.searchKey
                        ? filterData.currentColumn.colFilter.searchKey
                        : '',
                },
            ];
            configs.push(option);
            continue;
        }

        // if (condition.items[0].type != "none") {
        //     option.conditions = [
        //         {
        //             name: condition.items[0].type,
        //             value: condition.items[0].value
        //         }
        //     ];
        //     if (condition.items[1].type != "none") {
        //         option.conditions.push({
        //             name: condition.items[1].type,
        //             value: condition.items[1].value
        //         });
        //     }
        // }
        // if(filter.searchKey != '' && filter.clickedSelectAll && !filter.customGetDataForFilter){
        //     option.conditions = [
        //         {
        //             name: 'contains',
        //             value: filter.searchKey
        //         }
        //     ];
        // }

        // if(filterData.customConditionsForFilter && filterData.customConditionsForFilter[colName]){
        //     filterData.customConditionsForFilter[colName](option, filter);
        // }else{
        //     if(filter.selectAll && Object.keys(filter.valuesNotIn).length > 0){
        //         option.conditions.push({
        //             name: 'not_in',
        //             value: Object.keys(filter.valuesNotIn)
        //         });
        //     }else if(!filter.selectAll && Object.keys(filter.valuesIn).length > 0){
        //         option.conditions.push({
        //             name: 'in',
        //             value: Object.keys(filter.valuesIn)
        //         });
        //     }
        // }
        option = convertDisplayFilterToQuery(
            colName,
            filter,
            filterData,
            option,
        );
        if (option.conditions.length > 0) {
            configs.push(option);
        }
    }
    return configs;
};

function getOptionForGetList(configs, columns, filterData) {
    let options = {
        filter: getFilterConfigs(configs.getDataMode, filterData),
        sort: getSortConfigs(filterData),
        search: configs.searchKey,
        page: configs.page,
        pageSize: configs.pageSize ? configs.pageSize : configs.pageSize,
        columns: columns ? columns : [],
        distinct: configs.distinct ? configs.distinct : false,
        formulaCondition: configs.formulaCondition
            ? configs.formulaCondition
            : null,
    };
    if (configs.processInstanceId) {
        options.processInstanceId = configs.processInstanceId;
    }
    if (configs.moreApiParam) {
        options = Object.assign(options, configs.moreApiParam);
    }
    if (configs.searchColumns) {
        options.searchColumns = configs.searchColumns;
    }
    return options;
}

function getSortConfigs(filterData) {
    let sort = [];
    for (let colName in filterData.allColumn) {
        let filter = filterData.allColumn[colName];
        if (filter.sort != '') {
            sort.push({
                column: colName,
                type: filter.sort,
            });
        }
    }
    return sort;
}

/**
 *
 * @param {String} url Chứa Url để lấy dữ liệu
 * @param {Object} configs Chứa các config, có cấu trúc bắt buộc như sau:
 * {
 *      getDataMode: '', // chế độ lấy data, nhận một trong các giá trị: autocomplete hoặc normal
 *      searchKey: '', // Từ khóa tìm kiếm trên tất cả các cột
 *      page: 1, // trang muốn hiển thị
 *      pageSize: 50, // Kích thước trang mỗi lần request
 *      distinct: false, // Kết quả trả về có distinct hay ko
 *      conditionByFormula: '' // công thức để giới hạn dữ liệu, thường để rỗng ,
 *      emptyOption: false, // quy định option khi truyền vào cho api sẽ là object rỗng, thường nhận giá trị false
 * }
 * @param {Array} columns Chứa tên của các cột cần select ra trong kết quả, có định dạng như bên dưới, nếu là mảng rỗng thì chọn hết các cột
 *      ['id', ...]
 * @param {Object} filterData Chứa dữ liệu phục vụ cho việc filter, có định dạng
 *  {
 *
 *       allColumn: {
 *           // cấu hình filter của tất cả các cột trong bảng này dạng {tên cột : cấu hình filter}
 *       },
 *       currentColumn: {
 *           colFilter: {địn dạng giống như biến defaultConfig ở trên cùng của file này},
 *           name: ""
 *       },
 *       allColumnInTable: [] // chứa tên của tất cả các cột có trong danh sách
 *  }
 * @param {Function} success Hàm xử lý dữ liệu khi lấy data thành công
 * @param {String} method Method phục vụ cho gọi API: GET, POST
 * @param {Object} header header phục vụ cho request
 */
export const getDataFromConfig = function (
    url,
    configs,
    columns,
    filterData,
    success,
    method = 'GET',
    header = {},
    dataConfig = {},
    error = false,
) {
    let options = {};
    let customContentType = {};
    if (configs.customDataForApi) {
        for (let k in configs.customDataForApi) {
            options[k] = configs.customDataForApi[k];
        }
        options.listItemFilter = getOptionForGetList(
            configs,
            columns,
            filterData,
        );
    } else {
        if (!configs.emptyOption) {
            options = getOptionForGetList(configs, columns, filterData);
        }
    }
    for (let i in options) {
        if (!options[i] || options[i].length == 0) {
            delete options[i];
        }
        if (i == 'listItemFilter') {
            for (let j in options[i]) {
                if (!options[i][j] || options[i][j].length == 0) {
                    delete options[i][j];
                }
            }
        }
    }
    if (dataConfig.customContentType) {
        customContentType.contentType = 'application/json';
    }
    if (dataConfig.groupBy && dataConfig.columns) {
        options.groupBy = dataConfig.groupBy;
    }
    if (configs.filter) {
        options.filter = configs.filter;
    }
    if (dataConfig.isTranslateUser) {
        options.isTranslateUser = 0
    }
    // hoangnd: trường hợp lấy config filter cho export
    if (dataConfig.isExport) {
        options.isExport = true;
        success(options);
    } else {
        apiObj
            .callApi(method, url, options, header, customContentType)
            .then((data) => {
                success(data);
            })
            .catch((err) => {
                if (error) {
                    error(err);
                }
            });
    }
};

export const checkColumnHasFilter = function (filter) {
    let type = 'none';
    try {
        type = filter.conditionFilter.items[0].type;
    } catch (error) { }
    if (
        _isEmpty(filter.valuesIn) &&
        _isEmpty(filter.valuesNotIn) &&
        !filter.searchKey &&
        (type == 'none' ||
            (type != 'none' &&
                !typesCanHaveEmptyValue[type] &&
                !String(filter.conditionFilter.items[0].value).trim()))
    ) {
        return false;
    } else {
        return true;
    }
};

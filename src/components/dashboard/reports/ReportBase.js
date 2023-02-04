import { getStyleItems } from '@/components/dashboard/configPool/reportStyleItems.js';
import { getColumnConfigItems } from '@/components/dashboard/configPool/reportColumnSettingItems.js';
import {
    getUsedDatasetsFromSetting,
    extractDescriptionFromTitle,
} from '@/components/dashboard/configPool/reportConfig.js';
import treeConditionConverter from '@/components/dashboard/configPool/treeConditionToJSString.js';
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import _isEmpty from 'lodash/isEmpty';

var commonStyleAttrItems = {
    general: {
        title: 'v2.dashboard.general',
        items: [
            'fontFamily',
            'bgColor',
            'borderWidth',
            'borderColor',
            'colorPalette',
        ],
    },
    title: {
        title: 'v2.dashboard.titleConfig',
        items: [
            'show',
            'titleText',
            'fontColor',
            'textSize',
            'alignment',
            'bgColor',
        ],
    },
};

/**
 * Class chứa các thuộc tính và các phương thức chung của toàn bộ các report
 */
export default class ReportBase {
    hasSelfFilter = true;
    // Các thuộc tính bắt buộc phải có ở các class kế thừa class này
    mustOverrideMembers = {
        /**
         * columnSettingKeys chứa cấu hình về các trường cần config cho column của từng report, theo định dạng:
         * {
         *      headerFormat: {
         *          title: 'Header Style',
         *          items: ['show','titleText', ...]
         *      },...
         * }
         */
        columnSettingKeys: {},

        /**
         * Chứa cấu hình về các trường cần config cho style của report, có dạng:
         * {
         *      headerFormat: {
         *          title: 'Header Style',
         *          items: ['show','titleText', ...]
         *      },...
         * }
         */
        styleKeys: {},
    };

    rawConfigs = {
        // config thô do BA setting
        condition: [], // cấu hình điều kiện cho report này
        setting: {}, // cấu hình cho các cột
        style: {}, // cấu hình cho việc hiển thị của report
        sortOnQuery: {}, // cấu hình cho việc cho phép sort các trường dữ liệu khi đang query lấy dữ liệu
        extra: {
            autoRefreshing: false, // tự động refresh report khi thay đổi cấu hình cột
        },
    };
    sharedConfigs = {
        // các cấu hình chung của report
        cellId: '', // id đánh tự động của report
        data: [], // dữ liệu thô được lấy từ server
        type: '', // loại report
        yAxisCount: 1, // số lượng yAxis được sử dụng,
        filter: {},
        searchData: {},
        crossFilterCond: '',
        getDataTimes: 0,
        /**
         * Cấu hình cho filter riêng report này
         */
        selfFilter: {
            cols: {
                // 'column-name': {
                //     type: 'selection', // hoặc condition
                //     value: {} // cấu hình của bộ filter
                // }
            },
            applied: false, // đã áp dụng bộ filter hay chưa
            opening: [], // index các cột trong mảng đang được mở
        },
        canExport: true,
    };
    commentCount = 0;
    viewConfigs = {
        // cấu hình phục vụ cho việc hiển thị
        commentCount: 0, // số lượng comment
        displayOptions: {
            // cấu hình được translate từ các rawConfig thành cấu hình tương ứng của thư viện
            symperTitle: {},
            general: {},
            data: [],
            contentSize: {
                h: 0,
                w: 0,
            },
        },
        filter: {}, // filter áp dụng cho report này
        isSelecting: false, // có đang click để lựa chọn hay không
        loadingData: false, // có đang tải dữ liệu không
        needSaveExtraOptions: {}, // các cấu hình phụ cần lưu trong quá trình tương tác với report, vd: chiều rộng của các column trong table sau resize
        selectedDataset: {}, // chứa các cột trong các dataset  được lựa chọn cho report này
        showIcon: true, // có hiển thị icon ko
        exportingExcel: false,
        error: {
            exist: false,
            detail: {},
        },
        excludeHeaderOptions: {},
    };

    configItems = [
        {
            name: 'column',
            tag: 'column-config',
            text: 'bi.dashboard.column-config',
            icon: 'mdi-table-column-width',
        },
        {
            name: 'style',
            tag: 'style-config',
            text: 'bi.dashboard.style-config',
            icon: 'mdi-box-cutter',
        },
        {
            name: 'condition',
            tag: 'condition-config',
            text: 'bi.dashboard.condition-config',
            icon: 'mdi-checkbox-multiple-marked-outline',
        },
    ];

    constructor(type, symperId = '', columnSettingKeys, styleKeys) {
        if (!symperId) {
            symperId = 'cell-' + Date.now();
        }
        this.sharedConfigs.cellId = symperId;
        this.sharedConfigs.type = type;
        this.checkRequiredVariables(columnSettingKeys, styleKeys);
        this.setColumnSettingTemplate(columnSettingKeys);
        this.setStyleConfigTemplate(styleKeys);
        this.setSortOnQueryTemplate();
        this.setDefaultMenuOptions();
    }

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
                        // icon: "",
                        title: 'v2.dashboard.exactMatchWithFilter',
                        type: 'simpleWithCheck',
                        value: false,
                        event: 'change-column-exact-match-with-filter',
                    },
                };
            }
        }
    }

    setColumnSettingTemplate(columnSettingKeys) {
        if (columnSettingKeys) {
            this.rawConfigs.setting = getColumnConfigItems(columnSettingKeys);
        }
    }
    setSortOnQueryTemplate() {
        //config sort on query
        this.rawConfigs.sortOnQuery = getColumnConfigItems(['sortOnQuery']);
        // add menu options for sort on query
        this.rawConfigs.sortOnQuery.sortOnQuery.menuOptions = {
            sortAsc: {
                icon: 'mdi-sort-ascending',
                title: 'v2.dashboard.sortAsc',
                type: 'simpleWithCheck',
                value: true,
                event: 'sort-on-query-asc',
            },
            sortDesc: {
                icon: 'mdi-sort-descending',
                title: 'v2.dashboard.sortDesc',
                type: 'simpleWithCheck',
                value: false,
                event: 'sort-on-query-desc',
            },
        };
    }
    setPrependIcons() {
        let setting = this.rawConfigs.setting
        for (let key in setting) {
            if (setting[key].menuOptions != undefined) {
                let confKey = Object.keys(setting[key].menuOptions)[Object.keys(setting[key].menuOptions).length - 1]
                for (let col in setting[key].selectedColums) {
                    if ((Object.keys(setting[key].selectedColums[col]).includes('menuOptions'))) {
                        if (Object.keys(this.prependIcons).includes(confKey) && setting[key].selectedColums[col].menuOptions[confKey].value) {
                            this.rawConfigs.setting[key].selectedColums[col].prependIcon = this.prependIcons[confKey]
                        }
                        else {
                            this.rawConfigs.setting[key].selectedColums[col].prependIcon = ""
                        }
                    }
                }

            }
        }
    }
    setStyleConfigTemplate(styleKeys) {
        if (styleKeys) {
            let allStyleItems = Object.assign({}, commonStyleAttrItems);
            allStyleItems = Object.assign(allStyleItems, styleKeys);

            let style = {};
            let item = {};
            for (let key in allStyleItems) {
                item = allStyleItems[key];
                let group = {
                    children: {},
                    label: item.title,
                    name: key,
                    show: true,
                };
                group.children = getStyleItems(item.items);
                style[key] = group;
            }
            if(this.sharedConfigs.type=='pie'||this.sharedConfigs.type=='donut'){
                style.groupSeries.children.lessThanValue.title+='-percent'
                style.groupSeries.children.totalSeriesGroupValue.title+='-percent'
            }
            this.rawConfigs.style = style;
        }
    }

    checkRequiredVariables(columnSettingKeys, styleKeys) {
        let className = this.__proto__.constructor.name;
        if (!columnSettingKeys) {
            console.error(
                `Missing parameter "columnSettingKeys" when construct object in class "${className}"`,
            );
        }

        if (!styleKeys) {
            console.error(
                `Missing parameter "styleKeys" when construct object in class "${className}"`,
            );
        }
    }

    getType() {
        return this.sharedConfigs.type;
    }

    /**
     * Hàm chuyển đổi từ cấu hình của Symper sang cấu hình của thư viện được sử dụng
     */
    // async translate(){

    // }

    /**
     * Hàm lấy config để lưu xuống DB
     */
    getConfigToSave() {
        return this.getConfigToSaveDefault();
    }
    restoreSetting(cell) {
        let self = this;
        let setting =
            typeof cell.settings == 'string'
                ? JSON.parse(cell.settings)
                : cell.settings;
        for (let name in setting) {
            if (this.rawConfigs.setting.hasOwnProperty(name)) {
                if (setting[name].length > 0) {
                    setting[name].forEach(function (e, idx) {
                        e.as = e.as.trim().replace(/\s+/g, ' ');
                        // set giá trị cho menuOptions
                        if (self.rawConfigs.setting[name].menuOptions) {
                            e.menuOptions = _cloneDeep(
                                self.rawConfigs.setting[name].menuOptions,
                            );
                            if (e.menuOptionsValue) {
                                for (let key in e.menuOptions) {
                                    if (
                                        e.menuOptionsValue.hasOwnProperty(key)
                                    ) {
                                        e.menuOptions[key].value =
                                            e.menuOptionsValue[key];
                                    }
                                }
                            }
                            if (idx == setting[name].length - 1) {
                                delete setting[name][idx].menuOptions.groupBy
                                if (_isEmpty(setting[name][idx].menuOptions)) {
                                    delete setting[name][idx].menuOptions
                                }
                            }
                        }
                    });
                }
                this.rawConfigs.setting[name].selectedColums = setting[name];
            }
        }
    }

    restoreStyle(cell) {
        let style =
            typeof cell.style == 'string' ? JSON.parse(cell.style) : cell.style;
        let item = null;
        for (let key in this.rawConfigs.style) {
            item = this.rawConfigs.style[key];
            if (style.hasOwnProperty(item.name)) {
                for (let propName in style[item.name]) {
                    if (item.children.hasOwnProperty(propName)) {
                        item.children[propName].value =
                            style[item.name][propName].value;
                    }
                }
            }
        }
    }

    restoreByDefault(cell, customUIData) {
        this.rawConfigs.condition =
            typeof cell.condition == 'string'
                ? JSON.parse(cell.condition)
                : cell.condition;
        this.restoreSetting(cell);
        this.restoreStyle(cell);
        let extra = cell.extra ? JSON.parse(cell.extra) : {};
        if (customUIData && typeof customUIData == 'object') {
            this.rawConfigs.extra = _merge(extra, customUIData);
        }
        this.rawConfigs.extra = extra;
        this.sharedConfigs.usedDatasets = getUsedDatasetsFromSetting(
            this.rawConfigs.setting,
        );
        this.rawConfigs.sortOnQuery.sortOnQuery.selectedColums =
            extra.sortOnQuery ? extra.sortOnQuery : [];
    }

    /**
     * Hàm khôi phục config từ dữ liệu đã lưu thành cấu hình có thể hiển thị
     */
    restoreConfigFromSavedData(cell, customUIData) {
        this.restoreByDefault(cell, customUIData);
    }

    getExtraDataToSave() {
        return this.rawConfigs.extra;
    }

    assignComputedAttrsValue(attr) {
        for (let key in attr) {
            this[key] = attr[key];
        }
    }

    getStyleItemsInConfig(st, sizeUnit = '', ratio) {
        let rsl = {
            textOutline: '0px',
            display: st.show === undefined ? '' : st.show.value ? '' : 'none',
            backgroundColor: st.bgColor ? st.bgColor.value : '',
            color: st.fontColor ? st.fontColor.value : '',
            fontFamily: st.fontFamily ? st.fontFamily.value : 'roboto',
            fontSize: (st.textSize ? st.textSize.value : 13) * ratio + sizeUnit,
            textAlign: st.alignment ? st.alignment.value : '',
            borderBottomWidth: st.borderBottomWidth
                ? st.borderBottomWidth.value + sizeUnit
                : '',
            borderWidth: st.borderWidth ? st.borderWidth.value + sizeUnit : '',
            borderStyle: st.borderStyle ? st.borderStyle.value : 'none',
        };

        if (st.borderBottomColor && st.borderBottomColor.value) {
            rsl.borderBottomColor = st.borderBottomColor.value;
        }

        if (st.borderColor && st.borderColor.value) {
            rsl.borderColor = st.borderColor.value;
        }

        return rsl;
    }

    /**
     * Dịch các thông tin chung của tất cả các cell thành dạng css
     * @param {Object} commonAttr Object chứa thông tin về các thuộc tính chung của cell,
     * trùng với các thông tin ở hàm  getCommonAttr() trong file getAtyleAttesFuncs
     */
    getCommonCellStyleAttr(commonAttr, ratio) {
        return {
            general: this.getStyleItemsInConfig(
                commonAttr.general.children,
                'px',
                ratio,
            ),
            symperTitle: {
                text: commonAttr.title.children.titleText.value,
                style: this.getStyleItemsInConfig(
                    commonAttr.title.children,
                    'px',
                    ratio,
                ),
            },
        };
    }

    getZeroValueDisplay(style) {
        let zeroValueDisplay = style.cellFormat.children.zeroValueDisplay.value;
        if (zeroValueDisplay == 'blank') {
            zeroValueDisplay = '';
        } else if (zeroValueDisplay == 'original') {
            zeroValueDisplay = 0;
        }
        return zeroValueDisplay;
    }

    makeDisplayColOptions(
        cellStyle,
        list,
        keyAs = 'name',
        keyName = 'name',
        prevDisplayOptions,
    ) {
        let rsl = [];
        list = list ? list : [];
        let extraDisplay = cellStyle.extraData ? cellStyle.extraData : {};
        let colsWidth = extraDisplay.columnsWidth
            ? extraDisplay.columnsWidth
            : {};
        let mapNameToColumn = {};
        list.forEach((element) => {
            mapNameToColumn[element.columnName] = element;
            let newCol = {
                headerName: element[keyAs],
                field: element[keyName],
                headerTooltip: element.headerTooltip
                    ? element.headerTooltip
                    : element[keyAs],
                symperType: element.type,
                type: element.type,
                symperColumnName: element.columnName
                    ? element.columnName
                    : element.name,
                editable: false,
                symperCellConfig: {
                    decimal: cellStyle.symperCellConfig.decimalTootip,
                },
                lastLineAgg: element.lastLineAgg ? element.lastLineAgg : 'sum',
                headerClass: 'symper-table-dashboard-header',
                cellClass: element.type == 'number' ? 'text-align-right' : '',
            };
            element.symperValueColumn &&
                (newCol.symperValueColumn = element.symperValueColumn);
            if (element.type == 'number') {
                newCol.symperCellConfig.zeroValueDisplay =
                    cellStyle.symperCellConfig.zeroValueDisplay;
            }

            if (cellStyle.symperCellConfig.headerWrapText) {
                newCol.headerClass += ' symper-table-dashboard-header-wraptext';
            }

            newCol.symperCellConfig.decimalNumber =
                cellStyle.symperCellConfig.decimalTootip;
            rsl.push(newCol);
        });
        rsl = treeConditionConverter.addConditionFormatToColDef(
            rsl,
            cellStyle.originStyle,
            mapNameToColumn,
            '0',
        );

        return rsl;
    }

    /**
     * Hàm check xem một cấu hình đã đủ điều kiện để gọi về server để lấy dữ liệu hay chưa
     * Có thể override ở các class con tùy thuộc vào đặc thù của từng loại chart
     */
    canGetDataFromServer() {
        let columnSetting = this.rawConfigs.setting;
        let canRun = false;
        for (let key in columnSetting) {
            if (
                columnSetting[key].selectedColums &&
                columnSetting[key].selectedColums.length > 0
            ) {
                canRun = true;
                break;
            }
        }
        return canRun;
    }

    /**
     * Hàm chỉnh sửa data sau khi đã đi qua hàm translate của class,
     * có thêm hàm này do: hàm translate được chạy ở worker,
     * khi muốn set callback cho hành động nào đó mà cần ở trong option của thư viện thì cần phải set ở main process
     *
     * ******** Lưu ý: ko lạm dụng hàm này để tính toán data, mà chỉ để set những thuộc tính mà worker ko thể truyền cho main process được ********
     * @param {Object} translatedData data đã được translate ở hàm translate
     */
    static editTranslatedData(translatedData) {
        return translatedData;
    }
    assignData(newData) {
        for (let i in newData) {
            if (this[i]) {
                this[i] = newData[i];
            }
        }
    }

    extractHeaderDescription() {
        let rawConfig = this.rawConfigs;
        if (!rawConfig.extra) {
            rawConfig.extra = {};
        }

        if (!rawConfig.extra.headerDescription) {
            rawConfig.extra.headerDescription = {};
        }
        for (let key in rawConfig.setting) {
            for (let col of rawConfig.setting[key].selectedColums) {
                let desInfo = extractDescriptionFromTitle(col.as);
                col.as = desInfo.as;
                rawConfig.extra.headerDescription[desInfo.as] = desInfo.des;
            }
        }
    }

    getConfigToSaveDefault() {
        let cell = this.rawConfigs;
        let cellSettings = {};
        for (let name in cell.setting) {
            cellSettings[name] = cell.setting[name].selectedColums;
            for (let col of cellSettings[name]) {
                if (col.menuOptions) {
                    col.menuOptionsValue = {};
                    for (let key in col.menuOptions) {
                        col.menuOptionsValue[key] = col.menuOptions[key].value;
                    }
                }
            }
        }

        let cellStyle = {};
        let attr = {};
        for (let key in cell.style) {
            attr = cell.style[key];
            cellStyle[attr.name] = {};
            for (let itemName in attr.children) {
                cellStyle[attr.name][itemName] = {
                    value: attr.children[itemName].value,
                };
            }
        }
        let extraConfig = {};
        if (cell.extra) {
            extraConfig = this.getExtraDataToSave();
        }
        this.addMoreExtraConfig(extraConfig, cell);
        return {
            settings: cellSettings,
            style: cellStyle,
            extra: extraConfig,
        };
    }

    addMoreExtraConfig(extraConfig, cell) {
        extraConfig.sortOnQuery = cell.sortOnQuery.sortOnQuery.selectedColums;
    }
}

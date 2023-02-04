import ReportGroupConfig from '@/components/dashboard/configPool/reportGroupConfig';
import ReportBase from './ReportBase';
import { TranslatorHelper } from '@/components/dashboard/configPool/translatorHelper';
import { getColumnConfigItems } from '@/components/dashboard/configPool/reportColumnSettingItems';
import { util } from '@/plugins/util';
import { dashboardApi } from '@/api/dashboard';
export default class Gantt extends ReportBase {
    constructor(symperId) {
        let columnSettingKeys = ReportGroupConfig.Group4.columnSettingKeys;
        let styleKeys = ReportGroupConfig.Group4.styleKeys;
        super('gantt', symperId, columnSettingKeys, styleKeys);
        this.sharedConfigs.pageSize = 500;
        this.sharedConfigs.currentPage = 1;
        this.sharedConfigs.conditionFormatFields = ['gridColumns'];
        this.rawConfigs.style.dataDisplay.children.tooltipDecimalNumber.value = 1;
        this.addGroupConfig();
        this.customColumnOptions();
    }
    async translate(
        rawConfig,
        data,
        extraData = {},
        changes = {},
        oldOutput = {},
    ) {
        let displayOptions = {};
        let dataCopy = util.cloneDeep(data);
        if (
            oldOutput.symperSearchKey &&
            rawConfig.setting.name.selectedColums.length > 0
        ) {
            dataCopy.data = this.filterData(
                dataCopy.data,
                oldOutput.symperSearchKey,
                rawConfig,
            );
        }
        displayOptions = TranslatorHelper.Charts.ganttChart(
            rawConfig,
            dataCopy,
            displayOptions,
            extraData,
            'ganttChart',
            undefined,
            1,
        );
        /**
         * Call api lấy thông tin config group work time
         */
        if (displayOptions.series) {
            let res = await this.getMoreDataForDisplayOptions(
                displayOptions,
                extraData,
            );
            displayOptions.dataWorkTime = {};
            if (res) {
                for (let i in res.data) {
                    displayOptions.dataWorkTime[i] = [];
                    for (
                        let index = 0;
                        index < res.data[i].data.length;
                        index++
                    ) {
                        let item = {};
                        let allColumns;
                        if (this.rawConfigs.group[i]) {
                            allColumns =
                                this.rawConfigs.group[i].translatedItems;
                        } else {
                            let arr = i.split(':');
                            allColumns = {
                                [arr[1]]:
                                    this.rawConfigs.group[arr[0]]
                                        .translatedItems[arr[1]],
                            };
                        }
                        for (let column in allColumns) {
                            if (
                                allColumns[column].selectedColums[0] &&
                                res.data[i].data[index][
                                allColumns[column].selectedColums[0].as
                                ]
                            ) {
                                item[column] =
                                    res.data[i].data[index][
                                    allColumns[column].selectedColums[0].as
                                    ];
                            }
                        }
                        displayOptions.dataWorkTime[i].push(item);
                    }
                }
            }
        }
        displayOptions.decimalNumber =
            rawConfig.style.dataDisplay.children.tooltipDecimalNumber.value;
        return displayOptions;
    }
    restoreConfigFromSavedData(cell) {
        this.restoreByDefault(cell);
        this.restoreExtraConfig(cell);
    }
    restoreExtraConfig(cell) {
        if (cell.extra) {
            let extraConfig = JSON.parse(cell.extra);
            if (extraConfig.group) {
                let groupConfig = extraConfig.group;
                if (Object.keys(groupConfig).length) {
                    for (let i in groupConfig) {
                        for (let j in groupConfig[i]) {
                            if (
                                groupConfig[i][j] &&
                                this.rawConfigs.group[i].translatedItems[j]
                            ) {
                                this.rawConfigs.group[i].translatedItems[
                                    j
                                ].selectedColums = groupConfig[i][j];
                            }
                        }
                    }
                }
            }
            if (extraConfig.fomulasConfig) {
                this.rawConfigs.fomulasConfig = extraConfig.fomulasConfig;
                this.rawConfigs.fomulasConfig.fomulas.formulaValue.style = {
                    height: '265px',
                };
            }
        }
    }
    getExtraDataToSave() {
        let extraData = {
            group: {},
            fomulasConfig: {},
        };
        if (this.rawConfigs.group) {
            for (let i in this.rawConfigs.group) {
                extraData.group[i] = {};
                for (let j in this.rawConfigs.group[i].translatedItems) {
                    extraData.group[i][j] =
                        this.rawConfigs.group[i].translatedItems[
                            j
                        ].selectedColums;
                }
            }
        }
        extraData.fomulasConfig = this.rawConfigs.fomulasConfig;
        return extraData;
    }
    customColumnOptions() {
        this.rawConfigs.setting.gridColumns.menuOptions = {
            editableContent: {
                icon: 'mdi-pencil',
                title: 'v2.dashboard.editableContent',
                type: 'simpleWithCheck',
                value: false,
                event: 'on-column-editable-click',
            },
            defaultColumn: {
                icon: 'mdi-check',
                title: 'v2.dashboard.defaultColumn',
                type: 'simpleWithCheck',
                value: false,
                event: 'on-pin-column-default-click',
            },
            customColumnDisplaySum: {
                icon: 'mdi-plus-box-outline',
                title: 'v2.dashboard.customColumnDisplaySum',
                type: 'simpleWithCheck',
                value: false,
                event: 'on-custom-column-display-sum-click',
            },
        };
        this.rawConfigs.setting.sortBy.menuOptions = {
            sortAsc: {
                icon: 'mdi-sort-ascending',
                title: 'v2.dashboard.sortAsc',
                type: 'simpleWithCheck',
                value: true,
                event: 'on-column-sort-asc',
            },
            sortDesc: {
                icon: 'mdi-sort-descending',
                title: 'v2.dashboard.sortDesc',
                type: 'simpleWithCheck',
                value: false,
                event: 'on-column-sort-desc',
            },
        };
    }
    addGroupConfig() {
        this.configItems.push({
            name: 'group',
            tag: 'group-config',
            text: 'bi.dashboard.group-config',
            icon: 'mdi-group',
        });
        this.rawConfigs.group = ReportGroupConfig.Group5.groupConfig;
        for (let i in this.rawConfigs.group) {
            this.rawConfigs.group[i].translatedItems = getColumnConfigItems(
                this.rawConfigs.group[i].items,
            );
        }
        this.rawConfigs.fomulasConfig = {
            listDocuments: [],
            fomulas: {
                formulaValue: {
                    title: 'v2.dashboard.formulaValue',
                    type: 'script',
                    value: '',
                    style: {
                        height: '270px',
                    },
                    validateStatus: {
                        isValid: true,
                        message: 'v2.dashboard.error',
                    },
                },
            },
        };
    }
    filterData(data, vl, rawConfig) {
        vl = vl.toLowerCase();
        let keyName = rawConfig.setting.name.selectedColums[0].as;
        let dataFilter = [];
        for (let i = 0; i < data.length; i++) {
            let taskName = data[i][keyName].toLowerCase();
            if (taskName.includes(vl)) {
                dataFilter.push(data[i]);
            }
        }
        // push lại task parent
        if (
            rawConfig.setting.parent.selectedColums.length > 0 &&
            dataFilter.length > 0
        ) {
            let keyParent = rawConfig.setting.parent.selectedColums[0].as;
            let keyId = rawConfig.setting.id.selectedColums[0].as;
            for (let i = 0; i < dataFilter.length; i++) {
                if (dataFilter[i][keyParent]) {
                    let isCheck = dataFilter.find(
                        (ele) => ele[keyId] == dataFilter[i][keyParent],
                    );
                    if (!isCheck) {
                        let parent = data.find(
                            (ele) => ele[keyId] == dataFilter[i][keyParent],
                        );
                        if (parent) {
                            let keyStartDate =
                                rawConfig.setting.start_date.selectedColums[0]
                                    .as;
                            delete parent[keyStartDate];
                            dataFilter.push(parent);
                        }
                    }
                }
            }
        }

        return dataFilter;
    }
    getCondition(displayOptions) {
        let arr = [];
        if (displayOptions.series) {
            let tasks = displayOptions.series.data;
            if (tasks.length > 0) {
                tasks.forEach(function (e) {
                    if (e.keyMapping) {
                        if (!arr.includes(e.keyMapping)) {
                            arr.push(e.keyMapping);
                        }
                    }
                });
            }
            return arr.join(',');
        }
    }
    async getMoreDataForDisplayOptions(displayOptions, extraData) {
        let keyMapping = this.getCondition(displayOptions);
        let groups = {};
        if (this.rawConfigs.group) {
            for (let i in this.rawConfigs.group) {
                groups[i] = {
                    currentPage: 1,
                    pageSize: 1000,
                    condition: [],
                    relations: [],
                    reportName: '',
                    reportType: 'gantt',
                    sort: [],
                    relations: [],
                    needTotal: false,
                    cellId: extraData.label,
                    columns: {},
                };
                for (let j in this.rawConfigs.group[i].translatedItems) {
                    if (
                        this.rawConfigs.group[i].translatedItems[j]
                            .selectedColums.length > 0
                    ) {
                        groups[i].columns[j] =
                            this.rawConfigs.group[i].translatedItems[
                                j
                            ].selectedColums;
                    }
                    if (j.includes('keyMapping')) {
                        let columnInfo = this.rawConfigs.group[i].translatedItems[j]
                            .selectedColums[0];
                        if (
                            columnInfo && !columnInfo.calculation
                        ) {
                            let condition = util.cloneDeep(columnInfo);
                            condition.cond = {
                                type: 'in',
                                val: keyMapping,
                            };
                            groups[i].condition = [condition];
                        }
                    }
                }
                if (!Object.keys(groups[i].columns).length) {
                    delete groups[i];
                }
            }
        }
        if (Object.keys(groups).length) {
            let res = await dashboardApi.getDataBatch(groups);
            return res;
        }
    }
}

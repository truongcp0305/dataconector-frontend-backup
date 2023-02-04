import { dashboardApi } from '@/api/dashboard.js';
import { biApi } from '@/api/bi.js';
import { autoLoadChartClasses } from '@/components/dashboard/configPool/reportConfig';
import { getDefaultDashboardConfig } from '@/components/dashboard/configPool/dashboardConfigs.js';
import _cloneDeep from 'lodash/cloneDeep';
import { getNewCellConfigLayout } from '@/components/dashboard/configPool/cellLayout';
import { datasetApi } from '../../api/dataset';
import { util } from '../../plugins/util';
import { getColumnDataset } from '@/components/dashboard/configPool/dashboardConfigs.js';
import { uiConfigApi } from '../../api/uiConfig';
import { relationApi } from '@/api/relation.js';

var mapTypeToClass = autoLoadChartClasses();

onmessage = function (event) {
    let data = event.data;
    let action = data.action;
    if (handler[action]) {
        handler[action](data.data);
    } else {
        console.error(` action ${action} not found `);
    }
};

var handler = {
    /**
     * Khôi phục cấu hình của tất cả các cell từ dữ liệu đã lưu
     * @param {Object} allCell cấu hình của tất cả các cell được lưu
     */
    restoreAllCellConfigs(allCell, customUIData) {
        let cellConfigs = {};
        let newCell = null;
        let cellType = '';
        for (let cell of allCell) {
            cellType = cell.type;
            if (mapTypeToClass[cellType]) {
                newCell = new mapTypeToClass[cellType](cell.id_symper);
                newCell.restoreConfigFromSavedData(
                    cell,
                    customUIData[cell.id_symper]
                );
            } else {
                console.error(
                    `class for report type  "${cellType}" not found`,
                    cell
                );
            }
            cellConfigs[cell.id_symper] = newCell;
        }

        if (!cellConfigs.hasOwnProperty('global')) {
            cellConfigs.global = new mapTypeToClass['global']('global');
        }
        return cellConfigs;
    },

    getLayoutFromConfig(info, allCell) {
        let result = {
            layout: {},
            mobileLayoutData: {}
        };
        let configs = info.configs;
        if (configs.hasOwnProperty('tabsAndPages')) {
            for (let tabName in configs.layout) {
                let layout = configs.layout[tabName];
                result.layout[tabName] = [];
                result.mobileLayoutData[tabName] = [];
                for (let cellId in layout) {
                    let cell = allCell[cellId];
                    if (cell) {
                        let newLayoutItem = getNewCellConfigLayout(
                            allCell[cellId].sharedConfigs.type,
                            [],
                            cellId
                        );
                        newLayoutItem = Object.assign(
                            newLayoutItem,
                            layout[cellId]
                        );
                        newLayoutItem.active = false;
                        if (cellId != 'global') {
                            result.layout[tabName].push(newLayoutItem);
                        }
                    } else {
                        console.warn(
                            'cell id not found ',
                            configs.layout,
                            cellId
                        );
                    }
                }
            }
        } else {
            result['tab 1'] = [];
            for (let cellId in configs.layout) {
                let cell = allCell[cellId];
                if (cell) {
                    let newLayoutItem = getNewCellConfigLayout(
                        cell.sharedConfigs.type,
                        [],
                        cellId
                    );
                    newLayoutItem = Object.assign(
                        newLayoutItem,
                        configs.layout[cellId]
                    );

                    if (cellId != 'global') {
                        result.layout['tab 1'].push(newLayoutItem);
                    }
                } else {
                    console.warn(
                        'cell id not found ',
                        _cloneDeep(configs.layout),
                        cellId
                    );
                }
            }
        }

        return result;
    },

    getDrillThroughFromConfig(info) {
        let rsl = {
            'tab 1': []
        };

        if (info.configs.drillThrough) {
            rsl = info.configs.drillThrough;
        } else {
            if (info.configs.tabsAndPages) {
                for (let item of info.configs.tabsAndPages.tabs) {
                    rsl[item.name] = [];
                }
            }
        }
        return rsl;
    },

    restoreDashboardConfigs(info, allCell) {
        let layout = this.getLayoutFromConfig(info, allCell);
        let result = getDefaultDashboardConfig().dashboardConfigs.info;
        let drillThrough = this.getDrillThroughFromConfig(info);
        result.showOnHomePage = info.hasOwnProperty('showOnHomePage')
            ? Number(info.showOnHomePage)
            : 1;
        result.dashboardName = info.name;
        result.relations = info.configs.extra.relations;
        if (info.configs.hasOwnProperty('tabsAndPages')) {
            for (let tab of info.configs.tabsAndPages.tabs) {
                tab.editTabName = false;
                tab.active = false;
                if (!tab.id) {
                    tab.id = util.str.randomString(6);
                }
            }
            info.configs.tabsAndPages.tabs[0].active = true;
            result.tabsAndPages = info.configs.tabsAndPages;
            result.currentTabPageKey = result.tabsAndPages.tabs[0].name;
        }
        result.layout = layout.layout;
        result.drillThrough = drillThrough;
        result.variables = info.configs.extra.variables;
        result.addedMeasures = this.getAddedMeasures(info.configs.extra);
        result.mobileLayout.vertical = this.getMobileLayout(
            info.configs.extra.mobileLayout.vertical,
            layout.mobileLayoutData
        );
        result.mobileLayout.horizontal = this.getMobileLayout(
            info.configs.extra.mobileLayout.horizontal,
            layout.mobileLayoutData
        );
        return result;
    },
    getMobileLayout(mobileLayout, mobileLayoutData) {
        if (mobileLayout) {
            //check có mobile filter chưa
            if (!mobileLayout.mobileFilter) {
                mobileLayout.mobileFilter = {};
            }
            //check layout
            if (Object.keys(mobileLayout.layout).length == 0) {
                mobileLayout.layout = JSON.parse(
                    JSON.stringify(mobileLayoutData)
                );
            } else {
                let data = Object.keys(
                    JSON.parse(JSON.stringify(mobileLayoutData))
                );
                //check các tab, nếu chưa có thì thêm tab = []
                for (let idx in data) {
                    if (!mobileLayout.layout[data[idx]])
                        mobileLayout.layout[data[idx]] = [];
                }
                //xóa tab bị thừa
                for (let key in mobileLayout.layout) {
                    if (!data.includes(key)) delete mobileLayout.layout[key];
                }
            }
        }
        return mobileLayout;
    },
    getAddedMeasures(extraData) {
        let rsl = extraData.addedMeasures;
        if (rsl) {
            if (typeof rsl == 'string') {
                return JSON.parse(rsl);
            } else {
                return rsl;
            }
        } else {
            return {};
        }
    },

    async getDatasetInfo(data) {
        let { datasetIds, inClickhouseMode } = data;
        let listObj = [];
        if (datasetIds.length) {
            let filter = {
                filter: [
                    {
                        column: 'id',
                        operation: 'and',
                        conditions: [
                            {
                                name: 'in',
                                value: datasetIds
                            }
                        ]
                    }
                ],
                page: 1,
                pageSize: 500
            };
            let res = await datasetApi.getListByFilter(
                filter,
                inClickhouseMode
            );
            listObj = res.data.listObject;
        }
        self.postMessage({
            action: 'applySelectedDatasets',
            data: listObj
        });
    },
    async getDashboardConfigToDisplay(data) {
        let promises = [
            dashboardApi.getDashboardInfo(
                data.idDashboard,
                data.experimentalMode
            )
        ];

        if (data.UIKey) {
            promises.push(uiConfigApi.getUiConfig(data.UIKey));
        }

        let config = {};
        let customUIData = {};

        try {
            let ress = await Promise.all(promises);
            config = ress[0].data;
            customUIData = ress[1];

            if (customUIData && customUIData.status == 200) {
                customUIData = JSON.parse(customUIData.data.detail);
            } else {
                customUIData = {};
            }
        } catch (error) {
            console.error('error when get dashboard display config', error);
        }

        return { config, customUIData };
    },
    async getDashboardInfo(data) {
        let { config, customUIData } = await this.getDashboardConfigToDisplay(
            data
        );
        let allCellConfigs = this.restoreAllCellConfigs(
            config.reports,
            customUIData
        );
        let dashboardInfo = this.restoreDashboardConfigs(
            config.dashboard,
            allCellConfigs
        );
        let needRemoteDataCellCount = 0;

        for (let id in allCellConfigs) {
            if (
                allCellConfigs[id].getType() != 'editor' &&
                allCellConfigs[id].getType() != 'global'
            ) {
                needRemoteDataCellCount += 1;
            }
        }
        let relateDatasetIds = config.dashboard.relateDatasets.reduce(
            (arr, el) => {
                arr.push(el.id);
                return arr;
            },
            []
        );
        let customFilter = await uiConfigApi.getUiConfig(data.widgetIdentifier);
        let mapsRelation = {};
        if (dashboardInfo.relations.length > 0) {
            mapsRelation = await relationApi.getConfig(dashboardInfo.relations);
        }
        self.postMessage({
            action: 'setRestoredDashboardConfigs',
            data: {
                mapsRelation,
                customFilter,
                allCellConfigs,
                dashboardInfo,
                needRemoteDataCellCount,
                relateDatasets: config.dashboard.relateDatasets,
                relateDatasetIds: relateDatasetIds,
                customUIData
            }
        });
        if (data.action == 'view') {
            let datasetColInfo = await getColumnDataset(
                config.dashboard.relateDatasets,
                {
                    columns: {},
                    subDatasets: []
                }
            );
            self.postMessage({
                action: 'setDatasetAndColumnsOnViewAction',
                data: datasetColInfo
            });
        }
    },
    async deleteRows(data) {
        let arr = [];

        data.rows.forEach(function (e) {
            arr.push(e.id);
        });
        let res = await biApi.deleteDashboard(arr);
        self.postMessage({
            action: 'handleDeleteRows',
            data: res.status
        });
    }
};

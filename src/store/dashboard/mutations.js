import { getNewCellConfigLayout } from '@/components/dashboard/configPool/cellLayout.js';
import { autoLoadChartClasses } from '@/components/dashboard/configPool/reportConfig.js';
import { SYMPER_APP } from './../../main.js';
import _cloneDeep from 'lodash/cloneDeep';

var mapTypeToClasses = autoLoadChartClasses();

const setAllWorkflowModel = (state, data) => {
    Vue.set(state, 'allProcessModel', data);
};

const addDatasetAndColumnInDashboard = (state, data) => {
    let addedMeasures =
        state.allDashboard[data.key].dashboardConfigs.info.addedMeasures;
    if (data.includeCaculatedField) {
        for (let dtsId in addedMeasures) {
            if (data.data[dtsId] && data.data[dtsId].columns) {
                data.data[dtsId].columns = [
                    ...addedMeasures[dtsId],
                    ...data.data[dtsId].columns,
                ];
            }
        }
    }
    Vue.set(state.allDashboard[data.key], 'allDatasetColumns', data.data);
};

const setDashboardConfig = (state, data) => {
    Vue.set(state.allDashboard, data.instanceKey, data.data);
};

const disSelectCurrentCell = (state, instanceKey) => {
    let viewConfigs =
        state.allDashboard[instanceKey].currentCellConfigs.viewConfigs;
    if (viewConfigs) {
        viewConfigs.isSelecting = false;
    }
};

const hightlightSelectedDatasetAndCols = function (state, data) {
    let dashboard = state.allDashboard[data.instanceKey];
    let cell = dashboard.dashboardConfigs.allCellConfigs[data.id];
    let selectedColums = {};
    for (let key in cell.rawConfigs.setting) {
        for (let col of cell.rawConfigs.setting[key].selectedColums) {
            if (!selectedColums[col.dataset]) {
                selectedColums[col.dataset] = {};
            }
            selectedColums[col.dataset][col.name] = true;
            selectedColums[col.dataset][col.columnName] = true;
        }
    }
    Vue.set(cell.viewConfigs, 'selectedDataset', selectedColums);
};

const setSelectedCell = (state, data) => {
    let cellId = data.id;
    let instanceKey = data.instanceKey;
    let dashboard = state.allDashboard[instanceKey];
    disSelectCurrentCell(state, instanceKey);
    let cell;
    if (data.isMobileLayout) {
        cell =
            dashboard.dashboardConfigs.info.mobileLayout[
                dashboard.dashboardConfigs.info.mobileLayoutDirection
            ].chart[cellId];
    } else {
        cell = dashboard.dashboardConfigs.allCellConfigs[cellId];
    }
    // hightlightSelectedDatasetAndCols(state, data);
    Vue.set(dashboard, 'currentCellConfigs', cell);
    dashboard.currentCellConfigs.viewConfigs.isSelecting = true;
};

const pasteReport = function (state, data) {
    let copiedCellData = data.reportData;
    if (copiedCellData) {
        try {
            copiedCellData = JSON.parse(copiedCellData);
            if (
                copiedCellData.size &&
                copiedCellData.type &&
                copiedCellData.rawConfigs
            ) {
                let cellSize = copiedCellData.size;
                let newCellId = addCellToLayout(state, {
                    instanceKey: data.instanceKey,
                    type: copiedCellData.type,
                    cellSize: cellSize,
                    active: true,
                });
                let dashboardConfigs =
                    state.allDashboard[data.instanceKey].dashboardConfigs;
                Vue.set(
                    dashboardConfigs.allCellConfigs[newCellId],
                    'rawConfigs',
                    _cloneDeep(copiedCellData.rawConfigs),
                );
                setTimeout(() => {
                    SYMPER_APP.$evtBus.$emit('bi-report-change-display', {
                        id: newCellId,
                        type: 'data',
                        instanceKey: data.instanceKey,
                    });
                }, 0);
            }
        } catch (error) {
        } finally {
            localStorage.removeItem('symper_copied_dashboard_cell_data');
        }
    }
};

const addCellToLayout = function (state, data) {
    let dashboardConfig = state.allDashboard[data.instanceKey].dashboardConfigs;
    let currentLayout =
        dashboardConfig.info.layout[dashboardConfig.info.currentTabPageKey];
    let newCellConfigsLayout = getNewCellConfigLayout(
        data.type,
        currentLayout,
        false,
        data.cellSize,
        data.active,
    );
    currentLayout.push(newCellConfigsLayout);
    let cellId = newCellConfigsLayout.cellId;
    let cellConfig = new mapTypeToClasses[data.type](cellId);
    Vue.set(dashboardConfig.allCellConfigs, cellId, cellConfig);

    if (data.autoSelectedCell !== false) {
        setSelectedCell(state, { id: cellId, instanceKey: data.instanceKey });
    }
    return cellId;
};

const copyReport = function (state, data) {
    let cellConfig = data.dashboardConfigs.allCellConfigs[data.reportId];
    let currentLayout =
        data.dashboardConfigs.info.layout[
            data.dashboardConfigs.info.currentTabPageKey
        ];
    let oldCellLayout = currentLayout.filter((el) => {
        return el.cellId == data.reportId;
    })[0];

    let cellSize = {
        h: oldCellLayout.h,
        w: oldCellLayout.w,
    };
    let cellData = {
        size: cellSize,
        type: cellConfig.sharedConfigs.type,
        rawConfigs: cellConfig.rawConfigs,
    };
    let blob = new Blob([JSON.stringify(cellData)], { type: 'text/plain' });
    let item = new ClipboardItem({ 'text/plain': blob });

    navigator.clipboard.write([item]);
};
const clearAllChartInMobileTab = function (state, data) {
    let dashboardInfo =
        state.allDashboard[data.instanceKey].dashboardConfigs.info;
    for (let i in dashboardInfo.mobileLayout) {
        dashboardInfo.mobileLayout[i].chart = {};
        dashboardInfo.mobileLayout[i].layout[dashboardInfo.currentTabPageKey] =
            [];
    }
};
const toggleFilterChart = function (state, data) {
    let dashboardInfo =
        state.allDashboard[data.instanceKey].dashboardConfigs.info;
    for (let i in dashboardInfo.mobileLayout) {
        if (dashboardInfo.mobileLayout[i].mobileFilter[data.cellId]) {
            delete dashboardInfo.mobileLayout[i].mobileFilter[data.cellId];
        } else {
            dashboardInfo.mobileLayout[i].mobileFilter[data.cellId] = true;
        }
    }
};

const cutReport = function (state, data) {
    copyReport(state, data);
    removeReport(state, data);
};
const removeMobileChart = function (state, data) {
    let dashboardConfigs =
        state.allDashboard[data.instanceKey].dashboardConfigs;
    let mobileLayoutData = dashboardConfigs.info.mobileLayout;
    for (let i in mobileLayoutData) {
        if (mobileLayoutData[i].chart[data.reportId]) {
            delete mobileLayoutData[i].chart[data.reportId];
        }
        if (Object.keys(mobileLayoutData[i].layout).length > 0) {
            mobileLayoutData[i].layout[
                dashboardConfigs.info.currentTabPageKey
            ].forEach(function (e) {
                if (e.cellId == data.reportId) {
                    mobileLayoutData[i].layout[
                        dashboardConfigs.info.currentTabPageKey
                    ].splice(
                        mobileLayoutData[i].layout[
                            dashboardConfigs.info.currentTabPageKey
                        ].indexOf(e),
                        1,
                    );
                }
            });
        }
    }
};

const removeReport = function (state, data) {
    let dashboardConfigs =
        state.allDashboard[data.instanceKey].dashboardConfigs;
    let reportId = data.reportId;
    let layout =
        dashboardConfigs.info.layout[dashboardConfigs.info.currentTabPageKey];
    for (let i in layout) {
        if (layout[i].cellId == reportId) {
            layout.splice(i, 1);
            break;
        }
    }
    Vue.delete(dashboardConfigs.allCellConfigs, reportId);
};
const setSelectingShowList = function (state, data) {
    state.selectingShowList = data;
};
const updateInforDataflows = function (state, data) {
    Vue.set(state.inforDataflows, data.instanceKey, data.inforDataflows);
};

const deleteDatasetInfo = function (state, data) {
    let instanceKey = data.instanceKey;
    let dataset = data.dataset;

    let idDataset = dataset.id;
    let dashboard = state.allDashboard[instanceKey];
    let datasetColumn = dashboard.allDatasetColumns;
    if (dataset.subDatasetIds && dataset.subDatasetIds.length > 0) {
        for (let i = 0; i < dataset.subDatasetIds.length; i++) {
            Vue.delete(datasetColumn, dataset.subDatasetIds[i]);
            Vue.delete(
                dashboard.dashboardConfigs.info.datasets,
                dataset.subDatasetIds[i],
            );
        }
    }
    Vue.delete(datasetColumn, idDataset);
    Vue.delete(dashboard.dashboardConfigs.info.datasets, idDataset);
};
const toggleMobileLayout = function (state, data) {
    state.allDashboard[data.instanceKey].dashboardConfigs.info.isMobileLayout =
        !state.allDashboard[data.instanceKey].dashboardConfigs.info
            .isMobileLayout;
};
export {
    hightlightSelectedDatasetAndCols,
    addCellToLayout,
    setSelectedCell,
    setAllWorkflowModel,
    addDatasetAndColumnInDashboard,
    setDashboardConfig,
    copyReport,
    pasteReport,
    cutReport,
    removeReport,
    setSelectingShowList,
    updateInforDataflows,
    toggleFilterChart,
    clearAllChartInMobileTab,
    deleteDatasetInfo,
    removeMobileChart,
    toggleMobileLayout,
};

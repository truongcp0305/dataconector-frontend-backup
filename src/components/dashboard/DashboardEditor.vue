<template>
    <div class="symper-dashboard-editor h-100 w-100">
        <div class="d-flex h-100 w-100">
            <div
                class="d-flex flex-column flex-grow-1"
                :style="{
                    width: workspaceWidth
                }"
            >
                <DashboardToolBar
                    :style="{
                        height: '40px'
                    }"
                    :action="action"
                    :idDashboard="idObject"
                    :lockInfo="lockInfo"
                    :instanceKey="instanceKey"
                    @refresh-all-reports="refreshAllReports"
                />

                <DashboardWorkspace
                    :style="{
                        height: 'calc(100% - 35px)'
                    }"
                    @refresh-all-reports="refreshAllReports"
                    ref="dashboardWorkspace"
                    :action="action"
                    :status="status"
                    :instanceKey="instanceKey"
                    :experimentalMode="experimentalMode"
                    :idDashboard="idObject"
                />
            </div>
            <div
                v-if="action != 'view'"
                :style="{
                    width: '200px'
                }"
                :class="{
                    'flex-column h-100': true,
                    'd-none': collapseTabs.includes('report-config'),
                    'd-flex': !collapseTabs.includes('report-config')
                }"
            >
                <ReportTypeSelector
                    :instanceKey="instanceKey"
                    :showReportType="
                        !myData.dashboardConfigs.info.isMobileLayout
                    "
                    @collapse-report-config="handleCollapse('report-config')"
                    @selected-type="handleSelectedChartType"
                    :isView="myData.dashboardConfigs.info.isMobileLayout"
                />
                <ReportConfig :instanceKey="instanceKey" />
            </div>
            <DashboardDasetDetail
                v-if="
                    action != 'view' &&
                    !myData.dashboardConfigs.info.isMobileLayout
                "
                ref="datasetDetail"
                :class="{
                    'h-100': true,
                    'd-none': collapseTabs.includes('dataset-config')
                }"
                :instanceKey="instanceKey"
                @show-dataset-selector="toggleDatasetDialog"
                @show-relation-selector="toggleRelationDialog"
                @remove-dataset="handleRemoveDataset"
                @collapse-dataset-config="handleCollapse('dataset-config')"
                :style="{
                    width: '250px',
                    'border-left': '1px solid lightgray'
                }"
            />
            <SidebarDashboardMobileConfig
                v-if="myData.dashboardConfigs.info.isMobileLayout"
                :instanceKey="instanceKey"
                :style="{
                    width: '250px',
                    'border-left': '1px solid lightgray'
                }"
                @collapse-mobile-sidebar="handleCollapse('mobile-sidebar')"
                :class="{
                    'h-100': true,
                    'd-none': collapseTabs.includes('mobile-sidebar')
                }"
            />

            <div
                v-if="collapseTabs.length > 0"
                class="d-flex flex-column"
                style="
                    width: 40px;
                    margin-top: -40px;
                    border-left: 1px solid lightgray;
                "
            >
                <div
                    v-for="(item, i) in collapseTabs"
                    class="collapsed-tabs mt-16"
                    :key="i"
                >
                    <div
                        style="width: 150px !important; z-index: 100 !important"
                        :class="{ 'ml-16': i == 1 }"
                    >
                        <v-btn
                            x-small
                            tile
                            @click="handleExpand(item)"
                            :class="{ 'ml-4': i == 1 }"
                        >
                            <v-icon> mdi-chevron-down </v-icon>
                            <span class="ml-2">
                                {{ reduce(item) }}
                            </span>
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>
        <DatasetSelector
            v-if="action != 'view'"
            ref="datasetSelector"
            :tableHeight="tableHeight"
            :listDatasetSelected="listDatasetSelected"
        />
        <RelationSelector
            v-if="action != 'view'"
            ref="relationSelector"
            :tableHeight="tableHeight"
            @change="handleChangeSelectedRelation"
            :relations="myData.dashboardConfigs.info.relations"
        />
        <SymperDialogConfirm
            :title="$t('bi.dashboard.warningOtherEditing')"
            :content="notifyOtherBAEditingContent"
            :showDialog="notifyOtherBAEditing"
            :showCancel="false"
            @confirm="notifyOtherBAEditing = false"
        />
    </div>
</template>

<script>
import DashboardDasetDetail from '@/components/dashboard/components/DashboardDasetDetail.vue';
import DashboardToolBar from '@/components/dashboard/components/DashboardToolBar.vue';
import DashboardWorkspace from '@/components/dashboard/components/DashboardWorkspace.vue';
import ReportConfig from '@/components/dashboard/components/ReportConfig.vue';
import ReportTypeSelector from '@/components/dashboard/components/ReportTypeSelector.vue';
import DashboardEditorWorker from 'worker-loader!@/worker/dashboard/DasboardEditor.Worker.js';
import DatasetSelector from '@/components/dataset/DatasetSelector';
import SidebarDashboardMobileConfig from '@/components/dashboard/components/SidebarDashboardMobileConfig';
import RelationSelector from '@/components/relation/RelationSelector';
import { util } from '@/plugins/util';
import { autoLoadChartClasses } from '@/components/dashboard/configPool/reportConfig.js';
import { getDefaultDashboardConfig } from '@/components/dashboard/configPool/dashboardConfigs.js';
import Global from '@/components/dashboard/reports/Global.chart.js';
import ObjectAccessManager from '@/plugins/objectAccess/ObjectAccessManager.js';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
import { uiConfigApi } from '../../api/uiConfig';
import { dashboardApi } from '@/api/dashboard.js';
import { str } from '@/plugins/utilModules/str';
import { authUtil } from '@/plugins/utilModules/auth';
var reportClasses = autoLoadChartClasses();

export default {
    components: {
        DashboardDasetDetail,
        DashboardToolBar,
        DashboardWorkspace,
        ReportConfig,
        ReportTypeSelector,
        DatasetSelector,
        RelationSelector,
        SidebarDashboardMobileConfig,
        SymperDialogConfirm
    },
    created() {
        this.dashboardEditorWorker = new DashboardEditorWorker();
        this.customEnduserUIDisplay = {};

        this.listenFromWorker();
        this.getDashboardInfo();
        this.initDashboardData();
        let self = this;
        this.$evtBus.$on('list-datasets-change', (datasetIds) => {
            self.listDatasetSelected = datasetIds;
            self.dashboardEditorWorker.postMessage({
                action: 'getDatasetInfo',
                data: {
                    datasetIds,
                    inClickhouseMode: this.$route.path.includes(
                        'edit-in-clickhouse-mode'
                    )
                }
            });
        });
        this.$evtBus.$on('finish-export-excel', (uuid) => {
            if (this.listFileExport[uuid] != undefined) {
                let idDashboard = this.listFileExport[uuid].key.idDashboard;
                if (this.idObject == idDashboard) {
                    let cellId = this.listFileExport[uuid].key.cellId;
                    this.myData.dashboardConfigs.allCellConfigs[
                        cellId
                    ].viewConfigs.exportingExcel = false;
                }
            }
        });

        this.$evtBus.$on('dashboard-save-enduser-ui-display', (data) => {
            if (this.action == 'view' && self.instanceKey == data.instanceKey) {
                if (!self.customEnduserUIDisplay[data.cellId]) {
                    self.customEnduserUIDisplay[data.cellId] = {};
                }

                let reportInfo = self.customEnduserUIDisplay[data.cellId];
                reportInfo[data.key] = data.data;
                try {
                    uiConfigApi.saveUiConfig({
                        widgetIdentifier: self.getDashboardIdInUIService(),
                        detail: JSON.stringify(self.customEnduserUIDisplay)
                    });
                } catch (error) {
                    console.error('save custom display config error', error);
                    self.$snotifyError(
                        this.$t('v2.dashboard.saveCustomeUIDisplayError')
                    );
                }
            }
        });
    },
    data() {
        return {
            instanceKey: Date.now(),
            tableHeight: 0,
            listDatasetSelected: [],
            collapseTabs: [],
            status: 'init',
            lockInfo: null,
            notifyOtherBAEditing: false,
            notifyOtherBAEditingContent: ''
        };
    },
    mounted() {
        this.tableHeight = util.getComponentSize(this).h - 100;
        if (this.action == 'create') {
            this.$store.commit('dashboard/setSelectedCell', {
                id: 'global',
                instanceKey: this.instanceKey
            });
            this.status = 'editting';
        }
    },
    watch: {},
    computed: {
        workspaceWidth() {
            if (this.action == 'view') {
                return '100%';
            } else {
                return 'calc(100% - 450px)';
            }
        },
        myData() {
            return this.$store.state.dashboard.allDashboard[this.instanceKey];
        },
        listFileExport() {
            return this.$store.state.exportExcel.listFileExport;
        }
    },
    methods: {
        getDashboardIdInUIService() {
            return `dashboard-${this.idObject}`;
        },
        async refreshDatasetInDashboard() {
            let thisDashboard =
                this.$store.state.dashboard.allDashboard[this.instanceKey];
            let data = {
                names: {},
                key: str.formatDate(Date.now())
            };
            for (const key in thisDashboard.allDatasetColumns) {
                let dsb = thisDashboard.allDatasetColumns[key];
                if (dsb.type == 'dataset_by_dataflow') {
                    data.names[dsb.name] = {
                        fromDashoard: this.idObject,
                        context: this.$t('v2.dashboard.refreshAllReport')
                    };
                }
            }
            let tenantId = authUtil.getTenantId();
            try {
                await dashboardApi.refreshDatasetByName(data, tenantId);
            } catch (error) {
                // this.$snotifyError(error, 'Lỗi khi làm mới dataset!');
            }
        },
        async refreshAllReports() {
            let thisDashboard =
                this.$store.state.dashboard.allDashboard[this.instanceKey];
            thisDashboard.dashboardConfigs.allCellConfigs.global.viewConfigs.loadingData = true;
            await this.refreshDatasetInDashboard();
            let dashboardConfig = thisDashboard.dashboardConfigs;
            let info = dashboardConfig.info;
            for (let name in info.layout) {
                if (Array.isArray(info.layout[name])) {
                    for (let rp of info.layout[name]) {
                        rp.calledAPI = false;
                        rp.active = false;
                    }
                }
            }

            let currentTabPageKey = info.currentTabPageKey;
            for (let t of info.tabsAndPages.tabs) {
                if (t.name != currentTabPageKey) {
                    t.active = false;
                }
            }
            this.$refs.dashboardWorkspace.renderCellsInViewport(true);
        },
        checkAndResizeAllReports() {
            this.$refs.dashboardWorkspace.checkAndResizeAllReports();
        },
        handleChangeSelectedRelation(relations) {
            this.myData.dashboardConfigs.info.relations = relations;
            let dashboardConfig =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .dashboardConfigs;
            let info = dashboardConfig.info;
            let layout = info.layout[info.currentTabPageKey];
            // reset lại việc áp dụng mối quan hệ giữa các cell theo relation mới
            this.$refs.dashboardWorkspace.initCrossFilterMng(relations);
            let allCells = dashboardConfig.allCellConfigs;
            // reset lại giá trị của các filter đang được áp dụng
            for (let cellId in allCells) {
                let cell = allCells[cellId];
                if (cell.sharedConfigs.type == 'filter') {
                    this.$evtBus.$emit('dashboard-clear-filter-cell', {
                        instanceKey: this.instanceKey,
                        cellId: cellId,
                        preventReloadData: true
                    });
                }
            }

            for (let item of layout) {
                let cell = allCells[item.i];
                if (cell.sharedConfigs.type != 'filter') {
                    cell.sharedConfigs.filter = {}; // loại bỏ các filter đang áp dụng cho cell
                    item.active &&
                        this.$evtBus.$emit('bi-report-change-display', {
                            id: item.i,
                            type: 'data',
                            instanceKey: this.instanceKey
                        });
                }
            }
        },
        changeSelectedDatasets(datasetIds) {
            this.listDatasetSelected = datasetIds;
            this.dashboardEditorWorker.postMessage({
                action: 'getDatasetInfo',
                data: {
                    datasetIds,
                    inClickhouseMode: this.$route.path.includes(
                        'edit-in-clickhouse-mode'
                    )
                }
            });
        },
        applySelectedDatasets(datasets) {
            if (this.action != 'view') {
                this.myData.dashboardConfigs.info.datasets = datasets.reduce(
                    (map, el) => {
                        map[el.id] = true;
                        return map;
                    },
                    {}
                );
                this.$refs.datasetDetail.getColumnDataset(datasets);
            }
        },
        reduce(type) {
            return type == 'dataset-config'
                ? this.$t('v2.dashboard.showDatasetConfig')
                : type == 'mobile-sidebar'
                ? this.$t('v2.dashboard.showMobileSidebar')
                : this.$t('v2.dashboard.showReportConfig');
        },
        handlerCancelSelectDataset(listDatasetIds) {
            this.listDatasetSelected = listDatasetIds;
        },
        handlerListDatasetSelected(listDatasetIds) {
            this.listDatasetSelected = listDatasetIds;
        },
        initDashboardData() {
            let defaultData = getDefaultDashboardConfig();
            let data = {
                ...defaultData,
                instanceKey: this.instanceKey,
                showReportConfig: true
            };
            if (this.action == 'create') {
                data.dashboardConfigs.info.tabsAndPages.tabs.map((el) => {
                    el.id = util.str.randomString(6);
                });
            }
            data.dashboardConfigs.allCellConfigs.global = new Global();
            this.$store.commit('dashboard/setDashboardConfig', {
                instanceKey: this.instanceKey,
                data
            });
        },
        async getDashboardInfo() {
            if (this.action == 'edit') {
                this.accessDashboardMng = new ObjectAccessManager(
                    this,
                    'dashboard',
                    this.idObject,
                    'edit'
                );
                let accessInfo = await this.accessDashboardMng.checkStatus();
                this.lockInfo = accessInfo;
                if (accessInfo.status == 'locked') {
                    this.notifyOtherBAEditing = true;
                    this.notifyOtherBAEditingContent = `BA ${
                        this.lockInfo.info.lockedBy
                    } ${this.$t('common.edditing')}. ${this.$t(
                        'bi.dashboard.cantSaveAsEditing'
                    )}`;
                } else if (accessInfo.status == 'free') {
                    this.accessDashboardMng.lock();
                }
            }
            if (this.idObject) {
                let widgetIdentifier = this.$refs.dashboardWorkspace
                    ? this.$refs.dashboardWorkspace.getDashboardIdInUIService
                    : this.getDashboardIdInUIService() +
                      ':' +
                      this.$store.state.app.endUserInfo.id;
                this.dashboardEditorWorker.postMessage({
                    action: 'getDashboardInfo',
                    data: {
                        widgetIdentifier: widgetIdentifier,
                        UIKey:
                            this.action == 'view'
                                ? this.getDashboardIdInUIService()
                                : '',
                        action: this.action,
                        idDashboard: this.idObject,
                        experimentalMode: this.experimentalMode
                    }
                });
            }
        },
        setDashboardStyle(style) {
            this.$refs.dashboardWorkspace.setDashboardStyle(style);
        },
        setDatasetAndColumnsOnViewAction(data) {
            let dataPos = {
                key: this.instanceKey,
                data: data.datasetAndColumn,
                includeCaculatedField: true
            };
            this.$store.commit(
                'dashboard/addDatasetAndColumnInDashboard',
                dataPos
            );
        },
        assignDataToReportObjects(allCellConfigs) {
            let rsl = {};
            let experimentalMode =
                this.$route.name == 'editDashboardInClickhouseMode'
                    ? 'clickhouse'
                    : '';
            for (let i in allCellConfigs) {
                let type = allCellConfigs[i].sharedConfigs.type;
                let newReport = new reportClasses[type](i);
                newReport.assignData(allCellConfigs[i]);
                newReport.sharedConfigs.experimentalMode = experimentalMode;
                rsl[i] = newReport;
            }
            return rsl;
        },
        isBa() {
            let userInfo = util.auth.getSavedUserInfo();
            let userType = userInfo.profile.type;
            return userType == 'ba';
        },
        setPermissonForDashboard(data) {
            let operationsMap = this.$store.state.app.userOperations;
            let idDashboard = this.idObject;
            let viewTabs = [];
            let exportableTabs = [];
            let tabs = data.dashboardInfo.tabsAndPages.tabs;
            for (let id in data.allCellConfigs) {
                data.allCellConfigs[id].sharedConfigs.canExport = false;
            }
            // Nếu có quyền xem
            if (operationsMap.dashboard[idDashboard].view) {
                if (operationsMap.dashboard_tab) {
                    for (let t of tabs) {
                        let id = idDashboard + '_' + t.id;
                        let permissions = operationsMap.dashboard_tab[id];
                        // Có quyền với tab nào đó trong dashboard
                        if (permissions) {
                            if (permissions.view) {
                                viewTabs.push(t);
                            }

                            if (permissions['export-data']) {
                                exportableTabs.push(t);
                            }
                        }
                    }
                }

                // nếu có 1 vài tab được set là xem thì chỉ cho xem những tab ấy, nếu ko tab nào được chỉ định thì cho xem tất cả
                if (viewTabs.length > 0) {
                    viewTabs.push({
                        active: false,
                        editTabName: false,
                        id: 'SYMPER_EMPTY_TAB',
                        name: ''
                    });
                    data.dashboardInfo.tabsAndPages.tabs = viewTabs;
                }

                // Nếu được export toàn bộ dashboard
                if (operationsMap.dashboard[idDashboard]['export-data']) {
                    exportableTabs = data.dashboardInfo.tabsAndPages.tabs;
                }
                for (let tab of exportableTabs) {
                    let tabName = tab.name;
                    for (let item of data.dashboardInfo.layout[tabName]) {
                        data.allCellConfigs[
                            item.cellId
                        ].sharedConfigs.canExport = true;
                    }
                }
            } else {
                delete data.dashboardInfo;
            }
            data.dashboardInfo.currentTabPageKey =
                data.dashboardInfo.tabsAndPages.tabs[0].name;
        },
        setRestoredDashboardConfigs(data) {
            if (!this.isBa()) {
                this.setPermissonForDashboard(data);
            }
            if (!data.dashboardInfo) {
                return;
            }
            this.$emit('config-loaded', data.dashboardInfo);
            this.setDashboardStyle(data.allCellConfigs.global.rawConfigs.style);
            this.changeSelectedDatasets(data.relateDatasetIds);
            this.$set(this.myData.dashboardConfigs, 'info', data.dashboardInfo);
            // this.initDashboardData();
            this.$refs.dashboardWorkspace.customFilter = data.customFilter;

            if (this.action == 'view') {
                data.dashboardInfo.lockWorkspace = true;
            }
            let allCellConfigs = this.assignDataToReportObjects(
                data.allCellConfigs
            );
            this.$set(
                this.myData.dashboardConfigs,
                'allCellConfigs',
                allCellConfigs
            );

            this.$store.commit('dashboard/setSelectedCell', {
                id: 'global',
                instanceKey: this.instanceKey
            });
            setTimeout(
                (self) => {
                    self.status = 'editting';
                },
                1000,
                this
            );
            this.checkExporting();
            if (this.action == 'view') {
                this.customEnduserUIDisplay = data.customUIData;
            }
            this.$refs.dashboardWorkspace.initCrossFilterMng(
                data.dashboardInfo.relations,
                data.mapsRelation
            );
        },
        checkExporting() {
            let listReportExporting = {};
            for (let fileExport in this.listFileExport) {
                if (
                    this.listFileExport[fileExport].key.idDashboard ==
                    this.idObject
                ) {
                    listReportExporting[
                        this.listFileExport[fileExport].key.cellId
                    ] = true;
                }
            }
            for (let cellId in this.myData.dashboardConfigs.allCellConfigs) {
                for (let report in listReportExporting) {
                    if (report == cellId) {
                        this.myData.dashboardConfigs.allCellConfigs[
                            cellId
                        ].viewConfigs.exportingExcel = true;
                    }
                }
            }
        },
        toggleDatasetDialog() {
            this.$refs.datasetSelector.show();
        },
        toggleRelationDialog() {
            this.$refs.relationSelector.show();
        },
        handleSelectedChartType(type) {
            if (this.myData.currentCellConfigs.sharedConfigs.type == 'global') {
                this.$refs.dashboardWorkspace.addCell(type, true);
            } else {
                this.changeCurrentReportType(type);
            }
        },
        changeCurrentReportType(newType) {
            let currentCell = this.myData.currentCellConfigs;
            let newCell = new reportClasses[newType](
                currentCell.sharedConfigs.cellId
            );
            this.syncSettingConfig(currentCell, newCell);
            this.syncStyleConfig(currentCell, newCell);
            this.syncConditionConfig(currentCell, newCell);
            this.syncFilterConfig(currentCell, newCell);
            let allCellConfigs = this.myData.dashboardConfigs.allCellConfigs;
            this.$set(
                allCellConfigs,
                currentCell.sharedConfigs.cellId,
                newCell
            );
            this.$evtBus.$emit('bi-report-change-display', {
                instanceKey: this.instanceKey,
                id: currentCell.sharedConfigs.cellId,
                type: 'data',
                serverCache: false
            });
            setTimeout(
                (self) => {
                    self.$store.commit('dashboard/setSelectedCell', {
                        id: currentCell.sharedConfigs.cellId,
                        instanceKey: this.instanceKey
                    });
                },
                200,
                this
            );
        },
        syncFilterConfig(currentCell, newCell) {},
        syncSettingConfig(currentCell, newCell) {
            if (newCell.sharedConfigs.type == 'table') {
                for (let name in currentCell.rawConfigs.setting) {
                    newCell.rawConfigs.setting.value.selectedColums =
                        newCell.rawConfigs.setting.value.selectedColums.concat(
                            currentCell.rawConfigs.setting[name].selectedColums
                        );
                }

                for (let col of newCell.rawConfigs.setting.value
                    .selectedColums) {
                    if (col.type != 'number') {
                        col.agg = 'not_agg';
                    } else {
                        col.agg = 'sum';
                    }
                }
            } else {
                for (let key in currentCell.rawConfigs.setting) {
                    if (newCell.rawConfigs.setting[key]) {
                        newCell.rawConfigs.setting[key].selectedColums =
                            currentCell.rawConfigs.setting[key].selectedColums;
                    }
                }
            }
        },
        syncStyleConfig(currentCell, newCell) {
            let mapCurrStyle = currentCell.rawConfigs.style;
            for (let groupName in newCell.rawConfigs.style) {
                if (mapCurrStyle.hasOwnProperty(groupName)) {
                    let newGroup = newCell.rawConfigs.style[groupName];
                    for (let styleName in newGroup.children) {
                        if (
                            mapCurrStyle[groupName].children.hasOwnProperty(
                                styleName
                            )
                        ) {
                            newGroup.children[styleName].value =
                                mapCurrStyle[groupName].children[
                                    styleName
                                ].value;
                        }
                    }
                }
            }
        },
        syncConditionConfig(currentCell, newCell) {
            newCell.rawConfigs.condition = currentCell.rawConfigs.condition;
        },
        handleRemoveDataset(dataset) {
            this.listDatasetSelected.splice(
                this.listDatasetSelected.indexOf(dataset.id),
                1
            );
        },
        handleCollapse(type) {
            this.collapseTabs.push(type);
            this.changeDashboardSize();
        },
        handleExpand(type) {
            this.collapseTabs.splice(this.collapseTabs.indexOf(type), 1);
            this.changeDashboardSize();
        },
        changeDashboardSize() {
            let self = this;
            setTimeout(() => {
                let allCellConfigs =
                    self.myData.dashboardConfigs.allCellConfigs;
                self.setDashboardStyle(allCellConfigs.global.rawConfigs.style);
                setTimeout(() => {
                    self.$refs.dashboardWorkspace.renderCellsInViewport(true);
                }, 200);
            }, 100);
        },
        listenFromWorker() {
            let self = this;
            this.dashboardEditorWorker.addEventListener(
                'message',
                function (event) {
                    let data = event.data;
                    let action = data.action;
                    if (self[action]) {
                        self[action](data.data);
                    } else {
                        console.error(` action ${action} not found `);
                    }
                }
            );
        }
    },
    props: {
        action: {
            type: String,
            default: 'create'
        },
        idObject: {
            default: ''
        },
        experimentalMode: {
            default: ''
        }
    }
};
</script>

<style scoped>
.v-list-item {
    min-height: unset !important;
}
.v-list-item__title {
    font-size: 13px !important;
}
.collapsed-tabs {
    -ms-transform: rotate(90deg);
    transform: rotate(90deg);
}
.collapsed-tabs >>> .v-btn {
    box-shadow: unset !important;
}
</style>

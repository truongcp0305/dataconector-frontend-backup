<template>
    <div class="w-100 h-100 symper-dashboard-workspace position-relative">
        <add-filter
            ref="addFilter"
            :crossFilterMng="crossFilterMng"
            :action="action"
            :instanceKey="instanceKey"
            @add-filter="handleAddFilter"
            :isAddFilter="isAddFilter"
            :isInitLoading="isInitLoading"
            :filter="filter"
            :idDashboard="idDashboard"
            @apply-filter="applyFilter"
            @accept-load-tab="acceptLoadTab"
            @init-tab="onInitTab"
            @change-status-add-filter="changeStatusAddFilter"
            @refresh-cell="refreshCell"
            @clear-all-config-filter="clearAllConfigFilter"
        />
        <v-progress-linear
            :height="3"
            :active="
                dashboardConfig.allCellConfigs.global.viewConfigs.loadingData
            "
            :indeterminate="
                dashboardConfig.allCellConfigs.global.viewConfigs.loadingData
            "
            absolute
            top
            color="blue darken-2"
        ></v-progress-linear>

        <div
            class="report-self-filter-container border-left-1"
            v-if="
                dashboardConfig.info.reportSelfFilter &&
                dashboardConfig.info.reportSelfFilter.open
            "
        >
            <ReportSelfFilter
                ref="reportSelfFilter"
                @close="toggleReportSelfFilter"
                :isAddFilter="isAddFilter"
                :report="reportForSelfFilter"
                :idDashboard="idDashboard"
                :dashboardConfig="dashboardConfig"
                :pinnedSelfFilter="dashboardConfig.info.reportSelfFilter.pinned"
                @apply-self-filter="applySelfFilter"
                @toggle-pin="togglePinSelfFilter"
            />
        </div>
        <div
            ref="cellContainer"
            :style="{
                height: 'calc(' + workspaceHeight + ')',
                overflow: 'auto'
            }"
            tabindex="0"
            @click="selectDashboard()"
        >
            <v-tabs-items v-model="dashboardConfig.info.activeTabIndex">
                <v-tab-item
                    v-for="(dbLayout, tabIdx) in dashboardConfig.info
                        .tabsAndPages.tabs"
                    :key="tabIdx"
                    :style="{
                        height: 'calc(' + workspaceHeight + ' )',
                        overflow: 'auto'
                    }"
                    @scroll="handleDashboardScrolled"
                >
                    <grid-layout
                        tabindex="0"
                        v-if="!dashboardConfig.info.isMobileLayout"
                        @layout-updated="handleLayoutRendered"
                        ref="gridLayout"
                        class="symper-dashboard-layout"
                        :layout.sync="
                            dashboardConfig.info.layout[dbLayout.name]
                        "
                        :col-num="48"
                        :row-height="2"
                        :is-resizable="!dashboardConfig.info.lockWorkspace"
                        :is-draggable="!dashboardConfig.info.lockWorkspace"
                        :is-mirrored="false"
                        :vertical-compact="true"
                        :margin="[8, 8]"
                        :use-css-transforms="true"
                        :layout-tab-name="dbLayout.name"
                        :style="workspaceStyle"
                    >
                        <div
                            v-for="item in dashboardConfig.info.layout[
                                dbLayout.name
                            ]"
                            tabindex="0"
                            @click.stop="selectCell(item.cellId)"
                            :key="item.i"
                        >
                            <grid-item
                                :x="item.x"
                                :y="item.y"
                                :w="item.w"
                                :h="item.h"
                                :i="item.i"
                                :symper-cell-id="item.cellId"
                                :class="{
                                    'symper-grid-item symper-dashboard-cell-wrapper': true,
                                    'dashboard-cell-with-icon':
                                        dashboardConfig.allCellConfigs[
                                            item.cellId
                                        ].viewConfigs.showIcon,
                                    'selected-report':
                                        action == 'view'
                                            ? false
                                            : dashboardConfig.allCellConfigs[
                                                  item.cellId
                                              ].viewConfigs.isSelecting
                                }"
                                @resized="handleResizeItem"
                                @resize="handleResizingItem"
                            >
                                <DashboardCell
                                    :selectedItems="filter[item.cellId]"
                                    :needConfigFilter="
                                        isInitLoading[activeTabId] &&
                                        haveInitFilter
                                    "
                                    v-if="item.active"
                                    :ref="item.cellId"
                                    @view-detail="handleViewDetail(item)"
                                    @tracing-dataset="
                                        handleTracingDataset(item)
                                    "
                                    @download-excel="handleDownloadExcel(item)"
                                    @toggle-self-filter-panel="
                                        handleToggleSelfFilter
                                    "
                                    :layoutItem="item"
                                    :isView="isView"
                                    :action="action"
                                    :instanceKey="instanceKey"
                                    :cellConfigs="
                                        dashboardConfig.allCellConfigs[
                                            item.cellId
                                        ]
                                    "
                                >
                                </DashboardCell>
                            </grid-item>
                        </div>
                    </grid-layout>
                    <div
                        v-else-if="
                            dashboardConfig.info.isMobileLayout &&
                            dashboardConfig.info.mobileLayoutDirection ==
                                'vertical'
                        "
                        :style="{
                            height: 'calc(' + workspaceHeight + ')'
                        }"
                        :id="
                            'symper-mobile-layout-wrapper-' +
                            dashboardConfig.info.currentTabPageKey
                        "
                    >
                        <VuePerfectScrollbar style="height: 100%">
                            <grid-layout
                                tabindex="0"
                                @layout-updated="handleLayoutRendered"
                                ref="mobileLayout"
                                class="symper-mobile-layout"
                                :layout.sync="
                                    dashboardConfig.info.mobileLayout[
                                        dashboardConfig.info
                                            .mobileLayoutDirection
                                    ].layout[dbLayout.name]
                                "
                                :col-num="2"
                                :row-height="2"
                                :is-resizable="
                                    !dashboardConfig.info.lockWorkspace
                                "
                                :is-draggable="
                                    !dashboardConfig.info.lockWorkspace
                                "
                                :is-mirrored="false"
                                :vertical-compact="true"
                                :margin="[8, 8]"
                                :use-css-transforms="true"
                                :layout-tab-name="dbLayout.name"
                                :style="workspaceMobileStyle"
                            >
                                <div
                                    v-for="(item, itemIndex) in dashboardConfig
                                        .info.mobileLayout[
                                        dashboardConfig.info
                                            .mobileLayoutDirection
                                    ].layout[dbLayout.name]"
                                    tabindex="0"
                                    @click.stop="selectCell(item.cellId)"
                                    :key="itemIndex"
                                >
                                    <grid-item
                                        :x="item.x"
                                        :y="item.y"
                                        :w="item.w"
                                        :h="item.h"
                                        :i="item.i"
                                        :symper-cell-id="item.cellId"
                                        :class="{
                                            'symper-grid-item symper-dashboard-cell-wrapper': true,
                                            'dashboard-cell-with-icon':
                                                dashboardConfig.info
                                                    .mobileLayout[
                                                    dashboardConfig.info
                                                        .mobileLayoutDirection
                                                ].chart[item.cellId]
                                                    ? dashboardConfig.info
                                                          .mobileLayout[
                                                          dashboardConfig.info
                                                              .mobileLayoutDirection
                                                      ].chart[item.cellId]
                                                          .viewConfigs.showIcon
                                                    : false,
                                            'selected-report':
                                                action == 'view'
                                                    ? false
                                                    : dashboardConfig.info
                                                          .mobileLayout[
                                                          dashboardConfig.info
                                                              .mobileLayoutDirection
                                                      ].chart[item.cellId]
                                                    ? dashboardConfig.info
                                                          .mobileLayout[
                                                          dashboardConfig.info
                                                              .mobileLayoutDirection
                                                      ].chart[item.cellId]
                                                          .viewConfigs
                                                          .isSelecting
                                                    : false
                                        }"
                                        @resized="handleResizeItem"
                                        @resize="handleResizingItem"
                                    >
                                        <DashboardCell
                                            :selectedItems="filter[item.cellId]"
                                            :needConfigFilter="
                                                isInitLoading[activeTabId] &&
                                                haveInitFilter
                                            "
                                            v-if="item.active"
                                            :ref="item.cellId"
                                            @view-detail="
                                                handleViewDetail(item)
                                            "
                                            @tracing-dataset="
                                                handleTracingDataset(item)
                                            "
                                            @download-excel="
                                                handleDownloadExcel(item)
                                            "
                                            :layoutItem="item"
                                            :isView="isView"
                                            :instanceKey="instanceKey"
                                            :isMobileLayout="true"
                                            :action="action"
                                            :cellConfigs="
                                                dashboardConfig.info
                                                    .mobileLayout[
                                                    dashboardConfig.info
                                                        .mobileLayoutDirection
                                                ].chart[item.cellId]
                                            "
                                        >
                                        </DashboardCell>
                                    </grid-item>
                                </div>
                            </grid-layout>
                        </VuePerfectScrollbar>
                    </div>
                    <div
                        v-else-if="
                            dashboardConfig.info.isMobileLayout &&
                            dashboardConfig.info.mobileLayoutDirection ==
                                'horizontal'
                        "
                        :style="{
                            height: 'calc(' + workspaceHeight + ' - 250px)',
                            'margin-top': '100px'
                        }"
                        :id="
                            'symper-mobile-layout-wrapper-' +
                            dashboardConfig.info.currentTabPageKey
                        "
                    >
                        <VuePerfectScrollbar style="height: 100%">
                            <grid-layout
                                tabindex="0"
                                @layout-updated="handleLayoutRendered"
                                ref="mobileLayout"
                                class="symper-mobile-layout symper-mobile-horizontal-layout"
                                :layout.sync="
                                    dashboardConfig.info.mobileLayout[
                                        dashboardConfig.info
                                            .mobileLayoutDirection
                                    ].layout[dbLayout.name]
                                "
                                :col-num="8"
                                :row-height="2"
                                :is-resizable="
                                    !dashboardConfig.info.lockWorkspace
                                "
                                :is-draggable="
                                    !dashboardConfig.info.lockWorkspace
                                "
                                :is-mirrored="false"
                                :vertical-compact="true"
                                :margin="[8, 8]"
                                :use-css-transforms="true"
                                :layout-tab-name="dbLayout.name"
                                :style="workspaceMobileHorizontalStyle"
                            >
                                <div
                                    v-for="(item, itemIndex) in dashboardConfig
                                        .info.mobileLayout[
                                        dashboardConfig.info
                                            .mobileLayoutDirection
                                    ].layout[dbLayout.name]"
                                    tabindex="0"
                                    @click.stop="selectCell(item.cellId)"
                                    :key="itemIndex"
                                >
                                    <grid-item
                                        :x="item.x"
                                        :y="item.y"
                                        :w="item.w"
                                        :h="item.h"
                                        :i="item.i"
                                        :symper-cell-id="item.cellId"
                                        :class="{
                                            'symper-grid-item symper-dashboard-cell-wrapper': true,
                                            'dashboard-cell-with-icon':
                                                dashboardConfig.info
                                                    .mobileLayout[
                                                    dashboardConfig.info
                                                        .mobileLayoutDirection
                                                ].chart[item.cellId]
                                                    ? dashboardConfig.info
                                                          .mobileLayout[
                                                          dashboardConfig.info
                                                              .mobileLayoutDirection
                                                      ].chart[item.cellId]
                                                          .viewConfigs.showIcon
                                                    : false,
                                            'selected-report':
                                                action == 'view'
                                                    ? false
                                                    : dashboardConfig.info
                                                          .mobileLayout[
                                                          dashboardConfig.info
                                                              .mobileLayoutDirection
                                                      ].chart[item.cellId]
                                                    ? dashboardConfig.info
                                                          .mobileLayout[
                                                          dashboardConfig.info
                                                              .mobileLayoutDirection
                                                      ].chart[item.cellId]
                                                          .viewConfigs
                                                          .isSelecting
                                                    : false
                                        }"
                                        @resized="handleResizeItem"
                                        @resize="handleResizingItem"
                                    >
                                        <DashboardCell
                                            :selectedItems="filter[item.cellId]"
                                            :needConfigFilter="
                                                isInitLoading[activeTabId] &&
                                                haveInitFilter
                                            "
                                            v-if="item.active"
                                            :ref="item.cellId"
                                            @view-detail="
                                                handleViewDetail(item)
                                            "
                                            @tracing-dataset="
                                                handleTracingDataset(item)
                                            "
                                            @download-excel="
                                                handleDownloadExcel(item)
                                            "
                                            :layoutItem="item"
                                            :isView="isView"
                                            :isMobileLayout="true"
                                            :instanceKey="instanceKey"
                                            :cellConfigs="
                                                dashboardConfig.info
                                                    .mobileLayout[
                                                    dashboardConfig.info
                                                        .mobileLayoutDirection
                                                ].chart[item.cellId]
                                            "
                                        >
                                        </DashboardCell>
                                    </grid-item>
                                </div>
                            </grid-layout>
                        </VuePerfectScrollbar>
                    </div>
                </v-tab-item>
            </v-tabs-items>

            <DashboardCellDetail
                ref="dashboardCellDetail"
                @back-to-dashboard="dashboardTab = 'tab-1'"
                @download-excel="handleDownloadExcel(currentItem)"
                :item="currentItem"
                :instanceKey="instanceKey"
                :dashboardConfig="dashboardConfig"
            />
            <DatasetTracingPopup
                ref="datasetTraingPopup"
                :instanceKey="instanceKey"
                v-bind="
                    Object.keys(currentItem).length
                        ? {
                              cellConfigs:
                                  dashboardConfig.allCellConfigs[
                                      currentItem.cellId
                                  ]
                          }
                        : {}
                "
            />
        </div>
        <DashboardFootInfo :instanceKey="instanceKey" />
        <v-tabs
            :style="{
                position: 'absolute',
                bottom: isAddFilter ? '14px' : '0px'
            }"
            height="30"
            ref="dashboardTabs"
            v-model="dashboardConfig.info.activeTabIndex"
            class="dashboard-tabs border-top-1"
            :hide-slider="false"
            slider-color="orange text--darken-3"
            active-class="orange--text text--darken-3"
            next-icon="mdi-chevron-right"
            prev-icon="mdi-chevron-left"
            show-arrows
        >
            <v-tab
                :class="action == 'view' ? 'px-2' : 'pl-2 pr-6'"
                v-for="(tab, idx) in dashboardConfig.info.tabsAndPages.tabs"
                :key="idx"
                :symper-id="tab.id"
                :symper-tab-name="tab.name"
                v-show="
                    action == 'view'
                        ? idx ==
                          dashboardConfig.info.tabsAndPages.tabs.length - 1
                            ? false
                            : true
                        : true
                "
                @click="handleTabClicked"
            >
                <div class="w-100">
                    <span v-if="!tab.editTabName && !tab.name && !isView">
                        <i class="mdi mdi-plus fs-16"></i>
                    </span>
                    <div
                        class="w-100 text-ellipsis"
                        v-else
                        style="max-width: 150px"
                    >
                        <input
                            :ref="'dashboardTab' + idx"
                            :class="{
                                'tab-name-input': true,
                                'invalid-tab-name': invalidTabName
                            }"
                            v-if="tab.editTabName"
                            size="mini"
                            :placeholder="$t('v2.dashboard.enterTabName')"
                            @change.stop="
                                (vl) => {
                                    changeTabName(idx, vl);
                                }
                            "
                            @input.stop="handleInputTabname"
                            @keydown.stop
                            @keyup.stop
                            v-model="editingTab.name"
                        />
                        <v-tooltip top z-index="200" v-else>
                            <template v-slot:activator="{ on: tooltip }">
                                <span
                                    class="dashboard-tab-item-name w-100 text-ellipsis"
                                    :symper-id="tab.id"
                                    v-on="tooltip"
                                >
                                    {{ tab.name }}
                                </span>
                            </template>
                            <span>{{ tab.name }}</span>
                        </v-tooltip>
                        <v-menu
                            top
                            offset-y
                            v-if="!isView && !tab.editTabName"
                            :close-on-content-click="true"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    @click="handleMoreAction(idx)"
                                    v-bind="attrs"
                                    v-on="on"
                                    x-small
                                    icon
                                    class="dashboard-tab-options ml-2"
                                >
                                    <i
                                        class="fs-16 mdi mdi-dots-horizontal"
                                    ></i>
                                </v-btn>
                            </template>

                            <v-list style="overflow: hidden">
                                <v-list-item
                                    class="py-1"
                                    v-if="
                                        dashboardConfig.info.tabsAndPages.tabs
                                            .length > 1
                                    "
                                    @click="
                                        handleCommandOnTabs({
                                            action: 'remove',
                                            tabIdx: idx
                                        })
                                    "
                                >
                                    <i
                                        class="mdi mdi-trash-can-outline fs-14"
                                    ></i>
                                    <span class="ml-2 fs-13">{{
                                        $t('v2.dashboard.delete')
                                    }}</span>
                                </v-list-item>
                                <v-list-item
                                    class="py-1"
                                    @click="
                                        handleCommandOnTabs({
                                            action: 'rename',
                                            tabIdx: idx
                                        })
                                    "
                                >
                                    <i class="mdi mdi-lead-pencil fs-14"></i
                                    ><span class="ml-2 fs-13">{{
                                        $t('v2.dashboard.changeName')
                                    }}</span>
                                </v-list-item>
                                <v-list-item
                                    class="py-1"
                                    style="
                                        padding-left: 8px !important;
                                        display: flex;
                                        justify-content: space-between;
                                    "
                                >
                                    <div>
                                        <v-layout class="init-filter">
                                            <v-checkbox
                                                v-model="tab.initFilter"
                                                :color="'var(--symper-color)'"
                                                :label="
                                                    $t(
                                                        'v2.dashboard.init_filter'
                                                    )
                                                "
                                                style="height: 25px"
                                                class="mt-0 pt-0 switch-btn"
                                                inset
                                            ></v-checkbox>
                                        </v-layout>
                                    </div>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </div>
            </v-tab>
        </v-tabs>
        <SymperDialogConfirm
            @confirm="confirmDeleteInfo.confirm()"
            @cancel="confirmDeleteInfo.cancel()"
            :title="confirmDeleteInfo.title"
            :titleCancelBtn="$t('common.exit')"
            :titleConfirmBtn="$t('common.delete')"
            :content="confirmDeleteInfo.content"
            :showDialog="confirmDeleteInfo.show"
        />
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import DashboardCellDetail from '@/components/dashboard/components/DashboardCellDetail';
import VueGridLayout from 'vue-grid-layout';
import DatasetTracingPopup from '@/components/dashboard/components/DatasetTracingPopup';
import DashboardCell from '@/components/dashboard/components/DashboardCell.vue';
import { util } from '@/plugins/util';
import _cloneDeep from 'lodash/cloneDeep';
import ReportRenderManagement from '@/components/dashboard/reports/ReportRenderManagement.js';
import ReportTranslatorWorker from 'worker-loader!@/worker/dashboard/ReportTranslator.Worker.js';
import _isEmpty from 'lodash/isEmpty';
import Sortable from 'sortablejs';
import { autoLoadChartClasses } from '@/components/dashboard/configPool/reportConfig.js';
import { calcReportWraperSize } from '@/components/dashboard/configPool/dashboardConfigs.js';
import CrossFilterManagement from '@/components/dashboard/components/filter/CrossFilterManagement.js';
import { getUsedDatasetsFromSetting } from '@/components/dashboard/configPool/reportConfig.js';
import { appConfigs } from '../../../configs';
import { getDataInputForReport } from '@/components/dashboard/configPool/reportConfig.js';
import { dashboardApi } from '@/api/dashboard';
import DashboardFootInfo from '@/components/dashboard/components/DashboardFootInfo.vue';
import ReportSelfFilter from './ReportSelfFilter.vue';
import cloneDeep from 'lodash/cloneDeep';
import AddFilter from '@/components/common/DashboardDefaultFilter';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';

var mapTypeToClasses = autoLoadChartClasses();
let mouseXY = { x: null, y: null };
let DragPos = { x: null, y: null, w: 1, h: 1, i: null };
import _debounce from 'lodash/debounce';

export default {
    created() {
        let self = this;
        /**
         * chỉ ra filter nào không thể tác động tới filter nào
         * {
         *      a: {
         *          b: true,
         *          c: true
         *      }
         * }
         * ==> filter với id a không thể tác động tới filter có id b, c
         */
        this.oneWayFilterMap = {};
        this.tabClickSwitchCount = 0;
        this.reportRenderManagement = new ReportRenderManagement(this);
        this.reportTranslatorWorker = new ReportTranslatorWorker();
        this.listenFromWorker(this.reportTranslatorWorker);
        this.$evtBus.$on('bi-report-change-display', (data) => {
            if (data.hasOwnProperty('instanceKey')) {
                if (data.instanceKey == self.instanceKey) {
                    if (data.type == 'filter') {
                        self.applyFilterFromCell(data.id);
                    } else {
                        self.translateReportConfig(
                            data.id,
                            data.type,
                            data.serverCache,
                            data.refreshDataset,
                            data.fromSetting
                        );
                    }
                }
            } else {
                console.error(
                    'Data in event bi-report-change-display miss key instanceKey'
                );
            }
        });
        this.$evtBus.$on('chart-mobile-drag-end', (cellId) => {
            self.handleDragEnd(cellId);
        });
        this.$evtBus.$on('chart-mobile-dragging', (cellId) => {
            self.handleDrag(cellId);
        });
        if (this.action == 'view' || this.action == 'edit') {
            setTimeout(
                (self) => {
                    self.countComment();
                },
                5000,
                this
            );
        }
        this.$evtBus.$on('comment-change', () => {
            self.countComment();
        });
        this.$evtBus.$on('list-datasets-change', () => {
            self.$store.commit('dashboard/hightlightSelectedDatasetAndCols', {
                id: self.thisDashboardData.currentCellConfigs.sharedConfigs
                    .cellId,
                instanceKey: self.instanceKey
            });
        });
        this.$evtBus.$on('dashboard-setting-item-options-clicked', (data) => {
            self.handleSettingOptionsClicked(data);
        });

        this.$evtBus.$on('symper-collapse-left-sidebar', (data) => {
            self.checkAndResizeAllReports();
        });

        this.$evtBus.$on('collapse-app-sidebar', (data) => {
            self.checkAndResizeAllReports();
        });

        this.$evtBus.$on('switch-dashboard-on-home-page', (data) => {
            if (self.needResizeAllReport && data.key == self.instanceKey) {
                setTimeout(() => {
                    for (let tab of self.dashboardConfig.info.tabsAndPages
                        .tabs) {
                        tab.resizeReports = true;
                    }
                    self.fitDashboardLayout();
                }, 300);
                self.needResizeAllReport = false;
            }
        });
        this.$evtBus.$on('dashboard-get-data', (instanceKey) => {
            if (instanceKey == this.instanceKey) {
                let cellsBeApplyed = {};
                let filter = {};
                for (let cell of this.currentLayout) {
                    if (this.filter.hasOwnProperty(cell.i)) {
                        filter[cell.i] = cloneDeep(this.filter[cell.i]);
                    }
                }

                Object.keys(filter).map((cellId) => {
                    Object.assign(
                        cellsBeApplyed,
                        this.checkCellBeApplyed(cellId)
                    );
                });
                //nếu là loading lần đầu thì cho phép tất cả các cell lấy data
                if (self.isInitLoading[self.activeTabId]) {
                    self.isInitLoading[self.activeTabId] = false;
                    self.renderCellsInViewport(true);
                    // this.$emit('refresh-all-reports');
                } else {
                    //lấy data của các cell bị ảnh hưởng bởi filter config mới
                    for (let cellId in cellsBeApplyed) {
                        if (self.$refs[cellId]) {
                            self.translateReportConfig(cellId, 'filter');
                        }
                        // }
                    }
                }
            }
        });

        this.$evtBus.$on('dashboard-toolBar-show-add-filter', (instanceKey) => {
            if (instanceKey == this.instanceKey) {
                this.$refs.addFilter.filterName = '';
                this.isAddFilter = !this.isAddFilter;
            }
        });
    },
    components: {
        SymperDialogConfirm,
        'add-filter': AddFilter,
        DashboardCell,
        VuePerfectScrollbar,
        DashboardCellDetail,
        'grid-layout': VueGridLayout.GridLayout,
        'grid-item': VueGridLayout.GridItem,
        DatasetTracingPopup,
        ReportSelfFilter,
        DashboardFootInfo
    },
    data() {
        return {
            customFilter: {},
            isInitLoading: {},
            isAddFilter: false,
            confirmDeleteInfo: {
                title: '',
                content: '',
                cancel() {},
                confirm() {},
                show: false
            },
            containerScrollTop: 0,
            filter: {},
            dashboardTab: 'tab-1',
            crossFilterMng: {},
            workspaceHeight: '',
            currentItem: {},
            invalidTabName: false,
            showTabOptions: false,
            activeAutoScroll: false,
            workspaceStyle: {
                width: '100%',
                backgroundColor: 'white'
            },
            workspaceMobileStyle: {
                width: '400px',
                height: '3000px',
                backgroundColor: '#f3f3f3'
            },
            workspaceMobileHorizontalStyle: {
                width: '700px',
                height: '3000px',
                backgroundColor: '#f3f3f3'
            },
            pinnedReportForSelfFilter: '', // id của cell đang được pin trong self config dashboard
            editingTab: {
                name: ''
            }
        };
    },
    computed: {
        activeTabId() {
            let info = this.dashboardConfig.info;
            let activeTabIndex = info.activeTabIndex;
            let activeTabId = info.tabsAndPages.tabs[activeTabIndex].id;
            if (!this.isInitLoading.hasOwnProperty(activeTabId)) {
                this.isInitLoading[activeTabId] = true;
            }
            return activeTabId;
        },
        haveInitFilter() {
            let info =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .dashboardConfigs.info;
            let activeTabIndex = info.activeTabIndex;
            let initFilter = info.tabsAndPages.tabs[activeTabIndex].initFilter;
            return initFilter;
        },
        getDashboardIdInUIService() {
            return `dashboard-${this.idDashboard}:${this.$store.state.app.endUserInfo.id}`;
        },
        reportForSelfFilter() {
            if (!this.pinnedReportForSelfFilter) {
                return this.thisDashboardData.currentCellConfigs;
            } else {
                return this.$store.state.dashboard.allDashboard[
                    this.instanceKey
                ].dashboardConfigs.allCellConfigs[
                    this.pinnedReportForSelfFilter
                ];
            }
        },
        dashboardConfig() {
            return this.$store.state.dashboard.allDashboard[this.instanceKey]
                .dashboardConfigs;
        },
        currentLayout() {
            let info =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .dashboardConfigs.info;
            return info.layout[info.currentTabPageKey];
        },
        dashboardStyle() {
            let config =
                this.$store.state.dashboard.allDashboard[this.instanceKey];
            return config.dashboardConfigs.allCellConfigs.global.viewConfigs
                .displayOptions.dashboardStyle;
        },
        isView() {
            return this.action == 'view';
        },
        thisDashboardData() {
            return this.$store.state.dashboard.allDashboard[this.instanceKey];
        },
        currentGridLayout() {
            let self = this;
            if (this.$refs.mobileLayout) {
                return this.$refs.mobileLayout.filter((el) => {
                    return (
                        el.$attrs['layout-tab-name'] ==
                        self.dashboardConfig.info.currentTabPageKey
                    );
                })[0];
            } else {
                return {};
            }
        }
    },
    methods: {
        refreshCell(cellId) {
            if (this.$refs[cellId]) {
                this.$evtBus.$emit('dashboard-set-value-filter', [], cellId);
                this.translateReportConfig(cellId, 'filter', false);
            }
        },
        onInitTab(tabId) {
            this.isInitLoading[tabId] = true;
        },
        checkCellBeApplyed(filterId) {
            this.$evtBus.$emit(
                'dashboard-set-value-filter',
                this.filter[filterId],
                filterId
            );
            let cellBeApply = {};
            let allCells =
                this.thisDashboardData.dashboardConfigs.allCellConfigs;
            let cellFilter = allCells[filterId];
            //thêm các config vào từng cell, check theo dataset, logic lấy từ methods 'applyFilterFromCell', trả ra các cell bị ảnh hưởng, để lấy filter từng cell đó thôi

            let allDatasetAndColumn =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .allDatasetColumns;
            let datasetId =
                cellFilter.rawConfigs.setting.value.selectedColums[0].dataset;
            let extraRelations = this.getExtraRelations(allDatasetAndColumn);
            let impactedDatasets =
                this.crossFilterMng.makeConditionForAllDataset(
                    datasetId,
                    extraRelations
                );

            let parentDatasetId = this.getUsingDatasetAndColumns();
            let childDatasetId = {};
            for (let dtsId in allDatasetAndColumn) {
                if (allDatasetAndColumn[dtsId].id_parent == datasetId) {
                    childDatasetId[dtsId] = true;
                }
            }

            for (let cell of this.currentLayout) {
                let cellId = cell.i;
                let runCell = allCells[cellId];
                let sharedConfigs = runCell.sharedConfigs;
                let usedDts = sharedConfigs.usedDatasets;
                let isChildDataset = false;
                for (let subDtsId in childDatasetId) {
                    if (usedDts.hasOwnProperty(subDtsId)) {
                        isChildDataset = true;
                        break;
                    }
                }
                let impactedCrossFilter = this.getImpactedCrossFilter(
                    usedDts,
                    impactedDatasets
                );
                let canBeImpacted = this.checkFilterCanBeImpacted(
                    filterId,
                    cellId
                );
                if (
                    (usedDts.hasOwnProperty(datasetId) ||
                        usedDts.hasOwnProperty(parentDatasetId) ||
                        isChildDataset ||
                        impactedCrossFilter) &&
                    canBeImpacted
                ) {
                    cellBeApply[cellId] = true;
                    if (this.filter[filterId]) {
                        sharedConfigs.filter[filterId] = this.filter[filterId];
                    } else {
                        delete sharedConfigs.filter[filterId];
                    }
                }
            }
            return cellBeApply;
        },
        applyConfigFilter(config) {
            this.filter = config;
        },
        clearAllConfigFilter() {
            for (let cellId in this.filter) {
                this.filter[cellId] = [];
            }
            let allCell =
                this.thisDashboardData.dashboardConfigs.allCellConfigs;
            let currentLayout = this.currentLayout;
            currentLayout.map((cellInfo) => {
                let cell = allCell[cellInfo.cellId];
                if (
                    cell.sharedConfigs.filter != {} ||
                    cell.sharedConfigs.selfFilter.cols != {}
                ) {
                    cell.sharedConfigs.filter = {};
                    cell.sharedConfigs.selfFilter.cols = {};
                    cell.sharedConfigs.selfFilter.applied = false;
                }
            });
        },
        applyFilter(filterConfig, cellsBeApplyed) {
            this.filter = filterConfig.detail;
            let cellsNeedRefresh = {};
            Object.keys(this.filter).map((cell) => {
                Object.assign(cellsNeedRefresh, this.checkCellBeApplyed(cell));
            });
            let allCell =
                this.thisDashboardData.dashboardConfigs.allCellConfigs;
            let selfFilter = cloneDeep(filterConfig.selfFilter);
            Object.keys(selfFilter).map((cellId) => {
                allCell[cellId].sharedConfigs.selfFilter.cols =
                    selfFilter[cellId];
                allCell[cellId].sharedConfigs.selfFilter.applied = true;
                cellsNeedRefresh[cellId] = true;
            });
            Object.assign(cellsNeedRefresh, cellsBeApplyed);
            if (!this.haveInitFilter) {
                for (let cellId in cellsNeedRefresh) {
                    if (this.$refs[cellId]) {
                        this.translateReportConfig(cellId, 'filter', false);
                    }
                }
            }
            this.isInitLoading[this.activeTabId] = false;
        },
        changeStatusAddFilter(status) {
            this.isAddFilter = status;
        },
        acceptLoadTab(tabId) {
            this.isInitLoading[tabId] = false;
        },
        handleAddFilter(data) {
            if (data.type == 'close') {
                this.addFilter = false;
            }
        },
        handleMoreAction(idx) {
            this.dashboardConfig.info.activeTabIndex = idx;
            this.switchTab(idx);
        },
        fitDashboardLayout() {
            if (Array.isArray(this.$refs.gridLayout)) {
                for (let layout of this.$refs.gridLayout) {
                    if (
                        layout.$attrs['layout-tab-name'] ==
                        this.dashboardConfig.info.currentTabPageKey
                    ) {
                        if (
                            Math.abs(
                                $(layout.$el).width() -
                                    $(layout.$el.parentNode).width()
                            ) > 5
                        ) {
                            this.checkAndResizeAllReports();
                        } else {
                            layout.onWindowResize();
                        }
                    }
                }
            }
        },
        checkAndResizeAllReports() {
            let self = this;
            if (this.$el.isConnected) {
                if (this.debounceResizeDashboard) {
                    clearTimeout(this.debounceResizeDashboard);
                }
                this.debounceResizeDashboard = setTimeout(() => {
                    self.recalcDashboardSize();
                    if (containerSize.w) {
                        self.workspaceStyle.width = containerSize.w + 'px';
                        self.resizeAllReportInCurrentTab();
                    } else {
                        self.needResizeAllReport = true;
                    }
                }, 300);
            }
        },
        resizeAllReportInCurrentTab() {
            let self = this;
            setTimeout(() => {
                self.$evtBus.$emit('dashboard-resize-report', {
                    instanceKey: self.instanceKey
                });
            }, 100);
        },
        handleToggleSelfFilter(data) {
            this.toggleReportSelfFilter(true, data.cellId);
        },
        togglePinSelfFilter() {
            let newState = !this.dashboardConfig.info.reportSelfFilter.pinned;
            this.dashboardConfig.info.reportSelfFilter.pinned = newState;
            let currentWidth = Number(
                this.workspaceStyle.width.replace('px', '')
            );
            if (newState) {
                this.workspaceStyle.width = currentWidth - 250 + 'px';
                this.$refs.cellContainer.style.width =
                    this.workspaceStyle.width;
            } else {
                this.workspaceStyle.width = currentWidth + 250 + 'px';
                this.$refs.cellContainer.style.width = '';
            }
            if (newState) {
                this.pinnedReportForSelfFilter =
                    this.thisDashboardData.currentCellConfigs.sharedConfigs.cellId;
            } else {
                this.pinnedReportForSelfFilter = '';
            }
            this.resizeAllReportInCurrentTab();
        },
        applySelfFilter(cellId) {
            let rp = this.dashboardConfig.allCellConfigs[cellId];
            rp.sharedConfigs.currentPage = 1;
            this.translateReportConfig(cellId, 'selfFilter');
        },
        toggleReportSelfFilter(allwaysOpen = false, cellId = null) {
            let isOpenBefore = this.dashboardConfig.info.reportSelfFilter.open;
            let open = allwaysOpen
                ? true
                : !this.dashboardConfig.info.reportSelfFilter.open;
            this.dashboardConfig.info.reportSelfFilter.open = open;
            // Nếu đang pin
            if (this.dashboardConfig.info.reportSelfFilter.pinned) {
                let currentWidth = Number(
                    this.workspaceStyle.width.replace('px', '')
                );
                if (!isOpenBefore && open) {
                    this.workspaceStyle.width = currentWidth - 250 + 'px';
                }

                if (!open) {
                    this.workspaceStyle.width = currentWidth + 250 + 'px';
                }
                if (isOpenBefore != open) {
                    this.resizeAllReportInCurrentTab(true);
                }
                if (open) {
                    this.pinnedReportForSelfFilter = cellId
                        ? cellId
                        : this.thisDashboardData.currentCellConfigs
                              .sharedConfigs.cellId;
                }
            } else {
                this.pinnedReportForSelfFilter = '';
            }
        },
        handleTabClicked(e) {
            if (
                $(e.target).attr('symper-tab-name') !==
                this.dashboardConfig.info.currentTabPageKey
            ) {
                this.tabClickSwitchCount += 1;
            }
        },
        markNeedRenderReport(data) {
            this.dashboardConfig.allCellConfigs.global.viewConfigs.pendingRenderReportCount += 1;
        },
        resetNeedRenderReport() {
            this.dashboardConfig.allCellConfigs.global.viewConfigs.pendingRenderReportCount = 0;
        },
        markReportRendered(data) {
            let viewConfigs =
                this.dashboardConfig.allCellConfigs.global.viewConfigs;
            if (viewConfigs.pendingRenderReportCount > 0) {
                viewConfigs.pendingRenderReportCount -= 1;
            }
        },
        handleDragEnd(cellId) {
            let self = this;
            // let currentGridLayout = this.$refs.mobileLayout.filter((el) => {
            //     return el.$attrs['layout-tab-name'] == self.dashboardConfig.info.currentTabPageKey
            // })[0];
            let parentRect = this.currentGridLayout.$el.getBoundingClientRect();
            let mouseInGrid = false;
            if (
                mouseXY.x > parentRect.left &&
                mouseXY.x < parentRect.right &&
                mouseXY.y > parentRect.top &&
                mouseXY.y < parentRect.bottom
            ) {
                mouseInGrid = true;
            }
            if (mouseInGrid === true) {
                self.dashboardConfig.info.mobileLayout[
                    self.dashboardConfig.info.mobileLayoutDirection
                ].layout[self.dashboardConfig.info.currentTabPageKey] =
                    self.dashboardConfig.info.mobileLayout[
                        self.dashboardConfig.info.mobileLayoutDirection
                    ].layout[
                        self.dashboardConfig.info.currentTabPageKey
                    ].filter((obj) => obj.i !== 'drop');
                let cellConfig = util.cloneDeep(
                    this.dashboardConfig.allCellConfigs[cellId]
                );
                let dashboardInfor = this.dashboardConfig.info;
                for (let i in dashboardInfor.mobileLayout) {
                    dashboardInfor.layout[
                        dashboardInfor.currentTabPageKey
                    ].forEach((e) => {
                        if (e.cellId == cellId) {
                            let layoutItem = util.cloneDeep(e);
                            layoutItem.x = DragPos.x;
                            layoutItem.y = DragPos.y;
                            layoutItem.w = 1;
                            dashboardInfor.mobileLayout[i].layout[
                                dashboardInfor.currentTabPageKey
                            ].push(layoutItem);
                        }
                    });
                    if (!dashboardInfor.mobileLayout[i].chart[cellId]) {
                        self.$set(
                            dashboardInfor.mobileLayout[i].chart,
                            cellId,
                            util.cloneDeep(cellConfig)
                        );
                    }
                }
                setTimeout(
                    (self) => {
                        self.renderCellsInViewport();
                    },
                    1000,
                    this
                );
            }
        },
        handleDrag() {
            let parentRect = this.currentGridLayout.$el.getBoundingClientRect();
            let layout =
                this.dashboardConfig.info.mobileLayout[
                    this.dashboardConfig.info.mobileLayoutDirection
                ].layout[this.dashboardConfig.info.currentTabPageKey];
            let mouseInGrid = false;
            if (
                mouseXY.x > parentRect.left &&
                mouseXY.x < parentRect.right &&
                mouseXY.y > parentRect.top &&
                mouseXY.y < parentRect.bottom
            ) {
                mouseInGrid = true;
            }
            let index = layout.findIndex((item) => item.i === 'drop');
            if (mouseInGrid === true) {
                if (index === -1) {
                    let obj = {
                        x: 1,
                        y: 0,
                        w: 1,
                        h: 1,
                        i: 'drop'
                    };
                    layout.push(obj);
                }
            }
            if (index !== -1) {
                let el = this.currentGridLayout.$children[index];
                el.dragging = {
                    top: mouseXY.y - parentRect.top,
                    left: mouseXY.x - parentRect.left
                };
                let new_pos = el.calcXY(
                    mouseXY.y - parentRect.top - 7,
                    mouseXY.x - parentRect.left
                );
                if (mouseInGrid === true) {
                    this.currentGridLayout.dragEvent(
                        'dragstart',
                        'drop',
                        new_pos.x,
                        new_pos.y,
                        1,
                        1
                    );
                    DragPos.i = String(index);
                    DragPos.x = layout[index].x;
                    DragPos.y = layout[index].y;
                }
                if (mouseInGrid === false) {
                    this.currentGridLayout.dragEvent(
                        'dragend',
                        'drop',
                        new_pos.x,
                        new_pos.y,
                        1,
                        1
                    );
                    layout = layout.filter((obj) => obj.i !== 'drop');
                }
            }
        },
        handleSettingOptionsClicked(data) {
            if (this.instanceKey == data.instanceKey) {
                if (
                    this.$refs[data.reportId] &&
                    this.$refs[data.reportId][0] &&
                    this.$refs[data.reportId][0].hasOwnProperty(
                        'handleSettingColumnOptionsClicked'
                    )
                ) {
                    this.$refs[
                        data.reportId
                    ][0].handleSettingColumnOptionsClicked(data);
                }
            }
        },
        countComment() {
            this.reportTranslatorWorker.postMessage({
                action: 'countComment',
                data: {
                    allCellConfigs: this.dashboardConfig.allCellConfigs
                }
            });
        },
        handleCountComment(data) {
            for (let i in data.data) {
                let arr = i.split(':');
                this.dashboardConfig.allCellConfigs[arr[1]].commentCount =
                    data.data[i];
            }
        },
        handleTracingDataset(item) {
            this.currentItem = item;
            let config = this.dashboardConfig.allCellConfigs[item.cellId];
            this.$refs.datasetTraingPopup.show(config);
        },
        /**
         * khởi tạo instance của Cross filter
         */
        handleViewDetail(item) {
            this.currentItem = item;
            this.$refs.dashboardCellDetail.show();
        },
        async downloadSpreadsheetFile(data) {
            let configs = {
                id: data.responseData.candidateFile.fileId
            };

            await util.getExcelFile(
                configs,
                appConfigs.uniqueApiDomain.msi + `excel-file/download`,
                data.symperTitle.text
            );
        },
        async handleDownloadExcel(item) {
            let cell = this.dashboardConfig.allCellConfigs[item.cellId];

            if (cell.sharedConfigs.type == 'spreadsheet') {
                try {
                    cell.viewConfigs.exportingExcel = true;
                    await this.downloadSpreadsheetFile(
                        cell.viewConfigs.displayOptions
                    );
                } finally {
                    cell.viewConfigs.exportingExcel = false;
                }
                return;
            }

            let relations = this.dashboardConfig.info.relations;
            let configs = getDataInputForReport(cell, relations, false);
            configs.dashboardId = this.getDashboardId();
            let logActivityInfo = this.getActivityLogInfo('export');
            configs = Object.assign(configs, logActivityInfo);

            if (Array.isArray(cell.viewConfigs.displayOptions.columns)) {
                let hiddenCols = cell.viewConfigs.displayOptions.columns.reduce(
                    (map, el) => {
                        if (el.hide) {
                            map[el.headerName] = true;
                        }
                        return map;
                    },
                    {}
                );
                for (let key in configs.columns) {
                    for (let col of configs.columns[key]) {
                        // let as = col.as.split('//')[0].trim();
                        let as = col.as;
                        if (hiddenCols[as]) {
                            col.hiddenOnView = true;
                        }
                    }
                }
            }

            // await util.getExcelFile(configs, appConfigs.apiDomain.biService+"dashboards/export-data", configs.reportName);
            configs.acsync = true;
            try {
                let res = await dashboardApi.getExportExcel(configs);
                if (res.status == 200) {
                    cell.viewConfigs.exportingExcel = true;
                    if (res.data.fileName == '') {
                        res.data.fileName = 'Dataset';
                    }
                    res.data['key'] = {
                        idDashboard: this.idDashboard,
                        cellId: item.cellId
                    };
                    this.$store.commit(
                        'exportExcel/handleAddExportProcess',
                        res.data
                    );
                    this.$evtBus.$emit('show-file-export-excel');
                } else {
                    cell.viewConfigs.exportingExcel = false;
                    this.$snotify({
                        type: 'error',
                        title: this.$t('export.error')
                    });
                }
            } catch (err) {
                cell.viewConfigs.exportingExcel = false;
                this.$snotify({
                    type: 'error',
                    title: this.$t('export.error')
                });
            }
        },
        initCrossFilterMng(idRelations, mapsRelations) {
            let self = this;
            this.crossFilterMng = new CrossFilterManagement(
                idRelations,
                mapsRelations
            );
            self.$refs.addFilter.handleGetCustomFilter(self.customFilter);
        },
        translateSliderFilter(data, settingCol) {
            let cols = [];
            let opertators = ['greaterthanorequal', 'lessthanorequal'];
            for (let i in opertators) {
                cols.push({
                    as: settingCol.as,
                    agg: 'not_agg',
                    cond: {
                        val: data.value[i],
                        type: opertators[i]
                    },
                    name: settingCol.name,
                    type: settingCol.type,
                    dataset: settingCol.dataset,
                    validValue: true
                });
            }
            return cols;
        },
        /**
         * Chuyển đổi cấu hình của filter sang dạng giống với condition
         * @param {Object} cellFilter Đối tượng cấu hình của một cell
         */
        translateFilterCondition(cellFilter) {
            let cellView = cellFilter.viewConfigs;
            let settingCol =
                cellFilter.rawConfigs.setting.value.selectedColums[0];
            let selectionMode =
                cellFilter.rawConfigs.style.selectionControl.children
                    .selectionMode.value;

            if (
                selectionMode == 'default' &&
                (settingCol.type == 'number' || settingCol.type == 'date')
            ) {
                return this.translateSliderFilter(
                    cellView.displayOptions.data,
                    settingCol
                );
            }
            let disSelectArr = Object.keys(cellView.disSelectedValues);
            let selectArr = Object.keys(cellView.selectedValues);

            if (selectArr.length == 0) {
                return false;
            }
            let cond = {
                val: '',
                type: ''
            };
            let column = {
                as: settingCol.as,
                agg: 'not_agg',
                cond: cond,
                name: settingCol.name,
                type: settingCol.type,
                dataset: settingCol.dataset,
                validValue: true
            };

            if (cellView.clickedAll) {
                if (cellView.selectedAll) {
                    cond.type = 'isall';
                } else {
                    cond.type = 'notin';
                    cond.val = disSelectArr.join(',');
                }
            } else {
                cond.type = 'in';
                cond.val = selectArr.join(',');
            }

            return [column];
        },
        getImpactedVars(impactedDatasets) {
            let rsl = {};
            // let vars = this.dashboardConfigs.info.variables;
            // for(let name in vars){
            //     let item = vars[name];
            //     if(impactedDatasets[item.dataset]){
            //         rsl[name] = item;
            //     }
            // }
            return rsl;
        },
        getUsingDatasetAndColumns() {
            return this.thisDashboardData.allDatasetColumns;
        },
        /**
         * đánh dấu cho các report bị ảnh hưởng bởi variable thì không ngay nữa, đợi khi có được giá trị của variable thì mới chạy report đó
         * và gọi api để lấy data cho các variable
         */
        processVariablesWhenFilterChange(impactedDatasets) {
            let getImpactedVars = this.getImpactedVars(impactedDatasets);
            let allCells = this.dashboardConfigs.allCellConfigs;
            for (let name in getImpactedVars) {
                let item = getImpactedVars[name];
                for (let rpId of item.impactedReportsIds) {
                    allCells[rpId].sharedConfigs.suspendedGetData = true;
                    this.getValueForVar(item, impactedDatasets);
                }
            }
        },
        getImpactedCrossFilter(selectedDataset, impactedDatasets) {
            for (let dtsId in selectedDataset) {
                if (impactedDatasets.hasOwnProperty(dtsId)) {
                    return impactedDatasets[dtsId];
                }
            }
            return false;
        },
        getFilterAndCrossFilterCond(v, impactedDatasets, filterId) {
            let crossFilterCond = '';
            let selectedDataset = {};
            selectedDataset[v.dataset] = {};
            selectedDataset[v.dataset][v.name] = true;
            let filter = [];

            if (impactedDatasets) {
                let impactedCrossFilter = this.getImpactedCrossFilter(
                    selectedDataset,
                    impactedDatasets
                );
                if (impactedCrossFilter) {
                    crossFilterCond =
                        impactedCrossFilter.dtsConds.join(' AND ');
                }

                if (filterId) {
                    let allCells = this.dashboardConfig.allCellConfigs;
                    let cellFilter = allCells[filterId];
                    let datasetId =
                        cellFilter.rawConfigs.setting.value.selectedColums[0]
                            .dataset;
                    if (
                        selectedDataset.hasOwnProperty(datasetId) ||
                        impactedCrossFilter
                    ) {
                        filter = this.filter[filterId];
                    }
                }
            }

            return { filter, crossFilterCond };
        },
        async getVariableValues(impactedDatasets = false, filterId = false) {
            let vars = this.dashboardConfig.info.variables;
            vars = vars ? vars : {};
            let varNames = Object.keys(vars);
            let varDefs = Object.values(vars);
            let arrPromises = [];
            for (let v of varDefs) {
                let cond = this.getFilterAndCrossFilterCond(
                    v,
                    impactedDatasets,
                    filterId
                );
                let dataPost = {
                    relations: this.dashboardConfig.info.relations,
                    columns: {
                        value: [
                            {
                                as: v.column,
                                agg: v.agg,
                                cond: {
                                    val: '',
                                    type: 'isall'
                                },
                                edit: false,
                                name: v.column,
                                type: 'number', // giá trị của type phải lấy từ thông tin cột của dataset
                                dataset: v.dataset,
                                origin_type: 'number' // giá trị của type phải lấy từ thông tin cột của dataset
                            }
                        ]
                    },
                    condition: [],
                    reportType: 'variable',
                    cellId: v.name,
                    filter: cond.filter,
                    script: v.script ? v.script : '',
                    reportName: 'Variable ' + v.name,
                    needTotal: false,
                    dashboardId: 0,
                    crossFilterCond: cond.crossFilterCond
                };
                let varValue = dashboardApi.getData(dataPost);
                arrPromises.push(varValue);
            }
            let rawVarValues = await Promise.allSettled(arrPromises);
            let mapVarValue = {};
            for (let i in rawVarValues) {
                let vl = 0; // chỗ này cần phụ thuộc vào kiểu dữ liệu của biến
                let item = rawVarValues[i];
                if (
                    item.status == 'fulfilled' &&
                    item.value.data &&
                    item.value.data &&
                    item.value.data.data.length
                ) {
                    vl = Object.values(item.value.data.data[0])[0];
                } else {
                    console.error(
                        'Error when get dashboard variable value',
                        item,
                        i,
                        varDefs[i]
                    );
                }
                mapVarValue[varNames[i]] = vl;
            }
            this.dashboardConfig.info.variablesValue = mapVarValue;

            return {};
        },
        async getValueForVar(variable, impactedDatasets = null) {
            let crossFilterCond = '';
            let self = this;
            let selectedDataset = {};
            selectedDataset[variable.dataset] = {};
            selectedDataset[variable.dataset][variable.name] = true;
            if (impactedDatasets) {
                let impactedCrossFilter = this.getImpactedCrossFilter(
                    selectedDataset,
                    impactedDatasets
                );
                if (impactedCrossFilter) {
                    crossFilterCond =
                        impactedCrossFilter.dtsConds.join(' AND ');
                }
            }
            let configs = {
                cellId: variable.name,
                columns: {
                    value: [
                        {
                            agg: variable.agg,
                            as: variable.name,
                            cond: { val: '', type: 'isall' },
                            dataset: variable.dataset,
                            name: variable.name,
                            origin_type: 'text',
                            type: 'text'
                        }
                    ]
                },
                condition: [],
                crossFilterCond: crossFilterCond,
                dashboardId: 0,
                filter: [],
                needTotal: false,
                relations: Object.keys(this.dashboardConfigs.info.datasets),
                reportName: `Variable ${variable.name}`,
                reportType: 'variable'
            };

            // reportDataGet.getData(configs).then((res) => {
            //     let varDef = this.dashboardConfigs.info.variables[res.data.cellId];
            //     let varName = varDef.name;
            //     let val = res.data[0][varName];

            //     for(let reportId in varDef.impactedReportsIds){
            //         // self
            //     }
            // });
        },
        getActivedCellIds() {
            let layout = this.currentLayout;
            let rsl = {};
            for (let cellLayout of layout) {
                if (cellLayout.active) {
                    rsl[cellLayout.i] = true;
                }
            }
            return rsl;
        },
        getExtraRelations(allDatasetAndColumn = null) {
            if (!allDatasetAndColumn) {
                allDatasetAndColumn = this.getUsingDatasetAndColumns();
            }
            let rsl = {};
            for (let id in allDatasetAndColumn) {
                let dts = allDatasetAndColumn[id];
                if (
                    Array.isArray(dts.subDatasetIds) &&
                    dts.subDatasetIds.length > 0
                ) {
                    rsl[id] = {};
                    for (let subId of dts.subDatasetIds) {
                        rsl[id][subId] = [
                            {
                                fromDataset: id,
                                toDataset: subId,
                                fromCol: 'document_object_id',
                                toCol: 'document_object_parent_id'
                            }
                        ];

                        rsl[subId] = {};
                        rsl[subId][id] = [
                            {
                                fromDataset: subId,
                                toDataset: id,
                                fromCol: 'document_object_parent_id',
                                toCol: 'document_object_id'
                            }
                        ];
                    }
                }
            }
            return rsl;
        },
        setItemForOneWayFilter(source, target) {
            if (!this.oneWayFilterMap[target]) {
                this.oneWayFilterMap[target] = {};
            }
            this.oneWayFilterMap[target][source] = true;
        },
        checkFilterCanBeImpacted(source, target) {
            if (source == target) {
                return false;
            } else if (!this.oneWayFilterMap[source]) {
                return true;
            } else {
                return !this.oneWayFilterMap[source][target];
            }
        },
        async applyFilterFromCell(filterId) {
            let allCells =
                this.thisDashboardData.dashboardConfigs.allCellConfigs;
            let cellFilter = allCells[filterId];
            this.filter[filterId] = this.translateFilterCondition(cellFilter);
            let allDatasetAndColumn = this.getUsingDatasetAndColumns();
            let datasetId =
                cellFilter.rawConfigs.setting.value.selectedColums[0].dataset;
            let extraRelations = this.getExtraRelations(allDatasetAndColumn);
            let impactedDatasets =
                this.crossFilterMng.makeConditionForAllDataset(
                    datasetId,
                    extraRelations
                );
            await this.getVariableValues(impactedDatasets, filterId);
            let parentDatasetId = allDatasetAndColumn[datasetId].id_parent;
            let childDatasetId = {};
            for (let dtsId in allDatasetAndColumn) {
                if (allDatasetAndColumn[dtsId].id_parent == datasetId) {
                    childDatasetId[dtsId] = true;
                }
            }
            let activedCellIds = this.getActivedCellIds();
            for (let cell of this.currentLayout) {
                let cellId = cell.i;
                let runCell = allCells[cellId];
                let sharedConfigs = runCell.sharedConfigs;
                let usedDts = sharedConfigs.usedDatasets;
                let isChildDataset = false;
                for (let subDtsId in childDatasetId) {
                    if (usedDts.hasOwnProperty(subDtsId)) {
                        isChildDataset = true;
                        break;
                    }
                }
                let impactedCrossFilter = this.getImpactedCrossFilter(
                    usedDts,
                    impactedDatasets
                );
                let canBeImpacted = this.checkFilterCanBeImpacted(
                    filterId,
                    cellId
                );
                if (
                    (usedDts.hasOwnProperty(datasetId) ||
                        usedDts.hasOwnProperty(parentDatasetId) ||
                        isChildDataset ||
                        impactedCrossFilter) &&
                    canBeImpacted
                ) {
                    if (runCell.sharedConfigs.type == 'filter') {
                        this.setItemForOneWayFilter(filterId, cellId);
                    }
                    // nếu không có initFilter và cell không phải là chart dạng filter thì không set filter
                    if (
                        !this.haveInitFilter &&
                        sharedConfigs.type != 'filter'
                    ) {
                        sharedConfigs.filter[filterId] = this.filter[filterId];
                        if (
                            sharedConfigs.filter[filterId] &&
                            impactedCrossFilter
                        ) {
                            sharedConfigs.crossFilterCond =
                                impactedCrossFilter.dtsConds.join(' AND ');
                        } else {
                            sharedConfigs.crossFilterCond = undefined;
                        }
                        if (!this.filter[filterId]) {
                            delete sharedConfigs.filter[filterId];
                        }
                    }
                    if (activedCellIds[cellId]) {
                        this.resetSelfFilterSelections(runCell);
                        if (
                            runCell.sharedConfigs.type == 'filter' &&
                            runCell.rawConfigs.style.selectionControl.children
                                .selectionMode.value == 'dropList'
                        ) {
                            sharedConfigs.filter[filterId] =
                                this.filter[filterId];
                            // đánh dấu là cần tải thêm dữ liệu khi click vào
                            runCell.sharedConfigs.penddingLoadData = true;
                        } else {
                            // nếu không có initFilter thì mới cho lấy dữ liệu, việc láy dữ liệu của cell khi có initFilter sẽ diễn ra khi click 'lấy dữ liệu'
                            if (!this.haveInitFilter) {
                                this.dashboardConfig.allCellConfigs[
                                    cellId
                                ].sharedConfigs.currentPage = 1;
                                this.translateReportConfig(cellId, 'filter');
                            }
                        }
                    }
                }
            }
        },
        resetSelfFilterSelections(runCell) {
            let selfFilterConfig =
                runCell.sharedConfigs.computedSelfFilterConfig;
            if (!Array.isArray(selfFilterConfig)) {
                return;
            }
            for (let item of selfFilterConfig) {
                item.config.selectItems = [];
            }
            if (this.$refs.reportSelfFilter) {
                this.$refs.reportSelfFilter.getDataForOpenedColumns();
            }
        },
        recalcDashboardSize() {
            let dashboardStyle =
                this.dashboardConfig.allCellConfigs['global'].rawConfigs.style
                    .dashboardSize.children;
            this.setDashboardSize(dashboardStyle);
        },
        setDashboardSize(dashboardSize) {
            let self = this;
            let sizeMode = dashboardSize.dashboardSizeMode.value;
            if (sizeMode == 'realSize') {
                // this.workspaceStyle.height = (Number(dashboardSize.height.value) ? dashboardSize.height.value : 720) + 'px';
                this.workspaceStyle.width =
                    (Number(dashboardSize.width.value)
                        ? dashboardSize.width.value
                        : 1080) + 'px';
            } else if ((sizeMode = 'fitWidth')) {
                let container = util.getComponentSize(this.$el);
                let currentGridLayout = this.$refs.gridLayout.filter((el) => {
                    return (
                        el.$attrs['layout-tab-name'] ==
                        self.dashboardConfig.info.currentTabPageKey
                    );
                })[0];
                // this.workspaceStyle.height = currentGridLayout.mergedStyle.height;
                if (container.w > 10) {
                    this.workspaceStyle.width = container.w - 10 + 'px';
                } else {
                    this.workspaceStyle.width = '100%';
                }
            } else if ((sizeMode = 'fitScreen')) {
                let containerSize = util.getComponentSize(this.$el);
                // this.workspaceStyle.height = containerSize.h + 'px';
                this.workspaceStyle.width = containerSize.w + 'px';
            }
        },
        setDashboardStyle(style) {
            this.setDashboardSize(style.dashboardSize.children);
            this.workspaceStyle.backgroundColor =
                style.dashboarStyle.children.bgColor.value;
        },
        checkCellFocused() {
            if (this.focusedDOM) {
                let dom = $(this.focusedDOM);
                let cellWrapper = dom.parents(
                    '.symper-grid-item.symper-dashboard-cell-wrapper'
                );
                if (
                    cellWrapper.length ||
                    (dom.hasClass('symper-grid-item') &&
                        dom.hasClass('symper-dashboard-cell-wrapper'))
                ) {
                    // Nếu dom đang focus nằm trong 1 cell nào đó trong dashboard thì mới cho phép copy hoặc cut
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        checkCopyReport(evt) {
            if (this.checkCellFocused()) {
                this.$store.commit('dashboard/copyReport', {
                    dashboardConfigs: this.dashboardConfig,
                    reportId:
                        this.thisDashboardData.currentCellConfigs.sharedConfigs
                            .cellId,
                    instanceKey: this.instanceKey
                });
            }
        },
        checkCutReport(evt) {
            if (this.checkCellFocused()) {
                this.$store.commit('dashboard/cutReport', {
                    dashboardConfigs: this.dashboardConfig,
                    reportId:
                        this.thisDashboardData.currentCellConfigs.sharedConfigs
                            .cellId,
                    instanceKey: this.instanceKey
                });
            }
        },
        checkPasteReport(pasteEvent) {
            let items = pasteEvent.clipboardData.items;
            let self = this;
            if (this.focusedDOM) {
                let dom = $(this.focusedDOM);
                let wrapper = dom.parents('.symper-dashboard-workspace');
                if (
                    wrapper.length ||
                    dom.hasClass('symper-dashboard-workspace')
                ) {
                    for (let it of items) {
                        if (it.type == 'text/plain') {
                            it.getAsString((str) => {
                                self.$store.commit('dashboard/pasteReport', {
                                    instanceKey: this.instanceKey,
                                    reportData: str
                                });
                            });
                            break;
                        }
                    }
                }
            }
        },
        autoScrollBottom(offset) {
            this.$refs.cellContainer.scrollTop =
                this.$refs.cellContainer.scrollTop + offset;
        },
        /**
         * Thêm cell mới vào dashboard
         */
        addCell(type, active = false, cellSize = {}) {
            if (type != 'global') {
                this.$store.commit('dashboard/addCellToLayout', {
                    instanceKey: this.instanceKey,
                    type,
                    cellSize,
                    active
                });
            }
        },
        onDragTabEnd(evt) {
            let self = this;
            let tabEl = $(self.$refs.dashboardTabs.$el).find(
                '.dashboard-tab-item-name'
            );
            let names = [];
            let ids = [];
            let count = 0;

            let mapNameToTab =
                self.dashboardConfig.info.tabsAndPages.tabs.reduce(
                    (map, el) => {
                        map[el.name] = el;
                        return map;
                    },
                    {}
                );

            for (let item of tabEl) {
                let name = $(item).text().trim();
                let id = $(item).attr('symper-id');
                names.push(name);
                ids.push(id);
            }

            let newArr = [];
            let tab = null;
            for (let i = 0; i < names.length; i++) {
                tab = mapNameToTab[names[i]];
                tab.id = util.str.randomString(6);
                newArr.push(tab);
            }
            newArr.push({
                id: util.str.randomString(6),
                active: false,
                editTabName: false,
                name: ''
            });
            self.dashboardConfig.info.tabsAndPages.tabs = newArr;
            setTimeout(
                (self) => {
                    for (let i = 0; i < newArr.length; i++) {
                        if (
                            newArr[i].name.trim() ==
                            self.dashboardConfig.info.currentTabPageKey.trim()
                        ) {
                            self.dashboardConfig.info.activeTabIndex = i;
                            break;
                        }
                    }
                },
                0,
                this
            );
        },
        dragAndDropTabs() {
            let el = $(this.$refs.dashboardTabs.$el).find(
                '.v-slide-group__content.v-tabs-bar__content'
            )[0];
            let sortTabs = Sortable.create(el, {
                animation: 200,
                filter: '.el-icon-close',
                onEnd: this.onDragTabEnd,
                ghostClass: 'ghost-class-dragging',
                dragClass: 'ghost-class-dragging',
                chosenClass: 'ghost-class-dragging'
            });
        },
        listenFromWorker(workerObj) {
            let self = this;
            workerObj.addEventListener('message', function (event) {
                let data = event.data;
                let action = data.action;
                if (self[action]) {
                    self[action](data.data);
                } else {
                    console.error(` action ${action} not found `);
                }
            });
        },
        onChangeCellConfigs(changeType, cellId) {
            this.translateReportConfig(cellId, changeType);
        },
        getReportWraperSize(cellId) {
            if (cellId == 'global') {
                return {
                    h: 0,
                    w: 0
                };
            } else {
                return calcReportWraperSize(
                    this.$refs[cellId][0],
                    this.dashboardConfig.allCellConfigs[cellId]
                );
            }
        },
        getDashboardId() {
            let cond = this.action == 'view' || this.action == 'edit';
            if (cond) {
                return this.idDashboard;
            } else {
                return 0;
            }
        },
        canReportTranslate(cell) {
            let columnSetting = cell.rawConfigs.setting;
            let canTranslate = false;
            if (Object.keys(columnSetting).length == 0) {
                canTranslate = true;
            } else {
                for (let key in columnSetting) {
                    if (
                        columnSetting[key].selectedColums &&
                        columnSetting[key].selectedColums.length > 0
                    ) {
                        canTranslate = true;
                        break;
                    }
                }
            }

            // if(cell.sharedConfigs.type == 'filter' && this.status == 'init' && cell.rawConfigs.style.selectionControl.children.selectionMode.value == 'dropList'){
            //     canTranslate = false;
            //     cell.sharedConfigs.data = [];
            //     cell.sharedConfigs.getDataTimes = 2; // để ko show icon nữa
            // }
            return canTranslate;
        },
        translateReportConfig(
            cellId,
            changeType = 'data',
            serverCache = true,
            refreshDataset = false,
            fromSetting
        ) {
            let cell;
            if (this.dashboardConfig.info.isMobileLayout) {
                cell =
                    this.dashboardConfig.info.mobileLayout[
                        this.dashboardConfig.info.mobileLayoutDirection
                    ].chart[cellId];
            } else {
                cell = this.dashboardConfig.allCellConfigs[cellId];
                if (
                    this.action != 'view' &&
                    fromSetting &&
                    !cell.rawConfigs.extra.autoRefreshing
                ) {
                    return;
                }
            }
            //các loại có thể getData mà không cần config
            const canGetDataWithoutInitConfig = {
                card: true,
                filter: true,
                editor: true
            };
            if (
                this.isInitLoading[this.activeTabId] &&
                !canGetDataWithoutInitConfig[cell.sharedConfigs.type] &&
                this.haveInitFilter &&
                changeType != 'selfFilter'
            ) {
                return;
            }
            if (changeType == 'selfFilter') {
                this.$refs[cellId][0].getDataBySelfFilter = true;
            }
            // các loại change data hợp lệ
            let validChangeType = {
                data: true, // khi thay đổi ảnh hưởng tới dữ liệu cuẩ report
                style: true, // khi thay đổi cấu hình style của report (ko ảnh hưởng tới dữ liệu)
                autocomplete: true, // khi gõ trong filter của droplist để lấy danh sách các item cần thiết
                filter: true, // Khi áp dụng filter
                selfFilter: true // khi áp dụng self filter
            };
            if (
                changeType == 'data' ||
                changeType == 'filter' ||
                changeType == 'selfFilter'
            ) {
                cell.sharedConfigs.usedDatasets = getUsedDatasetsFromSetting(
                    cell.rawConfigs.setting
                );
            }

            if (
                changeType == 'data' ||
                changeType == 'filter' ||
                changeType == 'selfFilter' ||
                changeType == 'autocomplete'
            ) {
                cell.sharedConfigs.getDataTimes += 1;
            }
            if (!validChangeType[changeType]) {
                console.error('Invalid change type!');
                return;
            }

            if (!this.canReportTranslate(cell)) {
                return;
            }
            this.markNeedRenderReport({
                cellId
            });
            let reportSize = this.getReportWraperSize(cellId);
            if (changeType != 'style' && changeType != 'autocomplete') {
                cell.viewConfigs.loadingData = true;
            }
            cell.sharedConfigs.experimentalMode = this.experimentalMode;
            let dataPost = {
                action: 'translateReportConfig',
                data: {
                    extra: {
                        size: reportSize,
                        relations: this.dashboardConfig.info.relations,
                        dashboardId: this.getDashboardId(),
                        changeType,
                        serverCache: serverCache,
                        refreshDataset: refreshDataset,
                        variablesValue:
                            this.dashboardConfig.info.variablesValue,
                        logActivityInfo: this.getActivityLogInfo(changeType)
                    },
                    cell: {
                        rawConfigs: JSON.parse(JSON.stringify(cell.rawConfigs)),
                        sharedConfigs: cell.sharedConfigs
                    },
                    oldDisplayOption: cell.viewConfigs.displayOptions
                }
            };
            this.reportTranslatorWorker.postMessage(dataPost);
        },
        getActivityLogInfo(changeType) {
            try {
                let mapRouteName = {
                    home: 'home',
                    'my-applications': 'application',
                    viewDashboard: 'view detail',
                    editDashboard: 'edit'
                };
                let routeName = this.$route.name;
                let mapChangeType = {
                    data: 'load',
                    filter: 'load by filter report',
                    selfFilter: 'load by self filter',
                    autocomplete: 'search in filter',
                    export: 'export'
                };
                let rsl = {
                    dashboardName: this.dashboardConfig.info.dashboardName,
                    tabName: this.dashboardConfig.info.currentTabPageKey,
                    actionContext: mapRouteName[routeName]
                        ? mapRouteName[routeName]
                        : '',
                    reportAction: mapChangeType[changeType]
                        ? mapChangeType[changeType]
                        : 'load'
                };
                return rsl;
            } catch (error) {
                return null;
            }
        },
        validateReportConfig(report) {
            let rsl = {};
            let allDatasetColumns =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .allDatasetColumns;
            let mapDtsAndCols = {};
            for (let dts in allDatasetColumns) {
                mapDtsAndCols[dts] = allDatasetColumns[dts].columns.reduce(
                    (map, el) => {
                        map[el.name] = el;
                        return map;
                    },
                    {}
                );
            }
            for (let key in report.rawConfigs.setting) {
                for (let col of report.rawConfigs.setting[key].selectedColums) {
                    if (
                        !mapDtsAndCols[col.dataset] ||
                        (mapDtsAndCols[col.dataset] &&
                            !mapDtsAndCols[col.dataset][col.name])
                    ) {
                        rsl['INVALID_COLUMN_CONFIG'] = {};
                        break;
                    }
                }
                if (rsl['INVALID_COLUMN_CONFIG']) {
                    break;
                }
            }
            return rsl;
        },
        getErrorsDetail(errors, report) {
            let rsl = {};
            let validConfigs = this.validateReportConfig(report);
            let mapErrorAndMsg = {
                INVALID_COLUMN_CONFIG: {
                    title: this.$t('v2.dashboard.configError'),
                    detail: this.$t('v2.dashboard.configErrorDetail')
                },
                QUERY_PREPARATION_ERROR: {
                    title: this.$t('v2.dashboard.processingError')
                },
                DOC_OR_DATAFLOW_ERROR: {
                    title: this.$t('v2.dashboard.docOrDataflowError')
                },
                DOC_ERROR: {
                    title: this.$t('v2.dashboard.docError')
                },
                DATAFLOW_ERROR: {
                    title: this.$t('v2.dashboard.dataflowError')
                }
            };
            for (let key2 in validConfigs) {
                rsl[key2] = {
                    title: mapErrorAndMsg[key2].title,
                    detail: mapErrorAndMsg[key2].detail
                        ? mapErrorAndMsg[key2].detail
                        : errors[key2].msg
                };
            }

            if (_isEmpty(rsl)) {
                for (let key in errors) {
                    rsl[key] = {
                        title: mapErrorAndMsg[key].title,
                        detail: mapErrorAndMsg[key].detail
                            ? mapErrorAndMsg[key].detail
                            : errors[key].msg
                    };
                }
            }

            return rsl;
        },
        applyTranslatedConfig(data) {
            let cell;
            let self = this;
            if (this.dashboardConfig.info.isMobileLayout) {
                cell =
                    this.dashboardConfig.info.mobileLayout[
                        this.dashboardConfig.info.mobileLayoutDirection
                    ].chart[data.cellId];
            } else {
                cell = this.dashboardConfig.allCellConfigs[data.cellId];
            }
            try {
                if (!_isEmpty(data)) {
                    if (data.error) {
                        cell.viewConfigs.error.exist = true;
                        this.$set(
                            cell.viewConfigs.error,
                            'detail',
                            this.getErrorsDetail(data.error, cell)
                        );
                        cell.sharedConfigs.data = data.originData;
                    } else {
                        cell.viewConfigs.error.exist = false;
                        cell.sharedConfigs.data = data.originData;
                        let classOfType =
                            mapTypeToClasses[cell.sharedConfigs.type];
                        data.translatedData = classOfType.editTranslatedData(
                            data.translatedData
                        );
                        this.$set(
                            cell.viewConfigs,
                            'displayOptions',
                            data.translatedData
                        );
                        if (data.cellId == 'global') {
                            this.setDashboardStyle(cell.rawConfigs.style);
                        }
                    }
                }
            } catch (error) {
                console.error(
                    '[SYMPER ERROR]: Error when set report config!',
                    error
                );
            } finally {
                setTimeout(() => {
                    cell.viewConfigs.loadingData = false;
                    self.markReportRendered({
                        cellId: cell.sharedConfigs.cellId
                    });
                }, 300);
            }
        },
        async renderCellsInViewport(rerender = false) {
            let scrollY = this.containerScrollTop;
            let layout;
            if (this.dashboardConfig.info.isMobileLayout) {
                layout =
                    this.dashboardConfig.info.mobileLayout[
                        this.dashboardConfig.info.mobileLayoutDirection
                    ].layout;
            } else {
                layout = this.dashboardConfig.info.layout;
            }
            let tabKey = this.dashboardConfig.info.currentTabPageKey;
            let viewportHeight = this.workspaceHeight;
            if (this.status == 'init') {
                await this.getVariableValues();
            }
            this.reportRenderManagement.renderCellsInViewport(
                scrollY,
                layout,
                tabKey,
                viewportHeight,
                rerender
            );
        },
        handleLayoutRendered() {
            if (this.status == 'init') {
                setTimeout(
                    (self) => {
                        self.renderCellsInViewport();
                    },
                    0,
                    this
                );
            }
        },
        addTab() {
            let tabs = this.dashboardConfig.info.tabsAndPages.tabs;
            let newTabName = 'tab ' + tabs.length;
            tabs[tabs.length - 1].name = newTabName;

            this.dashboardConfig.info.currentTabPageKey = newTabName;
            this.$set(this.dashboardConfig.info.layout, newTabName, []);
            this.$set(this.dashboardConfig.info.drillThrough, newTabName, []);

            this.dashboardConfig.info.activeTabIndex = tabs.length - 1;
            this.switchTab(tabs.length - 1);

            tabs.push({
                name: '',
                active: false,
                id: Date.now() + util.str.randomString(6),
                editTabName: false
            });
        },
        switchTab(newTabIndex, oldIndex = -1) {
            this.$store.commit('dashboard/setSelectedCell', {
                id: 'global',
                instanceKey: this.instanceKey
            });

            this.dashboardConfig.info.currentTabPageKey =
                this.dashboardConfig.info.tabsAndPages.tabs[newTabIndex].name;
            setTimeout(
                (self) => {
                    self.resetNeedRenderReport();
                    let info = self.dashboardConfig.info;
                    let currentTab = info.tabsAndPages.tabs[newTabIndex];
                    let isActiveBefore = currentTab.active;
                    currentTab.active = true;
                    self.deactiveSwitchTab = true;
                    info.activeTabIndex = newTabIndex;
                    info.currentTabPageKey = currentTab.name;
                    if (!isActiveBefore) {
                        self.renderCellsInViewport();
                    }
                    self.deactiveSwitchTab = false;
                    if (currentTab.resizeReports) {
                        self.fitDashboardLayout();
                    }
                    this.$refs.addFilter.filterProcessing();
                },
                500,
                this
            );
        },
        deactiveCellsInTab(tabIndex) {
            if (tabIndex != -1) {
                let tabName =
                    this.dashboardConfig.info.tabsAndPages.tabs[tabIndex].name;
                this.reportRenderManagement.deactiveCells(
                    this.dashboardConfig.info.layout[tabName]
                );
            }
        },
        handleCommandOnTabs(info) {
            let tabId = info.tabIdx;
            let tabs = this.dashboardConfig.info.tabsAndPages.tabs;
            let tab = tabs[tabId];
            if (info.action == 'rename') {
                this.$set(tab, 'editTabName', true);
                this.editingTab.name = tab.name;
                this.oldNameOfTab = _cloneDeep(tab.name);
                setTimeout(
                    (self) => {
                        self.$refs['dashboardTab' + tabId][0].focus();
                    },
                    100,
                    this
                );
            } else if (info.action == 'remove' && tabs.length > 1) {
                if (tabId == this.dashboardConfig.info.activeTabIndex) {
                    if (tabId == 0) {
                        this.switchTab(1);
                    } else {
                        this.switchTab(tabId - 1);
                    }
                }
                setTimeout(
                    (self) => {
                        tabs.splice(tabId, 1);
                        this.$store.commit('dashboard/setSelectedCell', {
                            id: 'global',
                            instanceKey: this.instanceKey
                        });
                        let layout = self.dashboardConfig.info.layout[tab.name];
                        for (let cell of layout) {
                            self.$delete(
                                self.dashboardConfig.allCellConfigs,
                                cell.cellId
                            );
                        }
                        self.$delete(
                            self.dashboardConfig.info.layout,
                            tab.name
                        );
                        self.$delete(
                            self.dashboardConfig.info.drillThrough,
                            tab.name
                        );
                    },
                    500,
                    this
                );
            }
        },
        handleInputTabname(vl) {
            if (!vl) {
                this.invalidTabName = true;
            } else {
                this.invalidTabName = false;
            }
        },
        setWorkspaceHeight() {
            this.workspaceHeight = util.getComponentSize(this).h - 51 + 'px';
        },
        selectCell(cellId) {
            this.$evtBus.$emit('symper-app-wrapper-clicked', event);
        },
        changeTabName(tabId, evt = null) {
            let newName = this.editingTab.name;
            if (typeof newName == 'string' && !newName.trim()) {
                this.invalidTabName = true;
                this.$snotifyError({}, this.$t('v2.dashboard.emptyTabNameErr'));
                return;
            } else {
                this.invalidTabName = false;
            }
            if (!newName) {
                return;
            }
            let tab = this.dashboardConfig.info.tabsAndPages.tabs[tabId];
            this.$set(tab, 'editTabName', false);
            let oldName = this.oldNameOfTab;
            let layout = this.dashboardConfig.info.layout;
            let drillThrough = this.dashboardConfig.info.drillThrough;

            this.$set(layout, newName, layout[oldName]);
            this.$set(drillThrough, newName, drillThrough[oldName]);

            if (this.dashboardConfig.info.activeTabIndex == tabId) {
                this.dashboardConfig.info.currentTabPageKey = newName;
            }

            tab.name = newName;
            layout[oldName] = null;
            drillThrough[oldName] = null;

            this.$delete(layout, oldName);
            this.$delete(drillThrough, oldName);
        },
        handleDashboardScrolled(evt) {
            this.containerScrollTop = evt.target.scrollTop;
            if (this.debounceActivateReport) {
                clearTimeout(this.debounceActivateReport);
            }
            this.debounceActivateReport = setTimeout(
                (self) => {
                    self.renderCellsInViewport();
                },
                100,
                this
            );
        },
        selectDashboard() {
            this.$store.commit('dashboard/setSelectedCell', {
                id: 'global',
                instanceKey: this.instanceKey
            });
        },
        handleResizingItem() {
            if (event.pageY >= window.innerHeight - 40) {
                this.activeAutoScroll = true;
            } else {
                this.activeAutoScroll = false;
            }
        },
        handleResizeItem(i, newH, newW, newHPx, newWPx) {
            this.activeAutoScroll = false;
            setTimeout(() => {
                this.translateReportConfig(i, 'style');
            }, 0);
        }
    },
    mounted() {
        this.setWorkspaceHeight();
        this.dragAndDropTabs();
        document.addEventListener(
            'dragover',
            function (e) {
                mouseXY.x = e.clientX;
                mouseXY.y = e.clientY;
            },
            false
        );
        if (this.action == 'create') {
            this.dashboardConfig.allCellConfigs.global.viewConfigs.loadingData = false;
        }

        let self = this;
        document.addEventListener(
            'paste',
            function (e) {
                if (!self._inactive) {
                    self.checkPasteReport(e);
                }
            },
            false
        );

        document.addEventListener(
            'copy',
            function (e) {
                if (!self._inactive) {
                    self.checkCopyReport(e);
                }
            },
            false
        );

        this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
            if (!self._inactive) {
                self.focusedDOM = evt.target;
            }
        });
    },
    props: {
        instanceKey: {
            default: ''
        },
        status: {
            default: 'init'
        },
        action: {
            default: 'view'
        },
        idDashboard: {
            default: 0
        },
        experimentalMode: {
            default: ''
        }
    },
    watch: {
        haveInitFilter(newVal, oldVal) {
            if (!newVal) {
                setTimeout(() => {
                    this.$emit('refresh-all-reports');
                }, 100);
            }
        },
        'dashboardConfig.info.reportSelfFilter.open': {
            handler(newValue) {
                if (newValue) {
                    this.$refs.cellContainer.classList.add(
                        'move-y-rail-to-right'
                    );
                } else {
                    this.$refs.cellContainer.classList.remove(
                        'move-y-rail-to-right'
                    );
                }
            }
        },
        'dashboardConfig.allCellConfigs.global.viewConfigs.pendingRenderReportCount':
            {
                handler(newVl, oldValue) {
                    this.dashboardConfig.allCellConfigs.global.viewConfigs.loadingData =
                        Number(newVl) > 0;
                }
            },
        'dashboardConfig.info.activeTabIndex': {
            handler(newVl, oldValue) {
                let tabs = this.dashboardConfig.info.tabsAndPages.tabs;
                if (newVl == tabs.length - 1) {
                    this.addTab();
                } else if (
                    newVl > -1 &&
                    newVl < tabs.length &&
                    oldValue > -1 &&
                    oldValue < tabs.length
                ) {
                    if (this.tabClickSwitchCount > 0) {
                        this.switchTab(newVl, oldValue);
                        this.tabClickSwitchCount -= 1;
                    }
                    this.deactiveSwitchTab = false;
                }
            }
        },
        activeAutoScroll(vl) {
            if (vl) {
                this.autoScrollAction = setInterval(
                    (self) => {
                        self.autoScrollBottom(5);
                    },
                    10,
                    this
                );
            } else {
                clearInterval(this.autoScrollAction);
            }
        },
        'thisDashboardData.currentCellConfigs.rawConfigs.setting': {
            deep: true,
            handler(oldVl, newVl) {
                if (newVl) {
                    this.$store.commit(
                        'dashboard/hightlightSelectedDatasetAndCols',
                        {
                            id: this.thisDashboardData.currentCellConfigs
                                .sharedConfigs.cellId,
                            instanceKey: this.instanceKey
                        }
                    );
                }
            }
        }
    }
};
</script>
<style>
.symper-dashboard-workspace .tab-name-input {
    height: 28px;
    border: 1px solid rgb(206, 206, 206);
}

.dashboard-tab-options {
    position: absolute;
    right: 2px;
    visibility: hidden;
}

.symper-dashboard-workspace .v-tab:hover .dashboard-tab-options {
    visibility: visible;
}

.symper-dashboard-cell-wrapper.selected-report {
    border-color: #f58634 !important;
}

.symper-dashboard-cell-wrapper {
    border: 2px solid #ffffff00;
}

.vue-grid-item .vue-resizable-handle {
    display: none;
}

.vue-grid-item:hover .vue-resizable-handle {
    display: block;
}

.symper-mobile-layout {
    margin-left: auto;
    margin-right: auto;
}
.symper-mobile-horizontal-layout {
    margin-top: auto;
    margin-bottom: auto;
}
.invalid-tab-name input {
    background-color: rgba(255, 0, 0, 0.37);
}

.ghost-class-dragging {
    background-color: rgb(255, 227, 176) !important;
}

.report-self-filter-container {
    position: absolute;
    right: 0px;
    width: 250px;
    z-index: 1;
    background-color: white;
    height: 100%;
    box-shadow: 1px 4px 7px 0px rgb(115 115 115 / 75%);
    z-index: 2;
}

.move-y-rail-to-right > .ps__rail-y {
    right: 250px !important;
}

.dashboard-tabs .v-tab {
    border-right: 1px solid rgb(224, 224, 224);
    text-transform: none !important;
    font-weight: 400 !important;
    font-size: 13px;
}

.dashboard-tabs .v-tab:not(.v-tab--active) {
    color: black !important;
}

.dashboard-tabs .v-tabs-slider-wrapper {
    display: none;
}

.dashboard-tabs .v-slide-group__prev {
    border-right: 1px solid rgb(224, 224, 224);
}

.dashboard-tabs .v-slide-group__next {
    border-left: 1px solid rgb(224, 224, 224);
}
.switch-btn {
    height: 20px;
}
.init-filter {
    margin-right: 2px;
}
.init-filter .v-input--selection-controls__input .v-icon {
    font-size: 18px !important;
}
.init-filter.v-application--is-ltr .v-input--selection-controls__input {
    margin-right: 2px;
}
</style>

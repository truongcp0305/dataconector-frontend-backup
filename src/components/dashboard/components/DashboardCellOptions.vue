<template>
    <div
        class="d-flex justify-end cell-options-wrapper"
        :style="{
            position: 'absolute',
            right: '0px'
        }"
    >
        <v-btn
            v-if="cell.sharedConfigs.type == 'filter'"
            x-small
            icon
            @click="clearFilterValue"
            class="cell-clear-filter cell-action"
        >
            <i class="fs-15 mdi mdi-eraser"></i>
        </v-btn>
        <v-menu
            v-if="!dashboardConfigs.info.isMobileLayout"
            top
            offset-y
            class="dashboard-cell-options"
        >
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    v-bind="attrs"
                    v-on="on"
                    x-small
                    @click="handleMenuOptionCLick"
                    icon
                    class="
                        float-right
                        d-inline-block
                        cell-options-select cell-action
                    "
                >
                    <i class="fs-15 mdi mdi-dots-horizontal"></i>
                </v-btn>
            </template>

            <v-list class="dashboard-options">
                <v-list-item
                    v-if="!excludeOptions['viewDetail']"
                    @click="handleCellAction({ action: 'viewDetail' })"
                    class="py-1 red-item"
                >
                    <i class="mdi fs-14 mdi-eye"></i>
                    <span class="ml-2 fs-13">{{
                        $t('bi.dashboard.detail')
                    }}</span>
                </v-list-item>

                <v-list-item
                    class="py-1"
                    v-if="!isView"
                    @click="handleCellAction({ action: 'clone' })"
                >
                    <i class="fs-14 mdi mdi-content-duplicate"></i>
                    <span class="ml-2 fs-13">{{ $t('common.duplicate') }}</span>
                </v-list-item>
                <v-list-item
                    class="py-1 d-flex"
                    v-if="!isView"
                    @click="handleCellAction({ action: 'copy' })"
                >
                    <span>
                        <i class="mdi fs-14 mdi-content-copy"></i>
                        <span class="ml-2 fs-13">{{ $t('common.copy') }}</span>
                    </span>
                    <span class="fs-12 grey--text pl-4 ml-auto">Ctrl+C</span>
                </v-list-item>
                <v-list-item
                    class="py-1 d-flex"
                    v-if="!isView"
                    @click="handleCellAction({ action: 'cut' })"
                >
                    <span>
                        <i class="mdi fs-14 mdi-content-cut"></i>
                        <span class="ml-2 fs-13">Cut</span>
                    </span>
                    <span class="fs-12 grey--text pl-4 ml-auto">Ctrl+X</span>
                </v-list-item>

                <v-list-item
                    class="item-sort"
                    divided
                    v-if="!isView && !excludeOptions['sort']"
                >
                    <v-menu
                        bottom
                        offset-x
                        :close-on-content-click="closeOnContentClick"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <div
                                v-bind="attrs"
                                v-on="on"
                                class="menu-item-sort h-100 w-100"
                            >
                                <i
                                    class="mdi fs-14 mdi-folder-swap-outline"
                                ></i>
                                <span class="ml-1 fs-13">{{
                                    $t('v2.dashboard.traceData')
                                }}</span>
                            </div>
                        </template>
                        <div class="sort-content p-2">
                            <VuePerfectScrollbar style="max-height: 200px">
                                <div
                                    v-for="(item, i) in listDataset"
                                    :key="i"
                                    @click="showDatasetTracing(item)"
                                    class="
                                        d-flex
                                        trace-dataset__item
                                        mt-1
                                        mb-1
                                        mr-2
                                        ml-2
                                    "
                                >
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <span
                                                class="
                                                    text-ellipsis
                                                    flex-grow-1
                                                "
                                                v-on="on"
                                                style="max-width: 150px"
                                            >
                                                {{
                                                    item.aliasName
                                                        ? item.aliasName
                                                        : item.alias_name
                                                }}
                                            </span>
                                        </template>
                                        <span>{{
                                            item.aliasName
                                                ? item.aliasName
                                                : item.alias_name
                                        }}</span>
                                    </v-tooltip>
                                </div>
                            </VuePerfectScrollbar>
                        </div>
                    </v-menu>
                </v-list-item>
                <v-list-item
                    class="item-sort"
                    divided
                    v-if="!excludeOptions['sort']"
                >
                    <v-menu
                        bottom
                        offset-x
                        :close-on-content-click="closeOnContentClick"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <div
                                v-bind="attrs"
                                v-on="on"
                                class="menu-item-sort h-100 w-100"
                            >
                                <i class="mdi fs-14 mdi-sort"></i>
                                <span class="ml-1 fs-13">{{
                                    $t('bi.dashboard.sort')
                                }}</span>
                            </div>
                        </template>
                        <SortData
                            :selectedColumns="selectedColumns"
                            @apply-sort="applySort"
                        />
                    </v-menu>
                </v-list-item>
                <div
                    v-if="
                        cell.sharedConfigs.canExport &&
                        !excludeOptions['export']
                    "
                >
                    <v-list-item
                        v-show="!cell.viewConfigs.exportingExcel"
                        class="py-1"
                        @click="handleCellAction({ action: 'download-excel' })"
                        :class="{
                            'selected-for-sort': sortMode == 'desc'
                        }"
                    >
                        <i class="mdi fs-14 mdi-microsoft-excel"></i>
                        <span class="ml-2 fs-13">{{
                            $t('bi.dashboard.exportExcel')
                        }}</span>
                    </v-list-item>
                    <v-list-item
                        class="py-1"
                        v-show="cell.viewConfigs.exportingExcel"
                    >
                        <i class="mdi fs-14 mdi-spin mdi-loading"></i>
                        <span class="ml-2 fs-13" style="color: gray">{{
                            $t('bi.dashboard.exporting')
                        }}</span>
                    </v-list-item>
                </div>
                <v-list-item v-else-if="!excludeOptions['export']" class="py-1">
                    <i class="mdi red--text fs-14 mdi-cancel"></i>
                    <span class="ml-2 fs-13 red--text">{{
                        $t('bi.dashboard.notPermissionExportExcel')
                    }}</span>
                </v-list-item>

                <v-list-item
                    class="py-1"
                    @click="handleCellAction({ action: 'print-report' })"
                >
                    <i class="mdi fs-14 mdi-printer"></i>
                    <span class="ml-2 fs-13">{{
                        $t('bi.dashboard.print')
                    }}</span>
                </v-list-item>
                <v-list-item
                    v-if="!isView"
                    @click="handleCellAction({ action: 'remove' })"
                    class="py-1 red-item"
                >
                    <i class="mdi fs-14 mdi-trash-can-outline"></i>
                    <span class="ml-2 fs-13">{{ $t('common.delete') }}</span>
                </v-list-item>
                <v-list-item
                    v-if="!excludeOptions['refresh']"
                    @click="handleCellAction({ action: 'refresh' })"
                    class="py-1 red-item"
                >
                    <i class="mdi fs-14 mdi-refresh"></i>
                    <span class="ml-2 fs-13">{{
                        $t('bi.dashboard.refresh')
                    }}</span>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-menu v-else top offset-y class="dashboard-cell-options">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    v-bind="attrs"
                    v-on="on"
                    x-small
                    icon
                    class="
                        float-right
                        d-inline-block
                        cell-options-select cell-action
                    "
                >
                    <i class="fs-15 mdi mdi-dots-horizontal"></i>
                </v-btn>
            </template>
            <v-list>
                <v-list-item
                    v-if="!isView"
                    @click="handleCellAction({ action: 'deleteMobileChart' })"
                    class="py-1 red-item"
                >
                    <i class="mdi fs-14 mdi-trash-can-outline"></i>
                    <span class="ml-2 fs-13">{{ $t('common.delete') }}</span>
                </v-list-item>
            </v-list>
        </v-menu>

        <v-tooltip bottom v-if="cell.hasSelfFilter">
            <template v-slot:activator="{ on }">
                <v-btn
                    x-small
                    icon
                    :class="{
                        'report-self-filter': true,
                        'symper-text-orange':
                            cell.sharedConfigs.selfFilter.applied
                    }"
                    elevation="0"
                    @click="toggleSelfFilterPanel()"
                    v-on="on"
                >
                    <i
                        :class="{
                            'mdi mdi-filter-outline':
                                !cell.sharedConfigs.selfFilter.applied,
                            'mdi mdi-filter':
                                cell.sharedConfigs.selfFilter.applied,
                            'fs-16': true
                        }"
                    ></i>
                </v-btn>
            </template>
            <span>{{ $t('bi.dashboard.filter-this-report') }}</span>
        </v-tooltip>

        <v-menu bottom offset-y :close-on-content-click="false">
            <template v-slot:activator="{ on, attrs }">
                <div
                    v-bind="attrs"
                    v-on="on"
                    :class="{
                        'float-right d-flex d-inline-block cell-options-comment cell-action': true,
                        'cell-options-comment-empty': cell.commentCount == 0
                    }"
                    :style="{
                        visibility: cell.commentCount == 0 ? 'hidden' : ''
                    }"
                >
                    <!-- <span class="fs-13 float-right" v-if="cell.commentCount">
                        {{ cell.commentCount }}
                    </span> -->
                    <v-btn x-small icon color="grey lighten-1">
                        <i class="fs-13 mdi mdi-comment-outline"></i>
                    </v-btn>
                </div>
            </template>
            <div class="cell-comment-area px-1 pr-2">
                <Comment
                    :showComment="true"
                    :objectType="'dashboard-cell'"
                    :objectIdentifier="cell.sharedConfigs.cellId"
                    :listCommentHeight="370"
                />
            </div>
        </v-menu>
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import Comment from '@/components/common/comment/Comment';
import _cloneDeep from 'lodash/cloneDeep';
import { extractDescriptionFromTitle } from '@/components/dashboard/configPool/reportConfig.js';
import SortData from '@/components/dashboard/components/SortData';

export default {
    components: {
        VuePerfectScrollbar,
        Comment,
        SortData
    },

    computed: {
        excludeOptions() {
            return this.cell.viewConfigs.excludeHeaderOptions;
        },
        dashboardConfigs() {
            return this.$store.state.dashboard.allDashboard[this.instanceKey]
                .dashboardConfigs;
        },
        selectedColumns() {
            let arr = [];
            for (let i in this.cell.rawConfigs.setting) {
                arr = arr.concat(
                    this.cell.rawConfigs.setting[i].selectedColums
                );
            }
            let self = this;
            if (arr.length > 0) {
                arr.forEach(function (e) {
                    if (!e.sort) {
                        self.$set(e, 'sort', 'none');
                    }
                    e.desInfo = extractDescriptionFromTitle(e.as);
                });
            }
            return arr;
        },
        datasetAndColumn() {
            return this.$store.state.dashboard.allDashboard[this.instanceKey]
                .allDatasetColumns;
        }
    },
    methods: {
        toggleSelfFilterPanel() {
            // this.dashboardConfigs.info.reportSelfFilter.open = true;
            this.$emit('toggle-self-filter-panel', {
                cellId: this.cell.sharedConfigs.cellId
            });
        },
        clearFilterValue() {
            this.$evtBus.$emit('dashboard-clear-filter-cell', {
                instanceKey: this.instanceKey,
                cellId: this.cell.sharedConfigs.cellId
            });
        },
        showDatasetTracing(item) {
            let self = this;
            this.$evtBus.$emit('selected-dataset-dashboard', {
                selectedDataset: item,
                listDataset: self.listDataset
            });
            this.$emit('tracing-dataset', item);
        },
        applySort() {
            $(document.getElementsByClassName('v-menu__content')).css(
                'display',
                'none'
            );
            this.closeOnContentClick = true;
            setTimeout(
                (self) => {
                    self.closeOnContentClick = false;
                },
                1000,
                this
            );
            this.$evtBus.$emit('bi-report-change-display', {
                id: this.cell.sharedConfigs.cellId,
                type: 'data',
                instanceKey: this.instanceKey
            });
        },
        removeCell() {
            this.$store.commit('dashboard/removeReport', {
                instanceKey: this.instanceKey,
                reportId: this.cell.sharedConfigs.cellId
            });
        },
        cloneReport() {
            let reportId = this.cell.sharedConfigs.cellId;
            let cellConfig = this.dashboardConfigs.allCellConfigs[reportId];
            let currentLayout =
                this.dashboardConfigs.info.layout[
                    this.dashboardConfigs.info.currentTabPageKey
                ];
            let oldCellLayout = currentLayout.filter((el) => {
                return el.cellId == reportId;
            })[0];

            let cellSize = {
                h: oldCellLayout.h,
                w: oldCellLayout.w
            };
            this.$store.commit('dashboard/addCellToLayout', {
                instanceKey: this.instanceKey,
                type: cellConfig.sharedConfigs.type,
                cellSize,
                active: true,
                autoSelectedCell: false
            });

            setTimeout(
                (self) => {
                    let newCellId = currentLayout[currentLayout.length - 1].i;
                    self.$set(
                        self.dashboardConfigs.allCellConfigs[newCellId],
                        'rawConfigs',
                        _cloneDeep(cellConfig.rawConfigs)
                    );
                    this.$store.commit('dashboard/setSelectedCell', {
                        id: newCellId,
                        instanceKey: this.instanceKey
                    });
                    this.$evtBus.$emit('bi-report-change-display', {
                        id: newCellId,
                        type: 'data',
                        instanceKey: this.instanceKey
                    });
                },
                0,
                this
            );
        },
        getTraceDatasetData() {
            this.listDataset = [];

            for (let i in this.cell.sharedConfigs.usedDatasets) {
                if (this.cell.sharedConfigs.usedDatasets[i]) {
                    if (this.datasetAndColumn[i]) {
                        this.listDataset.push(this.datasetAndColumn[i]);
                    }
                }
            }
        },
        handleMenuOptionCLick() {
            this.getTraceDatasetData();
        },
        handleCellAction(cmd) {
            if (cmd.action == 'remove') {
                this.removeCell();
            } else if (cmd.action == 'clone') {
                this.cloneReport();
            } else if (cmd.action == 'copy') {
                this.$store.commit('dashboard/copyReport', {
                    dashboardConfigs: this.dashboardConfigs,
                    reportId: this.cell.sharedConfigs.cellId,
                    instanceKey: this.instanceKey
                });
            } else if (cmd.action == 'cut') {
                this.$store.commit('dashboard/cutReport', {
                    dashboardConfigs: this.dashboardConfigs,
                    reportId: this.cell.sharedConfigs.cellId,
                    instanceKey: this.instanceKey
                });
            } else if (cmd.action == 'download-excel') {
                this.cell.viewConfigs.exportingExcel = true;
                this.$emit(
                    'download-excel',
                    this.cell.viewConfigs.exportingExcel
                );
            } else if (cmd.action == 'print-report') {
                this.$emit('print-report');
            } else if (cmd.action == 'viewDetail') {
                this.$emit('view-detail', this.cell.sharedConfigs.cellId);
            } else if (cmd.action == 'traceData') {
                this.$emit('trace-data');
            } else if (cmd.action == 'refresh') {
                this.$evtBus.$emit('bi-report-change-display', {
                    instanceKey: this.instanceKey,
                    id: this.cell.sharedConfigs.cellId,
                    type: 'data',
                    serverCache: false,
                    refreshDataset: true
                });
            } else if (cmd.action == 'deleteMobileChart') {
                this.$store.commit('dashboard/removeMobileChart', {
                    dashboardConfigs: this.dashboardConfigs,
                    reportId: this.cell.sharedConfigs.cellId,
                    instanceKey: this.instanceKey
                });
                this.$evtBus.$emit('delete-mobile-chart');
            }
        }
    },
    props: {
        cell: {
            default() {
                return {};
            }
        },
        isView: {
            default() {
                return true;
            }
        },
        instanceKey: {
            defaul: ''
        }
    },
    data() {
        return {
            sortMode: '',
            sortColumn: {},
            closeOnContentClick: false,
            listDataset: []
        };
    }
};
</script>

<style>
.cell-options-wrapper:hover {
    background-color: white;
}
.symper-dashboard-cell .cell-options-select,
.symper-dashboard-cell .cell-clear-filter,
.symper-dashboard-cell .report-self-filter {
    visibility: hidden;
    z-index: 999;
    top: 2px;
}

.symper-dashboard-cell:hover .cell-options-select,
.symper-dashboard-cell:hover .cell-clear-filter,
.symper-dashboard-cell:hover .cell-options-comment-empty,
.symper-dashboard-cell:hover .report-self-filter {
    visibility: visible !important;
}

.symper-dashboard-cell .cell-options-comment-empty {
    visibility: hidden;
}
.symper-dashboard-cell .cell-options-comment {
    z-index: 999;
    top: 2px;
}
.menu-item-sort:hover {
    background-color: #f5f5f5;
}

.trace-dataset__item {
    cursor: pointer;
}
.menu-item-sort {
    height: 30px !important;
    padding-top: 4px;
    padding-left: 16px;
}
.item-sort {
    padding: unset !important;
}
.symper-dashboard-cell .cell-options-select .icon-as-btn,
.symper-dashboard-cell .cell-options-comment .icon-as-btn {
    background-color: #ececec;
    border-radius: 0px !important;
}

.btn-swap-sort {
    cursor: pointer;
}
.cell-comment-area {
    background-color: #ffffff;
    z-index: 100000;
    width: 350px;
    height: 500px;
}

.cell-action {
    margin-right: 2px;
    top: 2px;
    position: relative;
}
.report-self-filter.symper-text-orange {
    visibility: visible !important;
}
</style>

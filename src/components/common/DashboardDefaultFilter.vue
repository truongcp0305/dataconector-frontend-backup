<template>
    <div>
        <div
            class="my-1 pa-1"
            style="background: rgb(230, 229, 229)"
            :class="{ 'd-flex': isAddFilter, 'd-none': !isAddFilter }"
        >
            <div class="flex-grow-1">
                <span class="ml-1 fs-13">{{ $t('common.nameFilter') }} </span>
                <v-text-field
                    class="d-inline-block ml-2 sym-small-size"
                    single-line
                    v-model="filterName"
                    style="background: white; width: 400px"
                    outlined
                    dense
                ></v-text-field>
            </div>
            <div class="pl-13">
                <v-btn
                    small
                    icon
                    tile
                    @click="handleAddFilter('save')"
                    class="ml-1"
                    style="
                        background: #ffffff;
                        height: 22px;
                        width: 22px;
                        top: 3px;
                    "
                >
                    <span class="mdi mdi-check fs-15 color-black"></span>
                </v-btn>
                <v-btn
                    small
                    icon
                    tile
                    @click="handleAddFilter('close')"
                    class="ml-1"
                    style="
                        background: #ffffff;
                        height: 22px;
                        width: 22px;
                        top: 3px;
                    "
                >
                    <span class="mdi mdi-close fs-15 color-black"></span>
                </v-btn>
            </div>
        </div>
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
import _isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
import { uiConfigApi } from '../../api/uiConfig';
export default {
    data() {
        return {
            edittingFilter: -1,
            filterKeywords: {},
            errorMess: '',
            filterName: '',
            listAllFilter: [],
            listFilter: [],
            defaultApplyedFilter: {},
            applyingFilter: {},
            keywords: {},
            confirmDeleteInfo: {
                title: '',
                content: '',
                cancel() {},
                confirm() {},
                show: false
            }
        };
    },
    components: {
        SymperDialogConfirm
    },
    created() {
        this.$evtBus.$on('dashboard-config-filter-action', (data) => {
            if (data.instanceKey == this.instanceKey) {
                this.configFilterAction(data);
            }
        });
        this.$evtBus.$on(
            'dashboard-date-filter-change-keywords',
            (instanceKey, cellId, newValue) => {
                if (instanceKey == this.instanceKey) {
                    this.filterKeywords[cellId] = newValue;
                }
            }
        );
        this.keywords = {
            today() {
                const start = new Date();
                const end = new Date();
                return { start, end };
            },
            yesterday() {
                const start = new Date();
                const end = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24);
                return { start, end };
            },
            last7Days() {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                return { start, end };
            },
            last14Days() {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 14);
                return { start, end };
            },
            last28Days() {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 28);
                return { start, end };
            },
            last30Days() {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                return { start, end };
            }
        };
        this.$evtBus.$on(
            'dashboard-toolBar-select-filter',
            (instanceKey, idx) => {
                if (instanceKey == this.instanceKey) {
                    this.applyFilter(idx);
                }
            }
        );

        this.$evtBus.$on(
            'dashboard-toolBar-clear-applying-filter',
            (instanceKey) => {
                if (instanceKey == this.instanceKey) {
                    // this.isAddFilter = false;
                    this.$emit('change-status-add-filter', false);
                    delete this.applyingFilter[this.activeTabId];
                    let cellNeedRefresh = this.clearAllConfigFilter();
                    for (let cellId in cellNeedRefresh) {
                        this.$emit('refresh-cell', cellId);
                    }
                }
            }
        );
    },

    props: {
        idDashboard: {
            default: ''
        },
        isInitLoading: {
            type: Object,
            default() {
                return {};
            }
        },
        isAddFilter: {
            type: Boolean,
            default: false
        },
        instanceKey: {
            default: ''
        },
        isViewKanban: {
            type: Boolean,
            default: false
        },
        isViewScheduler: {
            type: Boolean,
            default: false
        },
        action: {
            type: String,
            default: ''
        },
        filter: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    computed: {
        currentLayout() {
            let info =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .dashboardConfigs.info;
            return info.layout[info.currentTabPageKey];
        },
        thisDashboardData() {
            return this.$store.state.dashboard.allDashboard[this.instanceKey];
        },
        dashboardConfig() {
            return this.$store.state.dashboard.allDashboard[this.instanceKey]
                .dashboardConfigs;
        },
        activeTabId() {
            let info = this.dashboardConfig.info;
            let activeTabIndex = info.activeTabIndex;
            let activeTabId = info.tabsAndPages.tabs[activeTabIndex].id;
            if (!this.isInitLoading.hasOwnProperty(activeTabId)) {
                this.$emit('init-tab', activeTabId);
            }
            return activeTabId;
        }
    },
    methods: {
        handleGetCustomFilter(data) {
            if (this.action == 'view' && data.status == 200) {
                this.listAllFilter = JSON.parse(data.data.filter);
                // mỗi tab sẽ có 1 default filter riêng
                this.defaultApplyedFilter = JSON.parse(
                    data.data.defaultApplyedFilter
                )
                    ? JSON.parse(data.data.defaultApplyedFilter)
                    : {};
                // check xem filterId được set default có còn tồn tại không, do có thể sharedFilter đó đã bị xóa
                for (let tabId in this.defaultApplyedFilter) {
                    let listUserFilter = this.listAllFilter.filter(
                        (fil) => fil.tabId == tabId
                    );
                    let tab = this.dashboardConfig.info.tabsAndPages.tabs.find(
                        (tab) => tab.id == tabId
                    );
                    let sharedFilter = tab ? tab.filter : [];
                    let listFilter = listUserFilter.concat(sharedFilter);
                    let isExistFilter = false;
                    for (let filter of listFilter) {
                        if (
                            filter.uniqueId == this.defaultApplyedFilter[tabId]
                        ) {
                            isExistFilter = true;
                            break;
                        }
                    }
                    if (!isExistFilter) {
                        delete this.defaultApplyedFilter[tabId];
                    }
                }
                this.filterProcessing();
            } else {
                this.listAllFilter = [];
                this.filterProcessing();
            }
        },
        listSharedFilter() {
            let activeTabIndex = this.dashboardConfig.info.activeTabIndex;
            let tab =
                this.dashboardConfig.info.tabsAndPages.tabs[activeTabIndex];
            return tab.filter;
        },
        configFilterAction(data) {
            let self = this;
            switch (data.type) {
                case 'deleteFilter':
                    this.confirmDeleteInfo.show = true;
                    this.confirmDeleteInfo.title = this.$t(
                        'v2.showlist.deleteFilterConfirmTitle'
                    );
                    this.confirmDeleteInfo.content = this.$t(
                        'v2.showlist.deleteFilterConfirmContent'
                    );
                    this.confirmDeleteInfo.confirm = () => {
                        self.confirmDeleteInfo.show = false;
                        if (this.action != 'view') {
                            if (this.listFilter[data.filterIdx].isShared) {
                                this.listFilter.splice(data.filterIdx, 1);
                                self.saveShareFilterByBA();
                            }
                        } else {
                            let listAllFilter = this.listAllFilter.filter(
                                (filter) =>
                                    filter.tabId !=
                                    this.listFilter[data.filterIdx].tabId
                            );
                            this.listFilter.splice(data.filterIdx, 1);
                            let listUserFilter = this.listFilter.filter(
                                (filter) => !filter.isShared
                            );
                            listAllFilter =
                                listAllFilter.concat(listUserFilter);
                            this.listAllFilter = listAllFilter;
                            this.saveUiConfig();
                        }
                        this.$snotifySuccess(
                            this.$t('v2.dashboard.delete_filter_success')
                        );
                        this.$evtBus.$emit(
                            'dashboard-delete-filter',
                            this.instanceKey,
                            data.filterIdx
                        );
                    };
                    this.confirmDeleteInfo.cancel = () => {
                        self.confirmDeleteInfo.show = false;
                    };
                    break;
                case 'setDefaultFilter':
                    this.defaultApplyedFilter[this.activeTabId] =
                        this.listFilter[data.filterIdx].uniqueId;
                    this.$evtBus.$emit(
                        'dashboard-change-default-applyed-filterId',
                        this.instanceKey,
                        this.defaultApplyedFilter[this.activeTabId]
                    );
                    this.saveUiConfig();
                    this.$snotifySuccess(
                        this.$t('v2.dashboard.set_default_filter_success')
                    );
                    break;
                case 'unsetDefaultFilter':
                    this.defaultApplyedFilter[this.activeTabId] = '';
                    this.saveUiConfig();
                    this.$snotifySuccess(
                        this.$t('v2.dashboard.set_default_filter_success')
                    );
                    this.$evtBus.$emit(
                        'dashboard-change-default-applyed-filterId',
                        this.instanceKey,
                        this.defaultApplyedFilter[this.activeTabId]
                    );
                    break;
                case 'editFilter':
                    this.applyFilter(data.filterIdx);
                    this.edittingFilter = data.filterIdx;
                    // this.addFilterName = this.listFilter[data.filterIdx].name;
                    this.filterName = this.listFilter[data.filterIdx].name;
                    // this.isAddFilter = true;
                    this.$emit('change-status-add-filter', true);
                    break;
            }
        },
        getDashboardIdInUIService() {
            return `dashboard-${this.idDashboard}:${this.$store.state.app.endUserInfo.id}`;
        },
        async saveUiConfig() {
            let data = {
                defaultApplyedFilter: JSON.stringify(this.defaultApplyedFilter),
                widgetIdentifier: this.getDashboardIdInUIService(),
                initFilter: JSON.stringify(this.initFilter),
                filter: JSON.stringify(this.listAllFilter)
            };
            let res = await uiConfigApi.saveUiConfig(data);
            console.log(res);
        },
        saveShareFilterByBA() {
            // lưu những bộ lọc shared vào dashboardConfigs
            let activeTabIndex = this.dashboardConfig.info.activeTabIndex;
            let tab =
                this.dashboardConfig.info.tabsAndPages.tabs[activeTabIndex];
            tab.filter = this.listFilter.filter((filter) => filter.isShared);
        },
        addCustomFilter() {
            //check tên có tồn tại hay không
            let nameAlreadyExists = false;
            this.listFilter.map((filter, filterIdx) => {
                if (
                    filter.name.trim() == this.filterName.trim() &&
                    this.edittingFilter != filterIdx
                ) {
                    nameAlreadyExists = true;
                }
            });
            if (nameAlreadyExists) {
                this.$snotifyError(
                    this.$t('v2.dashboard.error'),
                    this.$t('v2.dashboard.filter_name_already_exists')
                );
                return;
            }
            let activeTabIndex = this.dashboardConfig.info.activeTabIndex;
            let activeTabName =
                this.dashboardConfig.info.tabsAndPages.tabs[activeTabIndex]
                    .name;
            let allCell =
                this.thisDashboardData.dashboardConfigs.allCellConfigs;
            let allActiveTabs = this.dashboardConfig.info.layout[activeTabName];
            let selfFilter = {};
            allActiveTabs.forEach((cell) => {
                if (
                    !_isEmpty(
                        allCell[cell.cellId].sharedConfigs.selfFilter.cols
                    )
                ) {
                    selfFilter[cell.cellId] =
                        allCell[cell.cellId].sharedConfigs.selfFilter.cols;
                }
            });
            let filterDetail = cloneDeep(this.filter);
            //set keyword trước khi lưu
            for (let filter in filterDetail) {
                if (this.filterKeywords.hasOwnProperty(filter)) {
                    filterDetail[filter] = this.filterKeywords[filter];
                }
            }
            let customFilter = {
                uniqueId:
                    this.$store.state.app.endUserInfo.id +
                    this.filterName +
                    Date.now(),
                name: this.filterName.trim(),
                tabId: this.activeTabId,
                detail: filterDetail,
                selfFilter: selfFilter
            };
            if (this.action != 'view') {
                customFilter.isShared = true;
            }
            if (this.edittingFilter == -1) {
                this.listFilter.push(customFilter);
            } else {
                let isDefaultFilter =
                    this.listFilter[this.edittingFilter].isDefault;
                this.listFilter[this.edittingFilter] = customFilter;
                this.listFilter[this.edittingFilter].isDefault =
                    isDefaultFilter;
            }
            //loại bỏ các filter có id là tab hiện tại ra khỏi listAllFilter, do khi thêm mới thì thêm vào listFilter
            let filter = cloneDeep(this.listAllFilter);
            filter = filter.filter(
                (filter) => filter.tabId != this.activeTabId
            );
            //thêm những filter không phải là isShared vào listAllFilter vì khi lưu sẽ lưu listAllFilter
            let userListFilter = this.listFilter.filter(
                (filter) => !filter.isShared
            );
            filter = filter.concat(userListFilter);
            this.listAllFilter = filter;
            //nếu action là edit, clone thì lưu vào dashboardConfigs
            if (this.action != 'view') {
                this.saveShareFilterByBA();
            } else {
                //nếu action là view
                this.saveUiConfig();
            }
            this.$emit('change-status-add-filter', false);
            this.$evtBus.$emit(
                'dashboard-change-list-filter',
                this.instanceKey,
                this.listFilter
            );
            let filterIdx;
            this.listFilter.find((fil, idx) => {
                if (fil.uniqueId == customFilter.uniqueId) {
                    filterIdx = idx;
                }
            });
            this.$evtBus.$emit('dashboard-edit-filter', this.instanceKey);
            this.edittingFilter = -1;
            this.$evtBus.$emit(
                'dashboard-change-selected-filter',
                this.instanceKey,
                filterIdx
            );
            this.applyingFilter[this.activeTabId] = customFilter.uniqueId;
            this.$snotifySuccess(this.$t('v2.dashboard.save_filter_success'));
            this.filterName = '';
        },
        handleAddFilter(type) {
            if (this.filterName.trim() == '' && type == 'save') {
                this.$snotifyError(
                    '',
                    this.$t('validate.required') +
                        ' ' +
                        this.$t('common.nameFilter')
                );
                this.filterName = '';
                return;
            }
            if (type == 'close') {
                this.$emit('change-status-add-filter', false);
                this.filterName = '';
            } else if (type == 'save') {
                this.addCustomFilter();
            }
        },

        filterProcessing() {
            this.$emit('change-status-add-filter', false);
            // lấy các filter mà id của filter đó bằng id tab đang thao tác
            let listFilter = this.listAllFilter.filter((filter) => {
                return filter.tabId == this.activeTabId;
            });
            // thêm các sharedFilter vào listFilter
            let listSharedFilter = this.listSharedFilter();
            listFilter = listFilter.concat(
                listSharedFilter ? listSharedFilter : []
            );
            this.listFilter = cloneDeep(listFilter);
            // thay đổi listFilter ở toolBarx`
            this.$evtBus.$emit(
                'dashboard-change-list-filter',
                this.instanceKey,
                this.listFilter
            );
            let defaultFilterUniqueId =
                this.defaultApplyedFilter[this.activeTabId];
            this.$evtBus.$emit(
                'dashboard-change-default-applyed-filterId',
                this.instanceKey,
                defaultFilterUniqueId
            );
            if (
                !defaultFilterUniqueId &&
                this.isInitLoading[this.activeTabId]
            ) {
                this.$evtBus.$emit(
                    'dashboard-change-selected-filter',
                    this.instanceKey,
                    -1
                );
            } else {
                if (
                    this.isInitLoading[this.activeTabId] &&
                    !this.applyingFilter[this.activeTabId]
                ) {
                    // this.$emit('accept-load-tab', this.activeTabId);

                    let filterIdxDefault = -1;
                    this.listFilter.map((filter, idx) => {
                        if (filter.uniqueId == defaultFilterUniqueId) {
                            filterIdxDefault = idx;
                        }
                    });
                    if (filterIdxDefault != -1) {
                        this.applyFilter(filterIdxDefault);
                    } else {
                        // this.$emit('accept-load-tab', this.activeTabId);
                        this.applyingFilter[this.activeTabId] = '';
                    }
                    this.$evtBus.$emit(
                        'dashboard-change-selected-filter',
                        this.instanceKey,
                        filterIdxDefault
                    );
                } else {
                    if (this.applyingFilter[this.activeTabId]) {
                        let applyingFilterIdx = -1;
                        let filter;
                        this.listFilter.find((fil, filterIdx) => {
                            if (
                                fil.uniqueId ==
                                this.applyingFilter[this.activeTabId]
                            ) {
                                applyingFilterIdx = filterIdx;
                                filter = fil;
                                return (
                                    fil.uniqueId ==
                                    this.applyingFilter[this.activeTabId]
                                );
                            }
                        });
                        if (filter) {
                            this.$emit('dashboard-set-value-filter', filter);
                            for (let fil in filter.detail) {
                                if (!Array.isArray(filter.detail[fil])) {
                                    filter.detail[fil] = this.translateKeywords(
                                        fil,
                                        filter.detail[fil]
                                    );
                                }
                                setTimeout(() => {
                                    this.$evtBus.$emit(
                                        'dashboard-set-value-filter',
                                        filter.detail[fil],
                                        fil
                                    );
                                });
                            }
                        }
                        this.$evtBus.$emit(
                            'dashboard-change-selected-filter',
                            this.instanceKey,
                            applyingFilterIdx
                        );
                    } else {
                        this.$evtBus.$emit(
                            'dashboard-change-selected-filter',
                            this.instanceKey,
                            -1
                        );
                    }
                }
            }
        },
        clearAllConfigFilter() {
            for (let fil in this.filter) {
                this.$evtBus.$emit('dashboard-set-value-filter', [], fil);
            }
            let allCell =
                this.thisDashboardData.dashboardConfigs.allCellConfigs;
            let currentLayout = this.currentLayout;
            let cellNeedRefresh = {};
            currentLayout.map((cellInfo) => {
                let cell = allCell[cellInfo.cellId];
                if (
                    cell.sharedConfigs.filter != {} ||
                    cell.sharedConfigs.selfFilter.cols != {}
                ) {
                    cellNeedRefresh[cellInfo.cellId] = true;
                }
            });
            this.$emit('clear-all-config-filter');
            return cellNeedRefresh;
        },
        applyFilter(filterIdx) {
            this.filterKeywords = {};
            setTimeout(() => {
                this.$evtBus.$emit(
                    'dashboard-change-selected-filter',
                    this.instanceKey,
                    filterIdx
                );
            }, 500);
            let cellNeedRefresh = this.clearAllConfigFilter();
            let filter = cloneDeep(this.listFilter[filterIdx]);
            for (let fil in filter.detail) {
                if (!Array.isArray(filter.detail[fil])) {
                    filter.detail[fil] = this.translateKeywords(
                        fil,
                        filter.detail[fil]
                    );
                }
            }
            this.$emit('apply-filter', filter, cellNeedRefresh);
            this.applyingFilter[this.activeTabId] =
                this.listFilter[filterIdx].uniqueId;
        },
        translateKeywords(cellId, keyword) {
            let filter = [];
            let range = this.keywords[keyword]();
            let cell =
                this.thisDashboardData.dashboardConfigs.allCellConfigs[cellId];
            let column = cell.rawConfigs.setting.value.selectedColums[0];
            for (let point in range) {
                filter.push({
                    agg: column.agg,
                    as: column.as,
                    dataset: column.dataset,
                    name: column.name,
                    type: 'date',
                    validValue: true,
                    cond: {
                        type:
                            point == 'start'
                                ? 'greaterthanorequal'
                                : 'lessthanorequal',
                        val: range[point].toISOString().split('T')[0]
                    }
                });
            }
            return filter;
        }
    }
};
</script>

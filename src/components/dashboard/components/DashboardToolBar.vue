<template>
    <div
        class="border-bottom-1 pl-2 py-1 position-relative d-flex justify-space-between"
    >
        <div style="line-height: 30px" class="ml-8">
            <i
                style="position: absolute; left: 18px; top: 4px"
                :class="{
                    'mdi fs-18': true,
                    'mdi-view-dashboard-outline': action == 'view',
                    'mdi-pencil': action != 'view'
                }"
            >
            </i>
            <input
                :style="{
                    width: inputWidth
                }"
                type="text"
                :title="$t('v2.dashboard.editName')"
                v-model="dashboardInfo.dashboardName"
                v-if="!isView"
                class="symper-dashboard-title px-1"
            />
            <span
                ref="fakeTitle"
                class="symper-dashboard-title px-1"
                :style="{
                    position: isView ? 'relative' : 'absolute',
                    top: isView ? '0px' : '-99999px',
                    left: isView ? '0px' : '-99999px'
                }"
                v-html="dashboardInfo.dashboardName"
            >
            </span>
        </div>

        <div class="px-2" style="line-height: 30px">
            <v-btn
                :disabled="!haveInitFilter"
                style="margin-right: 14px"
                class="v-btn v-btn--depressed theme--light v-size--small get-data-button"
                @click="
                    () => {
                        $evtBus.$emit('dashboard-get-data', instanceKey);
                    }
                "
            >
                {{ $t('v2.dashboard.get_data') }}
            </v-btn>
            <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-bind="attrs"
                        v-on="on"
                        depressed
                        small
                        class="filter-button"
                        :style="{
                            width: applyingFilter != -1 ? 'auto' : '28px',
                            padding: '0 5px',
                            'border-radius':
                                applyingFilter == -1 ? '50%' : '3px'
                        }"
                        :class="{
                            'filter-button-on-apply-filter':
                                applyingFilter != -1
                        }"
                        style="
                            background: none;
                            padding: 0;
                            min-width: 11.25px !important;
                        "
                        @click="handleClickFilterItem"
                    >
                        <v-icon
                            dark
                            class="mr-0 fs-18 filter-button"
                            style="font-size: 16px !important"
                            v-if="applyingFilter == -1"
                            :style="{
                                color: isApplyFilter
                                    ? '#5F5F5F !important'
                                    : 'black'
                            }"
                            >mdi-filter-variant</v-icon
                        >
                        <span
                            class="filter-button"
                            style="color: #ff8c00 !important"
                            >{{
                                applyingFilterName.length < 35
                                    ? applyingFilterName
                                    : applyingFilterName.slice(0, 35) + '...'
                            }}</span
                        >
                        <div
                            v-if="isApplyFilter"
                            style="
                                margin-left: 6px;
                                border-right: 1px solid #e0e0e0;
                                height: 27px;
                            "
                        ></div>
                        <v-icon
                            v-if="isApplyFilter"
                            class="ml-2"
                            style="font-size: 15px; background: none !important"
                            @click="clearCustomFilter()"
                            >mdi-close</v-icon
                        >
                    </v-btn>
                </template>
                <span
                    >{{ $t('common.filter') }}
                    {{ $t('apps.listType.dashboard') }}</span
                >
            </v-tooltip>
            <div
                class="border-right-1 px-2 mr-1"
                style="width: fit-content; display: inline-block"
            >
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            icon
                            small
                            v-bind="attrs"
                            v-on="on"
                            @click="refreshAllReports"
                        >
                            <i class="mdi mdi-refresh fs-16"></i>
                        </v-btn>
                    </template>
                    <span
                        >{{ $t('common.refresh') }}
                        {{ $t('apps.listType.dashboard') }}</span
                    >
                </v-tooltip>

                <v-menu bottom offset-y v-model="showDashboardInfo">
                    <template #activator="{ on: onMenu }">
                        <v-tooltip top>
                            <template #activator="{ on: onTooltip }">
                                <v-btn
                                    icon
                                    v-on="{ ...onMenu, ...onTooltip }"
                                    small
                                >
                                    <i
                                        class="mdi mdi-information-outline fs-16"
                                    ></i>
                                </v-btn>
                            </template>
                            <span
                                >{{ $t('common.info') }}
                                {{ $t('apps.listType.dashboard') }}</span
                            >
                        </v-tooltip>
                    </template>
                    <div class="pa-3 bg-white">
                        <div class="mb-2">
                            <h3>
                                <i
                                    class="fs-16 mr-1 mdi mdi-information-outline"
                                ></i>
                                {{ $t('common.info') }}
                                {{ $t('apps.listType.dashboard') }}
                            </h3>
                        </div>
                        <div class="fs-13 b-2">
                            <span
                                >{{ $t('bi.dashboard.lastDataUpdated') }} :
                            </span>
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <span
                                        :data-show-dashboard-info="
                                            showDashboardInfo
                                        "
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        {{
                                            $moment(lastDataUpdatedTime)
                                                .locale($i18n.locale)
                                                .fromNow()
                                        }}
                                    </span>
                                </template>
                                <span>{{ lastDataUpdatedTime }}</span>
                            </v-tooltip>
                        </div>
                    </div>
                </v-menu>
            </div>

            <v-tooltip top v-if="dashboardInfo.isMobileLayout">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        class="mr-2"
                        @click="handleChangeMobileLayoutDirection"
                        v-bind="attrs"
                        v-on="on"
                        icon
                    >
                        <v-icon small>
                            {{
                                dashboardInfo.mobileLayoutDirection ==
                                'vertical'
                                    ? 'mdi-phone-rotate-landscape'
                                    : 'mdi-phone-rotate-portrait'
                            }}
                        </v-icon>
                    </v-btn>
                </template>
                <span>{{
                    dashboardInfo.mobileLayoutDirection == 'vertical'
                        ? $t('v2.dashboard.horizontalRotation')
                        : $t('v2.dashboard.verticalRotation')
                }}</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-if="!isView"
                        class="mr-2"
                        @click="handleSwitchMobileLayout"
                        v-bind="attrs"
                        v-on="on"
                        icon
                    >
                        <v-icon small>
                            {{
                                dashboardInfo.isMobileLayout
                                    ? 'mdi-laptop'
                                    : 'mdi-cellphone-cog'
                            }}
                        </v-icon>
                    </v-btn>
                </template>
                <span>{{
                    dashboardInfo.isMobileLayout
                        ? $t('v2.dashboard.layoutOnWeb')
                        : $t('v2.dashboard.layoutOnMobile')
                }}</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-if="!isView"
                        class="mr-2"
                        @click="handleLockWorkspace"
                        v-bind="attrs"
                        v-on="on"
                        icon
                    >
                        <v-icon
                            small
                            :color="
                                dashboardInfo.lockWorkspace
                                    ? 'orange lighten-1'
                                    : ''
                            "
                        >
                            {{
                                dashboardInfo.lockWorkspace
                                    ? 'mdi-lock-outline'
                                    : 'mdi-lock-open-outline'
                            }}
                        </v-icon>
                    </v-btn>
                </template>
                <span>{{
                    dashboardInfo.lockWorkspace
                        ? $t('v2.dashboard.openInteraction')
                        : $t('v2.dashboard.closeInteraction')
                }}</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        class="mr-2"
                        v-if="action != 'view'"
                        depressed
                        icon
                        v-bind="attrs"
                        v-on="on"
                        @click="toggleShowOnHomePage"
                    >
                        <v-icon
                            size="17"
                            :color="
                                dashboardInfo.showOnHomePage ? 'orange' : 'grey'
                            "
                            dark
                            >mdi-text-box-check</v-icon
                        >
                    </v-btn>
                </template>
                <span>{{ $t('bi.dashboard.showOnHomePage') }}</span>
            </v-tooltip>

            <div
                style="background-color: #efefef; border-radius: 4px"
                v-if="
                    action != 'view' && lockInfo && lockInfo.status == 'locked'
                "
                class="d-inline-block px-3"
            >
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div v-bind="attrs" v-on="on">
                            <span>{{ lockInfo.info.lockedBy }}</span>
                            <i
                                small
                                dark
                                class="ml-2 mdi mdi-cloud-lock-outline fs-13"
                            ></i>
                        </div>
                    </template>
                    <span
                        >BA {{ lockInfo.info.lockedBy }}
                        {{ $t('common.edditing') }}</span
                    >
                </v-tooltip>
            </div>

            <v-btn
                v-else-if="action != 'view'"
                depressed
                small
                color="primary"
                :loading="loadingSaveBtn"
                @click="saveDashboard"
            >
                <v-icon small dark class="mr-2">mdi-content-save</v-icon>
                <span>{{ $t('common.save') }}</span>
            </v-btn>
        </div>
        <config-filter
            class="list-filter"
            @mouseleave="showListFilter"
            :defaultApplyedFilterId="defaultApplyedFilterId"
            :action="action"
            v-if="isShowListFilter"
            @config-filter-action="configFilterAction"
            @add-filter-config="addFilterConfig"
            @select-filter="selectFilter"
            :filter="listFilter"
        />
    </div>
</template>

<script>
import { dashboardApi } from '@/api/dashboard.js';
import ConfigFilter from '@/components/common/ListItemConfigFilter';
export default {
    components: {
        'config-filter': ConfigFilter
    },
    watch: {
        'dashboardInfo.dashboardName': function () {
            setTimeout(
                (self) => {
                    self.inputWidth =
                        self.$refs.fakeTitle.getBoundingClientRect().width +
                        10 +
                        'px';
                },
                50,
                this
            );
        }
    },
    methods: {
        //khi chọn 1 filter
        selectFilter(idx) {
            this.$evtBus.$emit(
                'dashboard-toolBar-select-filter',
                this.instanceKey,
                idx
            );
            this.showListFilter();
        },
        // khi ấn 'thêm mới' xóa filter hiện tại và mở addFilter
        addFilterConfig() {
            this.clearCustomFilter();
            this.addFilter();
        },
        //xóa customfilter hiện tại
        clearCustomFilter() {
            this.$evtBus.$emit(
                'dashboard-toolBar-clear-applying-filter',
                this.instanceKey
            );
            this.applyingFilter = -1;
            this.applyingFilterName = '';
        },
        //các action bao gồm edit, delete, setDefault, unSetDefault
        configFilterAction(data) {
            data.instanceKey = this.instanceKey;
            this.$evtBus.$emit('dashboard-config-filter-action', data);
        },
        // khi click vào icon filter, nếu có listFilter thì show ra, nếu không thì mở addFilter
        handleClickFilterItem() {
            if (this.listFilter.length > 0) {
                this.showListFilter();
            } else {
                this.addFilter();
            }
        },
        //mở addFilter
        addFilter() {
            this.$evtBus.$emit(
                'dashboard-toolBar-show-add-filter',
                this.instanceKey
            );
        },
        //mở listFilter
        showListFilter() {
            this.isShowListFilter = !this.isShowListFilter;
        },
        toggleShowOnHomePage() {
            this.dashboardInfo.showOnHomePage = this.dashboardInfo
                .showOnHomePage
                ? 0
                : 1;
        },
        refreshAllReports() {
            this.$emit('refresh-all-reports');
        },
        getCellSettingAndStyleToSave(cellConfigs) {
            if (typeof cellConfigs.getConfigToSave == 'function') {
                return cellConfigs.getConfigToSave();
            }

            let cell = cellConfigs.rawConfigs;
            let cellSettings = {};
            for (let name in cell.setting) {
                cellSettings[name] = cell.setting[name].selectedColums;
                for (let col of cellSettings[name]) {
                    if (col.menuOptions) {
                        col.menuOptionsValue = {};
                        for (let key in col.menuOptions) {
                            col.menuOptionsValue[key] =
                                col.menuOptions[key].value;
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
                        value: attr.children[itemName].value
                    };
                }
            }
            let extraConfig = {};
            if (cell.extra) {
                extraConfig = cellConfigs.getExtraDataToSave();
            }
            this.addMoreExtraConfig(extraConfig, cell);
            return {
                settings: cellSettings,
                style: cellStyle,
                extra: extraConfig
            };
        },
        addMoreExtraConfig(extraConfig, cell) {
            extraConfig.sortOnQuery =
                cell.sortOnQuery.sortOnQuery.selectedColums;
        },
        getDashboardConfigs() {
            // lưu lại các dataset liên quan tới dashboard này
            let dashboardConfigs = this.dashboardConfigs;
            let layout = {},
                cells = {};

            for (let tabKey in dashboardConfigs.info.layout) {
                let tabLayout = dashboardConfigs.info.layout[tabKey];
                layout[tabKey] = {};
                for (let item of tabLayout) {
                    let cellId = item.cellId;
                    layout[tabKey][cellId] = {
                        x: item.x,
                        y: item.y,
                        h: item.h,
                        w: item.w
                    };
                    let cellConfigs = dashboardConfigs.allCellConfigs[cellId];
                    let cell = cellConfigs.rawConfigs;
                    let settingAndStyle =
                        this.getCellSettingAndStyleToSave(cellConfigs);
                    // xét riêng trường hợp cho editor
                    if (cellConfigs.sharedConfigs.type == 'editor') {
                        settingAndStyle.settings = {
                            content:
                                cellConfigs.viewConfigs.displayOptions.content
                        };
                    }

                    cells[cellId] = {
                        settings: settingAndStyle.settings,
                        style: settingAndStyle.style,
                        extra: settingAndStyle.extra,
                        format: {},
                        condition: cell.condition,
                        type: cellConfigs.sharedConfigs.type,
                        columnAndDtsInside:
                            cellConfigs.viewConfigs.selectedDataset
                    };
                }
            }

            let globalSetting = this.getCellSettingAndStyleToSave(
                this.dashboardConfigs.allCellConfigs.global
            );
            cells['global'] = {
                settings: globalSetting.settings,
                style: globalSetting.style,
                format: {},
                condition: [],
                type: 'global',
                columnAndDtsInside: {}
            };
            return {
                cells: cells,
                layout: layout,
                mobileLayout: dashboardConfigs.info.mobileLayout,
                tabsAndPages: dashboardConfigs.info.tabsAndPages,
                drillThrough: dashboardConfigs.info.drillThrough,
                showOnHomePage: dashboardConfigs.info.showOnHomePage
            };
        },
        getAddedMeasure() {
            let rsl = {};
            let addedMeasures = this.dashboardConfigs.info.addedMeasures
                ? this.dashboardConfigs.info.addedMeasures
                : {};
            if (Array.isArray(addedMeasures)) {
                rsl = addedMeasures.reduce((map, item, index) => {
                    if (item && typeof item == 'object') {
                        map[index] = item;
                    }
                    return map;
                }, {});
            } else {
                rsl = addedMeasures;
            }
            return rsl;
        },

        async saveDashboard() {
            let idDashboard = 0;
            let action = this.action;
            if (this.action == 'edit') {
                idDashboard = this.idDashboard;
            }

            let dashboardInfo = this.dashboardInfo;
            let dashboardConfig = this.getDashboardConfigs();
            let addedMeasures = this.getAddedMeasure();
            let data = {
                name: dashboardInfo.dashboardName,
                cells: dashboardConfig.cells,
                tabsAndPages: dashboardConfig.tabsAndPages,
                drillThrough: dashboardConfig.drillThrough,
                layout: dashboardConfig.layout,
                extra: {
                    relateDatasets: dashboardInfo.datasets,
                    relations: dashboardInfo.relations,
                    addedMeasures: JSON.stringify(addedMeasures),
                    mobileLayout: dashboardConfig.mobileLayout
                },
                action: action,
                id_folder: this.$route.params.idnode,
                id_dashboard: idDashboard,
                showOnHomePage: dashboardConfig.showOnHomePage
            };
            if (this.$route.name == 'editDashboardInClickhouseMode') {
                data.experimentalMode = 'clickhouse';
            }
            let res = {};
            if (action == 'edit') {
                this.loadingSaveBtn = true;
                res = await dashboardApi.updateDashboard(idDashboard, data);
            } else if (action == 'clone' || action == 'create') {
                this.loadingSaveBtn = true;
                res = await dashboardApi.createDashboard(data);
            }

            if (res.status == 200) {
                this.$snotifySuccess(
                    this.$t('v2.dashboard.saveDashboardSuccess')
                );
                if (action == 'clone' || action == 'create') {
                    this.loadingSaveBtn = false;
                    this.$router.push(`/dashboards/${res.data.id}/edit`);
                }
                if (action == 'edit') {
                    this.loadingSaveBtn = false;
                }
            } else {
                this.$snotifyError(
                    res,
                    this.$t('v2.dashboard.saveDashboardFail')
                );
            }
        },
        handleLockWorkspace() {
            this.dashboardInfo.lockWorkspace =
                !this.dashboardInfo.lockWorkspace;
        },
        handleSwitchMobileLayout() {
            this.$store.commit('dashboard/toggleMobileLayout', {
                instanceKey: this.instanceKey
            });
        },
        handleChangeMobileLayoutDirection() {
            let self = this;
            setTimeout(() => {
                self.dashboardInfo.mobileLayoutDirection =
                    this.dashboardInfo.mobileLayoutDirection == 'vertical'
                        ? 'horizontal'
                        : 'vertical';
            }, 300);
        }
    },
    computed: {
        //check xem có đang apply cái filter nào không
        isApplyFilter() {
            if (this.applyingFilter != -1) {
                return true;
            }
            return false;
        },
        //dashboard này có bộ lọc khởi tạo hay không
        haveInitFilter() {
            let activeTabIndex = this.dashboardInfo.activeTabIndex;
            return this.dashboardInfo.tabsAndPages.tabs[activeTabIndex]
                .initFilter;
        },
        lastDataUpdatedTime() {
            let time = '';
            let allDts =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .allDatasetColumns;
            for (let key in allDts) {
                let item = allDts[key];
                if (item.refresh_at && item.refresh_at > time) {
                    time = item.refresh_at;
                }
            }
            return time;
        },
        dashboardInfo() {
            if (this.instanceKey) {
                return this.$store.state.dashboard.allDashboard[
                    this.instanceKey
                ].dashboardConfigs.info;
            }
        },
        dashboardConfigs() {
            if (this.instanceKey) {
                return this.$store.state.dashboard.allDashboard[
                    this.instanceKey
                ].dashboardConfigs;
            }
        },
        isView() {
            return this.action == 'view';
        }
    },
    props: {
        instanceKey: {
            default: ''
        },
        action: {
            default: 'view'
        },
        idDashboard: {
            default: 0
        },
        lockInfo: {
            default() {
                return {
                    status: 'free'
                };
            }
        }
    },
    data() {
        return {
            defaultApplyedFilterId: '',
            listFilter: [],
            inputWidth: '150px',
            loadingSaveBtn: false,
            showDashboardInfo: false,
            isShowListFilter: false,
            applyingFilterName: '',
            applyingFilter: -1
        };
    },
    created() {
        if (this.isApplyFilter) {
            this.applyingFilterName = this.listFilter[this.applyingFilter].name;
        }
        let self = this;
        this.$evtBus.$on('lock-workspace', () => {
            self.dashboardInfo.lockWorkspace = true;
        });
        this.$evtBus.$on('unlock-workspace', () => {
            self.dashboardInfo.lockWorkspace = false;
        });
        //đóng add-filter khi click ra ngoài
        this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
            if ($(evt.target).hasClass('filter-button')) {
                return;
            }
            if (this.isShowListFilter == true) {
                this.showListFilter();
            }
        });
        this.$evtBus.$on('dashboard-edit-filter', (instanceKey) => {
            if (instanceKey == this.instanceKey) {
                if (this.isApplyFilter) {
                    this.applyingFilterName =
                        this.listFilter[this.applyingFilter].name;
                } else {
                    this.applyingFilterName = '';
                }
            }
        });
        this.$evtBus.$on(
            'dashboard-change-list-filter',
            (instanceKey, listFilter) => {
                if (instanceKey == this.instanceKey) {
                    this.listFilter = listFilter;
                }
            }
        );
        // khi apply 1 filter, từ workspace
        this.$evtBus.$on(
            'dashboard-change-selected-filter',
            (instanceKey, filterIdx) => {
                if (instanceKey == this.instanceKey) {
                    this.applyingFilter = filterIdx;
                    if (this.applyingFilter == -1) {
                        this.applyingFilterName = '';
                        return;
                    }
                    this.applyingFilterName =
                        this.listFilter[this.applyingFilter].name;
                }
            }
        );
        //khi xóa 1 filter
        this.$evtBus.$on(
            'dashboard-delete-filter',
            (instanceKey, filterIdx) => {
                if (instanceKey == this.instanceKey)
                    if (filterIdx == this.applyingFilter) {
                        this.applyingFilter = -1;
                        this.applyingFilterName = '';
                    } else {
                    }
            }
        );
        this.$evtBus.$on('dashboard-save-dashboard-config', (instanceKey) => {
            if (this.instanceKey == instanceKey) {
                this.saveDashboard();
            }
        });
        //thay đổi defaultFilter
        this.$evtBus.$on(
            'dashboard-change-default-applyed-filterId',
            (instanceKey, uniqueId) => {
                if (this.instanceKey == instanceKey) {
                    this.defaultApplyedFilterId = uniqueId;
                }
            }
        );
        this.$evtBus.$on(
            'dashboard-change-selected-filter',
            (instanceKey, filterIdx) => {
                if (instanceKey == this.instanceKey) {
                    this.applyingFilter = filterIdx;
                    if (this.applyingFilter == -1) {
                        this.applyingFilterName = '';
                        return;
                    }
                    this.applyingFilterName =
                        this.listFilter[this.applyingFilter].name;
                }
            }
        );
    }
};
</script>

<style>
.symper-dashboard-title {
    font-size: 16px;
    font-weight: 500;
    border: 1px solid white;
    white-space: nowrap;
    min-width: 150px;
    max-width: 600px;
}

input.symper-dashboard-title:hover {
    border: 1px solid rgb(224, 224, 224);
}

input.symper-dashboard-title:focus {
    border: 1px solid #f58634;
}
.get-data-button {
    background: #61c454 !important;
    border-radius: 4px;
    width: 83px !important;
    height: 28px !important;
}
.get-data-button:hover {
    background: #62ad58 !important;
}
.get-data-button span {
    font-size: 12px !important;
    color: white;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 500;
    line-height: 14px;
}
.is-open-add-filter {
    background: #d9d9d9;
}
.list-filter {
    top: 42px;
    z-index: 9;
    display: block;
    width: fit-content;
    block-size: fit-content;
    position: absolute;
    right: 190px;
    box-shadow: 0px 5px 5px -3px rgb(0, 0, 0, 0.2),
        0px 8px 10px 1px rgb(0, 0, 0, 0.14), 0px 3px 14px 2px rgb(0, 0, 0, 0.12) !important;
}
.filter-button-on-apply-filter {
    background: #f2f2f2 !important;
}
.filter-button-on-apply-filter:hover {
    background: none !important;
}
</style>

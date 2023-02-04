<template>
    <div
        class="listitem-filter-container"
        :style="{
            position: 'absolute',
            top: 0,
            left: 'auto',
            right: tableDisplayConfig.show ? tableDisplayConfig.width + 'px' : 0
        }"
    >
        <div>
            <div class="header-listitem-filter-container">
                <tab-view
                    ref="tab-view"
                    :listTabsView="listTabsView"
                    @change-tab-view="changeTabView"
                    class="sidebar-config-filter"
                />
                <v-icon
                    @click="closeConfigFilter"
                    style="
                        font-size: 20px;
                        border-radius: 5px;
                        height: 24px;
                        width: 24px;
                    "
                >
                    mdi mdi-close
                </v-icon>
            </div>

            <div v-show="columnFilter">
                <div class="config-filter">
                    <div class="header-config-filter">
                        <span style="line-weight=500">{{
                            $t('v2.showlist.configFilter')
                        }}</span>
                        <v-tooltip bottom z-index="200">
                            <template v-slot:activator="{ on: tooltip }">
                                <v-icon
                                    @click="clearDataFilter"
                                    v-on="{ ...tooltip }"
                                    class="fs-15 icon reload"
                                    small
                                    >mdi-reload</v-icon
                                >
                            </template>
                            <span>{{ $t('v2.showlist.resetFilter') }}</span>
                        </v-tooltip>
                    </div>
                    <div>
                        <div class="name-input-config-filter">
                            <p
                                style="
                                    font-size: 13px;
                                    display: flex;
                                    justify-content: space-between;
                                "
                            >
                                {{ $t('common.sidebar.filter-name')
                                }}<span
                                    v-if="
                                        customFilter.filterName.trim() != '' &&
                                        !canAddFilter &&
                                        !isViewDetailFilter
                                    "
                                    style="color: red; font-size: 0.7rem"
                                >
                                    *{{ $t('common.filter-name-exists') }}
                                </span>
                            </p>
                            <v-text-field
                                v-model="customFilter.filterName"
                                outlined
                                :disabled="isViewDetailFilter"
                                dense
                                :label="$t('v2.showlist.search')"
                                :placeholder="$t('v2.showlist.enterFilterName')"
                                class="d-inline-block sym-small-size"
                                single-line
                                :hint="
                                    $t('v2.showlist.thisFieldUsesCounterProp')
                                "
                                autocomplete="off"
                            ></v-text-field>
                        </div>
                        <div class="name-input-config-filter">
                            <p
                                style="
                                    font-size: 13px;
                                    margin-bottom: 2px !important;
                                "
                            >
                                {{ $t('v2.showlist.configFilter') }}
                            </p>
                        </div>
                    </div>
                    <div class="body-section report-self-filter">
                        <ReportSelfFilter
                            :instanceKey="instanceKey"
                            :isViewDetailFilter="isViewDetailFilter"
                            ref="report-self-filter"
                            :hideOptions="true"
                            :report="report"
                            :idDoc="idDoc"
                            @apply-self-filter="applySelfFilter"
                        />
                    </div>
                </div>
            </div>
            <div v-show="!columnFilter" class="config-list-filter">
                <p style="font-size: 13px">
                    {{ $t('v2.showlist.myFilter') }}
                </p>
                <v-list-item
                    dense
                    class="filter-menu cursor-pointer fs-13 px-0"
                    v-for="(item, key) in listFilters"
                    :key="item.uniqueId"
                >
                    <template v-slot:default="{ active }">
                        <v-list-item-action>
                            <v-checkbox
                                v-model="
                                    customFilter.applyedFilter.userFilter[key]
                                "
                                :input-value="active"
                                style="padding: 0px"
                            ></v-checkbox>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title
                                class="col-md-10 fw-400"
                                style="my-auto"
                            >
                                <span class="ml-2 filter-menu__item">{{
                                    item.name
                                }}</span>

                                <v-icon
                                    v-if="
                                        defaultApplyedFilter.userFilter.includes(
                                            item.uniqueId
                                        )
                                    "
                                    style="
                                        font-size: 15px;
                                        color: #fb7e00;
                                        margin-left: 5px;
                                    "
                                    class="mdi mdi-brightness-auto"
                                ></v-icon>
                            </v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-icon class="show-icon">
                            <v-menu offset-y nudge-left="310">
                                <template v-slot:activator="{ on: config }">
                                    <v-tooltip bottom z-index="200">
                                        <template
                                            v-slot:activator="{ on: tooltip }"
                                        >
                                            <v-btn
                                                class="filter-action-btn"
                                                style="
                                                    background: none !important;
                                                "
                                            >
                                                <i
                                                    v-on="{
                                                        ...config,
                                                        ...tooltip
                                                    }"
                                                    class="mdi mdi-cog-outline config-filter-icon"
                                                ></i>
                                            </v-btn>
                                        </template>
                                        <span>{{
                                            $t('v2.showlist.setting')
                                        }}</span>
                                    </v-tooltip>
                                </template>
                                <v-list dense>
                                    <v-list-item
                                        class="action-filter"
                                        @click="
                                            selectActionFilter(0, key, true)
                                        "
                                    >
                                        <span class="fs-13">{{
                                            $t('v2.showlist.update')
                                        }}</span>
                                    </v-list-item>
                                    <v-list-item
                                        v-if="
                                            !defaultApplyedFilter.userFilter.includes(
                                                item.uniqueId
                                            )
                                        "
                                        class="action-filter"
                                        @click="
                                            selectActionFilter(2, key, true)
                                        "
                                    >
                                        <v-icon
                                            style="font-size: 14px !important"
                                            >mdi-check-box-multiple-outline</v-icon
                                        >
                                        <span class="fs-13">
                                            {{ $t('table.filter.Default') }}
                                        </span>
                                    </v-list-item>
                                    <v-list-item
                                        v-else
                                        class="action-filter"
                                        @click="
                                            selectActionFilter(3, key, true)
                                        "
                                    >
                                        <v-icon
                                            style="font-size: 14px !important"
                                            >mdi-check-box-multiple-outline</v-icon
                                        >
                                        <span class="fs-13">
                                            {{
                                                $t(
                                                    'table.filter.Delete Default'
                                                )
                                            }}
                                        </span>
                                    </v-list-item>

                                    <v-list-item
                                        v-if="shareFilterPermission"
                                        v-show="!item.isShare"
                                        class="action-filter"
                                        @click="
                                            selectActionFilter(4, key, true)
                                        "
                                    >
                                        <v-icon
                                            style="font-size: 14px !important"
                                            >mdi-check-box-multiple-outline</v-icon
                                        >
                                        <span class="fs-13">
                                            {{ $t('table.filter.Share') }}
                                        </span>
                                    </v-list-item>
                                    <v-list-item
                                        v-if="shareFilterPermission"
                                        v-show="item.isShare"
                                        class="action-filter"
                                        @click="
                                            selectActionFilter(5, key, true)
                                        "
                                    >
                                        <v-icon
                                            style="font-size: 14px !important"
                                            >mdi-check-box-multiple-outline</v-icon
                                        >
                                        <span class="fs-13">
                                            {{
                                                $t('table.filter.Delete Share')
                                            }}
                                        </span>
                                    </v-list-item>
                                    <v-list-item
                                        class="action-filter"
                                        @click="
                                            selectActionFilter(1, key, true)
                                        "
                                    >
                                        <span class="fs-13">
                                            {{ $t('v2.showlist.delete') }}
                                        </span>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-list-item-icon>
                    </template>
                </v-list-item>
                <p style="font-size: 13px">
                    {{ $t('v2.showlist.sharedFilter') }}
                </p>
                <v-list-item
                    dense
                    class="filter-menu cursor-pointer fs-13 px-0"
                    v-for="(item, key) in listSharedFilter"
                    :key="item.uniqueId"
                >
                    <template v-slot:default="{ active }">
                        <v-list-item-action>
                            <v-checkbox
                                v-model="
                                    customFilter.applyedFilter.sharedFilter[key]
                                "
                                :input-value="active"
                            ></v-checkbox>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title
                                class="col-md-10 fw-400"
                                style="my-auto"
                            >
                                <span class="ml-2 filter-menu__item">{{
                                    item.name
                                }}</span>
                                <v-icon
                                    v-if="
                                        defaultApplyedFilter.sharedFilter.includes(
                                            item.uniqueId
                                        )
                                    "
                                    style="
                                        font-size: 15px;
                                        color: #fb7e00;
                                        margin-left: 5px;
                                    "
                                    class="mdi mdi-brightness-auto"
                                ></v-icon>
                            </v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-icon class="show-icon">
                            <v-menu
                                offset-y
                                nudge-left="310"
                                style="
                                    left: auto !important;
                                    right: 20px !important;
                                "
                            >
                                <template v-slot:activator="{ on: config }">
                                    <v-tooltip bottom z-index="200">
                                        <template
                                            v-slot:activator="{ on: tooltip }"
                                        >
                                            <v-btn
                                                class="filter-action-btn"
                                                style="
                                                    background: none !important;
                                                "
                                            >
                                                <i
                                                    v-on="{
                                                        ...config,
                                                        ...tooltip
                                                    }"
                                                    class="mdi mdi-cog-outline config-filter-icon"
                                                ></i>
                                            </v-btn>
                                        </template>
                                        <span>{{
                                            $t('v2.showlist.setting')
                                        }}</span>
                                    </v-tooltip>
                                </template>
                                <v-list
                                    dense
                                    class="cofig-action-filter"
                                    style="
                                        left: auto !important;
                                        right: 20px !important;
                                    "
                                >
                                    <v-list-item
                                        v-if="
                                            !defaultApplyedFilter.sharedFilter.includes(
                                                item.uniqueId
                                            )
                                        "
                                        class="action-filter"
                                        @click="selectActionFilter(2, key)"
                                    >
                                        <v-icon
                                            style="font-size: 14px !important"
                                            >mdi-check-box-multiple-outline</v-icon
                                        >
                                        <span class="fs-13">
                                            {{ $t('table.filter.Default') }}
                                        </span>
                                    </v-list-item>
                                    <v-list-item
                                        v-else
                                        class="action-filter"
                                        @click="selectActionFilter(3, key)"
                                    >
                                        <v-icon
                                            style="font-size: 14px !important"
                                            >mdi-check-box-multiple-outline</v-icon
                                        >
                                        <span class="fs-13">
                                            {{
                                                $t(
                                                    'table.filter.Delete Default'
                                                )
                                            }}
                                        </span>
                                    </v-list-item>
                                    <v-list-item
                                        class="action-filter"
                                        @click="selectActionFilter(6, key)"
                                    >
                                        <v-icon
                                            style="font-size: 14px !important"
                                            >mdi-check-box-multiple-outline</v-icon
                                        >
                                        <span class="fs-13">
                                            {{ $t('table.filter.Detail') }}
                                        </span>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-list-item-icon>
                    </template>
                </v-list-item>
            </div>
        </div>
        <div class="footer-listitem-filter-container" v-if="!columnFilter">
            <v-btn
                class="apply-add-button"
                style="background: #fb7e00"
                @click="
                    () => {
                        this.$refs['tab-view'].changeTabView(0);
                    }
                "
                >{{ $t('v2.showlist.addFilter') }}</v-btn
            >
            <v-btn
                @click="applyFilter"
                style="background: #61c454"
                class="apply-button"
                >{{ $t('v2.showlist.apply') }}</v-btn
            >
        </div>
        <div v-else class="footer-listitem-filter-container">
            <v-btn
                class="apply-add-button"
                :disabled="!canAddFilter"
                @click="addFilter"
                style="background: #fb7e00"
                >{{ $t('v2.showlist.saveFilter') }}</v-btn
            >
            <v-btn
                @click="applyFastFilter"
                style="background: #61c454"
                class="apply-button"
                >{{ $t('v2.showlist.quickApply') }}</v-btn
            >
        </div>
    </div>
</template>
<script>
import TabView from './TabView.vue';
import TableFilter from '@/components/common/customTable/TableFilter.vue';
import SearchBox from '@/components/common/SearchBox.vue';
import ReportSelfFilter from '../dashboard/components/ReportSelfFilter';
import { util } from '@/plugins/util';
import cloneDeep from 'lodash/cloneDeep';
export default {
    name: 'ListItemConfigFilterSideBar',
    components: {
        TableFilter,
        ReportSelfFilter,
        'tab-view': TabView,
        SearchBox
    },
    created() {
        this.$evtBus.$on(
            'showlist-filtersidebar-change-computedselffilterconfig',
            (colName, selectItems) => {
                this.report.sharedConfigs.computedSelfFilterConfig.map(
                    (col) => {
                        if (col.col.agg == colName) {
                            if (selectItems.length < 300) {
                                col.config.searchLocal = true;
                            }
                            let cloneSelectedItems = [];
                            let valuesIn = col.config.valuesIn;
                            let selectAll = col.config.selectAll;
                            if (selectAll) {
                                cloneSelectedItems = selectItems;
                            } else {
                                selectItems.map((item) => {
                                    cloneSelectedItems.push({
                                        ...item,
                                        checked: valuesIn[item.value]
                                            ? valuesIn[item.value]
                                            : false
                                    });
                                });
                            }
                            col.config.selectItems = cloneSelectedItems;
                            if (this.$refs['report-self-filter']) {
                                this.$refs[
                                    'report-self-filter'
                                ].unLoadingTableFilter(col);
                            }
                        }
                    }
                );
            }
        );
        //clone từ applyedFilter, tránh thay đổi dữ liệu của props, kích hoạt watch listItems
        this.customFilter.applyedFilter = util.cloneDeep(this.applyedFilter);
        this.createDataFilter();
    },
    watch: {
        applyedFilter: {
            deep: true,
            handler(newVal) {
                this.customFilter.applyedFilter = util.cloneDeep(newVal);
            }
        }
    },
    data() {
        return {
            actionFilter: [
                {
                    icon: 'mdi-lead-pencil',
                    content: this.$t('v2.showlist.edit')
                },
                {
                    icon: 'mdi mdi-close',
                    content: this.$t('v2.showlist.delete')
                }
            ],
            report: {},
            columnFilter: false,
            isViewDetailFilter: false,
            customFilter: {
                applyedFilter: {
                    userFilter: [],
                    sharedFilter: []
                },
                filterName: '',
                filterEditIdx: -1
            }
        };
    },
    computed: {
        defaultReportForFilter() {
            let filterConfig = {
                hasSelfFilter: true,
                rawConfigs: {
                    setting: {
                        column: {
                            selectedColums: []
                        }
                    },
                    style: {
                        title: {
                            children: {
                                titleText: {
                                    value: ''
                                }
                            }
                        }
                    }
                },
                sharedConfigs: {
                    cellId: 'allColumn',
                    data: [],
                    filter: {},
                    selfFilter: {
                        cols: {},
                        applied: false,
                        opening: []
                    },
                    searchKey: ''
                },
                viewConfigs: {
                    displayOptions: {}
                }
            };
            this.columnDefs.map((col) => {
                let isControlUser = false;
                if (col.type == 'user') {
                    isControlUser = true;
                }
                let configFilter = {
                    agg: col.field,
                    as: col.headerName,
                    name: col.field,
                    type: col.type,
                    sort: 'none',
                    desInfo: {
                        as: col.headerName,
                        des: col.headerName
                    },
                    cond: {
                        type: 'notin',
                        val: ''
                    },
                    isControlUser: isControlUser
                };
                if (
                    configFilter.type != 'text' &&
                    configFilter.type != 'date' &&
                    configFilter.type != 'number' &&
                    configFilter.type != 'datetime'
                ) {
                    configFilter.type = 'text';
                }
                filterConfig.rawConfigs.setting.column.selectedColums.push(
                    configFilter
                );
            });
            return filterConfig;
        },

        cloneApplyedFilter() {
            return util.cloneDeep(this.applyedFilter);
        },
        canAddFilter() {
            let allListFilters = util.cloneDeep(
                this.listFilters.concat(this.listSharedFilter)
            );
            // trường hợp edit bộ lọc
            if (this.customFilter.filterEditIdx != -1) {
                allListFilters.splice(this.customFilter.filterEditIdx, 1);
                return (
                    this.customFilter.filterName.trim() != '' &&
                    this.customFilter.filterName.trim().length < 60 &&
                    !allListFilters.some(
                        (fil) => fil.name == this.customFilter.filterName
                    )
                );
            } else {
                //trường hợp thêm bộ lọc
                return (
                    this.customFilter.filterName.trim() != '' &&
                    this.customFilter.filterName.trim().length < 60 &&
                    !allListFilters.some(
                        (fil) => fil.name == this.customFilter.filterName
                    )
                );
            }
        },
        allListFilters() {
            return this.listFilters.concat(this.listSharedFilter);
        },
        listTabsView() {
            let data = {
                filterColumn: {
                    title: this.$t('v2.showlist.filterData'),
                    value: this.columnFilter
                },
                listFilter: {
                    title: this.$t('v2.showlist.listFilter'),
                    value: !this.columnFilter
                }
            };
            return data;
        }
    },
    methods: {
        calculateDetailFilter(config) {
            if (!config) {
                config = { allColumns: {}, computedSelfFilterConfig: [] };
            }
            let filterConfig = {
                hasSelfFilter: true,
                rawConfigs: {
                    setting: {
                        column: {
                            selectedColums: []
                        }
                    },
                    style: {
                        title: {
                            children: {
                                titleText: {
                                    value: ''
                                }
                            }
                        }
                    }
                },
                sharedConfigs: {
                    cellId: 'allColumn',
                    computedSelfFilterConfig: [
                        ...(config.computedSelfFilterConfig
                            ? config.computedSelfFilterConfig
                            : [])
                    ],
                    data: [],
                    filter: {},
                    selfFilter: {
                        cols: { ...config.columns },
                        applied: false,
                        opening: []
                    },
                    searchKey: ''
                },
                viewConfigs: {
                    displayOptions: {}
                }
            };
            filterConfig.sharedConfigs.computedSelfFilterConfig.map(
                (fil, idx) => {
                    fil.gettingData = false;
                    if (this.userColumnControl.includes(fil.col.agg)) {
                        fil.config.isControlUser = true;
                    }
                }
            );
            this.columnDefs.map((col) => {
                let isControlUser = false;
                if (col.type == 'user') {
                    isControlUser = true;
                }
                let configFilter = {
                    agg: col.field,
                    as: col.headerName,
                    name: col.field,
                    type: col.type,
                    sort: 'none',
                    desInfo: {
                        as: col.headerName,
                        des: col.headerName
                    },
                    cond: {
                        type: 'notin',
                        val: ''
                    },
                    isControlUser: isControlUser
                };
                if (
                    configFilter.type != 'text' &&
                    configFilter.type != 'date' &&
                    configFilter.type != 'number' &&
                    configFilter.type != 'datetime'
                ) {
                    configFilter.type = 'text';
                }
                filterConfig.rawConfigs.setting.column.selectedColums.push(
                    configFilter
                );
            });
            return filterConfig;
        },
        clearDataFilter() {
            if (
                this.applyedFilter.userFilter
                    .concat(this.applyedFilter.sharedFilter)
                    .some((a) => a)
            ) {
                this.applyFilter();
            } else {
                this.report = this.defaultReportForFilter;
                this.$refs['report-self-filter'].clearFilter();
                this.customFilter.filterName = '';
                this.isViewDetailFilter = false;
            }
        },
        applySelfFilter(idColumn, needRender = true) {
            if (idColumn == this.report.sharedConfigs.cellId) {
                if (needRender == false) {
                    return;
                }
                this.$emit('apply-column-filter', this.report);
            }
        },
        //tạo ra report từ reportConfig từ store, và tạo selectedColumns từ columnDefs
        createDataFilter() {
            let report = util.cloneDeep(
                this.$store.state.document.filterConfig
            );
            let columnDefs = util.cloneDeep(this.columnDefs);
            if (columnDefs[0].field == 'checkboxColumn') {
                columnDefs.shift();
            }
            columnDefs.map((col) => {
                let isControlUser = false;
                if (col.type == 'user') {
                    isControlUser = true;
                }
                let configFilter = {
                    agg: col.field,
                    as: col.headerName,
                    name: col.field,
                    type: col.type,
                    sort: 'none',
                    desInfo: {
                        as: col.headerName,
                        des: col.headerName
                    },
                    cond: {
                        type: 'notin',
                        val: ''
                    },
                    isControlUser: isControlUser
                };
                if (
                    configFilter.type != 'text' &&
                    configFilter.type != 'date' &&
                    configFilter.type != 'number' &&
                    configFilter.type != 'datetime'
                ) {
                    configFilter.type = 'text';
                }
                report.rawConfigs.setting.column.selectedColums.push(
                    configFilter
                );
            });
            if (report.sharedConfigs.computedSelfFilterConfig) {
                report.sharedConfigs.computedSelfFilterConfig.map(
                    (fil, idx) => {
                        if (this.userColumnControl.includes(fil.col.agg)) {
                            fil.config.isControlUser = true;
                        }
                    }
                );
            }
            this.report = report;
        },
        // khi apply filter, thì sẽ hủy bỏ các action như edit, detail
        applyFilter() {
            this.$emit('apply-filter', this.customFilter.applyedFilter);
            this.customFilter.filterEditIdx = -1;
            this.customFilter.filterName = '';
            this.isViewDetailFilter = false;
        },
        applyFastFilter(needRender = true) {
            this.$refs['report-self-filter'].applyFilter(needRender);
        },
        closeConfigFilter() {
            this.$emit('close-filter-config');
        },
        changeTabView(val) {
            if (val == 0) {
                this.columnFilter = true;
            } else {
                this.columnFilter = false;
            }
        },
        // khi applyFilter, lấy id, nếu id ==-1 thì là trường hợp thêm mới, ngược lại là edit,
        addFilter() {
            let filterIdx =
                this.customFilter.filterEditIdx == -1
                    ? this.listFilters.length
                    : this.customFilter.filterEditIdx;

            this.applyFastFilter(false);
            let sharedConfigs = cloneDeep(this.report.sharedConfigs);
            sharedConfigs.computedSelfFilterConfig.map((col) => {
                col.config.fullOptions = [];
                col.config.selectItems = [];
                delete col.config.notResetFullOptions;
            });

            let data = {
                sharedConfigs: sharedConfigs,
                name: this.customFilter.filterName,
                idx: filterIdx
            };

            this.$emit('add-custom-filter', data);
            this.customFilter.filterEditIdx = -1;
            this.customFilter.filterName = '';
            this.isViewDetailFilter = false;
        },
        selectActionFilter(actionIdx, filterIdx, isUserFilter = false) {
            let data = {
                type: '',
                filterIdx: filterIdx,
                isUserFilter: isUserFilter
            };
            let self = this;
            let applyedFilter;
            switch (actionIdx) {
                case 2:
                    data.type = 'setDefaultFilter';
                    break;
                case 3:
                    data.type = 'unsetDefaultFilter';
                    break;
                case 0:
                    // trường hợp edit, áp dụng sang showlist config của filter, tính toán lại applyedFilter
                    this.isViewDetailFilter = false;
                    applyedFilter = {
                        userFilter: [],
                        sharedFilter: []
                    };
                    let filterName;
                    this.listFilters.map((fil, idx) => {
                        if (idx == filterIdx) {
                            filterName = fil.name;
                            applyedFilter.userFilter.push(true);
                            self.report = this.calculateDetailFilter(fil);
                        } else {
                            applyedFilter.userFilter.push(false);
                        }
                    });
                    this.listSharedFilter.map((fil, idx) => {
                        applyedFilter.sharedFilter.push(false);
                    });
                    this.customFilter.filterName = filterName;
                    this.customFilter.filterEditIdx = filterIdx;
                    this.$refs['tab-view'].changeTabView(0);
                    data.type = 'editFilter';
                    break;
                case 1:
                    data.type = 'deleteFilter';
                    break;
                case 4:
                    data.type = 'shareFilter';
                    break;
                case 5:
                    data.type = 'unShareFilter';
                    break;
                case 6:
                    //trường hợp xem detail, chỉ ăn config vào bên reportlistfilter để người dùng xem, chứ không áp dụng sang showlist
                    applyedFilter = {
                        userFilter: [],
                        sharedFilter: []
                    };
                    this.listFilters.map((fil, idx) => {
                        if (idx == filterIdx && isUserFilter) {
                            this.customFilter.filterName = fil.name;
                        }
                    });
                    this.listSharedFilter.map((fil, idx) => {
                        if (idx == filterIdx) {
                            applyedFilter.sharedFilter.push(true);
                            self.report = this.calculateDetailFilter(fil);
                            this.customFilter.filterName = fil.name;
                        } else {
                            applyedFilter.sharedFilter.push(false);
                        }
                    });
                    this.$refs['tab-view'].changeTabView(0);
                    this.isViewDetailFilter = true;
                    break;
            }
            this.$emit('config-filter-action', data);
        }
    },
    props: {
        instanceKey: {
            default: ''
        },
        userColumnControl: {
            type: Array,
            default() {
                return [];
            }
        },
        getDataUrl: {
            type: String,
            default: ''
        },
        shareFilterPermission: {
            type: Boolean,
            default: false
        },
        computedSelfFilterConfig: {
            type: Array,
            default() {
                return [];
            }
        },
        allColumn: {
            type: Object,
            default() {
                return {};
            }
        },
        tableDisplayConfig: {
            type: Object,
            default() {
                return {};
            }
        },
        applyedFilter: {
            type: Object,
            default() {
                return {
                    userFilter: [],
                    sharedFilter: []
                };
            }
        },
        idDoc: {
            type: String,
            default: ''
        },
        isViewKanban: {
            type: Boolean,
            default: false
        },
        columnDefs: {
            type: Array,
            default() {
                return [];
            }
        },
        listSharedFilter: {
            type: Array,
            default() {
                return [];
            }
        },
        listFilters: {
            type: Array,
            default() {
                return [];
            }
        },
        defaultApplyedFilter: {
            type: Object,
            default() {
                return {
                    userFilter: [],
                    sharedFilter: []
                };
            }
        }
    }
};
</script>
<style scoped>
.listitem-filter-container {
    padding: 12px 18px 12px 12px;
    border-left: 0.5px solid #d6d4d4;
    width: 20vw;
    height: 100% !important;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.sidebar-config-filter {
    width: -webkit-fill-available;
}
.sidebar-config-filter >>> .v-slide-group__content {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
}
.filter-menu >>> .v-list-item__action {
    margin: 0px;
    margin-left: 0px;
    padding: 0;
}

.filter-menu >>> .v-list-item__title {
    padding: 0;
}
.header-listitem-filter-container {
    display: flex;
    padding-bottom: 5px;
}
.config-filter {
    height: calc(100% - 150px);
}
.config-filter-icon {
    font-size: 15px !important;
    border-radius: 5px;
    height: 24px;
    width: 24px;
    justify-content: center;
}
.config-filter-icon:hover {
    background: #f2f2f2 !important;
}
.footer-listitem-filter-container {
    display: flex;
    justify-content: space-between;
}
.footer-listitem-filter-container .v-btn {
    color: white;
    font-weight: 400;
    height: 28px;
    box-shadow: none;
    font-size: 12px;
    width: 48.5%;
}
.header-config-filter {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    margin-bottom: 12px;
}
.header-config-filter span {
    font-size: 15px;
    font-weight: 500;
}
.header-config-filter.icon {
    color: black;
}
.header-config-filter >>> .v-icon.v-icon::after {
    /* border-radius: 5px !important; */
    background: none !important;
}
.header-config-filter .reload {
    border-radius: 5px;
    width: 24px;
    height: 24px;
}
.name-input-config-filter p {
    margin-bottom: 8px !important;
}
/* .name-input-config-filter {
    margin-left: 10px;
    margin-right: 10px;
} */
.name-input-config-filter .v-input {
    width: 100%;
    background: #f5f5f5;
    margin-bottom: 12px !important;
}
.name-input-config-filter
    >>> .theme--light.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state)
    > .v-input__control
    > .v-input__slot
    fieldset {
    border: none !important;
}
.config-filter >>> .symper-search-input {
    width: 100% !important;
    margin: 0 !important;
}
/* .config-filter >>> .symper-search-input  {
    width: 100% !important;
} */
.config-filter >>> .symper-search-input > .v-input {
    width: 100% !important;
}
.config-filter
    >>> .theme--light.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state)
    > .v-input__control
    > .v-input__slot
    fieldset {
    border: none !important;
    background: #f9f9f9;
}
.report-self-filter >>> .v-expansion-panel-content__wrap {
    padding-left: 0px !important;
    padding-right: 0px !important;
}

.report-self-filter >>> .v-expansion-panel {
    margin-top: 12px;
    border: 1px solid rgb(224, 224, 224) !important;
    border-radius: 4px;
}

.report-self-filter >>> .v-expansion-panel-header {
    max-height: 50px !important;
    min-height: 50px !important;
    background-color: #f9f9f9;
}
.apply-add-button.theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
    background: #ffe1b2 !important;
    color: white !important;
}
.apply-add-button:hover {
    background: rgb(255 98 0) !important;
}
.filter-menu .v-list-item__content {
    padding: 0px !important;
}
.filter-menu >>> .v-list-item__icon {
    margin: 0px;
}
.filter-menu >>> .v-list-item__icon i {
    display: flex;
    align-items: center;
}
.apply-button:hover {
    background: #4caf50 !important;
}
.listitem-filter-container
    >>> .v-input--selection-controls__input
    > .v-icon.v-icon {
    font-size: 20px !important;
}
.config-list-filter {
    margin-left: 10px;
}
.v-menu__content {
    right: 10px !important;
    left: auto !important;
}
.action-filter {
    border-radius: 5px !important;
    margin: 0 2px;
}
.action-filter:hover {
    background: #f2f2f2 !important;
}
.filter-action-btn {
    box-shadow: none;
    height: 24px !important;
    width: 24px !important;
    min-width: 24px !important;
    padding: 0 !important;
}
.filter-action-btn.v-btn:not(.v-btn--text):not(.v-btn--outlined):focus:before {
    opacity: 0.05 !important;
}
.v-input--selection-controls__ripple {
    display: none;
}
.v-input--selection-controls__input .v-icon {
    width: 18px;
}
</style>

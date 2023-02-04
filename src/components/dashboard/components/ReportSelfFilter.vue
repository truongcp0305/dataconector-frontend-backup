<template>
    <div
        class="w-100 report-self-filter h-100"
        :class="{
            'report-self-filter-hide-options': hideOptions
        }"
    >
        <div
            class="header-section px-1"
            :class="{
                'border-bottom-1': !hideOptions,
                'header-section-hide-options': hideOptions
            }"
            style="margin-bottom: 10px"
        >
            <div class="header-section-title" v-if="!hideOptions">
                <div class="float-left d-flex">
                    <v-tooltip bottom v-if="!isViewKanban && !isViewScheduler">
                        <template v-slot:activator="{ on }">
                            <v-btn
                                small
                                icon
                                elevation="0"
                                @click="togglePinThisPanel()"
                                v-on="on"
                            >
                                <i
                                    :class="{
                                        'mdi fs-16': true,
                                        'mdi-pin-outline': !pinnedSelfFilter,
                                        'mdi-pin orange--text': pinnedSelfFilter
                                    }"
                                ></i>
                            </v-btn>
                        </template>
                        <span>{{
                            pinnedSelfFilter
                                ? $t('bi.dashboard.unpin-panel')
                                : $t('bi.dashboard.pin-panel')
                        }}</span>
                    </v-tooltip>
                    <div>
                        <h2
                            class="ml-2"
                            v-if="!isViewKanban && !isViewScheduler"
                        >
                            {{ $t('bi.dashboard.filter-this-report') }}
                        </h2>
                        <h2
                            class="ml-2"
                            v-if="
                                isViewKanban &&
                                !isFilterAllKanban &&
                                !isViewScheduler
                            "
                        >
                            {{
                                $t(
                                    'kanban.enduser_view.column.filter.filter_column'
                                )
                            }}
                        </h2>
                        <h2 class="ml-2" v-else-if="isViewKanban">
                            {{ $t('v2.dashboard.filterAllColumn') }}
                        </h2>

                        <span
                            class="ml-2 mdi mdi-filter-variant fs-15 color-black"
                            v-if="isViewScheduler"
                        ></span>
                        <span class="ml-2 fs-13" v-if="isViewScheduler">{{
                            $t('v2.dashboard.filterCard')
                        }}</span>
                        <span
                            class="ml-2"
                            v-if="
                                isViewKanban &&
                                !isFilterAllKanban &&
                                !isViewScheduler
                            "
                            >{{ $t('v2.dashboard.columnName') }}</span
                        >
                        <div
                            v-if="!isFilterAllKanban && !isViewScheduler"
                            class="grey--text pl-2 fs-12 text-ellipsis"
                            style="width: 185px; display: inline"
                        >
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <span class="fs-11" v-on="on">{{
                                        reportTitle
                                    }}</span>
                                </template>
                                <span>{{ reportTitle }}</span>
                            </v-tooltip>
                        </div>
                    </div>
                </div>

                <v-btn
                    class="float-right"
                    small
                    icon
                    elevation="0"
                    @click="closePanel()"
                >
                    <i class="mdi mdi-close fs-16"></i>
                </v-btn>
            </div>

            <SearchBox
                style="width: calc(100% - 8px)"
                class="ma-2 mt-0"
                :placeholder="
                    !isViewKanban
                        ? $t('bi.dashboard.find-filter-column')
                        : $t('common.enter_to_search')
                "
                @input="handleSearchColumn"
                v-model="report.sharedConfigs.searchKey"
                v-if="JSON.stringify(report) != '{}'"
            />
        </div>
        <div
            v-if="!columns.length"
            class="py-3 px-5 fs-13 grey--text text-center"
        >
            {{ $t('bi.dashboard.cannot-use-self-filter') }}
        </div>
        <div
            v-else
            class="body-section px-3"
            :class="{
                'body-section-hide-options': hideOptions
            }"
            :style="{
                height: isAddFilter
                    ? 'calc(100% - 235px)'
                    : 'calc(100% - 128px)',
                overflow: 'auto'
            }"
        >
            <v-expansion-panels
                v-if="report.sharedConfigs"
                v-model="report.sharedConfigs.selfFilter.opening"
                :multiple="true"
                :hover="true"
                :flat="true"
                class="sym-small-size pb-3"
            >
                <v-expansion-panel
                    v-for="(item, i) in columns"
                    v-show="item.display"
                    :disabled="isViewDetailFilter"
                    :key="i"
                >
                    <v-expansion-panel-header>
                        <div class="fs-13" style="width: calc(100% - 25px)">
                            <div
                                class="fw-400 fs-13 text-ellipsis"
                                :title="makeRightTitleFormat(item.col.as)"
                            >
                                <span>{{
                                    makeRightTitleFormat(item.col.as)
                                }}</span>
                            </div>
                            <div
                                class="fw-400 fs-12 text-ellipsis"
                                :title="item.text"
                                style="margin-top: 6px; color: grey"
                            >
                                <i
                                    v-if="item.filtered && !hideOptions"
                                    class="mdi mdi-filter symper-text-orange mr-1"
                                ></i>
                                <span
                                    :class="{
                                        'symper-text-orange':
                                            hideOptions &&
                                            item.text !=
                                                $t('bi.dashboard.is-all')
                                    }"
                                    >{{ item.text }}</span
                                >
                            </div>
                        </div>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content
                        class="border-top-1"
                        :disabled="isViewDetailFilter"
                    >
                        <TableFilter
                            :isViewDetailFilter="isViewDetailFilter"
                            :ref="getKeyForCol(item)"
                            :style="{
                                height:
                                    item.col.type == 'number'
                                        ? '200px'
                                        : '350px'
                            }"
                            :hideOptions="hideOptions"
                            :sticky="true"
                            :numericTypeHideSelection="true"
                            :columnFilter="item.config"
                            :hiddenItems="['sort', 'apply', 'clearFilter']"
                            @search-autocomplete-items="
                                searchAutocompleteItems(item)
                            "
                            @input-filter-change="
                                (newConfig) => {
                                    handleInputFilterChange(item, newConfig);
                                }
                            "
                            :isViewKanban="isViewKanban"
                        />
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </div>

        <div
            class="foot-section pa-1 border-top-1 border-bottom-1"
            v-if="columns.length && !hideOptions"
        >
            <v-btn
                class="float-right"
                small
                color="primary"
                elevation="0"
                @click="applyFilter()"
            >
                <i class="mdi mdi-filter-outline fs-16 mr-2"></i>
                {{ $t('common.apply') }}
            </v-btn>

            <v-btn
                class="float-right mr-2"
                text
                small
                elevation="0"
                @click="clearFilter()"
            >
                <i class="mdi mdi-eraser fs-16 mr-2"></i>
                <span>{{ $t('bi.dashboard.clear-filter') }}</span>
            </v-btn>
        </div>
    </div>
</template>

<script>
import { util } from '../../../plugins/util';
import SearchBox from '@/components/common/SearchBox.vue';
import {
    getDefaultFilterConfig,
    getDefaultFilterConfigForNumeric
} from '@/components/common/customTable/defaultFilterConfig';
import TableFilter from '@/components/common/customTable/TableFilter.vue';
import { dashboardApi } from '@/api/dashboard';
import { getDataInputForReport } from '@/components/dashboard/configPool/reportConfig.js';
import { documentApi } from '@/api/Document.js';
import { checkColumnHasFilter } from '@/components/common/customTable/defaultFilterConfig';

const SELECTION_PAGE_SIZE = 300;

export default {
    computed: {
        reportTitle() {
            if (this.columns.length) {
                let title =
                    this.report.rawConfigs.style.title.children.titleText.value;
                return title
                    ? title
                    : this.$t('bi.dashboard.unknown-report-name');
            }
        }
    },
    props: {
        isAddFilter: {
            default: false
        },
        instanceKey: {
            default: ''
        },
        isViewDetailFilter: {
            type: Boolean,
            default: false
        },
        hideOptions: {
            type: Boolean,
            default: false
        },
        report: {
            default() {
                return {};
            }
        },
        idDashboard: {
            default: 0
        },
        dashboardConfig: {
            type: Object,
            default() {
                return {};
            }
        },
        pinnedSelfFilter: {
            type: Boolean,
            default: false
        },
        isViewKanban: {
            type: Boolean,
            default: false
        },
        idDoc: {
            type: String,
            default: ''
        },
        columnKanban: {
            type: String,
            default: ''
        },
        isFilterAllKanban: {
            type: Boolean,
            default: false
        },
        isViewScheduler: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        'report.sharedConfigs.cellId'() {
            this.recaculateListColumn();
        },
        'report.sharedConfigs.selfFilter.opening'() {
            let self = this;
            setTimeout(() => {
                if (self.report.hasSelfFilter) {
                    self.getDataForOpenedColumns();
                }
            }, 0);
        },
        'report.sharedConfigs.selfFilter.cols': {
            deep: true,
            handler() {
                this.recaculateListColumn();
            }
        }
    },
    mounted() {
        this.recaculateListColumn();
    },
    data() {
        return {
            columns: []
        };
    },
    components: {
        SearchBox,
        TableFilter
    },
    methods: {
        makeRightTitleFormat(title) {
            let sections = title.split('//');
            return sections[1] ? `${sections[0]} (${sections[1]})` : title;
        },
        handleSearchColumn(searchKey) {
            let self = this;
            if (this.debounceSearchCols) {
                clearTimeout(this.debounceSearchCols);
            }
            this.debounceSearchCols = setTimeout(() => {
                searchKey = searchKey.toLowerCase().trim();
                if (!searchKey) {
                    self.columns.map((col) => {
                        col.display = true;
                    });
                } else {
                    self.columns.map((col) => {
                        col.display = col.col.as
                            .toLowerCase()
                            .includes(searchKey);
                    });
                }
            }, 400);
        },
        async searchAutocompleteItems(item) {
            // let searchKey = item.config.searchKey.toLowerCase();
            if (item.config.searchLocal) {
                // if(!searchKey){
                //     item.config.selectItems = item.config.fullOptions
                // }else{
                //     let selections = [];
                //     for(let i of item.config.fullOptions){
                //         if(i.value.toLowerCase().includes(searchKey)){
                //             selections.push(i);
                //         }
                //     }
                //     item.config.selectItems = selections;
                // }
            } else {
                await this.getItemsForSelection(item, 'autocomplete');
            }
            let filterInstance = this.$refs[this.getKeyForCol(item)][0];
            filterInstance.loading = false;
        },
        clearFilter() {
            this.report.sharedConfigs.computedSelfFilterConfig = null;
            this.recaculateListColumn();
            this.report.sharedConfigs.selfFilter.cols = {};
            this.report.sharedConfigs.selfFilter.applied = false;
            this.$emit('apply-self-filter', this.report.sharedConfigs.cellId);
            this.getDataForOpenedColumns();
        },
        closePanel() {
            this.$emit('close');
        },
        togglePinThisPanel() {
            this.$emit('toggle-pin');
        },
        applyFilter(needRender = true) {
            let allCols = this.report.sharedConfigs.computedSelfFilterConfig;
            let map = {};
            for (let col of allCols) {
                let key = this.getKeyForCol(col);
                // Nếu đã mở ra --> có khả năng đã bị chỉnh sửa nên cần lấy theo dữ liệu trong instance
                if (this.$refs[key]) {
                    if (!this.$refs[key][0]) continue;
                    let filterInstance = this.$refs[key][0];
                    let newConfig = util.cloneDeep(
                        filterInstance.filterConfigs
                    );
                    newConfig.notResetFullOptions = true;
                    this.$set(col, 'config', newConfig);
                    if (checkColumnHasFilter(filterInstance.filterConfigs)) {
                        col.filtered = true;
                        map[col.col.as] = col.config;
                        map[col.col.as].agg = col.col.agg;
                    } else {
                        col.filtered = false;
                    }
                } else {
                    // Chưa hề được mở ra nên dữ liệu vẫn giống y hệt như cũ
                    if (col.filtered) {
                        map[col.col.as] = col.config;
                        map[col.col.as].agg = col.col.agg;
                    }
                }
            }
            this.report.sharedConfigs.selfFilter.cols = map;
            if (!$.isEmptyObject(map)) {
                this.report.sharedConfigs.selfFilter.applied = true;
            } else {
                this.report.sharedConfigs.selfFilter.applied = false;
            }
            this.$emit(
                'apply-self-filter',
                this.report.sharedConfigs.cellId,
                needRender
            );
        },
        calcPanelHeight() {
            this.height = util.getComponentSize(this.$el).h - 80 + 'px';
        },
        getTextForFilter(filter) {
            let allUsers = this.$store.state.app.allUsers;
            let items = filter.conditionFilter.items;
            let formatValue = util.cloneDeep(filter.valuesIn);
            for (let item in formatValue) {
                filter.selectItems.map((vl) => {
                    if (vl.value == item) {
                        if (vl.label) {
                            delete formatValue[item];
                            formatValue[vl.label] = true;
                        }
                    }
                });
            }
            if (!$.isEmptyObject(formatValue)) {
                return (
                    this.$t('bi.dashboard.is') +
                    ' ' +
                    Object.keys(formatValue)
                        .map((val) => {
                            if (filter.isControlUser) {
                                let obj = allUsers.find(
                                    (data) => data.id === val
                                );
                                return obj != undefined ? obj.displayName : val;
                            } else {
                                return val;
                            }
                        })
                        .join(` ${this.$t('common.or')} `)
                );
            } else if (!$.isEmptyObject(filter.valuesNotIn)) {
                return (
                    this.$t('bi.dashboard.is-not') +
                    ' ' +
                    Object.keys(filter.valuesNotIn).join(
                        ` ${this.$t('common.and')} `
                    )
                );
            } else if (items[0].type != 'none') {
                let hasConitional = items.filter((item) => item.type != 'none');
                let str = this.$t('table.filter.' + hasConitional[0].type);
                str += ' ' + hasConitional[0].value;
                hasConitional.slice(1, hasConitional.length).map((item) => {
                    str +=
                        ' ' +
                        this.$t('common.' + filter.conditionFilter.conjunction);
                    str +=
                        ' ' +
                        this.$t('table.filter.' + item.type) +
                        ' ' +
                        item.value;
                });
                return str;
            } else {
                return this.$t('bi.dashboard.is-all');
            }
        },
        convertToFilterPanelConfig(config) {},
        getKeyForCol(item) {
            return this.report.sharedConfigs.cellId + '--' + item.col.name;
        },
        handleInputFilterChange(item, newConfig) {
            item.text = this.getTextForFilter(newConfig);
        },
        recaculateListColumn() {
            if (!this.report.sharedConfigs || !this.report.hasSelfFilter) {
                this.columns = [];
                return;
            }
            let hiddenCols = {};
            if (Array.isArray(this.report.viewConfigs.displayOptions.columns)) {
                hiddenCols =
                    this.report.viewConfigs.displayOptions.columns.reduce(
                        (map, el) => {
                            if (el.hide) {
                                map[el.headerName] = true;
                            }
                            return map;
                        },
                        {}
                    );
            }

            let cols = [];
            if (
                this.report.sharedConfigs.computedSelfFilterConfig &&
                this.report.sharedConfigs.computedSelfFilterConfig.length > 0
            ) {
                cols = this.report.sharedConfigs.computedSelfFilterConfig;
                for (let col of cols) {
                    col.text = this.getTextForFilter(col.config);
                }
            } else {
                let usedCols = {};
                let setting = this.report.rawConfigs.setting;

                for (let key in setting) {
                    for (let col of setting[key].selectedColums) {
                        if (!usedCols[col.as] && !hiddenCols[col.as]) {
                            // nếu chưa đi qua cột này
                            usedCols[col.as] = true;
                            let config =
                                col.type == 'number'
                                    ? getDefaultFilterConfigForNumeric()
                                    : getDefaultFilterConfig();
                            config.dataType = col.type;
                            config.dataset = col.dataset;
                            config.isControlUser = col.isControlUser;
                            cols.push({
                                display: true,
                                col: col,
                                config: config,
                                filtered: false, // đánh dấu là có được filter áp dụng filter cho cột này hay ko
                                text: this.$t('bi.dashboard.is-all'),
                                gettingData: false // đánh dấu là có đang lấy dữ liệu từ server lên hay ko
                            });
                        }
                    }
                }
                this.report.sharedConfigs.computedSelfFilterConfig = cols;
            }
            this.columns = cols;
        },
        async getDataForOpenedColumns() {
            let indexArr = this.report.sharedConfigs.selfFilter.opening;
            for (let idx of indexArr) {
                let item = this.columns[idx];
                let needGetData =
                    !item.gettingData && !item.config.selectItems.length;
                if (needGetData) {
                    this.getItemsForSelection(item);
                }
            }
        },
        unLoadingTableFilter(colConfig) {
            let key = this.getKeyForCol(colConfig);
            this.$refs[key][0].loading = false;
        },
        /**
         * Lấy các mục cần hiển thị cho phần selection trong bộ filter
         */
        async getItemsForSelection(colConfig, source = 'init-items') {
            colConfig.gettingData = true;
            let key = this.getKeyForCol(colConfig);
            let filterInstance = this.$refs[key][0];
            filterInstance.loading = true;
            // Chỉnh lại cấu hình của cột cho đúng với mục đích
            let col = util.cloneDeep(colConfig.col);
            col.agg = 'group';
            col.sort = 'asc';

            let selfColumnsConditons = []; // filter áp dụng cho các column trong phần self filter này
            if (source == 'autocomplete') {
                let col3 = util.cloneDeep(col);
                col3.name = col3.as;
                col3.cond.type = 'contains';
                col3.cond.val = filterInstance.filterConfigs.searchKey;
                selfColumnsConditons.push(col3);
            }

            if (
                !this.isViewKanban &&
                !this.isViewScheduler &&
                this.idDoc == '' &&
                !this.hideOptions
            ) {
                let relations = this.dashboardConfig.info.relations;
                let config = getDataInputForReport(
                    this.report,
                    relations,
                    false,
                    false
                );
                config.reportType = 'table';
                config.cellId = key;
                config.needTotal = false;
                config.pageSize = SELECTION_PAGE_SIZE;
                config.currentPage = 1;
                config.afterQuery = {
                    where: selfColumnsConditons,
                    select: [col],
                    orderBy: [
                        {
                            column: {
                                as: col.as
                            },
                            mode: 'ASC'
                        }
                    ]
                };
                try {
                    let res = await dashboardApi.getData(config, false);
                    let selectItems = [];
                    for (let item of res.data.data) {
                        let as = col.as.split('//')[0].trim();
                        selectItems.push({
                            value: item[as] ? item[as] : '',
                            checked: true
                        });
                    }
                    colConfig.config.selectItems = selectItems;
                    if (source == 'init-items') {
                        colConfig.config.total = Number(res.data.total);
                        if (res.data.data.length < SELECTION_PAGE_SIZE) {
                            colConfig.config.searchLocal = true;
                        }
                        if (colConfig.config.searchKey) {
                            this.searchAutocompleteItems(colConfig);
                        }
                    }
                    colConfig.gettingData = false;
                    filterInstance.loading = false;
                } catch (error) {
                    this.$snotifyError(
                        error,
                        this.$t('v2.dashboard.canNotGetItem')
                    );
                }
            } else {
                if (this.idDoc != '') {
                    try {
                        let filter = {
                            filter: [
                                {
                                    column: colConfig.col.name,
                                    operation: 'and',
                                    conditions: [
                                        {
                                            name: 'contains',
                                            value: ''
                                        }
                                    ]
                                }
                            ],
                            sort: [
                                {
                                    column: 'createTime',
                                    type: 'desc'
                                }
                            ],
                            columns: [colConfig.col.name],
                            page: 1,
                            pageSize: 300,
                            distinct: true,
                            isTranslateUser: 0
                        };
                        if (
                            this.report.sharedConfigs.cellId != 'allColumn' &&
                            this.report.sharedConfigs.cellId != 'allEvent'
                        ) {
                            filter.filter.push({
                                column: this.columnKanban,
                                operation: 'and',
                                conditions: [
                                    {
                                        name: 'equal',
                                        value: this.report.sharedConfigs.cellId
                                    }
                                ]
                            });
                        }
                        if (selfColumnsConditons.length != 0) {
                            filter.filter[0].conditions[0].value =
                                selfColumnsConditons[0].cond.val;
                        }
                        let res = await documentApi.getListObject(
                            this.idDoc,
                            filter
                        );
                        let selectItems = [];
                        let valuesIn = colConfig.config.valuesIn;
                        let selectAll = colConfig.config.selectAll;
                        for (let item of res.data.listObject) {
                            let as = col.name;
                            let label = '';
                            if (col.isControlUser) {
                                let allUsers = this.$store.state.app.allUsers;
                                let obj = allUsers.find(
                                    (data) => data.id === item[as]
                                );
                                if (obj != undefined) {
                                    label = obj.displayName;
                                }
                            }
                            let value = item[as] ? item[as] : '';
                            let itemSelected = {
                                value: item[as] ? item[as] : '',
                                checked: selectAll
                                    ? true
                                    : valuesIn[value]
                                    ? true
                                    : false
                            };
                            if (label != '') {
                                itemSelected['label'] = label;
                            }

                            selectItems.push(itemSelected);
                        }
                        colConfig.config.selectItems = selectItems;
                        if (source == 'init-items') {
                            colConfig.config.total = Number(res.data.total);
                            if (
                                res.data.listObject.length < SELECTION_PAGE_SIZE
                            ) {
                                colConfig.config.searchLocal = true;
                            }
                            if (colConfig.config.searchKey) {
                                this.searchAutocompleteItems(colConfig);
                            }
                        }
                        colConfig.gettingData = false;
                        filterInstance.loading = false;
                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    this.$evtBus.$emit(
                        'showlist-report-self-filter-get-item-filter',
                        this.instanceKey,
                        colConfig.col.agg
                    );
                }
            }
        }
    }
};
</script>

<style scoped>
.header-section-title {
    display: flex;
    justify-content: space-between;
}
.header-section {
    padding-top: 6px;
}
.foot-section {
    height: 40px;
}
/* .report-self-filter {
    height: calc(100% - 120px);
} */

.report-self-filter >>> .v-expansion-panel-content__wrap {
    padding-left: 0px !important;
    padding-right: 0px !important;
}

.report-self-filter >>> .v-expansion-panel {
    /* padding-top: 12px; */
    margin-top: 12px;
    border: 1px solid rgb(224, 224, 224) !important;
    border-radius: 4px;
}

.report-self-filter >>> .v-expansion-panel-header {
    max-height: 50px !important;
    min-height: 50px !important;
    background-color: #f9f9f9;
}
.header-section-hide-options {
    padding-left: 0px !important;
    padding-right: 0px !important;
}
.body-section-hide-options {
    padding-left: 0px !important;
    padding-right: 0px !important;
    height: calc(100vh - 320px) !important;
}
.report-self-filter-hide-options
    >>> .theme--light.v-expansion-panels
    .v-expansion-panel:not(.v-item--active) {
    border: none !important;
}
.report-self-filter-hide-options.report-self-filter >>> .v-expansion-panel {
    border: 0.5px solid #3059ff !important;
    border-radius: 8px !important;
}
.report-self-filter-hide-options.report-self-filter
    >>> .v-expansion-panel-header:not(.v-expansion-panel-header--active) {
    border-radius: 8px;
}
.report-self-filter-hide-options.report-self-filter
    >>> .v-expansion-panel-header.v-expansion-panel-header--active {
    border: 8px 8px 0 0;
}
</style>

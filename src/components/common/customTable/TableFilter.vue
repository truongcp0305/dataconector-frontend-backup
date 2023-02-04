<template>
    <div
        :id="keyId"
        :class="{
            'symper-table-filter-container': true,
            'd-none': !sticky && !showTableFilter,
            'elevation-8': !sticky
        }"
        :style="
            !sticky
                ? height == 0 || height > 450
                    ? 'height:450px ; z-index: 9999;position: fixed;'
                    : {
                          height: height + 'px',
                          'z-index': '9999',
                          position: 'fixed'
                      }
                : ''
        "
    >
        <div class="symper-drag-panel-header"></div>
        <div
            v-if="!hiddenItems.includes('sort')"
            ref="it1"
            @click="selectSortType('asc')"
            :class="{
                'pb-1 dropdown-item grey-hover': true,
                'symper-text-orange': filterConfigs.sort == 'asc'
            }"
        >
            <i
                class="pl-2 mdi body-1 mdi-sort-alphabetical-descending mr-2"
            ></i>
            <span>{{ $t('table.filter.sort_asc') }}</span>
            <i
                class="mdi body-1 mdi-check float-right"
                :class="{ 'd-none': filterConfigs.sort != 'asc' }"
            ></i>
        </div>

        <div
            v-if="!hiddenItems.includes('sort')"
            ref="it2"
            @click="selectSortType('desc')"
            :class="{
                ' pb-1 dropdown-item grey-hover': true,
                'symper-text-orange': filterConfigs.sort == 'desc'
            }"
        >
            <i class="pl-2 mdi body-1 mdi-sort-alphabetical-ascending mr-2"></i>
            <span>{{ $t('table.filter.sort_desc') }}</span>
            <i
                class="pl-2 mdi body-1 mdi-check float-right"
                :class="{ 'd-none': filterConfigs.sort != 'desc' }"
            ></i>
        </div>

        <div
            v-if="!hiddenItems.includes('clearFilter')"
            ref="it3"
            class="pb-1 dropdown-item grey-hover"
            @click="clearFilter"
        >
            <i class="pl-2 mdi body-1 mdi-filter-remove-outline mr-2"></i>
            <span>{{ $t('table.filter.clear_filter') }}</span>
        </div>

        <div ref="it4" class="pb-1 dropdown-item">
            <div>{{ $t('table.filter.filter_by_condition') }}</div>
            <v-menu offset-y class="w-100" v-model="typeSelect1">
                <template v-slot:activator="{ on }">
                    <v-btn class="w-100" depressed small v-on="on">{{
                        listConditionType[colType][
                            filterConfigs.conditionFilter.items[0].type
                        ]
                    }}</v-btn>
                </template>
                <v-list dense class="symper-list-condition-type">
                    <v-list-item
                        @click.stop="selectFilterCondition(0, key)"
                        class="v-list-item--link"
                        v-for="(text, key) in listConditionType[colType]"
                        :key="key"
                    >
                        <v-list-item-title>{{ text }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-text-field
                class="sym-small-size mt-2"
                :disabled="isViewDetailFilter"
                @input="handleInputValue('input1')"
                v-show="checkDisplayCondition('input1')"
                single-line
                outlined
                dense
                v-model="filterConfigs.conditionFilter.items[0].value"
            ></v-text-field>
            <v-radio-group
                class="sym-small-size pt-0"
                row
                :disabled="isViewDetailFilter"
                @change="handleInputValue('conjungtion')"
                v-show="checkDisplayCondition('conjungtion')"
                v-model="filterConfigs.conditionFilter.conjunction"
            >
                <v-radio value="and" class="mb-0">
                    <template v-slot:label>
                        <strong>AND</strong>
                    </template>
                </v-radio>
                <v-radio value="or">
                    <template v-slot:label>
                        <strong>OR</strong>
                    </template>
                </v-radio>
            </v-radio-group>
            <v-menu offset-y class="w-100" v-model="typeSelect2">
                <template v-slot:activator="{ on }">
                    <v-btn
                        v-show="checkDisplayCondition('type2')"
                        class="w-100"
                        depressed
                        small
                        v-on="on"
                        >{{
                            listConditionType[colType][
                                filterConfigs.conditionFilter.items[1].type
                            ]
                        }}</v-btn
                    >
                </template>
                <v-list dense class="symper-list-condition-type">
                    <v-list-item
                        class="v-list-item--link"
                        v-for="(text, key) in listConditionType[colType]"
                        :key="key"
                    >
                        <v-list-item-title
                            @click.stop="selectFilterCondition(1, key)"
                            >{{ text }}</v-list-item-title
                        >
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-text-field
                :disabled="isViewDetailFilter"
                v-show="checkDisplayCondition('input2')"
                @input="handleInputValue('input2')"
                class="sym-small-size mt-2"
                single-line
                outlined
                dense
                v-model="filterConfigs.conditionFilter.items[1].value"
            ></v-text-field>
        </div>

        <div class="d-flex">
            <div ref="it5" class="pt-2" v-show="showFilterBySelection">
                {{ $t('table.filter.filter_by_value') }}
            </div>
            <v-tooltip
                bottom
                v-if="customGetDataForFilter.hasOwnProperty(currentColumn)"
            >
                <template v-slot:activator="{ on }">
                    <v-icon v-on="on" small tile color="red" class="mt-1 ml-1"
                        >mdi-information</v-icon
                    >
                </template>
                <span>{{
                    $t('table.filter.field_redundant_data_loading_filter')
                }}</span>
            </v-tooltip>
        </div>
        <div
            ref="it6"
            class="pb-1 dropdown-item"
            v-show="showFilterBySelection"
        >
            <v-text-field
                class="sym-small-size"
                single-line
                append-icon="mdi-magnify"
                outlined
                :disabled="isViewDetailFilter"
                dense
                label="Search"
                ref="filterSearchBox"
                v-model="filterConfigs.searchKey"
                :placeholder="$t('common.search')"
                @keyup.enter="handleInputSearch"
            ></v-text-field>
        </div>

        <div
            class="pb-1 dropdown-item"
            :style="{ height: listSelectItemHeight }"
            v-show="showFilterBySelection"
        >
            <div style="height: 40px; position: relative" v-show="loading">
                <Preloader :size="20" />
            </div>
            <v-checkbox
                :disabled="isViewDetailFilter"
                v-show="!loading"
                small
                class="sym-small-size pa-0"
                v-model="filterConfigs.clickedSelectAll"
                :label="$t('common.select_all')"
                @click="handleSelectAllChange"
            ></v-checkbox>
            <VuePerfectScrollbar
                v-show="!loading"
                :style="{ height: `calc(${listSelectItemHeight} - 35px)` }"
            >
                <v-checkbox
                    :disabled="isViewDetailFilter"
                    v-for="(item, idx) in filterConfigs.selectItems"
                    :key="idx"
                    x-small
                    class="sym-small-size pa-0"
                    v-model="item.checked"
                    :label="item.label ? item.label : item.value"
                    @change="handleSelectItemChange(item)"
                ></v-checkbox>
            </VuePerfectScrollbar>
        </div>
        <div
            v-show="!showFilterBySelection"
            style="text-align: center; padding-top: 20px"
        >
            {{ $t('v2.showlist.numbericOnlySupportFilterByCondition') }}
        </div>

        <div
            class="pt-1 dropdown-item"
            ref="it7"
            style="height: 45px"
            v-if="!hiddenItems.includes('apply')"
        >
            <v-btn
                depressed
                small
                color="primary"
                class="float-right"
                @click="applyFilter()"
                >{{ $t('common.apply') }}</v-btn
            >
            <v-btn
                depressed
                small
                text
                class="mr-2 float-right"
                @click="hide()"
                >{{ $t('common.cancel') }}</v-btn
            >
        </div>
    </div>
</template>

<script>
import { util } from '@/plugins/util.js';
import { getDefaultFilterConfig } from './defaultFilterConfig.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import Preloader from '@/components/common/Preloader.vue';

let conditionMap = {
    text: [
        'none',
        'empty',
        'not_empty',
        'equal',
        'not_equal',
        'begins_with',
        'ends_with',
        'contains',
        'not_contain'
    ],
    numeric: [
        'none',
        'empty',
        'not_empty',
        'equal',
        'not_equal',
        'greater_than',
        'greater_than_or_equal',
        'less_than',
        'less_than_or_equal'
    ],
    number: [
        'none',
        'empty',
        'not_empty',
        'equal',
        'not_equal',
        'greater_than',
        'greater_than_or_equal',
        'less_than',
        'less_than_or_equal'
    ],
    date: [
        'none',
        'empty',
        'not_empty',
        'equal',
        'not_equal',
        'begins_with',
        'ends_with',
        'contains',
        'not_contain',
        'greater_than',
        'greater_than_or_equal',
        'less_than',
        'less_than_or_equal'
    ],
    datetime: [
        'none',
        'empty',
        'not_empty',
        'equal',
        'not_equal',
        'begins_with',
        'ends_with',
        'contains',
        'not_contain',
        'greater_than',
        'greater_than_or_equal',
        'less_than',
        'less_than_or_equal'
    ]
};
require('@/../public/vendor/triggerDragElement.js');
export default {
    mounted() {
        let self = this;
        setTimeout(() => {
            self.recalcListSelectItemHeight();
            dragElement(document.getElementById(self.keyId));
        }, 300);
    },
    created() {
        let thisCpn = this;
        this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
            if (thisCpn.sticky) {
                return;
            }
            if (
                !$(evt.target).hasClass('symper-filter-button') &&
                $(evt.target).parents('.symper-table-filter-container')
                    .length == 0 &&
                $(evt.target).parents('.symper-list-condition-type').length == 0
            ) {
                thisCpn.hide();
            }
        });
        this.$evtBus.$on('change-user-locale', (evt) => {
            let conds = thisCpn.getConditionType();
            for (let name in conds) {
                thisCpn.$set(thisCpn.listConditionType, name, conds[name]);
            }
        });
    },
    methods: {
        handleInputValue(type) {
            if (this.debounceHandleInputValue) {
                clearTimeout(this.debounceHandleInputValue);
            }

            let self = this;
            this.debounceHandleInputValue = setTimeout(() => {
                self.$emit('input-filter-change', self.filterConfigs);
            }, 400);
        },
        handleInputSearch(vl) {
            if (this.debounceHandleInputSearch) {
                clearTimeout(this.debounceHandleInputSearch);
            }
            let self = this;
            this.debounceHandleInputSearch = setTimeout(() => {
                self.loading = true;
                let config = self.filterConfigs;
                self.$emit(
                    'search-autocomplete-items',
                    config.searchKey.toLowerCase().trim()
                );
                if (config.searchLocal) {
                    let searchKey = config.searchKey.toLowerCase().trim();
                    if (!searchKey) {
                        config.selectItems = config.fullOptions;
                    } else {
                        let selections = [];
                        for (let i of config.fullOptions) {
                            if (
                                i.value.toLowerCase().includes(searchKey) ||
                                (i.label &&
                                    i.label.toLowerCase().includes(searchKey))
                            ) {
                                selections.push(i);
                            }
                        }
                        config.selectItems = selections;
                    }
                    self.loading = false;
                }
            }, 300);
        },
        handleSelectItemChange(item) {
            if (this.filterConfigs.selectAll) {
                if (!item.checked) {
                    delete this.filterConfigs.valuesIn[item.value];
                    this.filterConfigs.valuesNotIn[item.value] = true;
                    this.filterConfigs.clickedSelectAll = false;
                } else {
                    delete this.filterConfigs.valuesNotIn[item.value];
                    // cần check xem là có đủ số lượng đã check hay chưa để đánh  check all
                }
            } else {
                if (item.checked) {
                    this.filterConfigs.valuesIn[item.value] = true;
                } else {
                    delete this.filterConfigs.valuesIn[item.value];
                }
            }
            this.$emit('input-filter-change', this.filterConfigs);
        },
        handleSelectAllChange() {
            let self = this;
            setTimeout(
                (self) => {
                    let newValue = self.filterConfigs.clickedSelectAll;
                    self.filterConfigs.selectAll = newValue;
                    for (let item of self.filterConfigs.selectItems) {
                        item.checked = newValue;
                    }
                    self.$set(self.filterConfigs, 'valuesIn', {});
                    self.$set(self.filterConfigs, 'valuesNotIn', {});
                    self.$emit('input-filter-change', self.filterConfigs);
                },
                10,
                this
            );
        },
        // Lấy về các item condition tương ứng với từng loại kiểu dữ liệu
        getConditionType() {
            let rsl = {};
            for (let type in conditionMap) {
                rsl[type] = {};
                for (let item of conditionMap[type]) {
                    rsl[type][item] = this.$t('table.filter.' + item);
                }
            }
            return rsl;
        },
        clearFilter() {
            this.$emit(
                'apply-filter-value',
                getDefaultFilterConfig(),
                'clear-filter'
            );
            setTimeout(
                (thisCpn) => {
                    thisCpn.hide();
                },
                300,
                this
            );
        },
        applyFilter() {
            this.$emit('apply-filter-value', this.filterConfigs);
            setTimeout(
                (thisCpn) => {
                    thisCpn.hide();
                },
                100,
                this
            );
        },
        isShowing() {
            return this.showTableFilter;
        },
        hide() {
            this.showTableFilter = false;
            this.focusing = false;
            $(`#${this.keyId}`).addClass('d-none');
        },
        show() {
            this.showTableFilter = true;
            setTimeout(
                (thisCpn) => {
                    thisCpn.focusSearchBox();
                },
                300,
                this
            );

            this.focusing = true;
            this.listSelectItemHeight = '0px';

            setTimeout(
                (thisCpn) => {
                    thisCpn.recalcListSelectItemHeight();
                },
                100,
                this
            );
        },
        focusSearchBox() {
            $(this.$refs.filterSearchBox.$el).find('input').focus();
        },
        selectSortType(type) {
            this.filterConfigs.sort = type;
            this.applyFilter();
        },
        selectFilterCondition(index, type) {
            this.filterConfigs.conditionFilter.items[index].type = type;
            this['typeSelect' + (index + 1)] = false;
            this.listSelectItemHeight = '0px';
            setTimeout(
                (thisCpn) => {
                    thisCpn.recalcListSelectItemHeight();
                },
                600,
                this
            );
            this.$emit('input-filter-change', this.filterConfigs);
        },
        recalcListSelectItemHeight() {
            let refs = this.$refs;
            let h = util.getComponentSize(this).h - 8;
            for (let i = 1; i <= 7; i++) {
                if (refs['it' + i]) {
                    h -= util.getComponentSize(refs['it' + i]).h;
                }
            }
            if (this.isViewKanban) {
                h = 239;
            }

            this.listSelectItemHeight = h + 'px';
        },
        /**
         * input1, conjungtion, type2, input2
         */
        checkDisplayCondition(type) {
            let showInputType = {
                equal: true,
                not_equal: true,
                begins_with: true,
                ends_with: true,
                contains: true,
                not_contain: true,
                greater_than: true,
                less_than: true,
                greater_than_or_equal: true,
                less_than_or_equal: true
            };
            if (
                this.filterConfigs.conditionFilter &&
                this.filterConfigs.conditionFilter.items &&
                this.filterConfigs.conditionFilter.items[0]
            ) {
                let items = this.filterConfigs.conditionFilter.items;
                if (type == 'input1') {
                    return showInputType[items[0].type];
                } else if (type == 'input2') {
                    return (
                        items[0].type != 'none' && showInputType[items[1].type]
                    );
                } else if (type == 'type2') {
                    return items[0].type != 'none';
                } else if (type == 'conjungtion') {
                    return items[0].type != 'none';
                }
            } else {
                return false;
            }
        }
    },
    data() {
        return {
            listSelectItemHeight: '100px',
            typeSelect2: false,
            typeSelect1: false,
            filterConfigs: null,
            showTableFilter: false,
            focusing: true,
            listConditionType: this.getConditionType(),
            loading: false,
            keyId: 'table-filter-id-' + Date.now()
        };
    },
    components: {
        VuePerfectScrollbar: VuePerfectScrollbar,
        Preloader
    },
    props: {
        isViewDetailFilter: {
            type: Boolean,
            default: false
        },
        hideOptions: {
            type: Boolean,
            default: false
        },
        height: {
            type: Number
        },
        numericTypeHideSelection: {
            type: Boolean,
            default: false
        },
        columnFilter: {
            default() {
                return getDefaultFilterConfig();
            }
        },
        currentColumn: {
            type: String
        },
        customGetDataForFilter: {
            type: Object,
            default() {
                return {};
            }
        },
        /**
         * Chứa những mục không cần hiển thị
         */
        hiddenItems: {
            type: Array,
            default() {
                return [];
            }
        },
        /**
         * Xem component này có phụ thuộc vào parent hay ko,
         * Nếu ko phụ thuộc vào parent thì component này sẽ đứng độc lập, position fixed, có shadow
         */
        sticky: {
            type: Boolean,
            default: false
        },
        isViewKanban: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        columnFilter: {
            deep: true,
            immediate: true,
            handler(newVl) {
                let rsl = util.cloneDeep(newVl);
                let oldSearchKey = this.filterConfigs
                    ? this.filterConfigs.searchKey
                    : '';
                if (newVl.resetSearchKey) {
                    oldSearchKey = '';
                    delete newVl.resetSearchKey;
                }
                this.filterConfigs = null;
                this.filterConfigs = rsl;
                if (
                    this.filterConfigs.searchLocal &&
                    !newVl.notResetFullOptions
                ) {
                    this.filterConfigs.fullOptions =
                        this.filterConfigs.selectItems;
                }
                this.filterConfigs.searchKey = oldSearchKey;
                if (this.hideOptions) {
                    this.filterConfigs.searchKey = '';
                }
            }
        }
    },
    computed: {
        // kiểu dữ liệu của cột hiện tại đang được filter
        colType() {
            return this.columnFilter.dataType;
        },
        showFilterBySelection() {
            if (!this.numericTypeHideSelection) {
                return true;
            } else {
                let type = this.columnFilter.dataType;
                return type != 'number' && type != 'numeric';
            }
        }
    }
};
</script>

<style scoped>
.symper-table-filter-container {
    z-index: 8;
    background-color: white;
    padding: 5px 10px 5px 10px;
    font-size: 13px;
    font-family: 'Roboto', sans-serif;
    border-radius: 8px;
}
.symper-table-filter-container .symper-drag-panel-header {
    height: 8px;
}
.symper-table-filter-container .symper-drag-panel-header:hover {
    cursor: move;
}
.symper-table-filter-container
    >>> .theme--light.v-input--selection-controls.v-input--is-disabled:not(.v-input--indeterminate)
    .v-icon {
    color: rgb(48 89 255 / 50%) !important;
}
</style>

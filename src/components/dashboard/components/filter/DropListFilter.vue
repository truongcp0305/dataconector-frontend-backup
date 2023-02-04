<template>
    <div
        class="w-100 h-100 mt-2 report-select-filter"
        style="position: relative"
    >
        <v-menu
            transition="slide-x-transition"
            v-model="showMenu"
            bottom
            :max-width="250"
            right
            :close-on-content-click="false"
        >
            <template v-slot:activator="{ on, attrs }">
                <div
                    class="d-flex pt-1"
                    style="
                        background-color: #f9f9f9;
                        width: calc(100% - 8px);
                        margin-left: 4px;
                        height: 28px;
                        border-radius: 4px;
                    "
                    :style="styleString"
                    v-bind="attrs"
                    v-on="on"
                >
                    <span
                        v-if="
                            !cellConfigs.rawConfigs.style.title.children.show
                                .value
                        "
                        class="mr-1"
                    >
                        {{
                            cellConfigs.rawConfigs.style.title.children
                                .titleText.value
                        }}
                    </span>
                    <div class="text-ellipsis flex-grow-1 pl-2">
                        {{ titleDroplist }}
                    </div>
                    <v-tooltip
                        bottom
                        v-if="
                            listDataSelected.length &&
                            listDataSelected.length < dataDropListFilter.length
                        "
                    >
                        <template v-slot:activator="{ on }">
                            <span v-on="on">
                                ({{ listDataSelected.length }})
                            </span>
                        </template>
                        <span>{{ titleDroplist }}</span>
                    </v-tooltip>
                    <i class="mdi mdi-chevron-down fs-16 grey--text px-1"></i>
                </div>
            </template>
            <div class="bg-white" :style="{ width: '250px' }">
                <div class="d-flex flex-column px-3 py-2 fs-13">
                    <div class="mb-1">
                        {{
                            cellConfigs.rawConfigs.style.title.children
                                .titleText.value
                        }}
                    </div>
                    <SearchBox
                        :searchBoxId="cellId"
                        ref="searchBox"
                        :searchBlank="true"
                        :placeholder="$t('common.enter_to_search')"
                        @search-input-change="searchValue"
                    />
                    <VuePerfectScrollbar
                        :suppressScrollX="true"
                        class="mt-2"
                        style="max-height: 300px; margin-right: -7px"
                    >
                        <div
                            v-for="(item, i) in dataDropListFilter"
                            :key="i"
                            class="d-flex pa-1 drop-list-filter__item"
                            @click="chooseItem(item)"
                        >
                            <input
                                @click.stop
                                type="checkbox"
                                class="mt-1"
                                :value="item[selectedCol.as]"
                                :checked="
                                    listDataSelected.includes(
                                        item[selectedCol.as]
                                    )
                                "
                                @change="chooseItem(item)"
                            />
                            <div
                                :title="item[selectedCol.as]"
                                class="flex-grow-1 ml-2 text-ellipsis"
                            >
                                {{ item[selectedCol.as] }}
                            </div>
                            <div
                                class="drop-list-filter__item__quick-choose mx-1"
                                @click.stop="quickChoose(item)"
                            >
                                {{ $t('common.select') }} 1
                            </div>
                        </div>
                    </VuePerfectScrollbar>
                </div>
            </div>
        </v-menu>
    </div>
</template>
<script>
import SearchBox from '@/components/common/SearchBox';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { util } from '@/plugins/util';

export default {
    components: {
        SearchBox,
        VuePerfectScrollbar
    },
    created() {
        this.listDataSelected = this.selectedItems;
        if (this.selectedItems && this.selectedItems.length > 0) {
            this.listDataSelected = this.selectedItems[0].cond.val.split(',');
        }
        this.setTitleDroplist();
        this.$evtBus.$on(
            'dashboard-set-value-filter',
            (selectedItem, filterId) => {
                if (filterId == this.cellId) {
                    if (selectedItem.length > 0) {
                        this.listDataSelected =
                            selectedItem[0].cond.val.split(',');
                    } else {
                        this.listDataSelected = [];
                    }
                }
                this.setTitleDroplist();
            }
        );
        this.$evtBus.$on(
            'dashboard-clear-selected-item',
            (instanceKey, cellId) => {
                if (instanceKey == this.instanceKey && cellId == this.cellId)
                    this.listDataSelected = [];
            }
        );
    },
    data() {
        return {
            selectedValues: [],
            loading: false,
            searchKey: '',
            flagAutoSearchKey: false,
            closeOnContentClick: false,
            listDataSelected: [],
            titleDroplist: '',
            showMenu: false
        };
    },
    watch: {
        showMenu(val) {
            if (!val) {
                this.handleBlurFilter();
                this.setTitleDroplist();
            } else {
                setTimeout(
                    (self) => {
                        self.$refs.searchBox.focus();
                    },
                    500,
                    this
                );
                this.handleFocusFilter();
            }
        },
        data: {
            deep: true,
            immediate: true,
            handler(arr) {
                this.loading = false;
            }
        },
        listDataSelected: {
            deep: true,
            handler(newVl) {
                if (newVl.length == 0) {
                    this.setTitleDroplist();
                }
            }
        }
    },
    computed: {
        dataDropListFilter() {
            let data = util.cloneDeep(this.data);
            if (this.selectionType != 'single') {
                let obj = {};
                obj[this.selectedCol.as] = this.$t('common.select_all');
                data.unshift(obj);
            }
            return data;
        }
    },
    methods: {
        setTitleDroplist() {
            let arr = this.listDataSelected;
            if (arr.length) {
                let allText = Object.values(this.dataDropListFilter[0])[0];
                this.titleDroplist = arr.includes(allText)
                    ? allText
                    : arr.join(', ');
            } else {
                this.titleDroplist = '';
            }
        },
        searchValue(query) {
            let self = this;
            self.$emit('change-query-drop-list-filter', {
                cellId: self.cellId,
                query: query
            });
        },
        quickChoose(item) {
            let value = item[this.selectedCol.as];
            if (value != 'Chọn tất cả') {
                this.listDataSelected = [];
                this.listDataSelected.push(value);
            }
            this.handleChangeFilterValue(this.listDataSelected);
            this.needApplyFilter = true;
            this.showMenu = false;
        },
        chooseItem(item) {
            let self = this;
            let value = item[this.selectedCol.as];
            if (this.selectionType == 'single') {
                self.listDataSelected = [value];
            } else {
                if (value == 'Chọn tất cả') {
                    let flag = true;
                    if (
                        self.listDataSelected.length ==
                        this.dataDropListFilter.length
                    ) {
                        flag = false;
                    }
                    self.listDataSelected = [];
                    if (flag) {
                        self.listDataSelected.push(value);
                        this.data.forEach(function (e) {
                            self.listDataSelected.push(e[self.selectedCol.as]);
                        });
                    }
                } else {
                    if (!this.listDataSelected.includes(value)) {
                        this.listDataSelected.push(value);
                    } else {
                        this.listDataSelected.splice(
                            this.listDataSelected.indexOf(value),
                            1
                        );
                    }
                    if (
                        this.listDataSelected.length ==
                            this.dataDropListFilter.length - 1 &&
                        this.listDataSelected[0] != 'Chọn tất cả'
                    ) {
                        this.listDataSelected.unshift('Chọn tất cả');
                    } else {
                        if (this.listDataSelected[0] == 'Chọn tất cả') {
                            this.listDataSelected.shift();
                        }
                    }
                }
            }
            this.handleChangeFilterValue(this.listDataSelected);
        },
        handleFocusFilter() {
            let self = this;
            setTimeout(() => {
                if (self.cellConfigs.sharedConfigs.penddingLoadData) {
                    for (let item of self.data) {
                        item.disabled = true;
                    }
                    self.$evtBus.$emit('bi-report-change-display', {
                        type: 'data',
                        id: self.cellId,
                        instanceKey: self.instanceKey
                    });
                }
                self.cellConfigs.sharedConfigs.penddingLoadData = false;
            }, 100);
        },
        handleKeydown() {
            this.flagAutoSearchKey = false;
        },
        clearFilteredValues() {
            this.$set(this.cellView, 'selectedValues', {});
            this.selectedValues = [];
            this.listDataSelected = [];
        },
        handleChangeFilterValue(values) {
            let vals = util.cloneDeep(values);
            if (values[0] && values[0] == 'Chọn tất cả') {
                vals.shift();
            }

            this.searchKey = '';
            this.flagAutoSearchKey = true;
            if (typeof vals == 'string') {
                vals = [vals];
            }
            for (let i in this.cellView.selectedValues) {
                delete this.cellView.selectedValues[i];
            }

            for (let vl of vals) {
                this.cellView.selectedValues[vl] = true;
            }
            this.needApplyFilter = true;
            // this.$store.state.dashboard.allDashboard[
            //     this.instanceKey
            // ].dashboardConfigs.allCellConfigs.global.viewConfigs.loadingData = true;
        },
        handleBlurFilter() {
            if (this.needApplyFilter) {
                this.$emit('change-droplist-filter-value', this.cellId);
                this.needApplyFilter = false;
            }
        }
    },
    mounted() {
        this.cellConfigs.viewConfigs.customLoading = true;
    },
    props: [
        'selectedItems',
        'data',
        'selectionType',
        'selectedCol',
        'cellId',
        'cellView',
        'instanceKey',
        'cellConfigs',
        'styleString'
    ]
};
</script>
<style scoped>
.report-select-filter >>> .v-text-field__details {
    display: none !important;
}
.report-select-filter >>> .v-input__control {
    min-height: unset !important;
}
.report-select-filter >>> .v-input__slot {
    box-shadow: unset !important;
    border: 1px solid lightgray;
    border-radius: 4px;
    height: 28px;
}
.report-select-filter >>> .v-select__selections {
    flex-wrap: unset !important;
    white-space: nowrap;
    width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
}
.report-select-filter >>> .v-input__icon {
    display: none !important;
}

.v-menu__content >>> .v-icon {
    font-size: 16px !important;
}
</style>
<style>
.v-list-item {
    min-height: unset;
}
.v-list-item__title {
    font-size: 13px;
}
.v-list-item__action {
    margin: unset;
}
.v-list .v-list-item .v-list-item__action {
    margin-right: 10px;
}
.v-simple-checkbox .v-icon {
    font-size: 16px;
}
.report-select-filter * {
    font-size: 13px !important;
}

.report-select-filter .v-input__slot {
    padding-left: 8px !important;
    padding-right: 8px !important;
}

.report-select-filter:not(.v-input--is-focused)
    .v-select__selection.v-select__selection--comma {
    display: contents;
}

.report-select-filter .v-text-field__suffix {
    position: relative;
    left: 6px;
    color: rgb(151, 151, 151);
}

.report-select-filter
    .report-filter.v-input--is-focused
    .v-select__selection.v-select__selection--comma {
    display: none !important;
}
.drop-list-filter__item {
    cursor: pointer;
}

.drop-list-filter__item:hover .drop-list-filter__item__quick-choose {
    display: inline-block;
}

.drop-list-filter__item .drop-list-filter__item__quick-choose {
    display: none;
    color: #f58634;
    cursor: pointer;
    white-space: nowrap;
}
</style>

<template>
    <div class="pl-1 pr-1" v-if="displayOptions.selectionMode == 'default'">
        <date-filter
            ref="date-filter"
            @change-filter-value="handleChangeDateFilter"
            :selectedItems="selectedItems"
            :data="displayOptions.data"
            :selectionType="displayOptions.selectionType"
            :selectedCol="selectedCol"
            :styleString="styleString"
            :cellId="cellConfigs.sharedConfigs.cellId"
            :instanceKey="instanceKey"
            :cellView="cellConfigs.viewConfigs"
            v-if="useDatePicker()"
        >
        </date-filter>
        <VuePerfectScrollbar
            v-else-if="selectedCol.type != 'number'"
            :style="{ height: menuItemsHeight }"
        >
            <select-filter
                ref="select-filter"
                @change-filter-value="handleChangeFilterValue"
                :data="displayOptions.data"
                :styleString="styleString"
                :instanceKey="instanceKey"
                :selectionType="displayOptions.selectionType"
                :selectedCol="selectedCol"
                :cellId="cellConfigs.sharedConfigs.cellId"
                :cellView="cellConfigs.viewConfigs"
            >
            </select-filter>
        </VuePerfectScrollbar>

        <number-filter v-else ref="number-filter" :cellConfigs="cellConfigs" />
    </div>
    <div v-else-if="displayOptions.selectionMode == 'dropList'">
        <drop-list-filter
            :selectedItems="selectedItems"
            ref="drop-list-filter"
            @change-droplist-filter-value="handleChangeFilterValue"
            @change-query-drop-list-filter="handleChangeQuery"
            :data="displayOptions.data"
            :styleString="styleString"
            :selectedCol="selectedCol"
            :cellId="cellConfigs.sharedConfigs.cellId"
            :cellView="cellConfigs.viewConfigs"
            :selectionType="displayOptions.selectionType"
            :cellConfigs="cellConfigs"
            :instanceKey="instanceKey"
        >
        </drop-list-filter>
    </div>
</template>
<script>
import SelectFilter from '@/components/dashboard/components/filter/SelectFilter';
import SliderFilter from '@/components/dashboard/components/filter/SliderFilter';
import HorizontalFilter from '@/components/dashboard/components/filter/HorizontalFilter';
import DateFilter from '@/components/dashboard/components/filter/DateFilter';
import DropListFilter from '@/components/dashboard/components/filter/DropListFilter';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import NumberFilter from '../filter/NumberFilter.vue';

export default {
    props: {
        selectedItems: {
            default() {
                return [];
            }
        },
        cellConfigs: {
            default() {
                return {};
            }
        },
        instanceKey: {
            default: ''
        }
    },
    methods: {
        useDatePicker() {
            return this.selectedCol.type == 'date';
        },
        handleChangeDateFilter(dates, cellId) {
            this.cellConfigs.viewConfigs.displayOptions.data.value = dates;
            this.handleChangeFilterValue(cellId);
        },
        handleChangeFilterValue(cellId) {
            this.$evtBus.$emit('bi-report-change-display', {
                id: cellId,
                type: 'filter',
                instanceKey: this.instanceKey
            });
        },
        handleChangeQuery(data) {
            this.cellConfigs.sharedConfigs.queryKey = data.query;
            this.$evtBus.$emit('bi-report-change-display', {
                id: data.cellId,
                type: 'autocomplete',
                instanceKey: this.instanceKey
            });
        },
        customCssForFilter() {
            this.customBoxSearchBorder();
            // can do something more here
        },
        customBoxSearchBorder() {
            let borderConfigs =
                this.cellConfigs.rawConfigs.style.boxSearchBorder;
            this.styleString = `border-style: solid;border-width: ${borderConfigs.children.borderWidth.value}px;border-color: ${borderConfigs.children.borderColor.value}`;
        }
    },
    created() {
        if (this.cellConfigs.viewConfigs.displayOptions.size) {
            this.menuItemsHeight =
                this.cellConfigs.viewConfigs.displayOptions.size.h + 'px';
        }
    },
    watch: {
        'cellConfigs.viewConfigs.displayOptions.size.h'(val) {
            this.menuItemsHeight = val + 'px';
        },
        'cellConfigs.rawConfigs.style.boxSearchBorder': {
            deep: true,
            immediate: true,
            handler(arr) {
                this.customBoxSearchBorder();
            }
        }
    },
    mounted() {
        let self = this;
        this.$evtBus.$on('dashboard-clear-filter-cell', (data) => {
            let thisCellId = self.cellConfigs.sharedConfigs.cellId;
            if (thisCellId == data.cellId) {
                let refInstance = null;
                let refsKeys = [
                    'number-filter',
                    'date-filter',
                    'drop-list-filter',
                    'select-filter'
                ];
                for (let key of refsKeys) {
                    if (self.$refs[key]) {
                        refInstance = self.$refs[key];
                        break;
                    }
                }
                if (refInstance) {
                    refInstance.clearFilteredValues();
                    let dashboard =
                        self.$store.state.dashboard.allDashboard[
                            this.instanceKey
                        ];
                    delete dashboard.filter[self.cellId];
                    if (!data.preventReloadData) {
                        self.handleChangeFilterValue(thisCellId);
                    }
                }
            }
        });
    },
    computed: {
        selectedCol() {
            let col = this.cellConfigs.rawConfigs.setting.value.selectedColums;
            col = col.length > 0 ? col[0] : {};
            return col;
        },
        displayOptions() {
            return this.cellConfigs.viewConfigs.displayOptions;
        }
    },
    data() {
        return {
            menuItemsHeight: '100%',
            styleString: ''
        };
    },
    components: {
        'select-filter': SelectFilter,
        'slider-filter': SliderFilter,
        'horizontal-filter': HorizontalFilter,
        'date-filter': DateFilter,
        'drop-list-filter': DropListFilter,
        VuePerfectScrollbar,
        NumberFilter
    }
};
</script>
<style scoped>
.filter-base >>> .v-text-field__details {
    display: none !important;
}
.filter-base >>> .v-input__control {
    min-height: unset !important;
}
.filter-base >>> .v-input__slot {
    box-shadow: unset !important;
    border: 1px solid lightgray;
}
</style>

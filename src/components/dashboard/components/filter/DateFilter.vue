<template>
    <div class="fs-13 pt-1 report-date-filter mt-1">
        <v-menu
            ref="menu"
            v-model="menu"
            content-class="report-date-filter-menu"
            :close-on-content-click="false"
            :return-value.sync="dataValue.value"
            transition="scale-transition"
            offset-y
            min-width="290px"
        >
            <template v-slot:activator="{ on, attrs }">
                <div ref="styleTag"></div>
                <v-combobox
                    v-model="dateRangeText"
                    solo
                    readonly
                    v-bind="attrs"
                    v-on="on"
                >
                </v-combobox>
            </template>
            <div
                class="d-flex flex-column"
                style="background-color: #ffffff; z-index: 100000"
            >
                <div class="d-flex">
                    <div style="border-right: 1px solid lightgray" class="mt-2">
                        <div
                            v-for="(item, i) in pickerOptions.shortcuts"
                            :key="i"
                        >
                            <span
                                class="fs-13 ml-2 mt-2 mr-4 picker-option-title"
                                @click="item.onClick()"
                            >
                                {{ item.text }}
                            </span>
                        </div>
                    </div>
                    <div class="d-flex mt-2">
                        <div class="d-flex flex-column">
                            <div
                                class="d-flex align-center mx-1 justify-content-center"
                                style="background-color: #e0e0e0"
                            >
                                <span
                                    class="fs-13 py-1"
                                    style="
                                        margin-left: auto;
                                        margin-right: auto;
                                    "
                                    >{{ $t('common.startDay') }}</span
                                >
                            </div>
                            <v-date-picker
                                no-title
                                scrollable
                                v-model="startDate"
                            >
                            </v-date-picker>
                        </div>
                        <div
                            class="d-flex flex-column"
                            style="border-left: 1px solid lightgray"
                        >
                            <div
                                class="d-flex mx-1 justify-content-center"
                                style="background-color: #e0e0e0"
                            >
                                <span
                                    class="fs-13 py-1"
                                    style="
                                        margin-left: auto;
                                        margin-right: auto;
                                    "
                                    >{{ $t('common.endDay') }}</span
                                >
                            </div>
                            <v-date-picker
                                no-title
                                scrollable
                                v-model="endDate"
                            >
                            </v-date-picker>
                        </div>
                    </div>
                </div>
                <div class="d-flex flex-row-reverse mr-2 mb-2 mt-2">
                    <v-btn
                        small
                        color="primary"
                        class="ml-2"
                        @click="applyFilter"
                    >
                        {{ $t('common.apply') }}
                    </v-btn>
                    <v-btn small @click="cancel">
                        {{ $t('common.cancel') }}
                    </v-btn>
                </div>
            </div>
        </v-menu>
    </div>
</template>
<script>
export default {
    computed: {
        dataValue() {
            if (this.data.value) {
                return this.data;
            } else {
                let today = new Date().toISOString().slice(0, 10);
                return {
                    value: [today, today],
                    max: today,
                    min: today
                };
            }
        },
        dateRangeText() {
            return this.startDate + ' ~ ' + this.endDate;
        }
    },
    created() {
        let self = this;
        this.endDate = this.data.max;
        this.startDate = this.data.min;
        this.dates = [this.startDate, this.endDate];
        if (this.selectedItems && this.selectedItems.length > 0) {
            this.startDate = this.selectedItems[0].cond.val;
            this.endDate = this.selectedItems[1].cond.val;
            this.dates = [this.startDate, this.endDate];
        }
        this.$evtBus.$on('dashboard-set-value-filter', (values, filterId) => {
            if (filterId == this.cellId) {
                if (values.length > 0) {
                    self.startDate = values[0].cond.val;
                    self.endDate = values[1].cond.val;
                    self.dates = [self.startDate, self.endDate];
                } else {
                    if (self.data.min != null && self.data.max != null) {
                        self.endDate = self.data.max;
                        self.startDate = self.data.min;
                        self.dates = [self.startDate, self.endDate];
                    }
                }
            }
        });
    },
    watch: {
        dateRange(newVal) {
            this.$evtBus.$emit(
                'dashboard-date-filter-change-keywords',
                this.instanceKey,
                this.cellId,
                newVal
            );
        },
        styleString() {
            this.customBorderStyle();
        }
    },
    methods: {
        customBorderStyle() {
            let styleTag = this.$refs.styleTag;
            styleTag.innerHTML = `<style>${this.styleString}</style>`;
        },
        clearFilteredValues() {
            this.startDate = this.cellView.displayOptions.data.min;
            this.endDate = this.cellView.displayOptions.data.max;
        },
        applyFilter() {
            if (this.endDate >= this.startDate) {
                this.dateRange = '';
                this.handleChangeValue();
            } else {
                this.$snotifyError(
                    this.$t('v2.dashboard.endDateGreaterThanStartDate'),
                    this.$t('v2.dashboard.endDateGreaterThanStartDate')
                );
            }
        },
        cancel() {
            this.menu = false;
        },
        handleChangeValue() {
            this.dates = [this.startDate, this.endDate];
            this.$emit('change-filter-value', this.dates, this.cellId);
            this.cancel();
        },
        pickDateRange(start, end) {
            this.endDate = this.$moment(end).format('YYYY-MM-DD');
            this.startDate = this.$moment(start).format('YYYY-MM-DD');
            this.handleChangeValue();
        }
    },
    props: [
        'selectedItems',
        'data',
        'selectionType',
        'selectedCol',
        'cellId',
        'cellView',
        'instanceKey',
        'styleString'
    ],
    data() {
        let self = this;
        return {
            dateRange: '',
            selectAll: false,
            selectingRadioBox: -1,
            menu: false,
            startDate: '',
            endDate: '',
            dates: [],
            pickerOptions: {
                shortcuts: [
                    {
                        text: this.$t('v2.dashboard.today'),
                        onClick(picker) {
                            const start = new Date();
                            const end = new Date();
                            self.dateRange = 'today';
                            self.pickDateRange(start, end);
                        }
                    },
                    {
                        text: this.$t('v2.dashboard.yesterday'),
                        onClick(picker) {
                            const start = new Date();
                            const end = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24);
                            self.pickDateRange(start, end);
                            self.dateRange = 'yesterday';
                        }
                    },
                    {
                        text: this.$t('v2.dashboard.last7Days'),
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 7
                            );
                            self.dateRange = 'last7Days';
                            self.pickDateRange(start, end);
                        }
                    },
                    {
                        text: this.$t('v2.dashboard.last14Days'),
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 14
                            );
                            this.dateRange = 'last14Days';
                            self.pickDateRange(start, end);
                        }
                    },
                    {
                        text: this.$t('v2.dashboard.last28Days'),
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 28
                            );
                            self.dateRange = 'last28Days';
                            self.pickDateRange(start, end);
                        }
                    },
                    {
                        text: this.$t('v2.dashboard.last30Days'),
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 30
                            );
                            self.dateRange = 'last30Days';
                            self.pickDateRange(start, end);
                        }
                    }
                ]
            }
        };
    }
};
</script>
<style>
.symper-date-filter {
    width: 100% !important;
}
.symper-date-filter .el-range-separator {
    margin-right: 7px;
    position: relative;
    left: 7px;
}

.symper-date-filter .el-range-input:nth-child(4) {
    position: relative;
    left: 20px;
}
.picker-option-title {
    cursor: pointer;
    font-size: 13px !important;
}
.picker-option-title:hover {
    color: blue;
}
</style>
<style scoped>
.report-date-filter >>> .v-text-field__details {
    display: none !important;
}
.report-date-filter >>> input {
    font-size: 13px !important;
}
.report-date-filter >>> .v-input__icon {
    font-size: 14px !important;
    margin-top: -6px !important;
}
.report-date-filter >>> .v-input__control {
    min-height: unset !important;
    height: 28px !important;
}
.report-date-filter >>> .v-input__slot {
    box-shadow: unset !important;
    height: 28px !important;
}
.report-date-filter >>> .v-input__icon {
    display: none !important;
}
</style>

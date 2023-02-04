<template>
    <div class="sym-repeat">
        <div class="sym-repeat-select-type">
            <div
                :style="{ width: titleWidth, 'vertical-align': 'top' }"
                class="title-form"
            >
                <span>{{ $t('v2.general.repeatConfig') }}</span>
            </div>
            <v-select
                class="symper-custom-select"
                :items="listType"
                v-model="selectedType"
                return-object
                hide-details
                item-value="type"
                item-text="name"
                dense
                :style="{
                    width: '150px',
                    display: 'inline-block',
                    'font-weight': '500',
                    'font-size': '13px',
                    padding: '4px 8px',
                    'border-radius': '3px',
                    'background-color': '#F7F7F7',
                    'vertical-align': 'top'
                }"
            ></v-select>
            <div class="btn-review-repeat">
                <button v-on:click="previewRepeatTime">
                    <v-icon>mdi-calendar-check</v-icon>
                </button>
                <div
                    class="calendar-review-repeat"
                    :style="{
                        display: isShowPreviewTime ? 'block' : 'none'
                    }"
                >
                    <v-card
                        style="
                            top: 250px !important;
                            background-color: white !important;
                            z-index: 100;
                        "
                    >
                        <h4 style="padding: 6px 12px">
                            {{ $t('v2.general.selectDateTime') }}
                        </h4>
                        <v-divider></v-divider>
                        <v-date-picker
                            v-model="date"
                            no-title
                            :events="arrayEvents"
                            event-color="green lighten-1"
                            style="box-shadow: none"
                        ></v-date-picker>
                    </v-card>
                </div>
            </div>
            <!-- minutes -->
            <div v-if="selectedType.type == 'secondly'" class="mt-4">
                <!-- <div class="w-100 ml-4">
                    <v-checkbox 
                        dense
                        :disabled="disabled"
                        v-model="allMinutes"
                        label="Mỗi phút"
                        color="success darken-3">
                    </v-checkbox>
               </div> -->
                <v-checkbox
                    v-show="!allMinutes"
                    dense
                    :disabled="disabled"
                    v-for="min in minutes"
                    :key="min.key"
                    class="ml-4"
                    v-model="min.value"
                    style="float: left; margin-top: -15px; margin-left: -10px"
                    :label="`${min.name}`"
                    color="success darken-3"
                >
                    <template> </template>
                </v-checkbox>
            </div>
            <!-- minutes -->
            <div v-if="selectedType.type == 'hourly'" class="mt-4">
                <div class="w-100 ml-4">
                    <v-checkbox
                        dense
                        :disabled="disabled"
                        v-model="allHour"
                        :label="$t('v2.general.everyHour')"
                        color="success darken-3"
                    >
                    </v-checkbox>
                </div>
                <v-checkbox
                    class="ml-4"
                    v-show="!allHour"
                    style="float: left; margin-top: -15px; margin-left: -10px"
                    :key="hour.key"
                    :disabled="disabled"
                    v-for="hour in hour"
                    v-model="hour.value"
                    :label="`${hour.name}`"
                    color="success darken-3"
                >
                </v-checkbox>
            </div>
        </div>
        <div class="sym-repeat-body">
            <div
                v-if="selectedType.type == 'daily' && !checkNoLoop"
                class="sym-repeat-daily"
            >
                <div :style="{ width: titleWidth }" class="title-form">
                    <span>{{ $t('v2.general.every') }}</span>
                </div>
                <div
                    :style="{
                        width: '150px',
                        display: 'inline-block',
                        'font-size': '13px',
                        'border-radius': '3px',
                        border: 'none',
                        'background-color': '#F7F7F7'
                    }"
                >
                    <input
                        v-model="selectedType.times"
                        type="number"
                        :style="{ height: '30px', padding: '8px' }"
                    />
                </div>
                <span class="title-form" style="margin-left: 16px">{{
                    $t('v2.general.day')
                }}</span>
            </div>
            <div
                class="sym-repeat-weekly"
                v-if="selectedType.type == 'weekly' && !checkNoLoop"
            >
                <div class="form-select-week">
                    <div :style="{ width: titleWidth }" class="title-form">
                        <span>{{ $t('v2.general.on') }}</span>
                    </div>
                    <div class="weeks">
                        <ul>
                            <li
                                v-for="day in dayOfWeek"
                                :key="day.name"
                                @click="selectDayOfWeek(day)"
                                :class="{
                                    week: true,
                                    'active-day-of-week': day.active
                                }"
                                :data-w="day.value"
                            >
                                {{ day.name }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div
                class="sym-repeat-monthly"
                v-if="selectedType.type == 'monthly' && !checkNoLoop"
            >
                <div class="form-select-month">
                    <div :style="{ width: titleWidth }" class="title-form">
                        <span>{{ $t('v2.general.onDay') }}</span>
                    </div>

                    <div class="month">
                        <ul
                            :style="{
                                opacity: !onDayOfMonth ? 0.3 : 1,
                                'pointer-events': !onDayOfMonth
                                    ? 'none'
                                    : 'auto'
                            }"
                        >
                            <li
                                v-for="item in dayNumberOfMonth"
                                :key="item.name"
                                v-on:click="selectDayOfMonth(item)"
                                :data-m="item.value"
                                :class="{
                                    day: true,
                                    'active-day-of-week': item.active
                                }"
                            >
                                {{ item.value }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div
                class="sym-repeat-yearly"
                v-if="selectedType.type == 'yearly' && !checkNoLoop"
            >
                <div class="form-select-month-of-year">
                    <div :style="{ width: titleWidth }" class="title-form">
                        <span>{{ $t('v2.general.inMonth') }}</span>
                    </div>

                    <div class="month" style="width: 200px">
                        <ul>
                            <li
                                v-for="month in selectMonthsOfYear"
                                :key="month.name"
                                v-on:click="selectMonthOfYear($event, month)"
                                :data-y="month.value"
                                :class="{
                                    'month-item': true,
                                    'active-month-of-year': month.active
                                }"
                            >
                                {{ month.name }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        cronTab: {
            type: String,
            default: '* * * * *'
        },

        position: {
            type: Object,
            default() {
                return {
                    top: 0,
                    left: '35px'
                };
            }
        },
        titleWidth: {
            type: String,
            default: '160px'
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    created() {
        this.generateMinutes();
        this.generateHour();
        let thisCpn = this;
        this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
            if (
                !$(evt.target).hasClass('calendar-review-repeat') &&
                $(evt.target).closest('.calendar-review-repeat').length == 0 &&
                !$(evt.target).hasClass('btn-review-repeat') &&
                $(evt.target).closest('.btn-review-repeat').length == 0
            ) {
                thisCpn.isShowPreviewTime = false;
            }
        });
    },
    data() {
        return {
            thOfMonth: 1,
            dOM: 1,
            minutes: [],
            crobTabValue: ['*', '*', '*', '*', '*'],
            hour: [],
            allMinutes: false,
            allHour: false,
            date: new Date().toISOString().substr(0, 10),
            selectedType: {
                name: this.$t('v2.general.secondly'),
                type: 'secondly',
                times: 1
            },
            listType: [
                {
                    name: this.$t('v2.general.secondly'),
                    type: 'secondly',
                    times: 1
                },
                {
                    name: this.$t('v2.general.hourly'),
                    type: 'hourly',
                    times: 1
                },
                {
                    name: this.$t('v2.general.weekly'),
                    type: 'weekly',
                    times: 1
                },
                {
                    name: this.$t('v2.general.monthly'),
                    type: 'monthly',
                    times: 1
                },
                {
                    name: this.$t('v2.general.yearly'),
                    type: 'yearly',
                    times: 1
                }
            ],
            checkNoLoop: false,
            onDayOfMonth: true,
            onFastDayOfMonth: false,
            repeatYearAdvance: false,
            listDayNumber: [],
            dayOfWeek: [
                {
                    name: this.$t('v2.general.monday'),
                    value: '0',
                    active: false
                },
                {
                    name: this.$t('v2.general.tuesday'),
                    value: '1',
                    active: false
                },
                {
                    name: this.$t('v2.general.wednesday'),
                    value: '2',
                    active: false
                },
                {
                    name: this.$t('v2.general.thursday'),
                    value: '3',
                    active: false
                },
                {
                    name: this.$t('v2.general.friday'),
                    value: '4',
                    active: false
                },
                {
                    name: this.$t('v2.general.saturday'),
                    value: '5',
                    active: false
                },
                {
                    name: this.$t('v2.general.sunday'),
                    value: '6',
                    active: false
                }
            ],
            dayNumberOfMonth: [
                {
                    value: 1,
                    active: false,
                    name: this.$t('v2.general.day1')
                },
                {
                    value: 2,
                    active: false,
                    name: this.$t('v2.general.day2')
                },
                {
                    value: 3,
                    active: false,
                    name: this.$t('v2.general.day3')
                },
                {
                    value: 4,
                    active: false,
                    name: this.$t('v2.general.day4')
                },
                {
                    value: 5,
                    active: false,
                    name: this.$t('v2.general.day5')
                },
                {
                    value: 6,
                    active: false,
                    name: this.$t('v2.general.day6')
                },
                {
                    value: 7,
                    active: false,
                    name: this.$t('v2.general.day7')
                },
                {
                    value: 8,
                    active: false,
                    name: this.$t('v2.general.day8')
                },
                {
                    value: 9,
                    active: false,
                    name: this.$t('v2.general.day9')
                },
                {
                    value: 10,
                    active: false,
                    name: this.$t('v2.general.day10')
                },
                {
                    value: 11,
                    active: false,
                    name: this.$t('v2.general.day11')
                },
                {
                    value: 12,
                    active: false,
                    name: this.$t('v2.general.day12')
                },
                {
                    value: 13,
                    active: false,
                    name: this.$t('v2.general.day13')
                },
                {
                    value: 14,
                    active: false,
                    name: this.$t('v2.general.day14')
                },
                {
                    value: 15,
                    active: false,
                    name: this.$t('v2.general.day15')
                },
                {
                    value: 16,
                    active: false,
                    name: this.$t('v2.general.day16')
                },
                {
                    value: 17,
                    active: false,
                    name: this.$t('v2.general.day17')
                },
                {
                    value: 18,
                    active: false,
                    name: this.$t('v2.general.day18')
                },
                {
                    value: 19,
                    active: false,
                    name: this.$t('v2.general.day19')
                },
                {
                    value: 20,
                    active: false,
                    name: this.$t('v2.general.day20')
                },
                {
                    value: 21,
                    active: false,
                    name: this.$t('v2.general.day21')
                },
                {
                    value: 22,
                    active: false,
                    name: this.$t('v2.general.day22')
                },
                {
                    value: 23,
                    active: false,
                    name: this.$t('v2.general.day23')
                },
                {
                    value: 24,
                    active: false,
                    name: this.$t('v2.general.day24')
                },
                {
                    value: 25,
                    active: false,
                    name: this.$t('v2.general.day25')
                },
                {
                    value: 26,
                    active: false,
                    name: this.$t('v2.general.day26')
                },
                {
                    value: 27,
                    active: false,
                    name: this.$t('v2.general.day27')
                },
                {
                    value: 28,
                    active: false,
                    name: this.$t('v2.general.day28')
                },
                {
                    value: 29,
                    active: false,
                    name: this.$t('v2.general.day29')
                },
                {
                    value: 30,
                    active: false,
                    name: this.$t('v2.general.day30')
                },
                {
                    value: 31,
                    active: false,
                    name: this.$t('v2.general.day31')
                }
            ],
            selectMonthsOfYear: [
                {
                    name: this.$t('v2.general.january'),
                    value: '1',
                    active: false
                },
                {
                    name: this.$t('v2.general.february'),
                    value: '2',
                    active: false
                },
                {
                    name: this.$t('v2.general.march'),
                    value: '3',
                    active: false
                },
                {
                    name: this.$t('v2.general.aprial'),
                    value: '4',
                    active: false
                },
                {
                    name: this.$t('v2.general.may'),
                    value: '5',
                    active: false
                },
                {
                    name: this.$t('v2.general.jun'),
                    value: '6',
                    active: false
                },
                {
                    name: this.$t('v2.general.july'),
                    value: '7',
                    active: false
                },
                {
                    name: this.$t('v2.general.august'),
                    value: '8',
                    active: false
                },
                {
                    name: this.$t('v2.general.september'),
                    value: '9',
                    active: false
                },
                {
                    name: this.$t('v2.general.october'),
                    value: '10',
                    active: false
                },
                {
                    name: this.$t('v2.general.november'),
                    value: '11',
                    active: false
                },
                {
                    name: this.$t('v2.general.december'),
                    value: '12',
                    active: false
                }
            ],
            isShowPreviewTime: false,
            arrayEvents: null
        };
    },
    watch: {
        selectMonthsOfYear: {
            deep: true,
            immediate: true,
            handler(newValue) {
                let dateSelected = '';
                for (let day of newValue) {
                    if (day.active) {
                        dateSelected += day.name + ',';
                    }
                }
                if (dateSelected) {
                    this.crobTabValue[3] = dateSelected.substring(
                        0,
                        dateSelected.length - 1
                    );
                    this.$emit('value', this.crobTabValue);
                }
            }
        },
        dayNumberOfMonth: {
            deep: true,
            immediate: true,
            handler(newValue) {
                let dateSelected = '';
                for (let day of newValue) {
                    if (day.active) {
                        dateSelected += day.value + ',';
                    }
                }
                if (dateSelected) {
                    this.crobTabValue[2] = dateSelected.substring(
                        0,
                        dateSelected.length - 1
                    );
                    this.$emit('value', this.crobTabValue);
                }
            }
        },
        selectDayOfMonthItem: {
            deep: true,
            immediate: true,
            handler(newValue) {
                this.$emit('value', this.crobTabValue);
            }
        },
        dayOfWeek: {
            deep: true,
            immediate: true,
            handler(newValue) {
                let dateSelected = '';
                for (let day of newValue) {
                    if (day.active) {
                        dateSelected += day.name + ',';
                    }
                }
                if (dateSelected) {
                    this.crobTabValue[4] = dateSelected.substring(
                        0,
                        dateSelected.length - 1
                    );
                    this.$emit('value', this.crobTabValue);
                }
            }
        },
        allHour() {
            let crontab = '0 * * * *';
            this.crobTabValue = crontab.split(' ');
            this.$emit('value', this.crobTabValue);
            this.hour.map((m, i) => (this.hour[i].value = false));
        },
        allMinutes() {
            if (this.allMinutes) {
                let crontab = '* * * * *';
                this.crobTabValue = crontab.split(' ');
                this.$emit('value', this.crobTabValue);
                this.minutes.map((m, i) => (this.minutes[i].value = false));
            }
        },
        cronTab: {
            deep: true,
            immediate: true,
            handler(value) {
                this.generateMinutes();
                this.generateHour();
                this.setOldData(value);
            }
        },
        selectedType: {
            deep: true,
            immediate: true,
            handler(newValue) {
                if (newValue.type == 'daily') {
                    let day = this.$moment().format('d');
                    this.crobTabValue[5] = day + '/' + newValue.times;
                    this.$emit('value', this.crobTabValue);
                }
            }
        },
        minutes: {
            deep: true,
            immediate: true,
            handler(newValue) {
                let value = [];
                for (let i = 0; i < newValue.length; i++) {
                    if (newValue[i].value) {
                        value.push(Number(newValue[i].name));
                    }
                }
                if (value.length > 0) {
                    this.crobTabValue[0] = value.join(',');
                    this.$emit('value', this.crobTabValue);
                }
            }
        },
        hour: {
            deep: true,
            immediate: true,
            handler(newValue) {
                let value = '';
                for (let i = 0; i < newValue.length; i++) {
                    if (newValue[i].value) {
                        value += Number(newValue[i].name) + ',';
                    }
                }
                if (value) {
                    if (this.crobTabValue[0] == '*') this.crobTabValue = '0';
                    this.crobTabValue[1] = value.substring(0, value.length - 1);
                    this.$emit('value', this.crobTabValue);
                }
            }
        },
        onDayOfMonth() {
            this.onFastDayOfMonth = !this.onDayOfMonth;
        },
        onFastDayOfMonth() {
            this.onDayOfMonth = !this.onFastDayOfMonth;
        }
    },
    beforeMount() {},
    mounted() {
        this.arrayEvents = [...Array(6)].map(() => {
            const day = Math.floor(Math.random() * 30);
            const d = new Date();
            d.setDate(day);
            return d.toISOString().substr(0, 10);
        });
    },
    methods: {
        refreshData() {
            this.allMinutes = false;
            this.allHour = false;
            this.minutes.map((m, index) => {
                this.minutes[index].value = false;
            });
            this.hour.map((m, index) => {
                this.hour[index].value = false;
            });
            this.dayNumberOfMonth.map((m, index) => {
                this.dayNumberOfMonth[index].active = false;
            });
            this.selectMonthsOfYear.map((m, index) => {
                this.selectMonthsOfYear[index].active = false;
            });
            this.dayOfWeek.map((m, index) => {
                this.dayOfWeek[index].active = false;
            });
        },
        setOldData(cronjob) {
            if (cronjob != '' && cronjob.split(' ').length == 5) {
                this.crobTabValue = cronjob.split(' ');
                const everyHour = '0 * * * *';
                if (everyHour == cronjob) this.allHour = true;
                cronjob = cronjob.split(' ');
                const everyMinute = cronjob.every((c) => c == '*');
                if (everyMinute) this.allMinutes = true;
                let minutes = cronjob[0];
                let hour = cronjob[1];
                let dayOfMonth = cronjob[2];
                let month = cronjob[3];
                let dayOfWeek = cronjob[4];
                let listMinutes = minutes.split(',');
                let listHour = hour.split(',');
                let listDayOfMonth = dayOfMonth.split(',');
                let listMonth = month.split(',');
                let listDayOfWeek = dayOfWeek.split(',');
                if (listMinutes.length > 0) {
                    listMinutes.map((listMin) => {
                        this.minutes.map((m, index) => {
                            let name = listMin.padStart(2, '0');
                            if (name == m.name)
                                this.minutes[index].value = true;
                        });
                    });
                }
                if (listHour.length > 0) {
                    listHour.map((listH) => {
                        this.hour.map((m, index) => {
                            let name = listH.padStart(2, '0');
                            if (name == m.name) this.hour[index].value = true;
                        });
                    });
                }
                if (listDayOfMonth.length > 0) {
                    listDayOfMonth.map((listDOM) => {
                        this.dayNumberOfMonth.map((m, index) => {
                            if (listDOM == m.value)
                                this.dayNumberOfMonth[index].active = true;
                        });
                    });
                }
                if (listMonth.length > 0) {
                    listMonth.map((listDOM) => {
                        this.selectMonthsOfYear.map((m, index) => {
                            if (listDOM == m.value)
                                this.selectMonthsOfYear[index].active = true;
                        });
                    });
                }
                if (listDayOfWeek.length > 0) {
                    listDayOfWeek.map((listDOM) => {
                        this.dayOfWeek.map((m, index) => {
                            if (listDOM == m.value)
                                this.dayOfWeek[index].active = true;
                        });
                    });
                }
            } else {
                this.crobTabValue = ['*', '*', '*', '*', '*'];
                // this.refreshData()
            }
        },
        generateMinutes() {
            if (this.minutes.length == 0) {
                for (let i = 0; i < 60; i++) {
                    let name = String(i).padStart(2, '0');
                    this.minutes.push({
                        name: name,
                        key: 'minutes' + i,
                        value: false
                    });
                }
            }
        },
        generateHour() {
            if (this.hour.length == 0) {
                for (let i = 0; i < 24; i++) {
                    let name = String(i).padStart(2, '0');
                    this.hour.push({
                        name: name,
                        key: 'hour' + i,
                        value: false
                    });
                }
            }
        },
        previewRepeatTime() {
            this.arrayEvents = [];
            this.isShowPreviewTime = !this.isShowPreviewTime;
            let times = this.selectedType.times;
            if (this.selectedType.type == 'daily') {
                this.arrayEvents = [...Array(20)].map((currElement, index) => {
                    const d = new Date();
                    let curDate = d.getDate();
                    curDate = curDate + index * times;
                    d.setDate(curDate);
                    return d.toISOString().substr(0, 10);
                });
            } else if (this.selectedType.type == 'weekly') {
                let dayactive = this.dayOfWeek.filter((day) => {
                    return day.active == true;
                });
                if (dayactive.length > 0) {
                    for (let c = 0; c < 20; c++) {
                        for (let i = 0; i < dayactive.length; i++) {
                            const d = new Date();
                            let curDay = d.getDay();
                            let curDate = d.getDate();
                            let value = dayactive[i].value;
                            let date =
                                7 * c * times +
                                (curDate - curDay) +
                                (curDay - (curDay - value));
                            d.setDate(date);
                            if (c == 0) {
                                if (curDay - value <= 0) {
                                    this.arrayEvents.push(
                                        d.toISOString().substr(0, 10)
                                    );
                                }
                            } else {
                                this.arrayEvents.push(
                                    d.toISOString().substr(0, 10)
                                );
                            }
                        }
                    }
                }
            } else if (this.selectedType.type == 'monthly') {
                let dayActiveOfMonth = this.dayNumberOfMonth.filter((day) => {
                    return day.active == true;
                });
                if (dayActiveOfMonth.length > 0) {
                    for (let c = 0; c < 20; c++) {
                        for (let i = 0; i < dayActiveOfMonth.length; i++) {
                            const d = new Date();
                            let curDay = d.getDay();
                            let curDate = d.getDate();
                            let value = dayActiveOfMonth[i].value;
                            d.setDate(value);
                            d.setMonth(d.getMonth() + times * c);
                            this.arrayEvents.push(
                                d.toISOString().substr(0, 10)
                            );
                        }
                    }
                }
            } else {
                let monthActive = this.selectMonthsOfYear.filter((month) => {
                    return month.active == true;
                });
                if (monthActive.length > 0) {
                    for (let c = 0; c < 20; c++) {
                        for (let i = 0; i < monthActive.length; i++) {
                            const d = new Date();
                            let curYear = d.getFullYear();
                            let value = monthActive[i].value;
                            d.setMonth(value - 1);
                            d.setDate(1);
                            d.setFullYear(curYear + c);
                            if (this.repeatYearAdvance) {
                                let day = this.selectDayOfMonthItem.value;
                                let index = this.selectDayOfMonthItem1.value;
                                if (day == 'day') {
                                    if (index == 'last') {
                                        let dateN = this.getDaysInMonth(
                                            value,
                                            curYear + c
                                        );
                                        d.setDate(dateN);
                                    } else {
                                        d.setDate(index);
                                    }
                                } else if (day == 'weekday') {
                                    if (index == 'last') {
                                        d.setMonth(value);
                                        d.setDate(0);
                                        if (d.getDay() == 0)
                                            d.setDate(d.getDate() - 2);
                                        else if (d.getDay() == 6) {
                                            d.setDate(d.getDate() - 1);
                                        }
                                    } else {
                                        if (d.getDay() < 6 && d.getDay() > 0) {
                                            if (index <= 6 - d.getDay()) {
                                                d.setDate(parseInt(index));
                                            } else {
                                                let x = 6 - d.getDay();
                                                d.setDate(2 + parseInt(index));
                                            }
                                        } else {
                                            if (d.getDay() == 0) {
                                                d.setDate(parseInt(index) + 1);
                                            } else {
                                                d.setDate(parseInt(index) + 2);
                                            }
                                        }
                                    }
                                } else if (day == 'weekend') {
                                    if (index == 'last') {
                                        d = this.lastSundayOfMonth(
                                            curYear + c,
                                            value
                                        );
                                    } else {
                                        let curDayW = d.getDay();
                                        if (curDayW == 0) {
                                            if (parseInt(index) > 1) {
                                                if (parseInt(index) == 2) {
                                                    d.setDate(d.getDate() + 6);
                                                } else if (
                                                    parseInt(index) == 3
                                                ) {
                                                    d.setDate(d.getDate() + 7);
                                                } else {
                                                    d.setDate(d.getDate() + 13);
                                                }
                                            }
                                        } else if (curDayW == 6) {
                                            if (parseInt(index) > 1) {
                                                if (parseInt(index) == 2) {
                                                    d.setDate(d.getDate() + 1);
                                                } else {
                                                    d.setDate(
                                                        d.getDate() +
                                                            7 +
                                                            parseInt(index) -
                                                            3
                                                    );
                                                }
                                            }
                                        } else {
                                            if (
                                                parseInt(index) == 1 ||
                                                parseInt(index) == 2
                                            ) {
                                                d.setDate(
                                                    6 -
                                                        d.getDay() +
                                                        parseInt(index)
                                                );
                                            } else {
                                                d.setDate(
                                                    12 -
                                                        d.getDay() +
                                                        parseInt(index) -
                                                        1
                                                );
                                            }
                                        }
                                    }
                                } else {
                                    if (index == 'last') {
                                        d.setMonth(value);
                                        d.setDate(0);
                                        d.setDate(
                                            d.getDate() -
                                                d.getDay() -
                                                (day - 6) +
                                                1
                                        );
                                        let da = this.lastDayCustomOfMonth(
                                            curYear + c,
                                            value,
                                            day
                                        );
                                    } else {
                                        if (d.getDay() != day) {
                                            d.setDate(
                                                index * 7 -
                                                    6 -
                                                    (6 - d.getDay()) +
                                                    1
                                            );
                                        }
                                    }
                                }
                            }
                            this.arrayEvents.push(
                                d.toISOString().substr(0, 10)
                            );
                        }
                    }
                }
            }
        },
        selectDayOfWeek(item) {
            if (!this.disabled) {
                item.active = !item.active;
            }
        },
        selectDayOfMonth(item) {
            if (!this.disabled) {
                item.active = !item.active;
            }
        },
        selectMonthOfYear(event, month) {
            if (!this.disabled) {
                if (
                    $(event.target).parent().find('.active-month-of-year')
                        .length <= 1 &&
                    $(event.target).hasClass('active-month-of-year')
                ) {
                    return;
                }
                month.active = !month.active;
            }
        },
        //haoangnd: Hàm lấy thông tin của cấu hình loop
        getData() {
            let groups = {};
            if (this.selectedType.type == 'weekly') {
                let weekdays = [];
                let listDayActive = this.dayOfWeek.filter((day) => {
                    return day.active == true;
                });
                for (let index = 0; index < listDayActive.length; index++) {
                    const element = listDayActive[index];
                    weekdays.push(element.value);
                }
                groups = weekdays;
            }
            if (this.selectedType.type == 'monthly') {
                let listDays = [];
                if (this.onDayOfMonth) {
                    let listDayActive = this.dayNumberOfMonth.filter((day) => {
                        return day.active == true;
                    });
                    for (let index = 0; index < listDayActive.length; index++) {
                        const element = listDayActive[index];
                        listDays.push(element.value);
                    }
                    groups['dayOfMonth'] = listDays;
                } else {
                    let otherDay = {
                        type: this.selectDayOfMonthItem.value,
                        value: this.selectDayOfMonthItem1.value
                    };
                    groups['otherDay'] = otherDay;
                }
            }
            if (this.selectedType.type == 'yearly') {
                let listMonths = [];
                let listMonthActive = this.selectMonthsOfYear.filter((day) => {
                    return day.active == true;
                });
                for (let index = 0; index < listMonthActive.length; index++) {
                    const element = listMonthActive[index];
                    listMonths.push(element.value);
                }
                groups['monthOfyear'] = listMonths;
                if (this.repeatYearAdvance) {
                    let otherMonth = {
                        type: this.selectDayOfMonthItem.value,
                        value: this.selectDayOfMonthItem1.value
                    };
                    groups['otherMonth'] = otherMonth;
                }
            }
            return {
                isRepeat: !this.checkNoLoop,
                loopConfig: {
                    type: this.selectedType.type,
                    times: this.selectedType.times,
                    onGroup: groups
                }
            };
        },
        getDaysInMonth(month, year) {
            return new Date(year, month, 0).getDate();
        }
    }
};
</script>
<style scoped>
.symper-custom-select >>> .v-input__slot:before {
    border: none !important;
}
.symper-custom-select >>> .v-input__slot:after {
    border: none !important;
}
.title-form {
    display: inline-block;
    font-weight: 500;
    font-size: 13px;
    margin-right: 8px;
}
.form__no-loop {
    vertical-align: top;
    margin-left: 16px;
    display: inline-block;
}
.sym-repeat-body {
    margin-top: 16px;
}
.form__no-loop >>> .v-input--checkbox label {
    font-size: 13px !important;
}
.form__no-loop >>> .mdi,
.form-select-month >>> .mdi,
.form-select-month-of-year >>> .mdi {
    font-size: 16px !important;
}
input:focus {
    outline: none;
}
.weeks,
.month {
    display: inline-block;
}
.weeks ul,
.month ul {
    padding: 0;
    list-style: none;
}
.week,
.day,
.month-item {
    font-size: 13px;
    cursor: pointer;
    padding: 6px;
    margin-right: 8px;
    margin-bottom: 8px;
    text-align: center;
    height: 30px;
    background: #f7f7f7;
    border-radius: 3px;
    display: inline-block;
    transition: 300ms ease-in-out;
}
.month-item {
    width: 35px;
}
.week:hover {
    background: #d7d7d7;
}
.form-select-week,
.form-select-month,
.form-select-month-of-year {
    margin-top: 16px;
}
.active-day-of-week,
.active-month-of-year {
    background: #5ecb43 !important;
    color: white;
    font-weight: 500;
}
.month {
    width: 270px;
}

.form-select-month .title-form {
    vertical-align: top;
}
.form-select-month-of-year .title-form {
    vertical-align: top;
}
.btn-review-repeat {
    display: inline-block;
    float: right;
    margin-right: 8px;
    position: relative;
}
.calendar-review-repeat {
    position: absolute;
    right: 30px;
    bottom: 0;
}
</style>

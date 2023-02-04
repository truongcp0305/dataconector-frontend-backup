<template>
    <v-card
        class="card-datetime-picker"
        :style="position"
        v-show="isShow"
        ref="symperDateTimePicker"
    >
        <div v-if="showDate">
            <h4 class="heading">{{ title }}</h4>
            <v-divider></v-divider>
            <v-date-picker
                class="date-picker"
                :min="minDate"
                :max="maxDate"
                @click:date="dateSelected"
                v-model="date"
                no-title
            >
            </v-date-picker>
        </div>
        <div
            v-if="showTime"
            class="time-component"
            :style="{
                'margin-top': showDate ? '-6px' : '12px'
            }"
        >
            <span> {{ $t('common.hour') }}:</span>
            <input type="time" class="input-time" v-model="time" />
        </div>
        <button v-if="showTime" v-on:click="applyDateTime" class="apply-time">
            {{ $t('common.apply') }}
        </button>
    </v-card>
</template>
<script>
import { calculatorPositionBox } from '@/views/document/common/common.js';
export default {
    props: {
        title: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('v2.general.selectDateTime');
            }
        },

        showTime: {
            type: Boolean,
            default: true
        },
        keyInstance: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            time: '01:00',
            date: null,
            isShow: false,
            position: null,
            minDate: '',
            maxDate: '',
            inputForcusing: null,
            showDate: true
        };
    },
    beforeMount() {
        this.position = {
            top: '26px',
            left: '0px'
        };
    },
    activated() {
        this.date = this.$moment().format('YYYY-MM-DD');
    },
    methods: {
        setShowDate(isShowDate) {
            this.showDate = isShowDate;
        },
        setShowTime(isShowDate, time) {
            this.time = time;
            this.showDate = isShowDate;
        },
        setRange(min, max) {
            this.minDate = min;
            this.maxDate = max;
        },
        closePicker() {
            this.isShow = false;
        },
        openPicker(e) {
            this.isShow = true;
            this.position = calculatorPositionBox(
                e,
                $('#sym-submit-' + this.keyInstance)
            );
            this.inputForcusing = e.controlName;
        },

        applyDateTime() {
            let dateTime = this.date + ' ' + this.time + ':00';
            if (this.showDate == false) {
                dateTime = this.time
                    ? this.time.length == 8
                        ? this.time
                        : this.time + ':00'
                    : '';
            }
            this.$emit('after-apply-datetime', {
                dateTime: dateTime,
                inputForcusing: this.inputForcusing
            });
        },
        dateSelected(data) {
            if (!this.showTime) {
                this.$emit('after-select-date', {
                    dateTime: data,
                    inputForcusing: this.inputForcusing
                });
            }
        }
    }
};
</script>
<style scoped>
.date-picker {
    box-shadow: none;
}
.apply-time {
    float: right;
    margin: 0 16px 8px 0;
    border: none;
    padding: 4px 8px;
    background: white;
    font-size: 13px;
    font-weight: 500;
    border-radius: 3px;
    transition: 300ms ease-in-out;
}
.apply-time:hover {
    background: #fafafa;
}
.card-datetime-picker {
    position: absolute;
    z-index: 9999;
    max-width: unset !important;
}
.heading {
    padding: 6px 12px;
}
.input-time:focus {
    outline: none;
}
.input-time {
    height: 30px !important;
    width: 100px;
    margin-left: 12px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.87);
    font-size: 12px;
}
.time-component {
    margin-bottom: 12px;
    padding: 0 24px;
    margin-top: -6px;
}
</style>

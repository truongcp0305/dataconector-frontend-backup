<template>
    <v-row class="row-time-select">
        <v-col cols="5">
            <h5 class="select-time-title">{{ $t('common.hour') }}</h5>
        </v-col>
        <v-col cols="6">
            <v-combobox
                class="time-input sym-small-size"
                v-model="time"
                :items="times"
                :rules="[rules.match]"
                @change="onChange"
            ></v-combobox>
        </v-col>
    </v-row>
</template>
<script>
export default {
    data() {
        return {
            times: null,
            time: null,
            rules: {
                match: (v) => {
                    const pattern = /(1[012]|[1-9]):[0-5][0-9](\\s)?|(AM|PM)/;
                    return (
                        pattern.test(v) ||
                        this.$t('v2.general.wrongTimeFormat')
                    );
                }
            }
        };
    },
    beforeMount() {
        this.time = this.formatAMPM(new Date());
        (this.date = new Date().toISOString().substr(0, 10)),
            (this.times = [
                '12:00 AM',
                '12:30 AM',
                '1:00 AM',
                '1:30 AM',
                '2:00 AM',
                '2:30 AM',
                '3:00 AM',
                '3:30 AM',
                '4:00 AM',
                '4:30 AM',
                '5:00 AM',
                '5:30 AM',
                '6:00 AM',
                '6:30 AM',
                '7:00 AM',
                '7:30 AM',
                '8:00 AM',
                '8:30 AM',
                '9:00 AM',
                '9:30 AM',
                '10:00 AM',
                '10:30 AM',
                '11:00 AM',
                '11:30 AM',
                '12:00 PM',
                '12:30 PM',
                '1:00 PM',
                '1:30 PM',
                '2:00 PM',
                '2:30 PM',
                '3:00 PM',
                '3:30 PM',
                '4:00 PM',
                '4:30 PM',
                '5:00 PM',
                '5:30 PM',
                '6:00 PM',
                '6:30 PM',
                '7:00 PM',
                '7:30 PM',
                '8:00 PM',
                '8:30 PM',
                '9:00 PM',
                '9:30 PM',
                '10:00 PM',
                '10:30 PM',
                '11:00 PM',
                '11:30 PM'
            ]);
    },
    methods: {
        onChange() {
            this.$emit('change', this.getTime(false));
        },
        formatAMPM(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        },
        getTime(isAmPm = true) {
            let time = this.time;
            if (!isAmPm) {
                time = this.convertTimeTo24Hour(this.time);
            }

            return time;
        },
        convertTimeTo24Hour(time) {
            var hours = Number(time.match(/^(\d+)/)[1]);
            var minutes = Number(time.match(/:(\d+)/)[1]);
            var AMPM = time.match(/\s(.*)$/);
            if (AMPM && AMPM.length > 0) {
                AMPM = AMPM[1];
                if (AMPM == 'PM' && hours < 12) hours = hours + 12;
                if (AMPM == 'AM' && hours == 12) hours = hours - 12;
            }
            var sHours = hours.toString();
            var sMinutes = minutes.toString();
            if (hours < 10) sHours = '0' + sHours;
            if (minutes < 10) sMinutes = '0' + sMinutes;
            return sHours + ':' + sMinutes;
        }
    }
};
</script>
<style scoped>
.select-time-title {
    padding: 10px 0px 10px 20px;
    font-size: 13px !important;
}
.row-time-select .col {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}
.time-input {
    margin-top: 0 !important;
    padding-top: 0 !important;
}
</style>

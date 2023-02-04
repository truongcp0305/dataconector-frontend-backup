<template>
    <div class="d-flex period-time-config">
        <div class="period-time d-flex align-center">
            <v-btn icon tile small @click="changeValue(false)">
                <v-icon small> mdi-minus </v-icon>
            </v-btn>
            <span class="fs-13 ml-2 mr-2">
                {{ value.time }}
            </span>
            <v-btn icon small tile @click="changeValue(true)">
                <v-icon small> mdi-plus </v-icon>
            </v-btn>
        </div>
        <div class="ml-2" style="width: 100px">
            <v-autocomplete
                v-model="value.unit"
                :items="unitItems"
                dense
                solo
            ></v-autocomplete>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            default() {
                return {
                    periodTime: 5,
                    unitValue: 'minute'
                };
            }
        }
    },
    data() {
        return {
            unitItems: [
                this.$t('v2.dataflow.minutes'),
                this.$t('v2.dataflow.hours'),
                this.$t('v2.dataflow.days'),
                this.$t('v2.dataflow.weeks'),
                this.$t('v2.dataflow.months')
            ]
        };
    },
    computed: {},
    methods: {
        changeValue(increase = false) {
            this.value.time = Number(this.value.time);
            if (increase) {
                this.value.time += 1;
            } else {
                this.value.time -= 1;
            }
        }
    }
};
</script>

<style scoped>
.period-time-config >>> .period-time {
    border: 1px solid lightgray;
    border-radius: 4px;
}
.period-time-config >>> .v-input__control {
    min-height: 30px !important;
}
.period-time-config >>> .v-input__slot {
    box-shadow: unset !important;
    border: 1px solid lightgray;
    margin-bottom: unset;
}
.period-time-config >>> input {
    font-size: 13px;
}
.period-time-config >>> .v-text-field__details {
    display: none;
}
</style>

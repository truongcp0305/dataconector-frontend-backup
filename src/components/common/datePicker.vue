<template>
    <v-menu
        ref="menu"
        v-model="menu"
        :close-on-content-click="false"
        :return-value.sync="date"
        transition="scale-transition"
        offset-y
        min-width="290px"
    >
        <template v-slot:activator="{ on }">
            <v-text-field
                class="sym-small-size"
                dense
                solo
                v-on="on"
                background-color="grey lighten-3"
                flat
                @change="handleChangeInput"
                v-model="date"
            ></v-text-field>
        </template>
        <v-date-picker
            v-model="datePickerValue"
            no-title
            scrollable
            :readonly="readonly"
            :min="currDate"
            @input="selectDate"
        >
        </v-date-picker>
    </v-menu>
</template>

<script>
export default {
    name: 'datePicker',
    props: {
        value: {
            type: String,
            default: '',
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        date(val) {
            if (!val) {
                this.datePickerValue = this.$moment(val)._isValid
                    ? val
                    : this.$moment().format('YYYY-MM-DD');
            }
        },
    },
    mounted() {
        this.date = this.value;
    },
    data: function () {
        return {
            date: '',
            menu: false,
            datePickerValue: '',
            currDate: this.$moment().format('YYYY-MM-DD'),
        };
    },
    methods: {
        handleChangeInput(val) {
            if (this.$moment(val)._isValid) {
                this.datePickerValue = val;
                this.selectDate();
            }
        },
        selectDate() {
            this.menu = false;
            this.$refs.menu.save(this.datePickerValue);
            this.$emit('change', this.datePickerValue);
            this.$emit('input', this.datePickerValue);
            this.date = this.datePickerValue;
        },
    },
};
</script>

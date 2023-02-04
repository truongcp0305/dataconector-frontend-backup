<template>
    <div class="position-relative">
        <v-text-field
            solo
            flat
            hide-details
            label="#.##"
            append-icon="mdi-format-color-highlight"
            v-model="dataPattern"
            @click:append="showFormatDateForm"
            @keyup="handleKeyUpInput"
        >
        </v-text-field>
        <div class="form-format-date" style="display: none">
            <div class="form-header">
                <h4>{{ $t('v2.general.displayFormat') }}</h4>
                <button v-on:click="hideForm">
                    <span class="mdi mdi-close"></span>
                </button>
            </div>
            <div class="form-body">
                <v-text-field
                    solo
                    flat
                    v-model="customFormat"
                    hide-details
                    @keyup="changePattern"
                    clearable
                >
                </v-text-field>
                <button v-on:click="setFormat" class="apply-format">
                    {{ $t('common.apply') }}
                </button>
            </div>
            <div style="height: 25px">
                <span class="example">{{
                    $t('v2.general.example') + result
                }}</span>
            </div>
        </div>
    </div>
</template>
<script>
let numeral = require('numeral');

export default {
    props: {
        value: {
            type: String,
            default: ''
        }
    },
    watch: {
        value(after) {
            this.dataPattern = after;
        }
    },
    computed: {
        sCurrentControl() {
            return this.$store.state.document.editor.currentSelectedControl;
        }
    },
    methods: {
        showFormatDateForm() {
            $('.form-format-date').show();
        },
        hideForm() {
            $('.form-format-date').hide();
        },

        setFormat() {
            this.hideForm();
            this.dataPattern = this.customFormat;
            this.$emit('change', this.customFormat);
            this.$emit('input', this.dataPattern);
        },
        changePattern() {
            let match = this.customFormat.match(/[.\[\]\(\)0#,]+/g);
            var number = numeral(12345.58345);
            let numberFormat = number.format(match[0]);
            this.result = this.customFormat.replace(match[0], numberFormat);
        },
        handleKeyUpInput() {
            this.$emit('change', this.customFormat);
            this.$emit('input', this.dataPattern);
        }
    },

    data() {
        return {
            customFormat: '0,0[.]00',
            result: '12,345',
            dataPattern: this.value
        };
    },
    mounted() {}
};
</script>
<style scoped>
.example {
    padding: 8px;
    font-size: 11px;
}
.form-format-date {
    position: absolute;
    right: 0px;
    height: auto;
    width: 215px;
    background: white;
    z-index: 9999999;
    box-shadow: 0px 7px 8px -4px rgba(0, 0, 0, 0.2),
        0px 12px 17px 2px rgba(0, 0, 0, 0.14),
        0px 5px 22px 4px rgba(0, 0, 0, 0.12);
}
.position-relative {
    position: relative;
}
.form-header {
    height: 25px;
    display: flex;
    border-bottom: 1px solid #cdcdcd;
}
.form-header h4 {
    padding: 2px 6px;
}
.form-header button {
    margin-left: auto;
    margin-right: 6px;
    font-size: 16px;
}
.form-body {
    display: flex;
    padding: 4px 8px;
}
.apply-format {
    margin-left: 8px;
    background: green;
    color: white;
    font-size: 12px;
    font-weight: 500;
    border-radius: 3px;
    padding: 2px 6px;
}
.suggest-item {
    height: 25px;
    display: flex;
    font-size: 11px;
    padding: 6px 8px;
    cursor: pointer;
}
.suggest-item:hover {
    background: #f2f2f2;
}

.suggest-item span:last-child {
    margin-left: auto;
}
</style>

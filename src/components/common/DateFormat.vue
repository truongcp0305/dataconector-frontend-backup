<template>
    <div class="position-relative">
        <v-text-field
            solo
            flat
            hide-details
            label="yyyy/MM/dd"
            append-icon="mdi-format-color-highlight"
            v-model="dataPattern"
            @click:append="showFormatDateForm"
            @keyup="handleChangeInput"
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
                    clearable
                >
                </v-text-field>
                <button v-on:click="setFormat" class="apply-format">
                    {{ $t('common.apply') }}
                </button>
            </div>
            <div>
                <span v-if="type == 'date'" class="example"
                    >{{ $t('v2.general.example')
                    }}{{ new Date() | moment(customFormat) }}</span
                >
                <span v-else class="example">
                    {{
                        $t('v2.general.example') +
                        $moment('2021-12-12 12:12:12').format(customFormat)
                    }}</span
                >
            </div>
            <div class="form-suggest">
                <div
                    class="suggest-item"
                    v-on:click="selectItem($event, pattern.type)"
                    v-for="pattern in listFormatPattern"
                    :key="pattern.type"
                >
                    <div style="font-weight: 500">{{ pattern.title }}</div>
                    <div style="font-weight: 300" v-if="type == 'date'">
                        {{ new Date() | moment(pattern.type) }}
                    </div>
                    <div style="font-weight: 300" v-else>
                        {{
                            $t('v2.general.template') +
                            $moment('2021-12-12 12:12').format(pattern.type)
                        }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        value: {
            type: String,
            default: ''
        },
        instance: {
            type: Number
        }
    },
    watch: {
        value(after) {
            this.dataPattern = after;
        },
        type(after) {
            this.setForm();
        }
    },
    computed: {
        type() {
            let x =
                this.$store.state.document.editor[this.instance]
                    .currentSelectedControl;
            return x.type;
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
            this.$emit('input', this.customFormat);
            this.$emit('change', this.customFormat);
        },
        selectItem(event, type) {
            this.customFormat = type;
            $('.suggest-item').removeClass('active');
            if ($(event.target).is('.suggest-item')) {
                $(event.target).addClass('active');
            } else {
                $(event.target).closest('.suggest-item').addClass('active');
            }
        },
        handleChangeInput() {
            this.$emit('input', this.customFormat);
            this.$emit('change', this.customFormat);
        },
        setForm() {
            if (this.type == 'date') {
                this.listFormatPattern = [
                    { title: 'YYYY-Mo-DD', type: 'YYYY-Mo-DD' },
                    { title: 'YYYY-MMM-DD', type: 'YYYY-MMM-DD' },
                    { title: 'YYYY-MM-DD', type: 'YYYY-MM-DD' },
                    { title: 'YYYY-MM-Do', type: 'YYYY-MM-Do' },
                    { title: 'D/M/YYYY', type: 'D/M/YYYY' },
                    { title: 'D/MM/YYYY', type: 'D/MM/YYYY' },
                    { title: 'DD/MM/YYYY', type: 'DD/MM/YYYY' }
                ];
                this.customFormat = 'MM/DD/YYYY';
            } else {
                this.listFormatPattern = [
                    {
                        title: 'DD/MM/YYYY HH:mm:ss',
                        type: 'DD/MM/YYYY HH:mm:ss'
                    },
                    { title: 'DD/MM/YYYY HH:mm', type: 'DD/MM/YYYY HH:mm' },
                    {
                        title: 'DD-MM-YYYY HH:mm:ss',
                        type: 'DD-MM-YYYY HH:mm:ss'
                    },
                    { title: 'DD-MM-YYYY HH:mm', type: 'DD-MM-YYYY HH:mm' },
                    {
                        title: 'YYYY-MM-DD HH:mm:ss',
                        type: 'YYYY-MM-DD HH:mm:ss'
                    }
                ];
                this.customFormat = 'DD/MM/YYYY HH:mm:ss';
            }
        }
    },

    data() {
        return {
            listFormatPattern: [],
            customFormat: '',
            dataPattern: this.value
        };
    },
    mounted() {
        this.setForm();
    }
};
</script>
<style scoped>
.active {
    background: #c3c3c3;
}
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
    height: 42px;
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

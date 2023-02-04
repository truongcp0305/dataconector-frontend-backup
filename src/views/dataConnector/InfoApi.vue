<template>
    <div class="w-100 mt-3">
        <div class="if">
            <p class="mt-3">{{ $t('v2.dataconnector.generalInformations') }}</p>
        </div>
        <FormTpl
            class="mr-2 mt-4 form"
            :labelWidth="'40px'"
            :allInputs="allInputs"
            :single-line="true"
        />
    </div>
</template>
<script>
import FormTpl from './../../components/common/FormTpl';
export default {
    methods: {
        setData(data) {
            this.allInputs.name.value = data.name;
            this.allInputs.note.value = data.note;
        },
        refreshData() {
            this.allInputs.name.value = '';
            this.allInputs.note.value = '';
        },
    },
    watch: {
        nameApi() {
            let data = {
                name: this.nameApi,
                note: this.noteApi,
            };
            this.$emit('change', data);
        },
        noteApi() {
            this.$emit('change', {
                name: this.nameApi,
                note: this.noteApi,
            });
        },
        disabled() {
            if (!this.disabled) {
                this.allInputs.name.disabled = false;
                this.allInputs.note.disabled = false;
            } else {
                this.allInputs.name.disabled = true;
                this.allInputs.note.disabled = true;
            }
        },
    },
    computed: {
        nameApi() {
            return this.allInputs.name.value;
        },
        noteApi() {
            return this.allInputs.note.value;
        },
    },
    props: {
        value: {
            type: Object,
            default() {
                return {};
            },
        },
        disabled: {
            type: Boolean,
            default() {
                return false;
            },
        },
    },
    components: {
        FormTpl,
    },

    data() {
        return {
            allInputs: {
                name: {
                    title: this.$t('v2.dataconnector.apiName'),
                    type: 'text',
                    value: this.value.name,
                    disabled: this.disabled,
                    info: '',
                },
                note: {
                    title: this.$t('v2.dataconnector.comment'),
                    disabled: this.disabled,
                    type: 'textarea',
                    value: this.value.note,
                    info: '',
                },
            },
        };
    },
};
</script>
<style scoped>
.form >>> textarea {
    font-size: 11px;
}
.form >>> .v-label {
    color: lightgrey !important;
}
</style>

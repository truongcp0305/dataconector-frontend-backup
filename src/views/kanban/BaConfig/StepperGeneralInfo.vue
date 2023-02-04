<template>
    <div class="stepper-general-info">
        <FormTpl
            :singleLine="true"
            :viewOnly="typeAction == 'detail'"
            :marginTop="'5px'"
            class="mr-2 general-info"
            :titleSize="'medium'"
            :labelWidth="'120px'"
            :allInputs="data"
        />
    </div>
</template>
<script>
import FormTpl from '@/components/common/FormTpl.vue';

export default {
    name: 'StepperGeneralInfo',
    props: {
        typeAction: {
            type: String,
            default: 'add',
        },
        data: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    components: {
        FormTpl,
    },
    created() {},
    data() {
        return {};
    },
    methods: {},
};
</script>
<style scoped>
.v-text-field >>> .v-select__selections input {
    padding: 10px !important;
}
.general-info >>> .v-select__selections input {
    padding: 10px 0px !important;
}
.general-info >>> .v-text-field__slot {
    font-size: 12px !important;
}
</style>

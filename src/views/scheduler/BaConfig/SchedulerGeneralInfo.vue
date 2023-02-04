<template>
    <div class="stepper-general-info">
        <FormTpl
            :singleLine="true"
            :viewOnly="typeAction == 'view'"
            :marginTop="'5px'"
            class="mr-2"
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
<style scoped></style>

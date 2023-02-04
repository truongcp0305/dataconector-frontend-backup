<template>
    <FormTpl :allInputs="allInput" @input-value-changed="handleChangeValue" />
</template>

<script>
import FormTpl from '@/components/common/FormTpl.vue';

export default {
    methods: {
        handleChangeValue(type, obj, value) {
            this.nodeData.configs.script = value;
        },
    },
    components: {
        FormTpl,
    },
    watch: {
        'nodeData.id': {
            handler() {
                this.allInput.scriptRunner.value = this.nodeData.configs.script;
            },
        },
    },
    mounted() {
        this.allInput.scriptRunner.value = this.nodeData.configs.script;
    },
    props: {
        nodeData: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            allInput: {
                scriptRunner: {
                    title: 'Script',
                    type: 'script',
                    value: '',
                    info: '',
                },
            },
        };
    },
};
</script>

<style></style>

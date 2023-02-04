<template>
    <v-radio-group
        class="symper-radio-button"
        v-model="lazyValue"
        @change="handleChangeValue"
        dense
    >
        <v-radio
            v-for="it in items"
            :key="it.value"
            :label="it.text"
            :value="it.value"
        ></v-radio>
    </v-radio-group>
</template>

<script>
export default {
    created() {
        this.lazyValue = newVl;
    },
    methods: {
        handleChangeValue(newValue) {
            this.$emit('input', newValue);
            this.$emit('change', newValue);
        },
    },
    data() {
        return {
            lazyValue: '',
        };
    },
    watch: {
        value(newVl) {
            this.lazyValue = newVl;
        },
    },
    props: {
        value: {
            default: '',
        },
        items: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    computed: {},
};
</script>

<style>
.symper-radio-button
    .v-input--radio-group--column
    .v-radio:not(:last-child):not(:only-child) {
    margin-bottom: 0px !important;
}
</style>

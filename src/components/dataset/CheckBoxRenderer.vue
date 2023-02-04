<template>
    <input
        class="mt-1"
        v-on:change="changeCheckbox"
        type="checkbox"
        :checked="value"
    />
</template>
<script>
export default {
    data: function () {
        return {
            value: null,
        };
    },
    beforeMount() {},
    mounted() {
        this.value = this.getValue();
    },
    methods: {
        getValue() {
            return this.params.data.selected ? true : false;
        },
        changeCheckbox() {
            this.$evtBus.$emit('dataset-ag-grid-on-change-checkbox', {
                data: this.params.data,
            });
        },
    },
};
</script>

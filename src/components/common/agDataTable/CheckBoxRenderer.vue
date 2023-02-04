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
            return this.params.value;
        },
        changeCheckbox() {
            this.value = !this.value;
            let controlName =
                this.params.data.name[this.params.data.name.length - 1];
            let prop = this.params.colDef.field;
            this.$evtBus.$emit('document-editor-ag-grid-on-change-checkbox', {
                controlName: controlName,
                value: this.value,
                prop: prop,
            });
            this.$evtBus.$emit('list-items-ag-grid-on-change-checkbox', {
                data: this.params.data,
            });
        },
    },
};
</script>

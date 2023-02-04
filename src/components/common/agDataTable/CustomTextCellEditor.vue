<template>
    <input ref="input" type="text" v-model="value" />
</template>
<script>
export default {
    data: function () {
        return {
            value: '',
        };
    },
    created() {
        this.setInitialState(this.params);
    },
    methods: {
        getValue() {
            return this.value;
        },
        setInitialState(params) {
            this.value =
                params.value.length == 1 ? params.value[0] : params.value[1];
        },
    },
};
</script>

<template>
    <CardBase :cellConfigs="cellConfigs" ref="cardBase" />
</template>

<script>
import CardBase from './CardBase';
export default {
    components: {
        CardBase,
    },
    props: {
        cellConfigs: {
            default() {
                return {};
            },
        },
    },
    methods: {
        printInnerHTML(headerHTML) {
            this.$refs.cardBase.printInnerHTML(headerHTML);
        },
    },
};
</script>

<style></style>

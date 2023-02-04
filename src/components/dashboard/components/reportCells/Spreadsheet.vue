<template>
    <iframe
        :key="cellConfigs.viewConfigs.displayOptions.renderKey"
        :style="{
            height: 'calc(100% - 16px)',
            width: '100%'
        }"
        :src="cellConfigs.viewConfigs.displayOptions.shareLink"
        frameborder="0"
    ></iframe>
</template>

<script>
export default {
    props: {
        cellConfigs: {
            default() {
                return {};
            }
        },
        instanceKey: {
            default: ''
        }
    },
    mounted() {}
};
</script>

<style></style>

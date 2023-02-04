<template>
    <SmartObjectConfig :action="'edit'" :id="$route.params.id" />
</template>

<script>
import SmartObjectConfig from '@/views/smartObject/BaConfig/SmartObjectConfig.vue';

export default {
    components: {
        SmartObjectConfig,
    },
    methods: {},
};
</script>

<style></style>
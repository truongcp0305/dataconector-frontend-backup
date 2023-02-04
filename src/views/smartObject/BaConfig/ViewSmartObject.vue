<template>
    <SmartObjectConfig :action="'view'" :id="$route.params.id" />
</template>

<script>
import SmartObjectConfig from '@/views/smartObject/BaConfig/SmartObjectConfig.vue';
export default {
    components: {
        SmartObjectConfig,
    },
};
</script>

<style></style>
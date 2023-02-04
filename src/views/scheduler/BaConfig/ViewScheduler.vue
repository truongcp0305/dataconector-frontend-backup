<template>
    <SchedulerConfig :action="'view'" :id="$route.params.id" />
</template>

<script>
import SchedulerConfig from '@/views/scheduler/BaConfig/SchedulerConfig.vue';
export default {
    components: {
        SchedulerConfig,
    },
};
</script>

<style></style>

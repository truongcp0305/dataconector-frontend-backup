<template>
    <div class="w-100 h-100">
        <SchedulerConfig :action="'edit'" :id="$route.params.id" />
    </div>
</template>

<script>
import SchedulerConfig from '@/views/scheduler/BaConfig/SchedulerConfig.vue';

export default {
    components: {
        SchedulerConfig,
    },
    methods: {},
};
</script>

<style></style>

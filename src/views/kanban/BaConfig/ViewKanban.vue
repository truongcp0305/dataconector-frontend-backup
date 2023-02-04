<template>
    <KanbanConfig :action="'view'" :id="$route.params.id" />
</template>

<script>
import KanbanConfig from '@/views/kanban/BaConfig/KanbanConfig.vue';
export default {
    components: {
        KanbanConfig,
    },
};
</script>

<style></style>

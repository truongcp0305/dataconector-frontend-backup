<template>
    <div class="w-100 h-100">
        <KanbanConfig :action="'edit'" :id="$route.params.id" />
    </div>
</template>

<script>
import KanbanConfig from '@/views/kanban/BaConfig/KanbanConfig.vue';

export default {
    components: {
        KanbanConfig,
    },
    methods: {},
};
</script>

<style></style>

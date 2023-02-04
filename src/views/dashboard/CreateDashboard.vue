<template>
    <div class="symper-edit-dashboard w-100">
        <DashboardEditor action="create" />
    </div>
</template>

<script>
import DashboardEditor from '@/components/dashboard/DashboardEditor.vue';
export default {
    created() {
        this.$setTabTitle(this.$t('bi.dashboard.create'));
    },
    components: {
        DashboardEditor,
    },
};
</script>

<style></style>

<template>
    <div class="symper-edit-dashboard w-100">
        <DashboardEditor
            action="edit"
            :idObject="$route.params.id"
            @config-loaded="handleLoadedConfig"
        />
    </div>
</template>

<script>
import DashboardEditor from '@/components/dashboard/DashboardEditor.vue';
export default {
    components: {
        DashboardEditor,
    },
    created() {
        this.$setTabTitle(this.$t('bi.dashboard.edit'));
    },
    methods: {
        handleLoadedConfig(data) {
            this.$setTabTitle(
                this.$t('bi.dashboard.edit') + ' ' + data.dashboardName,
            );
        },
    },
};
</script>

<style></style>

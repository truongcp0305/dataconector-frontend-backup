<template>
    <div class="symper-edit-dashboard w-100 position-relative">
        <div
            class="
                position-absolute
                pa-2
                amber
                darken-3
                white--text
                text-center
            "
            style="
                width: fit-content;
                width: fit-content;
                left: 374px;
                height: 40px;
                line-height: 27px;
                font-size: 13px;
            "
        >
            {{ $t('v2.dashboard.inCheckPerformanceMode') }}
        </div>
        <DashboardEditor
            action="edit"
            :idObject="$route.params.id"
            :experimentalMode="'clickhouse'"
            @config-loaded="handleLoadedConfig"
        />
    </div>
</template>

<script>
import DashboardEditor from '@/components/dashboard/DashboardEditor.vue';
export default {
    components: {
        DashboardEditor
    },
    created() {
        this.$setTabTitle(this.$t('bi.dashboard.edit'));
    },
    methods: {
        handleLoadedConfig(data) {
            this.$setTabTitle(
                this.$t('v2.dashboard.editWithClickhouseMode') +
                    ' ' +
                    data.dashboardName
            );
        }
    }
};
</script>

<style></style>

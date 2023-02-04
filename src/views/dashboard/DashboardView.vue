<template>
    <div class="symper-edit-dashboard w-100" v-if="showDashboard">
        <DashboardEditor
            ref="dashboardEditor"
            action="view"
            :idObject="idObject"
            @config-loaded="handleLoadedConfig"
        />
    </div>
</template>

<script>
import DashboardEditor from '@/components/dashboard/DashboardEditor.vue';
export default {
    methods: {
        handleLoadedConfig(data) {
            this.$setTabTitle(
                this.$t('bi.dashboard.view') + ' ' + data.dashboardName,
            );
        },
        resizeReportInCurrentView() {
            this.$refs.dashboardEditor.checkAndResizeAllReports();
        },
    },
    data() {
        return {
            showDashboard: false,
        };
    },
    components: {
        DashboardEditor,
    },
    mounted() {
        setTimeout(
            (self) => {
                self.showDashboard = true;
            },
            this.delayTime,
            this,
        );
    },
    computed: {
        idObject() {
            if (!this.idDashboard) {
                return this.$route.params.id;
            } else {
                return this.idDashboard;
            }
        },
    },
    props: {
        delayTime: {
            default: 0,
        },
        idDashboard: {
            default: 0,
        },
    },
    created() {
        this.$setTabTitle(this.$t('bi.dashboard.view'));
    },
};
</script>

<style></style>

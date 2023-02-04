<template>
    <div class="w-100 d-flex h-100 position-relative">
        <div
            :style="{
                width: showSidebar ? sidebarWidth : '0px',
                transition: '0.3s',
            }"
            v-if="listDashboard.length != 0"
            class="d-flex flex-column border-right-1 h-100"
        >
            <div style="height: 40px; line-height: 40px" class="pl-3">
                <h3
                    :style="`width: calc(${sidebarWidth} - 60px)`"
                    class="text-ellipsis"
                >
                    {{ $t('bi.dashboard.title-show-list') }}
                </h3>
            </div>
            <div style="overflow: auto; height: calc(100% - 40px)">
                <v-tabs
                    slider-color="orange text--darken-3"
                    active-class="orange--text text--darken-3"
                    vertical
                    v-model="dashboardTab"
                >
                    <v-tab
                        v-for="dashboard in listDashboard"
                        :key="dashboard.id"
                        class="px-3 fs-13 home-tab-dashboard"
                        style="justify-content: left !important; height: 35px"
                    >
                        <v-tooltip top z-index="200">
                            <template v-slot:activator="{ on: tooltip }">
                                <span
                                    v-on="tooltip"
                                    :style="{
                                        'max-width': `calc(${sidebarWidth} - 35px)`,
                                        'text-transform': 'none!important',
                                        'font-weight': 400,
                                    }"
                                    class="text-ellipsis"
                                >
                                    {{ dashboard.name }}
                                </span>
                            </template>
                            <span>{{ dashboard.name }}</span>
                        </v-tooltip>
                    </v-tab>
                </v-tabs>
            </div>
        </div>
        <div
            class="collapse-list-dashboard-btn bg-white"
            :style="{
                position: 'absolute',
                height: '35px',
                'z-index': 2,
                'line-height': '35px',
                left: showSidebar ? `calc(${sidebarWidth} - 40px)` : `10px`,
                top: '0px',
            }"
            v-if="listDashboard.length != 0"
        >
            <v-tooltip top>
                <template v-slot:activator="{ on: tooltip }">
                    <v-btn v-on="tooltip" icon small @click="toggleShowSidebar">
                        <i
                            style="transition: 0.3s"
                            :class="{
                                'fs-16 mdi': true,
                                'mdi-arrow-left': showSidebar,
                                'mdi-view-dashboard-outline': !showSidebar,
                                'orange--text text--darken-3': !showSidebar,
                            }"
                        ></i>
                    </v-btn>
                </template>
                <span>{{
                    showSidebar
                        ? $t('common.close')
                        : $t('bi.dashboard.title-show-list')
                }}</span>
            </v-tooltip>
        </div>
        <v-tabs-items
            v-if="listDashboard.length != 0"
            v-model="dashboardTab"
            class="h-100"
            :style="{
                width: showSidebar ? `calc(100% - ${sidebarWidth})` : '100%',
            }"
        >
            <v-tab-item
                v-for="(dashboard, idx) in listDashboard"
                :key="dashboard.id"
                class="w-100 h-100"
            >
                <DashboardView
                    :ref="'dashboardView' + idx"
                    :delayTime="400"
                    class="w-100 h-100"
                    :idDashboard="dashboard.id"
                />
            </v-tab-item>
        </v-tabs-items>
        <NotFoundScreen
            :emptyDataKey="'bi-dashboard-list'"
            class="w-100"
            v-else-if="isLoadedDashboard"
        />
    </div>
</template>

<script>
import { dashboardApi } from '@/api/dashboard.js';
import { util } from '../../plugins/util';
import DashboardView from '@/views/dashboard/DashboardView.vue';
import NotFoundScreen from '@/components/common/NotFoundScreen';

export default {
    components: {
        DashboardView,
        NotFoundScreen,
    },
    watch: {
        dashboardTab(newVl) {
            let self = this;
            setTimeout(() => {
                let ref = self.$refs['dashboardView' + newVl];
                if (ref) {
                    this.$evtBus.$emit('switch-dashboard-on-home-page', {
                        key: ref[0].$refs.dashboardEditor
                            ? ref[0].$refs.dashboardEditor.instanceKey
                            : '',
                    });
                }
            }, 300);
        },
    },
    created() {
        this.getListDashboard();
        this.$setTabTitle(this.$t('bi.dashboard.yours'));
    },
    methods: {
        toggleShowSidebar() {
            this.showSidebar = !this.showSidebar;
            let ref = this.$refs['dashboardView' + this.dashboardTab];
            setTimeout(() => {
                if (ref) {
                    ref[0].resizeReportInCurrentView();
                }
            }, 100);
        },
        async getListDashboard() {
            let self = this;
            let res = await dashboardApi.getDashboardsApp();
            self.listDashboard = res.data.listObject;;
            self.isLoadedDashboard = true;
        },
    },
    data() {
        return {
            listDashboard: [],
            dashboardTab: null,
            showSidebar: true,
            sidebarWidth: '200px',
            isLoadedDashboard: false,
        };
    },
};
</script>

<style>
.symper-dashboard-item .v-window__container {
    height: 100% !important;
}

.home-tab-dashboard.v-tab:not(.v-tab--active) {
    color: black !important;
}
</style>

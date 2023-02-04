<template>
    <div class="w-100 h-100 d-flex flex-column">
        <div
            class="pt-3 pb-4 pl-2 fs-13 font-weight-bold d-flex"
            style="background-color: #efefef"
        >
            <div class="flex-grow-1">
                {{ $t('v2.dashboard.listChart') }}
            </div>
            <v-btn icon tile x-small class="mr-2" @click="clearAll">
                <v-icon> mdi-eraser </v-icon>
            </v-btn>
        </div>
        <VuePerfectScrollbar :style="{ height: cpnHeight + 'px' }">
            <div
                style="height: 180px !important; border: 1px solid white"
                group="drop-column"
            >
                <div
                    v-for="(element, i) in allDashboardCell"
                    unselectable="on"
                    draggable="true"
                    :id="element.sharedConfigs.cellId"
                    class="
                        draggable-chart-item
                        py-2
                        my-1
                        d-flex
                        align-center
                        mx-2
                    "
                    @drag="handleDrag"
                    :key="i"
                    @dragend="dragEnd"
                >
                    <div class="px-2">
                        <img
                            height="25px"
                            width="25px"
                            :src="`img/dashboard/report-builder/${element.sharedConfigs.type}.png`"
                        />
                    </div>
                    <div class="d-flex flex-column w-100">
                        <div class="d-flex" :key="itemKey">
                            <div style="font-weight: 500" class="flex-grow-1">
                                {{
                                    element.rawConfigs.style.title.children
                                        .titleText.value
                                        ? element.rawConfigs.style.title
                                              .children.titleText.value
                                        : $t('common.noTitle')
                                }}
                            </div>
                            <v-btn
                                style="margin-top: -2px"
                                icon
                                tile
                                x-small
                                class="mr-1"
                                v-if="element.sharedConfigs.type == 'filter'"
                                :color="
                                    dashboardConfig.info.mobileLayout.vertical
                                        .mobileFilter[i]
                                        ? '#f58634'
                                        : 'black'
                                "
                                @click="toggleFilterChart(element, i)"
                            >
                                <v-icon x-small>
                                    mdi-format-list-checkbox
                                </v-icon>
                            </v-btn>
                        </div>
                        <div class="fs-11" style="opacity: 60%">
                            {{ $t('bi.chart.' + element.sharedConfigs.type) }}
                        </div>
                    </div>
                </div>
            </div>
        </VuePerfectScrollbar>
    </div>
</template>
<script>
import draggable from 'vuedraggable';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { util } from '@/plugins/util';
export default {
    components: {
        draggable,
        VuePerfectScrollbar
    },
    data() {
        return {
            allDashboardCell: {},
            cpnHeight: 0,
            itemKey: 0
        };
    },
    props: {
        instanceKey: {
            type: [String, Number]
        }
    },
    mounted() {
        this.cpnHeight = util.getComponentSize(this).h - 50;
    },
    created() {
        let self = this;
        this.getAllDashboardCell();
        this.$evtBus.$on('delete-mobile-chart', () => {
            self.getAllDashboardCell();
        });
    },
    methods: {
        collapse() {
            this.$emit('collapse-mobile-sidebar');
        },
        getAllDashboardCell() {
            let self = this;
            self.allDashboardCell = {};
            this.currentLayout.forEach((element) => {
                if (
                    !self.dashboardConfig.info.mobileLayout.vertical.chart[
                        element.cellId
                    ]
                ) {
                    if (
                        self.dashboardConfig.allCellConfigs[element.cellId]
                            .sharedConfigs.type == 'filter' &&
                        !self.dashboardConfig.allCellConfigs[element.cellId]
                            .sharedConfigs.isMobileFilter
                    ) {
                        self.dashboardConfig.allCellConfigs[
                            element.cellId
                        ].sharedConfigs.isMobileFilter = false;
                    }
                    self.$set(
                        self.allDashboardCell,
                        element.cellId,
                        self.dashboardConfig.allCellConfigs[element.cellId]
                    );
                }
            });
        },
        dragEnd(params) {
            this.$evtBus.$emit('chart-mobile-drag-end', params.srcElement.id);
            this.getAllDashboardCell();
        },
        handleDrag(params) {
            this.$evtBus.$emit('chart-mobile-dragging', params.srcElement.id);
        },
        clearAll() {
            this.$store.commit('dashboard/clearAllChartInMobileTab', {
                instanceKey: this.instanceKey
            });
            this.getAllDashboardCell();
        },
        toggleFilterChart(cells, cellId) {
            this.$store.commit('dashboard/toggleFilterChart', {
                instanceKey: this.instanceKey,
                cellId: cellId
            });
            this.itemKey = Date.now();
        }
    },
    watch: {
        'dashboardConfig.info.currentTabPageKey'(val) {
            this.getAllDashboardCell();
        }
    },
    computed: {
        currentLayout() {
            let info =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .dashboardConfigs.info;
            return info.layout[info.currentTabPageKey];
        },
        dashboardConfig() {
            return this.$store.state.dashboard.allDashboard[this.instanceKey]
                .dashboardConfigs;
        }
    }
};
</script>

<style>
.symper-mobile-layout {
    margin-right: auto;
    margin-left: auto;
}
.draggable-chart-item {
    background-color: #f3f3f3;
}
</style>

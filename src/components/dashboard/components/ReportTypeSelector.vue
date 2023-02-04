<template>
    <div class="symper-report-type-selector h-100 d-flex flex-column">
        <v-expansion-panels
            v-show="showReportType"
            class="report-type-select"
            v-model="panels"
        >
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div class="mt-2 mb-2 ml-1 title-all-chart-types">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    v-bind="attrs"
                                    v-on="on"
                                    class="mx-1"
                                    icon
                                    tile
                                    x-small
                                    @click.prevent.stop="collapse"
                                >
                                    <v-icon> mdi-chevron-right </v-icon>
                                </v-btn>
                            </template>
                            <span>{{
                                $t('v2.dashboard.collapseDashboard')
                            }}</span>
                        </v-tooltip>
                        <span
                            class="mt-1 font-weight-bold"
                            style="font-size: 13px !important"
                        >
                            {{ $t('bi.dashboard.title-visualization') }}
                        </span>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <div class="all-chart-types">
                        <span v-for="(item, i) in chartConfigs" :key="i">
                            <img
                                :title="$t('bi.chart.' + i)"
                                :src="
                                    'img/dashboard/report-builder/' + i + '.png'
                                "
                                @click="selectCellType(i)"
                                class="report-type-img"
                                :class="{
                                    'selected-report-type':
                                        i == currentCellConfigsType
                                }"
                                height="32px"
                                width="32px"
                            />
                        </span>
                    </div>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
        <div>
            <v-tabs v-model="tabs" fixed-tabs>
                <v-tabs-slider></v-tabs-slider>
                <v-tab
                    class="primary--text"
                    v-for="(item, i) in tabItems"
                    :key="i"
                >
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <div class="h-100" v-on="on" style="width: 50px">
                                <v-icon small class="mt-4">
                                    {{ item.icon }}
                                </v-icon>
                            </div>
                        </template>
                        <span> {{ item.title }} </span>
                    </v-tooltip>
                </v-tab>
            </v-tabs>
        </div>
        <div
            class="w-100 py-2"
            :style="{
                height: configHeight + 'px'
            }"
        >
            <component
                :is="configTagDisplay"
                :instanceKey="instanceKey"
                :height="configHeight"
                :configHeight="configHeight"
                :isView="isView"
            />
        </div>
        <div
            class="position-absolute px-2 pb-2 bg-white border-top-1"
            v-if="
                currentCellConfigsType != 'global' &&
                currentReport.sharedConfigs
            "
            style="bottom: 0px; width: 199px"
        >
            <div>
                <v-switch
                    class="sym-small-size"
                    v-model="currentReport.rawConfigs.extra.autoRefreshing"
                    :label="$t('v2.dashboard.autoGetResult')"
                ></v-switch>
            </div>
            <v-btn
                depressed
                color="primary"
                :disabled="currentReport.rawConfigs.extra.autoRefreshing"
                x-small
                class="w-100"
                @click="getCurrentReportResult()"
            >
                {{ $t('v2.dashboard.getResult') }}
            </v-btn>
        </div>
    </div>
</template>

<script>
import ColumnConfig from '@/components/dashboard/components/reportConfig/ColumnConfig';
import ConditionConfig from '@/components/dashboard/components/reportConfig/ConditionConfig';
import GroupConfig from '@/components/dashboard/components/reportConfig/GroupConfig';
import StyleConfig from '@/components/dashboard/components/reportConfig/StyleConfig';
import ConnectSpreadsheetConfig from '@/components/dashboard/components/reportConfig/ConnectSpreadsheetConfig';

import { util } from '@/plugins/util.js';
import { autoLoadChartClasses } from '@/components/dashboard/configPool/reportConfig.js';
import BlankComponent from '@/components/common/BlankComponent.vue';

var mapTypeToClass = autoLoadChartClasses();

export default {
    props: {
        showReportConfig: {
            type: Boolean
        },
        instanceKey: {
            type: [Number, String],
            default: 0
        },
        showReportType: {
            type: Boolean
        },
        isView: {
            type: Boolean
        }
    },
    computed: {
        currentReport() {
            return this.$store.state.dashboard.allDashboard[this.instanceKey]
                .currentCellConfigs;
        },
        currentCellConfigsType() {
            let obj =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .currentCellConfigs;
            if (Object.keys(obj).length) {
                return obj.sharedConfigs.type;
            } else {
                return '';
            }
        },
        configTagDisplay() {
            let currentTab = this.tabs;
            let currentCell =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .currentCellConfigs;
            if (
                currentCell.configItems &&
                currentCell.configItems[currentTab]
            ) {
                return currentCell.configItems[currentTab].tag;
            } else {
                return 'blank-component';
            }
        },
        tabItems() {
            let currentCell =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .currentCellConfigs;
            if (currentCell.configItems) {
                for (let item of currentCell.configItems) {
                    item.title = this.$t(item.text);
                }
                return currentCell.configItems;
            } else {
                return {};
            }
        }
    },
    components: {
        ColumnConfig,
        ConditionConfig,
        StyleConfig,
        GroupConfig,
        BlankComponent,
        ConnectSpreadsheetConfig
    },
    data() {
        return {
            tabs: null,
            configHeight: 0,
            panels: 0,
            chartConfigs: mapTypeToClass
        };
    },
    watch: {
        'currentReport.sharedConfigs.cellId': {
            handler(val) {
                setTimeout(
                    (self) => {
                        self.getConfigsHeight();
                    },
                    500,
                    this
                );
            }
        },
        tabs(val) {},
        panels: {
            deep: true,
            immediate: true,
            handler(val) {
                setTimeout(
                    (self) => {
                        self.getConfigsHeight(val);
                    },
                    500,
                    this
                );
            }
        },
        showReportConfig(val) {
            let value = val == true ? 0 : 1090;
            $('.symper-report-type-selector').css({
                transform: 'translateX(' + value + 'px)',
                'transition-duration': '1s'
            });
        }
    },
    methods: {
        getCurrentReportResult() {
            this.$evtBus.$emit('bi-report-change-display', {
                instanceKey: this.instanceKey,
                id: this.currentReport.sharedConfigs.cellId,
                type: 'data'
            });
        },
        getConfigsHeight(collapse = undefined) {
            if (typeof collapse == 'boolean') {
                this.collapseTopPanle = collapse;
            } else {
                collapse = this.collapseTopPanle;
            }
            let titleHeight;
            if (collapse != 0) {
                titleHeight = 40;
            } else {
                titleHeight = $(
                    document.getElementsByClassName('report-type-select')
                ).height();
            }
            titleHeight = titleHeight ? titleHeight : 0;
            let rsl = util.getComponentSize(this.$parent).h - titleHeight - 60;
            if (this.currentCellConfigsType != 'global') {
                rsl = rsl - 53;
            }
            this.configHeight = rsl;
        },
        selectCellType(type) {
            this.$emit('selected-type', type);
        },
        collapse() {
            this.$emit('collapse-report-config');
        }
    },
    mounted() {
        this.collapseTopPanle = false;
    }
};
</script>

<style scoped>
.symper-report-type-selector >>> .v-expansion-panel::before {
    box-shadow: unset !important;
}
.symper-report-type-selector .report-type-select >>> .v-expansion-panel-header {
    padding: unset !important;
    background-color: #efefef !important;
    min-height: unset !important;
    height: 40px;
}
.symper-report-type-selector >>> .v-expansion-panel-content__wrap {
    padding: unset !important;
}
.symper-report-type-selector
    .report-type-select
    >>> .v-expansion-panel-content__wrap {
    margin-left: 6px;
}
.symper-report-type-selector
    >>> .v-expansion-panel--active
    > .v-expansion-panel-header {
    min-height: unset !important;
    height: 40px;
}
.symper-report-type-selector >>> .v-tab {
    min-width: unset !important;
    padding: unset !important;
}
.symper-report-type-selector >>> .v-slide-group__wrapper {
    background-color: #efefef;
}
.symper-report-type-selector >>> .v-tab--active,
.symper-report-type-selector >>> .v-tabs-slider {
    color: orange !important;
}
.symper-report-type-selector >>> .v-slide-group__prev,
.symper-report-type-selector >>> .v-slide-group__next {
    display: none !important;
    margin-top: 12px;
}
.symper-report-type-selector >>> .v-item-group:hover .v-item-group {
    position: relative;
}
.symper-report-type-selector >>> .v-item-group:hover .v-slide-group__next {
    display: inline-block !important;
    position: absolute;
    top: 0;
    right: -35px;
}
.symper-report-type-selector >>> .v-item-group:hover .v-slide-group__prev {
    display: inline-block !important;
    position: absolute;
    top: 0;
    left: 0;
}
</style>
<style>
.symper-report-type-selector {
    border-left: 1px solid lightgray;
}
.report-type-img {
    margin: 2px;
    padding: 6px;
    cursor: pointer;
}
.report-type-img:hover {
    border-radius: 2px;
    background-color: lightgray;
}
.selected-report-type {
    background-color: #feede1;
    border: 1px solid orange;
}
</style>

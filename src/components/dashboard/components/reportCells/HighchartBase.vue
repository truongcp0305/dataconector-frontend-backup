<template>
    <div ref="highchartWrapper" class="w-100 h-100">
        <Highcharts
            class="w-100 h-100"
            ref="highchartSymper"
            :options="cloneDisplayOptions"
        >
        </Highcharts>
        <groupSeriesDetail
            v-if="groupSeries.showDetailGroupSeries"
            @close-detail="closeSeriesDetail"
            :groupName="groupSeries.groupSeriesName"
            :groupData="groupSeries.groupSeriesData"
            :chartType="cellConfigs.sharedConfigs.type"
        />
    </div>
</template>
<script>
import { Chart } from 'highcharts-vue';
import { util } from '@/plugins/util';
import Highcharts from 'highcharts';
import Treemap from 'highcharts/modules/treemap';
import HighchartsMore from 'highcharts/highcharts-more';
import groupSeriesDetail from './groupSeriesDetail.vue';
HighchartsMore(Highcharts);
Treemap(Highcharts);
import { calcReportWraperSize } from '@/components/dashboard/configPool/dashboardConfigs.js';

export default {
    created() {
        let self = this;
        this.$evtBus.$on('dashboard-resize-report', (data) => {
            if (!self._inactive && data.instanceKey == self.instanceKey) {
                if (
                    data.singleApply &&
                    data.applyCellId != this.cellConfigs.sharedConfigs.cellId
                ) {
                    // Nếu tín hiệu chỉ áp dụng để resize 1 report duy nhất nhưng khác id của report hiện tại thì bỏ qua
                    return;
                }
                let size = calcReportWraperSize(self.$el, self.cellConfigs);
                self.$refs.highchartSymper.chart.setSize(size.w, size.h, false);
            }
        });
    },
    data() {
        return {
            groupSeries: {
                showDetailGroupSeries: false,
                groupSeriesName: '',
                groupSeriesData: []
            },
            chartOptions: {
                cellConfigsClone: {
                    viewConfigs: {
                        displayOptions: {
                            title: false,
                            subtitle: false
                        }
                    }
                }
            }
        };
    },
    components: {
        groupSeriesDetail: groupSeriesDetail,
        Highcharts: Chart
    },
    props: {
        cellConfigs: {
            default() {
                return {};
            }
        },
        instanceKey: {
            default: ''
        }
    },
    computed: {
        cloneDisplayOptions() {
            let cloneDisplayOptions = util.cloneDeep(
                this.chartOptions.cellConfigsClone.viewConfigs.displayOptions
            );

            let idxGroup;
            let self = this;
            let haveGroup = cloneDisplayOptions.series[0].data.some(
                (a, idx) => {
                    if (a.customTooltip) {
                        idxGroup = idx;
                        return a.customTooltip;
                    }
                }
            );
            if (haveGroup) {
                cloneDisplayOptions.tooltip = cloneDisplayOptions.tooltip
                    ? cloneDisplayOptions.tooltip
                    : {};
                cloneDisplayOptions.tooltip.useHTML = true;
                // cloneDisplayOptions.series[0].data
                cloneDisplayOptions.tooltip.formatter = function (tooltip) {
                    if (!this.point.options.customTooltip) {
                        return `<b>${
                            this.x ? this.x : this.point.options.name
                        }</b>
                                <br/>
                                <ul>
                                    <li>${this.point.series.name}: ${
                            this.point.options.y
                        }</li>
                                </ul>`;
                    } else {
                        this.point.options.customTooltip.sort(
                            (a, b) => b.y - a.y
                        );
                        let tooltipHTML = `<div"><b>${this.point.options.name}: ${this.point.options.y}</b>
                                <br/>
                                <hr/>
                                <ul>
                                `;
                        this.point.customTooltip.slice(0, 24).map((da) => {
                            tooltipHTML += `<li>${
                                da.name == '' ? null : da.name
                            }: ${da.y}</li>`;
                        });
                        tooltipHTML += `</ul> <b style="display:flex;width: 100%; justify-content:center">${
                            this.point.customTooltip.length > 24 ? '...' : ''
                        }</b></div>`;
                        return tooltipHTML;
                    }
                };
                cloneDisplayOptions.plotOptions.series = cloneDisplayOptions
                    .plotOptions.series
                    ? cloneDisplayOptions.plotOptions.series
                    : {};
                cloneDisplayOptions.plotOptions.series.events = {
                    click: function (event) {
                        if (event.point.customTooltip) {
                            self.groupSeries.showDetailGroupSeries = true;
                            self.groupSeries.groupSeriesName = event.point.name;
                            self.groupSeries.groupSeriesData =
                                event.point.customTooltip;
                        }
                    }
                };
            }
            return cloneDisplayOptions;
        }
    },
    watch: {
        'cellConfigs.viewConfigs.displayOptions': {
            deep: true,
            immediate: true,
            handler(displayOptions) {
                let self = this;
                self.setCellConfigsClone();
            }
        }
    },
    methods: {
        closeSeriesDetail() {
            this.groupSeries.showDetailGroupSeries = false;
        },
        printInnerHTML(headerHTML) {
            let domHTML = this.$refs.highchartWrapper.innerHTML;
            let fullHTML = headerHTML + domHTML;
            util.printDOM(fullHTML);
        },
        setCellConfigsClone() {
            this.$set(this.chartOptions, 'cellConfigsClone', this.cellConfigs);
        }
    }
};
</script>
<style>
.highcharts-credits {
    display: none !important;
}
</style>

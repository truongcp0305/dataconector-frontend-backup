<template>
    <HighchartBase
        :instanceKey="instanceKey"
        :cellConfigs="cellConfigsClone"
        ref="highChartBase"
    />
</template>

<script>
import HighchartBase from './HighchartBase';
import { util } from '@/plugins/util';
export default {
    components: {
        HighchartBase,
    },
    props: {
        cellConfigs: {
            default() {
                return {};
            },
        },
        instanceKey: {
            default: '',
        },
    },
    computed: {
        cellConfigsClone() {
            let self = this;
            let config = util.cloneDeep(this.cellConfigs);
            if (config.viewConfigs.displayOptions.plotOptions) {
                config.viewConfigs.displayOptions.plotOptions.series.dataLabels.formatter =
                    function () {
                        let value = (
                            Math.round(this.point.y * 100) / 100
                        ).toFixed(
                            self.cellConfigs.rawConfigs.style.dataLabel.children
                                .tooltipDecimalNumber.value,
                        );
                        return value;
                    };
            }
            return config;
        },
    },
    methods: {
        printInnerHTML(headerHTML) {
            this.$refs.highChartBase.printInnerHTML(headerHTML);
        },
        handleSettingColumnOptionsClicked(data) {
            let subItem = data.data.item;
            subItem.value = !subItem.value;
            this.$evtBus.$emit('bi-report-change-display', {
                type: 'data',
                id: this.cellConfigs.sharedConfigs.cellId,
                instanceKey: this.instanceKey,
            });
        },
    },
};
</script>

<style></style>

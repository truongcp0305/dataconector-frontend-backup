<template>
    <HighchartBase
        :instanceKey="instanceKey"
        :cellConfigs="cellConfigs"
        ref="highChartBase"
    />
</template>

<script>
import HighchartBase from './HighchartBase';
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

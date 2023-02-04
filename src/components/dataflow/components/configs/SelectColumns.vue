<template>
    <DatasetColumnSelector
        :rowData="nodeData.configs.columns"
        @change-configs="handleChangeConfigs"
    />
</template>

<script>
import DatasetColumnSelector from '@/components/dataset/DatasetColumnSelector';
import { saveChangeColumnValueToHistory } from '@/components/dataflow/configPool/dataflowConfig.js';
export default {
    props: {
        nodeData: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    components: {
        DatasetColumnSelector,
    },
    methods: {
        handleChangeConfigs(data) {
            if (data.type == 'change-cell-value') {
                saveChangeColumnValueToHistory(
                    data.data,
                    this.nodeData.configs,
                );
            }
            this.$emit('change-configs', data);
        },
    },
};
</script>

<style></style>

<template>
    <TableBase
        :instanceKey="instanceKey"
        :cellConfigs="cellConfigs"
        :action="action"
        ref="tableBase"
    />
</template>

<script>
import TableBase from './TableBase';
import _isEmpty from 'lodash/isEmpty';
export default {
    components: {
        TableBase
    },
    data() {
        return {};
    },
    props: {
        cellConfigs: {
            default() {
                return {};
            }
        },
        instanceKey: {
            default: ''
        },
        action: {
            default: ''
        }
    },
    watch: {},
    methods: {
        printInnerHTML(headerHTML) {
            this.$refs.tableBase.printInnerHTML(headerHTML);
        },
        handleSettingColumnOptionsClicked(data) {
            this.$refs.tableBase.handleSettingColumnOptionsClicked(data);
        }
    }
};
</script>

<style></style>

<template>
    <div>
        <TableBase
            :instanceKey="instanceKey"
            :cellConfigs="cellConfigs"
            ref="tableBase"
        />
    </div>
</template>

<script>
import TableBase from './TableBase';
import _isEmpty from 'lodash/isEmpty';
export default {
    components: {
        TableBase
    },
    watch: {},
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
        }
    },
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

<template>
    <FilterBase
        :selectedItems="selectedItems"
        :cellConfigs="cellConfigs"
        :instanceKey="instanceKey"
    />
</template>

<script>
import FilterBase from './FilterBase';
export default {
    components: {
        FilterBase
    },
    props: {
        selectedItems: {
            default() {
                return [];
            }
        },
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
            this.$snotifySuccess(this.$t('v2.dashboard.notSupportPrintFilter'));
        }
    }
};
</script>

<style></style>

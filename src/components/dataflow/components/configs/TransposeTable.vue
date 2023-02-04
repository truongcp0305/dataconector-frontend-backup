<template>
    <div class="w-100 h-100 fs-13">
        <div class="d-flex justify-space-between pl-1 w-100">
            <div class="mr-1" style="width: 50%">
                <div class="font-weight-medium">{{$t('v2.dataflow.columnNameTitle')}}</div>
                <v-text-field
                    v-on:input="onSearch()"
                    v-model="nodeData.configs.keyColumnTitle"
                    class="d-inline-block sym-small-size"
                    single-line
                    outlined
                    hide-details
                    dense
                    flat
                    style="width: 95%"
                ></v-text-field>
            </div>
            <div style="width: 50%">
                <div class="font-weight-medium">{{$t('v2.dataflow.columnValueTitle')}}</div>
                <v-text-field
                    v-on:input="onSearch()"
                    v-model="nodeData.configs.dataColumnTitle"
                    class="d-inline-block sym-small-size"
                    single-line
                    outlined
                    hide-details
                    dense
                    flat
                    style="width: 95%"
                ></v-text-field>
            </div>
        </div>

        <div class="pt-1" style="height: 200px">
            <span class="pl-1 font-weight-medium">{{$t('v2.dataflow.keyColumns')}}</span>
            <dataset-column-selector
                style="height: calc(100% - 15px)"
                :rowData="nodeData.configs.keyColumns"
            />
        </div>
        <div class="pt-1" style="height: calc(100% - 250px)">
            <span class="pl-1 font-weight-medium">{{$t('v2.dataflow.dataColumns')}}</span>
            <dataset-column-selector :rowData="nodeData.configs.dataColumns" />
        </div>
    </div>
</template>

<script>
import DatasetColumnSelector from '../../../dataset/DatasetColumnSelector.vue';
export default {
    components: { DatasetColumnSelector },
    props: {
        nodeData: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    
    computed: {
        keyColumns() {
            if(this.nodeData.configs.keyColumnTitle.includes('v2.dataflow')){
                this.nodeData.configs.keyColumnTitle=this.$t(this.nodeData.configs.keyColumnTitle)
            }
            return this.nodeData.configs.keyColumns;
        },
        dataColumns() {
            if(this.nodeData.configs.dataColumnTitle.includes('v2.dataflow')){
                this.nodeData.configs.dataColumnTitle=this.$t(this.nodeData.configs.dataColumnTitle)
            }
            return this.nodeData.configs.dataColumns;
        },
    },
    watch: {
        keyColumns: {
            deep: true,
            handler() {
                this.$emit('change-configs');
            },
        },
        dataColumns: {
            deep: true,
            handler() {
                this.$emit('change-configs');
            },
        },
    },
    data() {
        return {};
    },
    methods: {
        onSearch() {
            if (this.delayTimer) {
                clearTimeout(this.delayTimer);
            }
            this.delayTimer = setTimeout(
                (self) => {
                    self.$emit('change-configs');
                },
                300,
                this,
            );
        },
    },
};
</script>

<style scoped></style>

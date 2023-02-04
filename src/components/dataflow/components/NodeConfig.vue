<template>
    <div class="dataflow-node-config">
        <DatasetAutocomplete
            ref="datasetAutocomplete"
            :isMultiple="false"
            :listDatasetSelected="selectedDataset"
            @dataset-selector="handleDatasetSelector"
        />

        <div class="table-dataset-info d-flex flex-column">
            <div
                class="d-flex fs-13 mt-1"
                v-for="(item, i) in datasetInfor"
                :key="i"
            >
                <span class="flex-grow-1">
                    {{ item.title }}
                </span>
                <span>
                    {{ item.content }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import DatasetAutocomplete from '@/components/dataset/DatasetAutocomplete';

export default {
    props: {
        configs: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    components: {
        DatasetAutocomplete,
    },
    watch: {
        'configs.idDataset'() {
            this.getDatasetInfo();
        },
    },
    methods: {
        getDatasetInfo() {
            let id = this.configs.idDataset;
        },
        handleDatasetSelector(params) {
            this.$set(this.datasetInfor.id, 'content', params.id);
            this.$set(this.datasetInfor.name, 'content', params.name);
            this.$set(this.datasetInfor.title, 'content', params.aliasName);
            this.$set(this.datasetInfor.docId, 'content', params.symperId);
            this.$emit('dataset-selected', params);
        },
    },
    computed: {
        datasetInfor() {
            return {
                id: {
                    title: this.$t('v2.dataflow.iD'),
                    content: this.configs.idDataset,
                },
                name: {
                    title: this.$t('v2.dataflow.name'),
                    content: this.configs.name,
                },
                title: {
                    title: this.$t('v2.dataflow.title'),
                    content: this.configs.title,
                },
                docId: {
                    title: this.$t('v2.dataflow.docId'),
                    content: this.configs.symperDocId,
                },
            };
        },
    },

    data() {
        return {
            selectedDataset: null,
        };
    },
};
</script>

<style scoped></style>

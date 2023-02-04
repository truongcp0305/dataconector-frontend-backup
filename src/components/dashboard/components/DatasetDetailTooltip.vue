<template>
    <div style="width: auto; background-color: white" class="pa-4">
        <div class="fs-14 font-weight-bold" style="text-align: center">
            {{ $t('v2.dashboard.datasetInfo') }}
        </div>
        <div class="w-100 my-2 d-flex justify-space-between">
            <div class="font-weight-bold">Type:</div>
            <div>
                {{ datasetOrigin[info.type] }}
            </div>
        </div>

        <div class="w-100 my-2 d-flex justify-space-between">
            <div class="font-weight-bold">
                {{ $t('v2.dashboard.datasetId') }}
            </div>
            <div>
                {{ info.id }}
            </div>
        </div>

        <div
            v-if="info.type == 'doc' || info.type == 'joined_dataset'"
            class="w-100"
        >
            <div class="w-100 d-flex justify-space-between">
                <div class="font-weight-bold">
                    {{ $t('v2.dashboard.documentId') }}
                </div>
                <div>
                    {{ info.symperId }}
                </div>
            </div>

            <div class="w-100 my-2 d-flex justify-space-between">
                <div class="font-weight-bold">
                    {{ $t('v2.dashboard.name') }}
                </div>
                <div class="ml-1">
                    {{ info.name }}
                </div>
            </div>

            <div class="w-100 my-2 d-flex justify-space-between">
                <div class="font-weight-bold">
                    {{ $t('v2.dashboard.title') }}
                </div>
                <div class="ml-1">
                    {{ info.title }}
                </div>
            </div>
        </div>

        <div v-else class="w-100">
            <div class="w-100 my-2 d-flex justify-space-between">
                <div class="font-weight-bold">
                    {{ $t('v2.dashboard.dataflowId') }}
                </div>
                <div>
                    {{ info.dataflowId }}
                </div>
            </div>
            <div class="w-100 my-2 d-flex justify-space-between">
                <div class="font-weight-bold">
                    {{ $t('v2.dashboard.datasetId') }}
                </div>
                <div>
                    {{ info.id }}
                </div>
            </div>

            <div class="w-100 my-2 d-flex justify-space-between">
                <div class="font-weight-bold">
                    {{ $t('v2.dashboard.dataflowName') }}
                </div>
                <div class="ml-1">
                    {{ info.dataflowName }}
                </div>
            </div>

            <div class="w-100 my-2 d-flex justify-space-between">
                <div class="font-weight-bold">
                    {{ $t('v2.dashboard.nodeName') }}
                </div>
                <div class="ml-1">
                    {{ info.nodeName }}
                </div>
            </div>

            <div class="w-100 d-flex justify-space-between">
                <div class="font-weight-bold">
                    {{ $t('v2.dashboard.nodeType') }}
                </div>
                <div>
                    {{ info.nodeType }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        info: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data() {
        return {
            datasetOrigin: {
                doc: this.$t('v2.dashboard.document'),
                dataset_by_dataflow: this.$t(
                    'v2.dashboard.datasetByDataflow'
                ),
                joined_dataset: this.$t('v2.dashboard.joinedDataset')
            }
        };
    }
};
</script>

<style></style>

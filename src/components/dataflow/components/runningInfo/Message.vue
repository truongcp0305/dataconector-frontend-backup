<template>
    <div class="ml-2 fs-13">
        <div v-if="runNodeSuccess">
            <span>
                {{ $t('bi.runningInfo.run-success') }}
            </span>
            <span class="font-weight-bold ml-1 mr-1"> {{ totalTime }}s </span>
            <span>
                {{ $t('bi.runningInfo.with') }}
            </span>
            <span class="font-weight-bold ml-1 mr-1">
                {{ totalRow }}
            </span>
            <span>
                {{ $t('bi.runningInfo.rows') }}
            </span>
        </div>
        <div v-else>
            <span class="font-weight-bold">{{ error }}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        instanceKey: {
            default: '',
        },
    },
    computed: {
        totalRow() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .selectedWidget.dataRunNode.totalRow;
        },
        totalTime() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .selectedWidget.dataRunNode.totalTime;
        },
        error() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .selectedWidget.dataRunNode.error;
        },
        runNodeSuccess() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .selectedWidget.dataRunNode.status == 200
                ? true
                : false;
        },
    },
};
</script>

<style></style>

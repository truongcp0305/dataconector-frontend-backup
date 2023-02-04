<template>
    <div class="w-100" style="height: 20px">
        <div class="aggregate-range float-right mt-1" ref="aggRange">
            <span v-for="(item, i) in aggRange" :key="i" class="fs-11 mr-3">
                <span class=""> {{ item.title }} : </span>
                <span class="grey--text text--darken-1">
                    {{ item.value }}
                </span>
            </span>
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
    created() {
        this.$evtBus.$on('dashboard-calc-table-agg-range', (data) => {
            if (data.instanceKey == this.instanceKey) {
                if (data.action == 'reset') {
                    this.resetAggRange();
                } else if (data.action == 'display') {
                    for (let key in data.info) {
                        this.aggRange[key].value = data.info[key];
                    }
                }
            }
        });
    },
    methods: {
        resetAggRange() {
            for (let key in this.aggRange) {
                this.aggRange[key].value = '-';
            }
        },
    },
    data() {
        return {
            aggRange: {
                sum: {
                    value: '-',
                    title: this.$t('common.sum'),
                },
                avg: {
                    value: '-',
                    title: this.$t('common.avg'),
                },
                count: {
                    value: '-',
                    title: this.$t('common.count'),
                },
            },
        };
    },
};
</script>

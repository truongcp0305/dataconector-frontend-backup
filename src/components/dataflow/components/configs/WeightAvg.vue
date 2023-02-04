<template>
    <div class="w-100 fs-13">
        <div class="font-weight-medium ml-1 mt-2">{{$t('v2.dataflow.goods')}}</div>
        <select-column
            class="pl-1"
            :allColumns="nodeData.configs.allColumns"
            :model="nodeData.configs.goods"
            @change-value="changeValue"
            :ikey="'goods'"
        />
        <div class="font-weight-medium ml-1 mt-2">{{$t('v2.dataflow.stock')}}</div>
        <select-column
            class="pl-1"
            :allColumns="nodeData.configs.allColumns"
            :model="nodeData.configs.stock"
            @change-value="changeValue"
            :ikey="'stock'"
        />
        <div class="font-weight-medium ml-1 mt-2">
            {{$t('v2.dataflow.exchangeStock')}}
        </div>
        <select-column
            class="pl-1"
            :allColumns="nodeData.configs.allColumns"
            :model="nodeData.configs.exchangeStock"
            @change-value="changeValue"
            :ikey="'exchangeStock'"
        />
        <div class="font-weight-medium ml-1 mt-2">{{$t('v2.dataflow.quantity')}}</div>
        <select-column
            class="pl-1"
            :allColumns="nodeData.configs.allColumns"
            :model="nodeData.configs.quantity"
            @change-value="changeValue"
            :ikey="'quantity'"
        />
        <div class="font-weight-medium ml-1 mt-2">
            {{$t('v2.dataflow.totalAmount')}}
        </div>
        <select-column
            class="pl-1"
            :allColumns="nodeData.configs.allColumns"
            :model="nodeData.configs.totalAmount"
            @change-value="changeValue"
            :ikey="'totalAmount'"
        />
        <div class="font-weight-medium ml-1 mt-2">{{$t('v2.dataflow.accountingPeriod')}}</div>
        <select-column
            class="pl-1"
            :allColumns="nodeData.configs.allColumns"
            :model="nodeData.configs.period"
            @change-value="changeValue"
            :ikey="'period'"
        />
    </div>
</template>

<script>
import SelectColumn from '@/components/common/bi/SelectColumn.vue';
export default {
    components: {
        SelectColumn,
    },
    props: {
        nodeData: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {};
    },
    methods: {
        changeValue(data) {
            this.$set(this.nodeData.configs, data.ikey, data.value);
            this.$emit('change-configs');
        },
    },
};
</script>

<style scoped></style>

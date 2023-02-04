<template>
    <div class="w-100">
        <table class="w-100 fs-13">
            <thead>
                <tr style="text-align: left">
                    <th class="pl-1">{{$t('v2.dataflow.selectSortColumns')}}</th>
                </tr>
            </thead>
            <tr
                style="border-bottom: 1px solid #eee"
                v-for="(col, idx) in nodeData.configs.sortColumns"
                :key="idx"
                :name="idx"
            >
                <td class="px-1 py-2">
                    <selectColumn
                        :allColumns="nodeData.configs.allColumns"
                        :model="col.uid"
                        @change-value="changeValue"
                        :ikey="idx"
                    />
                </td>
                <td style="width: 30%">
                    <div class="w-100 d-flex">
                        <v-select
                            class="sym-select fs-13"
                            dense
                            flat
                            v-model="col.type"
                            :items="dataTypes"
                            outlined
                            @change="chageSelectType"
                        ></v-select>
                        <v-icon @click="removeCol(idx)" class="fs-16 mx-1"
                            >mdi-close</v-icon
                        >
                    </div>
                </td>
            </tr>
            <tfoot>
                <tr>
                    <td colspan="2">
                        <div class="w-100">
                            <v-btn
                                @click="addSortItem"
                                depressed
                                small
                                class="mx-2 mt-1"
                                style="width: 95%"
                                >{{$t('v2.dataflow.addColumn')}}</v-btn
                            >
                        </div>
                    </td>
                </tr>
            </tfoot>
        </table>
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
                return {
                    configs: {},
                };
            },
        },
    },
    data() {
        let self=this;
        return {
            dataTypes: [
                {
                    text: self.$t('v2.dataflow.asc'),
                    value: 'ASC',
                },
                {
                    text: self.$t('v2.dataflow.desc'),
                    value: 'DESC',
                },
            ],
        };
    },
    methods: {
        chageSelectType() {
            this.$emit('change-configs');
        },
        removeCol(idx) {
            this.nodeData.configs.sortColumns.splice(idx, 1);
        },
        addSortItem() {
            this.nodeData.configs.sortColumns.push({
                uid: '',
                type: 'ASC',
            });
        },
        changeValue(data) {
            this.nodeData.configs.sortColumns[data.ikey].uid = data.value;
            this.$emit('change-configs');
        },
    },
};
</script>

<style scoped>
.sym-select {
    height: 30px !important;
}
.sym-select >>> .v-input__slot {
    min-height: 20px !important;
    height: 30px;
}
.sym-select >>> .v-input__append-inner {
    margin-top: 3px !important;
}
</style>

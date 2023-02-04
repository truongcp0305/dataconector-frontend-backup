<template>
    <div class="symper-conditional-format-setting" style="height: 300px">
        <div class="w-100 d-flex mb-3">
            <div class="item-title">Apply for column:</div>
            <div style="padding-top: 1px">
                <select-column
                    class="sym-select-cond"
                    :itemText="'as'"
                    :configPadding="1"
                    :allColumns="listColumnForSelect"
                    :model="config.applyColumnUid"
                    @change-value="changeSelectedCol"
                />
            </div>
        </div>

        <div class="w-100 d-flex mb-2">
            <div class="item-title">Display mode:</div>
            <div>
                <v-radio-group
                    class="pa-0 ma-0"
                    v-model="config.mode"
                    row
                    dense
                >
                    <v-radio label="Single color" value="singleColor"></v-radio>
                    <v-radio label="Color scale" value="colorScale"></v-radio>
                </v-radio-group>
            </div>
        </div>
        <VuePerfectScrollbar style="height: calc(100% - 80px)">
            <SingleColorConditionalFormat
                ref="singleColorConditionalFormat"
                v-if="config.mode == 'singleColor'"
                :value="config.singleColorConfig"
                :columns="config.listColumns"
            />
        </VuePerfectScrollbar>
        <!-- <ColorScaleConditionFormat v-else v-model="config.colorScaleConfig" />         -->
    </div>
</template>

<script>
import SingleColorConditionalFormat from '@/components/dashboard/components/SingleColorConditionalFormat.vue';
// import ColorScaleConditionFormat from "@/components/dashboard/cellConfigs/ColorScaleConditionFormat.vue";
import { defaultConditionFormat } from '@/components/dashboard/configPool/defaultConfigs.js';
import SelectColumn from '@/components/common/bi/SelectColumn.vue';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { util } from '../../../plugins/util';

var entireRowFormatConfig = {
    as: 'Format entire row',
    uid: 'Format entire row',
    name: 'Format entire row',
    customItem: {
        icon: 'mdi-dots-horizontal',
        hideNameOnDisplay: true,
    },
    columnName: 'Format entire row',
    title: 'Format entire row',
    value: 'Format entire row',
};
export default {
    computed: {
        listColumnForSelect() {
            let cols = [entireRowFormatConfig];
            for (let col of this.config.listColumns) {
                cols.push(col);
            }
            return cols;
        },
    },
    methods: {
        initData() {
            if (this.config.mode == 'singleColor') {
                if (this.config.singleColorConfig.length == 0) {
                    // this.$refs.singleColorConditionalFormat.addMoreCondition();
                }
            }
        },
        changeSelectedCol(data) {
            let colName = data.value;
            let col = {};
            if (colName == 'Format entire row') {
                col = entireRowFormatConfig;
            } else {
                col = this.config.listColumns.filter((el) => {
                    return el.name == colName;
                })[0];
            }
            this.$set(this.config, 'applyColumnObj', col);
            this.$set(this.config, 'applyColumnUid', col.uid);
        },
    },
    props: {
        config: {
            type: Object,
            default() {
                return util.cloneDeep(defaultConditionFormat);
            },
        },
    },
    components: {
        SelectColumn,
        SingleColorConditionalFormat,
        VuePerfectScrollbar,
        // ColorScaleConditionFormat
    },
};
</script>

<style>
.symper-conditional-format-setting .item-title {
    width: 150px;
    font-size: 14px;
}
</style>

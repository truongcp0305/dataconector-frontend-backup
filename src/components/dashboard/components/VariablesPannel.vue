<template>
    <div class="h-100 w-100">
        <v-btn depressed small class="mb-2" @click="addVariable()"
            >{{ $t('v2.dashboard.addVariable') }}
        </v-btn>

        <v-data-table
            :headers="headers"
            :items="tableData"
            hide-default-footer
            class="elevation-1"
        >
            <template v-slot:[`item.name`]="{ item }">
                <v-text-field
                    @change="standardName(item)"
                    v-model="item.name"
                    dense
                    outlined
                    :placeholder="$t('v2.dashboard.pleaseInput')"
                    style="min-width: 120px"
                    single-line
                    hide-details
                    class="sym-small-size sym-style-input"
                ></v-text-field>
            </template>
            <template v-slot:[`item.agg`]="{ item }">
                <v-select
                    class="sym-select fs-13"
                    dense
                    flat
                    v-model="item.agg"
                    :items="aggFunctions"
                    item-text="label"
                    item-value="value"
                    outlined
                >
                </v-select>
            </template>

            <template v-slot:[`item.dataset`]="{ item }">
                <v-select
                    class="sym-select fs-13"
                    dense
                    flat
                    v-model="item.dataset"
                    :items="Object.values(datasets)"
                    item-text="aliasName"
                    item-value="id"
                    outlined
                >
                </v-select>
            </template>

            <template v-slot:[`item.column`]="{ item }">
                <select-column
                    :allColumns="datasets[item.dataset].columns"
                    :model="item.column"
                    :object="item"
                    :itemValue="'name'"
                    @change-value="changeSelectColumn"
                />
            </template>
            <template v-slot:[`item.action`]="{ item }">
                <v-icon
                    @click="removeVariable(item)"
                    style="font-size: 18px; min-width: 80px"
                    >mdi-delete</v-icon
                >
            </template>
        </v-data-table>
    </div>
</template>

<script>
import { util } from '../../../plugins/util';
import SelectColumn from '../../common/bi/SelectColumn.vue';
export default {
    components: {
        SelectColumn
    },

    data() {
        return {
            tableData: [],
            aggFunctions: [
                {
                    value: 'sum',
                    label: this.$t('v2.dashboard.sum')
                },
                {
                    value: 'avg',
                    label:  this.$t('v2.dashboard.avg')
                },
                {
                    value: 'min',
                    label: this.$t('v2.dashboard.min')
                },
                {
                    value: 'max',
                    label: this.$t('v2.dashboard.max')
                }
            ],
            headers: [
                {
                    text: this.$t('taskManagement.table.name'),
                    align: 'start',
                    value: 'name'
                },
                { text: this.$t('v2.dashboard.aggregate'), value: 'agg' },
                {
                    text: this.$t('v2.dashboard.dataset'),
                    value: 'dataset'
                },
                { text: this.$t('v2.dashboard.column'), value: 'column' },
                { text: this.$t('v2.dashboard.action'), value: 'action' }
            ]
        };
    },
    methods: {
        /**
         * hàm nhận sự kiện emit từ select column  -> gán column for item
         */
        changeSelectColumn(data) {
            let obj = data.object;
            let column = data.value;
            let index = this.tableData.indexOf(obj);
            if (index > -1) {
                this.tableData[index].column = column;
            }
        },

        standardName(item) {
            let text = item.name;
            text = util.str.nonAccentVietnamese(text, true);
            item.name = text;
        },
        removeVariable(item) {
            let index = this.tableData.indexOf(item);
            this.tableData.splice(index, 1);
        },
        addVariable() {
            this.tableData.push({
                name: '',
                agg: '',
                dataset: '', // dataset thực sự của cột được chọn, trong trường hợp chọn cột trong table
                column: '',
                displayDataset: '', // dataset để hiển thị
                impactedReportsIds: {} // id của các report có bị ảnh hưởng bởi variable này
            });
        },
        setItems(data) {
            this.tableData = data;
        },
        getItems() {
            return this.tableData;
        }
    },
    props: {
        originDatasets: {
            default() {
                return {};
            }
        }
    },
    computed: {
        datasets() {
            let rsl = {};
            let subDts = {};
            let originDts = util.cloneDeep(this.originDatasets);
            for (let dtsId in originDts) {
                let dts = originDts[dtsId];
                if (!dts.id_parent) {
                    rsl[dtsId] = dts;
                } else {
                    subDts[dtsId] = dts;
                }
            }

            for (let dtsId in rsl) {
                let dts = rsl[dtsId];
                if (dts.subDatasetIds) {
                    for (let subDtsId of dts.subDatasetIds) {
                        if (subDts[subDtsId]) {
                            rsl[dtsId].columns = rsl[dtsId].columns.concat(
                                subDts[subDtsId].columns
                            );
                        }
                    }
                }
            }

            rsl[''] = {
                columns: []
            };
            return rsl;
        }
    }
};
</script>

<style scoped>
.sym-select >>> .v-input__control {
    height: 28px !important;
}
.sym-select >>> .v-input__control .v-input__slot {
    height: 28px !important;
    min-height: 28px !important;
}
.sym-select >>> .v-input__append-inner {
    margin-top: 2px !important;
}
</style>

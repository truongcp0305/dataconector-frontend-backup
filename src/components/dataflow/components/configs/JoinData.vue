<template>
    <div
        class="symper-join-builder"
        :style="{
            height: height - 10 + 'px',
        }"
    >
        <div class="select-column-join p-3" ref="joinCondContainer">
            <div class="pb-3 mt-2">
                <span class="ml-2" style="font-size: 14px; font-weight: 600"
                    >{{$t('v2.dataflow.joinedColumns')}}</span
                >
                <v-select
                    style="width: 120px"
                    class="sym-small-size float-right border-white"
                    v-model="nodeData.configs.joinType"
                    :items="joinTypes"
                    :item-text="'label'"
                    :item-value="'value'"
                    outlined
                    dense
                ></v-select>
            </div>

            <div class="select-joined-colunns ma-2 fs-13">
                <v-expansion-panels
                    v-for="(columns, groupidx) in nodeData.configs
                        .joinedColumns"
                    :key="groupidx"
                    :name="groupidx"
                    multiple
                    flat
                    class="fs-13"
                >
                    <v-expansion-panel class="sym-expand-panel">
                        <v-expansion-panel-header
                            class="v-expand-header pa-0"
                            style="
                                height: 35px !important;
                                min-height: 35px !important;
                            "
                        >
                            <div class="w-100">
                                <span class="float-left">{{
                                    $t('v2.dataflow.joinCondition') +' '+ (groupidx + 1)
                                }}</span>
                                <v-btn
                                    class="float-right"
                                    x-small
                                    icon
                                    @click="removeJoinCondition(groupidx)"
                                    ><i class="mdi mdi-close fs-16"></i
                                ></v-btn>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <div
                                v-for="(column, columnIdx) in columns"
                                :key="columnIdx"
                                class="my-1 fs-13"
                            >
                                <div
                                    class="d-inline-block mr-2"
                                    style="width: 60px"
                                >
                                    Input #{{ columnIdx + 1 }}
                                </div>
                                <SelectColumn
                                    class="pl-1 d-inline-block"
                                    :allColumns="
                                        nodeData.configs.allColumns[columnIdx]
                                    "
                                    :model="column.uid"
                                    :itemValue="'uid'"
                                    @change-value="
                                        (vl) => {
                                            setJoinedColumnInfo(
                                                columnIdx,
                                                groupidx,
                                                vl,
                                            );
                                        }
                                    "
                                />
                            </div>
                            <v-checkbox
                                x-small
                                class="sym-small-size pa-0"
                                v-model="
                                    nodeData.configs.autoMergeJoinGroups[
                                        groupidx
                                    ].checked
                                "
                                :label="$t('v2.dataflow.mergeMismatchValues')"
                                @change="changeMergeMismatchValues"
                            ></v-checkbox>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>

                <v-btn
                    @click="addJoinCondition()"
                    class="mt-2 w-100"
                    outlined
                    small
                >
                    <i class="mdi mdi-plus mr-2"></i> {{$t('v2.dataflow.addJoinCondition')}}
                </v-btn>
            </div>
        </div>
        <DatasetColumnSelector
            :style="{
                height: columnSelectorHeight,
            }"
            :rowData="allColumns"
            @change-configs="handleChangeConfig"
        />
    </div>
</template>

<script>
import SelectColumn from '@/components/common/bi/SelectColumn.vue';
import DatasetColumnSelector from '@/components/dataset/DatasetColumnSelector.vue';
import { util } from '../../../../plugins/util';
import { saveChangeColumnValueToHistory } from '@/components/dataflow/configPool/dataflowConfig.js';
import { str } from '@/plugins/utilModules/str.js';

export default {
    components: {
        SelectColumn,
        DatasetColumnSelector,
    },
    props: {
        nodeData: {
            type: Object,
            default() {
                return {};
            },
        },
        height: {
            default: 300,
        },
    },
    data() {
        return {
            joinTypes: [
                {
                    label: this.$t('v2.dataflow.leftJoin'),
                    value: 'LEFT JOIN',
                },
                {
                    label: this.$t('v2.dataflow.innerJoin'),
                    value: 'INNER JOIN',
                },
                {
                    label: this.$t('v2.dataflow.fullJoin'),
                    value: 'FULL JOIN',
                },
                {
                    label: this.$t('v2.dataflow.rightJoin'),
                    value: 'RIGHT JOIN',
                },
            ],
        };
    },
    computed: {
        allColumns() {
            let rsl = [];
            this.nodeData.configs.allColumns.forEach((element) => {
                rsl = rsl.concat(element);
            });
            rsl = this.nodeData.configs.generatedColumns.concat(rsl);
            return rsl;
        },
        columnSelectorHeight() {
            return (
                this.height -
                util.getComponentSize(this.$refs.joinCondContainer).h +
                'px'
            );
        },
    },
    beforeMount() {},
    mounted() {},
    methods: {
        changeMergeMismatchValues() {
            let generatedColumns = [];
            let mapSelectedCols = this.nodeData.configs.generatedColumns.reduce(
                (map, el) => {
                    map[el.uid] = el.selected;
                    return map;
                },
                {},
            );

            for (
                let idx = 0;
                idx < this.nodeData.configs.autoMergeJoinGroups.length;
                idx++
            ) {
                let item = this.nodeData.configs.autoMergeJoinGroups[idx];
                let firstColumnInGroup = null;
                if (!Array.isArray(this.nodeData.configs.joinedColumns[idx])) {
                    continue;
                }
                for (let col of this.nodeData.configs.joinedColumns[idx]) {
                    if (col.columnName) {
                        firstColumnInGroup = col;
                        break;
                    }
                }
                if (item.checked) {
                    let newTitle =
                    this.$t('v2.dataflow.mergedMismatch') +
                        (firstColumnInGroup
                            ? firstColumnInGroup.title
                            : ' new column ');
                    newTitle = newTitle
                        .replace(/\(\#\s*([1-9]+)\)/gi, '')
                        .trim();
                    let newColName = str.nonAccentVietnamese(newTitle);
                    let uid =
                        this.nodeData.configs.newIdDataset + '_' + newColName;
                    generatedColumns.push({
                        joinedGroupIdx: idx, // chỉ những row được tạo ra từ merge mismatch value mới có key này
                        uid: uid,
                        title: newTitle,
                        columnName: newColName,
                        type: firstColumnInGroup.type,
                        selected: mapSelectedCols[uid] === false ? false : true,
                    });
                }
            }
            this.nodeData.configs.generatedColumns = generatedColumns;
            this.$emit('change-configs', {
                source: 'active-merge-mismatch-values',
            });
        },
        handleChangeSelectedColumns() {
            this.$emit('change-configs', {
                source: 'change-selected-columns',
            });
        },
        setJoinedColumnInfo(columnIdx, groupidx, data) {
            let configs = this.nodeData.configs;
            let joinedCol = configs.joinedColumns[groupidx][columnIdx];
            let groupColumn = configs.allColumns[columnIdx];

            for (let col of groupColumn) {
                if (col['uid'] == data.value) {
                    joinedCol['title'] = col['title'];
                    joinedCol['columnName'] = col['columnName'];
                    joinedCol['uid'] = col['uid'];
                    joinedCol['type'] = col['type'];
                    break;
                }
            }
            this.handleChangeConfig({
                type: 'set-joined-column',
            });
        },
        checkSelectedRows() {
            this.$refs.selectBuilder.checkSelectedRows();
        },
        handleChangeConfig(data) {
            if (this.timeOutEvtExe) {
                clearTimeout(this.timeOutEvtExe);
            }
            if (data.type == 'change-cell-value') {
                saveChangeColumnValueToHistory(
                    data.data,
                    this.nodeData.configs,
                );
            }
            this.timeOutEvtExe = setTimeout(
                (thisCpn, data) => {
                    thisCpn.$emit('change-configs', {
                        type: data.type,
                        data,
                    });
                },
                100,
                this,
                data,
            );
        },
        addJoinCondition() {
            let configs = this.nodeData.configs;
            configs.joinedColumns.push(this.getDefaultJoinCondition());
            configs.autoMergeJoinGroups.push({
                key: str.randomString().toLowerCase() + Date.now(),
                checked: false,
            });
        },
        removeJoinCondition(idx) {
            this.nodeData.configs.joinedColumns.splice(idx, 1);
            this.nodeData.configs.autoMergeJoinGroups.splice(idx, 1);
        },
        getDefaultJoinCondition(inputNum = 0) {
            let rsl = [];
            if (inputNum == 0) {
                inputNum = this.nodeData.configs.allColumns.length;
            }
            for (let i = 0; i < inputNum; i++) {
                rsl.push({
                    uid: '',
                    columnName: '',
                    title: '',
                });
            }
            return rsl;
        },
    },
};
</script>

<style>
.symper-join-builder .v-expansion-panel-content__wrap {
    padding-left: 8px;
}
</style>

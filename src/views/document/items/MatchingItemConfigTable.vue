<template>
    <div class="matching-item-config-table pr-5">
        <v-row class="mr-1">
            <v-col class="col-md-7">
                <div class="header fs-13">
                    {{
                        $t(
                            'document.editor.matchingItem.config_data_table_source'
                        )
                    }}
                </div>
                <ConfigSourceTable
                    :name="nameSourceArea"
                    :data="configSourceTable"
                    @remove-table="removeTable"
                    @change-columns="changeColumns"
                    @change-input-body="changeInputBody"
                    @change-name="changeNameSource"
                />
            </v-col>
            <v-col class="col-md-5" style="margin-left: -8px">
                <div class="header fs-13">
                    {{
                        $t(
                            'document.editor.matchingItem.config_data_table_target'
                        )
                    }}
                </div>
                <ConfigTargetTable
                    :name="nameTargetAndResultArea"
                    :listControl="listControl"
                    :data="configTargetTable"
                    @change-name="changeTargetAndResultArea"
                />
            </v-col>
        </v-row>
    </div>
</template>
<script>
import ConfigSourceTable from './ConfigSourceTable';
import ConfigTargetTable from './ConfigTargetTable';

export default {
    name: 'MatchingItemConfigTable',
    components: {
        ConfigTargetTable,
        ConfigSourceTable
    },
    props: {
        listControl: {
            type: Array,
            default: () => {
                return [];
            }
        },
        data: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },
    watch: {
        'data.nameSourceArea': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.nameSourceArea = vl;
            }
        },
        'data.nameTargetAndResultArea': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.nameTargetAndResultArea = vl;
            }
        },
        'data.sourceTables': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.configSourceTable = vl;
            }
        },
        'data.targetAndResultTable': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.configTargetTable = vl;
            }
        }
    },
    data() {
        return {
            configTargetTable: {
                col: [
                    {
                        name: '',
                        isShowTargetTable: false,
                        isShowResultTable: false,
                        sourceTableId: '',
                        sourceTableName: '',
                        controlMapping: ''
                    }
                ],
                isDuplicateData: false,
                formulaValidate: '',
                formulaUpdate: '',
                rowGroup: [],
                colSearch: []
            },
            configSourceTable: {
                tb1: {
                    formula: '',
                    quantityColumn: '',
                    name: '',
                    colSearch: [],
                    col: [],
                    rowGroup: [],
                    identityColumn: ''
                },
                tb2: {
                    formula: '',
                    quantityColumn: '',
                    name: '',
                    colSearch: [],
                    col: [],
                    rowGroup: [],
                    identityColumn: ''
                }
            },
            nameSourceArea: '',
            nameTargetAndResultArea: ''
        };
    },
    methods: {
        // thay đổi cột ở bảng nguồn
        changeColumns(columns) {
            this.setRowDataTableTarget(columns);
            // this.setRowGroupAndSearchColumnOptions(columns);
        },
        changeInputBody() {
            this.$emit('change-input-body');
        },
        changeNameSource(name) {
            this.$emit('change-name', name);
        },
        removeTable(name) {
            this.$emit('remove-table', name);
        },
        changeTargetAndResultArea(name) {
            this.$emit('change-name-target', name);
        },
        setRowGroupAndSearchColumnOptions(columns) {
            this.configTargetTable.rowGroup = columns;
        },
        // lấy data cho bảng đầu ra
        setRowDataTableTarget(columns) {
            let rows = [];
            function getColId(col) {
                return col.sourceTableId + '||' + col.name;
            }

            let mapCols = this.configTargetTable.col.reduce((map, col) => {
                map[getColId(col)] = col;
                return map;
            }, {});

            columns.map((col) => {
                let mapedCol = mapCols[getColId(col)];
                if (mapedCol) {
                    rows.push(mapedCol);
                } else {
                    rows.push({
                        name: col.name,
                        isShowTargetTable: false,
                        isShowResultTable: false,
                        sourceTableId: col.sourceTableId,
                        sourceTableName: '',
                        controlMapping: ''
                    });
                }
            });
            this.configTargetTable.col = rows;
            this.configTargetTable.rowGroup =
                this.configTargetTable.rowGroup.filter((col) => {
                    if (
                        columns.filter((nc) => {
                            return (
                                nc.sourceTableId == col.sourceTableId &&
                                nc.name == col.name
                            );
                        }).length
                    ) {
                        return true;
                    } else {
                        return false;
                    }
                });
        }
    }
};
</script>
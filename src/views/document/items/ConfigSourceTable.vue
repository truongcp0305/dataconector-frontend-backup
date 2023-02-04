<template>
    <div class="config-source-table border-lightgrey">
        <div class="header d-flex justify-space-between pa-2 pb-0">
            <FormTpl
                :titleSize="'normal'"
                @input-value-changed="changeValue"
                :allInputs="allInput"
            />
            <v-btn class="warning" depressed small @click="addTable">{{
                $t('document.editor.matchingItem.add_table')
            }}</v-btn>
        </div>
        <div class="body pl-2">
            <draggable
                :disabled="!draggable"
                :animation="250"
                class="h-100 w-100"
            >
                <transition-group
                    type="transition"
                    name="flip-list"
                    style="overflow: auto;"
                    class="d-flex"
                >
                    <SourceTable
                        v-for="(column, index) in tableSource"
                        :key="index + ''"
                        :data="column"
                        @mouse-out-icon="mouseOutIcon"
                        @mouse-over-icon="mouseOverIcon"
                        :name="index"
                        @remove="deleteTable"
                        @change-input-body="changeValueInputBody"
                        @change-columns="changeColumns($event, index)"
                        class="board-column mr-2 pb-1"
                    />
                </transition-group>
            </draggable>
        </div>
    </div>
</template>
<script>
import draggable from 'vuedraggable';
import FormTpl from '@/components/common/FormTpl.vue';
import SourceTable from './SourceTable';
import { util } from '@/plugins/util';
export default {
    name: 'ConfigSourceTable',
    components: {
        FormTpl,
        SourceTable,
        draggable
    },
    props: {
        data: {
            type: Object,
            default: () => {
                return {};
            }
        },
        name: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            allInput: {
                nameSourceTable: {
                    title: this.$t(
                        'document.editor.matchingItem.enter_name_area'
                    ),
                    type: 'text',
                    value: '',
                    hideTitle: true
                }
            },
            tableSource: {},
            draggable: false
        };
    },
    watch: {
        data: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.tableSource = vl;
            }
        },
        name: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.allInput.nameSourceTable.value = this.name;
            }
        }
    },

    methods: {
        addTable() {
            let lastTable = Object.keys(this.tableSource);
            lastTable = lastTable[lastTable.length - 1];
            lastTable = lastTable.replace('tb', '');
            lastTable = Number(lastTable) + 1;
            lastTable = 'tb' + lastTable;
            this.$set(this.tableSource, lastTable, {
                formula: '',
                quantityColumn: '',
                name: '',
                colSearch: [],
                col: [],
                rowGroup: []
            });
            // this.$emit('add-table');
        },
        deleteTable(tableIdx) {
            let countTable = Object.keys(this.tableSource).length;
            if (countTable == 2) {
                this.$snotifyError(
                    '',
                    this.$t('document.editor.matchingItem.can_not_delete'),
                    this.$t('document.editor.matchingItem.min_two_column')
                );
            } else {
                delete this.tableSource[tableIdx];
                let table = util.cloneDeep(this.tableSource);
                this.tableSource = {};
                this.$set(this, 'tableSource', table);
                this.$emit('remove-table', this.tableSource);
            }
        },
        changeValue(name, inputInfo, data) {
            this.$emit('change-name', inputInfo.value);
        },
        changeValueInputBody() {
            this.$emit('change-input-body');
        },
        mouseOverIcon() {
            this.draggable = true;
        },
        mouseOutIcon() {
            this.draggable = false;
        },
        changeColumns(columns, tableIdx) {
            this.tableSource[tableIdx].col = columns;
            let allColumns = [];
            Object.keys(this.tableSource).map((nameTbl) => {
                allColumns = [...allColumns, ...this.tableSource[nameTbl].col];
            });
            this.$emit('change-columns', allColumns);
        }
    }
};
</script>
<style scoped>
.config-source-table {
    height: 465px;
    border-radius: 4px;
}
.input-card >>> .v-text-field .v-input__control .v-input__slot {
    height: 22px !important;
}
</style>
<template>
    <div class="config-target-table border-lightgrey">
        <div class="header d-flex justify-space-between pa-2 pb-0">
            <FormTpl
                :titleSize="'normal'"
                :allInputs="allInput"
                @input-value-changed="changeNameArea"
            />
        </div>
        <div class="body pa-2 ma-2 mt-0" style="background: #f2f2f2">
            <DataTable
                class="ag-table"
                :controlValueKey="'controlMapping'"
                style="height: 230px"
                :columnDefs="columnDefs"
                :rowData="data.col"
                :autoHeight="false"
                :lists="controls"
                :gridOptions="gridOptions"
                @row-drag-end="rowDragEnd"
                @change="handleSelectedRow"
            >
            </DataTable>
            <div class="pa-2">
                <FormTpl
                    class="input"
                    :titleSize="'normal'"
                    :singleLine="true"
                    :labelWidth="'251px'"
                    :allInputs="search"
                    @input-value-changed="changeSearchCol"
                />
                <RowGroup
                    @change-row-selected="changeRowSelected"
                    :rowSelected="rowSelected"
                    :rows="rows"
                />
            </div>
        </div>
    </div>
</template>
<script>
import FormTpl from '@/components/common/FormTpl.vue';
import DataTable from '@/components/common/customTable/DataTable';
import RowGroup from './RowGroup.vue';
import { util } from '@/plugins/util';
export default {
    name: 'ConfigTargetTable',
    components: {
        FormTpl,
        DataTable,
        RowGroup
    },
    props: {
        data: {
            type: Object,
            default: () => {
                return {};
            }
        },
        listControl: {
            type: Array,
            default: () => {
                return [];
            }
        },
        name: {
            type: String,
            default: ''
        }
    },

    watch: {
        listControl: {
            deep: true,
            immediate: true,
            handler(data) {
                let controlMapping = [];
                data.map((d) => {
                    controlMapping.push({ id: d.key, name: d.name });
                });
                this.controls.controlMapping = util.cloneDeep(controlMapping);
            }
        },
        'data.col': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                let columns = [];
                let rowGroup = [];
                let rowSelected = util.cloneDeep(this.data.rowGroup);
                vl.map((v) => {
                    if (!rowSelected.includes(v)) {
                        rowGroup.push(v);
                    }
                    columns.push({
                        name: v.name,
                        id: v.name,
                        sourceTableId: v.sourceTableId
                    });
                });
                this.setRowGroup(rowGroup);
                this.search.searchCol.options = columns;
            }
        },
        'data.rowGroup': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                let columns = [];
                vl.map((v) => {
                    columns.push(v);
                });
                this.rowSelected = util.cloneDeep(columns);
            }
        },
        name: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.allInput.nameTargetTable.value = vl;
            }
        }
    },
    data() {
        const self = this;
        return {
            allInput: {
                nameTargetTable: {
                    title: this.$t(
                        'document.editor.matchingItem.enter_name_area'
                    ),
                    type: 'text',
                    value: '',
                    hideTitle: true
                }
            },
            search: {
                searchCol: {
                    title: self.$t('v2.doc.searchFields'),
                    type: 'autocomplete',
                    multipleSelection: true,
                    showId: false,
                    menuProps: { maxHeight: 250 },
                    deleteable: true,
                    isSelectionChip: true,
                    value: '',
                    singleLine: true,
                    info: '',
                    onSearch(value) {
                        // self.searchObjectIdentifier(value);
                    },
                    options: [],
                    value: '',
                    hidePlaceholder: true
                }
            },
            rowSelected: [],
            rows: [],
            controls: { controlMapping: [] },
            gridOptions: {
                containerHeight: 450,
                suppressRowClickSelection: true,
                headerHeight: 25,
                rowHeight: 25,
                enableRangeSelection: true,
                enableRangeHandle: true,
                suppressClipboardPaste: true,
                applyColumnDefOrder: true,
                animateRows: true,
                rowDragManaged: true,
                enableMultiRowDragging: true
            },
            columnDefs: [
                {
                    headerName: '',
                    field: 'drag',
                    width: 35,
                    rowDrag: true,
                    icons: {
                        rowDrag: '<i class="mdi move-icon mdi-arrow-up-down"/>'
                    }
                },
                {
                    headerName: self.$t('v2.doc.showTablePP'),
                    field: 'isShowTargetTable',
                    width: 120,
                    cellRenderer: (params) => {
                        return self.renderCheckBox(params);
                    }
                },
                {
                    headerName: self.$t('v2.doc.showTableKQ'),
                    field: 'isShowResultTable',
                    width: 120,
                    cellRenderer: (params) => {
                        return self.renderCheckBox(params);
                    }
                },
                {
                    field: 'sourceTableId',
                    hide: true
                },
                {
                    field: 'sourceTableName',
                    hide: true
                },
                {
                    headerName: self.$t('v2.doc.columnName'),
                    field: 'name',
                    width: 100
                },
                {
                    headerName: 'Mapping',
                    field: 'controlMapping',
                    width: 100,
                    editable: true
                },
                {
                    headerName: 'Control Id',
                    field: 'controlMappingId',
                    hide: true
                },
                {
                    headerName: '',
                    field: 'action',
                    width: 50,
                    cellRenderer: (params) => {
                        const eDiv = document.createElement('div');
                        let input = `<i class="mdi mdi-close"/>`;
                        eDiv.innerHTML =
                            '<span class="my-css-class">' + input + '</span>';
                        eDiv.addEventListener('click', () => {
                            self.removeRow(params);
                        });
                        return eDiv;
                    }
                }
            ],
            positionBox: {
                width: 100,
                left: 1277,
                top: 184
            }
        };
    },
    methods: {
        setRowGroup(columns) {
            this.rows = columns;
        },
        rowDragEnd(data) {
            this.data.col = data.data;
        },
        handleSelectedRow() {},
        changeSearchCol(name, inputInfo, data) {
            let colSearch = [];
            data.items.map((item) => {
                inputInfo.value.map((v) => {
                    if (item.id == v) {
                        colSearch.push({
                            name: item.name,
                            sourceTableId: item.sourceTableId
                        });
                    }
                });
            });

            this.data.colSearch = colSearch;
        },
        changeRowSelected() {
            let rows = [];
            this.rowSelected.map((r) => {
                rows.push({
                    name: r.name,
                    sourceTableId: r.sourceTableId
                });
            });
            this.data.rowGroup = rows;
        },
        changeNameArea(name, inputInfo, data) {
            this.$emit('change-name', inputInfo.value);
        },
        removeRow(params) {
            let rowIdex = params.node.rowIndex;
            this.data.col.splice(rowIdex, 1);
        },
        renderCheckBox(params) {
            const eDiv = document.createElement('div');
            let input = `<input class="checkbox" type='checkbox' ${
                params.value ? 'checked' : ''
            } />`;
            eDiv.innerHTML = '<span class="my-css-class">' + input + '</span>';
            const eButton = eDiv.querySelectorAll('.checkbox')[0];
            eButton.addEventListener('click', () => {
                params.node.setDataValue(params.colDef.field, !params.value);
            });
            return eDiv;
        }
    }
};
</script>
<style scoped>
.config-target-table {
    height: 465px;
    max-height: 465px;
    border-radius: 4px;
}
.input >>> .v-autocomplete:not(.v-input--is-focused).v-select--chips input {
    max-height: unset !important;
}
.list-columns {
    width: 160px;
}
.card-autocomplete {
    max-height: 300px !important;
}
</style>
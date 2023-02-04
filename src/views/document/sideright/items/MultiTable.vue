<template>
    <div class="symper-multi-table" style="border: none !important">
        <v-expansion-panel
            class="m-0"
            v-for="(item, index) in value"
            :key="index"
            v-model="openedPanel"
        >
            <v-expansion-panel-header class="v-expand-header">
                {{$t('v2.doc.group')}} {{ index + 1 }}
                <template v-slot:actions>
                    <button x-small class="mr-2">
                        <v-icon>mdi mdi-chevron-down</v-icon>
                    </button>
                    <button
                        x-small
                        class="mr-2"
                        @click.stop.prevent="deleteGroup(index)"
                    >
                        <v-icon :size="15">mdi mdi-close</v-icon>
                    </button>
                </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="sym-v-expand-content">
                <FormTpl
                    :singleLine="true"
                    :labelWidth="`100px`"
                    class="s-style-config px-2"
                    :allInputs="allInputs[index]"
                    @input-value-changed="getChangeInput($event, index)"
                >
                </FormTpl>
                <DataTable
                    class="ag-table"
                    :columnDrag="'control'"
                    :columnDefs="columnDefs"
                    @row-drag-end="onRowDragEnd($event, index)"
                    :rowData="item.mapping"
                    :gridOptions="gridOptions"
                >
                </DataTable>
            </v-expansion-panel-content>
        </v-expansion-panel>
        <div
            class="color-white d-flex justify-center my-2 pa-1 add-group-btn"
            @click="addGroup"
        >
            <span style="color: white">{{
                $t('document.editor.sidebarRight.add_more_group_data')
            }}</span>
        </div>
    </div>
</template>
<script>
import DataTable from '@/components/common/customTable/DataTable';
import { util } from '@/plugins/util';

export default {
    components: {
        DataTable,
        FormTpl: () => import('@/components/common/FormTpl'),
    },
    props: {
        value: {
            type: Array,
            default() {
                return [];
            },
        },
        nodes: {
            type: Array,
            default() {
                return [];
            },
        },
        controls: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        const self = this;
        return {
            openedPanel: [0],
            columnDefs: [
                {
                    headerName: 'Dataflow',
                    field: 'fieldDataflow',
                    width: 100,
                },
                {
                    headerName: 'Field',
                    field: 'control',
                    rowDrag: true,
                    icons: {
                        rowDrag: '<i class="mdi move-icon mdi-arrow-up-down"/>',
                    },
                },
            ],
            allInputs: {
                0: {
                    nodeDataFlow: {
                        title: this.$t(
                            'document.editor.sidebarRight.input_data',
                        ),
                        type: 'autocomplete',
                        value: '',
                        menuProps: { maxHeight: 300 },
                        info: '',
                        showId: false,
                        options: [],
                    },
                    controlInDoc: {
                        title: this.$t(
                            'document.editor.sidebarRight.insert_data',
                        ),
                        type: 'autocomplete',
                        value: '',
                        menuProps: { maxHeight: 300 },
                        info: '',
                        showId: false,
                        options: [],
                    },
                },
            },
            gridOptions: {
                containerHeight: 450,
                suppressRowClickSelection: true,
                headerHeight: 25,
                rowHeight: 120,
                enableRangeSelection: true,
                enableRangeHandle: true,
                suppressClipboardPaste: true,
                applyColumnDefOrder: true,
            },
        };
    },
    created() {
        this.gridOptions.domLayout = 'autoHeight';
    },
    mounted() {
        const self = this;
    },
    watch: {
        nodes: {
            immediate: true,
            deep: true,
            handler: function (vl) {
                const self = this;
                self.setListNodes(vl);
            },
        },
        controls: {
            immediate: true,
            deep: true,
            handler: function (vl) {
                const self = this;
                self.setListControl(vl);
            },
        },
        value: {
            immediate: true,
            deep: true,
            handler: function (vl) {
                const self = this;
                if (
                    Object.keys(this.value).length !=
                    Object.keys(self.allInputs).length
                ) {
                    self.allInputs = { 0: self.allInputs[0] };
                    self.value.map((val, valIdx) =>
                        self.refreshAllInputValue(valIdx),
                    );
                }
                Object.keys(this.value).map((rowIdx) => {
                    if (
                        self.value[rowIdx].node &&
                        self.allInputs[rowIdx] &&
                        self.allInputs[rowIdx].nodeDataFlow.value == ''
                    ) {
                        self.allInputs[rowIdx].nodeDataFlow.value =
                            self.value[rowIdx].node;
                    }
                    if (
                        self.value[rowIdx].control &&
                        self.allInputs[rowIdx] &&
                        self.allInputs[rowIdx].controlInDoc.value == ''
                    ) {
                        self.allInputs[rowIdx].controlInDoc.value =
                            self.value[rowIdx].control;
                    }
                });
                if (this.value[0].mapping.length == 0) {
                    this.value[0].mapping.push({
                        fieldDataflow: '',
                        control: '',
                        controlId: '',
                    });
                }
            },
        },
    },

    methods: {
        refreshAllInputValue(index) {
            if (index != 0) {
                this.allInputs[index] = util.cloneDeep(this.allInputs[0]);
            }
            this.allInputs[index].nodeDataFlow.value = '';
            this.allInputs[index].controlInDoc.value = '';
        },
        // lấy danh sách các node dataflow để đổ ra dữ liệu
        setListNodes(nodes) {
            let options = [];
            nodes.map((node) => {
                options.push({
                    id: node.id,
                    name: node.name,
                });
            });
            Object.keys(this.allInputs).map((input, i) => {
                this.allInputs[i].nodeDataFlow.value = '';
                this.allInputs[i].nodeDataFlow.options = options;
            });
        },
        // lấy danh sách các control để đổ ra dữ liệu
        setListControl(controls) {
            Object.keys(this.allInputs).map((input, i) => {
                if (this.allInputs[i].nodeDataFlow.value == '') {
                    this.allInputs[i].controlInDoc.value = '';
                }
                this.allInputs[i].controlInDoc.options = controls;
            });
        },
        getRowData() {
            let rowData = {};
            this.value.map((v, idx) => {
                rowData[idx] = v.mapping;
            });
            return rowData;
        },
        deleteGroup(index) {
            let value = [];
            if (this.value.length == 1) {
                this.$snotifyError(
                    '',
                    this.$t('document.editor.notify.can_not_remove_group'),
                );
                return;
            }
            this.value.map((v, vIdx) => {
                if (vIdx != index) {
                    value.push(v);
                }
            });
            this.openedPanel.splice(index, 1);
            this.$set(this, 'value', value);
            this.$emit('change', this.value);
        },
        addGroup() {
            this.openedPanel.push(this.value.length - 1);
            this.value.push({
                node: '',
                control: '',
                mapping: [{ fieldDataflow: '', control: '', controlId: '' }],
            });
            this.addAllInput();
        },
        addAllInput() {
            let newGroup = util.cloneDeep(this.allInputs[0]);
            newGroup.controlInDoc.value = '';
            newGroup.nodeDataFlow.value = '';
            this.allInputs[Object.keys(this.allInputs).length] = newGroup;
        },
        onRowDragEnd(data, index) {
            let temp = this.value[index].mapping[data.startRow].controlId;
            this.value[index].mapping[data.startRow].controlId =
                this.value[index].mapping[data.endRow].controlId;
            this.value[index].mapping[data.endRow].controlId = temp;
            this.$emit('change', this.value);
        },
        getChangeInput(name, index) {
            this.getFieldNodeLoadInsertTable(name, index);
            this.$set(this, 'value', this.value);
            this.$emit('change', this.value);
        },
        //set lại giá trị allInput theo từng group
        setValueAllInput(index) {
            this.value[index].control =
                this.allInputs[index].controlInDoc.value;
            this.value[index].node = this.allInputs[index].nodeDataFlow.value;
        },

        // lấy cấu hình các trường trong node load + control đưa vào bảng
        getFieldNodeLoadInsertTable(name, index) {
            this.value[index].mapping = [];
            let val = this.allInputs[index].nodeDataFlow.value;
            let field = this.nodes.filter((n) => n.id == val)[0];
            let controlValue = this.allInputs[index].controlInDoc.value;
            this.setValueAllInput(index);
            if (controlValue) {
                // trường hợp có control
                let control = util.cloneDeep(
                    this.controls.filter((c) => c.id == controlValue)[0],
                );
                if (control.type != 'table') {
                    // trường hợp control ngoài bảng
                    if (field) {
                        // có chọn node
                        field = field.field;
                        field.map((f) => {
                            this.value[index].mapping.push({
                                fieldDataflow: f.name,
                                control: control.name,
                                controlId: controlValue,
                            });
                        });
                    } else {
                        // không chọn node
                        this.value[index].mapping.push({
                            fieldDataflow: '',
                            control: control.name,
                            controlId: controlValue,
                        });
                    }
                } else {
                    // trường hợp control bảng
                    if (
                        field &&
                        field.field.length >=
                            Object.keys(control.children).length
                    ) {
                        // field trong node dataflow > control
                        field.field.map((f, fIdx) => {
                            let row = { fieldDataflow: f.name };
                            if (fIdx <= Object.keys(control.children).length) {
                                row['control'] = f.name;
                                row['controlId'] = Object.keys(
                                    control.children,
                                )[fIdx];
                            }
                            this.value[index].mapping.push(row);
                        });
                    } else {
                        Object.keys(control.children).map((chil, chilIdx) => {
                            let row = {
                                control:
                                    control.children[chil].properties.name
                                        .value,
                                controlId: chil,
                            };
                            if (field && chilIdx < field.field.length) {
                                row['fieldDataflow'] =
                                    field.field[chilIdx].name;
                            }
                            this.value[index].mapping.push(row);
                        });
                    }
                }
            } else {
                //trường hợp không có control
                if (field) {
                    field.field.map((f, fIdx) => {
                        this.value[index].mapping.push({
                            fieldDataflow: f.name,
                        });
                    });
                }
            }
        },
        // cập nhật lại dữ liệu dòng trong bảng
        handlerRowClicked(params) {
            this.$emit('row-click', this.name);
        },
    },
};
</script>
<style scoped>
.add-group-btn {
    background-color: #fb7e00;
    border-radius: 4px;
}
.add-group-btn:hover {
    cursor: pointer;
}
.v-expand-header {
    font-size: 13px;
    font-weight: 500;
    min-height: unset;
    padding: 4px 8px;
    background: #f2f2f2;
    margin-bottom: 8px;
}
.ag-table >>> .ag-header-cell-menu-button {
    display: none !important;
}
</style>
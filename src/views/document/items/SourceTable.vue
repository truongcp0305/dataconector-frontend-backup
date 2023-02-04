<template>
    <div class="source-table px-3">
        <div class="header align-center justify-space-between pa-1 pb-0" style="height: 60px;position: relative;">
            <v-btn icon small text style="position: absolute;top:10px; left: -6px;">
                <v-icon
                    :size="15"
                    @mouseover="mouseOverIcon"
                    @mouseout="mouseOutIcon"
                    >mdi-apps</v-icon
                >
            </v-btn>
            <FormTpl
                class="select-control w-100 mx-2"
                :titleSize="'medium'"
                :labelWidth="`0px`"
                @input-value-changed="changeHeaderInput"
                :allInputs="headerInput"
                style="position: absolute;left:20px;display: inline-block;width: calc(100% - 64px)!important;"
            />
            <v-btn icon small text @click="remove" style="position: absolute;right:0px;top:10px;">
                <v-icon :size="15">mdi-close</v-icon>
            </v-btn>
        </div>
        <div class="body">
            <v-btn
                icon
                x-small
                @click="runFormularEditor"
                class="icon-run-formulas ml-1"
            >
                <i class="mdi mdi-play-outline fs-16"></i>
            </v-btn>
            <FormTpl
                ref="formTpl"
                class="select-control"
                :titleSize="'medium'"
                :labelWidth="`140px`"
                :allInputs="bodyInput"
                @input-value-changed="changeBodyInput"
                @run-formula-finished="runFormularFinished"
            />
            <RowGroup
                @change-row-selected="changeRowSelected"
                :rowSelected="rowSelected"
                :rows="rows"
            />
        </div>
    </div>
</template>
<script>
import FormTpl from '@/components/common/FormTpl.vue';
import RowGroup from './RowGroup.vue';
export default {
    components: {
        FormTpl,
        RowGroup
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
            default: () => {
                return '';
            }
        }
    },
    data() {
        const self = this;
        return {
            dataResource: null,
            headerInput: {
                nameTable: {
                    title: this.$t('document.editor.matchingItem.enterNameTable'),
                    type: 'text',
                    value: '',
                    hideTitle: true,
                    validateStatus: {
                        isValid: true,
                        message: ''
                    },
                    validate() {
                        this.validateStatus.isValid = true;
                        this.validateStatus.message = '';
                        if (this.value == '' || this.value.trim() == '') {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message =
                                self.$t('validate.required');
                        }
                        if (this.value.length > 100) {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message =
                                self.$t('validate.max_100');
                        }
                    }
                }
            },
            rowSelected: [],
            rows: [],
            bodyInput: {
                ['script' + this.name]: {
                    title: this.$t('v2.doc.queryFormula'),
                    value: '',
                    showBtnRun: true,
                    type: 'script'
                },
                colSearch: {
                    title: this.$t(
                        'document.editor.matchingItem.search_on_column'
                    ),
                    showSelectAll: true,
                    type: 'autocomplete',
                    multipleSelection: true,
                    showId: false,
                    menuProps: { maxHeight: 250 },
                    deleteable: true,
                    isSelectionChip: true,
                    singleLine: true,
                    value: '',
                    options: [],
                    classes: 'pb-1',
                    hidePlaceholder: true
                },
                quantityColumn: {
                    title: this.$t(
                        'document.editor.matchingItem.quatity_column'
                    ),
                    type: 'autocomplete',
                    showId: false,
                    menuProps: { maxHeight: 250 },
                    isSelectionChip: true,
                    value: '',
                    singleLine: true,
                    options: [],
                    classes: 'pb-1',
                    hidePlaceholder: true
                },
                identityColumn: {
                    title: this.$t(
                        'document.editor.matchingItem.identity_column'
                    ),
                    type: 'autocomplete',
                    showId: false,
                    menuProps: { maxHeight: 250 },
                    isSelectionChip: true,
                    value: '',
                    singleLine: true,
                    options: [],
                    required: true,
                    classes: 'pb-1',
                    hidePlaceholder: true
                }
            }
        };
    },
    created() {},
    watch: {
        'data.name': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.headerInput.nameTable.value = vl;
            }
        },
        'data.formula': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.bodyInput['script' + this.name].value = vl;
            }
        },
        'data.colSearch': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.bodyInput.colSearch.value = vl;
            }
        },

        'data.quantityColumn': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.bodyInput.quantityColumn.value = vl;
            }
        },
        'data.identityColumn': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.bodyInput.identityColumn.value = vl;
            }
        },
        'data.rowGroup': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                let columns = [];
                vl.map((v) => {
                    columns.push({
                        name: v
                    });
                });
                this.setRowGroupSelected(columns);
            }
        },
        'data.col': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                let columns = [];
                let rowGroup = [];
                let rowSelected = this.data.rowGroup;
                vl.map((v) => {
                    if (!rowSelected.includes(v.field)) {
                        rowGroup.push({
                            name: v.field ? v.field : v.name
                        });
                    }
                    columns.push({
                        name: v.field ? v.field : v.name,
                        id: v.field ? v.field : v.name
                    });
                });
                this.setRowGroup(rowGroup);
                this.setOptionsForAllInput(columns);
            }
        }
    },
    methods: {
        runFormularEditor() {
            let value = this.bodyInput['script' + this.name].value;
            if (!value) {
                this.$snotifyError('', this.$t('formulasEditor.notEmpty'));
            } else {
                this.$refs.formTpl.$refs[
                    'inputItem_script' + this.name
                ][0].executeFormulas();
            }
        },
        mouseOverIcon() {
            this.$emit('mouse-over-icon');
        },
        mouseOutIcon() {
            this.$emit('mouse-out-icon');
        },
        changeRowSelected() {
            let rows = [];
            this.rowSelected.map((r) => {
                rows.push(r.name);
            });
            this.data.rowGroup = rows;
        },
        changeBodyInput(name, inputInfo, data) {
            if (name.includes('script')) {
                this.data.formula = data;
            } else {
                this.data[name] = inputInfo.value;
            }
            this.$emit('change-input-body');
        },
        changeHeaderInput(name, inputInfo, data) {
            this.data.name = data;
        },
        remove() {
            this.$emit('remove', this.name);
        },
        // thêm các option cho input
        setOptionsForAllInput(columns) {
            this.bodyInput.colSearch.options = columns;
            this.bodyInput.identityColumn.options = columns;
            this.bodyInput.quantityColumn.options = columns;
        },
        refreshValueAllInput() {
            this.rowSelected = [];
            this.rows = [];
            this.bodyInput.colSearch.value = [];
            this.bodyInput.identityColumn.value = '';
            this.bodyInput.quantityColumn.value = '';
        },
        setRowGroup(columns) {
            let rows = [];
            let rowSelected = this.data.rowGroup;
            columns.map((col) => {
                if (!rowSelected.includes(col.name)) {
                    rows.push(col);
                }
            });
            this.rows = rows;
        },
        setRowGroupSelected(columns) {
            this.rowSelected = columns;
        },
        runEmptyFormular() {
            this.refreshValueAllInput();
        },
        recheckConfigedInfo(columns) {
            let mapColumns = columns.reduce((map, col) => {
                map[col.id] = col;
                return map;
            }, {});
            this.recheckGroupTable(mapColumns);
        },
        recheckGroupTable(mapColumns) {
            this.data.rowGroup = this.rowSelected.reduce((arr, col) => {
                if (mapColumns[col.name]) {
                    arr.push(col.name);
                }
                return arr;
            }, []);
        },
        runFormularFinished(data) {
            this.dataResource = data;
            let ignoreColumn = [
                'document_object_create_time',
                'document_object_id',
                'document_object_last_user_update_id',
                'document_object_is_deleted',
                'document_object_parent_id',
                'document_object_parent_uuid',
                'document_object_task_id',
                'document_object_update_time',
                'document_object_user_created_id',
                'document_object_uuid',
                'document_object_workflow_id',
                'document_object_workflow_object_id'
            ];
            let columns = [];
            data = data.data;
            if (data.data && data.data.length > 0 && !data.lastErrorMessage) {
                Object.keys(data.data[0]).map((col) => {
                    if (!ignoreColumn.includes(col)) {
                        columns.push({
                            id: col,
                            name: col,
                            sourceTableId: this.name
                            // title: col,
                        });
                    }
                });
                this.setOptionsForAllInput(columns);
                this.setRowGroup(columns);
                this.recheckConfigedInfo(columns);
                this.$snotifySuccess(
                    '',
                    this.$t('document.editor.matchingItem.run_formular_success')
                );
                this.$emit('change-columns', columns);
            } else {
                this.$snotifyError(
                    '',
                    this.$t('document.editor.matchingItem.run_formular_fail'),
                    data.lastErrorMessage
                );
            }
        }
    }
};
</script>
<style scoped>
.source-table {
    height: 403px;
    overflow-y: scroll;
    overflow-x: hidden;
    border-radius: 2px;
    background: #f2f2f2;
    min-width: 346px !important;
    margin-bottom: 4px;
}
.body {
    position: relative;
}
.icon-run-formulas {
    position: absolute;
    right: 25px;
    top: -1px;
    z-index: 1;
}
.select-control
    >>> .v-autocomplete:not(.v-input--is-focused).v-select--chips
    input {
    max-height: unset !important;
}
</style>
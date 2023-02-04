<template>
    <div v-if="configObject.config">
        <p class="fs-13 fw-500 mb-2">{{$t('v2.smartObject.displayInfor')}}</p>
        <v-text-field
            v-model="searchKey"
            single-line
            append-icon="mdi-magnify"
            solo
            class="sym-small-size border-all mb-2"
            :placeholder="$t('v2.doc.search')"
            @input="onQuickFilterChanged()"
            flat
        />
        <ag-grid-vue
            :style="{
                width: '100%',
                height: 300 + 'px',
            }"
            class="ag-theme-balham"
            :gridOptions="gridOptions"
            :rowData="configObject.config.displayInfor.allColumn"
            :columnDefs="columnDefs"
            :suppressRowClickSelection="true"
            @row-selected="onRowSelected"
            @model-updated="onModelUpdated"
        ></ag-grid-vue>

        <div class="object-config mb-4" v-if="configObject.type != 'orgchart'">
            <p class="fs-13 fw-500 mb-3 mt-4">{{$t('v2.smartObject.manipulationConfig')}}</p>
            <v-expansion-panels
                v-for="(group, groupidx) in configObject.action"
                :key="groupidx"
                :name="groupidx"
                multiple
                flat
                class="fs-13 mb-0"
            >
                <v-expansion-panel class="sym-expand-panel">
                    <v-expansion-panel-header
                        class="v-expand-header pa-0 fs-13 mb-1"
                        style="
                            height: 35px !important;
                            min-height: 35px !important;
                        "
                    >
                        <input
                            type=" text"
                            name="text-input"
                            class="header-input"
                            :placeholder="$t('v2.smartObject.enterManipulationName')"
                            v-model="group.name"
                            @click.stop
                            @keyup.space="spaceUp"
                            :disabled="action == 'view' ? true : false"
                        />
                    </v-expansion-panel-header>
                    <span
                        :class="{
                            mdi: true,
                            'mdi-close': true,
                            'close-btn': true,
                        }"
                        @click="delGroup(groupidx)"
                    ></span>
                    <span
                        v-if="group.name == '' || group.name.trim() == ''"
                        class="err-validate-name"
                        >{{$t('v2.smartObject.notBlankManipulationName')}}</span
                    >
                    <span
                        v-if="group.name.length > 30"
                        class="err-validate-name"
                        >{{$t('v2.smartObject.manipulationNameCannotExceed30')}}</span
                    >
                    <v-expansion-panel-content
                        class="sym-v-expand-content mb-2"
                    >
                        <FormTpl
                            :allInputs="allInputs[groupidx]"
                            :singleLine="false"
                            :titleSize="'medium'"
                            :labelWidth="'55px'"
                            @input-value-changed="
                                (name, input, data) => {
                                    handleChangeConfig(
                                        name,
                                        input,
                                        data,
                                        groupidx,
                                    );
                                }
                            "
                        />
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>

            <v-btn
                @click="addConfig"
                class="w-100 add-btn"
                style="color: #fff; font-weight: 300"
                outlined
                small
                :disabled="action == 'view' ? true : false"
            >
            {{$t('v2.smartObject.addManipulation')}}
            </v-btn>
        </div>
    </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue';
import FormTpl from '@/components/common/FormTpl.vue';
import _debounce from 'lodash/debounce';
export default {
    components: {
        AgGridVue,
        FormTpl,
    },
    props: {
        configObject: {
            type: Object,
            default() {
                return {};
            },
        },
        workflowOptions: {
            type: Array,
            default() {
                return [];
            },
        },

        action: {
            type: String,
            default: 'edit',
        },
    },
    computed: {
        allInputs() {
            let data = [];
            if (this.configObject != {}) {
                for (let key in this.configObject.action) {
                    if (
                        this.configObject.action[key].value.type.value ==
                        'formula'
                    ) {
                        data.push({
                            type: this.configObject.action[key].value.type,
                            formula:
                                this.configObject.action[key].value.formula,
                        });
                    } else {
                        let workflow =
                            this.configObject.action[key].value.workflow;
                        workflow.validateStatus = {
                            isValid: true,
                            message: '',
                        };
                        if (!workflow.value) {
                            workflow.validateStatus.isValid = false;
                            workflow.validateStatus.message =
                            this.$t('v2.smartObject.notBlankWorkflow');
                        }
                        data.push({
                            type: this.configObject.action[key].value.type,
                            workflow: workflow,
                        });
                    }
                }
            }
            return data;
        },
        allColSelected() {
            if (this.configObject.config != {}) {
                return this.configObject.config.displayInfor.listColSelected;
            }
            return [];
        },
    },
    watch: {
        'configObject.idObject': {
            deep: true,
            immediate: true,
            handler: function () {
                this.changeType();
                this.disabledInput();
                if (this.gridOptions.api) {
                    this.searchKey = '';
                    this.gridOptions.api.setQuickFilter(this.searchKey);
                }
            },
        },
    },
    data() {
        return {
            searchKey: '',
            defaultColDef: {
                resizable: true,
                flex: 1,
            },
            gridOptions: {
                rowHeight: 28,
                rowSelection: 'multiple',
                suppressRowClickSelection: true, //ko check row khi bấm vào row, phải bấm vào checkbox
                suppressCellSelection: true,
            },
            columnDefs: [
                {
                    checkboxSelection: true,
                    // editable: false,
                    field: 'selected',
                    headerName: '',
                    // resizeable: false,
                    width: 40,
                    minWidth: 40,
                    maxWidth: 40,
                    headerCheckboxSelection: true,
                    cellStyle: (params) =>
                        this.action == 'view'
                            ? { 'pointer-events': 'none' }
                            : '',
                    enableColResize: false,
                },
                {
                    headerName: this.$t('common.name'),
                    field: 'name',
                    // editable: false,
                    width: 80,
                },
                {
                    headerName: this.$t('common.title'),
                    field: 'title',
                    // editable: false,
                    width: 100,
                },
                {
                    headerName: this.$t('common.type'),
                    field: 'type',
                    // editable: false,
                    width: 100,
                },
            ],
        };
    },
    methods: {
        spaceUp(e) {
            e.preventDefault();
        },
        disabledInput() {
            if (this.action == 'view') {
                if (this.allInputs) {
                    for (let key in this.allInputs) {
                        this.allInputs[key].type.disabled = true;
                        this.allInputs[key][
                            this.allInputs[key].type.value
                        ].disabled = true;
                    }
                }
            } else {
                if (this.allInputs) {
                    for (let key in this.allInputs) {
                        this.allInputs[key].type.disabled = false;
                        this.allInputs[key][
                            this.allInputs[key].type.value
                        ].disabled = false;
                    }
                }
            }
        },
        changeType() {
            let data = this.configObject.config.displayInfor.allColumn;
            for (let key in data) {
                if (
                    data[key].type != 'number' &&
                    data[key].type != 'date' &&
                    data[key].type != 'datetime' &&
                    data[key].type != 'time'
                ) {
                    data[key].type = 'text';
                }
            }
        },
        handleChangeConfig(name, input, data, groupidx) {
            if (name == 'name') {
                this.configObject.action[groupidx].name = data;
            }
            this.configObject.keyConfigObject = this.configObject;
        },
        onQuickFilterChanged() {
            this.gridOptions.api.setQuickFilter(this.searchKey);
        },
        addConfig() {
            let newConfig = {
                name: '',
                value: {
                    type: {
                        title: this.$t('v2.smartObject.type'),
                        placeholder: this.$t('v2.smartObject.selectType'),
                        type: 'select',
                        value: 'formula',
                        appendIcon: 'mdi-chevron-down',
                        showId: false,
                        options: [
                            {
                                text: this.$t('v2.smartObject.accordingToFormula'),
                                value: 'formula',
                            },
                            {
                                text: this.$t('v2.smartObject.accordingToWorkflow'),
                                value: 'workflow',
                            },
                        ],
                    },
                    formula: {
                        title: this.$t('v2.doc.formula'),
                        type: 'script',
                        value: '',
                        infor: '',
                        listKeyWorks: {},
                    },
                    workflow: {
                        title: this.$t('v2.smartObject.workflow'),
                        placeholder: this.$t('v2.smartObject.selectWorkflow'),
                        type: 'select',
                        value: '',
                        showId: false,
                        appendIcon: 'mdi-chevron-down',
                        options: this.workflowOptions,
                        returnOject: true,
                        itemValue: 'id',
                        itemText: 'name',
                    },
                },
            };

            this.configObject.action.push(newConfig);
        },
        onRowSelected(param) {
            let selectedRows = this.gridOptions.api.getSelectedRows();
            this.configObject.config.displayInfor.listColSelected =
                selectedRows;
            this.debounceColSelect(this.configObject);
        },
        debounceColSelect: _debounce(
            function (val) {
                this.$emit('change-col-selected', val);
            },
            300,
            this,
        ),
        onModelUpdated() {
            let allCol = this.allColSelected;
            this.gridOptions.api.forEachNode(function (node) {
                for (let key in allCol) {
                    if (allCol[key].name == node.data.name) {
                        node.setSelected(true);
                    }
                }
            });
        },
        delGroup(groupidx) {
            this.configObject.action.splice(groupidx, 1);
        },
    },
};
</script>

<style scoped>
.object-config >>> .add-btn {
    background-color: var(--symper-color) !important;
    border: none !important;
}
.object-config >>> .add-btn .v-btn__content {
    color: #fff !important;
    font-weight: 400 !important;
}
.object-config >>> .add-btn:hover {
    background-color: var(--symper-color) !important;
    opacity: 0.85;
}

.object-config >>> .v-expansion-panel-content__wrap {
    padding: 0;
}

.object-config >>> .v-text-field__details {
    display: none !important;
}

.object-config >>> .v-input__control .v-input__slot input {
    font-size: 12px !important;
    padding: 8px 12px;
}
.object-config >>> .header-config .v-input__control .v-input__slot input {
    padding: 0 !important;
}
.object-config >>> .v-input__slot {
    box-shadow: unset !important;
    height: 28px !important;
    background: #ffffff !important;
}

.object-config >>> .sym-style-input:not(.v-input--checkbox) {
    border: 0.5px solid #b5b5b5 !important;
}
.object-config
    >>> .sym-small-size.v-autocomplete
    > .v-input__control
    > .v-input__slot {
    padding: 0 !important;
}
.object-config >>> .header-config {
    position: absolute;
    top: 0;
    left: -46px;
    width: 100%;
}

.object-config >>> .header-config .sym-style-input:not(.v-input--checkbox) {
    border: unset !important;
}
.object-config >>> .header-config .v-input__slot {
    border: none !important;
    background: inherit !important;
}
.object-config >>> .pb-1 {
    padding-bottom: 8px !important;
}

.object-config >>> .d-inline-block {
    margin-bottom: 4px;
}
.object-config >>> .v-expand-header {
    position: relative !important;
    width: 100%;
    background: #f2f2f2;
    border-radius: 4px;
    min-height: 24px !important;
    padding: 0 8px 0 12px !important;
}

.v-expansion-panel--active:not(:first-child),
.v-expansion-panel--active + .v-expansion-panel {
    margin-top: 0 !important;
}

.object-config >>> .sym-small-size .v-text-field__slot input {
    padding: 8px 12px !important;
}

.object-config >>> .close-btn {
    top: 8px;
    position: absolute;
    right: 6px;
}
.object-config
    >>> .theme--light.v-expansion-panels
    .v-expansion-panel-header
    .v-expansion-panel-header__icon
    .v-icon {
    margin-right: 16px !important;
}
.object-config >>> .header-config .error-message {
    margin-top: 1px !important;
    margin-right: -44px !important;
}

.object-config >>> .header-input {
    position: absolute;
    top: 0;
    left: 12px;
    outline: none;
    height: 35px;
    width: 75%;
}
.object-config >>> .err-validate-name {
    color: red;
    font-size: 11px;
}
.object-config >>> .v-input__control .v-input__slot input {
    padding: 0 !important;
}
</style>
<style>
.v-application .primary--text {
    color: unset !important;
}
.v-list-item--link {
    font-size: 13px !important;
}
.v-list-item--link {
    min-height: 36px !important;
}
</style>
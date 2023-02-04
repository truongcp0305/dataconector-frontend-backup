<template>
    <div class="split-config mb-4">
        <v-expansion-panels
            v-for="(group, groupidx) in splitGroups"
            :key="groupidx"
            :name="groupidx"
            multiple
            flat
            class="fs-13 mb-0"
        >
            <v-expansion-panel class="sym-expand-panel">
                <v-expansion-panel-header
                    class="v-expand-header pa-0 mb-2 fs-13"
                    style="height: 35px !important; min-height: 35px !important"
                >
                    <div class="w-100">
                        <span class="float-left"
                            >{{ 'Group ' + (groupidx + 1) }}
                        </span>
                    </div>
                </v-expansion-panel-header>

                <v-expansion-panel-content class="sym-v-expand-content mb-1">
                    <FormTpl
                        :allInputs="group.splitConfig"
                        :singleLine="true"
                        :labelWidth="'109px'"
                        :titleSize="'medium'"
                        :style="{ 'margin-bottom': '12px' }"
                        @input-value-changed="handleChangeConfig"
                    />

                    <v-radio-group
                        v-model="group.radioCheck"
                        @change="handleChangeSplitType"
                    >
                        <v-radio
                            :label="$t('v2.dataflow.splitToRow')"
                            value="splitToRow"
                            color="orange"
                        ></v-radio>
                        <v-radio
                            :label="$t('v2.dataflow.splitToColumn')"
                            value="splitToCol"
                            color="orange"
                        >
                        </v-radio>
                    </v-radio-group>

                    <ColumnsCreator
                        :style="{
                            height: '200px',
                            'margin-bottom': '34px !important'
                        }"
                        :columns="group.addedColumns"
                        v-if="group.radioCheck == 'splitToCol'"
                    />
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>

        <v-btn @click="addSplitGroup" class="w-100" outlined small>
            {{ $t('v2.dataflow.addGroupToSplitData') }}
        </v-btn>
    </div>
</template>

<script>
import FormTpl from '@/components/common/FormTpl.vue';
import { AgGridVue } from 'ag-grid-vue';
import ColumnsCreator from '@/components/dataflow/components/utils/ColumnsCreator.vue';
import { defaultConfig } from '@/components/dataflow/nodes/Split.node.js';
import _cloneDeep from 'lodash/cloneDeep';

export default {
    components: {
        FormTpl,
        AgGridVue,
        ColumnsCreator
    },
    props: {
        nodeData: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data() {
        return {
            defaultColDef: null,
            gridOptions: null
        };
    },
    created() {},
    computed: {
        splitGroups() {
            this.nodeData?.configs?.splitGroups.forEach((group) => {
                let groupKeys = Object.keys(group.splitConfig);
                groupKeys.forEach((key) => {
                    group.splitConfig[key].title.includes('v2.dataflow.')
                        ? (group.splitConfig[key].title = this.$t(
                              group.splitConfig[key].title
                          ))
                        : '';
                    group.splitConfig[key].placeholder.includes('v2.dataflow.')
                        ? (group.splitConfig[key].placeholder = this.$t(
                              group.splitConfig[key].placeholder
                          ))
                        : '';
                });
            });
            return this.nodeData?.configs?.splitGroups;
        }
    },
    methods: {
        handleChangeConfig(colName, value) {
            this.$emit('change-configs', {
                type: 'change-config-value',
                colName: colName,
                value: value
            });
        },

        handleChangeSplitType(newValue) {
            this.$emit('change-configs', {
                type: 'chang-split-type',
                newValue: newValue
            });
        },

        addSplitGroup() {
            let configs = this.nodeData.configs;
            configs.splitGroups.push(this.getDefaultSplitGroup());
        },

        getDefaultSplitGroup() {
            let newArr = _cloneDeep(defaultConfig.splitGroups[0]);
            newArr.splitConfig.selectCol.options = this.nodeData.input;
            return newArr;
        }
    }
};
</script>

<style scoped>
.split-config {
    color: #1b1b1b !important;
}

.v-expand-header {
    width: 100%;
    background: #f2f2f2;
    border-radius: 4px;
    min-height: 24px !important;
    padding: 0 8px 0 12px !important;
}

.split-config >>> .v-expansion-panel-content__wrap {
    padding: 0;
}

.split-config >>> .v-text-field__details {
    display: none !important;
}
.split-config >>> .v-input__control {
    min-height: unset !important;
    margin-bottom: -6px !important;
}
.split-config >>> .v-input__control .v-input__slot input {
    font-size: 12px !important;
    /* color: #b5b5b5; */
}
.split-config >>> .v-input__slot {
    box-shadow: unset !important;
    border: 0.5px solid #b5b5b5;
    height: 28px !important;
    background: #ffffff !important;
}

.split-config >>> .sym-style-input:not(.v-input--checkbox) {
    border: none !important;
}

.split-config >>> .border-all {
    border: none !important;
}

.split-config >>> .v-input__slot .v-icon {
    font-size: 18px !important;
    color: #b5b5b5;
}
.split-config >>> .v-input {
    flex: unset !important;
}

.split-config >>> .v-btn {
    background-color: var(--symper-color) !important;
    border: none !important;
}
.split-config >>> .v-btn span {
    color: #fff !important;
    font-weight: 300 !important;
}

.split-config >>> .v-input--radio-group .v-input__slot {
    border: none;
}

.split-config >>> .v-input--selection-controls {
    margin-top: 0;
}

.split-config
    >>> .v-text-field.v-input--dense:not(.v-text-field--outlined)
    input {
    padding: 8px 0;
}

.split-config >>> .v-select.v-input--dense .v-chip {
    margin: 0 !important;
    padding: 0 !important;
}

.split-config
    >>> .v-text-field.v-text-field--solo.v-input--dense
    > .v-input__control {
    overflow: hidden !important;
}
</style>

<template>
    <div class="w-100">
        <div class="w-100 pa-1 justify-end d-flex flex-cloumn">
            <v-btn depressed small style="" @click="changeActiveAllColumn(true)" class="mr-3">{{
                    $t('v2.dataflow.activeAll')
            }}</v-btn>
            <v-btn depressed small style="" @click="changeActiveAllColumn(false)">{{ $t('v2.dataflow.deactiveAll') }}
            </v-btn>
        </div>
        <table class="w-100 fs-13">
            <thead>
                <tr style="text-align: left">
                    <th style="width: 50px">{{ $t('v2.dataflow.active') }}</th>
                    <th style="padding-left: 10px">
                        {{ $t('v2.dataflow.name') }}
                    </th>
                    <th style="padding-left: 10px">
                        {{ $t('v2.dataflow.title') }}
                    </th>
                </tr>
            </thead>
            <tr style="border-bottom: 1px solid #eee" v-for="(col, idx) in nodeData.configs.addedColumns" :key="idx"
                :name="idx">
                <td colspan="3" class="py-2">
                    <v-expansion-panels multiple flat style="overflow: hidden">
                        <v-expansion-panel class="sym-expand-panel">
                            <v-expansion-panel-header class="v-expand-header px-1 py-0">
                                <span>
                                    <v-switch class="sym-small-size" color="orange" v-model="col.active" @click.stop
                                        @change="changeConfig('active')"></v-switch>
                                </span>
                                <v-text-field v-model="col.name" class="d-inline-block px-1 sym-small-size" single-line
                                    outlined hide-details dense flat style="width: inherit; width: 40%" @click.stop
                                    @input="standardName(col)" @change="changeConfig('name')"></v-text-field>
                                <v-text-field class="d-inline-block px-1 sym-small-size" v-model="col.title" single-line
                                    outlined hide-details dense flat style="width: inherit; width: 45%" @click.stop
                                    @change="changeConfig('title')"></v-text-field>
                                <v-icon @click="removeCol(idx)" class="fs-16">mdi-close</v-icon>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content class="sym-v-expand-content py-1">
                                <div>
                                    <div class="mb-1">
                                        <span>{{
                                                $t('v2.dataflow.createColFormula')
                                        }}</span>
                                        <i class="
                                                mdi mdi-dock-window
                                                float-right
                                            " @click="openLargeValueEditor(col)" style="
                                                cursor: pointer;
                                                font-size: 17px;
                                            "></i>
                                    </div>
                                    <formula-editor v-model="col.formula" :style="{
                                        width: sideBarWidth
                                            ? sideBarWidth - 20 + 'px'
                                            : '100%'
                                    }" :height="'80px'" :simpleMode="true" :ref="'formulaEditor' + col.trackId"
                                        class="formular-editor" :listKeyworks="listKeyworks"
                                        @blur="changeConfig('formula')" />
                                    <div class="w-100">
                                        <span class="font-weight-medium">{{ $t('v2.dataflow.dataType') }}
                                        </span>
                                        <v-select class="sym-select fs-13" dense flat style="
                                                float: right;
                                                width: 110px;
                                                margin-right: 5px;
                                            " v-model="col.type" :items="dataTypes" @change="changeConfig('data-type')"
                                            outlined></v-select>
                                    </div>
                                </div>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </td>
            </tr>
            <tfoot>
                <tr>
                    <td colspan="3">
                        <div class="w-100">
                            <v-btn @click="addFormulaColumn" depressed small class="mx-2 mt-1" style="width: 98%">{{
                                    $t('v2.dataflow.addColumn')
                            }}</v-btn>
                        </div>
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<script>
import { util } from '../../../../plugins/util';
import FormulaEditor from '../../../formula/editor/FormulaEditor.vue';

export default {
    components: {
        FormulaEditor
    },
    computed: {
        addedColumns() {
            return this.nodeData.configs.addedColumns;
        }
    },
    props: {
        sideBarWidth: {
            defaul: ''
        },
        nodeData: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    watch: {
        'nodeData.input': {
            deep: true,
            handler(nodeData) {
                this.setListKeyword(nodeData);
            }
        }
    },
    data() {
        return {
            listKeyworks: {},
            dataTypes: [
                {
                    text: 'Text',
                    value: 'text'
                },
                {
                    text: 'Number',
                    value: 'number'
                },
                {
                    text: 'Date',
                    value: 'date'
                },
                {
                    text: 'Datetime',
                    value: 'datetime'
                },
                {
                    text: 'Time',
                    value: 'time'
                }
            ]
        };
    },
    mounted() {
        this.setListKeyword(this.nodeData.input);
    },
    methods: {
        openLargeValueEditor(col) {
            let data = {};
            data.title = col.title;
            data.name = col.name;
            data.value = col.formula;
            let editorFomula = this.$refs['formulaEditor' + col.trackId][0];
            data.instKey = editorFomula.getFormulaEditorInstKey();
            this.$evtBus.$emit('open-sql-query-ide', data);
        },
        changeActiveAllColumn(active) {
            for (let col of this.nodeData.configs.addedColumns) {
                col.active = active;
            }
            this.changeConfig(`${active ? 'active' : 'deactive'}-all-column`);
        },
        changeConfig(type) {
            if (type == 'formula') {
                this.nodeData.setLastConfigCache();
                return;
            }
            if (this.debounceChangeConfig) {
                clearTimeout(this.debounceChangeConfig);
            }
            let self = this;
            this.debounceChangeConfig = setTimeout(() => {
                self.$emit('change-configs');
            }, 600);
        },
        setListKeyword(inputs) {
            let rsl = [];
            for (let col of inputs) {
                rsl.push({
                    label: `${col.columnName}: ${col.title}`,
                    insertText: `[${col.columnName}]`
                });
            }
            this.listKeyworks = {
                columns: rsl
            };
        },
        standardName(col) {
            if (this.debouceStandardName) {
                clearTimeout(this.debouceStandardName);
            }
            this.debouceStandardName = setTimeout(() => {
                col.name = util.str.nonAccentVietnamese(col.name.toLowerCase());
            }, 600);
        },
        addFormulaColumn() {
            let defaultFmlColConfig = {
                columnAdd: {
                    type: 'new', // hoặc exist
                    colInfp: {}
                },
                title: '',
                name: '',
                type: 'text',
                formula: '',
                active: true
            };
            this.nodeData.configs.addedColumns.push(defaultFmlColConfig);
            this.changeConfig('add-column');
        },
        removeCol(idx) {
            this.nodeData.configs.addedColumns.splice(idx, 1);
            this.changeConfig('remove-column');
        }
    }
};
</script>

<style scoped>
.v-expand-header {
    min-height: 25px;
}

.v-expansion-panel-header {
    min-height: 25px;
}

.sym-v-expand-content>>>.v-expansion-panel-content__wrap {
    padding: 0px;
    padding-left: 8px;
}

.formular-editor>>>.margin-view-overlays {
    background: #eee;
    width: 45px !important;
}

.sym-select {
    height: 25px !important;
}

.sym-select>>>.v-input__slot {
    min-height: 20px !important;
    height: 25px;
    padding-right: 4px !important;
}

.sym-select>>>.v-input__append-inner {
    margin: 0px !important;
}

.formular-editor>>>.editor {
    width: 100% !important;
}
</style>

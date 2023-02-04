<template>
    <v-tabs
        :height="30"
        v-model="sideRightTab"
        grow
        light
        show-arrows
        class="h-100"
    >
        <v-tabs-slider color="sym-tab-slider"></v-tabs-slider>

        <v-tab
            v-for="tab in sideRightTabs"
            :key="tab.id"
            style="margin-bottom: 4px; width: 30px; min-width: unset"
        >
            <v-tooltip right>
                <template v-slot:activator="{ on }">
                    <v-icon style="font-size: 16px; color: gray" v-on="on">{{
                        tab.icon
                    }}</v-icon>
                </template>
                <span>{{ tab.tab }}</span>
            </v-tooltip>
        </v-tab>
        <v-tab-item class="p-2 properties-control-tab">
            <VuePerfectScrollbar style="height: calc(100vh - 90px)">
                <v-expansion-panels v-model="panel" multiple>
                    <v-expansion-panel class="m-0">
                        <v-expansion-panel-header class="v-expand-header"
                            >{{$t('v2.doc.name')}}</v-expansion-panel-header
                        >
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <control-props-config
                                @input-value-keyup="handleKeyupInput"
                                @input-value-changed="handleChangeInput"
                                @input-blur="handleInputBlur"
                                :singleLine="true"
                                :labelWidth="`100px`"
                                :allInputs="controlPropsGroup.name"
                            />
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel class="m-0">
                        <v-expansion-panel-header class="v-expand-header"
                            >{{$t('v2.doc.display')}}</v-expansion-panel-header
                        >
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <control-props-config
                                :instance="instance"
                                @input-value-changed="handleChangeInput"
                                @input-value-keyup="handleKeyupInput"
                                :singleLine="true"
                                :labelWidth="`100px`"
                                :allInputs="controlPropsGroup.display"
                            />
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <!---<v-expansion-panel class="m-0" >
                    <v-expansion-panel-header class="v-expand-header">In</v-expansion-panel-header>
                    <v-expansion-panel-content class="sym-v-expand-content">
                        <control-props-config 
                        @input-value-changed="handleChangeInput" 
                        :singleLine="true" 
                        :labelWidth="`100px`" 
                        :allInputs="controlPropsGroup.print"/>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                -->
                    <v-expansion-panel
                        class="m-0"
                        v-if="sCurrentDocument.type == 'dataFlow'"
                    >
                        <v-expansion-panel-header class="v-expand-header"
                            >{{$t('v2.doc.output')}}</v-expansion-panel-header
                        >
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <control-props-config
                                @input-value-changed="handleChangeInput"
                                :allInputs="mapOutputDataflow"
                            />
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel
                        class="m-0"
                        v-if="sCurrentDocument.type == 'dataFlow'"
                    >
                        <v-expansion-panel-header class="v-expand-header"
                            >{{$t('v2.doc.recordData')}}</v-expansion-panel-header
                        >
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <control-props-config
                                @input-value-changed="handleChangeInput"
                                :allInputs="mapInputDataflow"
                            />
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel
                        class="m-0"
                        v-if="sCurrentDocument.type == 'dataFlow'"
                    >
                        <v-expansion-panel-header class="v-expand-header"
                            >Mapping</v-expansion-panel-header
                        >
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <control-props-config
                                @input-value-changed="handleChangeInput"
                                :allInputs="mapParamsDataflow"
                            />
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </VuePerfectScrollbar>
        </v-tab-item>
        <v-tab-item class="h-100 formulas-control-tab">
            <VuePerfectScrollbar style="height: calc(100vh - 90px)">
                <control-props-config
                    @input-blur="handleInputBlur"
                    :singleLine="false"
                    @input-value-changed="handleChangeInput"
                    :instance="instance"
                    :allInputs="sCurrentDocument.formulas"
                />
            </VuePerfectScrollbar>
        </v-tab-item>
        <v-tab-item class="h-100 style-form-tab">
            <VuePerfectScrollbar style="height: calc(100vh - 90px)">
                <h3 class="pl-2">{{$t('v2.doc.formatInfor')}}</h3>
                <table class="general-info">
                    <tr v-for="(value, key) in listStyle" :key="key">
                        <td class="p-2">{{ key }}:</td>
                        <td class="pl-2">{{ value }}</td>
                    </tr>
                </table>
            </VuePerfectScrollbar>
        </v-tab-item>
    </v-tabs>
</template>
<script>
import FormTpl from './../../../components/common/FormTpl.vue';
import {
    checkInTable,
    checkLinkControlTitle,
    checkNameControl,
    checkTitleControl,
    addCssItem,
    replaceNameItem,
    setNameTitleControl,
    setTitleTitleControl,
    replaceLinkControl,
    checkValidateControlPrimary
} from './../common/common';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';

import { dataflowApi } from '@/api/dataflow.js';
export default {
    props: {
        instance: {
            type: Number,
            default: Date.now()
        },
        isConfigPrint: {
            type: Boolean,
            default: false
        }
    },
    components: {
        'control-props-config': FormTpl,
        VuePerfectScrollbar
    },
    computed: {
        mapOutputDataflow() {
            return {
                mapOutputDataflow:
                    this.controlPropsGroup.table['mapOutputDataflow']
            };
        },
        mapParamsDataflow() {
            return {
                mapParamsDataflow:
                    this.controlPropsGroup.table['mapParamsDataflow']
            };
        },
        mapInputDataflow() {
            return {
                mapInputDataflow:
                    this.controlPropsGroup.table['mapInputDataflow']
            };
        },
        sEditor() {
            return this.$store.state.document.editor[this.instance];
        },
        sCurrentDocument() {
            return this.sEditor.currentSelectedControl;
        },
        listDataFlow() {
            return this.sEditor.listDataFlow;
        },
        controlPropsGroup() {
            return this.sEditor.currentSelectedControl.properties;
        },
        listStyle() {
            return this.$store.state.document.documentStyle[this.instance];
        }
    },
    watch: {
        'controlPropsGroup.table.mapParamsDataflow.value': function (after) {},
        /**
         * Tự động focus vào input name sau khi chọn control
         */
        'controlPropsGroup.name': function () {
            setTimeout(() => {
                // $('.sym-v-expand-content input').first().focus();
            }, 200);
        },
        /**
         * trường hợp table cần lấy thông tin các control trong table để cho phép chọn cột primary key
         */
        'controlPropsGroup.display.tablePrimaryKey': function (before, after) {
            if (before) {
                let currentControlId = this.sCurrentDocument.id;
                if (
                    currentControlId &&
                    this.sEditor.allControl[currentControlId]
                ) {
                    let allControlInTable =
                        this.sEditor.allControl[currentControlId].listFields;
                    let items = [];
                    for (let controlId in allControlInTable) {
                        let controlprops =
                            allControlInTable[controlId].properties;
                        let item = {
                            value: controlprops.name.value,
                            text: controlprops.title.value
                        };
                        items.push(item);
                    }
                    this.sCurrentDocument.properties.display.tablePrimaryKey.options =
                        items;
                }
            }
        },
        'sCurrentDocument.id': function (va) {
            if (this.sEditor.currentSelectedControl.type == 'department') {
                this.getConditionControls();
            }
        }
    },
    data() {
        return {
            controlDataFlow: {
                controls: [],
                allNodes: []
            },
            panel: [0, 1, 2, 3, 4, 5],
            sideRightTab: null,
            sideRightTabs: [
                {
                    id: 'element',
                    tab: this.$t('v2.doc.properties'),
                    icon: 'mdi-hammer-screwdriver'
                },
                {
                    id: 'formulas',
                    tab: this.$t('v2.doc.formula'),
                    icon: 'mdi-function-variant'
                },
                {
                    id: 'style',
                    tab: this.$t('v2.doc.presentation'),
                    icon: 'mdi-format-line-style'
                }
            ],
            listNameValueControl: {},
            delayTimer: null,
            styles: null
        };
    },
    methods: {
        getConditionControls() {
            if (this.sCurrentDocument.formulas.groupDpm) {
                let options = [
                    {
                        id: 'current_user_id',
                        name: 'current_user_id',
                        title: ''
                    }
                ];
                let allControl = this.sEditor.allControl;
                Object.keys(allControl).map((control) => {
                    let typeControl = allControl[control].type;
                    if (['textInput', 'user'].includes(typeControl)) {
                        options.push({
                            id: control,
                            name: allControl[control].properties.title
                                ? allControl[control].properties.title.value
                                : '',
                            title: allControl[control].properties.name
                                ? allControl[control].properties.name.value
                                : ''
                        });
                    }
                    if (
                        allControl[control].listFields &&
                        allControl[control].listFields[this.sCurrentDocument.id]
                    ) {
                        Object.keys(allControl[control].listFields).map(
                            (childControl) => {
                                let typeControlChild =
                                    allControl[control].listFields[childControl]
                                        .type;
                                let controlChild =
                                    allControl[control].listFields[
                                        childControl
                                    ];
                                if (
                                    ['textInput', 'user'].includes(
                                        typeControlChild
                                    )
                                ) {
                                    options.push({
                                        id: childControl,
                                        name: controlChild.properties.title
                                            ? controlChild.properties.title
                                                  .value
                                            : '',
                                        title: controlChild.properties.name
                                            ? controlChild.properties.name.value
                                            : ''
                                    });
                                }
                            }
                        );
                    }
                });
                this.sCurrentDocument.formulas.groupDpm.conditionControls =
                    options;
            }
        },
        // lấy cấu hình map param trong control dataflow
        setInfoMapParamsDataFlow() {
            let controls = [];
            let allControl = this.sEditor.allControl;
            Object.keys(allControl).map((control) => {
                controls.push({
                    id: control,
                    name: allControl[control].properties.name
                        ? allControl[control].properties.name.value
                        : ''
                });
            });
            this.controlPropsGroup.table['mapParamsDataflow'].lists = {
                control: controls,
                paramDataflow: []
            };
        },
        refreshDataFlowConfig() {
            this.controlDataFlow.allNodes = [];
            this.controlPropsGroup.table['mapInputDataflow'].value = [
                {
                    node: '',
                    control: '',
                    mapping: [{ fieldDataflow: '', control: '', controlId: '' }]
                }
            ];
            this.controlPropsGroup.table['mapParamsDataflow'].value = [
                { control: '', controlId: '', paramDataflow: '' }
            ];
            this.controlPropsGroup.table['mapOutputDataflow'].value = [
                { node: '', title: '', nodeId: '' }
            ];
            this.handleChangeInput(
                'mapOutputDataflow',
                '',
                this.controlPropsGroup.table['mapOutputDataflow'].value
            );
            this.handleChangeInput(
                'mapInputDataflow',
                '',
                this.controlPropsGroup.table['mapInputDataflow'].value
            );
            this.handleChangeInput(
                'mapParamsDataflow',
                '',
                this.controlPropsGroup.table['mapParamsDataflow'].value
            );
        },
        // hàm lấy ra các node và lấy thông tin cho các thuộc tính dataflow
        async findNodesDataFlow(dataflowId) {
            const self = this;
            this.refreshDataFlowConfig();
            let res = await dataflowApi.getInfo(dataflowId, '');
            if (res.status == 200) {
                let nodeLoads = [];
                if (res.data.nodes && Object.keys(res.data.nodes).length > 0) {
                    Object.keys(res.data.nodes).map((node) => {
                        self.controlDataFlow.allNodes.push({
                            id: res.data.nodes[node].jointInfo.id,
                            name: res.data.nodes[node].jointInfo.name
                        });

                        if (
                            res.data.nodes[node].jointInfo.type == 'app.Load' &&
                            res.data.nodes[node].symperConfigs.customData &&
                            res.data.nodes[node].symperConfigs.customData
                                .columns.length > 0
                        ) {
                            nodeLoads.push({
                                id: res.data.nodes[node].jointInfo.id,
                                name: res.data.nodes[node].jointInfo.name,
                                field: res.data.nodes[node].symperConfigs
                                    .customData
                                    ? res.data.nodes[node].symperConfigs
                                          .customData.columns
                                    : []
                            });
                        }
                    });
                }
                self.controlPropsGroup.table[
                    'mapInputDataflow'
                ].options.nodeLoads = nodeLoads;
                self.setInfoOutputDataflow();
                self.setInfoInputDataFlow();
                self.setInfoMapParamsDataFlow();
            }
        },
        // lấy cấu hình đầu ra dataflow
        setInfoOutputDataflow() {
            this.controlPropsGroup.table['mapOutputDataflow'].lists = {
                node: this.controlDataFlow.allNodes,
                title: []
            };
        },
        // tìm những control trong table theo yêu cầu thứ tự từ trái qua phải
        getControlInTable(tableId, listField) {
            let controlInTable = $('#document-editor-' + this.instance + '_ifr')
                .contents()
                .find('#' + tableId)
                .find('.s-control');
            let controlInTableOrdered = {};
            $.each(controlInTable, function (key, val) {
                let id = $(val).attr('id');
                controlInTableOrdered[id] = listField[id];
            });
            return controlInTableOrdered;
        },
        getAllControl() {
            const self = this;
            let allControl = this.sEditor.allControl;
            let controls = [];
            Object.keys(allControl).map((control) => {
                let typeControl = allControl[control].type;
                if (
                    ![
                        'submit',
                        'approvalHistory',
                        'reset',
                        'draft',
                        'dataFlow'
                    ].includes(typeControl)
                ) {
                    controls.push({
                        id: control,
                        name: allControl[control].properties.name
                            ? allControl[control].properties.name.value
                            : '',
                        type: allControl[control].type,
                        children: allControl[control].listFields
                            ? self.getControlInTable(
                                  control,
                                  allControl[control].listFields
                              )
                            : []
                    });
                }
            });
            return controls;
        },
        // lấy cấu hình đầu vào trong dataflow
        setInfoInputDataFlow() {
            let controls = this.getAllControl();
            this.controlPropsGroup.table['mapInputDataflow'].options.controls =
                controls;
            this.$store.commit('document/updateProp', {
                id: this.sCurrentDocument.id,
                name: 'mapInputDataflow',
                value: this.controlPropsGroup.table['mapInputDataflow'].options,
                tableId: '0',
                type: 'options',
                instance: this.instance
            });
        },
        handleInputBlur(inputInfo, name) {},
        handleKeyupInput(name, input, data) {
            clearTimeout(this.delayTimer);
            this.delayTimer = setTimeout(
                function (self) {
                    self.handleValidateControl(name, input, data);
                },
                100,
                this
            );
            if (data.key == 'Tab') {
                this.handleValidateControl(name, input, data);
            }
        },
        setMappingForParamsDataFlow(id, tableId) {
            let currentDataflow = this.listDataFlow.filter((df) => {
                return df.id == id;
            });
            try {
                let params = JSON.parse(currentDataflow[0].params);
                let datasets = currentDataflow[0].datasets;
            } catch (error) {}
        },
        handleChangeInput(name, input, data) {
            if (input.groupType == 'formulas') {
                let tableId = this.getTableWrapControl();
                if (name == 'autocomplete' && typeof data == 'object') {
                    this.$set(input.configData, 'treeData', data.treeData);
                    this.$set(
                        input.configData,
                        'documentSelected',
                        data.documentSelected
                    );
                    this.$set(
                        input.configData,
                        'columnSelected',
                        data.columnSelected
                    );
                    this.$set(
                        input.configData,
                        'rejectInput',
                        data.rejectInput
                    );
                    this.$set(input, 'value', data.sql);
                    this.$store.commit('document/updateProp', {
                        id: this.sCurrentDocument.id,
                        name: name,
                        value: input.configData,
                        tableId: tableId,
                        type: 'configData',
                        instance: this.instance
                    });
                } else if (name == 'linkConfig') {
                    this.$set(input, 'configData', data);
                    this.$store.commit('document/updateProp', {
                        id: this.sCurrentDocument.id,
                        name: name,
                        value: input.configData,
                        tableId: tableId,
                        type: 'configData',
                        instance: this.instance
                    });
                }
                this.handleValidateControl(name, input, data);
            }
            if (
                [
                    'numberFormat',
                    'checkbox',
                    'dateFormat',
                    'fileUploadConfig'
                ].includes(input.type)
            ) {
                input.value = data;
                this.handleValidateControl(name, input, data);
            } else if (name == 'dataFlowId') {
                input.value = { id: input.value };
                this.handleValidateControl(name, input, data);
                this.findNodesDataFlow(input.value.id);
                this.$store.commit('document/updateProp', {
                    id: this.sCurrentDocument.id,
                    name: 'dataFlowId',
                    value: input.value,
                    tableId: '0',
                    type: 'value',
                    instance: this.instance
                });
            } else if (name == 'mapOutputDataflow') {
                this.$store.commit('document/updateProp', {
                    id: this.sCurrentDocument.id,
                    name: 'mapOutputDataflow',
                    value: data,
                    tableId: '0',
                    type: 'value',
                    instance: this.instance
                });
            } else if (name == 'mapInputDataflow') {
                this.$store.commit('document/updateProp', {
                    id: this.sCurrentDocument.id,
                    name: 'mapInputDataflow',
                    value: data,
                    tableId: '0',
                    type: 'value',
                    instance: this.instance
                });
            } else if (name == 'mapParamsDataflow') {
                this.$store.commit('document/updateProp', {
                    id: this.sCurrentDocument.id,
                    name: 'mapParamsDataflow',
                    value: data,
                    tableId: '0',
                    type: 'value',
                    instance: this.instance
                });
            } else if (name == 'linkControl') {
                let selected = data.items.filter((d) => d.id == input.value)[0];
                if (selected) {
                    let id = selected.id;
                    let title = selected.name;
                    input.value = { id: id, name: title };
                    this.changeValueTitleInput(title);
                } else {
                    input.value = { id: '', name: '' };
                }
                this.handleValidateControl(name, input, data);
            } else if (input.type == 'select') {
                this.handleValidateControl(name, input, data);
            } else if (name == 'groupDpm') {
                let tableId = this.getTableWrapControl();
                this.$store.commit('document/updateProp', {
                    id: this.sCurrentDocument.id,
                    name: name,
                    value: input,
                    tableId: tableId,
                    type: 'configData',
                    instance: this.instance
                });
            }
        },
        // gán lại giá trị ô input title trog control tile
        changeValueTitleInput(title) {
            this.controlPropsGroup.name.title.value = title;
        },
        // kiểm tra tồn tại giá trị title trong input title
        checkExistTitle() {
            let title = this.getElement().attr('control-title-title');
            if (this.controlPropsGroup.name.title.value == '' && !title) {
                return false;
            } else {
                return true;
            }
        },
        /**
         * Hàm lấy id của table chứa control
         */
        getTableWrapControl() {
            let elements = this.getElement();
            let tableId = checkInTable(elements);
            if (tableId == this.sCurrentDocument.id) {
                tableId = '0';
            }
            return tableId;
        },
        // hàm lấy element chứa control hiện tại
        getElement() {
            return $('#document-editor-' + this.instance + '_ifr')
                .contents()
                .find('#' + this.sCurrentDocument.id);
        },
        // hàm tìm control theo tên
        findControlId(name) {
            let id = '';
            let allControl = this.sEditor.allControl;
            Object.keys(allControl).map((control) => {
                if (
                    allControl[control].properties.name &&
                    allControl[control].properties.name.value == name
                ) {
                    id = control;
                }
            });
            return id;
        },
        saveStoreTitleControlTitle(value) {
            this.$store.commit('document/updateProp', {
                id: this.sCurrentDocument.id,
                name: 'title',
                value: value,
                tableId: '0',
                type: 'value',
                instance: this.instance
            });
            checkTitleControl(this.instance);
        },
        /**
         * Hàm xử lí các thuộc tính của control trước khi đẩy lên store
         */
        handleValidateControl(name, input, data) {
            let value = input.value;
            let elements = this.getElement();
            if (
                ['color', 'fontSize', 'height', 'width', 'isHidden'].includes(
                    name
                )
            ) {
                addCssItem(name, value, elements);
            }
            if (name == 'linkControl') {
                let linkControlId = '';
                if (value) {
                    linkControlId = this.findControlId(value.id);
                }
                replaceNameItem(value.name, elements);
                replaceLinkControl(linkControlId, elements);
                setTitleTitleControl(value.name, elements);
                this.saveStoreTitleControlTitle(value.name);
                checkLinkControlTitle(this.instance, elements);
            }
            if (this.sCurrentDocument.type == 'title') {
                if (name == 'title') {
                    replaceNameItem(input.value, elements);
                    setTitleTitleControl(input.value, elements);
                }
                if (name == 'name') {
                    setNameTitleControl(input.value, elements);
                }
            }
            let tableId = this.getTableWrapControl();
            if (name === 'dataFlowId') {
                this.setMappingForParamsDataFlow(data.value, tableId);
            }
            let propType = 'value';
            this.$store.commit('document/updateProp', {
                id: this.sCurrentDocument.id,
                name: name,
                value: value,
                tableId: tableId,
                type: propType,
                instance: this.instance
            });
            if ((name == 'name' || name == 'title') && !this.isConfigPrint) {
                let isValid = checkNameControl(this.instance);
                if (isValid) {
                    checkTitleControl(this.instance);
                }
            }
            if (name == "startNumber" && !this.isConfigPrint) {
                checkValidateControlPrimary(this.instance);
            }
            if (name == 'name') {
                this.$emit('symper-editor-check-old-name', {
                    value: value,
                    tableId: tableId
                });
            }
        }
    }
};
</script>
<style scoped>
.properties-control-tab .v-list-item {
    min-height: unset;
}
.v-expand-header {
    font-size: 13px;
    font-weight: 500;
    min-height: unset;
    padding: 4px 8px;
    background: #f2f2f2;
    margin-bottom: 8px;
}
.tf-search-control {
    margin: 6px 0px !important;
}

.properties-control-tab .v-expansion-panel {
    margin: 0;
}
.sym-v-expand-content {
    padding-left: 8px;
}
.formulas-control-tab ::v-deep .symper-form-input {
    margin-right: 10px;
}
.formulas-control-tab {
    padding: 0.5rem 0 0.5rem 0.5rem !important;
}
</style>
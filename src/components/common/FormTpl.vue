<template>
    <div class="mt-1 symper-form-input">
        <div
            v-for="(inputInfo, name) in allInputs"
            :key="name"
            class="form-input"
            :class="{
                'pb-2': singleLine ? true : false,
                'pb-1':
                    !(singleLine || inputInfo.singleLine) &&
                    inputInfo.type != 'checkbox' &&
                    inputInfo.type != 'radio'
                        ? true
                        : false
            }"
        >
            <div
                class="d-inline-block"
                :style="{
                    'min-width': labelMinwidth(inputInfo.singleLine),
                    width: compLabelWidth(inputInfo.singleLine),
                    'line-height': '13px',
                    'vertical-align': 'middle',
                    'margin-right': space,
                    'margin-top':
                        (singleLine || inputInfo.singleLine) &&
                        inputInfo.type == 'textarea'
                            ? '8px'
                            : marginTop,
                    position: 'relative',
                    'font-size': titleFontSize,
                    'font-weight': inputInfo.titleFontWeight
                }"
                v-if="
                    !inputInfo.hidden &&
                    inputInfo.type != 'checkbox' &&
                    inputInfo.type != 'switch' &&
                    !inputInfo.hideTitle
                "
            >
                {{ inputInfo.title }}
                <span v-show="inputInfo.required" class="color-red">*</span>
                <i
                    :class="{
                        'mdi mdi-message-question color-red input-item-func': true
                    }"
                    @click="showMoreInfor()"
                    v-if="inputInfo.moreInfor"
                ></i>
                <div
                    v-if="inputInfo.isConfigCustom"
                    style="padding: 4px 0; display: flex"
                >
                    <span>{{ $t('v2.general.useOneConfigWarning') }}</span>
                    <div class="config-action">
                        <span
                            @click="
                                changeConfigAutoComplete(inputInfo, 'config')
                            "
                            :class="{
                                'active-config-autocomplete':
                                    inputInfo.isConfigAutocomplete,
                                'mdi mdi-cog': true
                            }"
                        ></span>
                        <span
                            @click="
                                changeConfigAutoComplete(inputInfo, 'input')
                            "
                            :class="{
                                'active-config-autocomplete':
                                    !inputInfo.isConfigAutocomplete,
                                'mdi mdi-function-variant': true
                            }"
                        ></span>
                    </div>
                </div>
                <i
                    :class="{
                        'mdi mdi-calendar float-right input-item-func ml-1': true
                    }"
                    :style="{
                        right: '0',
                        top: '25px',
                        color: '#5e5e5e',
                        position: 'absolute'
                    }"
                    @click="openDateTimePicker($event, inputInfo)"
                    v-if="inputInfo.isDateTime"
                ></i>
                <i
                    v-show="!viewOnly && !inputInfo.disabled"
                    :class="{
                        'mdi mdi-dock-window float-right input-item-func ml-1': true,
                        active: inputInfo.title == largeFormulaEditor.name,
                        'd-none':
                            inputInfo.activeTab &&
                            inputInfo.activeTab == 'orgchart'
                    }"
                    @click="openLargeValueEditor(inputInfo, name)"
                    v-if="
                        (!inputInfo.isConfigAutocomplete &&
                            inputInfo.type == 'script') ||
                        inputInfo.type == 'userAssignment'
                    "
                ></i>
                <!-- @abc(inputInfo) -->
                <configTime
                    @value="changeValue"
                    :cronTabValue="inputInfo.value"
                    v-if="inputInfo.title == 'Time cycle (cron)'"
                >
                </configTime>
                <i
                    :class="{
                        'mdi mdi-function float-right input-item-func': true,
                        active: inputInfo.activeTab == 'script'
                    }"
                    @click="changeAssignmentType(inputInfo, name, 'script')"
                    style="border-right: 1px solid #cccccc"
                    v-if="inputInfo.type == 'userAssignment'"
                ></i>
                <i
                    :class="{
                        'mdi mdi-sitemap float-right input-item-func': true,
                        active: inputInfo.activeTab == 'orgchart'
                    }"
                    @click="changeAssignmentType(inputInfo, name, 'orgchart')"
                    v-if="inputInfo.type == 'userAssignment'"
                ></i>
            </div>

            <transition name="fade" mode="out-in">
                <component
                    @change="
                        (data) => {
                            handleChangeInputValue(inputInfo, name, data);
                        }
                    "
                    @input="
                        (data) => {
                            handleInputValue(inputInfo, name, data);
                        }
                    "
                    @blur="handleInputBlur(inputInfo, name)"
                    @keyup="
                        (data) => {
                            handleKeyUpInputValue(inputInfo, name, data);
                        }
                    "
                    @click="handleClickInput()"
                    @run-formula-finished="runFormulaFinished"
                    @input-value-changed="
                        (data) => {
                            handleInputValueChange(name, data);
                        }
                    "
                    :ref="'inputItem_' + name"
                    solo
                    :items="inputInfo.options"
                    flat
                    hide-details
                    v-if="
                        !inputInfo.hidden &&
                        !inputInfo.isConfigAutocomplete &&
                        inputInfo.type != 'fileUploadConfig'
                    "
                    :style="{
                        'min-width': !inputInfo.minWidth
                            ? inputMinwidth(inputInfo.singleLine)
                            : inputInfo.minWidth,
                        width: !inputInfo.minWidth
                            ? alwaysSingleLine[inputInfo.type]
                                ? '100%'
                                : inputWidth(inputInfo.singleLine)
                            : inputInfo.minWidth,
                        'border-color': inputInfo.hasOwnProperty(
                            'validateStatus'
                        )
                            ? !inputInfo.validateStatus.isValid
                                ? 'red !important'
                                : 'inherit '
                            : 'inherit ',
                        ...(inputInfo.customStyle ? inputInfo.customStyle : {})
                    }"
                    :id="inputInfo.id ? inputInfo.id : ''"
                    :class="
                        'sym-small-size sym-style-input d-inline-block ' +
                        (inputInfo.classes ? inputInfo.classes : '')
                    "
                    :key="name"
                    :instance="instance"
                    single-line
                    :disabled="inputInfo.disabled || viewOnly"
                    v-bind="getInputProps(inputInfo)"
                    v-model="inputInfo.value"
                    :append-icon="
                        inputInfo.appendIcon ? inputInfo.appendIcon : ''
                    "
                    @click:append="handleClickAppend"
                    :is="getInputTag(inputInfo.type)"
                >
                    <template slot="item" slot-scope="data">
                        <template>
                            <div>
                                <v-icon v-if="data.item.icon">{{
                                    data.item.icon
                                }}</v-icon>
                                <span>{{
                                    data.item.text
                                        ? data.item.text
                                        : data.item.name
                                }}</span>
                            </div>
                        </template>
                    </template>
                </component>
            </transition>
            <transition name="fade" mode="out-in">
                <v-autocomplete-auto
                    :configData="inputInfo.configData"
                    :instance="instance"
                    :disabled="inputInfo.disabled || viewOnly"
                    @change="
                        (data) => {
                            handleChangeInputValue(inputInfo, name, data);
                        }
                    "
                    v-if="
                        inputInfo.isConfigCustom &&
                        inputInfo.isConfigAutocomplete
                    "
                />
            </transition>
            <transition name="fade" mode="out-in">
                <config-upload-file-table
                    :configData="inputInfo.value"
                    :instance="instance"
                    :key="instance"
                    @change="
                        (data) => {
                            handleChangeInputValue(inputInfo, name, data);
                        }
                    "
                    v-if="inputInfo.type == 'fileUploadConfig'"
                />
            </transition>
            <div
                class="error-message"
                v-if="
                    inputInfo.validateStatus &&
                    !inputInfo.validateStatus.isValid
                "
            >
                {{ inputInfo.validateStatus.message }}
            </div>
        </div>
        <symper-drag-panel
            @before-close="closeLargeFormulaEditor()"
            :showPanel="largeFormulaEditor.open"
            :actionTitle="largeFormulaEditor.data.title"
            :panelData="largeFormulaEditor.data"
            :dragPanelWidth="dragPanelWidth"
            :isDetach="false"
            :dragPanelHeight="dragPanelHeight"
            ref="dragPanel"
        >
            <template slot="panel-action">
                <v-icon
                    v-if="isDebugMode && !isShowDebugMode"
                    @click="showDebugMode"
                    >mdi-bug-outline</v-icon
                >
                <v-icon v-if="isShowDebugMode" @click="debug"
                    >mdi-play-outline</v-icon
                >
            </template>
            <template slot="drag-panel-content" slot-scope="{ panelData }">
                <orgchart-selector
                    @input="translateOrgchartValuesToTags"
                    v-if="getDragPanelContent(panelData) == 'orgchart-selector'"
                    v-model="panelData.value.orgchartSelectorValue"
                ></orgchart-selector>
                <formula-editor
                    :disabled="inputInfo.disabled || viewOnly"
                    v-else-if="panelData.type == 'userAssignment'"
                    v-model="panelData.value.formula"
                    @blur="handleLargeFormulaEditorBlur"
                    ref="edtFormula"
                    :width="'100%'"
                    :height="'370px'"
                ></formula-editor>
                <formula-editor
                    v-else
                    @blur="handleLargeFormulaEditorBlur"
                    v-model="panelData.value"
                    v-bind="panelData"
                    ref="edtFormula"
                    :width="'100%'"
                    :height="isShowDebugMode ? '250px' : '365px'"
                    :isDebugView="true"
                ></formula-editor>
            </template>
        </symper-drag-panel>
        <datetime-picker
            ref="dateTimePicker"
            @apply-datetime="appendValueToSciptEditor"
            :position="currentPointer"
        ></datetime-picker>
    </div>
</template>
<script>
import {
    VTextField,
    VSelect,
    VCheckbox,
    VRadio,
    VSwitch,
    VTextarea,
    VColorPicker
} from 'vuetify/lib';
import TreeValidate from './../../views/document/sideright/items/FormValidateTpl.vue';
import MultiTable from './../../views/document/sideright/items/MultiTable.vue';
import ConfigTime from './../common/ConfigTime.vue';
import LinkConfig from './../../views/document/sideright/items/LinkConfig.vue';
import FormAutoComplete from './../../views/document/sideright/items/FormAutoComplete';
import ConfigUploadFile from './../../views/document/sideright/items/ConfigUploadFile';
import FormulaEditor from './../formula/editor/FormulaEditor';
import DateFormat from './../common/DateFormat';
import Editor from './../common/editor/Editor';
import ButtonSelect from './../common/bi/ButtonSelect';
import ColorPalette from './../common/bi/ColorPalette';
import PickColorSingle from './../common/bi/PickColorSingle';
import NumberFormat from './../common/NumberFormat';
import MappingTable from './../common/customTable/DataTable';
import SymperDragPanel from './SymperDragPanel';
import SymperUserAssignment from './SymperUserAssignment';
import OrgchartSelector from './../user/OrgchartSelector';
import DateTimePicker from './../common/DateTimePicker.vue';
import SymperListOrdering from './../common/symperInputs/SymperListOrdering';
import SymperListAutocomplete from './../common/symperInputs/SymperListAutocomplete';
import SymperListCombobox from './../common/symperInputs/SymperListCombobox';
import SymperColorPicker from '@/components/common/symperInputs/SymperColorPicker.vue';
import SymperDefaultControlDocument from '@/components/common/symperInputs/SymperDefaultControlDocument.vue';
import ConditionalFormat from './../common/bi/ConditionalFormat';
import SymperRadioButton from '@/components/common/symperInputs/SymperRadioButton.vue';
import UploadFile from '@/components/common/UploadFile.vue';
import GroupDepartment from '@/views/document/sideright/items/GroupDepartment.vue';
import SymperPassword from './../common/symperInputs/SymperPassword';

import DataTable from '@/components/common/dataTable/DataTable.vue';
var titleSizeMap = {
    small: '11px',
    normal: '12px',
    medium: '13px',
    large: '14px'
};
const inputTypeConfigs = {
    numeric: {
        tag: 'v-text-field',
        props(config) {
            return {
                placeholder: config.title,
                type: 'number'
            };
        }
    },
    number: {
        tag: 'v-text-field',
        props(config) {
            return {
                placeholder: config.title,
                type: 'number'
            };
        }
    },
    password: {
        tag: 'symper-password',
        props(config) {
            return {
                placeholder: config.placeholder ? config.placeholder : '',
                label: config.label ? config.label : '',
                value: config.value
            };
        }
    },
    text: {
        tag: 'v-text-field',
        props(config) {
            return {
                placeholder: config.placeholder
                    ? config.placeholder
                    : config.title,
                rules: config.rules ? config.rules : []
            };
        }
    },
    select: {
        tag: 'v-select',
        props(config) {
            return {
                label: config.title,
                placeholder: config.placeholder ? config.placeholder : '',
                appendIcon: config.appendIcon ? config.appendIcon : '',
                menuProps: config.menuProps ? config.menuProps : {},
                height: config.height ? config.height : '',
                dense: config.dense ? true : false,
                disabled: config.disabled ? config.disabled : false,
                returnObject: config.returnObject ? config.returnObject : false,
                itemValue: config.itemValue ? config.itemValue : 'value',
                itemText: config.itemText ? config.itemText : 'text'
            };
        }
    },
    checkbox: {
        tag: 'v-checkbox',
        props(config) {
            return {
                label: config.title ? config.title : config.label,
                value: config.value ? config.value : false
            };
        }
    },
    radio: {
        tag: 'symper-radio-button',
        props(config) {
            return {
                label: config.title,
                items: config.items,
                value: config.value
            };
        }
    },
    switch: {
        tag: 'v-switch',
        props(config) {
            return {
                label: config.title
            };
        }
    },
    // color: {
    //     tag: "v-color-picker",
    //     props(config) {
    //         return {
    //             label: config.title,
    //             'dot-size':"17",
    //             'mode':"hexa",
    //             'swatches-max-height':"116"
    //         };
    //     }
    // },
    textarea: {
        tag: 'v-textarea',
        props(config) {
            return {
                label: config.title,
                rows: config.rows ? config.rows : 2,
                'auto-grow': config.autoGrow ? config.autoGrow : true,
                placeholder: config.placeholder
                    ? config.placeholder
                    : config.title
            };
        }
    },
    treeValidate: {
        tag: 'v-tree-validate',
        props(config) {
            return {
                label: config.title
            };
        }
    },

    linkConfig: {
        tag: 's-link-config',
        props(config) {
            return {
                label: config.title,
                dataConfig: config.configData
            };
        }
    },

    script: {
        tag: 'formula-editor',
        props(config) {
            return {
                simpleMode: true,
                width: '100%',
                height:
                    config.style && config.style.height
                        ? config.style.height
                        : '80px',
                formulaValue: config.value,
                listKeyworks: config.listKeyworks ? config.listKeyworks : {},
                disabled: config.disabled ? config.disabled : false
            };
        }
    },
    mappingTable: {
        tag: 'mapping-table',
        props(config) {
            return {
                columnDefs: config.columns,
                style: config.style,
                rowData: config.value,
                lists: config.lists,
                controlValueKey: config.controlValueKey,
                positionBox: config.positionBox
            };
        }
    },
    table: {
        tag: 'data-table',
        props(config) {
            let cols = [];
            config.columns.forEach((element) => {
                let col = {
                    field: element.name,
                    headerName: element.title,
                    width: element.width ? element.width : 70
                };
                element.cellRenderer &&
                    (col.cellRenderer = element.cellRenderer);
                if (element.type == 'autocomplete') {
                    col.cellEditor = 'agRichSelectCellEditor';
                    col.cellEditorParams = {
                        values: element.source
                    };
                }
                cols.push(col);
            });
            return {
                columns: cols,
                rowData: config.value,
                tableHeight: '150px',
                showSearchBox: config.showSearchBox ? true : false
            };
        }
    },
    multiTable: {
        tag: 'multi-table',
        props(config) {
            return {
                value: config.value,
                nodes: config.options.nodeLoads,
                controls: config.options.controls
            };
        }
    },
    combobox: {
        tag: 'SymperListCombobox',
        props(config) {
            let props = {
                columns: config.columns,
                data: config.value,
                multipleSelection: config.multipleSelection,
                showId: config.hasOwnProperty('showId') ? config.showId : true,
                showAvatarUser: config.hasOwnProperty('showAvatarUser')
                    ? config.showAvatarUser
                    : false,
                isSelectionChip: config.isSelectionChip == false ? false : true,
                value: config.value
            };
            if (config.onSearch) {
                props.onSearch = config.onSearch;
            }
            if (config.properties) {
                props.properties = config.properties;
            }

            if (config.textKey) {
                props.textKey = config.textKey;
            }

            if (config.valueKey) {
                props.valueKey = config.valueKey;
            }
            return props;
        }
    },
    autocomplete: {
        tag: 'SymperListAutocomplete',
        props(config) {
            let props = {
                columns: config.columns,
                data: config.value,
                disabled: config.disabled,
                menuProps: config.menuProps ? config.menuProps : {},
                deleteable: config.deleteable ? true : false,
                placeholder: config.placeholder
                    ? config.placeholder
                    : config.hidePlaceholder
                    ? ''
                    : config.title,
                multiTitle: config.multiTitle ? true : false,
                textHTML: config.textHTML ? config.textHTML : '',
                multipleSelection: config.multipleSelection,
                showSelectAll: config.showSelectAll ? true : false,
                showId: config.hasOwnProperty('showId') ? config.showId : true,
                isSelectionChip: config.isSelectionChip == false ? false : true,
                value: config.value,
                subInfo: config.subInfo ? config.subInfo : 'title'
            };
            if (config.onSearch) {
                props.onSearch = config.onSearch;
            }
            if (config.properties) {
                props.properties = config.properties;
            }

            if (config.textKey) {
                props.textKey = config.textKey;
            }

            if (config.valueKey) {
                props.valueKey = config.valueKey;
            }
            return props;
        }
    },
    ordering: {
        tag: 'symper-list-ordering',
        props(config) {
            return {};
        }
    },
    userAssignment: {
        tag: 'symper-user-assginment',
        props(config) {
            return {
                activeTab: config.activeTab
            };
        }
    },
    dateFormat: {
        tag: 'date-format',
        props(config) {
            return {
                value: config.value
            };
        }
    },
    numberFormat: {
        tag: 'number-format',
        props(config) {
            return {
                value: config.value
            };
        }
    },
    fileUploadConfig: {
        tag: 'config-upload-file-table',
        props(config) {
            return {
                value: config.value
            };
        }
    },
    defaultControlDocument: {
        tag: 'default-control-document',
        props(config) {
            return {
                docId: config.docId
            };
        }
    },
    configTime: {
        tag: 'configTime',
        props(config) {
            return {
                label: config.title
            };
        }
    },
    editor: {
        tag: 'symper-editor',
        props(config) {
            return {
                label: config.title
            };
        }
    },
    btnSelect: {
        tag: 'button-select',
        props(config) {
            return {
                value: config.value,
                text: config.text
            };
        }
    },
    colorArray: {
        tag: 'color-palette',
        props(config) {
            return {
                value: config.value
            };
        }
    },
    color: {
        tag: 'pick-color-single',
        props(config) {
            return {
                value: config.value
            };
        }
    },
    conditionalFormatItems: {
        tag: 'conditional-format-items',
        props(config) {
            return {
                value: config.value
            };
        }
    },
    file: {
        tag: 'upload-file',
        props(config) {
            return config.props;
        }
    },
    groupDpm: {
        tag: 'GroupDepartment',
        props(config) {
            return {
                dataConfig: config.configData,
                conditionControls: config.conditionControls
            };
        }
    }
};
export default {
    name: 'formTpl',
    created() {
        this.$evtBus.$on('bi-report-unset-showSubTotal', () => {
            this.allInputs.showSubTotal.value = false;
        });
        this.setActiveTabForUserAssignment();
        this.$evtBus.$on('script-editor-ide-change-output', (data) => {
            if (this.allInputs && this.allInputs[data.name]) {
                let editorInstance = this.$refs['inputItem_' + name][0];
                let instKey = editorInstance.getFormulaEditorInstKey();
                if (instKey == data.instKey) {
                    if (this.allInputs[data.name].type == 'userAssignment') {
                        this.allInputs[data.name].value.formula = data.value;
                    } else {
                        this.allInputs[data.name].value = data.value;
                    }
                }
            }
        });
    },
    watch: {
        allInputs: {
            // immediate: true,
            deep: true,
            handler(arr, old) {
                this.setActiveTabForUserAssignment();
            }
        }
    },
    data() {
        return {
            markAllInputChangeByInternal: false, // đánh dấu một key trong allInput thay đổi là do trong component thay đổi ko phải do compoennt cha thay đổi
            alwaysSingleLine: {
                checkbox: true,
                switch: true
                // radio: true
            },
            largeFormulaEditor: {
                name: '', // tên của input
                open: false, // có mở largeFormulaEditor hay ko
                data: {} // Dữ liệu của input cần mở lên để edit trong khung lớn,
            },
            currentPointer: { left: '35px', top: '0' },
            dragPanelWidth: 500,
            isShowDebugMode: false,
            isDebugMode: true,
            dragPanelHeight: 400
        };
    },
    methods: {
        labelMinwidth(val) {
            return this.singleLine || val ? this.labelWidth : '100%';
        },
        compLabelWidth(val) {
            return this.singleLine || val ? this.labelWidth : '100%';
        },
        inputWidth(val) {
            let w = this.labelWidth;
            return this.singleLine || val ? `calc(100% - ${w} - 8px)` : '100%';
        },
        inputMinwidth(val) {
            let w = this.labelWidth;
            return this.singleLine || val ? `calc(100% - ${w} - 8px)` : '100%';
        },

        runFormulaFinished(data) {
            this.$emit('run-formula-finished', data);
        },
        changeUploadConfig(value) {},
        changeValue(value) {
            let crobTab = '';
            for (let i = 0; i < value.length; i++) {
                crobTab += value[i] + ' ';
            }
            // let tes1= crobTab;
            this.allInputs['timercycledefinition'].value = crobTab;
        },
        /**
         * hoangnd:
         * Hàm chuyển giữa 2 kiểu config của autocomplete tự động
         */
        changeConfigAutoComplete(input, type) {
            if (!input.isConfigAutocomplete && type == 'config') {
                input.isConfigAutocomplete = true;
            }
            if (input.isConfigAutocomplete && type == 'input') {
                input.isConfigAutocomplete = false;
            }
        },
        /**
         * hoangnd
         * Hàm mở sang chế độ debug để kiểm tra công thức
         * (syntax, query...)
         */
        showDebugMode() {
            this.isShowDebugMode = true;
            this.dragPanelWidth = 900;
            this.dragPanelHeight = 700;
            this.$refs.edtFormula.toggleDebugView();
        },
        /**
         * hoangnd
         * Ẩn chế độ debug
         */
        hideDebugMode() {
            this.isShowDebugMode = false;
            this.dragPanelWidth = 500;
            this.dragPanelHeight = 400;
            this.$refs.edtFormula.toggleDebugView();
        },
        /**
         * Hàm thực thi query khi ấn debug
         */
        debug() {
            this.$refs.edtFormula.executeFormulas();
        },
        setActiveTabForUserAssignment() {
            if (!this.markAllInputChangeByInternal) {
                for (let inputName in this.allInputs) {
                    let input = this.allInputs[inputName];
                    if (input.type == 'userAssignment' && input.value.formula) {
                        this.allInputs[inputName].activeTab = 'script';
                    }
                }
            }
        },
        handleClickAppend() {
            this.$emit('append-icon-click');
        },
        handleLargeFormulaEditorBlur() {
            // this.hideDragPanel();
            let name = this.largeFormulaEditor.name;
            let inputInfo = this.allInputs[name];
            this.handleInputBlur(inputInfo, name);
        },
        handleInputBlur(inputInfo, name) {
            if (inputInfo.type == 'script') {
                this.$evtBus.$emit('reset-sql-query-ide-connector');
            }
            this.$emit('input-blur', inputInfo, name);
        },
        isLargeFormulaEditorOpen() {
            return this.$refs.dragPanel.selfShowPanel;
        },
        translateOrgchartValuesToTags() {
            if (this.translateOrgchartValuesToTagsDebounce) {
                clearTimeout(this.translateOrgchartValuesToTagsDebounce);
            }
            this.translateOrgchartValuesToTagsDebounce = setTimeout(
                (self) => {
                    // chuyển lại định dạng để hiển thị ở dạng tags
                    let vls = [];
                    for (let item of self.largeFormulaEditor.data.value
                        .orgchartSelectorValue) {
                        let node =
                            self.$store.state.app.orgchartNodes[
                                'orgcid' + item.idOrgchart
                            ].children[item.idNode];
                        vls.push({
                            text: node.name,
                            id: node.gid,
                            type: 'department'
                        });
                    }

                    for (let item of self.largeFormulaEditor.data.value
                        .orgChart) {
                        if (item.type == 'user') {
                            vls.push(item);
                        }
                    }

                    self.largeFormulaEditor.data.value.orgChart = vls;
                },
                500,
                this
            );
        },
        translateTagsToOrgchartValues() {
            let vls = [];
            for (let item of this.largeFormulaEditor.data.value.orgChart) {
                if (item.type == 'department') {
                    let bridgeIndex = item.id.indexOf('-');
                    vls.push({
                        idNode: item.id.slice(bridgeIndex + 1),
                        idOrgchart: item.id.slice(0, bridgeIndex)
                    });
                }
            }
            this.largeFormulaEditor.data.value.orgchartSelectorValue = vls;
        },
        getDragPanelContent(panelData) {
            if (panelData.type == 'userAssignment') {
                if (panelData.activeTab == 'orgchart') {
                    return 'orgchart-selector';
                } else {
                    return 'formula-editor';
                }
            } else {
                return 'formula-editor';
            }
        },
        changeAssignmentType(inputInfo, name, type) {
            this.$refs['inputItem_' + name][0].switchToTab(type);
            this.markAllInputChangeByInternal = true;
            inputInfo.activeTab = type;

            setTimeout(
                (self) => {
                    self.markAllInputChangeByInternal = false;
                },
                50,
                this
            );
        },
        closeLargeFormulaEditor() {
            if (this.isShowDebugMode) {
                this.hideDebugMode();
            }
            // let info = this.largeFormulaEditor;
            // setTimeout((self) => {
            //     self.largeFormulaEditor.name = '';
            // }, 500, this);
        },
        openLargeValueEditor(inputInfo, name) {
            let editorInstance = this.$refs['inputItem_' + name][0];
            let instKey = editorInstance.getFormulaEditorInstKey();
            let data = {};
            data.title = inputInfo.title;
            data.name = name;
            if (inputInfo.activeTab == undefined) {
                data.value = inputInfo.value;
            } else {
                data.value = inputInfo.value.formula;
            }
            data.instKey = instKey;
            this.$evtBus.$emit('open-sql-query-ide', data);
        },
        openDateTimePicker(event, inputInfo) {
            this.currentPointer = { top: event.clientY + 'px', left: '35px' };
            this.$refs.dateTimePicker.openPicker();
        },
        handleChangeInputValue(inputInfo, name, data) {
            /**
             * emit sự kiện thay đổi giá trị của một input trong form
             * name: tên của input này
             * inputInfo: chứa các thông tin về input
             */
            if (inputInfo.type == 'script') {
                let editorInstance = this.$refs['inputItem_' + name][0];
                this.$evtBus.$emit(
                    'script-editor-ide-connect-formtpl',
                    inputInfo,
                    name,
                    editorInstance.getFormulaEditorInstKey()
                );
            }
            this.$emit('input-value-changed', name, inputInfo, data);
        },
        handleInputValue(inputInfo, name, data) {
            /**
             *
             * emit sự kiện thay đổi giá trị của một input trong form
             * name: tên của input này
             * inputInfo: chứa các thông tin về input
             */
            this.$emit('input-value', name, inputInfo, data);
            if (inputInfo.validate && typeof inputInfo.validate == 'function') {
                inputInfo.validate();
            }
        },
        handleClickInput() {
            this.$emit('click-input');
        },
        handleKeyUpInputValue(inputInfo, name, data) {
            this.$emit('input-value-keyup', name, inputInfo, data);
        },
        getInputProps(inputConfigs) {
            let rsl = inputTypeConfigs[inputConfigs.type].props(inputConfigs);
            for (let key in rsl) {
                this.$set(rsl, key, rsl[key]);
            }
            return rsl;
        },
        getInputTag(inputType) {
            return inputTypeConfigs[inputType].tag;
        },

        appendValueToSciptEditor(dateTime) {
            this.$refs.basicFormulaEditor.setValue(dateTime);
        },
        hideDragPanel() {
            this.$refs.dragPanel.hide();
        },
        handleInputValueChange(name, data) {
            this.$emit('input-value-changed', name, data);
        },
        showMoreInfor() {
            this.$emit('show-more-infor');
        }
    },
    props: {
        /**
         * danh sách tất cả các input cần hiển thị, có dạng:
         * {
         *      phone: {
         *          title: "Số điện thoại",
         *          type: "numeric",
         *          value: 12365,
         *      },
         *      sex: {
         *          title: "Giới tính",
         *          type: "select",
         *          value: male,
         *          options: [
         *              {
         *                  text: "Nam",
         *                  value: "male",
         *                  icon: "mdi-male"
         *              },
         *              {
         *                  text: "Nữ",
         *                  value: "female",
         *                  icon: "mdi-female"
         *              }
         *          ],
         *      },
         * }
         */
        cellId: {
            type: [Number, String]
        },
        instanceKey: {
            type: [Number, String]
        },
        allInputs: {
            type: Object,
            default() {
                return {};
            }
        },
        /**
         * Label và input có nằm trên cùng một dòng không
         */
        singleLine: {
            type: Boolean,
            default: false
        },
        // độ rộng của lable (tác dụng trong trường hợp singleLine là true)
        labelWidth: {
            type: String,
            default: '50px'
        },
        // Khoảng cách giữa label và input (tác dụng trong trường hợp singleLine là true)
        space: {
            type: String,
            default: '8px'
        },
        // khoảng cách giữa lable và input trong trường hợp không phải singleLine
        marginTop: {
            type: String,
            default: '0'
        },
        viewOnly: {
            type: Boolean,
            default: false
        },
        instance: {
            type: Number
        },
        titleSize: {
            type: String,
            default: 'small' // nhận một trong các giá trị: small, normal, large
        }
    },
    computed: {
        titleFontSize() {
            return titleSizeMap[this.titleSize];
        }
    },
    components: {
        VTextField,
        VColorPicker,
        SymperRadioButton,
        VSelect,
        VCheckbox,
        VRadio,
        VSwitch,
        VTextarea,
        'multi-table': MultiTable,
        configTime: ConfigTime,
        'v-tree-validate': TreeValidate,
        's-link-config': LinkConfig,
        'v-autocomplete-auto': FormAutoComplete,
        'config-upload-file-table': ConfigUploadFile,
        FormulaEditor,
        DataTable,
        MappingTable,
        'date-format': DateFormat,
        'number-format': NumberFormat,
        SymperDragPanel,
        'symper-user-assginment': SymperUserAssignment,
        'orgchart-selector': OrgchartSelector,
        SymperListOrdering: SymperListOrdering,
        SymperListAutocomplete,
        'datetime-picker': DateTimePicker,
        SymperColorPicker: SymperColorPicker,
        'default-control-document': SymperDefaultControlDocument,
        'symper-editor': Editor,
        SymperListCombobox,
        'button-select': ButtonSelect,
        'color-palette': ColorPalette,
        'pick-color-single': PickColorSingle,
        'conditional-format-items': ConditionalFormat,
        UploadFile,
        GroupDepartment,
        'symper-password': SymperPassword
    }
};
</script>

<style>
.input-item-func {
    cursor: pointer;
    font-size: 15px;
    padding: 3px;
    margin-bottom: 3px;
}
.input-item-func.active {
    color: #f58634;
}
</style>
<style scoped>
.error-message {
    font-size: 11px;
    color: red;
    text-align: right;
    margin-top: 2px;
}
.config-action {
    margin-left: auto;
    margin-right: 4px;
    margin-bottom: 2px;
    font-size: 14px;
}
.config-action .mdi {
    border-radius: 3px;
    padding: 2px;
    cursor: pointer;
    margin-left: 2px;
}
.active-config-autocomplete {
    background: var(--symper-background-active);
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
</style>

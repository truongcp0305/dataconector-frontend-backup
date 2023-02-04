<template>
    <v-flex class="d-flex sym-document" style="height: calc(100%)">
        <div class="sym-document__side-bar-left">
            <sidebar-left :isConfigPrint="true" :instance="keyInstance" />
        </div>
        <vue-resizable
            :active="['r']"
            width="calc(100% - 480px)"
            @resize:move="resizeEditor"
            @resize:start="resizeEditorStart"
            @resize:end="resizeEditorEnd"
            height="calc(100% - 20px)"
            class="sym-document-editor"
        >
            <div class="sym-document-body">
                <div class="sym-document-action">
                    <editor-action
                        @document-action-save-document="saveFormPrint"
                        @document-action-clone-control="cloneControl"
                        @document-action-list-control-option="
                            setShowAllControlOption
                        "
                        @document-action-delete-control="deleteControl"
                        @document-action-save-to-local-storage="
                            saveContentToLocalStorage
                        "
                        @document-action-get-from-local-storage="
                            getFromLocalStorege
                        "
                        @document-action-delete-cache="deleteLocalStorage"
                    />
                </div>
                <textarea
                    ref="editorLibWrapper"
                    :id="'document-editor-' + keyInstance"
                >
                </textarea>
            </div>
        </vue-resizable>
        <div class="sym-document__side-bar-right">
            <sidebar-right
                ref="sidebarRight"
                :isConfigPrint="true"
                :instance="keyInstance"
            />
        </div>
        <PrintTableConfig
            ref="printTableConfig"
            @config-column-table-print="ConfigColumnTablePrint"
        />
        <auto-complete-control
            ref="autocompleteControl"
            @add-control="insertControl"
        />
        <save-form-panel :instance="keyInstance" ref="saveFormPanel" />
        <err-message :listErr="listMessageErr" ref="errMessage" />
        <all-control-option :instance="keyInstance" ref="allControlOption" />

        <v-dialog v-model="dialog" persistent max-width="290">
            <v-card>
                <v-card-title class="headline"
                    >{{$t('v2.doc.convertToVersion2Format')}}</v-card-title
                >
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="dialog = false"
                        >{{$t('v2.doc.cancel')}}</v-btn
                    >
                    <v-btn
                        color="green darken-1"
                        text
                        @click="handlePasteContent"
                        >{{$t('v2.doc.agree')}}</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>
<script>
// import Editor from '@tinymce/tinymce-vue';
import EditorAction from './../items/Action.vue';
import SideBarLeft from './../sideleft/SideBarLeft.vue';
import SideBarRight from './../sideright/SideBarRight.vue';
import PrintTableConfig from './PrintTableConfig';
import AutoCompleteControl from './../items/AutoCompleteControl.vue';
import SaveFormPanel from './SaveFormPanel';
import ErrMessagePanel from './../../../views/document/items/ErrMessagePanel.vue';
import ControlNameRelated from './../../../views/document/items/ControlNameRelated.vue';
import AllControlInDoc from './../../../views/document/items/AllControlInDoc.vue';
import {
    GetControlProps,
    mappingOldVersionControlProps,
    mappingOldVersionControlFormulas,
    getAPropsControl,
    listControlNotNameProp,
} from './../../../components/document/controlPropsFactory.js';
import { documentApi } from './../../../api/Document.js';
import { formulasApi } from './../../../api/Formulas.js';
import { util } from './../../../plugins/util.js';
import { checkInTable } from './../common/common';
import { getInsertionCSS } from './../../../components/document/documentUtil.js';
import VueResizable from 'vue-resizable';
import { minimizeControl } from '../../../store/document/mutations';

import tinymce from 'tinymce/tinymce';

import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/content.min.css';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/table';
import 'tinymce/plugins/print';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/hr';

// biến lưu chiều rộng editor trước khi resize
const ALL_CONTROL = 'allControl';
const HTML_CONTENT = 'content';
const CODUMENT_PROPS = 'documentProperties';
export default {
    name: 'DocumentEditor',
    computed: {
        editorStore() {
            return this.$store.state.document.editor[this.keyInstance];
        },
        sDocumentProp() {
            return this.$store.state.document.documentProps[this.keyInstance];
        },
    },
    components: {
        'sidebar-left': SideBarLeft,
        'sidebar-right': SideBarRight,
        'editor-action': EditorAction,
        'auto-complete-control': AutoCompleteControl,
        'save-form-panel': SaveFormPanel,
        'err-message': ErrMessagePanel,
        'vue-resizable': VueResizable,
        'all-control-option': AllControlInDoc,
        'control-name-related': ControlNameRelated,
        PrintTableConfig,
    },
    mounted() {
        let self = this;
        tinymce.init({
            theme: 'silver',
            skin: 'oxide',
            selector: '#document-editor-' + self.keyInstance,
            forced_root_block: 'div',
            toolbar_items_size: 'small',
            menubar: false,
            plugins: [
                'advlist autolink lists link image table print preview',
                ' fullscreen',
                'table paste code hr',
            ],
            contextmenu: 'inserttable table | settingtable',
            toolbar:
                'undo redo | fontselect fontsizeselect formatselect | bold italic forecolor backcolor | \
                                alignleft aligncenter alignright alignjustify | \
                                bullist numlist indent hr | removeformat  table |  preview margin',
            fontsize_formats:
                '8px 10px 11px 12px 13px 14px 15px 16px 17px 18px 19px 20px 21px 22px 23px 24px 25px 26px 27px 28px 29px 30px 32px 34px 36px',
            font_formats:
                'Roboto = Roboto,sans-serif; Andale Mono=andale mono,times;' +
                'Arial=arial,helvetica,sans-serif;' +
                'Arial Black=arial black,avant garde;' +
                'Book Antiqua=book antiqua,palatino;' +
                'Comic Sans MS=comic sans ms,sans-serif;' +
                'Courier New=courier new,courier;' +
                'Georgia=georgia,palatino;' +
                'Helvetica=helvetica;' +
                'Impact=impact,chicago;' +
                'Symbol=symbol;' +
                'Tahoma=tahoma,arial,helvetica,sans-serif;' +
                'Terminal=terminal,monaco;' +
                'Times New Roman=times new roman,times;' +
                'Trebuchet MS=trebuchet ms,geneva;' +
                'Verdana=verdana,geneva;' +
                'Webdings=webdings;' +
                'Wingdings=wingdings,zapf dingbats',
            valid_elements: '*[*]',
            content_css: [
                'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css',
            ],
            setup: function (ed) {
                ed.ui.registry.addMenuItem('settingtable', {
                    text: 'Setting table',
                    disabled: false,
                    onAction: function (e) {
                        self.showPrintConfigTable(e);
                    },
                });

                ed.ui.registry.addButton('margin', {
                    icon: 'margin',
                    tooltip: 'Margin',
                    onAction: function (_) {
                        self.showPaddingPageConfig(ed);
                    },
                });
                for (let i = 0; i < self.listIconToolbar.length; i++) {
                    ed.ui.registry.addIcon(
                        self.listIconToolbar[i].name,
                        `<i class='mdi ` +
                            self.listIconToolbar[i].icon +
                            `' style='font-size:18px;rgba(0, 0, 0, 0.54);'></i>`,
                    );
                }
                ed.on('click', function (e) {
                    self.detectClickEvent(e);
                });
                ed.on('contextmenu', function (e) {
                    self.detectClickEvent(e);
                });
                ed.on('blur', function (e) {
                    self.detectBlurEditorEvent(e);
                });
                ed.on('keyup', function (e) {
                    self.keyHandler(e);
                });
                ed.on('paste', function (e) {
                    self.onPaste(e);
                });
            },
            init_instance_callback: function (editor) {
                self.editorCore = editor;
                self.initEditor();
            },
        });
    },
    activated() {},
    created() {
        this.$store.commit('document/setDefaultEditorStore', {
            instance: this.keyInstance,
        });
        this.documentId = this.$route.params.id;
        let thisCpn = this;
        /**
         * Nhận sự kiên từ click treeview danh sách các control trong doc thì highlight control và selected control
         */
        this.$evtBus.$on(
            'document-editor-click-treeview-list-control',
            (locale) => {
                let elControl = $(
                    '#document-editor-' + thisCpn.keyInstance + '_ifr',
                )
                    .contents()
                    .find('body #' + locale.id);
                thisCpn.setSelectedControlProp(
                    locale.event,
                    elControl,
                    $('#document-editor-' + this.keyInstance + '_ifr').get(0)
                        .contentWindow,
                );
            },
        );
    },
    data() {
        return {
            editorCore: null,
            isAutocompleteControl: false,
            listMessageErr: [],
            documentId: 0,
            documentProps: {},
            delta: 500,
            lastKeypressTime: 0,
            listIconToolbar: null,
            listNameValueControl: {},
            keyInstance: Date.now(),
            dialog: false,
        };
    },
    beforeMount() {
        this.listIconToolbar = [
            { name: 'bold', icon: 'mdi-format-bold' },
            { name: 'italic', icon: 'mdi-format-italic' },
            { name: 'remove-formatting', icon: 'mdi-format-clear' },
            { name: 'text-color', icon: 'mdi-format-color-highlight' },
            { name: 'highlight-bg-color', icon: 'mdi-format-color-fill' },
            { name: 'align-left', icon: 'mdi-format-align-left' },
            { name: 'align-center', icon: 'mdi-format-align-center' },
            { name: 'align-right', icon: 'mdi-format-align-right' },
            { name: 'align-justify', icon: 'mdi-format-align-justify' },
            { name: 'unordered-list', icon: 'mdi-format-list-bulleted-square' },
            { name: 'ordered-list', icon: 'mdi-format-list-numbered' },
            { name: 'outdent', icon: 'mdi-format-indent-decrease' },
            { name: 'indent', icon: 'mdi-format-indent-increase' },
            { name: 'table', icon: 'mdi-table' },
            { name: 'preview', icon: 'mdi-monitor-eye' },
            { name: 'margin', icon: 'mdi-margin' },
            { name: 'more-drawer', icon: 'mdi-dots-horizontal' },
            { name: 'image-options', icon: 'mdi-dots-horizontal' },
            { name: 'undo', icon: 'mdi-undo' },
            { name: 'redo', icon: 'mdi-redo' },
        ];
    },
    watch: {
        // kiểm tra xem route thay đổi khi vào editor là edit doc hay create doc
        $route(to) {
            this.documentId = Date.now();
            // this.$store.commit("document/setDefaultEditorStore",{instance:this.keyInstance});
            if (to.name == 'editDocument') {
                this.documentId = to.params.id;
            } else if (to.name == 'createDocument') {
                this.documentId = 0;
            }
        },
    },
    methods: {
        onPaste(event) {
            this.dialog = true;
        },
        handlePasteContent() {
            this.dialog = false;
            this.setContentForDocumentV1();
        },
        px2cm(px) {
            return (Math.round((px / 37.7952) * 100) / 100).toFixed(1);
        },

        // lấy data từ local storage
        getFromLocalStorege() {
            let allControl = localStorage.getItem(ALL_CONTROL);
            allControl = JSON.parse(allControl);
            let content = localStorage.getItem(HTML_CONTENT);
            let documentProperties = localStorage.getItem(CODUMENT_PROPS);
            this.editorCore.setContent(content);
            this.$store.commit('document/addTodocumentPropsEditor', {
                key: this.keyInstance,
                value: documentProperties,
            });
            this.$store.commit('document/addToDocumentEditorStore', {
                key: ALL_CONTROL,
                value: allControl,
                instance: this.keyInstance,
            });
        },
        //set data vào local storage
        saveContentToLocalStorage() {
            let allControl = this.editorStore.allControl;
            let content = this.editorCore.getContent();
            let documentProperties = this.sDocumentProp;
            localStorage.setItem(ALL_CONTROL, JSON.stringify(allControl));
            localStorage.setItem(HTML_CONTENT, content);
            localStorage.setItem(
                CODUMENT_PROPS,
                JSON.stringify(documentProperties),
            );
        },
        deleteLocalStorage() {
            localStorage.removeItem(ALL_CONTROL);
            localStorage.removeItem(HTML_CONTENT);
            localStorage.removeItem(CODUMENT_PROPS);
            this.$snotify({
                type: 'info',
                title: this.$t('v2.doc.deleteControlInLocalStorageSuccess'),
            });
        },
        // sao chép control và thêm vào sau nó
        cloneControl() {
            let currentControl = this.editorStore.currentSelectedControl;
            let controlInstance = util.cloneDeep(
                this.editorStore.allControl[currentControl.id],
            );
            let control = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.on-selected');
            if (control.length > 0) {
                control.removeClass('on-selected');
                let id = 's-control-id-' + Date.now();
                let newControl = control.clone().attr('id', id);
                newControl.insertAfter(control);
                let typeControl = control.attr('s-control-type');
                let table = control.closest('.s-control-table');
                if (table.length > 0) {
                    let tableId = table.attr('id');
                    this.addToAllControlInTable(
                        id,
                        {
                            properties: controlInstance.properties,
                            formulas: controlInstance.formulas,
                            type: typeControl,
                        },
                        tableId,
                    );
                } else {
                    this.addToAllControlInDoc(id, {
                        properties: controlInstance.properties,
                        formulas: controlInstance.formulas,
                        type: typeControl,
                    });
                }
            }
        },
        deleteControl() {
            let control = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.on-selected');
            this.resetSelectControl();
            control.remove();
        },
        // ham tạo dialog của tinymce để cấu hình padding doc
        showPaddingPageConfig(ed) {
            var left = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('body')
                .css('padding-left')
                .slice(0, -2);
            var right = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('body')
                .css('padding-right')
                .slice(0, -2);
            var top = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('body')
                .css('padding-top')
                .slice(0, -2);
            var bottom = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('body')
                .css('padding-bottom')
                .slice(0, -2);
            left = this.px2cm(left);
            right = this.px2cm(right);
            top = this.px2cm(top);
            bottom = this.px2cm(bottom);
            ed.windowManager.open({
                title: this.$t('v2.doc.pageAlignment'),
                body: {
                    type: 'panel',
                    items: [
                        {
                            type: 'input',
                            name: 'top',
                            placeholder: 'cm',
                            label: this.$t('v2.doc.topMargin')
                        },
                        {
                            type: 'input',
                            name: 'right',
                            placeholder: 'cm',
                            label: this.$t('v2.doc.rightMargin')
                        },
                        {
                            type: 'input',
                            name: 'bottom',
                            placeholder: 'cm',
                            label: this.$t('v2.doc.bottomMargin')
                        },
                        {
                            type: 'input',
                            name: 'left',
                            placeholder: 'cm',
                            label: this.$t('v2.doc.leftMargin')
                        }
                    ]
                },
                buttons: [
                    {
                        type: 'submit',
                        name: 'submitButton',
                        text: this.$t('v2.doc.put'),
                        primary: true
                    }
                ],

                onSubmit: function (e) {
                    let data = e.getData();
                    var left = data.left;
                    var right = data.right;
                    var top = data.top;
                    var bottom = data.bottom;
                    $('#document-editor-' + this.keyInstance + '_ifr')
                        .contents()
                        .find('body')
                        .css({
                            'padding-left': left + 'cm',
                            'padding-right': right + 'cm',
                            'padding-top': top + 'cm',
                            'padding-bottom': bottom + 'cm',
                            margin: '0',
                        });
                },
            });
        },
        setShowAllControlOption() {
            this.$refs.allControlOption.getData();
            this.$refs.allControlOption.showDialog();
        },
        // mở modal lưu , edit doc
        saveFormPrint() {
            let dataPost = {
                documentId: this.documentId,
                type: 'print',
                content: this.editorCore.getContent(),
            };
            let thisCpn = this;
            documentApi
                .saveForm(dataPost)
                .then((res) => {
                    if (res.status == 200) {
                        thisCpn.editorCore.remove();
                        thisCpn.$router.push('/documents');
                        thisCpn.$snotify({
                            type: 'success',
                            title: thisCpn.$t('v2.doc.saveFormSuccess'),
                        });
                    } else {
                        thisCpn.$snotify({
                            type: 'error',
                            title: res.message,
                            text: res.lastErrorMessage,
                        });
                    }
                })
                .catch((err) => {
                    thisCpn.$snotify({
                        type: 'error',
                        title: thisCpn.$t('v2.doc.cannotSaveDocument'),
                    });
                })
                .finally(() => {});
        },
        checkEmptyControl(allControl, tableId) {
            for (let controlId in allControl) {
                if (allControl[controlId].hasOwnProperty('listFields')) {
                    this.checkEmptyControl(
                        allControl[controlId]['listFields'],
                        controlId,
                    );
                }
                if (
                    !listControlNotNameProp.includes(
                        allControl[controlId].type,
                    ) &&
                    allControl[controlId].properties.name.value == ''
                ) {
                    let controlEl = $(
                        '#document-editor-' + this.keyInstance + '_ifr',
                    )
                        .contents()
                        .find('#' + controlId);
                    controlEl.addClass('s-control-error');
                    this.$store.commit('document/updateProp', {
                        id: controlId,
                        name: 'name',
                        value: this.$t('v2.doc.notBlankControlName'),
                        tableId: tableId,
                        type: 'errorMessage',
                        instance: this.keyInstance,
                    });
                }
            }
        },
        /**
         * Hàm xử lí lấy dữ liệu các công thức để insert vào formulas service trước khi lưu
         */
        getDataToSaveMultiFormulas(listControl) {
            let listControlFormulas = { insert: {}, update: {} };
            for (let controlId in listControl) {
                let control = listControl[controlId];
                let listFormulas = [];
                let listFormulasUpdate = [];
                let formulas = control.formulas;
                if (control.type == 'table') {
                    let listField = control.listFields;
                    let listFormulasControlInTable =
                        this.getDataToSaveMultiFormulas(listField);
                    listControlFormulas.insert = Object.assign(
                        listFormulasControlInTable.insert,
                        listControlFormulas.insert,
                    );
                    listControlFormulas.update = Object.assign(
                        listFormulasControlInTable.update,
                        listControlFormulas.update,
                    );
                }
                for (let f in formulas) {
                    if (formulas[f].value != '') {
                        if (formulas[f].formulasId != 0) {
                            let item = {};
                            item[f] = {};
                            item[f]['syql'] = formulas[f].value;
                            item[f]['id'] = formulas[f].formulasId;
                            listFormulasUpdate.push(item);
                        } else {
                            let item = {};
                            item[f] = {};
                            item[f]['formulas'] = formulas[f].value;
                            item[f]['objectType'] = 'field';
                            item[f]['objectIdentifier'] =
                                control.properties.hasOwnProperty('name')
                                    ? control.properties.name.value
                                    : control.name;
                            item[f]['context'] = this.sDocumentProp.name.value;
                            listFormulas.push(item);
                        }
                    }
                }
                if (Object.keys(listFormulas).length > 0) {
                    listControlFormulas['insert'][controlId] = listFormulas;
                }
                if (Object.keys(listFormulasUpdate).length > 0) {
                    listControlFormulas['update'][controlId] =
                        listFormulasUpdate;
                }
            }
            return listControlFormulas;
        },

        minimizeControlEL(allControl) {
            var allInputControl = $(
                '#document-editor-' + this.keyInstance + '_ifr',
            )
                .contents()
                .find('body')
                .find('.s-control');
            let allId = [];
            let allUserControl = { user: [] };
            $.each(allInputControl, function (k, v) {
                let id = $(v).attr('id');
                allId.push(id);
            });
            for (let controlId in allControl) {
                let isCheck = false;
                if (allId.indexOf(controlId) === -1) {
                    delete allControl[controlId];
                    isCheck = true;
                } else {
                    if (allControl[controlId].type == 'table') {
                        if (allId.indexOf(controlId) === -1) {
                            for (let childControlId in allControl[controlId]
                                .listFields) {
                                let childControl =
                                    allControl[controlId].listFields[
                                        childControlId
                                    ];
                                if (allId.indexOf(childControlId) === -1) {
                                    delete allControl[controlId].listFields[
                                        childControlId
                                    ];
                                    isCheck = true;
                                }
                                if (!isCheck && childControl.type == 'user') {
                                    allUserControl['user'].push(
                                        childControl.properties.name.value,
                                    );
                                }
                            }
                        }
                    }
                }
                if (!isCheck && allControl[controlId].type == 'user') {
                    allUserControl['user'].push(
                        allControl[controlId].properties.name.value,
                    );
                }
            }
            return {
                minimizeControl: allControl,
                userControls: allUserControl,
            };
        },

        // hàm kiểm tra xem trong công thức có trỏ đến control ko tồn tại hay ko
        validateFormulasInControl(control, listControlName) {
            // check control Name trong cong thức
            for (let f in control.formulas) {
                if (control.formulas[f].value != '') {
                    let formula = control.formulas[f].value;
                    let controlName = formula.match(/(?<=f.)(\w+)/g);
                    if (controlName != null)
                        for (let i = 0; i < controlName.length; i++) {
                            if (
                                listControlName.indexOf(controlName[i]) === -1
                            ) {
                                let message =
                                    this.$t('v2.doc.noControlExist') +
                                    controlName[i] +
                                    this.$t('v2.doc.inFormula') +
                                    f +
                                    this.$t('v2.doc.ofControl') +
                                    control.properties.name.value;
                                if (
                                    this.listMessageErr.indexOf(message) === -1
                                ) {
                                    this.listMessageErr.push(message);
                                }
                            }
                        }
                }
            }
        },
        // hàm xử lí thêm các cột vào trong control table khi lưu ở tablesetting
        ConfigColumnTablePrint(listRowData) {
            let elements = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.s-control-table.on-selected');
            let thead = elements.find('thead th');
            for (let index = 0; index < thead.length; index++) {
                let th = thead[index];
                $(th).css({ width: listRowData[index].colWidth });
                $(th).attr('data-mce-style', $(th).attr('style'));
            }
        },

        //hoangnd: hàm mở modal tablesetting của control table
        showPrintConfigTable(e) {
            let elements = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.on-selected')
                .closest('.s-control-table');
            if (elements.is('.s-control-table')) {
                let thead = elements.find('thead tr th');
                let tbody = elements.find('tbody tr td');
                let table = elements.hasClass('s-control-table')
                    ? elements
                    : elements.parent();
                let tableId = table.attr('id');
                let listData = [];
                if ($(tbody[0].innerHTML).length > 0) {
                    for (let i = 0; i < thead.length; i++) {
                        var width =
                            Math.ceil(
                                (100 * parseFloat($(thead[i]).css('width'))) /
                                    parseFloat(
                                        $(thead[i]).parent().css('width'),
                                    ),
                            ) + '%';
                        let row = {
                            title: $(thead[i]).text(),
                            colWidth: width,
                        };
                        listData.push(row);
                    }
                }
                this.$refs.printTableConfig.showDialog();
                this.$refs.printTableConfig.setListRow(listData);
            }
        },

        // hàm add các thuộc tính và formulas của control vào danh sách các control trong doc được lưu trong state
        addToAllControlInDoc(controlId, control) {
            this.$store.commit('document/addControl', {
                id: controlId,
                props: control,
                instance: this.keyInstance,
            });
        },
        // hàm add các thuộc tính và formulas của control vào danh sách các control trong table được lưu trong state
        addToAllControlInTable(controlId, control, tableId) {
            this.$store.commit('document/addControlToTable', {
                id: controlId,
                props: control,
                tableId: tableId,
                instance: this.keyInstance,
            });
        },
        // set config cho phần sidebar phải các thuộc tính control đang được click
        selectControl(properties, formulas, id) {
            this.$store.commit('document/addCurrentControl', {
                properties: properties,
                formulas: formulas,
                id: id,
                instance: this.keyInstance,
            });
        },
        resetSelectControl() {
            this.$store.commit('document/resetCurrentControl', {
                instance: this.keyInstance,
            });
        },
        hideAutocompletaControl() {
            $('.list-control-autocomplete').css({
                display: 'none',
            });
        },
        //hoangnd : hàm được gọi từ AutoCompleteControl component để insert 1 control
        insertControl(type) {
            this.hideAutocompletaControl();
            let contentNode = $(this.editorCore.selection.getNode())[0]
                .innerHTML;
            let control = GetControlProps(type);
            var checkDiv = $(control.html);
            var inputid = 's-control-id-' + Date.now();
            checkDiv.attr('id', inputid);
            if (checkDiv.attr('s-control-type') != 'table') {
                checkDiv.attr('contenteditable', false);
            }

            let newContent = contentNode.replace(
                /\/{2}/,
                checkDiv[0].outerHTML,
            );

            $(this.editorCore.selection.getNode()).html(
                newContent + '&nbsp;<span id = "caret_pose_holder"> </ span>',
            );
            let table = $(this.editorCore.selection.getNode()).closest(
                '.s-control-table',
            );
            this.selectControl(control.properties, control.formulas, inputid);
            let ed = this.editorCore;
            ed.focus();
            ed.selection.select(ed.dom.select('#caret_pose_holder')[0]);
            ed.selection.collapse(0);
            $(this.editorCore.selection.getNode())
                .find('#caret_pose_holder')
                .remove();
            if (table.length > 0 && inputid != table.attr('id')) {
                let tableId = table.attr('id');
                this.addToAllControlInTable(
                    inputid,
                    {
                        properties: control.properties,
                        formulas: control.formulas,
                        type: type,
                    },
                    tableId,
                );
            } else {
                this.addToAllControlInDoc(inputid, {
                    properties: control.properties,
                    formulas: control.formulas,
                    type: type,
                });
            }
        },
        // hoangnd: hàm nhận sự kiện keyup của editor
        // 191: / để thêm control

        keyHandler(event) {
            let thisCpn = this;
            if (event.keyCode == 191) {
                var thisKeypressTime = new Date();
                if (thisKeypressTime - this.lastKeypressTime <= this.delta) {
                    var scroll_top = $(
                        '#document-editor-' + thisCpn.keyInstance + '_ifr',
                    )
                        .contents()
                        .scrollTop();
                    var nodePosition = $(
                        thisCpn.editorCore.selection.getNode(),
                    ).position();
                    var off = $(
                        thisCpn.editorCore.selection.getNode(),
                    ).offset();
                    var top = nodePosition.top;
                    var left = nodePosition.left;
                    var width_toolbox = $(
                        '.sym-document__side-bar-left',
                    ).width();
                    let marginDoc = $('.tox-sidebar-wrap')
                        .css('marginLeft')
                        .replace('px', '');
                    $('.list-control-autocomplete').css({
                        top: top + 120 - scroll_top,
                        left: left + width_toolbox + parseInt(marginDoc),
                    });
                    setTimeout(function () {
                        $('.list-control-autocomplete').css({
                            display: 'block',
                        });
                    }, 10);
                    setTimeout(() => {
                        $(
                            '.list-control-autocomplete .tf-search-control',
                        ).focus();
                    }, 100);

                    thisKeypressTime = 0;
                }
                this.lastKeypressTime = thisKeypressTime;
            }
        },

        //su kiện click vào editor
        detectClickEvent(event) {
            if (this.editorStore.currentSelectedControl.id != '') {
                this.$refs.sidebarRight.hideDragPanel();
            }
            if ($(event.target).is('.s-control'))
                this.setSelectedControlProp(
                    event,
                    $(event.target),
                    $('#document-editor-' + this.keyInstance + '_ifr').get(0)
                        .contentWindow,
                );
            else if ($(event.target).closest('.s-control').length > 0) {
                this.setSelectedControlProp(
                    event,
                    $(event.target).closest('.s-control'),
                    $('#document-editor-' + this.keyInstance + '_ifr').get(0)
                        .contentWindow,
                );
            }

            // kiểm tra nếu click ngoài khung autocomplete control thì đóng lại
            if (
                event.target.id != 'list-control-autocomplete' &&
                $(event.target).parents('#list-control-autocomplete').length ==
                    0
            ) {
                this.hideAutocompletaControl();
            }
        },
        // hàm click ra ngoài editor thì cập nhật lại dữ liệu của store
        detectBlurEditorEvent(event) {
            this.saveContentToLocalStorage();
            let allControlEl = $(
                '#document-editor-' + this.keyInstance + '_ifr',
            )
                .contents()
                .find('.s-control');
            let listId = [];
            $.each(allControlEl, function (k, v) {
                let id = $(v).attr('id');
                listId.push(id);
            });

            this.$store.commit('document/minimizeControl', {
                allId: listId,
                instance: this.keyInstance,
            });
        },

        // resize been phair editor thi set lại chiều rộng cho size bar right
        resizeEditor(e) {
            let documentW = $(document).width();
            $('.sym-document__side-bar-right').css({
                width:
                    documentW -
                    $('.v-navigation-drawer').width() -
                    $('.sym-document__side-bar-left').width() -
                    $('.sym-document-editor').width() +
                    'px',
            });
        },
        resizeEditorStart(e) {
            var $div = $('<div />').appendTo('.sym-document-body');
            $div.attr('id', 'bg-over-editor');
            $div.css({
                background: 'transparent',
                'z-index': '1000000',
                position: 'absolute',
                height: '100%',
                width: '100%',
                top: '0',
            });
        },
        resizeEditorEnd(e) {
            $('#bg-over-editor').remove();
        },
        setContentForDocumentV1() {
            let thisCpn = this;
            $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.bkerp-input')
                .addClass('s-control')
                .removeClass('bkerp-input');
            $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.mce-item-table')
                .css({ width: '100%' })
                .attr('data-mce-style', 'width:100%');
            $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('head link')
                .remove();
            $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('body link')
                .remove();
            $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('body meta')
                .remove();
            $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('body style')
                .remove();
            let allControl = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.s-control:not(.bkerp-input-table .s-control)');
            console.log('safashd', allControl);
            $.each(allControl, function (item, value) {
                let controlProps = $(value).attr('data-property');
                controlProps = controlProps.replace(/\"\[/gm, '[');
                controlProps = controlProps.replace(/\]\"/gm, ']');
                let type = $(value).attr('bkerp-type');
                let style = $(value).attr('style');
                if (type == 'text') type = 'textInput';
                if (type == 'persent') type = 'percent';
                let controlV2 = GetControlProps(type);
                let controlEl = $(controlV2.html);
                var inputid = 's-control-id-' + Date.now();
                controlEl.attr('id', inputid).attr('style', style);
                controlEl.replaceAll($(value));
                try {
                    controlProps = JSON.parse(controlProps);
                    let controlProp = {};
                    let controlFormulas = {};
                    console.log('safashd', controlProps);
                    $.each(controlProps, function (k, v) {
                        if (
                            mappingOldVersionControlProps[k] != undefined &&
                            controlV2.properties[
                                mappingOldVersionControlProps[k]
                            ] != undefined
                        ) {
                            controlV2.properties[
                                mappingOldVersionControlProps[k]
                            ].value = v;
                        }
                        if (
                            mappingOldVersionControlFormulas[k] != undefined &&
                            controlV2.formulas[
                                mappingOldVersionControlProps[k]
                            ] != undefined
                        ) {
                            controlV2.formulas[
                                mappingOldVersionControlProps[k]
                            ].value = v;
                        }
                    });
                    thisCpn.addToAllControlInDoc(inputid, {
                        properties: controlV2.properties,
                        formulas: controlV2.formulas,
                        type: type,
                    });
                } catch (error) {}
                if (type == 'table') {
                    let tableId = inputid;
                    let tableEl = controlEl;

                    let bodyTable = $(value).find('table');
                    // tableEl.find('table thead').remove();
                    tableEl.find('thead').remove();
                    tableEl.find('tbody').remove();
                    tableEl.append(bodyTable.find('thead')[0].outerHTML);
                    tableEl.append(bodyTable.find('tbody')[0].outerHTML);
                    tableEl.find('thead').attr('contenteditable', true);
                    let allControlInTable = tableEl.find('.s-control');
                    console.log(allControlInTable);

                    $.each(allControlInTable, function (item, value) {
                        let childControlProps = $(value).attr('data-property');
                        let type = $(value).attr('bkerp-type');
                        let style = $(value).attr('style');
                        if (type == 'text') type = 'textInput';
                        if (type == 'persent') type = 'percent';
                        if (type == 'file-upload') type = 'fileUpload';
                        console.log(type);

                        let childControlV2 = GetControlProps(type);
                        let controlEl = $(childControlV2.html);
                        var inputid = 's-control-id-' + Date.now();
                        controlEl.attr('id', inputid).attr('style', style);
                        controlEl.replaceAll($(value));
                        try {
                            childControlProps = JSON.parse(childControlProps);
                            let controlProp = {};
                            let controlFormulas = {};
                            $.each(childControlProps, function (k, v) {
                                if (
                                    mappingOldVersionControlProps[k] !=
                                        undefined &&
                                    childControlV2.properties[
                                        mappingOldVersionControlProps[k]
                                    ] != undefined
                                ) {
                                    childControlV2.properties[
                                        mappingOldVersionControlProps[k]
                                    ].value = v;
                                }
                                if (
                                    mappingOldVersionControlFormulas[k] !=
                                        undefined &&
                                    childControlV2.formulas[
                                        mappingOldVersionControlProps[k]
                                    ] != undefined
                                ) {
                                    childControlV2.formulas[
                                        mappingOldVersionControlProps[k]
                                    ].value = v;
                                }
                            });
                            thisCpn.addToAllControlInTable(
                                inputid,
                                {
                                    properties: childControlV2.properties,
                                    formulas: childControlV2.formulas,
                                    type: type,
                                },
                                tableId,
                            );
                        } catch (error) {
                            console.log(error);
                        }
                    });
                }
            });
        },
        // hàm gọi request lấy thông tin của document khi vào edit doc
        getContentDocument() {
            let thisCpn = this;
            if (this.documentId != 0) {
                documentApi
                    .detailDocument(this.documentId)
                    .then((res) => {
                        if (res.status == 200) {
                            if (this.$getRouteName() == 'editDocument') {
                                thisCpn.setDocumentProperties(
                                    res.data.document,
                                );
                            }
                            let content = res.data.document.content;
                            thisCpn.editorCore.setContent(content);
                            $(
                                '#document-editor-' +
                                    thisCpn.keyInstance +
                                    '_ifr',
                            )
                                .contents()
                                .find('body select')
                                .each(function (e) {
                                    let id = $(this).attr('id');
                                    $(this).replaceWith(
                                        '<input class="s-control s-control-select" s-control-type="select" type="text" title="Select" readonly="readonly" id="' +
                                            id +
                                            '"/>',
                                    );
                                });
                            if (res.data.document.version == 1) {
                                thisCpn.setContentForDocumentV1();
                            } else {
                                let fields = res.data.fields;
                                thisCpn.setDataForPropsControl(fields);
                            }
                            thisCpn.wrapTableElement();
                        }
                    })
                    .catch((err) => {
                        console.log('error from detail document api!!!', err);
                    })
                    .finally(() => {});
            }
        },
        // wrap div cho table truong hợp trước đây chưa có scroll
        wrapTableElement() {
            let listTable = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.s-control-table');
            if (
                listTable.length > 0 &&
                !listTable.parent().is('.wrap-s-control-table')
            ) {
                listTable.wrap(
                    '<div class="wrap-s-control-table" style="overflow:auto;"></div>',
                );
            }
        },

        setDocumentProperties(documentProp) {
            this.$refs.saveFormPanel.setPropsOfDoc(documentProp);
        },
        //hoangnd: hàm set các giá trị của thuộc tính và formulas vào từng contrl trong doc lúc load dữ liệu và đưa vào state
        setDataForPropsControl(fields) {
            for (let controlId in fields) {
                if (!fields[controlId].hasOwnProperty('type')) {
                    continue;
                }
                let control = GetControlProps(fields[controlId].type);
                let properties = control.properties;
                let formulas = control.formulas;
                let type = fields[controlId].type;
                $.each(properties, function (k, v) {
                    if (properties[k].type == 'checkbox') {
                        properties[k].value =
                            fields[controlId]['properties'][k] == 0 ||
                            fields[controlId]['properties'][k] == '0' ||
                            fields[controlId]['properties'][k] == ''
                                ? false
                                : true;
                    } else {
                        properties[k].value =
                            fields[controlId]['properties'][k];
                    }
                    if (k == 'name') {
                        properties[k].oldName = properties[k].value;
                    }
                });
                if (fields[controlId]['formulas'] != false) {
                    $.each(formulas, function (k, v) {
                        if (
                            fields[controlId]['formulas'][k] !== '' &&
                            fields[controlId]['formulas'][k] !== undefined
                        ) {
                            formulas[k].value = Object.values(
                                fields[controlId]['formulas'][k],
                            )[0];
                            formulas[k].formulasId = Object.keys(
                                fields[controlId]['formulas'][k],
                            )[0];
                        }
                    });
                }
                if (fields[controlId].type != 'table') {
                    this.addToAllControlInDoc(controlId, {
                        properties: properties,
                        formulas: formulas,
                        type: fields[controlId].type,
                    });
                } else {
                    let listField = fields[controlId].listFields;
                    let listChildField = {};
                    for (let childFieldId in listField) {
                        let childControl = GetControlProps(
                            listField[childFieldId].type,
                        );
                        let childProperties = childControl.properties;
                        let childFormulas = childControl.formulas;
                        let childType = listField[childFieldId].type;

                        $.each(childProperties, function (k, v) {
                            if (childProperties[k].type == 'checkbox') {
                                childProperties[k].value =
                                    listField[childFieldId]['properties'][k] ==
                                        0 ||
                                    listField[childFieldId]['properties'][k] ==
                                        '0' ||
                                    listField[childFieldId]['properties'][k] ==
                                        ''
                                        ? false
                                        : true;
                            } else {
                                childProperties[k].value =
                                    listField[childFieldId]['properties'][k];
                            }
                            if (k == 'name') {
                                childProperties[k].oldName =
                                    childProperties[k].value;
                            }
                        });
                        if (listField[childFieldId]['formulas'] != false) {
                            $.each(childFormulas, function (k, v) {
                                if (
                                    listField[childFieldId]['formulas'][k] != ''
                                ) {
                                    if (
                                        listField[childFieldId]['formulas'][
                                            k
                                        ] != undefined
                                    )
                                        childFormulas[k].value = Object.values(
                                            listField[childFieldId]['formulas'][
                                                k
                                            ],
                                        )[0];
                                    childFormulas[k].formulasId = Object.keys(
                                        listField[childFieldId]['formulas'][k],
                                    )[0];
                                }
                            });
                        }
                        listChildField[childFieldId] = {
                            properties: childProperties,
                            formulas: childFormulas,
                            type: childType,
                        };
                    }
                    this.addToAllControlInDoc(controlId, {
                        properties: properties,
                        formulas: formulas,
                        type: fields[controlId].type,
                        listFields: listChildField,
                    });
                }
            }
        },
        // sự kiện xảy ra khi khởi tạo xong editor , sự kiện do tinymce cung cấp
        initEditor() {
            let thisCpn = this;
            if (this.documentId != 0 && this.documentId != undefined)
                // trường họp edit doc thì gọi api lấy dữ liệu
                thisCpn.getContentDocument();
            var currentElement,
                currentElementChangeFlag,
                elementRectangle,
                countdown,
                dragoverqueue_processtimer;
            // object xử lí các vấn đề với kéo thả control vào document
            var DragDropFunctions = {
                dragoverqueue: [],
                GetMouseBearingsPercentage: function (
                    $element,
                    elementRect,
                    mousePos,
                ) {
                    if (!elementRect)
                        elementRect = $element.get(0).getBoundingClientRect();
                    var mousePosPercent_X =
                        ((mousePos.x - elementRect.left) /
                            (elementRect.right - elementRect.left)) *
                        100;
                    var mousePosPercent_Y =
                        ((mousePos.y - elementRect.top) /
                            (elementRect.bottom - elementRect.top)) *
                        100;

                    return { x: mousePosPercent_X, y: mousePosPercent_Y };
                },
                OrchestrateDragDrop: function (
                    $element,
                    elementRect,
                    mousePos,
                ) {
                    //If no element is hovered or element hovered is the placeholder -> not valid -> return false;
                    if (
                        !$element ||
                        $element.length == 0 ||
                        !elementRect ||
                        !mousePos
                    )
                        return false;

                    if ($element.is('html')) $element = $element.find('body');
                    //Top and Bottom Area Percentage to trigger different case. [5% of top and bottom area gets reserved for this]
                    var breakPointNumber = { x: 5, y: 5 };

                    var mousePercents = this.GetMouseBearingsPercentage(
                        $element,
                        elementRect,
                        mousePos,
                    );
                    if (
                        mousePercents.x > breakPointNumber.x &&
                        mousePercents.x < 100 - breakPointNumber.x &&
                        mousePercents.y > breakPointNumber.y &&
                        mousePercents.y < 100 - breakPointNumber.y
                    ) {
                        //Case 1 -
                        let $tempelement = $element.clone();
                        $tempelement.find('.drop-marker').remove();
                        if (
                            $tempelement.html() == '' &&
                            !this.checkVoidElement($tempelement)
                        ) {
                            if (mousePercents.y < 90)
                                return this.PlaceInside($element);
                        } else if ($tempelement.children().length == 0) {
                            //text element detected
                            //console.log("Text Element");
                            this.DecideBeforeAfter($element, mousePercents);
                        } else if ($tempelement.children().length == 1) {
                            //only 1 child element detected
                            //console.log("1 Child Element");
                            this.DecideBeforeAfter(
                                $element
                                    .children(
                                        ':not(.drop-marker,[data-dragcontext-marker])',
                                    )
                                    .first(),
                                mousePercents,
                            );
                        } else {
                            var positionAndElement = this.findNearestElement(
                                $element,
                                mousePos.x,
                                mousePos.y,
                            );
                            this.DecideBeforeAfter(
                                positionAndElement.el,
                                mousePercents,
                                mousePos,
                            );
                            //more than 1 child element present
                            //console.log("More than 1 child detected");
                        }
                    } else if (
                        mousePercents.x <= breakPointNumber.x ||
                        mousePercents.y <= breakPointNumber.y
                    ) {
                        var validElement = null;
                        if (mousePercents.y <= mousePercents.x)
                            validElement = this.FindValidParent(
                                $element,
                                'top',
                            );
                        else
                            validElement = this.FindValidParent(
                                $element,
                                'left',
                            );

                        if (validElement.is('body,html'))
                            validElement = $(
                                '#document-editor-' +
                                    thisCpn.keyInstance +
                                    '_ifr',
                            )
                                .contents()
                                .find('body')
                                .children(
                                    ':not(.drop-marker,[data-dragcontext-marker])',
                                )
                                .first();
                        this.DecideBeforeAfter(
                            validElement,
                            mousePercents,
                            mousePos,
                        );
                    } else if (
                        mousePercents.x >= 100 - breakPointNumber.x ||
                        mousePercents.y >= 100 - breakPointNumber.y
                    ) {
                        var validElement = null;
                        if (mousePercents.y >= mousePercents.x)
                            validElement = this.FindValidParent(
                                $element,
                                'bottom',
                            );
                        else
                            validElement = this.FindValidParent(
                                $element,
                                'right',
                            );

                        if (validElement.is('body,html'))
                            validElement = $(
                                '#document-editor-' +
                                    thisCpn.keyInstance +
                                    '_ifr',
                            )
                                .contents()
                                .find('body')
                                .children(
                                    ':not(.drop-marker,[data-dragcontext-marker])',
                                )
                                .last();
                        this.DecideBeforeAfter(
                            validElement,
                            mousePercents,
                            mousePos,
                        );
                    }
                },
                DecideBeforeAfter: function (
                    $targetElement,
                    mousePercents,
                    mousePos,
                ) {
                    if (mousePos) {
                        mousePercents = this.GetMouseBearingsPercentage(
                            $targetElement,
                            null,
                            mousePos,
                        );
                    }

                    /*if(!mousePercents)
                    {
                    mousePercents = this.GetMouseBearingsPercentage($targetElement, $targetElement.get(0).getBoundingClientRect(), mousePos);
                    } */

                    let $orientation =
                        $targetElement.css('display') == 'inline' ||
                        $targetElement.css('display') == 'inline-block';
                    if ($targetElement.is('br')) $orientation = false;

                    if ($orientation) {
                        if (mousePercents.x < 50) {
                            return this.PlaceBefore($targetElement);
                        } else {
                            return this.PlaceAfter($targetElement);
                        }
                    } else {
                        if (mousePercents.y < 50) {
                            return this.PlaceBefore($targetElement);
                        } else {
                            return this.PlaceAfter($targetElement);
                        }
                    }
                },
                checkVoidElement: function ($element) {
                    var voidelements = [
                        'i',
                        'area',
                        'base',
                        'br',
                        'col',
                        'command',
                        'embed',
                        'hr',
                        'img',
                        'input',
                        'keygen',
                        'link',
                        'meta',
                        'param',
                        'video',
                        'iframe',
                        'source',
                        'track',
                        'wbr',
                    ];
                    var selector = voidelements.join(',');
                    if ($element.is(selector)) return true;
                    else return false;
                },
                calculateDistance: function (elementData, mouseX, mouseY) {
                    return Math.sqrt(
                        Math.pow(elementData.x - mouseX, 2) +
                            Math.pow(elementData.y - mouseY, 2),
                    );
                },
                FindValidParent: function ($element, direction) {
                    switch (direction) {
                        case 'left':
                            while (true) {
                                var elementRect = $element
                                    .get(0)
                                    .getBoundingClientRect();
                                var $tempElement = $element.parent();
                                var tempelementRect = $tempElement
                                    .get(0)
                                    .getBoundingClientRect();
                                if ($element.is('body')) return $element;
                                if (
                                    Math.abs(
                                        tempelementRect.left - elementRect.left,
                                    ) == 0
                                )
                                    $element = $element.parent();
                                else return $element;
                            }
                            break;
                        case 'right':
                            while (true) {
                                var elementRect = $element
                                    .get(0)
                                    .getBoundingClientRect();
                                var $tempElement = $element.parent();
                                var tempelementRect = $tempElement
                                    .get(0)
                                    .getBoundingClientRect();
                                if ($element.is('body')) return $element;
                                if (
                                    Math.abs(
                                        tempelementRect.right -
                                            elementRect.right,
                                    ) == 0
                                )
                                    $element = $element.parent();
                                else return $element;
                            }
                            break;
                        case 'top':
                            while (true) {
                                var elementRect = $element
                                    .get(0)
                                    .getBoundingClientRect();
                                var $tempElement = $element.parent();
                                var tempelementRect = $tempElement
                                    .get(0)
                                    .getBoundingClientRect();
                                if ($element.is('body')) return $element;
                                if (
                                    Math.abs(
                                        tempelementRect.top - elementRect.top,
                                    ) == 0
                                )
                                    $element = $element.parent();
                                else return $element;
                            }
                            break;
                        case 'bottom':
                            while (true) {
                                var elementRect = $element
                                    .get(0)
                                    .getBoundingClientRect();
                                var $tempElement = $element.parent();
                                var tempelementRect = $tempElement
                                    .get(0)
                                    .getBoundingClientRect();
                                if ($element.is('body')) return $element;
                                if (
                                    Math.abs(
                                        tempelementRect.bottom -
                                            elementRect.bottom,
                                    ) == 0
                                )
                                    $element = $element.parent();
                                else return $element;
                            }
                            break;
                    }
                },
                addPlaceHolder: function ($element, position, placeholder) {
                    if (!placeholder) placeholder = this.getPlaceHolder();
                    this.removePlaceholder();
                    switch (position) {
                        case 'before':
                            placeholder
                                .find('.message')
                                .html($element.parent().data('sh-dnd-error'));
                            $element.before(placeholder);
                            // console.log($element);
                            // console.log("BEFORE");
                            this.AddContainerContext($element, 'sibling');
                            break;
                        case 'after':
                            placeholder
                                .find('.message')
                                .html($element.parent().data('sh-dnd-error'));
                            $element.after(placeholder);
                            // console.log($element);
                            // console.log("AFTER");
                            this.AddContainerContext($element, 'sibling');
                            break;
                        case 'inside-prepend':
                            placeholder
                                .find('.message')
                                .html($element.data('sh-dnd-error'));
                            $element.prepend(placeholder);
                            this.AddContainerContext($element, 'inside');
                            // console.log($element);
                            // console.log("PREPEND");
                            break;
                        case 'inside-append':
                            placeholder
                                .find('.message')
                                .html($element.data('sh-dnd-error'));
                            $element.append(placeholder);
                            this.AddContainerContext($element, 'inside');
                            // console.log($element);
                            // console.log("APPEND");
                            break;
                    }
                },
                removePlaceholder: function () {
                    $('#document-editor-' + thisCpn.keyInstance + '_ifr')
                        .contents()
                        .find('.drop-marker')
                        .remove();
                },
                getPlaceHolder: function () {
                    return $("<li class='drop-marker'></li>");
                },
                PlaceInside: function ($element) {
                    var placeholder = this.getPlaceHolder();
                    placeholder
                        .addClass('horizontal')
                        .css('width', $element.width() + 'px');
                    this.addPlaceHolder($element, 'inside-append', placeholder);
                },
                PlaceBefore: function ($element) {
                    var placeholder = this.getPlaceHolder();
                    var inlinePlaceholder =
                        $element.css('display') == 'inline' ||
                        $element.css('display') == 'inline-block';
                    if ($element.is('br')) {
                        inlinePlaceholder = false;
                    } else if ($element.is('td,th')) {
                        placeholder
                            .addClass('horizontal')
                            .css('width', $element.width() + 'px');
                        return this.addPlaceHolder(
                            $element,
                            'inside-prepend',
                            placeholder,
                        );
                    }
                    if (inlinePlaceholder)
                        placeholder
                            .addClass('vertical')
                            .css('height', $element.innerHeight() + 'px');
                    else
                        placeholder
                            .addClass('horizontal')
                            .css('width', $element.parent().width() + 'px');
                    this.addPlaceHolder($element, 'before', placeholder);
                },

                PlaceAfter: function ($element) {
                    var placeholder = this.getPlaceHolder();
                    var inlinePlaceholder =
                        $element.css('display') == 'inline' ||
                        $element.css('display') == 'inline-block';
                    if ($element.is('br')) {
                        inlinePlaceholder = false;
                    } else if ($element.is('td,th')) {
                        placeholder
                            .addClass('horizontal')
                            .css('width', $element.width() + 'px');
                        return this.addPlaceHolder(
                            $element,
                            'inside-append',
                            placeholder,
                        );
                    }
                    if (inlinePlaceholder)
                        placeholder
                            .addClass('vertical')
                            .css('height', $element.innerHeight() + 'px');
                    else
                        placeholder
                            .addClass('horizontal')
                            .css('width', $element.parent().width() + 'px');
                    this.addPlaceHolder($element, 'after', placeholder);
                },
                findNearestElement: function ($container, clientX, clientY) {
                    var _this = this;
                    var previousElData = null;
                    var childElement = $container.children(
                        ':not(.drop-marker,[data-dragcontext-marker])',
                    );
                    if (childElement.length > 0) {
                        childElement.each(function () {
                            if ($(this).is('.drop-marker')) return;

                            var offset = $(this).get(0).getBoundingClientRect();
                            var distance = 0;
                            var distance1,
                                distance2 = null;
                            var position = '';
                            var xPosition1 = offset.left;
                            var xPosition2 = offset.right;
                            var yPosition1 = offset.top;
                            var yPosition2 = offset.bottom;
                            var corner1 = null;
                            var corner2 = null;

                            //Parellel to Yaxis and intersecting with x axis
                            if (clientY > yPosition1 && clientY < yPosition2) {
                                if (
                                    clientX < xPosition1 &&
                                    clientY < xPosition2
                                ) {
                                    corner1 = {
                                        x: xPosition1,
                                        y: clientY,
                                        position: 'before',
                                    };
                                } else {
                                    corner1 = {
                                        x: xPosition2,
                                        y: clientY,
                                        position: 'after',
                                    };
                                }
                            }
                            //Parellel to xAxis and intersecting with Y axis
                            else if (
                                clientX > xPosition1 &&
                                clientX < xPosition2
                            ) {
                                if (
                                    clientY < yPosition1 &&
                                    clientY < yPosition2
                                ) {
                                    corner1 = {
                                        x: clientX,
                                        y: yPosition1,
                                        position: 'before',
                                    };
                                } else {
                                    corner1 = {
                                        x: clientX,
                                        y: yPosition2,
                                        position: 'after',
                                    };
                                }
                            } else {
                                //runs if no element found!
                                if (
                                    clientX < xPosition1 &&
                                    clientX < xPosition2
                                ) {
                                    corner1 = {
                                        x: xPosition1,
                                        y: yPosition1,
                                        position: 'before',
                                    }; //left top
                                    corner2 = {
                                        x: xPosition1,
                                        y: yPosition2,
                                        position: 'after',
                                    }; //left bottom
                                } else if (
                                    clientX > xPosition1 &&
                                    clientX > xPosition2
                                ) {
                                    //console.log('I m on the right of the element');
                                    corner1 = {
                                        x: xPosition2,
                                        y: yPosition1,
                                        position: 'before',
                                    }; //Right top
                                    corner2 = {
                                        x: xPosition2,
                                        y: yPosition2,
                                        position: 'after',
                                    }; //Right Bottom
                                } else if (
                                    clientY < yPosition1 &&
                                    clientY < yPosition2
                                ) {
                                    // console.log('I m on the top of the element');
                                    corner1 = {
                                        x: xPosition1,
                                        y: yPosition1,
                                        position: 'before',
                                    }; //Top Left
                                    corner2 = {
                                        x: xPosition2,
                                        y: yPosition1,
                                        position: 'after',
                                    }; //Top Right
                                } else if (
                                    clientY > yPosition1 &&
                                    clientY > yPosition2
                                ) {
                                    // console.log('I m on the bottom of the element');
                                    corner1 = {
                                        x: xPosition1,
                                        y: yPosition2,
                                        position: 'before',
                                    }; //Left bottom
                                    corner2 = {
                                        x: xPosition2,
                                        y: yPosition2,
                                        position: 'after',
                                    }; //Right Bottom
                                }
                            }

                            distance1 = _this.calculateDistance(
                                corner1,
                                clientX,
                                clientY,
                            );

                            if (corner2 !== null)
                                distance2 = _this.calculateDistance(
                                    corner2,
                                    clientX,
                                    clientY,
                                );

                            if (distance1 < distance2 || distance2 === null) {
                                distance = distance1;
                                position = corner1.position;
                            } else {
                                distance = distance2;
                                position = corner2.position;
                            }

                            if (previousElData !== null) {
                                if (previousElData.distance < distance) {
                                    return true; //continue statement
                                }
                            }
                            previousElData = {
                                el: this,
                                distance: distance,
                                xPosition1: xPosition1,
                                xPosition2: xPosition2,
                                yPosition1: yPosition1,
                                yPosition2: yPosition2,
                                position: position,
                            };
                        });
                        if (previousElData !== null) {
                            var position = previousElData.position;
                            return {
                                el: $(previousElData.el),
                                position: position,
                            };
                        } else {
                            return false;
                        }
                    }
                },
                AddEntryToDragOverQueue: function (
                    $element,
                    elementRect,
                    mousePos,
                ) {
                    var newEvent = [$element, elementRect, mousePos];
                    this.dragoverqueue.push(newEvent);
                },
                ProcessDragOverQueue: function (
                    $element,
                    elementRect,
                    mousePos,
                ) {
                    var processing = this.dragoverqueue.pop();
                    this.dragoverqueue = [];
                    if (processing && processing.length == 3) {
                        var $el = processing[0];
                        var $elRect = processing[1];
                        var mousePos = processing[2];
                        this.OrchestrateDragDrop($el, $elRect, mousePos);
                    }
                },
                GetContextMarker: function () {
                    let $contextMarker = $(
                        '<div data-dragcontext-marker><span data-dragcontext-marker-text></span></div>',
                    );
                    return $contextMarker;
                },
                AddContainerContext: function ($element, position) {
                    let $contextMarker = this.GetContextMarker();
                    this.ClearContainerContext();
                    if ($element.is('html,body')) {
                        position = 'inside';
                        $element = $(
                            '#document-editor-' + thisCpn.keyInstance + '_ifr',
                        )
                            .contents()
                            .find('body');
                    }
                    switch (position) {
                        case 'inside':
                            this.PositionContextMarker(
                                $contextMarker,
                                $element,
                            );
                            if ($element.hasClass('stackhive-nodrop-zone'))
                                $contextMarker.addClass('invalid');
                            var name = this.getElementName($element);
                            $contextMarker
                                .find('[data-dragcontext-marker-text]')
                                .html(name);
                            if (
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr',
                                )
                                    .contents()
                                    .find('body [data-sh-parent-marker]')
                                    .length != 0
                            )
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr',
                                )
                                    .contents()
                                    .find('body [data-sh-parent-marker]')
                                    .first()
                                    .before($contextMarker);
                            else
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr',
                                )
                                    .contents()
                                    .find('body')
                                    .append($contextMarker);
                            break;
                        case 'sibling':
                            this.PositionContextMarker(
                                $contextMarker,
                                $element.parent(),
                            );
                            if (
                                $element
                                    .parent()
                                    .hasClass('stackhive-nodrop-zone')
                            )
                                $contextMarker.addClass('invalid');
                            var name = this.getElementName($element.parent());
                            $contextMarker
                                .find('[data-dragcontext-marker-text]')
                                .html(name);
                            $contextMarker.attr(
                                'data-dragcontext-marker',
                                name.toLowerCase(),
                            );
                            if (
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr',
                                )
                                    .contents()
                                    .find('body [data-sh-parent-marker]')
                                    .length != 0
                            )
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr',
                                )
                                    .contents()
                                    .find('body [data-sh-parent-marker]')
                                    .first()
                                    .before($contextMarker);
                            else
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr',
                                )
                                    .contents()
                                    .find('body')
                                    .append($contextMarker);
                            break;
                    }
                },
                PositionContextMarker: function ($contextMarker, $element) {
                    var rect = $element.get(0).getBoundingClientRect();
                    $contextMarker.css({
                        height: rect.height + 4 + 'px',
                        width: rect.width + 4 + 'px',
                        top:
                            rect.top +
                            $(
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr',
                                ).get(0).contentWindow,
                            ).scrollTop() -
                            2 +
                            'px',
                        left:
                            rect.left +
                            $(
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr',
                                ).get(0).contentWindow,
                            ).scrollLeft() -
                            2 +
                            'px',
                    });
                    if (
                        rect.top +
                            $(
                                '#document-editor-' +
                                    thisCpn.keyInstance +
                                    '_ifr',
                            )
                                .contents()
                                .find('body')
                                .scrollTop() <
                        24
                    )
                        $contextMarker
                            .find('[data-dragcontext-marker-text]')
                            .css('top', '0px');
                },
                ClearContainerContext: function () {
                    $('#document-editor-' + thisCpn.keyInstance + '_ifr')
                        .contents()
                        .find('[data-dragcontext-marker]')
                        .remove();
                },
                getElementName: function ($element) {
                    return $element.prop('tagName');
                },
            };

            $('.sym-document-tab-control .sym-control').attr(
                'draggable',
                'true',
            );

            $('.sym-control').on('dragstart', function (event) {
                dragoverqueue_processtimer = setInterval(function () {
                    DragDropFunctions.ProcessDragOverQueue();
                }, 100);
                var controlType = $(this).attr('control-type');
                let control = GetControlProps(controlType);
                event.originalEvent.dataTransfer.setData(
                    'control',
                    JSON.stringify(control),
                );
            });

            $('.sym-control').on('dragend', function () {
                clearInterval(dragoverqueue_processtimer);
                DragDropFunctions.removePlaceholder();
                DragDropFunctions.ClearContainerContext();
            });
            var style = $('<style data-reserved-styletag></style>').html(
                getInsertionCSS(),
            );
            var clientFrameWindow = $(
                '#document-editor-' + thisCpn.keyInstance + '_ifr',
            ).get(0).contentWindow;
            $(clientFrameWindow.document.head).append(style);

            var htmlBody = $(clientFrameWindow.document).find('body,html');
            htmlBody.css({ height: 'calc(100% - 10px)' });

            htmlBody
                .find('*')
                .on('dragenter', function (event) {
                    event.stopPropagation();
                    currentElement = $(event.target);
                    if (currentElement.attr('s-control-type') !== 'image') {
                        currentElementChangeFlag = true;
                        elementRectangle = event.target.getBoundingClientRect();
                        countdown = 1;
                    }
                })
                .on('dragover', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (currentElement.attr('s-control-type') !== 'image') {
                        if (
                            countdown % 15 != 0 &&
                            currentElementChangeFlag == false
                        ) {
                            countdown = countdown + 1;
                            return;
                        }
                        event = event || window.event;

                        var x = event.originalEvent.clientX;
                        var y = event.originalEvent.clientY;
                        countdown = countdown + 1;
                        currentElementChangeFlag = false;
                        var mousePosition = { x: x, y: y };
                        DragDropFunctions.AddEntryToDragOverQueue(
                            currentElement,
                            elementRectangle,
                            mousePosition,
                        );
                    }
                });

            // sự kiện thả control vào doc
            // xử lí thêm props của control vào store
            $(clientFrameWindow.document)
                .find('body,html')
                .on('drop', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var e;
                    if (event.isTrigger) e = triggerEvent.originalEvent;
                    else var e = event.originalEvent;
                    try {
                        var control = e.dataTransfer.getData('control');
                        control = JSON.parse(control);
                        var insertionPoint = $(
                            '#document-editor-' + thisCpn.keyInstance + '_ifr',
                        )
                            .contents()
                            .find('.drop-marker');
                        var checkDiv = $(control.html);
                        let typeControl = checkDiv.attr('s-control-type');
                        var inputid = 's-control-id-' + Date.now();
                        checkDiv.attr('id', inputid);
                        insertionPoint.after(checkDiv);
                        let table = insertionPoint.closest('.s-control-table'); // nếu kéo control vào table thì lưu prop của control đó vào table trong allControl của state
                        let idTable = '';
                        checkDiv.prop('readonly', false);
                        if (checkDiv.attr('s-control-type') != 'table') {
                            checkDiv.attr('contenteditable', false);
                        }
                        insertionPoint.remove();
                        thisCpn.selectControl(
                            control.properties,
                            control.formulas,
                            inputid,
                        );
                        if (table.length > 0) {
                            // nếu keo control vào trong table thì update dữ liệu trong table của state
                            idTable = table.attr('id');
                            thisCpn.addToAllControlInTable(
                                inputid,
                                {
                                    properties: control.properties,
                                    formulas: control.formulas,
                                    type: typeControl,
                                },
                                idTable,
                            );
                        } else {
                            thisCpn.addToAllControlInDoc(inputid, {
                                properties: control.properties,
                                formulas: control.formulas,
                                type: typeControl,
                            });
                        }
                        // set_window_property(inputid, objecttype);
                    } catch (e) {}
                });
        },
        setSelectedControlProp(e, el, clientFrameWindow) {
            e.preventDefault();
            $(clientFrameWindow.document)
                .find('.on-selected')
                .removeClass('on-selected');
            el.addClass('on-selected');

            let type = el.attr('s-control-type');
            let controlId = el.attr('id');
            $('.editor-tree-active').removeClass('editor-tree-active');
            $('.tree-' + controlId).addClass('editor-tree-active');

            let table = el.closest('.s-control-table');
            if (table.length > 0 && controlId != table.attr('id')) {
                tinyMCE.activeEditor.selection.setNode(e.target);
                let tableId = table.attr('id');
                let control =
                    this.editorStore.allControl[tableId]['listFields'][
                        controlId
                    ];
                this.selectControl(
                    control.properties,
                    control.formulas,
                    controlId,
                );
            } else {
                let control = this.editorStore.allControl[controlId];
                this.selectControl(
                    control.properties,
                    control.formulas,
                    controlId,
                );
            }
        },
    },
};
</script>
<style>
.d-flex {
    display: flex;
}
.sym-document__side-bar-right,
.sym-document__side-bar-left {
    height: 100%;
    width: 240px;
}
.sym-document__side-bar-right {
    background: #ffffff;
}
.sym-document__side-bar-left .v-tab,
.sym-document__side-bar-right .v-tab {
    font-size: 11px;
    padding: 0 8px;
}
.sym-document-editor .tox-sidebar-wrap {
    width: 21cm;
    margin: auto;
}
.sym-document-editor .tox-tinymce {
    height: 100% !important;
}
.container {
    padding: 0;
}
.sym-document-action {
    border-right: 1px solid #cdcdcd;
    border-left: 1px solid #cdcdcd;
    height: 30px;
    background: #f2f2f2;
}
/* body */
.sym-document-body {
    height: calc(100% - 10px);
}

/* editor  */

.sym-document-editor {
    min-width: 21cm !important;
    max-width: calc(100% - 480px) !important;
    /* overflow: auto; */
    /* background: #c5c5c5; */
    background-color: #dfdbe5;
    background: linear-gradient(
            -90deg,
            rgba(0, 0, 0, 0.05) 1px,
            transparent 1px
        ),
        linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(-90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
        linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
        linear-gradient(
            transparent 3px,
            #f2f2f2 3px,
            #f2f2f2 78px,
            transparent 78px
        ),
        linear-gradient(-90deg, #aaa 1px, transparent 1px),
        linear-gradient(
            -90deg,
            transparent 3px,
            #f2f2f2 3px,
            #f2f2f2 78px,
            transparent 78px
        ),
        linear-gradient(#aaa 1px, transparent 1px), #f2f2f2;
    background-size: 4px 4px, 4px 4px, 80px 80px, 80px 80px, 80px 80px,
        80px 80px, 80px 80px, 80px 80px;
}
/* end editor */

/* end body */

.sym-document-editor .tox .tox-tbtn {
    font-size: 13px;
    font-family: 'Roboto', sans-serif;
    height: 25px;
}
.sym-document-editor .tox-editor-header {
    border-bottom: 1px solid #d1d1d1;
}
.tox-toolbar__group .tox-tbtn__select-label {
    font-size: 11px !important;
}
</style>

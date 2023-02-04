<template>
    <v-flex class="d-flex sym-document" style="height: calc(100%)">
        <div class="sym-document__side-bar-left">
            <sidebar-left
                :isConfigPrint="isConfigPrint"
                :instance="keyInstance"
            />
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
                        ref="actionView"
                        @document-action-save-document="openPanelSaveDocument"
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
                        @document-action-check-control="
                            checkBeforeControlNameChange
                        "
                        @document-action-swap-type-control="openPanelSwapType"
                        @document-action-control-template="
                            showFormAddControlTemplate
                        "
                        @document-action-preview-submit="previewSubmitDocument"
                        @document-action-open-mobile-config="showMobileConfig"
                        @document-action-quick-save-document="
                            openPanelSaveDocument(true)
                        "
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
                :isConfigPrint="isConfigPrint"
                :styles="contentStyle"
                :instance="keyInstance"
                @symper-editor-check-old-name="checkOldName"
            />
        </div>
        <s-table-setting
            v-if="!isConfigPrint"
            ref="tableSetting"
            @show-matching-item-dialog="handleMatchingItemDialog"
            :instance="keyInstance"
            @after-save-config-table="afterSaveConfigTable"
            :dataConfigDeleteRow="dataConfigDeleteRow"
            :defaultTablePivotConfig="defaultTablePivotConfig"
            :defaultTableGroupConfig="defaultTableGroupConfig"
            :dataMatchingItems="defaultMatchingItems"
        />
        <MobileConfig
            ref="mobileConfig"
            :columns="mobileConfig.columns"
            :data="mobileConfig.data"
            :instance="keyInstance"
            @save-data="saveDataInMobileConfig"
            @close="handleCloseMobileConfig"
        />
        <PrintTableConfig
            v-if="isConfigPrint"
            ref="printTableConfig"
            @config-column-table-print="configColumnTablePrint"
        />
        <auto-complete-control
            v-if="!isConfigPrint"
            ref="autocompleteControl"
            @add-control="insertControl"
        />
        <save-doc-panel
            :isConfigPrint="isConfigPrint"
            :instance="keyInstance"
            ref="saveDocPanel"
            @check-name-document="checkBeforeDocumentNameChange"
            @save-doc-action="validateControlAfterSave"
            @save-form-print-action="saveFormPrint"
        />

        <FormModal
            :instance="keyInstance"
            :inputsObject="inputSaveControlTemplate"
            ref="formModalView"
            @form-modal-save="saveControlTemplate"
        />

        <!-- <QuickInfoControl :keyInstance="keyInstance" ref="quickInfoControlView"/> -->
        <err-message :listErr="listMessageErr" ref="errMessage" />
        <control-name-related
            v-if="!isConfigPrint"
            :instance="keyInstance"
            @after-close-panel="afterClosePanel"
            ref="controlNameRelated"
        />
        <all-control-option :instance="keyInstance" ref="allControlOption" />
        <MaterialIcon
            :instance="keyInstance"
            @selected="selectedIcon"
            :showTab="true"
            :float="true"
            ref="materialIconPicker"
        />
        <SwapTypeControlView
            :instance="keyInstance"
            :dataControl="dataControlSwapType"
            @after-change-type-control="afterChangeTypeControl"
            ref="swapTypeControlView"
        />

        <v-dialog v-model="dialog" persistent max-width="290">
            <v-card>
                <v-card-title class="notice-title">{{
                    titleDialog
                }}</v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="green darken-1"
                        v-if="intervalSetEditting"
                        text
                        @click="dialog = false"
                        >{{$t('v2.doc.cancel')}}</v-btn
                    >
                    <v-btn color="green darken-1" text @click="acceptDialog"
                        >{{$t('v2.doc.agree')}}</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="showErrorNoti" persistent max-width="490">
            <v-card>
                <div class="ml-2 pt-2">
                    <v-icon :size="14" color="orange">mdi-alert</v-icon>
                    <span class="fs-14 ml-1"
                        >{{$t('v2.doc.controlErrorWarningWhenSaveDocument')}}</span
                    >
                </div>
                <div class="fw-400 notice-title">
                    <span class="fs-11 color-red"> {{ errorContent }}</span>
                </div>
                <div class="d-flex justify-end">
                    <v-btn
                        @click="showErrorNoti = false"
                        text
                        class="ma-1 fs-13"
                        >{{$t('v2.doc.cancel')}}</v-btn
                    >
                </div>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="isShowPreviewSubmit"
            max-width="800"
            :style="{
                overflow: 'hidden',
                background: 'white'
            }"
        >
            <Submit
                :showSubmitButton="false"
                ref="subSubmitView"
                @before-close-submit="beforeCloseSubmit"
                :dataPreview="dataPreviewSubmit"
            />
        </v-dialog>
        <SymperDialogConfirm
            @confirm="confirmExitMatchingItems"
            @cancel="showExitMatchingItem = false"
            :title="$t('kanban.exit_confirm_title')"
            :content="$t('kanban.exit_confirm_content')"
            :showDialog="showExitMatchingItem"
        />
    </v-flex>
</template>
<script>
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
import EditorAction from './items/Action.vue';
import MobileConfig from './items/MobileConfig.vue';
import SwapTypeControlView from './items/SwapTypeControlView';
import SideBarLeft from './sideleft/SideBarLeft.vue';
import SideBarRight from './sideright/SideBarRight.vue';
import TableSetting from './items/TableSetting.vue';
import PrintTableConfig from './print/PrintTableConfig';
import AutoCompleteControl from './items/AutoCompleteControl.vue';
import SaveDocPanel from './../../views/document/items/SaveDocPanel.vue';
import FormModal from './../../views/document/items/FormModal';
import QuickInfoControl from './../../views/document/items/QuickInfoControl';
import ErrMessagePanel from './../../views/document/items/ErrMessagePanel.vue';
import ControlNameRelated from './../../views/document/items/ControlNameRelated.vue';
import AllControlInDoc from './../../views/document/items/AllControlInDoc.vue';
import MaterialIcon from '@/components/common/MaterialIcon.vue';
import {
    GetControlProps,
    mappingOldVersionControlProps,
    propsNotChangeForTaskManager,
    mappingOldVersionControlFormulas,
    getAPropsControl,
    getIconFromType,
    listControlNotNameProp
} from './../../components/document/controlPropsFactory.js';
import { documentApi } from './../../api/Document.js';
import accountApi from './../../api/account';
import { biApi } from './../../api/bi.js';
import { dataflowApi } from '@/api/dataflow.js';
import { formulasApi } from './../../api/Formulas.js';
import { util } from './../../plugins/util.js';
import {
    checkInTable,
    mapTypeToEffectedControl,
    addCssItem,
    getConfigDeleteRowTable
} from './common/common';
import { getInsertionCSS } from './../../components/document/documentUtil.js';
import VueResizable from 'vue-resizable';

import Submit from './submit/Submit';
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
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/charmap';
import {
    checkInfinityControl,
    getMapControlEffected,
    refreshMapEffectedFormulasControl
} from '../../components/document/dataControl';
import Formulas from './submit/formulas';

// biến lưu chiều rộng editor trước khi resize
const ALL_CONTROL = 'allControl';
const HTML_CONTENT = 'content';
const CODUMENT_PROPS = 'documentProperties';
export default {
    name: 'DocumentEditor',
    computed: {
        routeName() {
            return this.$getRouteName();
        },
        editorStore() {
            return this.$store.state.document.editor[this.keyInstance];
        },
        sDocumentProp() {
            return this.$store.state.document.documentProps[this.keyInstance];
        },
        sDocumentData() {
            return this.$store.state.document;
        },
        allControlTemplate() {
            return this.$store.state.document.editor[this.keyInstance]
                .allControlTemplate;
        },
        allControlDeleted() {
            return this.$store.state.document.editor[this.keyInstance]
                .allControlDeleted;
        },
        allUsers() {
            return this.$store.state.app.allUsers;
        },
        baInfo() {
            return this.$store.state.app.baInfo;
        }
    },
    components: {
        'sidebar-left': SideBarLeft,
        'sidebar-right': SideBarRight,
        'editor-action': EditorAction,
        's-table-setting': TableSetting,
        'auto-complete-control': AutoCompleteControl,
        'save-doc-panel': SaveDocPanel,
        'err-message': ErrMessagePanel,
        'vue-resizable': VueResizable,
        'all-control-option': AllControlInDoc,
        'control-name-related': ControlNameRelated,
        SwapTypeControlView,
        MaterialIcon,
        PrintTableConfig,
        QuickInfoControl,
        FormModal,
        SymperDialogConfirm,
        Submit,
        MobileConfig
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
            branding: false,
            draggable_modal: true,
            toolbar_mode: 'sliding',
            plugins: [
                'advlist autolink lists link image table print preview',
                ' fullscreen',
                'charmap',
                'table paste hr'
            ],
            contextmenu: 'inserttable table | settingtable | dragTable',
            toolbar:
                'undo redo | fontselect fontsizeselect formatselect pageSize| bold italic forecolor backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist indent hr | removeformat  table |  preview margin rotatePage mdiIcon |charmap',
            fontsize_formats:
                '8px 10px 11px 12px 13px 14px 15px 16px 17px 18px 19px 20px 21px 22px 23px 24px 25px 26px 27px 28px 29px 30px 32px 34px 36px',
            font_formats:
                'Roboto=Roboto,sans-serif; Andale Mono=andale mono,times;' +
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
                'Times New Roman=times new roman,times,serif;' +
                'Trebuchet MS=trebuchet ms,geneva;' +
                'Verdana=verdana,geneva;' +
                'Webdings=webdings;' +
                'Wingdings=wingdings,zapf dingbats',
            valid_elements: '*[*]',
            content_css: [
                'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css'
            ],
            paste_preprocess: function (plugin, args) {
                let content = self.handleDataPrePaste(args.content);
                args.content = content;
            },
            setup: function (ed) {
                var toggleState = false;
                ed.ui.registry.addMenuItem('settingtable', {
                    text: self.$t('v2.doc.settingTable'),
                    disabled: false,
                    onAction: function (e) {
                        if (self.routeName == 'printConfigDocument') {
                            self.showPrintConfigTable(e);
                        } else {
                            self.showSettingControlTable(e);
                        }
                    }
                });
                if (self.routeName == 'printConfigDocument') {
                    ed.ui.registry.addMenuButton('pageSize', {
                        text: self.$t('v2.doc.size'),
                        fetch: function (callback) {
                            var items = [
                                {
                                    type: 'menuitem',
                                    text: 'A3',
                                    onAction: function () {
                                        self.setPageSize(
                                            '29.7cm',
                                            '42cm',
                                            'A3'
                                        );
                                    }
                                },
                                {
                                    type: 'menuitem',
                                    text: 'A4',
                                    onAction: function () {
                                        self.setPageSize(
                                            '21cm',
                                            '29.7cm',
                                            'A4'
                                        );
                                    }
                                },
                                {
                                    type: 'menuitem',
                                    text: 'A5',
                                    onAction: function () {
                                        self.setPageSize(
                                            '14.8cm',
                                            '21cm',
                                            'A5'
                                        );
                                    }
                                }
                            ];
                            callback(items);
                        }
                    });
                    ed.ui.registry.addButton('rotatePage', {
                        icon: 'reload',
                        tooltip: 'Xoay',
                        onAction: function (_) {
                            self.rotatePage(ed);
                        }
                    });
                }
                ed.ui.registry.addMenuItem('dragTable', {
                    text: 'Drag table',
                    disabled: false,
                    onAction: function (e) {
                        self.showDragTable(e);
                    }
                });

                ed.ui.registry.addButton('margin', {
                    icon: 'margin',
                    tooltip: 'Margin',
                    onAction: function (_) {
                        self.showPaddingPageConfig(ed);
                    }
                });
                ed.ui.registry.addButton('mdiIcon', {
                    icon: 'emoji',
                    tooltip: 'Icon',
                    onAction: function (e, evt) {
                        let buttonOff = $(
                            '#document-editor-' + self.keyInstance + '_ifr'
                        )
                            .closest('.tox-editor-container')
                            .find('button[title="Icon"]')
                            .offset();
                        self.$refs.materialIconPicker.setContext('toolbar');
                        self.$refs.materialIconPicker.show(buttonOff);
                    }
                });

                for (let i = 0; i < self.listIconToolbar.length; i++) {
                    ed.ui.registry.addIcon(
                        self.listIconToolbar[i].name,
                        `<i class='mdi ` +
                            self.listIconToolbar[i].icon +
                            `' style='font-size:18px;rgba(0, 0, 0, 0.54);'></i>`
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
                    self.keyHandler(e, ed);
                });
                ed.on('keydown', function (e) {
                    self.keyDownHandler(e, ed);
                });
                ed.on('paste', function (e) {
                    self.handlePasteContentFromV1(e);
                });
                ed.on('dragstart', function (e) {
                    self.handleDragControlInEditor(e);
                });
                ed.on('drop', function (e) {
                    self.handleDropControlInEditor(e);
                });
                ed.on('ExecCommand', function (e) {
                    self.handleExecCommand(e);
                });
                ed.on('SelectionChange', function (e) {
                    self.handleHighlightControlSelection(e);
                });
            },
            init_instance_callback: function (editor) {
                self.editorCore = editor;
                self.initEditor();
            }
        });
        this.handleCloseChrome();
    },
    created() {
        const self = this;
        this.currentTabIndex = this.$store.state.app.currentTabIndex;
        this.$store.commit('document/setDefaultEditorStore', {
            instance: this.keyInstance
        });
        this.isConfigPrint = false;
        if (this.routeName == 'printConfigDocument') {
            this.documentId = this.$route.params.id;
            this.isConfigPrint = true;
            this.printConfigId = this.$route.params.printConfigId;
        } else if (this.routeName == 'editControlTemplate') {
            this.controlTemplateId = this.$route.params.id;
        } else {
            this.getDataFlow();
            this.documentId = this.$route.params.id;
        }
        /**
         * Nhận sự kiên từ click treeview danh sách các control trong doc thì highlight control và selected control
         */
        this.$evtBus.$on(
            'document-editor-click-treeview-list-control',
            (locale) => {
                if (this._inactive == true) return;
                let elControl = $(
                    '#document-editor-' + this.keyInstance + '_ifr'
                )
                    .contents()
                    .find('body #' + locale.id);
                this.setSelectedControlProp(
                    locale.event,
                    elControl,
                    $('#document-editor-' + this.keyInstance + '_ifr').get(0)
                        .contentWindow,
                    true
                );
            }
        );
        this.$evtBus.$on('before-close-app-tab', (data) => {
            if (this._inactive == true) return;
            if (this.routeName == 'editDocument') {
                const message = self.$t('document.notification.leavePage');
                let confirm = window.confirm(message);
                self.$evtBus.$emit('close-edit-document', confirm);
                documentApi.setEdittingDocument({
                    id: this.documentId,
                    status: 0
                });
                clearInterval(this.intervalSetEditting);
            }
        });
    },
    data() {
        return {
            showExitMatchingItem: false,
            defaultMatchingItems: {},
            dataMatchingItems: {},
            mobileConfig: {
                columns: [
                    {
                        id: 'unselectedControl',
                        label: this.$t('v2.doc.hiddenOnMobile')
                    },
                    {
                        id: 'selectedControl',
                        label: this.$t('v2.doc.displayOnMobile')
                    }
                ],
                data: {}
            },
            editorCore: null,
            showErrorNoti: '',
            errorContent: '',
            isAutocompleteControl: false,
            listMessageErr: [],
            documentId: 0,
            printConfigId: 0,
            documentProps: {},
            lastKeypressTime: 0,
            listIconToolbar: null,
            listNameValueControl: {},
            keyInstance: Date.now(),
            dialog: false,
            dataControlSwapType: {},
            listDataFlow: [],
            currentTabSelectedIcon: null,
            titleDialog: '',
            currentPageActive: null,
            isConfigPrint: false,
            listDocument: [],
            inputSaveControlTemplate: {},
            contentStyle: {},
            currentDragging: null,
            oldTableId: null,
            dataPreviewSubmit: null,
            isShowPreviewSubmit: false,
            controlTemplateId: 0,
            intervalSetEditting: null,
            currentTabIndex: null,
            dataPivotTable: {},
            dataGroupTable: {},
            defaultTablePivotConfig: {},
            defaultTableGroupConfig: {},
            controlValidateName: {},
            dataConfigDeleteRow: [],
            oldContent: '',
            oldListFormulas: {}
        };
    },

    deactivated() {
        $('.tox-pop').css({ display: 'none' });
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
            { name: 'redo', icon: 'mdi-redo' }
        ];
        this.inputSaveControlTemplate = {
            title: {
                title: this.$t('document.editor.dialog.saveDoc.title'),
                type: 'text',
                value: '',
                validateStatus: {
                    isValid: true,
                    message: this.$t('document.validate.emptyTitle')
                }
            }
        };
    },
    watch: {
        // kiểm tra xem route thay đổi khi vào editor là edit doc hay create doc
        $route(to, old) {
            if (old.name == 'editDocument') {
                documentApi.setEdittingDocument({
                    id: this.documentId,
                    status: 0
                });
                clearInterval(this.intervalSetEditting);
            }
            this.documentId = Date.now();
            // this.$store.commit("document/setDefaultEditorStore",{instance:this.keyInstance});
            if (to.name == 'editDocument') {
                this.documentId = to.params.id;
            } else if (to.name == 'createDocument') {
                this.documentId = 0;
            }
        },
        'sDocumentData.listAllDocument': function (data) {
            for (let docName in data) {
                this.listDocument.push({
                    name: docName,
                    id: data[docName].id,
                    title: data[docName].title
                });
            }
        }
    },
    methods: {
        /**
         * Hàm lấy tất cả thông tin của workflow phục vụ cho việc chọn dataflow trong control dataflow
         */
        getDataFlow() {
            let thisCpn = this;
            biApi.getAllDataFlow().then((res) => {
                if (res.status == 200 && res.data.listObject.length > 0) {
                    for (
                        let index = 0;
                        index < res.data.listObject.length;
                        index++
                    ) {
                        let dataflow = res.data.listObject[index];
                        thisCpn.listDataFlow.push({
                            id: dataflow.id,
                            name: dataflow.name,
                            title: '',
                            params: dataflow.variables
                        });
                    }
                    thisCpn.$store.commit('document/addToDocumentEditorStore', {
                        key: 'listDataFlow',
                        value: thisCpn.listDataFlow,
                        instance: thisCpn.keyInstance
                    });
                }
            });
        },
        /**
         * Mở 1 dialog:
         * input: type - loại dialog (đánh dấu để kiểm tra lúc accept)
         */
        showDialogEditor(type, title) {
            this.dialog = true;
            this.typeDialog = type;
            this.titleDialog = title;
        },
        /**
         * Sự kiện khi ấn accept dialog
         */
        acceptDialog() {
            this.dialog = false;
            if (this.typeDialog == 'deletePage') {
                this.handleClickDeletePageInControlTab(this.currentPageActive);
            }
            // if(this.typeDialog == "baEditting"){
            //     this.$evtBus.$emit('close-app-tab',this.currentTabIndex)
            // }
        },

        /**
         * Hàm xử lí khi drag control trong doc thì cần cập nhật lại state của store khi kéo vào trong table
         * bao gồm quá trình drag và drop
         */
        handleDragControlInEditor(e) {
            this.editorCore.undoManager.add();
            this.currentDragging = $(e.target);
            let idControl = this.currentDragging.attr('id');
            let currentLocation = $(
                '#document-editor-' + this.keyInstance + '_ifr'
            )
                .contents()
                .find('#' + idControl);
            if (
                !currentLocation.is('.s-control-table') &&
                currentLocation.closest('.s-control-table')
            ) {
                this.oldTableId = currentLocation
                    .closest('.s-control-table')
                    .attr('id');
            }
        },
        /**
         * Hàm xử lí khi drop control
         */
        handleDropControlInEditor(e) {
            setTimeout(
                (self) => {
                    let idControl = self.currentDragging.attr('id');
                    let currentLocation = $(
                        '#document-editor-' + self.keyInstance + '_ifr'
                    )
                        .contents()
                        .find('#' + idControl);
                    if (
                        currentLocation
                            .parent()
                            .is('.ephox-snooker-resizer-bar')
                    ) {
                        // th nếu kéo phải control vào chỗ resize table nên bị mất control, thì undo lại
                        e.target.undoManager.undo();
                    } else {
                        let newTableId = false;
                        if (
                            !currentLocation.is('.s-control-table') &&
                            currentLocation.closest('.s-control-table')
                        ) {
                            let tableContain =
                                currentLocation.closest('.s-control-table');
                            newTableId = tableContain.attr('id');
                        }
                        self.handleMoveDataControl(idControl, newTableId);
                    }
                },
                100,
                this
            );
        },
        handleMoveDataControl(controlId, newTableId) {
            if (newTableId == this.oldTableId) {
                return;
            }
            if (newTableId || this.oldTableId) {
                this.$store.commit('document/moveControl', {
                    instance: this.keyInstance,
                    controlId: controlId,
                    oldTableId: this.oldTableId,
                    newTableId: newTableId
                });
                if (this.routeName == 'editDocument') {
                    this.checkValidateControl(
                        controlId,
                        newTableId,
                        this.oldTableId
                    );
                }
            }
        },
        /**
         * Hàm kiểm tra control sau khi kéo thả thay đổi vị trý
         * nếu là kéo vào trong table hoặc ra ngoài table thì yêu cầu đổi tên
         */
        checkValidateControl(controlId, tableId, oldTableId) {
            let allControl = this.editorStore.allControl;
            let currentControl = this.editorStore.currentSelectedControl;
            let control = tableId
                ? allControl[tableId]['listFields'][controlId]
                : allControl[controlId];
            tableId = tableId ? tableId : '0';
            let withoutCurrentControl =
                currentControl && currentControl.id == controlId ? false : true;
            if (this.controlValidateName[controlId]) {
                if (
                    control.properties.name.value ==
                        this.controlValidateName[controlId].value &&
                    tableId == this.controlValidateName[controlId].oldPosition
                ) {
                    this.$store.commit('document/updateProp', {
                        id: controlId,
                        name: 'name',
                        value: {
                            isValid: true,
                            message: ''
                        },
                        tableId: tableId,
                        type: 'validateStatus',
                        instance: this.keyInstance,
                        withoutCurrentControl: withoutCurrentControl
                    });
                    return;
                }
            } else {
                this.controlValidateName[controlId] = {
                    oldPosition: oldTableId ? oldTableId : '0',
                    value: control.properties.name.value
                };
            }
            this.$store.commit('document/updateProp', {
                id: controlId,
                name: 'name',
                value: {
                    isValid: false,
                    message: this.$t('v2.doc.requireRenameControl')
                },
                tableId: tableId,
                type: 'validateStatus',
                instance: this.keyInstance,
                withoutCurrentControl: withoutCurrentControl
            });
        },
        /*
         * Sau khi đổi tên control đã kéo vào bảng hoặc kéo ra thì cần check lại tên cũ
         * nếu trùng thì validate
         */
        checkOldName(data) {
            let name = data.value;
            let tableId = data.tableId;
            let currentControl = this.editorStore.currentSelectedControl;
            let controlId = currentControl.id;
            if (this.controlValidateName[controlId]) {
                if (
                    tableId == this.controlValidateName[controlId].oldPosition
                ) {
                    return;
                }
                if (name == this.controlValidateName[controlId].value) {
                    this.$store.commit('document/updateProp', {
                        id: controlId,
                        name: 'name',
                        value: {
                            isValid: false,
                            message: this.$t('v2.doc.requireRenameControl')
                        },
                        tableId: tableId,
                        type: 'validateStatus',
                        instance: this.keyInstance,
                        withoutCurrentControl: false
                    });
                }
            }
        },
        /**
         * Hàm xử lý content trước khi paste
         * xử lý copy/paste trong nội bộ tự động nhân bản các thuộc tính (riêng id phải tạo mới)
         */
        handleDataPrePaste(content) {
            content = content.replace(/((<|(<\/))html>)|((<|(<\/))body>)/g, '');
            content = content.replace(/<!--[^>]*-->/g, '');
            content = '<div class="content-wrap">' + content + '</div>';
            let contentEl = $(content);
            let listControls = contentEl.find(
                '.s-control:not(.s-control-table .s-control)'
            );
            if (listControls.length > 0) {
                for (let index = 0; index < listControls.length; index++) {
                    const controlEl = listControls[index];
                    let controlId = $(controlEl).attr('id');
                    let currentControl = this.editorStore.allControl[controlId];
                    var inputId = 's-control-id-' + Date.now() + index;
                    let controlType = $(controlEl).attr('s-control-type');
                    contentEl
                        .find('#' + controlId)
                        .attr('id', inputId)
                        .css({ background: 'rgba(0 0 0 / 0.05)' })
                        .removeClass('on-selected');
                    let control = GetControlProps(controlType);
                    control = this.multilinguePropertiesControl(control, controlType);
                    control.properties = currentControl.properties;
                    control.formulas = currentControl.formulas;
                    this.addToAllControlInDoc(inputId, {
                        properties: control.properties,
                        formulas: control.formulas,
                        type: controlType
                    });
                    if (controlType == 'table') {
                        // nếu là table thì xử lí các control trong table
                        let allControlInTable = $(controlEl).find('.s-control');
                        for (let i = 0; i < allControlInTable.length; i++) {
                            const childControlEl = allControlInTable[i];
                            let childControlId = $(childControlEl).attr('id');
                            let childCurrentControl =
                                currentControl.listFields[childControlId];
                            var childInputId =
                                's-control-id-' +
                                Date.now() +
                                Math.floor(Math.random() * 100);
                            let childControlType =
                                $(childControlEl).attr('s-control-type');
                            contentEl
                                .find('#' + childControlId)
                                .attr('id', childInputId)
                                .css({ background: 'rgba(0 0 0 / 0.05)' })
                                .removeClass('on-selected');
                            let childControl =
                                GetControlProps(childControlType);
                            childControl = this.multilinguePropertiesControl(childControl,childControlType);
                            childControl.properties =
                                childCurrentControl.properties;
                            childControl.formulas =
                                childCurrentControl.formulas;
                            this.addToAllControlInTable(
                                childInputId,
                                {
                                    properties: childControl.properties,
                                    formulas: childControl.formulas,
                                    type: childControlType
                                },
                                inputId
                            );
                        }
                    }
                }
                content = contentEl.html();
                return content;
            }
            return content;
        },
        /**
         * Hàm xử lí khi paste nội dung vào editor
         * nếu paste nội dung từ document editor version 1 thì tự động convert các thuộc tính, html...
         *
         */
        handlePasteContentFromV1(e) {
            var content = (
                (e.originalEvent || e).clipboardData || window.clipboardData
            ).getData('text/html');
            content = content.replace(/((<|(<\/))html>)|((<|(<\/))body>)/g, '');
            content = content.replace(/<!--[^>]*-->/g, '');
            content = '<div class="content-wrap">' + content + '</div>';
            let contentEl = $(content);
            if (contentEl.find('.bkerp-input').length > 0) {
                setTimeout(
                    (self) => {
                        self.setContentForDocumentV1();
                    },
                    300,
                    this
                );
            }
        },
        px2cm(px) {
            return (Math.round((px / 37.7952) * 100) / 100).toFixed(1);
        },

        // hàm gọi từ compon đổi kiểu control để thay đổi dữ liệu của control có trong store
        afterChangeTypeControl(newType) {
            let currentControl = this.editorStore.currentSelectedControl;
            let control = GetControlProps(newType);
            control = this.multilinguePropertiesControl(control,newType);
            let controlEl = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('#' + currentControl.id);
            let oldFormulas = currentControl.formulas;
            let oldProps = currentControl.properties;
            for (let formulasType in oldFormulas) {
                if (control.formulas.hasOwnProperty(formulasType)) {
                    control.formulas[formulasType] = oldFormulas[formulasType];
                }
            }
            for (let group in oldProps) {
                for (let prop in oldProps[group]) {
                    if (control.properties.hasOwnProperty(prop)) {
                        control.properties[prop] = oldProps[group][prop];
                    }
                }
            }
            if (controlEl.length > 0) {
                let id = currentControl.id;
                let table = controlEl.closest('.s-control-table');
                if (table.length > 0 && currentControl.id != table.attr('id')) {
                    let tableId = table.attr('id');
                    this.addToAllControlInTable(
                        id,
                        {
                            properties: control.properties,
                            formulas: control.formulas,
                            type: newType
                        },
                        tableId
                    );
                } else {
                    this.addToAllControlInDoc(id, {
                        properties: control.properties,
                        formulas: control.formulas,
                        type: newType
                    });
                }
                let newControl = $(control.html);
                newControl.attr('id', id).addClass('on-selected');
                controlEl.replaceWith(newControl.prop('outerHTML'));
                this.selectControl(
                    control.properties,
                    control.formulas,
                    id,
                    newType
                );
            }
        },
        /**
         * Hàm xử lí kiểm tra xem tên của control hiện tại đang ở trong những công thức của các control nào document nào
         */
        checkBeforeControlNameChange() {
            let currentControl = this.editorStore.currentSelectedControl;
            if (currentControl.properties.name.hasOwnProperty('name')) {
                this.$refs.controlNameRelated.setSubHeadingTitle(
                    this.$t(
                        'document.editor.dialog.nameRelated.subTitleControl'
                    )
                );
                this.$refs.controlNameRelated.setHeadingTitle(
                    this.$t('document.editor.dialog.nameRelated.headingControl')
                );
                this.$refs.controlNameRelated.getDataRelated(
                    'control',
                    currentControl.properties.name.name.oldName,
                    currentControl.properties.name.name.value
                );
                this.$refs.controlNameRelated.showDialog();
            } else {
                this.$snotify({
                    type: 'info',
                    title: this.$t('v2.doc.selectControlBeforeUsingFeature')
                });
            }
        },
        /**
         * Kiểm tra xem tên của doc đang được sử dụng ở trong những công thức nào
         */
        checkBeforeDocumentNameChange() {
            this.$refs.saveDocPanel.hideDialog();
            setTimeout(
                (self) => {
                    self.$refs.controlNameRelated.setSubHeadingTitle(
                        self.$t(
                            'document.editor.dialog.nameRelated.subTitleDocument'
                        )
                    );
                    self.$refs.controlNameRelated.setHeadingTitle(
                        self.$t(
                            'document.editor.dialog.nameRelated.headingDocument'
                        )
                    );
                    self.$refs.controlNameRelated.getDataRelated('document');
                    self.$refs.controlNameRelated.showDialog();
                },
                100,
                this
            );
        },
        /**
         * Hàm callback khi đóng panel check tên control, document liên quan đến các công thức
         */
        afterClosePanel(from) {
            if (from == 'document')
                setTimeout(
                    (self) => {
                        this.$refs.saveDocPanel.showDialog();
                    },
                    100,
                    this
                );
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
                value: documentProperties
            });
            this.$store.commit('document/addToDocumentEditorStore', {
                key: ALL_CONTROL,
                value: allControl,
                instance: this.keyInstance
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
                JSON.stringify(documentProperties)
            );
        },
        /**
         * Xóa data ra khỏi local storage
         */
        deleteLocalStorage() {
            localStorage.removeItem(ALL_CONTROL);
            localStorage.removeItem(HTML_CONTENT);
            localStorage.removeItem(CODUMENT_PROPS);
            this.$snotify({
                type: 'info',
                title: 'Delete control in local storage success'
            });
        },
        // sao chép control và thêm vào sau nó
        cloneControl() {
            let currentControl = this.editorStore.currentSelectedControl;
            let controlInstance = util.cloneDeep(
                this.editorStore.allControl[currentControl.id]
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
                this.addToAllControlInDoc(id, {
                    properties: controlInstance.properties,
                    formulas: controlInstance.formulas,
                    type: typeControl
                });
                if (typeControl == 'table') {
                    let tableId = newControl.attr('id');
                    let newTableEl = $(
                        '#document-editor-' + this.keyInstance + '_ifr'
                    )
                        .contents()
                        .find('#' + tableId);
                    let self = this;
                    let index = 1;
                    let allControlProp = controlInstance.listFields;
                    setTimeout(() => {
                        newTableEl.find('.s-control').each(function () {
                            let childControlId = $(this).attr('id');
                            let newChildId =
                                's-control-id-' + (Date.now() + index);
                            let childControlProp =
                                allControlProp[childControlId];
                            newTableEl
                                .find('#' + childControlId)
                                .attr('id', newChildId);
                            self.addToAllControlInTable(
                                newChildId,
                                {
                                    properties: childControlProp.properties,
                                    formulas: childControlProp.formulas,
                                    type: $(this).attr('s-control-type')
                                },
                                tableId
                            );
                            index++;
                        });
                    }, 1);
                }
            }
        },
        /**
         * Xóa control trong doc, xóa luôn trong store
         */
        deleteControl() {
            let control = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.on-selected');
            let currentControl = this.editorStore.currentSelectedControl;
            if (
                currentControl.properties.display.isPreventedConfig &&
                currentControl.properties.display.isPreventedConfig.value
            ) {
                this.$snotify({
                    type: 'warn',
                    title: this.$t('v2.doc.cannotDeleteControl')
                });
            } else {
                this.resetSelectControl();
                control.remove();
            }
        },
        // hàm tạo dialog của tinymce để cấu hình padding doc
        showPaddingPageConfig(ed) {
            let self = this;
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
                    $('#document-editor-' + self.keyInstance + '_ifr')
                        .contents()
                        .find('body')
                        .css({
                            'padding-left': left + 'cm',
                            'padding-right': right + 'cm',
                            'padding-top': top + 'cm',
                            'padding-bottom': bottom + 'cm',
                            margin: '0'
                        });
                    self.contentStyle = Object.assign(self.contentStyle, {
                        'padding-left': left + 'cm',
                        'padding-right': right + 'cm',
                        'padding-top': top + 'cm',
                        'padding-bottom': bottom + 'cm'
                    });
                    self.$store.commit('document/updateDocumentState', {
                        instance: self.keyInstance,
                        state: 'documentStyle',
                        value: self.contentStyle
                    });
                    ed.windowManager.close();
                }
            });
        },
        setShowAllControlOption() {
            this.$refs.allControlOption.getData();
            this.$refs.allControlOption.showDialog();
        },
        /**
         * Sự kiện bấm mở modal lưu control template
         */
        showFormAddControlTemplate() {
            if (this.checkIsSelectionText()) {
                this.$refs.formModalView.show();
            } else {
                let currentControl = this.editorStore.currentSelectedControl;
                if (currentControl.properties.name.hasOwnProperty('name')) {
                    this.$refs.formModalView.show();
                }
            }
        },
        /**
         * Hàm xử lí xem trước submit form
         */
        previewSubmitDocument() {
            $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.on-selected')
                .removeClass('on-selected');
            this.isShowPreviewSubmit = true;
            let fieldForSubmit = util.cloneDeep(this.editorStore.allControl);
            this.prepareDataForPreview(fieldForSubmit);
            this.dataPreviewSubmit = {
                fields: fieldForSubmit,
                content: this.editorCore.getContent()
            };
        },
        // xử lí dữ liệu để đẩy vào form submit
        prepareDataForPreview(fieldForSubmit) {
            for (let controlId in fieldForSubmit) {
                for (let prop in fieldForSubmit[controlId].properties) {
                    fieldForSubmit[controlId].properties[prop] =
                        fieldForSubmit[controlId].properties[prop].value;
                }
                for (let formulasType in fieldForSubmit[controlId].formulas) {
                    let formulasItem = {};
                    formulasItem[Date.now()] =
                        fieldForSubmit[controlId].formulas[formulasType].value;
                    if (
                        !fieldForSubmit[controlId].formulas[formulasType].value
                    ) {
                        formulasItem = '';
                    }
                    fieldForSubmit[controlId].formulas[formulasType] =
                        formulasItem;
                }
                if (fieldForSubmit[controlId].type == 'table') {
                    this.prepareDataForPreview(
                        fieldForSubmit[controlId].listFields
                    );
                }
            }
        },
        /**
         * Sự kiện bấm mở popup chuyển đổi kiểu control
         */
        openPanelSwapType() {
            let currentControl = this.editorStore.currentSelectedControl;
            if (currentControl.properties.name.hasOwnProperty('name')) {
                let icon = getIconFromType(currentControl.type);
                this.dataControlSwapType = {
                    name: currentControl.properties.name.name.value,
                    type: currentControl.type,
                    icon: icon
                };
                this.$refs.swapTypeControlView.show();
            } else {
                this.$snotify({
                    type: 'info',
                    title: this.$t('v2.doc.selectControlBeforeUsingFeature')
                });
            }
        },

        getCardInfoInMobileConfig(
            id,
            column,
            title,
            type,
            icon,
            required = false,
            isSelected = false,
            position = '',
            disabled = false
        ) {
            let card = {
                id: id,
                column: column,
                title: title,
                type: type,
                icon: icon,
                required: required,
                isSelected: isSelected,
                position: position,
                disabled: disabled
            };
            return card;
        },
        // lấy tất cả các control trong doc theo thứ tự trên xuống dưới, trái sang phải
        getControlMobileConfig() {
            let controlsInStore = this.editorStore.allControl;
            let controlOutTable = [];
            let controlInTable = {};
            let mapIcon = this.$i('mobile_config');
            let allControl = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.s-control');
            const self = this;

            if (JSON.stringify(this.mobileConfig.data) == '{}') {
                $.each(allControl, function (key, val) {
                    let id = $(val).attr('id');
                    if (
                        controlsInStore[id] &&
                        mapIcon[controlsInStore[id].type]
                    ) {
                        let cardInfo = self.getCardInfoInMobileConfig(
                            id,
                            'selectedControl',
                            controlsInStore[id].properties.title.value,
                            controlsInStore[id].type,
                            mapIcon[controlsInStore[id].type],
                            controlsInStore[id].properties.isRequired
                                ? controlsInStore[id].properties.isRequired
                                      .value
                                : false,
                            false,
                            '',
                            false
                        );
                        controlOutTable.push(cardInfo);
                        if (controlsInStore[id].type == 'table') {
                            let contrlInTable = self.getControlByTableId(
                                id,
                                controlsInStore,
                                'selectedControl'
                            );
                            controlInTable[id] = contrlInTable;
                        }
                    }
                });
                return {
                    outTable: controlOutTable,
                    table: controlInTable
                };
            } else {
                // trường hợp đã tồn tại update
                this.mobileConfig.data.outTable.map((d) => {
                    let id = d.id;
                    if (controlsInStore[id]) {
                        let cardInfo = self.getCardInfoInMobileConfig(
                            id,
                            d.column,
                            controlsInStore[id].properties.title.value,
                            controlsInStore[id].type,
                            mapIcon[controlsInStore[id].type],
                            controlsInStore[id].properties.isRequired
                                ? controlsInStore[id].properties.isRequired
                                      .value
                                : false,
                            d.isSelected,
                            d.position,
                            d.disabled
                        );
                        controlOutTable.push(cardInfo);
                    }
                });
                Object.keys(this.mobileConfig.data.table).map((tbId) => {
                    self.mobileConfig.data.table[tbId].map((control) => {
                        let contrlInTable = self.getControlByTableId(
                            tbId,
                            controlsInStore,
                            control.column
                        );
                        controlInTable[tbId] = contrlInTable;
                    });
                });
                // control được thêm vào
                $.each(allControl, function (key, val) {
                    let id = $(val).attr('id');
                    if (
                        controlsInStore[id] &&
                        mapIcon[controlsInStore[id].type]
                    ) {
                        let checkHasControl = self.checkControlInMobileConfig(
                            id,
                            controlOutTable
                        );
                        if (!checkHasControl) {
                            // kiểm tra >4 thì fall
                            let cardInfo = self.getCardInfoInMobileConfig(
                                id,
                                'selectedControl',
                                controlsInStore[id].properties.title.value,
                                controlsInStore[id].type,
                                mapIcon[controlsInStore[id].type],
                                controlsInStore[id].properties.isRequired
                                    ? controlsInStore[id].properties.isRequired
                                          .value
                                    : false,
                                false,
                                '',
                                false
                            );
                            controlOutTable.push(cardInfo);
                        }
                        if (controlsInStore[id].type == 'table') {
                            let contrlInTable = self.getControlByTableId(
                                id,
                                controlsInStore,
                                'selectedControl'
                            );
                            controlInTable[id] = contrlInTable;
                        }
                    }
                });
                return {
                    outTable: controlOutTable,
                    table: controlInTable
                };
            }
        },
        checkControlInMobileConfig(id, control) {
            let check = control.filter((c) => c.id == id);
            return check.length == 0 ? false : true;
        },
        // lấy tất cả control trong table ở editor theo từng id table
        getControlByTableId(tableId, controlsInStore, column) {
            const self = this;
            let allControl = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('#' + tableId)
                .find('.s-control');
            let controlsInTable = [];
            let mapIcon = this.$i('mobile_config');
            if (
                this.mobileConfig.data.table &&
                this.mobileConfig.data.table[tableId]
            ) {
                this.mobileConfig.data.table[tableId].map((tb) => {
                    let id = tb.id;
                    let control = controlsInStore[tableId].listFields[id];
                    if (control) {
                        let cardInfo = self.getCardInfoInMobileConfig(
                            id,
                            tb.column,
                            control.properties.title.value,
                            control.type,
                            mapIcon[control.type],
                            control.properties.isRequired
                                ? control.properties.isRequired.value
                                : false
                        );
                        controlsInTable.push(cardInfo);
                    }
                });
                // trường hợp thêm control
                $.each(allControl, function (key, val) {
                    let id = $(val).attr('id');
                    if (
                        controlsInStore[tableId].listFields[id] &&
                        mapIcon[controlsInStore[tableId].listFields[id].type]
                    ) {
                        let control = controlsInStore[tableId].listFields[id];
                        let checkControlInMobileConfig =
                            self.checkControlInMobileConfig(
                                id,
                                controlsInTable
                            );
                        if (!checkControlInMobileConfig) {
                            let cardInfo = self.getCardInfoInMobileConfig(
                                id,
                                column,
                                control.properties.title.value,
                                control.type,
                                mapIcon[control.type],
                                control.properties.isRequired
                                    ? control.properties.isRequired.value
                                    : false
                            );
                            controlsInTable.push(cardInfo);
                        }
                    }
                });
            } else {
                $.each(allControl, function (key, val) {
                    let id = $(val).attr('id');
                    if (
                        controlsInStore[tableId].listFields[id] &&
                        mapIcon[controlsInStore[tableId].listFields[id].type]
                    ) {
                        let control = controlsInStore[tableId].listFields[id];
                        let cardInfo = self.getCardInfoInMobileConfig(
                            id,
                            column,
                            control.properties.title.value,
                            control.type,
                            mapIcon[control.type],
                            control.properties.isRequired
                                ? control.properties.isRequired.value
                                : false
                        );
                        controlsInTable.push(cardInfo);
                    }
                });
            }

            return controlsInTable;
        },
        setDocumentConfigMobile(data, fields) {
            if (data) {
                let allControl = JSON.parse(data);
                let controlOutTable = [];
                let controlInTable = {};
                let mapIcon = this.$i('mobile_config');
                // kiểm tra xem có position k
                let checkPosition = allControl.outTable.position;
                allControl.outTable.selected.map((controlId, controlIdx) => {
                    // tìm vị trí của thẻ
                    let position = '';
                    if (allControl.outTable.position) {
                        allControl.outTable.position.map((c, cIdx) => {
                            if (c == controlId) {
                                position = cIdx + 1;
                            }
                        });
                    }
                    let card = this.getCardInfoInMobileConfig(
                        controlId,
                        'selectedControl',
                        fields[controlId].properties.title,
                        fields[controlId].type,
                        mapIcon[fields[controlId].type],
                        fields[controlId].properties.isRequired
                            ? fields[controlId].properties.isRequired.value
                            : false,
                        position ? true : false,
                        position,
                        position || !checkPosition ? false : true
                    );
                    controlOutTable.push(card);
                });
                allControl.outTable.hide.map((controlId) => {
                    let card = this.getCardInfoInMobileConfig(
                        controlId,
                        'unselectedControl',
                        fields[controlId].properties.title,
                        fields[controlId].type,
                        mapIcon[fields[controlId].type]
                    );
                    controlOutTable.push(card);
                });
                Object.keys(allControl.table).map((tableId) => {
                    controlInTable[tableId] = [];
                    if (fields[tableId]) {
                        allControl.table[tableId].selected.map((ctrTbl) => {
                            let card = this.getCardInfoInMobileConfig(
                                ctrTbl,
                                'selectedControl',
                                fields[tableId].listFields[ctrTbl].properties
                                    .title,
                                fields[tableId].listFields[ctrTbl].type,
                                mapIcon[
                                    fields[tableId].listFields[ctrTbl].type
                                ],
                                fields[tableId].listFields[ctrTbl].properties
                                    .isRequired
                                    ? fields[tableId].listFields[ctrTbl]
                                          .properties.isRequired.value
                                    : false
                            );
                            controlInTable[tableId].push(card);
                        });
                        allControl.table[tableId].hide.map((ctrTbl) => {
                            let card = this.getCardInfoInMobileConfig(
                                ctrTbl,
                                'unselectedControl',
                                fields[tableId].listFields[ctrTbl].properties
                                    .title,
                                fields[tableId].listFields[ctrTbl].type,
                                mapIcon[
                                    fields[tableId].listFields[ctrTbl].type
                                ],
                                fields[tableId].listFields[ctrTbl].properties
                                    .isRequired
                                    ? fields[tableId].listFields[ctrTbl]
                                          .properties.isRequired.value
                                    : false
                            );
                            controlInTable[tableId].push(card);
                        });
                    }
                });
                this.mobileConfig.data.outTable = controlOutTable;
                this.mobileConfig.data.table = controlInTable;
            }
        },
        getDataConfigMobileBeforeSave() {
            let position = {
                1: '',
                2: '',
                3: ''
            };
            let data = {
                outTable: {
                    hide: [],
                    selected: [],
                    position: [] // lưu vị trí hiển thị control trên showlist mobile
                },
                table: {}
            };
            // trường hợp trống do không cấu hình => lấy lại
            if (JSON.stringify(this.mobileConfig.data) != '{}') {
                this.mobileConfig.data.outTable.map((card) => {
                    if (card.column == 'selectedControl') {
                        data.outTable.selected.push(card.id);
                        if (card.isSelected) {
                            position[card.position] = card.id;
                        }
                    } else {
                        data.outTable.hide.push(card.id);
                    }
                });
                data.outTable.position = Object.values(position);
                let tables = Object.keys(this.mobileConfig.data.table);
                tables.map((tableId) => {
                    data.table[tableId] = {
                        hide: [],
                        selected: []
                    };
                    this.mobileConfig.data.table[tableId].map((card) => {
                        if (card.column == 'selectedControl') {
                            data.table[tableId].selected.push(card.id);
                        } else {
                            data.table[tableId].hide.push(card.id);
                        }
                    });
                });
            }
            return JSON.stringify(data);
        },
        handleCloseMobileConfig() {
            // this.mobileConfig. = {}
        },
        saveDataInMobileConfig(data) {
            this.mobileConfig.data = util.cloneDeep(data);
        },
        // hiện form config mobile
        showMobileConfig() {
            this.mobileConfig.data = this.getControlMobileConfig();
            this.$refs.mobileConfig.show();
        },
        // mở modal lưu , edit doc
        openPanelSaveDocument(quickSave = false) {
            if (this.routeName == 'editControlTemplate') {
                this.$refs.formModalView.show();
            } else if (this.isConfigPrint) {
                this.$refs.saveDocPanel.showDialog(quickSave);
            } else {
                if (
                    $('#document-editor-' + this.keyInstance + '_ifr')
                        .contents()
                        .find('.s-control').length > 0
                ) {
                    let allControl = this.editorStore.allControl;
                    let controlPrimaryKey = this.validateControlBeforeSave(
                        allControl,
                        '0'
                    );
                    if (Object.keys(controlPrimaryKey).length > 1) {
                        let allKey = Object.keys(controlPrimaryKey);
                        this.$snotify({
                            type: 'error',
                            title: this.$t('v2.doc.recheckIdentifierFields'),
                            text:
                                this.$t('v2.doc.mustNotHave') +
                                allKey.length +
                                this.$t('v2.doc.identifierFieldInADocCheckControl') +
                                allKey.join(',')
                        });
                    } else {
                        let controlError = $(
                            '#document-editor-' + this.keyInstance + '_ifr'
                        )
                            .contents()
                            .find('.s-control-error');
                        if (controlError.length == 0) {
                            if (
                                this.documentId == undefined ||
                                this.documentId == 0
                            )
                                this.setDocumentProperties({});
                            this.$refs.saveDocPanel.showDialog(quickSave);
                        } else {
                            let listName = [];
                            let thisCpn = this;
                            $.each(controlError, function (key, value) {
                                let id = $(value).attr('id');
                                let elements = $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr'
                                )
                                    .contents()
                                    .find('#' + id);
                                let tableId = checkInTable(elements);
                                if (tableId == id) {
                                    tableId = '0';
                                }
                                let name = '';
                                if (tableId == '0') {
                                    name = allControl[id].properties.name.value;
                                } else {
                                    name =
                                        allControl[tableId].listFields[id]
                                            .properties.name.value;
                                }

                                listName.push(name);
                            });
                            this.$snotify({
                                type: 'error',
                                title: this.$t('v2.doc.nameControlNotValid'),
                                text:
                                    this.$t('v2.doc.has') +
                                    this.$t('v2.doc.invalidConfigControl') +
                                    listName.join(',')
                            });
                        }
                    }
                }
            }
        },
        /**
         * Khi ấn lưu doc -> Hàm kiểm tra các control đã đẩy đủ thông tin về tên và tiêu đề hay chưa
         * nếu chưa thì ko được phép lưu
         */
        validateControlBeforeSave(allControl, tableId) {
            let controlPrimaryKey = {};
            for (let controlId in allControl) {
                if (allControl[controlId].hasOwnProperty('listFields')) {
                    let childPrimary = this.validateControlBeforeSave(
                        allControl[controlId]['listFields'],
                        controlId
                    );
                    controlPrimaryKey = Object.assign(
                        controlPrimaryKey,
                        childPrimary
                    );
                }
                if (
                    listControlNotNameProp.includes(
                        allControl[controlId].type
                    ) == false
                ) {
                    let controlProps = allControl[controlId].properties;
                    if (controlProps.name.value == '') {
                        let controlEl = $(
                            '#document-editor-' + this.keyInstance + '_ifr'
                        )
                            .contents()
                            .find('#' + controlId);
                        controlEl.addClass('s-control-error');
                        this.$store.commit('document/updateProp', {
                            id: controlId,
                            name: 'name',
                            value: this.$t('v2.doc.notBlankControlName'),
                            tableId: tableId,
                            type: 'validateStatus',
                            instance: this.keyInstance
                        });
                    }
                    let title = controlProps.title.value;
                    if (title == '') {
                        let controlEl = $(
                            '#document-editor-' + this.keyInstance + '_ifr'
                        )
                            .contents()
                            .find('#' + controlId);
                        controlEl.addClass('s-control-error');
                        this.$store.commit('document/updateProp', {
                            id: controlId,
                            name: 'title',
                            value: this.$t('v2.doc.notBlankControlTitle'),
                            tableId: tableId,
                            type: 'validateStatus',
                            instance: this.keyInstance
                        });
                    }
                    if (
                        controlProps.hasOwnProperty('isPrimaryKey') &&
                        controlProps.isPrimaryKey.value == true
                    ) {
                        controlPrimaryKey[controlProps.name.value] =
                            allControl[controlId];
                    }
                    if (
                        allControl[controlId].type == 'title' &&
                        (!controlProps.linkControl.value == 'undefined' ||
                            JSON.stringify(controlProps.linkControl.value) ==
                                '{}')
                    ) {
                        let controlEl = $(
                            '#document-editor-' + this.keyInstance + '_ifr'
                        )
                            .contents()
                            .find('#' + controlId);
                        controlEl.addClass('s-control-error');
                        this.$store.commit('document/updateProp', {
                            id: controlId,
                            name: 'title',
                            value: this.$t('v2.doc.notBlankLinkControl'),
                            tableId: tableId,
                            type: 'validateStatus',
                            instance: this.keyInstance
                        });
                    }
                    if (allControl[controlId].type == 'documentInstanceIdentifier' && controlProps.startNumber.value == '') {
                        let controlEl = $(
                            '#document-editor-' + this.keyInstance + '_ifr'
                        )
                            .contents()
                            .find('#' + controlId);
                        controlEl.addClass('s-control-error');
                        this.$store.commit('document/updateProp', {
                            id: controlId,
                            name: 'startNumber',
                            value: this.$t('v2.doc.notBlankStartNumber'),
                            tableId: tableId,
                            type: 'validateStatus',
                            instance: this.keyInstance
                        });
                    }
                }
            }
            return controlPrimaryKey;
        },
        /**
         * Hàm xử lí lấy dữ liệu các công thức để insert vào formulas service trước khi lưu
         * output: dataPost cho syql service
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
                        listControlFormulas.insert
                    );
                    listControlFormulas.update = Object.assign(
                        listFormulasControlInTable.update,
                        listControlFormulas.update
                    );
                }
                let controlName = control.properties.hasOwnProperty('name')
                    ? control.properties.name.value
                    : control.name;
                for (let f in formulas) {
                    if (f == 'linkConfig' || f == 'groupDpm') {
                        let configs = formulas[f]['configData'];
                        if (configs.length > 0) {
                            for (
                                let index = 0;
                                index < configs.length;
                                index++
                            ) {
                                let config = configs[index];
                                let instance = config.formula.instance;
                                let formulaType = f + '_' + instance;
                                if (config.formula.value != '') {
                                    let setFormulaSuccess = this.setFormulasDataPost(
                                        listFormulasUpdate,
                                        listFormulas,
                                        config.formula.id,
                                        config.formula.value,
                                        controlName,
                                        formulaType
                                    );
                                    if(!setFormulaSuccess){
                                        return false
                                    }
                                }
                            }
                        }
                    } else {
                        if (formulas[f].value != '') {
                            let setFormulaSuccess =  this.setFormulasDataPost(
                                listFormulasUpdate,
                                listFormulas,
                                formulas[f].formulasId,
                                formulas[f].value,
                                controlName,
                                f
                            );
                            if(!setFormulaSuccess){
                                return false
                            }
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
        setFormulasDataPost(
            listFormulasUpdate,
            listFormulas,
            formulaId,
            formulaValue,
            controlName,
            formulaType
        ) {
            if(!this.checkValueFormula(formulaType,formulaValue)){
                this.$snotify({
                    type: this.$t('v2.doc.error'),
                    title: this.$t('v2.doc.cannotSaveDocument'),
                    text: 'Control ' + controlName + this.$t('v2.doc.errorControlHaveFormulaUpdate')
                });
                return false
            }
            if (formulaId != 0) {
                if(!(this.oldListFormulas.hasOwnProperty(formulaId) && this.oldListFormulas[formulaId] == formulaValue)){
                    let item = {};
                    item[formulaType] = {};
                    item[formulaType]['syql'] = formulaValue;
                    item[formulaType]['id'] = formulaId;
                    listFormulasUpdate.push(item);
                    this.oldListFormulas[formulaId] = formulaValue
                }
            } else {
                let item = {};
                item[formulaType] = {};
                item[formulaType]['formulas'] = formulaValue;
                item[formulaType]['objectType'] = 'field';
                item[formulaType]['objectIdentifier'] = controlName;
                item[formulaType]['context'] = this.sDocumentProp.name.value;
                listFormulas.push(item);
            }
            return true
        },
        checkValueFormula(formulaType, formulaValue){
            if(!['submit', 'update'].includes(formulaType)){
                console.log(formulaValue);
                console.log(/\s*update\s+[a-z0-9_]+\sset+/gi.test(formulaValue));
                if(/\s*update\s+[a-z0-9_]+\sset+/gi.test(formulaValue)){
                    return false
                }
            }
            return true
        },
        /**
         * Hàm loại bỏ các dữ liệu thừa trong biến lưu danh sách control trong store
         * và lấy lại các control user để lưu vào db phục vụ cho việc hiển thị ngoài danh sách bản ghi (từ id -> tên)
         */
        minimizeControlEL(allControl) {
            var allInputControl = $(
                '#document-editor-' + this.keyInstance + '_ifr'
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
            let listControlDuplicateName = [];
            let listControlNameForCheck = [];
            for (let controlId in allControl) {
                let isCheck = false;
                if (allId.indexOf(controlId) === -1) {
                    delete allControl[controlId];
                    isCheck = true;
                } else {
                    if (allControl[controlId].properties.name) {
                        let controlName =
                            allControl[controlId].properties.name.value;
                        if (
                            listControlNameForCheck.indexOf(controlName) != -1
                        ) {
                            listControlDuplicateName.push(controlName);
                        }
                        listControlNameForCheck.push(controlName);
                    }
                    if (allControl[controlId].type == 'dataFlow') {
                        allControl[controlId].properties.dataFlowId.value = {
                            id: allControl[controlId].properties.dataFlowId.value.id
                        }
                        allControl[controlId].properties.mapOutputDataflow.value = allControl[controlId].properties.mapOutputDataflow.value.filter(v=>v.nodeId)
                    } else if (allControl[controlId].type == 'table') {
                        if (allId.indexOf(controlId) !== -1) {
                            let listField = allControl[controlId].listFields;
                            for (let childControlId in listField) {
                                let childControl = listField[childControlId];
                                if (childControl.properties.name) {
                                    let childControlName =
                                        childControl.properties.name.value;
                                    if (
                                        listControlNameForCheck.indexOf(
                                            childControlName
                                        ) != -1
                                    ) {
                                        listControlDuplicateName.push(
                                            childControlName
                                        );
                                    }
                                    listControlNameForCheck.push(
                                        childControlName
                                    );
                                }
                                if (allId.indexOf(childControlId) === -1) {
                                    delete allControl[controlId].listFields[
                                        childControlId
                                    ];
                                    isCheck = true;
                                }
                                if (!isCheck && childControl.type == 'user') {
                                    allUserControl['user'].push(
                                        childControl.properties.name.value
                                    );
                                }
                                let childControlFormulas =
                                    childControl.formulas;

                                for (let formulaType in childControlFormulas) {
                                    if (
                                        formulaType != 'linkConfig' &&
                                        formulaType != 'groupDpm'
                                    ) {
                                        if (
                                            childControlFormulas[
                                                formulaType
                                            ].value.trim() == ''
                                        ) {
                                            // Khadm thêm việc check có childControlId trong listFields ko
                                            // phục vụ trong trường hợp BA xóa một cột trong table
                                            if (
                                                allControl[controlId]
                                                    .listFields[childControlId]
                                            ) {
                                                allControl[
                                                    controlId
                                                ].listFields[
                                                    childControlId
                                                ].formulas[
                                                    formulaType
                                                ].formulasId = 0;
                                            } else {
                                                console.warn(
                                                    'SYMPER DOCUMENT EDITOR ERROR: can not find control with id ' +
                                                        childControlId
                                                );
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!isCheck && allControl[controlId].type == 'user') {
                        allUserControl['user'].push(
                            allControl[controlId].properties.name.value
                        );
                    }
                    let controlFormulas = allControl[controlId].formulas;
                    for (let formulaType in controlFormulas) {
                        if (
                            formulaType != 'linkConfig' &&
                            formulaType != 'groupDpm'
                        ) {
                            if (
                                controlFormulas[formulaType].value.trim() == ''
                            ) {
                                allControl[controlId].formulas[
                                    formulaType
                                ].formulasId = 0;
                            }
                        }
                    }
                }
            }
            return {
                minimizeControl: allControl,
                userControls: allUserControl,
                listControlDuplicateName: listControlDuplicateName
            };
        },
        getListInputInDoc(allControl, inTable = false) {
            let newAllControl = util.cloneDeep(allControl);
            let listInput = {};
            for (let controlId in newAllControl) {
                let controlName = newAllControl[controlId].properties.name
                    ? newAllControl[controlId].properties.name.value
                    : newAllControl[controlId].type;
                let formulas = newAllControl[controlId].formulas;
                let controlFormulas = {};
                for (let formulaType in formulas) {
                    let formula = formulas[formulaType].value;
                    if(formulaType == 'linkConfig' && formulas[formulaType].configData[0]){
                        formula = formulas[formulaType].configData[0].formula.value
                    }
                    formula = formula.trim();
                    if (formula != '') {
                        formula = formula.replace(/\r?\n|\r/g, ' ');
                        controlFormulas[formulaType] = {};
                        controlFormulas[formulaType].instance = new Formulas(
                            this.keyInstance,
                            formula,
                            formulaType
                        );
                    }
                }
                if (newAllControl[controlId].type == 'table') {
                    let listFields = newAllControl[controlId].listFields;
                    let listTableInput = this.getListInputInDoc(
                        listFields,
                        controlId
                    );
                    Object.assign(listInput, listTableInput);
                }
                newAllControl[controlId]['controlFormulas'] = controlFormulas;
                newAllControl[controlId]['id'] = controlId;
                if (inTable != false) {
                    newAllControl[controlId]['tableId'] = inTable;
                }
                listInput[controlName] = newAllControl[controlId];
            }
            return listInput;
        },
        /**
         * Hàm lấy các mối quan hệ của control từ list công thức
         */
        getControlRelation(allControl) {
            let listInput = this.getListInputInDoc(allControl);
            let mapControlEffected = getMapControlEffected(listInput);
            let controlInfinity = checkInfinityControl(mapControlEffected);
            let impactedFieldsListWhenStart =
                mapControlEffected['impactedFieldsListWhenStart'];
            let rootControl = mapControlEffected['rootControl'];
            let hiddenRootControl = mapControlEffected['hiddenRootControl'];
            let locationRootControl = mapControlEffected['locationRootControl'];
            let dateRootControl = mapControlEffected['dateRootControl'];
            delete mapControlEffected['hiddenRootControl'];
            delete mapControlEffected['impactedFieldsListWhenStart'];
            delete mapControlEffected['rootControl'];
            delete mapControlEffected['locationRootControl'];
            delete mapControlEffected['dateRootControl'];
            if (controlInfinity.length > 0) {
                this.showInfinityControlMessage(controlInfinity);
                return false;
            } else {
                let mapFormulas = mapControlEffected['formulas']
                if (mapControlEffected['suffixDocInstanceIdentifier']){
                    
                    for (let control in mapControlEffected['suffixDocInstanceIdentifier']) {
                        if(!mapFormulas[control]){
                            mapFormulas[control] = {}
                        }
                        Object.assign(mapFormulas[control],mapControlEffected['suffixDocInstanceIdentifier'][control])
                    }
                }
                if(mapControlEffected['prefixDocInstanceIdentifier']){
                    for (let control in mapControlEffected['prefixDocInstanceIdentifier']) {
                        if(!mapFormulas[control]){
                            mapFormulas[control] = {}
                        }
                        Object.assign(mapFormulas[control],mapControlEffected['prefixDocInstanceIdentifier'][control])
                    }
                }
                let newMap = refreshMapEffectedFormulasControl(
                    mapControlEffected['formulas']
                );
                let dataEffectedControl = {};
                for (let type in mapControlEffected) {
                    if (mapTypeToEffectedControl.hasOwnProperty(type)) {
                        for (let controlName in mapControlEffected[type]) {
                            if (
                                !dataEffectedControl.hasOwnProperty(controlName)
                            ) {
                                dataEffectedControl[controlName] = {};
                            }
                            dataEffectedControl[controlName][
                                mapTypeToEffectedControl[type]
                            ] = mapControlEffected[type][controlName];
                        }
                    }
                }
                for (let controlName in dataEffectedControl) {
                    let control = listInput[controlName];
                    if (control) {
                        let controlId = control.id;
                        if (allControl[controlId]) {
                            allControl[controlId].properties[
                                'dataPrepareSubmit'
                            ] = JSON.stringify(
                                dataEffectedControl[controlName]
                            );
                        } else if (control.tableId) {
                            allControl[control.tableId]['listFields'][
                                controlId
                            ].properties['dataPrepareSubmit'] = JSON.stringify(
                                dataEffectedControl[controlName]
                            );
                        }
                    }
                }
                return {
                    impactedFieldsListWhenStart: impactedFieldsListWhenStart,
                    hiddenRootControl: hiddenRootControl,
                    rootControl: rootControl,
                    impactedFieldsList: newMap,
                    locationRootControl: locationRootControl,
                    dateRootControl: dateRootControl
                };
            }
        },
        showInfinityControlMessage(controlInfinity) {
            this.listMessageErr = [];
            this.listMessageErr.push(
                'Mối quan hệ giữa các control sau dẫn đến vòng lặp vô hạn'
            );
            for (let index = 0; index < controlInfinity.length; index++) {
                this.listMessageErr.push(controlInfinity[index]);
            }
            this.$refs.errMessage.showDialog('checkInfinityControl');
        },
        /**
         * hàm hiển thị thông báo dưới dạng panel
         */
        showError(listControl, message, errType) {
            this.listMessageErr = [];
            this.listMessageErr.push(message);
            for (let index = 0; index < listControl.length; index++) {
                this.listMessageErr.push(listControl[index]);
            }
            this.$refs.errMessage.showDialog(errType);
        },
        /**
         * Hàm thực thi api để lưu các công thức và lưu document sau khi check validate hợp lệ
         * update formulas -> insert formulas -> done -> save document
         * các công thức thêm mới sẽ được bind ngược lại vào dữ liệu đẩy lên để lưu doc
         */
        async saveDocument(optionsOnSave) {
            let minimizeControl = this.minimizeControlEL(
                this.editorStore.allControl
            );
            let allControl = minimizeControl.minimizeControl;
            this.getColumnIndexInTable(allControl);
            let listControlDuplicateName =
                minimizeControl.listControlDuplicateName;
            if (listControlDuplicateName.length > 0) {
                this.$refs.actionView.hideLoading();
                this.showError(
                    listControlDuplicateName,
                    'Tồn tại các control trùng tên',
                    'listControlDuplicateName'
                );
                return;
            }
            let controlRelations = this.getControlRelation(allControl);
            if (controlRelations == false) {
                this.$refs.actionView.hideLoading();
                return;
            }
            let userControls = minimizeControl.userControls;
            if (
                this.dataConfigDeleteRow &&
                this.dataConfigDeleteRow.length > 0
            ) {
                userControls['dataConfigDeleteRow'] = this.dataConfigDeleteRow;
            }
            let documentProperties = util.cloneDeep(this.sDocumentProp);
            documentProperties = Object.assign(
                { controlInfo: userControls },
                documentProperties
            );
            documentProperties = JSON.stringify(documentProperties);
            let htmlContent = this.editorCore.getContent() == this.oldContent && this.routeName == 'editDocument' ? '' : this.editorCore.getContent();
            let dataPost = this.getDataToSaveMultiFormulas(allControl);
            if(dataPost == false){
                this.$refs.actionView.hideLoading();
                return
            }
            let thisCpn = this;
            let mobileConfig = this.getDataConfigMobileBeforeSave();
            // console.log('mobileConfig - before-save', mobileConfig)
            try {
                if (Object.keys(dataPost.update).length > 0)
                    await formulasApi.updateMultiFormulas({
                        formulas: JSON.stringify(dataPost.update)
                    });
                if (Object.keys(dataPost.insert).length > 0) {
                    let res = await formulasApi.saveMultiFormulas({
                        formulas: JSON.stringify(dataPost.insert)
                    });
                    if (res.status == 200) {
                        let data = res.data;
                        for (let controlId in data) {
                            for (let i = 0; i < data[controlId].length; i++) {
                                let key = Object.keys(data[controlId][i])[0];
                                let fValue = data[controlId][i][key];
                                let linkInstance = false;
                                if (key.includes('linkConfig')) {
                                    linkInstance = key.split('_')[1];
                                    key = 'linkConfig';
                                } else if (key.includes('groupDpm')) {
                                    linkInstance = key.split('_')[1];
                                    key = 'groupDpm';
                                }
                                let controlEl = $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr'
                                )
                                    .contents()
                                    .find('#' + controlId);
                                let tableId = 0;
                                if (
                                    !controlEl.is('.s-control-table') &&
                                    controlEl.closest('.s-control-table')
                                        .length > 0
                                ) {
                                    tableId = controlEl
                                        .closest('.s-control-table')
                                        .attr('id');
                                }
                                thisCpn.$store.commit(
                                    'document/updateFormulasId',
                                    {
                                        id: controlId,
                                        name: key,
                                        value: fValue,
                                        tableId: tableId,
                                        instance: this.keyInstance,
                                        linkInstance: linkInstance
                                    }
                                );
                                if (tableId != 0 && tableId != '0') {
                                    if (
                                        allControl[tableId]['listFields'][controlId][
                                            'formulas'
                                        ][key]
                                    ) {
                                        if (key == 'linkConfig' || key == 'groupDpm') {
                                            let linkInstance = linkInstance;
                                            let allConfig =
                                                allControl[tableId]['listFields'][
                                                controlId
                                                ]['formulas'][key]['configData'];
                                            for (let index = 0; index < allConfig.length; index++) {
                                                let config = allConfig[index];
                                                if (
                                                    Number(config.formula.instance) == Number(linkInstance)
                                                ) {
                                                    this.oldListFormulas[fValue] = allControl[tableId]['listFields'][controlId]['formulas'][key]['configData'][index]['formula'].value
                                                }
                                            }
                                        } else {
                                            this.oldListFormulas[fValue] = allControl[tableId]['listFields'][controlId]['formulas'][key].value
                                        }
                                    }
                                } else {
                                    if (allControl[controlId]['formulas'][key]) {
                                        if (key == 'linkConfig' || key == 'groupDpm') {
                                            let linkInstance = linkInstance;
                                            let allConfig =
                                                allControl[controlId]['formulas'][key][
                                                    'configData'
                                                ];
                                            for (let index = 0; index < allConfig.length; index++) {
                                                let config = allConfig[index];
                                                if (
                                                    Number(config.formula.instance) == Number(linkInstance)
                                                ) {
                                                    this.oldListFormulas[fValue] = allControl[controlId]['formulas'][key]['configData'][index]['formula'].value
                                                }
                                            }
                                        } else {
                                            this.oldListFormulas[fValue] = allControl[controlId]['formulas'][key].value
                                        }
                                    }
                                }
                            }
                        }
                        if (this.routeName == 'editDocument') {
                            //edit doc
                            this.editDocument({
                                controlRelations:
                                    JSON.stringify(controlRelations),
                                documentProperty: documentProperties,
                                fields: JSON.stringify(allControl),
                                content: htmlContent,
                                id: this.documentId,
                                ...optionsOnSave,
                                mobileConfig: mobileConfig
                            });
                        } else {
                            this.createDocument({
                                controlRelations:
                                    JSON.stringify(controlRelations),
                                documentProperty: documentProperties,
                                fields: JSON.stringify(allControl),
                                content: htmlContent,
                                ...optionsOnSave,
                                mobileConfig: mobileConfig
                            });
                        }
                    } else {
                        this.$refs.actionView.hideLoading();
                        this.$snotify({
                            type: this.$t('v2.doc.error'),
                            title: this.$t('v2.doc.errorFromFormulaService'),
                            text: res.message
                        });
                    }
                } else {
                    if (this.routeName == 'editDocument') {
                        //edit doc
                        this.editDocument({
                            controlRelations: JSON.stringify(controlRelations),
                            documentProperty: documentProperties,
                            fields: JSON.stringify(allControl),
                            content: htmlContent,
                            id: this.documentId,
                            ...optionsOnSave,
                            mobileConfig: mobileConfig
                        });
                    } else {
                        this.createDocument({
                            controlRelations: JSON.stringify(controlRelations),
                            documentProperty: documentProperties,
                            fields: JSON.stringify(allControl),
                            content: htmlContent,
                            ...optionsOnSave,
                            mobileConfig: mobileConfig
                        });
                    }
                }
                this.oldContent = this.editorCore.getContent()
            } catch (error) {
                thisCpn.$refs.actionView.hideLoading();
                console.error('errorerror', error);
                thisCpn.$snotify({
                    type: thisCpn.$t('v2.doc.error'),
                    title: thisCpn.$t('v2.doc.errorFromFormulaService'),
                    text: error
                });
            }
        },
        /**
         * Hàm gọi Api tạo mới ducument
         */
        createDocument(dataPost) {
            let thisCpn = this;
            if (
                this.dataPivotTable &&
                Object.keys(this.dataPivotTable).length > 0
            ) {
                dataPost['pivotConfig'] = JSON.stringify(this.dataPivotTable);
            }
            if (
                this.dataGroupTable &&
                Object.keys(this.dataGroupTable).length > 0
            ) {
                dataPost['groupConfig'] = JSON.stringify(this.dataGroupTable);
            }
            if (
                this.dataMatchingItems &&
                Object.keys(this.dataMatchingItems).length > 0
            ) {
                dataPost['matchingItemsConfig'] = JSON.stringify(
                    this.dataMatchingItems
                );
            }
            documentApi
                .saveDocument(dataPost)
                .then((res) => {
                    thisCpn.$refs.actionView.hideLoading();
                    if (res.status == 200) {
                        thisCpn.editorCore.remove();
                        thisCpn.$router.push('/documents');
                        thisCpn.$snotify({
                            type: 'success',
                            title: thisCpn.$t('v2.doc.saveDocumentSuccess')
                        });
                        thisCpn.$evtBus.$emit('save-document-successful', {
                            type: 'create',
                            documentId: res.data
                        });
                    } else {
                        thisCpn.notifyError(res);
                    }
                })
                .catch((err) => {
                    thisCpn.$refs.actionView.hideLoading();
                    thisCpn.$snotify({
                        type: 'error',
                        title: thisCpn.$t('v2.doc.cannotSaveDocument')
                    });
                })
                .finally(() => {});
        },
        /**
         * Hàm gọi api edit document
         */
        editDocument(dataPost) {
            if (
                this.dataPivotTable &&
                Object.keys(this.dataPivotTable).length > 0
            ) {
                dataPost['pivotConfig'] = JSON.stringify(this.dataPivotTable);
            }
            if (
                this.dataGroupTable &&
                Object.keys(this.dataGroupTable).length > 0
            ) {
                dataPost['groupConfig'] = JSON.stringify(this.dataGroupTable);
            }
            if (
                this.dataMatchingItems &&
                Object.keys(this.dataMatchingItems).length > 0
            ) {
                dataPost['matchingItemsConfig'] = JSON.stringify(
                    this.dataMatchingItems
                );
            }
            let thisCpn = this;
            documentApi
                .editDocument(dataPost)
                .then((res) => {
                    thisCpn.$refs.actionView.hideLoading();
                    if (res.status == 200) {
                        thisCpn.$snotify({
                            type: 'success',
                            title: thisCpn.$t('v2.doc.saveDocumentSuccess')
                        });
                        if (dataPost.isQuickSave) {
                            thisCpn.$refs.actionView.hideLoading();
                        } else {
                            thisCpn.editorCore.remove();
                            thisCpn.$router.push('/documents');
                        }
                    } else {
                        if (res.data && res.data.baId) {
                            accountApi
                                .detailBa(document.userEditting)
                                .then((res) => {
                                    if (res.status == 200) {
                                        let data = res.data;
                                        if (data) {
                                            this.dialog = true;
                                            this.titleDialog =
                                                'BA ' +
                                                data.name +
                                                this.$t('v2.doc.editThisDoc');
                                            this.typeDialog = 'baEditting';
                                            return false;
                                        }
                                    }
                                })
                                .finally({})
                                .catch({});
                        } else {
                            thisCpn.notifyError(res);
                        }
                    }
                })
                .catch((err) => {
                    thisCpn.$refs.actionView.hideLoading();
                    thisCpn.$snotify({
                        type: 'error',
                        title: thisCpn.$t('v2.doc.errorFromEditDocApi'),
                        text: thisCpn.$t('v2.doc.cannotSaveDocument')
                    });
                })
                .finally(() => {});
        },
        notifyError(res) {
            let error = '';
            if (res.errors.length > 0) {
                error = res.errors.join('; ');
            }
            this.showErrorNoti = true;
            this.errorContent = error;
            this.$snotify({
                type: 'error',
                title: res.message,
                text: res.lastErrorMessage
            });
        },
        // lưu lại vị trí các control trong table, export excel cần theo thứ tự này
        getColumnIndexInTable(allControl) {
            for (let key in allControl) {
                if (allControl[key]['type'] == 'table') {
                    let columns = [];
                    let controlEl = $(
                        '#document-editor-' + this.keyInstance + '_ifr'
                    )
                        .contents()
                        .find('#' + key);
                    let allInput = controlEl.find('.s-control');
                    allInput.each(function () {
                        let id = $(this).attr('id');
                        let field = allControl[key]['listFields'][id];
                        let fieldName = field.properties.name.value;
                        let isHidden = field.properties.isHidden.value;
                        if (!isHidden && field.properties.enableExportExcel && field.properties.enableExportExcel.value) {
                            columns.push({ field: fieldName });
                        }
                    });
                    let info = { columns: columns };
                    allControl[key].properties['otherInfo'] =
                        JSON.stringify(info);
                }
            }
        },
        /**
         * hàm validate lại cntrol lần nữa sau khi ấn lưu doc ở modal save doc
         */
        validateControlAfterSave(optionsOnSave) {
            this.$refs.actionView.showLoading();
            let thisCpn = this;
            this.listMessageErr = [];
            //check trung ten control
            $('#document-editor-' + thisCpn.keyInstance + '_ifr')
                .contents()
                .find('.on-selected')
                .removeClass('on-selected');
            if (
                $('#document-editor-' + thisCpn.keyInstance + '_ifr')
                    .contents()
                    .find('.s-control-error').length == 0
            ) {
                this.saveDocument(optionsOnSave);
            } else {
                this.$refs.actionView.hideLoading();
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.doc.invalidControlInformation'),
                    text: this.$t('v2.doc.checkNameControls')
                });
            }
        },

        // hàm xử lí thêm các cột vào trong control table khi lưu ở popup tablesetting
        afterSaveConfigTable(data) {
            let listRowData = data.listRows;
            let tablePivotConfig = data.tablePivotConfig;
            let matchingItemsConfig = data.matchingItemsConfig;
            let tableGroupConfig = data.tableGroupConfig;
            this.dataConfigDeleteRow = data.listItemDeleteConfig;
            let elements = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.s-control-table.on-selected');
            let table = elements.find('thead').closest('.s-control-table');
            let tableId = table.attr('id');
            let currentControl = this.editorStore.currentSelectedControl;
            if (currentControl.properties.name.name.value && tablePivotConfig) {
                if (!this.dataPivotTable) {
                    this.dataPivotTable = {};
                }
                this.dataPivotTable[currentControl.properties.name.name.value] =
                    tablePivotConfig;
            } else {
                if (
                    this.dataPivotTable &&
                    this.dataPivotTable[
                        currentControl.properties.name.name.value
                    ]
                ) {
                    delete this.dataPivotTable[
                        currentControl.properties.name.name.value
                    ];
                }
            }
            if (
                currentControl.properties.name.name.value &&
                matchingItemsConfig
            ) {
                this.dataMatchingItems[
                    currentControl.properties.name.name.value
                ] = matchingItemsConfig;
            } else {
                if (
                    this.dataMatchingItems &&
                    this.dataMatchingItems[
                        currentControl.properties.name.name.value
                    ]
                ) {
                    delete this.dataMatchingItems[
                        currentControl.properties.name.name.value
                    ];
                }
            }
            if (currentControl.properties.name.name.value && tableGroupConfig) {
                if (!this.dataGroupTable) {
                    this.dataGroupTable = {};
                }
                this.dataGroupTable[currentControl.properties.name.name.value] =
                    util.cloneDeep(tableGroupConfig);
            } else {
                if (
                    this.dataGroupTable &&
                    this.dataGroupTable[
                        currentControl.properties.name.name.value
                    ]
                ) {
                    delete this.dataGroupTable[
                        currentControl.properties.name.name.value
                    ];
                }
            }
            let thead = '';
            let tbody = '';
            for (let i = 0; i < listRowData.length; i++) {
                let row = listRowData[i];
                let type = row.type;
                let control = GetControlProps(type);
                control = this.multilinguePropertiesControl(control,type);
                if (row.oldProps) {
                    control.properties = row.oldProps;
                }
                if (row.formulas) {
                    control.formulas = row.formulas;
                }
                control.properties.name.value = row.name;
                control.properties.title.value = row.title;
                let controlEl = $(control.html);

                controlEl.attr('id', row.key);
                thead += `<th>` + row.columnName + `</th>`;
                tbody += `<td>` + controlEl[0].outerHTML + `</td>`;
                this.addToAllControlInTable(
                    row.key,
                    {
                        properties: control.properties,
                        formulas: control.formulas,
                        type: type
                    },
                    tableId
                );
            }
            elements.find('thead tr').html(thead);
            elements.find('tbody tr').html(tbody);
        },

        // Hàm hiển thị khung drag table trong editor
        showDragTable(e) {
            let elements = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.on-selected')
                .closest('.s-control-table');
            if (elements.is('.s-control-table')) {
                if (elements.find('.drag-table').length > 0) {
                    elements.find('.drag-table').remove();
                } else {
                    elements.prepend('<p class="drag-table">Drag here</p>');
                }
            }
        },

        /**
         * sự kiện từ modal save control template
         * lưu control template
         * @input : {allInputs : thông tin tiêu đề control template}
         */
        saveControlTemplate(allInputs) {
            let title = allInputs.title.value;
            let content = this.editorCore.selection.getContent();
            let allControlProps = {};
            if (this.routeName == 'editControlTemplate') {
                content = this.editorCore.getContent();
                let allControlInForm = $(content).find('.s-control');
                for (let index = 0; index < allControlInForm.length; index++) {
                    const element = allControlInForm[index];
                    let controlId = $(element).attr('id');
                    allControlProps[controlId] =
                        this.editorStore['allControl'][controlId];
                }
                this.callApiSaveControlTemplate(
                    title,
                    content,
                    allControlProps
                );
            } else {
                if (content) {
                    let allControlInForm = $(content).find('.s-control');
                    for (
                        let index = 0;
                        index < allControlInForm.length;
                        index++
                    ) {
                        const element = allControlInForm[index];
                        let controlId = $(element).attr('id');
                        allControlProps[controlId] =
                            this.editorStore['allControl'][controlId];
                    }
                    this.callApiSaveControlTemplate(
                        title,
                        content,
                        allControlProps
                    );
                } else {
                    let currentControl =
                        this.editorStore.currentSelectedControl;
                    if (currentControl.properties.name.hasOwnProperty('name')) {
                        let id = currentControl.id;
                        allControlProps[id] =
                            this.editorStore['allControl'][id];
                        content = $(
                            '#document-editor-' + this.keyInstance + '_ifr'
                        )
                            .contents()
                            .find('#' + id)
                            .clone()
                            .wrap('<div></div>')
                            .parent()
                            .html();
                        this.callApiSaveControlTemplate(
                            title,
                            content,
                            allControlProps,
                            true
                        );
                    } else {
                        this.$snotify({
                            type: 'error',
                            title: this.$t(
                                'document.validate.emptyContentControlTemplate'
                            )
                        });
                    }
                }
            }
        },
        /**
         * Api lưu control template
         * @input : {title : tiêu đề control template, content: html, controlProps: thông tin các control có trong đó nếu có}
         */
        callApiSaveControlTemplate(
            title,
            content,
            controlProps,
            isSingleControl = false
        ) {
            let self = this;
            let dataPost = {
                title: title,
                content: content,
                controlProps: JSON.stringify(controlProps)
            };
            if (isSingleControl) {
                dataPost['isSingleControl'] = 1;
            }

            if (this.routeName == 'editControlTemplate') {
                documentApi
                    .editControlTemplate(this.controlTemplateId, dataPost)
                    .then((res) => {
                        self.$refs.formModalView.hide();
                        if (res.status == 200) {
                            this.$snotify({
                                type: 'success',
                                title: this.$t('v2.doc.saveTemplateControlSuccess')
                            });
                        } else {
                            this.$snotify({
                                type: 'error',
                                title: res.message
                            });
                        }
                    });
            } else {
                documentApi.saveControlTemplate(dataPost).then((res) => {
                    self.$refs.formModalView.hide();
                    if (res.status == 200) {
                        this.$snotify({
                            type: 'success',
                            title: this.$t('v2.doc.saveTemplateControlSuccess')
                        });
                        let allControlTemplate =
                            self.editorStore.allControlTemplate;
                        let control = res.data;
                        control.ba_create = control.baCreate;
                        control.create_at = control.createAt;
                        allControlTemplate.push(control);
                        self.$store.commit(
                            'document/addToDocumentEditorStore',
                            {
                                key: 'allControlTemplate',
                                value: allControlTemplate,
                                instance: self.keyInstance
                            }
                        );
                    } else {
                        this.$snotify({
                            type: 'error',
                            title: res.message
                        });
                    }
                });
            }
        },
        /**
         * Hàm xoay trang
         */
        rotatePage() {
            let h = $('#document-editor-' + this.keyInstance + '_ifr').width();
            let w = $('#document-editor-' + this.keyInstance + '_ifr').height();
            $('#document-editor-' + this.keyInstance + '_ifr').css({
                width: w,
                height: h
            });
            $('.tox-sidebar-wrap').css({ 'max-width': w, height: h });
            this.contentStyle.width =
                Math.round(((w * 2.54) / 96) * 10) / 10 + 'cm';
            this.contentStyle.height =
                Math.round(((h * 2.54) / 96) * 10) / 10 + 'cm';
            if (w > h) {
                this.contentStyle.page = 'landscape';
            } else {
                this.contentStyle.page = 'portrait';
            }
            this.$store.commit('document/updateDocumentState', {
                instance: this.keyInstance,
                state: 'documentStyle',
                value: this.contentStyle
            });
        },
        /**
         * Hàm đặt kích thước cho trang A3 A4 A5
         */
        setPageSize(w, h, type) {
            $('#document-editor-' + this.keyInstance + '_ifr').css({
                width: w,
                height: h
            });
            $('.tox-sidebar-wrap').css({ 'max-width': w, height: h });
            this.contentStyle.width = w;
            this.contentStyle.height = h;
            this.contentStyle.type = type;
            this.$store.commit('document/updateDocumentState', {
                instance: this.keyInstance,
                state: 'documentStyle',
                value: this.contentStyle
            });
        },

        //hoangnd: hàm mở modal tablesetting của control table
        showSettingControlTable(e) {
            $('.tox-pop').css({ display: 'none' });
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
                        if ($(tbody[i].innerHTML).length == 0) {
                            continue;
                        }
                        let idControl = $(tbody[i].outerHTML)
                            .find('.s-control')
                            .attr('id');
                        let typeControl = $(tbody[i].outerHTML)
                            .find('.s-control')
                            .attr('s-control-type');
                        let controlObj =
                            this.editorStore.allControl[tableId]['listFields'][
                                idControl
                            ];
                        let name = controlObj.properties.name.value;
                        let title = controlObj.properties.title.value;
                        let row = {
                            columnName: $(thead[i]).text(),
                            name: name,
                            title: title,
                            type: typeControl,
                            key: idControl,
                            oldProps: controlObj.properties,
                            formulas: controlObj.formulas
                        };
                        listData.push(row);
                    }
                }
                this.$refs.tableSetting.showDialog();
                let currentControl = this.editorStore.currentSelectedControl;
                if (
                    currentControl.properties.name.name.value &&
                    this.dataPivotTable &&
                    this.dataPivotTable[
                        currentControl.properties.name.name.value
                    ]
                ) {
                    this.defaultTablePivotConfig =
                        this.dataPivotTable[
                            currentControl.properties.name.name.value
                        ];
                }
                if (
                    currentControl.properties.name.name.value &&
                    this.dataMatchingItems &&
                    this.dataMatchingItems[
                        currentControl.properties.name.name.value
                    ]
                ) {
                    this.defaultMatchingItems =
                        this.dataMatchingItems[
                            currentControl.properties.name.name.value
                        ];
                }
                if (
                    currentControl.properties.name.name.value &&
                    this.dataGroupTable &&
                    this.dataGroupTable[
                        currentControl.properties.name.name.value
                    ]
                ) {
                    this.defaultTableGroupConfig = util.cloneDeep(
                        this.dataGroupTable[
                            currentControl.properties.name.name.value
                        ]
                    );
                } else {
                    this.defaultTableGroupConfig = {
                        cols: [],
                        rows: [],
                        showGroupName: false,
                        values: []
                    };
                }
                this.$refs.tableSetting.setListRow(listData);
            }
        },

        // hàm add các thuộc tính và formulas của control vào danh sách các control trong doc được lưu trong state
        addToAllControlInDoc(controlId, control) {
            this.$store.commit('document/addControl', {
                id: controlId,
                props: control,
                instance: this.keyInstance
            });
        },
        // hàm add các thuộc tính và formulas của control vào danh sách các control trong table được lưu trong state
        addToAllControlInTable(controlId, control, tableId) {
            this.$store.commit('document/addControlToTable', {
                id: controlId,
                props: control,
                tableId: tableId,
                instance: this.keyInstance
            });
        },
        // hàm set tên và title, options đã có cho control title
        setInfoControlTitle(id, properties) {
            let options = [];
            let controlTitle = $(
                '#document-editor-' + this.keyInstance + '_ifr'
            )
                .contents()
                .find('#' + id);
            let linkControlId = controlTitle.attr('control-link-id');
            if (linkControlId) {
                let linkControl = this.editorStore.allControl[linkControlId];
                if (linkControl) {
                    let linkControlName = linkControl.properties.name.value;
                    let linkControlTitle = linkControl.properties.title.value;
                    properties['linkControl'].value = {
                        id: linkControlName,
                        name: linkControlTitle
                    };
                    properties['name'].value =
                        controlTitle.attr('control-title-name') ? controlTitle.attr('control-title-name') : properties['name'].value;
                    properties['title'].value = controlTitle.attr(
                        'control-title-title'
                    );
                }
            }
            const exceptName = [
                'title',
                'table',
                'submit',
                'approvalHistory',
                'reset',
                'draft'
            ];
            Object.keys(this.editorStore.allControl).map((controlId) => {
                let control = this.editorStore.allControl[controlId];
                if (control.properties.name) {
                    let nameControl = control.properties.name.value;
                    if (nameControl && !exceptName.includes(control.type)) {
                        options.push({
                            id: nameControl,
                            name: control.properties.title.value
                        });
                    }
                }
            });
            properties['linkControl'].options = options;
        },
        // set config cho phần sidebar phải các thuộc tính control đang được click
        selectControl(properties, formulas, id, type) {
            if (type == 'dataFlow' && properties['dataFlowId'].value.id) {
                let curDataFlow = this.listDataFlow.filter((df) => {
                    return df.id == properties['dataFlowId'].value.id;
                });
                if (curDataFlow && curDataFlow.length > 0)
                    properties['dataFlowId'].value = curDataFlow[0];
                properties['dataFlowId'].options = this.listDataFlow;
                let controls = [];
                let controlOutTable = [];
                let allControl = this.editorStore.allControl;
                Object.keys(allControl).map((ctrId) => {
                    let typeControl = allControl[ctrId].type;
                    if (
                        ![
                            'submit',
                            'approvalHistory',
                            'reset',
                            'draft',
                            'dataFlow'
                        ].includes(typeControl)
                    ) {
                        controlOutTable.push({
                            id: ctrId,
                            name: allControl[ctrId].properties.name
                                ? allControl[ctrId].properties.name.value
                                : ''
                        });
                        controls.push({
                            type: typeControl,
                            children: allControl[ctrId].listFields
                                ? allControl[ctrId].listFields
                                : [],
                            id: ctrId,
                            name: allControl[ctrId].properties.name
                                ? allControl[ctrId].properties.name.value
                                : ''
                        });
                        if (typeControl == 'table') {
                            controls.push({
                                type: typeControl,
                                children: allControl[ctrId].listFields
                                    ? allControl[ctrId].listFields
                                    : [],
                                id: ctrId,
                                name: allControl[ctrId].properties.name
                                    ? allControl[ctrId].properties.name.value
                                    : ''
                            });
                        }
                    }
                });
                properties['mapInputDataflow'].options.controls = controls;
                properties['mapParamsDataflow'].lists.control = controlOutTable;
                this.updateNameControlAndDataflow(properties);
            }
            if (type == 'title') {
                this.setInfoControlTitle(id, properties);
            }
            if (
                this.$getRouteName() == 'editDocument' &&
                properties &&
                properties.isPreventedConfig
            ) {
                properties.isPreventedConfig.hidden = true;
            }
            if (
                properties &&
                properties.isPreventedConfig &&
                properties.isPreventedConfig.value
            ) {
                for (
                    let index = 0;
                    index < propsNotChangeForTaskManager.length;
                    index++
                ) {
                    const prop = propsNotChangeForTaskManager[index];
                    properties[prop].disabled = true;
                }
            }
            // trường hợp form in
            if (this.isConfigPrint) {
                let controlStyle = $(
                    '#document-editor-' + this.keyInstance + '_ifr'
                )
                    .contents()
                    .find('#' + id)[0].style.cssText;
                if (controlStyle) {
                    controlStyle.split(';').map((style) => {
                        let property = style.split(':')[0];
                        let val = style.split(':')[1];
                        if (property == 'font-size') {
                            properties.fontSize.value = val.trim();
                        } else {
                            if (properties[property]) {
                                properties[property].value = val.trim();
                            }
                        }
                    });
                }
            }
            this.$store.commit('document/addCurrentControl', {
                properties: properties,
                formulas: formulas,
                id: id,
                type: type,
                instance: this.keyInstance
            });
        },
        // cập nhật lại tên của control và dataflow sau mỗi lần click dataflow
        updateNameControlAndDataflow(properties) {
            const self = this;
            properties['mapInputDataflow'].value.map((v, vId) => {
                let checkExistDataflowField = properties[
                    'mapInputDataflow'
                ].options.nodeLoads.filter((node) => node.id == v.node); // trường hợp dataflow bị xóa
                properties['mapInputDataflow'].value[vId].mapping.map(
                    (map, mapId) => {
                        if (v.control) {
                            if (
                                self.editorStore.allControl[v.control].type !=
                                'table'
                            ) {
                                properties['mapInputDataflow'].value[
                                    vId
                                ].mapping[mapId].control =
                                    self.editorStore.allControl[
                                        map.controlId
                                    ].properties.name.value;
                            } else {
                                let fieldChil =
                                    self.editorStore.allControl[v.control]
                                        .listFields;
                                if (fieldChil[map.controlId]) {
                                    properties['mapInputDataflow'].value[
                                        vId
                                    ].mapping[mapId].control = util.cloneDeep(
                                        fieldChil[map.controlId].properties.name
                                            .value
                                    );
                                }
                            }
                            //
                        }
                        if (checkExistDataflowField.length == 0) {
                            properties['mapInputDataflow'].value[vId].mapping[
                                mapId
                            ].fieldDataflow = '';
                        }
                    }
                );
            });
            // kiểm tra nếu rỗng thì tự động thêm dòng
            if (properties['mapInputDataflow'].value.length == 0) {
                properties['mapInputDataflow'].value = [
                    {
                        node: '',
                        control: '',
                        mapping: [
                            { fieldDataflow: '', control: '', controlId: '' }
                        ]
                    }
                ];
            }
            if (properties['mapParamsDataflow'].value.length == 0) {
                properties['mapParamsDataflow'].value = [
                    { control: '', controlId: '', paramDataflow: '' }
                ];
            }
            if (properties['mapOutputDataflow'].value.length == 0) {
                properties['mapOutputDataflow'].value = [
                    { node: '', title: '', nodeId: '' }
                ];
            }
        },
        resetSelectControl() {
            this.$store.commit('document/resetCurrentControl', {
                instance: this.keyInstance
            });
        },
        hideAutocompletaControl() {
            $('.list-control-autocomplete').css({
                display: 'none'
            });
        },
        //hoangnd : hàm được gọi từ AutoCompleteControl component để insert 1 control
        insertControl(type) {
            this.hideAutocompletaControl();
            let contentNode = $(this.editorCore.selection.getNode())[0]
                .innerHTML;
            let control = GetControlProps(type);
            control = this.multilinguePropertiesControl(control,type);
            var checkDiv = $(control.html);
            var inputid = 's-control-id-' + Date.now();
            checkDiv.attr('id', inputid);
            if (checkDiv.attr('s-control-type') != 'table') {
                checkDiv.attr('contenteditable', false);
            }
            let newContent = contentNode.replace(
                /\/{2}$/,
                checkDiv[0].outerHTML
            );

            $(this.editorCore.selection.getNode()).html(
                newContent + '&nbsp;<span id = "caret_pose_holder"> </ span>'
            );
            let table = $(this.editorCore.selection.getNode()).closest(
                '.s-control-table'
            );
            this.selectControl(
                control.properties,
                control.formulas,
                inputid,
                type
            );
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
                        type: type
                    },
                    tableId
                );
            } else {
                this.addToAllControlInDoc(inputid, {
                    properties: control.properties,
                    formulas: control.formulas,
                    type: type
                });
            }
        },
        // hoangnd: hàm nhận sự kiện keyup của editor
        // gõ // để mở autocomplete thêm control
        // 191: / để thêm control

        keyHandler(event, ed) {
            let thisCpn = this;
            if (event.keyCode == 191) {
                var thisKeypressTime = new Date();
                if (thisKeypressTime - this.lastKeypressTime <= 500) {
                    var scroll_top = $(
                        '#document-editor-' + thisCpn.keyInstance + '_ifr'
                    )
                        .contents()
                        .scrollTop();
                    var nodePosition = $(
                        thisCpn.editorCore.selection.getNode()
                    ).position();
                    var off = $(
                        thisCpn.editorCore.selection.getNode()
                    ).offset();
                    var top = nodePosition.top;
                    var left = nodePosition.left;
                    var width_toolbox = $(
                        '.sym-document__side-bar-left'
                    ).width();
                    let marginDoc = $('.tox-sidebar-wrap')
                        .css('marginLeft')
                        .replace('px', '');
                    $('.list-control-autocomplete').css({
                        top: top + 120 - scroll_top,
                        left: left + width_toolbox + parseInt(marginDoc)
                    });
                    setTimeout(function () {
                        $('.list-control-autocomplete').css({
                            display: 'block'
                        });
                    }, 10);
                    setTimeout(() => {
                        $(
                            '.list-control-autocomplete .tf-search-control'
                        ).focus();
                    }, 100);

                    thisKeypressTime = 0;
                }
                this.lastKeypressTime = thisKeypressTime;
            }
        },
        /**
         * detect keyup delete
         * không cho xóa các control đã được đánh dấu ko được chỉnh sửa
         */
        keyDownHandler(e, ed) {
            if (event.keyCode == 8) {
                let allData = this.editorCore.undoManager.data;
                let dataDeleted = allData[allData.length - 1];
                let curNode = $(ed.selection.getNode());
                let allControlInNode = curNode.find(
                    '.s-control:not(.s-control-table .s-control)'
                );
                for (let index = 0; index < allControlInNode.length; index++) {
                    let controlEl = $(allControlInNode[index]);
                    let controlId = controlEl.attr('id');
                    let controlStore = this.editorStore.allControl[controlId];
                    if (
                        controlStore.properties.isPreventedConfig &&
                        controlStore.properties.isPreventedConfig.value
                    ) {
                        this.$snotify({
                            type: 'warn',
                            title: this.$t('v2.doc.cannotDeleteDataContainControlSystem')
                        });
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            }
        },
        /**
         * Hàm xử lí sự kiên click vào tab bên trên header của control tab/page để chuyển tab
         */
        handleClickTabInControlTab(elTarget) {
            elTarget.siblings().removeClass('tab-active');
            elTarget.addClass('tab-active');
            let tabId = elTarget.attr('id');
            elTarget
                .closest('.page-content')
                .find('.page-content-body .content-active')
                .removeClass('content-active');
            elTarget
                .closest('.page-content')
                .find('.page-content-body [tab-id="' + tabId + '"]')
                .addClass('content-active');
        },
        /**
         * Hàm xử lí sự kiên click vào nút add tab bên trên header của control tab/page để thêm tab
         */
        handleClickAddTabInControlTab(elTarget) {
            if (
                elTarget.closest('.page-content-header').find('.tab button')
                    .length < 8
            ) {
                elTarget
                    .closest('.page-content-header')
                    .find('.tab br')
                    .remove();
                let lastTab = elTarget
                    .closest('.page-content-header')
                    .find('.tab button')
                    .last();
                let newTabIndex = parseInt(lastTab.attr('tab-index')) + 1;
                let activeClass = '';
                let contentActiveClass = '';
                if (isNaN(newTabIndex)) {
                    newTabIndex = 1;
                    activeClass = 'tab-active';
                    contentActiveClass = 'content-active';
                    elTarget
                        .closest('.page-content')
                        .find('.page-content-body .content-active')
                        .removeClass('content-active');
                }
                let tabId = 's-control-id-' + Date.now();
                let newTabHtml =
                    '<button s-control-type="tab" id="' +
                    tabId +
                    '" class="s-control ' +
                    activeClass +
                    '" class="tab-item" contenteditable="true" tab-index="' +
                    newTabIndex +
                    '">&nbsp;Tab-' +
                    newTabIndex +
                    '</button>';

                let contentPageHtml =
                    ` <div tab-id="` +
                    tabId +
                    `" contenteditable="true" class="tabcontent ` +
                    contentActiveClass +
                    `">
                                            <div></div>
                                        </div>`;
                elTarget
                    .closest('.page-content-header')
                    .find('.tab')
                    .append(newTabHtml);
                elTarget
                    .closest('.page-content')
                    .find('.page-content-body')
                    .append(contentPageHtml);
                let curPageName = elTarget
                    .closest('.page-content')
                    .attr('page-name');
                let control = GetControlProps('tab');
                control = this.multilinguePropertiesControl(control,'tab');
                control.properties.title.value = 'Tab-' + newTabIndex;
                control.properties.name.value =
                    curPageName + '_t_' + newTabIndex;
                this.addToAllControlInDoc(tabId, {
                    properties: control.properties,
                    formulas: control.formulas,
                    type: 'tab'
                });
            }
        },
        /**
         * Hàm xử lí sự kiên click vào nút thêm page bên sidebar của control tab/page để thêm page
         */
        handleClickAddPageInControlTab(elTarget) {
            let totalPage = elTarget
                .closest('.sidebar-page')
                .find('.list-page .page-item').length;
            let lastPage = elTarget
                .closest('.sidebar-page')
                .find('.page-item')
                .last();
            let heightOnePage = lastPage.height();
            let newPageIndex = parseInt(lastPage.attr('page-index')) + 1;
            elTarget
                .closest('.s-control-tab-page')
                .find('.page-active')
                .removeClass('page-active');
            elTarget
                .closest('.s-control-tab-page')
                .find('.sb-page-active')
                .removeClass('sb-page-active');
            if (isNaN(newPageIndex)) {
                newPageIndex = 1;
            }
            let pageId = 's-control-id-' + Date.now();
            let newPageHtml =
                `<div s-control-type="page" class="s-control page-item sb-page-active" page-index="` +
                newPageIndex +
                `" id="` +
                pageId +
                `">
                                <span class="icon-page mdi mdi-format-page-break"></span>
                                <span class="page-item__name">${this.$t('v2.doc.pageNumber')}` +
                newPageIndex +
                `</span>
                                <span class="delete-page-icon mdi mdi-window-close"></span>
                            </div>`;

            let contentPageHtml =
                ` <div class="page-content page-active" s-page-content-id="` +
                pageId +
                `" page-name="pg_` +
                newPageIndex +
                `">
                                        <div class="page-content-header">
                                            <button class="add-tab-btn">+ ${this.$t('v2.doc.addTab')}</button>
                                            <div class="tab">
                                            
                                            </div>
                                        </div>
                                        <div class="page-content-body">
                                            
                                        </div>
                                    </div>`;
            elTarget
                .closest('.sidebar-page')
                .find('.list-page')
                .append(newPageHtml);
            elTarget
                .closest('.s-control-tab-page')
                .find('.list-page-content')
                .append(contentPageHtml);
            let control = GetControlProps('page');
            control = this.multilinguePropertiesControl(control,'page');
            control.properties.title.value = this.$t('v2.doc.pageNumber') + newPageIndex;
            control.properties.name.value = 'pg_' + newPageIndex;
            this.addToAllControlInDoc(pageId, {
                properties: control.properties,
                formulas: control.formulas,
                type: 'page'
            });
            if (totalPage > 6) {
                let controlPageHeight = elTarget
                    .closest('.s-control-tab-page')
                    .height();
                let totalHeight = controlPageHeight + heightOnePage + 12;
                elTarget.closest('.sidebar-page').height(totalHeight);
                elTarget.closest('.s-control-tab-page').height(totalHeight);
            }
        },
        handleClickDeletePageInControlTab(elTarget) {
            let totalPage = elTarget
                .closest('.s-control-tab-page')
                .find('.list-page .page-item').length;
            let controlPageHeight = 30 * totalPage + 10;
            elTarget
                .closest('.s-control-tab-page')
                .find('.sidebar-page')
                .height(controlPageHeight);
            elTarget.closest('.s-control-tab-page').height(controlPageHeight);
            let pageId = elTarget.attr('id');
            elTarget
                .closest('.s-control-tab-page')
                .find('[s-page-content-id="' + pageId + '"]')
                .remove();
            elTarget.remove();
        },
        /**
         * Hàm xử lí sự kiên click vào page bên sidebar của control tab/page để chuyển page
         */
        handleClickPageInControlTab(elTarget) {
            elTarget.siblings().removeClass('sb-page-active');
            elTarget.addClass('sb-page-active');
            let pageId = elTarget.attr('id');
            elTarget
                .closest('.s-control-tab-page')
                .find('.list-page-content .page-content')
                .removeClass('page-active');
            elTarget
                .closest('.s-control-tab-page')
                .find('.list-page-content')
                .find('[s-page-content-id="' + pageId + '"]')
                .addClass('page-active');
        },
        /**
         * Hàm click đóng mở sidebar của control tab/page
         */
        handleClickCollapseInControlTab(elTarget) {
            elTarget.toggleClass('rotate-180');
            elTarget.closest('.sidebar-page').toggleClass('collapse-sb');
            elTarget
                .closest('.sidebar-page')
                .find('.page-item__name')
                .toggleClass('d-none');
            let curSideBar = elTarget
                .closest('.s-control-tab-page')
                .find('.sidebar-page');
            let curSideBarWidth = curSideBar.is('.collapse-sb') ? 30 : 150;

            elTarget
                .closest('.s-control-tab-page')
                .find('.list-page-content')
                .css({ width: 'calc(100% - ' + curSideBarWidth + 'px )' });
        },
        //su kiện click vào editor
        detectClickEvent(event) {
            event.preventDefault();
            event.stopPropagation();
            if ($(event.target).closest('.s-control-table').length == 0) {
                if (
                    $(event.target).closest('body').find('.drag-table').length >
                    0
                ) {
                    $(event.target)
                        .closest('body')
                        .find('.drag-table')
                        .remove();
                }
            }
            if ($(event.target).is('.s-control')) {
                this.setSelectedControlProp(
                    event,
                    $(event.target),
                    $('#document-editor-' + this.keyInstance + '_ifr').get(0)
                        .contentWindow
                );
            } else if ($(event.target).closest('.s-control').length > 0) {
                this.setSelectedControlProp(
                    event,
                    $(event.target).closest('.s-control'),
                    $('#document-editor-' + this.keyInstance + '_ifr').get(0)
                        .contentWindow
                );
            }
            if ($(event.target).is('.tab button')) {
                this.handleClickTabInControlTab($(event.target));
            }
            if ($(event.target).is('.add-tab-btn')) {
                this.handleClickAddTabInControlTab($(event.target));
            }
            if ($(event.target).closest('.add-page-btn').length) {
                this.handleClickAddPageInControlTab(
                    $(event.target).closest('.add-page-btn')
                );
            }
            if ($(event.target).closest('.collapse-sidebar-btn').length > 0) {
                this.handleClickCollapseInControlTab(
                    $(event.target).closest('.collapse-sidebar-btn')
                );
            }
            if ($(event.target).closest('.page-item').length > 0) {
                this.handleClickPageInControlTab(
                    $(event.target).closest('.page-item')
                );
            }
            if ($(event.target).closest('.delete-page-icon').length > 0) {
                // this.handleClickDeletePageInControlTab($(event.target).closest('.page-item'))
                this.currentPageActive = $(event.target).closest('.page-item');
                this.showDialogEditor('deletePage', this.$t('v2.doc.confirmDelete'));
            }

            if ($(event.target).is('.icon-page')) {
                let position = {
                    top: event.pageY + 100 + 'px',
                    left: event.screenX + 'px'
                };
                this.currentTabSelectedIcon = $(event.target);
                this.$refs.materialIconPicker.show(position);
            }
            if (
                !$(event.target).is('.icon-page') &&
                $(event.target).closest('.card-icon-material').length == 0
            ) {
                this.$refs.materialIconPicker.hide();
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
        /**
         * Hàm nhận sự kiện ném ra từ compon material icon sau khi chọn icon
         */
        selectedIcon(data) {
            let context = this.$refs.materialIconPicker.getContext();
            if (context == 'toolbar') {
                this.editorCore.insertContent(
                    '&nbsp;<span class="mdi ' + data + '"></span>&nbsp;'
                );
            } else {
                this.currentTabSelectedIcon.removeClass();
                this.currentTabSelectedIcon.addClass('icon-page mdi ' + data);
            }
            this.$refs.materialIconPicker.hide();
        },
        // hàm click ra ngoài editor thì cập nhật lại dữ liệu của store
        detectBlurEditorEvent(event) {
            this.saveContentToLocalStorage();
            let allControlEl = $(
                '#document-editor-' + this.keyInstance + '_ifr'
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
                instance: this.keyInstance
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
                    'px'
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
                top: '0'
            });
        },
        resizeEditorEnd(e) {
            $('#bg-over-editor').remove();
        },
        /**
         * Hàm xử lí chuyển cấu trúc doc của v1 sang v2 (bao gồm các thuộc tính của control)
         */
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
            $.each(allControl, function (item, value) {
                let controlProps = $(value).attr('data-property');
                controlProps = controlProps.replace(/\"\[/gm, '[');
                controlProps = controlProps.replace(/\]\"/gm, ']');
                let type = $(value).attr('bkerp-type');
                let style = $(value).attr('style');
                if (type == 'text') type = 'textInput';
                if (type == 'persent') type = 'percent';
                if (type == 'datetime') type = 'dateTime';
                if (type == 'file-upload') type = 'fileUpload';
                let controlV2 = GetControlProps(type);
                controlV2 = thisCpn.multilinguePropertiesControl(controlV2,type);
                let controlEl = $(controlV2.html);
                var inputid = 's-control-id-' + Date.now();
                controlEl.attr('id', inputid).attr('style', style);
                controlEl.replaceAll($(value));
                try {
                    controlProps = JSON.parse(controlProps);
                    let controlProp = {};
                    let controlFormulas = {};
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
                        type: type
                    });
                } catch (error) {}
                if (type == 'table') {
                    let tableId = inputid;
                    let tableEl = controlEl;

                    let bodyTable = $(value).find('table');
                    // tableEl.find('table thead').remove();
                    tableEl.find('thead').remove();
                    tableEl.find('tbody').remove();
                    tableEl
                        .find('table')
                        .append(bodyTable.find('thead')[0].outerHTML);
                    tableEl
                        .find('table')
                        .append(bodyTable.find('tbody')[0].outerHTML);
                    tableEl.find('thead').attr('contenteditable', true);
                    let allControlInTable = tableEl.find('.s-control');
                    $.each(allControlInTable, function (item, value) {
                        let childControlProps = $(value).attr('data-property');
                        let type = $(value).attr('bkerp-type');
                        let style = $(value).attr('style');
                        if (type == 'text') type = 'textInput';
                        if (type == 'persent') type = 'percent';
                        if (type == 'file-upload') type = 'fileUpload';
                        if (type == 'datetime') type = 'dateTime';
                        let childControlV2 = GetControlProps(type);
                        childControlV2 = thisCpn.multilinguePropertiesControl(childControlV2,type);
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
                                    type: type
                                },
                                tableId
                            );
                        } catch (error) {
                            console.error(error);
                        }
                    });
                }
            });
        },
        /**
         * Hàm call api lấy thông tin control template
         */
        async getContentControlTemplate() {
            if (
                this.routeName == 'editControlTemplate' &&
                this.controlTemplateId != 0
            ) {
                let res = await documentApi.getDetailControlTemplate(
                    this.controlTemplateId
                );
                this.editorCore.setContent(res.data.form);
                let allProps = JSON.parse(res.data.controlProps);
                for (let id in allProps) {
                    let properties = allProps[id].properties;
                    for (let prop in properties) {
                        properties[prop] = properties[prop].value;
                    }
                    let formulas = allProps[id].formulas;
                    for (let formula in formulas) {
                        if (formulas[formula].formulasId) {
                            let item = {};
                            item[formulas[formula].formulasId] =
                                formulas[formula].value;
                            formulas[formula] = item;
                        } else {
                            formulas[formula] = '';
                        }
                    }
                }
                this.setDataForPropsControl(allProps);
                this.inputSaveControlTemplate.title.value = res.data.title;
            }
        },

        /**
         * Hàm set style cho form
         */
        setDefaultStyle(defaultStyle) {
            if (defaultStyle) {
                try {
                    this.contentStyle = JSON.parse(defaultStyle);
                    this.$store.commit('document/updateDocumentState', {
                        instance: this.keyInstance,
                        state: 'documentStyle',
                        value: this.contentStyle
                    });
                    $('#document-editor-' + this.keyInstance + '_ifr')
                        .contents()
                        .find('body')
                        .css({
                            'padding-left': this.contentStyle['padding-left'],
                            'padding-right': this.contentStyle['padding-right'],
                            'padding-top': this.contentStyle['padding-top'],
                            'padding-bottom':
                                this.contentStyle['padding-bottom']
                        });
                    this.setPageSize(
                        this.contentStyle.width,
                        this.contentStyle.height,
                        this.contentStyle.type
                    );
                } catch (error) {
                    console.warn(error);
                }
            }
        },
        async checkAllowEditDocument(document) {
            let updateTime = new Date(document.lastEditAt).getTime();
            let timeDiff = Date.now() - updateTime;
            if (timeDiff > 4000) {
                /**
                 * hoangnd: kiểm tra xem doc có đang hoạt động hay ko
                 */
                documentApi.setEdittingDocument({ id: self.documentId });
                this.intervalSetEditting = setInterval(
                    (self) => {
                        documentApi.setEdittingDocument({
                            id: self.documentId
                        });
                    },
                    3000,
                    this
                );
                return true;
            } else {
                if (
                    document.userEditting &&
                    this.baInfo &&
                    this.baInfo.id != document.userEditting
                ) {
                    try {
                        let baAcc = await accountApi.detailBa(
                            document.userEditting
                        );
                        if (baAcc.status == 200) {
                            let curBa = baAcc.data;
                            if (curBa) {
                                this.dialog = true;
                                this.$refs.actionView.hideSaveBtn(curBa.name);
                                this.titleDialog =
                                    'BA ' + curBa.name + this.$t('v2.doc.editThisDoc');
                                this.typeDialog = 'baEditting';
                                return false;
                            }
                        }
                    } catch (error) {
                        this.$refs.actionView.hideSaveBtn('');
                        return false;
                    }
                }
            }
            return true;
        },
        /**
         * hàm gọi request lấy thông tin của document khi vào edit doc
         * Thông tin bao gồm cấu trúc html của doc, các thuộc tính và công thức của control
         */
        async getContentDocument() {
            if (this.documentId != 0) {
                let res = await documentApi.detailDocument(this.documentId);
                if (res.status == 200) {
                    if (this.routeName == 'editDocument') {
                        await this.checkAllowEditDocument(res.data.document);
                        this.setDocumentProperties(res.data.document);
                        try {
                            this.setDocumentConfigMobile(
                                res.data.document.mobileConfig,
                                res.data.fields
                            );
                        } catch (error) {
                            console.error('error', error);
                        }
                    }
                    let content = res.data.document.content;
                    if (
                        this.printConfigId != 0 &&
                        this.printConfigId != undefined &&
                        this.printConfigId != null
                    ) {
                        let res1 = await documentApi.getDetailPrintConfig(
                            this.documentId,
                            this.printConfigId
                        );
                        content = res1.data.content;
                        this.setDocumentProperties({ title: res1.data.title });
                        this.setDefaultStyle(res1.data.formStyle);
                    }
                    this.oldContent = content;
                    this.editorCore.setContent(content);
                    this.dataPivotTable = res.data.pivotConfig;
                    this.dataGroupTable = res.data.groupConfig;
                    this.dataMatchingItems = res.data.document
                        .matchingItemsConfig
                        ? JSON.parse(res.data.document.matchingItemsConfig)
                        : this.dataMatchingItems;
                    this.dataConfigDeleteRow = getConfigDeleteRowTable(
                        res.data.document.controlInfo
                    );
                    $('#document-editor-' + this.keyInstance + '_ifr')
                        .contents()
                        .find('body select')
                        .each(function (e) {
                            let id = $(this).attr('id');
                            $(this).replaceWith(
                                '<input class="s-control s-control-select" s-control-type="select" type="text" title="Select" readonly="readonly" id="' +
                                    id +
                                    '">'
                            );
                        });
                    $('#document-editor-' + this.keyInstance + '_ifr')
                        .contents()
                        .find('body span.s-control-label')
                        .each(function (e) {
                            let id = $(this).attr('id');
                            $(this).replaceWith(
                                '<label class="s-control s-control-label" contenteditable="false" s-control-type="label" id="' +
                                    id +
                                    '" title="Label">Aa</label>'
                            );
                        });
                    $('#document-editor-' + this.keyInstance + '_ifr')
                        .contents()
                        .find('body .s-control-select')
                        .each(function (e) {
                            let id = $(this).attr('id');
                            let parentNode = $(this).closest('td');
                            let input =
                                '<input class="s-control s-control-select" s-control-type="select" type="text" title="Select" contenteditable="false" id="' +
                                id +
                                '">&#65279;';
                            $(this).replaceWith(input);
                        });
                    let fields = res.data.fields;
                    this.setDataForPropsControl(fields);
                    this.removeWrapTableElement();
                    if (
                        this.printConfigId != 0 &&
                        this.printConfigId != undefined &&
                        this.printConfigId != null
                    ) {
                        this.detectBlurEditorEvent();
                    }
                }
            }
        },
        confirmExitMatchingItems() {
            this.showExitMatchingItem = false;
            this.$refs.tableSetting.confirmExitMatchingItems();
        },
        handleMatchingItemDialog(data) {
            this.showExitMatchingItem = data;
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
                listTable.wrap('<div class="wrap-s-control-table"></div>');
            }
        },
        removeWrapTableElement() {
            let listTable = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.s-control-table');
            $.each(listTable, function (k, v) {
                if ($(v).parent().is('.wrap-s-control-table')) {
                    $(v).unwrap();
                }
            });
        },

        setDocumentProperties(documentProp) {
            this.$refs.saveDocPanel.setPropsOfDoc(documentProp);
        },

        //hoangnd: hàm set các giá trị của thuộc tính và formulas vào từng contrl trong doc lúc load dữ liệu và đưa vào state
        setDataForPropsControl(fields) {
            let thisCpn = this;
            for (let controlId in fields) {
                if (!fields[controlId].hasOwnProperty('type')) {
                    continue;
                }
                let control = GetControlProps(fields[controlId].type);
                control = thisCpn.multilinguePropertiesControl(control,fields[controlId].type);
                let autocompleteConfig = fields[controlId].autocompleteConfig;
                // console.log('allControl',thisCpn.editorStore.allControl)
                // console.log('control',control)
                // console.log('pro',control.properties)
                let properties = control.properties;
                let formulas = control.formulas;
                let type = fields[controlId].type;
                if (properties) {
                    $.each(properties, function (k, v) {
                        if (properties[k]) {
                            if (properties[k].type == 'checkbox') {
                                properties[k].value =
                                    fields[controlId]['properties'][k] == true;
                            } else {
                                if (type == 'dataFlow' && k == 'dataFlowId') {
                                    if(fields[controlId]['properties'][k].id){
                                        properties[k].value = {
                                            id: fields[controlId]['properties'][k].id
                                        };                                       
                                    }else {
                                        properties[k].value = {
                                            id: fields[controlId]['properties'][k]
                                        };                                        
                                    }
                                } else if (type == 'dataFlow') {
                                    properties[k]['value'] =
                                        fields[controlId]['properties'][k];
                                    if (k == 'mapInputDataflow') {
                                        properties['mapInputDataflow'].options =
                                            {
                                                controls: [],
                                                nodeLoads: []
                                            };
                                        let rowData = {};
                                        if (
                                            properties['mapInputDataflow'] &&
                                            properties['mapInputDataflow'].value
                                        ) {
                                            Object.keys(
                                                properties['mapInputDataflow']
                                                    .value
                                            ).map((rowIdx) => {
                                                rowData[rowIdx] =
                                                    properties[
                                                        'mapInputDataflow'
                                                    ].value[rowIdx].mapping;
                                                properties[
                                                    'mapInputDataflow'
                                                ].rowData = rowData;
                                                thisCpn.setValueDataflow(
                                                    properties['dataFlowId']
                                                        .value.id,
                                                    properties
                                                );
                                            });
                                        }
                                    }
                                } else {
                                    if (
                                        typeof fields[controlId]['properties'][
                                            k
                                        ] != 'object'
                                    ) {
                                        properties[k].value =
                                            fields[controlId]['properties'][k];
                                    }
                                }
                            }
                            if (k == 'name') {
                                properties[k].oldName = properties[k].value;
                            }
                            let elements = $(
                                '#document-editor-' +
                                    thisCpn.keyInstance +
                                    '_ifr'
                            )
                                .contents()
                                .find('#' + controlId);
                            if (
                                [
                                    'color',
                                    'fontSize',
                                    'height',
                                    'width',
                                    'isHidden'
                                ].includes(k)
                            ) {
                                if (!thisCpn.isConfigPrint && properties[k].value) {
                                    addCssItem(
                                        k,
                                        properties[k].value,
                                        elements
                                    );
                                }
                            }
                        }
                    });
                }
                if (fields[controlId]['formulas'] != false) {
                    $.each(formulas, function (k, v) {
                        if (formulas[k]) {
                            if (k == 'linkConfig' || k == 'groupDpm') {
                                if (fields[controlId]['formulas'][k]) {
                                    let configData =
                                        fields[controlId]['formulas'][k][
                                            'configData'
                                        ];
                                        for (
                                            let index = 0;
                                            index < configData.length;
                                            index++
                                        ) {
                                            if (
                                                thisCpn.$getRouteName() ==
                                                'cloneDocument'
                                            ) {
                                                configData[index]['formula'][
                                                    'id'
                                                ] = 0;
                                            }
                                            thisCpn.oldListFormulas[configData[index].formula.id] = configData[index].formula.value
                                        }
                                    formulas[k]['configData'] = configData;
                                }
                            } else {
                                if (fields[controlId]['formulas'][k]) {
                                    formulas[k].value = Object.values(
                                        fields[controlId]['formulas'][k]
                                    )[0];
                                    thisCpn.oldListFormulas[Object.keys(fields[controlId]['formulas'][k])[0]] = Object.values(fields[controlId]['formulas'][k])[0]
                                    if (
                                        thisCpn.$getRouteName() !=
                                        'cloneDocument'
                                    ) {
                                        formulas[k].formulasId = Object.keys(
                                            fields[controlId]['formulas'][k]
                                        )[0];
                                    }
                                }
                                if (k == 'autocomplete') {
                                    formulas[k]['configData'] =
                                        autocompleteConfig == false
                                            ? {}
                                            : autocompleteConfig;
                                }
                            }
                        }
                    });
                }
                if (fields[controlId].type != 'table') {
                    this.addToAllControlInDoc(controlId, {
                        properties: properties,
                        formulas: formulas,
                        type: fields[controlId].type
                    });
                } else {
                    let listField = fields[controlId].listFields;
                    let listChildField = {};
                    for (let childFieldId in listField) {
                        let childControl = GetControlProps(
                            listField[childFieldId].type
                        );
                        childControl = thisCpn.multilinguePropertiesControl(childControl,listField[childFieldId].type);
                        let childProperties = childControl.properties;
                        let childFormulas = childControl.formulas;
                        let childType = listField[childFieldId].type;
                        let childAutocompleteConfig =
                            listField[childFieldId].autocompleteConfig;

                        $.each(childProperties, function (k, v) {
                            if (childProperties[k]) {
                                if (childProperties[k].type == 'checkbox') {
                                    childProperties[k].value =
                                        listField[childFieldId]['properties'][
                                            k
                                        ] == true;
                                } else {
                                    if (
                                        typeof listField[childFieldId][
                                            'properties'
                                        ][k] != 'object'
                                    )
                                        childProperties[k].value =
                                            listField[childFieldId][
                                                'properties'
                                            ][k];
                                }
                                if (k == 'name') {
                                    childProperties[k].oldName =
                                        childProperties[k].value;
                                }
                                let elements = $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr'
                                )
                                    .contents()
                                    .find('#' + childFieldId);
                                if (
                                    [
                                        'color',
                                        'fontSize',
                                        'height',
                                        'width',
                                        'isHidden'
                                    ].includes(k)
                                ) {
                                    if (!thisCpn.isConfigPrint && childProperties[k].value) {
                                        addCssItem(
                                            k,
                                            childProperties[k].value,
                                            elements
                                        );
                                    }
                                }
                            }
                        });
                        if (listField[childFieldId]['formulas'] != false) {
                            $.each(childFormulas, function (k, v) {
                                if (childFormulas[k]) {
                                    if (k == 'linkConfig' || k == 'groupDpm') {
                                        if (
                                            listField[childFieldId]['formulas'][
                                                k
                                            ]
                                        ) {
                                            let configData =
                                                listField[childFieldId][
                                                    'formulas'
                                                ][k]['configData'];
                                            for (
                                                let index = 0;
                                                index < configData.length;
                                                index++
                                            ) {
                                                if (
                                                    thisCpn.$getRouteName() ==
                                                    'cloneDocument'
                                                ) {
                                                    configData[index]['formula'][
                                                        'id'
                                                    ] = 0;
                                                }
                                                thisCpn.oldListFormulas[configData[index].formula.id] = configData[index].formula.value
                                            }
                                            childFormulas[k]['configData'] =
                                                configData;
                                        }
                                    } else {
                                        if (
                                            listField[childFieldId]['formulas'][
                                                k
                                            ]
                                        ) {
                                            childFormulas[k].value =
                                                Object.values(
                                                    listField[childFieldId][
                                                        'formulas'
                                                    ][k]
                                                )[0];
                                            thisCpn.oldListFormulas[Object.keys(listField[childFieldId]['formulas'][k])[0]] = Object.values(listField[childFieldId]['formulas'][k])[0]
                                            if (
                                                thisCpn.$getRouteName() !=
                                                'cloneDocument'
                                            ) {
                                                childFormulas[k].formulasId =
                                                    Object.keys(
                                                        listField[childFieldId][
                                                            'formulas'
                                                        ][k]
                                                    )[0];
                                            }
                                        }
                                        if (k == 'autocomplete') {
                                            childFormulas[k]['configData'] =
                                                childAutocompleteConfig == false
                                                    ? {}
                                                    : childAutocompleteConfig;
                                        }
                                    }
                                }
                            });
                        }
                        listChildField[childFieldId] = {
                            properties: childProperties,
                            formulas: childFormulas,
                            type: childType
                        };
                    }
                    this.addToAllControlInDoc(controlId, {
                        properties: properties,
                        formulas: formulas,
                        type: fields[controlId].type,
                        listFields: listChildField
                    });
                }
            }
        },
        async setValueDataflow(id, properties) {
            let res = await dataflowApi.getInfo(id, '');
            properties['mapOutputDataflow'].lists = {
                node: [],
                title: []
            };
            if (res.status == 200) {
                if (res.data.nodes && Object.keys(res.data.nodes).length > 0) {
                    Object.keys(res.data.nodes).map((node) => {
                        if (
                            res.data.nodes[node].jointInfo.type == 'app.Load' &&
                            res.data.nodes[node].symperConfigs.customData &&
                            res.data.nodes[node].symperConfigs.customData
                                .columns.length > 0
                        ) {
                            properties[
                                'mapInputDataflow'
                            ].options.nodeLoads.push({
                                id: res.data.nodes[node].jointInfo.id,
                                name: res.data.nodes[node].jointInfo.name,
                                field: res.data.nodes[node].symperConfigs
                                    .customData
                                    ? res.data.nodes[node].symperConfigs
                                          .customData.columns
                                    : []
                            });
                        }
                        properties['mapOutputDataflow'].lists.node.push({
                            id: res.data.nodes[node].jointInfo.id,
                            name: res.data.nodes[node].jointInfo.name
                        });
                    });
                }
            }
        },
        // sự kiện xảy ra khi khởi tạo xong editor , sự kiện do tinymce cung cấp
        initEditor() {
            // $('.sym-document-editor .tox .tox-edit-area').css({'overflow':'auto'})
            let thisCpn = this;
            if (this.documentId != 0 && this.documentId != undefined)
                // trường họp edit doc thì gọi api lấy dữ liệu
                this.getContentDocument();
            if (this.controlTemplateId != 0) {
                this.getContentControlTemplate();
            }
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
                    mousePos
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
                    mousePos
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
                        mousePos
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
                                        ':not(.drop-marker,[data-dragcontext-marker])'
                                    )
                                    .first(),
                                mousePercents
                            );
                        } else {
                            var positionAndElement = this.findNearestElement(
                                $element,
                                mousePos.x,
                                mousePos.y
                            );
                            this.DecideBeforeAfter(
                                positionAndElement.el,
                                mousePercents,
                                mousePos
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
                                'top'
                            );
                        else
                            validElement = this.FindValidParent(
                                $element,
                                'left'
                            );

                        if (validElement.is('body,html'))
                            validElement = $(
                                '#document-editor-' +
                                    thisCpn.keyInstance +
                                    '_ifr'
                            )
                                .contents()
                                .find('body')
                                .children(
                                    ':not(.drop-marker,[data-dragcontext-marker])'
                                )
                                .first();
                        this.DecideBeforeAfter(
                            validElement,
                            mousePercents,
                            mousePos
                        );
                    } else if (
                        mousePercents.x >= 100 - breakPointNumber.x ||
                        mousePercents.y >= 100 - breakPointNumber.y
                    ) {
                        var validElement = null;
                        if (mousePercents.y >= mousePercents.x)
                            validElement = this.FindValidParent(
                                $element,
                                'bottom'
                            );
                        else
                            validElement = this.FindValidParent(
                                $element,
                                'right'
                            );

                        if (validElement.is('body,html'))
                            validElement = $(
                                '#document-editor-' +
                                    thisCpn.keyInstance +
                                    '_ifr'
                            )
                                .contents()
                                .find('body')
                                .children(
                                    ':not(.drop-marker,[data-dragcontext-marker])'
                                )
                                .last();
                        this.DecideBeforeAfter(
                            validElement,
                            mousePercents,
                            mousePos
                        );
                    }
                },
                DecideBeforeAfter: function (
                    $targetElement,
                    mousePercents,
                    mousePos
                ) {
                    if (mousePos) {
                        mousePercents = this.GetMouseBearingsPercentage(
                            $targetElement,
                            null,
                            mousePos
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
                        'wbr'
                    ];
                    var selector = voidelements.join(',');
                    if ($element.is(selector)) return true;
                    else return false;
                },
                calculateDistance: function (elementData, mouseX, mouseY) {
                    return Math.sqrt(
                        Math.pow(elementData.x - mouseX, 2) +
                            Math.pow(elementData.y - mouseY, 2)
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
                                        tempelementRect.left - elementRect.left
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
                                            elementRect.right
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
                                        tempelementRect.top - elementRect.top
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
                                            elementRect.bottom
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
                            placeholder
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
                            placeholder
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
                        ':not(.drop-marker,[data-dragcontext-marker])'
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
                                        position: 'before'
                                    };
                                } else {
                                    corner1 = {
                                        x: xPosition2,
                                        y: clientY,
                                        position: 'after'
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
                                        position: 'before'
                                    };
                                } else {
                                    corner1 = {
                                        x: clientX,
                                        y: yPosition2,
                                        position: 'after'
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
                                        position: 'before'
                                    }; //left top
                                    corner2 = {
                                        x: xPosition1,
                                        y: yPosition2,
                                        position: 'after'
                                    }; //left bottom
                                } else if (
                                    clientX > xPosition1 &&
                                    clientX > xPosition2
                                ) {
                                    //console.log('I m on the right of the element');
                                    corner1 = {
                                        x: xPosition2,
                                        y: yPosition1,
                                        position: 'before'
                                    }; //Right top
                                    corner2 = {
                                        x: xPosition2,
                                        y: yPosition2,
                                        position: 'after'
                                    }; //Right Bottom
                                } else if (
                                    clientY < yPosition1 &&
                                    clientY < yPosition2
                                ) {
                                    // console.log('I m on the top of the element');
                                    corner1 = {
                                        x: xPosition1,
                                        y: yPosition1,
                                        position: 'before'
                                    }; //Top Left
                                    corner2 = {
                                        x: xPosition2,
                                        y: yPosition1,
                                        position: 'after'
                                    }; //Top Right
                                } else if (
                                    clientY > yPosition1 &&
                                    clientY > yPosition2
                                ) {
                                    // console.log('I m on the bottom of the element');
                                    corner1 = {
                                        x: xPosition1,
                                        y: yPosition2,
                                        position: 'before'
                                    }; //Left bottom
                                    corner2 = {
                                        x: xPosition2,
                                        y: yPosition2,
                                        position: 'after'
                                    }; //Right Bottom
                                }
                            }

                            distance1 = _this.calculateDistance(
                                corner1,
                                clientX,
                                clientY
                            );

                            if (corner2 !== null)
                                distance2 = _this.calculateDistance(
                                    corner2,
                                    clientX,
                                    clientY
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
                                position: position
                            };
                        });
                        if (previousElData !== null) {
                            var position = previousElData.position;
                            return {
                                el: $(previousElData.el),
                                position: position
                            };
                        } else {
                            return false;
                        }
                    }
                },
                AddEntryToDragOverQueue: function (
                    $element,
                    elementRect,
                    mousePos
                ) {
                    var newEvent = [$element, elementRect, mousePos];
                    this.dragoverqueue.push(newEvent);
                },
                ProcessDragOverQueue: function (
                    $element,
                    elementRect,
                    mousePos
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
                        '<div data-dragcontext-marker><span data-dragcontext-marker-text></span></div>'
                    );
                    return $contextMarker;
                },
                AddContainerContext: function ($element, position) {
                    let $contextMarker = this.GetContextMarker();
                    this.ClearContainerContext();
                    if ($element.is('html,body')) {
                        position = 'inside';
                        $element = $(
                            '#document-editor-' + thisCpn.keyInstance + '_ifr'
                        )
                            .contents()
                            .find('body');
                    }
                    switch (position) {
                        case 'inside':
                            this.PositionContextMarker(
                                $contextMarker,
                                $element
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
                                        '_ifr'
                                )
                                    .contents()
                                    .find('body [data-sh-parent-marker]')
                                    .length != 0
                            )
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr'
                                )
                                    .contents()
                                    .find('body [data-sh-parent-marker]')
                                    .first()
                                    .before($contextMarker);
                            else
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr'
                                )
                                    .contents()
                                    .find('body')
                                    .append($contextMarker);
                            break;
                        case 'sibling':
                            this.PositionContextMarker(
                                $contextMarker,
                                $element.parent()
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
                                name.toLowerCase()
                            );
                            if (
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr'
                                )
                                    .contents()
                                    .find('body [data-sh-parent-marker]')
                                    .length != 0
                            )
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr'
                                )
                                    .contents()
                                    .find('body [data-sh-parent-marker]')
                                    .first()
                                    .before($contextMarker);
                            else
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr'
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
                                        '_ifr'
                                ).get(0).contentWindow
                            ).scrollTop() -
                            2 +
                            'px',
                        left:
                            rect.left +
                            $(
                                $(
                                    '#document-editor-' +
                                        thisCpn.keyInstance +
                                        '_ifr'
                                ).get(0).contentWindow
                            ).scrollLeft() -
                            2 +
                            'px'
                    });
                    if (
                        rect.top +
                            $(
                                '#document-editor-' +
                                    thisCpn.keyInstance +
                                    '_ifr'
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
                }
            };
            $(document).on(
                'dragstart',
                '.sym-control .control-content,.control-template-item',
                function (event) {
                    dragoverqueue_processtimer = setInterval(function () {
                        DragDropFunctions.ProcessDragOverQueue();
                    }, 100);
                    var controlType = $(this).attr('control-type');
                    let control = null;
                    if ($(this).is('.control-template-item')) {
                        let id = $(this).attr('control-id');
                        control = thisCpn.allControlTemplate.filter((c) => {
                            return c.id === id;
                        });
                        control = control[0];
                    } else {
                        if ($(this).attr('control-id')) {
                            let tableId = $(this).attr('table-id');
                            let controlId = $(this).attr('control-id');
                            if (tableId) {
                                if (thisCpn.allControlDeleted) {
                                    control =
                                        thisCpn.allControlDeleted[tableId][
                                            'listFields'
                                        ][controlId];
                                }
                            } else {
                                control = thisCpn.allControlDeleted[controlId];
                            }

                            control.isConfigPrint = true;
                        } else {
                            control = GetControlProps(controlType);
                            control = thisCpn.multilinguePropertiesControl(control,controlType);
                        }
                    }
                    event.originalEvent.dataTransfer.setData(
                        'control',
                        JSON.stringify(control)
                    );
                }
            );

            $(document).on(
                'dragend',
                '.sym-control .control-content,.control-template-item',
                function () {
                    clearInterval(dragoverqueue_processtimer);
                    DragDropFunctions.removePlaceholder();
                    DragDropFunctions.ClearContainerContext();
                }
            );
            var style = $('<style data-reserved-styletag></style>').html(
                getInsertionCSS()
            );
            var clientFrameWindow = $(
                '#document-editor-' + thisCpn.keyInstance + '_ifr'
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
                            mousePosition
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
                        $('#document-editor-' + thisCpn.keyInstance + '_ifr')
                            .contents()
                            .find('.on-selected')
                            .removeClass('on-selected');
                        var insertionPoint = $(
                            '#document-editor-' + thisCpn.keyInstance + '_ifr'
                        )
                            .contents()
                            .find('.drop-marker');
                        if (control.type == 'control-template') {
                            thisCpn.dropControlTemplate(
                                insertionPoint,
                                control
                            );
                        } else {
                            let isControlPrint = control.isConfigPrint;
                            if (isControlPrint) {
                                let controlEl = GetControlProps(control.type);
                                controlEl = thisCpn.multilinguePropertiesControl(controlEl, control.type);
                                var checkDiv = $(controlEl.html);
                                checkDiv.attr('id', control.id);
                                insertionPoint.after(checkDiv);
                                thisCpn.$store.commit(
                                    'document/deleteControlInAllControlDeleted',
                                    {
                                        id: control.id,
                                        table: control.tableId,
                                        instance: thisCpn.keyInstance
                                    }
                                );
                            } else {
                                var checkDiv = $(control.html);
                                let typeControl =
                                    checkDiv.attr('s-control-type');
                                if (typeControl == 'dataFlow') {
                                    control.properties.dataFlowId.options =
                                        thisCpn.listDataFlow;
                                }
                                if (
                                    control.properties.hasOwnProperty(
                                        'quickSubmit'
                                    )
                                ) {
                                    control.properties.quickSubmit.options =
                                        thisCpn.listDocument;
                                }
                                var inputid = 's-control-id-' + Date.now();
                                checkDiv.attr('id', inputid);
                                insertionPoint.after(checkDiv);
                                let table =
                                    insertionPoint.closest('.s-control-table'); // nếu kéo control vào table thì lưu prop của control đó vào table trong allControl của state
                                let idTable = '';
                                checkDiv.prop('readonly', false);
                                if (
                                    checkDiv.attr('s-control-type') != 'table'
                                ) {
                                    checkDiv.attr('contenteditable', false);
                                }
                                checkDiv.addClass('on-selected');
                                if (typeControl == 'tabPage') {
                                    let newPageId =
                                        's-control-id-' + (Date.now() + 1);
                                    checkDiv
                                        .find('.page-item.sb-page-active')
                                        .attr('id', newPageId);
                                    checkDiv
                                        .find('.page-content.page-active')
                                        .attr('s-page-content-id', newPageId);
                                    let control = GetControlProps('page');
                                    control = thisCpn.multilinguePropertiesControl(control, 'page');
                                    control.properties.title.value =
                                        'Trang số 1';
                                    control.properties.name.value = 'pg_1';
                                    thisCpn.addToAllControlInDoc(newPageId, {
                                        properties: control.properties,
                                        formulas: control.formulas,
                                        type: 'page'
                                    });
                                }
                                thisCpn.selectControl(
                                    control.properties,
                                    control.formulas,
                                    inputid,
                                    typeControl
                                );
                                if (table.length > 0) {
                                    // nếu keo control vào trong table thì update dữ liệu trong table của state
                                    idTable = table.attr('id');
                                    thisCpn.addToAllControlInTable(
                                        inputid,
                                        {
                                            properties: control.properties,
                                            formulas: control.formulas,
                                            type: typeControl
                                        },
                                        idTable
                                    );
                                } else {
                                    thisCpn.addToAllControlInDoc(inputid, {
                                        properties: control.properties,
                                        formulas: control.formulas,
                                        type: typeControl
                                    });
                                }
                            }
                        }
                        insertionPoint.remove();
                    } catch (e) {}
                });
        },

        dropControlTemplate(insertionPoint, control) {
            let self = this;
            let contentEl = $(control.content);
            let controlInEL = contentEl.find(
                '.s-control:not(.s-control-table .s-control)'
            );
            if (Number(control.is_single_control) == 1) {
                controlInEL = contentEl;
            }
            let allControlProp = JSON.parse(control.control_props);
            for (let index = 0; index < controlInEL.length; index++) {
                let controlEl = $(controlInEL[index]);
                setTimeout(() => {
                    let newId = 's-control-id-' + Date.now();
                    let controlProp = allControlProp[controlEl.attr('id')];
                    if (Number(control.is_single_control) == 1) {
                        contentEl.attr('id', newId);
                    } else {
                        contentEl
                            .find('#' + controlEl.attr('id'))
                            .attr('id', newId);
                    }
                    let controlType = controlProp.type;
                    self.addToAllControlInDoc(newId, {
                        properties: controlProp.properties,
                        formulas: controlProp.formulas,
                        type: controlType
                    });
                    if (controlType == 'table') {
                        controlEl.find('.s-control').each(function () {
                            let childControlId = $(this).attr('id');
                            setTimeout(() => {
                                let newChildId = 's-control-id-' + Date.now();
                                let childControlProp =
                                    allControlProp[childControlId];
                                contentEl
                                    .find('#' + childControlId.attr('id'))
                                    .attr('id', newChildId);
                                idTable = controlEl.attr('id');
                                self.addToAllControlInTable(
                                    newChildId,
                                    {
                                        properties: childControlProp.properties,
                                        formulas: childControlProp.formulas,
                                        type: $(this).attr('s-control-type')
                                    },
                                    newId
                                );
                            }, 1);
                        });
                    }
                }, 1);
            }
            insertionPoint.after(contentEl);
        },

        /**
         * Hàm xử lí khi click vào control thì lấy thông tin của control đó và hiển thị vào sidebar
         */
        setSelectedControlProp(e, el, clientFrameWindow, fromTreeView = false) {
            e.preventDefault();
            let type = el.attr('s-control-type');
            if (!['tab', 'page'].includes(type)) {
                $(clientFrameWindow.document)
                    .find('.on-selected')
                    .removeClass('on-selected');
                el.addClass('on-selected');
            }

            let controlId = el.attr('id');
            $('.editor-tree-active').removeClass('editor-tree-active');
            $('.tree-' + controlId).addClass('editor-tree-active');
            let table = el.closest('.s-control-table');
            if (table.length > 0 && controlId != table.attr('id')) {
                if (!fromTreeView)
                    tinyMCE.activeEditor.selection.setNode(
                        $(e.target).closest('.s-control')
                    );

                let tableId = table.attr('id');
                let control =
                    this.editorStore.allControl[tableId]['listFields'][
                        controlId
                    ];

                if (!control) {
                    this.showDialogEditor(
                        '',
                        this.$t('document.validate.controlNotExist')
                    );

                    return;
                }
                this.selectControl(
                    control.properties,
                    control.formulas,
                    controlId,
                    type
                );
            } else {
                let control = this.editorStore.allControl[controlId];
                if (!control) {
                    this.showDialogEditor(
                        '',
                        this.$t('document.validate.controlNotExist')
                    );
                    return;
                }
                this.selectControl(
                    control.properties,
                    control.formulas,
                    controlId,
                    type
                );
            }
        },
        checkSelectedTabPageControl(e, control, controlId) {
            if ($(e.target).closest('.page-item').length > 0) {
                let pageId = $(e.target).closest('.page-item').attr('id');
                let control = this.editorStore.allControl[pageId];
                this.selectControl(
                    control.properties,
                    control.formulas,
                    controlId,
                    'page'
                );
            } else if ($(e.target).is('.tab button')) {
                let tabId = $(e.target).attr('id');
                let control = this.editorStore.allControl[tabId];
                this.selectControl(
                    control.properties,
                    control.formulas,
                    controlId,
                    'tab'
                );
            } else {
                this.selectControl(
                    control.properties,
                    control.formulas,
                    controlId,
                    'tabPage'
                );
            }
        },
        // ************************* Các hàm xử lí liên quan đến cấu hình in *******************************//
        // hàm xử lí thêm các cột vào trong control table khi lưu ở tablesetting
        configColumnTablePrint(listRowData) {
            let elements = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('.s-control-table.on-selected');
            let thead = elements.find('thead th');
            let tbody = elements.find('tbody tr td');
            for (let index = 0; index < thead.length; index++) {
                let th = thead[index];
                let newCell = listRowData.filter((row) => {
                    return row.colIndex == index;
                });
                if (newCell.length == 0) {
                    $(th).remove();
                    $(tbody[index]).remove();
                } else {
                    $(th).css({ width: newCell[0].colWidth });
                    $(th).attr('data-mce-style', $(th).attr('style'));
                }
            }
        },

        //hoangnd: hàm mở modal tablesetting của control table
        showPrintConfigTable(e) {
            $('.tox-pop').css({ display: 'none' });
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
                let listData = [];
                if ($(tbody[0].innerHTML).length > 0) {
                    for (let i = 0; i < thead.length; i++) {
                        let widthSetting = $(thead[i]).attr('data-mce-style'); // width của cột đã được lưu trong setting từ trước
                        if (widthSetting) {
                            if (widthSetting.split(';').length > 1) {
                                widthSetting.split(';').map((w) => {
                                    if (w.includes('width')) {
                                        widthSetting = w;
                                    }
                                });
                            }
                            widthSetting = widthSetting
                                .replace('width:', '')
                                .replace(';', '');
                        }
                        let width = Math.ceil(100 / thead.length) + '%';
                        if (widthSetting) width = widthSetting;
                        let row = {
                            title: $(thead[i]).text(),
                            colWidth: width,
                            colIndex: i
                        };
                        listData.push(row);
                    }
                }
                this.$refs.printTableConfig.showDialog();
                this.$refs.printTableConfig.setListRow(listData);
            }
        },
        // mở modal lưu , edit doc
        saveFormPrint(docProps) {
            this.$refs.actionView.showLoading();
            let isClonePrint = this.$route.params.extraData
                ? this.$route.params.extraData.isClone
                : false;
            if (
                this.printConfigId != 0 &&
                this.printConfigId != undefined &&
                this.printConfigId != null &&
                !isClonePrint
            ) {
                let dataPost = {
                    documentId: this.documentId,
                    title: docProps.title.value,
                    content: this.editorCore.getContent(),
                    printConfigId: this.printConfigId,
                    size: JSON.stringify(this.contentStyle)
                };
                let thisCpn = this;
                documentApi
                    .updatePrintConfig(dataPost)
                    .then((res) => {
                        thisCpn.$refs.actionView.hideLoading();
                        if (res.status == 200) {
                            thisCpn.editorCore.remove();
                            thisCpn.$router.push('/documents');
                            thisCpn.$snotify({
                                type: 'success',
                                title: thisCpn.$t('v2.doc.updateFormSuccess')
                            });
                        } else {
                            thisCpn.$snotify({
                                type: 'error',
                                title: res.message,
                                text: res.lastErrorMessage
                            });
                        }
                    })
                    .catch((err) => {
                        thisCpn.$refs.actionView.hideLoading();
                        thisCpn.$snotify({
                            type: 'error',
                            title: thisCpn.$t('v2.doc.cannotSaveFormPrint')
                        });
                    })
                    .finally(() => {});
            } else {
                let dataPost = {
                    documentId: this.documentId,
                    title: docProps.title.value,
                    content: this.editorCore.getContent(),
                    size: JSON.stringify(this.contentStyle)
                };
                let thisCpn = this;

                documentApi
                    .savePrintConfig(dataPost)
                    .then((res) => {
                        if (res.status == 200) {
                            thisCpn.editorCore.remove();
                            thisCpn.$router.push('/documents');
                            thisCpn.$snotify({
                                type: 'success',
                                title: thisCpn.$t('v2.doc.saveFormSuccess')
                            });
                        } else {
                            thisCpn.$snotify({
                                type: 'error',
                                title: res.message,
                                text: res.lastErrorMessage
                            });
                        }
                    })
                    .catch((err) => {
                        thisCpn.$snotify({
                            type: 'error',
                            title: thisCpn.$t('v2.doc.cannotSaveFormPrint')
                        });
                    })
                    .finally(() => {});
            }
        },
        /**
         * Hàm kiêm tra có select content trong editor hay không
         */
        checkIsSelectionText() {
            if (this.editorCore.selection.getContent()) {
                return true;
            }
            return false;
        },

        handleHighlightControlSelection(e) {
            try {
                $('#document-editor-' + this.keyInstance + '_ifr')
                    .contents()
                    .find('.selection-highlight')
                    .removeClass('selection-highlight');
                let contentSelection = this.editorCore.selection.getContent();
                if (
                    $(contentSelection).is('.s-control-table') ||
                    $(contentSelection).is('.s-control-tab-page')
                ) {
                    return;
                }
                let allControlInForm = $(contentSelection).find('.s-control');
                for (let index = 0; index < allControlInForm.length; index++) {
                    let element = allControlInForm[index];
                    let id = $(element).attr('id');
                    $('#document-editor-' + this.keyInstance + '_ifr')
                        .contents()
                        .find('#' + id)
                        .addClass('selection-highlight');
                }
            } catch (error) {}
        },
        /**
         * Xử li sau khi thy đổi font size , font family thì thêm style cho control
         */
        handleExecCommand(e) {
            let mapCommandToStyle = {
                FontSize: 'font-size',
                FontName: 'font-family'
            };
            try {
                let value = e.value;
                if (Object.keys(mapCommandToStyle).includes(e.command)) {
                    let contentSelection =
                        this.editorCore.selection.getContent();
                    let allControlInForm =
                        $(contentSelection).find('.s-control');
                    for (
                        let index = 0;
                        index < allControlInForm.length;
                        index++
                    ) {
                        let element = allControlInForm[index];
                        let id = $(element).attr('id');
                        $('#document-editor-' + this.keyInstance + '_ifr')
                            .contents()
                            .find('#' + id)
                            .css(mapCommandToStyle[e.command], value);
                        let curStyle = $(
                            '#document-editor-' + this.keyInstance + '_ifr'
                        )
                            .contents()
                            .find('#' + id)
                            .attr('style');

                        $('#document-editor-' + this.keyInstance + '_ifr')
                            .contents()
                            .find('#' + id)
                            .attr('data-mce-style', curStyle);
                    }
                }
            } catch (error) {}
        },
        beforeCloseSubmit() {
            this.isShowPreviewSubmit = false;
        },
        // xử lý khi tắt tab chrome
        handleCloseChrome() {
            let self = this
            $(window).on('beforeunload', function (e) {
                let dialogText = self.$t('v2.doc.confirmCloseWindow');
                e.returnValue = dialogText;
                return dialogText;
            });
        },
        multilinguePropertiesControl(control, controlType){
            for(let p in control.properties){
                control.properties[p].title = this.$t(control.properties[p].title)
            }
            for(let f in control.formulas){
                control.formulas[f].title = this.$t(control.formulas[f].title)
            }
            if(controlType == "department"){
                for(let d in control.formulas.groupDpm.configData[0]){
                    control.formulas.groupDpm.configData[0][d].title = this.$t(control.formulas.groupDpm.configData[0][d].title)
                    if(control.formulas.groupDpm.configData[0][d].placeholder){
                        control.formulas.groupDpm.configData[0][d].placeholder = this.$t(control.formulas.groupDpm.configData[0][d].placeholder)
                    }
                    if(d == "level"){
                        for(let o in control.formulas.groupDpm.configData[0][d].options){
                            control.formulas.groupDpm.configData[0][d].options[o].text = this.$t(control.formulas.groupDpm.configData[0][d].options[o].text)
                        }
                    }
                }                
            }
            if(controlType == "tabPage"){
                control.html = control.html.replace('v2.doc.addPage', `${this.$t('v2.doc.addPage')}`)
                control.html = control.html.replace('v2.doc.pageNumber', `${this.$t('v2.doc.pageNumber')}`)
            }
            return control
        }
    }
};
</script>
<style>
.sidebar-page::-webkit-scrollbar {
    width: 6px !important;
    background-color: black !important;
}
.sidebar-page::-webkit-scrollbar-thumb {
    border-radius: 50px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: grey;
}
.sidebar-page::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 50px;
    background-color: #f5f5f5;
}
.d-flex {
    display: flex;
}
.sym-document__side-bar-right,
.sym-document__side-bar-left {
    height: 100%;
    width: 240px;
}
.sym-document__side-bar-right {
    height: 100%;
    width: 370px;
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
    height: calc(100% - 10px) !important;
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
.sym-document-editor .tox .tox-edit-area {
    overflow: auto;
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
.notice-title {
    word-break: break-word;
    font-size: 15px !important;
    padding: 12px !important;
}
.sym-document-editor .v-autocomplete {
    overflow: hidden;
}
</style>
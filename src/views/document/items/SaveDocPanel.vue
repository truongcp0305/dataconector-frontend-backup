<template>
    <div>
        <v-dialog
            scrollable
            v-model="isShowModelSaveDoc"
            persistent
            width="800"
            content-class="s-dialog"
        >
            <v-card>
                <div class="note-name-change" v-show="showNoteChangeName">
                    <span>{{
                        $t('document.editor.dialog.saveDoc.checkNameRelated')
                    }}</span>
                    <div class="buble-direction">
                        <span>▼</span>
                    </div>
                </div>
                <h4 class="headline">
                    {{ $t('document.editor.dialog.saveDoc.heading') }}
                </h4>
                <v-divider></v-divider>
                <v-card-text style="height: calc(100% - 84px); overflow: auto">
                    <div>
                        <div>
                            <form-save-doc
                                @append-icon-click="checkNameDocument"
                                @input-value-changed="handleChangeInput"
                                :allInputs="documentProps"
                            />
                        </div>
                        <SystemDataMapping
                            ref="systemDataMapping"
                            :instance="instance"
                        />
                    </div>
                </v-card-text>
                <v-divider></v-divider>

                <v-card-actions class="action">
                    <v-spacer></v-spacer>
                    <v-btn
                        color="green darken-1"
                        text
                        right
                        :disabled="isDisableSave"
                        @click="saveDocument"
                    >
                        {{ $t('common.save') }}
                    </v-btn>

                    <v-btn
                        color="green darken-1"
                        text
                        right
                        @click="hideDialog"
                    >
                        {{ $t('common.close') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <validate
            @after-click-confirm="checkNameDocument"
            @after-click-ignore="showNoteChangeName = false"
            :title="$t('common.note')"
            :message="messageValidate"
            :isShowAction="true"
            ref="validate"
        />
    </div>
</template>
<script>
import FormTpl from './../../../components/common/FormTpl.vue';
import { util } from './../../../plugins/util.js';
import { documentApi } from './../../../api/Document.js';
import { formulasApi } from './../../../api/Formulas.js';
import Validate from './../common/Validate';
import SystemDataMapping from './../editor/SystemDataMapping';
import BPMNEngine from './../../../api/BPMNEngine';
export default {
    components: {
        'form-save-doc': FormTpl,
        validate: Validate,
        SystemDataMapping,
    },
    props: {
        instance: {
            type: Number,
            default: Date.now(),
        },
        isConfigPrint: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        editorStore() {
            return this.$store.state.document.editor[this.instance];
        },
        documentProps() {
            return this.$store.state.document.documentProps[this.instance];
        },
    },
    watch: {
        'documentProps.titleObjectFormulas.formulasId': function (data) {
            let self = this;
            if (data != 0) {
                formulasApi.detailFormulas(data).then((res) => {
                    self.oldTitleDocument = self.documentProps.titleObjectFormulas.value =
                        res.data.lastContent;
                });
            }
        },
        isShowModelSaveDoc(vl) {
            if (vl == false) {
                this.isDisableSave = false;
            }
        },
    },
    data() {
        return {
            listRows: [],
            isValidNote: true,
            isValideTitleFml: true,
            isShowModelSaveDoc: false,
            isValidName: true,
            isValidTitle: true,
            messageValidate: '',
            showNoteChangeName: false,
            showValidate: true,
            isQuickSave: false,
            isDisableSave: false,
            oldTitleDocument: ''
        };
    },
    created() {
        this.setPropsOfDoc({});
    },
    methods: {
        getListModels() {
            let thisCpn = this;
            if (this.documentProps.updateByWorkflowId.options.length == 0) {
                BPMNEngine.getListModels({ pageSize: 1000 }).then((res) => {
                    let listWorkFlow = res.data.listObject;
                    listWorkFlow = listWorkFlow.reduce((arr, obj) => {
                        arr.push({
                            id: obj.id,
                            name: obj.name,
                            title: obj.description,
                        });
                        return arr;
                    }, []);
                    thisCpn.documentProps.updateByWorkflowId.options =
                        listWorkFlow;
                });
            }
        },
        checkNameDocument() {
            this.$emit('check-name-document');
        },
        checkRequiredTitleObjFml() {
            let message = '';
            if (!this.documentProps.titleObjectFormulas.value) {
                this.isValideTitleFml = false;
                message = this.$t('document.validate.emptyTitle');
                this.isDisableSave = false;
            } else {
                this.isValideTitleFml = true;
                message = '';
            }
            this.documentProps.titleObjectFormulas.validateStatus.isValid =
                this.isValideTitleFml;
            this.documentProps.titleObjectFormulas.validateStatus.message =
                message;
        },
        checkRequiredNote() {
            let message = '';
            if (!this.documentProps.note.value) {
                this.isValidNote = false;
                message = this.$t('document.validate.emptyNote');
                this.isDisableSave = false;
            } else {
                this.isValidNote = true;
                message = '';
            }
            this.documentProps.note.validateStatus.isValid = this.isValidNote;
            this.documentProps.note.validateStatus.message = message;
        },
        //Hàm kiểm tra tên document đã tồn tai hay chưa
        handleChangeInput(name, input, data) {
            if (name == 'name') {
                this.showNoteChangeName = true;
                let thisCpn = this;
                documentApi
                    .checkExistDocument(input.value)
                    .then((res) => {
                        if (res.status == 200) {
                            let message = '';
                            if (res.data === true) {
                                message = this.$t(
                                    'document.validate.docNameExist',
                                );
                                thisCpn.isValidName = false;
                            } else {
                                thisCpn.isValidName = true;
                            }
                            this.documentProps.name.validateStatus.isValid =
                                thisCpn.isValidName;
                            this.documentProps.name.validateStatus.message =
                                message;
                        }
                    })
                    .catch((err) => {})
                    .finally(() => {});
            }
        },
        showDialog(quickSave = false) {
            this.isShowModelSaveDoc = true;
            this.isQuickSave = quickSave;
            this.getListModels();
        },
        hideDialog() {
            this.isShowModelSaveDoc = false;
        },
        // Hàm kiểm tra tên document
        checkValidateNameDocument(value) {
            let message = '';
            if (value.length == 0) {
                message = this.$t('document.validate.emptyName');
                this.isValidName = false;
                this.isDisableSave = false;
            } else {
                if (/^[a-z_$][a-z_$0-9]*$/.test(value) == false) {
                    message = this.$t('document.validate.nameNotValid');
                    this.isValidName = false;
                    this.isDisableSave = false;
                } else {
                    this.isValidName = true;
                }
            }
            this.documentProps.name.validateStatus.isValid = this.isValidName;
            this.documentProps.name.validateStatus.message = message;
        },
        saveDocument() {
            this.isDisableSave = true;
            if (this.isConfigPrint) {
                this.$emit('save-form-print-action', this.documentProps);
            } else {
                if (
                    this.showValidate &&
                    this.showNoteChangeName &&
                    this.$getRouteName() == 'editDocument'
                ) {
                    this.showValidate = false;
                    this.messageValidate = this.$t(
                        'document.validate.checkNameRelate',
                    );
                    this.$refs.validate.show(false);
                    this.isDisableSave = false;
                } else {
                    this.checkValidateNameDocument(
                        this.documentProps.name.value,
                    );
                    this.checkTitleDocument();
                    this.checkRequiredNote();
                    this.checkRequiredTitleObjFml();
                    if (
                        this.isValidName &&
                        this.isValidTitle &&
                        this.isValidNote &&
                        this.isValideTitleFml
                    ) {
                        this.saveFormulasForRecord();
                    }
                }
            }
        },

        async saveFormulasForRecord() {
            if (this.$getRouteName() == 'editDocument') {
                this.$refs.systemDataMapping.editMapping(this.$route.params.id);
            }
            if (this.documentProps.titleObjectFormulas.formulasId != 0 && this.documentProps.titleObjectFormulas.value != this.oldTitleDocument) {
                let formulas = {};
                formulas['syql'] = this.documentProps.titleObjectFormulas.value;
                let formulaId =
                    this.documentProps.titleObjectFormulas.formulasId;
                let res = await formulasApi.updateFormulas(formulaId, formulas);
                if (res.status != 200) {
                    let formulas = {};
                    formulas['syql'] =
                        this.documentProps.titleObjectFormulas.value;
                    formulas['objectType'] = 'document';
                    formulas['objectIdentifier'] =
                        this.documentProps.name.value;
                    formulas['context'] = '';
                    let res = await formulasApi.saveFormulas(formulas);
                    if (res.status == 200) {
                        let formulaId = res.data['formulaId'];
                        this.documentProps.titleObjectFormulas.formulasId =
                            formulaId;
                    }
                }
            } else if (this.documentProps.titleObjectFormulas.value && this.documentProps.titleObjectFormulas.value != this.oldTitleDocument) {
                let formulas = {};
                formulas['syql'] =
                    this.documentProps.titleObjectFormulas.value;
                formulas['objectType'] = 'document';
                formulas['objectIdentifier'] =
                    this.documentProps.name.value;
                formulas['context'] = '';
                let res = await formulasApi.saveFormulas(formulas);
                if (res.status == 200) {
                    let formulaId = res.data['formulaId'];
                    this.documentProps.titleObjectFormulas.formulasId =
                        formulaId;
                }
            }
            this.$emit('save-doc-action', {
                isQuickSave: this.isQuickSave,
            });
            this.isShowModelSaveDoc = false;
        },
        /**
         * Hàm kiểm tra tiêu đề của doc đã điền hay chưa, nếu chưa thì báo lỗi
         */
        checkTitleDocument() {
            let message = '';
            if (!this.documentProps.title.value) {
                this.isValidTitle = false;
                message = this.$t('document.validate.emptyTitle');
                this.isDisableSave = false;
            } else {
                this.isValidTitle = true;
                message = '';
            }

            this.documentProps.title.validateStatus.isValid = this.isValidTitle;
            this.documentProps.title.validateStatus.message = message;
        },
        setPropsOfDoc(props) {
            if (!props.name) {
                this.isValidName = false;
            } else {
                this.isValidName = true;
            }
            if (!props.title) {
                this.isValidTitle = false;
            } else {
                this.isValidTitle = true;
            }
            if (!props.note) {
                this.isValidNote = false;
            } else {
                this.isValidNote = true;
            }
            if (!props.titleObjectFormulas) {
                this.isValideTitleFml = false;
            } else {
                this.isValideTitleFml = true;
            }
            console.log(props, 'propsprops');
            let formStyle = props.formStyle;
            try {
                formStyle = JSON.parse(formStyle);
                if (formStyle) {
                    formStyle = formStyle['globalClass'];
                }
            } catch (error) {}
            let self = this;
            let docProps = {
                name: {
                    title: this.$t('document.editor.dialog.saveDoc.name'),
                    type: 'text',
                    value: props.name != undefined ? props.name : '',
                    appendIcon: 'mdi-checkbox-multiple-marked-circle-outline',
                    oldName: props.name != undefined ? props.name : '',
                    validateStatus: {
                        isValid: true,
                        message: '',
                    },
                    validate() {
                        self.checkValidateNameDocument(this.value);
                    },
                },
                title: {
                    title: this.$t('document.editor.dialog.saveDoc.title'),
                    type: 'text',
                    value: props.title != undefined ? props.title : '',
                    validateStatus: {
                        isValid: true,
                        message: '',
                    },
                    validate() {
                        self.checkTitleDocument(this.value);
                    },
                },
                updateByWorkflowId: {
                    title: this.$t(
                        'document.editor.dialog.saveDoc.updateByWorkflow',
                    ),
                    type: 'autocomplete',
                    value:
                        props.updateByWorkflowId != undefined
                            ? props.updateByWorkflowId
                            : '',
                    options: [],
                    validateStatus: {
                        isValid: true,
                        message: '',
                    },
                },
                fullSize: {
                    title: this.$t('document.editor.dialog.saveDoc.fullSize'),
                    type: 'checkbox',
                    value: parseInt(props.isFullSize) === 0 ? false : true,
                },
                allowSubmitOutsideWorkflow: {
                    title: this.$t('v2.doc.submitOutsideProcess'),
                    type: 'checkbox',
                    value: parseInt(props.isFullSize) === 0 ? false : true,
                },
                type: {
                    title: this.$t('document.editor.dialog.saveDoc.type'),
                    type: 'select',
                    value:
                        isNaN(Number(props.type)) || Number(props.type) == 0
                            ? 1
                            : Number(props.type),
                    options: [
                        {
                            text: this.$t(
                                'document.editor.dialog.saveDoc.selectType.list',
                            ),
                            value: 2,
                        },
                        {
                            text: this.$t(
                                'document.editor.dialog.saveDoc.selectType.system',
                            ),
                            value: 3,
                        },
                        {
                            text: this.$t(
                                'document.editor.dialog.saveDoc.selectType.business',
                            ),
                            value: 1,
                        },
                        {
                            text: this.$t('v2.doc.documentConfigFieldIssue'),
                            value: 4,
                        },
                    ],
                },

                note: {
                    title: this.$t('document.editor.dialog.saveDoc.note'),
                    type: 'textarea',
                    value: props.note != undefined ? props.note : '',
                    validateStatus: {
                        isValid: true,
                        message: '',
                    },
                    validate() {
                        self.checkRequiredNote(this.value);
                    },
                },
                titleObjectFormulas: {
                    title: this.$t(
                        'document.editor.dialog.saveDoc.titleObject',
                    ),
                    value: '',
                    validateStatus: {
                        isValid: true,
                        message: '',
                    },
                    validate() {
                        self.checkRequiredTitleObjFml(this.value);
                    },
                    formulasId:
                        props.titleObjectFormulasId != undefined
                            ? props.titleObjectFormulasId
                            : 0,
                    type: 'script',
                    groupType: 'formulas',
                },
                formStyle: {
                    title: this.$t('document.editor.dialog.saveDoc.formStyle'),
                    type: 'select',
                    value: formStyle
                        ? formStyle
                        : 'document-form-style-default',
                    options: [
                        {
                            text: this.$t('v2.doc.default'),
                            value: 'document-form-style-default',
                        },
                        {
                            text: this.$t('v2.doc.borderInput'),
                            value: 'document-form-style-custom-1',
                        },
                    ],
                },
            };
            if (this.isConfigPrint) {
                docProps = {
                    title: {
                        title: this.$t(
                            'document.editor.dialog.saveDoc.titlePrint',
                        ),
                        type: 'text',
                        value: props.title != undefined ? props.title : '',
                    },
                };
            }

            this.$store.commit('document/addToDocumentPropsEditor', {
                key: this.instance,
                value: docProps,
            });
        },
    },
};
</script>
<style scoped>
.headline {
    font-size: 16px !important;
    font-weight: 500;
    padding: 4px 24px;
}
.action {
    height: 41px;
}
.note-name-change {
    position: absolute;
    right: 40px;
    top: 38px;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    background: #707070;
    z-index: 999;
    padding: 2px 8px;
    border-radius: 4px;
    transition: all ease-in-out 250ms;
}
.note-name-change > span {
    color: white;
    font-size: 12px;
}
.buble-direction {
    position: relative;
}
.buble-direction span {
    position: absolute;
    color: #707070;
    top: -8px;
    right: 10px;
}
</style>
<style>
.s-dialog {
    overflow: hidden;
}
</style>

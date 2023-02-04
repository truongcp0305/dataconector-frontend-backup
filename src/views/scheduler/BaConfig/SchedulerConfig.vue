<template>
    <div class="w-100 h-100 ma-3">
        <div class="header d-flex justify-space-between mx-7 mb-3">
            <span class="fw-430 fs-15">
                {{ $t('scheduler.' + action + '.title') }}
            </span>
            <div>
                <v-btn
                    @click="exit()"
                    depressed
                    small
                    color="#F2F2F2"
                    v-if="action != 'view'"
                    class="mr-2"
                >
                    {{ $t('common.exit') }}
                </v-btn>
                <v-btn
                    @click="save()"
                    depressed
                    small
                    color="success"
                    v-if="action != 'view'"
                    :loading="isLoadingSaveScheduler"
                    :disabled="isLoadingSaveScheduler"
                >
                    {{ $t('common.save') }}
                </v-btn>
                <v-btn
                    @click="editScheduler()"
                    depressed
                    small
                    color="orange"
                    v-else
                >
                    <span style="color: white">{{
                        $t('scheduler.edit.button-text')
                    }}</span>
                </v-btn>
            </div>
        </div>
        <Stepper
            :tabConfig="tabConfig"
            :action="action"
            @show-stepper="showStepper"
            :disableBtnNextStep="disableBtnNextStep"
            :error="error"
            ref="stepScheduler"
        >
            <div slot="step1" class="h-100">
                <SchedulerGeneralInfo
                    class="mb-2"
                    :data="schedulerConfig.generalInfo"
                    :typeAction="action"
                />
                <div v-show="error.notEmtyDoc" class="mb-1">
                    <span class="fs-12 color-red">{{ error.notEmtyDoc }}</span>
                </div>
            </div>
            <div slot="step2" class="h-100 mb-4">
                <SchedulerGeneralConfig
                    class="mb-2"
                    :action="action"
                    :groupConfig="schedulerConfig.groupConfig"
                    :formulaUpdate="schedulerConfig.formulaUpdate"
                />
                <div v-show="error.notEmtyName" class="mb-1">
                    <span class="fs-12 color-red">{{ error.notEmtyName }}</span>
                </div>
            </div>
            <div slot="step3" class="h-100">
                <SchedulerCardConfig
                    :cardConfig="schedulerConfig.cardConfig"
                    :listColumn="listColumn"
                    :action="action"
                    @change-format="changeFormat"
                    :conditionalFormatConfig="schedulerConfig.conditionalFormat"
                />
            </div>
            <div slot="step4" class="h-100">
                <span class="my-2 fs-13 mt-6">
                    {{ $t('table.tree_view.divide_level') }}
                </span>
                <i
                    class="mdi mdi-message-question color-red fs-15 ml-1"
                    style="line-height: 28px; cursor: pointer"
                    @click="isShowMoreInforFormulaValue = true"
                ></i>
                <TreeConfig
                    ref="dialogTreeConfig"
                    :tableColumns="listColumn"
                    :item="schedulerConfig.treeConfig"
                    :action="action"
                    :isConfigNameGroup="false"
                    :noLimitTree="true"
                    style="height: 570px;"
                />
            </div>
        </Stepper>

        <SymperDialogConfirm
            @confirm="confirmDeleteInfo.confirm()"
            @cancel="confirmDeleteInfo.cancel()"
            :title="confirmDeleteInfo.title"
            :content="confirmDeleteInfo.content"
            :showDialog="confirmDeleteInfo.show"
        />
        <v-dialog v-model="isShowMoreInforFormulaValue" max-width="550">
            <v-card>
                <v-card-title class="text-h7">
                    {{ $t('scheduler.treeConfig.title') }}
                    <v-spacer></v-spacer>
                    <v-btn
                        x-small
                        icon
                        @click="isShowMoreInforFormulaValue = false"
                    >
                        <i class="mdi mdi-close fs-16"></i>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <li class="color-black">
                        {{ $t('scheduler.treeConfig.instruc1') }}
                    </li>

                    <li class="color-black mt-1">
                        {{ $t('scheduler.treeConfig.instruc2') }}
                    </li>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
import { schedulerApi } from '@/api/scheduler.js';
import { documentApi } from '@/api/Document';

import SchedulerCardConfig from './SchedulerCardConfig';
import SchedulerGeneralInfo from './SchedulerGeneralInfo.vue';
import SchedulerGeneralConfig from './SchedulerGeneralConfig.vue';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
import Stepper from '@/components/common/Stepper.vue';
import TreeConfig from '@/components/common/listItemComponents/TreeConfig';

export default {
    name: 'SchedulerConfig',
    components: {
        SchedulerGeneralInfo,
        SchedulerGeneralConfig,
        SchedulerCardConfig,
        SymperDialogConfirm,
        Stepper,
        TreeConfig
    },
    props: {
        action: {
            type: String,
            default: 'create'
        },
        id: {
            default: ''
        }
    },
    computed: {
        documentId() {
            return this.schedulerConfig.generalInfo.document.value;
        },
        nameDoc() {
            return this.schedulerConfig.generalInfo.name.value;
        },
        disableBtnNextStep() {
            return (
                !this.schedulerConfig.generalInfo.name.value ||
                !this.schedulerConfig.generalInfo.document.value ||
                !this.schedulerConfig.generalInfo.name.validateStatus.isValid ||
                !this.schedulerConfig.generalInfo.description.validateStatus
                    .isValid ||
                this.checkValidateGroup()
            );
        }
    },
    watch: {
        async documentId() {
            await this.getAllControl();
            if (this.documentId) {
                this.error.notEmtyDoc = '';
            }
            this.firstGetData++;
            if (this.firstGetData != 1) {
                this.refreshAllData();
            }
            if (this.firstGetData == 1 && this.action != 'create') {
                this.restoreIdControlToDataControl();
            }
            this.schedulerConfig.generalInfo.document.options.map((doc) => {
                if (doc.id == this.documentId) {
                    this.schedulerConfig.generalInfo.document.name_doc =
                        doc.name;
                    this.schedulerConfig.generalInfo.document.title_doc =
                        doc.title;
                }
            });
        }
    },
    created() {
        this.getAllDocument();
        if (this.action != 'create') {
            this.restoreSchedulerView(this.id);
        }
    },
    data() {
        const self = this;
        return {
            error: {
                notEmtyDoc: '',
                notEmtyName: '',
                validate: ''
            },
            tabConfig: [
                {
                    key: 'general_info',
                    text: this.$t('scheduler.general_info'),
                    description: this.$t('scheduler.general_info_description')
                },
                {
                    key: 'general_config',
                    text: this.$t('scheduler.general_config'),
                    description: this.$t('scheduler.general_config_description')
                },
                {
                    key: 'config_card',
                    text: this.$t('scheduler.config_card'),
                    description: this.$t('scheduler.config_card_description')
                },
                {
                    key: 'config_tree',
                    text: this.$t('scheduler.config_tree'),
                    description: this.$t('scheduler.config_tree_description')
                }
            ],
            listColumn: [],
            schedulerConfig: {
                generalInfo: {
                    name: {
                        title: this.$t('scheduler.general_infor.name'),
                        placeholder: this.$t(
                            'scheduler.general_infor.name_placeholder'
                        ),
                        type: 'text',
                        value: '',
                        info: '',
                        minWidth: '244px',
                        required: true,
                        validateStatus: {
                            isValid: true,
                            message: ''
                        },
                        validate() {
                            this.validateStatus.isValid = true;
                            this.validateStatus.message = '';
                            self.error.notEmtyName = '';
                            self.error.validate = '';
                            if (this.value == '' || this.value.trim() == '') {
                                this.validateStatus.isValid = false;
                                this.validateStatus.message =
                                    self.$t('validate.required');
                                self.error.notEmtyName =
                                    self.$t('validate.required');
                            }
                            if (this.value.length > 120) {
                                this.validateStatus.isValid = false;
                                this.validateStatus.message =
                                    self.$t('validate.max_120');
                                self.error.validate =
                                    self.$t('validate.max_120');
                            }
                        }
                    },
                    description: {
                        title: this.$t('scheduler.general_infor.description'),
                        placeholder: this.$t(
                            'scheduler.general_infor.description_placeholder'
                        ),
                        type: 'text',
                        value: '',
                        info: '',
                        minWidth: '488px',
                        validateStatus: {
                            isValid: true,
                            message: ''
                        },
                        validate() {
                            this.validateStatus.isValid = true;
                            this.validateStatus.message = '';
                            self.error.validate = '';
                            if (this.value.length > 120) {
                                this.validateStatus.isValid = false;
                                this.validateStatus.message =
                                    self.$t('validate.max_120');
                                self.error.validate =
                                    self.$t('validate.max_120');
                            }
                        }
                    },
                    document: {
                        title: this.$t('scheduler.general_infor.doc'),
                        placeholder: this.$t(
                            'scheduler.general_infor.doc_placeholder'
                        ),
                        type: 'autocomplete',
                        value: '',
                        info: '',
                        required: true,
                        isSelectionChip: false,
                        subInfo: 'title',
                        textKey: 'name',
                        minWidth: '244px',
                        showId: true,
                        onSearch(value) {
                            self.searchDocument(value);
                        },
                        options: [],
                        name_doc: '',
                        title_doc: ''
                    }
                },
                cardConfig: {},
                conditionalFormat: [],
                groupConfig: [],
                formulaUpdate: {
                    script: {
                        marginTop: '4px',
                        title: this.$t('scheduler.formulaUpdate.title'),
                        type: 'script',
                        value: '',
                        info: '',
                        style: {
                            height: '100px'
                        },
                        titleFontWeight: 500,
                        moreInfor: true
                    },
                    checkbox: {
                        title: this.$t('kanban.openFormWhenDrag'),
                        type: 'checkbox',
                        value: '',
                    },
                },
                treeConfig: {
                    children: []
                }
            },
            confirmDeleteInfo: {
                title: this.$t('scheduler.exit_confirm_title'),
                content: this.$t('scheduler.exit_confirm_content'),
                cancel() {},
                confirm() {},
                show: false
            },
            nameSchedulerEdit: '',
            docSchedulerEdit: '',
            firstGetData: 0,
            isLoadingSaveScheduler: false,
            isShowMoreInforFormulaValue: false
        };
    },
    methods: {
        showStepper(stepper) {
            this.error.notEmtyDoc = '';
            if (
                !this.schedulerConfig.generalInfo.document.value &&
                this.action != 'view'
            ) {
                this.error.notEmtyDoc =
                    this.$t('validate.required') + ' document';
            }
        },
        checkValidateGroup() {
            if (this.$refs.stepScheduler.stepper == 2) {
                let check = this.schedulerConfig.groupConfig.some(
                    (col) => col.nameGroup.name.value == ''
                );
                if (check) {
                    this.error.notEmtyName = this.$t(
                        'scheduler.error.notEmtyName'
                    );
                } else {
                    this.error.notEmtyName = '';
                }
                return check;
            } else return false;
        },
        getAllDocument() {
            this.searchDocument(' ');
        },
        refreshAllData() {
            this.schedulerConfig.cardConfig = {};
        },
        // lấy tất cả control trong doc
        async getAllControl() {
            const self = this;
            self.listColumn = [];
            let res = await documentApi.getAllControl(this.documentId);
            if (res.status === 200) {
                for (let f in res.data) {
                    let data = {
                        id: res.data[f].id,
                        field: res.data[f].name,
                        name: res.data[f].title,
                        type: res.data[f].type,
                        headerName: res.data[f].title
                    };
                    if (res.data[f].inTable) {
                        data.inTable = {
                            id: res.data[f].inTable,
                            field: res.data[f].table.name,
                            name: res.data[f].table.title,
                            type: res.data[f].table.type,
                            headerName: res.data[f].table.title
                        };
                    }
                    self.listColumn.push(data);
                }
            }
        },
        searchById(docId) {
            const self = this;
            let filter = {
                filter: [
                    {
                        column: 'id',
                        operation: 'and',
                        conditions: [
                            {
                                name: 'in',
                                value: [docId]
                            }
                        ]
                    }
                ],
                page: 1,
                pageSize: 10
            };
            documentApi.getListDocumentFilter(filter).then((res) => {
                if (res.status == 200) {
                    if (res.data.listObject.length == 0) {
                        this.schedulerConfig.generalInfo.document.options = [];
                        this.schedulerConfig.generalInfo.document.value = '';
                    } else {
                        self.schedulerConfig.generalInfo.document.options.push(
                            res.data.listObject[0]
                        );
                    }
                }
            });
        },
        // search document
        searchDocument(docName) {
            const self = this;
            let data = {
                search: docName,
                page: 1,
                pageSize: 50
            };
            if (docName != null) {
                documentApi.getListDocumentFilter(data).then((res) => {
                    if (res.status == 200) {
                        self.schedulerConfig.generalInfo.document.options =
                            res.data.listObject;
                    }
                });
            }
        },
        async save() {
            this.isLoadingSaveScheduler = true;
            let err = false;
            
            // check trùng doc
            let isExistDocScheduler = await schedulerApi.checkExistDocScheduler(
                this.schedulerConfig.generalInfo.document.value
            );
            if (isExistDocScheduler.status == 200) {
                if (isExistDocScheduler.data != false) {
                    if (this.action == 'edit') {
                        if (
                            this.docSchedulerEdit !=
                            this.schedulerConfig.generalInfo.document.value
                        ) {
                            err = true;
                            this.$snotify({
                                type: 'error',
                                title: this.$t('scheduler.error.errSave'),
                                text: this.$t(
                                    'scheduler.error.duplicate_doc_scheduler'
                                )
                            });
                            this.isLoadingSaveScheduler = false;
                            return;
                        }
                    } else {
                        err = true;
                        this.$snotify({
                            type: 'error',
                            title: this.$t('scheduler.error.errSave'),
                            text: this.$t(
                                'scheduler.error.duplicate_doc_scheduler'
                            )
                        });
                        this.isLoadingSaveScheduler = false;
                        return;
                    }
                }
            } else {
                this.$snotifyError('',this.$t('scheduler.error.errSave'));
            }

            if (
                this.schedulerConfig.generalInfo.name.value.trim() == '' ||
                this.schedulerConfig.generalInfo.document.value.trim() == '' ||
                Object.keys(this.schedulerConfig.cardConfig).length == 0 ||
                !this.schedulerConfig.cardConfig.title ||
                !this.schedulerConfig.cardConfig.start_date ||
                !this.schedulerConfig.cardConfig.end_date ||
                !this.schedulerConfig.cardConfig.start_time ||
                !this.schedulerConfig.cardConfig.end_time ||
                this.checkValidateGroup()
            ) {
                this.$snotify({
                    type: 'error',
                    title: this.$t('scheduler.error.errSave'),
                    text: this.$t('scheduler.error.validate')
                });
                err = true;
                this.isLoadingSaveScheduler = false;
                return;
            }

            // check trùng tên scheduler
            let isExistNameScheduler =
                await schedulerApi.checkExistNameScheduler(
                    this.schedulerConfig.generalInfo.name.value
                );
            if (isExistNameScheduler.status == 200) {
                if (isExistNameScheduler.data != false) {
                    if (this.action == 'edit') {
                        if (
                            this.nameSchedulerEdit !=
                            this.schedulerConfig.generalInfo.name.value
                        ) {
                            err = true;
                            this.$snotify({
                                type: 'error',
                                title: this.$t('scheduler.error.errSave'),
                                text: this.$t(
                                    'scheduler.error.duplicate_name_scheduler'
                                )
                            });
                            this.isLoadingSaveScheduler = false;
                            return;
                        }
                    } else {
                        err = true;
                        this.$snotify({
                            type: 'error',
                            title: this.$t('scheduler.error.errSave'),
                            text: this.$t(
                                'scheduler.error.duplicate_name_scheduler'
                            )
                        });
                        this.isLoadingSaveScheduler = false;
                        return;
                    }
                }
            } else {
                this.$snotifyError('',this.$t('scheduler.error.errSave'));
            }
            if(this.$refs.dialogTreeConfig && this.$refs.dialogTreeConfig.validateEmptyValue()){
                err = true;
                this.$snotify({
                    type: 'error',
                    title: this.$t('scheduler.error.errSave'),
                    text: this.$t(
                        'scheduler.error.validateTree'
                    )
                });
                this.isLoadingSaveScheduler = false;
                return;
            }
            if(this.$refs.dialogTreeConfig && !this.$refs.dialogTreeConfig.validate()){
                err = true;
                this.$snotify({
                    type: 'error',
                    title: this.$t('scheduler.error.errSave'),
                    text: this.$t(
                        'scheduler.error.duplicateTree'
                    )
                });
                this.isLoadingSaveScheduler = false;
                return;                
            }

            if (err == false) {
                let data = {};
                data.name = this.schedulerConfig.generalInfo.name.value.trim();
                data.description =
                    this.schedulerConfig.generalInfo.description.value;
                data.id_doc = this.schedulerConfig.generalInfo.document.value;
                data.name_doc =
                    this.schedulerConfig.generalInfo.document.name_doc;
                data.title_doc =
                    this.schedulerConfig.generalInfo.document.title_doc;
                data.group_config = JSON.stringify(
                    this.schedulerConfig.groupConfig
                );
                data.formula_update = JSON.stringify(
                    this.schedulerConfig.formulaUpdate
                );
                data.card_config = JSON.stringify(
                    this.schedulerConfig.cardConfig
                );
                data.conditional_format = JSON.stringify(
                    this.schedulerConfig.conditionalFormat
                );
                data.tree_config = JSON.stringify(
                    this.schedulerConfig.treeConfig
                );
                if (this.action == 'create') {
                    schedulerApi.createScheduler(data).then((res) => {
                        if (res.status == 200) {
                            this.isLoadingSaveScheduler = false;
                            this.$snotify({
                                type: 'success',
                                title: this.$t('scheduler.notify.save-success')
                            });
                            this.$goToPage('/scheduler/');
                        } else {
                            this.$snotifyError('',this.$t('scheduler.error.errSave'));
                        }
                    });
                } else if (this.action == 'edit') {
                    try {
                        schedulerApi
                            .updateScheduler(this.id, data)
                            .then((res) => {});
                        this.isLoadingSaveScheduler = false;
                        this.$snotify({
                            type: 'success',
                            title: this.$t('scheduler.notify.save-success')
                        });
                        this.$goToPage('/scheduler/');
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        },

        changeFormat(data) {
            this.schedulerConfig.conditionalFormat = data;
        },
        setGeneralInfo(data) {
            this.schedulerConfig.generalInfo.name.value = data.name;
            this.schedulerConfig.generalInfo.document.value = data.id_doc;
            this.schedulerConfig.generalInfo.document.name_doc = data.name_doc;
            this.schedulerConfig.generalInfo.document.title_doc =
                data.title_doc;
            this.schedulerConfig.generalInfo.description.value =
                data.description;
            let checkExist =
                this.schedulerConfig.generalInfo.document.options.filter(
                    (doc) => doc.id == data.id_doc
                );
            if (checkExist.length == 0) {
                this.searchById(data.id_doc);
            }
        },
        restoreIdControlToDataControl() {
            let mapIdControlToDataControl = {};
            for (let index = 0; index < this.listColumn.length; index++) {
                const element = this.listColumn[index];
                mapIdControlToDataControl[element.id] = element;
            }
            for (let control in this.schedulerConfig.cardConfig) {
                let col =
                    mapIdControlToDataControl[
                        this.schedulerConfig.cardConfig[control].id
                    ];
                if (col) {
                    this.schedulerConfig.cardConfig[control] = col;
                } else {
                    delete this.schedulerConfig.cardConfig[control];
                }
            }
        },
        async restoreSchedulerView(id) {
            try {
                let res = await schedulerApi.getSchedulerById(id);
                if (res.status == 200) {
                    this.nameSchedulerEdit = res.data.name;
                    this.docSchedulerEdit = res.data.id_doc;
                    this.setGeneralInfo(res.data);
                    this.schedulerConfig.groupConfig = JSON.parse(
                        res.data.group_config
                    );
                    this.schedulerConfig.cardConfig = JSON.parse(
                        res.data.card_config
                    );
                    this.schedulerConfig.formulaUpdate = JSON.parse(
                        res.data.formula_update
                    );
                    if(!this.schedulerConfig.formulaUpdate.checkbox){
                        this.schedulerConfig.formulaUpdate.script.style.height = '100px';
                        this.schedulerConfig.formulaUpdate.checkbox = {
                            title: this.$t('kanban.openFormWhenDrag'),
                            type: 'checkbox',
                            value: '',
                        }
                    }
                    this.schedulerConfig.formulaUpdate.checkbox.title = this.$t('kanban.openFormWhenDrag')
                    this.schedulerConfig.formulaUpdate.script.title = this.$t('scheduler.formulaUpdate.title')
                    this.schedulerConfig.conditionalFormat = JSON.parse(
                        res.data.conditional_format
                    );
                    if(res.data.tree_config){
                        this.schedulerConfig.treeConfig = JSON.parse(
                            res.data.tree_config
                        );
                    }else {
                        this.schedulerConfig.treeConfig = {
                            children: []
                        }
                    }
                    this.checkKeyCondition(
                        this.schedulerConfig.conditionalFormat
                    );
                } else {
                    this.$snotifyError(
                        res,
                        this.$t('scheduler.error.errAPI'),
                        res.message
                    );
                }
            } catch (error) {
                this.$snotifyError(error, this.$t('scheduler.error.errAPI'));
            }
        },
        checkKeyCondition(listCondition) {
            for (let idx in listCondition) {
                if (!listCondition[idx].key) {
                    listCondition[idx].key = idx;
                }
            }
        },
        editScheduler() {
            this.$goToPage('/scheduler/' + this.id + '/edit');
        },
        exit() {
            this.confirmDeleteInfo.show = true;
            this.confirmDeleteInfo.confirm = () => {
                this.confirmDeleteInfo.show = false;
                this.$goToPage('/scheduler/');
            };
            this.confirmDeleteInfo.cancel = () => {
                this.confirmDeleteInfo.show = false;
            };
        }
    }
};
</script>
<style scoped></style>

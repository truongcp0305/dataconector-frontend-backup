<template>
    <div class="config-kanban w-100 h-100 ma-3">
        <div class="header d-flex justify-space-between mx-7 mb-3 mr-13">
            <span class="fw-430 fs-15">
                {{ $t('kanban.' + action + '.title') }}
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
                    :loading="isLoadingSaveKanban"
                    :disabled="isLoadingSaveKanban"
                >
                    {{ $t('common.save') }}
                </v-btn>
                <v-btn
                    @click="editKanban()"
                    depressed
                    small
                    color="orange"
                    v-else
                >
                    <span style="color: white">{{
                        $t('kanban.edit.button-text')
                    }}</span>
                </v-btn>
            </div>
        </div>
        <div class="stepper pr-5">
            <v-stepper v-model="stepper" vertical>
                <!-- step-1 -->
                <v-stepper-step
                    color="#FB7E00"
                    :complete="maxStep > 1"
                    class="fs-13"
                    @click="showStepper(1)"
                    step="1"
                >
                    {{ tabConfig[0].text }}
                    <small class="fs-11 color-grey mt-2">{{
                        tabConfig[0].description
                    }}</small>
                </v-stepper-step>
                <v-stepper-content step="1">
                    <StepperGeneralInfo
                        class="mb-2"
                        :data="kanbanConfig.generalInfo"
                        :typeAction="action"
                    />
                    <div v-show="error.notEmtyDoc" class="mb-1">
                        <span class="fs-12 color-red">{{
                            error.notEmtyDoc
                        }}</span>
                    </div>
                    <v-btn
                        small
                        v-show="action == 'create' && maxStep <= 1"
                        :disabled="hideBtnNextStep2"
                        color="primary"
                        class="mb-3"
                        @click="stepper = 2"
                        >{{ $t('common.continue') }}</v-btn
                    >
                </v-stepper-content>
                <!-- step-2 -->
                <v-stepper-step
                    color="#FB7E00"
                    class="fs-13"
                    :complete="maxStep > 2"
                    @click="showStepper(2)"
                    step="2"
                >
                    {{ tabConfig[1].text }}
                    <small class="fs-11 color-grey mt-2">{{
                        tabConfig[1].description
                    }}</small>
                </v-stepper-step>
                <v-stepper-content step="2">
                    <StepperColumnConfig
                        @change-name-column="changeNameColumn"
                        @add-column="addColumn"
                        @delete-column="deleteColumn"
                        :columnConfig="kanbanConfig.columnConfig"
                        :typeAction="action"
                    />
                    <div v-show="error.notEmtyName" class="mb-1">
                        <span class="fs-12 color-red">{{
                            error.notEmtyName
                        }}</span>
                    </div>
                    <v-btn
                        v-show="action == 'create' && maxStep <= 2"
                        small
                        class="mb-1"
                        :disabled="
                            !kanbanConfig.columnConfig.allInput.control.value ||
                            checkValidateCol()
                        "
                        color="primary"
                        @click="nextToTabStateFlow"
                        >{{ $t('common.continue') }}</v-btn
                    >
                </v-stepper-content>
                <!-- step-3 -->
                <v-stepper-step
                    color="#FB7E00"
                    class="fs-13"
                    :complete="maxStep > 3"
                    @click="showStepper(3)"
                    step="3"
                >
                    {{ tabConfig[2].text }}
                    <small class="fs-11 color-grey mt-2">{{
                        tabConfig[2].description
                    }}</small>
                </v-stepper-step>
                <v-stepper-content step="3">
                    <StepperStateFlow
                        ref="stepperStateFlow"
                        @change-config-name="changeConfigName"
                        @show-error="showErrorStateFlow"
                        @delete-link="deleteLinkStateFlow"
                        :action="action"
                        :config="kanbanConfig"
                    />
                    <div v-show="error.notEmtyNameStateFlow" class="mb-1">
                        <span class="fs-12 color-red">{{
                            error.notEmtyNameStateFlow
                        }}</span>
                    </div>
                    <v-btn
                        small
                        v-show="action == 'create' && maxStep <= 3"
                        color="primary"
                        :disabled="
                            !checkValidateStateFlow &&
                            JSON.stringify(kanbanConfig.stateFlowConfig.node) !=
                                '{}'
                        "
                        @click="nextToTab4"
                        >{{ $t('common.continue') }}</v-btn
                    >
                </v-stepper-content>
                <!-- step-4 -->
                <v-stepper-step
                    color="#FB7E00"
                    class="fs-13"
                    @click="showStepper(4)"
                    :complete="maxStep > 4"
                    step="4"
                >
                    {{ tabConfig[3].text }}
                    <small class="fs-11 color-grey mt-2">{{
                        tabConfig[3].description
                    }}</small>
                </v-stepper-step>
                <v-stepper-content step="4">
                    <CardConfig
                        :cardConfig="kanbanConfig.cardConfig"
                        :docId="kanbanConfig.generalInfo.document.value"
                        @change-format="changeFormat"
                        :conditionalFormatConfig="
                            kanbanConfig.conditionalFormatConfig
                        "
                        :listColumn="listColumn"
                        :action="action"
                    />
                </v-stepper-content>
            </v-stepper>
        </div>
        <SymperDialogConfirm
            @confirm="confirmDeleteInfo.confirm()"
            @cancel="confirmDeleteInfo.cancel()"
            :title="confirmDeleteInfo.title"
            :content="confirmDeleteInfo.content"
            :showDialog="confirmDeleteInfo.show"
        />
    </div>
</template>
<script>
import { kanbanApi } from '@/api/kanban.js';
import { documentApi } from '@/api/Document';

import CardConfig from './CardConfig';
import StepperGeneralInfo from './StepperGeneralInfo.vue';
import StepperColumnConfig from './StepperColumnConfig.vue';
import StepperStateFlow from './StepperStateFlow.vue';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';

export default {
    name: 'KanbanConfig',
    components: {
        StepperGeneralInfo,
        StepperColumnConfig,
        CardConfig,
        StepperStateFlow,
        SymperDialogConfirm
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
            return this.kanbanConfig.generalInfo.document.value;
        },
        controlDoc() {
            return this.kanbanConfig.columnConfig.allInput.control.value;
        },
        nameDoc() {
            return this.kanbanConfig.generalInfo.name.value;
        },
        hideBtnNextStep2() {
            return (
                !this.kanbanConfig.generalInfo.name.value ||
                !this.kanbanConfig.generalInfo.document.value ||
                !this.kanbanConfig.generalInfo.name.validateStatus.isValid ||
                !this.kanbanConfig.generalInfo.description.validateStatus
                    .isValid
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
        },
        controlDoc() {
            if (this.controlDoc) {
            }
        },
        stepper() {
            if (this.stepper > this.maxStep) this.maxStep = this.stepper;
        }
    },
    created() {
        this.getAllDocument();
        if (this.action != 'create') {
            this.restoreKanbanView(this.id);
        }
        if (this.action == 'view') {
            this.kanbanConfig.generalInfo.name.disabled = true;
            this.kanbanConfig.generalInfo.description.disabled = true;
            this.kanbanConfig.generalInfo.document.disabled = true;
            this.kanbanConfig.columnConfig.allInput.control.disabled = true;
        }
    },
    data() {
        const self = this;
        return {
            checkValidateStateFlow: true,
            stepper: 1,
            error: {
                notEmtyDoc: '',
                notEmtyName: '',
                existNameCol: '',
                notEmtyNameStateFlow: ''
            },
            maxStep: 0,
            tabConfig: [
                {
                    key: 'general_info',
                    text: this.$t('kanban.general_info'),
                    description: this.$t('kanban.general_info_description')
                },
                {
                    key: 'config_column',
                    text: this.$t('kanban.config_column'),
                    description: this.$t('kanban.config_column_description')
                },
                {
                    key: 'state_flow',
                    text: this.$t('kanban.state_flow'),
                    description: this.$t('kanban.state_flow_description')
                },
                {
                    key: 'config_card',
                    text: this.$t('kanban.config_card'),
                    description: this.$t('kanban.config_card_description')
                }
            ],
            listColumn: [],
            kanbanConfig: {
                generalInfo: {
                    name: {
                        title: this.$t('v2.kanban.nameKanban'),
                        type: 'text',
                        value: '',
                        info: '',
                        minWidth: '488px',
                        required: true,
                        disabled: false,
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
                    },
                    description: {
                        title: this.$t('v2.kanban.description'),
                        type: 'textarea',
                        value: '',
                        info: '',
                        minWidth: '488px',
                        disabled: false,
                        validateStatus: {
                            isValid: true,
                            message: ''
                        },
                        validate() {
                            this.validateStatus.isValid = true;
                            this.validateStatus.message = '';
                            if (this.value.length > 200) {
                                this.validateStatus.isValid = false;
                                this.validateStatus.message =
                                    self.$t('vaidate.max_200');
                            }
                        }
                    },
                    document: {
                        title: this.$t('v2.kanban.selectDocument'),
                        type: 'autocomplete',
                        value: '',
                        info: '',
                        required: true,
                        isSelectionChip: false,
                        subInfo: 'title',
                        textKey: 'name',
                        minWidth: '488px',
                        showId: true,
                        onSearch(value) {
                            self.searchDocument(value);
                        },
                        options: [],
                        disabled: false
                    }
                },
                cardConfig: {},
                conditionalFormatConfig: [],
                columnConfig: {
                    allInput: {
                        control: {
                            title: this.$t('v2.kanban.selectControl'),
                            type: 'autocomplete',
                            value: '',
                            info: '',
                            required: true,
                            showId: false,
                            isSelectionChip: false,
                            options: [],
                            disabled: false
                        }
                    },
                    cols: [
                        { id: Date.now(), name: '', value: '' },
                        { id: Date.now() + 1, name: '', value: '' }
                    ]
                },
                stateFlowConfig: {
                    nodes: {},
                    links: {}
                }
            },
            deletedStateFlow: [], // chứa những links state flow bị xóa
            originalStateFlow: {}, // chứa data link phần update
            confirmDeleteInfo: {
                title: this.$t('kanban.exit_confirm_title'),
                content: this.$t('kanban.exit_confirm_content'),
                cancel() {},
                confirm() {},
                show: false
            },
            nameKanbanEdit: '',
            docKanbanEdit: '',
            firstGetData: 0,
            isLoadingSaveKanban: false
        };
    },
    methods: {
        showErrorStateFlow(message) {
            this.error.notEmtyNameStateFlow = message;
            if (message) {
                this.checkValidateStateFlow = false;
            } else {
                this.checkValidateStateFlow = true;
            }
            if (
                JSON.stringify(this.kanbanConfig.stateFlowConfig.node) == '{}'
            ) {
                this.checkValidateStateFlow = true;
                this.error.notEmtyNameStateFlow = '';
            }
        },
        nextToTab4() {
            this.stepper = 4;
        },
        // xử lý khi đổi tên cột thì state flow cũng đổi theo
        changeNameColumn() {
            this.$refs.stepperStateFlow.reRenderNameCanvas();
        },
        // xử lý khi thêm cột thì state flow cũng đổi theo
        addColumn(colId) {
            this.$refs.stepperStateFlow.addColumnCanvas(colId);
        },
        // xử lý khi xóa cột thì state flow cũng đổi theo
        deleteColumn(colId) {
            this.$refs.stepperStateFlow.deleteColumnCanvas(colId);
        },
        // check trùng tên cột
        checkExistCol() {
            let check = false;
            this.kanbanConfig.columnConfig.cols.map((col) => {
                let checkExist = this.kanbanConfig.columnConfig.cols.filter(
                    (c) => c.name == col.name
                );
                if (checkExist.length > 1) check = true;
            });
            return check;
        },
        // check các trường hợp trùng tên cột, để trống tên cột, giá trị cột
        checkValidateCol() {
            let checkExistNameCol = this.checkExistCol();
            let check = this.kanbanConfig.columnConfig.cols.some(
                (col) =>
                    col.name == '' || col.value == '' || col.name.length > 100
            );
            let checkControl =
                this.kanbanConfig.columnConfig.allInput.control.options.filter(
                    (opt) =>
                        opt.id ==
                        this.kanbanConfig.columnConfig.allInput.control.value
                ).length;
            if (checkControl == 0 || check) {
                if (checkControl == 0) {
                    this.error.notEmtyName = this.$t(
                        'kanban.error.not_emty_col_value'
                    );
                } else {
                    this.error.notEmtyName = this.$t(
                        'kanban.error.notEmtyName'
                    );
                }
            } else if (checkExistNameCol) {
                this.error.notEmtyName = this.$t(
                    'kanban.error.not_duplicate_col_name'
                );
                check = true;
            } else {
                this.error.notEmtyName = '';
            }
            return check;
        },
        // xem chi tiết các step
        showStepper(stepper) {
            this.error.notEmtyDoc = '';
            if (!this.kanbanConfig.generalInfo.name.value) {
                return;
            }
            if (
                this.stepper >= stepper ||
                this.maxStep >= stepper ||
                this.action != 'create'
            ) {
                // tạm ẩn
                if (
                    this.stepper == 2 &&
                    stepper == 3 &&
                    this.error.notEmtyName
                ) {
                    return;
                }
                this.stepper = stepper;
                if (this.maxStep < stepper) {
                    this.maxStep = stepper;
                }
            }
            if (!this.kanbanConfig.generalInfo.document.value) {
                this.stepper = 1;
                this.error.notEmtyDoc =
                    this.$t('validate.required') + ' document';
            }
        },
        //chuyển đến để xem chi tiết tab cấu hình state flow
        nextToTabStateFlow() {
            this.stepper = 3;
            this.$refs.stepperStateFlow.renderCanvas();
        },
        getAllDocument() {
            this.searchDocument(' ');
        },
        refreshAllData() {
            this.kanbanConfig.cardConfig = {};
            this.kanbanConfig.columnConfig.allInput.control.value = '';
        },
        // lấy tất cả control trong doc
        async getAllControl() {
            const self = this;
            self.kanbanConfig.columnConfig.allInput.control.options = [];
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
                    self.kanbanConfig.columnConfig.allInput.control.options.push(
                        data
                    );
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
                    self.kanbanConfig.generalInfo.document.options.push(
                        res.data.listObject[0]
                    );
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
                        self.kanbanConfig.generalInfo.document.options =
                            res.data.listObject;
                    }
                });
            }
        },
        async save() {
            this.isLoadingSaveKanban = true;
            let err = false;
            if (
                !(
                    this.kanbanConfig.cardConfig.date &&
                    this.kanbanConfig.cardConfig.mother_card_title &&
                    this.kanbanConfig.cardConfig.priority &&
                    this.kanbanConfig.cardConfig.time &&
                    this.kanbanConfig.cardConfig.title &&
                    this.kanbanConfig.cardConfig.user &&
                    this.kanbanConfig.cardConfig.mother_card_identifier
                )
            ) {
                err = true;
                this.$snotify({
                    type: 'error',
                    title: this.$t('kanban.card_config.validate')
                });
                this.isLoadingSaveKanban = false;
                return;
            }
            if (this.kanbanConfig.generalInfo.name.value.trim() == '') {
                this.$snotifyError(
                    '',
                    this.$t('kanban.error.not_all_space_name_kanban')
                );
                err = true;
                this.isLoadingSaveKanban = false;
                return;
            }
            if (!this.kanbanConfig.columnConfig.allInput.control.value) {
                this.$snotifyError(
                    '',
                    this.$t('kanban.error.not_empty_control')
                );
                err = true;
                this.isLoadingSaveKanban = false;
                return;
            }
            if (!this.checkValidateStateFlow) {
                this.$snotifyError(
                    '',
                    this.$t('kanban.error.notEmtyNameStateFlow')
                );
                err = true;
                this.isLoadingSaveKanban = false;
                return;
            }
            // check trùng tên kanban
            let isExistNameKanban = await kanbanApi.checkExistNameKanban(
                this.kanbanConfig.generalInfo.name.value
            );
            if (isExistNameKanban.status == 200) {
                if (isExistNameKanban.data != false) {
                    if (this.action == 'edit') {
                        if (
                            this.nameKanbanEdit !=
                            this.kanbanConfig.generalInfo.name.value
                        ) {
                            err = true;
                            this.$snotify({
                                type: 'error',
                                title: this.$t(
                                    'kanban.notify.duplicate_name_kanban'
                                )
                            });
                            this.isLoadingSaveKanban = false;
                            return;
                        }
                    } else {
                        err = true;
                        this.$snotify({
                            type: 'error',
                            title: this.$t(
                                'kanban.notify.duplicate_name_kanban'
                            )
                        });
                        this.isLoadingSaveKanban = false;
                        return;
                    }
                }
            } else {
                console.log('error');
            }

            // check trùng doc
            let isExistDocKanban = await kanbanApi.checkExistDocKanban(
                this.kanbanConfig.generalInfo.document.value
            );
            if (isExistDocKanban.status == 200) {
                if (isExistDocKanban.data != false) {
                    if (this.action == 'edit') {
                        if (
                            this.docKanbanEdit !=
                            this.kanbanConfig.generalInfo.document.value
                        ) {
                            err = true;
                            this.$snotify({
                                type: 'error',
                                title: this.$t(
                                    'kanban.notify.duplicate_doc_kanban'
                                )
                            });
                            this.isLoadingSaveKanban = false;
                            return;
                        }
                    } else {
                        err = true;
                        this.$snotify({
                            type: 'error',
                            title: this.$t('kanban.notify.duplicate_doc_kanban')
                        });
                        this.isLoadingSaveKanban = false;
                        return;
                    }
                }
            } else {
                console.log('error');
            }
            if (err == false) {
                let data = {};
                data.name = this.kanbanConfig.generalInfo.name.value.trim();
                data.description =
                    this.kanbanConfig.generalInfo.description.value;
                data.id_doc = this.kanbanConfig.generalInfo.document.value;
                data.control_for_column =
                    this.kanbanConfig.columnConfig.allInput.control.value;
                data.card_config = JSON.stringify(this.kanbanConfig.cardConfig);
                data.column_config = JSON.stringify(
                    this.kanbanConfig.columnConfig.cols
                );
                data.conditional_format = JSON.stringify(
                    this.kanbanConfig.conditionalFormatConfig
                );
                data.state_config = JSON.stringify(
                    this.kanbanConfig.stateFlowConfig
                );
                data.stateflow_flow = this.getStateFlowToPushKafka();
                data.stateflow_flow_deleted =
                    this.getStateFlowDeletedToPushKafka();
                if (this.action == 'create') {
                    kanbanApi.createKanban(data).then((res) => {
                        if (res.status == 200) {
                            this.isLoadingSaveKanban = false;
                            this.$snotify({
                                type: 'success',
                                title: this.$t('kanban.notify.save-success')
                            });
                            this.$goToPage('/kanban/');
                        } else {
                            console.log('error');
                        }
                    });
                } else if (this.action == 'edit') {
                    kanbanApi.updateBoard(this.id, data).then((res) => {});
                    this.$snotify({
                        type: 'success',
                        title: this.$t('kanban.notify.save-success')
                    });
                    this.$goToPage('/kanban/');
                }
            }
        },
        //
        sendDeletedStateFolow() {
            // khi xóa gửi listId xóa
        },
        changeConfigName(val) {
            this.originalStateFlow[val.id].name = val.name;
        },
        deleteLinkStateFlow(stateflowId) {
            this.deletedStateFlow.push({
                id:
                    this.kanbanConfig.generalInfo.document.value +
                    '_' +
                    stateflowId
            });
        },
        setLinkOrigin() {
            this.originalStateFlow = this.kanbanConfig.stateFolowConfig.links;
            //  Object.keys(this.originalStateFlow).map((link, linkId)=>{
            //         this.originalStateFlow[link].oldId =  link
            //     })
        },
        // đẩy state đã xóa lên kafa
        getStateFlowDeletedToPushKafka() {
            let deletedStateFlow = this.deletedStateFlow;
            return JSON.stringify(deletedStateFlow);
        },
        // xử lý để gửi lên kafka
        getStateFlowToPushKafka() {
            // khi submit thì gửi dữ liệu lên
            let listLinks = [];
            if (this.action == 'create') {
                Object.keys(this.kanbanConfig.stateFlowConfig.links).map(
                    (link, linkId) => {
                        listLinks.push({
                            id:
                                this.kanbanConfig.generalInfo.document.value +
                                '_' +
                                link,
                            name: this.kanbanConfig.stateFlowConfig.links[link]
                                .name,
                            title: this.kanbanConfig.stateFlowConfig.links[link]
                                .name,
                            type: 'stateflow_flow'
                        });
                    }
                );
            } else {
                //so sánh data nguyên gốc và data update để update lại tên
                Object.keys(this.originalStateFlow).map((link, linkId) => {
                    let oldId = this.originalStateFlow[link].oldId
                        ? this.originalStateFlow[link].oldId
                        : link;
                    listLinks.push({
                        id:
                            this.kanbanConfig.generalInfo.document.value +
                            '_' +
                            oldId,
                        name: this.originalStateFlow[link].name,
                        title: this.originalStateFlow[link].name,
                        type: 'stateflow_flow'
                    });
                });
            }

            return JSON.stringify(listLinks);
        },
        changeFormat(data) {
            this.kanbanConfig.conditionalFormatConfig = data;
        },
        setStateFlow(stateConfig) {
            this.kanbanConfig.stateFolowConfig = JSON.parse(stateConfig);
            this.setLinkOrigin();
            this.$refs.stepperStateFlow.renderCanvas();
            this.$refs.stepperStateFlow.setCanvas(
                this.kanbanConfig.stateFolowConfig
            );
        },
        setGeneralInfo(data) {
            this.kanbanConfig.generalInfo.name.value = data.name;
            this.kanbanConfig.generalInfo.document.value = data.id_doc;
            this.kanbanConfig.generalInfo.description.value = data.description;
            let checkExist =
                this.kanbanConfig.generalInfo.document.options.filter(
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
            for (let control in this.kanbanConfig.cardConfig) {
                let col =
                    mapIdControlToDataControl[
                        this.kanbanConfig.cardConfig[control].id
                    ];
                if (col) {
                    this.kanbanConfig.cardConfig[control] = col;
                } else {
                    delete this.kanbanConfig.cardConfig[control];
                }
            }
        },
        async restoreKanbanView(id) {
            try {
                let res = await kanbanApi.getBoard(id);
                if (res.status == 200) {
                    this.nameKanbanEdit = res.data[0].name;
                    this.docKanbanEdit = res.data[0].id_doc;
                    this.setGeneralInfo(res.data[0]);
                    this.kanbanConfig.columnConfig.allInput.control.value =
                        res.data[0].control_for_column;
                    this.kanbanConfig.columnConfig.cols = JSON.parse(
                        res.data[0].column_config
                    );
                    this.kanbanConfig.cardConfig = JSON.parse(
                        res.data[0].card_config
                    );
                    this.kanbanConfig.conditionalFormatConfig = JSON.parse(
                        res.data[0].conditional_format
                    );
                    this.checkKeyCondition(
                        this.kanbanConfig.conditionalFormatConfig
                    );
                    this.setStateFlow(res.data[0].state_config);
                } else {
                    this.$snotifyError(res, 'err', res.message);
                }
            } catch (error) {
                this.$snotifyError(error, 'err');
            }
        },
        checkKeyCondition(listCondition) {
            for (let idx in listCondition) {
                if (!listCondition[idx].key) {
                    listCondition[idx].key = idx;
                }
            }
        },
        editKanban() {
            this.$goToPage('/kanban/' + this.id + '/edit');
        },
        exit() {
            this.confirmDeleteInfo.show = true;
            this.confirmDeleteInfo.confirm = () => {
                this.confirmDeleteInfo.show = false;
                this.$goToPage('/kanban/');
            };
            this.confirmDeleteInfo.cancel = () => {
                this.confirmDeleteInfo.show = false;
            };
        }
    }
};
</script>
<style scoped>
.v-stepper {
    box-shadow: unset !important;
}
.v-stepper__content {
    width: calc(100%-500px);
}
.v-stepper__step:hover {
    background: #80808026;
    border-radius: 191px;
}
.v-stepper__step {
    margin-left: 8px !important;
}
.stepper {
    max-height: 100%;
    overflow: scroll;
}
.v-stepper--vertical .v-stepper__step {
    padding: 16px !important;
}
.d-inline-block {
    font-size: 13px !important;
}
</style>

<template>
    <div
        class="
            d-flex
            filter-form
            align-content-space-between
            h-100
            pr-2
            pl-4
            overflow-scroll
        "
    >
        <div class="w-100">
            <div class="mt-2" v-show="showInfo">
                <SymperAlert :context="infoFilter" @hide="showInfo = false" />
            </div>
            <FormTpl
                :viewOnly="type == 'detail'"
                :marginTop="'5px'"
                @click-input="clickInput"
                class="mr-2 mt-4 form"
                :labelWidth="'100px'"
                :allInputs="allInputs"
                :titleSize="'normal'"
            />
            <div class="mt-1 fs-12">{{ $t('permissions.filter.config') }}</div>
            <TreeSqlConfig
                :customCss="true"
                :showSubTitle="true"
                style="margin-left: -12px"
                @show-script-editor="showScriptEditor"
                @close-script-editor="closeScriptEditor"
                :disabled="type == 'detail'"
                ref="treeConfig"
                :defaultData="treeConfigData"
                :listColumn="tableColumnsForTree"
                :itemValue="'name'"
            />
        </div>
    </div>
</template>
<script>
import TreeSqlConfig from './../../../views/document/sideright/items/TreeSqlConfig';
import FormTpl from './../../../components/common/FormTpl.vue';
import SymperAlert from '@/components/common/SymperAlert.vue';
import _groupBy from 'lodash/groupBy';
import { formatOperator } from '@/components/common/conditionalFormat';
import { biApi } from '@/api/bi';
import { accessControlApi } from '@/api/accessControl';
import { documentApi } from '@/api/Document';

export default {
    components: {
        FormTpl,
        TreeSqlConfig,
        SymperAlert
    },
    props: {
        listTypeAction: {
            type: Array,
            default() {
                return [];
            }
        },
        type: {
            type: String,
            default() {
                return 'add';
            }
        },
        open: {
            type: Boolean
        }
    },
    computed: {
        typeAction() {
            return this.allInputs.typeAction.value;
        },
        objectIdentifier() {
            return this.allInputs.objectIdentifier.value;
        },
        listDocument() {
            if (this.allInputs.listDocument) {
                return this.allInputs.listDocument.value;
            } else {
                return [];
            }
        }
    },
    watch: {
        typeAction() {
            if (this.isResetCondition) {
                this.resetConditional();
                this.findListObjectIdentifier(this.typeAction);
            }
            if (this.typeAction == 'control') {
                this.allInputs = {
                    ...this.allInputs,
                    ...this.extraInput.control
                };
                this.allInputs.objectIdentifier.hidden = true;
                this.allInputs.listControl.hidden = false;
                this.allInputs.listDocument.hidden = false;
            } else {
                this.allInputs.objectIdentifier.hidden = false;
                if (this.allInputs.listControl) {
                    this.allInputs.listControl.hidden = true;
                    this.allInputs.listDocument.hidden = true;
                }
            }
        },
        objectIdentifier() {
            if (this.isResetCondition) {
                this.resetConditional();
                this.getFieldForTreeConfig();
            }
        },
        listDocument() {
            if (this.listDocument.length > 0) {
                this.getListControlAllDocs();
            } else {
                this.resetListControl();
                // this.findListObjectIdentifier()
            }
        }
    },
    data() {
        const self = this;
        return {
            validateStatus: true,
            listDefaultValue: [
                'document_object_create_time',
                'document_object_update_time',
                'document_object_workflow_id',
                'document_object_workflow_object_id',
                'document_object_user_created_id',
                'document_object_last_user_update_id',
                'document_object_task_id'
            ],
            showInfo: true,
            listOperators: [
                {
                    name: '=',
                    value: '='
                },
                {
                    name: '<>',
                    value: '!='
                },
                {
                    name: '!>',
                    value: '<='
                }
            ],
            infoFilter: this.$t('permissions.filter.infoFilter'),
            idFilter: '',
            isResetCondition: true,
            treeConfigData: [
                {
                    id: 'root',
                    name: 'AND',
                    root: true,
                    label: 'AND',
                    parent: false,
                    children: [
                        {
                            id: Date.now(),
                            condition: false,
                            name: '',
                            parent: 'root',
                            formulas: '',
                            nodeType: 'item',
                            operator: '='
                        }
                    ],
                    nodeType: 'group',
                    condition: true
                }
            ],

            tableColumnsForTree: [],
            extraInput: {
                control: {
                    listDocument: {
                        title: this.$t('permissions.filter.listDocument'),
                        type: 'autocomplete',
                        multipleSelection: true,
                        showId: true,
                        menuProps: { maxHeight: 250 },
                        deleteable: true,
                        isSelectionChip: true,
                        value: '',
                        info: '',
                        onSearch(value) {
                            self.searchObjectIdentifier(value);
                        },
                        options: []
                    },
                    listControl: {
                        title: this.$t('permissions.filter.listControl'),
                        type: 'autocomplete',
                        value: '',
                        showId: false,
                        menuProps: { maxHeight: 250 },
                        multiTitle: true,
                        textHTML: "<span class='mx-2 color-grey'>;</span>",
                        deleteable: true,
                        multipleSelection: true,
                        isSelectionChip: true,
                        value: '',
                        info: '',
                        options: []
                    }
                }
            },
            allInputs: {
                name: {
                    title: this.$t('common.nameFilter'),
                    type: 'text',
                    value: '',
                    info: ''
                },
                description: {
                    title: this.$t('common.description'),
                    type: 'textarea',
                    value: '',
                    info: ''
                },
                typeAction: {
                    title: this.$t('permissions.filter.listObject'),
                    type: 'select',
                    value: '',
                    info: '',
                    options: this.listTypeAction
                },
                objectIdentifier: {
                    title: this.$t('common.object'),
                    type: 'autocomplete',
                    value: '',
                    menuProps: { maxHeight: 300 },
                    info: '',
                    showId: true,
                    onSearch(value) {
                        self.searchObjectIdentifier(value);
                    },
                    options: []
                }
            }
        };
    },
    methods: {
        showScriptEditor() {
            $('.action-panel-content').css('display', 'none');
        },
        closeScriptEditor() {
            $('.action-panel-content.bg-white.h-100').css('display', 'block');
        },
        resetListControl() {
            this.allInputs.listControl.options = [];
            // this.findListObjectIdentifier()
            this.allInputs.listControl.value = [];
        },
        resetConditional() {
            this.treeConfigData = [
                {
                    id: 'root',
                    name: 'AND',
                    root: true,
                    label: 'AND',
                    parent: false,
                    children: [
                        {
                            id: Date.now(),
                            condition: false,
                            name: '',
                            parent: 'root',
                            formulas: '',
                            nodeType: 'item',
                            operator: '='
                        }
                    ],
                    nodeType: 'group',
                    condition: true
                }
            ];
            this.tableColumnsForTree = [];
        },
        addListVariableDefault() {
            this.listDefaultValue.map((val) => {
                this.tableColumnsForTree.push({
                    title: val.replaceAll('_', ' '),
                    columnName: val,
                    name: val,
                    id: val,
                    as: val,
                    agg: 'not_agg'
                });
            });
        },
        clickInput() {
            this.isResetCondition = true;
        },
        // lấy trường để hiển thị trong câu điều kiện
        getFieldForTreeConfig() {
            let id = this.allInputs.objectIdentifier.value;
            if (
                this.allInputs.objectIdentifier.options &&
                this.allInputs.objectIdentifier.options.length > 0
            )
                if (this.typeAction != 'dataset') {
                    this.getStructDoc(id);
                } else {
                    let datasetId =
                        this.allInputs.objectIdentifier.options.filter(
                            (d) => d.id == id
                        );
                    if (datasetId.length > 0)
                        this.getColumnDataSet(datasetId[0].id);
                }
        },

        // tìm danh sách bản ghi theo các đối tượng
        findListObjectIdentifier() {
            const self = this;
            const typeDoc = [
                'document_instance',
                'document_definition',
                'control'
            ];
            let data = {
                type: typeDoc.includes(this.typeAction)
                    ? 'document_definition'
                    : this.typeAction,
                pageSize: 50,
                page: 1
            };
            if (
                this.typeAction == 'document_instance' ||
                this.typeAction == 'document_definition'
            ) {
                //th khác
                accessControlApi.getObjectIdentifier(data).then((res) => {
                    if (res.status == 200) {
                        if (res.data.length > 0) {
                            self.allInputs.objectIdentifier.options = [];
                            res.data.map((d) => {
                                self.allInputs.objectIdentifier.options.push({
                                    id: d.objectIdentifier.split(':')[1],
                                    name: d.name
                                });
                            });
                        } else {
                            this.$snotifyError(
                                this.$t('permissions.notify.can_not_get_data') +
                                    ' document'
                            );
                        }
                    }
                });
            } else if (this.typeAction == 'dataset') {
                // th dataset
                biApi.getAllDataset().then((res) => {
                    if (res.status == 200) {
                        self.allInputs.objectIdentifier.options = [];
                        res.data.listObject.map((d) => {
                            self.allInputs.objectIdentifier.options.push({
                                id: d.id,
                                name: d.name
                            });
                        });
                    } else {
                        this.$snotifyError(
                            this.$t('permissions.notify.can_not_get_data') +
                                ' dataset'
                        );
                    }
                });
            } else {
                accessControlApi.getObjectIdentifier(data).then((res) => {
                    if (res.status == 200) {
                        if (res.data.length > 0) {
                            self.allInputs.listDocument.options = [];
                            res.data.map((d) => {
                                self.allInputs.listDocument.options.push({
                                    id: d.objectIdentifier.split(':')[1],
                                    name: d.name
                                });
                            });
                        } else {
                            this.$snotifyError(
                                this.$t('permissions.notify.can_not_get_data') +
                                    ' document'
                            );
                        }
                    }
                });
            }
        },
        // lấy tất cả danh sách các control trong doc
        getListControlAllDocs() {
            const self = this;
            let docIds = this.listDocument;
            let listControls = [];
            docIds.map((id) => {
                listControls.push(this.getAllControlInDoc(id));
            });
            Promise.all(listControls)
                .then((rsl) => {
                    // xử lý chỉ lấy những control trùng nhau
                    let countArr = rsl.length;
                    let controlsRepeat = [];
                    if (self.listDocument.length > 0) {
                        rsl = rsl.flat();
                        rsl.map((controls) => {
                            let countControl = rsl.filter(
                                (item, index) =>
                                    item.columnName == controls.columnName
                            );
                            if (countControl.length == countArr) {
                                // check tên trùng nhau thì nối tên title
                                let checkHasControl = controlsRepeat.filter(
                                    (con) =>
                                        con.columnName == controls.columnName
                                ).length;
                                if (!checkHasControl) {
                                    let title = countControl.map(
                                        (con) => con.title
                                    );
                                    let span =
                                        "<span class='mx-2 color-grey'>;</span>";
                                    title = title
                                        .filter(
                                            (item, index) =>
                                                title.indexOf(item) === index
                                        )
                                        .join(span);
                                    controls.title = title;
                                    controlsRepeat.push(controls);
                                }
                            }
                        });

                        self.listDefaultValue.map((val) => {
                            controlsRepeat.push({
                                title: val.replaceAll('_', ' '),
                                columnName: val,
                                id: val,
                                name: val
                            });
                        });
                    }
                    self.allInputs.listControl.options = controlsRepeat;
                    self.tableColumnsForTree =
                        self.allInputs.listControl.options;
                })
                .catch((err) => {
                    console.log('Lỗi lấy danh sách control doc');
                });
        },
        // lấy danh sách các control
        async getAllControlInDoc(docId) {
            let controls = [];
            let res = await documentApi.detailDocument(docId);
            if (res.status === 200) {
                let fieldDoc = Object.values(res.data.fields);
                fieldDoc.map((f) => {
                    if (f.type == 'table') {
                        controls.push({
                            columnName: f.properties.name,
                            title: f.properties.title,
                            id: f.properties.name,
                            name: f.properties.name,
                            as: f.properties.title,
                            agg: 'not_agg'
                        });
                        Object.values(f.listFields).map((fieldTable) => {
                            controls.push({
                                columnName: fieldTable.properties.name,
                                title: fieldTable.properties.title,
                                id: fieldTable.properties.name,
                                name: fieldTable.properties.name,
                                as: fieldTable.properties.title,
                                agg: 'not_agg'
                            });
                        });
                    } else {
                        if (
                            ![
                                'submit',
                                'approvalHistory',
                                'reset',
                                'draft'
                            ].includes(f.type)
                        ) {
                            controls.push({
                                columnName: f.properties.name,
                                title: f.properties.title,
                                id: f.properties.name,
                                name: f.properties.name,
                                as: f.properties.title,
                                agg: 'not_agg'
                            });
                        }
                    }
                });
                return controls;
            }
        },
        // lấy danh sách các trường trong doc
        async getStructDoc(docId) {
            this.tableColumnsForTree = [];
            const self = this;
            let res = await documentApi.detailDocument(docId);
            if (res.status === 200) {
                let fieldDoc = Object.values(res.data.fields);
                fieldDoc.map((f) => {
                    if (
                        ![
                            'submit',
                            'approvalHistory',
                            'reset',
                            'draft'
                        ].includes(f.type)
                    ) {
                        self.tableColumnsForTree.push({
                            title: f.properties.title
                                ? f.properties.title
                                : f.properties.name,
                            columnName: f.properties.name,
                            id: f.properties.name,
                            name: f.properties.name,
                            as: f.properties.title,
                            agg: 'not_agg'
                        });
                    }
                });
                this.addListVariableDefault();
            }
        },
        searchDocument(docName) {
            const self = this;
            let data = {
                search: docName,
                page: 1,
                pageSize: 50
            };
            documentApi.getListDocumentFilter(data).then((res) => {
                if (res.status == 200) {
                    if (self.typeAction == 'control') {
                        if (self.allInputs.listDocument.value.length > 0) {
                            let options = [];
                            self.allInputs.listDocument.options.map((opt) => {
                                self.allInputs.listDocument.value.map((val) => {
                                    if (val == opt.id) {
                                        options.push(opt);
                                    }
                                });
                            });
                            self.allInputs.listDocument.options = [
                                ...res.data.listObject,
                                ...options
                            ];
                        } else {
                            self.allInputs.listDocument.options =
                                res.data.listObject;
                        }
                    } else {
                        self.allInputs.objectIdentifier.options =
                            res.data.listObject;
                    }
                    if (res.data.listObject.length == 0) {
                        self.$snotifyError(
                            self.$t('v2.doc.error'),
                            self.$t('v2.acessControl.documentNotFound')
                        );
                    }
                    if (
                        self.open &&
                        self.allInputs.objectIdentifier.value &&
                        res.data.listObject.length > 0
                    ) {
                        // lấy cấu trúc doc
                        self.getStructDoc(res.data.listObject[0].id);
                        self.open = false;
                    }
                    if (
                        self.allInputs.objectIdentifier.options.length == 0 &&
                        self.isResetCondition
                    ) {
                        self.resetConditional();
                    }
                }
            });
        },
        // search đối tượng
        searchObjectIdentifier(searchVal) {
            this.isResetCondition = true;
            if (this.allInputs.typeAction.value == 'dataset') {
                this.searchDataSet(searchVal);
            } else {
                this.searchDocument(searchVal);
            }
        },
        getColumnDataSet(id) {
            const self = this;
            this.tableColumnsForTree = [];
            biApi.getColumnWithDatasetIds(id).then((res) => {
                if (res['status'] == 200 && res['data']) {
                    if (
                        res['data'].columns &&
                        res['data'].columns[id].length > 0
                    ) {
                        res['data'].columns[id].map((col) => {
                            self.tableColumnsForTree.push({
                                title: col.title ? col.title : col.name,
                                columnName: col.name,
                                id: col.name,
                                name: col.name,
                                as: col.title,
                                agg: 'not_agg'
                            });
                        });
                    } else {
                        this.$snotifyError(
                            'Error',
                            this.$t('common.have_no_data')
                        );
                    }
                }
            });
        },
        // tìm data set
        searchDataSet(search) {
            const self = this;
            if (search) {
                biApi.searchDataset(search).then((res) => {
                    if (res.status == 200) {
                        self.allInputs.objectIdentifier.options =
                            res.data.listObject;
                        let datasetId =
                            self.allInputs.objectIdentifier.options.filter(
                                (d) => d.id == search
                            );
                        if (datasetId.length > 0)
                            this.getColumnDataSet(datasetId[0].id);
                    }
                });
            }
        },
        // chuyển toán tử về dạng đúng format
        formatOperator(name) {
            return formatOperator(name, this.listOperators);
        },
        changeConfigTreeToFormulas(node) {
            if (!node.condition) {
                let field = node.column.columnName;
                let value = "'" + node.value + "'";
                let functionName = this.formatOperator(node.operator);
                return `(${field}${functionName} ${value})`;
            } else if (node.condition) {
                let listCondition = [];
                node.children.map((chil) => {
                    let itemCond = this.changeConfigTreeToFormulas(chil);
                    listCondition.push(itemCond);
                });
                let opr = node.name == 'OR' ? ' or ' : ' and ';
                let cond = listCondition.join(opr);
                return `${cond}`;
            } else {
                return '';
            }
        },
        getObjectIdentifier() {
            if (this.typeAction != 'control') {
                return (
                    this.allInputs.typeAction.value +
                    ':' +
                    this.allInputs.objectIdentifier.value
                );
            } else {
                let listObjects = [];
                this.allInputs.listDocument.value.map((doc) => {
                    this.allInputs.listControl.value.map((con) => {
                        listObjects.push('control:' + doc + ':' + con);
                    });
                });
                return listObjects.join(',');
            }
        },
        getFormulaStruct() {
            return JSON.stringify({ treeConfigData: this.treeConfigData });
        },
        validateTree(data) {
            for (let key in data) {
                if (data[key].nodeType == 'group') {
                    this.validateTree(data[key].children);
                } else if (data[key].nodeType == 'item') {
                    if (
                        !data[key].hasOwnProperty('column') ||
                        data[key].column.columnName == '' ||
                        !data[key].hasOwnProperty('value') ||
                        data[key].value == ''
                    ) {
                        this.validateStatus = false;
                        break;
                    }
                }
            }
        },
        validateData() {
            if (
                !this.allInputs.name.value ||
                !this.allInputs.objectIdentifier.value ||
                !this.allInputs.typeAction.value
            ) {
                this.validateStatus = false;
            }
            if (this.validateStatus) {
                this.validateTree(this.$refs.treeConfig.treeData);
            }
        },
        save() {
            const self = this;
            this.validateData();
            if (!this.validateStatus) {
                self.$snotifyError(
                    '',
                    this.$t('filterAccessControl.validateErr')
                );
                this.$emit('save-fail');
                this.validateStatus = true;
            } else {
                let data = {
                    name: this.allInputs.name.value,
                    description: this.allInputs.description.value,
                    formula: this.changeConfigTreeToFormulas(
                        this.$refs.treeConfig.treeData[0]
                    ),
                    status: 1,
                    objectIdentifier: this.getObjectIdentifier(),
                    formulaStruct: this.getFormulaStruct()
                };
                if (this.type == 'add' || this.type == 'copy') {
                    accessControlApi.saveFilter(data).then((res) => {
                        if (res.status == 200) {
                            self.$snotifySuccess(
                                this.$t('notification.successTitle')
                            );
                            self.closePanel();
                        } else {
                            self.$snotifyError('', res.message);
                        }
                        self.refreshData();
                    });
                } else {
                    data.id = this.idFilter;
                    accessControlApi.updateFilter(data.id, data).then((res) => {
                        if (res.status == 200) {
                            self.$snotifySuccess(
                                this.$t('notification.successTitle')
                            );
                            self.closePanel();
                        } else {
                            self.$snotifyError('', res.message);
                        }
                        self.refreshData();
                    });
                }
            }
        },
        isTypeDoc(type) {
            if (type == 'document_definition' || type == 'document_instance') {
                return true;
            } else {
                return false;
            }
        },
        closePanel() {
            this.$emit('save-success');
        },
        async setData(data) {
            this.allInputs.name.value = data.name;
            this.allInputs.description.value = data.description;
            this.allInputs.typeAction.value =
                data.objectIdentifier.split(':')[0];
            let objectIdentifierId = data.objectIdentifier.split(':')[1];
            if (this.isTypeDoc(this.allInputs.typeAction.value)) {
                this.searchDocument(objectIdentifierId);
            } else if (this.allInputs.typeAction.value == 'dataset') {
                this.searchDataSet(objectIdentifierId);
            } else {
                // control
                await this.getListDocumentAndControl(data.objectIdentifier);
            }
            this.allInputs.objectIdentifier.value = objectIdentifierId;
            this.idFilter = data.id;
            this.isResetCondition = false;
            if (data.formulaStruct) {
                let formulaStruct = JSON.parse(data.formulaStruct);
                this.treeConfigData = formulaStruct.treeConfigData
                    ? formulaStruct.treeConfigData
                    : '';
            }
        },
        async getListDocumentAndControl(objectIdentifiers) {
            let docIds = [];
            let controls = [];
            objectIdentifiers.split(',').map((obj) => {
                let docId = obj.split(':')[1];
                let control = obj.split(':')[2];
                let checkExistDoc = docIds.filter((f) => f == docId).length;
                let checkExistControl = controls.filter(
                    (f) => f == control
                ).length;
                if (checkExistDoc == 0) docIds.push(docId);
                if (checkExistControl == 0) controls.push(control);
            });
            const self = this;
            let filter = {
                filter: [
                    {
                        column: 'id',
                        operation: 'and',
                        conditions: [
                            {
                                name: 'in',
                                value: docIds
                            }
                        ]
                    }
                ],
                page: 1,
                pageSize: 20
            };
            let res = await documentApi.getListDocumentFilter(filter);
            if (res.status == 200) {
                self.allInputs.listDocument.options = res.data.listObject;
                self.allInputs.listDocument.value = docIds;
                self.allInputs.listControl.value = controls;
            }
        },
        refreshData() {
            this.resetConditional();
            this.allInputs.name.value = '';
            this.allInputs.description.value = '';
            this.allInputs.objectIdentifier.options = [];
            this.extraInput.control.listControl.options = [];
            this.extraInput.control.listDocument.options = [];
            this.extraInput.control.listDocument.value = '';
            this.extraInput.control.listControl.value = '';

            this.allInputs.typeAction.value = '';
            this.allInputs.objectIdentifier.value = '';
        }
    }
};
</script>
<style scoped>
.form >>> .v-list-item {
    margin: 0px !important;
    min-height: 20px !important;
    font-size: 12px !important;
}
.form >>> span {
    font-size: 12px !important;
}
.filter-form >>> .v-menu__content {
    max-height: 204px !important;
}
</style>

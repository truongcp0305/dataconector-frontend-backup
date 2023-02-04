<template>
    <div class="mt-3">
        <div class="fs-11">{{$t('v2.dataconnector.declareWhereToStoreData')}}</div>
        <div>
            <FormTpl
                class="mr-2 mt-4 form"
                :labelWidth="'130px'"
                :allInputs="allInputs"
                :single-line="true"
            />
        </div>
        <div class="fs-11 mt-2">{{$t('v2.dataconnector.writeDataInTheInformationField')}}</div>
        <div class="fs-11 mt-2" v-if="allInputs.type.value != 2">
            {{$t('v2.dataconnector.informationAboutThePlaceSymperStoreData')}}
        </div>
        <div v-else class="fs-11 mt-2">
            {{$t('v2.dataconnector.theDataRecordWillBeUpdateBaseOnTheConditionInCheckBoxColumn')}}
        </div>
        <ImportFile
            :showCheckBox="allInputs.type.value == 2 ? true : false"
            :disabled="disabled"
            @change-value="changeValue"
            :nameColumnDetail="nameColumnDetail"
            :nameSheets="nameSheet"
            :options="options"
            :tables="listRowDocument"
        />
        <div v-if="!disabled && this.docId" class="w-100 d-flex justify-end">
            <v-btn class="mr-2" @click="save()" small depressed color="primary">
                {{ $t('common.save') }}
            </v-btn>
            <v-btn
                class="mr-2"
                @click="saveAndRun()"
                small
                depressed
                color="success"
            >
                {{ $t('common.save-run') }}
            </v-btn>
        </div>
    </div>
</template>
<script>
import FormTpl from './../../components/common/FormTpl';
import { documentApi } from '../../api/Document';
import ImportFile from './../../components/importExcel/MappingData';
export default {
    computed: {
        docId() {
            return this.allInputs.nameDoc.value;
        },
        type() {
            return this.allInputs.type.value;
        },
        pathToData() {
            return this.allInputs.pathToData.value;
        },
        pathToTotal() {
            return this.allInputs.pathToTotal.value;
        },
        updateByKey() {
            return this.allInputs.updateByKey.value
                ? this.allInputs.updateByKey.value.name
                : '';
        },
        deleteConditions() {
            return this.allInputs.deleteConditions.value;
        },
    },
    components: {
        ImportFile,
        FormTpl,
    },
    watch: {
        pathToTotal() {
            this.$emit('change-path', {
                pathToTotal: this.pathToTotal,
                pathToData: this.pathToData,
            });
        },
        pathToData() {
            this.$emit('change-path', {
                pathToTotal: this.pathToTotal,
                pathToData: this.pathToData,
            });
        },
        updateByKey() {
            this.$emit('change-key', { updateByKey: this.updateByKey });
        },
        deleteConditions() {
            this.$emit('change-delete-conditions', {
                deleteConditions: this.deleteConditions,
            });
        },
        dataRunApi() {
            if (JSON.stringify(this.dataRunApi) != '{}' && this.dataRunApi) {
                this.getDataCustom();
            }
        },
        disabled() {
            if (!this.disabled) {
                this.allInputs.nameDoc.disabled = false;
                this.allInputs.type.disabled = false;
                this.allInputs.pathToData.disabled = false;
                this.allInputs.pathToTotal.disabled = false;
            } else {
                this.allInputs.nameDoc.disabled = true;
                this.allInputs.type.disabled = true;
                this.allInputs.pathToData.disabled = true;
                this.allInputs.pathToTotal.disabled = true;
            }
        },
        type() {
            this.$emit('change-type-api', this.type);
            this.showCreateOrUpdateField();
        },
        docId() {
            const self = this;
            if (JSON.stringify(this.dataRunApi) != '{}' && this.dataRunApi) {
                this.getDataCustom();
            }
            documentApi.detailDocument(this.docId).then((res) => {
                if (res.status === 200) {
                    this.options.nameObj = res.data.document.title;
                    this.documentName = res.data.document.name;
                    this.handleMapping();
                    let propertyDocument = Object.values(res.data.fields);
                    // lưu tên của các property từ API document vào mảng
                    let tableNames = [];
                    let tableTitle = [];
                    for (let i = 0; i < propertyDocument.length; i++) {
                        if (propertyDocument[i].type == 'table') {
                            tableNames.push(
                                propertyDocument[i].properties.name,
                            );
                            tableTitle.push(
                                propertyDocument[i].properties.title,
                            );
                        }
                    }
                    // khởi tạo mảng lưu các giá trị của table document
                    this.createTable(tableNames, tableTitle, propertyDocument);
                    if (self.oldMappings) {
                        let listColumnUpdate = [];
                        Object.keys(self.updatedColumn).map((updateCol) => {
                            listColumnUpdate.push({
                                to: updateCol,
                                from: self.updatedColumn[updateCol],
                                type: 'textInput',
                            });
                        });
                        let listColumnMapping = [
                            ...listColumnUpdate,
                            ...self.oldMappings,
                        ];
                        self.setOldMapping(listColumnMapping);
                    }
                }
            });
        },
    },
    props: {
        listDoc: {
            type: Array,
            default() {
                return [];
            },
        },
        disabled: {
            type: Boolean,
            default() {
                return false;
            },
        },
        dataRunApi: {
            type: Object,
            default() {
                return {};
            },
        },
        oldDataImport: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    created() {
        this.setData(this.oldDataImport);
    },
    methods: {
        changeValue() {
            this.handleMapping();
        },
        save() {
            this.$emit('save');
        },
        saveAndRun() {
            this.$emit('save-and-run');
        },
        showCreateOrUpdateField() {
            if (this.type != 2) {
                this.allInputs.updateByKey.hidden = true;
                this.allInputs.deleteConditions.hidden = true;
            } else {
                this.allInputs.updateByKey.hidden = false;
                this.allInputs.deleteConditions.hidden = false;
            }
        },
        refreshData() {
            this.options = {};
            this.documentName = '';
            this.nameSheet = [];
            this.nameColumnDetail = {};
            this.listRowDocument = [];
            this.allInputs.nameDoc.value = '';
            this.allInputs.type.value = '0';
            this.allInputs.pathToData.value = 'items';
            this.allInputs.pathToTotal.value = 'totalRecords';
            this.allInputs.updateByKey.hidden = true;
            this.allInputs.deleteConditions.hidden = true;
            this.allInputs.deleteConditions.value = '';
            this.allInputs.updateByKey.value = [];
            this.allInputs.updateByKey.options = [];
        },
        setData(data) {
            this.allInputs.type.value = data.type;
            this.allInputs.pathToData.value = data.pathToData;
            this.allInputs.pathToTotal.value = data.pathToTotal;
            if (
                data.updateColumnInfo != '' &&
                data.updateColumnInfo != 'undefined'
            ) {
                this.updatedColumn = JSON.parse(
                    data.updateColumnInfo,
                ).conditions;
            }
            if (data.mappings) {
                let documentName = JSON.parse(data.mappings).documentName;
                this.findDocument(documentName, true);
                this.oldMappings = JSON.parse(data.mappings).mappingColumns
                    ? JSON.parse(data.mappings).mappingColumns
                    : '';
            }
            if (this.type == 2) {
                this.allInputs.updateByKey.value = { name: data.updateByKey };
                this.allInputs.deleteConditions.value = data.deleteConditions;
            } else {
                this.showCreateOrUpdateField();
            }
        },
        setOldMapping(mapping) {
            if (mapping.length > 0) {
                mapping.map((control) => {
                    if (control.type == 'table') {
                        // bảng
                        let listColumns = control.columns;
                        this.listRowDocument.map((controlTable, idx) => {
                            controlTable.controls.map((ctrl, ctrlIdx) => {
                                if (listColumns.length > 0) {
                                    listColumns.map((col, colIdx) => {
                                        if (ctrl.name == col.to) {
                                            this.listRowDocument[idx].controls[
                                                ctrlIdx
                                            ].isKeyControl = col.primary;
                                            this.listRowDocument[idx].controls[
                                                ctrlIdx
                                            ].dataColumn = {
                                                name: col.from,
                                                enable: false,
                                            };
                                            this.listRowDocument[idx].sheetMap =
                                                {
                                                    enable: false,
                                                    name: this.findNameColumn(
                                                        col.from,
                                                    ),
                                                };
                                            if (
                                                this.allInputs.type.value ==
                                                    2 &&
                                                this.updatedColumn != '{}'
                                            ) {
                                                // trường hợp update
                                                Object.keys(
                                                    this.updatedColumn,
                                                ).map((colUpdate) => {
                                                    if (colUpdate == col.to) {
                                                        this.listRowDocument[
                                                            idx
                                                        ].controls[
                                                            ctrlIdx
                                                        ].index = true;
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        });
                    } else {
                        // thông tin chung
                        this.listRowDocument[0].controls.map((c, index) => {
                            if (c.name == control.to) {
                                this.listRowDocument[0].controls[
                                    index
                                ].isKeyControl = control.primary;
                                this.listRowDocument[0].controls[
                                    index
                                ].dataColumn = {
                                    name: control.from,
                                    enable: false,
                                };
                                if (
                                    this.allInputs.type.value == 2 &&
                                    this.updatedColumn != '{}'
                                ) {
                                    // trường hợp update
                                    Object.keys(this.updatedColumn).map(
                                        (colUpdate) => {
                                            if (colUpdate == control.to) {
                                                this.listRowDocument[0].controls[
                                                    index
                                                ].index = true;
                                            }
                                        },
                                    );
                                }
                            }
                        });
                        this.listRowDocument[0].sheetMap = {
                            enable: false,
                            name: 'Thông tin chung',
                        };
                    }
                });
            }
        },
        findNameColumn(name) {
            let nameColumn = '';
            Object.keys(this.nameColumnDetail).map((column) => {
                this.nameColumnDetail[column].map((c) => {
                    if (c.name == name) {
                        nameColumn = column;
                    }
                });
            });
            return nameColumn;
        },
        handleMapping() {
            if (this.listRowDocument.length > 0) {
                let updateColumnInfo = {
                    conditions: {},
                };
                let mappingColumns = [];
                this.listRowDocument.map((row) => {
                    if (row.name == 'Thông tin chung') {
                        // không phải bảng
                        row.controls.map((control) => {
                            if (control.dataColumn) {
                                let info = {
                                    from: control.dataColumn.name,
                                    to: control.name,
                                    type: control.dataType,
                                    primary: control.isKeyControl,
                                };
                                if (control.index) {
                                    updateColumnInfo.conditions[control.name] =
                                        control.dataColumn.name;
                                }
                                mappingColumns.push(info);
                            }
                        });
                    } else {
                        let data = {
                            from: row.sheetMap.name,
                            to: row.name,
                            type: 'table',
                            columns: [],
                        };
                        let check = false;
                        row.controls.map((control) => {
                            if (control.dataColumn) {
                                let info = {
                                    from: control.dataColumn.name,
                                    to: control.name,
                                    type: control.dataType,
                                    primary: control.isKeyControl,
                                };
                                if (control.index) {
                                    updateColumnInfo.conditions[control.name] =
                                        control.dataColumn.name;
                                }
                                data.columns.push(info);
                                check = true;
                            }
                        });
                        if (check) mappingColumns.push(data);
                    }
                });

                let mappings = {
                    documentName: this.documentName,
                    mappingColumns: mappingColumns,
                };
                let mappingData = {
                    mappings: mappings,
                    updateColumnInfo: JSON.stringify(updateColumnInfo),
                    data: this.dataRunApi.data.data,
                    // apiQueryUuid:this.dataRunApi.data.apiQuery,
                    pathToData: this.allInputs.pathToData.value,
                    pathToTotal: this.allInputs.pathToTotal.value,
                };
                if (this.type == 2) {
                    // mappingData.mappings = this.filterMappingUpdate(mappings, updateColumnInfo);
                    mappingData.updateByKey = this.allInputs.updateByKey.value
                        ? this.allInputs.updateByKey.value.name
                        : '';
                    mappingData.deleteConditions =
                        this.allInputs.deleteConditions.value;
                }
                this.$emit('set-mapping', mappingData);
            }
        },
        // loại những cột đã gửi trong condition
        filterMappingUpdate(mappings, updateColumnInfo) {
            if (updateColumnInfo.conditions) {
                Object.keys(updateColumnInfo.conditions).map((col) => {
                    mappings.mappingColumns.map((map, idx) => {
                        if (map.to == col) {
                            mappings.mappingColumns.splice(idx, 1);
                        }
                    });
                });
            }
            return mappings;
        },
        getDataCustom() {
            this.nameColumnDetail['Thông tin chung'] = [];
            this.nameSheet = [{ name: 'Thông tin chung', enable: true }];
            let data = this.dataRunApi.data.data;
            let tableList = [];
            let fieldApiKey = [];
            // lấy những control là Array
            let keyApiObj = Object.keys(data[0]);
            keyApiObj.map((key) => {
                if (
                    Array.isArray(data[0][key]) &&
                    typeof data[0][key][0] != 'string'
                ) {
                    tableList.push({ name: key, listValue: data[0][key] });
                } else {
                    let info = {
                        name: key,
                        index: 0,
                        enable: true,
                    };
                    fieldApiKey.push({ name: key });

                    this.nameColumnDetail['Thông tin chung'].push(info);
                }
            });
            this.allInputs.updateByKey.options = fieldApiKey;
            tableList.map((name) => {
                let nameSheet = name.name;
                this.nameSheet.push({ name: nameSheet, enable: true });
                this.nameColumnDetail[nameSheet] = [];
                if (name.listValue.length > 0) {
                    // trường hợp có dữ liệu
                    Object.keys(name.listValue[0]).map((key) => {
                        let infoTableColumn = {
                            name: key,
                            index: 0,
                            enable: true,
                        };
                        this.nameColumnDetail[nameSheet].push(infoTableColumn);
                    });
                } else {
                    let childField = data.filter(
                        (d) => d[name].listValue.length > 0,
                    )[0];
                    if (childField.length > 0) {
                        Object.keys(childField).map((key) => {
                            let infoTableColumn = {
                                name: key,
                                index: 0,
                                enable: true,
                            };
                            this.nameColumnDetail[nameSheet].push(
                                infoTableColumn,
                            );
                        });
                    }
                }
            });
        },
        findDocument(value, setName = false) {
            if (value && value != '') {
                const self = this;
                documentApi.filterDoc(value).then((res) => {
                    if (res.status == 200) {
                        self.listDocument = [];
                        res.data.listObject.map((data) => {
                            self.listDocument.push({
                                id: data.id,
                                name: data.name,
                            });
                        });
                        self.allInputs.nameDoc.options = self.listDocument;
                        if (
                            setName &&
                            self.allInputs.nameDoc.options.length > 0
                        ) {
                            self.allInputs.nameDoc.value =
                                self.allInputs.nameDoc.options.filter(
                                    (doc) => doc.name == value,
                                )[0].id;
                        }
                    }
                });
            }
        },
        findControlsForTable(nameTable, propertyDocument) {
            let controls = [];
            let property = propertyDocument.filter(
                (p) => p.listFields && p.properties.name == nameTable,
            );
            for (let i = 0; i < property.length; i++) {
                let list = Object.values(property[i].listFields);
                for (let j = 0; j < list.length; j++) {
                    controls.push({
                        name: list[j].properties.name,
                        title: list[j].properties.title,
                        isKeyControl: false,
                        isNull: this.checkIsRequired(
                            list[j].properties.isRequired,
                        ),
                        dataColumn: null,
                        dataType: list[j].type,
                    });
                }
            }
            return controls;
        },
        createTable(tableNames, tableTitle, propertyDocument) {
            // general
            let controls = [];
            for (let i = 0; i < propertyDocument.length; i++) {
                if (
                    ['submit', 'approvalHistory', 'reset', 'draft'].includes(
                        propertyDocument[i].type,
                    )
                ) {
                    continue;
                }
                controls.push({
                    name: propertyDocument[i].properties.name,
                    title: propertyDocument[i].properties.title,
                    isKeyControl: false,
                    isNull: this.checkIsRequired(
                        propertyDocument[i].properties.isRequired,
                    ),
                    dataColumn: null,
                    dataType: propertyDocument[i].type,
                });
            }
            let tables = [
                {
                    sheetMap: '',
                    name: 'Thông tin chung',
                    title: this.$t('v2.dataconnector.generalInformation'),
                    controls,
                },
            ];
            // tables
            for (let i = 0; i < tableNames.length; i++) {
                tables.push({
                    sheetMap: '',
                    title: tableTitle[i],
                    keyColumn: {
                        index: -1,
                        name: '',
                    },
                    name: tableNames[i],
                    controls: this.findControlsForTable(
                        tableNames[i],
                        propertyDocument,
                    ),
                });
            }
            this.listRowDocument = tables;
        },
        checkIsRequired(isRequired) {
            if (isRequired == 0) {
                return true;
            } else {
                return false;
            }
        },
        getDataType(controlType) {
            let typeMap = {
                number: 'number',
                month: 'number',
                percent: 'number',
                date: 'date',
                time: 'time',
                datetime: 'datetime',
                table: 'table',
            };
            if (typeMap[controlType]) {
                return typeMap[controlType];
            } else {
                return 'text';
            }
        },
    },

    data() {
        const self = this;
        return {
            options: {},
            updatedColumn: '',
            documentName: '',
            nameSheet: [],
            nameColumnDetail: {},
            listRowDocument: [],
            listDocument: [],
            oldMappings: '',
            allInputs: {
                nameDoc: {
                    disabled: this.disabled,
                    info: '',
                    title: this.$t('v2.dataconnector.storePlace'),
                    type: 'autocomplete',
                    value: '',
                    info: '',
                    showId: true,
                    value: '',
                    onSearch(value) {
                        self.findDocument(value, false);
                    },
                    options: this.disabled ? '' : this.listDoc,
                },
                type: {
                    disabled: this.disabled,
                    info: '',
                    title: this.$t('v2.dataconnector.writeType'),
                    type: 'select',
                    value: '0',
                    info: '',
                    options: [
                        // {value:'1',text:'Ghi đè'},
                        { value: '0', text: this.$t('v2.dataconnector.create') },
                        { value: '2', text: this.$t('v2.dataconnector.update') },
                    ],
                },
                pathToData: {
                    disabled: this.disabled,
                    title: this.$t('v2.dataconnector.pathToData'),
                    type: 'text',
                    value: 'items',
                    info: '',
                },
                pathToTotal: {
                    disabled: this.disabled,
                    info: '',
                    title: this.$t('v2.dataconnector.pathToTotal'),
                    type: 'text',
                    value: 'totalRecords',
                },
                updateByKey: {
                    disabled: this.disabled,
                    info: '',
                    hidden: this.type == 2 ? false : true,
                    title: this.$t('v2.dataconnector.fieldValidUpdate'),
                    type: 'autocomplete',
                    value: '',
                    options: [],
                    multipleSelection: false,
                    showId: false,
                },
                deleteConditions: {
                    disabled: this.disabled,
                    info: '',
                    hidden: this.type == 2 ? false : true,
                    title: this.$t('v2.dataconnector.deleteConditions'),
                    type: 'text',
                    value: '',
                },
            },
        };
    },
};
</script>
<style scoped>
.form >>> .span {
    font-size: 11px !important;
}
.primary--text {
    background: white !important;
}
</style>

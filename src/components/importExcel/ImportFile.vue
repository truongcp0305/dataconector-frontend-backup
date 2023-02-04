<template>
    <v-stepper v-model="stepper" class="v-stepper h-100">
        <div class="pb-1 w-100 import-header">
            <i class="mdi mdi-file-upload-outline fs-16 mr-6 ml-5"></i>
            <span class="fs-13 fw-430">{{$t('v2.importExport.importData')}}</span>
            <button
                v-if="showCancelBtn"
                @click="cancel()"
                class="ml-10 mr-1"
                style="float: right"
            >
                <i class="mdi mdi-close fs-16"></i>
            </button>
        </div>
        <v-row class="h-100 mt-1 ml-0">
            <v-col cols="3" style="border-right: 1px solid rgba(0, 0, 0, 0.2)">
                <v-list style="margin-top: -25px">
                    <v-stepper-header class="stepper-header">
                        <v-stepper-step
                            class="fs-13"
                            editable
                            step="1"
                            @click="showImportInfo()"
                        >
                        {{$t('v2.importExport.information')}}
                        </v-stepper-step>
                    </v-stepper-header>
                    <v-stepper-header class="stepper-header">
                        <v-stepper-step
                            class="fs-13"
                            editable
                            step="2"
                            @click="mapImportInfo()"
                        >
                        {{$t('v2.importExport.matchInformation')}}
                        </v-stepper-step>
                    </v-stepper-header>
                </v-list>
            </v-col>
            <v-col cols="9" style="margin-left: -15px" v-show="showImport">
                <v-row class="ml-5 mt-1">
                    <span class="font"
                        ><b class="color-grey fw-500 fs-13">
                            {{$t('v2.importExport.importInformationFor')}} {{ options.nameObj }}</b
                        >
                    </span>
                </v-row>
                <v-row class="ml-2 mt-1">
                    <UploadFile
                        ref="uploadFile"
                        @dataExcel="getDataExcel"
                        :importInfo="importInfo"
                        :errorMessage="errorMessage"
                        @showMapping="nextToImport"
                        @selectType="selectType"
                        @clearFiles="clearFiles"
                        @keyUpload="setKey"
                    />
                </v-row>
                <v-row class="ml-5 mt-1">
                    <span class="fs-12 color-red">{{ errorType }}</span>
                </v-row>
            </v-col>
            <v-col cols="9" v-show="mapImport">
                <v-row class="ml-2 mt-1">
                    <span class="font"
                        ><b class="color-grey fw-500 fs-13">
                            {{$t('v2.importExport.importInformationFor')}} {{ options.objName }}</b
                        >
                    </span>
                </v-row>
                <v-list dense>
                    <v-row class="ml-2">
                        <span
                            ><b class="color-grey fs-13 fw-500"
                                >{{$t('v2.importExport.notesOnDataMatching')}}
                            </b></span
                        >
                    </v-row>
                    <v-row class="ml-2 mt-1 mr-7 color-grey fs-12">
                        {{$t('v2.importExport.dataFieldMessage')}}
                    </v-row>
                    <v-row
                        v-if="options.objType == 'user'"
                        class="ml-2 mt-1 mr-7 color-grey fs-12"
                    >{{$t('v2.importExport.passwordValidateMessage')}}
                    </v-row>
                </v-list>
                <!-- Thông tin chung -->
                <v-list class="fs-13 ml-2 mr-0">
                    <div
                        class="col-flex"
                        style="margin-bottom: -26px"
                        v-for="(table, tableIdx) in tables"
                        :key="tableIdx"
                    >
                        <v-row class="mr-1">
                            <v-col
                                class="ellipsis col-md-5 ml-1 pl-1"
                                style="margin-top: -13px"
                            >
                                <v-icon
                                    v-if="tables[tableIdx] == tables[0]"
                                    size="18"
                                    >mdi-file-outline</v-icon
                                >
                                <v-icon v-else size="18" class="ml-3"
                                    >mdi-table</v-icon
                                >
                                <span class="color-grey fs-13 pl-1">
                                    <b class="fw-500"
                                        >{{ table.title }}
                                        <span
                                            v-if="tables[tableIdx] == tables[0]"
                                            style="color: red"
                                            >*</span
                                        >
                                        <span v-if="options.objType != 'user'">
                                            ({{
                                                sumCount(tableIdx, 'document')
                                            }})
                                        </span>
                                        <span v-else>
                                            ({{ sumCount(tableIdx, 'user') }})
                                        </span>
                                    </b>
                                </span>
                            </v-col>
                            <v-col
                                class="col-md-6 py-0"
                                style="margin-top: -13px"
                            >
                                <v-autocomplete
                                    :value="table.sheetMap"
                                    @input="
                                        (value) =>
                                            onChangeSheet(tableIdx, value)
                                    "
                                    class="
                                        auto-complete
                                        color-normal
                                        mt-4
                                        mb-3
                                        fs-13
                                    "
                                    :items="nameSheets"
                                    item-text="name"
                                    return-object
                                    style="width: 200px; padding-left: 2px"
                                    clearable
                                    :menu-props="{
                                        'nudge-top': -10,
                                        'max-width': 300
                                    }"
                                >
                                    <template v-slot:item="{ item, on, attrs }">
                                        <v-list-item
                                            v-show="item.enable"
                                            v-on="on"
                                            v-bind="attrs"
                                        >
                                            <v-list-item-content>
                                                <v-list-item-title>
                                                    {{ item.name }}
                                                </v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </template>
                                </v-autocomplete>
                            </v-col>
                            <!-- khoá ngoai -->
                        </v-row>
                        <v-row
                            v-if="options.objType != 'user'"
                            class="mb-3"
                            style="margin-top: -27px; margin-right: 9px"
                        >
                            <v-col
                                class="
                                    col-md-5
                                    pb-5
                                    d-flex
                                    justify-content
                                    ml-2
                                "
                            >
                                <v-icon
                                    style="margin-top: -19px; font-size: 13px"
                                    class="pr-4"
                                    size="18"
                                    >mdi mdi-key</v-icon
                                >
                                <div
                                    class="color-normal"
                                    style="float: left; margin-top: -13px"
                                >
                                {{$t('v2.importExport.key')}}
                                    <span
                                        v-if="
                                            tableIdx != 0 &&
                                            checkKeyRequired(table, tableIdx)
                                        "
                                        style="color: red"
                                        >*</span
                                    >
                                    <span
                                        v-if="
                                            tableIdx == 0 && tables.length > 1
                                        "
                                        style="color: red"
                                        >*</span
                                    >
                                </div>
                            </v-col>
                            <v-col class="col-md-6 py-0">
                                <v-autocomplete
                                    class="color-normal auto-complete"
                                    :value="table.keyColumn"
                                    @input="
                                        (value) => onChangeKey(tableIdx, value)
                                    "
                                    @click:clear="
                                        clearKey(tableIdx, table.keyColumn)
                                    "
                                    :items="
                                        nameColumnDetail[table.sheetMap.name]
                                            ? nameColumnDetail[
                                                  table.sheetMap.name
                                              ]
                                            : []
                                    "
                                    item-text="name"
                                    return-object
                                    clearable
                                    :menu-props="{
                                        'nudge-top': -10,
                                        'max-width': 300
                                    }"
                                >
                                    <template v-slot:item="{ item, on, attrs }">
                                        <v-list-item v-on="on" v-bind="attrs">
                                            <v-list-item-content>
                                                <v-list-item-title>
                                                    {{ item.name }}
                                                </v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </template>
                                </v-autocomplete>
                            </v-col>
                        </v-row>
                        <v-row
                            class="mr-3"
                            v-for="(control, controlIdx) in table.controls"
                            v-if="control.dataType != 'table' && control.title"
                            :key="controlIdx"
                        >
                            <v-col
                                class="col-md-5 ml-2 pl-3 ellipsis"
                                style="margin-top: -40px"
                            >
                                <v-icon class="fs-14 mr-2 color-normal">{{
                                    getIcon(control.dataType)
                                }}</v-icon>
                                <v-tooltip right>
                                    <template v-slot:activator="{ on }">
                                        <span style="color: red">
                                            {{ control.isNull ? ' ' : '*' }}
                                        </span>
                                        <span v-on="on" class="color-normal">
                                            {{
                                                control.title
                                                    ? control.title
                                                    : control.name
                                            }}
                                        </span>
                                    </template>
                                    {{
                                        control.title
                                            ? control.title
                                            : control.name
                                    }}
                                </v-tooltip>
                            </v-col>
                            <v-col
                                class="col-md-6"
                                style="margin-top: -39px; margin-left: 2px"
                            >
                                <v-autocomplete
                                    style="width: 215px"
                                    class="auto-complete color-normal"
                                    :items="
                                        nameColumnDetail[table.sheetMap.name]
                                            ? nameColumnDetail[
                                                  table.sheetMap.name
                                              ]
                                            : []
                                    "
                                    item-text="name"
                                    return-object
                                    :value="control.dataColumn"
                                    @input="
                                        (value) =>
                                            onChangeDetailInfo(
                                                tableIdx,
                                                controlIdx,
                                                value
                                            )
                                    "
                                    clearable
                                    :menu-props="{
                                        'nudge-top': -10,
                                        'max-width': 300
                                    }"
                                >
                                    <template v-slot:item="{ item, on, attrs }">
                                        <v-list-item
                                            v-show="item.enable"
                                            v-on="on"
                                            v-bind="attrs"
                                        >
                                            <v-list-item-content>
                                                <v-list-item-title>
                                                    {{ item.name }}
                                                </v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </template>
                                </v-autocomplete>
                            </v-col>
                        </v-row>
                    </div>
                    <v-row class="ml-3">
                        <span class="color-red" style="float: right">
                            {{ errorMessage }}
                        </span>
                    </v-row>
                    <v-row class="mr-3">
                        <v-col class="col-md-9"></v-col>
                        <v-col>
                            <v-btn
                                class="import-button ml-1"
                                :disabled="disableImportBtn"
                                small
                                @click="importFile()"
                                depressed
                                color="info"
                            >
                                <span class="fs-13 fw-400">{{$t('v2.importExport.import')}}</span>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-list>
            </v-col>
        </v-row>
    </v-stepper>
</template>
<script>
import UploadFile from './UploadFileExcel';
import { documentApi } from './../../api/Document';
import importApi from './../../api/ImportExcel';
import ImportWorker from 'worker-loader!@/worker/import/Import.Worker.js';
export default {
    components: {
        UploadFile
    },
    props: ['deleteFileName', 'tables', 'options'],
    data() {
        return {
            disableImportBtn: false,
            dataImport: {},
            importWorker: null,
            stepper: 1,
            mapImport: false,
            showImport: true,
            newLastKeyTables: [],
            lastKey: [],
            selectType: '',
            nameSheets: [],
            lastTable: [],
            nameColumnDetail: {},
            data: {},
            lastNameSheet: [],
            fileName: '',
            import: false,
            errorType: '',
            dataExel: {},
            showCancelBtn: true,
            errorMessage: '',
            key: ''
        };
    },
    computed: {
        newImport() {
            return this.$store.state.importExcel.newImport;
        },
        importInfo() {
            return { options: this.options };
        }
    },
    created() {
        this.importWorker = new ImportWorker();
        this.stepper = 1;
        this.errorMessage = ' ';
    },
    mounted() {
        const self = this;
        this.importWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'import':
                    self.handleImportFile(data.dataAfter);
                    break;
                case 'getLastData':
                    self.handleGetLastData(data.dataAfter);
                    break;
                default:
                    break;
            }
        });
    },
    methods: {
        handleGetMappingTable(data) {
            this.tables = data.tables;
            // this.newLastKeyTables = data.newLastKeyTables
        },
        getMappingTable() {
            let column = this.nameColumnDetail;
            column = JSON.stringify(column);
            let columnAr = this.nameColumnDetail;
            columnAr = Object.values(columnAr);
            if (column.length > 2) {
                for (let i = 0; i < this.tables.length; i++) {
                    for (let j = 0; j < this.lastTable.length; j++) {
                        if (
                            this.lastTable[j].nameTable ==
                                this.tables[i].name &&
                            this.checkNameSheetExist(
                                this.lastTable[j].nameSheet
                            )
                        ) {
                            for (
                                let k = 0;
                                k < this.tables[i].controls.length;
                                k++
                            ) {
                                if (
                                    this.tables[i].controls[k].name ==
                                    this.lastTable[j].controlName
                                ) {
                                    this.hideNameSheet(
                                        this.lastTable[j].nameSheet
                                    );
                                    this.tables[i].sheetMap = {
                                        name: '',
                                        enable: false
                                    };
                                    this.tables[i].controls[k].dataColumn = {
                                        name: '',
                                        index: 0,
                                        enable: false
                                    };
                                    this.tables[i].sheetMap.name =
                                        this.lastTable[j].nameSheet;
                                    this.tables[i].controls[k].dataColumn.name =
                                        this.lastTable[j].dataColumn;

                                    this.tables[i].controls[
                                        k
                                    ].dataColumn.index = this.getIndexColumnMapping(
                                        this.lastTable[j].dataColumn,
                                        this.tables[i].sheetMap.name
                                    );
                                }
                            }
                        }
                    }
                }
                this.setLastKeyGeneral();
                this.setLastKeyTables();
            } else {
                console.error("Không có file Mapping");
            }
        },
        //phần mapping --- hàm tìm index mới cho cột
        getIndexColumnMapping(value, nameSheet) {
            let index = -1;
            let arr = this.nameColumnDetail[nameSheet];
            for (let j = 0; j < arr.length; j++) {
                if (arr[j].name == value) {
                    this.nameColumnDetail[nameSheet][j].enable = false;
                    return (index = arr[j].index);
                }
            }
        },
        hideNameSheet(value) {
            for (let i = 0; i < this.nameSheets.length; i++) {
                if (this.nameSheets[i].name == value) {
                    this.nameSheets[i].enable = false;
                }
            }
        },
        // hàm xử lý key từng bảng con, so sánh với dòng trong excel nếu trùng thì set sheetMap
        setLastKeyTables() {
            // kiểm tra để lấy key
            let newLastKeyTables = [];
            for (let i = 1; i < this.lastKey.length; i++) {
                for (let j = 0; j < this.nameSheets.length; j++) {
                    let arr = this.nameColumnDetail[this.nameSheets[j].name];
                    for (let k = 0; k < arr.length; k++) {
                        if (arr[k].name == this.lastKey[i].name) {
                            newLastKeyTables.push({
                                name: this.lastKey[i].name,
                                sheet: this.nameSheets[j].name,
                                index: arr[k].index,
                                enable: true
                            });
                        }
                    }
                }
            }
            this.newLastKeyTables = newLastKeyTables;
            //đẩy key
            const self = this;
            for (let i = 1; i < this.tables.length; i++) {
                for (let j = 0; j < this.newLastKeyTables.length; j++) {
                    if (
                        this.tables[i].sheetMap &&
                        this.tables[i].sheetMap.name ==
                            this.newLastKeyTables[j].sheet
                    ) {
                        this.tables[i].keyColumn.name =
                            this.newLastKeyTables[j].name;
                        this.tables[i].keyColumn.enable = true;
                        this.tables[i].keyColumn.index =
                            this.newLastKeyTables[j].index;
                    }
                }
            }
        },
        //checkSheet có tồn tại
        checkNameSheetExist(nameSheet) {
            let check = false;
            for (let j = 0; j < this.nameSheets.length; j++) {
                if (this.nameSheets[j].name == nameSheet) {
                    check = true;
                }
            }
            return check;
        },
        //phần mapping--- hàm tìm key cho cột
        setLastKeyGeneral() {
            if (
                this.tables[0].sheetMap.name == this.lastTable[0].nameSheet &&
                this.checkNameSheetExist(this.lastTable[0].nameSheet)
            ) {
                this.tables[0].keyColumn.name = this.lastKey[0].name;
                this.tables[0].keyColumn.enable = true;
                this.tables[0].keyColumn.index = this.getIndexColumnMapping(
                    this.lastKey[0].name,
                    this.tables[0].sheetMap.name
                );
            }
        },
        handleImportFile(dataImport) {
            const self = this;
            this.showCancelBtn = false;
            this.$emit('import', { fileName: this.data.fileName });
            if (dataImport.message == '') {
                importApi.pushDataExcel(dataImport.data).then((res) => {
                    if (res.status == 200) {
                        self.disableImportBtn = false;
                    } else {
                        console.error('error');
                        self.disableImportBtn = false;
                    }
                });
            } else {
                this.errorMessage = dataImport.message;
            }
        },
        handleGetLastData(data) {
            this.lastTable = data.lastTable;
            this.lastKey = data.lastKey;
            this.lastNameSheet = data.lastNameSheet;
        },
        checkKeyRequired(tables, tableIdx) {
            let check = false;
            for (let i = 0; i < tables.controls.length; i++) {
                if (!tables.controls[i].isNull) {
                    check = true;
                }
            }
            return check;
        },
        nextToImport(dataUpload) {
            let check = true;
            if (dataUpload.data.key == '') {
                this.errorMessage = this.$t('v2.importExport.haventChoseFile');
                check = false;
            }
            if (dataUpload.nameImport == ' ') {
                check = false;
                this.errorMessage = this.$t('v2.importExport.haventChoseFileName');
            }
            if (check) {
                (this.errorMessage = ''), (this.stepper = 2);
                this.mapImportInfo();
                this.selectType = dataUpload.selectType;
            }
        },
        showImportInfo() {
            this.stepper = 2;
            this.mapImport = false;
            this.showImport = true;
        },
        mapImportInfo() {
            this.mapImport = true;
            this.showImport = false;
        },
        sumCount(tableIdx, type) {
            let totalAllRow = 0;
            let totalFilledRow = this.tables[tableIdx].controls.filter(
                (p) => p.dataColumn != null
            ).length;
            let isFilledKey = this.tables[tableIdx].keyColumn
                ? this.tables[tableIdx].keyColumn.enable
                    ? 1
                    : 0
                : 0;
            if (type != 'user') {
                totalAllRow =
                    this.tables[tableIdx].controls.filter(
                        (p) => p.dataType != 'table'
                    ).length + 1;
            } else {
                totalAllRow = this.tables[tableIdx].controls.filter(
                    (p) => p.dataType != 'table'
                ).length;
            }
            return totalFilledRow + isFilledKey + '/' + totalAllRow;
        },
        clearKey(tableIdx, value) {
            let nameSheet = this.tables[tableIdx].sheetMap.name;
            this.nameColumnDetail[nameSheet].map((col, index) => {
                if (col.name == value.name) {
                    this.nameColumnDetail[nameSheet][index].enable = true;
                }
            });
        },
        //Sự kiện xảy ra khi thay đổi Key
        onChangeKey(tableIdx, value) {
            if (value) {
                this.tables[tableIdx].keyColumn = {
                    enable: true,
                    index: value.index,
                    name: value.name
                };
            } else {
                this.tables[tableIdx].keyColumn = {
                    enable: false,
                    index: -1,
                    name: ''
                };
            }
            let nameSheet = this.tables[tableIdx].sheetMap.name;
            this.nameColumnDetail[nameSheet].map((col, index) => {
                if (col.name == value.name) {
                    this.nameColumnDetail[nameSheet][index].enable = value
                        ? false
                        : true;
                }
            });
        },
        //Chọn key cho bảng
        setKey(val) {
            this.key = val;
        },
        cancel() {
            this.$emit('cancel');
            this.refreshData();
            this.$emit('stopSetInterval');
            this.$store.commit('importExcel/setNewImport', true);
            if (this.$refs.uploadFile) {
                this.$refs.uploadFile.refreshData();
            }
        },
        refreshData() {
            this.disableImportBtn = false;
            this.errorType = '';
            this.errorMessage = '';
            this.data = [];
            this.nameSheets = [];
            this.showCancelBtn = true;
            this.nameColumnDetail = {};
            this.tables.map((table) => {
                table.keyColumn = { enable: false, index: -1, name: '' };
                table.sheetMap = '';
                table.controls.map((control) => {
                    control.dataColumn = null;
                });
            });
        },
        // xoá dữ liệu trở về mặc định
        clearFiles() {
            this.refreshData();
            this.$emit('stopSetInterval');
            this.$emit('closeValidate');
            this.getLastData();
        },
        // Lấy dữ liệu từ API
        getDataExcel(data) {
            if (data.data) {
                this.importInfo.nameImport = data.data.nameImport;
                this.importInfo.description = data.data.description;
                this.importInfo.selectType = data.data.typeImport;
                this.data = data.data;
                if (Array.isArray(this.data)) {
                } else {
                    this.getSheetAndColumnName();
                }
            } else {
                if (data.status == '403') {
                    this.errorType = this.$t('v2.importExport.youDontHaveRightToUpload');
                } else {
                    this.errorType = this.$t('v2.importExport.fileTypeDisqualified');
                }
            }
        },
        getLastData() {
            const self = this;
            importApi
                .getMapping(this.options.objId)
                .then((res) => {
                    if (res.status === 200) {
                        let mapping = JSON.parse(res.data[0].mapping);
                        mapping = mapping.mapping;
                        let row = [];
                        let lastNameSheet = [];
                        lastNameSheet.push(mapping.general.sheetMap);
                        this.lastKey = [];
                        if (mapping.general.keyColumn) {
                            this.lastKey.push({
                                enable: mapping.general.keyColumn.enable,
                                index: mapping.general.keyColumn.index,
                                name: mapping.general.keyColumn.name,
                                nameSheet: mapping.general.sheetMap,
                                nameTable: this.$t('v2.importExport.generalInformation')
                            });
                        }
                        for (
                            let i = 0;
                            i < mapping.general.controls.length;
                            i++
                        ) {
                            row.push({
                                controlName: mapping.general.controls[i].name,
                                nameSheet: mapping.general.sheetMap,
                                nameTable: this.$t('v2.importExport.generalInformation'),
                                dataColumn:
                                    mapping.general.controls[i].dataColumn.name
                            });
                        }
                        if (mapping.tables) {
                            for (let i = 0; i < mapping.tables.length; i++) {
                                lastNameSheet.push(mapping.tables[i].sheetMap);
                                if (mapping.tables[i].keyColumn) {
                                    let nameLastKeyTables =
                                        mapping.tables[i].keyColumn.name;
                                    this.lastKey.push({
                                        name: nameLastKeyTables,
                                        index: -1,
                                        enable: false,
                                        nameSheet: mapping.tables[i].sheetMap
                                    });
                                }
                                for (
                                    let j = 0;
                                    j < mapping.tables[i].controls.length;
                                    j++
                                )
                                    row.push({
                                        nameSheet: mapping.tables[i].sheetMap,
                                        controlName:
                                            mapping.tables[i].controls[j].name,
                                        dataColumn:
                                            mapping.tables[i].controls[j]
                                                .dataColumn.name,
                                        nameTable: mapping.tables[i].name
                                    });
                            }
                        }
                        self.lastTable = row;
                        self.lastNameSheet = lastNameSheet;
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        },
        // Sự kiện được gọi khi ấn import
        importFile() {
            this.disableImportBtn = true;
            let dataImport = {
                tables: this.tables,
                fileName: this.data.fileName,
                subObjType: this.options.subObjType,
                documentName: this.options.nameObj,
                key: this.key,
                nameImport: this.importInfo.nameImport,
                description: this.importInfo.description,
                objId: this.options.objId,
                typeImport: this.selectType,
                objType: this.options.objType
            };
            this.importWorker.postMessage({
                action: 'import',
                data: { data: dataImport }
            });
        },
        //Lấy icon theo kiểu dữ liệu
        getIcon(controlType) {
            let typeMap = {
                number: 'mdi-numeric',
                month: 'mdi-numeric',
                percent: 'mdi-numeric',
                date: 'mdi-calendar-month',
                time: 'mdi-clock-outline',
                datetime: 'mdi-calendar-clock'
            };
            if (typeMap[controlType]) {
                return typeMap[controlType];
            } else {
                return 'mdi-alphabetical-variant';
            }
        },
        //Lấy ra tên các sheet trong excel
        getSheetAndColumnName() {
            let sheets = [];
            for (let i = 0; i < this.data.sheets.length; i++) {
                sheets.push({
                    name: this.data.sheets[i].name,
                    enable: true
                });
            }
            this.nameSheets = sheets;
            let columnDetail = {};
            for (let i = 0; i < this.data.sheets.length; i++) {
                let currentSheet = this.data.sheets[i].name;
                columnDetail[currentSheet] = [];
                for (let j = 0; j < this.data.sheets[i].columns.length; j++) {
                    if (this.data.sheets[i].columns[j].name != '') {
                        columnDetail[currentSheet].push({
                            ...this.data.sheets[i].columns[j],
                            enable: true
                        });
                    }
                }
            }
            this.nameColumnDetail = columnDetail;
            this.getMappingTable();
        },

        //Sự kiện xảy ra khi thay đổi tên Sheet
        onChangeSheet(tableIdx, value) {
            // 1. Khi select sheet
            if (value) {
                // chuyển giá trị được chọn thành false
                value.enable = false;
                this.tables[tableIdx].keyColumn = null;
                // đẩy giá trị cũ thành true
                if (this.tables[tableIdx].sheetMap) {
                    this.tables[tableIdx].sheetMap.enable = true;
                }
                // kiểm tra những sheet đã tồn tại khi lấy giá trị từ mapping
                for (let i = 0; i < this.nameSheets.length; i++) {
                    if (
                        this.nameSheets[i].name ==
                        this.tables[tableIdx].sheetMap.name
                    ) {
                        this.nameSheets[i].enable = true;
                    }
                }
                this.tables[tableIdx].sheetMap = value;
                // 2. Khi xóa sheet
            } else {
                let name = this.tables[tableIdx].sheetMap.name;
                this.tables[tableIdx].sheetMap.enable = true;
                this.tables[tableIdx].sheetMap = '';
                this.tables[tableIdx].keyColumn = null;
                for (let i = 0; i < this.nameSheets.length; i++) {
                    if (this.nameSheets[i].name == name) {
                        this.nameSheets[i].enable = true;
                    }
                    for (
                        let j = 0;
                        j < this.nameColumnDetail[name].length;
                        j++
                    ) {
                        this.nameColumnDetail[name][j].enable = true;
                    }
                }
            }
            this.tables[tableIdx].controls.forEach((c) => {
                if (c.dataColumn) c.dataColumn.enable = true;
            });
            this.tables[tableIdx].controls = this.tables[tableIdx].controls.map(
                (c) => ({
                    ...c,
                    dataColumn: null
                })
            );
        },
        // Sự kiện xảy ra khi thay đổi từng cột thông in trong sheet
        onChangeDetailInfo(tableIdx, controlIdx, value) {
            // trường hợp đổi trực tiếp
            if (value) {
                value.enable = false;
                if (this.tables[tableIdx].controls[controlIdx].dataColumn) {
                    this.tables[tableIdx].controls[
                        controlIdx
                    ].dataColumn.enable = true;
                }
                for (let i = 0; i < this.nameSheets.length; i++) {
                    let arr = this.nameColumnDetail[this.nameSheets[i].name];
                    for (let j = 0; j < arr.length; j++) {
                        if (
                            this.tables[tableIdx].controls[controlIdx]
                                .dataColumn != null
                        ) {
                            if (
                                this.tables[tableIdx].controls[controlIdx]
                                    .dataColumn.name == arr[j].name
                            ) {
                                this.nameColumnDetail[this.nameSheets[i].name][
                                    j
                                ].enable = true;
                            }
                        }
                    }
                }
                this.tables[tableIdx].controls[controlIdx].dataColumn = value;
                // trường hợp khi ấn dấu xóa
            } else {
                this.tables[tableIdx].controls[
                    controlIdx
                ].dataColumn.enable = true;
                for (let i = 0; i < this.nameSheets.length; i++) {
                    let arr = this.nameColumnDetail[this.nameSheets[i].name];
                    for (let j = 0; j < arr.length; j++) {
                        if (
                            this.tables[tableIdx].controls[controlIdx]
                                .dataColumn != null
                        ) {
                            if (
                                this.tables[tableIdx].controls[controlIdx]
                                    .dataColumn.name == arr[j].name
                            ) {
                                this.nameColumnDetail[this.nameSheets[i].name][
                                    j
                                ].enable = true;
                            }
                        }
                    }
                }
                this.tables[tableIdx].controls[controlIdx].dataColumn = null;
            }
        }

        //phần mapping--- hàm tìm key cho cột
    },
    watch: {
        data() {
            this.errorType = '';
        },
        //lay API lần mapping trước
        selectType() {
            this.getLastData();
        },
        newImport(val) {
            this.stepper = 1;
            this.mapImport = false;
            this.showImport = true;
            this.errorMessage = ' ';
            if (val) {
                this.nameSheets = [];
                this.nameColumnDetail = {};
                this.fileName = '';
                this.showCancelBtn = true;
                this.selectType = '';
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.v-stepper {
    width: 620px !important;
    margin-top: -10px;
    box-shadow: none;
}
.v-stepper ::v-deep .v-list-item__title {
    color: black;
}
.import-header {
    width: 580px;
    margin-top: 5px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}

.ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.stepper-header {
    margin-left: -23px;
    width: 170px;
    height: 50px;
    display: block;
    box-shadow: none;
}
.import-button {
    height: 27px;
    width: 60px;
    border-radius: 2px !important;
}
.auto-complete ::v-deep .v-list {
    width: 385px !important;
}

.auto-complete ::v-deep .v-input__slot {
    background-color: #f7f7f7;
    margin-top: -19px;
}

.auto-complete ::v-deep .v-label {
    font-size: 13px;
    padding-left: 10px;
}
.auto-complete ::v-deep .v-input__slot:after {
    border-color: transparent !important;
}

.auto-complete ::v-deep .v-input__slot:before {
    border-color: transparent !important;
}

.auto-complete ::v-deep .v-label--active {
    display: none;
}

.auto-complete ::v-deep .v-list {
    width: 385px !important;
}

.auto-complete ::v-deep .v-select__slot {
    height: 25px;
}

.auto-complete ::v-deep .v-input__icon {
    padding-bottom: 6px !important;
}

.auto-complete ::v-deep .v-select__slot > input {
    padding-top: 15px;
}

.auto-complete ::v-deep .v-input__icon > button {
    font-size: 14px !important;
}
</style>

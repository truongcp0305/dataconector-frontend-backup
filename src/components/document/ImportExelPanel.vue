<template>
    <v-navigation-drawer
        v-model="showImportPanel"
        v-show="showImportPanel"
        absolute
        :class="{
            navigation: true,
            'd-md-flex': showImportPanel,
            'manage-import-1020': showValidate,
            'manage-import-600': !showValidate,
        }"
        temporary
        right
        style="height: 100vh"
    >
        <v-row class="h-100">
            <v-dialog v-model="dialog" width="500">
                <v-card>
                    <v-card-title class="card-title headline grey lighten-2">
                        <span class="mb-3">{{$t('v2.doc.notify')}}</span>
                    </v-card-title>
                    <v-card-text class="pt-6" style="height: 40px">
                        <v-icon class="color-green mdi mdi-check"></v-icon>{{$t('v2.doc.importFinish')}}
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="cancel()">
                            {{$t('v2.doc.exit')}}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog v-model="dialogError" width="500">
                <v-card>
                    <v-card-title class="card-title headline grey lighten-2">
                        <span class="mb-3">{{$t('v2.doc.notify')}}</span>
                    </v-card-title>
                    <v-card-text class="pt-6" style="height: 40px">
                        <v-icon class="color-red mdi mdi-alert-circle"></v-icon>
                        {{ messageError }}
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="primary"
                            text
                            @click="dialogError = false"
                        >
                            {{$t('v2.doc.exit')}}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-col class="col-md-7">
                <ImportFile
                    :options="options"
                    :tables="nameRows"
                    @stopSetInterval="setInterval = false"
                    :deleteFileName="deleteFileName"
                    @cancel="cancel()"
                    @closeValidate="showValidate = false"
                    @import="importFiles"
                />
            </v-col>
            <v-col v-show="showValidate" class="col-md-5">
                <ValidateImport
                    @deleteFileName="deleteFileName = true"
                    @cancel="cancel()"
                    @showNotification="showNotification()"
                    :setInterval="setInterval"
                    :importFile="importFile"
                    @error="showError"
                    :fileName="fileName"
                />
            </v-col>
        </v-row>
    </v-navigation-drawer>
</template>
<script>
import ValidateImport from './../importExcel/ValidateImport';
import ImportFile from './../importExcel/ImportFile';
import { documentApi } from '@/api/Document.js';

export default {
    components: {
        ImportFile,
        ValidateImport,
    },
    data() {
        return {
            i: 0,
            showImportPanel: false,
            dialogError: false,
            showValidate: false,
            dialog: false,
            importFile: false,
            deleteFileName: false,
            setInterval: false,
            showImport: true,
            fileName: '',
            error: false,
            messageError: '',
            propertyDocument: [],
        };
    },
    props: {
        options: {
            default: {},
        },
        nameRows: {
            default() {
                return [];
            },
        },
        open: {
            default: false,
        },
    },
    mounted() {
        if (
            this.open &&
            !this.nameRows.length &&
            this.options.objType == 'document' &&
            this.options.objId
        ) {
            this.createTablesInfo();
        }
    },
    methods: {
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
        createTablesInfo() {
            const self = this;
            documentApi
                .detailDocument(this.options.objId)
                .then((res) => {
                    if (res.status === 200) {
                        self.propertyDocument = Object.values(res.data.fields);
                        // lưu tên của các property từ API document vào mảng
                        let tableNames = [];
                        let tableTitle = [];
                        for (let i = 0; i < self.propertyDocument.length; i++) {
                            if (this.propertyDocument[i].type === 'table') {
                                tableNames.push(
                                    self.propertyDocument[i].properties.name,
                                );
                                tableTitle.push(
                                    self.propertyDocument[i].properties.title,
                                );
                            }
                        }
                        // khởi tạo mảng lưu các giá trị của table document
                        self.createTable(tableNames, tableTitle);
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        },
        createTable(tableNames, tableTitle) {
            let controls = [];
            for (let i = 0; i < this.propertyDocument.length; i++) {
                if (
                    ['submit', 'approvalHistory', 'reset', 'draft'].includes(
                        this.propertyDocument[i].type,
                    )
                ) {
                    continue;
                }
                controls.push({
                    name: this.propertyDocument[i].properties.name,
                    title: this.propertyDocument[i].properties.title,
                    isKeyControl: false,
                    isNull: this.checkIsRequired(
                        this.propertyDocument[i].properties.isRequired,
                    ),
                    dataColumn: null,
                    dataType: this.getDataType(this.propertyDocument[i].type),
                });
            }
            let tables = [
                {
                    sheetMap: '',
                    name: this.$t('v2.doc.generalInformation'),
                    title: this.$t('v2.doc.generalInformation'),
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
                    controls: this.findControlsForTable(tableNames[i]),
                });
            }
            // this.listRowDocument = tables;
            this.nameRows.length = 0;
            for (const iterator of tables) {
                this.nameRows.push(iterator);
            }
        },
        findControlsForTable(nameTable) {
            let controls = [];
            let property = this.propertyDocument.filter(
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
                        dataType: this.getDataType(list[j].type),
                    });
                }
            }
            return controls;
        },
        importFiles(data) {
            this.importFile = this.i++;
            this.showValidate = true;
            this.setFileName(data.fileName);
            this.setInterval = true;
        },
        showError(data) {
            this.error = true;
            this.dialogError = true;
            this.messageError = data;
        },
        cancel() {
            this.showImportPanel = false;
            this.dialog = false;
        },
        showNotification() {
            this.dialog = true;
            let i = 0;
            if ((i = 0)) {
                setTimeout(() => (this.dialog = false), 5000);
                i++;
            }
        },
        setFileName(data) {
            this.fileName = data;
        },
    },
    watch: {
        'options.objId': {
            handler(newValue) {
                this.createTablesInfo();
            },
        },
        open(val) {
            if (val) {
                this.$store.commit('importExcel/setNewImport', false);
            } else {
                this.$store.commit('importExcel/setNewImport', true);
                this.fileName = '';
            }
            this.showImportPanel = true;
            this.showValidate = false;
        },
    },
};
</script>
<style lang="scss" scoped>
.manage-import-600 {
    width: 600px !important;
}
.manage-import-1020 {
    width: 1020px !important  ;
}
.manage-import ::v-deep .v-card {
    box-shadow: none !important;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.manage-import ::v-deep .v-window {
    display: flex;
    flex-direction: column;
}

.manage-import ::v-deep .v-window__container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}
.card-title {
    height: 50px;
    margin-top: -10px;
}
</style>

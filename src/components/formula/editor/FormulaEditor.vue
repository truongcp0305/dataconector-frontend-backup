<template>
    <div class="h-100 w-100">
        <div
            class="d-flex editor"
            :style="{ height: isSqlQueryPanel == false ? height : '40%' }"
        >
            <SymperMonacoEditor
                ref="edtScript"
                v-model="lazyValue"
                @init="editorInit"
                @blur="$emit('blur', {})"
                @on-change-selection="getInputParams"
                width="100%"
                :height="height"
                :listKeyworks="listKeyworks"
                :options="editorOptions"
            >
            </SymperMonacoEditor>
            <div
                class="debug-input-view"
                v-if="showDebugView && isSqlQueryPanel == false"
            >
                <p>{{ $t('formulasEditor.inputParams') }}</p>
                <VuePerfectScrollbar
                    :style="{
                        height: 'calc(100% - 30px)',
                        'padding-right': '12px'
                    }"
                >
                    <table style="width: 100%">
                        <tr v-for="(input, key) in allInput" :key="key">
                            <td>{{ key }}</td>
                            <td><input v-model="input.value" type="text" /></td>
                        </tr>
                    </table>
                </VuePerfectScrollbar>
            </div>
        </div>
        <div
            v-if="showDebugView"
            class="debug-result-view"
            :style="{ height: debugResultHeight }"
        >
            <div class="result__header" v-if="isSqlQueryPanel == false">
                <div class="result__header--title">
                    <v-icon>mdi-calculator-variant</v-icon>
                    <span>{{ $t('formulasEditor.result') }}</span>
                    <span
                        v-if="debugStatus"
                        :style="
                            debugStatus.status
                                ? { background: 'green' }
                                : { background: 'red' }
                        "
                        >{{ debugStatus.message }}</span
                    >
                </div>
                <div class="result__header--time">
                    <span>{{ $t('formulasEditor.time') }}</span>
                    <span>:{{ timeRequest }}</span>
                </div>
            </div>
            <div class="result__body">
                <div
                    v-if="error"
                    class="result__body--error red--text ps-3 pt-2"
                >
                    {{ error }}
                </div>
                <AgGridVue
                    v-else
                    style="width: 100%; height: 100%"
                    :animateRows="true"
                    :suppressFieldDotNotation="true"
                    @grid-ready="onGridReady"
                    class="ag-theme-balham"
                    :columnDefs="columnDefs"
                    :rowData="rowData"
                >
                </AgGridVue>
            </div>
            <div class="result-footer">
                <div v-if="!error" class="ps-1">
                    <Pagination
                        :total="totalRecord"
                        :totalVisible="7"
                        paginationMode="auto"
                        :containerWidth="containerWidth"
                        :hide-total-section="isSqlQueryPanel"
                        @on-change-page="changePage"
                        @on-change-page-size="changePageSize"
                    ></Pagination>
                </div>
                <v-spacer></v-spacer>
                <div class="me-1" v-if="isSqlQueryPanel">
                    <v-icon small>mdi-timer-outline</v-icon>
                    <span class="green--text ms-1">{{ timeRequest }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import defaultKeywords from './defaultKeywords';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import AgDataTable from './../../../components/common/agDataTable/AgDataTable.vue';
import Pagination from './../../../components/common/Pagination';
import Formulas from '../../../views/document/submit/formulas';
import { AgGridVue } from 'ag-grid-vue';
import FormulasWorker from 'worker-loader!@/worker/document/submit/Formulas.Worker.js';
import SymperMonacoEditor from './SymperMonacoEditor';
import { util } from '@/plugins/util';
import {BUILD_IN_FUNCTION} from '../../../views/document/submit/formulas';

export default {
    data() {
        return {
            allInput: [],
            debugResultHeight: 0,
            inputViewHeight: 0,
            columnDefs: null,
            rowData: null,
            agApi: null,
            error: null,
            instance: Date.now(),
            totalRecord: 0,
            debugStatus: null,
            timeRequest: 0,
            cacheDataInput: {},
            formulasWorker: null,
            keyInstance: Date.now(),
            startTimeDebug: 0,
            cacheData: [],
            pageSize: 50,
            page: 1,
            cacheQuery: '',
            isInputHitoryQuery: false,
            cacheInputHistoryQuery: [],
            containerWidth: 800,
            instKey: util.str.randomString() + '_' + Date.now()
        };
    },
    created() {
        let self = this;
        this.$store.dispatch('document/setListDocuments');
        this.formulasWorker = new FormulasWorker();
        this.$evtBus.$on('script-editor-ide-input-change', (data) => {
            this.allInput = data;
        });
        this.$evtBus.$on('script-editor-ide-choose-history-query', (data) => {
            this.cacheInputHistoryQuery = data.input;
        });
        this.$evtBus.$on('script-editor-ide-run-history-query', (data) => {
            this.allInput = data.input;
            this.executeFormulas(data.sql);
        });

        this.$evtBus.$on('script-editor-ide-change-output', (data) => {
            if (data.instKey == self.instKey && data.value != self.lazyValue) {
                self.lazyValue = data.value;
            }
        });
    },
    beforeMount() {
        this.columnDefs = [];
        this.rowData = [];
    },
    mounted() {
        let self = this;
        if (this.disabled) {
            this.$refs.edtScript.setReadOnly();
        }
        this.formulasWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'afterRunFormulasSuccess':
                    let res = data.dataAfter.res;
                    self.handleAfterRunFormula(res);
                    break;
                case 'afterRunFormulasFail':
                    let res1 = {};
                    res1.data = {
                        data: [{ user: 'sqllite' }],
                        sql: '',
                        lastErrorMessage: data.dataAfter.res
                    };
                    res1.server = true;
                    self.handleAfterRunFormula(res1);
                    break;
                default:
                    break;
            }
        });
        if (this.showDebugView) {
            this.turnOnDebugView();
        }
    },
    computed: {
        editorOptions() {
            return {
                lineNumbers: this.simpleMode ? 'off' : 'on',
                minimap: {
                    enabled: this.simpleMode ? false : true
                }
            };
        },
        lazyValue: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit('input', value);
                this.$emit('change', value);
                this.$evtBus.$emit('small-sql-query-ide-sync-value', {
                    value: value,
                    instKey: this.instKey
                });
            }
        },
        listAllDocs() {
            return this.$store.state.document.listAllDocument;
        },
        autocompleteWords() {
            let rsl = defaultKeywords;
            let allDocs = this.$store.state.document.listAllDocument;

            let docs = Object.values(allDocs).reduce((arr, el) => {
                arr.push({
                    caption: el.name,
                    value: el.name,
                    meta: 'document',
                    docHTML: `<b>${el.id} : </b>${el.title}`
                });
                return arr;
            }, []);

            let fields = [];
            for (let docName in allDocs) {
                let docFields = [];
                if (allDocs[docName].allFields) {
                    docFields = Object.values(
                        allDocs[docName].allFields
                    ).reduce((arr, field) => {
                        arr.push({
                            caption: docName + '.' + field.properties.name,
                            value: docName + '.' + field.properties.name,
                            meta: 'control',
                            docHTML: field.properties.title
                        });
                        return arr;
                    }, []);
                    fields = fields.concat(docFields);
                }
            }
            return rsl.concat(docs).concat(fields).concat(this.listKeyworks);
        }
    },
    components: {
        VuePerfectScrollbar,
        'data-table': AgDataTable,
        Pagination,
        AgGridVue,
        SymperMonacoEditor
    },
    props: {
        value: {
            type: String,
            default: ''
        },
        listKeyworks: {
            type: Object,
            default() {
                return {
                    /**
                     * Item trong mảng của từng key hoặc là chuỗi
                     * hoặc là object có các thuộc tính được mô tả trong https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.completionitem.html
                     */
                    columns: [],
                    table: [],
                    docs: [],
                    controls: [],
                    common: []
                };
            }
        },
        height: {
            type: String,
            default: '500px'
        },
        simpleMode: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        isSqlQueryPanel: {
            type: Boolean,
            default: false
        },
        showDebugView: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        height(vl) {
            this.debugResultHeight = 'calc(100% - ' + vl + ' - 30px)';
        }
    },
    methods: {
        getFormulaEditorInstKey() {
            return this.instKey;
        },
        setContainerWidth(index) {
            this.containerWidth = index;
        },
        turnOnDebugView() {
            this.showDebugView = true;
            this.formulasWorker.postMessage({
                action: 'createSQLiteDB',
                data: { keyInstance: this.keyInstance }
            });
            this.formulasWorker.postMessage({
                action: 'updateWorkerStore',
                data: {
                    controlIns: { name: 'temp', value: '' },
                    value: '',
                    keyInstance: this.keyInstance,
                    type: 'submit'
                }
            });
            this.debugResultHeight = 'calc(100% - 40% - 20px)';
            this.inputViewHeight = this.height;
            this.columnDefs = [];
            this.rowData = [];
            this.totalRecord = 0;
            this.debugStatus = null;
        },
        toggleDebugView() {
            this.showDebugView = !this.showDebugView;
            if (this.showDebugView) {
                this.formulasWorker.postMessage({
                    action: 'createSQLiteDB',
                    data: { keyInstance: this.keyInstance }
                });
                this.formulasWorker.postMessage({
                    action: 'updateWorkerStore',
                    data: {
                        controlIns: { name: 'temp', value: '' },
                        value: '',
                        keyInstance: this.keyInstance,
                        type: 'submit'
                    }
                });
            } else {
                this.formulasWorker.postMessage({
                    action: 'closeDB',
                    data: { keyInstance: this.keyInstance }
                });
            }
            this.debugResultHeight = 'calc(100% - ' + this.height + ' - 30px)';
            this.inputViewHeight = this.height;
            this.columnDefs = [];
            this.rowData = [];
            this.totalRecord = 0;
            this.debugStatus = null;
        },
        editorInit(edt) {},
        onFocus() {
            this.$refs.edtScript.focus();
        },
        getInputParams() {
            if (!this.showDebugView) {
                return;
            }
            this.allInput = {};
            let selectionText = this.$refs.edtScript.getSelectedText();
            if (!selectionText) {
                selectionText = this.$refs.edtScript.getValue();
            }
            if (selectionText.length > 0) {
                let dataInput = selectionText.match(/{([a-zA-Z0-9].*?)}/g);
                let self = this;
                if (dataInput) {
                    this.allInput = dataInput.reduce(function (obj, cur, i) {
                        cur = cur.replace('{', '');
                        cur = cur.replace('}', '');
                        cur = cur.trim();
                        if(!BUILD_IN_FUNCTION.includes(cur)){
                            let value = self.cacheDataInput[cur]
                                ? self.cacheDataInput[cur]
                                : '';
                            if (
                                Object.keys(self.cacheInputHistoryQuery).length > 0
                            ) {
                                Object.keys(self.cacheInputHistoryQuery).map(
                                    (key) => {
                                        if (cur == key) {
                                            value =
                                                self.cacheInputHistoryQuery[key]
                                                    .value;
                                        }
                                    }
                                );
                            }
                            obj[cur] = { value: value };
                        }
                        return obj;
                    }, {});
                }
            }
            if (this.isSqlQueryPanel) {
                this.$evtBus.$emit('sql-query-input', this.allInput);
            }
        },
        saveHistoryquery(selectionText) {
            let k = [];
            if (localStorage.getItem('history')) {
                try {
                    k = JSON.parse(localStorage.getItem('history'));
                } catch (e) {
                    localStorage.removeItem('history');
                }
            }
            let x = {
                id: util.str.randomString(6),
                sql: selectionText,
                input: this.allInput
            };
            k.unshift(x);
            localStorage.setItem('history', JSON.stringify(k));
            this.$evtBus.$emit('script-editor-ide-add-history');
        },
        executeFormulas(isRunHistoryQuery = '') {
            this.timeRequest = 0;
            this.error = null;
            let selectionText = this.$refs.edtScript.getSelectedText();
            if (isRunHistoryQuery == '') {
                if (!selectionText) {
                    selectionText = this.$refs.edtScript.getValue();
                }
            } else {
                selectionText = isRunHistoryQuery;
            }
            if (!selectionText) {
                return;
            }
            let formulas = new Formulas(this.instance, selectionText, '');
            if (formulas.refFormulas[0]) {
                this.cacheQuery = formulas.refFormulas[0];
            }
            if (formulas.orgChartFormulas[0]) {
                this.cacheQuery = formulas.orgChartFormulas[0];
            }
            let dataInput = {};
            for (let input in this.allInput) {
                dataInput[input] = this.allInput[input].value;
                let regStr = '[a-z]+?(?=\\s*{' + input + '})';
                let reg = new RegExp(regStr, 'gm');
                let beforeLetter = selectionText.match(reg);
                if (
                    beforeLetter &&
                    beforeLetter.length > 0 &&
                    ['in', 'all', 'union', 'from'].includes(beforeLetter[0])
                ) {
                    let dataInputFilter = dataInput[input].split(',');
                    dataInputFilter = dataInputFilter.reduce((arr, item) => {
                        let data = item.replace(/'/g, '');
                        data = data.trim();
                        arr.push(data);
                        return arr;
                    }, []);
                    dataInput[input] = dataInputFilter;
                }
                this.cacheDataInput[input] = this.allInput[input].value;
            }
            this.startTimeDebug = Date.now();
            this.formulasWorker.postMessage({
                action: 'runFormula',
                data: {
                    dataInput: dataInput,
                    fromDebugger: true,
                    formulaInstance: formulas,
                    controlName: 'temporary',
                    keyInstance: this.keyInstance
                }
            });
        },
        handleAfterRunFormula(rs) {
            this.$emit('run-formula-finished', rs);
            this.debugStatus = {
                status: true,
                message: this.$t('formulasEditor.success')
            };
            this.rowData = [];
            this.columnDefs = [];
            // Kiểm tra xem có phải trường hợp cần lưu vào localStorage.history không
            if (
                this.isSqlQueryPanel &&
                (rs.data.lastErrorMessage == '' || rs.data.data)
            ) {
                this.saveHistoryquery(this.cacheQuery);
            }
            if (rs.server) {
                this.cacheData = rs.data.data;
                let err = rs.data.lastErrorMessage;
                if (err) {
                    this.debugStatus = {
                        status: false,
                        message: this.$t('formulasEditor.error')
                    };
                    this.error = err;
                }
                this.handleDataToTable(this.cacheData);
            } else {
                let columns = rs.data[0].columns;
                let values = rs.data[0].values;
                this.totalRecord = values.length;
                for (let index = 0; index < columns.length; index++) {
                    let col = columns[index];
                    this.columnDefs.push({
                        headerName: col,
                        field: col,
                        resizable: true
                    });
                }
                for (let k = 0; k < values.length; k++) {
                    let rowVal = values[k];
                    let row = {};
                    for (let i = 0; i < rowVal.length; i++) {
                        let cellVal = rowVal[i];
                        row[columns[i]] = cellVal;
                    }
                    this.rowData.push(row);
                }
                if (this.agApi) {
                    this.agApi.sizeColumnsToFit();
                }
            }

            let end = Date.now();
            this.timeRequest = end - this.startTimeDebug;
            if (this.timeRequest >= 1000) {
                this.timeRequest =
                    Math.round(((end - this.startTimeDebug) / 1000) * 100) /
                        100 +
                    's';
            } else {
                this.timeRequest = this.timeRequest + 'ms';
            }
        },
        handleDataToTable(data) {
            let firstRow = data[0];
            this.columnDefs = [];
            for (let column in firstRow) {
                this.columnDefs.push({
                    headerName: column,
                    field: column,
                    resizable: true
                });
            }
            let k = [];
            if (this.page * this.pageSize < data.length) {
                for (
                    let i = (this.page - 1) * this.pageSize;
                    i < this.page * this.pageSize;
                    i++
                ) {
                    k.push(data[i]);
                }
            } else {
                for (
                    let i = (this.page - 1) * this.pageSize;
                    i < data.length;
                    i++
                ) {
                    k.push(data[i]);
                }
            }
            this.rowData = k;
            this.totalRecord = data.length;
            this.agApi.sizeColumnsToFit();
        },
        onGridReady(params) {
            this.agApi = params.api;
        },
        changePage(vl) {
            this.page = vl.page;
            this.handleDataToTable(this.cacheData);
        },
        changePageSize(vl) {
            this.pageSize = vl.pageSize;
            this.handleDataToTable(this.cacheData);
        },
        formatSql() {
            this.$refs.edtScript.formatQuery();
        }
    }
};
</script>
<style scoped>
.debug-input-view {
    border-left: var(--symper-border);
    font-size: var(--symper-font-size-default);
    width: 400px;
    padding: 8px 0 8px 8px;
}
.debug-input-view p {
    margin-bottom: 8px;
}
.debug-input-view table tr {
    height: 30px;
}
.debug-input-view table tr td:first-child {
    width: 30%;
}
.debug-input-view table tr input {
    border: var(--symper-border);
    width: 100%;
    height: 24px;
    border-radius: 4px;
    padding: 0 6px;
}
.debug-input-view table tr input:focus {
    outline: none;
}
.debug-result-view {
    font-size: var(--symper-font-size-default);
    border-top: var(--symper-border);
}

.result__header {
    display: flex;
    padding: 8px 0;
}
.result__header .result__header--time {
    margin-left: auto;
}
.result__header .result__header--time span:first-child {
    font-weight: 500;
}
.result__header--title .v-icon {
    margin-top: -4px;
    font-size: 18px;
}
.result__header--title span:nth-child(2) {
    margin: 0 8px;
}
.result__header--title span:last-child {
    color: white;
    display: inline-block;
    padding: 1px 8px;
    border-radius: 10px;
    font-size: 11px;
}
.result__body {
    height: calc(100% - 50px);
}
.result-footer {
    height: 30px;
    margin-top: 3px;
    display: flex;
}
</style>

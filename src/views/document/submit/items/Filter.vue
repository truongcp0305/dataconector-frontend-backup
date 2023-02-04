<template>
    <div class="content-filter">
        <div class="search-filter">
            <v-text-field
                prepend-inner-icon="mdi-magnify"
                outlined
                dense
                height="30"
                class="search"
                autofocus
                v-model="search"
                hide-details
            ></v-text-field>
        </div>
        <div class="d-flex justify-space-between my-2">
            <span>
                <span class="mr-1">{{ $t('common.search_on_field') }}</span>
                {{ fieldSearch }}
            </span>
            <span>
                <v-tooltip top :nudge-left="68" :nudge-bottom="5">
                    <template v-slot:activator="{ on }">
                        <v-btn
                            depressed
                            v-on="on"
                            v-if="!showSelected"
                            x-small
                            @click="showOnlySelected"
                        >
                            <i
                                style="font-size: 16px"
                                class="mdi mdi-playlist-check"
                            ></i>
                        </v-btn>
                        <v-btn
                            depressed
                            v-on="on"
                            v-else
                            style="background: lightgrey"
                            x-small
                            @click="disableSelected"
                        >
                            <i
                                style="font-size: 16px"
                                class="mdi mdi-playlist-check"
                            ></i>
                        </v-btn>
                    </template>
                    {{ $t('common.filter_object') }}
                </v-tooltip>
            </span>
        </div>
        <div class="content-table">
            <!-- :style="{'max-height':tableMaxHeight+'px','overflow':'auto'}" -->
            <ag-grid-vue
                style="width: 100%; height: 100%"
                class="ag-theme-alpine"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :gridOptions="gridOptions"
                :getRowHeight="getRowHeight"
                @row-selected="rowSelected"
                :rowData="rowData"
            >
            </ag-grid-vue>
        </div>
        <div class="footer-filter">
            <span class="total-record"
                >{{ $t('table.totalRecord') }}: {{ totalRecord }}</span
            >
            <v-btn
                @click="saveInputFilter"
                small
                color="primary"
                right
                class="save-input-filter"
                >{{ $t('common.save') }}</v-btn
            >
        </div>
    </div>
</template>
<script>
import _debounce from 'lodash/debounce';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { AgGridVue } from 'ag-grid-vue';
export default {
    components: {
        'ag-grid-vue': AgGridVue,
    },
    props: {
        keyInstance: {
            type: Number,
            default: 0,
        },
        tableMaxHeight: {
            type: Number,
            default: 450,
        },
        dataUploadFile: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    watch: {
        dataUploadFile: {
            deep: true,
            immediate: true,
            handler() {
                if (
                    this.dataUploadFile.data &&
                    this.dataUploadFile.data.length > 0
                ) {
                    this.setControlName(this.dataUploadFile.controlName);
                    this.setData(this.dataUploadFile.data);
                } else {
                    this.setData([]);
                }
            },
        },
        search() {
            this.debounceSearch();
        },
    },
    data() {
        return {
            showSelected: false,
            isForGroupTable: false, // dùng cho groupTable
            columns: null,
            searchBefore: false,
            infoGroupTable: {
                rowsGrouped: [],
                fieldGrouped: '',
            },
            listRowSelected: [],
            data: null,
            formulas: null,
            listOldValue: [], // dữ liệu cũ input filter lưu dưới dạng mảng các giá trị
            listOldValueFull: [], // dữ liệu cũ input filter đầy đủ thông tin chi tiết kèm theo
            listUnselected: [],
            search: '',
            controlName: null,
            titleControl: null,
            fieldSearch: '',
            totalRecord: 0,
            columnDefs: null,
            defaultColDef: null,
            rowData: null,
            gridOptions: null,
            rowSelection: {},
        };
    },
    beforeMount() {
        this.columns = [];
        this.data = [];
        this.gridOptions = {
            applyColumnDefOrder: true, // trường hợp đã tồn tại column trùng thì vẫn sắp xếp lại
            headerHeight: 25,
            enableRangeSelection: true,
            rowBuffer: 0,
            rowSelection: 'multiple',
            rowMultiSelectWithClick: true,
        };

        this.defaultColDef = {
            minWidth: 50,
            sortable: true,
            resizable: true,
            filter: true,
            editable: true,
            wrapText: true,
        };
    },
    methods: {
        showOnlySelected() {
            let data = [];
            let rowSelected = this.rowSelection[this.controlName];
            Object.keys(rowSelected).map((row) => {
                data.push(rowSelected[row]);
            });
            this.listRowSelected = data;
            this.gridOptions.api.setRowData(data);
            this.gridOptions.api.forEachNode((node) => {
                node.setSelected(true);
            });
            this.showSelected = true;
        },
        disableSelected() {
            const self = this;
            this.gridOptions.api.setRowData(this.rowData);
            this.gridOptions.api.forEachNode((node) => {
                if (self.listRowSelected.includes(node.data)) {
                    node.setSelected(true);
                }
            });
            this.showSelected = false;
        },
        autoSizeAll() {
            var allColumnIds = [];
            this.gridOptions.columnApi
                .getAllColumns()
                .forEach(function (column) {
                    allColumnIds.push(column.colId);
                });
            this.gridOptions.columnApi.autoSizeColumns(allColumnIds, false);
        },
        showLoadingOverlay() {
            this.gridOptions.api.showLoadingOverlay();
        },
        hideOverlay() {
            if (this.gridOptions) {
                this.gridOptions.api.hideOverlay();
            }
        },
        rowSelected(params) {
            let newList = [];
            let data = params.data;
            let rowKey = this.getRowkey(data);
            if (this.rowSelection[this.controlName][rowKey]) {
                if (!params.node.selected) {
                    delete this.rowSelection[this.controlName][rowKey];
                }
            } else {
                this.rowSelection[this.controlName][rowKey] = data;
            }

            // this.listRowSelected = this.gridOptions.api.getSelectedRows()
        },
        // so sánh dữ liệu row group trong table và input filter: đã tồn tại thì tích, không tồn tại thì bỏ tích
        checkSelection() {
            let rowsGrouped = this.infoGroupTable.rowsGrouped;
            let fieldGrouped = this.infoGroupTable.fieldGrouped;
            this.gridOptions.api.forEachNode((node) => {
                if (rowsGrouped.includes(node.data[fieldGrouped])) {
                    node.setSelected(true);
                } else {
                    node.setSelected(false);
                }
            });
        },
        //bỏ check checkbox
        uncheckSelection(list, control) {
            const self = this;
            this.gridOptions.api.forEachNode((node) => {
                if (!list.includes("'" + node.data[control] + "'")) {
                    let rowKey = this.getRowkey(node.data);
                    delete self.rowSelection[control][rowKey];
                    node.setSelected(false);
                }
            });
        },
        getRowHeight: function (params) {
            return 25;
        },
        setData(data) {
            this.hideOverlay();
            this.showSelected = false;
            let dataTable = [];
            this.columnDefs = [];
            if (this.columnDefs.length == 0) {
                this.columnDefs.push({
                    field: 'index_increment',
                    headerName: '',
                    minWidth: 40,
                    width: 40,
                    maxWidth: 40,
                    headerCheckboxSelection: true,
                    checkboxSelection: true,
                    pinned: 'left',
                    lockPosition: true,
                    lockPinned: true,
                });
            }
            if (data && data.length > 0) {
                for (let index = 0; index < data.length; index++) {
                    let row = data[index];
                    if (index == 0) {
                        for (let c in row) {
                            let item = {
                                field: c,
                                headerName: this.customHeader(c),
                                type: 'text',
                                editable: false,
                            };
                            this.columnDefs.push(item);
                        }
                    }
                    let item1 = {};
                    for (let c in row) {
                        item1[c] = row[c];
                    }
                    dataTable.push(item1);
                }
            }
            this.rowData = null;
            this.rowData = dataTable;
            this.totalRecord = dataTable.length;
            setTimeout(
                (self) => {
                    if (self.isForGroupTable) {
                        self.checkSelection();
                        self.autoSizeAll();
                    } else {
                        self.setSelection();
                    }
                },
                500,
                this,
            );
        },
        getRowkey(rowData) {
            let key = [];
            for (let col in rowData) {
                key.push(rowData[col]);
            }
            return key.join('_____');
        },
        customHeader(nameHeader) {
            if (nameHeader == this.controlName) {
                nameHeader = this.titleControl;
            }
            return nameHeader;
        },
        setSelection() {
            let self = this;
            this.gridOptions.api.forEachNode((node) => {
                if (self.listOldValue.length > 0 && !self.search) {
                    if (
                        self.listOldValue.includes(node.data[self.controlName])
                    ) {
                        node.setSelected(true);
                    }
                }
                if (self.listOldValueFull.length > 0 && !self.search) {
                    self.listOldValueFull.map((list) => {
                        if (
                            list[self.controlName] ==
                            node.data[self.controlName]
                        ) {
                            let columnCurrent = Object.keys(node.data);
                            let check = true;
                            columnCurrent.map((colCurrent) => {
                                if (
                                    list[colCurrent] &&
                                    node.data[colCurrent] != list[colCurrent]
                                ) {
                                    check = false;
                                }
                            });
                            if (check) {
                                node.setSelected(true);
                            }
                        }
                    });
                }
                if (self.listUnselected.length > 0) {
                    self.uncheckSelection(
                        self.listUnselected,
                        self.controlName,
                    );
                }
                let nodeData = node.data;
                let rowKey = self.getRowkey(nodeData);
                if (self.rowSelection[self.controlName][rowKey]) {
                    node.setSelected(true);
                }
            });
            this.listOldValue = [];
            this.listUnselected = [];
            this.listOldValueFull = [];
        },
        saveInputFilter() {
            let dataResponse = [];
            if (Object.keys(this.rowSelection[this.controlName]).length > 0) {
                for (let key in this.rowSelection[this.controlName]) {
                    let rowData = this.rowSelection[this.controlName][key];
                    dataResponse.push("'" + rowData[this.controlName] + "'");
                }
            }
            let listSelected = this.getListSelectedRow();
            this.$emit('save-input-filter', {
                value: dataResponse.length > 0 ? dataResponse.join(',') : '',
                controlName: this.controlName,
                listSelected: listSelected,
                column: this.columnDefs,
            });
        },
        getListSelectedRow() {
            return this.gridOptions.api.getSelectedRows();
        },
        setFormulas(formulas) {
            this.showLoadingOverlay();
            this.rowData = null;
            this.columnDefs = [];
            this.formulas = formulas;
            this.getSearchField(formulas.instance.formulas);
        },
        setControlTitle(title) {
            this.titleControl = title;
        },
        setControlName(controlName) {
            this.controlName = controlName;
            if (!this.rowSelection.hasOwnProperty(this.controlName)) {
                this.rowSelection[this.controlName] = {};
            }
        },
        getSearchField(formulas) {
            let titleFieldSearch = [];
            let mapColumnToAlias = {};
            let allColumnQuery = formulas.match(
                /([0-9a-zA-Z_]+)\s+as\s+("(.*?)"|([0-9a-zA-Z_]+))/gm,
            );
            if (allColumnQuery) {
                for (let index = 0; index < allColumnQuery.length; index++) {
                    const fieldSelect = allColumnQuery[index];
                    fieldSelect = fieldSelect.split(' as ');
                    if (fieldSelect.length > 1) {
                        mapColumnToAlias[fieldSelect[0]] =
                            fieldSelect[1].replace(/\"/gm, '');
                    } else {
                        mapColumnToAlias[fieldSelect[0]] =
                            fieldSelect[0].replace(/\"/gm, '');
                    }
                }
            }
            let allFieldCondition = formulas.match(
                /[a-zA-Z0-9_][^\s]*(?= ilike)/gm,
            );
            if (allFieldCondition) {
                for (let index = 0; index < allFieldCondition.length; index++) {
                    const controlTitle = mapColumnToAlias.hasOwnProperty(
                        allFieldCondition[index],
                    )
                        ? mapColumnToAlias[allFieldCondition[index]]
                        : '';
                    titleFieldSearch.push(controlTitle);
                }
            }

            if (titleFieldSearch.length > 0) {
                this.fieldSearch = titleFieldSearch.join(', ');
            }
        },
        debounceSearch: _debounce(
            function (e) {
                let listOldValue = this.getListSelectedRow();
                this.$emit('search-data', {
                    controlName: this.controlName,
                    search: this.search,
                    listOldValue: listOldValue,
                });
            },
            300,
            this,
        ),
    },
};
</script>

<style scoped>
.search >>> .v-input__slot {
    min-height: unset !important;
    margin-top: 8px;
    padding-left: 8px !important;
}
.search >>> input {
    font-size: 13px;
}
.search >>> .v-input__prepend-inner {
    margin-top: 3px !important;
}
.search >>> .mdi {
    font-size: 20px !important;
}
.search >>> .v-label {
    font-size: 13px;
    top: 6px !important;
}
.search >>> fieldset {
    border-color: #c1c1c1 !important;
}
.save-input-filter {
    float: right;
    margin-right: 8px;
    margin-top: 6px;
}
.content-table {
    height: calc(100% - 90px);
    overflow: hidden;
    font-size: 12px;
}
.content-filter {
    height: 93%;
}
.footer-filter .total-record {
    display: inline-block;
    margin-top: 16px;
}
.content-filter >>> .ag-theme-alpine .ag-cell {
    line-height: 20px !important;
    font-size: 11px !important;
}
.ag-theme-alpine >>> span {
    font-size: 11px !important;
}
.content-filter >>> .ag-horizontal-left-spacer {
    display: none;
}
</style>

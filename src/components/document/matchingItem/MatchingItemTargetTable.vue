<template>
    <div class="h-100">
        <div class="w-100 d-flex justify-end">
            <div class="d-flex">
                <v-tooltip
                    :position-y="100"
                    :position-x="100"
                    bottom
                    v-model="showSearchTooltip"
                    color="#00000000"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <search-box
                            v-bind="attrs"
                            v-on="on"
                            @enter="handleSearch"
                            :value="searchKey"
                            style="width: 200px"
                        />
                    </template>
                    <span
                        style="
                            max-width: 200px;
                            width: 200px;
                            line-height: 18px;
                            color: black;
                            display: inline-block;
                            padding: 6px;
                            background-color: white;
                            opacity: 1 !important;
                            position: relative;
                            top: -12px;
                        "
                        class="fs-12 elevation-6"
                    >
                        <span v-if="tooltipSearch">
                            <span class="fs-12 font-weight-medium"
                                >{{$t('v2.doc.searchOnFields')}}: <br /></span
                            >{{ tooltipSearch }}
                        </span>

                        <span class="fs-12 font-weight-medium" v-else>
                            {{$t('v2.doc.searchOnAllField')}}
                        </span>
                    </span>
                </v-tooltip>
                <v-btn small depressed class="ml-2" @click="reDistribute"
                    >{{$t('v2.doc.reCoordinate')}}</v-btn
                >
                <v-btn
                    :disabled="validatingData"
                    :loading="validatingData"
                    small
                    depressed
                    class="ml-2"
                    v-if="formulaValidate"
                    @click="handleValidateDataClick"
                    >{{$t('v2.doc.validate')}}</v-btn
                >
                <v-btn small depressed class="ml-2" @click="previewResultData"
                    >{{$t('v2.doc.preview')}}</v-btn
                >
            </div>
        </div>
        <div class="w-100 mt-2" style="height: calc(100% - 70px)">
            <div ref="table" class="ag-theme-balham h-100"></div>
            <div
                class="highlight-add-row-root"
                :style="{
                    scale: showAddRootRow ? 1 : 0
                }"
            >
                <span>+</span>
            </div>
        </div>

        <v-dialog
            class="bg-white"
            v-model="showDialog"
            content-class="bg-white"
            width="900px"
            style="height: 600px !important"
        >
            <div class="h-100 pa-4">
                <div class="d-flex justify-space-between">
                    <span
                        class="orange--text text--darken-3 fs-15 font-weight-medium"
                        style="line-height: 28px"
                    >
                        {{
                            showPreviewTable
                                ? $t('v2.doc.resultTable')
                                : $t('v2.doc.validateData')
                        }}
                    </span>
                    <v-btn small icon @click="closeDialog"
                        ><i class="mdi mdi-close fs-18"></i
                    ></v-btn>
                </div>
                <div
                    v-show="showPreviewTable"
                    style="height: 540px"
                    class="mt-2 ag-theme-balham w-100"
                    ref="previewTable"
                ></div>
                <div
                    v-show="showValidateTable"
                    style="height: 500px"
                    class="mt-2 ag-theme-balham w-100"
                    ref="validateTable"
                ></div>
                <div
                    v-if="showValidateTable"
                    class="w-100 d-flex justify-end mt-4"
                >
                    <v-btn
                        :disabled="!needDeleteInvalidRowCount"
                        small
                        depressed
                        class="ml-2"
                        @click="deleteInvalidRows"
                        >{{$t('v2.doc.delete')}}
                        {{
                            needDeleteInvalidRowCount
                                ? needDeleteInvalidRowCount
                                : ''
                        }}
                        {{$t('v2.doc.row')}}</v-btn
                    >
                    <v-btn
                        small
                        color="primary"
                        depressed
                        class="ml-2"
                        :disabled="updatingInvalidRows"
                        :loading="updatingInvalidRows"
                        @click="continueDistribute"
                        >{{$t('v2.doc.continue')}}</v-btn
                    >
                </div>
            </div>
        </v-dialog>
    </div>
</template>

<script>
import SearchBox from '@/components/common/SearchBox.vue';
var Grid, ClientSideRowModelModule, RowGroupingModule, ClipboardModule;
import { loadRemoteModule } from '@/plugins/utilModules/remoteModuleLoad.js';
import _cloneDeep from 'lodash/cloneDeep';
import { str } from '@/plugins/utilModules/str';
import { formulasApi } from '@/api/Formulas';

// import { Grid } from 'ag-grid-community';
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
// import { ClipboardModule } from '@ag-grid-enterprise/clipboard';

const DOC_TABLE_ID_COLUMN = 's_table_id_sql_lite';
const ROW_ID = '__symper_id__';
const VALIDATE_ERROR = '__symper_validate_error__';

const SOURCE_LEVEL_GREATER_THAN_OVERNODE = 1;
const SOURCE_LEVEL_EQUAL_OVERNODE = 2;
const SOURCE_LEVEL_SMALLER_THAN_OVERNODE = 3;
const HAVE_NODE_ROW_GROUP = 4;

export default {
    computed: {
        tooltipSearch() {
            return this.config.colSearch
                .reduce((arr, el) => {
                    arr.push(el.name);
                    return arr;
                }, [])
                .join(' , ');
        }
    },
    data() {
        return {
            searchKey: '',
            showAddRootRow: false,
            showPreviewTable: false,
            showSearchTooltip: false,
            validatingData: false,
            showDialog: false,
            showValidateTable: false,
            needDeleteInvalidRowCount: 0,
            updatingInvalidRows: false
        };
    },
    async mounted() {
        this.validData = true;
        let remoteAggridModules = await loadRemoteModule('aggrid/modules');
        Grid = remoteAggridModules.Grid;
        ClientSideRowModelModule = remoteAggridModules.ClientSideRowModelModule;
        RowGroupingModule = remoteAggridModules.RowGroupingModule;
        ClipboardModule = remoteAggridModules.ClipboardModule;

        this.potentialDropNodes = [];
        this.initTable();
        this.preCalcSourceTbInfo();
        this.setMapTargetColToDocControl();
    },
    methods: {
        deleteInvalidRows() {
            let selectedRows = this.handleDeleteRows(this.validateGridOption);
            this.validateGridOption.api.applyTransaction({
                remove: selectedRows
            });
        },
        async continueDistribute() {
            if (this.formulaUpdate && !this.updatingInvalidRows) {
                try {
                    this.updatingInvalidRows = true;
                    let rowData = this.getResultDataForDoc();
                    let res = await formulasApi.getMultiData({
                        formula: this.formulaUpdate,
                        dataInput: JSON.stringify(rowData)
                    });
                } catch (error) {
                    this.$snotifyError(error, this.$t('v2.doc.errorWhenUpdateData'));
                } finally {
                    this.updatingInvalidRows = false;
                }
            }

            let updateRows = [];
            this.gridOptions.api.forEachNode((node) => {
                if (!node.group && node.data && node.data[VALIDATE_ERROR]) {
                    node.data[VALIDATE_ERROR] = null;
                    updateRows.push(node);
                }
            });

            this.gridOptions.api.redrawRows({
                rowNodes: updateRows
            });

            this.closeDialog();
        },
        async showValidateTableDialog(rowData) {
            this.showDialog = true;
            this.showValidateTable = true;
            this.needDeleteInvalidRowCount = 0;
            await this.initValidateTable();
            this.validateGridOption.api.setRowData(rowData);
            this.validateGridOption.api.selectAll();
        },
        closeDialog() {
            this.showDialog = false;
            this.showValidateTable = false;
            this.showPreviewTable = false;
        },
        handleValidateDataClick() {
            this.validateData();
        },
        async validateData() {
            if (!this.validatingData) {
                this.validatingData = true;
                try {
                    let rowData = this.getResultDataForDoc();
                    let res = await formulasApi.getMultiData({
                        formula: this.formulaValidate,
                        dataInput: JSON.stringify(rowData)
                    });
                    let rowIndex = 0;
                    let needUpdateRows = [];
                    this.gridOptions.api.forEachNode((node) => {
                        if (!node.group) {
                            if (res.data[rowIndex]) {
                                node.data[VALIDATE_ERROR] = res.data[rowIndex];
                                needUpdateRows.push(node.data);
                            }
                            rowIndex += 1;
                        }
                    });

                    if (needUpdateRows.length > 0) {
                        this.gridOptions.api.applyTransaction({
                            update: needUpdateRows
                        });
                        this.showValidateTableDialog(needUpdateRows);
                    } else {
                        this.$snotifySuccess(
                            this.$t('v2.doc.validateDataSuccess'),
                            this.$t('v2.doc.noErrorInData')
                        );
                    }
                } catch (error) {
                    this.$snotifyError(error, this.$t('v2.doc.errorWhenValidateData'));
                } finally {
                    this.validatingData = false;
                }
            }
        },
        handleSearchBlured() {
            this.showSearchTooltip = false;
        },
        handleSearchFocused() {
            this.showSearchTooltip = true;
        },
        setMapTargetColToDocControl() {
            this.mapTargetColToDocControl = {};
            for (const colName in this.mapTargetToSourceColumns) {
                let col = this.mapTargetToSourceColumns[colName];
                if (col.controlMapping) {
                    this.mapTargetColToDocControl[colName] = col;
                }
            }
        },
        reDistribute() {
            this.$emit('reset-all-table');
        },
        initValidateTable() {
            let self = this;
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (!self.validateGridOption) {
                        let columnDefs = [
                            {
                                checkboxSelection: true,
                                headerCheckboxSelection: true,
                                maxWidth: 40,
                                pinned: 'left'
                            }
                        ];
                        columnDefs = columnDefs.concat(
                            self.getPreviewColumns()
                        );
                        columnDefs.push({
                            pinned: 'right',
                            width: 40,
                            cellRenderer: (params) => {
                                return (
                                    '<i class="mdi mdi-information-outline fs-16 red--text" title="' +
                                    params.node.data[VALIDATE_ERROR] +
                                    '"></i>'
                                );
                            }
                        });
                        self.validateGridOption = {
                            columnDefs: columnDefs,
                            rowSelection: 'multiple',
                            onRowSelected(event) {
                                if (event.node.isSelected()) {
                                    self.needDeleteInvalidRowCount += 1;
                                } else {
                                    self.needDeleteInvalidRowCount -= 1;
                                }
                            }
                        };
                        new Grid(
                            self.$refs.validateTable,
                            self.validateGridOption
                        );
                    }
                    resolve();
                }, 300);
            });
        },
        getPreviewColumns() {
            let columnDefs = [];
            for (const colName in this.mapTargetColToDocControl) {
                columnDefs.push({
                    field: colName,
                    headerName:
                        this.mapTargetColToDocControl[colName]
                            .controlMappingTitle
                });
            }
            return columnDefs;
        },
        previewResultData() {
            this.showDialog = true;
            this.showPreviewTable = true;
            let self = this;
            setTimeout(() => {
                if (!self.previewGridOption) {
                    let columnDefs = self.getPreviewColumns();
                    self.previewGridOption = {
                        columnDefs: columnDefs
                    };
                    new Grid(self.$refs.previewTable, self.previewGridOption);
                }
                self.previewGridOption.api.setRowData(self.getFlatData());
            }, 200);
        },
        preCalcSourceTbInfo() {
            this.mapSourceTableInfo = {};
            for (const sourceId in this.sourceTables) {
                this.mapSourceTableInfo[sourceId] = {
                    iden:
                        sourceId +
                        '__' +
                        this.sourceTables[sourceId].identityColumn
                };
            }
        },
        handleSearch(value) {
            this.gridOptions.api.setQuickFilter(value);
        },
        handleDrogRowsFromSource(sourceId, dropParams, migratedRows) {
            let overNode = dropParams.overNode;
            // Level của source table trong group, 0 là level cao nhất
            if (overNode) {
                let pnodesInfo = this.getPotentialNodeToDrop(
                    sourceId,
                    overNode,
                    migratedRows
                );
                let countNodes = pnodesInfo.nodes.length;
                for (let i = 0; i < countNodes; i++) {
                    this.addRowsWhenSourcelvelEqualOverNodeLevel(
                        pnodesInfo.nodes[i],
                        sourceId,
                        migratedRows,
                        pnodesInfo.sourceGroupLevel,
                        pnodesInfo.realSourceGroupLevel
                    );
                }
            } else {
                // Nếu không kéo vào row nào cả, mà kéo vào bảng nói chung
                this.addRowsToTarget(sourceId, migratedRows);
            }
        },
        getPotentialNodeToDrop(sourceId, overNode) {
            let rsl = {};
            if (this.rowGroup.length > 0) {
                let sourceGroupLevel = -1;
                let overNodeGroupLevel = overNode.group
                    ? overNode.rowGroupIndex
                    : overNode.parent.rowGroupIndex + 1;

                for (let index = 0; index < this.rowGroup.length; index++) {
                    if (this.rowGroup[index].indexOf(sourceId + '__') === 0) {
                        sourceGroupLevel = index;
                        break;
                    }
                }

                let realSourceGroupLevel = sourceGroupLevel;
                if (sourceGroupLevel == -1) {
                    if (overNode.group) {
                        realSourceGroupLevel = overNodeGroupLevel;
                    } else {
                        if (
                            overNode.data[
                                this.mapSourceTableInfo[sourceId].iden
                            ]
                        ) {
                            realSourceGroupLevel =
                                overNode.parent.rowGroupIndex;
                        } else {
                            realSourceGroupLevel = this.rowGroup.length - 1;
                        }
                    }
                }

                rsl = {
                    nodes: [],
                    sourceGroupLevel,
                    overNodeGroupLevel,
                    realSourceGroupLevel
                };
                /**
                 * giả thiết: n là số dòng được chọn từ bảng nguồn
                 * m là số dòng được chọn ở bảng đích
                 * Xét cho 1 dòng được chọn ở bảng đích
                 */
                if (realSourceGroupLevel == overNodeGroupLevel) {
                    // Nếu level của bảng nguồn bằng level của over node thì tự động tạo n dòng mới có cùng các cha với overnode
                    // Xét cho từng dòng được chọn của bảng đích
                    rsl.nodes = [overNode];
                    rsl.type = SOURCE_LEVEL_EQUAL_OVERNODE;
                } else if (realSourceGroupLevel > overNodeGroupLevel) {
                    // Nếu level của bảng nguồn lớn hơn level của over node thì tự động tạo n dòng mới có cùng các cha với node có level bằng realSourceGroupLevel
                    rsl.nodes = this.getAllChildNodesBySourceId(
                        overNode,
                        sourceId
                    );
                    rsl.type = SOURCE_LEVEL_GREATER_THAN_OVERNODE;
                } else if (realSourceGroupLevel < overNodeGroupLevel) {
                    // Nếu level của bảng nguồn nhỏ hơn level của over node thì tự động tạo n dòng mới có cha là overnode và các cha của overnode
                    if (overNode.group) {
                        let upperNode = overNode.goup
                            ? overNode
                            : overNode.parent;
                        while (upperNode.field.indexOf(sourceId + '__') == -1) {
                            upperNode = upperNode.parent;
                        }
                        rsl.nodes = [upperNode];
                    } else {
                        rsl.nodes = [overNode];
                    }
                    rsl.type = SOURCE_LEVEL_SMALLER_THAN_OVERNODE;
                }
            } else {
                // Nếu không phân group cho bảng đích
                rsl.nodes = [overNode];
                rsl.type = HAVE_NODE_ROW_GROUP;
                rsl.sourceGroupLevel = 0;
                rsl.realSourceGroupLevel = 0;
                rsl.overNodeGroupLevel = 0;
            }
            return rsl;
        },
        getAllChildNodesBySourceId(parentNodes, sourceId) {
            if (Array.isArray(parentNodes)) {
                if (parentNodes.length) {
                    if (parentNodes[0].field.indexOf(sourceId + '__') === 0) {
                        return parentNodes;
                    } else {
                        let allChildNodes = [];
                        for (const node of parentNodes) {
                            allChildNodes = allChildNodes.concat(
                                this.getAllChildNodesBySourceId(
                                    node.childrenAfterFilter
                                )
                            );
                        }
                        return allChildNodes;
                    }
                } else {
                    return [];
                }
            } else if (parentNodes && parentNodes.childrenAfterFilter) {
                return this.getAllChildNodesBySourceId(
                    parentNodes.childrenAfterFilter,
                    sourceId
                );
            } else {
                return [];
            }
        },
        addRowsWhenSourcelvelEqualOverNodeLevel(
            overNode,
            sourceId,
            migratedRows,
            sourceGroupLevel,
            realSourceGroupLevel
        ) {
            let rangeColumns = this.getRangesColumnsName(
                sourceGroupLevel,
                realSourceGroupLevel,
                sourceId
            );
            let needRemoveRows = [];
            let needAddRows = [];
            let sampleRowData = this.getSampleRowData(overNode)[0];
            if (this.checkTargetRowHasSourceTb(sourceId, sampleRowData)) {
                // Nếu data của dòng con đã có data từ source table
                needAddRows = needAddRows.concat(
                    this.cloneRowData(
                        sampleRowData,
                        rangeColumns.current,
                        migratedRows,
                        rangeColumns.down
                    )
                );
            } else {
                if (overNode.group) {
                    needRemoveRows = overNode.allLeafChildren.map(
                        (el) => el.data
                    );
                } else {
                    needRemoveRows = [overNode.data];
                }
                for (const row of needRemoveRows) {
                    needAddRows = needAddRows.concat(
                        this.cloneRowData(
                            row,
                            rangeColumns.current,
                            migratedRows
                        )
                    );
                }
            }

            if (!needRemoveRows.length) {
                needAddRows.map((el) => {
                    el[DOC_TABLE_ID_COLUMN] = undefined;
                });
            }

            this.gridOptions.api.applyTransaction({
                add: needAddRows,
                remove: needRemoveRows,
                addIndex: overNode.rowIndex
            });
        },
        cloneRowData(
            rowToClone,
            overrideColumns,
            overrideValues,
            clearColumns = []
        ) {
            let rsl = [];
            let count = 0;
            for (const row of overrideValues) {
                count && delete rowToClone[DOC_TABLE_ID_COLUMN];
                let newRow = _cloneDeep(rowToClone);
                for (const col of overrideColumns) {
                    newRow[col] = row[this.mapTargetToSourceColumns[col].name];
                }

                for (const col of clearColumns) {
                    delete newRow[col];
                }
                newRow = this.replaceUnsetRowGroupByEmptyValue(newRow);
                newRow[ROW_ID] = str.randomString();
                newRow[VALIDATE_ERROR] = null;
                count += 1;
                rsl.push(newRow);
            }
            return rsl;
        },
        getRangesColumnsName(sourceLevel, realSourceGroupLevel, sourceId) {
            let rsl = {
                up: [],
                current: [],
                down: []
            };
            let self = this;
            if (self.rowGroup.length) {
                let getAllColumnFromRowgroup = function (index) {
                    let arr = [];
                    let colName = self.rowGroup[index];
                    let tbId =
                        self.mapTargetToSourceColumns[colName].sourceTableId;
                    for (const col of self.sourceTables[tbId].col) {
                        arr.push(self.getTartGetColName(tbId, col));
                    }
                    return arr;
                };

                for (let index = 0; index < realSourceGroupLevel; index++) {
                    rsl.up = getAllColumnFromRowgroup(index);
                }

                for (const col of self.sourceTables[sourceId].col) {
                    rsl.current.push(self.getTartGetColName(sourceId, col));
                }

                for (
                    let index = realSourceGroupLevel + 1;
                    index < this.rowGroup.length;
                    index++
                ) {
                    rsl.down = getAllColumnFromRowgroup(index);
                }
            } else {
                for (const col of self.sourceTables[sourceId].col) {
                    rsl.current.push(self.getTartGetColName(sourceId, col));
                }

                for (let sid in this.sourceTables) {
                    if (sid != sourceId) {
                        for (const col of this.sourceTables[sid].col) {
                            rsl.down.push(self.getTartGetColName(sid, col));
                        }
                    }
                }
            }
            return rsl;
        },

        getTartGetColName(sourceId, col) {
            return sourceId + '__' + col.name;
        },
        checkTargetRowHasSourceTb(sourceId, rowData) {
            return rowData[
                sourceId + '__' + this.sourceTables[sourceId].identityColumn
            ]
                ? true
                : false;
        },
        getSampleRowData(overNode) {
            if (overNode.group) {
                return overNode.allLeafChildren.map((el) => el.data);
            } else {
                return [overNode.data];
            }
        },
        addRowsToTarget(sourceId, rows) {
            let newRows = [];
            for (const row of rows) {
                let newRow = {};
                for (const key in row) {
                    newRow[`${sourceId}__${key}`] = row[key];
                }
                newRow = this.replaceUnsetRowGroupByEmptyValue(newRow);
                newRow[ROW_ID] = str.randomString();
                newRows.push(newRow);
            }
            this.gridOptions.api.applyTransaction({
                add: newRows
            });
        },
        replaceUnsetRowGroupByEmptyValue(newRow) {
            for (const colName of this.rowGroup) {
                if (!newRow.hasOwnProperty(colName)) {
                    newRow[colName] = '';
                }
            }
            return newRow;
        },
        getColumnDefs() {
            let cols = [];
            let mapTargetToSourceColumns = {};
            let config = this.config;
            let self = this;

            this.mapRowGroupBySourceId = {};
            let rowGroup = config.rowGroup.reduce((arr, el) => {
                let columnField = this.getTartGetColName(el.sourceTableId, el);
                arr.push(columnField);
                el.targetColumnField = columnField;
                this.mapRowGroupBySourceId[el.sourceTableId] = el;
                return arr;
            }, []);

            let colsSearch = config.colSearch.reduce((arr, el) => {
                arr.push(this.getTartGetColName(el.sourceTableId, el));
                return arr;
            }, []);

            this.rowGroup = rowGroup;
            let colsForGroup = [];
            this.config.col.map((el) => {
                let item = {
                    field: `${el.sourceTableId}__${el.name}`,
                    headerName: el.name
                };
                // Thêm rowgroup vào các cột được cấu hình
                if (rowGroup.includes(item.field)) {
                    item.rowGroup = true;
                    item.hide = true;
                    item.cellRendererParams = {
                        suppressCount: true
                    };
                }

                // Bỏ search ở các cột không được chỉ định
                if (colsSearch.includes(item.field)) {
                    item.getQuickFilterText = (p) => '';
                }

                if (!el.isShowTargetTable) {
                    item.hide = true;
                }
                item.resizable = true;
                let idx = rowGroup.indexOf(item.field);
                if (idx > -1) {
                    colsForGroup[idx] = item;
                } else {
                    cols.push(item);
                }

                mapTargetToSourceColumns[item.field] = el;
            });
            cols = Object.values(colsForGroup).concat(cols);
            this.mapTargetToSourceColumns = mapTargetToSourceColumns;
            // cols[0].rowDrag = true;

            cols = [
                // {
                //     maxWidth: 40,
                //     pinned: 'left',
                //     rowDrag: true,
                //     // rowDragText
                //     suppressMenu: true
                // },
                // {
                //     checkboxSelection: true,
                //     headerCheckboxSelection: true,
                //     maxWidth: 40,
                //     pinned: 'left'
                // },
                ...cols,
                {
                    pinned: 'right',
                    width: 40,
                    cellRenderer: (params) => {
                        // put the value in bold
                        let el = $(
                            `<i class="mdi mdi-close fs-15 cursor-pointer" title="${this.$t('v2.doc.delete')}"><i/>`
                        );
                        el.on('click', () => {
                            self.handleDeleteRows(params);
                        });
                        if (
                            params.node.data &&
                            params.node.data[VALIDATE_ERROR]
                        ) {
                            el = $('<span></span>')
                                .append(el[0])
                                .append(
                                    $(
                                        '<i class="mdi mdi-dot fs-16 yellow --text" title="' +
                                            params.node.data[VALIDATE_ERROR] +
                                            '"></i>'
                                    )
                                );
                        }
                        return el[0];
                    }
                }
            ];
            this.tableColumns = cols;
            return this.tableColumns;
        },
        handleDeleteRows(params) {
            let nodes = this.getSelectedNodesOrLeafNodes(params);
            let turnbackData = this.getTurnBackRowsByTable(nodes);
            this.$emit('return-items-to-source-tables', turnbackData);
            let removeRows = nodes.map((el) => el.data);
            this.gridOptions.api.applyTransaction({
                remove: removeRows
            });
            return removeRows;
        },
        /**
         * Lấy ra các dòng dữ liệu cần trả lại cho các bảng nguồn
         * @param nodes mảng các node trong aggrid cần trả lại data
         * @description Phân loại các dòng dữ liệu theo id của các bảng nguồn
         * @returns object có dạng {
         *      tb1: [{a: 1, b: 2}, {a: 1, b: 2}],
         *      tb2: [{a: 3, b: 4}, {a: 6, b: 7}],
         * }
         */
        getTurnBackRowsByTable(nodes) {
            let rsl = {};
            let key = '';

            for (let tbId in this.sourceTables) {
                rsl[tbId] = {};
            }
            for (let node of nodes) {
                for (let tbId in this.sourceTables) {
                    let stb = this.sourceTables[tbId];
                    key = `${tbId}__${stb.identityColumn}`;
                    // Nếu cột định dang của bảng nguồn có giá trị -> cần return cho bảng nguồn đó
                    if (node.data[key]) {
                        let row = {};
                        for (let scol of stb.col) {
                            row[scol.field] =
                                node.data[`${tbId}__${scol.field}`];
                        }
                        rsl[tbId][row[stb.identityColumn]] = row;
                    }
                }
            }

            for (const tbId in rsl) {
                rsl[tbId] = Object.values(rsl[tbId]);
            }
            return rsl;
        },
        getSelectedNodesOrLeafNodes(params) {
            let allNodes = [];
            let selectedNodes = params.api.getSelectedNodes();
            if (selectedNodes.length) {
                allNodes = selectedNodes;
            } else {
                if (params.node.group) {
                    allNodes = params.node.allLeafChildren;
                } else {
                    allNodes = [params.node];
                }
            }
            return allNodes;
        },
        setTableData(data) {
            this.gridOptions.api.setRowData(data);
        },
        initTable() {
            let self = this;
            this.gridOptions = {
                rowSelection: 'multiple',
                suppressRowClickSelection: true,
                groupDisplayType: 'multipleColumns',
                groupSelectsChildren: true,
                groupSelectsFiltered: true,
                suppressAggFuncInHeader: true,
                columnDefs: this.getColumnDefs(),
                rowData: [],
                groupDefaultExpanded: -1,
                onGridReady: (params) => {
                    self.$emit('grid-ready', self.gridOptions);
                },
                pinnedBottomRowData: [{}],
                getRowId: (params) => params.data[ROW_ID],
                getRowHeight: (params) => {
                    if (params.node.rowPinned == 'bottom') {
                        return 40;
                    } else {
                        return 28;
                    }
                },
                getRowStyle: (params) => {
                    if (params.node.rowPinned == 'bottom') {
                        return {};
                    }
                    if (self.potentialDropNodes.includes(params.node)) {
                        return { background: '#dbe7fe' };
                    } else {
                        if (!params.node.group) {
                            for (const tbId in this.mapSourceTableInfo) {
                                if (
                                    !params.node.data[
                                        this.mapSourceTableInfo[tbId].iden
                                    ]
                                ) {
                                    return { background: '#ffd9d9' };
                                }
                            }

                            if (params.node.data[VALIDATE_ERROR]) {
                                return { background: '#FFF59D' };
                            }
                        }
                    }
                }
            };
            this.agInstance = new Grid(this.$refs.table, this.gridOptions);
        },
        refreshPotentialRows(potentialDropNodes = null) {
            let rows = potentialDropNodes
                ? potentialDropNodes
                : this.potentialDropNodes;
            this.gridOptions.api.redrawRows({
                rowNodes: rows
            });
        },
        clearHighlightPotentialNodes() {
            let oldPotentialDropNodes = this.potentialDropNodes;
            this.potentialDropNodes = [];
            this.refreshPotentialRows(oldPotentialDropNodes);
            this.showAddRootRow = false;
        },
        checkRowDataHasSourceData(sourceId, sourceRow, targetRowData) {
            let colGroup = this.mapRowGroupBySourceId[sourceId];
            let targetData, sourceData;

            if (colGroup) {
                targetData = targetRowData[colGroup.targetColumnField];
                sourceData = sourceRow.data[colGroup.name];
            } else {
                targetData =
                    targetRowData[this.mapSourceTableInfo[sourceId].iden];
                sourceData =
                    sourceRow.data[this.sourceTables[sourceId].identityColumn];
            }

            return targetData === sourceData;
        },
        highlightPotentialDropNode(sourceId, overNode, sourceRows) {
            if (overNode) {
                let potentialInfo = this.getPotentialNodeToDrop(
                    sourceId,
                    overNode
                );

                let acceptableNodes = [];
                let showAddRootRow = false;
                for (const srow of sourceRows) {
                    for (const node of potentialInfo.nodes) {
                        let sampleRowData = this.getSampleRowData(node)[0];

                        if (
                            this.checkRowDataHasSourceData(
                                sourceId,
                                srow,
                                sampleRowData
                            )
                        ) {
                            // Nếu row data từ bảng nguồn giống với data ở dòng đích thì gộp luôn
                            if (node.group) {
                                acceptableNodes.push(node);
                            } else {
                                acceptableNodes.push(node.parent);
                            }
                        } else {
                            // Nếu row data từ bảng nguồn khác với data ở dòng đích thì xét tiếp
                            if (
                                this.checkTargetRowHasSourceTb(
                                    sourceId,
                                    sampleRowData
                                )
                            ) {
                                if (node.group) {
                                    if (node.parent.id == 'ROOT_NODE_ID') {
                                        showAddRootRow = true;
                                    } else {
                                        acceptableNodes.push(node.parent);
                                    }
                                } else {
                                    let upperNode = node.parent;
                                    while (
                                        upperNode.field &&
                                        upperNode.field.indexOf(
                                            sourceId + '__'
                                        ) == -1
                                    ) {
                                        upperNode = upperNode.parent;
                                    }

                                    if (
                                        upperNode.id == 'ROOT_NODE_ID' ||
                                        upperNode.parent.id == 'ROOT_NODE_ID'
                                    ) {
                                        showAddRootRow = true;
                                    } else {
                                        acceptableNodes.push(upperNode.parent);
                                    }
                                }
                            } else {
                                acceptableNodes.push(node);
                            }
                        }
                    }
                }
                this.clearHighlightPotentialNodes();
                if (showAddRootRow) {
                    this.showAddRootRow = showAddRootRow;
                } else {
                    this.potentialDropNodes = acceptableNodes;
                    this.refreshPotentialRows();
                }
            } else {
                this.clearHighlightPotentialNodes();
                this.showAddRootRow = true;
            }
        },
        getFlatData() {
            let rsl = [];
            this.gridOptions.api.forEachNode((node) =>
                node.group ? null : rsl.push(node.data)
            );
            return rsl;
        },
        getResultDataForDoc() {
            let rowData = this.getFlatData();
            let rsl = [];
            for (const row of rowData) {
                let newRow = {};
                for (let colName in this.mapTargetColToDocControl) {
                    newRow[
                        this.mapTargetColToDocControl[colName].controlMapping
                    ] = row[colName];
                }
                newRow[DOC_TABLE_ID_COLUMN] = row[DOC_TABLE_ID_COLUMN];
                rsl.push(newRow);
            }
            return rsl;
        },
        setDataFromDoc(rowData) {
            let mapControlDocToColumn = this.config.col.reduce((map, el) => {
                if (el.controlMapping) {
                    map[el.controlMapping] = el.sourceTableId + '__' + el.name;
                }
                return map;
            }, {});
            let newRows = [];
            for (const row of rowData) {
                let nr = {};
                for (const colName in row) {
                    if (mapControlDocToColumn[colName]) {
                        nr[mapControlDocToColumn[colName]] = row[colName];
                    }
                }
                nr.s_table_id_sql_lite = row.s_table_id_sql_lite;
                nr[ROW_ID] = str.randomString();
                nr[VALIDATE_ERROR] = null;

                newRows.push(nr);
            }

            this.setTableData(newRows);
        }
    },
    components: {
        SearchBox
    },
    props: {
        config: {
            type: Object,
            default: () => {
                return {};
            }
        },
        sourceTables: {
            type: Object,
            default: () => {
                return {};
            }
        },
        title: {
            type: String,
            default: ''
        },
        formulaUpdate: {
            type: String,
            default: ''
        },
        formulaValidate: {
            type: String,
            default: ''
        },
        isDuplicateData: {
            type: Boolean,
            default: false
        }
    }
};
</script>

<style scoped>
.highlight-add-row-root {
    position: absolute;
    height: 2px;
    width: calc(100% - 25px);
    background-color: #f58634;
    top: 99px;
    left: 9px;
    text-align: center;
    transition: all 0.3s ease 0s;
}
.highlight-add-row-root span {
    display: inline-block;
    height: 15px;
    width: 15px;
    font-size: 15px;
    font-weight: bold;
    line-height: 14.5px;
    border-radius: 50%;
    background-color: #f58633;
    color: white;
    text-align: center;
    position: relative;
    top: -6px;
    padding-left: 1px;
}
</style>

<template>
    <div
        :id="'symper-table-wrapper-' + cellConfigs.sharedConfigs.cellId"
        class="table-title h-100 symper-table-cell"
        @mousedown="handleCellMouseDown"
        @mouseover="handleMouseOver()"
        @mouseup="handleCellMouseUp"
    >
        <div ref="styleTag"></div>
        <div ref="renderHiddenColumnCss" v-html="renderHiddenColumnCss"></div>
        <ag-grid-vue
            :suppressAggFuncInHeader="true"
            :style="tableOptions.tableStyle"
            class="ag-theme-balham symper-table-report"
            :gridOptions="gridOptions"
            :columnDefs="computedColumnDefs"
            :getContextMenuItems="getContextMenuItems"
            :groupDefaultExpanded="
                cellConfigs.rawConfigs.style.groupTable.children.autoCollapse
                    .value
                    ? '0'
                    : '-1'
            "
            @first-data-rendered="headerHeightSetter()"
            groupDisplayType="groupRows"
            :rowData="tableOptions.options.data"
            :columnTypes="columnTypes"
            :suppressRowClickSelection="true"
            :groupHideOpenParents="
                cellConfigs.rawConfigs.style.subTotal.children.hideOpenParent
                    .value
            "
            :rowSelection="'multiple'"
            :getRowStyle="getRowStyle"
            :defaultColDef="defaultColDef"
            :autoGroupColumnDef="autoGroupColumnDef"
            :tooltipShowDelay="500"
            :stopEditingWhenGridLosesFocus="true"
            :enableRangeSelection="true"
            :modules="modules"
            :suppressFieldDotNotation="true"
            :pinnedBottomRowData="tableOptions.options.totalRow"
            :groupMultiAutoColumn="
                !cellConfigs.rawConfigs.style.groupTable.children
                    .groupMultiAutoColumn.value
            "
            @model-updated="onTableRender()"
            @column-resized="onColumnResized($event)"
            @grid-ready="onAgReady"
            @column-visible="onShowHideColumns"
            @sortChanged="handleSortChange"
            @column-pinned="afterPinnedColumns"
            @virtual-columns-changed="handleNewColumnRender"
        >
        </ag-grid-vue>
        <div
            class="symper-table-pagination pl-1"
            style="height: 25px; margin-top: 5px"
            :style="customCssPagination"
        >
            <Pagination
                v-if="!getAllData"
                ref="pagination"
                :contentSize="'mini'"
                @on-change-page-size="handleSizeChange"
                @on-change-page="handleCurrentPageChange"
                :total="tableOptions.options.totalRowCount"
            >
            </Pagination>
            <div v-else class="total">
                <span class="px-2 font-weight-medium"
                    >{{
                        tableOptions.options.totalRowCount > 10000
                            ? 10000
                            : tableOptions.options.totalRowCount
                    }}
                    {{ $t('common.entries') }}</span
                >
            </div>
        </div>
        <SymperDialogConfirm
            :showDialog="comfirmGetAllDataInfor.show"
            :title="comfirmGetAllDataInfor.title"
            :content="$t('v2.dashboard.confirmGetAllGroup')"
            :titleCancelBtn="$t('common.cancel')"
            :titleConfirmBtn="$t('common.confirm')"
            @confirm="comfirmGetAllDataInfor.confirm()"
            @cancel="comfirmGetAllDataInfor.cancel()"
        />
    </div>
</template>
<script>
import { AgGridVue } from 'ag-grid-vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import treeConditionConverter from '@/components/dashboard/configPool/treeConditionToJSString.js';
import Pagination from '@/components/common/Pagination.vue';
import _cloneDeep from 'lodash/cloneDeep';
var mo = treeConditionConverter.mo;
import { util } from '@/plugins/util';
import _isEmpty from 'lodash/isEmpty';
import { number } from '@/plugins/utilModules/number.js';
import { calcReportWraperSize } from '@/components/dashboard/configPool/dashboardConfigs.js';
import PivotChart from '@/components/dashboard/reports/Pivot.chart.js';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
var pivotSupport = new PivotChart('');

export default {
    created() {
        this.renderedColumnWidths = {};
        let self = this;
        this.$evtBus.$on('dashboard-resize-report', (data) => {
            if (!self._inactive && data.instanceKey == self.instanceKey) {
                if (
                    data.singleApply &&
                    data.applyCellId != this.cellConfigs.sharedConfigs.cellId
                ) {
                    // Nếu tín hiệu chỉ áp dụng để resize 1 report duy nhất nhưng khác id của report hiện tại thì bỏ qua
                    return;
                }
                let size = calcReportWraperSize(self.$el, self.cellConfigs);
                let mode = self.tableOptions.options.tableColumnWidthMode;
                if (mode == 'fitCell') {
                    this.gridColumnApi.sizeColumnsToFit(size.w);
                }
            }
        });
        this.$evtBus.$on(
            'bi-report-comfirm-subTotal',
            (instanceKey, cellId) => {
                if (
                    instanceKey == this.instanceKey &&
                    cellId == this.cellConfigs.sharedConfigs.cellId
                ) {
                    this.showDialog = true;
                }
            }
        );
    },
    props: {
        cellConfigs: {
            default() {
                return {};
            }
        },
        instanceKey: {
            default: ''
        },
        action: {
            default: ''
        }
    },
    methods: {
        handlerGroupRowAgg(colDef) {
            let self = this;
            if (
                !self.cellConfigs.rawConfigs.style.subTotal.children
                    .showSubTotal.value
            ) {
                return () => {};
            } else {
                let joinByValue =
                    self.cellConfigs.rawConfigs.style.subTotal.children
                        .joinByValue.value;
                let selectedColumn;
                selectedColumn = self.selectedColumns.find(
                    (col) =>
                        col.as == colDef.field ||
                        col.as == colDef.symperValueColumn
                );
                let groupRowAggFunc;
                if (selectedColumn) {
                    groupRowAggFunc =
                        selectedColumn.menuOptions.groupRowAgg.value;
                }
                switch (groupRowAggFunc) {
                    case 'First':
                        return (params) => {
                            return params.values.filter((val) => val)[0];
                        };
                    case 'Last':
                        return (params) => {
                            let computeValue = params.values.filter(
                                (val) => val
                            );
                            return computeValue[computeValue.length - 1];
                        };
                    case 'Concat':
                        return (params) => {
                            let result = params.values.join(distinctValue);
                            return result;
                        };
                    case 'ConcatDistinct':
                        return (params) => {
                            let distinctValue = [];
                            params.values.map((val) => {
                                let subVal = val
                                    .split(joinByValue)
                                    .filter(
                                        (value) =>
                                            value &&
                                            distinctValue.indexOf(value) == -1
                                    );
                                distinctValue = distinctValue.concat(subVal);
                            });
                            let result = distinctValue.join(joinByValue);
                            return result;
                        };
                    case 'Sum':
                        return (params) => {
                            let total = 0;
                            params.values.forEach((value) => {
                                if (value != null) {
                                    total += Number(value);
                                }
                            });
                            return total;
                        };
                    default:
                        return (params) => {
                            return '';
                        };
                }
            }
        },
        headerHeightSetter() {
            var padding = 20;
            var height = this.headerHeightGetter() + padding;
            this.gridApi.setHeaderHeight(height);
            this.gridApi.resetRowHeights();
        },
        headerHeightGetter() {
            var columnHeaderTexts = [
                ...document.querySelectorAll('.ag-header-cell-text')
            ];
            var clientHeights = columnHeaderTexts.map(
                (headerText) => headerText.clientHeight
            );
            var tallestHeaderTextHeight = Math.max(...clientHeights);

            return tallestHeaderTextHeight;
        },
        handleSettingColumnOptionsClicked(data) {
            let subItem = data.data.item;
            let self = this;
            if (data.data.key == 'groupBy') {
                let selectedColums = this.selectedColumns;
                if (
                    !data.data.item.value &&
                    !selectedColums
                        .slice(0, selectedColums.length - 1)
                        .some((col) => {
                            return (
                                col.menuOptions &&
                                col.menuOptions.groupBy &&
                                col.menuOptions.groupBy.value
                            );
                        })
                ) {
                    let needGetAllData = false;
                    this.comfirmGetAllDataInfor.show = true;
                    this.comfirmGetAllDataInfor.title = 'Group table';
                    this.comfirmGetAllDataInfor.content = this.$t(
                        'bi.dashboard.confirm-group-table'
                    );
                    this.comfirmGetAllDataInfor.confirm = () => {
                        self.comfirmGetAllDataInfor.show = false;
                        needGetAllData = true;
                        let subItem = data.data.item;
                        subItem.value = !subItem.value;
                        let key = data.data.key;
                        if (self.prependIcon.hasOwnProperty(key)) {
                            let selectedColumn =
                                data.data.extra.selectingSubItem;
                            if (subItem.value) {
                                selectedColumn.prependIcon =
                                    self.prependIcon[key];
                            } else {
                                selectedColumn.prependIcon = '';
                            }
                            self.$evtBus.$emit('bi-report-change-display', {
                                type: 'data',
                                id: self.cellConfigs.sharedConfigs.cellId,
                                instanceKey: self.instanceKey,
                                fromSetting: data.event
                            });
                        }
                        self.$evtBus.$emit('dashboard-compute-prepend-icons');
                    };
                    this.comfirmGetAllDataInfor.cancel = () => {
                        self.comfirmGetAllDataInfor.show = false;
                    };
                } else {
                    subItem.value = !subItem.value;
                }
            } else if (
                ['sort-on-query-desc', 'sort-on-query-asc'].includes(data.event)
            ) {
                let item = data.data.extra.selectingSubItem.menuOptions;
                if (data.event == 'sort-on-query-desc') {
                    item.sortAsc.value = false;
                    item.sortDesc.value = true;
                } else {
                    item.sortAsc.value = true;
                    item.sortDesc.value = false;
                }
            } else {
                if (data.data.extra.parentItem) {
                    let parent = data.data.extra.parentItem;
                    if (parent.key == 'bottomRowAgg') {
                        parent.value = subItem.value;
                        parent.title = `${parent.prefixTitle} (${subItem.title})`;
                        for (let i of parent.subItems) {
                            i.checked = false;
                        }
                        subItem.checked = true;
                    } else if (parent.key == 'groupRowAgg') {
                        parent.value = subItem.value;
                        for (let i of parent.subItems) {
                            i.checked = false;
                        }
                        subItem.checked = true;
                    }
                } else {
                    subItem.value = !subItem.value;
                }
            }
            let key = data.data.key;
            if (this.prependIcon.hasOwnProperty(key)) {
                let selectedColumn = data.data.extra.selectingSubItem;
                if (subItem.value) {
                    selectedColumn.prependIcon = this.prependIcon[key];
                } else {
                    selectedColumn.prependIcon = '';
                }
            }
            self.$evtBus.$emit('dashboard-compute-prepend-icons');
            this.$evtBus.$emit('bi-report-change-display', {
                type: 'data',
                id: this.cellConfigs.sharedConfigs.cellId,
                instanceKey: this.instanceKey,
                fromSetting: data.event
            });
        },
        getContextMenuItems(params) {
            let result = ['copy', 'copywithheader', 'paste', 'export'];
            if (this.hasRowGroup) {
                result.unshift({
                    name: this.$t('v2.dashboard.collapseAll'),
                    action: () => {
                        this.gridOptions.api.collapseAll();
                    },
                    icon: '<i class="mdi mdi-arrow-collapse-all"></i>'
                });
                result.unshift({
                    name: this.$t('v2.dashboard.expandAll'),
                    action: () => {
                        this.gridOptions.api.expandAll();
                    },
                    icon: '<i class="mdi mdi-arrow-expand-all"></i>'
                });
            }
            return result;
        },
        onRangeSelectionChanged() {
            if (this.debounceCalcAggRange) {
                clearTimeout(this.debounceCalcAggRange);
            }
            this.debounceCalcAggRange = setTimeout(() => {
                this.calcAggRange();
            }, 300);
        },
        calcAggRange() {
            this.$evtBus.$emit('dashboard-calc-table-agg-range', {
                action: 'reset',
                instanceKey: this.instanceKey
            });
            let sum = 0,
                count = 0,
                avgCount = 0;
            let cellRanges = this.gridOptions.api.getCellRanges();

            // if no selection, clear all the results and do nothing more
            if (!cellRanges || cellRanges.length === 0) {
                return;
            }
            let api = this.gridOptions.api;
            cellRanges.forEach(function (range) {
                // get starting and ending row, remember rowEnd could be before rowStart
                let startRow = Math.min(
                    range.startRow.rowIndex,
                    range.endRow.rowIndex
                );
                let endRow = Math.max(
                    range.startRow.rowIndex,
                    range.endRow.rowIndex
                );

                for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
                    range.columns.forEach(function (column) {
                        if (column.colDef.symperType == 'number') {
                            avgCount += 1;
                            let rowModel = api.getModel();
                            let rowNode = rowModel.getRow(rowIndex);
                            let value = api.getValue(column, rowNode);
                            value = Number(String(value).replace(',', ''));
                            if (!isNaN(value)) {
                                sum += value;
                            }
                        }
                        count += 1;
                    });
                }
            });
            if (count > 1) {
                this.$evtBus.$emit('dashboard-calc-table-agg-range', {
                    action: 'display',
                    instanceKey: this.instanceKey,
                    info: {
                        count,
                        sum: number.thousandsSeparateAndRound(
                            sum,
                            3,
                            ',',
                            true
                        ),
                        avg: avgCount
                            ? number.thousandsSeparateAndRound(
                                  sum / avgCount,
                                  3,
                                  ',',
                                  true
                              )
                            : '-'
                    }
                });
            }
        },
        handleNewColumnRender(x, y) {
            if (this.debounceRecalcColwidth) {
                clearTimeout(this.debounceRecalcColwidth);
            }
            let self = this;
            this.debounceRecalcColwidth = setTimeout(() => {
                let mode = self.tableOptions.options.tableColumnWidthMode;
                if (
                    mode != 'auto' &&
                    mode != 'fitCell' &&
                    !_isEmpty(self.renderedColumnWidths)
                ) {
                    self.autoSizeAll(mode == 'fitData');
                }
            }, 200);
        },
        handleCurrentPageChange(data) {
            this.cellConfigs.sharedConfigs.currentPage = data.page;
            this.$evtBus.$emit('bi-report-change-display', {
                type: 'data',
                id: this.cellConfigs.sharedConfigs.cellId,
                instanceKey: this.instanceKey
            });
        },
        handleSizeChange(data) {
            this.cellConfigs.sharedConfigs.pageSize = data.pageSize;
            if (
                data.pageSize * this.cellConfigs.sharedConfigs.currentPage >
                this.cellConfigs.viewConfigs.displayOptions.totalRowCount
            ) {
                let computedCurrentPage =
                    this.cellConfigs.viewConfigs.displayOptions.totalRowCount /
                    data.pageSize;
                if (computedCurrentPage != parseInt(computedCurrentPage)) {
                    computedCurrentPage = parseInt(computedCurrentPage) + 1;
                }
                this.cellConfigs.sharedConfigs.currentPage =
                    computedCurrentPage;
            }
            this.$evtBus.$emit('bi-report-change-display', {
                type: 'data',
                id: this.cellConfigs.sharedConfigs.cellId,
                instanceKey: this.instanceKey
            });
        },
        onShowHideColumns() {
            let hiddenCols = {};
            this.gridColumnApi.getColumnState().forEach((colState) => {
                if (colState.hide) {
                    hiddenCols[colState.colId] = true;
                }
            });
            let cellId = this.cellConfigs.sharedConfigs.cellId;
            if (!this.cellConfigs.rawConfigs.extra) {
                this.cellConfigs.rawConfigs.extra = {};
            }
            this.cellConfigs.rawConfigs.extra.hiddenCols = hiddenCols;

            if (this.debounceCustomSaveHideCols) {
                clearTimeout(this.debounceCustomSaveHideCols);
            }

            this.debounceCustomSaveHideCols = setTimeout(() => {
                this.saveEnduserUIDisplay(
                    hiddenCols,
                    'hiddenCols',
                    this.cellConfigs.sharedConfigs.cellId
                );
            }, 500);
        },
        applyHiddenToDisplayConfig(hiddenCols) {
            let leafCols = [];
            let colDefs = this.tableOptions.options.columns;

            pivotSupport.getLeafColFromGroup(colDefs, leafCols);
            for (let col of colDefs) {
                col.hide = hiddenCols[col.field] ? true : false;
            }
        },
        handleMouseOver() {
            if (this.inPrintingMode) {
                this.inPrintingMode = false;
                this.gridApi.setDomLayout(null);
            }
        },
        printInnerHTML(headerHTML = '') {
            this.gridApi.setDomLayout('print');
            let self = this;
            setTimeout(() => {
                self.inPrintingMode = true;
                let domHTML = $(self.$el).find('.symper-table-report')[0]
                    .outerHTML;
                domHTML = headerHTML + domHTML;
                util.printDOM(domHTML);
            }, 500);
        },
        onAgReady($event, gridContainer) {},
        // addPerfectScrollBar(){
        //     if(this.perfectScrollInstance){
        //         this.perfectScrollInstance.destroy();
        //     }
        //     let array=[ ".ag-body-viewport"," .ag-body-horizontal-scroll-viewport"];
        //     for(let className of array){
        //         let container = $(this.$el).find(className);
        //         if(container[0]){
        //             let ps = new PerfectScrollbar(container[0]);
        //             ps.update();
        //             this.perfectScrollInstance = ps;
        //         }
        //     }
        // },
        handleSortChange() {
            let allColumns = this.gridColumnApi.getAllColumns();
            for (let i = 0; i < allColumns.length; i++) {
                this.selectedColumns[i].sort = allColumns[i].sort
                    ? allColumns[i].sort
                    : 'none';
            }
            this.$evtBus.$emit('bi-report-change-display', {
                id: this.cellConfigs.sharedConfigs.cellId,
                type: 'data',
                instanceKey: this.instanceKey
            });
        },
        afterPinnedColumns(params) {
            let pinnedColIdx = {};
            this.gridColumnApi.getColumnState().forEach((colState) => {
                if (colState.pinned) {
                    pinnedColIdx[colState.colId] = colState.pinned;
                }
            });

            if (!this.cellConfigs.rawConfigs.extra) {
                this.cellConfigs.rawConfigs.extra = {};
            }
            this.cellConfigs.rawConfigs.extra.pinnedColIdx = pinnedColIdx;

            if (this.debounceCustomSavePinnedCol) {
                clearTimeout(this.debounceCustomSavePinnedCol);
            }

            this.debounceCustomSavePinnedCol = setTimeout(() => {
                this.saveEnduserUIDisplay(
                    pinnedColIdx,
                    'pinnedColIdx',
                    this.cellConfigs.sharedConfigs.cellId
                );
            }, 500);
        },
        handleTableScroll() {},
        handleCellMouseDown(evt) {
            if ($(evt.target).hasClass('ag-header-cell-resize')) {
                this.isResizing = true;
                this.$evtBus.$emit('lock-workspace');
            }
        },
        handleCellMouseUp(evt) {
            if (this.isResizing) {
                this.isResizing = false;
                this.$evtBus.$emit('unlock-workspace');
                this.saveColumnWidth();
            }
        },
        saveColumnWidth() {
            let columns = this.gridColumnApi.getColumnState();
            let colWidths = {};
            for (let col of columns) {
                colWidths[col.colId] = col.width;
            }
            if (!this.cellConfigs.rawConfigs.extra) {
                this.cellConfigs.rawConfigs.extra = {};
            }
            this.cellConfigs.rawConfigs.extra.columnsWidth = colWidths;

            if (this.debouncesaveEnduserUIDisplay) {
                clearTimeout(this.debouncesaveEnduserUIDisplay);
            }

            this.debouncesaveEnduserUIDisplay = setTimeout(() => {
                this.saveEnduserUIDisplay(
                    colWidths,
                    'columnsWidth',
                    this.cellConfigs.sharedConfigs.cellId
                );
            }, 500);
        },
        convertCssObjToStr(styleObj) {
            let rsl = '';
            for (let styleName in styleObj) {
                let name = styleName.replace(/([A-Z])/g, '-$1').toLowerCase();
                rsl += `${name} : ${styleObj[styleName]}; \n`;
            }
            return rsl;
        },
        reStyleHeader() {
            let cellId = this.cellConfigs.sharedConfigs.cellId;
            let table = $(`.symper-dashboard-cell[symper-cell-id=${cellId}]`);
            let idCell = 'symper-table-wrapper-' + cellId;
            let headerStyle = this.tableOptions.options.headerStyle;
            let style = '';
            if (headerStyle) {
                style += `
                    #${idCell} .ag-header-cell,#${idCell} .ag-header-group-cell {
                        text-align: ${headerStyle.textAlign};
                        background-color: ${headerStyle.backgroundColor};
                        color: ${headerStyle.color};
                        font-size: ${headerStyle.fontSize};
                        border-top-width: ${headerStyle.borderWidth};
                        border-top-color: ${headerStyle.borderColor};
                        border-top-style: ${headerStyle.borderStyle};
                    }

                    #${idCell} .ag-header-viewport .ag-header-row .ag-header-group-cell[aria-colindex='1'],
                    #${idCell} .ag-header-viewport .ag-header-row .ag-header-cell[aria-colindex='1']{
                        border-left-width: ${headerStyle.borderWidth};
                        border-left-color: ${headerStyle.borderColor};
                        border-left-style: ${headerStyle.borderStyle};
                    }


                    #${idCell} .ag-header-viewport .ag-header-row:last-child,
                    #${idCell} .ag-pinned-left-header .ag-header-row:last-child,
                    #${idCell} .ag-pinned-right-header .ag-header-row:last-child{
                        border-bottom-color: ${headerStyle.borderColor};
                        border-bottom-style: ${headerStyle.borderStyle};
                        border-bottom-width: ${headerStyle.borderWidth};
                    }
                    #${idCell} .ag-header-group-cell .ag-header-group-cell-label,
                    #${idCell} .ag-header-cell .ag-header-cell-label {
                        justify-content: ${
                            headerStyle.textAlign == 'right'
                                ? 'flex-end'
                                : headerStyle.textAlign
                        };
                    }

                    `;

                if (headerStyle.verticalLine) {
                    style += `
                        #${idCell} .ag-header-group-cell,
                        #${idCell} .ag-header-cell {
                            border-right-width: ${headerStyle.borderWidth};
                            border-right-color: ${headerStyle.borderColor};
                            border-right-style: solid;
                        }
                    `;
                } else {
                    style += `
                        #${idCell} .ag-header-group-cell,
                        #${idCell} .ag-header-cell {
                            border-right-width: 0px;
                            border-right-color: 0px;
                            border-right-style: solid;
                        }
                    `;
                }
            }
            if (this.tableOptions.options.cssDisplayPivotHeader) {
                style = style + this.tableOptions.options.cssDisplayPivotHeader;
            }
            return style;
        },
        reStyleTotal() {
            let cellId = this.cellConfigs.sharedConfigs.cellId;
            let idCell = 'symper-table-wrapper-' + cellId;
            let style = '';
            let totalRowStyle = this.tableOptions.options.totalRowStyle;
            if (totalRowStyle) {
                style += `
                    #${idCell} .ag-floating-bottom {
                        font-weight: bold;
                    }
                    #${idCell} .ag-floating-bottom{
                        border-bottom-width: ${totalRowStyle.borderWidth}!important;
                        border-bottom-color: ${totalRowStyle.borderColor}!important;
                        border-top-width: ${totalRowStyle.borderWidth}!important;
                        border-top-color: ${totalRowStyle.borderColor}!important;
                        border-bottom-style: ${totalRowStyle.borderStyle}!important;
                        border-top-style:  ${totalRowStyle.borderStyle}!important;
                    }
                    `;

                if (totalRowStyle.verticalLine) {
                    style += `
                        #${idCell} .ag-floating-bottom .ag-cell{
                            border-right-width: ${totalRowStyle.borderWidth};
                            border-right-color: ${totalRowStyle.borderColor};
                            border-bottom-right:  ${totalRowStyle.borderStyle}!important;
                            border-right-style:  ${totalRowStyle.borderStyle}!important;
                        }
                    `;
                }
            }
            return style;
        },
        reStyleDataCell() {
            let cellId = this.cellConfigs.sharedConfigs.cellId;
            let idCell = 'symper-table-wrapper-' + cellId;
            let style = '';

            let cellStyle = this.tableOptions.options.cellStyle;
            if (cellStyle) {
                if (cellStyle.verticalLine) {
                    style += `
                        #${idCell} .ag-cell:not(.ag-cell-last-left-pinned,.ag-cell-range-selected) {
                            border-right-width: ${cellStyle.borderBottomWidth};
                            border-right-color: ${cellStyle.borderBottomColor};
                            border-right-style: solid;
                        }`;
                } else {
                    style += `
                        #${idCell} .ag-cell:not(.ag-cell-last-left-pinned,.ag-cell-range-selected) {
                            border-right-width: 0px;
                            border-right-color: '#00000000';
                            border-right-style: solid;
                        }`;
                }
            }
            return style;
        },
        onTableRender() {
            if (this.alreadyTableRender) {
                return;
            }
            this.headerHeightSetter();
            let self = this;
            this.alreadyTableRender = true;

            this.reStylePagination();
            let customStyle = this.reStyleHeader();
            customStyle += this.reStyleDataCell();
            customStyle += this.reStyleTotal();
            let styleTag = this.$refs.styleTag;
            styleTag.innerHTML = `<style>${customStyle}</style>`;
            this.renderedColumnWidths = {};
            this.setColumnWidth();
            setTimeout(() => {
                self.alreadyTableRender = false;
            }, 100);
            setTimeout(() => {
                let pinnedStatus = [];
                if (
                    this.cellConfigs.rawConfigs.extra &&
                    this.cellConfigs.rawConfigs.extra.pinnedColIdx
                ) {
                    for (let col in this.cellConfigs.rawConfigs.extra
                        .pinnedColIdx) {
                        pinnedStatus.push({
                            colId: col,
                            pinned: this.cellConfigs.rawConfigs.extra
                                .pinnedColIdx[col]
                        });
                    }
                }
                this.gridColumnApi.applyColumnState({
                    state: pinnedStatus
                });
            }, 100);
        },
        reStylePagination() {
            this.customCssPagination = this.convertCssObjToStr(
                this.tableOptions.options.paginationStyle
            );
        },
        /**
         * Điều chỉnh chiều rộng của cột trong bảng
         */
        setColumnWidth() {
            // Nếu người dùng resize các cột của table -> có dữ liệu về chiều rộng của từng cột
            if (this.cellConfigs.viewConfigs.needSaveExtraOptions.colWidth) {
            } else {
                let mode = this.tableOptions.options.tableColumnWidthMode;
                if (mode == 'auto') {
                    return;
                } else if (mode != 'fitCell') {
                    this.autoSizeAll(mode == 'fitData');
                } else {
                    if (!this.hasRowGroup) {
                        let w =
                            this.cellConfigs.viewConfigs.displayOptions
                                .contentSize.w;
                        this.gridColumnApi.sizeColumnsToFit(w);
                    }
                }
            }
        },

        /**
         * Tự động resize chiều rộng các cột theo chiều dài dữ liệu của cột đó
         * @param {Boolean} skipHeader xét việc co chiều rộng có xét tới chiều rộng của header hay không
         * @returns {void}
         */
        autoSizeAll(skipHeader) {
            var allColumnIds = [];
            let allCols = this.gridColumnApi.getAllColumns();

            let self = this;
            if (allCols) {
                let cssCellIden = `#symper-table-wrapper-${self.cellConfigs.sharedConfigs.cellId}`;
                allCols.forEach(function (column) {
                    if (
                        !self.renderedColumnWidths[column.colId] &&
                        !self.customColWidths[column.colId]
                    ) {
                        allColumnIds.push(column.colId);
                    }
                });
                if (allColumnIds.length > 0) {
                    if (!_isEmpty(self.renderedColumnWidths)) {
                        let allCellIden = [];
                        let preload = allColumnIds.slice(0, 20);
                        for (let item of preload) {
                            allCellIden.push(
                                `${cssCellIden} .ag-cell[col-id='${item}'], ${cssCellIden} .ag-header-cell[col-id='${item}']`
                            );
                        }
                        allCellIden = allCellIden.join(' , ');
                        this.renderHiddenColumnCss = `<style>${allCellIden} {
                            height: 0px;
                            border-right: none;
                        }</style>`;
                        setTimeout(() => {
                            self.renderHiddenColumnCss = '';
                        }, 500);
                    }
                    this.gridColumnApi.autoSizeColumns(
                        allColumnIds,
                        skipHeader
                    );
                }
                let renderedCols = $(`${cssCellIden} .ag-header-cell`);
                for (let el of renderedCols) {
                    self.renderedColumnWidths[el.getAttribute('col-id')] = true;
                }
            }
        },

        /**
         * Xử lý khi resize một column của table
         * @returns {void}
         */
        onColumnResized(event) {
            let widths = [];
            this.gridColumnApi.getColumnState().forEach((colState) => {
                widths.push(colState.width);
            });
            this.headerHeightSetter();
            if (
                event.column &&
                event.column.colId &&
                event.column.colDef.width
            ) {
                this.customColWidths[event.column.colId] =
                    event.column.colDef.width;
            }
            if (this.action == 'view') {
                this.saveColumnWidth();
            }
        },
        saveEnduserUIDisplay(data, key, cellId) {
            this.$evtBus.$emit('dashboard-save-enduser-ui-display', {
                instanceKey: this.instanceKey,
                data,
                key,
                cellId
            });
        },
        setOptions(displayOptions) {
            this.$set(this.tableOptions, 'options', displayOptions);
        },
        setTableStyle(displayOptions) {
            let style = Object.assign(
                {
                    width: '100%',
                    height: displayOptions.contentSize.h - 35 + 'px'
                },
                displayOptions.cellStyle
            );
            this.$set(this.tableOptions, 'tableStyle', style);
        },
        setColumnDefs(displayOptions) {
            let leafCols = [];
            let rsl = _cloneDeep(displayOptions.columns);

            pivotSupport.getLeafColFromGroup(rsl, leafCols);
            if (!Array.isArray(rsl)) {
                return;
            }
            let self = this;
            let condition = '';
            for (let colDef of leafCols) {
                if (colDef.conditionalFormatInfo) {
                    colDef.cellStyle = function (params) {
                        // Biến row này phục vụ cho việc chạy trong eval, chứ không phải là không dùng
                        var row = params.node.data;
                        if (row != undefined) {
                            let formatConds = colDef.conditionalFormatInfo;
                            for (let item of formatConds) {
                                condition = colDef.symperValueColumn
                                    ? item.condition.replace(
                                          `['${colDef.symperValueColumn}']`,
                                          `['${colDef.field}']`
                                      )
                                    : item.condition;
                                let checkCondition = eval(condition);
                                if (checkCondition) {
                                    return item.style;
                                }
                            }
                        }
                        return null;
                    };
                }

                if (colDef.symperType == 'text') {
                    colDef.cellRenderer = function (params) {
                        // đã xử lý việc loại bỏ html tag trong hàm translate của table, nên chỗ này chỉ cần trả về luôn
                        return params.value;
                    };
                }
            }
            let selectedColumns = [];
            if (
                this.cellConfigs.sharedConfigs.type == 'table' &&
                this.cellConfigs.rawConfigs.setting.hasOwnProperty('value')
            ) {
                selectedColumns =
                    this.cellConfigs.rawConfigs.setting.value.selectedColums;
            } else if (
                this.cellConfigs.sharedConfigs.type == 'pivot' &&
                this.cellConfigs.rawConfigs.setting.hasOwnProperty('rows')
            ) {
                selectedColumns =
                    this.cellConfigs.rawConfigs.setting.rows.selectedColums;
            }

            for (let i = 0; i < selectedColumns.length; i++) {
                if (
                    selectedColumns[i].hasOwnProperty('menuOptions') &&
                    selectedColumns[i].menuOptions.hasOwnProperty('groupBy') &&
                    selectedColumns[i].menuOptions.groupBy.value
                ) {
                    this.columnNotGroup = i + 1;
                    this.hasRowGroup = true;
                    rsl[i].colId = 'group' + rsl[i].field;
                    rsl[i].rowGroup = true;
                    rsl[i].hide = true;
                }
                if (
                    selectedColumns[i].hasOwnProperty('menuOptions') &&
                    selectedColumns[i].menuOptions.hasOwnProperty('wrapText') &&
                    selectedColumns[i].menuOptions.wrapText.value
                ) {
                    rsl[i].wrapText = true;
                    rsl[i].autoHeight = true;
                }
            }
            if (
                this.cellConfigs.rawConfigs.style.groupTable.children
                    .groupMultiAutoColumn.value
            ) {
                rsl[this.columnNotGroup].hide = true;
                this.autoGroupColumnDef.field = rsl[this.columnNotGroup].field;
                if (
                    this.selectedColumns
                        .slice(0, this.columnNotGroup + 1)
                        .some(
                            (col) =>
                                col.menuOptions &&
                                col.menuOptions.wrapText &&
                                col.menuOptions.wrapText.value
                        )
                ) {
                    this.autoGroupColumnDef.wrapText = true;
                    this.autoGroupColumnDef.autoHeight = true;
                }
            } else {
                delete this.autoGroupColumnDef.field;
            }
            // }

            this.$set(this.tableOptions, 'columnDefs', rsl);
        },
        showDisplayOptions(newVl) {
            this.tableOptions.columnDefs = null;
            setTimeout(() => {
                this.setOptions(newVl);
                this.setTableStyle(newVl);
                this.setColumnDefs(newVl);
            }, 0);
        }
    },
    watch: {
        'cellConfigs.rawConfigs.style.groupTable.children.groupName.value'(
            newVal
        ) {
            if (
                this.cellConfigs.rawConfigs.style.groupTable.children
                    .groupMultiAutoColumn.value
            ) {
                this.autoGroupColumnDef.headerName = newVal;
            }
        },
        'cellConfigs.rawConfigs.style.subTotal.children.showOnTop.value'(
            newVl,
            oldValue
        ) {
            this.gridOptions.groupIncludeFooter =
                !newVl &&
                this.cellConfigs.rawConfigs.style.subTotal.children.showSubTotal
                    .value;
        },
        getAllData(newVal) {
            if (newVal) {
                delete this.cellConfigs.sharedConfigs.pageSize;
            } else {
                this.cellConfigs.sharedConfigs.pageSize = 50;
            }
        },
        'cellConfigs.rawConfigs.style.groupTable.children.groupMultiAutoColumn.value'(
            newVl
        ) {
            if (!newVl) {
                delete this.autoGroupColumnDef.headerName;
                delete this.autoGroupColumnDef.field;
                this.tableOptions.columnDefs[this.columnNotGroup].hide = false;
            } else {
                this.autoGroupColumnDef.headerName =
                    this.cellConfigs.rawConfigs.style.groupTable.children.groupName.value;
                this.tableOptions.columnDefs[this.columnNotGroup].hide = true;
                this.autoGroupColumnDef.field =
                    this.tableOptions.columnDefs[this.columnNotGroup].field;
            }
        },
        'cellConfigs.viewConfigs.displayOptions': {
            deep: true,
            immediate: true,
            handler(newVl, oldValue) {
                // tạm bỏ để render table ở bên mobile
                // if (
                //     this.$parent.$parent.$el.getBoundingClientRect().height > 0
                // ) {
                this.showDisplayOptions(newVl);
                // }
            }
        },
        'cellConfigs.sharedConfigs.currentPage'(newVl) {
            this.$refs.pagination.page = newVl;
        },
        'cellConfigs.rawConfigs.style.subTotal.children.showSubTotal.value'(
            newVal
        ) {
            this.gridOptions.groupIncludeFooter =
                newVal &&
                !this.cellConfigs.rawConfigs.style.subTotal.children.showOnTop
                    .value;
        }
    },
    computed: {
        computedColumnDefs() {
            let columnDefs = this.tableOptions.columnDefs;
            let self = this;
            if (columnDefs) {
                columnDefs.forEach((col) => {
                    if (col.rowGroup) {
                        col.colId = 'group' + col.field;
                    }
                    col.aggFunc = self.handlerGroupRowAgg(col);
                });
                return columnDefs;
            }
            return [];
        },
        selectedColumns() {
            let self = this;
            let arr = [];
            for (let i in this.cellConfigs.rawConfigs.setting) {
                arr = arr.concat(
                    this.cellConfigs.rawConfigs.setting[i].selectedColums
                );
            }
            if (arr.length > 0) {
                arr.forEach(function (e) {
                    if (!e.sort) {
                        self.$set(e, 'sort', 'none');
                    }
                });
            }
            return arr;
        },
        getAllData() {
            let selectedColums = this.selectedColumns;
            return selectedColums
                .slice(0, selectedColums.length - 1)
                .some((col) => {
                    if (col.menuOptions) {
                        if (col.menuOptions.groupBy) {
                            if (col.menuOptions.groupBy.value) {
                                return true;
                            }
                        }
                        return false;
                    }
                });
        }
        // columnDefs(){
        //     // if(){
        //     //     return options.columns;
        //     // }else{
        //     let rsl = _cloneDeep(this.options.columns);
        //     for(let colDef of rsl){
        //         if(colDef.conditionalFormatInfo){
        //             colDef.cellStyle = function(params){
        //                 var row = params.node.data;
        //                 let formatConds = colDef.conditionalFormatInfo;
        //                 for(let item of formatConds){
        //                     let checkCondition = eval(item.condition);
        //                     if(checkCondition){
        //                         return item.style;
        //                     }
        //                 }
        //                 return null;
        //             }
        //         }

        //         if(colDef.symperType == 'text'){
        //             colDef.cellRenderer = function(params) {
        //                 // đã xử lý việc loại bỏ html tag trong hàm translate của table, nên chỗ này chỉ cần trả về luôn
        //                 return params.value;
        //             }
        //         }
        //     }
        //     console.log('columnDefs', this.cellConfigs.sharedConfigs.cellId);
        //     return rsl;
        //     // }
        // },
        // options (){
        //     console.log('options', this.cellConfigs.sharedConfigs.cellId);
        //     return this.cellConfigs.viewConfigs.displayOptions;
        // },
        // tableStyle(){
        //     console.log('tableStyle', this.cellConfigs.sharedConfigs.cellId);
        //     let displayOptions = this.cellConfigs.viewConfigs.displayOptions;
        //     return Object.assign({
        //         width: '100%',
        //         height: (displayOptions.contentSize.h - 35)+'px'
        //     }, this.options.cellStyle);
        // }
    },
    components: {
        'ag-grid-vue': AgGridVue,
        Pagination,
        SymperDialogConfirm
    },
    beforeMount() {
        if (
            !this.cellConfigs.rawConfigs.style.groupTable.children
                .groupMultiAutoColumn.value
        ) {
            delete this.autoGroupColumnDef.headerName;
        }
        this.gridOptions = {
            multiSortKey: 'ctrl',
            suppressPropertyNamesCheck: true,
            onRangeSelectionChanged: this.onRangeSelectionChanged,
            groupIncludeFooter:
                this.cellConfigs.rawConfigs.style.subTotal.children.showSubTotal
                    .value &&
                !this.cellConfigs.rawConfigs.style.subTotal.children.showOnTop
                    .value
        };
    },
    mounted() {
        this.gridApi = this.gridOptions.api;
        this.gridColumnApi = this.gridOptions.columnApi;
        this.customColWidths = {}; // lưu lại trạng thái về chiều rộng các cột trong table,khi reload thì lấy đây ra
    },
    data() {
        let self = this;
        return {
            columnNotGroup: -1,
            prependIcon: {
                groupBy: 'mdi-file-tree mdi'
            },
            comfirmGetAllDataInfor: {
                title: '',
                content: '',
                cancel() {},
                confirm() {},
                show: false
            },
            showDialog: false,
            hasRowGroup: false,
            renderHiddenColumnCss: '',
            currentPage: 1,
            isResizing: false,
            customCssPagination: '',
            inPrintingMode: false,
            gridOptions: null,
            gridApi: null,
            columnApi: null,
            modules: [
                RowGroupingModule,
                ClientSideRowModelModule,
                RowGroupingModule
            ],
            defaultColDef: {
                editable: true,
                resizable: true,
                // flex: 1,
                sortable: true
            },
            customRowStyle: null,
            getRowStyle: function (params) {
                let style = {
                    backgroundColor: 'white'
                };
                if (params.node.footer) {
                    if (
                        self.cellConfigs.rawConfigs.style.subTotal.children
                            .showSubTotal.value
                    ) {
                        return self.cellConfigs.viewConfigs.displayOptions
                            .styleConfig.footer;
                    }
                }
                if (params.node.group) {
                    return self.cellConfigs.viewConfigs.displayOptions
                        .styleConfig.parentRow;
                }
                if (params.node.rowPinned) {
                } else {
                    if (self.tableOptions.options.rowFormatCond) {
                        let row = params.node.data;
                        let rowFormatCond =
                            self.tableOptions.options.rowFormatCond;
                        if (row != undefined) {
                            for (let item of rowFormatCond) {
                                if (eval(item.condition)) {
                                    style = Object.assign(style, item.style);
                                }
                            }
                        }
                    } else {
                    }
                }
                return style;
            },
            exporting: false,
            columnTypes: {
                number: {
                    cellRenderer(params) {
                        if (params.data != undefined) {
                            var value = params.data[params.colDef.field];
                            value = value === undefined ? null : value;
                        }
                        if (params.value != undefined && params.node.group) {
                            var value = params.value;
                        }
                        if (value) {
                            if (Number(value) == 0 || value == null) {
                                value =
                                    self.tableOptions.tableStyle
                                        .symperCellConfig.zeroValueDisplay;
                            } else {
                                value = number.thousandsSeparateAndRound(
                                    value,
                                    self.tableOptions.tableStyle
                                        .symperCellConfig.decimalTootip
                                );
                            }
                            return value;
                        } else {
                            value =
                                self.tableOptions.tableStyle.symperCellConfig
                                    .zeroValueDisplay;
                            return value;
                        }
                    }
                },
                text: {},
                date: {},
                datetime: {}
            },
            autoGroupColumnDef: {
                // pinned: 'left',
                filterValueGetter: (params) => {
                    var colGettingGrouped = params.colDef.showRowGroup;
                    var valueForOtherCol = params.api.getValue(
                        colGettingGrouped,
                        params.node
                    );
                    return valueForOtherCol;
                },
                cellRendererParams: {
                    footerValueGetter: (params) => {
                        if (
                            this.cellConfigs.rawConfigs.style.subTotal.children
                                .showSubTotal.value
                        ) {
                            return this.cellConfigs.rawConfigs.style.subTotal
                                .children.totalDisplayrows.value;
                        }
                        return;
                    }
                    // innerRenderer: 'GroupRowCellRenderer'
                },
                headerName:
                    this.cellConfigs.rawConfigs.style.groupTable.children
                        .groupName.value,
                field: ''
            },
            tableOptions: {
                columnDefs: [],
                options: {},
                tableStyle: ''
            }
        };
    }
};
</script>
<style>
.symper-table-report .ag-root {
    border: none !important;
}
.symper-table-report .ag-root ::-webkit-scrollbar {
    height: 10px;
}
.symper-table-report {
    border-style: unset !important;
}
.symper-table-report .ag-root .ag-row {
    border-top: none !important;
    border-bottom-style: solid;
}
.symper-table-report .ag-header-cell,
.symper-table-report .ag-cell {
    padding-left: 6px !important;
    padding-right: 6px !important;
}

.symper-table-dashboard-header::after {
    border-right: none !important;
    width: 0px !important;
}

.symper-table-cell .ag-header {
    border-bottom: none !important;
    background-color: inherit !important;
}

.symper-table-dashboard-header {
    /* padding-left: 6px!important;
    padding-right: 6px!important; */
}
.symper-table-cell .ag-header-icon.ag-header-cell-menu-button {
    position: absolute;
}

.symper-table-cell
    .ag-cell-label-container:hover
    .ag-header-icon.ag-header-cell-menu-button {
    position: relative !important;
}

.symper-table-cell .ag-header-group-cell::after,
.symper-table-cell .symper-table-dashboard-header::after {
    border-right: none !important;
    width: 0px !important;
}

.symper-table-dashboard-header-wraptext .ag-header-cell-text {
    -webkit-line-clamp: 2 !important;
    display: -webkit-box !important;
    -webkit-box-orient: vertical !important;
    white-space: normal !important;
}

.symper-table-cell .ag-floating-bottom {
    overflow-y: unset !important;
}

@media print {
    .ag-layout-normal {
        display: flex !important;
    }
}

@media print {
    .symper-table-cell .ag-floating-bottom {
        /* border-top-width: 0px!important; */
        position: relative;
        top: 10px;
    }
}

@media print {
    .symper-dashboard-layout .ag-root-wrapper,
    .symper-dashboard-layout .ag-root-wrapper-body,
    .symper-dashboard-layout .ag-root,
    .symper-dashboard-layout .ag-body-viewport,
    .symper-dashboard-layout .ag-center-cols-container,
    .symper-dashboard-layout .ag-center-cols-viewport,
    .symper-dashboard-layout .ag-center-cols-clipper,
    .symper-dashboard-layout .ag-body-horizontal-scroll-viewport,
    .symper-dashboard-layout .ag-virtual-list-viewport {
        height: 100% !important;
        overflow: hidden;
    }
}
.symper-table-cell .ag-group-expanded,
.ag-group-contracted {
    padding-left: 0;
}
.symper-table-cell .ag-row-group-indent-1 {
    padding-left: 12px !important;
}
.symper-table-cell .ag-row-group-indent-2 {
    padding-left: 24px !important;
}
.symper-table-cell .ag-row-group-indent-3 {
    padding-left: 36px !important;
}
.symper-table-cell .ag-row-group-indent-4 {
    padding-left: 48px !important;
}
.symper-table-cell .ag-row-group-indent-5 {
    padding-left: 60px !important;
}
.symper-table-cell .ag-row-group-indent-6 {
    padding-left: 72px !important;
}
.symper-table-cell .ag-row-group-indent-7 {
    padding-left: 84px !important;
}
.symper-table-cell .ag-row-group-indent-8 {
    padding-left: 96px !important;
}
.symper-table-cell .ag-row-group-indent-9 {
    padding-left: 108px !important;
}
.symper-table-cell .ag-row-group-indent-10 {
    padding-left: 120px !important;
}
/* .ag-cell .ag-icon {
    padding-bottom: 6px;
}
ag-cell-wrapper ag-cell-expandable ag-row-group ag-row-group-indent-1
.ag-group-expanded,
.ag-group-contracted {
    padding-left: 0px !important;
    margin-right: 5px !important;
} */
/* .symper-table-cell.ag-theme-balham
    .ag-cell-wrapper
    > *:not(.ag-cell-value):not(.ag-group-value)
    .ag-icon {
    margin-bottom: 2px !important;
} */
.ag-icon-tree-closed {
    padding-bottom: 6px !important;
}
.ag-icon-tree-open {
    padding-bottom: 6px !important;
}
.symper-table-cell.ag-theme-balham .ag-ltr .ag-row-drag,
.ag-theme-balham .ag-ltr .ag-selection-checkbox,
.ag-theme-balham .ag-ltr .ag-group-expanded,
.ag-theme-balham .ag-ltr .ag-group-contracted {
    margin-right: 4px !important;
}
.symper-table-report .ag-root .ag-row {
    border-right: #d9dcde 1px solid;
}
.total {
    color: black;
}
</style>

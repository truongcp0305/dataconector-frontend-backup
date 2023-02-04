<template>
    <div class="h-100">
        <Preloader v-show="loading"></Preloader>
        <div class="h-100 w-100 d-flex flex-column">
            <ag-grid-vue
                :style="{
                    width: '100%',
                    height: '100%'
                }"
                :class="{
                    'ag-theme-balham h-100': true,
                    'tree-config-showlist': true
                }"
                :frameworkComponents="frameworkComponents"
                :gridOptions="gridOptions"
                :columnDefs="columnDefTreeConfig"
                groupDefaultExpanded="1"
                @cell-double-clicked="cellDoubleClick"
                @cell-clicked="cellDoubleClick"
                :rowData="rowData"
                @grid-ready="onGridReady"
            >
            </ag-grid-vue>
            <Pagination
                :total="parseInt(totalObject)"
                :totalVisible="7"
                :pageSizeOptions="[300, 500, 1000]"
                class="mb-1 mt-2"
                :style="{
                    'padding-bottom': paddingBottom
                }"
                :showRange="false"
                :shortMode="true"
                @on-change-page-size="changePageSize"
                @on-change-page="changePage"
            ></Pagination>
        </div>
    </div>
</template>
<script>
import { AgGridVue } from 'ag-grid-vue';
import { util } from '@/plugins/util';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import Pagination from '@/components/common/Pagination';
import PerfectScrollbar from 'perfect-scrollbar';
import CustomHeaderTreeView from '@/components/common/agDataTable/CustomAgGrid/customHeaderTreeView.vue';
import Preloader from '@/components/common/Preloader';
let CustomHeaderVue = Vue.extend(CustomHeaderTreeView);
export default {
    props: {
        treeviewWidth: {
            type: Number
        },
        selectedRow: {
            type: Object,
            default: function () {
                return {};
            }
        },
        paddingBottom: {
            type: String,
            default: '0px'
        },
        rowData: {
            type: Array,
            default: function () {
                return [
                    {
                        columnsData: ['Erica Rogers']
                    }
                ];
            }
        },
        totalObject: {
            type: [String, Number],
            default: 0
        },
        controlUsers: {
            type: Object,
            default: function () {
                return {
                    document_object_user_created_id: true,
                    document_object_last_user_update_id: true
                };
            }
        },
        columnTreeConfig: {
            type: Array,
            default: function () {
                return [
                    {
                        columnsData: ['Erica Rogers']
                    }
                ];
            }
        },
        autoGroupField: {
            type: String,
            default: ''
        },
        headerNameTable: {
            type: String,
            default: ''
        },
        instanceKey: {
            type: [String, Number]
        }
    },
    data() {
        return {
            gridOptions: null,
            columnDefs: [],
            getDataPath: null,
            agApi: null,
            frameworkComponents: null,
            loading: true
        };
    },
    computed: {
        columnDefTreeConfig() {
            let cloneColumnTreeConfig = this.columnTreeConfig;
            if (
                cloneColumnTreeConfig.length &&
                cloneColumnTreeConfig[0].field != 'all'
            ) {
                cloneColumnTreeConfig.unshift({
                    field: 'all',
                    hide: true,
                    rowGroup: true,
                    // cellRendererParams: { suppressDoubleClickExpand: true },
                    type: 'user'
                });
            }
            return cloneColumnTreeConfig;
        }
    },
    created() {},
    components: {
        AgGridVue,
        Pagination,
        Preloader
    },
    watch: {
        // autoGroupField(val) {
        //     this.$set(this.gridOptions.autoGroupColumnDef, "field", val);
        //     setTimeout(
        //         (self) => {
        //             self.refreshAutoGroupOptions();
        //         },
        //         1000,
        //         this
        //     );
        // },
        selectedRow(newVal) {
            this.agApi.forEachNode((node) => {
                if (node.childrenAfterGroup) {
                    return;
                }
                if (!node.data) {
                    // nếu không có các con thì sẽ set các lớp cha không được highlight
                    return;
                }
                // nếu có data
                let matchingRow = Object.keys(node.data).map((a) => {
                    if (a == 'all') {
                        return true;
                    }
                    return node.data[a] == newVal[a];
                });
                //nếu data của lớp con trùng với data của treeview
                if (matchingRow.filter((a) => a).length == matchingRow.length) {
                    this.setTreeFamilyOfRow(node, true);
                } else {
                    if (
                        node.highlighted == true &&
                        matchingRow.filter((a) => a).length !==
                            matchingRow.length
                    ) {
                        this.setTreeFamilyOfRow(node, false);
                    }
                }
            });
        }
    },
    beforeMount() {
        let self = this;
        this.frameworkComponents = {
            agColumnHeader: CustomHeaderVue
        };
        this.gridOptions = {
            defaultColDef: {
                flex: 1,
                minWidth: 250,
                filter: true,
                sortable: true,
                resizable: true,
                headerComponentParams: { instanceKey: this.instanceKey }
            },

            autoGroupColumnDef: {
                headerName: this.headerNameTable,
                minWidth: 250,
                width: this.treeviewWidth,
                field: this.autoGroupField,
                cellRendererParams: {
                    suppressCount: true,
                    innerRenderer: function (params) {
                        var label = params.value
                            ? params.value
                            : self.$t('v2.showlist.empty');
                        if (params.node.group) {
                            return (
                                '<span class="row-group-cell-render"><span class="content" style="overflow: hidden;">' +
                                label +
                                '</span><span class="count"> (' +
                                params.node.childrenAfterFilter.length +
                                ')</span>'
                            );
                        }
                        return (
                            '<span class="row-group-cell-render"><span class="content" style="overflow: hidden;">' +
                            label +
                            '</span>'
                        );
                    }
                }
            },
            rowHeight: 21,
            // overlayLoadingTemplate:
            //     '<span class="ag-overlay-loading-center">Đang tải dữ liệu....</span>',
            overlayNoRowsTemplate: `<span class="ag-overlay-loading-center">${this.$t(
                'v2.showlist.configLevelWarning'
            )}</span>`,
            // rowClassRules: {
            //     'highlighted-row': (params) => {
            //         console.log(params);
            //         return true;
            //     },
            // },
            getRowStyle: (params) => {
                let style = {};
                if (params.node.highlighted) {
                    style['background-color'] = '#dbe7fe'; // { 'background-color': '#dbe7fe' };
                } else {
                    style['background-color'] = 'white';
                }
                return style;
            }
        };
    },
    methods: {
        setTreeFamilyOfRow(node, status) {
            node.highlighted = status;
            node.setData(node.data);
            if (node.parent) {
                let newStatus = status;
                if (status == false) {
                    node.parent.childrenAfterGroup.some((a) => {
                        if (a.highlighted) {
                            newStatus = true;
                            return true;
                        }
                    });
                }
                if (node.parent.highlighted == newStatus) {
                    return;
                }
                this.setTreeFamilyOfRow(node.parent, newStatus);
            }
        },
        refreshAutoGroupOptions() {
            var colstate = this.gridOptions.columnApi.getColumnState();
            var colstateclear = this.gridOptions.columnApi.getColumnState();
            // Clear groupings
            var x = 0,
                xcount = colstateclear.length;
            while (x < xcount) {
                colstateclear[x].rowGroupIndex = null;
                x += 1;
            }
            this.gridOptions.columnApi.setColumnState(colstateclear);

            // Reset groupings
            this.gridOptions.columnApi.setColumnState(colstate);
        },
        refreshData(columns) {
            this.gridOptions.api.clearFocusedCell();
            this.columns = columns;
            this.gridOptions.api.refreshCells();
            this.autoSizeAll(false);
        },
        handleCellDblClick(params) {},
        refreshCell(rowNode, key, value) {
            this.gridOptions.api.clearFocusedCell();
            rowNode.setDataValue(key, value);
            this.gridOptions.api.refreshCells({ columns: [key] });
        },
        hideOverlay() {
            this.agApi.hideOverlay();
        },
        autoSizeAll(skipHeader) {
            var allColumnIds = [];
            this.gridOptions.columnApi
                .getAllColumns()
                .forEach(function (column) {
                    allColumnIds.push(column.colId);
                });
            this.gridOptions.columnApi.autoSizeColumns(
                allColumnIds,
                skipHeader
            );
        },
        changePageSize(vl) {
            this.$emit('tree-change-page-size', vl);
        },
        changePage(vl) {
            this.$emit('tree-change-page', vl);
        },
        cellDoubleClick(params) {
            let arr = [];
            //trường hợp click cấp lớn nhất
            if (params.node.level == this.columnTreeConfig.length - 1) {
                let data = {};
                this.columnTreeConfig.map((col) => {
                    data[col.field] = util.cloneDeep(params.data)[col.field];
                });
                //xóa đi các trường phái sinh từ user
                Object.keys(this.controlUsers).map((col) => {
                    if (data.hasOwnProperty(col)) {
                        let id = data[col + 'Id'];
                        data[col] = id;
                        delete data[col + 'Id'];
                    }
                });
                Object.keys(data).map((field) => {
                    arr.push({ key: field, value: data[field] });
                });
            } else {
                arr = this.getAllItemFilter(params.node, arr);
                //vì chỉ có cấp con cuối cùng mới có trường data
            }

            this.$emit('on-cell-dbl-click', arr);
        },

        getAllItemFilter(node, arr) {
            let obj = {
                key: node.field,
                value: node.key
            };
            arr.push(obj);
            if (node.level > 0 && node.parent) {
                this.getAllItemFilter(node.parent, arr);
            }
            let arrForFilter = [];
            let data = util.cloneDeep(this.getUserField(node));
            Object.keys(this.controlUsers).map((col) => {
                if (data[col]) {
                    let id = data[col + 'Id'];
                    data[col] = id;
                    delete data[col + 'Id'];
                }
            });
            Object.keys(data).map((field) => {
                if (arr.some((col) => col.key == field)) {
                    arrForFilter.push({ key: field, value: data[field] });
                }
            });

            return arrForFilter;
        },
        getUserField(node) {
            if (node.level == this.columnTreeConfig.length - 1) {
                let data = node.data;
                return data;
            }
            return this.getUserField(node.childrenAfterFilter[0]);
        },
        onGridReady(param) {
            this.$emit('grid-ready', param);
            this.agApi = param.api;
            this.addPerfectScrollbar();
        },
        showLoadingOverlay() {
            this.agApi.showLoadingOverlay();
        },
        addPerfectScrollbar() {
            const agBodyViewport = document.querySelector(
                '.ag-theme-balham .ag-body-viewport'
            );
            const agBodyHorizontalViewport = document.querySelector(
                '.ag-theme-balham .ag-body-horizontal-scroll-viewport'
            );
            if (agBodyViewport) {
                const ps = new PerfectScrollbar(agBodyViewport);
                ps.update();
            }
            if (agBodyHorizontalViewport) {
                const ps = new PerfectScrollbar(agBodyHorizontalViewport);
                ps.update();
            }
        }
    }
};
</script>
<style scoped>
.tree-config-showlist >>> .ag-row {
    border-top-style: unset !important;
}
.content {
    overflow: hidden !important;
}
.tree-config-showlist >>> .ag-row-group-indent-1 {
    padding-left: 12px !important;
}
.tree-config-showlist >>> .ag-row-group-indent-2 {
    padding-left: 24px !important;
}
.tree-config-showlist >>> .ag-row-group-indent-3 {
    padding-left: 36px !important;
}
.tree-config-showlist >>> .ag-row-group-indent-4 {
    padding-left: 48px !important;
}
.tree-config-showlist >>> .ag-row-group-indent-5 {
    padding-left: 60px !important;
}
.tree-config-showlist >>> .ag-row-group-indent-6 {
    padding-left: 60px !important;
}
.tree-config-showlist >>> .ag-row-group-indent-7 {
    padding-left: 60px !important;
}
.tree-config-showlist >>> .ag-row-group-leaf-indent {
    margin-left: 10px !important;
}
.tree-config-showlist >>> .ag-theme-balham .ag-root-wrapper {
    border: unset !important;
}
.tree-config-showlist >>> .ag-cell {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.tree-config-showlist >>> .ag-header {
    border: unset !important;
}
.tree-config-showlist >>> .ag-row {
    border-radius: 4px;
    border-bottom-style: unset !important;
}
.tree-config-showlist >>> .ag-row:hover {
    border-radius: 4px;
}
.tree-config-showlist >>> .ag-cell {
    line-height: unset !important;
    padding-left: 3px;
}
.tree-config-showlist >>> .ag-header {
    height: 28px !important;
    min-height: unset !important;
    background-color: #ffffff !important;
    /* border-top: 1px solid lightgray !important; */
    border-bottom: 1px solid lightgray !important;
}
.tree-config-showlist >>> .ag-header-row {
    height: 26px !important;
}
.tree-config-showlist >>> .ag-row-selected {
    background-color: #ffffff !important;
}
.tree-config-showlist >>> .ag-root-wrapper {
    border: none !important;
}
.tree-config-showlist >>> .ag-header-container {
    background-color: #f4f4f4;
}
.tree-config-showlist
    >>> .ag-cell
    .ag-cell-wrapper
    .ag-group-contracted
    .ag-icon,
.tree-config-showlist
    >>> .ag-cell
    .ag-cell-wrapper
    .ag-group-expanded
    .ag-icon {
    margin-bottom: 13px !important;
}
.tree-config-showlist >>> .ag-group-child-count {
    margin-top: -5px !important;
}
.tree-config-showlist >>> .ag-group-expanded {
    padding-left: 0px;
    margin-right: 5px;
}
.tree-config-showlist >>> .ag-group-contracted {
    padding-left: 0px;
    margin-right: 5px;
}
.tree-config-showlist
    >>> .ag-row-group
    > .ag-group-value
    > span
    > .row-group-cell-render {
    color: black !important;
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.tree-config-showlist >>> .ag-theme-balham .ag-ltr {
    margin-left: -10px;
}
.tree-config-showlist
    >>> .ag-row-group
    > .ag-group-value
    > span
    > .row-group-cell-render
    > .count {
    padding-left: 3px;
}
</style>

<template>
    <div>
        <div class="w-100 d-flex justify-space-between">
            <div class="fs-14 pt-2">{{ config.name }}</div>

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
                        @focus="handleSearchFocused"
                        @blur="handleSearchBlured"
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
                    ><span class="fs-12 font-weight-medium"
                        >{{$t('v2.doc.searchOnFields')}} : <br /></span
                    >{{ tooltipSearch }}</span
                >
            </v-tooltip>
        </div>
        <div class="w-100 mt-2 position-relative">
            <preloader :size="20" class="position-absolute" v-if="loading" />
            <div
                ref="table"
                class="ag-theme-balham"
                style="height: 200px"
            ></div>
        </div>
    </div>
</template>

<script>
import SearchBox from '@/components/common/SearchBox.vue';
var Grid, ClientSideRowModelModule, RowGroupingModule, ClipboardModule;
import { loadRemoteModule } from '@/plugins/utilModules/remoteModuleLoad.js';
import _cloneDeep from 'lodash/cloneDeep';

// import { Grid } from 'ag-grid-community';
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
// import { ClipboardModule } from '@ag-grid-enterprise/clipboard';

import { formulasApi } from '@/api/Formulas';
import Preloader from '@/components/common/Preloader.vue';

export default {
    computed: {
        tooltipSearch() {
            return this.config.colSearch
                .reduce((arr, el) => {
                    arr.push(typeof el == 'string' ? el : el.name);
                    return arr;
                }, [])
                .join(' , ');
        }
    },
    data() {
        return {
            loading: true,
            searchKey: '',
            showSearchTooltip: false
        };
    },
    async mounted() {
        let remoteAggridModules = await loadRemoteModule('aggrid/modules');
        Grid = remoteAggridModules.Grid;
        ClientSideRowModelModule = remoteAggridModules.ClientSideRowModelModule;
        RowGroupingModule = remoteAggridModules.RowGroupingModule;
        ClipboardModule = remoteAggridModules.ClipboardModule;

        this.initTable();
        this.getDataFromConfig();
    },
    methods: {
        handleSearchBlured() {
            this.showSearchTooltip = false;
        },
        handleSearchFocused() {
            this.showSearchTooltip = true;
        },
        resetSearchValue() {
            this.searchKey = '';
        },
        handleSearch(value) {
            this.getDataFromConfig(value);
        },
        getColumnDefs() {
            let cols = _cloneDeep(this.config.col);
            let config = this.config;
            let self = this;
            cols.map((el) => {
                // Thêm rowgroup vào các cột được cấu hình
                if (config.rowGroup.includes(el.field)) {
                    el.rowGroup = true;
                    el.hide = true;
                }
                delete el.id;
                delete el.name;
                el.resizable = true;
            });

            cols = [
                {
                    maxWidth: 40,
                    pinned: 'left',
                    rowDrag: true,
                    // rowDragText
                    suppressMenu: true,
                    rowDragText: (params, dragItemCount) => {
                        let selectedItemCount =
                            self.gridOptions.api.getSelectedNodes().length;
                        return (
                            (selectedItemCount ? selectedItemCount : 1) +
                            ' '+self.$t('v2.doc.rowSelected')
                        );
                    }
                },
                {
                    checkboxSelection: true,
                    headerCheckboxSelection: true,
                    maxWidth: 50,
                    pinned: 'left',
                    suppressMenu: true
                },
                ...cols
            ];
            this.tableColumns = cols;
            return this.tableColumns;
        },
        async getDataFromConfig(searchKey = '') {
            this.loading = true;
            let formula = this.config.formula;
            if (String(searchKey).trim()) {
                let cond = this.config.colSearch.reduce((arr, el) => {
                    arr.push(
                        `"${
                            typeof el == 'string' ? el : el.name
                        }"::text ILIKE '%${searchKey}%'`
                    );
                    return arr;
                }, []);
                cond = cond.join(' OR ');
                formula = `SELECT * FROM (${formula}) tb WHERE ${cond}`;
            }
            formula += ' LIMIT 300';
            try {
                let res = await formulasApi.execute({
                    formula: formula,
                    distinct: false
                });
                this.tableData = res.data.data;
                this.setTableData(res.data.data);
            } catch (error) {
                this.$snotifyError(
                    error,
                    this.$t('v2.doc.errorRetrievingDataForSourceTable')+ ' ' + this.config.key
                );
            } finally {
                this.loading = false;
            }
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
                groupDefaultExpanded: -1,
                suppressMoveWhenRowDragging: true,
                animateRows: true,
                defaultColDef: {
                    flex: 1,
                    minWidth: 100,
                    sortable: true,
                    filter: true,
                    resizable: true
                },
                columnDefs: this.getColumnDefs(),
                onGridReady: (params) => {
                    self.$emit('grid-ready', {
                        option: params,
                        id: self.id
                    });
                },
                getRowId: (params) => params.data[self.config.identityColumn]
            };
            this.agInstance = new Grid(this.$refs.table, this.gridOptions);
        }
    },
    components: {
        SearchBox,
        Preloader
    },
    props: {
        config: {
            type: Object,
            default: () => {
                return {};
            }
        },
        id: {
            type: String,
            default: ''
        }
    }
};
</script>

<style>
.ag-dnd-ghost.ag-unselectable {
    z-index: 999;
}
</style>
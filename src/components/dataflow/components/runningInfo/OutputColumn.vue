<template>
    <div class="dataflow-output-column-table  h-100" ref="dataflowOutputColumnTable"> 
        <div  style="height:50px ;width: 100%;position: relative;">
            <v-text-field
            v-model="searchKey"
            class="d-inline-block mr-2 sym-small-size search-output-column"
            ref="searchOutputColumn"
            single-line
            :append-icon="$i('input.search')"
            outlined
            dense
            :style="{
                'right':'30px',
                position: 'absolute',
            }"
            :placeholder="$t('v2.dataflow.search')"
        ></v-text-field>
        </div>
        <div class="ml-2 mt-2 mr-2">
            <ag-grid-vue
                :style="{
                    width: '100%',
                    height: contentRunningHeight - 60 + 'px',
                }"
                :class="{ 'ag-theme-balham': true }"
                :defaultColDef="defaultColDef"
                :gridOptions="gridOptions"
                :columnDefs="columnDefs"
                :rowData="tableData"
                @cell-context-menu="cellContextMenu"
            >
            </ag-grid-vue>
        </div>
    </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue';
export default {
    data() {
        return {
            defaultColDef: null,
            gridOptions: null,
            columnDefs: [
                {
                    headerName: this.$t('v2.dataflow.name'),
                    field: 'columnName',
                    columnTitle: 'table.id',
                    width: 50,
                },
                {
                    headerName: this.$t('v2.dataflow.type'),
                    field: 'type',
                    columnTitle: 'table.id',
                },
                {
                    headerName: this.$t('v2.dataflow.title'),
                    field: 'title',
                    columnTitle: 'table.id',
                },
            ],
            tableHeight: 400,
            searchKey: '',
        };
    },
    methods: {
        cellContextMenu(params) {},
    },
    props: {
        action: {
            default: 'create',
        },
        instanceKey: {
            default: '',
        },
        contentRunningHeight: {
            type: Number,
            default: 0,
        },
    },
    watch: {},
    mounted() {
    },
    computed: {
        tableData() {
            let keyToSearch = ['columnName', 'type', 'title'];
            let rowData =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .selectedWidget.output;
            if (!Array.isArray(rowData)) {
                return [];
            }
            let self = this;
            let searchKey = self.searchKey.toLowerCase();
            if (this.searchKey == '') {
                return rowData;
            } else {
                let arr = [];
                rowData.forEach(function (e) {
                    for (let i of keyToSearch) {
                        if (e[i].toLowerCase().includes(searchKey)) {
                            arr.push(e);
                            break;
                        }
                    }
                });
                return arr;
            }
        },
    },
    beforeMount() {
        this.defaultColDef = {
            minWidth: 40,
            filter: true,
            sortable: true,
            resizable: true,
            wrapText: true,
            flex: 1,
            autoHeight: true,
        };
        this.gridOptions = {
            enableRangeSelection: true,
            getRowStyle: function (params) {
                if (params.data.added) {
                    return { background: '#53bd5357' };
                }
            },
        };
    },
    components: {
        AgGridVue,
    },
};
</script>

<style scoped>
.dataflow-output-column-table >>> .v-input__control .v-input__slot label,
.dataflow-output-column-table >>> .v-input__control .v-input__slot .v-icon,
.dataflow-output-column-table >>> .v-input__control .v-input__slot input {
    font: 13px roboto;
}
.dataflow-output-column-table >>> .v-input__control .v-text-field__details {
    display: none;
}
.dataflow-output-column-table >>> .v-input__control {
    margin: 4px 12px 4px 8px;
    min-height: unset;
}
.dataflow-output-column-table >>> .v-input__control .v-input__slot {
    box-shadow: unset !important;
    margin-top: 8px;
    border: 1px solid lightgray;
}
</style>

<template>
    <div class="w-100 h-100">
        <div class="w-100 mt-1">
            <ListItemSelector
                :name="$t('kanban.select_kanban')"
                :listItem="itemData.listKanban"
                @item-selected="handleClickItem"
                @list-item-selected="handleSelectListItem"
                :values="listSelectedStateFlow"
                :showBtn="itemData.action != 'view' ? true : false"
            />
            <!-- <Preloader  v-show="loadingTable"
				style="position:static!important"
				class="mx-auto" /> -->
            <ag-grid-vue
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :style="{ height: gridOptions.containerHeight + 'px' }"
                :gridOptions="gridOptions"
                :getContextMenuItems="getContextMenuItems"
                :rowData="rowData"
                @cell-key-down="onCellKeyDown"
                class="ag-theme-balham agrid-table mt-2 w-100"
            >
            </ag-grid-vue>
        </div>
    </div>
</template>
<script>
import { AgGridVue } from 'ag-grid-vue';
import ListItemSelector from './ListItemSelector.vue';
export default {
    props: {
        listSelectedStateFlow: {
            type: Array,
            default() {
                return [];
            },
        },
        gridOptions: {
            type: Object,
            default() {
                return {};
            },
        },
        defaultColDef: {
            type: Object,
            default() {
                return {};
            },
        },
        itemData: {
            type: Object,
            default() {
                return {};
            },
        },
        columnDefs: {
            type: Array,
            default() {
                return [];
            },
        },
        rowData: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    components: {
        ListItemSelector,
        'ag-grid-vue': AgGridVue,
    },
    data() {
        return {
            rowTable: [],
            active: '',
            selectedKanban:
                this.listSelectedStateFlow.length > 0
                    ? this.listSelectedStateFlow[0].id
                    : [],
            loadingTable: false,
            columnTable: [],
        };
    },
    mounted() {
        const self = this;
        this.$evtBus.$on('set-app-info', (app) => {
            if (app.app) {
                self.selectedKanban = app.app;
            }
        });
    },
    watch: {},
    methods: {
        onCellKeyDown(params) {
            this.$evtBus.$emit('on-cell-key-down', params);
        },
        getContextMenuItems(params) {
            let submitContextItem = [];
            return submitContextItem;
        },
        handleClickItem(value) {
            this.selectedKanban = value;
            this.$emit('kanban-selected', value);
        },
        // khi chọn danh sách app
        handleSelectListItem(lists) {
            this.$emit('list-item-selected', lists);
        },
    },
};
</script>

<style scoped>
.title-children-application {
    cursor: pointer;
    margin-left: auto;
    margin-right: auto;
}
.title-children-application:hover {
    background-color: #f7f7f7;
}
.title-children-application-active {
    background-color: #f0f0f0;
}
.ag-theme-balham >>> .ag-root-wrapper {
    border: none !important;
}
</style>

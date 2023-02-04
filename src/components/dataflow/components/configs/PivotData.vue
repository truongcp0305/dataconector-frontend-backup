<template>
    <div class="w-100">
        <v-text-field
            v-model="searchKey"
            v-on:input="onSearch($event)"
            class="d-inline-block pa-2 sym-small-size"
            single-line
            append-icon="mdi-magnify"
            outlined
            hide-details
            dense
            flat
            label="Search"
            :placeholder="$t('common.search')"
            style="width: inherit"
        ></v-text-field>
        <div style="height: 150px">
            <span class="font-weight-medium ml-2"
                >{{$t('v2.dataflow.allColumns')}} ({{ nodeData.configs.allColumns.length }})</span
            >
            <VuePerfectScrollbar style="height: calc(100% - 16px)">
                <drag-columns
                    :searchKey="searchKey"
                    :columns="nodeData.configs.allColumns"
                    :putable="false"
                    :deleteItem="false"
                />
            </VuePerfectScrollbar>
        </div>
        <div class="mt-1" style="height: 70px">
            <span class="font-weight-medium ml-2"
                >{{$t('v2.dataflow.columns')}} ({{ nodeData.configs.columns.length }})</span
            >
            <VuePerfectScrollbar
                style="height: calc(100% - 16px); background: #fcfcfc"
            >
                <drag-columns
                    :searchKey="searchKey"
                    :pullMethod="null"
                    :columns="nodeData.configs.columns"
                    @drag-add-item="changeData"
                    @drag-remove-item="changeData"
                />
            </VuePerfectScrollbar>
        </div>
        <div class="mt-1" style="height: 70px">
            <span class="font-weight-medium ml-2"
                >{{$t('v2.dataflow.rows')}} ({{ nodeData.configs.rows.length }})</span
            >
            <VuePerfectScrollbar
                style="height: calc(100% - 16px); background: #fcfcfc"
            >
                <drag-columns
                    :searchKey="searchKey"
                    :pullMethod="null"
                    :columns="nodeData.configs.rows"
                    @drag-add-item="changeData"
                    @drag-remove-item="changeData"
                />
            </VuePerfectScrollbar>
        </div>
        <div class="mt-1" style="height: 70px">
            <span class="font-weight-medium ml-2"
                >{{$t('v2.dataflow.values')}} ({{ nodeData.configs.values.length }})</span
            >
            <VuePerfectScrollbar
                style="height: calc(100% - 16px); background: #fcfcfc"
            >
                <drag-columns
                    :searchKey="searchKey"
                    :pullMethod="null"
                    :columns="nodeData.configs.values"
                    @drag-add-item="changeData"
                    @drag-remove-item="changeData"
                />
            </VuePerfectScrollbar>
        </div>
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import DragColumns from '../../../common/bi/DragColumns.vue';
export default {
    components: {
        VuePerfectScrollbar,
        DragColumns,
    },
    props: {
        nodeData: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            panelAllColumns: [0],
            panelColumns: [0],
            panelRows: [0],
            panelValues: [0],
            searchKey: '',
        };
    },
    methods: {
        onSearch(vl) {
            this.panelAllColumns = [0];
            this.panelColumns = [0];
            this.panelRows = [0];
            this.panelValues = [0];
        },
        changeData() {
            this.$emit('change-configs');
        },
    },
};
</script>

<style scoped>
.v-expand-header {
    min-height: 25px;
}
.v-expansion-panel-header {
    min-height: 25px;
}
.sym-v-expand-content >>> .v-expansion-panel-content__wrap {
    padding: 0px;
    padding-left: 8px;
}
.font-weight-medium {
    font-size: 13px;
}
</style>

<template>
    <v-dialog
        v-model="showDialog"
        persistent
        :max-width="maxWidth"
        style="z-index: 1001"
    >
        <div
            class="group-detail-container"
            style="height: 650px; max-width: 550px; background: white"
        >
            <div class="group-series-header">
                <span>{{ groupName }}</span>
                <div>
                    <v-icon small @click="close">mdi-close</v-icon>
                </div>
            </div>
            <div class="group-series-table">
                <ag-grid-vue
                    style="width: 530px; height: 500px"
                    class="ag-theme-balham"
                    :columnDefs="columnDefs"
                    :rowData="groupData"
                />
            </div>
        </div>
    </v-dialog>
</template>

<script>
import TableDataAgGrid from '@/components/common/agDataTable/TableDataAgGrid';
import { AgGridVue } from 'ag-grid-vue';

export default {
    name: 'groupSeriesDetail',
    data() {
        return {
            showDialog: true
        };
    },
    watch: {},
    computed: {
        columnDefs() {
            let columnDefs = [
                {
                    field: 'name',
                    headerName: this.$t('common.name')
                },
                {
                    field: 'y',
                    headerName: this.$t('v2.dashboard.value')
                }
            ];
            if (this.chartType == 'donut' || this.chartType == 'pie') {
                columnDefs.push({
                    field: 'percent',
                    headerName: this.$t('v2.dashboard.percent')
                });
            }
            return columnDefs;
        }
    },
    props: {
        maxWidth: {
            type: Number,
            default: 550
        },
        groupName: {
            type: String,
            default: ''
        },
        groupData: {
            type: Array,
            default() {
                return [];
            }
        },
        chartType: {
            type: String,
            default: ''
        }
    },
    components: {
        TableDataAgGrid,
        AgGridVue
    },
    methods: {
        close() {
            this.$emit('close-detail');
        }
    }
};
</script>

<style scoped>
.group-detail-container {
    padding: 20px;
}
.group-series-header {
    display: flex;
    justify-content: space-between;
    padding: 10px 10px 20px 10px;
}
.group-series-table {
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>

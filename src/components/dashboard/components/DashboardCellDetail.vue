<template>
    <v-dialog
        v-model="showDialog"
        class="h-100 w-100"
        content-class="overflow-hidden"
    >
        <div
            class="d-flex flex-column ml-1 w-100 bg-white"
            style="height: 700px"
        >
            <div
                class="d-flex border-bottom-1 w-100 align-items-center"
                style="height: 30px"
            >
                <div class="flex-grow-1 d-flex border-left-1 fs-15">
                    <div class="mt-1">
                        <span class="ml-3" style="color: orange">
                            {{ dashboardTitle }}
                        </span>
                    </div>
                </div>
                <v-btn icon tile small class="mr-1" @click="print">
                    <v-icon small> mdi-printer </v-icon>
                </v-btn>
                <v-btn icon tile small class="mr-1" @click="exportExcel">
                    <v-icon small> mdi-microsoft-excel </v-icon>
                </v-btn>
                <v-btn icon tile small class="mr-1" @click="hide">
                    <v-icon small> mdi-close </v-icon>
                </v-btn>
            </div>
            <div class="d-flex w-100 mt-3" style="height: calc(100% - 54px)">
                <div
                    :style="{
                        width: '50%'
                    }"
                    class="ml-3"
                >
                
                    <div v-if="loadingChart" class="h-100 w-100 position-relative">
                        <Preloader :size="40" />
                    </div>
                    <DashboardCell
                        :style="{
                            opacity: loadingChart ? 0 : 1
                        }"
                        :layoutItem="item"
                        ref="dashboardCell"
                        :instanceKey="instanceKey"
                        :cellConfigs="dashboardConfig.allCellConfigs[item.cellId]"
                    />
                </div>
                <div
                    style="width: 50%"
                    class="h-100"
                >
                    <AgGridVue
                        style="width: calc(100% - 30px)"
                        class="ag-theme-balham h-100 ml-3"
                        :columnDefs="columnDefs"
                        :rowData="rowData"
                        :suppressFieldDotNotation="true"
                    />
                </div>
            </div>
        </div>
    </v-dialog>
</template>

<script>
import DashboardCell from '@/components/dashboard/components/DashboardCell.vue';
import TableDataAgGrid from '@/components/common/agDataTable/TableDataAgGrid';
import { AgGridVue } from 'ag-grid-vue';
import Preloader from '@/components/common/Preloader.vue';


export default {
    data() {
        return {
            showDialog: false,
            loadingChart: true
        };
    },
    watch: {
        'item.cellId': {
            handler(){
                let self = this;
                self.loadingChart = true;
                setTimeout(() => {
                    self.$evtBus.$emit('dashboard-resize-report', {
                        instanceKey: self.instanceKey,
                        singleApply: true,
                        applyCellId: self.item.cellId
                    });
                    self.loadingChart = false;
                }, 1000);
            }
        }
    },
    computed: {
        dashboardTitle() {
            if (this.item && this.item.cellId) {
                return this.dashboardConfig.allCellConfigs[this.item.cellId]
                    .viewConfigs.displayOptions.symperTitle.text;
            } else {
                return '';
            }
        },
        rowData() {
            if (this.item && this.item.cellId) {
                return this.dashboardConfig.allCellConfigs[this.item.cellId]
                    .sharedConfigs.data;
            } else {
                return [];
            }
        },
        columnDefs() {
            let arr = [];
            if (this.item && this.item.cellId) {
                let rows =
                    this.dashboardConfig.allCellConfigs[this.item.cellId]
                        .sharedConfigs.data;
                if (rows.length > 0) {
                    for (let i in rows[0]) {
                        let obj = {
                            headerName: i,
                            field: i,
                        };
                        arr.push(obj);
                    }
                }
            }

            return arr;
        },
    },
    props: {
        item: {
            type: Object,
            default() {
                return {};
            },
        },
        dashboardConfig: {
            type: Object,
            default() {
                return {};
            },
        },
        instanceKey: {
            defaul: '',
        },
    },
    components: {
        DashboardCell,
        TableDataAgGrid,
        AgGridVue,
        Preloader
    },
    methods: {
        backToDashboard() {
            this.$emit('back-to-dashboard');
        },
        print() {
            this.$refs.dashboardCell.handlePrintReport();
        },

        exportExcel() {
            this.$emit('download-excel');
        },
        show() {
            this.showDialog = true;
        },
        hide() {
            this.showDialog = false;
        },
    },
};
</script>

<style></style>

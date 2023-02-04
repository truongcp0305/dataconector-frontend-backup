<template>
    <v-dialog
        v-model="showDialog"
        v-if="showDialog"
        persistent
        content-class="dataset-tracing-popup d-flex flex-column bg-white overflow-hidden"
    >
        <div class="d-flex">
            <div class="flex-grow-1 ml-2 mt-1">
                <v-menu
                    :offset-y="true"
                    nudge-bottom="0"
                    :close-on-content-click="false"
                >
                    <template v-slot:activator="{ on: menu, attrs }">
                        <v-tooltip bottom z-index="200">
                            <template v-slot:activator="{ on: tooltip }">
                                <v-btn
                                    x-small
                                    text
                                    v-bind="attrs"
                                    depressed
                                    v-on="{ ...tooltip, ...menu }"
                                >
                                    <div
                                        class="
                                            title-document-autocomplete
                                            fs-13
                                        "
                                        style="
                                            font-weight: 400 !important ;
                                            color: orange;
                                        "
                                    >
                                        {{
                                            selectedDataset.aliasName
                                                ? selectedDataset.aliasName
                                                : selectedDataset.alias_name
                                        }}
                                    </div>
                                </v-btn>
                            </template>
                            <span>{{ $t('v2.dashboard.switchDoc') }}</span>
                        </v-tooltip>
                    </template>
                    <div class="bg-white" style="width: 270px">
                        <div class="mt-1 mb-1">
                            <v-icon class="ml-3 fs-15"
                                >mdi-file-document-edit-outline</v-icon
                            >
                            <span class="fs-13 mt-3 mb-2 ml-4">
                                {{ $t('v2.dashboard.selectDataset') }}
                            </span>
                        </div>
                        <v-autocomplete
                            ref="selectDelegateUser"
                            :menu-props="{
                                maxHeight: 300,
                                width: 270,
                                minWidth: 270,
                                maxWidth: 270,
                                nudgeLeft: 8,
                                nudgeBottom: 3
                            }"
                            class="mr-2 ml-2"
                            full-width
                            solo
                            :items="listDataset"
                            background-color="grey lighten-4"
                            flat
                            dense
                            color="blue-grey lighten-2"
                            item-text="title"
                            return-object
                            @change="changeDataset"
                        >
                            <template v-slot:append>
                                <v-icon style="font-size: 18px"
                                    >mdi mdi-magnify</v-icon
                                >
                            </template>
                            <template v-slot:label>
                                <span class="fs-13">{{
                                    $t('common.search')
                                }}</span>
                            </template>
                            <template v-slot:item="data">
                                <div class="fs-13 py-1">
                                    <v-tooltip bottom>
                                        <template
                                            v-slot:activator="{ on, attrs }"
                                        >
                                            <div
                                                v-bind="attrs"
                                                v-on="on"
                                                class="
                                                    fs-13
                                                    ml-1
                                                    title-document-switch
                                                "
                                            >
                                                {{ data.item.aliasName }}
                                            </div>
                                        </template>
                                        <span>{{ data.item.aliasName }}</span>
                                    </v-tooltip>
                                </div>
                            </template>
                        </v-autocomplete>
                    </div>
                </v-menu>
            </div>
            <v-btn icon tile small class="float-right" @click="cancel">
                <v-icon small> mdi-close </v-icon>
            </v-btn>
        </div>
        <div :style="{ height: height + 'px' }" class="mb-4">
            <div v-if="selectedDataset.type == 'doc'" class="h-100 w-100">
                <DashboardCell
                    v-if="
                        ['table', 'pivot'].includes(
                            cellConfigs.sharedConfigs.type
                        )
                    "
                    :layoutItem="cellConfigs.sharedConfigs.cellId"
                    ref="dashboardCell"
                    :instanceKey="instanceKey"
                    :cellConfigs="cellConfigsClone"
                ></DashboardCell>
                <TableDataAgGrid
                    v-else
                    ref="tableDataAgGrid"
                    :columnDefs="columnDefs"
                    :rowData="rowData"
                />
            </div>
            <DataflowEditor
                v-else
                :action="'view'"
                class="mb-4"
                :idObject="idDataflow"
            />
        </div>
    </v-dialog>
</template>

<script>
import DashboardCell from '@/components/dashboard/components/DashboardCell';
import TableDataAgGrid from '@/components/common/agDataTable/TableDataAgGrid';
import DataflowEditor from '@/components/dataflow/DataflowEditor';
import { util } from '@/plugins/util';

export default {
    components: {
        DataflowEditor,
        TableDataAgGrid,
        DashboardCell
    },
    data() {
        return {
            showDialog: false,
            selectedDataset: {},
            height: null,
            listDataset: []
        };
    },
    created() {
        let self = this;
        this.$evtBus.$on('selected-dataset-dashboard', (data) => {
            self.selectedDataset = data.selectedDataset;
            self.listDataset = data.listDataset;
        });
    },
    props: {
        instanceKey: {
            defaul: ''
        },

        cellConfigs: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    computed: {
        cellConfigsClone() {
            let obj = util.cloneDeep(this.cellConfigs);
            if (obj.viewConfigs.displayOptions.contentSize) {
                obj.viewConfigs.displayOptions.contentSize.h = this.height - 50;
                obj.viewConfigs.displayOptions.contentSize.w =
                    window.innerWidth - 100;
            }
            return obj;
        },
        inforDataflows() {
            return this.$store.state.dashboard.inforDataflows[this.instanceKey];
        },
        idDataflow() {
            let id = 0;
            if (this.selectedDataset.type != 'doc') {
                for (let i in this.inforDataflows) {
                    if (this.selectedDataset.id == this.inforDataflows[i].id) {
                        id = this.inforDataflows[i].dataflowId;
                    }
                }
            }
            return id;
        },
        rowData() {
            return this.cellConfigs.sharedConfigs.data;
        },
        columnDefs() {
            let arr = [];
            let rows = this.cellConfigs.sharedConfigs.data;
            if (rows.length > 0) {
                for (let i in rows[0]) {
                    let obj = {
                        headerName: i,
                        field: i
                    };
                    arr.push(obj);
                }
            }
            return arr;
        }
    },

    methods: {
        cancel() {
            this.$set(this, 'showDialog', false);
        },
        show() {
            // this.selectedDataset = {
            //     type: 'doc'
            // };
            this.height = window.innerHeight - 120;
            this.showDialog = true;
        },
        changeDataset(dataset) {
            this.selectedDataset = dataset;
        }
    }
};
</script>

<style scoped>
.dataset-tracing-popup {
    width: 1000px;
}
</style>

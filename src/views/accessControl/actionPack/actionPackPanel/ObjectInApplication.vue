<template>
    <div class="h-100 w-100 mt-1">
        <div style="width: 200px; min-width: 100%">
            <v-tabs
                show-arrows
                active-class="hight-light-children"
                :height="30"
                v-model="tabIndex"
                color="orange accent-4"
            >
                <v-tab v-for="item in objectTypes" :key="item.key">
                    {{ item.text }}
                </v-tab>
            </v-tabs>
        </div>
        <!-- <Preloader
            v-show="loadingTable"
            style="position: static !important"
            class="mx-auto"
        /> -->
        <v-checkbox
            v-if="openingTabKey != 'document_instance'"
            class="fs-13 sym-small-size"
            :label="$t('v2.acessControl.createNew')"
            dense
            @change="changeInputActionCreate"
            :key="openingTabKey"
            :input-value="itemData.tableConfig[openingTabKey].create"
        ></v-checkbox>
        <ag-grid-vue
            :columnDefs="columnTable"
            :defaultColDef="defaultColDef"
            :style="{ height: gridOptions.containerHeight + 'px' }"
            :gridOptions="gridOptions"
            :getContextMenuItems="getContextMenuItems"
            :rowData="rowTable"
            @cell-key-down="onCellKeyDown"
            class="ag-theme-balham agrid-table mt-2 w-100"
        >
        </ag-grid-vue>
    </div>
</template>
<script>
import Preloader from '@/components/common/Preloader.vue';
import { util } from '@/plugins/util';

import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import { AgGridVue } from 'ag-grid-vue';

import { appManagementApi } from '@/api/AppManagement';

export default {
    props: {
        objects: {
            default() {
                return {
                    document_definition: [],
                    workflow_definition: [],
                    orgchart: [],
                    dashboard: []
                };
            }
        },
        idApplication: {
            default: '0'
        },
        gridOptions: {
            type: Object,
            default() {
                return {};
            }
        },
        defaultColDef: {
            type: Object,
            default() {
                return {};
            }
        },
        itemData: {
            type: Object,
            default() {
                return {};
            }
        },
        listApp: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    components: {
        'ag-grid-vue': AgGridVue,
        Preloader
    },
    computed: {
        objectTypes() {
            return [
                {
                    key: 'document_definition',
                    text: this.$t('objects.document')
                },
                {
                    key: 'document_instance',
                    text: this.$t('objects.document_instance')
                },
                {
                    key: 'workflow_definition',
                    text: this.$t('objects.workflow_definition')
                },
                {
                    key: 'orgchart',
                    text: this.$t('objects.orgchart')
                },
                {
                    key: 'dashboard',
                    text: this.$t('objects.dashboard')
                }
            ];
        },
        openingTabKey() {
            if (this.objectTypes) {
                return this.objectTypes[this.tabIndex].key;
            } else {
                return 'document_definition';
            }
        }
    },

    data() {
        return {
            rowTable: [],
            columnTable: [],
            loadingTable: false,
            tabIndex: 0,
            applicationObjects: {}, // các object của các application, có dạng: {idApp: objects},
            tableData: [],
            cacheAppDetail: []
        };
    },
    watch: {
        listApp() {
            const self = this;
            if (self.listApp.length > 0) {
                self.listApp.map((app) => {
                    if (!self.applicationObjects[app.id]) {
                        if (!self.cacheAppDetail.includes(app.id)) {
                            self.cacheAppDetail.push(app.id);
                            if (app.id) {
                                self.getDetailApp(app.id);
                            }
                        }
                    }
                });
            }
        },
        idApplication() {
            this.setDataTable();
        },
        tabIndex() {
            this.$evtBus.$emit('change-application-tab', this.tabIndex);
            this.setDataTable();
        },
        rowTable() {
            let check = this.rowTable.every(
                (r) => r.object.split(':').length > 1
            );
            this.loadingTable = check ? true : false;
        }
    },
    created() {
        this.setDataTable();
    },
    mounted() {
        const self = this;
        this.$evtBus.$on('set-app-info', (app) => {
            this.tabIndex = app.tabIdx;
        });
        this.$evtBus.$on('finish-loading-app', (data) => {
            self.setDataTable();
        });
        this.$evtBus.$on('calc-height-table', () => {
            let heightParentDiv =
                $('.action-pack-panel').height() - $('.header').height();
            let info = $('.info-actionpack').height();
            let margin = 140;
            if (heightParentDiv > 0) {
                self.gridOptions.containerHeight =
                    heightParentDiv - info - margin;
            }
        });
    },
    methods: {
        changeInputActionCreate(e) {
            if (e) {
                this.itemData.tableConfig[this.openingTabKey].create = true;
            } else this.itemData.tableConfig[this.openingTabKey].create = false;
        },
        setLoadingTable() {
            this.loadingTable = true;
        },
        setDataTable() {
            let colDef = util.cloneDeep(
                this.itemData.tableConfig[this.openingTabKey].colDef
            );
            colDef[1].typeFor = 'App'; // colDef = 'object'
            colDef[1].editable = false;
            this.columnTable = colDef;
            let rows = [];
            const self = this;
            this.itemData.operationsForApplication.map((app) => {
                if (
                    app.id == self.idApplication &&
                    app.children[self.openingTabKey].rowData
                ) {
                    rows = app.children[self.openingTabKey].rowData;
                }
            });
            if (rows.length == 0) {
                let row = { object: '' };
                this.itemData.listActionForObjectType[this.openingTabKey].map(
                    (act) => {
                        row[act] = '';
                    }
                );
                rows = [row];
            }
            this.rowTable = rows;
        },
        onCellKeyDown(params) {
            this.$evtBus.$emit('on-cell-key-down', params);
        },
        setTableConfigChildren(appDetail) {
            let app = {
                id: appDetail.id,
                name: appDetail.name,
                children: {
                    dashboard: { rowData: [] },
                    document_instance: { rowData: [] },
                    document_definition: { rowData: [] },
                    workflow_definition: { rowData: [] },
                    orgchart: { rowData: [] }
                }
            };
            let checkExist = this.itemData.operationsForApplication.filter(
                (item) => item.id == app.id
            );
            if (checkExist.length == 0) {
                this.$evtBus.$emit('action-pack-form-push-application', app);
            }
            app.children = {
                dashboard: this.getTableConfig(
                    'dashboard',
                    appDetail.childrenApp
                ),
                document_instance: this.getTableConfig(
                    'document_instance',
                    appDetail.childrenApp
                ),
                document_definition: this.getTableConfig(
                    'document_definition',
                    appDetail.childrenApp
                ),
                workflow_definition: this.getTableConfig(
                    'workflow_definition',
                    appDetail.childrenApp
                ),
                orgchart: this.getTableConfig('orgchart', appDetail.childrenApp)
            };
            if (checkExist.length == 0) {
                this.$evtBus.$emit('action-pack-form-set-application', app);
            }
        },
        getTableConfig(objType, data) {
            let rows = [];
            let ids = [];
            if (data[objType]) {
                data[objType].map((d) => {
                    let row = {};
                    row['object'] = objType + ':' + d.id;
                    d.actions.map((act) => {
                        row[act] = this.checkActionObjectTypeInApp(
                            objType,
                            d.id,
                            act
                        ); // check theo những action đã có
                    });
                    rows.push(row);
                    ids.push(d.id);
                });
            }
            this.$evtBus.$emit('action-pack-getNameObjectIdentifier', {
                ids: ids,
                objType: objType,
                rows: rows,
                appIdx: this.itemData.operationsForApplication.length - 1
            });
            return {
                colDef: this.columnTable,
                rowData: rows
            };
        },
        // check theo những action đã có
        checkActionObjectTypeInApp(objType, id, act) {
            let check = false;
            this.itemData.operationsForApplication.map((app) => {
                if (
                    app.children[objType].rowData &&
                    app.children[objType].rowData.length > 0
                ) {
                    app.children[objType].rowData.map((obj) => {
                        if (obj.object == objType + ' - ' + id) {
                            check = obj[act];
                        }
                    });
                }
            });
            return check;
        },
        getContextMenuItems(params) {
            let submitContextItem = [];
            return submitContextItem;
        },
        async getDetailApp(id) {
            let res = await appManagementApi.getAppDetails(id);
            if (res.status == 200) {
                this.setTableConfigChildren(res.data.listObject);
            } else {
                this.$snotifyError(
                    res,
                    this.$t('v2.acessControl.cannotGetAppDetail')
                );
            }
        }
    }
};
</script>

<style scoped>
.v-tab {
    font-size: 13px !important;
    letter-spacing: 0 !important;
    text-transform: unset !important;
    font-weight: 400 !important;
}
.hight-light-children {
    font-weight: 500 !important;
    color: #f48634 !important;
}
.object-identifier:hover {
    background: #f7f7f7;
    cursor: pointer;
}
.symper-drag-panel-app >>> .symper-drag-resizer {
    display: none !important;
}
.loader {
    max-width: 80% !important;
    height: 50px !important;
}
.ag-theme-balham >>> .ag-root-wrapper {
    border: unset !important;
}
.ag-theme-balham >>> .ag-header {
    height: 36px !important;
}
.ag-theme-balham >>> .ag-row {
    /* border-top-style: unset !important;
	border-bottom-style: unset !important; */
}
.v-input--selection-controls {
    margin-top: 4px !important;
    height: 30px !important;
}
</style>
<template>
    <div>
        <div v-if="noErrDataOrEmptyQuery" class="fs-13">
            {{ messageInvalidate }}
        </div>
        <div v-else>
            <v-btn
                depressed
                small
                class="mr-2 get-err-data"
                @click="runNodeValidate"
            >
                {{$t('v2.dataflow.getErrData')}}
            </v-btn>
            <ListItems
                ref="listInvalidate"
                :showTitle="false"
                :containerHeight="contentRunningHeight - 60"
                :getDataUrl="getListUrl"
                :showExportButton="false"
                :useDefaultContext="false"
                :apiMethod="'POST'"
                :actionPanelWidth="550"
                :showButtonAdd="false"
                :showDisplayConfig="false"
                :customDataForApi="customDataForApi"
                :customHeaderBtn="customHeaderBtn"
                :customContentType="true"
                :customAPIResult="customAPIResult"
                @data-loaded="handleDataloaded"
                @load-data-error="handleDataloadedError"
                :pathToListObject="'.data.data'"
                :useCustomUiConfig="false"
                @cell-selected="cellSelected"
            >
            </ListItems>
        </div>
        <v-navigation-drawer
            v-model="openDetailDocument"
            temporary
            right
            width="800"
            fixed
        >
            <detail-object :docObjInfo="docObjInfo" />
        </v-navigation-drawer>
    </div>
</template>

<script>
import ListItems from '@/components/common/ListItems';
import { appConfigs } from '@/configs.js';
import { util } from '../../../../plugins/util';

export default {
    components: {
        ListItems,
        'detail-object': () => import('@/views/document/detail/Detail'),
    },
    computed: {
        noErrDataOrEmptyQuery() {
            if ((!this.noErrData && this.emptyObjQuery) || this.noErrData) {
                return true;
            } else {
                return false;
            }
        },
        emptyObjQuery() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .selectedWidget.configs.validateConfigs.objectQuery.value ==
                false
                ? true
                : false;
        },
        noErrData() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .selectedWidget.configs.validateConfigs.validateFormula
                .validateQueryResult.result == 'true'
                ? true
                : false;
        },
        messageInvalidate() {
            return this.noErrData
                ? this.$t('v2.dataflow.noErrData')
                :  this.$t('v2.dataflow.noFormulaQueryObjectValidation');
        },
    },
    methods: {
        cellSelected(params) {
            if (params.colDef.columnTitle == 'UUID') {
                this.openDetailDocument = !this.openDetailDocument;
                this.handlerOpenDetailDocument(params.value);
            }
        },
        handlerOpenDetailDocument(docId) {
            if (this.openDetailDocument) {
                this.docObjInfo = {
                    docObjId: docId,
                    docSize: '21cm',
                };
            }
        },
        runNodeValidate() {
            if (!this.noErrDataOrEmptyQuery) {
                let data = {
                    value: this.$store.state.dataflow.allDataflow[
                        this.instanceKey
                    ].selectedWidget.configs.validateConfigs.objectQuery.value,
                };
                this.getData(data);
            }
        },
        handleAddSuccess() {
            this.showDialog = false;
            this.$refs.listService.refreshList();
        },
        getData(dataPost) {
            this.dataPost = dataPost;
            this.$refs.listInvalidate.setPage(1);
            this.$refs.listInvalidate.getData(false, true);
        },
        handleDataloaded() {
            this.$emit('data-loaded');
        },
        handleDataloadedError() {
            this.$emit('load-data-error');
        },
    },
    props: {
        containerHeight: {
            type: Number,
            default: 300,
        },
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
    data() {
        let self = this;
        return {
            openDetailDocument: false,
            docObjInfo: {},
            showDialog: false,
            dataPost: {},
            customDataForApi() {
                return self.dataPost;
            },
            customHeaderBtn: {
                exportExcel: {
                    icon: 'mdi-microsoft-excel',
                    title: self.$t('common.export_excel'),
                    callback() {
                        self.$evtBus.$emit('bi-dataflow-run-export-data', {
                            instanceKey: self.instanceKey,
                        });
                    },
                },
            },
            customAPIResult: {
                reformatData(res) {
                    if (res.status == 200) {
                        for (let col of res.data.columns) {
                            if (col.name == 'UUID') {
                                col.cellRenderer = function (params) {
                                    let value = params.value;
                                    return (
                                        '<span style="color:var(--symper-color); cursor: pointer; text-decoration: underline">' +
                                        value +
                                        '</span>'
                                    );
                                };
                            }
                        }
                        return {
                            columns: res.data.columns,
                            listObject: res.data.listObject,
                            total: res.data.total,
                        };
                    } else {
                        return {};
                    }
                },
            },
            getListUrl:
                appConfigs.apiDomain.biService + '/dataflow/run-node-validate',
        };
    },
};
</script>

<style scope>
.get-err-data {
    position: absolute;
    top: 9px;
    right: 475px;
}
</style>

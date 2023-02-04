<template>
    <div>
        <ListItems
            :headerByTranslateName="false"
            ref="listOutput"
            :showTitle="false"
            :containerHeight="contentRunningHeight"
            :getDataUrl="getListUrl"
            :showExportButton="false"
            emptyDataKey="dataflow_no_data_screen"
            :useDefaultContext="false"
            :tableContextMenu="tableContextMenu"
            :apiMethod="'POST'"
            :actionPanelWidth="550"
            :showButtonAdd="false"
            :showDisplayConfig="false"
            :customDataForApi="customDataForApi"
            :customHeaderBtn="customHeaderBtn"
            :customContentType="true"
            @data-loaded="handleDataloaded"
            @load-data-error="handleDataloadedError"
            :customAPIResult="customAPIResult"
            :customBtn="customBtn"
            @click-custom-btn="handleClickCustomBtn"
            :pathToListObject="'.data.data'"
            :useCustomUiConfig="false"
            :showFilter="false"
        >
            <template slot="right-panel-content" slot-scope="{}"> </template>
        </ListItems>
    </div>
</template>

<script>
import ListItems from '@/components/common/ListItems';
import { appConfigs } from '@/configs.js';
export default {
    components: {
        ListItems
    },
    computed: {
        selectingNode() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .selectedWidget;
        }
    },
    methods: {
        handleAddSuccess() {
            this.showDialog = false;
            this.$refs.listService.refreshList();
        },
        getData(dataPost) {
            this.dataPost = dataPost;
            this.$refs.listOutput.setPage(1);
            this.$refs.listOutput.resetDataBeforeRunDataflow();
            this.$refs.listOutput.getData(false, true);
        },
        handleDataloaded() {
            this.$emit('data-loaded', {
                tempTable: this.tempTable
            });
        },
        handleDataloadedError() {
            this.$emit('load-data-error');
        },
        setNodeValidateStatus(infoNodeValidate) {
            let allNodes =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .allWidget;
            let nodeValidateErr = [];
            let nodeValidateSuccess = [];

            for (let key in infoNodeValidate) {
                let validateQueryResult =
                    allNodes[key].configs.validateConfigs.validateFormula
                        .validateQueryResult;
                validateQueryResult.result =
                    infoNodeValidate[key].validateQueryResult;
                validateQueryResult.errInfo = infoNodeValidate[key].errInfo;
                if (infoNodeValidate[key].validateQueryResult == 'false') {
                    nodeValidateErr.push(key);
                } else {
                    nodeValidateSuccess.push(key);
                }
            }
            if (nodeValidateErr.length > 0) {
                this.$evtBus.$emit(
                    'dataflow-node-validate-has-err',
                    this.instanceKey,
                    nodeValidateErr
                );
            }
            if (nodeValidateSuccess.length > 0) {
                this.$evtBus.$emit(
                    'dataflow-node-validate-has-success',
                    this.instanceKey,
                    nodeValidateSuccess
                );
            }
        },
        saveDataAfterRun(res) {
            let dataRunNode =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .allWidget[res.data.idNodeStop].dataRunNode;
            dataRunNode.totalRow = res.data.total;
            dataRunNode.totalTime = res.data.time.total.toFixed(3);
            dataRunNode.status = res.status;
            if (this.selectingNode.type == 'Validate') {
                dataRunNode.error =
                    res.infoNodeValidate[this.selectingNode.id].errInfo;
            } else dataRunNode.error = '';
        },
        handleClickCustomBtn() {
            this.$emit('click-custom-btn');
        }
    },
    props: {
        containerHeight: {
            type: Number,
            default: 300
        },
        action: {
            default: 'create'
        },
        instanceKey: {
            default: ''
        },
        contentRunningHeight: {
            type: Number,
            default: 150
        },
        customBtn: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data() {
        let self = this;
        return {
            showDialog: false,
            dataPost: {},
            customDataForApi() {
                return self.dataPost;
            },
            customHeaderBtn: {
                exportExcel: {
                    icon: 'mdi-microsoft-excel',
                    title: self.$t('common.export_excel'),
                    tooltip: self.$t('common.export_excel'),
                    callback() {
                        self.$evtBus.$emit('bi-dataflow-run-export-data', {
                            instanceKey: self.instanceKey
                        });
                    }
                }
            },
            tableContextMenu: {
                update: {
                    name: 'edit',
                    text: this.$t('apps.contextMenu.edit'),
                    callback: (obj, callback) => {
                        self.$goToPage(
                            '/dataflows/' + obj.id + '/edit',
                            self.$t('common.edit') +
                                ' ' +
                                (obj.name ? obj.name : '')
                        );
                    }
                },
                remove: {
                    name: 'remove',
                    text: this.$t('apps.contextMenu.remove'),
                    callback: (app, callback) => {}
                }
            },
            customAPIResult: {
                reformatData(res) {
                    let cols = [];
                    if (self.selectingNode.type != 'home') {
                        self.tempTable = res.data.tmpTb;
                        self.selectingNode.proceessAfterRunNode(res.data);
                        cols = self.selectingNode.output;
                        cols.forEach(function (e) {
                            if (cols.length < 7) {
                                e.flex = 1;
                            }
                            e.name = e.columnName;
                        });
                    }
                    if (
                        res.infoNodeValidate &&
                        !Object.keys(res.infoNodeValidate).length == 0
                    ) {
                        self.setNodeValidateStatus(res.infoNodeValidate);
                    }
                    self.saveDataAfterRun(res);
                    return {
                        columns: res.data.data.length == 0 ? [] : cols,
                        listObject: res.data.data ? res.data.data : [],
                        total: res.data.total ? res.data.total : 0
                    };
                }
            },
            getListUrl:
                appConfigs.apiDomain.biService +
                '/dataflow/run-node-without-save'
        };
    }
};
</script>

<style scope></style>

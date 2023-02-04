<template>
    <ListItems
        ref="listDataflow"
        :pageTitle="$t('bi.dataflow.title-show-list')"
        :containerHeight="containerHeight"
        :getDataUrl="getListUrl"
        :headerPrefixKeypath="'table'"
        :showExportButton="false"
        :useDefaultContext="false"
        :tableContextMenu="tableContextMenu"
        :flexMode="true"
        :actionPanelWidth="550"
        :useActionPanel="false"
        @on-add-item-clicked="goToAddDataflow"
        :customAPIResult="customAPIResult"
        :emptyDataKey="'bi-dataflow-list'"
    >
        <template slot="right-panel-content" slot-scope="{}"> </template>
    </ListItems>
</template>

<script>
import ListItems from '@/components/common/ListItems';
import DataflowEditorWorker from 'worker-loader!@/worker/dataflow/DataflowEditor.Worker.js';
import { appConfigs } from '@/configs.js';
import { util } from '@/plugins/util.js';
export default {
    components: {
        ListItems
    },
    methods: {
        goToAddDataflow() {
            this.$goToPage(
                '/dataflows/create',
                this.$t('common.create') + this.$t('v2.dataflow.dataflow')
            );
        },
        handleAddSuccess() {
            this.showDialog = false;
            this.$refs.listService.refreshList();
        },
        deleteRows(rows) {
            this.dataflowEditorWorker.postMessage({
                action: 'deleteRows',
                data: {
                    rows: rows
                }
            });
        },
        listenFromWorker() {
            let self = this;
            this.dataflowEditorWorker.addEventListener(
                'message',
                function (event) {
                    let data = event.data;
                    let action = data.action;
                    if (self[action]) {
                        self[action](data.data);
                    } else {
                        console.error(` action ${action} not found `);
                    }
                }
            );
        },
        handleDeleteRows(data) {
            let self = this;
            if (data == 200) {
                this.$snotifySuccess(self.$t('v2.dataflow.deleteSuccess'));
            } else {
                this.$snotifyError(self.$t('v2.dataflow.errDetect'));
            }
            this.$refs.listDataflow.refreshList();
        }
    },
    created() {
        this.dataflowEditorWorker = new DataflowEditorWorker();
        this.listenFromWorker();
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
    data() {
        let self = this;
        let dt = {
            containerHeight: 0,
            showDialog: false,
            dataflowEditorWorker: null,
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
                clone: {
                    name: 'clone',
                    text: self.$t('apps.contextMenu.clone'),
                    callback: (obj, callback) => {
                        self.$goToPage(
                            '/dataflows/' + obj.id + '/clone',
                            self.$t('common.clone') +
                                ' ' +
                                (obj.name ? obj.name : '')
                        );
                    }
                },
                remove: {
                    name: 'remove',
                    text: this.$t('apps.contextMenu.remove'),
                    callback: (rows, callback) => {
                        self.deleteRows(rows);
                    }
                }
            },
            customAPIResult: {
                reformatData(res) {
                    return {
                        columns: res.data.columns,
                        listObject: res.data.listObject,
                        total: res.data.total
                    };
                }
            },
            getListUrl: appConfigs.apiDomain.biService + '/dataflows'
        };
        if (!window.origin.includes('inter-apps.symper.vn')) {
            dt.tableContextMenu.editOnClickhouseMode = {
                name: 'editOnClickhouseMode',
                text: this.$t('v2.dataflow.editWithClickhouse'),
                callback: (obj, callback) => {
                    self.$goToPage(
                        '/dataflows/' + obj.id + '/edit-in-clickhouse-mode',
                        this.$t('v2.dataflow.editDataflowInClickhouseMode')
                    );
                }
            };
        }
        return dt;
    }
};
</script>

<style></style>

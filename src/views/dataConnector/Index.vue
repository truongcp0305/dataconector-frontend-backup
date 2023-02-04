<template>
    <div class="w-100 h-100">
        <list-items
            class="h-100"
            ref="listDataConnector"
            :actionPanelWidth="638"
            :commonActionProps="commonActionProps"
            :containerHeight="containerHeight"
            :pageTitle="$t('dataConnector.name')"
            :showExportButton="false"
            :tableContextMenu="tableContextMenu"
            :customAPIResult="customAPIResult"
            @close-panel="refreshPanel"
            @after-open-add-panel="openAddPanel"
            :actionPanelType="'elastic'"
            :showCloseIcon="true"
            :getDataUrl="dataUrl"
        >
            <template slot="right-panel-content">
                <AddApi
                    @save-and-run="saveAndRun"
                    :typeAction="typeAction"
                    :disabled="disabled"
                    :listDoc="listDoc"
                    @update-api="updateApiAction"
                    ref="addApiPanel"
                    @run-api="runApi"
                    :dataRunApi="dataRunApi"
                    @save-api="saveApi"
                />
            </template>
        </list-items>
        <LoadingApi
            ref="loadingApi"
            :name="loadInfoApi.name"
            @close="closeLoading()"
            :loading="loading"
            :data="loadInfoApi.data"
        />
    </div>
</template>
<script>
import dataConnectorApi from '@/api/dataConnector';
import LoadingApi from './../../views/dataConnector/LoadingApi.vue';
import { util } from '@/plugins/util.js';
import { documentApi } from '../../api/Document';
import AddApi from './../../views/dataConnector/AddApi.vue';
import ListItems from './../../components/common/ListItems.vue';
import { appConfigs } from '../../configs';
import {
    getSize,
    getDurationTime,
} from './../../components/dataConnector/formatObject';
import DataConnectorWorker from 'worker-loader!@/worker/dataConnector/DataConnector.Worker.js';
export default {
    components: {
        'list-items': ListItems,
        AddApi,
        LoadingApi,
    },
    data() {
        let self = this;
        return {
            commonActionProps: {
                module: 'data_connector',
                resource: 'data_connector',
                scope: 'data_connector',
            },
            listDoc: [],
            startLoad: '',
            checkLoopProgress: null,
            loading: false,
            loadInfoApi: {
                name: '',
                data: [
                    { name: this.$t('v2.dataconnector.time'), value: '' },
                    {
                        name: this.$t('v2.dataconnector.status'),
                        value: this.$t('v2.dataconnector.gettingDataFormApi'),
                    },
                    { name: this.$t('v2.dataconnector.percent'), value: '0' },
                    { name: this.$t('v2.dataconnector.size'), value: '0' },
                ],
            },
            dataSave: {},
            isRunNow: false,
            typeAction: 'add',
            disabled: false,
            dataRunApi: null,
            dataConnectorWorker: null,
            apiMappingAndConfig: '',
            containerHeight: 800,
            // dataUrl:'https://data-connector.symper.vn/apiQueries',
            // dataUrl:'https://data-connector.go.symper.vn/apiQueries',
            dataUrl: appConfigs.uniqueApiDomain.dataConnector + 'apiQueries',
            customAPIResult: {
                reformatData(res) {
                    let data = {
                        listObject: res.data.listObject,
                        columns: res.data.columns,
                        total: res.data.total,
                    };
                    res.data.columns.forEach(function (e) {
                        e.cellRenderer = function (params) {
                            let content = '';
                            let rtf = params.value;
                            if (rtf) {
                                rtf = rtf.replace(/\\par[d]?/g, '');
                                rtf = rtf.replace(
                                    /\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g,
                                    '',
                                );
                                content = rtf
                                    .replace(/\\'[0-9a-zA-Z]{2}/g, '')
                                    .trim();
                            }
                            return '<span>' + content + '</span>';
                        };
                    });
                    // let listUser = self.$store.state.app.allUsers;
                    // data.listObject.map(d=>{
                    //     listUser.map(user=>{
                    //         if(d.userCreate==user.id){
                    //             d.userCreate=user.displayName
                    //          }
                    //     });
                    // })
                    return data;
                },
            },
            tableContextMenu: {
                detail: {
                    name: 'view',
                    text:
                        "<i class= 'mdi mdi-information-outline' > </i>&nbsp" +
                        this.$t('dataConnector.contextMenu.view'),
                    callback: (data, callback) => {
                        self.$refs.listDataConnector.openactionPanel();
                        self.viewApi(data);
                    },
                },
                update: {
                    name: 'update',
                    text:
                        "<i class= 'mdi mdi-pencil' > </i>&nbsp" +
                        this.$t('dataConnector.contextMenu.update'),
                    callback: (data, callback) => {
                        self.$refs.listDataConnector.openactionPanel();
                        self.updateApi(data);
                    },
                },
                stop: {
                    name: 'stop',
                    text:
                        "<i class= 'mdi mdi-stop-circle-outline' > </i>&nbsp" +
                        this.$t('dataConnector.contextMenu.stop'),
                    callback: (data, callback) => {
                        self.stopApi(data);
                    },
                },
                run: {
                    name: 'load',
                    text:
                        "<i class= 'mdi mdi-run' > </i>&nbsp" +
                        this.$t('dataConnector.contextMenu.run'),
                    callback: (data, callback) => {
                        self.loadApi(data);
                    },
                },
                delete: {
                    name: 'delete',
                    text:
                        "<i class= 'mdi mdi-close-circle-outline' > </i>&nbsp" +
                        this.$t('dataConnector.contextMenu.delete'),
                    callback: (data, callback) => {
                        self.deleteApi(data);
                    },
                },
                clone: {
                    name: 'clone',
                    text:
                        "<i class= 'mdi mdi-content-copy' > </i>&nbsp" +
                        this.$t('dataConnector.contextMenu.clone'),
                    callback: (data, callback) => {
                        self.cloneApi(data);
                    },
                },
                startExcuteJob: {
                    name: 'startExcuteJob',
                    text:
                        "<i class= 'mdi mdi-run' > </i>&nbsp" +
                        this.$t('dataConnector.contextMenu.startExcuteJob'),
                    callback: (data, callback) => {
                        self.excuteJob(data, 1);
                    },
                },
                stopExcuteJob: {
                    name: 'stopExcuteJob',
                    text:
                        "<i class= 'mdi mdi-stop-circle-outline' > </i>&nbsp" +
                        this.$t('dataConnector.contextMenu.stopExcuteJob'),
                    callback: (data, callback) => {
                        self.excuteJob(data, 0);
                    },
                },
            },
        };
    },
    methods: {
        closeLoading() {
            this.loading = false;
            clearInterval(this.checkLoopProgress);
            this.loadInfoApi = {
                name: '',
                data: [
                    { name: this.$t('v2.dataconnector.time'), value: '' },
                    {
                        name: this.$t('v2.dataconnector.status'),
                        value: this.$t('v2.dataconnector.gettingDataFormApi'),
                    },
                    { name: this.$t('v2.dataconnector.percent'), value: '0' },
                    { name: this.$t('v2.dataconnector.size'), value: '0' },
                ],
            };
        },
        cloneApi(data) {
            if (data.type == 'Cập nhật') {
                data.type = 2;
            } else if (data.type == 'Thêm mới') {
                data.type = 0;
            } else {
                data.type = 1;
            }
            let formatData = {
                url: data.url,
                deleteConditions: data.delete_conditions,
                headers: data.headers,
                method: data.method,
                name: data.name + ' (Clone)',
                note: data.note,
                partner: data.partner,
                partnerConfigs: data.partnerConfigs,
                params: data.params,
                updateColumnInfo: data.update_column_info,
                type: data.type,
                pathToData: data.path_to_data,
                pathToTotal: data.path_to_total,
                mappings: data.mappings,
                env: data.env,
                cronjobConfig: data.cronjob_config ? data.cronjob_config : '{}',
                body: data.body,
                updateByKey: data.update_by_key,
            };
            this.saveApi(formatData);
        },
        openAddPanel() {
            this.$refs.listDataConnector.openactionPanel();
            this.typeAction = 'add';
            this.disabled = false;
            this.isRunNow = false;
            this.refreshPanel();
        },
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
        refreshPanel() {
            this.typeAction = 'add';
            this.disabled = false;
            this.isRunNow = false;
            this.dataRunApi = {};
            this.$refs.addApiPanel.refreshData();
        },
        getListDocument() {
            const self = this;
            documentApi.getListDocument().then((res) => {
                if (res.status == 200) {
                    self.listDoc = [];
                    res.data.listObject.map((data) => {
                        self.listDoc.push({ id: data.id, name: data.title });
                    });
                }
            });
        },
        saveApi(data) {
            this.dataSave = data;
            this.dataConnectorWorker.postMessage({
                action: 'saveApi',
                data: data,
            });
        },
        runApiConfigImmediately(data) {
            if (this.isRunNow) {
                if (data.cronjob_config == '{}') {
                    this.loadApi(this.dataSave);
                } else {
                    this.excuteJob(this.dataSave, 1);
                }
            }
        },
        saveApiAfter(data) {
            this.disabled = false;
            if (data.status == 200) {
                this.$snotifySuccess(this.$t('v2.dataconnector.saveSuccess'));
                this.runApiConfigImmediately(data);
            } else {
                this.$snotifyError(data.message, this.$t('v2.dataconnector.saveFail'));
            }
            this.refreshPanel();
            this.$refs.listDataConnector.closeactionPanel();
            this.$refs.listDataConnector.refreshList();
        },
        runApi(data) {
            this.dataConnectorWorker.postMessage({
                action: 'runApi',
                data: data,
            });
        },
        updateApiAction(data) {
            this.dataConnectorWorker.postMessage({
                action: 'updateApi',
                data: data,
            });
        },
        saveAndRun() {
            this.isRunNow = true;
        },
        spliceData(data) {
            if (data.data.data) {
                if (data.data.data.length > 15) {
                    data.data.data = data.data.data.slice(0, 14);
                }
            }
            return data;
        },
        runApiAfter(data) {
            if (data.status == 200) {
                let dataMapping = {
                    mappings: {},
                    data: data.data.data,
                };
                if (this.dataSave.mappings == '{}' || !this.dataSave.mappings) {
                    this.$refs.addApiPanel.setMapping(dataMapping);
                }
                this.dataRunApi = this.spliceData(data);
            } else {
                this.dataRunApi = data.message;
                this.$snotifyError(data.message, this.$t('v2.dataconnector.errorApiNotExis'));
            }
        },
        stopApi(data) {
            this.dataConnectorWorker.postMessage({
                action: 'stopApi',
                data: data.uuid,
            });
        },
        stopApiAfter(data) {
            if (data.status == 200) {
                this.$snotifySuccess(this.$t('v2.dataconnector.stopSuccess'));
                this.$refs.listDataConnector.refreshList();
            } else {
                this.$snotifyError(data.message, this.$t('v2.dataconnector.failStopFail'));
            }
        },
        deleteApi(data) {
            this.disabled = false;
            data.map((d) => {
                this.dataConnectorWorker.postMessage({
                    action: 'deleteApi',
                    data: d.uuid,
                });
            });
        },
        viewApi(data) {
            this.disabled = true;
            this.typeAction = 'view';
            this.dataConnectorWorker.postMessage({
                action: 'viewApi',
                data: data.uuid,
            });
        },
        updateApi(data) {
            this.dataSave = data;
            this.typeAction = 'update';
            this.disabled = false;
            this.dataConnectorWorker.postMessage({
                action: 'viewApi',
                data: data.uuid,
            });
        },
        updateApiAfter(data) {
            if (data.status == 200) {
                this.$snotifySuccess(this.$t('v2.dataconnector.updateSuccess'));
                this.runApiConfigImmediately(data);
            } else {
                this.$snotifyError(
                    data.message,
                    this.$t('v2.dataconnector.failCantUpdate'),
                );
            }
            this.typeAction = 'add';
            this.refreshPanel();
            this.$refs.listDataConnector.closeactionPanel();
            this.$refs.listDataConnector.refreshList();
        },
        viewApiAfter(data) {
            this.$refs.listDataConnector.openactionPanel();
            if (data.status == 200) {
                this.dataRunApi =
                    data.data.mappings != '{}'
                        ? JSON.parse(data.data.mappings)
                        : '{}';
                data.data.dataExtract = this.dataRunApi;
                this.$refs.addApiPanel.setUpdateData(data.data);
            } else {
                this.$snotifyError(
                    data.view.message,
                    this.$t('v2.dataconnector.failCantSeeData'),
                );
            }
        },
        getDurationTime(start, end) {
            return getDurationTime(start, end);
        },
        excuteJob(data, status) {
            dataConnectorApi
                .excuteJob({ uuid: data.uuid, status: status })
                .then((res) => {
                    if (res.status == 200) {
                        this.$snotifySuccess(this.$t('v2.dataconnector.success'));
                        this.$refs.listDataConnector.refreshList();
                    } else {
                        this.$snotifyError(this.$t('v2.dataconnector.fail'));
                    }
                });
        },
        getProcess(uuid) {
            const self = this;
            dataConnectorApi.getProcess(uuid).then((res) => {
                if (res.status == 200) {
                    if (JSON.stringify(res.data) != '{}') {
                        self.loadInfoApi.data[1].value = res.data.status
                            ? res.data.status
                            : '';
                        self.loadInfoApi.data[2].value =
                            Math.round(res.data.progress) + ' %';
                    }
                    console.log(res);
                } else {
                    clearInterval(this.checkLoopProgress, 100);
                }
            });
        },
        async loadApi(data) {
            this.dataSave = data;
            this.loading = true;
            this.loadInfoApi.name = data.name;
            this.startLoad = this.$moment();
            this.$refs.loadingApi.show();
            await this.setIntervalProgress(data.uuid);
            await dataConnectorApi.loadApi(data).then((res) => {
                if (res.status == 200) {
                    clearInterval(this.checkLoopProgress);
                    this.$refs.listDataConnector.refreshList();
                    this.loading = false;
                    this.loadInfoApi.data[0].value = this.getDurationTime(
                        this.startLoad,
                        this.$moment(),
                    );
                    this.loadInfoApi.data[1].value = '200 OK';
                    this.loadInfoApi.data[3].value = this.getSize(data.res);
                } else {
                    clearInterval(this.checkLoopProgress);
                    this.$snotifyError(res.message, this.$t('v2.dataconnector.error'));
                    this.loadInfoApi.data[2].value = 'Error';
                    this.loading = false;
                }
            });
        },
        setIntervalProgress(uuid) {
            this.checkLoopProgress = setInterval(() => {
                this.getProcess(uuid);
            }, 3000);
        },
        getSize(data) {
            return getSize(data);
        },
        deleteApiAfter(data) {
            this.$refs.listDataConnector.refreshList();
            if (data.status == 200) {
                this.$snotifySuccess(this.$t('v2.dataconnector.deleteSuccess'));
            } else {
                this.$snotifyError(data.message, this.$t('v2.dataconnector.deleteFail'));
            }
        },
    },
    created() {
        this.dataConnectorWorker = new DataConnectorWorker();
        this.getListDocument();
    },
    mounted() {
        this.calcContainerHeight();
        const self = this;
        this.dataConnectorWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'stopApi':
                    self.stopApiAfter(data.dataAfter);
                    break;
                case 'runApi':
                    self.runApiAfter(data.dataAfter);
                    break;
                case 'deleteApi':
                    self.deleteApiAfter(data.dataAfter);
                    break;
                case 'saveApi':
                    self.saveApiAfter(data.dataAfter);
                    break;
                case 'viewApi':
                    self.viewApiAfter(data.dataAfter);
                    break;
                case 'updateApi':
                    self.updateApiAfter(data.dataAfter);
                    break;
                default:
                    break;
            }
        });
    },
};
</script>

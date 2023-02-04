<template>
    <div class="w-100 h-100">
        <list-items
            ref="listActionPack"
            :actionPanelWidth="'100%'"
            :pageTitle="$t('permissions.actionPack.list')"
            :tableContextMenu="tableContextMenu"
            :containerHeight="containerHeight"
            :getDataUrl="getListUrl"
            :flexMode="true"
            :commonActionProps="commonActionProps"
            :actionPanelType="'modal'"
            :headerPrefixKeypath="'table'"
            :currentItemData="currentItemData"
            :showExportButton="false"
            @after-open-add-panel="handleAddItem"
            @cell-mouse-over="handleCellMouseOver"
        >
            <template slot="right-panel-content" slot-scope="{ itemData }">
                <div v-show="isLoading">
                    <Preloader />
                </div>
                <ActionPackForm
                    v-show="!isLoading"
                    class="action-pack-form overflow-hidden"
                    @hide-loading="hideLoading"
                    :listFilter="listFilter"
                    :typeAction="currentItemData.action"
                    :key="actionPackFormKey"
                    @set-control="setControl"
                    @trigger-update-action-pack="updateActionPack"
                    @close-form="closeForm"
                    @refresh-show-list="refreshList"
                    @set-kanban-selected="setKanbanSelected"
                    @set-first-kanban-selected="setFirstKanbanSelected"
                    :itemData="itemData"
                    ref="actionPackForm"
                ></ActionPackForm>
            </template>
        </list-items>
    </div>
</template>
<script>
import Preloader from '@/components/common/Preloader.vue';
import _groupBy from 'lodash/groupBy';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs.js';
import ActionPackWorker from 'worker-loader!@/worker/accessControl/ActionPack.Worker.js';

import ListItems from '@/components/common/ListItems.vue';
import ActionPackForm from './actionPackPanel/ActionPackForm';

import { permissionApi } from '@/api/permissionPack';
import { accessControlApi } from '@/api/accessControl';
import { appManagementApi } from '@/api/AppManagement';

export default {
    components: {
        ListItems: ListItems,
        ActionPackForm,
        Preloader
    },
    data() {
        let self = this;
        return {
            commonActionProps: {
                module: 'action_pack',
                resource: 'action_pack',
                scope: 'action_pack'
            },
            isLoading: true,
            containerHeight: 300,
            actionOnItem: 'create',
            getListUrl: appConfigs.apiDomain.actionPacks,
            actionPackWorker: null,
            actionPackFormKey: 0,
            //chứa thông tin action pack
            currentItemData: {
                id: 0,
                action: 'create',
                name: '',
                description: '',
                listKanban: [],
                listApp: [], // danh sách tất cả các app,
                operationStateFlow: {}, // operation cho stateflow
                objectType: 'document_definition',
                listActionForObjectType: [],
                operationsObjectType: {}, //chứa operation của object type trừ application, dạng {document_definition:{objectIdentify:docId:{create:true,...}},{}},
                operationsForApplication: [], //data lưu quyền trong application dạng table có cột và row theo từng app [{id:123, document_definition:[{id:345,name:"abc"}, dashboard:[],..]},...],
                tableConfig: {}, // chứa thông tin config của table theo row và cột ứng với object {document_definition:{rowData:[], colDef:[], filter:{value:{}, item:{ filters:[], actions: []}}}}
                control: {} //
            },
            tableContextMenu: {
                update: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: (row, callback) => {
                        self.updateActionPack(row);
                    }
                },
                copy: {
                    name: 'copy',
                    text: this.$t('common.copy'),
                    callback: (row, callback) => {
                        self.updateActionPack(row);
                        self.currentItemData.action = 'copy';
                    }
                },
                delete: {
                    name: 'remove',
                    text: this.$t('common.delete'),
                    callback: async (rows, refreshList) => {
                        let ids = [];
                        for (let item of rows) {
                            ids.push(item.id);
                        }
                        this.actionPackWorker.postMessage({
                            action: 'deleteActionPack',
                            data: {
                                ids: ids
                            }
                        });
                    }
                },
                detail: {
                    name: 'detail',
                    text: this.$t('common.detail'),
                    callback: (row, callback) => {
                        self.detailActionPack(row);
                    }
                }
            },
            listFilter: [],
            objectTypeOneRow: [
                'account',
                'data_connector',
                'action_pack',
                'permission_pack',
                'system_role',
                'orgchart_role',
                'filter'
            ]
        };
    },
    created() {
        this.$store.dispatch('actionPack/getAllActionByObjectType');
        this.$store.dispatch('actionPack/getAllApp');
        this.$store.dispatch('actionPack/getAllKanban');
        this.getListFilter();
    },
    mounted() {
        let self = this;
        $(window).on('beforeunload', function (e) {
            if (self.$refs.actionPackForm) return false;
        });
        this.$evtBus.$on('re-assign-item-data-action-pack', () => {
            if (!this.$refs.actionPackForm) return;
            let cloneItemData = util.cloneDeep(
                this.$refs.actionPackForm.itemData
            );
            this.currentItemData = null;
            this.currentItemData = cloneItemData;
        });
        this.calcContainerHeight();
        this.actionPackWorker = new ActionPackWorker();
        this.actionPackWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'handleDeleteActionPack':
                    self.$snotifySuccess(
                        self.$t('v2.acessControl.successfullDelete')
                    );
                    setTimeout(function (e) {
                        self.refreshList();
                    }, 1000);
                    break;
                default:
                    break;
            }
        });
    },
    computed: {
        listActionForObjectType() {
            let listAction = {};
            Object.keys(
                this.$store.state.actionPack.getAllActionByObjectType
            ).map((obj) => {
                if (obj == 'document_control') {
                    listAction[obj] = this.customActionDocumentControl(
                        this.$store.state.actionPack.getAllActionByObjectType[
                            obj
                        ].action
                    );
                } else {
                    listAction[obj] =
                        this.$store.state.actionPack.getAllActionByObjectType[
                            obj
                        ].action;
                }
            });
            return listAction;
        },
        allResource() {
            return this.$store.state.actionPack.getAllActionByObjectType;
        },
        allListApp() {
            let allApp = this.$store.state.actionPack.getAllApp;
            let allowedApp = [];
            if (util.auth.isSupportter()) {
                return allApp;
            }
            let allOperation = this.$store.state.app.userOperations;
            if (allOperation.application_definition) {
                let apps = Object.keys(allOperation.application_definition);
                allApp.map((app, appIdx) => {
                    if (apps.includes(app.id)) {
                        allowedApp.push(app);
                    }
                });
            }
            return allowedApp;
        },
        allListKanban() {
            return this.$store.state.actionPack.getAllKanban;
        }
    },
    watch: {
        allListKanban() {
            this.currentItemData.listKanban = this.allListKanban;
        }
    },
    methods: {
        handleCellMouseOver(params) {
            if (!util.auth.isSupportter()) {
                let allowItems = {};
                let row = params.data;
                let currentRole =
                    this.$store.state.app.endUserInfo.currentRole.id;
                if (
                    this.$store.state.app.actionPackIdsByRole &&
                    this.$store.state.app.actionPackIdsByRole[currentRole] &&
                    this.$store.state.app.actionPackIdsByRole[currentRole][
                        row.id
                    ]
                ) {
                    allowItems['update'] = this.tableContextMenu['update'];
                }
                if (row.userCreate == this.$store.state.app.endUserInfo.email) {
                    allowItems['update'] = this.tableContextMenu['update'];
                    allowItems['delete'] = this.tableContextMenu['delete'];
                }
                this.tableContextMenu = allowItems;
            }
        },
        customActionDocumentControl(actions) {
            let mapAction = [
                'hide',
                'readonly',
                'not_remove',
                'old_rows_readonly',
                'old_rows_not_remove'
            ];
            return mapAction;
        },
        async getAppInActionPack() {
            this.currentItemData.operationsForApplication = [];
            let apps =
                this.currentItemData.operationsObjectType
                    .application_definition;
            let idApps = [];
            if (apps) {
                Object.keys(apps).map((app) => {
                    idApps.push(app.split(':')[1]);
                    this.currentItemData.operationsForApplication.push({
                        id: app.split(':')[1],
                        name: ' ',
                        children: {
                            dashboard: {},
                            document_instance: {},
                            document_definition: {},
                            workflow_definition: {},
                            orgchart: {}
                        }
                    });
                    this.getChildrenDetaildApplication(app.split(':')[1]);
                });
                this.getListApplication(idApps);
            }
        },
        setControl(control) {
            this.currentItemData.control = control;
        },
        setFirstKanbanSelected(rowData) {
            this.currentItemData.tableConfig['stateflow_flow'].rowData =
                rowData;
        },
        // lấy thông tin các app theo id
        async getChildrenDetaildApplication(appId) {
            let res = await appManagementApi.getAppDetails(appId);
            if (res.status == 200) {
                let children = res.data.listObject.childrenApp;
                if (children['document_definition']) {
                    let rowsDocumentInstance = util
                        .cloneDeep(children['document_definition'])
                        .map((chil) => {
                            chil.actions =
                                this.listActionForObjectType[
                                    'document_instance'
                                ];
                            return chil;
                        });
                    children['document_instance'] = rowsDocumentInstance;
                }
                this.setTableConfigChildren(children, res.data.listObject.id);
            } else {
                this.$snotifyError(
                    res,
                    this.$t('v2.acessControl.cannotGetAppDetail')
                );
            }
        },
        // chế biến thành các table: orgchart,văn bản, danh sách bản ghi, quy trình, dashboard từ các app đã chọn
        setTableConfigChildren(children, appId) {
            this.currentItemData.operationsForApplication.map((data, idx) => {
                Object.keys(children).map((chil) => {
                    if (data.id == appId) {
                        Object.keys(
                            this.currentItemData.operationsForApplication[idx]
                                .children
                        ).map((itemChil) => {
                            if (chil == itemChil) {
                                this.currentItemData.operationsForApplication[
                                    idx
                                ].children[itemChil] = {
                                    rowData: this.getTableRowsForApp(
                                        itemChil,
                                        children,
                                        idx
                                    ),
                                    colDef: this.getTableColumnsForApp(
                                        itemChil
                                    ),
                                    create: this.getActionCreateForApp(
                                        idx,
                                        itemChil
                                    )
                                };
                                // xử lý lấy tên
                                let ids = children[itemChil].map((f) => {
                                    return f.id;
                                });
                                let rows = util.cloneDeep(
                                    this.currentItemData
                                        .operationsForApplication[idx].children[
                                        itemChil
                                    ].rowData
                                );
                                if (rows.length > 0)
                                    this.$refs.actionPackForm.getNameObjectIdentifier(
                                        ids,
                                        itemChil,
                                        rows,
                                        idx
                                    );
                            }
                        });
                    }
                });
            });
        },
        getActionCreateForApp(idx, objType) {
            if (
                this.currentItemData.operationsForApplication[idx].children[
                    objType
                ].create
            ) {
                return this.currentItemData.operationsForApplication[idx]
                    .children[objType].create;
            } else return false;
        },
        getTableRowsForApp(objType, data, appIdx) {
            let rows = [];
            data[objType].map((d) => {
                let row = {};
                row['object'] = objType + ':' + d.id;
                d.actions.map((act) => {
                    row[act] = this.checkActionObjectTypeInApp(
                        objType,
                        d.id,
                        act
                    );
                });
                rows.push(row);
            });
            return rows;
        },
        // trả về true false cho các checkbox trong App
        checkActionObjectTypeInApp(objectType, objectIdentifierId, act) {
            let checkbox = false;
            let listObjects = this.currentItemData.tableConfig[objectType];
            if (listObjects && listObjects.rowData) {
                listObjects.rowData.map((obj) => {
                    let id = obj.object.split(' - ')[0];
                    if (id.split(':').length > 1) id = id.split(':')[1];
                    if (objectIdentifierId == id.trim() && obj[act]) {
                        checkbox = true;
                    }
                });
            }
            return checkbox;
        },
        getTableColumnsForApp(objectType) {
            return this.currentItemData.tableConfig[objectType].colDef;
        },
        // Lấy danh sách thông tin các app
        async getListApplication(idApps) {
            let filter = {
                filter: [
                    {
                        column: 'id',
                        operation: 'and',
                        conditions: [
                            {
                                name: 'in',
                                value: idApps
                            }
                        ]
                    }
                ],
                page: 1,
                pageSize: 500
            };
            let res = await appManagementApi.listApps(filter);
            this.$refs.actionPackForm.listAppSelected = res.data.listObject;
            res.data.listObject.map((data) => {
                this.currentItemData.operationsForApplication.map(
                    (app, idx) => {
                        if (data.id == app.id) {
                            this.currentItemData.operationsForApplication[
                                idx
                            ].name = data.name;
                        }
                    }
                );
            });
        },

        getListFilter() {
            accessControlApi.getListFilter().then((res) => {
                if (res.status == 200) {
                    this.listFilter = res.data.listObject;
                } else {
                    this.$snotifyError(
                        this.$t('v2.acessControl.failedGetFilterData')
                    );
                }
            });
        },
        refreshList() {
            this.$refs.listActionPack.refreshList();
        },
        closeForm() {
            this.isLoading = true;
            this.$refs.listActionPack.closeactionPanel();
        },
        detailActionPack(row) {
            this.currentItemData.action = 'view';
            this.$refs.listActionPack.openactionPanel();
            this.actionPackFormKey = Date.now();
            this.getActionPackOperations(row);
            this.applyDataToForm(row);
        },
        updateActionPack(row) {
            this.$refs.listActionPack.openactionPanel();
            this.actionPackFormKey = Date.now();
            this.getActionPackOperations(row);
            this.currentItemData.name = row.name;
            this.currentItemData.id = row.id;
            this.currentItemData.description = row.description;
            this.$set(this.currentItemData.tableConfig, 'filter', {});
            this.currentItemData.action = 'update';
        },
        handleAddItem() {
            this.currentItemData.name = '';
            this.actionPackFormKey = Date.now();
            this.currentItemData.id = 0;
            this.currentItemData.description = '';
            let tableConfig = this.getTableConfig({});
            this.$set(this.currentItemData.operationsObjectType, '', {});
            this.isLoading = false;
            this.$set(
                this.currentItemData,
                'objectType',
                'document_definition'
            );
            this.$set(this.currentItemData, 'operationStateFlow', {});
            this.$set(this.currentItemData, 'listApp', this.allListApp);
            this.$set(this.currentItemData, 'listKanban', this.allListKanban);
            this.$set(this.currentItemData, 'control', {});
            this.$set(this.currentItemData, 'tableConfig', tableConfig);
            this.$set(this.currentItemData, 'operationsObjectType', {});
            this.$set(this.currentItemData, 'operationsForApplication', []);
            this.$set(
                this.currentItemData,
                'listActionForObjectType',
                this.listActionForObjectType
            );
            this.currentItemData.action = 'create';
            setTimeout(() => this.$refs.actionPackForm.setTableData(), 200);
        },
        // lấy tất cả operation theo action pack
        async getActionPackOperations(row) {
            let id = row.id;
            const self = this;
            let res = await permissionApi.getActionPackOperations(id);
            let operations = [];
            if (res.status == 200) {
                operations = res.data;
                self.$set(this.currentItemData, 'operationStateFlow', {});
                self.$refs.actionPackForm.getFilterInActionPack(id, operations);
                let operationsObjectType =
                    this.getOperationsObjectType(operations);
                self.$set(
                    this.currentItemData,
                    'operationsObjectType',
                    operationsObjectType
                );
                let operationStateFlow = this.getOperationStateFlow(operations);
                let tableConfig = this.getTableConfig(
                    util.cloneDeep(operationsObjectType),
                    row
                );
                self.$set(this.currentItemData, 'tableConfig', tableConfig);
                self.$refs.actionPackForm.setDataForDepartment(
                    this.currentItemData.tableConfig.department.rowData
                );
                self.$set(this.currentItemData, 'listApp', this.allListApp);
                self.$set(
                    this.currentItemData,
                    'listActionForObjectType',
                    this.listActionForObjectType
                );
                self.$refs.actionPackForm.getControlOperation(operations);
                self.$set(
                    this.currentItemData,
                    'listKanban',
                    this.allListKanban
                );
                self.$refs.actionPackForm.setKanbanSelected(
                    operationStateFlow,
                    tableConfig['stateflow_flow']
                );
                self.getAppInActionPack();
                self.checkNoSelectOperation();
            } else {
                this.$snotifyError(
                    res,
                    this.$t('v2.acessControl.cannotGetOperations') + id
                );
                return;
            }
        },
        setKanbanSelected(operationKanban) {
            this.currentItemData.operationStateFlow = operationKanban;
        },
        getOperationStateFlow(operationsObjectType) {
            let operation = {};
            let operationStateFlow = _groupBy(
                operationsObjectType,
                'objectType'
            );
            if (operationStateFlow['stateflow_flow']) {
                operation = _groupBy(
                    operationStateFlow['stateflow_flow'],
                    'objectName'
                );
            }
            return operation;
        },
        // trường hợp không chọn gì mà lưu
        checkNoSelectOperation() {
            if (
                this.currentItemData.tableConfig['document_definition'].rowData
                    .length == 1
            ) {
                this.hideLoading();
            }
        },
        // trả về cấu trúc dữ liệu chứa tất cả operation của các objectIdentify
        getOperationsObjectType(operations) {
            let operationsObjectType = {};
            let groupByObjectType = _groupBy(operations, 'objectType');
            Object.keys(groupByObjectType).map((type) => {
                let groupByObjectIdentify = _groupBy(
                    groupByObjectType[type],
                    'objectIdentifier'
                );
                operationsObjectType[type] = groupByObjectIdentify;
            });
            return operationsObjectType;
        },
        // lấy cấu hình cột và dòng cho table, cấu trúc operation: {document_definition:{document_definition:12:[{action:'view}]},wokflow_definition:{},...}
        getTableConfig(operationsObjectType, row) {
            let tableConfig = {};
            let allObjectType = Object.keys(this.listActionForObjectType);
            allObjectType.map((obj) => {
                tableConfig[obj] = {
                    rowData: this.getTableRows(obj, operationsObjectType),
                    colDef: this.getTableColumns(obj),
                    filter: this.getFilters(row),
                    create: this.checkCreateActionForTableConfig(
                        obj,
                        operationsObjectType
                    )
                };
            });
            return tableConfig;
        },
        checkCreateActionForTableConfig(obj, operationsObjectType) {
            if (
                operationsObjectType[obj] &&
                operationsObjectType[obj][obj + ':0']
            ) {
                for (let key in operationsObjectType[obj][obj + ':0']) {
                    if (
                        operationsObjectType[obj][obj + ':0'][key].name ==
                        'create'
                    ) {
                        return true;
                    } else return false;
                }
            } else return false;
        },
        getTableRows(object, operationsObjectType) {
            // this.checkPermissionByObject()
            let rows = [];
            if (operationsObjectType[object]) {
                Object.keys(operationsObjectType[object]).map((obj) => {
                    if (this.objectTypeOneRow.includes(object)) {
                        let row = {};
                        operationsObjectType[object][object + ':0'].map(
                            (opr) => {
                                if (opr.action != 'configFilter') {
                                    row[opr.action] = true;
                                }
                            }
                        );
                        rows.push(row);
                    } else {
                        if (!obj.includes('::0')) {
                            let row = {};
                            row['object'] = obj;
                            operationsObjectType[object][obj].map((opr) => {
                                if (opr.action != 'configFilter') {
                                    row[opr.action] = true;
                                }
                            });
                            if (!row['filter']) row['filter'] = [];
                            rows.push(row);
                        } else {
                            if (
                                Object.keys(operationsObjectType[object])
                                    .length == 1
                            ) {
                                let row = { object: '' };
                                this.listActionForObjectType[object].map(
                                    (act) => {
                                        row[act] = false;
                                    }
                                );
                                rows.push(row);
                            }
                        }
                    }
                });
                this.getNameObjectIdentifier(
                    operationsObjectType[object],
                    object,
                    rows
                );
            } else {
                // thêm row trống nếu k có objectidentifier
                let row = { object: '' };
                this.listActionForObjectType[object].map((act) => {
                    row[act] = false;
                });
                rows.push(row);
            }
            return rows;
        },
        getFilters(row) {
            if ((this.actionOnItem = 'create')) {
                return {};
            } else {
                return row.filterStruct ? row.filterStruct : {};
            }
        },
        // tính chiều rộng tên cột
        calcWidthColTable(colName) {
            let widthCharacter = 7;
            let widthCol = widthCharacter * colName.length + 30;
            return widthCol < 50 ? 50 : widthCol;
        },
        checkPermission(objectType, params) {
            let permission = false;
            if (util.auth.isSupportter()) {
                return true;
            }
            let userOperations = this.$store.state.app.userOperations;
            let action = params.colDef.field;
            if (params.data.object) {
                let objectId = params.data.object.split(' - ')[0];
                if (
                    userOperations[objectType] &&
                    userOperations[objectType][objectId] &&
                    userOperations[objectType][objectId][action]
                ) {
                    permission = true;
                }
            }
            if (this.objectTypeOneRow.includes(objectType)) {
                let userOperations = this.$store.state.app.userOperations;
                if (
                    userOperations[objectType] &&
                    userOperations[objectType][0] &&
                    userOperations[objectType][0][action]
                ) {
                    permission = true;
                }
            }
            return permission;
        },
        getTableColumns(objectType) {
            const self = this;
            let ignoreObject = [
                'document_definition',
                'document_instance',
                'workflow_definition',
                'dashboard'
            ];
            let cols = [];
            cols.push({
                field: 'index_increment',
                headerName: 'STT',
                suppressMenu: true,
                type: 'text',
                pinned: 'left',
                editable: false,
                valueGetter: (params) => {
                    return params.node.rowIndex + 1;
                },
                width: 50
            });
            if (!this.objectTypeOneRow.includes(objectType)) {
                cols.push({
                    field: 'object',
                    headerName: self.$t('v2.acessControl.listOfObjects'),
                    type: 'text',
                    // editable:false,
                    editable:
                        self.currentItemData.action != 'view' &&
                        !ignoreObject.includes(objectType)
                            ? true
                            : false,
                    cellRenderer: 'SearchObjectCellRenderer',
                    cellEditor: 'SearchObjectCellEditor',
                    width: 250,
                    typeFor: 'All'
                });
            }
            let objectActionBasic = [
                'action_pack',
                'filter',
                'permission_pack',
                'system_role',
                'orgchart_role'
            ];
            this.listActionForObjectType[objectType].map((act) => {
                let colName = this.$t(
                    `actions.listActions.${objectType}.${act}`
                );
                if (objectActionBasic.includes(objectType)) {
                    colName = this.$t(`actions.listActions.common.${act}`);
                }
                cols.push({
                    field: act,
                    suppressMenu: true,
                    width: self.calcWidthColTable(colName),
                    editable: false,
                    headerName: colName,
                    cellRenderer: (params) => {
                        const eDiv = document.createElement('div');
                        let input = '';
                        let checkPermission = self.checkPermission(
                            objectType,
                            params
                        );
                        if (checkPermission) {
                            input = `<input class="checkbox" type='checkbox' ${
                                params.value ? 'checked' : ''
                            } />`;
                            eDiv.innerHTML =
                                '<span class="cell-argrid-checkbox">' +
                                input +
                                '</span>';
                            const eButton = eDiv.querySelectorAll(
                                '.cell-argrid-checkbox'
                            )[0];
                            eButton.addEventListener('click', () => {
                                params.node.setDataValue(
                                    params.colDef.field,
                                    !params.value
                                );
                                self.$refs.actionPackForm.synchronizedObjectType(
                                    params,
                                    params.colDef.field,
                                    params.value
                                );
                            });
                        } else {
                            input = `<input disabled class="checkbox" type='checkbox' ${
                                params.value ? 'checked' : ''
                            } />`;
                            eDiv.innerHTML = '<span >' + input + '</span>';
                        }
                        if (self.currentItemData.action == 'view') {
                            input = `<input disabled class="checkbox" type='checkbox' ${
                                params.value ? 'checked' : ''
                            } />`;
                            eDiv.innerHTML = '<span >' + input + '</span>';
                        }

                        return eDiv;
                    }
                });
            });
            cols.push({
                field: 'configFilter',
                width: 200,
                suppressMenu: true,
                cellStyle: { 'white-space': 'normal' },
                autoHeight: true,
                editable: false,
                headerName: this.$t('v2.acessControl.filterConfig'),
                cellRenderer: 'ConfigFilterCellRenderer',
                cellRendererParams: {
                    listActions: this.listActionForObjectType[objectType]
                }
            });
            if (objectType == 'document_definition') {
                cols.push({
                    width: 150,
                    field: 'permission_control',
                    headerName: 'Control',
                    suppressMenu: true,
                    type: 'text',
                    editable: false,
                    cellRenderer: (params) => {
                        const eDiv = document.createElement('div');
                        let hasPermission =
                            self.checkHasPermissionControl(params);
                        let input = `<span class="permission-control" style="text-decoration: underline; cursor: pointer; color:${
                            hasPermission ? 'orange' : 'black'
                        }">${this.$t(
                            'v2.acessControl.decentralization'
                        )} </span>`;
                        eDiv.innerHTML = input;
                        const eButton = eDiv.querySelectorAll(
                            '.permission-control'
                        )[0];
                        eButton.addEventListener('click', () => {
                            self.$refs.actionPackForm.showPermissionControl(
                                params
                            );
                        });

                        return eDiv;
                    }
                });
            }
            return cols;
        },
        // hiển thị màu cho control phân quyền
        checkHasPermissionControl(params) {
            let check = false;
            let data = params.node.data.object;
            if (data && !data.includes('document_definition')) {
                data =
                    'document_definition:' +
                    params.node.data.object.split(' - ')[0];
            }
            if (this.currentItemData.control[data]) {
                this.currentItemData.control[data].outTable.rowData.map(
                    (row) => {
                        Object.keys(row).map((act) => {
                            if (
                                row[act] &&
                                act != 'object' &&
                                act != 'name' &&
                                act != 'configFilter'
                            ) {
                                check = true;
                            }
                        });
                    }
                );
                this.currentItemData.control[data].table.rowData.map((row) => {
                    Object.keys(row).map((act) => {
                        if (
                            row[act] &&
                            act != 'object' &&
                            act != 'name' &&
                            act != 'configFilter'
                        ) {
                            check = true;
                        }
                    });
                });
                let dataInTable = this.currentItemData.control[data].inTable;
                if (JSON.stringify(dataInTable) != '{}') {
                    Object.keys(dataInTable).map((table) => {
                        if (dataInTable[table].rowData) {
                            dataInTable[table].rowData.map((rowTable) => {
                                Object.keys(rowTable).map((act) => {
                                    if (
                                        rowTable[act] &&
                                        act != 'object' &&
                                        act != 'name' &&
                                        act != 'configFilter'
                                    )
                                        check = true;
                                });
                            });
                        }
                    });
                }
            }
            return check;
        },
        async getNameObjectIdentifier(listObjectIdentifier, objectType, rows) {
            let ids = [];
            Object.keys(listObjectIdentifier).map((obj) => {
                if (obj.split(':').length > 1 && obj.split(':')[1])
                    ids.push(obj.split(':')[1]);
            });
            const self = this;
            listObjectIdentifier = Object.keys(listObjectIdentifier).join(',');
            if (objectType == 'document_instance') {
                listObjectIdentifier = listObjectIdentifier.replaceAll(
                    ':0',
                    ''
                );
            }
            let search = {
                type:
                    objectType == 'document_instance'
                        ? 'document_definition'
                        : objectType,
                page: 1,
                ids: listObjectIdentifier,
                pageSize: 10000
            };
            let res = await accessControlApi.getObjectIdentifier(search);
            if (res.status == 200) {
                res.data.listObject = res.data.map((data) => {
                    let object = data;
                    object.id = object.objectIdentifier.split(':')[1];
                    return object;
                });
                if (objectType == 'document_definition') {
                    self.hideLoading();
                }
                this.setNameObjectIdentifier(objectType, rows, res);
            }
        },
        hideLoading() {
            setTimeout(
                (self) => {
                    self.$refs.actionPackForm.calcHeightTable();
                    self.$refs.actionPackForm.setTableData();
                    this.isLoading = false;
                },
                200,
                this
            );
        },
        // set tên cho các object theo objectType sau khi lấy được tên từ api
        setNameObjectIdentifier(objectType, rows, res) {
            this.$refs.actionPackForm.setNameObjectIdentifier(
                objectType,
                rows,
                res
            );
        },
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
        applyDataToForm(row) {
            for (let key in row) {
                this.$set(this.currentItemData, key, row[key]);
            }
        }
    }
};
</script>

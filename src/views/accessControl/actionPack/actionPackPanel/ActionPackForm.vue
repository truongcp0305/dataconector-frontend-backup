<template>
    <div
        class="body pl-2 pr-2 action-pack-panel h-100"
        @click="handleClickOutSide"
    >
        <div class="wrapper">
            <div class="header title py-2 d-flex justify-space-between">
                <span class="fs-15 fw-500 ml-2">
                    <v-icon :size="15">mdi-tune</v-icon>
                    {{ $t('common.actionPack') }}
                </span>
                <HeaderInputValue :item="itemData" />
                <span>
                    <v-btn
                        v-show="itemData.action != 'view'"
                        class="mr-1 mb-1"
                        small
                        depressed
                        :loading="isLoading"
                        color="success"
                        @click="clickActionBtn"
                    >
                        {{ $t('common.save') }}
                    </v-btn>
                    <v-btn small icon class="mb-1">
                        <v-icon
                            :size="16"
                            class="close-btn"
                            @click="closeActionPackForm"
                            >mdi-close</v-icon
                        >
                    </v-btn>
                </span>
            </div>
            <span class="d-flex h-100 overflow-scroll">
                <div
                    class="d-flex flex-column pt-3 mr-2 ml-1"
                    style="width: 200px"
                >
                    <div
                        v-for="(item, i) in listObject"
                        :key="i"
                        :class="{
                            'py-2 pl-1 fs-13 mr-3 action-pack-object': true,
                            'action-pack-object-active': hightlightObjectActive(
                                item.value
                            )
                        }"
                        @click="handleChangeObjectType(item.value)"
                    >
                        <span class="pl-2">
                            <v-icon :size="14" :class="item.icon"></v-icon>
                            {{ item.text }}
                        </span>
                    </div>
                </div>
                <div class="wrap-action-pack" style="width: calc(100% - 180px)">
                    <div class="mt-1 info-actionpack mb-3">
                        <div class="fs-15 fw-430 mb-2 mt-3 d-flex align-center">
                            <span v-if="isShowPermissionControl">
                                <v-btn
                                    v-if="permissionControl.show == true"
                                    x-small
                                    text
                                    icon
                                    @click="backToOriginalView"
                                >
                                    <v-icon size="15"
                                        >mdi-chevron-left</v-icon
                                    ></v-btn
                                >
                                {{
                                    $t(
                                        'permissions.actionPack.permissionAction'
                                    )
                                }}
                                <span
                                    class="ml-2 color-orange"
                                    v-if="permissionControl.show == true"
                                >
                                    {{ permissionControl.name }}
                                </span>
                            </span>
                            <span
                                v-show="
                                    objectActive == 'system_role' ||
                                    objectActive == 'orgchart_role'
                                "
                            >
                                <v-btn
                                    :color="
                                        i == show.selectedRoleTab
                                            ? 'orange'
                                            : 'black'
                                    "
                                    small
                                    text
                                    v-for="(item, i) in show.object['role']"
                                    :key="i"
                                    @click="item.action(i)"
                                >
                                    <span class="fs-13">{{ item.name }}</span>
                                </v-btn>
                            </span>
                            <span
                                v-show="
                                    objectActive == 'dashboard' ||
                                    objectActive == 'dashboard_tab'
                                "
                            >
                                <v-btn
                                    :color="
                                        i == show.selectedDashboardTab
                                            ? 'orange'
                                            : 'black'
                                    "
                                    small
                                    text
                                    v-for="(item, i) in show.object[
                                        'dashboard'
                                    ]"
                                    :key="i"
                                    @click="item.action(i)"
                                >
                                    <span class="fs-13">{{ item.name }}</span>
                                </v-btn>
                            </span>
                            <span
                                v-show="
                                    objectActive == 'orgchart' ||
                                    objectActive == 'department'
                                "
                            >
                                <v-btn
                                    :color="
                                        i == show.selectedOrgchartTab
                                            ? 'orange'
                                            : 'black'
                                    "
                                    small
                                    text
                                    v-for="(item, i) in show.object['orgchart']"
                                    :key="i"
                                    @click="item.action(i)"
                                >
                                    <span class="fs-13">{{ item.name }}</span>
                                </v-btn>
                            </span>
                            <v-icon
                                :size="15"
                                v-show="objectTypeInfo[objectActive]"
                                class="mb-1 mx-2"
                                style="margin-top: 5px"
                                @click="
                                    objectTypeInfo[objectActive].isShow = true
                                "
                                >mdi-information-outline</v-icon
                            >
                        </div>
                        <SymperAlert
                            class="my-2"
                            v-if="
                                objectTypeInfo[objectActive] &&
                                objectTypeInfo[objectActive].isShow
                            "
                            :context="objectTypeInfo[objectActive].value"
                            @hide="hideObjectTypeInfo"
                        />
                    </div>
                    <div
                        v-if="
                            objectActive == 'application' &&
                            permissionControl.show != true
                        "
                        class="info-actionpack"
                    >
                        <ApplicationDefinitionForm
                            ref="applicationDefinitionForm"
                            :gridOptions="gridOptions"
                            :defaultColDef="defaultColDef"
                            :itemData="itemData"
                            @app-selected="selectedApp"
                            @list-item-selected="handleListAppSelected"
                            :listApp="listAppSelected"
                        />
                    </div>
                    <div
                        v-else-if="
                            show.showDepartment && objectActive == 'orgchart'
                        "
                    >
                        <ConfigActionPackOrgchart
                            @permission-selected="handlePermissionSelected"
                            @department-selected="handleDepartmentSelected"
                            :checkboxes="permissionDepartment"
                            :departmentSelected="departmentSelectedProps"
                        />
                    </div>
                    <div v-else-if="objectActive == 'stateflow_flow'">
                        <StateFlowForm
                            ref="stateflow"
                            :columnDefs="columnTable"
                            :gridOptions="gridOptions"
                            :defaultColDef="defaultColDef"
                            :itemData="itemData"
                            :listSelectedStateFlow="listStateFlowSelected"
                            :rowData="rowTable"
                            @kanban-selected="handleSelectedKanban"
                            @list-item-selected="handleListStateFlowSelected"
                        />
                    </div>
                    <div v-else>
                        <div class="content">
                            <div
                                class="w-100"
                                v-show="permissionControl.show != true"
                            >
                                <Preloader
                                    v-show="loadingTable"
                                    style="position: static !important"
                                    class="mx-auto"
                                />
                                <v-checkbox
                                    v-if="
                                        objectActive != 'document_instance' &&
                                        !onlyOneRow.includes(objectActive)
                                    "
                                    class="fs-13 sym-small-size"
                                    :label="$t('v2.acessControl.createNew')"
                                    dense
                                    @change="changeInputActionCreate"
                                    v-model="
                                        itemData.tableConfig[objectActive]
                                            .create
                                    "
                                ></v-checkbox>
                                <ag-grid-vue
                                    :getContextMenuItems="getContextMenuItems"
                                    class="
                                        ag-theme-balham
                                        agrid-table
                                        ag-list-items-table
                                        w-100
                                    "
                                    :columnDefs="columnTable"
                                    @cell-key-down="onCellKeyDown"
                                    :style="{
                                        height:
                                            gridOptions.containerHeight + 'px',
                                        display: loadingTable ? 'none' : 'block'
                                    }"
                                    :defaultColDef="defaultColDef"
                                    :gridOptions="gridOptions"
                                    :rowData="rowTable"
                                >
                                </ag-grid-vue>
                            </div>
                            <div
                                v-if="
                                    permissionControl.show == true &&
                                    itemData.control[
                                        permissionControl.objectIdentifier
                                    ]
                                "
                            >
                                <PermissionControl
                                    @click-row="setCurrentTable"
                                    :itemData="control"
                                    :loading="permissionControl.loading"
                                    :gridOptions="gridOptions"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </span>
        </div>
        <AutocompleteInput
            :usePositionBox="true"
            :customPosition="dragPanel"
            ref="autocompleteInput"
            @after-select-row="handleSelectObjectIdentifier"
        />
        <SymperDialogConfirm
            :max-width="450"
            @confirm="confirmSynDoc.confirm()"
            @cancel="cancelConfirmSynDoc"
            :title="confirmSynDoc.title"
            :content="confirmSynDoc.content"
            :showDialog="confirmSynDoc.show"
        >
            <template slot="extra-content">
                <v-card-text>
                    <v-checkbox
                        :label="$t('v2.acessControl.saveActionForNextTime')"
                        v-model="applySynchronize.show"
                    ></v-checkbox>
                </v-card-text>
            </template>
        </SymperDialogConfirm>
        <SymperDialogConfirm
            :max-width="450"
            :showIconClose="true"
            @close="confirmCloseDialog.show = false"
            @confirm="confirmClose()"
            @cancel="cancelClose"
            :title="confirmCloseDialog.title"
            :titleCancelBtn="confirmCloseDialog.titleCancel"
            :titleConfirmBtn="confirmCloseDialog.titleConfirm"
            :colorConfirmBtn="confirmCloseDialog.colorConfirm"
            :content="confirmCloseDialog.content"
            :showDialog="confirmCloseDialog.show"
        />
        <v-dialog
            v-model="showConfigFilter"
            width="500"
            content-class="bg-white h-100 "
        >
            <ConfigFilter
                :showEditor="permissionControl.show"
                ref="configFilter"
                @close="closeConfigFilter"
                @add-filter="addFilterInConditionTree"
                :item="itemFilterConfig"
                @save-filter="saveFilter"
                @delete-filter="deleteFilter"
            />
        </v-dialog>
    </div>
</template>

<script>
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import { AgGridVue } from 'ag-grid-vue';
import SearchObjectCellRenderer from '../SearchObjectCellRenderer';
import ConfigFilterCellRenderer from '../ConfigFilterCellRenderer';
import { SearchObjectCellEditor } from '../SearchObjectCellEditor';

import { util } from '@/plugins/util';
import ActionPackWorker from 'worker-loader!@/worker/accessControl/ActionPack.Worker.js';
import _groupBy from 'lodash/groupBy';

import AutocompleteInput from './../../../document/submit/items/AutocompleteInput';
import PermissionControl from './PermissionControl.vue';
import SymperDragPanel from '@/components/common/SymperDragPanel.vue';
import ConfigActionPackOrgchart from './ConfigActionPackOrgchart.vue';
import ConfigFilter from './ConfigFilter.vue';
import HeaderInputValue from './HeaderInputValue.vue';
import ApplicationDefinitionForm from '@/views/accessControl/actionPack/helpers/ApplicationDefinitionForm';
import StateFlowForm from '@/views/accessControl/actionPack/helpers/StateFlowForm';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
import Preloader from '@/components/common/Preloader.vue';
import SymperAlert from '@/components/common/SymperAlert.vue';

import { permissionApi } from '@/api/permissionPack';
import { accessControlApi } from '../../../../api/accessControl';
import { datasetApi } from '@/api/dataset';
import { kanbanApi } from '@/api/kanban.js';
import { documentApi } from '@/api/Document';

export default {
    components: {
        'ag-grid-vue': AgGridVue,
        PermissionControl,
        SymperDragPanel,
        AutocompleteInput,
        ConfigActionPackOrgchart,
        ConfigFilter,
        ApplicationDefinitionForm,
        StateFlowForm,
        SymperDialogConfirm,
        HeaderInputValue,
        Preloader,
        SymperAlert
    },
    props: {
        listFilter: {
            type: Array,
            default() {
                return [];
            }
        },
        itemData: {
            type: Object,
            default() {
                return {};
            }
        },
        typeAction: {
            type: String,
            default() {
                return 'create';
            }
        }
    },
    computed: {
        isShowPermissionControl() {
            let hideObject = [
                'orgchart',
                'dashboard',
                'dashboard_tab',
                'system_role',
                'orgchart_role'
            ];
            return !hideObject.includes(this.objectActive);
        }
    },
    data() {
        const self = this;
        return {
            currentTable: 'tableInDoc',
            application: {
                tabIdx: 0,
                app: ''
            },
            rowTable: [],
            columnTable: [],
            loadingTable: false,
            ignoreCol: [
                'index_increment',
                'object',
                'filter',
                'configFilter',
                'name'
            ],
            control: {},
            permissionControl: {
                show: false,
                name: '',
                objectIdentifier: '',
                listControl: [],
                loading: false
            },
            filterInActionPack: [],
            show: {
                // showTab
                object: {
                    orgchart: [
                        {
                            name: self.$t('objectType.Orgchart'),
                            action: (tabIndex) => {
                                self.showOrgchart(true, tabIndex);
                            }
                        },
                        {
                            name: self.$t('objectType.Department'),
                            action: (tabIndex) => {
                                self.showOrgchart(false, tabIndex);
                            }
                        }
                    ],
                    dashboard: [
                        {
                            name: self.$t('objects.dashboard'),
                            action: (tabIndex) => {
                                self.showDashboard(true, tabIndex);
                            }
                        },
                        {
                            name: self.$t('v2.acessControl.dashboardTab'),
                            action: (tabIndex) => {
                                self.showDashboard(false, tabIndex);
                            }
                        }
                    ],
                    role: [
                        {
                            name: self.$t('v2.acessControl.systemRole'),
                            action: (tabIndex) => {
                                self.showRole(true, tabIndex);
                            }
                        },
                        {
                            name: self.$t('v2.acessControl.orgchartRole'),
                            action: (tabIndex) => {
                                self.showRole(false, tabIndex);
                            }
                        }
                    ]
                },
                showOrgchartRole: false,
                showSystemtRole: true,
                showDepartment: false,
                showOrgchart: true,
                showDasboard: true,
                showTabDashboard: false,
                selectedOrgchartTab: 0,
                selectedRoleTab: 0,
                selectedDashboardTab: 0
            },
            objectIdentifier: '',
            applySynchronize: {
                show: false,
                type: 'delete',
                isConfirm: false
            },
            confirmCloseDialog: {
                show: false,
                title: `<i class='mdi mdi-alert-outline color-orange mr-1' style="font-size:18px"></i><span class="fs-15">${this.$t(
                    'v2.acessControl.unsavedChange'
                )}</span>`,
                content: self.$t('v2.acessControl.yourChangesHaveNotSaved'),
                colorConfirm: 'primary',
                titleConfirm: self.$t('v2.acessControl.saveChange'),
                titleCancel: self.$t('v2.acessControl.doNotSave')
            },
            showConfigFilter: false,
            tableSearch: {
                headers: [
                    {
                        value: 'nameObject',
                        text: self.$t('v2.acessControl.object')
                    }
                ],
                dataBody: []
            },
            pastedData: '',
            confirmSynDoc: {
                title: '',
                content: '',
                show: false,
                cancel: () => this.cancel(),
                confirm: () => this.confirm(),
                object: ''
            },
            objectTypeInfo: {
                document_definition: {
                    value: `${self.$t(
                        'v2.acessControl.documentDefinitionInfor'
                    )}
                    </br>
                    ${self.$t('v2.acessControl.filterInfor')}`,
                    link: '',
                    isShow: true
                },
                document_instance: {
                    value: `${self.$t(
                        'v2.acessControl.documentInstanceInfor'
                    )}</br>
                    ${self.$t('v2.acessControl.filterInfor')}`,
                    link: '',
                    isShow: true
                },
                application: {
                    value: `${self.$t('v2.acessControl.applicationInfor')}</br>
                    ${self.$t('v2.acessControl.filterInfor')}`,
                    link: '',
                    isShow: true
                }
            },
            defaultColDef: {
                sortable: true,
                resizable: true,
                autoHeight: true,
                filter: true,
                suppressKeyboardEvent: function (params) {
                    let keyCode = params.event.keyCode;
                    let event = params.event;
                    if (event.key == 'Tab') {
                        params.api.stopEditing();
                    }
                    if (keyCode == 13 && params.event.shiftKey) {
                        return true;
                    } else if (keyCode == 46 || keyCode == 8) {
                        return true;
                    }
                }
            },

            gridOptions: {
                containerHeight: 450,
                headerHeight: 25,
                rowHeight: 30,
                enableRangeSelection: true,
                enableRangeHandle: true,
                suppressClipboardPaste: true,
                applyColumnDefOrder: true,
                components: {
                    SearchObjectCellRenderer: SearchObjectCellRenderer,
                    SearchObjectCellEditor: SearchObjectCellEditor,
                    ConfigFilterCellRenderer: ConfigFilterCellRenderer
                },
                onPasteStart: this.onPasteStart
            },
            dragPanel: {
                width: 300,
                top: 400,
                left: 0
            },
            listObjectIdentifierSearch: [],
            listFilters: [],
            oldFilters: [],
            isLoading: false,
            actionPackWorker: null,
            listAppSelected: [],
            listStateFlowSelected: [],
            listObject: [], //
            objectActive: 'document_definition',
            permissionDepartment: [],
            departmentSelected: [],
            departmentSelectedProps: [],
            itemFilterConfig: {
                actions: [], // danh sách action
                filters: [] // danh sách filter
            },
            currentKanban: '',
            onlyOneRow: [
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
        this.getListObjectTypes();
    },
    mounted() {
        let self = this;

        this.$evtBus.$on('change-application-tab', (tabIdx) => {
            self.application.tabIdx = tabIdx;
        });
        this.$evtBus.$on('set-config-filter-control', (params) => {
            let control = params.object;
            Object.keys(self.control).map((type) => {
                if (type == 'inTable') {
                    Object.keys(self.control[type]).map((tbName) => {
                        self.control[type][tbName].rowData.map(
                            (row, rowIdx) => {
                                if (row.object == control) {
                                    self.control[type][tbName].rowData[
                                        rowIdx
                                    ].configFilter = params.configFilter;
                                }
                            }
                        );
                    });
                } else {
                    self.control[type].rowData.map((row, rowIdx) => {
                        if (row.object == control) {
                            self.control[type].rowData[rowIdx].configFilter =
                                params.configFilter;
                        }
                    });
                }
            });
            let permissionControl = this.itemData.control;
            permissionControl[this.permissionControl.objectIdentifier] =
                self.control;
            this.$emit('set-control', permissionControl);
        });
        this.$evtBus.$on('detail-filter-config', (params) => {
            if (self.itemData.action != 'view') {
                self.showConfigFilter = true;
                if (self.permissionControl.show) {
                    let objectIdentifier = params.params.data.name;
                    self.getItemFilterConfigForControl(
                        objectIdentifier,
                        params
                    );
                    setTimeout(
                        (self) => {
                            self.$refs.configFilter.setData(
                                params.configFilter
                            );
                        },
                        200,
                        this
                    );
                } else {
                    let objectIdentifier = params.objectIdentifier;
                    this.objectIdentifier = params.objectIdentifier;
                    let objectActive = self.getObjectActive();
                    objectIdentifier =
                        objectActive +
                        ':' +
                        params.objectIdentifier.split(' - ')[0];
                    self.getItemFilterConfig(objectIdentifier, objectActive);
                    if (self.$refs.configFilter) {
                        self.$refs.configFilter.setData(params.configFilter);
                    } else {
                        setTimeout(
                            (self) => {
                                self.$refs.configFilter.setData(
                                    params.configFilter
                                );
                            },
                            500,
                            this
                        );
                    }
                }
            }
        });
        this.$evtBus.$on('action-pack-form-push-application', (app) => {
            self.itemData.operationsForApplication.push(app);
        });
        this.$evtBus.$on('action-pack-form-set-application', (app) => {
            self.itemData.operationsForApplication[
                this.itemData.operationsForApplication.length - 1
            ] = app;
        });

        // click vào nút cộng trong column config
        this.$evtBus.$on('click-add-filter-config-action-pack', (params) => {
            if (self.itemData.action != 'view') {
                if (self.permissionControl.show) {
                    let condition = self.getVariablesCondition();
                    let valueFilter = [condition];
                    let objectIdentifier = params.params.data.name;
                    self.getItemFilterConfigForControl(
                        objectIdentifier,
                        params
                    );
                    self.showConfigFilter = true;
                    self.permissionControl.rowNode = params.params.node;
                    setTimeout(
                        (self) => {
                            self.$refs.configFilter.setData(valueFilter);
                        },
                        200,
                        this
                    );
                } else {
                    let condition = self.getVariablesCondition();
                    let valueFilter = [condition];
                    let objectIdentifier = '';
                    let objectActive = self.getObjectActive();
                    if (params.objectIdentifier.split(' - ').length > 0) {
                        objectIdentifier =
                            objectActive +
                            ':' +
                            params.objectIdentifier.split(' - ')[0];
                        self.getItemFilterConfig(
                            objectIdentifier,
                            objectActive
                        );
                        // trường hợp không có object được chọn
                        if (
                            !self.itemData.tableConfig[objectActive].filter[
                                objectIdentifier
                            ]
                        ) {
                            // trường hợp tạo mới
                            self.itemData.tableConfig[objectActive].filter[
                                objectIdentifier
                            ] = valueFilter;
                            self.objectIdentifier = objectIdentifier;
                        }
                    }
                    self.showConfigFilter = true;
                    setTimeout(
                        (self) => {
                            self.$refs.configFilter.setData(valueFilter);
                        },
                        200,
                        this
                    );
                }
            }
        });
        window.addEventListener('paste', this.onPasteStart);
        this.actionPackWorker = new ActionPackWorker();
        this.actionPackWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'updateActionPack':
                    if (data.dataAfter == 'success') {
                        self.listAppSelected = [];
                        self.listStateFlowSelected = [];
                        self.cancelClose();
                        self.$emit('refresh-show-list');
                        self.$snotifySuccess(
                            self.$t('v2.acessControl.successfullEdited')
                        );
                    } else {
                        self.$snotifyError(
                            data.dataAfter,
                            self.$t('v2.acessControl.anErrorOccurred')
                        );
                    }
                    self.isLoading = false;
                    break;
                case 'createActionPack':
                    if (data.dataAfter == 'success') {
                        self.listAppSelected = [];
                        self.listStateFlowSelected = [];
                        self.cancelClose();
                        self.$emit('refresh-show-list');
                        self.isLoading = false;
                        self.$snotifySuccess(
                            self.$t('v2.acessControl.successfullAddedNew')
                        );
                    } else {
                        self.$snotifyError(
                            data.dataAfter,
                            self.$t('v2.acessControl.anErrorOccurred')
                        );
                    }
                    self.isLoading = false;
                    break;
                default:
                    break;
            }
            self.refreshListFilter();
        });
        this.$evtBus.$on('action-pack-search-objectIdentifier', (e) => {
            this.tableSearch.dataBody = [];
            if (e && e.type == 'All') {
                self.listObjectIdentifierSearch = [];
                this.dragPanel.width = e.cellWidth + 'px!important';
                this.handleSearchObjectIdentifier(e.e.target.value);
                this.dragPanel.left = e.position.left + 'px';
                this.dragPanel.top = e.position.top + 42 + 'px';
                if (this.$refs.autocompleteInput) {
                    this.$refs.autocompleteInput.setCurrentInput(e.e.target);
                    this.$refs.autocompleteInput.show(e, 'nameObject');
                    this.$refs.autocompleteInput.setTypeInput('autocomplete');
                    this.$refs.autocompleteInput.setControlValueKey(
                        'nameObject'
                    );
                }
            }
        });
        this.$evtBus.$on('action-pack-getNameObjectIdentifier', (data) => {
            this.getNameObjectIdentifier(
                data.ids,
                data.objType,
                data.rows,
                data.appIdx
            );
        });
        this.$evtBus.$on('on-cell-key-down', (params) => {
            this.onCellKeyDown(params);
        });
    },
    watch: {
        listFilter: {
            deep: true,
            immediate: true,
            handler(vl) {
                this.listFilters = util.cloneDeep(this.listFilter);
            }
        }
    },
    methods: {
        setDataForDepartment(data) {
            data.map((e) => {
                if (e.object == 'department:0') {
                    if (e.view_only_sub)
                        this.permissionDepartment.push('view_only_sub');
                    if (e.view_only_owner)
                        this.permissionDepartment.push('view_only_owner');
                } else {
                    if (!this.permissionDepartment.includes('view_other'))
                        this.permissionDepartment.push('view_other');
                    this.departmentSelected.push(e.object);
                    this.departmentSelectedProps.push(e.object);
                }
            });
        },
        changeInputActionCreate(e) {
            if (e) {
                this.itemData.tableConfig[this.objectActive].create = true;
            } else this.itemData.tableConfig[this.objectActive].create = false;
        },
        async handleSelectedKanban(kanbanId) {
            this.currentKanban = kanbanId;
            const self = this;
            if (
                this.itemData.operationStateFlow &&
                !this.itemData.operationStateFlow[kanbanId]
            ) {
                let res = await kanbanApi.getBoard(kanbanId);
                let rows = [];
                if (res.status == 200) {
                    let stateflow = JSON.parse(res.data[0].state_config);
                    stateflow = stateflow.links;
                    if (JSON.stringify(stateflow) != '{}') {
                        Object.keys(stateflow).map((stateId) => {
                            let row = { object: stateflow[stateId].name };
                            row.id =
                                res.data[0].id_doc +
                                '_' +
                                stateflow[stateId].oldId;
                            rows.push(row);
                        });
                    }
                    if (rows.length == 0) {
                        rows.push({ object: '' });
                    }
                    self.itemData.operationStateFlow[kanbanId] = {
                        rowData: rows,
                        colDef: self.itemData.tableConfig['stateflow_flow']
                            .colDef
                    };
                    self.rowTable =
                        self.itemData.operationStateFlow[kanbanId].rowData;
                }
            } else {
                this.rowTable =
                    this.itemData.operationStateFlow[kanbanId].rowData;
            }
        },
        closeConfigFilter() {
            this.showConfigFilter = false;
            this.itemFilterConfig = {
                actions: [],
                filters: []
            };
        },
        setCurrentTable(tblName) {
            this.currentTable = tblName;
        },
        setTableData() {
            if (this.objectActive == 'stateflow_flow') {
                this.columnTable =
                    this.itemData.tableConfig[this.objectActive].colDef;
                if (Object.keys(this.itemData.operationStateFlow).length > 0) {
                    let firstKanban = Object.keys(
                        this.itemData.operationStateFlow
                    )[0];
                    this.rowTable =
                        this.itemData.operationStateFlow[firstKanban].rowData;
                } else {
                    this.rowTable = [{ object: '' }];
                }
            } else {
                if (this.itemData.tableConfig[this.objectActive]) {
                    if (!this.objectActive)
                        this.objectActive = 'document_definition';
                    this.columnTable =
                        this.itemData.tableConfig[this.objectActive].colDef;
                    let check = this.itemData.tableConfig[
                        this.objectActive
                    ].rowData.every((r) =>
                        r.object ? r.object.split(':').length > 1 : false
                    );
                    this.loadingTable = check ? true : false;
                    this.rowTable =
                        this.itemData.tableConfig[this.objectActive].rowData;
                } else {
                    this.columnTable = [];
                    this.rowTable = [];
                }
            }
        },
        hightlightObjectActive(value) {
            if (value == this.objectActive) {
                return true;
            }
            if (this.objectActive == 'dashboard_tab' && value == 'dashboard') {
                return true;
            }
        },
        backToOriginalView() {
            this.permissionControl.show = false;
            this.setTableData();
            this.reAssignItemData();
            // render lại data check màu title
        },
        selectedApp(app) {
            this.application.app = app;
        },
        clickActionBtn() {
            if (this.itemData.action == 'detail') {
                this.switchToUpdateForm();
            } else {
                this.saveActionPack();
            }
        },
        handleClickPermissionControl(params, value, typeTable) {
            let field = params.colDef.field;
            let rowIndex = params.node.id;
            if (typeTable == 'table') {
                this.itemData.control[this.permissionControl.objectIdentifier][
                    typeTable
                ].rowData[rowIndex][field] = value;
            } else {
                this.currentTable = typeTable;
                this.itemData.control[this.permissionControl.objectIdentifier][
                    'inTable'
                ][typeTable].rowData[rowIndex][field] = value;
            }
            this.$emit('set-control', this.itemData.control);
        },
        getDefaultColDefControl() {
            let colDef = [
                {
                    field: 'index_increment',
                    headerName: 'STT',
                    pinned: 'left',
                    type: 'text',
                    editable: false,
                    valueGetter: (params) => {
                        return params.node.rowIndex + 1;
                    },
                    width: 150
                },
                {
                    field: 'name',
                    headerName: this.$t('permissions.name_control'),
                    type: 'text',
                    editable: false,
                    width: 150
                },
                {
                    field: 'object',
                    headerName: this.$t('permissions.title_control'),
                    type: 'text',
                    editable: false,
                    width: 150
                }
            ];
            return colDef;
        },
        getConfigAColumn(name, width = 200, typeTable = 'table') {
            const self = this;
            let col = {
                field: name,
                headerName: this.$t('permissions.' + name),
                type: 'text',
                width: width,
                flex: 1,
                cellRenderer: (params) => {
                    const eDiv = document.createElement('div');
                    let input = `<input class="checkbox" type='checkbox' ${
                        params.value ? 'checked' : ''
                    } />`;
                    if (this.itemData.action == 'view') {
                        input = `<input disabled class="checkbox" type='checkbox' ${
                            params.value ? 'checked' : ''
                        } />`;
                    }
                    eDiv.innerHTML =
                        '<span class="my-css-class">' + input + '</span>';
                    const eButton = eDiv.querySelectorAll('.checkbox')[0];
                    eButton.addEventListener('click', () => {
                        params.node.setDataValue(
                            params.colDef.field,
                            !params.value
                        );
                        self.handleClickPermissionControl(
                            params,
                            !params.value,
                            typeTable
                        );
                    });
                    return eDiv;
                }
            };
            return col;
        },
        getColDefInTableControl(tableName) {
            let width = 200;
            let colDef = this.getDefaultColDefControl();
            this.itemData.listActionForObjectType['document_control'].map(
                (act) => {
                    if (act != 'not_remove' && act != 'old_rows_not_remove') {
                        if (act == 'readonly' || act == 'hide') width = 300;
                        colDef.push(
                            this.getConfigAColumn(act, width, tableName)
                        );
                    }
                }
            );
            colDef.push(this.getColDefFilterConfig());
            return colDef;
        },
        getColDefControlTable() {
            let width = 200;
            let colDef = this.getDefaultColDefControl();
            if (!this.itemData.listActionForObjectType['document_control']) {
                this.itemData.listActionForObjectType['document_control'] = [];
            }
            this.itemData.listActionForObjectType['document_control'].map(
                (act) => {
                    if (act != 'not_remove') {
                        if (act == 'readonly' || act == 'hide') width = 300;
                        colDef.push(this.getConfigAColumn(act, width, 'table'));
                    }
                }
            );
            colDef.push(this.getColDefFilterConfig(true));
            return colDef;
        },

        getColDefFilterConfig(isTable = false) {
            return {
                field: 'configFilter',
                width: 200,
                cellStyle: { 'white-space': 'normal' },
                autoHeight: true,
                editable: false,
                headerName: this.$t('permissions.filter.config'),
                cellRenderer: 'ConfigFilterCellRenderer',
                cellRendererParams: {
                    isTable: isTable ? true : false
                }
            };
        },
        getColDefControl() {
            let colDef = this.getDefaultColDefControl();
            if (!this.itemData.listActionForObjectType['document_control']) {
                this.itemData.listActionForObjectType['document_control'] = [];
            }
            this.itemData.listActionForObjectType['document_control'].map(
                (act) => {
                    if (
                        act != 'old_rows_readonly' &&
                        act != 'old_rows_not_remove'
                    ) {
                        colDef.push(
                            this.getConfigAColumn(act, 300, 'outTable')
                        );
                    }
                }
            );
            colDef.push(this.getColDefFilterConfig());
            return colDef;
        },
        async setKanbanSelected(operationStateFlow, tableConfig) {
            const self = this;
            // lấy giá trị kanban và lấy tên state flow

            Object.keys(operationStateFlow).map((operation, oprIdx) => {
                let kanban = self.itemData.listKanban.filter(
                    (kanban) => kanban.id == operation
                )[0];
                if (kanban) {
                    this.setRowForEachKanban(
                        kanban,
                        operationStateFlow,
                        operation,
                        tableConfig,
                        oprIdx
                    );
                }
            });
        },
        async setRowForEachKanban(
            kanban,
            operationStateFlow,
            operation,
            tableConfig,
            oprIdx
        ) {
            const self = this;
            let res = await kanbanApi.getBoard(kanban.id);
            let rows = [];
            if (res.status == 200) {
                let stateflow = JSON.parse(res.data[0].state_config);
                stateflow = stateflow.links;
                if (JSON.stringify(stateflow) != '{}') {
                    Object.keys(stateflow).map((stateId) => {
                        let nameState = stateflow[stateId].name;
                        let row = { object: nameState };
                        row.id =
                            res.data[0].id_doc + '_' + stateflow[stateId].oldId;
                        let stateSelected = operationStateFlow[
                            operation
                        ].filter(
                            (opr) =>
                                opr.objectIdentifier.split(':')[1] ==
                                res.data[0].id_doc +
                                    '_' +
                                    stateflow[stateId].oldId
                        );
                        if (stateSelected.length > 0) {
                            row.use = true;
                        }
                        rows.push(row);
                    });
                }
                self.listStateFlowSelected.push(kanban);
                self.itemData.operationStateFlow[operation] = {
                    rowData: rows,
                    colDef: tableConfig.colDef
                };
                this.$emit(
                    'set-kanban-selected',
                    this.itemData.operationStateFlow
                );
            }
        },
        // hiện mặc định kanban đầu tiên
        setDefaultFirstKanban(firstKanbanSelected) {
            this.itemData.tableConfig['stateflow_flow'].rowData =
                this.itemData.operationStateFlow[firstKanbanSelected].rowData;
            this.$emit(
                'set-first-kanban-selected',
                this.itemData.tableConfig['stateflow_flow'].rowData
            );
        },
        // lấy operation của control đã lưu để tích checkbox
        getControlOperation(operation) {
            const self = this;
            let listControl = operation.filter(
                (f) => f.objectType == 'control'
            );
            listControl.map(
                (control) =>
                    (control.docId =
                        'document_definition:' +
                        control.objectIdentifier.split(':')[1])
            );
            listControl = _groupBy(listControl, 'docId');
            Object.keys(listControl).map((docId) => {
                let controlConfig = {
                    inTable: {},
                    table: {
                        colDef: this.getColDefControlTable(),
                        rowData: []
                    },
                    outTable: { colDef: this.getColDefControl(), rowData: [] }
                };
                let controlInTable = {};
                let rowOutTable = [];
                let rowInTable = [];
                let rowControlTable = [];
                listControl[docId].map((c) => {
                    let configFilter = [];
                    let row = {
                        object: c.name,
                        old_rows_readonly:
                            c.action == 'old_rows_readonly' ? true : false,
                        old_rows_not_remove:
                            c.action == 'old_rows_not_remove' ? true : false,
                        not_remove: c.action == 'not_remove' ? true : false,
                        readonly: c.action == 'readonly' ? true : false,
                        hide: c.action == 'hide' ? true : false,
                        configFilter: configFilter,
                        name: c.objectIdentifier.split(':')[2]
                    };
                    if (c.description == 'table') {
                        // trong table
                        let checkExist = rowControlTable.filter(
                            (f) => f.object == c.name
                        );
                        if (checkExist.length == 0) {
                            rowControlTable.push(row);
                        } else {
                            rowControlTable.map((r, rIdx) => {
                                if (r.object == c.name) {
                                    rowControlTable[rIdx][c.action] = true;
                                }
                            });
                        }
                    } else if (c.description == 'outTable') {
                        let checkExist = rowOutTable.filter(
                            (f) => f.object == c.name
                        );
                        if (checkExist.length == 0) {
                            rowOutTable.push(row);
                        } else {
                            rowOutTable.map((r, rIdx) => {
                                if (r.object == c.name) {
                                    rowOutTable[rIdx][c.action] = true;
                                }
                            });
                        }
                    } else {
                        let tableName = c.description;
                        let checkExist = rowInTable.filter(
                            (f) => f.object == c.name
                        );
                        if (checkExist.length == 0) {
                            rowInTable.push(row);
                        } else {
                            rowInTable.map((r, rIdx) => {
                                if (r.object == c.name) {
                                    rowInTable[rIdx][c.action] = true;
                                }
                            });
                        }
                        controlInTable[tableName] = {
                            colDef: this.getColDefInTableControl(tableName),
                            rowData: rowInTable
                        };
                    }
                });
                controlConfig.outTable.rowData = rowOutTable;
                controlConfig.table.rowData = rowControlTable;
                controlConfig.inTable = controlInTable;
                listControl[docId] = controlConfig;
                self.getRowControlTable(docId.split(':')[1]);
                //this.checkExistControl(docId, controlConfig)
            });
            this.itemData.control = listControl;
            this.$emit('set-control', listControl);
        },
        checkExistControl(docId, controlConfig) {
            let row = controlConfig;
            if (
                this.itemData.control[docId] &&
                this.itemData.control[docId].outTable.rowData.length > 0
            ) {
                row = this.itemData.control[docId].outTable.rowData;
                controlConfig.outTable.rowData.map((control, controlIdx) => {
                    row.map((r, rowIdx) => {
                        if (r.object == control.object) {
                            row[rowIdx] = control;
                        }
                    });
                });
            }
            return row;
        },
        // lấy row cho control table
        getRowControlTable(docId, first = false) {
            let objectIdentifier = 'document_definition:' + docId;
            const self = this;
            let listControls = [];
            let rowControlTable = [];
            documentApi.detailDocument(docId).then((res) => {
                if (res.status === 200) {
                    let fieldDoc = Object.values(res.data.fields);
                    fieldDoc.map((f) => {
                        if (f.type != 'table') {
                            if (
                                ![
                                    'submit',
                                    'approvalHistory',
                                    'reset',
                                    'draft'
                                ].includes(f.type)
                            ) {
                                let exist = false; // trường hợp update
                                if (
                                    self.itemData.control[objectIdentifier] &&
                                    self.itemData.control[objectIdentifier]
                                        .outTable.rowData.length > 0
                                ) {
                                    self.itemData.control[
                                        objectIdentifier
                                    ].outTable.rowData.map((r, rIdx) => {
                                        if (f.properties.title == r.object) {
                                            listControls.push(r);
                                            exist = true;
                                        }
                                    });
                                }
                                if (!exist) {
                                    listControls.push({
                                        object: f.properties.title,
                                        hide: false,
                                        not_remove: false,
                                        readonly: false,
                                        old_rows_readonly: false,
                                        old_rows_not_remove: false,
                                        name: f.properties.name
                                    });
                                }
                            }
                        } else {
                            //
                            let fields = [];
                            let existTable = false; // trường hợp update
                            if (
                                self.itemData.control[objectIdentifier] &&
                                self.itemData.control[objectIdentifier].table
                                    .rowData.length > 0
                            ) {
                                self.itemData.control[
                                    objectIdentifier
                                ].table.rowData.map((r, rIdx) => {
                                    if (f.properties.title == r.object) {
                                        rowControlTable.push(r);
                                        existTable = true;
                                    }
                                });
                            }
                            if (!existTable) {
                                rowControlTable.push({
                                    object: f.properties.title,
                                    hide: false,
                                    not_remove: false,
                                    readonly: false,
                                    old_rows_not_remove: false,
                                    old_rows_readonly: false,
                                    name: f.properties.name
                                });
                            }
                            let rowTable =
                                self.itemData.control[objectIdentifier] &&
                                self.itemData.control[objectIdentifier].inTable[
                                    f.properties.name
                                ]
                                    ? self.itemData.control[objectIdentifier]
                                          .inTable[f.properties.name]
                                    : null;
                            Object.values(f.listFields).map((fieldTable) => {
                                let exist = false;
                                if (rowTable) {
                                    let oldRow = rowTable.rowData;
                                    oldRow.map((r) => {
                                        if (
                                            fieldTable.properties.title ==
                                            r.object
                                        ) {
                                            fields.push(r);
                                            exist = true;
                                        }
                                    });
                                }
                                if (!exist) {
                                    fields.push({
                                        object: fieldTable.properties.title,
                                        hide: false,
                                        not_remove: false,
                                        readonly: false,
                                        old_rows_not_remove: false,
                                        old_rows_readonly: false,
                                        name: fieldTable.properties.name
                                    });
                                }
                            });
                            if (
                                !this.itemData.control[objectIdentifier]
                                    .inTable[f.properties.name]
                            ) {
                                this.itemData.control[objectIdentifier].inTable[
                                    f.properties.name
                                ] = {
                                    rowData: [],
                                    colDef: this.getColDefInTableControl(
                                        f.properties.name
                                    )
                                };
                            }
                            fields = this.getConfigFilterForControl(
                                fields,
                                docId
                            );
                            this.itemData.control[objectIdentifier].inTable[
                                f.properties.name
                            ].rowData = fields;
                        }
                    });

                    self.$set(
                        self.itemData.control[objectIdentifier].outTable,
                        'rowData',
                        this.getConfigFilterForControl(listControls, docId)
                    );
                    self.$set(
                        self.itemData.control[objectIdentifier].table,
                        'rowData',
                        this.getConfigFilterForControl(rowControlTable, docId)
                    );
                    if (first) {
                        self.$set(
                            self,
                            'control',
                            self.itemData.control[objectIdentifier]
                        );
                        self.permissionControl.loading = false;
                    }
                    this.$emit('set-control', self.itemData.control);
                }
            });
        },
        getConfigFilterForControl(rows, documentId) {
            this.filterInActionPack.map((data) => {
                if (
                    data.object_identifier &&
                    data.object_identifier.split(':')[0] == 'control'
                ) {
                    let controls = data.object_identifier.split(',');
                    let docId = this.permissionControl.name.split(' - ')[0];
                    if (documentId) {
                        docId = documentId;
                    }
                    controls.map((con) => {
                        rows.map((row, rowIdx) => {
                            let object = 'control:' + docId + ':' + row.name;
                            if (con == object) {
                                rows[rowIdx].configFilter =
                                    this.getFilterStruct(data.filter_struct);
                            }
                        });
                    });
                }
            });
            return rows;
        },
        showPermissionControl(params) {
            if (!params.data.object) {
                return;
            }
            this.permissionControl.show = true;
            this.permissionControl.name = params.node.data.object;
            this.permissionControl.objectIdentifier =
                'document_definition:' +
                params.node.data.object.split(' - ')[0];
            if (
                !this.itemData.control[this.permissionControl.objectIdentifier]
            ) {
                this.itemData.control[this.permissionControl.objectIdentifier] =
                    {
                        outTable: {
                            colDef: this.getColDefControl(),
                            rowData: []
                        },
                        inTable: {},
                        table: {
                            colDef: this.getColDefControlTable(),
                            rowData: []
                        }
                    };
                this.permissionControl.loading = true;
                this.getRowControlTable(
                    params.node.data.object.split(' - ')[0],
                    true
                );
            } else {
                this.control =
                    this.itemData.control[
                        this.permissionControl.objectIdentifier
                    ];
            }
        },
        setFilter(filter) {
            this.listFilters = util.cloneDeep(filter);
        },
        getItemFilterConfigForControl(objectIdentifier, params) {
            let docId = this.permissionControl.name.split(' - ')[0];
            let nameControl = 'control:' + docId + ':' + objectIdentifier;
            this.itemFilterConfig.filters = [];
            this.listFilters.map((filter) => {
                if (filter.objectIdentifier.split(':')[0] == 'control') {
                    let controls = filter.objectIdentifier.split(',');
                    if (controls.includes(nameControl)) {
                        this.itemFilterConfig.filters.push({
                            title: filter.name,
                            name: filter.name,
                            field: filter.name,
                            id: filter.id,
                            columnName: filter.name,
                            as: filter.name,
                            agg: 'not_agg'
                        });
                    }
                }
            });
            let ignoreCol = ['hide', 'not_remove', ...this.ignoreCol];
            if (!params.isTable) {
                ignoreCol = [...ignoreCol, 'old_rows_not_remove'];
            } else {
                ignoreCol.push('readonly');
            }
            let actionsConfig = [];
            let actions = params.params.data;
            Object.keys(actions).map((act) => {
                if (!ignoreCol.includes(act)) {
                    actionsConfig.push({
                        headerName: this.$t('permissions.' + act),
                        field: act
                    });
                }
            });
            this.itemFilterConfig.actions = actionsConfig;
        },
        // lấy danh sách filter và action cấu hình theo objectIdentifier
        getItemFilterConfig(objectIdentifier, objectActive) {
            this.itemFilterConfig.filters = this.listFilter.filter(
                (filter) => filter.objectIdentifier == objectIdentifier
            );
            this.itemFilterConfig.filters.map((filter) => {
                filter.title = filter.name;
                filter.id = filter.id;
                filter.name = filter.name;
                filter.columnName = filter.name;
                filter.as = filter.name;
                filter.agg = 'not_agg';
            });
            this.itemFilterConfig.actions = this.itemData.tableConfig[
                objectActive
            ].colDef.filter((fil) => !this.ignoreCol.includes(fil.field));
        },
        showOrgchart(value, i) {
            this.show.showOrgchart = value;
            this.show.showDepartment = !value;
            this.show.selectedOrgchartTab = i;
            if (!value) {
                this.handleConfigDepartment();
            }
        },
        showRole(value, i) {
            this.show.showOrgchartRole = !value;
            this.show.showSystemRole = value;
            this.show.showOrgchart = false;
            this.show.showDepartment = false;
            if (value) {
                this.objectActive = 'system_role';
            } else {
                this.objectActive = 'orgchart_role';
            }
            this.setTableData();
            this.show.selectedRoleTab = i;
        },
        showDashboard(value, i) {
            this.show.showDashboard = value;
            this.show.showTabDashboard = !value;
            this.show.showOrgchart = false;
            this.show.showDepartment = false;
            if (!value) {
                this.objectActive = 'dashboard_tab';
            } else {
                this.objectActive = 'dashboard';
            }
            this.setTableData();
            this.show.selectedDashboardTab = i;
        },
        hideObjectTypeInfo() {
            this.objectTypeInfo[this.objectActive].isShow = false;
            this.calcHeightTable(true);
        },
        // lấy tab đang focus
        getObjectActive() {
            if (this.objectActive == 'application') {
                if (this.$refs.applicationDefinitionForm) {
                    return this.$refs.applicationDefinitionForm.$refs
                        .objectInApplication.openingTabKey;
                } else {
                    return 'document_definition';
                }
            } else {
                return this.objectActive;
            }
        },
        // lấy ra list id filter được dùng trong cây điều kiện
        getFilterIdsInCondition(params) {
            let filters = [];
            params.map((p) => {
                p.conditions.map((con) => {
                    filters.push(this.getIdsInCondition(con));
                });
            });
            return filters.flat();
        },
        // lấy id filter trong cây điều kiện
        getIdsInCondition(node) {
            if (!node.condition) {
                let id = node.column.id;
                return id;
            } else if (node.condition) {
                let arrCond = [];
                for (let childNode of node.children) {
                    let itemCond = this.getIdsInCondition(childNode);
                    arrCond.push(itemCond);
                }
                return arrCond;
            }
        },
        // thêm giá trị và value của filter
        addFilterStructAndValue(params) {
            let filters = this.getFilterIdsInCondition(params);
            this.listFilters.map((filter, idx) => {
                if (filters.includes(filter.id)) {
                    this.listFilters[idx].filterStruct = params;
                    this.listFilters[idx].filterValues =
                        this.getListFilterValues(params);
                }
            });
        },
        // trả về 1 công thức điều kiện sau khi kết hợp nhiều filter
        getListFilterValues(params) {
            let filter = [];
            params.map((p) => {
                if (p.conditions.length > 0) {
                    p.conditions.map((con) => {
                        filter.push(this.getFilterValues(con));
                    });
                }
            });
            return filter.join('OR');
        },
        // lấy từng công thức điều kiện cụ thể của 1 filter
        getFilterValues(node) {
            if (!node.condition) {
                let field = node.column ? node.column.formula : '';
                let conditionName = `${field}`;
                return ` ${conditionName} `;
            } else if (node.condition) {
                let arrCond = [];
                for (let childNode of node.children) {
                    let itemCond = this.getFilterValues(childNode);
                    arrCond.push(itemCond);
                }
                let opr = node.name == 'OR' ? '||' : '&&';
                let cond = arrCond.join(opr);
                return ` (${cond}) `;
            }
        },
        // xử lý khi ấn lưu filter
        saveFilter(params) {
            this.addFilterStructAndValue(params);
            this.showConfigFilter = false;
            if (this.permissionControl.show == true) {
                params.tableName = this.currentTable;
                params.params = params;
                this.$evtBus.$emit('set-config-filter-action-pack', params);
            } else {
                let rowIndex = this.gridOptions.api.getFocusedCell().rowIndex;
                let rowModel = this.gridOptions.api.getModel();
                let rowNode = rowModel.rowsToDisplay[rowIndex];
                rowNode.setDataValue('configFilter', []);
                rowNode.setDataValue('configFilter', params);
                this.gridOptions.api.applyTransaction({
                    update: [rowNode.data]
                });
                this.gridOptions.api.resetRowHeights();
                this.setFilterConfig(params, rowIndex);
            }
        },
        // xử lý set filter
        setFilterConfig(params, rowIndex) {
            let objectType = this.getObjectActive();
            let objectIdentifier = this.objectIdentifier;
            this.itemData.tableConfig[objectType].filter[objectIdentifier] =
                params;
            if (this.objectActive == 'application') {
                this.itemData.tableConfig[objectType].rowData.map(
                    (row, rowIdx) => {
                        if (
                            this.formatToObjectIdentifier(
                                objectType,
                                row.object
                            ) == objectIdentifier ||
                            objectIdentifier == row.object
                        ) {
                            rowIndex = rowIdx;
                        }
                    }
                );
            }
            this.itemData.tableConfig[objectType].rowData[
                rowIndex
            ].configFilter = params;
            this.addConfigFilterInApp(params, objectType, objectIdentifier);
            this.setTableData();
            this.reAssignItemData();
        },
        // xử lý trường hợp thêm filter ở bên App
        addConfigFilterInApp(params, objectType, objectIdentifier) {
            this.itemData.operationsForApplication.map((app, appIdx) => {
                app.children[objectType].rowData.map((row, rowIdx) => {
                    if (
                        this.formatToObjectIdentifier(objectType, row.object) ==
                            objectIdentifier ||
                        objectIdentifier == row.object
                    ) {
                        this.itemData.operationsForApplication[appIdx].children[
                            objectType
                        ].rowData[rowIdx].configFilter = params;
                    }
                });
            });
        },
        getFocusRowIndex() {
            return this.gridOptions.api.getFocusedCell().rowIndex;
        },
        deleteFilter(index) {
            let configFilter = this.$refs.configFilter.getData();
            let rowIndex = this.getFocusRowIndex();
            let objectType = this.getObjectActive();
            let objectIdentifier = '';
            if (!this.permissionControl.show) {
                if (this.objectActive == 'application') {
                    let appSelected =
                        this.$refs.applicationDefinitionForm
                            .selectedApplication;
                    this.itemData.operationsForApplication.map((app) => {
                        if (app.id == appSelected) {
                            objectIdentifier =
                                app.children[objectType].rowData[rowIndex]
                                    .object;
                        }
                    });
                } else {
                    objectIdentifier =
                        this.itemData.tableConfig[objectType].rowData[rowIndex]
                            .object;
                }
                objectIdentifier = this.formatToObjectIdentifier(
                    objectType,
                    objectIdentifier
                );
                this.itemData.tableConfig[objectType].filter[objectIdentifier] =
                    configFilter;
                this.itemData.tableConfig[objectType].filter[
                    objectIdentifier
                ].splice(index, 1);
                this.setTableData();
                this.$refs.configFilter.setData(
                    this.itemData.tableConfig[objectType].filter[
                        objectIdentifier
                    ]
                );
            } else {
                this.removeFilterInListFilter(configFilter[index]);
                configFilter.splice(index, 1);
                this.$refs.configFilter.setData(configFilter);
            }
        },
        removeFilterInListFilter(params) {
            let filterIds = this.getFilterIdsInCondition([params]);
            this.listFilters.map((fil, filIdx) => {
                if (filterIds.includes(fil.id)) {
                    this.listFilters[filIdx].filterStruct = '';
                }
            });
        },
        // chuyển từ dạng 2154 - wbs thành document_definition:2154
        formatToObjectIdentifier(objectType, objectIdentifier) {
            return objectType + ':' + objectIdentifier.split(' - ')[0];
        },
        getVariablesCondition() {
            let treeConfigData = {
                conditions: [
                    {
                        id: 'root',
                        name: 'AND',
                        root: true,
                        label: 'AND',
                        parent: false,
                        children: [
                            {
                                id: Date.now(),
                                condition: false,
                                name: '',
                                parent: 'root',
                                formulas: '',
                                nodeType: 'item',
                                operator: '='
                            }
                        ],
                        nodeType: 'group',
                        condition: true
                    }
                ],
                actions: []
            };
            return treeConfigData;
        },
        // xử lý khi ấn add thêm filter bộ lọc
        addFilterInConditionTree() {
            let objectType = this.getObjectActive();
            let objectIdentifier = this.objectIdentifier;
            let treeConfigData = this.getVariablesCondition();
            this.itemData.tableConfig[objectType].filter[objectIdentifier] =
                this.$refs.configFilter.getData();
            if (
                this.itemData.tableConfig[objectType].filter[objectIdentifier]
            ) {
                this.itemData.tableConfig[objectType].filter[
                    objectIdentifier
                ].push(treeConfigData);
            } else {
                this.itemData.tableConfig[objectType].filter[objectIdentifier] =
                    [treeConfigData];
            }
            this.$refs.configFilter.setData(
                this.itemData.tableConfig[objectType].filter[objectIdentifier]
            );
        },
        // tính toán chiều cao table
        calcHeightTable(hideInfoDiv = false) {
            let heightParentDiv =
                $('.action-pack-panel').height() - $('.header').height();
            let info = $('.info-actionpack').height();
            let margin = 70;
            if (hideInfoDiv) {
                info = 0;
                margin = 40;
            }
            let hasInfo = [
                'application',
                'document_instance',
                'document_definition'
            ];
            if (!hasInfo.includes(this.objectActive)) {
                margin = 50;
            }
            if (this.objectActive == 'application') margin = 140;
            if (heightParentDiv > 0) {
                this.gridOptions.containerHeight =
                    heightParentDiv - info - margin;
            }
        },
        onPasteStart(event) {
            var clipboardData = event.clipboardData || window.clipboardData;
            var pastedData =
                clipboardData.getData('Text') ||
                clipboardData.getData('text/plain');
            if (!pastedData && pastedData.length) {
                return;
            }
            this.pastedData = pastedData;
        },
        // lấy danh sách tất cả đối tượng
        getListObjectTypes() {
            let allActionByObjectType =
                this.$store.state.actionPack.getAllActionByObjectType;
            let rsl = [];
            let hiddenObject = [
                'department',
                'dashboard_tab',
                'document_control',
                'orgchart_role'
            ];
            Object.keys(allActionByObjectType).map((key) => {
                if (!hiddenObject.includes(key)) {
                    rsl.push({
                        text: this.$t('objects.' + key),
                        value: key,
                        icon: this.$i('input.' + key),
                        link: '',
                        description: ''
                    });
                }
            });
            rsl.unshift({
                text: this.$t('objects.application'),
                value: 'application',
                icon: this.$i('input.' + 'application'),
                link: '',
                description: ''
            });
            this.listObject = rsl;
            return rsl;
        },
        // xử lý phần đồng bộ giữa các objectType
        synchronizedObjectType(params, col, value) {
            if (this.objectActive == 'application') {
                this.handleSynchronizedWhenClickApp(params, col, value);
            } else if (this.objectActive == 'stateflow_flow') {
                this.handleSelectedStateFlow(params, col, value);
            } else {
                this.handleSynchronizedWhenClickObject(params, col, value);
            }
            // this.setTableData()
            this.reAssignItemData();
        },
        handleSelectedStateFlow(params, col, value) {
            if (!this.currentKanban)
                this.currentKanban = Object.keys(
                    this.itemData.operationStateFlow
                )[0];
            this.itemData.operationStateFlow[this.currentKanban].rowData[
                params.node.rowIndex
            ][col] = !value;
        },
        // xử lý đồng bộ khi xóa doc
        synchronizedDoc(params, type) {
            let object =
                this.objectActive == 'document_definition'
                    ? this.$t('v2.acessControl.listOfRecords')
                    : this.$t('v2.doc.listOfRecords');
            this.confirmSynDoc.object =
                type == 'delete' ? params.node.data.object : params;
            this.applySynchronize.type = type;
            if (type == 'delete') {
                this.confirmSynDoc.content =
                    this.$t('v2.acessControl.authorizationObject') +
                    this.confirmSynDoc.object +
                    this.$t('v2.acessControl.removedFromHierarchy') +
                    object +
                    this.$t('v2.acessControl.confirmRemoveObject');
                this.confirmSynDoc.title = this.$t(
                    'v2.acessControl.syncObject'
                );
            }
            if (!this.applySynchronize.show && type == 'delete') {
                if (params.node.data.object) this.confirmSynDoc.show = true;
            } else {
                if (
                    this.applySynchronize.show &&
                    this.applySynchronize.isConfirm
                )
                    this.confirm();
                if (!this.applySynchronize.show) this.confirm();
            }
        },
        // xử lý trường hợp không phải app
        handleSynchronizedWhenClickObject(params, col, value) {
            const self = this;
            let objectIdentifier = params.data.object;
            this.itemData.operationsForApplication.map((app, appIdx) => {
                if (app.children[this.objectActive]) {
                    if (app.children[this.objectActive].rowData) {
                        app.children[this.objectActive].rowData.map(
                            (row, rowIdx) => {
                                if (row.object == objectIdentifier) {
                                    let rowObjectIdex =
                                        self.itemData.operationsForApplication[ // row trong application
                                            appIdx
                                        ].children[self.objectActive].rowData
                                            .findIndex(
                                                (val, idx) =>
                                                    val.object ==
                                                    objectIdentifier
                                            );
                                    self.itemData.operationsForApplication[
                                        appIdx
                                    ].children[self.objectActive].rowData[
                                        rowObjectIdex
                                    ] = params.data;
                                }
                            }
                        );
                    }
                }
            });
            if (
                this.itemData.tableConfig[this.objectActive].rowData[
                    params.node.rowIndex
                ]
            ) {
                this.itemData.tableConfig[this.objectActive].rowData[
                    params.node.rowIndex
                ][col] = !value;
            }
        },
        // đồng bộ giữa app và các đối tượng, khi click vào app thì các đối tượng cũng tự check tương ứng
        handleSynchronizedWhenClickApp(params, col, value) {
            const self = this;
            let object = params.data.object;
            if (
                this.$refs.applicationDefinitionForm &&
                this.$refs.applicationDefinitionForm.$refs.objectInApplication
            ) {
                let objectTypeInApp = this.getObjectActive();
                this.synchonizeActionClickApp(
                    object,
                    col,
                    value,
                    objectTypeInApp,
                    params
                );
                this.synchonizeActionBetweenApp(
                    object,
                    col,
                    value,
                    objectTypeInApp,
                    params
                );
                if (this.checkEmptyAllActionInApp(params)) {
                    // trường hợp không có action nào thì xóa các đối tượng
                    this.itemData.tableConfig[objectTypeInApp].rowData.map(
                        (row, rowIdx) => {
                            if (row.object == object) {
                                self.deleteObject(objectTypeInApp, rowIdx);
                                self.addRowIfEmpty(objectTypeInApp);
                            }
                        }
                    );
                    // xóa cả 2 nếu là văn bản hoặc bản ghi
                    if (this.checkIsDocType(objectTypeInApp)) {
                        let objectType = this.switchTypeDoc(objectTypeInApp);
                        this.itemData.tableConfig[objectType].rowData.map(
                            (row, rowIdx) => {
                                if (row.object == object) {
                                    self.deleteObject(objectType, rowIdx);
                                }
                            }
                        );
                        this.addRowIfEmpty(objectType);
                    }
                }
            }
        },
        // xóa dòng theo nhóm đối tượng và vị trí dòng
        deleteObject(objectType, rowIdx) {
            this.itemData.tableConfig[objectType].rowData.splice(rowIdx, 1);
        },
        switchTypeDoc(type) {
            return type == 'document_definition'
                ? 'document_instance'
                : 'document_definition';
        },
        checkIsDocType(type) {
            return type == 'document_definition' || type == 'document_instance';
        },
        // tìm đối tượng bên các app đang có để xử lý đồng bộ check/uncheck
        synchonizeActionBetweenApp(
            object,
            col,
            value,
            objectTypeInApp,
            params
        ) {
            const self = this;
            this.itemData.operationsForApplication.map((app, appIdx) => {
                app.children[objectTypeInApp].rowData.map((row, rowIdx) => {
                    if (row.object == object) {
                        self.itemData.operationsForApplication[appIdx].children[
                            objectTypeInApp
                        ].rowData[rowIdx][col] = !value;
                    }
                });
            });
        },
        // click app thì action bên đối tượng cũng check
        synchonizeActionClickApp(object, col, value, objectType, params) {
            let isExistObject = false; //  chưa có đối tượng trong nhóm đối tượng
            this.itemData.tableConfig[objectType].rowData.map((row, rowIdx) => {
                if (row.object == object) {
                    isExistObject = true;
                    this.itemData.tableConfig[objectType].rowData[rowIdx][col] =
                        !value;
                }
            });
            //
            if (!isExistObject) {
                // check trống thì xóa
                this.checkEmptyRow(objectType);
                if (objectType == 'document_definition')
                    this.checkEmptyRow('document_instance');
                this.itemData.tableConfig[objectType].rowData.push(params.data);
                // đồng bộ giữa doc và bản ghi
                if (this.checkIsDocType(objectType)) {
                    let switchType = this.switchTypeDoc(objectType);
                    let formatRow = util.cloneDeep(params.data);
                    Object.keys(formatRow).map((act) => {
                        if (act != 'object' && act != 'index_increment') {
                            formatRow[act] = false;
                        }
                    });
                    this.itemData.tableConfig[switchType].rowData.push(
                        formatRow
                    );
                }
            }
        },
        // nếu có dòng trống trước đó thì xóa đi
        checkEmptyRow(objectType) {
            if (this.itemData.tableConfig[objectType].rowData.length == 1) {
                let onlyRow = this.itemData.tableConfig[objectType].rowData[0];
                let checkEmptyRow = Object.keys(onlyRow).every(
                    (key) => onlyRow[key] == '' || onlyRow[key] == false
                );
                if (checkEmptyRow)
                    this.itemData.tableConfig[objectType].rowData = [];
            }
        },
        // check 1 đối tượng không có action nào trong app
        checkEmptyAllActionInApp(params) {
            let rowData = { ...params.data };
            rowData['object'] = '';
            let emptyAllAction = true; // không có action nào trong app
            Object.keys(rowData).map((act) => {
                if (rowData[act]) emptyAllAction = false;
            });
            return emptyAllAction;
        },
        addRowIfEmpty(currentObject) {
            if (this.itemData.tableConfig[currentObject].rowData.length == 0) {
                let row = { object: '' };
                this.itemData.listActionForObjectType[currentObject].map(
                    (act) => {
                        row[act] = '';
                    }
                );
                this.itemData.tableConfig[currentObject].rowData.push(row);
            }
        },
        handleClickOutSide(evt) {
            if (
                this.$refs.autocompleteInput &&
                !$(evt.target).closest('.card-autocomplete').length
            ) {
                this.$refs.autocompleteInput.hide();
                if (this.gridOptions.api) {
                    this.gridOptions.api.stopEditing(true);
                    this.gridOptions.api.clearRangeSelection();
                }
            }
            if (
                !$(evt.target).closest('.add-app').length &&
                !$(evt.target).closest('.autocomplete').length
            ) {
                this.$evtBus.$emit('hide-btn-add-app');
            }
            this.$evtBus.$emit('click-out-side', evt);
        },
        closeAllDragPanel() {
            $('.symper-drag-panel').css('display', 'none');
        },
        // khi click vào chọn objectIdentifier trong popup search
        handleSelectObjectIdentifier(value) {
            let currentCell = this.gridOptions.api.getFocusedCell();
            let name = value.value.inputDislay;
            if (name) {
                let rowIndex = this.gridOptions.api.getFocusedCell().rowIndex;
                let rowModel = this.gridOptions.api.getModel();
                let rowNode = rowModel.rowsToDisplay[rowIndex];
                this.applySynchronize.oldValue = rowNode.data.object;
                rowNode.setDataValue('object', name);
                this.updateDataItem();
            }
            if (
                this.objectActive == 'document_definition' ||
                this.objectActive == 'document_instance'
            ) {
                this.synchronizedDoc(name, 'add');
            }
            this.gridOptions.api.stopEditing(true);
            this.gridOptions.api.setFocusedCell(
                currentCell.rowIndex,
                currentCell.column.colDef.field
            );
        },
        // tìm kiếm đối tượng trong các cell
        async handleSearchObjectIdentifier(value) {
            let objectType = this.objectActive;
            if (value.includes(' - ')) value = value.split(' - ')[0];
            if (objectType == 'document_instance')
                objectType = 'document_definition';
            const self = this;
            let search = {
                type: objectType,
                page: 1,
                keyword: value,
                pageSize: 10
            };
            let res = await accessControlApi.getObjectIdentifier(search);
            if (res.status == 200) {
                self.listObjectIdentifierSearch = res.data;
                if (res.data.length == 0) {
                    self.listObjectIdentifierSearch = [{ id: '', name: '' }];
                }
                this.setAutocomplete();
            }
        },
        // set data cho phần search
        setAutocomplete() {
            this.tableSearch.dataBody = [];
            this.listObjectIdentifierSearch.map((object) => {
                if (object.objectIdentifier) {
                    let nameObject =
                        object.objectIdentifier.split(':')[1] +
                        ' - ' +
                        object.name;
                    if (nameObject != ' - ') {
                        this.tableSearch.dataBody.push({
                            nameObject: nameObject,
                            active: false
                        });
                    }
                }
            });
            if (this.$refs.autocompleteInput) {
                this.$refs.autocompleteInput.setAliasControl('nameObject');
                this.$refs.autocompleteInput.setData(this.tableSearch);
            }
        },

        async searchDataset(search) {
            const self = this;
            let res = await datasetApi.getListByFilter(search);
            if (res.status == 200) {
                self.listObjectIdentifierSearch = res.data.listObject;
                if (res.data.listObject.length == 0) {
                    self.listObjectIdentifierSearch = [{ id: '', name: '' }];
                }
                this.setAutocomplete();
            }
        },
        getContextMenuItems(params) {
            const self = this;
            let ignoreObject = [
                'document_definition',
                'workflow_definition',
                'dashboard',
                'account',
                'data_connector',
                'system_role',
                'orgchart_role',
                'permission_pack',
                'filter',
                'action_pack'
            ];
            if (ignoreObject.includes(this.objectActive)) {
                return [];
            }
            let submitContextItem = [
                {
                    name: self.$t('v2.acessControl.removeRow'),
                    action: function () {
                        self.gridOptions.api.applyTransaction({
                            remove: [params.node.data]
                        });
                        self.updateDataItem();
                        self.checkNoRow();
                        if (
                            self.objectActive == 'document_definition' ||
                            self.objectActive == 'document_instance'
                        ) {
                            self.synchronizedDoc(params, 'delete');
                        }
                    },
                    cssClasses: ['redFont']
                },
                {
                    name: self.$t('v2.acessControl.addRow'),
                    shortcut: 'Shift + Enter',
                    action: function () {
                        let row = { object: '' };
                        self.itemData.listActionForObjectType[
                            self.objectActive
                        ].map((act) => {
                            row[act] = '';
                        });
                        params.api.applyTransaction({
                            add: [row],
                            addIndex: params.node.rowIndex + 1
                        });
                        self.updateDataItem();
                    },
                    cssClasses: ['redFont']
                }
            ];
            return submitContextItem;
        },
        checkNoRow() {
            let allRow = this.gridOptions.api.getDisplayedRowCount();
            if (allRow == 0) {
                this.addNewRow(0);
            }
        },
        // xử lý update vào data gốc
        updateDataItem() {
            let allRow = this.getAllRow();
            this.itemData.tableConfig[this.objectActive].rowData = allRow;
        },
        getAllRow() {
            let rowData = [];
            this.gridOptions.api.forEachNode((node) => {
                rowData.push(Object.assign({}, node.data));
            });
            return rowData;
        },
        // xử lý khi đóng actionpack
        closeActionPackForm() {
            // if(this.itemData.action != 'view'){
            //     this.confirmCloseDialog.show = true;
            // }else{
            this.cancelClose();
            // }
        },
        confirmClose() {
            this.saveActionPack();
        },
        refreshShowList() {
            this.$emit('refresh-list');
        },
        cancelClose() {
            this.listStateFlowSelected = [];
            this.listAppSelected = [];
            this.$emit('close-form');
            this.closeAllDragPanel();
            this.refreshListFilter();
            this.refreshPermissionControl();
        },
        refreshPermissionControl() {
            this.permissionControl.show = false;
            this.permissionControl.name = '';
        },
        refreshListFilter() {
            this.listFilters = this.listFilter;
            this.itemFilterConfig = {
                actions: [],
                filters: []
            };
            this.listFilters = this.listFilter;
            this.filterInActionPack = [];
        },
        getFilterInActionPack(id, operations) {
            const self = this;
            accessControlApi.getFilterInActionPack(id).then((res) => {
                if (res.status == 200) {
                    self.filterInActionPack = res.data ? res.data : [];
                    self.listFilters.map((filter, filterIdx) => {
                        self.filterInActionPack.map((data) => {
                            if (data.id == filter.id) {
                                if (data.filter_struct)
                                    self.listFilters[filterIdx].filterStruct =
                                        this.getFilterStruct(
                                            data.filter_struct
                                        );
                                self.listFilters[filterIdx].filterValues =
                                    data.filter_values;
                            }
                        });
                    });
                } else {
                    console.log('Lỗi filter ');
                }
                this.getControlOperation(operations);
            });
        },
        // lấy thông tin tất cả các app đã chọn trong action pack
        async getNameObjectIdentifier(ids, objectType, rows, appIdx) {
            const self = this;
            let listId = [];
            ids.map((id) => {
                if (objectType == 'document_instance') {
                    listId.push('document_definition:' + id);
                } else {
                    listId.push(objectType + ':' + id);
                }
            });
            listId = listId.join(',');
            let search = {
                type:
                    objectType == 'document_instance'
                        ? 'document_definition'
                        : objectType,
                page: 1,
                ids: listId,
                pageSize: 10000
            };
            let res = await accessControlApi.getObjectIdentifier(search);
            if (res.status == 200) {
                rows.map((row, rowIdx) => {
                    res.data.map((data) => {
                        ids.push(data.id);
                        if (
                            row.object.split(':').length > 1 &&
                            row.object.split(':')[1] ==
                                data.objectIdentifier.split(':')[1]
                        ) {
                            rows[rowIdx].object =
                                data.objectIdentifier.split(':')[1] +
                                ' - ' +
                                data.name;
                        }
                    });
                });
                if (this.filterInActionPack.length > 0) {
                    this.filterInActionPack.map((data) => {
                        rows.map((row, rowIdx) => {
                            if (
                                data.object_identifier &&
                                row.object.split(' - ')[0] ==
                                    data.object_identifier.split(':')[1] &&
                                objectType ==
                                    data.object_identifier.split(':')[0]
                            ) {
                                if (data.filter_struct) {
                                    rows.filter[row.object] =
                                        this.getFilterStruct(
                                            data.filter_struct
                                        );
                                    rows[rowIdx].configFilter =
                                        this.getFilterStruct(
                                            data.filter_struct
                                        );
                                }
                            }
                        });
                    });
                }
                if (
                    self.itemData.operationsForApplication[appIdx].children &&
                    self.itemData.operationsForApplication[appIdx].children[
                        objectType
                    ].rowData &&
                    rows.length > 0
                ) {
                    self.itemData.operationsForApplication[appIdx].children[
                        objectType
                    ].rowData = util.cloneDeep(rows);
                }
                if (objectType == 'document_definition') {
                    self.itemData.operationsForApplication[appIdx].children[
                        'document_instance'
                    ].rowData = util.cloneDeep(
                        self.itemData.operationsForApplication[appIdx].children[
                            'document_definition'
                        ].rowData
                    );
                }
                // console.log('get-name', objectType, self.itemData.operationsForApplication[appIdx].children)
                this.checkExistName(appIdx, objectType);
            } else {
                self.$snotifyError(self.$t('v2.acessControl.cannotGetDocData'));
            }
        },
        // lấy action theo cấu trúc cũ
        getActionForOldFilter(action, objectIdentifier) {
            let actions = [];
            let objectType = objectIdentifier.split(':')[0];
            JSON.parse(action).map((act) => {
                actions.push({
                    suppressMenu: true,
                    editable: false,
                    field: act,
                    headerName: this.$t(
                        'actions.listActions.' + objectType + '.' + act
                    )
                });
            });
            return actions;
        },
        //lấy điều kiện theo cấu trúc cũ
        getConditionsForOldFilter(fil, listFilters) {
            let value = [
                {
                    id: 'root',
                    name: 'AND',
                    root: true,
                    label: 'AND',
                    parent: false,
                    nodeType: 'group',
                    condition: true
                }
            ];
            let customFil = {
                agg: 'not_agg',
                as: fil.name
            };
            fil = { ...fil, ...customFil };
            value[0].children = [];
            let newValue = {
                column: fil,
                condition: false,
                formulas: '',
                id: Date.now(),
                name: '',
                nodeType: 'item',
                operator: '=',
                parent: 'root'
            };
            // lấy ra struct cho formulas
            value[0].children.push(newValue);
            return value;
        },
        // set lại giá trị formula và struc cho cấu trúc filter cũ
        setValueAndStruct(configFilter, objectIdentifier) {
            let allFilter = [];
            configFilter.map((fil, filIdx) => {
                allFilter.push(fil);
            });
            this.listFilters.map((fil, filIdx) => {
                if (fil.objectIdentifier == objectIdentifier) {
                    this.listFilters[filIdx].filterStruct = allFilter;
                    this.listFilters[filIdx].filterValues =
                        this.getListFilterValues(allFilter);
                }
            });
            return configFilter;
        },
        // theo cấu trúc cũ, tìm tất cả filter cũ chế biến thành kiểu mới
        getFilterByOldStruct(filters, objectIdentifier) {
            let configFilter = [];
            Object.values(filters).map((fil) => {
                configFilter.push({
                    actions: this.getActionForOldFilter(
                        fil.action,
                        objectIdentifier
                    ),
                    conditions: this.getConditionsForOldFilter(
                        fil,
                        Object.values(filters)
                    )
                });
            });
            this.setValueAndStruct(configFilter, objectIdentifier);
            // configFilter = this.getValueAndStruct(configFilter)
            return configFilter;
        },
        // lấy bộ lọc filter từ action pack cũ theo cáu trúc mới
        getFilterStruct(filterStruct) {
            let filter = '';
            if (filterStruct) {
                filter = JSON.parse(filterStruct);
                filter.map((fil, filIdx) => {
                    fil.conditions.map((f, fIdx) => {
                        filter[filIdx].conditions[fIdx] =
                            this.getOldCondition(f);
                    });
                });
            }
            return filter;
        },
        // xử lý lấy giá trị mới của filter khi thay đổi tên/công thức
        getOldCondition(node) {
            if (!node.condition) {
                let id = node.column.id;
                let filter = this.listFilters.filter((f) => f.id == id)[0];
                node.column.name = filter.name;
                node.column.formula = filter.formula;
                node.column.as = filter.name;
                node.column.columnName = filter.name;
                return node;
            } else if (node.condition) {
                node.children.map((nodeChil, nodeChilIdx) => {
                    node.children[nodeChilIdx] = this.getOldCondition(nodeChil);
                });
                return node;
            }
        },
        setNameApplicationObjectIdentifer(rows, res, appIdx, objectType) {
            rows.map((row, rowIdx) => {
                res.data.listObject.map((data) => {
                    if (row.object.split(':')[1] == data.id) {
                        rows[rowIdx].object = data.id + ' - ' + data.name;
                    }
                });
            });
            if (this.filterInActionPack.length > 0) {
                this.filterInActionPack.map((data) => {
                    rows.map((row, rowIdx) => {
                        if (
                            row.object &&
                            data.object_identifier &&
                            row.object.split(' - ')[0] ==
                                data.object_identifier.split(':')[1]
                        ) {
                            if (data.filter_struct) {
                                rows.filter[row.object] = this.getFilterStruct(
                                    data.filter_struct
                                );
                                rows[rowIdx].configFilter =
                                    this.getFilterStruct(data.filter_struct);
                            }
                        }
                    });
                });
            }
            if (
                this.itemData.operationsForApplication &&
                this.itemData.operationsForApplication[appIdx]
            ) {
                this.itemData.operationsForApplication[appIdx].children[
                    objectType
                ].rowData = util.cloneDeep(rows);
            }
            // console.log('get-name-doc', objectType, this.itemData.operationsForApplication[appIdx].children)
            this.checkExistName(appIdx, objectType);
        },

        // kiểm tra tồn tại các object không tồn tại thì xóa
        checkExistName(appIdx, objectType) {
            if (this.itemData.operationsForApplication[appIdx]) {
                this.itemData.operationsForApplication[appIdx].children[
                    objectType
                ].rowData.map((row, rowIdx) => {
                    if (row.object.split(':').length > 1) {
                        this.itemData.operationsForApplication[appIdx].children[
                            objectType
                        ].rowData.splice(rowIdx, 1);
                    }
                });
                if (
                    this.itemData.operationsForApplication[appIdx].children[
                        objectType
                    ].rowData.length == 0
                ) {
                }
            }
            this.reAssignItemData();
            // console.log('check-exist')
            this.$evtBus.$emit('finish-loading-app', {
                appIdx: appIdx,
                objectType: objectType
            });
            // this.setTableData();
        },
        reAssignItemData() {
            this.$evtBus.$emit('re-assign-item-data-action-pack');
        },
        setNameObjectIdentifier(objectType, rows, res) {
            rows.map((row, rowIdx) => {
                res.data.map((data) => {
                    if (
                        row.object &&
                        row.object.split(':').length > 1 &&
                        row.object.split(':')[1] == data.id
                    ) {
                        rows[rowIdx].object = data.id + ' - ' + data.name;
                    }
                });
            });
            // loại những object đã bị xóa
            let deletedObject = [];
            rows.map((row, rowIdx) => {
                if (row.object && row.object.split(':').length > 1) {
                    rows.splice(rowIdx, 1);
                    deletedObject.push(row.object);
                }
            });
            if (rows.length == 0) {
                let row = { object: '' };
                this.itemData.listActionForObjectType[objectType].map((act) => {
                    row[act] = '';
                });
                rows.push(row);
            }
            const self = this;
            if (this.filterInActionPack.length > 0) {
                if (JSON.parse(this.filterInActionPack[0].action).length > 0) {
                    let groupByObjectIdentify = _groupBy(
                        this.filterInActionPack,
                        'object_identifier'
                    );
                    rows.map((row, rowIdx) => {
                        let objectIdentifier =
                            objectType + ':' + row.object.split(' - ')[0];
                        if (groupByObjectIdentify[objectIdentifier]) {
                            rows[rowIdx].configFilter =
                                this.getFilterByOldStruct(
                                    groupByObjectIdentify[objectIdentifier],
                                    objectIdentifier
                                );
                        }
                    });
                } else {
                    this.filterInActionPack.map((data) => {
                        rows.map((row, rowIdx) => {
                            if (
                                data.object_identifier &&
                                row.object.split(' - ')[0] ==
                                    data.object_identifier.split(':')[1] &&
                                objectType ==
                                    data.object_identifier.split(':')[0]
                            ) {
                                // trường hợp cấu trúc mới
                                if (data.filter_struct) {
                                    rows.filter[row.object] =
                                        this.getFilterStruct(
                                            data.filter_struct
                                        );
                                    rows[rowIdx].configFilter =
                                        this.getFilterStruct(
                                            data.filter_struct
                                        );
                                }
                            }
                        });
                    });
                }
            }
            this.itemData.tableConfig[objectType].rowData =
                util.cloneDeep(rows);
        },
        handlePermissionSelected(data) {
            this.permissionDepartment = data;
        },
        handleDepartmentSelected(data) {
            if (this.departmentSelected.includes(data)) {
                this.departmentSelected.splice(
                    this.departmentSelected.indexOf(data),
                    1
                );
            } else {
                this.departmentSelected.push(data);
            }
        },
        handleListStateFlowSelected(lists) {
            this.listStateFlowSelected = util.cloneDeep(lists);
            this.reAssignItemData();
        },
        handleListAppSelected(lists) {
            this.listAppSelected = util.cloneDeep(lists);
            if (lists.length == 0) {
                this.itemData.operationsForApplication = [];
            }
            let ids = lists.map((l) => l.id);
            this.itemData.operationsForApplication.map((app, appIx) => {
                if (!ids.includes(app.id)) {
                    this.itemData.operationsForApplication.splice(appIx, 1);
                }
            });
            this.setTableData();
            this.reAssignItemData();
        },
        // xủ lý khi click vào menubar
        handleChangeObjectType(data) {
            let objectActiveBefore = this.objectActive;
            this.objectActive = data;
            this.setTableData();
            this.listObjectIdentifierSearch = [];
            if (data == 'dashboard' && this.show.selectedDashboardTab == 1) {
                this.objectActive = 'dashboard_tab';
            }
            if (data == 'system_role' && this.show.selectedRoleTab == 1) {
                this.objectActive = 'orgchart_role';
            }
            if (data == 'application') {
                if (
                    objectActiveBefore == 'document_definition' &&
                    this.permissionControl.show == true
                ) {
                    this.permissionControl.show = 'active';
                }
                if (
                    objectActiveBefore != 'document_definition' &&
                    this.permissionControl.show == 'active'
                ) {
                    this.permissionControl.show = true;
                }

                setTimeout(() => {
                    this.$evtBus.$emit('set-app-info', this.application);
                }, 200);
            } else {
                if (data == 'document_definition') {
                    if (
                        objectActiveBefore == 'application' &&
                        this.permissionControl.show == true
                    ) {
                        this.permissionControl.show = 'active';
                    } else {
                        if (this.permissionControl.show == 'active') {
                            // trạng thái có nhưng không mở
                            this.permissionControl.show = true;
                        }
                    }
                } else {
                    if (this.permissionControl.show) {
                        this.permissionControl.show = 'active';
                    }
                }
            }
            setTimeout(() => this.calcHeightTable(), 500);
        },
        refreshOtherObject() {
            this.showDepartment = false;
            this.showOrgchart = true;
            this.showDashboard = true;
            this.showTabDashboard = false;
        },
        handleConfigDepartment() {
            let self = this;
            let rows = this.itemData.tableConfig['department'].rowData;
            if (rows.length > 0) {
                if (rows[0].object == 'department:0') {
                    Object.keys(rows[0]).map((r) => {
                        if (r != 'object' && r != 'filter' && rows[0][r]) {
                            if (!self.permissionDepartment.includes(r)) {
                                self.permissionDepartment.push(r);
                            }
                        }
                    });
                }
                if (!self.permissionDepartment.includes('view_other')) {
                    // self.permissionDepartment.push('view_other');
                }
                if (rows.length > 0) {
                    self.$store.dispatch('orgchart/getAllOrgchartStruct');
                    setTimeout(function () {
                        rows.map((row, rowIdx) => {
                            if (
                                (row.object != '') &
                                (row.object != 'department:0')
                            ) {
                                if (
                                    !self.departmentSelected.includes(
                                        row.object
                                    )
                                ) {
                                    self.departmentSelected.push(row.object);
                                }
                                if (
                                    !self.departmentSelectedProps.includes(
                                        row.object
                                    )
                                ) {
                                    self.departmentSelectedProps.push(
                                        row.object
                                    );
                                }
                            }
                        });
                    }, 1000);
                }
            }
        },
        createNewOperations() {
            let self = this;
            return new Promise(async (resolve, reject) => {
                let newOperations = this.getNewOperationData();
                let data = {
                    operations: JSON.stringify(newOperations)
                };
                let res = await permissionApi.createMultipleOperation(data);
                if (res.status == 200) {
                    resolve(res.data);
                } else {
                    self.$snotifyError(
                        res,
                        self.$t('v2.acessControl.cannotCreateNewOperation')
                    );
                    reject(res);
                }
            });
        },
        getOperationDepartment() {
            let newOperations = [];
            const self = this;
            this.permissionDepartment.forEach(function (e) {
                if (e == 'view_other') {
                    self.departmentSelected.forEach(function (k) {
                        newOperations.push({
                            objectType: 'department',
                            action: 'view',
                            objectIdentifier: k,
                            name: k
                        });
                    });
                } else {
                    newOperations.push({
                        objectType: 'department',
                        action: e,
                        objectIdentifier: 'department:0',
                        name: e
                    });
                }
            });
            return newOperations;
        },
        getNewOperationData() {
            const self = this;
            let newOperations = [];

            Object.keys(this.itemData.tableConfig).map((objectType) => {
                if (
                    objectType != 'stateflow_flow' &&
                    objectType != 'department'
                ) {
                    let objectIdentifier = '';
                    if (self.itemData.tableConfig[objectType].create) {
                        objectIdentifier = objectType + ':0';
                        let name = 'create ';
                        if (!self.ignoreCol.includes('create')) {
                            newOperations.push({
                                objectType: objectType,
                                action: name,
                                objectIdentifier: objectIdentifier,
                                name: name
                            });
                        }
                    }
                    self.itemData.tableConfig[objectType].rowData.map((row) => {
                        Object.keys(row).map((r) => {
                            let objectIdentifier = '';
                            if (!this.onlyOneRow.includes(objectType)) {
                                objectIdentifier =
                                    objectType +
                                    ':' +
                                    row.object.split(' - ')[0];
                                if (objectType == 'document_instance') {
                                    objectIdentifier =
                                        'document_definition:' +
                                        row.object.split(' - ')[0] +
                                        ':0';
                                    name = r + ' ' + objectIdentifier;
                                }
                            } else {
                                objectIdentifier = objectType + ':0';
                            }
                            let name =
                                r +
                                ' ' +
                                objectIdentifier
                                    .replace('_', ' ')
                                    .replace(':', ' ');
                            if (!self.ignoreCol.includes(r) && row[r]) {
                                newOperations.push({
                                    objectType: objectType,
                                    action: r,
                                    objectIdentifier: objectIdentifier,
                                    name: name
                                });
                            }
                        });
                    });
                }
            });
            Object.keys(this.itemData.control).map((document) => {
                if (
                    this.itemData.control[document].outTable.rowData.length > 0
                ) {
                    this.itemData.control[document].outTable.rowData.map(
                        (row) => {
                            let operation = {
                                objectType: 'control',
                                objectIdentifier:
                                    'control:' +
                                    document.split(':')[1] +
                                    ':' +
                                    row.name,
                                name: row.object,
                                description: 'outTable'
                            };
                            Object.keys(row).map((r) => {
                                if (
                                    !self.ignoreCol.includes(r) &&
                                    row[r] &&
                                    r != 'name'
                                ) {
                                    newOperations.push({
                                        ...operation,
                                        action: r
                                    });
                                }
                            });
                        }
                    );
                }
                if (this.itemData.control[document].inTable) {
                    Object.keys(this.itemData.control[document].inTable).map(
                        (tbName) => {
                            this.itemData.control[document].inTable[
                                tbName
                            ].rowData.map((row) => {
                                let operation = {
                                    objectType: 'control',
                                    objectIdentifier:
                                        'control:' +
                                        document.split(':')[1] +
                                        ':' +
                                        row.name,
                                    name: row.object,
                                    description: tbName
                                };
                                Object.keys(row).map((r) => {
                                    if (
                                        !self.ignoreCol.includes(r) &&
                                        row[r] &&
                                        r != 'name'
                                    ) {
                                        newOperations.push({
                                            ...operation,
                                            action: r
                                        });
                                    }
                                });
                            });
                        }
                    );
                }
                if (this.itemData.control[document].table.rowData.length > 0) {
                    this.itemData.control[document].table.rowData.map((row) => {
                        let operation = {
                            objectType: 'control',
                            objectIdentifier:
                                'control:' +
                                document.split(':')[1] +
                                ':' +
                                row.name,
                            name: row.object,
                            description: 'table'
                        };
                        Object.keys(row).map((r) => {
                            if (
                                !self.ignoreCol.includes(r) &&
                                row[r] &&
                                r != 'name'
                            ) {
                                newOperations.push({ ...operation, action: r });
                            }
                        });
                    });
                }
            });
            let departmentOperation = this.getOperationDepartment();
            // let departmentOperation = [];
            let operationStateFlow = this.getOperationStateFlow();
            // let operationStateFlow = []
            newOperations = [...newOperations, ...departmentOperation];
            if (operationStateFlow.length > 0) {
                newOperations = [...newOperations, ...operationStateFlow];
            }
            this.createAppOperation(newOperations);

            return newOperations;
        },
        getOperationStateFlow() {
            let newOperation = [];
            const self = this;
            Object.keys(this.itemData.operationStateFlow).map((kanbanId) => {
                if (kanbanId) {
                    self.itemData.operationStateFlow[kanbanId].rowData.map(
                        (row) => {
                            if (row.use) {
                                let operation = {
                                    objectType: 'stateflow_flow',
                                    action: 'use',
                                    objectIdentifier:
                                        'stateflow_flow:' + row.id,
                                    name: 'use ' + row.id + ' - ' + row.object,
                                    objectName: kanbanId
                                };
                                newOperation.push(operation);
                            }
                        }
                    );
                }
            });
            return newOperation;
        },
        createAppOperation(newOperations) {
            this.listAppSelected.forEach(function (e) {
                let obj = {
                    action: 'view',
                    name: 'view application definition ' + e.id,
                    objectIdentifier: 'application_definition:' + e.id,
                    objectType: 'application_definition'
                };
                if (e.id) newOperations.push(obj);
            });
            return newOperations;
        },
        switchToUpdateForm() {
            this.$emit('trigger-update-action-pack', this.itemData);
        },
        // hàm lấy ra action filter
        getListFilter() {
            let listFilters = [];
            this.listFilters.map((fil) => {
                if (fil.filterStruct) {
                    listFilters.push({
                        id: fil.id,
                        action: [],
                        filterValues: JSON.stringify(fil.filterValues),
                        filterStruct: JSON.stringify(fil.filterStruct)
                    });
                }
            });
            return JSON.stringify(listFilters);
        },
        // lấy ra những id filter
        getActionPackFilter(obj, act) {
            let listCondition = [];
            let listFilter = this.listFilters;
            if (listFilter.length > 0) {
                listFilter.map((filter) => {
                    let objectIdentifier = filter.objectIdentifier;
                    if (
                        filter.objectIdentifier &&
                        filter.objectIdentifier.split(':')[0] ==
                            'document_instance'
                    ) {
                        objectIdentifier =
                            filter.objectIdentifier.replace(
                                'document_instance',
                                'document_definition'
                            ) + ':0';
                    }
                    if (objectIdentifier == obj && filter.filterStruct) {
                        filter.filterStruct.map((f) => {
                            f.actions.map((action) => {
                                if (action.field == act) {
                                    listCondition.push(filter.id);
                                }
                            });
                        });
                    }
                });
            }
            listCondition = Array.from(new Set(listCondition)); // loại fiterid trùng
            return listCondition.join(',');
        },
        async saveActionPack() {
            this.isLoading = true;
            let listNewOperations = await this.createNewOperations();
            let operationsIds = {};
            listNewOperations.map((el) => {
                let filter = this.getActionPackFilter(
                    el.objectIdentifier,
                    el.action
                );
                operationsIds[el.id] = filter;
            });
            let dataToSave = {
                name: this.itemData.name,
                type: 'ba',
                description: this.itemData.description,
                listOperations: JSON.stringify(operationsIds),
                listFilter: this.getListFilter()
            };
            let res;
            try {
                const self = this;
                let detail = {
                    listAppSelected: this.listAppSelected,
                    listFilter: []
                };
                if (this.itemData.action == 'update') {
                    this.actionPackWorker.postMessage({
                        action: 'updateActionPack',
                        data: {
                            dataUi: {
                                widgetIdentifier:
                                    'action-pack:' + self.itemData.id,
                                detail: JSON.stringify(detail)
                            },
                            dataActionPack: {
                                id: self.itemData.id,
                                dataToSave: dataToSave
                            }
                        }
                    });
                } else if (
                    this.itemData.action == 'create' ||
                    this.itemData.action == 'copy'
                ) {
                    this.actionPackWorker.postMessage({
                        action: 'createActionPack',
                        data: {
                            dataUi: {
                                detail: JSON.stringify(detail)
                            },
                            dataActionPack: {
                                dataToSave: dataToSave
                            }
                        }
                    });
                }
                this.$emit('refresh-show-list');
            } catch (error) {
                this.$snotifyError(
                    error,
                    this.$t('v2.acessControl.errorWhenSaveItem')
                );
                this.isLoading = false;
            }
        },
        addNewRow(rowIdx, objectActive) {
            if (!objectActive) objectActive = this.objectActive;
            let row = { object: '' };
            this.itemData.listActionForObjectType[objectActive].map((act) => {
                row[act] = '';
            });
            this.gridOptions.api.applyTransaction({
                add: [row],
                addIndex: rowIdx
            });
            this.itemData.tableConfig[objectActive].rowData.push(row);
        },
        dataToArray(pastedText) {
            var rows = pastedText
                .replace(
                    /"((?:[^"]*(?:\r\n|\n\r|\n|\r))+[^"]+)"/gm,
                    function (match, p1) {
                        return p1
                            .replace(/""/g, '"')
                            .replace(/\r\n|\n\r|\n|\r/g, ' ');
                    }
                )
                .split(/\r\n|\n\r|\n|\r/g);
            return rows;
        },
        onCellKeyDown(params) {
            let event = params.event;
            let ignoreObject = [
                'document_definition',
                'document_instance',
                'workflow_definition',
                'dashboard'
            ];
            if (
                params.colDef.field == 'configFilter' &&
                (event.key == 'Enter' || event.code == 'Space')
            ) {
                SYMPER_APP.$evtBus.$emit(
                    'click-add-filter-config-action-pack',
                    {
                        e: params,
                        objectIdentifier: params.node.data['object']
                    }
                );
            } else {
                if (
                    event.key == 'Enter' &&
                    !ignoreObject.includes(this.objectActive)
                ) {
                    if (this.$refs.autocompleteInput) {
                        this.$refs.autocompleteInput.hide();
                    }
                }
                if (
                    event.key == 'Enter' &&
                    event.shiftKey &&
                    !ignoreObject.includes(this.objectActive)
                ) {
                    let index = params.node.rowIndex;
                    this.addNewRow(index + 1);
                }
                if ((event.metaKey || event.ctrlKey) && event.code == 'KeyV') {
                    // xử lý phần copy
                    let pastedData = this.pastedData;
                    let dataArray = this.dataToArray(pastedData);
                    if (/(\r\n){1}$/.test(pastedData)) {
                        dataArray.pop();
                    }
                    dataArray.map((data, dataIdx) => {
                        dataArray[dataIdx] = data
                            .replaceAll('\t', ',')
                            .replaceAll(',,', ',false,')
                            .replaceAll(',,', ',false,');
                    });
                    let currentCol = params.colDef.field;
                    let objectActive = this.getObjectActive();
                    let listAction =
                        this.itemData.listActionForObjectType[objectActive];
                    let listCol = [];
                    let check = false;
                    listAction.map((act, actIdx) => {
                        if (act == currentCol) check = true;
                        if (check) {
                            listCol.push(act);
                        }
                    });
                    let rowIndex = params.node.rowIndex;
                    dataArray.map((d) => {
                        let row = d.split(',');
                        if (row.length > 0) {
                            row.map((r, rIdx) => {
                                let rowModel = params.node.rowModel;
                                let rowNode = rowModel.rowsToDisplay[rowIndex];
                                if (listCol[rIdx]) {
                                    rowNode.setDataValue(
                                        listCol[rIdx],
                                        r === 'true'
                                    );
                                }
                            });
                        }
                        ++rowIndex;
                    });
                    this.synchronizedObjectType(
                        params,
                        params.colDef.field,
                        params.value
                    );
                }
                this.handleEnterOrSpace(params);
            }
        },
        // xử lý tích action bằng space hoặc enter
        handleEnterOrSpace(params) {
            let event = params.event;
            let field = params.colDef.field;
            let allowAction =
                (event.key == 'Enter' || event.code == 'Space') &&
                field != 'object' &&
                field != 'index_increment';
            if (allowAction) {
                params.node.setDataValue(field, !params.value);
                this.synchronizedObjectType(params, field, params.value);
            }
        },
        cancel() {
            this.confirmSynDoc.show = false;
        },
        // trường hợp đồng bộ xóa giữa văn bản và danh sách văn bản
        deleteDocAfterSynchronized(objectType) {
            this.itemData.tableConfig[objectType].rowData.map((row, rowIdx) => {
                if (row.object == this.confirmSynDoc.object) {
                    this.itemData.tableConfig[objectType].rowData.splice(
                        rowIdx,
                        1
                    );
                }
            });
            if (this.itemData.tableConfig[objectType].rowData.length == 0) {
                this.addNewRow(0, objectType);
            }
        },
        // đồng bộ giữa văn bản và danh sách văn bản khi add 1 đối tượng
        addDocAfterSynchronized(objectType) {
            let existObject = false;
            this.itemData.tableConfig[objectType].rowData.map((row, rowIdx) => {
                if (
                    row.object == this.applySynchronize.oldValue &&
                    !existObject
                ) {
                    existObject = true;
                    this.itemData.tableConfig[objectType].rowData[
                        rowIdx
                    ].object = this.confirmSynDoc.object;
                }
            });
            if (!existObject) {
                this.itemData.tableConfig[objectType].rowData.push({
                    object: this.confirmSynDoc.object
                });
            }
        },
        // xử lý phần xóa đồng bộ doc
        confirm() {
            if (this.applySynchronize.show == true)
                this.applySynchronize.isConfirm = true;
            let objectType =
                this.objectActive == 'document_definition'
                    ? 'document_instance'
                    : 'document_definition';
            if (this.applySynchronize.type == 'delete') {
                this.deleteDocAfterSynchronized(objectType);
                this.$snotifySuccess(
                    this.$t('v2.acessControl.successfullDeleted') +
                        this.confirmSynDoc.object +
                        this.$t('v2.acessControl.at') +
                        this.$t('objects.' + objectType)
                );
            } else {
                this.addDocAfterSynchronized(objectType);
            }
            this.confirmSynDoc.show = false;
        },
        cancelConfirmSynDoc() {
            this.confirmSynDoc.show = false;
            if (this.applySynchronize.show)
                this.applySynchronize.isConfirm = false;
        }
    }
};
</script>

<style scoped>
.action-form ::v-deep .wtHolder {
    height: 88px !important;
}
.action-form ::v-deep .ht_clone_left {
    height: 58px !important;
}
.action-pack-panel >>> .v-text-field__details {
    display: none;
}
.action-pack-panel >>> .v-input__controv-text-field__slotzl {
    min-height: unset !important;
}
.action-pack-panel >>> .action-pack-panel-object .v-input__slot {
    background-color: #f7f7f7 !important;
    box-shadow: unset !important;
    min-height: unset !important;
}
.action-pack-panel >>> .v-input__control {
    min-height: unset !important;
}
.action-pack-panel >>> .v-input__slot label,
.action-pack-panel >>> .v-input__slot input {
    font-size: 13px !important;
}
.action-pack-panel .action-pack-object-active {
    background-color: #f0f0f0 !important;
    border-radius: 5px;
}
.action-pack-panel .action-pack-object {
    cursor: pointer;
}
.title {
    border-bottom: 0.5px solid rgba(0, 0, 0, 0.13);
}

.agrid-table >>> .ag-header-cell {
    padding-left: 5px !important;
    padding-right: 5px !important;
}
.object-identifier:hover {
    background: #f7f7f7;
    cursor: pointer;
}
.light-blue >>> .mdi-information {
    color: rgba(0, 0, 0, 0.4) !important;
}
.light-blue {
    background: #eff8ff !important;
}
.symper-drag-panel-resizer {
    display: none !important;
}
.symper-drag-panel >>> .symper-drag-resizer {
    display: none !important;
}
.v-card__text {
    padding: 0 23px 1px !important;
    color: black !important;
}
.ag-theme-balham >>> .ag-root-wrapper {
    border: unset !important;
}
.ag-theme-balham >>> .ag-header {
    height: 36px !important;
}
.action-pack-object {
    width: 150px !important;
}
.body,
.wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin: 0;
}
.wrapper {
    flex: 1;
}
.content {
    flex: 1;
    display: flex;
    flex-direction: column;
}
</style>

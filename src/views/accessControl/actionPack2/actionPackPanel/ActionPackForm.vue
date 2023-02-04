<template>
    <div
        class="body pl-2 pr-2 pb-4 action-pack-panel h-100"
        style="position: relative"
        @click="handleClickOutSide"
    >
        <Preloader v-show="loading" />
        <div class="wrapper">
            <div class="header title py-2 d-flex justify-space-between">
                <span class="fs-15 fw-500 ml-2">
                    <v-icon :size="15">mdi-tune</v-icon>
                    {{ $t('common.actionPack') }}
                </span>
                <HeaderInputValue ref="headerInput" :item="itemData" />
                <span>
                    <v-btn
                        v-show="action != 'view'"
                        class="mr-1 mb-1"
                        small
                        depressed
                        :loading="isLoading"
                        @click="SaveActionPack"
                        color="success"
                    >
                        {{ $t('common.save') }}
                    </v-btn>
                    <v-btn small icon class="mb-1">
                        <v-icon
                            :size="16"
                            class="close-btn"
                            @click.stop="closeActionPackForm"
                            >mdi-close</v-icon
                        >
                    </v-btn>
                </span>
            </div>

            <span class="d-flex h-100 overflow-scroll">
                <div
                    class="d-flex flex-column pt-3 mr-2 ml-1"
                    style="width: 200px; position: fixed"
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
                <div
                    class="wrap-action-pack"
                    style="width: calc(100% - 180px); margin-left: 200px"
                >
                    <div class="mt-1 info-actionpack mb-3 h-100">
                        <div class="fs-15 fw-430 mb-2 mt-3 d-flex align-center">
                            <span
                                v-if="
                                    (showPermissionControl &&
                                        objectActive ==
                                            'document_definition') ||
                                    (showPermissionControlInApp &&
                                        objectActive == 'application')
                                "
                            >
                                <v-btn
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
                                <span class="ml-2 color-orange">
                                    {{
                                        showPermissionControl &&
                                        objectActive == 'document_definition'
                                            ? permissionControl.name
                                            : permissionControlInApp.name
                                    }}
                                </span>
                            </span>
                            <span
                                v-else-if="
                                    objectActive == 'system_role' ||
                                    objectActive == 'orgchart_role'
                                "
                            >
                                <v-btn
                                    :color="
                                        i == selectedRoleTab
                                            ? 'orange'
                                            : 'black'
                                    "
                                    small
                                    text
                                    v-for="(item, i) in show['role']"
                                    :key="i"
                                    @click="item.action(i)"
                                >
                                    <span class="fs-13">{{ item.name }}</span>
                                </v-btn>
                            </span>
                            <span
                                v-else-if="
                                    objectActive == 'dashboard' ||
                                    objectActive == 'dashboard_tab'
                                "
                            >
                                <v-btn
                                    :color="
                                        i == selectedDashboardTab
                                            ? 'orange'
                                            : 'black'
                                    "
                                    small
                                    text
                                    v-for="(item, i) in show['dashboard']"
                                    :key="i"
                                    @click="item.action(i)"
                                >
                                    <span class="fs-13">{{ item.name }}</span>
                                </v-btn>
                            </span>
                            <span
                                v-else-if="
                                    objectActive == 'orgchart' ||
                                    objectActive == 'department'
                                "
                            >
                                <v-btn
                                    :color="
                                        i == selectedDpmTab ? 'orange' : 'black'
                                    "
                                    small
                                    text
                                    v-for="(item, i) in show['orgchart']"
                                    :key="i"
                                    @click="item.action(i)"
                                >
                                    <span class="fs-13">{{ item.name }}</span>
                                </v-btn>
                            </span>
                            <span v-else>{{
                                $t('permissions.actionPack.permissionAction')
                            }}</span>
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
                        <GroupByApp
                            ref="groupByApp"
                            v-if="objectActive == 'application'"
                            :action="action"
                            :tableHeight="tableHeight"
                            :oldApp="oldApp"
                            :oldTabIndex="oldTabIndex"
                            @change-app-selected="changeAppSelected"
                            @change-tab-index="changeTabIndex"
                            @show-permission-control="
                                showPermissionControlInApplication
                            "
                            :showPermissionControl="showPermissionControlInApp"
                            :permissionControl="permissionControlInApp"
                        />
                        <StateflowForm
                            v-if="objectActive == 'stateflow_flow'"
                            :action="action"
                            :tableHeight="tableHeight"
                            :oldKanban="oldKanban"
                            @change-kanban-selected="changeKanbanSelected"
                        />
                        <GroupByObjectType
                            ref="groupByObjectType"
                            v-if="
                                showTable &&
                                objectActive != 'application' &&
                                objectActive != 'stateflow_flow' &&
                                !showDepartment
                            "
                            :class="{
                                'd-none':
                                    objectActive == 'document_definition' &&
                                    showPermissionControl
                                        ? true
                                        : false
                            }"
                            :objectType="objectActive"
                            :action="action"
                            :listOperations="listOperations"
                            :tableHeight="tableHeight"
                            :key="objectActive"
                            @show-permission-control="
                                handleClickShowPermisisonControl
                            "
                        />
                        <DepartmentPermission
                            v-if="showDepartment"
                            :checkboxSelected="checkboxDepartment"
                            :departmentSelected="departmentSelected"
                            :action="action"
                        />
                        <PermissionControl
                            v-if="
                                showPermissionControl &&
                                objectActive == 'document_definition'
                            "
                            :action="action"
                            :idDoc="permissionControl.idDoc"
                        />
                    </div>
                </div>
            </span>
        </div>
    </div>
</template>

<script>
import ActionPackWorker from 'worker-loader!@/worker/accessControl/ActionPack.Worker.js';
import AutocompleteInput from './../../../document/submit/items/AutocompleteInput';
import SymperDragPanel from '@/components/common/SymperDragPanel.vue';
import HeaderInputValue from './HeaderInputValue.vue';
import GroupByApp from './GroupByApp';
import GroupByObjectType from './GroupByObjectType';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
import Preloader from '@/components/common/Preloader.vue';
import SymperAlert from '@/components/common/SymperAlert.vue';
import StateflowForm from './StateflowForm.vue';
import DepartmentPermission from './DepartmentPermission.vue';
import PermissionControl from './PermissionControl.vue';

import { util } from '@/plugins/util.js';
$(window).keypress(function (e) {
    if (e.code == 'Space') e.preventDefault();
});
export default {
    components: {
        SymperDragPanel,
        AutocompleteInput,
        GroupByApp,
        SymperDialogConfirm,
        HeaderInputValue,
        Preloader,
        SymperAlert,
        GroupByObjectType,
        StateflowForm,
        DepartmentPermission,
        PermissionControl
    },
    props: {
        action: {
            type: String,
            default() {
                return 'create';
            }
        },
        itemData: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data() {
        const self = this;
        return {
            permissionControl: {
                idDoc: '',
                name: ''
            },
            showPermissionControl: false,
            permissionControlInApp: {
                idDoc: '',
                name: ''
            },
            showPermissionControlInApp: false,
            loading: false,
            departmentSelected: [],
            checkboxDepartment: [],
            application: {
                tabIdx: 0,
                app: ''
            },
            showTable: false,
            show: {
                // showTab
                orgchart: [
                    {
                        name: self.$t('objectType.Orgchart'),
                        action: (tabIndex) => {
                            self.showDepartmentForm(false, tabIndex);
                        }
                    },
                    {
                        name: self.$t('objectType.Department'),
                        action: (tabIndex) => {
                            self.showDepartmentForm(true, tabIndex);
                        }
                    }
                ],
                dashboard: [
                    {
                        name: self.$t('objects.dashboard'),
                        action: (tabIndex) => {
                            self.selectDashboardTab(false, tabIndex);
                        }
                    },
                    {
                        name: self.$t('v2.acessControl.dashboardTab'),
                        action: (tabIndex) => {
                            self.selectDashboardTab(true, tabIndex);
                        }
                    }
                ],
                role: [
                    {
                        name: self.$t('v2.acessControl.systemRole'),
                        action: (tabIndex) => {
                            self.showOrgchartRole(false, tabIndex);
                        }
                    },
                    {
                        name: self.$t('v2.acessControl.orgchartRole'),
                        action: (tabIndex) => {
                            self.showOrgchartRole(true, tabIndex);
                        }
                    }
                ]
            },
            showDepartment: false,
            selectedDpmTab: 0,
            showOrgRole: false,
            selectedRoleTab: 0,
            showDashboardTab: true,
            selectedDashboardTab: 0,
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
            isLoading: false,
            actionPackWorker: null,
            objectActive: 'document_definition',
            listOperations: {},
            tableHeight: 700,
            oldApp: '',
            oldTabIndex: 0,
            oldKanban: ''
        };
    },
    async created() {
        let self = this;
        this.loading = true;
        this.actionPackWorker = new ActionPackWorker();
        await self.setupData();
        this.getData(this.itemData.id);
        this.actionPackWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'detailActionPack':
                    self.$store.commit(
                        'actionPack/setApplicationInActionPack',
                        data.dataAfter.appsInActionPack
                    );
                    self.$store.commit(
                        'actionPack/setOperation',
                        data.dataAfter.operations
                    );
                    self.$store.commit(
                        'actionPack/setSelectedKanban',
                        data.dataAfter.selectedKanban
                    );
                    self.getListOperation();
                    self.showTable = true;
                    self.loading = false;
                    break;
                case 'createActionPack':
                    if (data.dataAfter.status == 200) {
                        self.$snotifySuccess(
                            self.$t('v2.acessControl.successfullAddedNew')
                        );
                        self.closeActionPackForm();
                        self.$emit('refresh-list');
                    } else {
                        self.$snotifyError(
                            data.dataAfter.message,
                            self.$t('v2.acessControl.anErrorOccurred')
                        );
                    }
                    self.isLoading = false;
                    break;
                case 'updateActionPack':
                    if (data.dataAfter.status == 200) {
                        self.$snotifySuccess(
                            self.$t('v2.acessControl.successfullEdited')
                        );
                        self.closeActionPackForm();
                        self.$emit('refresh-list');
                    } else {
                        self.$snotifyError(
                            data.dataAfter.message,
                            self.$t('v2.acessControl.anErrorOccurred')
                        );
                    }
                    self.isLoading = false;
                    break;
                default:
                    break;
            }
        });
    },
    mounted() {},
    computed: {
        listObject() {
            let allActionByObjectType = this.$store.state.actionPack.allActions;
            let rsl = [];
            let hiddenObject = [
                'department',
                'dashboard_tab',
                'document_control',
                'orgchart_role',
                'document_table'
            ];
            if (allActionByObjectType) {
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
            }
            return rsl;
        }
    },
    methods: {
        changeTabIndex(vl) {
            this.oldTabIndex = vl;
        },
        changeAppSelected(vl) {
            this.oldApp = vl;
        },
        changeKanbanSelected(vl) {
            this.oldKanban = vl;
        },
        async setupData() {
            await this.$store.dispatch('actionPack/getAllActionByObjectType');
            await this.$store.dispatch('actionPack/getAllApp');
            await this.$store.dispatch('actionPack/getAllKanban');
            await this.$store.dispatch('actionPack/getListFilters');
        },
        SaveActionPack() {
            this.isLoading = true;
            if (this.action == 'create' || this.action == 'copy') {
                this.actionPackWorker.postMessage({
                    action: 'createActionPack',
                    data: {
                        operations: this.$store.state.actionPack.operations,
                        itemData: this.itemData
                    }
                });
            } else if (this.action == 'update') {
                this.actionPackWorker.postMessage({
                    action: 'updateActionPack',
                    data: {
                        operations: this.$store.state.actionPack.operations,
                        itemData: this.itemData
                    }
                });
            }
        },
        selectDashboardTab(show, tabIndex) {
            this.selectedDashboardTab = tabIndex;
            this.objectActive = tabIndex == 0 ? 'dashboard' : 'dashboard_tab';
        },
        showOrgchartRole(show, tabIndex) {
            this.selectedRoleTab = tabIndex;
            this.objectActive = tabIndex == 0 ? 'system_role' : 'orgchart_role';
        },
        showDepartmentForm(show, tabIndex) {
            this.showDepartment = show ? true : false;
            this.selectedDpmTab = tabIndex;
            if (show) {
                this.checkboxDepartment =
                    this.$store.state.actionPack.operations.department[
                        'department:0'
                    ].action;
                let data = this.$store.state.actionPack.operations.department;
                for (let id in data) {
                    if (!id.includes(':0')) {
                        this.departmentSelected.push(id);
                    }
                }
            } else {
                this.checkboxDepartment = [];
                this.departmentSelected = [];
            }
        },
        async getData(id) {
            if (this.action == 'create') {
                await this.$store.commit('actionPack/setCreateData');
                this.showTable = true;
                this.loading = false;
            } else {
                this.actionPackWorker.postMessage({
                    action: 'detailActionPack',
                    data: id
                });
            }
        },
        hightlightObjectActive(value) {
            if (value == this.objectActive) {
                return true;
            }
            if (
                (this.objectActive == 'dashboard_tab' &&
                    value == 'dashboard') ||
                (this.objectActive == 'orgchart_role' && value == 'system_role')
            ) {
                return true;
            }
        },
        hideObjectTypeInfo() {
            this.objectTypeInfo[this.objectActive].isShow = false;
            this.calcHeightTable(true);
        },
        closeActionPackForm() {
            this.objectActive = 'document_definition';
            this.showTable = false;
            this.showDepartment = false;
            this.selectedDpmTab = 0;
            this.selectedRoleTab = 0;
            this.selectedDashboardTab = 0;
            this.loading = true;
            this.oldApp = '';
            this.oldKanban = '';
            this.oldTabIndex = 0;
            this.showPermissionControl = false;
            this.listOperations = {};
            this.showPermissionControlInApp = false;
            this.$refs.headerInput.hideAll();
            this.$store.commit('actionPack/resetStoreData');
            this.$emit('close-form');
        },
        // xủ lý khi click vào menubar
        handleChangeObjectType(data) {
            this.showDepartment = false;
            this.selectedDpmTab = 0;
            this.selectedRoleTab = 0;
            this.selectedDashboardTab = 0;
            this.objectActive = data;
            if (this.objectActive != 'application') this.getListOperation();
            if (this.objectActive != 'application') {
                this.tableHeight = util.getComponentSize(this).h - 150;
            } else {
                this.tableHeight = util.getComponentSize(this).h - 250;
            }
        },
        getListOperation() {
            let objectType = Object.keys(
                this.$store.state.actionPack.operations
            );
            for (let key in objectType) {
                this.listOperations[objectType[key]] = Object.keys(
                    this.$store.state.actionPack.operations[objectType[key]]
                );
            }
        },
        handleClickOutSide(evt) {
            if ($('.card-autocomplete').length > 0)
                if (this.$refs.groupByObjectType)
                    this.$refs.groupByObjectType.hideAutoCompete(evt);

            if (
                !$(evt.target).closest('.v-input').length &&
                !$(evt.target).closest('.value-input')
            )
                this.$refs.headerInput.hideAll();
            if (
                !$(evt.target).closest('.add-app').length &&
                !$(evt.target).closest('.autocomplete').length
            ) {
                this.$evtBus.$emit('hide-btn-add-app');
            }
        },
        handleClickShowPermisisonControl(data) {
            this.showPermissionControl = true;
            this.permissionControl.idDoc = data.id;
            this.permissionControl.name = data.object;
        },
        backToOriginalView() {
            if (
                this.$refs.groupByApp &&
                this.$refs.groupByApp.showPermissionControl
            ) {
                this.$refs.groupByApp.showPermissionControl = false;
                this.showPermissionControlInApp = false;
            } else if (!this.$refs.groupByApp)
                this.showPermissionControl = false;
        },
        showPermissionControlInApplication(data) {
            this.showPermissionControlInApp = true;
            this.permissionControlInApp.idDoc = data.id;
            this.permissionControlInApp.name = data.object;
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

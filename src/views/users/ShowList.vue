<template>
    <div class="w-100">
        <list-items
            ref="listUser"
            :showImportButton="true"
            @after-open-add-panel="addUser"
            :headerPrefixKeypath="'user.table'"
            :pageTitle="$t('user.title')"
            :debounceRowSelectTime="200"
            :tableContextMenu="tableContextMenu"
            :containerHeight="containerHeight"
            :showActionPanelInDisplayConfig="true"
            :customAPIResult="customAPIResult"
            :getDataUrl="getListUrl + 'users?page=1&pageSize=50'"
            :actionPanelWidth="actionPanelWidth"
            @import-excel="importExcel()"
            @row-selected="onRowSelected"
            :commonActionProps="commonActionProps"
            :emptyDataKey="'user-list'"
        >
            <div slot="right-panel-content" class="h-100">
                <action-panel
                    ref="panel"
                    @change-width-panel="changeWidth()"
                    :showDetailView="showDetailView"
                    @refresh-data="refreshListUser"
                    @refresh-new-user="setNewUserItem"
                    @close-panel="closePanel"
                    @edit-user-info="handleEditUserInfo"
                    :actionType="actionType"
                    :isSettingPasswordView="isSettingPasswordView"
                    :showViewInfo="showViewInfo"
                />
            </div>
        </list-items>
        <ImportExcelPanel
            :options="options"
            :nameRows="listRowUser"
            :open="showImportUser"
        />
    </div>
</template>
<script>
import ImportExcelPanel from './../../components/document/ImportExelPanel';
import { userApi } from './../../api/user.js';
import ListItems from './../../components/common/ListItems.vue';
import ActionPanel from './../../views/users/ActionPanel.vue';
import ChangePassPanel from './../../views/users/ChangePass.vue';
import { util } from './../../plugins/util.js';
import { appConfigs } from '../../configs';

export default {
    components: {
        'list-items': ListItems,
        'action-panel': ActionPanel,
        ImportExcelPanel: ImportExcelPanel,
    },
    data() {
        let self = this;
        return {
            options: {
                objType: 'user',
                nameObj: 'Import User',
                subObjType: -1,
            },
            showDetailView: false,
            listRowUser: [],
            showImportUser: false,
            customAPIResult: {
                setStatusImport(status) {
                    let nameStatus = '';
                    switch (status) {
                        case '0':
                            nameStatus = self.$t('v2.account.isLock');
                            break;
                        case '-1':
                            nameStatus = self.$t('v2.account.isDeleted');
                            break;
                        case '1':
                            nameStatus = self.$t('v2.account.isActive');
                            break;

                        case '2':
                            nameStatus = self.$t('v2.account.newCreate');
                            break;
                    }
                    return nameStatus;
                },
                reformatData(res) {
                    let data = res.data;
                    for (let i = 0; i < data.listObject.length; i++) {
                        data.listObject[i].status = this.setStatusImport(
                            data.listObject[i].status,
                        );
                    }
                    return data;
                },
            },
            commonActionProps: {
                module: 'account',
                resource: 'account',
                scope: 'account',
            },
            getListUrl: {},
            actionPanelWidth: 650,
            containerHeight: 200,
            tableContextMenu: {
                change_pass: {
                    name: 'passwordsetting',
                    text: this.$t('user.table.contextMenu.passwordSetting'),
                    callback: (user, callback) => {
                        this.showViewSetingPassword(user);
                    },
                },
                update: {
                    name: 'edit',
                    text: this.$t('user.table.contextMenu.edit'),
                    callback: (user, callback) => {
                        this.editUser(user);
                    },
                },
                delete: {
                    name: 'delete',
                    text: this.$t('user.table.contextMenu.delete'),
                    callback: (user, callback) => {
                        this.deleteUser(user);
                    },
                },
                detail: {
                    name: 'view',
                    text: this.$t('user.table.contextMenu.view'),
                    callback: (user, callback) => {
                        this.showViewDetailInfo(user);
                    },
                },
            },
            columns: [],
            data: [],
            totalPage: 6,
            actionType: '',
            isSettingPasswordView: false,
            showViewInfo: false,
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    created() {
        this.getListUrl = appConfigs.apiDomain.user + '';

        let thisCpn = this;
        this.$evtBus.$on('change-user-locale', (locale) => {
            thisCpn.tableContextMenu = [
                {
                    name: 'passwordsetting',
                    text: this.$t('user.table.contextMenu.passwordSetting'),
                },
                { name: 'edit', text: this.$t('user.table.contextMenu.edit') },
                { name: this.$t('v2.account.delete'), text: this.$t('user.table.contextMenu.delete') },
                {
                    name: this.$t('v2.account.showDetail'),
                    text: this.$t('user.table.contextMenu.view'),
                },
            ];
        });
    },
    watch: {},
    methods: {
        changeWidth() {
            this.actionPanelWidth = 900;
        },
        handleEditUserInfo(info) {
            this.editUser(info);
        },
        onRowSelected(row) {
            this.focusingUser = row;
            if (this.$refs.listUser.alwaysShowActionPanel) {
                this.showViewDetailInfo(row);
            }
        },
        getListFieldUser() {
            this.listRowUser = [
                {
                    sheetMap: '',
                    name: this.$t('v2.account.generalInformation'),
                    title: this.$t('v2.account.generalInformation'),
                    controls: [
                        {
                            dataColumn: null,
                            dataType: 'text',
                            isKeyControl: false,
                            name: 'firstName',
                            title: this.$t('v2.account.firstName'),
                            isNull: true,
                        },
                        {
                            dataColumn: null,
                            dataType: 'text',
                            isKeyControl: false,
                            name: 'lastName',
                            title: this.$t('v2.account.lastName'),
                            isNull: true,
                        },
                        {
                            dataColumn: null,
                            dataType: 'text',
                            isKeyControl: false,
                            name: 'userName',
                            title: this.$t('v2.account.userName'),
                            isNull: false,
                        },
                        {
                            dataColumn: null,
                            dataType: 'text',
                            isKeyControl: false,
                            name: 'displayName',
                            title: this.$t('v2.account.displayName'),
                            isNull: false,
                        },
                        {
                            dataColumn: null,
                            dataType: 'text',
                            isKeyControl: false,
                            name: 'email',
                            title: this.$t('v2.account.email'),
                            isNull: false,
                        },
                        {
                            dataColumn: null,
                            dataType: 'text',
                            isKeyControl: false,
                            name: 'phone',
                            title: this.$t('v2.account.phone'),
                            isNull: true,
                        },
                        {
                            dataColumn: null,
                            dataType: 'text',
                            isKeyControl: false,
                            name: 'password',
                            title: this.$t('v2.account.pass'),
                            isNull: true,
                        },
                        {
                            dataColumn: null,
                            dataType: 'text',
                            isKeyControl: false,
                            name: 'orgchart_id',
                            title: this.$t('v2.account.orgchartId'),
                            isNull: true,
                        },
                        {
                            dataColumn: null,
                            dataType: 'text',
                            isKeyControl: false,
                            name: 'position_id',
                            title: this.$t('v2.account.position'),
                            isNull: true,
                        },
                    ],
                },
            ];
        },
        importExcel() {
            this.showImportUser = !this.showImportUser;
            this.getListFieldUser();
        },
        refreshListUser() {
            this.$refs.listUser.refreshList();
        },
        openPanel() {
            this.$refs.panel.setStepper(1);
            this.$refs.panel.resetPermissionPosittionOrgChart();
        },
        showViewSetingPassword(user) {
            this.actionPanelWidth = 500;
            this.isSettingPasswordView = true;
            this.showViewInfo = false;
            this.$refs.panel.setDetailInfo(user);
            this.$refs.listUser.openactionPanel();
        },
        showViewDetailInfo(user) {
            this.actionPanelWidth = 550;
            this.showDetailView = !this.showDetailView;
            this.showViewInfo = true;
            this.$refs.panel.setDetailInfo(user);
            this.$refs.listUser.openactionPanel();
        },
        closePanel() {
            this.isSettingPasswordView = false;
            this.$refs.listUser.closeactionPanel();
        },
        addUser() {
            this.actionPanelWidth = 650;
            this.isSettingPasswordView = false;
            this.showViewInfo = false;
            this.actionType = 'add';
            this.$refs.listUser.openactionPanel();
        },
        editUser(user) {
            this.actionPanelWidth = 650;
            this.isSettingPasswordView = false;
            this.showViewInfo = false;
            this.actionType = 'edit';
            this.$refs.listUser.openactionPanel();
            this.$refs.panel.resetData();
            this.$refs.panel.setUser(user);
        },
        deleteUser(user) {
            this.$refs.panel.deleteUser(user);
        },
        setNewUserItem(user) {
            this.data.unshift(user);
        },
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
    },
};
</script>

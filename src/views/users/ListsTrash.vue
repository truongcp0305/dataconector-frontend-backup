<template>
    <div class="w-100">
        <list-items
            ref="listUser"
            :headerPrefixKeypath="'user.table'"
            :useDefaultContext="false"
            :pageTitle="$t('user.trash')"
            :tableContextMenu="tableContextMenu"
            :containerHeight="containerHeight"
            :customAPIResult="customAPIResult"
            :getDataUrl="getListUrl + 'users/deleted?page=1&pageSize=50'"
            :actionPanelWidth="actionPanelWidth"
            :commonActionProps="commonActionProps"
            :emptyDataKey="'user-deleted-list'"
            :disableButtonAdd="disableButtonAdd"
        >
            <div slot="right-panel-content" class="h-100">
                <action-panel
                    ref="panel"
                    :showDetailView="showDetailView"
                    @refresh-data="refreshListUser"
                    @refresh-new-user="setNewUserItem"
                    @close-panel="closePanel"
                    :actionType="actionType"
                    :showViewInfo="showViewInfo"
                />
            </div>
        </list-items>
    </div>
</template>
<script>
import { userApi } from './../../api/user.js';
import ListItems from './../../components/common/ListItems.vue';
import ActionPanel from './../../views/users/ActionPanel.vue';
import { util } from './../../plugins/util.js';
import { appConfigs } from '../../configs';

export default {
    components: {
        'list-items': ListItems,
        'action-panel': ActionPanel,
    },
    data() {
        let self=this;
        return {
            showDetailView: false,
            listRowUser: [],
            showImportUser: false,
            userDetailInfo: true,
            isShow: false,
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
            actionPanelWidth: 600,
            containerHeight: 200,
            userInfo: {},
            tableContextMenu: {
                restore: {
                    name: 'restore',
                    text: this.$t('user.table.contextMenu.restore'),
                    callback: (user, callback) => {
                        this.restoreUser(user);
                    },
                },
                view: {
                    name: 'view',
                    text: this.$t('user.table.contextMenu.view'),
                    callback: (user, callback) => {
                        this.showViewDetailInfo(user);
                    },
                },
            },
            columns: [],
            data: [],
            actionType: '',
            isSettingPasswordView: false,
            showViewInfo: false,
            disableButtonAdd: true,
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
                    name: 'restore',
                    text: this.$t('user.table.contextMenu.restore'),
                },
                {
                    name: this.$t('v2.account.showDetail'),
                    text: this.$t('user.table.contextMenu.view'),
                },
            ];
        });
    },
    methods: {
        refreshListUser() {
            this.$refs.listUser.refreshList();
        },
        showViewDetailInfo(user) {
            this.showDetailView = !this.showDetailView;
            this.showViewInfo = true;
            this.$refs.panel.setDetailInfo(user);
            this.$refs.listUser.openactionPanel();
        },
        closePanel() {
            this.isSettingPasswordView = false;
            this.$refs.listUser.closeactionPanel();
        },
        restoreUser(user) {
            this.restoreOneUser(user.id);
        },
        restoreOneUser(id) {
            let self = this;
            let data = {
                status: 1,
            };
            userApi
                .updateUser(id, data)
                .then((res) => {
                    if (res.status == 200) {
                        self.refreshListUser();
                        self.$snotify({
                            type: 'success',
                            title: this.$t('notification.successTitle'),
                        });
                    }
                })
                .catch((err) => {
                    console.error('error from add user api!!!', err);
                });
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

<template>
    <v-app id="symper-platform-app">
        <ba-sidebar @show-user-detail="showMyInfo = true" v-show="true" />
        <v-main style="height: 100vh">
            <v-container fluid fill-height class="pa-0">
                <div
                    ref="appHeader"
                    class="app-header-bg-color"
                    style="
                        border-bottom: 1px solid #e6e5e5;
                        width: calc(100% - 5px);
                    "
                    v-show="true"
                >
                    <AppTab class="float-left" :width="tabsWidth" />
                    <div
                        class="
                            float-right
                            app-header-bg-color
                            mr-2
                            d-flex
                            justify-end
                        "
                        style="height: 40px; line-height: 40px"
                    >
                        <!-- search -->
                        <div
                            v-show="showSearchInput"
                            class="d-flex justify-center align-items-center"
                        >
                            <transition name="slide-fade">
                                <SearchInput
                                    v-show="showSearchInput"
                                    class="mr-2"
                                    style="width: 330px"
                                />
                            </transition>
                        </div>
                        <ExportExcelHeader
                            v-show="isShowFileExport"
                            @handle-show-file-export="showFileExport"
                            @handle-hide-file-export="hideFileExport"
                        />
                        <v-btn
                            icon
                            style="margin-top: 1px"
                            @click="
                                openSqlQueryPanel({
                                    title: 'Query editor',
                                    value: '',
                                    name: 'queryeditor'
                                })
                            "
                            v-if="isBa()"
                        >
                            <v-icon class="mdi-18px">mdi-asterisk</v-icon>
                        </v-btn>
                        <v-menu
                            v-model="isShowDialog"
                            :close-on-content-click="false"
                            :max-width="700"
                            :max-height="700"
                            :nudge-width="570"
                            offset-y
                            style="z-index: 1000; margin-top: 2px"
                        >
                            <template v-slot:activator="{ on }">
                                <v-btn icon v-on="on">
                                    <v-icon class="mdi-18px">mdi-apps</v-icon>
                                </v-btn>
                            </template>
                            <EndUserPopup style="z-index: 1000 !important" />
                        </v-menu>
                        <v-btn
                            icon
                            @click="showSearchInput = !showSearchInput"
                            style="margin-top: 2px"
                            v-if="showSearchIcon"
                        >
                            <v-icon class="mdi-18px">mdi-magnify</v-icon>
                        </v-btn>
                        <v-menu
                            v-model="isShowDialogNotification"
                            z-index="161"
                            :close-on-content-click="closeOnMenuNotifiClick"
                            :max-width="385"
                            :min-width="385"
                            eager
                            :max-height="700"
                            content-class="notification__menu"
                            offset-y
                        >
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-on="on"
                                    icon
                                    v-if="unreadNotification > 0"
                                    style="margin-top: 2px"
                                >
                                    <v-badge
                                        class="sym-small-size"
                                        :content="unreadNotification"
                                        :value="unreadNotification"
                                        color="red"
                                        overlap
                                    >
                                        <v-icon class="mdi-18px"
                                            >mdi-bell-outline</v-icon
                                        >
                                    </v-badge>
                                </v-btn>
                                <v-btn v-on="on" icon v-else>
                                    <v-icon class="mdi-18px"
                                        >mdi-bell-outline</v-icon
                                    >
                                </v-btn>
                            </template>
                            <list-notification
                                ref="notification"
                            ></list-notification>
                        </v-menu>
                    </div>
                </div>
                <v-layout
                    style="height: calc(100% - 41px); overflow: hidden"
                    class="w-100"
                    justify-center
                >
                    <slot> </slot>
                </v-layout>
            </v-container>
        </v-main>
        <v-navigation-drawer
            v-bind:class="[isExpand == true ? 'width-1200' : 'width-400']"
            right
            v-model="showMyInfo"
            v-show="showMyInfo"
            absolute
            style="z-index: 999 !important"
            temporary
        >
            <DetailUser
                :userInfo="sapp.endUserInfo"
                @expand-panel="isExpand = true"
                :close="isExpand"
                @make-small-panel="isExpand = false"
                @closePanel="showMyInfo = false"
            />
        </v-navigation-drawer>
        <template v-if="isBa()">
            <SqlQueryPanel
                :isShowQueryPanel="isShowQueryPanel"
                :title-panel="sqlQueryPanel.title"
                :value-panel="sqlQueryPanel.value"
                :name-panel="sqlQueryPanel.name"
                :smallEditorInstKey="sqlQueryPanel.instKey"
                @close-sql-query-panel="isShowQueryPanel = false"
            >
            </SqlQueryPanel>
        </template>
    </v-app>
</template>

<script>
import Api from '../../api/api.js';
import { appConfigs } from '../../configs';
import BASidebar from '@/components/common/BASidebar.vue';
import EndUserPopup from './../apps/EndUserPopup.vue';
import NotificationBar from '@/components/notification/NotificationBar.vue';
import Search from '@/components/search/Search';
import DetailUser from '@/components/common/user/DetailUser.vue';
// import AppTab from "./AppTab.vue";
import AppTab from './AppPinTabs.vue';
import { util } from '@/plugins/util';
import ExportExcelHeader from '@/components/exportExcel/ExportExcelHeader.vue';
import SqlQueryPanel from '@/components/common/sqlQueryIDE/SqlQueryPanel.vue';
var firebase = require('@firebase/app').firebase;
require('@firebase/messaging');
export default {
    watch: {
        showMyInfo() {
            if (!this.showMyInfo) {
                this.isExpand = false;
            }
        }
    },
    methods: {
        updateCountUnreadNotification() {
            let req = new Api(appConfigs.apiDomain.nofitication);
            req.get('/notifications/count-unread').then((res) => {
                if (res.status == 200) {
                    this.$store.state.app.unreadNotification = res.data;
                }
            });
        },
        logItem(data) {
            console.log(data);
        },
        showFileExport() {
            this.isShowFileExport = true;
        },
        hideFileExport() {
            this.isShowFileExport = false;
        },
        isBa() {
            let userInfo = util.auth.getSavedUserInfo();
            let userType = userInfo.profile.type;

            return userType == 'ba';
        },
        openSqlQueryPanel(data) {
            const self = this;
            clearTimeout(self.timeOut);
            self.timeOut = setTimeout(() => {
                if (data.title == 'Query editor') {
                    if (
                        self.isShowQueryPanel &&
                        self.sqlQueryPanel.title == 'Query editor'
                    ) {
                        self.isShowQueryPanel = false;
                    } else {
                        self.isShowQueryPanel = true;
                        self.sqlQueryPanel.title = data.title;
                        self.sqlQueryPanel.value = data.value;
                        self.sqlQueryPanel.name = 'queryeditor';
                    }
                } else {
                    self.isShowQueryPanel = true;
                    self.sqlQueryPanel.title = data.title;
                    self.sqlQueryPanel.value = data.value;
                    self.sqlQueryPanel.name = data.name;
                    self.sqlQueryPanel.instKey = data.instKey;
                }
            }, 300);
        },
        syncValueFromSmallIde(data) {
            if (
                this.isShowQueryPanel &&
                data.instKey == this.sqlQueryPanel.instKey
            ) {
                this.sqlQueryPanel.value = data.value;
            }
        }
    },
    components: {
        'ba-sidebar': BASidebar,
        'list-notification': NotificationBar,
        EndUserPopup,
        SearchInput: Search,
        DetailUser,
        AppTab,
        ExportExcelHeader,
        SqlQueryPanel
    },
    created() {
        let self = this;
        this.$evtBus.$on('app-receive-remote-msg', (data) => {
            this.$store.state.app.unreadNotification += 1;
            this.$store.state.app.needReloadNotification = true;
        });
        this.$evtBus.$on('symper-open-notification', () => {
            self.closeOnMenuNotifiClick = true;
            setTimeout(() => {
                self.closeOnMenuNotifiClick = false;
            }, 100);
        });
        this.updateCountUnreadNotification();
        this.$evtBus.$on('open-sql-query-ide', (data) => {
            this.openSqlQueryPanel(data);
        });

        this.$evtBus.$on('reset-sql-query-ide-connector', () => {
            this.sqlQueryPanel.name = '';
            this.sqlQueryPanel.instKey = '';
            this.sqlQueryPanel.value = '';
        });

        this.$evtBus.$on('small-sql-query-ide-sync-value', (data) => {
            this.syncValueFromSmallIde(data);
        });
        const unreadChannel = new BroadcastChannel(
            'updateCountUnreadNotification'
        );
        unreadChannel.onmessage = (message) => {
            this.updateCountUnreadNotification();
            this.$refs.notification.getListNoticication();
        };
    },
    computed: {
        showSearchIcon() {
            return SYMPER_ENV.environment != 'stage';
        },
        sapp() {
            return this.$store.state.app;
        },
        unreadNotification() {
            return this.$store.state.app.unreadNotification;
        }
    },
    data: function () {
        return {
            timeOut: null,
            showConfigNotification: false,
            isExpand: false,
            showSearchInput: false,
            isShowDialog: false,
            isShowDialogNotification: false,
            showMyInfo: false,
            closeOnMenuNotifiClick: false,
            tabsWidth: 'calc(100% - 165px)',
            isShowFileExport: false,
            isShowQueryPanel: false,
            sqlQueryPanel: {
                title: 'Query editor',
                value: '',
                name: '',
                instKey: ''
            }
        };
    }
};
</script>
<style>
.app-header-bg-color,
.app-header-bg-color .v-item-group {
    background-color: white !important;
}

.nofitication-title-bar {
    font-size: 13px;
    font-weight: bold;
}
.width-1200 {
    width: 1200px !important;
}
.width-400 {
    width: 400px !important;
}
.notification__menu {
    background-color: white;
}
</style>

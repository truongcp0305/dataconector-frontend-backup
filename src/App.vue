<template>
    <div id="symper-app" @click="handleClickApp">
        <component :is="layout">
            <keep-alive>
                <router-view
                    :key="$route.params.pageInstanceKey"
                    ref="viewComponent"
                    @symper-app-set-tab-stitle="setTabTitle"
                />
            </keep-alive>
            <notifications
                group="symper-general-notification"
                :position="sapp.generalNotificationPosition"
            >
                <template slot="body" slot-scope="props">
                    <general-notification
                        :props="props"
                        @close-notification="closeNotification(props)"
                    ></general-notification>
                </template>
            </notifications>
            <v-dialog v-model="activeResolveBaclog" width="500">
                <resolve-backlog-request
                    @change-select-item="handleChangeSelectItem"
                    @close-dialog="closeDialog"
                    @sync-backlog-request="syncBacklogRequest"
                    @remove-backlog-request="removeBacklogRequest"
                    :resolved="backlogRequests.resolved"
                    :needResolve="backlogRequests.needResolve"
                    :resolving="backlogRequests.resolving"
                ></resolve-backlog-request>
            </v-dialog>
        </component>

        <v-dialog v-model="conflicSignInUser" width="500">
            <v-card>
                <v-card-title class="headline">
                    <i class="mdi mdi-alert red--text mr-2"></i>
                    {{ $t('v2.general.conflictLoginUser') }}</v-card-title
                >
                <v-card-text>
                    {{ $t('v2.general.notiLogInWithManyAccount') }}
                    <br />
                    <span class="font-weight-medium">{{
                        $t('v2.general.pleaseReloadPage')
                    }}</span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn depressed color="primary" @click="reloadPage">
                        {{ $t('v2.general.reloadPage') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
/**
 * Cách tổ chức layout học theo: https://itnext.io/anyway-heres-how-to-create-a-multiple-layout-system-with-vue-and-vue-router-b379baa91a05
 */
import GeneralNotification from './components/common/GeneralNotification.vue';
import IndexedDB from './plugins/utilModules/indexedDB.js';
import ResolveBacklogRequest from './components/app/ResolveBacklogRequest';
import { util } from './plugins/util.js';

var SYM_IDB_NAME = 'SYMPER-IDB-STORE';
const STORE_REQUEST_NAME = 'requestes';
export default {
    created() {
        window.SYMPER_APP = this;
        this.$store.state.app.pinTabs.browserHistory = {
            // phục vụ cho việc biết được là user đang ấn back hay forward trên trình duyệt
            stateStack: [null], // phần tử đầu tiên luôn là null để đánh dấu đó là đầu trang
            currentIndex: 0
        };
        this.checkUniqueUserInAllTab();
        this.listenKeyEvents();
    },
    data() {
        return {
            activeResolveBaclog: false,
            backlogRequests: {
                needResolve: {},
                resolved: {},
                resolving: {}
            },
            conflicSignInUser: false
        };
    },
    components: {
        'general-notification': GeneralNotification,
        'resolve-backlog-request': ResolveBacklogRequest
    },
    mounted() {
        // this.checkBacklogRequest();
    },
    watch: {
        $route: {
            deep: true,
            handler() {
                let self = this;
                setTimeout(() => {
                    self.setTabTitle(
                        self.$refs.viewComponent.symperComponentTabTtile
                    );
                }, 0);
            }
        }
    },
    methods: {
        listenKeyEvents() {
            let self = this;
            document.addEventListener('keydown', (evt) => {
                if (evt.which == 16) {
                    self.shortCutAddTap = true;
                }
            });

            document.addEventListener('keyup', (evt) => {
                if (evt.which == 16) {
                    self.shortCutAddTap = false;
                }
            });
        },
        setTabTitle(title) {
            // Chỗ này chưa tính tới trường hợp đang load tiêu đề task thì đã chuyển sang tab mới --> gán sai tên tab
            let pinTabs = this.$store.state.app.pinTabs;
            let oldTitle = pinTabs.mapTab[pinTabs.currentTabId].title;
            title = title ? title : oldTitle ? oldTitle : '...';
            pinTabs.mapTab[pinTabs.currentTabId].title = title;
        },
        reloadPage() {
            location.reload();
        },
        checkUniqueUserInAllTab() {
            let self = this;
            document.addEventListener('visibilitychange', function () {
                if (!document.hidden) {
                    self.conflicSignInUser = false;
                    let storageData = util.auth.getSavedUserInfo();
                    let stateData = self.$store.state.app;

                    if (!$.isEmptyObject(storageData)) {
                        // Nếu BA đăng nhập
                        if (storageData.profile.delegatedBy) {
                            if (
                                stateData.baInfo.id !=
                                storageData.profile.delegatedBy.id
                            ) {
                                self.conflicSignInUser = true;
                            }
                        } else if (stateData.baInfo.id != storageData.baId) {
                            self.conflicSignInUser = true;
                        } else if (stateData.baInfo.id == '0') {
                            // Nếu enduser đăng nhập
                            if (
                                stateData.endUserInfo.id !=
                                storageData.endUserId
                            ) {
                                self.conflicSignInUser = true;
                            }
                        }
                    }
                }
            });
        },
        handleClickApp(evt) {
            this.$evtBus.$emit('symper-app-wrapper-clicked', evt);
            if ($(evt.target).attr('symper-action')) {
                let actionDef = null;
                try {
                    actionDef = JSON.parse($(evt.target).attr('symper-action'));
                } catch (error) {
                    console.error(
                        '[SYMPER-ACTION-HANDLER: DOM has symper-action attribute but can not parse to object]',
                        evt.target
                    );
                }

                if (actionDef) {
                    if (actionDef.action) {
                        this.$evtBus.$emit(
                            'symper-app-call-action-handler',
                            actionDef.action,
                            this,
                            actionDef.params ? actionDef.params : {}
                        );
                    } else {
                        console.error(
                            '[SYMPER-ACTION-HANDLER: action property not found in action definition]',
                            evt.target,
                            actionDef
                        );
                    }
                }
            }
        },
        removeBacklogRequest() {
            let needResolve = this.backlogRequests.needResolve;

            for (let i in needResolve) {
                if (needResolve[i].selected) {
                    this.$delete(this.backlogRequests.needResolve, i);
                }
            }
        },
        syncBacklogRequest() {
            let needResolve = this.backlogRequests.needResolve;
            for (let i in needResolve) {
                if (needResolve[i].selected) {
                    this.$set(this.backlogRequests.resolving, i, true);
                }
            }

            setTimeout(
                (thisCpn) => {
                    for (let i in thisCpn.backlogRequests.resolving) {
                        thisCpn.$set(thisCpn.backlogRequests.resolved, i, true);
                    }
                },
                2000,
                this
            );
        },
        handleChangeSelectItem(key) {
            this.backlogRequests.needResolve[key].selected =
                !this.backlogRequests.needResolve[key].selected;
        },
        closeDialog() {
            this.activeResolveBaclog = false;
        },
        closeNotification(props) {
            props.close();
        },
        /**
         * Kiểm tra các request còn tồn đọng trong indexed db để thông báo cho người dùng
         */
        checkBacklogRequest() {
            let idb = new IndexedDB(SYM_IDB_NAME);
            let activeBacklogs = {};
            let thisCpn = this;
            idb.open(STORE_REQUEST_NAME, false, false, () => {
                idb.readAll(
                    (item) => {
                        activeBacklogs[item.key] = item.value;
                        activeBacklogs[item.key].selected = false;
                        activeBacklogs[item.key].create_time = new Date(
                            activeBacklogs[item.key].create_time
                        ).toLocaleString();
                    },
                    () => {
                        thisCpn.$set(
                            this.backlogRequests,
                            'needResolve',
                            activeBacklogs
                        );
                        let backlogLength = Object.keys(activeBacklogs).length;
                        if (backlogLength > 0) {
                            thisCpn.$snotify({
                                title: thisCpn.$t(
                                    'v2.general.dataOutOfSync'
                                ),
                                text:
                                    thisCpn.$t(
                                        'v2.general.notiSyncBegin'
                                    ) +
                                    `${backlogLength}` +
                                    thisCpn.$t('v2.general.notiSyncEnd'),
                                actionBtns: [
                                    {
                                        text: thisCpn.$t(
                                            'v2.general.handle'
                                        ),
                                        icon: 'mdi-send-check',
                                        action: () => {
                                            thisCpn.activeResolveBaclog = true;
                                        }
                                    }
                                ]
                            });
                        }
                    }
                );
            });
        }
    },
    computed: {
        layout() {
            let contentOnly =
                this.$route.meta && this.$route.meta.layout == 'content-only';
            if (!window.appLoaded) {
                contentOnly = true;
            }
            window.appLoaded = true;
            if (contentOnly) {
                return 'content-only-view';
            } else {
                // return isBA ? "ba-view" : "end-user-view";
                return 'end-user-view';
            }
        },
        sapp() {
            return this.$store.state.app;
        }
    }
};
</script>

<template>
    <div>
        <v-row>
            <v-app-bar
                dense
                flat
                color="white"
                class="notification-list-bar"
                fixed
            >
                <v-col :cols="4">
                    <v-toolbar-title class="nofitication-title-bar fw-400">
                        {{ $t('notification.title') }}</v-toolbar-title
                    >
                </v-col>
                <v-col :cols="8" class="text-right pt-1 pb-1 pr-0">
                    <!-- Tìm kiếm -->
                    <v-text-field
                        dense
                        class="
                            bg-grey
                            sym-small-pad sym-small-size
                            d-inline-block
                            mr-2
                        "
                        append-icon="mdi-magnify"
                        flat
                        solo
                        @input="searchNotification"
                        v-model="txtSearch"
                        :placeholder="$t('common.enter_to_search')"
                    ></v-text-field>
                    <v-menu
                        z-index="162"
                        :max-width="200"
                        :min-width="200"
                        :max-height="500"
                        offset-y
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
                                v-on="on"
                                x-small
                                solo
                                class="bg-grey h-30"
                                text
                            >
                                <v-icon size="18">mdi-dots-horizontal</v-icon>
                            </v-btn>
                        </template>
                        <v-list dense light nav>
                            <v-list-item dense flat>
                                <v-list-item-content
                                    class="pt-0 pb-0 notification-global-action"
                                    @click="markReadAll()"
                                >
                                    <v-chip>
                                        <v-icon size="15">mdi-check-all</v-icon>
                                        <span>
                                            {{
                                                $t(
                                                    'notification.mark_all_as_read'
                                                )
                                            }}</span
                                        >
                                    </v-chip>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-col>
            </v-app-bar>
            <v-row
                class="mx-0 px-5 list-notification bg-white"
                :z-index="99999"
                v-if="listNotification.length != 0"
            >
                <v-row
                    v-if="checkToday"
                    class="w-100 fs-13 ml-3 mt-1"
                    style="margin-bottom: -2px"
                >
                    <span class="fw-430" style="color: orange">{{
                        $t('notification.today')
                    }}</span>
                </v-row>
                <div
                    v-for="item in listNotification.filter(
                        (x) => changeDate(x.createTime) == today && checkToday
                    )"
                    :key="item.id"
                    style="height: 58px"
                    class="text-left notification-item py-0"
                >
                    <DetailNotificationBar
                        :item="item"
                        @open-popup-detail="openPopupDetail"
                    />
                </div>
                <!-- older -->
                <v-row
                    class="w-100 fs-13 ml-3 mt-1"
                    style="margin-bottom: -3px"
                >
                    <span class="fw-430" style="color: orange">
                        {{ $t('notification.older') }}
                    </span>
                </v-row>
                <div
                    v-for="item in listNotification.filter(
                        (x) => changeDate(x.createTime) != today
                    )"
                    :key="item.id"
                    style="height: 58px"
                    class="text-left notification-item py-0"
                >
                    <DetailNotificationBar
                        :item="item"
                        @open-popup-detail="openPopupDetail"
                    />
                </div>
                <!-- older -->
                <v-overlay :value="overlay">
                    <v-progress-circular
                        indeterminate
                        size="64"
                    ></v-progress-circular>
                </v-overlay>
                <div class="text-center grey--text pt-4 pb-4 w-100 fs-12">
                    {{
                        endOfNoti
                            ? $t('notification.no_information')
                            : loading
                            ? $t('notification.loading') + '...'
                            : $t('notification.load_more')
                    }}
                </div>
            </v-row>
            <NotFoundScreen
                class="py-5 list-notification"
                :emptyDataKey="'popup-notification'"
                v-else
            />
            <v-dialog
                v-model="dialogConfigNotification"
                width="600px"
                hide-overlay
            >
                <v-app-bar
                    dense
                    flat
                    color="white"
                    class="notification-list-bar"
                    fixed
                >
                    <slot name="header">
                        <v-toolbar-title class="nofitication-title-bar w-100">
                            <v-icon size="15">mdi-cog</v-icon
                            >{{ $t('notification.config') }}
                            <v-icon
                                class="close-btn float-right"
                                @click="hideNotificationConfig()"
                                >mdi-close</v-icon
                            >
                        </v-toolbar-title>
                    </slot>
                </v-app-bar>
                <v-row
                    class="ml-0 mr-0 pl-5 pr-5 list-notification bg-white"
                    :z-index="999"
                >
                    <slot name="body">
                        <v-row class="text-left notification-item">
                            <v-col cols="1">
                                <v-row>
                                    <v-icon size="30"
                                        >mdi-file-document-outline
                                    </v-icon>
                                </v-row>
                            </v-col>
                            <v-col
                                cols="11"
                                @click="openSubcribeConfig('document')"
                            >
                                <v-row>
                                    <span
                                        class="
                                            notification-subscribe-type-title
                                        "
                                    >
                                        {{ $t('v2.doc.text') }}
                                    </span>
                                </v-row>
                                <v-row class="mt-1">
                                    <span
                                        class="
                                            notification-subscribe-type-description
                                        "
                                    >
                                        {{
                                            $t(
                                                'notification.message_configuration_in_case_document_is_effected'
                                            )
                                        }}
                                    </span>
                                </v-row>
                            </v-col>
                        </v-row>
                    </slot>
                </v-row>
            </v-dialog>
            <v-dialog
                v-model="dialogConfigNotificationSubscribe"
                width="600px"
                hide-overlay
            >
                <v-app-bar
                    dense
                    flat
                    color="white"
                    class="notification-list-bar"
                    fixed
                >
                    <slot name="header">
                        <v-toolbar-title
                            class="notification-subscribe-type-title w-100"
                        >
                            {{ dialogConfigNotificationSubscribeTitle }}<br />
                            <span
                                class="notification-subscribe-type-description"
                            >
                                {{
                                    dialogConfigNotificationSubscribeDescription
                                }}
                            </span>
                            <v-icon
                                class="close-btn float-right"
                                @click="hideSubcribeConfig()"
                                >mdi-close</v-icon
                            >
                        </v-toolbar-title>
                    </slot>
                </v-app-bar>
                <v-row
                    class="ml-0 mr-0 pl-5 pr-5 list-notification bg-white"
                    :z-index="999"
                >
                    <slot name="body">
                        <v-row
                            class="text-left notification-topic"
                            v-for="item in listTopic"
                            :key="item.id"
                        >
                            <v-col cols="10" style="padding: 6px !important">
                                <v-row>
                                    <span class="notification-topic-title">{{
                                        item.name
                                    }}</span
                                    ><br />
                                </v-row>
                                <v-row>
                                    <span
                                        class="notification-topic-description"
                                        >{{ item.description }}</span
                                    >
                                </v-row>
                            </v-col>
                            <v-col cols="2">
                                <v-row class="float-right">
                                    <v-switch
                                        class="p-0"
                                        v-model="item.subscribed"
                                        @change="
                                            changeSubcribedTopic(
                                                item.id,
                                                item.subscribed
                                            )
                                        "
                                        hide-details
                                    ></v-switch>
                                </v-row>
                            </v-col>
                        </v-row>
                    </slot>
                </v-row>
            </v-dialog>
        </v-row>
        <v-dialog v-model="show" persistent width="90%" scrollable>
            <div
                class="w-100 bg-white pa-3 h-100"
                style="height: 800px !important; position: relative"
            >
                <Preloader v-if="loadingDetail" />
                <detailDocument
                    class="detail-doc"
                    v-if="show && showDetailDoc"
                    :showCommentInDoc="true"
                    :docObjInfo="docObjInfo"
                    :showBtnClose="true"
                    @close="closeDialog"
                />
                <myItem
                    ref="relatedTasks"
                    v-if="show && !showDetailDoc"
                    :selectFirstTaskAfterGetList="'byUncompleteTask'"
                    :showCloseBtn="true"
                    :filterFromParent="{
                        relatedTasksByDocObjId: docObjId
                    }"
                    @close="closeDialog"
                    @get-doc-related-success="getDocRelatedSuccess"
                    :isPopUp="true"
                />
            </div>
        </v-dialog>
    </div>
</template>

<script>
import Preloader from '@/components/common/Preloader.vue';
import notificationApi from '../../api/settingNotification';
import Api from '../../api/api.js';
import icon from '../common/SymperIcon';
import { appConfigs } from '../../configs';
import Vue from 'vue';
import SymperAvatar from '@/components/common/SymperAvatar';
import DetailNotificationBar from './DetailNotificationBar';
import NotFoundScreen from '@/components/common/NotFoundScreen';

export default {
    name: 'listNoti',
    components: {
        icon,
        SymperAvatar,
        DetailNotificationBar,
        NotFoundScreen,
        myItem: () => import('@/views/myItem/MyItemShowList.vue'),
        detailDocument: () => import('@/views/document/detail/Detail'),
        Preloader
    },
    data: function () {
        return {
            deadLine: '',
            pageNumber: 1,
            img: '',
            today: this.$moment().format('DD/MM/YYYY'),
            listSource: {},
            overlay: true,
            checkToday: false,
            listNotification: [],
            txtSearch: '',
            dialogConfigNotification: false,
            dialogConfigNotificationSubscribe: false,
            dialogConfigNotificationSubscribeTitle: '',
            dialogConfigNotificationSubscribeDescription: '',
            dialogConfigNotificationSubscribeIcon: '',
            listTopic: [],
            loading: false,
            endOfNoti: false,
            pageSize: 20,
            show: false,
            docObjInfo: null,
            docObjId: '',
            showDetailDoc: false,
            loadingDetail: false
        };
    },
    created() {
        this.getListNoticication();
        this.getSource();
        //this.getAvatar();
    },
    mounted() {
        this.$evtBus.$on('app-receive-remote-msg', (data) => {
            this.getListNoticication();
        });
        let self = this;
        setTimeout(() => {
            self.initScrollEventListener();
        }, 500);
    },
    methods: {
        closeDialog() {
            this.show = false;
            this.showDetailDoc = false;
        },
        getDocRelatedSuccess(data) {
            if (data.listObject.length == 0) {
                this.docObjInfo = {
                    docObjId: this.docObjId,
                    docSize: '21cm'
                };
                this.showDetailDoc = true;
                this.loadingDetail = false;
            } else {
                this.showDetailDoc = false;
                this.loadingDetail = false;
            }
        },
        detailTaskDialogHeight() {
            return window.innerHeight * 0.9 + 'px';
        },
        openPopupDetail(relatedTasksByDocObjId) {
            this.docObjId = relatedTasksByDocObjId;
            this.loadingDetail = true;
            this.show = true;
        },
        initScrollEventListener() {
            let menuEl = this.$el.parentNode;
            let self = this;
            if (menuEl) {
                menuEl.onscroll = () => {
                    let bottomOfWindow =
                        menuEl.offsetHeight + menuEl.scrollTop + 5 >=
                        menuEl.scrollHeight;
                    if (bottomOfWindow) {
                        self.pageNumber += 1;
                        self.loadMore();
                    }
                };
            }
        },
        loadMore() {
            const self = this;
            let req = new Api(appConfigs.apiDomain.nofitication);
            if (self.loading) {
                return;
            }
            self.loading = true;
            req.get('/notifications', {
                keyword: this.txtSearch,
                page: this.pageNumber
            })
                .then((res) => {
                    if (res.status == 200) {
                        let menuEl = self.$el.parentNode;
                        menuEl.scrollTop = menuEl.scrollTop + 100;
                        self.listNotification = [
                            ...self.listNotification,
                            ...res.data
                        ];
                        if (res.data.length == 0) {
                            self.endOfNoti = true;
                        }
                    } else {
                        self.showError();
                    }
                    self.loading = false;
                })
                .catch((err) => {
                    this.showError();
                });
        },
        getSource() {
            const self = this;
            notificationApi.showAllModuleConfig().then((res) => {
                if (res.status == 200) {
                    self.listSource = res.data;
                }
            });
        },
        changeDate(value) {
            return this.$moment.unix(value).format('DD/MM/YYYY');
        },
        checkListToday() {
            for (let i = 0; i < this.listNotification.length; i++) {
                let dayListNotification = this.$moment
                    .unix(this.listNotification[i].createTime)
                    .format('DD/MM/YYYY');
                let today = this.$moment().format('DD/MM/YYYY');
                if (today == dayListNotification) {
                    this.checkToday = true;
                }
            }
            return this.checkToday;
        },
        translateActionMenu() {
            for (let key in this.listNotification) {
                let actionMenu = this.listNotification[key].actionMenu;
                let action = JSON.parse(this.listNotification[key].action);
                if (action.module == 'document' && action.scope == 'workflow') {
                    actionMenu.map((e) => {
                        if (e.value == 'read') {
                            e.text = this.$t('notification.' + e.value);
                        }
                    });
                } else {
                    actionMenu.map((e) => {
                        e.text = this.$t('notification.' + e.value);
                    });
                }
            }
        },
        getListNoticication() {
            let req = new Api(appConfigs.apiDomain.nofitication);
            req.get('/notifications', { keyword: this.txtSearch })
                .then((res) => {
                    if (res.status == 200) {
                        this.overlay = false;
                        this.listNotification = res.data;
                        this.translateActionMenu();
                        this.checkListToday();
                        if (res.data.length < this.pageSize) {
                            this.endOfNoti = true;
                        }
                    } else {
                        this.showError();
                    }
                })
                .catch((err) => {
                    this.showError();
                });
        },
        markRead(notificationItem) {
            if (notificationItem.state == '0') {
                let req = new Api(appConfigs.apiDomain.nofitication);
                req.post('/notifications/' + notificationItem.id + '/read')
                    .then((res) => {
                        if (res.status == 200) {
                            notificationItem.state = '1';
                            this.$store.state.app.unreadNotification -= 1;
                        } else {
                            this.showError();
                        }
                    })
                    .catch((err) => {
                        this.showError();
                    });
            }
        },
        deleteNotificationItem(notificationItem) {
            if (notificationItem.state == '0') {
                let req = new Api(appConfigs.apiDomain.nofitication);
                req.delete('/notifications/' + notificationItem.id)
                    .then((res) => {
                        if (res.status == 200) {
                            notificationItem.state = '1';
                            this.$store.state.app.unreadNotification -= 1;
                        } else {
                            this.showError();
                        }
                    })
                    .catch((err) => {
                        this.showError();
                    });
            }
        },
        markReadAll() {
            let req = new Api(appConfigs.apiDomain.nofitication);
            req.post('/notifications/read')
                .then((res) => {
                    if (res.status == 200) {
                        this.listNotification.map(function (item) {
                            item.state = '1';
                            return item;
                        });
                        this.$store.state.app.unreadNotification = 0;
                    } else {
                        this.showError();
                    }
                })
                .catch((err) => {
                    this.showError();
                });
        },
        searchNotification() {
            if (this.searchDebounce) {
                clearTimeout(this.searchDebounce);
            }
            this.searchDebounce = setTimeout(this.getListNoticication, 500);
        },
        showConfig() {
            this.dialogConfigNotification = true;
        },
        hideNotificationConfig() {
            this.dialogConfigNotification = false;
        },
        openSubcribeConfig(type) {
            this.dialogConfigNotification = false;
            this.dialogConfigNotificationSubscribe = true;
            if (type == 'document') {
                this.showSubcribesConfigDocument();
            }
        },
        hideSubcribeConfig() {
            this.dialogConfigNotificationSubscribe = false;
            this.dialogConfigNotification = true;
        },
        showSubcribesConfigDocument() {
            this.dialogConfigNotificationSubscribeTitle = 'Document';
            this.dialogConfigNotificationSubscribeDescription = this.$t(
                'v2.noti.configReceiveNotiFromChangeDocument'
            );
            let req = new Api(appConfigs.apiDomain.nofitication);
            req.get('/channels', {})
                .then((res) => {
                    if (res.status == 200) {
                        this.overlay = false;
                        this.listTopic = res.data;
                    } else {
                        this.showError();
                    }
                })
                .catch((err) => {
                    this.showError();
                });
        },
        changeSubcribedTopic(id, state) {
            let req = new Api(appConfigs.apiDomain.nofitication);
            req.post('/channels/' + id, { state: state })
                .then((res) => {
                    if (res.status == 200) {
                    } else {
                        this.showError();
                    }
                })
                .catch((err) => {
                    this.showError();
                });
        }
    }
};
</script>
<style scoped>
.v-card .list-app {
    max-height: 700px;
    overflow: auto;
}
.notification-item-title {
    font-size: 12px;
}

.right-180 {
    right: -180px !important;
}
.right-200 {
    right: -200px !important;
}
.notification-item {
    cursor: pointer;
    width: 100%;
    padding: 10px;
}
.notification-item:hover {
    background: #eeeeee !important;
}
.notification-topic {
    border-bottom: rgba(221, 221, 221, 0.2) 1px solid;
    cursor: pointer;
    width: 100%;
    padding: 2px;
}
.notification-topic:hover {
    background: #eeeeee !important;
}
.v-list-item {
    cursor: pointer;
}
.v-list-item:hover {
    background: #eeeeee;
}
.notification-list-bar {
    position: sticky !important;
    padding: 0 5px;
}
.notification-list-bar >>> .v-toolbar__content {
    border-bottom: 1px solid #dddddd !important;
}
.notification-global-action {
    font-size: 12px;
    cursor: pointer;
}
.notification-global-action >>> .v-chip,
.notification-global-action >>> .v-chip-content:hover {
    background: none;
    cursor: pointer;
}
.list-notification {
    width: 100%;
}
.notification-subscribe-type-title {
    font-size: 12px;
    font-weight: bold;
}
.notification-subscribe-type-description {
    font-size: 11px;
    color: #777777;
    font-weight: normal;
}
.notification-topic-title {
    font-size: 13px;
}
.notification-topic-description {
    font-size: 11px;
    color: #777777;
    font-weight: normal;
}
.theme--light.v-divider {
    border-color: rgba(0, 0, 0, 0.05);
}
</style>

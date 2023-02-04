<template>
    <div class="end-user-popup">
        <v-card>
            <v-tabs v-model="tab" v-show="false"> </v-tabs>
            <v-tabs-items v-model="tab">
                <v-tab-item value="tab-1">
                    <v-card>
                        <v-app-bar dense flat color="white">
                            <v-toolbar-title>
                                <v-icon>mdi-apps</v-icon>
                                <span class="tittle">{{
                                    $t('apps.title')
                                }}</span>
                            </v-toolbar-title>
                            <v-spacer></v-spacer>
                        </v-app-bar>
                        <div class="list-favorite">
                            <div class="title-favorite">
                                <v-icon>mdi-playlist-star</v-icon>
                                <h4>{{ $t('apps.favorite') }}</h4>
                            </div>
                            <Preloader v-if="loadingFavorite == true" />
                            <ul
                                style="margin: 0 10px"
                                v-else-if="
                                    loadingFavorite == false &&
                                    sFavorite.length > 0
                                "
                            >
                                <VuePerfectScrollbar style="max-height: 200px">
                                    <li
                                        v-for="(item, i) in sFavorite"
                                        :key="i"
                                        v-on:click="
                                            rightClickHandler(
                                                $event,
                                                item,
                                                item.type,
                                            )
                                        "
                                        v-on:contextmenu="
                                            rightClickHandler(
                                                $event,
                                                item,
                                                item.type,
                                            )
                                        "
                                        style="cursor: pointer"
                                    >
                                        <div
                                            style="
                                                position: relative;
                                                display: flex;
                                            "
                                        >
                                            <v-icon
                                                style="
                                                    font-size: 13px;
                                                    margin-right: 8px;
                                                "
                                                >{{
                                                    listIcon[item.type]
                                                }}</v-icon
                                            >
                                            <div class="d-flex flex-column">
                                                <div
                                                    class="title-item-favorite"
                                                >
                                                    {{
                                                        item.type ==
                                                        'document_definition'
                                                            ? item.title
                                                            : item.name
                                                    }}
                                                </div>
                                                <span
                                                    style="
                                                        font: 12px roboto;
                                                        font-weight: 200;
                                                    "
                                                    >{{ item.appName }}</span
                                                >
                                            </div>

                                            <v-icon
                                                color="#F6BE4F"
                                                style="
                                                    float: right;
                                                    font-size: 13px;
                                                    position: absolute;
                                                    top: 6px;
                                                    right: 0px;
                                                "
                                                >mdi-star</v-icon
                                            >
                                        </div>
                                    </li>
                                </VuePerfectScrollbar>
                            </ul>
                            <!-- <div v-else>
							<div style="padding-left:180px">
								<div style="margin-right:auto;margin-left:auto;opacity:0.3"> {{$t('apps.emptyFavorite')}} </div>
								<v-icon style="font-size:60px;padding-left:40px;margin-top:8px;opacity:0.3">
									mdi-star-off
								</v-icon>
							</div>
						</div> -->
                            <NotFoundScreen
                                :emptyDataKey="'popup-favorite-application-list'"
                                v-else
                            />
                        </div>
                        <div class="title-list-app">
                            <v-icon>mdi-playlist-play</v-icon>
                            <h4>{{ $t('apps.listApp') }}</h4>
                        </div>
                        <div class="list-app-cointaner">
                            <Preloader v-if="loadingApp == true" />
                            <VuePerfectScrollbar
                                v-else-if="
                                    loadingApp == false && apps.length > 0
                                "
                                style="max-height: 330px"
                                class="d-flex flex-wrap"
                            >
                                <div
                                    v-for="(item, i) in apps"
                                    :key="i"
                                    class="list-app-item"
                                    @click="clickDetails(item)"
                                >
                                    <div class="app-item-icon" searchKey>
                                        <v-icon
                                            v-if="item.iconType == 'icon'"
                                            >{{ item.iconName }}</v-icon
                                        >
                                        <img
                                            v-else-if="item.iconType == 'img'"
                                            :src="item.iconName"
                                            class="app-item-img"
                                        />
                                        <v-icon v-else>mdi-star</v-icon>
                                    </div>
                                    <v-tooltip bottom>
                                        <template
                                            v-slot:activator="{ on, attrs }"
                                        >
                                            <div class="app-active-title">
                                                <h5 v-bind="attrs" v-on="on">
                                                    {{ item.name }}
                                                </h5>
                                            </div>
                                        </template>
                                        <span>{{ item.name }}</span>
                                    </v-tooltip>
                                </div>
                            </VuePerfectScrollbar>
                            <!-- <div v-else>
							<div style="padding-left:150px">
								<div style="margin-right:auto;margin-left:auto;opacity:0.3"> {{$t('apps.emptyApp')}} </div>
								
								<v-img
								:src="urlEmptyApp" style="width:60px;height:60px;margin-left:38px;margin-bottom:12px;margin-top:8px">
								</v-img>
							</div>
						</div> -->
                            <NotFoundScreen
                                :emptyDataKey="'popup-application-list'"
                                v-else
                            />
                        </div>
                    </v-card>
                </v-tab-item>
                <v-tab-item value="tab-2">
                    <v-card flat class="tab-detail">
                        <v-card-title>
                            <v-btn @click="clickBack" icon
                                ><v-icon class="tab-detail-icon-title"
                                    >mdi-keyboard-backspace</v-icon
                                ></v-btn
                            >
                            <v-icon v-if="title.iconType == 'icon'">{{
                                title.iconName
                            }}</v-icon>
                            <img
                                v-else
                                :src="title.iconName"
                                style="width: 20px; height: 20px"
                            />
                            <h4>{{ title.name }}</h4></v-card-title
                        >
                        <v-text-field
                            :label="$t('apps.search')"
                            single-line
                            solo
                            append-icon="mdi-magnify"
                            v-model="searchKey"
                        ></v-text-field>
                        <AppDetail
                            ref="appDetails"
                            :isEndUserCpn="isEndUserCpn"
                            :searchKey="searchKey"
                        />
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
        </v-card>
        <ContextMenu ref="contextMenu" />
    </div>
</template>
<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import AppDetail from './AppDetail.vue';
import { appManagementApi } from '@/api/AppManagement.js';
import ContextMenu from './ContextMenu.vue';
import Preloader from '@/components/common/Preloader.vue';
import emptyApp from '@/assets/image/empty_app.png';
import MyApplicationWorker from 'worker-loader!@/worker/application/MyApplication.Worker.js';
import NotFoundScreen from '@/components/common/NotFoundScreen';
export default {
    data: function () {
        return {
            listAppHeight: '200px',
            listFavoriteHeight: '100%',
            myApplicationWorker: null,
            tab: 'tab-1',
            isEndUserCpn: true,
            searchKey: '',
            listIcon: {
                document_definition: 'mdi-file-document-outline',
                workflow_definition: 'mdi-lan',
                orgchart: 'mdi-widgets-outline',
                dashboard: 'mdi-view-dashboard',
            },
            apps: {},
            listFavorite: [],
            testListFavorite: [],
            loadingFavorite: true,
            loadingApp: true,
            urlEmptyApp: emptyApp,
            arrType: {
                document_definition: [],
                orgchart: [],
                dashboard: [],
                workflow_definition: [],
            },
            title: {},
            mapId: {
                orgchart: {},
                document_definition: {},
                dashboard: {},
                workflow_definition: {},
            },
            mapIdFavorite: {
                orgchart: {},
                document_definition: {},
                dashboard: {},
                workflow_definition: {},
            },
        };
    },
    created() {
        this.myApplicationWorker = new MyApplicationWorker();
        this.getActiveapps();
        this.getFavorite();
        let self = this;
        this.myApplicationWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'getFavorite':
                    self.handleGetFavorite(data.dataAfter);
                    break;
                case 'getActiveApp':
                    self.handleGetActiveApp(data.dataAfter);
                    break;
                case 'getAppDetails':
                    self.handlerGetAppDetals(data.dataAfter);
                    break;
                case 'getItemByType':
                    self.handlerGetObjectSuccess(
                        data.dataAfter.type,
                        data.dataAfter.res,
                    );
                    break;
                default:
                    break;
            }
        });
    },
    mounted() {
        let thisCpn = this;
        $(document).click(function (e) {
            if (!$(e.target).is('.menu') && !$(e.target).is('.menuItem')) {
                $('.menu').hide();
            }
        });
        $(document).click(function (e) {
            if (!$(e.target).is('.context-menu')) {
                $('.context-menu').css('display', 'none');
                if (thisCpn.tab == 'tab-1') {
                    thisCpn.$refs.contextMenu.hide();
                } else {
                    thisCpn.$refs.appDetails.hideContextMenu();
                }
            }
        });
    },
    components: {
        VuePerfectScrollbar,
        AppDetail,
        ContextMenu,
        Preloader,
        NotFoundScreen,
    },
    computed: {
        sAppManagement() {
            return this.$store.state.appConfig.listItemSelected;
        },
        sFavorite() {
            return this.$store.state.appConfig.listFavorite;
        },
        listApp() {
            return this.$store.state.appConfig.listApps;
        },
    },
    methods: {
        handlerGetAppDetals(res) {
            if (res.status == 200) {
                if (Object.keys(res.data.listObject.childrenApp).length > 0) {
                    this.checkChildrenApp(res.data.listObject.childrenApp);
                } else {
                    this.$store.commit('appConfig/emptyItemSelected');
                }
            }
        },
        getActiveapps() {
            this.myApplicationWorker.postMessage({
                action: 'getActiveApp',
            });
        },
        handleGetActiveApp(res) {
            this.loadingApp = false;
            if (res.status == 200) {
                this.apps = res.data.listObject;
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.app.cannotGetListApplication'),
                });
            }
        },
        handleGetFavorite(res) {
            this.listFavorite = [];
            let self = this;
            if (res.status == 200) {
                res.data.listObject.forEach(function (e) {
                    let arr = [
                        'document_definition',
                        'orgchart',
                        'workflow_definition',
                        'dashboard',
                    ];
                    arr.forEach(function (k) {
                        if (e.objectType == k) {
                            self.mapIdFavorite[k][
                                k + ':' + e.objectIdentifier
                            ] = e;
                        }
                    });
                });
                this.checkTypeFavorite(res.data.listObject);
                this.$store.commit(
                    'appConfig/updateListFavorite',
                    self.listFavorite,
                );
            }
            this.loadingFavorite = false;
        },
        getFavorite() {
            let userId = this.$store.state.app.endUserInfo.id;
            this.myApplicationWorker.postMessage({
                action: 'getFavorite',
                data: {
                    userId: userId,
                },
            });
        },
        clickDetails(item) {
            this.$refs.contextMenu.hide();
            this.$store.commit('appConfig/emptyItemSelected');
            this.title.iconName = item.iconName;
            this.title.iconType = item.iconType;
            this.title.name = item.name;
            this.$store.commit('appConfig/updateCurrentAppId', item.id);
            this.$store.commit('appConfig/updateCurrentAppName', item.name);
            this.myApplicationWorker.postMessage({
                action: 'getAppDetails',
                data: {
                    id: item.id,
                },
            });
            this.tab = 'tab-2';
        },
        checkTypeFavorite(data) {
            let self = this;
            for (let i in self.arrType) {
                self.arrType[i] = [];
            }
            data.forEach(function (e) {
                let arr = [
                    'document_definition',
                    'orgchart',
                    'dashboard',
                    'workflow_definition',
                ];
                arr.forEach(function (j) {
                    if (e.objectType == j) {
                        self.arrType[j].push(j + ':' + e.objectIdentifier);
                    }
                });
            });
            for (let i in self.arrType) {
                if (self.arrType[i].length > 0) {
                    let dataGet = self.arrType[i];
                    self.getFavoriteByAccessControl(dataGet, i);
                }
            }
        },
        clickBack() {
            this.tab = 'tab-1';
            this.$refs.contextMenu.hide();
            this.getActiveapps();
        },
        updateFavoriteItem(mapArray, array) {
            for (let [key, value] of Object.entries(mapArray)) {
                array.forEach(function (item) {
                    if (item.objectIdentifier == key) {
                        item.favorite = value.isFavorite;
                        item.actions = value.actions;
                    }
                });
            }
            return array;
        },
        updateActionItem(mapArray, array, type) {
            for (let [key, value] of Object.entries(mapArray)) {
                array.forEach(function (item) {
                    if (item.objectIdentifier == key) {
                        item.favorite = 1;
                        item.actions = value.actions;
                        item.type = type;
                        item.appName = value.appName;
                    }
                });
            }
            return array;
        },
        rightClickHandler(event, item, type) {
            event.stopPropagation();
            event.preventDefault();
            if (!item.actions.includes('unfavorite')) {
                item.actions.push('unfavorite');
            }
            item.actions = item.actions.filter((e) => {
                return e != 'submit_by_workflow';
            });
            this.$refs.contextMenu.setType(type);
            this.$refs.contextMenu.setContextItem([...new Set(item.actions)]);
            this.$refs.contextMenu.show(event);
            this.$refs.contextMenu.setItem(item);
        },
        checkChildrenApp(data) {
            let self = this;
            for (let i in self.arrType) {
                self.arrType[i] = [];
            }
            for (let i in data) {
                data[i].forEach(function (e) {
                    self.arrType[i].push(i + ':' + e.id);
                    self.mapId[i][i + ':' + e.id] = e;
                });
                let dataGet = self.arrType[i];
                self.getItemByAccessControl(dataGet, i);
            }
        },
        getItemByAccessControl(ids, type) {
            let self = this;
            this.myApplicationWorker.postMessage({
                action: 'getItemByType',
                data: {
                    ids: ids,
                    type: type,
                },
            });
        },
        getFavoriteByAccessControl(ids, type) {
            let self = this;
            appManagementApi
                .getListObjectIdentifier({
                    pageSize: 50,
                    ids: ids,
                })
                .then((res) => {
                    self.handlerGetObjectFavorite(type, res);
                })
                .catch((err) => {});
        },
        handlerGetObjectSuccess(type, res) {
            let self = this;
            this.updateFavoriteItem(self.mapId[type], res.data);
            if (type == 'document_definition') {
                let arrCategory = [];
                let arrMajor = [];
                res.data.forEach(function (e) {
                    if (e.objectType == '1') {
                        arrMajor.push(e);
                    } else if (e.objectType == '2') {
                        arrCategory.push(e);
                    }
                });
                this.$store.commit('appConfig/updateChildrenApps', {
                    obj: arrMajor,
                    type: 'document_major',
                });
                this.$store.commit('appConfig/updateChildrenApps', {
                    obj: arrCategory,
                    type: 'document_category',
                });
            } else {
                this.$store.commit('appConfig/updateChildrenApps', {
                    obj: res.data,
                    type: type,
                });
            }
        },
        handlerGetObjectFavorite(type, res) {
            let self = this;
            if (res.data.length > 0) {
                this.updateActionItem(self.mapIdFavorite[type], res.data, type);
                res.data.forEach(function (e) {
                    self.listFavorite.push(e);
                });
            }
        },
    },
};
</script>
<style scoped>
.v-menu__content {
    z-index: 1000;
}
.end-user-popup {
    font: 13px Roboto;
    overflow: hidden;
    width: 600px;
}
.end-user-popup >>> .tittle {
    font: 15px Roboto;
    padding-left: 8px;
    font-weight: 400;
}
.end-user-popup >>> .list-favorite {
    overflow-x: hidden;
}
.end-user-popup >>> .list-favorite ul {
    list-style: none;
}
.end-user-popup >>> .list-favorite .title-item-favorite {
    white-space: nowrap;
    width: 500px;
    overflow: hidden;
    text-overflow: ellipsis;
}
.end-user-popup >>> .list-favorite li {
    padding: 5px 10px;
}
.end-user-popup >>> .title-favorite,
.end-user-popup >>> .title-list-app {
    display: flex;
    margin: 8px 15px;
}
.end-user-popup >>> .title-list-app {
    padding-top: 8px;
}
.end-user-popup >>> .title-list-app .app-active-title {
    display: flex;
}
.end-user-popup >>> .title-favorite .v-icon {
    font-size: 15px;
    padding: 0px 8px;
}
.end-user-popup >>> .title-list-app .v-icon {
    font-size: 13px;
    padding: 0px 8px;
}
.end-user-popup >>> .title-favorite h4,
.end-user-popup >>> .title-list-app h4 {
    padding-left: 2px;
    font-weight: unset;
}
.end-user-popup >>> .list-app-cointaner {
    /* display: flex;
    flex-wrap: wrap; */
    width: 560px;
    margin-right: auto;
    margin-left: 30px;
}
.end-user-popup >>> .list-app-cointaner .ps__rail-x {
}
.end-user-popup >>> .list-app-cointaner .list-app-item:hover {
    background-color: #f7f7f7;
    cursor: pointer;
}
.end-user-popup >>> .list-app-cointaner .list-app-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px 8px;
    margin-bottom: 12px;
}
.end-user-popup >>> .list-app-cointaner .list-app-item .app-item-icon {
    width: 70px;
}
.end-user-popup >>> .list-app-cointaner .list-app-item .app-item-icon .v-icon {
    font-size: 45px;
}
.end-user-popup
    >>> .list-app-cointaner
    .list-app-item
    .app-item-icon
    .app-item-img {
    width: 40px;
    height: 40px;
    margin: 12px 8px 14px 16px;
}
.end-user-popup >>> .list-app-cointaner .list-app-item .v-icon {
    font-size: 45px;
    padding: 12px;
    opacity: 0.7;
}
.end-user-popup >>> .list-app-cointaner .list-app-item h5 {
    margin-top: -12px;
    font: 13px roboto;
    font-weight: 400;
    width: 70px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-align: center;
}
.end-user-popup >>> .list-app-cointaner .list-app-item {
    padding-top: 2px;
}
.end-user-popup >>> .tab-detail .v-card__title {
    font: 13px Roboto;
    padding: unset;
}
.end-user-popup >>> .tab-detail .v-card__title .v-icon {
    font-size: 13px;
}
.end-user-popup >>> .tab-detail .v-card__title .v-icon .tab-detail-icon-title {
    padding-top: 2px;
}
.end-user-popup >>> .tab-detail .v-card__title h4 {
    padding-left: 8px;
    /* font-size: 15px; */
    font: 15px roboto;
    font-weight: 400;
}
.end-user-popup >>> .tab-detail .v-input__control {
    text-shadow: unset;
    margin: 0px 6px;
}
.end-user-popup >>> .tab-detail .v-input__control .v-input__slot {
    background-color: #f7f7f7;
    min-height: unset;
    height: 30px;
    box-shadow: unset;
    margin: 8px;
    width: unset;
}
.end-user-popup >>> .tab-detail .v-input__control .v-input__slot .v-label {
    font: 12px Roboto !important;
    padding-top: 2px;
}
.end-user-popup >>> .tab-detail .v-input__control .v-icon {
    font-size: 13px;
}
.end-user-popup >>> .tab-detail .v-input__control .v-text-field__details {
    display: none;
}
</style>

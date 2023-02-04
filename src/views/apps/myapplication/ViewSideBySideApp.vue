<template>
    <div class="view-side-by-side-apps h-100">
        <VueResizable
            :active="isListAppCollapse ? [] : ['r']"
            height="100%"
            :minWidth="40"
            :maxWidth="400"
            @resize:end="handleListAppResizeEnd"
            :width="listAppWidth"
            style="
                border-right: 1px solid lightgray;
                transform: translateX(0px);
                transition: all ease-in-out 250ms;
            "
            v-if="listApps.length != 0"
        >
            <div class="list-apps h-100 mt-2">
                <div class="d-flex mr-2">
                    <h4
                        class="flex-grow-1 mt-1 text-ellipsis"
                        v-if="!isListAppCollapse"
                    >
                        {{ $t('objects.application_definition') }}
                    </h4>

                    <v-tooltip bottom v-if="!isListAppCollapse">
                        <template v-slot:activator="{ on }">
                            <v-btn v-on="on" icon tile small>
                                <v-icon
                                    @click="changeView"
                                    style="font-size: 13px"
                                    >mdi-page-previous-outline</v-icon
                                >
                            </v-btn>
                        </template>
                        <span>{{ $t('common.switch_view') }}</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn
                                v-on="on"
                                icon
                                small
                                tile
                                style="margin-left: 5px"
                            >
                                <v-icon
                                    @click="collapseListApp"
                                    style="font-size: 13px"
                                    >{{
                                        isListAppCollapse
                                            ? 'mdi-arrow-right'
                                            : 'mdi-arrow-left'
                                    }}</v-icon
                                >
                            </v-btn>
                        </template>
                        <span>{{
                            isListAppCollapse
                                ? $t('common.expand')
                                : $t('common.narrow')
                        }}</span>
                    </v-tooltip>
                </div>
                <div class="mt-4">
                    <div
                        :class="{
                            'favorite-area': true,
                            active: showFavorite == true
                        }"
                        @click="showListFavorite"
                    >
                        <v-icon style="font-size: 16px" color="#F6BE4F">
                            mdi-star</v-icon
                        >
                        <span class="fs-13 pl-2" v-if="!isListAppCollapse">{{
                            $t('common.favorite')
                        }}</span>
                    </div>
                    <div
                        :style="{
                            height: 'calc(100vh - 175px)',
                            overflow: 'auto'
                        }"
                    >
                        <v-tooltip
                            :key="i"
                            v-for="(item, i) in listApps"
                            bottom
                        >
                            <template v-slot:activator="{ on }">
                                <div
                                    v-on="on"
                                    class="flex-grow-1"
                                    :class="{
                                        'list-app-item': true,
                                        active: item.id == activeIndex
                                    }"
                                    @click="clickDetails(item)"
                                >
                                    <v-icon
                                        v-if="item.iconType == 'icon'"
                                        style="font-size: 16px"
                                        >{{ item.iconName }}
                                    </v-icon>
                                    <img
                                        v-else
                                        :src="item.iconName"
                                        class="app-item-img"
                                    />
                                    <div
                                        v-show="!isListAppCollapse"
                                        class="title-app-sbs"
                                    >
                                        {{ item.name }}
                                    </div>
                                </div>
                            </template>
                            <span
                                >{{ $t('common.detail_app') }}: <br />{{
                                    item.name
                                }}</span
                            >
                        </v-tooltip>
                    </div>
                    <v-tooltip bottom v-if="isListAppCollapse">
                        <template v-slot:activator="{ on }">
                            <v-btn
                                v-on="on"
                                icon
                                tile
                                small
                                style="margin-left: 5px"
                            >
                                <v-icon
                                    @click="changeView"
                                    style="font-size: 13px"
                                    >mdi-page-previous-outline</v-icon
                                >
                            </v-btn>
                        </template>
                        <span>{{ $t('common.switch_view') }}</span>
                    </v-tooltip>
                </div>
            </div>
        </VueResizable>

        <VueResizable
            :active="['r']"
            height="100%"
            :minWidth="200"
            :maxWidth="400"
            v-if="showDetailArea && listApps.length != 0"
            @resize:end="handleAppDetailResizeEnd"
            :width="appDetailWidth"
            style="border-right: 1px solid lightgray"
        >
            <div class="detail-app">
                <div v-if="showFavorite == false">
                    <div class="d-flex">
                        <h4 class="flex-grow-1">{{ $t('common.view_app') }}</h4>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-on="on"
                                    icon
                                    small
                                    tile
                                    class="mr-2 mt-2"
                                >
                                    <v-icon
                                        @click="collapseAppDetail"
                                        style="font-size: 13px"
                                        >{{ 'mdi-arrow-left' }}</v-icon
                                    >
                                </v-btn>
                            </template>
                            <span>{{ $t('common.narrow') }}</span>
                        </v-tooltip>
                    </div>
                    <v-text-field
                        :label="$t('apps.search')"
                        single-line
                        solo
                        append-icon="mdi-magnify"
                        v-model="searchKey"
                    ></v-text-field>
                    <AppDetail
                        ref="appDetail"
                        :isMyApplication="true"
                        :isEndUserCpn="true"
                        :instanceKey="instanceKey"
                        :searchKey="searchKey"
                        :sideBySide="true"
                        :loadingApp="loadingApp"
                    />
                </div>
                <div v-else class="favorite-area-item">
                    <h4>{{ $t('apps.listFavorite') }}</h4>
                    <div
                        :style="{
                            height: 'calc(100vh - 115px)',
                            overflow: 'auto'
                        }"
                    >
                        <ul
                            style="margin: 0px 0px 0px -24px"
                            v-if="sFavorite.length > 0"
                        >
                            <li
                                v-for="(item, i) in sFavorite"
                                :key="i"
                                v-on:click="
                                    rightClickHandler($event, item, item.type)
                                "
                                v-on:contextmenu="
                                    rightClickHandler($event, item, item.type)
                                "
                                style="cursor: pointer"
                                :class="{
                                    'favorite-app-item': true,
                                    'child-item-active':
                                        item.objectIdentifier ==
                                        activeIndexChild
                                }"
                            >
                                <div style="position: relative; display: flex">
                                    <v-icon
                                        style="
                                            font-size: 13px;
                                            margin-right: 8px;
                                        "
                                        >{{ listIcon[item.type] }}</v-icon
                                    >
                                    <div class="d-flex flex-column">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <div
                                                    v-on="on"
                                                    class="title-item-favorite"
                                                >
                                                    {{
                                                        item.type ==
                                                        'document_definition'
                                                            ? item.title
                                                            : item.name
                                                    }}
                                                </div>
                                            </template>
                                            <span>
                                                {{
                                                    item.type ==
                                                    'document_definition'
                                                        ? item.title
                                                        : item.name
                                                }}
                                            </span>
                                        </v-tooltip>
                                        <span
                                            style="
                                                font: 12px roboto;
                                                font-weight: 300;
                                            "
                                        >
                                            {{ item.appName }}</span
                                        >
                                    </div>
                                    <v-icon
                                        color="#F6BE4F"
                                        style="
                                            float: right;
                                            font-size: 13px;
                                            position: absolute;
                                            top: 10px;
                                            right: 4px;
                                        "
                                        >mdi-star</v-icon
                                    >
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <ContextMenu
                    ref="contextMenu"
                    :sideBySide="true"
                    :instanceKey="instanceKey"
                />
            </div>
        </VueResizable>
        <div
            class="action-area h-100"
            :style="{
                width: `calc(100% - ${appAreaWidth}px)`,
                position: 'relative'
            }"
            v-if="listApps.length != 0"
        >
            <SymperActionView
                :actionDef="actionViewConfig.actionDef"
                v-if="Object.keys(actionViewConfig).length > 0"
                :param="actionViewConfig.params"
            />
        </div>
        <NotFoundScreen
            :emptyDataKey="'application-list'"
            v-else-if="isLoadedListApps"
            class="w-100"
        />
    </div>
</template>

<script>
import { appManagementApi } from '@/api/AppManagement.js';
import { util } from '@/plugins/util.js';
import AppDetail from './AppDetail.vue';
import ContextMenu from './../ContextMenu.vue';
import SymperActionView from '@/action/SymperActionView.vue';
import MyApplicationWorker from 'worker-loader!@/worker/application/MyApplication.Worker.js';
import MenuConfigTypeView from './MenuConfigTypeView';
import VueResizable from 'vue-resizable';
import NotFoundScreen from '@/components/common/NotFoundScreen';
export default {
    created() {
        this.instanceKey = Date.now();
        this.myApplicationWorker = new MyApplicationWorker();
        let self = this;
        this.restoreUiConfig();
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
                case 'handleRestoreExtraConfig':
                    self.handleRestoreExtraConfig(data.data);
                    break;
                case 'getItemByType':
                    self.handlerGetObjectSuccess(
                        data.dataAfter.type,
                        data.dataAfter.res
                    );
                    break;

                default:
                    break;
            }
        });
        this.getFavorite();
        this.getActiveApp();
    },
    components: {
        AppDetail,
        ContextMenu,
        SymperActionView,
        MenuConfigTypeView,
        VueResizable,
        NotFoundScreen
    },
    computed: {
        appAreaWidth() {
            let width = this.listAppWidth;
            if (this.showDetailArea) {
                width = this.listAppWidth + this.appDetailWidth;
            }
            return width;
        },
        sFavorite() {
            return this.$store.state.appConfig.listFavorite;
        },
        actionDef() {
            return this.$store.state.appConfig.actionDef;
        },
        actionViewConfig() {
            let configs =
                this.$store.state.appConfig.actionViewConfig[this.instanceKey];
            return configs && Object.keys(configs).length > 0 ? configs : {};
        },
        listApp() {
            return this.$store.state.appConfig.listApps;
        },
        activeIndexChild() {
            return this.$store.state.appConfig.activeChildItem;
        }
    },
    watch: {
        appAreaWidth() {
            this.recacularedMyitem();
        }
    },
    methods: {
        getActiveApp() {
            this.myApplicationWorker.postMessage({
                action: 'getActiveApp'
            });
        },
        handleAppDetailResizeEnd(param) {
            this.appDetailWidth = param.width;
            this.saveExtraConfig();
            this.recacularedMyitem();
        },
        handleListAppResizeEnd(param) {
            this.listAppWidth = param.width;
            this.saveExtraConfig();
            this.recacularedMyitem();
        },
        recacularedMyitem() {
            let componentWidth =
                util.getComponentSize(this).w - this.appAreaWidth;
            this.$evtBus.$emit('caculated-myitem-width', {
                componentWidth: componentWidth
            });
        },

        collapseAppDetail() {
            this.showDetailArea = !this.showDetailArea;
            this.$evtBus.$emit('symper-collapse-left-sidebar', {
                type: 'list-app',
                collaped: this.showDetailArea
            });
        },
        saveExtraConfig() {
            let data = {
                widgetIdentifier: this.getWidgetIdentifier() + 'extra',
                detail: JSON.stringify({
                    listAppWidth: this.listAppWidth,
                    appDetailWidth: this.appDetailWidth,
                    isListAppCollapse: this.isListAppCollapse
                })
            };
            this.myApplicationWorker.postMessage({
                action: 'saveExtraConfig',
                data: data
            });
        },
        getWidgetIdentifier() {
            return 'my-application:extra-config';
        },
        restoreUiConfig() {
            let data = {
                widgetIdentifier: this.getWidgetIdentifier() + 'extra'
            };
            this.myApplicationWorker.postMessage({
                action: 'restoreExtraConfig',
                data: data
            });
        },
        handleRestoreExtraConfig(res) {
            if (this.firstRender && res.status == 200) {
                let obj = JSON.parse(res.data.detail);
                for (let i in obj) {
                    this[i] = obj[i];
                }
                this.firstRender = false;
            }
        },
        rightClickHandler(event, item, type) {
            event.stopPropagation();
            event.preventDefault();
            this.$store.commit(
                'appConfig/updateActiveChildItem',
                item.objectIdentifier
            );
            if (!item.actions.includes('unfavorite')) {
                item.actions.push('unfavorite');
            }
            item.actions = item.actions.filter((e) => {
                return e != 'submit_by_workflow';
            });
            this.$refs.contextMenu.setContextItem([...new Set(item.actions)]);
            this.$refs.contextMenu.show(event);
            this.$refs.contextMenu.setItem(item);
            this.$refs.contextMenu.setType(type);
        },
        showListFavorite() {
            this.showFavorite = true;
            this.activeIndex = '000';
            this.showDetailArea = true;
        },
        handleGetActiveApp(res) {
            if (res.status == 200) {
                this.listApps = res.data.listObject;
                this.isLoadedListApps = true;
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.app.cannotGetListApplication')
                });
            }
        },
        handleGetFavorite(res) {
            let self = this;
            if (res.status == 200) {
                res.data.listObject.forEach(function (e) {
                    let arr = [
                        'document_definition',
                        'orgchart',
                        'workflow_definition',
                        'dashboard'
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
                    self.listFavorite
                );
            }
        },
        getFavorite() {
            this.listFavorite = [];
            let userId = this.$store.state.app.endUserInfo.id;
            this.myApplicationWorker.postMessage({
                action: 'getFavorite',
                data: {
                    userId: userId
                }
            });
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
                    'workflow_definition'
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
        getFavoriteByAccessControl(ids, type) {
            let self = this;
            appManagementApi
                .getListObjectIdentifier({
                    pageSize: 50,
                    ids: ids
                })
                .then((res) => {
                    self.handlerGetObjectFavorite(type, res);
                })
                .catch((err) => {});
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
                        item.appName = value.appName;
                        item.type = type;
                    }
                });
            }
            return array;
        },
        collapseListApp() {
            this.isListAppCollapse = !this.isListAppCollapse;
            this.listAppWidth = this.isListAppCollapse ? 40 : 220;
            this.saveExtraConfig();
            this.$evtBus.$emit('symper-collapse-left-sidebar', {
                type: 'list-app',
                collaped: this.isListAppCollapse
            });
        },
        changeView() {
            this.$store.commit('appConfig/changeTypeView');
        },
        hideContextMenu() {
            if (this.$refs.appDetail) {
                this.$refs.appDetail.hideContextMenu();
            }
            if (this.$refs.contextMenu) {
                this.$refs.contextMenu.hide();
            }
        },
        clickDetails(item) {
            this.activeIndex = item.id;
            this.loadingApp = true;
            this.showFavorite = false;
            this.$store.commit('appConfig/updateCurrentAppId', item.id);
            this.$store.commit('appConfig/updateCurrentAppName', item.name);
            this.showDetailArea = true;
            this.$store.commit('appConfig/emptyItemSelected');
            let appStore = this.$store.state.appConfig;
            if (!appStore.listAppsSideBySide[appStore.currentAppId]) {
                this.myApplicationWorker.postMessage({
                    action: 'getAppDetails',
                    data: {
                        id: item.id
                    }
                });
            } else {
                this.loadingApp = false;
            }
            let self = this;
            setTimeout(() => {
                self.$evtBus.$emit('symper-collapse-left-sidebar', {
                    type: 'detail-app',
                    collaped: !this.showDetailArea
                });
            }, 50);
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
            this.myApplicationWorker.postMessage({
                action: 'getItemByType',
                data: {
                    ids: ids,
                    type: type
                }
            });
        },
        handlerGetAppDetals(res) {
            if (res.status == 200) {
                if (Object.keys(res.data.listObject.childrenApp).length > 0) {
                    this.checkChildrenApp(res.data.listObject.childrenApp);
                } else {
                    this.$store.commit('appConfig/emptyItemSelected');
                }
            }
            this.loadingApp = false;
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
                this.$store.commit('appConfig/updateChildrenAppsSBS', {
                    obj: arrMajor,
                    type: 'document_major'
                });
                this.$store.commit('appConfig/updateChildrenAppsSBS', {
                    obj: arrCategory,
                    type: 'document_category'
                });
            } else {
                this.$store.commit('appConfig/updateChildrenAppsSBS', {
                    obj: res.data,
                    type: type
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
        }
    },
    data() {
        return {
            listApps: [],
            activeIndex: '',
            loadingApp: true,
            instanceKey: 0,
            myApplicationWorker: null,
            searchKey: '',
            listFavorite: [],
            showFavorite: false,
            activeFavorite: false,
            oldListAppWidth: 0,
            listAppWidth: 220,
            appDetailWidth: 300,
            isListAppCollapse: false,
            firstRender: true,
            showDetailArea: false,
            listIcon: {
                document_definition: 'mdi-file-document-outline',
                workflow_definition: 'mdi-lan',
                orgchart: 'mdi-widgets-outline',
                dashboard: 'mdi-view-dashboard'
            },
            arrType: {
                document_definition: [],
                orgchart: [],
                dashboard: [],
                workflow_definition: []
            },
            mapId: {
                orgchart: {},
                document_definition: {},
                dashboard: {},
                workflow_definition: {}
            },
            mapIdFavorite: {
                orgchart: {},
                document_definition: {},
                dashboard: {},
                workflow_definition: {}
            },
            isLoadedListApps: false
        };
    }
};
</script>

<style scoped>
.view-side-by-side-apps {
    display: flex;
}

.view-side-by-side-apps .favorite-area {
    cursor: pointer;
    display: flex;
    align-items: center;
    height: 40px;
    padding-left: 10px;
}
.view-side-by-side-apps .favorite-area .active {
    background-color: active;
}

.view-side-by-side-apps .list-apps {
    position: relative;
}
.view-side-by-side-apps >>> .list-apps .v-icon {
    background-color: unset !important;
}
.view-side-by-side-apps .list-apps .title-app-sbs {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font: 13px roboto;
    padding-left: 8px;
    cursor: pointer;
}

.view-side-by-side-apps .list-apps h4 {
    flex-grow: 1;
    padding-left: 8px;
    font: 15px roboto;
}
.view-side-by-side-apps .list-apps .active {
    background-color: #e9e9e9;
}
.view-side-by-side-apps .detail-app h4 {
    padding-left: 8px;
    margin: 12px 0px;
    font: 15px roboto;
}
.view-side-by-side-apps .list-apps .list-app-item {
    cursor: pointer;
    display: flex;
    width: inherit;
    padding: 12px 0px 12px 10px;
}
.view-side-by-side-apps .list-apps .list-app-item:hover {
    background-color: #f6f6f6;
}
.view-side-by-side-apps .list-apps .list-app-item h5 {
    font: 13px roboto;
    padding-left: 8px;
}
.view-side-by-side-apps .list-apps .list-app-item .app-item-img {
    width: 16px;
    height: 16px;
}

.view-side-by-side-apps .detail-app h4 {
    font: 15px roboto;
}

.view-side-by-side-apps >>> .detail-app .v-input__control {
    min-height: unset;
}
.view-side-by-side-apps >>> .detail-app .v-input__control .v-input__slot {
    box-shadow: unset;
    background-color: #f7f7f7;
    margin: 0px 8px;
    width: 95%;
}
.view-side-by-side-apps >>> .detail-app .v-input__control .v-input__slot label {
    font: 13px roboto;
}
.view-side-by-side-apps
    >>> .detail-app
    .v-input__control
    .v-input__slot
    .v-icon {
    font-size: 13px;
}
.view-side-by-side-apps
    >>> .detail-app
    .v-input__control
    .v-input__slot
    #input-147 {
    font: 13px roboto;
}
.view-side-by-side-apps
    >>> .detail-app
    .v-input__control
    .v-text-field__details {
    display: none;
}
.view-side-by-side-apps >>> .detail-app .ps__rail-x {
    display: none;
}
.view-side-by-side-apps >>> .favorite-area-item li {
    list-style: none;
    padding: 6px 20px;
}
.view-side-by-side-apps >>> .favorite-area-item {
    overflow-x: hidden;
}
.view-side-by-side-apps >>> .favorite-area-item .child-item-active {
    background-color: #e9e9e9;
}

.view-side-by-side-apps >>> .favorite-area-item .title-item-favorite {
    white-space: nowrap;
    font: 13px roboto;
    width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 4px 0px;
}
.favorite-app-item:hover {
    background-color: #f5f5f5;
}
</style>

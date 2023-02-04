<template>
    <div class="view-side-by-side-apps h-100">
        <Preloader v-show="!hideLoading"></Preloader>
        <VueResizable
            :active="isListAppCollapse ? [] : ['r']"
            height="100%"
            :minWidth="40"
            :maxWidth="400"
            @resize:end="handleListAppResizeEnd"
            :width="listAppWidth"
            :style="{
                'border-right': ' 1px solid lightgray',
                transform: isTransform ? 'translateX(0px)' : '',
                transition: isTransform ? 'all ease-in-out 250ms' : ''
            }"
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
                    <!--  -->
                    <div class="flex-grow-1">
                        <h4 class="inline-block">
                            {{ $t('apps.listFavorite') }}
                        </h4>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-on="on"
                                    icon
                                    small
                                    tile
                                    class="mr-2 mt-2 favorite-narrow"
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

                    <!--  -->
                    <div
                        :style="{
                            height: 'calc(100vh - 115px)',
                            overflow: 'auto'
                        }"
                    >
                        <Preloader hidden v-if="loadingFavorite" />
                        <NotFoundScreen
                            :emptyDataKey="'popup-favorite-application-list'"
                            v-else-if="sFavorite.length == 0"
                            class="w-100"
                        />

                        <ul v-if="sFavorite.length > 0" class="ma-0 pl-0">
                            <li
                                v-for="(item, i) in sFavorite"
                                :key="i"
                                style="cursor: pointer"
                                :class="{
                                    'favorite-app-item px-2': true,
                                    'child-item-active':
                                        item.objectIdentifier ==
                                        activeIndexChild
                                }"
                            >
                                <div
                                    style="position: relative; display: flex"
                                    class="w-100"
                                >
                                    <v-icon
                                        style="
                                            font-size: 13px;
                                            margin-right: 8px;
                                        "
                                        >{{ listIcon[item.type] }}</v-icon
                                    >
                                    <div
                                        class="d-flex flex-column xxxxx"
                                        style="width: calc(100% - 14px)"
                                        v-on:click="
                                            clickHandler(item.type, item)
                                        "
                                        @contextmenu="
                                            rightClickHandler(
                                                $event,
                                                item,
                                                item.type
                                            )
                                        "
                                    >
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <div
                                                    :style="{
                                                        width: 'calc( 100% - 20px)'
                                                    }"
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
                                    <v-btn
                                        style="
                                            position: absolute;
                                            right: -4px;
                                            top: 6px;
                                        "
                                        small
                                        icon
                                        class="icon-dots-horizontal"
                                        v-on:click="
                                            rightClickHandler(
                                                $event,
                                                item,
                                                item.type
                                            )
                                        "
                                    >
                                        <i
                                            class="
                                                mdi-dots-horizontal mdi
                                                fs-16
                                            "
                                        ></i>
                                    </v-btn>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <ContextMenu
                    @un-favorite-item="unFavoriteItem"
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
                @view-rendered="hideLoadingChild"
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
import MyApplicationWorker from 'worker-loader!@/worker/application/MyApplicationForNewTest.Worker.js';
import MenuConfigTypeView from './MenuConfigTypeView';
import VueResizable from 'vue-resizable';
import NotFoundScreen from '@/components/common/NotFoundScreen';
import Preloader from '@/components/common/Preloader';
export default {
    created() {
        this.instanceKey = Date.now();
        this.myApplicationWorker = new MyApplicationWorker();
        let self = this;
        this.restoreUiConfig();
    },
    async mounted() {
        if (this.isBa()) {
            await this.getAllTypeAction();
        }
        this.$emit('mounted-side-by-side');
    },
    components: {
        AppDetail,
        ContextMenu,
        SymperActionView,
        MenuConfigTypeView,
        VueResizable,
        NotFoundScreen,
        Preloader
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

        activeIndexChild() {
            return this.$store.state.appConfig.activeChildItem;
        }
    },
    watch: {
        appAreaWidth() {
            this.recacularedMyitem();
        },
        hideLoadingActionView(newVl) {
            if (
                Object.keys(this.$route.query).length == 4 &&
                this.renderTime == 0
            ) {
                this.hideLoading = newVl;
                this.renderTime++;
            }
        },
        loadingApp(newVl) {
            this.hideLoadingDetailApps(!newVl);
        },
        showFavorite(newVl) {
            this.hideLoadingDetailApps(newVl);
        },
        'route.path'() {
            this.renderTime = 0;
        }
    },
    methods: {
        async getAppFromUrl() {
            if (Object.keys(this.$route.query).length > 0) {
                this.hideLoading = false;
                let id = this.$route.query.appId;
                if (id == 'favoriteApp') {
                    await this.showListFavorite(false);
                    if (Object.keys(this.$route.query).length == 4) {
                        let action = this.$route.query.action;
                        let type = this.$route.query.childType;
                        let idChild = this.$route.query.childId;
                        let data = this.sFavorite;
                        let item = {};
                        for (let key in data) {
                            let id = data[key].objectIdentifier.split(':')[1];
                            if (id == idChild) {
                                item = data[key];
                                break;
                            }
                        }
                        this.rightClickHandler(null, item, type, false);
                        this.$refs.contextMenu.clickAction(
                            action,
                            true,
                            false,
                            false
                        );
                    }
                } else {
                    for (let app of this.listApps) {
                        if (app.id == id) {
                            await this.clickDetails(app, false);
                            break;
                        }
                    }
                }
            } else this.hideLoading = true;
        },
        hideLoadingChild() {
            this.hideLoadingActionView = true;
        },
        hideLoadingDetailApps(newVl) {
            if (
                Object.keys(this.$route.query).length < 4 &&
                Object.keys(this.$route.query).length > 0 &&
                this.renderTime == 0
            ) {
                this.hideLoading = newVl;
                this.renderTime++;
            }
        },
        unFavoriteItem(itemInfo) {
            let dulicateValue = this.listApps.filter((app) => {
                return app.name == itemInfo.appName;
            });
            if (
                this.$store.state.appConfig.listAppsSideBySide[
                    dulicateValue[0].id
                ]
            ) {
                if (itemInfo.objectType == 1) {
                    itemInfo.type = 'document_major';
                } else if (itemInfo.objectType == 2) {
                    itemInfo.type = 'document_category';
                }

                this.$store.state.appConfig.listAppsSideBySide[
                    dulicateValue[0].id
                ][itemInfo.type]['item'].forEach((e) => {
                    if (
                        e.objectIdentifier.replace(/[^0-9]/g, '') == itemInfo.id
                    ) {
                        e.favorite = false;
                    }
                });
            } else {
                this.listApps.forEach(function (e) {
                    if (e.name == itemInfo.appName) {
                        e.objects.forEach((item) => {
                            if (item.objectId == itemInfo.id) {
                                item.isFavorite = false;
                            }
                        });
                    }
                });
            }
        },
        handleGetAllTypeAction(res) {
            if (res.status == 200) {
                this.allTypeAction = res.data;
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.app.cannotGetActionList')
                });
            }
        },
        async getAllTypeAction() {
            let getAllTypeAction = await runBySymperPromiseWorker(
                this.myApplicationWorker,
                'getAllTypeAction'
            );
            if (getAllTypeAction.status == 200) {
                this.handleGetAllTypeAction(getAllTypeAction);
            }
            // getAllTypeAction.then((res) => this.handleGetAllTypeAction(res));
        },
        isBa() {
            let userInfo = util.auth.getSavedUserInfo();
            let userType = userInfo.profile.type;
            return userType == 'ba';
        },
        handleGetApps(res) {
            if (res.status == 200) {
                this.listApps = res.data;
                this.isLoadedListApps = true;
            } else if (
                res.message == this.$t('v2.app.accountNotHavePermisson')
            ) {
                this.listApps = [];
                this.isLoadedListApps = true;
                this.$snotify({
                    type: 'error',
                    title: res.message
                });
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.app.cannotGetListApplication')
                });
                this.listApps = [];
                this.isLoadedListApps = true;
            }
        },

        filterDataToRightFormat(obj) {
            let self = this;
            let arr = [
                'document_definition',
                'orgchart',
                'dashboard',
                'workflow_definition'
            ];
            let ChildrenApp = {};
            let userOperations = self.$store.state.app.userOperations;
            if (this.isBa()) {
                arr.forEach(function (e) {
                    let val = obj.filter((item) => {
                        return item.objectType == e;
                    });
                    ChildrenApp[e] = val;
                });
            } else {
                arr.forEach(function (e) {
                    if (userOperations[e]) {
                        let Key = Object.keys(userOperations[e]);
                        let val = obj.filter((item) => {
                            return (
                                item.objectType == e &&
                                Key.includes(item.objectId)
                            );
                        });
                        ChildrenApp[e] = val;
                    }
                });
            }
            return ChildrenApp;
        },

        async handlerClickDetails(id) {
            let duplicateValue = this.listApps.filter((e) => {
                return id == e.id;
            });
            if (duplicateValue.length > 0) {
                if (duplicateValue[0].objects == undefined) {
                    duplicateValue[0].objects = [];
                }
                if (duplicateValue[0].objects.length > 0) {
                    let ChildrenApp = this.filterDataToRightFormat(
                        duplicateValue[0].objects
                    );
                    await this.checkChildrenApp(ChildrenApp);
                }

                // else {
                //     let ChildrenApp = {
                //         dashboard: [],
                //         document_definition: [],
                //         orgchart: [],
                //         workflow_definition: [],
                //     };
                //     this.checkChildrenApp(ChildrenApp);
                // }
            } else {
                this.$store.commit('appConfig/emptyItemSelected');
                this.loadingApp = false;
            }
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
            if (Number(param.width) < 90) {
                let self = this;
                self.collapseListApp();
            }
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
            runBySymperPromiseWorker(
                this.myApplicationWorker,
                'saveExtraConfig',
                data
            );
        },
        getWidgetIdentifier() {
            return 'my-application:extra-config';
        },
        restoreUiConfig() {
            let self = this;
            let data = {
                widgetIdentifier: this.getWidgetIdentifier() + 'extra'
            };
            let restoreExtraConfig = runBySymperPromiseWorker(
                this.myApplicationWorker,
                'restoreExtraConfig',
                data
            );
            restoreExtraConfig.then((res) => {
                self.handleRestoreExtraConfig(res);
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
        changeUrlAppChild(item, type, action) {
            let hash = '/' + document.location.hash.split('&')[0];
            let id = item.objectIdentifier.split(':')[1];
            let query = {};
            query.childType = type;
            query.childId = id;
            if (action == 'click') {
                let define = {
                    document_major: 'list_instance',
                    document_category: 'list_instance',
                    document_definition: 'list_instance',
                    orgchart: 'detail',
                    dashboard: 'view',
                    workflow_definition: 'list_instance'
                };
                query.action = define[type];
                history.pushState(
                    query,
                    '',
                    hash +
                        `&childType=${type}&childId=${id}&action=${define[type]}`
                );
            } else
                history.pushState(
                    query,
                    '',
                    hash + `&childType=${type}&childId=${id}`
                );
        },
        clickHandler(type, item, changeUrl = true) {
            if (changeUrl) {
                this.changeUrlAppChild(item, type, 'click');
            }
            this.$store.commit(
                'appConfig/updateActiveChildItem',
                item.objectIdentifier
            );
            let define;
            if (type.includes('document')) {
                this.$store.commit('document/setCurrentTitle', item.title);
                define = {
                    module: 'document',
                    resource: 'document_definition',
                    scope: 'document',
                    action: 'list_instance'
                };
            }
            if (type == 'orgchart') {
                define = {
                    module: 'orgchart',
                    resource: 'orgchart',
                    scope: 'orgchart',
                    action: 'detail'
                };
            }
            if (type == 'dashboard') {
                define = {
                    module: 'dashboard',
                    resource: 'dashboard',
                    scope: 'dashboard',
                    action: 'view'
                };
            }
            if (type == 'workflow_definition') {
                define = {
                    module: 'workflow',
                    resource: 'workflow_definition',
                    scope: 'workflow',
                    action: 'list_instance'
                };
            }
            let id = item.objectIdentifier.split(':')[1];
            this.$store.commit('appConfig/updateActionViewConfig', {
                instanceKey: this.instanceKey,
                actionViewConfig: {
                    actionDef: define,
                    params: { id: id, name: item.name }
                }
            });
        },
        rightClickHandler(event, item, type, changeUrl = true) {
            if (changeUrl) {
                this.changeUrlAppChild(item, type, 'right-click');
            }
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }

            if (!item.actions.includes('unfavorite')) {
                item.actions.push('unfavorite');
            }
            item.actions = item.actions.filter((e) => {
                return e != 'submit_by_workflow';
            });
            this.$refs.contextMenu.setContextItem([...new Set(item.actions)]);
            if (event) {
                this.$refs.contextMenu.show(event);
            }
            this.$refs.contextMenu.setItem(item);
            this.$refs.contextMenu.setType(type);
        },
        async showListFavorite(changeUrl = true) {
            if (changeUrl) {
                this.changeUrlApp({ id: 'favoriteApp' });
            }
            await this.getFavorite();
            this.showFavorite = true;
            this.activeIndex = '000';
            this.showDetailArea = true;
        },

        async handleGetFavorite(res) {
            let self = this;
            if (res.status == 200) {
                if (res.data.listObject.length !== 0) {
                    res.data.listObject.forEach(function (e) {
                        let arr = [
                            'document_definition',
                            'orgchart',
                            'dashboard',
                            'workflow_definition'
                        ];
                        arr.forEach(function (k) {
                            if (e.objectType == k) {
                                self.mapIdFavorite[k][
                                    k + ':' + e.objectIdentifier
                                ] = e;
                            }
                        });
                    });
                    await this.checkTypeFavorite(res.data.listObject);
                    this.$store.commit(
                        'appConfig/updateListFavorite',
                        self.listFavorite
                    );
                } else {
                    self.loadingFavorite = false;
                }
            }
        },
        async getFavorite() {
            this.loadingFavorite = true;
            this.listFavorite = [];
            let userId = this.$store.state.app.endUserInfo.id;
            let self = this;
            let operations = {};
            if (this.isBa()) {
                operations['GET_ALL'] = true;
            } else {
                operations = this.$store.state.app.userOperations;
            }
            let data = {
                userId: userId,
                operations: operations
            };
            let getFavorite = await runBySymperPromiseWorker(
                this.myApplicationWorker,
                'getFavorite',
                data
            );
            if (getFavorite.status == 200)
                await self.handleGetFavorite(getFavorite);
        },
        async checkTypeFavorite(data) {
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
                    await self.getFavoriteByAccessControl(dataGet, i);
                }
            }
        },
        async getFavoriteByAccessControl(ids, type) {
            let self = this;
            try {
                let res = await appManagementApi.getListObjectIdentifier({
                    pageSize: 50,
                    ids: ids
                });
                self.handlerGetObjectFavorite(type, res);
            } catch (error) {
                return {};
            }
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
            this.isTransform = true;
            this.isListAppCollapse = !this.isListAppCollapse;

            this.listAppWidth = this.isListAppCollapse ? 40 : 220;
            this.saveExtraConfig();
            this.$evtBus.$emit('symper-collapse-left-sidebar', {
                type: 'list-app',
                collaped: this.isListAppCollapse
            });
            setTimeout(() => {
                this.isTransform = false;
            }, 250);
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
        changeUrlApp(item) {
            history.pushState(
                { appId: item.id },
                '',
                `/#/my-applications?appId=${item.id}`
            );
        },
        async clickDetails(item, changeUrl = true) {
            if (changeUrl) this.changeUrlApp(item);
            this.activeIndex = item.id;
            this.loadingApp = true;
            this.showFavorite = false;
            this.$store.commit('appConfig/updateCurrentAppId', item.id);
            this.$store.commit('appConfig/updateCurrentAppName', item.name);
            this.$store.commit('appConfig/emptyItemSelected');
            let appStore = this.$store.state.appConfig;
            if (!appStore.listAppsSideBySide[appStore.currentAppId]) {
                await this.handlerClickDetails(item.id);
            } else {
                this.loadingApp = false;
            }
            this.showDetailArea = true;
            let self = this;
            setTimeout(() => {
                self.$evtBus.$emit('symper-collapse-left-sidebar', {
                    type: 'detail-app',
                    collaped: !this.showDetailArea
                });
            }, 50);
        },
        async checkChildrenApp(data) {
            let self = this;
            for (let i in self.arrType) {
                self.arrType[i] = [];
            }
            if (self.isBa()) {
                let typeArr = [];
                for (let i in data) {
                    data[i].forEach(function (e) {
                        let obj = {};
                        let action = self.allTypeAction[e.objectType]['action'];
                        action = action.filter((e) => {
                            return e != 'submit_by_workflow';
                        });
                        obj.id = e.objectId;
                        obj.isFavorite = e.isFavorite;
                        obj.actions = action;

                        self.arrType[i].push(i + ':' + e.objectId);
                        self.mapId[i][i + ':' + e.objectId] = obj;
                    });
                    typeArr.push(i);
                }
                let valuesType = Object.values(self.arrType);
                let arr = [];
                valuesType.forEach((e) => {
                    arr.push(...e);
                });
                if (arr.length > 0) {
                    await self.getItemsByAccessControl(arr, typeArr);
                } else {
                    this.loadingApp = false;
                }
            } else {
                let typeArr = [];
                let docNotShowAction = [
                    'submit_by_workflow',
                    'restore',
                    'detail',
                    'view',
                    'drop',
                    'update_by_workflow'
                ];
                for (let i in data) {
                    data[i].forEach(function (e) {
                        let obj = {};
                        let action = Object.keys(
                            self.$store.state.app.userOperations[i][e.objectId]
                        );

                        if (e.objectType == 'document_definition') {
                            action = action.concat(
                                self.getActionForDocInstance(e.objectId)
                            );
                            action = action.filter((ac) => {
                                return !docNotShowAction.includes(ac);
                            });
                        }
                        obj.id = e.objectId;
                        obj.isFavorite = e.isFavorite;
                        obj.actions = action;
                        self.arrType[i].push(i + ':' + e.objectId);
                        self.mapId[i][i + ':' + e.objectId] = obj;
                    });
                    typeArr.push(i);
                }
                let valuesType = Object.values(self.arrType);
                let arr = [];
                valuesType.forEach((e) => {
                    arr.push(...e);
                });

                if (arr.length > 0) {
                    await self.getItemsByAccessControl(arr, typeArr);
                } else {
                    this.loadingApp = false;
                }
            }
        },
        getActionForDocInstance(docId) {
            let userOperations = this.$store.state.app.userOperations;
            if (
                userOperations.document_instance &&
                userOperations.document_instance[docId + ':0']
            ) {
                return Object.keys(
                    userOperations.document_instance[docId + ':0']
                );
            } else {
                return [];
            }
        },
        async getItemsByAccessControl(ids, typeArr) {
            let self = this;
            let data = {
                ids: ids,
                type: typeArr
            };
            let getItemByType = await runBySymperPromiseWorker(
                this.myApplicationWorker,
                'getItemByType',
                data
            );
            self.handlerGetObjectSuccess(getItemByType.type, getItemByType.res);
        },

        handlerGetObjectSuccess(types, res) {
            let self = this;
            types.forEach((type) => {
                let duplicateValue = res.data.filter((e) => {
                    return e.objectIdentifier.includes(type);
                });
                this.updateFavoriteItem(self.mapId[type], duplicateValue);
                if (type == 'document_definition') {
                    let arrCategory = [];
                    let arrMajor = [];
                    duplicateValue.forEach(function (e) {
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
                        obj: duplicateValue,
                        type: type
                    });
                }
            });
            this.loadingApp = false;
        },
        handlerGetObjectFavorite(type, res) {
            let self = this;
            if (res.data.length > 0) {
                this.updateActionItem(self.mapIdFavorite[type], res.data, type);
                res.data.forEach(function (e) {
                    self.listFavorite.push(e);
                });
            }
            self.loadingFavorite = false;
        }
    },
    data() {
        return {
            hideLoading: false,
            hideLoadingActionView: false,
            renderTime: 0,
            allTypeAction: {},
            listApps: [],
            activeIndex: '',
            loadingApp: true,
            loadingFavorite: true,
            instanceKey: 0,
            myApplicationWorker: null,
            searchKey: '',
            listFavorite: [],
            showFavorite: false,
            listAppWidth: 220,
            appDetailWidth: 300,
            isTransform: false,
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
    padding: 8px 0px 8px 6px;
    margin-left: 4px;
    margin-right: 4px;
    border-radius: 4px;
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
.favorite-app-item .icon-dots-horizontal {
    display: none;
}
.favorite-app-item:hover .icon-dots-horizontal {
    display: inline-block;
}

.favorite-app-item:hover .title-item-favorite {
    width: calc(100% - 30px) !important;
}

.favorite-app-item:hover {
    background-color: #f5f5f5;
}
.v-btn.v-btn--flat.v-btn--icon.v-btn--round.theme--light.v-size--default,
.v-btn.v-btn--contained.theme--light.v-size--default {
    position: absolute;
    right: -16px;
    margin: 0px -4px 8px 0;
    min-width: 24px;
    padding: 0 0;
    min-height: 24px;
}
.mr-2.mt-2.v-btn.v-btn--flat.v-btn--icon.v-btn--round.v-btn--tile.theme--light.v-size--small.favorite-narrow {
    position: absolute;
    right: 0;
}
.inline-block {
    display: inline-block;
}
</style>

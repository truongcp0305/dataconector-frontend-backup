<template>
    <div class="view-details-all-app h-100" style="display: flex">
        <div class="header-view-details-all-app">
            <h4 style="flex-grow: 1; font: 15px roboto">
                {{ $t('apps.titleMyApplication') }}
            </h4>
            <div style="width: 400px; display: flex">
                <v-text-field
                    :label="$t('apps.search')"
                    single-line
                    solo
                    append-icon="mdi-magnify"
                    v-model="searchItemKey"
                ></v-text-field>
                <div class="button-header">
                    <v-btn
                        icon
                        tile
                        style="width: 32px; height: 32px; margin: 0px 4px"
                    >
                        <v-icon @click="collapse">mdi-arrow-collapse-up</v-icon>
                    </v-btn>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn
                                v-on="on"
                                icon
                                tile
                                style="
                                    width: 32px;
                                    height: 32px;
                                    margin: 0px 4px;
                                "
                            >
                                <v-icon @click="changeView"
                                    >mdi-page-previous-outline</v-icon
                                >
                            </v-btn>
                        </template>
                        <span>{{ $t('common.switch_view') }}</span>
                    </v-tooltip>
                    <MenuConfigTypeView
                        :currentTypeView="currentType"
                        :titleTypeView="'hellooo'"
                    />
                </div>
            </div>
        </div>
        <VuePerfectScrollbar :style="{ height: menuItemsHeight }">
            <div class="content-view-details-all-app h-100 w-100">
                <Preloader hidden v-if="loadingApp" />

                <template v-else>
                    <v-expansion-panels
                        v-model="panel"
                        multiple
                        style="display: flex"
                    >
                        <div
                            class="d-inline-block"
                            style="width: 50%"
                            v-for="(apps, idx) in listApp"
                            :key="idx"
                        >
                            <div
                                class="w-100"
                                v-for="(item, i) in listApp[idx]"
                                :key="i"
                            >
                                <v-expansion-panel>
                                    <v-expansion-panel-header>
                                        <div class="app-title">
                                            <v-icon
                                                v-if="item.iconType == 'icon'"
                                                style="
                                                    font-size: 16px;
                                                    flex: unset;
                                                    margin-left: 0px;
                                                    margin-right: 0px;
                                                    padding-top: 2px;
                                                "
                                                >{{ item.iconName }}</v-icon
                                            >
                                            <img
                                                v-else-if="
                                                    item.iconType == 'img'
                                                "
                                                :src="item.iconName"
                                                class="app-item-img"
                                            />
                                            <span style="padding-left: 8px">
                                                {{ item.name }}
                                            </span>
                                        </div>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <!-- chi tiet tung app  -->
                                        <v-row no-gutters>
                                            <template
                                                v-for="(
                                                    childItem, n
                                                ) in item.childrenAppReduce"
                                            >
                                                <v-col cols="6" :key="n">
                                                    <div
                                                        style="
                                                            margin-left: 9px;
                                                            margin-top: 6px;
                                                        "
                                                    >
                                                        <div
                                                            style="
                                                                margin-bottom: 6px;
                                                            "
                                                        >
                                                            <v-icon
                                                                style="
                                                                    margin-top: -2px;
                                                                "
                                                                >{{
                                                                    childItem.icon
                                                                }}</v-icon
                                                            >
                                                            <span
                                                                style="
                                                                    font-weight: 300;
                                                                    font: 13px;
                                                                    margin-top: 1px;
                                                                "
                                                            >
                                                                {{
                                                                    childItem.title
                                                                        ? childItem.title
                                                                        : childItem.name
                                                                }}
                                                            </span>
                                                            <span
                                                                style="
                                                                    font-weight: 300;
                                                                    font: 13px;
                                                                    padding-left: 2px;
                                                                    margin-top: 1px;
                                                                "
                                                            >
                                                                {{
                                                                    '(' +
                                                                    reduce(
                                                                        childItem.item
                                                                    ) +
                                                                    ')'
                                                                }}</span
                                                            >
                                                        </div>
                                                        <div>
                                                            <ul
                                                                v-for="(
                                                                    subChildItem,
                                                                    k
                                                                ) in childItem.item"
                                                                :key="k"
                                                                class="
                                                                    app-child-item
                                                                "
                                                            >
                                                                <li
                                                                    @contextmenu="
                                                                        rightClickHandler(
                                                                            $event,
                                                                            subChildItem,
                                                                            childItem.name,
                                                                            item
                                                                        )
                                                                    "
                                                                    v-if="
                                                                        subChildItem.show ==
                                                                        true
                                                                    "
                                                                >
                                                                    <div
                                                                        style="
                                                                            position: relative;
                                                                        "
                                                                    >
                                                                        <v-icon
                                                                            @click.stop="
                                                                                changeFavorite(
                                                                                    subChildItem,
                                                                                    childItem.name,
                                                                                    item,
                                                                                    subChildItem.favorite
                                                                                )
                                                                            "
                                                                            :class="{
                                                                                'icon-star-active':
                                                                                    subChildItem.favorite,
                                                                                'icon-star': true
                                                                            }"
                                                                        >
                                                                            mdi-star
                                                                        </v-icon>
                                                                        <v-tooltip
                                                                            bottom
                                                                            v-if="
                                                                                childItem.name ==
                                                                                'document_definition'
                                                                            "
                                                                            v-on:click="
                                                                                clickHandler(
                                                                                    subChildItem.type,
                                                                                    subChildItem,
                                                                                    item
                                                                                )
                                                                            "
                                                                        >
                                                                            <template
                                                                                v-slot:activator="{
                                                                                    on,
                                                                                    attrs
                                                                                }"
                                                                            >
                                                                                <div
                                                                                    class="
                                                                                        title-document-enduser
                                                                                    "
                                                                                    v-bind="
                                                                                        attrs
                                                                                    "
                                                                                    v-on="
                                                                                        on
                                                                                    "
                                                                                >
                                                                                    <span
                                                                                        v
                                                                                        >{{
                                                                                            subChildItem.title
                                                                                        }}</span
                                                                                    >
                                                                                </div>
                                                                            </template>
                                                                            <span
                                                                                style="
                                                                                    font: 13px
                                                                                        roboto;
                                                                                "
                                                                                >{{
                                                                                    subChildItem.title
                                                                                }}</span
                                                                            >
                                                                            <span
                                                                                style="
                                                                                    font: 8px;
                                                                                    opacity: 0.4;
                                                                                "
                                                                                >{{
                                                                                    subChildItem.name
                                                                                }}</span
                                                                            >
                                                                        </v-tooltip>
                                                                        <div
                                                                            v-else
                                                                            class="
                                                                                title-document-enduser
                                                                            "
                                                                            v-on:click="
                                                                                clickHandler(
                                                                                    subChildItem.type,
                                                                                    subChildItem,
                                                                                    item
                                                                                )
                                                                            "
                                                                        >
                                                                            {{
                                                                                subChildItem.title
                                                                                    ? subChildItem.title
                                                                                    : subChildItem.name
                                                                            }}
                                                                        </div>
                                                                        <v-btn
                                                                            icon
                                                                            class="
                                                                                icon-dots-horizontal
                                                                            "
                                                                            v-on:contextmenu="
                                                                                rightClickHandler(
                                                                                    $event,
                                                                                    subChildItem,
                                                                                    childItem.name,
                                                                                    item
                                                                                )
                                                                            "
                                                                            v-on:click="
                                                                                rightClickHandler(
                                                                                    $event,
                                                                                    subChildItem,
                                                                                    childItem.name,
                                                                                    item
                                                                                )
                                                                            "
                                                                            ><v-icon>
                                                                                mdi-dots-horizontal</v-icon
                                                                            ></v-btn
                                                                        >
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </v-col>
                                                <v-responsive
                                                    v-if="n === 2"
                                                    :key="`width-${n}`"
                                                    width="100%"
                                                ></v-responsive>
                                            </template>
                                        </v-row>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </div>
                        </div>
                    </v-expansion-panels>
                </template>
            </div>
        </VuePerfectScrollbar>
        <ContextMenu ref="contextMenu" :allAppMode="true" />
    </div>
</template>

<script>
import { appManagementApi } from '@/api/AppManagement.js';
import { util } from './../../../plugins/util';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import ContextMenu from './../ContextMenu.vue';
import DialogCreateTask from '@/components/myItem/work/DialogCreateTask.vue';
import MenuConfigTypeView from './MenuConfigTypeView';
import Preloader from '@/components/common/Preloader';
import MyApplicationWorker from 'worker-loader!@/worker/application/MyApplication.Worker.js';
import MyApplicationsWorker from 'worker-loader!@/worker/application/MyApplicationForNewTest.Worker.js';

export default {
    components: {
        VuePerfectScrollbar,
        ContextMenu,
        DialogCreateTask,
        MenuConfigTypeView,
        Preloader
    },
    computed: {
        listApp() {
            let apps = this.$store.state.appConfig.listApps;
            apps = Object.values(apps);
            let rsl = [{}, {}];
            for (let i in apps) {
                this.$set(rsl[i % 2], apps[i].id, apps[i]);
            }
            return rsl;
        },
        allApp() {
            let apps = this.$store.state.appConfig.listApps;
            return apps;
        }
    },
    props: {
        currentType: {
            type: Number
        }
    },
    methods: {
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
        getAllTypeAction() {
            let getAllTypeAction = runBySymperPromiseWorker(
                this.MyApplicationsWorker,
                'getAllTypeAction'
            );
            getAllTypeAction.then((res) => this.handleGetAllTypeAction(res));
        },
        getAppsData() {
            let self = this;
            let activeApp = Object.keys(
                self.$store.state.app.userOperations.application_definition
            );
            let data = {
                ids: activeApp.toString()
            };
            let getApps = runBySymperPromiseWorker(
                this.MyApplicationsWorker,
                'getApps',
                data
            );
            getApps.then((res) => {
                self.handlerGetActiveApp(res);
            });
        },
        isBa() {
            let userInfo = util.auth.getSavedUserInfo();
            let userType = userInfo.profile.type;
            return userType == 'ba';
        },

        hideContextMenu() {
            this.$refs.contextMenu.hide();
        },
        clickHandler(type, item, app) {
            let action;
            if (type.includes('document')) {
                action = 'list_instance';
            }
            if (type == 'orgchart') {
                action = 'detail';
            }
            if (type == 'dashboard') {
                action = 'view';
            }
            if (type == 'workflow_definition') {
                action = 'list_instance';
            }
            this.defineAction[type].action = action;
            let id = item.objectIdentifier.split(':')[1];
            this.$evtBus.$emit(
                'symper-app-call-action-handler',
                this.defineAction[type],
                this,
                {
                    id: id,
                    name: item.name,
                    title: item.title,
                    appId: app.id
                }
            );
        },
        rightClickHandler(event, item, type, app) {
            let self = this;
            event.stopPropagation();
            event.preventDefault();
            if (this.isBa()) {
                item.actions = this.allTypeAction[item.type]['action'];
            } else {
                let id = item.objectIdentifier.split(':')[1];
                item.actions = Object.keys(
                    self.$store.state.app.userOperations[item.type][id]
                );
            }
            item.actions = item.actions.filter((e) => {
                return e != 'submit_by_workflow';
            });
            if (type == 'document_category' || type == 'document_major') {
                type = 'document_definition';
            }
            this.$refs.contextMenu.setType(type);
            this.$refs.contextMenu.setContextItem([...new Set(item.actions)]);
            this.$refs.contextMenu.show(event);
            this.$refs.contextMenu.setItem(item);
            this.$refs.contextMenu.setAppId(app.id);
        },
        changeView() {
            this.hideContextMenu();
            this.$emit('change-type');
            this.$store.commit('appConfig/changeTypeView');
        },
        collapse() {
            let panels =
                this.panel.length == 0
                    ? [
                          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                          16, 17, 18, 19, 20, 21, 22, 23, 24, 25
                      ]
                    : [];
            this.panel = panels;
        },
        reduce(item) {
            let i = 0;
            item.forEach(function (e) {
                if (e.show == true) {
                    i++;
                }
            });
            return i;
        },

        checkChildrenApp(data, idApp) {
            let self = this;
            this.listType.forEach(function (k) {
                self.mapIdApp[idApp][k] = [];
                if (data.hasOwnProperty(k)) {
                    data[k].forEach(function (e) {
                        let str = k + ':' + e.objectId;
                        if (self.listIds.includes(str) == false) {
                            self.listIds.push(str);
                        }
                        self.mapIdApp[idApp][k].push(k + ':' + e.objectId);
                        self.$set(self.mapIdItem, k + ':' + e.objectId, e);
                    });
                }
            });
        },

        async updateChidrenItemToApp(data) {
            data.forEach(function (e) {
                e.show = true;
            });
            let self = this;
            for (let app in this.mapIdApp) {
                for (let typeT in this.mapIdApp[app]) {
                    if (this.mapIdApp[app][typeT].length > 0) {
                        let obj = {};
                        let arr = [];
                        let arrCategory = [];
                        let arrMajor = [];
                        data.forEach(function (t) {
                            if (
                                self.mapIdApp[app][typeT].includes(
                                    t.objectIdentifier
                                )
                            ) {
                                if (
                                    t.hasOwnProperty('objectType') &&
                                    t.objectIdentifier.includes('document')
                                ) {
                                    if (t.objectType == '2') {
                                        obj = util.cloneDeep(
                                            self.document_category
                                        );
                                        arrCategory.push(t);
                                        obj.item = arrCategory;
                                        let types = 'document_category';
                                        self.$set(
                                            self.apps[app].childrenAppReduce,
                                            types,
                                            obj
                                        );
                                    }
                                    if (t.objectType == '1') {
                                        obj = util.cloneDeep(
                                            self.document_major
                                        );
                                        arrMajor.push(t);
                                        obj.item = arrMajor;
                                        let types = 'document_major';
                                        self.$set(
                                            self.apps[app].childrenAppReduce,
                                            types,
                                            obj
                                        );
                                    }
                                } else {
                                    obj = util.cloneDeep(self[typeT]);
                                    arr.push(t);
                                    obj.item = arr;
                                    self.$set(
                                        self.apps[app].childrenAppReduce,
                                        typeT,
                                        obj
                                    );
                                }
                            }
                        });
                    }
                }
            }
            self.apps = await runBySymperPromiseWorker(
                this.MyApplicationsWorker,
                'sortDetailApps',
                self.apps
            );
            self.loadingApp = false;
        },
        updateFavoriteItem(array) {
            let self = this;
            array.forEach((item) => {
                let id = item.objectIdentifier.replace(/[^0-9]/g, '');
                this.listFavorite.forEach(function (e) {
                    if (e.objectIdentifier == id) {
                        item.favorite = true;
                    }
                });
                if (item.favorite == undefined) {
                    item.favorite = false;
                }
            });
            return array;
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
            if (!this.isBa()) {
                arr.forEach(function (e) {
                    if (userOperations[e]) {
                        let Key = Object.keys(userOperations[e]);
                        let val = obj.filter((item) => {
                            return (
                                item.objectType == e &&
                                Key.includes(item.objectId)
                            );
                        });
                        for (let i = 0; i < val.length; i++) {
                            userOperations[e][val[i].objectId];

                            let actionLength = Object.keys(
                                userOperations[e][val[i].objectId]
                            ).length;
                            if (
                                Object.keys(
                                    userOperations[e][val[i].objectId]
                                ).find((element) => {
                                    return element == 'submit_by_workflow';
                                })
                            ) {
                                --actionLength;
                            }

                            if (actionLength == 0) {
                                val.splice(i, 1);
                                i--;
                            }
                        }

                        ChildrenApp[e] = val;
                    }
                });
            } else {
                arr.forEach(function (e) {
                    let val = obj.filter((item) => {
                        return item.objectType == e;
                    });
                    ChildrenApp[e] = val;
                });
            }
            return ChildrenApp;
        },
        async handlerGetActiveApp(res) {
            let self = this;
            if (res.status == 200) {
                for (let e of res.data) {
                    if (!e.objects) {
                        e.objects = [];
                    }
                    let childrenApp = self.filterDataToRightFormat(e.objects);
                    e.childrenApp = childrenApp;
                    self.$set(e, 'childrenAppReduce', {});
                    self.$set(self.apps, e.id, e);
                    self.$set(self.mapIdApp, e.id, {
                        workflow_definition: {},
                        document_definition: {},
                        orgchart: {},
                        dashboard: {}
                    });
                    if (e.childrenApp) {
                        if (Object.keys(e.childrenApp).length > 0) {
                            self.checkChildrenApp(e.childrenApp, e.id);
                        }
                    }
                }
                await self.getItemsByAccessControl(self.listIds);
                this.$store.commit('appConfig/setListApps', self.apps);
            }
        },
        changeFavorite(item, type, app, favorite) {
            let self = this;
            let userId = this.$store.state.app.endUserInfo.id;
            let itemId = item.objectIdentifier.replace(/[^0-9]/g, '');
            if (this.$store.state.appConfig.listAppsSideBySide[app.id]) {
                this.$store.state.appConfig.listAppsSideBySide[app.id][type][
                    'item'
                ].forEach((e) => {
                    if (e.objectIdentifier.replace(/[^0-9]/g, '') == itemId) {
                        if (item.favorite == false) {
                            e.favorite = true;
                        } else {
                            e.favorite = false;
                        }
                    }
                });
            }
            self.$store.commit('appConfig/updateSelectingItemType', type);
            if (type == 'document_major' || type == 'document_category') {
                type = 'document_definition';
            }
            let arr = [
                'document_definition',
                'orgchart',
                'dashboard',
                'workflow_definition'
            ];
            arr.forEach(function (e) {
                if (item.objectIdentifier.includes(e + ':')) {
                    item.id = item.objectIdentifier.replace(e + ':', '');
                }
            });
            if (item.favorite == false) {
                appManagementApi
                    .addFavoriteItem(userId, item.id, type, 1, app.id)
                    .then((res) => {
                        if (res.status == 200) {
                            self.$store.commit(
                                'appConfig/insertFavorite',
                                item
                            );
                            self.$store.commit(
                                'appConfig/updateFavoriteMyAppItem',
                                {
                                    appId: app.id,
                                    itemId: item.objectIdentifier,
                                    value: true
                                }
                            );
                        }
                    });
            } else {
                appManagementApi
                    .addFavoriteItem(userId, item.id, type, 0, app.id)
                    .then((res) => {
                        if (res.status == 200) {
                            item.type = type;
                            self.$store.commit('appConfig/delFavorite', item);
                            self.$store.commit(
                                'appConfig/updateFavoriteMyAppItem',
                                {
                                    appId: app.id,
                                    itemId: item.objectIdentifier,
                                    value: false
                                }
                            );
                        }
                    });
            }
            if (favorite) {
                self.$set(item, 'favorite', false);
            } else {
                self.$set(item, 'favorite', true);
            }
        },
        filterObj(value) {
            for (let e in this.allApp) {
                this.filterItemInApp(e, value);
            }
        },
        filterItemInApp(e, value) {
            let arr = [
                'document_category',
                'document_major',
                'orgchart',
                'dashboard',
                'workflow_definition'
            ];
            let self = this;
            arr.forEach(function (j) {
                if (self.allApp[e].childrenAppReduce.hasOwnProperty(j)) {
                    self.allApp[e].childrenAppReduce[j].item.forEach(function (
                        k
                    ) {
                        if (value == '') {
                            k.show = true;
                        }
                        let text = k.title ? k.title : k.name;
                        if (text.toLowerCase().includes(value.toLowerCase())) {
                            k.show = true;
                        } else {
                            k.show = false;
                        }
                    });
                }
            });
        },
        async getItemsByAccessControl(ids) {
            let self = this;
            let data = {
                ids: ids
            };
            let promiseArr = [
                this.getFavorite(),
                runBySymperPromiseWorker(
                    this.MyApplicationsWorker,
                    'getItemByAccessControl',
                    data
                )
            ];
            let res = (await Promise.all(promiseArr))[1];
            self.updateFavoriteItem(res.data);
            await self.updateChidrenItemToApp(res.data);
        },
        clearIntervals(val) {
            clearInterval(val);
        },
        async getFavorite() {
            this.isLoadFavorite = false;
            this.listFavorite = [];
            let userId = this.$store.state.app.endUserInfo.id;
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
            let res = await runBySymperPromiseWorker(
                this.MyApplicationsWorker,
                'getFavorite',
                data
            );
            this.isLoadFavorite = true;
            this.listFavorite = res.data.listObject;
        }
    },
    data() {
        return {
            defineAction: {
                document_definition: {
                    module: 'document',
                    resource: 'document_definition',
                    scope: 'document'
                },
                workflow_definition: {
                    module: 'workflow',
                    resource: 'workflow_definition',
                    scope: 'workflow'
                },
                dashboard: {
                    module: 'dashboard',
                    resource: 'dashboard',
                    scope: 'dashboard'
                },
                orgchart: {
                    module: 'orgchart',
                    resource: 'orgchart',
                    scope: 'orgchart'
                }
            },
            isLoadFavorite: false,
            listFavorite: [],
            allTypeAction: {},
            MyApplicationsWorker: null,
            myApplicationWorker: null,
            document_definition: {
                icon: 'mdi-file-edit-outline',
                title: 'Documents',
                name: 'document_definition',
                item: []
            },
            document_category: {
                icon: 'mdi-file-document-outline',
                title: this.$t('apps.listType.documentCategory'),
                name: 'document_category'
            },
            document_major: {
                icon: 'mdi-file-edit-outline',
                title: this.$t('apps.listType.documentMajor'),
                name: 'document_major'
            },
            orgchart: {
                icon: 'mdi-widgets-outline',
                title: this.$t('apps.listType.orgchart'),
                name: 'orgchart'
            },
            dashboard: {
                icon: 'mdi-view-dashboard',
                title: this.$t('apps.listType.dashboard'),
                name: 'dashboard'
            },
            workflow_definition: {
                icon: 'mdi-lan',
                title: this.$t('apps.listType.workflow'),
                name: 'workflow_definition'
            },
            panel: [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                18, 19, 20, 21, 22, 23, 24, 25
            ],
            listIds: [],
            mapIdApp: [],
            childItemReduce: {},
            listType: [
                'orgchart',
                'document_definition',
                'workflow_definition',
                'dashboard'
            ],
            mapIdItem: {
                orgchart: {},
                document_definition: {},
                dashboard: {},
                workflow_definition: {}
            },
            loadingApp: true,
            menuItemsHeight: 'calc(100vh - 125px)',
            searchItemKey: '',
            apps: {}
        };
    },
    created() {
        this.MyApplicationsWorker = new MyApplicationsWorker();
        let self = this;
        if (self.isBa()) {
            self.getAllTypeAction();
        }
    },
    mounted() {
        this.$emit('mounted-details');
    },
    watch: {
        searchItemKey(val) {
            this.filterObj(val);
        }
    }
};
</script>

<style scoped>
.view-details-all-app {
    display: flex;
    flex-direction: column;
}
.view-details-all-app .header-view-details-all-app {
    display: flex;
    margin: 8px 16px 8px 8px;
}
.view-details-all-app >>> .header-view-details-all-app .button-header {
    display: flex;
    margin-left: 4px;
}
.view-details-all-app >>> .header-view-details-all-app .button-header .v-btn {
    margin: unset;
    margin-top: -2px;
}
.view-details-all-app >>> .header-view-details-all-app .v-icon::after {
    display: none;
}
.view-details-all-app >>> .header-view-details-all-app .v-icon:hover {
    background-color: unset !important;
}
.view-details-all-app >>> button {
    margin: 8px;
}
.view-details-all-app .content-view-details-all-app {
    width: 95%;
    margin-left: auto;
    margin-right: auto;
    font: 13px roboto;
}
.view-details-all-app
    >>> .content-view-details-all-app
    .v-expansion-panel-header {
    margin: 0px 32px 0px 16px;
    min-height: unset;
    height: 50px;
}
.view-details-all-app
    >>> .content-view-details-all-app
    .v-expansion-panel-header__icon {
    margin-right: 12px;
}
.view-details-all-app .content-view-details-all-app .app-item-img {
    width: 16px;
    height: 16px;
    flex: unset;
    padding-top: 2px;
}
.view-details-all-app h4 {
    float: left;
}
.view-details-all-app .button-add-task {
    margin: 0px 12px;
    box-shadow: unset;
    height: 32px;
    min-width: unset;
    padding: unset;
    width: 110px;
}
.view-details-all-app >>> .button-add-task .v-icon {
    margin: 0px 0px 0px 8px;
}
.view-details-all-app >>> .v-input {
    flex: unset;
}
.view-details-all-app >>> .v-icon {
    font-size: 13px;
    margin: 0px 8px;
}
.view-details-all-app >>> .v-input__control {
    min-height: unset;
    width: 250px !important;
    min-width: unset;
    height: 50px;
    flex-grow: unset;
}
.view-details-all-app >>> .v-input__control .v-input__slot {
    box-shadow: unset !important;
    width: 250px;
    background-color: #f7f7f7;
    margin-right: 20px;
}
.view-details-all-app >>> .v-input__control .v-input__slot .v-text-field__slot {
    font: 13px roboto;
}
.view-details-all-app >>> .v-input__control .v-input__slot label {
    font: 13px roboto;
    padding-top: 2px;
}
.view-details-all-app >>> .v-input__control #input-110 {
    font: 13px roboto;
}
.view-details-all-app >>> .v-input__control .v-text-field__details {
    display: none;
}
.view-details-all-app >>> .app-child-item {
    margin-left: -4px;
}
.view-details-all-app >>> .app-child-item:hover .icon-dots-horizontal {
    display: inline-block;
}
.view-details-all-app >>> .app-child-item .icon-dots-horizontal {
    display: none;
}
.view-details-all-app >>> .title-document-enduser {
    white-space: nowrap;
    width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
}
.view-details-all-app >>> .icon-star {
    display: none;
    position: absolute;
    top: 0px;
    left: -30px;
}
.view-details-all-app >>> .icon-star-active {
    color: #f6be4f;
    display: inline-block;
    position: absolute;
    top: 0px;
    left: -30px;
}
.view-details-all-app >>> li {
    cursor: pointer;
    padding: 8px 12px 8px 32px;
    list-style: none;
    margin-right: 10px;
}
.view-details-all-app >>> li:hover {
    background-color: #f7f7f7;
    border-radius: 5px;
}
v-expansion-panel-header .view-details-all-app >>> li:hover .icon-remove {
    background-color: #f7f7f7;
    border-radius: 10px;
    display: inline-block;
}
.view-details-all-app >>> li:hover .icon-star {
    display: inline-block;
}
.view-details-all-app >>> .v-expansion-panel {
    box-shadow: unset;
}
.view-details-all-app >>> .v-expansion-panel::before {
    box-shadow: unset;
}
.view-details-all-app >>> .v-expansion-panel-header--active .app-title {
    border-bottom: 0.5px solid #ff8003;
    padding-bottom: 4px;
}
.view-details-all-app
    >>> .v-expansion-panel-header--active
    .v-expansion-panel-header__icon {
    border-bottom: 0.5px solid #ff8003;
    padding-bottom: 10px;
}
.view-details-all-app >>> .v-expansion-panel-header::before .app-title {
    border-bottom: 0.5px solid #ffffff;
}
.icon-dots-horizontal.v-btn.v-btn--flat.v-btn--icon.v-btn--round.theme--light.v-size--default {
    position: absolute;
    top: -14px;
    right: -14px;
    height: 26px;
    width: 26px;
}
.app-child-item .v-icon::after {
    background-color: transparent;
}
.app-child-item .v-icon::before {
    background-color: transparent;
}
</style>

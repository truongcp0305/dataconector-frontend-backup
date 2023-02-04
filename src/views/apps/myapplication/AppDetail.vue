<template>
    <div class="app-details">
        <div
            :style="{
                height: listItemHeight,
                overflow: 'auto'
            }"
        >
            <Preloader v-if="loadingApp" />
            <div
                v-else
                v-for="(itemT, i) in sAppModule"
                :key="i"
                class="app-item"
            >
                <div class="title-app" v-if="itemT.item.length > 0">
                    <v-icon style="font-size: 13px">{{ itemT.icon }}</v-icon>
                    <h4>
                        {{ $t(itemT.title) }}
                        <span> {{ '(' + itemT.item.length + ')' }}</span>
                    </h4>
                </div>
                <ul
                    v-for="(childItem, i) in itemT.item"
                    :key="i"
                    class="app-child-item"
                >
                    <li
                        v-on:click="clickHandler(itemT.name, childItem)"
                        v-if="isEndUserCpn == true"
                        :class="{
                            'child-item-active':
                                childItem.objectIdentifier == activeIndexChild
                        }"
                        @contextmenu="
                            rightClickHandler($event, childItem, itemT.name)
                        "
                    >
                        <div style="position: relative">
                            <v-icon
                                @click="changeFavorite(childItem, itemT.name)"
                                :class="{
                                    'icon-star-active':
                                        childItem.favorite == true,
                                    'icon-star': true
                                }"
                                >mdi-star</v-icon
                            >
                            <v-tooltip
                                bottom
                                v-if="
                                    itemT.name == 'document_category' ||
                                    itemT.name == 'document_major'
                                "
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <div
                                        class="title-document-enduser"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <span>{{ childItem.title }}</span>
                                    </div>
                                </template>
                                <span style="font-size: 13px roboto">{{
                                    childItem.title
                                }}</span>
                                <span
                                    style="font-size: 11px; opacity: 0.4"
                                    class="ml-1"
                                    >{{ childItem.name }}</span
                                >
                            </v-tooltip>
                            <v-tooltip bottom v-else>
                                <template v-slot:activator="{ on, attrs }">
                                    <div
                                        class="title-document-enduser"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <span>{{ childItem.name }}</span>
                                    </div>
                                </template>
                                <span style="font: 13px roboto">{{
                                    childItem.name
                                }}</span>
                            </v-tooltip>
                            <v-btn
                                x-small
                                icon
                                class="icon-dots-horizontal"
                                v-on:click="
                                    rightClickHandler(
                                        $event,
                                        childItem,
                                        itemT.name
                                    )
                                "
                                ><v-icon> mdi-dots-horizontal</v-icon></v-btn
                            >
                        </div>
                    </li>
                    <li v-else>
                        <div style="position: relative">
                            <v-tooltip
                                bottom
                                v-if="
                                    itemT.name == 'document_category' ||
                                    itemT.name == 'document_major'
                                "
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <div
                                        class="title-document"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <span>{{ childItem.title }}</span>
                                        <span
                                            style="font: 10px; opacity: 0.4"
                                            >{{ childItem.name }}</span
                                        >
                                    </div>
                                </template>
                                <span style="font-size: 13px roboto">{{
                                    childItem.title
                                }}</span>
                                <span
                                    style="font-size: 11px; opacity: 0.4"
                                    class="ml-1"
                                    >{{ childItem.name }}</span
                                >
                            </v-tooltip>
                            <v-tooltip bottom v-else>
                                <template v-slot:activator="{ on, attrs }">
                                    <div
                                        class="title-document"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <span>{{ childItem.name }}</span>
                                    </div>
                                </template>
                                <span style="font: 13px roboto">{{
                                    childItem.name
                                }}</span>
                            </v-tooltip>
                            <v-icon
                                class="icon-remove"
                                @click="removeItem(childItem, itemT.name)"
                                >mdi-delete-empty-outline</v-icon
                            >
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <ContextMenu
            ref="contextMenu"
            :sideBySide="sideBySide"
            :instanceKey="instanceKey"
            :allAppMode="false"
        />
    </div>
</template>
<script>
import ContextMenu from './../ContextMenu.vue';
import { appManagementApi } from '@/api/AppManagement.js';
import Preloader from '@/components/common/Preloader';
export default {
    data: function () {
        return {
            currentSelected: null,
            typeSelected: null,
            objFilter: {
                document_category: {
                    icon: 'mdi-file-document-outline',
                    title: this.$t('apps.listType.documentCategory'),
                    name: 'document_category',
                    item: []
                },
                document_major: {
                    icon: 'mdi-file-edit-outline',
                    title: this.$t('apps.listType.documentMajor'),
                    name: 'document_major',
                    item: []
                },
                orgchart: {
                    icon: 'mdi-widgets-outline',
                    title: this.$t('apps.listType.orgchart'),
                    name: 'orgchart',
                    item: []
                },
                dashboard: {
                    icon: 'mdi-view-dashboard',
                    title: this.$t('apps.listType.dashboard'),
                    name: 'dashboard',
                    item: []
                },
                workflow_definition: {
                    icon: 'mdi-lan',
                    title: this.$t('apps.listType.workflow'),
                    name: 'workflow_definition',
                    item: []
                }
            }
        };
    },
    created() {},
    components: {
        ContextMenu,
        Preloader
    },
    mounted() {
        this.openFromUrl();
    },
    computed: {
        sAppModule() {
            if (this.searchKey == '') {
                let appS = this.$store.state.appConfig;
                if (appS.listAppsSideBySide[appS.currentAppId]) {
                    let arr = [
                        'document_category',
                        'document_major',
                        'orgchart',
                        'dashboard',
                        'workflow_definition'
                    ];
                    arr.forEach((e) => {
                        for (
                            let i = 0;
                            i <
                            appS.listAppsSideBySide[appS.currentAppId][e][
                                'item'
                            ].length;
                            i++
                        ) {
                            if (
                                appS.listAppsSideBySide[appS.currentAppId][e][
                                    'item'
                                ][i]['actions'].length == 0
                            ) {
                                appS.listAppsSideBySide[appS.currentAppId][e][
                                    'item'
                                ].splice(i, 1);
                                i--;
                            }
                        }
                    });
                    return appS.listAppsSideBySide[appS.currentAppId];
                }
            } else {
                this.filterItem();
                return this.objFilter;
            }
        },
        activeIndexChild() {
            return this.$store.state.appConfig.activeChildItem;
        },
        listItemHeight() {
            if (this.isMyApplication == true) {
                return 'calc(100vh - 125px)';
            } else {
                return 'calc(100vh - 380px)';
            }
        },
        fullPath() {
            return this.$route.fullPath;
        }
    },
    props: {
        isEndUserCpn: {
            type: Boolean,
            default: false
        },
        searchKey: {
            type: String,
            default: ''
        },
        isMyApplication: {
            type: Boolean,
            default: false
        },
        sideBySide: {
            type: Boolean,
            default: false
        },
        loadingApp: {
            type: Boolean,
            default: false
        },
        instanceKey: {
            default: 0
        }
    },
    methods: {
        openFromUrl() {
            if (Object.keys(this.$route.query).length == 4) {
                let action = this.$route.query.action;
                let type = this.$route.query.childType;
                let idChild = this.$route.query.childId;
                let data = this.sAppModule[type];
                let item = {};
                for (let key in data.item) {
                    let id = data.item[key].objectIdentifier.split(':')[1];
                    if (id == idChild) {
                        item = data.item[key];
                        break;
                    }
                }
                this.rightClickHandler(null, item, type, false);
                this.$refs.contextMenu.clickAction(action, true, false, false);
            }
        },
        removeItem(item, type) {
            this.$store.commit('appConfig/removeItemSelected', {
                item: item,
                type: type
            });
        },
        setHeight() {
            this.listItemHeight = '400px';
        },
        filterItem() {
            let self = this;
            let appS = this.$store.state.appConfig;
            let listItem = appS.listAppsSideBySide[appS.currentAppId];
            for (let i in self.objFilter) {
                self.objFilter[i].item = [];
            }
            for (let i in listItem) {
                if (listItem[i].item.length > 0) {
                    listItem[i].item.filter(function (k) {
                        let field = k.title ? k.title : k.name;
                        if (
                            field
                                .toLowerCase()
                                .includes(self.searchKey.toLowerCase())
                        ) {
                            self.objFilter[i].item.push(k);
                        }
                    });
                }
            }
        },
        clickHandler(type, item) {
            this.changeUrl(item, type, 'click');
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
        changeUrl(item, type, action) {
            let hash = '/' + document.location.hash.split('&')[0];
            let id = item.objectIdentifier.split(':')[1];
            let query = {};
            query.childType = type;
            query.childId = id;
            if (action == 'click') {
                let define = {
                    document_major: 'list_instance',
                    document_category: 'list_instance',
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
        rightClickHandler(event, item, type, changeUrl = true) {
            if (changeUrl) {
                this.changeUrl(item, type, 'right-click');
            }
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            this.$store.commit(
                'appConfig/updateActiveChildItem',
                item.objectIdentifier
            );
            item.actions = item.actions.filter((e) => {
                return e != 'submit_by_workflow';
            });
            if (type == 'document_category' || type == 'document_major') {
                type = 'document_definition';
            }
            this.$refs.contextMenu.setType(type);
            this.$refs.contextMenu.setContextItem([...new Set(item.actions)]);
            if (event) {
                this.$refs.contextMenu.show(event);
            }
            this.$refs.contextMenu.setItem(item);
        },
        hideContextMenu() {
            this.$refs.contextMenu.hide();
        },
        changeFavorite(item, type) {
            let appId = this.$store.state.appConfig.currentAppId;
            let appName = this.$store.state.appConfig.currentAppName;
            event.stopPropagation();
            if (type == 'document_major' || type == 'document_category') {
                type = 'document_definition';
            }
            let arr = [
                'document_definition',
                'orgchart',
                'dashboard',
                'workflow_definition'
            ];
            let userId = this.$store.state.app.endUserInfo.id;
            arr.forEach((e) => {
                if (item.objectIdentifier.includes(e + ':')) {
                    item.id = item.objectIdentifier.replace(e + ':', '');
                }
            });
            if (item.favorite == false) {
                appManagementApi
                    .addFavoriteItem(userId, item.id, type, 1, appId)
                    .then((res) => {
                        if (res.status == 200) {
                            item.appName = appName;
                            this.$store.commit(
                                'appConfig/insertFavorite',
                                item
                            );
                            item.favorite = true;
                        }
                    });
            } else {
                appManagementApi
                    .addFavoriteItem(userId, item.id, type, 0, appId)
                    .then((res) => {
                        if (res.status == 200) {
                            item.type = type;
                            this.$store.commit('appConfig/delFavorite', item);
                            item.favorite = false;
                        }
                    });
            }
        }
    }
};
</script>

<style scoped>
.app-details {
    font: 13px roboto;
}
.app-details >>> .app-item ul {
    list-style: none;
}
.app-details >>> .app-item .title-app {
    display: flex;
    cursor: pointer;
    padding: 8px 10px;
    font-weight: 500;
}
.app-details >>> .app-item .title-document {
    white-space: nowrap;
    width: 450px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.app-details >>> .app-item .title-document-enduser {
    white-space: nowrap;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}
.app-details >>> .app-item .app-child-item:hover .title-document-enduser {
    width: 92%;
}
.app-details >>> .app-item .title-app h4 {
    padding-left: 8px;
    font-weight: unset;
}
.app-details >>> .app-item .app-child-item .v-icon {
    font-size: 13px;
    float: right;
    line-height: unset;
}
.app-details >>> .app-item .app-child-item .v-icon.icon-star,
.app-details >>> .app-item .app-child-item .v-icon.icon-star-active {
    font-size: 13px;
    float: left;
    line-height: unset;
    margin: 0 0 0 -18px;
}
.app-details >>> .app-item .app-child-item .icon-remove {
    display: none;
    top: -2px;
    left: 0px;
}

.app-details >>> .app-item .app-child-item:hover .icon-dots-horizontal {
    display: inline-block;
}
.app-details >>> .app-item .app-child-item .icon-dots-horizontal {
    display: none;
    position: absolute;
    top: -8px;
    right: 0px;
}
.app-details >>> .app-item .app-child-item .icon-star {
    display: none;
    top: -2px;
    left: 0px;
}
.app-details >>> .app-item .app-child-item .icon-star-active {
    color: #f6be4f;
    display: inline-block;

    top: -2px;
    left: 0px;
}
.app-details >>> .app-item .app-child-item {
    padding-left: 16px;
}
.app-details >>> .app-item .app-child-item .child-item-active {
    background-color: #e9e9e9;
    border-radius: 5px;
}
.app-details >>> .app-item li {
    cursor: pointer;
    padding: 8px 18px 8px 16px;
    margin-right: 10px;
}
.app-details >>> .app-item li:hover {
    background-color: #f7f7f7;
    border-radius: 5px;
}
.app-details >>> .app-item li:hover .icon-remove {
    background-color: #f7f7f7;
    border-radius: 10px;
    display: inline-block;
}
.app-details >>> .app-item li:hover .icon-star {
    display: inline-block;
}

.icon-dots-horizontal.v-btn.v-btn--flat.v-btn--icon.v-btn--round.theme--light.v-size--x-small {
    margin: 6px -14px 0 0;
    min-width: 16px;
    padding: 0 0;
}
.app-child-item .v-icon::after {
    background-color: transparent;
}
.app-child-item .v-icon::before {
    background-color: transparent;
}
</style>

<template>
    <div class="app-details">
        <PerfectScrollbar :style="{ height: listItemHeight }">
            <div v-for="(itemT, i) in sAppModule" :key="i" class="app-item">
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
                        v-if="isEndUserCpn == true"
                        v-on:contextmenu="
                            rightClickHandler($event, childItem, itemT.name)
                        "
                        v-on:click="
                            rightClickHandler($event, childItem, itemT.name)
                        "
                        :class="{
                            'child-item-active':
                                childItem.objectIdentifier == activeIndexChild,
                        }"
                    >
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
                                        class="title-document-enduser"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <span>{{ childItem.title }}</span>
                                    </div>
                                </template>
                                <span style="font: 13px roboto">{{
                                    childItem.title
                                }}</span>
                                <span style="font: 8px; opacity: 0.4">{{
                                    childItem.name
                                }}</span>
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
                            <v-icon
                                @click="changeFavorite(childItem, itemT.name)"
                                :class="{
                                    'icon-star-active':
                                        childItem.favorite == true,
                                    'icon-star': true,
                                }"
                                >mdi-star</v-icon
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
                                <span style="font: 13px roboto">{{
                                    childItem.title
                                }}</span>
                                <span style="font: 8px; opacity: 0.4">{{
                                    childItem.name
                                }}</span>
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
        </PerfectScrollbar>
        <ContextMenu
            ref="contextMenu"
            :sideBySide="sideBySide"
            :allAppMode="false"
        />
    </div>
</template>
<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import ContextMenu from './ContextMenu.vue';
import { appManagementApi } from './../../api/AppManagement.js';
import PerfectScrollbar from '@/components/common/PerfectScrollBar';
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
                    item: [],
                },
                document_major: {
                    icon: 'mdi-file-edit-outline',
                    title: this.$t('apps.listType.documentMajor'),
                    name: 'document_major',
                    item: [],
                },
                orgchart: {
                    icon: 'mdi-widgets-outline',
                    title: this.$t('apps.listType.orgchart'),
                    name: 'orgchart',
                    item: [],
                },
                dashboard: {
                    icon: 'mdi-view-dashboard',
                    title: this.$t('apps.listType.dashboard'),
                    name: 'dashboard',
                    item: [],
                },
                workflow_definition: {
                    icon: 'mdi-lan',
                    title: this.$t('apps.listType.workflow'),
                    name: 'workflow_definition',
                    item: [],
                },
            },
        };
    },
    created() {
        let self = this;
    },
    components: {
        ContextMenu,
        VuePerfectScrollbar,
        PerfectScrollbar,
    },
    mounted() {},
    computed: {
        sAppModule() {
            if (this.searchKey == '') {
                return this.$store.state.appConfig.listItemSelected;
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
    },
    props: {
        isEndUserCpn: {
            type: Boolean,
            default: false,
        },
        searchKey: {
            type: String,
            default: '',
        },
        isMyApplication: {
            type: Boolean,
            default: false,
        },
        sideBySide: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        removeItem(item, type) {
            this.$store.commit('appConfig/removeItemSelected', {
                item: item,
                type: type,
            });
        },
        setHeight() {
            this.listItemHeight = '400px';
        },
        filterItem() {
            let self = this;
            let listItem = this.$store.state.appConfig.listItemSelected;
            self.objFilter.document_major.item = [];
            self.objFilter.document_category.item = [];
            self.objFilter.orgchart.item = [];
            self.objFilter.dashboard.item = [];
            self.objFilter.workflow_definition.item = [];
            if (listItem.document_major.item.length > 0) {
                listItem.document_major.item.filter(function (item) {
                    if (
                        item.title
                            .toLowerCase()
                            .includes(self.searchKey.toLowerCase())
                    ) {
                        self.objFilter.document_major.item.push(item);
                    }
                });
            }
            if (listItem.document_category.item.length > 0) {
                listItem.document_category.item.filter(function (item) {
                    if (
                        item.title
                            .toLowerCase()
                            .includes(self.searchKey.toLowerCase())
                    ) {
                        self.objFilter.document_category.item.push(item);
                    }
                });
            }
            if (listItem.orgchart.item.length > 0) {
                listItem.orgchart.item.filter(function (item) {
                    if (
                        item.name
                            .toLowerCase()
                            .includes(self.searchKey.toLowerCase())
                    ) {
                        self.objFilter.orgchart.item.push(item);
                    }
                });
            }

            if (listItem.dashboard.item.length > 0) {
                listItem.dashboard.item.filter(function (item) {
                    if (
                        item.name
                            .toLowerCase()
                            .includes(self.searchKey.toLowerCase())
                    ) {
                        self.objFilter.dashboard.item.push(item);
                    }
                });
            }
            if (listItem.workflow_definition.item.length > 0) {
                listItem.workflow_definition.item.filter(function (item) {
                    if (
                        item.name
                            .toLowerCase()
                            .includes(self.searchKey.toLowerCase())
                    ) {
                        self.objFilter.workflow_definition.item.push(item);
                    }
                });
            }
        },
        rightClickHandler(event, item, type) {
            event.stopPropagation();
            event.preventDefault();
            this.$store.commit(
                'appConfig/updateActiveChildItem',
                item.objectIdentifier,
            );
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
            let userId = this.$store.state.app.endUserInfo.id;
            if (item.objectIdentifier.includes('document_definition:')) {
                item.id = item.objectIdentifier.replace(
                    'document_definition:',
                    '',
                );
            }
            if (item.objectIdentifier.includes('orgchart:')) {
                item.id = item.objectIdentifier.replace('orgchart:', '');
            }
            if (item.objectIdentifier.includes('dashboard:')) {
                item.id = item.objectIdentifier.replace('dashboard:', '');
            }
            if (item.objectIdentifier.includes('workflow_definition:')) {
                item.id = item.objectIdentifier.replace(
                    'workflow_definition:',
                    '',
                );
            }
            if (item.favorite == false) {
                appManagementApi
                    .addFavoriteItem(userId, item.id, type, 1, appId)
                    .then((res) => {
                        if (res.status == 200) {
                            item.appName = appName;
                            this.$store.commit(
                                'appConfig/insertFavorite',
                                item,
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
        },
    },
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
    padding: 8px 15px;
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
    width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
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
.app-details >>> .app-item .app-child-item .icon-remove {
    display: none;
    position: absolute;
    top: -2px;
    right: 0px;
}
.app-details >>> .app-item .app-child-item .icon-star {
    display: none;
    position: absolute;
    top: -2px;
    right: 0px;
}
.app-details >>> .app-item .app-child-item .icon-star-active {
    color: #f6be4f;
    display: inline-block;
    position: absolute;
    top: -2px;
    right: 0px;
}
.app-details >>> .app-item .app-child-item .child-item-active {
    background-color: #e9e9e9;
    border-radius: 5px;
}
.app-details >>> .app-item li {
    cursor: pointer;
    padding: 8px 12px 8px 20px;
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
</style>

<template>
    <div
        :style="{ position: isExpand ? 'relative' : 'absolute' }"
        class="report-sidebar"
        @mouseenter="drawer = true"
        @mouseleave="drawer = false"
    >
        <v-btn
            :class="{
                'collapse-sidebar-icon': true,
                'btn-collapsing': isExpand
            }"
            class="mt-1"
            icon
            tile
            small
            @click="expandSidebar"
        >
            <v-icon v-if="!isExpand && !drawer">mdi-menu</v-icon>
            <v-icon v-else-if="isExpand">mdi-chevron-double-left</v-icon>
            <v-icon v-else-if="drawer">mdi-chevron-double-right</v-icon>
        </v-btn>
        <transition name="slide">
            <div
                v-show="checkShowSideBar()"
                :class="{
                    'wrapper-sidebar': true,
                    'wrapper-sidebar-mini': !isExpand,
                    'wrapper-sidebar-full': isExpand
                }"
            >
                <div
                    class="font-weight-bold ml-2"
                    style="font-size: 18px !important; margin-top: 8px"
                >
                    {{ $t('v2.dashboard.dashboard') }}
                </div>
                <VuePerfectScrollbar class="sidebar-content">
                    <v-list :expand="true" dense>
                        <v-list-group
                            dense
                            v-for="item in reportMenu"
                            :key="item.title"
                            link
                            no-action
                            :class="{
                                'menu-group': true,
                                'menu-group-active': item.active == true
                            }"
                            :symper-action="
                                $bindAction(item.action ? item.action : '')
                            "
                            @click="gotoPage(item)"
                        >
                            <template v-slot:prependIcon>
                                <v-icon class="ml-1 icon-group">
                                    {{ item.icon }}
                                </v-icon>
                            </template>
                            <v-icon
                                slot="appendIcon"
                                small
                                :symper-action="$bindAction(item.action)"
                            >
                            </v-icon>
                            <template v-slot:activator v-if="item.title">
                                <v-list-item-title
                                    style="margin-left: -25px"
                                    :symper-action="$bindAction(item.action)"
                                >
                                    <v-list-item-title
                                        class="ml-3"
                                        style="color: rgb(0, 0, 0, 0.8)"
                                        :symper-action="
                                            $bindAction(item.action)
                                        "
                                    >
                                        {{ $t('common.sidebar.' + item.title) }}
                                    </v-list-item-title>
                                </v-list-item-title>
                            </template>
                            <template v-slot:activator v-else>
                                <v-list-item-title class="fm title-group">
                                    <span class="fs-11">
                                        {{
                                            $t(
                                                'common.sidebar.' +
                                                    item.titleGroup
                                            )
                                        }}</span
                                    >
                                </v-list-item-title>
                            </template>
                            <v-list-item
                                style="
                                    margin-left: -25px;
                                    height: 32px !important;
                                "
                                v-for="(subMenu, objectType) in item.children"
                                :key="objectType"
                                :class="{
                                    'menu-group-active': subMenu.active == true
                                }"
                                @click="gotoPage(subMenu, true, item)"
                            >
                                <v-list-item-title
                                    class="fm"
                                    style="color: rgb(0, 0, 0, 0.8)"
                                >
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <span v-on="on">
                                                {{
                                                    $t(
                                                        'common.sidebar.' +
                                                            subMenu.title
                                                    )
                                                }}
                                            </span>
                                        </template>
                                        <span>
                                            {{
                                                $t(
                                                    'common.sidebar.' +
                                                        subMenu.title
                                                )
                                            }}
                                        </span>
                                    </v-tooltip>
                                </v-list-item-title>
                            </v-list-item>
                        </v-list-group>
                    </v-list>
                </VuePerfectScrollbar>
            </div>
        </transition>
    </div>
</template>
<script>
import _ from 'lodash';
import { util } from '@/plugins/util.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
export default {
    created() {
        this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
            if (
                this.$refs.projectPopupView &&
                $(evt.target).closest('.project-info').length == 0 &&
                $(evt.target).closest('.popup-select-project').length == 0
            ) {
                this.$refs.projectPopupView.hide();
            }
            if (
                this.$refs.SelectBoard &&
                $(evt.target).closest('.v-list-item').length == 0 &&
                $(evt.target).closest('.card-add-board').length == 0
            ) {
                this.$refs.SelectBoard.hide();
            }
        });

        this.$evtBus.$on('selected-item-board', (board) => {
            this.menu.workspace1.items[0].title = board.name;
            this.menu.workspace1.items[0].subTitle = '';
        });
    },
    components: {
        VuePerfectScrollbar
    },
    props: {
        includeFixed: {
            type: Boolean,
            default: true
        }
    },
    watch: {
        mini(vl) {
            if (!vl) {
                $('.sb-menu-icon').addClass('is-active');
            } else {
                $('.sb-menu-icon').removeClass('is-active');
            }
        }
    },
    methods: {
        checkShowSideBar() {
            if (!this.isExpand) {
                return this.drawer;
            }
            return true;
        },
        expandSidebar() {
            if (this.includeFixed) {
                this.isExpand = !this.isExpand;
                this.$emit('after-toggle-sidebar', !this.isExpand);
            }
        },
        gotoPage(item, subItem = false, parent) {
            if (!item.children) {
                this.setActive(item, subItem, parent);
            }
        },
        setActive(item, subItem, parent) {
            this.$store.commit('dashboard/setSelectingShowList', item.title);
            if (!this.$route.path.includes('report')) {
                this.$goToPage(
                    '/report',
                    this.$t('v2.dashboard.dashboard')
                );
            }
            let self = this;
            this.reportMenu.forEach(function (e) {
                if (e.hasOwnProperty('active')) {
                    e.active = false;
                }
                if (e.hasOwnProperty('children')) {
                    for (let child in e.children) {
                        self.$set(e.children[child], 'active', false);
                    }
                }
            });
            this.$set(item, 'active', true);
        }
    },
    data() {
        return {
            isExpand: false,
            menu: null,
            reportMenu: [
                {
                    title: this.$t('v2.dashboard.dashboard'),
                    icon: 'mdi-view-dashboard-outline',
                    group: this.$t('v2.dashboard.myWork'),
                    children: {
                        listDashboard: {
                            title: 'list-dashboard',
                            link: '/report'
                        },
                        listTrashDashboard: {
                            title: 'list-trash-dashboard',
                            link: '/dashboards/trash'
                        }
                    },
                    active: false
                },
                {
                    title: this.$t('v2.dashboard.dataflow'),
                    icon: 'mdi-database-arrow-right-outline',
                    group: this.$t('v2.dashboard.myWork'),
                    children: {
                        listDataflow: {
                            title: 'list-dataflow',
                            link: '/report'
                        },
                        listTrashDataflow: {
                            title: 'list-trash-dataflow'
                        }
                    },
                    active: false
                },
                {
                    title: this.$t('v2.dashboard.relation'),
                    icon: 'mdi-relation-zero-or-many-to-zero-or-one',
                    group: this.$t('v2.dashboard.myWork'),
                    children: {
                        listRelation: {
                            title: 'list-relation',
                            link: '/report'
                        },
                        listTrashRelation: {
                            title: 'list-trash-relation'
                        }
                    },
                    active: false
                },
                {
                    title: this.$t('v2.dashboard.dataset'),
                    icon: 'mdi-view-module-outline',
                    group: this.$t('v2.dashboard.myWork'),
                    children: {
                        listDataset: {
                            title: 'list-dataset',
                            link: '/report'
                        },
                        listTrashDataset: {
                            title: 'list-trash-dataset'
                        }
                    },
                    active: false
                }
            ],
            showChevIcon: false,
            menuItemsHeight: '200px',
            selectingItem: {},
            selectingChildItem: {},
            isShowSidebar: true,
            drawer: false,
            mini: false,
            oldSelected: null
        };
    }
};
</script>
<style scoped>
.menu-group-active {
    background-color: #eaeaea;
    border-radius: 4px;
}
.sb-menu-icon .line {
    width: 18px;
    height: 2px;
    background-color: black;
    display: block;
    margin: 4px auto;
    -webkit-transition: all 0.3s ease-in-out;
    -o-transition: all 0.3s ease-in-out;
    transition: all 0.3s ease-in-out;
}

.sb-menu-icon:hover {
    cursor: pointer;
}

.sb-menu-icon.is-active .line:nth-child(1),
.sb-menu-icon.is-active .line:nth-child(3) {
    width: 11px;
    margin: -3px auto;
}

.sb-menu-icon.is-active .line:nth-child(1) {
    -webkit-transform: translateX(-7px) rotate(-45deg);
    -ms-transform: translateX(-7px) rotate(-45deg);
    -o-transform: translateX(-7px) rotate(-45deg);
    transform: translateX(-7px) rotate(-45deg);
}

.sb-menu-icon.is-active .line:nth-child(3) {
    -webkit-transform: translateX(-7px) rotate(45deg);
    -ms-transform: translateX(-7px) rotate(45deg);
    -o-transform: translateX(-7px) rotate(45deg);
    transform: translateX(-7px) rotate(45deg);
}
.sidebar-header {
    height: 44px;
    padding: 4px;
}
.sidebar-header img {
    margin: 5px 7px;
}
.sidebar-bottom {
    display: flex;
}
.sidebar-bottom button {
    margin-left: auto;
    margin-right: 12px;
    padding: 7px;
}
.sidebar-content {
    height: calc(100% - 40px);
}
.sidebar-content .v-list-item-project-info {
    padding: 0 !important;
}
.project-info {
    height: 40px;
    width: 100%;
    display: flex;
    transition: all ease-in-out 250ms;
    cursor: pointer;
    padding: 0 16px;
}
.project-info:hover {
    background: var(--symper-background-hover);
}
.project-info img {
    margin: 5px 10px 5px 0;
}
.project-info .project-name {
    width: calc(100% - 45px);
}
.project-info .project-name > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
}
.project-info .project-name > div:first-child {
    font-weight: 500;
}
.sidebar-content >>> .v-list-item__action:first-child,
.sidebar-content >>> .v-list-item__icon:first-child {
    margin-right: 18px !important;
}
.report-sidebar >>> .v-icon {
    color: black !important;
}
::v-deep .popup-select-project {
    position: absolute;
    top: 40px;
    left: 15px;
}
.sidebar-content >>> .ps__rail-x {
    display: none !important;
}
.sidebar-item {
    align-items: center;
    display: flex;
    flex: 1 1 100%;
    letter-spacing: normal;
    outline: none;
    position: relative;
    text-decoration: none;
}
.sidebar-content ::v-deep .v-icon {
    font-size: 18px;
}
.title-workspace {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: rgb(0, 0, 0, 0.6);
}
.collapse-sidebar-icon {
    position: absolute;
    top: 3px;
    transition: all 200ms cubic-bezier(0.42, 0, 0.58, 1);
}
.btn-collapsing {
    right: 0px;
    top: 3px;
    z-index: 1;
    transition: all 250ms ease-in-out;
}
.btn-collapsing:hover {
    background: beige;
}
.wrapper-sidebar {
    width: 210px !important;
    transition: all 200ms cubic-bezier(0.42, 0, 0.58, 1);
}
.wrapper-sidebar-mini {
    background: white;
    z-index: 1;
    border-right: var(--symper-border);
    border-top: var(--symper-border);
    border-bottom: var(--symper-border);
    box-shadow: var(--symper-box-shadow);
    height: calc(100% - 100px) !important;
    margin-top: 38px;
}
.wrapper-sidebar-full {
    background: white;
    border-right: var(--symper-border);
    height: 100%;
}
.slide-leave-active,
.slide-enter-active {
    transition: 0.3s cubic-bezier(0.42, 0, 0.58, 1);
}
.slide-enter {
    transform: translate(-100%, 0);
    opacity: 1;
}
.slide-enter-to {
    transform: translate(0, 0px);
}
.slide-leave-to {
    transform: translate(-100%, 0);
    opacity: 0;
}
.task-manager-sidebar {
    height: calc(100%);
    left: 0;
    font-size: 13px;
    z-index: 1;
}
.task-sidebar-item {
    padding: 0 !important;
}
.item-active >>> .v-list-item__icon .mdi {
    color: var(--symper-color) !important;
}
.item-active >>> .v-list-item__title {
    color: var(--symper-color) !important;
}
</style>
<style>
.report-sidebar {
    z-index: 2;
}
</style>

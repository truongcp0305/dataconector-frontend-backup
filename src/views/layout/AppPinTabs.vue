<template>
    <div
        :style="{
            width: realWidth,
            height: '40px'
        }"
        class="d-flex"
    >
        <!-- <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" small class="my-auto ml-1">
                    <i class="mdi mdi-arrow-left fs-18 "></i>
                </v-btn>
            </template>
            <span>{{$t('appTabs.back')}}</span>
        </v-tooltip>
        <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }" >
                <v-btn icon v-bind="attrs" v-on="on" small class="my-auto ml-1">
                    <i class="mdi mdi-arrow-right fs-18  "></i>
                </v-btn>
            </template>
            <span>{{$t('appTabs.forward')}}</span>
        </v-tooltip> -->

        <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
                <!-- <v-btn icon v-bind="attrs" v-on="on" small class="my-auto ml-1 mr-2" @click="pinCurrentPage">
                    <i class="mdi mdi-content-copy fs-16 "></i>
                </v-btn> -->
                <div
                    :class="{
                        'tab-pin': true,
                        'disable-tab': disableTab
                    }"
                    v-bind="attrs"
                    v-on="on"
                    @click="pinCurrentPage"
                    ref="pinBtn"
                >
                    <i class="mdi mdi-pin-outline fs-16"></i>
                </div>
            </template>
            <span>{{ $t('pin.pin_this_page') }}</span>
        </v-tooltip>

        <div
            class="symper-app-tabs"
            :style="{
                width: tabsWidth
            }"
        >
            <div
                class="docs-sheet-fade docs-sheet-fade-left"
                ref="fadeLeft"
                v-show="showFadeStart"
            >
                <div class="docs-sheet-fade3"></div>
                <div class="docs-sheet-fade2"></div>
                <!-- <div class="docs-sheet-fade1"></div> -->
            </div>
            <div
                class="docs-sheet-fade docs-sheet-fade-right"
                ref="fadeRight"
                v-show="showFadeEnd"
            >
                <!-- <div class="docs-sheet-fade1"></div> -->
                <div class="docs-sheet-fade2"></div>
                <div class="docs-sheet-fade3"></div>
            </div>
            <VuePerfectScrollbar
                ref="pscroll"
                @ps-scroll-x="handleScrollTab()"
                @ps-x-reach-end="handleScrollTab('end')"
                @ps-x-reach-start="handleScrollTab('start')"
            >
                <div
                    v-for="(tab, index) in tabs"
                    :key="index"
                    :class="{
                        'symper-tab text-ellipsis': true,
                        'tab-active': pinTabs.currentTabId == tab.id
                    }"
                    @click="selectTab(tab)"
                >
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <i
                                class="mdi mdi-home-outline fs-16 mr-1"
                                v-if="index == 0"
                                style="top: 1px; position: relative"
                            ></i>
                            <span v-bind="attrs" v-on="on">
                                {{ tab.title }}
                            </span>
                        </template>
                        <span>{{ tab.title }}</span>
                    </v-tooltip>
                    <i
                        v-if="index != 0"
                        class="mdi mdi-close close-tab"
                        @click.stop="closeTab(index)"
                    ></i>
                </div>
            </VuePerfectScrollbar>
        </div>
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { uiConfigApi } from '@/api/uiConfig';

var firstLoad = true;
export default {
    created() {
        this.restoreUIConfig();
        let self = this;
        this.$evtBus.$on('symper-app-add-tab', (data) => {
            window.SYMPER_APP.shortCutAddTap = false;
            self.addTab(data.title, data.path, data.name, data.params);
        });
    },
    components: {
        VuePerfectScrollbar
    },
    data() {
        return {
            tabsWidth: 'calc(100% - 50px)',
            showFadeStart: false,
            showFadeEnd: false,
            disableTab: true
        };
    },
    mounted() {
        // let pt = this.pinTabs;
        // for(let i = 0; i < 14; i++){
        //     pt.tabs.push(pt.tabs[0]);
        // }
    },
    watch: {
        'pinTabs.tabs': {
            deep: true,
            handler() {
                // this.saveTabData();
            }
        },
        width() {
            this.calcTabsWidth();
        },
        $route: {
            deep: true,
            handler() {
                let pt = this.pinTabs;
                if (firstLoad) {
                    if (!pt.tabs[0].stack.length) {
                        pt.tabs[0].stack.push(this.$route);
                    }
                    firstLoad = false;
                }
                let currentTab = pt.mapTab[pt.currentTabId];
                let key = history.state ? history.state.key : 'null';
                currentTab.browserPageKeys[key + ''] =
                    this.$route.params.pageInstanceKey;
            }
        },
        'pinTabs.currentTabId': {
            handler() {
                this.checkDisableTab();
            }
        }
    },
    methods: {
        async restoreUIConfig() {
            try {
                let res = await uiConfigApi.getUiConfig(this.getUIIden());
                if (res.status == 200) {
                    let info = JSON.parse(res.data.detail);
                    for (let i = 1; i < info.tabs.length; i++) {
                        let tab = info.tabs[i];
                        tab.currentIndex = 0;
                        tab.browserPageKeys = {};
                        this.pinTabs.tabs.push(tab);
                        this.pinTabs.mapTab[tab.id] = tab;
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                this.disableTab = false;
            }
        },
        saveTabData() {
            let dataToSave = {
                tabs: []
            };
            for (let t of this.pinTabs.tabs) {
                let page = t.stack[0];
                dataToSave.tabs.push({
                    currentIndex: t.currentIndex,
                    id: t.id,
                    origin: t.origin,
                    stack: [
                        {
                            name: page.name,
                            params: page.params,
                            path: page.path
                        }
                    ],
                    title: t.title
                });
            }

            uiConfigApi.saveUiConfig({
                widgetIdentifier: this.getUIIden(),
                detail: JSON.stringify(dataToSave)
            });
        },
        getUIIden() {
            let app = this.$store.state.app;
            let userId = app.baInfo
                ? app.baInfo.id + ':ba'
                : app.baInfo.endUserInfo.id + ':enduser';
            return `${userId}:app-tabs`;
        },
        checkFadeDisplay() {
            if (this.showFadeStart) {
                let ps = this.$refs.pscroll.ps;
                if (ps.contentWidth <= ps.containerWidth) {
                    this.showFadeStart = false;
                }
            }
        },
        handleScrollTab(status = 'middle') {
            if (status == 'middle') {
                this.showFadeEnd = true;
                this.showFadeStart = true;
            } else if (status == 'start') {
                this.showFadeEnd = true;
                this.showFadeStart = false;
            } else if (status == 'end') {
                this.showFadeEnd = false;
                this.checkFadeDisplay();
            }
        },
        calcTabsWidth() {
            let tabsWidth = this.width - 50;
            this.tabsWidth = tabsWidth + 'px';
        },
        closeTab(index) {
            let pt = this.pinTabs;
            let removeTab = pt.tabs[index];

            pt.tabs.splice(index, 1);
            if (removeTab.id == pt.currentTabId) {
                let newForcusTab = pt.tabs[index];
                if (!newForcusTab) {
                    newForcusTab = pt.tabs[pt.tabs.length - 1];
                }
                this.selectTab(newForcusTab);
            }

            let self = this;
            setTimeout(() => {
                self.saveTabData();
            }, 0);
        },
        selectTab(tab) {
            this.pinTabs.currentTabId = tab.id;

            let pinTabs = this.pinTabs;
            let currentTab = pinTabs.mapTab[tab.id];
            let currentPage = currentTab.stack[currentTab.currentIndex];
            // this.$router.push(currentPage);
            let extraData = currentPage.params.extraData
                ? currentPage.params.extraData
                : {};
            // window.needAddStateStack = false;
            window.backToFirstTab = false;
            this.$goToPage(
                currentPage.path,
                '',
                currentPage.params.pageInstanceKey,
                true,
                extraData
            );
        },
        checkDisableTab() {
            if (this.pinTabs.currentTabId == this.pinTabs.tabs[0].id) {
                this.disableTab = false;
            } else {
                this.disableTab = true;
            }
        },
        addTab(title, path, name, params) {
            let self = this;
            let pinTabs = this.$store.state.app.pinTabs;
            let newTab = {
                browserPageKeys: {},
                id: Date.now(), // id của tab này
                origin: '',
                title: title, // Tiêu đề hiển thị cho tab này
                stack: [
                    {
                        path: path,
                        name: name,
                        params: params ? params : {}
                    }
                ], // Stack các link đã visit của tab này
                currentIndex: 0 // index trong stack mà trang hiện tại thuộc về
            };
            pinTabs.tabs.push(newTab);
            pinTabs.mapTab[newTab.id] = newTab;
            pinTabs.currentTabId = newTab.id;
            let extraData = {};
            if (params) {
                params.extraData ? params.extraData : {};
            }
            window.backToFirstTab = false;
            this.$goToPage(path, '', Date.now(), true, extraData);
            setTimeout(() => {
                self.saveTabData();
            }, 0);
        },

        /**
         * Pin page hiện tại
         */
        pinCurrentPage() {
            if (this.disableTab) {
                return;
            }
            this.disableTab = true;
            let pinTabs = this.$store.state.app.pinTabs;
            if (pinTabs.tabs.length >= 20) {
                this.$snotifyWarning(
                    {},
                    this.$t('v2.general2.cannotAddTabTitle'),
                    this.$t('v2.general2.cannotAddTabContent')
                );
                return;
            }
            let currentTab = pinTabs.mapTab[pinTabs.currentTabId];
            let currentPage = this.$route;
            this.addTab(
                currentTab.title,
                currentPage.path,
                currentPage.name,
                currentPage.params
            );
        }
    },
    props: {
        width: {
            default: 'calc(100% - 500%)'
        }
    },
    computed: {
        realWidth() {
            return isNaN(this.width) ? this.width : this.width + 'px';
        },
        currentTabIndex: {
            get() {
                return this.$store.state.app.currentTabIndex;
            },
            set(value) {
                this.oldTabIndex = this.$store.state.app.currentTabIndex;
                this.$store.commit('app/updateCurrentTabIndex', value);
            }
        },
        tabUrlItems() {
            return Object.values(this.$store.state.app.urlToTabTitleMap);
        },
        tabs() {
            return this.$store.state.app.pinTabs.tabs;
        },
        pinTabs() {
            return this.$store.state.app.pinTabs;
        }
    }
};
</script>

<style scoped>
.tab-pin {
    display: inline-block;
    width: 50px;
    cursor: pointer;
    text-align: center;
    margin: auto;
    border-right: 1px solid #0000001a;
}

.symper-app-tabs {
    margin: auto;
    height: 26px;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    position: relative;
}

.symper-app-tabs .symper-tab {
    display: inline-block;
    max-width: 180px;
    padding-right: 20px;
    padding-left: 8px;
    height: 24px;
    line-height: 24px;
    border-right: 1px solid #0000001a;
    min-width: 50px;
    cursor: pointer;
    font-size: 13px;
    position: relative;
}
/* .symper-tab:first-child{
    border-left: 1px solid #0000001a;
} */

.symper-app-tabs .close-tab {
    position: absolute;
    right: 2px;
    top: 4px;
    font-size: 11px;
    color: #747474;
    cursor: context-menu;
    width: 15px;
    height: 16px;
    line-height: 16px;
    border-radius: 8px;
    text-align: center;
    visibility: collapse;
}

.symper-app-tabs .symper-tab:hover .close-tab {
    visibility: visible;
}

.symper-app-tabs .close-tab:hover {
    background-color: #e9e9e9;
}

.symper-app-tabs .symper-tab.tab-active {
    color: #ff8003;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.symper-app-tabs::-webkit-scrollbar {
    display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.symper-app-tabs {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
}

.symper-app-tabs >>> .ps__rail-x {
    background-color: white !important;
}
.symper-app-tabs >>> .ps__thumb-x,
.symper-app-tabs >>> .ps__rail-x {
    height: 6px !important;
    background-color: #e8e8e8;
}

.docs-sheet-fade {
    position: absolute;
    display: block;
    top: 0;
    width: 4px;
    height: 100%;
    z-index: 3;
}

.docs-sheet-fade-right {
    right: 0;
}

.docs-sheet-fade div {
    background-color: #d7d7d7;
    width: 2px;
    float: right;
    position: relative;
    height: 100%;
}

.docs-sheet-fade1 {
    opacity: 0.82;
    filter: alpha(opacity=82);
}

.docs-sheet-fade2 {
    opacity: 0.62;
    filter: alpha(opacity=62);
}

.docs-sheet-fade3 {
    opacity: 0.4;
    filter: alpha(opacity=40);
}
.docs-sheet-fade-left {
    left: 0;
}

.disable-tab {
    color: rgb(209, 209, 209);
}
</style>

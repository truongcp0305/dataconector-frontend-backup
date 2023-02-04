<template>
    <div :style="{ widh: realWidth }">
        <v-tabs
            hide-slider
            active-class="symper-tab-active"
            @change="handleChangeTab"
            v-model="currentTabIndex"
            class="sym-small-size"
            color="grey darken-4"
        >
            <v-tab
                class="symper-app-tab pr-6"
                v-for="(item, idx) in tabUrlItems"
                :key="idx"
            >
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <span v-bind="attrs" v-on="on">
                            {{ item.title }}
                        </span>
                    </template>
                    <span>{{ item.title }} </span>
                </v-tooltip>

                <i
                    class="mdi mdi-close float-right close-tab-btn"
                    @click.stop="handleCloseTab(idx)"
                ></i>
            </v-tab>
        </v-tabs>
    </div>
</template>

<script>
export default {
    created() {
        let self = this;
        this.$evtBus.$on('auto-active-tab', (tabIndex) => {
            self.$store.state.app.currentTabIndex = tabIndex;
            self.handleChangeTab(tabIndex);
        });

        this.$evtBus.$on('close-current-app-tab', () => {
            self.closeCurrentTab();
        });

        this.$evtBus.$on('close-app-tab', (idx) => {
            self.closeTab(idx);
        });
    },
    watch: {
        '$store.state.app.currentTabIndex': {
            immediate: true,
            handler(newVl, oldVl) {
                this.oldTabIndex = oldVl;
            },
        },
    },
    methods: {
        /**
         * Xử lý các tab
         */
        handleChangeTab(index) {
            if (index !== undefined) {
                let urlKey = Object.keys(this.tabUrlItems)[index];
                let urlInfo = this.tabUrlItems[urlKey];

                let oldTab = this.tabUrlItems[this.oldTabIndex];
                this.$evtBus.$emit('symper-app-before-switch-tab', {
                    from: oldTab,
                    to: urlInfo,
                });

                if (urlInfo.routeName == this.$route.name) {
                    this.$router.push({
                        name: 'symperHiddenRedirectComponent',
                        params: {
                            urlInfo: urlInfo,
                            pageInstanceKey: Date.now(),
                        },
                    });
                } else {
                    this.$router.push({
                        name: urlInfo.routeName,
                        params: urlInfo.routeParams,
                    });
                }

                this.$evtBus.$emit('symper-app-after-switch-tab', {
                    from: oldTab,
                    to: urlInfo,
                });
            }
        },
        handleCloseTab(idx) {
            this.$evtBus.$emit('before-close-app-tab', idx);
            this.closeTab(idx);
        },
        closeCurrentTab() {
            this.closeTab(this.$store.state.app.currentTabIndex);
        },
        closeTab(idx) {
            let urlToTabArr = Object.keys(
                this.$store.state.app.urlToTabTitleMap,
            );
            let urlKey = urlToTabArr[idx];
            let urlInfo = this.tabUrlItems[urlKey];

            this.$store.commit('app/removeTab', urlKey);
            if (urlInfo) {
                // this.$evtBus.$emit('symper-close-app-tab', {
                //     pageInstanceKey: urlInfo.pageInstanceKey
                // });
            }

            setTimeout(
                (self) => {
                    let arr = Object.keys(
                        self.$store.state.app.urlToTabTitleMap,
                    );
                    if (arr.length == 0) {
                        self.$goToPage('/', 'Trang chủ');
                    } else {
                        let currentTabIndex =
                            self.$store.state.app.currentTabIndex;
                        if (currentTabIndex == idx) {
                            self.handleChangeTab(currentTabIndex);
                        } else if (idx < currentTabIndex) {
                            self.$store.state.app.currentTabIndex =
                                currentTabIndex - 1;
                            self.handleChangeTab(currentTabIndex - 1);
                        }
                    }
                },
                100,
                this,
            );
        },
    },
    props: {
        width: {
            default: 'calc(100% - 500%)',
        },
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
            },
        },
        tabUrlItems() {
            return Object.values(this.$store.state.app.urlToTabTitleMap);
        },
    },
};
</script>

<style></style>

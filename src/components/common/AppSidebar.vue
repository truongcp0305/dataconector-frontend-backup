<template>
    <v-navigation-drawer
        :mini-variant="sapp.collapseSideBar"
        :v-model="true"
        app
    >
        <v-list dense nav class="py-0">
            <v-list-item
                :class="{ 'px-0': sapp.collapseSideBar }"
                v-show="!sapp.collapseSideBar"
            >
                <img
                    height="30px"
                    :src="require('./../../assets/image/symper-full-logo.png')"
                />
            </v-list-item>
            <v-list-item class="px-0" v-show="sapp.collapseSideBar">
                <img
                    height="30px"
                    :src="require('./../../assets/image/symper-short-logo.png')"
                />
            </v-list-item>

            <v-list-item two-line :class="{ 'px-0': sapp.collapseSideBar }">
                <v-list-item-avatar>
                    <img src="https://randomuser.me/api/portraits/men/81.jpg" />
                </v-list-item-avatar>

                <v-list-item-content>
                    <v-list-item-title>{{ sapp.userName }}</v-list-item-title>
                    <v-list-item-subtitle>
                        <v-menu bottom left>
                            <template v-slot:activator="{ on }">
                                <v-btn x-small v-on="on" depressed>{{
                                    sapp.currentRole.title
                                }}</v-btn>
                            </template>

                            <v-list dense>
                                <v-list-item
                                    v-for="(item, i) in sapp.roles"
                                    :key="i"
                                >
                                    <v-list-item-title>{{
                                        item.title
                                    }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>

            <v-list-item
                v-for="item in sapp.items"
                :key="item.title"
                link
                @click="gotoPage(item.link)"
            >
                <v-list-item-icon>
                    <v-tooltip right>
                        <template v-slot:activator="{ on }">
                            <v-icon v-on="on">{{ item.icon }}</v-icon>
                        </template>
                        <span>{{ item.title }}</span>
                    </v-tooltip>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
        <template v-slot:append>
            <v-list dense>
                <v-list-item v-show="sapp.collapseSideBar">
                    <v-list-item-icon>
                        <v-badge
                            v-if="sapp.unreadNotification > 0"
                            :content="sapp.unreadNotification"
                            :value="sapp.unreadNotification"
                            color="red"
                            overlap
                        >
                            <v-icon>mdi-bell-outline</v-icon>
                        </v-badge>
                        <v-icon v-else>mdi-bell-outline</v-icon>
                    </v-list-item-icon>
                </v-list-item>
                <v-list-item>
                    <v-list-item-icon>
                        <v-icon @click.stop="invertSidebarShow()"
                            >mdi-menu</v-icon
                        >
                        <v-badge
                            :content="sapp.unreadNotification"
                            v-show="!sapp.collapseSideBar"
                            :value="sapp.unreadNotification"
                            color="red"
                            v-if="sapp.unreadNotification > 0"
                            overlap
                        >
                            <v-icon class="ml-3">mdi-bell-outline</v-icon>
                        </v-badge>
                        <v-icon v-else class="ml-3">mdi-bell-outline</v-icon>
                    </v-list-item-icon>
                </v-list-item>
            </v-list>
        </template>
    </v-navigation-drawer>
</template>

<script>
export default {
    computed: {
        sapp() {
            return this.$store.state.app;
        },
    },
    watch: {
        'sapp.collapseSideBar': function (newVl) {},
    },
    methods: {
        invertSidebarShow() {
            this.$store.commit(
                'app/changeCollapseSidebar',
                !this.sapp.collapseSideBar,
            );
        },
        gotoPage(uri) {
            this.$router.push({
                path: uri,
            });
        },
    },
    data() {
        return {};
    },
};
</script>

<style></style>

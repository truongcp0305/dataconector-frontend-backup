<template>
    <div class="tab-view">
        <v-tabs v-model="tab" align-with-title color="orange" height="35">
            <v-tabs-slider color="orange"></v-tabs-slider>
            <v-tab
                v-for="(item, index) in listTabs"
                :key="listTabs[index]"
                class="px-2 fs-13 ml-0 view-tab"
                style="text-transform: none; font-weight: 500"
            >
                {{ item }}
            </v-tab>
        </v-tabs>
    </div>
</template>

<script>
export default {
    components: {},
    props: {
        listTabsView: {
            type: Object,
            default: {}
        },
        instanceKey: {
            default: ''
        }
    },
    created() {},
    beforeMount() {},
    computed: {
        listTabs() {
            let listTabs = [];
            Object.keys(this.listTabsView).map((key) => {
                listTabs.push(this.listTabsView[key].title);
            });
            return listTabs;
        }
    },
    data() {
        return {
            tab: null
        };
    },
    watch: {
        tab: function (val) {
            this.$emit('change-tab-view', val);
        }
    },
    methods: {
        changeTabView(val) {
            this.tab = val;
        }
    }
};
</script>
<style scoped>
.view-tab.v-tab:not(.v-tab--active) {
    color: black !important;
}
.view-tab.v-tab--active {
    text-underline-offset: 4px;
    text-decoration: underline 2px;
}
.tab-view >>> .v-tabs-slider-wrapper {
    display: none;
}
.view-tab.v-tab {
    min-width: 70px;
    margin: 0 !important;
}
.view-tab.v-tab:hover::before,
.view-tab.v-tab {
    border-radius: 4px;
}
</style>

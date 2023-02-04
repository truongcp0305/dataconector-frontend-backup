<template>
    <div class="h-100">
        <v-container
            fluid
            class="p-0 sidebar"
            v-if="mini"
            @click="mini = false"
        >
            <v-list>
                <v-list-item style="transform: rotate(90deg)">
                    <span
                        class="font-weight-regular subtitle-2 vertical-tab"
                        :class="{ 'tab-active': tab == 0 }"
                        @click="tab = 0"
                    >
                        {{ $t('sqlQueryIDE.tableStruct') }}
                    </span>
                </v-list-item>
            </v-list>
            <v-list class="mt-16 pt-3" style="transform: rotate(90deg)">
                <v-list-item>
                    <span
                        class="font-weight-regular subtitle-2 vertical-tab"
                        :class="{ 'tab-active': tab == 1 }"
                        @click="tab = 1"
                    >
                        {{ $t('sqlQueryIDE.keyword') }}
                    </span>
                </v-list-item>
            </v-list>
            <v-list class="mt-5">
                <v-list-item style="transform: rotate(90deg)">
                    <span
                        class="font-weight-regular subtitle-2 vertical-tab"
                        :class="{ 'tab-active': tab == 2 }"
                        @click="tab = 2"
                    >
                        {{ $t('sqlQueryIDE.history') }}
                    </span>
                </v-list-item>
            </v-list>
            <v-list class="mt-5">
                <v-list-item style="transform: rotate(90deg)">
                    <span
                        class="font-weight-regular subtitle-2 vertical-tab"
                        :class="{ 'tab-active': tab == 3 }"
                        @click="tab = 3"
                    >
                        {{ $t('sqlQueryIDE.params') }}
                    </span>
                </v-list-item>
            </v-list>
        </v-container>
        <div class="p-0 sidebar" v-else>
            <!-- Header sidebar -->
            <v-row class="mt-1 w-100">
                <v-col md="11" class="py-0 pe-0">
                    <v-tabs
                        color="#FF8003"
                        height="30px"
                        class="mt-1 ms-1"
                        v-model="tab"
                    >
                        <v-tab class="subtitle-2 font-weight-regular">{{
                            $t('sqlQueryIDE.tableStruct')
                        }}</v-tab>
                        <v-tab class="subtitle-2 font-weight-regular">{{
                            $t('sqlQueryIDE.keyword')
                        }}</v-tab>
                        <v-tab class="subtitle-2 font-weight-regular">{{
                            $t('sqlQueryIDE.history')
                        }}</v-tab>
                        <v-tab class="subtitle-2 font-weight-regular">{{
                            $t('sqlQueryIDE.params')
                        }}</v-tab>
                    </v-tabs>
                </v-col>
                <v-col md="1" class="py-1 ps-0">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-bind="attrs"
                                v-on="on"
                                @click="mini = true"
                                elevation="0"
                                icon
                                small
                                color="#666666"
                            >
                                <v-icon class="mdi-18px"
                                    >mdi-arrow-expand-right</v-icon
                                >
                            </v-btn>
                        </template>
                        <span>{{ $t('common.minimise') }}</span>
                    </v-tooltip>
                </v-col>
            </v-row>
            <!-- Header sidebar end -->

            <!-- Tabs sidebar -->
            <v-tabs-items
                v-model="tab"
                class="mt-1 w-100"
                v-show="!mini"
                style="height: calc(100% - 45px)"
            >
                <v-tab-item class="h-100">
                    <DataExplorer
                        ref="dataExplorer"
                        :contentRightWidth="contentRightWidth"
                    />
                </v-tab-item>
                <v-tab-item class="h-100">
                    <Variable />
                </v-tab-item>
                <v-tab-item class="h-100">
                    <History />
                </v-tab-item>
                <v-tab-item class="h-100">
                    <Input />
                </v-tab-item>
            </v-tabs-items>
            <!-- Tabs sidebar end -->
        </div>
    </div>
</template>

<script>
import SqlQueryDataExplorer from './SqlQueryDataExplorer.vue';
import SqlQueryVariable from './SqlQueryVariable.vue';
import SqlQueryHistory from './history/SqlQueryHistory.vue';
import SqlQueryInput from './SqlQueryInput.vue';

export default {
    props: {
        contentRightWidth: { type: String, default: '400px' },
    },
    components: {
        DataExplorer: SqlQueryDataExplorer,
        Variable: SqlQueryVariable,
        History: SqlQueryHistory,
        Input: SqlQueryInput,
    },
    data() {
        return {
            tab: 0,
            mini: false,
        };
    },
    methods: {},
    watch: {
        contentRightWidth(val) {
            this.$refs.dataExplorer.setContainerWidth(val);
        },
        mini(val) {
            this.$emit('collapse-side-bar', val);
        },
    },
};
</script>

<style scoped>
.sidebar {
    height: 100%;
    cursor: default;
    overflow: auto;
}
.sidebar:hover {
    cursor: default;
}
.v-window__container {
    height: 100% !important;
}
.theme--light.v-tabs >>> .v-tabs-bar .v-tab:not(.v-tab--active) {
    color: black;
}
.v-tab {
    text-transform: none !important;
}
.tab-active {
    color: #ff8003;
    font-weight: 500 !important;
}
.vertical-tab {
    white-space: nowrap;
}
.vertical-tab:hover {
    background-color: #f7f7f7;
}
</style>

<template>
    <div class="tab-view h-100">
        <!-- <v-tabs v-model="tab" align-with-title color="orange" height="35">
            <v-tabs-slider color="orange"></v-tabs-slider>
            <v-tab
                v-for="(item, index) in listTabs"
                :key="listTabs[index]"
                class="px-2 fs-13 ml-0 view-tab"
                style="text-transform: none; font-weight: 500"
            >
                {{ item }}
            </v-tab>
        </v-tabs> -->
        <tabView
            v-if="Object.keys(listTabsView).length > 1"
            :instanceKey="instanceKey"
            :listTabsView="listTabsView"
            @change-tab-view="
                (val) => {
                    tab = val;
                }
            "
        />

        <v-tabs-items v-model="tab" class="h-100">
            <v-tab-item> </v-tab-item>

            <v-tab-item class="h-100" v-if="listTabsView.Kanban">
                <EndUserKanban
                    :idDoc="idDoc"
                    :filterKanban="filterKanban"
                    :instanceKey="instanceKey"
                    :keySearch="searchKey"
                />
            </v-tab-item>

            <v-tab-item class="h-100" v-if="listTabsView.Scheduler">
                <Form_Scheduler
                    :idDoc="idDoc"
                    :instanceKey="instanceKey"
                    :filterScheduler="filterScheduler"
                    :userColumnControl="userColumnControl"
                    :viewModeScheduler="viewModeScheduler"
                />
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
import EndUserKanban from '@/views/kanban/EndUser/EndUserKanban';
import Form_Scheduler from '@/views/scheduler/Form_Scheduler';
import tabView from './TabView.vue';
export default {
    components: {
        tabView,
        Form_Scheduler,
        EndUserKanban
    },
    props: {
        filterKanban: {
            type: Object,
            default() {
                return Object;
            }
        },
        filterScheduler: {
            type: Object,
            default() {
                return {};
            }
        },
        idDoc: {
            type: String,
            default: ''
        },

        listTabsView: {
            type: Object,
            default() {
                return {};
            }
        },
        instanceKey: {
            default: ''
        },
        userColumnControl: {
            type: Array,
            default() {
                return [];
            }            
        },
        searchKey: {
            type: String,
            default: ''
        },
        viewModeScheduler: {
            type: String,
            default: ''
        }
    },
    created() {
        this.$evtBus.$on('set-tab-view', (tab) => {
            if (tab) {
                this.tab = tab;
            }
        });
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
    methods: {}
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
}
</style>

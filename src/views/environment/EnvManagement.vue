<template>
    <div class="d-flex flex-column w-100 h-100 environemt-management">
        <div class="d-flex align-center mt-2">
            <v-icon class="ml-2"> mdi-earth </v-icon>
            <span class="flex-grow-1 ml-2 fs-16 font-weight-bold">
                {{$t('v2.environment.listEnvironment')}}
            </span>
            <v-btn
                class="mr-2 font-normal fs-13"
                depressed
                @click="showSyncHistory"
            >
            {{$t('v2.environment.syncHistory')}}
            </v-btn>
            <v-text-field
                :label="$t('apps.search')"
                single-line
                solo
                dense
                class="mr-2 fs-13"
                append-icon="mdi-magnify"
                v-model="searchKey"
            ></v-text-field>
        </div>
        <div
            class="content-environment-management d-flex flex-column mt-2 ml-8 mr-8"
        >
            <VuePerfectScrollbar
                :style="{ height: containerHeight - 70 + 'px' }"
            >
                <v-expansion-panels accordion>
                    <v-expansion-panel
                        v-for="(item, i) in allEnvirontment"
                        :key="i"
                        @click="handleEnvClick(item)"
                    >
                        <v-expansion-panel-header v-if="item.show">
                            <div class="d-flex flex-column fs-13">
                                <div>
                                    {{ item.frontendDomain }}
                                </div>
                                <div class="mt-2 d-flex">
                                    <div style="width: 300px">
                                        {{$t('v2.environment.iD')}} {{ item.id }}
                                    </div>
                                    <span>
                                        {{$t('v2.environment.environmentType')}} {{ item.type }}
                                    </span>
                                </div>
                            </div>
                            <template v-slot:actions>
                                <v-icon color="success"
                                    >mdi-chevron-down</v-icon
                                >
                            </template>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content
                            class="fs-13"
                            v-if="item.show"
                        >
                            <div v-if="serviceInstanceInEnv">
                                <div
                                    v-for="(item, i) in serviceInstanceInEnv"
                                    style="width: 350px"
                                    :key="i"
                                >
                                    <span
                                        class="service-instance-title text-uppercase"
                                        @click="handleServiceClick(item)"
                                    >
                                        {{ item.serviceName }}
                                    </span>
                                    <span class="float-right">
                                        {{$t('v2.environment.version')}} {{ item.versionName }}
                                    </span>
                                </div>
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </VuePerfectScrollbar>
        </div>

        <ListObjectInService
            :showDialog="showDialog"
            :tableHeight="tableHeight"
            :apiUrl="apiUrl"
            @close-popup="handleCloseEvent"
        />
    </div>
</template>

<script>
import { util } from '@/plugins/util';
import ListObjectInService from './dialogs/ListObjectInService';
import { appConfigs } from '@/configs.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';

export default {
    components: {
        ListObjectInService,
        VuePerfectScrollbar,
    },
    props: {
        active: {
            type: String,
            default: '',
        },
        containerHeight: {
            type: Number,
        },
    },
    data() {
        return {
            searchKey: '',
            showDialog: false,
            showDialogAddItem: false,
            apiUrl: '',
            tableHeight: 0,
        };
    },
    computed: {
        allEnvirontment() {
            let self = this;
            let envs = this.$store.state.environmentManagement.allEnvironment;
            if (this.searchKey == '') {
                if (envs.length > 0) {
                    envs.forEach(function (e) {
                        e.show = true;
                    });
                }
            } else {
                envs.forEach(function (e) {
                    if (
                        e.frontendDomain
                            .toLowerCase()
                            .includes(self.searchKey.toLowerCase())
                    ) {
                        e.show = true;
                    } else {
                        e.show = false;
                    }
                });
            }

            return envs;
        },
        serviceInstanceInEnv() {
            let envData = this.$store.state.environmentManagement;
            return envData.serviceInstanceInEnv[envData.currentEnvId];
        },
    },

    mounted() {
        this.tableHeight = util.getComponentSize(this).h - 100;
        console.log(appConfigs.envDomain, 'appConfigsappConfigsappConfigs');
    },
    methods: {
        showDialogAdd() {
            this.showDialogAddItem = true;
        },
        handleCloseEvent() {
            this.showDialog = false;
        },
        cancelAdd() {
            this.showDialogAddItem = false;
        },
        showSyncHistory() {
            this.$goToPage('environment-sync-history', this.$t('v2.environment.syncHistory'));
        },
        handleEnvClick(env) {
            this.$store.dispatch(
                'environmentManagement/getInstanceInEnv',
                env.id,
            );
        },
        handleServiceClick(item) {
            this.$store.commit(
                'environmentManagement/setSourceInstanceId',
                item.id,
            );
            this.$store.commit(
                'environmentManagement/setCurrentServieId',
                item.serviceId,
            );
            let flag = this.$store.dispatch(
                'environmentManagement/getObjectTypeOfService',
                item,
            );
            if (flag) {
                this.showDialog = true;
            }
        },
    },
};
</script>

<style scoped>
.environemt-management >>> .v-text-field__slot,
.environemt-management >>> .v-text-field__slot label {
    font-size: 13px !important;
}
.environemt-management >>> .v-input__append-inner {
    font-size: 13px !important;
}
.environemt-management >>> .v-input__control {
    width: 30px !important;
    min-height: unset;
    height: 32px !important;
}
.environemt-management >>> .v-input__slot {
    background-color: #f7f7f7 !important;
    box-shadow: unset !important;
}
.environemt-management >>> .v-text-field__details {
    display: none !important;
}
.environemt-management >>> .v-list-item__content {
    padding: 2px;
}
.environemt-management >>> .v-list-item {
    border-bottom: 1px solid lightgray;
}
.environemt-management >>> .v-expansion-panel-header {
    padding: 8px !important;
}
.environemt-management >>> .v-expansion-panel,
.environemt-management >>> .v-expansion-panel::before {
    box-shadow: unset !important;
}
.environemt-management >>> .v-expansion-panel-header--active .v-icon {
    transform: unset !important;
}
.environemt-management >>> .service-instance-title {
    cursor: pointer;
}
.environemt-management >>> .service-instance-title:hover {
    border-bottom: 1px solid black;
}
</style>

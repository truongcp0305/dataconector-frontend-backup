<template>
    <div class="dialog-deploy">
        <v-dialog v-model="showDialog" persistent max-width="400">
            <v-card>
                <v-card-title class="fs-15"> {{$t('v2.environment.syncData')}} </v-card-title>
                <v-card-text>
                    <div
                        class="content-deploy-dialog d-flex flex-column ml-2 fs-13"
                    >
                        <div class="fs-13 mb-2 mt-2">
                            {{$t('v2.environment.syncDataToDomain')}}
                        </div>
                        <v-autocomplete
                            v-model="envId"
                            :items="allEnv"
                            item-text="frontendDomain"
                            item-value="id"
                            solo-inverted
                            class="fs-13"
                        ></v-autocomplete>
                        <div class="mt-1">
                            {{$t('v2.environment.syncRelativeDataWithMainData')}}
                        </div>

                        <div class="text-wrap">{{$t('v2.environment.pressOkToSyncData')}}</div>
                        <v-checkbox
                            v-model="override"
                            :label="$t('v2.environment.overwriteDuplicateData')"
                            value="1"
                            class="fs-13"
                        ></v-checkbox>
                        <v-checkbox
                            v-model="override"
                            class="fs-13"
                            :label="$t('v2.environment.onlySyncNotDuplicateData')"
                            value="0"
                        ></v-checkbox>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="cancel">
                        {{$t('v2.environment.cancel')}}
                    </v-btn>
                    <v-btn color="green darken-1" text @click="syncData">
                        {{$t('v2.environment.sync')}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import EnvironmentWorker from 'worker-loader!@/worker/environment/Environment.Worker.js';
export default {
    props: {
        showDialog: {
            type: Boolean,
            default: false,
        },
        listItemSelected: {
            type: Object,
            default() {
                return {};
            },
        },
        currentObjectType: {
            type: String,
        },
    },
    data() {
        return {
            override: null,
            envId: '',
            environmentWorker: null,
        };
    },
    created() {
        this.$store.dispatch('environmentManagement/getAllEnvirontment');
    },
    mounted() {
        this.environmentWorker = new EnvironmentWorker();
        let self = this;
        this.environmentWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'syncData':
                    self.handlerSyncData(data.dataAfter);
                    break;

                default:
                    break;
            }
        });
    },
    computed: {
        allEnv() {
            return this.$store.state.environmentManagement.allEnvironment;
        },
    },
    methods: {
        cancel() {
            this.$emit('cancel');
        },
        syncData() {
            let self = this;
            let sourceInstanceId =
                this.$store.state.environmentManagement.sourceInstanceId;
            let currentServiceId =
                this.$store.state.environmentManagement.currentServiceId;
            let currentEnvId = this.envId;
            this.environmentWorker.postMessage({
                action: 'syncData',
                data: {
                    dataGetServerId: {
                        serviceId: currentServiceId,
                        environmentId: currentEnvId,
                    },
                    listItemSelected: self.listItemSelected,
                    dataSync: {
                        sourceInstanceId: sourceInstanceId,
                        override: self.override,
                    },
                },
            });
        },
        handlerSyncData(res) {
            let self = this;
            if (res.length > 0) {
                res.forEach(function (e) {
                    if (e.status == 200) {
                        self.$snotifySuccess(this.$t('v2.environment.dataTransfer'));
                    } else if (e.status == 400) {
                        self.$snotifyError(
                            this.$t('v2.environment.errDuplicateSourceAndTarget'),
                        );
                    } else {
                        self.$snotifyError(this.$t('v2.environment.errDetect'));
                    }
                });
            }
            self.$emit('success');
        },
    },
};
</script>

<style scoped>
.content-deploy-dialog >>> .v-text-field__details {
    display: none !important;
}
.content-deploy-dialog >>> .v-input__slot {
    box-shadow: unset !important;
    min-height: unset !important;
}
.content-deploy-dialog >>> input {
    font-size: 13px !important;
}
.content-deploy-dialog >>> .v-menu {
    font-size: 13px !important;
}
.content-deploy-dialog >>> label {
    font-size: 13px !important;
}
.content-deploy-dialog >>> .v-messages {
    display: none !important;
}
.content-deploy-dialog >>> .v-input__control {
    margin-bottom: -12px !important;
}
</style>

<template>
    <div class="dialog-deploy">
        <v-dialog v-model="showDialog" persistent max-width="400">
            <v-card>
                <v-card-title class="fs-15">
                    {{$t('v2.environment.syncDataToCurrentDomain')}}
                </v-card-title>
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
            type: Array,
            default() {
                return [];
            },
        },
        currentObjectType: {
            type: String,
        },
    },
    data() {
        return {
            override: null,
            environmentWorker: null,
            envId: '',
        };
    },
    created() {
        this.environmentWorker = new EnvironmentWorker();
        this.$store.dispatch('environmentManagement/getAllEnvirontment');
    },
    mounted() {
        let self = this;
        this.environmentWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'migrateData':
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
        handlerSyncData(res) {
            if (res.status == 200) {
                this.$snotify({
                    type: 'success',
                    title: this.$t('v2.environment.dataTransfer'),
                });
            } else if (res.status == 400) {
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.environment.errDuplicateSourceAndTarget'),
                });
            }
        },
        syncData() {
            let self = this;
            let sourceInstanceId =
                this.$store.state.environmentManagement.sourceInstanceId;
            let currentServiceId =
                this.$store.state.environmentManagement.currentServiceId;
            let currentEnvId = this.envId;
            let type = self.currentObjectType;
            let arr = [];
            for (let i in self.listItemSelected) {
                let id = self.listItemSelected[i].document_object_id
                    ? self.listItemSelected[i].document_object_id
                    : self.listItemSelected[i].id;
                if (id) {
                    arr.push(id);
                }
            }
            let ids = {
                ids: arr,
            };
            let data = {
                [type]: ids,
            };
            this.environmentWorker.postMessage({
                action: 'migrateData',
                data: {
                    dataGetServerId: {
                        serviceId: currentServiceId,
                        environmentId: currentEnvId,
                    },
                    formData: {
                        sourceInstanceId: sourceInstanceId,
                        data: JSON.stringify(data),
                        override: self.override,
                    },
                },
            });
            this.$snotifySuccess($t('v2.environment.processingPleaseWaitForTheResults'));
            this.$emit('success');
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

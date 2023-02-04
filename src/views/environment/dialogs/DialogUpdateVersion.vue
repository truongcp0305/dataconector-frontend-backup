<template>
    <div class="dialog-deploy">
        <v-dialog v-model="showDialog" persistent max-width="400">
            <v-card>
                <v-card-title class="fs-15"> {{$t('v2.environment.updateVersion')}} </v-card-title>
                <v-card-text>
                    <div
                        class="content-deploy-dialog d-flex flex-column ml-2 fs-13"
                    >
                        <div class="fs-13 mb-2 mt-2">
                            {{$t('v2.environment.choseEnvToUpdateVersion')}}
                        </div>
                        <v-autocomplete
                            v-model="envId"
                            :items="allEnv"
                            item-text="name"
                            item-value="id"
                            solo-inverted
                            class="fs-13"
                        ></v-autocomplete>
                        <div class="text-wrap">
                            {{$t('v2.environment.pressOkToUpdateVersion')}}
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="cancel">
                        {{$t('v2.environment.cancel')}}
                    </v-btn>
                    <v-btn color="green darken-1" text @click="updateVersion">
                        {{$t('v2.environment.ok')}}
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
    },
    data() {
        return {
            selected: '',
            environmentWorker: null,
            envId: '',
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
                case 'updateVersion':
                    self.handlerUpdateVersion(data.dataAfter);
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
        handlerUpdateVersion(res) {
            if (res.status == 200) {
                this.$snotify({
                    type: 'success',
                    title: this.$t('v2.environment.success'),
                });
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.environment.errDetect'),
                });
            }
            this.$emit('cancel');
        },
        updateVersion() {
            let self = this;
            let serviceId = this.$route.params.serviceId;
            let versionId =
                this.$store.state.environmentManagement.currentVersionId;
            let data = {
                serviceId: serviceId,
                environmentId: this.envId,
            };
            this.environmentWorker.postMessage({
                action: 'updateVersion',
                data: {
                    versionId: versionId,
                    environmentId: self.envId,
                    dataGetServerId: data,
                },
            });
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
</style>

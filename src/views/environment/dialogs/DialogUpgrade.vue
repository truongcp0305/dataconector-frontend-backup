<template>
    <div class="dialog-deploy">
        <v-dialog v-model="showDialog" persistent max-width="400">
            <v-card>
                <v-card-title class="fs-15"> Upgrade version </v-card-title>
                <v-card-text>
                    <div
                        class="content-deploy-dialog d-flex flex-column ml-2 fs-13"
                    >
                        <div class="fs-13 mb-2 mt-2">
                            {{$t('v2.environment.choseEnvToUpdateVersion')}}
                        </div>
                        <v-autocomplete
                            v-model="verId"
                            :items="allVer"
                            item-text="versionName"
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
                    <v-btn color="green darken-1" text @click="upgradeVersion">
                        {{$t('v2.environment.upgrade')}}
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
        currentInstance: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            selected: '',
            environmentWorker: null,
            verId: '',
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
                case 'upgradeVersion':
                    self.handlerUpgradeVersion(data.dataAfter);
                    break;
                default:
                    break;
            }
        });
    },
    computed: {
        allVer() {
            let envStore = this.$store.state.environmentManagement;
            return envStore.allVersionOfService[envStore.currentServiceType];
        },
    },
    methods: {
        cancel() {
            this.$emit('cancel');
        },
        handlerUpgradeVersion(res) {
            if (res.status == 200) {
                this.$snotify({
                    type: 'success',
                    title: this.$t('v2.environment.deploySuccess'),
                });
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.environment.errDetect'),
                });
            }
        },
        upgradeVersion() {
            let self = this;
            let formData = {
                serverId: this.currentInstance.serverId,
                versionId: this.verId,
                environmentId: this.currentInstance.environmentId,
            };
            self.$emit('cancel');
            self.$snotify({
                type: 'success',
                title: this.$t('v2.environment.processingPleaseWaitForTheResults'),
            });
            this.environmentWorker.postMessage({
                action: 'upgradeVersion',
                data: {
                    formData: formData,
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

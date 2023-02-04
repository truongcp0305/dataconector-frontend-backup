<template>
    <div class="dialog-deploy">
        <v-dialog v-model="showDialog" persistent max-width="400">
            <v-card>
                <v-card-title class="fs-15"> {{$t('v2.environment.changeServer')}}</v-card-title>
                <v-card-text>
                    <div
                        class="content-deploy-dialog d-flex flex-column ml-2 fs-13"
                    >
                        <div class="fs-13 mb-2 mt-2">
                            {{$t('v2.environment.choseServerToChange')}}
                        </div>
                        <v-autocomplete
                            v-model="serverId"
                            :items="allServer"
                            item-text="ip"
                            item-value="id"
                            solo-inverted
                            class="fs-13"
                        ></v-autocomplete>
                        <div class="fs-13 mb-2 mt-2">
                            {{$t('v2.environment.databaseName')}}
                        </div>
                        <v-text-field
                            v-model="dbName"
                            single-line
                            class="fs-13"
                            solo
                        ></v-text-field>
                        <div class="text-wrap">{{$t('v2.environment.pressOkToChangeServe')}}</div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="cancel">
                        {{$t('v2.environment.cancel')}}
                    </v-btn>
                    <v-btn color="green darken-1" text @click="changeServer">
                        {{$t('v2.environment.ok')}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import EnvironmentWorker from 'worker-loader!@/worker/environment/Environment.Worker.js';
import { environmentManagementApi } from '@/api/EnvironmentManagement';
export default {
    props: {
        showDialog: {
            type: Boolean,
            default: false,
        },
        allServer: {
            type: Array,
        },
        instanceId: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            serverId: '',
            environmentWorker: null,
            dbName: '',
        };
    },
    watch: {
        instanceId(val) {
            (this.serverId = ''), (this.dbName = '');
        },
    },
    mounted() {
        let self = this;
        this.environmentWorker = new EnvironmentWorker();
        this.environmentWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'changeServer':
                    self.handlerChangeServer(data.dataAfter);
                    break;

                default:
                    break;
            }
        });
    },
    methods: {
        cancel() {
            this.$emit('cancel');
        },
        handlerChangeServer(res) {
            if (res.status == 200) {
                this.$emit('success');
                this.$snotify({
                    type: 'success',
                    title: this.$t('v2.environment.changeServerSuccess'),
                });
            } else {
                this.$snotify({
                    type: 'error',
                    title: err,
                });
            }
        },
        changeServer() {
            let data = {
                instanceId: this.instanceId,
                serverId: this.serverId,
                dbName: this.dbName,
            };
            let self = this;
            this.environmentWorker.postMessage({
                action: 'changeServer',
                data: data,
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
    background-color: #f0f0f0 !important;
}
.content-deploy-dialog >>> input {
    font-size: 13px !important;
}
.content-deploy-dialog >>> .v-menu {
    font-size: 13px !important;
}
</style>

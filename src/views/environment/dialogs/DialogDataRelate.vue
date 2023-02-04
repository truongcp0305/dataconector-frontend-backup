<template>
    <div class="dialog-deploy">
        <v-dialog v-model="showDialog" persistent max-width="400">
            <v-card>
                <v-card-title class="fs-15">{{$t('v2.environment.checkData')}} </v-card-title>
                <v-card-text>
                    <div
                        class="content-deploy-dialog d-flex flex-column ml-2 fs-13"
                    >
                        <div class="fs-13 mb-2 mt-2">
                            {{$t('v2.environment.recordsRelatedData')}}
                        </div>
                        <div v-for="(item, i) in listItem" :key="i">
                            <v-checkbox
                                v-model="listItemSelected"
                                :value="item"
                            >
                                <template v-slot:label>
                                    <div class="d-flex fs-13 w-100">
                                        <div class="flex-grow-1">
                                            {{ item.title }}
                                        </div>
                                        <span style="float: right">
                                            {{ item.total }}
                                        </span>
                                    </div>
                                </template>
                            </v-checkbox>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="cancel">
                        {{$t('v2.environment.cancel')}}
                    </v-btn>
                    <v-btn
                        color="green darken-1"
                        text
                        :disable="Object.keys(listItemSelected).length == 0"
                        @click="syncRelatedData"
                    >
                        {{$t('v2.environment.sync')}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <DialogSyncRelatedData
            :showDialog="showDialogSync"
            @cancel="cancel"
            :listItemSelected="listItemSelected"
        />
    </div>
</template>

<script>
import { environmentManagementApi } from '@/api/EnvironmentManagement';
import DialogSyncRelatedData from './DialogSyncRelatedData';
export default {
    components: {
        DialogSyncRelatedData,
    },
    props: {
        showDialog: {
            type: Boolean,
            default: false,
        },
        currentItem: {
            type: Object,
        },
    },
    data() {
        return {
            selected: '',
            envId: '',
            listItem: [],
            listItemSelected: {},
            showDialogSync: false,
        };
    },
    created() {
        this.$store.dispatch('environmentManagement/getAllEnvirontment');
    },
    computed: {
        allEnv() {
            return this.$store.state.environmentManagement.allEnvironment;
        },
    },
    methods: {
        cancel() {
            this.$emit('cancel'), (this.showDialogSync = false);
            this.listItemSelected = {};
        },
        syncRelatedData() {
            this.showDialogSync = true;
        },
    },
    watch: {
        currentItem: {
            deep: true,
            immediate: true,
            handler(obj) {
                let self = this;
                self.listItem = [];
                self.listItemSelected = {};
                if (Object.keys(obj).length > 0) {
                    for (let i in obj) {
                        if (!(obj[i] == '' || obj[i] == null)) {
                            if (i == 'document_definition') {
                                self.listItem.push({
                                    title: i,
                                    total: obj[i].length,
                                    arr: obj[i],
                                });
                            } else {
                                self.listItem.push({
                                    title: i,
                                    total: 1,
                                    arr: obj[i],
                                });
                            }
                        }
                    }
                }
            },
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
.content-deploy-dialog >>> .v-messages {
    display: none;
}
</style>

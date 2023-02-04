<template>
    <div class="dialog-assign">
        <v-dialog v-model="showDialog" persistent max-width="400">
            <v-card>
                <v-card-title class="fs-15">
                    {{ $t('myItem.taskLifeCycle.dialog.unClaim.header') }}
                </v-card-title>
                <v-card-text>
                    <div
                        class="content-assign-dialog d-flex flex-column ml-2 fs-13"
                    >
                        <div class="text-wrap">
                            {{
                                $t(
                                    'myItem.taskLifeCycle.dialog.unClaim.description',
                                )
                            }}
                        </div>
                        <div class="text-wrap d-flex align-center">
                            {{ $t('myItem.taskLifeCycle.currentStatus') }}
                            <v-chip
                                small
                                label
                                class="ma-2"
                                color="orange"
                                text-color="white"
                            >
                                <span class="fs-13">
                                    {{ $t('tasks.assign') }}
                                </span>
                            </v-chip>
                        </div>
                        <div class="text-wrap d-flex align-center">
                            {{ $t('myItem.taskLifeCycle.newStatus') }}
                            <v-chip
                                small
                                label
                                class="ma-2"
                                color="#ED6A5E"
                                text-color="white"
                            >
                                <span class="fs-13">
                                    {{ $t('tasks.unAssign') }}
                                </span>
                            </v-chip>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="cancel">
                        {{ $t('myItem.taskLifeCycle.cancel') }}
                    </v-btn>
                    <v-btn color="green darken-1" text @click="unClaimTask">
                        {{ $t('myItem.taskLifeCycle.corfirm') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import workFlowApi from '@/api/BPMNEngine.js';
export default {
    props: {
        showDialog: {
            type: Boolean,
            default: false,
        },
        taskId: {
            type: String,
            default: ' ',
        },
    },
    data() {
        return {
            selected: '',
            verId: '',
        };
    },
    created() {},

    methods: {
        cancel() {
            this.$emit('cancel');
        },
        unClaimTask() {
            let data = {
                assignee: null,
                owner: null,
            };
            let self = this;
            workFlowApi
                .updateTask(this.taskId, data)
                .then((res) => {
                    self.$snotify({
                        type: 'success',
                        title: self.$t('myItem.taskLifeCycle.notify.unClaim'),
                    });
                    self.$emit('success');
                })
                .catch((err) => {});
        },
    },
};
</script>

<style scoped>
.content-assign-dialog >>> .v-text-field__details {
    display: none !important;
}
.content-assign-dialog >>> .v-input__slot {
    box-shadow: unset !important;
    min-height: unset !important;
}
.content-assign-dialog >>> input {
    font-size: 13px !important;
}
.content-assign-dialog >>> .v-menu {
    font-size: 13px !important;
}
</style>

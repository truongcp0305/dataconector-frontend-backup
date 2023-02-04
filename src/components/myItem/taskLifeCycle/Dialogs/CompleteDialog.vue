<template>
    <div class="dialog-assign">
        <v-dialog v-model="showDialog" persistent max-width="400">
            <v-card>
                <v-card-title class="fs-15">
                    {{ $t('myItem.taskLifeCycle.dialog.complete.header') }}
                </v-card-title>
                <v-card-text>
                    <div
                        class="
                            content-assign-dialog
                            d-flex
                            flex-column
                            ml-2
                            fs-13
                        "
                    >
                        <div class="text-wrap">
                            {{
                                $t(
                                    'myItem.taskLifeCycle.dialog.complete.description'
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
                                color="success"
                                text-color="white"
                            >
                                <span class="fs-13">
                                    {{ $t('tasks.complete') }}
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
                    <v-btn
                        color="green darken-1"
                        text
                        :loading="loading"
                        @click="completeTask"
                    >
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
            default: false
        },
        taskId: {
            type: String,
            default: ''
        },
        taskInfo: {
            type: Object,
            default() {
                return {};
            }
        },
        varsForBackend: {
            type: Object,
            default() {
                return {};
            }
        },
        repeatSubmit: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            loading: false
        };
    },
    created() {},

    methods: {
        cancel() {
            this.$emit('cancel');
        },
        async completeTask() {
            this.loading = true;
            this.$emit('on-task-complete-clicked');
        },
        async postTask(taskData) {
            let self = this;

            return new Promise(async (resolve, reject) => {
                try {
                    let result;
                    let flag = true;
                    try {
                        result = await workFlowApi.actionOnTask(
                            self.taskId,
                            taskData
                        );
                    } catch (err) {
                        if (err.status == 404) {
                            self.$snotifyInfo(
                                '',
                                self.$t('v2.myItem.notFoundTask')
                            );
                        } else {
                            self.$snotifyError(
                                '',
                                JSON.parse(err.responseText).exception
                            );
                        }
                        flag = false;
                        self.loading = false;
                    }
                    if (flag) {
                        if (!self.repeatSubmit) {
                            self.$snotify({
                                type: 'success',
                                title: self.$t(
                                    'myItem.taskLifeCycle.notify.complete'
                                )
                            });
                        }
                        self.$evtBus.$emit(
                            'myitem-complete-task-success',
                            taskData
                        );
                        resolve(result);
                    }
                } catch (error) {
                    let detail = '';
                    if (error.responseText) {
                        detail = JSON.parse(error.responseText);
                        detail = detail.exception;
                    }
                    self.$snotifyError(
                        error,
                        self.$t('v2.myItem.canNotSubmitTask'),
                        detail
                    );
                    reject(error);
                }
            });
        }
    }
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

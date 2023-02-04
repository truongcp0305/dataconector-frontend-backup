<template>
    <div class="dialog-assign">
        <v-dialog v-model="showDialog" persistent max-width="400">
            <v-card>
                <v-card-title class="fs-15">
                    {{ $t('myItem.taskLifeCycle.dialog.assign.header') }}
                </v-card-title>
                <v-card-text>
                    <div
                        class="content-assign-dialog d-flex flex-column ml-2 fs-13"
                    >
                        <div class="text-wrap">
                            {{
                                $t(
                                    'myItem.taskLifeCycle.dialog.assign.description',
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
                        <div class="text-wrap font-weight-light">
                            {{
                                $t(
                                    'myItem.taskLifeCycle.dialog.assign.workStatus',
                                )
                            }}
                            <span style="color: blue">
                                {{
                                    originData.assigneeInfo
                                        ? originData.assigneeInfo.displayName
                                        : ''
                                }}
                            </span>
                        </div>
                        <div class="text-wrap d-flex align-center mt-2">
                            <div class="mb-4 mr-2">
                                {{ $t('myItem.taskLifeCycle.assignee') }}
                            </div>
                            <div>
                                <v-autocomplete
                                    solo
                                    v-model="userInforId"
                                    :items="$store.state.app.allUsers"
                                    item-text="displayName"
                                    item-value="id"
                                ></v-autocomplete>
                            </div>
                        </div>
                        <div class="text-wrap mt-2">
                            {{ $t('myItem.taskLifeCycle.assigneePermission') }}
                        </div>
                        <div class="text-wrap d-flex align-center">
                            {{ $t('myItem.taskLifeCycle.newStatus') }}
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
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="cancel">
                        {{ $t('myItem.taskLifeCycle.cancel') }}
                    </v-btn>
                    <v-btn color="green darken-1" text @click="reAssignTask">
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
        originData: {
            type: Object,
        },
    },
    data() {
        return {
            userInforId: '',
        };
    },
    created() {},

    methods: {
        cancel() {
            this.$emit('cancel');
        },
        reAssignTask() {
            let data = {
                owner: this.originData.ownerInfo.id,
                assignee: this.userInforId,
            };
            workFlowApi
                .updateTask(this.originData.id, data)
                .then((res) => {})
                .catch((err) => {});
            this.$snotify({
                type: 'success',
                title: this.$t('myItem.taskLifeCycle.notify.assign'),
            });
            this.$emit('success');
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
    border: 1px solid lightgray;
}
.content-assign-dialog >>> input {
    font-size: 13px !important;
}
.content-assign-dialog >>> .v-menu {
    font-size: 13px !important;
}
</style>

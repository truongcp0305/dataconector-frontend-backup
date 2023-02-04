<template>
    <div class="dialog-assign">
        <v-dialog v-model="showDialog" persistent max-width="400">
            <v-card>
                <v-card-title class="fs-15">
                    {{ $t('myItem.taskLifeCycle.dialog.resolve.header') }}
                </v-card-title>
                <v-card-text>
                    <div
                        class="content-assign-dialog d-flex flex-column ml-2 fs-13"
                    >
                        {{
                            $t(
                                'myItem.taskLifeCycle.dialog.resolve.description',
                            )
                        }}
                        <div class="text-wrap"></div>
                        <div class="text-wrap d-flex">
                            <v-icon x-small> mdi-account-check-outline </v-icon>
                            <span class="mr-1 ml-1">
                                {{ $t('myItem.taskLifeCycle.workDelegated') }}
                            </span>
                            <span style="color: blue">
                                {{
                                    originData.assigneeInfo
                                        ? originData.assigneeInfo.displayName
                                        : ''
                                }}</span
                            >
                        </div>
                        <div class="text-wrap d-flex">
                            <v-icon x-small> mdi-account-tie-outline </v-icon>
                            <span class="ml-1 mr-1">
                                {{ $t('myItem.taskLifeCycle.owner') }}
                            </span>
                            <span style="color: blue">{{
                                originData.ownerInfo
                                    ? originData.ownerInfo.displayName
                                    : ''
                            }}</span>
                        </div>
                        <div class="text-wrap d-flex align-center">
                            {{ $t('myItem.taskLifeCycle.currentStatus') }}
                            <v-chip
                                small
                                label
                                class="ma-2"
                                color="#8E2D8C"
                                text-color="white"
                            >
                                <span class="fs-13">
                                    {{ $t('tasks.delegate') }}
                                </span>
                            </v-chip>
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
                    <v-btn color="green darken-1" text @click="resolveTask">
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
            default: '',
        },
        originData: {
            type: Object,
        },
    },
    data() {
        return {
            selected: '',
            verId: '',
        };
    },
    created() {},
    watch: {
        originData: {
            deep: true,
            immediate: true,
            handler(obj) {},
        },
    },

    methods: {
        cancel() {
            this.$emit('cancel');
        },
        resolveTask() {
            let data = {
                action: 'resolve',
            };
            workFlowApi
                .changeTaskAction(this.taskId, data)
                .then((res) => {})
                .catch((err) => {});
            this.$snotify({
                type: 'success',
                title: this.$t('myItem.taskLifeCycle.notify.resolve'),
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
}
.content-assign-dialog >>> input {
    font-size: 13px !important;
}
.content-assign-dialog >>> .v-menu {
    font-size: 13px !important;
}
</style>

<template>
    <v-dialog v-model="showDialog" width="400">
        <v-card>
            <v-card-title>{{ $t('tasks.createTask.title') }}</v-card-title>
            <div class="mr-0 ml-0 pl-6 pr-6">
                <div class="label pt-2">{{ $t('tasks.header.name') }}</div>
                <div>
                    <v-text-field
                        class="sym-small-size"
                        dense
                        solo
                        flat
                        background-color=" grey lighten-3"
                        v-model="taskObject.name"
                    ></v-text-field>
                </div>
                <div class="label pt-2">
                    {{ $t('tasks.header.assignee') }}
                </div>
                <div>
                    <userSelector
                        ref="userSelector"
                        :isMulti="false"
                        :compactChip="true"
                        :color="'transparent'"
                        :textColor="''"
                        :flat="true"
                        @input="inputAssignee"
                    ></userSelector>
                </div>
                <div class="label pt-2">
                    {{ $t('tasks.header.dueDate') }}
                </div>
                <div>
                    <datePicker v-model="taskObject.dueDate"></datePicker>
                </div>

                <div class="label pt-2">
                    {{ $t('tasks.header.submitForm') }}
                </div>
                <div>
                    <SymperDocSelect
                        v-model="taskObject.docId"
                    ></SymperDocSelect>
                </div>
                <div class="label pt-2">
                    {{ $t('tasks.header.description') }}
                </div>
                <div>
                    <v-textarea
                        class="sym-small-size sym-small-lineheight"
                        dense
                        solo
                        flat
                        background-color="grey lighten-3"
                        v-model="taskObject.description"
                    ></v-textarea>
                </div>
            </div>
            <v-card-actions class="pt-4">
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    small
                    :disabled="
                        taskObject.name.length == 0 ||
                        taskObject.dueDate.length == 0 ||
                        taskObject.assignee.length == 0
                    "
                    @click="saveTask"
                    :loading="loading"
                    >{{ $t('common.add') }}</v-btn
                >
                <v-btn text small @click="hide" class="mr-2">{{
                    $t('common.close')
                }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import UserSelector from '@/components/myItem/UserSelector.vue';
import SymperDocSelect from '@/components/common/symperInputs/SymperDocumentSelect.vue';
import DatePicker from '@/components/common/datePicker';
import { defaultTaskDescription } from '@/components/process/elementDefinitions/customExtToModel';
import { util } from '@/plugins/util';
import BPMNEngine from '@/api/BPMNEngine';
import { getAssigneeForRunProcess } from '@/components/process/processAction';

export default {
    data() {
        return {
            showDialog: false,
            loading: false,
        };
    },
    props: {
        taskObject: {
            type: Object,
            default() {
                return {};
            },
        },
        parentTaskId: {
            type: String,
            default: '',
        },
    },
    components: {
        UserSelector,
        SymperDocSelect,
        DatePicker,
    },
    methods: {
        show() {
            this.showDialog = true;
        },
        hide() {
            this.showDialog = false;
        },
        async saveTask() {
            this.loading = true;
            if (!this.taskObject.assignee) {
                this.$snotifyError(
                    {},
                    this.$t('tasks.error.canNotCreateTask'),
                    this.$t('tasks.error.emptyAssignee'),
                );
                return;
            }
            let data = {
                ...this.taskObject,
                assignee: this.taskObject.assignee,
                parentTaskId: this.parentTaskId ? this.parentTaskId : '',
                owner: getAssigneeForRunProcess(),
            };
            let description = util.cloneDeep(defaultTaskDescription);
            description.action.module = 'task';
            description.action.resource = 'task';
            if (this.taskObject.docId) {
                description.action.action = 'submit';
                description.action.parameter.documentId = this.taskObject.docId;
            } else {
                description.action.action = 'submitAdhocTask';
            }

            description.content = this.taskObject.name;

            if (
                this.taskObject.description == '' ||
                this.taskObject.description == null
            ) {
                description.extraLabel = this.$t(
                    'tasks.header.alertDescription',
                );
            } else {
                description.extraLabel = this.taskObject.description;
            }
            data.description = JSON.stringify(description);
            let res = await BPMNEngine.addTask(JSON.stringify(data));
            if (res.id != undefined) {
                this.selectedProcess = null;
                this.$emit('create-task', res);
                this.$snotifySuccess(this.$t('tasks.created'));
            } else {
                this.showError();
            }
            this.loading = false;
            this.hide();
        },
        inputAssignee(data) {
            this.taskObject.assignee = data;
        },
        showError() {
            this.$snotify({
                type: 'error',
                title: this.$t('notification.errorTitle'),
                text: this.$t('notification.error'),
            });
        },
    },
};
</script>

<style></style>

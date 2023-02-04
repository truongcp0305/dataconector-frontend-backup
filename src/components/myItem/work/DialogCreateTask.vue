<template>
    <v-dialog v-model="showCreateTask" width="400">
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
                <div class="label pt-2">{{ $t('tasks.header.assignee') }}</div>
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
                <div class="label pt-2">{{ $t('tasks.header.dueDate') }}</div>
                <div>
                    <datePicker v-model="taskObject.dueDate"></datePicker>
                </div>

                <div class="label pt-2">
                    {{ $t('tasks.header.submitForm') }}
                </div>
                <div>
                    <symper-document-selec
                        v-model="taskObject.docId"
                    ></symper-document-selec>
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
                <v-btn text small @click="closeDialog" class="mr-2">{{
                    $t('common.close')
                }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import userSelector from '../UserSelector';
import datePicker from '@/components/common/datePicker';
import SymperDocSelect from '@/components/common/symperInputs/SymperDocumentSelect.vue';
import { defaultTaskDescription } from '@/components/process/elementDefinitions/customExtToModel';
import { util } from '@/plugins/util';
import BPMNEngine from '@/api/BPMNEngine';

export default {
    props: {
        showCreateTask: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            loading: false,
            taskObject: {
                name: '',
                assignee: '',
                dueDate: '',
                description: '',
                docId: '',
            },
        };
    },
    components: {
        userSelector: userSelector,
        datePicker: datePicker,
        'symper-document-selec': SymperDocSelect,
    },
    methods: {
        closeDialog() {
            this.$emit('close-dialog');
            this.emptyTask();
        },
        inputAssignee(data) {
            this.taskObject.assignee = data;
        },
        emptyTask() {
            this.taskObject = {
                name: '',
                assignee: '',
                dueDate: '',
                description: '',
                docId: '',
            };
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
                owner: this.$store.state.app.endUserInfo.id,
            };
            let description = util.cloneDeep(defaultTaskDescription);
            if (this.taskObject.docId) {
                description.action.action = 'submit';
                description.action.parameter.documentId = this.taskObject.docId;
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
                this.$emit('close-dialog');
                this.$emit('create-task', res);
                this.emptyTask();
                this.$snotifySuccess(this.$t('tasks.created'));
            } else {
                this.showError();
            }
            this.loading = false;
        },
    },
};
</script>

<style></style>

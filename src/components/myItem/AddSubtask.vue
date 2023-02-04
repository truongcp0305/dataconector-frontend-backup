<template>
    <v-row>
        <v-col cols="6" class="subtitle-2">
            <v-icon class="mr-3">mdi-clipboard-outline</v-icon>
            {{ isCreateNew ? $t('addSubTaskTitle') : currTask.name }}
        </v-col>
        <v-col cols="6" class="text-right">
            <v-btn small text color="success" @click="saveSubtask">
                <v-icon small class="mr-1">mdi-content-save</v-icon>
                {{ $t('common.save') }}
            </v-btn>
            <v-btn small text @click="closePanel">
                <v-icon small>mdi-close</v-icon>
            </v-btn>
        </v-col>
        <v-divider></v-divider>
        <v-col cols="8">
            <v-row>
                <v-col cols="3" class="task-title">
                    {{ $t('tasks.header.name') }}:
                </v-col>
                <v-col cols="9" class="task-content">
                    <v-text-field
                        dense
                        solo
                        text
                        flat
                        class="sym-small-size bg-grey"
                        v-model="currTask.name"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="3" class="task-title">
                    {{ $t('tasks.header.assignee') }}:
                </v-col>
                <v-col cols="9" class="task-content">
                    <userSelector
                        :isMulti="false"
                        :compactChip="true"
                        :color="'#f5f5f5'"
                        :textColor="''"
                        :values="[task.assignee.id]"
                    ></userSelector>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="3" class="task-title">
                    {{ $t('tasks.header.owner') }}:
                </v-col>
                <v-col cols="9" class="task-content">
                    <userSelector
                        :isMulti="false"
                        :compactChip="true"
                        :color="'transparent'"
                        :textColor="''"
                        :flat="true"
                        :values="[task.owner.id]"
                    ></userSelector>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="3" class="task-title">
                    {{ $t('tasks.header.description') }}:
                </v-col>
                <v-col cols="9" class="task-content">
                    <v-textarea
                        dense
                        solo
                        text
                        flat
                        class="sym-small-size bg-grey sym-small-lineheight"
                        v-model="currTask.description"
                    ></v-textarea>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="4">
            <v-row>
                <v-col cols="6" class="task-title grey--text">
                    <v-icon small class="mr-2 grey--text">mdi-calendar</v-icon>
                    {{ $t('tasks.header.date') }}:
                </v-col>
                <v-col cols="6" class="task-content grey--text body-2">
                    {{ currTask.date }}
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6" class="task-title grey--text">
                    <v-icon small class="mr-2 grey--text">mdi-calendar</v-icon>
                    {{ $t('tasks.header.dueDate') }}:
                </v-col>
                <v-col cols="6" class="task-content grey--text body-2">
                    {{ currTask.dueDate }}
                    <datePicker></datePicker>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script>
import datePicker from '../../components/common/datePicker';
import userSelector from './UserSelector';
export default {
    name: 'addSubtask',
    components: {
        userSelector,
        datePicker,
    },
    props: {
        task: {
            type: Object,
            default: () => {},
        },
    },
    mounted() {
        this.currTask = JSON.parse(JSON.stringify(this.task));
        if (!!this.task.name) {
            this.isCreateNew = false;
        } else {
            this.isCreateNew = true;
        }
    },
    data: function () {
        return {
            isCreateNew: false,
            currTask: {
                name: '',
                icon: '',
                date: '',
                dueDate: '',
                owner: {
                    name: '',
                    id: '',
                    role: '',
                    avatar: '',
                },
                assignee: {
                    name: '',
                    id: '',
                    role: '',
                    avatar: '',
                },
            },
        };
    },
    methods: {
        closePanel() {
            this.$emit('close-panel');
        },
        saveSubtask() {
            if (this.isCreateNew) {
                this.createSubtask();
            } else {
                this.updateSubtask();
            }
        },
        updateSubtask() {
            this.$emit('update-subtask', this.currTask);
        },
        createSubtask() {
            this.$emit('create-subtask', this.currTask);
        },
    },
};
</script>

<style scoped>
.task-title {
    color: #333;
    font-size: 13px;
    text-shadow: 0 0 0;
}
.task-content >>> .v-textarea >>> textarea,
.task-content
    .v-textarea
    .v-input__control
    .v-input__slot
    .v-text-field__slot
    textarea {
    line-height: 20px !important;
}
</style>

<template>
    <div class="pt-2">
        <div class="subtask-container">
            <listTask
                :headerTitle="$t('v2.myItem.listSubtask')"
                :smallComponentMode="true"
                filterTaskAction="subtasks"
                :filterFromParent="taskFilter"
            >
            </listTask>
        </div>
    </div>
</template>

<script>
import addSubtask from './AddSubtask';

export default {
    name: 'subtask',
    components: {
        addSubtask: addSubtask,
        listTask: () => import('./List')
    },
    data: function () {
        return {
            showEditPanel: false
        };
    },
    computed: {
        taskFilter() {
            return {
                parentTaskId: this.taskInfo.action.parameter.taskId
            };
        }
    },
    props: {
        taskInfo: {
            type: Object,
            default() {
                return {
                    action: {
                        parameter: {
                            taskId
                        }
                    }
                };
            }
        }
    },
    methods: {
        addSubTask(task) {
            this.showEditPanel = true;
        },
        closePanel() {
            this.selectedTask = {};
            this.showEditPanel = false;
        },
        updateSubtask() {},
        createSubtask() {}
    }
};
</script>

<style scoped>
.single-subtask {
    cursor: pointer;
}
.single-subtask:hover {
    background-color: #f5f5f5;
}
</style>

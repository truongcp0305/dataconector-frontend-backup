<template>
    <div class="process-instance-flow-and-task h-100 d-flex flex-column">
        <ListTask ref="allTask" :smallComponentMode="true"> </ListTask>
    </div>
</template>

<script>
import TrackingProcessInstance from './../TrackingProcessInstance';
import VueResizable from 'vue-resizable';
import ListTask from './../../../views/tasks/list';

export default {
    data() {
        return {
            currentTab: null,
            loadedTabData: {
                // xem hai tab đã load data lần đầu hay chưa
                allTask: false,
                penddingTask: false,
            },
        };
    },
    components: {
        TrackingProcessInstance,
        'vue-resizable': VueResizable,
        ListTask,
    },
    props: {
        instanceId: {
            type: String,
            default: '',
        },
    },
    watch: {
        instanceId() {
            this.getTasks();
        },
        currentTab() {
            setTimeout(() => {
                this.getTasks(true);
            }, 300);
        },
    },
    methods: {
        getTasks(checkLoaded = false) {
            if (this.$refs.allTask) {
                if (
                    !checkLoaded ||
                    (checkLoaded && !this.loadedTabData.allTask)
                ) {
                    this.loadedTabData.allTask = true;
                    this.$refs.allTask.getTasks({
                        processInstanceId: this.instanceId,
                    });
                }
            }

            if (this.$refs.penddingTask) {
                if (
                    !checkLoaded ||
                    (checkLoaded && !this.loadedTabData.penddingTask)
                ) {
                    this.loadedTabData.penddingTask = true;
                    this.$refs.penddingTask.getTasks({
                        processInstanceId: this.instanceId,
                    });
                }
            }
        },
    },
    mounted() {
        this.getTasks();
    },
};
</script>

<style></style>

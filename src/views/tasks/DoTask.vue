<template>
    <div class="w-100">
        <TaskDetail
            :taskInfo="data.taskInfo"
            :originData="data.originData"
            :parentHeight="taskDetailHeight"
            @close-detail="closeDetail"
        >
        </TaskDetail>
    </div>
</template>

<script>
import TaskDetail from './taskDetail.vue';
import BPMNEngine from '../../api/BPMNEngine';
import {
    extractTaskInfoFromObject,
    addMoreInfoToTask,
} from '../../components/process/processAction';
import { util } from '../../plugins/util';

export default {
    data: function () {
        return {
            data: {
                taskInfo: {},
                originData: {},
            },
            taskDetailHeight: 500,
        };
    },
    components: {
        TaskDetail: TaskDetail,
    },
    beforeCreate() {},
    created() {
        let self = this;
        this.$store
            .dispatch('process/getAllDefinitions')
            .then((res) => {
                self.setTaskInfo();
            })
            .catch((err) => {});
    },
    mounted() {
        this.taskDetailHeight = util.getComponentSize(this).h;
    },
    methods: {
        async setTaskInfo() {
            if (this.$route.params.id) {
                let task = await BPMNEngine.getATaskInfo(this.$route.params.id);
                let taskInfo = extractTaskInfoFromObject(task);
                task = addMoreInfoToTask(task);
                this.$set(this.data, 'taskInfo', taskInfo);
                this.$set(this.data, 'originData', task);
            }
        },
        closeDetail() {
            this.$router.push('/tasks');
        },
    },
};
</script>

<style></style>

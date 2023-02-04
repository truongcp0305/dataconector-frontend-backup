<template>
    <div class="align-center mt-10">
        <div v-if="status == 'starting'">
            <v-progress-circular
                :size="20"
                :width="3"
                color="primary"
                indeterminate
                class="mr-4 mb-1"
            ></v-progress-circular>
            <h3 class="d-inline-block">{{$t('v2.workflow.workflowInit')}}</h3>
        </div>
        <div v-else-if="status == 'successfull'" class="green--text">
            <i class="mdi mdi-check-bold fs-18 mr-4"></i>
            <h3 class="d-inline-block">{{$t('v2.workflow.workflowInitSuccess')}}</h3>
        </div>
        <div v-else-if="status == 'failed'" class="red--text">
            <i class="mdi mdi-alert-box-outline fs-18 mr-4"></i>
            <h3 class="d-inline-block">{{$t('v2.workflow.workflowInitFail')}}</h3>
        </div>
    </div>
</template>

<script>
import BPMNEngine from '../../api/BPMNEngine';

export default {
    data() {
        return {
            status: 'starting'
        };
    },
    mounted() {
        this.startProcessInstance();
    },
    methods: {
        async startProcessInstance() {
            let id = this.$route.params.id;
            let res = await BPMNEngine.startProcessInstanceByModelerId(id);

            try {
                let currentUserId = this.$store.state.app.endUserInfo.id;
                this.status = 'successfull';
                for (const t of res.data.firstTasks) {
                    if (t.assignee) {
                        let assignee = t.assignee.split(':')[0];
                        if (assignee == currentUserId) {
                            this.$goToPage('myitem/tasks/' + t.id, this.$t('v2.workflow.doTask'));
                            break;
                        }
                    }
                }
            } catch (error) {
                this.status = 'failed';
                console.error(error);
            }
        }
    }
};
</script>

<style></style>

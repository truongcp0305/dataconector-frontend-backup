<template>
    <div class="w-100">
        <workDetail class="workDetail" :workInfo="workInfo"> </workDetail>
    </div>
</template>

<script>
import workDetail from '@/components/myItem/work/WorkDetail.vue';
import BPMNEngine from '@/api/BPMNEngine.js';
export default {
    components: {
        workDetail,
    },
    data() {
        return {
            workInfo: {},
        };
    },
    created() {
        this.getTaskCurrent();
    },
    methods: {
        getTaskCurrent() {
            let processInstanceId = this.$route.params.processInstanceId;
            let self = this;
            BPMNEngine.getProcessInstanceHistory({
                processInstanceId: processInstanceId,
                includeProcessVariables: true,
            })
                .then((res) => {
                    if (res.data[0]) {
                        this.workInfo = res.data[0];
                    } else {
                        this.workInfo = {};
                    }
                })
                .catch((err) => {});
        },
    },
};
</script>

<style scoped>
.workDetail {
    position: absolute;
}
</style>

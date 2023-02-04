<template>
    <div class="w-100 h-100">
        <listTask :listTask="listTask" :appName="appName" />
    </div>
</template>

<script>
import BPMNEngine from '@/api/BPMNEngine.js';
import listTask from './ListTask';

export default {
    props: {
        workId: {
            type: String,
            default: null
        },
        appName: {
            type: String,
            default: null
        }
    },
    components: {
        listTask
    },
    watch: {
        workId: {
            deep: true,
            immediate: true,
            handler(valueAfter) {
                this.getData();
            }
        }
    },
    data() {
        return {
            listTask: []
        };
    },
    methods: {
        async getData() {
            let self = this;
            try {
                let processInstanceId = this.workId;
                if (processInstanceId != null) {
                    await self.getListTask(processInstanceId);
                } else {
                    self.listTask = [];
                }
            } catch (error) {
                self.listTask = [];
                self.$snotifyError(
                    error,
                    self.$t('v2.myItem.getTaskInProcessFail')
                );
            }
        },
        async getListTask(processInstanceId) {
            let self = this;
            try {
                let filter = {};
                filter.processInstanceId = processInstanceId;
                filter.includeProcessVariables = true;
                filter.sort = 'createTime';
                filter.order = 'desc';
                let res = await BPMNEngine.postTaskHistory(filter);
                if (res.total > 0) {
                    self.listTask = res.data;
                } else {
                    self.listTask = [];
                }
                console.log('listTask', res.data);
            } catch (error) {
                self.listTask = [];
                self.$snotifyError(
                    error,
                    self.$t('v2.myItem.getTaskInProcessFail')
                );
            }
        }
    }
};
</script>

<style></style>

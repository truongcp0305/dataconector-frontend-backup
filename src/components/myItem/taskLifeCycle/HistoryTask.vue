<template>
    <div class="d-flex flex-column mt-2 ml-2">
        <div
            class="d-flex flex-column mb-2 pt-1 mr-1 ml-1"
            v-for="(item, i) in allHistory"
            :key="i"
        >
            <div class="d-flex align-center">
                <SymperAvatar :userId="item.userCreateActionId" :size="20" />
                <v-icon small class="ml-1">
                    {{
                        item.userCreateActionType == 'owner'
                            ? 'mdi-account-tie-outline'
                            : 'mdi-account-check-outline'
                    }}</v-icon
                >
                <span class="flex-grow-1 ml-1">
                    {{ item.userCreateAction }}
                </span>
                <span>
                    {{ item.date }}
                </span>
            </div>
            <div class="d-flex mt-1 ml-7">
                <span v-if="item.startStatus">
                    <span
                        v-html="reduce(item.startStatus, item.endStatus)"
                    ></span>
                    <span style="color: blue" class="ml-1">
                        {{ item.userReceiveAction }}
                    </span>
                </span>
                <span v-else>{{ $t('v2.myItem.workflowStarted') }}</span>
            </div>
            <div class="d-flex align-center ml-7" v-if="item.startStatus">
                {{ $t('v2.myItem.status') }}
                <v-chip
                    x-small
                    label
                    :color="taskStatus[item.startStatus].color"
                    class="ma-2"
                    text-color="white"
                >
                    <span class="fs-11">
                        {{ taskStatus[item.startStatus].title }}
                    </span>
                </v-chip>
                <v-icon x-small> mdi-chevron-triple-right </v-icon>
                <v-chip
                    x-small
                    label
                    class="ma-2"
                    :color="taskStatus[item.endStatus].color"
                    text-color="white"
                >
                    <span class="fs-11">
                        {{ taskStatus[item.endStatus].title }}
                    </span>
                </v-chip>
            </div>
        </div>
    </div>
</template>

<script>
import SymperAvatar from '@/components/common/SymperAvatar';
export default {
    components: {
        SymperAvatar
    },
    computed: {
        historyTask() {
            let sData = this.$store.state.task;
            let data = [];
            if (sData.currentTaskHistory.length > 0) {
                sData.currentTaskHistory.forEach(function (e) {
                    if (e.logAction == 'update' || e.logAction == 'create') {
                        data.push(e);
                    }
                });
            }
            return data;
        },
        allHistory() {
            let data = this.historyTask;
            let mapIdToUser = this.$store.getters['app/mapIdToUser'];
            let newData = [];
            let self = this;
            let firstHistory = this.checkUserStartWorkflow(data, mapIdToUser);
            newData.push(firstHistory);
            data.shift();
            if (data.length > 1) {
                for (let i = 0; i < data.length - 1; i++) {
                    if (data[i].delegationState == 'PENDING') {
                        if (data[i + 1].delegationState == 'RESOLVED') {
                            let obj = self.createHistoryTask(
                                data[i],
                                data[i + 1],
                                'delegate',
                                'assign',
                                'assigne',
                                data[i].assignee
                            );
                            let arr = data[i + 1].assignee.split(':');
                            obj.userReceiveAction =
                                mapIdToUser[arr[0]].displayName;
                            newData.push(obj);
                        }
                    } else if (
                        data[i].delegationState == 'RESOLVED' ||
                        !data[i].delegationState
                    ) {
                        if (data[i + 1].delegationState == 'PENDING') {
                            let arr = data[i].assignee.split(':');
                            let obj = self.createHistoryTask(
                                data[i],
                                data[i + 1],
                                'assign',
                                'delegate',
                                'owner',
                                arr[0]
                            );
                            obj.userReceiveAction =
                                mapIdToUser[data[i + 1].assignee].displayName;
                            newData.push(obj);
                        } else if (data[i + 1].deleted) {
                            let arr = data[i].assignee.split(':');
                            let obj = self.createHistoryTask(
                                data[i],
                                data[i + 1],
                                'assign',
                                'complete',
                                'owner',
                                arr[0]
                            );
                            newData.push(obj);
                        } else if (data[i].assignee != data[i + 1].assignne) {
                            let arr = data[i].assignee.split(':');
                            let obj = self.createHistoryTask(
                                data[i],
                                data[i + 1],
                                'assign',
                                'assign',
                                'owner',
                                arr[0]
                            );
                            obj.userReceiveAction =
                                mapIdToUser[data[i + 1].assignee].displayName;
                        } else if (
                            !data[i + 1].assignee &&
                            !data[i + 1].owner
                        ) {
                            let arr = data[i].assignee.split(':');
                            let obj = self.createHistoryTask(
                                data[i],
                                data[i + 1],
                                'assign',
                                'unAssign',
                                'owner',
                                arr[0]
                            );
                        }
                    } else if (!data[i].deleted && data[i + 1].deleted) {
                        let arr = data[i].assignee.split(':');
                        let obj = self.createHistoryTask(
                            data[i],
                            data[i + 1],
                            'assign',
                            'delegate',
                            'owner',
                            arr[0]
                        );
                        obj.userReceiveAction =
                            mapIdToUser[data[i + 1].assignee].displayName;
                        newData.push(obj);
                    } else if (
                        !data[i].owner &&
                        !data[i].assignee &&
                        data[i + 1].assignee &&
                        data[i + 1].owner
                    ) {
                        let arr = data[i].assignee.split(':');
                        let obj = self.createHistoryTask(
                            data[i],
                            data[i + 1],
                            'unAssign',
                            'assign',
                            'assigne',
                            arr[0]
                        );
                        obj.userReceiveAction =
                            mapIdToUser[data[i + 1].assignee].displayName;
                    }
                }
            }

            return newData;
        }
    },
    data() {
        return {
            taskStatus: {
                delegate: {
                    color: '#8E2D8C',
                    title: this.$t('v2.myItem.delegate')
                },
                unAssign: {
                    color: 'red',
                    title: this.$t('v2.myItem.unAssign')
                },
                assign: {
                    color: 'orange',
                    title: this.$t('v2.myItem.assign')
                },
                complete: {
                    color: 'success',
                    title: this.$t('v2.myItem.completed')
                },
                new: {
                    color: 'primary',
                    title: this.$t('v2.myItem.new')
                }
            }
        };
    },
    methods: {
        reduce(startStatus, endStatus) {
            if (startStatus == 'delegate' && endStatus == 'assign') {
                return this.$t('v2.myItem.returnJob');
            }
            if (startStatus == 'assign' && endStatus == 'delegate') {
                return this.$t('v2.myItem.assigningJobTo');
            }
            if (startStatus == 'assign' && endStatus == 'assign') {
                return this.$t('v2.myItem.assignJobTo');
            }
            if (startStatus == 'assign' && endStatus == 'unAssign') {
                return this.$t('v2.myItem.cancelJob');
            }
            if (startStatus == 'unAssign' && endStatus == 'assign') {
                return this.$t('v2.myItem.getJob');
            }
            if (endStatus == 'complete') {
                return this.$t('v2.myItem.completeTask');
            }
        },
        checkUserStartWorkflow(data, mapIdToUser) {
            let variables = JSON.parse(data[1].variables);
            let arr = variables.symper_user_id_start_workflow.split(':');
            let obj = {
                userCreateActionId: mapIdToUser[arr[0]].id,
                userCreateAction: mapIdToUser[arr[0]].displayName,
                userCreateActionType:
                    arr[0] == data[1].assignee ? 'owner' : 'notOwner',
                date: this.$moment(data[1].createTime).format('YYYY-MM-DD')
            };
            return obj;
        },
        createHistoryTask(
            x,
            y,
            startStatus,
            endStatus,
            userCreateActionType,
            userCreateActionId
        ) {
            let mapIdToUser = this.$store.getters['app/mapIdToUser'];
            let self = this;
            let obj = {};
            obj.startStatus = startStatus;
            obj.endStatus = endStatus;
            obj.date = self.$moment(y.createTime).format('YYYY-MM-DD');
            obj.userCreateActionType = userCreateActionType;
            obj.userCreateAction = mapIdToUser[userCreateActionId].displayName;
            obj.userCreateActionId = userCreateActionId;
            return obj;
        }
    }
};
</script>

<style></style>

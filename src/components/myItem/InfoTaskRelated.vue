<template>
    <div class="card-infoTask" :style="boxPosition" v-if="taskSelected.id">
        <v-card class="card-task">
            <div class="ml-1">
                <div
                    class="mt-1"
                    style="
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    "
                >
                    <v-icon class="mx-1" style="font-size: 14px">{{
                        displayIcon(taskSelected.description)
                    }}</v-icon>
                    <span style="font-size: 13px">{{
                        displayContent(taskSelected.description)
                    }}</span>
                </div>
                <div class="mb-2">
                    <v-icon
                        v-if="taskSelected.endTime"
                        class="mx-1"
                        style="
                            font-size: 11px;
                            color: #408137;
                            padding-left: 1px;
                            padding-top: 4px;
                        "
                        >mdi-circle</v-icon
                    >
                    <v-icon
                        class="mx-1"
                        v-else-if="
                            taskSelected.createTime &&
                            checkTimeDueDate(taskSelected)
                        "
                        style="
                            font-size: 11px;
                            color: #ee6b60;
                            padding-left: 1px;
                            padding-top: 4px;
                        "
                        >mdi-circle</v-icon
                    >
                    <v-icon
                        class="mx-1 mb-1"
                        v-else-if="
                            taskSelected.createTime &&
                            !checkTimeDueDate(taskSelected)
                        "
                        style="
                            color: #0760d9;
                            font-size: 11px;
                            padding-left: 1px;
                            padding-top: 4px;
                        "
                        >mdi-circle</v-icon
                    >
                    {{ displayDescription(taskSelected.description) }}
                </div>
            </div>
            <v-divider></v-divider>
            <div class="ml-1">
                <div
                    style="
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    "
                >
                    <v-icon style="font-size: 16px">mdi-widgets-outline</v-icon>
                    <span class="pl-1" style="font-size: 13px">{{
                        taskSelected.processDefinitionName
                    }}</span>
                </div>
                <div
                    class="
                        pa-0
                        grey--text
                        mt-1
                        lighten-2
                        d-flex
                        justify-space-between
                    "
                >
                    <div class="fs-11 ml-5 text-ellipsis">
                        {{ showAppName() }}
                    </div>

                    <div class="fs-11 py-0 pr-2 text-ellipsis">
                        {{
                            taskSelected.createTime
                                ? $moment(taskSelected.createTime).format(
                                      'DD/MM/YY HH:mm'
                                  )
                                : $moment(taskSelected.endTime).format(
                                      'DD/MM/YY HH:mm'
                                  )
                        }}
                        <v-icon class="grey--text lighten-2 ml-1" x-small
                            >mdi-clock-time-nine-outline</v-icon
                        >
                    </div>
                </div>
            </div>
            <div class="ml-1">
                <div class="pa-0 mt-1 lighten-2 d-flex justify-space-between">
                    <div class="fs-13 userRelated">
                        <v-icon class="pt-2" style="font-size: 14px"
                            >mdi-account-tie-outline</v-icon
                        >
                        <span>{{ $t('tasks.header.owner') }}</span>
                    </div>
                    <div class="fs-11 py-0 text-ellipsis" style="width: 160px">
                        <infoUser
                            v-if="taskSelected.ownerInfo.id"
                            class="userInfo"
                            :userId="taskSelected.ownerInfo.id"
                            :roleInfo="
                                taskSelected.ownerRole
                                    ? taskSelected.ownerRole
                                    : {}
                            "
                        />
                        <infoUser
                            v-else
                            class="userInfo"
                            :userId="taskSelected.assigneeInfo.id"
                            :roleInfo="
                                taskSelected.assigneeRole
                                    ? taskSelected.assigneeRole
                                    : {}
                            "
                        />
                    </div>
                </div>
            </div>
            <div class="ml-1">
                <div class="pa-0 mt-1 lighten-2 d-flex justify-space-between">
                    <div class="fs-13 userRelated">
                        <v-icon class="pt-2" style="font-size: 14px"
                            >mdi-account-check-outline</v-icon
                        >
                        <span>{{ $t('tasks.header.assignee') }}</span>
                    </div>
                    <div class="fs-11 py-0 text-ellipsis" style="width: 160px">
                        <infoUser
                            class="userInfo"
                            :userId="taskSelected.assigneeInfo.id"
                            :roleInfo="
                                taskSelected.assigneeRole
                                    ? taskSelected.assigneeRole
                                    : {}
                            "
                        />
                    </div>
                </div>
            </div>

            <v-card-actions>
                <span>{{
                    commentCountPerTask['task:' + taskSelected.id]
                }}</span>
                <span class="pl-1">
                    <v-icon class="fs-14"
                        >mdi-comment-processing-outline</v-icon
                    >
                </span>
                <span class="ml-3">{{
                    fileCountPerTask['task:' + taskSelected.id]
                }}</span>
                <span class="pl-1">
                    <v-icon class="fs-14">mdi-attachment</v-icon>
                </span>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    small
                    @click="goDoTask(taskSelected.id)"
                >
                    {{ $t('myItem.sidebar.openTask') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
import infoUser from './InfoUser';

import {
    extractTaskInfoFromObject,
    addMoreInfoToTask
} from '@/components/process/processAction';
export default {
    components: {
        infoUser
    },
    computed: {
        fileCountPerTask() {
            return this.$store.state.file.fileCountPerObj.list;
        },
        commentCountPerTask() {
            return this.$store.state.comment.commentCountPerObj.list;
        }
    },
    props: {
        taskSelected: {
            type: Object,
            default: () => {
                return {};
            }
        },
        appId: {
            default: 0
        }
    },
    watch: {
        taskSelected: {
            deep: true,
            immediate: true,
            handler(vl) {
                if (vl.id) {
                    this.getMoreInfoTask(vl);
                    this.$store.dispatch('file/getWaitingFileCountPerObj');
                    this.$store.dispatch(
                        'comment/getWaitingCommentCountPerObj'
                    );
                }
            }
        }
    },
    data() {
        return {
            boxPosition: null
        };
    },
    methods: {
        checkTimeDueDate(item) {
            if (item.dueDate) {
                let dueDate = new Date(item.dueDate).getTime();
                if (dueDate < Date.now()) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        goDoTask(id) {
            this.$router.push('/myitem/tasks/' + id);
            this.$emit('closeInfoTaskRelated');
        },
        setPosittion(offset) {
            this.boxPosition = offset;
        },
        getMoreInfoTask(task) {
            this.taskSelected = addMoreInfoToTask(task);
        },
        showAppName() {
            let appId = this.appId;
            let allApp = this.$store.state.task.allAppActive;
            let app = allApp.find((element) => element.id == appId);
            if (app) {
                return app.name;
            } else {
                return '';
            }
        },
        displayIcon(description) {
            let data = JSON.parse(description);
            if (data.action.action == 'approval') {
                return 'mdi-seal-variant';
            } else {
                return 'mdi-file-document-edit-outline';
            }
        },
        displayDescription(description) {
            let data = JSON.parse(description);
            let des = '',
                value = '';
            if (data.extraLabel == '' || data.extraLabel == null) {
                des = this.$t('v2.myItem.description');
            } else {
                des = data.extraLabel;
            }

            if (data.extraValue == '' && data.extraLabel == '') {
                value = this.$t('v2.myItem.emptyDescription');
            } else {
                value = data.extraValue;
            }

            return des + ' ' + value;
        },
        displayContent(description) {
            let data = JSON.parse(description);
            return data.content;
        }
    }
};
</script>

<style scoped>
.card-infoTask {
    position: fixed;
    right: 30px;
    min-width: 350px;
}
.card-task {
    border: 1px solid #dedede;
}
.userRelated {
    position: relative;
}
.userRelated span {
    position: absolute;
    top: 6px;
    width: 150px;
    padding-left: 4px;
}
</style>

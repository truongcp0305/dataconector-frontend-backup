<template>
    <div class="pt-3 d-flex flex-column h-100">
        <VueResizable
            class="mt-2"
            :min-height="100"
            :max-height="400"
            @resize:end="handleEndDrag"
            :height="200"
            width="100%"
            :active="['b']"
            :style="{ overflow: 'hidden' }"
        >
            <VuePerfectScrollbar
                :settings="{
                    suppressScrollX: true,
                }"
                :style="{ height: taskInfoHeight + 'px' }"
            >
                <v-row class="fs-13 pl-6">
                    <v-col cols="3">
                        <v-icon small size="18" class="mr-2 mb-1"
                            >mdi-format-text</v-icon
                        >
                        {{ $t('tasks.taskTitle') }}
                    </v-col>
                    <v-col cols="9">
                        {{ originData.name }}
                    </v-col>
                    <v-col cols="3">
                        <v-icon small size="18" class="mr-2 mb-1"
                            >mdi-calendar</v-icon
                        >
                        {{ $t('tasks.header.createDate') }}
                    </v-col>
                    <v-col cols="9">
                        {{
                            $moment(originData.createTime).format(
                                'DD/MM/YY  HH:mm:ss',
                            )
                        }}
                    </v-col>
                    <v-col cols="3" class="pb-1">
                        <v-icon small size="18" class="mr-2 mb-1"
                            >mdi-account</v-icon
                        >
                        {{ $t('tasks.header.owner') }}
                    </v-col>
                    <v-col cols="9" class="pb-2">
                        <user
                            v-if="originData.ownerInfo.id"
                            :user="originData.ownerInfo"
                        ></user>
                        <user v-else :user="originData.assigneeInfo"></user>
                    </v-col>
                    <v-col cols="3" class="pt-1">
                        <v-icon small size="18" class="mr-2 mb-1"
                            >mdi-account</v-icon
                        >
                        {{ $t('tasks.header.assignee') }}
                    </v-col>
                    <v-col cols="9" class="pt-1">
                        <user :user="originData.assigneeInfo"></user>
                    </v-col>
                    <v-col cols="3" class="pt-1">
                        <v-icon small size="18" class="mr-2 mb-1"
                            >mdi-calendar-text</v-icon
                        >
                        {{ $t('tasks.header.description') }}
                    </v-col>
                    <v-col cols="9" class="pt-1">
                        {{ taskInfo.extraLabel }}
                    </v-col>
                </v-row>
            </VuePerfectScrollbar>
        </VueResizable>
        <v-row class="border-top-1">
            <trackingProcessInstance
                v-if="taskInfo.action.parameter.processInstanceId"
                :instanceId="taskInfo.action.parameter.processInstanceId"
                :elementId="taskInfo.action.parameter.activityId"
            >
            </trackingProcessInstance>
        </v-row>
    </div>
</template>

<script>
import VueResizable from 'vue-resizable';
import user from './user';
import trackingProcessInstance from '@/views/process/TrackingProcessInstance.vue';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';

export default {
    data() {
        return {
            taskInfoHeight: 150,
        };
    },
    methods: {
        handleEndDrag(payload) {
            this.taskInfoHeight = payload.height;
        },
    },
    name: 'info',
    components: {
        user,
        VueResizable,
        trackingProcessInstance,
        VuePerfectScrollbar,
    },
    props: {
        taskInfo: {
            type: Object,
            default: () => {},
        },
        originData: {
            type: Object,
            default: () => {},
        },
    },
};
</script>

<style scoped>
.mt-2 >>> .ps-container {
    height: 100% !important;
}
</style>

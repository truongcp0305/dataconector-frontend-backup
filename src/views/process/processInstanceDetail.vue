<template>
    <v-container fluid>
        <v-row class="ml-0 mr-0">
            <v-col cols="8" class="pb-1 pt-1 pl-0">
                <div class="fs-13 pl-2 pt-1">
                    {{$t('v2.workflow.appNameWorkflowNameBusinessKey')}}
                </div>
            </v-col>
            <v-col cols="4" class="text-right pt-1 pb-1 pr-0">
                <v-btn small icon>
                    <v-icon small>mdi-open-in-new</v-icon>
                </v-btn>
                <v-btn small icon @click="closeDetail">
                    <v-icon small>mdi-close</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-divider style="border-width: 1px; border-color: #ff7400"></v-divider>
        <v-row>
            <v-col cols="12 pt-0 ">
                <v-tabs
                    v-model="tab"
                    background-color="white"
                    color="white"
                    active-class="symper-active-tab-item"
                    :height="'40px'"
                >
                    <v-tab v-for="item in items" :key="item.tab" class="fs-13">
                        <v-icon small class="mr-2">{{ item.icon }}</v-icon>
                        {{ item.title }}
                    </v-tab>
                </v-tabs>

                <div class="h-100 w-100 d-flex border-top-1">
                    <vue-resizable
                        :active="['r']"
                        class="h-100"
                        width="400px"
                        style="
                            border-right: 1px solid #e0e0e0;
                            background-color: white;
                        "
                    >
                        <TrackingProcessInstance :instanceId="instanceId">
                        </TrackingProcessInstance>
                    </vue-resizable>
                    <v-tabs-items v-model="tab" style="flex-grow: 1">
                        <v-tab-item v-for="item in items" :key="item.tab">
                            <div
                                :style="{
                                    height: mainContentHeight,
                                }"
                            >
                                <component
                                    :instanceId="instanceId"
                                    :is="item.content"
                                    class="h-100"
                                ></component>
                            </div>
                        </v-tab-item>
                    </v-tabs-items>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import icon from '../../components/common/SymperIcon';

import Attachments from './instanceDetail/Attachments';
import Auditrail from './instanceDetail/AuditTrail';
import Comments from './instanceDetail/Comments';
import FlowAndTask from './instanceDetail/FlowAndTask';
import History from './instanceDetail/History';
import People from './instanceDetail/People';
import TrackingProcessInstance from './../../views/process/TrackingProcessInstance';
import VueResizable from 'vue-resizable';

export default {
    name: 'ProcessIntanceDetail',
    props: {
        instanceId: {
            type: String,
            default: '',
        },
        componentHeight: {
            type: Number,
            default: 400,
        },
    },
    computed: {
        mainContentHeight() {
            return this.componentHeight - 80 + 'px';
        },
    },
    components: {
        icon: icon,
        VueResizable,
        Attachments,
        Auditrail,
        Comments,
        FlowAndTask,
        History,
        People,
        TrackingProcessInstance,
    },
    data: function () {
        return {
            tab: null,
            items: [
                {
                    tab: 'flowAndTask',
                    icon: 'mdi-cog',
                    title: this.$t('v2.workflow.flowAndTask'),
                    content: FlowAndTask,
                },
                {
                    tab: 'people',
                    icon: 'mdi-account',
                    title: this.$t('v2.workflow.people'),
                    content: People,
                },
                {
                    tab: 'attachment',
                    icon: 'mdi-paperclip',
                    title: this.$t('v2.workflow.attachment'),
                    content: Attachments,
                },
                {
                    tab: 'comment',
                    icon: 'mdi-message-text-outline',
                    title: this.$t('v2.workflow.comment'),
                    content: Comments,
                },
                {
                    tab: 'auditTrail',
                    icon: 'mdi-chart-timeline-variant',
                    title: this.$t('v2.workflow.auditTrail'),
                    content: Auditrail,
                },
                {
                    tab: 'history',
                    icon: 'mdi-history',
                    title: this.$t('v2.workflow.history'),
                    content: History,
                },
            ],
        };
    },
    methods: {
        getMainContentHeight() {
            return this.$;
        },
        closeDetail() {
            this.$emit('close-detail', {});
        },
    },
};
</script>

<style>
.symper-active-tab-item {
    background-color: white;
    color: rgb(255, 116, 0) !important;
    font-weight: 500 !important;
}
</style>

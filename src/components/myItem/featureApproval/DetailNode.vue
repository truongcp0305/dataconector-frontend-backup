<template>
    <div
        :style="{
            height: 'calc(100% - 30px)'
        }"
    >
        <div v-if="loadingTaskList" class="h-100 w-100 position-relative">
            <Preloader :size="40" />
        </div>
        <VuePerfectScrollbar v-else class="vuePerfect h-100">
            <div v-if="!sideBySideMode">
                <v-row
                    v-for="(obj, idx) in listTaskApproval"
                    :key="obj.id"
                    :index="obj.id"
                    :class="{
                        'mr-0 py-1 ml-0 single-row': true,
                        'd-active': index == idx
                    }"
                    @mouseover="index = idx"
                    @mouseout="index = null"
                    style="border-bottom: 1px solid #eeeeee !important"
                >
                    <v-col
                        :cols="!sideBySideMode ? 1 : 1"
                        class="fs-13 pa-0 pl-1 py-0"
                        style="flex: 0 !important"
                    >
                        <v-checkbox
                            ref="listCheck"
                            v-model="obj.checked"
                            class="checkBoxTask pa-0 ma-0 checkBox"
                            @change="changeValueCheckBox"
                        ></v-checkbox>
                    </v-col>

                    <v-col
                        :cols="!sideBySideMode ? 2 : 2"
                        class="pl-0 pa-0"
                        style="flex: 0 0 25.6667%; max-width: 25.6667%"
                        @click="selectObject(obj, idx)"
                    >
                        <div class="mt-1">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <div
                                        v-on="on"
                                        class="
                                            text-left
                                            fs-13
                                            text-ellipsis
                                            w-100
                                        "
                                    >
                                        <v-icon
                                            class="fs-14"
                                            style="margin-top: 1px"
                                            >mdi-file-check-outline</v-icon
                                        >

                                        {{ obj.taskData.content }}
                                    </div>
                                </template>
                                <span>{{ obj.taskData.content }}</span>
                            </v-tooltip>
                            <div
                                class="
                                    pa-0
                                    grey--text
                                    lighten-2
                                    d-flex
                                    justify-space-between
                                "
                            >
                                <div class="fs-11 text-ellipsis">
                                    <v-icon
                                        v-if="
                                            obj.dueDate && checkTimeDueDate(obj)
                                        "
                                        style="
                                            font-size: 10px;
                                            color: #ee6b60;
                                            padding-left: 2px;
                                        "
                                        >mdi-circle</v-icon
                                    >
                                    <v-icon
                                        v-else
                                        style="
                                            font-size: 10px;
                                            color: #0760d9;
                                            padding-left: 2px;
                                        "
                                        >mdi-circle</v-icon
                                    >
                                    {{ obj.taskData.extraLabel }}
                                    {{ obj.taskData.extraValue }}
                                </div>

                                <div class="fs-11 py-0 text-ellipsis">
                                    {{
                                        $moment(obj.createTime).format(
                                            'DD/MM/YY HH:mm:ss'
                                        )
                                    }}
                                </div>
                            </div>
                        </div>
                    </v-col>
                    <v-col
                        @click="selectObject(obj, idx)"
                        v-if="!sideBySideMode"
                        cols="2"
                        class="fs-12 pl-3 px-1 py-0 mt-2"
                    >
                        <infoUser
                            class="userInfo"
                            :userId="obj.assigneeInfo.id"
                            :roleInfo="obj.assigneeRole ? obj.assigneeRole : {}"
                        />
                    </v-col>
                    <v-col
                        @click="selectObject(obj, idx)"
                        v-if="!sideBySideMode"
                        cols="2"
                        class="fs-12 pl-3 px-1 py-0 mt-2"
                    >
                        <infoUser
                            v-if="obj.ownerInfo.id"
                            class="userInfo"
                            :userId="obj.ownerInfo.id"
                            :roleInfo="obj.ownerRole ? obj.ownerRole : {}"
                        />
                        <infoUser
                            v-else
                            class="userInfo"
                            :userId="obj.assigneeInfo.id"
                            :roleInfo="obj.assigneeRole"
                        />
                    </v-col>
                    <v-col
                        @click="selectObject(obj, idx)"
                        v-if="!sideBySideMode"
                        style="line-height: 42px; flex: 0 0 11.666667%"
                        cols="2"
                        class="fs-13 pl-3 px-1 py-0"
                    >
                        <span class="mt-1">{{
                            obj.dueDate == null
                                ? ''
                                : $moment(obj.dueDate).fromNow()
                        }}</span>
                    </v-col>
                    <v-col
                        @click="selectObject(obj, idx)"
                        v-if="!sideBySideMode"
                        class="py-0"
                        cols="3"
                    >
                        <div class="pl-1 mt-1">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <div
                                        v-on="on"
                                        v-if="obj.processDefinitionId"
                                        class="
                                            text-left
                                            fs-13
                                            pr-6
                                            text-ellipsis
                                            w-80
                                            title-quytrinh
                                        "
                                    >
                                        {{ obj.processDefinitionName }}
                                    </div>
                                    <div
                                        v-on="on"
                                        v-else
                                        class="
                                            text-left
                                            fs-13
                                            pr-6
                                            text-ellipsis
                                            w-80
                                            title-quytrinh
                                        "
                                    >
                                        {{ $t('v2.myItem.adHoc') }}
                                    </div>
                                </template>
                                <span>{{
                                    obj.processDefinitionName
                                        ? obj.processDefinitionName
                                        : $t('v2.myItem.adHoc')
                                }}</span>
                            </v-tooltip>
                            <div
                                class="
                                    pa-0
                                    grey--text
                                    lighten-2
                                    d-flex
                                    justify-space-between
                                "
                            >
                                <div class="fs-11 pr-6 text-ellipsis">
                                    {{ selectNameApp(obj.variables) }}
                                </div>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </div>

            <div v-else style="height: 100%">
                <v-row style="height: 100%">
                    <v-col
                        cols="3"
                        style="
                            border-right: 1px solid #dedede;
                            padding-top: 0px !important;
                            padding-right: 0px;
                        "
                    >
                        <v-row
                            v-for="(obj, idx) in listTaskApproval"
                            :key="obj.id"
                            :index="obj.id"
                            :class="{
                                'mr-0 ml-0 single-row py-1': true,
                                'd-active': index == idx || selectObj == idx
                            }"
                            @mouseover="index = idx"
                            @mouseout="index = null"
                            style="border-bottom: 1px solid #eeeeee !important"
                        >
                            <v-col
                                cols="3"
                                class="fs-13 pa-0 pl-1"
                                style="flex: 0 !important"
                            >
                                <v-checkbox
                                    ref="listCheck"
                                    v-model="obj.checked"
                                    class="checkBoxTask pa-0 ma-0 checkBox"
                                    @change="changeValueCheckBox"
                                ></v-checkbox>
                            </v-col>

                            <v-col
                                cols="9"
                                class="pa-0 pt-0"
                                @click="selectObject(obj, idx)"
                                style="
                                    max-width: 100% !important;
                                    flex: 1 0 70%;
                                "
                            >
                                <div>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <div
                                                v-on="on"
                                                class="
                                                    text-left
                                                    fs-13
                                                    pt-1
                                                    text-ellipsis
                                                    w-100
                                                "
                                                style="width: 250px"
                                            >
                                                <v-icon
                                                    class="fs-14"
                                                    style="margin-top: 1px"
                                                    >mdi-file-check-outline</v-icon
                                                >

                                                {{ obj.taskData.content }}
                                            </div>
                                        </template>
                                        <span>{{ obj.taskData.content }}</span>
                                    </v-tooltip>
                                    <div
                                        class="
                                            pa-0
                                            grey--text
                                            lighten-2
                                            d-flex
                                            justify-space-between
                                        "
                                    >
                                        <div
                                            class="fs-11 text-ellipsis"
                                            style="width: 155px"
                                        >
                                            <v-icon
                                                v-if="
                                                    obj.dueDate &&
                                                    checkTimeDueDate(obj)
                                                "
                                                style="
                                                    font-size: 10px;
                                                    color: red;
                                                    padding-left: 2px;
                                                "
                                                >mdi-circle</v-icon
                                            >
                                            <v-icon
                                                v-else
                                                style="
                                                    font-size: 10px;
                                                    color: green;
                                                    padding-left: 2px;
                                                "
                                                >mdi-circle</v-icon
                                            >
                                            {{ obj.taskData.extraLabel }}
                                            {{ obj.taskData.extraValue }}
                                        </div>

                                        <div
                                            class="
                                                fs-11
                                                py-0
                                                text-ellipsis
                                                mr-2
                                            "
                                        >
                                            {{
                                                $moment(obj.createTime).format(
                                                    'DD/MM/YY HH:mm:ss'
                                                )
                                            }}
                                            <v-icon
                                                class="
                                                    grey--text
                                                    lighten-2
                                                    ml-1
                                                "
                                                x-small
                                                >mdi-clock-time-nine-outline</v-icon
                                            >
                                        </div>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col
                        class="detailDoc"
                        cols="9"
                        style="padding: 0px !important; height: 100%"
                    >
                        <taskDetail
                            class="approval-taskDetail"
                            :taskInfo="selectedTask.taskInfo"
                            :originData="selectedTask.originData"
                            :appId="selectedTask.appId"
                            @close-detail="closeDetail"
                            :hideActionTask="true"
                        ></taskDetail>
                    </v-col>
                </v-row>
            </div>

            <NotFoundScreen
                emptyDataKey="myitem-task-list"
                class="h-100 w-100"
                v-if="!loadingTaskList && !allTaskInNode.length"
            />
        </VuePerfectScrollbar>
    </div>
</template>

<script>
import BPMNEngine from '@/api/BPMNEngine';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import detailDocument from '@/views/document/detail/Detail';
import taskDetail from '../TaskDetail';
import infoUser from './../InfoUser';
import Preloader from '@/components/common/Preloader.vue';
import NotFoundScreen from '@/components/common/NotFoundScreen';

import {
    extractTaskInfoFromObject,
    addMoreInfoToTask
} from '@/components/process/processAction';
export default {
    mounted() {},
    props: {
        nodeInfo: {
            type: Object,
            default() {
                return {};
            }
        },
        sideBySideMode: {
            type: Boolean,
            default: false
        },
        countRecordSelected: {
            type: Number,
            default: 0
        }
    },
    components: {
        VuePerfectScrollbar: VuePerfectScrollbar,
        detailDocument,
        taskDetail,
        infoUser,
        Preloader,
        NotFoundScreen
    },
    watch: {
        nodeInfo(newVl) {
            this.getData();
        },
        countRecordSelected(newVl) {
            this.selectedAllTask(newVl);
        }
    },
    computed: {
        fileCountPerTask() {
            return this.$store.state.file.fileCountPerObj.list;
        },
        commentCountPerTask() {
            return this.$store.state.comment.commentCountPerObj.list;
        },
        listTaskApproval() {
            let allTask = this.allTaskInNode;
            let listTaskApproval = [];
            for (var key in allTask) {
                if (
                    allTask[key].description &&
                    allTask[key].description != null
                ) {
                    let desc = JSON.parse(allTask[key].description);
                    let action = desc.action;
                    if (action.action == 'approval') {
                        allTask[key].taskData = JSON.parse(
                            allTask[key].description
                        );
                        allTask[key] = addMoreInfoToTask(allTask[key]);
                        this.$set(allTask[key], 'checked', false);
                        listTaskApproval.push(allTask[key]);
                    }
                }
            }
            return listTaskApproval;
        }
    },
    data() {
        return {
            loadingTaskList: true,
            allTaskInNode: [],
            index: -1,
            selectObj: -1,
            docObjInfo: {
                docObjId: ''
            },
            selectedTask: {
                taskInfo: {},
                idx: -1,
                originData: null,
                appId: ''
            }
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
        closeDetail() {
            this.$emit('closeDetail');
        },
        selectNameApp(variables) {
            const symperAppId = variables.find(
                (element) => element.name == 'symper_application_id'
            );
            if (symperAppId) {
                let appId = symperAppId.value;
                let allApp = this.$store.state.task.allAppActive;
                let app = allApp.find((element) => element.id == appId);
                if (app) {
                    return app.name;
                } else {
                    return '';
                }
            } else {
                return '';
            }
        },
        closeDetail() {
            this.$emit('changeSideBySide', false);
        },
        async getData() {
            try {
                this.loadingTaskList = true;
                let self = this;
                if (self.nodeInfo.process_definition_id) {
                    let filter = {};
                    filter.sort = 'createTime';
                    filter.order = 'desc';
                    filter.assigneeLike =
                        self.$store.state.app.endUserInfo.id + '%';
                    filter.processDefinitionId =
                        self.nodeInfo.process_definition_id;
                    filter.taskDefinitionKey = self.nodeInfo.activity_id;
                    filter.includeProcessVariables = true;
                    filter.size = 30;
                    let res = await BPMNEngine.getTask(filter);
                    self.allTaskInNode = res.data;
                    self.$emit('size-query-task', res.size);
                }
            } catch (error) {
            } finally {
                this.loadingTaskList = false;
            }
        },
        selectObject(obj, idx) {
            this.selectObj = idx;
            let taskInfo = extractTaskInfoFromObject(obj);
            let appId = '';
            const objApp = obj.variables.find(
                (element) => element.name == 'symper_application_id'
            );
            if (objApp) {
                appId = objApp.value;
            }
            this.$set(this.selectedTask, 'originData', obj);
            this.$set(this.selectedTask, 'taskInfo', taskInfo);
            this.$set(this.selectedTask, 'appId', appId);
            this.$emit('changeSideBySide', true);
        },
        selectedAllTask(value) {
            let allTask = this.listTaskApproval;
            if (value == 0) {
                for (var key in allTask) {
                    this.$set(this.listTaskApproval[key], 'checked', false);
                }
            } else if (value == this.listTaskApproval.length) {
                for (var key in allTask) {
                    this.$set(this.listTaskApproval[key], 'checked', true);
                }
            }
            this.$emit('changeValueCheckBox', this.listTaskApproval);
        },
        changeValueCheckBox() {
            this.$emit('changeValueCheckBox', this.listTaskApproval);
        }
    },
    created() {
        this.getData();
    }
};
</script>

<style scoped>
.d-active {
    background: #f5f5f5;
}
.detailDoc >>> .wrap-content-detail {
    height: calc(100%) !important;
}
.approval-taskDetail {
    position: relative;
}
.approval-taskDetail >>> .justify-space-between {
    margin-right: 20px !important;
}
.approval-taskDetail >>> .detail-task .s-drawer {
    top: 0px !important;
    padding: 12px;
}
.approval-taskDetail >>> .doc-detail .s-drawer {
    top: 0px !important;
    padding: 12px;
}
.approval-taskDetail >>> .task-header {
    line-height: 39px !important;
}
</style>

<template>
    <div class="d-flex">
        <div class="d-flex" v-if="objectType == 0">
            <div
                cols="1"
                :style="{ width: mapRealColWidth['type'] }"
                class="fs-12 px-1 py-0"
            >
                <div class="pt-1">
                    <template v-if="openCheckBox">
                        <input
                            type="checkbox"
                            v-if="haveCheckBox"
                            v-model="checkbox"
                            @click.stop=""
                            class="mt-2"
                            style="transform: scale(1.2)"
                        />
                        <div v-else class="ms-2"></div>
                    </template>
                    <template v-else>
                        <v-icon class="fs-14" v-if="obj.taskData.action">{{
                            obj.taskData.action.action == 'approval'
                                ? 'mdi-seal-variant '
                                : 'mdi-file-document-edit-outline'
                        }}</v-icon>
                        <i
                            v-else
                            class="fs-14 mdi mdi-checkbox-marked-circle-outline"
                        ></i>
                    </template>
                </div>

                <div
                    v-if="sideBySideMode"
                    :class="obj.dueDateClass"
                    style="
                        height: 8px;
                        width: 8px;
                        display: inline-block;
                        border-radius: 50%;
                        margin-top: 8px;
                        margin-left: 3px;
                    "
                    :style="{
                        'background-color': obj.dueDateClass
                    }"
                ></div>
            </div>
            <div
                :class="{
                    colName: sideBySideMode == true
                }"
                :style="{ width: mapRealColWidth['name'] }"
                class="pa-1"
            >
                <div class="pl-1">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <div class="d-flex">
                                <div
                                    v-on="on"
                                    class="text-left fs-13 text-ellipsis w-100"
                                >
                                    {{ obj.taskData.content }}
                                </div>
                            </div>
                        </template>
                        <span>{{ obj.taskData.content }}</span>
                    </v-tooltip>
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
                        <div
                            class="flex-grow-1 fs-11 pr-2 text-ellipsis"
                            style="width: 60%"
                        >
                            {{ obj.taskData.extraLabel }}
                            {{ obj.taskData.extraValue }}
                        </div>
                        <div class="d-flex">
                            <div
                                class="mr-1"
                                v-if="
                                    commentCountPerTask[
                                        commentIdentifier(obj)
                                    ] > 0
                                "
                            >
                                <span>
                                    {{
                                        commentCountPerTask[
                                            commentIdentifier(obj)
                                        ]
                                    }}
                                </span>
                                <v-icon small
                                    >mdi-comment-processing-outline</v-icon
                                >
                            </div>
                            <div v-if="fileCountPerTask['task:' + obj.id] > 0">
                                <span>
                                    {{ fileCountPerTask['task:' + obj.id] }}
                                </span>
                                <v-icon small>mdi-attachment</v-icon>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-show="!sideBySideMode"
                class="fs-13 py-0 px-4 text-ellipsis my-auto"
                :style="{ width: mapRealColWidth['startDate'] }"
            >
                {{ obj.createTimeDisplay }}
            </div>
            <div
                v-show="!sideBySideMode"
                class="fs-12 px-4 py-0 pt-2"
                :style="{ width: mapRealColWidth['assignee'] }"
            >
                <infoUser
                    v-if="obj.assigneeInfo.id"
                    class="userInfo"
                    :userId="obj.assigneeInfo.id"
                    :roleInfo="obj.assigneeRole ? obj.assigneeRole : {}"
                />
            </div>
            <div
                v-show="!sideBySideMode"
                class="fs-12 px-4 py-0 pt-2"
                :style="{ width: mapRealColWidth['owner'] }"
            >
                <infoUser
                    class="userInfo"
                    :userId="
                        obj.ownerInfo.id
                            ? obj.ownerInfo.id
                            : obj.assigneeInfo.id
                    "
                    :roleInfo="obj.ownerRole ? obj.ownerRole : obj.assigneeRole"
                />
            </div>
            <div
                v-show="!sideBySideMode"
                class="fs-13 px-4 py-0 text-ellipsis"
                :style="{ width: mapRealColWidth['dueDate'] }"
            >
                <div class="pt-3">
                    {{ obj.dueDateFromNow }}
                </div>
            </div>
            <div
                class="py-0 px-4 text-ellipsis"
                :style="{ width: mapRealColWidth['processDefinitionName'] }"
                v-if="!sideBySideMode && !smallComponentMode"
            >
                <div
                    class="pl-1 pt-1"
                    :class="{
                        'pt-3': !obj.symperApplicationName
                    }"
                >
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <div
                                v-on="on"
                                v-if="obj.processInstanceId"
                                class="text-left fs-13 pr-1 text-ellipsis"
                            >
                                {{ obj.processDefinitionName }}
                            </div>
                            <div
                                v-on="on"
                                v-else
                                class="text-left fs-13 pr-1 text-ellipsis"
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
                            mt-1
                            lighten-2
                            d-flex
                            justify-space-between
                        "
                    >
                        <div class="fs-11 pr-6 text-ellipsis">
                            {{ obj.symperApplicationName }}
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-show="!sideBySideMode"
                :style="{ width: mapRealColWidth['statusText'] }"
                class="fs-13 px-4 py-0"
            >
                <div class="pt-3">
                    <v-chip
                        :color="obj.dueDateClass"
                        text-color="white"
                        style="border-radius: 4px"
                        x-small
                        >{{ obj.dueDateText }}</v-chip
                    >
                </div>
            </div>
        </div>
        <div class="d-flex" v-else-if="objectType == 1">
            <div
                :style="{ width: mapRealColWidth['name'] }"
                class="pl-3 pr-1 py1"
            >
                <div class="pl-1">
                    <div class="pa-0">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <div
                                    class="fs-13 text-ellipsis w-100"
                                    v-on="on"
                                >
                                    <v-icon
                                        v-if="
                                            obj.endTime && obj.endTime != null
                                        "
                                        style="
                                            font-size: 11px;
                                            color: #408137;
                                            margin-left: 3px;
                                        "
                                        >mdi-circle</v-icon
                                    >
                                    <v-icon
                                        v-else
                                        style="
                                            font-size: 11px;
                                            color: #0760d9;
                                            margin-left: 3px;
                                        "
                                        >mdi-circle</v-icon
                                    >
                                    {{ obj.name }}
                                </div>
                            </template>
                            <span>{{ obj.name }}</span>
                        </v-tooltip>
                        <div class="d-flex flex-column">
                            <div
                                class="mr-1 d-flex"
                                v-if="commentCountPerTask['work:' + obj.id] > 0"
                            >
                                <span class="mr-1">
                                    {{ commentCountPerTask['work:' + obj.id] }}
                                </span>
                                <v-icon small
                                    >mdi-comment-processing-outline</v-icon
                                >
                            </div>

                            <div
                                class="d-flex"
                                v-if="fileCountPerTask['work:' + obj.id] > 0"
                            >
                                <span class="mr-1">
                                    {{ fileCountPerTask['work:' + obj.id] }}
                                </span>
                                <v-icon small>mdi-attachment</v-icon>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-if="!sideBySideMode"
                :style="{ width: mapRealColWidth['timeCreate'] }"
                class="fs-13 px-1 py-0 pt-2 text-ellipsis"
            >
                {{
                    obj.startTime
                        ? $moment(obj.startTime).format('DD/MM/YY HH:mm:ss')
                        : $moment(obj.endTime).format('DD/MM/YY HH:mm:ss')
                }}
            </div>
            <div
                v-if="!sideBySideMode"
                :style="{ width: mapRealColWidth['userCreate'] }"
                class="fs-12 px-1 py-0 pt-2 text-ellipsis"
            >
                <infoUser
                    class="userInfo"
                    :userId="String(obj.startUserId)"
                    :roleInfo="obj.roleInfo"
                />
            </div>
            <div
                class="py-0 text-ellipsis"
                :style="{ width: mapRealColWidth['processDefinitionName'] }"
                v-if="!sideBySideMode && !smallComponentMode"
            >
                <div
                    class="pt-1"
                    :class="{
                        'pt-3': !obj.symperApplicationName
                    }"
                >
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <div
                                v-on="on"
                                v-if="obj.processDefinitionName"
                                class="text-left fs-13 pr-1 text-ellipsis"
                            >
                                {{ obj.processDefinitionName }}
                            </div>
                            <span
                                v-on="on"
                                v-else
                                class="text-left fs-13 pr-1 text-ellipsis"
                                >{{ $t('v2.myItem.adHoc') }}</span
                            >
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
                            mt-1
                            lighten-2
                            d-flex
                            justify-space-between
                        "
                    >
                        {{ obj.symperApplicationName }}
                    </div>
                </div>
            </div>
            <div
                v-if="!sideBySideMode"
                :style="{ width: mapRealColWidth['status'] }"
                class="fs-13 px-1 py-0 text-ellipsis"
            >
                <div class="pt-3">
                    <v-chip
                        v-if="!obj.endTime"
                        color="#0760D9"
                        class="px-2"
                        text-color="white"
                        style="border-radius: 4px"
                        x-small
                        >{{ $t('myItem.unfinished') }}</v-chip
                    >

                    <v-chip
                        class="px-2"
                        style="border-radius: 4px"
                        v-else
                        color="#408137"
                        text-color="white"
                        x-small
                        >{{ $t('common.done') }}</v-chip
                    >
                </div>
            </div>
        </div>
        <div v-else class="d-flex">
            <div
                :style="{ width: mapRealColWidth['name'] }"
                class="pl-3 pr-1 pb-1 pt-1 text-ellipsis"
            >
                <div>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <div
                                v-on="on"
                                class="text-left fs-13 text-ellipsis w-100"
                            >
                                <v-icon class="fs-14">
                                    mdi-file-document-edit-outline
                                </v-icon>
                                {{ obj.title ? obj.title : obj.titleObject }}
                            </div>
                        </template>
                        <span>
                            {{ obj.title ? obj.title : obj.titleObject }}</span
                        >
                    </v-tooltip>
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
                        <div class="fs-11 text-ellipsis">
                            <v-icon
                                style="
                                    font-size: 11px;
                                    color: green;
                                    margin-left: 1px;
                                    padding-bottom: 3px;
                                "
                                >mdi-circle</v-icon
                            >
                            {{ obj.documentInfo ? obj.documentInfo.title : '' }}
                        </div>
                    </div>
                </div>
            </div>
            <div
                style="line-height: 42px"
                :style="{ width: mapRealColWidth['timeCreate'] }"
                class="pl-3 fs-13 px-1 py-0 text-ellipsis"
                v-if="!sideBySideMode"
            >
                {{
                    obj.createAt
                        ? $moment(obj.createAt).format('DD/MM/YY HH:mm:ss')
                        : $moment(obj.createat).format('DD/MM/YY HH:mm:ss')
                }}
            </div>
            <div
                style="line-height: 42px"
                :style="{ width: mapRealColWidth['userCreate'] }"
                class="pl-3 fs-13 px-1 py-0 text-ellipsis"
                v-if="!sideBySideMode"
            >
                <infoUser
                    v-if="obj.userId && obj.userId > 0"
                    class="userInfo"
                    :userId="obj.userId"
                    :roleInfo="{}"
                />
            </div>
            <div
                style="line-height: 42px"
                :style="{ width: mapRealColWidth['processDefinitionName'] }"
                class="pl-3 fs-13 px-1 py-0 text-ellipsis"
                v-if="!sideBySideMode"
            >
                <div class="pl-1 pa-3">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <span
                                v-on="on"
                                class="text-left fs-13 text-ellipsis"
                            >
                                {{ showNameApp(obj.appId) }}
                            </span>
                        </template>
                        <span>aaa</span>
                    </v-tooltip>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import infoUser from '@/components/myItem/InfoUser';
import { checkIsDeleted } from '../utilMyitem.js';

export default {
    props: {
        openCheckBox: { type: Boolean, default: false },
        obj: {
            type: Object,
            default() {
                return {};
            }
        },
        sideBySideMode: {
            type: Boolean,
            default: false
        },
        smallComponentMode: {
            type: Boolean,
            default: false
        },
        smallSize: {
            type: Boolean,
            default: false
        },
        compackMode: {
            type: Boolean,
            default: false
        },
        commentCountPerTask: {
            type: Object
        },
        fileCountPerTask: {
            type: Object
        },
        mapRealColWidth: {
            type: Object,
            default() {
                return {};
            }
        },
        objectType: {
            type: Number
        }
    },
    data() {
        return {
            haveCheckBox: false,
            checkbox: false,
            flag: true,
            widthColMapping: {
                0: {
                    type: 0.3,
                    name: 3,
                    startDate: 1,
                    assignee: 2,
                    owner: 1.7,
                    dueDate: 1.3,
                    processDefinitionName: 1.3,
                    status: 1
                },
                1: {
                    name: 5,
                    timeCreate: 2,
                    userCreate: 2,
                    processDefinitionName: 2.5,
                    status: 1
                },
                2: {
                    name: 3,
                    timeCreate: 3,
                    userCreate: 3,
                    processDefinitionName: 3
                }
            }
        };
    },
    components: {
        infoUser
    },
    created() {
        this.haveCheckBox = checkIsDeleted(
            this.obj,
            this.$store.state.app.endUserInfo.id
        );
    },
    watch: {
        checkbox(val) {
            let k = {
                isChosen: val,
                task: this.obj
            };
            this.$emit('check-box-change', k);
        }
    },
    methods: {
        commentIdentifier(obj) {
            if (
                obj.taskData.action &&
                obj.taskData.action.parameter &&
                obj.taskData.action.parameter.documentObjectId
            ) {
                return (
                    'document-instance:' +
                    obj.taskData.action.parameter.documentObjectId
                );
            } else {
                return 'task:' + obj.id;
            }
        },
        reCaculatedStyle(data) {
            this.flag = false;
            this.$set(this, 'flag', true);
        },
        showNameApp(appId) {
            if (appId != null) {
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
        }
    }
};
</script>

<style></style>

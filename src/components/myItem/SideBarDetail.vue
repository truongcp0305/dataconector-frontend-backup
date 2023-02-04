<template>
    <v-navigation-drawer
        class="s-drawer"
        absolute
        permanent
        right
        :width="sidebarWidthReduce"
        v-if="isShowSidebar"
        :style="{
            transform: isShowSidebar ? 'translateX(0%)' : 'translateX(100%)',
            padding: showMainInfo ? '12px 6px 6px 12px' : ''
        }"
    >
        <div v-if="showMainInfo" class="main-info d-flex w-100">
            <div :style="{ width: sidebarWidth + 'px' }">
                <div style="display: flex">
                    <span class="flex-grow-1" style="font-size: 15px">{{
                        $t('document.detail.sidebar.heading')
                    }}</span>
                    <v-btn
                        tile
                        x-small
                        class="mr-1"
                        v-if="!showHistoryTask"
                        @click="handlerShowHistoryClick"
                    >
                        <v-icon small class="mr-1"> mdi-history </v-icon>
                        {{ $t('myItem.sidebar.history') }}
                    </v-btn>
                    <span class="mdi mdi-close" @click="hide"></span>
                </div>
                <v-divider></v-divider>
                <VuePerfectScrollbar style="height: calc(100% - 20px)">
                    <v-expansion-panels
                        v-model="panel"
                        multiple
                        class="s-detail-sidebar"
                        style="overflow-x: hidden"
                    >
                        <v-expansion-panel>
                            <v-expansion-panel-header class="v-expand-header">{{
                                $t('document.detail.sidebar.body.general.title')
                            }}</v-expansion-panel-header>
                            <v-expansion-panel-content
                                class="sym-v-expand-content"
                            >
                                <div>
                                    <table class="general-info">
                                        <tr>
                                            <td>
                                                {{
                                                    $t(
                                                        'document.detail.sidebar.body.general.dateCreate'
                                                    )
                                                }}
                                            </td>
                                            <td class="pl-2">
                                                {{
                                                    originData.createTime
                                                        ? $moment(
                                                              originData.createTime
                                                          ).format(
                                                              'DD/MM/YY HH:mm:ss'
                                                          )
                                                        : $moment(
                                                              originData.startTime
                                                          ).format(
                                                              'DD/MM/YY HH:mm:ss'
                                                          )
                                                }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                {{ $t('tasks.header.dueDate') }}
                                            </td>
                                            <td class="pl-2">
                                                {{
                                                    originData.dueDate
                                                        ? $moment(
                                                              originData.dueDate
                                                          )
                                                              .lang(
                                                                  $i18n.locale
                                                              )
                                                              .fromNow()
                                                        : ''
                                                }}
                                            </td>
                                        </tr>
                                        <tr v-if="originData.endTime">
                                            <td>
                                                {{ $t('tasks.header.endTime') }}
                                            </td>
                                            <td class="pl-2">
                                                {{
                                                    $moment(originData.endTime)
                                                        .lang($i18n.locale)
                                                        .fromNow()
                                                }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                {{
                                                    $t(
                                                        'tasks.header.description'
                                                    )
                                                }}
                                            </td>
                                            <td class="pl-2">
                                                <v-tooltip bottom>
                                                    <template
                                                        v-slot:activator="{
                                                            on
                                                        }"
                                                    >
                                                        <div
                                                            v-on="on"
                                                            class="
                                                                text-ellipsis
                                                            "
                                                            style="width: 250px"
                                                        >
                                                            {{
                                                                taskInfo.extraLabel
                                                            }}
                                                            {{
                                                                taskInfo.extraValue
                                                            }}
                                                        </div>
                                                    </template>
                                                    <span
                                                        >{{
                                                            taskInfo.extraLabel
                                                        }}
                                                        {{
                                                            taskInfo.extraValue
                                                        }}</span
                                                    >
                                                </v-tooltip>
                                            </td>
                                        </tr>
                                        <tr v-if="showCommentInSideBar">
                                            <td>
                                                {{
                                                    $t(
                                                        'document.detail.sidebar.body.general.comment'
                                                    )
                                                }}
                                            </td>
                                            <!-- <td class="pl-2" style="text-decoration: underline;cursor:pointer;color:#F1853B;" @click="showComment" v-if="objectInfoForComment.id">
											{{$t('document.detail.sidebar.body.general.has')}} 
											{{countCommentNotResolve}} 
											{{$t('document.detail.sidebar.body.general.commentNotResolve')}}
										</td> -->
                                            <td
                                                class="pl-2"
                                                style="
                                                    text-decoration: underline;
                                                    cursor: pointer;
                                                    color: #f1853b;
                                                "
                                                @click="showComment"
                                                v-if="objectInfoForComment.id"
                                            >
                                                {{
                                                    $t(
                                                        'document.detail.sidebar.body.general.clickToViewComment'
                                                    )
                                                }}
                                            </td>
                                            <td class="pl-2 grey--text" v-else>
                                                {{
                                                    $t(
                                                        'document.detail.comment.submitRecordToComment'
                                                    )
                                                }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                {{
                                                    $t(
                                                        'document.detail.sidebar.body.general.listWorks'
                                                    )
                                                }}
                                            </td>
                                            <td
                                                class="pl-2"
                                                style="
                                                    text-decoration: underline;
                                                    cursor: pointer;
                                                    color: #f1853b;
                                                "
                                                @click="
                                                    showListWork(originData)
                                                "
                                            >
                                                {{
                                                    $t(
                                                        'document.detail.sidebar.body.general.clickToViewListWork'
                                                    )
                                                }}
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </v-expansion-panel-content>
                        </v-expansion-panel>

                        <v-expansion-panel>
                            <v-expansion-panel-header class="v-expand-header">{{
                                $t('document.detail.sidebar.body.workflowProgress')
                            }}</v-expansion-panel-header>
                            <v-expansion-panel-content
                                class="sym-v-expand-content border-top-1"
                                style="height: 200px"
                            >
                                <v-row class="ma-0" style="height: 200px">
                                    <trackingProcessInstance
                                        class="popup-model-diagram"
                                        v-if="
                                            taskInfo.action.parameter
                                                .processInstanceId
                                        "
                                        :instanceId="
                                            taskInfo.action.parameter
                                                .processInstanceId
                                        "
                                        :elementId="
                                            taskInfo.action.parameter.activityId
                                        "
                                        @showPopupDiagram="showPopupDiagram"
                                    >
                                    </trackingProcessInstance>
                                </v-row>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                        <v-expansion-panel>
                            <v-expansion-panel-header class="v-expand-header">{{
                                $t(
                                    'document.detail.sidebar.body.userRelated.title'
                                )
                            }}</v-expansion-panel-header>
                            <v-expansion-panel-content
                                class="sym-v-expand-content"
                            >
                                <div
                                    class="w-100 pl-2"
                                    v-for="(users, role) in dataTask"
                                    :key="role"
                                >
                                    <div
                                        v-if="users.length > 0"
                                        class="
                                            fs-13
                                            font-weight-medium
                                            symper-user-role-in-task
                                            d-flex
                                        "
                                    >
                                        <span>
                                            <v-icon class="mr-3" size="18"
                                                >mdi-account</v-icon
                                            >
                                            <span mt-1>{{
                                                $t('tasks.header.' + role)
                                            }}</span>
                                        </span>
                                    </div>
                                    <div
                                        class="
                                            pl-7
                                            d-flex
                                            justify-space-between
                                            user-show
                                        "
                                        v-for="userItem in tabsData[role]"
                                        :key="userItem.id"
                                    >
                                        <infoUser
                                            class="userInfo"
                                            :userId="userItem.id"
                                        />
                                        <div
                                            class="
                                                float-right
                                                action-for-role
                                                d-flex
                                            "
                                        >
                                            <div
                                                v-for="(
                                                    btn, idx
                                                ) in actionsForRole[role]"
                                                :key="idx"
                                                class="d-flex"
                                            >
                                                <v-menu
                                                    v-if="
                                                        btn.showUserSelect ==
                                                        true
                                                    "
                                                    v-model="
                                                        showDelegatedUser[
                                                            role + '_' + idx
                                                        ]
                                                    "
                                                    :offset-y="true"
                                                    class="
                                                        symper-select-user-autocomplete
                                                    "
                                                    :close-on-content-click="
                                                        false
                                                    "
                                                    :close-on-click="false"
                                                >
                                                    <template
                                                        v-slot:activator="{
                                                            on: menu,
                                                            attrs
                                                        }"
                                                    >
                                                        <v-tooltip bottom>
                                                            <template
                                                                v-slot:activator="{
                                                                    on: tooltip
                                                                }"
                                                            >
                                                                <v-btn
                                                                    text
                                                                    v-bind="
                                                                        attrs
                                                                    "
                                                                    depressed
                                                                    v-on="{
                                                                        ...tooltip,
                                                                        ...menu
                                                                    }"
                                                                    class="mr-3"
                                                                    small
                                                                    @click="
                                                                        handleAction(
                                                                            btn.name,
                                                                            role,
                                                                            idx
                                                                        )
                                                                    "
                                                                >
                                                                    <v-icon
                                                                        left
                                                                        >{{
                                                                            btn.icon
                                                                        }}</v-icon
                                                                    >
                                                                    {{
                                                                        btn.text
                                                                    }}
                                                                </v-btn>
                                                            </template>
                                                            <span>{{
                                                                btn.text
                                                            }}</span>
                                                        </v-tooltip>
                                                    </template>
                                                    <div
                                                        class="bg-white"
                                                        style="
                                                            width: 200px;
                                                            z-index: 1002;
                                                        "
                                                        :ref="
                                                            'selectUserWrapper_' +
                                                            role +
                                                            '_' +
                                                            idx
                                                        "
                                                    ></div>
                                                </v-menu>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                        <v-expansion-panel>
                            <v-expansion-panel-header class="v-expand-header">{{
                                $t('tasks.header.relatedTask')
                            }}</v-expansion-panel-header>
                            <v-expansion-panel-content
                                class="sym-v-expand-content"
                            >
                                <RelatedItems
                                    :taskInfo="taskInfo"
                                    :tabsData="tabsData"
                                    :appId="appId"
                                    :showMoreTask="showMoreTask"
                                />
                                <span
                                    class="showMoreRelated"
                                    @click="handleShowMoreTask"
                                    v-if="!showMoreTask"
                                    >{{
                                        $t('myItem.sidebar.showMoreTask')
                                    }}</span
                                >
                                <span
                                    class="showMoreRelated"
                                    @click="handleShowMoreTask"
                                    v-else
                                    >{{ $t('myItem.sidebar.showLess') }}</span
                                >
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                        <v-expansion-panel style="margin-bottom: 20px">
                            <v-expansion-panel-header
                                style="padding: 0px"
                                class="v-expand-header"
                                >{{ $t('tasks.header.attachment') }}
                                <UploadFile
                                    @uploaded-file="uploaded"
                                    :objectIdentifier="
                                        taskInfo.action.parameter.taskId
                                    "
                                    :objectType="`task`"
                                    :iconName="`mdi-upload-outline`"
                                />
                            </v-expansion-panel-header>
                            <v-expansion-panel-content
                                class="sym-v-expand-content"
                            >
                                <div
                                    v-for="(item, idex) in listFileAttachment"
                                    :key="idex"
                                >
                                    <v-row
                                        :class="{
                                            'mr-0 ml-0 single-row': true,
                                            'd-active': showByIndex == idex
                                        }"
                                        :style="{
                                            minHeight: '25px'
                                        }"
                                        v-if="checkShowMoreFile(idex)"
                                        @mouseover="showByIndex = idex"
                                        @mouseout="showByIndex = null"
                                    >
                                        <v-col
                                            @click="previewFile(idex)"
                                            cols="5"
                                            style="
                                                font-size: 13px;
                                                padding: 0px;
                                                padding-top: 3px !important;
                                            "
                                        >
                                            <v-tooltip bottom>
                                                <template
                                                    v-slot:activator="{ on }"
                                                >
                                                    <div
                                                        v-on="on"
                                                        style="
                                                            font-size: 12px;
                                                            padding: 0px;
                                                            white-space: nowrap;
                                                            overflow: hidden;
                                                            text-overflow: ellipsis;
                                                            display: flex;
                                                        "
                                                    >
                                                        <v-icon
                                                            v-if="
                                                                item.type ==
                                                                    'doc' ||
                                                                item.type ==
                                                                    'docx'
                                                            "
                                                            style="
                                                                font-size: 15px;
                                                            "
                                                            >mdi-file-word</v-icon
                                                        >
                                                        <v-icon
                                                            v-else-if="
                                                                item.type ==
                                                                'pdf'
                                                            "
                                                            style="
                                                                font-size: 15px;
                                                            "
                                                            >mdi-file-pdf</v-icon
                                                        >
                                                        <v-icon
                                                            v-else-if="
                                                                item.type ==
                                                                    'jpg' ||
                                                                item.type ==
                                                                    'jpeg' ||
                                                                item.type ==
                                                                    'png'
                                                            "
                                                            style="
                                                                font-size: 15px;
                                                            "
                                                            >mdi-file-image-outline</v-icon
                                                        >
                                                        <v-icon
                                                            v-else-if="
                                                                item.type ==
                                                                    'xlsx' ||
                                                                item.type ==
                                                                    'xls'
                                                            "
                                                            style="
                                                                font-size: 15px;
                                                            "
                                                            >mdi-file-excel</v-icon
                                                        >
                                                        <v-icon
                                                            v-else
                                                            style="
                                                                font-size: 15px;
                                                            "
                                                            >mdi-file-document-outline</v-icon
                                                        >
                                                        <v-list-item-title
                                                            :id="
                                                                `file-` +
                                                                item.id
                                                            "
                                                            v-on="on"
                                                            class="fs-13"
                                                            v-text="item.name"
                                                        ></v-list-item-title>
                                                    </div>
                                                </template>
                                                <span>{{ item.name }}</span>
                                            </v-tooltip>
                                        </v-col>
                                        <v-col
                                            cols="4"
                                            style="
                                                font-size: 12px;
                                                padding: 0px;
                                                padding-top: 3px !important;
                                            "
                                        >
                                            <span class="text-ellipsis w-100">{{
                                                item.createAt
                                            }}</span>
                                        </v-col>
                                        <v-col
                                            style="
                                                padding: 0px;
                                                padding-top: 4px !important;
                                            "
                                        >
                                            <v-icon
                                                @click="downLoadFile(item.id)"
                                                v-show="showByIndex === idex"
                                                style="
                                                    font-size: 18px;
                                                    margin-left: 40px;
                                                "
                                                >mdi-download</v-icon
                                            >
                                            <v-icon
                                                @click="
                                                    actionFileAttachment(
                                                        $event,
                                                        item.serverPath,
                                                        item.name,
                                                        item.type,
                                                        item.id
                                                    )
                                                "
                                                v-show="showByIndex === idex"
                                                style="
                                                    font-size: 18px;
                                                    margin-left: 8px;
                                                "
                                                >mdi-dots-horizontal</v-icon
                                            >
                                        </v-col>
                                    </v-row>
                                    <v-menu
                                        v-model="context_attachment"
                                        :position-x="x"
                                        :position-y="y"
                                        absolute
                                        offset-y
                                    >
                                        <v-list class="context-menu">
                                            <v-list-item
                                                v-for="(
                                                    item, index
                                                ) in contextAttachment"
                                                :key="index"
                                                @click="
                                                    item.menuAction(item.title)
                                                "
                                                dense
                                            >
                                                <v-icon class="fs-15">{{
                                                    item.icon
                                                }}</v-icon>
                                                <v-list-item-title
                                                    class="fs-13"
                                                    >{{
                                                        item.title
                                                    }}</v-list-item-title
                                                >
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </div>
                                <span
                                    class="showMoreRelated"
                                    @click="handleShowMoreFile"
                                    v-if="!showMoreFile"
                                    >{{
                                        $t('myItem.sidebar.showMoreFile')
                                    }}</span
                                >
                                <span
                                    class="showMoreRelated"
                                    @click="handleShowMoreFile"
                                    v-else
                                    >{{ $t('myItem.sidebar.showLess') }}</span
                                >
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </VuePerfectScrollbar>
            </div>
            <div
                v-if="showHistoryTask"
                style="width: 300px; border-left: 1px solid lightgray"
                class="d-flex flex-column"
            >
                <div class="d-flex">
                    <v-btn tile x-small class="mr-1 ml-1" disabled>
                        <v-icon small class="mr-1"> mdi-history </v-icon>
                        {{ $t('myItem.sidebar.history') }}
                    </v-btn>
                    <v-icon @click="showHistoryTask = false"> mdi-close</v-icon>
                </div>
                <div>
                    <HistoryTask />
                </div>
            </div>
        </div>

        <Comment2
            :isViewSidebar="true"
            :objectIdentifier="objectInfoForComment.id"
            :objectType="objectInfoForComment.type"
            @hide-comment-panel="hideCommentPanel"
            :show-btn-close="true"
            :show-room-header="true"
            @preview-picture-comment="previewPictureComment"
            ref="commentTaskView"
            v-show="!showMainInfo"
        />

        <div
            class="w-100 h-100 symper-select-user-autocomplete"
            style="z-index: 1010"
            v-show="statusChange"
            ref="selectUserAutocomplete"
        >
            <v-autocomplete
                ref="selectDelegateUser"
                return-object
                full-width
                solo
                append-icon=""
                :items="sapp.allUsers"
                background-color="grey lighten-4"
                flat
                v-model="selectedUserForAssignment"
                dense
                color="blue-grey lighten-2"
                :label="$t('common.search')"
                item-text="displayName"
                @change="changeUserSelect"
                item-value="name"
                :filter="filterUser"
            >
                <template v-slot:item="data">
                    <div class="fs-13 py-1">
                        <i class="mdi mdi-account mr-2 fs-16"> </i>
                        <span> {{ data.item.displayName }}</span>
                    </div>
                </template>
            </v-autocomplete>
        </div>
        <LightBox
            :isShowStar="false"
            :isSetMain="false"
            ref="lightbox"
            :media="listFileAttachment"
            :show-caption="true"
            :show-light-box="true"
        />
        <LightBox
            :isShowStar="false"
            :isSetMain="false"
            ref="lightboxComment"
            :media="listImage"
            :show-caption="true"
            :show-light-box="true"
            :imgWidth="'80%'"
        />
        <v-dialog v-model="dialogAlert" max-width="450">
            <v-card>
                <v-card-title class="headline">{{ headerDialog }}</v-card-title>
                <v-card-text>{{ titleDialog }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="green darken-1"
                        text
                        @click="removeFileAttach"
                        >{{ $t('kh.dialog.yes') }}</v-btn
                    >
                    <v-btn
                        color="red darken-1"
                        text
                        @click="dialogAlert = false"
                        >{{ $t('kh.dialog.cancel') }}</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
        <PreviewFile ref="previewFile" :fileInfor="fileInfor" />
    </v-navigation-drawer>
</template>
<script>
import { taskApi } from '@/api/task.js';
import BPMNEngine from '@/api/BPMNEngine.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import trackingProcessInstance from '@/views/process/TrackingProcessInstance.vue';
import UploadFile from '@/components/common/UploadFile.vue';
import RelatedItems from './RelatedItems.vue';
import infoUser from './InfoUser';
import HistoryTask from './taskLifeCycle/HistoryTask';
import LightBox from '@/components/common/imageSlideShow/LightBox';
import Comment2 from '@/components/common/commentVer2/Comment2.vue';
import PreviewFile from '@/components/common/PreviewFile';

export default {
    components: {
        VuePerfectScrollbar,
        trackingProcessInstance,
        UploadFile,
        RelatedItems,
        infoUser,
        HistoryTask,
        LightBox,
        Comment2,
        PreviewFile
    },
    data() {
        return {
            x: 0,
            y: 0,
            showMoreTask: false,
            showMoreFile: false,
            headerDialog: '',
            titleDialog: '',
            fileInfor: {},
            dialogAlert: false,
            context_attachment: false,
            showByIndex: null,
            selectingPosition: {
                role: '',
                idx: ''
            },
            selectedUserForAssignment: {},
            statusChange: false,
            showDelegatedUser: {},
            panel: [0, 1, 2, 3, 4],
            userCreate: '',
            createdDate: '',
            workflowName: '',
            workflowOtherName: '',
            showHistoryTask: false,
            showMainInfo: true,
            contextAttachment: [
                {
                    title: this.$t('kh.contextmenu.rename'),
                    menuAction: (action) => {
                        let id = this.fileId;
                        let name = this.name;
                        var renameInput = $(
                            '<input id=' +
                                'file-' +
                                id +
                                ' value=' +
                                name +
                                ' >'
                        );
                        $('#file-' + id).replaceWith(renameInput);
                        $('#file-' + id).val(name);
                        renameInput.on('blur', function (evt) {
                            $(this).replaceWith(
                                '<div id=' +
                                    'file-' +
                                    id +
                                    " class='v-list-item__title fs-13'>" +
                                    name +
                                    ' </div>'
                            );
                        });

                        setTimeout(function () {
                            $('#file-' + id)
                                .focus()
                                .val(name)
                                .select();
                        }, 200);
                        $('#file-' + id).keyup(function (e) {
                            if (e.keyCode === 13) {
                                var text = $('#file-' + id)
                                    .val()
                                    .trim();

                                if (text != '' && text != name) {
                                    let data = {};
                                    data.id = id;
                                    data.newName = text;
                                    taskApi
                                        .renameFile(data)
                                        .then((res) => {
                                            if (res.status == 200) {
                                                $(this).replaceWith(
                                                    '<div id=' +
                                                        'file-' +
                                                        id +
                                                        " class='v-list-item__title fs-13'>" +
                                                        text +
                                                        ' </div>'
                                                );
                                            } else if (res.status == 403) {
                                                SYMPER_APP.$snotifyError(
                                                    'Error',
                                                    res.message
                                                );
                                            }
                                        })
                                        .catch((err) => {
                                            console.log(
                                                'error from rename file !!!',
                                                err
                                            );
                                        })
                                        .finally(() => {});
                                } else {
                                    $(this).replaceWith(
                                        '<div id=' +
                                            'file-' +
                                            id +
                                            " class='v-list-item__title fs-13'>" +
                                            name +
                                            ' </div>'
                                    );
                                }
                            }
                        });
                    },
                    icon: 'mdi-pencil'
                },
                {
                    title: this.$t('kh.contextmenu.delete'),
                    menuAction: (action) => {
                        this.headerDialog = this.$t(
                            'common.remove_confirm_title'
                        );
                        this.titleDialog = this.$t('kh.dialog.remove');
                        this.dialogAlert = true;
                    },
                    icon: 'mdi-delete-forever'
                }
            ],
            actionsForRole: {
                assignee: [
                    {
                        icon: 'mdi-account-switch-outline',
                        name: 'change',
                        text: this.$t('v2.myItem.change'),
                        showUserSelect: true
                    },
                    {
                        icon: 'mdi-sitemap',
                        name: 'orgchart',
                        text: this.$t('v2.myItem.orgchart')
                    }
                ],
                owner: [
                    {
                        icon: 'mdi-account-switch-outline',
                        name: 'change',
                        text: this.$t('v2.myItem.change'),
                        showUserSelect: false
                    },
                    {
                        icon: 'mdi-sitemap',
                        name: 'orgchart',
                        text: this.$t('v2.myItem.orgchart')
                    }
                ],
                participant: [
                    {
                        icon: 'mdi-delete-outline',
                        name: 'delete',
                        text: this.$t('v2.myItem.remove')
                    },
                    {
                        icon: 'mdi-sitemap',
                        name: 'orgchart',
                        text: this.$t('v2.myItem.orgchart')
                    }
                ],
                watcher: [
                    {
                        icon: 'mdi-delete-outline',
                        name: 'delete',
                        text: this.$t('v2.myItem.remove')
                    },
                    {
                        icon: 'mdi-sitemap',
                        name: 'orgchart',
                        text: this.$t('v2.myItem.orgchart')
                    }
                ]
            },
            listImage: []
        };
    },
    props: {
        taskInfo: {
            type: Object,
            default: () => {}
        },
        originData: {
            type: Object,
            default: () => {}
        },
        tabsData: {
            type: Object,
            default: () => {}
        },
        sidebarWidth: {
            type: Number,
            default: 300
        },
        isShowSidebar: {
            type: Boolean,
            default: true
        },
        documentObjectId: {
            type: String,
            default: ''
        },
        appId: {
            default: 0
        },
        showCommentInSideBar: {
            type: Boolean,
            default: true
        }
    },
    watch: {
        taskInfo: function (newVl) {
            this.getData();
        },
        isShowSidebar() {
            this.showHistoryTask = false;
        }
    },
    computed: {
        objectInfoForComment() {
            let task = this.taskInfo;
            let rsl = {
                type: 'task',
                id: String(this.originData.id)
            };

            if (task.action.action != 'undefined') {
                if (task.action.parameter.documentObjectId) {
                    rsl.type = 'document-instance';
                    rsl.id = task.action.parameter.documentObjectId;
                } else if (task.action.action == 'submit') {
                    rsl.id = '';
                }
            }
            return rsl;
        },
        countCommentNotResolve() {
            let data = this.$store.state.comment[this.objectInfoForComment.id];
            data = data
                ? data.listAvtiveComment
                    ? data.listAvtiveComment
                    : {}
                : {};
            return Object.keys(data).length;
        },
        sidebarWidthReduce() {
            if (!this.showHistoryTask) {
                return this.sidebarWidth;
            } else {
                return this.sidebarWidth + 300;
            }
        },
        sapp() {
            return this.$store.state.app;
        },
        roleCanAddUser() {
            let canAddAssignee = false;
            let assignee = this.tabsData.assignee[0];
            if (!assignee && this.tabsData.owner[0]) {
                canAddAssignee =
                    this.$store.state.app.endUserInfo.id ==
                    this.tabsData.owner[0].id;
            }
            return {
                participant: true,
                watcher: true,
                assignee: canAddAssignee
            };
        },
        dataTask() {
            if (this.tabsData.owner.length == 0) {
                this.tabsData.owner = this.tabsData.assignee;
            }
            return this.tabsData;
        },
        stask() {
            return this.$store.state.task;
        },
        listFileAttachment() {
            let arr = this.stask.arrFileAttach;
            if (arr.length > 0) {
                arr.forEach(function (e) {
                    e.src = e.serverPath;
                });
            }
            return arr;
        }
    },
    created() {
        let self = this;
        this.getData();
        this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
            if (
                !(
                    $(evt.target).hasClass('symper-select-user-autocomplete') ||
                    $(evt.target).parents('.symper-select-user-autocomplete')
                        .length > 0
                )
            ) {
                for (let key in self.showDelegatedUser) {
                    self.showDelegatedUser[key] = false;
                }
            }
        });
    },
    methods: {
        previewPictureComment(obj) {
            if (obj.arrayFile.length > 0) {
                this.listImage = obj.arrayFile;
                this.$refs.lightboxComment.showDialog = true;
                this.$refs.lightboxComment.showImage(obj.index);
            }
        },
        handlerShowHistoryClick() {
            this.showHistoryTask = true;
            this.$store.dispatch('task/getTaskHistory', this.originData.id);
        },
        handleShowMoreTask() {
            this.showMoreTask = !this.showMoreTask;
        },
        handleShowMoreFile() {
            this.showMoreFile = !this.showMoreFile;
        },
        checkShowMoreFile(idex) {
            if (this.showMoreFile == false) {
                if (idex <= 2) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        },
        showPopupDiagram() {
            this.$emit('showPopupTracking');
        },
        removeFileAttach() {
            let data = {};
            data.id = this.fileId;
            taskApi
                .deleteFile(data)
                .then((res) => {
                    if (res.status == 200) {
                        this.$store.dispatch(
                            'task/removeFileAttachToStore',
                            this.fileId
                        );
                        this.$store.commit(
                            'file/setWaitingFileCountPerObj',
                            'task:' + taskInfo.action.parameter.taskId
                        );
                        this.$store.commit(
                            'comment/setWaitingCommentCountPerObj',
                            'task:' + taskInfo.action.parameter.taskId
                        );
                    } else if (res.status == 403) {
                        this.$snotifyError(
                            this.$t('v2.myItem.error'),
                            res.message
                        );
                    } else {
                        this.$snotifyError(
                            '',
                            this.$t('v2.myItem.deleteAttachmentFileErr')
                        );
                    }
                })
                .catch((err) => {
                    console.log('error from delete attachment file!!!', err);
                })
                .finally(() => {});
            this.dialogAlert = false;
        },
        showContentFile(serverPath, name, type, id) {
            let data = {
                serverPath: serverPath,
                name: name,
                type: type,
                id: id
            };
            this.$emit('showContentFile', data);
        },
        previewFile(index) {
            this.$refs.lightbox.showDialog = true;
            this.$refs.lightbox.showImage(index);
        },
        downloadOrBackupFile(data) {
            this.downLoadFile(data.fileId);
        },
        downLoadFile(id) {
            taskApi
                .downloadFile(id)
                .then((res) => {})
                .catch((err) => {
                    console.log('error download file!!!', err);
                })
                .finally(() => {});
        },
        actionFileAttachment(e, serverPath, name, type, id) {
            e.preventDefault();
            this.context_attachment = false;
            this.x = e.clientX;
            this.y = e.clientY;
            this.serverPath = serverPath;
            this.name = name;
            this.type = type;
            this.fileId = id;
            this.$nextTick(() => {
                this.context_attachment = true;
            });
        },
        uploaded(dataObj) {
            this.$store.commit('task/addToListAttachStore', dataObj);
        },
        async changeUserSelect(value) {
            let updateData = {};
            for (let role in this.tabsData) {
                let userIds = this.tabsData[role].reduce((arr, user) => {
                    arr.push(user.id);
                    return arr;
                }, []);

                if (role == this.selectingPosition.role) {
                    userIds[this.selectingPosition.idx] = value.id;
                }
                if (userIds.length > 0) {
                    updateData[role] = userIds.join(',');
                }
            }
            this.selectedUserForAssignment = {};
            try {
                let res = await BPMNEngine.updateTask(
                    this.taskInfo.action.parameter.taskId,
                    updateData
                );
                this.$evtBus.$emit('symper-update-task-assignment', res);
                this.$snotifySuccess(
                    this.$t('v2.myItem.updateTaskSuccess')
                );
                this.$emit('changeUpdateAsignee');
            } catch (error) {
                this.$snotifyError(
                    error,
                    this.$t('v2.myItem.updateTaskFail')
                );
            }
            this.statusChange = false;
        },
        filterUser(item, queryText) {
            let lowcaseText = queryText.toLowerCase();
            return item.displayName.toLowerCase().includes(lowcaseText);
        },
        hide() {
            this.$emit('after-hide-sidebar');
        },
        showHistoryControl(history) {
            $('.highlight-history').removeClass('highlight-history');
            for (let index = 0; index < history.controls.length; index++) {
                const control = history.controls[index];
                $('#' + control.id).addClass('highlight-history');
            }
        },
        hideHistory() {
            $('.history-info').css({ transform: 'translateX(400px)' });
        },
        showHistory() {
            $('.history-info').css({ transform: 'translateX(0px)' });
        },
        showComment() {
            this.showMainInfo = false;
            this.$refs.commentTaskView.showCommentPanel();
        },
        hideCommentPanel() {
            this.showMainInfo = true;
        },
        showListWork(originData) {
            this.$goToPage(
                '/myItem/work/' + originData.processInstanceId,
                this.$t('v2.myItem.detail') +
                    (originData.name ? originData.name : '')
            );
        },
        handleAction(actionName, role, idx) {
            this.statusChange = true;
            this.selectingPosition.role = role;
            this.selectingPosition.idx = idx;
            let self = this;
            let refKey = 'selectUserWrapper_' + role + '_' + idx;
            if (!this.$refs[refKey]) {
                setTimeout(() => {
                    self.showSelectUser(role, idx, refKey);
                }, 200);
            } else {
                self.showSelectUser(role, idx, refKey);
            }
        },
        showSelectUser(role, idx, refKey) {
            if (this.actionsForRole[role][idx].showUserSelect) {
                $(this.$refs[refKey]).html('');
                $(this.$refs[refKey]).append(this.$refs.selectUserAutocomplete);
                setTimeout(
                    (self) => {
                        $(self.$refs[refKey]).find('.v-select__slot').click();
                    },
                    200,
                    this
                );
            }
        },
        getData() {
            let data = {};
            if (this.taskInfo.action) {
                data.objectIdentifier = this.taskInfo.action.parameter.taskId;
            }
            data.objectType = 'task';
            this.$store.dispatch('task/getArrFileAttachment', data);
        }
    }
};
</script>
<style scoped>
.sym-document-tab-control .v-list-item {
    min-height: 25px !important;
}
.v-expand-header {
    font-size: 13px;
    font-weight: 500;
    min-height: unset;
    padding: 8px 0;
    border: none !important;
}
.tf-search-control {
    margin: 6px 0px !important;
}
.v-btn {
    box-shadow: unset !important;
}

.sym-document-tab-control .v-expansion-panel {
    margin: 0;
}
.s-detail-sidebar {
    max-height: 100%;
}

.sym-v-expand-content ::v-deep .v-expansion-panel-content__wrap {
    padding: 0;
}
.sym-v-expand-content ::v-deep .v-expansion-panel {
    margin: 0;
}
.s-detail-sidebar ::v-deep .v-expansion-panel--active:not(:first-child),
.s-detail-sidebar ::v-deep .v-expansion-panel--active + .v-expansion-panel {
    margin-top: 0px !important;
}
.s-drawer {
    height: 100%;
    z-index: 160;
    top: 0;
}

::v-deep .v-expansion-panel:not(:first-child)::after {
    border-top: none !important;
}
.workflow-info,
.general-info {
    font-size: 13px;
}
.related-user-info img,
.approval-info img {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    margin-left: 14px;
    margin-right: 8px;
}
.related-user-info,
.approval-info {
    font-size: 13px;
}
.approval-info__header {
    font-weight: 500;
    display: flex;
}
.approval-info__header span:first-child {
    font-size: 18px;
}
.approval-info__header span:last-child {
    line-height: 26px;
    margin-left: 8px;
}
.user-name {
    line-height: 24px;
}
.user-info {
    display: flex;
    margin: 4px 0;
}
.fs-20px {
    font-size: 20px;
}
.mdi-close {
    margin-left: auto;
    margin-right: 4px;
    font-size: 16px;
    color: #757575;
    transition: all ease-in-out 250ms;
    cursor: pointer;
}
.mdi-close:hover {
    color: rgb(0 0 0 / 1);
}
.history-item {
    cursor: pointer;
    display: flex;
    font-size: 13px;
    padding: 6px 0;
    transition: all ease-in-out 300ms;
}
.history-item:hover .date-update,
.history-item:hover .history-item__info span {
    text-shadow: 1px 0px 5px rgba(0, 0, 0, 0.6);
}
.history-item .date-update {
    font-weight: 500;
}
.history-item img {
    border-radius: 50%;
    margin-bottom: -2px;
    margin-right: 8px;
}
.history-item__action {
    margin-left: auto;
    margin-right: 8px;
    margin-top: 5px;
}
.history-item__action >>> button {
    box-shadow: none;
}
.history-item__action .mdi-backup-restore {
    font-size: 15px;
}
.history-info {
    position: absolute;
    top: 0px;
    right: 0;
    width: 99%;
    height: 100%;
    background: white;
    z-index: 9999;
    padding: 12px 6px 6px 11px;
    transition: all ease-in-out 250ms;
}
.history-info .mdi-keyboard-backspace {
    font-size: 15px;
    cursor: pointer;
    margin-right: 8px;
}
.menuable__content__active {
    z-index: 1010 !important;
}
.symper-upload-file >>> .v-btn {
    float: right;
}
.symper-upload-file >>> .v-btn >>> .v-btn__content >>> .mdi-upload-outline {
    font-size: 19px !important;
}
.d-active {
    background: #e5e5e5;
}
.single-row {
    cursor: pointer;
}
.s-drawer >>> .v-navigation-drawer__content {
    overflow: hidden !important;
}
.main-info {
    height: 100%;
}
.showMoreRelated {
    float: right;
    cursor: pointer;
    margin-right: 20px;
    margin-bottom: 20px;
}
.showMoreRelated:hover {
    text-decoration-line: underline;
}
.v-expansion-panel::before {
    box-shadow: none;
}
.border-top-1 >>> .v-expansion-panel-content__wrap {
    border: 1px solid #cecece !important;
    border-radius: 5px;
}
.popup-model-diagram >>> .djs-hit {
    pointer-events: none;
}
</style>

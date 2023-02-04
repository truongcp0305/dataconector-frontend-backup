<template>
    <v-navigation-drawer
        class="s-drawer"
        absolute
        permanent
        right
        :width="sidebarWidth"
        v-if="isShow"
        :style="{ transform: isShow ? 'translateX(0%)' : 'translateX(100%)' }"
    >
        <div class="main-info">
            <div style="display: flex">
                <span style="font-size: 15px">{{
                    $t('document.detail.sidebar.heading')
                }}</span>
                <span class="mdi mdi-close" @click="hide"></span>
            </div>

            <v-divider></v-divider>

            <VuePerfectScrollbar style="height: calc(100% - 65px)">
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
                        <v-expansion-panel-content class="sym-v-expand-content">
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
                                                workInfo.startTime
                                                    ? $moment(
                                                          workInfo.startTime
                                                      ).format(
                                                          'DD/MM/YY HH:mm:ss'
                                                      )
                                                    : ''
                                            }}
                                        </td>
                                    </tr>
                                    <tr v-if="workInfo.endTime">
                                        <td>
                                            {{ $t('tasks.header.endTime') }}
                                        </td>
                                        <td class="pl-2">
                                            {{
                                                $moment(
                                                    workInfo.endTime
                                                ).fromNow()
                                            }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            {{
                                                $t(
                                                    'document.detail.sidebar.body.general.comment'
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
                                            @click="showComment"
                                        >
                                            {{
                                                $t(
                                                    'document.detail.sidebar.body.general.has'
                                                )
                                            }}
                                            {{ countCommentNotResolve }}
                                            {{
                                                $t(
                                                    'document.detail.sidebar.body.general.commentNotResolve'
                                                )
                                            }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            {{
                                                $t(
                                                    'document.detail.sidebar.body.general.id'
                                                )
                                            }}
                                        </td>
                                        <td class="pl-2">
                                            {{ workInfo.id }}
                                        </td>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn
                                                    icon
                                                    tile
                                                    @click="
                                                        $copyTextToClipboard(
                                                            workInfo.id
                                                        )
                                                    "
                                                    class="ml-7"
                                                    v-on="on"
                                                    text
                                                    x-small
                                                >
                                                    <v-icon x-small
                                                        >mdi-page-next-outline</v-icon
                                                    >
                                                </v-btn>
                                            </template>
                                            <span>{{
                                                $t('task.copyLink')
                                            }}</span>
                                        </v-tooltip>
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
                                    v-if="workInfo.id"
                                    :instanceId="workInfo.id"
                                    @showPopupDiagram="showPopupDiagram"
                                >
                                </trackingProcessInstance>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header class="v-expand-header">{{
                            $t('document.detail.sidebar.body.userRelated.title')
                        }}</v-expansion-panel-header>
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <div v-if="objSideBar == 'work'" class="w-100 pl-2">
                                <div
                                    style="height: 25px"
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
                                            $t('tasks.header.userCreate')
                                        }}</span>
                                    </span>
                                </div>
                                <infoUser
                                    class="userInfo pl-7"
                                    :userId="workInfo.startUserId"
                                    :roleInfo="workInfo.roleInfo"
                                />
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel style="margin-bottom: 20px">
                        <v-expansion-panel-header
                            style="padding: 0px"
                            class="v-expand-header"
                            >{{ $t('tasks.header.attachment') }}
                            <UploadFile
                                @uploaded-file="uploaded"
                                :objectIdentifier="workInfo.id"
                                :objectType="`work`"
                                :iconName="`mdi-upload-outline`"
                            />
                        </v-expansion-panel-header>
                        <v-expansion-panel-content class="sym-v-expand-content">
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
                                        @click="
                                            showContentFile(
                                                item.serverPath,
                                                item.name,
                                                item.type,
                                                item.id
                                            )
                                        "
                                        cols="5"
                                        style="
                                            font-size: 13px;
                                            padding: 0px;
                                            padding-top: 3px !important;
                                        "
                                    >
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <div
                                                    v-on="on"
                                                    style="
                                                        font-size: 12px;
                                                        padding: 0px;
                                                        white-space: nowrap;
                                                        overflow: hidden;
                                                        text-overflow: ellipsis;
                                                        width: 140px;
                                                    "
                                                >
                                                    <v-icon
                                                        v-if="
                                                            item.type ==
                                                                'doc' ||
                                                            item.type == 'docx'
                                                        "
                                                        style="font-size: 15px"
                                                        >mdi-file-word</v-icon
                                                    >
                                                    <v-icon
                                                        v-else-if="
                                                            item.type == 'pdf'
                                                        "
                                                        style="font-size: 15px"
                                                        >mdi-file-pdf</v-icon
                                                    >
                                                    <v-icon
                                                        v-else-if="
                                                            item.type ==
                                                                'jpg' ||
                                                            item.type ==
                                                                'jpeg' ||
                                                            item.type == 'png'
                                                        "
                                                        style="font-size: 15px"
                                                        >mdi-file-image-outline</v-icon
                                                    >
                                                    <v-icon
                                                        v-else-if="
                                                            item.type ==
                                                                'xlsx' ||
                                                            item.type == 'xls'
                                                        "
                                                        style="font-size: 15px"
                                                        >mdi-file-excel</v-icon
                                                    >
                                                    <v-icon
                                                        v-else
                                                        style="font-size: 15px"
                                                        >mdi-file-document-outline</v-icon
                                                    >
                                                    {{ item.name }}
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
                                        <span>{{ item.createAt }}</span>
                                    </v-col>
                                    <v-col
                                        class="pull-right"
                                        style="
                                            padding: 0px;
                                            padding-top: 3px !important;
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
                                            @click="item.menuAction(item.title)"
                                            dense
                                        >
                                            <v-icon class="fs-15">{{
                                                item.icon
                                            }}</v-icon>
                                            <v-list-item-title class="fs-13">{{
                                                item.title
                                            }}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </div>
                            <span
                                class="showMoreRelated"
                                @click="handleShowMoreFile"
                                v-if="!showMoreFile"
                                >{{ $t('myItem.sidebar.showMoreFile') }}</span
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
        <Comment
            style="height: calc(100% - 2px)"
            :objectIdentifier="workInfo.id"
            :objectType="'work'"
            ref="commentTaskView"
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
    </v-navigation-drawer>
</template>
<script>
import user from '../User';
import { taskApi } from '@/api/task.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import Comment from '../Comment';
import trackingProcessInstance from '@/views/process/TrackingProcessInstance.vue';
import UploadFile from '@/components/common/UploadFile.vue';
import infoUser from './../InfoUser';
export default {
    components: {
        VuePerfectScrollbar,
        Comment,
        user,
        trackingProcessInstance,
        UploadFile,
        infoUser
    },
    data() {
        return {
            x: 0,
            y: 0,
            showMoreFile: false,
            headerDialog: '',
            titleDialog: '',
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
            isShow: false,
            panel: [0, 1, 2, 3, 4],
            userCreate: '',
            createdDate: '',
            workflowName: '',
            workflowOtherName: '',
            listApprovalUser: [],
            listRelatedUser: [],
            listHistoryControl: [
                {
                    date: '18/08/2020 11:20',
                    userUpdate: 'Nguyễn Đình Hoang',
                    historyid: 2,
                    controls: [
                        { id: 's-control-id-1596780634836', data: [] },
                        { id: 's-control-id-1596780602772', data: [] },
                        { id: 's-control-id-1596780611212', data: [] }
                    ]
                },
                {
                    date: '18/08/2020 11:20',
                    userUpdate: 'Nguyễn Đình Hoang',
                    historyid: 1,
                    controls: [{ id: 's-control-id-1596780602772', data: [] }]
                }
            ],
            contextAttachment: [
                {
                    title: this.$t('kh.contextmenu.rename'),
                    menuAction: (action) => {
                        alert(this.$t('v2.myItem.changeName'));
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
            }
        };
    },
    props: {
        objSideBar: {
            type: String,
            default: ''
        },
        taskInfo: {
            type: Object,
            default: () => {}
        },
        workInfo: {
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
            default: 400
        },
        isShowSidebar: {
            type: Boolean,
            default: true
        },
        userId: {
            type: String,
            default: '0'
        }
    },
    watch: {
        isShowSidebar(after) {
            this.isShow = !this.isShow;
        },
        workInfo: function (newVl) {
            this.getData();
        }
    },
    computed: {
        sapp() {
            return this.$store.state.app;
        },
        stask() {
            return this.$store.state.task;
        },
        listFileAttachment() {
            let arr = this.stask.arrFileAttach;
            return arr;
        },
        countCommentNotResolve() {
            return this.$store.state.comment.listComment.length;
        }
    },
    created() {
        let thisCpn = this;
        this.getData();
    },
    methods: {
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
                        this.$snotifyError('Error', res.message);
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
            let data = {};
            data.serverPath = serverPath;
            data.name = name;
            data.type = type;
            data.id = id;
            this.$emit('showContentFile', data);
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
        hide() {
            this.isShow = false;
            this.$emit('after-hide-sidebar');
        },
        show() {
            this.isShow = true;
        },

        showComment() {
            this.$refs.commentTaskView.show();
        },
        getData() {
            let data = {};
            data.objectIdentifier = this.workInfo.id;
            data.objectType = 'work';
            this.$store.dispatch('task/getArrFileAttachment', data);
        },
        onCopySuccess() {
            this.$snotify({
                type: 'success',
                title: this.$t('v2.myItem.copySuccess')
            });
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
    z-index: 160;
    padding: 12px 6px 6px 12px;
    top: 86px !important;
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

<template>
    <v-navigation-drawer
        class="s-drawer"
        absolute
        permanent
        right
        v-show="isShow"
        :width="panelWidth"
        :style="{
            transform: isShow ? 'translateX(0%)' : 'translateX(100%)',
            display: displaySidebar
        }"
    >
        <div v-show="showMainInfo" class="main-info">
            <div style="display: flex">
                <span style="font-size: 15px">{{
                    $t('document.detail.sidebar.heading')
                }}</span>
                <span class="mdi mdi-close" @click="hide"></span>
            </div>

            <v-divider></v-divider>

            <VuePerfectScrollbar style="calc(100% - 62px);">
                <v-expansion-panels
                    v-model="panel"
                    multiple
                    class="s-detail-sidebar"
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
                                        <td>{{ createdDate }}</td>
                                    </tr>
                                    <tr>
                                        <td style="width: 70px">
                                            {{
                                                $t(
                                                    'document.detail.sidebar.body.general.userCreate'
                                                )
                                            }}
                                        </td>
                                        <td>{{ userCreate }}</td>
                                    </tr>
                                    <tr v-if="userRoleInfo">
                                        <td style="width: 70px">
                                            {{
                                                $t(
                                                    'document.detail.sidebar.body.general.userRole'
                                                )
                                            }}
                                        </td>
                                        <td>{{ userRoleInfo }}</td>
                                    </tr>
                                    <tr v-if="countModify > 0">
                                        <td>
                                            {{
                                                $t(
                                                    'document.detail.sidebar.body.general.history'
                                                )
                                            }}
                                        </td>
                                        <td
                                            @click="showHistory"
                                            style="
                                                text-decoration: underline;
                                                cursor: pointer;
                                                color: #f1853b;
                                            "
                                        >
                                        {{ $t('v2.doc.edited') }} {{ countModify }} {{$t('v2.doc.times') }}
                                        </td>
                                    </tr>
                                    <tr v-show="false">
                                        <td>
                                            {{
                                                $t(
                                                    'document.detail.sidebar.body.general.comment'
                                                )
                                            }}
                                        </td>
                                        <td
                                            style="
                                                text-decoration: underline;
                                                cursor: pointer;
                                                color: #f1853b;
                                            "
                                            @click="showComment"
                                        >
                                            {{ commentNotResolveMessage }}
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header class="v-expand-header">{{
                            $t('document.detail.sidebar.body.userRelated.title')
                        }}</v-expansion-panel-header>
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <div class="approval-info">
                                <p class="approval-info__header">
                                    <span
                                        class="mdi mdi-account-multiple-outline"
                                    ></span>
                                    <span>{{
                                        $t(
                                            'document.detail.sidebar.body.userRelated.subTitle1'
                                        )
                                    }}</span>
                                </p>
                                <div
                                    v-for="user in listApprovalUser"
                                    :key="user.id"
                                    class="user-info"
                                >
                                    <img
                                        :src="
                                            fileDomain +
                                            'user-avatar?userId=' +
                                            user.userId
                                        "
                                        alt=""
                                    />
                                    <span class="user-name">{{
                                        user.displayName
                                    }}</span>
                                </div>
                            </div>
                            <div class="related-user-info">
                                <p class="approval-info__header">
                                    <span
                                        class="mdi mdi-account-multiple-outline"
                                    ></span>
                                    <span>{{
                                        $t(
                                            'document.detail.sidebar.body.userRelated.subTitle2'
                                        )
                                    }}</span>
                                </p>
                                <div
                                    v-for="user in listRelatedUser"
                                    :key="user.id"
                                    class="user-info"
                                >
                                    <img
                                        :src="
                                            fileDomain +
                                            'user-avatar?userId=' +
                                            user.userId
                                        "
                                        alt=""
                                    />
                                    <span class="user-name">{{
                                        user.displayName
                                    }}</span>
                                </div>
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-show="showPanelWorkflow">
                        <v-expansion-panel-header class="v-expand-header">{{
                            $t('document.detail.sidebar.body.workflowProgress')
                        }}</v-expansion-panel-header>
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <table
                                class="workflow-info"
                                v-if="workflowId != ''"
                            >
                                <tr>
                                    <td
                                        v-if="workflowInfo"
                                        style="cursor: pointer"
                                        @click="gotoDetailWorkflow"
                                    >
                                        <v-icon
                                            style="
                                                font-size: 15px;
                                                padding-right: 6px;
                                            "
                                            >mdi-lan</v-icon
                                        >
                                        {{ workflowInfo.name }}
                                    </td>
                                </tr>

                                <tr>
                                    <td
                                        v-if="taskInfo"
                                        style="cursor: pointer"
                                        @click="gotoDetailTask"
                                    >
                                        <v-icon
                                            style="
                                                font-size: 15px;
                                                padding-right: 6px;
                                            "
                                            >mdi-format-list-checkbox</v-icon
                                        >{{ taskInfo.name }}
                                    </td>
                                </tr>
                            </table>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </VuePerfectScrollbar>
        </div>
        <div
            v-show="showHistoryInfo"
            class="history-info"
            style="transform: translateX(400px)"
        >
            <HistoryObject
                :keyInstance="keyInstance"
                :listHistoryControl="listHistoryControl"
                @hide-history="hideHistory"
            ></HistoryObject>
        </div>
        <Comment
            v-show="showCommentInfo"
            v-if="showCommentInDoc"
            style="height: 95%"
            ref="commentView"
            @close-comment="hideComment"
            :objectIdentifier="documentObjectId"
        />
    </v-navigation-drawer>
</template>
<script>
import { documentApi } from '@/api/Document';
import { orgchartApi } from '@/api/orgchart';
import bpmnApi from '@/api/BPMNEngine.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import Comment from './Comment';
import HistoryObject from './HistoryObject';
import { logServiceApi } from '@/api/log.js';
import InfoUser from '@/components/myItem/InfoUser.vue';
import { appConfigs } from '../../../configs';

export default {
    components: {
        VuePerfectScrollbar,
        Comment,
        InfoUser,
        HistoryObject
    },
    data() {
        return {
            isShow: false,
            panel: [0, 1, 2, 3, 4],
            userCreate: '',
            createdDate: '',
            workflowInfo: null,
            taskInfo: null,
            workflowName: '',
            userRoleInfo: '',
            showPanelWorkflow: true,
            fileDomain: appConfigs.apiDomain.fileManagement,
            listApprovalUser: [],
            listRelatedUser: [],
            listHistoryControl: {},
            displaySidebar: 'none',
            showMainInfo: false,
            showHistoryInfo: false,
            showCommentInfo: false,
            countModify: 0,
            panelWidth: 300
        };
    },
    props: {
        keyInstance: {
            default: null
        },
        isShowSidebar: {
            type: Boolean,
            default: true
        },
        sidebarWidth: {
            type: Number,
            default: 400
        },
        showCommentInDoc: {
            type: Boolean,
            default: true
        },
        userId: {
            type: String,
            default: '0'
        },
        taskId: {
            type: String,
            default: ''
        },
        workflowId: {
            type: String,
            default: ''
        },
        createTime: {
            type: String,
            default: ''
        },
        documentObjectId: {
            type: String,
            default: ''
        },
        userRole: {
            // role của user submit doc
            type: String
        }
    },
    watch: {
        isShowSidebar() {
            this.isShow = !this.isShow;
        },
        userId(after) {
            if (!after) {
                return;
            }
            let user = this.allUsers.filter((u) => {
                return u.id == after;
            });
            if(user.length == 0){
                return
            }
            this.userCreate = user[0].displayName;
            let self = this;
            if (self.userRole) {
                orgchartApi.getRolesByUser([{ idUser: after }]).then((res) => {
                    let listRole = res.data[0].roles;
                    if (listRole.length > 0) {
                        let curRole = listRole.find(
                            (role) => role.id == self.userRole
                        );
                        if (curRole) {
                            self.userRoleInfo = curRole.name;
                        }
                    }
                });
            }
        },
        workflowId(after) {
            let self = this;
            if (after != '' && after != '0') {
                bpmnApi.getProcessInstanceData(this.workflowId).then((res) => {
                    self.workflowInfo =
                        res.data.length > 0 ? res.data[0] : null;
                });
            }
        },
        taskId(after) {
            let self = this;
            if (after != '' && after != '0') {
                //Tger chỉnh sửa lại api get detail task
                bpmnApi.postTaskHistory({ taskId: this.taskId }).then((res) => {
                    if (res.total > 0) {
                        self.taskInfo = res.data[0];
                    }
                });
            }
        },
        createTime(after) {
            this.createdDate = after;
        }
    },
    computed: {
        allUsers() {
            return this.$store.state.app.allUsers;
        },
        commentNotResolveMessage() {
            let size = this.$store.state.comment.listComment.length;
            if (size == 0) {
                return this.$t(
                    'document.detail.sidebar.body.general.noComment'
                );
            } else {
                return (
                    this.$t('document.detail.sidebar.body.general.has') +
                    size +
                    this.$t(
                        'document.detail.sidebar.body.general.commentNotResolve'
                    )
                );
            }
        }
    },
    created() {
        let thisCpn = this;
        documentApi
            .getListApprovalHistory(this.documentObjectId)
            .then((res) => {
                if (res.status == 200) {
                    let listUser = [];
                    for (let index = 0; index < res.data.length; index++) {
                        let user = res.data[index];
                        let userId = user.userId;
                        let userInfo = thisCpn.allUsers.filter((user) => {
                            return user.id == userId;
                        });
                        if (userInfo.length > 0) {
                            user.displayName = userInfo[0].displayName;
                            thisCpn.listApprovalUser.push(user);
                        }
                    }
                }
            })
            .catch((err) => {})
            .finally(() => {});
    },
    mounted() {
        setTimeout(
            (self) => {
                self.setDocUpdateHistory();
            },
            2000,
            this
        );
    },
    methods: {
        gotoDetailWorkflow() {
            this.$goToPage('myitem/work/' + this.workflowInfo.id);
        },
        gotoDetailTask() {
            this.$goToPage('myitem/tasks/' + this.taskInfo.id);
        },
        async setDocUpdateHistory() {
            // Tạm return ngay do log service đang chưa hoạt động
            return
            let res = await logServiceApi.query({
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    logObjectType: 'document_instance'
                                }
                            },
                            {
                                term: {
                                    logAction: 'update'
                                }
                            },
                            {
                                term: {
                                    logObjectId: this.documentObjectId
                                }
                            },
                            {
                                term: {
                                    rowHasChange: true
                                }
                            }
                        ]
                    }
                }
            });
            if (res.status == 200) {
                this.listHistoryControl = this.getFormattedUpdateHistory(
                    res.data
                );
                this.countModify = Object.keys(this.listHistoryControl).length;
                console.log(this.listHistoryControl, 'this.listHistoryControl');
                let param = {
                    instance: this.keyInstance,
                    data: this.listHistoryControl
                };
                this.$store.commit('document/setDetailTrackChange', param);
            } else {
                this.$snotifyError(res, this.$t('v2.doc.cannotGetDocUpdateHistory'));
            }
        },
        getFormattedUpdateHistory(list) {
            let rsl = {};
            for (let item of list) {
                let newValue =
                    typeof item.new == 'string'
                        ? JSON.parse(item.new)
                        : item.new;
                let oldValue =
                    typeof item.old == 'string'
                        ? JSON.parse(item.old)
                        : item.old;
                let ctls = this.compareTwoRows(
                    oldValue,
                    newValue,
                    item.name,
                    item.user_update_id
                );
                for (let k in ctls) {
                    if (rsl.hasOwnProperty(k)) {
                        rsl[k] = rsl[k].concat(ctls[k]);
                    } else {
                        rsl[k] = ctls[k];
                    }
                }
            }
            return rsl;
        },
        compareTwoRows(oldObj, newObj, docName, userUpdate) {
            let mapDocControl =
                this.$store.state.document.submit[this.keyInstance]
                    .listInputInDocument;
            let rsl = {};
            let isTable = false;
            if (
                newObj &&
                newObj['document_object_id'] != this.$route.params.id
            ) {
                isTable = docName;
            }
            if (oldObj.length == 0) {
                for (let name in newObj) {
                    let key =
                        newObj['document_object_update_time'] +
                        '=====' +
                        userUpdate;
                    if (!rsl.hasOwnProperty(key)) {
                        rsl[key] = [];
                    }
                    let ctrl = mapDocControl[name];
                    if (ctrl) {
                        let item = {
                            id: ctrl.id,
                            data: {
                                new: newObj[name],
                                old: ''
                            },
                            rowObjectId: newObj['document_object_id'],
                            name: name,
                            ctrl: ctrl,
                            title: ctrl.title,
                            date: newObj['document_object_update_time'],
                            isTable: isTable,
                            userUpdate: userUpdate
                        };
                        rsl[key].push(item);
                    }
                }
            } else {
                for (let name in newObj) {
                    let ctrl = mapDocControl[name];
                    if (
                        ctrl &&
                        oldObj.hasOwnProperty(name) &&
                        newObj.hasOwnProperty(name)
                    ) {
                        if (oldObj[name] == newObj[name]) {
                            continue;
                        }
                        if (
                            [null, ''].includes(oldObj[name]) &&
                            [null, ''].includes(newObj[name])
                        ) {
                            continue;
                        }
                        let key =
                            newObj['document_object_update_time'] +
                            '=====' +
                            userUpdate;
                        if (!rsl.hasOwnProperty(key)) {
                            rsl[key] = [];
                        }
                        let item = {
                            id: ctrl.id,
                            data: {
                                new: newObj[name],
                                old: oldObj[name]
                            },
                            rowObjectId: newObj['document_object_id'],
                            name: name,
                            ctrl: ctrl,
                            title: ctrl.title,
                            date: newObj['document_object_update_time'],
                            isTable: isTable,
                            userUpdate: userUpdate
                        };
                        rsl[key].push(item);
                    }
                }
            }
            return rsl;
        },

        hide() {
            this.isShow = false;
            setTimeout(
                (self) => {
                    self.displaySidebar = 'none';
                    self.showMainInfo = false;
                },
                250,
                this
            );
            this.$emit('after-hide-sidebar');
        },
        show() {
            this.displaySidebar = '';
            this.showMainInfo = true;
            setTimeout(
                (self) => {
                    self.isShow = true;
                },
                10,
                this
            );
        },
        showComment() {
            this.showCommentInfo = true;
            setTimeout(
                (self) => {
                    self.$refs.commentView.show();
                },
                10,
                this
            );
            setTimeout(
                (self) => {
                    self.showMainInfo = false;
                },
                250,
                this
            );
        },
        hideComment() {
            this.showMainInfo = true;
            setTimeout(
                (self) => {
                    self.showCommentInfo = false;
                },
                250,
                this
            );
        },
        showHistory() {
            this.showHistoryInfo = true;

            setTimeout(
                (self) => {
                    $('.history-info').css({ transform: 'translateX(0px)' });
                    this.panelWidth = 500;
                },
                10,
                this
            );

            setTimeout(
                (self) => {
                    self.showMainInfo = false;
                },
                250,
                this
            );
        },
        hideHistory() {
            this.showMainInfo = true;
            this.panelWidth = 400;
            $('.history-info').css({ transform: 'translateX(400px)' });
            setTimeout(
                (self) => {
                    self.showHistoryInfo = false;
                },
                250,
                this
            );
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
    overflow: hidden;
    width: 400px;
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
    z-index: 9999;
    padding: 12px 6px 6px 12px;
}

::v-deep .v-expansion-panel:not(:first-child)::after {
    border-top: none !important;
}
.workflow-info,
.general-info {
    font-size: 13px;
}
.workflow-info td {
    padding: 5px 0px;
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
.history-info {
    position: absolute;
    top: 0;
    right: 0;
    width: 99%;
    height: 100%;
    background: white;
    z-index: 9999;
    padding: 12px 6px 6px 8px;
    transition: all ease-in-out 250ms;
}
</style>

<template>
    <div
        :style="{ width: width, height: height }"
        v-if="isShowCommentPanel"
        :key="keyInstance"
    >
        <chat-window
            :current-user-id="currentUserId"
            :rooms="rooms"
            :room-id="1"
            :rooms-loaded="true"
            :messages="messageArray"
            :single-room="true"
            :height="height"
            :text-messages="textMessages"
            :styles="style"
            :load-first-room="false"
            :messages-loaded="messagesLoaded"
            :text-formatting="true"
            :room-message="valueInput"
            :message-actions="messageActions"
            :is-notification="isNotification"
            :last-sub-id="lastSubId"
            :next-sub-id="nextSubId"
            :next-id="nextId"
            :show-btn-close="showBtnClose"
            :scroll-bottom="scrollBottom"
            :show-room-header="showRoomHeader"
            :last-sub-id-splice="lastSubIdSplice"
            :isFocusComment="isFocusComment"
            @send-message="sendMessage"
            @edit-message="editMessage"
            @delete-message="deleteMessage"
            @fetch-messages="fetchMessages"
            @typing-message-1="typingMessage1"
            @get-comment-behind="getCommentBehind"
            @open-file="openFile"
            @display-comment-child-tag="displayCommentChildTag"
            @hide-comment-panel="hideComment"
            @display-comment-child="displayCommentChild"
            @refresh-comment="refreshComment"
            ref="chatWindow"
        >
            <template #microphone-icon>
                <SymperAvatar :userId="currentUserId" :size="30" />
            </template>
        </chat-window>
    </div>
</template>

<script>
import ChatWindow from '@/components/common/commentVer2/lib';
import SymperAvatar from '@/components/common/SymperAvatar.vue';
import { util } from '@/plugins/util';
import { commentApi } from '@/api/Comment.js';
import { userApi } from '@/api/user.js';
import { fileManagementApi } from '@/api/FileManagement.js';

export default {
    components: {
        'chat-window': ChatWindow,
        SymperAvatar,
    },
    props: {
        showRoomHeader: {
            type: Boolean,
            default: false,
        },
        scrollBottom: {
            type: Boolean,
            default: false,
        },
        width: {
            type: String,
            default: '100%',
        },
        // Loại comment
        objectIdentifier: {
            type: String,
            default: '',
        },
        // Loại comment
        objectType: {
            type: String,
            default: '',
        },
        hideCommentPanel: {
            type: Boolean,
            default: false,
        },
        showBtnClose: {
            type: Boolean,
            default: false,
        },
        isFocusComment: { 
            type: Boolean, 
            default: true 
        },
        isViewSidebar: {
            type: Boolean,
            default: false
        },
        taskId: {
            type: String,
            default: ''
        },
        userIdCreateObject: {
            type: String,
            default : ''
        }
    },
    computed: {
        height() {
            if (this.messagesLoaded) {
                if (this.isViewSidebar) {
                    return 'calc(100% - 1px)!important';
                }
                else if (this.messageArray.length == 0) {
                    return '240px';
                } 
                else {
                    return '480px';
                }
            } else {
                if (this.isViewSidebar) {
                    return 'calc(100% - 1px)!important';
                }
                else if (this.messageArray.length != 0) {
                    return '480px';
                } else return '240px';
            }
        },
    },
    data() {
        return {
            keyInstance: '',
            rooms: [],
            messageArray: [],
            currentUserId: 0,
            textMessages: {},
            style: {},
            messagesLoaded: false,
            messageActions: [],
            avatar: '',
            valueInput: '',
            page: 1,
            pageSize: '10',
            isNotification: false,
            commentId: '',
            commentSubId: '',
            nextId: '',
            lastId: '',
            nextSubId: '',
            lastSubId: '',
            sessionSend: [],
            allUsers: [],
            isShowCommentPanel: true,
            messageInput: '',
            lastSubIdSplice: '',
            toBottom: false,
        };
    },
    created() {
        this.keyInstance = this.createTempId();
        this.setDataFromRoute();
        this.currentUserId = this.$store.state.app.endUserInfo.id;
        this.getAllUsers();
        this.isShowCommentPanel = !this.hideCommentPanel;

        this.rooms = [
            {
                roomId: 1,
                roomName: '',
                unreadCount: 0,
                index: 0,
                users: this.allUsers,
                typingUsers: [],
            },
        ];
        this.style = {
            content: {
                background: 'white',
            },
            footer: {
                background: 'white',
            },
            icons: {
                paperclip: 'gray',
                emoji: 'gray',
            },
            message: {
                background: '#F0F2F5',
            },
        };
        this.textMessages = {
            MESSAGES_EMPTY: this.$t('v2.comment.noCommentComment?'),
            CONVERSATION_STARTED: '',
        };
        this.messageActions = [
            {
                name: 'editMessage',
                title: this.$t('common.edit'),
            },
            {
                name: 'deleteMessage',
                title: this.$t('common.delete'),
            },
        ];
    },
    methods: {
        setDataFromRoute() {
            if (this.$route.params.extraData !== undefined) {
                if (
                    this.$route.params.extraData.commentId !== undefined &&
                    this.$route.params.extraData.parentId !== undefined
                ) {
                    this.isNotification = true;
                    this.$emit('focus-to-comment');
                    if (this.$route.params.extraData.parentId != null) {
                        this.commentId = this.$route.params.extraData.parentId;
                        this.commentSubId =
                            this.$route.params.extraData.commentId;
                        this.lastSubIdSplice =
                            this.$route.params.extraData.commentId;
                    } else {
                        this.commentId = this.$route.params.extraData.commentId;
                    }
                }
            }
        },
        hideComment() {
            this.isShowCommentPanel = false;
            this.$emit('hide-comment-panel');
        },
        refreshComment(changeObject) {
            const self = this;
            self.nextId = '';
            self.lastId = '';
            self.nextSubId = '';
            self.lastSubId = '';
            self.sessionSend = [];
            self.setDataFromRoute();
            self.page = '1';
            self.keyInstance = self.createTempId();
            if (changeObject) {
                self.messageArray = [];
            }
        },
        showCommentPanel() {
            this.isShowCommentPanel = true;
        },
        displayCommentChildTag() {
            this.getChildrenCommentTag(this.lastSubId, 10);
        },
        displayCommentChild(data) {
            this.getChildrenComment(data.uuid, data.childPage, 10);
            this.messageArray[data.index].childPage++;
        },
        async getAllUsers() {
            const self = this;
            let res = await userApi.getListUser(1, 2000, '');
            if (res.status == 200 && res.data.listObject.length > 0) {
                let listUsers = res.data.listObject;
                let listUsersLength = listUsers.length;

                for (let i = 0; i < listUsersLength; i++) {
                    let k = {};
                    k._id = listUsers[i].id;
                    k.username = listUsers[i].displayName;
                    k.avatar = listUsers[i].avatar;
                    k.status = {};

                    self.allUsers.push(k);
                }
            }
        },
        async getParentComment() {
            const self = this;
            let res = await commentApi.getParentComment(
                self.objectType,
                self.objectIdentifier,
                self.page,
                self.pageSize,
            );
            if (res.status == 200) {
                if (res.data.listObject == null) {
                    self.messagesLoaded = true;
                    return;
                }
                if (res.data.listObject.comments.length > 0) {
                    if (self.page == 1) {
                        self.modifyCommentStructure(
                            res.data.listObject.comments,
                        );
                    } else {
                        self.modifyCommentStructure1(
                            res.data.listObject.comments,
                        );
                    }
                    if (
                        res.data.listObject.comments.length <
                        Number(self.pageSize)
                    ) {
                        self.messagesLoaded = true;
                        return;
                    }
                } else {
                    setTimeout(() => {
                        self.messagesLoaded = true;
                    }, 1000);
                }
            }
        },
        async getChildrenComment(uuid, page, pageSize) {
            const self = this;
            let messageArrayLength = self.messageArray.length;

            let res = await commentApi.getChildrenComment(uuid, page, pageSize);
            if (res.status == 200) {
                if (res.data.listObject == null) {
                    for (let i = 0; i < messageArrayLength; i++) {
                        if (self.messageArray[i].uuid == uuid) {
                            self.messageArray[i].isSeeMoreChild = false;
                        }
                    }
                    return;
                }
                if (res.data.listObject.comments != []) {
                    self.modifyCommentStructure(
                        res.data.listObject.comments.reverse(),
                        uuid,
                    );
                    for (let i = 0; i < messageArrayLength; i++) {
                        if (self.messageArray[i].uuid == uuid) {
                            if (page == 1) {
                                self.messageArray[i].hasChild =
                                    res.data.listObject.comments.length;
                            } else if (page > 1) {
                                self.messageArray[i].hasChild +=
                                    res.data.listObject.comments.length;
                            }
                            break;
                        }
                    }
                    if (res.data.listObject.comments.length < pageSize) {
                        for (let i = 0; i < messageArrayLength; i++) {
                            if (self.messageArray[i].uuid == uuid) {
                                self.messageArray[i].isSeeMoreChild = false;
                            }
                        }
                    }
                }
            }
        },
        async getParentCommentTag(id, order, subId) {
            const self = this;
            let res = await commentApi.getParentCommentTag(
                self.objectType,
                self.objectIdentifier,
                id,
                self.pageSize,
                order,
                subId,
            );
            if (res.status == 200) {
                if (res.data.listObject == null) {
                    self.messagesLoaded = true;
                    return;
                }
                if (res.data.listObject.comments != []) {
                    self.lastId = res.data.listObject.lastId;
                    let resCommentArray = res.data.listObject.comments;

                    if (order == 0) {
                        self.messageArray = [];

                        self.modifyCommentStructure(resCommentArray.reverse());
                        self.nextId = res.data.listObject.nextId;

                        if (subId != '') {
                            self.lastSubId = res.data.listObject.lastSubId;
                            self.nextSubId = res.data.listObject.nextSubId;
                            self.checkExistComment(resCommentArray, subId);
                        } else {
                            self.checkExistComment(resCommentArray, id);
                        }
                    } else if (order == 1) {
                        self.modifyCommentStructure1(resCommentArray);
                    }
                    if (self.lastId == '') {
                        self.messagesLoaded = true;
                        return;
                    }
                } else {
                    self.messagesLoaded = true;
                }
            }
        },
        async getChildrenCommentTag(id, pageSize) {
            const self = this;
            let res = await commentApi.getChildrenCommentTag(
                self.objectType,
                self.objectIdentifier,
                id,
                self.$route.params.extraData.parentId,
                pageSize,
                1,
            );
            if (res.status == 200) {
                if (res.data.listObject == null) {
                    return;
                }
                if (res.data.listObject.comments.length > 0) {
                    self.lastSubId = res.data.listObject.lastId;
                    let messageArrayLength = self.messageArray.length;
                    self.modifyCommentStructure(
                        res.data.listObject.comments.reverse(),
                        self.$route.params.extraData.parentId,
                    );
                    for (let i = 0; i < messageArrayLength; i++) {
                        if (self.messageArray[i].uuid == self.commentId) {
                            self.messageArray[i].hasChild +=
                                res.data.listObject.comments.length;
                            break;
                        }
                    }
                    if (
                        res.data.listObject.lastId == '' ||
                        res.data.listObject.comments.length < pageSize
                    ) {
                        for (let i = 0; i < messageArrayLength; i++) {
                            if (
                                self.messageArray[i].uuid ==
                                String(self.$route.params.extraData.parentId)
                            ) {
                                self.messageArray[i].isSeeMoreChild = false;
                            }
                        }
                    }
                }
            }
        },
        async getCommentBehind(parentId) {
            let pageSize = '10';
            const self = this;
            let id = parentId == null ? self.nextId : self.nextSubId;

            let res = await commentApi.getBehindCommentTag(
                self.objectType,
                self.objectIdentifier,
                id,
                parentId,
                pageSize,
                self.sessionSend,
            );
            if (res.status == 200) {
                if (res.data.listObject == null) {
                    return;
                }
                if (res.data.listObject.comments != []) {
                    self.modifyCommentStructure2(res.data.listObject.comments);
                    if (parentId == null) {
                        self.nextId = res.data.listObject.nextId;
                    } else {
                        self.nextSubId = res.data.listObject.nextId;
                        let messageArrayLength = self.messageArray.length;
                        for (let i = 0; i < messageArrayLength; i++) {
                            if (self.messageArray[i].uuid == self.commentId) {
                                self.messageArray[i].hasChild +=
                                    res.data.listObject.comments.length;
                                break;
                            }
                        }
                    }
                } else {
                    console.log("Get behind comment fail");
                }
            }
        },
        async getFileByAtachmentId(ids) {
            let k = [];
            if (ids.length > 0 && ids[0]) {
                let res = await fileManagementApi.getFileByList(JSON.stringify(ids));
                if (res.status == 200) {
                    res.data.forEach((element) => {
                        let i = {
                            name: element.name,
                            size: element.size,
                            type: element.type,
                            audio: false,
                            url: element.serverPath,
                            _id: element.id,
                        };
                        k.push(i);
                    });
                    return k;
                }
            }
        },
        async uploadFiles(files, tempId) {
            let attachments = [];
            const self = this;
            const l = files.length;
            var isError = false;

            for (let i = 0; i < l; i++) {
                let form = new FormData();
                form.append(
                    'user',
                    self.$store.state.app.endUserInfo.displayName,
                );
                form.append('objectType', '');
                form.append('objectIdentifier', '');
                let nameFile = files[i].name + '.' + files[i].extension;
                var file = new File([files[i].blob], nameFile, {
                    type: files[i].type,
                });
                form.append('file', file);
                form.append('fileName', files[i].name);

                let resFiles = await fileManagementApi.uploadFileSymper(form, {
                    dataType: 'text',
                    contentType: false,
                    processData: false,
                });
                resFiles = JSON.parse(resFiles);
                if (resFiles.status == 200) {
                    if (resFiles.data.id) {
                        attachments.push(resFiles.data.id);
                        let k = self.messageArray.length;
                        for (let j = k - 1; j >= 0; j--) {
                            if (self.messageArray[j].uuid == tempId) {
                                let filesLength =
                                    self.messageArray[j].files.length;
                                for (let t = 0; t < filesLength; t++) {
                                    if (
                                        self.messageArray[j].files[t]._id ==
                                        files[i]._id
                                    ) {
                                        self.messageArray[j].files[t].url =
                                            resFiles.data.serverPath;
                                        self.messageArray[j].files[t]._id =
                                            resFiles.data.id;
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                } else {
                    this.$snotify({
                        type: 'error',
                        title:this.$t('v2.comment.fileUploadError'),
                        text: this.$t('notification.error'),
                    });
                    isError = true;
                }
            }
            if (isError) {
                return false;
            } else return attachments;
        },
        async sendMessage({ content, files, replyMessage, usersTag }) {
            const self = this;
            let tempId = self.createTempId();
            let attachments = [];
            let isError = false
            let message = {
                _id: tempId,
                indexId: tempId,
                uuid: tempId,
                content: content,
                senderId: self.currentUserId,
                username: self.$store.state.app.endUserInfo.displayName,
                avatar: self.$store.state.app.endUserInfo.avatar,
                timestamp: Date.now(),
                system: false,
                saved: false,
                distributed: false,
                seen: false,
                deleted: false,
                disableActions: false,
                disableReactions: true,
                replyMessage: null,
                hasChild: 0,
                files: [],
            };

            if (files != null) {
                let filesLength = files.length;
                for (let i = 0; i < filesLength; i++) {
                    let k = {
                        name: files[i].name,
                        size: files[i].size,
                        type: files[i].extension,
                        audio: false,
                        url: files[i].localUrl,
                        _id: files[i]._id,
                    };
                    message.files.push(k);
                }
            }

            if (replyMessage == null) {
                // Là cha
                message.isShowChild = true;
                self.messageArray.push(message);
            } else {
                // Là con
                message.isShowChild = false;
                let messageArrayLength = self.messageArray.length;
                if (replyMessage.replyMessage == null) {
                    // Con rep cha
                    for (let i = 0; i < messageArrayLength; i++) {
                        if (
                            self.messageArray[i].uuid == replyMessage.uuid
                        ) {
                            message.replyMessage = {
                                replyId: replyMessage.uuid,
                            };
                            self.messageArray.splice(
                                i + self.messageArray[i].hasChild + 1,
                                0,
                                message,
                            );
                            self.messageArray[i].hasChild++;
                            break;
                        }
                    }
                } else {
                    // Con rep con
                    for (let i = 0; i < messageArrayLength; i++) {
                        if (
                            self.messageArray[i].uuid ==
                            replyMessage.replyMessage.replyId
                        ) {
                            message.replyMessage = {
                                replyId: replyMessage.replyMessage.replyId,
                            };
                            self.messageArray.splice(
                                i + self.messageArray[i].hasChild + 1,
                                0,
                                message,
                            );
                            self.messageArray[i].hasChild++;
                            break;
                        }
                    }
                }
            }

            if (files != null) {
                if (replyMessage == null) {
                    attachments = await self.uploadFiles(files, tempId);
                } else {
                    attachments = await self.uploadFiles(files, tempId);
                }
                if(attachments == false){
                    isError = true
                    self.messageArray = self.messageArray.filter((mes)=> mes.uuid != message.uuid)
                }
            }
            // upload success
            if (!isError) {
                let tags = [];
                if (usersTag.length > 0) {
                    let usersTagLength = usersTag.length;
                    for (let i = 0; i < usersTagLength; i++) {
                        let k = {};
                        k.objectIdentifier = usersTag[i]._id;
                        k.objectType = 'user';
                        k.tagInfo = { offset: 0, length: 14 };
                        tags.push(k);
                    }
                }
                //Chuyển đổi cấu trúc json từ vue-advanced-chat -> symper
                let messageSend = {};
                messageSend.objectIdentifier = self.objectIdentifier;
                messageSend.objectType = self.objectType;
                messageSend.parentId =
                    replyMessage == null ? null : message.replyMessage.replyId;
                messageSend.content = message.content;
                messageSend.contentForNoti = self.messageInput;
                messageSend.attachments = attachments;
                message.targetArea = '';
                messageSend.tags = tags;
                messageSend.tempId = tempId;
                if(self.taskId){
                    messageSend.taskId = self.taskId
                }
                if(self.userIdCreateObject){
                    messageSend.userIdCreateObject = self.userIdCreateObject
                }

                let res = await commentApi.addComment(messageSend);
                if (res.status == 200) {
                    let x = self.messageArray.length;
                    self.sessionSend.push(res.data.id);
                    for (let i = x - 1; i >= 0; i--) {
                        if (self.messageArray[i]._id == res.tempId) {
                            self.messageArray[i].uuid = res.data.id;
                        }
                    }
                } 
            }
        },
        async editMessage({
            messageId,
            newContent,
            files,
            replyMessage,
            usersTag,
        }) {
            const self = this;
            let messageEdit = {};
            messageEdit.objectIdentifier = this.objectIdentifier;
            messageEdit.objectType = this.objectType;
            messageEdit.content = newContent;
            messageEdit.attachments = [];
            messageEdit.targetArea = '';
            messageEdit.tags = [];
            messageEdit.contentForNoti = self.messageInput;
            messageEdit.id = messageId;

            if (files != null) {
                let filesLength = files.length;
                let messageArrayLength = self.messageArray.length;
                for (let i = 0; i < messageArrayLength; i++) {
                    if (self.messageArray[i].uuid == String(messageId)) {
                        let filesArray = [];
                        let filesArrayId = [];
                        self.messageArray[i].files = [];

                        for (let j = 0; j < filesLength; j++) {
                            if (files[j].blob != undefined) {
                                let k = {
                                    name: files[j].name,
                                    size: files[j].size,
                                    type: files[j].extension,
                                    audio: false,
                                    url: files[j].localUrl,
                                    _id: files[j]._id,
                                };
                                filesArray.push(files[j]);
                                self.messageArray[i].files.push(k);
                            } else {
                                self.messageArray[i].files.push(files[j]);
                                filesArrayId.push(files[j]._id);
                            }
                        }
                        messageEdit.attachments = await self.uploadFiles(
                            filesArray,
                            messageId,
                        );
                        messageEdit.attachments.push(...filesArrayId);
                        break;
                    }
                }
            } else {
                let messageArrayLength = self.messageArray.length;
                for (let i = 0; i < messageArrayLength; i++) {
                    if (self.messageArray[i]._id == String(messageId)) {
                        self.messageArray[i].files = [];
                    }
                }
                messageEdit.attachments = [];
            }

            let tags = [];
            if (usersTag.length > 0) {
                let usersTagLength = usersTag.length;
                for (let i = 0; i < usersTagLength; i++) {
                    let k = {};
                    k.objectIdentifier = usersTag[i]._id;
                    k.objectType = 'user';
                    k.tagInfo = { offset: 0, length: 14 };
                    tags.push(k);
                }
                messageEdit.tags = tags;
            }

            let res = await commentApi.editComment(messageEdit);
            if (res.status == 200) {
                let messageArrayLength = self.messageArray.length;
                for (let i = 0; i < messageArrayLength; i++) {
                    if (self.messageArray[i].uuid == messageId) {
                        self.messageArray[i].isEditing = true;
                        self.messageArray[i].content = newContent;
                    }
                }
            } else {
                alert(this.$t('v2.comment.updateFailed'));
            }
        },
        async deleteMessage({ message }) {
            const self = this;
            let res = await commentApi.deleteComment(message.uuid);
            if (res.status == 200) {
                let messageArrayLength = self.messageArray.length;
                for (let i = 0; i < messageArrayLength; i++) {
                    if (self.messageArray[i].uuid == message.uuid) {
                        if (self.messageArray[i].replyMessage == null) {
                            // trường hợp là cha
                            if (
                                self.messageArray[i].isShowChild &&
                                self.messageArray[i].hasChild > 0
                            ) {
                                // cha có con đang mở
                                for (
                                    let j = 0;
                                    j <= self.messageArray[i].hasChild;
                                    j++
                                ) {
                                    self.messageArray[i + j].deleted = true;
                                }
                            } else {
                                // cha không có con hoặc con đang đóng
                                self.messageArray[i].deleted = true;
                            }
                        } else {
                            // trường hợp là con
                            for (let j = 0; j < messageArrayLength; j++) {
                                if (
                                    self.messageArray[j].uuid ==
                                    String(
                                        self.messageArray[i].replyMessage
                                            .replyId,
                                    )
                                ) {
                                    self.messageArray[j].hasChild--;
                                    break;
                                }
                            }
                            self.messageArray[i].deleted = true;
                        }
                        break;
                    }
                }
            } else {
                console.log("Xóa lỗi");
            }
        },
        async fetchMessages({ options = {} }) {
            this.messagesLoaded = false;
            const self = this;
            if (options.reset) {
                if (!self.isNotification) {
                    // Khi vào từ đường url
                    self.page = 1;
                    this.getParentComment();
                } else {
                    // Khi vào từ đường thông báo
                    self.lastId = self.commentId;
                    self.getParentCommentTag(self.lastId, 0, self.commentSubId);
                }
            } else {
                if (!self.isNotification) {
                    // Khi vào từ đường url
                    self.page++;
                    this.getParentComment();
                } else {
                    // Khi vào từ đường thông báo
                    self.getParentCommentTag(self.lastId, 1, '');
                }
            }
        },
        typingMessage1({ message }) {
            this.messageInput = message;
        },
        createTempId() {
            return util.str.randomString(6);
        },
        modifyCommentStructure(comment, replyId = '') {
            const self = this;
            let mapIdToUser = this.$store.getters['app/mapIdToUser'];
            let commentList = [];

            const forLoop = async () => {
                let count = 1;
                for (let i = 0; i < comment.length; i++) {
                    let k = {};
                    let userInfor = mapIdToUser[comment[i].userId];
                    let id = self.createTempId();

                    k._id = id;
                    k.indexId = id;
                    k.uuid = comment[i].id;
                    k.content = comment[i].content;
                    k.senderId = comment[i].userId;
                    k.username = userInfor.displayName;
                    k.avatar = userInfor.avatar;
                    k.timestamp = comment[i].createdAt;
                    k.system = false;
                    k.saved = false;
                    k.distributed = false;
                    k.seen = false;
                    k.deleted = false;
                    k.disableActions =
                        this.$store.state.app.endUserInfo.id == k.senderId
                            ? false
                            : true;
                    k.disableReactions = true;
                    k.isShowChild = false;
                    k.isSeeMoreChild = false;
                    k.isEditing = comment[i].isEditing;
                    k.childPage = 0;

                    if (comment[i].attachments.length > 0) {
                        //Check xem nội dung có file hay không
                        k.files = await self.getFileByAtachmentId(
                            comment[i].attachments,
                        );
                    } else {
                        k.files = [];
                    }

                    if ((comment[i].parentId == null || comment[i].parentId == "0" ) && replyId == '') {
                        // Khi là comment cha
                        k.replyMessage = null;
                        k.childPage = 1;

                        if (comment[i].childrenNumber > 0) {
                            // Khi comment cha có comment con
                            k.hasChild = comment[i].childrenNumber;
                            if (
                                self.isNotification &&
                                self.commentSubId != null &&
                                self.commentId == comment[i].id
                            ) {
                                k.isSeeMoreChild = true;
                                k.isShowChild = true;
                                k.hasChild = 1;
                            }
                        } else if (comment[i].childrenNumber == 0) {
                            // Khi comment cha ko có comment con
                            k.hasChild = 0;
                            k.isShowChild = true;
                        }
                        commentList.push(k);
                    } else {
                        // Khi là comment con
                        k.hasChild = 0;
                        if (replyId != '') {
                            // lấy theo page size
                            k.replyMessage = {
                                replyId: replyId,
                            };

                            let messageArrayLength = self.messageArray.length;
                            for (let i = 0; i < messageArrayLength; i++) {
                                if (self.messageArray[i].uuid == replyId) {
                                    self.messageArray.splice(i + count, 0, k);
                                    count++;
                                    break;
                                }
                            }
                        } else {
                            // vào từ thông báo tag ở comment con
                            k.replyMessage = {
                                replyId: comment[i].parentId,
                            };
                            commentList.push(k);
                        }
                    }
                }
                if (replyId == '') {
                    self.messageArray = commentList;
                }
            };
            forLoop();
            // Vòng lặp tối ưu code (chưa ổn định)
            // if(replyId != '') {  // Hiện comment con
            //     for(let i = 0; i < self.messageArray.length; i++) {
            //         if(self.messageArray[i]._id == replyId) {
            //             let count = 1;
            //             for(let j = 0; j < commentListChild.length; j++) {
            //                 self.messageArray.splice((i + count), 0, commentListChild[j]);
            //                 count++;
            //             }
            //             break;
            //         }
            //     }
            // }
        },
        modifyCommentStructure1(comment, replyId = '') {
            const self = this;
            let mapIdToUser = this.$store.getters['app/mapIdToUser'];
            let modifiedMessage = [];

            const forLoop = async () => {
                let count = 1;
                for (let i = 0; i < comment.length; i++) {
                    let k = {};
                    let userInfor = mapIdToUser[comment[i].userId];
                    let id = self.createTempId();

                    k._id = id;
                    k.indexId = id;
                    k.uuid = comment[i].id;
                    k.content = comment[i].content;
                    k.senderId = comment[i].userId;
                    k.username = userInfor.displayName;
                    k.avatar = userInfor.avatar;
                    k.timestamp = comment[i].createdAt;
                    k.system = false;
                    k.saved = false;
                    k.distributed = false;
                    k.seen = false;
                    k.deleted = false;
                    k.disableActions =
                        this.$store.state.app.endUserInfo.id == k.senderId
                            ? false
                            : true;
                    k.disableReactions = true;
                    k.isShowChild = false;
                    k.childPage = 0;
                    k.isSeeMoreChild = false;
                    k.isEditing = comment[i].isEditing;

                    if (comment[i].attachments.length > 0) {
                        //Check xem nội dung có file, ảnh hay không
                        k.files = await self.getFileByAtachmentId(
                            comment[i].attachments,
                        );
                    } else {
                        k.files = [];
                    }
                    if (comment[i].parentId == null || comment[i].parentId == "0") {
                        // Khi là comment cha
                        k.replyMessage = null;
                        k.childPage = 1;
                        k.isSeeMoreChild = true;

                        if (comment[i].childrenNumber > 0) {
                            // Khi comment cha có comment con
                            k.hasChild = comment[i].childrenNumber;
                        } else if (comment[i].childrenNumber == 0) {
                            // Khi comment cha ko có comment con
                            k.hasChild = 0;
                        }
                        self.messageArray.unshift(k);
                    } else {
                        // Khi là comment con
                        k.replyMessage = {
                            replyId: replyId,
                        };
                        k.hasChild = 0;
                        let messageArrayLength = self.messageArray.length;
                        for (let i = 0; i < messageArrayLength; i++) {
                            if (self.messageArray[i].uuid == replyId) {
                                self.messageArray.splice(i + count, 0, k);
                                count++;
                                break;
                            }
                        }
                        // commentListChild.push(k);
                    }
                }
            };
            forLoop();
        },
        modifyCommentStructure2(comment, replyId = '') {
            const self = this;
            let mapIdToUser = this.$store.getters['app/mapIdToUser'];
            let modifiedMessage = [];
            let count = 1;
            const forLoop = async () => {
                for (let i = 0; i < comment.length; i++) {
                    let k = {};
                    let userInfor = mapIdToUser[comment[i].userId];
                    let id = self.createTempId();

                    k._id = id;
                    k.indexId = id;
                    k.uuid = comment[i].id;
                    k.content = comment[i].content;
                    k.senderId = comment[i].userId;
                    k.username = userInfor.displayName;
                    k.avatar = userInfor.avatar;
                    k.timestamp = comment[i].createdAt;
                    k.system = false;
                    k.saved = false;
                    k.distributed = false;
                    k.seen = false;
                    k.deleted = false;
                    k.disableActions =
                        this.$store.state.app.endUserInfo.id == k.senderId
                            ? false
                            : true;
                    k.disableReactions = true;
                    k.isShowChild = false;
                    k.childPage = 0;
                    k.isSeeMoreChild = false;
                    k.isEditing = comment[i].isEditing;

                    if (comment[i].attachments.length > 0) {
                        //Check xem nội dung có file, ảnh hay không
                        k.files = await self.getFileByAtachmentId(
                            comment[i].attachments,
                        );
                    } else {
                        k.files = [];
                    }
                    if (comment[i].parentId == null || comment[i].parentId == "0") {
                        // Khi là comment cha
                        k.replyMessage = null;
                        k.childPage = 1;
                        k.isSeeMoreChild = true;

                        if (comment[i].childrenNumber > 0) {
                            // Khi comment cha có comment con
                            k.hasChild = comment[i].childrenNumber;
                        } else if (comment[i].childrenNumber == 0) {
                            // Khi comment cha ko có comment con
                            k.hasChild = 0;
                        }
                        self.messageArray.push(k);
                    } else {
                        // Khi là comment con
                        k.replyMessage = {
                            replyId: comment[i].parentId,
                        };
                        k.hasChild = 0;
                        let messageArrayLength = self.messageArray.length;
                        for (let j = 0; j < messageArrayLength; j++) {
                            if (
                                self.messageArray[j].uuid ==
                                self.lastSubIdSplice
                            ) {
                                self.messageArray.splice(j + count, 0, k);
                                count++;
                                break;
                            }
                        }
                        if (i == comment.length - 1) {
                            self.lastSubIdSplice = k.uuid;
                        }
                        // commentListChild.push(k);
                    }
                }
            };
            forLoop();
        },
        openFile({ message, file }) {
            switch (file.action) {
                case 'preview': {
                    let messageFilesLength = message.files.length;
                    let obj = {
                        arrayFile: [],
                        index: 0,
                    };
                    for (let i = 0; i < messageFilesLength; i++) {
                        let k = {};
                        k.name =
                            message.files[i].name + '.' + message.files[i].type;
                        k.serverPath = message.files[i].url;
                        k.src = message.files[i].url;
                        k.thumb = message.files[i].url;
                        k.type = message.files[i].type;
                        k.uid = '';
                        k.id = message.files[i]._id;
                        obj.arrayFile.push(k);
                        if (message.files[i]._id == file.file._id)
                            obj.index = i;
                    }
                    this.$emit('preview-picture-comment', obj);
                    break;
                }
                case 'download': {
                    let res = fileManagementApi.download(file.file._id);
                    break;
                }
                default: {
                    console.log("Action of file is failed");
                }
            }
        },
        checkExistComment(resCommentArray, id) {
            // Nếu comment không còn tồn tại thì bắn mở popup
            const self = this;
            let count = 0;
            for (let i = 0; i < resCommentArray.length; i++) {
                if (id == resCommentArray[i].id) {
                    count++;
                    break;
                }
            }
            if (count == 0) {
                self.$snotify({
                    type: 'error',
                    title: self.$t('comment.existComment'),
                });
                self.nextSubId = '';
            }
        },
    },
    watch: {
        scrollBottom() {
            // this.toBottom = !this.toBottom
            // console.log(this.toBottom);
        },
        objectIdentifier() {
            this.refreshComment(true);
        },
        '$i18n.locale'(val) {
            this.messageActions = [
                {
                    name: 'editMessage',
                    title: this.$t('common.edit'),
                },
                {
                    name: 'deleteMessage',
                    title: this.$t('common.delete'),
                },
            ];
        },
    },
};
</script>

<style scoped>
>>> .vac-room-header {
    height: 38px;
}
>>> .vac-card-date,
>>> .vac-line-new {
    display: none;
}
>>> .vac-textarea {
    border-radius: 4px;
}
>>> .vac-avatar {
    margin: 0 0 35px 0;
}
.reply__message {
    margin-left: 30px;
}
</style>

<template>
    <div class="commnent-item">
        <div
            :item="item"
            class="commnent-item-wrapper"
            :style="{ width: width }"
        >
            <v-tooltip top>
                <template v-slot:activator="{ on }">
                    <v-icon
                        v-on="on"
                        class="icon-check pa-1"
                        @click="changeCommentStatus('resolve')"
                        v-if="item.parentId == '0' && item.status == 0"
                        >mdi-check-outline</v-icon
                    >
                </template>
                {{ $t('comment.resolve') }}
            </v-tooltip>
            <v-tooltip top>
                <template v-slot:activator="{ on }">
                    <v-icon
                        v-on="on"
                        @click="changeCommentStatus('unResolve')"
                        class="icon-check pa-1"
                        v-if="item.parentId == '0' && item.status == 1"
                        >mdi-comment-arrow-left-outline</v-icon
                    >
                </template>
                {{ $t('comment.comment') }}
            </v-tooltip>
            <SymperAvatar
                :size="30"
                :userId="item.userId"
                style="margin-left: 12px; margin-top: 4px"
            />
            <div class="comment-item-content">
                <div class="d-flex w-100" style="height: 16px">
                    <span style="color: #00000099">{{
                        item.infor.fullName
                    }}</span>
                </div>
                <div class="d-flex">
                    <InputComment
                        ref="inputComment"
                        :isEditing="item.isEditing"
                        :item="item"
                        :key="inputCommentKey"
                        :activeTab="activeTab"
                        :width="width"
                        :attachmentData="attachmentData"
                        :instanceKey="instanceKey"
                        :isAdd="false"
                        :contentEdit="contentEdit"
                        @cancel-reply="cancelReply()"
                        style="max-width: 100%"
                    />
                    <v-menu
                        style="min-height: unset"
                        v-if="sEnduser == item.userId"
                        bottom
                        left
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                class="icon-menu ma-1"
                                v-bind="attrs"
                                v-on="on"
                                >mdi-dots-horizontal</v-icon
                            >
                        </template>
                        <v-list>
                            <v-list-item
                                @click="editComment(item)"
                                style="height: 24px"
                            >
                                <v-list-item-title class="fs-13"
                                    >{{$t('v2.comment.editComment')}}</v-list-item-title
                                >
                            </v-list-item>
                            <v-list-item
                                @click="confirmDelete(item)"
                                style="height: 24px"
                            >
                                <v-list-item-title class="fs-13">
                                    {{$t('v2.comment.deleteComment')}}</v-list-item-title
                                >
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
                <div class="d-flex fs-11" style="opacity: 0.4">
                    <span class="btn-reply-comment" @click="replyComment(item)">
                        {{ $t('comment.reply') }}
                    </span>
                    <span class="pl-2">{{ lassSeen(item.createdAt) }}</span>
                    <span
                        v-if="item.createdAt != item.updatedAt"
                        style="padding-left: 8px; cursor: pointer"
                    >
                        {{ $t('comment.edited') }}</span
                    >
                </div>
            </div>
        </div>
        <div style="padding-left: 30px" v-if="item.childrens">
            <commentItem
                v-for="(child, i) in item.childrens"
                :key="i"
                :item="child"
                :activeTab="activeTab"
                :instanceKey="instanceKey"
                @reply-child="replyChild"
            >
            </commentItem>
            <div
                :key="replyKey"
                class="reply-comment"
                v-if="
                    item.reply && (item.parentId == '0' || item.parentId == 0)
                "
            >
                <SymperAvatar
                    :size="30"
                    :userId="userId"
                    style="margin-left: 14px"
                />
                <div style="padding-left: 8px; width: 98%">
                    <InputComment
                        :instanceKey="instanceKey"
                        :isEditing="true"
                        :activeTab="activeTab"
                        :isAdd="true"
                    />
                </div>
            </div>
        </div>
        <SymperDialogConfirm
            :showDialog="showDialog"
            :title="$t('v2.comment.deleteComment')"
            :content="$t('v2.comment.deleteCommentValidate')"
            @confirm="deleteComment"
        />
    </div>
</template>
<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import InputComment from './InputComment.vue';
import { util } from '@/plugins/util';
import moment from 'moment';
import { commentApi } from '@/api/Comment.js';
import { fileManagementApi } from '@/api/FileManagement.js';
import SymperAvatar from '@/components/common/SymperAvatar.vue';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm.vue';
export default {
    name: 'commentItem',
    props: {
        item: {
            type: Object,
        },
        width: {
            type: String,
            default: '100%',
        },
        searchItem: {
            type: String,
            default: '',
        },
        instanceKey: {
            type: [Number, String],
        },
        itemIndex: {
            type: String,
        },
        activeTab: {
            type: Number,
        },
    },
    components: {
        VuePerfectScrollbar,
        InputComment,
        moment,
        SymperAvatar,
        SymperDialogConfirm,
    },
    data() {
        return {
            listCommentHeight: '500px',
            status,
            contentEdit: '',
            reply: false,
            showDialog: false,
            replyKey: 0,
            itemDeleting: null,
            inputCommentKey: 0,
            attachmentData: {
                images: [],
                files: [],
            },
            mappingData: {
                images: {},
                files: {},
            },
        };
    },
    created() {
        let self = this;
        this.$evtBus.$on('comment-change', () => {
            self.inputCommentKey = Date.now();
            self.item.reply = false;
            self.item.isEditing = false;
        });
    },
    computed: {
        sEnduser() {
            return this.$store.state.app.endUserInfo.id;
        },
        sComment() {
            return this.$store.state.comment[this.instanceKey];
        },
        userId() {
            return this.$store.state.app.endUserInfo.id;
        },
    },
    watch: {
        item: {
            deep: true,
            immediate: true,
            handler() {
                this.getAttackmentData();
            },
        },
    },
    methods: {
        setAttachmentData() {
            let self = this;
            if (
                this.item &&
                this.item.attachments &&
                this.item.attachments.length > 0
            ) {
                let mapAttachments =
                    this.$store.state.comment[this.instanceKey].mapAttachments;
                this.item.attachments.forEach(function (e) {
                    if (mapAttachments[e]) {
                        if (
                            ['png', 'jpg', 'jpeg'].includes(
                                mapAttachments[e].type,
                            )
                        ) {
                            if (!self.mappingData.images[e]) {
                                self.mappingData.images[e] = true;
                                self.attachmentData.images.push(
                                    mapAttachments[e],
                                );
                            }
                        } else {
                            if (!self.mappingData.files[e]) {
                                self.mappingData.files[e] = true;
                                self.attachmentData.files.push(
                                    mapAttachments[e],
                                );
                            }
                        }
                    }
                });
            }
        },
        async getAttackmentData() {
            let self = this;
            if (this.item.attachments && this.item.attachments.length > 0) {
                let ids = [];
                this.item.attachments.forEach(function (e) {
                    if (!self.sComment.mapAttachments[e]) {
                        ids.push(e);
                    }
                });
                if (ids.length > 0) {
                    let res = await fileManagementApi.getFileByList(JSON.stringify(ids));
                    if (res.status == 200) {
                        let list = util.arrayToMapObject(res.data);
                        this.$store.commit('comment/updateMapAttachments', {
                            instanceKey: this.instanceKey,
                            data: list,
                        });
                    }
                }
                this.setAttachmentData();
            }
        },
        confirmDelete(item) {
            this.showDialog = true;
            this.itemDeleting = item;
        },
        editComment(item) {
            this.$store.commit('comment/updateParentCommentTarget', {
                instanceKey: this.instanceKey,
                data: item.parentId ? item.parentId : 0,
            });
            item.isEditing = true;
            this.contentEdit = item.content;
        },
        async deleteComment() {
            this.showDialog = false;
            let res = await commentApi.deleteComment(this.itemDeleting.id);
            if (res.status == 200) {
                this.$store.commit('comment/deleteComment', {
                    instanceKey: this.instanceKey,
                    activeTab: this.activeTab,
                    id: this.itemDeleting.id,
                });
            }
            this.changeComment();
        },
        changeComment() {
            let self = this;
            this.$evtBus.$emit('comment-change', {
                instanceKey: self.instanceKey,
            });
        },
        lassSeen(date) {
            return moment(date).fromNow();
        },
        async changeCommentStatus(type) {
            let res = await commentApi.changeStatus(this.item.id);
            if (res.status == 200) {
                this.item.status = type == 'resolve' ? 1 : 0;
                this.$store.commit('comment/changeCommentStatus', {
                    instanceKey: this.instanceKey,
                    type: type,
                    id: this.item.id,
                });
            }
            this.changeComment();
        },
        cancelReply() {
            this.item.reply = false;
        },
        replyComment(item) {
            if (item.parentId == '0') {
                this.$set(this.item, 'reply', true);
                this.$store.commit('comment/updateParentCommentTarget', {
                    instanceKey: this.instanceKey,
                    data: item.id,
                });
            } else {
                this.$emit('reply-child', item);
            }
            this.replyKey = Date.now();
        },
        replyChild(data) {
            this.item.reply = true;
            this.$store.commit('comment/updateParentCommentTarget', {
                instanceKey: this.instanceKey,
                data: data.parentId,
            });
        },
    },
};
</script>
<style scoped>
.commnent-item {
    padding: 8px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
}
.commnent-item >>> .v-sheet .v-toolbar {
    height: unset !important;
}
.commnent-item >>> .commnent-item-wrapper {
    display: flex;
    margin-left: auto;
    margin-right: auto;
    position: relative;
}
.commnent-item >>> .comment-item-content {
    display: flex;
    flex-direction: column;
    margin-left: 8px;
    width: 100%;
}
.commnent-item >>> .icon-menu,
.commnent-item >>> .icon-check {
    display: inline-block;
    flex-grow: 1;
    font-size: 15px;
}
.commnent-item >>> .icon-menu {
    position: absolute;
    right: 0;
    display: none;
}
.commnent-item >>> .v-btn__content .v-icon {
    font-size: 15px;
}
.commnent-item >>> .icon-check {
    position: absolute;
    top: 0;
    right: 0;
}
.commnent-item >>> .comment-item-content {
    display: flex;
    flex-direction: column;
    margin-left: 8px;
}
.commnent-item >>> .comment-item-content .btn-reply-comment {
    color: blue;
    cursor: pointer;
    font-weight: bold;
    opacity: 0.6 !important;
    border-bottom: 1px solid white;
}
.commnent-item >>> .comment-item-content .btn-reply-comment:hover {
    cursor: pointer;
    color: blue;
    border-bottom: 1px solid blue;
}
.commnent-item >>> .reply-comment {
    width: 100%;
    display: flex;
    margin-right: auto;
    margin-left: 6px;
    margin-top: 8px;
}
.commnent-item >>> .commnent-item-wrapper:hover .icon-menu {
    display: inline-block;
}
.commnent-item >>> .v-menu__content {
    min-height: unset;
}
</style>

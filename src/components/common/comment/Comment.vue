<template>
    <div
        :class="{
            'symper-comment': true,
        }"
        v-show="showComment"
        :style="{ top: top + 'px', left: left + 'px', height: heightComment }"
    >
        <v-toolbar flat style="height: auto">
            <v-toolbar-title>{{ $t('comment.title') }} </v-toolbar-title>
            <v-icon>mdi-comment-text-outline</v-icon>
            <v-spacer></v-spacer>
            <v-icon v-if="buttonClose == true" @click="clickCloseComment"
                >mdi-close-outline</v-icon
            >
            <template v-slot:extension>
                <v-tabs v-model="tab" align-with-title>
                    <v-tabs-slider color="yellow"></v-tabs-slider>
                    <v-tab v-for="item in itemsTab" :key="item.value">
                        <v-icon
                            class="fs-18"
                            v-if="isSearching == true"
                            @click="isSearching = false"
                            >{{ item.icon }}</v-icon
                        >
                        <span v-else>
                            <span
                                style="
                                    font: 13px roboto !important;
                                    text-transform: none;
                                "
                            >
                                {{ item.title }}
                            </span>
                            <span style="padding-left: 4px">{{
                                '(' +
                                Object.keys(sComment[instanceKey][item.store])
                                    .length +
                                ')'
                            }}</span></span
                        >
                    </v-tab>
                </v-tabs>
                <v-spacer></v-spacer>
                <v-text-field
                    solo
                    v-if="isSearching"
                    :label="$t('comment.search')"
                    append-icon="mdi-close-circle-outline"
                    v-model="searchItem"
                    @click:append="clickClose"
                ></v-text-field>
                <v-btn icon tile small v-else @click="clickSearch">
                    <v-icon class="fs-13">mdi-magnify</v-icon>
                </v-btn>
            </template>
        </v-toolbar>
        <v-tabs-items v-model="tab">
            <v-tab-item
                v-for="item in itemsTab"
                :key="item.value"
                style="height: 100%"
            >
                <list-comment
                    :key="listCommentKey"
                    ref="listComment"
                    :activeTab="tab"
                    :instanceKey="instanceKey"
                    :listComment="listComment"
                    :searchItem="searchItem"
                    :heightComment="heightComment"
                    :heightListComment="heightListComment"
                />
            </v-tab-item>
        </v-tabs-items>
        <div class="input-comment" v-if="tab == 0">
            <SymperAvatar :userId="userId" :size="30" />
            <InputComment
                :instanceKey="instanceKey"
                class="ml-2"
                :key="inputCommentKey"
                :isEditing="true"
                :isAdd="true"
            />
        </div>
    </div>
</template>
<script>
import ListComment from './ListComment.vue';
import CommentItem from './CommentItem.vue';
import InputComment from './InputComment.vue';
import { util } from '@/plugins/util';
import { commentApi } from '@/api/Comment.js';
import SymperAvatar from '@/components/common/SymperAvatar.vue';
export default {
    data() {
        let self = this;
        return {
            tab: null,
            listCommentKey: 0,
            isSearching: false,
            commentTarget: {},
            instanceKey: 0,
            inputCommentKey: 0,
            searchItem: '',
            itemsTab: [
                {
                    title: this.$t('comment.comment'),
                    value: 'comment',
                    store: 'listAvtiveComment',
                    icon: 'mdi-comment-processing-outline',
                },
                {
                    title: this.$t('comment.resolve'),
                    value: 'resolve',
                    store: 'listResolve',
                    icon: 'mdi-comment-check',
                },
            ],
        };
    },
    components: {
        ListComment,
        CommentItem,
        InputComment,
        SymperAvatar,
    },
    created() {
        let self = this;
        this.instanceKey = this.objectIdentifier;
        this.$store.commit('comment/initInstanceKey', {
            instanceKey: this.instanceKey,
        });
        this.getCommentById();
        this.$evtBus.$on('comment-change', (data) => {
            if (data.instanceKey == self.instanceKey) {
                self.listCommentKey = Date.now();
                self.inputCommentKey = Date.now();
            }
        });
    },

    computed: {
        listComment() {
            let allCommentData = this.sComment[this.instanceKey];
            if (allCommentData) {
                return this.tab == 0
                    ? this.sComment[this.instanceKey].listAvtiveComment
                    : this.sComment[this.instanceKey].listResolve;
            } else {
                return {};
            }
        },
        sComment() {
            return this.$store.state.comment;
        },
        userId() {
            return this.$store.state.app.endUserInfo.id;
        },
        heightListComment() {
            let count =
                Object.keys(this.listComment).length > 5
                    ? 6
                    : Object.keys(this.listComment).length + 1;
            let height = count * 77;
            return height;
        },
    },

    props: {
        /**
         * truyen vao show comment hay ko
         */
        showComment: {
            type: Boolean,
            default: false,
        },
        /**
         * truyen vao width comment
         */
        widthComment: {
            type: String,
            default: '100%',
        },
        /**
         * truyen vao height comment hay ko
         */
        heightComment: {
            type: String,
            default: '100%',
        },
        /**
         * truyen vao vi tri comment
         */
        top: {
            type: Number,
            default: 0,
        },
        /**
         * truyen vao vi tri comment
         */
        left: {
            type: Number,
            default: 0,
        },
        /**
         * truyen vao vi tri comment
         */
        targetArea: {
            type: String,
            default: '',
        },
        /**
         * truyen vao vi tri comment
         */
        objectIdentifier: {
            type: String,
        },
        /**
         * truyen vao vi tri comment
         */
        objectType: {
            type: String,
        },

        buttonClose: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        clickSearch() {
            this.isSearching = true;
        },
        clickClose() {
            this.isSearching = false;
        },
        clickCloseComment() {
            this.$emit('close-comment');
        },
        hide() {
            this.showComment = false;
        },
        async getCommentById() {
            let res = await commentApi.getCommentById(
                this.objectType,
                this.objectIdentifier,
            );
            if (res.status == 200) {
                let listComment = util.arrayToMapObject(
                    this.addAvatar(res.data.listObject.comments),
                    'id',
                );
                this.$store.commit('comment/updateListAvtiveComment', {
                    instanceKey: this.instanceKey,
                    data: listComment,
                });
                let listResolve = util.arrayToMapObject(
                    this.addAvatar(res.data.listObject.resolve),
                    'id',
                );
                this.$store.commit('comment/updateListResolve', {
                    instanceKey: this.instanceKey,
                    data: listResolve,
                });
            }
            this.commentTarget = {
                objectIdentifier: this.objectIdentifier,
                objectType: this.objectType,
                targetArea: this.targetArea,
                parentId: 0,
            };
            this.$store.commit('comment/updateCommentTarget', {
                instanceKey: this.instanceKey,
                data: this.commentTarget,
            });
        },
        addAvatar(data) {
            let mapIdToUser = this.$store.getters['app/mapIdToUser'];
            if (typeof data !== 'undefined') {
                data.forEach(function (e) {
                    if (!isNaN(e.userId)) {
                        let itemInfor = mapIdToUser[e.userId];
                        e.infor = {
                            avatar: itemInfor.avatar ? itemInfor.avatar : '',
                            fullName: itemInfor.displayName
                                ? itemInfor.displayName
                                : '',
                        };
                    }
                    if (
                        e.hasOwnProperty('childrens') &&
                        e.childrens.length > 0
                    ) {
                        e.childrens.forEach(function (k) {
                            if (!isNaN(k.userId)) {
                                let itemInforChild = mapIdToUser[k.userId];
                                k.infor = {
                                    avatar: itemInforChild.avatar
                                        ? itemInforChild.avatar
                                        : '',
                                    fullName: itemInforChild.displayName
                                        ? itemInforChild.displayName
                                        : '',
                                };
                            }
                        });
                    }
                });
            }
            return data;
        },
    },
    watch: {
        objectIdentifier: function (val) {
            this.getCommentById();
        },
    },
};
</script>

<style scoped>
.symper-comment-float {
    position: relative;
    width: 450px;
    border: 1px solid lightgray;
    -webkit-box-shadow: 0px 0px 22px -4px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 0px 0px 22px -4px rgba(0, 0, 0, 0.75);
    box-shadow: 0px 0px 22px -4px rgba(0, 0, 0, 0.75);
}
.symper-comment {
    font: 13px roboto;
    position: relative;
}
.symper-comment >>> .v-btn {
    height: 25px;
    width: 25px;
}
.symper-comment >>> .v-input__control {
    background-color: #f7f7f7;
    min-height: unset;
}
.symper-comment >>> .v-input__control .v-text-field__details {
    display: none;
}
.symper-comment >>> .v-input__control .v-input__slot {
    box-shadow: unset !important;
    background-color: #f7f7f7;
    border-radius: 5px;
    margin: unset;
    width: 200px;
    padding: 0px 8px !important;
    font: 12px roboto;
}
.symper-comment >>> .v-input__control .v-input__slot .v-text-field__slot label {
    font-size: 13px;
}
.symper-comment >>> .v-input__control .v-input__slot .v-icon {
    font-size: 15px;
    margin-right: -8px;
}
.symper-comment >>> .v-toolbar__title {
    text-transform: uppercase;
    font: 15px roboto;
}
.symper-comment >>> .v-toolbar__content {
    height: 32px !important;
}
.symper-comment >>> .v-toolbar__content .v-icon {
    font-size: 13px;
    padding-left: 8px;
}
.symper-comment >>> .v-tab {
    margin-left: 0px !important;
    height: 32px;
}
.symper-comment >>> .v-slide-group__wrapper {
    /* margin-left:20px !important; */
    height: 32px;
}
.symper-comment >>> .v-toolbar__extension {
    height: 32px !important;
}
.symper-comment >>> .v-slide-group__wrapper .v-tabs-slider {
    display: none;
}
.symper-comment >>> .target-area {
    width: 100%;
}
.symper-comment >>> .input-comment {
    display: flex;
    width: 98%;
    margin-left: 12px;
    margin-right: 12px;
    flex-direction: row;
    justify-content: center;
    position: absolute;
    bottom: 0px;
}
.symper-comment >>> .content-comment-img .v-tab {
    height: 60px;
}
.symper-comment >>> .content-comment-img .v-slide-group__wrapper {
    height: 60px;
    margin-bottom: 12px;
}
.symper-comment >>> .content-comment-img .v-slide-group__next,
.symper-comment >>> .content-comment-img .v-slide-group__prev {
    padding-top: 12px;
}
</style>

<template>
    <div class="list-objects h-100">
        <v-row class="mr-0 ml-0 h-100">
            <v-col
                :cols="!sideBySideMode ? 12 : 4"
                :md="!sideBySideMode ? 12 : 3"
                class="pt-0 pl-0 pr-0 pb-0"
            >
                <listHeader
                    :isSmallRow="isSmallRow"
                    :objecType="objecType"
                    :headerTitle="headerTitle"
                    :sideBySideMode="sideBySideMode"
                    :compackMode="compackMode"
                    @change-density="isSmallRow = !isSmallRow"
                    @changeObjectType="changeObjectType"
                    @filter-change-value="handleChangeFilterValue"
                    @create-task="getDocuments({})"
                    @refresh-task-list="getDocuments()"
                    @get-list-process-instance="listProrcessInstances = $event"
                ></listHeader>
                <v-divider v-if="!sideBySideMode"></v-divider>
                <v-row class="ml-0 mr-0" v-if="!sideBySideMode">
                    <v-col cols="12" class="list-tasks pt-0 pb-0">
                        <v-row>
                            <v-col
                                :cols="
                                    sideBySideMode ? 12 : compackMode ? 6 : 4
                                "
                                class="pl-3 fs-13 font-weight-medium"
                                >{{ $t('tasks.header.name') }}</v-col
                            >
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="pl-3 fs-13 font-weight-medium"
                                >{{ $t('tasks.header.userCreate') }}</v-col
                            >
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="pl-3 fs-13 font-weight-medium"
                                >{{ $t('tasks.header.createDate') }}</v-col
                            >

                            <v-col
                                cols="2"
                                v-if="
                                    !sideBySideMode &&
                                    !compackMode &&
                                    !smallComponentMode
                                "
                                class="pl-3 fs-13 font-weight-medium"
                                >{{ $t('tasks.header.app') }}</v-col
                            >
                            <v-col
                                cols="2"
                                v-if="
                                    !sideBySideMode &&
                                    !compackMode &&
                                    !smallComponentMode
                                "
                                class="pl-3 fs-13 font-weight-medium"
                                >{{ $t('common.add') }}</v-col
                            >
                        </v-row>
                    </v-col>
                </v-row>
                <v-divider></v-divider>

                <VuePerfectScrollbar
                    v-if="!loadingTaskList"
                    @ps-y-reach-end="handleReachEndList"
                    :style="{ height: listTaskHeight + 'px' }"
                    class="list-document"
                >
                    <div style="overflow: hidden">
                        <v-row
                            class="item-task"
                            v-for="(obj, idx) in listAllDocumentObjectId"
                            :key="idx"
                            :style="{
                                minHeight: '30px',
                            }"
                            :class="{
                                'single-row': true,
                                'd-active': index == idx,
                            }"
                            @click="selectObject(obj, idx)"
                            style="
                                border-bottom: 1px solid #eeeeee !important;
                                margin-left: 0px !important;
                            "
                        >
                            <v-col
                                :cols="
                                    sideBySideMode ? 10 : compackMode ? 6 : 4
                                "
                                class="pl-3 pr-1 pb-1 pt-1"
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
                                                {{
                                                    obj.title
                                                        ? obj.title
                                                        : obj.titleObject
                                                }}
                                            </div>
                                        </template>
                                        <span>
                                            {{
                                                obj.title
                                                    ? obj.title
                                                    : obj.titleObject
                                            }}</span
                                        >
                                    </v-tooltip>
                                    <div
                                        class="pa-0 grey--text mt-1 lighten-2 d-flex justify-space-between"
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
                                            {{
                                                obj.documentInfo
                                                    ? obj.documentInfo.title
                                                    : ''
                                            }}
                                        </div>

                                        <div class="fs-11 py-0 text-ellipsis">
                                            {{
                                                obj.createAt
                                                    ? $moment(
                                                          obj.createAt,
                                                      ).format(
                                                          'DD/MM/YY HH:mm:ss',
                                                      )
                                                    : $moment(
                                                          obj.createat,
                                                      ).format(
                                                          'DD/MM/YY HH:mm:ss',
                                                      )
                                            }}
                                            <v-icon
                                                class="grey--text lighten-2 ml-1"
                                                x-small
                                                >mdi-clock-time-nine-outline</v-icon
                                            >
                                        </div>
                                    </div>
                                </div>
                            </v-col>
                            <v-col
                                style="line-height: 42px"
                                cols="2"
                                class="pl-3 fs-12 px-1 py-0"
                                v-if="!sideBySideMode"
                            >
                                <infoUser
                                    v-if="obj.userId && obj.userId > 0"
                                    class="userInfo"
                                    :userId="obj.userId"
                                    :roleInfo="{}"
                                />
                            </v-col>

                            <v-col
                                style="line-height: 42px"
                                cols="2"
                                class="pl-3 fs-13 px-1 py-0"
                                v-if="!sideBySideMode"
                            >
                                <span class="mt-1">{{
                                    obj.createAt
                                        ? $moment(obj.createAt).fromNow()
                                        : ''
                                }}</span>
                            </v-col>
                            <v-col
                                class="pl-3 py-0"
                                cols="2"
                                v-if="!sideBySideMode"
                            >
                                <div class="pl-1 pa-3">
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <span
                                                v-on="on"
                                                class="text-left fs-13 text-ellipsis w-80 title-quytrinh"
                                            >
                                                {{ showNameApp(obj.appId) }}
                                            </span>
                                        </template>
                                        <span>aaa</span>
                                    </v-tooltip>
                                </div>
                            </v-col>
                            <v-col
                                cols="2"
                                class="pl-3 fs-13 px-1 py-0"
                                v-if="!sideBySideMode"
                            >
                                <div class="pl-1 pt-1">
                                    <div style="width: 55px">
                                        {{
                                            commentCountPerTask[
                                                'document:' + obj.id
                                            ]
                                        }}
                                        <v-icon
                                            class="fs-14"
                                            style="
                                                float: right;
                                                margin-top: 4px;
                                                margin-right: 12px;
                                            "
                                            >mdi-comment-processing-outline</v-icon
                                        >
                                    </div>
                                    <div style="width: 55px">
                                        {{
                                            fileCountPerTask[
                                                'document:' + obj.id
                                            ]
                                        }}
                                        <v-icon
                                            class="fs-14"
                                            style="
                                                float: right;
                                                margin-top: 4px;
                                                margin-right: 12px;
                                            "
                                            >mdi-attachment</v-icon
                                        >
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </div>
                </VuePerfectScrollbar>
                <preloader v-else class="mx-auto" />
                <preloader v-if="loadingMoreTask" class="mx-auto" />
            </v-col>
            <v-col
                :cols="!sideBySideMode ? 0 : 8"
                :md="!sideBySideMode ? 0 : 9"
                v-if="sideBySideMode"
                class="pa-0 ma-0"
                height="30"
                style="border-left: 1px solid #e0e0e0"
            >
                <v-row
                    class="ma-0 justify-space-between"
                    style="
                        line-height: 36px;
                        border-bottom: 1px solid #dedede;
                        display: flex;
                    "
                >
                    <div class="fs-13 pl-2 pt-1 float-left">
                        {{ titleDocument }}
                    </div>
                    <div
                        class="text-right pt-1 pb-1 pr-0"
                        style="margin-left: auto; margin-right: 12px"
                    >
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-on="on"
                                    small
                                    text
                                    @click="sideBySideMode = !sideBySideMode"
                                >
                                    <v-icon small>mdi-close</v-icon>
                                </v-btn>
                            </template>
                            <span>Back</span>
                        </v-tooltip>
                    </div>
                </v-row>
                <detailDocument
                    class="detail-doc"
                    :showCommentInDoc="true"
                    :docObjInfo="docObjInfo"
                >
                </detailDocument>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import icon from '@/components/common/SymperIcon';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import listHeader from '@/components/myItem/ListHeader';
import { util } from '@/plugins/util';
import detailDocument from '@/views/document/detail/Detail';
import { taskApi } from '@/api/task';
import infoUser from './../InfoUser';

export default {
    computed: {
        fileCountPerTask() {
            return this.$store.state.file.fileCountPerObj.list;
        },
        commentCountPerTask() {
            return this.$store.state.comment.commentCountPerObj.list;
        },
        listAllDocumentObjectId() {
            let listObjRelated = this.stask.listDocumentObjId;
            let listObjUserSubmit = this.stask.listDocumentObjIdWithUserSubmit;
            let arrDocument = listObjRelated.concat(listObjUserSubmit);
            let mapIdToDocObj = {};
            let rsl = [];
            arrDocument.forEach((element) => {
                if (!mapIdToDocObj[element.id]) {
                    mapIdToDocObj[element.id] = true;
                    if (element.userCreate && element.userCreate != null) {
                        let arrUser = this.sapp.allUsers;
                        let user = arrUser.find(
                            (data) => data.email === element.userCreate,
                        );
                        if (user) {
                            element.displayName = user.displayName;
                            element.userId = user.id;
                        } else {
                            element.displayName = '';
                        }
                    } else {
                        element.displayName = '';
                    }
                    rsl.push(element);
                }
            });
            rsl.sort(function (a, b) {
                var keyA = new Date(a.createAt),
                    keyB = new Date(b.createAt);
                if (keyA > keyB) return -1;
                if (keyA < keyB) return 1;
                return 0;
            });

            return rsl;
        },
        stask() {
            return this.$store.state.task;
        },
        sapp() {
            return this.$store.state.app;
        },
    },
    name: 'listDocument',
    components: {
        icon: icon,
        listHeader: listHeader,
        VuePerfectScrollbar: VuePerfectScrollbar,
        detailDocument,
        infoUser,
    },
    watch: {
        sideBySideMode(vl) {
            if (!vl) {
                this.$store.dispatch('file/getWaitingFileCountPerObj');
                this.$store.dispatch('comment/getWaitingCommentCountPerObj');
            }
        },
    },
    props: {
        compackMode: {
            type: Boolean,
            default: false,
        },
        objecType: {
            type: Number,
        },
        height: {
            type: String,
            default: 'calc(100vh - 120px)',
        },
        smallComponentMode: {
            type: Boolean,
            default: false,
        },
        filterFromParent: {
            type: Object,
            default() {
                return {};
            },
        },
        headerTitle: {
            type: String,
            default() {
                return this.$t('myItem.headerDoc');
            },
        },
        filterTaskAction: {
            type: String,
            default: 'getList',
        },
    },
    data: function () {
        return {
            docObjInfo: {
                docObjId: 0,
            },
            index: -1,
            titleDocument: '',
            loadingTaskList: false,
            loadingMoreTask: false,
            listTaskHeight: 300,
            totalDoc: 0,
            selectedTask: {
                taskInfo: {},
                idx: -1,
                originData: null,
            },
            listProrcessInstances: [],
            isSmallRow: false,
            sideBySideMode: false,
            allFlatDocumentObjId: [],
            myOwnFilter: {
                pageSize: 50,
                page: 1,
            },
            listDocumentObjectId: [],
        };
    },
    created() {
        this.getDocuments();
    },
    mounted() {
        let self = this;
        this.$store
            .dispatch('process/getAllDefinitions')
            .then((res) => {
                self.getDocuments();
            })
            .catch((err) => {});
        self.reCalcListTaskHeight();
    },
    methods: {
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
        },
        changeUpdateAsignee() {
            this.handleTaskSubmited();
        },
        showTime(time) {
            var today = this.$moment().format('YYYY-MM-DD');
            if (time === today) {
                return this.$t('myItem.today');
            } else {
                return this.$moment(time).fromNow();
            }
        },
        changeObjectType(index) {
            this.$emit('changeObjectType', index);
        },

        handleReachEndList() {
            if (
                this.allFlatDocumentObjId.length < this.totalDoc &&
                this.allFlatDocumentObjId.length > 0 &&
                !this.loadingTaskList &&
                !this.loadingMoreTask
            ) {
                this.myOwnFilter.page += 1;
                if (
                    (this.myOwnFilter.page - 1) * this.myOwnFilter.pageSize <
                    this.totalDoc
                ) {
                    this.getDocuments();
                }
            }
        },
        handleTaskSubmited() {
            this.sideBySideMode = false;
            this.getDocuments();
        },
        handleChangeFilterValue(data) {
            for (let key in data) {
                this.$set(this.myOwnFilter, key, data[key]);
            }
            this.getDocuments();
        },
        reCalcListTaskHeight() {
            this.listTaskHeight =
                util.getComponentSize(this.$el.parentElement).h - 85;
        },
        // getUser(id) {
        //     this.$refs.user.getUser(id);
        // },
        selectObject(obj, idx) {
            this.index = idx;
            this.docObjInfo.docObjId = obj.id;
            this.titleDocument = obj.titleObject;
            if (!this.compackMode) {
                this.sideBySideMode = true;
                this.$emit('change-height', 'calc(100vh - 88px)');
            }
        },
        closeDetail() {
            this.sideBySideMode = false;
            this.$emit('change-height', 'calc(100vh - 120px)');
        },

        async getDocuments(filter = {}) {
            if (this.loadingTaskList || this.loadingMoreTask) {
                return;
            }
            let self = this;
            if (this.myOwnFilter.page == 1) {
                this.allFlatDocumentObjId = [];
                this.loadingTaskList = true;
            } else {
                this.loadingMoreTask = true;
            }
            filter = Object.assign(filter, this.filterFromParent);
            filter = Object.assign(filter, this.myOwnFilter);
            let res = {};
            let listVariablesDocumentObj = [];

            res = await taskApi.getDocumentInVariables(filter); // get danh sách variable chứa document_object_id
            listVariablesDocumentObj = res.data;
            this.totalDoc = Number(res.total);

            await self.getListDocumentObjIdInVariables(
                listVariablesDocumentObj,
            );
            await self.getListDocumentObjectId(
                this.$store.state.app.endUserInfo.id,
            );
            await self.getCountCommentAndFile();
            self.loadingTaskList = false;
            self.loadingMoreTask = false;
        },
        async getListDocumentObjIdInVariables(listVariablesDocumentObj) {
            let self = this;
            if (listVariablesDocumentObj.length > 0) {
                for (let element of listVariablesDocumentObj) {
                    if (
                        this.allFlatDocumentObjId.indexOf(element.value) === -1
                    ) {
                        this.allFlatDocumentObjId.push(element.value);
                    }
                }
                await self.$store.dispatch(
                    'task/getListDocumentObjId',
                    self.allFlatDocumentObjId,
                );
            }
        },

        async getListDocumentObjectId(userId) {
            let self = this;
            await self.$store.dispatch(
                'task/getListDocumentObjIdWithUserSubmit',
                userId,
            );
        },
        async getCountCommentAndFile() {
            let self = this;
            let listObjRelated = self.stask.listDocumentObjId;
            let listObjUserSubmit = self.stask.listDocumentObjIdWithUserSubmit;
            let arrDocument = listObjRelated.concat(listObjUserSubmit);
            let documentIden = [];
            arrDocument.forEach((element) => {
                documentIden.push('document:' + element.id);
            });
            self.$store.commit('file/setWaitingFileCountPerObj', documentIden);
            self.$store.commit(
                'comment/setWaitingCommentCountPerObj',
                documentIden,
            );
            self.$store.dispatch('file/getWaitingFileCountPerObj');
            self.$store.dispatch('comment/getWaitingCommentCountPerObj');
        },
    },
};
</script>

<style scoped>
.list-tasks .fs-13 {
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 5px;
    padding-bottom: 5px;
}
.v-expansion-panels .v-expansion-panel-content {
    padding: 0;
}
.v-expansion-panels
    .v-expansion-panel-content
    >>> .v-expansion-panel-content__wrap {
    padding: 0 0 0px;
}
.single-row:hover {
    background: #f5f5f5;
    cursor: pointer;
}
.theme--light.v-list-item--active:hover::before,
.theme--light.v-list-item--active::before {
    opacity: 0;
}
.v-list--nav.v-list--dense .v-list-item:not(:last-child):not(:only-child),
.v-list--nav .v-list-item--dense:not(:last-child):not(:only-child) {
    margin-bottom: 0;
}
.scrollable {
    overflow: auto;
    overflow-x: hidden;
}
.v-text-field >>> .v-input__control >>> .v-input__slot,
.theme--light.v-text-field--solo >>> .v-input__control >>> .v-input__slot,
.list-objects .v-application >>> .v-input__control >>> .v-input__slot {
    padding-left: 5px !important;
    padding-right: 5px !important;
}
.v-application
    >>> .v-input__control
    >>> .v-input__slot
    >>> .v-input__append-inner
    >>> .v-input__icon {
    min-width: 10px;
    width: 5px;
}
.list-objects
    >>> .v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)
    >>> .v-input__control
    >>> .v-input__slot,
.list-objects >>> .v-text-field.v-text-field--enclosed .v-text-field__details {
    padding-left: 5px !important;
    padding-right: 5px !important;
}
.v-list-item >>> .v-list-item__icon,
.v-list-group
    >>> .v-list-item__icon:first-child
    .v-list-group
    >>> .v-list-item--dense
    >>> .v-list-item__icon,
.v-list-group >>> .v-list--dense >>> .v-list-item >>> .v-list-item__icon {
    margin-top: 3px;
    margin-bottom: 3px;
}
.title-quytrinh {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box !important;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}
.d-active {
    background: #f5f5f5;
}
.btn-back {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 100;
}
.col-10 {
    flex: 0 0 94.333333%;
    max-width: 94.333333%;
}
.detail-doc {
    height: calc(100vh - 88px) !important;
}
</style>

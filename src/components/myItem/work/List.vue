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
                    :headerTitle="headerTitle"
                    :objecType="objecType"
                    :sideBySideMode="sideBySideMode"
                    :compackMode="compackMode"
                    :parentTaskId="filterFromParent.parentTaskId"
                    :totalObject="totalObject"
                    :totalCurrent="data.length"
                    @change-density="isSmallRow = !isSmallRow"
                    @changeObjectType="changeObjectType"
                    @filter-change-value="handleChangeFilterValue"
                    @refresh-task-list="getData()"
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
                                >{{ $t('tasks.header.name') }}
                                <v-icon
                                    @click="showFilterColumn($event, 'name')"
                                    class="fs-15 float-right"
                                    style="padding-top: 3px"
                                    :class="{
                                        'd-active-color':
                                            filteredColumns['name'] &&
                                            filteredColumns['name'] == true
                                    }"
                                    >mdi-filter-variant</v-icon
                                >
                            </v-col>
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-medium"
                                >{{ $t('tasks.header.userCreate') }}
                            </v-col>
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-medium"
                            >
                                {{ $t('tasks.header.createDate') }}
                                <v-icon
                                    @click="
                                        showFilterColumn($event, 'startTime')
                                    "
                                    class="fs-15 float-right"
                                    style="padding-top: 3px"
                                    :class="{
                                        'd-active-color':
                                            filteredColumns['startTime'] &&
                                            filteredColumns['startTime'] == true
                                    }"
                                    >mdi-filter-variant</v-icon
                                >
                            </v-col>
                            <v-col
                                cols="2"
                                v-if="
                                    !sideBySideMode &&
                                    !compackMode &&
                                    !smallComponentMode
                                "
                                class="fs-13 font-weight-medium"
                                >{{ $t('tasks.header.app') }}
                                <v-icon
                                    @click="
                                        showFilterColumn(
                                            $event,
                                            'processDefinitionName'
                                        )
                                    "
                                    class="fs-15 float-right"
                                    style="padding-top: 3px"
                                    :class="{
                                        'd-active-color':
                                            filteredColumns[
                                                'processDefinitionName'
                                            ] &&
                                            filteredColumns[
                                                'processDefinitionName'
                                            ] == true
                                    }"
                                    >mdi-filter-variant</v-icon
                                >
                            </v-col>
                            <v-col
                                cols="1"
                                v-if="
                                    !sideBySideMode &&
                                    !compackMode &&
                                    !smallComponentMode
                                "
                                class="fs-13 font-weight-medium"
                                >{{ $t('tasks.header.status') }}
                                <v-icon
                                    @click="showFilterColumn($event, 'isDone')"
                                    class="fs-15 float-right"
                                    style="padding-top: 3px"
                                    :class="{
                                        'd-active-color':
                                            filteredColumns['isDone'] &&
                                            filteredColumns['isDone'] == true
                                    }"
                                    >mdi-filter-variant</v-icon
                                >
                            </v-col>
                            <v-col
                                cols="1"
                                v-if="
                                    !sideBySideMode &&
                                    !compackMode &&
                                    !smallComponentMode
                                "
                                class="fs-13 font-weight-medium"
                                >{{ $t('common.add') }}</v-col
                            >
                        </v-row>
                    </v-col>
                </v-row>
                <v-divider></v-divider>

                <VuePerfectScrollbar
                    v-if="!loadingTaskList"
                    @ps-y-reach-end="handleReachEndList"
                    :style="{ height: listTaskHeight - 40 + 'px' }"
                >
                    <div
                        v-for="(workGroup, idex) in groupAllProcessInstance"
                        :key="idex"
                    >
                        <v-row
                            :class="{
                                'mr-0 ml-0 single-row': true,
                                'py-0': isSmallRow
                            }"
                            :style="{
                                minHeight: '30px'
                            }"
                            style="border-bottom: 1px solid #eeeeee !important"
                        >
                            <span
                                style="
                                    color: #ff8003;
                                    font-size: 13px;
                                    margin-left: 16px;
                                    margin-top: 6px;
                                "
                                >{{ workGroup.fromNow }}</span
                            >
                        </v-row>
                        <v-row
                            v-for="(obj, idx) in workGroup.works"
                            :key="idx"
                            :index="obj.id"
                            :class="{
                                'mr-0 ml-0 single-row': true,
                                'py-0': isSmallRow,
                                'd-active': index == idx && dataIndex == idex
                            }"
                            :style="{
                                minHeight: '50px'
                            }"
                            @click="selectObject(obj, idx, idex)"
                            style="border-bottom: 1px solid #eeeeee !important"
                        >
                            <v-col
                                :cols="
                                    sideBySideMode ? 10 : compackMode ? 6 : 4
                                "
                                class="pl-3 pr-1 py1"
                            >
                                <div class="pl-1">
                                    <div
                                        class="
                                            pa-0
                                            d-flex
                                            justify-space-between
                                        "
                                    >
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <div
                                                    class="
                                                        fs-13
                                                        text-ellipsis
                                                        w-100
                                                    "
                                                    v-on="on"
                                                >
                                                    <v-icon
                                                        v-if="
                                                            obj.endTime &&
                                                            obj.endTime != null
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
                                        <div
                                            class="fs-11 py-0"
                                            style="
                                                width: 200px;
                                                margin-top: 3px;
                                            "
                                        >
                                            {{
                                                obj.startTime
                                                    ? $moment(
                                                          obj.startTime
                                                      ).format(
                                                          'DD/MM/YY HH:mm:ss'
                                                      )
                                                    : $moment(
                                                          obj.endTime
                                                      ).format(
                                                          'DD/MM/YY HH:mm:ss'
                                                      )
                                            }}
                                        </div>
                                    </div>
                                </div>
                            </v-col>
                            <v-col
                                v-if="!sideBySideMode"
                                cols="2"
                                class="fs-12 px-1 py-0 pt-2 text-ellipsis"
                            >
                                <infoUser
                                    class="userInfo"
                                    :userId="String(obj.startUserId)"
                                    :roleInfo="obj.roleInfo"
                                />
                            </v-col>
                            <v-col
                                v-if="!sideBySideMode"
                                cols="2"
                                class="fs-13 px-1 py-0"
                            >
                                <div class="pt-3">
                                    {{
                                        obj.startTime == null
                                            ? ''
                                            : $moment(obj.startTime).fromNow()
                                    }}
                                </div>
                            </v-col>
                            <v-col
                                class="py-0"
                                cols="2"
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
                                            <span
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
                                                >{{
                                                    $t('v2.myItem.adHoc')
                                                }}</span
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
                            </v-col>
                            <v-col
                                v-if="!sideBySideMode"
                                cols="1"
                                class="fs-13 px-1 py-0"
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
                            </v-col>
                            <v-col
                                v-if="!sideBySideMode"
                                cols="1"
                                class="fs-13 px-1 py-0"
                            >
                                <div class="pl-1 pt-1">
                                    <div style="width: 55px">
                                        {{
                                            commentCountPerTask[
                                                'work:' + obj.id
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
                                        {{ fileCountPerTask['work:' + obj.id] }}
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
                <preloader
                    v-if="loadingTaskList"
                    :style="{ height: listTaskHeight - 50 + 'px!important' }"
                    class="mx-auto"
                />
                <Pagination
                    @on-change-page="getListByPage"
                    @on-change-page-size="getListByPage"
                    :totalVisible="sideBySideMode ? 3 : 7"
                    :showRange="!sideBySideMode"
                    class="mt-2 px-2"
                    :total="totalObject"
                />
            </v-col>
            <v-col
                :cols="!sideBySideMode ? 0 : 8"
                :md="!sideBySideMode ? 0 : 9"
                v-if="sideBySideMode"
                class="pa-0 ma-0"
                height="30"
                style="border-left: 1px solid #e0e0e0"
            >
                <workDetail
                    class="workDetail"
                    :parentHeight="listTaskHeight"
                    :workInfo="selectedWork.workInfo"
                    @close-detail="closeDetail"
                ></workDetail>
            </v-col>
        </v-row>

        <table-filter
            ref="tableFilter"
            :columnFilter="columnFilter()"
            @apply-filter-value="applyFilter"
            @search-autocomplete-items="searchAutocompleteItems"
        ></table-filter>
    </div>
</template>

<script>
import workDetail from '@/components/myItem/work/WorkDetail';
import listHeader from '@/components/myItem/ListHeader';

import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { util } from '../../../plugins/util';
import { appConfigs } from '../../../configs';
import TableFilter from '@/components/common/customTable/TableFilter.vue';
import {
    getDataFromConfig,
    getDefaultFilterConfig
} from '@/components/common/customTable/defaultFilterConfig.js';
import Pagination from '@/components/common/Pagination.vue';

import infoUser from './../InfoUser';
import BPMNEngine from '../../../api/BPMNEngine';
export default {
    computed: {
        fileCountPerTask() {
            return this.$store.state.file.fileCountPerObj.list;
        },
        commentCountPerTask() {
            return this.$store.state.comment.commentCountPerObj.list;
        },
        groupAllProcessInstance() {
            let allUserById = this.$store.getters['app/mapIdToUser'];
            let allPrcess = this.data;
            const groups = allPrcess.reduce((groups, work) => {
                let date;
                work.startUserName = '';
                let roleInfo = {};
                if (work.startUserId) {
                    let userIdStart = work.startUserId;
                    if (userIdStart.indexOf(':') > 0) {
                        //check là userId hay userId:role
                        let arrDataUserIden = userIdStart.split(':');
                        userIdStart = arrDataUserIden[0];
                        if (arrDataUserIden.length > 3) {
                            // loại trừ trường hợp role=0
                            let roleIdentify = work.startUserId.slice(
                                userIdStart.length + 1
                            );
                            roleInfo = this.getRoleUser(roleIdentify);
                        }
                    }
                    work.startUserId = userIdStart;
                    work.startUserName = allUserById[work.startUserId]
                        ? allUserById[work.startUserId].displayName
                        : '';
                    work.roleInfo = roleInfo;
                }
                let appName = '';
                if (work.symperApplicationId) {
                    let allApp = this.$store.state.task.allAppActive;
                    let app = allApp.find(
                        (element) => element.id == work.symperApplicationId
                    );
                    if (app) {
                        appName = app.name;
                    }
                }
                work.symperApplicationName = appName;

                // if ( work.endTime) {
                //     date = work.endTime.split("T")[0];
                // }else{
                date = work.startTime.split(' ')[0];
                // }
                let fromNow = this.getDateFormNow(date);
                if (!groups[fromNow]) {
                    groups[fromNow] = [];
                }
                groups[fromNow].push(work);
                return groups;
            }, {});
            // Edit: to add it in the array format instead
            const groupArrayWork = Object.keys(groups).map((fromNow) => {
                return {
                    fromNow,
                    works: groups[fromNow]
                };
            });
            return groupArrayWork;
        },
        stask() {
            return this.$store.state.task;
        },
        sapp() {
            return this.$store.state.app;
        }
    },
    name: 'listWork',
    components: {
        listHeader: listHeader,
        VuePerfectScrollbar: VuePerfectScrollbar,
        workDetail,
        infoUser,
        TableFilter,
        Pagination
    },
    watch: {
        sideBySideMode(vl) {
            if (!vl) {
                this.$store.dispatch('file/getWaitingFileCountPerObj');
                this.$store.dispatch('comment/getWaitingCommentCountPerObj');
            }
        },
        groupAllProcessInstance: {
            deep: true,
            immediate: true,
            handler(arr) {
                let self = this;
                if (arr.length > 0) {
                    if (this.$route.params.processInstanceId) {
                        for (let i in self.groupAllProcessInstance) {
                            self.groupAllProcessInstance[i].works.forEach(
                                function (e) {
                                    if (
                                        e.id ==
                                        self.$route.params.processInstanceId
                                    ) {
                                        self.selectObject(e, i, i);
                                    }
                                }
                            );
                        }
                    }
                }
            }
        }
    },
    props: {
        compackMode: {
            type: Boolean,
            default: false
        },
        objecType: {
            type: Number
        },
        height: {
            type: String,
            default: 'calc(100vh - 120px)'
        },
        // component này có ở chế độ là component con của một component khác hay ko, false nếu component này là view
        smallComponentMode: {
            type: Boolean,
            default: false
        },
        filterFromParent: {
            type: Object,
            default() {
                return {};
            }
        },
        headerTitle: {
            type: String,
            default() {
                return this.$t('myItem.header');
            }
        },
        filterTaskAction: {
            type: String,
            default: 'getList'
        },
        /**
         * Dữ liệu mặc định cho table
         */
        defaultData: {
            type: Object,
            default() {
                return {
                    listObject: {},
                    columns: {},
                    total: 0
                };
            }
        },
        /**
         * Dùng Trong trường hợp mà gọi đến một API mà không thể thay đổi định dạng trả về của API đó  theo đúng với định dạng chung của ListItem
         * định dạng:
         * {
         *     reformatData(res){} // Lấy ra các cột cần hiển thị
         * }
         **/
        customAPIResult: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data: function () {
        return {
            debounceGetData: null,
            data: [],
            page: 1, // trang hiện tại
            pageSize: 50,
            searchKey: '', //Từ khóa cần tìm kiếm trên tất cả các cột,
            totalObject: 0, // Tổng số trang của danh sách này
            tableFilter: {
                // cấu hình filter của danh sách này
                allColumn: {
                    // cấu hình filter của tất cả các cột trong bảng này dạng {tên cột : cấu hình filter}
                    // startTime:getDefaultFilterConfig(),
                },
                currentColumn: {
                    colFilter: getDefaultFilterConfig(),
                    name: ''
                }
            },
            filteredColumns: {}, // tên các cột đã có filter, dạng {tên cột : true},
            getDataUrl: appConfigs.apiDomain.workflowExtend + 'works',
            /**
             * Thêm điều kiện để quy vấn qua api
             */
            conditionByFormula: {
                type: String
            },
            tableColumns: [],

            index: -1,
            dataIndex: -1,
            loadingTaskList: false,
            loadingMoreTask: false,
            listTaskHeight: 300,
            selectedWork: {
                workInfo: {},
                idx: -1
            },
            isSmallRow: false,
            sideBySideMode: false,
            myOwnFilter: {
                size: 50,
                sort: 'startTime',
                order: 'desc',
                page: 1,
                involvedUser: this.$store.state.app.endUserInfo.id + '%'
            }
        };
    },
    created() {
        this.getData();
    },
    mounted() {
        let self = this;
        this.$store
            .dispatch('process/getAllDefinitions')
            .then((res) => {
                self.getData();
            })
            .catch((err) => {});
        self.reCalcListTaskHeight();
    },
    methods: {
        getListByPage(data) {
            this.page = data.page;
            this.pageSize = data.pageSize;
            this.getData();
        },
        columnFilter() {
            if (this.tableFilter.currentColumn.name == 'isDone') {
                if (
                    this.tableFilter.currentColumn.colFilter.selectItems
                        .length > 0
                ) {
                    let items =
                        this.tableFilter.currentColumn.colFilter.selectItems;
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].value == 1) {
                            this.tableFilter.currentColumn.colFilter.selectItems[
                                i
                            ].label = this.$t('common.done');
                        } else if (items[i].value == 0) {
                            this.tableFilter.currentColumn.colFilter.selectItems[
                                i
                            ].label = this.$t('myItem.unfinished');
                        }
                    }
                }
            }
            return this.tableFilter.currentColumn.colFilter;
        },
        /**
         * Kiểm tra xem một cột trong table có đang áp dụng filter hay ko
         */
        checkColumnHasFilter(colName, filter = false) {
            if (!filter) {
                filter = this.tableFilter.allColumn[colName];
            }
            if (!filter) {
                return false;
            } else {
                if (
                    filter.sort == '' &&
                    $.isEmptyObject(filter.valuesIn) &&
                    $.isEmptyObject(filter.valuesNotIn) &&
                    filter.conditionFilter.items[0].type == 'none' &&
                    filter.searchKey == ''
                ) {
                    return false;
                } else {
                    return true;
                }
            }
        },
        /**
         * Thực hiện filter khi người dùng click vào nút apply của filter
         */
        applyFilter(filter, source = 'filter') {
            this.page = 1; // gán lại page=1 để reset data
            let colName = this.tableFilter.currentColumn.name;
            this.$set(this.tableFilter.allColumn, colName, filter);
            let hasFilter = this.checkColumnHasFilter(colName, filter);
            this.filteredColumns[colName] = hasFilter;
            let icon = $(this.$el).find(
                '.symper-table-dropdown-button[col-name=' + colName + ']'
            );
            this.getData(false, false, true);
            if (hasFilter && source != 'clear-filter') {
                icon.addClass('applied-filter');
            } else {
                this.$delete(this.tableFilter.allColumn, colName);
                icon.removeClass('applied-filter');
            }
        },
        showFilterColumn(event, colName) {
            let x = event.clientX;
            let y = event.clientY;
            var windowWidth = $(window).width() / 1.1;
            if (event.clientX > windowWidth) {
                x -= 190;
            }
            event.preventDefault();
            event.stopPropagation();
            let filterDom = $(this.$refs.tableFilter.$el);
            filterDom.css('left', x + 'px').css('top', y + 20 + 'px');
            this.$refs.tableFilter.show();
            let colFilter = this.tableFilter.allColumn[colName];
            if (!colFilter) {
                colFilter = getDefaultFilterConfig();
                this.$set(this.tableFilter.allColumn, colName, colFilter);
            }

            this.$set(this.tableFilter, 'currentColumn', {
                name: colName,
                colFilter: colFilter
            });
            this.getItemForValueFilter();
        },
        /**
         * Lấy các item phục vụ cho việc lựa chọn trong autocomplete cuar filter
         */
        getItemForValueFilter() {
            let columns = [this.tableFilter.currentColumn.name];
            let self = this;
            let options = {
                pageSize: 300,
                getDataMode: 'autocomplete',
                distinct: true,
                page: 1
            };
            let success = (data) => {
                if (data.status == 200) {
                    self.tableFilter.currentColumn.colFilter.selectItems = null;
                    let items = data.data.listObject.reduce((arr, el) => {
                        arr.push(el[columns[0]]);
                        return arr;
                    }, []);
                    self.tableFilter.currentColumn.colFilter.selectItems =
                        self.createSelectableItems(items);
                }
                console.log(
                    self.tableFilter.currentColumn.selectItems,
                    'datadatadatadatadata'
                );
            };
            this.prepareFilterAndCallApi(
                columns,
                false,
                true,
                success,
                options
            );
        },
        /* Lấy ra cấu hình cho việc sort
         */
        async prepareFilterAndCallApi(
            columns = false,
            cache = false,
            applyFilter = false,
            success,
            configs = {}
        ) {
            if (Object.keys(this.defaultData.listObject).length > 0) {
                success({ data: this.defaultData });
                return;
            }
            let url = this.getDataUrl;
            let method = 'GET';
            if (url != '') {
                let thisCpn = this;
                // thisCpn.loadingData = true;
                // let options = this.getOptionForGetList(configs, columns);
                let emptyOption = false;
                let header = {};
                let routeName = this.$getRouteName();
                if (
                    routeName == 'deployHistory' ||
                    routeName == 'listProcessInstances'
                ) {
                    header = {};
                    // options = {};
                    emptyOption = true;
                }
                if (
                    this.$route.name == 'ListWorkOfAWorkflow' ||
                    this.$route.name == 'my-applications'
                ) {
                    let processKey = '';
                    let res = await BPMNEngine.getListModels({
                        filter: [
                            {
                                column: 'id',
                                operation: 'and',
                                conditions: [
                                    {
                                        name: 'equal',
                                        value: this.$route.params.id
                                    }
                                ]
                            }
                        ]
                    });
                    processKey = res.data.listObject[0]
                        ? res.data.listObject[0].processKey
                        : Date.now();
                    configs.filter = [
                        {
                            column: 'processDefinitionId',
                            operation: 'and',
                            conditions: [
                                {
                                    name: 'begins_with',
                                    value: processKey
                                }
                            ]
                        }
                    ];
                }

                configs.searchKey = this.searchKey;
                configs.page = configs.page ? configs.page : this.page;
                configs.pageSize = this.pageSize;
                configs.formulaCondition = this.conditionByFormula;
                let tableFilter = this.tableFilter;
                tableFilter.allColumnInTable = [];
                configs.emptyOption = emptyOption;
                getDataFromConfig(
                    url,
                    configs,
                    columns,
                    tableFilter,
                    success,
                    'GET',
                    header
                );
            }
        },

        searchAutocompleteItems(vl) {
            this.tableFilter.currentColumn.colFilter.searchKey = vl;
            this.getItemForValueFilter();
        },
        /**
         * Tạo ra các item có check box với trạng thái đã check hay chưa
         * @param items danh sách các value dạng ['ccc','xxc', ....]
         */
        createSelectableItems(items) {
            let colFilter = this.tableFilter.currentColumn.colFilter;
            let selectableItems = [];
            if (colFilter.clickedSelectAll) {
                // chọn tất cả
                selectableItems = items.reduce((arr, el) => {
                    arr.push({
                        value: el,
                        checked: true
                    });
                    return arr;
                }, []);
            } else if (colFilter.selectAll) {
                // not in
                selectableItems = items.reduce((arr, el) => {
                    arr.push({
                        value: el,
                        checked: colFilter.valuesNotIn[el] ? false : true
                    });
                    return arr;
                }, []);
            } else {
                // in
                selectableItems = items.reduce((arr, el) => {
                    arr.push({
                        value: el,
                        checked: colFilter.valuesIn[el] ? true : false
                    });
                    return arr;
                }, []);
            }
            return selectableItems;
        },

        /**~~~~~~~~~~~~~~~~~~~~ */
        getRoleUser(roleIdentify) {
            let arrDataRole = roleIdentify.split(':');
            let allSymperRole = this.$store.state.app.allSymperRoles;
            if (allSymperRole[arrDataRole[0]]) {
                let role = allSymperRole[arrDataRole[0]].find(
                    (element) => element.roleIdentify === roleIdentify
                );
                return role;
            } else {
                return {};
            }
        },
        getDateFormNow(time) {
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
            // if (
            //     this.data.length < this.totalObject &&
            //     this.data.length > 0  && !this.loadingTaskList && !this.loadingMoreTask
            // ) {
            //     this.page +=1;
            //     this.getData();
            // }
        },
        handleChangeFilterValue(data) {
            // for (let key in data) {
            //     this.$set(this.myOwnFilter, key, data[key]);
            // }
            // this.getData();
            this.searchKey = data.nameLike;
            if (this.debounceGetData) {
                clearTimeout(this.debounceGetData);
            }
            this.debounceGetData = setTimeout(
                (self) => {
                    self.page = 1;
                    self.getData();
                },
                300,
                this
            );
        },
        reCalcListTaskHeight() {
            this.listTaskHeight =
                util.getComponentSize(this.$el.parentElement).h - 85;
        },
        getUser(id) {
            this.$refs.user.getUser(id);
        },
        selectObject(obj, idx, idex) {
            this.index = idx;
            this.dataIndex = idex;
            this.$set(this.selectedWork, 'workInfo', obj);
            this.selectedWork.workInfo.appName = obj.symperApplicationName;
            this.selectedWork.idx = idx;
            if (!this.compackMode) {
                this.sideBySideMode = true;
                this.$emit('change-height', 'calc(100vh - 88px)');
            }
        },
        closeDetail() {
            this.sideBySideMode = false;
            this.$emit('change-height', 'calc(100vh - 120px)');
        },
        /**
         * Lấy data từ server
         * @param {Array} columns chứa thông tin của các cột cần trả về.
         * @param {Boolean} cache có ưu tiên dữ liệu từ cache hay ko
         *
         */
        getData(
            columns = false,
            cache = false,
            applyFilter = true,
            lazyLoad = true,
            showLoading = true
        ) {
            if (this.loadingTaskList || this.loadingMoreTask) {
                return;
            }
            let self = this;

            if (showLoading) {
                this.loadingTaskList = true;
            }

            if (Object.keys(this.tableFilter.allColumn).length == 0) {
                this.tableFilter.allColumn['startTime'] =
                    getDefaultFilterConfig();
                this.tableFilter.allColumn.startTime.sort = 'desc';
            }
            let thisCpn = this;
            let handler = (data) => {
                if (thisCpn.customAPIResult.reformatData) {
                    data = thisCpn.customAPIResult.reformatData(data);
                } else {
                    data = data.data;
                }
                this.totalObject = data.total ? parseInt(data.total) : 0;

                let resData = data.listObject ? data.listObject : [];

                let processIden = [],
                    processId = [];
                if (lazyLoad) {
                    resData.forEach(function (e) {
                        thisCpn.data.push(e);
                    });
                    thisCpn.data = resData;
                }

                for (let work of resData) {
                    processIden.push('work:' + work.id);
                }

                this.$store.commit(
                    'file/setWaitingFileCountPerObj',
                    processIden
                );
                this.$store.commit(
                    'comment/setWaitingCommentCountPerObj',
                    processIden
                );
                this.$store.dispatch('file/getWaitingFileCountPerObj');
                this.$store.dispatch('comment/getWaitingCommentCountPerObj');

                thisCpn.$emit('data-get', data.listObject);
                thisCpn.loadingTaskList = false;
                thisCpn.loadingMoreTask = false;
            };
            this.prepareFilterAndCallApi(columns, cache, applyFilter, handler);
        }
    }
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
.col-10 {
    flex: 0 0 97%;
    max-width: 97%;
}
.d-active-color {
    color: #f58634;
}
</style>

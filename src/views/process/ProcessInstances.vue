<template>
    <div class="h-100 w-100">
        <list-items
            v-show="!sideBySideMode"
            ref="listProcessInstances"
            :useDefaultContext="false"
            :pageTitle="$t('process.instance.list')"
            :tableContextMenu="tableContextMenu"
            :containerHeight="containerHeight"
            :getDataUrl="getListUrl()"
            :customAPIResult="customAPIResult"
            :useActionPanel="false"
            :headerPrefixKeypath="'process.instance'"
            @on-add-item-clicked="goToCreatePage()"
            @data-get="handleAfterChangeData"
            :emptyDataKey="'workflow-lastest-run'"
            :disableButtonAdd="disableButtonAdd"
        ></list-items>
        <v-row class="mr-0 ml-0 h-100" v-show="sideBySideMode">
            <v-col
                :cols="!sideBySideMode ? 12 : 4"
                :md="!sideBySideMode ? 12 : 3"
                class="pt-0 pl-0 pr-0 pb-0"
            >
                <listHeader
                    :isSmallRow="isSmallRow"
                    :sideBySideMode="sideBySideMode"
                    :compackMode="compackMode"
                    @change-density="isSmallRow = !isSmallRow"
                ></listHeader>
                <v-divider v-if="!sideBySideMode"></v-divider>
                <v-row class="ml-0 mr-0" v-if="!sideBySideMode">
                    <v-col cols="12" class="list-tasks pt-0 pb-0">
                        <v-row>
                            <v-col
                                :cols="
                                    sideBySideMode ? 12 : compackMode ? 6 : 4
                                "
                                class="pl-8 fs-13 font-weight-bold"
                            >
                                {{ $t('tasks.header.name') }}
                            </v-col>
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-bold"
                            >
                                {{ $t('tasks.header.assignee') }}
                            </v-col>
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-bold"
                            >
                                {{ $t('tasks.header.dueDate') }}
                            </v-col>
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-bold"
                            >
                                {{ $t('tasks.header.owner') }}
                            </v-col>
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode && !compackMode"
                                class="text-right fs-13 font-weight-bold"
                            >
                                <v-btn
                                    text
                                    x-small
                                    @click="isSmallRow = !isSmallRow"
                                    class="pr-0 pl-0"
                                >
                                    <v-icon size="18">{{
                                        isSmallRow
                                            ? 'mdi-view-stream'
                                            : 'mdi-view-headline'
                                    }}</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-divider></v-divider>
                <v-row class="ml-0 mr-0 list-instances">
                    <div
                        class="instance-item"
                        v-for="(item, idx) in listInstances"
                        :key="idx"
                        @click="selectProcessInstance(item)"
                    >
                        <div class="instance-item-title w-100 lh-initial">
                            <span class="fs-13">{{
                                item.processDefinitionName
                            }}</span>
                        </div>
                        <div class="instance-item-creator float-left">
                            <i
                                class="mdi mdi-account-cog mr-1 fs-14 grey--text"
                            ></i
                            ><span class="grey--text fs-12">{{
                                item.startUserId
                            }}</span>
                        </div>
                        <div class="instance-item-time float-right">
                            <i
                                class="mdi mdi-clock-time-nine-outline fs-13 mr-1 grey--text"
                            ></i
                            ><span class="grey--text fs-12">{{
                                $moment(item.startTime).fromNow()
                            }}</span>
                        </div>
                    </div>
                </v-row>
            </v-col>
            <v-col
                :cols="!sideBySideMode ? 0 : 8"
                :md="!sideBySideMode ? 0 : 9"
                v-if="sideBySideMode"
                class="pt-0 px-0"
                style="border-left: 1px solid #e0e0e0"
            >
                <processInstanceDetail
                    :componentHeight="containerHeight"
                    :instanceId="this.selectedInstance.id"
                    @close-detail="closeDetail"
                ></processInstanceDetail>
            </v-col>
            <userSelector ref="user" class="d-none"></userSelector>
        </v-row>
    </div>
</template>
<script>
import { util } from './../../plugins/util.js';
import { reformatGetListInstances } from './../../components/process/reformatGetListData.js';
import { appConfigs } from './../../configs.js';
import ListItems from './../../components/common/ListItems.vue';
import bpmnApi from './../../api/BPMNEngine.js';
import listHeader from './../../views/tasks/listHeader';
import userSelector from './../../views/tasks/userSelector';
import SymperIcon from './../../components/common/SymperIcon';
import processInstanceDetail from './processInstanceDetail.vue';

export default {
    data() {
        let self = this;
        return {
            listProrcessInstances: [],
            isSmallRow: false,
            sideBySideMode: false,
            openPanel: [0, 1, 2, 3, 4],
            compackMode: false,
            selectedInstance: {},
            height: 'calc(100vh - 120px)',
            listInstances: [], // danh sách các instance cần hiển thị ở panel bên trái

            containerHeight: 300,
            listItemOptions: {},
            customAPIResult: {
                reformatData: reformatGetListInstances
            },
            tableContextMenu: [
                {
                    name: 'remove',
                    text: this.$t('common.delete'),
                    callback: (row, callback) => {
                        this.removeCallback = callback;
                        this.deleteSnippet(row);
                    }
                },
                {
                    name: 'detail',
                    text: this.$t('common.tracking'),
                    callback: (row, callback) => {
                        self.$goToPage(
                            `/workflow/process-instances/${row.id}/tracking`
                        );
                    }
                }
                // {
                //     name: "works",
                //     text: this.$t("common.works"),
                //     callback: (row, callback) => {
                //         this.selectedInstance = row;
                //         self.showInstanceWorkDetail();
                //     }
                // },
            ],
            disableButtonAdd: true
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    created() {},
    watch: {},
    methods: {
        selectProcessInstance(instance) {
            for (let key in instance) {
                this.$set(this.selectedInstance, key, instance[key]);
            }
        },
        handleAfterChangeData(items) {
            this.listInstances = items;
        },
        closeDetail() {
            this.sideBySideMode = false;
        },
        getListUrl() {
            let processKey = this.$route.params.processKey;
            return (
                appConfigs.apiDomain.bpmne.listHistoryInstances +
                '?size=100&sort=startTime&order=desc&processDefinitionKey=' +
                processKey
            );
        },
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
        // Hiển thị chi tiết work của một instance
        showInstanceWorkDetail() {
            this.sideBySideMode = true;
        }
    },
    components: {
        ListItems: ListItems,
        listHeader: listHeader,
        userSelector: userSelector,
        icon: SymperIcon,
        processInstanceDetail: processInstanceDetail
    }
};
</script>
<style scoped>
.djs-container {
    background-color: #f2f2f2;
}
.instance-item {
    padding: 7px 10px;
    cursor: pointer;
    width: 100%;
}
.instance-item:hover {
    background-color: #f5f5f5;
}
</style>

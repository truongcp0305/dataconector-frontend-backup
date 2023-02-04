<template>
    <div
        ref="smartObjectListContainer"
        class="smart-object-list-container"
        :style="{
            'border-top': type == 'document' ? '0.5px solid #e0e0e0' : ''
        }"
    >
        <ListObject
            ref="listObject"
            :customUrlGetData="
                listVisibleLinks[tab]
                    ? listVisibleLinks[tab].dataObject.apiUrl
                    : ''
            "
            :configContextMenu="
                listVisibleLinks[tab]
                    ? listVisibleLinks[tab].dataObject.tableContextMenu
                    : {}
            "
            :sqlConditonLinkSmartObject="sqlConditonLinkSmartObject"
            :showFilter="false"
            :emptyDataKey="'document-record-list'"
            :showTitle="false"
            :showDisplayConfig="false"
            :showCustomButton="false"
            @render-listObject-done="handleRenderListObjectDone"
            v-if="isLoadDataSmartObject"
            :isAddInSBS="true"
            :customDataForApi="customDataForApi"
            :hideActionDelete="hideActionDelete"
            :isViewSmartObject="true"
            :idDocSmartOject="
                listVisibleLinks[tab]
                    ? listVisibleLinks[tab].dataObject.id
                    : ''
            "
            :titleDocSmartOject="
                listVisibleLinks[tab] ? listVisibleLinks[tab].config.name : ''
            "
            :showActionPanelInDisplayConfig="false"
            @change-conditional-formula="changeConditionalFormula"
            :apiMethod="'POST'"
            :customContentType="true"
            :isShowButtonClose="true"
            @close-list="$emit('close-list')"
            @highlight-department="highlightDepartment"
            :nameLink="
                listVisibleLinks[tab]
                    ? listVisibleLinks[tab].config.name
                    : ''
            "
        >
            <div slot="tab-view-smart-object" style="max-width: 1100px">
                <v-tabs
                    v-model="tab"
                    align-with-title
                    color="orange"
                    height="35"
                    show-arrows
                >
                    <v-tabs-slider color="orange"></v-tabs-slider>
                    <v-tab
                        v-for="item in listVisibleLinks"
                        :key="item.id"
                        class="px-3 fs-13 ml-0 view-tab"
                        style="text-transform: none"
                    >
                        <v-tooltip bottom v-if="item.config.description">
                            <template v-slot:activator="{ on, attrs }">
                                <span v-bind="attrs" v-on="on">{{
                                    item.config.name
                                }}</span>
                            </template>
                            <span>{{ item.config.description }}</span>
                        </v-tooltip>
                        <span v-else>{{ item.config.name }}</span>
                    </v-tab>
                </v-tabs>
            </div>
            <div slot="view-orgchart" class="h-100">
                <OrgchartEditor
                    :action="'view'"
                    :id="listVisibleLinks[tab] ? listVisibleLinks[tab].dataObject.id : ''"
                    :isViewSbs="true"
                    :idDepartmentHighLight="idDepartmentHighLight"
                >
                </OrgchartEditor>
            </div>
        </ListObject>
    </div>
</template>
<script>
import ListObject from '@/../src/views/document/listobject/ListObject';
import SmartObjectEndUserWorker from 'worker-loader!@/worker/smartObject/SmartObjectEndUser.Worker.js';
import { util } from '@/plugins/util.js';
import OrgchartEditor from '@/components/orgchart/editor/OrgchartEditor.vue';


export default {
    name: 'listSmartObjects',
    components: {
        ListObject,
        OrgchartEditor
    },
    created() {
        this.getData();
    },
    mounted() {
        let elStyle = this.$refs.smartObjectListContainer.style;

        if (this.$store.state.app.collapseSideBar) {
            elStyle.left = '56px';
        } else {
            elStyle.left = '256px';
        }
        this.$evtBus.$on('collapse-app-sidebar', (data) => {
            if (!data) {
                elStyle.left = '256px';
            } else {
                elStyle.left = '56px';
            }
        });
    },
    data: function () {
        let self = this;
        return {
            containerHeight: 0,
            tab: 0,
            listLinks: [],
            isLoadDataSmartObject: false,
            customDataForApi() {
                if (
                    self.listVisibleLinks[self.tab] &&
                    self.listVisibleLinks[self.tab].showDataTable
                ) {
                    return {
                        showDataTable: true,
                        tableName:
                            self.listVisibleLinks[self.tab].showDataTable
                                .tableName,
                        tableId:
                            self.listVisibleLinks[self.tab].showDataTable
                                .tableId
                    };
                } else return null;
            },
            oldTab: null,
            idDepartmentHighLight: ''
        };
    },
    methods: {
        async getData() {
            this.worker = new SmartObjectEndUserWorker();
            let res = await runBySymperPromiseWorker(
                this.worker,
                'getSmartObject',
                {
                    id: this.id,
                    type: this.type,
                    allDataDocument: this.allDataDocument,
                    allControlDocument: this.allControlDocument,
                    dataSMO: this.dataSMO,
                    listUserInNode: this.listUserInNode,
                    operations: this.operations
                }
            );
            if (res) {
                this.listLinks = res;
                this.isLoadDataSmartObject = true;
                if (
                    this.listVisibleLinks &&
                    this.listVisibleLinks[this.tab] &&
                    this.listVisibleLinks[this.tab].dataControl
                ) {
                    this.$emit(
                        'focus-control',
                        this.listVisibleLinks[this.tab].dataControl
                    );
                }
            }
        },
        refreshList() {
            this.$refs.listObject.refreshList();
        },
        customContextMenu() {
            let self = this;
            self.listLinks.map((link) => {
                if(link.dataObject.action){
                    link.dataObject.action.map((action) => {
                        link.dataObject.tableContextMenu[action.name] = {
                            name: action.name,
                            text: action.name,
                            allwaysShow: true,
                            isActionSmartObject: true,
                            callback: (obj, callback) => {
                                if (action.value.type == 'formula') {
                                    let formulas = {
                                        dataInput: obj,
                                        formulas: action.value.value
                                    };
                                    runBySymperPromiseWorker(
                                        self.worker,
                                        'updateByFormula',
                                        formulas
                                    );
                                }
                                if (action.value.type == 'workflow') {
                                    let url =
                                        window.location.origin +
                                        '/#/workflow/modeler/' +
                                        action.value.value +
                                        '/start-process-instance';
                                    var win = window.open(url, '_blank');
                                    win.focus();
                                }
                            }
                        };
                    });
                }
            });
            this.$refs.listObject.addContextConfigSmartObject(
                this.listVisibleLinks[this.tab].dataObject.tableContextMenu
            );
        },
        handleRenderListObjectDone() {
            this.customContextMenu();
            this.$emit('smart-object-finish-loading-data')
            $(this.$refs.listObject.$el).find('.ag-theme-balham.ag-list-items-table').css({
                "height" : util.getComponentSize(this).h - 94
            });
        },
        /**
         * refresh lại showlist khi 2 tab cùng apiUrl
         */
        changeConditionalFormula() {
            if (this.oldTab && this.listVisibleLinks[this.oldTab]) {
                if (
                    this.listVisibleLinks[this.tab].dataObject.apiUrl ==
                    this.listVisibleLinks[this.oldTab].dataObject.apiUrl
                ) {
                    this.$refs.listObject.refreshList();
                }
            }
        },
        highlightDepartment(id){
            this.idDepartmentHighLight = id
        }
    },
    watch: {
        tab: {
            deep: true,
            immediate: true,
            handler(val, oldValue) {
                if (
                    this.listVisibleLinks.length != 0 &&
                    this.listVisibleLinks[val]
                ) {
                    this.$emit(
                        'focus-control',
                        this.listVisibleLinks[val].dataControl
                    );
                    this.$refs.listObject.addContextConfigSmartObject(
                        this.listVisibleLinks[val].dataObject.tableContextMenu
                    );
                    if (oldValue) {
                        this.oldTab = oldValue;
                    }
                }
            }
        },
        listUserInNode: {
            deep: true,
            immediate: true,
            async handler(val) {
                if (val) {
                    await this.getData();
                    this.refreshList();
                }
            }
        }
    },
    props: {
        id: {
            default: '3025'
        },
        type: {
            default: 'document'
        },
        allDataDocument: {
            type: Object,
            default() {
                return {};
            }
        },
        allControlDocument: {
            type: Object,
            default() {
                return {};
            }
        },
        dataSMO: {
            type: Array,
            default() {
                return [];
            }
        },
        listUserInNode: {
            type: Array
        },
        idControlClicked: {
            type: String
        },
        dataCellClicked: {
            type: Object
        }
    },
    computed: {
        listVisibleLinks() {
            let self = this;
            if (self.idControlClicked) {
                self.tab = 0;
                return self.listLinks.filter((link) => {
                    if (link.dataControl.id == self.idControlClicked) {
                        if (Object.keys(self.dataCellClicked) != 0) {
                            if (link.dataControl.inTable) {
                                link.dataObject.sqlQueryForDataInTable =
                                    '(' +
                                    link.nameControlObjectLink +
                                    ` = '` +
                                    self.dataCellClicked[
                                        link.dataControl.name
                                    ] +
                                    `') AND ` +
                                    link.sqlQueryFromTreeCondition;
                            }
                        }
                    }
                    this.$emit('smart-object-finish-loading-data');
                    return link.dataControl.id == self.idControlClicked;
                });
            } else {
                return self.listLinks;
            }
        },
        operations() {
            let userInfo = util.auth.getSavedUserInfo();
            let userType = userInfo.profile.type;
            let listOperations = {}
            if (userType == 'ba') {
                return { get_all_operations: true };
            } else {
                if (
                    this.$store.state.app.userOperations['document_instance']
                ) {
                    listOperations = this.$store.state.app.userOperations['document_instance']
                }
                if (
                    this.$store.state.app.userOperations['orgchart']
                ) {
                    listOperations = {...listOperations,...this.$store.state.app.userOperations['orgchart']}
                }
            }
            return listOperations;
        },
        hideActionDelete() {
            if (
                this.listVisibleLinks[this.tab] &&
                this.listVisibleLinks[this.tab].showDataTable
            ) {
                return true;
            } else return false;
        },
        sqlConditonLinkSmartObject() {
            if (this.listVisibleLinks[this.tab]) {
                return this.listVisibleLinks[this.tab].dataObject
                    .sqlQueryForDataInTable
                    ? this.listVisibleLinks[this.tab].dataObject
                          .sqlQueryForDataInTable
                    : this.listVisibleLinks[this.tab].dataObject.sqlQuery;
            } else return '';
        }
    }
};
</script>
<style>
.smart-object-list-container {
    background-color: white;
    position: fixed;
    bottom: 0;
    left: 56px;
    right: 0;
    height: 50vh !important;
    z-index: 100;
    transition: all linear 100ms;
}
.symper-table-filter-container {
    height: 360px !important;
}
</style>
<style scoped>
.view-tab.v-tab:not(.v-tab--active) {
    color: black !important;
}

.smart-object-list-container >>> .not-found-screen img {
    height: 150px;
}
</style>

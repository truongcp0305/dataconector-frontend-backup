<template>
    <div class="h-100 w-100 orgchart-table-view">
        <v-tabs-items v-model="currentTab" class="h-100">
            <v-tab-item :key="'smoView'" class="px-2 pt-2 h-100">
                <div class="h-100 symper-orgchart-table-view d-flex">
                    <div style="" class="h-100">
                        <div
                            style="
                                height: 31px;
                                display: flex;
                                align-items: center;
                                margin-bottom: 13px;
                            "
                            class="tree-orgchart"
                        >
                            <span
                                style="font: 18px roboto; font-weight: 500"
                                class="mt-1"
                                >{{ $t('orgchart.relatedInfo') }}</span
                            >
                            <v-menu
                                :max-width="500"
                                :max-height="700"
                                :nudge-width="200"
                                class="mt-1"
                                offset-y
                            >
                                <template v-slot:activator="{ on }">
                                    <v-btn icon tile x-small v-on="on">
                                        <v-icon>mdi-chevron-down</v-icon>
                                    </v-btn>
                                </template>
                                <v-list nav dense>
                                    <v-list-item-group
                                        v-model="currentTab"
                                        color="primary"
                                    >
                                        <v-list-item
                                            v-for="(item, i) in menuPickTab"
                                            :key="i"
                                        >
                                            <v-list-item-icon>
                                                <v-icon
                                                    v-text="item.icon"
                                                ></v-icon>
                                            </v-list-item-icon>

                                            <v-list-item-content>
                                                <v-list-item-title
                                                    v-text="
                                                        $t(
                                                            'orgchart.' +
                                                                item.title
                                                        )
                                                    "
                                                ></v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                            </v-menu>
                        </div>
                        <VueResizable
                            :width="400"
                            :max-width="500"
                            :min-width="300"
                            :active="['r']"
                            @resize:end="resizeEnd"
                        >
                            <AgDataTable
                                class="mt-1 tree-orgchart"
                                ref="agTree"
                                :tableHeight="'calc(100% - 50px)'"
                                :customTableStyle="true"
                                :rowData="dataTable"
                                :editable="false"
                                :customComponents="customAgComponents"
                                :hideRowBorderCss="true"
                                @on-cell-click="onCellDblClick"
                                :getContextMenuItems="getContextMenuItems"
                                @on-cell-context-menu="onCellContextMenu"
                                @model-updated="onModelUpdate"
                                :minWidth="500"
                                :cellRendererParams="{
                                    innerRenderer: 'nodeName',
                                    suppressDoubleClickExpand: true
                                }"
                            >
                            </AgDataTable>
                        </VueResizable>
                    </div>

                    <SmartObjectViewEndUser
                        ref="SMOEndUser"
                        :id="idOrgchart"
                        :type="'orgchart'"
                        :dataSMO="dataSMO"
                        :listUserInNode="listUserInNode"
                    />
                </div>
            </v-tab-item>
            <v-tab-item :key="'diagramView'" class="px-2 pt-2 h-100">
                <OrgchartEditor
                    :action="'view'"
                    @current-tab="changeTab"
                    :key="'diagramView'"
                    :currentTab="currentTab"
                    :showMenuPickTab="true"
                    :id="$route.params.id"
                >
                </OrgchartEditor>
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
import AgDataTable from '@/components/common/agDataTable/AgDataTable.vue';
import { getMapDpmIdToPosition } from '../editor/nodeAttrFactory';
import NodeNameInTable from './NodeNameInTable.vue';
import UserInNodeView from './UserInNodeView.vue';
import OrgStructureView from './OrgStructureView.vue';
import OrgchartEditor from '@/components/orgchart/editor/OrgchartEditor.vue';
import TableSideBySildeView from './TableSideBySildeView.vue';
import ListItems from '@/components/common/ListItems.vue';
import PerfectScrollbar from 'perfect-scrollbar';
import VueResizable from 'vue-resizable';
import { util } from '@/plugins/util.js';
import Detail from '@/views/document/detail/Detail.vue';
import { orgchartApi } from '@/api/orgchart.js';
import { appConfigs } from '@/configs';
import SmartObjectViewEndUser from '@/views/smartObject/EndUser/SmartObjectViewEndUser.vue';
import { smartObjectApi } from '@/api/smartObject.js';
import { documentApi } from '@/api/Document.js';

export default {
    props: {
        allDepartments: {
            default() {
                return [];
            }
        },

        allPositions: {
            default() {
                return [];
            }
        },
        idOrgchart: {
            type: String
        },
        allUsers: {
            default() {
                return [];
            }
        }
    },
    components: {
        AgDataTable: AgDataTable,
        OrgStructureView: OrgStructureView,
        OrgchartEditor,
        TableSideBySildeView,
        ListItems,
        VueResizable,
        Detail,
        SmartObjectViewEndUser
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
        this.currentSize = util.getComponentSize(this);
        $('.ag-cell').on('contextmenu', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
        this.getConfigSmartObject();
    },
    computed: {
        allUserInOrgchart() {
            return this.$store.state.orgchart.allUserInOrgChart[
                this.$route.params.id
            ];
        },
        dataTable() {
            let data = [];
            if (this.allDepartments == null) {
                return [];
            }
            let mapDpmToPos = getMapDpmIdToPosition(this.allPositions);
            this.mapDpmToPos = null;
            this.mapDpmToPos = mapDpmToPos;
            this.createMapNameToDynamicAttr();
            let operations = this.$store.state.app.userOperations.department;
            let userInfo = util.auth.getSavedUserInfo();
            let userType = userInfo.profile.type;
            let keyDpm = []; // lưu những dpm được chọn cho xem
            let departments = this.allDepartments.reduce((map, el) => {
                map[el.vizId] = el;
                return map;
            }, {});
            this.addPathForAllNode(departments);
            let mapDepartments = {};
            if (userType == 'ba' || (userType == 'user' && !operations)) {
                mapDepartments = departments;
            } else if (operations) {
                let idUser = this.$store.state.app.endUserInfo.id;
                let users = this.allUsers.reduce((map, el) => {
                    if (!map[el.userId]) {
                        map[el.userId] = [];
                    }
                    map[el.userId].push(el.positionNodeId);
                    return map;
                }, {});
                let positions = this.allPositions.reduce((map, el) => {
                    map[el.vizId] = el;
                    return map;
                }, {});
                // xử lý lúc phân quyền xem phòng ban và phòng ban con
                if (
                    operations[0] &&
                    (operations[0].view_only_owner ||
                        operations[0].view_only_sub)
                ) {
                    for (let idx in positions) {
                        if (users[idUser].includes(positions[idx].id)) {
                            let vizParentId = positions[idx].vizParentId;
                            while (positions[vizParentId]) {
                                vizParentId =
                                    positions[vizParentId].vizParentId;
                            }
                            mapDepartments[vizParentId] =
                                departments[vizParentId];
                            keyDpm.push(vizParentId);
                        }
                    }
                }
                // xử lý lúc phân quyền xem các phòng ban khác
                if (operations[0] && operations[0].view_only_sub) {
                    this.viewOnlySub(departments, mapDepartments, keyDpm);
                }

                let keys = Object.keys(operations);
                keys = keys.filter((e) => e != '0'); // nếu có phân quyền phòng ban khác
                if (keys) {
                    this.viewOther(
                        keys,
                        this.idOrgchart,
                        mapDepartments,
                        departments,
                        keyDpm
                    );
                }

                mapDepartments = this.getItemfromPath(
                    departments,
                    mapDepartments
                );
            }

            for (let dpmId in mapDpmToPos) {
                let mapIdToPos = mapDpmToPos[dpmId];
                this.addPathForAllNode(mapIdToPos);
            }
            for (let id in mapDepartments) {
                let dpm = mapDepartments[id];
                let row = {
                    name: dpm.path,
                    vizId: dpm.vizId,
                    code: dpm.code,
                    managers:
                        typeof dpm.users == 'string'
                            ? JSON.parse(dpm.users)
                            : dpm.users,
                    users: [],
                    nodeType: dpm.type
                };
                row = this.addDynamicValue(row, dpm);
                data.push(row);
            }

            for (let idDpm in mapDpmToPos) {
                let mapPos = mapDpmToPos[idDpm];
                if (mapDepartments[idDpm]) {
                    if (keyDpm.length == 0 || keyDpm.includes(idDpm)) {
                        // check nếu keyDpm =[] là view all, !=[] thì check xem phòng ban có được phân quyền k, có thì mới thêm position
                        let department = mapDepartments[idDpm];
                        for (let posId in mapPos) {
                            let pos = mapPos[posId];
                            let row = {
                                name: department.path.concat(pos.path),
                                vizId: pos.vizId,
                                code: pos.code,
                                users:
                                    typeof pos.users == 'string'
                                        ? JSON.parse(pos.users)
                                        : pos.users,
                                managers: [],
                                nodeType: pos.type
                            };
                            row = this.addDynamicValue(row, pos);
                            data.push(row);
                        }
                    }
                }
            }

            setTimeout(
                (self) => {
                    if (self.$refs.orgStructureView) {
                        self.$refs.orgStructureView.reDrawDiagram();
                    }
                },
                1000,
                this
            );
            return data;
        },
        allColumns() {
            let size = Math.floor(this.currentSize.w);
            if (!isNaN(size)) {
                let defaultColDefs = [
                    {
                        headerName: this.$t('common.code'),
                        field: 'code',
                        width: size / 9,
                        colId: 'code',
                        resizable: true
                    },
                    {
                        headerName: this.$t('common.manager'),
                        field: 'managers',
                        width: size / 5 + 50,
                        colId: 'managers',
                        cellRenderer: 'UserInNodeView',
                        resizable: true
                    },
                    {
                        headerName: this.$t('common.users'),
                        field: 'users',
                        width: size / 2.3,
                        colId: 'users',
                        cellRenderer: 'UserInNodeView',
                        resizable: true
                    }
                ];

                let colDefs = defaultColDefs;
                for (let name in this.mapNameToDynamicAttr) {
                    colDefs.push({
                        headerName: name,
                        field: this.mapNameToDynamicAttr[name],
                        width: size / 6,
                        colId: this.mapNameToDynamicAttr[name]
                    });
                }
                setTimeout(
                    (self) => {
                        if (self.$refs.displayTable) {
                            self.$refs.displayTable.refreshData(colDefs);
                        }
                    },
                    0,
                    this
                );
                return colDefs;
            }
        }
    },
    methods: {
        async getConfigSmartObject() {
            let res = await smartObjectApi.getSmartObjectByIdObject(
                'orgchart',
                this.idOrgchart
            );
            if (res.status == 200) {
                if (res.data) {
                    for (let link of res.data) {
                        let isObjectSource = false;
                        if (this.idOrgchart == link.id_object_source) {
                            isObjectSource = true;
                        }
                        let config = JSON.parse(link.config);
                        if (isObjectSource) {
                            var allControlObjectTarget =
                                await this.getAllControlInDoc(
                                    link.id_object_target
                                );
                            if (
                                !config.isViewSourceToTarget ||
                                !allControlObjectTarget[link.id_col_target]
                            ) {
                                link.disableLink = true;
                            } else if (
                                link.objectTarget.type.trim() == 'document'
                            ) {
                                link.allControlObjectTarget =
                                    allControlObjectTarget;
                            }
                        } else {
                            var allControlObjectSource =
                                await this.getAllControlInDoc(
                                    link.id_object_source
                                );
                            if (
                                !config.isViewTargetToSource ||
                                !allControlObjectSource[link.id_col_source]
                            ) {
                                link.disableLink = true;
                            } else if (
                                link.objectSource.type.trim() == 'document'
                            ) {
                                link.allControlObjectSource =
                                    allControlObjectSource;
                            }
                        }
                    }
                    this.dataSMO = res.data.filter((link) => !link.disableLink);
                } else {
                    this.dataSMO = [];
                }
            }
        },
        async getAllControlInDoc(documentId) {
            try {
                let res = await documentApi.getAllControl(documentId);
                if (res.status === 200) {
                    let listControl = {};
                    res.data.map((control) => {
                        listControl[control.id] = control;
                    });
                    return listControl;
                }
            } catch (error) {
                console.error(error);
                return false;
            }
        },
        viewOnlySub(departments, mapDepartments, keyDpm) {
            for (let key in departments) {
                if (keyDpm.includes(departments[key].vizParentId)) {
                    mapDepartments[key] = departments[key];
                }
            }
        },
        viewOther(keys, idOrgchart, mapDepartments, departments, keyDpm) {
            for (let key of keys) {
                if (key != '0') {
                    key = key.split(':');
                    if (key.includes(idOrgchart)) {
                        mapDepartments[key[key.length - 1]] =
                            departments[key[key.length - 1]];
                        keyDpm.push(key[key.length - 1]);
                    }
                }
            }
        },
        getItemfromPath(departments, mapDepartments) {
            let fullPath = [],
                i,
                key;
            for (key in mapDepartments) {
                fullPath = fullPath.concat(mapDepartments[key].path);
            }
            let arr = {},
                newArr = [];
            //check cac path bi trung
            if (fullPath != []) {
                for (i = 0; i < fullPath.length; i++) {
                    if (!newArr.includes(fullPath[i])) {
                        newArr.push(fullPath[i]);
                    }
                }
            }
            // push các item vào arr
            for (i in departments) {
                if (newArr.includes(departments[i].name)) {
                    arr[i] = departments[i];
                }
            }
            return arr;
        },
        closePanel() {
            this.$refs.listUser.actionPanel = false;
        },
        onGridReady(params) {
            this.agApi = params.api;
        },
        handlerDocClick(item) {
            this.activeDocument = item.documentObjectId;
            this.docObjInfo = {
                docObjId: item.documentObjectId,
                docSize: '21cm'
            };
        },
        resizeEnd(params) {
            let value = params.width - this.currentWidthContentCustom;
            if (value < 0) {
                this.widthContentCustom = 0;
                this.$refs.listUser.refreshList();
            } else {
                this.widthContentCustom =
                    $(window).width() - $('.resizable-component').width() - 100;
            }
            this.currentWidthContentCustom = params.width;
        },
        changeTab(val) {
            this.currentTab = val;
        },
        addDynamicValue(row, node) {
            if (node.dynamicAttributes) {
                for (let attr of node.dynamicAttributes) {
                    let colId = this.mapNameToDynamicAttr[attr.name];
                    if (colId) {
                        row[colId] = attr.value;
                    }
                }
            }
            return row;
        },
        addPathForAllNode(mapNode) {
            for (let id in mapNode) {
                let node = mapNode[id];

                if (!node.vizParentId) {
                    node.path = [node.name];
                } else {
                    if (node.path === undefined) {
                        node.path = this.getPathOfNode(node, mapNode);
                    }
                }
            }
        },
        createMapNameToDynamicAttr() {
            let mapNameToDynamicAttr = {};
            let count = 0;

            for (let dpm of this.allDepartments) {
                if (dpm.dynamicAttributes) {
                    for (let attr of dpm.dynamicAttributes) {
                        mapNameToDynamicAttr[attr.name] = 'attr_' + count;
                        count += 1;
                    }
                }
            }

            for (let pos of this.allPositions) {
                if (pos.dynamicAttributes) {
                    for (let attr of pos.dynamicAttributes) {
                        mapNameToDynamicAttr[attr.name] = 'attr_' + count;
                        count += 1;
                    }
                }
            }

            this.mapNameToDynamicAttr = null;
            this.mapNameToDynamicAttr = mapNameToDynamicAttr;
        },
        getPathOfNode(node, mapNode) {
            if (!node) {
                return [];
            }
            if (!node.vizParentId) {
                return [node.name];
            } else {
                if (node.path !== undefined) {
                    return node.path;
                } else {
                    return this.getPathOfNode(
                        mapNode[node.vizParentId],
                        mapNode
                    ).concat([node.name]);
                }
            }
        },
        onModelUpdate() {
            let agEl = $(this.$refs.agTree.$el);
            if (this.perfectScrollInstance) {
                this.perfectScrollInstance.destroy();
            }
            let array = [
                '.ag-body-viewport',
                ' .ag-body-horizontal-scroll-viewport'
            ];
            for (let className of array) {
                let container = agEl.find(className);
                if (container[0]) {
                    let ps = new PerfectScrollbar(container[0]);
                    ps.update();
                    this.perfectScrollInstance = ps;
                }
            }
        },
        onCellDblClick(params) {
            this.showDirection = false;
            let active = params.event.target.parentNode.outerHTML.includes(
                'item-no-permission'
            )
                ? false
                : true;
            if (active) {
                params.data.orgchartId = this.$route.params.id;
                this.$store.commit(
                    'orgchart/emptyListChildrenNode',
                    this.$route.params.id
                );
                this.$store.dispatch('orgchart/updateUserInNode', params.data);
                this.listUserInNode = this.$store.getters[
                    'orgchart/listUserInChildrenNode'
                ](this.$route.params.id);
                this.$store.commit('orgchart/setAllUserInOrgchart', {
                    orgchartId: this.$route.params.id,
                    listUsers: this.listUserInNode
                });
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.orgchart.youHaveNoRightWatchThisList')
                });
            }
        },

        onCellContextMenu(params) {},
        onTabClicked(data) {
            this.currentTab = data.action;
            this.titleToolbar = data.title;
        }
    },
    data() {
        let self = this;
        return {
            showDirection: true,
            dataSMO: [],
            isShowSmartObject: false,
            currentTab: 1,
            showDescriptionDepartment: false,
            agApi: null,
            widthContentCustom: 0,
            currentWidthContentCustom: 400,
            showToolbar: false,
            getContextMenuItems(params) {
                var result = [
                    {
                        // custom item
                        name: self.$t(
                            'actions.listActions.orgchart.view_only_sub'
                        ),
                        action: function () {
                            let objId = 'department:' + params.node.data.code;
                            orgchartApi
                                .getDescriptionNode({
                                    object_identifier: objId
                                })
                                .then((res) => {
                                    if (res.data.length > 0) {
                                        self.listDocuments = res.data;
                                        self.activeDocument =
                                            res.data[0].documentObjectId;
                                        let idDoc =
                                            res.data[0].documentObjectId;
                                        self.docObjInfo = {
                                            docObjId: idDoc,
                                            docSize: '21cm'
                                        };
                                        self.$refs.listUser.actionPanel = true;
                                    } else {
                                        self.$snotify({
                                            type: 'error',
                                            title: this.$t('v2.orgchart.cantFindDescDocument')
                                        });
                                    }
                                })
                                .catch((err) => {});
                        },
                        cssClasses: ['redFont', 'bold']
                    }
                ];
                return result;
            },
            currentSize: {},
            customAgComponents: {
                nodeName: NodeNameInTable,
                UserInNodeView: UserInNodeView
            },
            listTitle: [
                'relatedInfo',
                'tabularOrganizationChart',
                'flowchartOrganizationChart'
            ],
            columnTree: {
                headerName: this.$t('common.code'),
                field: 'code',
                width: 300,
                colId: 'code'
            },
            showNavigation: false,
            listUserInNode: [],
            docObjInfo: {},
            apiUrl: '',
            listDocuments: [],
            mapNameToDynamicAttr: null,
            titleToolbar: 'tabularOrganizationChart',
            mapDpmToPos: null,
            menuPickTab: [
                {
                    icon: 'mdi-book-open-variant',
                    title: this.$t('v2.orgchart.relatedInfo'),
                    action: 'smoView'
                },
                {
                    icon: 'mdi-share-variant',
                    title: this.$t('v2.orgchart.flowchartOrganizationChart'),
                    action: 'diagramView'
                }
            ],
            customAPIResult: {
                reformatData(res) {
                    return {
                        columns: [
                        { name: 'id', title: this.$t('v2.orgchart.id'), type: 'numeric' },
                            {
                                name: 'firstName',
                                title: this.$t('v2.orgchart.firstName'),
                                type: 'text'
                            },
                            {
                                name: 'displayName',
                                title: this.$t('v2.orgchart.displayName'),
                                type: 'text'
                            },
                            { name: 'email', title: this.$t('v2.orgchart.email'), type: 'text' },
                            { name: 'phone', title: this.$t('v2.orgchart.phone'), type: 'text' },
                            {
                                name: 'createAt',
                                title: this.$t('v2.orgchart.createAt'),
                                type: 'text'
                            },
                            {
                                name: 'updateAt',
                                title: this.$t('v2.orgchart.updateAt'),
                                type: 'text'
                            }
                        ],
                        listObject: res.data.listObject,
                        total: res.data.listObject.length
                    };
                }
            },
            containerHeight: null,
            activeDocument: '',
            tableContextMenu: {
                viewDetails: {
                    name: this.$t('v2.orgchart.viewDetails'),
                    text: self.$t('actions.listActions.orgchart.view_only_sub'),
                    callback: (user, callback) => {
                        let data = {
                            object_identifier: 'account:' + user.id
                        };
                        let self = this;
                        orgchartApi
                            .getDocumentByUserId(data)
                            .then((res) => {
                                if (res.data.length > 0) {
                                    self.listDocuments = res.data;
                                    self.activeDocument =
                                        res.data[0].documentObjectId;
                                    let idDoc = res.data[0].documentObjectId;
                                    self.docObjInfo = {
                                        docObjId: idDoc,
                                        docSize: '21cm'
                                    };
                                    self.$refs.listUser.actionPanel = true;
                                } else {
                                    self.$snotify({
                                        type: 'error',
                                        title: this.$t('v2.orgchart.noPersonnelRecordsFound')
                                    });
                                }
                            })
                            .catch((err) => {});
                    }
                }
            }
        };
    },
    watch: {
        allUserInOrgchart: {
            deep: true,
            immediate: true,
            handler: function (after) {
                if (typeof after !== 'undefined') {
                    if (after.length == 0) {
                        after = [null];
                    }
                    this.apiUrl =
                        appConfigs.apiDomain.account +
                        'users?limitIds=[' +
                        after +
                        ']';
                }
            }
        }
        // currentTab(val) {
        //     debugger;
        //     this.titleToolbar = this.listTitle[val];
        //     if (val == 0) {
        //         this.showToolbar = true;
        //         if (this.agApi) {
        //             this.agApi.sizeColumnsToFit();
        //         }
        //     } else {
        //         this.showToolbar = false;
        //     }
        // },
    }
};
</script>

<style scoped>
.description-department {
    position: fixed;
    z-index: 10000;
    width: 200px;
    height: 200px;
    font: 13px roboto;
    background-color: #fff;
    -webkit-box-shadow: 2px 0px 24px 0px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 2px 0px 24px 0px rgba(0, 0, 0, 0.75);
    box-shadow: 2px 0px 24px 0px rgba(0, 0, 0, 0.75);
}
.symper-orgchart-table-view .ag-group-child-count {
    position: absolute;
    right: 5px;
}
.symper-orgchart-table-side-by-side-view
    >>> .tree-orgchart
    .ag-root-wrapper
    .ag-center-cols-clipper {
    margin-left: -20px !important;
}

.symper-orgchart-table-side-by-side-view >>> .v-alert__content {
    font-size: 14px !important;
}

.symper-orgchart-table-side-by-side-view >>> .v-icon {
    font-size: 25px !important;
}
.symper-orgchart-table-side-by-side-view {
    display: flex;
}
.symper-orgchart-table-view >>> .ag-header-container,
.symper-orgchart-table-side-by-side-view >>> .ag-header-container {
    background-color: #f4f4f4;
}
.symper-orgchart-table-view >>> .ag-root-wrapper,
.symper-orgchart-table-side-by-side-view >>> .ag-root-wrapper {
    border: none !important;
}
.symper-orgchart-table-view >>> .ag-row,
.symper-orgchart-table-side-by-side-view >>> .ag-row {
    border-top-style: unset !important;
    border-bottom-style: unset !important;
}
.orgchart-table-view >>> .v-toolbar {
    height: 45px !important;
    border-bottom: 1px solid lightgray;
}
.orgchart-table-view >>> .row.pb-2 {
    margin-top: -12px;
}
.orgchart-table-view >>> .v-toolbar .v-toolbar__title {
    font-size: 17px !important;
    font-weight: 500;
}
.orgchart-table-view >>> .v-toolbar .v-toolbar__content {
    height: unset !important;
    padding-top: 6px;
}
.orgchart-table-view >>> .list-document-description {
    cursor: pointer;
    padding: 6px 12px;
}
.orgchart-table-view >>> .active-item {
    background-color: #f7f7f7;
    border-radius: 5px;
}
.orgchart-table-view >>> .v-menu__content .v-list-item .v-list-item__icon {
    min-width: unset;
    width: 15px;
    margin-right: 20px !important;
}

.orgchart-table-view >>> .smart-object-list-container {
    width: 100% !important;
    height: 100% !important;
    position: unset !important;
}
.orgchart-table-view >>> .item-smart-obj.v-navigation-drawer {
    top: 0 !important;
}
.orgchart-table-view >>> .item-smart-obj.v-navigation-drawer {
    top: 0 !important;
}
.orgchart-table-view >>> .ag-group-expanded,
.orgchart-table-view >>> .ag-group-contracted {
    margin-right: unset !important;
}
.orgchart-table-view >>> .ag-group-expanded,
.orgchart-table-view >>> .ag-group-contracted {
    padding-left: 12px !important;
}
.orgchart-table-view >>> .smart-object-list-container .symper-list-items {
    margin-top: -7px !important;
}
</style>

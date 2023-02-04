<template>
    <div
        :class="{
            'd-flex w-100 h-100': true,
            'diagram-hortical': typeView == 'B',
            'diagram-vertical': typeView == 'R'
        }"
        ref="orgchartContainer"
    >
        <div class="h-100 flex-grow-1" ref="viewOrgchartCanvas">
            <div class="border-bottom-1 pt-1 pl-2 w-100 d-flex">
                <div
                    style="margin-right: 8px; margin-top: 4px"
                    v-if="showMenuPickTab"
                >
                    <span style="font: 17px roboto; font-weight: 500">{{
                        $t('orgchart.flowchartOrganizationChart')
                    }}</span>
                    <v-menu
                        :max-width="500"
                        :max-height="700"
                        :nudge-width="200"
                        offset-y
                    >
                        <template v-slot:activator="{ on }" class="float-right">
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
                                        <v-icon v-text="item.icon"></v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content>
                                        <v-list-item-title
                                            v-text="
                                                $t('orgchart.' + item.title)
                                            "
                                        ></v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>
                        </v-list>
                    </v-menu>
                </div>
                <v-tooltip
                    bottom
                    v-for="(item, key) in headerActions"
                    :key="key"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn
                            @click="handleHeaderAction(key)"
                            icon
                            tile
                            class="mr-2"
                            style="position: relative; top: -3px"
                        >
                            <v-icon size="21" v-on="on">{{ item.icon }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ item.text }}</span>
                </v-tooltip>
                <v-tooltip bottom v-if="checkPageEmpty == true">
                    <template v-slot:activator="{ on }">
                        <v-btn
                            @click="addNode"
                            icon
                            class="mr-2"
                            style="position: relative; top: -3px"
                        >
                            <v-icon size="21" v-on="on">mdi-plus-thick</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('v2.orgchart.addNewNode') }} </span>
                </v-tooltip>
                <div style="flex-grow: 1">
                    <v-btn
                        v-if="action != 'view' && context == 'department'"
                        class="float-right mr-1"
                        style=""
                        @click="saveOrgchart"
                        small
                        depressed
                        color="primary"
                    >
                        <v-icon class="mr-2" primary>mdi-content-save</v-icon>
                        {{ $t('common.save') }}
                    </v-btn>
                </div>
            </div>
            <Preloader v-if="loadingDiagramView" />
            <EditorWorkspace
                :class="{
                    'w-100': true,
                    'symper-orgchart-view':
                        action == 'view' || action == 'structureManagement',
                    'symper-orgchart-active-editor':
                        action != 'view' && action != 'structureManagement'
                }"
                style="height: calc(100% - 41px)"
                @new-viz-cell-added="handleNewNodeAdded"
                @blank-paper-clicked="handleBlankPaperClicked"
                @cell-contextmenu="showPositionEditor"
                @cell-clicked="selectNode"
                @delete-node="handlerDeleteNode"
                :instanceKey="instanceKey"
                :readonly="
                    action == 'view' || action == 'structureManagement'
                        ? true
                        : false
                "
                :context="context"
                ref="editorWorkspace"
                :id="id"
            />
        </div>
        <div
            :style="{
                width: '250px'
            }"
            class="h-100 border-left-1"
            v-if="!isViewSbs"
        >
            <ConfigPanel
                @update-dynamic-attr-display="updateDynamicAttrNodeDisplay"
                @config-value-input="handleConfigValueChange"
                @change-user-select="handleConfigUserSelectChange"
                @apply-style-for-node="handleStyleChange"
                :instanceKey="instanceKey"
                :action="action"
                :context="context"
            >
            </ConfigPanel>
        </div>

        <v-navigation-drawer
            v-if="context == 'department'"
            right
            v-model="positionEditor"
            absolute
            temporary
            :style="{
                width: '1000px'
            }"
        >
            <OrgchartEditor
                @update-department-name="changeDepartmentName"
                ref="positionDiagram"
                @update-father-node="handleConfigUserSelectChange"
                :action="action"
                :id="id"
                :instanceKey="
                    selectingNode.positionDiagramCells
                        ? selectingNode.positionDiagramCells.instanceKey
                        : ''
                "
                context="position"
            >
            </OrgchartEditor>
        </v-navigation-drawer>
    </div>
</template>

<script>
import ConfigPanel from './ConfigPanel.vue';
import EditorWorkspace from './EditorWorkspace.vue';
import NodeSelector from './NodeSelector.vue';
import VueResizable from 'vue-resizable';
import {
    getOrgchartEditorData,
    getDefaultConfigNodeData,
    SYMPER_HOME_ORGCHART,
    getNodeStyleConfig,
    getMapDpmIdToPosition
} from './nodeAttrFactory';
import { orgchartApi } from '@/api/orgchart.js';
import _debounce from 'lodash/debounce';
import {
    FOUCUS_DEPARTMENT_DISPLAY,
    DEFAULT_DEPARTMENT_DISPLAY,
    departmentMarkup
} from '../nodeDefinition/departmentDefinition';
import { permissionApi } from '../../../api/permissionPack';
import { documentApi } from '@/api/Document.js';
import Preloader from '@/components/common/Preloader.vue';
import { appConfigs } from '@/configs.js';
export default {
    name: 'OrgchartEditor',
    computed: {
        selectingNode() {
            let filterValue = [];
            if (
                this.$store.state.orgchart.editor[this.instanceKey]
                    .selectingNode?.users
            ) {
                if (
                    this.$store.state.orgchart.editor[this.instanceKey]
                        .selectingNode.users.length > 0
                ) {
                    this.$store.state.orgchart.editor[
                        this.instanceKey
                    ].selectingNode.users.forEach((id) => {
                        this.$store.state.app.allUsers.forEach((user) => {
                            if (user.id == id) {
                                filterValue.push(id);
                            }
                        });
                    });
                    this.$store.state.orgchart.editor[
                        this.instanceKey
                    ].selectingNode.users = filterValue;
                }
            }
            return this.$store.state.orgchart.editor[this.instanceKey]
                .selectingNode;
        },
        listDocument() {
            let listDoc = Object.values(
                this.$store.state.document.listAllDocument
            );
            listDoc = listDoc.reduce((arr, obj) => {
                let newObj = { id: obj.id, name: obj.name, title: obj.title };
                arr.push(newObj);
                return arr;
            }, []);
            return listDoc;
        }
    },
    components: {
        ConfigPanel,
        EditorWorkspace,
        NodeSelector,
        VueResizable,
        Preloader
    },
    props: {
        action: {
            type: String,
            default: 'create' // clone, edit, view
        },
        context: {
            type: String,
            default: 'department' // department hoặc position
        },
        instanceKey: {
            default: Date.now()
        },
        id: {
            default: ''
        },
        currentTab: {
            type: Number,
            default: 1
        },
        showMenuPickTab: {
            type: Boolean,
            default: false
        },
        isViewSbs: {
            default: false
        },
        idDepartmentHighLight: {
            default: ''
        }
    },
    data() {
        return {
            countUserClass: 0,
            loadingDiagramView: true,
            typeView: 'B',
            positionEditor: false,
            selectedDoc: null,
            listFieldInSelectedDoc: [],
            checkPageEmpty: false,
            menuPickTab: [
                {
                    icon: 'mdi-book-open-variant',
                    title: 'relatedInfo',
                    action: 'smoView'
                },
                {
                    icon: 'mdi-share-variant',
                    title: this.$t('v2.orgchart.flowchartOrganizationChart'),
                    action: 'diagramView'
                }
            ],
            listUserIds: null,
            headerActions: {
                zoomIn: {
                    icon: 'mdi-plus-circle-outline',
                    text: this.$t('process.header_bar.zoom_out')
                },
                zoomOut: {
                    icon: 'mdi-minus-circle-outline',
                    text: this.$t('process.header_bar.zoom_in')
                },
                zoomToFit: {
                    icon: 'mdi-image-filter-center-focus',
                    text: this.$t('process.header_bar.focus')
                },
                saveSVG: {
                    icon: 'mdi-download-circle-outline',
                    text: this.$t('process.header_bar.save_svg')
                },
                validate: {
                    icon: 'mdi-clipboard-check-outline',
                    text: this.$t('process.header_bar.validate')
                },
                changeTypeView: {
                    icon: 'mdi-align-vertical-center',
                    text: this.$t('v2.orgchart.changeTypeView')
                }
            },
            detailData: {},
            viewWidth: null
        };
    },
    created() {
        this.initOrgchartData();
        documentApi.getListDocument().then((res) => {
            if (res.status == 200) {
                let homeConfig =
                    this.$store.state.orgchart.editor[this.instanceKey]
                        .homeConfig;
                homeConfig.commonAttrs.mappingDoc.options = res.data.listObject;
            }
        });
        if (this.action != 'create') {
            this.restoreOrgchartView(this.id);
        } else {
            setTimeout(
                (self) => {
                    self.loadingDiagramView = false;
                },
                1500,
                this
            );
        }
        if (this.action == 'edit') {
            this.$store.dispatch('orgchart/getAllStyleNode');
        }
    },
    mounted() {
        new ResizeObserver((val) => {
            this.reCalcCanvasWidth();
            this.$refs.editorWorkspace.resetWrapper();
        }).observe(this.$refs.orgchartContainer, {
            attributes: true,
            attributeFilter: ['width']
        });
    },
    activated() {
        this.centerDiagram();
    },
    watch: {
        positionEditor(after) {
            if (after === false) {
                this.storeDepartmentPositionCells();
            }
        },
        currentTab(val) {
            if (val == 0) {
                this.$emit('current-tab', val);
            }
        },
        selectedDoc(val) {
            if (val) {
                this.getFieldsInDoc(val);
            }
        },
        idDepartmentHighLight(val) {
            if (val) {
                this.removeClassHighLight();
                this.addClassHighLight([val]);
            }
        }
    },
    methods: {
        reCalcCanvasWidth() {
            $(this.$refs.viewOrgchartCanvas).css(
                'width',
                $(this.$refs.orgchartContainer).width() - 250 + 'px'
            );
        },
        addClassHighLight(arr) {
            this.$refs.editorWorkspace.addClassHighLight(arr);
        },
        removeClassHighLight() {
            this.$refs.editorWorkspace.removeClassHighLight();
        },
        handlerDeleteNode() {
            let array = this.$refs.editorWorkspace.getAllNode();
            if (array.length == 0) {
                this.checkPageEmpty = true;
            }
        },
        handleStyleChange(info) {
            this.changeNodeBottomColor(
                info.data.highlight.value,
                info.type == 'child'
            );
        },
        getAllLink() {
            return this.$refs.editorWorkspace.getAllLink();
        },
        getAllNode() {
            return this.$refs.editorWorkspace.getAllNode();
        },
        addNode() {
            let self=this
            this.checkPageEmpty = false;
            this.$refs.editorWorkspace.createFirstVizNode();
            self.centerDiagram();
            self.$refs.editorWorkspace.scrollPaperToTop(
                            200
                        );;
        },
        changeNodeBottomColor(color, applyForChild = false) {
            let affectedNodeIds = [];
            let workspace = this.$refs.editorWorkspace;
            let currentNodeId = this.selectingNode.id;

            if (!applyForChild) {
                affectedNodeIds = [currentNodeId];
            } else {
                if (currentNodeId == SYMPER_HOME_ORGCHART) {
                    affectedNodeIds = workspace
                        .getAllNode()
                        .reduce((arr, el) => {
                            arr.push(el.id);
                            return arr;
                        }, []);
                } else {
                    affectedNodeIds =
                        workspace.getAllChildIdOfNode(currentNodeId);
                }
            }

            for (let id of affectedNodeIds) {
                workspace.updateCellAttrs(id, 'highlight', color);
                this.$store.state.orgchart.editor[this.instanceKey].allNode[
                    id
                ].style.highlight.value = color;
            }
        },
        updateDynamicAttrNodeDisplay() {
            let atts = this.selectingNode.customAttributes;
            if (this.context == 'position') {
                let lastAttr = atts[atts.length - 1];
                let content = lastAttr.name + ' : ' + lastAttr.value;
                this.$refs.editorWorkspace.updateCellAttrs(
                    this.selectingNode.id,
                    'lastDynamicAttr',
                    content
                );
            }
        },
        handleConfigUserSelectChange(listUserIds) {
            let self = this;
            this.$refs.editorWorkspace.changeUserDisplayInNode(listUserIds);
            if (this.context == 'department') {
                this.changeManagerForDepartment(
                    this.selectingNode.id,
                    listUserIds
                );
                let allNodes = this.$refs.positionDiagram.getAllNode();
                let firstNode = allNodes[0];
                if (allNodes[0].id.includes('Symper_Department_Host')) {
                    firstNode = allNodes[1];
                }
                let instanceKey =
                    this.selectingNode.positionDiagramCells.instanceKey;
                this.$store.commit('orgchart/changeSelectingNode', {
                    instanceKey: instanceKey,
                    nodeId: firstNode.id
                });
                this.listUserIds = listUserIds;
            } else {
                if (
                    this.$store.state.orgchart.firstChildNodeId ==
                    this.$store.state.orgchart.currentChildrenNodeId
                ) {
                    this.$store.commit(
                        'orgchart/updateUserFatherNode',
                        listUserIds
                    );
                    this.$emit('update-father-node', listUserIds);
                }
            }
        },
        // Kiểm tra xem department hiện tại đã có node Manager hay chưa
        changeManagerForDepartment(departmentVizId, userIds) {
            this.checkAndCreateOrgchartData();
            if (!this.selectingNode.positionDiagramCells.cells) {
                let data = this.$refs.positionDiagram.createFirstVizNode();
                this.$store.commit('orgchart/updateFirstChildNodeId', data.id);
                this.storeDepartmentPositionCells();
            }
            let currentInstanceKey = this.$store.state.orgchart.instanceKey;
            let id = this.$store.state.orgchart.firstChildNodeId;
            this.$store.commit('orgchart/updateUserChildNode', {
                currentInstanceKey: currentInstanceKey,
                id: id,
                users: userIds
            });
        },
        restoreMainOrgchartConfig(config) {
            let mappingDocInfo = JSON.parse(config.mappingDocInfo);
            let homeConfig =
                this.$store.state.orgchart.editor[this.instanceKey].homeConfig;
            homeConfig.commonAttrs.name.value = config.name;
            homeConfig.commonAttrs.description.value = config.description;
            homeConfig.commonAttrs.code.value = config.code;
            homeConfig.commonAttrs.isDefault.value =
                config.isDefault == '1' ? true : false;
            homeConfig.commonAttrs.mappingDoc.value = mappingDocInfo
                ? mappingDocInfo.docId
                : '';
            homeConfig.commonAttrs.scriptMapping.value = mappingDocInfo
                ? mappingDocInfo.script
                : '';
            homeConfig.commonAttrs.tableMapping.value = mappingDocInfo
                ? mappingDocInfo.fieldMapping
                : [{}];
            homeConfig.customAttributes = config.dynamicAttributes;
        },
        correctDiagramDisplay(content) {
            if (typeof content != 'object') {
                content = JSON.parse(content);
            }
            for (let node of content.cells) {
                if (node.type == 'Symper.Department') {
                    node.markup = departmentMarkup;
                }
            }
            return content;
        },
        getRightImgUrl(string) {
            string = string.replaceAll(
                /https:\/\/.*?user_avatar_/g,
                appConfigs.apiDomain.fileManagement + 'user-avatar?userId='
            );
            string = string.replaceAll(
                /https:\/\/.*?user-avatar?userId=/g,
                appConfigs.apiDomain.fileManagement + 'user-avatar?userId='
            );
            return string;
        },

        createDepartmentNodeAndLine(
            fistNode = null,
            fistLine = null,
            departmentChild = 0,
            node,
            nodeData
        ) {
            let departmentNode;
            let departmentLine;
            if (fistLine) {
                departmentLine = {
                    attrs: fistLine.attrs,
                    source: {
                        id: node.vizId + 'Symper_Department_Host',
                        selector: '.card'
                    },
                    name: false,
                    target: {
                        id: fistNode.id,
                        selector: '.card'
                    },
                    type: 'org.Arrow',
                    vertices: fistLine.vertices,
                    z: '-1'
                };
            } else {
                departmentLine = {
                    attrs: {
                        '.connection': { 'stroke-width': 1 },
                        '.marker-arrowheads': {
                            display: 'none'
                        },
                        label: { text: 'Hello' }
                    },
                    source: {
                        id: node.vizId + 'Symper_Department_Host',
                        selector: '.card'
                    },
                    name: false,
                    target: {
                        id: fistNode.id,
                        selector: '.card'
                    },
                    type: 'org.Arrow',
                    vertices: [
                        { x: 105, y: 90 },
                        { x: 105, y: 90 }
                    ],
                    z: '-1'
                };
            }
            departmentNode = {
                angle: 0,
                id: node.vizId + 'Symper_Department_Host',
                name: 'Vị trí 0',
                position: {
                    x: fistNode.position.x,
                    y: fistNode.position.y - 150
                },
                size: {
                    width: 250,
                    height: 46
                },
                type: fistNode.type,
                attrs: {
                    '.departmentName': { text: nodeData.name },
                    '.departmentText': {
                        text: departmentChild
                    },
                    '.position-code':
                        fistNode.attrs['.position-code'] +
                        'Symper_Department_Host'
                },
                markup: '<g class="rotatable "> <g class="symper-orgchart-node"> <g class="scalable"> <rect class="card"/> </g> <text class="departmentName"/><g class="department"><rect class=" department-child"/><text class="departmentText department-child "/></g><g class="btn-collapse-expand-hor"> <circle class="buttonSign"/> <text class="buttonSign"></text> </g> <g class="btn-collapse-expand-ver"> <circle class="buttonSign"/> <text class="buttonSign"></text> </g>  </g></g> '
            };
            return [departmentNode, departmentLine];
        },
        async restoreOrgchartView(id) {
            let self = this;
            if (!id) {
                return;
            }
            try {
                let res = await orgchartApi.getOrgchartDetail(id);
                if (res.status == 200) {
                    this.$store.commit('orgchart/setDataOrgchartSideBySide', {
                        orgchartId: res.data.orgchart.id,
                        object: res.data
                    });
                    this.$refs.editorWorkspace.createFirstVizNode();
                    let savedData = res.data;
                    let departments = this.correctDiagramDisplay(
                        savedData.orgchart.content
                    );
                    let departmentsKey = Object.keys(departments.cells);
                    departmentsKey.forEach((key) => {
                        let thisDepartments = departments.cells[key];
                        self.detailData[thisDepartments.id] = thisDepartments;
                        if (thisDepartments.type == 'Symper.Department') {
                            if (thisDepartments.attrs.image) {
                                thisDepartments.attrs.image['xlink:href'] =
                                    self.getRightImgUrl(
                                        thisDepartments.attrs.image[
                                            'xlink:href'
                                        ]
                                    );
                            }
                        } else {
                            thisDepartments.attrs['.connection'] = {
                                stroke: '#B5B5B5',
                                'stroke-width': 1
                            };
                            thisDepartments.z = '-1';
                        }
                    });
                    this.$refs.editorWorkspace.loadDiagramFromJson(
                        departments,
                        savedData.positions
                    );
                    this.centerDiagram();
                    if (this.action == 'clone') {
                        savedData.orgchart.code = '';
                        savedData.orgchart.name = '';
                    }
                    this.restoreMainOrgchartConfig(savedData.orgchart);
                    let mapIdToDpm = {};
                    for (let node of savedData.departments) {
                        let users = self.getListUserAsArr(node.users);
                        let nodeData = {
                            id: node.vizId,
                            name: node.name,
                            description: node.description,
                            code: node.code,
                            users: users,
                            dataFromDoc: {
                                users: JSON.parse(node.usersFromDoc)
                            }
                        };
                        node.content = self.getRightImgUrl(node.content);
                        if (node.content && node.content !== 'false') {
                            nodeData.positionDiagram = {
                                cells: JSON.parse(node.content)
                            };
                        }
                        let keyNode;
                        if (nodeData.positionDiagram) {
                        } else {
                            keyNode = [];
                        }
                        let dataNodeToRender = {};
                        let DepartmentNodeData;
                        if (nodeData.positionDiagram) {
                            if (
                                nodeData.positionDiagram.cells.cells.length > 0
                            ) {
                                let fistNode = null;
                                let fistLine = null;
                                let departmentChild = 0;
                                let arrNoDepartment = [];
                                nodeData.positionDiagram.cells.cells.forEach(
                                    (cell) => {
                                        if (
                                            cell.type == 'org.Arrow' &&
                                            fistLine == null &&
                                            !cell?.source?.id?.includes(
                                                'Symper_Department_Host'
                                            )
                                        ) {
                                            fistLine = cell;
                                        }
                                        if (
                                            cell.type == 'Symper.Position' &&
                                            fistNode == null &&
                                            !cell?.id?.includes(
                                                'Symper_Department_Host'
                                            )
                                        ) {
                                            fistNode = cell;
                                        }
                                        if (
                                            !cell.attrs['.departmentName'] &&
                                            cell.type == 'Symper.Position'
                                        ) {
                                            arrNoDepartment.push(cell);
                                        } else if (cell.type == 'org.Arrow') {
                                            if (
                                                !cell?.source?.id?.includes(
                                                    'Symper_Department_Host'
                                                )
                                            ) {
                                                arrNoDepartment.push(cell);
                                            }
                                        }
                                    }
                                );
                                nodeData.positionDiagram.cells.cells =
                                    arrNoDepartment;
                                nodeData.positionDiagram.cells.cells.forEach(
                                    (cell) => {
                                        if (cell.type == 'Symper.Position') {
                                            ++departmentChild;
                                        }
                                    }
                                );

                                DepartmentNodeData =
                                    self.createDepartmentNodeAndLine(
                                        fistNode,
                                        fistLine,
                                        departmentChild,
                                        node,
                                        nodeData
                                    );
                            }
                            if (nodeData.positionDiagram) {
                                keyNode = Object.keys(
                                    nodeData.positionDiagram.cells.cells
                                );
                            } else {
                                keyNode = [];
                            }

                            keyNode.forEach((key) => {
                                if (
                                    nodeData.positionDiagram.cells.cells[key]
                                        .type == 'Symper.Position' &&
                                    !nodeData.positionDiagram.cells.cells[
                                        key
                                    ].id.includes('Symper_Department_Host')
                                ) {
                                    nodeData.positionDiagram.cells.cells[
                                        key
                                    ].attrs['.card'] = {};

                                    nodeData.positionDiagram.cells.cells[
                                        key
                                    ].size = {
                                        height: 100,
                                        width: self.detailData[nodeData.id]
                                            ? self.detailData[nodeData.id].size
                                                  .width
                                            : 250
                                    };

                                    if (
                                        nodeData.positionDiagram.cells.cells[
                                            key
                                        ].attrs.image
                                    ) {
                                        nodeData.positionDiagram.cells.cells[
                                            key
                                        ].attrs['.role-img-center'] =
                                            nodeData.positionDiagram.cells.cells[
                                                key
                                            ].attrs.image;

                                        nodeData.positionDiagram.cells.cells[
                                            key
                                        ].attrs.image = {};
                                    }

                                    nodeData.positionDiagram.cells.cells[
                                        key
                                    ].markup =
                                        '<g class="rotatable "> <g class="symper-orgchart-node">  <g class="scalable"> <rect class="card"/> </g> <g class="role-img-container"><image class="role-img-center" /><image class="img-background-center" /></g> <text class="name"/>  <text class="position-code"/>  <g class="btn-container"><rect class="btn-container-background"/><rect class="btn-container-transparent-back"/></g><g class="btn-collapse-expand-hor"> <circle class="buttonSign"/> <text class="buttonSign"></text> </g> <g class="btn-collapse-expand-ver"> <circle class="buttonSign"/> <text class="buttonSign"></text> </g> <g class="btn add orgchart-action"><rect class="add transparent-background" /><path class="line-action" d="M9.375 4.97168H5.625V1.22168C5.625 1.05592 5.55915 0.896948 5.44194 0.779738C5.32473 0.662528 5.16576 0.59668 5 0.59668C4.83424 0.59668 4.67527 0.662528 4.55806 0.779738C4.44085 0.896948 4.375 1.05592 4.375 1.22168V4.97168H0.625C0.45924 4.97168 0.300269 5.03753 0.183058 5.15474C0.0658481 5.27195 0 5.43092 0 5.59668C0 5.76244 0.0658481 5.92141 0.183058 6.03862C0.300269 6.15583 0.45924 6.22168 0.625 6.22168H4.375V9.97168C4.375 10.1374 4.44085 10.2964 4.55806 10.4136C4.67527 10.5308 4.83424 10.5967 5 10.5967C5.16576 10.5967 5.32473 10.5308 5.44194 10.4136C5.55915 10.2964 5.625 10.1374 5.625 9.97168V6.22168H9.375C9.54076 6.22168 9.69973 6.15583 9.81694 6.03862C9.93415 5.92141 10 5.76244 10 5.59668C10 5.43092 9.93415 5.27195 9.81694 5.15474C9.69973 5.03753 9.54076 4.97168 9.375 4.97168Z" fill="#61C454"/></g><g class="btn remove orgchart-action"><rect class="remove transparent-background-position" /><path  class="line-action" d="M4.93909 4.59554L7.80299 1.7383C7.92841 1.61289 7.99886 1.44279 7.99886 1.26543C7.99886 1.08806 7.92841 0.917966 7.80299 0.792552C7.67758 0.667137 7.50748 0.59668 7.33012 0.59668C7.15275 0.59668 6.98265 0.667137 6.85724 0.792552L4 3.65645L1.14276 0.792552C1.01735 0.667137 0.847248 0.59668 0.669885 0.59668C0.492522 0.59668 0.322423 0.667137 0.197008 0.792552C0.0715939 0.917966 0.00113664 1.08806 0.00113664 1.26543C0.00113663 1.44279 0.0715939 1.61289 0.197008 1.7383L3.06091 4.59554L0.197008 7.45278C0.134583 7.5147 0.085035 7.58836 0.0512219 7.66952C0.0174088 7.75068 0 7.83773 0 7.92566C0 8.01358 0.0174088 8.10063 0.0512219 8.18179C0.085035 8.26296 0.134583 8.33662 0.197008 8.39853C0.258924 8.46096 0.332587 8.51051 0.413748 8.54432C0.494909 8.57813 0.581962 8.59554 0.669885 8.59554C0.757808 8.59554 0.844861 8.57813 0.926022 8.54432C1.00718 8.51051 1.08085 8.46096 1.14276 8.39853L4 5.53464L6.85724 8.39853C6.91915 8.46096 6.99282 8.51051 7.07398 8.54432C7.15514 8.57813 7.24219 8.59554 7.33012 8.59554C7.41804 8.59554 7.50509 8.57813 7.58625 8.54432C7.66741 8.51051 7.74108 8.46096 7.80299 8.39853C7.86542 8.33662 7.91497 8.26296 7.94878 8.18179C7.98259 8.10063 8 8.01358 8 7.92566C8 7.83773 7.98259 7.75068 7.94878 7.66952C7.91497 7.58836 7.86542 7.5147 7.80299 7.45278L4.93909 4.59554Z" fill="#FF2020"/></g></g> </g>';
                                }
                            });
                            keyNode.forEach((key) => {
                                let thisNodeData =
                                    nodeData.positionDiagram.cells.cells[key];
                                if (
                                    nodeData.positionDiagram.cells.cells[key]
                                        .type == 'Symper.Position' &&
                                    thisNodeData.attrs['.position-code'] &&
                                    !thisNodeData.attrs['.departmentName']
                                ) {
                                    if (
                                        dataNodeToRender[
                                            thisNodeData.attrs[
                                                '.position-code'
                                            ].text.replace('Mã : ', '')
                                        ]
                                    ) {
                                        if (
                                            dataNodeToRender[
                                                thisNodeData.attrs[
                                                    '.position-code'
                                                ].text.replace('Mã : ', '')
                                            ].attrs['.img-background-left']
                                        ) {
                                            dataNodeToRender[
                                                thisNodeData.attrs[
                                                    '.position-code'
                                                ].text.replace('Mã : ', '')
                                            ].attrs['.img-background-left'] =
                                                thisNodeData.attrs.image;
                                            dataNodeToRender[
                                                thisNodeData.attrs[
                                                    '.position-code'
                                                ].text.replace('Mã : ', '')
                                            ].markup =
                                                '<g class="rotatable "> <g class="symper-orgchart-node">  <g class="scalable"> <rect class="card"/> </g> <g class="role-img-container"><image class="role-img-center" /><image class="img-background-center" /><image class="img-background-left" /><image class="role-img-left" /></g> <text class="name"/>  <text class="position-code"/>  <g class="btn-container"><rect class="btn-container-background"/><rect class="btn-container-transparent-back"/></g><g class="btn-collapse-expand-hor"> <circle class="buttonSign"/> <text class="buttonSign"></text> </g> <g class="btn-collapse-expand-ver"> <circle class="buttonSign"/> <text class="buttonSign"></text> </g> <g class="btn add orgchart-action"><rect class="add transparent-background" /><path class="line-action" d="M9.375 4.97168H5.625V1.22168C5.625 1.05592 5.55915 0.896948 5.44194 0.779738C5.32473 0.662528 5.16576 0.59668 5 0.59668C4.83424 0.59668 4.67527 0.662528 4.55806 0.779738C4.44085 0.896948 4.375 1.05592 4.375 1.22168V4.97168H0.625C0.45924 4.97168 0.300269 5.03753 0.183058 5.15474C0.0658481 5.27195 0 5.43092 0 5.59668C0 5.76244 0.0658481 5.92141 0.183058 6.03862C0.300269 6.15583 0.45924 6.22168 0.625 6.22168H4.375V9.97168C4.375 10.1374 4.44085 10.2964 4.55806 10.4136C4.67527 10.5308 4.83424 10.5967 5 10.5967C5.16576 10.5967 5.32473 10.5308 5.44194 10.4136C5.55915 10.2964 5.625 10.1374 5.625 9.97168V6.22168H9.375C9.54076 6.22168 9.69973 6.15583 9.81694 6.03862C9.93415 5.92141 10 5.76244 10 5.59668C10 5.43092 9.93415 5.27195 9.81694 5.15474C9.69973 5.03753 9.54076 4.97168 9.375 4.97168Z" fill="#61C454"/></g><g class="btn remove orgchart-action"><rect class="remove transparent-background-position" /><path  class="line-action" d="M4.93909 4.59554L7.80299 1.7383C7.92841 1.61289 7.99886 1.44279 7.99886 1.26543C7.99886 1.08806 7.92841 0.917966 7.80299 0.792552C7.67758 0.667137 7.50748 0.59668 7.33012 0.59668C7.15275 0.59668 6.98265 0.667137 6.85724 0.792552L4 3.65645L1.14276 0.792552C1.01735 0.667137 0.847248 0.59668 0.669885 0.59668C0.492522 0.59668 0.322423 0.667137 0.197008 0.792552C0.0715939 0.917966 0.00113664 1.08806 0.00113664 1.26543C0.00113663 1.44279 0.0715939 1.61289 0.197008 1.7383L3.06091 4.59554L0.197008 7.45278C0.134583 7.5147 0.085035 7.58836 0.0512219 7.66952C0.0174088 7.75068 0 7.83773 0 7.92566C0 8.01358 0.0174088 8.10063 0.0512219 8.18179C0.085035 8.26296 0.134583 8.33662 0.197008 8.39853C0.258924 8.46096 0.332587 8.51051 0.413748 8.54432C0.494909 8.57813 0.581962 8.59554 0.669885 8.59554C0.757808 8.59554 0.844861 8.57813 0.926022 8.54432C1.00718 8.51051 1.08085 8.46096 1.14276 8.39853L4 5.53464L6.85724 8.39853C6.91915 8.46096 6.99282 8.51051 7.07398 8.54432C7.15514 8.57813 7.24219 8.59554 7.33012 8.59554C7.41804 8.59554 7.50509 8.57813 7.58625 8.54432C7.66741 8.51051 7.74108 8.46096 7.80299 8.39853C7.86542 8.33662 7.91497 8.26296 7.94878 8.18179C7.98259 8.10063 8 8.01358 8 7.92566C8 7.83773 7.98259 7.75068 7.94878 7.66952C7.91497 7.58836 7.86542 7.5147 7.80299 7.45278L4.93909 4.59554Z" fill="#FF2020"/></g></g> </g>';
                                        } else if (
                                            dataNodeToRender[
                                                thisNodeData.attrs[
                                                    '.position-code'
                                                ].text.replace('Mã : ', '')
                                            ].attrs['.img-background-right']
                                        ) {
                                            dataNodeToRender[
                                                thisNodeData.attrs[
                                                    '.position-code'
                                                ].text.replace('Mã : ', '')
                                            ].attrs['.img-background-right'] =
                                                thisNodeData.attrs.image;
                                            dataNodeToRender[
                                                thisNodeData.attrs[
                                                    '.position-code'
                                                ].text.replace('Mã : ', '')
                                            ].markup =
                                                '<g class="rotatable "> <g class="symper-orgchart-node">  <g class="scalable"> <rect class="card"/> </g> <g class="role-img-container"><image class="role-img-center" /><image class="img-background-center" /><image class="img-background-left" /><image class="role-img-left" /><image class="img-background-right" /><image class="role-img-right" /></g> <text class="name"/>  <text class="position-code"/>  <g class="btn-container"><rect class="btn-container-background"/><rect class="btn-container-transparent-back"/></g><g class="btn-collapse-expand-hor"> <circle class="buttonSign"/> <text class="buttonSign"></text> </g> <g class="btn-collapse-expand-ver"> <circle class="buttonSign"/> <text class="buttonSign"></text> </g> <g class="btn add orgchart-action"><rect class="add transparent-background" /><path class="line-action" d="M9.375 4.97168H5.625V1.22168C5.625 1.05592 5.55915 0.896948 5.44194 0.779738C5.32473 0.662528 5.16576 0.59668 5 0.59668C4.83424 0.59668 4.67527 0.662528 4.55806 0.779738C4.44085 0.896948 4.375 1.05592 4.375 1.22168V4.97168H0.625C0.45924 4.97168 0.300269 5.03753 0.183058 5.15474C0.0658481 5.27195 0 5.43092 0 5.59668C0 5.76244 0.0658481 5.92141 0.183058 6.03862C0.300269 6.15583 0.45924 6.22168 0.625 6.22168H4.375V9.97168C4.375 10.1374 4.44085 10.2964 4.55806 10.4136C4.67527 10.5308 4.83424 10.5967 5 10.5967C5.16576 10.5967 5.32473 10.5308 5.44194 10.4136C5.55915 10.2964 5.625 10.1374 5.625 9.97168V6.22168H9.375C9.54076 6.22168 9.69973 6.15583 9.81694 6.03862C9.93415 5.92141 10 5.76244 10 5.59668C10 5.43092 9.93415 5.27195 9.81694 5.15474C9.69973 5.03753 9.54076 4.97168 9.375 4.97168Z" fill="#61C454"/></g><g class="btn remove orgchart-action"><rect class="remove transparent-background-position" /><path  class="line-action" d="M4.93909 4.59554L7.80299 1.7383C7.92841 1.61289 7.99886 1.44279 7.99886 1.26543C7.99886 1.08806 7.92841 0.917966 7.80299 0.792552C7.67758 0.667137 7.50748 0.59668 7.33012 0.59668C7.15275 0.59668 6.98265 0.667137 6.85724 0.792552L4 3.65645L1.14276 0.792552C1.01735 0.667137 0.847248 0.59668 0.669885 0.59668C0.492522 0.59668 0.322423 0.667137 0.197008 0.792552C0.0715939 0.917966 0.00113664 1.08806 0.00113664 1.26543C0.00113663 1.44279 0.0715939 1.61289 0.197008 1.7383L3.06091 4.59554L0.197008 7.45278C0.134583 7.5147 0.085035 7.58836 0.0512219 7.66952C0.0174088 7.75068 0 7.83773 0 7.92566C0 8.01358 0.0174088 8.10063 0.0512219 8.18179C0.085035 8.26296 0.134583 8.33662 0.197008 8.39853C0.258924 8.46096 0.332587 8.51051 0.413748 8.54432C0.494909 8.57813 0.581962 8.59554 0.669885 8.59554C0.757808 8.59554 0.844861 8.57813 0.926022 8.54432C1.00718 8.51051 1.08085 8.46096 1.14276 8.39853L4 5.53464L6.85724 8.39853C6.91915 8.46096 6.99282 8.51051 7.07398 8.54432C7.15514 8.57813 7.24219 8.59554 7.33012 8.59554C7.41804 8.59554 7.50509 8.57813 7.58625 8.54432C7.66741 8.51051 7.74108 8.46096 7.80299 8.39853C7.86542 8.33662 7.91497 8.26296 7.94878 8.18179C7.98259 8.10063 8 8.01358 8 7.92566C8 7.83773 7.98259 7.75068 7.94878 7.66952C7.91497 7.58836 7.86542 7.5147 7.80299 7.45278L4.93909 4.59554Z" fill="#FF2020"/></g></g> </g>';
                                        } else if (
                                            dataNodeToRender[
                                                thisNodeData.attrs[
                                                    '.position-code'
                                                ].text.replace('Mã : ', '')
                                            ].attrs['.countRoleImg']
                                        ) {
                                            dataNodeToRender[
                                                thisNodeData.attrs[
                                                    '.position-code'
                                                ].text.replace('Mã : ', '')
                                            ].attrs['.countRoleImg'].text =
                                                '+' +
                                                (Number(
                                                    dataNodeToRender[
                                                        thisNodeData.attrs[
                                                            '.position-code'
                                                        ].text.replace(
                                                            'Mã : ',
                                                            ''
                                                        )
                                                    ].attrs[
                                                        '.countRoleImg'
                                                    ].text.replace('+', '')
                                                ) +
                                                    1);
                                            dataNodeToRender[
                                                thisNodeData.attrs[
                                                    '.position-code'
                                                ].text.replace('Mã : ', '')
                                            ].markup =
                                                '<g class="rotatable "> <g class="symper-orgchart-node">  <g class="scalable"> <rect class="card"/> </g> <g class="role-img-container"><image class="role-img-center" /><image class="img-background-center" /><image class="img-background-left" /><image class="role-img-left" /><image class="img-background-right" /><image class="role-img-right" /><text class="countRoleImg"></text></g> <text class="name"/>  <text class="position-code"/>  <g class="btn-container"><rect class="btn-container-background"/><rect class="btn-container-transparent-back"/></g><g class="btn-collapse-expand-hor"> <circle class="buttonSign"/> <text class="buttonSign"></text> </g> <g class="btn-collapse-expand-ver"> <circle class="buttonSign"/> <text class="buttonSign"></text> </g> <g class="btn add orgchart-action"><rect class="add transparent-background" /><path class="line-action" d="M9.375 4.97168H5.625V1.22168C5.625 1.05592 5.55915 0.896948 5.44194 0.779738C5.32473 0.662528 5.16576 0.59668 5 0.59668C4.83424 0.59668 4.67527 0.662528 4.55806 0.779738C4.44085 0.896948 4.375 1.05592 4.375 1.22168V4.97168H0.625C0.45924 4.97168 0.300269 5.03753 0.183058 5.15474C0.0658481 5.27195 0 5.43092 0 5.59668C0 5.76244 0.0658481 5.92141 0.183058 6.03862C0.300269 6.15583 0.45924 6.22168 0.625 6.22168H4.375V9.97168C4.375 10.1374 4.44085 10.2964 4.55806 10.4136C4.67527 10.5308 4.83424 10.5967 5 10.5967C5.16576 10.5967 5.32473 10.5308 5.44194 10.4136C5.55915 10.2964 5.625 10.1374 5.625 9.97168V6.22168H9.375C9.54076 6.22168 9.69973 6.15583 9.81694 6.03862C9.93415 5.92141 10 5.76244 10 5.59668C10 5.43092 9.93415 5.27195 9.81694 5.15474C9.69973 5.03753 9.54076 4.97168 9.375 4.97168Z" fill="#61C454"/></g><g class="btn remove orgchart-action"><rect class="remove transparent-background-position" /><path  class="line-action" d="M4.93909 4.59554L7.80299 1.7383C7.92841 1.61289 7.99886 1.44279 7.99886 1.26543C7.99886 1.08806 7.92841 0.917966 7.80299 0.792552C7.67758 0.667137 7.50748 0.59668 7.33012 0.59668C7.15275 0.59668 6.98265 0.667137 6.85724 0.792552L4 3.65645L1.14276 0.792552C1.01735 0.667137 0.847248 0.59668 0.669885 0.59668C0.492522 0.59668 0.322423 0.667137 0.197008 0.792552C0.0715939 0.917966 0.00113664 1.08806 0.00113664 1.26543C0.00113663 1.44279 0.0715939 1.61289 0.197008 1.7383L3.06091 4.59554L0.197008 7.45278C0.134583 7.5147 0.085035 7.58836 0.0512219 7.66952C0.0174088 7.75068 0 7.83773 0 7.92566C0 8.01358 0.0174088 8.10063 0.0512219 8.18179C0.085035 8.26296 0.134583 8.33662 0.197008 8.39853C0.258924 8.46096 0.332587 8.51051 0.413748 8.54432C0.494909 8.57813 0.581962 8.59554 0.669885 8.59554C0.757808 8.59554 0.844861 8.57813 0.926022 8.54432C1.00718 8.51051 1.08085 8.46096 1.14276 8.39853L4 5.53464L6.85724 8.39853C6.91915 8.46096 6.99282 8.51051 7.07398 8.54432C7.15514 8.57813 7.24219 8.59554 7.33012 8.59554C7.41804 8.59554 7.50509 8.57813 7.58625 8.54432C7.66741 8.51051 7.74108 8.46096 7.80299 8.39853C7.86542 8.33662 7.91497 8.26296 7.94878 8.18179C7.98259 8.10063 8 8.01358 8 7.92566C8 7.83773 7.98259 7.75068 7.94878 7.66952C7.91497 7.58836 7.86542 7.5147 7.80299 7.45278L4.93909 4.59554Z" fill="#FF2020"/></g></g> </g>';
                                        } else {
                                            dataNodeToRender[
                                                thisNodeData.attrs[
                                                    '.position-code'
                                                ].text.replace('Mã : ', '')
                                            ].attrs['.countRoleImg'] = {
                                                text: '+1'
                                            };
                                        }
                                    } else {
                                        dataNodeToRender[
                                            thisNodeData.attrs[
                                                '.position-code'
                                            ].text.replace('Mã : ', '')
                                        ] = thisNodeData;
                                    }
                                } else {
                                    if (thisNodeData.id) {
                                        dataNodeToRender[thisNodeData.id] =
                                            thisNodeData;
                                    } else {
                                        dataNodeToRender[thisNodeData.type] =
                                            thisNodeData;
                                    }
                                }
                            });
                            if (dataNodeToRender) {
                                nodeData.positionDiagram.cells.cells = [
                                    ...Object.values(dataNodeToRender)
                                ];
                            }
                            if (DepartmentNodeData) {
                                nodeData.positionDiagram.cells.cells.push(
                                    ...DepartmentNodeData
                                );
                            }
                        }
                        let newDepartment = this.createNodeConfigData(
                            'department',
                            nodeData
                        );
                        if (node.dynamicAttributes) {
                            newDepartment.customAttributes =
                                node.dynamicAttributes;
                        }
                        newDepartment.style = this.restoreNodeStyle(node.style);
                        mapIdToDpm[node.vizId] = newDepartment;
                    }
                    savedData.positions.forEach(function (e) {
                        e.users = JSON.parse(e.users);
                        e.usersFromDoc = JSON.parse(e.usersFromDoc);
                    });
                    let allPositionInADpm = getMapDpmIdToPosition(
                        savedData.positions
                    );
                    for (let dpmId in allPositionInADpm) {
                        let dpmInstanceKey;
                        if (
                            this.$store.state.orgchart.editor[this.instanceKey]
                                .allNode[dpmId]
                        ) {
                            dpmInstanceKey =
                                this.$store.state.orgchart.editor[
                                    this.instanceKey
                                ].allNode[dpmId].positionDiagramCells
                                    .instanceKey;
                        } else {
                            let dpmIdNod = dpmId.slice(0, -1);
                            if (
                                this.$store.state.orgchart.editor[
                                    this.instanceKey
                                ].allNode[dpmIdNod]
                            ) {
                                dpmInstanceKey =
                                    this.$store.state.orgchart.editor[
                                        this.instanceKey
                                    ].allNode[dpmIdNod].positionDiagramCells
                                        .instanceKey;
                            } else {
                                let dpmIdNoHost = dpmId.replace(
                                    'Symper_Department_Host',
                                    ''
                                );
                                dpmInstanceKey =
                                    this.$store.state.orgchart.editor[
                                        this.instanceKey
                                    ].allNode[dpmIdNoHost].positionDiagramCells
                                        .instanceKey;
                            }
                        }
                        for (let idPosition in allPositionInADpm[dpmId]) {
                            let position = allPositionInADpm[dpmId][idPosition];
                            let userSelected = this.getListUserAsArr(
                                position.users
                            );
                            let nodeData = {
                                id: position.vizId,
                                name: position.name,
                                description: position.description,
                                code: position.code,
                                users: userSelected,
                                dataFromDoc: {
                                    users: position.usersFromDoc
                                }
                            };
                            let newPosition = this.createNodeConfigData(
                                'position',
                                nodeData,
                                dpmInstanceKey
                            );
                            newPosition.style = this.restoreNodeStyle(
                                position.style
                            );
                            if (position.dynamicAttributes) {
                                newPosition.customAttributes =
                                    position.dynamicAttributes;
                            }
                        }
                    }
                    this.showOrgchartConfig();
                    setTimeout(
                        (self) => {
                            self.loadingDiagramView = false;
                            if (self.idDepartmentHighLight) {
                                self.addClassHighLight([
                                    self.idDepartmentHighLight
                                ]);
                            }
                        },
                        1500,
                        this
                    );
                } else {
                    this.$snotifyError(
                        res,
                        this.$t('v2.orgchart.getOrgChartDataFail'),
                        res.message
                    );
                }
            } catch (error) {
                this.$snotifyError(
                    error,
                    this.$t('v2.orgchart.getOrgChartDataFail')
                );
            }
        },
        getListUserAsArr(users) {
            if (!users) {
                users = [];
            } else {
                if (typeof users == 'string') {
                    try {
                        users = JSON.parse(users);
                    } catch (error) {
                        users = [];
                    }
                }
            }
            return users;
        },

        restoreNodeStyle(savedStyle) {
            if (typeof savedStyle != 'object') {
                savedStyle = JSON.parse(savedStyle);
            }
            let styleConfig = getNodeStyleConfig();
            for (let key in savedStyle) {
                if (styleConfig[key]) {
                    styleConfig[key].value = savedStyle[key];
                }
            }
            return styleConfig;
        },

        addUsersToPosition(postions, users) {
            for (let pos of postions) {
                if (pos.users) {
                    pos.users =
                        typeof pos.users == 'string'
                            ? JSON.parse(pos.users)
                            : pos.users;
                    let map = {};
                    for (let u of pos.users) {
                        map[u] = true;
                    }
                    pos.users = Object.keys(map);
                } else {
                    pos.users = [];
                }
            }
        },
        centerDiagram() {
            setTimeout(
                (self) => {
                    self.$refs.editorWorkspace.handleHeaderAction('zoomToFit');
                },
                200,
                this
            );
        },
        showPositionEditor(nodeId) {
            if (this.context == 'department') {
                this.$store.commit('orgchart/updateCurrentFatherNode', {
                    id: nodeId,
                    instanceKey: this.instanceKey
                });
                this.positionEditor = true;
                this.$store.commit(
                    'orgchart/updateInstanceKey',
                    this.instanceKey
                );
                this.selectNode(nodeId);
                setTimeout(
                    (self) => {
                        self.checkAndCreateOrgchartData();
                        if (self.selectingNode.positionDiagramCells.cells) {
                            if (
                                self.selectingNode.positionDiagramCells.cells
                                    .cells.length > 0
                            ) {
                                self.$refs.positionDiagram.loadDiagramFromJson(
                                    self.selectingNode.positionDiagramCells
                                        .cells
                                );

                                let allNodes =
                                    self.$refs.positionDiagram.getAllNode();
                                let firstNode = allNodes[0];
                                if (
                                    allNodes[0].id.includes(
                                        'Symper_Department_Host'
                                    )
                                ) {
                                    firstNode = allNodes[1];
                                }
                                this.$store.commit(
                                    'orgchart/changeSelectingNode',
                                    {
                                        instanceKey:
                                            self.selectingNode
                                                .positionDiagramCells
                                                .instanceKey,
                                        nodeId: firstNode.id
                                    }
                                );
                                if (self.listUserIds != null) {
                                    self.$refs.positionDiagram.$refs.editorWorkspace.changeUserDisplayInNode(
                                        self.listUserIds
                                    );
                                }
                                self.$store.commit(
                                    'orgchart/updateFirstChildNodeId',
                                    firstNode.id
                                );
                                self.$store.commit(
                                    'orgchart/updateCurrentChildrenNodeId',
                                    firstNode.id
                                );
                            } else {
                                let data =
                                    self.$refs.positionDiagram.createFirstVizNode(
                                        self.selectingNode
                                    );
                                self.$store.commit(
                                    'orgchart/updateCurrentChildrenNodeId',
                                    data.id
                                );
                                self.$store.commit(
                                    'orgchart/updateFirstChildNodeId',
                                    data.id
                                );
                            }
                        } else {
                            let data =
                                self.$refs.positionDiagram.createFirstVizNode();
                            self.$store.commit(
                                'orgchart/updateCurrentChildrenNodeId',
                                data.id
                            );
                            self.$store.commit(
                                'orgchart/updateFirstChildNodeId',
                                data.id
                            );
                        }
                        setTimeout(function () {
                            self.$refs.positionDiagram.centerDiagram();
                        }, 200);
                        self.$refs.positionDiagram.$refs.editorWorkspace.scrollPaperToTop(
                            200
                        );
                        self.$refs.positionDiagram.showOrgchartConfig();
                        self.$refs.positionDiagram.$refs.editorWorkspace.changeTypeView(
                            self.typeView
                        );
                    },
                    200,
                    this
                );
            }
        },
        createFirstVizNode(data = null) {
            return this.$refs.editorWorkspace.createFirstVizNode(data);
        },
        loadDiagramFromJson(cells) {
            this.$refs.editorWorkspace.loadDiagramFromJson(cells);
        },
        checkAndCreateOrgchartData() {
            let subInstanceKey =
                this.selectingNode.positionDiagramCells.instanceKey;
            if (!this.$store.state.orgchart.editor[subInstanceKey]) {
                this.$refs.positionDiagram.initOrgchartData();
            }
            this.$store.state.orgchart.editor[subInstanceKey].homeConfig =
                this.selectingNode;
        },
        changeCounDepartment(id, numberDepartment) {
            let selectedCell = this.$refs.editorWorkspace.getCell(id);
            let counDepartmentBefore = 0;
            if (
                selectedCell.attributes.markup.match(
                    /<text class\="counDepartmentClass">\s*([0-9]*)\s*<\/text>/g
                )
            ) {
                counDepartmentBefore = selectedCell.attributes.markup.match(
                    /<text class\="counDepartmentClass">\s*([0-9]*)\s*<\/text>/g
                )[0];
                counDepartmentBefore = counDepartmentBefore.replace(
                    /<text class\="counDepartmentClass">/g,
                    ''
                );
                counDepartmentBefore =
                    Number(counDepartmentBefore.replace(/<\/text>/g, '')) +
                    Number(numberDepartment);
            } else {
                counDepartmentBefore = Number(numberDepartment);
            }

            selectedCell.attributes.markup =
                selectedCell.attributes.markup.replaceAll(
                    /<text class\="counDepartmentClass">\s*([0-9]*)\s*<\/text>/g,
                    `<text class="counDepartmentClass">${counDepartmentBefore}</text>`
                );
        },
        getUserInNodeChild(id) {
            this.$refs.editorWorkspace.getAllLink().forEach((link) => {
                if (link.attributes.source.id == id) {
                    let childCell = this.$refs.editorWorkspace.getCell(
                        link.attributes.target.id
                    );
                    let counUserBefore = 0;
                    if (
                        childCell.attributes.markup.match(
                            /<text class\="counUserClass">\s*([0-9]*)\s*<\/text>/g
                        )
                    ) {
                        counUserBefore = childCell.attributes.markup.match(
                            /<text class\="counUserClass">\s*([0-9]*)\s*<\/text>/g
                        )[0];
                        counUserBefore = counUserBefore.replace(
                            /<text class\="counUserClass">/g,
                            ''
                        );
                        counUserBefore = Number(
                            counUserBefore.replace(/<\/text>/g, '')
                        );
                    }
                    this.countUserClass += counUserBefore;
                    this.getUserInNodeChild(link.attributes.target.id);
                }
            });
        },
        changeCounDepartmentFrontCell(id, numberDepartment) {
            this.$refs.editorWorkspace.getAllLink().forEach((link) => {
                if (link.attributes.target.id == id) {
                    let frontCell = this.$refs.editorWorkspace.getCell(
                        link.attributes.source.id
                    );
                    let counDepartmentBefore = 0;
                    if (
                        frontCell.attributes.markup.match(
                            /<text class\="counDepartmentClass">\s*([0-9]*)\s*<\/text>/g
                        )
                    ) {
                        counDepartmentBefore =
                            frontCell.attributes.markup.match(
                                /<text class\="counDepartmentClass">\s*([0-9]*)\s*<\/text>/g
                            )[0];
                        counDepartmentBefore = counDepartmentBefore.replace(
                            /<text class\="counDepartmentClass">/g,
                            ''
                        );
                        counDepartmentBefore =
                            Number(
                                counDepartmentBefore.replace(/<\/text>/g, '')
                            ) + Number(numberDepartment);
                    } else {
                        counDepartmentBefore = Number(numberDepartment);
                    }

                    frontCell.attributes.markup =
                        frontCell.attributes.markup.replaceAll(
                            /<text class\="counDepartmentClass">\s*([0-9]*)\s*<\/text>/g,
                            `<text class="counDepartmentClass">${counDepartmentBefore}</text>`
                        );
                    this.changeCounDepartmentFrontCell(
                        link.attributes.source.id,
                        numberDepartment
                    );
                }
            });
        },
        reRenderAllNodeAndLink() {
            let self = this;
            let nodes = self.$refs.editorWorkspace.getAllNode();
            let links = self.$refs.editorWorkspace.getAllLink();
            let graph = self.$refs.editorWorkspace.getGraph();
            graph.resetCells([...nodes, ...links]);
            if (self.idDepartmentHighLight) {
                self.addClassHighLight([self.idDepartmentHighLight]);
            }
        },
        getNodeData(nodeId, instanceKey) {
            return this.$store.state.orgchart.editor[instanceKey].allNode[
                nodeId
            ];
        },
        storeDepartmentPositionCells() {
            let self = this;
            let cells =
                this.$refs.positionDiagram.$refs.editorWorkspace.getAllDiagramCells();
            let countDepartmentBefore = self.selectingNode.positionDiagramCells
                .cells.cells
                ? self.selectingNode.positionDiagramCells.cells.cells.length
                : 0;
            this.selectingNode.positionDiagramCells.cells = cells;
            let selectingNodeID = self.selectingNode.id;
            let selectedCell =
                self.$refs.editorWorkspace.getCell(selectingNodeID);
            let counUserClass = 0;
            setTimeout(() => {
                self.selectingNode.positionDiagramCells.cells.cells.forEach(
                    (e) => {
                        if (
                            e.type == 'Symper.Position' &&
                            !e.attrs['.departmentText']
                        ) {
                            counUserClass += self.getNodeData(
                                e.id,
                                self.selectingNode.positionDiagramCells
                                    .instanceKey
                            )?.users?.length;
                        }
                    }
                );
                self.countUserClass = counUserClass;
                self.getUserInNodeChild(selectingNodeID);
                let numberPositionChange =
                    (self.selectingNode.positionDiagramCells.cells.cells
                        .length -
                        countDepartmentBefore) /
                        2 <
                    1
                        ? 0
                        : (self.selectingNode.positionDiagramCells.cells.cells
                              .length -
                              countDepartmentBefore) /
                          2;
                self.changeCounDepartmentFrontCell(
                    selectingNodeID,
                    Math.floor(numberPositionChange)
                );
                self.changeCounDepartment(
                    selectingNodeID,
                    Math.floor(numberPositionChange)
                );
                let countUserClass=self.countUserClass;
                selectedCell.attributes.markup =
                    selectedCell.attributes.markup.replaceAll(
                        /<text class\="counUserClass">\s*([0-9]*)\s*<\/text>/g,
                        `<text class="counUserClass">${countUserClass}</text>`
                    );
                self.reRenderAllNodeAndLink();
            }, 100);
        },
        validateOrgchartNameAndCode() {
            let self = this;
            return new Promise((resolve, reject) => {
                let attr =
                    self.$store.state.orgchart.editor[this.instanceKey]
                        .homeConfig.commonAttrs;
                let passed = true;
                if (!attr.name.value || !attr.code.value) {
                    passed = false;
                    self.showWarning(
                        this.$t('v2.orgchart.mustHaveOrgcharNameAndCode'),
                        function () {
                            self.selectNode(SYMPER_HOME_ORGCHART);
                        }
                    );
                    reject(false);
                } else {
                    resolve(true);
                }
            });
        },
        showWarning(title, resolveAction) {
            this.$snotify({
                type: 'warn',
                tex: '',
                duration: 100000,
                position: 'top left',
                title: title,
                actionBtns: [
                    {
                        text: this.$t('v2.orgchart.resolve'),
                        icon: 'mdi-send-check',
                        action: (close) => {
                            resolveAction();
                            close();
                        }
                    }
                ]
            });
        },
        validateEmptyNameAndCodeDepartment() {
            let self = this;

            let mapVizNode = this.$refs.editorWorkspace
                .getAllDiagramCells()
                .cells.reduce((map, el) => {
                    map[el.id] = el;
                    return map;
                }, {});
            return new Promise((resolve, reject) => {
                let allNode =
                    self.$store.state.orgchart.editor[this.instanceKey].allNode;
                let passed = true;
                for (let nodeId in allNode) {
                    if (!mapVizNode[nodeId]) {
                        continue;
                    }
                    let attr = allNode[nodeId].commonAttrs;
                    if (!attr.name.value || !attr.code.value) {
                        passed = false;
                        self.showWarning(
                            self.$t(
                                'v2.orgchart.mustHaveDepartmentNameAndCode'
                            ),
                            function () {
                                self.selectNode(nodeId);
                            }
                        );
                    }
                }

                if (passed) {
                    resolve();
                } else {
                    reject();
                }
            });
        },
        validateDuplicateCodeDepartment() {
            let self = this;
            let mapVizNode = this.$refs.editorWorkspace
                .getAllDiagramCells()
                .cells.reduce((map, el) => {
                    map[el.id] = el;
                    return map;
                }, {});
            return new Promise((resolve, reject) => {
                let allNode =
                    self.$store.state.orgchart.editor[this.instanceKey].allNode;
                let invalidIds = [];
                let mapCodeDpms = {};
                for (let nodeId in allNode) {
                    if (!mapVizNode[nodeId]) {
                        continue;
                    }
                    let attr = allNode[nodeId].commonAttrs;
                    let code = attr.code.value;
                    if (!code) {
                        continue;
                    }
                    if (!mapCodeDpms[code]) {
                        mapCodeDpms[code] = allNode[nodeId];
                    } else {
                        invalidIds.push(nodeId);
                        self.showWarning(
                            this.$t(
                                'v2.orgchart.codeOfDepartmentCanNotBeDuplicated'
                            ),
                            function () {
                                self.selectNode(nodeId);
                            }
                        );
                    }
                }

                if (invalidIds.length == 0) {
                    resolve();
                } else {
                    reject();
                }
            });
        },
        validateEmptyNameAndCodePosition() {
            let self = this;
            return new Promise((resolve, reject) => {
                let allDpmns =
                    self.$store.state.orgchart.editor[this.instanceKey].allNode;
                let passed = true;
                let mapVizNode = this.$refs.editorWorkspace
                    .getAllDiagramCells()
                    .cells.reduce((map, el) => {
                        map[el.id] = el;
                        return map;
                    }, {});
                for (let dpmId in allDpmns) {
                    if (!mapVizNode[dpmId]) {
                        continue;
                    }
                    let dpm = allDpmns[dpmId];
                    let posNodeIds = [];
                    if (dpm.positionDiagramCells.cells != false) {
                        dpm.positionDiagramCells.cells.cells.forEach(function (
                            e
                        ) {
                            if (e.type == 'Symper.Position') {
                                posNodeIds.push(e.id);
                            }
                        });
                    }

                    let allPos =
                        self.$store.state.orgchart.editor[
                            dpm.positionDiagramCells.instanceKey
                        ].allNode;
                    let resAllPos = [];
                    posNodeIds.forEach(function (e) {
                        if (allPos[e]) {
                            resAllPos[e] = allPos[e];
                        }
                    });
                    for (let posId in resAllPos) {
                        let attr = allPos[posId].commonAttrs;
                        if (!attr.name.value || !attr.code.value) {
                            passed = false;
                            self.showWarning(
                                this.$t(
                                    'v2.orgchart.mustHavePositionNameAndCode'
                                ),
                                function () {
                                    if (!self.positionEditor) {
                                        self.showPositionEditor(dpmId);
                                    } else {
                                        if (dpmId != self.selectingNode.id) {
                                            self.positionEditor = false;
                                        }
                                    }
                                    setTimeout(() => {
                                        self.$refs.positionDiagram.selectNode(
                                            posId
                                        );
                                    }, 500);
                                }
                            );
                        }
                    }
                }

                if (passed) {
                    resolve();
                } else {
                    reject();
                }
            });
        },
        validateDataBeforeSave() {
            let self = this;
            return new Promise((resolve, reject) => {
                let validateMethods = [
                    self.validateOrgchartNameAndCode(),
                    self.validateEmptyNameAndCodeDepartment(),
                    self.validateDuplicateCodeDepartment(),
                    self.validateEmptyNameAndCodePosition()
                ];
                Promise.all(validateMethods)
                    .then(() => {
                        resolve(true);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        },
        async saveOrgchart() {
            let passed = true;
            try {
                await this.validateDataBeforeSave();
            } catch (error) {
                console.warn('error when validate orgchart before save', error);
                passed = false;
            }

            if (passed) {
                let orgchartData = this.getDataToSave();
                this.$emit('save-orgchart-data', orgchartData);
            }
        },
        getDataToSave() {
            let orgchartAttr =
                this.$store.state.orgchart.editor[this.instanceKey].homeConfig;
            let allVizCell = this.$refs.editorWorkspace.getAllDiagramCells();
            allVizCell = this.normalizeDiagramNodeDisplay(allVizCell);
            let data = {
                content: JSON.stringify(allVizCell),
                departments: JSON.stringify(
                    this.getAllNodesToSave(allVizCell.cells, this.instanceKey)
                ),
                description: orgchartAttr.commonAttrs.description.value,
                dynamicAttrs: JSON.stringify(orgchartAttr.customAttributes),
                name: orgchartAttr.commonAttrs.name.value,
                code: orgchartAttr.commonAttrs.code.value,
                isDefault:
                    orgchartAttr.commonAttrs.isDefault.value == true ? 1 : 0,
                mappingDocInfo: {
                    docId: orgchartAttr.commonAttrs.mappingDoc.value,
                    script: orgchartAttr.commonAttrs.scriptMapping.value,
                    fieldMapping: orgchartAttr.commonAttrs.tableMapping.value
                }
            };
            return data;
        },
        normalizeDiagramNodeDisplay(allVizCell) {
            for (let node of allVizCell.cells) {
                if (node.type != 'org.Arrow') {
                    if (node.attrs['.card']) {
                        node.attrs['.card'].stroke =
                            DEFAULT_DEPARTMENT_DISPLAY.stroke;
                    }
                }
            }
            return allVizCell;
        },
        getAllNodesToSave(allVizCell, instanceKey, type = 'department') {
            let links = [];
            let nodeMap = {};
            for (let cell of allVizCell) {
                if (cell.type == 'org.Arrow') {
                    links.push(cell);
                } else {
                    let node =
                        this.$store.state.orgchart.editor[instanceKey].allNode[
                            cell.id
                        ];
                    if (node) {
                        nodeMap[cell.id] = this.getNodeDataToSave(
                            cell.id,
                            instanceKey,
                            type
                        );
                    }
                }
            }
            for (let link of links) {
                if (nodeMap[link.target.id]) {
                    if (link.source.id.includes('Symper_Department_Host')) {
                        nodeMap[link.target.id].vizParentId =
                            link.source.id.replace(
                                'Symper_Department_Host',
                                ''
                            );
                    } else {
                        nodeMap[link.target.id].vizParentId = link.source.id;
                    }
                }
            }
            return Object.values(nodeMap);
        },
        getNodeStyleDataToSave(node) {
            let nodeStyle = {};
            for (let key in node.style) {
                nodeStyle[key] = node.style[key].value;
            }
            return nodeStyle;
        },
        getNodeDataToSave(nodeId, instanceKey, nodeType) {
            let node =
                this.$store.state.orgchart.editor[instanceKey].allNode[nodeId];
            let attrs = node.commonAttrs;
            let nodeStyle = this.getNodeStyleDataToSave(node);

            let data = {
                name: attrs.name.value,
                code: attrs.code.value,
                vizId: nodeId,
                description: attrs.description.value,
                vizParentId: '',
                dynamicAttrs: node.customAttributes,
                style: JSON.stringify(nodeStyle),
                users: JSON.stringify(node.users),
                usersFromDoc: JSON.stringify(node.dataFromDoc.users)
            };

            if (nodeType == 'department') {
                data.content = '';
                if (node.positionDiagramCells.cells) {
                    data.content = JSON.stringify(
                        this.normalizeDiagramNodeDisplay(
                            node.positionDiagramCells.cells
                        )
                    );
                }
                if (node.positionDiagramCells.cells) {
                    let positions = this.getAllNodesToSave(
                        node.positionDiagramCells.cells.cells,
                        node.positionDiagramCells.instanceKey,
                        'position'
                    );
                    for (let j of positions) {
                        if (!j.vizParentId) {
                            j.vizParentId = nodeId;
                        }
                    }
                    data.positions = positions;
                } else {
                    data.positions = [];
                }
            } else {
                data.users =
                    typeof node.users == 'string'
                        ? JSON.parse(node.users)
                        : node.users;
                if (node.isSetPermissions) {
                    data.permissions = node.permissions.reduce((arr, el) => {
                        arr.push(el.id);
                        return arr;
                    }, []);
                }
            }
            return data;
        },
        handleBlankPaperClicked() {
            this.showOrgchartConfig();
            this.checkAndCreateFirstNode();
        },
        checkAndCreateFirstNode() {
            let allVizCell = this.$refs.editorWorkspace.getAllDiagramCells();
            if (allVizCell.cells.length == 0) {
                this.createFirstVizNode();
                this.loadingDiagramView = true;
                setTimeout(
                    (self) => {
                        self.loadingDiagramView = false;
                    },
                    1500,
                    this
                );
            }
        },
        handleConfigValueChange(data) {
            let cellId = this.selectingNode.id;
            if (data.name == 'name' && cellId != SYMPER_HOME_ORGCHART) {
                this.$refs.editorWorkspace.updateCellAttrs(
                    cellId,
                    'name',
                    data.data
                );
            } else if (
                cellId == SYMPER_HOME_ORGCHART &&
                this.context == 'position'
            ) {
                this.$emit('update-department-name', data.data);
            } else if (this.context == 'position' && data.name == 'code') {
                let content = data.data
                    ? this.$t('common.code') + ' : ' + data.data
                    : '';
                this.$refs.editorWorkspace.updateCellAttrs(
                    cellId,
                    'positionCode',
                    content
                );
            }
            if ((data.name = 'mappingDoc')) {
                this.selectedDoc = data.data;
            }
        },
        changeDepartmentName(newName, idDepartment = false) {
            if (!idDepartment) {
                idDepartment = this.selectingNode.id;
            }
            this.$refs.editorWorkspace.updateCellAttrs(
                idDepartment,
                'name',
                newName
            );
        },
        handleNewNodeAdded(nodeData) {
            this.createNodeConfigData(this.context, nodeData);
            if (!nodeData.autoCreateFirstNode) {
                this.selectNode(nodeData.id);
            }
        },
        async handleHeaderAction(action) {
            if (action == 'home') {
                this.showOrgchartConfig();
            } else if (action == 'saveSVG') {
                this.$refs.editorWorkspace.saveSVG();
            } else if (action == 'validate') {
                let passed = true;
                try {
                    let validate = await this.validateDataBeforeSave();
                } catch (error) {
                    console.warn(
                        this.$t('v2.bi.errorWhenValidateOrgchartBeforeSave'),
                        error
                    );
                    passed = false;
                    this.$snotifyError(
                        rsl,
                        this.$t('v2.bi.validateFailed'),
                        rsl.message
                    );
                }

                if (passed) {
                    this.$snotifySuccess(this.$t('v2.bi.validatePassed'));
                }
            } else if (action == 'changeTypeView') {
                let type = this.typeView == 'B' ? 'R' : 'B';
                this.typeView = type;
                this.$refs.editorWorkspace.changeTypeView(type);
            } else {
                this.$refs.editorWorkspace.handleHeaderAction(action);
            }
        },
        showOrgchartConfig() {
            this.$store.commit('orgchart/changeSelectingNode', {
                instanceKey: this.instanceKey,
                nodeId: SYMPER_HOME_ORGCHART
            });
        },
        initOrgchartData(instanceKey = false) {
            instanceKey = instanceKey ? instanceKey : this.instanceKey;
            let initData = getOrgchartEditorData();
            this.$store.commit('orgchart/setOrgchartData', {
                instanceKey: instanceKey,
                data: initData
            });
        },
        /**
         * Tạo node data để cấu hình
         * @param type nhận một trong các giá trị: department hoặc position
         */
        createNodeConfigData(
            type = 'department',
            nodeData,
            instanceKey = false
        ) {
            if (!instanceKey) {
                instanceKey = this.instanceKey;
            }
            this.$store.commit('orgchart/updateInstanceKey', instanceKey);
            let defaultConfig = getDefaultConfigNodeData(
                nodeData.id,
                type == 'department'
            );
            for (let key in nodeData) {
                if (defaultConfig.commonAttrs[key]) {
                    defaultConfig.commonAttrs[key].value = nodeData[key];
                }
            }
            if (nodeData.positionDiagram) {
                defaultConfig.positionDiagramCells.cells =
                    nodeData.positionDiagram.cells;
            }

            if (nodeData.users) {
                defaultConfig.users = nodeData.users;
            }
            if (nodeData.dataFromDoc) {
                defaultConfig.dataFromDoc.users = nodeData.dataFromDoc.users;
            } else {
                defaultConfig.dataFromDoc.users = [];
            }
            this.$store.commit('orgchart/setNodeConfig', {
                instanceKey: instanceKey,
                nodeId: nodeData.id,
                data: defaultConfig
            });

            if (type == 'department') {
                this.initOrgchartData(
                    defaultConfig.positionDiagramCells.instanceKey
                );
            }

            return defaultConfig;
        },

        /**
         * Chọn một node và hiển thị lên cấu hình ở bên tay phải
         */
        selectNode(nodeId) {
            this.$refs.editorWorkspace.unHighlightCurrentNode();
            this.$store.commit('orgchart/changeSelectingNode', {
                instanceKey: this.instanceKey,
                nodeId: nodeId
            });
            this.$refs.editorWorkspace.highlightNode();
            if (this.context == 'position' && this.selectingNode) {
                this.selectingNode.isSetPermissions = true;
                this.showPermissionsOfNode();
            }
        },
        /**
         * ham lay cac field cua doc duoc chon
         */
        getFieldsInDoc(id) {
            let self = this;
            documentApi
                .getFieldByDocId(id)
                .then((res) => {
                    if (res.status == 200) {
                        let data = res.data;
                        for (let i in data) {
                            let obj = {};
                            obj.name = data[i].properties.name;
                            obj.title = data[i].properties.title;
                            self.listFieldInSelectedDoc.push(obj.name);
                        }
                        let homeConfig =
                            self.$store.state.orgchart.editor[self.instanceKey]
                                .homeConfig;
                        this.$set(
                            homeConfig.commonAttrs.tableMapping.columns[0],
                            'source',
                            self.listFieldInSelectedDoc
                        );
                    }
                })
                .catch((err) => {});
        },

        async showPermissionsOfNode() {
            if (
                this.selectingNode.permissions.length > 0 ||
                this.action == 'create'
            ) {
                return;
            }
            let res = await permissionApi.getPermissionOfRole(
                'orgchart:' + this.id + ':' + this.selectingNode.id
            );
            if (res.status == 200) {
                let mapIdToPermission =
                    this.$store.state.permission.allPermissionPack;
                let permissions = res.data.reduce((arr, el) => {
                    if (mapIdToPermission[el.permissionPackId]) {
                        arr.push(mapIdToPermission[el.permissionPackId]);
                    }
                    return arr;
                }, []);
                this.$set(this.selectingNode, 'permissions', permissions);
            } else {
                this.$snotifyError(res, 'Can not get permission of role');
            }
        }
    }
};
</script>
<style scoped>
.paper-scroller-background {
    background-color: white;
}
</style>
<style>
.symper-orgchart-node .department .department-child {
    height: 25px;
    width: 25px;
    background-color: #fff3e0;
    text-align: center;
}

.v-menu__content {
    z-index: 10000 !important;
}
.symper-orgchart-paper .marker-arrowheads,
.symper-orgchart-paper .marker-vertex-group,
.symper-orgchart-view .symper-orgchart-paper .orgchart-action {
    display: block !important;
}
.symper-orgchart-paper .link-tools,
.symper-orgchart-paper .marker-vertex,
.symper-orgchart-paper .marker-vertex-remove-area,
.symper-orgchart-paper .marker-arrowhead-group {
    display: none !important;
}

.symper-orgchart-view .line-action {
    display: none !important;
}

.symper-orgchart-view .btn-container {
    display: none !important;
}

.symper-orgchart-active-editor .symper-orgchart-paper .orgchart-action {
    display: block !important;
}
.symper-orgchart-active-editor .show-infor-department,
.symper-orgchart-active-editor .show-infor-user,
.symper-orgchart-active-editor .infor-container {
    /* display: none !important; */
}

.symper-orgchart-active-editor
    .symper-orgchart-paper
    .symper-orgchart-node:hover
    .orgchart-action {
    display: block !important;
}

.diagram-hortical .btn-collapse-expand-ver {
    display: none !important ;
}

.diagram-vertical .btn-collapse-expand-hor {
    display: none;
}
</style>

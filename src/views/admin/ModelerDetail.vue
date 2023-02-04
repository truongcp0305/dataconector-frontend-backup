<template>
    <div class="w-100 h-100 modeler-detail-admin">
        <div class="h-100 w-100">
            <div class="action-diagram-bpmn d-flex">
                <div
                    class="
                        fs-15
                        flex-grow-1
                        text-uppercase
                        font-weight-bold
                        mt-2
                    "
                >
                    {{ $t('v2.admin.detailInfo') }}
                </div>
                <div class="d-flex mt-1">
                    <v-btn
                        tile
                        icon
                        x-small
                        class="mr-2"
                        @click="changeTab('tab-1')"
                    >
                        <v-icon small>mdi-numeric-2-box-outline</v-icon>
                    </v-btn>
                    <v-btn
                        tile
                        icon
                        x-small
                        class="mr-2"
                        @click="changeTab('tab-2')"
                    >
                        <v-icon x-small>mdi-coolant-temperature</v-icon>
                    </v-btn>
                    <v-btn
                        tile
                        icon
                        v-show="tab == 'tab-1'"
                        x-small
                        class="mr-2"
                        @click="handleZoomOut"
                    >
                        <v-icon small>mdi-plus-circle-outline</v-icon>
                    </v-btn>
                    <v-btn
                        tile
                        icon
                        x-small
                        v-show="tab == 'tab-1'"
                        class="mr-2"
                        @click="handleZoomIn"
                    >
                        <v-icon small>mdi-minus-circle-outline</v-icon>
                    </v-btn>
                    <v-btn
                        tile
                        icon
                        x-small
                        v-show="tab == 'tab-1'"
                        class="mr-2"
                        @click="handleFocus"
                    >
                        <v-icon small>mdi-image-filter-center-focus</v-icon>
                    </v-btn>
                </div>
            </div>
            <symper-bpmn
                v-show="tab == 'tab-1'"
                @node-clicked="handleNodeSelected"
                @node-changed="handleNodeChangeProps"
                ref="symperBpmn"
                :height="diagramHeight"
                :width="600"
                :diagramXML="diagramXML"
                :customModules="customRender"
            ></symper-bpmn>
            <ModelerWithHeatMap
                v-show="tab == 'tab-2'"
                :tab="tab"
                :handleAction="handleAction"
            />
        </div>
    </div>
</template>

<script>
import SymperBpmn from '@/components/common/SymperBpmn.vue';
import {
    getNodeAttrs,
    nodeAttrsDefinition
} from '@/components/process/nodeAttrsFactory';
import { allAttrDisplayGroup } from '@/components/process/allAttrDisplayGroup';
import FormTpl from '@/components/common/FormTpl.vue';
import { util } from '@/plugins/util';
import bpmnApi from '@/api/BPMNEngine.js';
import {
    defaultXML,
    reformatValueToStr
} from '@/components/process/reformatGetListData';
import { allNodesAttrs } from '@/components/process/allAttrsOfNodes';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { documentApi } from '@/api/Document';
import customExtension from '@/components/process/elementDefinitions/customExtension';
import {
    pushCustomElementsToModel,
    collectInfoForTaskDescription
} from '@/components/process/elementDefinitions/customExtToModel';
import Api from '@/api/api.js';
import { appConfigs } from '@/configs';
import serviceTaskDefinitions from '@/components/process/elementDefinitions/serviceTaskDefinitions';
import CustomRenderProcessCount from '@/components/process/CustomRenderProcessCount';
import ModelerWithHeatMap from './ModelerWithHeatMap';
import { cleanXMLBeforeRenderInEditor } from '@/components/process/processAction.js';

const apiCaller = new Api('');

const nodeStatusColors = {
    failed: {
        fill: '#e24747',
        stroke: '#fff7f7'
    },
    todo: {
        fill: '#ffffff',
        stroke: '#0760D9'
    },
    done: {
        fill: '#edffee',
        stroke: '#4CAF50'
    }
};

// Khung data của từng node cần lưu vào db
const nodeDataTpl = {
    bounds: {
        lowerRight: {
            x: 1200,
            y: 1050
        },
        upperLeft: {
            x: 0,
            y: 0
        }
    },
    properties: {},
    childShapes: [],
    stencil: {
        id: ''
    }
};

//Do có một số khác biệt giữa tên gọi các node giữa thư viện đang dùng và  Map giữa tên các node của thư viện sang tên các node của flowable
const mapLibNameToFlowableName = {
    EventBasedGateway: 'EventGateway',
    StartEvent: 'StartNoneEvent',
    ThrowEvent: 'ThrowNoneEvent',
    EndEvent: 'EndNoneEvent',
    AdHocSubProcess: 'AdhocSubProcess',
    Process: 'BPMNDiagram',
    Collaboration: 'BPMNDiagram',
    Task: 'UserTask',
    Participant: 'Pool'
};

const mappNodeActivity = {
    SendTask: 'SendTask',
    UserTask: 'UserTask',
    CallActivity: 'CallActivity',
    ReceiveTask: 'ReceiveTask',
    ScriptTask: 'ScriptTask'
};

export default {
    methods: {
        changeTab(data) {
            this.tab = data;
        },
        calcDiagramHeight() {
            this.diagramHeight = window.innerHeight - 400;
        },
        handleZoomOut() {
            this.handleAction = 'handleZoomOut';
            this.$refs.symperBpmn.zoomOut();
        },
        handleZoomIn() {
            this.handleAction = 'handleZoomIn';
            this.$refs.symperBpmn.zoomIn();
        },
        handleFocus() {
            this.handleAction = 'handleFocus';
            this.$refs.symperBpmn.focus();
        },

        /**
         * Tìm và đặt các control cho việc lựa chọn cho phép edit trong lúc duyệt
         */
        async setEditableControlsForNode(approvalNodeData, submitNodeData) {
            let docId = submitNodeData.attrs.formreference.value;
            let docDetail = await documentApi.detailDocument(docId);

            let fieldsMap = docDetail.data.fields;
            let ctrls = [
                {
                    name: 'SYMPER_NONE_CONTROLS',
                    title: this.$t('v2.admin.notSelect'),
                    id: 'SYMPER_NONE_CONTROLS'
                },
                {
                    name: 'SYMPER_ALL_CONTROLS',
                    title: this.$t('v2.admin.allControl'),
                    id: 'SYMPER_ALL_CONTROLS'
                }
            ];

            let tbs = [];
            for (let ctrlName in fieldsMap) {
                let ctrl = fieldsMap[ctrlName];
                if (ctrl.properties.name) {
                    ctrls.push({
                        name: ctrl.properties.name,
                        title: ctrl.properties.title,
                        id: ctrl.properties.name
                    });
                }

                if (ctrl.type == 'table') {
                    for (let childName in ctrl.listFields) {
                        let childCtrl = ctrl.listFields[childName];
                        if (childCtrl.properties.name) {
                            ctrls.push({
                                name: childCtrl.properties.name,
                                title: childCtrl.properties.title,
                                id: childCtrl.properties.name
                            });
                        }
                    }
                }
            }
            if (approvalNodeData.type != 'ServiceTask') {
                approvalNodeData.attrs.approvalEditableControls.options = null;
                approvalNodeData.attrs.approvalEditableControls.options = ctrls;
            }
        },
        resetAttrPanelHeight() {
            this.attrPannelHeight = util.getComponentSize(this).h - 50 + 'px';
        },
        /**
         * Validate
         */
        async validateDeployData() {
            let self = this;
            return new Promise((resolve, reject) => {
                // resolve();
                // return;
                let validateData = self.getAllElementData();
                // validateData = JSON.parse();
                bpmnApi
                    .validateModel(JSON.stringify(validateData))
                    .then((validateResult) => {
                        if (validateResult.length == 0) {
                            resolve();
                        } else {
                            for (let err of validateResult) {
                                self.$snotify({
                                    title: self.$t(
                                        'v2.admin.validateFail'
                                    ),
                                    type: 'warn',
                                    duration: 120000,
                                    text: err.defaultDescription,
                                    actionBtns: [
                                        {
                                            text: self.$t(
                                                'v2.admin.goToElement'
                                            ),
                                            icon: 'mdi-send-check',
                                            action: (close) => {
                                                let symperBpmn =
                                                    self.$refs.symperBpmn;
                                                let errEl =
                                                    symperBpmn.getElData(
                                                        err.activityId
                                                    );
                                                symperBpmn.bpmnModeler
                                                    .get('selection')
                                                    .select(errEl);
                                                self.handleNodeSelected(
                                                    errEl.businessObject
                                                );
                                                close();
                                            }
                                        }
                                    ]
                                });
                            }
                            reject({
                                title: self.$t('v2.admin.validateFailNoti')
                            });
                        }
                    })
                    .catch((err) => {
                        self.$snotifyError(
                            err,
                            self.$t('v2.admin.validateDeployDataErr')
                        );
                    });
            });
        },
        /**
         * Validate toàn bộ data của model
         * @param {Function} success hành động khi validate và ko phát hiện ra lỗi
         * @param {Function} fail hành động khi có lỗi xảy ra
         */
        validateModel(success, fail) {
            let self = this;
            let checkArr = [
                this.checkModelName(),
                this.validateDeployData(),
                this.checkValStatus()
            ];
            Promise.all(checkArr)
                .then((rsl) => {
                    if (typeof success == 'function') {
                        success();
                    }
                })
                .catch((err) => {
                    console.warn(err, 'err on validating model!!');
                    self.$snotify({
                        type: 'error',
                        title: err.title,
                        message: err.message ? err.message : ''
                    });

                    if (typeof fail == 'function') {
                        fail();
                    }
                });
        },
        /**
         * check validateStatus
         */
        checkValStatus() {
            let self = this;
            let isCheck = true;
            let arrError;
            return new Promise((resolve, reject) => {
                let allElements = this.stateAllElements;
                for (let i in allElements) {
                    let items = allElements[i].attrs;
                    for (let j in items) {
                        if (
                            items[j] &&
                            items[j].validateStatus &&
                            items[j].validateStatus.isValid == false
                        ) {
                            isCheck = false;
                            self.$snotifyError(
                                {},
                                self.$t('v2.admin.errWhenValidate'),
                                self.$t('v2.admin.errAtNode') +
                                    allElements[i].id +
                                    ', property ' +
                                    items[j].title +
                                    ' with detail:' +
                                    items[j].validateStatus.message
                            );
                        }
                    }
                }
                if (!isCheck) {
                    reject({
                        type: self.$t('v2.admin.errValidateStatus'),
                        title: self.$t('v2.admin.errWhenValidate'),
                        message: self.$t('v2.admin.error')
                    });
                } else {
                    resolve();
                }
            });
        },
        /**
         * Kiểm tra định danh của model: đã có hay chưa? có bị trùng định danh ko
         */
        checkModelName() {
            let self = this;
            return new Promise((resolve, reject) => {
                let modelAttr = self.getModelData();
                if (!modelAttr.name) {
                    reject({
                        type: 'emptyModelName',
                        title: self.$t('v2.admin.emptyModelName')
                    });
                } else {
                    resolve();
                }

                if (!modelAttr.key) {
                    reject({
                        type: 'emptyModelKey',
                        title: self.$t('v2.admin.emptyModelKey')
                    });
                } else if (
                    modelAttr.name == modelAttr.key ||
                    modelAttr.name == null
                ) {
                    // khi không điền tên quy trình thì name đc gán bằng key -> bắn lôĩ
                    reject({
                        type: 'emptyModelName',
                        title: self.$t('v2.admin.emptyModelName')
                    });
                }
                {
                    resolve();
                }
            });
        },
        // Lấy thông tin cấu hình của model
        getModelData() {
            let modelAttr;
            let allNodes = this.stateAllElements;
            for (let id in allNodes) {
                if (allNodes[id].type == 'BPMNDiagram') {
                    modelAttr = allNodes[id];
                    break;
                }
            }

            // update thuộc tính của panel setting cho phần hiển thị
            let vizBizEl = this.$refs.symperBpmn.updateElementProperties(
                modelAttr.id,
                {
                    isExecutable: modelAttr.attrs.isexecutable.value
                }
            );
            modelAttr = modelAttr.attrs;
            // if (!modelAttr.name.value) {
            //     modelAttr.name.value = modelAttr.process_id.value;
            // }
            return {
                name: modelAttr.name.value,
                key: modelAttr.process_id.value,
                description: modelAttr.documentation.value,
                modelType: 0
            };
        },
        /**
         * Thêm data trong state cho các node chưa có state
         * do không bắt được sự kiện khi tạo mới một element của thư viện nên khi click vào một node thì mới tạo data cho node đó trong state
         *
         */
        fillNodeData() {
            let allBNodes = this.$refs.symperBpmn.getAllNodes();
            let nodeType = '';
            let allBNodesMap = {};
            let allNodes = this.stateAllElements;
            // Dựng thuộc tính cho từng node
            for (let bnode of allBNodes) {
                // bnode là viết tắt của businessObject node data
                allBNodesMap[bnode.id] = bnode;
                nodeType = this.getNodeType(bnode);
                if (!allNodes[bnode.id]) {
                    this.createNodeData(bnode.id, nodeType);
                }
                let nodeData = allNodes[bnode.id];
                if (!nodeData.attrs.name.value && nodeType == 'UserTask') {
                    // Nếu user task chưa có name thì tự động thêm name vào cho node đó
                    if (nodeData.attrs.overrideid) {
                        nodeData.attrs.name.value =
                            nodeData.attrs.overrideid.value;
                    } else if (nodeData.attrs.process_id) {
                        nodeData.attrs.name.value =
                            nodeData.attrs.process_id.value;
                    }
                }
            }

            // Loại bỏ data của các node mà ko có trong diagram
            for (let id in allNodes) {
                if (!allBNodesMap[id]) {
                    this.$delete(allNodes, id);
                }
            }
        },
        getModelDataForSymperService() {
            let allVizEls = this.$refs.symperBpmn.getAllNodes(false);
            let allSymEls = this.stateAllElements;
            let bpmnModeler = this.$refs.symperBpmn.bpmnModeler;
            collectInfoForTaskDescription(allVizEls, allSymEls, bpmnModeler);
            pushCustomElementsToModel(allVizEls, allSymEls, bpmnModeler);
            for (let el of allVizEls) {
                if (el.businessObject.$type == 'bpmn:Task') {
                    this.$refs.symperBpmn.changeTaskNodeToUserTaskNode(el.id);
                }
            }
            let xml = this.$refs.symperBpmn.getXML();
            xml = this.standardXMLToSave(xml);
            let jsonConfig = {};
            for (let elName in allSymEls) {
                jsonConfig[elName] = {};
                for (let attrName in allSymEls[elName].attrs) {
                    if (attrName != 'idNode') {
                        let attr = allSymEls[elName].attrs[attrName];
                        if (attr) {
                            jsonConfig[elName][attrName] = attr.getValue(
                                attr.value
                            );
                        }
                    }
                }
            }
            let modelDataAsFlowable = this.getModelData();
            return {
                name: modelDataAsFlowable.name,
                content: xml,
                description: modelDataAsFlowable.description,
                version: 1,
                configValue: JSON.stringify(jsonConfig),
                processKey: modelDataAsFlowable.key
            };
        },
        standardXMLToSave(xml) {
            // &lt;![CDATA[pppppppppppppppppppp]]&gt;
            xml = xml.replace(/\&lt\;\!\[CDATA\[/g, '<![CDATA[');
            xml = xml.replace(/\]\]\&gt;/g, ']]>');
            xml = xml.replace(
                /&lt;symper:symper_symper_string_tag&gt;/g,
                '<symper:symper_symper_string_tag>'
            );
            xml = xml.replace(
                /&lt;\/symper:symper_symper_string_tag&gt;/g,
                '</symper:symper_symper_string_tag>'
            );
            xml = xml.replace(
                /&lt;symper:symper_symper_expression_tag&gt;/g,
                '<symper:symper_symper_expression_tag>'
            );
            xml = xml.replace(
                /&lt;\/symper:symper_symper_expression_tag&gt;/g,
                '</symper:symper_symper_expression_tag>'
            );
            return xml;
        },
        /**
         * Lưu lại các thuộc tính được set qua việc tương tác trực tiếp với các thành phần trong diagram vào trong store
         * Do khi tương tác qua diagram thì có một số thuộc tính chạy theo không được update lại nên cần bước này để khớp được data hiển thị và data bên dưới
         */
        updateViewDataToState() {
            for (let elName in this.stateAllElements) {
                let el = this.stateAllElements[elName];
                if (el.type.includes('Gateway')) {
                    this.setFlowsOrderForGateway(el);
                }
            }
        },
        // Lưu lại data của process model hiện tại
        async updateModelToSymperService() {
            let modelData = this.getModelDataForSymperService();
            if (modelData.content) {
                try {
                    let res = await bpmnApi.updateModel(
                        modelData,
                        this.modelId
                    );
                    if (res.status == 200) {
                        this.$snotifySuccess(
                            this.$t('v2.admin.updateModelSuccess')
                        );
                    } else {
                        this.$snotifyError(
                            res,
                            this.$t('v2.admin.updateModelFail')
                        );
                    }
                } catch (error) {
                    this.$snotifyError(
                        error,
                        this.$t('v2.admin.updateModelFail')
                    );
                }
            }
        },
        // update data của model và data của tất cả các element trong model lên server (backend flowable)
        updateModel(idModel) {
            let allEleData = this.getAllElementData();
            console.log(allEleData, 'allEleData', this.stateAllElements);
            let self = this;
            allEleData.modelId = idModel;
            let diData = {
                modeltype: 'model',
                json_xml: JSON.stringify(allEleData),
                name: allEleData.properties.name,
                key: allEleData.properties.process_id,
                description: allEleData.properties.documentation,
                newversion: false,
                comment: '',
                // lastUpdated: new Date().toISOString().replace("Z", "+0000")
                lastUpdated: self.lastUpdated
                    ? self.lastUpdated
                    : new Date().toISOString().replace('Z', '+0000') // chỗ này đang lách qua việc validate của backend. cần xem lại
            };
            bpmnApi
                .updateModel(diData, idModel)
                .then((res) => {
                    self.$snotifySuccess(
                        self.$t('v2.admin.saveProcessModelSuccess')
                    );
                    self.lastUpdated = res.lastUpdated;
                })
                .catch((err) => {
                    self.$snotifyError(
                        err,
                        self.$t('v2.admin.saveProcessModelFail')
                    );
                });
        },

        fillValueForHiddenServiceTaskAttr(nodeId, serviceTaskType = '') {
            let sNodeAttrs = this.stateAllElements[nodeId];
            if (!serviceTaskType) {
                serviceTaskType = sNodeAttrs.attrs.serviceTaskType.value;
            }
            let seletedType = serviceTaskDefinitions[serviceTaskType];
            for (let key in seletedType.params) {
                let attr = sNodeAttrs.attrs['httptask' + key.toLowerCase()];
                if (attr) {
                    attr.value = seletedType.params[key];
                }
            }
        },

        /**
         * Lấy dữ liệu của tất cả các node dưới dạng json để gửi về server lưu
         * @returns {Object} chứa data của process và thông tin của tất cả các node trong nó
         */
        getAllElementData() {
            /**
             * Một số quy tắc lưu của flowable:
             * 1. Tất cả các mũi tên (sequence flow) đều thuộc childShapes của BPMNDiagram chứ ko thuộc về thằng cha của mũi tên đó
             */
            let allBNodes = this.$refs.symperBpmn.getAllNodes();

            let di; // object chứa thông tin của diagram
            let nodeType = '';
            let mapSaveNodes = {};

            // Dựng thuộc tính cho từng node
            for (let bnode of allBNodes) {
                // bnode là viết tắt của businessObject node data
                nodeType = this.getNodeType(bnode);
                let nodeData;
                if (nodeType == 'BPMNDiagram') {
                    nodeData = util.cloneDeep(nodeDataTpl);
                    di = nodeData;
                    di.stencilset = {
                        namespace: 'https://symper.org/stencilset/bpmn2.0#',
                        url: '../editor/stencilsets/bpmn2.0/bpmn2.0.json'
                    };
                } else {
                    if (nodeType == 'SequenceFlow') {
                        nodeData = this.getSaveDataForSequenceFlow(bnode);
                    } else {
                        nodeData = util.cloneDeep(nodeDataTpl);
                        nodeData.bounds = this.getNodeBounds(bnode);
                        nodeData.dockers = [];
                        nodeData.outgoing = [];

                        if (nodeType == 'ServiceTask') {
                            this.fillValueForHiddenServiceTaskAttr(bnode.id);
                        } else if (nodeType == 'ScriptTask') {
                            this.fillValueForHiddenServiceTaskAttr(
                                bnode.id,
                                'script'
                            );
                        }
                    }

                    nodeData.resourceId = bnode.id;
                }
                nodeData.properties = this.getNodeProperties(bnode.id, false);
                nodeData.stencil.id = nodeType; // flowable quy định loại node nằm trong nodeData.stencil.id

                if (
                    nodeData.stencil.id == 'ServiceTask' ||
                    nodeData.stencil.id == 'ScriptTask'
                ) {
                    nodeData.stencil.id = 'HttpTask';
                }
                mapSaveNodes[bnode.id] = nodeData;
            }

            // tạo outgoing cho các node là  gốc của mũi tên
            for (let bnode of allBNodes) {
                if (bnode.sourceRef) {
                    let nodeData = mapSaveNodes[bnode.sourceRef.id];
                    if (!nodeData.outgoing) {
                        nodeData.outgoing = [];
                    }
                    nodeData.outgoing.push({ resourceId: bnode.id });
                }
            }
            this.translateToTreeData(di, allBNodes, mapSaveNodes);
            return di;
        },
        translateToTreeData(di, allBNodes, mapSaveNodes) {
            let bnodeRoot = {};
            for (let bnode of allBNodes) {
                let nodeType = this.getNodeType(bnode);
                if (nodeType == 'BPMNDiagram') {
                    bnodeRoot = bnode;
                } else if (nodeType == 'SequenceFlow') {
                    if (!mapSaveNodes[bnode.id]) {
                    }
                    di.childShapes.push(mapSaveNodes[bnode.id]); // theo quy tắc 1 của flowable về lưu SequenceFlow
                }
            }

            if (bnodeRoot.$type == 'bpmn:Collaboration') {
                for (let pool of bnodeRoot.participants) {
                    let poolToSave = mapSaveNodes[pool.id];
                    if (!poolToSave) {
                    }
                    di.childShapes.push(poolToSave);
                    poolToSave.properties.process_id = poolToSave.properties
                        .process_id
                        ? poolToSave.properties.process_id
                        : poolToSave.properties.overrideid;
                    if (pool.processRef.laneSets) {
                        // thêm các con cho các lane
                        for (let lane of pool.processRef.laneSets[0].lanes) {
                            if (!mapSaveNodes[lane.id]) {
                            }
                            poolToSave.childShapes.push(mapSaveNodes[lane.id]);
                            this.addChildrenForProcess(
                                mapSaveNodes[lane.id],
                                lane.flowNodeRef,
                                mapSaveNodes
                            );
                        }
                    } else {
                        //tự Tạo một đối tượng lane mới do thư viện ko tạo trước
                        let newId = 'symper_auto_lane_' + Date.now();
                        let laneState = this.createNodeData(newId, 'Lane');
                        let laneToSave = util.cloneDeep(nodeDataTpl);
                        laneToSave.stencil.id = 'Lane';
                        laneToSave.resourceId = newId;
                        laneToSave.dockers = [];
                        laneToSave.outgoing = [];
                        laneToSave.properties =
                            this.getNodeProperties(laneState);
                        laneToSave.bounds = this.getNodeBounds(pool);
                        laneToSave.bounds.upperLeft.x += 30;
                        mapSaveNodes[pool.id].childShapes.push(laneToSave);
                        this.addChildrenForProcess(
                            laneToSave,
                            pool.processRef.flowElements,
                            mapSaveNodes
                        );
                    }
                }
            } else if (bnodeRoot.$type == 'bpmn:Process') {
                this.addChildrenForProcess(
                    di,
                    bnodeRoot.flowElements,
                    mapSaveNodes
                );
            }
        },
        addChildrenForProcess(di, bEls, mapSaveNodes) {
            for (let bel of bEls) {
                if (bel.$type != 'bpmn:SequenceFlow' && mapSaveNodes[bel.id]) {
                    di.childShapes.push(mapSaveNodes[bel.id]);
                    if (bel.$type == 'bpmn:SubProcess') {
                        this.addChildrenForProcess(
                            mapSaveNodes[bel.id],
                            bel.flowElements,
                            mapSaveNodes
                        );
                    }
                }
            }
        },
        getDefaultDocker(bnode) {
            let allNodes = this.stateAllElements;
            let startNode = allNodes[bnode.sourceRef.id];
            let endNode = allNodes[bnode.targetRef.id];

            return [
                nodeAttrsDefinition[startNode.type].docker,
                nodeAttrsDefinition[endNode.type].docker
            ];
        },
        // Lấy các dữ liệu của sequence flow
        getSaveDataForSequenceFlow(bnode) {
            let nodeData = util.cloneDeep(nodeDataTpl);
            let defaultDockers = this.getDefaultDocker(bnode);
            nodeData.stencil.id = 'SequenceFlow';
            nodeData.resourceId = bnode.id;

            nodeData.outgoing = [
                {
                    resourceId: bnode.targetRef.id
                }
            ];
            nodeData.target = {
                resourceId: bnode.targetRef.id
            };
            nodeData.properties = this.getNodeProperties(bnode.id);
            nodeData.bounds = this.getNodeBounds(bnode);

            nodeData.dockers = defaultDockers;
            if (bnode.di.waypoint.length > 2) {
                let dockers = bnode.di.waypoint.filter((ele, idx, arr) => {
                    return idx > 0 && idx < arr.length - 1;
                });
                dockers.unshift(defaultDockers[0]);
                dockers.push(defaultDockers[1]);
                nodeData.dockers = dockers;
            }
            return nodeData;
        },
        getNodeBounds(bnode) {
            let wp = bnode.di.waypoint;

            if (!wp) {
                let bounds = bnode.di.bounds;
                wp = [
                    {
                        x: bounds.x + bounds.width,
                        y: bounds.y + bounds.height
                    },
                    {
                        x: bounds.x,
                        y: bounds.y
                    }
                ];
            }

            return {
                lowerRight: {
                    x: wp[0].x,
                    y: wp[0].y
                },
                upperLeft: {
                    x: wp[1].x,
                    y: wp[1].y
                }
            };
        },
        addBPMNLoopAttr(props, idNode) {
            let vizNodeData = this.$refs.symperBpmn.getElData(idNode);
            if (vizNodeData) {
                let bizData = vizNodeData.businessObject;
                if (bizData.hasOwnProperty('loopCharacteristics')) {
                    if (bizData.loopCharacteristics.isSequential) {
                        props.multiinstance_type = 'Sequential';
                    } else {
                        props.multiinstance_type = 'Parallel';
                    }
                }
            }
            return props;
        },
        getNodeProperties(nodeInfo, includeSymperAttr = false) {
            let props = {};
            let sNodeAttrs = {};
            if (typeof nodeInfo == 'string') {
                sNodeAttrs = this.stateAllElements[nodeInfo];
            } else if (typeof nodeInfo == 'object' && nodeInfo.attrs) {
                sNodeAttrs = nodeInfo;
            } else {
                console.error(
                    'node info not match type Object or String',
                    nodeInfo
                );
            }

            for (let key in sNodeAttrs.attrs) {
                if (!includeSymperAttr) {
                    if (
                        !allNodesAttrs[key] ||
                        (allNodesAttrs[key] && allNodesAttrs[key].isSymperProp)
                    ) {
                        continue;
                    }
                }
                let attr = sNodeAttrs.attrs[key];
                if (attr) {
                    if (allNodesAttrs[key]) {
                        if (allNodesAttrs[key].hasOwnProperty('getValue')) {
                            props[key] = allNodesAttrs[key].getValue(
                                attr.value
                            );
                            if (allNodesAttrs[key].needReformatValue) {
                                props[key] = reformatValueToStr(attr.value);
                            }
                        } else {
                            props[key] = attr.value ? attr.value : '';
                        }
                    } else {
                        console.warn(
                            key + ' not found in allNodesAttrs',
                            key,
                            allNodesAttrs
                        );
                    }
                } else {
                    console.warn(
                        key + ' not found in attrs',
                        key,
                        sNodeAttrs.attrs
                    );
                }
            }
            props = this.addBPMNLoopAttr(props, sNodeAttrs.id);
            return props;
        },
        /**
         * Khôi phục lại dữ liệu được lưu ở server thành dữ liệu có thể sử dụng trong state để thao tác
         * @param {Object} processData data của process và thông tin của tất cả các node trong nó mà đã được lưu ở server
         */
        restoreSavedData(processData) {},
        /**
         *  Lấy ra tên của node dựa vào dữ liệu của node đó trong  bpmn modeller
         * @param {Object} nodeData data của node trong thư viện bpmn-js
         * @returns {String} tên của node sau khi đã tính toán
         */
        getNodeType(nodeData) {
            let nodeType = nodeData.$type
                .replace('bpmn:', '')
                .replace('Intermediate', '');
            if (nodeType.includes('Event') && nodeData.eventDefinitions) {
                let evtType = nodeData.eventDefinitions[0].$type.replace(
                    'bpmn:',
                    ''
                );
                evtType = evtType.replace('Definition', '');
                nodeType = nodeType.replace('Event', '');
                nodeType = nodeType + evtType;
            } else if (
                nodeType == 'bpmn:SubProcess' &&
                nodeData.triggeredByEvent
            ) {
                nodeType = 'EventSubProcess';
            }

            nodeType = mapLibNameToFlowableName[nodeType]
                ? mapLibNameToFlowableName[nodeType]
                : nodeType;
            return nodeType;
        },
        handleNodeChangeProps(nodeData) {
            let nodeId = nodeData.id;
            let nodeState = this.stateAllElements[nodeId];
            let newType = this.getNodeType(nodeData);
            console.log(newType, nodeData);

            if (nodeState) {
                if (newType != nodeState.type) {
                    this.changeNodeType(nodeState, newType);
                }
                nodeState.name = nodeData.name;
                nodeState.attrs.name.value = nodeData.name;

                if (nodeId == this.selectingNode.id) {
                    this.$store.commit('process/changeSelectingNode', {
                        instanceKey: this.instanceKey,
                        data: nodeState
                    });
                }

                if (nodeData.hasOwnProperty('text')) {
                    nodeState.attrs.text.value = nodeData.text;
                }
            }
        },

        /**
         * Thay đổi loại node
         * @param {Object} nodeState Object chứa state của node cần thay đổi (data của node cũ)
         * @param {String} newType Loại node mới cần đổi
         */
        changeNodeType(nodeState, newType) {
            let newNodeData = this.createNodeData(nodeState.id, newType);
            for (let attrName in newNodeData.attrs) {
                if (nodeState.attrs[attrName]) {
                    newNodeData.attrs[attrName].value =
                        nodeState.attrs[attrName].value;
                }
            }
            this.$store.commit('process/addNewNode', {
                instanceKey: this.instanceKey,
                data: newNodeData
            });
        },
        checkDuplicateNodeId(newId) {
            let currentNodeId = this.selectingNode.id;
            if (currentNodeId == newId) {
                return false;
            } else {
                if (this.stateAllElements.hasOwnProperty(newId)) {
                    this.$snotifyError(
                        {},
                        this.$t('v2.admin.duplicateElementIdErr'),
                        this.$t('v2.admin.inputOtherId')
                    );
                    return true;
                } else {
                    return false;
                }
            }
        },
        /** Xử lý các sự kiện khi có sự thay đổi giá trị của các input trong panel cấu hình bên phải
         * data là giá trị sau thay đổi của một input trong formtpl
         *  **/
        handleAttrValueChanged(name, inputInfo, data) {
            let type = this.selectingNode.type;
            let typeData = nodeAttrsDefinition[type];
            let attrs = this.selectingNode.attrs;
            let reApplyToView = {
                name: 'name',
                process_id: 'id',
                overrideid: 'id',
                text: 'text'
            };

            if (name == 'overrideid' || name == 'process_id') {
                let newId = util.str.nonAccentVietnamese(attrs[name].value);
                let isDuplicated = this.checkDuplicateNodeId(newId);
                if (isDuplicated) {
                    inputInfo.value = this.selectingNode.id;
                    return;
                } else {
                    attrs[name].value = newId;
                }
            }

            if (typeData.checkShowOrHideInput) {
                typeData.checkShowOrHideInput(attrs);
            }

            if (typeData.validate) {
                typeData.validate(attrs);
            }

            if (typeData.specificHandler) {
                typeData.specificHandler(attrs, data, name);
            }

            if (reApplyToView[name]) {
                let applyValue = {};
                applyValue[reApplyToView[name]] = inputInfo.value;
                this.$refs.symperBpmn.updateElementProperties(
                    this.selectingNode.id,
                    applyValue
                );
            }

            if (
                name == 'approvalForElement' ||
                name == 'serviceNotificationActionForElement'
            ) {
                this.setEditableControlsForNode(
                    this.selectingNode,
                    this.stateAllElements[data.value]
                );
            }

            if (name == 'overrideid' || name == 'process_id') {
                let oldId = this.selectingNode.id;
                let newId = attrs[name].value;
                this.reAssignIdForSelectedNode(oldId, newId);
                this.selectingNode.id = newId; // đặt lại id cho thông tin của node
                // Thay key của node cũ trong state bằng id của node mới
                this.$delete(this.stateAllElements, oldId);
                this.$set(this.stateAllElements, newId, this.selectingNode);
            }

            // Nếu set formreference cho StartNoneEvent thì đặt các lựa chọn control để làm business key
            if (
                this.selectingNode.type == 'StartNoneEvent' &&
                name == 'formreference'
            ) {
                this.setControlsForBizKey(inputInfo.value);
            }
            // set documentId cho selectDefaultControlDocument để cấu hình điền sẵn các giá trị mặc định cho document
            if (
                this.selectingNode.type == 'UserTask' &&
                this.selectingNode.attrs.taskAction.value == 'submit' &&
                name == 'formreference'
            ) {
                this.selectingNode.attrs.selectDefaultControlDocument.docId =
                    data.value;
            }
        },

        /**
         * Thay đổi giá trị của id cho các node có attr cần lựa chọn dùng tới node nào.
         * VD: approvalForElement, updateForElement ...
         */
        reAssignIdForSelectedNode(oldId, newId) {
            let needReassignAttrName = {
                approvalForElement: true,
                updateForElement: true,
                serviceNotificationActionForElement: true
            };

            for (let nodeId in this.stateAllElements) {
                let node = this.stateAllElements[nodeId];
                for (let needCheck in needReassignAttrName) {
                    if (
                        node.attrs[needCheck] &&
                        node.attrs[needCheck].value == oldId
                    ) {
                        node.attrs[needCheck].value = newId;
                    }
                }
            }
        },
        async setControlsForBizKey(docId) {
            try {
                if (!docId) {
                    return;
                }
                let docDetail = await documentApi.detailDocument(docId);
                let controls = Object.values(docDetail.data.fields).reduce(
                    (arr, el, idx) => {
                        arr.push({
                            id: el.properties.name,
                            title: el.properties.title
                        });
                        return arr;
                    },
                    []
                );
                this.controlsForBizKey = controls;
            } catch (error) {
                this.$snotifyError(
                    error,
                    this.$t('v2.admin.getDetailDataOfDocFail') + docId
                );
            }
        },
        /**
         * Lấy dữ liệu của một node dựa theo nodeId.
         * Nếu không tìm thấy nodeId này trong state thì tạo các thuộc tính dựa theo loại node (nodeType)
         */
        getNodeData(nodeId, nodeType) {
            let nodeData = this.stateAllElements[nodeId];
            if (!nodeData) {
                nodeData = this.createNodeData(nodeId, nodeType);
            }
            return nodeData;
        },

        /**
         * Tạo data cho một node và lưu vào state
         * @param {String} nodeId id của node cần lưu
         * @param {String} nodeType Loại node: user task, ...
         * @param {String} marker marker cho node
         */
        createNodeData(nodeId, nodeType, marker = '') {
            let nodeData = {
                id: nodeId,
                marker: marker,
                type: nodeType,
                attrs: getNodeAttrs(nodeType)
            };

            if (nodeData.attrs.overrideid) {
                nodeData.attrs.overrideid.value = nodeId;
            }

            this.$store.commit('process/addNewNode', {
                instanceKey: this.instanceKey,
                data: nodeData
            });
            return nodeData;
        },
        /**
         * Xử lý sự kiện khi người dùng click vào một node
         */
        handleNodeSelected(node) {
            let type = this.getNodeType(node);
            let wp = node.di.waypoint;

            let nodeData = this.getNodeData(node.id, type);
            nodeData.name = node.name;
            nodeData.attrs.name.value = node.name; // gán lại name từ di node
            if (nodeData.attrs.process_id) {
                // gán lại id từ di node
                nodeData.attrs.process_id.value = node.id;
            }

            if (nodeData.attrs.overrideid) {
                // gán lại id từ di node
                nodeData.attrs.overrideid.value = node.id;
            }
            this.$store.commit('process/changeSelectingNode', {
                instanceKey: this.instanceKey,
                data: nodeData
            });
            if (nodeData.type == 'UserTask') {
                this.setTaskActionableNodes(nodeData, 'approvalForElement');
                this.setTaskActionableNodes(nodeData, 'updateForElement');
                if (
                    nodeData.attrs.taskAction.value == 'submit' &&
                    nodeData.attrs.formreference.value
                ) {
                    this.selectingNode.attrs.selectDefaultControlDocument.docId =
                        nodeData.attrs.formreference.value;
                }
            } else if (nodeData.type == 'BPMNDiagram') {
                nodeData.attrs.controlsForBizKey.options =
                    this.controlsForBizKey;
            } else if (nodeData.type.includes('Gateway')) {
                this.setFlowsOrderForGateway(nodeData);
            } else if (nodeData.type == 'CallActivity') {
                this.setItemForSelectProcessModel();
            } else if (nodeData.type == 'ServiceTask') {
                this.setTaskActionableNodes(
                    nodeData,
                    'serviceNotificationActionForElement',
                    'serviceTask'
                );
            }
        },
        setItemForSelectProcessModel() {
            this.selectingNode.attrs.callactivitycalledelement.options =
                this.$store.state.process.allProcessModel;
        },
        setFlowsOrderForGateway(nodeData) {
            let outFlows = [];
            let bizNodeData = this.$refs.symperBpmn.getElData(
                nodeData.id
            ).businessObject;
            let diOutFlowsMap = {};
            let needUpdate = false;
            let dataFlows = nodeData.attrs.sequencefloworder.value;
            for (let flow of bizNodeData.outgoing) {
                let newItem = {
                    text: flow.name ? flow.name : flow.id,
                    idFlow: flow.id
                };
                outFlows.push(newItem);
                diOutFlowsMap[flow.id] = newItem;
            }

            // Nếu độ dài trước và sau khác nhau thì chắc chắn cần update
            if (dataFlows.length != outFlows.length) {
                needUpdate = true;
            } else {
                // Nếu độ dài khác nhau, xét xem các id có trùng hết ko, nếu ko trùng hết thì cần update lại
                for (let flow of dataFlows) {
                    if (!diOutFlowsMap[flow.idFlow]) {
                        needUpdate = true;
                        break;
                    }
                }
            }

            // Nếu ko cần update thì sửa lại text hiển thị của các flow
            if (!needUpdate) {
                for (let flow of dataFlows) {
                    flow.text = diOutFlowsMap[flow.idFlow].text;
                }
            }

            if (needUpdate) {
                nodeData.attrs.sequencefloworder.value = outFlows;
            }
        },
        /**
         * Tìm các node ở trước node hiện tại để có thể duyệt, phục vụ cho việc select node cần duyệt: approvalForElement
         * // tham số object để check trường hợp là services task thì sẽ tìm cả node duyệt và node submit
         */
        setTaskActionableNodes(
            nodeData,
            attrName = 'approvalForElement',
            object = ''
        ) {
            let allEls = this.$refs.symperBpmn.getAllNodes();
            let currBizNode = {};
            let submitTasks = [];

            allEls
                .filter((el, idx) => {
                    if (el.$type == 'bpmn:SequenceFlow') {
                        return true;
                    } else {
                        el.symper_link_next = {}; // danh sách các id các node tiếp theo mà node này được linh tới
                        el.symper_link_prev = {}; // danh sách các id các node link tới node này
                        if (el.id == nodeData.id) {
                            currBizNode = el;
                        }
                        return false;
                    }
                })
                .forEach((el) => {
                    el.sourceRef.symper_link_next[el.targetRef.id] = true;
                    el.targetRef.symper_link_prev[el.sourceRef.id] = true;
                });
            let searchedNodeMap = {};
            let nodeToFind = this.findSubmitTasksFromNode(
                submitTasks,
                currBizNode,
                searchedNodeMap,
                object
            );
            nodeData.attrs[attrName].options = submitTasks;
            if (submitTasks.length == 0) {
                // nếu ko có node nào là ứng cử viên thì đặt giá trị về rỗng
                nodeData.attrs[attrName].value = '';
            } else if (!nodeData.attrs[attrName].value) {
                // Tự động chọn phần tử đầu tiên làm giá trị
                nodeData.attrs[attrName].value = submitTasks[0].id;
                this.setEditableControlsForNode(
                    nodeData,
                    submitTasks[0].nodeData
                );
            }
        },
        // Tìm từ node hiện tại về node đầu để ra các node là submit task
        findSubmitTasksFromNode(
            result,
            currBizNode,
            searchedNodeMap,
            object = ''
        ) {
            let nodeData = this.stateAllElements[currBizNode.id];

            if (searchedNodeMap[currBizNode.id] || !nodeData) {
                return;
            }
            // Nếu là UserTask và là submit hoặc là node bắt đầu quy trình và có form submit
            // check trường hợp có tham số object, nếu object=servicesTask thì sẽ tìm các node duyệt và submit
            if (object == '') {
                if (
                    (nodeData &&
                        nodeData.type == 'UserTask' &&
                        nodeData.attrs.taskAction.value == 'submit') ||
                    //if(nodeData && nodeData.type == 'UserTask' ||
                    (nodeData.type == 'StartNoneEvent' &&
                        nodeData.attrs.formreference.value)
                ) {
                    result.push({
                        id: nodeData.id,
                        title: currBizNode.name,
                        nodeData: nodeData
                    });
                    searchedNodeMap[nodeData.id] = true;
                } else {
                    searchedNodeMap[nodeData.id] = true;
                }
            } else if (object == 'serviceTask') {
                if (
                    (nodeData && mappNodeActivity[nodeData.type]) ||
                    (nodeData.type == 'StartNoneEvent' &&
                        nodeData.attrs.formreference.value)
                ) {
                    result.push({
                        id: nodeData.id,
                        title: currBizNode.name,
                        nodeData: nodeData
                    });
                    searchedNodeMap[nodeData.id] = true;
                } else {
                    searchedNodeMap[nodeData.id] = true;
                }
            }

            for (let id in currBizNode.symper_link_prev) {
                let prevNode = this.$refs.symperBpmn.getElData(id);
                this.findSubmitTasksFromNode(
                    result,
                    prevNode.businessObject,
                    searchedNodeMap,
                    object
                );
                searchedNodeMap[id] = true;
            }
        },
        /**
         * Xử lý các hành động khi người dùng click vào các nút ở header của editor (zoom, focus, validate ... )
         *
         */
        handleHeaderAction(ac) {
            if (ac == 'validate') {
                let self = this;
                this.fillNodeData();
                this.validateModel(() => {
                    self.$snotifySuccess(
                        self.$t('v2.admin.validationPassed')
                    );
                });
            } else {
                this.$refs.symperBpmn[ac]();
            }
        },
        /**
         * Lấy data từ server và áp dụng data này để hiển thị lên process
         */
        async applySavedData(idProcess) {
            try {
                let modelData = await bpmnApi.getModelData(idProcess);
                modelData = modelData.data;
                let xml = cleanXMLBeforeRenderInEditor(modelData.content);
                let afterRender = await this.$refs.symperBpmn.renderFromXML(
                    xml
                );
                if (modelData.configValue) {
                    this.restoreAttrValueFromJsonConfig(modelData.configValue);
                    this.$refs.symperBpmn.focus();
                }
            } catch (error) {
                this.$snotifyError(
                    error,
                    this.$t('process.editror.err.get_xml')
                );
            }
        },

        restoreAttrValueFromJsonConfig(jsonStr) {
            let processTracking =
                this.$store.state.admin.currentTrackingProcess;
            let self = this;
            let symBpmn = this.$refs.symperBpmn;
            let configValue = JSON.parse(jsonStr);
            this.fillNodeData();
            let gatewayEls = [];
            let formKeyToNodeIdMap = {};
            for (let elName in self.stateAllElements) {
                let el = self.stateAllElements[elName];
                if (el.type.includes('Task')) {
                    //== "UserTask" || el.type == "ScriptTask"
                    if (processTracking) {
                        processTracking.forEach(function (e) {
                            if (e.act_id_ == el.id) {
                                //lam o day
                                symBpmn.updateElementProperties(el.id, {
                                    countEnd: e.count_end,
                                    countRunning: e.count_running
                                });
                            }
                        });
                    }
                }
                if (configValue[elName]) {
                    for (let attrName in el.attrs) {
                        if (configValue[elName].hasOwnProperty(attrName)) {
                            if (
                                allNodesAttrs[attrName].hasOwnProperty(
                                    'restoreData'
                                )
                            ) {
                                el.attrs[attrName].value = allNodesAttrs[
                                    attrName
                                ].restoreData(configValue[elName][attrName]);
                            } else {
                                el.attrs[attrName].value =
                                    configValue[elName][attrName];
                            }
                        } else {
                        }
                    }
                } else {
                }

                if (el.type.includes('Gateway')) {
                    this.setFlowsOrderForGateway(el);
                }

                if (!nodeAttrsDefinition[el.type]) {
                }

                if (nodeAttrsDefinition[el.type].checkShowOrHideInput) {
                    nodeAttrsDefinition[el.type].checkShowOrHideInput(el.attrs);
                }

                if (el.attrs.formreference && el.attrs.formreference.value) {
                    let formKey = el.attrs.formreference.value;
                    if (!formKeyToNodeIdMap[formKey]) {
                        formKeyToNodeIdMap[formKey] = [];
                    }
                    formKeyToNodeIdMap[formKey].push(elName);
                }

                if (
                    el.type.includes('StartNoneEvent') &&
                    el.attrs.formreference.value
                ) {
                    this.setControlsForBizKey(el.attrs.formreference.value);
                }

                if (
                    el.type.includes('UserTask') &&
                    el.attrs.taskAction.value == 'approval'
                ) {
                    this.setEditableControlsForNode(
                        el,
                        this.stateAllElements[el.attrs.approvalForElement.value]
                    );
                }
                if (el.type.includes('ServiceTask')) {
                    this.setEditableControlsForNode(
                        el,
                        this.stateAllElements[
                            el.attrs.serviceNotificationActionForElement.value
                        ]
                    );
                }
            }
            this.setInitItemsForFormReferences(formKeyToNodeIdMap);
        },
        async setInitItemsForFormReferences(map) {
            let self = this;
            try {
                for (let docId in map) {
                    // https://sdocument-management.symper.vn/documents?search=1143
                    let res = await apiCaller.get(
                        appConfigs.apiDomain.sdocumentManagement +
                            'documents?search=' +
                            docId
                    );
                    for (let nodeId of map[docId]) {
                        this.stateAllElements[
                            nodeId
                        ].attrs.formreference.options = res.data.listObject;
                    }
                }
            } catch (err) {
                self.$snotifyError(
                    err,
                    self.$t('v2.admin.canNotSetInitialItem')
                );
            }
        },
        /**
         * Khôi phục lại data của model từ server vào trong state
         * @param {Object} ele data của phần tử được lưu ở server
         */
        restoreSavedEle(ele, rsl) {
            let idEle = ele.resourceId;
            if (ele.modelId) {
                // Nếu đây là phần tử root của cây
                idEle = ele.properties.process_id;
            }
            let eleType = ele.stencil ? ele.stencil.id : 'BPMNDiagram';
            let nodeData = this.createNodeData(idEle, eleType);

            // Khôi phục giá trị cho các thuộc tính của ele này
            if (ele.properties) {
                for (let key in nodeData.attrs) {
                    if (ele.properties.hasOwnProperty(key)) {
                        if (allNodesAttrs[key].hasOwnProperty('restoreData')) {
                            nodeData.attrs[key].value = allNodesAttrs[
                                key
                            ].restoreData(ele.properties[key]);
                        } else {
                            nodeData.attrs[key].value = ele.properties[key];
                        }
                    } else {
                        console.warn(
                            'Not found ' +
                                key +
                                ' in attrs of saved data ele.properties',
                            ele,
                            key
                        );
                    }
                }
                nodeAttrsDefinition[eleType].checkShowOrHideInput(
                    nodeData.attrs
                );
            }

            rsl[idEle] = nodeData;
            // Khôi phục các thuộc tính cho các ele con của ele này
            if (ele.hasOwnProperty('childShapes')) {
                for (let childEle of ele.childShapes) {
                    this.restoreSavedEle(childEle, rsl);
                }
            }
        },

        // tạo id duy nhất cho workflow, và chính là key của workflow
        createUniqueIdentifyForWorkflow() {
            setTimeout(
                (self) => {
                    let allEls = self.$refs.symperBpmn.getAllNodes();
                    for (let el of allEls) {
                        if (el.$type == 'bpmn:Process') {
                            let uniqueId =
                                util.str.randomString(6) + '_' + Date.now();
                            uniqueId = uniqueId.toLowerCase();
                            self.$refs.symperBpmn.updateElementProperties(
                                el.id,
                                {
                                    id: uniqueId
                                }
                            );
                        }
                    }
                },
                500,
                this
            );
        }
    },

    created() {
        let self = this;
        this.instanceKey = Date.now();
        this.$store.commit('process/initInstance', this.instanceKey);
        this.$store.dispatch('app/getAllOrgChartData');
        this.$store.dispatch('process/getLastestProcessDefinition');
        this.$store.dispatch('process/getAllDefinitions');
        this.applySavedData(this.processId);
    },
    mounted() {
        this.resetAttrPanelHeight();
        this.calcDiagramHeight();
        let uniqueId = util.str.randomString(6) + '_' + Date.now();
        console.log(uniqueId.toLowerCase(), 'uniqueIduniqueIduniqueId');

        if (this.action == 'create' || this.action == 'clone') {
            this.createUniqueIdentifyForWorkflow();
        }
    },
    data() {
        return {
            tab: 'tab-1',
            handleAction: '',
            instanceKey: null, // key của instance hiện tại
            attrPannelHeight: '300px', // chiều cao của panel cấu hình các element
            modelAction: 'create', // hành động đối với model này là gì: create | clone | edit
            modelId: '', // Id của model này trong DB
            searchAttrKey: '',
            customRender: [
                {
                    __init__: ['customRenderer'],
                    customRenderer: ['type', CustomRenderProcessCount]
                }
            ],
            diagramHeight: 300,
            headerActions: {
                undo: {
                    icon: 'mdi-undo',
                    text: 'process.header_bar.undo'
                },
                redo: {
                    icon: 'mdi-redo',
                    text: 'process.header_bar.redo'
                },
                zoomIn: {
                    icon: 'mdi-minus-circle-outline',
                    text: 'process.header_bar.zoom_in'
                },
                zoomOut: {
                    icon: 'mdi-plus-circle-outline',
                    text: 'process.header_bar.zoom_out'
                },
                focus: {
                    icon: 'mdi-image-filter-center-focus',
                    text: 'process.header_bar.focus'
                },
                saveSVG: {
                    icon: 'mdi-image-outline',
                    text: 'process.header_bar.save_svg'
                },
                saveXML: {
                    icon: 'mdi-xml',
                    text: 'process.header_bar.save_bpmn'
                },
                validate: {
                    icon: 'mdi-check-bold',
                    text: 'process.header_bar.validate'
                }
            },
            diagramXML: defaultXML.replace(/\n/g, ''),
            customExtension: [
                {
                    name: 'symper',
                    data: customExtension
                }
            ]
        };
    },
    components: {
        'symper-bpmn': SymperBpmn,
        'form-tpl': FormTpl,
        VuePerfectScrollbar,
        CustomRenderProcessCount,
        ModelerWithHeatMap
    },
    props: {
        // Hành động cho editor này, nhận một trong các giá trị: create, edit, view, clone
        action: {
            type: String,
            default: 'view'
        }
    },
    computed: {
        routeName() {
            return this.$getRouteName();
        },
        processId() {
            return this.$store.state.admin.processId;
        },
        selectingNode() {
            return this.$store.state.process.editor[this.instanceKey]
                .selectingNode;
        },
        stateAllElements() {
            return this.$store.state.process.editor[this.instanceKey].allNodes;
        },
        /** Chuyển dạng danh sách attr từ dạng phẳng sang dạng nhóm thành các group để hiển thị **/
        attrGroupView() {
            let currentAtts = this.selectingNode.attrs;
            let groups = {};

            for (let attrName in currentAtts) {
                let attr = currentAtts[attrName];
                if (!attr || attr.hidden) {
                    continue;
                }
                if (!attr) {
                    console.warn(
                        `can not get attr of "${attrName}" in currentAtts`,
                        { currentAtts, attrName }
                    );
                    continue;
                }

                let groupName = attr.dg;
                if (!groups[groupName]) {
                    if (allAttrDisplayGroup[groupName]) {
                        groups[groupName] = {
                            title: allAttrDisplayGroup[groupName].title,
                            items: {}
                        };
                    } else {
                        console.warn(
                            'không tìm thấy định nghĩa của group "' +
                                groupName +
                                '" trong allAttrDisplayGroup',
                            currentAtts,
                            attrName
                        );
                    }
                }
                groups[groupName].items[attrName] = currentAtts[attrName];
            }
            return groups;
        }
    },
    watch: {
        processId(val) {
            this.tab = 'tab-1';
            // this.instanceKey = Date.now();
            // this.$store.commit(
            // 	"process/initInstance",
            // 	this.instanceKey
            // );
            // this.$store.dispatch("app/getAllOrgChartData");
            // this.$store.dispatch("process/getLastestProcessDefinition");
            // this.$store.dispatch('process/getAllDefinitions');
            this.applySavedData(val);
        },
        tab() {
            this.instanceKey = Date.now();
            this.$store.commit('process/initInstance', this.instanceKey);
            this.$store.dispatch('app/getAllOrgChartData');
            this.$store.dispatch('process/getLastestProcessDefinition');
            this.$store.dispatch('process/getAllDefinitions');
            this.applySavedData(this.processId);
        }
    }
};
</script>

<style scoped>
.process-header-bar {
    border-bottom: 1px solid #e6e5e5;
    padding-left: 10px;
}

.sym-bpm-attributes {
    border-left: 1px solid #e6e5e5;
    display: inline-block;
}
.modeler-detail-admin >>> .djs-palette-entries {
    display: none !important;
}
.modeler-detail-admin >>> .djs-palette {
    display: none !important;
}
.modeler-detail-admin >>> .djs-container {
    width: 600px !important;
}
.modeler-detail-admin >>> .djs-hit {
    pointer-events: none;
}
</style>

<template>
    <div class="w-100 h-100">
        <Preloader v-show="onLoading"></Preloader>
        <div
            class="h-100 float-left position-relative"
            :style="{
                width:
                    routeName != 'viewProcess' ? 'calc(100% - 250px)' : '100%'
            }"
        >
            <div class="process-header-bar py-1" style="height: 40px">
                <v-tooltip
                    bottom
                    v-for="(item, key) in headerActions"
                    :key="key"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn
                            @click="handleHeaderAction(key)"
                            icon
                            class="mr-2"
                            style="position: relative; top: -3px"
                        >
                            <v-icon size="21" v-on="on">{{ item.icon }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t(item.text) }}</span>
                </v-tooltip>

                <v-btn
                    v-if="routeName != 'viewProcess'"
                    class="float-right mr-1"
                    @click="saveProcess"
                    small
                    depressed
                    color="primary"
                    :loading="saving"
                >
                    <v-icon class="mr-2" primary>mdi-content-save</v-icon>
                    {{ $t('process.header_bar.save') }}
                </v-btn>
            </div>
            <symper-bpmn
                :readOnly="routeName == 'viewProcess'"
                @handle-call-activity-selected="handleNodeSelected"
                @node-clicked="handleNodeSelected"
                @node-changed="handleNodeChangeProps"
                ref="symperBpmn"
                :instanceKey="instanceKey"
                :height="diagramHeight"
                :diagramXML="diagramXML"
                :customExtension="customExtension"
                :customModules="customRender"
            ></symper-bpmn>
        </div>
        <div
            class="sym-bpm-attributes h-100"
            style="width: 250px"
            v-if="routeName != 'viewProcess'"
        >
            <div class="pb-2 px-2 pt-1">
                <v-text-field
                    v-on:input="onSearch($event)"
                    v-model="searchAttrKey"
                    class="w-100 sym-small-size"
                    single-line
                    append-icon="mdi-magnify"
                    outlined
                    dense
                    label="Search"
                    :placeholder="$t('common.search')"
                ></v-text-field>
                <preloader
                    v-if="loadingDataSet"
                    style="height: 100px !important; width: 250px"
                    class="mx-auto"
                />
            </div>
            <!-- <div class="list-node-attrs" :style="{height: 'calc(100% - 40px)', overflow: 'auto'}"> -->
            <VuePerfectScrollbar :style="{ height: attrPannelHeight }">
                <template>
                    <v-expansion-panels
                        :multiple="true"
                        :hover="true"
                        :accordion="true"
                        :focusable="true"
                        :flat="true"
                        class="sym-small-size"
                    >
                        <v-expansion-panel
                            v-for="(groupData, groupName) in attrGroupView"
                            :key="groupName"
                        >
                            <v-expansion-panel-header>{{
                                groupData.title
                            }}</v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <form-tpl
                                    @input-value-changed="
                                        handleAttrValueChanged
                                    "
                                    :allInputs="groupData.items"
                                ></form-tpl>
                                <span
                                    v-if="groupName == 'taskAction'"
                                    @click="showOverrideDocConfigPopup"
                                    class="fs-11 title-config-override-control"
                                >
                                    {{
                                        $t(
                                            'v2.workflow.pressToConfigTheOverwriteConfiguration'
                                        )
                                    }}
                                </span>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </template>
            </VuePerfectScrollbar>
        </div>
        <TrackingProcessDefinition
            :processDefinitionId="calledElement"
            :showDialog="showDialog"
            @cancel="showDialog = false"
        />
        <OverrideDocConfigPopup
            ref="overrideDocConfigPopup"
            v-if="selectingNode.type == 'UserTask'"
            v-bind="overrideDocConfigProps"
            @override-config="handleOverrideConfig"
            :overrideNodeConfig="overrideNodeConfig"
        />
    </div>
</template>

<script>
import CustomRenderer from '@/components/process/customCanvas/customElements/customRenderer.js';
import SymperBpmn from './../../components/common/SymperBpmn.vue';
import { getNodeAttrs, nodeAttrsDefinition } from './nodeAttrsFactory';
import { allAttrDisplayGroup } from './allAttrDisplayGroup';
import FormTpl from './../common/FormTpl.vue';
import { util } from '../../plugins/util';
import TrackingProcessDefinition from '@/views/process/TrackingProcessDefinition.vue';
import bpmnApi from './../../api/BPMNEngine.js';
import {
    defaultXML,
    reformatValueToStr
} from './../../components/process/reformatGetListData';
import { allNodesAttrs } from './../process/allAttrsOfNodes';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { documentApi } from '../../api/Document';
import customExtension from './elementDefinitions/customExtension';
import customContextPadProvider from '../../components/process/customContextPadForReadOnlyModeler';
import Preloader from '@/components/common/Preloader';
import {
    pushCustomElementsToModel,
    collectInfoForTaskDescription
} from './elementDefinitions/customExtToModel';
import Api from './../../api/api.js';
import { appConfigs } from '../../configs';
import serviceTaskDefinitions from '@/components/process/elementDefinitions/serviceTaskDefinitions';
import attrToXMLMethods from '@/components/process/elementDefinitions/attrToXMLMethods.js';
import OverrideDocConfigPopup from '@/components/process/OverrideDocConfigPopup';
const apiCaller = new Api('');
import CustomContextPad from '@/components/process/customCanvas/customMenuBpmn/customContextPad.js';
import CustomPalette from '@/components/process/customCanvas/customMenuBpmn/customPalette.js';

// Khung data của từng node cần lưu vào db
console.log(bpmnApi, 'bpmnApibpmnApibpmnApi');

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

var mapTypeToBackend = {
    ThrowCompensateEvent: 'ThrowNoneEvent',
    BoundaryCompensateEvent: 'BoundaryCompensationEvent'
};
export default {
    methods: {
        onSearch(evt) {
            if (this.delayTimer) {
                clearTimeout(this.delayTimer);
            }
            this.delayTimer = setTimeout(
                (self) => {
                    this.loadingDataSet = true;
                    if (!evt) {
                        this.selectingNodeAttr = this.attrGroupView;
                    } else {
                        let cloneSelectingNodeAttr = {};
                        for (let attr in this.selectingNodeAttr) {
                            let cloneAttr = {
                                items: {},
                                title: this.selectingNodeAttr[attr].title
                            };
                            //cac keys cua items
                            Object.keys(this.selectingNodeAttr[attr].items).map(
                                (key) => {
                                    if (key.indexOf(evt) != -1) {
                                        cloneAttr.items[key] =
                                            this.selectingNodeAttr[attr].items[
                                                key
                                            ];
                                    }
                                }
                            );
                            if (Object.keys(cloneAttr.items).length > 0) {
                                cloneSelectingNodeAttr[attr] = cloneAttr;
                            }
                        }
                        this.selectingNodeAttr = cloneSelectingNodeAttr;
                    }
                    this.loadingDataSet = false;
                },
                300,
                this
            );
        },
        handleOverrideConfig(configs) {
            this.overrideNodeConfig = configs;
            this.$store.commit('process/updateSelectingNodeExtraConfig', {
                instanceKey: this.instanceKey,
                extraNodeConfig: {
                    overrideNodeConfig: configs
                }
            });
        },
        showOverrideDocConfigPopup() {
            this.$refs.overrideDocConfigPopup.show();
        },
        calcDiagramHeight() {
            this.diagramHeight = window.innerHeight - 80;
        },
        /**
         * Tìm và đặt các control cho việc lựa chọn cho phép edit trong lúc duyệt
         */
        async setEditableControlsForNode(approvalNodeData, submitNodeData) {
            if (
                !submitNodeData ||
                !submitNodeData.attrs ||
                !submitNodeData.attrs.formreference
            ) {
                return '';
            }
            let docId = submitNodeData.attrs.formreference.value;
            if (!docId) {
                return;
            }
            let docDetail = await documentApi.detailDocument(docId);

            let fieldsMap = docDetail.data.fields;
            let ctrls = [
                {
                    name: 'SYMPER_NONE_CONTROLS',
                    title: this.$t('v2.workflow.notSelect'),
                    id: 'SYMPER_NONE_CONTROLS'
                },
                {
                    name: 'SYMPER_ALL_CONTROLS',
                    title: this.$t('v2.workflow.allControl'),
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
                        id: ctrl.properties.name,
                        type: ctrl.type
                    });
                }

                if (ctrl.type == 'table') {
                    for (let childName in ctrl.listFields) {
                        let childCtrl = ctrl.listFields[childName];
                        if (childCtrl.properties.name) {
                            ctrls.push({
                                name: childCtrl.properties.name,
                                title: childCtrl.properties.title,
                                id: childCtrl.properties.name,
                                type: childCtrl.type
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
                let validateData = self.getAllElementData();
                bpmnApi
                    .validateModel(JSON.stringify(validateData))
                    .then((validateResult) => {
                        if (validateResult.length == 0) {
                            resolve();
                        } else {
                            for (let err of validateResult) {
                                let options = {
                                    title: this.$t(
                                        'v2.workflow.validateFailed'
                                    ),
                                    type: 'warn',
                                    duration: 6000,
                                    text: err.defaultDescription
                                };
                                if (err.activityId) {
                                    options.actionBtns = [
                                        {
                                            text: this.$t(
                                                'v2.workflow.goToElement'
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
                                    ];
                                }
                                self.$snotify(options);
                            }
                            reject({
                                title: this.$t(
                                    'v2.workflow.validateFailedWhenCheckingForDeployment'
                                )
                            });
                        }
                    })
                    .catch((err) => {
                        self.$snotifyError(
                            err,
                            this.$t('v2.workflow.errorOnValidateDeployData')
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
                    console.warn(
                        err,
                        this.$t('v2.workflow.errOnValidatingModel')
                    );
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
            console.log('aaa', this.stateAllElements);
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
                                this.$t('v2.workflow.errorWhenValidate'),
                                this.$t('v2.workflow.errorAtNode') +
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
                        type: 'Error validate status',
                        title: this.$t('v2.workflow.errorWhenValidate'),
                        message: this.$t('v2.workflow.error')
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
                        title: this.$t('v2.workflow.processNameShoudNotEmpty')
                    });
                } else {
                    resolve();
                }

                if (!modelAttr.key) {
                    reject({
                        type: 'emptyModelKey',
                        title: this.$t(
                            'v2.workflow.processIdentifierShoudNotEmpty'
                        )
                    });
                } else if (
                    modelAttr.name == modelAttr.key ||
                    modelAttr.name == null
                ) {
                    // khi không điền tên quy trình thì name đc gán bằng key -> bắn lôĩ
                    reject({
                        type: 'emptyModelName',
                        title: this.$t('v2.workflow.processNameShoudNotEmpty')
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
        addRunningInfoVarsToModel(info, allVizEls, bpmnModeler) {
            let process = null;
            for (let vizEl of allVizEls) {
                let bizVizEl = vizEl.businessObject;
                if (bizVizEl.$type == 'bpmn:Process') {
                    process = bizVizEl;
                    break;
                }
            }

            let dataToSave = JSON.stringify(info);
            let props = {
                value: [
                    {
                        defaultValue: dataToSave,
                        id: process.id + '_SYMPER_EXTRA_RUNNING_INFO',
                        name: process.id + '_SYMPER_EXTRA_RUNNING_INFO',
                        type: 'string'
                    }
                ]
            };
            attrToXMLMethods.dataObjectMethod(
                process,
                'flowElements',
                props,
                bpmnModeler,
                ''
            );
        },
        getModelDataForSymperService() {
            let allVizEls = this.$refs.symperBpmn.getAllNodes(false);
            let allSymEls = this.stateAllElements;
            let bpmnModeler = this.$refs.symperBpmn.bpmnModeler;
            let info = collectInfoForTaskDescription(
                allVizEls,
                allSymEls,
                bpmnModeler
            );
            pushCustomElementsToModel(allVizEls, allSymEls, bpmnModeler);
            this.addRunningInfoVarsToModel(info, allVizEls, bpmnModeler);

            for (let el of allVizEls) {
                if (el.businessObject.$type == 'bpmn:Task') {
                    this.$refs.symperBpmn.changeTaskNodeToUserTaskNode(el.id);
                }
            }
            this.removeRedundantAttr();
            let xml = this.$refs.symperBpmn.getXML();
            xml = this.standardXMLToSave(xml);
            console.log(xml, 'xmlxmlxmlxmlxmlxmlxml');
            let jsonConfig = {};
            for (let elName in allSymEls) {
                jsonConfig[elName] = {};
                jsonConfig[elName].extraNodeConfig =
                    allSymEls[elName].extraNodeConfig;
                for (let attrName in allSymEls[elName].attrs) {
                    if (attrName != 'idNode') {
                        let attr = allSymEls[elName].attrs[attrName];
                        if (attr) {
                            jsonConfig[elName][attrName] = attr.getValue(
                                attr.value,
                                false
                            );
                        }
                    }
                }
            }
            let modelDataAsFlowable = this.getModelData();
            let relatedDocs = this.getRelatedDocs();
            return {
                name: modelDataAsFlowable.name,
                content: xml,
                description: modelDataAsFlowable.description,
                version: 1,
                configValue: JSON.stringify(jsonConfig),
                processKey: modelDataAsFlowable.key,
                relatedDocs: relatedDocs
            };
        },
        getRelatedDocs() {
            let mapNodeIdToDoc = {};
            let startDocFound = false;
            for (let nodeId in this.stateAllElements) {
                let node = this.stateAllElements[nodeId];
                if (node.type == 'UserTask' || node.type == 'Task') {
                    if (
                        node.attrs.taskAction.value == 'submit' &&
                        node.attrs.formreference.value
                    ) {
                        mapNodeIdToDoc[nodeId] = {
                            idDoc: node.attrs.formreference.value
                        };
                    } else if (node.type == 'Start') {
                        if (node.attrs.formreference.value) {
                            mapNodeIdToDoc[nodeId] = {
                                idDoc: node.attrs.formreference.value,
                                hasStartDoc: true
                            };
                            startDocFound = true;
                        }
                    }
                }
            }
            if (!startDocFound) {
                let nodesIdHaveStartDoc = this.getNodesHaveStartDoc();
                for (let nodeId of nodesIdHaveStartDoc) {
                    mapNodeIdToDoc[nodeId].hasStartDoc = true;
                }
            }
            return mapNodeIdToDoc;
        },
        getNodesHaveStartDoc() {
            let allNodes = this.$refs.symperBpmn.getAllNodes();
            let startNode = allNodes.filter((el) => {
                return el.$type == 'bpmn:StartEvent';
            })[0];
            if (startNode) {
                let firstUserTasks = [];
                this.findFirstUserTask(startNode, firstUserTasks);
                let rsl = [];
                for (let node of firstUserTasks) {
                    let nodeAttr = this.stateAllElements[node.id];
                    if (
                        nodeAttr.attrs.taskAction.value == 'submit' &&
                        nodeAttr.attrs.formreference.value
                    ) {
                        rsl.push(node.id);
                    }
                }
                return rsl;
            } else {
                return [];
            }
        },
        findFirstUserTask(node, rsl) {
            let nodeId = node.id;
            let nodeAttr = this.stateAllElements[nodeId];
            if (nodeAttr.type == 'UserTask' || nodeAttr.type == 'Task') {
                rsl.push(node);
                return;
            } else if (Array.isArray(node.outgoing)) {
                for (let link of node.outgoing) {
                    this.findFirstUserTask(link.targetRef, rsl);
                }
            }
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

            // Thêm tag đóng cho signalEvents
            let signalEvents = xml.match(
                /<bpmn:signalEventDefinition(.*?)\/>/g
            );
            if (signalEvents) {
                for (let item of signalEvents) {
                    let newItem =
                        item.slice(0, item.length - 2) +
                        '></bpmn:signalEventDefinition>';
                    xml = xml.replace(item, newItem);
                }
            }

            // Thêm thuộc tính cancelActivity cho boundaryEvent
            let boundaryEvents = xml.match(/<bpmn:boundaryEvent(.*?)>/g);
            if (boundaryEvents) {
                for (let item of boundaryEvents) {
                    if (item.indexOf('cancelActivity="') < 0) {
                        let newItem =
                            item.slice(0, item.length - 1) +
                            ' cancelActivity="true" >';
                        xml = xml.replace(item, newItem);
                    }
                }
            }
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
        // Loại bỏ các thuộc tính thừa trong attrs của các object trong diagram để sinh ra xml cho đúng với backend
        removeRedundantAttr() {
            let allEls = this.$refs.symperBpmn.getAllNodes();
            for (let el of allEls) {
                if (el.$type == 'bpmn:Collaboration') {
                    delete el.$attrs.isExecutable;
                } else if (el.$type == 'bpmn:Participant') {
                    el.processRef.isExecutable = true;
                }
            }
        },
        // Lưu lại data của process model hiện tại
        saveProcess() {
            if (this.routeName == 'viewProcess') {
                return;
            }
            this.saving = true;
            let self = this;
            this.fillNodeData();
            this.updateViewDataToState();
            this.validateModel(
                () => {
                    let action = self.modelAction;
                    let idModel = self.modelId;
                    if (action == 'create' || action == 'clone') {
                        // let modelData = this.getModelData(); // data này giành cho backend của flowable
                        let modelData = this.getModelDataForSymperService();
                        if (modelData.content) {
                            bpmnApi
                                .createModel(modelData)
                                .then((res) => {
                                    if (res.status == 200) {
                                        self.modelAction = 'edit';
                                        self.modelId = res.data.id;
                                        self.$snotifySuccess(
                                            this.$t(
                                                'v2.workflow.createProcessSuccessfully'
                                            )
                                        );
                                    } else {
                                        self.$snotifyError(res, res.message);
                                    }
                                    self.saving = false;
                                })
                                .catch((err) => {
                                    self.$snotifyError(
                                        err,
                                        this.$t(
                                            'v2.workflow.cantCreateNewProcessModel'
                                        )
                                    );
                                    self.saving = false;
                                });
                        }
                    } else {
                        self.updateModelToSymperService(idModel);
                    }
                },
                () => {
                    self.saving = false;
                }
            );
        },
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
                            this.$t('v2.workflow.updateModelSucessfully')
                        );
                    } else {
                        this.$snotifyError(
                            res,
                            this.$t('v2.workflow.canNotUpdateProcessModel')
                        );
                    }
                } catch (error) {
                    this.$snotifyError(
                        error,
                        this.$t('v2.workflow.canNotUpdateProcessModel')
                    );
                } finally {
                    this.saving = false;
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
                        this.$t('v2.workflow.processModelSaved')
                    );
                    self.lastUpdated = res.lastUpdated;
                })
                .catch((err) => {
                    self.$snotifyError(
                        err,
                        this.$t('v2.workflow.canNotSaveProcessModel')
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

        getNodetypeForBackend(type) {
            return mapTypeToBackend[type] ? mapTypeToBackend[type] : type;
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
                nodeType = this.getNodetypeForBackend(nodeType);
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
                            if ($.isArray(lane.flowNodeRef)) {
                                this.addChildrenForProcess(
                                    mapSaveNodes[lane.id],
                                    lane.flowNodeRef,
                                    mapSaveNodes
                                );
                            }
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
                    this.$t('v2.workflow.nodeInfoNotMatchTypeObjectOrString'),
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
                                props[key] = reformatValueToStr(props[key]);
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

            let transltedNodeType = mapLibNameToFlowableName[nodeType]
                ? mapLibNameToFlowableName[nodeType]
                : nodeType;
            return transltedNodeType;
        },
        handleNodeChangeProps(nodeData) {
            let nodeId = nodeData.id;
            let nodeState = this.stateAllElements[nodeId];
            let newType = this.getNodeType(nodeData);

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
                if (
                    this.stateAllElements.hasOwnProperty(newId) &&
                    this.$refs.symperBpmn.getElData(newId)
                ) {
                    this.$snotifyError(
                        {},
                        this.$t('v2.workflow.elementIdCanNotBeDuplicated'),
                        this.$t('v2.workflow.pleaseInputOtherId')
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
                    this.$t('v2.workflow.cannotGetDetailDataOfDocumentId') +
                        docId
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
            if (!nodeData.extraNodeConfig) {
                nodeData.extraNodeConfig = {};
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
        handleNodeSelected(node, evt) {
            if (node.$type == 'bpmn:CallActivity') {
                this.calledElement = node.calledElement;
                this.haveCallActivityModeler = true;
            } else {
                this.haveCallActivityModeler = false;
            }
            let type = this.getNodeType(node);

            let nodeData = this.getNodeData(node.id, type);
            // thêm nodeconfig nếu có
            if (nodeData.extraNodeConfig.overrideNodeConfig) {
                this.overrideNodeConfig =
                    nodeData.extraNodeConfig.overrideNodeConfig;
            } else {
                this.overrideNodeConfig = [];
            }
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

            this.setDefinitionRef(nodeData);
        },
        setDefinitionRef(nodeData) {
            let allEls = this.$refs.symperBpmn.getAllNodes();

            let homeId = allEls.filter((el, idx) => {
                if (
                    el.$type == 'bpmn:Process' ||
                    el.$type == 'bpmn:Collaboration'
                ) {
                    return true;
                }
            })[0]['id'];

            if(this.stateAllElements[homeId]){
                let msgdefinitions =
                this.stateAllElements[homeId].attrs.messagedefinitions;
                if (nodeData.attrs.messageref) {
                    nodeData.attrs.messageref.options = msgdefinitions.getValue(
                        msgdefinitions.value
                    );
                }
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

            if(!Array.isArray(bizNodeData.outgoing)){
                return
            }

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
            if (attrName == 'updateForElement') {
                submitTasks.push({
                    id: 'DOC_INSTANCE_FROM_STARTING_WORKFLOW',
                    title: this.$t(
                        'v2.workflow.docInstanceFromStartingWorkflow'
                    ),
                    nodeData: {}
                });
            }
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
                    nodeData &&
                    ((nodeData.type == 'UserTask' &&
                        nodeData.attrs.taskAction.value == 'submit') ||
                        (nodeData.type == 'UserTask' &&
                            nodeData.attrs.taskAction.value == 'update') ||
                        (nodeData.type == 'StartNoneEvent' &&
                            nodeData.attrs.formreference.value))
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
                    (nodeData &&
                        mappNodeActivity[nodeData.type] &&
                        (nodeData.type == 'UserTask' ||
                            nodeData.type == 'Task')) ||
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
                        this.$t('v2.workflow.validationPassed')
                    );
                });
            } else {
                this.$refs.symperBpmn[ac]();
            }
        },
        cleanXMLBeforeRender(xml) {
            xml = xml.replace(/<symper:(.*?)<\/symper:(.*?)>/g, ''); // Loại bỏ toàn bộ các thẻ của symper
            return xml;
        },
        /**
         * Lấy data từ server và áp dụng data này để hiển thị lên process
         */
        async applySavedData(idProcess) {
            try {
                let modelData = await bpmnApi.getModelData(idProcess);
                this.onLoading = false;
                modelData = modelData.data;
                let xml = this.cleanXMLBeforeRender(modelData.content);
                console.log(xml);
                let afterRender = await this.$refs.symperBpmn.renderFromXML(
                    xml
                );
                if (modelData.configValue) {
                    this.restoreAttrValueFromJsonConfig(modelData.configValue);
                }

                if (this.routeName == 'cloneProcess') {
                    this.createUniqueIdentifyForWorkflow();
                }
            } catch (error) {
                this.$snotifyError(
                    error,
                    this.$t('process.editror.err.get_xml')
                );
            }
        },
        replaceSignalRefBySignalExpression(
            nodeAttr,
            processProps,
            signalRefValue
        ) {
            if (
                nodeAttr.signalexpression &&
                Array.isArray(processProps.signaldefinitions)
            ) {
                processProps.signaldefinitions.map((el, idx) => {
                    if (el.id == signalRefValue) {
                        nodeAttr.signalexpression.value = el.name;
                    }
                });
            }
        },
        restoreAttrValueFromJsonConfig(jsonStr) {
            let configValue = JSON.parse(jsonStr);
            this.fillNodeData();
            let formKeyToNodeIdMap = {};

            let processProps = null;
            for (let name in configValue) {
                if (configValue[name].process_id) {
                    processProps = configValue[name];
                    break;
                }
            }

            for (let elName in this.stateAllElements) {
                let el = this.stateAllElements[elName];
                if (configValue[elName]) {
                    if (configValue[elName].signalref) {
                        this.replaceSignalRefBySignalExpression(
                            el.attrs,
                            processProps,
                            configValue[elName].signalref
                        );
                    }
                    el.extraNodeConfig = configValue[elName].extraNodeConfig;
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
            }
            this.setColumnsForNodes();
            this.setInitItemsForFormReferences(formKeyToNodeIdMap);
        },
        setColumnsForNodes() {
            for (let name in this.stateAllElements) {
                let el = this.stateAllElements[name];
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
                    this.$t('v2.workflow.cantSetInitialItemsForFormReferences')
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
                            this.$t('v2.workflow.notFound') +
                                key +
                                'in attrs of saved data ele.properties',
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
                        if (
                            el.$type == 'bpmn:Process' ||
                            el.$type == 'bpmn:Collaboration'
                        ) {
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
        this.$evtBus.$on('show-call-activity', (instanceKey) => {
            if (instanceKey == this.instanceKey) {
                if (self.haveCallActivityModeler) {
                    self.showDialog = true;
                }
            }
        });
        this.$store.dispatch('process/getAllDefinitions');
        if (this.routeName == 'editProcess') {
            this.modelAction = 'edit';
            this.modelId = this.$route.params.id;
        } else if (this.routeName == 'cloneProcess') {
            this.modelAction = 'clone';
        }

        if (
            this.routeName == 'editProcess' ||
            this.routeName == 'cloneProcess' ||
            this.routeName == 'viewProcess'
        ) {
            this.applySavedData(this.$route.params.id);
        }
        this.$evtBus.$on(
            'show-call-activity-process-instace',
            (instanceKey) => {
                if (instanceKey == this.instanceKey) {
                    self.showDialog = true;
                }
            }
        );
    },
    mounted() {
        this.resetAttrPanelHeight();
        this.calcDiagramHeight();

        if (this.action == 'create') {
            this.createUniqueIdentifyForWorkflow();
        }
    },
    data() {
        let computedCusomContexPad;
        if (this.routeName != 'viewProcess') {
            computedCusomContexPad = CustomContextPad;
        } else {
            computedCusomContexPad = customContextPadProvider;
        }
        return {
            onLoading: true,
            showDialog: false,
            customRender: [
                {
                    __init__: [
                        'CustomRenderer',
                        'customContextPad',
                        'customPalette'
                    ],
                    CustomRenderer: ['type', CustomRenderer],
                    customContextPad: ['type', computedCusomContexPad],
                    customPalette: ['type', CustomPalette]
                }
            ],
            calledElement: '',
            instanceKey: null, // key của instance hiện tại
            attrPannelHeight: '300px', // chiều cao của panel cấu hình các element
            modelAction: 'create', // hành động đối với model này là gì: create | clone | edit
            modelId: '', // Id của model này trong DB
            searchAttrKey: '',
            overrideNodeConfig: [],
            diagramHeight: 300,
            haveCallActivityModeler: false,
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
            ],
            saving: false,
            loadingDataSet: false,
            selectingNodeAttr: {}
        };
    },
    components: {
        Preloader,
        'symper-bpmn': SymperBpmn,
        'form-tpl': FormTpl,
        VuePerfectScrollbar,
        TrackingProcessDefinition,
        OverrideDocConfigPopup
    },
    props: {
        // Hành động cho editor này, nhận một trong các giá trị: create, edit, view, clone
        action: {
            type: String,
            default: 'create'
        }
    },
    computed: {
        overrideDocConfigProps() {
            let configs = {};
            let currentNode =
                this.$store.state.process.editor[this.instanceKey]
                    .selectingNode;
            if (currentNode.type == 'UserTask') {
                if (
                    this.attrGroupView.taskAction.items.approvalActions &&
                    this.attrGroupView.taskAction.items.approvalEditableControls
                ) {
                    let dataConfigs = {
                        actions:
                            this.attrGroupView.taskAction.items.approvalActions
                                .value,
                        allControls:
                            this.attrGroupView.taskAction.items
                                .approvalEditableControls.options
                    };
                    configs = this.attrGroupView.taskAction ? dataConfigs : {};
                }
            }
            return configs;
        },
        routeName() {
            return this.$getRouteName();
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
            this.$set(this, 'selectingNodeAttr', groups);
            return groups;
        }
    }
};
</script>

<style>
.process-header-bar {
    border-bottom: 1px solid #e6e5e5;
    padding-left: 10px;
}

.sym-bpm-attributes {
    border-left: 1px solid #e6e5e5;
    display: inline-block;
}

.title-config-override-control {
    border: 1px solid #ffffff;
    cursor: pointer;
}

.title-config-override-control:hover {
    border-bottom: 1px solid #f58634;
    color: #f58634;
}
</style>

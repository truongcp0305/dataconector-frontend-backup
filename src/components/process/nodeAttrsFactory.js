import { allAttrDisplayGroup } from './allAttrDisplayGroup';
import { allNodesAttrs } from './allAttrsOfNodes';
import { util } from './../../plugins/util';
// Thuộc tính chung cho tất cả các node của process, thuộc tính mà tất cả các node đều phải có
const commonAttrs = ['overrideid', 'name', 'documentation', 'description'];

/**
 * Các thuộc tính giành cho các nhóm khác nhau.
 * Các node có thể nhóm thành các nhóm dựa theo việc chúng có các thuộc tính giống nhau
 * Các thuộc tính trong group ko được trùng với các thuộc tính của  commonAttrs
 */
const groupsAttrs = {
    task: [
        'asynchronousdefinition',
        'exclusivedefinition',
        'executionlisteners',
        'multiinstance_type',
        'multiinstance_cardinality',
        'multiinstance_collection',
        'multiinstance_variable',
        'multiinstance_condition',
        'isforcompensation'
    ],
    gateway: [
        'asynchronousdefinition',
        'exclusivedefinition',
        'sequencefloworder'
    ]
};

const dockerGroups = {
    task: {
        x: 50,
        y: 40
    },
    event: {
        x: 15,
        y: 15
    },
    subProcess: {
        x: 148,
        y: 92.5
    },
    gateway: {
        x: 20.5,
        y: 20.5
    }
};

// Định nghĩa danh sách các thuộc tính của node
export const nodeAttrsDefinition = {
    UserTask: {
        group: 'task', // nhóm thuộc tính mà node này thuộc về, giá trị là một hoặc nhiều key trong "groupsAttrs"
        attrs: [
            'taskAction',
            'usertaskassignment',
            'taskOwner',
            'assignee',
            'candidateUsers',
            'autoUpdateTaskInfo',
            'notificationTitle',
            'notificationContent',
            'formkeydefinition',
            'formreference',
            'formfieldvalidation',
            'duedatedefinition',
            'prioritydefinition',
            'approvalActions',
            'updateForElement',
            'formproperties',
            'tasklisteners',
            'skipexpression',
            'categorydefinition',
            'approvalForElement',
            'approvalDocObjValue',
            'approvalEditableControls',
            'extraInfoLabel',
            'extraInfoValue',
            'selectDefaultControlDocument'
        ],
        exclude: ['asynchronousdefinition', 'exclusivedefinition'],
        validate: function (attrs) {},
        specificHandler(attrs, data, attrName) {
            if (attrName == 'formreference') {
                attrs.formreference.options = data.items;
                attrs.formkeydefinition.value = attrs.formreference.value;
            }
        },
        checkShowOrHideInput: function (attrs) {
            let taskAction = attrs.taskAction;
            if (taskAction.value == 'submit') {
                attrs.approvalActions.hidden = true;
                attrs.formreference.hidden = false;
                attrs.updateForElement.hidden = true;
                attrs.approvalForElement.hidden = true;
                attrs.approvalEditableControls.hidden = true;
                attrs.selectDefaultControlDocument.hidden = false;
            } else if (taskAction.value == 'approval') {
                attrs.approvalActions.hidden = false;
                attrs.formreference.hidden = true;
                attrs.updateForElement.hidden = true;
                attrs.approvalForElement.hidden = false;
                attrs.approvalEditableControls.hidden = false;
                attrs.selectDefaultControlDocument.hidden = true;
            } else if (taskAction.value == 'update') {
                attrs.approvalActions.hidden = true;
                attrs.formreference.hidden = true;
                attrs.approvalForElement.hidden = true;
                attrs.updateForElement.hidden = false;
                attrs.approvalEditableControls.hidden = true;
                attrs.selectDefaultControlDocument.hidden = true;
            } else if (taskAction.value == 'undefined') {
                attrs.approvalActions.hidden = true;
                attrs.formreference.hidden = true;
                attrs.approvalForElement.hidden = true;
                attrs.updateForElement.hidden = true;
                attrs.approvalEditableControls.hidden = true;
                attrs.selectDefaultControlDocument.hidden = true;
            }
        },
        docker: dockerGroups.task
    },
    ScriptTask: {
        group: 'task', // nhóm thuộc tính mà node này thuộc về, giá trị là một hoặc nhiều key trong "groupsAttrs"
        attrs: [
            'httptaskrequesturl',
            'httptaskrequestheaders',
            'httptaskrequestbody',
            'httptaskrequestbodyencoding',
            'httptaskrequesttimeout',
            'httptaskdisallowredirects',
            'httptaskfailstatuscodes',
            'httptaskhandlestatuscodes',
            'httptaskignoreexception',
            'httptasksaveresponseparameterstransient',
            'httptasksaveresponseasjson',
            'httptaskresponsevariablename',
            'httptasksaverequestvariables',
            'httptasksaveresponseparameters',
            'httptaskresultvariableprefix',
            'scripttext',
            'serviceTaskTypeHTTP'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.task
    },
    ServiceTask: {
        group: 'task', // nhóm thuộc tính mà node này thuộc về, giá trị là một hoặc nhiều key trong "groupsAttrs",
        attrs: [
            'httptaskrequesturl',
            'httptaskrequestheaders',
            'httptaskrequestbody',
            'httptaskrequestbodyencoding',
            'httptaskrequesttimeout',
            'httptaskdisallowredirects',
            'httptaskfailstatuscodes',
            'httptaskhandlestatuscodes',
            'httptaskignoreexception',
            'httptasksaveresponseparameterstransient',
            'httptasksaveresponseasjson',
            'httptaskresponsevariablename',
            'httptasksaverequestvariables',
            'httptasksaveresponseparameters',
            'httptaskresultvariableprefix',
            'serviceTaskType',
            'serviceTaskScriptValue',
            'skipexpression',
            'serviceTaskTypeHTTP',
            'serviceNotificationReceiver',
            'serviceTaskVariables',
            'serviceNotificationTitle',
            'serviceNotificationDescription',
            'serviceNotificationActionForElement'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {
            let serviceTaskType = attrs.serviceTaskType;
            if (serviceTaskType.value == 'script') {
                attrs.serviceTaskScriptValue.hidden = false;
                attrs.serviceNotificationReceiver.hidden = true;
                attrs.serviceNotificationTitle.hidden = true;
                attrs.serviceNotificationDescription.hidden = true;
                attrs.serviceNotificationActionForElement.hidden = true;
                attrs.serviceTaskVariables.hidden = true;
            } else if (serviceTaskType.value == 'notification') {
                attrs.serviceTaskScriptValue.hidden = true;
                attrs.serviceNotificationReceiver.hidden = false;
                attrs.serviceNotificationTitle.hidden = false;
                attrs.serviceNotificationDescription.hidden = false;
                attrs.serviceNotificationActionForElement.hidden = false;
                attrs.serviceTaskVariables.hidden = true;
            } else if (serviceTaskType.value == 'setVariables') {
                attrs.serviceNotificationTitle.hidden = true;
                attrs.serviceNotificationDescription.hidden = true;
                attrs.serviceNotificationActionForElement.hidden = true;
                attrs.serviceTaskScriptValue.hidden = true;
                attrs.serviceNotificationReceiver.hidden = true;
                attrs.serviceTaskVariables.hidden = false;
            }
        },
        docker: dockerGroups.task
    },
    ReceiveTask: {
        group: 'task', // nhóm thuộc tính mà node này thuộc về, giá trị là một hoặc nhiều key trong "groupsAttrs"
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.task
    },
    SendTask: {
        group: 'task', // nhóm thuộc tính mà node này thuộc về, giá trị là một hoặc nhiều key trong "groupsAttrs"
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.task
    },
    ExclusiveGateway: {
        group: 'gateway',
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        specificHandler() {},
        docker: dockerGroups.gateway
    },
    InclusiveGateway: {
        group: 'gateway',
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        specificHandler() {},
        docker: dockerGroups.gateway
    },
    EventGateway: {
        group: 'gateway',
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        specificHandler() {},
        docker: dockerGroups.gateway
    },
    ParallelGateway: {
        group: 'gateway',
        validate: function (attrs) {},
        specificHandler() {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.gateway
    },
    StartNoneEvent: {
        attrs: [
            'executionlisteners',
            'initiator',
            'formkeydefinition',
            'formreference',
            'formfieldvalidation',
            'formproperties'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event,
        specificHandler(attrs, data, attrName) {
            if (attrName == 'formreference') {
                attrs.formreference.options = data.items;
                attrs.formkeydefinition.value = attrs.formreference.value;
            }
        }
    },
    StartConditionalEvent: {
        attrs: [
            'executionlisteners',
            'conditionalevent',
            'conditionaleventcondition',
            'isInterrupting'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    StartTimerEvent: {
        attrs: [
            'executionlisteners',
            'timercycledefinition',
            'timerdatedefinition',
            'timerdurationdefinition'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    StartSignalEvent: {
        attrs: ['executionlisteners', 'isInterrupting','signalexpression'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    StartMessageEvent: {
        attrs: ['executionlisteners', 'messageref', 'isInterrupting'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    ThrowNoneEvent: {
        attrs: ['executionlisteners', 'asynchronousdefinition'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    CatchMessageEvent: {
        attrs: ['executionlisteners', 'messageref'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    CatchTimerEvent: {
        attrs: [
            'executionlisteners',
            'timercycledefinition',
            'timerdatedefinition',
            'timerdurationdefinition'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    ThrowEscalationEvent: {
        attrs: [
            'executionlisteners',
            'escalationref',
            'asynchronousdefinition'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    CatchConditionalEvent: {
        attrs: ['executionlisteners', 'conditionaleventcondition'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    CatchLinkEvent: {
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    ThrowLinkEvent: {
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    ThrowCompensateEvent: {
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    CatchSignalEvent: {
        attrs: ['executionlisteners', 'signalexpression'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    BoundaryConditionalEvent: {
        attrs: ['executionlisteners', 'conditionaleventcondition'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    ThrowSignalEvent: {
        attrs: [
            'httptaskrequesturl',
            'httptaskrequestheaders',
            'httptaskrequestbody',
            'httptaskrequestbodyencoding',
            'httptaskrequesttimeout',
            'httptaskdisallowredirects',
            'httptaskfailstatuscodes',
            'httptaskhandlestatuscodes',
            'httptaskignoreexception',
            'httptasksaveresponseparameterstransient',
            'httptasksaveresponseasjson',
            'httptaskresponsevariablename',
            'httptasksaverequestvariables',
            'httptasksaveresponseparameters',
            'httptaskresultvariableprefix',
            'serviceTaskTypeHTTP',
            'executionlisteners',
            'signalexpression',
            'asynchronousdefinition',
            'prefixForSignalParameters'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    EndNoneEvent: {
        attrs: ['executionlisteners'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: {
            x: 14,
            y: 14
        }
    },
    EndMessageEvent: {
        attrs: ['executionlisteners', 'messageref'],

        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    ThrowMessageEvent: {
        attrs: ['executionlisteners', 'messageref'],

        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    BoundaryMessageEvent: {
        attrs: ['executionlisteners', 'messageref'],

        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    EndEscalationEvent: {
        attrs: ['executionlisteners', 'escalationref'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    EndErrorEvent: {
        attrs: ['executionlisteners', 'errorref'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    EndCompensateEvent: {
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    EndSignalEvent: {
        attrs: ['executionlisteners', 'signalexpression'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    EndTerminateEvent: {
        attrs: ['executionlisteners', 'terminateAll'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    CallActivity: {
        attrs: [
            'asynchronousdefinition',
            'exclusivedefinition',
            'callactivitycompleteasync',
            'executionlisteners',
            'callactivitycalledelement',
            'callactivitycalledelementtype',
            'callactivityinparameters',
            'callactivityoutparameters',
            'callactivityinheritvariables',
            'callactivitysamedeployment',
            'callactivityfallbacktodefaulttenant',
            'callactivityidvariablename',
            'callactivityprocessinstancename',
            'callactivityinheritbusinesskey',
            'callactivitybusinesskey',
            'callactivityuselocalscopeforoutparameters',
            'multiinstance_type',
            'multiinstance_cardinality',
            'multiinstance_collection',
            'multiinstance_variable',
            'multiinstance_condition',
            'isforcompensation'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.task
    },
    SubProcess: {
        attrs: [
            'asynchronousdefinition',
            'exclusivedefinition',
            'dataproperties',
            'executionlisteners',
            'multiinstance_type',
            'multiinstance_cardinality',
            'multiinstance_collection',
            'multiinstance_variable',
            'multiinstance_condition',
            'istransaction'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.subProcess
    },
    AdhocSubProcess: {
        attrs: ['completioncondition', 'ordering', 'cancelremaininginstances'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.subProcess
    },
    TransactionSubProcess: {
        attrs: [
            'asynchronousdefinition',
            'exclusivedefinition',
            'dataproperties',
            'executionlisteners',
            'multiinstance_type',
            'multiinstance_cardinality',
            'multiinstance_collection',
            'multiinstance_variable',
            'multiinstance_condition',
            'istransaction'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.subProcess
    },
    EventSubProcess: {
        attrs: [
            'asynchronousdefinition',
            'exclusivedefinition',
            'executionlisteners'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.subProcess
    },
    BPMNDiagram: {
        attrs: [
            'controlsForBizKey',
            'process_id',
            'instanceDisplayText',
            'name',
            'documentation',
            'process_author',
            'process_version',
            'process_namespace',
            'process_historylevel',
            'isexecutable',
            'dataproperties',
            'executionlisteners',
            'eventlisteners',
            'messagedefinitions',
            'escalationdefinitions',
            'process_potentialstarteruser',
            'process_potentialstartergroup',
            'iseagerexecutionfetch'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        exclude: ['overrideid']
    },
    SequenceFlow: {
        attrs: [
            'conditionsequenceflow',
            'executionlisteners',
            'defaultflow',
            'skipexpression'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {}
    },
    Pool: {
        attrs: ['process_id'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {}
    },
    Lane: {
        attrs: ['showcaption'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {}
    },
    TextAnnotation: {
        attrs: ['text'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {}
    },
    BoundaryTimerEvent: {
        attrs: [
            'timercycledefinition',
            'timerdurationdefinition',
            'timerdatedefinition',
            'timerenddatedefinition'
        ],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.subProcess
    },
    BoundarySignalEvent: {
        attrs: ['executionlisteners', 'signalexpression'],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    BoundaryCompensateEvent: {
        attrs: [],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    ThrowCompensateEvent: {
        attrs: [],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    },
    Association: {
        attrs: [],
        validate: function (attrs) {},
        checkShowOrHideInput: function (attrs) {},
        docker: dockerGroups.event
    }
};

/**
 * Lấy ra các thuộc tính  mặc định của một loại node trong process
 * @param {String} nodeType loại node cần lấy thuộc tính
 */
export const getNodeAttrs = function (nodeType) {
    let allAttrKeys = util.cloneDeep(commonAttrs);
    let nodeAttrs = {};
    nodeAttrsDefinition.Task = nodeAttrsDefinition.UserTask; // Nếu là task bình thường thì lấy thuộc tính của userTask luôn
    let nodeDef = nodeAttrsDefinition[nodeType];
    if (nodeDef) {
        if (nodeDef.attrs) {
            allAttrKeys = allAttrKeys.concat(nodeDef.attrs);
        }

        if (nodeDef.group) {
            allAttrKeys = allAttrKeys.concat(groupsAttrs[nodeDef.group]);
        }
    }

    for (let i = 0; i < allAttrKeys.length; i++) {
        let attrName = allAttrKeys[i];
        nodeAttrs[attrName] = allNodesAttrs[attrName];
    }

    if (nodeDef && nodeDef.exclude) {
        for (let item of nodeDef.exclude) {
            delete nodeAttrs[item];
        }
    }

    let rsl = util.cloneDeep(nodeAttrs);
    if (nodeDef) {
        if (nodeDef.checkShowOrHideInput) {
            nodeDef.checkShowOrHideInput(rsl);
        }
    }
    return rsl;
};

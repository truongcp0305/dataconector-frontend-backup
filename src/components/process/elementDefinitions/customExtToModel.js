import { allNodesAttrs } from './../allAttrsOfNodes';
import attrToXMLMethods from './attrToXMLMethods';
import { util } from '../../../plugins/util';
import serviceTaskDefinitions from './serviceTaskDefinitions';

function translateServiceTaskToHTTPTask(el, attrs, bpmnModeler) {
    let httpTaskType = attrs.serviceTaskType.value;
    setHttpTaskFromType(el, attrs, bpmnModeler, httpTaskType);
}

function translateScriptTaskToHTTPTask(el, attrs, bpmnModeler) {
    let httpTaskType = 'script';
    attrs.serviceTaskScriptValue = attrs.scripttext;
    setHttpTaskFromType(el, attrs, bpmnModeler, httpTaskType);
}

function translateThrowSignalToHTTPTask(el, attrs, bpmnModeler, rootAttrs) {
    let httpTaskType = 'throwSignal';
    setHttpTaskFromType(el, attrs, bpmnModeler, httpTaskType);
}

function removeNewLine(str) {
    return String(str).replace(/\n|\r\n|\t/g, ' ')
}

function setHttpTaskFromType(el, attrs, bpmnModeler, httpTaskType) {
    let cloneAttr = util.cloneDeep(attrs);
    let bizEl = el.businessObject;
    let extensionElements = bizEl.extensionElements;
    cloneAttr.idNode = el.id;
    let moddle = bpmnModeler.get('moddle');
    extensionElements = moddle.create('bpmn:ExtensionElements');
    extensionElements.values = [];
    let modeling = bpmnModeler.get('modeling');
    serviceTaskDefinitions[httpTaskType].makeRequestBody(cloneAttr);
    let items = serviceTaskDefinitions[httpTaskType].params;
    for (let name in items) {
        let subEl = moddle.create('symper:symper_symper_field_tag');
        subEl.name = name;
        let value = removeNewLine(items[name]);
        if (String(value)) {
            if (name != 'requestBody') {
                subEl.text = `<symper:symper_symper_string_tag>
                    <![CDATA[${value}]]>
                </symper:symper_symper_string_tag>`;
                extensionElements.values.push(subEl);
            } else {
                subEl.text = `<symper:symper_symper_expression_tag>
                    <![CDATA[${value}]]>
                </symper:symper_symper_expression_tag>`;
                extensionElements.values.push(subEl);
            }
        }
    }
    modeling.updateProperties(el, {
        extensionElements,
    });
}

/**
 *
 * @param {Array} allVizEls mảng chứa các đối tượng do thư viện quản lý
 * @param {Object} allSymEls đối tượng chứa tất cả các thuộc tính của tất cả các elements trong modeler
 * @param {Object} moddle đối tượng thư viện để đẩy sang xml
 */
export const pushCustomElementsToModel = function (
    allVizEls,
    allSymEls,
    bpmnModeler,
) {
    for (let vizEl of allVizEls) {
        let bizVizEl = vizEl.businessObject;
        let attrs = allSymEls[bizVizEl.id].attrs;
        let elKey = '';
        if (
            bizVizEl.$type == 'bpmn:Process' ||
            bizVizEl.$type == 'bpmn:Collaboration'
        ) {
            elKey = 'rootElements';
            vizEl = bizVizEl.$parent;
        } else if (bizVizEl.$type == 'bpmn:ServiceTask') {
            translateServiceTaskToHTTPTask(vizEl, attrs, bpmnModeler);
        } else if (bizVizEl.$type == 'bpmn:ScriptTask') {
            translateScriptTaskToHTTPTask(vizEl, attrs, bpmnModeler);
        } else if (bizVizEl.$type == 'bpmn:IntermediateThrowEvent') {
            if (
                bizVizEl.eventDefinitions[0].$type ==
                'bpmn:SignalEventDefinition'
            ) {
                let rootAttrs = null;
                for (let name in allSymEls) {
                    if (allSymEls[name].type == 'BPMNDiagram') {
                        rootAttrs = allSymEls[name].attrs;
                        break;
                    }
                }
                translateThrowSignalToHTTPTask(
                    vizEl,
                    attrs,
                    bpmnModeler,
                    rootAttrs,
                );
            }
        }

        if (elKey) {
            vizEl[elKey] = removeOldSymperExts(vizEl[elKey]);
        }

        for (let attrName in attrs) {
            let attrDef = allNodesAttrs[attrName];
            if (!attrDef) {
                continue;
            }
            if (typeof attrDef.pushToXML == 'function') {
                attrDef.pushToXML(
                    vizEl,
                    elKey,
                    attrs[attrName],
                    bpmnModeler,
                    attrName,
                );
            }
        }
        if (bizVizEl.$type == 'bpmn:Process') {
            addCustomAttrToDataObject(bizVizEl, attrs);
            attrToXMLMethods.dataObjectMethod(
                bizVizEl,
                'flowElements',
                attrs.dataproperties,
                bpmnModeler,
                '',
            );
            removeCustomAttrToDataObject(bizVizEl, attrs);
        }

        checkAndAddTimeDefifinitonForNode(vizEl, elKey, attrs, bpmnModeler);
    }
};

/**
 * Với các element có set time definition, cần check để đưa vào định dạng cho đúng
 * @param {*} vizEl
 * @param {*} elKey
 * @param {*} attrs
 * @param {*} bpmnModeler
 * @param {*} attrName
 */
function checkAndAddTimeDefifinitonForNode(el, elKey, attrs, bpmnModeler) {
    let moddle = bpmnModeler.get('moddle');
    let bizObj = el.businessObject;

    if (bizObj && bizObj.eventDefinitions && bizObj.eventDefinitions[0]) {
        delete bizObj.eventDefinitions[0].timeDate;
        delete bizObj.eventDefinitions[0].timeCycle;
        delete bizObj.eventDefinitions[0].timeDuration;
    }
    // timerdatedefinition > timercycledefinition (đi kèm với timerenddatedefinition) > timerdurationdefinition
    if (
        attrs.hasOwnProperty('timerdatedefinition') &&
        attrs.timerdatedefinition.value.trim() != ''
    ) {
        console.log(bizObj, "timer date definition xxxxxxxxxxxx");
        let timeDate = moddle.create('bpmn:Expression');
        timeDate.body = attrs.timerdatedefinition.value.trim();
        bizObj.eventDefinitions[0].timeDate = timeDate;
    } else if (
        attrs.hasOwnProperty('timercycledefinition') &&
        attrs.timercycledefinition.value.trim() != ''
    ) {
        console.log(bizObj, "timer cycle definition  xxxxxxxxxxxxxx");
        let timeCycle = moddle.create('bpmn:Expression');
        timeCycle.body = attrs.timercycledefinition.value.trim();

        if (attrs.timerenddatedefinition) {
            let endDate = attrs.timerenddatedefinition.value.trim();
            if (endDate != '') {
                timeCycle.$attrs['symper:endDate'] = endDate;
            }
        }
        bizObj.eventDefinitions[0].timeCycle = timeCycle;
    } else if (
        attrs.hasOwnProperty('timerdurationdefinition') &&
        attrs.timerdurationdefinition.value.trim() != ''
    ) {
        console.log(bizObj,"timer duration definition  xxxxxxxxxxxxx");

        let timeDuration = moddle.create('bpmn:Expression');
        timeDuration.body = attrs.timerdurationdefinition.value.trim();
        bizObj.eventDefinitions[0].timeDuration = timeDuration;
    }
}

function addCustomAttrToDataObject(vizEl, attrs) {
    let keys = ['instanceDisplayText', 'controlsForBizKey'];
    for (let k of keys) {
        attrs.dataproperties.value.push({
            id: vizEl.id + '_' + k,
            name: vizEl.id + '_' + k,
            type: 'string',
            defaultValue: attrs[k].value,
        });
    }
}

/**
 *
 * @param {Object} symEl object chứa thông tin của element do Symper quy định
 */
function addCustomPropsToForm(symEl) {
    if (symEl.type == 'StartNoneEvent' || symEl.type == 'UserTask') {
        symEl.attrs.formproperties.value = [];
        for (let attrName in symEl.attrs) {
            let attr = symEl.attrs[attrName];
            if (attr.isSymperProp) {
                symEl.attrs.formproperties.value.push({
                    id: symEl.id + '___' + attrName,
                    name: attrName,
                    type: 'string',
                    variable: symEl.id + '___' + attrName,
                    expression: '',
                    default:
                        typeof attr.value == 'object'
                            ? JSON.stringify(attr.value)
                            : attr.value,
                    text: '',
                });
            }
        }
        console.log(symEl, 'xxxxxxxxxxxxxxxxx');
    }
}

function removeOldSymperExts(els) {
    let newArr = [];
    for (let el of els) {
        if (el.$type.indexOf('symper:') != 0) {
            newArr.push(el);
        }
    }
    return newArr;
}

function removeCustomAttrToDataObject(vizEl, attrs) {
    let keys = {
        instanceDisplayText: true,
        controlsForBizKey: true,
    };
    for (let idx in attrs.dataproperties.value) {
        let item = attrs.dataproperties.value[idx];
        if (item.id) {
            let checkType = item.id.replace(vizEl.id + '_', '');
            if (keys[checkType]) {
                delete attrs.dataproperties.value[idx];
            }
        }
    }
    attrs.dataproperties.value = Object.values(attrs.dataproperties.value);
}

export const defaultTaskDescription = {
    action: {
        module: 'document',
        resource: 'document_object',
        scope: 'workflow',
        action: '',
        parameter: {
            activityId: '',
            documentId: 0,
        },
    },
    content: '',
    extraLabel: '',
    extraValue: '',
    approvalActions: '',
    targetElement: '',
    editableControlOnApproval: [],
    approvalDocObjValue: '',
};

function filterValue(rows) {
    let rsl = [];
    for (let r of rows) {
        let passed = true;
        for (let key in r) {
            if (!r[key]) {
                passed = false;
                break;
            }
        }

        if (passed) {
            rsl.push(r);
        }
    }

    return rsl;
}

export const collectInfoForTaskDescription = function (
    allVizEls,
    allSymEls,
    bpmnModeler,
) {
    let infoReturn = {
        autoUpdateTaskInfo: {},
    };
    for (let idEl in allSymEls) {
        let el = allSymEls[idEl];
        if (el.type == 'UserTask' || el.type == 'Task') {
            setInfoForTaskDescription(el, infoReturn);
        }
        // else if(el.type == 'ServiceTask'){
        //     setInfoForServicesTask(el);
        // }
    }

    return infoReturn;
};

function setInfoForTaskDescription(el, infoReturn) {
    let elDocumentation = util.cloneDeep(defaultTaskDescription);
    elDocumentation.action.action = el.attrs.taskAction.value;
    elDocumentation.action.parameter.activityId = el.id;
    if (el.extraNodeConfig) {
        elDocumentation.extraNodeConfig = JSON.stringify(el.extraNodeConfig);
    }
    elDocumentation.content = removeNewLine(el.attrs.notificationContent.value);
    elDocumentation.extraLabel = removeNewLine(el.attrs.extraInfoLabel.value);
    elDocumentation.extraValue = removeNewLine(el.attrs.extraInfoValue.value);
    elDocumentation.approvalEditableControls =
        el.attrs.approvalEditableControls.value;
    let defaultControlValue = el.attrs.selectDefaultControlDocument.value;
    elDocumentation.selectDefaultControlDocument = typeof defaultControlValue == 'string' ? defaultControlValue : JSON.stringify(defaultControlValue);
    elDocumentation.approvalDocObjValue = el.attrs.approvalDocObjValue.value;

    elDocumentation.autoUpdateTaskInfo = el.attrs.autoUpdateTaskInfo.value;
    // Nếu kích hoạt việc tự động update lại task info
    if (elDocumentation.autoUpdateTaskInfo) {
        infoReturn.autoUpdateTaskInfo[el.id] = {
            content: elDocumentation.content,
            extraLabel: elDocumentation.extraLabel,
            extraValue: elDocumentation.extraValue,
        };
    }
    if (el.attrs.taskAction.value == 'submit') {
        elDocumentation.action.parameter.documentId =
            el.attrs.formreference.value;
    } else if (el.attrs.taskAction.value == 'approval') {
        elDocumentation.targetElement = el.attrs.approvalForElement.value;
        elDocumentation.approvalActions = JSON.stringify(
            filterValue(el.attrs.approvalActions.value),
        );
    } else if (el.attrs.taskAction.value == 'update') {
        elDocumentation.targetElement = el.attrs.updateForElement.value;
    }
    el.attrs.documentation.value = JSON.stringify(elDocumentation);
}
// function setInfoForServicesTask(el){
//     let elDocumentation = util.cloneDeep(defaultTaskDescription);
//     elDocumentation.action.module = "workflow";
//     elDocumentation.action.resource = "workflow";
//     elDocumentation.action.scope = "workflow";
//     elDocumentation.action.action = el.attrs.serviceTaskType.value;
//     elDocumentation.action.parameter.activityId = el.id;

//     elDocumentation.receiver = el.attrs.serviceNotificationReceiver.value;
//     elDocumentation.extraLabel = el.attrs.serviceNotificationTitle.value;
//     elDocumentation.extraValue = el.attrs.serviceNotificationDescription.value;
//     elDocumentation.targetElement = el.attrs.serviceNotificationActionForElement.value;

//     el.attrs.documentation.value = JSON.stringify(elDocumentation);
// }

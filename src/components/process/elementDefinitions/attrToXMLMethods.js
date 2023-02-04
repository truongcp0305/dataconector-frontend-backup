import { allNodesAttrs } from './../allAttrsOfNodes';
const noNeedPrefix = {
    name: true,
    id: true,
    escalationCode: true,
};
const PREFIX = 'symper:';

function removeSpaces(str) {
    return typeof str == 'string'
        ? str.replace(/\\r\\n/g, ' ').replace(/\r\n/g, ' ')
        : str;
}

function clearEmptyAttr(bizObj) {
    for (let key in bizObj) {
        if (bizObj[key] === '') {
            delete bizObj[key];
        }
    }

    for (let key in bizObj.$attrs) {
        if (bizObj.$attrs[key] === '') {
            delete bizObj.$attrs[key];
        }
    }
}
export default {
    addStringValueAsTag(el, elKey, attr, bpmnModeler, attrName) {
        let moddle = bpmnModeler.get('moddle');
        let newEl = moddle.create('symper:' + attr.toXML.name);
        newEl.text = attr.value;
        el[elKey].unshift(newEl);
    },
    // Tạo ra các thẻ mới và chèn vào element cha
    pushNewEqualEls(el, elKey, attr, bpmnModeler, attrName) {
        let moddle = bpmnModeler.get('moddle');
        let modeling = bpmnModeler.get('modeling');
        let attrValue = attr.value;

        if (attr.hasOwnProperty('getValueForXML')) {
            attrValue = attr.getValueForXML(attr.value);
        }

        for (let item of attrValue) {
            let canAdd = false;
            for (let key in item) {
                if (item[key]) {
                    canAdd = true;
                    break;
                }
            }

            if (canAdd) {
                let newEl = moddle.create('symper:' + attr.toXML.name);
                newEl.text = '';
                for (let key in item) {
                    if (noNeedPrefix[key]) {
                        newEl[key] = item[key];
                    } else {
                        let newkey = 'symper:' + key;
                        newEl.$attrs[newkey] = item[key];
                    }
                }
                console.log(newEl, 'newElnewElnewElnewElnewEl');

                el[elKey].unshift(newEl);
            }
        }
    },

    setValueAsAttr(el, elKey, attr, bpmnModeler, attrName) {
        let modeling = bpmnModeler.get('modeling');
        let nodeAllAttrs = allNodesAttrs[attrName];
        let value = nodeAllAttrs.getValue(attr.value);

        if (nodeAllAttrs.hasOwnProperty('getValueForXML')) {
            value = nodeAllAttrs.getValueForXML(attr.value);
        }
        if (attrName != 'overrideid') {
            let objToUpdate = {};
            if (typeof value != 'number' && typeof value != 'string') {
                value = JSON.stringify(value);
            }
            let toXMLname = nodeAllAttrs.toXML.name;
            if (nodeAllAttrs.toXMLExtend) {
                toXMLname = nodeAllAttrs.toXMLExtend.name;
            }

            if (value !== '') {
                objToUpdate[toXMLname] = value;
                if (el.businessObject) {
                    clearEmptyAttr(el.businessObject);
                    // el.businessObject.$attrs[attrName] = value;
                    modeling.updateProperties(el, objToUpdate);
                }
            } else {
                if (toXMLname.includes('skipExpression')) {
                    delete el.businessObject.skipExpression;
                }
            }
        }
    },

    formPropertyMethod(el, elKey, attr, bpmnModeler, attrName) {
        let moddle = bpmnModeler.get('moddle');
        let modeling = bpmnModeler.get('modeling');
        let extensionElements = moddle.create('bpmn:ExtensionElements');
        extensionElements.values = [];
        for (let row of attr.getValue(attr.value)) {
            let subEl = moddle.create('symper:formProperty');
            for (let key in row) {
                let vl = row[key];
                subEl[key] = vl;
            }
            extensionElements.values.push(subEl);
        }
        modeling.updateProperties(el, {
            extensionElements,
        });
    },

    dataObjectMethod(el, elKey, attr, bpmnModeler, attrName) {
        let moddle = bpmnModeler.get('moddle');
        let modeling = bpmnModeler.get('modeling');
        let mapDataObject = {};

        for (let item of attr.value) {
            if (!item.id || !item.name) {
                continue;
            }
            let dataObject = moddle.create('symper:dataObject');
            dataObject.id = item.id;
            dataObject.name = item.name;
            dataObject.itemSubjectRef = 'xsd:string';

            let extensionElement = moddle.create('bpmn:ExtensionElements');
            let valueTag = moddle.create('symper:symper_symper_value_tag');
            valueTag.text = item.defaultValue;
            extensionElement.values = [valueTag];

            modeling.updateProperties(
                {
                    businessObject: dataObject,
                },
                {
                    extensionElements: extensionElement,
                },
            );
            mapDataObject[item.id] = dataObject;
        }

        for (let idx in el[elKey]) {
            let item = el[elKey][idx];
            if (mapDataObject[item.id]) {
                el[elKey][idx] = mapDataObject[item.id];
                delete mapDataObject[item.id];
            }
        }

        for (let objKey in mapDataObject) {
            el[elKey].push(mapDataObject[objKey]);
        }
    },

    notPushToXML(el, elKey, attr, bpmnModeler, attrName) {},

    documentationMethod(el, elKey, attr, bpmnModeler, attrName) {
        if (el.businessObject) {
            let moddle = bpmnModeler.get('moddle');
            let bizObj = el.businessObject;
            let newEl = moddle.create('symper:documentation');
            newEl.text = removeSpaces(attr.value);
            bizObj.documentation = [newEl];
        }
    },
    subLoopCharMethod(el, elKey, attr, bpmnModeler, attrName) {
        if (el.businessObject && el.businessObject.loopCharacteristics) {
            let moddle = bpmnModeler.get('moddle');
            let bizObj = el.businessObject;
            let newEl = moddle.create('bpmn:Expression');

            newEl.text = attr.value;
            newEl.body = attr.value;
            // bizObj.loopCharacteristics.completionCondition = newEl;
            bizObj.loopCharacteristics[attr.toXML.name] = newEl;
        }
    },

    collectionMethod(el, elKey, attr, bpmnModeler, attrName) {
        if (
            el.businessObject &&
            el.businessObject.loopCharacteristics &&
            attr.value
        ) {
            let moddle = bpmnModeler.get('moddle');
            let bizObj = el.businessObject;
            let newEl = moddle.create('bpmn:Expression');

            bizObj.loopCharacteristics['symper:collection'] = attr.value;
        }
    },

    scriptTextForScriptNodeMethod(el, elKey, attr, bpmnModeler, attrName) {
        if (el.businessObject && attr.value.trim() != '') {
            let bizObj = el.businessObject;
            bizObj['script'] = '<![CDATA[' + attr.value + ']]>';
        }
    },

    conditionExpressionMethod(el, elKey, attr, bpmnModeler, attrName) {
        if (el.businessObject) {
            let moddle = bpmnModeler.get('moddle');
            let bizObj = el.businessObject;
            let elTagName = attr.toXML.name;

            if (attr.value.trim() != '') {
                let value = attr.value.replace(/\n|\r\n/g, ' ');
                let newEl = moddle.create('bpmn:FormalExpression');
                newEl['xsi:type'] = 'tFormalExpression';
                newEl.text = '<![CDATA[' + value + ']]>';
                newEl.body = '<![CDATA[' + value + ']]>';
                bizObj[elTagName] = newEl;
            } else if (bizObj[elTagName]) {
                delete bizObj[elTagName];
            }
        }
    },
    // giống với formPropertyMethod
    acllActivityIOParamsMethod(el, elKey, attr, bpmnModeler, attrName) {
        let moddle = bpmnModeler.get('moddle');
        let modeling = bpmnModeler.get('modeling');
        let bizEl = el.businessObject;
        let extensionElements = bizEl.extensionElements;

        if (!extensionElements) {
            extensionElements = moddle.create('bpmn:ExtensionElements');
            extensionElements.values = [];
        } else if (!extensionElements.values) {
            extensionElements.values = [];
        }
        let tagName = attr.toXML.name;

        for (let row of attr.getValue(attr.value)) {
            let subEl = moddle.create('symper:' + tagName);
            let valid = false;
            for (let key in row) {
                let vl = row[key];
                if (vl) {
                    subEl[key] = vl;
                    valid = true;
                }
            }

            if (valid) {
                extensionElements.values.push(subEl);
            }
        }

        modeling.updateProperties(el, {
            extensionElements,
        });
    },
    signalExpressionMethod(el, elKey, attr, bpmnModeler, attrName) {
        let moddle = bpmnModeler.get('moddle');
        let bizEl = el.businessObject;
        
        if (attr.value && attr.value.trim()) {
            let signal = moddle.create('bpmn:SignalEventDefinition');
            signal.$attrs['symper:signalExpression'] = attr.value
            bizEl.eventDefinitions[0] = signal;
        }
    },
    messageRefMethod(el, elKey, attr, bpmnModeler, attrName) {
        let moddle = bpmnModeler.get('moddle');
        let bizEl = el.businessObject;

        if (attr.value && attr.value.trim()) {
            let msg = moddle.create('bpmn:Message');
            msg.id = attr.value;
            msg.name = attr.value;
            bizEl.eventDefinitions[0].messageRef = msg;
        }
    },

    pushConditionTagToXML(el, elKey, attr, bpmnModeler, attrName) {
        let moddle = bpmnModeler.get('moddle');
        let bizEl = el.businessObject;
        if (attr.value && attr.value.trim()) {
            let eventDefinitions = moddle.create(
                'bpmn:ConditionalEventDefinition',
            );
            let expression = moddle.create('bpmn:Expression');
            expression.body = attr.value.trim().replace(/\n|\r\n/g, ' ');
            eventDefinitions.condition = expression;
            bizEl.eventDefinitions = [eventDefinitions];
        }
    },
};

import { allNodesAttrs } from './../allAttrsOfNodes';

const noNeedPrefix = {
    id: true,
    name: true,
    isExecutable: true,
    isForCompensation: true,
    scriptFormat: true,
    terminateAll: true,
    assignee: true,
};
// custom các element để đưa vào  xml của thư viện moodle
let customExt = {
    name: 'SymperCustomExtension',
    uri: 'http://symper/schema/bpmn/custom-extension',
    prefix: 'symper',
    xml: {
        tagAlias: 'lowerCase',
    },
    types: [
        {
            name: 'SymperDefaultExtType',
            extends: ['bpmn:FlowNode'],
            properties: [],
        },
    ],
    emumerations: [],
    associations: [],
};

for (let attrName in allNodesAttrs) {
    let toXML = allNodesAttrs[attrName].toXML;

    if (!toXML.defined) {
        if (toXML.symper_position == 'attr' && !noNeedPrefix[toXML.name]) {
            customExt.types[0].properties.push(toXML);
        } else if (toXML.symper_position == 'el') {
            customExt.types.push(toXML);
            if (toXML.extraElements) {
                for (let item of toXML.extraElements) {
                    customExt.types.push(item);
                }
            }
        }
    }
}
export default customExt;

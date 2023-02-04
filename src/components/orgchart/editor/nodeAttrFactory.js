import { SYMPER_APP } from '../../../main';
import { DEPARTMENT_NODE_DATA } from '../nodeDefinition/departmentDefinition';
import { POSITION_NODE_DATA } from '../nodeDefinition/positionDefinition';

export const SYMPER_HOME_ORGCHART = 'SYMPER_HOME_ORGCHART';

export const getNodeStyleConfig = function () {
    return {
        highlight: {
            title: SYMPER_APP.$t('v2.orgchart.highlightColor'), 
            type: 'color',
            value: '#f58634',
            info: '',
        },
        public: {
            title: SYMPER_APP.$t('v2.orgchart.publicThisStyle'),
            type: 'checkbox',
            value: false,
            info: '',
        },
    };
};

export const getAllNodeAttrs = function () {
    return {
        name: {
            title: SYMPER_APP.$t('v2.orgchart.name'),
            type: 'text',
            value: '',
            info: '',
        },
        description: {
            title: SYMPER_APP.$t('v2.orgchart.description'),
            type: 'text',
            value: '',
            info: '',
        },
        code: {
            title: SYMPER_APP.$t('v2.orgchart.code'),
            type: 'text',
            value: '',
            info: '',
        },
    };
};

export const getDefaultConfigNodeData = function (
    nodeId,
    isDepartment = false,
) {
    let config = {
        commonAttrs: getAllNodeAttrs(),
        customAttributes: [],
        id: nodeId,
        style: getNodeStyleConfig(),
        collapseExpandStatus: 'collapse', // expand | collapse
    };
    if (nodeId == 'SYMPER_HOME_ORGCHART') {
        let isDefault = {
            title: SYMPER_APP.$t('v2.orgchart.defaultOrganizationalChart'),
            type: 'checkbox',
            value: false,
        };
        let mappingDoc = {
            title: SYMPER_APP.$t('v2.orgchart.usedDocument'),
            type: 'autocomplete',
            value: '',
            options: [],
        };
        let scriptMapping = {
            title: SYMPER_APP.$t('v2.orgchart.conditionsForSelectingDisplayRecords'),
            type: 'script',
            value: '',
        };
        let tableMapping = {
            title: SYMPER_APP.$t('v2.orgchart.matchInformationFormDocToNodes'),
            type: 'table',
            value: [{}],
            columns: [
                {
                    title: SYMPER_APP.$t('v2.orgchart.control'),
                    name: 'control',
                    type: 'autocomplete',
                    source: [],
                },
                {
                    title: SYMPER_APP.$t('v2.orgchart.nodeField'),
                    name: 'nodeColumn',
                    type: 'autocomplete',
                    source: ['image', 'name', 'code'],
                },
            ],
        };
        config.commonAttrs.mappingDoc = mappingDoc;
        config.commonAttrs.scriptMapping = scriptMapping;
        config.commonAttrs.tableMapping = tableMapping;
        config.commonAttrs.isDefault = isDefault;
    }
    if (isDepartment) {
        config.positionDiagramCells = {
            instanceKey: Date.now(),
            cells: false,
        };
    } else {
        config.users = [];
        config.permissions = [];
        config.isSetPermissions = false;
    }
    config.dataFromDoc = {
        users: [],
    };
    return config;
};

export const getDynamicAttr = function () {
    return {
        name: '',
        value: '',
        doseFutureApply: 0,
        dosePastApply: 0,
    };
};

export const getOrgchartEditorData = function () {
    return {
        allNode: {},
        selectingNode: {
            positionDiagramCells: {
                cells: {
                    cells: [],
                },
                instanceKey: '',
            },
        },
        homeConfig: getDefaultConfigNodeData(SYMPER_HOME_ORGCHART),
    };
};

function addPosToDpm(rsl, map, currentId, rootId, addPosToDpm) {
    rsl[rootId][currentId] = map[currentId];
    if (map[currentId].children) {
        for (let childId of map[currentId].children) {
            addPosToDpm(rsl, map, childId, rootId, addPosToDpm);
        }
    }
}

export const getMapDpmIdToPosition = function (allPosition) {
    let mapIdToPos = allPosition.reduce((obj, el) => {
        obj[el.vizId] = el;
        return obj;
    }, {});

    let posInDpm = {};

    for (let id in mapIdToPos) {
        let pos = mapIdToPos[id];
        let parentPos = mapIdToPos[pos.vizParentId];
        if (parentPos) {
            if (!parentPos.children) {
                parentPos.children = [];
            }
            parentPos.children.push(id);
        } else {
            // khi position này là root
            posInDpm[id] = {};
        }
    }

    for (let id in posInDpm) {
        addPosToDpm(posInDpm, mapIdToPos, id, id, addPosToDpm);
    }
    let mapDpmToPos = {};

    for (let id in posInDpm) {
        let dpmId = mapIdToPos[id].vizParentId;
        mapDpmToPos[dpmId] = posInDpm[id];
    }
    return mapDpmToPos;
};

// A helper to create an arrow connection
export const jointLinkNode = function (source, target) {
    return new joint.shapes.org.Arrow(
        {
            source: { id: source.id },
            target: { id: target.id },
            attrs: {
                '.connection': {
                    'stroke-width': 1,
                },
                '.marker-arrowheads': {
                    display: 'none',
                },
                label: {
                    text: 'Hello',
                },
                isHidden: function () {
                    // If the target element is collapsed, we don't want to
                    // show the link either
                    var targetElement = this.getTargetElement();
                    return !targetElement || targetElement.isHidden();
                },
            },
            isHidden: function () {
                // If the target element is collapsed, we don't want to
                // show the link either
                // var targetElement = this.getTargetElement();
                // return !targetElement || targetElement.isHidden();
            },
        },
        {
            // isHidden: function() {
            //     // If the target element is collapsed, we don't want to
            //     // show the link either
            //     var targetElement = this.getTargetElement();
            //     return !targetElement || targetElement.isHidden();
            // }
        },
    );
};

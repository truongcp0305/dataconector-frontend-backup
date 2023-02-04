import { autoLoadNodeClasses } from '@/components/dataflow/configPool/dataflowConfig.js';
import _cloneDeep from 'lodash/cloneDeep';
let mapTypeToNodeClass = autoLoadNodeClasses();

export const DISPLAY_CONFIGS = {
    width: 50,
    height: 50,
    padding: 7.5,
    fontFamily: 'Roboto',
    fontStyle: 'Medium',
    labelFontSize: 13,
    highlightWidBordergetColor: '#f58634',
    normalWidgetBorderColor: '#8f8f8f',
    hightlightWidth: 1.5,
    normalWidth: 1.5,
};
var StrokeColerObj = {
    Filter: 'rgba(74, 91, 140, 1)',
    Formula: 'rgba(251, 126, 0, 1)',
    Join: 'rgba(251, 126, 0, 1)',
    Load: 'rgba(97, 196, 84, 1)',
    Split: 'rgba(251, 126, 0, 1)',
    Pivot: 'rgba(74, 91, 140, 1)',
    Sort: 'rgba(74, 91, 140, 1)',
    Union: 'rgba(251, 126, 0, 1)',
    WeightAvg: 'rgba(251, 126, 0, 1)',
    Script: 'rgba(251, 126, 0, 1)',
    Select: 'rgba(97, 196, 84, 1)',
    Validate: 'rgba(208, 74, 0, 1)',
    TransposeTable: 'rgba(74, 91, 140, 1)',
    Summarize: 'rgba(251, 126, 0, 1)',
};
var descriptionObj = {
    Filter: SYMPER_APP.$t('v2.dataflow.filterDataflowNodeTitle'),
    Formula: SYMPER_APP.$t('v2.dataflow.formulaDataflowNodeTitle'),
    Join: SYMPER_APP.$t('v2.dataflow.joinDataflowNodeTitle'),
    Load: SYMPER_APP.$t('v2.dataflow.loadDataflowNodeTitle'),
    Split: SYMPER_APP.$t('v2.dataflow.splitDataflowNodeTitle'),
    Pivot: SYMPER_APP.$t('v2.dataflow.pivotDataflowNodeTitle'),
    Sort: SYMPER_APP.$t('v2.dataflow.sortDataflowNodeTitle'),
    Union: SYMPER_APP.$t('v2.dataflow.unionDataflowNodeTitle'),
    WeightAvg: SYMPER_APP.$t('v2.dataflow.weightAvgDataflowNodeTitle'),
    Script: SYMPER_APP.$t('v2.dataflow.scriptDataflowNodeTitle'),
    Select: SYMPER_APP.$t('v2.dataflow.selectDataflowNodeTitle'),
    Validate: SYMPER_APP.$t('v2.dataflow.validateDataflowNodeTitle'),
    TransposeTable: SYMPER_APP.$t('v2.dataflow.transposeTableDataflowNodeTitle'),
    Summarize: SYMPER_APP.$t('v2.dataflow.summarizeDataflowNodeTitle'),
};
function getDescription(type) {
    return descriptionObj[type];
}
function getStrokeColer(type) {
    return StrokeColerObj[type];
}
function makeTextBreak(text) {
    return joint.util.breakText(
        text,
        {
            width: DISPLAY_CONFIGS.width * 2,
            height: DISPLAY_CONFIGS.height * 3,
            title: text,
        },
        {
            'font-size': DISPLAY_CONFIGS.labelFontSize,
            title: text,
        },
    );
}

var removeIconSvg = `<g width="15" height="15" class="d-none symper-widget-remove" >
                        <g  transform="matrix(1,0,0,1,25,-3)">
                            <circle stroke-width="0" r="7" fill="#FF1D00" cursor="pointer" >
                            </circle>
                            <path d="M -3 -3 3 3 M -3 3 3 -3" fill="none" stroke="#FFFFFF" stroke-width="2" pointer-events="none" joint-selector="icon">
                            </path>
                        </g>
                    </g>`;

export const registerNodeDisplay = function () {
    var defaultAttrs = {
        size: { width: 50, height: 50 },
        root: {
            magnet: false,
        },
        allowOrthogonalResize: false,
        attrs: {
            size: { width: 50, height: 50 },
            image: {
                height: DISPLAY_CONFIGS.height,
                width: DISPLAY_CONFIGS.width,
            },
            root: {
                dataTooltip: 'Ellipse with ports',
                dataTooltipPosition: 'left',
                dataTooltipPositionSelector: '.joint-stencil',
            },
            rect: {
                rx: 5,
                ry: 5,
            },
            '.symper-widget': {
                height: DISPLAY_CONFIGS.height + 20,
                width: DISPLAY_CONFIGS.width + 20,
                fill: 'white',
            },
            '.symper-widget-background': {
                fill: 'transparent',
                height: DISPLAY_CONFIGS.height,
                width: 185,
                y: -8,
                x: -5,
                fill:'rgba(242, 242, 242, 1)',

                
            },
            // 
            '.symper-widget-remove': {
                event: 'node:remove',
            },
            '.symper-widget-frame': {
                strokeWidth: 1,
                r: DISPLAY_CONFIGS.width / 2,
                cx: DISPLAY_CONFIGS.width / 2,
                cy: DISPLAY_CONFIGS.width / 2,
            },
            '.symper-widget-image': {
                height: DISPLAY_CONFIGS.height - 2 * DISPLAY_CONFIGS.padding,
                width: DISPLAY_CONFIGS.width - 2 * DISPLAY_CONFIGS.padding,
                x: DISPLAY_CONFIGS.padding + 2.5,
                y: DISPLAY_CONFIGS.padding + 2.5,
            },
            '.symper-widget-label': {
                y: DISPLAY_CONFIGS.height + 15,
                display: 'none',
                // x: DISPLAY_CONFIGS.width + 15,
                fill: '#6D6D6D',
                'strokeWidth': '0px',
                'fontSize': DISPLAY_CONFIGS.labelFontSize,
                'font-family': DISPLAY_CONFIGS.fontFamily,
                'font-style': DISPLAY_CONFIGS.fontStyle,
                'font-weight':'400'
            },
            '.symper-widget-sub-label' : {
                y: DISPLAY_CONFIGS.height / 2 - 10,
                x: DISPLAY_CONFIGS.width - 8,
                fill: '#1B1B1B',
                strokeWidth: '0px',
                fontSize: DISPLAY_CONFIGS.labelFontSize,
                'font-family': DISPLAY_CONFIGS.fontFamily,
                'font-weight':'500',
            },
            '.symper-widget-desc': {
                fill: '#6D6D6D',
                'font-family': DISPLAY_CONFIGS.fontFamily,
                'font-weight':'400',
                'fontSize': '10px',
                strokeWidth: '0px',
                y: DISPLAY_CONFIGS.height / 2 + 5,
                x: DISPLAY_CONFIGS.width - 8,
            },
            '.symper-widget-node-status-background':{
                    strokeWidth: 1,
                    fill:'transparent',
                    'strokeDasharray':'5, 5',
                    height:DISPLAY_CONFIGS.height+12,
                    width:DISPLAY_CONFIGS.width+12,
                    y:-10,
                    x:-6,
                },
        },
        ports: {
            groups: {
                in: {
                    markup: [
                        {
                            tagName: 'circle',
                            selector: 'portBody',
                            attributes: {
                                r: 5,
                            },
                        },
                    ],
                    position: {
                        name: 'right',

                        args: {
                            x: 0,
                            y: DISPLAY_CONFIGS.height / 2,
                        },
                    },
                    attrs: {
                        portLabel: {
                            fontSize: 11,
                            fill: '#61549c',
                            fontWeight: 800,
                        },
                        portBody: {
                            magnet: true,
                            r: 5,
                            x: DISPLAY_CONFIGS.width,
                            y: DISPLAY_CONFIGS.height - 5,
                            fill: 'gray',
                            stroke: 'white',
                            strokeWidth: 3,
                        },
                    },
                    label: {
                        position: {
                            name: 'right',
                            args: {
                                y: 0,
                            },
                        },
                    },
                },

                out: {
                    markup: [
                        {
                            tagName: 'circle',
                            selector: 'portBody',
                            attributes: {
                                r: 5,
                            },
                        },
                    ],
                    position: {
                        name: 'right',

                        args: {
                            x: DISPLAY_CONFIGS.width,
                            y: DISPLAY_CONFIGS.height / 2,
                        },
                    },
                    attrs: {
                        portLabel: {
                            fontSize: 11,
                            fill: '#61549c',
                            fontWeight: 800,
                        },
                        portBody: {
                            magnet: true,
                            r: 5,
                            x: DISPLAY_CONFIGS.width,
                            y: DISPLAY_CONFIGS.height - 5,
                            fill: 'gray',
                            stroke: 'white',
                            strokeWidth: 3,
                        },
                    },
                    label: {
                        position: {
                            name: 'right',
                            args: {
                                y: 0,
                            },
                        },
                    },
                },
            },
            items: [{ group: 'out' }, { group: 'in' }],
        },
    };
    var prototypeProps = {
        portMarkup: '<circle class="port-body"  />',
        markup: [
            '<g class="symper-widget">',
            '<rect class="symper-widget-background"/>',
            '<rect class="symper-widget-node-status-background"/>',
            '<circle  class="symper-widget-frame"/>',
            '<image class="symper-widget-image"/>',
            '<text class="symper-widget-label"/>',
            '<text class="symper-widget-sub-label"/>',
            '<text class="symper-widget-desc"/>',
            removeIconSvg,
            '</g>',
        ].join(''),
        portLabelMarkup: [
            {
                tagName: 'text',
                selector: 'portLabel',
            },
        ],
    };
    for (let type in mapTypeToNodeClass) {
        if (type != 'home') {
            let customttr = _cloneDeep(defaultAttrs);
            let customProp = _cloneDeep(prototypeProps);
            customttr.attrs[
                '.symper-widget-image'
            ].xlinkHref = require('@/../public/img/dataflow/' + type + '.svg');
            customttr.attrs['.symper-widget-image'].unHightLightHref =
                customttr.attrs['.symper-widget-image'].xlinkHref;
            customttr.attrs[
                '.symper-widget-image'
            ].hightLightHref = require('@/../public/img/dataflow/' +
                type +
                'White.svg');
            // customttr.attrs.root.title = type;
            customttr.attrs['.symper-widget-frame'].stroke =
                getStrokeColer(type);
            customttr.attrs['.symper-widget-label'].text = makeTextBreak(type);
            customttr.attrs['.symper-widget-sub-label'].text =
                makeTextBreak(type);
            let description = getDescription(type);

            let portKeys = Object.keys(customttr.ports.groups);
            portKeys.forEach((key) => {
                customttr.ports.groups[key].attrs.portBody.fill =
                    getStrokeColer(type);
            });
            customttr.attrs['.symper-widget-desc'].text = description;
            if (type === 'Load') {
                customttr.ports.items.splice(1, 1);
            }
            joint.shapes.standard.Image.define(
                'app.' + type,
                customttr,
                customProp,
            );
        }
    }
    joint.shapes.standard.Link.define('app.Link', {
        z: -1,
        router: {
            name: 'manhattan',
            args: {
                elementPadding: 100,
            },
        },
        connector: {
            name: 'rounded',
            args:{
                radius: 10
            }
        },
        labels: [],
        attrs: {
            line: {
                z: 1,
                stroke: '#8f8f8f',
                strokeWidth: 1.5,
                fill: 'none',
                sourceMarker: {
                    type: 'path',
                    d: 'M 0 0 0 0',
                    stroke: 'none',
                },
                targetMarker: {
                    type: 'path',
                    d: 'M13.41,4.58L8.83,0L13.41,-5.41L12,-6L6,0L12,6L13.41,4.58Z',
                    'stroke': 'none',
                   
                },
            },
        },
    });
};

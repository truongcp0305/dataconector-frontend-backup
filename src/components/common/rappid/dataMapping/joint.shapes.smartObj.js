'use strict';

(function (joint, util) {
    joint.shapes.standard.Link.define('mapping.Link', {
        symperLinkType: 'oo',
        z: -1,
        attrs: {
            line: {
                connector: 'rounded',
                targetMarker: {
                    z: 'auto',
                    type: 'circle',
                    fill: '#959595',
                    r: 4,
                    radius: 20,
                    'stroke-width': 2,
                    stroke: '#FFFFFF',
                },
                sourceMarker: {
                    type: 'circle',
                    fill: '#959595',
                    r: 4,
                    'stroke-width': 2,
                    stroke: '#FFFFFF',
                },
                stroke: '#959595',
                'stroke-width': 1.5,
                strokeWidth: 1.5,
            },
        },
    });

    joint.shapes.standard.HeaderedRecord.define(
        'mapping.Record',
        {
            itemHeight: 25,
            itemOffset: 15,
            itemMinLabelWidth: 120,
            padding: { top: 65, left: 13, right: 4, bottom: 5 },
            itemOverflow: true,

            attrs: {
                body: {
                    fill: 'white',
                    stroke: '#959595',
                    strokeWidth: 0.5,
                    rx: 5,
                    ry: 5,
                },
                symperDatasetConfigs: {
                    id: 0,
                    label: '',
                },
                root: {
                    magnet: false,
                },
                header: {
                    height: 60,
                    width: 170,
                    strokeWidth: 0,
                    stroke: '#959595',
                },
                headerBottomBorder: {
                    strokeWidth: 0.5,
                    stroke: '#959595',
                    width: 170,
                    height: 0.05,
                    refY: 60,
                },
                headerLabel: {
                    fontFamily: 'Roboto',
                    fontWeight: 'bold',
                    fontSize: 13,

                    textWrap: {
                        ellipsis: true,
                        height: 24,
                    },
                    refX: '50%',
                    refY: 20,
                },
                headerSubLabel: {
                    fill: '#6D6D6D',
                    fontFamily: 'Roboto',
                    fontWeight: 'Normal',
                    fontSize: 13,

                    textWrap: {
                        ellipsis: true,
                        height: 24,
                    },
                    textAnchor: 'middle',
                    textVerticalAnchor: 'middle',
                    refY: 45,
                    refX: '50%',
                },
                buttonsGroups: {
                    stroke: 'black',
                },
                forksGroups: {
                    stroke: 'lightgray',
                },
                itemBodies: {
                    itemHighlight: {
                        stroke: '#00000000',
                        strokeWidth: 0,
                    },
                    magnet: 'true',
                    cursor: 'pointer',
                },
                itemLabels: {
                    magnet: 'true',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontFamily: 'Roboto',
                    itemHighlight: {
                        fill: '#fe854f',
                    },
                    x: 27,
                },
                itemLabels_disabled: {
                    magnet: null,
                    fill: '#aaaaaa',
                    cursor: 'not-allowed',
                },
            },
        },
        {
            setTitle: function (name, opt) {
                this.attr(['headerLabel', 'textWrap', 'text'], name, opt);
            },

            setName: function (name, opt) {
                this.attr(['headerSubLabel', 'text'], name, opt);
            },
            getDefaultItem: function () {
                return {
                    id: util.uuid(),
                    label: 'new_item',
                    icon: 'images/document.svg',
                };
            },

            getItemTools: function () {
                return [
                    { action: 'edit', content: SYMPER_APP.$t('v2.general.editItem') },
                    { action: 'add-child', content: SYMPER_APP.$t('v2.general.addChild') },
                    // { action: 'add-next-sibling', content: SYMPER_APP.$t('v2.general.addNextSibling') },
                    // { action: 'add-prev-sibling', content: SYMPER_APP.$t('v2.general.addPrevSibling') },
                    { action: 'remove', content: warning(SYMPER_APP.$t('v2.general.removeItem')) },
                ];
            },

            getTools: function () {
                return [
                    { action: 'add-item', content: SYMPER_APP.$t('v2.general.addChild') },
                    { action: 'remove', content: warning(SYMPER_APP.$t('v2.general.removeRecord')) },
                ];
            },
            setTabColor(color) {
                return this.attr(['tabColor', 'fill'], color);
            },

            getTabColor() {
                return this.attr(['tabColor', 'fill']);
            },
            getInspectorConfig: function () {
                return {
                    label: {
                        label: SYMPER_APP.$t('v2.general.label'),
                        type: 'content-editable',
                    },
                    icon: {
                        label: SYMPER_APP.$t('v2.general.icon'),
                        type: 'select-button-group',
                        options: [
                            {
                                value: 'images/link.svg',
                                content:
                                    '<img height="42px" src="images/link.svg"/>',
                            },
                            {
                                value: 'images/document.svg',
                                content:
                                    '<img height="42px" src="images/document.svg"/>',
                            },
                            {
                                value: 'images/clipboard.svg',
                                content:
                                    '<img height="42px" src="images/clipboard.svg"/>',
                            },
                            {
                                value: 'images/file.svg',
                                content:
                                    '<img height="42px" src="images/file.svg"/>',
                            },
                        ],
                    },
                    highlighted: {
                        label: SYMPER_APP.$t('v2.general.highlighted'),
                        type: 'toggle',
                    },
                };
            },
        },
    );

    joint.shapes.mapping.RecordView = joint.shapes.standard.RecordView;

    function warning(text) {
        return '<span style="color:#fe854f">' + text + '</span>';
    }
})(joint, joint.util);

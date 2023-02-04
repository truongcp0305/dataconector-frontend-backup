'use strict';

(function (joint) {
    var SourceArrowhead = joint.linkTools.SourceArrowhead.extend({
        tagName: 'circle',
        attributes: {
            cx: 2,
            r: 8,
            fill: 'transparent',
            stroke: 'transparent',
            'stroke-width': 2,
            cursor: 'move',
            class: 'target-arrowhead',
            'fill-opacity': 0.2,
        },
    });

    var TargetArrowhead = joint.linkTools.TargetArrowhead.extend({
        tagName: 'circle',
        attributes: {
            cx: -2,
            r: 8,
            fill: 'transparent',
            stroke: 'transparent',
            'stroke-width': 2,
            cursor: 'move',
            class: 'target-arrowhead',
            'fill-opacity': 0.2,
        },
    });

    var Button = joint.linkTools.Button.extend({
        children: [
            {
                tagName: 'circle',
                selector: 'button',
                attributes: {
                    r: 8,
                    fill: 'red',
                    stroke: 'red',
                    'stroke-width': 2,
                    cursor: 'pointer',
                },
            },
            {
                tagName: 'path',
                selector: 'icon',
                attributes: {
                    d: 'M -4 -4 4 4 M -4 4 4 -4',
                    fill: '#f6f6f6',
                    stroke: '#f6f6f6',
                    'stroke-width': 2,
                    'pointer-events': 'none',
                },
            },
        ],
    });
    //
    var Label1 = joint.linkTools.Button.extend({
        children: [
            {
                tagName: 'circle',
                selector: 'button',
                attributes: {
                    r: 8,
                    'fill-opacity': 1,

                    fill: '#f6f6f600',
                    stroke: '#f6f6f600',
                    'stroke-width': 2,
                    cursor: 'pointer',
                },
            },
        ],
    });

    var Label2 = joint.linkTools.Button.extend({
        children: [
            {
                tagName: 'circle',
                selector: 'button',
                attributes: {
                    r: 8,
                    'fill-opacity': 1,
                    fill: '#f6f6f600',
                    stroke: '#f6f6f600',
                    'stroke-width': 2,
                    cursor: 'pointer',
                },
            },
        ],
    });

    joint.linkTools.mapping = {
        SourceArrowhead: SourceArrowhead,
        TargetArrowhead: TargetArrowhead,
        Remove: Button,
        Label1: Label1,
        Label2: Label2,
    };
})(joint);
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
    append as svgAppend,
    attr as svgAttr,
    classes as svgClasses,
    create as svgCreate,
    innerSVG,
} from 'tiny-svg';

import { getRoundRectPath } from 'bpmn-js/lib/draw/BpmnRenderUtil';
import { Elements } from './customCanvas/pathAndStyleValue';

import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { drawCustomIcon } from './customCanvas/customElements/drawIcon';
import { drawShape, renderEmbededLabel, drawSpecialShape } from './customCanvas/customElements/drawElement';

const HIGH_PRIORITY = 1500;

const STATUS_COLORS = {
    end: '#52B415',
    running: '#0760D9',
};
export default class CustomRenderer extends BaseRenderer {
    constructor(eventBus, bpmnRenderer) {
        super(eventBus, HIGH_PRIORITY);
        this.bpmnRenderer = bpmnRenderer;
        this.bpmnRenderer.drawConnection = (parentNode, element)=>{
            var type = element.type;
            var h = this.bpmnRenderer.handlers[type];
            let path = h(parentNode, element)
            svgAttr(path, {
              stroke: '#9F9F9F',
              'stroke-width':1,
            })
            return path;
          }
    }

    canRender(element) {
        // ignore labels
        if(!element.labelTarget&&(Object.keys(Elements).find(key=>key.includes(element.type))||element.type=="bpmn:DataObjectReference"||element.type=="bpmn:DataStoreReference"||element.type=="bpmn:Group")){
            return true
          }
    }

    drawShape(parentNode, element) {
        let specialShape = drawSpecialShape(element, parentNode, this)
        if(specialShape){
          svgAppend(parentNode, specialShape)
          return specialShape
        }
          
          // vẽ hình chính (hình vuông, hình tròn...)
            let customShape = drawShape(parentNode,element)
            // vẽ icon 
            let icon = drawCustomIcon(parentNode, element,element.type)
            
            // đối với event do type của event khác so với các elemenet khác
            if(element.type =="bpmn:StartEvent" || element.type =="bpmn:IntermediateCatchEvent"||element.type =="bpmn:IntermediateThrowEvent"|| element.type=="bpmn:EndEvent"){
              
              if(element.businessObject.eventDefinitions){
                  icon = drawCustomIcon(parentNode, element,element.type+':'+element.businessObject.eventDefinitions[0].$type)
              }
            }
    
            customShape.map(shape=>{
              svgAppend(parentNode,shape)
            })
            icon.map(subIcon=>{
              svgAppend(parentNode,subIcon)
            })
            let text = renderEmbededLabel(parentNode, element)
              svgAppend(parentNode,text)
            
        if (element.type.includes('Task')) {
            let countEnd = element.businessObject.$attrs.countEnd;
            let countRunning = element.businessObject.$attrs.countRunning;
            let r = 16;
            let runner = 0;
            customShape.map(shape=>{
                svgClasses(shape).add('cursor-pointer');
            })
            if (countEnd) {
                let rect = drawRect(
                    parentNode,
                    r + 5,
                    r,
                    2,
                    STATUS_COLORS['end'],
                );
                svgAttr(rect, {
                    transform: `translate(24, -16)`,
                });
                let x = countEnd > 9 ? 3 : 7;
                insertText(parentNode, countEnd, STATUS_COLORS['end'], x);
            }
            if (countRunning) {
                let rect = drawRect(
                    parentNode,
                    r + 5,
                    r,
                    2,
                    STATUS_COLORS['running'],
                );
                let offset = runner * r * 1.5;
                svgAttr(rect, {
                    transform: `translate(${offset}, -16)`,
                });
                let x = countRunning > 9 ? 27 : 31;
                insertText(
                    parentNode,
                    countRunning,
                    STATUS_COLORS['running'],
                    x,
                );
            }
        }
        return customShape;
    }

    getShapePath(shape) {
        if (is(shape, 'bpmn:Task')) {
            return getRoundRectPath(shape, 2);
        }

        return this.bpmnRenderer.getShapePath(shape);
    }

    getColor(suitabilityScore) {
        if (suitabilityScore > 100) {
            return COLOR_GREEN;
        } else if (suitabilityScore > 25) {
            return COLOR_YELLOW;
        }

        return COLOR_RED;
    }
}

CustomRenderer.$inject = ['eventBus', 'bpmnRenderer'];

// helpers //////////

// copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
function drawRect(parentNode, width, height, borderRadius, color) {
    const rect = svgCreate('rect');
    svgAttr(rect, {
        width: width,
        height: height,
        rx: borderRadius,
        ry: borderRadius,
        stroke: color,
        strokeWidth: 2,
        fill: color + '00',
        id: 'abc-xyz' + Date.now(),
        class: 'call-activity-btn',
        'z-index': 10000000,
    });

    svgAppend(parentNode, rect);

    return rect;
}

function insertText(parentNode, countInfor, colorSet = null, x) {
    const text = svgCreate('text');
    const textRole = svgCreate('text');
    svgAttr(text, {
        x: x,
        y: -3,
        fill: colorSet ? colorSet.stroke : '#52B415',
    });
    svgAttr(textRole, {
        x: 4,
        y: 115,
        fill: '#aaaaaa',
    });
    svgAppend(parentNode, text);
    svgAppend(parentNode, textRole);
    innerSVG(text, countInfor);
    return text;
}

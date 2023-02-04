import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
    append as svgAppend,
    attr as svgAttr,
    create as svgCreate,
    innerSVG,
} from 'tiny-svg';

import { getRoundRectPath } from 'bpmn-js/lib/draw/BpmnRenderUtil';
import { Elements } from './customCanvas/pathAndStyleValue';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { drawShape, renderEmbededLabel, drawSpecialShape } from './customCanvas/customElements/drawElement';
import { drawCustomIcon } from './customCanvas/customElements/drawIcon';

const HIGH_PRIORITY = 1500;

const STATUS_COLORS = {
    done: '#61c22f',
    todo: '#0760D9',
    overdue: '#cc0000',
};
export default class CustomRenderer extends BaseRenderer {
    constructor(eventBus, bpmnRenderer) {
        super(eventBus, HIGH_PRIORITY);
        this.bpmnRenderer = bpmnRenderer;
        this.bpmnRenderer.drawConnection = (parentNode, element)=>{
            var type = element.type;
            var h = this.bpmnRenderer.handlers[type];
    
            /* jshint -W040 */
            let path = h(parentNode, element)
            let style = {
              'stroke-width':1
            }
            if(element.businessObject.$attrs.nodeStatus=='done'){
              style['stroke-width']=2
            }
            svgAttr(path, style)
            return path;
          }
    }

    canRender(element) {
        if(!element.labelTarget&&(Object.keys(Elements).find(key=>key.includes(element.type))||element.type=="bpmn:DataObjectReference"||element.type=="bpmn:DataStoreReference"||element.type=="bpmn:Group")){
          return true
        }
    }

    drawShape(parentNode, element) {
      //trường hợp là subprocess
      let specialShape = drawSpecialShape(element,parentNode, this)
      if(specialShape){
        svgAppend(parentNode, specialShape)
        return specialShape
      }
      
      // vẽ hình chính (hình vuông, hình tròn...)
        let customShape = drawShape(parentNode,element)
        // vẽ icon 
        let iconType = element.type
        let icon
        
        // đối với event do type của event khác so với các elemenet khác
        if(element.type =="bpmn:StartEvent" || element.type =="bpmn:IntermediateCatchEvent"||element.type =="bpmn:IntermediateThrowEvent"|| element.type=="bpmn:EndEvent"){
          
          if(element.businessObject.eventDefinitions){
              iconType =element.type+':'+element.businessObject.eventDefinitions[0].$type
          }
        }
        icon = drawCustomIcon(parentNode, element,iconType)
        customShape.map(shape=>{
          svgAppend(parentNode,shape)
        })
        icon.map(subIcon=>{
          svgAppend(parentNode,subIcon)
        })
        let text = renderEmbededLabel(parentNode, element)
          svgAppend(parentNode,text)
        if (element.type.includes('Task')|| element.type.includes('CallActivity')) {
            let instanceStatus = element.businessObject.$attrs.statusCount;
            let currentNode = element.businessObject.$attrs.currentNode;
            let infoAssignee = element.businessObject.$attrs.infoAssignee;
            let colorSet = element.businessObject.$attrs.setColor;
            let runner = 0;
            let r = 4;
            let color;
            for (let key in instanceStatus) {
                if (instanceStatus[key]) {
                    color = STATUS_COLORS[key];
                    let rect = drawRect(parentNode, r, r, r, color);
                    let offset = runner * r * 2!=0?runner * r * 2+4*runner:4;
                    svgAttr(rect, {
                        transform: `translate(${offset}, -8)`,
                    });
                    runner += 1;
                }
            }
            if (currentNode) {
                let rect = insertLocationIcon(parentNode);
            }
            if (infoAssignee) {
                insertInforUser(parentNode, infoAssignee, colorSet);
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
        strokeWidth: 3,
        fill: color
    });

    svgAppend(parentNode, rect);

    return rect;
}

function insertLocationIcon(parentNode) {
    const img = svgCreate('path');
    svgAttr(img, {
        d:'M7.33333 7.9333V11.3333C7.33333 11.5101 7.40357 11.6797 7.5286 11.8047C7.65362 11.9297 7.82319 12 8 12C8.17681 12 8.34638 11.9297 8.4714 11.8047C8.59643 11.6797 8.66667 11.5101 8.66667 11.3333V7.9333C9.47603 7.76809 10.1952 7.30825 10.6848 6.64291C11.1744 5.97758 11.3995 5.15416 11.3165 4.33229C11.2334 3.51042 10.8482 2.74866 10.2354 2.19468C9.62268 1.6407 8.82605 1.33398 8 1.33398C7.17395 1.33398 6.37732 1.6407 5.76456 2.19468C5.15181 2.74866 4.76657 3.51042 4.68355 4.33229C4.60052 5.15416 4.82562 5.97758 5.3152 6.64291C5.80478 7.30825 6.52397 7.76809 7.33333 7.9333ZM8 2.66664C8.39556 2.66664 8.78224 2.78394 9.11114 3.0037C9.44004 3.22346 9.69638 3.53582 9.84776 3.90127C9.99913 4.26672 10.0387 4.66886 9.96157 5.05682C9.8844 5.44478 9.69392 5.80115 9.41421 6.08085C9.13451 6.36056 8.77814 6.55104 8.39018 6.62821C8.00222 6.70538 7.60009 6.66577 7.23463 6.5144C6.86918 6.36302 6.55682 6.10668 6.33706 5.77778C6.1173 5.44888 6 5.0622 6 4.66664C6 4.1362 6.21071 3.6275 6.58579 3.25242C6.96086 2.87735 7.46957 2.66664 8 2.66664ZM10.8067 9.61331C10.7191 9.59492 10.6288 9.59396 10.5409 9.61048C10.453 9.62699 10.3692 9.66067 10.2943 9.70957C10.2194 9.75848 10.1548 9.82166 10.1043 9.89551C10.0538 9.96935 10.0184 10.0524 10 10.14C9.98162 10.2275 9.98065 10.3178 9.99717 10.4058C10.0137 10.4937 10.0474 10.5775 10.0963 10.6524C10.1452 10.7273 10.2084 10.7918 10.2822 10.8423C10.356 10.8928 10.4391 10.9283 10.5267 10.9466C12.04 11.2466 12.6667 11.7866 12.6667 12C12.6667 12.3866 11.0333 13.3333 8 13.3333C4.96667 13.3333 3.33333 12.3866 3.33333 12C3.33333 11.7866 3.96 11.2466 5.47333 10.92C5.56088 10.9016 5.64395 10.8661 5.7178 10.8156C5.79165 10.7652 5.85483 10.7006 5.90373 10.6257C5.95264 10.5508 5.98631 10.467 6.00283 10.3791C6.01935 10.2912 6.01839 10.2009 6 10.1133C5.98162 10.0258 5.94617 9.94269 5.89568 9.86884C5.84519 9.79499 5.78065 9.73181 5.70574 9.68291C5.63084 9.634 5.54703 9.60033 5.45911 9.58381C5.37119 9.56729 5.28088 9.56825 5.19333 9.58664C3.16667 10.0533 2 10.9266 2 12C2 13.7533 5.02 14.6666 8 14.6666C10.98 14.6666 14 13.7533 14 12C14 10.9266 12.8333 10.0533 10.8067 9.61331Z',
        fill:'#FF3913',  
        transform:'translate(70, 6)',
        x: 75,
        y: -25,
    });
    svgAppend(parentNode, img);
    return img;
}
function insertAvatar(parentNode, infoAssignee){
  let container = svgCreate('defs')
  svgAttr(container,{})
  let rect = svgCreate('rect')
  svgAttr(rect,{
    id:'avatar'+infoAssignee.assignee.id,
    width:16,
    height:16,
    x:0,
    y:85,
    rx:12.5
  })
  let idClipPath = 'clipPath'+infoAssignee.assignee.id
  let clipPath = svgCreate('clipPath')
  svgAttr(clipPath,{
    id:idClipPath
  })
  let useContext = svgCreate('use')
  svgAttr(useContext,{
    'href':"#avatar"+infoAssignee.assignee.id
  })
  let useImage = svgCreate('use')
  svgAttr(useImage,{
    'href':"#avatar"+infoAssignee.assignee.id
  })
  svgAppend(clipPath,useContext)
  svgAppend(container,rect)
  svgAppend(container,clipPath)

  let image = svgCreate('image')
  svgAttr(image, {
    'href':'https://file-service.symper.vn/user-avatar?userId='+infoAssignee.assignee.id,
    height:16,
    x:0,
    y:85,
    'clip-path':'url(#'+idClipPath+')'
  })

  svgAppend(parentNode,useImage)
  svgAppend(parentNode,image)
  svgAppend(parentNode,container)
}
function insertInforUser(parentNode, infoAssignee, colorSet = null) {
    const text = svgCreate('text');
    const textRole = svgCreate('text');
    svgAttr(text, {
        x: 18,
        y: 95,
        'font-size':10,
        fill: colorSet ? colorSet.stroke : '#52B415',
    });
    svgAttr(textRole, {
        x: 18,
        y: 110,
        fill: '#aaaaaa',
        'font-size':9
    });
      svgAppend(parentNode, text);
      svgAppend(parentNode, textRole);
      if(infoAssignee.assignee.displayName){
        insertAvatar(parentNode,infoAssignee)
        innerSVG(text, infoAssignee.assignee.displayName);
      }  
      else{
        // innerSVG(text, SYMPER_APP.$t('common.bad_user_information'));
      }
  
    if (infoAssignee.role) {
        innerSVG(textRole, infoAssignee.role.name);
    }
    return text;
}


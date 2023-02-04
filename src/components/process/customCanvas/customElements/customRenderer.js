import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import {
    append as svgAppend,
    attr as svgAttr,
  } from 'tiny-svg';
import { Elements } from '../pathAndStyleValue';
import { drawShape, renderEmbededLabel, drawSpecialShape } from './drawElement';
import { drawCustomIcon } from './drawIcon';
const HIGH_PRIORITY = 1500;

export default class CustomRenderer extends BaseRenderer {
    constructor(eventBus, bpmnRenderer,pathMap) {
      super(eventBus, HIGH_PRIORITY,pathMap);
        
      this.bpmnRenderer = bpmnRenderer;
      this.bpmnRenderer.drawConnection = (parentNode, element)=>{
        var type = element.type;
        var h = this.bpmnRenderer.handlers[type];

        /* jshint -W040 */
        let path = h(parentNode, element)
        svgAttr(path, {
          stroke: '#9F9F9F',
          'stroke-width':1,
        })
        return path;
      }
    }
    
  
    canRender(element) {
      if(Object.keys(Elements).find(key=>key.includes(element.type))||element.type=="bpmn:DataObjectReference"||element.type=="bpmn:DataStoreReference"||element.type=="bpmn:Group"){
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
          
          if(element.businessObject.eventDefinitions&&element.businessObject.eventDefinitions.length){
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
        return customShape;
    }
  }
  
  CustomRenderer.$inject = [ 'eventBus', 'bpmnRenderer', 'pathMap'];

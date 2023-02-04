// tập hợp các function vẽ tại đây
import {
    append as svgAppend,
    attr as svgAttr,
    create as svgCreate,
    remove as svgRemove
  } from 'tiny-svg';
  import { Icon } from '../../pathAndStyleValue';
  import { cloneDeep } from 'lodash';

const drawIcon = function(config){
    const icon = svgCreate('path')
    svgAttr(icon,config)
    return icon
}

export default drawIcon


export function drawCustomIcon(parentNode,element,type){
  let customIcon=[]
  for(let iconType in Icon){
    if(type.includes(iconType)){
      let config = cloneDeep(Icon[iconType])
      if(element.type.includes('Task') && (element.businessObject.$attrs.nodeStatus=="done"||element.businessObject.$attrs.nodeStatus=="todo")){
        config.fill="#FFFFFF"
        if(config.stroke){
        config.stroke="#FFFFFF"}
      }
      let icon = drawIcon(config)
      customIcon.push(icon)
    }
  }
  if(element.type.includes('Task') && (element.businessObject.$attrs.nodeStatus=="done"||element.businessObject.$attrs.nodeStatus=="todo")){
    let icon = drawIcon(Icon['instance'])
    customIcon.unshift(icon)
  }
  return customIcon
}
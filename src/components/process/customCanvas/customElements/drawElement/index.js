// tập hợp các function vẽ tại đây
import {
    append as svgAppend,
    classes as svgClasses,
    attr as svgAttr,
    create as svgCreate,
    remove as svgRemove
  } from 'tiny-svg';
import { Elements } from '../../pathAndStyleValue';
import TextUtil from 'diagram-js/lib/util/Text'
import { cloneDeep } from 'lodash';
import { isExpanded } from 'bpmn-js/lib/util/DiUtil';


const nodeStatusColors = {
  failed: {
      fill: '#F6E648',
      stroke: '#EF7600'
  },
  todo: {
      fill: '#E9ECFE' ,
      stroke: '#007AFF'
  },
  done: {
      fill: '#D7F2C6',
      stroke: '#38AA28'
  },
  notStart: {
      fill: '#FFFFFF',
      stroke: '#EF7600'
  }
};

const drawElement= function(configShape){
    const shape = svgCreate(configShape.shapeType)
    svgAttr(shape, configShape.style)
    return shape
}
export default drawElement


export function drawShape(parentNode,element){
      let customShape = []
    for(let type in Elements){
  
      if(type.includes(element.type)){
        let config = cloneDeep(Elements[type])
        if(element.businessObject.$attrs.nodeStatus && !element.type.includes('EndEvent')){
          if((element.businessObject.$attrs.nodeStatus=='done'||element.businessObject.$attrs.nodeStatus=='todo')&&element.type!='bpmn:CallActivity'){
          config.style['stroke-width']=1.5
          }
          config.style.fill = nodeStatusColors[element.businessObject.$attrs.nodeStatus].fill
          config.style.stroke = nodeStatusColors[element.businessObject.$attrs.nodeStatus].stroke
        }
        if(element.businessObject.$attrs.nodeStatus&&element.businessObject.$attrs.nodeStatus=="done" && element.type.includes('Gateway')){
          config.style.stroke = "#EF7600"
          config.style.fill = "#F6E648"
        }
        let shape = drawElement(config)
        customShape.push(shape)
      }
    }
    return customShape
}

export function renderEmbededLabel(parentNode,element){
  var textUtil = new TextUtil({style:{
    fontFamily: 'Arial, sans-serif',
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 1.2,
    
  }})
  let text = textUtil.createText(element.businessObject.name?element.businessObject.name:'',{
    size: {
      width:100
    },
    box: element,
    padding:5,
    align:'center-middle',})
  svgClasses(text).add('djs-label')
  return text 
}

//một vài hình đặc biệt
export function drawSpecialShape(element, parentNode, renderer){
  let shape
  if(element.type=='bpmn:SubProcess' &&isExpanded(element)){
    shape = drawElement({shapeType:'rect',
    style:{
      width:element.width,
      height:element.height,
      rx:8,
      ry:8,
      stroke:'#EF7600',
        fill: '#FFFFFF',
        'stroke-width': 0.5
    }
    })
  }
  if(element.type == "bpmn:DataStoreReference"){
    shape = svgCreate('path')
    svgAttr(shape,{
      d:"M5.1288 31.5541L4.7 31.3502V31.825V40C4.7 40.3015 4.82008 40.6041 5.01436 40.8922C5.2097 41.1819 5.49173 41.4746 5.84682 41.763C6.55713 42.3398 7.58948 42.923 8.90172 43.4444C11.5288 44.4883 15.317 45.3 20 45.3C24.683 45.3 28.4712 44.4883 31.0983 43.4444C32.4105 42.923 33.4429 42.3398 34.1532 41.763C34.5083 41.4746 34.7903 41.1819 34.9856 40.8922C35.1799 40.6041 35.3 40.3015 35.3 40V31.825V31.3502L34.8712 31.5541C30.2337 33.7587 25.141 34.8366 20.008 34.7001L20 34.6999L19.992 34.7001C14.859 34.8366 9.7663 33.7587 5.1288 31.5541ZM5.1288 16.5541L4.7 16.3502V16.825V25C4.7 25.3015 4.82008 25.6041 5.01436 25.8922C5.2097 26.1819 5.49173 26.4746 5.84682 26.763C6.55713 27.3398 7.58948 27.923 8.90172 28.4444C11.5288 29.4883 15.317 30.3 20 30.3C24.683 30.3 28.4712 29.4883 31.0983 28.4444C32.4105 27.923 33.4429 27.3398 34.1532 26.763C34.5083 26.4746 34.7903 26.1819 34.9856 25.8922C35.1799 25.6041 35.3 25.3015 35.3 25V16.825V16.3502L34.8712 16.5541C30.2337 18.7587 25.141 19.8366 20.008 19.7001L20 19.6999L19.992 19.7001C14.859 19.8366 9.7663 18.7587 5.1288 16.5541ZM8.77775 36.9208C9.13953 36.679 9.56488 36.55 10 36.55C10.5835 36.55 11.1431 36.7818 11.5556 37.1944C11.9682 37.6069 12.2 38.1665 12.2 38.75C12.2 39.1851 12.071 39.6105 11.8292 39.9723C11.5875 40.334 11.2439 40.616 10.8419 40.7825C10.4399 40.9491 9.99756 40.9926 9.5708 40.9077C9.14404 40.8228 8.75204 40.6133 8.44437 40.3056C8.13669 39.998 7.92716 39.606 7.84227 39.1792C7.75739 38.7524 7.80095 38.3101 7.96747 37.9081C8.13398 37.5061 8.41596 37.1625 8.77775 36.9208ZM0.3 10C0.3 6.89213 2.66031 4.46943 6.37254 2.80821C10.0731 1.1522 15.0284 0.3 20 0.3C24.9716 0.3 29.9269 1.1522 33.6275 2.80821C37.3397 4.46943 39.7 6.89213 39.7 10V40C39.7 43.1079 37.3397 45.5306 33.6275 47.1918C29.9269 48.8478 24.9716 49.7 20 49.7C15.0284 49.7 10.0731 48.8478 6.37254 47.1918C2.66031 45.5306 0.3 43.1079 0.3 40V10ZM4.7 10C4.7 10.3015 4.82008 10.6041 5.01436 10.8922C5.2097 11.1819 5.49173 11.4746 5.84682 11.763C6.55713 12.3398 7.58948 12.923 8.90172 13.4444C11.5288 14.4883 15.317 15.3 20 15.3C24.683 15.3 28.4712 14.4883 31.0983 13.4444C32.4105 12.923 33.4429 12.3398 34.1532 11.763C34.5083 11.4746 34.7903 11.1819 34.9856 10.8922C35.1799 10.6041 35.3 10.3015 35.3 10C35.3 9.69849 35.1799 9.39589 34.9856 9.1078C34.7903 8.81813 34.5083 8.5254 34.1532 8.23704C33.4429 7.66022 32.4105 7.07699 31.0983 6.55558C28.4712 5.51172 24.683 4.7 20 4.7C15.317 4.7 11.5288 5.51172 8.90172 6.55558C7.58948 7.07699 6.55713 7.66022 5.84682 8.23704C5.49173 8.5254 5.2097 8.81813 5.01436 9.1078C4.82008 9.39589 4.7 9.69849 4.7 10ZM8.77775 21.9208C9.13953 21.679 9.56488 21.55 10 21.55C10.5835 21.55 11.1431 21.7818 11.5556 22.1944C11.9682 22.6069 12.2 23.1665 12.2 23.75C12.2 24.1851 12.071 24.6105 11.8292 24.9723C11.5875 25.334 11.2439 25.616 10.8419 25.7825C10.4399 25.949 9.99756 25.9926 9.5708 25.9077C9.14404 25.8228 8.75204 25.6133 8.44437 25.3056C8.13669 24.998 7.92716 24.606 7.84227 24.1792C7.75739 23.7524 7.80095 23.3101 7.96747 22.9081C8.13398 22.5061 8.41596 22.1625 8.77775 21.9208Z",
      fill:"#1976d2",
      stroke:'white',
      transform:"translate(6, 0)",
      'stroke-width':2
    })
  }
  if(element.type =="bpmn:DataObjectReference"){
    shape = svgCreate('path')
        svgAttr(shape,{
          d:"M22.3387 0.906045L36.207 14.6994C36.3487 14.8498 36.468 15.0195 36.5613 15.2033V15.341V15.3903L36.5771 15.4371C36.6366 15.6133 36.6778 15.795 36.7 15.9795V15.9798V15.9805V15.9812V15.982V15.9827V15.9834V15.9841V15.9849V15.9856V15.9863V15.987V15.9877V15.9884V15.9891V15.9898V15.9905V15.9912V15.9919V15.9926V15.9932V15.9939V15.9946V15.9953V15.996V15.9966V15.9973V15.9979V15.9986V15.9993V15.9999V16.0006V16.0012V16.0019V16.0025V16.0031V16.0038V16.0044V16.0051V16.0057V16.0063V16.0069V16.0075V16.0082V16.0088V16.0094V16.01V16.0106V16.0112V16.0118V16.0124V16.013V16.0136V16.0142V16.0148V16.0154V16.0159V16.0165V16.0171V16.0177V16.0183V16.0188V16.0194V16.02V16.0205V16.0211V16.0216V16.0222V16.0227V16.0233V16.0238V16.0244V16.0249V16.0254V16.026V16.0265V16.027V16.0276V16.0281V16.0286V16.0291V16.0297V16.0302V16.0307V16.0312V16.0317V16.0322V16.0327V16.0332V16.0337V16.0342V16.0347V16.0352V16.0357V16.0361V16.0366V16.0371V16.0376V16.0381V16.0385V16.039V16.0395V16.0399V16.0404V16.0409V16.0413V16.0418V16.0422V16.0427V16.0431V16.0436V16.044V16.0445V16.0449V16.0453V16.0458V16.0462V16.0466V16.0471V16.0475V16.0479V16.0483V16.0488V16.0492V16.0496V16.05V16.0504V16.0508V16.0512V16.0516V16.052V16.0524V16.0528V16.0532V16.0536V16.054V16.0544V16.0548V16.0552V16.0555V16.0559V16.0563V16.0567V16.057V16.0574V16.0578V16.0581V16.0585V16.0589V16.0592V16.0596V16.0599V16.0603V16.0606V16.061V16.0613V16.0617V16.062V16.0624V16.0627V16.063V16.0634V16.0637V16.064V16.0644V16.0647V16.065V16.0654V16.0657V16.066V16.0663V16.0666V16.0669V16.0672V16.0676V16.0679V16.0682V16.0685V16.0688V16.0691V16.0694V16.0697V16.07V16.0702V16.0705V16.0708V16.0711V16.0714V16.0717V16.072V16.0722V16.0725V16.0728V16.0731V16.0733V16.0736V16.0739V16.0741V16.0744V16.0747V16.0749V16.0752V16.0754V16.0757V16.0759V16.0762V16.0764V16.0767V16.0769V16.0772V16.0774V16.0777V16.0779V16.0781V16.0784V16.0786V16.0788V16.0791V16.0793V16.0795V16.0798V16.08V16.0802V16.0804V16.0806V16.0809V16.0811V16.0813V16.0815V16.0817V16.0819V16.0821V16.0823V16.0825V16.0827V16.083V16.0832V16.0833V16.0835V16.0837V16.0839V16.0841V16.0843V16.0845V16.0847V16.0849V16.0851V16.0852V16.0854V16.0856V16.0858V16.086V16.0861V16.0863V16.0865V16.0867V16.0868V16.087V16.0872V16.0873V16.0875V16.0877V16.0878V16.088V16.0881V16.0883V16.0884V16.0886V16.0888V16.0889V16.0891V16.0892V16.0893V16.0895V16.0896V16.0898V16.0899V16.0901V16.0902V16.0903V16.0905V16.0906V16.0907V16.0909V16.091V16.0911V16.0913V16.0914V16.0915V16.0917V16.0918V16.0919V16.092V16.0921V16.0923V16.0924V16.0925V16.0926V16.0927V16.0928V16.0929V16.0931V16.0932V16.0933V16.0934V16.0935V16.0936V16.0937V16.0938V16.0939V16.094V16.0941V16.0942V16.0943V16.0944V16.0945V16.0946V16.0947V16.0948V16.0949V16.0949V16.095V16.0951V16.0952V16.0953V16.0954V16.0955V16.0955V16.0956V16.0957V16.0958V16.0959V16.0959V16.096V16.0961V16.0962V16.0962V16.0963V16.0964V16.0965V16.0965V16.0966V16.0967V16.0967V16.0968V16.0969V16.0969V16.097V16.0971V16.0971V16.0972V16.0972V16.0973V16.0974V16.0974V16.0975V16.0975V16.0976V16.0976V16.0977V16.0977V16.0978V16.0978V16.0979V16.0979V16.098V16.098V16.0981V16.0981V16.0982V16.0982V16.0983V16.0983V16.0984V16.0984V16.0984V16.0985V16.0985V16.0986V16.0986V16.0986V16.0987V16.0987V16.0987V16.0988V16.0988V16.0988V16.0989V16.0989V16.0989V16.099V16.099V16.0991V16.0991V16.0992V16.0992V16.0993V16.0993V16.0994V16.0994V16.0995V16.0995V16.0995V16.0996V16.0996V16.0996V16.0997V16.0997V16.0997V16.0998V16.0998V16.0998V16.0999V16.0999V16.0999V16.1V39.1C36.7 40.8499 36.0011 42.5285 34.7565 43.7663C33.5118 45.0043 31.8234 45.7 30.0625 45.7H6.9375C5.1766 45.7 3.48815 45.0043 2.2435 43.7663C0.998909 42.5285 0.3 40.8499 0.3 39.1V6.9C0.3 5.1501 0.998909 3.47154 2.2435 2.23367C3.48815 0.995748 5.1766 0.3 6.9375 0.3H20.9014L21.5942 0.536867L21.6414 0.553H21.6912H21.8308C22.0161 0.645945 22.1872 0.764821 22.3387 0.906045ZM23.3366 7.63029L22.825 7.1215V7.843V13.8V14.1H23.125H29.1144H29.8414L29.3259 13.5873L23.3366 7.63029ZM18.8 4.6V4.3H18.5H6.9375C6.24514 4.3 5.58082 4.57354 5.09076 5.06095C4.60064 5.54842 4.325 6.20991 4.325 6.9V39.1C4.325 39.7901 4.60064 40.4516 5.09076 40.9391C5.58082 41.4265 6.24515 41.7 6.9375 41.7H30.0625C30.7549 41.7 31.4192 41.4265 31.9092 40.9391C32.3994 40.4516 32.675 39.7901 32.675 39.1V18.4V18.1H32.375H20.8125C20.2782 18.1 19.7662 17.8889 19.3889 17.5136C19.0116 17.1384 18.8 16.6299 18.8 16.1V4.6Z",
          fill:"#1976d2",
          stroke:'white',
          'stroke-width':1.2
        })
  }
  if(element.type=="bpmn:Group"){
    shape = renderer.bpmnRenderer.drawShape(parentNode, element);
    svgAttr(shape, {
      stroke:'#1976d2'
    })
  }
 return shape 
}
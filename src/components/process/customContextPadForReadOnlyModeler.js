import { SYMPER_APP } from '@/main.js';
export default class CustomContextPad {
  constructor(config, contextPad, create, elementFactory, injector, translate, components) {
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;
    this.instanceKey = config.instanceKey
    contextPad.registerProvider(this);
  }
  getContextPadEntries(element) {
    const {
      autoPlace,
      create,
      elementFactory,
      translate
    } = this;
    let self = this
    function callBack() {
      SYMPER_APP.$evtBus.$emit('show-call-activity-process-instace',self.instanceKey);
  }
    return function(entries){
      if(element.type=='bpmn:CallActivity'){
      return {
          'show-call-activity': {
              group: 'model',
              className: 'custom-button-context-pad-for-read-only',
              title: translate(SYMPER_APP.$t('v2.workflow.showModelerCallActivity')),
              action: {
                  click: callBack,
              },
          }
      }  }
      return
    }
  }
}

CustomContextPad.$inject = [
  'config',
  'contextPad',
  'create',
  'elementFactory',
  'injector',
  'translate'
];
import ContextPadProvider from "bpmn-js/lib/features/context-pad/ContextPadProvider";
import { SYMPER_APP } from '@/main.js';
export default class CustomContextPad {
  constructor(config, contextPad, create, elementFactory, injector, translate) {
    this.instanceKey = config.instanceKey
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;
    const _getContextPadEntries =
    ContextPadProvider.prototype.getContextPadEntries;
    ContextPadProvider.prototype.getContextPadEntries = function(element) {
      
      const entries = _getContextPadEntries.apply(this, [ element ]);
      for(let action in entries){
        entries[action].title = SYMPER_APP.$t(`v2.workflow.context-pad.${action.split(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/).join('_').toLowerCase()}`)
      }
      return entries;
    };

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
      SYMPER_APP.$evtBus.$emit('show-call-activity',self.instanceKey);
  }
  
  if(element.type=="bpmn:CallActivity"){
      return {
          'append.service-task': {
              group: 'connect',
              className: 'custom-button-context-pad',
              title: translate(SYMPER_APP.$t('v2.workflow.showModelerCallActivity')),
              action: {
                  click: callBack,
              },
          }
      }
  }
  return
    
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
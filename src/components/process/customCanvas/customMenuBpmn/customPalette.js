import {SYMPER_APP} from '@/main.js'

import PaletteProvider from "bpmn-js/lib/features/palette/PaletteProvider";
export default class CustomPalette {
  constructor(create, elementFactory, palette, translate) {
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;
    const _getPaletteEntries = PaletteProvider.prototype.getPaletteEntries;
    PaletteProvider.prototype.getPaletteEntries = function() {
      const entries = _getPaletteEntries.apply(this);
      for(let action in entries){
        entries[action].title = SYMPER_APP.$t(`v2.workflow.palette.${action.split(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/).join('_').toLowerCase()}`)
      }
      return entries;
    };
    palette.registerProvider(this);
  }
  getPaletteEntries(element) {
    const {
      create,
      elementFactory,
      translate
    } = this;

  
  }
}

CustomPalette.$inject = [
  'create',
  'elementFactory',
  'palette',
  'translate'
];
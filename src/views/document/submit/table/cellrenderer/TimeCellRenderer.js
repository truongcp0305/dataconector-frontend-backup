import BaseCellRenderer from './BaseCellRenderer';
import { SYMPER_APP } from '@/main.js';

export default class TimeCellRenderer extends BaseCellRenderer {
    constructor() {
        super();
        this.placeHolder = '';
        this.rightIcon =
            '<span style="position: absolute;right:2px;font-size: 14px;color: #ababab;" class="mdi mdi-clock-time-two-outline time-icon"></span>';
    }
    render() {
        let patternDateStr = 'HH:mm:ss';
        this.placeHolder = patternDateStr;
        this.eGui.innerHTML = this.getCellHtml();
        let self = this;
        if (
            Number(this.control.controlProperties.isReadOnly.value) == 0 &&
            this.tableEditable
        ) {
            this.eGui
                .getElementsByClassName('time-icon')[0]
                .addEventListener('click', function (e) {
                    let event = e;
                    event.controlName = self.control.name;
                    event.curTarget = self.eGui;
                    SYMPER_APP.$evtBus.$emit(
                        'document-submit-show-time-picker',
                        event,
                    );
                });
        } else {
            this.eGui
                .getElementsByClassName('time-icon')[0]
                .removeEventListener('click', event);
        }
    }
    cellDestroy() {
        this.eGui
            .getElementsByClassName('time-icon')[0]
            .removeEventListener('click', event);
    }
}

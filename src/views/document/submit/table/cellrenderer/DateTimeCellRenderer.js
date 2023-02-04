import BaseCellRenderer from './BaseCellRenderer';
import { SYMPER_APP } from '@/main.js';
/**
 * Lớp xử lý time cell renderer
 */
export default class DateTimeCellRenderer extends BaseCellRenderer {
    constructor() {
        super();
        this.placeHolder = '';
        this.rightIcon =
            '<span style="position: absolute;right:2px;font-size: 14px;color: #ababab;" class="mdi mdi-calendar"></span>';
    }
    renderGroupRow() {
        let patternDateStr = this.control.controlProperties.formatDateTime.value
            ? this.control.controlProperties.formatDateTime.value
            : 'YYYY-MM-DD HH:mm:ss';
        this.placeHolder = patternDateStr;
        let valueFormatted = this.control.getDateTimeChange(this.value);
        if (valueFormatted != false) {
            this.value = SYMPER_APP.$moment(
                valueFormatted,
                'YYYY-MM-DD HH:mm:ss',
            ).format(patternDateStr);
        }
        this.eGui.innerHTML = this.getCellGroupHtml();
        this.handleSelect();
        this.handleAddRowGroup();
    }
    render() {
        let patternDateStr = this.control.controlProperties.formatDateTime.value
            ? this.control.controlProperties.formatDateTime.value
            : 'YYYY-MM-DD HH:mm:ss';
        this.placeHolder = patternDateStr;
        let valueFormatted = this.control.getDateTimeChange(this.value);
        if (valueFormatted != false) {
            this.value = SYMPER_APP.$moment(
                valueFormatted,
                'YYYY-MM-DD HH:mm:ss',
            ).format(patternDateStr);
        }
        this.eGui.innerHTML = this.getCellHtml();
        if (
            Number(this.control.controlProperties.isReadOnly.value) == 0 &&
            this.tableEditable
        ) {
            this.handleSelect();
        } else {
            this.eGui
                .getElementsByClassName('mdi-calendar')[0]
                .removeEventListener('click', event);
        }
    }
    handleSelect() {
        let self = this;
        this.eGui
            .getElementsByClassName('mdi-calendar')[0]
            .addEventListener('click', function (e) {
                let event = e;
                event.controlName = self.control.name;
                event.control = self.control;
                event.curTarget = self.eGui;
                event.fromIcon = true;
                SYMPER_APP.$evtBus.$emit(
                    'document-submit-date-input-click',
                    event,
                );
            });
    }
    checkDateTimeValid() {
        let check = false;
        let valueFormatted = this.control.getDateTimeChange(this.value);
        if (valueFormatted == false) {
            if (this.value != '') {
                check = true;
                this.control.valueValidation['DateTimeValid'][this.rowId] = {
                    isValid: true,
                    msg: SYMPER_APP.$t('v2.doc.incorrectDateAndTimeFormat'),
                };
            }
        } else {
            this.control.valueValidation['DateTimeValid'][this.rowId] = {
                isValid: false,
            };
        }
        return check;
    }
    cellDestroy() {
        this.eGui
            .getElementsByClassName('mdi-calendar')[0]
            .removeEventListener('click', event);
        this.eGui
            .querySelector('.doc-button-add-group-row')
            .removeEventListener('click', event);
    }
}

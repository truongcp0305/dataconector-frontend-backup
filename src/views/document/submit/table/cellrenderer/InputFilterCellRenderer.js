import BaseCellRenderer from './BaseCellRenderer';
import { SYMPER_APP } from '@/main.js';
import store from '@/store';
export default class InputFilterCellRenderer extends BaseCellRenderer {
    constructor() {
        super();
        this.placeHolder = '';
        this.rightIcon =
            '<span style="position: absolute;right:2px;font-size: 14px;color: #ababab;cursor:pointer;" class="mdi mdi-filter-plus-outline"></span>';
    }
    render() {
        this.eGui.innerHTML = this.getCellHtml('ag-input-filter');
        let self = this;
        if (
            Number(this.control.controlProperties.isReadOnly.value) == 0 &&
            this.tableEditable
        ) {
            this.eGui
                .getElementsByClassName('mdi-filter-plus-outline')[0]
                .addEventListener('click', function (e) {
                    (e.controlName = self.control.name),
                        (e.formulas = self.control.controlFormulas.list);
                    SYMPER_APP.$evtBus.$emit(
                        'document-submit-filter-input-click',
                        e,
                    );
                });
        } else {
            this.eGui
                .getElementsByClassName('mdi-filter-plus-outline')[0]
                .removeEventListener('click', event);
        }
    }
    cellDestroy() {
        this.eGui
            .getElementsByClassName('mdi-filter-plus-outline')[0]
            .removeEventListener('click', event);
    }
}

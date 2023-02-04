import BaseCellRenderer from './BaseCellRenderer';
import { SYMPER_APP } from '@/main.js';

export default class SelectCellRenderer extends BaseCellRenderer {
    constructor() {
        super();
        this.placeHolder = '';
        this.rightIcon =
            '<span style="position: absolute;right:2px;font-size: 10px;color: #ababab;cursor:pointer;" class="select-chervon-bottom">▼</span>';
    }
    renderGroupRow() {
        this.eGui.innerHTML = this.getCellGroupHtml();
        this.handleSelect();
        this.handleAddRowGroup();
    }
    render() {
        this.eGui.innerHTML = this.getCellHtml();
        if (
            Number(this.control.controlProperties.isReadOnly.value) == 0 &&
            this.tableEditable != false
        ) {
            this.handleSelect();
        } else {
            this.eGui
                .getElementsByClassName('select-chervon-bottom')[0]
                .removeEventListener('click', event);
            this.eGui.removeEventListener('dblclick', event);
        }
    }
    handleSelect() {
        let self = this;
        let thisEl = this.eGui;
        this.eGui
            .getElementsByClassName('select-chervon-bottom')[0]
            .addEventListener('click', function (e) {
                e.curTarget = thisEl;
                SYMPER_APP.$evtBus.$emit('document-submit-select-input', {
                    e: e,
                    controlName: self.control.name,
                    rowNodeId: [self.rowId],
                    currentValue: self.value,
                    type: self.control.type,
                    isSingleSelect:
                        self.control.type == 'select' ? true : false,
                    fromIcon: true,
                });
            });
        this.eGui.addEventListener('dblclick', function (e) {
            e.curTarget = thisEl;
            SYMPER_APP.$evtBus.$emit('document-submit-select-input', {
                e: e,
                controlName: self.control.name,
                rowNodeId: [self.rowId],
                type: self.control.type,
                isSingleSelect: self.control.type == 'select' ? true : false,
                fromIcon: true,
                currentValue: self.value
            });
        });
    }
    cellDestroy() {
        this.eGui
            .getElementsByClassName('select-chervon-bottom')[0]
            .removeEventListener('click', event);
        this.eGui.removeEventListener('dblclick', event);
        this.eGui
            .getElementsByClassName('doc-button-add-group-row')
            .removeEventListener('click', event);
    }
}

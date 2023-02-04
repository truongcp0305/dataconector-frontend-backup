import BaseCellRenderer from './BaseCellRenderer';
import sDocument from '@/store/document';

export default class AutocompleteCellRenderer extends BaseCellRenderer {
    constructor() {
        super();
        this.placeHolder = '';
    }
    renderGroupRow() {
        this.render();
    }
    render() {
        if (this.control) {
            let mapValueToText =
                sDocument.state.submit[this.control.keyInstance]
                    .mapValueToTextAutocompleteInput[this.control.name];
            var text =
                this.value && mapValueToText && mapValueToText[this.value]
                    ? mapValueToText[this.value]
                    : this.value;
            if (this.control.type == 'user') {
                text = this.control.mapData[this.value];
            }
            if (!text) {
                text = '';
            }
            this.value = text;
            this.eGui.innerHTML = this.getCellHtml();
        }
    }
}

import BaseCellRenderer from './BaseCellRenderer';
export default class TextCellRenderer extends BaseCellRenderer {
    constructor() {
        super();
        this.placeHolder = '';
    }
    render() {
        this.eGui.innerHTML = this.getCellHtml();
    }
}

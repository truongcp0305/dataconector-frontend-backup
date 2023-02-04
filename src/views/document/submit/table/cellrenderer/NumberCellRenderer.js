import { str } from '../../../../../plugins/utilModules/str';
import BaseCellRenderer from './BaseCellRenderer';
let numeral = require('numeral');

export default class NumberCellRenderer extends BaseCellRenderer {
    constructor() {
        super();
        this.placeHolder = '';
    }
    render() {
        if (str.isNumeric(this.value)) {
            this.value = numeral(Number(this.value)).format(
                this.control.controlProperties.formatNumber.value,
            );
        } else if (this.value == '') {
            this.value = '0';
        }
        this.eGui.innerHTML = this.getCellHtml();
    }
}

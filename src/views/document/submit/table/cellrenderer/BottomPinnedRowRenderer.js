import { getControlInstanceFromStore } from '../../../common/common';

let numeral = require('numeral');
// init method gets the details of the cell to be renderer
export default class BottomPinnedRowRenderer {
    init(params) {
        this.eGui = document.createElement('div');
        let control = params.control;
        let tableIns = getControlInstanceFromStore(
            control.keyInstance,
            control.inTable,
        );
        let colValue = tableIns.tableInstance.getColDataAfterFilter(
            control.name,
        );
        if (typeof colValue == 'object') {
            let count = this.getCount(colValue);
            let optionEl =
                `<option value="sum">
                            <span>Count: </span>
                            <span>` +
                count +
                `</span>
                            </option>`;
            if (['number', 'percent'].includes(control.type)) {
                let sum = this.getSum(colValue);
                let avg = this.getAvg(sum, count);
                if (control.controlProperties.formatNumber.value) {
                    sum = numeral(sum).format(
                        control.controlProperties.formatNumber.value,
                    );
                    avg = numeral(avg).format(
                        control.controlProperties.formatNumber.value,
                    );
                }
                let numberOpEl =
                    `
                    <option value="avg">
                    <span>Sum: </span>
                    <span>` +
                    sum +
                    `</span>
                    </option>
                    <option value="count">
                    <span>Avg: </span>
                    <span>` +
                    avg +
                    `</span>
                    </option>
                `;
                optionEl = numberOpEl + optionEl;
            }
            let el =
                `
                <div class="select-table-bottom">
                    <select class="w-100">
                        ` +
                optionEl +
                `
                    </select>
                    <span style="position: absolute;right:8px;top:2px;font-size: 10px;color: #ababab;">▼</span>
                <div>
                `;
            this.eGui.innerHTML = el;
        } else {
            this.eGui.innerHTML = '';
        }
    }
    getGui() {
        return this.eGui;
    }
    getSum(array) {
        let sum = array.reduce((a, b) => {
            let numberA = a ? a : 0;
            let numberB = b ? b : 0;
            return Number(numberA) + Number(numberB);
        }, 0);
        return sum;
    }
    getCount(array) {
        return array.length;
    }
    getAvg(sum, length) {
        return sum / length;
    }
}

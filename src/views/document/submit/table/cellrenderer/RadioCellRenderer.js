import BaseCellRenderer from './BaseCellRenderer';
export default class RadioCellRenderer extends BaseCellRenderer {
    constructor() {
        super();
        this.placeHolder = '';
    }
    render() {
        let dot = this.getDotHtml();
        dot = !this.isHideDot ? dot : '';
        this.value = this.value ? true : false;
        let checked = this.value ? 'checked' : '';
        this.eGui.innerHTML =
            `<div style="position:relative;height:100%;width:100%;display:flex;"><input style="margin:auto;" class="input-checkbox" type="checkbox" ` +
            checked +
            `> ` +
            dot +
            `</div>`;
        let self = this;
        if (
            Number(this.control.controlProperties.isReadOnly.value) == 0 &&
            this.tableEditable
        ) {
            this.eGui
                .getElementsByClassName('input-checkbox')[0]
                .addEventListener('click', function (e) {
                    let colId = self.control.name;
                    self.params.node.setDataValue(colId, e.target.checked);
                });
        } else {
            this.eGui
                .getElementsByClassName('input-checkbox')[0]
                .removeEventListener('click', event);
        }
    }
}

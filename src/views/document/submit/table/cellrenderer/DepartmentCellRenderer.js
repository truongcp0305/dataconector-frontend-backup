import BaseCellRenderer from './BaseCellRenderer';
export default class DepartmentCellRenderer extends BaseCellRenderer {
    constructor() {
        super();
        this.placeHolder = '';
    }
    renderGroupRow() {
        this.render();
    }
    render() {
        if (this.control && this.control.mapData) {
            let mapData = this.control.mapData
            if (mapData[this.value]) {
                this.value = mapData[this.value]
            } else {
                this.value = ''
            }
        }
        this.eGui.innerHTML = this.getCellHtml('department-control');
        const self = this;
        this.eGui
            .getElementsByClassName('department-control')[0]
            .addEventListener('click', function (e) {
                if (
                    self.control && self.control.controlProperties.isReadOnly.value == 0
                ) {
                    SYMPER_APP.$evtBus.$emit(
                        'document-submit-department-click',
                        {
                            e: e,
                            control: self.control,
                            params: self.params
                        },
                    );
                }
            });
    }
}


export default class NodeLoadCustomDataRowRender {
    init(params) {
        let innerHTML;
        this.eGui = document.createElement('span');
        if (params.rowIndex == 0) {
            if (!params.value) {
                let txt = '';
                if (params.colDef.field == 'type') {
                    txt = SYMPER_APP.$t('v2.dataflow.choseType');
                } else if (params.colDef.field == 'name') {
                    txt = SYMPER_APP.$t('v2.dataflow.inputName');
                } else if (params.colDef.field == 'title') {
                    txt = SYMPER_APP.$t('v2.dataflow.inputTitle');
                }
                innerHTML = `<span class="grey--text text--lighten-1">${txt}</span>`;
            } else {
                innerHTML = params.value;
            }
        } else {
            innerHTML = params.value;
        }
        if (params.colDef.field == 'type') {
            innerHTML = innerHTML + '<i aria-hidden="true" class="v-icon notranslate mdi mdi-chevron-down theme--light" style="position: absolute; right: 0px; font-size: 17px; top: 6px;">'
        }
        this.eGui.innerHTML = innerHTML
    }

    getGui() {
        return this.eGui;
    }

    refresh(params) {
        return false;
    }
}

export const GroupRowCellRenderer = () => {};
import { SYMPER_APP } from '@/main.js';
import store from '../../../../store';
GroupRowCellRenderer.prototype.init = function (params) {
    if (!params.node.rowPinned) {
        if (params.node.group) {
            this.params = params;
            this.eGui = document.createElement('div');
            let checkHasFormulas = this.checkHasFormulas(params.node.field);
            let columnTitle = this.getTitleColumn(params.node.field);
            let placeHolder = checkHasFormulas
                ? SYMPER_APP.$t('v2.doc.clickToAddColumn') + columnTitle
                : SYMPER_APP.$t('v2.doc.selectColumn') + columnTitle + SYMPER_APP.$t('v2.doc.here');
            let valueFirstChild =
                params.node.allLeafChildren[0].data[params.node.field];
            let value =
                params.node.data && params.node.data[params.node.field]
                    ? params.node.data[params.node.field]
                    : valueFirstChild;
            let innerHTML =
                '<button type="button" style="height:24px; width:24px" class="v-btn doc-button-add-group-row v-btn--round theme--light">' +
                '<i aria-hidden="true" style="font-size:15px" class="v-icon notranslate mdi mdi-plus theme--light"></i>' +
                '</button>';
            // format css hiển thị tên row
            if (checkHasFormulas) {
                let spanFormulas =
                    '<input class="row-group-formulas w-100" placeholder="' +
                    placeHolder +
                    '" disabled value="' +
                    value +
                    '"></input>';
                this.eGui.innerHTML = innerHTML + spanFormulas;
            } else {
                let spanNoFormulas =
                    '<input class="row-group-no-formulas w-100" placeholder="' +
                    placeHolder +
                    '" value="' +
                    value +
                    '"></input>';
                this.eGui.innerHTML = innerHTML + spanNoFormulas;
                // set giá trị khi user nhập
                this.eGui
                    .querySelector('input')
                    .addEventListener('change', function (e) {
                        let value = this.value;
                        let updateRows = [];
                        params.node.setDataValue(params.node.field, value);
                        params.node.allLeafChildren.map((node) => {
                            node.data[params.node.field] = value;
                            updateRows.push(node.data);
                        });
                        params.api.applyTransaction({ update: updateRows });
                    });
            }
            // click vào nút add để thêm row
            this.eGui
                .querySelector('.doc-button-add-group-row')
                .addEventListener('click', function (e) {
                    e.controlName = params.node.field;
                    e.params = params;
                    if (!checkHasFormulas) {
                        SYMPER_APP.$evtBus.$emit(
                            'document-submit-add-group-row-no-formulas',
                            e,
                        );
                    } else {
                        SYMPER_APP.$evtBus.$emit(
                            'document-submit-add-group-row-has-formulas',
                            e,
                        );
                    }
                });
        } else {
            if (params.colDef.showColName) {
                this.eGui = document.createElement('div');
                this.eGui.innerHTML = params.value;
            }
        }
    }
};

GroupRowCellRenderer.prototype.getGui = function () {
    return this.eGui;
};
// control có công thức autocomplete hay không
GroupRowCellRenderer.prototype.checkHasFormulas = function (currentField) {
    let checkHasFormulas = false; // control có công thức autocomplete hay không
    let controlInTable = store.state.document.submit.rowGroup.controlInTable;
    Object.keys(controlInTable).map((control) => {
        let controlName = controlInTable[control].name;
        if (
            currentField == controlName &&
            controlInTable[control].controlFormulas.autocomplete
        ) {
            checkHasFormulas = true;
        }
    });
    return checkHasFormulas;
};
GroupRowCellRenderer.prototype.getTitleColumn = function (nameColumn) {
    let title = '';
    let controlInTable = store.state.document.submit.rowGroup.controlInTable;
    Object.keys(controlInTable).map((control) => {
        let controlName = controlInTable[control].name;
        if (nameColumn == controlName) {
            title = controlInTable[control].title;
        }
    });
    return title;
};

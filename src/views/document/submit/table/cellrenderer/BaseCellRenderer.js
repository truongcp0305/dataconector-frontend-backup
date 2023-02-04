import { SYMPER_APP } from '@/main.js';

/**
 * Lớp cơ sở xử lý cho cell renderer trong bảng
 */
export default class BaseCellRenderer {
    constructor() {
        this.control = null;
        this.rightIcon = '';
        this.isHideDot = true;
        this.tableEditable = true;
        this.rowId = null;
        this.eGui = document.createElement('div');
        this.value = '';
        this.params = null;
    }
    init(params) {
        if (params.colDef.colId == 'ag-Grid-AutoColumn') {
            if (!params.node.rowPinned) {
                this.control = params.colDef.control;
                this.params = params;
                this.eGui.style.height = '100%';
                this.eGui.style.width = '100%';
                this.rowId = params.node.id;
                if (params.node.group) {
                    this.renderGroupRow();
                } else {
                    if (params.colDef.showColName) {
                        this.eGui.innerHTML = params.value;
                    }
                }
            }
        } else {
            if (
                params.node.rowPinned ||
                (params.node.group &&
                    !params.control.checkProps('isSumGroupRow'))
            ) {
                return;
            }
            this.params = params;
            this.eGui.style.height = '100%';
            this.eGui.style.width = '100%';
            this.control = params.control;
            this.tableEditable = params.tableEditable;
            if (typeof params.value != 'undefined' && params.value != null) {
                this.value = params.value;
            }
            this.rowId = params.node.id;
            for (
                let index = 0;
                index < this.control.validateMessageType.length;
                index++
            ) {
                const type = this.control.validateMessageType[index];
                if (this.checkValidate(type)) {
                    this.showDot();
                }
            }
            this.checkHistoryOrLinkCell(params);
            this.render();
        }
    }
    getGui() {
        return this.eGui;
    }
    destroy(params) {
        if (this.eGui && params && !params.node.rowPinned) {
            this.cellDestroy();
        }
    }
    /**
     * Hàm kiểm tra cell có link control hay có lịch sử sửa đổi không
     * @param {*} params
     */
    checkHistoryOrLinkCell(params) {
        if (
            this.control.linkControlValue &&
            this.control.linkControlValue[this.rowId] &&
            this.control.linkControlValue[this.rowId].length > 0
        ) {
            this.eGui.classList.add('info-control-btn');
            this.eGui.setAttribute('rowIndex', params.rowIndex);
            
            this.eGui.setAttribute('data-control', this.control.name);
            this.eGui.setAttribute(
                'object_id',
                this.control.linkControlValue[this.rowId][0].value,
            );
            this.eGui.setAttribute(
                'link-title',
                this.control.linkControlValue[this.rowId][0].title,
            );
            this.rightIcon =  
                `<span style="position: absolute;right:2px;font-size: 10px;color: #ababab;cursor:pointer"> 
                    <span class="mdi mdi-link-variant icon-link-control" control-in-table="true" style="color:orange" >
                </span></span>`
        }
        if (
            this.control.cellHighlight &&
            this.control.cellHighlight[this.rowId]
        ) {
            this.eGui.classList.add('highlight-history');
        }
    }
    getCellHtml(classBinding = '') {
        let pl =
            '<span style="color: #ababab;font-size: 11px;">' +
            this.placeHolder +
            '</span>';
        let dot = this.getDotHtml();
        dot = !this.isHideDot ? dot : '';
        if (this.value == '' && this.placeHolder != '') {
            this.value = pl;
        }
        let divStyle = 'height:100%;width:100%;';
        if (this.rightIcon != '') {
            divStyle = 'height:100%;width:85%;overflow:hidden;';
        }
        return (
            `<div class="` +
            classBinding +
            `" style="` +
            divStyle +
            `">` +
            this.value +
            dot +
            this.rightIcon +
            `</div>`
        );
    }
    getCellGroupHtml(classBinding = '') {
        if (!this.params.value)
            this.params.value =
                SYMPER_APP.$t('v2.doc.selectColumnValue') + "' " + this.control.title + "'";
        let divStyle = 'height:100%;width:10%;';
        let addBtn =
            '<button type="button" class="mr-1 v-btn doc-button-add-group-row color-grey v-btn--round">' +
            '<i style="font-size:15px" class="v-icon notranslate mdi mdi-plus "></i>' +
            '</button>';
        return (
            addBtn +
            `<div class="` +
            classBinding +
            `" style="` +
            divStyle +
            `">` +
            this.params.value +
            this.rightIcon +
            `</div>`
        );
    }
    handleAddRowGroup() {
        const self = this;
        this.eGui
            .querySelector('.doc-button-add-group-row')
            .addEventListener('click', function (e) {
                e.controlName = self.control.name;
                e.params = self.params;
                SYMPER_APP.$evtBus.$emit(
                    'document-submit-add-group-row-no-formulas',
                    e,
                );
            });
    }
    getDotHtml() {
        return (
            '<span class="mdi mdi-checkbox-blank-circle validate-icon" control-name="' +
            this.control.name +
            '" row-node-id="' +
            this.rowId +
            '"></span>'
        );
    }

    hideDot() {
        this.isHideDot = true;
    }
    showDot() {
        this.isHideDot = false;
    }
    /**
     * Kiểm tra require control
     */
    checkRequire() {
        let isRequire = false;
        if (this.value == '') {
            if (
                this.control.isRequiredControl() ||
                (this.control.valueValidation['Require'] && this.control.valueValidation['Require'][this.rowId] &&
                    this.control.valueValidation['Require'][this.rowId]
                        .isValid == true)
            ) {
                isRequire = true;
                this.control.valueValidation['Require'][this.rowId] = {
                    isValid: true,
                    msg:
                        SYMPER_APP.$t('v2.doc.notBlankInforField')+
                        this.control.title,
                };
            }
        }
        if (!isRequire && this.control.valueValidation && this.control.valueValidation['Require']) {
            this.control.valueValidation['Require'][this.rowId] = {
                isValid: false,
            };
        }
        return isRequire;
    }
    /**
     * Kiểm tra require change control
     */
    checkRequireChange() {
        let isRequireChange = false;
        if (
            this.control.checkProps('isRequireChange') &&
            this.control.oldValue &&
            this.control.oldValue[this.rowId] == this.value
        ) {
            isRequireChange = true;
            this.control.valueValidation['RequireChange'][this.rowId] = {
                isValid: true,
                msg: SYMPER_APP.$t('v2.doc.requestChangeField') + this.control.title,
            };
        }
        if (!isRequireChange && this.control.valueValidation['RequireChange']) {
            this.control.valueValidation['RequireChange'][this.rowId] = {
                isValid: false,
            };
        }
        return isRequireChange;
    }
    /**
     * Kiểm tra các loại validate control
     */
    checkValidate(type) {
        if (type == 'Require') {
            return this.checkRequire();
        } else if (type == 'RequireChange') {
            return this.checkRequireChange();
        } else if (type == 'NaN') {
            if (
                this.control.type == 'number' ||
                this.control.type == 'percent'
            ) {
                return this.checkNaNValidate();
            }
        } else if (type == 'DateTimeValid') {
            if (this.control.type == 'dateTime') {
                return this.checkDateTimeValid();
            }
        } else if (type == 'DateValid') {
            if (this.control.type == 'date') {
                return this.checkDateValid();
            }
        } else {
            let isValidate = false;
            if (
                this.control.valueValidation[type] &&
                this.control.valueValidation[type][this.rowId] &&
                this.control.valueValidation[type][this.rowId].isValid == true
            ) {
                isValidate = true;
            }
            return isValidate;
        }
    }
    checkNaNValidate() {
        let check = false;
        var text = this.value ? this.value : 0;
        if (
            (isNaN(Number(text)) && !/^=/.test(text)) ||
            /[a-zA-Z]/.test(text)
        ) {
            check = true;
            this.eGui.style.background = 'red';
            this.control.valueValidation['NaN'][this.rowId] = {
                isValid: true,
                msg:
                    SYMPER_APP.$t('v2.doc.requestFieldValue')  +
                    this.control.title +
                    SYMPER_APP.$t('v2.doc.inTable') +
                    this.control.inTable +
                    SYMPER_APP.$t('v2.doc.mustBeANumber') ,
            };
        } else {
            this.control.valueValidation['NaN'][this.rowId] = {
                isValid: false,
            };
        }
        return check;
    }
}

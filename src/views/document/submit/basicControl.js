import Control from './control';
import { str } from '@/plugins/utilModules/str.js';
import store from './../../../store';
import sDocument from './../../../store/document';
import { SYMPER_APP } from './../../../main.js';
import Util from './util';
let numeral = require('numeral');
import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/silver';
import { documentApi } from '../../../api/Document';
import PerfectScrollbar from 'perfect-scrollbar';
import { fileManagementApi } from '@/api/FileManagement';
import 'tinymce/plugins/lists';
// import 'tinymce/skins/ui/naked/skin.min.css';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/emoticons/js/emojis';
import { util } from '../../../plugins/util';
import { getControlInstanceFromStore } from '../common/common';
import Formulas from './formulas';
import { getFilesDataTransferItems, fileTypes } from './uploadControl';

window.showDetailCard = function (e) {
    e.keyInstance = $(e)
        .closest('.input-filter-card')
        .siblings('input')
        .attr('key-instance');
    e.getOffSet = $(e).closest('.input-filter-card').offset();
    e.controlName = $(e).attr('control-name');
    SYMPER_APP.$evtBus.$emit(
        'document-submit-filter-input-card-click-show-detail',
        e
    );
};
window.openFilter = function (e) {
    e.keyInstance = $(e)
        .closest('.input-filter-card')
        .siblings('input')
        .attr('key-instance');
    e.getOffSet = $(e).closest('.input-filter-card').offset();
    e.controlName = $(e).attr('control-name');
    SYMPER_APP.$evtBus.$emit('document-submit-filter-input-card-click', e);
};
export default class BasicControl extends Control {
    constructor(idField, ele, controlProps, keyInstance, value) {
        super(idField, ele, controlProps, keyInstance, value);
        this.minValue = this.controlProperties.hasOwnProperty('minValue')
            ? this.controlProperties.minValue.value
            : false;
        this.maxValue = this.controlProperties.hasOwnProperty('maxValue')
            ? this.controlProperties.maxValue.value
            : false;
        this.colIndex = -1;
        this.tableCellHistoryData = {};
    }

    render() {
        if (this.ele.is('input')) {
            this.ele.addClass('max-width-100');
            this.ele.attr('autocomplete', 'off');
        }
        if (!['tab', 'page'].includes(this.type)) {
            this.ele.wrap('<span style="position:relative;display:inline;">');
        }
        if (['fileUpload', 'richText'].includes(this.type)) {
            this.ele.wrap(
                '<span style="position:relative;display:inline-block">'
            );
        }
        this.ele.attr('key-instance', this.keyInstance);
        if (
            !this.checkDetailView() &&
            this.value === '' &&
            this.checkProps('isRequired') &&
            !this.checkProps('isHidden')
        ) {
            this.renderValidateIcon(
                SYMPER_APP.$t('v2.doc.notBlankInforField') + this.title,
                'Require'
            );
        }
        if (!this.checkDetailView() && this.checkProps('isReadOnly')) {
            this.ele.attr('disabled', 'disabled');
            this.ele.css({ background: 'rgba(0,0,0,0.05)' });
        }
        if (
            this.controlProperties['isHidden'] != undefined &&
            this.checkProps('isHidden')
        ) {
            this.hideRelatedControlTitle(this.id);
            this.ele.css({ display: 'none' });
        }
        if (this.checkDetailView() && $('.input-filter-button-add')) {
            $('.input-filter-button-add').css('display', 'none');
        }
        if (this.ele.hasClass('s-control-number')) {
            this.formulaValue = '';
            this.renderNumberControl();
        } else if (this.ele.hasClass('s-control-table')) {
        } else if (
            this.ele.hasClass('s-control-hidden') ||
            this.ele.hasClass('s-control-tracking-value')
        ) {
            this.ele.css('display', 'none');
        } else if (this.ele.hasClass('s-control-filter')) {
            this.renderFilterControl();
        } else if (this.ele.hasClass('s-control-panel')) {
            // presetPanel(this.ele);
        } else if (this.ele.hasClass('s-control-report')) {
            this.ele.removeClass('on-property');
            // getReportTemplate(this.ele, {}, thisObj.name);
        } else if (this.ele.hasClass('s-control-time')) {
            this.ele.attr('type', 'text');
            this.renderTimeControl();
        } else if (this.ele.hasClass('s-control-percent')) {
            this.formulaValue = '';
            this.renderNumberControl(true);
        } else if (this.ele.hasClass('s-control-date')) {
            this.renderDateControl();
        } else if (this.ele.hasClass('s-control-datetime')) {
            this.renderDateTimeControl();
        } else if (this.ele.hasClass('s-control-file-upload')) {
            this.renderFileControl();
        } else if (this.ele.hasClass('s-control-user')) {
            this.renderUserControl();
        } else if (this.ele.hasClass('s-control-checkbox')) {
            this.renderCheckboxControl();
        } else if (this.ele.hasClass('s-control-select')) {
            this.renderSelectControl();
        } else if (this.ele.hasClass('s-control-combobox')) {
            this.renderSelectControl(false);
        } else if (this.ele.hasClass('s-control-label')) {
            this.renderLabelControl();
        } else if (this.ele.hasClass('s-control-rich-text')) {
            this.renderRichTextControl();
        } else if (this.type == 'documentInstanceIdentifier') {
            this.renderDocumentInstanceIdentifierControl();
        } else if (this.type == 'location') {
            this.renderLocationControl();
        }
        if (this.checkEmptyFormulas('autocomplete')) {
            this.inputValue = null;
        }
        if (this.checkDetailView()) {
            if (!['tab', 'page'].includes(this.type)) {
                this.ele.attr('disabled', 'disabled');
            }
        }

        if (this.checkViewType('submit')) {
            this.setDefaultValue();
        } else if (this.checkViewType('print')) {
            this.setPrintValueControl();
        } else {
            this.setValueControl();
        }
        this.setEvent();
        if (
            this.checkProps('isQuickSubmit') &&
            this.checkEmptyFormulas('autocomplete') &&
            this.controlFormulas.autocomplete.instance
        ) {
            let allTable =
                this.controlFormulas.autocomplete.instance.detectTableQuery();
            let columnBinding =
                this.controlFormulas.autocomplete.instance.autocompleteDetectAliasControl(
                    false
                );
            this.columnBindingSubForm = columnBinding;
            if (allTable !== false) {
                let table = allTable[0];
                documentApi
                    .getDetailDocumentByName({ name: table })
                    .then((res) => {
                        if (res.status == 200) {
                            let documentId = res.data.id;
                            this.renderSubformButton(documentId);
                        }
                    })
                    .catch((err) => {})
                    .finally(() => {});
            }
        }
        this.checkRequireChangeControl();
        if (this.controlProperties.style) {
            this.ele.attr('style', this.controlProperties.style);
        }
        if(!this.checkDetailView() && this.checkProps('isRunFormulaManually') && !this.checkProps('isHidden')){
            this.renderRunFormulaManuallyControlIcon();
        }
    }
    highlightControls() {
        this.ele.addClass('highlight-control');
    }
    highlightFocusControl() {
        this.unHighlightControls();
        this.ele.addClass('highlight-control-focus');
    }
    unHighlightControls() {
        $('.s-control').removeClass('highlight-control-focus');
    }
    /**
     * ghi đè thuộc tính của control
     * @param {*} prop
     * @param {*} value
     */
    overrideProps(prop, value) {
        if (this.checkProps(prop)) {
            this.controlProperties[prop].value = value;
        }
    }
    // ẩn control title liên quan
    hideRelatedControlTitle(id) {
        $('[control-link-id=' + id + ']').css('display', 'none');
    }
    /**
     * Hàm kiểm tra có check vào thuộc tính phải thay đổi khi cập nhật bản ghi hay không,
     * nếu có thì validate
     */
    checkRequireChangeControl() {
        if (this.checkViewType('update')) {
            let isRequireChange = this.getValueProp('isRequireChange');
            if (this.inTable == false) {
                this.oldValue = this.value;
                if (isRequireChange) {
                    this.renderValidateIcon(
                        SYMPER_APP.$t('v2.doc.requestChangeFieldValue')+ this.title,
                        'RequireChange'
                    );
                }
            } else {
                let tableName = this.inTable;
                let tableIns = getControlInstanceFromStore(
                    this.keyInstance,
                    tableName
                );
                let val = tableIns.tableInstance.getColDataWithRowId(this.name);
                this.oldValue = val;
                tableIns.tableInstance.refreshCells(
                    this.name,
                    Object.keys(val)
                );
            }
        }
    }

    /**
     * Trường hợp có điền vào giá trị defaul trong editor thì gọi hàm này để set giá trị
     */
    setDefaultValue() {
        if (this.controlProperties['defaultValue'] != undefined) {
            if (
                typeof this.controlProperties['defaultValue'].value == 'object'
            ) {
                return;
            }
            this.value = this.controlProperties['defaultValue'].value;
            this.setValueControl();
        }
    }
    setCssUploadFile() {
        let width = this.controlProperties['width'].value
            ? this.controlProperties['width'].value + 'px'
            : null;
        if (width) {
            this.ele.css('width', width);
            this.ele.addClass('my-2');
        }
    }

    getWidth() {
        if (
            this.controlProperties['width'] &&
            this.controlProperties['width'].value
        ) {
            return this.controlProperties['width'].value;
        } else {
            return false;
        }
    }
    getLinkFormula() {
        if (
            this.controlFormulas.hasOwnProperty('linkConfig') &&
            this.controlFormulas.linkConfig.configData.length > 0
        ) {
            return this.controlFormulas.linkConfig.configData;
        }
        return false;
    }

    /**
     * sử dụng cho trường hợp control nằm trong bảng
     * Hàm chỉ ra control nằm ở vị trí cột nào trong bảng
     * @param {*} index
     */
    setColIndexInTable(index) {
        this.colIndex = index;
    }

    /**
     * Hàm kiểm tra control có công thức autocomplete hay không
     */
    checkAutoCompleteControl() {
        if (
            this.controlFormulas.hasOwnProperty('autocomplete') &&
            this.controlFormulas.autocomplete.instance != undefined
        ) {
            return true;
        }
        return false;
    }
    triggerOnChange() {
        this.ele.trigger('change');
    }
    unFocusInput() {
        this.ele.blur();
    }
    /**
     * Hàm lắng nghe sự kiện cho các control
     */
    setEvent() {
        let thisObj = this;
        this.ele.on('change', function (e) {
            store.commit('document/addToDocumentSubmitStore', {
                key: 'rootChangeFieldName',
                value: thisObj.name,
                instance: thisObj.keyInstance
            });
            let valueChange = $(e.target).val();
            // sau khi thay đổi giá trị input thì kiểm tra require control nếu có
            thisObj.checkRequire(valueChange);
            if (thisObj.checkAutoCompleteControl()) {
                return false;
            }
            if (thisObj.type == 'label') {
                valueChange = $(e.target).text();
            } else if (thisObj.type == 'checkbox') {
                valueChange = $(e.target).prop('checked');
            } else if (thisObj.type == 'user') {
                return false;
            } else if (thisObj.type == 'number') {
                valueChange = valueChange.replace(/=/g, '');
                if (isNaN(valueChange)) {
                    thisObj.value = '';
                    return false;
                }
                if (valueChange == '0') {
                    thisObj.value = valueChange;
                } else {
                    valueChange = valueChange.replace(/^0*/g, '');
                    valueChange = eval(valueChange);
                    if (!/^[-0-9,.]+$/.test(valueChange)) {
                        thisObj.value = '';
                        return false;
                    }
                }
            } else if (thisObj.type == 'date') {
                valueChange = thisObj.getDateChange(valueChange);
                if (valueChange != '') {
                    if (valueChange == false) {
                        valueChange = '';
                        thisObj.renderValidateIcon(
                            SYMPER_APP.$t('v2.doc.incorrectDateFormatAllowed'),
                            'DateValid'
                        );
                    } else {
                        thisObj.removeValidateIcon('DateValid');
                        let v = SYMPER_APP.$moment(
                            valueChange,
                            'YYYY-MM-DD'
                        ).format(thisObj.formatDate);
                        thisObj.ele.val(v);
                    }
                }
            } else if (thisObj.type == 'dateTime') {
                valueChange = thisObj.getDateTimeChange(valueChange);
                if (valueChange == false) {
                    valueChange = '';
                    thisObj.renderValidateIcon(
                        SYMPER_APP.$t('v2.doc.requestInputIncorrectFormat') + ': YYYY-MM-DD HH:mm:ss',
                        'DateTimeValid'
                    );
                } else {
                    thisObj.removeValidateIcon('DateTimeValid');
                    let v = SYMPER_APP.$moment(
                        valueChange,
                        'YYYY-MM-DD HH:mm:ss'
                    ).format(thisObj.formatDateTime);
                    thisObj.ele.val(v);
                }
            } else if (thisObj.type == 'time') {
                if (!Util.checkTimeValid(valueChange)) {
                    thisObj.renderValidateIcon(
                        SYMPER_APP.$t('v2.doc.incorrectTimeFormat'),
                        'TimeValid'
                    );
                    return false;
                } else {
                    thisObj.removeValidateIcon('TimeValid');
                }
            }

            thisObj.value = valueChange;
            SYMPER_APP.$evtBus.$emit('document-submit-input-change', thisObj);
        });
        // this.ele.on('focus', function (e) {
        //     store.commit('document/addToDocumentSubmitStore', {
        //         key: 'rootChangeFieldName',
        //         value: thisObj.name,
        //         instance: thisObj.keyInstance
        //     });
        // });
        if (thisObj.checkAutoCompleteControl()) {
            this.isRunChange = true;
            this.ele.on('blur', function (e) {
                setTimeout(() => {
                    if (!thisObj.isRunChange) {
                        let valueChange = $(e.target).val();
                        thisObj.value = valueChange;
                        thisObj.inputValue = valueChange;
                        thisObj.valueChange = valueChange;
                        SYMPER_APP.$evtBus.$emit(
                            'document-submit-input-change',
                            thisObj
                        );
                        thisObj.isRunChange = true;
                    }
                }, 300);
            });
        }
        this.ele.on('keyup', function (e) {
            if (
                e.key == 'F2' &&
                store.state.app.baInfo &&
                store.state.app.baInfo.id
            ) {
                if (thisObj.type == 'number' && thisObj.formulaValue) {
                    thisObj.ele.val(thisObj.formulaValue);
                }
                thisObj.traceControl();
            }
            if (thisObj.checkAutoCompleteControl()) {
                thisObj.isRunChange = false;
                if (e.keyCode == 13) {
                    thisObj.isRunChange = true;
                    return false;
                }
                let fromSelect = false;
                let valueChange = $(e.target).val();
                thisObj.value = valueChange;
                thisObj.inputValue = valueChange;
                let formulasInstance = fromSelect
                    ? thisObj.controlFormulas.formulas.instance
                    : thisObj.controlFormulas.autocomplete.instance;
                e['controlName'] = thisObj.controlProperties.name.value;
                SYMPER_APP.$evtBus.$emit(
                    'document-submit-autocomplete-key-event',
                    {
                        e: e,
                        autocompleteFormulasInstance: formulasInstance,
                        isSelect: false,
                        controlTitle: thisObj.title,
                        controlName: thisObj.name,
                        val: $(e.target).val()
                    }
                );
            }
        });
        this.ele.on('click', function (e) {
            store.commit('document/addToDocumentSubmitStore', {
                key: 'docStatus',
                value: 'input',
                instance: thisObj.keyInstance
            });
            e.controlName = thisObj.name;
            e.control = thisObj;
            e.curTarget = e.target;
            if (['date', 'dateTime'].includes(thisObj.type)) {
                SYMPER_APP.$evtBus.$emit('document-submit-date-input-click', e);
            } else if (thisObj.type == 'inputFilter') {
                e.formulas = thisObj.controlFormulas.list;
                SYMPER_APP.$evtBus.$emit(
                    'document-submit-filter-input-click',
                    e
                );
            } else if (thisObj.type == 'time') {
                SYMPER_APP.$evtBus.$emit('document-submit-show-time-picker', e);
            } else if (thisObj.type == 'image') {
                SYMPER_APP.$evtBus.$emit('document-submit-image-click', {
                    e: e,
                    control: thisObj
                });
            } else if (thisObj.type == 'department') {
                SYMPER_APP.$evtBus.$emit('document-submit-department-click', {
                    e: e,
                    control: thisObj
                });
            }
        });
        $('.wrap-content-detail').on('click', (evt) => {
            if ($(evt.target).closest('.highlight-control').length > 0) {
                if (
                    $(this.ele).hasClass('highlight-control') &&
                    $(evt.target).attr('id') == thisObj.id
                ) {
                    SYMPER_APP.$evtBus.$emit(
                        'document-click-control-hightlight',
                        { id: thisObj.idField }
                    );
                }
            }
        });
        this.ele.parent().on('click','.button-run-formula-manually-control-outTable', function (e) {
            SYMPER_APP.$evtBus.$emit('document-submit-run-formula-manually-control-click', {
                    controlName: thisObj.name
            });
        });
    }

    /**
     * Hàm lấy thông tin định dạng của control ngày đã được cấu hình
     * @returns
     */
    getDateFormat() {
        return this.controlProperties.hasOwnProperty('formatDate')
            ? this.controlProperties.formatDate.value
            : '';
    }
    /**
     * Hàm lấy thông tin định dạng của control ngày đã được cấu hình
     * @returns
     */
    getDateTimeFormat() {
        return this.controlProperties.hasOwnProperty('formatDateTime')
            ? this.controlProperties.formatDateTime.value
            : '';
    }
    /**
     * Hàm kiểm tra sự thay đổi khi nhập date để validate
     */
    getDateChange(valueChange) {
        this.formatDate = this.getDateFormat();
        let listPattern = [
            'D',
            'DD',
            'D/M',
            'D-M',
            'DD/MM',
            'DD-MM',
            'DD/M',
            'DD-M',
            'D-M-YYYY',
            'DD-M-YYYY',
            'D-MM-YYYY',
            'DD/M/YYYY',
            'D/MM/YYYY',
            'DD-MM-YYYY',
            'DD/MM/YYYY',
            'MM-DD-YYYY',
            'MM/DD/YYYY',
            'YYYY-MM-DD',
            'D/M/YY',
            'DD/MM/YY',
            'D/MM/YY',
            'DD/MM/YY',
            'D-M-YY',
            'DD-MM-YY',
            'D-MM-YY',
            'DD-MM-YY'
        ];
        if (
            SYMPER_APP.$moment(valueChange, this.formatDate, true).isValid() &&
            this.formatDate
        ) {
            return SYMPER_APP.$moment(valueChange, this.formatDate).format(
                'YYYY-MM-DD'
            );
        }
        for (let index = 0; index < listPattern.length; index++) {
            const item = listPattern[index];
            if (SYMPER_APP.$moment(valueChange, item, true).isValid()) {
                valueChange = SYMPER_APP.$moment(valueChange, item).format(
                    'YYYY-MM-DD'
                );
                return valueChange;
            }
        }
        return false;
    }
    /**
     * Hàm kiểm tra sự thay đổi khi nhập datetime để validate
     */
    getDateTimeChange(valueChange) {
        this.formatDateTime = this.getDateTimeFormat();
        let listPattern = [
            'D H',
            'DD H',
            'D HH',
            'DD HH',
            'D-M H',
            'D/M H',
            'D-M HH',
            'D/M HH',
            'DD-M H',
            'DD/M H',
            'DD-M HH',
            'DD/M HH',
            'D-MM H',
            'D/MM H',
            'D-MM HH',
            'D/MM HH',
            'DD/MM H',
            'DD-MM H',
            'DD/MM HH',
            'DD-MM HH',
            'DD/MM/YYYY H',
            'DD-MM-YYYY H',
            'DD/MM/YYYY HH',
            'DD-MM-YYYY HH',
            'D H:mm',
            'DD H:mm',
            'D HH:mm',
            'DD HH:mm',
            'D-M H:mm',
            'D/M H:mm',
            'D-M HH:mm',
            'D/M HH:mm',
            'DD-M H:mm',
            'DD/M H:mm',
            'DD-M HH:mm',
            'DD/M HH:mm',
            'D-MM H:mm',
            'D/MM H:mm',
            'D-MM HH:mm',
            'D/MM HH:mm',
            'DD/MM H:mm',
            'DD-MM H',
            'DD/MM HH:mm',
            'DD-MM HH:mm',
            'DD/MM/YYYY H:mm',
            'DD-MM-YYYY H',
            'DD/MM/YYYY HH:mm',
            'DD-MM-YYYY HH:mm',
            'YYYY-MM-DD HH:mm:ss'
        ];
        if (
            this.formatDateTime &&
            typeof this.formatDateTime != 'object' &&
            SYMPER_APP.$moment(valueChange, this.formatDateTime, true).isValid()
        ) {
            return SYMPER_APP.$moment(valueChange, this.formatDateTime).format(
                'YYYY-MM-DD HH:mm:ss'
            );
        }
        for (let index = 0; index < listPattern.length; index++) {
            const item = listPattern[index];
            if (SYMPER_APP.$moment(valueChange, item, true).isValid()) {
                valueChange = SYMPER_APP.$moment(valueChange, item).format(
                    'YYYY-MM-DD HH:mm:ss'
                );
                return valueChange;
            }
        }
        return false;
    }
    /**
     * Hàm tracking xem control lấy dữ liệu từ đâu và ảnh hướng đến control nào
     * nguồn: control màu xanh lá  cây
     * đich: control màu xanh nước biển
     */
    traceControl() {
        SYMPER_APP.$evtBus.$emit('document-submit-show-trace-control', {
            control: this
        });
    }

    /**
     * Hàm kiểm tra xem control đánh dấu require có vi phạm hay không
     * @param {*} valueChange
     * @param {*} checkChange
     */
    checkRequire(valueChange = false) {
        if(this.checkViewType('detail')) return
        let isRequired = false;
        this.removeValidateIcon('Require');
        this.removeValidateIcon('RequireChange');
        if (this.isRequiredControl()) {
            if (this.type == 'richText') {
                if (!valueChange) {
                    isRequired = true;
                    this.renderValidateIcon(
                        SYMPER_APP.$t('v2.doc.notBlankInforField') + this.name,
                        'Require'
                    );
                    if (
                        this.controlProperties.isShowHeaderTinyMce.value &&
                        !this.checkViewType('detail')
                    ) {
                        this.cssValidateIconRichText();
                    }
                }
            } else if (
                this.type == 'fileUpload' ||
                this.type == 'label' ||
                this.type == 'location'
            ) {
                if (this.value.length == 0) {
                    isRequired = true;
                    this.renderValidateIcon(
                        SYMPER_APP.$t('v2.doc.notBlankInforField') + this.name,
                        'Require'
                    );
                }
            } else {
                if (this.isEmpty()) {
                    isRequired = true;
                    this.renderValidateIcon(
                        SYMPER_APP.$t('v2.doc.notBlankInforField') + this.name,
                        'Require'
                    );
                }
            }
        }
        if (this.checkProps('isRequireChange') && !isRequired) {
            if (this.oldValue == valueChange) {
                this.renderValidateIcon(
                    SYMPER_APP.$t('v2.doc.requestChangeFieldValue') + this.title,
                    'RequireChange'
                );
            }
        }
    }

    /**
     * ghi đè thuộc tính cho control
     * @param {*} props
     */
    overrideProperties(props) {
        for (let prop in props) {
            if (this.controlProperties[prop]) {
                this.controlProperties[prop].value = props[prop];
                if (['isRequireChange', 'isRequired'].includes(prop)) {
                    this.checkRequire(this.value);
                }
            }
        }
    }
    /**
     * ghi đè công thức cho control
     * @param {*} formulas
     */
    overrideFormulas(formulas) {
        for (let formulaType in formulas) {
            let formulaValue = formulas[formulaType];
            if (this.checkEmptyFormulas[formulaType]) {
                this.controlFormulas[formulaType].value = formulaValue;
                formulaValue = formulaValue.replace(/\r?\n|\r/g, ' ');
                formulaValue = formulaValue.trim();
                this.controlFormulas[formulaType].instance = new Formulas(
                    this.keyInstance,
                    formulaValue,
                    formulaType
                );
            }
        }
    }
    /**
     * Gán dữ liệu cho control sau khi chạy công thức
     * @param {*} value
     */
    setValue(value) {
        if (this.type == 'fileUpload') {
            if (!this.value) {
                this.value = [];
            }
            this.value.push(value);
            this.setFileControlValue(value);
            this.checkRequire();
        } else {
            if (
                value &&
                value.hasOwnProperty('inputDislay') &&
                value.hasOwnProperty('inputValue')
            ) {
                if (value.inputValue == undefined) {
                    value.inputValue = value.inputDislay;
                }
                this.value = value.inputValue;
                this.inputValue = value.inputValue;
            } else {
                this.value = value;
                this.inputValue = value;
            }
            if (this.inTable === false) {
                if (this.type == 'label') {
                    this.ele.text(value);
                } else if (this.type == 'richText') {
                    this.setRichtextValue();
                    let richTextHeight = this.getRichTextHeight(true);
                    this.setHeightRichText(richTextHeight);
                } else if (this.type == 'inputFilter') {
                    this.value = value;
                    this.inputValue = value;
                    if (
                        this.controlProperties.inputFilterMode.value == 'Card'
                    ) {
                        if (this.value) {
                            this.ele.css('display', 'none');
                            let width = this.controlProperties.width.value;
                            let listCards = this.genCardsInputFilter(width);
                            this.ele
                                .closest('span')
                                .find('.input-filter-card')
                                .remove();
                            this.ele
                                .closest('span')
                                .append(listCards)
                                .css('width', width);
                            $('.card-input-filter');
                        } else {
                            if (
                                this.ele
                                    .closest('span')
                                    .find('.input-filter-card')
                            ) {
                                this.ele
                                    .closest('span')
                                    .find('.input-filter-card')
                                    .remove();
                                this.ele.css('display', 'block');
                            }
                        }
                    }
                    this.ele.val(value);
                } else if (this.type == 'dateTime') {
                    this.ele.val(value);
                    if (
                        SYMPER_APP.$moment(
                            value,
                            'YYYY-MM-DD HH:mm:ss',
                            true
                        ).isValid()
                    ) {
                        this.ele.val(
                            SYMPER_APP.$moment(value).format(
                                this.formatDateTime
                            )
                        );
                        this.value = value;
                        this.removeValidateIcon('DateTimeValid');
                    } else {
                        this.ele.val('');
                    }
                } else if (this.type == 'date') {
                    if (
                        SYMPER_APP.$moment(value, 'YYYY-MM-DD', true).isValid()
                    ) {
                        this.ele.val(
                            SYMPER_APP.$moment(value).format(this.formatDate)
                        );
                        this.value = value;
                        this.removeValidateIcon('DateValid');
                    } else {
                        this.ele.val('');
                    }
                } else if (this.type == 'checkbox') {
                    if (value == '0' || value == 'false') {
                        this.ele.removeAttr('checked');
                    } else {
                        this.ele.attr('checked', 'checked');
                    }
                } else if (this.type == 'number') {
                    let v = parseInt(value);
                    if (!isNaN(v))
                        this.ele.val(numeral(value).format(this.numberFormat));
                    else {
                        this.ele.val('');
                        this.value = '';
                    }
                } else if (this.type == 'percent') {
                    this.ele.val(numeral(value).format(this.numberFormat));
                } else if (this.type == 'image') {
                    this.setImageControlValue(value);
                } else if (this.type == 'user' && typeof value != 'object') {
                    this.value = value;
                    this.ele.val(this.mapData[value]);
                } else if (this.type == 'location') {
                    this.setLocation(this.value);
                } else {
                    if (value && value.inputValue) {
                        this.ele.val(value.inputDislay);
                    } else {
                        this.ele.val(value);
                    }
                }
            }
            if (sDocument.state.submit[this.keyInstance].docStatus == 'init') {
                this.defaultValue = value;
            }
            if (this.type != 'richText') {
                this.checkRequire(this.ele.val());
            }
        }
    }
    getValue() {
        return this.value;
    }
    setValueControlDepartment(value, text) {
        this.value = value;
        this.ele.val(text);
        this.checkRequire(text);
    }

    /**
     * Hàm gắn dữ liệu cho control khi load form update hoặc khi có định nghĩa giá trị default
     */
    setValueControl() {
        let value = this.value;
        if (!value) {
            value = '';
        } else if (this.type == 'number') {
            if (!isNaN(Number(value)))
                value = numeral(Number(value)).format(this.numberFormat);
        } else if (this.type == 'date') {
            value = SYMPER_APP.$moment(value).format(this.formatDate);
        }
        if (this.type == 'label') {
            this.ele.text(value);
        } else if (this.type == 'richText') {
            this.setRichtextValue();
            let richTextHeight = this.getRichTextHeight(true);
            this.setHeightRichText(richTextHeight);
        } else if (this.type == 'inputFilter') {
            if (this.controlProperties.inputFilterMode.value == 'Card') {
                if (this.value) {
                    this.ele.css('display', 'none');
                    let width = this.controlProperties.width.value;
                    let listCards = this.genCardsInputFilter(width);
                    this.ele
                        .closest('span')
                        .append(listCards)
                        .css('width', width);
                }
            } else {
                this.ele.val(value);
            }
        } else if (this.type == 'dateTime') {
            this.ele.val(value);
        } else if (this.type == 'image') {
            this.setImageControlValue(value);
        } else if (this.type == 'fileUpload') {
            this.setFileControlValue(value, true);
        } else if (this.type == 'checkbox') {
            if (value == '0' || value == 'false') {
                this.ele.removeAttr('checked');
            } else {
                this.ele.attr('checked', 'checked');
            }
        } else if (this.type == 'number') {
            let v = parseInt(value);
            if (!isNaN(v))
                this.ele.val(numeral(value).format(this.numberFormat));
            else {
                this.ele.val('');
                this.value = '';
            }
        } else if (this.type == 'percent') {
            this.ele.val(numeral(value).format(this.numberFormat));
        } else if (this.type == 'user') {
            let listUser = store.state.app.allUsers;
            if (this.value) {
                let user = listUser.filter((u) => {
                    return u.id == this.value;
                });
                if (user[0]) {
                    this.ele.val(user[0].displayName);
                }
            }
        } else if (this.type == 'location') {
            this.setLocation(value);
        } else {
            this.ele.val(value);
        }
        this.ele.attr('value', value);
        if (sDocument.state.submit[this.keyInstance].docStatus == 'init') {
            this.defaultValue = value;
        }
    }
    /**
     * Hàm lấy ra thông tin giá trị sẽ được lưu cho control có autocomplete
     * @returns
     */
    getAutocompleteKeyValue() {
        if (typeof this.controlProperties.itemValue.value == 'object') {
            return '';
        }
        return this.controlProperties.itemValue.value;
    }
    setImageControlValue(value) {
        this.ele.empty();
        let w = this.controlProperties.width.value;
        let h = this.controlProperties.height.value;
        if (!w) {
            w = 'auto';
        }
        if (!h) {
            h = '70';
        }
        let image =
            '<img height="' + h + '" width="' + w + '" src="' + value + '">';
        if (!value) {
            image =
                '<span class="mdi mdi-image-area" style="font-size: 22px; color: #757575;"></span>';
        }
        this.ele.append(image);
    }
    setFileControlValue(fileData, isMultiple = false) {
        let thisObj = this;
        let fileEl = '';
        if (isMultiple) {
            try {
                if (fileData) {
                    fileData = JSON.parse(fileData);
                }
                this.value = fileData;
                store.commit('document/updateListInputInDocument', {
                    controlName: this.name,
                    key: 'value',
                    value: this.value,
                    instance: this.keyInstance
                });
                for (let index = 0; index < fileData.length; index++) {
                    let fileItem = fileData[index];
                    fileEl += this.genFileElItem(fileItem);
                }
            } catch (error) {
                console.warn(error, 'loi control file');
            }
        } else {
            fileEl = this.genFileElItem(fileData);
        }
        if (!fileEl && this.checkDetailView()) {
            this.ele.css({
                display: 'none',
                'border-bottom': '1px solid lightgrey'
            });
        } else if (!this.checkProps('isHidden')) {
            this.ele.css({ display: 'block', 'border-bottom': 'none' });
        }
        this.ele.find('.upload-file-wrapper-outtb .list-file').append(fileEl);
        if (fileData) {
            this.ele
                .find('.upload-file-wrapper-outtb')
                .removeClass('d-flex align-center');
        }
        if (!this.checkDetailView()) {
            this.ele.off('click', '.remove-file');
            this.ele.on('click', '.remove-file', function (e) {
                let item = $(this).attr('data-item');
                let index = thisObj.value.indexOf(item);
                thisObj.value.splice(index, 1);
                e.preventDefault();
                e.stopPropagation();
                $(this).closest('.file-item').remove();
                store.commit('document/updateListInputInDocument', {
                    controlName: thisObj.name,
                    key: 'value',
                    value: thisObj.value,
                    instance: thisObj.keyInstance
                });
            });
        }
    }
    setPrintValueControl(vl = undefined) {
        let value = vl;
        if (vl == undefined) {
            value = this.value;
        }
        if (!value) {
            value = '';
        } else if (this.type == 'number') {
            if (!isNaN(Number(value)))
                value = numeral(Number(value)).format(this.numberFormat);
        } else if (this.type == 'date') {
            value = SYMPER_APP.$moment(value).format(this.formatDate);
        } else if (this.type == 'dateTime') {
            this.ele.val(value);
        } else if (this.type == 'user') {
            value = this.mapData[this.value];
        }
        if (this.type == 'image') {
            this.ele.empty();
            let w = this.controlProperties.width.value;
            let h = this.controlProperties.height.value;
            if (!w) {
                w = 'auto';
            }
            if (!h) {
                h = '70';
            }
            let image =
                '<img height="' +
                h +
                '" width="' +
                w +
                '" src="' +
                value +
                '">';
            this.ele.append(image);
        } else if (this.type == 'title') {
            value = this.title;
        } else {
            let currentStyle = this.ele.attr('style');
            if (this.hidden) {
                this.ele.replaceWith('');
            } else {
                this.ele.replaceWith(
                    '<div  class="s-control s-control-text" contenteditable="false" style="' +
                        currentStyle +
                        ';background:none;padding: 5px 5px !important;">' +
                        value +
                        '</div>'
                );
            }
        }
    }
    /**
     * Hàm format số cho control number theo format được định nghĩa trong editor
     * @param {*} data
     * @returns
     */
    formatNumberValue(data) {
        let value = data;
        let formatPt = this.getNumberFormat();
        if (!isNaN(Number(value)) && formatPt)
            value = numeral(Number(value)).format(formatPt);
        return value;
    }

    /**
     * Hàm append thêm button + vào sau input trường hợp control có đánh dấu là có sub form submit
     */
    renderSubformButton(subFormId) {
        if (this.inTable == false) {
            let thisObj = this;
            this.ele
                .parent()
                .append('<span class="mdi mdi-plus add-subform-btn"></span>');
            this.ele.parent().off('click', '.add-subform-btn');
            this.ele.parent().on('click', '.add-subform-btn', function (e) {
                store.commit('document/addToDocumentSubmitStore', {
                    key: 'controlOpenSubform',
                    value: thisObj,
                    instance: thisObj.keyInstance
                });
                SYMPER_APP.$evtBus.$emit('document-submit-open-subform', {
                    docId: subFormId,
                    instance: thisObj.keyInstance
                });
            });
        } else {
        }
    }
    hightLightFocusUpload() {
        this.unfocusUpload();
        this.ele.find('.list-file').css('background', 'antiquewhite');
    }
    unfocusUpload() {
        $('.list-file').css('background', 'none');
    }
    renderFileControl = function () {
        this.setCssUploadFile();
        let fileHtml = this.genFileView();
        this.ele.html(fileHtml);
        let thisObj = this;
        this.ele.click(function (e) {
            thisObj.hightLightFocusUpload();
        });
        const agBodyHorizontalViewport = $(this.ele).find('.list-file')[0];
        if (agBodyHorizontalViewport) {
            const ps = new PerfectScrollbar(agBodyHorizontalViewport);
            // ps.update();
        }
        this.ele.find('.file-add-click').click(function (e) {
            SYMPER_APP.$evtBus.$emit('document-submit-add-file-click', {
                control: thisObj
            });
        });
        this.ele
            .find('.upload-file-wrapper-outtb.d-flex.align-center')
            .click(function (e) {
                $('#' + thisObj.id)
                    .find('.upload-file-wrapper-outtb.d-flex.align-center')
                    .css({ border: 'dashed orange', 'border-width': '1px' });
            });
        this.ele.on('dragover', '.upload-file-wrapper-outtb', function (e) {
            e = e;
            e.preventDefault();
            if (!thisObj.checkDetailView()) {
                thisObj.hightLightFocusUpload();
            }
        });
        this.ele.on('paste', '.upload-file-wrapper-outtb', function (e) {
            e.preventDefault();
            const filesList = [];
            let dataTranfer = e.originalEvent.clipboardData.items;
            for (let i = 0; i < dataTranfer.length; i++) {
                const item = dataTranfer[i];
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    filesList.push(file);
                }
            }
            SYMPER_APP.$evtBus.$emit('document-submit-copy', {
                fileInfo: filesList,
                control: thisObj
            });
        });
        this.ele.on('drop', '.upload-file-wrapper-outtb', function (event) {
            let items = event.originalEvent.dataTransfer.items;
            event.preventDefault();
            getFilesDataTransferItems(items).then((files) => {
                SYMPER_APP.$evtBus.$emit('document-submit-drag-and-drop', {
                    fileInfo: files,
                    control: thisObj
                });
            });
        });
        this.ele.on('click', '.add-file', function (e) {
            SYMPER_APP.$evtBus.$emit('document-submit-add-file-click', {
                control: thisObj
            });
        });
        this.ele.on('click', '.file-item__download', function (e) {
            let fileId = $(this).closest('.file-item').attr('id-file');
            if (fileId) {
                thisObj.downloadUploadFile(fileId);
            } else {
                let fileName = $(this).closest('.file-item').attr('name-file');
                thisObj.downloadFileByName(fileName);
            }
        });
        this.ele.on('click', '.more-actions', function (event) {
            $('#' + thisObj.id)
                .find('.dropdown-content')
                .addClass('show-upload-dropdown');
        });
        this.ele.on('click', '.upload-dropdown-action', function (e) {
            $('#' + thisObj.id)
                .find('.dropdown-content')
                .removeClass('show-upload-dropdown');
        });
        this.ele.on('click', '.delete-all', function (e) {
            $('#' + thisObj.id)
                .find('.upload-file-wrapper-outtb')
                .remove();
            thisObj.renderFileControl();
            thisObj.ele.addClass('my-2');
            thisObj.unfocusUpload();
            store.commit('document/updateListInputInDocument', {
                controlName: thisObj.name,
                key: 'value',
                value: [],
                instance: thisObj.keyInstance
            });
            thisObj.checkRequire();
            SYMPER_APP.$evtBus.$emit(
                'document-item-control-file-delete-all',
                thisObj
            );
        });
        this.ele.on('click', '.download-all', function (e) {
            let listIds = $('#' + thisObj.id)
                .find('.file-item')
                .attr('id-file');
            // let id = $('#'+thisObj.id).find('.-name').map(file=>{
            //     return $(this).attr('id-file');
            // })
            // let test = id;
            thisObj.downloadAll(listIds);
        });

        this.ele.on('click', '.list-file', function (e) {
            let imageIdx = 0;
            let link = '';
            if (
                $(e.target).is('.file-item') ||
                ($(e.target).is('.file-item__name') &&
                    !$(e.target).attr('contenteditable'))
            ) {
                $('.file-item').css('background', 'none');
                $(e.target)
                    .closest('.file-item')
                    .css('background', 'lightgrey');
                thisObj.value.map((img, i) => {
                    if (img.name == e.target.textContent) imageIdx = i;
                });
                link = thisObj.value.filter(function (k, i) {
                    return k.name == e.target.textContent;
                });
                SYMPER_APP.$evtBus.$emit('document-item-control-file-click', {
                    link: link,
                    imgIdx: imageIdx,
                    control: thisObj
                });
            } else if ($(e.target).is('.file-item__edit')) {
                e.preventDefault();
                e.stopPropagation();
                $(e.target)
                    .closest('.file-item')
                    .find('.file-item__name')
                    .attr('contenteditable', true);
                $(e.target)
                    .closest('.file-item')
                    .find('.file-item__name')
                    .focus();
            } else if ($(e.target).is('.file-item__remove')) {
                e.preventDefault();
                e.stopPropagation();
                let fileId = $(e.target).closest('.file-item').attr('id-file');
                let fileItem = thisObj.value.find((el) => el.id == fileId);
                thisObj.value.splice(thisObj.value.indexOf(fileItem), 1);
                $(e.target).closest('.file-item').remove();
                thisObj.checkRequire();
                SYMPER_APP.$evtBus.$emit('document-item-control-file-delete', {
                    link: link,
                    imgIdx: imageIdx,
                    control: thisObj
                });
            }
        });
        this.ele.on('keydown', '.list-file', function (e) {
            if ($(e.target).is('.file-item__name') && e.keyCode == 13) {
                $(e.target).removeAttr('contenteditable');
                let fileId = $(e.target).closest('.file-item').attr('id-file');
                fileManagementApi.renameFile(fileId, $(e.target).text());
                thisObj.value.map((val, idx) => {
                    if (val.id == fileId) {
                        let oldFileName = val.name;
                        val.name = $(e.target).text();
                        // thisObj.value[idx].serverPath = val.serverPath.replace(oldFileName, val.name)
                    }
                });
                store.commit('document/updateListInputInDocument', {
                    controlName: thisObj.name,
                    key: 'value',
                    value: thisObj.value,
                    instance: thisObj.keyInstance
                });
                SYMPER_APP.$evtBus.$emit('document-item-control-file-refresh');
                return false;
            }
        });
    };
    downloadUploadFile(fileId) {
        fileManagementApi.download(fileId);
    }
    downloadFileByName(fileName) {
        let typeFile = fileName.split('.');
        fileName = fileName.replace('.' + typeFile[typeFile.length - 1], '');
        fileManagementApi.downloadFileByName(fileName);
    }
    downloadAll(ids) {
        fileManagementApi.downloadListFile(ids).then((res) => {
            if (res.status == 200) {
                SYMPER_APP.$evtBus.$emit(
                    'show-notification-download-all-file',
                    true
                );
            } else {
                SYMPER_APP.$evtBus.$emit(
                    'show-notification-download-all-file',
                    false
                );
            }
        });
    }
    cssControlUpload() {
        let upload =
            `
        <div class=" d-flex justify-space-between file-upload"  >
            <div class="d-flex justify-space-between ml-2 "> ` +
            this.title +
            `</div>
                <div class="upload-action-button ">
                    <button type="button"  title="${SYMPER_APP.$t('v2.doc.addFile')}" class="v-btn v-btn--flat v-btn--icon v-btn--round theme--light add-file">
                        <i class=" mdi mdi-plus" style="font-size:15px"></i>
                    </button>
                    <button type="button" title="${SYMPER_APP.$t('v2.doc.other')}" class="dropdown dropbtn v-btn v-btn--flat v-btn--icon v-btn--round theme--light more-actions">
                        <i class=" mdi mdi-dots-vertical" style="font-size:15px"></i>
                    </button>
                    <div id="list-actions" class="dropdown-content">
                        <div class="my-1 upload-dropdown-action download-all fs-12">Download all</div>
                        <div class="mb-1 upload-dropdown-action delete-all fs-12" style="margin-left:-20px">Delete all</div>
                  </div>
            </div>
        </div>
        `;
        $('#' + this.id)
            .find('.file-add')
            .html(upload);
        $('#' + this.id)
            .find('.file-add-click')
            .off('click');
        $('#' + this.id)
            .find('.upload-file-wrapper-outtb')
            .css('border', 'none');
    }
    genFileElItem(fileData) {
        this.cssControlUpload();
        let icon = fileTypes[fileData.type]
            ? fileTypes[fileData.type]
            : 'mdi-file-document-outline';
        let elAction = `
            <div class="file-item__action">
                <span class="file-item__edit mdi mdi-lead-pencil"></span>
                <span class="file-item__download mdi mdi-download mx-1" ></span>
                <span class="file-item__remove mdi mdi-trash-can-outline"></span>
            </div>
          
        `;
        if (this.checkDetailView()) {
            elAction = `
            <div class="file-item__action">
                <span class="file-item__download mdi mdi-download mx-1" style="font-size:14px!important"></span>
            </div>
        `;
        }
        let uploadProgress =
            `   
            <div class="px-7 upload-progress upload-hidden" file-data=` +
            JSON.stringify(fileData.name) +
            `  >
                <div style="height: 5px;  margin-top:-5px; background-color:#DCDCDC" class="w-100 upload-progress-full " ></div>
                <div style="height: 5px;  margin-top:-5px; background-color:orange" class="upload-progress-loading"></div>
            </div> `;
        let file = `
                <div class="file-item mb-1" id-file= "${fileData.id}" name-file= "${fileData.name}" path= "${fileData.serverPath}">
                    <span class="mdi ${icon}" style="font-size: 14px;"></span>
                    <div class="file-item__name"> ${fileData.name} </div>
                    ${elAction}
                </div>
            `;
        if (this.checkViewType('update') || this.checkViewType('submit')) {
            file = file + uploadProgress;
        }
        return file;
    }
    genBtnAddFile(rowId = null) {
        return `
            <div class="file-add  file-add-click upload-empty" data-rowid="${rowId}">
                <div class="wrap-button-upload w-100">
                    <span class="mdi mdi-upload" style="color:#707070; font-size:20px"></span>
                    <span class="color-grey ">${SYMPER_APP.$t(
                        'common.drag_or_click_here'
                    )}</span>
                </div>
            </div>
        `;
    }
    genUploadMenu() {
        return (
            `
        <div class=" d-flex justify-space-between upload-name" style="background:rgba(0, 0, 0, 0.03)!important"  >
            <div class="d-flex justify-space-between ml-2 "> ` +
            this.title +
            `</div>
                <div class="upload-action-button ">
                    <button type="button" title="${SYMPER_APP.$t('v2.doc.other')}" class="dropdown dropbtn v-btn v-btn--flat v-btn--icon v-btn--round theme--light more-actions">
                        <i class=" mdi mdi-dots-vertical" style="font-size:15px"></i>
                    </button>
                    <div id="list-actions" class="dropdown-content">
                        <div class="my-1 upload-dropdown-action download-all fs-12">Download all</div>
                  </div>
            </div>
        </div>
        `
        );
    }
    genFileView = function (rowId = null) {
        let addTpl = '';
        if (!this.checkDetailView()) {
            addTpl = this.genBtnAddFile();
        } else {
            addTpl = this.genUploadMenu();
        }
        let maxHeight = '100px';
        let maxWidth = '200px';
        let height = '35px';
        if (
            this.controlProperties.height &&
            this.controlProperties.height.value &&
            !this.controlProperties.height.value.groupType
        ) {
            maxHeight = this.controlProperties.height.value + 'px';
            height = maxHeight;
        }
        if (
            this.controlProperties.width &&
            this.controlProperties.width.value &&
            !this.controlProperties.width.value.groupType
        ) {
            maxWidth = this.controlProperties.width.value + 'px';
        }
        let templateListFile =
            `<div class="list-file" style="max-height:` +
            maxHeight +
            `"></div>`;
        if (!this.inTable) {
            if (this.checkViewType('detail')) {
                return (
                    addTpl +
                    `<div class="upload-file-wrapper-outtb" style="max-height:` +
                    maxHeight +
                    `;width:` +
                    maxWidth +
                    `">${templateListFile}</div>`
                );
            } else {
                return (
                    `<div class="upload-file-wrapper-outtb d-flex align-center" style="height:` +
                    height +
                    `!important;width:` +
                    maxWidth +
                    `; margin-left:-5px; max-height:` +
                    maxHeight +
                    `">${addTpl + templateListFile}</div>`
                );
            }
        }
        return addTpl.replace(/\n/g, '');
    };
    getNumberFormat() {
        return this.controlProperties.hasOwnProperty('formatNumber')
            ? this.controlProperties.formatNumber.value
            : '';
    }

    renderNumberControl(isPercent = false) {
        let thisObj = this;
        this.ele.css('text-align', 'right');
        if (isPercent) {
            let icon = `<span class="percent-icon">%</span>`;
            this.ele.parent().append(icon);
        }
        this.ele.attr('type', 'text');
        this.numberFormat = this.getNumberFormat();
        this.ele.on('blur', function (e) {
            if ($(this).hasClass('trace-current-control')) {
                return;
            }
            let currentInputValue = $(this).val();
            thisObj.removeValidateIcon('NaN');
            if (currentInputValue == '') {
                thisObj.ele.removeClass('error');
                thisObj.ele.removeAttr('valid');
            } else {
                if (/^=/.test(currentInputValue)) {
                    thisObj.formulaValue = currentInputValue;
                    currentInputValue = currentInputValue.replace(/=/g, '');
                    thisObj.ele.removeClass('error');
                    thisObj.ele.removeAttr('valid');
                    if (thisObj.numberFormat) {
                        $(this).val(
                            numeral(eval(currentInputValue)).format(
                                thisObj.numberFormat
                            )
                        );
                    } else {
                        $(this).val(eval(currentInputValue));
                    }
                } else if (/[-0-9,.]*[0-9]$/.test(currentInputValue)) {
                    thisObj.ele.removeClass('error');
                    thisObj.ele.removeAttr('valid');
                    if (thisObj.numberFormat) {
                        $(this).val(
                            numeral(currentInputValue).format(
                                thisObj.numberFormat
                            )
                        );
                    } else {
                        if (/,|\.$/.test(currentInputValue)) {
                            thisObj.ele.addClass('error');
                            let controlTitle =
                                thisObj.title == ''
                                    ? thisObj.name
                                    : thisObj.title;
                            let valid =
                                SYMPER_APP.$t('v2.doc.fieldValue') +
                                controlTitle +
                                SYMPER_APP.$t('v2.doc.incorrectNumberFormat');
                            thisObj.renderValidateIcon(valid, 'NaN');
                            thisObj.ele.attr('valid', valid);
                        }
                    }
                } else {
                    thisObj.ele.addClass('error');
                    let controlTitle =
                        thisObj.title == '' ? thisObj.name : thisObj.title;
                    let valid =
                        SYMPER_APP.$t('v2.doc.fieldValue') + controlTitle + SYMPER_APP.$t('v2.doc.mustBeANumber');
                    thisObj.renderValidateIcon(valid, 'NaN');
                    thisObj.ele.attr('valid', valid);
                }
            }
        });
        this.setForcusFormatNumberEvent();
    }
    setForcusFormatNumberEvent() {
        if (this.checkViewType('submit') || this.checkViewType('update')) {
            this.ele.on('focus', function (e) {
                if (/^[-0-9,.]+$/.test($(this).val())) {
                    $(this).val(numeral($(this).val()).value());
                }
            });
        }
    }
    displayTextWidth(text, font) {
        let canvas =
            this.displayTextWidth.canvas ||
            (this.displayTextWidth.canvas = document.createElement('canvas'));
        let context = canvas.getContext('2d');
        context.font = font;
        let metrics = context.measureText(text);
        return metrics.width;
    }
    // hiện kiểu thẻ cho ô input filter
    genCardsInputFilter(width) {
        width = Number(width.split('px')[0]);
        let listValues = this.value.split(',');
        let listSmallCards = [];
        let widthCharacter = 6.5; // độ rộng trung bình 1 chữ
        const limit = Math.trunc(width / widthCharacter); // giới hạn kí tự hiển thị
        let listSmallCardLength = 0;
        let allCardWidth = 0;
        let countHiddenCard = 0;
        listValues.map((val, index) => {
            let originalValue = val.substring(1, val.length - 1);
            let trimValue =
                originalValue.length > limit
                    ? `${originalValue.substring(0, limit)}`
                    : originalValue; // trường hợp 1 thẻ quá dài thì cắt thẻ
            let cardWidth =
                this.displayTextWidth(
                    originalValue,
                    '11px Roboto, sans-serif'
                ) + 7.8;
            allCardWidth += cardWidth;
            listSmallCardLength += 1; // các thẻ
            let card = `<span control-name="${this.name}" 
                style="width: ${cardWidth}px; margin-right:5.8px; " 
                onclick="showDetailCard(this)" 
                class="card-input-filter px-1">${trimValue}
                </span>`;
            if (allCardWidth > width) {
                countHiddenCard += 1;
            }
            listSmallCards += card;
        });
        if (allCardWidth > width) countHiddenCard = countHiddenCard - 1;
        return (
            `
        <div class="d-flex input-filter-card" style="heigth:27px" >
            <div class="d-flex flex-row align-center input-filter-small-card" 
                style="max-width: ${width}px; width: ${width}px">` +
            listSmallCards +
            `</div>
            <div style="width: 50px" class="d-flex ">
                ${
                    countHiddenCard > 0
                        ? "<div class='input-filter-number mr-2'>+" +
                          countHiddenCard +
                          '</div>'
                        : '<div style="width:5px"></div>'
                }
                <button control-name="${this.name}" 
                    class="input-filter-button-add s-control s-control-filter" 
                    s-control-type="inputFilter"
                    onclick="openFilter(this)">
                    <i class="mdi mdi-plus"></i>
                </button>
            </div>
        </div>
        `
        );
    }
    renderFilterControl() {
        this.controlProperties.width.value =
            this.controlProperties.width.value == ''
                ? this.ele[0].clientWidth + 'px'
                : this.controlProperties.width.value;
        if (this.checkDetailView()) return;
        this.ele.attr('type', 'text');
    }
    renderUserControl() {
        this.ele.attr('type', 'text');
        this.ele.parent().css({ display: 'block' });
        this.setMappingUserId();
    }
    /**
     * hàm map userId vơi thông tin input đã được cấu hình trong control
     */
    setMappingUserId() {
        let listUser = util.cloneDeep(store.state.app.allUsers);
        let inputValue = this.controlProperties.itemValue.value;
        inputValue = typeof inputValue == 'object' ? 'id' : inputValue;
        listUser = listUser.reduce((arr, obj) => {
            arr[obj[inputValue]] = obj['displayName'];
            return arr;
        }, {});
        this.mapData = listUser;
    }
    renderLabelControl() {
        this.ele.text('').css({ border: 'none' });
    }
    renderCheckboxControl() {
        this.ele.parent().css({ 'vertical-align': 'middle' });
    }
    renderSelectControl(isReadOnly = true) {
        let thisObj = this;
        this.ele.attr('readonly', isReadOnly);
        this.ele.on('click', function (e) {
            if (!thisObj.controlFormulas.list) {
                return;
            }
            let formulasInstance = thisObj.controlFormulas.list.instance;
            let isSingleSelect = false;
            if (thisObj.type == 'combobox') {
                isSingleSelect = thisObj.checkProps('isSingleSelect');
            }
            SYMPER_APP.$evtBus.$emit('document-submit-select-input', {
                e: e,
                selectFormulasInstance: formulasInstance,
                alias: thisObj.name,
                controlTitle: thisObj.title,
                controlName: thisObj.name,
                type: thisObj.type,
                isSingleSelect: isSingleSelect,
                currentValue: thisObj.value
            });
        });
    }

    renderDateTimeControl() {
        this.ele.attr('type', 'text');
        this.formatDateTime = this.getDateTimeFormat();
        this.ele.attr('placeholder', this.formatDateTime);
        if (this.checkDetailView()) return;
    }
    makeValidTargetForRichtext() {
        if (this.ele[0]) {
            let wrapHtml = this.ele[0].outerHTML;
            wrapHtml = wrapHtml.replace('<input', '<div');
            wrapHtml += '</div>';
            let newEle = $(wrapHtml);

            this.ele.after(newEle);
            this.ele.remove();
            this.ele = newEle;
        }
    }
    renderDateControl() {
        this.ele.attr('type', 'text');
        this.formatDate = this.getDateFormat();
        this.minDate = '';
        this.maxDate = '';
        this.ele.attr('placeholder', this.formatDate);
        if (this.checkDetailView()) return;
    }
    renderTimeControl() {
        if (this.checkDetailView()) return;
        this.ele.attr('type', 'text');
    }
    renderDocumentInstanceIdentifierControl() {
        this.ele.attr('disabled', 'disabled');
    }
    checkDisableButtonLocation() {
        let waitingActive = this.checkPropsValue(
            'typeGetLocation',
            'waitActive'
        );
        let isEmptyFormulas =
            !this.checkEmptyFormulas('activeManualLocation') &&
            !this.checkEmptyFormulas('activeAutomaticLocation');
        return (
            this.checkProps('isReadOnly') || (waitingActive && isEmptyFormulas) || !(this.isActiveManualLocation || this.isActiveAutomaticLocation || !waitingActive)
        );
    }
    renderLocationControl() {
        const self = this;
        this.ele.find('input').addClass('s-control s-control-text mdi pa-0');
        this.ele.find('span').addClass('d-none');
        this.ele.find('input').attr('type', 'text');
        this.ele.find('input').css('width', this.ele.css('width'));
        this.ele.find('input').css('height', this.ele.css('height'));
        this.ele.find('input').attr('disabled', 'disabled');
        if(this.controlProperties.color.value){
            this.ele.find('input').css('color', this.ele.css('color'));
        }
        this.ele.find('input').css('fontSize', this.ele.css('fontSize'));
        this.ele.css('width', parseFloat(this.ele.css('width')) + 55);
        if (!this.checkViewType('detail')) {
            $(`
                <span class="mdi mdi-map-marker-outline control-location-map-marker" > 
                </span>
                <span class="mdi mdi-map-outline control-location-map-outline">
                </span>
            `).insertAfter(this.ele.find('input'));
            this.ele.find('.mdi-map-marker-outline').on('click', function (e) {
                if (!self.checkDisableButtonLocation()) {
                    SYMPER_APP.$evtBus.$emit('document-get-location', self);
                }
            });
            this.ele.find('.mdi-map-outline').on('click', function (e) {
                if (!self.checkDisableButtonLocation()) {
                    let location = self.value;
                    let currentLocation = {
                        lat: 0,
                        lng: 0
                    };
                    currentLocation.lat = Number(location.lat);
                    currentLocation.lng = Number(location.lng);
                    window.open(
                        `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`
                    );
                }
            });
        }
    }

    setLocation(value) {
        try {
            let val = '';
            if (value) {
                if(typeof value == 'string') value = JSON.parse(value)
                if (this.checkPropsValue('inputValueLocation', 'address')) {
                    val = value.address ? value.address : value;
                } else {
                    val = value.lat + ';' + value.lng;
                }
            }
            this.ele.find('input').val(val);
            this.value = value;
            this.checkRequire(val);
        } catch (error) {
            console.warn(error);
        }
    }
    renderRichTextControl() {
        this.ele
            .parent()
            .css({
                width: '100%',
                'max-height': '300px',
                'min-height': '30px'
            });
        this.ele.css('max-width', '100%');
        let isReadOnly = 1;
        let selector = '';
        let self = this;
        this.editor = '';
        let formatFont = 'body {font-size:13px;color:blue;font-family:Roboto}';
        let toolbar =
            '  bold italic underline forecolor backcolor' +
            '   alignleft aligncenter alignright alignjustify emoticons numlist bullist';
        let isShowToolBar = false;
        let id = this.id + this.keyInstance;
        this.ele.attr('id', id);
        this.id = id;
        if (this.checkViewType('submit') || this.checkViewType('update')) {
            this.ele = $('#sym-submit-' + this.keyInstance).find('#' + this.id);
            isReadOnly = 0;
            if (this.controlProperties.isReadOnly.value == 1) isReadOnly = 1;
            selector = '#sym-submit-' + this.keyInstance + ' #' + this.id;
            if (this.controlProperties.isShowHeaderTinyMce.value) {
                isShowToolBar = toolbar;
                toolbar = false;
            } else {
                isShowToolBar = false;
            }
        } else {
            this.ele = $('#sym-Detail-' + this.keyInstance).find('#' + this.id);
            selector = '#sym-Detail-' + this.keyInstance + ' #' + this.id;
            toolbar = false;
        }
        this.makeValidTargetForRichtext();
        tinymce.init({
            toolbar: isShowToolBar,
            menubar: false,
            toolbar_sticky: true,
            inline: true,
            toolbar_location: 'top',
            paste_retain_style_properties: 'none',
            paste_as_text: true,
            relative_urls: false,
            fontsize_formats:
                '8pt 9pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 17pt 18pt',
            color_cols: 5,
            lineheight_formats: '0 0.25 0.5 0.75 1 1.25 1.5',
            quickbars_insert_toolbar: isShowToolBar ? '' : toolbar,
            branding: false,
            readonly: isReadOnly,
            content_style:
                "@import url('https://fonts.googleapis.com/css2?family=Lato:wght@900&family=Roboto&display=swap'); " +
                formatFont,
            font_formats:
                'Lato Black=lato; Roboto=roboto;Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Oswald=oswald; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats',
            quickbars_selection_toolbar: isShowToolBar ? '' : toolbar,
            plugins: ['quickbars', 'lists', 'paste'],
            selector: selector,
            statusbar: false,
            init_instance_callback: function (editor) {
                self.editor = editor;
                self.setRichtextValue();
                self.wrapTextRichText();
            },
            onchange_callback: function (data) {
                self.changeData(data);
            },
            setup: function (editor) {
                editor.on('keyup', function (e) {
                    if (self.delayTimer) {
                        clearTimeout(self.delayTimer);
                    }
                    self.delayTimer = setTimeout(() => {
                        self.changeData(editor.getContent());
                        self.focusRichText(e);
                    }, 200);
                });
                editor.on('focus', function (e) {
                    self.focusRichText(e);
                });
                editor.on('focusout', function (e) {
                    self.unfocusRichText();
                });
            }
        });
    }
    unfocusRichText(e) {
        let richTextHeight = this.getRichTextHeight(true);
        this.setHeightRichText(richTextHeight);
        this.ele.css({ border: 'none' });
        this.ele.css({ 'border-bottom': '1px solid lightgrey' });
    }
    focusRichText(e) {
        let richTextHeight = this.getRichTextHeight(true);
        this.setHeightRichText(richTextHeight + 20);
        this.ele.css({ border: '1px solid lightgrey' });
        this.ele.css({ 'border-radius': '4px' });
    }
    checkRequireRichText(data) {
        let checkChange = false;
        if (
            this.controlProperties.isRequireChange.value &&
            str.decodeHTMLEntities(this.value) == this.inputValue
        ) {
            checkChange = true;
        }
        this.checkRequire(data, checkChange);
    }
    changeData(data) {
        this.value = data;
        this.checkRequireRichText(data);
    }
    getRichTextHeight(isWrapText = false) {
        let height = 0;
        if (this.controlProperties.height.value == '' || isWrapText) {
            let ul = this.ele.find('ul');
            ul.map((idx) => {
                height += ul[idx].offsetHeight;
            });
            let p = this.ele.find('p');
            p.map((idx) => {
                height += p[idx].offsetHeight;
            });
            height += 10;
        } else {
            height = this.controlProperties.height.value;
        }
        return Number(height);
    }
    cssValidateIconRichText() {
        $('.tox-tinymce')
            .siblings('.validate-icon')
            .css({ left: '1px', 'z-index': 9, position: 'absolute' });
    }
    setHeightRichText(height) {
        this.ele.closest('span').css({ height: height + 'px' });
        this.ele.css({
            height: height + 'px',
            'border-bottom': '1px solid lightgrey'
        });
    }
    wrapTextRichText() {
        if (this.value == '') {
            this.setHeightRichText(0);
        } else {
            let totalHeight = this.getRichTextHeight(true);
            this.setHeightRichText(totalHeight);
        }
        this.ele.css({ 'border-bottom': '1px solid lightgrey' });
    }
    setRichtextValue() {
        if (!this.value) {
            this.value = '';
        }
        if (this.editor) {
            this.changeData(this.value);
            return this.editor.setContent(this.value);
        }
    }
    getDefaultValue() {
        if (this.isCheckbox) {
            return false;
        } else if (this.isNumber || this.isPercent) {
            return 0;
        } else {
            return '';
        }
    }
    // hàm kiểm tra control này có thuộc tính require hay không
    isRequiredControl() {
        if (
            this.controlProperties['isRequired'] != undefined &&
            (this.controlProperties['isRequired'].value == '1' ||
                this.controlProperties['isRequired'].value == 1)
        ) {
            return true;
        }
        return false;
    }
    renderMoreInfoControlIcon() {
        if (this.ele.parent().find('.info-control-btn').length == 0) {
            this.ele.addClass('info-control-btn');
            this.ele.attr('data-control', this.name);
            this.ele.parent().append(
                `<button class="control-link-button ">
                    <i class="mdi mdi-link-variant icon-link-control" style="color:orange"></i>
        </button>`
            );
        }
    }
    renderRunFormulaManuallyControlIcon() {
        this.ele.parent().append(
            `<button class="button-run-formula-manually-control-outTable" control-name="`+this.name+`" >
                <i class="mdi mdi-refresh d-block document-submit-button-run-formula-manually" style="color:orange"></i>
                <span class="tooltiptext">${SYMPER_APP.$t('v2.doc.refreshValue')}</span>
            </button>` )
    }
    removeMoreInfoControlIcon() {
        this.ele.removeClass('info-control-btn');
        this.ele.parent().find('.control-link-button').remove();
    }
    /**
     * Hàm chuyển định dạng date sang dạng sql hiểu được
     */
    convertDateToStandard(data) {
        let dateFormat = this.controlProperties.formatDate.value;
        if (!dateFormat) {
            return data;
        }
        if (!data) {
            return '';
        }
        if (typeof data == 'object') {
            let newData = [];
            for (let index = 0; index < data.length; index++) {
                let value = data[index];
                if (value) {
                    if (
                        SYMPER_APP.$moment(value, 'YYYY-MM-DD', true).isValid()
                    ) {
                        newData.push(value);
                    } else {
                        newData.push(
                            SYMPER_APP.$moment(value, dateFormat).format(
                                'YYYY-MM-DD'
                            )
                        );
                    }
                } else {
                    newData.push('');
                }
            }
            return newData;
        } else {
            if (SYMPER_APP.$moment(data, 'YYYY-MM-DD', true).isValid()) {
                return data;
            }
            return SYMPER_APP.$moment(data, dateFormat).format('YYYY-MM-DD');
        }
    }
    /**
     * Hàm chuyển định dạng datetime sang dạng sql hiểu được
     */
    convertDateTimeToStandard(data) {
        let dateTimeFormat = this.getDateTimeFormat();
        if (!dateTimeFormat) {
            return data;
        }
        if (!data) {
            return '';
        }
        if (typeof data == 'object') {
            let newData = [];
            for (let index = 0; index < data.length; index++) {
                let value = data[index];
                if (value) {
                    if (
                        SYMPER_APP.$moment(
                            value,
                            'YYYY-MM-DD HH:mm:ss',
                            true
                        ).isValid()
                    ) {
                        newData.push(value);
                    } else {
                        newData.push(
                            SYMPER_APP.$moment(value, dateTimeFormat).format(
                                'YYYY-MM-DD HH:mm:ss'
                            )
                        );
                    }
                } else {
                    newData.push('');
                }
            }
            return newData;
        } else {
            if (
                SYMPER_APP.$moment(data, 'YYYY-MM-DD HH:mm:ss', true).isValid()
            ) {
                return data;
            }
            return SYMPER_APP.$moment(data, dateTimeFormat).format(
                'YYYY-MM-DD HH:mm:ss'
            );
        }
    }
    /**
     * Hàm chuyển định dạng time sang dạng sql hiểu được HH:mm:ss
     */
    convertTimeToStandard(data) {
        if (!data) {
            return '';
        }
        if (typeof data == 'object') {
            let newData = [];
            for (let index = 0; index < data.length; index++) {
                let value = data[index];
                if (value) {
                    newData.push(
                        SYMPER_APP.$moment(value, 'hh:mm A').format('HH:mm:ss')
                    );
                } else {
                    newData.push('');
                }
            }
            return newData;
        } else {
            return SYMPER_APP.$moment(data, 'hh:mm A').format('HH:mm:ss');
        }
    }
    highlightControl(rowObjectId = false) {
        $('.highlight-history').removeClass('highlight-history');
        this.cellHighlight = {};
        if (this.inTable != false) {
            let tableIns = getControlInstanceFromStore(
                this.keyInstance,
                this.inTable
            );
            let rowNode =
                tableIns.tableInstance.getRowNodeByObjectId(rowObjectId);
            this.cellHighlight[rowNode.id] = true;
            tableIns.tableInstance.refreshCells(this.name, [rowNode.id]);
        } else {
            this.ele.addClass('highlight-history');
        }
    }
    unHighlightControl() {
        if (this.inTable != false) {
            this.cellHighlight = null;
        } else {
            this.ele.removeClass('highlight-history');
        }
        $('.highlight-history').removeClass('highlight-history');
    }
}

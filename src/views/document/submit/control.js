import Formulas from './formulas';
import sDocument from './../../../store/document';
import { markBinedField } from './handlerCheckRunFormulas';
import { SYMPER_APP } from './../../../main.js';
import store from './../../../store';
import {
    getControlInstanceFromStore,
    getListInputInDocument
} from './../common/common';

export default class Control {
    constructor(idField, ele, controlProps, keyInstance, value = '') {
        /**
         * object các thuộc tính về hiển thị của control
         */
        this.controlProperties = controlProps.properties;
        /**
         * Object các thuộc tính về công thức của control
         */
        this.controlFormulas = controlProps.formulas;
        /**
         * jQueryObject tham chiếu tới DOM của control
         */
        this.ele = ele;
        /**
         * instance của submit hiện tại
         */
        this.keyInstance = keyInstance;
        /**
         * id của dòng dữ liệu trong bảng field, phục vụ cho việc lấy datapost submit
         */
        this.idField = idField;
        this.value = value;
        this.defaultValue = '';
        this.lastUserUpdate = controlProps.userUpdate;
        /**
         * Các thông tin khác về giá trị có thể lưu vào biến nay:
         * vidu: validate or message
         */
        this.valueValidation = {};
        /**
         * Thông tin liên quan đến các loại thông báo vi phạm của control trong nhập liệu
         */
        this.validateMessageType = [
            'Require',
            'RequireChange',
            'Validate',
            'UniqueDB',
            'UniqueTable',
            'MaxLength',
            'MinLength',
            'NaN',
            'DateValid',
            'DateTimeValid'
        ];
    }
    init() {
        /**
         * mảng luu giá trị các control bị ảnh hưởng, chỉ ra control này thay đổi giá trị thì sẽ thay đổi theo các control nào
         */
        this.effectedControl = {};
        this.effectedHiddenControl = {};
        this.effectedRequireControl = {};
        this.effectedReadonlyControl = {};
        this.effectedLinkControl = {};
        this.effectedValidateControl = {};
        this.effectedDepartmentControl = {};
        this.effectedMinDateControl = {};
        this.effectedMaxDateControl = {};
        this.effectedPrefixDocInstanceIdentifier = {};
        this.effectedSuffixDocInstanceIdentifier = {};
        this.effectedActiveManualLocation = {};
        this.effectedActiveAutomaticLocation = {};
        this.inTable =
            this.controlProperties.inTable != undefined
                ? this.controlProperties.inTable
                : false;
        this.docName = this.controlProperties.docName;
        /**
         * Tên của control
         */
        this.name = this.controlProperties.hasOwnProperty('name')
            ? this.controlProperties.name.value
            : '';
        this.title = this.controlProperties.hasOwnProperty('title')
            ? this.controlProperties.title.value
            : '';
        /**
         * id của control
         */
        this.id = this.ele.attr('id');

        /**
         * Loại control
         */
        this.type = this.ele.attr('s-control-type');
        /**
         * Danh sách các control bị thay đổi giá trị, hoặc hiển thị... khi control này thay đổi giá trị
         */
        this.sourceControlNames = {
            validate: {},
            readonly: {},
            visibility: {},
            require: {},
            data: {}
        };
        this.currentDataStore = this.getDataStoreSubmit();
        this.initFormulas();
        this.setValueValidation();
    }

    /**
     * các thuộc tính sử dụng trong cellRenderer table
     * phục vụ cho validate
     */
    setValueValidation() {
        this.valueValidation = {
            Require: {},
            RequireChange: {},
            Validate: {},
            UniqueDB: {},
            UniqueTable: {},
            MinLength: {},
            MaxLength: {}
        };
        if (this.type == 'date') {
            this.valueValidation['DateValid'] = {};
        }
        if (this.type == 'dateTime') {
            this.valueValidation['DateTimeValid'] = {};
        }
        if (['number', 'percent'].includes(this.type)) {
            this.valueValidation['NaN'] = {};
        }
    }
    setHiddenControl() {
        if (this.hidden) {
            if (this.inTable != false) {
                let visible = !this.hidden;
                this.controlProperties.isHidden.value = !visible;
                let tableIns = getControlInstanceFromStore(
                    this.keyInstance,
                    this.inTable
                );
                setTimeout(
                    (self) => {
                        tableIns.tableInstance.setColumnsVisible(
                            [self.name],
                            visible
                        );
                    },
                    300,
                    this
                );
            } else {
                let display = 'none';
                if (this.type == 'page') {
                    this.setHiddenPage();
                } else if (this.type == 'tab') {
                    this.setHiddenTab();
                } else if (this.type == 'table') {
                    this.tableInstance.toggle(display);
                } else {
                    this.ele.parent().css({ display: display });
                }
            }
        }
    }
    /**
     * Hàm kiểm tra có tồn tại control được chọn làm cache trong table hay không
     * @returns
     */
    isKeyCacheInTable() {
        if (!this.controlProperties.isKeyCacheInTable) {
            return false;
        }
        let isKeyCacheInTable = this.controlProperties.isKeyCacheInTable.value;
        if (typeof isKeyCacheInTable == 'object') {
            return false;
        }
        return this.controlProperties.isKeyCacheInTable.value;
    }
    /**
     * Hàm trả về giá trị của 1 prop
     * @param {*} prop
     */
    getValueProp(prop) {
        if (this.controlProperties[prop] != undefined) {
            if (typeof this.controlProperties[prop].value == 'object') {
                return '';
            }
            return this.controlProperties[prop].value;
        }
        return false;
    }
    getDataStoreSubmit() {
        return sDocument.state.submit[this.keyInstance];
    }

    /**
     * Hàm check có tồn tại và có giá trị thuộc tính của control
     * @param {*} props
     */
    checkProps(props) {
        if (
            this.controlProperties[props] &&
            this.controlProperties[props].value == true
        ) {
            return true;
        }
        return false;
    }
    // * Hàm check có tồn tại và có giá trị thuộc tính của control = 1 giá trị nào đó
    checkPropsValue(props, value) {
        if (
            this.controlProperties[props] &&
            this.controlProperties[props].value == value
        ) {
            return true;
        }
        return false;
    }
    /**
     * Hàm kiểm tra có sự tồn tại công thức nào đó của control hay không
     * @param {*} type
     * @returns
     */
    checkEmptyFormulas(type) {
        if (
            this.controlFormulas.hasOwnProperty(type) &&
            this.controlFormulas[type].instance
        ) {
            return true;
        }
        return false;
    }
    /**
     * Hàm lấy ra 1 đối tượng formula của control
     * @param {*} type
     * @returns
     */
    getFormulaInstance(type) {
        if (
            this.controlFormulas.hasOwnProperty(type) &&
            this.controlFormulas[type].instance
        ) {
            return this.controlFormulas[type].instance;
        }
        return false;
    }

    /**
     * hàm kiểm tra có tồn tại thuộc tính nào đó của control không
     * @param {*} props
     * @returns
     */
    checkEmptyProps(props) {
        if (
            this.controlProperties[props] !== undefined &&
            this.controlProperties[props].value !== '' &&
            this.controlProperties[props].value !== null &&
            this.controlProperties[props].value !== undefined
        ) {
            return this.controlProperties[props].value;
        }
        return false;
    }

    // set các mối quan hệ của các control trường hợp đã được lưu trên server
    setEffectedData(effected) {
        if (effected == '' || effected == null) {
            return;
        }
        try {
            effected = JSON.parse(effected);
            for (let type in effected) {
                if (type == 'effectedControl') {
                    this.effectedControl = effected[type];
                } else if (type == 'effectedHiddenControl') {
                    this.effectedHiddenControl = effected[type];
                } else if (type == 'effectedRequireControl') {
                    this.effectedRequireControl = effected[type];
                } else if (type == 'effectedReadonlyControl') {
                    this.effectedReadonlyControl = effected[type];
                } else if (type == 'effectedLinkControl') {
                    this.effectedLinkControl = effected[type];
                } else if (type == 'effectedValidateControl') {
                    this.effectedValidateControl = effected[type];
                } else if (type == 'effectedDepartmentControl') {
                    this.effectedDepartmentControl = effected[type];
                } else if (type == 'effectedMinDateControl') {
                    this.effectedMinDateControl = effected[type];
                } else if (type == 'effectedMaxDateControl') {
                    this.effectedMaxDateControl = effected[type];
                } else if (type == 'effectedSuffixDocInstanceIdentifier') {
                    this.effectedSuffixDocInstanceIdentifier = effected[type];
                } else if (type == 'effectedPrefixDocInstanceIdentifier') {
                    this.effectedPrefixDocInstanceIdentifier = effected[type];
                } else if (type == 'effectedActiveManualLocation') {
                    this.effectedActiveManualLocation = effected[type];
                } else if (type == 'effectedActiveAutomaticLocation') {
                    this.effectedActiveAutomaticLocation = effected[type];
                }
            }
        } catch (error) {}
    }

    /**
     * Khởi tạo các formulas của từng control
     */
    initFormulas() {
        // debugger
        if (Object.keys(this.controlFormulas).length > 0) {
            for (let key in this.controlFormulas) {
                if (key == 'linkConfig') {
                    let configs = this.controlFormulas[key].configData;
                    for (let index = 0; index < configs.length; index++) {
                        let config = configs[index];
                        let formulas = config.formula.value;
                        if (formulas) {
                            formulas = formulas.trim();
                            formulas = formulas.replace(/\r?\n|\r/g, ' ');
                            try {
                                this.controlFormulas[key].configData[index][
                                    'instance'
                                ] = new Formulas(
                                    this.keyInstance,
                                    formulas,
                                    key
                                );
                            } catch (error) {}
                        }
                    }
                } else if (key == 'groupDpm') {
                    let configs = this.controlFormulas[key].configData;
                    for (let index = 0; index < configs.length; index++) {
                        let config = configs[index];
                        let formulas = config.formula.value;
                        if (formulas) {
                            formulas = formulas.trim();
                            formulas = formulas.replace(/\r?\n|\r/g, ' ');
                            this.controlFormulas[key].configData[index][
                                'instance'
                            ] = new Formulas(this.keyInstance, formulas, key);
                        }
                    }
                }
                if (
                    this.controlFormulas[key].value &&
                    Object.values(this.controlFormulas[key].value).length > 0 &&
                    key != 'groupDpm'
                ) {
                    let formulas = Object.values(
                        this.controlFormulas[key].value
                    )[0];
                    formulas = formulas.replace(/\r?\n|\r/g, ' ');
                    formulas = formulas.trim();
                    if (formulas) {
                        this.controlFormulas[key]['instance'] = new Formulas(
                            this.keyInstance,
                            formulas,
                            key
                        );
                        let table =
                            this.controlFormulas[key][
                                'instance'
                            ].detectTableRelateLocalFormulas();
                        if (table.length > 0) {
                            store.commit('document/addToRelatedLocalFormulas', {
                                key: this.name,
                                value: table,
                                instance: this.keyInstance
                            });
                        }
                    }
                }
            }
        }
        this.checkDBOnly();
    }
    /**
     * Hàm gen ra câu lệnh để check duy nhất trong database
     */
    checkDBOnly() {
        if (!this.checkDetailView() && this.checkProps('isDBOnly')) {
            let fromTable =
                this.inTable == false
                    ? 'document_' + this.docName
                    : 'document_child_' + this.docName + '_' + this.inTable;
            let formulas =
                'ref(SELECT count(' +
                this.name +
                ') > 0 AS ' +
                this.name +
                ' from ' +
                fromTable +
                ' where ' +
                this.name +
                " = '{" +
                this.name +
                "}')";
            // this.controlFormulas.uniqueDB = new Formulas(this.keyInstance, formulas, 'uniqueDB');
            this.controlFormulas.uniqueDB = {
                title: SYMPER_APP.$t('v2.doc.uniqueInDatabase'),
                value: formulas,
                instance: new Formulas(this.keyInstance, formulas, 'uniqueDB'),
                formulasId: 0,
                type: 'script',
                groupType: 'formulas'
            };
        }
    }

    /**
     * Các hàm lấy ra thông tin các control bị ảnh hươnngr
     * @returns
     */
    getEffectedControl() {
        return this.effectedControl;
    }
    getEffectedHiddenControl() {
        return this.effectedHiddenControl;
    }
    getEffectedReadonlyControl() {
        return this.effectedReadonlyControl;
    }
    getEffectedRequireControl() {
        return this.effectedRequireControl;
    }
    getEffectedLinkControl() {
        return this.effectedLinkControl;
    }
    getEffectedValidateControl() {
        return this.effectedValidateControl;
    }
    getEffectedDepartmentControl() {
        return this.effectedDepartmentControl;
    }
    getEffectedMinDateControl() {
        return this.effectedMinDateControl;
    }
    getEffectedMaxDateControl() {
        return this.effectedMaxDateControl;
    }
    geteffectedSuffixDocInstanceIdentifier() {
        return this.effectedSuffixDocInstanceIdentifier;
    }
    geteffectedPrefixDocInstanceIdentifier() {
        return this.effectedPrefixDocInstanceIdentifier;
    }
    geteffectedActiveManualLocation() {
        return this.effectedActiveManualLocation;
    }
    geteffectedActiveAutomaticLocation() {
        return this.effectedActiveAutomaticLocation;
    }
    /**
     * Xử lý sau khi chạy xong công thức validate
     * trường hợp trong table group thì có columnName
     */
    handlerDataAfterRunFormulasValidate(values) {
        if (this.inTable != false) {
            if (Object.keys(values).length > 0) {
                let tableIns = getControlInstanceFromStore(
                    this.keyInstance,
                    this.inTable
                );
                for (let rowNode in values) {
                    this.valueValidation['Validate'][rowNode] = {
                        msg: values[rowNode],
                        isValid:
                            values[rowNode] != '' &&
                            values[rowNode] != null &&
                            values[rowNode] != undefined &&
                            values[rowNode] != 'f'
                    };
                }
                tableIns.tableInstance.refreshCells(
                    this.name,
                    Object.keys(values)
                );
            }
        } else {
            if (Array.isArray(values)) {
                values = values[0];
            }
            if (values && values != 1 && values != 't') {
                this.renderValidateIcon(values, 'Validate');
            } else {
                this.removeValidateIcon('Validate');
            }
        }
    }
    findIndexByRowId(dataTable, rowId) {
        for (let index = 0; index < dataTable.length; index++) {
            const row = dataTable[index];
            if (row[row.length - 1] == rowId) {
                return index;
            }
        }
        return 0;
    }
    /**
     * Hàm xử lý hiển thị thông báo sau khi chạy công thức require cahnge
     * @param {*} values
     */
    handlerDataAfterRunFormulasRequireChange(values) {
        if (this.inTable != false) {
            if (Object.keys(values).length > 0) {
                let tableIns = getControlInstanceFromStore(
                    this.keyInstance,
                    this.inTable
                );
                for (let rowNode in values) {
                    this.valueValidation['RequireChange'][rowNode] = {
                        msg: SYMPER_APP.$t('v2.doc.requestChangeFieldValue')+ this.title,
                        isValid: values[rowNode] == 't' || values[rowNode] == 1
                    };
                }
                tableIns.tableInstance.refreshCells(
                    this.name,
                    Object.keys(values)
                );
            }
        } else {
            if (Array.isArray(values)) {
                values = values[0];
            }
            if (values == 1 || values == true || values == 't') {
                this.renderValidateIcon(
                    SYMPER_APP.$t('v2.doc.requestChangeFieldValue') + this.title,
                    'RequireChange'
                );
            } else {
                this.removeValidateIcon('RequireChange');
            }
        }
    }
    /**
     * Hàm xử lý hiển thị thông báo sau khi chạy công thức require
     * @param {*} values
     */
    handlerDataAfterRunFormulasRequire(values) {
        if (this.inTable != false) {
            if (Object.keys(values).length > 0) {
                let tableIns = getControlInstanceFromStore(
                    this.keyInstance,
                    this.inTable
                );
                this.isRequired = true;
                for (let rowNode in values) {
                    if (!this.valueValidation['Require']) {
                        this.valueValidation['Require'] = {};
                    }
                    this.valueValidation['Require'][rowNode] = {
                        msg:
                        SYMPER_APP.$t('v2.doc.notBlankInforField') +
                            this.title,
                        isValid: values[rowNode] == 't' || values[rowNode] == 1
                    };
                }
                tableIns.tableInstance.refreshCells(
                    this.name,
                    Object.keys(values)
                );
            }
        } else {
            if (Array.isArray(values)) {
                values = values[0];
            }
            if (
                this.isEmpty() &&
                (values == 1 || values == true || values == 't')
            ) {
                this.renderValidateIcon(
                    SYMPER_APP.$t('v2.doc.notBlankInforField') + this.title,
                    'Require'
                );
            } else if (this.isEmpty() && values) {
                this.renderValidateIcon(values, 'Require');
            } else {
                this.removeValidateIcon('Require');
            }
        }
    }
    /**
     * Hàm xử lí ẩn hiện control / cột trong table sau khi chạy công thưc ẩn hiện
     * @param {} values
     */
    handlerDataAfterRunFormulasHidden(values) {
        if (Array.isArray(values)) {
            values = values[0];
        }
        if (typeof values == 'object' && values != null) {
            values = values[Object.keys(values)[0]];
        }
        this.hidden =
            values == 1 || values == true || values == 't' ? true : false;
        if (this.inTable != false) {
            let visible = !this.hidden;
            this.controlProperties.isHidden.value = !visible;
            let tableIns = getControlInstanceFromStore(
                this.keyInstance,
                this.inTable
            );
            tableIns.tableInstance.setColumnsVisible([this.name], visible);
        } else {
            let display = this.hidden ? 'none' : 'inline-block';
            if (this.type == 'page') {
                this.setHiddenPage();
            } else if (this.type == 'tab') {
                this.setHiddenTab();
            } else if (this.type == 'table') {
                this.tableInstance.toggle(display);
            } else {
                this.ele.parent().css({ display: display });
                let controlId = this.ele.attr('id');
                let cssTitle = this.ele.css('display');
                if (display == 'none') {
                    cssTitle = 'none';
                }
                this.hideRelatedTitleControl(controlId, cssTitle);
                let childHidden = 0;
                let tr = this.ele.closest('tr').find('.s-control');
                tr.each((index, val) => {
                    if (
                        $(val).parent().css('display').toLowerCase() == 'none'
                    ) {
                        ++childHidden;
                    }
                });
                if (
                    childHidden ==
                    this.ele.closest('tr').find('.s-control').length
                ) {
                    this.ele.closest('tr').addClass('display-none');
                } else {
                    this.ele.closest('tr').removeClass('display-none ');
                }
            }
        }
    }
    // hàm ẩn hiện những control title liên kết control được ẩn
    hideRelatedTitleControl(id, display) {
        $('[control-link-id=' + id + ']').css('display', display);
    }
    /**
     * Hàm xử lí chạy công thức readonly  sau khi chạy công thức readonly
     * @param {*} values
     */
    handlerDataAfterRunFormulasReadonly(values) {
        if (Array.isArray(values)) {
            values = values[0];
        }
        if (typeof values == 'object' && values != null) {
            values = values[Object.keys(values)[0]];
        }
        let readOnly =
            values == 1 || values == true || values == 't' ? true : false;
        this.controlProperties.isReadOnly.value = readOnly;
        if (this.inTable != false) {
            let tableIns = getControlInstanceFromStore(
                this.keyInstance,
                this.inTable
            );
            tableIns.tableInstance.setReadOnlyColumn(this.name, readOnly);
        } else {
            if (readOnly) {
                $('#' + this.id).attr('disabled', 'disabled');
            } else {
                $('#' + this.id).removeAttr('disabled');
            }
        }
        let readOnlyControls = this.currentDataStore['readOnlyControls'];
        readOnlyControls[this.name] = readOnly;
        store.commit('document/updateListInputInDocument', {
            key: 'readOnlyControls',
            value: readOnlyControls,
            instance: this.keyInstance
        });
    }

    /**
     * Hàm bind link vào control sau khi chạy công thức link
     */
    handlerDataAfterRunFormulasLink(value, formulaType) {
        if (this.inTable != false) {
            if (!this.linkControlValue) {
                this.linkControlValue = {};
            }
            for (let rowNodeId in value) {
                if (value[rowNodeId]) {
                    let fullLink = this.getLinkFromData(
                        formulaType,
                        value[rowNodeId]
                    );
                    if (!this.linkControlValue[rowNodeId]) {
                        this.linkControlValue[rowNodeId] = [];
                    }
                    this.linkControlValue[rowNodeId].push(fullLink);
                }
            }
            let tableIns = getControlInstanceFromStore(
                this.keyInstance,
                this.inTable
            );
            tableIns.tableInstance.refreshCells(this.name, Object.keys(value));
        } else {
            if (!value) {
                this.removeMoreInfoControlIcon();
                return;
            }
            let fullLink = this.getLinkFromData(formulaType, value);
            if (!this.linkControlValue) {
                this.linkControlValue = [];
            }
            this.linkControlValue.push(fullLink);
            this.renderMoreInfoControlIcon(value);
            this.ele.attr('object_id', value);
            this.ele.attr('source', fullLink.source);
            this.ele.attr('link-title', fullLink.title);
        }
    }
    getLinkFromData(formulaType, value) {
        let configInstance = formulaType.split('_')[1];
        let controlInstance = getControlInstanceFromStore(
            this.keyInstance,
            this.name
        );
        let linkFormulas =
            controlInstance.controlFormulas.linkConfig.configData;
        let title = '';
        let source = '';
        for (let index = 0; index < linkFormulas.length; index++) {
            let config = linkFormulas[index];
            let formulaIns = config.formula.instance;
            if (Number(formulaIns) == Number(configInstance)) {
                title = config.title;
                source = config.objectType
                    ? config.objectType.type
                    : 'document';
            }
        }
        let fullLink =
            source == 'document'
                ? '/documents/objects/' + value
                : source + ':' + '/dashboard/' + value + '/view';
        return { title: title, link: fullLink, source: source, value: value };
    }

    /**
     * Hàm xử lý data để binding vào control sau khi chạy công thức giá trị
     * @param {*} values
     * @param {*} rowNodeId
     */
    handlerDataAfterRunFormulasValue(values, rowNodeId = {}) {
        if (this.inTable != false) {
            let tableIns = getControlInstanceFromStore(
                this.keyInstance,
                this.inTable
            );
            markBinedField(this.keyInstance, this.name);
            if (Object.keys(rowNodeId).length == 1) {
                values = values ? values : '';
                values =
                    typeof values == 'object'
                        ? Object.values(values)[0]
                        : values;
                tableIns.tableInstance.setDataAtCell(
                    this.name,
                    values,
                    rowNodeId[0]
                );
            } else {
                // trường hợp giá trị cho cả cột
                this.removeNullDataBeforeSetToTable(values);
                tableIns.tableInstance.updateColumnData(
                    values,
                    this.name,
                    rowNodeId
                );
            }
            /**
             * Sau khi chạy xong công thức thì đánh dấu là control đã bind giá trị
             */
            store.commit('document/updateListInputInDocument', {
                controlName: this.name,
                key: 'value',
                value: tableIns.tableInstance.getColData(this.name),
                instance: this.keyInstance
            });
            /**
             * Sau khi chạy xong công thức thì đánh dấu là control đã bind giá trị
             */
        }
    }
    /**
     * loại bỏ các giá trị undefined trước khi đẩy vào table
     * @param {*} values
     */
    removeNullDataBeforeSetToTable(values) {
        for (let key in values) {
            if (!values[key]) {
                values[key] = '';
            }
        }
    }
    setDataTable(data) {
        if (data.length > 0 && data[0].length > 0) {
            let allColumnBindData = Object.keys(data[0][0]);
            if (allColumnBindData.length > 0) {
                for (let index = 0; index < allColumnBindData.length; index++) {
                    const controlName = allColumnBindData[index];
                    let colData = data[0].reduce((arr, obj) => {
                        arr.push(obj[controlName]);
                        return arr;
                    }, []);
                    let vls = [];
                    for (let i = 0; i < colData.length; i++) {
                        vls.push([i, controlName, colData[i]]);
                    }
                    this.tableInstance.setData(vls);
                }
            } else {
                this.tableInstance.setData(false);
            }
        }
    }
    /**
     * Hàm xử lý validate sau khi chạy công thức unique DB
     * @param {*} values
     * @param {*} rowIndex
     */
    handlerDataAfterRunFormulasUniqueDB(values) {
        if (this.inTable == false) {
            if (values == 't' || values === true) {
                this.renderValidateIcon(
                    SYMPER_APP.$t('v2.doc.inforFieldData') +
                        this.title +
                        SYMPER_APP.$t('v2.doc.alreadyExistInDatabase'),
                    'UniqueDB'
                );
            } else {
                this.removeValidateIcon('UniqueDB');
            }
        } else {
            if (Object.keys(values).length > 0) {
                let tableIns = getControlInstanceFromStore(
                    this.keyInstance,
                    this.inTable
                );
                for (let rowNode in values) {
                    this.valueValidation['UniqueDB'][rowNode] = {
                        msg:
                        SYMPER_APP.$t('v2.doc.inforFieldData') +
                            this.title +
                            SYMPER_APP.$t('v2.doc.alreadyExistInDatabase'),
                        isValid: values[rowNode] == 't' || values[rowNode] == 1
                    };
                }
                tableIns.tableInstance.refreshCells(
                    this.name,
                    Object.keys(values)
                );
            }
        }
    }
    /**
     * Hàm xử lí chạy công thức activeManualLocation sau khi chạy công thức activeManualLocation
     * @param {*} values
     */
     handlerDataAfterRunFormulasActiveManualLocation(values) {
       if (Array.isArray(values)) {
           values = values[0];
       }
       if (typeof values == 'object' && values != null) {
           values = values[Object.keys(values)[0]];
       }
       this.isActiveManualLocation =
           values == 1 || values == true || values == 't' ? true : false;
        
   }
    /**
     * Hàm xử lí chạy công thức activeAutomaticLocation sau khi chạy công thức activeAutomaticLocation
     * @param {*} values
     */
     handlerDataAfterRunFormulasActiveAutomaticLocation(values) {
        if (Array.isArray(values)) {
            values = values[0];
        }
        if (typeof values == 'object' && values != null) {
            values = values[Object.keys(values)[0]];
        }
        this.isActiveAutomaticLocation =
            values == 1 || values == true || values == 't' ? true : false;
        if(this.isActiveAutomaticLocation){
            SYMPER_APP.$evtBus.$emit('document-get-location-automatically', this);
        }
    }
    /**
     * generate icon validate
     * @param {*} rowNodeId
     * @returns
     */
    makeErrNoti(rowNodeId = null, style = '') {
        return (
            '<span class="mdi mdi-checkbox-blank-circle validate-icon" ' +
            style +
            ' control-name="' +
            this.name +
            '" row-node-id="' +
            rowNodeId +
            '"></span>'
        );
    }
    /**
     * Hàm set validate control
     * @param {*} message
     * @param {*} type
     */
    renderValidateIcon(message, type) {
        let iconEl = this.makeErrNoti();
        this.ele.parent().append(iconEl);
        this.valueValidation[type] = {};
        this.valueValidation[type][0] = {};
        this.valueValidation[type][0] = {
            isValid: true,
            msg: message
        };
    }
    /**
     * Hàm loại bỏ validate control
     * @param {*} type
     */
    removeValidateIcon(type) {
        delete this.valueValidation[type];
        this.ele.parent().find('.validate-icon').remove();
    }
    isEmpty() {
        return this.ele.val() == '';
    }
    // hàm kiểm tra là view detail hay submit
    checkDetailView() {
        if (sDocument.state.viewType[this.keyInstance] == 'detail') {
            return true;
        } else {
            return false;
        }
    }
    checkViewType(type) {
        if (sDocument.state.viewType[this.keyInstance] == type) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Hàm kiểm tra độ dài giá tri nhập vào với control TextInput
     */

    checkValidValueLength(rowIndex) {
        if (this.type != 'textInput') {
            return true;
        }
        let rs = true;
        if (this.inTable != false) {
            // let table = getListInputInDocument(this.keyInstance)[this.inTable];
            // let colIndex = table.tableInstance.getColumnIndexFromControlName(this.name);
            // let dataAtCol = table.tableInstance.tableInstance.getDataAtCol(colIndex);
            // if (rowIndex == "all") {
            //     for (let index = 0; index < dataAtCol.length; index++) {
            //         let cellPos = index + "_" + colIndex;
            //         let messValidate = {
            //             type: "valueLength",
            //             value: false
            //         }
            //         let row = dataAtCol[index];
            //         if (row == null) {
            //             row = "";
            //         }
            //         if (this.controlProperties.maxValue.value != "") {
            //             if (row.length > this.controlProperties.maxValue.value) {
            //                 messValidate.value = true;
            //                 messValidate.msg = 'Độ dài kí tự không được vượt quá ' + this.controlProperties.maxValue.value + " kí tự";
            //                 rs = false;
            //             }
            //         }
            //         if (this.controlProperties.minValue.value != "") {
            //             if (row.length < this.controlProperties.minValue.value) {
            //                 messValidate.value = true;
            //                 messValidate.msg = 'Độ dài kí tự không được ít hơn ' + this.controlProperties.minValue.value + " kí tự"
            //                 rs = false;
            //             }
            //         }
            //         table.tableInstance.addToValueMap(cellPos, messValidate);
            //     }
            // } else {
            //     let value = dataAtCol[rowIndex];
            //     if (value == null) {
            //         value = "";
            //     }
            //     let cellPos = rowIndex + "_" + colIndex;
            //     let messValidate = {
            //         type: "valueLength",
            //         value: false
            //     }
            //     if (this.controlProperties.maxValue.value != "") {
            //         if (value.length > this.controlProperties.maxValue.value) {
            //             messValidate.value = true;
            //             messValidate.msg = 'Độ dài kí tự không được vượt quá ' + this.controlProperties.maxValue.value + " kí tự";
            //             rs = false;
            //         }
            //     }
            //     if (this.controlProperties.minValue.value != "") {
            //         if (value.length < this.controlProperties.minValue.value) {
            //             messValidate.value = true;
            //             messValidate.msg = 'Độ dài kí tự không được ít hơn ' + this.controlProperties.minValue.value + " kí tự";
            //             rs = false;
            //         }
            //     }
            //     table.tableInstance.addToValueMap(cellPos, messValidate);
            // }
            // table.tableInstance.tableInstance.render()
        } else {
            let checkMax = false;
            if (this.controlProperties.maxValue.value != '') {
                this.removeValidateIcon('MaxLength');
                if (this.value.length > this.controlProperties.maxValue.value) {
                    checkMax = true;
                    this.renderValidateIcon(
                        SYMPER_APP.$t('v2.doc.characterLengthCannotExceed') +
                            this.controlProperties.maxValue.value +
                            SYMPER_APP.$t('v2.doc.character'),
                        'MaxLength'
                    );
                    rs = false;
                }
            }
            if (this.controlProperties.minValue.value != '' && !checkMax) {
                this.removeValidateIcon('MinLength');
                if (this.value.length < this.controlProperties.minValue.value) {
                    this.renderValidateIcon(
                        SYMPER_APP.$t('v2.doc.characterLengthCannotLessThan') +
                            this.controlProperties.minValue.value +
                            SYMPER_APP.$t('v2.doc.character'),
                        'MinLength'
                    );
                    rs = false;
                }
            }
        }

        return rs;
    }
    /**
     * thêm màu đánh dấu control là đầu vào của control đang được kiểm tra với F2
     */
    renderInputTraceControlColor() {
        if (this.inTable) {
            this.traceInputTable();
        } else {
            this.ele.addClass('trace-input-control');
        }
    }
    /**
     * thêm màu đánh dấu control là đầu ra của control đang được kiểm tra với F2
     */
    renderOutputTraceControlColor() {
        if (this.inTable) {
            this.traceInputTable('trace-output-control');
        } else {
            this.ele.addClass('trace-output-control');
        }
    }
    /**
     * thêm màu đánh dấu control đang được kiểm tra với F2
     */
    renderCurrentTraceControlColor() {
        if (this.inTable) {
            this.traceInputTable('trace-current-control');
        } else {
            this.ele.addClass('trace-current-control');
        }
    }
    removeTraceControlColor() {
        if (
            this.type == 'number' &&
            this.formulaValue &&
            this.ele.hasClass('trace-current-control')
        ) {
            this.ele.focus();
        }
        if (this.inTable) {
            this.traceInputTable('', true);
        } else {
            this.ele.attr('class', function (i, c) {
                return c.replace(/trace-.*-control/g, '');
            });
        }
    }
    traceInputTable(className, isRemove = false) {
        let tableControl = getListInputInDocument(this.keyInstance)[
            this.inTable
        ];
        tableControl.tableInstance.traceInputTable(
            this.name,
            className,
            isRemove
        );
    }
    handlerDataAfterRunFormulasMinDate(value) {
        this.minDate = value;
    }
    handlerDataAfterRunFormulasMaxDate(value) {
        this.maxDate = value;
    }
}

import { GetControlProps } from './../../components/document/controlPropsFactory.js';
import { util } from './../../plugins/util.js';

/**
 * Hàm xử lí việc bóc tách dữ liệu của các field từ server để đưa vào store
 * dữ liệu là các thuộc tính và các công thức của các control trong doc
 * @param {} fields
 */
export const allControlNotSetData = [
    'approvalHistory',
    'submit',
    'draft',
    'reset'
];
export const setDataForPropsControl = function (
    worker,
    fields,
    allDataDetail,
    viewType
) {
    worker.postMessage({
        action: 'setDataForPropsControl',
        data: {
            fields: fields,
            viewType: viewType,
            allDataDetail: allDataDetail
        }
    });
};
export const getAllPropFromData = (fields, viewType, allDataDetail) => {
    let listControlToStore = {};
    let controlMapDatasetDataflow = {};
    for (let controlId in fields) {
        let control = GetControlProps(fields[controlId].type);
        let userUpdate = fields[controlId].userUpdate;
        let properties = control.properties;
        let formulas = control.formulas;
        let type = fields[controlId].type;
        if (type == 'dataFlow') {
            controlMapDatasetDataflow[fields[controlId].properties['name']] =
                fields[controlId].properties['datasets'];
        }
        let fieldProperties = fields[controlId]['properties'];
        let id = fieldProperties.id;
        let prepareData = fields[controlId].dataPrepareSubmit;
        for (let prop in properties) {
            if (properties[prop]) {
                if (type == 'checkbox') {
                    let valueControl = fieldProperties[prop];
                    properties[prop].value = valueControl;
                } else {
                    let valueControl = fieldProperties[prop];
                    if (
                        type == 'number' &&
                        prop == 'defaultValue' &&
                        valueControl == ''
                    ) {
                        valueControl = 0;
                    }
                    properties[prop].value = valueControl;
                }
                if (prop == 'tableView') {
                    properties[prop].value = properties[prop].value
                        ? properties[prop].value
                        : 'Flat';
                }
            }
        }
        if (
            fields[controlId]['formulas'] != false &&
            fields[controlId]['formulas'] != '[]'
        ) {
            if (viewType != 'print') {
                for (let fType in formulas) {
                    if (!fields[controlId]['formulas'][fType]) {
                        delete control.formulas[fType];
                    } else {
                        if (fType == 'linkConfig' || fType == 'groupDpm') {
                            if (
                                fields[controlId]['formulas'][fType] &&
                                fields[controlId]['formulas'][fType][
                                    'configData'
                                ].length > 0
                            ) {
                                formulas[fType].configData =
                                    fields[controlId]['formulas'][fType][
                                        'configData'
                                    ];
                            }
                        } else {
                            formulas[fType].value =
                                fields[controlId]['formulas'][fType];
                        }
                    }
                }
            }
        }
        if (fields[controlId].type != 'table' && allDataDetail != null) {
            let value = '';
            if (properties.hasOwnProperty('name')) {
                let controlName = properties['name'].value;
                let allData = util.cloneDeep(allDataDetail);
                value = allData[controlName];
            }
            listControlToStore[controlId] = {
                id: id,
                properties: properties,
                formulas: formulas,
                type: type,
                value: type == 'percent' ? value * 100 : value,
                prepareData: prepareData,
                userUpdate: userUpdate
            };
        } else {
            let listField = fields[controlId].listFields;
            let listChildField = {};
            let colValue = {};
            let childObjectId = [];
            for (let childFieldId in listField) {
                let childControl = GetControlProps(
                    listField[childFieldId].type
                );
                let childProperties = childControl.properties;
                let childFormulas = childControl.formulas;
                let childType = listField[childFieldId].type;
                let childId = listField[childFieldId]['properties'].id;
                let childPrepareData =
                    listField[childFieldId].dataPrepareSubmit;
                for (let childProp in childProperties) {
                    let valueChildProp =
                        listField[childFieldId]['properties'][childProp];
                    if (childProperties[childProp]) {
                        if (childType == 'checkbox') {
                            childProperties[childProp].value = valueChildProp;
                        } else {
                            if (
                                childType == 'number' &&
                                childProp == 'defaultValue' &&
                                valueChildProp == ''
                            ) {
                                valueChildProp = 0;
                            }
                            childProperties[childProp].value = valueChildProp;
                        }
                    }
                }

                if (
                    listField[childFieldId]['formulas'] != false &&
                    listField[childFieldId]['formulas'] != '[]'
                ) {
                    if (viewType != 'print') {
                        for (let childFormulaType in childFormulas) {
                            if (
                                !listField[childFieldId]['formulas'][
                                    childFormulaType
                                ]
                            ) {
                                delete childControl.formulas[childFormulaType];
                            } else {
                                if (
                                    childFormulaType == 'linkConfig' ||
                                    childFormulaType == 'groupDpm'
                                ) {
                                    if (
                                        listField[childFieldId]['formulas'][
                                            childFormulaType
                                        ] &&
                                        listField[childFieldId]['formulas'][
                                            childFormulaType
                                        ]['configData'].length > 0
                                    ) {
                                        childFormulas[
                                            childFormulaType
                                        ].configData =
                                            listField[childFieldId]['formulas'][
                                                childFormulaType
                                            ]['configData'];
                                    }
                                } else {
                                    childFormulas[childFormulaType].value =
                                        listField[childFieldId]['formulas'][
                                            childFormulaType
                                        ];
                                }
                            }
                        }
                    }
                }
                if (
                    childProperties.hasOwnProperty('name') &&
                    allDataDetail != null
                ) {
                    let controlName = childProperties['name'].value;
                    let allData = util.cloneDeep(
                        allDataDetail[properties['name'].value]
                    );
                    if (allData != null && allData != undefined) {
                        let countRow = allData.length;
                        for (let j = 0; j < countRow; j++) {
                            let rowData = allData[j];
                            if (childObjectId.length < countRow) {
                                childObjectId.push(
                                    rowData['document_object_uuid']
                                );
                            }
                            if (!colValue.hasOwnProperty(controlName)) {
                                colValue[controlName] = [];
                            }
                            colValue[controlName].push(rowData[controlName]);
                        }
                    }
                    listChildField[childFieldId] = {
                        id: childId,
                        properties: childProperties,
                        formulas: childFormulas,
                        type: childType,
                        prepareData: childPrepareData,
                        value: colValue[controlName]
                    };
                }
            }
            colValue['childObjectId'] = childObjectId;
            listControlToStore[controlId] = {
                id: id,
                properties: properties,
                formulas: formulas,
                type: fields[controlId].type,
                listFields: listChildField,
                value: colValue,
                prepareData: prepareData,
                userUpdate: userUpdate
            };
        }
    }
    return {
        listControlToStore: listControlToStore,
        controlMapDatasetDataflow: controlMapDatasetDataflow
    };
};

/**
 * Hàm lấy ra các control bị ảnh hưởng từ 1 control
 * từ đó tạo dựng mối quan hệ cho các control
 * lưu vào db cho lần submit sau không phải tìm lại
 */
export const getMapControlEffected = (allControlObj) => {
    let mapControlEffected = {};
    mapControlEffected['rootControl'] = [];
    mapControlEffected['hiddenRootControl'] = [];
    mapControlEffected['locationRootControl'] = [];
    mapControlEffected['dateRootControl'] = [];
    mapControlEffected['impactedFieldsListWhenStart'] = {};
    for (let name in allControlObj) {
        let type = allControlObj[name].type;
        if (type != 'submit' && type != 'reset' && type != 'draft') {
            let formulas = allControlObj[name].controlFormulas;
            for (let formulasType in formulas) {
                if (formulasType == 'autocomplete') {
                    continue;
                }
                if (!mapControlEffected.hasOwnProperty(formulasType)) {
                    mapControlEffected[formulasType] = {};
                }
                if (formulas[formulasType].hasOwnProperty('instance')) {
                    let inputControl =
                        formulas[formulasType].instance.inputControl;
                    if (formulasType == 'formulas') {
                        let f = formulas[formulasType].instance.formulas;
                        if (f != '') {
                            if (Object.keys(inputControl).length == 0) {
                                if (
                                    formulas[
                                        formulasType
                                    ].instance.checkIsSelectOrgchart()
                                ) {
                                    mapControlEffected['rootControl'].push(
                                        name
                                    );
                                    mapControlEffected[
                                        'impactedFieldsListWhenStart'
                                    ][name] = false;
                                }else if (
                                    !formulas[
                                        formulasType
                                    ].instance.checkIsSelectLocalTable()
                                ) {
                                    mapControlEffected['rootControl'].push(
                                        name
                                    );
                                    mapControlEffected[
                                        'impactedFieldsListWhenStart'
                                    ][name] = false;
                                }
                            } else if (Object.keys(inputControl).length == 1) {
                                let inputName = Object.keys(inputControl)[0];
                                let controlInput = allControlObj[inputName];
                                if (!controlInput) {
                                    mapControlEffected['rootControl'].push(
                                        name
                                    );
                                    mapControlEffected[
                                        'impactedFieldsListWhenStart'
                                    ][name] = false;
                                }
                            }
                        }
                    }
                    if (formulasType == 'hidden') {
                        if (Object.keys(inputControl).length == 0) {
                            mapControlEffected['hiddenRootControl'].push(name);
                            // mapControlEffected['impactedFieldsListWhenStart'][name] = false;
                        } else if (Object.keys(inputControl).length == 1) {
                            let inputName = Object.keys(inputControl)[0];
                            let controlInput = allControlObj[inputName];
                            if (!controlInput) {
                                mapControlEffected['hiddenRootControl'].push(
                                    name
                                );
                                // mapControlEffected['impactedFieldsListWhenStart'][name] = false;
                            }
                        }
                    }
                    if ((formulasType == 'activeAutomaticLocation' || formulasType == 'activeManualLocation') && allControlObj[name].properties.typeGetLocation.value == 'waitActive') {
                        if (Object.keys(inputControl).length == 0) {
                            mapControlEffected['locationRootControl'].push(name);
                        } else if (Object.keys(inputControl).length == 1) {
                            let inputName = Object.keys(inputControl)[0];
                            let controlInput = allControlObj[inputName];
                            if (!controlInput) {
                                mapControlEffected['locationRootControl'].push(
                                    name
                                );
                            }
                        }
                    }
                    if ((formulasType == 'minDate' || formulasType == 'maxDate') && !mapControlEffected['dateRootControl'].includes(name)) {
                        if (Object.keys(inputControl).length == 0) {
                            mapControlEffected['dateRootControl'].push(name);
                        } else if (Object.keys(inputControl).length == 1) {
                            let inputName = Object.keys(inputControl)[0];
                            let controlInput = allControlObj[inputName];
                            if (!controlInput) {
                                mapControlEffected['dateRootControl'].push(
                                    name
                                );
                            }
                        }
                    }
                    let inputLocalFormulas =
                        formulas[formulasType].instance.inputForLocalFormulas;
                    let inputFromDatasets =
                        formulas[formulasType].instance.inputFromDatasets;
                    for (let controlEffect in inputControl) {
                        if (
                            !mapControlEffected[formulasType].hasOwnProperty(
                                controlEffect
                            )
                        ) {
                            mapControlEffected[formulasType][controlEffect] =
                                {};
                        }
                        mapControlEffected[formulasType][controlEffect][
                            name
                        ] = false;
                    }
                    for (let controlEffect in inputFromDatasets) {
                        if (
                            !mapControlEffected[formulasType].hasOwnProperty(
                                controlEffect
                            )
                        ) {
                            mapControlEffected[formulasType][controlEffect] =
                                {};
                        }
                        mapControlEffected[formulasType][controlEffect][
                            name
                        ] = false;
                    }
                    for (let controlEffect in inputLocalFormulas) {
                        if (
                            !mapControlEffected[formulasType].hasOwnProperty(
                                controlEffect
                            )
                        ) {
                            mapControlEffected[formulasType][controlEffect] =
                                {};
                        }
                        mapControlEffected[formulasType][controlEffect][
                            name
                        ] = false;
                    }
                    detectControlEffectedInTableInDoc(
                        mapControlEffected[formulasType],
                        name,
                        formulas[formulasType].instance,
                        allControlObj
                    );
                }
            }
        }
    }
    return mapControlEffected;
};

function detectControlEffectedInTableInDoc(
    mapControlEffected,
    name,
    formulaInstance,
    allControlObj
) {
    formulaInstance.detectControlInTable(
        mapControlEffected,
        name,
        formulaInstance.formulas,
        allControlObj
    );
}

export const refreshMapEffectedFormulasControl = (
    mapEffectedFormulasControl
) => {
    let newMapData = {};
    for (let controlName in mapEffectedFormulasControl) {
        let found = DFS(
            mapEffectedFormulasControl[controlName],
            mapEffectedFormulasControl
        );
        if (found) {
            newMapData[controlName] = found;
        }
    }
    return newMapData;
};
/**
 * DFS trong cây mối quan hệ để bổ sung mqh còn thiêu
 */
function DFS(effectedControl, mapControlEffected) {
    let newData = effectedControl;
    for (let k in effectedControl) {
        if (mapControlEffected[k]) {
            let d = DFS(mapControlEffected[k], mapControlEffected);
            newData = { ...newData, ...d };
        } else {
            let item = {};
            item[k] = false;
            newData = { ...newData, ...item };
        }
    }
    return newData;
}

/**
 * hoangnd: kiểm tra công thức chạy infinity hay ko
 *
 */
export const checkInfinityControl = (mapControlEffected) => {
    let controlInfinity = [];
    for (let formulaType in mapControlEffected) {
        if (['list', 'formulas','prefixDocInstanceIdentifier','suffixDocInstanceIdentifier'].includes(formulaType)) {
            for (let controlName in mapControlEffected[formulaType]) {
                let infinityLoopFound = search(
                    controlName,
                    mapControlEffected[formulaType][controlName],
                    mapControlEffected[formulaType]
                );
                if (infinityLoopFound) {
                    controlInfinity.push(infinityLoopFound);
                }
            }
        }
    }
    return controlInfinity;
};
/**
 * DFS trong cây mối quan hệ để tìm control trùng lặp
 */
function search(controlCheck, effectedControl, mapControlEffected) {
    var i,
        children = Object.keys(effectedControl);
    for (i = 0; i < children.length; i += 1) {
        if (mapControlEffected[children[i]]) {
            if (children[i] == controlCheck) {
                return children[i];
            } else {
                if (
                    !Object.keys(mapControlEffected[children[i]]).includes(
                        children[i]
                    ) &&
                    children[i] != controlCheck
                ) {
                    search(
                        controlCheck,
                        mapControlEffected[children[i]],
                        mapControlEffected
                    );
                }
            }
        }
    }
}

/**
 * Hàm kiểm tra xem có sự thay đổi của data input của 1 formula hay không
 * nếu có thì mới thực thi công thức
 * @param {*} instance state của phiên làm việc hiện tại
 * @param {*} dataInput dữ liệu đầu vào của công thức đang check
 * @param {*} rowIndex index của dòng trong bảng
 */
export const checkDataInputChange = function (
    rootChangeFieldName,
    dataInputBeforeChange,
    dataInput
) {
    if (Object.keys(dataInput).length == 0) {
        return true;
    }
    for (let controlName in dataInput) {
        if (controlName == rootChangeFieldName) {
            return true;
        }
        if (
            dataInput[controlName] != null &&
            typeof dataInput[controlName] == 'object'
        ) {
            for (
                let index = 0;
                index < dataInput[controlName].length;
                index++
            ) {
                let cellValue = dataInput[controlName][index];
                if (!dataInputBeforeChange[controlName]) {
                    continue;
                }
                if (!dataInputBeforeChange[controlName][index]) {
                    return true;
                }
                if (dataInputBeforeChange[controlName][index] != cellValue) {
                    return true;
                }
            }
        } else {
            if (dataInputBeforeChange[controlName] != dataInput[controlName]) {
                return true;
            }
        }
    }
    return false;
};

export const genKeyFromDataInput = (dataInput) => {
    let key = [];
    for (let control in dataInput) {
        key.push(control + '_' + dataInput[control]);
    }
    return key.join('__');
};
/**
 * Hàm lấy dữ liệu của các control đầu vào để chuân bị cho việc run formulas
 * dataInput : {controlName : value}
 */
export const getDataInputFormula = (
    formulaInstance,
    listInput,
    extraData = null,
    rowNodeIds = null,
    dataAutoComplete = {},
    selfControlName = ''
) => {
    let inputControl = formulaInstance.getInputControl();
    let dataInput = {};
    for (let inputControlName in inputControl) {
        let hasSelfInputControl = false;
        if (inputControlName == 'self_value') {
            inputControlName = selfControlName;
            hasSelfInputControl = true;
        }
        if (dataAutoComplete[inputControlName]) {
            dataInput[inputControlName] = dataAutoComplete[inputControlName];
        } else {
            if (extraData && extraData[inputControlName]) {
                dataInput[inputControlName] = extraData[inputControlName];
            } else {
                if (listInput.hasOwnProperty(inputControlName)) {
                    let controlIns = listInput[inputControlName];
                    if (!controlIns) {
                        dataInput[inputControlName] = '';
                    } else {
                        if (controlIns.inTable != false) {
                            let currentColData = '';
                            let tableControl = listInput[controlIns.inTable];
                            if (rowNodeIds != 'all' && rowNodeIds.length == 1) {
                                currentColData =
                                    tableControl.tableInstance.getCellDataByNodeId(
                                        inputControlName,
                                        rowNodeIds[0]
                                    );
                            } else if (rowNodeIds == 'all') {
                                currentColData =
                                    tableControl.tableInstance.getColData(
                                        inputControlName
                                    );
                            } else if (rowNodeIds.length > 1) {
                                let listRowData = [];
                                for (
                                    let index = 0;
                                    index < rowNodeIds.length;
                                    index++
                                ) {
                                    let colDataById =
                                        tableControl.tableInstance.getCellDataByNodeId(
                                            inputControlName,
                                            rowNodeIds[index]
                                        );
                                    listRowData.push(colDataById);
                                }
                                currentColData = listRowData;
                            }
                            dataInput[inputControlName] = currentColData;
                        } else {
                            if (
                                controlIns.checkEmptyFormulas('autocomplete') &&
                                controlIns.inputValue
                            ) {
                                dataInput[inputControlName] =
                                    controlIns.inputValue;
                            } else {
                                dataInput[inputControlName] = controlIns.value;
                            }
                        }
                        if (
                            ['inputFilter', 'combobox'].includes(
                                controlIns.type
                            )
                        ) {
                            if (
                                formulaInstance.checkDataInputIsArray(
                                    '{' + inputControlName + '}'
                                )
                            ) {
                                dataInput[inputControlName] =
                                    getDataFromComboboxAndInputFilter(
                                        dataInput[inputControlName]
                                    );
                            } else {
                                dataInput[inputControlName] =
                                    dataInput[inputControlName];
                            }
                        }
                        if (controlIns.type == 'date') {
                            dataInput[inputControlName] =
                                controlIns.convertDateToStandard(
                                    dataInput[inputControlName]
                                );
                        }
                        if (controlIns.type == 'dateTime') {
                            dataInput[inputControlName] =
                                controlIns.convertDateTimeToStandard(
                                    dataInput[inputControlName]
                                );
                        }
                        // if (controlIns.type == 'time') {
                        //     dataInput[inputControlName] =
                        //         controlIns.convertTimeToStandard(
                        //             dataInput[inputControlName],
                        //         );
                        // }
                        if (
                            ['number', 'percent'].includes(controlIns.type) &&
                            !dataInput[inputControlName]
                        ) {
                            dataInput[inputControlName] = 0;
                        }
                        if (controlIns.type == 'department') {
                            dataInput[inputControlName] = controlIns.selectedId
                        }
                    }
                }
            }
        }
        if (hasSelfInputControl) {
            dataInput['self_value'] = dataInput[inputControlName];
            delete dataInput[inputControlName];
        }
    }
    return dataInput;
};
function getDataFromComboboxAndInputFilter(inputData) {
    if (inputData && typeof inputData == 'object') {
        let listData = [];
        for (let index = 0; index < inputData.length; index++) {
            let element = inputData[index] ? inputData[index] : '';
            listData[index] = repairComboBoxData(element);
        }
        return listData;
    } else {
        inputData = inputData ? inputData : '';
        return repairComboBoxData(inputData);
    }
}
function repairComboBoxData(data) {
    let dataInputFilter = data.split("','");
    dataInputFilter = dataInputFilter.reduce((arr, item) => {
        let data = item.replace(/'/g, '');
        data = data.trim();
        arr.push(data);
        return arr;
    }, []);
    return dataInputFilter;
}
// Kiểm tra xem trong công thức của table có dùng dạng IN operator hay không
function checkFormulaRunToOptimize(formulaInstance, listInput) {
    let inputControl = formulaInstance.getInputControl();
    let operatorBefore = formulaInstance.getOperatorBeforeInput();
    if (Object.keys(operatorBefore).length == 0) {
        return false;
    }
    let beforeParamsOperator = {};
    let status = false;
    for (let k in inputControl) {
        let inputInstance = listInput[k];
        if (operatorBefore[k] == 'in') {
            beforeParamsOperator[k] = true;
        }
        if (!inputInstance || inputInstance.inTable == false) {
            continue;
        }
        if (operatorBefore[k] == 'in') {
            status = true;
        }
    }
    return { status: status, beforeParamsOperator: beforeParamsOperator };
}
/**
 * Ham xử lý data input để đưa ra data post cho hàm chạy công thức nhiều dòng trong table
 * @param {} dataInput
 * @param {*} listIdRow
 * @param {*} listInput
 */
export const prepareDataForRun = (
    dataInput,
    listIdRow,
    listInput,
    formulaInstance,
    selfControlName = ''
) => {
    let isOptimize = checkFormulaRunToOptimize(formulaInstance, listInput);
    if (typeof listIdRow != 'object' && Number(listIdRow) >= 0) {
        if (isOptimize.status) {
            for (let k in dataInput) {
                if (dataInput[k] == undefined || dataInput[k] == null) {
                    dataInput[k] = [''];
                } else {
                    dataInput[k] = [dataInput[k]];
                }
            }
        } else {
            for (let k in dataInput) {
                if (dataInput[k] == undefined || dataInput[k] == null) {
                    dataInput[k] = '';
                }
            }
        }
        return dataInput;
    } else {
        return prepareDataOnRow(
            dataInput,
            listIdRow,
            listInput,
            isOptimize.status,
            selfControlName,
            isOptimize.beforeParamsOperator
        );
    }
};
function prepareDataOnRow(
    dataInput,
    listIdRow,
    listInput,
    isOptimize = false,
    selfControlName = '',
    beforeParamsOperator
) {
    let dataPost = {};
    /***
     * Chuẩn bị data để gọi api thực thi công thức cho các control trong table
     */
    if (Object.keys(dataInput).length > 0) {
        let allRowDataInput = [];
        for (let control in dataInput) {
            let isHasSelfControl = false;
            if (control == 'self_value') {
                control = selfControlName;
                isHasSelfControl = true;
            }
            if (listInput[control]) {
                let controlType = listInput[control].type;
                let dataRow = dataInput[control];
                if (isHasSelfControl) {
                    dataRow = dataInput['self_value'];
                }
                if (
                    !Array.isArray(dataRow) ||
                    (dataRow.length == 1 && listIdRow.length > 1)
                ) {
                    for (let index = 0; index < listIdRow.length; index++) {
                        if (allRowDataInput.length <= index) {
                            allRowDataInput[index] = {};
                        }
                        if (['number', 'percent'].includes(controlType)) {
                            if (!dataRow) {
                                dataRow = 0;
                            } else {
                                dataRow = Number(dataRow);
                            }
                        }
                        if (dataRow == undefined || dataRow == null) {
                            dataRow = '';
                        }
                        if (isHasSelfControl) {
                            allRowDataInput[index]['self_value'] = dataRow;
                        } else {
                            allRowDataInput[index][control] = dataRow;
                        }
                    }
                } else {
                    for (let i = 0; i < dataRow.length; i++) {
                        if (allRowDataInput.length <= i) {
                            allRowDataInput[i] = {};
                        }
                        let value = dataRow[i];
                        if (['number', 'percent'].includes(controlType)) {
                            if (!value) {
                                value = 0;
                            } else {
                                value = Number(value);
                            }
                        }
                        if (value == undefined || value == null) {
                            value = '';
                        }

                        if (isHasSelfControl) {
                            allRowDataInput[i]['self_value'] = value;
                        } else {
                            allRowDataInput[i][control] = value;
                        }
                    }
                }
            }
        }
        if (isOptimize) {
            let rs = {};
            let map = {};
            for (let index = 0; index < allRowDataInput.length; index++) {
                let rowInput = allRowDataInput[index];
                for (let k in rowInput) {
                    if (!beforeParamsOperator[k]) {
                        rs[k] = rowInput[k];
                    } else {
                        if (!rs.hasOwnProperty(k)) {
                            rs[k] = [];
                        }
                        rs[k].push(rowInput[k]);
                    }
                }
                map[listIdRow[index]] = rowInput;
            }
            dataPost['rowin'] = rs;
            dataPost['dataMapRowId'] = map;
        } else {
            for (let index = 0; index < allRowDataInput.length; index++) {
                let rowInput = allRowDataInput[index];
                dataPost[listIdRow[index]] = rowInput;
            }
        }
    } else {
        for (let index = 0; index < listIdRow.length; index++) {
            dataPost[listIdRow[index]] = '';
        }
    }
    return dataPost;
}

//cache các data input giống nhau -> chỉ chạy 1 lần
export const cacheDataInput = (dataPostForGetMultiple) => {
    let cacheRowData = {};
    for (let rowId in dataPostForGetMultiple) {
        let key = genKeyFromDataInput(dataPostForGetMultiple[rowId]);
        if (Object.keys(cacheRowData).includes(key)) {
            delete dataPostForGetMultiple[rowId];
        }
        if (!cacheRowData[key]) {
            cacheRowData[key] = [];
        }
        if (!cacheRowData[key].includes(rowId)) {
            cacheRowData[key].push(rowId);
        }
    }
    return {
        cacheRowData: cacheRowData,
        dataPostForGetMultiple: dataPostForGetMultiple
    };
};
export const setRootControlRunFormulaManually = (impactedFieldsList, listControlRunFormulaManually) => {
    let listRootControlRunFormulaManually = {}
    for(let controlName in listControlRunFormulaManually){
        let check = true
        for(let c in impactedFieldsList){
            if(impactedFieldsList[c].hasOwnProperty(controlName) && listControlRunFormulaManually.hasOwnProperty(c)){
                check = false;
                break;
            }
        }
        if(check){
            listRootControlRunFormulaManually[controlName] = false                   
        }
    }
    return listRootControlRunFormulaManually
};

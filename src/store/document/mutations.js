import { util } from './../../plugins/util.js';

import Vue from 'vue';
import { param } from 'jquery';

/**
 * thêm mới control ngoài table
 * @param {*} state
 * @param {*} params
 */
const addControl = (state, params) => {
    let id = params.id;
    let prop = params.props;
    let instance = params.instance;
    Vue.set(state.editor[instance].allControl, id, prop);
};

const addToListInputInDocument = (state, params) => {
    let name = params.name;
    let control = params.control;
    let instance = params.instance;
    // state.editor.allControl[id] = prop;
    Vue.set(state.submit[instance].listInputInDocument, name, control);
};

/**
 * thêm mới control ngoài table
 * @param {*} state
 * @param {*} params
 */
const addControlToTable = (state, params) => {
    let id = params.id;
    let prop = params.props;
    let tableId = params.tableId;
    let instance = params.instance;

    if (state.editor[instance].allControl[tableId]['listFields']) {
    } else {
        state.editor[instance].allControl[tableId]['listFields'] = {};
    }
    Vue.set(state.editor[instance].allControl[tableId]['listFields'], id, prop);
};
/**
 * kéo thả thay đổi vị trí control, cần sửa lại data nếu kéo vào table hoặc kéo từ table ra
 * @param {*} state
 * @param {*} params
 */
const moveControl = (state, params) => {
    let newTableId = params.newTableId;
    let controlId = params.controlId;
    let oldTableId = params.oldTableId;
    let instance = params.instance;
    let allControls = util.cloneDeep(state.editor[instance].allControl);
    if (oldTableId) {
        let controlProps = allControls[oldTableId]['listFields'][controlId];
        Vue.delete(
            state.editor[instance].allControl[oldTableId]['listFields'],
            controlId,
        );
        if (newTableId) {
            if (state.editor[instance].allControl[newTableId]['listFields']) {
            } else {
                state.editor[instance].allControl[newTableId]['listFields'] =
                    {};
            }
            Vue.set(
                state.editor[instance].allControl[newTableId]['listFields'],
                controlId,
                controlProps,
            );
        } else {
            Vue.set(state.editor[instance].allControl, controlId, controlProps);
        }
    } else {
        let controlProps = allControls[controlId];
        Vue.delete(state.editor[instance].allControl, controlId);

        if (newTableId) {
            if (state.editor[instance].allControl[newTableId]['listFields']) {
            } else {
                state.editor[instance].allControl[newTableId]['listFields'] =
                    {};
            }
            Vue.set(
                state.editor[instance].allControl[newTableId]['listFields'],
                controlId,
                controlProps,
            );
        }
    }
};
/**
 * Hàm set các thuộc tính của control được click trong editor(hiển thị bên side bar phải)
 * @param {*} state
 * @param {*} control
 */
const addCurrentControl = (state, control) => {
    let instance = control.instance;
    Vue.set(
        state.editor[instance].currentSelectedControl,
        'formulas',
        control.formulas,
    );
    Vue.set(state.editor[instance].currentSelectedControl, 'id', control.id);
    Vue.set(
        state.editor[instance].currentSelectedControl,
        'type',
        control.type,
    );

    let groups = { name: {}, display: {}, print: {} };
    if (
        control.properties != undefined &&
        typeof control.properties != 'undefined'
    ) {
        Object.filter = (obj, predicate) =>
            Object.keys(obj)
                .filter((key) => predicate(obj[key]))
                .reduce(
                    (res, key) =>
                        Object.assign(res, {
                            [key]: obj[key],
                        }),
                    {},
                );
        let propsTypeIsName = Object.filter(
            control.properties,
            (prop) => prop.groupType == 'name',
        );
        let propsTypeIsDisplay = Object.filter(
            control.properties,
            (prop) => prop.groupType == 'display',
        );
        let propsTypeIsPrint = Object.filter(
            control.properties,
            (prop) => prop.groupType == 'print',
        );
        let propsTypeIsTable = Object.filter(
            control.properties,
            (prop) => prop.groupType == 'table',
        );
        groups = {
            name: propsTypeIsName,
            display: propsTypeIsDisplay,
            print: propsTypeIsPrint,
            table: propsTypeIsTable,
        };
    }
    Vue.set(
        state.editor[instance].currentSelectedControl,
        'properties',
        groups,
    );
};
const updateCurrentControlProps = (state, params) => {
    let group = params.group;
    let prop = params.prop;
    let typeProp = params.typeProp;
    let value = params.value;
    let instance = params.instance;
    Vue.set(
        state.editor[instance].currentSelectedControl.properties[group][prop],
        typeProp,
        value,
    );
};
const updateCurrentControlFormulas = (state, params) => {
    let type = params.type;
    let typeProp = params.typeProp;
    let value = params.value;
    let instance = params.instance;
    Vue.set(
        state.editor[instance].currentSelectedControl.formulas[type],
        typeProp,
        value,
    );
};
const updateListRowGroup = (state, params) => {
    Vue.set(state.submit, 'rowGroup', params);
};
// hàm xóa control đang chọn ra khỏi store
const resetCurrentControl = (state, params) => {
    let currentSelectedControl = {
        // control đang được click bởi người dùng
        properties: {
            name: {},
            display: {},
            print: {},
            table: {},
        },
        formulas: {},
        type: '',
        id: '',
    };
    let instance = params.instance;
    Vue.set(
        state.editor[instance],
        'currentSelectedControl',
        currentSelectedControl,
    );
};
const updateProp = (state, params) => {
    let id = params.id;
    let name = params.name;
    let value = params.value;
    let tableId = params.tableId;
    let instance = params.instance;
    let type = params.type;
    let withoutCurrentControl = params.withoutCurrentControl;
    if (tableId != '0') {
        if (
            state.editor[instance].allControl[tableId]['listFields'][id][
                'properties'
            ][name]
        ) {
            if (
                name == 'name' &&
                state.editor[instance].currentSelectedControl['properties'][
                    'name'
                ].hasOwnProperty(name) &&
                !withoutCurrentControl
            ) {
                Vue.set(
                    state.editor[instance].currentSelectedControl['properties'][
                        'name'
                    ][name],
                    type,
                    value,
                );
            }
            Vue.set(
                state.editor[instance].allControl[tableId]['listFields'][id][
                    'properties'
                ][name],
                type,
                value,
            );
        } else if (
            state.editor[instance].allControl[tableId]['listFields'][id][
                'formulas'
            ][name]
        ) {
            Vue.set(
                state.editor[instance].allControl[tableId]['listFields'][id][
                    'formulas'
                ][name],
                type,
                value,
            );
        }
    } else {
        if (state.editor[instance].allControl[id]['properties'][name]) {
            if (name == 'name' && !withoutCurrentControl) {
                Vue.set(
                    state.editor[instance].currentSelectedControl['properties'][
                        'name'
                    ][name],
                    type,
                    value,
                );
            }
            Vue.set(
                state.editor[instance].allControl[id]['properties'][name],
                type,
                value,
            );
        } else if (state.editor[instance].allControl[id]['formulas'][name]) {
            Vue.set(
                state.editor[instance].allControl[id]['formulas'][name],
                type,
                value,
            );
        }
    }
};
const updateFormulasId = (state, params) => {
    let id = params.id;
    let name = params.name;
    let value = params.value;
    let instance = params.instance;
    let tableId = params.tableId;
    if (tableId != 0 && tableId != '0') {
        if (
            state.editor[instance].allControl[tableId]['listFields'][id][
                'formulas'
            ][name]
        ) {
            if (name == 'linkConfig' || name == 'groupDpm') {
                let linkInstance = params.linkInstance;
                let allConfig =
                    state.editor[instance].allControl[tableId]['listFields'][
                        id
                    ]['formulas'][name]['configData'];
                for (let index = 0; index < allConfig.length; index++) {
                    let config = allConfig[index];
                    if (
                        Number(config.formula.instance) == Number(linkInstance)
                    ) {
                        state.editor[instance].allControl[tableId][
                            'listFields'
                        ][id]['formulas'][name]['configData'][index]['formula'][
                            'id'
                        ] = value;
                        break;
                    }
                }
            } else {
                state.editor[instance].allControl[tableId]['listFields'][id][
                    'formulas'
                ][name]['formulasId'] = value;
            }
        }
    } else {
        if (state.editor[instance].allControl[id]['formulas'][name]) {
            if (name == 'linkConfig' || name == 'groupDpm') {
                let linkInstance = params.linkInstance;
                let allConfig =
                    state.editor[instance].allControl[id]['formulas'][name][
                        'configData'
                    ];
                for (let index = 0; index < allConfig.length; index++) {
                    let config = allConfig[index];
                    if (
                        Number(config.formula.instance) == Number(linkInstance)
                    ) {
                        state.editor[instance].allControl[id]['formulas'][name][
                            'configData'
                        ][index]['formula']['id'] = value;
                        break;
                    }
                }
            } else {
                state.editor[instance].allControl[id]['formulas'][name][
                    'formulasId'
                ] = value;
            }
        }
    }
};

/**
 * Hàm loại bỏ dữ liệu của các control đã bị xóa
 * @param {*} state
 * @param {*} params
 */
const minimizeControl = (state, params) => {
    let instance = params.instance;
    let allControl = util.cloneDeep(state.editor[instance].allControl);
    for (let i in allControl) {
        if (params.allId.indexOf(i) === -1) {
            updateAllControlDeleted(state, {
                id: i,
                dataControl: allControl[i],
                instance: instance,
            });
            for (let j in allControl[i]['listFields']) {
                if (params.allId.indexOf(j) === -1) {
                    updateAllControlDeleted(state, {
                        id: j,
                        dataControl: allControl[i]['listFields'][j],
                        instance: instance,
                        table: i,
                    });
                    delete allControl[i]['listFields'][j];
                }
            }
            delete allControl[i];
        }
        if (allControl[i] && allControl[i].type == 'table') {
            for (let childId in allControl[i]['listFields']) {
                if (params.allId.indexOf(childId) === -1) {
                    updateAllControlDeleted(state, {
                        id: childId,
                        dataControl: allControl[i]['listFields'][childId],
                        instance: instance,
                        table: i,
                    });
                    delete allControl[i]['listFields'][childId];
                }
            }
        }
    }
    Vue.set(state.editor[instance], 'allControl', allControl);
};

/**
 * Hàm lưu lại các control đã xóa trong editor print config, để phục vụ cho việc dùng lại
 * @param {*} state
 * @param {*} params
 */
const updateAllControlDeleted = (state, params) => {
    let id = params.id;
    let dataControl = util.cloneDeep(params.dataControl);
    dataControl.id = id;
    let instance = params.instance;
    let table = params.table;
    if (table) {
        dataControl.tableId = table;
        if (!state.editor[instance].allControlDeleted[table]) {
            let tableControl = util.cloneDeep(
                state.editor[instance].allControl[table],
            );
            tableControl['listFields'] = {};
            Vue.set(
                state.editor[instance].allControlDeleted,
                table,
                tableControl,
            );
        }
        Vue.set(
            state.editor[instance].allControlDeleted[table]['listFields'],
            id,
            dataControl,
        );
    } else {
        if (dataControl.hasOwnProperty('listFields')) {
            dataControl['listFields'] = {};
        }
        Vue.set(state.editor[instance].allControlDeleted, id, dataControl);
    }
};
/**
 * Hàm xóa các control được lưu vào biến các control xóa trong form print config
 * @param {*} state
 * @param {*} params
 */
const deleteControlInAllControlDeleted = (state, params) => {
    let id = params.id;
    let instance = params.instance;
    let table = params.table;
    if (table) {
        Vue.delete(
            state.editor[instance].allControlDeleted[table]['listFields'],
            id,
        );
        if (
            Object.keys(
                state.editor[instance].allControlDeleted[table]['listFields'],
            ).length == 0
        ) {
            Vue.delete(state.editor[instance].allControlDeleted, table);
        }
    } else {
        Vue.delete(state.editor[instance].allControlDeleted, id);
    }
};
/**
 * hàm thêm instance SQLLite vào store
 */

const addInstanceSubmitDB = (state, params) => {
    let instance = params.instance;
    let sqlLite = params.sqlLite;
    // state.editor.allControl[id] = prop;
    Vue.set(state.submit[instance].SQLLiteDB, instance, sqlLite);
};

/**
 * hàm thêm các giá trị cho listInputInDocument -- submit store
 */

const updateListInputInDocument = (state, params) => {
    let key = params.key;
    let controlName = params.controlName;
    let value = params.value;
    let instance = params.instance;
    if (
        state.submit[instance].listInputInDocument.hasOwnProperty(controlName)
    ) {
        Vue.set(
            state.submit[instance].listInputInDocument[controlName],
            key,
            value,
        );
    }
};

const addToDocumentSubmitStore = (state, params) => {
    let key = params.key;
    let value = params.value;
    let instance = params.instance;
    if (state.submit.hasOwnProperty(instance)) {
        Vue.set(state.submit[instance], key, value);
    }
};
const updateControlFormulaInfinity = (state, params) => {
    let key = params.key;
    let value = params.value;
    let instance = params.instance;
    if (state.submit.hasOwnProperty(instance)) {
        Vue.set(state.submit[instance].controlFormulaInfinity, key, value);
    }
};
const addToDocumentDetailStore = (state, params) => {
    let key = params.key;
    let value = params.value;
    let instance = params.instance;
    Vue.set(state.detail[instance], key, value);
};
/**
 * Hàm đặt  kiểu view (submit,detail,update)
 * @param {*} state
 * @param {*} params
 */
const changeViewType = (state, params) => {
    let key = params.key;
    let value = params.value;
    Vue.set(state.viewType, key, value);
};

/**
 * Cập nhật dữ liệu cho các state của document
 * @param {*} state
 * @param {*} params
 */
const updateDocumentState = (state, params) => {
    let instance = params.instance;
    let docState = params.state;
    let value = params.value;
    if (!state[docState][instance]) {
        Vue.set(state[docState], instance, {});
    }
    for (let key in value) {
        Vue.set(state[docState][instance], key, value[key]);
    }
};
const addToDocumentPropsEditor = (state, params) => {
    let key = params.key;
    let value = params.value;
    Vue.set(state.documentProps, key, value);
};
const addToDocumentEditorStore = (state, params) => {
    let key = params.key;
    let instance = params.instance;
    let value = params.value;
    Vue.set(state.editor[instance], key, value);
};
const setDefaultSubmitStore = (state, params) => {
    let value = {
        listInputInDocument: {},
        docStatus: 'init',
        SQLLiteDB: {},
        rootControl: {},
        impactedFieldsList: {},
        impactedFieldsListWhenStart: {},
        rootChangeFieldName: null,
        submitFormulas: null,
        listUser: null,
        localRelated: {},
        workflowVariable: {},
        currentControlEditByUser: null,
        autocompleteData: {
            // lưu lại các giá trị của autocomplete khi đã gõ
            controlName: {
                header: [],
                cacheData: {
                    letter: {
                        // giá trị nhập và dữ liệu tương ứng
                        data: [],
                    },
                },
            },
        },
        orgchartTableSqlName: {},
        readyLoaded: false,
        listControlMappingDatasets: {},
        controlFormulaInfinity: {},
        currentRowChangePivotMode: {
            tableName: '',
            key: '',
            data: {},
        },
        dataInputBeforeChange: {},
        mapValueToTextAutocompleteInput: {},
        tableInteractive: null,
        optionalDataBinding: {},
        documentInfo: null,
        readOnlyControls: {},
        dataInsertRow: {},
    };
    let instance = params.instance;
    Vue.set(state.submit, instance, value);
};
const setDefaultEditorStore = (state, params) => {
    let value = {
        allControl: {},
        currentSelectedControl: {
            // control đang được click bởi người dùng
            properties: {
                name: {},
                display: {},
                print: {},
            },
            formulas: {},
            type: '',
            id: '',
        },
        listControlTreeData: [],
        allControlForTableOption: [],
        listDataFlow: [],
        allControlTemplate: [],
        allControlDeleted: {},
    };
    let instance = params.instance;
    Vue.set(state.editor, instance, value);
};
const setDefaultDetailStore = (state, params) => {
    let value = {
        allData: {},
        trackChange: [],
    };
    let instance = params.instance;
    Vue.set(state.detail, instance, value);
};
/**
 * Hàm đẩy dữ liệu link cua control nếu có vào store sau khi chạy công thức link
 * @param {*} state
 * @param {*} params
 */
const updateDataForLinkControl = (state, params) => {
    let formulasType = params.formulasType;
    let link = params.link;
    let title = params.title;
    let source = params.source;
    let controlName = params.controlName;
    let instance = params.instance;
    if (!state.linkControl[instance]) {
        Vue.set(state.linkControl, instance, {});
    }
    let listLink = state.linkControl[instance];
    let fullLink =
        source == 'document'
            ? '/documents/objects/' + link
            : source + ':' + link;
    if (!listLink.hasOwnProperty(controlName)) {
        listLink[controlName] = {};
    }
    if (listLink[controlName].hasOwnProperty(formulasType)) {
        listLink[controlName][formulasType].value = link;
        listLink[controlName][formulasType].link = fullLink;
    } else {
        listLink[controlName][formulasType] = {
            title: title,
            value: link,
            source: source,
            link: fullLink,
        };
    }
    Vue.set(state.linkControl, instance, listLink);
};
const updateCurrentControlEditByUser = (state, params) => {
    let currentControl = params.currentControl;
    let instance = params.instance;
    Vue.set(state.submit[instance], 'currentControlEditByUser', currentControl);
};
const addToRelatedLocalFormulas = (state, params) => {
    let key = params.key;
    let instance = params.instance;
    let curListRelate = state.submit[instance].localRelated;

    let value = params.value;
    for (let index = 0; index < value.length; index++) {
        let element = value[index];
        element = element.trim();
        if (!curListRelate.hasOwnProperty(element)) {
            curListRelate[element] = [];
        }
        curListRelate[element].push(key);
    }

    Vue.set(state.submit[instance], 'localRelated', curListRelate);
};

/**
 * Khadm:
 * Set tất cả các document để cache lại
 */
const setAllDocuments = (state, docs) => {
    docs = docs.reduce((obj, el) => {
        obj[el.name] = el;
        el.allFields = null;
        return obj;
    }, {});
    state.listAllDocument = docs;
};
/**
 * Hàm lưu lại dữ liệu của autocomplete
 * @param {*} state
 * @param {*} params
 */
const cacheDataAutocomplete = (state, params) => {
    let controlName = params.controlName;
    let header = params.header;
    let cacheData = params.cacheData;
    let object = { header: header, cacheData: cacheData };
    let instance = params.instance;
    if (
        state.submit[instance]['autocompleteData'].hasOwnProperty(controlName)
    ) {
        Vue.set(
            state.submit[instance]['autocompleteData'][controlName][
                'cacheData'
            ],
            Object.keys(cacheData)[0],
            Object.values(cacheData)[0],
        );
        Vue.set(
            state.submit[instance]['autocompleteData'][controlName]['header'],
            Object.keys(header)[0],
            Object.values(header)[0],
        );
    } else {
        Vue.set(
            state.submit[instance]['autocompleteData'],
            controlName,
            object,
        );
    }
};

const addSqlLiteDb = (state, params) => {
    let instance = params.instance;
    let db = params.db;
    Vue.set(state['clientSqlLite'], instance, db);
};

const deleteControlTemplate = (state, params) => {
    let instance = params.instance;
    let index = params.index;
    let x = state.editor[instance].allControlTemplate;
    x.splice(index, 1);
    Vue.set(state.editor[instance], 'allControlTemplate', x);
};

const setDetailTrackChange = (state, params) => {
    Vue.set(state.detail[params.instance], 'trackChange', params.data);
};
const setCurrentTitle = (state, data) => {
    Vue.set(state, 'currentTitle', data);
};

/**
 *
 * Lưu các giá trị cho control autocomplete,
 * tại các control autocomplete được cấu hình hiển thị 1 kiểu, giá trị lưu 1 kiểu
 * @param {*} state
 * @param {*} params
 */

const setAutocompleteValueToText = (state, params) => {
    let key = params.key;
    let value = params.value;
    let controlName = params.controlName;
    let instance = params.instance;
    if (!state.submit[instance].mapValueToTextAutocompleteInput[controlName]) {
        Vue.set(
            state.submit[instance].mapValueToTextAutocompleteInput,
            controlName,
            {},
        );
    }
    Vue.set(
        state.submit[instance].mapValueToTextAutocompleteInput[controlName],
        key,
        value,
    );
};
const setFilterConfig=(state, report)=>{
    Vue.set(state, 'filterConfig', report)

}
export {
    setFilterConfig,
    addControl,
    moveControl,
    addCurrentControl,
    addControlToTable,
    updateProp,
    minimizeControl,
    addToListInputInDocument,
    addInstanceSubmitDB,
    updateListInputInDocument,
    updateFormulasId,
    addToDocumentSubmitStore,
    updateControlFormulaInfinity,
    addToDocumentDetailStore,
    changeViewType,
    addToDocumentPropsEditor,
    addToDocumentEditorStore,
    setAllDocuments,
    resetCurrentControl,
    updateListRowGroup,
    updateCurrentControlProps,
    updateCurrentControlFormulas,
    addToRelatedLocalFormulas,
    setDefaultSubmitStore,
    setDefaultEditorStore,
    setDefaultDetailStore,
    updateCurrentControlEditByUser,
    cacheDataAutocomplete,
    updateAllControlDeleted,
    deleteControlInAllControlDeleted,
    addSqlLiteDb,
    deleteControlTemplate,
    setDetailTrackChange,
    updateDataForLinkControl,
    updateDocumentState,
    setCurrentTitle,
    setAutocompleteValueToText,
};

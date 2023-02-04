import { workerStore } from '@/worker/document/submit/WorkerStateManagement';
import ClientSQLManager from '@/views/document/submit/clientSQLManager';
import Formulas from '@/views/document/submit/formulas';
import { cacheDataInput } from '@/components/document/dataControl';

onmessage = async function (event) {
    var workerDataReceive = event.data;
    let action = workerDataReceive.action;
    let dataOfAction = workerDataReceive.data;
    let keyInstance = dataOfAction.keyInstance;
    switch (action) {
        case 'runFormula':
            let controlName = dataOfAction.controlName;
            let formulaInstance = dataOfAction.formulaInstance;
            let formulaIns = new Formulas(
                formulaInstance.keyInstance,
                formulaInstance.formulas,
                formulaInstance.type,
            );
            let rowNodeId = dataOfAction.rowNodeId; // th trong table thì mỗi dòng có 1 id
            let columnName = dataOfAction.columnName;
            let runOnColumn = dataOfAction.runOnColumn;
            let dataInput = {};
            if (dataOfAction.dataInput) {
                dataInput = dataOfAction.dataInput;
            }
            let fromDebugger = false;
            if (dataOfAction.fromDebugger) {
                fromDebugger = dataOfAction.fromDebugger;
            }

            /**
             * Trương hợp chạy công thức cho cả cột trong table
             */
            if (runOnColumn) {
                let mapDataOptimize = dataInput['dataMapRowId'];
                let returnOriginData =
                    mapDataOptimize != undefined && mapDataOptimize != null
                        ? 1
                        : 0;
                let cacheRowDataOptimize = {};
                if (returnOriginData == 1) {
                    delete dataInput['dataMapRowId'];
                    let dataCacheOptimize = cacheDataInput(mapDataOptimize);
                    cacheRowDataOptimize = dataCacheOptimize['cacheRowData'];
                }
                let dataCache = cacheDataInput(dataInput);
                let dataPostForGetMultiple =
                    dataCache['dataPostForGetMultiple'];
                let cacheRowData = dataCache['cacheRowData'];
                formulaIns
                    .getDataMultiple(dataPostForGetMultiple, returnOriginData)
                    .then((res) => {
                        if (res && res['data']['data']) {
                            let data = res['data']['data'];
                            if (returnOriginData) {
                                data = data['rowin'];
                                let newData = {};
                                for (
                                    let index = 0;
                                    index < data.length;
                                    index++
                                ) {
                                    let rowData = data[index];
                                    for (let rowId in mapDataOptimize) {
                                        let isValid = true;
                                        for (let key in mapDataOptimize[
                                            rowId
                                        ]) {
                                            if (
                                                rowData[key] !=
                                                mapDataOptimize[rowId][key]
                                            ) {
                                                isValid = false;
                                                break;
                                            } else {
                                                isValid = true;
                                            }
                                        }
                                        if (isValid) {
                                            for (let key in mapDataOptimize[
                                                rowId
                                            ]) {
                                                delete rowData[key];
                                            }
                                            newData[rowId] =
                                                Object.values(rowData)[0];
                                            delete mapDataOptimize[rowId];
                                            break;
                                        }
                                    }
                                }
                                if (
                                    Object.keys(cacheRowDataOptimize).length > 0
                                ) {
                                    for (let rowId in newData) {
                                        for (let key in cacheRowDataOptimize) {
                                            let rowIdCache =
                                                cacheRowDataOptimize[key];
                                            if (rowIdCache.includes(rowId)) {
                                                for (
                                                    let index = 0;
                                                    index < rowIdCache.length;
                                                    index++
                                                ) {
                                                    newData[rowIdCache[index]] =
                                                        newData[rowId];
                                                }
                                            }
                                        }
                                    }
                                }
                                res['data']['data'] = newData;
                            } else {
                                if (Object.keys(cacheRowData).length > 0) {
                                    for (let rowId in data) {
                                        for (let key in cacheRowData) {
                                            let rowIdCache = cacheRowData[key];
                                            if (rowIdCache.includes(rowId)) {
                                                for (
                                                    let index = 0;
                                                    index < rowIdCache.length;
                                                    index++
                                                ) {
                                                    res['data']['data'][
                                                        rowIdCache[index]
                                                    ] = data[rowId];
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            postMessage({
                                action: 'afterRunFormulasSuccess',
                                dataAfter: {
                                    controlName: controlName,
                                    res: res,
                                    formulaType: formulaInstance.type,
                                    rowNodeId: rowNodeId,
                                    isMultiple: true,
                                },
                            });
                        }
                    });
            } else {
                /**
                 * Trường hợp chạy công thức cho các công thưc dạng list như autocomplete hay list
                 */
                if (['autocomplete', 'list'].includes(formulaInstance.type)) {
                    formulaIns
                        .handleRunAutoCompleteFormulas(dataInput)
                        .then((res) => {
                            if (res && res['data']) {
                                postMessage({
                                    action: 'afterRunFormulasSuccess',
                                    dataAfter: {
                                        controlName: controlName,
                                        res: res,
                                        formulaType: formulaInstance.type,
                                    },
                                });
                            }
                        });
                } else {
                    /**
                     * trường hợp chạy công thức cho các trường hợp còn lại
                     */
                    formulaIns
                        .handleBeforeRunFormulas(dataInput, '', fromDebugger)
                        .then((res) => {
                            if (res && res['data']) {
                                postMessage({
                                    action: 'afterRunFormulasSuccess',
                                    dataAfter: {
                                        controlName: controlName,
                                        res: res,
                                        formulaType: formulaInstance.type,
                                        rowNodeId: rowNodeId,
                                        columnName: columnName,
                                    },
                                });
                            }
                        })
                        .catch((e) => {
                            postMessage({
                                action: 'afterRunFormulasFail',
                                dataAfter: { res: e.message },
                            });
                        });
                }
            }
            break;
        /**
         * Có cập nhật input trên main thì worker cũng phải lưu lại giá trị
         */
        case 'updateWorkerStore':
            let type = dataOfAction.type;
            if (!workerStore[type][keyInstance]) {
                workerStore[type][keyInstance] = {};
            }
            if (!workerStore[type][keyInstance]['inputData']) {
                workerStore[type][keyInstance]['inputData'] = {};
            }
            let controlIns = dataOfAction.controlIns;
            workerStore[type][keyInstance]['inputData'][controlIns.name] =
                controlIns;
            break;
        case 'addWorkflowVariable':
            if (!workerStore['submit'][keyInstance]) {
                workerStore['submit'][keyInstance] = {};
            }
            if (!workerStore['submit'][keyInstance]['inputData']) {
                workerStore['submit'][keyInstance]['inputData'] = {};
            }
            let workflowVariable = dataOfAction.workflowVariable;
            for (let inputBinding in workflowVariable) {
                workerStore['submit'][keyInstance]['inputData'][inputBinding] =
                    {
                        name: inputBinding,
                        type: 'textInput',
                        value: workflowVariable[inputBinding],
                    };
            }
            break;
        case 'updateDocumentObjectId':
            workerStore['submit'][keyInstance]['document_object_id'] =
                dataOfAction.documentObjectId;
            break;
        case 'createSQLiteDB':
            ClientSQLManager.createDB(keyInstance).then((res) => {
                postMessage({ action: 'afterCreateSQLiteDB' });
            });
            break;
        case 'closeDB':
            ClientSQLManager.closeDB(keyInstance);
            break;
        /**
         * Các hàm thực thi với sqlite
         */
        case 'executeSQliteDB':
            let func = dataOfAction['func'];
            if (func == 'delete') {
                ClientSQLManager.delete(
                    keyInstance,
                    dataOfAction.tableName,
                    false,
                );
            } else if (func == 'deleteRow') {
                ClientSQLManager.deleteRow(
                    keyInstance,
                    dataOfAction.tableName,
                    dataOfAction.condition,
                );
            } else if (func == 'insertRow') {
                ClientSQLManager.insertRow(
                    keyInstance,
                    dataOfAction.tableName,
                    dataOfAction.columns,
                    dataOfAction.rowData,
                    dataOfAction.isPromise,
                );
            } else if (func == 'editRow') {
                ClientSQLManager.editRow(
                    keyInstance,
                    dataOfAction.tableName,
                    dataOfAction.columns,
                    dataOfAction.value,
                    dataOfAction.condition,
                    true,
                );
            } else if (func == 'insertAll') {
                ClientSQLManager.insertDataToTable(
                    keyInstance,
                    dataOfAction.tableName,
                    dataOfAction.columns,
                    dataOfAction.allData,
                );
            } else if (func == 'createTable') {
                ClientSQLManager.createTable(
                    keyInstance,
                    dataOfAction.tableName,
                    dataOfAction.columns,
                    '',
                    '',
                );
            } else if (func == 'updateMultiRow') {
                let allData = dataOfAction.allData;
                let caseWhen = '';
                for (let key in allData) {
                    caseWhen += ` WHEN ${key} THEN "${allData[key]}" `;
                }
                if (caseWhen) {
                    caseWhen +=
                        ' ELSE ' +
                        dataOfAction.columnName +
                        ' END WHERE s_table_id_sql_lite IN (' +
                        Object.keys(allData).join(',') +
                        ' )';
                    let sql =
                        'UPDATE ' +
                        dataOfAction.tableName +
                        ' SET ' +
                        dataOfAction.columnName +
                        ' = CASE s_table_id_sql_lite ' +
                        caseWhen;
                    await ClientSQLManager.exeBySql(keyInstance, sql, true);
                }
            }
            break;
        default:
            break;
    }
};

import { workerStore } from '@/worker/document/submit/WorkerStateManagement';

import ClientSQLManager from './clientSQLManager.js';
import { formulasApi } from '@/api/Formulas';
import { orgchartApi } from '@/api/orgchart';
import Util from './util';
import FormulasEvent from './formulasEvent.js';
import { str } from '@/plugins/utilModules/str.js';
import { util } from '@/plugins/util.js';
export const BUILD_IN_FUNCTION = [
    'TODAY',
    'BEGIN_WEEK',
    'END_WEEK',
    'BEGIN_MONTH',
    'END_MONTH',
    'BEGIN_YEAR',
    'END_YEAR',
    'TIMESTAMP',
    'PARENT_WORKFLOW',
    'CURRENT_WORKFLOW',
    'CURRENT_ROLE',
    'CURRENT_ROLE_ID',
    'CURRENT_USER_ID',
    'CURRENT_USER',
    'CURRENT_USER_FULLNAME',
    'CURRENT_USER_EMAIL',
    'CURRENT_USER_PHONE',
    'CURRENT_USER_PHONE_NUMBER'
];
export default class Formulas extends FormulasEvent {
    constructor(keyInstance, formulas, type) {
        super(keyInstance, formulas, type);
        /**
         * chỉ ra đang ở instance của view submit nào, (trường hợp có sub form thì có 2 key)
         */

        this.inputControl = this.setInputControl();
        this.operatorBefore = this.setOperatorBeforeInput();
        this.inputFromDatasets = this.getDatasetEffectedFormula();
        this.refFormulas = this.getReferenceFormulas();
        this.orgChartFormulas = this.getOrgChartFormulas();
        this.localFormulas = this.getLocalFormulas();
        this.inputForLocalFormulas = this.setInputLocal();
    }
    /**
     * Hàm xử lí thay các giá trị của input đầu vào để thực hiện truy vấn
     * @param {} dataInput
     */
    checkExistFormulas() {
        if (
            this.formulas == '' ||
            this.formulas == false ||
            this.formulas == undefined
        ) {
            return false;
        } else return true;
    }
    /**
     * Hàm xử lí việc thay các giá trị vào {control} và tách công thức server để chạy trước nếu có
     * @param {Object} dataInput
     */
    handleBeforeRunFormulas(dataInput, inject = '', fromDebugger = false) {
        // debugger
        return new Promise(async (resolve, reject) => {
            try {
                if (Object.keys(dataInput).length == 0) {
                    dataInput = false;
                }
                var formulas = this.formulas;
                if (!this.checkExistFormulas()) {
                    resolve('formula not found');
                }
                formulas = await this.handleRunLocalFormulas(
                    formulas,
                    dataInput
                );
                formulas = await this.handleRunOrgChartFormulas(
                    formulas,
                    dataInput
                );
                if (typeof formulas == 'object' && formulas.isStop) {
                    let data = {
                        server: true,
                        data: { data: formulas.data },
                        formulas: this.formulas
                    };
                    resolve(data);
                }
                let listSyql = this.getReferenceFormulas(formulas);
                if (listSyql != null && listSyql.length > 0) {
                    for (let i = 0; i < listSyql.length; i++) {
                        let syql = listSyql[i].trim();
                        syql = syql.replace(
                            /(REF|ref|dataflow_result)\s*\(/g,
                            ''
                        );
                        syql = syql.substring(0, syql.length - 1);
                        if (syql.split(')').length != syql.split('(').length) {
                            syql = syql.substring(0, syql.length - 1);
                        }
                        let res = await this.runSyql(syql, dataInput);
                        let beforeStr = this.checkBeforeReferenceFormulas(
                            formulas,
                            listSyql[i].trim()
                        );
                        if (!beforeStr) {
                            let data = {
                                server: true,
                                data: res.data,
                                formulas: this.formulas
                            };
                            resolve(data);
                        } else {
                            let reverseData = await this.reverseDataToFormulas(
                                res.data,
                                beforeStr.trim().toLowerCase()
                            );
                            formulas = formulas.replace(
                                listSyql[i],
                                reverseData
                            );
                        }
                        if (i == listSyql.length - 1) {
                            formulas = await this.replaceParamsToData(
                                dataInput,
                                formulas
                            );
                            let data = {
                                server: false,
                                data: this.runSQLLiteFormulas(formulas),
                                formulas: this.formulas
                            };

                            resolve(data);
                        }
                    }
                } else {
                    let sql = this.replaceParamsToData(
                        dataInput,
                        formulas,
                        fromDebugger
                    );
                    let data = {
                        server: false,
                        data: this.runSQLLiteFormulas(sql, false, inject),
                        formulas: this.formulas
                    };
                    resolve(data);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async handleRunLocalFormulas(formulas, dataInput) {
        let listLocal = this.localFormulas;
        if (listLocal != null && listLocal.length > 0) {
            for (let index = 0; index < listLocal.length; index++) {
                let sql = listLocal[index];
                syql = syql.replace(/(local|LOCAL)\s*\(/g, '');
                sql = sql.substring(0, sql.length - 1);
                sql = sql.replace(/\r?\n|\r/g, ' ');
                if (Object.keys(dataInput).length == 0) {
                    dataInput = false;
                }
                sql = this.replaceParamsToData(dataInput, sql);
                let res = await this.runSQLLiteFormulas(sql, true);
                let strBeforeSql = this.checkBeforeReferenceFormulas(
                    formulas,
                    listLocal[index].trim()
                );
                let reverse = this.reverseSqliteDataToFormulas(
                    res[0],
                    strBeforeSql.trim().toLowerCase()
                );
                formulas = formulas.replace(listLocal[index], reverse);
            }
        }
        return formulas;
    }
    async handleRunOrgChartFormulas(formulas, dataInput) {
        let listOrgChartFormulas = this.orgChartFormulas;
        if (listOrgChartFormulas != null && listOrgChartFormulas.length > 0) {
            for (let i = 0; i < listOrgChartFormulas.length; i++) {
                let reverseData = undefined;
                let orgChartFormulas = listOrgChartFormulas[i].trim();
                orgChartFormulas = orgChartFormulas.replace(
                    /(role|ROLE)\s*\(/g,
                    ''
                );
                orgChartFormulas = orgChartFormulas.substring(
                    0,
                    orgChartFormulas.length - 1
                );
                if (Object.keys(dataInput).length == 0) {
                    dataInput = false;
                }
                orgChartFormulas = this.replaceParamsToData(
                    dataInput,
                    orgChartFormulas
                );
                let res = await this.queryOrgchart(orgChartFormulas);
                let beforeStr = this.checkBeforeReferenceFormulas(
                    formulas,
                    listOrgChartFormulas[i].trim()
                );
                if (!beforeStr) {
                    return { isStop: true, data: res.data.fullInfo };
                } else {
                    if (res.status == 200) {
                        reverseData = await this.reverseDataToFormulas(
                            res.data.fullInfo,
                            beforeStr.trim().toLowerCase()
                        );
                    } else {
                        reverseData = await this.reverseDataToFormulas(
                            [{ data: '' }],
                            beforeStr.trim().toLowerCase()
                        );
                    }
                }
                if (reverseData) {
                    formulas = formulas.replace(
                        listOrgChartFormulas[i].trim(),
                        reverseData
                    );
                }
            }
        }
        return formulas;
    }
    /**
     * Hàm xử lí chạy formulas cho các cột trong table
     * 1. chạy các công thức local() nếu có và thực hiện tạo ra 1 params mới thay thế cho công thức cùng data input của nó
     *
     * @param {*} dataInput
     */
    async getDataMultiple(dataInput, isReturnAllData = false) {
        let formulas = this.formulas;
        if (!this.checkExistFormulas()) {
            return {
                server: false,
                data: false
            };
        }
        let listLocal = this.localFormulas;
        if (listLocal != null && listLocal.length > 0) {
            for (let index = 0; index < listLocal.length; index++) {
                let sql = listLocal[index];
                syql = syql.replace(/(local|LOCAL)\s*\(/g, '');
                sql = sql.substring(0, sql.length - 1);
                sql = sql.replace(/\r?\n|\r/g, ' ');
                let res = await this.runSQLLiteFormulas(sql, true);
                let strBeforeSql = this.checkBeforeReferenceFormulas(
                    formulas,
                    listLocal[index].trim()
                );
                let reverse = this.reverseSqliteDataToFormulas(
                    res[0],
                    strBeforeSql.trim().toLowerCase()
                );
                formulas = formulas.replace(listLocal[index], reverse);
            }
        }
        let listSyql = this.getReferenceFormulas(formulas);

        if (listSyql != null && listSyql.length > 0) {
            let syql = listSyql[0];
            syql = syql.replace(/(REF|ref)\s*\(/g, '');
            syql = syql.substring(0, syql.length - 1);
            syql = syql.replace(/\r?\n|\r/g, ' ');
            if (Object.keys(dataInput).length == 0) {
                dataInput = { 0: {} };
            }
            let dataPost = {
                formula: syql,
                originData: isReturnAllData,
                dataInput: JSON.stringify(dataInput)
            };
            return {
                server: true,
                data: await formulasApi.getMultiData(dataPost)
            };
        } else {
            let dataRes = {};
            if (Object.keys(dataInput).length > 0) {
                for (let rowId in dataInput) {
                    let formula = this.replaceParamsToData(
                        dataInput[rowId],
                        formulas
                    );
                    let res = await this.runSQLLiteFormulas(formula, true);
                    dataRes[rowId] = res[0].values[0][0];
                }
            } else {
                let formula = this.replaceParamsToData(false, formulas);
                let res = await this.runSQLLiteFormulas(formula, true);
                dataRes[0] = res[0].values[0][0];
            }
            return {
                server: false,
                data: { data: dataRes }
            };
        }
    }

    // hàm xử lí chạy các công thức có khóa local trong script sau khi chạy xong thay thế lại giá tri cho script

    async runLocalFormulas(script, listLocal, dataInput) {
        if (listLocal != null && listLocal.length > 0) {
            for (let i = 0; i < listLocal.length; i++) {
                let sql = listLocal[i].trim();
                syql = syql.replace(/(local|LOCAL)\s*\(/g, '');
                sql = sql.substring(0, sql.length - 1);
                if (Object.keys(dataInput).length == 0) {
                    dataInput = false;
                }
                let formulas = this.replaceParamsToData(dataInput, sql);
                let res = await this.runSQLLiteFormulas(formulas, true);
                let strBeforeSql = this.checkBeforeReferenceFormulas(
                    script,
                    listLocal[i].trim()
                );
                let reverse = this.reverseSqliteDataToFormulas(
                    res[0],
                    strBeforeSql.trim().toLowerCase()
                );
                script = script.replace(listLocal[i], reverse);
            }
            return script;
        }
    }

    // Hàm xử lí kiểm tra các từ khóa sql trước công thức local() để thay thế lại giá trị tương ứng sau khi chạy công lức local trong script
    // nếu là IN -> return (1,1,2,3);
    // Nếu là union || union all -> return table sqlite
    // nếu là giá trị bình thường thì trả về chuỗi tương ứng
    reverseSqliteDataToFormulas(data, beforeStr) {
        if (data == undefined) {
            return '';
        }
        let strReplace = '';
        if (
            beforeStr == 'from' ||
            beforeStr == 'union' ||
            beforeStr == 'all' ||
            beforeStr == 'join'
        ) {
            if (data.columns.length > 0) {
                let columns = {};
                let columnsInsert = '';
                let dataInsert = '';
                for (let index = 0; index < data.columns.length; index++) {
                    const element = data.columns[index];
                    columnsInsert += element + ',';
                    columns[element] = 'TEXT';
                }
                dataInsert = '';
                for (let index = 0; index < data.values.length; index++) {
                    const row = data.values[index];
                    let dataRow = row.join();
                    dataInsert += "('" + dataRow + "'),";
                }
                dataInsert = dataInsert.substring(0, dataInsert.length - 1);
                columnsInsert = columnsInsert.substring(
                    0,
                    columnsInsert.length - 1
                );
                let tableName = Util.generateString(10);
                strReplace = tableName;
                ClientSQLManager.createTable(
                    this.keyInstance,
                    Util.generateString(10),
                    columns,
                    'TEMPORARY',
                    columnsInsert,
                    dataInsert
                );
            }
        } else if (beforeStr === 'in') {
            if (data.values.length > 0) {
                strReplace = '(';
                let curData = data.values.filter((data) => {
                    return data[0] !== '' && data[0] !== null;
                });
                if (curData.length == 0) {
                    strReplace = "('')";
                } else {
                    for (let i = 0; i < curData.length; i++) {
                        let row = curData[i];
                        if (i == curData.length - 1) {
                            strReplace += "'" + row + "')";
                        } else {
                            strReplace += "'" + row + "',";
                        }
                    }
                }
            }
        } else {
            strReplace = data.values[0][0];
        }
        return strReplace;
    }

    /**
     * Hàm thưc hiện thay thế lại giá trị ở cong thức reference
     * nếu trả về mảng 1 giá trị thì thay thế = giá trị đó
     * nếu 1 mảng giá trị thì thay thế về dạng ( 1, 'abc', 2, 'aa')
     * @param {Array} data
     * @param {String} refSyql
     */
    async reverseDataToFormulas(data, beforeStr) {
        let strReplace = '';
        if (
            beforeStr == 'from' ||
            beforeStr == 'union' ||
            beforeStr == 'all' ||
            beforeStr == 'join'
        ) {
            if (data.length > 0) {
                let columns = {};
                let columnsTable = [];
                for (let i in data[0]) {
                    if (
                        [
                            'style',
                            'departmentVizId',
                            'listForeignKey',
                            'nodeIdentify',
                            'vizParentId',
                            'vizId'
                        ].includes(i)
                    ) {
                        continue;
                    }
                    columns[i] = 'TEXT';
                    columnsTable.push(i + ' TEXT');
                }
                let dataTable = [];
                for (let index = 0; index < data.length; index++) {
                    let rowData = [];
                    let row = data[index];
                    for (let columnName in columns) {
                        // let columnData = row[columnName.replace()
                        rowData.push("'" + row[columnName] + "'");
                    }
                    rowData = '(' + rowData.join(',') + ')';
                    dataTable.push(rowData);
                }
                let tableName = Util.generateString(10);
                strReplace = tableName;
                await ClientSQLManager.createTable(
                    this.keyInstance,
                    tableName,
                    columnsTable.join(','),
                    'TEMPORARY',
                    Object.keys(columns).join(','),
                    dataTable.join(','),
                    true
                );
            }
        } else if (beforeStr == 'in') {
            strReplace = '(';
            if (data.hasOwnProperty('lastErrorMessage')) {
                data = data.data;
            }
            for (let i = 0; i < data.length; i++) {
                let row = data[i];
                if (i == data.length - 1) {
                    strReplace += "'" + row[Object.keys(row)[0]] + "'" + ')';
                } else {
                    strReplace += "'" + row[Object.keys(row)[0]] + "'" + ',';
                }
            }
        } else {
            strReplace = data[0][Object.keys(data[0])[0]];
        }
        return strReplace;
    }
    /**
     * Hàm kiểm tra xem trước từ khóa ref() có các kiểu sql nào để reverse lại giá trị tương ứng (from, union, in, join ,...)
     * from, union,  join => table
     * in => (val,val,val)
     * else => value
     */
    checkBeforeReferenceFormulas(script, refScript) {
        let s = refScript.replace(/\(/g, '\\(');
        s = s.replace(/\)/g, '\\)');
        s = s.replace(/\|/g, '\\|');
        let reg = new RegExp('([a-zA-Z_0-9]+)\\s+(?=' + s + ')', 'gm');
        let textBefore = script.match(reg);
        if (textBefore != null && textBefore.length > 0) {
            textBefore = textBefore[0].trim();
            return textBefore;
        } else {
            return false;
        }
    }
    /**
     * Hàm lấy ra từ đứng trước 1 key word nào đó
     * @param {*} formula
     * @param {*} word
     * @returns
     */
    getWordBefore(formula, word) {
        let pattern = '([a-zA-Z_0-9]+)([\\s]+)(?=' + word + ')';
        let reg = new RegExp(pattern, 'gmi');
        let textBefore = formula.match(reg);
        if (textBefore != null && textBefore.length > 0) {
            textBefore = textBefore[0].trim();
            return textBefore;
        } else {
            return false;
        }
    }

    /**
     * Hàm kiểm tra data input là dạng mảng hay string khi call api getdata (hiện tại phục vụ cho input filter)
     */
    checkDataInputIsArray(word) {
        let strBefore = this.getWordBefore(this.formulas, word);
        if (strBefore == false) {
            return false;
        } else if (['in', 'join', 'union', 'from', 'all'].includes(strBefore)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Hàm thay thế các giá trị input đầu vào trong công thức (thay thế vào chuỗi {controlName})
     * @param {Object} dataInput
     * @param {String} formulas
     */
    replaceParamsToData(dataInput, formulas, fromDebugger = false) {
        // thay thế các tham số của workflow
        if (this.detectWorkflowParams(formulas)) {
            formulas = this.replaceWorkflowParams(formulas);
        }
        if (dataInput == false || Object.keys(dataInput).length == 0) {
            return formulas;
        }
        let listControlInDoc = this.getListControl();
        for (let controlName in dataInput) {
            if (
                !listControlInDoc[controlName] &&
                !fromDebugger &&
                ![
                    'action',
                    'context',
                    'document_object_id',
                    'self_value'
                ].includes(controlName)
            ) {
                if (controlName != 'search_value') {
                    continue;
                }
            }
            let regex = new RegExp('{' + controlName + '}', 'g');
            let value = dataInput[controlName];
            if (Array.isArray(value)) {
                // các trường hợp query điều kiện là in thì cần đưa datainput về dạng sql hiểu được
                let valueForArray = '';
                for (let index = 0; index < value.length; index++) {
                    let v = value[index];
                    valueForArray += "'" + v + "',";
                }
                valueForArray = valueForArray.trim();
                valueForArray = valueForArray.substring(
                    0,
                    valueForArray.length - 1
                );
                value = valueForArray;
            }
            if (!value) {
                value = '';
                if (
                    listControlInDoc[controlName] &&
                    ['number', 'percent'].includes(
                        listControlInDoc[controlName].type
                    )
                ) {
                    value = 0;
                }
            }
            if (!BUILD_IN_FUNCTION.includes(controlName)) {
                formulas = formulas.replace(regex, value);
            }
        }
        return formulas;
    }

    // Hàm kiểm tra các tham số của workflow và thay thế lại giá trị tương ứng
    // hàm này thực hiện khi chạy quy trình
    replaceWorkflowParams(formulas) {
        if (!workerStore['submit'][this.keyInstance]) {
            return formulas;
        }
        let workflowVariable =
            workerStore['submit'][this.keyInstance].inputData;
        if (workflowVariable) {
            for (let param in workflowVariable) {
                let regex = new RegExp('{' + param + '}', 'g');
                let value = workflowVariable[param].value;
                if (!BUILD_IN_FUNCTION.includes(param)) {
                    formulas = formulas.replace(regex, value);
                }
            }
            let regex = new RegExp('{workflow_.*}', 'gm');
            formulas = formulas.replace(regex, '');
        }

        return formulas;
    }

    // Hàm chạy công thức cho autocomplete
    async handleRunAutoCompleteFormulas(dataInput = false) {
        let res = await this.handleBeforeRunFormulas(dataInput);
        res.data.dataInput = dataInput;
        return res;
    }
    /**
     * Hàm chỉ ra control nào được alias để binding vào giá trị control sau khi chọn từ autocomplete
     * @param {*} alias
     */
    autocompleteDetectAliasControl(alias = true) {
        let formulas = this.getFormulas();
        formulas = formulas.replace(/\r?\n|\r/g, ' ');
        let selectColumn = formulas.match(
            /(?<=select|SELECT).*(?=from|FROM)/gi
        );
        if (selectColumn == null) {
            return 'column1';
        }
        let control = selectColumn[0].match(
            /([a-zA-Z0-9_]+)\s+(as|AS)\s+(([a-zA-Z0-9_]+))/gi
        );
        if (control == null) {
            return 'column1';
        }
        let controlAlias = control[0].split(/\s(as|AS)\s/i);
        if (alias && controlAlias.length > 1) {
            return controlAlias[2].trim();
        } else {
            return controlAlias[0].trim();
        }
    }
    /**
     * Hàm chỉ ra table trong công thức
     */
    detectTableQuery() {
        let table = this.formulas.match(
            /(from|FROM)\s+(\w+\.)?(\w+)(?=\s+as)?(\s+\w+\n+)?/gim
        );
        if (table == null) {
            return false;
        }
        let listTable = [];
        for (let index = 0; index < table.length; index++) {
            let fromTable = table[index];
            let tableItem = fromTable.trim().replace(/(from |FROM )/i, '');
            listTable.push(tableItem);
        }
        return listTable;
    }

    /**
     * Hàm chỉ ra các table gây ảnh hưởng đến các công thức khi có lời gọi hàm local trong reference
     */
    detectTableRelateLocalFormulas() {
        let listTable = [];
        let listLocal = this.localFormulas;
        if (listLocal != null && listLocal.length > 0) {
            for (let i = 0; i < listLocal.length; i++) {
                let sql = listLocal[i];
                listTable = sql.match(/(?<=from)(.[a-zA-Z0-9_]*)/gm);
            }
        }
        return listTable;
    }
    /**
     * Hàm check các field của control select
     */
    detectFieldSelect() {
        let listField = this.formulas.match(
            /(?<=select|SELECT ).*(?= from|FROM)/gi
        );
        let fields = [];
        if (listField != null && listField.length > 0) {
            fields = listField[0];
            fields = fields.trim();
            fields = fields.split(',');
        }
        return fields;
    }
    /**
     * Hàm tách các công thức reference (công thức chạy trên server)
     */
    getReferenceFormulas(formulas = false) {
        if (formulas == false) {
            formulas = util.cloneDeep(this.formulas);
        }
        let newFormulas = formulas.replace(/\/\*.*\*\/|\/\/.*/g, '');
        let listSyql = str.getBoundedSubstr(newFormulas, 'ref', '(', ')', true);
        return listSyql;
    }

    /**
     * Hàm tách các công thức local (công thức chạy owr client)
     */
    getLocalFormulas() {
        let formulas = util.cloneDeep(this.formulas);
        let newFormulas = formulas.replace(/\/\*.*\*\/|\/\/.*/g, '');
        let listSqlite = str.getBoundedSubstr(
            newFormulas,
            'local',
            '(',
            ')',
            true
        );
        return listSqlite;
    }
    /**
     * Hàm tách các công thức local (công thức chạy owr client)
     */
    getOrgChartFormulas() {
        let formulas = util.cloneDeep(this.formulas);
        let newFormulas = formulas.replace(/\/\*.*\*\/|\/\/.*/g, '');
        let listOrgchart = str.getBoundedSubstr(
            newFormulas,
            'role',
            '(',
            ')',
            true
        );
        return listOrgchart;
    }
    /**
     * Ham call api chạy công thức trên server
     * @param String formulas
     * @param {key:value} dataInput
     */
    runSyql(formulas, dataInput = false) {
        let syql = formulas;
        syql = syql.replace(/\r?\n|\r/g, ' ');
        let dataPost = {
            formula: syql
        };
        if (dataInput != false) {
            dataPost['data_input'] = JSON.stringify(dataInput);
        }
        dataPost['distinct'] = false;
        return formulasApi.execute(dataPost);
    }
    queryOrgchart(formulas) {
        let syql = formulas;
        syql = syql.replace(/\r?\n|\r/g, ' ');
        let dataPost = {
            query: syql
        };
        return orgchartApi.queryOrgchart(dataPost);
    }
    /**
     * Hàm chạy công thức
     */
    runSQLLiteFormulas(sql, returnPromise = false, inject = false) {
        if (inject != false) {
            sql = sql.replace('SELECT ', 'SELECT ' + inject + ',');
            sql = sql.replace('select ', 'select ' + inject + ',');
        }
        if (returnPromise) {
            return new Promise((resolve, reject) => {
                try {
                    let data = ClientSQLManager.run(
                        this.keyInstance,
                        sql,
                        false
                    );
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            });
        } else {
            return ClientSQLManager.run(this.keyInstance, sql, false);
        }
    }

    getListControl() {
        if (workerStore['submit'].hasOwnProperty(this.keyInstance)) {
            return workerStore['submit'][this.keyInstance]['inputData'];
        } else {
            return false;
        }
    }

    /**
     * Lấy tên các control mà công thức này cần lấy giá trị để thực thi
     * Đồng thời đẩy vào thông tin về việc control nào thay đổi dẫn đến các control khác thay đổi theo
     */
    setInputControl() {
        let allInput = {};
        if (this.checkExistFormulas()) {
            let allRelateName = this.formulas.match(/{[A-Za-z0-9_]+}/gi);
            let colSelect = this.getColumnsSelect(this.formulas);
            let listInput = this.getListControl();
            if (colSelect && colSelect.length > 0 && !/\*/.test(colSelect[0])) {
                let colFromOtherTable = colSelect[0];
                colFromOtherTable = colFromOtherTable.replace(
                    /distinct|DISTINCT/,
                    ''
                );
                colFromOtherTable =
                    colFromOtherTable.match(/\([a-zA-Z0-9_]*\)/gm);
                if (colFromOtherTable) {
                    for (
                        let index = 0;
                        index < colFromOtherTable.length;
                        index++
                    ) {
                        let col = colFromOtherTable[index];
                        col = col.replace(/\)/g, '');
                        col = col.replace(/\(/g, '');
                        col = col.trim();
                        if (listInput) {
                            if (Object.keys(listInput).includes(col)) {
                                allInput[col] = true;
                            }
                        } else {
                            allInput[col] = true;
                        }
                    }
                }
            }
            if (!allRelateName) {
                return {};
            }
            let names = allRelateName.reduce((obj, name) => {
                let controlName = name.match(/\w+/g);
                if (
                    !BUILD_IN_FUNCTION.includes(controlName[0]) &&
                    controlName[0] != 'search_value'
                ) {
                    obj[controlName] = true;
                }
                return obj;
            }, {});

            Object.assign(allInput, names);
            return allInput;
        }
        return {};
    }
    /**
     * Hàm lấy các cột được select trong công thức local
     * mục đích để đưa vào biến effeted của control đó (cột trong table)
     * lúc nào có sự thay đổi của cột đó thì chạy lại công thức chứa local này
     */
    setInputLocal() {
        let listLocalFormulas = this.localFormulas;
        let listInputLocal = {};
        if (listLocalFormulas != null && listLocalFormulas.length > 0) {
            for (let index = 0; index < listLocalFormulas.length; index++) {
                let localFormulas = listLocalFormulas[index];
                let columns = this.getColumnsQuery(localFormulas);

                columns = columns.reduce((obj, name) => {
                    obj[name] = true;
                    return obj;
                }, {});
                Object.assign(listInputLocal, columns);
            }
        }
        return listInputLocal;
    }
    // hàm kiểm tra có tham số workflow trong công thức hay k
    detectWorkflowParams(str) {
        if (str.includes('workflow_')) {
            return true;
        }
        return false;
    }
    getDatasetEffectedFormula() {
        if (!this.type) {
            return {};
        }
        let inputDatasets = {};
        // let allMappingDatasets =  workerStore['submit'][this.keyInstance].listControlMappingDatasets;
        // let table = this.detectTableQuery();
        // for (let index = 0; index < table.length; index++) {
        //     const tableName = table[index];
        //     for (let dataflowName in allMappingDatasets) {
        //         if (allMappingDatasets[dataflowName].includes(tableName)) {
        //             inputDatasets[dataflowName] = true;
        //         }
        //     }
        // }
        return inputDatasets;
    }
    getInputControl() {
        return this.inputControl;
    }
    /**
     * Hàm lấy dữ liệu của các control đầu vào để chuân bị cho việc run formulas
     * dataInput : {controlName : value}
     */
    getDataInputFormula(rowIndex = null, extraData = null, listInput = null) {
        let inputControl = this.getInputControl();
        if (!listInput) {
            listInput = this.getListControl();
        }
        let dataInput = {};
        for (let inputControlName in inputControl) {
            if (inputControlName == 'document_object_id') {
                dataInput[inputControlName] =
                    workerStore['submit'][this.keyInstance][
                        'document_object_id'
                    ];
            } else {
                if (extraData && extraData[inputControlName]) {
                    dataInput[inputControlName] = extraData[inputControlName];
                } else {
                    if (listInput.hasOwnProperty(inputControlName)) {
                        let controlIns = listInput[inputControlName];
                        let valueInputControl = controlIns.value;
                        if (
                            ['inputFilter', 'combobox'].includes(
                                controlIns.type
                            )
                        ) {
                            valueInputControl = valueInputControl.split(',');
                        }
                        // if (controlIns.type == 'time') {
                        //     valueInputControl =
                        //         controlIns.convertTimeToStandard(
                        //             valueInputControl
                        //         );
                        // }
                        if (
                            ['number', 'percent'].includes(controlIns.type) &&
                            !valueInputControl
                        ) {
                            valueInputControl = 0;
                        }
                        dataInput[inputControlName] = valueInputControl;
                    }
                }
            }
        }
        if (rowIndex != null) {
            for (let controlName in dataInput) {
                let controlIns = listInput[controlName];
                if (Array.isArray(dataInput[controlName])) {
                    if (
                        ['number', 'percent'].includes(controlIns.type) &&
                        !dataInput[controlName][rowIndex]
                    ) {
                        dataInput[controlName][rowIndex] = 0;
                    }
                    dataInput[controlName] = dataInput[controlName][rowIndex];
                }
            }
        }
        return dataInput;
    }
    getFormulas() {
        return this.formulas;
    }
    setFormulas(formulas) {
        this.formulas = formulas;
    }

    /**
     * Hàm phát hiện công thức của control trong table ảnh hưởng đến control nào khác trong table
     * @param {*} mapControlEffected
     * @param {*} name
     * @param {*} script
     * @param {*} listInputInDocument
     */
    detectControlInTable(
        mapControlEffected,
        name,
        script,
        listInputInDocument
    ) {
        let s = script.replace(
            /(REF|ref)\s*\((?:[^)(]+|\((?:[^)(]+|\((?:[^)(]+|\((?:[^)(]+|\((?:[^)(]+|\((?:[^)(]+|\((?:[^)(]+|\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\))*\))*\))*\))*\))*\))*\))*\)/gm,
            ''
        );
        s = s.replace(/{.*?}/gm, '');
        s = s.replace(/(as|AS)\s+(\w+)/gm, '');
        let listWord = s.match(/[A-Za-z0-9_]+/g);
        for (let controlName in listInputInDocument) {
            if (listWord != null && listWord.indexOf(controlName) != -1) {
                if(listInputInDocument[controlName].tableId != listInputInDocument[name].id) {
                    if (mapControlEffected[controlName] == undefined) {
                        mapControlEffected[controlName] = {};
                    }
                    mapControlEffected[controlName][name] = false;
                }
            }
        }
    }
    /**
     * hàm kiểm tra xem công thức có phải truy vấn vào bảng local hay không
     * @returns
     */
    checkIsSelectLocalTable() {
        if (!/^ref|^REF/.test(this.formulas)) {
            if (/select(.*)from[\sa-z0-9]*/.test(this.formulas)) {
                return true;
            }
        }
        return false;
    }
    // hàm kiểm tra công thức có phải từ orgchart hay không
    checkIsSelectOrgchart() {
        if (/role(.*)/.test(this.formulas)) {
            return true;
        }
        return false;
    }

    // hàm thay thế tham số search của input filer lúc gõ search
    wrapSyqlForSearchInputFilter(search) {
        this.setFormulas(this.oldFormulas);
        let refFormulas = this.formulas;
        let regex = new RegExp('{search_value}', 'g');
        refFormulas = refFormulas.replace(regex, search);
        return refFormulas;
    }

    // hàm lấy các column được query sau select và trước from trong trường hợp select từ bảng local

    getColumnsSelect(syql) {
        syql = syql.replace(/[\s\r]+/gm, ' ');
        let listSyql = this.getReferenceFormulas();
        let listColumnSelect = syql.match(
            /(?<=SELECT|select).*(?=FROM|from)/gm
        );
        if (listColumnSelect && listColumnSelect.length > 0) {
            if (listSyql) {
                for (let index = 0; index < listSyql.length; index++) {
                    const refFormula = listSyql[index];
                    for (let i = 0; i < listColumnSelect.length; i++) {
                        const column = listColumnSelect[i];
                        if (refFormula.includes(column)) {
                            listColumnSelect.splice(i, 1);
                        }
                    }
                }
            } else {
                return listColumnSelect;
            }
        } else {
            return [];
        }
    }
    getColumnsQuery(syql) {
        let columns = [];
        syql = syql.replace(/[\s\r]+/gm, ' ');
        let allColumns = syql.match(/(?<=SELECT|select).*(?=FROM|from)/gm);
        for (let index = 0; index < allColumns.length; index++) {
            let element = allColumns[index];
            element = element.trim();
            element = element.split(',');
            for (let i = 0; i < element.length; i++) {
                let column = element[i];
                column = column.replace(/(.*?)(?<= as )/g, '');
                columns.push(column.trim());
            }
        }
        return columns;
    }

    // Lấy các operator phía trước của các biến binding
    // vd: in, =, ilike.....

    setOperatorBeforeInput() {
        let f = this.formulas;
        let rs = {};
        for (let key in this.inputControl) {
            let reg = new RegExp(
                "[a-z0-9_<>!=]*(?=\\s*'?%?{" + key + "}%?'?)",
                'g'
            );
            let textBefore = f.match(reg);
            if (textBefore != null && textBefore.length > 0) {
                textBefore = textBefore[0].trim();
                rs[key] = textBefore;
            }
        }
        return rs;
    }
    getOperatorBeforeInput() {
        return this.operatorBefore;
    }
}

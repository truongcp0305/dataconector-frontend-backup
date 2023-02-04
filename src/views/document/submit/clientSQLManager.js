import { workerStore } from '@/worker/document/submit/WorkerStateManagement';

const initSqlJs = require('sql.js');
/**
 * hoangnd:26/5/2020
 * Class xử lí việc chạy câu lệnh SQL trên client
 */
export default class ClientSQLManager {
    /**
     * hoangnd:26/5/2020
     * Hàm tạo mới DB
     * @param {String} keyInstance
     */
    static async createDB(keyInstance) {
        const SQL = await initSqlJs({
            locateFile: (file) =>
                `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm`,
        });
        let db = new SQL.Database();
        this.addSQLInstanceDBToStore(keyInstance, db);
    }
    /**
     * hoangnd:26/5/2020
     * Hàm lưu instance của DB vào store khi create
     * @param {String} keyInstance
     * @param {SQLLite} SQLDBInstance
     */
    static addSQLInstanceDBToStore(keyInstance, SQLDBInstance) {
        if (!workerStore['submit'][keyInstance]) {
            workerStore['submit'][keyInstance] = {};
        }
        workerStore['submit'][keyInstance]['SQLiteDB'] = SQLDBInstance;
    }
    /**
     * hoangnd:26/5/2020
     * Hàm trả về instance của 1 DB dựa vào keyInstance
     * @param {String} keyInstance
     */
    static getInstanceDB(keyInstance) {
        return workerStore['submit'][keyInstance]['SQLiteDB'];
    }
    /**
     * hoangnd:26/5/2020
     * Hàm chạy công thức
     * @param {String} keyInstance      : instance của view submit hiện tại (trường hợp có thêm sub submit thì có trên 2 instance)
     * @param {String} sql              : công thức cần chạy
     * @param {Boolean} isWithoutReturn : biến kiểm tra có trả về kết quả hay ko
     */
    static run(keyInstance, sql, isWithoutReturn = false) {
        let db = this.getInstanceDB(keyInstance);
        if (isWithoutReturn) {
            return db.run(sql);
        } else {
            console.log(sql, 'sql');
            return db.exec(sql);
        }
    }

    static createTable(
        keyInstance,
        tableName,
        columns,
        temporary = '',
        columnInsert = false,
        dataInsert = false,
        returnPromise = false,
    ) {
        let sql = `CREATE ${temporary} TABLE IF NOT EXISTS ${tableName} (${columns});`;
        if (dataInsert != false && columnInsert != false) {
            sql += `INSERT INTO ${tableName} (${columnInsert}) VALUES ${dataInsert};`;
        }
        if (returnPromise) {
            return new Promise((resolve, reject) => {
                try {
                    let data = this.run(keyInstance, sql, true);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            });
        } else {
            return this.run(keyInstance, sql, true);
        }
    }
    static async insertDataToTable(
        keyInstance,
        tableName,
        columns,
        data,
        returnPromise = false,
    ) {
        if (!data) {
            return;
        }
        let sql = `INSERT INTO ${tableName} (${columns}) VALUES ${data}`;
        if (returnPromise) {
            return new Promise((resolve, reject) => {
                try {
                    let data = this.run(keyInstance, sql, true);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            });
        } else {
            return this.run(keyInstance, sql, true);
        }
    }
    static async exeBySql(keyInstance, sql, returnPromise = false) {
        if (returnPromise) {
            return new Promise((resolve, reject) => {
                try {
                    let data = this.run(keyInstance, sql, true);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            });
        } else {
            return this.run(keyInstance, sql, true);
        }
    }
    static async editRow(
        keyInstance,
        tableName,
        column,
        value,
        where,
        returnPromise = false,
    ) {
        let sql = `UPDATE ${tableName} SET ${column} = "${value}" ${where}`;
        if (returnPromise) {
            return new Promise((resolve, reject) => {
                try {
                    let data = this.run(keyInstance, sql, true);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            });
        } else {
            return this.run(keyInstance, sql, true);
        }
    }
    static deleteRow(keyInstance, tableName, where) {
        let sql = `DELETE FROM ${tableName} ${where}`;
        this.run(keyInstance, sql, true);
    }
    static async insertRow(
        keyInstance,
        tableName,
        column,
        value,
        returnPromise = false,
    ) {
        let tbColumn = column.join();
        let tbValue = '';
        for (let index = 0; index < value.length; index++) {
            let v = value[index];
            if (v == null) {
                v = '';
            }
            tbValue += "'" + v + "',";
        }
        tbValue = tbValue.trim();
        tbValue = tbValue.substring(0, tbValue.length - 1);
        let sql = `INSERT INTO ${tableName} (${tbColumn}) VALUES(${tbValue})`;
        if (returnPromise) {
            return new Promise((resolve, reject) => {
                try {
                    let data = this.run(keyInstance, sql, true);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            });
        } else {
            return this.run(keyInstance, sql, true);
        }
    }
    static insertMultiple(
        keyInstance,
        tableName,
        columns,
        columnstype,
        values,
    ) {
        let tbColumns = columns.join();
        let tbValues = '';
        for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < columnstype.length; j++) {
                if (columnstype[j] == 'numeric') {
                    if (typeof values[i][j] != 'number') values[i][j] = 0;
                } else {
                    if (values[i][j] == null) {
                        values[i][j] = `""`;
                    } else {
                        values[i][j] = `"${values[i][j]}"`;
                    }
                }
            }
            values[i].push(i);

            tbValues += ` (${values[i].join()}),`;
        }
        tbValues = tbValues.substring(0, tbValues.length - 1);
        let sql = `INSERT INTO ${tableName} (${tbColumns},s_table_id_sql_lite) VALUES ${tbValues}`;

        this.run(keyInstance, sql, true);
    }
    static delete(keyInstance, tableName, where) {
        let w = '';
        if (where != false) {
            w = ` WHERE ${where}`;
        }
        let sql = `DELETE FROM ${tableName} ${w}`;
        this.run(keyInstance, sql, true);
    }
    static get(keyInstance, sql) {
        return this.run(keyInstance, sql, false);
    }
    static closeDB(keyInstance) {
        let db = this.getInstanceDB(keyInstance);
        if (db != undefined) {
            db.close();
        }
    }
    static getAllTableName(keyInstance) {
        let sql = `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`;
        return this.run(keyInstance, sql, false);
    }
}

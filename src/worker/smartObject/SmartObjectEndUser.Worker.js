import { registerPromiseWorker } from '@/worker/registerPromiseWorker.js';
import { documentApi } from '@/api/Document.js';
import _isEmpty from 'lodash/isEmpty';
import { appConfigs } from '@/configs';
import { formulasApi } from '@/api/Formulas';


var handler = {
    async getSmartObject(data) {
        try {
            if (data.dataSMO) {
                for (let link of data.dataSMO) {
                    let isObjectSource = false // check xem bản ghi đang view có phải bản ghi của object source trong cấu hình link hay ko
                    if (data.id == link.id_object_source) {
                        isObjectSource = true
                    }
                    // custom link phụ thuộc vào object source -> lấy ra cấu hình tương ứng
                    let config = JSON.parse(link.config)
                    if (isObjectSource) {
                        link.config = {
                            name: config.configSourceToTarget.name.value,
                            description: config.configSourceToTarget.description.value,
                            condition: config.structure.condition
                        }
                    } else {
                        link.config = {
                            name: config.configTargetToSource.name.value,
                            description: config.configTargetToSource.description.value,
                            condition: config.structure.condition
                        }
                    }
                    // custom dữ liệu của object,link được liên kết với bản ghi hiện tại đang view
                    let object = isObjectSource ? this.customConfigLinkAndObject(data,link,isObjectSource, link.objectTarget,link.id_object_target,link.objectSource,link.id_col_source,link.id_col_target,data.allControlDocument,link.allControlObjectTarget) : this.customConfigLinkAndObject(data,link,isObjectSource,link.objectSource,link.id_object_source,link.objectTarget,link.id_col_target,link.id_col_source,data.allControlDocument,link.allControlObjectSource);
                    link.dataObject = {
                        type: object.type,
                        apiUrl: object.apiUrl,
                        tableContextMenu: {},
                        sqlQuery: object.sqlQuery,
                        id: object.idObject

                    }
                    if (object.action) {
                        link.dataObject.action = JSON.parse(object.action)
                    }
                    delete link.objectSource
                    delete link.objectTarget
                    delete link.id_col_source
                    delete link.id_col_target
                }
            }
            return data.dataSMO.filter(link => !link.err)

        } catch (error) {
            console.error(error);
            return false;
        }
    },
    createSqlQueryFromTreeCondition(item, allControlOfRecordViewed, allControlOfRecordLinked, isObjectSource, allDataOfRecordViewed) {
        var where = '';
        let name = item.name;
        let children = item.children;
        if (children.length == 0) {
            where = 'true';
        } else if (children.length == 1 && (children[0].column && children[0].columnRight)) {
            where = this.createConditionalWhere(isObjectSource,children[0],allControlOfRecordViewed,allControlOfRecordLinked)
        } else {
            for (let index = 0; index < children.length; index++) {
                const childItem = children[index];
                let childSql = '';
                if (childItem.condition) { // có cấp con
                    childSql = '(' + this.createSqlQueryFromTreeCondition(childItem, allControlOfRecordViewed, allControlOfRecordLinked, isObjectSource, allDataOfRecordViewed) + ')';
                } else {
                    if (childItem.column && childItem.columnRight) { // cột bên trái và phải đã nhập điều kiện
                        childSql = this.createConditionalWhere(isObjectSource,childItem,allControlOfRecordViewed,allControlOfRecordLinked)
                    } else {
                        childSql = 'true';
                    }
                }
                if (index == children.length - 1) {
                    where += childSql;
                } else {
                    where += childSql + ' ' + name + ' ';
                }
            }
        }
        return where
    },
    createConditionalWhere(isObjectSource,childItem){
        var valueLeft = ''
        var valueRight = ''
        var where = ''
        if (isObjectSource && childItem.columnRight.id) {
            if (childItem.column.id) {
                childItem.column = `'` + allControlOfRecordViewed[childItem.column.id] + `'`
                valueLeft = childItem.column ? allDataOfRecordViewed[childItem.column.name] : undefined
            } else valueLeft = `'` + childItem.column.title + `'`
            if (childItem.columnRight.id) {
                childItem.columnRight = allControlOfRecordLinked[childItem.columnRight.id]
                valueRight = childItem.columnRight ? childItem.columnRight.name : valueRight
            } else valueRight = `'` + childItem.columnRight.title + `'`
            valueLeft = valueLeft == '' ? `''` : valueLeft
            valueRight = valueRight == '' ? `''` : valueRight
            where =
                '(' +
                valueLeft +
                ' ' +
                childItem.operator +
                ' ' +
                valueRight +
                ')';
        } else if (childItem.column.id) { // cột bên trái = giá trị -> bỏ qua điều kiện
            if (childItem.column.id) {
                childItem.column = allControlOfRecordLinked[childItem.column.id]
                valueLeft = childItem.column ? childItem.column.name : undefined
            } else valueLeft = `'` + childItem.column.title + `'`
            if (childItem.columnRight.id) {
                childItem.columnRight = allControlOfRecordViewed[childItem.columnRight.id]
                valueRight = childItem.columnRight ? `'` + allDataOfRecordViewed[childItem.columnRight.name] + `'` : undefined
            } else valueRight = `'` + childItem.columnRight.title + `'`
            valueLeft = valueLeft == '' ? `''` : valueLeft
            valueRight = valueRight == '' ? `''` : valueRight
            where =
                '(' +
                valueLeft +
                ' ' +
                childItem.operator +
                ' ' +
                valueRight +
                ')';
        } else where = 'true'
        if (valueLeft == undefined || valueRight == undefined) { // control trong điều kiện đã bị xóa
            where = 'true'
        }
        return where
    },
    async updateByFormula(data) {
        try {
            let dataInput = data.dataInput;
            let formulasInfo = {
                formula: data.formulas,
                distinct: false,
                data_input: JSON.stringify(dataInput),
            };
            await formulasApi.execute(formulasInfo);
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    customConfigLinkAndObject(data,link,isObjectSource,linkObject,idLinkObject,originalObject,idColOriginalObject,idColLinkObject, allControlOriginalObject ,allControlLinkObject){
        let object = {}
        let key = Object.keys(data.operations);
        let hasPermission = true
        if (!key.includes('get_all_operations')) {
            if((linkObject.type.trim() == 'document') && (!key.includes(idLinkObject + ':0') || !data.operations[idLinkObject + ':0'].list_instance)){
                hasPermission = false
            }
            if ((linkObject.type.trim() == 'orgchart') && ( !key.includes(idLinkObject) || (key.includes(idLinkObject) && !data.operations[idLinkObject].detail))){
                hasPermission = false
            }                               
        }
        if (!hasPermission) {
            link.err = true
        }
        else {
            object = linkObject
            if (object.type.trim() == 'document' && originalObject.type.trim() == 'document') {
                // lấy data control theo id control 
                object.dataControlOriginalObject = allControlOriginalObject[idColOriginalObject]
                object.dataControlLinkObject = allControlLinkObject[idColLinkObject]
                if (object.dataControlLinkObject.inTable) {
                    link.showDataTable = {
                        tableId: object.dataControlLinkObject.inTable,
                        tableName: object.dataControlLinkObject.table.name
                    }
                }
                if (object.dataControlOriginalObject.inTable) {
                    let listData = []
                    data.allDataDocument[object.dataControlOriginalObject.inTable.name].map(dataIns => {
                        listData.push(dataIns[object.dataControlOriginalObject.name])
                    })
                    var conditionLink = '(' + object.dataControlLinkObject.name + ` in ('` + listData.join('\', \'') + `')) AND `;
                } else {
                    var conditionLink = '(' + object.dataControlLinkObject.name + ` = '` + data.allDataDocument[object.dataControlOriginalObject.name] + `') AND `;
                }
                // tạo sql query từ tree sql
                let sqlQuery = this.createSqlQueryFromTreeCondition(
                    link.config.condition[0],
                    allControlOriginalObject,
                    allControlLinkObject,
                    isObjectSource,
                    data.allDataDocument
                );
                object.apiUrl = appConfigs.apiDomain.sdocumentManagement + 'documents/' + idLinkObject + '/objects'
                object.sqlQuery = conditionLink + sqlQuery
                link.dataControl = object.dataControlOriginalObject // mục đích hightlight control
                link.nameControlObjectLink = object.dataControlLinkObject.name // mục đích sửa lại điều kiện filter khi click 1 dòng trong table
                link.sqlQueryFromTreeCondition = sqlQuery
            } else if (object.type.trim() == 'document' && originalObject.type.trim() == 'orgchart') {
                object.dataControlLinkSource = idColOriginalObject
                let dataControlLinkObject = {}
                for (let key in allControlLinkObject) {
                    if (allControlLinkObject[key].id == idColLinkObject) {
                        dataControlLinkObject = allControlLinkObject[key];
                        break
                    }
                }
                object.dataControlLinkObject = dataControlLinkObject
                let idUsers = data.listUserInNode.join('\', \'')
                let conditionLink = '(' + object.dataControlLinkObject.name + ` in ('` + idUsers + `')  AND ` + object.dataControlLinkObject.name + ' !=\'\' AND ' + object.dataControlLinkObject.name + ' is not null) AND ';
                // tạo sql query từ tree sql
                let sqlQuery = this.createSqlQueryFromTreeCondition(
                    link.config.condition[0],
                    allControlOriginalObject,
                    allControlLinkObject,
                    isObjectSource,
                    data.listUserInNode
                );
                object.apiUrl = appConfigs.apiDomain.sdocumentManagement + 'documents/' + idLinkObject + '/objects'
                object.sqlQuery = conditionLink + sqlQuery
                link.dataControl = object.dataControlLinkSource // mục đích hightlight control
            }else if (object.type.trim() == 'orgchart' && originalObject.type.trim() == 'document') {
                // lấy data control theo id control
                object.dataControlLinkSource = allControlOriginalObject[idColOriginalObject]
                object.dataControlLinkObject = idColLinkObject
                if (object.dataControlLinkSource.inTable) {
                    let listData = []
                    data.allDataDocument[object.dataControlLinkSource.inTable.name].map(dataIns => {
                        listData.push(dataIns[object.dataControlLinkSource.name])
                    })
                    var conditionLink = '(' + object.dataControlLinkObject + ` in ('` + listData.join('\', \'') + `') AND org_id = '`+ object.idObject + `'`;
                } else {
                    var conditionLink = '(' + object.dataControlLinkObject + ` = '` + data.allDataDocument[object.dataControlLinkSource.name] + `') AND org_id = '`+ object.idObject + `'`;
                }
                object.apiUrl = appConfigs.apiDomain.orgchart + 'orgchart/flat-nodes'
                object.sqlQuery = conditionLink
                link.dataControl = object.dataControlLinkSource // mục đích hightlight control
                link.nameControlObjectLink = idColLinkObject // mục đích sửa lại điều kiện filter khi click 1 dòng trong table
                link.sqlQueryFromTreeCondition = ''                            
            }else {
                link.err = true
            }
        }
        return object
    }
};
registerPromiseWorker(self, handler);
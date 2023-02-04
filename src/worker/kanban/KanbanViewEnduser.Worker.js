import { registerPromiseWorker } from '@/worker/registerPromiseWorker.js';
import { documentApi } from '@/api/Document.js';
import qs from 'qs';
import treeConditionToJSString from '@/components/dashboard/configPool/treeConditionToJSString.js';
import { checkColumnHasFilter } from '@/components/common/customTable/defaultFilterConfig';
import _isEmpty from 'lodash/isEmpty';
import { convertDisplayFilterToQuery } from '@/components/common/customTable/defaultFilterConfig';
import { kanbanApi } from '@/api/kanban.js';
import { formulasApi } from '@/api/Formulas';
var mo = treeConditionToJSString.mo;

const MAP_KEY_CARD = {
    status: 'priority',
    titleTask: 'title',
    datetime: 'date',
    duration: 'time',
    idUser: 'user',
    nameParentTask: 'mother_card_title',
    idParentTask: 'mother_card_identifier',
};

var mapKeyCardRevert = {};
for (let key in MAP_KEY_CARD) {
    mapKeyCardRevert[MAP_KEY_CARD[key]] = key;
}
var handler = {
    getMapIdTaskToIdColumn(listTask) {
        let rsl = {};
        for (let index = 0; index < listTask.length; index++) {
            const element = listTask[index];
            rsl[element.id] = element.column;
        }
        return rsl;
    },
    getMapCol(listCol) {
        let rsl = {};
        for (let index = 0; index < listCol.length; index++) {
            const element = listCol[index];
            rsl[element.id] = element;
        }
        return rsl;
    },
    async getTasksForAllColumns(kanbanConfigs) {
        try {
            let query = this.prepareQueryForAllColumns(kanbanConfigs);
            let rsl = await this.getListTasksFromQuery(query, kanbanConfigs);
            return rsl.tasks;
        } catch (error) {
            console.error(error);
            return {
                error: true,
                detail: error,
            };
        }
    },
    async getListTasksFromQuery(query, kanbanConfigs) {
        let docObjData = await this.getDocObjs(query, kanbanConfigs.docId);
        let rsl = this.convertToKanbanFormat(
            docObjData.listObject,
            kanbanConfigs,
        );
        this.calcConditionalFormat({ tasks: rsl, config: kanbanConfigs });
        return { tasks: rsl, countTask: docObjData.total };
    },
    // kiểm tra tồn tại doc kanban
    async checkExistDocKanban(idDoc) {
        let res = await kanbanApi.checkExistDocKanban(idDoc);
        return res;
    },
    getSearchableColumns(kanbanConfigs) {
        let rsl = [];
        let fields = ['title', 'mother_card_title', 'mother_card_identifier'];
        for (let f of fields) {
            if (kanbanConfigs.controlInCard[f].field) {
                rsl.push(kanbanConfigs.controlInCard[f].field);
            }
        }
        return rsl.join(',');
    },
    prepareQueryForAllColumns(kanbanConfigs) {
        let query = {
            unionMode: {
                all: true,
                items: {},
            },
            columns: [],
            isOptimize: true,
            getDataForAllColumn: true,
            isTranslateUser: 0,
        };
        if (Array.isArray(kanbanConfigs.listColumns)) {
            for (let col of kanbanConfigs.listColumns) {
                let newFilter = {
                    sort: [
                        {
                            column: 'document_object_update_time',
                            type: 'desc',
                        },
                    ],
                    filter: [
                        {
                            column: kanbanConfigs.controlForColumn,
                            operation: 'and',
                            conditions: [
                                {
                                    name: 'equal',
                                    value: col.value,
                                },
                            ],
                        },
                        {
                            column: 'document_object_update_time',
                            operation: 'and',
                            conditions: [
                                {
                                    name: 'not_empty',
                                    value: '',
                                },
                            ],
                            dataType: 'date',
                        },
                    ],
                    pageSize: 10,
                    page: 1,
                };
                if (kanbanConfigs.groupFilter) {
                    kanbanConfigs.groupFilter.map((fil) => {
                        newFilter.filter.push(fil);
                    });
                }
                // query.unionMode.items.push(newFilter);
                query.unionMode.items[col.value] = newFilter;
            }
        }

        if (kanbanConfigs.filter) {
            query = this.addFilterQuery(query, kanbanConfigs);
        }
        query.unionMode.items = Object.values(query.unionMode.items);
        if (kanbanConfigs.keySearch) {
            query.search = kanbanConfigs.keySearch;
            query.searchColumns = this.getSearchableColumns(kanbanConfigs);
        }

        if (Array.isArray(kanbanConfigs.controlInCard)) {
            for (const col of kanbanConfigs.controlInCard) {
                query.columns.push(col.field);
            }
        }
        return query;
    },
    async getDocObjs(query, docId) {
        try {
            query = qs.stringify(query);
            let res = await documentApi.getListDocumentObject(docId, query);
            if (res.status == 200) {
                return res.data;
            } else {
                throw {
                    title: 'Can not get list object for kanban',
                    detail: res,
                };
            }
        } catch (error) {
            throw {
                title: 'Can not get list object for kanban',
                detail: error,
            };
        }
    },
    addFilterQuery(query, kanbanConfigs) {
        let groupFilterByColumns = {};
        let filters = kanbanConfigs.filter;
        for (let f of filters) {
            for (let colId in f) {
                if (!groupFilterByColumns[colId]) {
                    groupFilterByColumns[colId] = [];
                }
                groupFilterByColumns[colId].push(f[colId]);
            }
        }

        for (let colId in groupFilterByColumns) {
            let sorts = {};
            let groupFilterItem = groupFilterByColumns[colId];
            if (groupFilterItem && Array.isArray(groupFilterItem)) {
                for (let idx in groupFilterItem) {
                    let filterItem = groupFilterItem[idx];
                    // Tìm các cột được sort
                    for (let col of filterItem.dataFilterColumn.rawConfigs
                        .setting.column.selectedColums) {
                        if (col.sort != 'none') {
                            sorts[col.name] = {
                                column: col.name,
                                type: col.sort,
                            };
                        }
                    }

                    // Tìm các cột được lọc
                    let selfFilterConfig =
                        filterItem.dataFilterColumn.sharedConfigs
                            .computedSelfFilterConfig;
                    if (Array.isArray(selfFilterConfig)) {
                        for (let item of selfFilterConfig) {
                            if (checkColumnHasFilter(item.config)) {
                                let newFilter = convertDisplayFilterToQuery(
                                    item.col.name,
                                    item.config,
                                );
                                newFilter.dataType = item.col.type;
                                if (colId == 'allColumn') {
                                    for (let col in query.unionMode.items) {
                                        query.unionMode.items[col].filter.push(
                                            newFilter,
                                        );
                                    }
                                } else {
                                    query.unionMode.items[colId].filter.push(
                                        newFilter,
                                    );
                                }
                            }
                        }
                    }
                }
                if (colId == 'allColumn') {
                    for (let col in query.unionMode.items) {
                        query.unionMode.items[col].sort = Object.values(sorts);
                    }
                } else {
                    query.unionMode.items[colId].sort = Object.values(sorts);
                }
            }
        }
        return query;
    },
    clearValuesTypeArray(data) {
        Object.keys(data).map(key => {
            if (Array.isArray(data[key])) {
                delete data[key]
            }
        })
        return data
    },
    async sendFormular(data) {
        let dataInput = data.dataInput;
        let fomulasInfo = {
            formula: data.formulas,
            distinct: false,
            data_input: JSON.stringify(dataInput),
        };
        if (!dataInput) {
            if (!data.listCardSelected) {
                let res = await documentApi.detailDocumentObject(data.cardId);
                if (res.status == 200) {
                    let sanitizedData = this.clearValuesTypeArray(res.data)
                    fomulasInfo.data_input = JSON.stringify(sanitizedData);
                    return this.excuteFormulas(fomulasInfo);
                } else {
                    return false;
                }
            } else {
                data.listCardSelected.map((card) => {
                    this.handleExcuteListFomulas(card, fomulasInfo);
                });
            }
        } else {
            return this.excuteFormulas(fomulasInfo);
        }
    },
    async handleExcuteListFomulas(cardId, fomulasInfo) {
        let res = await documentApi.detailDocumentObject(cardId);
        if (res.status == 200) {
            fomulasInfo.data_input = JSON.stringify(res.data);
            return this.excuteFormulas(fomulasInfo);
        } else {
            return false;
        }
    },
    async excuteFormulas(formulasInfo) {
        let res = await formulasApi.execute(formulasInfo);
        if (res.status != 200) {
            return false;
        } else {
            if (res.data && res.data.data) {
                return res.data.data;
            }
            return false;
        }
    },
    convertToKanbanFormat(docObjData, kanbanConfigs) {
        let rsl = [];
        for (let item of docObjData) {
            let newCard = {
                idParentTask: '',
                nameParentTask: '',
                status: '',
                titleTask: '',
                datetime: '',
                duration: '',
                id: item.document_object_id,
                idUser: '',
                colorConfig: {},
            };
            for (let key in newCard) {
                let configKey = MAP_KEY_CARD[key];
                if (kanbanConfigs.controlInCard[configKey]) {
                    newCard[key] = item[
                        kanbanConfigs.controlInCard[configKey].field
                    ]
                        ? item[kanbanConfigs.controlInCard[configKey].field]
                        : '';
                    if (
                        kanbanConfigs.controlInCard[configKey].type == 'user' &&
                        key != 'idUser'
                    ) {
                        let allUsers = kanbanConfigs.allUsers;
                        let userName = allUsers.filter(
                            (user) => user.id == newCard[key],
                        );
                        if (userName.length > 0) {
                            newCard[key] = userName[0].displayName;
                        }
                    }
                }
                if (key != 'colorConfig') {
                    newCard.colorConfig[key] = {
                        color: '',
                        background: '',
                    };
                }
            }
            newCard.column = item[kanbanConfigs.controlForColumn];
            newCard.originRowData = item;
            rsl.push(newCard);
        }
        return rsl;
    },
    async getCountTaskPerColumn(kanbanConfigs) {
        let keyControl = kanbanConfigs.controlForColumn;
        let query = {
            aggregate: [
                {
                    column: 'document_object_id',
                    func: 'count',
                },
            ],
            groupBy: [keyControl],
            isOptimize: true,
            getDataForAllColumn: true,
            isTranslateUser: 0,
        };
        if (kanbanConfigs.groupFilter) {
            query.filter = kanbanConfigs.groupFilter;
        }
        if (kanbanConfigs.keySearch) {
            query.search = kanbanConfigs.keySearch;
            query.searchColumns = this.getSearchableColumns(kanbanConfigs);
        }
        if (kanbanConfigs.filter) {
            query.unionMode = {
                all: true,
                items: {},
            };
            if (Array.isArray(kanbanConfigs.listColumns)) {
                for (let col of kanbanConfigs.listColumns) {
                    let newFilter = {
                        sort: [
                            {
                                column: 'document_object_update_time',
                                type: 'desc',
                            },
                        ],
                        filter: [
                            {
                                column: kanbanConfigs.controlForColumn,
                                operation: 'and',
                                conditions: [
                                    {
                                        name: 'equal',
                                        value: col.value,
                                    },
                                ],
                            },
                            {
                                column: 'document_object_update_time',
                                operation: 'and',
                                conditions: [
                                    {
                                        name: 'not_empty',
                                        value: '',
                                    },
                                ],
                                dataType: 'date',
                            },
                        ],
                        pageSize: 10,
                        page: 1,
                    };
                    query.unionMode.items[col.value] = newFilter;
                }
            }
            query = this.addFilterQuery(query, kanbanConfigs);
            query.unionMode.items = Object.values(query.unionMode.items);
        }
        query = qs.stringify(query);

        try {
            let res = await documentApi.getListDocumentObject(
                kanbanConfigs.docId,
                query,
            );
            if (res.status == 200) {
                return res.data.listObject;
            } else {
                return {
                    title: 'Can not count task per column',
                    detail: res,
                };
            }
        } catch (error) {
            return {
                title: 'Can not count task per column',
                detail: error,
            };
        }
    },
    calcConditionalFormat(data) {
        let mapCtrlNameToCardField = {};
        for (let cardField in data.config.controlInCard) {
            mapCtrlNameToCardField[data.config.controlInCard[cardField].field] =
                mapKeyCardRevert[cardField];
        }
        let mapCardFieldToFormat = this.getMapCardFieldToFormat(
            data.config,
            mapCtrlNameToCardField,
        );

        // row: từng task
        for (let cardData of data.tasks) {
            var row = cardData.originRowData;
            // key: tên của filed trong card
            for (let key22 in mapCardFieldToFormat.fields) {
                // cond: cấu hình điều kiện
                for (let cond of mapCardFieldToFormat.fields[key22]) {
                    let condValue = eval(cond.jsCondition);
                    if (condValue && cardData.colorConfig[key22]) {
                        let style =
                            treeConditionToJSString.objStyleToCSSStyle(cond);
                        style.background = style.backgroundColor;
                        delete style.backgroundColor;
                        cardData.colorConfig[key22] = Object.assign(
                            cardData.colorConfig[key22],
                            style,
                        );
                    }
                }
            }
            if (mapCardFieldToFormat.backgroundAll.length) {
                for (let bgStyleItem of mapCardFieldToFormat.backgroundAll) {
                    if (eval(bgStyleItem.jsCondition)) {
                        cardData.colorConfig.backgroundAll =
                            bgStyleItem.backgroundColor;
                    }
                }
            }
        }
        return data.tasks;
    },
    convertConfigToCardField(cond, controlField) {
        if (cond.children) {
            for (let item of cond.children) {
                this.convertConfigToCardField(item, controlField);
            }
        } else if (cond.nodeType == 'item') {
            if (mapKeyCardRevert[cond.column.keyCard]) {
                cond.column.cardField = mapKeyCardRevert[cond.column.keyCard];
            } else if (controlField == cond.column.field) {
                cond.column.cardField = 'column';
            }
        }
    },
    getMapCardFieldToFormat(config, mapCtrlNameToCardField) {
        let formatConfig = config.conditionalFormat;
        let rsl = {
            backgroundAll: [],
            fields: {},
        };
        for (let item of formatConfig) {
            if (item.isSelected) {
                if (item.checkboxSelected.includes('background')) {
                    item.displayMode.singleColor.jsCondition =
                        treeConditionToJSString.treeItemToJSCondition(
                            item.displayMode.singleColor.originCondition,
                            'field',
                        );
                    rsl.backgroundAll.push(item.displayMode.singleColor);
                }

                if (item.checkboxSelected.includes('control')) {
                    for (let col of item.tableColumns) {
                        if (col.isSelected) {
                            let newKey = mapCtrlNameToCardField[col.field];
                            if (!rsl.fields[newKey]) {
                                rsl.fields[newKey] = [];
                            }
                            item.displayMode.singleColor.jsCondition =
                                treeConditionToJSString.treeItemToJSCondition(
                                    item.displayMode.singleColor
                                        .originCondition,
                                    'field',
                                );
                            rsl.fields[newKey].push(
                                item.displayMode.singleColor,
                            );
                        }
                    }
                }
            }
        }
        return rsl;
    },
    async getTasksForAColumns(kanbanConfigs) {
        let dataFilter = kanbanConfigs.filter;
        let query = {
            filter: [
                {
                    column: dataFilter.controlForColumn,
                    operation: 'and',
                    conditions: [
                        {
                            name: 'equal',
                            value: dataFilter.column,
                        },
                    ],
                },
                {
                    column: 'document_object_update_time',
                    operation: 'and',
                    conditions: [
                        {
                            name: 'not_empty',
                            value: '',
                        },
                    ],
                    dataType: 'date',
                },
            ],
            sort: [],
            pageSize: 10,
            isTranslateUser: 0,
            getDataForAllColumn: true,
            search: dataFilter.keySearch
        };
        if (dataFilter.dataForSelfFilter) {
            for (let filter of dataFilter.dataForSelfFilter) {
                let sorts = {};
                // Tìm các cột được sort
                for (let col of filter.rawConfigs.setting.column
                    .selectedColums) {
                    if (col.sort != 'none') {
                        sorts = {
                            column: col.name,
                            type: col.sort,
                        };
                    }
                }

                // Tìm các cột được lọc
                let selfFilterConfig =
                    filter.sharedConfigs.computedSelfFilterConfig;
                if (Array.isArray(selfFilterConfig)) {
                    for (let item of selfFilterConfig) {
                        if (checkColumnHasFilter(item.config)) {
                            let newFilter = convertDisplayFilterToQuery(
                                item.col.name,
                                item.config,
                            );
                            newFilter.dataType = item.col.type;
                            query.filter.push(newFilter);
                        }
                    }
                }
                query.sort.push(sorts);
            }
        }
        if (dataFilter.page) {
            query.page = dataFilter.page;
        }
        if (dataFilter.groupFilter) {
            query.filter = [...query.filter, ...dataFilter.groupFilter];
        }
        if (query.sort.length == 0) {
            query.sort.push({
                column: 'document_object_update_time',
                type: 'desc',
            });
        }
        try {
            let rsl = await this.getListTasksFromQuery(query, kanbanConfigs);
            return rsl;
        } catch (error) {
            console.error(error);
            return {
                error: true,
                detail: error,
            };
        }
    },
    async updateDocument(config) {
        try {
            let dataControl = {};
            dataControl[config.controlForColumn] = config.data.columnId;
            let dataPost = {};
            dataPost['documentId'] = config.idDoc;
            dataPost['documentObjectWorkflowObjectId'] = '';
            dataPost['documentObjectWorkflowId'] = '';
            dataPost['documentObjectTaskId'] = '';
            dataPost['dataControl'] = JSON.stringify(dataControl);

            try {
                let res = await documentApi.updateDocument(
                    config.data.id,
                    dataPost,
                );
                if (res.status == 200) {
                    return res.data;
                } else return false;
            } catch (error) {
                console.error(error);
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    async getKanban(idDoc) {
        try {
            let res = await kanbanApi.getBoardByIdDoc(idDoc);
            return res;
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    // lấy tất cả control trong doc
    async getAllControl(idDoc) {
        try {
            let listControl = {};
            let res = await documentApi.getAllControl(idDoc);
            if (res.status === 200) {
                let fieldDoc = Object.values(res.data);
                fieldDoc.map((f) => {
                    if(f.isHidden== "0"){
                        listControl[f.id] = {
                            field: f.name,
                            headerName: f.title,
                            type: f.type,
                            name: f.title,
                        }                       
                    }
                });
            }
            return listControl;
        } catch (error) {
            console.error(error);
            return false;
        }
    },
};
registerPromiseWorker(self, handler);

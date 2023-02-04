import { documentApi } from "@/api/Document.js";
import { schedulerApi } from "@/api/scheduler.js";
import { formulasApi } from '@/api/Formulas';
import qs from "qs";
import treeConditionToJSString from "@/components/dashboard/configPool/treeConditionToJSString.js";
import { checkColumnHasFilter } from '@/components/common/customTable/defaultFilterConfig';
import { convertDisplayFilterToQuery } from "@/components/common/customTable/defaultFilterConfig";
var mo = treeConditionToJSString.mo;
import { util } from '@/plugins/util';
import Formulas from "@/../src/views/document/submit/formulas.js";
const MAP_KEY_CARD = {
    "text": "title",
    "start_date": "start_time",
    "end_date": "end_time",
};
const listKey = ['document_object_create_time', 'document_object_id', 'document_object_last_user_update_id', 'document_object_update_time', 'document_object_user_created_id',
    'document_object_is_deleted', 'document_object_parent_id', 'document_object_parent_uuid', 'document_object_task_id', 'document_object_uuid', 'document_object_workflow_id',
    'document_object_workflow_id', 'document_object_workflow_object_id', 'title_object', 'document_id', 'tenant_id', 'document_object_user_created_fullname', 'isContinueSubmit', 'documentId', 'otherInfo', 'userCreateInfo', 'tb2']

var mapKeyCardRevert = {};
for (let key in MAP_KEY_CARD) {
    mapKeyCardRevert[MAP_KEY_CARD[key]] = key;
}
onmessage = function (event) {
    let data = event.data;
    let action = data.action;
    if (handler[action]) {
        handler[action](data.data);
    } else {
        console.error(` action ${action} not found `);
    }
};
var handler = {

    async getScheduler(idDoc) {
        try {
            let res = await schedulerApi.getSchedulerByIdDoc(idDoc);
            self.postMessage({
                action: 'handleGetScheduler',
                data: res
            });
        } catch (error) {
            console.error(error);
            return false
        }
    },
    // lấy tất cả control trong doc
    async getAllControlInDoc(idDoc) {
        try {
            var listControl = [];
            let res = await documentApi.getAllControl(idDoc);
            if (res.status === 200) {
                res.data.map((f) => {
                    if(!f.inTable && f.type != 'table'){
                        listControl.push({
                            field: f.name,
                            headerName: f.title,
                            type: f.type,
                            name: f.title,
                        });
                    }
                });
            }
            self.postMessage({
                action: 'handleGetAllControlInDoc',
                data: listControl
            });
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    async getGroup(groupConfig) {
        try {
            let prms = [];
            for (let index = 0; index < groupConfig.length; index++) {
                let formulaLowerCase = groupConfig[index].formulaValue[groupConfig[index].id].value.toLowerCase();
                let indexOfFirst = formulaLowerCase.indexOf('select');

                let formula = groupConfig[index].formulaValue[groupConfig[index].id].value
                formula = formula.replace(formula.slice(indexOfFirst, indexOfFirst + 6), `select '` + groupConfig[index].id + `' AS symper_scheduler_group, document_object_id,`)
                let formulasInfo = {
                    formula: formula,
                    distinct: false,
                }
                prms.push(formulasApi.execute(formulasInfo));

            }
            Promise.all(prms)
                .then((res) => {
                    self.postMessage({
                        action: 'handleGetDataGroup',
                        data: res
                    });
                })
                .catch((err) => {
                    console.error(err);
                });

        } catch (error) {
            console.error(error);
            return false
        }

    },
    async getEventScheduler(schedulerConfig) {
        try {
            let query = {
                isOptimize: true,
                getDataForAllColumn: true,
                isTranslateUser: 0,
                filter: [{
                        column: schedulerConfig.cardConfig.start_date.field,
                        operation: 'and',
                        conditions: [{
                            name: 'less_than',
                            value: schedulerConfig.schedulerSate.max_date

                        }
                        ]
                    },
                    {
                        column: schedulerConfig.cardConfig.end_date.field,
                        operation: 'and',
                        conditions: [
                        {
                            name: 'greater_than_or_equal',
                            value: schedulerConfig.schedulerSate.min_date
    
                        }
                        ]
                    }
                ],
                pageSize: 3000
            };
            if(schedulerConfig.treeConfig){
                var queryTree = util.cloneDeep(query);
                queryTree.columns = schedulerConfig.treeConfig
                queryTree.groupBy = schedulerConfig.treeConfig
                queryTree = qs.stringify(queryTree);
            }
            if (schedulerConfig.groupFilter) {
                query.filter = [...query.filter, ...schedulerConfig.groupFilter]
            }
            if (schedulerConfig.filter) {
                query = this.addFilterQuery(query, schedulerConfig);
            }
            query = qs.stringify(query);



            // get tất cả bản ghi trong một khoảng thời gian và get tất cả bản ghi recurring có trong database recurring 
            // sau đó map id bản ghi từ hai kết quả trả về thu được Map với key là id bản ghi và value là thông tin chi tiết của bản ghi 
            // nếu bản ghi có recurring value sẽ được thêm các trường cần thiết để tạo event recurring.
            if(schedulerConfig.treeConfig){
                var [listObjectDocument, listRecConfig, listObjectRec, listTree] = await Promise.all([documentApi.getListDocumentObject(schedulerConfig.idDoc, `?` + query), schedulerApi.getRecurring(), schedulerApi.getEventRecurringByFilter(schedulerConfig.schedulerSate.min_date, schedulerConfig.schedulerSate.max_date), documentApi.getListDocumentObject(schedulerConfig.idDoc, `?` + queryTree)])
            }else {
                var [listObjectDocument, listRecConfig, listObjectRec] = await Promise.all([documentApi.getListDocumentObject(schedulerConfig.idDoc, `?` + query), schedulerApi.getRecurring(), schedulerApi.getEventRecurringByFilter(schedulerConfig.schedulerSate.min_date, schedulerConfig.schedulerSate.max_date)])
            }
            let listEvents = []
            if (listObjectDocument.status == 200) {
                var map = new Map(); // or var map = {};
                for (var i = 0; i < listObjectDocument.data['listObject'].length; i++) {
                    let value_x = listObjectDocument.data.listObject[i];
                    map.set(listObjectDocument.data.listObject[i].document_object_id, value_x)
                }

                // lấy những id bản ghi có recurring mà sự kiện ảo của nó được hiển thị tại khoảng thời gian xem mix, max date
                var arr = listObjectRec.data
                var clean = arr.filter((arr, index, self) => index === self.findIndex((t) => (t.id === arr.id)))
                // tạo mảng id  bản ghi để filter phục vụ chức năng lọc 
                var listIdClean = []
                for (var i = 0; i < clean.length; i++) {
                    listIdClean.push(clean[i].id)
                }

                // query theo id bản ghi và filter từ người dùng.
                if (listIdClean.length) {
                    try {
                        let queryListId = {
                            isOptimize: true,
                            getDataForAllColumn: true,
                            isTranslateUser: 0,
                            filter: [{
                                column: 'document_object_id',
                                operation: 'and',
                                conditions: [{
                                    name: 'in',
                                    value: listIdClean
                                }
                                ]
                            }],
                            pageSize: 3000
                        }
                        if (schedulerConfig.groupFilter) {
                            queryListId.filter = [...queryListId.filter, ...schedulerConfig.groupFilter]
                        }
                        if (schedulerConfig.filter) {
                            queryListId = this.addFilterQuery(queryListId, schedulerConfig);
                        }
                        queryListId = qs.stringify(queryListId);

                        // thông tin nhận được cũng được thêm vào Map theo key , value
                        let z = await documentApi.getListDocumentObject(schedulerConfig.idDoc, `?` + queryListId)

                        for (var i = 0; i < z.data['listObject'].length; i++) {
                            let value_z = z.data.listObject[i];
                            map.set(z.data.listObject[i].document_object_id, value_z)

                        }
                    } catch (error) {
                        console.error(error);
                        return false
                    }
                }


                // Thêm các trường thông tin cấu hình recurring vào Map .
                for (var i = 0; i < listRecConfig.data.length; i++) {
                    delete listRecConfig.data[i].id
                    if (map.get(listRecConfig.data[i].id_event)) {
                        let value_y = Object.assign(map.get(listRecConfig.data[i].id_event), listRecConfig.data[i])
                        map.set(listRecConfig.data[i].id_event, value_y)
                    } else {
                        map.set(listRecConfig.data[i].id_event, listRecConfig.data[i])
                    }

                }

                map.forEach((value, key) => {
                    if (value['rec_type'] == "none") {
                        let event = {}
                        event.id = value.id_event
                        event.text = value.text
                        event.start_date = value.start_date;
                        event.event_length = value.event_length;
                        event.event_pid = value.event_pid;
                        event.rec_type = value.rec_type;
                        event.end_date = value.end_date
                        event.originRowData = value;
                        listEvents.push(event)
                    }
                    else if (value['rec_type'] == "" && map.get(value.event_pid).document_object_id) {
                        let event = {}
                        event.id = value.id_event
                        event.text = value.text
                        event.start_date = value.start_date;
                        event.event_length = value.event_length;
                        event.event_pid = value.event_pid;
                        event.rec_type = value.rec_type;
                        event.end_date = value.end_date;
                        event.originRowData = map.get(value['event_pid']);
                        event.colorConfig = {
                            start_date: {
                                color: "",
                                background: ""
                            },
                            end_date: {
                                color: "",
                                background: ""
                            },
                            text: {
                                color: "",
                                background: ""
                            },
                            backgroundAll: "",
                        },
                            event.date = map.get(value['event_pid'])[schedulerConfig.cardConfig.start_date.field];
                        if (schedulerConfig.cardConfig.other && map.get(value['event_pid'])[schedulerConfig.cardConfig.other.field]) {
                            event.other = map.get(value['event_pid'])[schedulerConfig.cardConfig.other.field]
                        }
                        if (schedulerConfig.cardConfig.type && map.get(value['event_pid'])[schedulerConfig.cardConfig.type.field]) {
                            event.type = map.get(value['event_pid'])[schedulerConfig.cardConfig.type.field]
                        }
                        listEvents.push(event)
                    }
                    else if ((value[schedulerConfig.cardConfig.end_time.field] && value[schedulerConfig.cardConfig.start_time.field] && value[schedulerConfig.cardConfig.start_date.field] && value[schedulerConfig.cardConfig.end_date.field] && schedulerConfig.cardConfig.start_time.type == 'time' && schedulerConfig.cardConfig.end_time.type == 'time')) {
                        // event start - end nằm trong khoảng date view -> add date view để hiển thị trên view timeline
                        let date = schedulerConfig.schedulerSate.min_date
                        let event = {
                            id: value.document_object_id,
                            text: value[schedulerConfig.cardConfig.title.field],
                            start_date: value[schedulerConfig.cardConfig.start_date.field] + ' ' + value[schedulerConfig.cardConfig.start_time.field],
                            end_date: value[schedulerConfig.cardConfig.end_date.field] + ' ' + value[schedulerConfig.cardConfig.end_time.field],
                            colorConfig: {
                                start_date: {
                                    color: "",
                                    background: ""
                                },
                                end_date: {
                                    color: "",
                                    background: ""
                                },
                                text: {
                                    color: "",
                                    background: ""
                                },
                                backgroundAll: "",
                            },
                            date: date
                        }
                        if(schedulerConfig.treeConfig){
                            event.treeId = ''
                            schedulerConfig.treeConfig.map(c=>{
                                event.treeId += value[c] + '_'
                            })
                            event.treeId = event.treeId.slice(0, -1); 
                        }
                        if (schedulerConfig.cardConfig.other && value[schedulerConfig.cardConfig.other.field]) {
                            event.other = value[schedulerConfig.cardConfig.other.field]
                        }
                        if (schedulerConfig.cardConfig.type && value[schedulerConfig.cardConfig.type.field]) {
                            event.type = value[schedulerConfig.cardConfig.type.field]
                        }

                        if ((value['rec_type'] != "none") && (value['rec_type'] != null) && (value['rec_type'] != undefined)) {
                            event.start_date = value.start_date;
                            event.event_length = value.event_length;
                            event.event_pid = value.event_pid;
                            event.rec_type = value.rec_type;
                            event.end_date = value.end_date
                        }
                        event.originRowData = value;
                        listEvents.push(event)
                    }
                })
                this.calcConditionalFormat({ events: listEvents, config: schedulerConfig });
            }
            let data = { schedulerSate: schedulerConfig.schedulerSate, listEvents: listEvents}
            if(schedulerConfig.treeConfig){
                data.listTree = listTree.data.listObject
            }
            self.postMessage({
                action: 'handleGetEventScheduler',
                data: data
            });
        } catch (error) {
            console.error(error);
            return false
        }

    },
    getMapCardFieldToFormat(config, mapCtrlNameToCardField) {
        let formatConfig = config.conditionalFormat;
        let rsl = {
            backgroundAll: [],
            fields: {}
        };
        for (let item of formatConfig) {
            if (item.isSelected) {
                if (item.checkboxSelected.includes("background")) {
                    item.displayMode.singleColor.jsCondition = treeConditionToJSString.treeItemToJSCondition(item.displayMode.singleColor.originCondition, 'field');
                    rsl.backgroundAll.push(item.displayMode.singleColor);
                }

                if (item.checkboxSelected.includes("control")) {
                    for (let col of item.tableColumns) {
                        if (col.isSelected) {
                            if (col.field) {
                                let newKey = mapCtrlNameToCardField[col.field];
                                if (newKey) {
                                    if (!rsl.fields[newKey]) {
                                        rsl.fields[newKey] = [];
                                    }
                                    item.displayMode.singleColor.jsCondition = treeConditionToJSString.treeItemToJSCondition(item.displayMode.singleColor.originCondition, 'field');
                                    rsl.fields[newKey].push(item.displayMode.singleColor);
                                }
                            }
                        }
                    }
                }
            }
        }
        return rsl;
    },
    calcConditionalFormat(data) {
        let mapCtrlNameToCardField = {};
        for (let cardField in data.config.cardConfig) {
            mapCtrlNameToCardField[data.config.cardConfig[cardField].field] = mapKeyCardRevert[cardField];
        }
        let mapCardFieldToFormat = this.getMapCardFieldToFormat(data.config, mapCtrlNameToCardField);

        // row: từng task
        for (let cardData of data.events) {
            var row = cardData.originRowData;
            // key: tên của filed trong card
            for (let key22 in mapCardFieldToFormat.fields) {
                // cond: cấu hình điều kiện
                for (let cond of mapCardFieldToFormat.fields[key22]) {
                    let condValue = eval(cond.jsCondition);
                    if (condValue && cardData.colorConfig[key22]) {
                        let style = treeConditionToJSString.objStyleToCSSStyle(cond);
                        style.background = style.backgroundColor;
                        delete style.backgroundColor;
                        cardData.colorConfig[key22] = Object.assign(cardData.colorConfig[key22], style);
                    }
                }
            }
            if (mapCardFieldToFormat.backgroundAll.length) {
                for (let bgStyleItem of mapCardFieldToFormat.backgroundAll) {
                    if (eval(bgStyleItem.jsCondition)) {
                        cardData.colorConfig.backgroundAll = bgStyleItem.backgroundColor;
                    }
                }
            }
            if (data.config.cardConfig.user && data.config.cardConfig.user.type == 'user') {
                cardData.user = row[data.config.cardConfig.user.field]
                let userName = data.config.allUsers.filter(user => user.id == cardData.user)
                if (userName.length > 0) {
                    cardData.userName = userName[0].displayName
                }
            }
        }
        if (data.config.updateEvent) {
            self.postMessage({
                action: 'handleGetNewFormatForAEvent',
                data: data.events
            });
        }
        return data.events
    },
    async updateDocumentAfterAdded(config) {
        try {
            let dataControl = {};
            dataControl[config.cardConfig.start_date.field] = config.event.start_date_formated;
            dataControl[config.cardConfig.end_date.field] = config.event.end_date_formated;
            dataControl[config.cardConfig.start_time.field] = config.event.start_time_formated;
            dataControl[config.cardConfig.end_time.field] = config.event.end_time_formated;

            let dataPost = {};
            dataPost["documentId"] = config.idDoc;
            dataPost["documentObjectWorkflowObjectId"] = "";
            dataPost["documentObjectWorkflowId"] = "";
            dataPost["documentObjectTaskId"] = "";
            dataPost["dataControl"] = JSON.stringify(dataControl);


            try {
                let res = await documentApi.updateDocument(config.event.id, dataPost)
                if (res.status == 200) {
                    self.postMessage({
                        action: 'handleUpdateDocument',
                        data: {
                            document: res.data,
                            event: config.event
                        }
                    });
                } else return false
            } catch (error) {
                console.error(error)
                return false
            }
        } catch (error) {
            console.error(error);
            return false
        }
    },
    async updateDocument(config) {
        try {
            let dataControl = {};
            dataControl[config.cardConfig.start_date.field] = config.event.start_date_formated;
            dataControl[config.cardConfig.end_date.field] = config.event.end_date_formated;
            dataControl[config.cardConfig.start_time.field] = config.event.start_time_formated;
            dataControl[config.cardConfig.end_time.field] = config.event.end_time_formated;
            if(config.treeConfig && config.event.treeId){
                dataControl[config.treeConfig[config.treeConfig.length - 1]] = config.event.treeId.split('_')[config.treeConfig.length - 1]
            }
            let dataPost = {};
            dataPost["documentId"] = config.idDoc;
            dataPost["documentObjectWorkflowObjectId"] = "";
            dataPost["documentObjectWorkflowId"] = "";
            dataPost["documentObjectTaskId"] = "";
            dataPost["dataControl"] = JSON.stringify(dataControl);


            try {
                let res = await documentApi.updateDocument(config.event.id, dataPost)
                if (res.status == 200) {
                    if (!config.event.originRowData || JSON.stringify(config.event.originRowData) == '{}') {
                        let docObject = await documentApi.detailDocumentObject(config.event.id)
                        if (docObject.status == 200) {
                            self.postMessage({
                                action: 'handleUpdateDocument',
                                data: {
                                    document: docObject.data,
                                    event: config.event
                                }
                            });
                        } else return false
                    } else {
                        self.postMessage({
                            action: 'handleUpdateDocument',
                            data: {
                                document: config.event.originRowData,
                                event: config.event
                            }
                        });
                    }
                } else return false
            } catch (error) {
                console.error(error)
                return false
            }
        } catch (error) {
            console.error(error);
            return false
        }
    },
    async updateDocumentAfterRunFormula(config) {
        try {
            let docObject = await documentApi.detailDocumentObject(config.idObject)
            if (docObject.status == 200) {
                self.postMessage({
                    action: 'handleUpdateDocumentAfterRunFormula',
                    data: {
                        document: docObject.data,
                        idObject: config.idObject
                    }
                });
            } else return false
        } catch (error) {
            console.error(error)
            return false
        }
    },
    async runFormularUpdate(data) {
        let dataInput = data.dataInput
        let formula = new Formulas('', data.formulas.script.value, '');
        let inputControl = formula.inputControl;
        for (let control in inputControl) {
            inputControl[control] = dataInput[control]
        }
        let fomulasInfo = {
            formula: data.formulas.script.value,
            distinct: false,
            data_input: JSON.stringify(inputControl)
        }
        let res = await formulasApi.execute(fomulasInfo)
        if (res.status != 200) {
            return false;
        } else {
            if (res.data && res.data.data) {
                self.postMessage({
                    action: 'handleRunFormulaUpdateSuccess',
                    data: res.data.data
                });
            }
            return false;
        }

    },
    async handleCopyEvent(data) {
        try {
            // lấy detail của doc để đúng với data mới nhất của bản ghi, đủ các trường thông tin - control ko tích thuộc tính quan trọng, control table 
            let docObject = await documentApi.detailDocumentObject(data.event.id)
            if (docObject.status == 200) {
                let dataControl = docObject.data;
                if (data.eventEdit) {
                    dataControl[data.cardConfig.start_date.field] = data.eventEdit.start_date_formated;
                    dataControl[data.cardConfig.end_date.field] = data.eventEdit.end_date_formated;
                    dataControl[data.cardConfig.start_time.field] = data.eventEdit.start_time_formated;
                    dataControl[data.cardConfig.end_time.field] = data.eventEdit.end_time_formated;
                }
                else {
                    dataControl[data.cardConfig.start_date.field] = data.event.start_date_formated;
                    dataControl[data.cardConfig.end_date.field] = data.event.end_date_formated;
                    dataControl[data.cardConfig.start_time.field] = data.event.start_time_formated;
                    dataControl[data.cardConfig.end_time.field] = data.event.end_time_formated;
                }

                try {
                    let res = await documentApi.cloneObject({data: JSON.stringify(dataControl)})
                    if (res.status == 200) {
                        self.postMessage({
                            action: 'handleAfterCopyEventSuccess',
                            data: res
                        });
                    } else return false
                } catch (error) {
                    console.error(error)
                    return false
                }
            } else return false

        } catch (error) {
            console.error(error);
            return false
        }
    },
    addFilterQuery(query, schedulerConfig) {
        let sorts = {};
        let filterItem = schedulerConfig.filter
        // Tìm các cột được sort
        for (let col of filterItem.rawConfigs.setting.column.selectedColums) {
            if (col.sort != 'none') {
                sorts[col.name] = {
                    column: col.name,
                    type: col.sort
                };
            }
        }

        // Tìm các cột được lọc
        let selfFilterConfig = filterItem.sharedConfigs.computedSelfFilterConfig;
        if (Array.isArray(selfFilterConfig)) {
            for (let item of selfFilterConfig) {
                if (checkColumnHasFilter(item.config)) {
                    let newFilter = convertDisplayFilterToQuery(item.col.name, item.config);
                    newFilter.dataType = item.col.type
                    query.filter.push(newFilter);
                }
            }
        }
        query.sort = Object.values(sorts);

        return query;
    },
    async insertDocuemntWhenDragFromTree(config) {
        try {
            if (config.objectDoc.title) {
                let dataControl = {};
                dataControl[config.cardConfig.title.field] = config.objectDoc.title
                if (config.objectDoc.assignee && config.cardConfig.user) {
                    dataControl[config.cardConfig.user.field] = config.objectDoc.assignee
                }
                if (config.objectDoc.type && config.cardConfig.type) {
                    dataControl[config.cardConfig.type.field] = config.objectDoc.type
                }
                if (config.objectDoc.detail && config.cardConfig.other) {
                    dataControl[config.cardConfig.other.field] = config.objectDoc.detail
                }
                dataControl[config.cardConfig.start_date.field] = config.event.start_date_formated;
                dataControl[config.cardConfig.end_date.field] = config.event.end_date_formated;
                dataControl[config.cardConfig.start_time.field] = config.event.start_time_formated;
                dataControl[config.cardConfig.end_time.field] = config.event.end_time_formated;
                let dataPost = {};
                dataPost["documentId"] = config.idDoc;
                dataPost["documentObjectWorkflowObjectId"] = "";
                dataPost["documentObjectWorkflowId"] = "";
                dataPost["documentObjectTaskId"] = "";
                dataPost["dataControl"] = JSON.stringify(dataControl);
                dataPost['dataInputFormulas'] = '{"dataInputTitle":{}}';
                dataPost['otherData'] = '{"hiddenControls":[],"readOnlyControls":{},"documentInstanceIdentifier":[],"listInputFilters":{}}';

                try {
                    let res = await documentApi.submitDocument(dataPost)
                    if (res.status == 200) {
                        self.postMessage({
                            action: 'handleInsetDocumentWhenDragFromTree',
                            data: { dataObject: res.data, event: config.event }
                        });
                    } else return false
                } catch (error) {
                    console.error(error)
                    return false
                }
            } else {
                self.postMessage({
                    action: 'handleInsetDocumentWhenDragFromTree',
                    data: config.event
                });
            }
        } catch (error) {
            console.error(error);
            return false
        }
    },
    async deleteEvent(id) {
        try {
            let res = await documentApi.deleteDocumentObject({ objectIds: JSON.stringify([id]) });
        } catch (error) {
            console.error(error);
            return false
        }
    },
};
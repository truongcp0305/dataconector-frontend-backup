import importApi from '@/api/ImportExcel';
self.onmessage = async function (event) {
    var workerDataReceive = event.data;
    let action = workerDataReceive.action;
    let data = workerDataReceive.data;
    switch (action) {
        case 'getMappingTable':
            let mapping = await getMappingTable(data);
            await postMessage({
                action: 'getMappingTable',
                dataAfter: mapping,
            });
            break;
        case 'getLastData':
            let lastData = await getLastData(data);
            await postMessage({ action: 'getLastData', dataAfter: lastData });
            break;
        case 'import':
            let dataImport = await handleBeforeImport(data);
            await postMessage({ action: 'import', dataAfter: dataImport });
            break;
        default:
            break;
    }
};
export const handleBeforeImport = async function (data) {
    let dataImport = {
        data: '',
        message: '',
    };
    let cleanedTables = data.data.tables.map((t, idx) => ({
        ...(idx !== 0 && {
            name: t.name,
        }),
        keyColumn: t.keyColumn
            ? t.keyColumn
            : { enable: false, index: -1, name: '' },
        sheetMap: t.sheetMap.name,
        controls: t.controls.map((c) => ({
            ...c,
            dataColumn: c.dataColumn
                ? {
                    name: c.dataColumn.name,
                    index: c.dataColumn.index,
                }
                : null,
        })),
    }));
    let general = [];
    for (let i = 0; i < cleanedTables.length; i++) {
        if (!cleanedTables[i].sheetMap) {
            continue;
        }
        let tb = Object.assign({}, cleanedTables[i]);
        tb.controls = [];
        for (let j = 0; j < cleanedTables[i].controls.length; j++) {
            if (
                cleanedTables[i].controls[j].dataColumn != null &&
                cleanedTables[i].controls[j].dataType != 'table'
            ) {
                tb.controls.push(cleanedTables[i].controls[j]);
            }
        }
        general.push(tb);
    }
    dataImport = {
        data: {
            fileName: data.data.fileName,
            subObjType: data.data.subObjType,
            documentName: data.data.documentName,
            key: data.data.key,
            nameImport: data.data.nameImport,
            description: data.data.description,
            objId: data.data.objId,
            typeImport: data.data.typeImport,
            objType: data.data.objType,
            mode: 'full',
            mapping: {
                general: general[0],
                tables: general[1] ? general.slice(1, general.length) : [],
            },
        },
        message: '',
    };
    let check = checkValidate(data.data.tables);
    if (check.check) {
        dataImport.message = check.message;
    }

    return dataImport;
};

// kiểm tra điền khóa và các cột trong table
export const checkValidate = function (tables) {
    let errorMessage = '';
    let check = true;
    if (tables[0].sheetMap == '') {
        errorMessage = '* Điền thiếu trường thông tin chung';
        check = false;
    }
    if (tables.objType == 'document') {
        for (let i = 0; i < tables.length; i++) {
            if (
                tables[i].keyColumn == undefined ||
                tables[i].keyColumn.index == -1
            ) {
                // kiểm tra khóa cho bảng thông tin chung
                if (tables[i] == tables[0] && tables.length > 1) {
                    errorMessage = '* Bạn chưa chọn khóa cho thông tin chung';
                    check = false;
                } else {
                    if (checkKeyRequired(tables[i])) {
                        errorMessage =
                            '* Bạn chưa chọn khóa cho bảng ' + tables[i].name;
                        check = false;
                    }
                }
            }
            for (let j = 0; j < tables[i].controls.length; j++) {
                if (
                    !tables[i].controls[j].isNull &&
                    tables[i].controls[j].dataColumn == null
                ) {
                    check = false;
                    errorMessage =
                        '* Bạn chưa điền trường bắt buộc cho bảng ' +
                        tables[i].name;
                }
            }
        }
    }
    return {
        check: check,
        message: errorMessage,
    };
};
// kiểm tra có cần điền key không
export const checkKeyRequired = function (tables) {
    let check = false;
    for (let i = 0; i < tables.controls.length; i++) {
        if (!tables.controls[i].isNull) {
            check = true;
        }
    }
    return check;
};

// lưu tất cả dữ liệu mapping lần cuối vào lastTable
export const getLastData = async function (objId) {
    let lastTable = [];
    let lastNameSheet = [];
    let lastKey = [];
    let res = await importApi.getMapping(objId);
    if (res.status === 200) {
        let mapping = JSON.parse(res.data[0].mapping);
        mapping = mapping.mapping;
        let row = [];
        lastNameSheet.push(mapping.general.sheetMap);
        if (mapping.general.keyColumn) {
            lastKey.push({
                enable: mapping.general.keyColumn.enable,
                index: mapping.general.keyColumn.index,
                name: mapping.general.keyColumn.name,
                nameSheet: mapping.general.sheetMap,
                nameTable: 'Thông tin chung',
            });
        }
        for (let i = 0; i < mapping.general.controls.length; i++) {
            row.push({
                controlName: mapping.general.controls[i].name,
                nameSheet: mapping.general.sheetMap,
                nameTable: 'Thông tin chung',
                dataColumn: mapping.general.controls[i].dataColumn.name,
            });
        }
        if (mapping.tables) {
            for (let i = 0; i < mapping.tables.length; i++) {
                lastNameSheet.push(mapping.tables[i].sheetMap);
                if (mapping.tables[i].keyColumn) {
                    let nameLastKeyTables = mapping.tables[i].keyColumn.name;
                    lastKey.push({
                        name: nameLastKeyTables,
                        index: -1,
                        enable: false,
                        nameSheet: mapping.tables[i].sheetMap,
                    });
                }
                for (let j = 0; j < mapping.tables[i].controls.length; j++)
                    row.push({
                        nameSheet: mapping.tables[i].sheetMap,
                        controlName: mapping.tables[i].controls[j].name,
                        dataColumn:
                            mapping.tables[i].controls[j].dataColumn.name,
                        nameTable: mapping.tables[i].name,
                    });
            }
        }
        lastTable = row;
    }

    return {
        lastKey: lastKey,
        lastTable: lastTable,
        lastNameSheet: lastNameSheet,
    };
};
//phần mapping---hàm so sánh tên cột trong danh sách file excel và tên cột trong mapping
export const getMappingTable = async function (data) {
    let column = data.nameColumnDetail;
    column = JSON.stringify(column);
    let columnAr = data.nameColumnDetail;
    let nameSheets = [];
    if (columnAr) {
        columnAr = Object.values(columnAr);
        if (column.length > 2) {
            for (let i = 0; i < data.tables.length; i++) {
                for (let j = 0; j < data.lastTable.length; j++) {
                    if (data.lastTable[j].nameTable == data.tables[i].name) {
                        for (
                            let k = 0;
                            k < data.tables[i].controls.length;
                            k++
                        ) {
                            if (
                                data.tables[i].controls[k].name ==
                                data.lastTable[j].controlName
                            ) {
                                nameSheets = hideNameSheet(
                                    data.lastTable[j].nameSheet,
                                );
                                data.tables[i].sheetMap = {
                                    name: '',
                                    enable: false,
                                };
                                data.tables[i].controls[k].dataColumn = {
                                    name: '',
                                    index: 0,
                                    enable: false,
                                };
                                data.tables[i].sheetMap.name =
                                    data.lastTable[j].nameSheet;
                                data.tables[i].controls[k].dataColumn.name =
                                    data.lastTable[j].dataColumn;
                                data.tables[i].controls[k].dataColumn.index =
                                    getIndexColumnMapping(
                                        data.lastTable[j].dataColumn,
                                        data.tables[i].sheetMap.name,
                                        data.nameColumnDetail,
                                    ).index;
                                getIndexColumnMapping(
                                    data.lastTable[j].dataColumn,
                                    data.tables[i].sheetMap.name,
                                    data.nameColumnDetail,
                                ).nameColumnDetail = false;
                            }
                        }
                    }
                }
            }
            data.tables[0] = getLastKeyGeneral(
                data.tables,
                data.lastTable,
                data.lastKey,
                data.nameColumnDetail,
            );
            // data.tables = lastKeyGeneral.tables;
        } else {
            console.error('Không có file Mapping');
        }
    }

    return {
        tables: data.tables,
        nameSheets: nameSheets,
    };
};
//checkSheet có tồn tại
export const checkNameSheetExist = function (nameSheet, nameSheets) {
    let check = false;
    for (let j = 0; j < nameSheets.length; j++) {
        if (nameSheets[j].name == nameSheet) {
            check = true;
        }
    }
    return check;
};

// gắn lại thuộc tính ẩn cho namesheet
export const hideNameSheet = function (value, nameSheets) {
    for (let i = 0; i < nameSheets.length; i++) {
        if (nameSheets[i].name == value) {
            nameSheets[i].enable = false;
        }
    }
    return nameSheets;
};
//phần mapping --- hàm tìm index mới cho cột
export const getIndexColumnMapping = function (
    value,
    nameSheet,
    nameColumnDetail,
) {
    let arr = nameColumnDetail[nameSheet];
    for (let j = 0; j < arr.length; j++) {
        if (arr[j].name == value) {
            return {
                index: arr[j].index,
                nameColumnDetail: nameColumnDetail[nameSheet][j].enable,
            };
        }
    }
};
export const getLastKeyGeneral = function (
    tables,
    lastTable,
    lastKey,
    nameColumnDetail,
) {
    if (
        tables[0].sheetMap.name == lastTable[0].nameSheet &&
        checkNameSheetExist(lastTable[0].nameSheet)
    ) {
        tables[0].keyColumn.name = lastKey[0].name;
        tables[0].keyColumn.enable = true;
        tables[0].keyColumn.index = getIndexColumnMapping(
            lastKey[0].name,
            tables[0].sheetMap.name,
            nameColumnDetail,
        );
        return tables;
    }
};
// hàm xử lý key từng bảng con, so sánh với dòng trong excel nếu trùng thì set sheetMap
export const getLastKeyTables = function (
    lastKey,
    nameSheets,
    nameColumnDetail,
) {
    // kiểm tra để lấy key
    let newLastKeyTables = [];
    for (let i = 1; i < lastKey.length; i++) {
        for (let j = 0; j < nameSheets.length; j++) {
            let arr = nameColumnDetail[nameSheets[j].name];
            for (let k = 0; k < arr.length; k++) {
                if (arr[k].name == lastKey[i].name) {
                    newLastKeyTables.push({
                        name: lastKey[i].name,
                        sheet: nameSheets[j].name,
                        index: arr[k].index,
                        enable: true,
                    });
                }
            }
        }
    }
    //let newLastKeyTables = newLastKeyTables;
    //đẩy key
    for (let i = 1; i < tables.length; i++) {
        for (let j = 0; j < newLastKeyTables.length; j++) {
            if (
                tables[i].sheetMap &&
                tables[i].sheetMap.name == newLastKeyTables[j].sheet
            ) {
                tables[i].keyColumn.name = newLastKeyTables[j].name;
                tables[i].keyColumn.enable = true;
                tables[i].keyColumn.index = newLastKeyTables[j].index;
            }
        }
    }
    return {
        newLastKeyTables: newLastKeyTables,
        tables: tables,
    };
};

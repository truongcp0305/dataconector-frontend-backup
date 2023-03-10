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

// ki???m tra ??i???n kh??a v?? c??c c???t trong table
export const checkValidate = function (tables) {
    let errorMessage = '';
    let check = true;
    if (tables[0].sheetMap == '') {
        errorMessage = '* ??i???n thi???u tr?????ng th??ng tin chung';
        check = false;
    }
    if (tables.objType == 'document') {
        for (let i = 0; i < tables.length; i++) {
            if (
                tables[i].keyColumn == undefined ||
                tables[i].keyColumn.index == -1
            ) {
                // ki???m tra kh??a cho b???ng th??ng tin chung
                if (tables[i] == tables[0] && tables.length > 1) {
                    errorMessage = '* B???n ch??a ch???n kh??a cho th??ng tin chung';
                    check = false;
                } else {
                    if (checkKeyRequired(tables[i])) {
                        errorMessage =
                            '* B???n ch??a ch???n kh??a cho b???ng ' + tables[i].name;
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
                        '* B???n ch??a ??i???n tr?????ng b???t bu???c cho b???ng ' +
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
// ki???m tra c?? c???n ??i???n key kh??ng
export const checkKeyRequired = function (tables) {
    let check = false;
    for (let i = 0; i < tables.controls.length; i++) {
        if (!tables.controls[i].isNull) {
            check = true;
        }
    }
    return check;
};

// l??u t???t c??? d??? li???u mapping l???n cu???i v??o lastTable
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
                nameTable: 'Th??ng tin chung',
            });
        }
        for (let i = 0; i < mapping.general.controls.length; i++) {
            row.push({
                controlName: mapping.general.controls[i].name,
                nameSheet: mapping.general.sheetMap,
                nameTable: 'Th??ng tin chung',
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
//ph???n mapping---h??m so s??nh t??n c???t trong danh s??ch file excel v?? t??n c???t trong mapping
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
            console.error('Kh??ng c?? file Mapping');
        }
    }

    return {
        tables: data.tables,
        nameSheets: nameSheets,
    };
};
//checkSheet c?? t???n t???i
export const checkNameSheetExist = function (nameSheet, nameSheets) {
    let check = false;
    for (let j = 0; j < nameSheets.length; j++) {
        if (nameSheets[j].name == nameSheet) {
            check = true;
        }
    }
    return check;
};

// g???n l???i thu???c t??nh ???n cho namesheet
export const hideNameSheet = function (value, nameSheets) {
    for (let i = 0; i < nameSheets.length; i++) {
        if (nameSheets[i].name == value) {
            nameSheets[i].enable = false;
        }
    }
    return nameSheets;
};
//ph???n mapping --- h??m t??m index m???i cho c???t
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
// h??m x??? l?? key t???ng b???ng con, so s??nh v???i d??ng trong excel n???u tr??ng th?? set sheetMap
export const getLastKeyTables = function (
    lastKey,
    nameSheets,
    nameColumnDetail,
) {
    // ki???m tra ????? l???y key
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
    //?????y key
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

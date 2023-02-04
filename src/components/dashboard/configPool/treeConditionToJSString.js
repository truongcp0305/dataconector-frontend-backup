var logicalOperand = {
    AND: ' && ',
    OR: ' || ',
};
var mappingOperator = {
    '>': 'greaterthan',
    '>=': 'greaterthanorequal',
    '<': 'lessthan',
    '<=': 'lessthanorequal',
    '=': 'equal',
    '!=': 'isnot',
    '<>': 'isnot',
};

export default {
    mo: {
        isall: (cellValue, userValue) => {
            return true;
        },
        is: (cellValue, userValue) => {
            return String(cellValue) == userValue;
        },
        isnot: (cellValue, userValue) => {
            return String(cellValue) != userValue;
        },
        equal: (cellValue, userValue) => {
            return String(cellValue) == userValue;
        },
        lessthan: (cellValue, userValue) => {
            return String(cellValue) < userValue;
        },
        lessthanorequal: (cellValue, userValue) => {
            return String(cellValue) <= userValue;
        },
        greaterthan: (cellValue, userValue) => {
            return String(cellValue) > userValue;
        },
        greaterthanorequal: (cellValue, userValue) => {
            return String(cellValue) >= userValue;
        },
        isblank: (cellValue) => {
            return (
                String(cellValue) === '' ||
                cellValue === null ||
                cellValue === undefined
            );
        },
        notblank: (cellValue) => {
            return (
                String(cellValue) !== '' &&
                cellValue !== null &&
                cellValue !== undefined
            );
        },
        startwith: (cellValue, userValue) => {
            return String(cellValue).startsWith(userValue);
        },
        notstartwith: (cellValue, userValue) => {
            return !cellValue.startsWith(userValue);
        },
        endwith: (cellValue, userValue) => {
            return String(cellValue).endsWith(userValue);
        },
        notendwith: (cellValue, userValue) => {
            return !cellValue.endsWith(userValue);
        },
        contains: (cellValue, userValue) => {
            return String(cellValue).includes(userValue);
        },
        notcontains: (cellValue, userValue) => {
            return !cellValue.includes(userValue);
        },
        in: (cellValue, userValue) => {
            let arr =
                userValue === null || userValue === undefined
                    ? ['']
                    : String(userValue).split(',');
            return arr.includes(cellValue);
        },
        notin: (cellValue, userValue) => {
            let arr =
                userValue === null || userValue === undefined
                    ? ['']
                    : String(userValue).split(',');
            return !arr.includes(cellValue);
        },
        ILIKE: (cellValue, userValue) => {
            return String(cellValue)
                .toLowerCase()
                .includes(String(userValue).toLowerCase());
        },
    },
    objStyleToCSSStyle(obj) {
        let styleObj = {
            fontSize: `${obj.fontSize}px`,
            color: obj.fontColor,
            backgroundColor: obj.background
                ? obj.background
                : obj.backgroundColor,
        };

        if (obj.bold) {
            styleObj['fontWeight'] = 'bold';
        }

        if (obj.italic) {
            styleObj['fontStyle'] = 'italic';
        }

        if (obj.underline) {
            styleObj['textDecoration'] = 'underline';
        }

        if (obj.strike) {
            if (styleObj.textDecoration) {
                styleObj.textDecoration += ' line-through';
            } else {
                styleObj.textDecoration = ' line-through';
            }
        }
        return styleObj;
    },
    objStyleToHtmlStyle(obj) {
        let styleObj = {
            'font-size': `${obj.fontSize}px`,
            color: obj.fontColor,
            'background-color': obj.background
                ? obj.background
                : obj.backgroundColor,
        };
        if (obj.bold) {
            styleObj['font-weight'] = 'bold';
        }

        if (obj.italic) {
            styleObj['font-style'] = 'italic';
        }

        if (obj.underline) {
            styleObj['text-decoration'] = 'underline';
        }

        if (obj.strike) {
            if (styleObj.textDecoration) {
                styleObj['text-decoration'] += ' line-through';
            } else {
                styleObj['text-decoration'] = ' line-through';
            }
        }
        return styleObj;
    },
    treeItemToJSCondition(node, key = 'as', zeroValueDisplay = 0) {
        if (node.nodeType == 'item') {
            if (!node.operand) {
                node.operand = mappingOperator[node.operator]
                    ? mappingOperator[node.operator]
                    : node.operator;
            }
            if (!node.column) {
                return '';
            }
            let keyColumn = node.column[key].split('//')[0].trim();
            let varName = `row['${keyColumn}']`;
            let columnDataType = node.column.type;
            if (
                node.column.agg == 'count' ||
                node.column.agg == 'count_distinct'
            ) {
                columnDataType = 'number';
            }
            let value = node.value;
            if (
                columnDataType != 'number' ||
                (columnDataType == 'number' && isNaN(value))
            ) {
                value = `'${value}'`;
            }
            let functionName = node.operand;
            return ` mo.${functionName}(${varName}, ${value}) `;
        } else if (node.nodeType == 'group') {
            let arrCond = [];
            for (let childNode of node.children) {
                let itemCond = this.treeItemToJSCondition(
                    childNode,
                    key,
                    zeroValueDisplay,
                );
                arrCond.push(itemCond);
            }
            let opr = logicalOperand[node.name];
            let cond = arrCond.join(opr);
            if (cond.trim().length == 0) {
                return ` false `;
            } else {
                return ` (${cond}) `;
            }
        }
    },
    /**
     * Gán lại tên cho column trong condition để không bị lệch sau đặt tên
     */
    replaceColumnByOrigin(cond, mapSelectedCols) {
        if (cond.nodeType == 'group') {
            if (Array.isArray(cond.children)) {
                for (let child of cond.children) {
                    this.replaceColumnByOrigin(child, mapSelectedCols);
                }
            }
        } else if (
            mapSelectedCols[cond.column.uid] &&
            mapSelectedCols[cond.column.uid].field
        ) {
            cond.column.as = mapSelectedCols[cond.column.uid].field;
        }
        // }else{
        //     cond.column.as = mapSelectedCols[cond.column.uid].field;
        // }
    },
    addConditionFormatToColDef(
        coldDefs,
        style,
        mapNameToColumn,
        zeroValueDisplay = 0,
    ) {
        let columnNeedFormat =
            style.conditionalFormat.children.conditionalFormatCondition.value;
        let mapFormatCol = {};
        let mapSelectedCols = coldDefs.reduce((map, el) => {
            map[el.symperColumnName] = el;
            return map;
        }, {});
        for (let col of columnNeedFormat) {
            let uid = col.applyColumnUid;
            let uid2 = col.applyColumnObj.as;

            if (!mapFormatCol[uid]) {
                mapFormatCol[uid] = [];
            }

            if (!mapFormatCol[uid2]) {
                mapFormatCol[uid2] = [];
            }
            for (let cond of col.singleColorConfig) {
                this.replaceColumnByOrigin(cond.condition[0], mapSelectedCols);
                let colFormat = {
                    condition: this.treeItemToJSCondition(
                        cond.condition[0],
                        'as',
                        zeroValueDisplay,
                    ),
                    style: this.objStyleToCSSStyle(cond.style),
                };
                mapFormatCol[uid].push(colFormat);
                mapFormatCol[uid2].push(colFormat);
            }
        }
        for (let colDef of coldDefs) {
            if (mapFormatCol[colDef.symperColumnName]) {
                colDef.conditionalFormatInfo =
                    mapFormatCol[colDef.symperColumnName];
            }

            if (mapFormatCol[colDef.symperValueColumn]) {
                colDef.conditionalFormatInfo =
                    mapFormatCol[colDef.symperValueColumn];
            }
        }

        if (mapFormatCol['Format entire row']) {
            coldDefs.unshift({
                symperColumnName: 'Format entire row',
                formatConds: mapFormatCol['Format entire row'],
            });
        }
        return coldDefs;
    },
};

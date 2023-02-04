import { util } from '../../../plugins/util';
import NodeBase from './NodeBase';

export default class CreateableNewColumnNode extends NodeBase {
    newColumnNames = {}; // chứa map tên các cột mới được tạo ra trong quá trình chạy
    constructor(symperId, type, defaultConfig) {
        super(symperId, type, defaultConfig);
    }

    resetNewColumnNames() {
        this.newColumnNames = {};
    }

    getNewColumnName(name, title, mappAllCols, changeColGeneration = false) {
        if (!changeColGeneration) {
            return this.getNewColumnNameByTitle(title)
        }
        if (!mappAllCols[name]) {
            mappAllCols[name] = 1
            return name
        } else {
            let deltaStr = name.match(/_([0-9]+)$/g);
            let startIndex = 1;
            let newName = '';
            let originName = name;

            if (deltaStr) {
                startIndex = Number(deltaStr[0].replace('_', '')) + 1;
                originName = name.replace(/_([0-9]+)$/g, '');
            }

            for (let index = startIndex; index < 999999; index++) {
                newName = originName + '_' + index;
                if (!mappAllCols[newName]) {
                    mappAllCols[newName] = 1
                    return newName
                }
            }
        }
    }

    getNewColumnNameByTitle(name) {
        if (typeof name != 'string') {
            return '';
        }
        name = util.str.nonAccentVietnamese(name, true);
        let newName = name;

        if (this.newColumnNames[name]) {
            newName += '___' + this.newColumnNames[name];
            this.newColumnNames[name] += 1;
        } else {
            this.newColumnNames[name] = 1;
        }
        return newName;
    }

    getMapColFromInputs() {
        return this.input.reduce((map, col) => {
            map[col.columnName] = 1
            return map
        }, {})
    }
}

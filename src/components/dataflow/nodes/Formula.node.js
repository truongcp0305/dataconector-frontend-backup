import NodeBase from './NodeBase';
import _cloneDeep from 'lodash/cloneDeep';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';
import { util } from '@/plugins/util';

const defaultConfig = {
    addedColumns: [],
    allColumns: [],
    autoReplaceNullValue: true,
};

export default class Formula extends NodeBase {
    autoRemoveNullValue = true;
    constructor(symperId) {
        super(symperId, 'Formula', _cloneDeep(defaultConfig));
    }

    convertInputToConfigs() {
        /**
         * configs có dạng:
         * {
         *      
                addedColumns:{},
                allColumns:[] // lấy từ input
         * }
         */
        let addedColumns = [];
        if (this.lastConfigCache[0]) {
            addedColumns = this.lastConfigCache;
        }
        this.configs = Object.assign(this.configs, {
            addedColumns: addedColumns,
            allColumns: this.getAllColsFromInput(),
        });
        this.validateConfig();
    }

    getAllColsFromInput() {
        return this.input.reduce((map, el) => {
            map[el.uid] = el;
            return map;
        }, {});
    }

    process(source) {
        if (source == 'impact') {
            this.convertInputToConfigs();
        }

        if (!this.configs.allColumns.length) {
            this.configs.allColumns = this.getAllColsFromInput();
        }
        let outCols = [];
        let datasetId = this.configs.newIdDataset;
        for (let uid in this.configs.allColumns) {
            let item = this.configs.allColumns[uid];
            let newUid = datasetId + '_' + item.columnName;
            let newOutputCol = new NodeIO(
                datasetId,
                item.columnName,
                item.type,
                datasetId,
                item.title,
                newUid,
                this.id,
                item.trackId,
            );
            outCols.push(newOutputCol);
        }

        if (this.input.length == 0) {
            return [];
        }

        for (let item of this.configs.addedColumns) {
            if (item.columnAdd.type == 'new' && item.active !== false) {
                if (!item.trackId) {
                    item.trackId = util.str.randomString(10);
                }

                let newUid = datasetId + '_' + item.name;
                let newOutputCol = new NodeIO(
                    datasetId,
                    item.name,
                    item.type,
                    datasetId,
                    item.title,
                    newUid,
                    this.id,
                    null,
                    item.trackId,
                    true,
                );
                outCols.push(newOutputCol);
            }
        }
        this.setLastConfigCache();
        this.validateConfig();
        return outCols;
    }

    setLastConfigCache() {
        if (
            this.input.length > 0 ||
            (this.input.length == 0 && this.configs.addedColumns.length > 0)
        ) {
            this.lastConfigCache = _cloneDeep(this.configs.addedColumns);
        }
    }

    getConfigsToSave() {
        let rsl = this.getCommonProp();
        rsl = Object.assign(this.configs, rsl);
        return rsl;
    }

    getFullConfigsFromSavedData(configs) {
        if (Array.isArray(configs.addedColumns)) {
            for (let col of configs.addedColumns) {
                if (col.active === undefined) {
                    col.active = true;
                }
            }
        }
        return Object.assign(_cloneDeep(this.commonNodeProps), configs);
    }

    validateConfig() {
        let addedColumns = this.configs.addedColumns;
        let inputColMap = {};
        for (let uid in this.configs.allColumns) {
            let col = this.configs.allColumns[uid];
            inputColMap[col.columnName] = col;
        }

        for (let column of addedColumns) {
            let usedColumns = column.formula.match(/\[(.*?)\]/g);
            usedColumns = usedColumns ? usedColumns : [];
            let invalidCols = [];
            let detail = [];
            for (let colName of usedColumns) {
                colName = colName.replace(/\]/, '').replace(/\[/, '');
                if (!inputColMap[colName]) {
                    invalidCols.push(colName);
                    detail.push(`[${colName}]`);
                }
            }

            detail = detail.join(' , ');
            if (invalidCols.length > 0) {
                this.configs.errorList.notFoundColumns = invalidCols;
                column.invalidConfigs = `invalid columns:     ${detail}!`;
            } else {
                column.invalidConfigs = false;
            }
        }
    }
}

import _cloneDeep from 'lodash/cloneDeep';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';
import CreateableNewColumnNode from '@/components/dataflow/nodes/CreateableNewColumnNode.js';

const defaultConfig = {
    allColumns: [],
    groupBy: [],
    aggColumns: [],
    autoReplaceNullValue: true,
};
export default class SummarizeData extends CreateableNewColumnNode {
    autoRemoveNullValue = true;
    constructor(symperId) {
        super(symperId, 'Summarize', _cloneDeep(defaultConfig));
    }

    convertInputToConfigs() {
        let configs = this.configs;
        configs.groupBy = [];
        configs.aggColumns = [];
        configs.allColumns = this.input;

        configs = this.applyLastConfigCache(configs);
        this.configs = Object.assign(this.configs, configs);
    }

    applyLastConfigCache(configs) {
        let mapInputColName = configs.allColumns.reduce((map, el) => {
            map[el.columnName] = el;
            return map;
        }, {});
        for (let configName in this.lastConfigCache) {
            for (let col of this.lastConfigCache[configName]) {
                if (mapInputColName[col.columnName]) {
                    let newCol = mapInputColName[col.columnName];
                    if (col.agg) {
                        newCol.agg = col.agg;
                    }
                    newCol.as = col.as;
                    configs[configName].push(newCol);
                }
            }
        }
        return configs;
    }

    getDataTypeFromAggFunc(column) {
        let aggFuncToNumber = {
            sum: true,
            count: true,
            avg: true,
            count_dist: true,
        };
        if (column.type == 'number') {
            return 'number';
        } else {
            if (aggFuncToNumber[column.agg]) {
                return 'number';
            } else {
                return column.type;
            }
        }
    }

    process(source) {
        this.resetNewColumnNames();
        if (source == 'impact') {
            this.convertInputToConfigs();
        } else if (
            !this.configs.allColumns ||
            Object.keys(this.configs.allColumns).length == 0
        ) {
            this.configs.allColumns = this.input;
        }
        let rsl = [];

        let mapAllCol = {}
        if(this.changeColGeneration){
            mapAllCol = this.getMapColFromInputs();
        }

        let newIdDataset = this.configs.newIdDataset;
        if (!newIdDataset) {
            newIdDataset = this.configs.newIdDataset = this.getNewDatasetId();
        }

        for (let col of this.configs.groupBy) {
            mapAllCol[col.columnName] = 1;
            rsl.push(
                new NodeIO(
                    newIdDataset,
                    col.columnName,
                    col.type,
                    newIdDataset,
                    col.title,
                    newIdDataset + '_' + col.columnName,
                    this.id,
                    col.trackId,
                ),
            );
        }

        for (let column of this.configs.aggColumns) {
            let newColName = this.getNewColumnName(column.columnName, column.as, mapAllCol, this.changeColGeneration);
            let newDataType = this.getDataTypeFromAggFunc(column);
            rsl.push(
                new NodeIO(
                    newIdDataset,
                    newColName,
                    newDataType,
                    newIdDataset,
                    column.as,
                    newIdDataset + '_' + newColName,
                    this.id,
                    column.trackId,
                ),
            );
        }

        if (this.input.length > 0) {
            this.lastConfigCache = {
                groupBy: _cloneDeep(this.configs.groupBy),
                aggColumns: _cloneDeep(this.configs.aggColumns),
            };
        }
        return rsl;
    }

    getConfigsToSave() {
        let configs = this.configs;
        let rsl = this.getCommonProp();

        rsl = Object.assign(rsl, {
            groupBy: [],
            aggColumns: [],
        });
        this.configs.groupBy.forEach((column) => {
            rsl.groupBy.push({
                uid: column.uid,
                as: column.as ? column.as : column.title,
            });
        });
        this.configs.aggColumns.forEach((column) => {
            rsl.aggColumns.push({
                uid: column.uid,
                as: column.as,
                agg: column.agg,
                newDataType: column.newDataType,
            });
        });
        return rsl;
    }

    getFullConfigsFromSavedData(configs) {
        let rsl = this.restoreSharedProp(configs);
        let prevNode = Object.values(this.prevNodes)[0];
        let mapColumnAndUid = {};

        if (prevNode) {
            mapColumnAndUid = prevNode.getOutput().reduce((map, el) => {
                map[el.uid] = el;
                return map;
            }, {});
        }

        rsl.newIdDataset = configs.newIdDataset;
        rsl.groupBy = [];
        rsl.aggColumns = [];

        configs.groupBy.forEach((column) => {
            if (mapColumnAndUid[column.uid]) {
                let newCol = _cloneDeep(mapColumnAndUid[column.uid]);
                newCol = Object.assign(newCol, column);
                rsl.groupBy.push(newCol);
            }
        });

        configs.aggColumns.forEach((column) => {
            if (mapColumnAndUid[column.uid]) {
                let newCol = _cloneDeep(mapColumnAndUid[column.uid]);
                newCol = Object.assign(newCol, column);
                rsl.aggColumns.push(newCol);
            }
        });

        return rsl;
    }
}

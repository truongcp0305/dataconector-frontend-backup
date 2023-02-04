import NodeBase from './NodeBase';
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import _isEmpty from 'lodash/isEmpty';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';
const defaultConfig = {
    allColumns: [],
    columns: [],
    values: [],
    rows: [],
    autoReplaceNullValue: true,
    dynamicCols: [],
};

export default class PivotData extends NodeBase {
    constructor(symperId) {
        super(symperId, 'Pivot', _cloneDeep(defaultConfig));
    }

    removeDuplicateColumns(configsType) {
        let items = this.configs[configsType];
        let itemsMap = {};
        items.forEach((ele) => {
            itemsMap[ele.uid] = ele;
        });
        this.configs[configsType] = Object.values(itemsMap);
    }

    convertInputToConfigs() {
        let inputCols = [];
        let inputColMap = {};
        this.input.forEach((item) => {
            inputCols.push(item);
            inputColMap[item.uid] = item;
        });
        let oldConfigs = {
            columns: [],
            values: [],
            rows: [],
        };

        for (let name in oldConfigs) {
            if (this.lastConfigCache[name]) {
                for (let item of this.lastConfigCache[name]) {
                    if (inputColMap[item.uid]) {
                        oldConfigs[name].push(item);
                    }
                }
            }
        }

        this.configs = Object.assign(this.configs, {
            newIdDataset: this.getNewDatasetId(),
            allColumns: inputCols,
            columns: oldConfigs.columns,
            values: oldConfigs.values,
            rows: oldConfigs.rows,
        });
    }

    proceessAfterRunNode(res) {
        this.configs.dynamicCols = res.pivot_columns[this.id].columns;
        this.output = this.process('run-node');
        this.propagate();
    }

    process(source) {
        if (source == 'impact') {
            this.convertInputToConfigs();
        }
        let rsl = [];
        let newIdDataset = this.configs.newIdDataset;
        let staticOutputs = this.configs.rows;
        let mapRowsByName = staticOutputs.reduce((map, el) => {
            map[el.columnName] = el;
            return map;
        }, {});

        if (this.configs.columns.length == 0) {
            staticOutputs = staticOutputs.concat(this.configs.values);
        }

        if (
            Array.isArray(this.configs.dynamicCols) &&
            this.configs.dynamicCols.length
        ) {
            staticOutputs = [];
            for (let ele of this.configs.dynamicCols) {
                let rowItem = mapRowsByName[ele.columnName];
                let item = new NodeIO(
                    newIdDataset,
                    ele.name,
                    ele.type,
                    newIdDataset,
                    ele.title,
                    newIdDataset + '_' + ele.name,
                    this.id,
                    rowItem ? rowItem.trackId : null,
                );
                item.groupRow = true; // phục vụ cho việc hiển thị group các dòng có cùng giá trị với nhau
                rsl.push(item);
            }
        }

        let staticCols = [];
        staticOutputs.forEach((ele) => {
            let rowItem = mapRowsByName[ele.columnName];
            let item = new NodeIO(
                newIdDataset,
                ele.columnName,
                ele.type,
                newIdDataset,
                ele.title,
                newIdDataset + '_' + ele.columnName,
                this.id,
                rowItem ? rowItem.trackId : null,
            );
            item.groupRow = true; // phục vụ cho việc hiển thị group các dòng có cùng giá trị với nhau
            staticCols.push(item);
        });
        rsl = staticCols.concat(rsl);
        this.lastConfigCache = {
            columns: _cloneDeep(this.configs.columns),
            values: _cloneDeep(this.configs.values),
            rows: _cloneDeep(this.configs.rows),
        };
        return rsl;
    }

    resetOutputColumns(columns) {
        let cols = this.process('reset-oupt-columns');
        let newIdDataset = this.configs.newIdDataset;

        columns.forEach((ele) => {
            cols.push(
                new NodeIO(
                    newIdDataset,
                    ele.name,
                    ele.type,
                    newIdDataset,
                    ele.title,
                    newIdDataset + '_' + ele.name,
                    this.id,
                ),
            );
        });
        this.output = cols;
    }

    getConfigsToSave() {
        let rsl = this.getCommonProp();
        return Object.assign(this.configs, rsl);
    }

    getFullConfigsFromSavedData(configs) {
        let rsl = this.restoreSharedProp(configs);
        rsl = _merge(rsl, _cloneDeep(defaultConfig));
        rsl = Object.assign(rsl, configs);
        return rsl;
    }
}

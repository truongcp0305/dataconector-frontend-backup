import NodeBase from './NodeBase';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';
import { applyHistoryColumnProp } from '../configPool/dataflowConfig';

const defaultConfig = {
    keyColumns: [],
    dataColumns: [],
    keyColumnTitle: 'v2.dataflow.name',
    dataColumnTitle: 'v2.dataflow.value',
    autoReplaceNullValue: true,
    columnPropHistory: {},
};
export default class TransposeTable extends NodeBase {
    autoRemoveNullValue = true;
    constructor(symperId) {
        super(symperId, 'TransposeTable', _cloneDeep(defaultConfig));
    }

    convertInputToConfigs() {
        let allInputCols = [];
        this.input.forEach((item) => {
            item = applyHistoryColumnProp(item, this.configs.columnPropHistory);
            allInputCols.push({
                uid: item.uid,
                id_dataset: item.idDataset,
                name: item.columnName,
                columnName: item.columnName,
                title: item.title,
                type: item.type,
                selected: false,
            });
        });

        let keyColumns = _cloneDeep(allInputCols);
        allInputCols.forEach((item) => {
            item.selected = true;
        });
        let rsl = this.applyLastConfigCacheToCurrentConfig(
            keyColumns,
            allInputCols,
        );
        this.configs = Object.assign(this.configs, {
            dataColumns: rsl.dataColumns,
            keyColumns: rsl.keyColumns,
            newIdDataset: this.configs.newIdDataset,
            keyColumnTitle: this.configs.keyColumnTitle
                ? this.configs.keyColumnTitle
                : 'Name',
            dataColumnTitle: this.configs.dataColumnTitle
                ? this.configs.dataColumnTitle
                : 'Value',
        });
    }

    applyLastConfigCacheToCurrentConfig(keyColumns, dataColumns) {
        let cache = this.lastConfigCache;
        if (cache.keyColumns && Object.keys(cache.keyColumns).length > 0) {
            for (let col of keyColumns) {
                if (cache.keyColumns[col.uid]) {
                    col.selected = true;
                }
            }
        }

        if (cache.dataColumns && Object.keys(cache.dataColumns).length > 0) {
            for (let col of dataColumns) {
                if (cache.dataColumns[col.uid]) {
                    col.selected = true;
                } else {
                    col.selected = false;
                }
            }
        }
        return {
            keyColumns,
            dataColumns,
        };
    }

    process(source) {
        if (source == 'impact') {
            this.convertInputToConfigs();
        }

        let cols = [];
        let newIdDataset = this.configs.newIdDataset;
        for (let col of this.configs.keyColumns) {
            if (col.selected) {
                cols.push(
                    new NodeIO(
                        newIdDataset,
                        col.columnName,
                        col.type,
                        newIdDataset,
                        col.title,
                        newIdDataset + '_' + col.name,
                        this.id,
                        col.trackId,
                    ),
                );
            }
        }

        let colName = this.getNotConflictColName('symper_new_column_name', this.configs.keyColumns);
        let colValue = this.getNotConflictColName('symper_new_column_value', this.configs.keyColumns);

        cols.push(
            new NodeIO(
                newIdDataset,
                colName,
                'text',
                newIdDataset,
                this.configs.keyColumnTitle
                    ? this.configs.keyColumnTitle
                    : 'Name' + (colName == 'symper_new_column_name' ? '' : (' ' + colName.replace('symper_new_column_name_', ''))),
                newIdDataset + '_' + colName,
                this.id,
            ),
        );

        cols.push(
            new NodeIO(
                newIdDataset,
                colValue,
                'text',
                newIdDataset,
                this.configs.dataColumnTitle
                    ? this.configs.dataColumnTitle
                    : 'Value' + (colValue == 'symper_new_column_value' ? '' : (' ' + colValue.replace('symper_new_column_value_', ''))),
                newIdDataset + '_' + colValue,
                this.id,
            ),
        );

        if (this.configs.keyColumns.length > 0) {
            this.lastConfigCache = {
                dataColumns: this.configs.dataColumns.reduce((map, el) => {
                    el.selected && (map[el.uid] = true);
                    return map;
                }, {}),
                keyColumns: this.configs.keyColumns.reduce((map, el) => {
                    el.selected && (map[el.uid] = true);
                    return map;
                }, {}),
            };
        }
        return cols;
    }

    getConfigsToSave() {
        let rsl = this.getCommonProp();
        let savedConfigs = Object.assign({}, this.configs);
        return Object.assign(savedConfigs, rsl);
    }

    getFullConfigsFromSavedData(configs) {
        let rsl = this.restoreSharedProp(configs);
        rsl = Object.assign(rsl, configs);
        return rsl;
    }
}

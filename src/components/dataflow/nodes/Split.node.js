import NodeBase from './NodeBase';
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';

export const defaultConfig = {
    splitGroups: [
        {
            radioCheck: 'splitToCol',
            addedColumns: [
                {
                    name: '',
                    title: '',
                    type: ''
                }
            ],
            splitConfig: {
                selectCol: {
                    title: 'v2.dataflow.selectColTitle',
                    type: 'autocomplete',
                    value: '',
                    placeholder: 'v2.dataflow.selectColPlaceholder',
                    options: []
                },
                colNumber: {
                    title: 'v2.dataflow.colNumberTitle',
                    type: 'text',
                    value: '',
                    placeholder: 'v2.dataflow.colNumberPlaceholder'
                },
                delimiter: {
                    title: 'v2.dataflow.delimiterTitle',
                    type: 'text',
                    value: '',
                    placeholder: 'v2.dataflow.delimiterPlaceholder'
                },
                ignoreIn: {
                    title: 'v2.dataflow.ignoreInTitle',
                    type: 'text',
                    value: '',
                    placeholder: 'v2.dataflow.ignoreInPlaceholder'
                }
            }
        }
    ],
    allColumns: []
};

export default class Split extends NodeBase {
    constructor(symperId) {
        super(symperId, 'Split', _cloneDeep(defaultConfig));
    }

    convertInputToConfigs() {
        for (let group of this.configs.splitGroups) {
            group.splitConfig.selectCol.options = this.input;
        }

        this.configs.allColumns = this.getAllColsFromInput();
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
                item.trackId
            );
            outCols.push(newOutputCol);
        }

        if (this.input.length == 0) {
            return [];
        }

        for (let group of this.configs.splitGroups) {
            if (group.radioCheck == 'splitToCol') {
                for (let item of group.addedColumns) {
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
                        true
                    );
                    outCols.push(newOutputCol);
                }
            }
        }
        return outCols;
    }

    getConfigsToSave() {
        let configs = this.configs;
        let rsl = this.getCommonProp();
        rsl.splitGroups = _cloneDeep(configs.splitGroups);
        for (let item in rsl.splitGroups) {
            let splitGroup = rsl.splitGroups[item];
            for (let key in splitGroup.splitConfig) {
                rsl.splitGroups[item].splitConfig[key] = {
                    value: splitGroup.splitConfig[key].value
                };
            }
        }
        return rsl;
    }

    getFullConfigsFromSavedData(originConfigs) {
        let configs = _cloneDeep(originConfigs);
        let rsl = this.restoreSharedProp(originConfigs);
        for (let idx in rsl.splitGroups) {
            rsl.splitGroups[idx].splitConfig;
            rsl.splitGroups[idx].splitConfig = _cloneDeep(
                defaultConfig.splitGroups[0].splitConfig
            );
            rsl.splitGroups[idx].splitConfig.selectCol.options = this.input;
            for (let key in rsl.splitGroups[idx].splitConfig) {
                rsl.splitGroups[idx].splitConfig[key].value =
                    configs.splitGroups[idx].splitConfig[key].value;
            }
        }
        for (let group of rsl.splitGroups) {
            let newConfig = {
                selectCol: group.splitConfig.selectCol,
                colNumber: group.splitConfig.colNumber,
                delimiter: group.splitConfig.delimiter,
                ignoreIn: group.splitConfig.ignoreIn
            };
            group.splitConfig = newConfig;
        }
        rsl = Object.assign(_cloneDeep(defaultConfig), originConfigs);
        return rsl;
    }
}

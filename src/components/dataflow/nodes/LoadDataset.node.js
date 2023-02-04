import NodeBase from './NodeBase';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';
import { applyHistoryColumnProp } from '../configPool/dataflowConfig';
import _cloneDeep from 'lodash/cloneDeep';

const defaultConfig = {
    allColumns: [],
    idDataset: 0,
    symperDocId: '',
    name: '',
    title: '',
    autoReplaceNullValue: true,
    columnPropHistory: {},
    customData: {
        columns: [
            {
                name: '',
                title: '',
                type: '',
            },
        ],
        data: [],
    },
    mode: 0, // 0 là dataset | 1 là customData
};
export default class LoadDataset extends NodeBase {
    autoRemoveNullValue = true;
    selectedCols = {};
    constructor(symperId) {
        super(symperId, 'Load', _cloneDeep(defaultConfig));
    }

    restoreCustomData(configs) {
        let customData = null;
        if (configs.customData) {
            customData = configs.customData;
            customData.columns.unshift(
                _cloneDeep(defaultConfig.customData.columns[0]),
            );
        } else {
            customData = _cloneDeep(defaultConfig.customData);
        }
        return customData;
    }

    getFullConfigsFromSavedData(configs, datasetsMap) {
        let df = _cloneDeep(defaultConfig);
        let fullConfigs = this.restoreSharedProp(configs);
        fullConfigs = Object.assign(df, fullConfigs);
        fullConfigs.customData = this.restoreCustomData(configs);

        let idDts = configs.idDataset ? configs.idDataset : 0;
        if (!datasetsMap[idDts]) {
            return fullConfigs;
        }
        let map = datasetsMap;
        let originDatasetInfo = datasetsMap[idDts].info;
        fullConfigs.idDataset = idDts;

        if (originDatasetInfo) {
            fullConfigs.symperDocId = originDatasetInfo.symper_id;
            fullConfigs.name = originDatasetInfo.name;
            fullConfigs.title = originDatasetInfo.alias_name;
        }

        if (map[idDts]) {
            fullConfigs.subDatasets = map[idDts].subDatasets
                ? map[idDts].subDatasets
                : [];
        } else {
            fullConfigs.subDatasets = [];
        }

        fullConfigs.columns = idDts ? map[idDts].columns : [];
        fullConfigs.newIdDataset = configs.newIdDataset;

        let selectedCols = 'allTrue';
        if (configs.selectedCols !== undefined) {
            selectedCols = configs.selectedCols;
        }
        this.selectedCols = selectedCols;
        fullConfigs.mode = configs.mode ? configs.mode : 0;
        return fullConfigs;
    }

    process(source, meta) {
        let rsl = [];
        this.configsForFirstLoad = false;
        if (this.configs.mode == 0) {
            if (meta && (!meta.type || meta.type == 'change-dataset')) {
                this.convertInputToConfigs(meta.data);
                this.selectedCols = {};
            }
            this.configsForFirstLoad = false;
            this.configs.allColumns.forEach((ele) => {
                if (ele.selected) {
                    rsl.push(ele);
                    this.selectedCols[ele.uid] = true;
                }
            });
        } else if (this.configs.mode == 1) {
            let newTBName = (this.configs.newIdDataset =
                this.getNewDatasetId());
            for (
                let idx = 1;
                idx < this.configs.customData.columns.length;
                idx++
            ) {
                let item = this.configs.customData.columns[idx];
                item.type = item.type ? item.type : 'Text';
                let type = item.type.toLowerCase().replace(' ', '');
                rsl.push(
                    new NodeIO(
                        newTBName,
                        item.name,
                        type,
                        newTBName,
                        item.title,
                        newTBName + '_' + item.name,
                        this.id,
                    ),
                );
            }
        }
        return rsl;
    }

    convertInputToConfigs(data) {
        let rsl = [];
        let mapSubDts = {};
        if (this.configs.subDatasets) {
            this.configs.subDatasets.forEach((item) => {
                mapSubDts[item.id] = item;
            });
        }
        let columnGroup = {};
        if (data) {
            columnGroup = data.columns ? data.columns : this.configs.columns;
        } else {
            columnGroup = this.configs.columns;
        }

        let newTBName = (this.configs.newIdDataset = this.getNewDatasetId());
        rsl = this.getAllFlatColumns(newTBName, columnGroup, this.selectedCols);
        this.configs.allColumns = rsl;
    }

    getAllFlatColumns(newTBName, columnsGroup, selectedCols = {}) {
        let rsl = [];
        for (let idDts in columnsGroup) {
            if (!columnsGroup[idDts]) {
                continue;
            }
            columnsGroup[idDts].forEach((item) => {
                item = applyHistoryColumnProp(
                    item,
                    this.configs.columnPropHistory,
                );
                item.uid = newTBName + '_' + item.name;
                let newCol = new NodeIO(
                    newTBName,
                    item.name,
                    item.type,
                    newTBName,
                    item.title,
                    item.uid,
                    this.id,
                );
                newCol.selected =
                    selectedCols == 'allTrue'
                        ? true
                        : selectedCols[item.uid]
                        ? true
                        : false;
                rsl.push(newCol);
            });
        }
        return rsl;
    }

    getConfigsToSave(inputData = {}) {
        let rsl = this.getCommonProp();
        rsl.idDataset = this.configs.idDataset;
        rsl.selectedCols = {};
        this.configs.allColumns.forEach((ele) => {
            if (ele.selected) {
                rsl.selectedCols[ele.uid] = true;
            }
        });
        rsl.customData = _cloneDeep(this.configs.customData);
        rsl.customData.columns.shift();
        rsl.mode = this.configs.mode;
        if (
            inputData &&
            inputData.customData &&
            Array.isArray(inputData.customData.data)
        ) {
            rsl.customData.data = inputData.customData.data;
        }
        return rsl;
    }
}

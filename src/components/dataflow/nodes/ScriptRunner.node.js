import NodeBase from './NodeBase';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';

const defaultConfig = {
    allColumns: [],
    script: '',
};

export default class ScriptRunner extends NodeBase {
    constructor(symperId) {
        super(symperId, 'Script', _cloneDeep(defaultConfig));
    }

    convertInputToConfigs() {
        let allColumns = {};
        this.input.forEach((item) => {
            allColumns[item.uid] = item;
        });
        this.configs = Object.assign(this.configs, {
            allColumns: allColumns,
            script: '',
        });
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
        return outCols;
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

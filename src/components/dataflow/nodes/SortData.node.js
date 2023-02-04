import NodeBase from './NodeBase';
import _cloneDeep from 'lodash/cloneDeep';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';

const defaultConfig = {
    allColumns: [],
    sortColumns: [],
};
export default class SortData extends NodeBase {
    constructor(symperId) {
        super(symperId, 'Sort', _cloneDeep(defaultConfig));
    }

    convertInputToConfigs() {
        this.configs.sortColumns = [];
        this.configs.allColumns = this.input;

        let colMap = this.input.reduce((map, col) => {
            map[col.columnName] = col;
            return map;
        }, {});

        if (Array.isArray(this.lastConfigCache)) {
            for (let col of this.lastConfigCache) {
                if (colMap[col.uid]) {
                    this.configs.sortColumns.push(col);
                }
            }
        }
    }

    process(source) {
        if (source == 'impact') {
            this.convertInputToConfigs();
        }
        if (this.input.length > 0) {
            this.lastConfigCache = _cloneDeep(this.configs.sortColumns);
        }

        let output = [];
        for (let col of this.input) {
            let newCol = _cloneDeep(col);
            newCol.from = this.id;
            newCol.idDataset = this.configs.newIdDataset;
            newCol.uid = newCol.idDataset + '_' + col.columnName;
            newCol.prevTrackId = newCol.trackId;
            output.push(newCol);
        }

        return output;
    }

    getConfigsToSave() {
        let rsl = this.getCommonProp();
        rsl = Object.assign(this.configs, rsl);
        return rsl;
    }

    getFullConfigsFromSavedData(configs) {
        return Object.assign(_cloneDeep(this.commonNodeProps), configs);
    }
}

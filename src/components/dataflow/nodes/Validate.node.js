import NodeBase from './NodeBase';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';

const defaultConfig = {
    validateConfigs: {
        validateFormula: {
            title: 'v2.dataflow.validateFomula',
            type: 'script',
            value: '',
            info: '',
            validateQueryResult: {
                result: '',
                errInfo: ''
            },
            listKeyworks: {}
        },
        objectQuery: {
            title: 'v2.dataflow.validationObjectQuery',
            type: 'script',
            value: '',
            info: '',
            listKeyworks: {}
        }
    }
};

export default class Validate extends NodeBase {
    constructor(symperId) {
        super(symperId, 'Validate', _cloneDeep(defaultConfig));
    }

    convertInputToConfigs() {
        this.configs = Object.assign(this.configs, {});
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
        let outCols = [];
        let datasetId = this.configs.newIdDataset;
        for (let uid in this.input) {
            let item = this.input[uid];
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
        return outCols;
    }

    getConfigsToSave() {
        let configs = this.configs;
        let rsl = this.getCommonProp();
        rsl.validateConfigs = _cloneDeep(configs.validateConfigs);
        for (let idx in rsl.validateConfigs) {
            rsl.validateConfigs[idx] = {
                value: rsl.validateConfigs[idx].value
            };
        }
        return rsl;
    }

    getFullConfigsFromSavedData(originConfigs) {
        let configs = _cloneDeep(originConfigs);
        let rsl = this.restoreSharedProp(originConfigs);
        rsl.validateConfigs = _cloneDeep(defaultConfig.validateConfigs);
        for (let index in rsl.validateConfigs) {
            rsl.validateConfigs[index].value =
                configs.validateConfigs[index].value;
        }
        rsl = Object.assign(_cloneDeep(defaultConfig), originConfigs);
        return rsl;
    }
}

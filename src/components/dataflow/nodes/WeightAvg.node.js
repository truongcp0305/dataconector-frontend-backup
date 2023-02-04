import NodeBase from './NodeBase';
import _cloneDeep from 'lodash/cloneDeep';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';
const defaultConfig = {
    allColumns: [],
    goods: '',
    stock: '',
    exchangeStock: '',
    quantity: '',
    totalAmount: '',
    period: ''
};

const CLOSING_AMOUNT = '__symper_closing_amount';
const WEIGHT_AVG_PRICE = '__symper_weight_avg_price';
const STOCK = '__symper_stock';
const PRODUCT_CODE = '__symper_product_code';
const PERIOD = '__symper_period';

export default class WeightAvg extends NodeBase {
    constructor(symperId) {
        super(symperId, 'WeightAvg', _cloneDeep(defaultConfig));
    }

    convertInputToConfigs() {
        let configs = _cloneDeep(defaultConfig);
        configs.allColumns = this.input;
        let mapColByName = configs.allColumns.reduce((map, el) => {
            map[el.columnName] = el;
            return map;
        }, {});
        if (typeof this.lastConfigCache == 'object') {
            for (let key in this.lastConfigCache) {
                if (mapColByName[this.lastConfigCache[key]]) {
                    configs[key] = this.lastConfigCache[key];
                }
            }
        }
        this.configs = Object.assign(this.configs, configs);
    }

    setLastConfigCache() {
        this.lastConfigCache = {};
        for (let key in defaultConfig) {
            if (key != 'allColumns' && this.configs[key]) {
                this.lastConfigCache[key] = this.configs[key];
            }
        }
    }

    process(source) {
        if (source == 'impact') {
            this.convertInputToConfigs();
        }
        this.setLastConfigCache();
        let rsl = [
            this.makeOutByShort(STOCK, 'Stock', 'text'),
            this.makeOutByShort(PRODUCT_CODE, 'Product code', 'text'),
            this.makeOutByShort(WEIGHT_AVG_PRICE, 'Price', 'number'),
            this.makeOutByShort(CLOSING_AMOUNT, 'Closing amount', 'text')
        ];
        if (this.configs.period) {
            rsl.push(this.makeOutByShort(PERIOD, 'Period', 'text'));
        }
        return rsl;
    }

    makeOutByShort(name, title, type) {
        let newIdDataset = this.configs.newIdDataset;
        return new NodeIO(
            newIdDataset,
            name,
            type,
            newIdDataset,
            title,
            newIdDataset + '_' + name,
            this.id
        );
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

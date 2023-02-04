import NodeBase from './NodeBase';
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';

const defaultConfig = {
    condition: [
        {
            id: 'root',
            label: 'AND',
            name: 'AND',
            nodeType: 'group',
            children: [],
        },
    ],
    allColumns: {},
};

export default class FilterData extends NodeBase {
    constructor(symperId) {
        super(symperId, 'Filter', _cloneDeep(defaultConfig));
    }

    convertInputToConfigs() {
        let configs = _cloneDeep(defaultConfig);
        this.input.forEach((item) => {
            configs.allColumns[item.uid] = item;
        });

        if (
            this.lastConfigCache[0] &&
            this.lastConfigCache[0].children &&
            this.input.length > 0
        ) {
            let colMapByName = {};
            for (let key in configs.allColumns) {
                colMapByName[configs.allColumns[key].columnName] =
                    configs.allColumns[key];
            }
            this.cleanColumnData(
                this.lastConfigCache[0].children,
                colMapByName,
            );
            configs.condition = this.lastConfigCache;
        }
        this.configs = _merge(this.configs, configs);
    }

    cleanColumnData(children, allColumns) {
        for (let idx in children) {
            let item = children[idx];
            if (item.nodeType == 'group') {
                this.cleanColumnData(item.children, allColumns);
            } else if (item.nodeType == 'item' && item.column) {
                if (!allColumns.hasOwnProperty(item.column.columnName)) {
                    delete children[idx];
                } else {
                    item.column = Object.assign(
                        item.column,
                        allColumns[item.column.columnName],
                    );
                }
            }
        }
        children = Object.values(children);
    }

    /**
     * configs có dạng:
     *
     * condition:[ mỗi item có dạng new NodeIO và thêm operand và value],
     * allColumns:{
     *      uid: new NodeIO
     * }
     */
    process(source) {
        if (source == 'impact') {
            this.convertInputToConfigs();
        } else if (
            !this.configs.allColumns ||
            Object.keys(this.configs.allColumns).length == 0
        ) {
            this.configs.allColumns = {};
            this.input.forEach((item) => {
                this.configs.allColumns[item.uid] = item;
            });
        }

        let newIdDataset = this.getNewDatasetId();
        this.configs.newIdDataset = newIdDataset;

        if (this.configs.condition[0].children.length > 0) {
            this.lastConfigCache = _cloneDeep(this.configs.condition);
        }

        let output = [];
        for (let col of this.input) {
            output.push(
                new NodeIO(
                    newIdDataset,
                    col.columnName,
                    col.type,
                    0,
                    col.title,
                    newIdDataset + '_' + col.columnName,
                    this.id,
                    col.prevTrackId,
                ),
            );
        }
        return output;
    }

    getConfigsToSave() {
        let rsl = this.getCommonProp();
        rsl.condition = this.configs.condition;
        return rsl;
    }

    getFullConfigsFromSavedData(configs) {
        let rsl = this.restoreSharedProp(configs);
        if (Array.isArray(rsl.condition) && rsl.condition.length > 0) {
            this.convertOldDataToCurrent(rsl.condition[0]);
        } else {
            rsl.condition = [];
        }
        rsl = Object.assign(rsl, configs);
        return rsl;
    }

    convertOldDataToCurrent(item, parent = null) {
        if (!parent) {
            item.root = true;
            item.parent = false;
        }

        if (item.nodeType) {
            item.condition = item.nodeType == 'group' ? true : false;
        }

        if (!item.parent && parent) {
            item.parent = parent.id;
        }

        if (!item.name && item.condition) {
            item.name = item.label;
        }
        if (Array.isArray(item.children)) {
            let valideChilds = [];
            for (let child of item.children) {
                if (child) {
                    this.convertOldDataToCurrent(child, item);
                    valideChilds.push(child);
                }
            }
            item.children = valideChilds;
        }
    }
}

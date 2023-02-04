import NodeBase from './NodeBase';
import _cloneDeep from 'lodash/cloneDeep';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';
import { applyHistoryColumnProp } from '../configPool/dataflowConfig';
const defaultConfig = {
    columns: [],
    columnPropHistory: {},
    changeColumns: {},
};
export default class SelectColumns extends NodeBase {
    constructor(symperId) {
        super(symperId, 'Select', _cloneDeep(defaultConfig));
    }

    convertInputToConfigs() {
        let self = this;
        let mapColByName = {};
        this.input.forEach((item) => {
            item = applyHistoryColumnProp(
                _cloneDeep(item),
                self.configs.columnPropHistory,
            );
            let cachedCol = self.lastConfigCache[item.columnName];
            mapColByName[item.columnName] = {
                uid: item.uid,
                id_dataset: item.idDataset,
                name: item.columnName,
                columnName: item.columnName,
                // title: item.title,
                // type: item.type,
                title:
                    cachedCol && cachedCol.title ? cachedCol.title : item.title,
                type: cachedCol && cachedCol.type ? cachedCol.type : item.type,
                selected: cachedCol ? cachedCol.selected : false,
                trackId: item.trackId,
                prevTrackId: item.prevTrackId,
            };
        });

        // Xóa các cache key không nằm trong input
        for (const key in self.lastConfigCache) {
            if (!mapColByName[key]) {
                delete self.lastConfigCache[key].type;
                delete self.lastConfigCache[key].title;
            }
        }
        this.configs.columns = Object.values(mapColByName);
    }

    saveChangeCols(meta) {
        if (meta.type == 'change-cell-value') {
            let changeCols = this.configs.changeColumns;
            let colUid = meta.data.colUid;
            if (!changeCols[colUid]) {
                changeCols[colUid] = {};
            }
            changeCols[colUid][meta.data.fieldcolumn] = true;
        }
    }

    process(source, meta) {
        this.saveChangeCols(meta);
        if (source == 'impact') {
            this.convertInputToConfigs();
        }
        let newIdDataset = this.getNewDatasetId();
        this.configs.newIdDataset = newIdDataset;
        let rsl = [];
        this.configs.columns.forEach((item) => {
            if (item.selected) {
                rsl.push(
                    new NodeIO(
                        newIdDataset,
                        item.columnName,
                        item.type,
                        0,
                        item.title ? item.title : item.name,
                        newIdDataset + '_' + item.columnName,
                        this.id,
                        item.trackId,
                    ),
                );
                // set cache cho lần tiếp theo
            }

            let changeCol = this.configs.changeColumns[item.uid];
            this.lastConfigCache[item.columnName] = {
                selected: item.selected,
            };
            if (changeCol) {
                this.lastConfigCache[item.columnName].type = changeCol.type
                    ? item.type
                    : null;
                this.lastConfigCache[item.columnName].title = changeCol.title
                    ? item.title
                    : null;
            }
        });
        return rsl;
    }

    // afterNodeSelected() {
    //     SDataflowEditor.$emit('check-selected-rows', {});
    // }

    getConfigsToSave() {
        let configs = this.configs;
        let rsl = this.getCommonProp();
        rsl.columns = {};
        rsl.changeColumns = configs.changeColumns;

        configs.columns.forEach((column) => {
            rsl.columns[column.uid] = {
                uid: column.uid,
                title: column.title,
                type: column.type,
                selected: column.selected,
            };
        });
        return rsl;
    }

    getFullConfigsFromSavedData(configs) {
        let fullConfigs = this.restoreSharedProp(configs);
        fullConfigs = Object.assign(_cloneDeep(defaultConfig), fullConfigs);
        let prevNode = Object.values(this.prevNodes)[0];
        let mapColumnAndUid = {};
        if (prevNode) {
            mapColumnAndUid = prevNode.getOutput().reduce((map, el) => {
                map[el.uid] = el;
                return map;
            }, {});
        }

        fullConfigs.columns = [];
        for (let uid in configs.columns) {
            let col = mapColumnAndUid[uid];
            if (!col) {
                console.warn("Column not found!", mapColumnAndUid, uid, this.id);
            } else {
                let newCol = _cloneDeep(col);
                newCol = Object.assign(newCol, configs.columns[uid]);
                fullConfigs.columns.push(newCol);
            }
            delete mapColumnAndUid[uid];
        }

        // bù thêm những cột mà chưa được lưu trong configs
        for (let key in mapColumnAndUid) {
            fullConfigs.columns.push(mapColumnAndUid[key]);
        }
        (configs.changeColumns && typeof configs.changeColumns == 'object') && (fullConfigs.changeColumns = configs.changeColumns);
        return fullConfigs;
    }
}

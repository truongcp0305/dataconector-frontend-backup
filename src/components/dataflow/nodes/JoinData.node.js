import NodeBase from './NodeBase';
import _cloneDeep from 'lodash/cloneDeep';
import CreateableNewColumnNode from '@/components/dataflow/nodes/CreateableNewColumnNode.js';
import NodeIO from '@/components/dataflow/configPool/NodeIO.js';
import { applyHistoryColumnProp } from '../configPool/dataflowConfig';
import _merge from 'lodash/merge';
import { str } from '@/plugins/utilModules/str.js';

const DEFAULT_JOIN_TYPE = 'FULL JOIN';
const defaultConfig = {
    joinedColumns: [],
    allColumns: [],
    autoReplaceNullValue: true,
    joinType: DEFAULT_JOIN_TYPE,
    columnPropHistory: {},
    autoMergeJoinGroups: [],
    generatedColumns: [], // các cột mới được tạo ra do việc check vào merge mismatch values của từng group trong join
};

export default class JoinData extends CreateableNewColumnNode {
    autoRemoveNullValue = true;
    stackInput = true;
    constructor(symperId) {
        super(symperId, 'Join', _cloneDeep(defaultConfig));
    }

    convertInputToConfigs() {
        let configs = this.configs;
        configs.allColumns = [];
        configs.joinedColumns = [];

        let columnGroup = {};
        let inputOrder = {};

        let count = 1;
        for (let i in this.inputMapNode) {
            inputOrder[i] = count;
            count += 1;
        }
        let mapSelectedCols = {};
        if (this.lastConfigCache && this.lastConfigCache.allColumns) {
            let count = 1;
            for (let cols of this.lastConfigCache.allColumns) {
                let mapCols = cols.reduce((map, col) => {
                    if (col.selected) {
                        map[col.uid] = true;
                    }
                    return map;
                }, {});
                mapSelectedCols = Object.assign(mapSelectedCols, mapCols);
            }
        }
        this.input.forEach((item) => {
            item = applyHistoryColumnProp(item, configs.columnPropHistory);
            let orgId = item.from;
            if (!columnGroup[orgId]) {
                columnGroup[orgId] = [];
            }
            let sourceNum = '# ' + inputOrder[item.from];
            columnGroup[orgId].push({
                uid: item.uid,
                id_dataset: item.idDataset,
                columnName: item.columnName,
                symperDocId: item.symperDocId,
                title: item.title + ` (${sourceNum}) `,
                type: item.type,
                sourceNum: sourceNum,
                selected: mapSelectedCols[item.uid] ? true : false,
            });
        });
        configs.allColumns = Object.values(columnGroup);
        configs.joinedColumns = this.applyLastConfigCache(configs.allColumns);
        this.configs = _merge(this.configs, configs);
    }

    applyLastConfigCache(newAllColumns) {
        if (!this.lastConfigCache) {
            return [];
        } else {
            let rsl = [];
            let inputColumnsMap = {};
            let conditionItemTpl = [];
            for (let i = 0; i < newAllColumns.length; i++) {
                conditionItemTpl.push({
                    columnName: '',
                    title: '',
                    uid: '',
                });
            }

            for (let i = 0; i < newAllColumns.length; i++) {
                inputColumnsMap[i] = {};
                for (let col of newAllColumns[i]) {
                    inputColumnsMap[i][col.uid] = col;
                }
            }

            let joinedCols = this.lastConfigCache.joinedColumns;
            if (Array.isArray(joinedCols)) {
                for (let cond of joinedCols) {
                    let newCond = _cloneDeep(conditionItemTpl);
                    // Đẩy các cột được join vào newCond
                    for (let i = 0; i < cond.length; i++) {
                        if (inputColumnsMap[i]) {
                            let uid = cond[i].uid;
                            if (inputColumnsMap[i][uid]) {
                                newCond[i].columnName = cond[i].columnName;
                                // newCond[i].title = cond[i].title;
                                newCond[i].uid = uid;
                            }
                        }
                    }

                    // Check các cột được đẩy vào, nếu mà rỗng hết thì bỏ qua, ko đưa dãy này vào config
                    let canAdd = false;
                    for (let col of newCond) {
                        if (col.columnName) {
                            canAdd = true;
                            break;
                        }
                    }

                    if (canAdd) {
                        rsl.push(newCond);
                    }
                }
            }
            return rsl;
        }
    }

    /**
     * configs có dạng:
     * joinedColumns:[
     *      [
     *          {uid:2}, {uid:3}
     *      ],
     *      [
     *          {uid:5}, {uid:4}
     *      ]
     *
     * ],
     * allColumns:[
     *      [  phân nhóm dataset thứ nhất
     *          new NodeIO1 (có thêm thuộc tính selected - boolean để đánh dấu là có được lựa chọn hay không),
     *          new NodeIO2
     *      ],
     *      [   phân nhóm dataset thứ hai
     *          new NodeIO1 (có thêm thuộc tính selected - boolean để đánh dấu là có được lựa chọn hay không),
     *          new NodeIO2
     *      ]
     * ]
     */
    process(source) {
        this.resetNewColumnNames();
        if (source == 'impact') {
            this.convertInputToConfigs();
        }
        if (this.configs.autoMergeJoinGroups.length == 0) {
            for (let group of this.configs.joinedColumns) {
                this.configs.autoMergeJoinGroups.push({
                    key: str.randomString().toLowerCase() + Date.now(),
                    checked: false,
                });
            }
        }
        let output = [];
        let mapAllCol = {}
        if(this.changeColGeneration){
            mapAllCol = this.getMapColFromInputs();
        }


        this.configs.allColumns.forEach((columnGroup) => {
            columnGroup.forEach((item) => {
                if (item.selected) {
                    output.push(this.getNewColOutput(item, mapAllCol));
                }
            });
        });

        this.configs.generatedColumns.forEach((item) => {
            if (!item.newTrackId) {
                item.newTrackId = str.randomString(10);
            }
            if (item.selected) {
                output.push(this.getNewColOutput(item, mapAllCol));
            }
        });
        if (this.input.length > 0) {
            this.lastConfigCache = _cloneDeep(this.configs);
        }
        return output;
    }

    getNewColOutput(item, mapAllCol) {
        let title = item.title ? item.title : item.columnName;
        let newColName = this.getNewColumnName(item.columnName, title, mapAllCol, this.changeColGeneration);
        return new NodeIO(
            this.configs.newIdDataset,
            newColName,
            item.type,
            this.configs.newIdDataset,
            item.title,
            this.configs.newIdDataset + '_' + newColName,
            this.id,
            item.trackId,
            item.trackId ? item.trackId : item.newTrackId,
        );
    }

    getConfigsToSave() {
        let configs = this.configs;
        let rsl = this.getCommonProp();

        rsl = Object.assign(rsl, {
            allColumns: [],
            joinedColumns: [],
        });
        rsl.joinedColumns = configs.joinedColumns;
        configs.allColumns.forEach((columnGroup) => {
            let newArr = [];
            columnGroup.forEach((column) => {
                newArr.push({
                    uid: column.uid,
                    title: column.title,
                    columnName: column.columnName,
                    type: column.type,
                    selected: column.selected,
                });
            });
            rsl.allColumns.push(newArr);
        });
        rsl.joinType = configs.joinType ? configs.joinType : DEFAULT_JOIN_TYPE;
        rsl.generatedColumns = configs.generatedColumns;
        rsl.autoMergeJoinGroups = configs.autoMergeJoinGroups.slice(
            0,
            rsl.joinedColumns.length,
        );
        return rsl;
    }

    getFullConfigsFromSavedData(configs) {
        let rsl = this.restoreSharedProp(configs);
        rsl = Object.assign(rsl, _cloneDeep(defaultConfig));
        let mapColumnAndUid = {};
        for (let preveId of configs.prevNodes) {
            let prevNode = this.prevNodes[preveId];
            let tmpMap = prevNode.getOutput().reduce((map, el) => {
                map[el.uid] = el;
                return map;
            }, {});
            mapColumnAndUid = Object.assign(mapColumnAndUid, tmpMap);
        }

        rsl.newIdDataset = configs.newIdDataset;
        rsl.allColumns = [];
        rsl.joinedColumns = configs.joinedColumns;

        let count = 1;
        configs.allColumns.forEach((columnGroup) => {
            let newArr = [];
            let sourceNum = '# ' + count;
            columnGroup.forEach((column) => {
                let col = mapColumnAndUid[column.uid];
                if (col) {
                    let newCol = _cloneDeep(col);
                    newCol = Object.assign(newCol, {
                        uid: column.uid,
                        title: column.title,
                        type: column.type,
                        selected: column.selected,
                        columnName: newCol.columnName,
                    });
                    newCol.sourceNum = sourceNum;
                    newArr.push(newCol);
                }
            });
            rsl.allColumns.push(newArr);
            count += 1;
        });
        rsl.generatedColumns = configs.generatedColumns
            ? configs.generatedColumns
            : [];
        rsl.autoMergeJoinGroups = configs.autoMergeJoinGroups
            ? configs.autoMergeJoinGroups
            : [];
        rsl.autoMergeJoinGroups = rsl.autoMergeJoinGroups.slice(
            0,
            rsl.joinedColumns.length,
        );
        rsl.joinType = configs.joinType ? configs.joinType : DEFAULT_JOIN_TYPE;
        return rsl;
    }
}

import { biApi } from '@/api/bi.js';
import { relationApi } from '@/api/relation.js';
import { isBuffer } from 'lodash';

onmessage = function (event) {
    let data = event.data;
    let action = data.action;

    if (handler[action]) {
        handler[action](data.data);
    } else {
        console.error(` action ${action} not found `);
    }
};

let relaventIcon = {
    number: 'img/relation/number.svg',
    text: 'img/relation/text.svg',
    time: 'img/relation/time.svg',
    date: 'img/relation/date.svg',
    datetime: 'img/relation/datetime.svg',
    table: 'img/relation/table.svg',
};
var handler = {
    async saveRelations(data) {
        let res = await biApi.saveRelations(data);
        self.postMessage({
            action: 'handleSaveRelation',
            data: res,
        });
    },
    async getListRelations(data) {
        let res = await biApi.getListRelations(data.searchKey, data.pageSize);
        let dataAfter = {};
        if (res.status == 200) {
            res.data.listObject.forEach(function (e) {
                dataAfter[e.id] = e;
            });
        }
        self.postMessage({
            action: 'handleGetListRelations',
            data: dataAfter,
        });
    },
    getRandomStr() {
        return (Math.random() * 1e20).toString(36);
    },
    async getRelationConfigs(data) {
        let obj = {
            selectedDatasetIds: [],
            relationName: '',
            originDataset: null,
        };
        let res = await biApi.getRelationsConfigs(data.id);
        let configData = res.data;
        obj.relationName = configData.relation.name;
        let datasets = configData.datasets;
        obj.originDataset = datasets;
        obj.datasetsMap = datasets.reduce((map, el) => {
            map[el.dataset.id] = el.dataset;
            return map;
        }, {});
        for (let l of configData.links) {
            l.uid = handler.getRandomStr();
        }
        obj.items = handler.getRappidItems(
            configData.columns,
            configData.subDatasets,
        );
        let subDtsToDtsId = configData.subDatasets.reduce((dts, ele) => {
            dts[ele.id] = ele.id_parent;
            return dts;
        }, {});
        subDtsToDtsId = datasets.reduce((dts, ele) => {
            dts[ele.dataset.id] = ele.dataset.id;
            obj.selectedDatasetIds.push(ele.dataset.id);
            return dts;
        }, subDtsToDtsId);

        obj.links = configData.links.reduce((l, ele) => {
            l.push({
                symperLinkType: ele.type,
                uid: ele.uid,
                source: {
                    id: subDtsToDtsId[ele.id_dataset1],
                    port: ele.id_dataset1 + '_' + ele.col1_name,
                },
                target: {
                    id: subDtsToDtsId[ele.id_dataset2],
                    port: ele.id_dataset2 + '_' + ele.col2_name,
                },
            });
            return l;
        }, []);

        for (let dtsId in obj.items) {
            obj.items[dtsId] = obj.items[dtsId].reduce((map, el) => {
                map[el.id] = el;
                return map;
            }, {});
            obj.items[dtsId] = Object.values(obj.items[dtsId]);
        }
        self.postMessage({
            action: 'handleRelationConfig',
            data: obj,
        });
    },
    async getAllDataset() {
        let res = await biApi.getAllDataset();
        self.postMessage({
            action: 'handleGetAllDataset',
            data: res,
        });
    },
    async handleChangeSelectDataset(data) {
        let resColumn = await biApi.getDatasetColumn(data.node.id);
        let dtsColumns = resColumn.data.columns;
        let subDatasets = resColumn.data.subDatasets;
        let datasets = handler.getRappidItems(dtsColumns, subDatasets);
        self.postMessage({
            action: 'handlerDatasetSelected',
            data: {
                datasets: datasets,
            },
        });
    },
    getRappidItems(dtsColumns, subDatasets) {
        let datasets = {};
        let usedId = {};
        for (let dtsId in dtsColumns) {
            datasets[dtsId] = [];
            for (let column of dtsColumns[dtsId]) {
                let id = dtsId + '_' + column.name;
                if (usedId[id]) {
                    continue;
                }
                datasets[dtsId].push({
                    id: id,
                    label: column.title ? column.title : column.name,
                    icon: relaventIcon[column.type],
                    dataset: dtsId,
                    column: column.name
                });
                usedId[id] = true;
            }
        }

        for (let subDts of subDatasets) {
            datasets[subDts.id_parent].push({
                id: subDts.id,
                label: subDts.alias_name ? subDts.alias_name : subDts.name,
                icon: relaventIcon['table'],
                items: datasets[subDts.id],
            });
        }
        return datasets;
    },
    async deleteRelations(data) {
        let arr = [];
        data.rows.forEach(function (e) {
            arr.push(e.id);
        });
        let res = await relationApi.deleteRelation(arr);
        self.postMessage({
            action: 'handleDeleteRelations',
            data: res.status,
        });
    },
};

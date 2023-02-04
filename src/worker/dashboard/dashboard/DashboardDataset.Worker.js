import { biApi } from '@/api/bi.js';
import { getColumnDataset } from '@/components/dashboard/configPool/dashboardConfigs.js';
import { datasetApi } from '@/api/dataset';
var cacheSearchDataset = {};

onmessage = function (event) {
    let data = event.data;
    let action = data.action;
    if (handler[action]) {
        handler[action](data.data);
    } else {
        console.error(` action ${action} not found `);
    }
};

var handler = {
    async getDatasetInfor(value) {
        let res = await biApi.searchDataset(value.searchKey);
        self.postMessage({
            action: 'handlerGetDatasetInfor',
            data: { res: res },
        });
    },
    async getAllDataset() {
        let res = await biApi.getAllDataset();
        self.postMessage({
            action: 'handleGetAllDataset',
            data: res,
        });
    },
    async getDatasetColumns(data) {
        let res = await biApi.getDatasetColumn(
            data.id,
            data.editInclickhouseMode,
        );
        self.postMessage({
            action: 'handleGetDatasetColumns',
            data: res,
        });
    },

    async getColumnDataset(data) {
        let listDataset = data.listDataset;
        let listColumnInDataset = data.listColumnInDataset;
        let dataPost = await getColumnDataset(
            listDataset,
            listColumnInDataset,
            data.inClickhouseMode,
        );
        self.postMessage({
            action: 'postGetColumnDatasetAfter',
            data: dataPost,
        });
    },
    mapDataToDatasetAndColumn(datasets, listColumnInDataset) {
        let datasetAndColumn = {};
        for (let dts of datasets) {
            dts.title = dts.alias_name ? dts.alias_name : dts.name;
            dts.show = true;
            dts.subDatasetIds = [];
            dts.isSelected = false;
            dts.columns = listColumnInDataset.columns[dts.id];

            for (let cl of dts.columns) {
                cl.show = true;
                cl.isSelected = false;
            }
            if (listColumnInDataset.subDatasets.length > 0) {
                let subDatasets = listColumnInDataset.subDatasets.filter(
                    (item) => {
                        return item.id_parent == dts.id;
                    },
                );
                if (subDatasets.length > 0) {
                    for (let i = 0; i < subDatasets.length; i++) {
                        if (i == 4) {
                        }
                        subDatasets[i].show = true;
                        subDatasets[i].isSubDataset = true;
                        subDatasets[i].title = subDatasets[i].alias_name
                            ? subDatasets[i].alias_name
                            : subDatasets[i].name;
                        subDatasets[i].isSelected = false;

                        dts.subDatasetIds.push(subDatasets[i].id);
                        datasetAndColumn[subDatasets[i].id] = subDatasets[i];
                        datasetAndColumn[subDatasets[i].id].columns =
                            listColumnInDataset.columns[subDatasets[i].id];
                        if (datasetAndColumn[subDatasets[i].id].columns) {
                            for (let clSub of datasetAndColumn[
                                subDatasets[i].id
                            ].columns) {
                                clSub.show = true;
                                clSub.isSelected = false;
                            }
                        }
                    }
                }
            }
            datasetAndColumn[dts.id] = dts;
        }

        return datasetAndColumn;
    },
    async searchDataset(value) {
        value.searchKey = value.searchKey ? value.searchKey : '';
        let res = {};
        if (cacheSearchDataset[value.searchKey]) {
            res = cacheSearchDataset[value.searchKey];
        } else {
            res = await biApi.searchDataset(
                value.searchKey,
                value.editInclickhouseMode,
            );
            for (let item of res.data.listObject) {
                item.aliasName = item.symperId + ' - ' + item.aliasName;
            }
            cacheSearchDataset[value.searchKey] = res;
        }
        self.postMessage({
            action: 'searchDatasetRes',
            data: { res: res, searchKey: value.searchKey },
        });
    },
    postSelectedDatasetBefor(data) {
        let selectedDataset = data.selectedDataset;
        this.clearSelectedItemDisplay(data, true); // call function clear
        let datasetAndColumn = data.datasetAndColumn;
        for (let dtsId in selectedDataset) {
            let dtsInfo = datasetAndColumn[dtsId];
            if (!dtsInfo) {
                continue;
            }
            dtsInfo.isSelected = true;
            datasetAndColumn[dtsId].isSelected = true;
            for (let name in selectedDataset[dtsId]) {
                let column = datasetAndColumn[dtsId].columns.find(
                    (ele) => ele.name == name,
                );
                if (column) {
                    column.isSelected = true;
                }
            }
            if (dtsInfo.id_parent && datasetAndColumn[dtsInfo.id_parent]) {
                datasetAndColumn[dtsInfo.id_parent].isSelected = true;
            }
        }

        self.postMessage({
            action: 'postSelectedDatasetAfter',
            data: { datasetAndColumn: datasetAndColumn },
        });
    },
    clearSelectedItemDisplay(data, flag = false) {
        // flag check trạng thái để return trong hàm hoặc postMessage
        let datasetAndColumn = data.datasetAndColumn;
        for (let key in datasetAndColumn) {
            datasetAndColumn[key].isSelected = false;
            if (
                datasetAndColumn[key].columns &&
                datasetAndColumn[key].columns.length > 0
            ) {
                let columns = datasetAndColumn[key].columns;
                for (let i = 0; i < columns.length; i++) {
                    columns[i].isSelected = false;
                }
            }
        }
        if (flag) {
            return data;
        } else {
            self.postMessage({
                action: 'clearSelectedItemDisplayAfter',
                data: { datasetAndColumn: datasetAndColumn },
            });
        }
    },
    setOpenPanel(data) {
        let datasetAndColumn = data.datasetAndColumn;
        let countParent = 0;
        let maxChildren = 0;
        for (let key in datasetAndColumn) {
            if (!datasetAndColumn[key].id_parent) {
                countParent++;
            }
            if (
                datasetAndColumn[key].subDatasetIds &&
                datasetAndColumn[key].subDatasetIds.length > maxChildren
            ) {
                maxChildren = datasetAndColumn[key].subDatasetIds.length;
            }
        }
        let dataPos = {};
        dataPos.openedPanelParent = [];
        dataPos.openedPanelChild = [];
        for (let i = 0; i < countParent; i++) {
            dataPos.openedPanelParent.push(i);
        }
        for (let i = 0; i < maxChildren; i++) {
            dataPos.openedPanelChild.push(i);
        }

        self.postMessage({ action: 'setOpenPanelAfter', data: dataPos });
    },
    searchDatasetColumn(data) {
        let datasetAndColumn = data.datasetAndColumn;
        let vl = data.vl.toLowerCase();
        if (vl == '') {
            // trường hợp này sẽ lặp qua vòng lặp và gán show = true
            for (let key in datasetAndColumn) {
                datasetAndColumn[key].show = true;
                if (
                    datasetAndColumn[key].columns &&
                    datasetAndColumn[key].columns.length > 0
                ) {
                    let columns = datasetAndColumn[key].columns;
                    for (let i = 0; i < columns.length; i++) {
                        columns[i].show = true;
                    }
                }
            }
        } else {
            for (let key in datasetAndColumn) {
                datasetAndColumn[key].show = false; // ban đầu set show = false, check nếu column chưa text thì set lại bằng true
                if (
                    datasetAndColumn[key].columns &&
                    datasetAndColumn[key].columns.length > 0
                ) {
                    let columns = datasetAndColumn[key].columns;
                    for (let i = 0; i < columns.length; i++) {
                        columns[i].show = false;
                        let name = columns[i].name.toLowerCase();
                        let title = columns[i].title.toLowerCase();
                        if (name.includes(vl) || title.includes(vl)) {
                            columns[i].show = true;
                            datasetAndColumn[key].show = true;
                        }
                    }
                }
            }

            //check trường hợp table con có show = true thì set table cha show = true
            for (let key in datasetAndColumn) {
                if (
                    datasetAndColumn[key].show &&
                    datasetAndColumn[key].id_parent != null
                ) {
                    let keyParent = datasetAndColumn[key].id_parent;
                    datasetAndColumn[keyParent].show = true;
                }
            }
        }

        self.postMessage({
            action: 'searchDatasetColumnAfter',
            data: { datasetAndColumn: datasetAndColumn },
        });
    },
    async getInfoDataFlow(data) {
        let datasetAndColumn = data.datasetAndColumn;
        let inClickhouseMode = data.inClickhouseMode;
        let str = '';
        if (Object.keys(datasetAndColumn).length > 0) {
            for (let key in datasetAndColumn) {
                if (datasetAndColumn[key].type != 'doc') {
                    str += datasetAndColumn[key].id + ',';
                }
            }
        }
        if (str.length > 0) {
            // call api get list info data flow in dataset
            str = str.substring(0, str.length - 1);
            let res = await biApi.getDetailDataflowWithDatasetIds(
                str,
                inClickhouseMode,
            );
            if (res['status'] == 200 && res['data']) {
                self.postMessage({
                    action: 'getInfoDataFlowAfter',
                    data: { infoDataFlow: res['data'] },
                });
            }
        }
    },
    async getDatasetDetail(data) {
        let res = await datasetApi.getDatasetDetail(data.id);
        self.postMessage({
            action: 'handleGetDatasetDetail',
            data: res,
        });
    },
    async deleteRows(data) {
        let arr = [];
        data.rows.forEach(function (e) {
            arr.push(e.id);
        });
        let res = await datasetApi.deleteDataset(arr);
        self.postMessage({
            action: 'handleDeleteRows',
            data: res.status,
        });
    },
};

import { relationApi } from '@/api/relation.js';
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
export default class CrossFilterManagement {
    /**
     * Hàm khởi tạo
     * @param {Array} idRelations mảng chứa các id các relation
     */
    constructor(idRelations,mapsReations=null, onRelationLoaded = null) {
        this.idRelations = idRelations;
        this.mapRelationToRelatedCols = {};
        let self = this;
        if(mapsReations&&mapsReations.data){
            this.maps= self.makeMapDatasetToCol(mapsReations.data)}
        else{
            if (idRelations.length > 0) {
                relationApi.getConfig(idRelations.join(',')).then((res) => {
                    self.maps = self.makeMapDatasetToCol(res.data);
                });
        
            } else {
                self.maps = {};
            }    
        }
        if(typeof onRelationLoaded=='function'){
            onRelationLoaded()}
    }

    /**
     * Tạo các map cần thiết để phục vụ cho
     * @param {Array|Object} data data từ server gửi về
     */
    makeMapDatasetToCol(data) {
        if (!Array.isArray(data)) {
            data = [data];
        }
        let map = {};
        for (let item of data) {
            let mapDatasetToCol = {};
            let mapLinksFromDatasets = {};

            for (let link of item.links) {
                let dts1 = link.id_dataset1;
                let dts2 = link.id_dataset2;

                if (!mapDatasetToCol[dts1]) {
                    mapDatasetToCol[dts1] = {};
                }
                mapDatasetToCol[dts1][link.col1_name] = true;

                if (!mapDatasetToCol[dts2]) {
                    mapDatasetToCol[dts2] = {};
                }
                mapDatasetToCol[dts2][link.col2_name] = true;
                this.makeMapLinks(mapLinksFromDatasets, link);
            }

            map[item.relation.id] = {
                columns: item.columns,
                mapDatasetToCol: mapDatasetToCol,
                links: item.links,
                mapLinksFromDatasets,
            };
        }
        return map;
    }

    addExtraMaplink(extrMapLinks, mapLinks) {
        for (let id in extrMapLinks) {
            if (!mapLinks[id]) {
                mapLinks[id] = {};
            }
            for (let relatedId in extrMapLinks[id]) {
                if (!mapLinks[id][relatedId]) {
                    mapLinks[id][relatedId] = [];
                }
                mapLinks[id][relatedId] = mapLinks[id][relatedId].concat(
                    extrMapLinks[id][relatedId],
                );
            }
        }
        return mapLinks;
    }

    makeConditionForAllDataset(initDatasetId, extrMapLinks = {}) {
        let mapDatasetCondition = {};
        let realations = Object.values(this.maps);
        if (!realations.length) {
            return mapDatasetCondition;
        }
        let mapLinks = {};
        for (let r of realations) {
            mapLinks = _merge(mapLinks, r.mapLinksFromDatasets);
        }
        mapLinks = this.addExtraMaplink(extrMapLinks, mapLinks);

        let orderedLinks = this.orderLinks(mapLinks, initDatasetId);
        let tbNamePlaceHolder = this.getTableNamePlaceHolder(initDatasetId);
        let setCols = {}; // đánh dấu những cột đã được tạo condition
        let initInfo = {
            dtsConds: ['{SYMPER_INIT_CONDITION}'], // điều kiện cho toàn bộ dataset này
            colConds: {}, // condition ứng với từng cột
        };
        for (let relateDatasetId in mapLinks[initDatasetId]) {
            for (let link of mapLinks[initDatasetId][relateDatasetId]) {
                initInfo.colConds[
                    link.fromCol
                ] = `SELECT DISTINCT ${link.fromCol} FROM {${tbNamePlaceHolder}} WHERE {SYMPER_INIT_CONDITION}`;
            }
        }
        mapDatasetCondition[initDatasetId] = initInfo;
        for (let link of orderedLinks) {
            this.makeConditionForCols(link, mapDatasetCondition, setCols);
        }

        return mapDatasetCondition;
    }

    makeConditionForCols(link, mapDatasetCondition, setCols) {
        let nextDts = link.toDataset;
        if (!mapDatasetCondition[nextDts]) {
            mapDatasetCondition[nextDts] = {
                dtsConds: [], // điều kiện cho toàn bộ dataset này
                colConds: {}, // condition ứng với từng cột
            };
        }

        let dtsInfo = mapDatasetCondition[nextDts];
        let nextCol = link.toDataset + '_' + link.toCol;
        if (
            !setCols[nextCol] &&
            !(dtsInfo.dtsConds[0] + '') != '{SYMPER_INIT_CONDITION}'
        ) {
            let tbNamePlaceHolder = this.getTableNamePlaceHolder(
                link.toDataset,
            );
            let colCond =
                mapDatasetCondition[link.fromDataset].colConds[link.fromCol];
            colCond = `{${nextCol}} IN (${colCond})`;
            dtsInfo.dtsConds.push(colCond);
            dtsInfo.colConds[
                link.toCol
            ] = ` SELECT {${nextCol}} FROM {${tbNamePlaceHolder}} WHERE ${colCond}`;
            setCols[nextCol] = true;
        }
    }

    orderLinks(mapLinks, initDatasetId) {
        let rsl = [];
        let setLinks = {};
        let datasetInfo = mapLinks[initDatasetId];
        for (let relatedDataset in datasetInfo) {
            for (let link of datasetInfo[relatedDataset]) {
                this.markSetLink(setLinks, link);
                rsl.push(link);
            }
        }
        this.orderRelatedLinks(mapLinks, setLinks, 0, rsl);
        return rsl;
    }

    orderRelatedLinks(mapLinks, setLinks, currentIndex, rsl) {
        if (currentIndex < rsl.length) {
            let nextDatasetId = rsl[currentIndex].toDataset;
            let datasetInfo = mapLinks[nextDatasetId];
            for (let relatedDataset in datasetInfo) {
                for (let link of datasetInfo[relatedDataset]) {
                    if (!this.checkSetLink(setLinks, link)) {
                        rsl.push(link);
                        this.markSetLink(setLinks, link);
                    }
                }
            }
            this.orderRelatedLinks(mapLinks, setLinks, currentIndex + 1, rsl);
        }
    }

    checkSetLink(setLinks, link) {
        let s1 = link.fromDataset + '_' + link.fromCol;
        let s2 = link.toDataset + '_' + link.toCol;
        return setLinks[s1 + '_' + s2] || setLinks[s2 + '_' + s1];
    }

    markSetLink(setLinks, link) {
        let s1 = link.fromDataset + '_' + link.fromCol;
        let s2 = link.toDataset + '_' + link.toCol;

        setLinks[s1 + '_' + s2] = true;
        setLinks[s2 + '_' + s1] = true;
    }

    getTableNamePlaceHolder(datasetId) {
        return `dataset_${datasetId}_table_name`;
    }

    getColUid(datasetId, colName) {
        return 'col_' + datasetId + '_' + colName;
    }

    makeMapLinks(map, link) {
        let dts1 = link.id_dataset1;
        let dts2 = link.id_dataset2;

        // Tạo map chiều thuận
        if (!map[dts1]) {
            map[dts1] = {};
        }
        if (!map[dts1][dts2]) {
            map[dts1][dts2] = [];
        }
        map[dts1][dts2].push({
            fromDataset: dts1,
            toDataset: dts2,
            fromCol: link.col1_name,
            toCol: link.col2_name,
        });

        // Tạo map chiều nguợc lại
        if (!map[dts2]) {
            map[dts2] = {};
        }
        if (!map[dts2][dts1]) {
            map[dts2][dts1] = [];
        }
        map[dts2][dts1].push({
            fromDataset: dts2,
            toDataset: dts1,
            fromCol: link.col2_name,
            toCol: link.col1_name,
        });
    }
}

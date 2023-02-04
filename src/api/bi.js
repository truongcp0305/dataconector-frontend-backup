import Api from './api';
import { appConfigs } from './../configs.js';

let api = new Api(appConfigs.apiDomain.biService);

export const biApi = {
    getAllDataFlow() {
        return api.get('dataflows');
    },
    getColumnWithDatasetIds(strDatasetIds, inClickhouseMode = false) {
        let url = 'datasets/' + strDatasetIds + '/columns';
        if (inClickhouseMode) {
            url = `https://dev-bi-service.${SYMPER_ENV.tenant_domain}/` + url;
        }
        return api.get(url);
    },
    searchDataset(value, inClickhouseMode = false) {
        let url = 'datasets/get-list?search=' + value;
        if (inClickhouseMode) {
            url = `https://dev-bi-service.${SYMPER_ENV.tenant_domain}/` + url;
        }
        return api.get(url);
    },
    getAllDataset() {
        return api.get('datasets/get-list?page=1&pageSize=1000');
    },
    getDatasetColumn(datasetId, inClickhouseMode) {
        let url = 'datasets/' + datasetId + '/columns';
        if (inClickhouseMode) {
            url = `https://dev-bi-service.${SYMPER_ENV.tenant_domain}/` + url;
        }
        return api.get(url);
    },
    getRelationsConfigs(id) {
        return api.get('relations/' + id + '/get_configs/');
    },
    saveRelations(data) {
        return api.post(
            'relations',
            data,
            {},
            { contentType: 'application/json' },
        );
    },
    getListRelations(searchKey, pageSize = 1000) {
        let searchParam = searchKey != '' ? 'search=' + searchKey + '&' : '';
        return api.get(
            'relations?' + searchParam + 'page=1&pageSize=' + pageSize,
        );
    },
    getDetailDataflowWithDatasetIds(strDatasetIds, inClickhouseMode = false) {
        let url = 'dataflow/nodes/datasets-inside/' + strDatasetIds;
        if (inClickhouseMode) {
            url =
                `https://dev-bi-service.${SYMPER_ENV.tenant_domain}/dataflow/nodes/datasets-inside/` +
                strDatasetIds;
        }
        return api.get(url);
    },
    deleteDashboard(id) {
        return api.delete('dashboards/' + id);
    },
};

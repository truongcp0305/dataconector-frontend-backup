import Api from './api';
import { appConfigs } from './../configs.js';

let api = new Api(appConfigs.apiDomain.biService);

export const datasetApi = {
    getListByFilter(filter, inClickhouseMode = false) {
        let url = `${appConfigs.apiDomain.biService}datasets/get-list`;
        if (inClickhouseMode) {
            url = `${appConfigs.apiDomain.biService}/datasets/get-list`;
        }
        return api.get(url, filter);
    },
    getDatasetDetail(id, inClickhouseMode = false) {
        let url = 'dataflow/nodes/datasets-inside/' + id;
        if (inClickhouseMode) {
            url =
                `${appConfigs.apiDomain.biService}/dataflow/nodes/datasets-inside/` +
                id;
        }
        return api.get(url);
    },
    deleteDataset(ids) {
        return api.delete('datasets/' + ids);
    },
    getListDatasetByName(name,dataflowId,nodeId){
        let url=`${appConfigs.apiDomain.biService}/datasets/get-dataset-by-name`
        let data={
            name:name,
            dataflowId:dataflowId,
            nodeId:nodeId
        }
        return api.post(url,data)
    }
};

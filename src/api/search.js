import Api from './api';
import { appConfigs } from './../configs.js';

let api = new Api(appConfigs.apiDomain.search);
let apiSyql = new Api(appConfigs.apiDomain.formulasService);

export default {
    getData(value) {
        return api.post('search', {
            keyword: value,
        });
    },
    getInfoSyql(id) {
        return apiSyql.get('formulas/' + id + '/source');
    },
};

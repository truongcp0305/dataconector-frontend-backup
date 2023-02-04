import Api from './api';
import { appConfigs } from './../configs.js';
import { util } from '../plugins/util';

let api = new Api(appConfigs.apiDomain.biService);

export const relationApi = {
    getConfig(id) {
        return api.get('relations/' + id + '/get_configs/');
    },
    deleteRelation(id) {
        return api.delete('relations/' + id);
    },
    restore(id){
        return api.put('relations/'+id+'/restore');
    },
    
};

import Api from './api';
import { appConfigs } from './../configs.js';

var moduleApi = new Api(appConfigs.apiDomain.syqlFunction);
export const syqlFunctionApi = {
    deleteFunction(id) {
        return moduleApi.delete('functions/' + id);
    },
    addFunction(data) {
        return moduleApi.post('functions', data);
    },
    editFunction(id, data) {
        return moduleApi.put('functions/' + id, data);
    },
    viewFunction(id) {
        return moduleApi.get('functions/' + id);
    },
    updateBulk(data) {
        return moduleApi.post('formulas/compileClientBulk', data);
    },
};

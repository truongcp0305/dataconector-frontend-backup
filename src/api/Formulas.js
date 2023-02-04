import Api from './api';
import { appConfigs } from './../configs.js';

var api = new Api(appConfigs.apiDomain.formulasService);
export const formulasApi = {
    saveMultiFormulas(data) {
        return api.post('formulas/batch', data);
    },
    updateMultiFormulas(data) {
        return api.put('formulas/batch', data);
    },
    saveFormulas(data) {
        return api.post('formulas', data);
    },
    updateFormulas(id, data) {
        return api.put('formulas/' + id, data);
    },
    detailFormulas(id) {
        return api.get('formulas/' + id);
    },
    execute(data) {
        return api.post('formulas/get-data', data);
    },
    getMultiData(data) {
        return api.post('formulas/get-data-multi', data);
    },
    getRelated(data) {
        return api.post('formulas/query-related', data);
    },
    getDataByAllScriptType(formula, dataInput) {
        return api.post(
            'formulas/compileClient',
            {
                formulas: formula,
                variables:
                    typeof dataInput == 'string'
                        ? dataInput
                        : JSON.stringify(dataInput),
            },
            {},
            {
                dataType: 'text',
            },
        );
    },
};

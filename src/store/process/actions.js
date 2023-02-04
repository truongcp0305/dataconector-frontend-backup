import workflowApi from '@/api/BPMNEngine.js';
import { SYMPER_APP } from '@/main.js';
import BPMNEngine from '../../api/BPMNEngine';
const action1 = (state, data) => {
    state.data = data;
};

const getAllDefinitions = async (context) => {
    return new Promise(async (resolve, reject) => {
        if ($.isEmptyObject(context.state.allDefinitions)) {
            try {
                // let res = await workflowApi.getDefinitions({
                let res = await workflowApi.getListModels();
                context.commit('setAllDefinition', res.data.listObject);
                resolve(res);
            } catch (error) {
                SYMPER_APP.$snotifyError(error, 'Can not get all definitions!');
                reject(error);
            }
        } else {
            resolve({});
        }
    });
};

const getLastestProcessDefinition = async function (context) {
    try {
        let res = await BPMNEngine.getLastestByModel();
        if (res.status == 200) {
            let data = res.data;
            for (let obj of data) {
                obj.modelName = obj.modelId + ' - ' + obj.modelName;
            }
            context.commit('setAllWorkflowModel', data);
        } else {
            SYMPER_APP.$snotifyError(res, 'Can not get list workflow models');
        }
    } catch (error) {
        SYMPER_APP.$snotifyError(error, 'Can not get list workflow models');
    }
};

export { getAllDefinitions, getLastestProcessDefinition };

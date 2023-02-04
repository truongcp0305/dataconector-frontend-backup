import { taskApi } from './../../api/task.js';
import { appManagementApi } from './../../api/AppManagement.js';
import { SYMPER_APP } from './../../main.js';
import BPMNEngine from '@/api/BPMNEngine.js';

const getArrFileAttachment = async (context, data) => {
    try {
        let res = await taskApi.getFileByList(data);
        if (res.status == 200) {
            if (res.data != null) {
                context.commit('setArrFileAttach', res.data);
            }
        } else {
            context.commit('setArrFileAttach', []);
        }
    } catch (error) {
        context.commit('setArrFileAttach', []);
        // SYMPER_APP.$snotifyError(error, "Can not get list file attachment document !");
        console.log('Can not get list file attachment!');
    }
};
const removeFileAttachToStore = async (context, id) => {
    context.commit('removeFileAttachToStore', id);
};
const getTaskHistory = async (context, id) => {
    context.commit('setCurrentId', id);
    if (!context.state.taskHistory[id]) {
        let data = [];
        let res = await taskApi.getHistoryTask(id);
        if (res.status == 200) {
            data = res.data;
        }
        context.commit('setTaskHistory', { data: data, id: id });
    }
};

const getArrDocObjId = async (context, data) => {
    try {
        let res = await taskApi.getDocumentObjIds({
            ids: JSON.stringify(data),
        });
        if (res.status == 200) {
            if (res.data != null) {
                context.commit('setArrDocObjId', res.data);
            }
        } else {
            context.commit('setArrDocObjId', []);
        }
    } catch (error) {
        context.commit('setArrDocObjId', []);
        console.log('Can not get list documentObjId!');
    }
};

const getListDocumentObjId = async (context, data) => {
    try {
        let res = await taskApi.getDocumentObjIds({
            ids: JSON.stringify(data),
        });
        if (res.status == 200) {
            if (res.data != null) {
                context.commit('setListDocumentObjId', res.data);
                console.log('listObjRelated', res.data);
            }
        } else {
            context.commit('setListDocumentObjId', []);
        }
    } catch (error) {
        context.commit('setListDocumentObjId', []);
        console.log('Can not get list documentObjId!');
    }
};

const getListDocumentObjIdWithUserSubmit = async (context, data) => {
    try {
        let res = await taskApi.getListDocumentWithUserSubmit(data);
        if (res.status == 200) {
            if (res.data != null) {
                context.commit('setListDocumentObjIdWithUserSubmit', res.data);
                console.log('listObjUserSumbit', res.data);
            }
        } else {
            context.commit('setListDocumentObjIdWithUserSubmit', []);
        }
    } catch (error) {
        context.commit('setListDocumentObjIdWithUserSubmit', []);
        console.log('Can not get list documentObjIdWithUserSubmit!');
    }
};
const getAllAppActive = async (context) => {
    if (context.state.allAppActive.length == 0) {
        try {
            let res = await appManagementApi.getActiveApp();
            if (res.status == 200) {
                context.commit('setAllAppActive', res.data.listObject);
                console.log('allapp', res.data.listObject);
            }
        } catch (error) {
            console.log('Can not get list app!');
        }
    }
};
const getListNodeInProcess = async (context) => {
    if (context.state.listNodeInProcess.length == 0) {
        try {
            let res = await taskApi.getListNodeInProcess();
            if (res.status == 200) {
                if (res.data != false) {
                    context.commit('setListNodeInProcess', res.data);
                }
            }
        } catch (error) {
            console.log('Can not get list app!');
        }
    }
};
const getVariableOfProcess = async (context, data) => {
    try {
        let res = await taskApi.getVariableWorkflow(data);
        if (res.status == 200) {
            context.commit('setVariableOfProcess', res.data);
            console.log('variablesProcess', res.data);
        }
    } catch (error) {
        console.log('Can not get variable of process!');
    }
};

const getModelerInfor = async (context, id) => {
    if (!context.state.allModelerInfo[id]) {
        let res = await BPMNEngine.getDefinitionModel(id);
        context.commit('setModelerInfo', { id: id, data: res });
    }
};

export {
    getArrFileAttachment,
    removeFileAttachToStore,
    getArrDocObjId,
    getListDocumentObjId,
    getListDocumentObjIdWithUserSubmit,
    getAllAppActive,
    getListNodeInProcess,
    getVariableOfProcess,
    getTaskHistory,
    getModelerInfor,
};

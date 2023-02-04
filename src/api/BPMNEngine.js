import Api from './api'; // import class api vào để sử dụng
import { appConfigs } from './../configs.js'; // trong trường hợp này ta cần sử dụng domain của từng module nghiệp vụ được định nghĩa trong file config
import { util } from '../plugins/util';

var bpmneApi = new Api(appConfigs.apiDomain.bpmne.models); // Khởi tạo một đối tượng api với domain của service BPMNE
let workfloweExtend = new Api(appConfigs.apiDomain.workflowExtend);

let testHeader = {
    'Content-Type': 'application/json',
};

let testOptions = {};
export default {
    /**
     * Lấy danh sách các process đã được tạo ra
     */
    getListModels(filter = {}) {
        return bpmneApi.get('', filter);
    },
    getListModelsTrash(filter = {}) {
        return bpmneApi.get('/trash', filter);
    },
    restoreListModels(ids) {
        return bpmneApi.put('/restore', { ids: JSON.stringify(ids) });
    },
    deleteModels(ids) {
        return bpmneApi.delete(ids.join(','));
    },
    createModel(data) {
        return bpmneApi.post('', data);
    },
    updateModel(data, idModel) {
        return bpmneApi.put(`${idModel}`, data);
    },
    validateModel(data) {
        return bpmneApi.post(
            appConfigs.apiDomain.bpmne.validateModel,
            data,
            testHeader,
        );
    },
    getModelData(modelId) {
        return bpmneApi.get(modelId);
    },
    getModelXML(modelId) {
        return bpmneApi.get(`${modelId}/editor/bpmn20`, {}, testHeader, {
            dataType: 'text',
        });
    },
    deployProcess(params, file) {
        let subfix = [];
        for (let key in params) {
            subfix.push(`${key}=${params[key]}`);
        }
        subfix = '?' + subfix.join('&');
        let testHeaderClone = util.cloneDeep(testHeader);
        delete testHeaderClone['Content-Type'];
        var fd = new FormData();
        fd.append('file', file);
        return bpmneApi.post(
            appConfigs.apiDomain.bpmne.deployments + subfix,
            fd,
            testHeaderClone, {
            processData: false,
            contentType: false,
        },
        );
    },
    getDeployments(filter) {
        return bpmneApi.get(
            appConfigs.apiDomain.bpmne.deployments,
            filter,
            testHeader,
        );
    },
    createProcessInstance(data) {
        data = JSON.stringify(data);
        return bpmneApi.post(
            appConfigs.apiDomain.bpmne.instances,
            data,
            testHeader,
        );
    },
    // Lấy data model của process definition
    getDefinitionModel(id) {
        return bpmneApi.get(
            appConfigs.apiDomain.bpmne.definitions + '/' + id + '/model', {},
            testHeader,
        );
    },
    // Lấy danh sách của process definition
    getDefinitions(filter = {}) {
        return bpmneApi.get(
            appConfigs.apiDomain.bpmne.definitions,
            filter,
            testHeader,
        );
    },
    // Lấy data của process definition
    getDefinitionXML(url) {
        return bpmneApi.get(url, {}, testHeader, {
            dataType: 'text',
        });
    },
    // Lấy data của process definition
    getDefinitionData(id) {
        return bpmneApi.get(
            appConfigs.apiDomain.bpmne.definitions + '/' + id, {},
            testHeader,
        );
    },
    // Lấy data của một process instance
    getProcessInstanceData(id) {
        let filter = {};
        filter.processInstanceId = id;

        return bpmneApi.post(
            appConfigs.apiDomain.bpmne.historyInstances,
            JSON.stringify(filter),
            testHeader,
        );
        //return bpmneApi.get(appConfigs.apiDomain.bpmne.instances + '/' + id, {}, testHeader);
    },
    // Lấy các viriable của một process instance
    async getProcessInstanceVars(id) {
        let res = await bpmneApi.get(
            appConfigs.apiDomain.bpmne.historyInstancesDel, {
            processInstanceId: id,
            includeProcessVariables: true,
        },
            testHeader,
        );
        return res.data[0].variables;
    },
    // Lấy lịch sử chạy các node trong process instance
    getProcessInstanceRuntimeHistory(id) {
        return bpmneApi.get(
            appConfigs.apiDomain.bpmne.history +
            '/historic-activity-instances?size=1000&processInstanceId=' +
            id,
            {},
            testHeader,
        );
    },
    getProcessInstance(filter = {}) {
        return bpmneApi.get(
            appConfigs.apiDomain.bpmne.instances,
            filter,
            testHeader,
        );
    },
    getProcessInstanceHistory(filter = {}) {
        if (filter.page && filter.size) {
            filter.start = (filter.page - 1) * filter.size;
            delete filter.page;
        }
        filter = JSON.stringify(filter);
        return bpmneApi.post(
            appConfigs.apiDomain.bpmne.historyInstances,
            filter,
            testHeader,
        );
    },
    addTask(data) {
        return bpmneApi.post(
            appConfigs.apiDomain.bpmne.tasks,
            data,
            testHeader,
        );
    },
    getTask(filter) {
        for (let key in filter) {
            if (!filter[key]) {
                delete filter[key];
            }
        }
        if (filter.nameLike == '%%') {
            delete filter.nameLike;
        }
        if (filter.page && filter.size) {
            filter.start = (filter.page - 1) * filter.size;
            delete filter.page;
        }
        if (filter.status == 'done') {
            filter.sort =
                filter.sort == 'createTime' ? 'startTime' : filter.sort;
            if (filter.assignee) {
                filter.taskAssignee = filter.assignee;
            }
            if (filter.owner) {
                filter.taskOwner = filter.owner;
            }
            if (filter.nameLike) {
                filter.taskNameLike = filter.nameLike;
            }
            if (filter.involvedUser) {
                filter.taskInvolvedUser = filter.involvedUser;
                delete filter.involvedUser;
            }
            filter.finished = true;
            return bpmneApi.get(
                appConfigs.apiDomain.bpmne.tasksHistory,
                filter,
                testHeader,
            );
        } else {
            return bpmneApi.get(
                appConfigs.apiDomain.bpmne.tasks,
                filter,
                testHeader,
            );
        }
    },
    getSubtasks(idParent, filter) {
        if (filter.status == 'done') {
            filter.parentTaskId = idParent;
            filter.finished = true;
            if (filter.page && filter.size) {
                filter.start = (filter.page - 1) * filter.size;
                delete filter.page;
            }
            filter.sort = 'endTime';
            filter = JSON.stringify(filter);
            return bpmneApi.post(
                appConfigs.apiDomain.bpmne.postTasksHistory,
                filter,
                testHeader,
            );
        } else {
            return bpmneApi.get(
                appConfigs.apiDomain.bpmne.tasks + '/' + idParent + '/subtasks',
                filter,
                testHeader,
            );
        }
    },
    async getATaskInfo(taskId, filter = 'notDone') {
        if (filter == 'done') {
            return bpmneApi.get(
                appConfigs.apiDomain.bpmne.tasksHistory + '/' + taskId, {},
                testHeader,
            );
        } else {
            try {
                let result = bpmneApi.get(
                    appConfigs.apiDomain.bpmne.tasks + '/' + taskId, {},
                    testHeader,
                );
                await result;
                return result;
            } catch (error) {
                return bpmneApi.get(
                    appConfigs.apiDomain.bpmne.tasksHistory + '/' + taskId, {},
                    testHeader,
                );
            }
        }
    },
    updateTask(taskId, data) {
        data = JSON.stringify(data);
        return bpmneApi.put(
            appConfigs.apiDomain.bpmne.tasks + '/' + taskId,
            data,
            testHeader,
        );
    },
    actionOnTask(id, data) {
        data = JSON.stringify(data);
        return bpmneApi.post(
            appConfigs.apiDomain.bpmne.tasks + '/' + id,
            data,
            testHeader, {
            dataType: 'text',
        },
        );
    },

    saveDeployHistory(data) {
        return bpmneApi.post('/deploy-history', data);
    },

    getLastestByModel() {
        return bpmneApi.get('/deploy-history/lastest-by-model');
    },
    postTaskHistory(filter) {
        if (filter.assignee) {
            filter.taskAssignee = filter.assignee;
            delete filter.assignee;
        }
        if (filter.involvedUser) {
            filter.taskInvolvedUser = filter.involvedUser;
            delete filter.involvedUser;
        }
        if (filter.page && filter.size) {
            filter.start = (filter.page - 1) * filter.size;
            delete filter.page;
        }
        filter.sort = filter.sort == 'createTime' ? 'startTime' : filter.sort;
        filter = JSON.stringify(filter);
        return bpmneApi.post(
            appConfigs.apiDomain.bpmne.postTasksHistory,
            filter,
            testHeader,
        );
    },
    getXMLFromProcessDefId(defId) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            let defData = await bpmneApi.get(
                appConfigs.apiDomain.bpmne.definitions + '/' + defId, {},
                testHeader,
            );
            if (!defData.exception) {
                let resourceDataUrl =
                    appConfigs.apiDomain.bpmne.general +
                    'symper-rest/service/repository/deployments/' +
                    defData.deploymentId +
                    '/resourcedata/process_draft.bpmn';
                let prveXML = await self.getDefinitionXML(resourceDataUrl);
                resolve(prveXML);
            } else {
                reject(defData);
            }
        });
    },
    getTaskDetail(id) {
        return bpmneApi.get(
            appConfigs.apiDomain.bpmne.tasks + '/' + id, {},
            testHeader,
        );
    },
    changeTaskAction(id, data) {
        return bpmneApi.post(
            appConfigs.apiDomain.bpmne.tasks + '/' + id,
            JSON.stringify(data),
            testHeader,
        );
    },

    updateProcessInstance(id, data) {
        return bpmneApi.put(
            appConfigs.apiDomain.bpmne.general +
            `symper-rest/service/runtime/process-instances/${id}`,
            JSON.stringify(data),
            testHeader,
        );
    },
    getProcessByProcessKey(defId) {
        return bpmneApi.get(
            appConfigs.apiDomain.bpmne.models + 'process-key/' + defId,
        );
    },
    // lấy danh sách quy trình theo docId
    getProcessByDocId(docId) {
        return bpmneApi.get(
            appConfigs.apiDomain.bpmne.models +
            `related-docs/${docId}/workflows?startDoc=true`,
        );
    },
    updateDoneTaskInfo(taskId, data) {
        return workfloweExtend.put('tasks/' + taskId, data);
    },
    getRelatedTasksInfoByDocObjId(docObjIds = []) {
        return workfloweExtend.post('tasks/by-doc-obj-ids', { ids: docObjIds });
    },
    /**
     * Biến data cần có dạng
     * {
     *      action: submit | update // action với doc instance
     *      data: {...} // các data phục vụ cho việc submit doc
     *      taskId: '' // id của task cần hoàn thành
     *      assignee: '' // assignee sau khi đã xác định được chính xác role
     * }
     * @param {Object} data
     * @returns
     */
    submitTask(data) {
        return workfloweExtend.post('submit-task', data);
    },
    startProcessInstanceByModelerId(modelerId, vars = []) {
        return workfloweExtend.post('process-instance/start-by-modeler-id', JSON.stringify({
            "processModelId": modelerId,
            "vars": vars
        }), testHeader);
    }
};
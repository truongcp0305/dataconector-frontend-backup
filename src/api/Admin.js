import Api from './api';
import { appConfigs } from './../configs.js';

var bpmneApi = new Api(appConfigs.apiDomain.bpmne.models);
var documentApi = new Api(appConfigs.apiDomain.sdocumentManagement);
var workflowExtendApi = new Api(appConfigs.apiDomain.workflowExtend);
let testHeader = {
    'Content-Type': 'application/json',
};
export const adminApi = {
    getLatestWD(key) {
        return bpmneApi.get(
            appConfigs.apiDomain.bpmne.definitions,
            { key: key, latest: true },
            testHeader,
        );
    },
    stopProcessInstances(id) {
        return bpmneApi.put(
            appConfigs.apiDomain.bpmne.instances + '/' + id,
            JSON.stringify({
                action: 'suspend',
            }),
            testHeader,
        );
    },
    activeProcessInstances(id) {
        return bpmneApi.put(
            appConfigs.apiDomain.bpmne.instances + '/' + id,
            JSON.stringify({
                action: 'activate',
            }),
            testHeader,
        );
    },
    deleteProcessInstances(id) {
        return bpmneApi.delete(
            appConfigs.apiDomain.bpmne.instances + '/' + id,
            {},
        );
    },
    deleteTask(id) {
        return bpmneApi.delete(
            appConfigs.apiDomain.bpmne.historyInstancesDel + '/' + id,
            {},
        );
    },
    deleteHistoryTaskIntance(id) {
        return bpmneApi.delete(
            appConfigs.apiDomain.bpmne.tasksHistory + '/' + id,
            {},
        );
    },
    stopProcessDefinition(id) {
        return bpmneApi.put(
            appConfigs.apiDomain.bpmne.definitions + '/' + id,
            JSON.stringify({
                action: 'suspend',
            }),
            testHeader,
        );
    },
    aggregateWorkflow(id) {
        return workflowExtendApi.get('workflow/' + id + '/aggregate');
    },
    trackingProcess(id) {
        return workflowExtendApi.get('workflow/' + id + '/tracking');
    },
    deleteDocumentObject(objectIds) {
        return documentApi.delete('documents/objects', objectIds);
    },
    getProcessDefinationDetail(id) {
        return bpmneApi.get(
            appConfigs.apiDomain.bpmne.definitions + '/' + id,
            {},
            testHeader,
        );
    },
    getTimerJobDetail(id) {
        return bpmneApi.get(
            appConfigs.apiDomain.bpmne.timerJob + '/' + id,
            {},
            testHeader,
        );
    },
    getStartUserName(ids) {
        return workflowExtendApi.post('variables/query', {
            names: 'symper_user_id_start_workflow',
            processInstanceIds: ids,
            page: 1,
            pageSize: 1000,
        });
    },
    getListProcessInstances(id) {
        return workflowExtendApi.get(id + '/process-instances');
    },
    removeJob(id) {
        return workflowExtendApi.delete('jobs/' + id);
    },
};

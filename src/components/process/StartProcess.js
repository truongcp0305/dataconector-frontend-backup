import BPMNEApi from './../../api/BPMNEngine';
import { SYMPER_APP } from './../../main';
import { formulasApi } from './../../api/Formulas';
import { taskApi } from './../..//api/task.js';
import {
    runProcessDefinition,
    extractTaskInfoFromObject,
    addMoreInfoToTask,
} from './processAction';
let data = {
    taskInfo: {},
    originData: {},
};
let userId = SYMPER_APP.$store.state.app.endUserInfo.id;
let filterVariables = {
    names: 'symper_application_id',
    page: 1,
    processInstanceIds: [],
};
let variableProcess = [];
export const getFirstNodeData = async function (
    _paramId,
    handler = false,
    toNewTask = true,
) {
    let idDefinition = _paramId;
    let definitionModel = await BPMNEApi.getDefinitionModel(idDefinition);
    let documentToStart = getStartDocId(definitionModel);
    if (documentToStart && documentToStart != 'null') {
        taskInfo.action.parameter.documentId = documentToStart;
    } else {
        let processDef = await BPMNEApi.getDefinitionData(idDefinition);
        try {
            let instanceName = await getInstanceName([], definitionModel);
            let newProcessInstance = await runProcessDefinition(
                null,
                processDef,
                [],
                instanceName,
            );
            toNewTask &&
                (await checkAndGotoMyTask(newProcessInstance, handler));
        } catch (error) {
            showNotify(error);
        }
    }
};
function showNotify(error) {
    return SYMPER_APP.$snotifyError(error);
}
function getStartDocId(definitionModel) {
    return Number(definitionModel.mainProcess.initialFlowElement.formKey);
}
async function checkAndGotoMyTask(newProcessInstance, handler = false) {
    let filter = {};
    let arrTask = [];
    filter.processInstanceId = newProcessInstance.id;
    let dataTaskNew = await BPMNEApi.getTask(filter); // lấy task theo quy trình hiện tại
    if (dataTaskNew.total > 0) {
        arrTask = dataTaskNew.data;
    } else {
        // lấy task theo quy trình con
        let childProcessInstances = await BPMNEApi.getProcessInstance({
            superProcessInstanceId: newProcessInstance.id,
        });
        if (childProcessInstances.data.length > 0) {
            let myTasks = [];
            for (let instance of childProcessInstances.data) {
                myTasks.push(
                    BPMNEApi.getTask({
                        processInstanceId: instance.id,
                    }),
                );
            }
            myTasks = await Promise.all(myTasks);
            for (let res of myTasks) {
                arrTask = arrTask.concat(res.data);
            }
        }
    }

    for (let task of arrTask) {
        let assignee = task.assignee;
        if (assignee && assignee.indexOf(':') > 0) {
            assignee = assignee.split(':')[0];
        }
        if (assignee == userId) {
            setTaskInfo(task.id);
        }
    }
    if (handler) {
        SYMPER_APP.$goToPage(
            '/myitem/tasks/' + arrTask[0].id,
            SYMPER_APP.$t('v2.workflow.taskDetails'),
        );
    }
}
async function setTaskInfo(taskId) {
    if (taskId) {
        let filter = {};
        filter.taskId = taskId;
        let res = await BPMNEApi.postTaskHistory(filter);
        if (res.total > 0) {
            let task = res.data[0];
            let taskInfo = extractTaskInfoFromObject(task);
            task = addMoreInfoToTask(task);
            data.taskInfo = taskInfo;
            data.originData = task;
            if (task.processInstanceId && task.processInstanceId != null) {
                await getVariablesProcess(task.processInstanceId);
            }
        }
    }
}
async function getVariablesProcess(processInstanceId) {
    let arrProcess = [];
    arrProcess.push(processInstanceId);
    filterVariables.processInstanceIds = JSON.stringify(arrProcess);
    let resVariable = {};
    resVariable = await taskApi.getVariableWorkflow(filterVariables);
    variableProcess = resVariable.data;
    SYMPER_APP.$store.commit('process/getInfoTask', {
        data: data,
        variableProcess: variableProcess,
    });
    SYMPER_APP.$snotifySuccess(SYMPER_APP.$t('v2.workflow.processInitiationSuccessful'));
}
async function getInstanceName(dataInput, definitionModel) {
    return new Promise((resolve, reject) => {
        let dataObjs = definitionModel.processes[0].dataObjects;
        let dataObjsMap = {};
        for (let obj of dataObjs) {
            let objKey = obj.id.replace(
                definitionModel.mainProcess.id + '_',
                '',
            );
            dataObjsMap[objKey] = obj;
        }
        let formula = dataObjsMap.instanceDisplayText
            ? dataObjsMap.instanceDisplayText.value
            : '';
        if (!formula || String(formula).trim() == '') {
            resolve('');
        } else {
            if (dataObjsMap.instanceDisplayText) {
                formulasApi
                    .getDataByAllScriptType(
                        dataObjsMap.instanceDisplayText.value,
                        JSON.stringify(dataInput),
                    )
                    .then((formulaData) => {
                        resolve(formulaData);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else {
                resolve('');
            }
        }
    });
}

import { formulasApi } from '@/api/Formulas';
import { adminApi } from '@/api/Admin';
import BPMNEngine from '@/api/BPMNEngine';

function needComplyFormula(str) {
    return /ref\s*\(|select |\$\{/i.test(str);
}

async function updateProcessInstanceName(params) {
    let formulaName = params.formulaName;
    let dataInput = params.dataInput;

    if (needComplyFormula(formulaName)) {
        let newName = await formulasApi.getDataByAllScriptType(
            formulaName,
            dataInput,
        );
        BPMNEngine.updateProcessInstance(params.processInstanceId, {
            name: newName,
        });
    }
}

function objectToStrIncludeFuncs(obj) {
    let newObj = {};
    let funcToStrMap = {};
    for (let key in obj) {
        if (typeof obj[key] == 'function') {
            funcToStrMap[key] = obj[key].toString();
            newObj[key] = `SYMPER_PLACEHOLDER_FUNCTION_KEY_${key}`;
        } else {
            newObj[key] = obj[key];
        }
    }
    newObj = JSON.stringify(newObj);
    for (let key in funcToStrMap) {
        newObj = newObj.replace(
            `"SYMPER_PLACEHOLDER_FUNCTION_KEY_${key}"`,
            funcToStrMap[key],
        );
    }
    return newObj;
}

function getInitStatements(vars) {
    let varDefs = [];
    for (let name in vars) {
        let vl = addslashes(vars[name]);
        varDefs.push(`let ${name} = '${vl}';`);
    }
    varDefs = varDefs.join('');
    let obj = {
        getVariable(varName) {
            return eval(`
                if(typeof ${varName} == 'undefined'){
                    null;
                }else{
                    ${varName};
                }
            `);
        },
    };
    let objStr = objectToStrIncludeFuncs(obj);
    return `
        ${varDefs};
        let execution = ${objStr};
    `;
}

async function checkNeedUpdateInfo(
    formula,
    allVars,
    curVars,
    task,
    initStatements,
) {
    let rsl = {
        needUpdate: false,
        newValue: '',
    };
    let needComplyOnServer = /ref\s*\(|select /i.test(formula);
    if (needComplyOnServer) {
        let varsName = formula.match(/{([a-zA-Z0-9].*?)}/g);
        if (varsName) {
            for (let name of varsName) {
                name = name.trim().replace('{', '').replace('}', '');
                // Nếu công thức truy vấn từ server và các biến trong công thức phụ thuộc vào các biến mà node này cung cấp
                if (curVars.hasOwnProperty(name)) {
                    rsl.needUpdate = true;
                    rsl.newValue = await formulasApi.getDataByAllScriptType(
                        formula,
                        allVars,
                    );
                    break;
                }
            }
        }
    } else {
        let formulaAfter = formula;
        try {
            formulaAfter = eval(initStatements + '`' + formula + '`');
        } catch (error) {
            console.warn(error);
        }

        if (formulaAfter != formula) {
            rsl.needUpdate = true;
            rsl.newValue = formulaAfter;
        } else {
            rsl.needUpdate = false;
        }
    }
    return rsl;
}
function addslashes(string) {
    if (typeof string != 'string') {
        return string;
    } else {
        return string
            .replace(/\\/g, '\\\\')
            .replace(/\u0008/g, '\\b')
            .replace(/\t/g, '\\t')
            .replace(/\n/g, '\\n')
            .replace(/\f/g, '\\f')
            .replace(/\r/g, '\\r')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"');
    }
}

async function updateTaskInfo(data) {
    let vars = data.vars;
    let task = data.task;
    let curVars = data.currentVars;
    if (vars.SYMPER_EXTRA_RUNNING_INFO) {
        let nodes = JSON.parse(
            vars.SYMPER_EXTRA_RUNNING_INFO,
        ).autoUpdateTaskInfo;
        delete vars.SYMPER_EXTRA_RUNNING_INFO;
        let str = getInitStatements(vars);
        let needUpdateTaskIden = {};

        // sau các vòng lặp này sẽ xác định được cần update cho những thông tin gì của task nào
        for (let nodeId in nodes) {
            for (let formulaType in nodes[nodeId]) {
                let formula = nodes[nodeId][formulaType];
                let tmpVl = await checkNeedUpdateInfo(
                    formula,
                    vars,
                    curVars,
                    task,
                    str,
                );
                if (tmpVl.needUpdate) {
                    if (!needUpdateTaskIden[nodeId]) {
                        needUpdateTaskIden[nodeId] = {};
                    }
                    needUpdateTaskIden[nodeId][formulaType] = tmpVl.newValue;
                }
            }
        }

        let taskKeys = Object.keys(needUpdateTaskIden);
        if (taskKeys.length > 0) {
            let tasks = await BPMNEngine.postTaskHistory({
                taskDefinitionKeys: taskKeys,
                processInstanceId: task.processInstanceId,
                sort: 'createTime',
            });
            let arr = [];
            for (let task of tasks.data) {
                if (
                    changeTaskData(
                        task,
                        needUpdateTaskIden[task.taskDefinitionKey],
                    )
                ) {
                    let tmp = BPMNEngine.updateDoneTaskInfo(task.id, {
                        description: task.description,
                    });
                    arr.push(tmp);
                }
            }
            await Promise.allSettled(arr);
            self.postMessage({
                action: 'handleUpdatedTaskInfoInWorker',
            });
        }
    }
}

function changeTaskData(task, newValue) {
    let canUpdate = false;
    let des = JSON.parse(task.description);
    for (let key in newValue) {
        if (des[key] != newValue[key]) {
            canUpdate = true;
            des[key] = newValue[key];
        }
    }
    task.description = JSON.stringify(des);
    return canUpdate;
}

function updateTasksInfoAndProcessName(data) {
    updateProcessInstanceName(data.processInstance);
}
async function deleteTask(data) {
    try {
        let delProcIns = await adminApi.deleteProcessInstances(data.processInstanceId);
        let delHisTask = await adminApi.deleteHistoryTaskIntance(data.id);
        self.postMessage({
            action: 'handleDeleteTask',
        });
    } catch (err) {
        self.postMessage({
            action: 'handleDeleteTaskError',
            data: err,
        });
    }
}

function deleteTasks(data) {
    try {
        let k = [];
        for (let i = 0; i < data.length; i++) {
            k.push(
                adminApi.deleteProcessInstances(data[i].task.processInstanceId),
            );
        }
        Promise.all(k)
            .then((result) => {
                let h = [];
                for (let i = 0; i < data.length; i++) {
                    h.push(adminApi.deleteHistoryTaskIntance(data[i].task.id));
                }
                Promise.all(h)
                    .then((result) => {
                        self.postMessage({
                            action: 'handleDeleteTasks',
                        });
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            })
            .catch((err) => {
                console.error(err);
            });
    } catch (err) {
        self.postMessage({
            action: 'handleDeleteTaskError',
            data: err,
        });
    }
}

self.onmessage = async function (event) {
    let action = event.data.action;
    let data = event.data.data;

    switch (action) {
        case 'updateTasksInfoAndProcessName':
            updateTasksInfoAndProcessName(data);
            break;
        case 'updateOtherTasksInfo':
            updateTaskInfo(data);
            break;
        case 'deleteTask':
            deleteTask(data);
            break;
        case 'deleteTasks':
            deleteTasks(data);
            break;
        default:
            break;
    }
};

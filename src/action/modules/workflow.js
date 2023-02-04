import BPMNEngine from '../../api/BPMNEngine';
export default [
    {
        module: 'document',
        resource: 'document_object',
        scope: 'workflow',
        action: 'approval',
        handler: function (param) {
            if (param.openInNewTab) {
                this.$goToPage('/myitem/tasks/' + param.taskId, 'Do task');
            }
        },
    },
    {
        module: 'document',
        resource: 'document_object',
        scope: 'workflow',
        action: 'submit',
        handler: function (param) {
            if (param.openInNewTab) {
                this.$goToPage('/myitem/tasks/' + param.taskId, 'Do task');
            }
        },
    },
    {
        module: 'document',
        resource: 'document_object',
        scope: 'workflow',
        action: 'update',
        handler: function (param) {
            if (param.openInNewTab) {
                this.$goToPage('/myitem/tasks/' + param.taskId, 'Do task');
            }
        },
    },
    {
        module: 'workflow',
        resource: 'workflow',
        scope: 'workflow',
        action: 'notification',
        handler: async function (param) {
            if (param.openInNewTab && param.processInstanceId) {
                let res = await BPMNEngine.getProcessInstanceRuntimeHistory(
                    param.processInstanceId,
                );
                if (res.total > 0) {
                    let data = res.data;
                    for (let index = 0; index < data.length; index++) {
                        if (data[index].activityId == param.nodeId) {
                            if (data[index].taskId) {
                                this.$goToPage(
                                    'myitem/tasks/' + data[index].taskId,
                                    'Do task',
                                );
                            }
                        }
                    }
                }
            }
        },
    },
];

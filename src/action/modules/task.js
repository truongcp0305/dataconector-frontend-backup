let commonProps = {
    module: 'task',
    resource: 'task',
    scope: 'task',
};

export default [
    {
        ...commonProps,
        scope: 'comment',
        action: 'view_comment',
        handler: function (param) {
            this.$goToPage('myitem/tasks/' + param.id, 'Do task', false, true, {
                subAction: 'view_comment',
            });
        },
    },
    {
        ...commonProps,
        action: 'submitAdhocTask',
        scope: 'workflow',
        handler: function (param) {
            this.$goToPage('myitem/tasks/' + param.taskId, 'Do task');
        },
    },
];

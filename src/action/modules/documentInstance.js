let commonProps = {
    module: 'document',
    resource: 'document_instance',
    scope: 'document',
};

export default [
    {
        ...commonProps,
        action: 'update',
        handler: function (param) {},
    },
    {
        ...commonProps,
        action: 'delete',
        handler: function (param) {
            // let tabName = param.title ? param.title : (param.name ? param.name : '');
            // tabName = this.$t('document.edit') + ' ' + tabName;
            // this.$goToPage('/document/editor/' + param.documentId, tabName);
        },
    },
    {
        ...commonProps,
        action: 'restore',
        handler: function (param) {
            // let tabName = param.title ? param.title : (param.name ? param.name : '');
            // tabName = this.$t('document.submit') + ' ' + tabName;
            // this.$goToPage('/document/submit/' + param.documentId, tabName);
        },
    },
    {
        ...commonProps,
        action: 'detail',
        handler: function (param) {},
    },
    {
        ...commonProps,
        action: 'print',
        handler: function (param) {},
    },
    {
        ...commonProps,
        action: 'list_trash',
        handler: function (param) {
            // let tabName = this.$t('document.title');
            // this.$goToPage('/documents', tabName);
        },
    },
    {
        ...commonProps,
        action: 'submitAdhocTask',
        resource: 'document_object',
        scope: 'workflow',
        handler: function (param) {
            this.$goToPage('myitem/tasks/' + param.taskId, 'Do task');
        },
    },
    {
        ...commonProps,
        action: 'view_comment',
        resource: 'document',
        scope: 'comment',
        handler: function (param) {
            this.$goToPage('documents/objects/' + param.id, 'Chi tiết');
        },
    },
    {
        ...commonProps,
        action: 'view_comment',
        resource: 'document-instance',
        module: 'document-instance',
        scope: 'comment',
        handler: function (param) {
            this.$goToPage(
                'documents/objects/' + param.id,
                'Chi tiết',
                false,
                true,
                { commentId: param.commentId, parentId: param.parentId },
            );
        },
    },
];

let commonProps = {
    module: 'permission',
    resource: 'action_pack',
    scope: 'permission',
};

export default [
    {
        ...commonProps,
        action: 'create',
        handler: function (param) {
            // this.$goToPage('document/editor', this.$t('document.create'));
        },
    },
    {
        ...commonProps,
        action: 'update',
        handler: function (param) {
            // let tabName = param.title ? param.title : (param.name ? param.name : '');
            // tabName = this.$t('document.edit') + ' ' + tabName;
            // this.$goToPage('/document/editor/' + param.documentId, tabName);
        },
    },
    {
        ...commonProps,
        action: 'detail',
        handler: function (param) {
            // let tabName = param.title ? param.title : (param.name ? param.name : '');
            // tabName = this.$t('document.submit') + ' ' + tabName;
            // this.$goToPage('/document/submit/' + param.documentId, tabName);
        },
    },
    {
        ...commonProps,
        action: 'remove',
        handler: function (param) {},
    },
    {
        ...commonProps,
        action: 'list',
        handler: function (param) {},
    },
    {
        ...commonProps,
        action: 'add_operation',
        handler: function (param) {},
    },
    {
        ...commonProps,
        action: 'remove_operation',
        handler: function (param) {},
    },
];

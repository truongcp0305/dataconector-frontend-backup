let commonProps = {
    module: 'account',
    resource: 'account',
    scope: 'account',
};

export default [
    {
        ...commonProps,
        action: 'add',
        handler: function (param) {
            // this.$goToPage('document/editor', this.$t('document.create'));
        },
    },
    {
        ...commonProps,
        action: 'update',
        handler: function (drop) {
            // let tabName = param.title ? param.title : (param.name ? param.name : '');
            // tabName = this.$t('document.edit') + ' ' + tabName;
            // this.$goToPage('/document/editor/' + param.documentId, tabName);
        },
    },
    {
        ...commonProps,
        action: 'info',
        handler: function (param) {
            // this.$goToPage('document/editor', this.$t('document.create'));
        },
    },
    {
        ...commonProps,
        action: 'detail',
        handler: function (drop) {
            // let tabName = param.title ? param.title : (param.name ? param.name : '');
            // tabName = this.$t('document.edit') + ' ' + tabName;
            // this.$goToPage('/document/editor/' + param.documentId, tabName);
        },
    },
    {
        ...commonProps,
        action: 'change_pass',
        handler: function (param) {
            // this.$goToPage('document/editor', this.$t('document.create'));
        },
    },
    {
        ...commonProps,
        action: 'disable',
        handler: function (drop) {
            // let tabName = param.title ? param.title : (param.name ? param.name : '');
            // tabName = this.$t('document.edit') + ' ' + tabName;
            // this.$goToPage('/document/editor/' + param.documentId, tabName);
        },
    },
    {
        ...commonProps,
        action: 'change_avatar',
        handler: function (param) {
            // this.$goToPage('document/editor', this.$t('document.create'));
        },
    },
    {
        ...commonProps,
        action: 'list',
        handler: function (drop) {
            // let tabName = param.title ? param.title : (param.name ? param.name : '');
            // tabName = this.$t('document.edit') + ' ' + tabName;
            // this.$goToPage('/document/editor/' + param.documentId, tabName);
        },
    },
    {
        ...commonProps,
        action: 'set_role',
        handler: function (param) {
            // this.$goToPage('document/editor', this.$t('document.create'));
        },
    },
];

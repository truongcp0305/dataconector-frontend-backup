let commonProps = {
    module: 'job',
    resource: 'job',
    scope: 'job',
};

export default [
    {
        ...commonProps,
        action: 'set_permission',
        handler: function (param) {
            // this.$goToPage('document/editor', this.$t('document.create'));
        },
    },
    {
        ...commonProps,
        action: 'set_user',
        handler: function (drop) {
            // let tabName = param.title ? param.title : (param.name ? param.name : '');
            // tabName = this.$t('document.edit') + ' ' + tabName;
            // this.$goToPage('/document/editor/' + param.documentId, tabName);
        },
    },
];

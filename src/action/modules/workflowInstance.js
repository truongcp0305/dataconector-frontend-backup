let commonProps = {
    module: 'workflow',
    resource: 'workflow_instance',
    scope: 'workflow',
};

export default [
    {
        ...commonProps,
        action: 'detail',
        handler: function (param) {
            // this.$goToPage('document/editor', this.$t('document.create'));
        },
    },
    {
        ...commonProps,
        action: 'drop',
        handler: function (param) {
            // let tabName = param.title ? param.title : (param.name ? param.name : '');
            // tabName = this.$t('document.edit') + ' ' + tabName;
            // this.$goToPage('/document/editor/' + param.documentId, tabName);
        },
    },
];

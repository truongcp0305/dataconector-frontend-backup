let commonProps = {
    module: 'bi',
    resource: 'dataflow',
    scope: 'bi',
};

export default [
    {
        ...commonProps,
        action: 'create',
        handler: function (param) {},
    },
    {
        ...commonProps,
        action: 'drop',
        handler: function (param) {},
    },
    {
        ...commonProps,
        action: 'list',
        handler: function (param) {
            let tabName = this.$t('dashboard.detail.title') + ' ' + param.name;
            this.$goToPage('/dashboard/' + param.id + '/view', tabName);
        },
    },
    {
        ...commonProps,
        action: 'update',
        handler: function (param) {},
    },
    {
        ...commonProps,
        action: 'detail',
        handler: function (param) {},
    },
];

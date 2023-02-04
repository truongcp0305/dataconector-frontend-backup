let commonProps = {
    module: 'orgchart',
    resource: 'orgchart',
    scope: 'orgchart',
};

export default [
    {
        ...commonProps,
        action: 'create',
        handler: function (param) {
            let tabName = this.$t('orgchart.create.title');
            let url = this.$getActionLink(param);
            this.$goToPage(url, tabName);
        },
        $getActionLink(param) {
            return `/orgchart/create`;
        },
    },
    {
        ...commonProps,
        action: 'update',
        handler: function (param) {
            let tabName = this.$t('orgchart.update.title');
            let url = this.$getActionLink(param);
            this.$goToPage(url, tabName);
        },
        $getActionLink(param) {
            return '/orgchart/' + param.id + '/edit';
        },
    },
    {
        ...commonProps,
        action: 'list',
        handler: function (param) {
            let tabName = this.$t('orgchart.list.title');
            let url = this.$getActionLink(param);
            this.$goToPage(url, tabName);
        },
        $getActionLink(param) {
            return '/orgchart/';
        },
    },
    {
        ...commonProps,
        action: 'drop',
        handler: function (param) {},
    },
    {
        ...commonProps,
        action: 'detail',
        handler: function (param) {
            let tabName = this.$t('orgchart.detail.title');
            let url = this.$getActionLink(param);
            this.$goToPage(url, tabName);
        },
        $getActionLink(param) {
            return '/orgchart/' + param.id + '/view';
        },
    },
];

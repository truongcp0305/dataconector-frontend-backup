import { util } from '../../plugins/util';

let commonProps = {
    module: 'dashboard',
    resource: 'dashboard',
    scope: 'dashboard',
};

export default [
    {
        ...commonProps,
        action: 'create',
        handler: function (param) {
            let url = this.$getActionLink(param);
            this.$goToPage(url, 'tabName');
        },
        $getActionLink: function (param) {
            return '/dashboards/create';
        },
    },
    {
        ...commonProps,
        action: 'update',
        handler: function (param) {
            let tabName = this.$t('dashboard.detail.title') + ' ' + param.name;
            let url = this.$getActionLink(param);
            this.$goToPage(url, tabName);
        },
        $getActionLink: function (param) {
            return '/dashboards/' + param.id + '/edit';
        },
    },
    {
        ...commonProps,
        action: 'view',
        handler: function (param) {
            let tabName = this.$t('dashboard.detail.title') + ' ' + param.name;
            let url = this.$getActionLink(param);
            this.$goToPage(url, tabName);
        },
        $getActionLink: function (param) {
            return '/dashboards/' + param.id + '/view';
        },
    },
    {
        ...commonProps,
        action: 'list',
        handler: function (param) {
            let url = this.$getActionLink(param);
            this.$goToPage(url, 'Danh sách');
        },
        $getActionLink: function (param) {
            return '/list-dashboard';
        },
    },
    {
        ...commonProps,
        action: 'drop',
        handler: function (param) {},
    },
];

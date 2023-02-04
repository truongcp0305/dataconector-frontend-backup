let commonProps = {
    module: 'document',
    resource: 'document_definition',
    scope: 'document',
};

export default [
    {
        ...commonProps,
        action: 'create',
        handler: function (param) {
            let tabName = param.title
                ? param.title
                : param.name
                ? param.name
                : '';
            tabName = this.$t('document.create') + ' ' + tabName;
            let url = this.$getActionLink(param);
            this.$goToPage(url, tabName);
        },
        $getActionLink(param) {
            return 'document/editor/' + Date.now();
        },
    },
    {
        ...commonProps,
        action: 'edit',
        handler: function (param) {
            let tabName = param.title
                ? param.title
                : param.name
                ? param.name
                : '';
            tabName = this.$t('document.edit') + ' ' + tabName;
            let url = this.$getActionLink(param);
            this.$goToPage(url, tabName);
        },
        $getActionLink(param) {
            return 'documents/' + param.id + '/editor/edit';
        },
    },
    {
        ...commonProps,
        action: 'submit',
        handler: function (param) {
            let tabName = param.title
                ? param.title
                : param.name
                ? param.name
                : '';
            tabName = this.$t('document.submit.title') + ' ' + tabName;
            let url = this.$getActionLink(param);

            let extraData = {};
            if (param.appId) {
                extraData.appId = param.appId;
            }
            this.$goToPage(url, tabName, false, true, extraData);
        },
        $getActionLink(param) {
            return `/documents/${param.id}/submit`;
        },
    },
    {
        ...commonProps,
        action: 'drop',
        handler: function (param) {},
    },
    {
        ...commonProps,
        action: 'restore',
        handler: function (param) {},
    },
    {
        ...commonProps,
        action: 'list',
        handler: function (param) {
            let tabName = this.$t('document.title');
            this.$goToPage(this.$getActionLink(param), tabName, false, false);
        },
        $getActionLink(param) {
            return '/documents';
        },
    },

    {
        ...commonProps,
        action: 'list_trash',
        handler: function (param) {
            let tabName = this.$t(
                'apps.listActions.document_definition.list_trash',
            );
            tabName = `${tabName} ${param.title}`;
            this.$goToPage(this.$getActionLink(param), tabName, false, false);
        },
        $getActionLink(param) {
            return `documents/${param.id}/draft-objects`;
        },
    },
    {
        ...commonProps,
        action: 'list_instance',
        handler: function (param) {
            let tabName = this.$t(
                'apps.listActions.document_definition.list_instance',
            );
            tabName = `${tabName} ${param.title}`;
            this.$goToPage(this.$getActionLink(param), tabName, false, false);
        },
        $getActionLink(param) {
            return `documents/${param.id}/objects`;
        },
    },
];

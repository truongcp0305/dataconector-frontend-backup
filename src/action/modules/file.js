import { appConfigs } from '@/configs.js';
let commonProps = {
    module: 'file',
    resource: 'file',
    scope: 'file',
};

export default [
    {
        ...commonProps,
        action: 'list',
        handler: function (param) {
            window.open(
                `https://file.dev.${SYMPER_ENV.tenant_domain}`,
                '_blank',
            );
        },
        ...commonProps,
        action: 'downloadZip',
        handler: function (param) {
            window.open(
                appConfigs.apiDomain.fileManagement +
                'downloadZip/' +
                param.zipName,
                '_blank',
            );
        },
    },
];

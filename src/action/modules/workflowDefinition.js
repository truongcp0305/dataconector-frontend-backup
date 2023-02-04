import {
    deployProcess,
    getLastestDefinition,
} from './../../components/process/processAction';
import BPMNEngine from '../../api/BPMNEngine';
import { getDetailWorkflow } from '@/worker/admin/getWorkflowDetail.js'
let commonProps = {
    module: 'workflow',
    resource: 'workflow_definition',
    scope: 'workflow',
};

export default [
    {
        ...commonProps,
        action: 'list',
        handler: function (param) {
            let tabName = this.$t('process.list.title');
            this.$goToPage(this.$getActionLink(param), tabName, false, false);
        },
        $getActionLink(param) {
            return '/workflow';
        },
    },
    {
        ...commonProps,
        action: 'create',
        handler: function (param) {
            let tabName = this.$t('process.action.create');
            this.$goToPage(this.$getActionLink(param), tabName);
        },
        $getActionLink(param) {
            return '/workflow/create';
        },
    },
    {
        ...commonProps,
        action: 'deploy',
        handler: function (param) {
            deployProcess(param);
        },
    },
    {
        ...commonProps,
        action: 'drop',
        handler: function (param) { },
    },
    {
        ...commonProps,
        action: 'update',
        handler: function (param) {
            this.$goToPage(
                $getActionLink(param),
                this.$t('common.edit') +
                ' ' +
                (param.name ? param.name : param.key),
            );
        },
        $getActionLink(param) {
            return '/workflow/' + param.id + '/edit';
        },
    },
    {
        ...commonProps,
        action: 'list_instance',
        handler: async function (param) {
            this.$goToPage(
                this.$getActionLink(param),
                this.$t('process.instance.listModelInstance'),
            );
        },
        $getActionLink(param) {
            return `/workflow/${param.id}/works`;
        },
    },
    {
        ...commonProps,
        action: 'view',
        handler: async function (param) {
            this.$goToPage(
                this.$getActionLink(param),
                this.$t('common.view') +
                ' ' +
                (param.name ? param.name : param.key),
            );
        },
        $getActionLink(param) {
            return '/workflow/' + param.id + '/view';
        },
    },
    {
        ...commonProps,
        action: 'start_instance',
        handler: async function (param) {
            let url = await this.$getActionLink(param);
            if (url) {
                let extraData = {};
                if (param.appId) {
                    extraData.appId = param.appId;
                }
                this.$goToPage(
                    url,
                    'Start process instance',
                    false,
                    true,
                    extraData,
                );
            } else {
                this.$snotifyError(
                    {},
                    'Can not find process definition having deployment id ' +
                    deploymentId,
                );
            }
        },
        async $getActionLink(param) {
            let defData = await getLastestDefinition(param, true);
            if (defData.data[0]) {
                return `/workflow/process-definition/${defData.data[0].id}/run`;
            } else {
                return '';
            }
        },
    },
    {
        ...commonProps,
        action: 'list_process',
        handler: async function (param) {
            this.$goToPage(
                this.$getActionLink(param),
                'List Process', false, true, param
            );
        },
        async $getActionLink(param) {
            let res = await BPMNEngine.getModelData(param.id);
            if (res.status == 200 && res.data && Object.keys(res.data).length > 0) {
                let obj = res.data;
                let data = await getDetailWorkflow(obj.processKey);
                if (Object.keys(data).length > 0) {
                    return '/workflow/' + param.id + '/listProcess';
                } else {
                    return '/workflow/not-found';
                }
            }
            return '/workflow/not-found';
        },
    },
];

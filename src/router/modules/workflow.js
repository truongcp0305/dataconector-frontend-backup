export default [
    {
        path: '/workflow',
        name: 'processList',
        component: () => import('@/views/process/ProcessList.vue'),
    },
    {
        path: '/workflow/trash',
        name: 'processListTrash',
        component: () => import('@/views/process/ProcessListTrash.vue'),
    },
    {
        path: '/workflow/:id/edit',
        name: 'editProcess',
        component: () => import('@/views/process/EditProcess.vue'),
    },
    {
        path: '/workflow/:id/clone',
        name: 'cloneProcess',
        component: () => import('@/views/process/CloneProcess.vue'),
    },
    {
        path: '/workflow/:id/view',
        name: 'viewProcess',
        component: () => import('@/views/process/CreateProcess.vue'),
    },
    {
        path: '/workflow/:name/deploy-history',
        name: 'deployHistory',
        component: () => import('@/views/process/DeployHistory.vue'),
    },
    {
        path: '/workflow/process-key/:processKey/instances',
        name: 'listProcessInstances',
        component: () => import('@/views/process/ProcessInstances.vue'),
    },
    {
        path: '/workflow/process-key/:processKey/list-instances',
        name: 'listProcessInstancess',
        component: () => import('@/views/admin/ListProcessInstance.vue'),
    },
    {
        path: '/workflow/process-instances/:idInstance/tracking',
        name: 'trackingProcessInstance',
        component: () =>
            import('@/views/process/TrackingProcessInstance.vue'),
    },
    {
        path: '/workflow/create',
        name: 'createProcess',
        component: () => import('@/views/process/CreateProcess.vue'),
    },
    {
        path: '/workflow/process-definition/:id/run',
        name: 'RunInstance',
        component: () => import('@/views/process/RunInstance.vue'),
    },
    {
        path: '/workflow/:id/works',
        name: 'ListWorkOfAWorkflow',
        component: () => import('@/views/myItem/MyItemShowList.vue'),
    },
    {
        path: '/workflow/modeler/:id/start-process-instance',
        name: 'StartProcessInstanceByModeler',
        component: () => import('@/views/process/StartProcessInstanceByModeler.vue'),
    },
    {
        path: '/workflow/:id/listProcess',
        name: 'ListProcessInstance',
        component: () => import('@/views/admin/DetailWorkflow.vue'),
    },
    {
        path: '/workflow/not-found',
        name: 'WorkflowDetailNotFound',
        component: () => import('@/views/admin/WorkflowNotFoundScreen.vue'),
    },
];
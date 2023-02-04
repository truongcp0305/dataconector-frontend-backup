export default [
    {
        path: '/admin/jobs',
        name: 'jobs',
        component: () => import('../../views/admin/jobs/Index.vue'),
    },
    {
        path: '/work/:processInstanceId',
        name: 'process',
        component: () =>
            import('../../views/admin/ListWorkInProcessInstance.vue'),
    },
];

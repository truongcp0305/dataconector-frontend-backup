export default [
    {
        path: '/list-dashboard',
        name: 'listDashboards',
        component: () => import('../../views/dashboard/Index.vue'),
    },
    {
        path: '/dashboards/trash',
        name: 'listDashboardsTrash',
        component: () => import('../../views/dashboard/ListTrashDashboard.vue'),
    },
    {
        path: '/dashboards/create',
        name: 'createDashboard',
        component: () => import('../../views/dashboard/CreateDashboard.vue'),
    },
    {
        path: '/dashboards/:id/view',
        name: 'viewDashboard',
        component: () => import('../../views/dashboard/DashboardView.vue'),
    },
    {
        path: '/dashboards/:id/edit',
        name: 'editDashboard',
        component: () => import('../../views/dashboard/EditDashboard.vue'),
    },
    {
        path: '/dashboards/:id/edit-in-clickhouse-mode',
        name: 'editDashboardInClickhouseMode',
        component: () =>
            import('../../views/dashboard/EditDashboardInClickhouseMode.vue'),
    },
    {
        path: '/dashboards/:id/clone',
        name: 'cloneDashboard',
        component: () => import('../../views/dashboard/CloneDashboard.vue'),
    },
];

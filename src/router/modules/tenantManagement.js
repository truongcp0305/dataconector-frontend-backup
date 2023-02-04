export default [
    {
        path: '/tenant-management',
        name: 'listTenant',
        component: () => import('../../views/tenantManagement/ListTenant.vue'),
    },
    {
        path: '/tenant-management/trash',
        name: 'listTrashTenant',
        component: () =>
            import('../../views/tenantManagement/ListTrashTenant.vue'),
    },
];
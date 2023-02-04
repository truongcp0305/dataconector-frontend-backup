export default [
    {
        path: '/environment-management',
        name: 'environmentManagement',
        component: () => import('@/views/environment/Index.vue'),
    },
    {
        path: '/environment-sync-history',
        name: 'environmentSyncHistory',
        component: () => import('@/views/environment/SyncHistory.vue'),
    },
    {
        path: '/service/:serviceId/versions',
        name: 'versionOfService',
        component: () => import('@/views/environment/ListVersionOfService.vue'),
    },
    {
        path: '/service/:serviceId/instances',
        name: 'instanceOfService',
        component: () =>
            import('@/views/environment/ListInstanceOfService.vue'),
    },
    {
        path: '/server/:serverId/instances',
        name: 'instanceOfServer',
        component: () => import('@/views/environment/ListInstanceOfServer.vue'),
    },
    {
        path: '/environment-management/detail-object/:id',
        name: 'detailObject',
        component: () => import('@/views/environment/ObjectDetail.vue'),
    },
];

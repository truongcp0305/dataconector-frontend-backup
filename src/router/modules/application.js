export default [
    {
        path: '/apps',
        name: 'apps',
        component: () => import('../../views/apps/index.vue'),
    },
    {
        path: '/apps/trash',
        name: 'trashApplication',
        component: () => import('../../views/apps/ListTrashApplication.vue'),
    },
    {
        path: '/my-applications',
        name: 'my-applications',
        component: () => import('../../views/apps/myapplication/Index.vue'),
    },
];

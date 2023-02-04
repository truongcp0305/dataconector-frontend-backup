export default [
    {
        path: '/myitem',
        name: 'myItem',
        component: () => import('@/views/myItem/MyItemShowList.vue'),
    },
    {
        path: '/myitem/tasks/:id',
        name: 'taskMyItem',
        component: () => import('@/components/myItem/DoTask.vue'),
    },
    {
        path: '/myitem/:type',
        name: 'myItemByType',
        component: () => import('@/views/myItem/MyItemShowList.vue'),
    },
    {
        path: '/myitem/:type/:processInstanceId',
        name: 'listWorkInTask',
        component: () => import('@/views/myItem/MyItemShowList.vue'),
    },
];

export default [
    {
        path: '/tasks',
        name: 'tasksList',
        component: () => import('../../views/tasks/index.vue'),
    },
    {
        path: '/tasks/:id',
        name: 'doTask',
        component: () => import('../../views/tasks/DoTask.vue'),
    },
    {
        path: '/works',
        name: 'workList',
        component: () => import('../../views/works/WorkList.vue'),
    },
];

export default [
    {
        path: '/users',
        name: 'processListUser',
        component: () => import('../../views/users/ShowList.vue'),
    },

    {
        path: '/users/add',
        name: 'addUser',
        component: () => import('../../views/users/ActionPanel.vue'),
    },
    {
        path: '/users/trash',
        name: 'List trash',
        component: () => import('../../views/users/ListsTrash.vue'),
    },
    {
        path: '/users/edit/:id',
        name: 'editUser',
        component: () => import('../../views/users/ActionPanel.vue'),
    },
];

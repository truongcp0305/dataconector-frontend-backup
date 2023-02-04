export default [
    {
        path: '/kanban',
        name: 'kanban',
        component: () => import('../../views/kanban/BaConfig/KanbanList.vue'),
    },
    {
        path: '/kanban/config',
        name: 'kanban config',
        component: () => import('../../views/kanban/BaConfig/KanbanConfig.vue'),
    },
    {
        path: '/kanban/:id/edit',
        name: 'editKanban',
        component: () => import('../../views/kanban/BaConfig/EditKanban.vue'),
    },
    {
        path: '/kanban/:id/view',
        name: 'viewKanban',
        component: () => import('../../views/kanban/BaConfig/ViewKanban.vue'),
    },
    {
        path: '/kanban/enduser',
        name: 'kanban enduser',
        component: () => import('../../views/kanban/EndUser/EndUserKanban.vue'),
    },
];

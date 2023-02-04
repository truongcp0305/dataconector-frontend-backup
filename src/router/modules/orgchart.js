export default [
    {
        path: '/orgchart',
        name: 'listOrgchart',
        component: () => import('../../views/orgchart/OrgchartList.vue'),
    },
    {
        path: '/orgchart/trash',
        name: 'trashOrgchart',
        component: () => import('../../views/orgchart/ListTrashOrgchart.vue'),
    },
    {
        path: '/orgchart/create',
        name: 'createOrgchart',
        component: () => import('../../views/orgchart/CreateOrgchart.vue'),
    },
    {
        path: '/orgchart/:id/edit',
        name: 'editOrgchart',
        component: () => import('../../views/orgchart/EditOrgchart.vue'),
    },
    {
        path: '/orgchart/:id/structure-management',
        name: 'orgchartStructureManagement',
        component: () =>
            import('../../views/orgchart/OrgchartStructureManagement.vue'),
    },

    {
        path: '/orgchart/:id/view',
        name: 'viewOrgchart',
        component: () => import('../../views/orgchart/ViewOrgchart.vue'),
    },
    {
        path: '/orgchart/:id/clone',
        name: 'cloneOrgchart',
        component: () => import('../../views/orgchart/CloneOrgchart.vue'),
    },
];

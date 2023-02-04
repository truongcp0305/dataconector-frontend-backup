export default [
    {
        path: '/access-control/filter',
        name: 'accessControl',
        component: () => import('../../views/accessControl/filter/ListFilterAccessControl.vue'),
    },
    {
        path: '/access-control/action-pack',
        name: 'accessControl action pack',
        component: () => import('../../views/accessControl/actionPack2/ListActionPack.vue'),
    },
    {
        path: '/access-control/permission',
        name: 'accessControl permission',
        component: () => import('../../views/accessControl/permission/ListPermission'),
    },
    {
        path: '/access-control/system-role',
        name: 'accessControl systemRole',
        component: () => import('../../views/accessControl/role/ListUserRole'),
    },
    {
        path: '/access-control/orgchart-role',
        name: 'accessControl orgchartRole',
        component: () => import('../../views/accessControl/role/ListUserRoleOrgchart'),
    },
];

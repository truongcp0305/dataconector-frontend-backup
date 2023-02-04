export default [
    {
        path: '/smart-object',
        name: 'smart object',
        component: () => import('@/views/smartObject/BaConfig/SmartObjectList.vue'),
    },
    {
        path: '/smart-object/trash',
        name: 'smart object trash',
        component: () => import('@/views/smartObject/BaConfig/SmartObjectTrash.vue'),
    },
    {
        path: '/smart-object/config',
        name: 'smart object config',
        component: () => import('@/views/smartObject/BaConfig/SmartObjectConfig.vue'),
    },
    {
        path: '/smart-object/:id/edit',
        name: 'edit smart object',
        component: () => import('@/views/smartObject/BaConfig/EditSmartObject.vue'),
    },
    {
        path: '/smart-object/:id/view',
        name: 'view smart object',
        component: () => import('@/views/smartObject/BaConfig/ViewSmartObject.vue'),
    },
    {
        path: '/smart-object/view-enduser',
        name: 'view smart object enduser',
        component: () => import('@/views/smartObject/EndUser/SmartObjectViewEndUser.vue'),
    },
];

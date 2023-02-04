export default [
    {
        path: '/dataflows',
        name: 'listDataflows',
        component: () => import('@/views/dataflows/ListDataflow.vue'),
    },
    {
        path: '/dataflows/trash',
        name: 'listTrashDataflows',
        component: () => import('@/views/dataflows/ListTrashDataflow.vue'),
    },
    {
        path: '/dataflows/:id/edit',
        name: 'editDataflow',
        component: () => import('@/views/dataflow/EditDataflow.vue'),
    },
    {
        path: '/dataflows/:id/clone',
        name: 'cloneDataflow',
        component: () => import('../../views/dataflow/CloneDataflow.vue'),
    },
    {
        path: '/dataflows/create',
        name: 'createDataflow',
        component: () => import('../../views/dataflow/CreateDataflow.vue'),
    },
    {
        path: '/dataflows/:id/edit-in-clickhouse-mode',
        name: 'editDataflowInClickhouseMode',
        component: () =>
            import('../../views/dataflow/EditDataflowInClickhouseMode.vue'),
    },
];

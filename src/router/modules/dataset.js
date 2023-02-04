export default [
    {
        path: '/datasets',
        name: 'listDatasets',
        component: () => import('@/views/dataset/Index.vue'),
    },
    {
        path: '/datasets/trash',
        name: 'listTrashDatasets',
        component: () => import('@/views/dataset/ListTrashDataset.vue'),
    },
];

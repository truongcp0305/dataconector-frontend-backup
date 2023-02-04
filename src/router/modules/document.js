export default [
    {
        path: '/documents',
        name: 'processListDocument',
        component: () => import('../../views/document/ShowList.vue'),
    },
    {
        path: '/documents/trash',
        name: 'processListTrashDocument',
        component: () => import('../../views/document/trash/ShowListTrash.vue'),
    },
    {
        path: '/documents/:id?/trash-objects',
        name: 'documentObjectHistory',
        component: () =>
            import('../../views/document/trash/ListObjectDeleted.vue'),
    },
    {
        path: '/documents/:id?/print-config',
        name: 'prinConfigDocument',
        component: () => import('../../views/document/print/ShowList.vue'),
    },
    {
        path: '/document/editor/:pageInstanceKey?',
        name: 'createDocument',
        component: () => import('../../views/document/Editor.vue'),
    },
    {
        path: '/documents/:id?/editor/edit',
        name: 'editDocument',
        component: () => import('../../views/document/Editor.vue'),
    },
    {
        path: '/documents/:id?/editor/print-config/:printConfigId?',
        name: 'printConfigDocument',
        component: () => import('../../views/document/Editor.vue'),
    },
    {
        path: '/documents/:id?/editor/clone',
        name: 'cloneDocument',
        component: () => import('../../views/document/Editor.vue'),
    },
    {
        path: '/documents/control-template/:id?',
        name: 'editControlTemplate',
        component: () => import('../../views/document/Editor.vue'),
    },
    {
        path: '/documents/:id?/submit',
        name: 'submitDocument',
        component: () => import('../../views/document/submit/Submit.vue'),
    },
    {
        path: '/documents/print-multiple',
        name: 'printMultiple',
        component: () => import('../../views/document/print/PrintView.vue'),
    },
    {
        path: '/documents/objects/:id?',
        name: 'detailDocument',
        component: () => import('../../views/document/detail/Detail.vue'),
    },
    {
        path: '/documents/objects/:id?/print/:formId?',
        name: 'printDocument',
        component: () => import('../../views/document/print/Print.vue'),
    },

    {
        path: '/document/objects/update/:id?',
        name: 'updateDocumentObject',
        component: () => import('../../views/document/submit/Submit.vue'),
    },
    {
        path: '/document/objects/clone/:id?',
        name: 'cloneDocumentObject',
        component: () => import('../../views/document/submit/Submit.vue'),
    },
    {
        path: '/documents/:id?/objects',
        name: 'listDocumentObject',
        component: () =>
            import('../../views/document/listobject/ListObject.vue'),
    },
    {
        path: '/documents/:id?/draft-objects',
        name: 'listDocumentDraftObject',
        component: () => import('../../views/document/draft/DraftList.vue'),
    },
];

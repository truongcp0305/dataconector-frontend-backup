const defaultState = {
    listFavorite: [],
    viewSideBySide: false,
    showDetailArea: false,
    currentAppId: 0,
    currentAppName: '',
    listApps: {},
    selectingItemType: '',
    activeChildItem: '',
    param: {
        title: '',
    },
    listAppsSideBySide: {},
    listItemSelected: {
        workflow_definition: {
            icon: 'mdi-lan',
            title: 'Workflows',
            name: 'workflow_definition',
            item: [],
        },
        document_category: {
            icon: 'mdi-file-document-outline',
            title: 'Danh mục',
            name: 'document_category',
            item: [],
        },
        document_major: {
            icon: 'mdi-file-edit-outline',
            title: 'Chứng từ',
            name: 'document_major',
            item: [],
        },
        orgchart: {
            icon: 'mdi-widgets-outline',
            title: 'Org chart',
            name: 'orgchart',
            item: [],
        },
        dashboard: {
            icon: 'mdi-view-dashboard',
            title: 'Reports',
            name: 'dashboard',
            item: [],
        },
    },
    actionViewConfig: {},
};
export default defaultState;

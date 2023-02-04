const defaultState = {
    accountType: '', // loại tài khoản đang đăng nhập: ba hoặc enduser
    baInfo: {
        email: '', // email của BA
        name: '', // tên của BA,
        id: 0,
    },
    endUserInfo: {
        name: 'Nguyễn Quốc Tân',
        id: 0,
        status: 1,
        currentRole: {
            // Vai trò hiện tại của enduser đang đóng
            id: 'auto',
            name: 'Auto',
        },
        roles: {
            // các vai trò mà user có thể có trong orgchart hoặc system role
            auto: [
                {
                    id: 'auto',
                    name: 'auto',
                },
            ],
            orgchart: [],
            systemRole: [],
        },
        selectedRoleForWorkflow: {}, // thông tin về role đk lựa chọn để chạy workflow trong trường hợp role được chọn là auto
    },
    collapseSideBar: true, // trạng thái của sidebar: true là đang nhỏ, false là đang mở rộng
    unreadNotification: 2, // số lượng các thông báo chưa đọc
    needReloadNotification: false,
    items: [
        // các menu mà ba hoặc enduser được phân quyền
        // { title: "reports", icon: "mdi-view-dashboard", link: "/reports" },
        {
            title: 'workflows',
            icon: 'mdi-sitemap',
            // link: "/workflow"
            action: {
                module: 'workflow',
                resource: 'workflow_definition',
                scope: 'workflow',
                action: 'list',
            },
        },
        {
            title: 'documents',
            icon: 'mdi-file-document-outline',
            // link: "/documents",
            action: {
                module: 'document',
                resource: 'document_definition',
                scope: 'document',
                action: 'list',
            },
        },
        {
            title: 'orgchart',
            icon: 'mdi-account-group-outline',
            // link: "/orgchart",
            action: {
                module: 'orgchart',
                resource: 'orgchart',
                scope: 'orgchart',
                action: 'list',
            },
        },
        // { title: "methods", icon: "mdi-function", link: "/methods" },
        // { title: "virtual_doc", icon: "mdi-table-sync", link: "/virtual-doc" },
        // { title: "service", icon: "mdi-cogs", link: "/service" },
        {
            title: 'menu',
            icon: 'mdi-microsoft-xbox-controller-menu',
            link: '/menu',
        },
        {
            title: 'users',
            icon: 'mdi-account-settings',
            link: '/users',
        },
        // { title: "snippets", icon: "mdi-contain", link: "/snippets" },
        {
            title: 'permissions',
            icon: 'mdi-folder-account',
            link: '/permissions',
        },
        {
            title: 'apps',
            icon: 'mdi-apps',
            link: '/apps',
        },
        {
            title: 'Comment',
            icon: 'mdi-comment',
            link: '/comment',
        },
        // { title: "virtualdocs", icon: "mdi-table", link: "/virtualdocs" },
        {
            title: 'tasks',
            icon: 'mdi-check-all',
            link: '/tasks',
        },
        {
            title: 'works',
            icon: 'mdi-briefcase-check-outline',
            link: '/works',
        },

        {
            title: 'baAccount',
            icon: 'mdi-account-tie',
            link: '/ba-account',
        },
    ],
    urlToTabTitleMap: {}, // map giữa url với title và pageInstanceKey của tab,
    currentTabIndex: 0, // index cuả tab hiện tại đang mở,
    supportedLanguages: [
        {
            key: 'vn',
            title: 'Tiếng Việt',
        },
        {
            key: 'en',
            title: 'English',
        },
    ],
    allSymperRoles: {}, // danh sách tất cả các roles trong hệ thống
    /**
     * Danh sách các node của các orgchart
     * dạng: {
     *      idOrgchart : {} // tất cả các node của từng orgchart ở dạng phẳng , có id của node cha ở từng node,
     *      dạng {id của node: thuộc tính của node đó}
     * }
     */
    orgchartNodes: {},
    // Danh sách tất cả các user trong hệ thống
    allUsers: [],
    mapIdToUsers: {},
    allBA: [],
    generalNotificationPosition: 'top right',
    userLoadedRoleType: [],
    filterObject: {},
    actionPackIdsByRole: {},
    allFilter: {},
    systemMessaging: {
        messageObj: {},
        token: '', // token của firebase
        topics: {}, // các topic đã đăng ký, {documents: true, workflows: true, }
    },
    didRegisterSYQLForMonaco: false,
    filteredColumns: {},

    // Chứa dữ liệu để hiển thị và tương tác với các tab
    pinTabs: {
        // comment lại, chuyển tạm sang bên created của APP.vue để check cho nhanh
        // browserHistory: { // phục vụ cho việc biết được là user đang ấn back hay forward trên trình duyệt
        //     stateStack: [null], // phần tử đầu tiên luôn là null để đánh dấu đó là đầu trang
        //     currentIndex: 0
        // },
        tabs: [
            {
                browserPageKeys: {},
                id: Date.now(), // id của tab này
                origin: null, // id của tab mà tab này được tạo thành, null tức là được tạo từ đầu, ko có cha
                title: '...', // Tiêu đề hiển thị cho tab này
                stack: [], // Stack các link đã visit của tab này
                currentIndex: 0, // index trong stack mà trang hiện tại thuộc về
            },
        ],
        mapTab: {}, // map các tab theo id thay vì dạng mảng
        currentTabId: '',
    },
};

defaultState.pinTabs.mapTab[defaultState.pinTabs.tabs[0].id] =
    defaultState.pinTabs.tabs[0];
defaultState.pinTabs.currentTabId = defaultState.pinTabs.tabs[0].id;

export default defaultState;

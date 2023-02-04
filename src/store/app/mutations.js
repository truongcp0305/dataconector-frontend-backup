const changeCollapseSidebar = (state, newValue) => {
    state.collapseSideBar = newValue;
};
const changeStatus = (state, newValue) => {
    state.endUserInfo.status = newValue;
};

const decreaseUnreadNotification = (state, delta = 1) => {
    state.unreadNotification -= delta;
};
const increaseUnreadNotification = (state, delta = 1) => {
    state.unreadNotification += delta;
};

const changeCurrentBAInfo = (state, data) => {
    for (let name in data) {
        Vue.set(state.baInfo, name, data[name]);
    }
};

const changeCurrentUserInfo = (state, data) => {
    for (let name in data) {
        Vue.set(state.endUserInfo, name, data[name]);
    }
};

const changeUrlsToTabs = (state, data) => {
    console.log(Vue, state, data);

    let urlKey = data.url + data.pageInstanceKey;
    if (data.url[data.url.length - 1] != '/') {
        urlKey = data.url + '/' + data.pageInstanceKey;
    }
    Vue.set(state.urlToTabTitleMap, urlKey, data);
};

const updateCurrentTabIndex = (state, data) => {
    state.currentTabIndex = data;
};

const removeTab = (state, url) => {
    Vue.delete(state.urlToTabTitleMap, url);
};
const setFilteredColumns = (state, data) => {
    Vue.set(state.filteredColumns, data.widgetIdentifier, data.filteredColumns);
};

/**
 *
 * @param {Object} state state của app
 * @param {Object} orgchartNodes chứa danh sách các node của các orgchart, dạng:
 * {
 *      idOrgchart: {
 *          ... Thông tin orgchart,
 *          children: { // thông tin các node trong orgchart này
 *              idNode: {
 *                  ... thông tin node
 *              }
 *          }
 *      }
 * }
 */
const setOrgchartNodes = (state, orgchartNodes) => {
    for (let idOrgchart in orgchartNodes) {
        Vue.set(
            state.orgchartNodes,
            'orgcid' + idOrgchart,
            orgchartNodes[idOrgchart],
        );
    }
};

const setAllUsers = (state, allUsers) => {
    mapIdToUsers(state, allUsers);
    Vue.set(state, 'allUsers', allUsers);
};
const mapIdToUsers = (state, allusers) => {
    let map = allusers.reduce((newObj, obj) => {
        newObj[obj.id] = obj;
        return newObj;
    }, {});
    Vue.set(state, 'mapIdToUsers', map);
};
const setAllSymperRoles = (state, allSymperRoles) => {
    Vue.set(state, 'allSymperRoles', allSymperRoles);
};

const setAllBA = (state, allBA) => {
    Vue.set(state, 'allBA', allBA);
};

const setUserRoleByType = (state, param) => {
    let type = param.type;
    Vue.set(state.endUserInfo.roles, type, param.data);
};

const setUserActionsForObjects = (state, data) => {
    Vue.set(state, 'userOperations', data);
};

const setAllFilter = (state, data) => {
    Vue.set(state, 'allFilter', data);
};

const setActionPackIdsByRole = (state, data) => {
    Vue.set(state, 'actionPackIdsByRole', data);
};
const setFilterForObjects = (state, data) => {
    Vue.set(state, 'filterObject', data);
};
const setAccountType = (state, data) => {
    Vue.set(state, 'accountType', data);
};

/**
 *
 * @param {Object} state
 * @param {Object} data đối tượng chứa các value cần set lại cho SystemMessaging
 */
const updateSystemMessaging = (state, data) => {
    for (let key in data) {
        state.systemMessaging[key] = data[key];
    }
};

export {
    updateSystemMessaging,
    changeCollapseSidebar,
    increaseUnreadNotification,
    decreaseUnreadNotification,
    changeCurrentBAInfo,
    changeCurrentUserInfo,
    changeUrlsToTabs,
    updateCurrentTabIndex,
    removeTab,
    setOrgchartNodes,
    setAllUsers,
    setAllBA,
    setUserRoleByType,
    setUserActionsForObjects,
    setAllFilter,
    setFilterForObjects,
    setActionPackIdsByRole,
    setAllSymperRoles,
    changeStatus,
    setAccountType,
    setFilteredColumns,
};

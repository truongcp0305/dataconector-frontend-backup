
import Vue from 'vue';
const updateListItemSelected = (state, data) => {
    let listItem = state.listItemSelected[data.type].item;
    let check = false;
    listItem.forEach(function (e) {
        if (e.id == data.obj.id) {
            check = true;
            listItem.splice(listItem.indexOf(e), 1);
        }
    });
    if (check == false) {
        listItem.push(data.obj);
    }
};
const removeItemSelected = (state, data) => {
    state.listItemSelected[data.type].item.splice(
        state.listItemSelected[data.type].item.indexOf(data.item),
        1,
    );
};
const emptyItemSelected = (state) => {
    state.listItemSelected = {
        workflow_definition: {
            icon: 'mdi-lan',
            title: 'apps.listType.workflow',
            name: 'workflow_definition',
            item: [],
        },
        document_category: {
            icon: 'mdi-file-document-outline',
            title: 'apps.listType.documentCategory',
            name: 'document_category',
            item: [],
        },
        document_major: {
            icon: 'mdi-file-edit-outline',
            title: 'apps.listType.documentMajor',
            name: 'document_major',
            item: [],
        },
        orgchart: {
            icon: 'mdi-widgets-outline',
            title: 'apps.listType.orgchart',
            name: 'orgchart',
            item: [],
        },
        dashboard: {
            icon: 'mdi-view-dashboard',
            title: 'apps.listType.dashboard',
            name: 'dashboard',
            item: [],
        },
    };
};
const updateChildrenApps = (state, data) => {
    state.listItemSelected[data.type].item = data.obj;
};
const updateChildrenAppsSBS = (state, data) => {
    // let clone = util.cloneDeep(state.listItemSelected)
    sortApps(data, true)
    state.listItemSelected[data.type].item = data.obj;
    // state.listAppsSideBySide[state.currentAppId] = state.listItemSelected
    Vue.set(
        state.listAppsSideBySide,
        state.currentAppId,
        state.listItemSelected,
    );
};
const updateListFavorite = (state, data) => {
    sortApps(data, false)
    Vue.set(state, 'listFavorite', data);
};
const sortApps = (data, haveObj = false) => {
    if (data.type == "document_category" || data.type == "document_major") {
        let obj = !haveObj ? data : data.obj
        obj.sort(
            (a, b) =>
                a.title
                    .toLowerCase()
                    .localeCompare(b.title.toLowerCase())
        );
    } else {
        let obj = !haveObj ? data : data.obj
        obj.sort(
            (a, b) =>
                a.name
                    .toLowerCase()
                    .localeCompare(b.name.toLowerCase())
        );
    }
};
const insertFavorite = (state, data) => {
    state.listFavorite.push(data);
};
const delFavorite = (state, data) => {
    state.listFavorite.forEach(function (e) {
        if (e.id === data.id && e.type === data.type) {
            state.listFavorite.splice(state.listFavorite.indexOf(e), 1);
        }
    });
};
const changeTypeView = (state) => {
    state.viewSideBySide = !state.viewSideBySide;
};
const setTypeView = (state, data) => {
    state.viewSideBySide = data;
};
const updateCurrentAppId = (state, data) => {
    state.currentAppId = data;
};

const updateActionViewConfig = (state, data) => {
    if (!state.actionViewConfig[data.instanceKey]) {
        Vue.set(state.actionViewConfig, data.instanceKey, {});
    }
    Vue.set(state.actionViewConfig, data.instanceKey, data.actionViewConfig);
};
const updateParam = (state, data) => {
    // Vue.set(state, 'param', data)
};
const showDetailAppArea = (state) => {
    Vue.set(state, 'showDetailArea', true);
};
const setListApps = (state, data) => {
    Vue.set(state, 'listApps', data);
};
const updateFavoriteMyAppItem = (state, data) => {
    let items =
        state.listApps[data.appId].childrenAppReduce[state.selectingItemType]
            .item;
    for (let e of items) {
        if (e.objectIdentifier == data.itemId) {
            e.favorite = data.value;
            break;
        }
    }
};
const updateSelectingItemType = (state, data) => {
    state.selectingItemType = data;
};
const updateActiveChildItem = (state, data) => {
    state.activeChildItem = data;
};
const updateCurrentAppName = (state, data) => {
    state.currentAppName = data;
};
export {
    updateListItemSelected,
    removeItemSelected,
    emptyItemSelected,
    updateChildrenApps,
    updateListFavorite,
    insertFavorite,
    delFavorite,
    changeTypeView,
    updateCurrentAppId,
    updateActionViewConfig,
    updateParam,
    showDetailAppArea,
    setListApps,
    updateFavoriteMyAppItem,
    updateSelectingItemType,
    updateActiveChildItem,
    updateCurrentAppName,
    setTypeView,
    updateChildrenAppsSBS,
};

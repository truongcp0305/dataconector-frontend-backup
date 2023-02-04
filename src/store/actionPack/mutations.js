import Vue from 'vue';

const cacheAllResourceItem = (state, data) => {
    let type = data.type;
    let items = data.data;
    if (type == 'department') {
        Vue.set(state.allResource, 'department', []);
    }
    if (!state.allResource[type] && !$.isEmptyObject(items)) {
        Vue.set(state.allResource, type, items);

        if (type == 'document_definition') {
            Vue.set(state.allResource, 'document_instance_all_by_def', items);
        }
    }
};

const setAllResource = (state, data) => {
    Vue.set(state, 'allActions', data);
};
//lưu lại các app được chọn trong action pack
const setApplicationInActionPack = (state, data) => {
    Vue.set(state, 'allApplicationsInActionPack', data);
    state.allApps.map((e) => {
        if (state.allApplicationsInActionPack[e.id]) {
            e.isSelected = true
        }
    })
};
//  lưu lại các kanban được chọn trong action pack
const setSelectedKanban = (state, data) => {
    let allKanban = state.allKanban;
    for (let k in allKanban) {
        if (data[allKanban[k].id] && !data[allKanban[k].id].name) {
            data[allKanban[k].id].name = allKanban[k].name
        }
    }
    Vue.set(state, 'selectedKanban', data);
    state.allKanban.map((e) => {
        if (state.selectedKanban[e.id]) {
            e.isSelected = true
        }
    })
}
//lưu lại các operations
const oneObjectIden = ['account', 'action_pack', 'permission_pack', 'system_role', 'orgchart_role', 'filter', 'data_connector', 'department'];
const setOperation = (state, data) => {
    Vue.set(state, 'operations', data);
    for (let key of oneObjectIden) {
        if (!state.operations[key]) {
            Vue.set(state.operations, key, {})
            Vue.set(state.operations[key], key + ':0', {
                id: 0,
                title: '',
                action: [],
                filter: []
            })
        }
    }
    for (let key in state.allActions) {
        if (!state.operations[key] && key != 'document_control' && key != 'document_table') {
            Vue.set(state.operations, key, {})
        }
    }
    Vue.set(state.operations, 'control', {})
};
//update thêm operation khi chọn thêm app
const updateOperation = (state, data) => {
    let operations = data.operations
    for (let objType in operations) {
        for (let objIdentifier in operations[objType]) {
            if (!state.operations[objType]) {
                Vue.set(state.operations, objType, {});
                Vue.set(state.operations[objType], objIdentifier, operations[objType][objIdentifier])
            } else
                if (!state.operations[objType][objIdentifier]) {
                    Vue.set(state.operations[objType], objIdentifier, operations[objType][objIdentifier])
                }
        }
    }
    if (data.typeSelect == 'app') {
        let app = data.app
        if (!state.operations.application_definition) {
            Vue.set(state.operations, 'application_definition', {});
        }
        let id = Object.keys(app)[0]
        state.operations.application_definition['application_definition:' + id] = {
            id: id,
            title: app[id].name,
            action: ['view'],
            filter: []
        }
    }
}
//xóa app khỏi store khi user xác nhận xóa
const deleteApp = (state, data) => {
    let children = state.allApplicationsInActionPack[data.id].children;
    for (let objType in children) {
        for (let objIden of children[objType]) {
            delete state.operations[objType][objIden];
        }
    }
    state.allApps.map((e) => {
        if (e.id == data.id) {
            e.isSelected = false
        }
    })
    Vue.delete(state.allApplicationsInActionPack, data.id);
    state.allApplicationsInActionPack[data.id]
    delete state.operations.application_definition['application_definition:' + data.id]
}
//xóa kanban khỏi store khi user xác nhận xóa
const deleteKanban = (state, data) => {
    let children = state.selectedKanban[data.id].stateflow_flow;
    for (let key in children) {
        delete state.operations.stateflow_flow[children[key]];
    }
    state.allKanban.map((e) => {
        if (e.id == data.id) {
            e.isSelected = false
        }
    })
    Vue.delete(state.selectedKanban, data.id)
}
//reset lại data sau khi close popup action pack form
const resetStoreData = (state) => {
    state.allApps.map((a) => {
        a.isSelected = false
    })
    state.allKanban.map((k) => {
        k.isSelected = false
    })
    delete state.allApplicationsInActionPack
    delete state.operations
    delete state.selectedKanban
}
//set data lúc create AP
const setCreateData = (state) => {
    Vue.set(state, 'allApplicationsInActionPack', {})
    Vue.set(state, 'operations', {})
    for (let key in state.allActions) {
        Vue.set(state.operations, key, {})
    }
    Vue.set(state, 'selectedKanban', {})
}
//thay đổi operation khi tích hoặc bỏ tích checkbox
const changeOperation = (state, data) => {
    let objIden = ''
    if (data.objectType == 'document_instance') {
        objIden = 'document_definition:' + data.id + ':0'
    } else if (data.objectType == 'stateflow_flow' || data.objectType == 'dashboard_tab') {
        for (let key in state.operations[data.objectType]) {
            if (key.includes(data.id)) {
                objIden = key;
            }
        }
    } else objIden = data.objectType + ':' + data.id

    if (!state.operations[data.objectType]) {
        Vue.set(state.operations, data.objectType, {})

    }
    // if (!state.operations[data.objectType][objIden]) {
    //     Vue.set(state.operations[data.objectType], objIden, {
    //         action: [],
    //         filter: [],
    //         id: '0',
    //         title: ''
    //     })
    // }
    if (data.objectType == 'department') {
        state.operations[data.objectType][objIden].action = data.action
    } else {
        if (data.value) {
            state.operations[data.objectType][objIden].action.push(data.action)
        } else {
            state.operations[data.objectType][objIden].action.splice(state.operations[data.objectType][objIden].action.indexOf(data.action), 1)
        }
    }

}
//lưu lại tất cả kanban
const setAllKanban = (state, data) => {
    Vue.set(state, 'allKanban', data);
};
const setListFilters = (state, data) => {
    Vue.set(state, 'listFilters', data);
}
// lưu lại tất cả app
const setAllApp = (state, data) => {
    let arr = []
    for (let key in data) {
        arr.push({ id: data[key].id, name: data[key].name, isSelected: false })
    }
    Vue.set(state, 'allApps', arr);
};
//lưu lại action create khi user thay đổi operation
const updateActionCreate = (state, data) => {
    if (!state.operations[data.objType]) {
        Vue.set(state.operations, data.objType, {})
    }
    if (!state.operations[data.objType][data.objType + ':0']) {
        state.operations[data.objType][data.objType + ':0'] = {
            action: [],
            filter: [],
            id: '0',
            title: ''
        };
    }
    if (data.value) {
        state.operations[data.objType][data.objType + ':0'].action.push('create')
    } else {
        state.operations[data.objType][data.objType + ':0'].action.splice(state.operations[data.objType][data.objType + ':0'].action.indexOf('create'), 1)
    }
}
// thêm mới 1 object iden khi user click chọn (lúc search)
const addNewObjectIdentifier = (state, data) => {
    if (!state.operations[data.objectType]) {
        Vue.set(state.operations, data.objectType, {})
    }
    Vue.set(state.operations[data.objectType], data.objIden, {
        action: [],
        filter: [],
        id: data.id,
        title: data.title
    })
}
//set children cho application vừa chọn
const setChildrenForApp = (state, data) => {
    let id = Object.keys(data)[0];
    state.allApplicationsInActionPack[id].children = data[id].children
}
//set các stateflow cho kanban vừa chọn
const setDataForKanban = (state, data) => {
    state.selectedKanban[data.id].stateflow_flow = data.stateflow_flow
}
const setOneActionForAllObjectIdentifier = (state, data) => {
    if (!state.operations[data.objectType]) {
        Vue.set(state.operations, data.objectType, {})
    }
    for (let id of data.objIden) {
        if (!state.operations[data.objectType][id]) {
            Vue.set(state.operations[data.objectType], id, {
                action: [],
                filter: [],
                id: 0,
                title: ''
            })
        }
    }
    for (let key in state.operations[data.objectType]) {
        if (data.value) {
            if (data.objIden.includes(key)) {
                if (!state.operations[data.objectType][key].action.includes(data.col)) {
                    state.operations[data.objectType][key].action.push(data.col);
                }
            }
        } else {
            if (data.objIden.includes(key))
                if (state.operations[data.objectType][key].action.includes(data.col)) {
                    state.operations[data.objectType][key].action.splice(state.operations[data.objectType][key].action.indexOf(data.col), 1)
                }
        }
    }
}

const changeMultiOperations = (state, data) => {
    let arrIden = []
    if (data.objectType == 'document_instance') {
        arrIden = data.objId.map((obj) => {
            return 'document_definition:' + obj + ':0'
        })
    } else if (data.objectType == 'stateflow_flow' || data.objectType == 'dashboard_tab') {
        arrIden = data.objId.map((obj) => {
            for (let key in state.operations[data.objectType]) {
                if (key.includes(obj)) {
                    return key;
                }
            }
        })
    } else
        arrIden = data.objId.map((obj) => {
            return data.objectType + ':' + obj
        })
    data.actions.forEach((action) => {
        arrIden.forEach((id) => {
            if (data.value && !state.operations[data.objectType][id].action.includes(action)) {
                state.operations[data.objectType][id].action.push(action)
            } else if (!data.value && state.operations[data.objectType][id].action.includes(action)) {
                state.operations[data.objectType][id].action.splice(state.operations[data.objectType][id].action.indexOf(action), 1)
            }
        })
    })

}

const setPermissionControl = (state, data) => {
    let objIden = 'document_definition:' + data.id;
    state.operations.document_definition[objIden].permissionControl = data.control
    Object.keys(data.operations).forEach((id) => {
        if (state.operations.control[id]) {
            state.operations.control[id].title = data.operations[id].title
            state.operations.control[id].name = data.operations[id].name
            state.operations.control[id].id = data.operations[id].id
        } else {
            state.operations.control[id] = data.operations[id]
        }
    })
}

const setFilterForObject = (state, data) => {
    state.operations[data.objectType][data.objIden].filter = data.filters
}
export {
    cacheAllResourceItem, setAllResource, setAllApp, setAllKanban, setApplicationInActionPack, addNewObjectIdentifier, setPermissionControl,
    setOperation, updateOperation, deleteApp, changeOperation, setSelectedKanban, deleteKanban, resetStoreData, updateActionCreate,
    setChildrenForApp, setDataForKanban, setCreateData, setOneActionForAllObjectIdentifier, changeMultiOperations, setListFilters, setFilterForObject
};

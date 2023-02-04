import Vue from 'vue';

const updateCommentTarget = (state, data) => {
    Vue.set(state[data.instanceKey], 'commentTarget', data.data);
};

const updateListResolve = (state, data) => {
    let list = typeof data !== 'undefined' ? data.data : {};
    Vue.set(state[data.instanceKey], 'listResolve', list);
};
const updateListAvtiveComment = (state, data) => {
    let list = typeof data !== 'undefined' ? data.data : {};
    Vue.set(state[data.instanceKey], 'listAvtiveComment', list);
};

const updateReplyStatus = (state, data) => {
    state[data.instanceKey].isReply = data.data;
};
const updateParentCommentTarget = (state, data) => {
    Vue.set(state[data.instanceKey].commentTarget, 'parentId', data.data);
};

const changeCommentStatus = (state, data) => {
    if (data.type == 'resolve') {
        Vue.set(
            state[data.instanceKey].listResolve,
            data.id,
            state[data.instanceKey].listAvtiveComment[data.id],
        );
        delete state[data.instanceKey].listAvtiveComment[data.id];
    } else {
        Vue.set(
            state[data.instanceKey].listAvtiveComment,
            data.id,
            state[data.instanceKey].listResolve[data.id],
        );
        delete state[data.instanceKey].listResolve[data.id];
    }
};

const deleteComment = (state, data) => {
    let listKey = data.activeTab == 0 ? 'listAvtiveComment' : 'listResolve';
    if (state[data.instanceKey][listKey][data.id]) {
        delete state[data.instanceKey][listKey][data.id];
    } else {
        for (let item in state[data.instanceKey][listKey]) {
            if (state[data.instanceKey][listKey][item].childrens[data.id]) {
                delete state[data.instanceKey][listKey][item].childrens[
                    data.id
                ];
            }
        }
    }
};
/**
 *
 * @param {array | string} objIdens một hoặc nhiều các object identify, có dạng: ['task:123', 'doc:456']
 */
const setWaitingCommentCountPerObj = function (state, objIdens) {
    if (typeof objIdens == 'string') {
        if (!state.commentCountPerObj.list.hasOwnProperty(objIdens)) {
            Vue.set(state.commentCountPerObj.list, objIdens, '');
        }
        Vue.set(state.commentCountPerObj.waiting, objIdens, true);
    } else {
        for (let id of objIdens) {
            if (!state.commentCountPerObj.list.hasOwnProperty(id)) {
                Vue.set(state.commentCountPerObj.list, id, '');
            }
            Vue.set(state.commentCountPerObj.waiting, id, true);
        }
    }
};

/**
 *
 * @param {object} data chứa tổng số comment của mỗi object id, dạng: {'comment:123':2}
 */
const setCommentCountPerObj = function (state, data) {
    for (let id in data) {
        Vue.set(state.commentCountPerObj.list, id, data[id]);
        Vue.delete(state.commentCountPerObj.waiting, id);
    }
};

const updateMapAttachments = function (state, data) {
    state[data.instanceKey].mapAttachments = Object.assign(
        state[data.instanceKey].mapAttachments,
        data.data,
    );
};

const initInstanceKey = function (state, data) {
    Vue.set(state, data.instanceKey, {
        commentTarget: {
            parentId: 0,
            uuid: 0,
            targetArea: '',
            objectIdentifier: null,
            objectType: '',
        },
        listResolve: {},
        listAvtiveComment: {},
        currentTab: '',
        mapAttachments: {},
        // Khadm: biến lưu lại tổng số comment của các object
    });
};
const addComment = function (state, data) {
    if (state[data.instanceKey].commentTarget.parentId == 0) {
        Vue.set(
            state[data.instanceKey].listAvtiveComment,
            data.data.id,
            data.data,
        );
    } else {
        let listKey = data.activeTab == 0 ? 'listAvtiveComment' : 'listResolve';
        Vue.set(
            state[data.instanceKey][listKey][
                state[data.instanceKey].commentTarget.parentId
            ].childrens,
            data.data.id,
            data.data,
        );
    }
};

export {
    updateCommentTarget,
    updateListResolve,
    updateListAvtiveComment,
    updateReplyStatus,
    updateParentCommentTarget,
    changeCommentStatus,
    deleteComment,
    setWaitingCommentCountPerObj,
    setCommentCountPerObj,
    initInstanceKey,
    addComment,
    updateMapAttachments,
};

/**
 *
 * @param {array | string} objIdens một hoặc nhiều các object identify, có dạng: ['task:123', 'doc:456']
 */
const setWaitingFileCountPerObj = function (state, objIdens) {
    if (typeof objIdens == 'string') {
        if (state.fileCountPerObj.list.hasOwnProperty(objIdens)) {
            state.fileCountPerObj.list[objIdens] = '';
        } else {
            Vue.set(state.fileCountPerObj.list, objIdens, '');
        }
        Vue.set(state.fileCountPerObj.waiting, objIdens, true);
    } else {
        for (let id of objIdens) {
            if (state.fileCountPerObj.list.hasOwnProperty(id)) {
                state.fileCountPerObj.list[id] = '';
            } else {
                Vue.set(state.fileCountPerObj.list, id, '');
            }
            Vue.set(state.fileCountPerObj.waiting, id, true);
        }
    }
};

/**
 *
 * @param {object} data chứa tổng số file của mỗi object id, dạng: {'file:123':2}
 */
const setFileCountPerObj = function (state, data) {
    for (let id in data) {
        if (state.fileCountPerObj.list.hasOwnProperty(id)) {
            state.fileCountPerObj.list[id] = data[id];
        } else {
            Vue.set(state.fileCountPerObj.list, id, data[id]);
        }
        Vue.delete(state.fileCountPerObj.waiting, id);
    }
};

export { setFileCountPerObj, setWaitingFileCountPerObj };

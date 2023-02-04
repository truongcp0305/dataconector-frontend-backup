const defaultState = {
    commentTarget: {
        parentId: 0,
        uuid: 0,
        targetArea: '',
        objectIdentifier: null,
        objectType: '',
    },
    listComment: [],
    listResolve: [],
    listAvtiveComment: [],
    currentTab: '',
    // Khadm: biến lưu lại tổng số comment của các object
    commentCountPerObj: {
        waiting: {}, // danh sách các object chưa lấy được tổng số comment, dạng {'task:abc-xyz': true}
        /**
         * danh sách các object đã lấy được và chưa lấy được tổng số comment,
         * dạng: {'task:abc-xyz': Number || ''}
         * Là Number nếu đã lấy được
         * Là rỗng nếu nằm trong danh sách notGet
         */
        list: {},
    },

    // isReply: false,
};
export default defaultState;

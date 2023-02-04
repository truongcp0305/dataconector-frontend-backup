const defaultState = {
    // Khadm: biến lưu lại tổng số file của các object
    fileCountPerObj: {
        waiting: {}, // danh sách các object chưa lấy được tổng số file, dạng {'task:abc-xyz': true}
        /**
         * danh sách các object đã lấy được và chưa lấy được tổng số file,
         * dạng: {'task:abc-xyz': Number || ''}
         * Là Number nếu đã lấy được
         * Là rỗng nếu nằm trong danh sách notGet
         */
        list: {},
    },
};
export default defaultState;

import { documentApi } from '@/api/Document';
import { SYMPER_APP } from '@/main.js';
const action1 = (state, data) => {
    state.data = data;
};

/**
 * Khadm
 * Hàm lấy danh sách tất cả các document đang được active trong hệ thống để lưu trong
 * @param {*} context
 * @param {*} data
 */
const setListDocuments = async (context, forceGetData = false) => {
    if (forceGetData || context.state.needGetAllDoc) {
        context.state.needGetAllDoc = false;
        try {
            let res = await documentApi.getListDocuments({
                pageSize: 3000,
            });
            if (res.status == 200) {
                context.commit('setAllDocuments', res.data.listObject);
                SYMPER_APP.$store.commit(
                    'formulaEditor/addCompletionItemsForDocs',
                    res.data.listObject,
                );
            } else {
                console.error(res, '[Symper::get list documents failed!]');
            }
        } catch (error) {
            console.error(error, '[Symper::get list documents failed!]');
        }
    }
};
export { action1, setListDocuments };

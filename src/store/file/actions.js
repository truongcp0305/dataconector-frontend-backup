import { fileManagementApi } from '../../api/FileManagement';
import { SYMPER_APP } from '../../main';

const addReply = (state, data) => {};

const getWaitingFileCountPerObj = async function (context) {
    let ids = Object.keys(context.state.fileCountPerObj.waiting);
    let res = await fileManagementApi.getFileCountPerObj(ids);
    if (res.status == 200) {
        context.commit('setFileCountPerObj', res.data);
    } else {
        SYMPER_APP.$snotifyError(res, 'Can not get file count per object');
    }
};
export { getWaitingFileCountPerObj };

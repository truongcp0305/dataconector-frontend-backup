import { commentApi } from '../../api/Comment';
import { SYMPER_APP } from './../../main.js';

const addReply = (state, data) => {};

const getWaitingCommentCountPerObj = async function (context) {
    let ids = Object.keys(context.state.commentCountPerObj.waiting);
    let res = await commentApi.getCommentCountPerObj(ids);
    if (res.status == 200) {
        context.commit('setCommentCountPerObj', res.data);
    } else {
        SYMPER_APP.$snotifyError(res, 'Can not get comment count per object');
    }
};
export { getWaitingCommentCountPerObj };

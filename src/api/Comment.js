import Api from './api';
import { appConfigs } from './../configs.js';

var coreApi = new Api(appConfigs.apiDomain.comment);
export const commentApi = {
    getCommentById(objType, objId) {
        return coreApi.get('comment/' + objType + '/' + objId);
    },
    getParentComment(objType, objId, page, pageSize) {
        return coreApi.get(
            'comment-parent/' +
                objType +
                '/' +
                objId +
                '?page=' +
                page +
                '&pagesize=' +
                pageSize,
        );
    },
    getParentCommentTag(objType, objId, id, pageSize, order, subId) {
        return coreApi.get(
            'comment-parent-tag/' +
                objType +
                '/' +
                objId +
                '?id=' +
                id +
                '&pagesize=' +
                pageSize +
                '&order=' +
                order +
                '&subId=' +
                subId,
        );
    },
    getChildrenCommentTag(objType, objId, id, parentId, pageSize, order) {
        return coreApi.get(
            'comment-children-tag/' +
                objType +
                '/' +
                objId +
                '?id=' +
                id +
                '&parentid=' +
                parentId +
                '&pagesize=' +
                pageSize +
                '&order=' +
                order,
        );
    },
    getBehindCommentTag(objType, objId, id, parentId, pageSize, sessionsend) {
        let k = {};
        k.id = id;
        k.parentid = parentId;
        k.pagesize = pageSize;
        k.sessionsend = sessionsend;
        return coreApi.get('comment-behind/' + objType + '/' + objId, k);
    },
    getChildrenComment(parentId, page, pageSize) {
        return coreApi.get(
            'comment-children/' +
                parentId +
                '?page=' +
                page +
                '&pagesize=' +
                pageSize,
        );
    },
    getCommentByUuid(objType, objId, uuid) {
        return coreApi.get(
            'comment-uuid/' + objType + '/' + objId + '/' + uuid,
        );
    },
    deleteComment(id) {
        return coreApi.delete('comment/' + id);
    },
    changeStatus(id) {
        return coreApi.put('comment-status/' + id);
    },
    addComment(data) {
        return coreApi.post('comment', data);
    },
    editComment(data) {
        return coreApi.put('comment', data);
    },
    download(id) {
        window.open(
            appConfigs.apiDomain.fileManagement + 'downloadS/' + id,
            '_blank',
        );
    },
    getCommentCountPerObj(ids) {
        return coreApi.get('count-on-object?ids=' + JSON.stringify(ids));
    },
};

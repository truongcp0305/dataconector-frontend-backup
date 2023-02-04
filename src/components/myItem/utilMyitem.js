/*
 * Kiểm tra xem task có quyền được xóa không
 */
function checkIsDeleted(obj, userId) {
    let k = null;
    try {
        k = JSON.parse(obj.description);
    } catch (e) {
        return false;
    }
    let checkDocObjId =
        !k.action.parameter.documentObjectId || k.action.action == 'update';
    if (
        obj.statusText != 'complete' &&
        userId == obj.assigneeInfo.id &&
        checkDocObjId
    ) {
        return true;
    }
    return false;
}

export { checkIsDeleted };

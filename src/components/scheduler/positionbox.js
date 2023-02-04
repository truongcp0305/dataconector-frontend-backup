
/**
 * Hàm tính toán ra vị trí để hiển thị popup trên màn hình submit
 * @param {*} e 
 * @param {*} context //  element root submit or detail
 * @param {*} cardContext // card
 * @returns 
 */
const calculatorPositionSelectBar = function (e, context, sizeAdditional = null) {
    let addTop = (sizeAdditional && sizeAdditional.top) ? sizeAdditional.top : 0;
    let addBottom = (sizeAdditional && sizeAdditional.bottom) ? sizeAdditional.bottom : 0;
    let addLeft = (sizeAdditional && sizeAdditional.left) ? sizeAdditional.left : 0;
    let addRight = (sizeAdditional && sizeAdditional.right) ? sizeAdditional.right : 0;
    let inputOffset = $(e.curTarget).offset();
    let positionBox = {};
    let submitFormOffset = context.offset();
    let submitFormWidth = context.width();
    let submitFormHeight = context.height();
    let leftDiff = inputOffset.left - submitFormOffset.left;
    let inputWidth = $(e.curTarget).width();
    let inputHeight = $(e.curTarget).height();
    let contextPadding = context.innerWidth() - context.width();
    let scrollTop = context.closest('.scroll-content').scrollTop();


    if (inputOffset.left < 400 && (window.innerWidth - inputOffset.left - inputWidth) < 400) {
        positionBox = { 'left': window.innerWidth / 2 - 200 + 'px' };
    }
    else if (leftDiff + addLeft - 408 <= 0 && (window.innerWidth - inputOffset.left - inputWidth) < 400) {
        positionBox = { 'left': window.innerWidth / 2 - 370 + 'px' };
    }
    else if (inputOffset.left > 400) {
        if ((leftDiff + addLeft - 408) <= 0 && (window.innerWidth - inputOffset.left - inputWidth) > 400) {
            positionBox = { 'left': leftDiff + addLeft + inputWidth + 24 + 'px' };

        }
        else
            positionBox = { 'left': leftDiff + addLeft - 408 + 'px' };

    }
    else {
        positionBox = { 'left': leftDiff + addLeft + inputWidth + 24 + 'px' };
    }


    if (window.innerHeight - inputOffset.top < 200) {
        positionBox.bottom = window.innerHeight - inputOffset.top + 'px'
    }
    else {
        positionBox.top = inputOffset.top - submitFormOffset.top + addTop - 18 + 'px'
    }
    return positionBox;
}
export {
    calculatorPositionSelectBar
}
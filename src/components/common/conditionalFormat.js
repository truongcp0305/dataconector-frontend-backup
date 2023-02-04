// xử lý condition format
export const formatOperator = function (name, listOperators) {
    let value = name;
    listOperators.map((opr) => {
        if (checkIsInListOpr(opr.name, listOperators)) {
            if (opr.name == name) {
                value = opr.value;
            }
        } else {
            value = name;
        }
    });
    return value;
};
export const checkIsInListOpr = function (opr, listOperators) {
    let check = false;
    listOperators.map((operator) => {
        if (operator.name == opr) {
            check = true;
        }
    });
    return check;
};

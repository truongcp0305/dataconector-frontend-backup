var agCellRender = {
    numberRenderer() {},
};

function thousandsSeparators(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x)) x = x.replace(pattern, '$1,$2');
    return x;
}

agCellRender.numberRenderer.prototype.init = function (params) {
    this.eGui = document.createElement('span');
    let value = params.value === undefined ? null : params.value;

    let decimalCount = params.colDef.symperCellConfig.decimalNumber;
    if (
        params.colDef.symperType == 'number' &&
        (Number(value) == 0 || value == '-')
    ) {
        value = params.colDef.symperCellConfig.zeroValueDisplay;
    } else {
        value = Number(value).toLocaleString(undefined, {
            minimumFractionDigits: decimalCount,
        });
    }

    // Nếu là dòng cuối cùng của bảng và  phép toán trên cột này là none thì quay về giá trị ban đầu
    if (params.node.rowPinned == 'bottom') {
        if (params.colDef.lastLineAgg == 'none') {
            value = params.value;
        }
    }

    if ((value + '').toLowerCase() == 'nan') {
    }
    this.eGui.innerHTML = value;
};

agCellRender.numberRenderer.prototype.getGui = function () {
    return this.eGui;
};

export default agCellRender;

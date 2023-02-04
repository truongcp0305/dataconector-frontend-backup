export const LocationCellEditor = () => { };

LocationCellEditor.prototype.init = function (params) {
    if (params.value) {
        this.eInput.value = params.value;
    }
};

LocationCellEditor.prototype.getGui = function () {
    return this.eInput;
};
LocationCellEditor.prototype.setValue = function (value) {
    if (this.eInput) {
        this.eInput.value = value;
    }
};
LocationCellEditor.prototype.afterGuiAttached = function () {
    if (this.eInput) {
        this.eInput.focus();
    }
};
LocationCellEditor.prototype.getValue = function () {
    if (this.eInput) {
        return this.eInput.value;
    }
};
LocationCellEditor.prototype.isPopup = function () {
    return true;
};
LocationCellEditor.prototype.destroy = function () {
};

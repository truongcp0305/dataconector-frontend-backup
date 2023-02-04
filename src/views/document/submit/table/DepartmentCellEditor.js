export const DepartmentCellEditor = () => { };

DepartmentCellEditor.prototype.init = function (params) {
    if (params.value) {
        this.eInput.value = params.value;
    }
};

DepartmentCellEditor.prototype.getGui = function () {
    return this.eInput;
};
DepartmentCellEditor.prototype.setValue = function (value) {
    if (this.eInput) {
        this.eInput.value = value;
    }
};
DepartmentCellEditor.prototype.afterGuiAttached = function () {
    if (this.eInput) {
        this.eInput.focus();
    }
};
DepartmentCellEditor.prototype.getValue = function () {
    if (this.eInput) {
        return this.eInput.value;
    }
};
DepartmentCellEditor.prototype.isPopup = function () {
    return true;
};
DepartmentCellEditor.prototype.destroy = function () {
};

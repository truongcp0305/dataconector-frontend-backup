// function to act as a class
export const TextCellEditor = () => {};

// gets called once before the renderer is used
TextCellEditor.prototype.init = function (params) {
    // create the cell
    this.eInput = document.createElement('div');
    this.eInput.setAttribute('contenteditable', true);
    this.eInput.classList.add('ag-input-field-input-text');
    let eGridCell = params.eGridCell;
    let cellOffset = $(eGridCell).offset();
    let cellWidth = $(eGridCell).outerWidth();
    if (window.innerWidth > cellOffset.left + cellWidth * 2) {
        $(this.eInput).css({ 'max-width': cellWidth * 2 + 'px' });
    } else {
        $(this.eInput).css({
            'max-width': window.innerWidth - cellOffset.left - 12 + 'px',
        });
    }
    $(this.eInput).css({
        'min-width': cellWidth + 'px',
        'min-height': $(eGridCell).height() + 'px',
        padding: '2px 4px',
        border: '1px solid #0091ea',
    });
    let value = params.value;
    let keyPress = params.keyPress;
    if (keyPress != 13 && keyPress != 113) {
        value = params.charPress;
    }
    if (!keyPress && !params.charPress) {
        value = params.value;
    }
    this.eInput.innerText = value;
};

// gets called once when grid ready to insert the element
TextCellEditor.prototype.getGui = function () {
    return this.eInput;
};
TextCellEditor.prototype.setValue = function (value) {
    if (this.eInput) {
        this.eInput.innerText = value;
    }
};

// focus and select can be done after the gui is attached
TextCellEditor.prototype.afterGuiAttached = function () {
    this.eInput.focus();
    if (this.eInput.innerText.length > 0) {
        var sel = window.getSelection();
        var innerDiv = this.eInput;
        var innerDivText = innerDiv.firstChild;
        sel.collapse(innerDivText, this.eInput.innerText.length);
        innerDiv.focus();
    }
};

// returns the new value after editing
TextCellEditor.prototype.getValue = function () {
    return this.eInput.innerText;
};
TextCellEditor.prototype.isPopup = function () {
    return true;
};

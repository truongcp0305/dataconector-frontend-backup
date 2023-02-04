import { SYMPER_APP } from '@/main.js';

// function to act as a class
export const AutoCompleteCellEditor = () => {};
var KEY_BACKSPACE = 8;
var KEY_F2 = 113;
var KEY_DELETE = 46;

// gets called once before the renderer is used
AutoCompleteCellEditor.prototype.init = function (params) {
    if (!params.node.rowPinned) {
        this.eInput = document.createElement('input');
        if (params.value) {
            this.eInput.value = params.value;
        }
        this.params = params;
        this.controlName = params.control.name;
        this.eInput.classList.add('ag-cell-autocomplete');
        let eGridCell = params.eGridCell;
        let cellWidth = $(eGridCell).innerWidth();
        let cellheight = $(eGridCell).height();
        $(this.eInput).css({
            width: cellWidth + 'px',
            height: cellheight + 'px',
        });
        var startValue;
        var keyPressBackspaceOrDelete =
            params.keyPress === KEY_BACKSPACE || params.keyPress === KEY_DELETE;

        if (keyPressBackspaceOrDelete) {
            startValue = '';
        } else if (params.charPress) {
            startValue = params.charPress;
        } else {
            startValue = params.value;
            if (params.keyPress !== KEY_F2) {
                this.highlightAllOnFocus = true;
            }
        }

        if (startValue !== null && startValue !== undefined) {
            this.eInput.value = startValue;
        }
        let self = this;
        let thisEl = this.eGui;
        this.eInput.addEventListener('keyup', function (e) {
            params.value = e.target.value;
            e.curTarget = thisEl;
            SYMPER_APP.$evtBus.$emit('document-submit-autocomplete-key-event', {
                e: e,
                controlName: self.controlName,
                rowIndex: [params.node.id],
                rowNodeId: [params.node.id],
            });
        });
    }
};
AutoCompleteCellEditor.prototype.isPopup = function () {
    return true;
};
// gets called once when grid ready to insert the element
AutoCompleteCellEditor.prototype.getGui = function () {
    return this.eInput;
};
AutoCompleteCellEditor.prototype.setValue = function (value) {
    if (this.eInput) {
        this.eInput.value = value;
    }
};

// focus and select can be done after the gui is attached
AutoCompleteCellEditor.prototype.afterGuiAttached = function () {
    if (this.eInput) {
        this.eInput.focus();
    }
};

AutoCompleteCellEditor.prototype.getValue = function () {
    if (this.eInput) {
        return this.eInput.value;
    }
};
AutoCompleteCellEditor.prototype.destroy = function () {
    if (this.eInput) {
        this.eInput.removeEventListener('keyup', (this.eInput, event));
        SYMPER_APP.$evtBus.$emit('document-submit-hide-autocomplete');
    }
};

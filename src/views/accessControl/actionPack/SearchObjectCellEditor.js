import { SYMPER_APP } from '@/main.js';

export const SearchObjectCellEditor = () => {};

SearchObjectCellEditor.prototype.init = function (params) {
    if (!params.node.rowPinned) {
        this.eInput = document.createElement('input');
        if (params.value) {
            this.eInput.value = params.value;
        }
        this.params = params;
        let eGridCell = params.eGridCell;
        let cellWidth = $(eGridCell).innerWidth();
        let cellheight = $(eGridCell).height();
        let position = $(eGridCell).offset();
        $(this.eInput).css({
            width: cellWidth + 'px',
            height: cellheight + 'px',
            'padding-left': '10px',
        });
        this.eInput.addEventListener('keyup', function (e) {
            params.value = e.target.value;
            let preventKey = [
                'ArrowDown',
                'ArrowUp',
                'ArrowLeft',
                'ArrowRight',
            ];
            if (params.value && !preventKey.includes(e.code)) {
                SYMPER_APP.$evtBus.$emit(
                    'action-pack-search-objectIdentifier',
                    {
                        e: e,
                        type: params.colDef.typeFor,
                        position: position,
                        cellWidth: cellWidth,
                        rowIndex: [params.node.id],
                        rowNodeId: [params.node.id],
                    },
                );
            }
        });
    }
};
SearchObjectCellEditor.prototype.isPopup = function () {
    return true;
};
// gets called once when grid ready to insert the element
SearchObjectCellEditor.prototype.getGui = function () {
    return this.eInput;
};
SearchObjectCellEditor.prototype.setValue = function (value) {
    if (this.eInput) {
        this.eInput.value = value;
    }
};

// focus and select can be done after the gui is attached
SearchObjectCellEditor.prototype.afterGuiAttached = function () {
    if (this.eInput) {
        this.eInput.focus();
    }
};

SearchObjectCellEditor.prototype.getValue = function () {
    if (this.eInput) {
        return this.eInput.value;
    }
};
SearchObjectCellEditor.prototype.destroy = function () {
    if (this.eInput) {
        this.eInput.removeEventListener('keyup', (this.eInput, event));
        SYMPER_APP.$evtBus.$emit('action-pack-search-objectIdentifier');
    }
};

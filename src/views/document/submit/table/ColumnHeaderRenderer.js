import { SYMPER_APP } from '@/main.js';
export const ColumnHeaderRenderer = () => {};
ColumnHeaderRenderer.prototype.init = function (params) {
    this.params = params
    this.eGui = document.createElement('div');
    this.eGui.style.width = '100%'
    this.eGui.innerHTML = `
            <div class="ag-cell-label-container" role="presentation">
                <button class="button-run-formula-manually-control-inTable" control-name="`+params.column.colId+`" style="border-radius: 2px;">
                    <i class="mdi mdi-refresh d-block document-submit-button-run-formula-manually"></i>
                </button>
                <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button customHeaderMenuButton" aria-hidden="true">
                    <span class="ag-icon ag-icon-menu" unselectable="on" role="presentation"></span>
                </span>
                <div ref="eLabel" class="ag-header-cell-label" role="presentation">
                    <span ref="eText" class="ag-header-cell-text">${params.displayName}</span>
                    <span ref="eFilter" class="ag-header-icon ag-header-label-icon ag-filter-icon" aria-hidden="true"></span>
                    <span ref="eSortOrder" class="ag-header-icon ag-header-label-icon ag-sort-order" aria-hidden="true"></span>
                    <span ref="eSortAsc" class="ag-header-icon ag-header-label-icon ag-sort-ascending-icon customSortUpLabel d-none aria-hidden="true">
                        <span class="ag-icon ag-icon-asc" unselectable="on" role="presentation"></span>
                    </span>
                    <span ref="eSortDesc" class="ag-header-icon ag-header-label-icon ag-sort-descending-icon customSortDownLabel d-none aria-hidden="true">
                        <span class="ag-icon ag-icon-desc" unselectable="on" role="presentation"></span>
                    </span>
                    <span ref="eSortNone" class="ag-header-icon ag-header-label-icon ag-sort-none-icon customSortRemoveLabel d-none aria-hidden="true">
                        <span class="ag-icon ag-icon-none" unselectable="on" role="presentation"></span>
                    </span>
                </div>
            </div>
        `
    this.eMenuButton = this.eGui.querySelector('.customHeaderMenuButton');
    this.eSortDownButton = this.eGui.querySelector('.customSortDownLabel');
    this.eSortUpButton = this.eGui.querySelector('.customSortUpLabel');
    this.eRunFormula = this.eGui.querySelector('.button-run-formula-manually-control-inTable');

    if(params.isRunFormulaManually && params.context.thisComponent.viewType != 'detail'){
        this.onRunFormulaButtonClickListener = this.onRunFormulaButtonClick.bind(this);
        this.eRunFormula.addEventListener('click', this.onRunFormulaButtonClickListener);
    }else this.eRunFormula.remove();
    
    if(params.column.colDef.checkboxSelection){
        this.eGui.querySelector('.ag-header-cell-label').remove();
    }

    this.onMenuClickListener = this.onMenuClick.bind(this);
    this.eMenuButton.addEventListener('click', this.onMenuClickListener);

    this.onClickHeaderCellListener = this.onClickHeaderCell.bind(this);
    this.eGui.addEventListener('click', this.onClickHeaderCellListener);

};

ColumnHeaderRenderer.prototype.onClickHeaderCell = function (event) {
        const deactivate = (toDeactivateItems) => {
            toDeactivateItems.forEach((toDeactivate) => {
                toDeactivate.className = toDeactivate.className  + ' d-none';
            });
        };

        const activate = (toActivate) => {
            toActivate.className = toActivate.className.split(' ')[0];
        };

        if (!$(this.eSortUpButton).is(":visible") && !$(this.eSortDownButton).is(":visible")) {
            this.params.setSort('asc', event.shiftKey);
            deactivate([this.eSortDownButton]);
            activate(this.eSortUpButton)
        } else if ($(this.eSortUpButton).is(":visible")) {
            this.params.setSort('desc', event.shiftKey);
            deactivate([this.eSortUpButton]);
            activate(this.eSortDownButton);
        } else {
            this.params.setSort(null, event.shiftKey);
            deactivate([this.eSortUpButton, this.eSortDownButton]);
        }
};
ColumnHeaderRenderer.prototype.onMenuClick = function (e) {
    e.stopPropagation()
    this.params.showColumnMenu(this.eMenuButton);
};
ColumnHeaderRenderer.prototype.onRunFormulaButtonClick = function (e) {
    e.stopPropagation()
    SYMPER_APP.$evtBus.$emit('document-submit-run-formula-manually-control-click', {
        controlName: this.params.column.colId
    });
};
ColumnHeaderRenderer.prototype.getGui = function () {
    return this.eGui;
};
ColumnHeaderRenderer.prototype.destroy = function (e) {
    this.eMenuButton.removeEventListener('click', this.onMenuClickListener);
    this.eGui.removeEventListener('click',this.onClickHeaderCellListener);
    this.eRunFormula.removeEventListener('click',this.onRunFormulaButtonClickListener);
};


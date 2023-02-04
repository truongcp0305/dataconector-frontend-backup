export default class IndexCellRenderer {
    init(params) {
        if (!params.node.rowPinned) {
            this.eGui = document.createElement('div');
            this.eGui.classList.add('my-custom-cell-renderer');
            let preventDelIcon = '';
            let tableIns = params.tableIns;
            if (
                params.node.data['childObjectId'] &&
                !tableIns.getAllowDeleteRowUpdate() &&
                tableIns.viewType == 'update'
            ) {
                preventDelIcon =
                    "<i class='mdi mdi-delete-off-outline prevent-delete' ></i>";
            }
            this.eGui.innerHTML = Number(params.rowIndex) + 1 + preventDelIcon;
            // creates the row dragger element
            var rowDragger = document.createElement('i');
            rowDragger.classList.add('mdi', 'mdi-arrow-up-down', 'icon-drag');
            this.eGui.appendChild(rowDragger);
            params.registerRowDragger(rowDragger);
        }
    }
    getGui() {
        return this.eGui;
    }
}

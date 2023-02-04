export default class SearchObjectCellRenderer {
    init(params) {
        if (!params.node.rowPinned) {
            this.eGui = document.createElement('div');
            this.eGui.innerHTML = params.value;
            // creates the row dragger element
        }
    }
    getGui() {
        return this.eGui;
    }
}

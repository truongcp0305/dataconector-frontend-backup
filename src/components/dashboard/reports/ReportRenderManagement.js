/***
 *  Component chuyên biệt cho việc quản lý render nội dung của các cell trong dashboard theo chiến lược:
 * chỉ render những cell nằm trong vùng nhìn thấy của user
 */
export default class ReportRenderManagement {
    constructor(workspace) {
        this.workspace = workspace;
        this.scrollY = 0;
        this.layout = {};
        (this.tabKey = ''), (this.viewportHeight = 200);
    }

    initParams(scrollY, layout, tabKey, viewportHeight) {
        this.scrollY = scrollY;
        this.layout = layout;
        this.tabKey = tabKey;
        this.viewportHeight = viewportHeight;
    }

    setScrollY(vl) {
        this.scrollY = vl;
    }

    /**
     * Render các cell trong khung nhìn thấy của user
     */
    renderCellsInViewport(
        scrollY,
        layout,
        tabKey,
        viewportHeight,
        rerender = false,
    ) {
        this.initParams(scrollY, layout, tabKey, viewportHeight);
        let categorizedCells = this.categorizeCells();
        this.activeCells(categorizedCells.visual, rerender);
    }

    /**
     * Cho hiển thị các cell trong vùng nhìn thấy
     */
    activeCells(cells, rerender = false) {
        for (let cell of cells) {
            if (!cell.active) {
                cell.active = true;
                setTimeout(
                    (self) => {
                        if (!cell.calledAPI) {
                            self.workspace.onChangeCellConfigs(
                                'data',
                                cell.cellId,
                            );
                            cell.calledAPI = true;
                        } else {
                            self.workspace.onChangeCellConfigs(
                                'style',
                                cell.cellId,
                            );
                        }
                    },
                    0,
                    this,
                );
            }
        }

        if (rerender) {
            for (let cell of cells) {
                if (cell.active) {
                    this.workspace.onChangeCellConfigs('style', cell.cellId);
                }
            }
        }
    }

    /**
     * Xóa đi các cell trong vùng không nhìn thấy
     */
    deactiveCells(cells) {
        for (let cell of cells) {
            cell.active = false;
        }
    }

    /**
     * Phân loại cell thành 2 loại: nằm trong vùng nhìn thấy và ko
     */
    categorizeCells() {
        let cellsSize = this.getCellsInfoInActiveTab();
        let rsl = {
            visual: [],
            hidden: [],
        };

        let topBorderY = this.scrollY;
        let bottomBorderY =
            this.scrollY + Number(this.viewportHeight.replace('px', ''));
        for (let cellId in cellsSize) {
            let item = cellsSize[cellId];
            if (
                (item.y >= topBorderY && item.y <= bottomBorderY) || // top-left của cell nằm trong khung
                (item.y + item.h >= topBorderY &&
                    item.y + item.h <= bottomBorderY) || // bottom left của cell nằm trong khung
                (topBorderY >= item.y && bottomBorderY <= item.y + item.h) // Khung nằm hoàn toàn trong cell
            ) {
                rsl.visual.push(item.cell);
            } else {
                rsl.hidden.push(item.cell);
            }
        }
        return rsl;
    }

    getCellsInfoInActiveTab() {
        let currentLayout = this.layout[this.tabKey];
        let info = {};
        for (let cell of currentLayout) {
            let cellId = cell.cellId;
            let container = $(
                `.symper-dashboard-cell-wrapper[symper-cell-id=${cellId}]`,
            )[0];
            if (container) {
                let coord = container.style.transform.match(/([0-9]+)px/g);
                let y = Number(coord[1].replace('px', ''));

                info[cellId] = {
                    y: y,
                    h: Number(container.style.height.replace('px', '')),
                    cell: cell,
                };
            }
        }
        return info;
    }
}

var dashboardLayoutManager = {
    fillRowWithNumber(x, y, num, map) {
        if (x < 0 || y < 0) {
            return map;
        } else {
            for (let i = 0; i < num; i++) {
                if (map[y][x + i] == 0) {
                    map[y][x + i] = 1;
                }
            }
        }

        return map;
    },

    /**
     * Đánh dấu các ô mà chắc chắn không thêm được cell
     * @param {*} map
     * @param {*} layout
     * @param {*} cell
     */
    fillUnaddCells(map, layout, cell) {
        let w = map[0].length;
        let h = map.length;

        for (let item of layout) {
            // đánh dấu các cell nằm trong một item của layout
            for (let i = 0; i < item.h; i++) {
                map = this.fillRowWithNumber(item.x, item.y + i, item.w, map);
            }

            // đánh dấu các cell ko hợp lệ ở trên
            for (let y = item.y - 1; y > item.y - cell.h; y--) {
                map = this.fillRowWithNumber(item.x, y, item.w, map);
            }

            // đánh dấu các cell ko hợp lệ ở bên trái
            for (let y = item.y - cell.h + 1; y < item.y + item.h; y++) {
                map = this.fillRowWithNumber(
                    item.x - cell.w + 1,
                    y,
                    cell.w - 1,
                    map,
                );
            }
        }
        return map;
    },

    getWorkspaceSize(currentLayout) {
        let size = {
            w: 0,
            h: 0,
        };
        let tmpH = 0;
        let tmpW = 0;
        var y = 0;
        for (let item of currentLayout) {
            tmpH = item.y + item.h;
            tmpW = item.x + item.w;
            if (tmpH > size.h) {
                size.h = tmpH;
            }
            if (tmpW > size.w) {
                size.w = tmpW;
            }
        }

        return size;
    },

    generateWorkspaceMap(w, h) {
        let rsl = [];
        for (let i = 0; i < h; i++) {
            let r = [];
            for (let j = 0; j < w; j++) {
                r.push(0);
            }
            rsl.push(r);
        }
        return rsl;
    },

    /**
     * Lấy tọa độ khi một cell mới được thêm vào dashboard
     * @param {Array} currentLayout Layout hiện tại của dashboard
     */
    getNewCoord(currentLayout, cellSize) {
        let coord = {
            x: 0,
            y: 0,
        };

        if (currentLayout.length == 0) {
            return coord;
        }

        let workspaceSize = this.getWorkspaceSize(currentLayout);
        let workspaceMap = this.generateWorkspaceMap(
            workspaceSize.w,
            workspaceSize.h,
        );
        workspaceMap = this.fillUnaddCells(
            workspaceMap,
            currentLayout,
            cellSize,
        );

        let found = false;
        for (let y in workspaceMap) {
            for (let x in workspaceMap) {
                if (workspaceMap[y][x] == 0) {
                    if (Number(x) + cellSize.w <= workspaceSize.w) {
                        coord.x = Number(x);
                        coord.y = Number(y);
                        found = true;
                        break;
                    }
                }
            }
            if (found) {
                break;
            }
        }

        if (coord.y == 0 && coord.x == 0) {
            coord.y = workspaceSize.h + 1;
        }
        return coord;
    },
};

/**
 * Lấy configs của cell mới được thêm vào
 * @param {String} cellType loại cell được thêm vào
 * @param {Array} currentLayout Layout hiện tại của dashboard
 */
export const getNewCellConfigLayout = function (
    cellType,
    currentLayout,
    cellId = false,
    cellSize = {},
    active = false,
) {
    let time = Date.now();
    cellId = cellId ? cellId : 'cell-' + time;
    let newCellSize = {
        h: cellSize.h ? cellSize.h : 15,
        w: cellSize.w ? cellSize.w : 12,
    };
    let coord = dashboardLayoutManager.getNewCoord(currentLayout, newCellSize);
    let newCell = {
        x: coord.x,
        y: coord.y,
        w: newCellSize.w,
        h: newCellSize.h,
        i: cellId,
        cellId: cellId,
        showIcon: true,
        selected: true,
        iconClass: `symper-${cellType}-cell new-item-icon`,
        active: active,
    };
    return newCell;
};

/**
 * Lấy thông tin về docker của các sequence flow trong model data
 */

var model = {};
var listLinks = {};
var eleMaps = {};

var obj = {
    flatModels(ele) {
        if (ele.childShapes) {
            for (let child of ele.childShapes) {
                eleMaps[child.resourceId] = child;
                this.flatModels(child);
            }
        }
    },
};

obj.flatModels(model);
for (let id in eleMaps) {
    let el = eleMaps[id];

    if (!(el.stencil.id == 'SequenceFlow')) {
        if (el.outgoing) {
            for (let outEl of el.outgoing) {
                eleMaps[outEl.resourceId].startPoint = {
                    resourceId: el.resourceId,
                };
            }
        }
    }
}

for (let id in eleMaps) {
    let el = eleMaps[id];
    if (el.stencil.id == 'SequenceFlow') {
        let dk = el.dockers;
        let item = {
            id: id,
            from: eleMaps[el.startPoint.resourceId].stencil.id,
            to: eleMaps[el.target.resourceId].stencil.id,
            x1: dk[0].x,
            y1: dk[0].y,
            x2: dk[dk.length - 1].x,
            y2: dk[dk.length - 1].y,
        };
        listLinks[id] = item;
    }
}

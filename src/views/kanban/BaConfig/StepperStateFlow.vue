<template>
    <div
        class="wrap-state-flow-config fs-13"
        id="state-flow-config"
        style="height: 470px"
    >
        <div class="state-flow d-flex justify-space-between">
            <div class="list-state mr-2" style="width: 170px">
                {{ $t('kanban.list_column') }}
                <div
                    ref="stencil"
                    class="mt-1"
                    id="stencil"
                    style="
                        height: 412px;
                        width: 170px;
                        border: 1px solid lightgrey;
                    "
                ></div>
            </div>
            <div class="w-100">
                {{ $t('kanban.interact_column') }}
                <div
                    ref="interactColumn"
                    class="mt-1"
                    id="paper"
                    style="overflow: scroll; width: 500px; height: 500px"
                ></div>
            </div>
            <div v-show="showConfig" class="config-state" style="width: 350px">
                <div class="d-flex justify-space-between">
                    {{ $t('kanban.config_flow') }}
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn
                                x-small
                                text
                                v-on="on"
                                @click="showConfig = false"
                            >
                                <v-icon :size="15">mdi-close</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('common.close') }}</span>
                    </v-tooltip>
                </div>
                <div class="state-config pa-3 mt-1">
                    <FormTpl
                        :viewOnly="action == 'view'"
                        :allInputs="stateConfig"
                    />
                    <small class="fs-10 color-grey">{{ $t('kanban.validateInfor') }}</small>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
require('@/components/common/rappid/jointjs');
import FormTpl from '@/components/common/FormTpl.vue';
export default {
    components: {
        FormTpl,
    },
    props: {
        config: {
            type: Object,
            default() {
                return {};
            },
        },
        action: {
            type: String,
            default: '',
        },
    },
    watch: {
        stateConfigName() {
            this.stateConfig.name.isValid = true;
            this.stateConfig.name.message = '';
            let currentLink = this.currentLink;
            let id = this.currentLink.id;
            this.config.stateFlowConfig.links[id].name =
                this.stateConfig.name.value;
            currentLink.removeLabel(0);
            currentLink.appendLabel({
                attrs: {
                    text: {
                        text:
                            this.stateConfig.name.value.length > 6
                                ? this.stateConfig.name.value.slice(0, 6) +
                                  '...'
                                : this.stateConfig.name.value,
                    },
                },
            });
            let oldId = this.config.stateFlowConfig.links[id].oldId
                ? this.config.stateFlowConfig.links[id].oldId
                : id;
            this.config.stateFlowConfig.links[id].oldId = oldId;
            this.$emit('change-config-name', {
                id: oldId,
                name: this.stateConfig.name.value,
            });
            this.checkValidateLink();
        },
        formulas() {
            let id = this.currentLink.id;
            this.config.stateFlowConfig.links[id].formulas =
                this.stateConfig.script.value;
        },
        isShowFormWhenDrag(){
            this.config.stateFlowConfig.links[this.currentLink.id].isShowFormWhenDrag = this.isShowFormWhenDrag;           
        }
    },
    computed: {
        stateConfigName() {
            return this.stateConfig.name.value;
        },
        cols() {
            return this.config.columnConfig.cols;
        },
        formulas() {
            return this.stateConfig.script.value;
        },
        isShowFormWhenDrag() {
            return this.stateConfig.checkbox.value;
        },
    },
    data() {
        const self = this;
        return {
            showConfig: false,
            paper: null, //
            paperScroller: null,
            graph: null,
            currentLink: '',
            stencilGraph: null,
            stencilPaper: null,
            stateConfig: {
                name: {
                    title: self.$t('common.name'),
                    type: 'text',
                    value: '',
                    info: '',
                    validateStatus: {
                        isValid: true,
                        message: '',
                    },
                    validate() {
                        this.validateStatus.isValid = true;
                        this.validateStatus.message = '';
                        if (this.value == '') {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message =
                                self.$t('validate.required');
                        }
                        if (this.value.split(' ').length > 1) {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message =
                                self.$t('validate.space');
                        }
                        if (this.value.length >= 100) {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message =
                                self.$t('validate.max_100');
                        }
                        let checkExist = 0;
                        Object.keys(self.config.stateFlowConfig.links).map(
                            (linkId) => {
                                if (
                                    self.config.stateFlowConfig.links[linkId]
                                        .name == this.value
                                ) {
                                    checkExist += 1;
                                    this.validateStatus.isValid = false;
                                    this.validateStatus.message =
                                        self.$t('validate.alreadyName') +
                                        ' state';
                                }
                            },
                        );
                    },
                },
                script: {
                    marginTop: '4px',
                    title: self.$t('common.script'),
                    type: 'script',
                    value: '',
                    info: '',
                    height: '200px',
                },
                checkbox: {
                    title: self.$t('kanban.openFormWhenDrag'),
                    type: 'checkbox',
                    value: '',
                },
            },
        };
    },
    methods: {
        // render canvas:
        renderCanvas() {
            this.renderListColumns();
            this.renderInteractColumns();
            if (this.action != 'view') {
                this.createThirdPage();
            }
        },
        //
        setCanvas(stateConfig) {
            Object.keys(stateConfig.nodes).map((node, nodeIdx) => {
                let newNode = new joint.shapes.standard.Rectangle({
                    position: stateConfig.nodes[node].position,
                    size: stateConfig.nodes[node].size,
                    attrs: stateConfig.nodes[node].attrs,
                    ports: this.getAttrPort(),
                });
                newNode.addTo(this.graph);
                let id = newNode.id;
                let oldNode = stateConfig.nodes[node];
                delete stateConfig.nodes[node];
                stateConfig.nodes[id] = oldNode;
                Object.keys(stateConfig.links).map((link) => {
                    if (stateConfig.links[link].source == node) {
                        stateConfig.links[link].source = id;
                    }
                    if (stateConfig.links[link].target == node) {
                        stateConfig.links[link].target = id;
                    }
                });
            });
            let allState = this.graph.getElements();
            Object.keys(stateConfig.links).map((link, linkId) => {
                let stateSource = allState.filter(
                    (st) => st.id == stateConfig.links[link].source,
                )[0];
                // lấy thử portId của node
                let stateTarget = allState.filter(
                    (st) => st.id == stateConfig.links[link].target,
                )[0];
                const map = {
                    left: 0,
                    top: 1,
                    bottom: 2,
                    right: 3,
                };
                let sourcePort = stateConfig.links[link].sourcePort
                    ? stateConfig.links[link].sourcePort
                    : 'left';
                let sourcePortPosition = map[sourcePort];
                let targetPort = stateConfig.links[link].targetPort
                    ? stateConfig.links[link].targetPort
                    : 'left';
                let targetPortPosition = map[targetPort];
                let newLink = new joint.dia.Link({
                    router: { name: 'manhattan' },
                    connector: { name: 'normal' },
                    markup: [
                        '<path class="connection" stroke="black" d="M 0 0 0 0"/>',
                        '<path class="marker-source" fill="black" stroke="black" d="M 0 0 0 0"/>',
                        '<path class="marker-target" fill="black" stroke="black" d="M 10 0 L 0 5 L 10 10 z"/>',
                        '<g class="labels"/>',
                        '<g class="marker-vertices"/>',
                    ].join(''),
                    source: {
                        id: stateSource.id,
                        port: stateSource.attributes.ports.items[
                            sourcePortPosition
                        ].id,
                    },
                    target: {
                        id: stateTarget.id,
                        port: stateTarget.attributes.ports.items[
                            targetPortPosition
                        ].id,
                    },
                });

                // newLink.source(stateSource)
                // newLink.target(stateTarget)
                newLink.attr(stateConfig.links[link].attributes.attrs);
                newLink.removeLabel(0);
                newLink.appendLabel({
                    attrs: {
                        text: {
                            text:
                                stateConfig.links[link].name.length > 6
                                    ? stateConfig.links[link].name.slice(0, 6) +
                                      '...'
                                    : stateConfig.links[link].name,
                        },
                    },
                });
                newLink.vertices(stateConfig.links[link].router);
                this.graph.addCell(newLink);
                let id = newLink.id;
                let oldNode = stateConfig.links[link];
                delete stateConfig.links[link];
                stateConfig.links[id] = oldNode;
            });
            this.config.stateFlowConfig = {
                links: stateConfig.links,
                nodes: stateConfig.nodes,
            };
            // this.$emit('get-links', this.config.stateFlowConfig.links)
        },
        getAttrPort() {
            let attrPort = {
                portLabel: {
                    fontSize: 11,
                    fill: '#61549c',
                    fontWeight: 800,
                },
                portBody: {
                    magnet: true,
                    r: 5,
                    fill: 'none',
                    strokeWidth: 1,
                },
            };
            const ports = {
                groups: {
                    left: {
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'portBody',
                                attributes: {
                                    r: 4,
                                },
                            },
                        ],
                        position: {
                            name: 'left',
                        },
                        attrs: attrPort,
                    },
                    top: {
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'portBody',
                                attributes: {
                                    r: 4,
                                },
                            },
                        ],
                        position: {
                            name: 'top',
                        },
                        attrs: attrPort,
                        label: {
                            position: {
                                name: 'top',
                                args: {
                                    y: 0,
                                },
                            },
                        },
                    },
                    bottom: {
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'portBody',
                                attributes: {
                                    r: 4,
                                },
                            },
                        ],
                        position: {
                            name: 'bottom',
                        },
                        attrs: attrPort,
                    },
                    right: {
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'portBody',
                                attributes: {
                                    r: 4,
                                },
                            },
                        ],
                        position: {
                            name: 'right',
                        },
                        attrs: attrPort,
                    },
                },
                items: [
                    { group: 'left' },
                    { group: 'top' },
                    { group: 'bottom' },
                    { group: 'right' },
                ],
            };
            return ports;
        },
        addShape(nameShape, colId) {
            let shape = new joint.shapes.standard.Rectangle({
                position: {
                    x: 10,
                    y: 20 + this.cols.length * 36,
                },
                size: {
                    width: 130,
                    height: 28,
                },
                attrs: {
                    text: {
                        text:
                            nameShape.length > 13
                                ? nameShape.slice(0, 13) + '...'
                                : nameShape,
                        'font-size': 13,
                    },
                    colId: colId,
                },
                ports: this.getAttrPort(),
            });
            shape.attr({
                body: {
                    fill: '#F2F2F2',
                    rx: 4,
                    stroke: 'none',
                    strokeWidth: 1,
                    strokeDasharray: '4',
                },
            });
            this.stencilGraph.addCells(shape);
        },
        // render list column
        renderListColumns() {
            const self = this;
            (this.stencilGraph = new joint.dia.Graph()),
                (this.stencilPaper = new joint.dia.Paper({
                    // el: $('#stencil'),
                    height: 60,
                    width: 100,
                    height: 100,
                    model: this.stencilGraph,
                    interactive: false,
                }));
            var paperScroller = new joint.ui.PaperScroller({
                paper: this.stencilPaper,
                cursor: 'grab',
                autoResizePaper: true,
            });
            $(this.$refs.stencil).append(paperScroller.el);
            paperScroller.render();
            let columns = [];
            let allCols = [{ name: 'Tất cả cột' }, ...this.cols];
            allCols.map((col, colIdx) => {
                let shape = new joint.shapes.standard.Rectangle({
                    position: {
                        x: 10,
                        y: 20 + colIdx * 36,
                    },
                    size: {
                        width: 130,
                        height: 28,
                    },
                    attrs: {
                        text: {
                            text:
                                col.name.length > 13
                                    ? col.name.slice(0, 13) + '...'
                                    : col.name,
                            'font-size': 13,
                        },
                        colId: col.id,
                    },
                    ports: this.getAttrPort(),
                });
                shape.attr({
                    body: {
                        fill: colIdx != 0 ? '#F2F2F2' : '#FFE1B2',
                        rx: 4,
                        stroke: 'none',
                        strokeWidth: 1,
                        strokeDasharray: '4',
                    },
                });
                columns.push(shape);
            });
            this.stencilGraph.addCells(columns);
        },
        //rename lại khi cột có sự thay đổi tên
        reRenderNameCanvas() {
            if (this.graph && this.stencilGraph) {
                let allElements = this.graph.getElements();
                let colState = this.stencilGraph.getElements();
                this.cols.map((col, colIdx) => {
                    let ele = allElements.find(
                        (el) => el.attributes.attrs.colId == col.id,
                    );
                    let colInListCols = colState.find(
                        (el) => el.attributes.attrs.colId == col.id,
                    );
                    if (
                        colInListCols.id &&
                        colInListCols.attributes.attrs.text.text != col.name
                    ) {
                        colInListCols.attr(
                            'text/text',
                            col.name.length > 13
                                ? col.name.slice(0, 13) + '...'
                                : col.name,
                        );
                    }
                    if (!ele) {
                        // chưa tồn tại cột
                        colInListCols.attr(
                            'text/text',
                            col.name.length > 13
                                ? col.name.slice(0, 13) + '...'
                                : col.name,
                        );
                    } else if (
                        ele.id &&
                        ele.attributes.attrs.text.text != col.name
                    ) {
                        ele.attr(
                            'text/text',
                            col.name.length > 13
                                ? col.name.slice(0, 13) + '...'
                                : col.name,
                        );
                    }
                });
            }
        },
        addColumnCanvas(colId) {
            this.addShape('', colId);
        },
        deleteColumnCanvas(colId) {
            if (this.graph && this.stencilGraph) {
                let colState = this.stencilGraph.getElements();
                let allElements = this.graph.getElements();
                try {
                    colState
                        .find((col) => col.attributes.attrs.colId == colId)
                        .remove();
                    allElements
                        .find((el) => el.attributes.attrs.colId == colId)
                        .remove();
                } catch (error) {
                    console.log(error);
                }
                colState = this.stencilGraph.getElements();
                this.reArrangeElementListColumns(colState);
                // this.renderListColumns()
            }
        },
        // sắp xếp lại vị trí của các cột
        reArrangeElementListColumns(colState) {
            colState.map((col, colIdx) => {
                let position = {
                    x: 10,
                    y: 20 + colIdx * 36,
                };
                col.position(position.x, position.y);
            });
        },
        /** tạo trang thứ 3 trung gian để copy từ page danh sách cột sang page cấu hình cột
        Khi mousemove di chuyển paper tạo cảm giác kéo, khi mouse up tính toán vị trí, 
        thêm bản copy vào cột 2 và xóa bản cũ **/
        createThirdPage() {
            let self = this;
            this.stencilPaper.on(
                'cell:pointerdown',
                function (cellView, e, x, y) {
                    $('#state-flow-config').append(
                        '<div id="flyPaper" style="position:fixed;z-index:100; background-color:rgba(0, 0, 0, 0);pointer-event:none;"></div>',
                    );
                    let flyGraph = new joint.dia.Graph();
                    let flyPaper = new joint.dia.Paper({
                        el: $('#flyPaper'),
                        model: flyGraph,
                        interactive: false,
                    });
                    let flyShape = cellView.model.clone(); // copy thẻ ổ cột danh sách cột sang page trung gian
                    flyShape.attr({
                        body: {
                            rx: 4,
                            strokeWidth: 1,
                            strokeDasharray: '4',
                        },
                    });
                    let pos = cellView.model.position();
                    let offset = {
                        x: x - pos.x,
                        y: y - pos.y,
                    };
                    flyShape.position(0, 0);
                    flyGraph.addCell(flyShape);
                    $('#flyPaper').offset({
                        left: e.pageX - offset.x,
                        top: e.pageY - offset.y,
                    });
                    $('#state-flow-config').on('mousemove.fly', function (e) {
                        // di chuyển
                        $('#flyPaper').offset({
                            left: e.pageX - offset.x,
                            top: e.pageY - offset.y,
                        });
                    });
                    $('#state-flow-config').on('mouseup.fly', function (e1) {
                        // tính toán vị trí khi mouse up để thêm bản copy vào cột cấu hình và xóa bản cũ
                        self.graph.getElements().map((ele) => {
                            ele.attr('body/stroke', 'none');
                        });
                        let x = e1.pageX;
                        let y = e1.pageY;
                        let target = self.paper.$el.offset();
                        // Dropped over paper ?
                        if (
                            x > target.left &&
                            x < target.left + self.paper.$el.width() &&
                            y > target.top &&
                            y < target.top + self.paper.$el.height()
                        ) {
                            let s = flyShape.clone();
                            //  magnet: false
                            s.attr('text/magnet', false);
                            s.position(
                                x - target.left - offset.x,
                                y - target.top - offset.y,
                            );
                            let checkExist = false; // trường hợp đã tồn tại column
                            self.graph.getElements().map((ele) => {
                                if (
                                    ele.attributes.attrs.text.text ==
                                    s.attributes.attrs.text.text
                                ) {
                                    checkExist = true;
                                }
                            });

                            if (!checkExist) {
                                self.config.stateFlowConfig.nodes[s.id] =
                                    s.attributes;
                                self.graph.addCell(s);
                            } else {
                                self.$snotifyError(
                                    '',
                                    self.$t('v2.kanban.cannotAddColumn'),
                                );
                                let existElement = self.graph
                                    .getElements()
                                    .find(
                                        (el) =>
                                            el.attributes.attrs.text.text ==
                                            s.attributes.attrs.text.text,
                                    );
                                existElement.attr('body/stroke', 'red');
                                existElement.attr('body/strokeWidth', '0.5');
                            }
                        }
                        $('#state-flow-config')
                            .off('mousemove.fly')
                            .off('mouseup.fly');
                        flyShape.remove();
                        $('#flyPaper').remove();
                    });
                },
            );
        },
        //render phần kéo thả để cấu hình các column
        renderInteractColumns() {
            const self = this;
            this.graph = new joint.dia.Graph();
            this.paper = new joint.dia.Paper({
                el: $('#paper'),
                restrictTranslate: true,
                width: '100%',
                height: '420px',
                interactive: self.action != 'view',
                model: this.graph,
                linkPinning: false,
                gridSize: 10,
                drawGrid: true,
                magnetThreshold: 'onleave',
                moveThreshold: 5,
                clickThreshold: 5,
                linkPinning: false,
                sorting: joint.dia.Paper.sorting.APPROX,
                markAvailable: true,
                snapLinks: { radius: 40 },
                defaultConnectionPoint: { name: 'anchor' },
                defaultConnector: {
                    name: 'jumpover',
                    args: { jump: 'cubic' },
                },
                highlighting: {
                    magnetAvailability: {
                        name: 'addClass',
                        options: {
                            className: 'record-item-available',
                        },
                    },
                    connecting: {
                        name: 'stroke',
                        options: {
                            padding: 8,
                            attrs: {
                                stroke: 'none',
                                fill: '#7c68fc',
                                'fill-opacity': 0.2,
                            },
                        },
                    },
                },
                validateConnection: function (
                    cellViewS,
                    magnetS,
                    cellViewT,
                    magnetT,
                    end,
                    linkView,
                ) {
                    let check =
                        magnetT && magnetT.getAttribute('port-group')
                            ? true
                            : false;
                    return check;
                },
                defaultLink: new joint.dia.Link({
                    router: { name: 'manhattan' },
                    connector: { name: 'normal' },
                    markup: [
                        '<path class="connection" stroke="black" d="M 0 0 0 0"/>',
                        '<path class="marker-source" fill="black" stroke="black" d="M 0 0 0 0"/>',
                        '<path class="marker-target" fill="black" stroke="black" d="M 10 0 L 0 5 L 10 10 z"/>',
                        '<g class="labels"/>',
                        '<g class="marker-vertices"/>',
                    ].join(''),
                }),
                async: true,
                sorting: joint.dia.Paper.sorting.APPROX,
            });
            this.handleEventInPaper();
            if (this.action != 'view') {
                this.handleEventInGraph();
            }
        },
        // xử lý tất cả các action của grap
        handleEventInGraph() {
            const self = this;
            this.graph.on('change:source change:target', function (link) {
                if (link.get('source').id && link.get('target').id) {
                    let source = link.get('source');
                    let sourcePort = source.port;
                    let target = link.get('target');
                    let targetPort = target.port;
                    let allState = self.graph.getElements();
                    let positionSource = 'left';
                    let positionTarget = 'left';
                    allState.map((node) => {
                        if (node.attributes.id == source.id) {
                            positionSource = node.attributes.ports.items.filter(
                                (n) => n.id == sourcePort,
                            )[0].group;
                        }
                        if (node.attributes.id == target.id) {
                            positionTarget = node.attributes.ports.items.filter(
                                (n) => n.id == targetPort,
                            )[0].group;
                        }
                    });
                    // find position port
                    if (!self.config.stateFlowConfig.links[link.id]) {
                        self.config.stateFlowConfig.links[link.id] = {
                            formulas: '',
                            name: '',
                            source: source.id,
                            sourcePort: positionSource,
                            targetPort: positionTarget,
                            target: target.id,
                            attributes: link.attributes,
                            isShowFormWhenDrag: false
                        };
                    } else {
                        self.config.stateFlowConfig.links[link.id].source =
                            source.id;
                        self.config.stateFlowConfig.links[link.id].sourcePort =
                            positionSource;
                        self.config.stateFlowConfig.links[link.id].target =
                            target.id;
                        self.config.stateFlowConfig.links[link.id].targetPort =
                            positionTarget;
                    }
                    if (link.get('source').id != link.get('target').id) {
                        self.checkValidateLink();
                    }
                }
            });
            this.graph.on('remove', function (cell, collection, opt) {
                let id = cell.id;
                if (cell.isLink()) {
                    try {
                        let oldId = self.config.stateFlowConfig.links[id].oldId
                            ? self.config.stateFlowConfig.links[id].oldId
                            : id;
                        self.$emit('delete-link', oldId);
                        delete self.config.stateFlowConfig.links[id];
                        self.showConfig = false;
                        self.checkValidateLink();
                    } catch (error) {}
                }
                if (cell.isElement()) {
                    delete self.config.stateFlowConfig.nodes[id];
                }
            });
        },
        setAttrForElement(elementView, attr) {
            elementView.model.attr(attr);
        },
        setColorForPort(elementView, color) {
            let ports = elementView.model.attributes.ports.items;
            ports.map((port) => {
                let portId = port.id;
                elementView.model.portProp(
                    portId,
                    'attrs/portBody/fill',
                    color,
                );
            });
        },
        // xử lý tất cả các action của paper
        handleEventInPaper() {
            const self = this;
            this.paper.on('link:mouseenter', function (linkView) {
                var removeButton = new joint.linkTools.Remove({
                    distance: '30%',
                });
                joint.linkTools.InfoButton = joint.linkTools.Button.extend({
                    name: 'info-button',
                    options: {
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'button',
                                attributes: {
                                    r: 7,
                                    fill: '#001DFF',
                                    cursor: 'pointer',
                                },
                            },
                            {
                                tagName: 'path',
                                selector: 'icon',
                                attributes: {
                                    d: 'M -2 4 2 4 M 0 3 0 0 M -2 -1 1 -1 M -1 -4 1 -4',
                                    fill: 'none',
                                    stroke: '#FFFFFF',
                                    'stroke-width': 2,
                                    'pointer-events': 'none',
                                },
                            },
                        ],
                        distance: '80%',
                        offset: 0,
                        action: function (cellView) {
                            self.currentLink = this.model;
                            self.showConfig = true;
                            if (
                                self.config.stateFlowConfig.links[this.model.id]
                            ) {
                                if (
                                    !self.config.stateFlowConfig.links[
                                        this.model.id
                                    ].name
                                ) {
                                    self.stateConfig.name.value = '';
                                } else {
                                    self.stateConfig.name.value =
                                        self.config.stateFlowConfig.links[
                                            this.model.id
                                        ].name;
                                }
                                if (
                                    !self.config.stateFlowConfig.links[
                                        this.model.id
                                    ].formulas
                                ) {
                                    self.stateConfig.script.value = '';
                                } else {
                                    self.stateConfig.script.value =
                                        self.config.stateFlowConfig.links[
                                            this.model.id
                                        ].formulas;
                                }
                                self.stateConfig.checkbox.value =
                                        self.config.stateFlowConfig.links[
                                            this.model.id
                                        ].isShowFormWhenDrag;
                                self.config.stateFlowConfig;
                                // this.checkValidateLink()
                            }
                        },
                    },
                });
                var infoButton = new joint.linkTools.InfoButton();
                var verticesTool = new joint.linkTools.Vertices({
                    vertexAdd: false,
                });
                var segmentsTool = new joint.linkTools.Segments();
                if (self.action != 'view') {
                    var toolsView = new joint.dia.ToolsView({
                        tools: [
                            verticesTool,
                            segmentsTool,
                            infoButton,
                            removeButton,
                        ],
                    });
                } else {
                    var toolsView = new joint.dia.ToolsView({
                        tools: [infoButton],
                    });
                }
                linkView.addTools(toolsView);
                linkView.showTools();
                self.config.stateFlowConfig.links[linkView.model.id].router =
                    linkView.model.attributes.vertices;
            });
            this.paper.on('link:mouseleave', function (linkView) {
                linkView.removeTools();
                linkView.model.attr('line/stroke', 'black');
                linkView.model.attr('connection/stroke', 'black');
            });
            if (this.action != 'view') {
                this.paper.on('element:mouseenter', (elementView) => {
                    let elementAttr = {
                        body: {
                            rx: 4,
                            stroke: 'grey',
                            strokeWidth: 1,
                            strokeDasharray: 4,
                        },
                    };
                    self.setAttrForElement(elementView, elementAttr);
                    self.setColorForPort(elementView, '#C4C4C4');
                });
                this.paper.on('element:mouseleave', (elementView) => {
                    elementView.removeTools();
                    let elementAttr = {
                        body: {
                            rx: 0,
                            stroke: 'none',
                            strokeWidth: 0,
                            strokeDasharray: 'none',
                        },
                    };
                    self.setAttrForElement(elementView, elementAttr);
                    self.setColorForPort(elementView, 'none');
                    //   self.unHightLight(elementView)
                });
                this.paper.on('cell:pointerdown', (cellView, evt) => {
                    if (cellView.model.isElement()) {
                        cellView.addTools(
                            new joint.dia.ToolsView({
                                tools: [
                                    new joint.elementTools.Remove({
                                        useModelGeometry: true,
                                        y: '0%',
                                        x: '100%',
                                    }),
                                ],
                            }),
                        );
                        self.config.stateFlowConfig.nodes[cellView.model.id] =
                            cellView.model.attributes;
                    }
                });
            }
        },
        checkValidateLink() {
            this.$emit('show-error', '');
            Object.keys(this.config.stateFlowConfig.links).map((linkId) => {
                if (this.config.stateFlowConfig.links[linkId].name == '') {
                    this.$emit(
                        'show-error',
                        this.$t('kanban.error.notEmtyNameStateFlow'),
                    );
                }
                if (
                    this.config.stateFlowConfig.links[linkId].name.length > 100
                ) {
                    this.$emit('show-error', this.$t('v2.kanban.nameExceedsAllowedCharacters'));
                }
            });
        },
        hightLight(link) {
            // link.attr('line/stroke', DISPLAY_CONFIGS.highlightWidBordergetColor);
            // link.attr('line/strokeWidth', DISPLAY_CONFIGS.hightlightWidth);
            link.attr('line/stroke', 'orange');
            link.attr('connection/stroke', 'orange');
        },
        unHightLight(link) {
            let test = $('.connection');
            test.css('stroke', 'black');
        },
    },
};
</script>
<style scoped>
.wrap-state-flow-config {
    height: calc(100% - 50px);
}
.config__content--sidebar {
    width: 300px;
    border-left: var(--symper-border);
}
.wrap-state-flow-config__content {
    display: flex;
    border: var(--symper-border);
    height: calc(100% - 80px);
}
.wrap-state-flow-config__header {
    display: flex;
    background: #fafafa;
    height: 50px;
    padding: 4px;
    position: relative;
}
.wrap-state-flow-config__header button,
.wrap-state-flow-config__header >>> .v-label {
    font-weight: 400;
    font-size: 13px;
}
.checkbox-show-all-label {
    margin: 0;
    margin-top: 2px;
}
.card-add-status {
    position: absolute;
    display: flex;
    background: #fafafa;
    height: 160px;
    width: 300px;
    padding: 12px;
    left: 10px;
    top: 40px;
    background: white;
}
#paper >>> .joint-paper-background {
    /* background: #FFED0A; */
    border: 1px solid lightgrey !important;
    border-radius: 4px;
}
#paper >>> .joint-paper {
    height: 350px !important;
}
#stencil {
    /* overflow:scroll */
}
#stencil >>> .paper-scroller-background {
    max-height: 400px !important;
}
.state-config {
    border: 1px solid lightgrey !important;
    border-radius: 4px;
    height: 412px;
}
.html-element {
    border-radius: 4px;
}
.marker-vertices {
    display: none !important;
}
.link-tools .tool-options {
    display: none !important;
}
#stencil >>> .joint-paper {
    top: 0px !important;
}
#stencil >>> .joint-paper-scroller {
    overflow-x: hidden;
    height: 410px !important;
}
#stencil >>> .joint-paper-scroller {
    height: unset !important;
}
</style>

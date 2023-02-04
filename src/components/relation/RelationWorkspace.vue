<template>
    <div style="position:relative">
        <div :style="{
            'height':height,
            'width':width
        }">
        
            <Preloader ref="preLoaderView" v-if="(isLoad&&action!='create')"/>
        </div>
        <JointPaperDataMapping
        :background="background"
        :gridSize="gridSize"
        :draw-grid="drawGrid"
        @init="setupGraph"
        ref="jointPaper"
        :width="width"
        :height="height"
    />
    </div>
    
    
</template>

<script>
import JointPaperDataMapping from '@/components/common/rappid/JointPaperDataMapping';
import Preloader from '@/components/common/Preloader.vue';
let relaventIcon = {
    number: 'image/relations/number.svg',
    text: 'image/relations/text.svg',
    time: 'image/relations/time.svg',
    date: 'image/relations/date.svg',
    datetime: 'image/relations/datetime.svg',
    table: 'image/relations/table.svg'
};
export default {
    props: {
        action: {
            type: String,
            default: 'edit'
        },
        wrapper: {
            type: Object,
            default() {
                return {
                    height: '300px',
                    width: '500px'
                };
            }
        },
        width: {
            type: Number,
            default: 800
        },
        height: {
            type: Number,
            default: 600
        }
    },
    components: {
        JointPaperDataMapping,
        Preloader
    },
    data() {
        return {
            paper: null,
            graph: null,
            paperScroller: null,
            background: {
                color: '#F3F2F1'
            },
            gridSize: 10,
            drawGrid: {
                name: 'mesh'
            },
            datasets: {},
            isLoad:true,
        };
    },
    methods: {
        
        setupGraph(graph, paper, paperScroller) {
            this.graph = graph;
            this.paper = paper;
            this.paperScroller = paperScroller;
            this.listenPaperEvent();
            
        },
        handleHeaderAction(action) {
            this.$refs.jointPaper.actionOnToolbar(action);
        },
        showElementTools(elementView) {
            var element = elementView.model;
            var transform = new joint.ui.FreeTransform({
                cellView: elementView,
                allowRotation: false
            });
            transform.render();
            transform.listenTo(element, 'change', updateMinSize);
            updateMinSize();

            function updateMinSize() {
                var minSize = element.getMinimalSize();
                transform.options.minHeight = minSize.height;
                transform.options.minWidth = minSize.width;
            }
        },
        removeRelateColumn(linkView) {
            let linkAttr = linkView.model.attributes;
            let sourceId = linkAttr.source.port;
            let targetId = linkAttr.target.port;
            $('.record-item-body[item-id=' + sourceId + ']').css(
                'fill',
                '#00000000'
            );
            $('.record-item-body[item-id=' + targetId + ']').css(
                'fill',
                '#00000000'
            );
        },
        showRelateColumn(linkView) {
            let linkAttr = linkView.model.attributes;
            let sourceId = linkAttr.source.port;
            let targetId = linkAttr.target.port;

            $('.record-item-body[item-id=' + sourceId + ']').css(
                'fill',
                '#ffbc58'
            );
            $('.record-item-body[item-id=' + targetId + ']').css(
                'fill',
                '#ffbc58'
            );
        },
        itemEditAction(element, itemId) {
            var config = element.getInspectorConfig(itemId);
            if (!config) return;

            var inspector = new joint.ui.Inspector({
                cell: element,
                live: false,
                inputs: joint.util.setByPath(
                    {},
                    element.getItemPathArray(itemId),
                    config
                )
            });

            inspector.render();
            inspector.el.style.position = 'relative';
            inspector.el.style.overflow = 'hidden';

            var dialog = new joint.ui.Dialog({
                width: 300,
                title: this.$t('v2.relation.editItem'),
                closeButton: false,
                content: inspector.el,
                buttons: [
                    {
                        content: 'Cancel',
                        action: 'cancel'
                    },
                    {
                        content: '<span style="color:#fe854f">Change</span>',
                        action: 'change'
                    }
                ]
            });

            dialog.open();
            dialog.on({
                'action:cancel': function () {
                    inspector.remove();
                    dialog.close();
                },
                'action:change': function () {
                    inspector.updateCell();
                    inspector.remove();
                    dialog.close();
                }
            });

            var input = inspector.el.querySelector('[contenteditable]');
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(input);
            selection.removeAllRanges();
            selection.addRange(range);
        },
        itemActionPicker(target, elementView, itemId, tools) {
            var element = elementView.model;
            var toolbar = new joint.ui.ContextToolbar({
                target: target,
                padding: 5,
                vertical: true,
                tools: tools
            });

            toolbar.render();
            toolbar.on({
                'action:remove': function () {
                    element.removeItem(itemId);
                    element.removeInvalidLinks();
                    toolbar.remove();
                },
                'action:edit': function () {
                    toolbar.remove();
                    itemEditAction(element, itemId);
                },
                'action:add-child': function () {
                    toolbar.remove();
                    element.addItemAtIndex(
                        itemId,
                        Infinity,
                        element.getDefaultItem()
                    );
                    if (element.isItemCollapsed(itemId))
                        element.toggleItemCollapse(itemId);
                }
                // 'action:add-next-sibling': function () {
                //     toolbar.remove();
                //     element.addNextSibling(itemId, element.getDefaultItem());
                // },
                // 'action:add-prev-sibling': function () {
                //     toolbar.remove();
                //     element.addPrevSibling(itemId, element.getDefaultItem());
                // }
            });
        },
        changeLinkType(evt, linkView, buttonView) {
            let pos = buttonView.options.pos;
            let postToIdx = {
                target: 1,
                source: 0
            };
            let revertType = {
                o: 'n',
                m: 1
            };
            let linkTypeRevert = {
                1: 'o',
                n: 'm'
            };
            console.log(pos, postToIdx[pos], linkView, buttonView);
            let linkAttr = linkView.model.attributes;
            let currType = linkAttr.symperLinkType[postToIdx[pos]];
            linkView.model.label(postToIdx[pos], {
                attrs: {
                    text: {
                        text: revertType[currType]
                    }
                }
            });
            let lbs = linkView.model.labels();
            linkAttr.symperLinkType =
                linkTypeRevert[lbs[0].attrs.text.text] +
                linkTypeRevert[lbs[1].attrs.text.text];
        },
        showLinkTools(linkView) {
            let self = this;
            var tools = new joint.dia.ToolsView({
                tools: [
                    new joint.linkTools.mapping.SourceArrowhead(),
                    new joint.linkTools.mapping.TargetArrowhead(),
                    new joint.linkTools.mapping.Label2({
                        distance: '15%',
                        pos: 'source',
                        action: function (evt, linkView, buttonView) {
                            self.changeLinkType(evt, linkView, buttonView);
                        }
                    }),
                    new joint.linkTools.mapping.Label1({
                        distance: '85%',
                        pos: 'target',
                        action: function (evt, linkView, buttonView) {
                            self.changeLinkType(evt, linkView, buttonView);
                        }
                    }),
                    new joint.linkTools.mapping.Remove({
                        distance: '50%',
                        action: function () {
                            self.linkAction(this.model);
                        }
                    })
                ]
            });
            linkView.addTools(tools);
        },

        linkAction(link) {
            link.remove();
            this.reduceLinks();
        },
        reduceLinks() {
            this.$emit('reduce-links');
        },
        listenPaperEvent() {
            let self = this;
            let paper = this.$refs.jointPaper.paper;
            let graph = this.$refs.jointPaper.graph;
            paper.on('blank:pointerdown', this.paperScroller.startPanning);

            paper.on('link:mouseenter', function (linkView) {
                this.removeTools();
                self.showLinkTools(linkView);
                self.showRelateColumn(linkView);
            });

            paper.on('link:mouseleave', function (linkView) {
                this.removeTools();
                self.removeRelateColumn(linkView);
                self.reduceLinks();
            });

            paper.on(
                'element:magnet:pointerdblclick',
                function (elementView, evt, magnet) {
                    evt.stopPropagation();
                    self.itemEditAction(
                        elementView.model,
                        elementView.findAttribute('item-id', magnet)
                    );
                }
            );

            paper.on(
                'element:magnet:contextmenu',
                function (elementView, evt, magnet) {
                    var itemId = elementView.findAttribute('item-id', magnet);
                    var tools = elementView.model.getItemTools(itemId);
                    if (tools) {
                        evt.stopPropagation();
                        this.itemActionPicker(
                            magnet,
                            elementView,
                            elementView.findAttribute('item-id', magnet),
                            tools
                        );
                    }
                }
            );

            paper.on('element:pointerclick', function (elementView) {
                self.showElementTools(elementView);
            });

            paper.on('element:pointermove', function (view, evt, x, y) {
                self.showElementTools(view);
                var data = evt.data;
                if (data.ghost) {
                    data.ghost.attr({
                        x: x - data.dx,
                        y: y - data.dy
                    });
                } else {
                    var bbox = view.model.getBBox();
                    var ghost = joint.V('rect');
                    ghost.attr(bbox);
                    ghost.attr({
                        fill: 'transparent',
                        stroke: '#5755a1',
                        'stroke-dasharray': '4,4',
                        'stroke-width': 2
                    });
                    ghost.appendTo(this.viewport);
                    evt.data.ghost = ghost;
                    evt.data.dx = x - bbox.x;
                    evt.data.dy = y - bbox.y;
                }
            });

            paper.on('element:pointerup', function (view, evt, x, y) {
                var data = evt.data;
                if (data.ghost) {
                    data.ghost.remove();
                    view.model.position(x - data.dx, y - data.dy);
                }
            });
        },
        scrollPaperToTop(time = 1000) {
            setTimeout(
                (self) => {
                    let viewPort = $(self.$refs.jointPaper.$el).find(
                        '.symper-relation-paper>.joint-paper-scroller'
                    );
                    let view = $(self.$refs.jointPaper.$el).find(
                        '.symper-relation-paper>.joint-paper-scroller>.paper-scroller-background>.joint-paper'
                    );
                    $(viewPort).scrollTop($(view).position().top);
                },
                time,
                this
            );
        },

        addDataset(datasetData, items = [], pos = {}) {
            let dataset = new joint.shapes.mapping.Record({
                items: [items],
                id: datasetData.id,
                icon: datasetData.type ? relaventIcon[datasetData.type] : '',
                symperDatasetConfigs: {
                    id: datasetData.id,
                    label: datasetData.label
                        ? datasetData.label
                        : datasetData.tableName,
                    icon: datasetData.type ? relaventIcon[datasetData.type] : ''
                }
            });
            pos.x = pos.x ? pos.x : 50;
            pos.y = pos.y ? pos.y : 130;
            dataset.position(pos.x, pos.y);
            dataset.setName(
                datasetData.label ? datasetData.label : datasetData.aliasName
            );
            dataset.addTo(this.graph);
            this.datasets[datasetData.id] = {
                label: datasetData.label
                    ? datasetData.label
                    : datasetData.aliasName,
                obj: dataset
            };
        },
        removeDataset(datasetData) {
            if (this.datasets[datasetData.id]) {
                this.datasets[datasetData.id].obj.remove();
            }
        },
        searchColumns(vl) {
            if (vl) {
                let items = $('.record-item-body');
                $('.record-item-label').each((index, ele) => {
                    if ($(ele).text().toLowerCase().includes(vl)) {
                        $(items[index]).css('fill', '#ffbc58');
                    } else {
                        $(items[index]).css('fill', '#00000000');
                    }
                });
            } else {
                $('.record-item-body').css('fill', '#00000000');
            }
        },
        getLabelToLink(pos = 'source', type) {
            let linkType = {
                o: 1,
                m: 'n'
            };
            let distance = {
                source: 0.15,
                target: 0.85
            };
            return {
                attrs: {
                    text: {
                        text: linkType[type]
                    }
                },
                position: {
                    distance: distance[pos]
                }
            };
        },
        updateDatasetColumns(datasetColumns) {
            for (let idDts in datasetColumns) {
                let dts = this.datasets[idDts];
                if (!dts) {
                    continue;
                }
                let dtsLabel = dts.label;
                let dtsPos = dts.obj.position();
                this.removeDataset({ id: idDts });
                setTimeout(
                    (self) => {
                        self.addDataset(
                            {
                                id: idDts,
                                label: dtsLabel
                            },
                            datasetColumns[idDts],
                            dtsPos
                        );
                    },
                    100,
                    this
                );
            }
        },
        addLink(slink) {
            if(slink.source.id && slink.target.id){
                let link = new joint.shapes.mapping.Link(slink);
                link.label(
                    0,
                    this.getLabelToLink('source', slink.symperLinkType[0])
                );
                link.label(
                    1,
                    this.getLabelToLink('target', slink.symperLinkType[1])
                );
                link.addTo(this.graph);
            }
        },
        loadRelations(datasets, items, links) {
            this.graph.getCells().map((ele) => {
                ele.remove();
            });
            for (let dataset of datasets) {
                let dts = dataset.dataset;
                this.addDataset(dts, items[dts.id], dataset.position);
            }
            for (let slink of links) {
                this.addLink(slink);
            }
            this.reduceLinks();
            setTimeout(
                (self) => {
                    self.handleHeaderAction('zoomToFit');
                    self.isLoad = false;
                },
                1000,
                this
            );
        },
        getWorkspaceInfo() {
            let childs = this.graph.getCells();
            let dataLink = [];
            let dtss = [];
            for (let c of childs) {
                if (c.attributes.type == 'mapping.Link') {
                    dataLink.push({
                        from: c.attributes.source.port,
                        to: c.attributes.target.port,
                        type: c.attributes.symperLinkType,
                        uid: c.attributes.id
                    });
                } else {
                    dtss.push({
                        position: c.attributes.position,
                        dataset: c.attributes.symperDatasetConfigs
                    });
                }
            }

            return {
                links: dataLink,
                dtss: dtss
            };
        },
        getAllLinks() {
            return this.graph.getCells().filter((ele) => {
                return ele.attributes.type.includes('Link');
            });
        }
    }
};
</script>

<style>
.record-item-icon {
    width: 13px;
    height: 13px;
    margin-right: 2px;
}
</style>

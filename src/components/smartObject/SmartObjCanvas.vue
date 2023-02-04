<template>
    <JointPaperSmartObj
        :background="background"
        :gridSize="gridSize"
        :draw-grid="drawGrid"
        @init="setupGraph"
        ref="jointPaper"
        :width="width"
        :height="height"
        :isRender="isRender"
        :isCenter="isCenter"
        :action="action"
    />
</template>

<script>
import JointPaperSmartObj from '@/components/common/rappid/JointPaperSmartObj';

let relaventIcon = {
    number: 'image/smartobject/number.svg',
    text: 'image/smartobject/text.svg',
    time: 'image/smartobject/time.svg',
    date: 'image/smartobject/date.svg',
    datetime: 'image/smartobject/datetime.svg',
    table: 'image/smartobject/table.svg'
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
        JointPaperSmartObj
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
            selectEl: null,
            selectLink: null,
            oldColTargetId: null,
            oldObjTargetId: null,
            oldColSourceId: null,
            oldObjSourceId: null,
            objsDataAllColl: {},
            linksArr: [],
            nearNodeArr:[],
            linksForChange: [],
            pointerUp: false,
            dataChange: {},
            viewMode: false,
            isRender: false,
            isCenter: false
        };
    },
    methods: {
        getCell(id) {
            return this.graph.getCell(id);
        },
        getAllLinks() {
            return this.graph.getLinks();
        },
        getAllNodes() {
            return this.graph.getCells();
        },
        clearAll() {
            this.graph.clear();
        },
        setupGraph(graph, paper, paperScroller) {
            let self = this;
            this.graph = graph;
            this.paper = paper;
            this.paperScroller = paperScroller;
            this.listenPaperEvent();
            setTimeout(
                (self) => {
                    self.handleHeaderAction('zoomToFit');
                },
                3000,
                this
            );
        },
        handleHeaderAction(action) {
            let self = this;
            this.$refs.jointPaper.actionOnToolbar(action);

            self.isCenter = true;
        },
        showElementTools(elementView) {
            var element = elementView.model;
            var transform = new joint.ui.FreeTransform({
                cellView: elementView,
                allowRotation: false
            });
            transform.render();
        },
        removeRelateColumn(linkView) {
            let linkAttr = linkView.model.attributes;
            let sourceId = linkAttr.source.port;
            let targetId = linkAttr.target.port;
            $('.record-item-body[item-id=' + sourceId + ']').css({
                stroke: '#00000000',
                'stroke-dasharray': '0,0'
            });

            $('.record-item-body[item-id=' + targetId + ']').css({
                stroke: '#00000000',
                'stroke-dasharray': '0,0'
            });
        },
        showRelateColumn(linkView) {
            let linkAttr = linkView.model.attributes;
            let sourceId = linkAttr.source.port;
            let targetId = linkAttr.target.port;

            $('.record-item-body[item-id=' + sourceId + ']').css({
                stroke: '#1976D2',
                'stroke-dasharray': '5,5'
            });
            $('.record-item-body[item-id=' + targetId + ']').css({
                stroke: '#1976D2',
                'stroke-dasharray': '5,5'
            });
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
                title: 'Edit Item',
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
        disableCanvas() {
            let self = this;
            let paper = this.$refs.jointPaper.paper;
            let graph = this.$refs.jointPaper.graph;
            self.viewMode = true;
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
                },
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

        showLinkTools(linkView) {
            let self = this;
            var tools;
            if (self.viewMode) {
                tools = new joint.dia.ToolsView({
                    tools: [
                        new joint.linkTools.mapping.SourceArrowhead(),
                        new joint.linkTools.mapping.TargetArrowhead()
                    ]
                });
            } else {
                tools = new joint.dia.ToolsView({
                    tools: [
                        new joint.linkTools.mapping.SourceArrowhead(),
                        new joint.linkTools.mapping.TargetArrowhead(),

                        new joint.linkTools.mapping.Remove({
                            distance: '50%',
                            action: function () {
                                self.linkAction(this.model);
                            }
                        })
                    ]
                });
            }
            linkView.addTools(tools);
        },

        linkAction(link) {
            link.remove();
            this.reduceLinks();
        },
        reduceLinks() {
            this.$emit('reduce-links');
        },
        emitAddObj(objData) {
            this.$emit('add-object', objData);
        },
        hightLightLink(linksId) {
            let self = this;
            let paper = this.$refs.jointPaper.paper;
            linksId.forEach((e) => {
                let linkEl = self.getCell(e).findView(paper).el;
                let linkAtrs = self.getCell(e);
                self.showLinkTools(self.getCell(e).findView(paper));

                self.addClassHightLight(
                    self.getCell(linkAtrs.attributes.source.id).findView(paper)
                        .el
                );
                self.addClassHightLight(
                    self.getCell(linkAtrs.attributes.target.id).findView(paper)
                        .el
                );
                self.showRelateColumn(self.getCell(e).findView(paper));
                
            });
        },
        addClassHightLight(element,isLink=false,linkView=null) {
            let self = this;
            if(!isLink){
                element.childNodes[0].classList.add('hight-light');
                element.childNodes[4].classList.add('hight-light');
            }
            else{
                element.childNodes[1].classList.add('hight-light')
                if(linkView){
                    self.showLinkTools(linkView);
                }
                
            }
        },
        addClassHightLightNear(element,isLink=false) {
            if(!isLink){
                element.childNodes[0].classList.add('hight-light-near');
                element.childNodes[4].classList.add('hight-light-near');
            }else{
                element.childNodes[1].classList.add('hight-light-link-near');
                
            }
        },
        removeClassHightLightNear(element,isLink=false) {
            if(!isLink){
                if (element.childNodes[0].classList.contains('hight-light-near')) {
                    element.childNodes[0].classList.remove('hight-light-near');
                }
                if (element.childNodes[4].classList.contains('hight-light-near')) {
                    element.childNodes[4].classList.remove('hight-light-near');
                }
            }else{
                if ( element.childNodes[1].classList.contains('hight-light-link-near')) {
                    element.childNodes[1].classList.remove('hight-light-link-near');
                }
            }
            
        },
        removeClassHightLight(element,isLink=false) {
            if(!isLink){
                if (element.childNodes[0].classList.contains('hight-light')) {
                    element.childNodes[0].classList.remove('hight-light');
                }
                if (element.childNodes[4].classList.contains('hight-light')) {
                    element.childNodes[4].classList.remove('hight-light');
                }
            }
            else{
                
                if (element.childNodes[1].classList.contains('hight-light')) {
                    element.childNodes[1].classList.remove('hight-light');
                }
            }
        },
        focus() {
            this.handleHeaderAction('zoomToFit');
        },
        zoomIn() {
            this.paperScroller.zoom(-0.2, { min: 0.2 });
        },
        zoomOut() {
            this.paperScroller.zoom(0.2, { max: 4 });
        },

        zoom(x, y, delta) {
            this.paperScroller.zoom(delta * 0.2, {
                min: 0.2,
                max: 4,
                grid: 0.2,
                ox: x,
                oy: y
            });
        },
        getNearNode(nodeId){
            let paper = this.$refs.jointPaper.paper;
            let self = this;
            let linkInfo=self.getAllLinks()
            console.log(nodeId)
            linkInfo.forEach(link=>{
                console.log(link.attributes)
                if(link.attributes.source.id==nodeId){
                    self.nearNodeArr.push(link.attributes.target.id) 
                    self.addClassHightLightNear(self.getCell(link.attributes.id).findView(paper)
                        .el,true)
                }
                if(link.attributes.target.id==nodeId){
                    self.nearNodeArr.push(link.attributes.source.id)
                    self.addClassHightLightNear(self.getCell(link.attributes.id).findView(paper)
                        .el,true)
                }
            })
            self.nearNodeArr=[... new Set(self.nearNodeArr)]
            self.nearNodeArr.forEach((e) => {
                self.addClassHightLightNear(self.getCell(e).findView(paper)
                        .el)
            })
        },
        listenPaperEvent() {
            let self = this;
            let paper = this.$refs.jointPaper.paper;
            let graph = this.$refs.jointPaper.graph;

            paper.on('blank:pointerdown', this.paperScroller.startPanning);
            paper.on('blank:pointerclick', (cellView, evt, x, y) => {
                
                // if (self.linksArr.length > 3) {
                //     self.hightLightLink(self.linksArr);
                // }
                if(self.nearNodeArr.length>0){
                    self.getAllLinks().forEach(link=>{
                        self.removeClassHightLightNear(
                        self
                            .getCell(link.attributes.id)
                            .findView(paper).el,true
                    );
                    })
                    self.nearNodeArr.forEach(e=>{
                        self.removeClassHightLightNear(
                        self
                            .getCell(e)
                            .findView(paper).el
                    );
                    })
                    
                }
                if (self.selectLink) {
                    self.selectLink.toBack()
                    self.removeClassHightLight(
                        self
                            .getCell(self.selectLink.attributes.id)
                            .findView(paper).el,true
                    );
                    self.removeClassHightLight(
                        self
                            .getCell(self.selectLink.attributes.source.id)
                            .findView(paper).el
                    );
                    self.removeClassHightLight(
                        self
                            .getCell(self.selectLink.attributes.target.id)
                            .findView(paper).el
                    );
                    self.removeRelateColumn(
                        paper.findViewByModel(self.selectLink)
                    );
                    paper.findViewByModel(self.selectLink).removeTools();
                }
                self.selectLink = null;
            });
            paper.on('cell:pointerclick', function (cellView) {
                let cell = self.getCell(cellView.model.id);
                if (!cell.isElement()) {
                    if (self.selectLink) {
                        self.selectLink.toBack()
                        self.removeClassHightLight(
                            self.getCell(self.selectLink.attributes.id).findView(paper)
                                .el,true
                        );
                        self.removeClassHightLight(
                            self
                                .getCell(self.selectLink.attributes.source.id)
                                .findView(paper).el
                        );
                        self.removeClassHightLight(
                            self
                                .getCell(self.selectLink.attributes.target.id)
                                .findView(paper).el
                        );

                        self.removeRelateColumn(
                            paper.findViewByModel(self.selectLink)
                        );
                        paper.findViewByModel(self.selectLink).removeTools();
                    }

                    self.selectLink = cell;
                    self.selectLink.toFront()
                    self.addClassHightLight(
                        self.getCell(cell.attributes.id).findView(paper)
                            .el,true,self.getCell(cell.attributes.id).findView(paper)
                    );
                    self.addClassHightLight(
                        self.getCell(cell.attributes.source.id).findView(paper)
                            .el
                    );
                    self.addClassHightLight(
                        self.getCell(cell.attributes.target.id).findView(paper)
                            .el
                    );
                    self.$emit('click-link', cellView.model.id);
                } else {
                    if (self.selectLink) {
                        console.log(cell)
                        console.log(self.selectLink)
                        
                        self.addClassHightLight(
                            self.getCell(cell.attributes.id).findView(paper)
                                .el,
                        );
                        self.removeClassHightLight(
                            self
                                .getCell(self.selectLink.attributes.source.id)
                                .findView(paper).el
                        );
                        self.removeClassHightLight(
                            self
                                .getCell(self.selectLink.attributes.target.id)
                                .findView(paper).el
                        );

                        self.removeRelateColumn(
                            paper.findViewByModel(self.selectLink)
                        );
                        paper.findViewByModel(self.selectLink).removeTools();
                    }
                    self.selectLink = null;
                }
            });
            paper.on('cell:pointerup', (cellView, evt, x, y) => {
                cellView.model.toFront();
            });

            paper.on('cell:mouseenter', (cellView, evt, x, y) => {
                cellView.model.toFront();
            });
            paper.on('cell:mouseleave', (cellView, evt, x, y) => {
                cellView.model.attributes.z=1
                if(cellView.model.isLink() &&!cellView.el.childNodes[1].classList.contains('hight-light')&&!cellView.el.childNodes[1].classList.contains('hight-light-link-near')){
                    cellView.model.toBack()
                }
                
            });
            paper.on('link:mouseleave', function (linkView) {
                if(self.selectLink){
                    if (self.selectLink.id!==linkView.model.attributes.id){
                        self.removeClassHightLight(
                            self.getCell(linkView.model.attributes.id).findView(paper)
                                .el,true
                        );
                    }
                }else if(linkView.model.attributes?.source?.id&&linkView.model.attributes?.target?.id){
                    self.removeClassHightLight(
                        self.getCell(linkView.model.attributes.id).findView(paper)
                            .el,true
                    );
                }
                linkView.model.toBack()
                if(self.selectLink){
                    self.selectLink.toFront()
                }
            });
            paper.on('link:mouseenter', function (linkView) {
                linkView.removeTools();
                self.addClassHightLight(
                    self.getCell(linkView.model.attributes.id).findView(paper)
                        .el,true
                );
                if (self.selectLink) {
                    self.showRelateColumn(
                        paper.findViewByModel(self.selectLink)
                    );
                    self.showLinkTools(paper.findViewByModel(self.selectLink));
                }
                linkView.model.toFront()
                self.showLinkTools(linkView);
                self.showRelateColumn(linkView);
                self.oldObjTargetId = linkView.model.attributes.target.id;
                self.oldColTargetId = linkView.model.attributes.target.port;
                self.oldObjSourceId = linkView.model.attributes.source.id;
                self.oldColSourceId = linkView.model.attributes.source.port;

                self.$emit('link-selected', { id: linkView.model.id });
            });
            paper.on('blank:mousewheel', (evt, ox, oy, delta) => {
                if (evt.ctrlKey) {
                    evt.preventDefault();
                    self.zoom(ox, oy, delta);
                }
            });
            paper.on('cell:mousewheel', (_, evt, ox, oy, delta) => {
                if (evt.ctrlKey) {
                    evt.preventDefault();
                    self.zoom(ox, oy, delta);
                }
            });

            paper.on('cell:pointerup', function (cellView) {
                var el = cellView.model;
                var source = el.get('source');
                var target = el.get('target');
                if (self.dataChange.data) {
                    self.$emit('change-link', self.dataChange.data);
                }
                if (
                    el instanceof joint.dia.Link &&
                    (!source.id || !target.id)
                ) {
                    el.remove();
                } else if (
                    el instanceof joint.dia.Link &&
                    (source.id || target.id)
                ) {
                }
            });
            paper.on('link:mouseleave', function (linkView) {
                if (self.selectLink) {
                    if (self.selectLink.id !== linkView.model.id) {
                        self.removeRelateColumn(linkView);
                        linkView.removeTools();
                    }
                } else {
                    self.removeRelateColumn(linkView);
                    linkView.removeTools();
                }

                self.reduceLinks();
                self.oldObjSourceId = null;
                self.oldColSourceId = null;
                self.oldObjTargetId = null;
                self.oldColTargetId = null;
                self.$emit('link-selected');
            });
            paper.on(
                'link:connect',
                (linkView, evt, elementViewConnected, magnet, arrowhead) => {
                    let linkAttr = linkView.model.attributes;
                    let sourceId = linkAttr.source.id;
                    let targetId = linkAttr.target.id;
                    let isDuplicate = false;

                    self.linksArr.forEach((e) => {
                        let link = self.getCell(e);

                        if (e == linkView.model.id) {
                            isDuplicate = true;
                        } else {
                            if (link.attributes) {
                                if (
                                    link.attributes.source.id == sourceId &&
                                    link.attributes.target.id == targetId
                                ) {
                                    if (
                                        link.attributes.source.port ==
                                            linkView.model.attributes.source
                                                .port &&
                                        link.attributes.target.port ==
                                            linkView.model.attributes.target
                                                .port
                                    ) {
                                        linkView.model.remove();
                                        isDuplicate = true;
                                    }
                                }
                            }
                        }
                    });
                    if (!isDuplicate) {
                        self.linksArr.push(linkView.model.id);
                        self.$emit('add-link', {
                            id: linkView.model.id,
                            idObjectSource: sourceId,
                            idObjectTarget: targetId,
                            idColSource: linkAttr.source.port,
                            idColTarget: linkAttr.target.port
                        });
                    }
                    // self.$emit('link-connected', {
                    //     sourceId: sourceId,
                    //     targetId: targetId,
                    // });
                }
            );
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
            paper.on('blank:pointerclick', () => {
                if (self.selectEl) {
                    let el = self.getCell(self.selectEl.model.id);
                    self.removeClassHightLight(self.selectEl.el);
                }

                self.$emit('paper-selected');
            });
            paper.on('element:pointerclick', function (elementView) {
                let el = self.getCell(elementView.model.id);
                self.showElementTools(elementView);
                if (self.selectEl) {
                    self.removeClassHightLight(self.selectEl.el);
                }
                if(self.nearNodeArr.length>0){
                    self.getAllLinks().forEach(link=>{
                            self.removeClassHightLightNear(
                            self
                                .getCell(link.attributes.id)
                                .findView(paper).el,true
                        );
                    })
                    self.nearNodeArr.forEach(e=>{
                        self.removeClassHightLightNear(
                        self
                            .getCell(e)
                            .findView(paper).el
                    );
                    })
                    self.nearNodeArr=[]
                }
                self.getNearNode(elementView.model.id)
                self.addClassHightLight(elementView.el);
                self.selectEl = elementView;
                self.$emit('click-object', elementView.model.attributes.vid);
            });
            graph.on('change:position', (cell) => {
                if (cell.isElement()) {
                    self.$emit('change-position-object', {
                        idObject: cell.attributes.vid,
                        position: cell.attributes.position
                    });
                }
            });
            graph.on(' change:target', function (link) {
                if (link.get('target').id) {
                    let isDuplicate = false;
                    self.dataChange = {};
                    self.linksArr.forEach((e) => {
                        if (e == link.attributes.id) {
                            isDuplicate = true;
                        }
                    });

                    $(
                        '.record-item-body[item-id=' +
                            link._previousAttributes.target.port +
                            ']'
                    ).css({
                        stroke: '#00000000',
                        'stroke-dasharray': '0,0'
                    });
                    $(
                        '.record-item-body[item-id=' + self.oldColTargetId + ']'
                    ).css({
                        stroke: '#00000000',
                        'stroke-dasharray': '0,0'
                    });
                    $(
                        '.record-item-body[item-id=' +
                            link.attributes.target.port +
                            ']'
                    ).css({
                        stroke: '#1976D2',
                        'stroke-dasharray': '5,5'
                    });

                    if (isDuplicate) {
                        self.dataChange.data = {
                            linkId: link.id,
                            newObjTargetId: link.attributes.target.id,
                            oldObjTargetId: self.oldObjTargetId,
                            newColTargetID: link.attributes.target.port,
                            oldColTargetID: self.oldColTargetId,
                            newObjSourceId: null,
                            oldObjSourceId: null,
                            newColSourceID: null,
                            oldColSourceID: null
                        };
                    }
                } else {
                    if (link._previousAttributes.target.port) {
                        $(
                            '.record-item-body[item-id=' +
                                link._previousAttributes.target.port +
                                ']'
                        ).css({
                            stroke: '#00000000',
                            'stroke-dasharray': '0,0'
                        });
                    }
                    if (self.oldColTargetId) {
                        $(
                            '.record-item-body[item-id=' +
                                self.oldColTargetId +
                                ']'
                        ).css({
                            stroke: '#00000000',
                            'stroke-dasharray': '0,0'
                        });
                    }
                }
            });

            graph.on(' change:source', function (link) {
                if (link.get('source').id) {
                    let isDuplicate = false;
                    self.dataChange = {};
                    self.linksArr.forEach((e) => {
                        if (e == link.attributes.id) {
                            isDuplicate = true;
                        }
                    });
                    $(
                        '.record-item-body[item-id=' +
                            link._previousAttributes.source.port +
                            ']'
                    ).css({
                        stroke: '#00000000',
                        'stroke-dasharray': '0,0'
                    });

                    $(
                        '.record-item-body[item-id=' + self.oldColSourceId + ']'
                    ).css({
                        stroke: '#00000000',
                        'stroke-dasharray': '0,0'
                    });
                    $(
                        '.record-item-body[item-id=' +
                            link.attributes.source.port +
                            ']'
                    ).css({
                        stroke: '#1976D2',
                        'stroke-dasharray': '5,5'
                    });
                    if (isDuplicate) {
                        self.dataChange.data = {
                            linkId: link.id,
                            newObjTargetId: null,
                            oldObjTargetId: null,
                            newColTargetID: null,
                            oldColTargetID: null,
                            newObjSourceId: link.attributes.source.id,
                            oldObjSourceId: self.oldObjSourceId,
                            newColSourceID: link.attributes.source.port,
                            oldColSourceID: self.oldColSourceId
                        };
                    }
                } else {
                    if (link._previousAttributes.source.port) {
                        $(
                            '.record-item-body[item-id=' +
                                link._previousAttributes.source.port +
                                ']'
                        ).css({
                            stroke: '#00000000',
                            'stroke-dasharray': '0,0'
                        });
                    }
                    if (self.oldColSourceId) {
                        $(
                            '.record-item-body[item-id=' +
                                self.oldColSourceId +
                                ']'
                        ).css({
                            stroke: '#00000000',
                            'stroke-dasharray': '0,0'
                        });
                    }
                }
            });
            graph.on('remove', function (cell, collection, opt) {
                if (cell.isLink()) {
                    let sourceId = cell.attributes.source.port;
                    let targetId = cell.attributes.target.port;
                    $('.record-item-body[item-id=' + sourceId + ']').css({
                        stroke: '#00000000',
                        'stroke-dasharray': '0,0'
                    });

                    $('.record-item-body[item-id=' + targetId + ']').css({
                        stroke: '#00000000',
                        'stroke-dasharray': '0,0'
                    });
                    self.linksArr = self.linksArr.filter((e) => {
                        return e !== cell.id;
                    });
                    if (self.selectLink) {
                        if (self.selectLink.id == cell.id) {
                            self.selectLink = null;
                        }
                    }

                    self.$emit('remove-link', cell.id);
                } else {
                    self.$emit('remove-obj', cell.attributes.vid);
                }
            });
            graph.on('add', function (cell, collection, opt) {
                if (self.viewMode && self.isRender) {
                    cell.remove();
                } else {
                    if (cell.isElement()) {
                    } else {
                        cell.connector('rounded', {
                            radius: 25
                        });
                    }
                }
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

        addObjectData(objData, idObj) {
            let items = [];
            let self = this;
            objData.config.displayInfor.listColSelected.forEach((e) => {
                let item = {};
                if (!e.inTable) {
                    item.icon = self.getCorrectIconPath(e.type);
                } else {
                    item.icon = self.getCorrectIconPath('table');
                }
                item.id = e.id;
                item.label = e.title;
                items.push(item);
            });

            let dataset = new joint.shapes.mapping.Record({
                items: [items],
                id: objData.idObject,
                vid: idObj,
                icon: objData.type ? relaventIcon[objData.type] : '',
                symperDatasetConfigs: {
                    id: idObj,
                    label: objData.nameObject
                        ? objData.nameObject
                        : objData.titleObject,

                    icon: objData.type ? relaventIcon[objData.type] : ''
                }
            });
            if (!objData.config.position) {
                objData.config.position = {};
            }
            var last = dataset.attributes.markup.pop();
            dataset.attributes.markup.push({
                tagName: 'text',
                selector: 'headerSubLabel'
            });

            if (items.length >= 1) {
                dataset.attributes.markup.push({
                    tagName: 'rect',
                    selector: 'headerBottomBorder'
                });
            }

            dataset.attributes.markup.push(last);
            objData.config.position.x = objData.config.position.x
                ? objData.config.position.x
                : 50;
            objData.config.position.y = objData.config.position.y
                ? objData.config.position.y
                : 130;
            dataset.position(
                objData.config.position.x,
                objData.config.position.y
            );
            dataset.setName(
                objData.nameObject ? objData.nameObject : objData.titleObject
            );
            dataset.setTitle(
                objData.titleObject ? objData.titleObject : objData.nameObject
            );
            if (items.length <= 1) {
                dataset.attributes.size.width = 170;
            }
            dataset.addTo(self.graph);
            self.datasets[idObj] = {
                label: objData.nameObject
                    ? objData.nameObject
                    : objData.titleObject,
                obj: dataset
            };
            self.emitAddObj({
                idObject: idObj,
                position: {
                    x: objData.config.position.x,
                    y: objData.config.position.y
                }
            });
        },
        getCorrectIconPath(type) {
            let icon;
            if (
                type == 'documentInstanceIdentifier' ||
                type == 'select' ||
                type == 'user' ||
                type == 'textInput' ||
                type == 'label' ||
                type == 'fileUpload' ||
                type == 'richText' ||
                type == 'inputFilter' ||
                type == 'cbb' ||
                type == 'combobox' ||
                type == 'loai_test' ||
                type == 'text' ||
                type == 'image'
            ) {
                icon = 'img/smartObject/text.svg';
            } else if (type == 'date') {
                icon = 'img/smartObject/date.svg';
            } else if (type == 'time') {
                icon = 'img/smartObject/time.svg';
            } else if (type == 'dateTime') {
                icon = 'img/smartObject/datetime.svg';
            } else if (type == 'number' || type == 'checkbox') {
                icon = 'img/smartObject/number.svg';
            } else if (type == 'table') {
                icon = 'img/smartObject/table.svg';
            }
            return icon;
        },
        render(objsData, linksDatas) {
            let self = this;
            this.graph.getCells().map((ele) => {
                ele.remove();
            });
            let keyObjArr = Object.keys(objsData);
            keyObjArr.forEach((e) => {
                self.addObjectData(objsData[e], e);
            });

            let keyLinkArr = Object.keys(linksDatas);
            keyLinkArr.forEach((e) => {
                self.addObjectLinks(linksDatas[e], e);
            });
            self.isRender = true;
            self.reduceLinks();
        },
        deleteObject(idObj) {
            let self = this;
            if (self.datasets[idObj]) {
                if (self.getCell(self.datasets[idObj].obj.id)) {
                    self.getCell(self.datasets[idObj].obj.id).remove();
                }
            }
            self.datasets[idObj] = {};
        },
        changeObject(objData) {
            let self = this;
            let keyArr = Object.keys(objData.object);
            let paper = this.$refs.jointPaper.paper;
            self.linksForChange.splice(0, self.linksForChange.length);
            let i = keyArr[0];
            let items = [];
            let dataset = self.getCell(self.datasets[i].obj.id);

            objData.object[i].config.displayInfor.listColSelected.forEach(
                (e) => {
                    let item = {};
                    if (!e.inTable) {
                        item.icon = self.getCorrectIconPath(e.type);
                    } else {
                        item.icon = self.getCorrectIconPath('table');
                    }
                    item.id = e.id;
                    item.label = e.title;
                    items.push(item);
                }
            );
            objData.listLinkConnectToObject.forEach((link) => {
                let linkAtrs = self.getCell(link);
                self.linksForChange.push(linkAtrs);
            });
            self.getCell(self.datasets[i].obj.id).set('items', [items]);
            var last = dataset.attributes.markup.pop();
            dataset.attributes.markup.push({
                tagName: 'text',
                selector: 'headerSubLabel'
            });
            if (items.length >= 1) {
                dataset.attributes.markup.push({
                    tagName: 'rect',
                    selector: 'headerBottomBorder'
                });
                setTimeout(() => {
                    self.addClassHightLight(
                        self.getCell(self.datasets[i].obj.id).findView(paper).el
                    );
                }, 10);
            }
            setTimeout(() => {
                self.getCell(self.datasets[i].obj.id)
                    .findView(paper)
                    .el.childNodes[0].classList.add('hight-light');
            }, 10);

            dataset.attributes.markup.push(last);
            self.linksForChange.forEach((e) => {
                if (e) {
                    if (
                        items.some((x) => {
                            return x.id == e.attributes.source.port;
                        }) ||
                        items.some((x) => {
                            return x.id == e.attributes.target.port;
                        })
                    ) {
                    } else {
                        self.getCell(e.id).remove();
                    }
                }
            });
        },
        addObjectToPaper(objData) {
            let self = this;
            let items = [];
            let keyArr = Object.keys(objData);
            keyArr.forEach((i) => {
                objData[i].config.displayInfor.listColSelected.forEach((e) => {
                    let item = {};
                    if (!e.inTable) {
                        item.icon = self.getCorrectIconPath(e.type);
                    } else {
                        item.icon = self.getCorrectIconPath('table');
                    }
                    item.id = e.id;
                    item.label = e.title;
                    items.push(item);
                });

                let dataset = new joint.shapes.mapping.Record({
                    items: [items],
                    id: objData[i].idObject,
                    vid: i,
                    icon: objData[i].type ? relaventIcon[objData[i].type] : '',
                    symperDatasetConfigs: {
                        id: objData[i].idObject,
                        vid: i,
                        label: objData[i].nameObject
                            ? objData[i].nameObject
                            : objData[i].titleObject,

                        icon: objData[i].type
                            ? relaventIcon[objData[i].type]
                            : ''
                    }
                });
                if (!objData[i].config.position) {
                    objData[i].config.position = {};
                }
                var last = dataset.attributes.markup.pop();
                dataset.attributes.markup.push({
                    tagName: 'text',
                    selector: 'headerSubLabel'
                });
                if (items.length >= 1) {
                    dataset.attributes.markup.push({
                        tagName: 'rect',
                        selector: 'headerBottomBorder'
                    });
                }

                dataset.attributes.markup.push(last);
                objData[i].config.position.x = objData[i].config.position.x
                    ? objData[i].config.position.x
                    : 50;
                objData[i].config.position.y = objData[i].config.position.y
                    ? objData[i].config.position.y
                    : 130;
                dataset.position(
                    objData[i].config.position.x,
                    objData[i].config.position.y
                );
                dataset.setName(
                    objData[i].nameObject
                        ? objData[i].nameObject
                        : objData[i].titleObject
                );
                dataset.setTitle(
                    objData[i].titleObject
                        ? objData[i].titleObject
                        : objData[i].nameObject
                );
                if (items.length <= 1) {
                    dataset.attributes.size.width = 170;
                }
                dataset.addTo(this.graph);
                this.datasets[i] = {
                    label: objData[i].nameObject
                        ? objData[i].nameObject
                        : objData[i].titleObject,
                    obj: dataset
                };
                self.emitAddObj({
                    idObject: i,
                    position: {
                        x: objData[i].config.position.x,
                        y: objData[i].config.position.y
                    }
                });
            });
        },
        addObjectLinks(slink, slinkId) {
            let linkAttr = {};
            this.linksArr.push(slinkId);
            linkAttr.symperLinkType = 'oo';
            linkAttr.source = {
                id: slink.idObjectSource,
                port: slink.idColSource
            };
            linkAttr.id = slinkId;
            linkAttr.target = {
                id: slink.idObjectTarget,
                port: slink.idColTarget
            };

            let link = new joint.shapes.mapping.Link(linkAttr);
            link.connector('rounded', {
                radius: 25
            });
            link.addTo(this.graph);
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
image.record-item-icon {
    x: 8;
}
.joint-free-transform.joint-theme-default.no-rotation {
    display: none;
}
.resize {
    display: none;
}
.hight-light-near{
    stroke: rgb(23 156 236);
    stroke-width: 1px;
}
.hight-light-link-near,
.hight-light {
    stroke: #fb7e00;
    stroke-width: 1px;
}
.record-item-icon {
    width: 13px;
    height: 13px;
    margin-right: 2px;
}
</style>

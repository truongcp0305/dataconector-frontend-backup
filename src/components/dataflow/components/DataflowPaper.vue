<template>
    <div class="symper-dataflow-workspace" style="position: relative; " >
        <div ref="symperPaperToolbar" class="d-none"></div>
        <dataflowSearch
        :isHideSearch="isHideSearch"
        :instanceKey="instanceKey"
        @center-el="centerEl"
        @hide-search-toggle="hideSearchToggle"
        ref="dataflowSearch"
        />
        
        <div
            ref="nodeStencile"
            :style="{
                width: '210px',
                height: height + 'px',
                position: 'relative',
                // 'display':'inline-block',
                overflow: 'auto',
                'z-index': 1,
                'max-width': 210 + 'px'
            }"
            class="symper-node-stencil"
            v-show="action != 'embed'"
        ></div>
        <div
            ref="jointWrapper"
            :style="{
                'min-height': '50px',
                height: height + 'px',
                position: 'relative',
                top: '-' + height + 'px',
                left: isAddStencil ? 190 : 0 + 'px'
                // display:'inline-block'
            }"
        ></div>

        <a ref="downloadLinkSVG" href></a>
    </div>
</template>

<script>
require('@/components/common/rappid/jointjs.js');
import { util } from '@/plugins/util.js';
import { DISPLAY_CONFIGS } from '@/components/dataflow/configPool/nodeDisplayConfig.js';
import { registerNodeDisplay } from '@/components/dataflow/configPool/nodeDisplayConfig.js';
import { autoLoadNodeClasses } from '@/components/dataflow/configPool/dataflowConfig.js';
import { isNull } from 'underscore';
import dataflowSearch from "./DataflowSearchBar.vue"
let mapTypeToNodeClass = autoLoadNodeClasses();
registerNodeDisplay();
export default {
    components: {
        dataflowSearch
    },
    data() {
        return {
            isHideSearch:true,
            strokeColerObj: {
                Filter: 'rgba(74, 91, 140, 1)',
                Formula: 'rgba(251, 126, 0, 1)',
                Join: 'rgba(251, 126, 0, 1)',
                Load: 'rgba(97, 196, 84, 1)',
                Split: 'rgba(251, 126, 0, 1)',
                Pivot: 'rgba(74, 91, 140, 1)',
                Sort: 'rgba(74, 91, 140, 1)',
                Union: 'rgba(251, 126, 0, 1)',
                WeightAvg: 'rgba(251, 126, 0, 1)',
                Script: 'rgba(251, 126, 0, 1)',
                Select: 'rgba(97, 196, 84, 1)',
                Validate: 'rgba(208, 74, 0, 1)',
                TransposeTable: 'rgba(74, 91, 140, 1)',
                Summarize: 'rgba(251, 126, 0, 1)'
            },
            wrapper: {
                height: '300px',
                width: '500px'
            },
            selectingNode: null,
            hasNodeErr: false,
            selectionNodeDataFlow: null,
            isRunningDataflow: false,
            oldTargetId: null,
            highLightLinks: []
        };
    },
    name: 'DataflowPaper',
    props: {
        viewMode: {
            type: Boolean,
            default: false
        },
        isAddStencil: {
            type: Boolean,
            default: true
        },
        instanceKey: {
            defaul: ''
        },
        action: {
            defaul: 'view'
        },
        width: {
            type: [String, Number],
            default: 800
        },
        height: {
            type: [String, Number],
            default: 250
        },
        gridSize: {
            type: Number,
            default: 1
        },
        drawGrid: {
            type: [Object, Boolean],
            default: false
        },
        background: {
            type: [Object, Boolean],
            default: false
        },
        readonly: {
            type: Boolean,
            default: false
        },
        nodeStatusInfo: {
            type: Object,
            default() {
                return { nodeSuccessId: [], nodeErrId: [] };
            }
        },
        runDataFlowInfo: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    created() {
        this.graph = new joint.dia.Graph();
    },
    mounted() {
        this.initPaper();
    },
    computed: {
        dataflowInfo() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey];
        }
    },
    methods: {
        getAllLinks() {
            return this.graph.getLinks();
        },
        getAllNodes() {
            return this.graph.getCells();
        },
        clearAll() {
            this.graph.clear();
        },
        getCell(id) {
            return this.graph.getCell(id);
        },

        getNodeAttr(id) {
            let node = this.graph.getCell(id);
            if (node) {
                return node.attributes;
            } else {
                return {};
            }
        },
        getLinks() {
            return this.graph.getLinks();
        },
        addLinkTools(link) {
            let paper = this.paper;

            link.set('router', { name: 'manhattan' });
            link.set('connector', {
                name: 'rounded',
                args: {
                    radius: 10
                }
            });

            let linkView = link.findView(paper);
            var removeButton = new joint.linkTools.Remove({
                distance: '30%'
            });
            var targetArrowheadTool = new joint.linkTools.TargetArrowhead();
            var toolsView = new joint.dia.ToolsView({
                tools: [removeButton, targetArrowheadTool]
            });
            linkView.addTools(toolsView);
            linkView.hideTools();
        },
        addLinkOrders(link, order) {
            link.appendLabel({
                attrs: {
                    text: {
                        text: '#' + order,
                        fill: 'rgba(252, 142, 31, 1)'
                    }
                },
                position: {
                    distance: 0.55
                }
            });
        },
        addLinks(links) {
            let portIn = '';
            let portOut = '';
            for (let linkInfo of links) {
                let sourcePorts = this.graph
                    .getCell(linkInfo.source)
                    .getPorts();
                portOut =
                    sourcePorts[0].group == 'out'
                        ? sourcePorts[0].id
                        : sourcePorts[1].id;

                let targetPorts = this.graph
                    .getCell(linkInfo.target)
                    .getPorts();
                if (targetPorts.length < 2) {
                    continue;
                }
                portIn =
                    targetPorts[0].group == 'in'
                        ? targetPorts[0].id
                        : targetPorts[1].id;

                var link = new joint.shapes.app.Link({
                    source: {
                        id: linkInfo.source,
                        port: portOut
                    },
                    target: {
                        id: linkInfo.target,
                        port: portIn
                    }
                });
                link.addTo(this.graph, { async: false });
            }
        },
        getInitOrderOneField(idNode) {
            if (nodesOrder[idNode]) {
                delete nodesOrder[idNode];
            }
            nodesOrder[idNode] = true;
            for (let nextNodeId in this.dataflowInfo.allWidget[idNode]
                .nextNodes) {
                this.getInitOrderOneField(nextNodeId);
            }
        },
        getNodeExeOrder() {
            for (let nodeId in this.dataflowInfo.allWidget) {
                this.getInitOrderOneField(nodeId);
            }
            return Object.keys(nodesOrder);
        },
        center() {
            this.actionOnToolbar('zoomToFit');
        },
        initPaper() {
            let graph = this.graph;
            let thisSize = util.getComponentSize(this);
            this.wrapper.height = thisSize.h - 80 + 'px';
            this.wrapper.width = thisSize.w + 'px';
            this.paper = new joint.dia.Paper({
                model: graph,
                width: 1000,
                height: 1000,
                gridSize: 10,
                linkPinning: false,
                sorting: joint.dia.Paper.sorting.APPROX,
                markAvailable: true,
                interactive: !this.viewMode,
                snapLinks: { radius: 40 },
                defaultConnectionPoint: { name: 'anchor' },
                defaultConnector: {
                    name: 'jumpover',
                    args: { jump: 'cubic' }
                },
                highlighting: {
                    magnetAvailability: {
                        name: 'addClass',
                        options: {
                            className: 'record-item-available'
                        }
                    },
                    connecting: {
                        name: 'stroke',
                        options: {
                            padding: 8,
                            attrs: {
                                stroke: 'none',
                                fill: '#7c68fc',
                                'fill-opacity': 0.2
                            }
                        }
                    }
                },
                validateConnection: function (
                    cellViewS,
                    magnetS,
                    cellViewT,
                    magnetT,
                    end,
                    linkView
                ) {
                    // Prevent linking from input ports.
                    if (magnetS && magnetS.getAttribute('port-group') === 'in')
                        return false;
                    // Prevent linking from output ports to input ports within one element.
                    if (cellViewS === cellViewT) return false;
                    // Prevent linking to input ports.
                    return (
                        (magnetT &&
                            magnetT.getAttribute('port-group') === 'in') ||
                        (cellViewS.model.get('type') === 'qad.Question' &&
                            cellViewT.model.get('type') === 'qad.Answer')
                    );
                },
                defaultLink: function () {
                    let link = new joint.shapes.app.Link();
                    return link;
                },

                async: true,
                sorting: joint.dia.Paper.sorting.APPROX
            });
            this.keyboard = new joint.ui.Keyboard();
            this.clipboard = new joint.ui.Clipboard({ useLocalStorage: false });
            this.snaplines = new joint.ui.Snaplines({ paper: this.paper });
            this.snaplines.startListening();
            let paperScroller = new joint.ui.PaperScroller({
                paper: this.paper,
                cursor: 'grab',
                autoResizePaper: true,
                scrollWhileDragging: true,
                contentOptions: function (paperScroller) {
                    var visibleArea = paperScroller.getVisibleArea();
                    return {
                        padding: {
                            bottom: visibleArea.height / 2,
                            top: visibleArea.height / 2,
                            left: visibleArea.width / 2,
                            right: visibleArea.width / 2
                        },
                        allowNewOrigin: 'any'
                    };
                }
            });
            var commandManager = new joint.dia.CommandManager({
                graph: graph,
                cmdBeforeAdd: (cmdName) => {
                    return (
                        cmdName !== 'change:z' &&
                        cmdName !== 'change:labels' &&
                        cmdName !== 'change:attrs' &&
                        cmdName !== 'change:router' &&
                        cmdName !== 'change:connector'
                    );
                }
            });
            this.commandManager = commandManager;
            this.selection = new joint.ui.Selection({
                theme: 'material',
                paper: this.paper,
                useModelGeometry: true,
                allowTranslate: true
            });
            this.selection.removeHandle('rotate');
            this.selection.removeHandle('resize');
            this.paperScroller = paperScroller;
            var toolbar = new joint.ui.Toolbar({
                // initialize tools with default settings
                tools: [
                    'zoomIn',
                    'zoomOut',
                    'zoomToFit',
                    'zoomSlider',
                    'undo',
                    'redo'
                ],
                references: {
                    paperScroller: paperScroller,
                    commandManager: commandManager
                }
            });
            $(this.$refs.symperPaperToolbar).append(toolbar.render().el);
            this.highlighters = joint.highlighters;
            if (this.isAddStencil) {
                this.addStencil();
                let searchBar = document.querySelector('.search');
                searchBar.placeholder = this.$t('v2.dataflow.search');
                searchBar.style.width =
                    Number(
                        document
                            .querySelector('.search')
                            .style.width.replace('px', '')
                    ) -
                    10 +
                    'px';
                this.addIconToInput();
            }
            this.handlePaperEvents();
            $(this.$refs.jointWrapper).append(paperScroller.el);
            this.selection.collection.reset(graph.getElements());
            paperScroller.render().center();
            this.resetViewToDefault();
        },
        addIconToInput(containerName = null) {
            let container = 'search-wrap';
            if (containerName) {
                container = containerName;
            }
            let containerEl = document.querySelector(`.${container}`);

            let newElement = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg'
            );

            newElement.setAttribute('viewBox', '0 0 24 24');
            newElement.setAttribute('width', '14px');
            newElement.setAttribute('height', '14px');
            let path = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path'
            );
            path.setAttribute(
                'd',
                'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z'
            );
            path.setAttribute('stroke', '#3B3B3B');
            path.setAttribute('strokeWidth', '3px');
            path.setAttribute('fill', '#3B3B3B');
            newElement.appendChild(path);
            newElement.id = 'search-icons';
            containerEl.appendChild(newElement);
        },
        addStencil() {
            let graph = this.graph;
            let paper = this.paper;
            let self=this
            var stencil = new joint.ui.Stencil({
                graph: graph,
                paper: paper,
                width: '200',
                height: '100%',
                layout: {
                    columnWidth: 70,
                    columns: 1,
                    row: 30,
                    rowHeight: 58
                },
                dropAnimation: true,
                search: function (element, keyword, groupId, stencil) {
                    stencil.el.dataset.textNoMatchesFound = 'No matches found!';
                    // Search Placeholder
                    stencil.el.querySelector('.search').placeholder =
                    self.$t('v2.dataflow.search');
                    return element
                        .get('type')
                        .toLowerCase()
                        .includes(keyword.toLowerCase());
                }
            });

            $(this.$refs.nodeStencile).append(stencil.el);
            let items = [];
            for (let type in mapTypeToNodeClass) {
                if (joint.shapes.app[type]) {
                    let s = new joint.shapes.app[type]({
                        size: { width: 45, height: 45 }
                    });
                    items.push(s);
                }
            }
            stencil.options.height = items.length * 58;

            stencil.render().load(items);
        },
        makeTextBreak(text) {
            return joint.util.breakText(
                text,
                {
                    width: DISPLAY_CONFIGS.width * 2,
                    height: DISPLAY_CONFIGS.height * 3,
                    title: text
                },
                {
                    'font-size': DISPLAY_CONFIGS.labelFontSize,
                    title: text
                }
            );
        },
        addNodeToWorkspace(attr) {
            let nodeType = attr.type.replace('app.', '');
            let nodeClass = joint.shapes.app[nodeType];
            if (nodeClass) {
                let cell = new nodeClass({
                    position: attr.position,
                    id: attr.id
                });
                cell.attr(
                    '.symper-widget-label/text',
                    this.makeTextBreak(attr.name)
                );
                this.graph.addCell(cell);
            } else {
                console.error("Node type '" + nodeType + "' is not defined");
            }
        },
        updateLinkNumber(sourceId, targetId, num) {
            let links = this.graph.getLinks();
            for (let link of links) {
                if (
                    link.attributes.target.id == targetId &&
                    link.attributes.source.id == sourceId
                ) {
                    if (link.labels().length == 0) {
                        this.addLinkOrders(link, num);
                    }
                    link.attr('text/text', '#' + num);
                    break;
                }
            }
        },
        toggleSearch(){
            this.isHideSearch=!this.isHideSearch
            this.$refs.dataflowSearch.resetData()
        },
        
        focusAndHightLightNode(nodeId) {
            let self = this;
            if(!nodeId){
                return;
            }
            
            let node=self.getCell(nodeId)
            if(!node){
                return;
            }
            self.disSelectNode(self.selectingNode);
            self.highlightNode(node);
            if (!self.viewMode) {
                self.showRemoveButton(node.id);
            }
            self.selectingNode = node;
            self.unHighLightLink();
            self.getElementPredecessorLinks(node).forEach((link) => {
                self.highlightLink(link);
            });
            self.$emit('node-selected', { id: node.id });
            self.getElementPredecessorNodes(node).forEach((cell) => {
                cell.toFront();
            });
            self.centerEl(node);
        },
        hideSearchToggle(data){
            this.isHideSearch=data
        },
        centerEl(node) {
            let self = this;
            if(!node){
                self.$snotify({
                    type: 'error',
                    title: self.$t('v2.dataflow.nodeNotFound')
                });
                return
            }
            if(typeof node=='string'){
                let nodeInfo=self.getCell(node)
                if(!nodeInfo){
                    self.$snotify({
                        type: 'error',
                        title: self.$t('v2.dataflow.nodeNotFound')
                    });
                    return
                }
                self.focusAndHightLightNode(nodeInfo);
                // self.paperScroller.scrollToElement(nodeInfo, {
                //     animation: { duration: 800 }
                // });
                this.$refs.dataflowSearch.resetData()
                
            }else{
                self.paperScroller.scrollToElement(node, {
                    animation: { duration: 800 }
                });
            }
        },
        highlightLink(link){
            link.attr('line/stroke', '#f58634');
            link.attr('line/strokeWidth', DISPLAY_CONFIGS.hightlightWidth);
            link.attr('text/fill', DISPLAY_CONFIGS.highlightWidBordergetColor);
            link.toFront();
            this.highLightLinks.push(link.id);
        },
        handlePaperEvents() {
            let paper = this.paper;
            let graph = this.graph;
            let keyboard = this.keyboard;

            let self = this;
            keyboard.on('keydown:delete keydown:backspace', (evt) => {
                if (!self.selection) return;
                if (self.selection.model.length > 0) {
                    evt.preventDefault(self.selection.collection.toArray());
                    if (!self.viewMode) {
                        graph.removeCells(self.selection.collection.toArray());
                    }
                    self.selectingNode = null;
                }
            });
            keyboard.on('keyup:delete keyup:backspace', (evt) => {
                self.selection.collection.reset([]);
            });
            
            keyboard.on('keydown:ctrl+a ', (evt) => {
                evt.preventDefault();
                self.selection.collection.reset(graph.getElements());
            });
            keyboard.on('keydown:esc ', (evt) => {
                evt.preventDefault();
                self.isHideSearch=true
            });
            keyboard.on('keydown:ctrl+f', (evt) => {
                evt.preventDefault();
                self.toggleSearch()
            });
            keyboard.on('keydown:ctrl+z', (evt) => {
                self.commandManager.undo();
                if (self.selectingNode) {
                    self.unHighLightLink();
                    this.disSelectNode(this.selectingNode);
                    self.selectingNode = null;
                }
            });
            keyboard.on('keydown:ctrl+y', (evt) => {
                self.commandManager.redo();
                if (self.selectingNode) {
                    self.unHighLightLink();
                    self.disSelectNode(self.selectingNode);
                    self.selectingNode = null;
                }
            });
            keyboard.on('keydown:ctrl+i', (evt) => {});
            keyboard.on('keydown:ctrl+]', (evt) => {
                self.resetNodeStatus();
            });
            keyboard.on('ctrl+c', function () {
                self.clipboard.copyElements(
                    self.selection.collection,
                    paper.model
                );
            });
            keyboard.on('ctrl+x', function () {
                self.clipboard.cutElements(
                    self.selection.collection,
                    paper.model
                );
            });
            keyboard.on('keydown:ctrl+v', (evt) => {
                var pastedCells = self.clipboard.pasteCells(graph, {
                    translate: { dx: 40, dy: 40 }
                });

                var elements = _.filter(pastedCells, function (cell) {
                    return cell.isElement();
                });
                // Make sure pasted elements get selected immediately. This makes the UX better as
                // the user can immediately manipulate the pasted elements.
                self.selection.collection.reset(elements);
            });
            self.selection.on(
                'selection-box:pointerdown',
                function (cellView, evt) {
                    if (evt.ctrlKey || evt.metaKey) {
                        self.selection.collection.remove(cellView.model);
                    }
                }
            );

            $('div.symper-dataflow-workspace').bind('mousewheel', (evt) => {
                if (evt.target.classList.contains('selection-box')) {
                    if (evt.ctrlKey) {
                        evt.preventDefault();
                        if (evt.originalEvent.wheelDelta < 0) {
                            self.paperScroller.zoom(-0.1, { min: 0.2 });
                        } else if (evt.originalEvent.wheelDelta > 0) {
                            self.paperScroller.zoom(0.1, { max: 4 });
                        }
                    }
                }
            });
            paper.on('blank:pointerdown', function (evt, x, y) {
                if (evt.shiftKey) {
                    self.paperScroller.setCursor('crosshair');
                    self.selection.removeHandle('remove');
                    self.selection.startSelecting(evt);
                } else {
                    self.selection.collection.reset([]);
                    self.paperScroller.startPanning(evt, x, y);
                    paper.hideTools();
                    self.paperScroller.setCursor('grab');
                }
            });
            paper.on('cell:pointerdown', (cellView, evt, x, y) => {
                let node = cellView.model;
                if (node.attributes.type == 'app.Link') {
                    return;
                }
                if (!self.isRunningDataflow) {
                    self.resetNodeStatus();
                    self.disSelectNode(self.selectingNode);
                    self.highlightNode(node);
                    if (!self.viewMode) {
                        self.showRemoveButton(node.id);
                    }
                    self.selectingNode = node;
                    self.unHighLightLink();
                    self.getElementPredecessorLinks(cellView.model).forEach(
                        (link) => {
                            self.highlightLink(link);
                        }
                    );
                    self.$emit('node-selected', { id: cellView.model.id });
                    self.getElementPredecessorNodes(cellView.model).forEach(
                        (cell) => {
                            cell.toFront();
                        }
                    );
                } else {
                    this.$snotify({
                        type: 'error',
                        title: this.$t(
                            'v2.dataflow.dataFlowRunningDontPressAnotherNode'
                        )
                    });
                }
            });
            paper.on('cell:pointerup', (cellView, evt, x, y) => {
                if (cellView.model.isLink()) {
                    cellView.model.attributes.z = 2;
                } else {
                    cellView.model.toFront();
                }
            });

            paper.on('cell:mouseenter', (cellView, evt, x, y) => {
                if (cellView.model.isLink()) {
                    cellView.model.attributes.z = 2;
                } else {
                    cellView.model.toFront();
                }
            });
            paper.on('cell:mouseleave', (cellView, evt, x, y) => {
                if (
                    cellView.model.isLink() &&
                    !this.highLightLinks.includes(cellView.model.id)
                ) {
                    if (
                        !cellView.el.childNodes[1].classList.contains(
                            'err-links'
                        ) &&
                        !cellView.el.childNodes[1].classList.contains(
                            'success-links'
                        )
                    ) {
                        cellView.model.toBack();
                    }
                } else if (cellView.model.isElement()) {
                    cellView.model.attributes.z = 10;
                } else {
                    cellView.model.attributes.z = 1;
                }
            });
            paper.on('element:pointerup', (cellView, evt, x, y) => {
                if (evt.ctrlKey || evt.metaKey) {
                    self.selection.collection.add(cellView.model);
                    self.selection.collection.models.forEach((element) => {
                        element.toFront();
                    });
                } else {
                    self.selection.collection.reset([]);
                }
            });
            paper.on('link:pointerup', (cellView, evt, x, y) => {
                if (
                    cellView.model.attributes.target.id ==
                    cellView.model.attributes.source.id
                ) {
                    cellView.model.remove();
                }
            });
            paper.on('cell:contextmenu	', (cellView, evt, x, y) => {
                // if (window.EMBED_BI) {
                //     showContextMenuOfNode(cellView, evt, x, y);
                // }
            });
            paper.on('blank:pointerclick', (cellView, evt, x, y) => {
                if (!self.isRunningDataflow) {
                    self.unHighLightLink();
                    this.disSelectNode(this.selectingNode);
                    self.selectingNode = null;
                }
                self.$emit('paper-selected');
            });

            paper.on('link:mouseenter', function (linkView) {
                if (!self.isRunningDataflow) {
                    if (
                        linkView.el.childNodes[1].classList.contains(
                            'err-links'
                        )
                    ) {
                        self.hilightLink(linkView.model, 'err-links');
                    } else if (
                        linkView.el.childNodes[1].classList.contains(
                            'success-links'
                        )
                    ) {
                        self.hilightLink(linkView.model, 'success-links');
                    } else {
                        self.hilightLink(linkView.model);
                    }

                    self.oldTargetId = linkView.model.attributes.target.id;
                }
                linkView.showTools();
            });
            paper.on('blank:mousewheel', function (evt, x, y, delta) {
                if (evt.ctrlKey) {
                    evt.preventDefault();
                    if (delta < 0) {
                        self.paperScroller.zoom(-0.1, { min: 0.2 });
                    } else if (delta > 0) {
                        self.paperScroller.zoom(0.1, { max: 4 });
                    }
                }
            });
            paper.on('cell:mousewheel', function (cellView, evt, x, y, delta) {
                if (evt.ctrlKey) {
                    evt.preventDefault();
                    if (delta < 0) {
                        self.paperScroller.zoom(-0.1, { min: 0.2 });
                    } else if (delta > 0) {
                        self.paperScroller.zoom(0.1, { max: 4 });
                    }
                }
            });
            paper.on('link:mouseleave', function (linkView) {
                linkView.hideTools();
                if (!self.isRunningDataflow) {
                    if (linkView.model.attributes.target.id) {
                        self.unHilightLink(linkView.model);
                    }
                }
                self.oldTargetId = null;
            });

            paper.on('node:remove', function (cellView) {
                let id = cellView.model.id;
                self.$emit('node-removed', {
                    id
                });
                cellView.model.remove();
            });
            paper.on('node:err-info', function (cellView) {
                self.$emit('node-err-clicked', { id: cellView.model.id });
            });
            paper.on('node:success-info', function (cellView) {
                self.$emit('node-success-clicked', { id: cellView.model.id });
            });
            paper.on(
                'link:connect',
                (linkView, evt, elementViewConnected, magnet, arrowhead) => {
                    let linkAttr = linkView.model.attributes;
                    let sourceId = linkAttr.source.id;
                    let targetId = linkAttr.target.id;
                    self.$emit('link-connected', {
                        sourceId: sourceId,
                        targetId: targetId
                    });
                }
            );
            graph.on('remove', function (cell, collection, opt) {
                if (cell.isLink()) {
                    let cellAtrr = cell.attributes;
                    self.$emit('link-removed', {
                        sourceId: cellAtrr.source.id,
                        targetId: cellAtrr.target.id
                    });
                } else {
                    self.$emit('node-removed', {
                        id: cell.attributes.id
                    });
                }
            });
            graph.on(' change:target', function (link) {
                if (link.get('target').id) {
                    self.$emit('change-link-target', {
                        linkId: link.attributes.id,
                        newTargetId: link.attributes.target.id,
                        oldTargetId: self.oldTargetId
                    });
                }
            });
            graph.on('add', (cell, collection, opt) => {
                let elView = cell.findView(self.paper);
                if (cell.isElement() && elView && elView.el) {
                    cell.findView(self.paper).el.classList.add(
                        'joint-cell-in-paper'
                    );
                    if (
                        (cell.attributes.size.width !==
                            cell.attributes.size.height) !==
                        50
                    ) {
                        cell.attributes.size.width = 50;
                        cell.attributes.size.height = 50;
                    }
                }
                let type = cell.attributes.type;
                if (type == 'app.Link') {
                    setTimeout(() => {
                        if (!self.viewMode) {
                            self.addLinkTools(cell, paper);
                        }
                    }, 100);
                } else {
                    type = type.split('.')[1];
                    self.$emit('node-added', {
                        id: cell.id,
                        type: type
                    });
                }
            });
        },
        setNodeName(id, name) {
            let node = this.graph.getCell(id);
            node.attr('.symper-widget-label/text', this.makeTextBreak(name));
        },
        hilightLink(link, mode = '') {
            if (mode == '') {
                link.attr(
                    'line/stroke',
                    DISPLAY_CONFIGS.highlightWidBordergetColor
                );
                link.attr('line/strokeWidth', DISPLAY_CONFIGS.hightlightWidth);
                link.attr(
                    'text/fill',
                    DISPLAY_CONFIGS.highlightWidBordergetColor
                );
            }

            let color = '';
            let fillColor = '';
            let strokeDasharray = '';

            if (mode == 'select-dataflow-not-done') {
                color = 'rgba(25, 118, 210, 1)';
                strokeDasharray = '0, 0';
                link.attr('line/stroke', color);
                link.attr('line/strokeDasharray', strokeDasharray);
                link.attr('text/fill', '');
            }
            if (mode == 'select-dataflow-done') {
                color = 'rgba(97, 196, 84, 1)';
                strokeDasharray = '0, 0';
                link.attr('line/stroke', color);
                link.attr('line/strokeDasharray', strokeDasharray);
                link.attr('text/fill', fillColor);
            }
            if (mode == 'err-links') {
                color = 'rgba(237, 107, 95, 1)';
                strokeDasharray = '0, 0';
                link.attr('line/stroke', color);
                link.attr('line/strokeDasharray', strokeDasharray);
            }
            if (mode == 'success-links') {
                color = 'rgba(97, 196, 84, 1)';
                strokeDasharray = '0, 0';
                link.attr('line/stroke', color);
                link.attr('line/strokeDasharray', strokeDasharray);
            }
        },

        unHilightLink(link) {
            let self = this;

            if (!this.highLightLinks.includes(link.id)) {
                link.attr(
                    'line/stroke',
                    DISPLAY_CONFIGS.normalWidgetBorderColor
                );
                link.attr('line/strokeWidth', DISPLAY_CONFIGS.normalWidth);
                // link.attr('text/fill', DISPLAY_CONFIGS.normalWidgetBorderColor);
            } else {
                link.attr('line/stroke', '#f58634');
            }
            if (
                link
                    .findView(self.paper)
                    .el.childNodes[1].classList.contains('err-links')
            ) {
                link.attr('line/stroke', 'rgba(237, 107, 95, 1)');
            }
            if (
                link
                    .findView(self.paper)
                    .el.childNodes[1].classList.contains('success-links')
            ) {
                link.attr('line/stroke', 'rgba(97, 196, 84, 1)');
            }
        },
        saveSVG() {
            let self = this;
            let downloadLink = $(this.$refs.downloadLinkSVG);
            let done = function (svgString) {
                util.setEncoded(downloadLink, 'diagram.svg', svgString);
            };
            this.paper.toSVG(done);
        },
        actionOnToolbar(type) {
            let ele = $(this.$refs.symperPaperToolbar).find(
                '.joint-widget[data-type=' + type + ']'
            );
            ele.mousedown();
            ele.click();
            if (type == 'zoomToFit') {
                $(this.$refs.symperPaperToolbar)
                    .find('.joint-widget[data-type=zoomSlider]')
                    .find('input')
                    .val(100)
                    .change();
            }
        },
        addToolbar() {
            let commandManager = new joint.dia.CommandManager({
                graph: this.graph
            });
            let toolbar = new joint.ui.Toolbar({
                tools: [
                    'zoomIn',
                    'zoomOut',
                    'zoomToFit',
                    'undo',
                    'redo',
                    'zoomSlider'
                ],
                references: {
                    paperScroller: this.paperScroller,
                    commandManager: commandManager
                }
            });
            $(this.$refs.symperPaperToolbar).append(toolbar.render().el);
        },
        disSelectNode(node) {
            this.unHighlightNode(node);
        },
        highlightNode(node, mode = 'select') {
            if (node.model) {
                node = node.model;
            }
            let self = this;
            let typeNode = node.attributes.type.replace('app.', '');
            let color = '';
            let fillColor = '';
            let strokeDasharray = '';
            if (mode == 'select') {
                fillColor = this.strokeColerObj[typeNode];
                strokeDasharray = '0,0';
            } else if (mode == 'err') {
                color = 'red';
                fillColor = 'pink';
                strokeDasharray = '0,0';
            } else if (mode == 'select-dataflow-not-done') {
                color = 'rgba(25, 118, 210, 1)';
                strokeDasharray = '0, 0';
            } else if (mode == 'select-dataflow-done') {
                color = 'rgba(97, 196, 84, 1)';
                strokeDasharray = '0, 0';
            }

            let nodeView = node.findView(self.paper);
            if (
                node.attr &&
                nodeView &&
                nodeView.el &&
                nodeView.el.children[0]
            ) {
                if (
                    !nodeView.el.children[0].classList.contains('err-cell') ||
                    !nodeView.el.children[0].classList.contains('success-cell')
                ) {
                    node.attr(
                        '.symper-widget-image/xlinkHref',
                        node.attributes.attrs['.symper-widget-image']
                            .hightLightHref
                    );
                    node.attr('.symper-widget-frame/stroke', color);
                    node.attr('.symper-widget-frame/strokeWidth', 1.5);
                    node.attr('.symper-widget-frame/fill', fillColor);
                    node.attr(
                        '.symper-widget-frame/strokeDasharray',
                        strokeDasharray
                    );
                }
            }
        },
        unHighLightLink() {
            let self = this;
            let links = this.getLinks();
            self.highLightLinks = [];
            links.forEach(function (e) {
                e.attr('line/stroke', '#8F8F8F');
                e.attr('line/strokeWidth', DISPLAY_CONFIGS.normalWidth);
                // e.attr('text/fill', DISPLAY_CONFIGS.normalWidgetBorderColor);
                e.attr('line/strokeDasharray', '0,0');
                if (
                    e
                        .findView(self.paper)
                        .el.childNodes[1].classList.contains('err-links')
                ) {
                    e.attr('line/stroke', 'rgba(237, 107, 95, 1)');
                }
                if (
                    e
                        .findView(self.paper)
                        .el.childNodes[1].classList.contains('success-links')
                ) {
                    e.attr('line/stroke', 'rgba(97, 196, 84, 1)');
                }
            });
        },
        unHighlightNode(node) {
            if (node) {
                let self = this;
                let typeNode = node.attributes.type.replace('app.', '');
                let color = this.strokeColerObj[typeNode];
                if (node.isElement()) {
                    if (node.model) {
                        node = node.model;
                    }

                    let nodeView = node.findView(self.paper);
                    if (
                        node.attr &&
                        nodeView &&
                        nodeView.el &&
                        nodeView.el.children[0]
                    ) {
                        if (
                            !nodeView.el.children[0].classList.contains(
                                'err-cell'
                            )
                        ) {
                            node.attr('.symper-widget-frame/stroke', color);
                            node.attr('.symper-widget-frame/strokeWidth', 1.5);
                            node.attr('.symper-widget-frame/fill', '');
                            node.attr(
                                '.symper-widget-frame/strokeDasharray',
                                '0,0'
                            );
                            node.attr(
                                '.symper-widget-image/xlinkHref',
                                node.attributes.attrs['.symper-widget-image']
                                    .unHightLightHref
                            );
                        }
                    }
                    this.hideRemoveButton(node.id);
                    if (self.hasNodeStatus) {
                        if (self.nodeStatusInfo['nodeErrId']) {
                            self.setNodeErr(self.nodeStatusInfo['nodeErrId']);
                        }
                        if (self.nodeStatusInfo['nodeSuccessId']) {
                            self.setNodeSuccess(
                                self.nodeStatusInfo['nodeSuccessId']
                            );
                        }
                    }
                }
            }
        },
        showRemoveButton(idNode) {
            $('.joint-cell[model-id=' + idNode + ']')
                .find('.symper-widget-remove')
                .removeClass('d-none');
        },
        hideRemoveButton(idNode) {
            $('.joint-cell[model-id=' + idNode + ']')
                .find('.symper-widget-remove')
                .addClass('d-none');
        },

        setNodeErr(nodeIds) {
            let self = this;
            self.hasNodeStatus = true;
            if (self.nodeStatusInfo['nodeErrId'].length == 0) {
                self.nodeStatusInfo['nodeErrId'] = [...nodeIds];
            }
            if (nodeIds) {
                nodeIds.forEach((id) => {
                    let cellErr = self.getCell(id);
                    cellErr.findView(self.paper).el.classList.add('err-cell');
                    cellErr
                        .findView(self.paper)
                        .el.children[0].classList.add('err-cell');
                    cellErr.attr('.symper-widget-frame/strokeWidth', 1.5);
                    cellErr.attr('.symper-widget-frame/strokeDasharray', '0,0');
                    self.getElementPredecessorLinks(cellErr).forEach((link) => {
                        link.attr('line/stroke', 'rgba(237, 107, 95, 1)');
                        link.findView(self.paper).el.children[1].classList.add(
                            'err-links'
                        );
                    });
                    self.displayCellErrSign(cellErr);
                });
            }
        },
        setNodeSuccess(nodeIds) {
            let self = this;
            self.hasNodeStatus = true;
            if (self.nodeStatusInfo['nodeSuccessId'].length == 0) {
                self.nodeStatusInfo['nodeSuccessId'] = [...nodeIds];
            }
            if (nodeIds) {
                nodeIds.forEach((id) => {
                    let cellSuccess = self.getCell(id);
                    cellSuccess
                        .findView(self.paper)
                        .el.classList.add('success-cell');
                    cellSuccess
                        .findView(self.paper)
                        .el.children[0].classList.add('success-cell');

                    self.getElementPredecessorLinks(cellSuccess).forEach(
                        (link) => {
                            link.findView(
                                self.paper
                            ).el.children[1].classList.add('success-links');
                            link.attr('line/stroke', 'rgba(97, 196, 84, 1)');
                        }
                    );
                    self.displayCellSuccessSign(cellSuccess);
                });
            }
        },
        displayCellSuccessSign(cellSuccess) {
            let self = this;
            let newElement = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg'
            );
            newElement.setAttribute('viewBox', '0 0 24 24');
            newElement.setAttribute('width', '22px');
            newElement.setAttribute('height', '22px');
            newElement.setAttribute('x', '50');
            newElement.setAttribute('y', '-20');
            newElement.setAttribute('event', 'node:success-info');
            let path = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path'
            );
            path.setAttribute(
                'd',
                'M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2,4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z'
            );
            path.setAttribute('stroke', 'rgba(97, 196, 84, 1)');
            path.setAttribute('stroke-width', '0.5px');

            path.setAttribute('fill', 'rgba(97, 196, 84, 1)');
            newElement.appendChild(path);
            newElement.id = 'checked-circle';
            let el = cellSuccess.findView(self.paper).el;
            el.appendChild(newElement);
        },
        displayCellErrSign(cellErr) {
            let self = this;
            let newElement = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg'
            );
            newElement.setAttribute('viewBox', '0 0 24 24');
            newElement.setAttribute('width', '22px');
            newElement.setAttribute('height', '22px');
            newElement.setAttribute('x', '50');
            newElement.setAttribute('y', '-20');
            newElement.setAttribute('event', 'node:err-info');
            let path = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path'
            );
            path.setAttribute(
                'd',
                'M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z'
            );
            path.setAttribute('stroke', '');
            path.setAttribute('fill', 'red');
            newElement.appendChild(path);
            newElement.id = 'alert-circle';
            let el = cellErr.findView(self.paper).el;
            el.appendChild(newElement);
        },
        resetNodeStatus() {
            let self = this;
            self.hasNodeStatus = false;

            document.querySelectorAll('#alert-circle').forEach((svgEl) => {
                svgEl.parentNode.removeChild(svgEl);
            });
            document.querySelectorAll('#checked-circle').forEach((svgEl) => {
                svgEl.parentNode.removeChild(svgEl);
            });
            if (self.nodeStatusInfo['nodeErrId'].length > 0) {
                self.nodeStatusInfo['nodeErrId'].forEach((id) => {
                    let cellErr = self.getCell(id);
                    if (cellErr) {
                        cellErr
                            .findView(self.paper)
                            .el.classList.remove('err-cell');
                        cellErr
                            .findView(self.paper)
                            .el.children[0].classList.remove('err-cell');

                        cellErr.attr(
                            '.symper-widget-image/xlinkHref',
                            cellErr.attributes.attrs['.symper-widget-image']
                                .unHightLightHref
                        );
                        cellErr.attributes.ports.items.forEach((item) => {
                            cellErr.portProp(
                                item.id,
                                'attrs/portBody/fill',
                                self.strokeColerObj[
                                    cellErr.attributes.type.replace('app.', '')
                                ]
                            );
                        });
                        self.getElementPredecessorLinks(cellErr).forEach(
                            (link) => {
                                if (
                                    link
                                        .findView(self.paper)
                                        .el.children[1].classList.contains(
                                            'err-links'
                                        )
                                ) {
                                    link.attr('line/stroke', '#f58634');
                                    link.findView(
                                        self.paper
                                    ).el.children[1].classList.remove(
                                        'err-links'
                                    );
                                }
                            }
                        );

                        self.unHighlightNode(cellErr);
                    }
                });
            }
            if (self.nodeStatusInfo['nodeSuccessId'].length > 0) {
                self.nodeStatusInfo['nodeSuccessId'].forEach((id) => {
                    let cellSuccess = self.getCell(id);
                    if (cellSuccess) {
                        cellSuccess
                            .findView(self.paper)
                            .el.classList.remove('success-cell');
                        cellSuccess
                            .findView(self.paper)
                            .el.children[0].classList.remove('success-cell');
                        self.getElementPredecessorLinks(cellSuccess).forEach(
                            (link) => {
                                if (
                                    link
                                        .findView(self.paper)
                                        .el.children[1].classList.contains(
                                            'success-links'
                                        )
                                ) {
                                    link.attr('line/stroke', '#f58634');
                                    link.findView(
                                        self.paper
                                    ).el.children[1].classList.remove(
                                        'success-links'
                                    );
                                }
                            }
                        );
                        self.unHighlightNode(cellSuccess);
                    }
                });
            }
            self.nodeStatusInfo['nodeErrId'] = [];
            self.nodeStatusInfo['nodeSuccessId'] = [];
        },

        resetViewToDefault() {
            let self = this;
            self.isRunningDataflow = false;
            self.removeClassUnHighLightLink();
            self.getAllNodes().forEach((cell) => {
                if (cell.isElement()) {
                    self.removeClassUnHighlightNode(cell);
                }
            });

            if (self.hasNodeStatus) {
                if (self.nodeStatusInfo['nodeErrId'].length > 0) {
                    self.setNodeErr(self.nodeStatusInfo['nodeErrId']);
                }
                if (self.nodeStatusInfo['nodeSuccessId'].length > 0) {
                    self.setNodeSuccess(self.nodeStatusInfo['nodeSuccessId']);
                }
            }
        },
        getElementPredecessorLinks(el) {
            let graph = this.graph;

            return graph
                .getSubgraph([el, ...graph.getPredecessors(el)])
                .filter((cell) => cell.isLink());
        },
        getElementPredecessorNodes(el) {
            let graph = this.graph;
            return graph
                .getSubgraph([el, ...graph.getPredecessors(el)])
                .filter((cell) => cell.isElement());
        },
        getElementPredecessor(el) {
            let graph = this.graph;

            return graph.getSubgraph([el, ...graph.getPredecessors(el)]);
        },

        runDataflow(currentNode) {
            let self = this;
            if (self.runDataFlowInfo) {
                if (currentNode && self.runDataFlowInfo.id) {
                    self.setRunningTargetNode(self.runDataFlowInfo.id);
                    self.setRunningNode(currentNode);
                }
            }
        },
        addClassHighlightLink(currentLink, mode = '') {
            let self = this;
            let cellView = currentLink.findView(self.paper);
            cellView.el.childNodes[1].classList.add(mode);
        },
        addClassHighlightNode(currentNode, mode = '') {
            let self = this;
            let cellView = currentNode.findView(self.paper);
            cellView.el.childNodes[0].classList.add(mode);
        },
        removeClassUnHighLightLink() {
            let self = this;
            let links = this.getLinks();
            this.$emit('un-high-light-links');
            links.forEach(function (e) {
                let cellView = e.findView(self.paper);
                let link = cellView.el.childNodes[1];
                let linkmodel = cellView.model;
                if (link.classList.contains('select-dataflow-not-done')) {
                    linkmodel.attr('line/stroke', '#f58634');
                    link.classList.remove('select-dataflow-not-done');
                }
                if (link.classList.contains('select-dataflow-done')) {
                    linkmodel.attr('line/stroke', '#f58634');
                    link.classList.remove('select-dataflow-done');
                }
            });
        },
        removeClassUnHighlightNode(currentNode) {
            let self = this;

            if (currentNode) {
                if (currentNode.isElement()) {
                    let cellView = currentNode.findView(self.paper);
                    let node = cellView.el.childNodes[1];

                    if (node.classList.contains('select-dataflow-not-done')) {
                        node.classList.remove('select-dataflow-not-done');
                    }
                    if (node.classList.contains('select-dataflow-done')) {
                        node.classList.remove('select-dataflow-done');
                    }
                }
            }
        },
        setRunningTargetNode(nodeId) {
            let self = this;
            let el = self.getCell(nodeId);
            if (el) {
                let cells = self.getElementPredecessorNodes(el);

                let links = self.getElementPredecessorLinks(el);
                links.forEach((link) => {
                    link.attr('line/stroke', 'rgba(25, 118, 210, 1)');
                    self.addClassHighlightLink(
                        link,
                        'select-dataflow-not-done'
                    );

                    link.toFront();
                });
                cells.forEach((cell) => {
                    self.addClassHighlightNode(
                        cell,
                        'select-dataflow-not-done'
                    );

                    cell.toFront();
                });
            }
        },
        setRunningDataflow() {
            let self = this;
            self.isRunningDataflow = true;
        },
        setRunningNode(nodeId) {
            let self = this;
            let el = self.getCell(nodeId);
            let cells = self.getElementPredecessorNodes(el);
            let links = self.getElementPredecessorLinks(el);
            self.isRunningDataflow = true;
            links.forEach((link) => {
                if (link.attributes.target.id !== nodeId) {
                    link.attr('line/stroke', 'rgba(97, 196, 84, 1)');
                    self.addClassHighlightLink(link, 'select-dataflow-done');
                    link.toFront();
                }
                if (
                    link.attributes.target.id == nodeId &&
                    self.isRunningDataflow == false
                ) {
                    if (link.attributes.source.id) {
                        self.fireTransition(
                            self.getCell(link.attributes.source.id),
                            1,
                            nodeId
                        );

                        link.toFront();
                    }
                    link.attr('line/stroke', 'rgba(25, 118, 210, 1)');
                    self.addClassHighlightLink(
                        link,
                        'select-dataflow-not-done'
                    );
                }
            });
            cells.forEach((cell) => {
                if (
                    cell.id !== nodeId &&
                    cell.attributes.type !== 'standard.Link'
                ) {
                    self.addClassHighlightNode(cell, 'select-dataflow-done');

                    cell.toFront();
                }
                if (cell.id == nodeId) {
                    self.selectionNodeDataFlow = cell;
                    cell.toFront();
                }
            });
            self.addClassHighlightNode(
                self.selectionNodeDataFlow,
                'select-dataflow-not-done'
            );

            // let cellView = self.selectionNodeDataFlow.findView(self.paper);
            // cellView.el.childNodes[1].childNodes[0].classList.add(
            //     'select-dataflow-not-done',
            // );
        },

        fireTransition(t, sec, nodeEndId) {
            let graph = this.graph;
            let paper = this.paper;
            let self = this;
            var outbound = graph.getConnectedLinks(t, { outbound: true });

            var placesAfter = outbound.map(function (link) {
                if (link.getTargetElement().id == nodeEndId) {
                    return link.getTargetElement();
                }
            });

            var isFirable = true;

            if (isFirable) {
                placesAfter.forEach(function (p) {
                    var links = outbound.filter(function (l) {
                        return l.getTargetElement() === p;
                    });
                    links.forEach(function (l) {
                        var token = joint.V('circle', { r: 5, fill: 'blue' });
                        if (l) {
                            setTimeout(() => {
                                l.findView(paper).sendToken(
                                    token,
                                    sec * 1000,
                                    function () {
                                        p.set('tokens', p.get('tokens'));
                                    }
                                );
                            }, 500);
                        }
                    });
                });
            }
        }
    }
};
</script>

<style>
/* .joint-link text {
    fill: rgba(252, 142, 31, 1);
} */
#search-icons {
    position: absolute;
    z-index: 1;
    top: 8px;
    right: 12px;
}
.joint-stencil.joint-theme-default .search{
    border-radius: 4px;
    background-color: rgba(242, 242, 242, 1);
    padding-left: 12px;
    width: 192px;
    height: 28px;
}
.joint-stencil.joint-theme-default .search::placeholder {
    font-size: 12px;
    font-style: 'Regular';
    font-family: 'Roboto';
    line-height: 14px;
}
.joint-stencil .search-wrap {
    position: absolute;
    top: 10px;
    left: 8px;
}
.joint-cell:hover .symper-widget-background,
.symper-widget:hover .symper-widget-background {
    display: block;
}
.joint-cell-in-paper:hover .symper-widget-background,
.symper-widget-background,
.joint-cell-in-paper .symper-widget-sub-label,
.joint-cell-in-paper .symper-widget-desc {
    display: none;
}
.joint-cell-in-paper .symper-widget-label {
    display: block;
}
.snapline.horizontal {
    margin-top: 6px;
    border-top: 1px solid rgba(48, 89, 255, 1) !important;
}
.snapline.vertical {
    border-right: 1px solid rgba(48, 89, 255, 1) !important;
}
.stencil-paper-drag .joint-port:nth-child(odd),
.symper-node-stencil .joint-port:nth-child(odd) {
    transform: translate(30px, 17.5px) !important;
}
.stencil-paper-drag .joint-port:nth-child(even),
.symper-node-stencil .joint-port:nth-child(even) {
    transform: translate(3.5px, 17.5px) !important;
}
.symper-node-stencil .joint-port {
    display: none;
}
.stencil-paper-drag .symper-widget-frame,
.symper-node-stencil .symper-widget-frame {
    height: 35px !important;
    width: 35px !important;
    r: 13 !important;
    cx: 17 !important;
    cy: 17 !important;
}
.joint-stencil.searchable > .content {
    top: 40px;
}
.stencil-paper-drag .symper-widget-image,
.symper-node-stencil .symper-widget-image {
    height: 13px !important;
    width: 13px !important;
    x: 10px;
    y: 11px;
}
.joint-paper.joint-theme-default > svg {
    margin-top: 8px;
}
/* .symper-node-stencil .joint-paper.joint-theme-default
/* .symper-node-stencil .content { */

/* background-color: #f7f7f7 !important; */
/* } */
.joint-stencil {
    z-index: 100;
}

.symper-node-stencil .content {
    overflow-y: scroll;
    padding-top: 5px;
    padding-left: 4px;
}
.selection-wrapper {
    padding-right: 10px;
    padding-bottom: 15px;
}
.symper-node-stencil {
    height: 55px;
}
.symper-dataflow-workspace .joint-paper {
    top: -10px;
    left: -15px;
    height: 55px;
}
.symper-dataflow-workspace .symper-widget .symper-widget-remove {
    height: 15px;
    width: 15px;
    x: 18px;
    y: -12px;
    cursor: pointer;
}
.symper-dataflow-workspace svg {
    cursor: pointer;
}
.symper-dataflow-workspace svg .target-arrowhead {
    fill: transparent;
    stroke: transparent;
}
.symper-dataflow-workspace .embed-dataflow .multipane-resizer,
.embed-dataflow circle {
    display: none;
}

.symper-dataflow-workspace .embed-dataflow .joint-paper-scroller {
    overflow: hidden;
}
.symper-dataflow-workspace .symper-widget-image {
    height: 30px;
    width: 30px;
}
.selection-box {
    opacity: 0 !important;
}
.joint-selection.joint-theme-material .selection-box {
    opacity: 0 !important;
    /* display: none; */
}
/* .joint-element .select-dataflow-not-done {
    stroke: rgba(25, 118, 210, 1);
    stroke-dasharray: 0, 0;
} */
.joint-link .select-dataflow-not-done {
    stroke: rgba(25, 118, 210, 1) !important;
    stroke-dasharray: 0, 0;
}
.joint-selection.joint-theme-material .handle.remove:after {
    color: #717d98 !important;
}
/* .joint-element .select-dataflow-done {
    stroke: rgba(97, 196, 84, 1);
    stroke-dasharray: 0, 0;
    fill: rgb(167, 219, 167);
} */
.joint-link .select-dataflow-done {
    stroke: rgba(97, 196, 84, 1);
    /* fill: rgba(97, 196, 84, 1); */
    stroke-dasharray: 0, 0;
}
.success-links {
    stroke: rgba(97, 196, 84, 1) !important;
    z-index: 5 !important;
}
.err-links {
    stroke: rgba(237, 107, 95, 1) !important;
    z-index: 5 !important;
}
.joint-element .err-cell {
    stroke-dasharray: 0, 0 !important;
}

.joint-stencil.joint-theme-default {
    border: 0px;
    border-right: 1px solid #d3d3d3;
}
.err-cell .symper-widget-node-status-background {
    display: block;
    stroke: rgba(237, 107, 95, 1);
}
.success-cell .symper-widget-node-status-background {
    display: block;
    stroke: rgba(97, 196, 84, 1);
}
.symper-widget-node-status-background {
    display: none;
}
</style>

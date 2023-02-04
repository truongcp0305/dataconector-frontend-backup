<template>
    <joint-paper
        :background="background"
        :grid-size="gridSize"
        :draw-grid="drawGrid"
        @init="setupGraph"
        :readonly="readonly"
        ref="jointPaper"
    />
</template>
<script>
import JointPaper from '@/components/common/rappid/JointPaper';
import {
    createDepartmentNode,
    defineDepartment,
    DEFAULT_DEPARTMENT_DISPLAY,
    FOUCUS_DEPARTMENT_DISPLAY,
    MOUSEENTER_DEPARTMENT_DISPLAY
} from './../nodeDefinition/departmentDefinition';
import {
    createPositionNode,
    definePosition,
    createPositionDepartmentNode,
    DEFAULT_POSITION_DISPLAY,
    FOUCUS_POSITION_DISPLAY,
    MOUSEENTER_POSITION_DISPLAY
} from './../nodeDefinition/positionDefinition';
import {
    SYMPER_HOME_ORGCHART,
    getDefaultConfigNodeData,
    jointLinkNode,
} from './nodeAttrFactory';
import avatarDefault from '@/assets/image/avatar_default.jpg';
import { util } from '../../../plugins/util';
import { appConfigs } from '@/configs';
export default {
    components: {
        JointPaper,
    },
    props: {
        instanceKey: {
            default: '',
        },
        context: {
            default: 'department',
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        id: {
            default: '',
        },
    },
    created() {
        defineDepartment();
        definePosition();
    },
    mounted() {
        this.initDiagramView();
    },
    computed: {
        selectingNode() {
            let workspace = this.$store.state.orgchart.editor[this.instanceKey];
            if (workspace) {
                return workspace.selectingNode;
            } else {
                return getDefaultConfigNodeData();
            }
        },
        mapUserById() {
            return this.$store.state.app.allUsers.reduce((map, user) => {
                map[user.id] = user;
                return map;
            }, {});
        },
    },
    data() {
        return {
            background: {
                color: '#F3F2F1',
            },
            gridSize: 30,
            drawGrid: {
                name: 'mesh',
            },
            viewportRect: null,
            paper: null,
            selectedNode:null,
            paperScroller: null,
            highLightArr:[],
            departmentInfo:{},
            typeView:false,
        };
    },
    methods: {
        resetWrapper() {
            this.$refs.jointPaper.resetWrapper();
        },
        getGraph(){
            return this.$refs.jointPaper.graph
        },
        getCell(id){
            return this.$refs.jointPaper.getCell(id)
        },
        getAllLink(){
            return this.$refs.jointPaper.getAllLinks()
        },
        getAllNode(){
            return this.$refs.jointPaper.getAllNodes()
        },
        getElementPredecessorNodes(el){
            return this.$refs.jointPaper.getElementPredecessorNodes(el)
        },
        addClassHighLight(arr){
            let self= this;
            let paper = this.$refs.jointPaper.paper;
            let graph = this.$refs.jointPaper.graph;
            if(Array.isArray(arr)){
                self.highLightArr.push(...arr)
                arr.forEach(id=>{
                    let cellHighLighted=this.$refs.jointPaper.getCell(id)
                        if(cellHighLighted){
                            cellHighLighted.findView(paper).el.classList.add('cell-highLight')
                            this.paperScroller.center(cellHighLighted.attributes.position.x+100, cellHighLighted.attributes.position.y+100)
                        }
                })
            }
        },
        centerDiagram() {
            setTimeout(
                (self) => {
                    self.handleHeaderAction('zoomToFit');
                },
                200,
                this
            );
        },
        removeClassHighLight(){
            let self= this;
            let paper = this.$refs.jointPaper.paper;
            self.highLightArr.forEach(nodeId=>{
                let nodeClass=this.$refs.jointPaper.getCell(nodeId).findView(paper).el.classList
                if(nodeClass.contains('cell-highLight')){
                    nodeClass.remove('cell-highLight')
                }
            })
            self.highLightArr=[]
        },
        saveSVG() {
            this.$refs.jointPaper.saveSVG();
        },
        handleHeaderAction(action) {
            this.$refs.jointPaper.actionOnToolbar(action);
        },
        loadDiagramFromJson(cells,position='') {
            this.createDepartmentTree();
            let cellsReduce = this.customDepartmentInfor(cells,position);
            let treeLayout = this.$refs.jointPaper.treeLayout;
            this.$refs.jointPaper.graph.fromJSON(cellsReduce);
            treeLayout.layout();
            this.getAllDiagramCells();
            this.reSizeWidthPaper();
            
            
        },
        reSizeWidthPaper() {
            this.$evtBus.$on('collapse-app-sidebar', (closed) => {
                if (!closed) {
                    this.$refs.jointPaper.setWidth(window.innerWidth - 249 - 256 + 'px')
                } else {
                    this.$refs.jointPaper.setWidth(window.innerWidth - 249 - 56 + 'px')
                }
            });
        },
        createDepartmentTree(){
            let orgChartData = this.$store.state.orgchart.orgChartData;
            let orgchartId = this.id;
            let self = this;
            if(orgChartData&&orgChartData[orgchartId]&&orgChartData[orgchartId].departments){
                orgChartData[orgchartId].departments.forEach(function (k) {
                let vizId=k.vizId
                k.child=[]
                orgChartData[orgchartId].departments.forEach(function (department) {
                    if(department.vizParentId==vizId){
                        k.child.push(department)
                    }
                })
                self.departmentInfo[vizId]=k
            })
            }

        },
        calcDepartment(currentNode){
            let self = this;
            if(currentNode.child.length==0||!currentNode.child){
                return 1
            }else if(currentNode.childNum){
                return currentNode.childNum
            }
            else{
                let childNum=0
                currentNode.child.forEach(child=>{
                    childNum+=self.calcDepartment(child)
                })
                currentNode.childNum=childNum;
                return currentNode.childNum;
            }
        },
        calcUser(currentNode,positions=''){
            let self = this;
            let users = typeof (currentNode.users) == 'string' ? JSON.parse(currentNode.users) : currentNode.users
            if(positions!=''){
                if(currentNode.child.length==0||!currentNode.child){
                    let usersNum=0
                    positions.forEach(position=>{
                        if(position.departmentVizId==currentNode.vizId){
                            let users = typeof (position.users) == 'string' ? JSON.parse(position.users) : position.users  
                            usersNum+=users.length;
                        }
                    })
                    return usersNum
                }else{
                    let usersNum=0
                    currentNode.child.forEach(child=>{
                        usersNum+=self.calcUser(child,positions )
                    })
                    return usersNum;
                }
            }
            else{
                if(currentNode.child.length==0||!currentNode.child){
                    return users.length
                }else{
                    let usersNum=0
                    currentNode.child.forEach(child=>{
                        usersNum+=self.calcUser(child)
                    })
                    return usersNum;
                }
            }
        },
        customDepartmentInfor(cells,position='') {
            let orgChartData = this.$store.state.orgchart.orgChartData;
            let orgchartId = this.id;
            let countUser;
            let countDepartment;
            let self = this;
            let cellIdArr=[]
            cells.cells.forEach(function (e) {
                if(e.type!='org.Arrow'){
                    cellIdArr.includes(e.id)?'':cellIdArr.push(e.id)
                }
                if (e.type == 'Symper.Department') {
                    e.attrs['.card'] = {};
                    orgChartData[orgchartId].departments.forEach(function (k) {
                        let vizId=k.vizId
                        if (e.id == vizId) {
                            countDepartment=self.calcDepartment(self.departmentInfo[vizId])
                            if(position!=''){
                                countUser = self.calcUser(self.departmentInfo[vizId],position);
                            }else{
                                countUser = self.calcUser(self.departmentInfo[vizId]);
                                
                            }
                        }
                    });
                    e.markup = e.markup.replace('<text >countUser</text>', `<text class="counUserClass">${countUser}</text>`);
                    e.markup = e.markup.replace(
                        '<text >countDepartment</text>',
                        `<text class="counDepartmentClass">${countDepartment}</text>`,
                    );
                    if(countDepartment==undefined&&countUser==undefined){
                        e.markup = e.markup.replace('countUser', '0');
                        e.markup = e.markup.replace(
                            'countDepartment',
                            '0',
                        );
                    }else{
                        e.markup = e.markup.replace('countUser', `${countUser}`);
                        e.markup = e.markup.replace(
                            'countDepartment',
                            countDepartment,
                        );
                    }
                } else {
                    if (e.attrs['.connection']) {
                        e.attrs['.connection'].stroke = '#B5B5B5';
                    }
                    e.attrs['.connection-wrap'] = { display: 'none' };

                    e.connector = {
                        name: 'rounded',
                        args: {
                            radius: 10,
                        },
                    };
                }
            });
            cells.cells=this.removeLinkWithoutSrouceOrTarget(cells.cells,cellIdArr);
            return cells;
        },
        removeLinkWithoutSrouceOrTarget(cells,nodeIdArr){
            cells=cells.filter(cell=>{
                if(cell.type=="org.Arrow"){
                    return nodeIdArr.includes(cell.target.id)&&nodeIdArr.includes(cell.source.id);
                }else{
                    return true;
                }
            })
            return cells
        },
        getAllDiagramCells() {
            return this.$refs.jointPaper.graph.toJSON();
        },
        updateCellAttrs(cellId, attrName, value) {
            let mapName = {
                name: '.name/text',
                border: '.card',
                managerName: '.manager-name/text',
                managerEmail: '.manager-email/text',
                managerAvartar: 'image/xlink:href',
                userInPositionAvartar: 'image/xlink:href',
                accountNumberPlus: '.account-number-plus/text',
                positionCode: '.position-code/text',
                lastDynamicAttr: '.dynamic-attr-value/text',
                highlight: '.border-bottom/fill',
            };
            let cell = this.getCell(cellId);
            if (cell && mapName[attrName]) {
                if (typeof value == 'object') {
                    for (let key in value) {
                        cell.attr(mapName[attrName] + '/' + key, value[key]);
                    }
                } else {
                    let imgurl =
                        appConfigs.apiDomain.fileManagement +
                        'user-avatar?userId=';
                    if (value.includes(imgurl)) {
                        cell.attr(mapName[attrName], value);
                    } else {
                        if (attrName == 'name') {
                            let newValue = joint.util.breakText(
                                value,
                                {
                                    width: 165,
                                    height: 20,
                                },
                                { 'font-size': 13 },
                                { ellipsis: true },
                            );
                            cell.attr(mapName[attrName], newValue);
                        } else if (value) {
                            let newValue = joint.util.breakText(
                                value,
                                {
                                    width: 160,
                                    height: 20,
                                },
                                { 'font-size': 13 },
                                { ellipsis: true },
                            );
                            cell.attr(mapName[attrName], newValue);
                        }
                    }
                }
            }
        },
        
        listenPaperEvent() {
            let paper = this.$refs.jointPaper.paper;
            let graph = this.$refs.jointPaper.graph;
            let keyboard = this.$refs.jointPaper.keyboard;
            let commandManager = this.$refs.jointPaper.commandManager;
            let treeLayout = this.$refs.jointPaper.treeLayout;
            let self = this;
            keyboard.on('keydown:ctrl+z', (evt) => {
                // commandManager.undo();
            });
            keyboard.on('keydown:ctrl+y', (evt) => {
                // commandManager.redo();
            });
            paper.on('cell:pointerclick', function (elementView, evt, x, y) {
                evt.stopPropagation();
                if (
                    elementView.model.isElement() &&
                    elementView.model?.attributes?.size?.height > 50
                ) {
                    self.$emit('cell-clicked', elementView.model.id);
                } else {
                    self.$emit('blank-paper-clicked');
                }
                this.selectedNode=elementView.model
                self.unHighlightCurrentNode();
                self.$store.commit(
                    'orgchart/updateCurrentChildrenNodeId',
                    elementView.model.id,
                );
                self.highlightNode(elementView.model,true);
            });
            paper.on('blank:mousewheel', (evt, ox, oy, delta) => {
                if (evt.ctrlKey) {
                    evt.preventDefault();
                    self.$refs.jointPaper.zoom(ox, oy, delta,this.paperScroller);
                }
            });
            graph.on('add', function (cell, collection, opt) {
                if (cell.isElement()) {
                } else {
                    if(!cell.attributes.attrs){
                        cell.attributes.attrs={}
                    }
                    cell.attributes.attrs['.connection-wrap'] = {
                        display: 'none',
                    };
                    
                    cell.attributes.attrs['.connection'] = {
                        'stroke-width': 1 ,
                        stroke:'#B5B5B5'
                    };
                    cell.attributes.z='-1'
                    cell.attributes.target['selector']=".card"
                    cell.attributes.source['selector']=".card"
                    cell.connector('rounded', {
                        radius: 10,
                    });
                }
            });
            paper.on('cell:mousewheel', (_, evt, ox, oy, delta) => {
                if (evt.ctrlKey) {
                    evt.preventDefault();
                    self.$refs.jointPaper.zoom(ox, oy, delta,this.paperScroller);
                }
            });
            paper.on('element:remove', function (elementView, evt, x, y) {
                evt.stopPropagation();
                let allChildIds = self.getAllChildIdOfNode(
                    elementView.model.id,
                );
                for (let idCell of allChildIds) {
                    let cell = self.$refs.jointPaper.graph.getCell(idCell);
                    cell.remove();
                }
                // A member removal
                treeLayout.layout();
                self.$emit('delete-node');
            });
            paper.on('element:mouseenter', function (elementView, evt, x, y) {
                self.highlightNode(elementView.model);
                elementView.el.classList.add('is-hover');
            });
            paper.on('element:mouseleave', function (elementView, evt, x, y) {
                self.unHighlightNode(elementView.model);
                if (elementView.el.classList.contains('is-hover')) {
                    elementView.el.classList.remove('is-hover');
                }
            });
            paper.on('element:view', function (elementView, evt, x, y) {
                setTimeout(function () {
                    self.$emit('cell-contextmenu', elementView.model.id);
                }, 300);
            });
            paper.on('link:mouseenter', function (linkView) {});

            paper.on('element:add', function (elementView, evt) {
                evt.stopPropagation();
                let countDepartment =
                    graph.getCells().filter((el) => {
                        return el.attributes.type != 'org.Arrow';
                    }).length + 1;
                let name =
                    self.context == 'department'
                        ? self.$t('orgchart.editor.department')
                        : self.$t('orgchart.editor.position');
                name += ' ' + countDepartment;
                let PositionRank = self.$t('v2.orgchart.positionCode');
                let departmentEmail = self.$t('v2.orgchart.mail');
                let departmentName = self.$t('v2.orgchart.manager');
                // Adding a new member
                let newNode;
                if (self.context == 'department') {
                    newNode = createDepartmentNode(
                        name,
                        departmentName,
                        departmentEmail,
                    );
                } else {
                    name = self.$t('v2.orgchart.positionName');
                    newNode = createPositionNode(name, PositionRank, {
                        attrs: {
                            '.department>rect': { display: 'none' },
                        },
                    });
                }
                var newConnection = jointLinkNode(elementView.model, newNode);
                newNode.attributes.markup = newNode.attributes.markup.replace(
                    'countUser',
                    '0',
                );
                newNode.attributes.markup = newNode.attributes.markup.replace(
                    'countDepartment',
                    ' 0',
                );
                graph.addCells([newNode, newConnection]);
                if(self.typeView){
                    self.getCell(newNode.attributes.id).set('direction', self.typeView);
                }
                treeLayout.layout();
                self.$emit('new-viz-cell-added', {
                    id: newNode.id,
                    name: name,
                });
            });

            paper.on('element:delete', function (elementView, evt, x, y) {
                evt.stopPropagation();
                if(elementView.model.id==this.selectedNode.id){
                    this.selectedNode=null
                }
                elementView.model.remove();
                treeLayout.layout();
            });

            paper.on('blank:pointerclick', function (elementView, evt, x, y) {
                self.unHighlightCurrentNode();
                this.selectedNode=null
                self.$emit('blank-paper-clicked');
            });

            paper.on('cell:contextmenu', function (elementView, evt, x, y) {
                self.$emit('cell-contextmenu', elementView.model.id);
            });

            paper.on('element:collapse', function (view, evt) {
                evt.stopPropagation();
                self.toggleBranch(view.model);
            });
        },
        toggleBranch(root) {
            let self = this;
            var shouldHide = !root.isCollapsed();
            root.set({ collapsed: shouldHide });
            this.$refs.jointPaper.graph
                .getSuccessors(root)
                .forEach(function (successor) {
                    successor.set({
                        hidden: shouldHide,
                        collapsed: false,
                    });
                });
            let treeLayout = this.$refs.jointPaper.treeLayout;
            treeLayout.layout();
            
        },
        layoutAndFocus(focusPoint) {
            let treeLayout = this.$refs.jointPaper.treeLayout;
            treeLayout.layout();
            var center = treeLayout.getLayoutBBox().center();
            this.resizePaper();
            this.paperScroller.center(center.x, center.y);
        },
        resizePaper() {
            let treeLayout = this.$refs.jointPaper.treeLayout;
            this.paper.fitToContent({
                useModelGeometry: true,
                allowNewOrigin: 'any',
                padding: 30,
                contentArea: treeLayout.getLayoutBBox(),
            });
        },
        getAllElementModel() {
            return this.$refs.jointPaper.graph.getCells();
        },
        getAllNode() {
            return this.$refs.jointPaper.graph.getCells().filter((el) => {
                return el.attributes.type != 'org.Arrow';
            });
        },
        getAllLink() {
            return this.$refs.jointPaper.graph.getCells().filter((el) => {
                return el.attributes.type == 'org.Arrow';
            });
        },
        getAllChildIdOfNode(nodeId) {
            let allCell = this.$refs.jointPaper.graph.getCells();
            let mapNode = {};
            let links = [];
            for (let cell of allCell) {
                if (cell.attributes.type == 'org.Arrow') {
                    links.push({
                        source: cell.attributes.source.id,
                        target: cell.attributes.target.id,
                    });
                } else {
                    mapNode[cell.attributes.id] = {
                        children: {},
                        parent: {},
                    };
                }
            }

            for (let l of links) {
                mapNode[l.source].children[l.target] = true;
                mapNode[l.target].parent[l.source] = true;
            }
            let childIds = {};
            this.appendChildToNode(childIds, mapNode, nodeId);
            return Object.keys(childIds);
        },

        appendChildToNode(result, mapNode, currentNodeId) {
            result[currentNodeId] = true;
            for (let childId in mapNode[currentNodeId].children) {
                this.appendChildToNode(result, mapNode, childId);
            }
        },
        unHighlightNode(nodeModel,) {
            if(this.selectingNode?.id!==nodeModel.id){
                let displayConfig =
                this.context == 'department'
                    ? DEFAULT_DEPARTMENT_DISPLAY
                    : DEFAULT_POSITION_DISPLAY;
            this.updateCellAttrs(nodeModel.id, 'border', displayConfig);
            }else{
                let displayConfig =
                this.context == 'department'
                    ? FOUCUS_DEPARTMENT_DISPLAY
                    : FOUCUS_POSITION_DISPLAY;
            this.updateCellAttrs(nodeModel.id, 'border', displayConfig);
            }
        },
        unHighlightCurrentNode() {
            let displayConfig =
                this.context == 'department'
                    ? DEFAULT_DEPARTMENT_DISPLAY
                    : DEFAULT_POSITION_DISPLAY;
            if (
                this.selectingNode &&
                this.selectingNode.id &&
                this.selectingNode.id != SYMPER_HOME_ORGCHART
            ) {
                this.updateCellAttrs(
                    this.selectingNode.id,
                    'border',
                    displayConfig,
                );
            }
        },
        highlightNode(nodeModel = null,pointerclick=false) {
            let displayConfig =
                this.context == 'department'
                    ? FOUCUS_DEPARTMENT_DISPLAY
                    : FOUCUS_POSITION_DISPLAY;
            if(!pointerclick||this.selectedNode?.id ==nodeModel.id){
                displayConfig =
                this.context == 'department'
                    ? MOUSEENTER_DEPARTMENT_DISPLAY
                    : MOUSEENTER_POSITION_DISPLAY;
            }
            if (nodeModel == null) {
                if (
                    this.selectingNode &&
                    this.selectingNode.id &&
                    this.selectingNode.id != SYMPER_HOME_ORGCHART
                ) {
                    this.updateCellAttrs(
                        this.selectingNode.id,
                        'border',
                        displayConfig,
                    );
                }
            } else {
                this.updateCellAttrs(nodeModel.id, 'border', displayConfig);
            }
        },

        getRightDepartmentNodeAttr(departmentNode) {
            departmentNode.attributes.position.y =
                departmentNode.attributes.position.y - 150;
            departmentNode.attributes.size = { height: 46, width: 250 };
            departmentNode.attributes.markup =
                departmentNode.attributes.markup.replace(
                    '<g class="role-img-container"> <image class="img-background-left" /> <image class="role-img-left" /> <image class="img-background-center" /> <image class="role-img-center" /> <image class="img-background-right" /> <image class="role-img-right" /> <text class="countRoleImg"></text> </g>',
                    '',
                );
            departmentNode.attributes.markup =
                departmentNode.attributes.markup.replace(
                    ' <g class="btn add orgchart-action"> <rect class="add transparent-background" /> <path class="line-action" d="M9.375 4.97168H5.625V1.22168C5.625 1.05592 5.55915 0.896948 5.44194 0.779738C5.32473 0.662528 5.16576 0.59668 5 0.59668C4.83424 0.59668 4.67527 0.662528 4.55806 0.779738C4.44085 0.896948 4.375 1.05592 4.375 1.22168V4.97168H0.625C0.45924 4.97168 0.300269 5.03753 0.183058 5.15474C0.0658481 5.27195 0 5.43092 0 5.59668C0 5.76244 0.0658481 5.92141 0.183058 6.03862C0.300269 6.15583 0.45924 6.22168 0.625 6.22168H4.375V9.97168C4.375 10.1374 4.44085 10.2964 4.55806 10.4136C4.67527 10.5308 4.83424 10.5967 5 10.5967C5.16576 10.5967 5.32473 10.5308 5.44194 10.4136C5.55915 10.2964 5.625 10.1374 5.625 9.97168V6.22168H9.375C9.54076 6.22168 9.69973 6.15583 9.81694 6.03862C9.93415 5.92141 10 5.76244 10 5.59668C10 5.43092 9.93415 5.27195 9.81694 5.15474C9.69973 5.03753 9.54076 4.97168 9.375 4.97168Z" fill="#61C454"/> </g> ',
                    '',
                );
            departmentNode.attributes.markup =
                departmentNode.attributes.markup.replace(
                    '<g class="btn remove orgchart-action"> <rect class="remove transparent-background-position" /> <path class="line-action" d="M4.93909 4.59554L7.80299 1.7383C7.92841 1.61289 7.99886 1.44279 7.99886 1.26543C7.99886 1.08806 7.92841 0.917966 7.80299 0.792552C7.67758 0.667137 7.50748 0.59668 7.33012 0.59668C7.15275 0.59668 6.98265 0.667137 6.85724 0.792552L4 3.65645L1.14276 0.792552C1.01735 0.667137 0.847248 0.59668 0.669885 0.59668C0.492522 0.59668 0.322423 0.667137 0.197008 0.792552C0.0715939 0.917966 0.00113664 1.08806 0.00113664 1.26543C0.00113663 1.44279 0.0715939 1.61289 0.197008 1.7383L3.06091 4.59554L0.197008 7.45278C0.134583 7.5147 0.085035 7.58836 0.0512219 7.66952C0.0174088 7.75068 0 7.83773 0 7.92566C0 8.01358 0.0174088 8.10063 0.0512219 8.18179C0.085035 8.26296 0.134583 8.33662 0.197008 8.39853C0.258924 8.46096 0.332587 8.51051 0.413748 8.54432C0.494909 8.57813 0.581962 8.59554 0.669885 8.59554C0.757808 8.59554 0.844861 8.57813 0.926022 8.54432C1.00718 8.51051 1.08085 8.46096 1.14276 8.39853L4 5.53464L6.85724 8.39853C6.91915 8.46096 6.99282 8.51051 7.07398 8.54432C7.15514 8.57813 7.24219 8.59554 7.33012 8.59554C7.41804 8.59554 7.50509 8.57813 7.58625 8.54432C7.66741 8.51051 7.74108 8.46096 7.80299 8.39853C7.86542 8.33662 7.91497 8.26296 7.94878 8.18179C7.98259 8.10063 8 8.01358 8 7.92566C8 7.83773 7.98259 7.75068 7.94878 7.66952C7.91497 7.58836 7.86542 7.5147 7.80299 7.45278L4.93909 4.59554Z" fill="#FF2020"/> </g> ',
                    '',
                );
            departmentNode.attributes.markup =
                departmentNode.attributes.markup.replace(
                    '<g class="btn-container"> <rect class="btn-container-background"/> <rect class="btn-container-transparent-back"/> </g> ',
                    '',
                );
            return departmentNode;
        },
        createFirstVizNode(dataNode = null) {
            let nodeName =
                this.context == 'department'
                    ? this.$t('orgchart.editor.department')
                    : this.$t('orgchart.editor.position');
            nodeName += ' 1';
            if (!(this.context == 'department')) {
                nodeName = this.$t('v2.orgchart.positionName');
            }
            let PositionRank = this.$t('v2.orgchart.positionCode');
            let firstNode =
                this.context == 'department'
                    ? createDepartmentNode(nodeName)
                    : createPositionNode(nodeName, PositionRank, {
                          attrs: {
                              '.department>rect': { display: 'none' },
                          },
                          
                      });
            if(this.context == 'department'){
                firstNode.attributes.markup = firstNode.attributes.markup.replace('countUser', `0`);
                firstNode.attributes.markup = firstNode.attributes.markup.replace(
                    'countDepartment',
                    '0',
                );
            }
            firstNode.attributes.position={y:0,x:0}
            let firstDepartmentNode=createPositionDepartmentNode(this.$t('v2.orgchart.roleName'),{})
            firstDepartmentNode.attributes.size= {
                    width: 250,
                    height: 46,
                },
            firstDepartmentNode.attributes.position={y:-100,x:0}
            
            firstDepartmentNode.attributes.markup='<g class="rotatable "> <g class="symper-orgchart-node"> <g class="scalable"> <rect class="card"/> </g> <text class="departmentName"/><g class="department"><rect class=" department-child"/><text class="departmentText department-child "/></g><g class="btn-collapse-expand-hor"> <circle class="buttonSign"/> <text class="buttonSign"></text> </g> <g class="btn-collapse-expand-ver"> <circle class="buttonSign"/> <text class="buttonSign"></text> </g>  </g></g>'
            firstDepartmentNode.id=firstNode.id+ 'Symper_Department_Host'
            firstDepartmentNode.attributes.attrs['.position-code']= firstNode.attributes.attrs['.position-code'] + 'Symper_Department_Host',
            firstDepartmentNode.attributes.id=firstNode.id+ 'Symper_Department_Host'
            let departmentLine = {
                attrs: {
                    '.connection': { 'stroke-width': 1 },
                    '.marker-arrowheads': {
                        display: 'none',
                    },
                    label: { text: this.$t('v2.orgchart.lineText') },
                },
                connector :{
                        name: 'rounded',
                        args: {
                            radius: 10,
                        },
                },
                source: {
                    id: firstNode.id+ 'Symper_Department_Host',
                },
                name: false,
                target: {
                    id: firstNode.id,
                },
                type: 'org.Arrow',
                z: '-1',
            };
            
            if(this.context == 'department'){
                this.$refs.jointPaper.graph.resetCells([firstNode]);
            }else{
                
                this.$refs.jointPaper.graph.resetCells([firstNode]);
            }
            let data = {
                id: firstNode.id,
                name: nodeName,
                autoCreateFirstNode: true,
            };
            this.$emit('new-viz-cell-added', data);
            return data;
        },
        changeUserDisplayInNode(userIdList) {
            let lastUserInfo =
                this.mapUserById[userIdList[userIdList.length - 1]];
            let avatarUser =
                appConfigs.apiDomain.fileManagement +
                'user-avatar?userId=' +
                lastUserInfo.id;
            if (this.context == 'department') {
                if (!lastUserInfo) return;
                this.updateCellAttrs(
                    this.selectingNode.id,
                    'managerName',
                    lastUserInfo.displayName,
                );
                this.updateCellAttrs(
                    this.selectingNode.id,
                    'managerEmail',
                    lastUserInfo.email,
                );
                this.updateCellAttrs(
                    this.selectingNode.id,
                    'managerAvartar',
                    avatarUser,
                );
            } else if (
                this.context == 'position' &&
                this.selectingNode.id != 'SYMPER_HOME_ORGCHART'
            ) {
                if (userIdList.length == 0) {
                    this.updateCellAttrs(
                        this.selectingNode.id,
                        'userInPositionAvartar',
                        avatarUser,
                    );
                    this.updateCellAttrs(
                        this.selectingNode.id,
                        'accountNumberPlus',
                        '',
                    );
                } else {
                    if (!lastUserInfo) return;
                    this.updateCellAttrs(
                        this.selectingNode.id,
                        'userInPositionAvartar',
                        avatarUser,
                    );
                    let plusUser =
                        userIdList.length == 1
                            ? ''
                            : '+' + (userIdList.length - 1);
                    this.updateCellAttrs(
                        this.selectingNode.id,
                        'accountNumberPlus',
                        plusUser,
                    );
                }
            }
        },
        setupGraph(graph, paper, paperScroller, viewportRect) {
            this.viewportRect = viewportRect;
            this.paper = paper;
            this.paperScroller = paperScroller;
            this.graph = graph;
            let self = this;
            let nodeName =
                this.context == 'department'
                    ? this.$t('orgchart.editor.department')
                    : this.$t('orgchart.editor.position');
            nodeName += ' 1';
            let firstNode =
                this.context == 'department'
                    ? createDepartmentNode(nodeName)
                    : createPositionNode(nodeName);
            var treeLayout = new joint.layout.TreeLayout({
                graph: graph,
                direction: 'B',
                parentGap: 40,
                siblingGap: 50,
                filter: function (siblings) {
                    // Layout will skip elements which have been collapsed
                    let rsl = siblings.filter(function (sibling) {
                        return !sibling.isHidden();
                    });
                    return rsl;
                },
                updateAttributes: function (_, model) {
                    // Update some presentation attributes during the layout
                    model.toggleButtonVisibility(!graph.isSink(model));
                    model.toggleButtonSign(!model.isCollapsed());
                },
            });
            this.treeLayout = treeLayout;
            this.$refs.jointPaper.treeLayout = treeLayout;
            firstNode.attributes.markup = firstNode.attributes.markup.replace('countUser', `0`);
            firstNode.attributes.markup = firstNode.attributes.markup.replace(
                'countDepartment',
                '0',
            );
            graph.resetCells([firstNode]);
            this.repositionFirstCell(graph, paperScroller);
            treeLayout.layout();
            this.listenPaperEvent();
            new joint.ui.TreeLayoutView({
                paper: paper,
                model: treeLayout,
                previewAttrs: {
                    parent: { rx: 10, ry: 10 },
                },
            });

            self.$emit('new-viz-cell-added', {
                id: firstNode.id,
                name: nodeName,
            });
            self.scrollPaperToTop();
        },
        scrollPaperToTop(time = 1000) {
            setTimeout(
                (self) => {
                    let viewPort = $(self.$refs.jointPaper.$el).find(
                        '.symper-orgchart-paper>.joint-paper-scroller',
                    );
                    let view = $(self.$refs.jointPaper.$el).find(
                        '.symper-orgchart-paper>.joint-paper-scroller>.paper-scroller-background>.joint-paper',
                    );
                    $(viewPort).scrollTop($(view).position().top);
                },
                time,
                this,
            );
        },
        repositionFirstCell(graph, paperScroller) {
            let firstNode = graph.getCells()[0];
            firstNode.position(300, 20);
        },
        changeTypeView(type) {
            let treeLayout = this.$refs.jointPaper.treeLayout;
            this.getAllNode().forEach(node=>{
                node.set('direction', type);
            })
            this.typeView=type
            treeLayout.layout();
        },
        exampleSetupGraph(graph) {},
        initDiagramView() {},
    },
    watch: {},
};
</script>

<style>
.symper-orgchart-node .btn-container {
    display: none;
}
.symper-orgchart-node .btn.view path,
.symper-orgchart-node .btn.view rect,
.symper-orgchart-node .btn.add path,
.symper-orgchart-node .btn.add rect,
.symper-orgchart-node .btn.remove path,
.symper-orgchart-node .btn.remove rect {
    display: none;
}
.is-hover .btn-container,
.is-hover .btn.view path,
.is-hover .btn.add path,
.is-hover .btn.remove path,
.is-hover .btn.view rect,
.is-hover .btn.add rect,
.is-hover .btn.remove rect {
    display: inline-block;
}
.symper-orgchart-node .btn.view:hover .transparent-background,
.symper-orgchart-node .btn.remove:hover .transparent-background,
.symper-orgchart-node .btn.remove:hover .transparent-background-position,
.symper-orgchart-node .btn.add:hover .transparent-background {
    fill: #f2f2f2;
}
.cell-highLight.joint-cell .card{
    stroke: #61C454;
    stroke-width: 1px;
}
.symper-orgchart-node .view.transparent-background {
    transform: matrix(1, 0, 0, 1, -3.5, -5);
    fill: transparent;
}
.symper-orgchart-node .add.transparent-background {
    transform: matrix(1, 0, 0, 1, -5, -5.5);
    fill: transparent;
}
.symper-orgchart-node .remove.transparent-background-position {
    transform: matrix(1, 0, 0, 1, -5, -5.5);
    fill: transparent;
}
.symper-orgchart-node .remove.transparent-background {
    transform: matrix(1, 0, 0, 1, -6, -5.5);
    fill: transparent;
}
.name {
    text-transform: uppercase !important;
}
.view:hover {
    border-bottom: 1px solid black;
}
</style>

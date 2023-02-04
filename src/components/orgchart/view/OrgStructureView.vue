<template>
    <div class="h-100 w-100 symper-orgchart-view">
        <EditorWorkspace
            ref="editorWorkspace"
            class="h-100"
            :context="'position'"
        >
        </EditorWorkspace>
    </div>
</template>

<script>
import EditorWorkspace from '@/components/orgchart/editor/EditorWorkspace.vue';
import { jointLinkNode } from '../editor/nodeAttrFactory';
import { createPositionNode } from '../nodeDefinition/positionDefinition';

export default {
    components: {
        EditorWorkspace,
    },
    props: {
        mapDpmToPos: {
            default() {
                return {};
            },
        },
        allDepartments: {
            default() {
                return [];
            },
        },
        allPositions: {
            default() {
                return [];
            },
        },
    },
    methods: {
        reDrawDiagram() {
            let rootAndLeavesPosInDpm = {};

            // Tìm root và leaves của các position trong một department
            for (let dpmId in this.mapDpmToPos) {
                let poses = this.mapDpmToPos[dpmId];
                let rnl = this.findRootAndLaves(poses);
                rootAndLeavesPosInDpm[dpmId] = {
                    root: rnl.root,
                    leaves: rnl.leaves,
                };
            }

            // Lọc ra tất cả các position và link
            let allPositions = {};
            let allLinks = [];

            for (let dpm of this.allDepartments) {
                let positions = [];
                let nodesAndLinks = this.filterNodeInListCells(dpm.content);
                // allPositions = allPositions.concat(nodesAndLinks.nodes);
                allPositions = Object.assign(allPositions, nodesAndLinks.nodes);
                for (let linkId in nodesAndLinks.links) {
                    let link = nodesAndLinks.links[linkId];
                    allLinks.push({
                        source: allPositions[link.source.id],
                        target: allPositions[link.target.id],
                    });
                }
            }

            // Nối các position root của department con với các leaves của department cha
            let lazyAddLink = [];
            let tmpNode;
            let connectedNodeIds = {};

            for (let dpm of this.allDepartments) {
                if (dpm.vizParentId) {
                    let childDpmRoots = rootAndLeavesPosInDpm[dpm.vizId].root;
                    let parentDpmLeaves =
                        rootAndLeavesPosInDpm[dpm.vizParentId].leaves;

                    for (let idRoot in childDpmRoots) {
                        for (let idLeave in parentDpmLeaves) {
                            tmpNode = {
                                source: allPositions[idLeave],
                                target: allPositions[idRoot],
                            };
                            if (!connectedNodeIds[idRoot]) {
                                allLinks.push(tmpNode);
                                connectedNodeIds[idRoot] = true;
                            } else {
                                lazyAddLink.push(tmpNode);
                            }
                        }
                    }

                    // for(let idRoot in childDpmRoots){
                    //     let flag = true;
                    //     for(let idLeave in parentDpmLeaves){
                    //         tmpNode = {
                    //             source: allPositions[idLeave],
                    //             target: allPositions[idRoot]
                    //         };
                    //         if(flag){
                    //             allLinks.push(tmpNode);
                    //             flag = false;
                    //         }else{
                    //             lazyAddLink.push(tmpNode);
                    //         }
                    //     }
                    // }
                }
            }

            // Tạo các đối tượng cho position và link trong jointjs
            let allCells = [];
            for (let idNode in allPositions) {
                let nodeAttr = allPositions[idNode];
                let newNode = createPositionNode(nodeAttr.name, nodeAttr);
                allCells.push(newNode);
            }

            for (let linkData of allLinks) {
                let link = jointLinkNode(linkData.source, linkData.target);
                allCells.push(link);
            }
            this.$refs.editorWorkspace.graph.resetCells(allCells);
            this.$refs.editorWorkspace.treeLayout.layout();

            let lazyCells = [];
            for (let l of lazyAddLink) {
                lazyCells.push(jointLinkNode(l.source, l.target));
            }

            //Dòng dưới chạy nhưng chưa đúng với thiết kế, cần nghĩ ra giải pháp khác để tự vẽ link
            // this.$refs.editorWorkspace.graph.addCells(lazyCells);
            this.addLazyLink(lazyCells);
        },
        addLazyLink(lazyCells) {
            for (let link of lazyCells) {
                let sAttr = this.getCellSizeAndPosition(
                    link.attributes.source.id,
                );
                let tAttr = this.getCellSizeAndPosition(
                    link.attributes.target.id,
                );
                let vertices = [
                    {
                        x: sAttr.p.x + sAttr.s.width / 2,
                        y: tAttr.p.y - 20,
                    },
                    {
                        x: tAttr.p.x + tAttr.s.width / 2,
                        y: tAttr.p.y - 20,
                    },
                ];
                link.prop('vertices', vertices);
            }
            this.$refs.editorWorkspace.graph.addCells(lazyCells);
        },
        getCellSizeAndPosition(cellId) {
            let cell = this.$refs.editorWorkspace.graph.getCell(cellId);
            return {
                s: cell.attributes.size,
                p: cell.attributes.position,
            };
        },
        filterNodeInListCells(content) {
            let rsl = {
                nodes: {},
                links: {},
            };
            try {
                let allCells = content;
                if (typeof content == 'string') {
                    allCells = JSON.parse(content);
                }

                for (let cell of allCells.cells) {
                    if (cell.type != 'org.Arrow') {
                        delete cell.position;
                        delete cell.markup;
                        // rsl.nodes.push(cell);
                        rsl.nodes[cell.id] = cell;
                    } else {
                        rsl.links[cell.id] = cell;
                        // rsl.links.push(cell);
                    }
                }
            } catch (error) {
                console.warn(error, this.$('v2.orgchart.errorWhenFilterNodeInListCells'));
            }
            return rsl;
        },
        findRootAndLaves(positions) {
            let rsl = {
                root: {},
                leaves: {},
            };
            for (let posId in positions) {
                let pos = positions[posId];
                let parentId = pos.vizParentId;

                // nếu parent là phòng ban, thì là root
                if (this.mapDpmToPos[parentId]) {
                    rsl.root[pos.vizId] = pos;
                } else {
                    if (!positions[parentId].leaves) {
                        positions[parentId].children = {};
                    }
                    positions[parentId].children[posId] = pos;
                }
            }

            for (let posId in positions) {
                if (!positions[posId].children) {
                    rsl.leaves[posId] = positions[posId];
                }
            }

            return rsl;
        },
    },
};
</script>

<style></style>

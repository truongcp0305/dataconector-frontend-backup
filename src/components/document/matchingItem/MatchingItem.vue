<template>
    <div
        class="d-flex w-100 matching-item-target-table"
        style="height: calc(100% - 75px)"
    >
        <div
            class="h-100 source-tables pr-2 pl-4 border-right-1"
            style="width: 50%; overflow: auto"
        >
            <div class="fs-15 font-weight-medium mb-2" style="color: #fb7e00">
                {{ data.nameSourceArea ? data.nameSourceArea : $t('v2.doc.dataTable') }}
            </div>
            <source-table
                @grid-ready="handleSourceTableReady"
                v-for="(item, id) in data.sourceTables"
                :key="id"
                :id="id"
                :config="item"
                class="mb-3"
                style="height: 250px"
                ref="sourceTb"
            />
        </div>
        <div
            class="h-100 target-table pl-2 pr-4 position-relative"
            style="width: 50%"
        >
            <div class="fs-15 font-weight-medium mb-2" style="color: #fb7e00">
                {{
                    data.nameTargetAndResultArea
                        ? data.nameTargetAndResultArea
                        : $t('v2.doc.distributionTable')
                }}
            </div>
            <target-table
                :config="data.targetAndResultTable"
                :sourceTables="data.sourceTables"
                :title="data.nameTargetAndResultArea"
                :formulaUpdate="data.formulaUpdate"
                :formulaValidate="data.formulaValidate"
                :isDuplicateData="data.isDuplicateData"
                ref="targetTable"
                @grid-ready="handleTargetTableReady"
                @reset-all-table="resetAllTable"
                @return-items-to-source-tables="handleReturnItemsToSource"
            />
            <div
                ref="fixedDropArea"
                class="fixed-drop-area position-absolute text-center"
                style="
                    width: calc(100% - 26px);
                    height: 39px;
                    left: 9px;
                    bottom: 14px;
                    background-color: #f7f7f7;
                    line-height: 39px;
                    font-size: 13px;
                    color: #6d6d6d;
                    transition: all 0.3s ease 0s;
                "
            >
                {{$t('v2.doc.dragHereToAddData')}}
            </div>
        </div>
    </div>
</template>

<script>
import MatchingItemSourceTable from './MatchingItemSourceTable.vue';
import MatchingItemTargetTable from './MatchingItemTargetTable.vue';
import _cloneDeep from 'lodash/cloneDeep';

export default {
    created() {
        this.mapSourceTablesGridOpts = {};
        this.targetTableGridOpt = null;
    },
    methods: {
        resetAllTable() {
            for (const stb of this.$refs.sourceTb) {
                stb.getDataFromConfig();
                stb.resetSearchValue();
            }
            this.targetTableGridOpt.api.setRowData([]);
        },
        handleReturnItemsToSource(data) {
            for (let tbId in data) {
                this.mapSourceTablesGridOpts[tbId].api.applyTransaction({
                    add: data[tbId]
                });
            }
        },
        handleTargetTableReady(gridOption) {
            this.targetTableGridOpt = gridOption;
            this.checkAndAddDropZone();
            this.setDataFromDoc()
        },
        setDataFromDoc(rowData = null){
            if(this.$refs.targetTable){
                rowData = rowData ? _cloneDeep(rowData) : _cloneDeep(this.rowData);
                this.$refs.targetTable.setDataFromDoc(rowData);
            }
        },
        handleSourceTableReady(data) {
            this.mapSourceTablesGridOpts[data.id] = data.option;
            this.checkAndAddDropZone();
        },
        checkAndAddDropZone() {
            if (
                this.targetTableGridOpt &&
                Object.keys(this.mapSourceTablesGridOpts).length ==
                    Object.keys(this.data.sourceTables).length
            ) {
                let targetTableOption = this.targetTableGridOpt;
                let self = this;

                for (let tbId in this.mapSourceTablesGridOpts) {
                    let sourceParam = this.mapSourceTablesGridOpts[tbId];
                    let dropZoneParams =
                        targetTableOption.api.getRowDropZoneParams({
                            onDragging: (event) => {
                                self.setPotentialParentForNode(tbId, event);
                            },
                            onDragLeave: (event) => {
                                self.$refs.targetTable.clearHighlightPotentialNodes();
                            },
                            onDragEnter: (event) => {},
                            onDragStop: (dropParams) => {
                                self.handleDrogRowsToTarget(tbId, dropParams);
                                self.$refs.targetTable.clearHighlightPotentialNodes();
                            }
                        });
                    sourceParam.api.addRowDropZone(dropZoneParams);
                    self.addDropzoneToFixArea(tbId, sourceParam);
                }
            }
        },
        setPotentialParentForNode(sourceId, event) {
            if (this.debouceHighlightPotentialDropNode) {
                clearTimeout(this.debouceHighlightPotentialDropNode);
            }
            this.debouceHighlightPotentialDropNode = setTimeout(() => {
                this.$refs.targetTable.highlightPotentialDropNode(
                    sourceId,
                    event.overNode,
                    this.getSourceTableSelectedRows(
                        this.mapSourceTablesGridOpts[sourceId],
                        event
                    )
                );
            }, 50);
        },
        handleDrogRowsToTarget(sourceId, dropParams, forceAdd = false) {
            let sourceParam = this.mapSourceTablesGridOpts[sourceId];
            let migratedRows = this.removeSourceRows(sourceParam, dropParams);

            if (forceAdd) {
                this.$refs.targetTable.addRowsToTarget(sourceId, migratedRows);
            } else {
                this.$refs.targetTable.handleDrogRowsFromSource(
                    sourceId,
                    dropParams,
                    migratedRows
                );
            }
            this.$refs.targetTable.showAddRootRow = false;
        },
        addDropzoneToFixArea(tbId, sourceGridOpt) {
            let self = this;
            let area = self.$refs.fixedDropArea;
            let dropZone = {
                getContainer: () => {
                    return area;
                },
                onDragEnter: () => {
                    area.style.color = '#f58634';
                    area.style.fontSize = '15px';
                    this.$refs.targetTable.showAddRootRow = true;
                },
                onDragLeave: () => {
                    area.style.color = '#6D6D6D';
                    area.style.fontSize = '13px';
                    this.$refs.targetTable.showAddRootRow = false;
                },
                onDragStop: (params) => {
                    area.style.color = '#6D6D6D';
                    area.style.fontSize = '13px';
                    self.handleDrogRowsToTarget(tbId, params, true);
                }
            };
            sourceGridOpt.api.addRowDropZone(dropZone);
        },
        getSourceTableSelectedRows(sourceParam, dropParams) {
            let allNodes = [];
            let selectedNodes = sourceParam.api.getSelectedNodes();
            if (selectedNodes.length) {
                allNodes = selectedNodes;
            } else {
                if (dropParams.node.group) {
                    allNodes = dropParams.node.allLeafChildren;
                } else {
                    allNodes = [dropParams.node];
                }
            }
            return allNodes;
        },
        removeSourceRows(sourceParam, dropParams) {
            let allNodes = this.getSourceTableSelectedRows(
                sourceParam,
                dropParams
            );

            let needRemoveRows = allNodes.map(function (node) {
                return node.data;
            });
            sourceParam.api.applyTransaction({
                remove: needRemoveRows
            });
            return needRemoveRows;
        },
        getDataResultTable() {
            return this.$refs.targetTable.getResultDataForDoc();
        }
    },
    components: {
        SourceTable: MatchingItemSourceTable,
        TargetTable: MatchingItemTargetTable
    },
    props: {
        data: {
            type: Object,
            default: () => {
                return {};
            }
        },
        rowData: {
            type: Array,
            default: () => {
                return [];
            }
        }
    }
};
</script>

<style>
.matching-item-target-table .ag-group-child-count {
    display: none !important;
}
</style>
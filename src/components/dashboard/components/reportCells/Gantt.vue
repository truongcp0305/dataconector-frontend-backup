<template>
    <div class="mx-1 h-100" :key="ganttKey">
        <GanttChartBase
            class="left-container"
            ref="ganttChartBase"
            :tasks="sortedTasks"
            :cellConfigs="cellConfigs"
            :isView="isView"
            @re-render="handleRerender"
            :instanceKey="instanceKey"
            @save-update-gantt="handleSaveUpdateGantt"
        ></GanttChartBase>
    </div>
</template>

<script>
import GanttChartBase from '@/components/dashboard/components/reportCells/GanttchartBase.vue';
import GanttchartWorker from 'worker-loader!@/worker/dashboard/ganttchart/Ganttchart.Worker.js';
import { util } from '@/plugins/util';
import _sortBy from 'lodash/sortBy';
export default {
    name: 'app',
    components: { GanttChartBase },
    data() {
        return {
            ganttchartWorker: null,
            ganttKey: 0,
            listItemChange: [],
            sortedTasks: {},
            firstCall: true,
            filter: {
                filter: [
                    {
                        column: 'id',
                        operation: 'and',
                        conditions: [
                            {
                                name: 'in',
                                value: []
                            }
                        ]
                    }
                ],
                page: 1,
                pageSize: 30,
                distinct: true
            }
        };
    },
    props: {
        cellConfigs: {
            default() {
                return {};
            }
        },
        isView: {
            default: true
        },
        instanceKey: {
            default: ''
        }
    },
    watch: {
        tasks: {
            handler() {
                this.getTaskIndex();
            }
        }
    },
    computed: {
        tasks() {
            let listIds = [];
            let listParent = {};
            let obj = {
                data: [],
                links: []
            };
            if (this.cellConfigs.viewConfigs.displayOptions.series) {
                let ganttData = util.cloneDeep(
                    this.cellConfigs.viewConfigs.displayOptions.series.data
                );

                for (let i = 0; i < ganttData.length; i++) {
                    if (
                        this.cellConfigs.rawConfigs.style.ganttConfig.children
                            .durationUnit.value == 'hour'
                    ) {
                        ganttData[i].duration =
                            parseFloat(ganttData[i].duration) * 60;
                    }
                    let dataItem = {
                        resize: true
                    };
                    if (!ganttData[i].parent) {
                        dataItem.open = true;
                        dataItem.tree = true;
                        dataItem.parent = 0;
                        dataItem.render = 'split';
                    } else {
                        listParent[ganttData[i].parent] = true;
                    }
                    if (ganttData[i].keyMapping) {
                        dataItem.mappingValue = [ganttData[i].keyMapping];
                    }
                    for (let j in ganttData[i]) {
                        if (
                            [
                                'start_date',
                                'planned_start',
                                'planned_end',
                                'deadline'
                            ].includes(j)
                        ) {
                            dataItem[j] = this.reformatDate(ganttData[i][j]);
                        } else {
                            dataItem[j] = ganttData[i][j];
                        }
                    }
                    if (ganttData[i].id) {
                        if (ganttData[i].dependency) {
                            let linkItem = {
                                id: i,
                                target: ganttData[i].id,
                                source: ganttData[i].dependency,
                                type: 0
                            };
                            obj.links.push(linkItem);
                        }
                        if (ganttData[i].milestone) {
                            dataItem.type = 'milestone';
                            dataItem.open = true;
                        }
                        if (!listIds.includes(dataItem.id)) {
                            listIds.push(dataItem.id);
                            obj.data.push(dataItem);
                        }
                    }
                }
                obj.data.forEach(function (e) {
                    if (listParent[e.id]) {
                        e.type = 'project';
                        e.render = 'split';
                    }
                });

                let dataTree = this.makeTree(obj.data);
                dataTree = this.sortByInternalNode(dataTree);
                let depe =
                    this.cellConfigs.rawConfigs.setting.dependency
                        .selectedColums[0];
                dataTree = this.sortByLeafNode(
                    dataTree,
                    [{ name: 'start_date' }],
                    depe
                );
                obj.data = this.treeToListByBFS(dataTree);
            }
            return obj;
        }
    },
    methods: {
        makeTree(list, idField = 'id', parentField = 'parent') {
            let map = list.reduce((obj, el) => {
                obj[el[idField]] = el;
                el.children = [];
                return obj;
            }, {});
            let rsl = [];
            let orphans = [];
            for (let item of list) {
                let parentId = item[parentField];
                if (parentId) {
                    if (map[parentId]) {
                        map[parentId].children.push(item);
                    } else {
                        orphans.push(item);
                    }
                } else {
                    rsl.push(item);
                }
            }
            rsl = [...rsl, ...orphans];
            return rsl;
        },
        treeToListByBFS(nodes) {
            let rsl = [];
            for (let node of nodes) {
                rsl.push(node);
            }
            let length = rsl.length;
            for (let i = 0; i < length; i++) {
                let item = rsl[i];
                if (item.children && Array.isArray(item.children)) {
                    rsl = rsl.concat(item.children);
                }
                length = rsl.length;
            }
            return rsl;
        },
        sortByInternalNode(children, column = [{ name: 'text' }]) {
            children = _sortBy(children, column[0].name);
            for (let node of children) {
                if (node.children && node.children.length) {
                    node.children = this.sortByInternalNode(
                        node.children,
                        column
                    );
                }
            }
            return children;
        },
        /**
         * Hàm này đang cải biên lại hàm bên dưới để chỉ sort cho tập các con hoàn toàn là leaf node
         * do việc trùng id giữa các task, cần thống nhất lại về cái id để đảm bảo là duy nhất
         */
        sortByLeafNode(
            children,
            column = [{ name: 'start_date' }],
            sortByDenpen = true
        ) {
            let isLeafs = true;
            for (let child of children) {
                if (child.children && child.children.length) {
                    isLeafs = false;
                    break;
                }
            }

            if (isLeafs) {
                children = _sortBy(children, column[0].name);
                if (sortByDenpen) {
                    children = this.sortGanttDataByDenpen(children);
                }
            } else {
                for (let child of children) {
                    if (child.children && child.children.length) {
                        child.children = this.sortByLeafNode(
                            child.children,
                            column,
                            sortByDenpen
                        );
                    }
                }
            }
            return children;
        },
        // sortByLeafNode(children, column = [{name: 'start_date'}]){
        //     let internalChildren = [];
        //     let leafChildren = [];
        //     for(let child of children){
        //         // debugger
        //         if(child.children && child.children.length){
        //             child.children = this.sortByLeafNode(child.children, column);
        //             internalChildren.push(child);
        //         }else{
        //             leafChildren.push(child);
        //         }
        //     }
        //     leafChildren = _sortBy(leafChildren, column[0].name);
        //     console.log(leafChildren, 'leafChildrenleafChildrenleafChildren');
        //     return internalChildren.concat(leafChildren);
        // },
        // Sắp xếp lại thứ tự của toàn bộ data trong gantt theo thứ tự xuất hiện của dependence
        sortGanttDataByDenpen(ganttData) {
            if (!Array.isArray(ganttData)) {
                return ganttData;
            }
            let sameStartDateItems = {};
            for (let idx in ganttData) {
                let item = ganttData[idx];
                if (!sameStartDateItems[item.start_date]) {
                    sameStartDateItems[item.start_date] = {
                        startIdx: idx,
                        items: []
                    };
                }
                sameStartDateItems[item.start_date].items.push(item);
            }
            for (let key in sameStartDateItems) {
                let group = sameStartDateItems[key];
                if (group.items.length > 1) {
                    group.items = this.sortItemsInGroupByDenpen(
                        sameStartDateItems[key].items
                    );
                }

                for (let index = 0; index < group.items.length; index++) {
                    ganttData[Number(group.startIdx) + Number(index)] =
                        group.items[index];
                }
            }
            return ganttData;
        },
        // Sắp xếp lại thứ tự các item trong từng group
        sortItemsInGroupByDenpen(items) {
            let map = {};
            items = util.cloneDeep(items);

            let startItems = [];
            for (let it of items) {
                map[it.id] = it;
            }

            for (let it of items) {
                if (!map[it.dependency]) {
                    startItems.push(it);
                } else {
                    if (!map[it.dependency].symper_dependencies_target) {
                        map[it.dependency].symper_dependencies_target = [];
                    }
                    map[it.dependency].symper_dependencies_target.push(it);
                }
            }

            let rsl = [];
            this.getTaskOrdersRecursively(startItems, rsl);
            return rsl;
        },
        getTaskOrdersRecursively(startItems, rsl) {
            for (let it of startItems) {
                rsl.push(it);
                if (Array.isArray(it.symper_dependencies_target)) {
                    this.getTaskOrdersRecursively(
                        it.symper_dependencies_target,
                        rsl
                    );
                }
            }
        },
        handleSettingColumnOptionsClicked(data) {
            let subItem = data.data.item;
            if (
                data.event == 'on-column-editable-click' ||
                data.event == 'on-pin-column-default-click'
            ) {
                subItem.value = !subItem.value;
            } else if (
                data.event == 'on-column-sort-asc' ||
                data.event == 'on-column-sort-desc'
            ) {
                let selectingItem = data.data.extra.selectingSubItem;
                this.$set(
                    selectingItem.menuOptions.sortAsc,
                    'value',
                    !selectingItem.menuOptions.sortAsc.value
                );
                this.$set(
                    selectingItem.menuOptions.sortDesc,
                    'value',
                    !selectingItem.menuOptions.sortDesc.value
                );
                this.$refs.ganttChartBase.refreshData();
            } else if (data.event == 'on-custom-column-display-sum-click') {
                if (data.data.extra.selectingSubItem.type == 'number') {
                    subItem.value = !subItem.value;
                    this.$refs.ganttChartBase.refreshData();
                } else {
                    this.$snotifyInfo(
                        '',
                        this.$t('v2.dashboard.fieldMustHaveNumbericFormat')
                    );
                }
            }
        },
        reformatDate(dateStr) {
            let output = '';
            if (dateStr.includes('/')) {
                output = dateStr.replace('/', '-');
            } else {
                output = dateStr;
            }
            return output;
        },
        printInnerHTML() {
            this.$refs.ganttChartBase.printInnerHTML();
        },
        handleRerender() {
            this.ganttKey = Date.now();
            this.$refs.ganttChartBase.$refs.preloader.hide();
            setTimeout(
                (self) => {
                    self.$refs.ganttChartBase.refreshTask();
                },
                10,
                this
            );
        },
        handleSaveUpdateGantt(data) {
            if (Object.keys(data).length > 0) {
                let fomular =
                    this.cellConfigs.rawConfigs.fomulasConfig.fomulas
                        .formulaValue.value;
                let k = 0;
                let obj = {
                    formula: fomular,
                    dataInput: {}
                };
                for (let i in data) {
                    obj.dataInput[k.toString()] = {};
                    for (let j in data[i]) {
                        if (fomular.includes(j)) {
                            let value;
                            if (j == 'start_date') {
                                value = this.$moment(data[i][j]).format(
                                    'YYYY-MM-DD'
                                );
                            } else if (j == 'duration') {
                                value =
                                    this.cellConfigs.rawConfigs.style
                                        .ganttConfig.children.durationUnit
                                        .value == 'hour'
                                        ? data[i][j] / 60
                                        : data[i][j];
                                value = value.toString();
                            } else {
                                value = data[i][j];
                            }
                            obj.dataInput[k][j] = value;
                        }
                    }
                    k++;
                }
                this.ganttchartWorker.postMessage({
                    action: 'saveUpdateGanttBefor',
                    data: {
                        data: obj
                    }
                });
            }
        },

        saveUpdateGanttAfter() {
            setTimeout(
                (self) => {
                    this.$evtBus.$emit('bi-report-change-display', {
                        type: 'data',
                        id: this.cellConfigs.sharedConfigs.cellId,
                        instanceKey: this.instanceKey,
                        serverCache: false,
                        refreshDataset: true
                    });
                },
                500,
                this
            );

            this.$snotifySuccess(
                this.$t('v2.dashboard.success'),
                this.$t('v2.dashboard.updateTaskSuccess')
            );
        },
        getWidgetIdentifier() {
            return this.cellConfigs.sharedConfigs.cellId;
        },
        haveErrorUpdateGantt(data) {
            this.$snotifyError(
                this.$t('v2.dashboard.error'),
                this.$t('v2.dashboard.erorMessage')
            );
            this.$refs.ganttchartBase.hideLoading();
        },
        listenFromWorker() {
            let self = this;
            this.ganttchartWorker.addEventListener('message', function (event) {
                let data = event.data;
                let action = data.action;
                if (self[action]) {
                    self[action](data.data);
                } else {
                    console.error(
                        this.$t('v2.dashboard.success') +
                            `${action}` +
                            this.$t('v2.dashboard.success')
                    );
                }
            });
        },
        handleError(error) {
            this.$snotifyError('', error.dataError);
            this.$refs.ganttchartBase.hideLoading();
        },
        handleGetTaskIndex(res) {
            let self = this;
            if (res.status == 200) {
                let taskDataMap = this.tasks.data.reduce(function (map, obj) {
                    map[obj.id] = obj;
                    return map;
                }, {});
                let sortedIds = JSON.parse(res.data.detail);
                this.sortedTasks.data = [];

                sortedIds.forEach(function (e) {
                    if (taskDataMap[e]) {
                        self.sortedTasks.data.push(taskDataMap[e]);
                        delete taskDataMap[e];
                    }
                });
                if (Object.keys(taskDataMap).length > 0) {
                    for (let i in taskDataMap) {
                        self.sortedTasks.data.push(taskDataMap[i]);
                    }
                }
                this.sortedTasks.links = this.tasks.links;
            } else {
                this.$set(this, 'sortedTasks', this.tasks);
            }
            if (!this.firstCall) {
                this.$refs.ganttChartBase.clearAll();
            }
            setTimeout(() => {
                try {
                    let collapseData =
                        self.$refs.ganttChartBase.getCollapseData();
                    if (Object.keys(collapseData).length > 0) {
                        self.sortedTasks.data.forEach(function (e) {
                            if (collapseData[e.id]) {
                                e.open = false;
                            }
                        });
                    }
                    self.$refs.ganttChartBase.refreshTask();
                } catch (err) {}
            }, 100);
            this.firstCall = false;
        },
        getTaskIndex() {
            let widgetIdentifier = this.getWidgetIdentifier() + ':index';
            this.ganttchartWorker.postMessage({
                action: 'getTaskIndex',
                data: {
                    widgetIdentifier: widgetIdentifier
                }
            });
        }
    },
    created() {
        this.ganttchartWorker = new GanttchartWorker();
        this.listenFromWorker();
        this.getTaskIndex();
    }
};
</script>
<style>
html,
body {
    height: 100%;
    margin: 0;
    padding: 0;
}
.container {
    height: 100%;
    width: 100%;
}
.left-container {
    overflow: hidden;
    position: relative;
    height: 100%;
}
</style>

import _cloneDeep from 'lodash/cloneDeep';
/**
 * Tất cả các trường thông tin cần điền để tạo thành các báo cáo
 */
let reportColumnSettingItems = {
    xAxis: {
        name: 'v2.dashboard.xAxis',
        slot: 'n',
    },
    legend: {
        name: 'v2.dashboard.legend',
        slot: '1',
    },
    yAxis1: {
        name: 'v2.dashboard.yAxis1',
        slot: '1',
        hasAgg: true,
    },
    yAxis2: {
        name: 'v2.dashboard.yAxis2',
        slot: '1',
        hasAgg: true,
    },
    tooltips: {
        name: 'v2.dashboard.tooltips',
        slot: 'n',
        hasAgg: true,
    },
    sharedAxis: {
        name: 'v2.dashboard.sharedAxis',
        slot: 'n',
    },
    columnSeries: {
        name: 'v2.dashboard.columnSeries',
        slot: 'n',
    },
    columnValues: {
        name: 'v2.dashboard.columnValues',
        slot: 'n',
    },
    lineValues: {
        name: 'v2.dashboard.lineValues',
        slot: 'n',
    },
    detail: {
        name: 'v2.dashboard.detail',
        slot: '1',
    },
    yAxis: {
        name: 'v2.dashboard.yAxis',
        slot: 'n',
        hasAgg: true,
    },
    size: {
        name: 'v2.dashboard.size',
        slot: '1',
    },
    category: {
        name: 'v2.dashboard.category',
        slot: 'n',
    },
    breakDown: {
        name: 'v2.dashboard.breakDown',
        slot: '1',
    },
    group: {
        name: 'v2.dashboard.group',
        slot: 'n',
    },
    min: {
        name: 'v2.dashboard.min',
        slot: '1',
    },
    max: {
        name: 'v2.dashboard.max',
        slot: '1',
    },
    targetValue: {
        name: 'v2.dashboard.targetValue',
        slot: '1',
    },
    value: {
        name: 'v2.dashboard.value',
        slot: 'n',
        hasAgg: true,
    },
    rows: {
        name: 'v2.dashboard.rows',
        slot: '1',
    },
    columns: {
        name: 'v2.dashboard.columns',
        slot: '1',
    },
    compareValue: {
        name: 'v2.dashboard.compareValue',
        slot: '1',
        hasAgg: true,
    },
    sortOnQuery: {
        name: 'v2.dashboard.sortOnQuery',
        slot: '1',
        hasAgg: false,
    },
    name: {
        name: 'v2.dashboard.taskName',
        hasAgg: false,
        slot: '1',
    },
    assignee: {
        name: 'v2.dashboard.assignee',
        hasAgg: false,
        slot: '1',
    },
    id: {
        name: 'v2.dashboard.id',
        hasAgg: false,
        slot: '1',
    },
    start: {
        name: 'v2.dashboard.startDate',
        hasAgg: false,
        slot: '1',
    },
    start_date: {
        name: 'v2.dashboard.startDate',
        hasAgg: false,
        slot: '1',
    },
    end: {
        name: 'v2.dashboard.endDate',
        hasAgg: false,
        slot: '1',
    },
    duration: {
        name: 'v2.dashboard.duration',
        hasAgg: true,
        slot: '1',
        tooltip: 'v2.dashboard.durationTooltip',
    },
    progress: {
        name: 'v2.dashboard.progress',
        hasAgg: true,
        slot: '1',
        tooltip: 'v2.dashboard.progressTooltip',
    },
    planned_start: {
        hasAgg: false,
        name: 'v2.dashboard.plannedStart',
        slot: '1',
        tooltip: 'v2.dashboard.plannedStartTooltip',
    },
    planned_end: {
        hasAgg: false,
        name: 'v2.dashboard.plannedEnd',
        slot: '1',
        tooltip: 'v2.dashboard.plannedEndTooltip',
    },
    milestone: {
        name: 'v2.dashboard.milestone',
        hasAgg: false,
        slot: '1',
    },
    parent: {
        name: 'v2.dashboard.parent',
        hasAgg: false,
        slot: '1',
        tooltip: 'v2.dashboard.parentTooltip',
    },
    dependency: {
        hasAgg: false,
        name: 'v2.dashboard.dependency',
        slot: '1',
    },
    documentObjectId: {
        hasAgg: false,
        name: 'v2.dashboard.documentObjectId',
        slot: '1',
    },
    gridColumns: {
        hasAgg: false,
        name: 'v2.dashboard.gridColumns',
        slot: '1',
        tooltip: 'v2.dashboard.gridColumnsTooltip',
    },
    rightSidebarColumns: {
        hasAgg: false,
        name: 'v2.dashboard.rightSidebarColumns',
        slot: '1',
        tooltip: 'v2.dashboard.rightSidebarColumnsTooltip',
    },
    sortBy: {
        hasAgg: false,
        name: 'v2.dashboard.sortBy',
        slot: '1',
        tooltip: 'v2.dashboard.sortByTooltip',
    },
    owner: {
        hasAgg: false,
        name: 'v2.dashboard.owner',
        slot: '1',
        tooltip: 'v2.dashboard.ownerTooltip',
    },
    rightOutterContent: {
        hasAgg: false,
        name: 'v2.dashboard.rightOutterContent',
        slot: '1',
        tooltip: 'v2.dashboard.rightOutterContentTooltip',
    },
    deadline: {
        hasAgg: false,
        name: 'v2.dashboard.deadline',
        slot: '1',
        tooltip: 'v2.dashboard.deadlineTooltip',
    },
    leftOutterContent: {
        hasAgg: false,
        name: 'v2.dashboard.leftOutterContent',
        slot: '1',
        tooltip: 'v2.dashboard.leftOutterContentTooltip',
    },
    keyMappingWorkHour: {
        hasAgg: false,
        name: 'v2.dashboard.keyMapping',
        slot: '1',
        tooltip: 'v2.dashboard.keyMappingTooltip',
    },
    keyMappingHoliday: {
        hasAgg: false,
        name: 'v2.dashboard.keyMapping',
        slot: '1',
        tooltip: 'v2.dashboard.keyMappingTooltip',
    },
    keyMappingWorkDay: {
        hasAgg: false,
        name: 'v2.dashboard.keyMapping',
        slot: '1',
        tooltip: 'v2.dashboard.keyMappingTooltip',
    },
    global: {
        hasAgg: false,
        name: 'v2.dashboard.global',
        slot: '1',
    },
    globalHour: {
        hasAgg: false,
        name: 'v2.dashboard.globalHour',
        slot: '1',
    },
    globalWorkHour: {
        hasAgg: false,
        name: 'v2.dashboard.globalHour',
        slot: '1',
    },
    globalHourStart: {
        hasAgg: false,
        name: 'v2.dashboard.globalHourStart',
        slot: '1',
    },
    globalWorkHourStart: {
        hasAgg: false,
        name: 'v2.dashboard.globalHourStart',
        slot: '1',
    },
    globalHourEnd: {
        hasAgg: false,
        name: 'v2.dashboard.globalHourEnd',
        slot: '1',
    },
    globalWorkHourEnd: {
        hasAgg: false,
        name: 'v2.dashboard.globalHourEnd',
        slot: '1',
    },
    globalDay: {
        hasAgg: false,
        name: 'v2.dashboard.globalDay',
        slot: '1',
    },
    globalWorkDay: {
        hasAgg: false,
        name: 'v2.dashboard.globalWorkDay',
        slot: '1',
    },
    keyMapping: {
        hasAgg: false,
        name: 'v2.dashboard.keyMapping',
        slot: '1',
    },
    keyMappingGlobal: {
        hasAgg: false,
        name: 'v2.dashboard.keyMapping',
        slot: '1',
    },
    specificDateWorkDay: {
        hasAgg: false,
        name: 'v2.dashboard.specificDateWorkDay',
        slot: '1',
    },
    specificDateWorkHour: {
        hasAgg: false,
        name: 'v2.dashboard.specificDateWorkDay',
        slot: '1',
    },
    specificHourStartWorkHour: {
        hasAgg: false,
        name: 'v2.dashboard.specificHourStartWorkHour',
        slot: '1',
    },
    specificHourEndWorkHour: {
        hasAgg: false,
        name: 'v2.dashboard.specificHourEndWorkHour',
        slot: '1',
    },
    globalHoliday: {
        hasAgg: false,
        name: 'v2.dashboard.globalHoliday',
        slot: '1',
    },
    globalHolidayGlobal: {
        hasAgg: false,
        name: 'v2.dashboard.globalHoliday',
        slot: '1',
    },
    specificHourWorkHour: {
        hasAgg: false,
        name: 'v2.dashboard.specificHourWorkHour',
        slot: '1',
    },
};

/**
 *
 * @param {Array} attrNames mảng chứa tên các item cần lấy
 */
export const getColumnConfigItems = function (attrNames) {
    let rsl = {};
    attrNames.forEach((name) => {
        rsl[name] = reportColumnSettingItems[name];
        rsl[name].selectedColums = [];
    });
    return _cloneDeep(rsl);
};

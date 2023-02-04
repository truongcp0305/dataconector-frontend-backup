/**
 * tất cả các Item cho style setting của các report
 * các type của từng Item: select, text, number, color, switch, slider, btnSelect
 */
import _cloneDeep from 'lodash/cloneDeep';
var attrItems = {
    titleText: {
        title: 'v2.dashboard.titleText',
        type: 'text',
        default: '',
    },
    zeroValueDisplay: {
        title: 'v2.dashboard.zeroValueDisplay', // Tiêu đề hiển thị của cấu hình
        type: 'select', // loại input để hiển thị
        default: '-', // giá trị mặc định cho thuộc tính này
        options: [
            {
                // Thuộc tính đặc thù của từng loại
                value: 'original',
                text: 'v2.dashboard.original',
            },
            {
                value: '-',
                text: '-',
            },
            {
                value: 'blank',
                text: 'v2.dashboard.blank',
            },
        ],
    },
    fillGap: {
        title: 'v2.dashboard.fillGap',
        type: 'switch',
        default: false
    },
    autoFill: {
        title: 'v2.dashboard.get-prepend-value',
        type: 'switch',
        default: false
    },
    stepValue: {
        title: 'v2.dashboard.step-value',
        type: 'number',
        default: 1
    },
    fillValue: {
        title: 'v2.dashboard.fill-value',
        type: 'number',
        default: null
    },
    pieLableStyle: {
        title: 'v2.dashboard.pieLableStyle',
        type: 'select',
        default: 'category',
        options: [
            {
                value: 'category',
                text: 'v2.dashboard.category',
            },
            {
                value: 'value',
                text: 'v2.dashboard.dataValue',
            },
            {
                value: 'percent',
                text: 'v2.dashboard.percent',
            },
            {
                value: 'categoryPercent',
                text: 'v2.dashboard.categoryPercent',
            },
            {
                value: 'valuePercent',
                text: 'v2.dashboard.valuePercent',
            },
            {
                value: 'all',
                text: 'v2.dashboard.all',
            },
        ],
    },
    hideOpenParent:{
        title:'v2.dashboard.hideOpenParent',
        type: 'switch',
        default:false
    },
    groupMultiAutoColumn:{
        title:'v2.dashboard.group-multi-auto-column',
        type:'switch',
        default:false
    },
    groupName:{
        title: 'v2.dashboard.group-name',
        type:'text',
        default:'Group'
    },
    showSubTotal: {
        title: 'v2.dashboard.showSubTotal',
        type: 'switch',
        default: false,
    },
    showOnTop:{
        title:'v2.dashboard.showOnTop',
        type:'switch',
        default:false
    },
    joinByValue:{
        title:'v2.dashboard.joinByValue',
        type:'text',
        default:''
    },
    autoCollapse:{
        title:'v2.dashboard.autoCollapse',
        type:'switch',
        default:false,
    },
    show: {
        title: 'v2.dashboard.show',
        type: 'switch',
        default: true,
    },
    wbsColumns: {
        title: 'v2.dashboard.wbsColumns',
        type: 'switch',
        default: false,
    },
    baseline: {
        title: 'v2.dashboard.baseline',
        type: 'switch',
        default: false,
    },
    dragBetweenLevel: {
        title: 'v2.dashboard.dragBetweenLevel',
        type: 'switch',
        default: false,
    },
    showDurationHour: {
        title: 'v2.dashboard.showDurationHour',
        type: 'switch',
        default: true,
    },
    showDurationMinute: {
        title: 'v2.dashboard.showDurationMinute',
        type: 'switch',
        default: true,
    },
    minUnit: {
        title: 'v2.dashboard.minUnit',
        type: 'select',
        default: 'day',
        options: [
            {
                value: 'minute',
                text: 'v2.dashboard.minute',
            },
            {
                value: 'hour',
                text: 'v2.dashboard.hour',
            },
            {
                value: 'day',
                text: 'v2.dashboard.day',
            },
            {
                value: 'week',
                text: 'v2.dashboard.week',
            },
        ],
    },
    criticalTask: {
        title: 'v2.dashboard.criticalTask',
        type: 'switch',
        default: false,
    },
    autoScheduling: {
        title: 'v2.dashboard.autoScheduling',
        type: 'switch',
        default: false,
    },
    showLegendTitle: {
        title: 'v2.dashboard.showLegendTitle',
        type: 'switch',
        default: true,
    },
    name: {
        title: 'v2.dashboard.nameText',
        type: 'text',
        default: '',
    },
    axistitle: {
        title: 'v2.dashboard.axistitle',
        type: 'switch',
        default: true,
    },
    gridLine: {
        title: 'v2.dashboard.gridLine',
        type: 'switch',
        default: true,
    },
    gridLineWidth: {
        title: 'v2.dashboard.gridLineWidth',
        type: 'number',
        default: 1,
    },
    gridLineColor: {
        title: 'v2.dashboard.gridLineColor',
        type: 'color',
        default: '#e6e6e6',
    },
    gridLineType: {
        title: 'v2.dashboard.gridLineType',
        type: 'select',
        default: 'LongDash',
        options: [
            {
                value: 'LongDash',
                text: 'v2.dashboard.LongDash',
            },
            {
                value: 'Dot',
                text: 'v2.dashboard.Dot',
            },
            {
                value: 'Solid',
                text: 'v2.dashboard.Solid',
            },
        ],
    },
    fontweight: {
        title: 'v2.dashboard.fontweight',
        type: 'select',
        default: '400',
        options: [
            {
                value: 'bold',
                text: 'v2.dashboard.bold',
            },
            {
                value: '500 ',
                text: 'v2.dashboard.medium',
            },
            {
                value: '400',
                text: 'v2.dashboard.regular',
            },
            {
                value: '300',
                text: 'v2.dashboard.thin',
            },
        ],
    },
    parentFontweight: {
        title: 'v2.dashboard.parentFontweight',
        type: 'select',
        default: '400',
        options: [
            {
                value: 'bold',
                text: 'v2.dashboard.bold',
            },
            {
                value: '500 ',
                text: 'v2.dashboard.medium',
            },
            {
                value: '400',
                text: 'v2.dashboard.regular',
            },
            {
                value: '300',
                text: 'v2.dashboard.thin',
            },
        ],
    },
    ganttSkin: {
        title: 'v2.dashboard.ganttSkin',
        type: 'select',
        default: 'terrace',
        options: [
            {
                value: 'terrace',
                text: 'v2.dashboard.terrace',
            },
            {
                value: 'skyblue',
                text: 'v2.dashboard.skyblue',
            },
            {
                value: 'meadow',
                text: 'v2.dashboard.meadow',
            },
            {
                value: 'broadway',
                text: 'v2.dashboard.broadway',
            },
            {
                value: 'material',
                text: 'v2.dashboard.material',
            },
        ],
    },
    dateFormat: {
        title: 'v2.dashboard.dateFormat',
        type: 'text',
        default: 'YYYY-mm-dd',
    },
    wrapText: {
        title: 'v2.dashboard.wrapText',
        type: 'switch',
        default: false,
    },
    fontColor: {
        title: 'v2.dashboard.fontColor',
        type: 'color',
        default: '#344750',
    },
    parentFontColor: {
        title: 'v2.dashboard.parentFontColor',
        type: 'color',
        default: '#344750',
    },
    legendPosition: {
        title: 'v2.dashboard.legendPosition',
        type: 'btnSelect',
        default: 'bottom',
        options: [
            {
                text: 'v2.dashboard.left',
                icon: 'mdi-align-horizontal-left',
                value: 'left',
            },
            {
                text: 'v2.dashboard.top',
                icon: 'mdi-align-vertical-top',
                value: 'top',
            },
            {
                text: 'v2.dashboard.right',
                icon: 'mdi-align-horizontal-right',
                value: 'right',
            },
            {
                text: 'v2.dashboard.bottom',
                icon: 'mdi-align-vertical-bottom',
                value: 'bottom',
            },
        ],
    },
    unit: {
        title: 'v2.dashboard.unit',
        type: 'select',
        default: 'auto',
        options: [
            {
                value: 'auto',
                text: 'v2.dashboard.auto',
            },
            {
                value: 'none',
                text: 'v2.dashboard.none',
            },
            {
                value: 'thousands',
                text: 'v2.dashboard.thousands',
            },
            {
                value: 'milions',
                text: 'v2.dashboard.milions',
            },
            {
                value: 'bilions',
                text: 'v2.dashboard.bilions',
            },
            {
                value: 'trilions',
                text: 'v2.dashboard.trilions',
            },
        ],
    },
    dataColor: {
        columnDepend: true, // được clone dựa vào từng column, không biết trước số lượng cụ thể
    },
    borderColor: {
        title: 'v2.dashboard.borderColor',
        type: 'color',
        default: '#DDD9D9',
    },
    parentBorderColor: {
        title: 'v2.dashboard.borderColor',
        type: 'color',
        default: '#DDD9D9',
    },
    projectColor: {
        title: 'v2.dashboard.projectColor',
        type: 'color',
        default: '#65c16f',
    },
    borderBottomColor: {
        title: 'v2.dashboard.borderColor',
        type: 'color',
        default: '#ededed',
    },
    bgColor: {
        title: 'v2.dashboard.bgColor',
        type: 'color',
        default: '#ffffff',
    },
    parentBgColor: {
        title: 'v2.dashboard.parentBgColor',
        type: 'color',
        default: '#ffffff',
    },
    textSize: {
        title: 'v2.dashboard.textSize',
        type: 'number',
        default: '13',
    },
    parentTextSize: {
        title: 'v2.dashboard.parentTextSize',
        type: 'number',
        default: '13',
    },
    parentBorderWidth: {
        title: 'v2.dashboard.parentBorderWidth',
        type: 'number',
        default: 1,
    },
    borderWidth: {
        title: 'v2.dashboard.borderWidth',
        type: 'number',
        default: 1,
    },
    borderBottomWidth: {
        title: 'v2.dashboard.borderWidth',
        type: 'number',
        default: 1,
    },
    tooltipDecimalNumber: {
        title: 'v2.dashboard.tooltipDecimalNumber',
        type: 'number',
        default: 2,
    },
    fontFamily: {
        title: 'v2.dashboard.fontFamily',
        type: 'select',
        default: 'roboto',
        options: [
            {
                value: 'roboto',
                text: 'Roboto',
            },
        ],
    },
    position: {
        title: 'v2.dashboard.position',
        type: 'select',
        default: 'bottom',
        options: [
            {
                value: 'bottom',
                text: 'v2.dashboard.bottom',
            },
            {
                value: 'top',
                text: 'v2.dashboard.top',
            },
            {
                value: 'left',
                text: 'v2.dashboard.left',
            },
            {
                value: 'right',
                text: 'v2.dashboard.right',
            },
            {
                value: 'bottom-left',
                text: 'v2.dashboard.bottomLeft',
            },
            {
                value: 'bottom-right',
                text: 'v2.dashboard.bottomRight',
            },
            {
                value: 'top-right',
                text: 'v2.dashboard.topRight',
            },
            {
                value: 'top-left',
                text: 'v2.dashboard.topLeft',
            },
        ],
    },
    alignment: {
        title: 'v2.dashboard.alignment',
        type: 'btnSelect',
        default: 'left',
        options: [
            {
                text: 'v2.dashboard.left',
                icon: 'mdi-align-horizontal-left',
                value: 'left',
            },
            {
                text: 'v2.dashboard.center',
                icon: 'mdi-align-horizontal-center',
                value: 'center',
            },
            {
                text: 'v2.dashboard.right',
                icon: 'mdi-align-horizontal-right',
                value: 'right',
            },
        ],
    },
    asisAlignment: {
        title: 'v2.dashboard.alignment',
        type: 'btnSelect',
        default: 'left',
        options: [
            {
                text: 'v2.dashboard.left',
                icon: 'mdi-align-horizontal-left',
                value: 'left',
            },
            {
                text: 'v2.dashboard.right',
                icon: 'mdi-align-horizontal-right',
                value: 'right',
            },
        ],
    },
    borderStyle: {
        title: 'v2.dashboard.borderStyle',
        type: 'btnSelect',
        default: 'solid',
        options: [
            {
                text: 'v2.dashboard.solid',
                icon: 'mdi-border-all-variant',
                value: 'solid',
            },
            {
                text: 'v2.dashboard.dashed',
                icon: 'mdi-border-none',
                value: 'dashed',
            },
            {
                text: 'v2.dashboard.double',
                icon: 'mdi-equal',
                value: 'double',
            },
        ],
    },
    parentBorderStyle: {
        title: 'v2.dashboard.parentBorderStyle',
        type: 'btnSelect',
        default: 'solid',
        options: [
            {
                text: 'v2.dashboard.solid',
                icon: 'mdi-border-all-variant',
                value: 'solid',
            },
            {
                text: 'v2.dashboard.dashed',
                icon: 'mdi-border-none',
                value: 'dashed',
            },
            {
                text: 'v2.dashboard.double',
                icon: 'mdi-equal',
                value: 'double',
            },
        ],
    },
    verticalAlign: {
        title: 'v2.dashboard.verticalAlign',
        type: 'btnSelect',
        default: 'top',
        options: [
            {
                name: 'v2.dashboard.top',
                icon: 'mdi-align-vertical-top',
                value: 'top',
            },
            {
                name: 'v2.dashboard.midle',
                icon: 'mdi-align-vertical-center',
                value: 'midle',
            },
            {
                name: 'v2.dashboard.Bottom',
                icon: 'mdi-align-vertical-bottom',
                value: 'Bottom',
            },
        ],
    },
    selectionType: {
        title: 'v2.dashboard.selectionType',
        type: 'btnSelect',
        default: 'multiple',
        options: [
            {
                name: 'v2.dashboard.single',
                icon: 'mdi-check-circle-outline',
                value: 'single',
                text: '',
            },
            {
                name: 'v2.dashboard.multiple',
                icon: 'mdi-checkbox-multiple-marked-circle-outline',
                value: 'multiple',
                text: '',
            },
        ],
    },
    selectionMode: {
        title: 'v2.dashboard.selectionMode',
        type: 'select',
        default: 'default',
        options: [
            {
                value: 'default',
                text: 'v2.dashboard.default',
            },
            {
                value: 'dropList',
                text: 'v2.dashboard.dropList',
            },
        ],
    },
    valueDecimal: {
        title: 'v2.dashboard.valueDecimal',
        type: 'number',
        default: 2,
    },
    markerSize: {
        title: 'v2.dashboard.markerSize',
        type: 'number',
        default: 3,
    },
    markerEnable: {
        title: 'v2.dashboard.markerEnable',
        type: 'switch',
        default: false,
    },
    dayColumn: {
        title: 'v2.dashboard.dayColumn',
        type: 'switch',
        default: false,
    },
    hourColumn: {
        title: 'v2.dashboard.hourColumn',
        type: 'switch',
        default: false,
    },
    revertColor: {
        title: 'v2.dashboard.revertColor',
        type: 'switch',
        default: false,
    },
    verticalLine: {
        title: 'v2.dashboard.verticalLine',
        type: 'switch',
        default: false,
    },
    lineWidth: {
        title: 'v2.dashboard.lineWidth',
        type: 'number',
        default: 1.3,
    },
    cardMode: {
        title: 'v2.dashboard.cardMode',
        type: 'radio',
        default: 'number',
        options: [
            {
                text: 'v2.dashboard.compareByNumber',
                icon: '',
                value: 'number',
            },
            {
                text: 'v2.dashboard.compareByPercent',
                icon: '',
                value: 'percent',
            },
            {
                text: 'v2.dashboard.deltaNumber',
                icon: '',
                value: 'deltaNumber',
            },
            {
                text: 'v2.dashboard.deltaPercent',
                icon: '',
                value: 'deltaPercent',
            },
            {
                text: 'v2.dashboard.progressText',
                icon: '',
                value: 'progress',
            },
        ],
    },
    dashboardSizeType: {
        title: 'v2.dashboard.dashboardSizeType',
        type: 'select',
        default: '16:9',
        disabled: false,
        options: [
            {
                value: '16:9',
                text: '16:9',
            },
            {
                value: '4:3',
                text: '4:3',
            },
            {
                value: 'letter',
                text: 'v2.dashboard.letter',
            },
            {
                value: 'tooltip',
                text: 'v2.dashboard.tooltip',
            },
            {
                value: 'custom',
                text: 'v2.dashboard.custom',
            },
        ],
    },
    dashboardSizeMode: {
        title: 'v2.dashboard.custom',
        type: 'select',
        disabled: false,
        default: 'realSize',
        options: [
            {
                value: 'fitWidth',
                text: 'v2.dashboard.fitWidth',
            },
            {
                value: 'realSize',
                text: 'v2.dashboard.realSize',
            },
            {
                value: 'fitScreen',
                text: 'v2.dashboard.fitScreen',
            },
        ],
    },
    width: {
        title: 'v2.dashboard.width',
        type: 'number',
        default: 0,
        disabled: false,
    },
    height: {
        title: 'v2.dashboard.height',
        type: 'number',
        default: 0,
        disabled: false,
    },
    cellMargin: {
        title: 'v2.dashboard.cellMargin',
        type: 'number',
        default: 10,
    },
    colorPalette: {
        title: 'v2.dashboard.colorPalette',
        type: 'colorArray',
        default: [],
    },
    lessThan:{
        title: "v2.dashboard.value-less-than",
        type:'switch',
        default:false
    },
    lessThanValue:{
        title: "v2.dashboard.group-series-if-value-less-than",
        type:'number',
        default:0,
        disabled:true
    },
    countSeriesDisplay:{
        title: "v2.dashboard.number-of-series-displayed",
        type:'switch',
        default:false
    },
    countSeriesDisplayValue:{
        title: "v2.dashboard.number-of-series-displayed",
        type:'number',
        default:7,
        disabled:true
    },
    totalSeriesGroup:{
        title: "v2.dashboard.total-of-group",
        type:'switch',
        default:false
    },
    totalSeriesGroupValue:{
        title: "v2.dashboard.total-of-group",
        type:'number',
        default:0,
        disabled:true
    },
    groupSeriesLabel:{
        title: "v2.dashboard.name-of-group-series",
        type:'text',
        default: '',
    },
    tableColumnWidthMode: {
        title: 'v2.dashboard.tableColumnWidthMode',
        type: 'select',
        default: 'auto',
        options: [
            {
                value: 'auto',
                text: 'v2.dashboard.auto',
            },
            {
                value: 'fitData',
                text: 'v2.dashboard.fitData',
            },
            {
                value: 'fitCell',
                text: 'v2.dashboard.fitCell',
            },
            {
                value: 'fitDataAndHeader',
                text: 'v2.dashboard.fitDataAndHeader',
            },
        ],
    },
    durationUnit: {
        title: 'v2.dashboard.durationUnit',
        type: 'select',
        default: 'day',
        options: [
            {
                value: 'hour',
                text: 'v2.dashboard.hour',
            },
            {
                value: 'minute',
                text: 'v2.dashboard.minute',
            },
        ],
    },
    conditionalFormatCondition: {
        title: 'v2.dashboard.conditionalFormatCondition',
        type: 'conditionalFormatItems',
        default: [],
    },
    rangeSelector: {
        title: 'v2.dashboard.rangeSelector',
        type: 'switch',
        default: false,
    },
    totalDisplayrows: {
        title: 'v2.dashboard.totalDisplayrows',
        type: 'text',
        default: 'Tổng',
    },
    rowHeight: {
        title: 'v2.dashboard.rowHeight',
        type: 'text',
        default: 25,
    },
};
/**
 * lấy ra các attr item với đầu vào là mảng tên của các attr đó
 */
export const getStyleItems = function (attrNames) {
    let rsl = {};
    attrNames.forEach((name) => {
        rsl[name] = attrItems[name];
        rsl[name].value = rsl[name].default;
    });
    return _cloneDeep(rsl);
};

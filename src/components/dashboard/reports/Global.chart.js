import ReportBase from './ReportBase';
export default class Global extends ReportBase {
    constructor() {
        let columnSettingKeys = [];
        let styleKeys = {
            legend: {
                title: 'v2.dashboard.cellLegend',
                items: [
                    'show',
                    'name',
                    'legendPosition',
                    'fontColor',
                    'textSize',
                    'showLegendTitle',
                    'titleText',
                ],
            },
            dataLabel: {
                title: 'v2.dashboard.cellDataLabel',
                items: [
                    'show',
                    'fontColor',
                    'textSize',
                    'bgColor',
                    'borderWidth',
                    'borderColor',
                ],
            },
            dashboardSize: {
                title: 'v2.dashboard.dashboardSize',
                items: [
                    'dashboardSizeType',
                    'dashboardSizeMode',
                    'width',
                    'height',
                ],
            },
            dashboarStyle: {
                title: 'v2.dashboard.dashboarStyle',
                items: ['cellMargin', 'bgColor'],
            },
            xAxis: {
                title: 'v2.dashboard.cellXAxis',
                items: [
                    'show',
                    'axistitle',
                    'titleText',
                    'textSize',
                    'alignment',
                    'gridLine',
                    'gridLineWidth',
                    'gridLineColor',
                    'gridLineType',
                    'unit',
                ],
            },
            yAxis1: {
                title: 'v2.dashboard.cellYAxis1',
                items: [
                    'show',
                    'axistitle',
                    'titleText',
                    'textSize',
                    'alignment',
                    'gridLine',
                    'gridLineWidth',
                    'gridLineColor',
                    'gridLineType',
                    'unit',
                ],
            },
        };
        super('global', 'global', columnSettingKeys, styleKeys);
        this.rawConfigs.style.dashboardSize.width = 1080;
        this.rawConfigs.style.dashboardSize.height = 720;
        this.viewConfigs.loadingData = false;
        this.viewConfigs.pendingRenderReportCount = 0;
        this.viewConfigs.displayOptions = {
            dashboardStyle: {
                size: {
                    h: 720,
                    w: 1080,
                },
                style: {
                    background: {
                        color: 'white',
                    },
                },
            },
        };
    }
}

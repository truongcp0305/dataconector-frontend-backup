import ReportBase from './ReportBase';
import { TranslatorHelper } from '@/components/dashboard/configPool/translatorHelper';

export default class Treemap extends ReportBase {
    constructor(symperId) {
        let columnSettingKeys = ['detail', 'group', 'tooltips', 'value'];
        let styleKeys = {
            legend: {
                title: 'v2.dashboard.legend',
                items: [
                    'fontColor',
                    'legendPosition',
                    'name',
                    'show',
                    'showLegendTitle',
                    'textSize',
                    'titleText',
                ],
            },
            lvl1DataLabel: {
                title: 'v2.dashboard.lvl1DataLabel',
                items: [
                    'alignment',
                    'bgColor',
                    'borderColor',
                    'borderWidth',
                    'fontColor',
                    'show',
                    'textSize',
                    'tooltipDecimalNumber',
                    'verticalAlign',
                ],
            },
            lvl2DataLabel: {
                title: 'v2.dashboard.lvl2DataLabel',
                items: [
                    'alignment',
                    'bgColor',
                    'borderColor',
                    'borderWidth',
                    'fontColor',
                    'show',
                    'textSize',
                    'verticalAlign',
                ],
            },
            general: {
                title: 'v2.dashboard.general',
                items: [
                    'bgColor',
                    'borderColor',
                    'borderWidth',
                    'colorPalette',
                    'fontFamily',
                ],
            },
            title: {
                title: 'v2.dashboard.titleConfig',
                items: [
                    'alignment',
                    'bgColor',
                    'fontColor',
                    'show',
                    'textSize',
                    'titleText',
                ],
            },
        };
        super('treeMap', symperId, columnSettingKeys, styleKeys);
    }
    async translate(rawConfig, data, extraData, changes = {}, oldOutput = {}) {
        let output = TranslatorHelper.Charts.treeMap(
            data.data,
            rawConfig.setting,
            rawConfig.style,
            1,
            extraData,
        );
        return output;
    }
}

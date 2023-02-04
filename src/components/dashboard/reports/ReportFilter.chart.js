import ReportBase from './ReportBase';
import { TranslatorHelper } from '@/components/dashboard/configPool/translatorHelper';

export default class ReportFilter extends ReportBase {
    constructor(symperId) {
        let columnSettingKeys = ['value'];
        let styleKeys = {
            selectionControl: {
                title: 'v2.dashboard.selectionControl',
                items: ['selectionMode', 'selectionType'],
            },
            filterItem: {
                title: 'v2.dashboard.filterItem',
                items: ['fontColor', 'textSize'],
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
            boxSearchBorder: {
                title: 'v2.dashboard.boxSearchBorder',
                items: ['borderColor', 'borderWidth'],
            },
        };
        super('filter', symperId, columnSettingKeys, styleKeys);
        this.viewConfigs.selectedValues = {};
        this.viewConfigs.disSelectedValues = {};
        this.sharedConfigs.queryKey = '';
        this.hasSelfFilter = false;
    }
    async translate(rawConfig, data, extraData, changes = {}, oldOutput = {}) {
        let output = TranslatorHelper.Charts.filter(
            data.data,
            rawConfig.setting,
            rawConfig.style,
            1,
            extraData,
        );
        return output;
    }
}

import ReportBase from './ReportBase';
import { TranslatorHelper } from '@/components/dashboard/configPool/translatorHelper';

export default class Card extends ReportBase {
    constructor(symperId) {
        let columnSettingKeys = ['compareValue', 'value'];
        let styleKeys = {
            card: {
                title: 'v2.dashboard.card',
                items: ['cardMode', 'revertColor'],
            },
            dataLabel: {
                title: 'v2.dashboard.dataLabel',
                items: [
                    'alignment',
                    'fontColor',
                    'fontColor',
                    'textSize',
                    'unit',
                    'valueDecimal',
                ],
            },
            deltaInfo: {
                title: 'v2.dashboard.deltaInfo',
                items: ['alignment', 'fontColor', 'textSize'],
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
        super('card', symperId, columnSettingKeys, styleKeys);
    }
    async translate(rawConfig, data, extraData, changes = {}, oldOutput = {}) {
        let output = TranslatorHelper.Charts.card(
            data.data,
            rawConfig.setting,
            rawConfig.style,
            1,
            extraData,
        );
        return output;
    }
}

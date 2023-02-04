import ReportBase from './ReportBase';
import { TranslatorHelper } from '@/components/dashboard/configPool/translatorHelper';
export default class ReportEditor extends ReportBase {
    constructor(symperId) {
        let columnSettingKeys = [];
        let styleKeys = {
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
        super('editor', symperId, columnSettingKeys, styleKeys);
        this.hasSelfFilter = false;
        this.viewConfigs.excludeHeaderOptions = {
            viewDetail: true,
            sort: true,
            export: true,
            viewDetail: true,
            viewDetail: true,
            refresh: true,
        };
    }

    restoreConfigFromSavedData(cell) {
        this.restoreByDefault(cell);
        cell.settings =
            typeof cell.settings == 'string'
                ? JSON.parse(cell.settings)
                : cell.settings;
        this.viewConfigs.displayOptions.content = cell.settings.content;
    }
    async translate(
        rawConfig,
        data,
        extraData = {},
        changes = {},
        oldOutput = {},
    ) {
        let displayOptions = {};
        displayOptions = TranslatorHelper.Charts.editor(
            rawConfig,
            displayOptions,
            extraData,
            oldOutput,
            1,
        );
        return displayOptions;
    }

    canGetDataFromServer() {
        return true;
    }
}

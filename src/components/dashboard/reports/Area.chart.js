import ReportGroupConfig from '@/components/dashboard/configPool/reportGroupConfig';
import ReportBase from './ReportBase';
import { TranslatorHelper } from '@/components/dashboard/configPool/translatorHelper';
export default class Area extends ReportBase {
    constructor(symperId) {
        let columnSettingKeys = ReportGroupConfig.Group1.columnSettingKeys;
        let styleKeys = ReportGroupConfig.Group1.styleKeys;
        super('area', symperId, columnSettingKeys, styleKeys);
    }
    async translate(
        rawConfig,
        data,
        extraData = {},
        changes = {},
        oldOutput = {},
    ) {
        let displayOptions = {};
        displayOptions = TranslatorHelper.Charts.barChart(
            rawConfig,
            data,
            displayOptions,
            extraData,
            'area',
            undefined,
            1,
        );
        return displayOptions;
    }
}

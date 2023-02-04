import ReportBase from './ReportBase';
import ReportGroupConfig from '@/components/dashboard/configPool/reportGroupConfig';
import { TranslatorHelper } from '@/components/dashboard/configPool/translatorHelper';
export default class Pie extends ReportBase {
    constructor(symperId) {
        let columnSettingKeys = ReportGroupConfig.Group3.columnSettingKeys;
        let styleKeys = ReportGroupConfig.Group3.styleKeys;
        super('pie', symperId, columnSettingKeys, styleKeys);
    }

    async translate(rawConfig, data, extraData, changes = {}, oldOutput = {}) {
        let output = TranslatorHelper.Charts.pie(
            data.data,
            rawConfig.setting,
            rawConfig.style,
            false,
            1,
            extraData,
        );
        return output;
    }
}

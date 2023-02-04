import ReportBase from './ReportBase';
import ReportGroupConfig from '@/components/dashboard/configPool/reportGroupConfig';
import { TranslatorHelper } from '@/components/dashboard/configPool/translatorHelper';

export default class Donut extends ReportBase {
    constructor(symperId) {
        let columnSettingKeys = ReportGroupConfig.Group3.columnSettingKeys;
        let styleKeys = ReportGroupConfig.Group3.styleKeys;
        super('donut', symperId, columnSettingKeys, styleKeys);
    }
    async translate(rawConfig, data, extraData, changes = {}, oldOutput = {}) {
        extraData.isDonut = true;
        let output = TranslatorHelper.Charts.pie(
            data.data,
            rawConfig.setting,
            rawConfig.style,
            true,
            1,
            extraData,
        );
        return output;
    }
}

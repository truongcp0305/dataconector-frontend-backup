import ReportGroupConfig from '@/components/dashboard/configPool/reportGroupConfig';
import ReportBase from './ReportBase';
import { TranslatorHelper } from '@/components/dashboard/configPool/translatorHelper';
import { getMenuOptionForYaxis } from '@/components/dashboard/configPool/reportConfig';
import { util } from '@/plugins/util';

export default class ClusteredColumn extends ReportBase {
    constructor(symperId) {
        let columnSettingKeys = ReportGroupConfig.Group1.columnSettingKeys;
        let styleKeys = ReportGroupConfig.Group1.styleKeys;
        super('clusteredColumn', symperId, columnSettingKeys, styleKeys);
        this.customColumnOptions();
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
            'column',
            undefined,
            1,
        );
        return displayOptions;
    }
    customColumnOptions() {
        this.rawConfigs.setting.yAxis1.menuOptions = Object.assign(
            this.rawConfigs.setting.yAxis1.menuOptions,
            getMenuOptionForYaxis(),
        );
        this.rawConfigs.setting.yAxis2.menuOptions = Object.assign(
            this.rawConfigs.setting.yAxis2.menuOptions,
            getMenuOptionForYaxis(),
        );
    }
}

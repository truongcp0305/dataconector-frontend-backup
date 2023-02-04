import ReportGroupConfig from '@/components/dashboard/configPool/reportGroupConfig';
import ReportBase from './ReportBase';
import { TranslatorHelper } from '@/components/dashboard/configPool/translatorHelper';
import { util } from '@/plugins/util';
import { getMenuOptionForYaxis } from '@/components/dashboard/configPool/reportConfig';

export default class LineAndStackedColumn extends ReportBase {
    constructor(symperId) {
        let columnSettingKeys = ReportGroupConfig.Group2.columnSettingKeys;
        let styleKeys = ReportGroupConfig.Group2.styleKeys;
        super('lineAndStackedColumn', symperId, columnSettingKeys, styleKeys);
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

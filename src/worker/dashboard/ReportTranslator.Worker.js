import { commentApi } from '@/api/Comment.js';
import { uiConfigApi } from '../../api/uiConfig';
var cachedReportResponse = {};
import { str } from '@/plugins/utilModules/str';
import _cloneDeep from 'lodash/cloneDeep';
onmessage = function (event) {
    let data = event.data;
    let action = data.action;
    if (handler[action]) {
        handler[action](data.data);
    } else {
        console.error(` action ${action} not found `);
    }
};
import { autoLoadChartClasses } from '@/components/dashboard/configPool/reportConfig.js';
import { dashboardApi } from '@/api/dashboard';
import { getDataInputForReport } from '@/components/dashboard/configPool/reportConfig.js';
var reportClasses = autoLoadChartClasses();

var handler = {
    isDropListFilter(cell) {
        // return cell.sharedConfigs.type == 'filter' && cell.viewConfigs.queryKey;
        return cell.sharedConfigs.type == 'filter';
    },

    async getDataFromServer(options) {
        let cell = options.cell;
        let extra = options.extra;
        let cacheKey = options.dashboardId + '--' + cell.sharedConfigs.cellId;
        let data = {};
        if (options.extra.changeType == 'autocomplete') {
            cacheKey = cacheKey + '--' + cell.sharedConfigs.queryKey;
        }
        if (
            (options.extra.changeType == 'style' ||
                options.extra.changeType == 'autocomplete') &&
            cachedReportResponse[cacheKey] &&
            !extra.refreshDataset
        ) {
            data = cachedReportResponse[cacheKey];
        } else {
            if (options.cell.sharedConfigs.type != 'editor') {
                let dataInput = getDataInputForReport(cell, extra.relations);
                dataInput.dashboardId = extra.dashboardId;
                if (extra.logActivityInfo) {
                    dataInput = Object.assign(dataInput, extra.logActivityInfo);
                }
                // chỗ này tạm để hiển thị lên dashboard, do khác về cache
                if (extra.serverCache === false) {
                    dataInput.serverCache = false;
                }
                if (extra.refreshDataset) {
                    dataInput.refreshDataset = extra.refreshDataset;
                }
                if (Object.keys(extra.variablesValue).length > 0) {
                    dataInput.columns = this.bindVarsToColumnsSetting(
                        dataInput.columns,
                        extra.variablesValue,
                    );
                    dataInput.condition = this.bindVarsToCondition(
                        dataInput.condition,
                        extra.variablesValue,
                    );
                }
                let res = await dashboardApi.getData(dataInput);
                data = res.data;
                if (!data.error) {
                    cachedReportResponse[cacheKey] = data;
                }
            }
        }
        return _cloneDeep(data);
    },

    async translateReportConfig(options) {
        let cell = options.cell;
        let extra = options.extra;
        let oldDisplayOptions = options.oldDisplayOption;
        let reportObj = new reportClasses[cell.sharedConfigs.type](
            cell.sharedConfigs.cellId,
        );
        reportObj.assignComputedAttrsValue(cell);
        let rsl = {
            cellId: cell.sharedConfigs.cellId,
        };
        if (reportObj.canGetDataFromServer()) {
            if (typeof reportObj.translate == 'function') {
                reportObj.extractHeaderDescription();
                let data = await this.getDataFromServer(options);
                if (data.error) {
                    rsl.error = data.error;
                } else {
                    let translatedData = await reportObj.translate(
                        cell.rawConfigs,
                        data,
                        extra,
                        {},
                        oldDisplayOptions,
                    );
                    rsl.translatedData = translatedData;
                }
                rsl.originData = data ? data.data : null;
            }
        }
        self.postMessage({
            action: 'applyTranslatedConfig',
            data: rsl,
        });
    },
    async countComment(data) {
        let arr = [];
        for (let i in data.allCellConfigs) {
            arr.push('dashboard-cell:' + i);
        }
        let res = await commentApi.getCommentCountPerObj(arr);
        self.postMessage({
            action: 'handleCountComment',
            data: res,
        });
    },
    bindVarsToColumnsSetting(columnsSetting, varsValue) {
        for (let key in columnsSetting) {
            for (let col of columnsSetting[key]) {
                if (col.formula) {
                    col.formula = str.bindVarValueToStr(col.formula, varsValue);
                }
            }
        }
        return columnsSetting;
    },
    bindVarsToCondition(condition, varsValue) {
        for (let col of condition) {
            col.cond.val = str.bindVarValueToStr(col.cond.val, varsValue);
        }
        return condition;
    },async saveUiConfig(data) {
        let res = await uiConfigApi.saveUiConfig(data)
    }
};

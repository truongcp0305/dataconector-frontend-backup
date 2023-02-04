import { uiConfigApi } from '@/api/uiConfig';
import {
    getDataFromConfig,
    getDefaultFilterConfig,
} from '@/components/common/customTable/defaultFilterConfig';

onmessage = function (event) {
    let data = event.data;
    let action = data.action;

    if (handler[action]) {
        handler[action](data.data);
    } else {
        console.error(` action ${action} not found `);
    }
};

var handler = {
    async saveUiConfig(configs) {
        let res = await uiConfigApi.saveUiConfig(configs);
        self.postMessage({
            action: 'handleSaveUiConfig',
            data: res,
        });
    },
    async restoreUiConfig(data) {
        let res;
        if (data.widgetIdentifier) {
            res = await uiConfigApi.getUiConfig(data.widgetIdentifier);
        }
        let resExtraConfig = await uiConfigApi.getUiConfig(
            data.widgetIdentifierExtraConfig,
        );
        self.postMessage({
            action: 'handleRestoreUiConfig',
            data: {
                res: res,
                resExtraConfig: resExtraConfig,
            },
        });
    },
    getData(dataConfig) {
        new Promise((resolve, reject) => {
            let handlerSuccess = function (data) {
                self.postMessage({
                    action: 'handleGetData',
                    data: data,
                });
                resolve(data);
            };
            handler.prepareFilterAndCallApi(
                dataConfig.configs.columns,
                dataConfig.configs.cache,
                dataConfig.configs.applyFilter,
                handlerSuccess,
                dataConfig.extraConfigs,
            );
        });
    },
    prepareFilterAndCallApi(
        columns = false,
        cache = false,
        applyFilter = false,
        success,
        configs = {},
    ) {
        if (configs.searchKey) {
            configs.searchColumns = 'id_,name_,description_,assignee_';
        }
        getDataFromConfig(
            configs.url,
            configs,
            columns,
            configs.tableFilter,
            success,
            'GET',
            configs.header,
        );
    },
    getItemForValueFilter(dataConfig) {
        new Promise((resolve, reject) => {
            let handlerSuccess = function (data) {
                self.postMessage({
                    action: 'handleGetItemForValueFilter',
                    data: data,
                });
                resolve(data);
            };
            handler.prepareFilterAndCallApi(
                dataConfig.columns,
                false,
                true,
                handlerSuccess,
                dataConfig.options,
            );
        });
    },
};

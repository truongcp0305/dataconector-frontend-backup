import Api from './api';
import { appConfigs } from './../configs.js';
import { util } from '../plugins/util';

var moduleApi = new Api(appConfigs.apiDomain.uiConfig);
export const uiConfigApi = {
    saveUiConfig(data) {
        return moduleApi.post('wigets', data);
    },

    async getUiConfig(widgetIdentifier) {
        let res = await moduleApi.get('wigets/' + widgetIdentifier);
        let data = Object.assign(res.data.userConfig);
        data.sharedConfig = res.data.sharedConfig
        res.data = data;
        delete res.data.userConfig
        return res
    },
};

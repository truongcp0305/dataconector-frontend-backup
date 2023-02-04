import Api from './api';
import { appConfigs } from './../configs.js';

var coreApi = new Api(appConfigs.apiDomain.core);
export const permissionPositionOrgchartApi = {
    addUserToPosition(data) {
        return coreApi.post('user/permission/position-orgchart', data);
    },
};

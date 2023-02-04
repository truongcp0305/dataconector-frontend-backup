import Api from './api';
import { appConfigs } from './../configs.js';
import { util } from '../plugins/util';

var moduleApi = new Api(appConfigs.apiDomain.userRole);
export const userRoleApi = {
    getRoleData(id) {
        return moduleApi.get('role/' + id);
    },
    getAllSymperRoles() {
        return moduleApi.get('role');
    },
};

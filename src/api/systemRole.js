import Api from './api';
import { appConfigs } from './../configs.js';
import { util } from '../plugins/util';

var moduleApi = new Api(appConfigs.apiDomain.systemRole);
export const systemRoleApi = {
    create(data) {
        return moduleApi.post('system-role', data);
    },
    getRole() {
        return moduleApi.get('system-role');
    },
    update(id, data) {
        return moduleApi.put('system-role/' + id, data);
    },
    detail(id) {
        return moduleApi.get('system-role/' + id);
    },
    delete(ids) {
        if (typeof ids != 'string') {
            ids = ids.join(',');
        }
        return moduleApi.delete('system-role/' + ids);
    },
    deleteRole(id) {
        return moduleApi.delete('system-role/' + id);
    },
    getRolesByUser(idUsers = false) {
        let queryParam = {
            items: idUsers,
        };
        return moduleApi.post('system-role/query/roles-by-users', queryParam);
    },
};

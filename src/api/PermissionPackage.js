import Api from './api';
import { appConfigs } from './../configs.js';

var coreApi = new Api(appConfigs.apiDomain.core);
export const permissionPackageApi = {
    getAllPackage(pageSize) {
        return coreApi.get('permission-packages?size=' + pageSize);
    },
    addUserToPackage(data) {
        return coreApi.post('user/permission/package', data);
    },
};

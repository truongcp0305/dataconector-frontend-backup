import Api from './api';
import { appConfigs } from './../configs.js';

let api = new Api(appConfigs.apiDomain.tenantManagement);

export const tenantApi = {
    getList() {
        return api.get('tenant');
    },
    getListTrash() {
        return api.get('tenant/trash');
    },
    delete(id) {
        return api.delete('tenant/' + id, { action: 'delete' });
    },
    restore(id) {
        return api.put('restore/' + id, { action: 'restore' });
    },
    create(data) {
        return api.post('tenant', data);
    },
    update(id, data) {
        return api.put('tenant/' + id, data);
    },
    getDetail(id) {
        return api.get('tenant/' + id);
    },
    checkExistCode(data) {
        return api.get('checkExistCode', data);
    }

};
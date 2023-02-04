import Api from './api';
import { appConfigs } from './../configs.js';

let api = new Api(appConfigs.apiDomain.objectAccessManager);

export default {
    checkStatus(type, id, action, time) {
        return api.get('object-access/check-status', {
            type,
            id,
            action,
            time,
        });
    },
    lockObject(type, id, action, time) {
        // console.log('lock object', { type, id, action }, Date.now());
        return api.post('object-access/lock', { type, id, action, time });
    },
};

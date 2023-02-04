import Api from './api';
import { appConfigs } from './../configs.js';
let log = new Api(appConfigs.apiDomain.log);
export const logServiceApi = {
    query(qr) {
        return log.post('query', qr);
    },
};

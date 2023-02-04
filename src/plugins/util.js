import { authUtil } from './utilModules/auth';
import { store } from './utilModules/store';
import { cookie } from './utilModules/cookie.js';
import { serviceWorker } from './utilModules/serviceWorker.js';
import { str } from './utilModules/str.js';

import _cloneDeep from 'lodash/cloneDeep';
/**
 * Các hàm trong store sẽ được đưa ra ngoài cùng của cây phân cấp.
 */
export const util = Object.assign(store, {
    cloneDeep: _cloneDeep,
    auth: authUtil,
    cookie: cookie,
    serviceWorker: serviceWorker,
    str: str,
});

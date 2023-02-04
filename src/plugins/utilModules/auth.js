import IndexedDB from '@/plugins/utilModules/indexedDB.js';
var loginedInfo = null;

async function getLoginInfoFromIndexedDB() {
    return new Promise((resolve, reject) => {
        let indexedDB = new IndexedDB('SYMPER-LOGIN-INFOR');
        if (!loginedInfo) {
            indexedDB.open('loginInfo', false, false, async () => {
                try {
                    loginedInfo = await indexedDB.read('loginInfo');
                    if (typeof loginedInfo == 'string') {
                        loginedInfo = JSON.parse(loginedInfo);
                    }
                    resolve(loginedInfo);
                } catch (error) {
                    console.error(
                        '[SYMPER] Can not read from indexedDB',
                        error,
                    );
                    reject(error);
                }
            });
        } else {
            resolve(loginedInfo);
        }
    });
}

/**
 * Các hàm phục vụ cho việc xác thực, lưu trữ dữ liệu đăng nhập cho người dùng
 */
export const authUtil = {
    saveLoginInfo(data) {
        /**
         * data có dạng: {
         *      token: "xxx",
         *      baId: "yyy",
         *      endUserId: "zzzz"
         * }
         */
        return new Promise((resolve, reject) => {
            localStorage.setItem('symper-login-info', JSON.stringify(data));
            let indexedDB = new IndexedDB('SYMPER-LOGIN-INFOR');
            indexedDB.open('loginInfo', false, false, async () => {
                try {
                    await indexedDB.save(data, 'loginInfo');
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    },

    getToken() {
        if (self.window) {
            let loginInfo = localStorage.getItem('symper-login-info');
            if (loginInfo) {
                return JSON.parse(loginInfo).token;
            } else {
                return false;
            }
        } else {
            return new Promise(async (resolve, reject) => {
                let loginInfo = await getLoginInfoFromIndexedDB();
                resolve(loginInfo.token);
            });
        }
    },

    isSupportter() {
        return this.getSavedUserInfo().profile.type == 'ba';
    },

    checkLogin() {
        if (this.getToken()) {
            return true;
        } else {
            return false;
        }
    },
    logout() {
        localStorage.removeItem('symper-login-info');
    },

    getSavedUserInfo() {
        let loginInfo = localStorage.getItem('symper-login-info');
        if (loginInfo) {
            return JSON.parse(loginInfo);
        } else {
            return {};
        }
    },

    async setSavedUserInfo(data) {
        let loginInfo = this.getSavedUserInfo();
        loginInfo = Object.assign(loginInfo, data);
        await this.saveLoginInfo(loginInfo);
    },

    getCurrentUserRole() {
        let data = this.getSavedUserInfo();
        let role = '';
        if (
            data.profile &&
            data.profile.userDelegate &&
            data.profile.userDelegate.role
        ) {
            role = data.profile.userDelegate.role;
        } else if (data.profile) {
            role = data.profile.role;
        }
        return role;
    },

    checkLoginAndSetToIndexedDB() {
        if (this.checkLogin()) {
            let logiInfo = this.getSavedUserInfo();
            let indexedDB = new IndexedDB('SYMPER-LOGIN-INFOR');
            indexedDB.open('loginInfo', false, false, () => {
                indexedDB.save(logiInfo, 'loginInfo');
            });
        }
    },

    isBa() {
        let userInfo = this.getSavedUserInfo();
        let userType = userInfo.profile.type;
        return userType == 'ba';
    },

    getTenantId() {
        let userInfo = this.getSavedUserInfo();
        let rsl = '';
        if (userInfo.profile.tenantId) {
            rsl = userInfo.profile.tenantId;
        }

        if (userInfo.profile.tenant && userInfo.profile.tenant.id) {
            rsl = userInfo.profile.tenant.id
        }
        return rsl;
    }
};

<template>
    <div class="app-waiting-room center-item">
        <div style="width: 320px" class="text-center position-relative">
            <img
                src="@/assets/image/symper-full-logo.png"
                style="width: 300px"
                class="pb-4"
            />
            <img
                src="@/assets/image/linear-loading.gif"
                style="width: 300px"
                class="pb-4"
            />
        </div>
    </div>
</template>

<script>
import { util } from '@/plugins/util.js';
import { orgchartApi } from '@/api/orgchart';
import { appConfigs } from '@/configs.js';
import { systemRoleApi } from '@/api/systemRole.js';
import { authUtil } from '../plugins/utilModules/auth';
var firebase = require('@firebase/app').firebase;
require('@firebase/messaging');
const firebaseConfig = appConfigs.firebaseConfig;

export default {
    mounted() {
        window.passWaitingRoom = true;
    },
    created() {
        this.initApp();
    },
    methods: {
        checkTokenHasTenantId() {
            let userInfo = authUtil.getSavedUserInfo();
            let hasTenant = false;
            if (
                userInfo.profile.tenantId ||
                (userInfo.profile.tenant && userInfo.profile.tenant.id)
            ) {
                hasTenant = true;
            }
            if (!hasTenant) {
                authUtil.logout();
                location.reload();
            }
        },
        /**
         * Load tất cả các dữ liệu cần thiết để chạy ứng dụng
         */
        async initApp() {
            // this.checkTokenHasTenantId();
            this.initFirebase();
            await this.loadUserInfoToStore();
            await this.getAndSetUserRoles();
            await this.getAllUserRoleTokens();
            await this.setCurrentUserRole();
            await this.processUserPermissons();
            this.$store.dispatch('app/getAllUsers');
            this.directToNextPage();
        },
        directToNextPage() {
            this.$router.push(
                window.goToRouteAfterWaiting
                    ? window.goToRouteAfterWaiting.query
                        ? window.goToRouteAfterWaiting.fullPath
                        : window.goToRouteAfterWaiting.path
                    : '/'
            );
        },
        async loadUserInfoToStore() {
            let savedUserInfo = util.auth.getSavedUserInfo();
            let rsl = await this.$store.dispatch(
                'app/setUserInfo',
                savedUserInfo
            );
        },
        /**
         * Lấy tất cả các role mà user hiện tại đang có và set vào store
         */
        async getAndSetUserRoles() {
            let userId = this.$store.state.app.endUserInfo.id;
            await this.getRolesByType(
                [{ idUser: userId }],
                'orgchart',
                orgchartApi
            );
            await this.getRolesByType([userId], 'systemRole', systemRoleApi);
        },
        async setCurrentUserRole() {
            let enduser = this.$store.state.app.endUserInfo;
            let roles = enduser.roles;
            let currentRole = enduser.currentRole;
            let allRoles = roles.orgchart.concat(roles.systemRole);
            let firstRole = null;

            if (enduser.role) {
                currentRole.id = enduser.role;
            }
            let newRole = {
                id: 'auto',
                name: ''
            };
            if (allRoles.length == 1) {
                // Nếu user chỉ có đúng 1 role thì chọn luôn role đó
                newRole = allRoles[0];
                roles.auto[0].hidden = true;
            } else if (this.checkCurrentRoleInListRole(roles, currentRole)) {
                // Nếu role đã lưu của user nằm trong list hiện có thì gán lại, (nếu role nằm ngoài list thì vẫn là auto)
                let firstRole = null;
                for (let key in roles) {
                    for (let r of roles[key]) {
                        !firstRole && r.id != 'auto' && (firstRole = r);
                        if (r.id == currentRole.id) {
                            newRole = r;
                            break;
                        }
                    }
                }

                // Nếu có firstRole mà role mới lại là auto thì chọn firstRow thay vì auto (do các tính năng của role auto chưa hoàn chỉnh)
                if (newRole.id == 'auto' && firstRole) {
                    newRole = firstRole;
                }
            }
            newRole.id == 'auto' && firstRole && (newRole = firstRole);
            if (newRole.id == 'auto') {
                newRole.name = this.$t('common.auto');
            }
            await this.$store.dispatch('app/changeUserRole', newRole);
            this.$set(enduser, 'currentRole', newRole);
        },
        async getAllUserRoleTokens() {},
        async processUserPermissons() {
            await this.$store.dispatch('app/getAndSetUserOperations');
            // getAndSetUserOperations();
        },
        async getRolesByType(userInfo, type, apiObj) {
            let context = this.$store;
            try {
                let res = await apiObj.getRolesByUser(userInfo);
                if (res.status == 200) {
                    if (res.data[0]) {
                        context.commit('app/setUserRoleByType', {
                            type: type,
                            data: res.data[0].roles
                        });
                    }
                } else {
                    this.$snotifyError(
                        res,
                        this.$t('v2.general2.getUserRoleErr')
                    );
                    console.error(this.$t('v2.general2.getUserRoleErr'), res);
                }
            } catch (error) {
                console.error(this.$t('v2.general2.getUserRoleErr'), error);
            }
        },
        checkCurrentRoleInListRole(roles, currentRole) {
            if (currentRole.id == 'auto') {
                return true;
            }

            let inOrgchart =
                roles.orgchart.filter((el) => {
                    return el.id == currentRole.id;
                }).length > 0;

            let inSystem =
                roles.systemRole.filter((el) => {
                    return el.id == currentRole.id;
                }).length > 0;
            return inOrgchart || inSystem;
        },
        async initFirebase() {
            var app = firebase.initializeApp(firebaseConfig);
            var messaging = firebase.messaging();
            this.$store.commit('app/updateSystemMessaging', {
                messageObj: messaging
            });
            messaging.usePublicVapidKey(
                appConfigs.firebaseConfig.publicVapidKey
            );
            messaging.onMessage((payload) => {
                this.$snotify({
                    title: payload.data.title
                        ? payload.data.title
                        : 'Notification',
                    text: payload.data.body
                });
                this.$evtBus.$emit('app-receive-remote-msg', payload);
            });
            messaging
                .getToken()
                .then((currentToken) => {
                    if (currentToken) {
                        // this.setTokenFireBase(currentToken);
                        this.$store.dispatch(
                            'app/setSystemMessagingToken',
                            currentToken
                        );
                        // console.log("Token create: ", currentToken);
                    } else {
                        console.log(this.$t('v2.general2.noInstanceId'));
                    }
                })
                .catch((err) => {
                    console.log(this.$t('v2.general2.retrievingTokenErr'), err);
                });

            messaging.onTokenRefresh(() => {
                messaging
                    .getToken()
                    .then((refreshedToken) => {
                        // this.setTokenFireBase(currentToken);
                        this.$store.dispatch(
                            'app/resetSystemMessagingToken',
                            currentToken
                        );
                        console.log(
                            this.$t('v2.general2.tokenRefreshed'),
                            refreshedToken
                        );
                    })
                    .catch((err) => {
                        console.log(
                            this.$t(
                                'v2.general2.unableToRetrieveRefreshedToken'
                            ),
                            err
                        );
                    });
            });
        }
    }
};
</script>

<style></style>

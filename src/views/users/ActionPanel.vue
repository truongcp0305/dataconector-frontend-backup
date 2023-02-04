<template>
    <div class="h-100">
        <div class="h-100" v-if="!isSettingPasswordView && !showViewInfo">
            <div class="h-100">
                <h3 class="fw-430 header-title fs-16">
                    <div style="width: 15px; float: right">
                        <i class="mdi mdi-close" @click="close()"></i>
                    </div>
                    <span v-if="actionType == 'add'">
                        {{ $t('user.other.createUser') }}
                    </span>
                    <span v-if="actionType == 'edit'">
                        {{ $t('user.other.updateUser') }}
                    </span>
                </h3>
                <v-stepper v-model="stepper" class="d-flex stepper-create-user">
                    <v-stepper-header class="stepper-header">
                        <v-stepper-step class="fs-13" editable step="1">
                            {{ $t('user.general.title') }}
                        </v-stepper-step>
                        <v-stepper-step
                            v-if="checkHasPermission('set_role')"
                            :editable="editStep"
                            @click="loadPermission()"
                            step="2"
                        >
                            {{ $t('user.permission.title') }}
                        </v-stepper-step>
                    </v-stepper-header>
                    <v-stepper-items
                        style="overflow: auto; overflow-y: scroll"
                        class="stepper-items"
                    >
                        <v-stepper-content step="1">
                            <h4>{{ $t('user.general.personalInfo.title') }}</h4>
                            <v-row style="margin-bottom: -10px">
                                <!-- thong tin -->
                                <v-col cols="8">
                                    <v-row>
                                        <v-col cols="6">
                                            <span class="fs-13 st-icon-pandora">
                                                {{ $t('v2.account.fullName') }}
                                            </span>
                                        </v-col>
                                        <v-col cols="6">
                                            <span class="fs-13 st-icon-pandora">
                                                {{
                                                    $t(
                                                        'user.general.personalInfo.firstName'
                                                    )
                                                }}
                                            </span>
                                        </v-col>
                                    </v-row>
                                    <v-row class="mb-1">
                                        <v-col cols="6">
                                            <v-text-field
                                                outlined
                                                class="fs-13 font-normal sym-small-size"
                                                v-model="user.lastName"
                                                dense
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-text-field
                                                outlined
                                                class="fs-13 font-normal sym-small-size"
                                                v-model="user.firstName"
                                                dense
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <span class="fs-13 st-icon-pandora">
                                                {{
                                                    $t(
                                                        'user.general.personalInfo.userName'
                                                    )
                                                }}
                                            </span>
                                            <span style="color: red">*</span>
                                        </v-col>
                                    </v-row>
                                    <v-row class="mb-1">
                                        <v-col cols="12">
                                            <v-text-field
                                                outlined
                                                class="fs-13 sym-small-size"
                                                ref="userName"
                                                required
                                                v-model="user.userName"
                                                dense
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <span class="fs-13 st-icon-pandora">
                                                {{
                                                    $t(
                                                        'user.general.personalInfo.displayName'
                                                    )
                                                }}
                                            </span>
                                            <span style="color: red">*</span>
                                        </v-col>
                                    </v-row>
                                    <v-row class="mb-1">
                                        <v-col cols="12">
                                            <v-text-field
                                                outlined
                                                class="fs-13 sym-small-size"
                                                ref="displayName"
                                                required
                                                :rules="[rules.required]"
                                                v-model="user.displayName"
                                                dense
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <span class="fs-13 st-icon-pandora">
                                                {{
                                                    $t(
                                                        'user.general.personalInfo.email'
                                                    )
                                                }}
                                            </span>
                                            <span style="color: red">*</span>
                                        </v-col>
                                    </v-row>
                                    <v-row class="mb-1">
                                        <v-col cols="12">
                                            <v-text-field
                                                outlined
                                                class="fs-13 sym-small-size"
                                                ref="email"
                                                v-model="user.email"
                                                :rules="[
                                                    rules.required,
                                                    rules.email
                                                ]"
                                                dense
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <span class="fs-13 st-icon-pandora">
                                                {{
                                                    $t(
                                                        'user.general.personalInfo.phoneNumber'
                                                    )
                                                }}
                                            </span>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-text-field
                                                outlined
                                                class="fs-13 sym-small-size"
                                                v-model="user.phone"
                                                dense
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                                <!-- kt thong tin -->
                                <!-- ảnh -->
                                <v-col cols="4">
                                    <v-col cols="3" class="text-center">
                                        <v-avatar v-if="avatarUrl != ''">
                                            <img :src="avatarUrl" />
                                        </v-avatar>
                                        <v-avatar v-if="avatarUrl == ''">
                                            <img
                                                :src="
                                                    require('./../../assets/image/avatar_default.jpg')
                                                "
                                            />
                                        </v-avatar>
                                        <UploadFile
                                            style="
                                                margin-top: -30px;
                                                margin-left: 50px;
                                            "
                                            ref="uploadAvatar"
                                            :pickAvatar="true"
                                            :autoUpload="false"
                                            :fileName="avatarFileName"
                                            @selected-file="
                                                handleAvatarSelected
                                            "
                                        />
                                    </v-col>
                                </v-col>
                                <!-- ket thuc anh -->
                            </v-row>
                            <div
                                v-if="actionType == 'edit'"
                                class="mt-3"
                                style="margin-left: -2px"
                            >
                                <v-checkbox
                                    dense
                                    class="sym-small-size"
                                    v-model="user.status"
                                    :label="
                                        $t(
                                            'user.general.passwordSetting.activeAccount'
                                        )
                                    "
                                >
                                </v-checkbox>
                            </div>
                            <div v-if="actionType == 'add'">
                                <h4 class="setting-password">
                                    {{
                                        $t('user.general.passwordSetting.title')
                                    }}
                                </h4>
                                <v-checkbox
                                    dense
                                    class="sym-small-size"
                                    v-model="autoRenPassword"
                                    @click="enabledPassword = !enabledPassword"
                                    :label="
                                        $t(
                                            'user.general.passwordSetting.autoGeneratePassword'
                                        )
                                    "
                                >
                                </v-checkbox>
                                <v-row>
                                    <v-col cols="4">
                                        <v-checkbox
                                            dense
                                            class="sym-small-size"
                                            v-model="enabledPassword"
                                            @click="
                                                autoRenPassword =
                                                    !autoRenPassword
                                            "
                                            :label="
                                                $t(
                                                    'user.general.passwordSetting.yourPassword'
                                                )
                                            "
                                        >
                                        </v-checkbox>
                                    </v-col>
                                    <v-col cols="8 input-password">
                                        <v-text-field
                                            class="fs-13"
                                            ref="password"
                                            v-model="user.password"
                                            :disabled="!enabledPassword"
                                            dense
                                            :append-icon="
                                                showPass
                                                    ? 'mdi-eye'
                                                    : 'mdi-eye-off'
                                            "
                                            :rules="[
                                                rules.required,
                                                rules.min,
                                                rules.max,
                                                rules.password
                                            ]"
                                            :type="
                                                showPass ? 'text' : 'password'
                                            "
                                            counter
                                            @click:append="showPass = !showPass"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-checkbox
                                    dense
                                    class="sym-small-size"
                                    v-model="needChangePassword"
                                    :label="
                                        $t(
                                            'user.general.passwordSetting.requireChangePassFirstLogin'
                                        )
                                    "
                                >
                                </v-checkbox>
                                <v-checkbox
                                    dense
                                    class="sym-small-size"
                                    v-model="sendMailAfterChange"
                                    :label="
                                        $t(
                                            'user.general.passwordSetting.sendEmailAfterDone'
                                        )
                                    "
                                >
                                </v-checkbox>
                            </div>
                            <div class="w-100 d-flex justify-end">
                                <v-btn
                                    class="btn-next-step"
                                    ref="addUserBtn"
                                    @click="validateForm()"
                                >
                                    {{
                                        actionType == 'add'
                                            ? (actionPanel = 'Lưu')
                                            : $t('v2.account.update')
                                    }}
                                </v-btn>
                            </div>
                        </v-stepper-content>
                        <v-stepper-content step="2" class="h-100">
                            <Permission
                                class="h-100 permission"
                                @change-width="changeWidth()"
                                :userId="user.id"
                                :stepper="stepper"
                            />
                        </v-stepper-content>
                    </v-stepper-items>
                </v-stepper>
            </div>
        </div>
        <div class="h-100" v-if="isSettingPasswordView && !showViewInfo">
            <v-change-password
                :user="detailInfoUser"
                @close-panel="close()"
                ref="changePass"
                :resetPass="showPassPanel"
            >
            </v-change-password>
        </div>
        <DetailUserInfo
            class="h-100"
            @change-width="changeWidth()"
            @close-panel="close()"
            v-if="showViewInfo"
            :showDetailView="showDetailView"
            :detailInfo="detailInfoUser"
        />
    </div>
</template>
<script>
import { clipperPreview } from 'vuejs-clipper';
import SymperAvatar from '../../components/common/SymperAvatar';
import ChangePassword from './../../views/users/ChangePass.vue';
import Permission from './Permission';
import DetailUserInfo from './../../views/users/DetailUserInfo.vue';
import { userApi } from './../../api/user.js';
import { permissionPackageApi } from './../../api/PermissionPackage.js';
import { permissionPositionOrgchartApi } from './../../api/PermissionPositionOrgchart.js';
import { orgchartApi } from './../../api/orgchart.js';
import avatarDefault from '@/assets/image/avatar_default.jpg';
import UploadFile from './../../components/common/UploadFile';
import { appConfigs } from '../../configs';
import { actionHelper } from '@/action/actionHelper';
export default {
    components: {
        'v-change-password': ChangePassword,
        UploadFile,
        SymperAvatar,
        Permission,
        DetailUserInfo,
        clipperPreview
    },
    props: {
        showDetailView: {
            default: false
        },
        actionType: {
            // type là add hay update hay detail user
            type: String,
            default: 'add'
        },
        isSettingPasswordView: {
            type: Boolean,
            default: false
        },
        showViewInfo: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        sapp() {
            return this.$store.state.app;
        }
    },
    data() {
        return {
            showPassPanel: false,
            detailInfoUser: {},
            test: true,
            avatarFileName: '',
            avatarUrl: '',
            user: {
                avatar: '',
                id: '',
                firstName: '',
                lastName: '',
                displayName: '',
                userName: ' ',
                email: '',
                password: null,
                phone: '',
                active: true
            },
            url: avatarDefault,
            stepper: 1,
            editStep: false,
            actionPanel: this.$t('user.other.createUser'),
            enabledPassword: false,
            autoRenPassword: true,
            needChangePassword: true,
            sendMailAfterChange: true,
            tabIndex: 0,
            permissionPackage: {
                title: this.$t('v2.account.package'),
                listPermission: [],
                permissionSelected: []
            },
            permissionSelected: [],
            permissionPosittionOrgChart: {
                title: this.$t('v2.account.orgchartPosition'),
                listNode: [],
                noteSelected: []
            },
            listNodesOrgChart: [],
            positionOrgchartSelected: [],
            userRole: {
                title: this.$t('v2.account.userType'),
                listUserRole: ['User', 'Business'],
                userRoleSelected: ''
            },
            showPass: false,
            rules: {
                required: (value) => !!value || this.$t('validate.required'),
                min: (v) =>
                    (typeof v != 'undefined' &&
                        v != undefined &&
                        v.length >= 8) ||
                    this.$t('v2.account.passMustHaveMoreThan8Characters'),
                max: (v) =>
                    (typeof v != 'undefined' &&
                        v != undefined &&
                        v.length < 25) ||
                    this.$t('validate.max_24'),
                email: (value) => {
                    const pattern =
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return pattern.test(value) || this.$t('validate.email');
                },
                password: (value) => {
                    const pattern =
                        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?).{8,}$/;
                    return (
                        pattern.test(value) ||
                        this.$t('v2.account.passIsNotValidate')
                    );
                }
            },
            formHasErr: true,
            search: {
                name: ''
            },
            isAddingToPosition: false
        };
    },
    watch: {
        showPassPanel() {
            if (this.showPassPanel) {
            }
        },
        user() {
            if (this.user.status == 'Đã khóa') {
                this.user.status = false;
            } else {
                this.user.status = true;
            }
        },
        formHasErr() {
            if (this.formHasErr) {
                this.formHasErr = !this.formHasErr;
            }
        },
        actionType() {
            this.actionPanel = this.actionType;
            if (this.actionType == 'add') {
                this.resetData();
                this.editStep = false;
                this.actionPanel = this.$t('user.other.createUser');
                this.avatarUrl = '';
            }
            if (this.actionType == 'edit') {
                this.formHasErr = false;
                this.editStep = true;
                this.actionPanel = this.$t('user.other.updateUser');
            }
        }
    },

    methods: {
        changeWidth() {
            this.$emit('change-width-panel');
        },
        close() {
            this.$emit('close-panel');
        },
        getAvatarUrl() {
            return (
                appConfigs.apiDomain.fileManagement +
                'user-avatar?userId=' +
                this.user.id
            );
        },
        handleAvatarUploaded() {},
        handleAvatarSelected(tempUrl) {
            this.avatarUrl = tempUrl;
            this.avatarFileName = 'user_avatar_' + this.user.id;
            this.$refs.uploadAvatar.uploadFile();
        },
        handleResize({ width, height }) {
            console.log('resized', width, height);
        },
        resetPermissionPosittionOrgChart() {
            this.permissionPosittionOrgChart = {
                title: this.$t('v2.account.orgchartPosition'),
                listNode: [],
                noteSelected: []
            };
        },
        setStepper(step) {
            this.stepper = step;
        },
        setUser(user) {
            this.user = user;
            if (user.avatar != null && user.avatar != '') {
                this.url = user.avatar;
            }
            this.avatarUrl = this.url;
            this.avatarFileName = 'user_avatar_' + this.user.id;
        },
        setDetailInfo(user) {
            this.detailInfoUser = user;
            this.detailInfoUser.avatarUrl = this.getAvatarUrl();
            this.detailInfoUser.avatarFileName = 'user_avatar_' + user.id;
        },
        actionUser() {
            if (this.actionType == 'add') {
                this.addNewUser();
            } else if (this.actionType == 'edit') {
                this.editUser();
            }
        },
        resetValidate() {
            this.$refs.userName.reset();
            this.$refs.email.reset();
            if (this.$refs.password) {
                this.$refs.password.reset();
            }
        },
        /**
         * Hoangnd: 14/4/2020
         * Hàm check validate các trường input   (password, email, user name)
         */
        validateForm() {
            this.formHasErr = false;
            let validUserName = this.$refs.userName.validate(true);
            let validEmail = this.$refs.email.validate(true);
            if (validUserName && validEmail) {
                if (this.enabledPassword) {
                    if (this.$refs.password.validate(true)) this.actionUser();
                    else {
                        this.formHasErr = true;
                    }
                } else {
                    this.actionUser();
                }
            } else {
                this.formHasErr = true;
            }
            return this.formHasErr;
        },
        selectPermissionPackage(perPackage) {
            let currentPackage = this.permissionPackage.permissionSelected.find(
                (x) => x.id === perPackage.id
            );
            if (
                currentPackage == undefined &&
                typeof currentPackage == 'undefined'
            ) {
                this.addUserToPackage(
                    this.user.id,
                    perPackage.id,
                    perPackage.packName
                );
            }
        },
        /**
         * Hoangnd: 14/4/2020
         * Hàm thêm user vào package
         * @param Int packId: id của package cần thêm cho user
         * @param String packTitle: tên của package (hiển thị lên phần mô tả các package đã chọn)
         */
        addUserToPackage(userId, packId, packTitle) {
            permissionPackageApi
                .addUserToPackage({ userId: userId, packId: packId })
                .then((res) => {
                    if (res.status == 200) {
                        this.permissionPackage.permissionSelected.push({
                            id: packId,
                            packName: packTitle
                        });
                    }
                })
                .catch((err) => {
                    console.log('error from add user api!!!', err);
                })
                .finally(() => {});
        },

        /**
         * Hoangnd: 14/4/2020
         * Hàm xóa package của 1 user
         * @param Int packId: id của package cần xóa
         */
        deletePackage(packId) {
            userApi
                .deleteUserPackage({ userId: this.user.id, packId: packId })
                .then((res) => {
                    if (res.status == 200) {
                        let currentPackage =
                            this.permissionPackage.permissionSelected.find(
                                (x) => x.id === packId
                            );
                        var index =
                            this.permissionPackage.permissionSelected.indexOf(
                                currentPackage
                            );
                        this.permissionPackage.permissionSelected.splice(
                            index,
                            1
                        );
                    }
                })
                .catch((err) => {
                    //console.log("error from add delete api!!!", err);
                })
                .finally(() => {});
        },

        /**
         * Hoangnd: 14/4/2020
         * Hàm tạo mới user
         */
        addNewUser() {
            const cpn = this;
            let passProps = {
                needChange: this.needChangePassword,
                dueDate: {
                    active: 0,
                    type: 'month',
                    value: 0
                }
            };
            let password = this.autoRenPassword
                ? this.generatePassword()
                : this.user.password;
            let data = {
                email: this.user.email,
                firstName: this.user.firstName,
                lastName: this.user.lastName,
                userName: this.user.userName,
                displayName: this.user.displayName,
                phone: this.user.phone,
                status: this.user.active,
                password: password,
                passwordProps: JSON.stringify(passProps),
                avatar: this.avatarUrl,
                sendMail: this.sendMailAfterChange
            };
            userApi
                .addUser(data)
                .then((res) => {
                    if (res.status == 200) {
                        cpn.loadPermission();
                        cpn.setStepper(2);
                        cpn.editStep = true;
                        cpn.user.id = res.user.id;
                        // cpn.user.id = 973;
                        cpn.avatarFileName = 'user_avatar_' + res.user.id;
                        setTimeout(() => {
                            cpn.$refs.uploadAvatar.uploadFile();
                        }, 10);
                        cpn.$emit('refresh-data');
                        this.$snotify({
                            type: 'success',
                            title: this.$t('notification.successTitle')
                        });
                    } else {
                        res.message = res.message.split(' ').join('_');
                        this.$snotify({
                            type: 'error',
                            title: this.$t('user.notification.' + res.message)
                        });
                    }
                })
                .catch((err) => {})
                .finally(() => {});
        },
        deleteOneUser(id) {
            let self = this;
            let data = {
                status: -1
            };
            userApi
                .updateUser(id, data)
                .then((res) => {
                    if (res.status == 200) {
                        self.$emit('refresh-data');
                        self.$snotify({
                            type: 'success',
                            title:
                                this.$t('notification.delete') +
                                ' ' +
                                this.$t('notification.successSubTitle')
                        });
                    }
                })
                .catch((err) => {
                    console.log('error from add user api!!!', err);
                });
        },
        deleteUser(user) {
            for (let i = 0; i < user.length; i++) {
                this.deleteOneUser(user[i].id);
            }
        },
        /**
         * Hoangnd: 14/4/2020
         * Hàm update user
         */
        editUser() {
            const cpn = this;
            let passProps = {
                needChange: this.needChangePassword,
                dueDate: ''
            };
            // let password = (this.autoRenPassword) ? this.generatePassword() : this.user.password;
            let avatar = this.url != avatarDefault ? this.url : '';
            let data = {
                id: this.user.id,
                email: this.user.email,
                firstName: this.user.firstName,
                lastName: this.user.lastName,
                status: this.user.status ? 1 : 0,
                userName: this.user.userName,
                displayName: this.user.displayName,
                phone: this.user.phone,
                passwordProps: JSON.stringify(passProps),
                avatar: this.avatarUrl
            };
            userApi
                .updateUser(this.user.id, data)
                .then((res) => {
                    if (res.status == 200) {
                        cpn.$emit('refresh-data');
                        this.$snotify({
                            type: 'success',
                            title: this.$t('notification.successTitle')
                        });
                    }
                })
                .catch((err) => {
                    console.log('error from add user api!!!', err);
                    this.$snotify({
                        type: 'error',
                        title: this.$t('notification.error')
                    });
                })
                .finally(() => {});
        },

        /**
         * Hoangnd: 14/4/2020
         * Hàm load phân quyền khi edit phân quyền user
         */
        loadPermission() {
            this.getPackage();
            this.getUserPackage();
            this.getAllOrgChart();
        },
        checkHasPermission(action) {
            let objectType = 'account';
            return actionHelper.checkHasPermission(objectType, action);
        },
        /**
         * Hoangnd: 14/4/2020
         * Hàm lấy danh sách các package
         */
        getPackage() {
            if (this.permissionPackage.listPermission.length == 0) {
                permissionPackageApi
                    .getAllPackage(20)
                    .then((res) => {
                        if (res.status == 200) {
                            this.permissionPackage.listPermission =
                                res.data.data;
                        }
                    })
                    .catch((err) => {
                        console.log('error from get pack api!!!', err);
                    })
                    .finally(() => {});
            }
        },
        /**
         * Hoangnd: 14/4/2020
         * Hàm lấy các package hiện tại của user
         */
        getUserPackage() {
            console.log(this.actionType);

            if (this.actionType != 'add') {
                userApi
                    .getListUserPackage(this.user.id)
                    .then((res) => {
                        if (res.status == 200) {
                            this.permissionPackage.permissionSelected =
                                res.data;
                            this.permissionSelected = res.data;
                        }
                    })
                    .catch((err) => {
                        console.log('error from get pack api!!!', err);
                    })
                    .finally(() => {});
            }
        },
        /**
         * hoangnd:14/4/2020
         * Hàm lấy danh sách của tất cả orgchart
         */
        getAllOrgChart() {
            if (this.permissionPosittionOrgChart.listNode.length == 0) {
                orgchartApi
                    .getAllNodes()
                    .then((res) => {
                        if (res.status == 200) {
                            let treeData = res.data;
                            this.permissionPosittionOrgChart.listNode =
                                treeData;
                            this.getUserPositionOrgchart();
                        }
                    })
                    .catch((err) => {
                        console.log('error from get orgchart api!!!', err);
                    })
                    .finally(() => {});
            }
        },

        /**
         * hoangnd: 14/4/2020
         * Hàm thêm user vào vị trí của org chart để phân quyền
         */
        addOrgchartPosition(org, from) {
            if (from == 'autocomplete' || from == 'input') {
                org.selected = true;
            }
            if (org.selected == true) {
                if (this.isAddingToPosition == false) {
                    this.isAddingToPosition = true;
                    permissionPositionOrgchartApi
                        .addUserToPosition({
                            userId: this.user.id,
                            positionId: org.id_node
                        })
                        .then((res) => {
                            if (res.status == 200) {
                                this.isAddingToPosition = false;
                                this.positionOrgchartSelected.push(org);
                            }
                        })
                        .catch((err) => {
                            console.log('error from add user api!!!', err);
                        })
                        .finally(() => {});
                } else {
                    this.isAddingToPosition = false;
                }
            } else {
                this.deletePosition(org);
            }
        },

        /**
         * Hoangnd: 14/4/2020
         * hàm đưa danh sách các node của orgchart về dạng hiển thị cho treeview
         * @param Array listNodes: danh sách các orgchart
         */
        setDataOrgchartTotreeView(listNodes, listPosition) {
            this.listNodesOrgChart = [];
            for (let index = 0; index < listNodes.length; index++) {
                let orgName = listNodes[index].name;
                let listChild = listNodes[index].children;
                this.listNodesOrgChart =
                    this.listNodesOrgChart.concat(listChild);
                this.checkSelectedPosition(listPosition, listNodes[index]);
                var map = {},
                    node,
                    roots = [],
                    i;
                for (i = 0; i < listChild.length; i++) {
                    map[listChild[i].id_node] = i; // initialize the map
                    listChild[i].children = []; // initialize the children
                }
                for (i = 0; i < listChild.length; i++) {
                    node = listChild[i];
                    if (node.id_parent_node !== 'general') {
                        //node.source = listChild[map[node.id_parent_node]].source + " / " +listChild[map[node.id_parent_node]].name;

                        listChild[map[node.id_parent_node]].children.push(node);
                    } else {
                        node.source = orgName;
                        roots.push(node);
                    }
                    this.checkSelectedPosition(listPosition, node);
                }
                this.permissionPosittionOrgChart.listNode[index].children =
                    roots;
            }
            console.log(this.listNodesOrgChart);
        },
        checkSelectedPosition(listPosition, position) {
            let newList = listPosition.filter((node) => {
                return (
                    node.root_id == position.root_id &&
                    node.id_parent_node == position.id_parent_node &&
                    node.id_node == position.id_node
                );
            });
            if (newList.length > 0)
                this.positionOrgchartSelected =
                    this.positionOrgchartSelected.concat(position);
        },
        /**
         * hoangnd : 15/4/2020
         * Hàm check các checkbox của sơ đồ orgchart treeview khi mới load position permission của 1 user
         */
        // setPositionOrgchartSelected(listPosition){
        // 	let listNode = this.permissionPosittionOrgChart.listNode
        // 	let newListPositionSelected = [];
        // 	for( let i = 0; i< listNode.length; i++){
        // 		let newList = listPosition.filter(node=>{
        // 			return  node.root_id == listNode[i].root_id;
        // 		})
        // 		newListPositionSelected = newListPositionSelected.concat(newList);

        // 	}
        // 	this.positionOrgchartSelected = newListPositionSelected;
        // },
        /**
         * hoangnd 15/4/2020
         * hàm lấy các position được phân quyền cho user
         * sau đó gán lại giá trị selected checkbox cho treeview
         */

        getUserPositionOrgchart() {
            if (this.user.id != '' && this.user.id != null) {
                userApi
                    .getListUserPosition(this.user.id)
                    .then((res) => {
                        if (res.status == 200) {
                            let listNode =
                                this.permissionPosittionOrgChart.listNode;
                            // lặp check các root
                            // this.setPositionOrgchartSelected(res.data);
                            for (
                                let index = 0;
                                index < listNode.length;
                                index++
                            ) {
                                let node = listNode[index];
                                let newA = res.data.filter((n) => {
                                    return (
                                        n.id == node.id &&
                                        n.root_id == node.root_id &&
                                        n.id_orgchart == node.id_orgchart &&
                                        n.id_node == node.id_node
                                    );
                                });
                                this.permissionPosittionOrgChart.listNode[
                                    index
                                ].selected = false;
                                if (newA.length > 0) {
                                    this.permissionPosittionOrgChart.listNode[
                                        index
                                    ].selected = true;
                                }
                                let children = node.children;
                                // lặp check các children
                                for (let i = 0; i < children.length; i++) {
                                    let childNode = children[i];
                                    let newArr = res.data.filter((n) => {
                                        return (
                                            n.id == childNode.id &&
                                            n.root_id == childNode.root_id &&
                                            n.id_node == childNode.id_node
                                        );
                                    });
                                    this.permissionPosittionOrgChart.listNode[
                                        index
                                    ].children[i].source = '';
                                    this.permissionPosittionOrgChart.listNode[
                                        index
                                    ].children[i].selected = false;
                                    if (newArr.length > 0) {
                                        this.permissionPosittionOrgChart.listNode[
                                            index
                                        ].children[i].selected = true;
                                    }
                                }
                            }
                            this.setDataOrgchartTotreeView(
                                this.permissionPosittionOrgChart.listNode,
                                res.data
                            );
                        }
                    })
                    .catch((err) => {
                        console.error('error from get pack api!!!', err);
                    })
                    .finally(() => {});
            }
        },
        /**
         * Hàm xóa user ra khỏi vị trí của org chart
         * @param Object org : org cần xóa
         */
        deletePosition(org) {
            userApi
                .deleteUserPosition({
                    userId: this.user.id,
                    positionId: org.id_node
                })
                .then((res) => {
                    if (res.status == 200) {
                        let currentPosition =
                            this.positionOrgchartSelected.find(
                                (x) => x.id === org.id
                            );
                        var index =
                            this.positionOrgchartSelected.indexOf(
                                currentPosition
                            );
                        this.positionOrgchartSelected.splice(index, 1);
                    }
                })
                .catch((err) => {
                    console.error('error from add delete api!!!', err);
                })
                .finally(() => {});
        },

        /**
         * hoangnd : 10/4/2020
         * Hàm tạo mật khẩu tự động
         */
        generatePassword() {
            var result = '';
            var upperCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var lowerCharacters = 'abcdefghijklmnopqrstuvwxyz';
            let number = '0123456789';
            var charactersLength = upperCharacters.length;
            for (var i = 0; i < 6; i++) {
                result += upperCharacters.charAt(
                    Math.floor(Math.random() * charactersLength)
                );
                result += lowerCharacters.charAt(
                    Math.floor(Math.random() * charactersLength)
                );
            }
            result += number.charAt(Math.floor(Math.random() * number.length));
            result += number.charAt(Math.floor(Math.random() * number.length));
            return result;
        },
        resetData() {
            (this.user = {
                id: '',
                firstName: '',
                lastName: '',
                displayName: '',
                userName: '',
                email: '',
                password: '',
                phone: '',
                active: true
            }),
                (this.stepper = 1),
                (this.url = avatarDefault),
                (this.actionPanel = this.$t('v2.account.createUser')),
                (this.enabledPassword = false),
                (this.autoRenPassword = true),
                (this.needChangePassword = true),
                (this.sendMailAfterChange = true),
                (this.tabIndex = 0),
                (this.permissionPackage = {
                    title: this.$t('v2.account.permissionsByPackage'),
                    listPermission: [],
                    permissionSelected: []
                }),
                (this.permissionPosittionOrgChart = {
                    title: this.$t('v2.account.permissionsByPosotion'),
                    listNode: [],
                    noteSelected: []
                }),
                (this.listNodesOrgChart = []),
                (this.permissionSelected = []),
                (this.positionOrgchartSelected = []),
                (this.userRole = {
                    title: this.$t('v2.account.userType'),
                    listUserRole: ['User', 'Business'],
                    userRoleSelected: ''
                }),
                (this.showPass = false),
                (this.formHasErr = true),
                (this.search = { name: '' });
        },

        closePanel() {
            this.resetValidate();
            this.$emit('close-panel', {});
            this.setStepper(1);
        }
    }
};
</script>
<style scoped>
.font-normal {
    font-family: Roboto;
    font-size: 13px;
}
.stepper-header {
    width: 180px;
    height: auto;
    display: block;
    border-right: 1px solid #eaeaea;
    box-shadow: none;
}
.stepper-items {
    width: 90%;
}
.stepper-items .row .col {
    padding: 0 3px;
}
.stepper-header .v-stepper__step {
    height: 34px;
    margin: 5px;
    padding: 5px;
    font-size: 14px;
}
.stepper-header .v-stepper__step--active {
    background: #f2f2f2;
    border-radius: 4px;
}
.v-stepper__content {
    height: 100%;
    padding: 10px 15px !important;
}

.v-subheader {
    padding: 0;
}
.v-input--checkbox {
    margin-top: 0;
}
.setting-password {
    margin: 16px 0;
}
.v-stepper__wrapper .row .col {
    padding: 0 12px;
}

.btn-next-step {
    box-shadow: none;
    background: white;
    color: green;
}
.permission-item {
    background: #f2f2f2;
    margin: 4px 0;
    border-radius: 4px;
}
.permission-item .mdi {
    cursor: pointer;
}
.stepper-create-user {
    box-shadow: none;
    height: calc(100% - 50px);
}
.header-title {
    padding: 0 0 12px 0;
    border-bottom: 1px solid #eaeaea;
}
.tree-permissionPosition {
    height: 500px;
    overflow-y: auto;
}

.input-file {
    width: 0;
    height: 0;
}
#preview {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 75px;
}

#preview img {
    max-width: 100%;
    max-height: 500px;
}
.treeCheckBox {
    margin-top: 0px;
    max-height: 30px;
}
.sym-stepper-content .v-tab {
    font-size: 13px;
}

.sym-stepper-content {
    padding-top: 0;
}
.content-orgchart-selected {
    background: white;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    /* padding-bottom: 8px; */
}
.content-orgchart-resize {
    overflow: hidden;
    border-top: 2px solid #888;
    margin: 8px 0;
}
.tree-orgchart-content {
    height: 100%;
}
.tree-orgchart-content .sym-small-size {
    height: calc(100% - 50px);
    overflow: auto;
}
.label-root-org {
    font-size: 14px;
    color: #797979;
    font-weight: 600;
}
.lb-last-name {
    display: inline-flex;
}
.input-password {
    height: 30px;
    margin-top: -8px;
}

.autocomplete-package-item {
    padding: 0;
    min-height: 40px;
}
.stepper-create-user >>> .v-stepper__wrapper {
    height: 100% !important;
}
</style>

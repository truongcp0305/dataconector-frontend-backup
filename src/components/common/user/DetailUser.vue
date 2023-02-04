<template>
    <div class="symper-detail-user pl-4 pt-2">
        <!-- panel title -->
        <v-row class="w-100 h-100">
            <v-col :class="{ 'col-md-4': isViewUserRole }">
                <v-list-item style="margin-left: -15px">
                    <v-list-item-avatar>
                        <v-avatar>
                            <img v-if="avatarUrl != ''" :src="avatarUrl" />
                            <img
                                v-if="avatarUrl == ''"
                                :src="
                                    require('./../../../assets/image/avatar_default.jpg')
                                "
                            />
                        </v-avatar>
                        <UploadFile
                            v-if="isEditing"
                            style="margin-left: -30px"
                            :fileName="avatarFileName"
                            @selected-file="handleAvatarSelected"
                            ref="uploadAvatar"
                        />
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ lazyUserInfo.displayName }}
                            <v-tooltip top v-if="!isEditing">
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        @click="isEditing = true"
                                        icon
                                        tile
                                        class="float-right"
                                        style="margin-right: -5px"
                                        small
                                    >
                                        <v-icon v-on="on" size="16"
                                            >mdi-grease-pencil</v-icon
                                        >
                                    </v-btn>
                                </template>
                                <span>{{
                                    $t('common.update') +
                                    ' ' +
                                    $t('user.myInfo.generalInfo')
                                }}</span>
                            </v-tooltip>
                            <v-tooltip top v-else>
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        color="blue"
                                        @click="saveUserInfo"
                                        icon
                                        tile
                                        class="float-right"
                                        style="margin-right: -5px"
                                        small
                                    >
                                        <v-icon v-on="on" size="16"
                                            >mdi-content-save</v-icon
                                        >
                                    </v-btn>
                                </template>
                                <span>{{
                                    $t('common.save') +
                                    ' ' +
                                    $t('user.myInfo.generalInfo')
                                }}</span>
                            </v-tooltip>
                        </v-list-item-title>
                        <v-list-item-subtitle style="color: black">
                            {{ lazyUserInfo.email }}
                            <v-tooltip top>
                                <template v-slot:activator="{ on }">
                                    <v-icon
                                        class="close-btn float-right"
                                        v-on="on"
                                        @click="
                                            $copyTextToClipboard(
                                                showableUserInfo['email']
                                            )
                                        "
                                        size="15"
                                        >mdi-content-copy
                                    </v-icon>
                                </template>
                                <span>{{
                                    $t('common.copy') +
                                    ' ' +
                                    $t('user.general.personalInfo.email')
                                }}</span>
                            </v-tooltip>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
                <div class="mt-4">
                    <!-- Thông tin chính -->
                    <div>
                        <v-icon class="fs-16"
                            >mdi mdi-information-outline</v-icon
                        >
                        <span class="fs-13 fw-430">
                            {{ $t('user.myInfo.generalInfo') }}
                        </span>
                    </div>
                    <div
                        v-for="(value, key) in showableUserInfo"
                        v-if="key != 'email' && key != 'displayName'"
                        :key="key"
                        class="pl-4"
                        style="margin-bottom: -20px"
                    >
                        <v-row>
                            <v-col class="col-md-4 fs-13 fw-430">
                                {{ $t('user.general.personalInfo.' + key) }}
                            </v-col>
                            <v-col
                                class="col-md-8"
                                v-if="
                                    isEditing &&
                                    key != 'email' &&
                                    key != 'displayName'
                                "
                            >
                                <v-text-field
                                    solo
                                    flat
                                    hide-details
                                    class="sym-small-size sym-style-input"
                                    single-line
                                    v-model="showableUserInfo[key]"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col v-if="!isEditing">
                                <span class="fs-13">
                                    {{
                                        showableUserInfo[key]
                                            ? showableUserInfo[key]
                                            : ' '
                                    }}
                                </span>
                                <v-btn
                                    x-small
                                    icon
                                    tile
                                    class="float-right"
                                    v-if="key == 'email' || key == 'phone'"
                                >
                                    <v-tooltip top>
                                        <template v-slot:activator="{ on }">
                                            <v-icon
                                                style="margin-top: -10px"
                                                class="
                                                    close-btn
                                                    float-right
                                                    mr-3
                                                "
                                                v-on="on"
                                                @click="
                                                    $copyTextToClipboard(
                                                        showableUserInfo[key]
                                                    )
                                                "
                                                size="15"
                                                >mdi-content-copy
                                            </v-icon>
                                        </template>
                                        <span>{{
                                            $t('common.copy') +
                                            ' ' +
                                            $t(
                                                'user.general.personalInfo.' +
                                                    key
                                            )
                                        }}</span>
                                    </v-tooltip>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </div>
                    <div class="ml-4 mt-3" :class="{ 'mt-2': isEditing }">
                        <div @click="changePass()" class="detail-user-label">
                            {{ $t('user.general.personalInfo.pass') }}
                            <v-icon style="font-size: 16px; margin-top: -2px"
                                >mdi-lock-outline</v-icon
                            >
                        </div>
                        <v-dialog v-model="openChangePassForm" width="397">
                            <NotificationChangePass
                                ref="changePass"
                                @cancel="cancelDialog()"
                            />
                        </v-dialog>
                    </div>
                    <!-- Avatar -->
                    <!-- Vai trò của user -->
                    <div class="user-role-info w-100 mt-3">
                        <div>
                            <v-icon class="fs-16"
                                >mdi mdi-office-building-outline</v-icon
                            >
                            <span class="fw-430 fs-13">
                                {{ $t('user.myInfo.myPosition') }}
                                <!-- <v-btn class="fs-13 fw-430 " style="letter-spacing:0px;" 
                        @click="viewAllPermission()" text x-small >   
                            Xem tất cả
                        </v-btn>) -->
                            </span>
                        </div>
                        <div class="pl-4 d-flex mt-1" v-if="orgRole.length">
                            <div class="detail-user-label mt-1">
                                {{ $t('common.orgchart') }}
                            </div>
                        </div>
                        <div v-for="(role, indx) in orgRole" :key="indx">
                            <div class="ml-5" v-if="role.name">
                                <v-icon class="fs-16"
                                    >mdi mdi-account-circle-outline</v-icon
                                >
                                <v-btn
                                    x-small
                                    class="font-normal"
                                    text
                                    style="letter-spacing: 0px"
                                    @click="
                                        viewUserRole(
                                            role.id,
                                            role.active,
                                            role.name
                                        )
                                    "
                                >
                                    <span :style="{ color: 'black' }">
                                        {{ role.name }}
                                    </span>
                                </v-btn>
                            </div>
                            <div class="ml-5 mt-1" v-else>
                                <span
                                    class="fs-13"
                                    style="color: rgb(211, 109, 36)"
                                >
                                    {{ role.titleGroup }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div
                        class="mt-2"
                        v-if="lazyUserInfo.roles.systemRole.length"
                    >
                        <div class="mt-1">
                            <v-icon class="fs-16"
                                >mdi mdi-account-tie-outline</v-icon
                            >
                            <span class="fs-13 fw-430">
                                {{ $t('common.system') }}
                            </span>
                        </div>
                        <div class="detail-user-value">
                            <div
                                v-for="role in lazyUserInfo.roles.systemRole"
                                :key="role.id"
                            >
                                <v-icon class="fs-16 fw-430 ml-5"
                                    >mdi mdi-account-circle-outline</v-icon
                                >
                                <v-btn
                                    class="fm fw-400"
                                    text
                                    x-small
                                    @click="
                                        viewUserRole(
                                            role.id,
                                            role.active,
                                            role.name
                                        )
                                    "
                                >
                                    <span
                                        :style="{
                                            color: role.active
                                                ? 'black'
                                                : 'lightgrey'
                                        }"
                                        class="fm fs-13"
                                    >
                                        {{ role.name }}
                                    </span>
                                </v-btn>
                            </div>
                        </div>
                    </div>
                </div>
            </v-col>
            <v-col class="col-md-8" v-if="isViewUserRole">
                <ViewRoles
                    :roleName="roleName"
                    :viewDetail="isViewDetail"
                    :permission="lazyUserInfo.roles"
                    :allRole="lazyUserInfo"
                    :rolesList="role"
                />
            </v-col>
        </v-row>
    </div>
</template>

<script>
import SymperAvatar from '@/components/common/SymperAvatar';
import { appConfigs } from '../../../configs';
import UploadFile from './../../../components/common/UploadFile';
import { util } from '../../../plugins/util';
import ViewRoles from '../../../views/users/ViewRoles';
import NotificationChangePass from './../../../components/notification/notificationChangeFirstPass';
import Vue from 'vue';
import { userApi } from '../../../api/user';
import _groupBy from 'lodash/groupBy';

export default {
    components: {
        SymperAvatar,
        ViewRoles,
        UploadFile,
        NotificationChangePass
    },
    data() {
        return {
            role: [],
            isViewDetail: false,
            orgRole: [],
            dialog: false,
            openChangePassForm: false,
            avatarUrl: '',
            avatarFileName: '',
            isViewUserRole: false,
            lazyUserInfo: {
                id: 0,
                firstName: '',
                lastName: '',
                phone: '',
                displayName: '',
                email: '',
                roles: {
                    orgchart: [],
                    system: []
                }
            },
            isEditing: false
        };
    },
    created() {
        this.reAssignUserInfo();
        this.getAvatarUrl();
    },
    computed: {
        showableUserInfo() {
            let rsl = util.cloneDeep(this.lazyUserInfo);
            delete rsl.id;
            delete rsl.roles;
            return rsl;
        }
    },
    methods: {
        cancelDialog() {
            this.openChangePassForm = false;
            //this.$refs.changePass.refreshAll();
        },
        changePass() {
            this.openChangePassForm = !this.openChangePassForm;
        },
        logout() {
            util.auth.logout();
            location.reload();
        },
        getAvatarUrl() {
            this.avatarUrl =
                appConfigs.apiDomain.fileManagement +
                'user-avatar?userId=' +
                this.lazyUserInfo.id;
        },
        handleAvatarSelected(tempUrl) {
            this.avatarUrl = tempUrl;
            this.avatarFileName = 'user_avatar_' + this.lazyUserInfo.id;
            this.$refs.uploadAvatar.uploadFile();
        },
        showUserInfo() {
            // this.isViewUserRole=false;
            this.$emit('make-small-panel');
        },
        viewAllPermission() {
            this.$emit('expand-panel');
            this.isViewDetail = false;
            this.isViewUserRole = true;
        },
        viewUserRole(role, active, roleName) {
            if (active) {
                this.roleName = roleName;
                this.isViewDetail = true;
                this.isViewUserRole = true;
                this.role = role;
                this.$emit('expand-panel');
            }
        },
        saveUserInfo() {
            let self = this;
            userApi
                .updateUser(this.lazyUserInfo.id, this.showableUserInfo)
                .then((res) => {
                    self.$snotifySuccess('Lưu thông tin thành công');
                    this.isEditing = false;
                })
                .catch((err) => {
                    self.$snotifySuccess(
                        err,
                        'Không thể lưu thông tin người dùng'
                    );
                });
        },
        closePanel() {
            this.$emit('closePanel');
        },
        editOrgRole(ogrRole) {
            ogrRole.map((role) => {
                role.active = true;
            });
            let nameOrgchart = _groupBy(ogrRole, 'orgchartName');
            this.orgRole = [];
            Object.keys(nameOrgchart).forEach((type) => {
                this.orgRole.push({ titleGroup: type });
                this.orgRole.push(...nameOrgchart[type]);
            });
        },
        reAssignUserInfo() {
            let rsl = {};
            for (let key in this.lazyUserInfo) {
                if (
                    this.userInfo[key] !== null &&
                    this.userInfo[key] !== undefined
                ) {
                    rsl[key] = this.userInfo[key];
                }
            }
            this.lazyUserInfo = null;
            this.lazyUserInfo = rsl;
            this.editOrgRole(rsl.roles.orgchart);
        }
    },
    props: {
        userId: {
            default: 0
        },
        userInfo: {
            default: {}
        },
        close: {
            default: true
        }
    },
    watch: {
        close() {
            if (this.close == false) {
                this.isViewUserRole = false;
            }
        },
        openChangePassForm(val) {
            if(!val){
                this.$refs.changePass.resetToDefault()
            }
            
            //this.$refs.changePass.refreshAll();
        },
        userInfo: {
            deep: true,
            immediate: true,
            handler() {
                this.reAssignUserInfo();
            }
        }
    }
};
</script>

<style scoped>
.symper-detail-user .detail-user-label {
    font-weight: 500;
    display: inline-block;
    font-size: 13px;
}

.symper-detail-user .detail-user-value.editable-value {
    width: calc(100% - 100px);
}

.symper-detail-user .user-avatar {
    display: inline-block;
    text-align: center;
    margin: auto;
}
.symper-detail-user ::v-deep .v-avatar {
    height: 70px !important;
    min-width: 70px !important;
    width: 70px !important;
}
</style>

<template>
    <div class="h-100 w-100">
        <v-stepper class="w-100 d-flex stepper-create-user">
            <div class="w-100 ml-4" v-if="!isViewUserRole">
                <h4>{{ $t('user.general.personalInfo.title') }}</h4>
                <v-row class="mt-1">
                    <!-- thong tin -->
                    <v-col cols="8">
                        <v-row class="ml-1" style="margin-top: -15px">
                            <v-col cols="6">
                                <span class="fw-430 fs-13 st-icon-pandora">
                                    {{$t('v2.account.fullName')}}
                                </span>
                            </v-col>
                            <v-col cols="6">
                                <span class="fs-13 st-icon-pandora">
                                    {{ detailInfo.lastName }}
                                    {{ ' ' + detailInfo.firstName }}
                                </span>
                            </v-col>
                        </v-row>
                        <v-row class="ml-1" style="margin-top: -15px">
                            <v-col cols="6">
                                <span class="fw-430 fs-13 st-icon-pandora">
                                    {{
                                        $t(
                                            'user.general.personalInfo.displayName',
                                        )
                                    }}
                                </span>
                            </v-col>
                            <v-col cols="6">
                                <span class="fs-13 st-icon-pandora">
                                    {{ detailInfo.displayName }}
                                </span>
                            </v-col>
                        </v-row>
                        <v-row class="ml-1" style="margin-top: -15px">
                            <v-col cols="6">
                                <span class="fw-430 fs-13 st-icon-pandora">
                                    {{ $t('user.general.personalInfo.email') }}
                                </span>
                            </v-col>
                            <v-col cols="6">
                                <span class="fs-13 st-icon-pandora">
                                    {{ detailInfo.email }}
                                </span>
                            </v-col>
                        </v-row>
                        <v-row class="ml-1" style="margin-top: -15px">
                            <v-col cols="6">
                                <span class="fw-430 fs-13 st-icon-pandora">
                                    {{
                                        $t(
                                            'user.general.personalInfo.phoneNumber',
                                        )
                                    }}
                                </span>
                            </v-col>
                            <v-col cols="6">
                                <span class="fs-13">
                                    {{ detailInfo.phone }}
                                </span>
                            </v-col>
                        </v-row>
                        <v-row class="ml-1" style="margin-top: -15px">
                            <v-col cols="6">
                                <span class="fw-430 fs-13 st-icon-pandora">
                                    {{ $t('user.general.personalInfo.status') }}
                                </span>
                            </v-col>
                            <v-col cols="6">
                                <span
                                    style="color: green"
                                    v-if="detailInfo.status == 1"
                                    class="fs-13"
                                >
                                {{$t('v2.account.active')}}
                                </span>
                                <span
                                    style="color: orange"
                                    class="fs-13"
                                    v-else
                                >
                                {{$t('v2.account.lock')}}
                                </span>
                            </v-col>
                        </v-row>
                    </v-col>
                    <!-- ảnh -->
                    <v-col cols="4">
                        <v-col cols="3" class="text-center">
                            <SymperAvatar
                                :userId="detailInfo.id"
                                style="
                                    height: 135px;
                                    min-width: 135px;
                                    width: 135px;
                                "
                            />
                        </v-col>
                        <span class="fs-13 ml-15 border"
                            >{{$t('v2.account.id')}} {{ detailInfo.id }}</span
                        >
                    </v-col>
                    <!-- ket thuc anh -->
                </v-row>
                <h4 class="mb-2">{{$t('v2.account.permissions')}}</h4>
                <v-row v-if="rolesOgchart.length > 0" class="ml-5 fs-13 fw-430"
                    >{{$t('v2.account.location')}}</v-row
                >
                <v-row
                    class="ml-6"
                    v-for="(rolesOg, index) in rolesOgchart"
                    :key="index"
                >
                    <v-icon class="icon-check mr-0 mt-2">mdi mdi-check</v-icon>
                    <v-btn
                        small
                        text
                        class="fs-13 fm fw-400"
                        @click="viewUserRole(rolesOg.id)"
                    >
                        <span class="fm fw-400">
                            {{ rolesOg.name }}
                        </span>
                    </v-btn>
                </v-row>
                <v-row v-if="roles.length > 0" class="ml-5 fs-13 fw-430">
                    {{$t('v2.account.userRole')}}
                </v-row>
                <v-row
                    class="ml-6 fs-13"
                    v-for="(roles, indexRole) in roles"
                    :key="indexRole"
                >
                    <v-icon class="icon-check mr-0 mt-2">mdi mdi-check</v-icon>
                    <v-btn
                        class="fm fw-400"
                        style="margin-bottom: -8px"
                        text
                        @click="viewUserRole(roles.id)"
                    >
                        <span class="fm">
                            {{ roles.name }}
                        </span>
                    </v-btn>
                </v-row>
            </div>
            <!-- user roles -->
            <div class="w-100 ml-3" v-else>
                <ViewRoles
                    @show-userInfo="isViewUserRole = false"
                    :rolesList="role"
                />
            </div>
            <!-- user roles -->
        </v-stepper>
    </div>
</template>
<script>
import SymperAvatar from '../../components/common/SymperAvatar';
import ViewRoles from '../../views/users/ViewRoles';
import { userApi } from './../../api/user.js';
import { orgchartApi } from './../../api/orgchart.js';
import { systemRoleApi } from './../../api/systemRole.js';
import avatarDefault from '@/assets/image/avatar_default.jpg';

export default {
    components: {
        SymperAvatar,
        ViewRoles,
    },
    props: ['detailInfo', 'changeDetail', 'showDetailView'],
    computed: {
        sapp() {
            return this.$store.state.app;
        },
    },
    methods: {
        // xử lý chuyển tên object
        async getRoleOrgchartByUser(id) {
            const self = this;
            let res = await orgchartApi.getRolesByUser([{ idUser: id }]);
            if (res.status === 200) {
                self.rolesOgchart = res.data[0].roles;
            }
        },
        async getRolesByUser(id) {
            const self = this;
            let res = await systemRoleApi.getRolesByUser([id]);
            if (res.status === 200) {
                self.roles = res.data[0].roles;
            }
        },
        viewUserRole(role) {
            this.isViewUserRole = !this.isViewUserRole;
            this.role = role;
        },
    },
    created() {
        this.getRoleOrgchartByUser(this.detailInfo.id);
        this.getRolesByUser(this.detailInfo.id);
    },
    watch: {
        detailInfo() {
            this.getRoleOrgchartByUser(this.detailInfo.id);
            this.getRolesByUser(this.detailInfo.id);
        },
        showDetailView() {
            this.isViewUserRole = false;
        },
    },
    data() {
        return {
            roles: [],
            id: [],
            rolesOgchart: [],
            isViewUserRole: false,
            role: [],
        };
    },
};
</script>
<style scoped>
.fm {
    font-family: Roboto !important;
    font-size: 13px !important;
}
.fw-400 {
    font-weight: 400;
}
.fw-430 {
    font-weight: 430;
}
.font-normal {
    font-family: Roboto;
    font-size: 13px;
}
.stepper-header {
    width: 200px;
    height: auto;
    display: block;
    border-right: 1px solid #eaeaea;
    box-shadow: none;
}
.stepper-items {
    width: calc(100% - 200px);
}
.stepper-items .row .col {
    padding: 0 3px;
}
.stepper-header .v-stepper__step {
    height: 30px;
    margin: 10px;
    padding: 20px;
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

.v-stepper__wrapper .row .col {
    padding: 0 12px;
}

.btn-next-step {
    position: absolute;
    bottom: 20px;
    right: 20px;
    box-shadow: none;
    background: white;
    color: green;
}
.stepper-create-user {
    box-shadow: none;
    height: calc(100% - 50px);
}
.header-title {
    padding: 0 0 12px 0;
    border-bottom: 1px solid #eaeaea;
}

.input-file {
    width: 0;
    height: 0;
}
.border {
    border: 1px solid lightgrey;
}
.icon-check {
    color: green;
    font-size: 14px;
}
</style>

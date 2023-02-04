<template>
    <div
        style="width: 330px; background-color: white"
        class="user-popup bg-white"
    >
        <div class="pt-3 pl-4 fs-15 fw-430" style="background-color: white">
            {{
                userInfo.detailUser.firstName
                    ? userInfo.detailUser.firstName
                    : ' ' + ' ' + userInfo.detailUser.lastName
                    ? userInfo.detailUser.lastName
                    : ' '
            }}
            <div v-if="rolesOgchart.length > 0" class="fs-13 fw-430 mb-3">
                <v-menu :nudge-left="175">
                    <template v-slot:activator="{ on }">
                        <span v-on="on" class="fm fw-400">
                            {{ userInfo.rolesOgchart[0].name }}
                            <span class="color-blue">
                                +{{ userInfo.rolesOgchart.length }}
                            </span>
                        </span>
                    </template>
                    <v-row
                        class="pl-4 pt-2 fs-13"
                        style="
                            width: 180px !important;
                            background-color: white !important;
                        "
                        v-for="(rolesOg, index) in userInfo.rolesOgchart"
                        :key="index"
                    >
                        {{ rolesOg.name }}
                        <v-icon
                            color="green"
                            v-if="currentRole.id == rolesOg.id"
                        >
                            mdi-check
                        </v-icon>
                    </v-row>
                </v-menu>
            </div>
        </div>
        <v-row class="ml-4">
            <v-col class="col-md-7">
                <v-row class="fs-13 mb-1">
                    <i class="mdi-20px mdi mdi-account-circle mr-1"></i
                    >{{ userInfo.detailUser.userName }}
                </v-row>
                <v-row class="fs-13 mb-1" v-if="userInfo.detailUser.phone">
                    <i class="mdi-20px mdi mdi-phone mr-1"></i
                    >{{ userInfo.detailUser.phone }}
                </v-row>
                <v-row class="fs-13 mb-1" v-if="userInfo.detailUser.email">
                    <i class="mdi-20px mdi mdi-email mr-1"></i>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <span
                                v-on="on"
                                style="width: 90%"
                                class="text-ellipsis"
                                >{{ userInfo.detailUser.email }}</span
                            >
                        </template>
                        <span>{{ userInfo.detailUser.email }}</span>
                    </v-tooltip>
                </v-row>
                <v-row class="fs-13 mb-1">
                    <i class="mdi-20px mdi mdi-border-color mr-1"></i> {{$t('v2.account.createDate')}}:
                    {{ userInfo.detailUser.createAt }}
                </v-row>
                <v-row class="fs-13 mb-1">
                    <i class="mdi-20px mdi mdi-phone mr-1"></i>{{$t('v2.account.status')}}:
                    <span
                        class="ml-1"
                        v-html="reNameStatus(userInfo.detailUser.status)"
                    ></span>
                </v-row>
            </v-col>
            <v-col class="col-md-5">
                <symperAvatar
                    :size="100"
                    style="margin-left: -20px; border-radius: 1px solid red"
                    :userId="userInfo.detailUser.id"
                />
            </v-col>
        </v-row>
    </div>
</template>
<script>
import symperAvatar from '@/components/common/SymperAvatar';
export default {
    props: ['userId'],
    watch: {
        userId() {
            this.getDetailUser();
            this.getRoleOrgchartByUser();
        },
    },
    components: {
        symperAvatar,
    },
    created() {
        this.checkAndSetUserInfo();
    },
    computed: {
        currentRole() {
            return this.$store.state.app.endUserInfo.currentRole;
        },
        userInfo() {
            if (this.$store.state.user.allUserInfo[this.userId]) {
                return this.$store.state.user.allUserInfo[this.userId];
            } else {
                return {
                    detailUser: {},
                    rolesOgchart: [],
                };
            }
        },
    },
    methods: {
        checkAndSetUserInfo() {
            this.$store.dispatch('user/checkAndSetUserInfo', this.userId);
        },
        reNameStatus(status) {
            if (status == 1) {
                return "<span class='color-green'>"+this.$t('v2.account.active')+" </span> ";
            } else if (status == 0) {
                return "<span style='color:orange'> "+this.$t('v2.account.lock')+"</span> ";
            } else {
                return "<span class='color-red'> "+this.$t('v2.account.create')+"</span> ";
            }
        },
        // async getRoleOrgchartByUser(){
        //     const self = this;
        //     let res = await orgchartApi.getRolesByUser([{idUser: this.userId}])
        //     if (res.status === 200) {
        //         self.rolesOgchart = res.data[0].roles
        //     }
        // },
        //  async getDetailUser(){
        //     const self= this;
        //     let res = await userApi.getDetailUser(this.userId);
        //         if(res.status==200){
        //             self.detailUser = res.data.user;
        //             self.detailUser.createAt = dayjs(self.detailUser.createAt).format('DD/MM/YYYY');
        //             self.detailUser.status= self.reNameStatus(self.detailUser.status);
        //         }
        //     }
    },
    data() {
        return {
            detailUser: {},
            rolesOgchart: [],
        };
    },
};
</script>
<style scoped>
.user-popup ::v-deep .v-menu__content {
    background-color: white !important;
}

.color-blue:hover {
    cursor: pointer;
    text-decoration-line: underline;
}
</style>

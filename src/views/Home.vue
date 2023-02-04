<template>
    <div class="home h-100 w-100">
        <v-dialog persistent v-model="dialog" width="397">
            <NotificationChangePass ref="changePass" @cancel="cancelDialog()" />
        </v-dialog>
        <Dashboard></Dashboard>
    </div>
</template>
<script>
import Dashboard from '@/views/dashboard/Dashboard.vue';
import NotificationChangePass from './../components/notification/notificationChangeFirstPass';
import { userApi } from './../../src/api/user';
import MatchingItem from '@/components/document/matchingItem/MatchingItem.vue';

export default {
    name: 'Home',
    methods: {
        runDataflow() {
            this.$refs.dataflow.runDataflow();
        },
        cancelDialog() {
            this.dialog = false;
            this.$store.commit('app/changeStatus', 1);
        },
        checkStatus() {
            if (this.sapp.endUserInfo.status == 2) {
                this.dialog = true;
            }
        },
        setDetailInfo() {
            this.detailInfoUser.lastName = this.sapp.endUserInfo.lastName;
            this.detailInfoUser.displayName = this.sapp.endUserInfo.displayName;
            this.detailInfoUser.firstName = this.sapp.endUserInfo.firstName;
            this.detailInfoUser.email = this.sapp.endUserInfo.email;
            this.detailInfoUser.phone = this.sapp.endUserInfo.phone;
            this.detailInfoUser.status = this.sapp.endUserInfo.status;
            this.detailInfoUser.avatarUrl = this.sapp.endUserInfo.avatar;
            this.detailInfoUser.id = this.sapp.endUserInfo.id;
        },
        getUserInfo() {
            userApi
                .getDetailUser(this.sapp.endUserInfo.id)
                .then((res) => {
                    if (res.status == 200) {
                        if (res.status) {
                            this.isShowChangePassFirstLogin = true;
                        }
                    }
                })
                .catch((err) => {
                    console.log("error from change pass user api!!!", err);
                });
        }
    },
    created() {
        this.getUserInfo();
        this.checkStatus();
        this.$setTabTitle(this.$t('common.home'));
    },
    watch: {
        showUserInfo() {
            this.setDetailInfo();
            if (this.showUserInfo == false) {
                this.$store.commit('user/setShowUser', false);
            }
        },
        dialog(val){
            if(!val){
                this.$refs.changePass.resetToDefault()
            }
        }
    },
    computed: {
        sapp() {
            return this.$store.state.app;
        },
        showUserInfo() {
            return this.$store.state.user.showUserInfo;
        }
    },
    data() {
        return {
            detailInfoUser: {},
            dialog: false,
            isShowChangePassFirstLogin: false
        };
    },
    components: {
        NotificationChangePass,
        Dashboard,
        MatchingItem
    }
};
</script>

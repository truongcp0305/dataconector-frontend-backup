<template>
    <div class="user-info" v-if="userInfo">
        <v-menu open-on-hover top offset-y open-delay="1000" z-index="9999">
            <template v-slot:activator="{ on }">
                <div v-on="on">
                    <div class="d-flex">
                        <symperAvatar
                            :size="20"
                            v-show="isShowAvatar"
                            :userId="userInfo.id"
                            style="margin-top: auto; margin-bottom: auto"
                        />
                        <div class="pl-1 user-name fs-13 text-ellipsis">
                            {{ userInfo.displayName }}
                        </div>
                    </div>
                    <div
                        class="fs-11 text-ellipsis pl-6 grey--text"
                        v-if="Object.keys(roleInfo).length > 0"
                    >
                        {{ roleInfo.name }}
                    </div>
                </div>
            </template>
            <userPopup style="min-height: 190px" :userId="userInfo.id" />
        </v-menu>
    </div>
</template>
<script>
import avatarDefault from '@/assets/image/avatar_default.jpg';
import symperAvatar from '@/components/common/SymperAvatar.vue';
import userPopup from '@/components/user/UserPopUp';
export default {
    components: {
        symperAvatar: symperAvatar,
        userPopup,
    },
    name: 'userInfo',
    props: {
        userId: {
            type: String,
            default: '',
        },
        roleInfo: {
            type: Object,
            default() {
                return {};
            },
        },
        isShowAvatar: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            avatarDefault: avatarDefault,
        };
    },
    computed: {
        userInfo() {
            if (this.userId) {
                let allUsers = this.$store.state.app.allUsers;
                let obj = allUsers.find((data) => data.id === this.userId);
                return obj;
            } else {
                return {};
            }
        },
    },
};
</script>

<style scoped>
.user-name {
    color: rgb(27, 27, 48);
}
.user-name:hover {
    text-decoration-line: underline;
    cursor: pointer;
}
</style>

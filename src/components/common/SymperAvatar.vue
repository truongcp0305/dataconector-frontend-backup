<template>
    <v-avatar v-if="loading" :size="size">
        <img :src="defaultAvatar" class="symper-avatar-image" />
    </v-avatar>
    <v-avatar v-else :size="size">
        <img :src="imgUrl" class="symper-avatar-image" />
    </v-avatar>
</template>

<script>
import defaultAvatar from '@/assets/image/avatar_default.jpg';
import { appConfigs } from '../../configs';
export default {
    data() {
        return {
            defaultAvatar: defaultAvatar,
            imgUrl: defaultAvatar,
            loading: false
        };
    },
    created() {
        this.checkAndGetUrl();
    },
    props: {
        size: {
            type: Number,
            default: 35
        },
        userId: {
            default: 0
        },
        url: {
            type: String,
            default: ''
        }
    },
    watch: {
        userId() {
            this.checkAndGetUrl();
        },
        url() {
            this.checkAndGetUrl();
        },
        userAvatarInfo: {
            deep: true,
            immediate: true,
            handler(newVl) {
                if (newVl) {
                    this.loading = newVl.loading;
                    this.imgUrl = newVl.url;
                } else {
                    this.loading = true;
                    this.imgUrl = defaultAvatar;
                }
            }
        }
    },
    computed: {
        userAvatarInfo() {
            let u = this.$store.state.user.userAvatars[this.userId];
            return u ? u : null;
        }
    },

    methods: {
        async checkAndGetUrl() {
            let userId = this.userId;
            let userAvatar = this.$store.state.user.userAvatars[userId];
            if (!userAvatar) {
                this.$store.commit('user/setAvatarUrl', {
                    id: userId,
                    url: defaultAvatar,
                    loading: true
                });

                this.loading = true;
                this.imgUrl = defaultAvatar;
                if (userId) {
                    let imgUrl =
                        appConfigs.apiDomain.fileManagement +
                        'user-avatar?userId=' +
                        userId;
                    await this.tryUrl(imgUrl);
                } else if (this.url) {
                    await this.tryUrl(this.url);
                } else {
                    this.imgUrl = defaultAvatar;
                }
                this.loading = false;
            } else {
                this.loading = userAvatar.loading;
                this.imgUrl = userAvatar.url;
            }
        },
        tryUrl(imgUrl) {
            let self = this;
            return new Promise(async (resolve, reject) => {
                try {
                    let res = await $.ajax(imgUrl);
                    this.imgUrl = imgUrl;
                    this.$store.commit('user/setAvatarUrl', {
                        id: this.userId,
                        url: imgUrl,
                        loading: false
                    });
                } catch (error) {
                    this.imgUrl = defaultAvatar;
                    this.$store.commit('user/setAvatarUrl', {
                        id: this.userId,
                        url: defaultAvatar,
                        loading: false
                    });
                } finally {
                    resolve();
                }
            });
        }
    }
};
</script>

<style>
.symper-avatar-image {
    height: inherit !important;
}

.symper-avatar-loading .v-skeleton-loader__avatar {
    height: inherit !important;
    width: inherit !important;
}
</style>

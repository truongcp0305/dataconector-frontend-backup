<template>
    <div>
        <v-chip
            class="mr-1 mb-1"
            x-small
            color="grey lighten-5"
            v-for="(u, i) in users"
            :key="i"
            pill
        >
            <SymperAvatar :userId="u.id" :size="10" />
            <span class="text-ellipsis fs-11">
                {{ u.fullName }}
            </span>
        </v-chip>
    </div>
</template>

<script>
import avatarDefault from '@/assets/image/avatar_default.jpg';
import SymperAvatar from '@/components/common/SymperAvatar';

export default {
    components: {
        SymperAvatar,
    },
    mounted() {
        let users = [];
        let ids = this.params.value;
        let mapIdToUser = this.$store.getters['app/mapIdToUser'];
        if (ids) {
            for (let idUser of ids) {
                if (!isNaN(idUser)) {
                    let user = mapIdToUser[idUser];
                    if (user) {
                        users.push({
                            id: user.id,
                            avatar: user.avatar ? user.avatar : avatarDefault,
                            fullName: user.displayName,
                        });
                    }
                }
            }
        }
        this.users = users;
    },
    data() {
        return {
            users: null,
        };
    },
};
</script>

<style></style>

<template>
    <div>
        <div class="d-inline-block float-left mr-3">
            <symperAvatar :size="20" :userId="user.id" />
        </div>
        <div class="d-inline-block">
            <div class="fs-12">{{ user.displayName }}</div>
            <!-- <div class="grey--text fs-11">{{user.role}}</div> -->
            <div class="grey--text fs-12">{{ role.name }}</div>
        </div>
    </div>
</template>

<script>
import avatarDefault from '@/assets/image/avatar_default.jpg';
import symperAvatar from '@/components/common/SymperAvatar.vue';

export default {
    components: {
        symperAvatar: symperAvatar,
    },
    name: 'user',
    props: {
        user: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            avatarDefault: avatarDefault,
        };
    },
    computed: {
        role() {
            return {
                id: '',
                orgchart: '',
                vizId: '',
                name: '',
            };
        },
    },
};
</script>

<style></style>

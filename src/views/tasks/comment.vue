<template>
    <div class="h-100">
        <Comment
            :showComment="true"
            :objectIdentifier="originData.id"
            :objectType="'task'"
        />
    </div>
</template>
<script>
import Comment from '@/components/common/comment/Comment.vue';
export default {
    name: 'comment',
    components: {
        Comment,
    },
    props: {
        taskInfo: {
            type: Object,
            default: () => {},
        },
        originData: {
            type: Object,
            default: () => {},
        },
    },
    mounted() {},
};
</script>

<style></style>

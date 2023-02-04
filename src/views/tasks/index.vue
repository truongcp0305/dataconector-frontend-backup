<template>
    <div class="w-100 h-100">
        <list-task :height="height" @change-height="changeHeight"></list-task>
    </div>
</template>

<script>
import Api from './../../api/api.js';
import list from './list';
export default {
    name: 'ListTaskContainer',
    components: {
        'list-task': list,
    },
    computed: {},
    mounted() {},
    data: function () {
        return {
            virtualdocUrl: 'virtualdocs',
            height: 'calc(100vh - 120px)',
        };
    },
    methods: {
        changeHeight(newHeight) {
            this.height = newHeight;
        },
    },
};
</script>

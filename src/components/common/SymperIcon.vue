<template>
    <span>
        <v-icon v-if="!!icon && icon.includes('mdi-')" :size="size">{{
            icon
        }}</v-icon>
        <img v-else :src="icon" :width="size" :height="size" />
    </span>
</template>

<script>
export default {
    name: 'Icon',
    props: {
        icon: {
            type: String,
            default: '',
        },
        size: {
            type: Number,
            default: 18,
        },
    },
    methods: {},
};
</script>

<style scoped>
#upload-segment {
    width: 100px;
    height: 100px;
    background: #f5f5f5;
    display: block;
    border-radius: 2px;
    margin: 20px auto;
    text-align: center;
    cursor: pointer;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
}
.pickFileIcon {
    margin-top: 25px;
    color: #ccc;
}
</style>

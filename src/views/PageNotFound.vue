<template>
    <v-img
        class="img-not-found"
        :src="require('./../assets/image/not_found.png')"
    />
</template>

<script>
export default {};
</script>

<style>
.img-not-found .v-image__image {
    top: 50%;
    left: 50%;
    width: 83%;
    height: 65%;
    transform: translate(-50%, -50%);
}
.img-not-found .v-responsive__sizer {
    display: none;
}
</style>

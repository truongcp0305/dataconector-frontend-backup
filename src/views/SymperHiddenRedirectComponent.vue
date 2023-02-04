<template>
    <div></div>
</template>

<script>
export default {
    created() {
        let routeObj = this.$route.params.urlInfo;
        this.$router.replace({
            name: routeObj.routeName,
            params: routeObj.routeParams,
        });
        let self = this;
        // setTimeout(() => {
        self.$destroy();
        // }, 5000);
    },
};
</script>

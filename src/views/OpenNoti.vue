<template></template>

<script>
export default {
    created() {
        this.$evtBus.$emit(
            'symper-app-call-action-handler',
            this.$route.query.action,
            this,
            { openInNewTab: true }
        );
    }
};
</script>

<style>
</style>
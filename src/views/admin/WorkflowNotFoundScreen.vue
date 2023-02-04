<template>
    <NotFoundScreen></NotFoundScreen>
</template>

<script>
import NotFoundScreen from '@/components/common/NotFoundScreen';
export default {
    components: { NotFoundScreen },
    created() {
        this.$snotifyInfo(
            '',
            this.$t('v2.admin.notEnoughInfoOrNotRunning')
        );
    }
};
</script>

<style>
</style>
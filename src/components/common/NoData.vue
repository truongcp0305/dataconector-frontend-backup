<template>
    <div class="no-data-message">
        <v-icon size="50">{{ icon }}</v-icon>
        <div>
            {{ message }}
        </div>
    </div>
</template>
<script>
export default {
    props: {
        message: {
            type: String,
            default: this.$t('v2.general.noData')
        },
        icon: {
            type: String,
            default: 'mdi-database-remove'
        }
    }
};
</script>
<style scoped>
.no-data-message {
    text-align: center;
    height: 150px;
    padding: 50px;
}
</style>

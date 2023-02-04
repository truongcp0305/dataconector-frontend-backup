<template>
    <v-alert
        dense
        color="blue lighten-5 "
        class="fs-13 mb-1 alert-form"
        style="margin-bottom: -10px"
        type="info"
    >
        <span class="color-black" v-html="context"></span>
        <span class="color-orange fw-500"> {{ $t('common.detail') }}</span>
        <template v-slot:close>
            <v-btn x-small icon class="color-grey" @click="hide()"
                ><v-icon>mdi-close</v-icon></v-btn
            >
        </template>
    </v-alert>
</template>
<script>
export default {
    name: 'SymperAlert',
    props: {
        context: {
            type: String,
            default: '',
        },
    },
    methods: {
        hide() {
            this.$emit('hide');
        },
    },
};
</script>
<style scoped>
.alert-form >>> .mdi-information {
    color: rgba(0, 0, 0, 0.4) !important;
}
</style>
>

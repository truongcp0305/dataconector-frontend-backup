<template>
    <v-snackbar
        v-model="snackbar"
        :color="color"
        :right="true"
        :timeout="timeout"
        :top="true"
    >
        {{ text }}
        <v-btn dark text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
</template>
<script>
export default {
    name: 'notifications',
    methods: {},
    created() {},
    props: {
        timeout: {
            default: 5000,
        },
        color: {
            default: 'info',
        },
        color: {
            default: 'info',
        },
    },
    data() {
        return {
            snackbar: false,
        };
    },
};
</script>

<style></style>

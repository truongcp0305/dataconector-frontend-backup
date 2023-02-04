<template>
    <v-alert
        class="my-1 position-relative"
        v-model="alert"
        :color="notiColor"
        border="left"
        elevation="6"
        colored-border
        :icon="notiIcon"
    >
        <div class="subtitle-1 font-weight-medium" v-html="data.title"></div>
        <div
            class="fs-13"
            style="word-break: break-word !important"
            v-html="data.text"
        ></div>
        <i class="mdi mdi-close top-right close-btn" @click="handleClose()"></i>
        <div class="mt-2 float-right" v-if="actionBtns.length > 0">
            <v-btn
                @click.stop.prevent="btn.action(handleClose)"
                class="mr-2"
                depressed
                small
                v-for="(btn, idx) in actionBtns"
                :key="idx"
                v-bind="btn.props"
            >
                {{ btn.text }}
                <v-icon v-if="btn.icon" right dark>{{ btn.icon }}</v-icon>
            </v-btn>
        </div>
    </v-alert>
</template>

<script>
const colorMap = {
    success: 'green',
    warn: 'amber',
    error: 'red',
    info: 'blue',
};
const iconMap = {
    success: 'mdi-check-circle',
    warn: 'mdi-exclamation',
    error: 'mdi-alert',
    info: 'mdi-information',
};
export default {
    methods: {
        handleClose() {
            this.$emit('close-notification');
        },
    },
    computed: {
        notiColor() {
            let type = this.data.type;
            return colorMap[type] ? colorMap[type] : colorMap['info'];
        },
        notiIcon() {
            let type = this.data.type;
            return iconMap[type] ? iconMap[type] : iconMap['info'];
        },
        data() {
            return this.props.item.data;
        },
        actionBtns() {
            let thisCpn = this;
            /**
                    {
                        text: "Xử lý",
                        icon: "mdi-send-check",
                        action: () => {
                            thisCpn.$snotify({
                                type: "error",
                                title: "Hello Khá",
                            });
                        }
                    },
                    {
                        text: "Xử lý",
                        props: { color: "red", dark: true },
                        action: () => {
                            thisCpn.$snotify({
                                type: "error",
                                title: "Hello Khá 222222222",
                            });
                        }
                    }
                 */
            return this.props.item.data.actionBtns || [];
        },
    },
    data() {
        return {
            alert: true,
        };
    },
    props: {
        props: {
            default() {
                return {};
            },
        },
    },
};
</script>

<style></style>

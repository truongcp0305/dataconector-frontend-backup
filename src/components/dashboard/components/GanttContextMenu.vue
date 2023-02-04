<template>
    <v-card class="context-menu" v-show="isShowContext">
        <div
            class="context-menu-item"
            v-for="(item, i) in listAction"
            :key="i"
            @click="clickAction(item)"
        >
            <span>{{ item.title }}</span>
        </div>
    </v-card>
</template>
<script>
export default {
    data: () => ({
        isShowContext: false,
    }),
    created() {},
    props: {
        listAction: {
            type: Array,
            default() {
                return [
                    {
                        title: this.$t('common.edit'),
                        action: 'edit-task',
                    },
                    {
                        title: this.$t('common.delete'),
                        action: 'delete-task',
                    },
                ];
            },
        },
    },
    methods: {
        show(e) {
            var windowHeight = $(window).height() / 1.5;
            var windowWidth = $(window).width() / 1.1;
            this.isShowContext = true;
            if (e.clientY > windowHeight && e.clientX <= windowWidth) {
                $('.context-menu')
                    .css('left', e.clientX)
                    .css('bottom', $(window).height() - e.clientY)
                    .css('right', 'auto')
                    .css('top', 'auto');
            } else if (e.clientY > windowHeight && e.clientX > windowWidth) {
                $('.context-menu')
                    .css('right', $(window).width() - e.clientX)
                    .css('bottom', $(window).height() - e.clientY)
                    .css('left', 'auto')
                    .css('top', 'auto');
            } else if (e.clientY <= windowHeight && e.clientX <= windowWidth) {
                $('.context-menu')
                    .css('left', e.clientX)
                    .css('top', e.clientY)
                    .css('right', 'auto')
                    .css('bottom', 'auto');
            } else {
                $('.context-menu')
                    .css('right', $(window).width() - e.clientX)
                    .css('top', e.clientY)
                    .css('left', 'auto')
                    .css('bottom', 'auto');
            }
            $('#symper-app').append(this.$el);
        },
        hide() {
            this.isShowContext = false;
        },
        clickAction(item) {
            this.hide();
            this.$emit('context-menu-click', item.action);
        },
    },
};
</script>
<style scoped>
.context-menu {
    position: fixed;
    z-index: 10000;
    width: 170px;
    font: 13px roboto;
    background-color: #fff;
    -webkit-box-shadow: 2px 0px 24px 0px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 2px 0px 24px 0px rgba(0, 0, 0, 0.75);
    box-shadow: 2px 0px 24px 0px rgba(0, 0, 0, 0.75);
}
.context-menu >>> .context-menu-item {
    padding: 8px 10px;
    font-size: 13px;
    cursor: pointer;
    color: black;
    text-align: left;
    border-bottom: unset;
}
.context-menu >>> .context-menu-item:hover {
    background: #f7f7f7;
}
.context-menu >>> .v-icon {
    font-size: 13px;
}
</style>

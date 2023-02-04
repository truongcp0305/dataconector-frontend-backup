<template>
    <div
        ref="symperDragPanel"
        class="symper-drag-panel elevation-12"
        :style="{
            width: dragPanelWidth + 'px',
            top: topPosition + 'px',
            height: !setHeight ? 'unset' : dragPanelHeight + 'px',
            left: leftPosition + 'px',
            display: selfShowPanel ? 'block' : 'none',
        }"
    >
        <div class="position-relative w-100 h-100">
            <div
                class="pa-2 symper-drag-panel-header"
                style="height: 30px"
                v-show="!hideHeader"
            >
                <span class="float-left pl-2 drag-panel-title">
                    <i
                        :class="'mr-2 mdi ' + titleIcon"
                        v-if="titleIcon != ''"
                    ></i
                    >{{ actionTitle }}
                </span>
                <div class="panel-header-action">
                    <slot name="panel-action"></slot>
                    <v-icon @click="hide" class="close-btn">mdi-close</v-icon>
                </div>
            </div>
            <div class="symper-drag-panel-body px-2 pb-2" :style="styleBody">
                <slot name="drag-panel-content" :panelData="panelData"></slot>
            </div>
            <div ref="resizer" class="symper-drag-panel-resizer">
                <i class="mdi mdi-resize-bottom-right"></i>
            </div>
        </div>
    </div>
</template>

<script>
require('@/../public/vendor/triggerDragElement.js');
export default {
    props: {
        isDetach: {
            type: Boolean,
            default: true,
        },
        showPanel: {
            type: Boolean,
            default: false,
        },
        hideHeader: {
            type: Boolean,
            default: false,
        },
        setHeight: {
            type: Boolean,
            default: true,
        },
        dragPanelWidth: {
            type: Number,
            default: 500,
        },
        dragPanelHeight: {
            type: Number,
            default: 400,
        },
        actionTitle: {
            type: String,
            default: '',
        },
        panelData: {
            type: Object,
            default() {
                return {};
            },
        },
        topPosition: {
            type: Number,
            default: 100,
        },
        leftPosition: {
            type: Number,
            default: 300,
        },
        titleIcon: {
            type: String,
            default: '',
        },
        styleBody: {
            type: Object,
            default() {
                return {};
            },
        },
    },

    data() {
        return {
            selfShowPanel: null,
        };
    },
    beforeMount() {
        this.selfShowPanel = false;
    },
    mounted() {
        setTimeout(
            (self) => {
                dragElement(self.$refs.symperDragPanel);
            },
            200,
            this,
        );
        this.$refs.resizer.addEventListener(
            'mousedown',
            this.initResize,
            false,
        );
    },
    methods: {
        show() {
            this.selfShowPanel = true;
            if (this.isDetach) {
                $('.v-application:first-child').append($(this.$el).detach());
            }
        },
        hide() {
            this.$emit('before-close', {});
            this.selfShowPanel = false;
        },
        initResize(e) {
            window.addEventListener('mousemove', this.resize, false);
            window.addEventListener('mouseup', this.stopResize, false);
        },
        resize(e) {
            let element = this.$refs.symperDragPanel;
            element.style.width = e.clientX - element.offsetLeft + 'px';
            element.style.height = e.clientY - element.offsetTop + 'px';
        },
        stopResize(e) {
            window.removeEventListener('mousemove', this.resize, false);
            window.removeEventListener('mouseup', this.stopResize, false);
        },
    },
};
</script>

<style scoped>
.panel-header-action {
    margin-left: auto;
    margin-top: -5px;
}
.panel-header-action >>> .v-icon {
    font-size: 18px;
}
</style>
<style>
.symper-drag-panel {
    position: fixed;
    overflow: hidden;
    z-index: 500;
    background-color: white;
    border-radius: 3px;
}

.symper-drag-panel .symper-drag-panel-header {
    display: flex;
    cursor: move;
    border-bottom: 1px solid #ededed;
}

.symper-drag-panel .symper-drag-panel-body {
    height: calc(100% - 30px);
}

.drag-panel-title {
    font-size: 15px;
    font-weight: 500;
    position: relative;
    top: -5px;
}

.symper-drag-panel-resizer {
    position: absolute;
    right: 0px;
    bottom: 0px;
    display: inline-block;
    height: 20px;
    width: 20px;
    z-index: 9999999;
    cursor: se-resize;
}

.symper-drag-panel-resizer i {
    font-size: 18px;
    line-height: 18px;
    position: absolute;
}
</style>

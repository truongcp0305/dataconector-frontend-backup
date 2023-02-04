<template>
    <v-navigation-drawer
        v-model="isShowSideBar"
        fixed
        right
        :style="{
            top: '41px',
            padding: '16px 12px',
            width: '320px',
            height: '95%',
        }"
    >
        <div>
            <v-icon
                small
                class="close-btn float-right"
                @click="handlerCloseClick"
            >
                mdi-close
            </v-icon>
        </div>
        <ObjectConfig
            v-if="typeConfig == 'objectConfig'"
            :configObject="configObject"
            :workflowOptions="workflowOptions"
            :action="action"
            @change-col-selected="changeColSelected"
        ></ObjectConfig>
        <LinkConfig
            v-if="typeConfig == 'linkConfig'"
            :configLink="configLink"
            :action="action"
        ></LinkConfig>
    </v-navigation-drawer>
</template>

<script>
import ObjectConfig from '@/components/smartObject/ObjectConfig';
import LinkConfig from '@/components/smartObject/LinkConfig';

export default {
    components: {
        ObjectConfig,
        LinkConfig,
    },
    data() {
        return {};
    },
    props: {
        isShowSideBar: {
            type: Boolean,
            default: false,
        },
        workflowOptions: {
            type: Array,
            default() {
                return [];
            },
        },
        configObject: {
            type: Object,
            default() {
                return {};
            },
        },
        configLink: {
            type: Object,
            default() {
                return {};
            },
        },
        typeConfig: {
            type: String,
            default: '',
        },
        action: {
            type: String,
            default: 'view',
        },
    },
    methods: {
        handlerCloseClick() {
            this.$emit('close-sidebar-config');
        },
        changeColSelected(data) {
            this.$emit('change-col-selected', data);
        },
        changeColSelected(data) {
            this.$emit('change-col-selected', data);
        },
    },
};
</script>

<style scoped></style>

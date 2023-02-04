<template>
    <v-tabs
        :height="30"
        class="s-tabs"
        v-model="sideLeftTab"
        grow
        light
        show-arrows
    >
        <v-tabs-slider color="sym-tab-slider"></v-tabs-slider>

        <v-tab
            class="v-tab-control"
            v-for="tab in sideLeftTabs"
            :key="tab.id"
            style="margin-bottom: 4px"
        >
            <v-tooltip right>
                <template v-slot:activator="{ on }">
                    <v-icon style="font-size: 16px; color: gray" v-on="on">{{
                        tab.icon
                    }}</v-icon>
                </template>
                <span>{{ tab.content }}</span>
            </v-tooltip>
        </v-tab>
        <v-tab-item v-for="tab in sideLeftTabs" :key="tab.id">
            <control-tab
                :instance="instance"
                v-if="tab.id == 'control'"
                :isConfigPrint="isConfigPrint"
            >
            </control-tab>
            <list-control-tab
                :instance="instance"
                v-if="tab.id == 'listControl'"
            >
            </list-control-tab>
            <template-control
                :instance="instance"
                v-if="tab.id == 'templateControl'"
            >
            </template-control>
        </v-tab-item>
    </v-tabs>
</template>
<script>
import ControlTab from './items/ControlTab';
import ListControlTab from './items/ListControlTab.vue';
import TemplateControl from './items/TemplateControl.vue';

export default {
    components: {
        'control-tab': ControlTab,
        'list-control-tab': ListControlTab,
        'template-control': TemplateControl,
    },
    props: {
        instance: {
            type: Number,
            default: Date.now(),
        },
        isConfigPrint: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            sideLeftTab: null,
            sideLeftTabs: [
                {
                    id: 'control',
                    tab: 'Control',
                    icon: 'mdi mdi-drag-variant',
                    content: 'Control',
                },
                {
                    id: 'listControl',
                    tab: this.$t('v2.doc.listControl'),
                    icon: 'mdi mdi-format-list-text',
                    content: this.$t('v2.doc.listControl'),
                },
                {
                    id: 'templateControl',
                    tab: this.$t('v2.doc.templateControl'),
                    icon: 'mdi mdi-package-variant',
                    content: this.$t('v2.doc.templateControl'),
                },
            ],
        };
    },
};
</script>
<style scoped>
.v-tab-control {
    min-width: unset;
    width: 30px;
}
.s-tabs {
    padding-left: 8px;
    padding-right: 8px;
}
</style>

<template>
    <div class="sym-document-tab-control">
        <Loader ref="skeletonView" />
        <v-text-field
            @input="onSearch($event)"
            :placeholder="$t('v2.doc.search')"
            class="tf-search-control fs-13"
            outlined
            dense
            hide-selected
            hide-details
            :height="20"
        >
        </v-text-field>
        <div class="list-control-template">
            <VuePerfectScrollbar style="height: calc(100vh - 115px)">
                <div
                    v-for="(item, index) in allControlTemplate"
                    :key="index"
                    class="control-template-item"
                    :control-id="item.id"
                    draggable="true"
                >
                    <div class="title-control">
                        <span>{{ item.title }}</span>
                        <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    class="btn-action"
                                    dark
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-icon>mdi-dots-horizontal</v-icon>
                                </v-btn>
                            </template>
                            <v-list class="menu-list">
                                <v-list-item
                                    @click="deleteControlTemplate(item)"
                                >
                                    <v-list-item-title>{{$t('v2.doc.delete')}}</v-list-item-title>
                                </v-list-item>

                                <v-list-item @click="editControlTemplate(item)">
                                    <v-list-item-title>{{$t('v2.doc.edit')}}</v-list-item-title>
                                </v-list-item>
                                <v-list-item
                                    @click="previewControlTemplate(item)"
                                >
                                    <v-list-item-title
                                        >{{$t('v2.doc.preview')}}</v-list-item-title
                                    >
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                    <div class="info-control">
                        <div>
                            <span>{{ $t('common.user_create') }}: </span>
                            <span>{{ item.ba_create }}</span>
                        </div>
                        <div>
                            <span>{{ $t('common.create_at') }}: </span>
                            <span>{{ item.create_at }}</span>
                        </div>
                    </div>
                </div>
            </VuePerfectScrollbar>
        </div>
        <symper-drag-panel
            :showPanel="false"
            :dragPanelWidth="800"
            :dragPanelHeight="500"
            :actionTitle="$t('v2.doc.previewControlTemplate')"
            ref="dragPanel"
        >
            <template slot="drag-panel-content">
                <PreviewEditor
                    v-if="isShowPreview"
                    :instance="instance"
                    :content="contentPreview"
                ></PreviewEditor>
            </template>
        </symper-drag-panel>
    </div>
</template>
<script>
import Control from './../../items/Control.vue';
import PreviewEditor from './PreviewEditor';
import getControlElement from './../../../../components/document/controlPropsFactory.js';
import Loader from './../../../../components/common/Loader';
import SymperDragPanel from '@/components/common/SymperDragPanel';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { documentApi } from '../../../../api/Document';

export default {
    props: {
        isConfigPrint: {
            type: Boolean,
            default: false,
        },
        instance: {
            type: Number,
            default: '',
        },
    },
    data() {
        return {
            contentPreview: null,
            isShowPreview: false,
        };
    },
    computed: {
        allControlTemplate() {
            return this.$store.state.document.editor[this.instance]
                .allControlTemplate;
        },
    },
    components: {
        control: Control,
        VuePerfectScrollbar,
        Loader,
        PreviewEditor,
        SymperDragPanel,
    },

    methods: {
        onSearch(event) {
            $('.sym-control').removeClass('d-none');
            $('.sym-control:not(:Contains("' + event + '"))').addClass(
                'd-none',
            );
        },
        getAllControlTemplate() {
            let self = this;
            documentApi.getControlTemplate().then((res) => {
                self.$store.commit('document/addToDocumentEditorStore', {
                    key: 'allControlTemplate',
                    value: res.data,
                    instance: self.instance,
                });
                self.$refs.skeletonView.hide();
            });
        },
        editControlTemplate(control) {
            this.$goToPage(
                '/documents/control-template/' + control.id,
                control.title,
            );
        },
        previewControlTemplate(control) {
            this.contentPreview = control.content;
            this.isShowPreview = true;
            this.$refs.dragPanel.show();
        },
        deleteControlTemplate(control) {
            let thisCpn = this;
            documentApi
                .deleteControlTemplate(control.id)
                .then((res) => {
                    let allControlTemplate = thisCpn.allControlTemplate;
                    let controlTemplate = allControlTemplate.filter((c) => {
                        return c.id == control.id;
                    });
                    let index = allControlTemplate.indexOf(controlTemplate[0]);
                    thisCpn.$store.commit('document/deleteControlTemplate', {
                        index: index,
                        instance: thisCpn.instance,
                    });
                })
                .catch((err) => {})
                .finally(() => {});
        },
    },
    mounted() {
        $.expr[':'].Contains = jQuery.expr.createPseudo(function (arg) {
            return function (elem) {
                return (
                    jQuery(elem)
                        .text()
                        .toUpperCase()
                        .indexOf(arg.toUpperCase()) >= 0
                );
            };
        });
    },
    created() {
        this.getAllControlTemplate();
    },
};
</script>
<style scoped>
.sym-document-tab-control .v-list-item {
    min-height: 25px !important;
}
.v-expand-header {
    font-size: 13px;
    font-weight: 500;
    min-height: unset;
    padding: 4px 8px;
    background: #f2f2f2;
}
.tf-search-control {
    margin: 6px 0px !important;
}

.sym-document-tab-control .v-expansion-panel {
    margin: 0;
}
.sym-list-control {
    overflow: auto;
    max-height: calc(100vh - 110px);
}
.control-template-item {
    padding: 4px;
    font-size: 13px;
    cursor: move;
    margin: 4px 0;
    border: var(--symper-border);
    border-radius: 4px;
}
.control-template-item .title-control {
    display: flex;
    font-weight: 500;
}
.control-template-item .title-control .btn-action {
    height: 18px;
    width: 20px;
    min-width: 20px;
    background-color: var(--symper-background-default) !important;
    box-shadow: none;
    color: #344750;
    margin-left: auto;
}
.control-template-item .title-control .btn-action:focus {
    outline: none;
}
.control-template-item .title-control .btn-action >>> .mdi {
    font-size: 16px;
}
.control-template-item .info-control {
    font-size: 12px;
}
.menu-list >>> .v-list-item {
    min-height: 28px;
}
.menu-list >>> .v-list-item .v-list-item__title {
    font-size: 13px;
}
</style>

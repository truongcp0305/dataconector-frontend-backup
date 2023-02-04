<template>
    <div class="sym-document-tab-control">
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
        <div>
            <VuePerfectScrollbar class="sym-list-control">
                <v-expansion-panels v-model="panel" multiple>
                    <v-expansion-panel v-if="isConfigPrint">
                        <v-expansion-panel-header class="v-expand-header"
                            >{{$t('v2.doc.print')}}</v-expansion-panel-header
                        >
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <v-list>
                                <control
                                    v-for="control in listControlPrint"
                                    :key="control"
                                    :type="control"
                                />
                            </v-list>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="isConfigPrint">
                        <v-expansion-panel-header class="v-expand-header"
                            >Control</v-expansion-panel-header
                        >
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <v-list>
                                <control
                                    v-for="(
                                        control, index
                                    ) in allControlDeleted"
                                    :key="index"
                                    :type="control.type"
                                    :control="control"
                                />
                            </v-list>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="!isConfigPrint">
                        <v-expansion-panel-header class="v-expand-header"
                            >{{$t('v2.doc.display')}}</v-expansion-panel-header
                        >
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <v-list>
                                <control
                                    v-for="control in listControlDisplay"
                                    :key="control"
                                    :type="control"
                                />
                            </v-list>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="!isConfigPrint">
                        <v-expansion-panel-header class="v-expand-header"
                            >{{$t('v2.doc.input')}}</v-expansion-panel-header
                        >
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <v-list>
                                <control
                                    v-for="control in listControlInput"
                                    :key="control"
                                    :type="control"
                                />
                            </v-list>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="!isConfigPrint">
                        <v-expansion-panel-header class="v-expand-header"
                            >{{$t('v2.doc.layout')}}</v-expansion-panel-header
                        >
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <v-list>
                                <control
                                    v-for="control in listControlLayout"
                                    :key="control"
                                    :type="control"
                                />
                            </v-list>
                        </v-expansion-panel-content>
                    </v-expansion-panel>

                    <v-expansion-panel v-if="!isConfigPrint">
                        <v-expansion-panel-header class="v-expand-header"
                            >{{$t('v2.doc.report')}}</v-expansion-panel-header
                        >
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <v-list>
                                <control
                                    v-for="control in listControlReport"
                                    :key="control"
                                    :type="control"
                                />
                            </v-list>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="!isConfigPrint">
                        <v-expansion-panel-header class="v-expand-header"
                            >{{$t('v2.doc.action')}}</v-expansion-panel-header
                        >
                        <v-expansion-panel-content class="sym-v-expand-content">
                            <v-list>
                                <control
                                    v-for="control in listControlAction"
                                    :key="control"
                                    :type="control"
                                />
                            </v-list>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </VuePerfectScrollbar>
        </div>
    </div>
</template>
<script>
import Control from './../../items/Control.vue';
import getControlElement from './../../../../components/document/controlPropsFactory.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
export default {
    props: {
        isConfigPrint: {
            type: Boolean,
            default: false
        },
        instance: {
            type: Number
        }
    },
    computed: {
        sDocumentEditor() {
            return this.$store.state.document.editor[this.instance].allControl;
        },
        allControlDeleted() {
            return this.$store.state.document.editor[this.instance]
                .allControlDeleted;
        }
    },
    components: {
        control: Control,
        VuePerfectScrollbar
    },
    data: () => ({
        panel: [0, 1, 2, 3, 4],
        listControlPrint: ['labelPrint'],
        listControlDisplay: ['label', 'image', 'qrCode', 'title'],
        listControlInput: [
            'textInput',
            'richText',
            'number',
            'date',
            'dateTime',
            'time',
            'select',
            'combobox',
            'department',
            'radio',
            'checkbox',
            'percent',
            'user',
            'inputFilter',
            'documentInstanceIdentifier',
            'location'
        ],
        listControlLayout: ['table', 'panel', 'fileUpload', 'tabPage'],
        listControlReport: ['dataFlow', 'approvalHistory'],
        listControlAction: ['submit']
    }),
    methods: {
        onSearch(event) {
            $('.sym-control').removeClass('d-none');
            $('.sym-control:not(:Contains("' + event + '"))').addClass(
                'd-none'
            );
        }
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
    }
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
    max-height: calc(100vh - 110px);
}
</style>
<style>
.sym-v-expand-content .v-expansion-panel-content__wrap {
    padding: 0;
}
.sym-v-expand-content .v-list {
    padding: 0 !important;
}
</style>

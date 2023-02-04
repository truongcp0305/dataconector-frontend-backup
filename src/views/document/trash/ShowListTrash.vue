<template>
    <list-items
        ref="listDocument"
        :getDataUrl="sDocumentManagementUrl + 'documents/trash'"
        :useDefaultContext="false"
        :tableContextMenu="tableContextMenu"
        :pageTitle="$t('document.title')"
        :containerHeight="containerHeight"
        :actionPanelWidth="actionPanelWidth"
        :headerPrefixKeypath="'document'"
        :commonActionProps="commonActionProps"
    >
    </list-items>
</template>
<script>
import { appConfigs } from '@/configs.js';
import { documentApi } from './../../../api/Document.js';
import ListItems from './../../../components/common/ListItems.vue';
import { util } from './../../../plugins/util.js';
export default {
    components: {
        'list-items': ListItems,
    },
    data() {
        return {
            sDocumentManagementUrl: appConfigs.apiDomain.sdocumentManagement,
            commonActionProps: {
                module: 'document',
                resource: 'document_definition',
                scope: 'document',
            },
            documentId: 0,
            actionPanelWidth: 830,
            containerHeight: 200,
            tableContextMenu: {
                restore: {
                    name: 'restore',
                    text: `<i class= 'mdi mdi-file-document-edit-outline' > </i>&nbsp; ${this.$t('v2.doc.restore')}`,
                    callback: (document, callback) => {
                        let thisCpn = this;
                        documentApi
                            .restoreDocument({ id: document.id })
                            .then((res) => {
                                if (res.status == 200) {
                                    thisCpn.$snotify({
                                        type: 'success',
                                        title: thisCpn.$t('v2.doc.restoreDocumentSuccess'),
                                    });
                                    thisCpn.$refs.listDocument.refreshList();
                                } else {
                                    thisCpn.$snotify({
                                        type: 'error',
                                        title: res.messagr,
                                    });
                                }
                            })
                            .catch((err) => {
                                console.log(
                                    'error from delete document api!!!',
                                    err,
                                );
                            })
                            .finally(() => {});
                    },
                },
                edit: {
                    name: 'editdoc',
                    text: ` <i class= 'mdi mdi-file-document-edit-outline' > </i>&nbsp; ${this.$t('v2.doc.edit')}`,
                    callback: (document, callback) => {
                        this.$goToPage(
                            '/documents/' + document.id + '/editor/edit',
                            document.title,
                        );
                    },
                },
                drop: {
                    name: 'delete',
                    text: ` <i class= 'mdi mdi-delete-outline' > </i>&nbsp; ${this.$t('v2.doc.delete')}`,
                    callback: (document, callback) => {
                        let ids = document.reduce((arr, obj) => {
                            arr.push(obj.id);
                            return arr;
                        }, []);
                        let thisCpn = this;
                        documentApi
                            .deleteDocument({ ids: ids.join() })
                            .then((res) => {
                                if (res.status == 200) {
                                    thisCpn.$snotify({
                                        type: 'success',
                                        title: thisCpn.$t('v2.doc.deleteDocumentSuccess'),
                                    });
                                    thisCpn.$refs.listDocument.refreshList();
                                } else {
                                    thisCpn.$snotify({
                                        type: 'error',
                                        title: res.messagr,
                                    });
                                }
                            })
                            .catch((err) => {
                                console.log(
                                    'error from delete document api!!!',
                                    err,
                                );
                            })
                            .finally(() => {});
                    },
                },
            },
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    created() {
        let thisCpn = this;
        this.$evtBus.$on('change-user-locale', (locale) => {
            thisCpn.tableContextMenu = [
                {
                    name: 'passwordsetting',
                    text: this.$t('user.table.contextMenu.passwordSetting'),
                },
                { name: 'edit', text: this.$t('user.table.contextMenu.edit') },
            ];
        });
    },
    watch: {},
    methods: {
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
        aftersubmitDocument() {
            this.$refs.listDocument.closeactionPanel();
        },
    },
};
</script>

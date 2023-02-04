<template>
    <list-items
        :getDataUrl="
            sDocumentManagementUrl + 'documents/' + docId + '/draft-objects'
        "
        :useDefaultContext="false"
        :tableContextMenu="tableContextMenu"
        :pageTitle="$t('draft.title')"
        :containerHeight="containerHeight"
        :headerPrefixKeypath="'document'"
        :actionPanelWidth="actionPanelWidth"
        ref="listObject"
        :emptyDataKey="'document-draft-list'"
    >
    </list-items>
</template>
<script>
import { appConfigs } from '@/configs.js';
import ListItems from './../../../components/common/ListItems.vue';
import ActionPanel from './../../../views/users/ActionPanel.vue';
import { documentApi } from './../../../api/Document.js';
import { util } from './../../../plugins/util.js';
import Detail from './../detail/Detail.vue';
export default {
    components: {
        'list-items': ListItems,
        'detail-object': Detail,
        'action-panel': ActionPanel,
    },
    data() {
        return {
            sDocumentManagementUrl: appConfigs.apiDomain.sdocumentManagement,
            docId: 0,
            actionPanelWidth: 800,
            containerHeight: 200,
            tableContextMenu: [
                {
                    name: 'delete',
                    text: this.$t('v2.doc.delete'),
                    callback: (documentObject, callback) => {
                        console.log('das', documentObject);
                        let ids = documentObject.reduce((arr, obj) => {
                            arr.push(obj.id);
                            return arr;
                        }, []);
                        let thisCpn = this;
                        documentApi
                            .deleteDocumentDraftObject({
                                objectIds: ids.join(),
                            })
                            .then((res) => {
                                if (res.status == 200) {
                                    thisCpn.$snotify({
                                        type: 'success',
                                        title: thisCpn.$t('v2.doc.deleteDocumentObjectSuccess')
                                    });
                                    thisCpn.$refs.listObject.refreshList();
                                } else {
                                    thisCpn.$snotify({
                                        type: 'error',
                                        title: res.messagr,
                                    });
                                }
                            })
                            .catch((err) => {})
                            .finally(() => {});
                    },
                },
                {
                    name: 'submit',
                    text: this.$t('v2.doc.input'),
                    callback: (documentObject, callback) => {
                        this.$goToPage(
                            '/document/objects/update/' + documentObject.id,
                            'Cập nhật',
                        );
                    },
                },
            ],
        };
    },
    computed: {},
    mounted() {
        this.calcContainerHeight();
    },
    created() {
        let thisCpn = this;
        this.$evtBus.$on('change-user-locale', (locale) => {});
        this.docId = this.$route.params.id;
    },
    watch: {},
    methods: {
        submitDocument() {
            this.$router.push('/document/submit/' + this.docId);
        },

        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
    },
};
</script>

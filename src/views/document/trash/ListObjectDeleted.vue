<template>
    <div class="w-100">
        <list-items
            class="history-document"
            ref="listItem"
            :useDefaultContext="false"
            :tableContextMenu="tableContextMenu"
            :pageTitle="$t('common.sidebar.listTrashRecord')"
            :containerHeight="containerHeight"
            :actionPanelWidth="actionPanelWidth"
            :customAPIResult="customAPIResult"
            :defaultData="defaultData"
            :getDataUrl="sDocumentManagementUrl + 'documents/' + docId + '/objects?isDeleted=0'"
            :showButtonAdd="false"
            :headerByTranslateName="false"
        >
        </list-items>
        <v-dialog v-model="dialog" max-width="290">
            <v-card>
                <v-card-title class="headline">{{$t('v2.doc.confirmRestore')}}</v-card-title>
                <v-card-text>
                    {{$t('v2.doc.confirmRestore')}} {{ countRestore }} {{$t('v2.doc.record')}}
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn color="darken-1" text @click="dialog = false">
                        {{ $t('common.close') }}
                    </v-btn>

                    <v-btn color="green" text @click="restoreDocumentObject">
                        {{ $t('common.restore') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
import { documentApi } from './../../../api/Document.js';
import ListItems from './../../../components/common/ListItems.vue';
import { util } from './../../../plugins/util.js';
import { appConfigs } from '@/configs';
export default {
    name: 'ListTrashRecords',
    components: {
        'list-items': ListItems,
    },
    data() {
        return {
            dialog: false,
            dataRestore: null,
            countRestore: 1,
            defaultData: {},
            customAPIResult: {
                reformatData(res) {
                    if (res.status == 200) {
                        let richTextColArr = [];
                        let locationColArr = [];
                        res.data.columns.forEach((col) => {
                            if (col.type == 'richtext') {
                                richTextColArr.push(col.name);
                            }
                            if (col.type == 'location') {
                                locationColArr.push(col.name);
                            }
                        });
                        res.data.listObject.forEach((obj) => {
                            richTextColArr.forEach((col) => {
                                if (obj[col]) {
                                    obj[col] = obj[col].replaceAll(
                                        /<[^>]*>/g,
                                        ''
                                    );
                                }
                            });
                            locationColArr.forEach((col) => {
                                if (obj[col]) {
                                    obj[col] = JSON.parse(obj[col])
                                    if(obj[col].address){
                                        obj[col] = obj[col].address
                                    }else {
                                        obj[col] = obj[col].lat + ';' + obj[col].lng
                                    }
                                }
                            });
                        });
                        res.data.columns.forEach(function (e) {
                            if (e.type == 'richtext') {
                                e.cellRenderer = function (params) {
                                    let content = '';
                                    let rtf = params.value;
                                    if (rtf) {
                                        rtf = rtf.replace(/\\par[d]?/g, '');
                                        rtf = rtf.replace(
                                            /\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g,
                                            ''
                                        );
                                        content = rtf
                                            .replace(/\\'[0-9a-zA-Z]{2}/g, '')
                                            .trim();
                                    }
                                    return '<span>' + content + '</span>';
                                };
                            }
                            if (e.type == 'fileUpload') {
                                e.hide = true;
                            }
                        });
                        return {
                            columns: res.data.columns,
                            listObject: res.data.listObject,
                            total: res.data.total
                        };
                    } else {
                        return {};
                    }
                }
            },
            docId: this.$route.params.id,
            sDocumentManagementUrl: appConfigs.apiDomain.sdocumentManagement,
            actionPanelWidth: 830,
            containerHeight: 200,
            tableContextMenu: {
                restore: {
                    name: 'restore',
                    text: this.$t('common.restore'),
                    callback: (documentObject, callback) => {
                        this.dialog = true;
                        this.dataRestore = documentObject;
                    },
                },
            },
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    methods: {
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
        restoreDocumentObject() {
            this.dialog = false;
            let dataRestore = util.cloneDeep(this.dataRestore);
            let thisCpn = this;
            let objectIds = [dataRestore.document_object_id];
            documentApi
                .restoreObject(
                    thisCpn.docId,
                    {objectIds: JSON.stringify(objectIds)}
                )
                .then((res) => {
                    if (res.status == 200) {
                        thisCpn.$snotify({
                            type: 'success',
                            title: thisCpn.$t('v2.doc.restoreDocumentSuccess'),
                        });
                        thisCpn.$refs.listItem.refreshList();
                    } else {
                        thisCpn.$snotify({
                            type: 'error',
                            title: thisCpn.$t('notification.error'),
                        });
                    }
                })
                .catch((err) => {
                    console.log('error from restore record api!!!', err);
                });
        },
    },
};
</script>

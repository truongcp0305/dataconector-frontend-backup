<template>
    <div class="w-100">
        <list-items
            ref="listImport"
            :showImportHistory="false"
            :showButtonAdd="false"
            :headerPrefixKeypath="'import.table'"
            :useDefaultContext="false"
            :pageTitle="$t('import.import_history')"
            :containerHeight="containerHeight"
            :showExportButton="false"
            :customAPIResult="customAPIResult"
            :tableContextMenu="tableContextMenu"
            :getDataUrl="getListUrl"
        >
        </list-items>
        <v-navigation-drawer
            :style="{ width: drawer ? '500px' : '0' }"
            v-model="drawer"
            absolute
            temporary
            right
        >
            <action-panel :importInfo="importInfo" />
        </v-navigation-drawer>
    </div>
</template>
<script>
import { documentApi } from './../../api/Document.js';
import ActionPanel from './../../views/import/Detail.vue';
import ListItems from './../../components/common/ListItems.vue';
import { util } from './../../plugins/util.js';
import { appConfigs } from '../../configs';

export default {
    components: {
        'list-items': ListItems,
        'action-panel': ActionPanel,
    },
    data() {
        const self = this;
        return {
            showDetailView: false,
            listRowUser: [],
            listUser: [],
            nameUser: [],
            importInfo: {},
            drawer: false,
            showImportUser: false,
            customAPIResult: {
                setObjectType(obj) {
                    let name = '';
                    switch (obj) {
                        case '1':
                            name = this.$t('v2.importExport.majorDoc');
                            break;
                        case '3':
                            name = this.$t('v2.importExport.systemDoc');
                            break;

                        case '2':
                            name = this.$t('v2.importExport.categoryDoc');
                            break;
                        case null:
                            name = this.$t('v2.importExport.blank');
                    }
                    return name;
                },
                setStatusImport(status) {
                    let nameStatus = '';
                    switch (status) {
                        case '0':
                            nameStatus = this.$t('v2.importExport.notImport');
                            break;
                        case '-1':
                            nameStatus = this.$t('v2.importExport.err');
                            break;
                        case '1':
                            nameStatus = this.$t('v2.importExport.processing');
                            break;

                        case '2':
                            nameStatus = this.$t('v2.importExport.finished');
                            break;
                        default:
                            nameStatus = this.$t('v2.importExport.finished');
                    }
                    return nameStatus;
                },
                setNameDocument() {
                    let listDoc = this.listDocument;
                },
                reformatData(ress) {
                    let data = ress.data;
                    let listIdDoc = [];
                    for (let i = 0; i < data.listObject.length; i++) {
                        if (data.listObject[i].objId) {
                            listIdDoc.push(data.listObject[i].objId);
                        }
                        data.listObject[i].status = this.setStatusImport(
                            data.listObject[i].status,
                        );
                        data.listObject[i].subObjType = this.setObjectType(
                            data.listObject[i].subObjType,
                        );
                    }
                    let listDocName = [];
                    listIdDoc = listIdDoc.filter(
                        (item, index) => listIdDoc.indexOf(item) === index,
                    );
                    documentApi
                        .getBatchDocument({ ids: JSON.stringify(listIdDoc) })
                        .then((res) => {
                            if (res.status === 200) {
                                listDocName.push(res.data);
                                for (
                                    let i = 0;
                                    i < data.listObject.length;
                                    i++
                                ) {
                                    for (
                                        let j = 0;
                                        j < listDocName[0].length;
                                        j++
                                    ) {
                                        if (
                                            listDocName[0][j].id ==
                                            data.listObject[i].objId
                                        ) {
                                            data.listObject[i].objId =
                                                listDocName[0][j].title;
                                        }
                                    }
                                }
                                self.$refs.listImport.rerenderTable();
                            }
                        })
                        .catch(console.log);
                    data.columns[7].renderer = function (
                        instance,
                        td,
                        row,
                        col,
                        prop,
                        value,
                        cellProperties,
                    ) {
                        let span;
                        $(td).empty();
                        let div = document.createElement('div');
                        span = document.createElement('span');
                        if (value === this.$t('v2.importExport.err')) {
                            $(span).css('color', 'red');
                            $(span).text(this.$t('v2.importExport.err'));
                        } else if (value === this.$t('v2.importExport.notImport')) {
                            $(span).css('color', 'orange');
                            $(span).text(this.$t('v2.importExport.notImport'));
                        } else if (value === this.$t('v2.importExport.processing')) {
                            $(span).css('color', 'blue');
                            $(span).text(this.$t('v2.importExport.notImport'));
                        } else {
                            $(span).css('color', 'green');
                            $(span).text(this.$t('v2.importExport.finished'));
                        }
                        td.appendChild(span);
                        return td;
                    };
                    return data;
                },
            },
            tableContextMenu: {
                view: {
                    name: 'viewDetail',
                    text: this.$t('import.table.contextMenu.viewDetail'),
                    callback: (importEx, callback) => {
                        this.showDetail(importEx);
                    },
                },
                downloadExcel: {
                    name: 'downloadExcel',
                    text: this.$t('import.table.contextMenu.download'),
                    callback: (importEx, callback) => {
                        this.downloadExcel(importEx);
                    },
                },
            },
            getListUrl: appConfigs.apiDomain.viewHistoryImport,
            actionPanelWidth: 800,
            containerHeight: 200,
            columns: [],
            linkDownload: appConfigs.apiDomain.importExcel,
            totalPage: 6,
            listDocument: [],
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    methods: {
        downloadExcel(importEx) {
            let fileName = importEx.fileName;
            window.location.href = this.linkDownload + 'download/' + fileName;
        },
        showDetail(importEx) {
            this.importInfo = importEx;
            this.drawer = !this.drawer;
        },
        refreshListUser() {
            this.$refs.listUser.refreshList();
        },
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
    },
};
</script>

<template>
    <div class="w-100">
        <list-items
            ref="listDocument"
            :customAPIResult="customAPIResult"
            :getDataUrl="sDocumentManagementUrl + 'documents'"
            :useDefaultContext="false"
            :tableContextMenu="tableContextMenu"
            :actionPanelType="'elastic'"
            :showCloseIcon="true"
            :pageTitle="$t('document.title')"
            :containerHeight="containerHeight"
            :actionPanelWidth="actionPanelWidth"
            :useActionPanel="false"
            :showExportButton="false"
            :showImportButton="false"
            @get-list-id="getListId"
            @cell-mouse-over="getRowSelected"
            @on-add-item-clicked="addDocument"
            @close-panel="closePanel"
            :headerPrefixKeypath="'document'"
            :commonActionProps="commonActionProps"
            :emptyDataKey="'document-doc-list'"
        >
            <div slot="right-panel-content" class="h-100">
                <submit-view
                    v-if="isShowQuickSubmit"
                    ref="submitView"
                    class="showlist-context"
                    @close-quick-submit="closeQuickSubmit"
                    :isQickSubmit="true"
                    :action="'submit'"
                    @submit-document-success="aftersubmitDocument"
                    :docId="documentId"
                />
                <div v-if="isDocumentIndex" class="h-100">
                    <div class="header-panel">
                        {{$t('v2.doc.selectColumnIndex')}}
                    </div>
                    <VuePerfectScrollbar class="listControl">
                        <v-expansion-panels multiple>
                            <v-expansion-panel
                                class="m-0"
                                v-for="(doc, index) in listControlInDoc"
                                :key="index"
                            >
                                <v-expansion-panel-header
                                    class="v-expand-header"
                                >
                                    <div class="d-flex">
                                        <div>
                                            {{ doc.name + ' - ' + doc.title }}
                                        </div>
                                    </div>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content
                                    class="sym-v-expand-content"
                                >
                                    <table class="w-100">
                                        <tr
                                            style="
                                                text-align: left;
                                                background: #f2f2f2;
                                            "
                                        >
                                            <th
                                                style="
                                                    padding: 8px;
                                                    width: 200px;
                                                "
                                            >
                                                Index
                                                <v-btn
                                                    height="20"
                                                    width="20"
                                                    min-width="25"
                                                    depressed
                                                    @click="
                                                        onCreateIndexClick(doc)
                                                    "
                                                >
                                                    <v-icon size="16"
                                                        >mdi-plus</v-icon
                                                    >
                                                </v-btn>
                                            </th>
                                            <th style="padding: 8px">
                                                {{$t('v2.doc.listColumn')}}
                                            </th>
                                        </tr>
                                        <tr>
                                            <td
                                                style="
                                                    display: flex;
                                                    flex-flow: column;
                                                "
                                            >
                                                <div
                                                    v-for="(
                                                        index, i
                                                    ) in doc.indexs"
                                                    :key="i"
                                                    class="index-item"
                                                    :style="{
                                                        background: index.active
                                                            ? '#f2f2f2'
                                                            : '',
                                                    }"
                                                    @click="
                                                        onIndexItemClick(
                                                            doc,
                                                            index,
                                                        )
                                                    "
                                                >
                                                    <span>{{
                                                        index.name
                                                    }}</span>
                                                    <v-icon
                                                        size="16"
                                                        @click="
                                                            onRemoveIndex(
                                                                doc.indexs,
                                                                i,
                                                                index,
                                                            )
                                                        "
                                                        >mdi-trash-can-outline</v-icon
                                                    >
                                                </div>
                                            </td>
                                            <td>
                                                <div
                                                    class="control"
                                                    v-for="control in doc.control"
                                                    :key="control.name"
                                                    @click="
                                                        onClickControl(
                                                            doc,
                                                            control,
                                                        )
                                                    "
                                                >
                                                    <div>
                                                        {{ control.name }} -
                                                        {{ control.title }}
                                                    </div>
                                                    <v-icon
                                                        v-if="control.checked"
                                                        size="16"
                                                        color="green"
                                                        >mdi-check-bold</v-icon
                                                    >
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </VuePerfectScrollbar>
                    <div class="footer-action">
                        <v-btn depressed @click="onSaveIndex"> {{$t('v2.doc.save')}} </v-btn>
                    </div>
                </div>
                <div v-if="showTaskDetail">
                    <TaskDetail
                        @repeated-submit="repeatedSubmit()"
                        :repeatedSubmit="true"
                        :taskInfo="data.taskInfo"
                        :originData="data.originData"
                        :parentHeight="taskDetailHeight"
                        :allVariableProcess="variableProcess"
                        @task-submited="handleTaskSubmited"
                    />
                </div>
            </div>
        </list-items>
        <ImportExcelPanel :options="options" :open="showImportPanel" />
    </div>
</template>
<script>
import { getFirstNodeData as handleStartProcess } from '../../components/process/StartProcess';
import { getLastestDefinition } from './../../components/process/processAction.js';
import ImportExcelPanel from '@/components/document/ImportExelPanel';
import { documentApi } from './../../api/Document.js';
import bpmnApi from './../../api/BPMNEngine.js';
import ListItems from './../../components/common/ListItems.vue';
import ActionPanel from './../../views/users/ActionPanel.vue';
import Submit from './submit/Submit';
import { util } from './../../plugins/util.js';
import { appConfigs } from '../../configs';
import TaskDetail from './../../components/myItem/TaskDetail';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
export default {
    components: {
        ImportExcelPanel: ImportExcelPanel,
        'list-items': ListItems,
        'action-panel': ActionPanel,
        'submit-view': Submit,
        VuePerfectScrollbar,
        TaskDetail,
    },
    data() {
        return {
            listWorkflows: [],
            listId: [],
            variableProcess: [],
            listProcess: [],
            startProcess: {
                name: 'startProcess',
                subMenu: [],
                text:
                    "<i class= 'mdi mdi-bike-fast' > </i>&nbsp" +
                    this.$t('document.instance.showlist.startProcess'),
            },
            data: {
                taskInfo: {},
                originData: {},
            },
            paramId: '',
            taskDetailHeight: 800,
            sDocumentManagementUrl: appConfigs.apiDomain.sdocumentManagement,
            documentId: 0,
            listWorkFollow: [],
            rowActive: null,
            showTaskDetail: false,
            options: {},
            proccessRow: {},
            isDocumentIndex: false,
            allIndexSelected: [],
            listControlInDoc: {},
            commonActionProps: {
                module: 'document',
                resource: 'document_definition',
                scope: 'document',
            },
            showImportPanel: false,
            actionPanelWidth: 830,
            containerHeight: 200,
            isShowQuickSubmit: false,
            tableContextMenu: {
                edit: {
                    name: 'editdoc',
                    text:
                        "<i class= 'mdi mdi-file-document-edit-outline' > </i>&nbsp" +
                        this.$t('common.edit'),
                    callback: (document, callback) => {
                        this.$goToPage(
                            '/documents/' + document.id + '/editor/edit',
                            document.title,
                        );
                    },
                },

                clone: {
                    name: 'cloneDoc',
                    text:
                        " <i class= 'mdi mdi-file-document-multiple-outline' > </i>&nbsp" +
                        this.$t('common.copy'),
                    callback: (document, callback) => {
                        this.$goToPage(
                            '/documents/' + document.id + '/editor/clone',
                            this.$t('common.copy') + document.title,
                        );
                    },
                },
                submit: {
                    name: 'submit',
                    text:
                        " <i class= 'mdi mdi-file-document-outline' > </i>&nbsp" +
                        this.$t('draft.draftList.insert'),
                    callback: (document, callback) => {
                        const self = this;
                        self.$goToPage(
                            '/documents/' + document.id + '/submit',
                            document.title,
                        );
                        // }else{
                        //     self.$snotify({
                        //         type: "error",
                        //         title: "Không cho phép nhập liệu"
                        //     })
                        // }
                    },
                },
                quick_submit: {
                    name: 'quickSubmit',
                    text:
                        "<i class= 'mdi mdi-text-box-plus-outline' > </i>&nbsp" +
                        this.$t('document.instance.showlist.quickSubmit'),
                    callback: (document, callback) => {
                        this.isShowQuickSubmit = true;
                        this.$refs.listDocument.openactionPanel();
                        this.documentId = document.id;
                    },
                },
                list: {
                    name: 'listObject',
                    text:
                        " <i class= 'mdi mdi-format-list-checkbox' > </i>&nbsp" +
                        this.$t('documentObject.title'),
                    callback: (document, callback) => {
                        this.$goToPage(
                            '/documents/' + document.id + '/objects',
                            this.$t('documentObject.title'),
                            false,
                            true,
                            { document: document },
                        );
                        this.$store.commit(
                            'document/setCurrentTitle',
                            document.title,
                        );
                    },
                },
                list_draft: {
                    name: 'listDraftObject',
                    text:
                        " <i class= 'mdi mdi-playlist-edit' > </i>&nbsp" +
                        this.$t('draft.title'),
                    callback: (document, callback) => {
                        this.$goToPage(
                            '/documents/' + document.id + '/draft-objects',
                            this.$t('draft.draftList.title'),
                        );
                    },
                },
                print_config: {
                    name: 'printConfig',
                    text:
                        " <i class= 'mdi mdi-printer-3d-nozzle-outline' > </i>&nbsp" +
                        this.$t('document.instance.showlist.printConfig'),
                    callback: (document, callback) => {
                        this.$goToPage(
                            '/documents/' +
                                document.id +
                                '/editor/print-config',
                            document.title,
                        );
                    },
                },
                list_print_config: {
                    name: 'listPrintConfig',
                    text:
                        " <i class= 'mdi mdi-format-list-checkbox' > </i>&nbsp" +
                        this.$t('document.instance.showlist.listPrints'),
                    callback: (document, callback) => {
                        this.$goToPage(
                            '/documents/' + document.id + '/print-config',
                            'Danh sách bản in',
                        );
                    },
                },
                drop: {
                    name: 'remove',
                    text:
                        " <i class= 'mdi mdi-delete-outline' > </i>&nbsp" +
                        this.$t('common.delete'),
                    callback: (document, callback) => {
                        let ids = document.reduce((arr, obj) => {
                            arr.push(obj.id);
                            return arr;
                        }, []);
                        let thisCpn = this;
                        documentApi
                            .moveToTrash({ ids: ids.join() })
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
                                        title: res.message,
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
                list_trash: {
                    name: 'listTrash',
                    text:
                        " <i class= 'mdi mdi-trash-can-outline' > </i>&nbsp" +
                        this.$t('common.sidebar.listTrash'),
                    callback: (document, callback) => {
                        this.$goToPage(
                            '/documents/' + document.id + '/trash-objects',
                            'Danh sách bản xóa',
                        );
                    },
                },
                templateExcel: {
                    name: 'templateExcel',
                    text:
                        " <i class= 'mdi mdi-file-upload-outline' > </i>&nbsp" +
                        this.$t('document.instance.showlist.importForm'),
                    callback: (document, callback) => {
                        this.documentId = document.id;
                        let exportUrl =
                            this.sDocumentManagementUrl +
                            'documents/' +
                            this.documentId +
                            '/export-excel?isTemplate="1"';
                        if (!exportUrl) {
                            if (
                                this.getDataUrl[this.getDataUrl.length - 1] ==
                                '/'
                            ) {
                                exportUrl = this.getDataUrl + 'export';
                            } else {
                                exportUrl = this.getDataUrl + '/export';
                            }
                        }

                        window.open(exportUrl, '_blank');
                    },
                },
                importExcel: {
                    name: 'importExcel',
                    text: ` <i class= 'mdi mdi-file-upload-outline' > </i>&nbsp;${this.$t('v2.doc.importExcel')}`,
                    callback: (document, callback) => {
                        const self = this;
                        self.showImportPanel = !self.showImportPanel;
                        self.documentId = document.id;
                    },
                },
                documentIndex: {
                    name: 'documentIndex',
                    text:
                        "<i class= 'mdi mdi-bike-fast' > </i>&nbsp" +
                        this.$t('document.instance.showlist.optimizeData'),
                    callback: (document, callback) => {
                        this.rowActive = document;
                        this.isDocumentIndex = true;
                        this.allIndexSelected = [];
                        this.$refs.listDocument.openactionPanel();
                        this.getListControl(document);
                    },
                },
            },
            customAPIResult: {
                async reformatData(data) {
                    data.data.columns.push({
                        name: 'appName',
                        title: 'appName',
                        type: 'text',
                        width: 120,
                    });
                    if (data.data.listObject.length > 0) {
                        let ids = data.data.listObject.map((e) => {
                            return JSON.stringify(e.id);
                        });
                        let res = await documentApi.getAppNameByDocIds(ids);
                        if (res.status == 200) {
                            data.data.listObject.forEach(function (e) {
                                if (res.data[e.id]) {
                                    e.appName = res.data[e.id].join(',');
                                }
                            });
                        }
                    }
                    data.data.columns.forEach(function (e) {
                        e.cellRenderer = function (params) {
                            let content = '';
                            let rtf = params.value;
                            if (rtf) {
                                rtf = rtf.replace(/\\par[d]?/g, '');
                                rtf = rtf.replace(
                                    /\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g,
                                    '',
                                );
                                content = rtf
                                    .replace(/\\'[0-9a-zA-Z]{2}/g, '')
                                    .trim();
                            }
                            return '<span>' + content + '</span>';
                        };
                    });
                    return data.data;
                },
            },
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    created() {
        let thisCpn = this;
        this.tableContextMenu.startProcess = this.startProcess;
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
    watch: {
        documentId() {
            this.getApiDocument();
        },
        listId() {
            if (this.listId.length > 0) {
                this.getAllProcess(this.listId);
            }
        },
        taskInfo() {
            this.data = this.taskInfo.data;
            this.variableProcess = this.taskInfo.variableProcess;
            this.showTaskDetail = true;
        },
    },
    methods: {
        closeQuickSubmit() {
            this.$refs.listDocument.closeactionPanel();
            this.closePanel();
        },
        handleTaskSubmited() {
            this.$store.commit('task/setIsStatusSubmit', true);
        },
        async repeatedSubmit() {
            const self = this;
            let defData = await getLastestDefinition(this.proccessRow, true);
            if (defData.data[0]) {
                this.$refs.listDocument.openactionPanel();
                this.paramId = defData.data[0].id;
                handleStartProcess(defData.data[0].id);
            } else {
                self.$snotifyError(
                    {},
                    self.$t('v2.doc.cannotFindProcess'),
                );
            }
        },
        getListId(data) {
            this.listId = data;
        },
        // lấy ra tất cả các quy trình liên quan dựa theo id doc
        getAllProcess(data) {
            this.listProcess = [];
            let listId = data.join(',');
            const self = this;
            bpmnApi.getProcessByDocId(listId).then((res) => {
                if (res.status == 200) {
                    Object.keys(res.data).map((idDoc) => {
                        self.listId.map((l) => {
                            if (idDoc == l) {
                                this.tableContextMenu.startProcess =
                                    this.startProcess;
                                self.listProcess.push({
                                    id: idDoc,
                                    listProcess: res.data[idDoc],
                                });
                            }
                        });
                    });
                }
            });
        },
        getRowSelected(param) {
            this.getListWorkFollowName(param.data.id);
        },
        getListWorkFollowName(docId) {
            this.tableContextMenu.startProcess = {};
            const self = this;
            this.listProcess.map((process) => {
                if (process.id == docId) {
                    this.tableContextMenu.startProcess = this.startProcess;
                    this.tableContextMenu.startProcess.subMenu = [];
                    process.listProcess.map((p) => {
                        let row = p;
                        self.proccessRow = p;
                        self.tableContextMenu.startProcess.subMenu.push({
                            name: p.name,
                            action: async function (row, action) {
                                let defData = await getLastestDefinition(
                                    self.proccessRow,
                                    true,
                                );
                                if (defData.data[0]) {
                                    self.$refs.listDocument.openactionPanel();
                                    self.paramId = defData.data[0].id;
                                    handleStartProcess(defData.data[0].id);
                                    // self.getFirstNodeData(defData.data[0].id)
                                } else {
                                    self.$snotifyError(
                                        {},
                                        self.$t('v2.doc.cannotFindProcess'),
                                    );
                                }
                            },
                        });
                    });
                }
            });
        },
        onRemoveIndex(indexs, i, index) {
            indexs.splice(i, 1);
            if (index.uid) {
                let indexRemove = [];
                indexRemove.push({ parent: index.parent, name: index.name });
                documentApi
                    .deleteIndex(index.uid, {
                        indexs: JSON.stringify(indexRemove),
                    })
                    .then((res) => {});
            }
        },
        onIndexItemClick(doc, index) {
            this.$set(doc, 'indexActive', index);
            for (let index = 0; index < doc.indexs.length; index++) {
                if (doc.indexs[index].active) {
                    doc.indexs[index].active = false;
                }
            }
            let columnActive = index.column;
            for (let index = 0; index < doc.control.length; index++) {
                if (columnActive.includes(doc.control[index].name)) {
                    this.$set(doc.control[index], 'checked', true);
                } else {
                    this.$set(doc.control[index], 'checked', false);
                }
            }
            this.$set(index, 'active', true);
        },
        onCreateIndexClick(doc) {
            doc.indexs.push({
                name: 'new_index_' + eval(doc.indexs.length + 1),
                parent: doc.key,
                column: [],
            });
        },
        getListControl(document) {
            let self = this;
            documentApi.getFieldStruct(document.id).then((res) => {
                if (res.status == 200) {
                    self.listControlInDoc = res.data;
                }
            });
        },

        onSaveIndex() {
            for (let key in this.listControlInDoc) {
                let document = this.listControlInDoc[key];
                if (document.indexs.length == 0) {
                    continue;
                }
                for (let i = 0; i < document.indexs.length; i++) {
                    const index = document.indexs[i];
                    if (index.hasChange && index.column.length > 0) {
                        this.allIndexSelected.push(index);
                    }
                }
            }
            if (this.allIndexSelected.length == 0) {
                return;
            }
            let self = this;
            let dataPost = {
                documentName: this.rowActive.name,
                indexs: JSON.stringify(this.allIndexSelected),
            };
            documentApi.saveColumnIndex(dataPost).then((res) => {
                if (res.status == 200) {
                    self.$refs.listDocument.closeactionPanel();
                    self.$snotify({
                        type: 'success',
                        title: self.$t('v2.doc.addIndexSuccess'),
                    });
                } else {
                    self.$snotify({
                        type: 'error',
                        title: res.message,
                    });
                }
            });
        },
        onClickControl(doc, control) {
            if (doc.indexActive) {
                this.$set(control, 'checked', !control.checked);
                if (control.checked) {
                    doc.indexActive.column.push(control.name);
                } else {
                    doc.indexActive.column.splice(
                        doc.indexActive.column.indexOf(control.name),
                        1,
                    );
                }
                this.$set(doc.indexActive, 'hasChange', true);
            }
        },
        closePanel() {
            this.isShowQuickSubmit = false;
            this.isDocumentIndex = false;
        },
        getApiDocument() {
            const self = this;
            documentApi
                .detailDocument(this.documentId)
                .then((res) => {
                    if (res.status === 200) {
                        self.options = {};
                        self.options.objId = self.documentId;
                        self.options.objType = 'document_definition';
                        self.options.subObjType = res.data.document.type;
                        self.options.nameObj = res.data.document.title;
                    }
                })
                .catch((err) => {
                    // console.log(err)
                });
        },
        addDocument() {
            this.$goToPage(
                '/document/editor/' + Date.now(),
                'Danh sách bản in',
            );
        },

        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
        aftersubmitDocument() {
            this.$refs.listDocument.closeactionPanel();
        },
    },
    computed: {
        taskInfo() {
            return this.$store.state.process.allTaskInfo;
        },
    },
};
</script>

<style scoped>
.control {
    display: flex;
    height: 25px;
    padding: 5px 4px;
    cursor: pointer;
    transition: background ease-in-out 200ms;
}
.control:hover {
    background: var(--symper-background-hover);
}
.control >>> .v-icon {
    margin-left: auto;
}
.listControl {
    height: calc(100% - 80px);
}
.footer-action {
    text-align: right;
}
.header-panel {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
    border-bottom: var(--symper-border);
}
.index-name {
    height: 25px;
    width: 150px;
    background: var(--symper-background-default);
    border-radius: 4px;
    margin-left: 4px;
    padding: 0 8px;
}
.index-name:hover {
    outline: none;
}
::v-deep .v-expand-header {
    padding: 12px 4px;
}
table {
    border-collapse: collapse;
    width: 100%;
}

::v-deep .v-expansion-panel-content__wrap {
    padding: 0 !important;
}
.index-item {
    padding: 8px;
    margin: 1px 0;
    display: flex;
    cursor: pointer;
    transition: background ease-in-out 200ms;
}
.index-item:hover {
    background: var(--symper-background-hover);
}
.index-item >>> .v-icon {
    margin-left: auto;
}
</style>

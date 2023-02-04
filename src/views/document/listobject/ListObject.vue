<template>
    <div class="h-100 w-100 list-object-component">
        <AutocompleteDoc
            v-if="!isViewSmartObject"
            ref="autoCompleteDocs"
            :docId="docId"
            style="position: absolute; top: 12px"
            :style="{
                left: changeDocLeftStyle,
                display: collapsedAutoComplete ? 'none' : 'block'
            }"
            @is-render-title="calcWidthAutoCompleteDocs"
            @change="handleChange"
        />
        <list-items
            :headerByTranslateName="false"
            :idDoc="commonActionProps.parentId"
            :noPermission="noPermission"
            :hasScheduler="isShowTabScheduler"
            :hasKanban="isShowTabKanban"
            :isViewSmartObj="sqlConditonLinkSmartObject ? true : false"
            :isShowListDocument="true"
            :getDataUrl="getDataUrl"
            :exportLink="
                sDocumentManagementUrl + 'documents/' + docId + '/export-excel'
            "
            :autoCompleteWidth="autoCompleteWidth"
            :exportFileName="exportFileName"
            :useantext="false"
            :productList="true"
            :actionPanelHeaderConfig="actionPanelHeaderConfig"
            @save-item="saveItem"
            @action-panel-change="handleActinPanelChange"
            @collapsed-menubar="collapsedMenubarHandler"
            @collapsed-autocomplete-doc="collapsedAutoCompleteHandler"
            :tableContextMenu="tableContextMenu"
            :pageTitle="$t('documentObject.title')"
            :containerHeight="containerHeight"
            :actionPanelWidth="
                !isViewKanban ? actionPanelWidth : kanbanWidthForm
            "
            :hideTitleOnSbsView="true"
            :actionPanelType="
                !isViewKanban && !isViewScheduler ? 'elastic' : 'modal'
            "
            :showCloseIcon="isViewKanban || isViewScheduler"
            :showActionPanelInDisplayConfig="showActionPanelInDisplayConfig"
            :showExportButton="isListOrgchart ? false : true"
            :showButtonAdd="showButtonAdd"
            :showImportButton="false"
            :isTablereadOnly="false"
            :conditionByFormula="conditionByFormula"
            @after-open-add-panel="submitDocument"
            @data-loaded="afterGetData"
            @before-keydown="afterRowSelected"
            @after-cell-mouse-down="afterRowSelected"
            @row-selected="afterCellSelection"
            @row-selected-change="rowSelectedChange"
            @after-close-panel="closePanelAction"
            :commonActionProps="commonActionProps"
            :customAPIResult="customAPIResult"
            :customGetDataForFilter="customGetDataForFilter"
            :customConditionsForFilter="customConditionsForFilter"
            :customHeaderBtn="customHeaderBtn"
            :overlayMessage="loadingDataLabel"
            ref="listObject"
            @export-excel="exportExcel"
            :isExporting="isExporting"
            :isViewShowList="isViewShowList"
            :isViewScheduler="isViewScheduler"
            :emptyDataKey="emptyDataKey"
            :isViewKanban="isViewKanban"
            :showTabView="showTabView"
            :showFilter="showFilter"
            @on-add-item-clicked="addObject"
            :showTitle="showTitle"
            :showDisplayConfig="showDisplayConfig"
            :apiMethod="apiMethod"
            @cell-mouse-over="tableContextMenuByFilter"
            :customDataForApi="customDataForApi"
            :customContentType="customContentType"
            @change-conditional-formula="changeConditionalFormula"
            :tabViewObject="tabView"
            :isShowButtonClose="isShowButtonClose"
            @close-list="$emit('close-list')"
            :widgetIdentifier="widgetIdentifier"
            :headerPrefixKeypath="isListOrgchart ? 'table' : ''"
        >
            <div
                v-if="!isViewKanban && !isViewScheduler"
                slot="right-panel-content"
                class="h-100"
                :class="
                    actionPanelWidth == 1250
                        ? 'd-flex justify-space-between'
                        : ''
                "
            >
                <div v-if="isDeleteMultiple" class="h-100">
                    <div class="d-flex">
                        <h2>{{ $t('v2.doc.retrievalFormulaDelete') }}</h2>
                        <v-icon
                            @click="closePanelFormulas"
                            style="margin-left: auto; font-size: 20px"
                            >mdi-close</v-icon
                        >
                    </div>
                    <div class="formulas-input">
                        <FormTpl
                            :singleLine="false"
                            :labelWidth="`100px`"
                            :allInputs="formulasInput"
                        />
                        <v-icon @click="runFormulas" class="run-formulas-btn"
                            >mdi-send</v-icon
                        >
                    </div>
                    <v-progress-linear
                        v-if="showProgress"
                        indeterminate
                        color="orange"
                    ></v-progress-linear>
                    <br />
                    <v-btn
                        small
                        depressed
                        color="red"
                        outlined
                        @click="deleteRowSelected"
                        class="delete-record-btn"
                    >
                        <v-icon left>mdi-trash-can-outline</v-icon>
                        {{ $t('common.delete') }}
                    </v-btn>
                    <!-- test -->
                    <!-- <v-btn
                        small
                        depressed
                        color="red"
                        outlined
                        v-if="!formulasInput.formula.value"
                        @click="deleteAll"
                        class="delete-all-record-btn"
                    >
                        <v-icon left>mdi-trash-can-outline</v-icon>
                        {{ $t('common.deleteAll') }}
                    </v-btn> -->
                    <!-- test -->
                </div>
                <div
                    class="h-100"
                    v-else
                    :style="{
                        width: actionPanelWidth == 1250 ? '850px' : '',
                        display: actionPanelWidth == 400 ? 'none' : 'block'
                    }"
                >
                    <div
                        class="panel-header"
                        v-if="actionOnRightSidebar == 'detail'"
                    >
                        <div class="left-action">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-icon @click="hidePanel" v-on="on"
                                        >mdi-close</v-icon
                                    >
                                </template>
                                <span>{{ $t('common.close') }}</span>
                            </v-tooltip>
                            <v-tooltip bottom v-if="!isViewOrgchart">
                                <template v-slot:activator="{ on }">
                                    <v-icon @click="prevRecord" v-on="on"
                                        >mdi-chevron-left</v-icon
                                    >
                                </template>
                                <span>{{
                                    $t('document.instance.showlist.prev')
                                }}</span>
                            </v-tooltip>
                            <v-tooltip bottom v-if="!isViewOrgchart">
                                <template v-slot:activator="{ on }">
                                    <v-icon @click="nextRecord" v-on="on"
                                        >mdi-chevron-right</v-icon
                                    >
                                </template>
                                <span>{{
                                    $t('document.instance.showlist.next')
                                }}</span>
                            </v-tooltip>
                            <span class="document-title">{{
                                panelDocTitle
                            }}</span>
                        </div>
                        <div class="right-action">
                            <span
                                class="copyed d-none"
                                transition="scroll-y-reverse-transition"
                                >{{
                                    $t('document.instance.showlist.copied')
                                }}</span
                            >
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        class="new-tab-btn-container"
                                        @click="viewExpandObject"
                                        v-on="on"
                                    >
                                        <span class="new-tab-btn">{{
                                            $t('v2.doc.viewExtend')
                                        }}</span>
                                    </v-btn>
                                </template>
                                <span>{{
                                    $t('document.instance.showlist.newTab')
                                }}</span>
                            </v-tooltip>
                            <v-tooltip bottom v-if="!isViewOrgchart">
                                <template v-slot:activator="{ on }">
                                    <v-icon
                                        @click="addToClipboard($event)"
                                        :clipboard="dataClipboard"
                                        v-on="on"
                                        >mdi-page-next-outline</v-icon
                                    >
                                </template>
                                <span>{{
                                    $t('document.instance.showlist.copyLink')
                                }}</span>
                            </v-tooltip>
                            <!-- <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-icon  @click="downloadRecord" v-on="on">mdi-download-outline</v-icon>
                            </template>
                            <span>{{$t('document.instance.showlist.download')}}</span>
                        </v-tooltip> -->
                            <v-tooltip bottom v-if="!isViewOrgchart">
                                <template v-slot:activator="{ on }">
                                    <v-icon
                                        @click="showDetailInfoDocument"
                                        v-on="on"
                                        >mdi-information-outline</v-icon
                                    >
                                </template>
                                <span>{{
                                    $t('document.instance.showlist.info')
                                }}</span>
                            </v-tooltip>
                            <v-tooltip bottom v-if="!isViewOrgchart">
                                <template v-slot:activator="{ on }">
                                    <v-icon
                                        @click="updateCurrentRecord"
                                        v-on="on"
                                        >mdi-pencil</v-icon
                                    >
                                </template>
                                <span>{{
                                    $t('document.instance.showlist.update')
                                }}</span>
                            </v-tooltip>
                            <v-tooltip bottom v-if="!isViewOrgchart">
                                <template v-slot:activator="{ on }">
                                    <v-icon @click="handleClickPrint" v-on="on"
                                        >mdi-printer</v-icon
                                    >
                                </template>
                                <span>{{
                                    $t('document.detail.fab.print')
                                }}</span>
                            </v-tooltip>
                        </div>
                    </div>
                    <span
                        class="title float-left"
                        v-if="actionOnRightSidebar == 'update'"
                    >
                        {{ $t('document.instance.showlist.update') }}
                    </span>
                    <span
                        class="title float-left"
                        v-if="actionOnRightSidebar == 'create'"
                    >
                        {{ $t('document.instance.showlist.submit') }}
                    </span>
                    <v-icon
                        class="close-btn float-right"
                        @click="hidePanel"
                        v-if="
                            actionOnRightSidebar == 'update' ||
                            actionOnRightSidebar == 'create'
                        "
                        >mdi-close</v-icon
                    >
                    <div class="panel-body" v-if="!isAddRecord && isSbsView">
                        <detail-object
                            v-if="
                                actionOnRightSidebar == 'detail' &&
                                isSbsView &&
                                docObjInfo &&
                                docObjInfo.docObjId &&
                                !isViewOrgchart
                            "
                            @after-hide-sidebar="afterHideSidebarDetail"
                            ref="viewDetail"
                            @after-load-document="handleAfterLoadDocument"
                            @add-upload-panel="addUploadPanel"
                            :quickView="true"
                            @set-upload-control="setUploadControl"
                            :docObjInfo="docObjInfo"
                        />
                        <DocumentSubmit
                            class="listobject-context"
                            v-if="
                                actionOnRightSidebar == 'update' &&
                                docObjInfo &&
                                docObjInfo.docObjId &&
                                !isViewOrgchart
                            "
                            :action="'update'"
                            :isQickSubmit="true"
                            @add-upload-panel="addUploadPanel"
                            :documentObjectId="docObjInfo.docObjId"
                            @submit-document-success="onDocumentUpdateSuccess"
                        />
                        <slot
                            v-if="isViewOrgchart"
                            name="view-orgchart"
                            :ref="orgchart"
                        />
                    </div>
                    <div class="panel-body" v-else-if="isSbsView">
                        <DocumentSubmit
                            ref="documentSubmit"
                            class="showlist-context"
                            :action="'submit'"
                            @submit-document-success="onDocumentSubmitSuccess"
                            :docId="documentIdQuickSubmit"
                        />
                    </div>
                </div>
                <div style="width: 400px">
                    <PreviewUploadFile
                        :showHiddenStar="
                            actionOnRightSidebar == 'detail' ? true : false
                        "
                        :typeDisplay="
                            productListMode ? 'temporary' : 'pernament'
                        "
                        :showInfoDoc="false"
                        :isSetMain="
                            actionOnRightSidebar == 'detail' ? false : true
                        "
                        class="preview-upload-file"
                        ref="previewUploadFile"
                        :width="widthUpload"
                        :isShowHideDoc="showHideDoc"
                        @close="closePreviewUploadFile"
                        @show-doc-info="onOffDoc"
                        :listUploadControl="previewUploadFile.listUploadControl"
                        @select-image="showGallary"
                    />
                </div>
            </div>
            <div
                v-if="isViewKanban"
                slot="right-panel-content"
                style="height: 94%"
            >
                <detail-object
                    v-if="actionKanban == 'view'"
                    class="doc-detail"
                    ref="detailCard"
                    :showInfoBtn="false"
                    :showCommentInDoc="false"
                    :docObjInfo="{
                        docObjId: documentObjectId,
                        docSize: '21cm'
                    }"
                    :showActionQuickView="true"
                    :quickView="true"
                />
                <DocumentSubmit
                    v-else
                    @close-dialog-validate="hideLoadingSaveKanban"
                    ref="documentSubmit"
                    :action="actionKanban == 'create' ? 'submit' : 'update'"
                    :documentObjectId="
                        actionKanban == 'create' ? '' : documentObjectId
                    "
                    :showSnackbarSuccess="false"
                    :docId="commonActionProps.parentId"
                    :showSubmitButton="false"
                    @submit-document-success="onSubmitKanbanDone"
                    class="popup-context"
                    @load-form-success="loadFormSuccess"
                    :isCloneType="isCloneType"
                    :isViewPopup="true"
                    @submit-document-error="submiDocumentError"
                />
            </div>
            <div
                slot="tab-view"
                class="h-100"
                slot-scope="{
                    instanceKey,
                    filterKanban,
                    filterScheduler,
                    userColumnControl,
                    searchKey,
                    viewModeScheduler
                }"
            >
                <ListItemTabView
                    :listTabsView="listTabsView"
                    @change-tab-view="changeTabView"
                    v-if="showTabView"
                    :idDoc="commonActionProps.parentId"
                    :isShowTabKanban="isShowTabKanban"
                    :isShowTabScheduler="isShowTabScheduler"
                    :filterKanban="filterKanban"
                    :filterScheduler="filterScheduler"
                    :userColumnControl="userColumnControl"
                    :instanceKey="instanceKey"
                    :searchKey="searchKey"
                    :viewModeScheduler="viewModeScheduler"
                />
            </div>
            <div slot="tab-view-smart-object">
                <slot name="tab-view-smart-object" />
            </div>
        </list-items>
        <Tablet
            :listobject="recordPreview"
            :listItem="listTabletItem"
            :width="'30cm'"
            :height="'80%'"
            :title="`<span class='mdi mdi-printer-settings'></span> &nbsp;${$t(
                'v2.doc.selectPrintPattern'
            )}`"
            @after-selected-item-tablet="afterSelectedItem"
            class="view-print-config"
            ref="listPrintView"
        >
            <template slot="contentBinding">
                <PrintView :isAlwaysPrint="false" :allObject="allObjectPrint" />
            </template>
            <template slot="actionBinding">
                <button
                    v-for="(action, index) in listActionForPrint"
                    :key="index"
                    @click="action.action()"
                >
                    {{ action.title }}
                </button>
            </template>
        </Tablet>
        <BottomSheet ref="bottomSheetView" class="h-100">
            <div slot="content" class="sheet-content d-flex">
                <div class="count-selection">
                    <span
                        >{{ $t('document.instance.showlist.select') }}
                        {{ countRecordSelected }}
                        {{ $t('document.instance.showlist.record') }}</span
                    >
                </div>
                <div class="sheet-action">
                    <div v-if="isDeleteMultiple">
                        <v-btn small @click="printSelected">
                            <v-icon left>mdi-trash-can-outline</v-icon>
                            {{ $t('common.delete') }}
                        </v-btn>
                        <v-btn @click="hideBottomSheet" tile small>
                            {{ $t('common.close') }}
                        </v-btn>
                    </div>
                    <div v-else>
                        <v-btn tile small @click="printSelected">
                            <v-icon left>mdi-printer</v-icon>
                            {{ $t('document.instance.showlist.printRecord') }}
                        </v-btn>
                        <v-btn @click="selectPrintConfig" tile small>
                            <v-icon left>mdi-printer-pos</v-icon>
                            {{
                                $t(
                                    'document.instance.showlist.selectPrintConfig'
                                )
                            }}
                        </v-btn>
                        <v-btn @click="hideBottomSheet" tile small>
                            {{ $t('common.close') }}
                        </v-btn>
                    </div>
                </div>
            </div>
        </BottomSheet>
        <v-dialog v-model="dialog" max-width="290">
            <v-card>
                <v-card-title class="headline">{{
                    $t('v2.doc.titleConfirmDelete')
                }}</v-card-title>
                <v-card-text>
                    {{ $t('v2.doc.contentConfirmDelete') }}
                    {{ countRecordSelected }} {{ $t('v2.doc.record') }}
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn color="darken-1" text @click="dialog = false">
                        {{ $t('common.close') }}
                    </v-btn>

                    <v-btn color="green" text @click="confirmDelete">
                        {{ $t('common.delete') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <LightBox
            :isShowStar="isShowStar"
            :isSetMain="isSetMain"
            ref="lightbox"
            :media="listImage"
            :show-caption="true"
            :show-light-box="true"
        />

        <v-dialog v-model="relatedTasks.show" persistent width="90%">
            <div
                :style="{
                    height: relatedTasksDialogHeight
                }"
                class="w-100 bg-white pa-3"
            >
                <MyItemShowList
                    ref="relatedTasks"
                    v-if="relatedTasks.search"
                    :selectFirstTaskAfterGetList="'byIndex'"
                    :showCloseBtn="true"
                    :filterFromParent="{
                        relatedTasksByDocObjId:
                            relatedTasks.myItemFilter.byDocObjId
                    }"
                    @close="relatedTasks.show = false"
                />
            </div>
        </v-dialog>
        <RoleSectorWhenStartProcess
            :objectInfo="{
                id: docId + ':0',
                type: 'document_instance',
                action: 'update_by_workflow'
            }"
            ref="roleSector"
            :processId="updateByWorkflowId"
        />
    </div>
</template>
<script>
import LightBox from './../../../components/common/imageSlideShow/LightBox';
import PreviewUploadFile from './../../../components/common/PreviewUploadFile';
import { appConfigs } from '@/configs.js';
import ListItems from './../../../components/common/ListItems.vue';
import BottomSheet from './../../../components/common/BottomSheet';
import PrintView from './../print/PrintView';
import ActionPanel from './../../../views/users/ActionPanel.vue';
import Tablet from './../../../components/common/Tablet';
import FormTpl from '@/components/common/FormTpl.vue';
import { documentApi } from './../../../api/Document.js';
import { util } from './../../../plugins/util.js';
import DocumentSubmit from '@/views/document/submit/Submit.vue';
import AutocompleteDoc from './AutocompleteDoc';
import MyItemShowList from '@/views/myItem/MyItemShowList.vue';
import RoleSectorWhenStartProcess from '@/views/process/RoleSectorWhenStartProcess.vue';

import { uiConfigApi } from '@/api/uiConfig';
import { startWorkflowBySubmitedDoc } from '../../../components/process/processAction';
import BPMNEngine from '@/api/BPMNEngine.js';
import ListItemTabView from '@/components/common/ListItemTabView';
import { schedulerApi } from '@/api/scheduler.js';
import KanbanViewEnduser from 'worker-loader!@/worker/kanban/KanbanViewEnduser.Worker.js';
const SYMPER_RELATED_TASK_COUNT = 'symper_related_task_count';
import { SYMPER_APP } from '@/main.js';
export default {
    components: {
        'list-items': ListItems,
        'detail-object': () => import('./../detail/Detail.vue'),
        'action-panel': ActionPanel,
        Tablet,
        LightBox,
        BottomSheet,
        PrintView,
        DocumentSubmit,
        FormTpl,
        PreviewUploadFile,
        AutocompleteDoc,
        MyItemShowList,
        RoleSectorWhenStartProcess,
        ListItemTabView
    },
    computed: {
        widgetIdentifier() {
            return `my-applications:listDocumentObject:` + this.docId;
        },
        listTabsView() {
            let isViewShowList = this.isViewShowList;
            let isShowTabKanban = this.isViewKanban;
            let isShowTabScheduler = this.isViewScheduler;
            let listTabsView = {
                listItem: {
                    title: this.$t('v2.doc.list'),
                    value: isViewShowList
                }
            };

            if (this.isShowTabKanban) {
                listTabsView.Kanban = {
                    title: 'Kanban',
                    value: isShowTabKanban
                };
            }
            if (this.isShowTabScheduler) {
                listTabsView.Scheduler = {
                    title: 'Scheduler',
                    value: isShowTabScheduler
                };
            }

            return listTabsView;
        },
        relatedTasksDialogHeight() {
            return window.innerHeight * 0.9 + 'px';
        },
        showButtonAdd() {
            let appData = this.$store.state.app;
            if (this.isListOrgchart) {
                return false;
            }
            if (appData.baInfo.id != 0) {
                return true;
            } else {
                let flag = false;
                for (let item in appData.userOperations.document_definition) {
                    if (
                        item.includes(this.docId) &&
                        (appData.userOperations.document_definition[item]
                            .submit ||
                            appData.userOperations.document_definition[item]
                                .submit_by_workflow)
                    ) {
                        flag = true;
                        continue;
                    }
                }
                return flag;
            }
        },
        userId() {
            return this.$store.state.app.endUserInfo.id;
        },
        listFileExport() {
            return this.$store.state.exportExcel.listFileExport;
        },
        customHeaderBtn() {
            let self = this;
            if (this.showCustomButton) {
                return {
                    findRelatedTasks: {
                        icon: 'mdi-format-list-checks',
                        tooltip: this.$t('v2.doc.findRelatedJobs'),
                        class: '',
                        callback() {
                            self.triggerFindRelatedTasks();
                        }
                    }
                };
            } else return {};
        },
        getDataUrl() {
            if (this.customUrlGetData) {
                return this.customUrlGetData;
            } else {
                return (
                    this.sDocumentManagementUrl +
                    'documents/' +
                    this.docId +
                    '/objects'
                );
            }
        },
        conditionByFormula() {
            if (this.sqlConditonLinkSmartObject) {
                return this.sqlConditonLinkSmartObject;
            }
            return this.formulasInput.formula.value;
        },

        tableContextMenu() {
            const self = this;
            let menu = {
                delete: self.getDeleteActionMenu(),
                clone: {
                    name: 'clone',
                    text: this.$t('common.clone'),
                    callback: (documentObject, callback) => {
                        this.$goToPage(
                            '/document/objects/clone/' +
                                documentObject.document_object_id,
                            this.$t('common.clone')
                        );
                    }
                },
                detail: {
                    name: 'detail',
                    text: this.$t('common.detail'),
                    callback: (documentObject, callback) => {
                        if (this.isViewSmartObject) {
                            if (
                                this.docObjInfo.docObjId ==
                                    documentObject.document_object_id &&
                                this.$refs.listObject.actionPanel
                            ) {
                                return;
                            }
                            this.currentDocObjectActiveIndex =
                                this.dataTable.findIndex(
                                    (obj) =>
                                        obj.document_object_id ==
                                        documentObject.document_object_id
                                );
                            this.$refs.listObject.openactionPanel();
                            this.dataClipboard =
                                window.location.origin +
                                '/#/documents/objects/' +
                                documentObject.document_object_id;
                            this.docObjInfo = {
                                docObjId: documentObject.document_object_id,
                                docSize: 'calc(100%)'
                            };
                        } else {
                            this.$goToPage(
                                '/documents/objects/' +
                                    documentObject.document_object_id,
                                'Chi tiết'
                            );
                        }
                    }
                },

                list_print: {
                    name: 'listPrint',
                    text: this.$t('document.instance.showlist.listPrintConfig'),
                    callback: (documentObject, callback) => {
                        this.$refs.listPrintView.show();
                        this.recordPreview = {
                            record: {
                                document_object_id:
                                    documentObject.document_object_id
                            }
                        };
                    }
                },
                print: {
                    name: 'print',
                    text: this.$t('document.instance.showlist.print'),
                    callback: (documentObject, callback) => {
                        this.$goToPage(
                            '/documents/objects/' +
                                documentObject.document_object_id,
                            'In nhanh'
                        );
                    }
                },
                show_checkbox: {
                    name: 'showCheckBox',
                    text: this.$t('document.instance.showlist.printMultiple'),
                    callback: (documentObject, callback) => {
                        this.toggleCheckBoxListItem();
                    }
                },
                delete_multi: {
                    name: 'deleteMulti',
                    text: this.$t('document.instance.showlist.deleteMultiple'),
                    callback: (documentObject, callback) => {
                        this.isDeleteMultiple = true;
                        this.toggleCheckBoxListItem(false);
                        this.actionPanelWidth = 400;
                        this.$refs.listObject.openactionPanel();
                    }
                },
                // detail_in_view: {
                //     name: "detailInView",
                //     text: "Xem trong trang",
                //     callback: (documentObject, callback) => {
                //         this.currentDocObjectActiveIndex = this.dataTable.findIndex(obj => obj.document_object_id == documentObject.document_object_id)
                //         this.$refs.listObject.openactionPanel();
                //         this.dataClipboard = window.location.origin+ '/#/documents/objects/'+documentObject.document_object_id;
                //         this.docObjInfo = {docObjId:parseInt(documentObject.document_object_id),docSize:'21cm'}
                //     },
                // },
                update: {
                    name: 'edit',
                    text: this.$t('common.update'),
                    callback: (documentObject, callback) => {
                        if (this.isViewSmartObject) {
                            this.actionOnRightSidebar = 'update';
                            this.currentDocObjectActiveIndex =
                                this.dataTable.findIndex(
                                    (obj) =>
                                        obj.document_object_id ==
                                        documentObject.document_object_id
                                );
                            this.$refs.listObject.openactionPanel();
                            this.docObjInfo = {
                                docObjId: documentObject.document_object_id,
                                docSize: 'calc(100%)'
                            };
                        } else {
                            this.$goToPage(
                                '/document/objects/update/' +
                                    documentObject.document_object_id,
                                'Cập nhật'
                            );
                        }
                    }
                }
            };
            if (this.hideActionDelete) {
                delete menu.delete;
                delete menu.delete_multi;
            }
            return menu;
        },
        exportFileName() {
            if (this.isViewSmartObject) {
                return this.titleDocSmartOject;
            } else return this.titleDoc;
        },
        docId() {
            return this.idDocSmartOject
                ? this.idDocSmartOject
                : this.$route.params.id;
        },
        changeDocLeftStyle() {
            if (this.isSbsView || this.collapsedMenubar) {
                return '2px';
            } else if (
                (this.isViewScheduler || this.isViewKanban) &&
                this.$refs.listObject &&
                this.$refs.listObject.includesTreeview
            ) {
                return '440px';
            }
            return '170px';
        },
        headerPrefixKeypath() {
            if (this.getDataUrl.includes(appConfigs.apiDomain.orgchart)) {
                return 'table';
            } else return '';
        },
        isListOrgchart() {
            return this.getDataUrl.includes(appConfigs.apiDomain.orgchart);
        }
    },
    data() {
        let self = this;
        return {
            autoCompleteWidth: 60,
            collapsedAutoComplete: false,
            collapsedMenubar: false,
            kanbanWidthForm: '900px',
            actionKanban: 'view',
            documentObjectId: 0,
            documentIdQuickSubmit: null,
            isViewKanban: false,
            documentSubmitKey: null,
            actionPanelHeaderConfig: {
                nameHeaderPanel: this.$t('v2.doc.addNewCard'),
                iconHeaderPanel: '',
                showBtnSaveHeader: true,
                hideHeaderPopUp: true,
                colorBtn: 'success',
                nameBtn: ''
            },
            loadingDataLabel: this.$t('common.loading'),
            widthUpload: 400,
            showHideDoc: true,
            productListMode: false,
            isShowStar: true,
            isSetMain: false,
            listImage: [],
            previewUploadFile: {
                listUploadControl: {
                    currentControl: {},
                    allControl: [],
                    imgIdx: 0
                }
            },
            isSbsView: false,
            sDocumentManagementUrl: appConfigs.apiDomain.sdocumentManagement,
            dialog: false,
            showProgress: false,
            actionOnRightSidebar: 'detail',
            commonActionProps: {
                module: 'document',
                resource: 'document_instance',
                scope: 'document',
                parentId: self.idDocSmartOject
                    ? self.idDocSmartOject
                    : this.$route.params.id
            },
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
                                    obj[col] = JSON.parse(obj[col]);
                                    if (obj[col].address) {
                                        obj[col] = obj[col].address;
                                    } else {
                                        obj[col] =
                                            obj[col].lat + ';' + obj[col].lng;
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
            currentDocObjectActiveIndex: '',
            panelDocTitle: '',
            docObjInfo: {},
            actionPanelWidth: 850,
            containerHeight: 200,
            dataTable: [],
            countRecordSelected: 0,
            recordSelected: [],
            recordPreview: {},
            curentFormActive: 0,
            listTabletItem: [],
            currentRowData: {},
            allObjectPrint: [],
            totalRecord: 0,
            isDeleteMultiple: false,
            dataClipboard: '',
            formulasInput: {
                formula: {
                    title: this.$t('v2.doc.enterFormula'),
                    type: 'script',
                    value: '',
                    style: {
                        height: '300px'
                    }
                }
            },
            listActionForPrint: {
                // data truyền vào cho slot action view table
                print: {
                    title: this.$t('common.print'),
                    icon: '',
                    action: function () {
                        let listObj = [];
                        for (let rowId in this.recordPreview) {
                            let rowData = this.recordPreview[rowId];
                            let item = {
                                document_object_id: rowData.document_object_id,
                                formId: this.curentFormActive
                            };
                            listObj.push(item);
                        }
                        this.hideBottomSheet();
                        this.$goToPage(
                            '/documents/print-multiple',
                            'In',
                            false,
                            true,
                            { listObject: listObj }
                        );
                    }.bind(this)
                }
            },
            customGetDataForFilter: {
                async avatarShowList(colFilter) {
                    let statusTextData = [
                        {
                            label: self.$t(
                                'document.instance.showlist.noImage'
                            ),
                            value: 'noImage'
                        },
                        {
                            label: self.$t(
                                'document.instance.showlist.hasImage'
                            ),
                            value: 'hasImage'
                        }
                    ];
                    if (colFilter.searchKey != '') {
                        statusTextData = statusTextData.filter((e) => {
                            let value = colFilter.searchKey.toLowerCase();
                            return (
                                e.label.toLowerCase().includes(value) ||
                                e.value.toLowerCase().includes(value)
                            );
                        });
                    }
                    return statusTextData;
                }
            },
            customConditionsForFilter: {
                avatarShowList: function (option, filter) {
                    console.log(option, filter);
                    option.column = filter.replaceForColumn;
                    let checkedItems = filter.selectItems.filter((el) => {
                        return el.checked;
                    });
                    if (checkedItems.length == 1) {
                        option.conditions.push({
                            name: 'equal',
                            value: '[]'
                        });
                        if (checkedItems[0].value == 'hasImage') {
                            option.conditions[0].name = 'not_equal';
                        }
                    }
                }
            },

            relatedTasks: {
                myItemFilter: {
                    // custom filter cho myitem
                    byDocObjId: '' // doc obj id liên quan tới task
                },
                show: false, // có hiển thị popup danh sách các task không
                search: false // có cần tìm kiếm các task liên quan tới các bản ghi ko
            },
            isViewScheduler: false,
            updateByWorkflowId: '',
            isExporting: false,
            isErrorExport: false,
            showTabView: false,
            isViewShowList: true,
            isAddRecord: false,
            worker: null,
            isShowTabKanban: false,
            isShowTabScheduler: false,
            titleDoc: '',
            tabView: 0,
            isViewOrgchart: false,
            idOrgchartViewSbs: '',
            newValueControl: null,
            isCloneType: false
        };
    },
    mounted() {
        const self = this;
        this.calcContainerHeight();
        this.$evtBus.$on('save-config-panel', (evt) => {
            this.getUiConfig();
        });
        this.$evtBus.$on('update-card-kanban', (card) => {
            if (self._inactive == true) return;
            self.actionKanban = 'update';
            self.documentObjectId = card.id;
            if (self.$refs.listObject) {
                self.$refs.listObject.openactionPanel();
                setTimeout(() => {
                    self.$refs.documentSubmit.scrollIntoView = false;
                }, 500);
            }
            if (card.newCol) {
                self.newValueControl = {
                    controlName: card.controlName,
                    newCol: card.newCol
                };
            }
            self.setPanelHeaderKanban(
                true,
                this.$t('common.save'),
                'success',
                this.$t('v2.doc.updateCard') + card.col
            );
        });
        this.$evtBus.$on('kanban-view-card', (card) => {
            if (self._inactive == true) return;
            self.actionKanban = 'view';
            self.documentObjectId = card.id;
            if (self.$refs.listObject) {
                self.$refs.listObject.openactionPanel();
            }
            let showBtnEditKanban = card.editPermission;
            self.setPanelHeaderKanban(
                showBtnEditKanban,
                this.$t('kanban.update'),
                'warning',
                this.$t('v2.doc.viewCardDetails') + card.col
            );
        });
        this.$evtBus.$on('clone-card-kanban', (card) => {
            if (self._inactive == true) return;
            self.actionKanban = 'clone';
            self.documentObjectId = card.id;
            self.isCloneType = true;
            if (self.$refs.listObject) {
                self.$refs.listObject.openactionPanel();
                setTimeout(() => {
                    self.$refs.documentSubmit.scrollIntoView = false;
                }, 500);
            }
            self.setPanelHeaderKanban(
                true,
                this.$t('common.save'),
                'success',
                this.$t('v2.doc.cloneCard') + card.col
            );
        });
        this.$evtBus.$on('scheduler-view-record', (idObject) => {
            if (self._inactive == true) return;
            self.actionKanban = 'view';
            self.documentObjectId = idObject;
            if (self.$refs.listObject) {
                self.$refs.listObject.openactionPanel();
            }
            self.setPanelHeaderKanban(
                false,
                '',
                'warning',
                this.$t('v2.doc.recordDetails')
            );
        });
        this.$emit('render-listObject-done');
    },
    deactivated() {
        this.hidePanel();
    },
    created() {
        if (this.$route.path.includes('my-application')) {
            this.checkShowTabView();
        }
        this.checkContextHasUpdateByWorkflow();
        this.getUiConfig();
        let thisCpn = this;
        documentApi
            .getListPrintConfig(this.docId)
            .then((res) => {
                thisCpn.listTabletItem = res.data.listObject;
                thisCpn.listTabletItem[0].activeSb = true;
            })
            .catch((err) => {})
            .finally(() => {});

        this.$evtBus.$on('finish-export-excel', (uuid) => {
            if (this.listFileExport[uuid] != undefined) {
                let docId = this.listFileExport[uuid].key.docId;
                if (this.docId == docId) {
                    this.isExporting = false;
                }
            }
        });
        for (let fileExport in this.listFileExport) {
            if (this.listFileExport[fileExport].key.docId == this.docId) {
                this.isExporting = true;
            }
        }
    },
    methods: {
        loadFormSuccess() {
            if (this.newValueControl) {
                this.$refs.documentSubmit.setNewValueWhenDragCardKanban(
                    this.newValueControl.controlName,
                    this.newValueControl.newCol
                );
                this.newValueControl = null;
            }
        },
        calcWidthAutoCompleteDocs() {
            setTimeout(() => {
                this.autoCompleteWidth =
                    this.$refs.autoCompleteDocs.$el.clientWidth;
            }, 500);
        },
        getDeleteActionMenu() {
            let thisCpn = this;
            let deleteAction = {
                name: 'delete',
                text: this.$t('common.delete'),
                callback: (documentObject, callback) => {
                    let ids = documentObject.reduce((arr, obj) => {
                        arr.push(obj.document_object_id);
                        return arr;
                    }, []);
                    documentApi
                        .deleteDocumentObject({
                            objectIds: JSON.stringify(ids)
                        })
                        .then((res) => {
                            if (res.status == 200) {
                                thisCpn.$snotify({
                                    type: 'success',
                                    title: thisCpn.$t(
                                        'v2.doc.deleteDocumentObjectSuccess'
                                    )
                                });
                                thisCpn.$refs.listObject.refreshList();
                            } else {
                                thisCpn.$snotify({
                                    type: 'error',
                                    title: res.messagr
                                });
                            }
                        })
                        .catch((err) => {})
                        .finally(() => {});
                }
            };
            return deleteAction;
        },
        changeConditionalFormula() {
            this.$emit('change-conditional-formula');
        },
        refreshList() {
            this.$refs.listObject.refreshList();
        },
        viewExpandObject() {
            if (!this.isViewOrgchart) {
                this.docObjInfo.docObjId;
                var url =
                    window.location.origin +
                    '/#/documents/objects/' +
                    this.docObjInfo.docObjId;
            } else {
                var url =
                    window.location.origin +
                    '/#/orgchart/' +
                    this.idOrgchartViewSbs +
                    '/view';
            }
            var win = window.open(url, '_blank');
            win.focus();
        },
        addObject() {
            this.$emit('on-add-item-clicked');
        },
        async checkShowTabView() {
            this.worker = new KanbanViewEnduser();
            let resCheckExistDocKanban = await runBySymperPromiseWorker(
                this.worker,
                'checkExistDocKanban',
                this.docId
            );
            if (
                resCheckExistDocKanban.status == 200 &&
                resCheckExistDocKanban.data
            ) {
                this.useShortHeader = true;
                this.showTabView = true;
                this.isShowTabKanban = true;
                this.calcContainerHeight();
            }

            let resCheckExistDocScheduler =
                await schedulerApi.checkExistDocScheduler(this.docId);
            if (
                resCheckExistDocScheduler.status == 200 &&
                resCheckExistDocScheduler.data
            ) {
                this.useShortHeader = true;
                this.showTabView = true;
                this.isShowTabScheduler = true;
                this.calcContainerHeight();
            }
        },
        resizeFormDocument() {
            if (this.kanbanWidthForm == '900px') {
                this.kanbanWidthForm = '100%';
                $('.sym-form-Detail').css('width', 'auto');
            } else {
                this.kanbanWidthForm = '900px';
            }
        },
        setPanelHeaderKanban(
            showBtnSaveHeader = true,
            nameBtn = '',
            colorBtn = 'success',
            nameHeaderPanel = ''
        ) {
            this.actionPanelHeaderConfig.showBtnSaveHeader = showBtnSaveHeader;
            this.actionPanelHeaderConfig.nameBtn = nameBtn;
            this.actionPanelHeaderConfig.colorBtn = colorBtn;
            this.actionPanelHeaderConfig.nameHeaderPanel = nameHeaderPanel;
        },
        closePanelAction() {
            if (this.isViewKanban) {
                this.refreshActionKanban();
                this.$evtBus.$emit('kanban-close-form-doc');
            }
        },
        // hàm gọi khi submit doc từ kanban
        onSubmitKanbanDone(data) {
            this.$refs.listObject.closeactionPanel();
            if (data) {
                data.type = this.actionKanban;
                this.$evtBus.$emit('kanban-submit-task-done', data);
                this.$snotifySuccess(
                    this.actionKanban + this.$t('v2.doc.taskSuccessfull')
                );
            } else {
                this.$snotifyError(this.$t('v2.doc.error'));
            }
            this.refreshActionKanban();
        },
        refreshActionKanban() {
            this.isCloneType = false;
            this.actionKanban = 'view';
        },
        saveItem() {
            if (this.isViewKanban) {
                if (this.actionKanban != 'view') {
                    this.$refs.documentSubmit.handlerSubmitDocumentClick();
                } else {
                    this.actionKanban = 'update';
                    this.hideLoadingSaveKanban();
                    this.setPanelHeaderKanban(
                        true,
                        this.$t('common.save'),
                        'success',
                        this.$t('v2.doc.editCard')
                    );
                }
            }
        },
        hideLoadingSaveKanban() {
            this.$refs.listObject.$refs.headerForm.loading = false;
        },
        submiDocumentError() {
            this.isCloneType = false;
        },
        async exportExcel(val) {
            val.data['isWaitForDone'] = 0;
            try {
                let res = await documentApi.getExportExcel(
                    this.docId,
                    val.data
                );
                if (res.status == 200) {
                    this.isExporting = true;
                    res.data.fileName = val.exportFile;
                    res.data['key'] = { docId: this.docId };
                    this.$store.commit(
                        'exportExcel/handleAddExportProcess',
                        res.data
                    );
                    this.$evtBus.$emit('show-file-export-excel');
                } else {
                    this.$snotify({
                        type: 'error',
                        title: this.$t('export.error'),
                        text: val.exportFile + '.xlsx'
                    });
                }
            } catch (err) {
                this.$snotify({
                    type: 'error',
                    title: this.$t('export.error'),
                    text: val.exportFile + '.xlsx'
                });
            }
        },
        rowSelectedChange(rowSelected) {
            this.recordSelected = rowSelected;
            this.countRecordSelected = rowSelected.length;
        },
        /**
         * Tìm các task liên quan tới các docObj id trong danh sách đang hiển thị
         */
        triggerFindRelatedTasks(saveConfig = true) {
            let self = this;
            let oldClass = self.customHeaderBtn.findRelatedTasks.class;
            let newClass = oldClass ? '' : 'orange white--text';
            self.customHeaderBtn.findRelatedTasks.class = newClass;

            this.tableContextMenu['showRelatedTasks'] = {
                name: 'showRelatedTasks',
                allwaysShow: true,
                text: this.$t('v2.doc.viewRelatedJobs'),
                callback: async (documentObject, callback) => {
                    self.relatedTasks.myItemFilter.byDocObjId =
                        documentObject.document_object_id;
                    self.relatedTasks.myItemFilter.byAssignee =
                        self.$store.state.app.endUserInfo.id;
                    self.relatedTasks.show = true;

                    setTimeout(() => {
                        self.relatedTasks.search = true;
                        if (self.$refs.relatedTasks) {
                            self.$refs.relatedTasks.getData();
                        }
                    }, 200);
                }
            };

            if (!newClass) {
                self.relatedTasks.search = false;
                delete self.tableContextMenu['showRelatedTasks'];
                let cols = this.$refs.listObject.columnDefs;
                for (let i = 0; i < cols.length; i++) {
                    if (cols[i].field == SYMPER_RELATED_TASK_COUNT) {
                        cols.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.getRelatedTasksInfo();
            }

            if (saveConfig) {
                uiConfigApi.saveUiConfig({
                    widgetIdentifier:
                        this.getWidgetIdentifier() + ':find-related-task',
                    detail: newClass ? 'active' : 'disabled' // active hoặc disabled
                });
            }
        },
        async getRelatedTasksInfo() {
            this.loadingDataLabel = this.$t('v2.doc.searchingRelatedJob');
            this.$refs.listObject.showLoadingOverlay(this.loadingDataLabel);
            let tableData = this.$refs.listObject.rowData;
            let ids = tableData.reduce((arr, el) => {
                arr.push(el.document_object_id);
                return arr;
            }, []);
            let info = await BPMNEngine.getRelatedTasksInfoByDocObjId(ids);
            if (Array.isArray(info.data)) {
                let map = info.data.reduce((map, el) => {
                    map[el.doc_object_id] = el.count;
                    return map;
                }, {});

                for (let item of tableData) {
                    item[SYMPER_RELATED_TASK_COUNT] = map[
                        item.document_object_id
                    ]
                        ? map[item.document_object_id]
                        : 0;
                }
            }

            let cols = this.$refs.listObject.columnDefs;
            let newCol = {
                field: SYMPER_RELATED_TASK_COUNT,
                headerName: this.$t('v2.doc.numberOfRelatedTasks'),
                noFilter: true,
                width: 120
            };
            util.insertToArrByIndex(cols, 2, newCol);
        },
        /**
         * Hàm kiểm tra xem doc có được update bằng quy trình hay không nếu có thì thêm context update bằng quy trình
         */
        checkContextHasUpdateByWorkflow() {
            let extraData = this.$route.params.extraData;
            let self = this;
            if (extraData && extraData.document) {
                let document = extraData.document;
                this.addContextUpdateByWorkflow(document);
            } else {
                documentApi
                    .detailDocument(this.$route.params.id)
                    .then((res) => {
                        if (res.status == 200) {
                            this.titleDoc = res.data.document.title;
                            self.addContextUpdateByWorkflow(res.data.document);
                        }
                    });
            }
        },
        addContextUpdateByWorkflow(document) {
            let self = this;
            let updateByWorkflowId = document.updateByWorkflowId;
            if (updateByWorkflowId) {
                self.updateByWorkflowId = updateByWorkflowId;
                this.tableContextMenu['update_by_workflow'] = {
                    name: 'updateByWorkflow',
                    text: this.$t(
                        'document.instance.showlist.updateByWorkflow'
                    ),
                    callback: async (documentObject, callback) => {
                        let res = await documentApi.detailDocumentObject(
                            documentObject.document_object_id,
                            { action: 'update_by_workflow' }
                        );
                        if (res.status == 200) {
                            res =
                                await self.$refs.roleSector.startBySelectRole();
                            if (res.status) {
                                startWorkflowBySubmitedDoc(updateByWorkflowId, {
                                    document_id: document.id,
                                    document_object_id:
                                        documentObject.document_object_id
                                });
                            } else {
                                self.$snotifyError(
                                    res,
                                    self.$t('process.instance.startFailed'),
                                    res.reason
                                );
                            }
                        } else if (res.status == 403) {
                            self.$snotifyError(
                                res,
                                this.$t('v2.doc.cannotUpdteRecord'),
                                this.$t(
                                    'v2.doc.notHavePermissonToUpdateRecordByProcess'
                                )
                            );
                        }
                    }
                };
            }
        },
        getWidgetIdentifier() {
            let widgetIdentifier = '';
            if (this.widgetIdentifier) {
                widgetIdentifier = this.widgetIdentifier;
            } else {
                widgetIdentifier = this.$route.path;
            }
            widgetIdentifier = widgetIdentifier.replace(/(\/|\?|=)/g, '');
            return widgetIdentifier;
        },
        getUiConfig() {
            const self = this;
            let widgetIdentifier = this.getWidgetIdentifier();
            let data = {
                widgetIdentifier: widgetIdentifier,
                detail: {}
            };
            uiConfigApi.getUiConfig(widgetIdentifier).then((res) => {
                if (res.status == 200) {
                    if (Object.keys(res).length > 0) {
                        let detail = JSON.parse(res.data.detail);
                        if (detail.productList) {
                            self.productListMode = true;
                            self.actionPanelWidth = 400;
                        } else {
                            self.productListMode = false;
                            self.actionPanelWidth = 850;
                        }
                    }
                }
            });

            uiConfigApi
                .getUiConfig(this.getWidgetIdentifier() + ':find-related-task')
                .then((res) => {
                    if (res.status == 200 && res.data.detail == 'active') {
                        self.triggerFindRelatedTasks(false);
                    }
                });
        },
        convertToPlain(rtf) {
            return '<span>value</span>';
        },
        setUploadControl(data) {
            if (this.productListMode) {
                this.addUploadPanel(data);
            }
        },
        onOffDoc(onOffDoc) {
            this.actionOnRightSidebar = 'detail';
            if (onOffDoc) {
                this.actionPanelWidth = 1250;
            } else {
                this.actionPanelWidth = 400;
            }
        },

        closePreviewUploadFile() {
            if (!this.productListMode) {
                this.$refs.listObject.closeactionPanel();
                this.actionPanelWidth = 850;
            } else {
                // trường hợp chỉ có preview
                if (
                    this.actionPanelWidth != 400 &&
                    this.actionPanelWidth != 0
                ) {
                    this.actionPanelWidth = 850;
                } else {
                    // trường hợp có cả 2
                    this.actionPanelWidth = 0;
                }
            }
        },
        showGallary(list) {
            if (this.actionOnRightSidebar == 'detail') {
                this.isShowStar = false;
            } else {
                this.isShowStar = true;
            }
            this.$emit('show-gallary', list);
            this.listImage = list.listMedia;
            this.$refs.lightbox.showDialog = true;
            this.$refs.lightbox.showImage(list.index);
        },
        // hiện ảnh đầu tiên trong trường hợp không có ảnh định danh
        showFirstPicture(data) {
            let check = false;
            if (data.listUploadControl.allControl.length > 0) {
                data.listUploadControl.allControl.map((control) => {
                    if (control.value && control.value.length > 0) {
                        let checkMainImg = control.value.some(
                            (val) => val.isMainPicture
                        );
                        if (checkMainImg) check = true;
                    }
                });
                if (!check) {
                    data.listUploadControl.allControl.map((control, idx) => {
                        if (control.value && control.value.length > 0) {
                            //    data.listUploadControl.allControl[idx].value[0].isMainPicture = true;
                            data.listUploadControl.currentControl.name =
                                data.listUploadControl.allControl[idx].name;
                            data.listUploadControl.currentControl.name =
                                data.listUploadControl.allControl[idx].name;
                            data.listUploadControl.currentControl.value =
                                data.listUploadControl.allControl[idx].value;
                            return data.listUploadControl;
                        }
                    });
                }
            }
            return data.listUploadControl;
        },
        //mở rộng Panel do  thêm upload Panel
        addUploadPanel(data) {
            this.isSetMain = data.isSetMain;
            if (!this.productListMode) {
                this.actionPanelWidth = 1250;
            } else {
                data.listUploadControl = this.showFirstPicture(data);
                if (this.actionPanelWidth != 1250) {
                    this.actionPanelWidth =
                        this.actionPanelWidth != 850 ? 400 : 850;
                    if (this.widthUpload == 0) this.widthUpload = 400;
                    if (this.actionPanelWidth == 850 && this)
                        this.widthUpload = 0;
                }
            }
            this.previewUploadFile.listUploadControl = data.listUploadControl;
            this.$refs.previewUploadFile.show();
        },
        deleteAll() {
            let dataDoc = {
                type: 'all',
                documentId: this.docId
            };
            const self = this;
            documentApi.deleteAll(dataDoc).then((res) => {
                if (res.status == 200) {
                    self.$snotify({
                        type: 'success',
                        title: self.$t('v2.doc.deleteAllSuccess')
                    });
                } else {
                    self.$snotify({
                        type: 'error',
                        title: res.message
                    });
                }
            });
        },
        onDocumentUpdateSuccess() {
            this.actionOnRightSidebar = 'detail';
        },
        onDocumentSubmitSuccess() {
            this.$refs.listObject.closeactionPanel();
            this.refreshList();
        },
        handleChange(docId) {
            this.docId = docId;
        },
        updateCurrentRecord() {
            this.actionOnRightSidebar = 'update';
        },
        handleClickPrint() {
            this.$goToPage('/documents/print-multiple', 'In', false, true, {
                listObject: [{ document_object_id: this.docObjInfo.docObjId }]
            });
        },
        confirmDelete() {
            let itemSelected = Object.values(
                this.$refs.listObject.getRowSelected()
            );
            let ids = itemSelected.reduce((arr, obj) => {
                arr.push(obj.document_object_id);
                return arr;
            }, []);
            let thisCpn = this;
            this.dialog = false;
            documentApi
                .deleteDocumentObject({ objectIds: JSON.stringify(ids) })
                .then((res) => {
                    if (res.status == 200) {
                        thisCpn.$snotify({
                            type: 'success',
                            title: thisCpn.$t(
                                'v2.doc.deleteDocumentObjectSuccess'
                            )
                        });
                        thisCpn.$refs.listObject.removeAllRowChecked();
                        thisCpn.$refs.listObject.refreshList();
                    } else {
                        thisCpn.$snotify({
                            type: 'error',
                            title: res.messagr
                        });
                    }
                })
                .catch((err) => {})
                .finally(() => {});
        },
        deleteRowSelected() {
            let listRowSelected = this.$refs.listObject.getRowSelected();
            this.countRecordSelected = listRowSelected.length;
            this.recordSelected = listRowSelected;
            this.dialog = true;
        },
        closePanelFormulas() {
            this.formulasInput.formula.value = '';
            this.isDeleteMultiple = false;
            this.$refs.listObject.removeCheckBoxColumn();
            this.actionPanelWidth = 850;
            this.$refs.listObject.closeactionPanel();
            setTimeout(
                (self) => {
                    self.$refs.listObject.refreshList();
                },
                200,
                this
            );
        },
        runFormulas() {
            this.showProgress = true;
            this.$refs.listObject.refreshList();
        },
        afterGetData(data) {
            this.showProgress = false;
            this.dataTable = data;
            let self = this;
            setTimeout(() => {
                if (self.customHeaderBtn.findRelatedTasks.class) {
                    self.getRelatedTasksInfo();
                }
            }, 300);
        },
        nextRecord() {
            if (this.dataTable.length > this.currentDocObjectActiveIndex + 1) {
                this.currentDocObjectActiveIndex += 1;
                let newRecord =
                    this.dataTable[this.currentDocObjectActiveIndex];
                this.docObjInfo = {
                    docObjId: newRecord.document_object_id,
                    docSize: '21cm'
                };
            } else {
                if (this.dataTable.length >= 50) {
                    this.$refs.listObject.nextPage();
                    this.currentDocObjectActiveIndex = 0;
                }
            }
        },
        prevRecord() {
            if (this.currentDocObjectActiveIndex > 0) {
                this.currentDocObjectActiveIndex -= 1;
                let newRecord =
                    this.dataTable[this.currentDocObjectActiveIndex];
                this.docObjInfo = {
                    docObjId: newRecord.document_object_id,
                    docSize: '21cm'
                };
            } else {
                this.$refs.listObject.prevPage();
                this.currentDocObjectActiveIndex = 0;
            }
        },
        submitDocument() {
            if (!this.isViewKanban && !this.isAddInSBS) {
                this.$goToPage(
                    '/documents/' + this.docId + '/submit',
                    'Tạo bản ghi'
                );
            } else if (this.isAddInSBS) {
                this.$refs.listObject.openactionPanel();
                this.isAddRecord = true;
                this.actionOnRightSidebar = 'create';
                this.documentIdQuickSubmit = this.docId;
            } else {
                if (this._inactive == true) return;
                this.actionKanban = 'create';
                setTimeout(() => {
                    this.$refs.documentSubmit.scrollIntoView = false;
                }, 500);
                this.actionPanelHeaderConfig.showBtnSaveHeader = true;
                this.actionPanelHeaderConfig.nameHeaderPanel = this.$t(
                    'v2.doc.createNewCard'
                );
                this.actionPanelHeaderConfig.nameBtn = this.$t('common.save');
            }
            // this.$router.push('/documents/'+this.docId+'/submit');
        },

        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
            if (this.showTabView) {
                this.containerHeight = this.containerHeight - 35;
            }
        },
        handleAfterLoadDocument(document) {
            this.panelDocTitle = document.title;
        },
        showDetailInfoDocument() {
            if (this.$refs.viewDetail.isShow()) {
                this.actionPanelWidth = 850;
                this.$refs.viewDetail.setLayoutFromQuickView('21cm', 'auto');
            } else {
                this.$refs.viewDetail.showSideBar();
                this.actionPanelWidth = 1117;
                this.$refs.viewDetail.setLayoutFromQuickView('21cm', 'unset');
            }
            this.$refs.viewDetail.toggleSideBar();
        },
        afterHideSidebarDetail() {
            this.actionPanelWidth = 850;
            this.$refs.viewDetail.setLayoutFromQuickView('21cm', 'auto');
        },

        addToClipboard(event) {
            $('.copyed').removeClass('d-none');
            setTimeout(() => {
                $('.copyed').addClass('d-none');
            }, 1500);
            let text = $(event.target).attr('clipboard');
            var inp = document.createElement('input');
            document.body.appendChild(inp);
            inp.value = text;
            inp.select();
            document.execCommand('copy', false);
            inp.remove();
        },
        resetProductList() {
            if (this.productListMode) {
                this.widthUpload = 400;
                this.$refs.previewUploadFile.isOffDoc = false;
                this.actionPanelWidth = 400;
            }
        },
        /**
         * Ẩn view side by side
         */
        hidePanel() {
            this.isAddRecord = false;
            this.$refs.listObject.closeactionPanel();
            this.actionPanelWidth = 850;
            this.resetProductList();
        },
        collapsedMenubarHandler(val) {
            this.collapsedMenubar = val;
        },
        collapsedAutoCompleteHandler(val) {
            this.collapsedAutoComplete = val;
        },
        handleActinPanelChange(val) {
            this.isSbsView = val;
        },
        tableContextMenuByFilter(params) {
            if (!util.auth.isSupportter()) {
                let filter = '';
                if (
                    this.$store.state.app.filterObject.document_instance &&
                    this.$store.state.app.filterObject.document_instance
                        .length > 0
                ) {
                    this.$store.state.app.filterObject.document_instance.map(
                        (f) => {
                            if (f.action == 'delete') {
                                filter = f.filterNew;
                                let hasActionDelete =
                                    this.checkPermissionByFilter(
                                        params,
                                        filter
                                    );
                                console.log('hasActionDelete', hasActionDelete);
                                if (!hasActionDelete) {
                                    delete this.tableContextMenu.delete;
                                } else {
                                    this.$set(
                                        this.tableContextMenu,
                                        'delete',
                                        this.getDeleteActionMenu()
                                    );
                                }
                            }
                        }
                    );
                }
            }
        },
        checkPermissionByFilter(params, filter) {
            Object.keys(params.data).map((control) => {
                if (filter && filter.indexOf(control) > -1) {
                    if (params.data[control] == '') {
                        checkFilter = false;
                    }
                    filter = filter
                        .replace(control, "'" + params.data[control] + "'")
                        .replace('=', '==');
                }
            });
            return eval(filter);
        },
        afterRowSelected(data) {
            if (this.isAddRecord) {
                this.isAddRecord = false;
            }
            if (
                this.$refs.listObject.isShowSidebar() ||
                this.isViewSmartObject
            ) {
                if (!this.getDataUrl.includes(appConfigs.apiDomain.orgchart)) {
                    this.isViewOrgchart = false;
                    let documentObject = data.data;
                    this.actionOnRightSidebar = 'detail';
                    let event = data.event;
                    if (this.$refs.listObject.hasColumnsChecked) {
                        return;
                    }
                    if (
                        ['ArrowDown', 'ArrowUp'].includes(event.key) ||
                        event.buttons == 1
                    ) {
                        if (
                            this.docObjInfo.docObjId ==
                                documentObject.document_object_id &&
                            this.$refs.listObject.actionPanel
                        ) {
                            return;
                        }
                        this.currentDocObjectActiveIndex =
                            this.dataTable.findIndex(
                                (obj) =>
                                    obj.document_object_id ==
                                    documentObject.document_object_id
                            );
                        this.$refs.listObject.openactionPanel();
                        this.dataClipboard =
                            window.location.origin +
                            '/#/documents/objects/' +
                            documentObject.document_object_id;
                        this.docObjInfo = {
                            docObjId: documentObject.document_object_id,
                            docSize: 'calc(100%)'
                        };
                    }
                } else {
                    if (
                        this.idOrgchartViewSbs != data.data.orgId &&
                        this.$refs.listObject.actionPanel
                    ) {
                        this.isViewOrgchart = false;
                        setTimeout(() => {
                            this.isViewOrgchart = true;
                        }, 200);
                    } else {
                        this.$refs.listObject.openactionPanel();
                        this.isViewOrgchart = true;
                    }
                    this.idOrgchartViewSbs = this.idDocSmartOject;
                    this.$emit('highlight-department', data.data.dpmVizId);
                    this.panelDocTitle = this.nameLink;
                }
            }
        },
        /**
         * Hàm gọi sang compon bottom sheet để hiển thị
         */
        showBottomSheet() {
            this.$refs.bottomSheetView.toggle();
        },
        hideBottomSheet() {
            this.$refs.bottomSheetView.toggle();
            this.$refs.listObject.removeCheckBoxColumn();
        },
        /**
         * Hàm hiển thị cột checkbox trong compon listItem
         */
        toggleCheckBoxListItem(isShowBottomSheet = true) {
            if (isShowBottomSheet) {
                this.showBottomSheet();
            }
            this.$refs.listObject.addCheckBoxColumn();
        },

        /**
         * Ấn để in các bản ghi đã chọn
         */
        printSelected() {
            if (this.recordSelected.length == 0) {
                this.$snotify({
                    type: 'info',
                    title: this.$t('v2.doc.selectARecordToPrint')
                });
                return;
            }
            this.hideBottomSheet();
            this.$goToPage('/documents/print-multiple', 'In', false, true, {
                listObject: this.recordSelected
            });
        },
        // chọn mẫu trước khi in
        selectPrintConfig() {
            this.$refs.listPrintView.show();
            this.recordPreview = this.recordSelected;
        },
        /**
         * xử lí sau khi click vào 1 item bên sidebar của view table
         */
        afterSelectedItem(item) {
            if (item) {
                this.curentFormActive = parseInt(item.formId);
                this.allObjectPrint = [
                    {
                        document_object_id:
                            this.currentRowData.document_object_id,
                        formId: parseInt(item.formId)
                    }
                ];
            }
        },
        /**
         * Sự kiện khi selection vào cell
         */
        afterCellSelection(rowData) {
            this.$refs.listObject.showConfigFilter = false;
            this.actionOnRightSidebar = 'detail';
            this.currentRowData = rowData;
        },
        changeTabView(tab) {
            this.tabView = tab;
            if (tab == 0) {
                this.actionPanelHeaderConfig.hideHeaderPopUp = true;
                this.isViewShowList = true;
                this.isViewKanban = false;
                this.isViewScheduler = false;
                this.$refs.listObject.setTabView(0);
            } else {
                this.isViewShowList = false;
                if (tab == 1 && this.isShowTabKanban) {
                    this.isViewKanban = true;
                    this.isViewScheduler = false;
                } else {
                    this.isViewScheduler = true;
                    this.isViewKanban = false;
                }
                // header from document
                this.actionPanelHeaderConfig.hideHeaderPopUp = false;
                this.$refs.listObject.setTabView(tab);
            }
        },
        addContextConfigSmartObject(newValue) {
            for (let context in this.tableContextMenu) {
                if (this.tableContextMenu[context].isActionSmartObject) {
                    delete this.tableContextMenu[context];
                }
            }
            if (Object.keys(newValue).length > 0) {
                for (let ct in newValue) {
                    this.tableContextMenu[ct] = newValue[ct];
                }
            }
        }
    },
    props: {
        configContextMenu: {
            type: Object,
            default() {
                return {};
            }
        },
        showFilter: {
            type: Boolean,
            default: true
        },
        emptyDataKey: {
            type: String,
            default: 'document-record-list'
        },
        showTitle: {
            type: Boolean,
            default: true
        },
        showDisplayConfig: {
            type: Boolean,
            default: true
        },
        showCustomButton: {
            type: Boolean,
            default: true
        },
        customUrlGetData: {
            type: String,
            default: ''
        },
        apiMethod: {
            type: String,
            default: 'GET'
        },
        customDataForApi: {
            type: Function,
            default: null
        },
        customContentType: {
            type: Boolean,
            default: false
        },
        sqlConditonLinkSmartObject: {
            type: String,
            default: ''
        },
        isAddInSBS: {
            type: Boolean,
            default: false
        },
        hideActionDelete: {
            type: Boolean,
            default: false
        },
        isViewSmartObject: {
            type: Boolean,
            default: false
        },
        idDocSmartOject: {
            type: String
        },
        noPermission: {
            type: Boolean,
            default: false
        },
        showActionPanelInDisplayConfig: {
            type: Boolean,
            default: true
        },
        titleDocSmartOject: {
            type: String,
            default: ''
        },
        isShowButtonClose: {
            type: Boolean,
            default: false
        },
        nameLink: {
            default: ''
        }
    }
};
</script>

<style scoped>
.new-tab-btn-container {
    width: 90px !important;
    height: 28px !important;
    margin-right: 16px;
    margin-top: 4px;
    box-shadow: none;
    border-radius: 4px;
    background-color: #f2f2f2;
}
.new-tab-btn {
    font-size: 12px;
    line-height: 14px;
    font-family: Roboto;
    font-weight: 400;
}
.panel-header {
    height: 30px;
    display: flex;
    color: #757575;
    margin-top: -3px;
}
.list-object-component {
    position: relative;
}
.panel-header .mdi:hover {
    color: rgba(0, 0, 0 / 0.6);
}
.panel-body {
    height: 100%;
}
/* .panel-body >>> .wrap-content-detail{
        height: calc(100vh - 65px) !important;
    } */
.right-action {
    margin-left: auto;
    font-size: 15px;
}
.panel-header .mdi {
    cursor: pointer;
    margin-right: 12px;
    font-size: 16px;
    transition: all ease-in-out 250ms;
}
.left-action .mdi:not(.mdi-close) {
    font-size: 24px;
    line-height: 1;
}
.left-action .mdi-close {
    font-size: 20px;
    line-height: 1;
}
.document-title {
    font-size: 13px;
    display: inline-block;
    vertical-align: middle;
}

.copyed {
    margin-right: 12px;
    font-size: 12px;
}
.sheet-action {
    margin-left: auto;
}

.sheet-action >>> button {
    margin: 6px 8px !important;
    border-radius: 4px;
    box-shadow: none;
}
.sheet-action >>> button:last-child {
    color: red;
}
.count-selection span {
    display: inline-block;
    padding: 12px;
    height: 100%;
}
.formulas-input {
    position: relative;
}
.run-formulas-btn {
    position: absolute;
    right: 4px;
    bottom: 14px;
    font-size: 18px;
}
.delete-record-btn {
    position: absolute;
    bottom: 16px;
    right: 16px;
}
.delete-all-record-btn {
    position: absolute;
    bottom: 16px;
    right: 106px;
}
.list-object-component >>> .v-navigation-drawer__content {
    overflow: hidden !important;
}
</style>

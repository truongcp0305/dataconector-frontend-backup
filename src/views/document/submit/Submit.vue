<template>
    <div :class="globalClass">
        <VuePerfectScrollbar class="scroll-content h-100">
            <Preloader ref="preLoaderView" />
            <div
                :key="keyInstance"
                class="sym-form-submit"
                :id="'sym-submit-' + keyInstance"
                :style="{ width: docSize, height: '100%', opacity: 0 , 'pointer-events': isRunningAllFormulaManually?  'none': 'auto'}"
            >
                <date-picker
                    :keyInstance="keyInstance"
                    @after-select-date="afterSelectDateTime"
                    @after-apply-datetime="afterSelectDateTime"
                    :title="$t('common.select_date')"
                    :showTime="isDateTimePicker"
                    ref="datePicker"
                />
                <FloattingPopup
                    v-if="readyLoaded"
                    ref="floattingPopup"
                    :focusingControlName="focusingControlName"
                    :instance="keyInstance"
                />
                <div
                    v-show="isPermission"
                    v-html="contentDocument"
                    class="wrapview-contextmenu"
                ></div>
                <div
                    v-show="!isPermission"
                    class="mt-4"
                    style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        -webkit-transform: translate(-50%, -50%);
                        transform: translate(-50%, -50%);
                    "
                >
                    <img
                        :src="
                            require('@/../public/img/document/Permission denied.svg')
                        "
                        width="300"
                    />
                    <div
                        style="
                            text-align: center;
                            font-size: 13px;
                            margin-top: 8px;
                        "
                    >
                        {{ $t('document.notification.noPermission') }}
                    </div>
                </div>
                <!-- <button v-on:click="togglePageSize" v-show="!isQickSubmit" id="toggle-doc-size">
                <span class="mdi mdi-arrow-horizontal-lock"></span>
            </button> -->
                <autocomplete-input
                    v-if="readyLoaded"
                    :scrollIntoView="scrollIntoView"
                    ref="autocompleteInput"
                    :keyInstance="keyInstance"
                    @after-select-row="afterSelectRowAutoComplete"
                    @open-sub-form="openSubFormSubmit"
                    @before-close="isShowSubFormSubmit = false"
                />
                <input-filter-list-card
                    v-if="readyLoaded"
                    @delete-card-item="deleteCardItem"
                    @delete-all-card-item="deleteAllCardItem"
                    :listCards="listCards"
                    :listTitle="listTitleInputFilter"
                    :keyInstance="keyInstance"
                    ref="inputFilterListCard"
                />
                <sym-drag-panel
                    v-if="readyLoaded"
                    ref="symDragPanel"
                    :dragPanelWidth="600"
                    :dragPanelHeight="dragPopupType == 'fileUpload' ? 150 : 450"
                    :topPosition="topPositionDragPanel"
                    :leftPosition="leftPositionDragPanel"
                    :actionTitle="titleDragPanel"
                    :titleIcon="titleDragPanelIcon"
                    :styleBody="{ 'overflow-y': 'scroll', width: '100%' }"
                    @before-close="beforeCloseDragPanel"
                >
                    <template slot="drag-panel-content">
                        <!-- <submitDocument :isQickSubmit="true" :docId="340" v-if="!isQickSubmit"/> -->
                        <filter-input
                            v-if="dragPopupType == 'inputFilter'"
                            :keyInstance="keyInstance"
                            @save-input-filter="saveInputFilter"
                            @search-data="searchDataFilter"
                            :tableMaxHeight="500"
                            ref="inputFilter"
                        ></filter-input>
                        <ListImagePopUp
                            v-else
                            ref="fileUploadPopup"
                            :currentFileControl="currentFileControl"
                            :listUploadFile="listUploadFile"
                            @add-file-click="afterAddFileClick"
                            @after-remove-file="afterRemoveFile"
                            @after-remove-all-file="afterRemoveAllFiles"
                            :keyInstance="keyInstance"
                        />
                    </template>
                </sym-drag-panel>
                <input
                    type="file"
                    :id="'file-upload-alter-' + keyInstance"
                    class="hidden d-none"
                />
                <validate :keyInstance="keyInstance" ref="validate" />
                <err-message
                    :listErr="listMessageErr"
                    ref="errMessage"
                    @after-close-dialog="afterCloseDialogValidate"
                />
            </div>
            <div v-if="listDataFlow.length > 0">
                <EmbedDataflow
                    :isClosePanel="viewType == 'submit' ? false: true"
                    @handle-value-change="handleValueChangeDataflow"
                    @after-mounted="afterDataFlowMounted"
                    @insert-data-dataflow-to-control="afterRunDataflow"
                    @run-data-flow="runDataFlow"
                    v-for="dataFlow in listDataFlow"
                    :listNodeDataFlow="dataFlow.nodes"
                    :key="dataFlow.id"
                    :dataflowId="dataFlow.id"
                    :width="'100%'"
                    :ref="'dataFlow' + dataFlow.id"
                    :controlTitle="dataFlow.controlTitle"
                />
            </div>
            <UploadFile
                v-if="readyLoaded"
                :uploadMultyFile="true"
                :objectType="'document'"
                :iconName="`mdi-upload-outline`"
                ref="fileUploadView"
                class="d-none"
                @uploaded-file="afterFileUpload"
                :objectIdentifier="docId + ''"
            />
            <UploadAndDrag
                v-if="readyLoaded"
                style="display: none"
                :objectType="'document'"
                @remove-progress="removeProgress"
                @percent-uploaded="showProgressUpload"
                ref="uploadAndDrag"
                @uploaded-file="afterFileUpload"
                :objectIdentifier="docId + ''"
            />
            <v-speed-dial
                v-if="parrentInstance == 0 && readyLoaded"
                v-show="showSubmitButton && isPermission"
                v-model="fab"
                :top="top"
                :bottom="bottom"
                :right="right"
                :left="left"
                :direction="direction"
                :open-on-hover="hover"
                :transition="transition"
                style="z-index: 3; bottom: 36px; position: absolute;"
            >
                <template v-slot:activator>
                    <v-btn v-model="fab" color="blue darken-2" dark fab>
                        <v-icon v-if="fab">mdi-close</v-icon>
                        <v-icon v-if="!fab && !isSubmitting">mdi-menu</v-icon>
                        <v-progress-circular
                            indeterminate
                            v-show="isSubmitting"
                            color="red"
                        ></v-progress-circular>
                    </v-btn>
                </template>

                <v-tooltip left>
                    <template v-slot:activator="{ on }">
                        <div v-on="on">
                            <v-btn
                                fab
                                dark
                                small
                                :disabled="isSubmitting"
                                color="green"
                                @click="handlerSubmitDocumentClick"
                            >
                                <v-icon>mdi-content-save</v-icon>
                            </v-btn>
                        </div>
                    </template>
                    <span>{{ $t('document.submit.fab.submit') }}</span>
                </v-tooltip>

                <v-tooltip left>
                    <template v-slot:activator="{ on }">
                        <div v-on="on">
                            <v-btn
                                v-if="isDraft != 1"
                                fab
                                dark
                                small
                                color="indigo"
                                @click="handlerDraftClick"
                            >
                                <v-icon>mdi-trash-can-outline</v-icon>
                            </v-btn>
                        </div>
                    </template>
                    <span>{{ $t('document.submit.fab.draft') }}</span>
                </v-tooltip>
                <v-tooltip left>
                    <template v-slot:activator="{ on }">
                        <div v-on="on">
                            <v-btn
                                fab
                                dark
                                small
                                color="secondary"
                                @click="togglePageSize"
                            >
                                <v-icon>mdi-resize</v-icon>
                            </v-btn>
                        </div>
                    </template>
                    <span>{{ $t('document.submit.fab.toggleSize') }}</span>
                </v-tooltip>
                <v-tooltip left>
                    <template v-slot:activator="{ on }">
                        <div v-on="on">
                            <v-btn
                                fab
                                dark
                                small
                                color="secondary"
                                @click="checkDataFromCacheIndexDB"
                            >
                                <v-icon>mdi-database-sync</v-icon>
                            </v-btn>
                        </div>
                    </template>
                    <span>{{ $t('document.submit.fab.localStorage') }}</span>
                </v-tooltip>
            </v-speed-dial>
            <v-tooltip left>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-bind="attrs"
                        v-on="on"
                        color="orange"
                        dark
                        bottom
                        right
                        fab
                        small
                        absolute
                        @click="runAllFormulaManually()"
                        :style="calcPositionButtonRunAllFormulaManually"
                        :loading="isRunningAllFormulaManually"
                        :disable="isRunningAllFormulaManually"
                        v-show="Object.keys(listControlRunFormulaManually).length != 0"
                    >
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </template>
                <span>{{ $t('document.submit.fab.refresh-formula') }}</span>
            </v-tooltip>

            <div
                class="sub-form-action"
                v-if="parrentInstance != 0 && readyLoaded"
            >
                <button @click="goToListDocument()" class="subfom-action__item">
                    {{ $t('document.submit.goToList') }}
                </button>
                <button
                    @click="handlerSubmitDocumentClick(true)"
                    class="subfom-action__item"
                >
                    <span class="mdi mdi-content-save-move-outline"></span
                    >{{ $t('document.submit.continueSubmit') }}
                </button>
                <button
                    @click="handlerSubmitDocumentClick"
                    class="subfom-action__item"
                >
                    <span class="mdi mdi-content-save-settings-outline"></span
                    >{{ $t('document.submit.fab.submit') }}
                </button>
            </div>
        </VuePerfectScrollbar>
        <v-navigation-drawer
            v-if="parrentInstance == 0 && drawer"
            :width="isShowTraceControlSidebar ? 300 : 830"
            v-model="drawer"
            class="pa-3"
            fixed
            right
            temporary
            :hide-overlay="isShowTraceControlSidebar"
            style="z-index: 9999 !important"
        >
            <div>
                <v-icon
                    small
                    class="quick-submit-btn-close"
                    @click="drawer = false"
                >
                    mdi-close
                </v-icon>
            </div>
            <div
                class="w-100"
                style="height: calc(100% - 30px); overflow: scroll"
            >
                <SidebarTraceFormulas
                    :documentInfo="documentInfo"
                    :controlTrace="controlTrace"
                    :keyInstance="keyInstance"
                    :listFormulasTrace="listFormulasTrace"
                    ref="traceControlView"
                    v-if="isShowTraceControlSidebar"
                />
                <submitDocument
                    v-else-if="parrentInstance == 0 && docSubFormId != 0"
                    :showSubmitButton="false"
                    :parrentInstance="keyInstance"
                    @submit-document-success="submitSubFormSuccess"
                    ref="subSubmitView"
                    :isQickSubmit="true"
                    :action="'submit'"
                    :docId="docSubFormId"
                />
            </div>
        </v-navigation-drawer>
        <PopupPivotTable
            ref="popupPivotTableView"
            :instance="keyInstance"
            :dataColPivot="dataColPivot"
            :data="dataPivotMode"
            @before-add-pivot-data="beforeAddPivotData"
        />
        <input
            type="text"
            class="input-pivot"
            @keyup="afterKeyupInputPivot"
            @blur="afterBlurInputPivot"
            v-if="dataPivotTable"
        />
        <Comment2
            :objectIdentifier="docObjId"
            :objectType="'document-instance'"
            @preview-picture-comment="previewPictureComment"
            v-show="isShowComment"
            :isFocusComment="false"
            ref="commentView"
            :scroll-bottom="scrollBottom"
            @focus-to-comment="focusToComment"
            :userIdCreateObject="sDocumentDetail.allData.document_object_user_created_id"
        />
        <PreviewFile
            v-if="readyLoaded"
            ref="previewFile"
            :fileInfor="fileInfor"
        />
        <PreviewUploadFile
            v-if="readyLoaded"
            @select-thumbnail-image="focusCurrentFile"
            :isShowHideDoc="false"
            ref="previewUploadFile"
            :width="400"
            @set-main-picture="setMainPicture"
            :listUploadControl="listUploadControl"
            @select-image="showGallary"
        />
        <SymperDialogConfirm
            v-if="readyLoaded"
            @confirm="symperDialogConfirm"
            @cancel="symperDialogCancel"
            @disprove="symperDialogDisprove"
            :title="allDialogData[symperDialogType].title"
            :content="allDialogData[symperDialogType].content"
            :showDialog="isShowSymperDialog"
            :showDisprove="allDialogData[symperDialogType].showDisprove"
            :showCancel="allDialogData[symperDialogType].showCancel"
        />
        <ShowDownloadNotification
            v-if="readyLoaded"
            :maxWidth="330"
            :showCancel="false"
            @confirm="showNotiDownload = false"
            :title="$t('v2.doc.compressingFiles')"
            :content="contentDownload"
            :showDialog="showNotiDownload"
        />
        <LightBox
            v-if="readyLoaded"
            ref="lightbox"
            :media="listImage"
            :show-caption="true"
            :show-light-box="true"
            @set-main-picture="setMainPictureLightBox"
        />
        <Tablet
            v-if="readyLoaded"
            :listItem="allItemRestored"
            :width="'30cm'"
            :height="'80%'"
            :sideBarWidth="'220px'"
            :title="`<span class='mdi mdi-database-sync'></span> &nbsp;${$t('v2.doc.selectBackup')}`"
            @after-selected-item-tablet="afterSelectedItemTablet"
            ref="tabletView"
        >
            <template slot="contentBinding">
                <StorageContentPreview
                    :storageDocumentData="storageDocumentData"
                />
            </template>
            <template slot="actionBinding">
                <button @click="restoreRecord">{{$t('v2.doc.restore')}}</button>
            </template>
        </Tablet>
        <v-dialog
            class="bg-white"
            v-model="showMatchingItems"
            content-class="bg-white h-100"
            width="100%"
        >
            <HeaderForm
                ref="headerForm"
                :isBorderBottom="false"
                :showIconInfo="false"
                :showBtnSave="true"
                @save-form="saveMatchingItems"
                @close-form="showMatchingItems = false"
            />
            <MatchingItem
                :rowData="matchingItemRowData"
                :data="matchingItemOfCurrentTable"
                ref="matchingItems"
            />
        </v-dialog>
        <OrgchartSelector
            :idOrgchart="departmentControl.idOrgchart"
            :filterByUsers="departmentControl.conditionControls"
            :level="departmentControl.level"
            :selectedItems="departmentControl.selectedItems"
            :controlName="departmentControl.controlName"
            :selectMultiple="departmentControl.selectMultiple"
            ref="orgchartSelector"
            @save="saveDepartment"
        />
        <v-navigation-drawer
            class="s-drawer"
            fixed
            permanent
            right
            :style="{
                'z-index':'100!important',
                transform: isShowFormLink
                    ? 'translateX(0%)'
                    : 'translateX(100%)',
                width: '974px'
            }"
        >
            <div
                v-if="isShowFormLink && parrentInstance == 0"
                class="detail-form-link"
            >
                <div class="d-flex">
                    <div
                        style="
                            padding: 6px 0 0 12px;
                            font-weight: 500;
                            font-size: 12px;
                        "
                    >
                        {{ linkTitle }}
                    </div>
                    <div class="btn-close-form-link" @click="closeFormLink">
                        <span class="mdi mdi-close"></span>
                    </div>
                </div>
                <v-divider></v-divider>
                <div
                    class="w-100"
                    style="height: calc(100% - 70px); overflow: scroll"
                >
                    <detailDocument
                        :parrentInstance="keyInstance"
                        :isMinimizeForm="true"
                        :docObjInfo="docLinkObjInfo"
                        :quickView="true"
                    />
                </div>
            </div>
        </v-navigation-drawer>
    </div>
</template>
<script>
import InputFilterListCard from '@/components/common/InputFilterListCard';
import LightBox from './../../..//components/common/imageSlideShow/LightBox';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
import ShowDownloadNotification from '@/components/common/SymperDialogConfirm';
import PreviewFile from '@/components/common/PreviewFile';
import PreviewUploadFile from '@/components/common/PreviewUploadFile';
import { documentApi } from './../../../api/Document.js';
import { formulasApi } from './../../../api/Formulas.js';
import locationApi from '@/api/location.js';
import './../../../components/document/documentContent.css';
import {
    allControlNotSetData,
    getDataInputFormula
} from './../../../components/document/dataControl';
import BasicControl from './basicControl';
import TableControl from './tableControl1';
import ActionControl from './actionControl';
import LayoutControl from './layoutControl';
import PageControl from './pageControl';
import TabControl from './tabControl';
import DatePicker from './../../../components/common/DateTimePicker';
import UploadFile from '@/components/common/UploadFile.vue';
import UploadAndDrag from '@/components/common/UploadAndDrag.vue';
import ListImagePopUp from './../../../components/common/ListImagePopUp.vue';
import SymperDragPanel from './../../../components/common/SymperDragPanel.vue';
import { util } from './../../../plugins/util.js';
import AutocompleteInput from './items/AutocompleteInput.vue';
import Filter from './items/Filter.vue';
import StorageContentPreview from './items/StorageContentPreview.vue';
import FileUpload from './items/FileUpload.vue';
import Validate from './../common/Validate';
import Util from './util';
import SidebarTraceFormulas from './SidebarTraceFormulas.vue';
import './customControl.css';
import ErrMessagePanel from './../../../views/document/items/ErrMessagePanel.vue';
import EmbedDataflow from '@/components/dataflow/EmbedDataflow';
import Preloader from './../../../components/common/Preloader';
import { listControlNotNameProp } from './../../../components/document/controlPropsFactory.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import FloattingPopup from './../common/FloattingPopup';
import Comment2 from '@/components/common/commentVer2/Comment2.vue';
import {
    checkCanBeBind,
    resetImpactedFieldsList,
    markBinedField,
    checkDataInputChange,
    setDataInputBeforeChange,
    afterRunRootControlManually
} from './handlerCheckRunFormulas';
import {
    checkControlPropertyProp,
    getControlInstanceFromStore,
    getListInputInDocument,
    minimizeDataAfterRunFormula,
    getConfigDeleteRowTable,
    SQLITE_COLUMN_IDENTIFIER
} from './../common/common';
import Formulas from './formulas.js';
import PopupPivotTable from './items/PopupPivotTable';
import ControlRelationWorker from 'worker-loader!@/worker/document/submit/ControlRelation.Worker.js';
import FormulasWorker from 'worker-loader!@/worker/document/submit/Formulas.Worker.js';
import Tablet from './../../../components/common/Tablet';
import { str } from '@/plugins/utilModules/str.js';
import IndexedDB from '@/plugins/utilModules/indexedDB.js';
import MatchingItem from '@/components/document/matchingItem/MatchingItem.vue';
import HeaderForm from '@/components/common/HeaderForm';
const SUBMIT_DATA_CACHE_INDEX_DB = 'submit-data-control';
var currentDocumentInfor = {};
import OrgchartSelector from '@/components/orgchart/selector/orgchartSelector';
import _isEmpty from 'lodash/isEmpty';
import { documentServiceApi } from '@/api/DocumentService.js';
import detailDocument from '@/views/document/detail/Detail.vue';

export default {
    inject: ['theme'],
    props: {
        isCloneType: {
            type: Boolean,
            default: false
        },
        taskAction: {
            type: String,
            default: 'submit'
        },
        showSnackbarSuccess: {
            type: Boolean,
            default: true
        },
        isQickSubmit: {
            type: Boolean,
            default: false
        },
        docId: {
            default: 0
        },
        showSubmitButton: {
            default: true
        },
        documentObjectId: {
            default: 0
        },
        action: {
            // submit hoặc update
            type: String,
            default: 'submit'
        },
        documentObjectWorkflowObjectId: {
            type: String,
            default: ''
        },
        documentObjectWorkflowId: {
            type: String,
            default: ''
        },
        documentObjectTaskId: {
            type: String,
            default: ''
        },
        /**
         * Biến chỉ ra bản ghi nằm trong app nào
         */
        appId: {
            default: 0
        },

        workflowVariable: {
            type: Object,
            default() {
                return {};
            }
        },
        overrideControls: {
            type: Object,
            default() {
                return {};
            }
        },
        overridePropertiesControls: {
            type: Object,
            default() {
                return {};
            }
        },

        /**
         * Tham số truyên vào chỉ ra control nào được nhập liệu
         * vd:['mct','tb1_ma_hang']
         */
        editableControls: {
            type: Array,
            default() {
                return null;
            }
        },
        parrentInstance: {
            type: Number,
            default: 0
        },
        dataPreview: {
            type: Object,
            default() {
                return {};
            }
        },
        overrideEventScheduler: {
            type: Object,
            default() {
                return {};
            }
        },
        isViewPopup: {
            type: Boolean,
            default: false
        }
    },
    name: 'submitDocument',

    components: {
        validate: Validate,
        OrgchartSelector,
        'date-picker': DatePicker,
        'filter-input': Filter,
        'autocomplete-input': AutocompleteInput,
        'input-filter-list-card': InputFilterListCard,
        'sym-drag-panel': SymperDragPanel,
        'err-message': ErrMessagePanel,
        HeaderForm,
        FileUpload,
        MatchingItem,
        EmbedDataflow,
        Preloader,
        UploadFile,
        UploadAndDrag,
        ListImagePopUp,
        LightBox,
        SidebarTraceFormulas,
        VuePerfectScrollbar,
        PreviewFile,
        PreviewUploadFile,
        SymperDialogConfirm,
        ShowDownloadNotification,
        FloattingPopup,
        PopupPivotTable,
        Tablet,
        StorageContentPreview,
        Comment2,
        detailDocument
    },
    computed: {
        sDocumentEditor() {
            return this.$store.state.document.editor[this.keyInstance];
        },
        sDocumentSubmit() {
            return this.$store.state.document.submit[this.keyInstance];
        },
        sDocumentDetail() {
            return this.$store.state.document.detail[this.keyInstance];
        },
        endUserInfo() {
            return this.$store.state.app.endUserInfo;
        },
        viewType() {
            return this.$store.state.document.viewType[this.keyInstance];
        },

        // linkControl(){
        //     return this.$store.state.document.linkControl[this.keyInstance]
        // },
        baInfo() {
            return this.$store.state.app.baInfo;
        },
        currentRowChangePivotMode() {
            return this.$store.state.document.submit[this.keyInstance]
                .currentRowChangePivotMode;
        },
        isRunningAllFormulaManually(){
            return this.$store.state.document.submit[this.keyInstance] ? this.$store.state.document.submit[this.keyInstance].isRunningAllFormulaManually : false;            
        },
        listRootControlRunFormulaManually(){
            return this.$store.state.document.submit[this.keyInstance].listRootControlRunFormulaManually;         
        },
        calcPositionButtonRunAllFormulaManually(){
            let bottom = 102
            let right = 25
            if(this.isViewPopup){
                right = 10
                bottom = 10
            }
            if(this.fab){
                bottom = bottom + 220
            }
            return {'bottom': bottom + 'px', 'right': right + 'px', 'background-color': 'orange', 'z-index': 3, 'float': 'right'}
        }
    },

    destroyed() {
        if(this.parrentInstance == 0){
            this.closeFormulasWorker();
            this.$evtBus.$off('document-show-symper-dialog');
            this.$evtBus.$off('on-switch-pivot-table-mode');
            this.$evtBus.$off('on-add-data-to-pivot-table');
            this.$evtBus.$off('document-on-table-change');
            this.$evtBus.$off('run-formulas-control-outside-table');
            this.$evtBus.$off('document-submit-open-subform');
            this.$evtBus.$off('document-submit-image-click');
            this.$evtBus.$off('document-submit-drag-and-drop');
            this.$evtBus.$off('document-submit-copy');
            this.$evtBus.$off('document-submit-add-file-click');
            this.$evtBus.$off('document-submit-add-list-file');
            this.$evtBus.$off('document-item-control-file-refresh');
            this.$evtBus.$off('document-item-control-file-delete-all');
            this.$evtBus.$off('document-item-control-file-click');
            this.$evtBus.$off('document-item-control-file-delete');
            this.$evtBus.$off('show-notification-download-all-file');
            this.$evtBus.$off('document-submit-input-change');
            this.$evtBus.$off('run-effected-control-when-table-change');
            this.$evtBus.$off('document-submit-show-time-picker');
            this.$evtBus.$off('document-submit-date-input-click');
            this.$evtBus.$off('document-submit-filter-input-card-click');
            this.$evtBus.$off('document-submit-filter-input-click');
            this.$evtBus.$off('document-submit-add-group-row-no-formulas');
            this.$evtBus.$off('document-submit-add-group-row-has-formulas');
            this.$evtBus.$off('document-submit-autocomplete-key-event');
            this.$evtBus.$off('document-submit-department-key-event');
            this.$evtBus.$off('document-submit-select-input');
            this.$evtBus.$off('document-submit-department-click');
            this.$evtBus.$off(
                'document-submit-filter-input-card-click-show-detail'
            );
            this.$evtBus.$off('symper-app-wrapper-clicked');
            this.$evtBus.$off('document-submit-show-trace-control');
            this.$evtBus.$off('document-submit-show-matching-item');
            this.$evtBus.$off('document-submit-finish-run-formulas-control-manually');
            this.$evtBus.$off('document-get-location');
            this.$evtBus.$off('document-get-location-automatically');
            this.$evtBus.$off('document-submit-run-formula-manually-control-click');
            this.$evtBus.$off('document-submit-continue-run-formulas-control-manually');       
            $('.symper-drag-panel').css('display', 'none');
            let listTable = this.listTable;
            for (let i in listTable) {
                let table = listTable[i];
                let tableIns = getControlInstanceFromStore(
                    this.keyInstance,
                    table.name
                );
                tableIns.destroyed();
            }
        }
    },
    data() {
        return {
            listCards: {
                controlName: '',
                listSelected: [],
                listTitle: []
            },
            matchingItemOfCurrentTable: {}, // chứa thông tin cấu hình công thức, cột... của các bảng đích + nguồn trong matching item
            matchingItemRowData: [],
            showMatchingItems: false,
            matchingItemsAllTables: {},
            listTitleInputFilter: {},
            listControlInputFilters: {},
            uploadData: null,
            listUploadFile: [],
            fileInfor: {},
            listUploadControl: {
                currentControl: {},
                allControl: [],
                imgIdx: 0
            },
            currentControl: null,
            scrollIntoView: true,
            listImage: [],
            dataPost: {},
            dataTable: [],
            emptyRow: [],
            hasEmptyRow: false,
            isShowSymperDialog: false,
            contentDownload: this.$t('v2.doc.clickNotifyToDownload'),
            showNotiDownload: false,
            isDateTimePicker: false,
            controlInfinity: [],
            focusingControlName: '',
            contentDocument: null,
            documentInfo: null,
            documentId: null,
            documentName: null,
            docSize: null,
            isShowSubFormSubmit: false,
            keyInstance: Date.now(),
            titleDragPanel: null,
            titleDragPanelIcon: null,
            direction: 'top',
            fab: false,
            fling: false,
            hover: false,
            tabs: null,
            top: false,
            right: true,
            bottom: true,
            left: false,
            transition: 'slide-y-reverse-transition',
            isSubmitting: false,
            columnsSQLLiteDocument: null,
            docObjId: null,
            topPositionDragPanel: 100,
            leftPositionDragPanel: 300,
            listMessageErr: [],
            titleValidate: '',
            isDraft: 0,
            preDataSubmit: {},
            objectIdentifier: {},
            otherInfo: {},
            objectOtherInfo: {},
            listDataFlow: [],
            docSubFormId: 0,
            drawer: false,
            isContinueSubmit: false,
            titleObjectFormula: null,
            isShowTraceControlSidebar: false,
            listFormulasTrace: {},
            controlTrace: null,
            listFileControl: [],
            currentFileControl: null,
            currentControlDataflow: null,
            dataGroupTable: {},
            dataPivotTable: {},
            dataColPivot: [],
            dataPivotMode: [],
            globalClass: null,
            controlRelationWorker: null,
            formulasWorker: null,
            optionalDataBinding: {},
            tableFocusing: null,
            rootControlFromWorkflow: [],
            dragPopupType: 'inputFilter',
            listDocumentIdentifierControl: {},
            dataDeleteRowTableConfig: {},
            autocompleteTimer: null,
            allDialogData: null,
            symperDialogType: 'emptyRow',
            allItemRestored: [],
            storageDocumentData: { listTable: [], listControlOutsideTable: [] },
            isPermission: true,
            isShowComment: false,
            scrollBottom: false,
            departmentControl: {
                idOrgchart: '',
                level: '',
                selectedItems: [],
                controlName: '',
                selectMultiple: false,
                mapData: {},
                conditionControls: []
            },
            readyLoaded: false,
            location: '',
            listControlRunFormulaManually: {},
            listDataRootControlRunFormulaManually: [],
            listTable: {},
            isGetControlLocationAutomatically: false,
            listControlLocationGetDataAutomatic: [],
            isShowFormLink: false,
            docLinkObjInfo:null
        };
    },
    beforeMount() {
        this.columnsSQLLiteDocument = {};
        this.globalClass = {
            'wrap-content-submit': true,
            'sym-sub-form-submit': this.parrentInstance == 0 ? false : true
        };
        this.allDialogData = {
            emptyRow: {
                title: this.$t('v2.doc.thereAreEmptyRowInTable'),
                content: this.$t('v2.doc.youWantToRemoveBlankLine'),
                showDisprove: true,
                showCancel: true
            },
            canNotDeleteRow: {
                title: this.$t('v2.doc.notify'),
                content: this.$t('v2.doc.cannotDeleleSelectedLine'),
                showDisprove: false,
                showCancel: false
            },
            sortAndFilterTable: {
                title: this.$t('v2.doc.tableContainColumnSortedOrFilter'),
                content: this.$t('v2.doc.autoRemoveSortAndFilter'),
                showDisprove: false,
                showCancel: true
            }
        };
    },
    async mounted() {
        window.addEventListener('paste', this.insertNewRowsBeforePaste);
        this.optionalDataBinding['context'] = this.documentObjectWorkflowId
            ? 'inWorkflow'
            : 'outWorkflow';
        this.optionalDataBinding['document_object_id'] = this.docObjId;
        if (this.docObjId) {
            this.optionalDataBinding['action'] = 'update';
        } else {
            this.optionalDataBinding['action'] = 'submit';
        }
        this.$store.commit('document/addToDocumentSubmitStore', {
            key: 'optionalDataBinding',
            value: this.optionalDataBinding,
            instance: this.keyInstance
        });
        let thisCpn = this;
        this.controlRelationWorker = new ControlRelationWorker();
        this.controlRelationWorker.addEventListener(
            'message',
            function (event) {
                let data = event.data;
                switch (data.action) {
                    case 'setDataForPropsControl':
                        let listControlToStore =
                            data.dataAfter.listControlToStore;
                        let controlMapDatasetDataflow =
                            data.dataAfter.controlMapDatasetDataflow;
                        for (let controlId in listControlToStore) {
                            let control = listControlToStore[controlId]
                            control = thisCpn.multilinguePropertiesControl(control,control.type);
                            thisCpn.$store.commit('document/addControl', {
                                id: controlId,
                                props: control,
                                instance: thisCpn.keyInstance
                            });
                        }
                        thisCpn.$store.commit(
                            'document/addToDocumentSubmitStore',
                            {
                                key: 'listControlMappingDatasets',
                                value: controlMapDatasetDataflow,
                                instance: thisCpn.keyInstance
                            }
                        );
                        thisCpn.formulasWorker.postMessage({
                            action: 'updateDocumentObjectId',
                            data: {
                                keyInstance: thisCpn.keyInstance,
                                updateDocumentObjectId: thisCpn.docObjId
                            }
                        });
                        thisCpn.processHtml();
                        break;
                    case 'afterGetRootControlRunFormulaManually':
                        thisCpn.listDataRootControlRunFormulaManually = Object.keys(data.dataAfter);
                        thisCpn.$store.commit('document/addToDocumentSubmitStore', {
                            key: 'listRootControlRunFormulaManually',
                            value: data.dataAfter,
                            instance: thisCpn.keyInstance
                        });
                        thisCpn.$store.commit('document/addToDocumentSubmitStore', {
                            key: 'listControlRunFormulaManually',
                            value: thisCpn.listControlRunFormulaManually,
                            instance: thisCpn.keyInstance
                        });
                        thisCpn.controlRelationWorker.terminate();
                        break;
                    default:
                        break;
                }
            }
        );
        /**
         * Lắng nghe sự kiện từ luồng xử lí formulas
         */
        this.handleLoadContentDocument();
        this.formulasWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'afterRunFormulasSuccess':
                    let controlName = data.dataAfter.controlName;
                    let res = data.dataAfter.res;
                    let formulaType = data.dataAfter.formulaType;
                    let rowNodeId = data.dataAfter.rowNodeId;
                    let controlIns = getControlInstanceFromStore(
                        thisCpn.keyInstance,
                        controlName
                    );
                    if (rowNodeId) {
                        let tableControl = getControlInstanceFromStore(
                            thisCpn.keyInstance,
                            controlIns.inTable
                        );
                        let isMultiple = data.dataAfter.isMultiple;
                        tableControl.tableInstance.afterRunFormula(
                            res,
                            formulaType,
                            controlIns,
                            rowNodeId,
                            isMultiple
                        );
                    } else {
                        thisCpn.handleAfterRunFormulas(
                            res,
                            controlName,
                            formulaType
                        );
                    }
                    break;
                case 'afterCreateSQLiteDB':
                    // thisCpn.handleLoadContentDocument();
                    thisCpn.controlRelationWorker.postMessage({
                        action: 'setDataForPropsControl',
                        data: {
                            fields: thisCpn.currentFields,
                            viewType: thisCpn.viewType,
                            allDataDetail: thisCpn.sDocumentDetail.allData
                        }
                    });
                    break;
                default:
                    break;
            }
        });
        $('#sym-submit-' + this.keyInstance).on(
            'click',
            '.validate-icon',
            function (e) {
                e.preventDefault();
                e.stopPropagation();
                let controlName = $(this).attr('control-name');
                let control = getControlInstanceFromStore(
                    thisCpn.keyInstance,
                    controlName
                );
                let rowIndex = $(this).attr('row-node-id');
                rowIndex = Number(rowIndex);
                if (!rowIndex) {
                    rowIndex = 0;
                }
                let validateData = {};
                for (
                    let index = 0;
                    index < control.validateMessageType.length;
                    index++
                ) {
                    const type = control.validateMessageType[index];
                    if (
                        control.valueValidation[type] &&
                        control.valueValidation[type][rowIndex] &&
                        control.valueValidation[type][rowIndex].isValid
                    ) {
                        let item = {};
                        item[rowIndex] =
                            control.valueValidation[type][rowIndex];
                        validateData[type] = item;
                    }
                }
                thisCpn.$refs.validate.show(e, validateData);
            }
        );

        $(document)
            .find('#sym-submit-' + this.keyInstance)
            .on('click', '.run-dataflow', function (e) {
                let idControl = $(this)
                    .closest('.s-control-data-flow')
                    .attr('id');
                let control = thisCpn.sDocumentEditor.allControl[idControl];
                thisCpn.currentControlDataflow = control;
                let dataParams = thisCpn.getParamsForRunDataFlow(
                    control.properties
                );
                let id = control.properties.dataFlowId.value.id ? control.properties.dataFlowId.value.id : control.properties.dataFlowId.value
                thisCpn.$refs[
                    'dataFlow' + id
                ][0].runDataflow(dataParams);
                // thisCpn.$refs['dataFlow'+control.properties.dataFlowId.value][0].runDataflow();
            });
    },
    async created() {
        this.createTime = Date.now();
        window.addEventListener('beforeunload', this.handlerReload);
        let thisCpn = this;
        this.$store.commit('document/changeViewType', {
            key: this.keyInstance,
            value: this.action
        });
        this.formulasWorker = new FormulasWorker();

        this.formulasWorker.postMessage({
            action: 'addWorkflowVariable',
            data: {
                keyInstance: this.keyInstance,
                workflowVariable: this.workflowVariable
            }
        });

        this.$store.commit('document/setDefaultSubmitStore', {
            instance: this.keyInstance
        });
        this.$store.commit('document/setDefaultDetailStore', {
            instance: this.keyInstance
        });
        this.$store.commit('document/setDefaultEditorStore', {
            instance: this.keyInstance
        });
        if (this.docId != 0) {
            this.documentId = this.docId;
        } else if (this.$getRouteName() == 'submitDocument') {
            this.documentId = this.$route.params.id;
        } else if (this.$getRouteName() == 'updateDocumentObject') {
            this.docObjId = this.$route.params.id;
            this.$store.commit('document/changeViewType', {
                key: this.keyInstance,
                value: 'update'
            });
        } else if (this.$getRouteName() == 'cloneDocumentObject') {
            this.docObjId = this.$route.params.id;
            this.$store.commit('document/changeViewType', {
                key: this.keyInstance,
                value: 'update'
            });
            this.isCloneType = true;
        }
        // Nếu truyền vào documentObjectId
        if (this.documentObjectId) {
            this.docObjId = this.documentObjectId;
        }

        /**
         * Nhận xử lí sự kiện hiển thị dialog
         */
        this.$evtBus.$on('document-show-symper-dialog', (locate) => {
            if (thisCpn._inactive == true) return;
            this.symperDialogType = locate.symperDialogType;
            this.isShowSymperDialog = true;
        });

        /**
         * Nhận xử lí sự kiện click chuyển đổi dạng table <=> pivot mode
         */
        this.$evtBus.$on('on-switch-pivot-table-mode', (locate) => {
            if (thisCpn._inactive == true) return;
            let tableName = locate.tableName;
            let tableInstance = getControlInstanceFromStore(
                this.keyInstance,
                tableName
            );
            tableInstance.tableMode =
                tableInstance.tableMode == 'Flat' ? 'Pivot' : 'Flat';
            tableInstance.switchTable();
        });
        /**
         * Nhận xử lí sự kiện thêm dữ liệu cho bảng pivot
         */
        this.$evtBus.$on('on-add-data-to-pivot-table', (locate) => {
            if (thisCpn._inactive == true) return;
            let type = locate.type;
            let tableName = locate.tableName;
            let tableInstance = getControlInstanceFromStore(
                this.keyInstance,
                tableName
            );
            let pivotData = tableInstance.pivotTable.getDataGroup();
            let rowsConfig = pivotData['rows'];
            this.dataColPivot = [];
            this.dataPivotMode = [];
            for (let index = 0; index < rowsConfig.length; index++) {
                let controlName = rowsConfig[index];
                let controlBindData = getControlInstanceFromStore(
                    this.keyInstance,
                    controlName
                );
                let value = controlBindData.value;
                let uniqueData = value.filter(function (value, index, self) {
                    return self.indexOf(value) === index;
                });
                let inputData = {
                    controlName: controlName,
                    controlTitle: controlBindData.title,
                    value: uniqueData,
                    type: 'rows'
                };
                if (tableInstance.pivotTable.pivotConfig.rows.length > 1) {
                    inputData.detailTitle =
                    this.$t('v2.doc.leaveBlankIfWantAddDataForRow');
                    this.dataPivotMode.push(inputData);
                } else {
                    inputData.isDisable = true;
                    this.dataPivotMode.push(inputData);
                }
            }
            let colsConfig = pivotData['cols'];
            for (let index = 0; index < colsConfig.length; index++) {
                let controlName = colsConfig[index];
                let controlBindData = getControlInstanceFromStore(
                    this.keyInstance,
                    controlName
                );
                let value = controlBindData.value;
                let uniqueData = value.filter(function (value, index, self) {
                    return self.indexOf(value) === index;
                });
                if (type == 'cols') {
                    this.dataColPivot.push({
                        controlName: controlName,
                        controlTitle: controlBindData.title
                    });
                } else {
                    this.dataPivotMode.push({
                        controlName: controlName,
                        controlTitle: controlBindData.title,
                        value: uniqueData,
                        type: 'cols',
                        detailTitle:
                        this.$t('v2.doc.leaveBlankIfWantAddDataForColumn')
                    });
                }
            }

            this.$refs.popupPivotTableView.show(type, tableName);
        });

        /**
         * Su kiện phát ra khi có sự thay đổi trong table, để convert sang pivot table
         */
        this.$evtBus.$on('document-on-table-change', (locate) => {
            if (thisCpn._inactive == true) return;
            let tableName = locate.tableName;
            if (this.dataPivotTable && this.dataPivotTable[tableName]) {
                let data = locate.data;
                let tableIns = getControlInstanceFromStore(
                    this.keyInstance,
                    tableName
                );
                this.setDataToPivotTable(tableIns, data);
            }
        });

        this.$evtBus.$on('run-formulas-control-outside-table', (e) => {
            if (thisCpn._inactive == true) return;
            try {
                let formulaInstance = e.formulaInstance;
                let controlName = e.controlName;

                this.handlerBeforeRunFormulasValue(
                    formulaInstance,
                    controlName,
                    'formulas'
                );
            } catch (error) {
                console.warn(error);
            }
        });
        /**
         * Hàm gọi mở sub form submit
         */
        this.$evtBus.$on('document-submit-open-subform', (data) => {
            if (thisCpn._inactive == true) return;
            try {
                if (thisCpn.drawer == false && thisCpn.docSubFormId == 0) {
                    thisCpn.docSubFormId = parseInt(data.docId);
                }
                thisCpn.drawer = true;
            } catch (error) {
                console.error(thisCpn.$t('v2.doc.error'), error);
            }
        });
        /**
         * Hàm gọi mở upload file
         */
        this.$evtBus.$on('document-submit-image-click', (data) => {
            if (thisCpn._inactive == true) return;
            thisCpn.currentFileControl = { controlIns: data.control };
            if (data.control.inTable) {
                thisCpn.$set(
                    thisCpn.sDocumentSubmit.listInputInDocument[
                        data.control.name
                    ],
                    'focusCell',
                    data.focusCell
                );
            }
            thisCpn.$refs.uploadAndDrag.control = data.control;
            thisCpn.$refs.uploadAndDrag.openFile();

            // thisCpn.$refs.fileUploadView.onButtonClick();
        });
        //Xử lý sau khi drag và drop của file
        this.$evtBus.$on('document-submit-drag-and-drop', (data) => {
            if (thisCpn._inactive == true) return;
            thisCpn.currentFileControl = { controlIns: data.control };
            if (data.control.inTable) {
                let target = { target: { files: data.fileInfo } };
                thisCpn.$refs.uploadAndDrag.handleDragAndDrop(target);
                thisCpn.$refs.uploadAndDrag.control = data.control;
            } else {
                let listFile = [];
                if (data.control.value != '') {
                    data.control.value.map((file) => {
                        listFile.push(file.name);
                    });
                }
                let file = { target: { files: data.fileInfo } };
                thisCpn.$refs.uploadAndDrag.handleDragAndDrop(file);
                thisCpn.$refs.uploadAndDrag.control = data.control;
            }
        });
        this.$evtBus.$on('document-submit-copy', (data) => {
            let listFile = [];
            if (data.control.value != '') {
                data.control.value.map((file) => {
                    listFile.push(file.name);
                });
            }
            this.currentFileControl = { controlIns: data.control };
            let file = { target: { files: data.fileInfo } };
            this.$refs.uploadAndDrag.handleDragAndDrop(file);
            this.$refs.uploadAndDrag.control = data.control;
        });

        this.$evtBus.$on('document-submit-add-file-click', (data) => {
            if (thisCpn._inactive == true) return;
            this.currentFileControl = { controlIns: data.control };
            if (data.control.inTable != false) {
                this.titleDragPanel = this.$t('v2.doc.list');
                this.dragPopupType = 'fileUpload';
                this.$refs.symDragPanel.show();
                this.$refs.fileUploadPopup.refreshData();
                this.$refs.fileUploadPopup.setControl(data.control);
            } else {
                // this.$refs.fileUplo  adView.onButtonClick();
                if (this.$refs.uploadAndDrag) {
                    this.$refs.uploadAndDrag.openFile();
                    this.$refs.uploadAndDrag.control = data.control;
                }
            }
        });
        // xử lý thêm ảnh trong row table
        this.$evtBus.$on('document-submit-add-list-file', (data) => {
            if (thisCpn._inactive != true) {
                thisCpn.titleDragPanel = thisCpn.$t('v2.doc.fileUploadList');
                thisCpn.dragPopupType = 'fileUpload';
                thisCpn.$refs.symDragPanel.show();
                if (!thisCpn.$refs.fileUploadPopup) {
                    thisCpn.listUploadFile = JSON.parse(data.row);
                    data.control.focusCell = data.focusCell;
                    thisCpn.currentFileControl = {
                        type: 'table',
                        ...data.control
                    };
                } else {
                    thisCpn.$refs.fileUploadPopup.refreshData();
                    thisCpn.$refs.fileUploadPopup.listFile = JSON.parse(
                        data.row
                    );
                    data.control.focusCell = data.focusCell;
                    thisCpn.$refs.fileUploadPopup.control = data.control;
                }
            }
        });
        this.$evtBus.$on('document-item-control-file-refresh', (data) => {
            if (thisCpn._inactive == true) return;
            thisCpn.listUploadControl.allControl =
                thisCpn.getAllControlUpload();
        });
        this.$evtBus.$on('document-item-control-file-delete-all', (data) => {
            if (thisCpn._inactive == true) return;
            thisCpn.listUploadControl.allControl.map((control, index) => {
                if (control.name == data.name) {
                    thisCpn.listUploadControl.allControl[index].value = [];
                }
            });
        });
        this.$evtBus.$on('document-item-control-file-click', (data) => {
            if (thisCpn._inactive == true) return;
            thisCpn.listUploadControl.allControl =
                thisCpn.getAllControlUpload();
            thisCpn.listUploadControl.currentControl = data.control;
            thisCpn.listUploadControl.imgIdx = data.imgIdx;
            if (thisCpn.isQickSubmit) {
                thisCpn.$emit('add-upload-panel', {
                    listUploadControl: thisCpn.listUploadControl,
                    isSetMain: true
                });
            } else {
                thisCpn.$refs.previewUploadFile.show();
            }
        });
        // action khi xóa file ảnh trong control upload
        this.$evtBus.$on('document-item-control-file-delete', (data) => {
            if (thisCpn._inactive == true) return;
            thisCpn.listUploadControl.allControl =
                thisCpn.getAllControlUpload();
            thisCpn.listUploadControl.currentControl = data.control;
            thisCpn.listUploadControl.imgIdx = data.imgIdx;
        });
        // thông báo download thành công hoặc thất bại
        this.$evtBus.$on(
            'show-notification-download-all-file',
            (isShowNoti) => {
                if (thisCpn._inactive == true) return;
                if (isShowNoti) {
                    this.showNotiDownload = true;
                } else {
                    this.contentDownload =
                    this.$t('v2.doc.fileCompressionFailed');
                }
            }
        );
        // hàm nhận sự kiện thay đổi của input
        this.$evtBus.$on('document-submit-input-change', (controlInstance) => {
            if (this._inactive == true) return;
            this.handleInputChangeByUser(controlInstance);
        });
        this.$evtBus.$on(
            'run-effected-control-when-table-change',
            (control) => {
                if (this._inactive == true) return;
                this.handlerBeforeRunFormulasValue(
                    control.controlFormulas.formulas.instance,
                    control.name,
                    'formulas'
                );
            }
        );

        this.$evtBus.$on('document-submit-show-time-picker', (e) => {
            if (this._inactive == true) return;
            let controlIns = e.control;
            this.isDateTimePicker = true;
            this.$refs.datePicker.openPicker(e);
            this.$refs.datePicker.setShowTime(false, controlIns.value);
            if (e.fromIcon && controlIns.inTable != false) {
                let tableIns = getControlInstanceFromStore(
                    this.keyInstance,
                    controlIns.inTable
                );
                let cellForcus = tableIns.tableInstance.getFocusedCell();
                tableIns.tableInstance.startEditingCell({
                    rowIndex: cellForcus.rowIndex,
                    colKey: controlIns.name
                });
            }
        });
        this.$evtBus.$on('document-submit-date-input-click', (e) => {
            if (this._inactive == true) return;
            let controlIns = e.control;
            this.isDateTimePicker = true;
            this.$refs.datePicker.setShowDate(true);
            if (e.control.type == 'date') {
                this.isDateTimePicker = false;
                this.$refs.datePicker.setRange(
                    controlIns.minDate,
                    controlIns.maxDate
                );
            }
            this.$refs.datePicker.openPicker(e);
            if (e.fromIcon && controlIns.inTable != false) {
                let tableIns = getControlInstanceFromStore(
                    this.keyInstance,
                    controlIns.inTable
                );
                let cellForcus = tableIns.tableInstance.getFocusedCell();
                tableIns.tableInstance.startEditingCell({
                    rowIndex: cellForcus.rowIndex,
                    colKey: controlIns.name
                });
            }
        });
        // click vào nút cộng để mở input filter
        this.$evtBus.$on('document-submit-filter-input-card-click', (e) => {
            if (this._inactive == true) return;
            let control = getControlInstanceFromStore(
                e.keyInstance,
                e.controlName
            );
            e.control = control;
            e.curTarget = e.target;
            e.formulas = control.controlFormulas.list;
            // this.$evtBus.$emit('document-submit-filter-input-click', e)
            let inputOffset = e.getOffSet;
            let submitFormOffset = $('#sym-submit-' + e.keyInstance).offset();
            let submitFormWidth = $('#sym-submit-' + e.keyInstance).width();
            let leftDiff = inputOffset.left - submitFormOffset.left;
            let cardWidth = 600;
            let cardHeight = 400;
            let inputWidth = $(e.target).width();
            if (cardWidth + leftDiff > submitFormWidth) {
                this.leftPositionDragPanel = Math.abs(
                    inputOffset.left + inputWidth - cardWidth
                );
                this.topPositionDragPanel = inputOffset.top + 26;
            } else {
                this.leftPositionDragPanel = Math.abs(inputOffset.left);
                this.topPositionDragPanel = inputOffset.top + 26;
            }
            if (window.innerHeight < inputOffset.top + 400) {
                this.topPositionDragPanel = Math.abs(
                    inputOffset.top - cardHeight
                );
            }
            this.titleDragPanel = this.$t('common.search_data');
            this.titleDragPanelIcon = 'mdi-file-search';
            this.dragPopupType = 'inputFilter';
            this.$refs.inputFilter.setControlTitle(e.control.title);
            this.$refs.inputFilter.setControlName(e.controlName);
            this.runInputFilterFormulas(e.controlName);
            this.$refs.symDragPanel.show();
            this.$refs.inputFilter.setFormulas(e.formulas);
        });
        /**
         * Sự kiện bắn ra từ click vào input filter để mở popup
         */
        this.$evtBus.$on('document-submit-filter-input-click', (e) => {
            if (this._inactive == true) return;
            let inputOffset = $(e.target).offset();
            let submitFormOffset = $(
                '#sym-submit-' + this.keyInstance
            ).offset();
            let submitFormWidth = $('#sym-submit-' + this.keyInstance).width();
            let leftDiff = inputOffset.left - submitFormOffset.left;
            let cardWidth = 600;
            let cardHeight = 400;
            let inputWidth = $(e.target).width();
            if (cardWidth + leftDiff > submitFormWidth) {
                this.leftPositionDragPanel = Math.abs(
                    inputOffset.left + inputWidth - cardWidth
                );
                this.topPositionDragPanel = inputOffset.top + 26;
            } else {
                this.leftPositionDragPanel = Math.abs(inputOffset.left);
                this.topPositionDragPanel = inputOffset.top + 26;
            }
            if (window.innerHeight < inputOffset.top + 400) {
                this.topPositionDragPanel = Math.abs(
                    inputOffset.top - cardHeight
                );
            }
            this.titleDragPanel = this.$t('common.search_data');
            this.titleDragPanelIcon = 'mdi-file-search';
            this.dragPopupType = 'inputFilter';
            this.$refs.inputFilter.setControlTitle(e.control.title);
            this.$refs.inputFilter.setControlName(e.controlName);
            this.runInputFilterFormulas(e.controlName);
            this.$refs.symDragPanel.show();
            this.$refs.inputFilter.setFormulas(e.formulas);
        });
        /**
         * Sự kiện thêm dòng group khi click vào nút add trong table group không công thức
         */
        this.$evtBus.$on('document-submit-add-group-row-no-formulas', (e) => {
            const self = this;
            let controlIns = getControlInstanceFromStore(
                self.keyInstance,
                e.controlName
            );
            let tableControl = getControlInstanceFromStore(
                self.keyInstance,
                controlIns.inTable
            );
            if (e.params.node.group) {
                // dòng mẹ
                let currentGroup = e.params.node.field;
                tableControl.tableInstance.addRowGroupParent(
                    e.params,
                    currentGroup,
                    '',
                    false
                );
            }
        });
        /**
         * Sự kiện gọi input filter khi click vào nút add thêm row group trong table group có công thức
         */
        this.$evtBus.$on('document-submit-add-group-row-has-formulas', (e) => {
            if (this._inactive == true) return;
            this.leftPositionDragPanel = 800;
            this.topPositionDragPanel = 200;
            this.titleDragPanel = this.$t('v2.doc.addRowAtSameLevel');
            this.titleDragPanelIcon = 'mdi-file-search';
            this.dragPopupType = 'inputFilter';
            let formulasAutocomplete =
                this.sDocumentSubmit.listInputInDocument[e.controlName]
                    .controlFormulas.autocomplete;
            if (formulasAutocomplete) {
                this.sDocumentSubmit.listInputInDocument[
                    e.controlName
                ].controlFormulas.list = formulasAutocomplete;
                this.$refs.inputFilter.setControlName(e.controlName);
                this.$set(
                    this.sDocumentSubmit.listInputInDocument[e.controlName],
                    'isInputFilter',
                    true
                );
                this.$set(
                    this.sDocumentSubmit.listInputInDocument[e.controlName],
                    'row',
                    e.params
                );
                this.runInputFilterFormulas(e.controlName);
                this.$refs.symDragPanel.show();
                let formulas = {};
                Object.keys(this.sDocumentSubmit.listInputInDocument).map(
                    (control) => {
                        if (e.controlName == control) {
                            formulas =
                                this.sDocumentSubmit.listInputInDocument[
                                    control
                                ].controlFormulas.autocomplete;
                        }
                    }
                );
                this.$refs.inputFilter.setFormulas(formulas);
            }
        });
        // hàm nhận sự thay đổi của input autocomplete gọi api để chạy công thức lấy dữ liệu
        this.$evtBus.$on('document-submit-autocomplete-key-event', (e) => {
            if (thisCpn._inactive == true) return;
            try {
                if (
                    (e.e.keyCode >= 96 && e.e.keyCode <= 105) ||
                    (e.e.keyCode >= 48 && e.e.keyCode <= 57) ||
                    (e.e.keyCode >= 65 && e.e.keyCode <= 90) ||
                    [189, 8, 32, 231].includes(e.e.keyCode)
                ) {
                    // nếu key code là các kí tự chữ và số hợp lệ
                    let controlIns = getControlInstanceFromStore(
                        thisCpn.keyInstance,
                        e.controlName
                    );
                    if (!thisCpn.$refs.autocompleteInput.isShow()) {
                        thisCpn.$refs.autocompleteInput.setTypeInput(
                            'autocomplete'
                        );
                        thisCpn.$refs.autocompleteInput.setControlValueKey(
                            controlIns.getAutocompleteKeyValue()
                        );
                        thisCpn.$refs.autocompleteInput.show(
                            e.e,
                            e.controlName
                        );
                    }
                    thisCpn.$refs.autocompleteInput.showLoadding();
                    thisCpn.getDataForAutocomplete(
                        e,
                        'autocomplete',
                        '',
                        controlIns
                    );
                } else if (
                    (e.e.keyCode < 37 || e.e.keyCode > 40) &&
                    e.e.keyCode != 16
                ) {
                    thisCpn.$refs.autocompleteInput.hide();
                }
            } catch (error) {
                console.warn(error);
            }
        });
        // sự kiện ném ra khi gõ vào control department
        // một số key code gõ vào thì ko mở hoặc phải đóng đi

        this.$evtBus.$on('document-submit-department-click', (e) => {
            if (this._inactive == true) return;
            if (e.control) {
                thisCpn.departmentControl.controlName = '';
                let controlInstance = e.control;
                let groupSelected = -1;
                let listFormulas =
                    e.control.controlFormulas.groupDpm.configData;
                let checkEmptyAllFormulasGroup =
                    controlInstance.controlFormulas.groupDpm.configData.every(
                        (f) => !f.instance
                    );
                if (checkEmptyAllFormulasGroup) {
                    groupSelected = 0;
                }

                if (groupSelected >= 0) {
                    thisCpn.departmentControl.idOrgchart =
                        listFormulas[groupSelected].orgchart.value;
                    thisCpn.departmentControl.selectMultiple =
                        listFormulas[groupSelected].selectMultiple.value;
                    thisCpn.departmentControl.level =
                        listFormulas[groupSelected].level.value;
                    thisCpn.departmentControl.controlName =
                        e.control.controlProperties.name.value;
                    if (listFormulas[groupSelected].conditionControls) {
                        thisCpn.departmentControl.conditionControls =
                            this.getValueConditionControlDepartment(
                                listFormulas[groupSelected].conditionControls
                                    .value
                            );
                    }

                    // trường hợp
                    let selectedValue = [];
                    if (e.control.selectedId) {
                        selectedValue = e.control.selectedId.split(',');
                    }
                    if (e.control.inTable != false) {
                        if (e.params.value) {
                            thisCpn.departmentControl.selectedItems =
                                e.params.value.split(',');
                        } else {
                            thisCpn.departmentControl.selectedItems = [];
                        }
                        //
                    } else {
                        if (e.control.value) {
                            thisCpn.departmentControl.selectedItems =
                                selectedValue;
                        } else {
                            thisCpn.departmentControl.selectedItems = [];
                        }
                    }
                    this.$refs.orgchartSelector.show();
                } else {
                    listFormulas.map((f, fIdx) => {
                        if (f.instance) {
                            delete f.formula.result
                            this.handlerBeforeRunFormulasValue(
                                listFormulas[fIdx].instance,
                                e.control.name,
                                'department',
                                false
                            );
                        }
                    });
                }
            }
        });
        this.$evtBus.$on('document-submit-department-key-event', (e) => {
            if (this._inactive == true) return;
            try {
                if (
                    (e.e.keyCode >= 97 && e.e.keyCode <= 105) ||
                    (e.e.keyCode >= 48 && e.e.keyCode <= 57) ||
                    (e.e.keyCode >= 65 && e.e.keyCode <= 90) ||
                    [189, 16, 8, 32, 231].includes(e.e.keyCode)
                ) {
                    // nếu key code là các kí tự chữ và số hợp lệ
                    if (!this.$refs.autocompleteInput.isShow()) {
                        let controlIns = getControlInstanceFromStore(
                            thisCpn.keyInstance,
                            e.controlName
                        );
                        thisCpn.$refs.autocompleteInput.setControlValueKey(
                            controlIns.getAutocompleteKeyValue()
                        );
                        this.$refs.autocompleteInput.show(e.e, e.controlName);
                    }
                    this.getDataOrgchart(e);
                } else if (e.e.keyCode < 37 || e.e.keyCode > 40) {
                    this.$refs.autocompleteInput.hide();
                }
            } catch (error) {
                console.log('errorerrorerror', error);
            }
        });
        // hàm nhận sự thay đổi của input select gọi api để chạy công thức lấy dữ liệu
        this.$evtBus.$on('document-submit-select-input', (e) => {
            if (this._inactive == true) return;
            try {
                if (e.e.key == 'Tab' && this.$refs.autocompleteInput) {
                    this.$refs.autocompleteInput.hide();
                    return;
                }
                let controlName = e.controlName;
                let controlIns = getControlInstanceFromStore(
                    this.keyInstance,
                    controlName
                );
                let isSetEvent = true;
                if (e.fromIcon && controlIns.inTable != false) {
                    isSetEvent = false;
                }
                this.$refs.autocompleteInput.show(e.e, controlName, isSetEvent);
                if (e.fromIcon && controlIns.inTable != false) {
                    let tableIns = getControlInstanceFromStore(
                        this.keyInstance,
                        controlIns.inTable
                    );
                    let cellForcus = tableIns.tableInstance.getFocusedCell();
                    tableIns.tableInstance.startEditingCell({
                        rowIndex: cellForcus.rowIndex,
                        colKey: controlName
                    });
                    let cellEditting = $(
                        '#sym-submit-' +
                            this.keyInstance +
                            ' .ag-input-field-input.ag-text-field-input'
                    );
                    this.$refs.autocompleteInput.setCurrentInput(
                        cellEditting[0]
                    );
                    this.$refs.autocompleteInput.setEvent();
                }
                this.$refs.autocompleteInput.setCurrentValue(e.currentValue);
                if (e.rowNodeId) {
                    this.$refs.autocompleteInput.oldControlForcusing = null;
                }
                this.$refs.autocompleteInput.setTypeInput(e.type);
                this.$refs.autocompleteInput.setControlValueKey(
                    controlIns.getAutocompleteKeyValue()
                );
                if (e.type == 'combobox') {
                    this.$refs.autocompleteInput.setSingleSelectCombobox(
                        e.isSingleSelect
                    );
                }
                this.getDataForAutocomplete(
                    e,
                    controlIns.type,
                    controlName,
                    controlIns
                );
            } catch (error) {
                console.log('errorerrorerror', error);
            }
        });
        this.$evtBus.$on(
            'document-submit-filter-input-card-click-show-detail',
            (e) => {
                if (this._inactive == true) return;
                let inputFilter =
                    this.sDocumentSubmit.listInputInDocument[e.controlName];
                if (
                    inputFilter.inputFiltersDetail &&
                    inputFilter.inputFiltersDetail.length > 0
                ) {
                    (this.listCards.listSelected =
                        inputFilter.inputFiltersDetail),
                        (this.listCards.controlName = e.controlName);
                    this.listTitleInputFilter =
                        inputFilter.listTitleInputFilter;
                } else {
                    let listSelected = [];
                    let oldValue = inputFilter.inputValue
                        ? inputFilter.inputValue
                        : inputFilter.oldValue;
                    if (oldValue != '') {
                        oldValue.split(',').map((val) => {
                            let selectedValue = {};
                            selectedValue[e.controlName] = val.substring(
                                1,
                                val.length - 1
                            );
                            listSelected.push(selectedValue);
                        });
                    }
                    this.listCards.listSelected = listSelected;
                    this.listCards.controlName = e.controlName;
                }
                thisCpn.$refs.inputFilterListCard.show(e);
            }
        );

        // click outside
        this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
            if (evt == undefined) {
                return;
            }
            if (thisCpn._inactive == true) return;
            let currentTable = '';
            if ($(evt.target).closest('.wrap-table').length > 0) {
                currentTable = $(evt.target)
                    .closest('.wrap-table')
                    .children()
                    .first();
                currentTable = currentTable.attr('table-name');
            }
            else if (
                !$(evt.target).is('.ag-input-field-input-text') &&
                !$(evt.target).is('.ag-cell-autocomplete') &&
                $(evt.target).closest('.card-datetime-picker').length == 0 &&
                $(evt.target).closest('.symper-drag-panel').length == 0 &&
                !$(evt.target).is('span.select-chervon-bottom') &&
                !$(evt.target).is('span.mdi.mdi-calendar')
            ) {
                this.clearForcusTable(currentTable);
                this.$store.commit('document/addToDocumentSubmitStore', {
                    key: 'tableInteractive',
                    value: false,
                    instance: thisCpn.keyInstance
                });
            }
            if (
                thisCpn.$refs.autocompleteInput &&
                !$(evt.target).is('.s-control-select') &&
                !$(evt.target).is('.s-control-combobox') &&
                !$(evt.target).is('.select-chervon-bottom') &&
                $(evt.target).closest('.card-autocomplete').length == 0
            ) {
                thisCpn.$refs.autocompleteInput.hide();
            }
            if (
                $(evt.target).closest('.upload-file-wrapper-outtb').length == 0
            ) {
                $('.upload-file-wrapper-outtb.d-flex.align-center').css({
                    'border-width': '1px',
                    border: '1px dashed lightgrey'
                });
                $('.list-file').css('background', 'white');
                $('.file-item').css('background', 'unset');
                $('.dropdown-content').removeClass('show-upload-dropdown');
            }
            if (
                thisCpn.$refs.inputFilterListCard &&
                !$(evt.target).is('.card-input-filter') &&
                $(evt.target).closest('.input-filter-card-detail').length == 0
            ) {
                thisCpn.$refs.inputFilterListCard.currenFocusIdx = -1;
                thisCpn.$refs.inputFilterListCard.hide();
            }
            if (
                thisCpn.$refs.datePicker &&
                !$(evt.target).hasClass('s-control-date') &&
                !$(evt.target).hasClass('s-control-time') &&
                !$(evt.target).hasClass('s-control-datetime') &&
                !$(evt.target).hasClass('mdi-calendar') &&
                !$(evt.target).is(
                    'span.mdi.mdi-clock-time-two-outline.time-icon'
                ) &&
                $(evt.target).closest('.v-list-item').length == 0 &&
                $(evt.target).closest('.card-datetime-picker').length == 0
            ) {
                thisCpn.$refs.datePicker.closePicker();
            }

            if (
                thisCpn.$refs.validate &&
                !$(evt.target).hasClass('validate-icon-cell') &&
                !$(evt.target).hasClass('validate-icon') &&
                !$(evt.target).hasClass('card-validate') &&
                $(evt.target).closest('.card-validate').length == 0
            ) {
                thisCpn.$refs.validate.hide();
            }
            if (
                !$(evt.target).hasClass('s-floatting-popup') &&
                thisCpn.$refs.floattingPopup &&
                $(evt.target).closest('.s-floatting-popup').length == 0
            ) {
                thisCpn.$refs.floattingPopup.hide();
            }
            if (
                !$(evt.target).hasClass('s-control-filter') &&
                !$(evt.target).hasClass('mdi-filter-plus-outline') &&
                thisCpn.$refs.symDragPanel &&
                $(evt.target).closest('.mdi.mdi-plus').length == 0 &&
                $(evt.target).closest('.symper-drag-panel').length == 0 &&
                $(evt.target).closest('.ag-menu-option-part').length == 0 &&
                $(evt.target).closest('.upload-table-list-image').length == 0
            ) {
                thisCpn.$refs.symDragPanel.hide();
            }
            if ($(evt.target).hasClass('icon-link-control')) {
                if($(evt.target).attr('control-in-table')){
                    this.focusingControlName = $(evt.target)
                    .closest('.info-control-btn')
                    .attr('data-control');
                    var rowObjectLink = $(evt.target)
                        .closest('.info-control-btn')
                        .attr('object_id');
                    this.linkTitle = $(evt.target)
                        .closest('.info-control-btn')
                        .attr('link-title');
                }
                else {
                    this.focusingControlName = $(evt.target)
                    .closest('.control-link-button').siblings()
                    .attr('data-control');
                    var rowObjectLink = $(evt.target)
                        .closest('.control-link-button').siblings()
                        .attr('object_id');
                    this.linkTitle = $(evt.target)
                        .closest('.control-link-button').siblings()
                        .attr('link-title');
                }
                let objId = rowObjectLink;
                if (objId) {
                    evt.curTarget = evt.target;
                    this.isShowFormLink = false;
                    this.docLinkObjInfo = {
                        docObjId: objId,
                        docSize: '21cm'
                    };
                    setTimeout(() => {
                        thisCpn.isShowFormLink = true;
                    }, 0);
                }
            }
            if(currentTable){
                $('#sym-submit-' + this.keyInstance).find('.more-action-table').not('[table-name='+currentTable+']').removeClass('d-block')
            }else {
                $('#sym-submit-' + this.keyInstance).find('.more-action-table.d-block').removeClass('d-block')
            }
        });
        this.$evtBus.$on('document-submit-show-matching-item', (data) => {
            if (thisCpn._inactive == true) return;
            data.control = getControlInstanceFromStore(
                this.keyInstance,
                data.tableName
            );
            this.tableFocusing = data.tableName;
            this.showMatchingItems = true;
            let rowDataTable = data.control.tableInstance.getAllData();
            this.matchingItemRowData = rowDataTable;
            if (this.$refs.matchingItems) {
                this.$refs.matchingItems.setDataFromDoc(
                    this.matchingItemRowData
                );
            }
            thisCpn.matchingItemOfCurrentTable = this.customDataMatchingItems(
                thisCpn.matchingItemsAllTables[data.tableName],
                data.control.id
            );
        });
        /**
         * Sự kiện bắn ra khi ấn f2 vào 1 control để trace formulas
         */
        this.$evtBus.$on('document-submit-show-trace-control', (data) => {
            if (!data.isTable) {
                data.control.renderCurrentTraceControlColor();
            } else {
                data.control = getControlInstanceFromStore(
                    this.keyInstance,
                    data.tableName
                );
            }
            thisCpn.controlTrace = data.control.name;
            let controlFormulas = data.control.controlFormulas;
            thisCpn.listFormulasTrace = controlFormulas;
            thisCpn.isShowTraceControlSidebar = true;
            thisCpn.drawer = true;
        });
        this.$evtBus.$on('document-get-location', async (data) => {
            thisCpn.getLocation([data]);
        });
        this.$evtBus.$on('document-get-location-automatically', async (data) => {
            this.listControlLocationGetDataAutomatic.push(data)
            thisCpn.getLocation(this.listControlLocationGetDataAutomatic);
        });
        // click vào button chạy công thức thủ công control
        this.$evtBus.$on('document-submit-run-formula-manually-control-click', (data) => {
            if (thisCpn._inactive == true) return;
            thisCpn.runFormulaManuallyControl(data.controlName);
        });
        // check và chạy tiếp các control root khi user click chạy thủ công tất cả công thức
        this.$evtBus.$on('document-submit-continue-run-formulas-control-manually', () => {
            if (thisCpn._inactive == true) return;
            thisCpn.runAllFormulaManually();
        });
        // Xử lý sau khi chạy thủ công công thức 1 control
        this.$evtBus.$on('document-submit-finish-run-formulas-control-manually', (controlName) => {
            if (thisCpn._inactive == true) return;
            thisCpn.afterRunFormulasControlManually(controlName);
        });
    },
    watch: {
        isCloneType() {
            if (this.isCloneType) {
                this.docObjId = this.$route.params.id;
                this.$store.commit('document/changeViewType', {
                    key: this.keyInstance,
                    value: 'update'
                });
            }
        },
        docId(after) {
            this.documentId = after;
        },
        workflowVariable: {
            deep: true,
            immediate: true,
            handler: function (after, before) {
                this.setWorkflowVariable(after);
            }
        },
        documentObjectId(after) {
            this.docObjId = after;
        },
        $route(to) {
            this.$refs.symDragPanel.hide();
        },
        'sDocumentSubmit.readySubmit': function (data) {
            if (data == true) {
                if (this.viewType == 'submit' || this.isCloneType) {
                    this.submitDocument();
                } else {
                    this.updateDocumentObject();
                }
            }
        },
        'sDocumentSubmit.readyLoaded': function (data) {
            if (data == true) {
                this.$store.commit('document/addToDocumentSubmitStore', {
                    key: 'docStatus',
                    value: 'input',
                    instance: this.keyInstance
                });
                setTimeout(() => {
                    this.setTimeWhenCreateTaskInScheduler();       
                });
            }
        },
        drawer(after) {
            if (this.isShowTraceControlSidebar && after == false) {
                this.$refs.traceControlView.removeTrace();
                this.$refs.traceControlView.removeCurrentControlTrace();
                this.isShowTraceControlSidebar = false
            }
        },
        dataPreview: {
            immediate: true,
            deep: true,
            handler: function (vl) {
                if (Object.keys(vl) == 0) {
                    return;
                }
                this.contentDocument = vl.content;
                this.controlRelationWorker.postMessage({
                    action: 'setDataForPropsControl',
                    data: {
                        fields: vl.fields,
                        viewType: this.viewType,
                        allDataDetail: this.sDocumentDetail.allData
                    }
                });
            }
        },
        overridePropertiesControls: {
            immediate: true,
            deep: true,
            handler: function (vl) {
                if (Object.keys(vl).length > 0) {
                    this.checkValidateOverrideControls();
                    this.runFormulasOverrideControls();
                }
            }
        }
    },

    methods: {
        multilinguePropertiesControl(control, controlType){
            for(let p in control.properties){
                control.properties[p].title = this.$t(control.properties[p].title)
            }
            for(let f in control.formulas){
                control.formulas[f].title = this.$t(control.formulas[f].title)
            }
            return control
        },
        setNewValueWhenDragCardKanban(controlName, value){
            this.handleInputChangeBySystem(controlName, value);
        },
        getLocation(data) {
            if (navigator.geolocation) {
                this.currentControl = data;
                navigator.geolocation.getCurrentPosition(this.setLocation);
            } else {
                alert('Geolocation is not supported by this browser.');
            }
        },
        setValueCellTable(controlIns, value) {
            let tableControl = getControlInstanceFromStore(
                this.keyInstance,
                controlIns.inTable
            );
            let currentCell = tableControl.tableInstance.getFocusedCell();
            if(currentCell && tableControl.tableInstance.getCellRanges().length > 0){
                let currentRow = tableControl.tableInstance.getDisplayedRowAtIndex(
                    currentCell.rowIndex
                );
                tableControl.tableInstance.setDataAtCell(
                    currentCell.column.colDef.field,
                    value,
                    currentRow.id
                );
                tableControl.tableInstance.setFocusedCell(
                    currentCell.rowIndex,
                    currentCell.column.colDef.field
                );
            }else {// lấy location tự động -> set value column
                tableControl.tableInstance.setValueColumns(
                    controlIns.name,
                    value
                );
            }
        },
        setLocationForTable(control) {
            if (
                control.checkPropsValue(
                    'typeGetLocation',
                    'automatically'
                )
            ) {
                let tableControl = getControlInstanceFromStore(
                    this.keyInstance,
                    control.inTable
                );
                tableControl.tableInstance.setValueColumns(
                    control.name,
                    JSON.stringify(this.location)
                );
            } else {
                this.setValueCellTable(
                    control,
                    JSON.stringify(this.location)
                );
            }
        },
        async setLocation(position) {
            this.currentControl.map(control =>{
                if (
                    control.controlProperties.inputValueLocation
                        .value == 'coordinates'
                ) {
                    this.location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        address: ''
                    };
                    if (control.inTable) {
                        this.setLocationForTable(control);
                    } else {
                        control.setLocation(this.location);
                    }
                } else {
                    this.getAddressFromLocation(
                        position.coords.latitude.toString(),
                        position.coords.longitude.toString(),
                        control
                    );
                }
            })
            this.listControlLocationGetDataAutomatic = []
        },
        async getAddressFromLocation(latitude, longitude, control) {
            let res = await locationApi.getAddressFromLocation({
                latitude: latitude,
                longitude: longitude
            });
            if (res) {
                let postcode = res.address.postcode;
                if (postcode)
                    res.display_name = res.display_name.replace(
                        postcode + ', ',
                        ''
                    );
                this.location = {
                    lat: latitude,
                    lng: longitude,
                    address: res.display_name
                };
                if (control.inTable) {
                    this.setLocationForTable(control);
                } else {
                    control.setLocation(this.location);
                }
            }
        },
        getValueConditionControlDepartment(value) {
            let newValue = [];
            value.map((val) => {
                if (val == 'current_user_id') {
                    let currentUserId = this.$store.state.app.endUserInfo.id;
                    newValue.push(currentUserId);
                } else {
                    if (this.sDocumentEditor.allControl[val]) {
                        let controlName =
                            this.sDocumentEditor.allControl[val].properties.name
                                .value;
                        let controlIns = getControlInstanceFromStore(
                            this.keyInstance,
                            controlName
                        );
                        newValue.push(controlIns.value);
                    } else {
                        // trong table nào đó
                    }
                }
            });
            return newValue;
        },
        getValueConditionControlDepartment(value) {
            let newValue = [];
            if (value == 'current_user_id') {
                let currentUserId = this.$store.state.app.endUserInfo.id;
                newValue.push(currentUserId);
            } else {
                if (this.sDocumentEditor.allControl[value]) {
                    let controlName =
                        this.sDocumentEditor.allControl[value].properties.name
                            .value;
                    let controlIns = getControlInstanceFromStore(
                        this.keyInstance,
                        controlName
                    );
                    newValue.push(controlIns.value);
                }
            }
            return newValue;
        },
        getNewRowValueAfterSetMatchingItem(currentRow, matchingItemRow) {
            Object.keys(matchingItemRow).map((field) => {
                if (
                    currentRow[field] != undefined &&
                    field != 's_table_id_sql_lite'
                ) {
                    currentRow[field] = matchingItemRow[field];
                }
            });
            return currentRow;
        },
        saveMatchingItems() {
            let currentTableData = {};
            this.matchingItemRowData.map((row) => {
                currentTableData[row.s_table_id_sql_lite] = row;
            });
            let tableControl = getControlInstanceFromStore(
                this.keyInstance,
                this.tableFocusing
            );
            let matchingItemRowData =
                this.$refs.matchingItems.getDataResultTable();
            let tableRow = [];
            matchingItemRowData.map((matchingRow) => {
                if (matchingRow.s_table_id_sql_lite == undefined) {
                    let rowDefaultData =
                        tableControl.tableInstance.getRowDefaultData()[0];
                    let newRow = this.getNewRowValueAfterSetMatchingItem(
                        rowDefaultData,
                        matchingRow
                    );
                    tableRow.push(newRow);
                } else {
                    let newRow = this.getNewRowValueAfterSetMatchingItem(
                        currentTableData[matchingRow.s_table_id_sql_lite],
                        matchingRow
                    );
                    tableRow.push(newRow);
                }
            });

            this.showMatchingItems = false;
            this.$refs.headerForm.close();
            tableControl.tableInstance.setData(tableRow, false);
        },
        customDataMatchingItems(data, tableId) {
            Object.keys(data.sourceTables).map((tb, tbIdx) => {
                data.sourceTables[tb].col.map((field, fieldId) => {
                    data.sourceTables[tb].col[fieldId].field = field.name;
                });
                data.sourceTables[tb].formula = data.sourceTables[
                    tb
                ].formula.replace(/(REF|ref)\s*\(/g, '');
                if (
                    data.sourceTables[tb].formula[
                        data.sourceTables[tb].formula.length - 1
                    ] == ')'
                ) {
                    data.sourceTables[tb].formula = data.sourceTables[
                        tb
                    ].formula.substring(
                        0,
                        data.sourceTables[tb].formula.length - 1
                    );
                }
            });
            let controlInTable =
                this.sDocumentEditor.allControl[tableId].listFields;
            data.targetAndResultTable.col.map((col, colId) => {
                if (col.controlMappingId) {
                    data.targetAndResultTable.col[colId].controlMappingTitle =
                        controlInTable[
                            col.controlMappingId
                        ].properties.title.value;
                    data.targetAndResultTable.col[colId].controlMapping =
                        controlInTable[
                            col.controlMappingId
                        ].properties.name.value;
                }
            });
            return data;
        },
        setDataForDepartment(control, controlName, inTable = false) {
            let otherInfo = this.objectOtherInfo.departmentData;
            if (otherInfo && otherInfo[controlName]) {
                if (inTable) {
                    control.mapData = otherInfo[controlName];
                } else {
                    control.selectedId = control.value;
                    control.setValue(otherInfo[controlName]);
                }
                this.departmentControl.mapData = otherInfo;
            }
        },
        /**
         * Xử lý lấy role name cho control department sau khi chạy xong công thức formulas
         */
        getRoleNameForControlDepartment(control, roleId){
            if(!this.departmentControl.idOrgchart){
                let groupSelected = -1;
                let listFormulas =
                    control.controlFormulas.groupDpm.configData;
                let checkEmptyAllFormulasGroup =
                    control.controlFormulas.groupDpm.configData.every(
                        (f) => !f.instance
                    );
                if (checkEmptyAllFormulasGroup) {
                    groupSelected = 0;
                }

                if (groupSelected >= 0) {
                    this.departmentControl.idOrgchart =
                        listFormulas[groupSelected].orgchart.value;
                    this.departmentControl.selectMultiple =
                        listFormulas[groupSelected].selectMultiple.value;
                    this.departmentControl.level =
                        listFormulas[groupSelected].level.value;
                    this.departmentControl.controlName =
                        control.controlProperties.name.value;
                    if (listFormulas[groupSelected].conditionControls) {
                        this.departmentControl.conditionControls =
                            this.getValueConditionControlDepartment(
                                listFormulas[groupSelected].conditionControls
                                    .value
                            );
                    }
                }
            }
            if(this.departmentControl.level == 'position'){
                roleId = this.departmentControl.idOrgchart + ':' + this.departmentControl.level + ':' + roleId
                documentServiceApi.getInforOrgchart(roleId).then((res) => {
                    if (res.status == 200 && res.data) {
                        control.selectedId = roleId;
                        control.setValue(res.data);
                    } 
                })
                .catch((err) => {
                    console.log(err);
                })
            }
        },
        handleAfterRunGroupDepartment(res, controlInstance) {
            let formulas = res.formulas;
            let checkCountRunFormulas = 0;
            let countFormula = Object.keys(
                controlInstance.controlFormulas.groupDpm.configData
            ).length;
            controlInstance.controlFormulas.groupDpm.configData.map(
                (f, fIdx) => {
                    if (f.formula.value == formulas) {
                        controlInstance.controlFormulas.groupDpm.configData[
                            fIdx
                        ].formula.result = res.data[0].values[0][0];
                    }
                    if (!f.instance || f.formula.hasOwnProperty("result")) {
                        checkCountRunFormulas = checkCountRunFormulas + 1;
                    }
                }
            );
            if (checkCountRunFormulas == countFormula) {
                this.openDepartmenPopup(controlInstance);
            }
        },
        openDepartmenPopup(controlInstance) {
            let config = controlInstance.controlFormulas.groupDpm.configData;
            let selectedGroup = this.handleGetSelectedFormulas(controlInstance);
            if (selectedGroup >= 0) {
                this.departmentControl.controlName = '';
                this.departmentControl.idOrgchart =
                    config[selectedGroup].orgchart.value;
                this.departmentControl.selectMultiple =
                    config[selectedGroup].selectMultiple.value;
                this.departmentControl.level =
                    config[selectedGroup].level.value;

                this.departmentControl.controlName =
                    controlInstance.controlProperties.name.value;
                let selectedValue = [];
                if (controlInstance.selectedId) {
                    selectedValue = controlInstance.selectedId.split(',');
                }
                if (controlInstance.inTable != false) {
                    let controlName =
                        controlInstance.controlProperties.name.value;
                    let tableControl = getControlInstanceFromStore(
                        this.keyInstance,
                        controlInstance.inTable
                    );
                    let currentCell =
                        tableControl.tableInstance.getFocusedCell();
                    let currentRow =
                        tableControl.tableInstance.getDisplayedRowAtIndex(
                            currentCell.rowIndex
                        );
                    let value = currentRow.data[controlName];
                    if (value) {
                        this.departmentControl.selectedItems = value.split(',');
                    } else {
                        this.departmentControl.selectedItems = [];
                    }
                    //
                } else {
                    if (config[selectedGroup].conditionControls) {
                        this.departmentControl.conditionControls =
                            this.getValueConditionControlDepartment(
                                config[selectedGroup].conditionControls.value
                            );
                    }
                    if (controlInstance.value) {
                        this.departmentControl.selectedItems = selectedValue;
                    } else {
                        this.departmentControl.selectedItems = [];
                    }
                }
                this.$refs.orgchartSelector.show();
            }
        },
        handleGetSelectedFormulas(controlInstance) {
            let selectedIndex = -1;
            let positionEmptyFormulas = -1;
            let positionHasFormulasTrue = -1;
            let config = controlInstance.controlFormulas.groupDpm.configData;
            for (let i = 0; i < config.length; i++) {
                if (!config[i].instance) {
                    positionEmptyFormulas = i;
                    break;
                } else {
                    if (
                        config[i].formula.result &&
                        (config[i].formula.result == true ||
                        config[i].formula.result.toLowerCase() == 'true'||
                        config[i].formula.result == 1)
                    ) {
                        positionHasFormulasTrue = i;
                        break;
                    }
                }
            }
            if (positionEmptyFormulas > positionHasFormulasTrue) {
                if (positionHasFormulasTrue > -1) {
                    selectedIndex = positionHasFormulasTrue;
                } else {
                    selectedIndex = positionEmptyFormulas;
                }
            } else {
                if (positionEmptyFormulas > -1) {
                    selectedIndex = positionEmptyFormulas;
                } else {
                    selectedIndex = positionHasFormulasTrue;
                }
            }
            return selectedIndex;
        },
        saveDepartment(data) {
            let controlIns = getControlInstanceFromStore(
                this.keyInstance,
                this.departmentControl.controlName
            );
            let selectedId = [];
            let selectedValue = [];
            data.map((d) => {
                if (d.id) {
                    selectedId.push(d.id);
                }
                if (d.code) {
                    selectedId.push(d.code);
                }
                selectedValue.push(d.name);
            });
            controlIns.selectedId = selectedId.join(',');

            if (controlIns.inTable != false) {
                if (!controlIns.mapData) {
                    controlIns.mapData = {};
                    controlIns.mapData[selectedId] = selectedValue.join(',');
                } else {
                    controlIns.mapData[selectedId] = selectedValue.join(',');
                }
                let tableControl = getControlInstanceFromStore(
                    this.keyInstance,
                    controlIns.inTable
                );
                let currentCell = tableControl.tableInstance.getFocusedCell();
                let currentRow =
                    tableControl.tableInstance.getDisplayedRowAtIndex(
                        currentCell.rowIndex
                    );
                tableControl.tableInstance.setDataAtCell(
                    currentCell.column.colDef.field,
                    selectedId.join(','),
                    currentRow.id
                );
                tableControl.tableInstance.setFocusedCell(
                    currentCell.rowIndex,
                    currentCell.column.colDef.field
                );
                this.departmentControl.mapData[
                    this.departmentControl.controlName
                ] = controlIns.mapData;
            } else {
                controlIns.setValueControlDepartment(
                    selectedId,
                    selectedValue.join(',')
                );
                this.departmentControl.mapData[
                    this.departmentControl.controlName
                ] = selectedValue.join(',');
            }
            this.handleControlInputChange(controlIns);
        },
        focusToComment() {
            let loopCheckLoadComment = setInterval(() => {
                if (!this.$refs.preLoaderView.isShow) {
                    clearInterval(loopCheckLoadComment);
                    document
                        .querySelector('.content-comment')
                        .scrollIntoView(true);
                }
            }, 2000);
        },
        previewPictureComment(obj) {
            if (obj.arrayFile.length > 0) {
                this.listImage = obj.arrayFile;
                this.$refs.lightbox.showDialog = true;
                this.$refs.lightbox.showImage(obj.index);
            }
        },
        symperDialogDisprove() {
            this.$emit('confirm-delete-row');
            if (this.symperDialogType == 'emptyRow') {
                this.disproveDeleteRow();
            }
        },
        symperDialogCancel() {
            this.$emit('cancel-delete-blank-row');
            this.hideSymperDialog();
        },
        symperDialogConfirm() {
            this.$emit('confirm-delete-row');
            if (this.symperDialogType == 'emptyRow') {
                this.deleteEmptyRow();
            } else if (this.symperDialogType == 'canNotDeleteRow') {
                this.isShowSymperDialog = false;
            } else if (this.symperDialogType == 'sortAndFilterTable') {
                this.removeSortAndFilterTable();
                this.isShowSymperDialog = false;
            }
        },
        /**
         * Hoangnd: Xử lý bỏ sort và filter trong table trước khi thêm dòng
         */
        removeSortAndFilterTable() {
            let tableName = this.sDocumentSubmit.tableInteractive;
            let tableIns = getControlInstanceFromStore(
                this.keyInstance,
                tableName
            );
            tableIns.tableInstance.clearSortAndFilter();
        },
        focusCurrentFile(file) {
            $('#' + file.control.id)
                .find('.file-item')
                .css('background', 'none');
            //    $('#'+file.control.id).find('.file-item').index(file.selectedImage).css('background','lightgrey')
        },
        deleteAllCardItem(card) {
            let control = getControlInstanceFromStore(
                this.keyInstance,
                card.controlName
            );
            control.setValue('');
            this.handleInputChangeBySystem(card.controlName, '');
        },
        deleteCardItem(card) {
            let control = getControlInstanceFromStore(
                this.keyInstance,
                card.controlName
            );
            let newValue = [];
            if (card.value.length > 0) {
                card.value.map((value) => {
                    newValue.push("'" + value[card.controlName] + "'");
                });
                this.$refs.inputFilter.listUnselected = newValue;
                newValue = newValue.join(',');
            } else {
                // trường hợp xóa hết
                newValue.push('');
                this.$refs.inputFilter.listUnselected = newValue;
                newValue = [];
            }
            control.setValue(newValue);
            control.value = newValue;
            this.handleInputChangeBySystem(card.controlName, newValue);
        },
        closeQuickSubmit() {
            this.$emit('close-quick-submit');
        },
        // hoàn thành upload trong table
        removeProgress(file) {
            let controlId = file.control.id;
            if (file.control != '' && file.control.inTable != false) {
                let fileUpload = {
                    id: file.data.id,
                    name: file.data.name,
                    type: file.data.type,
                    serverPath: file.data.serverPath,
                    size: file.data.size,
                    userCreated: file.data.userCreated
                };
                let tableControl = getControlInstanceFromStore(
                    this.keyInstance,
                    file.control.inTable
                );
                let currentCell = file.control.focusCell;
                let currentRow =
                    tableControl.tableInstance.getDisplayedRowAtIndex(
                        currentCell.rowIndex
                    );
                let currentData = currentRow.data[file.control.name];
                currentData = currentData ? JSON.parse(currentData) : null;
                if (!currentData) {
                    currentData = [];
                }
                let newData = [];
                currentData.map((curData) => {
                    if (curData.name != fileUpload.name) {
                        newData.push(curData);
                    }
                });
                newData.push(fileUpload);
                tableControl.tableInstance.setDataAtCell(
                    file.control.name,
                    JSON.stringify(newData),
                    currentRow.id
                );
            } else {
                //update
                let source = file.data.serverPath;
                $('#' + controlId)
                    .find('.upload-progress-loading')
                    .remove();
                $('#' + controlId)
                    .find('.upload-progress-full')
                    .remove();
                $('#' + controlId)
                    .find(`[path='${source}']`)
                    .attr('id-file', file.data.id);
                this.updateIdListUploadFile(file);
            }
        },
        // gán Id sau khi upload file thành công
        updateIdListUploadFile(listFile) {
            let controlName = listFile.control.name;
            let listUpload =
                this.sDocumentSubmit.listInputInDocument[controlName].value;
            if (listUpload && listUpload.length > 0) {
                listUpload.map((file) => {
                    if (listFile.data.name == file.name) {
                        file.id = listFile.data.id;
                    }
                });
            }
            this.$store.commit('document/updateListInputInDocument', {
                controlName: controlName,
                key: 'value',
                value: listUpload,
                instance: this.keyInstance
            });
        },
        // hiển thị phần trăm upload file
        showProgressUpload(file) {
            let controlId = file.control.id;
            let listProgress = file.listProgress;
            if (file.control.inTable != false) {
            } else {
                listProgress.map((progress, i) => {
                    let percent = progress.progress * 100;
                    $('#' + controlId)
                        .find("[file-data='" + progress.name + "']")
                        .removeClass('upload-hidden');
                    $('#' + controlId)
                        .find("[file-data='" + progress.name + "']")
                        .addClass('upload-show');
                    $('#' + controlId)
                        .find("[file-data='" + progress.name + "']")
                        .find('.upload-progress-loading')
                        .css('width', percent + '%');
                });
            }
        },
        // lấy từng dòng theo table
        getAllDataTable(tableName) {
            return getControlInstanceFromStore(
                this.keyInstance,
                tableName
            ).tableInstance.getAllData();
        },
        getKeyControlUpload(configUpload) {
            let name = null;
            configUpload.columnSelected.map((control) => {
                if (control.primary) {
                    name = control.name;
                }
            });
            return name;
        },
        // lấy dữ liệu theo cột khóa chính upload
        getColumnByColumnKeyUpload(data) {
            let columnSelected = [];
            data.columnSelected.map((column) => {
                columnSelected.push(column.name);
            });
            return this.getAllDataTableRowByColumn(
                data.tableName,
                columnSelected
            );
        },
        // lấy cột dữ liệu của control upload hiện tại và control key
        getColumnKeyAndCurrentUpload(data, controlName) {
            let columnSelected = [];
            data.columnSelected.map((column) => {
                columnSelected.push(column.name);
            });
            columnSelected.push(controlName);
            return this.getAllDataTableRowByColumn(
                data.tableName,
                columnSelected
            );
        },
        // lấy các cột được hiển thị trong table
        getAllDataTableRowByColumn(tableName, columnSelected) {
            return getControlInstanceFromStore(
                this.keyInstance,
                tableName
            ).tableInstance.getDataByColumn(columnSelected);
        },
        //lọc dữ liệu table theo trường cần lấy
        filterDataColumnTable(columnName, tableName) {
            let allRow = this.getAllDataTable(tableName);
            let newData = [];
            allRow.map((row) => {
                let listImage =
                    row[columnName] != '' ? JSON.parse(row[columnName]) : '';
                if (listImage.length > 0) {
                    listImage.map((img) => {
                        newData.push(img);
                    });
                }
            });
            return newData;
        },
        getAllControlUpload() {
            let listUpload = [];
            let typeVideo = ['mp4', 'webm', 'flv', 'mov', 'mpg', 'm4v', '3gv'];
            let listInput = this.sDocumentSubmit.listInputInDocument;
            for (let controlName in listInput) {
                let controlIns = listInput[controlName];
                if (controlIns.type == 'fileUpload') {
                    let configTable = [];
                    let listImage = [];
                    let dataTable = { controlName: '', data: [], allData: [] };
                    if (controlIns.inTable) {
                        configTable =
                            typeof controlIns.controlProperties.fileUploadConfig
                                .value != 'object'
                                ? JSON.parse(
                                      controlIns.controlProperties
                                          .fileUploadConfig.value
                                  )
                                : {
                                    tableName: controlIns.inTable,
                                    columnSelected: []
                                };
                        listImage = this.filterDataColumnTable(
                            controlIns.name,
                            controlIns.inTable
                        );
                        dataTable.data =
                            this.getColumnByColumnKeyUpload(configTable);
                        dataTable.controlName = this.getKeyControlUpload(
                            configTable
                        )
                            ? this.getKeyControlUpload(configTable)
                            : controlName;
                        dataTable.allData = this.getColumnKeyAndCurrentUpload(
                            configTable,
                            controlName
                        );
                    } else {
                        if (controlIns.value.length > 0) {
                            //set main Image
                            listImage = controlIns.value.map((img, i) => {
                                let newImg = { ...img };
                                if (typeVideo.includes(img.type)) {
                                    newImg.sources = [
                                        {
                                            src: img.serverPath,
                                            type: 'video/' + img.type
                                        }
                                    ];
                                    newImg.type = 'video';
                                }
                                return newImg;
                            });
                        }
                    }
                    listUpload.push({
                        name: controlIns.name,
                        value: listImage,
                        title: controlIns.title,
                        lastUserUpdate: controlIns.lastUserUpdate,
                        configInTable: configTable,
                        inTable: controlIns.inTable,
                        dataTable: dataTable,
                        created: this.$moment().format('DD/MM/YYYY HH:mm')
                    });
                }
            }
            return listUpload;
        },
        setMainPictureLightBox(imgIdx) {
            let control = this.$refs.previewUploadFile.currentControl.name;
            let tabIdx = this.$refs.previewUploadFile.tab;
            let infoMainImage = {
                control: control,
                imgIdx: imgIdx
            };
            this.setMainPicture(infoMainImage);
            this.$set(
                this.listUploadControl.allControl[tabIdx].value[imgIdx],
                'isMainPicture',
                true
            );
        },
        setMainPicture(data) {
            let listInput = this.sDocumentSubmit.listInputInDocument;
            for (let controlName in listInput) {
                let controlIns = listInput[controlName];
                if (controlIns.type == 'fileUpload') {
                    if (controlIns.value != '') {
                        controlIns.value.map((img) => {
                            if (img.isMainPicture) img.isMainPicture = false;
                        });
                    }
                }
            }
            this.$set(
                this.sDocumentSubmit.listInputInDocument[data.control].value[
                    data.imgIdx
                ],
                'isMainPicture',
                true
            );
        },
        showGallary(list) {
            let typeImage = ['jpg', 'png', 'gif', 'svg', 'jpeg'];
            let typeVideo = ['mp4', 'webm', 'flv', 'mov', 'mpg', 'm4v', '3gv'];
            list.listMedia.map((img) => {
                if (typeVideo.includes(img.type)) {
                    img.sources = [
                        {
                            src: img.serverPath,
                            type: 'video/' + img.type
                        }
                    ];
                    img.type = 'video';
                } else {
                }
            });
            this.listImage = list.listMedia;
            this.$refs.lightbox.showDialog = true;
            this.$refs.lightbox.showImage(list.index);
        },
        /*
         *   Hàm clear forcus của các table khi click ra ngoài
         */
        clearForcusTable(currentTableForcusName) {
            let allTable = $('#sym-submit-' + this.keyInstance).find(
                '.wrap-table'
            );
            for (let i = 0; i < allTable.length; i++) {
                let tableName = $(allTable[i])
                    .children()
                    .first()
                    .attr('table-name');
                if (tableName != currentTableForcusName) {
                    let tableIns = getControlInstanceFromStore(
                        this.keyInstance,
                        tableName
                    );
                    if (tableIns && tableIns.tableInstance) {
                        tableIns.tableInstance.stopEditing();
                        tableIns.tableInstance.clearRangeSelection();
                    }
                }
            }
        },
        /**
         * Lắng nghe sự kiện paste
         * Hàm này chỉ xử lý cho bảng khi paste thì tự thêm dòng
         */
        insertNewRowsBeforePaste(event) {
            var clipboardData = event.clipboardData || window.clipboardData;
            var pastedData =
                clipboardData.getData('Text') ||
                clipboardData.getData('text/plain');
            if (!pastedData && pastedData.length) {
                return;
            }
            let table = getControlInstanceFromStore(
                this.keyInstance,
                this.sDocumentSubmit.tableInteractive
            );
            if (table != false) {
                let edittingCells = table.tableInstance.getEditingCells();
                if (edittingCells.length > 0) {
                    return;
                }
                table.dataClipBoard = pastedData;
            }
        },

        closeFormulasWorker() {
            this.formulasWorker.postMessage({
                action: 'closeDB',
                data: { keyInstance: this.keyInstance }
            });
            this.formulasWorker.terminate();
        },
        handleLoadContentDocument() {
            if (this.docObjId != null) {
                this.loadDocumentObject();
            } else {
                if (this.documentId != null && this.documentId != 0) {
                    this.loadDocumentData();
                }
            }
            if (!this.docObjId && !this.documentId) {
                this.hidePreloader();
                this.$emit('submit-document-object-not-found');
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.doc.noTextFound')
                });
            }
        },

        afterBlurInputPivot(event) {
            $(event.target).css({ display: 'none' });
            this.updateDataAfterChangePivot($(event.target));
        },
        afterKeyupInputPivot(event) {
            if (event.which == 13) {
                $(event.target).css({ display: 'none' });
            }
        },
        /**
         * Hàm nhận biết sự thay đổi của cell đang nhập ở bảng pivot từ đó update lại data
         */
        updateDataAfterChangePivot(input) {
            let currentRowChangePivotMode = this.currentRowChangePivotMode;
            let keyChange = currentRowChangePivotMode.key;
            let value = currentRowChangePivotMode.value;
            let tableName = currentRowChangePivotMode.tableName;
            let type = currentRowChangePivotMode.type;
            if (type && type == 'group' && value.length > 0) {
                for (let index = 0; index < value.length; index++) {
                    value[index][keyChange] = input.val();
                }
                if (value[0][SQLITE_COLUMN_IDENTIFIER]) {
                    // edit dòng đã có
                    this.updateToTableNomalData(tableName, value, []);
                } else {
                    // thêm dòng mới cho table thường
                    this.updateToTableNomalData(tableName, [], value);
                }
            } else {
                value[keyChange] = input.val();
                if (value[SQLITE_COLUMN_IDENTIFIER]) {
                    // edit dòng đã có
                    this.updateToTableNomalData(tableName, [value], []);
                } else {
                    // thêm dòng mới cho table thường
                    this.updateToTableNomalData(tableName, [], [value]);
                }
            }
        },
        /**
         * Xử lí update data ngược lại từ bảng pivot -> table nomal
         */
        beforeAddPivotData(data) {
            let tableName = data.tableName;
            let type = data.type;
            let dataRowGroup = data.dataRowGroup;
            let dataColPivot = data.dataColPivot;
            let rowData = [];
            let rowSelected = dataRowGroup.filter((r) => {
                return r.selected != undefined;
            });
            for (let index = 0; index < dataRowGroup.length; index++) {
                let cell = dataRowGroup[index];
                if (cell.type != type) {
                    if (!cell.selected) {
                        for (let i = 0; i < cell.value.length; i++) {
                            let dataItem = {};
                            if (rowSelected.length > 0) {
                                dataItem[rowSelected[0]['controlName']] =
                                    rowSelected[0]['selected'];
                            }
                            dataItem[cell.controlName] = cell.value[i];
                            rowData.push(dataItem);
                        }
                    } else {
                        let dataItem = {};
                        if (rowSelected.length > 0) {
                            dataItem[rowSelected[0]['controlName']] =
                                rowSelected[0]['selected'];
                        }
                        dataItem[cell.controlName] = cell.selected;
                        rowData.push(dataItem);
                    }
                }
            }
            for (let index = 0; index < dataColPivot.length; index++) {
                let cell = dataColPivot[index];
                if (rowData.length > 0) {
                    for (let i = 0; i < rowData.length; i++) {
                        rowData[i][cell.controlName] = cell.selected;
                    }
                } else {
                    let tableControl = getControlInstanceFromStore(
                        this.keyInstance,
                        tableName
                    );
                    let hotTb = tableControl.tableInstance.tableInstance;
                    let allData = hotTb.getSourceData();
                    for (let index = 0; index < allData.length; index++) {
                        let dataItem = {};
                        dataItem[cell.controlName] = cell.selected;
                        rowData.push(dataItem);
                    }
                }
            }

            this.updateToTableNomalData(tableName, [], rowData);
            this.$refs.popupPivotTableView.hide();
        },
        /**
         * Hàm call lại chuẩn bị data để thêm vào bảng nomal sau khi có sự thay đổi ở bảng pivot
         */
        updateToTableNomalData(tableName, oldData = [], newData = []) {
            let tableControl = getControlInstanceFromStore(
                this.keyInstance,
                tableName
            );
            let hotTb = tableControl.tableInstance.tableInstance;
            let allData = hotTb.getSourceData();
            let allColumn = hotTb.getColHeader();
            let allColumnTable = tableControl.controlInTable;
            if (oldData.length > 0) {
                for (let index = 0; index < allData.length; index++) {
                    for (let i = 0; i < oldData.length; i++) {
                        let rowChange = oldData[i];
                        if (
                            allData[index][SQLITE_COLUMN_IDENTIFIER] ==
                            rowChange[SQLITE_COLUMN_IDENTIFIER]
                        ) {
                            allData[index] = rowChange;
                        }
                    }
                    delete allData[index][SQLITE_COLUMN_IDENTIFIER];
                    for (let control in allColumnTable) {
                        if (!allData[index][control]) {
                            allData[index][control] = null;
                        }
                    }
                }
            } else {
                if (newData.length > 0) {
                    for (let i = 0; i < newData.length; i++) {
                        let rowData = newData[i];
                        for (let index = 0; index < allData.length; index++) {
                            for (let control in allColumnTable) {
                                if (!allData[index][control]) {
                                    allData[index][control] = null;
                                }
                            }
                            delete allData[index][SQLITE_COLUMN_IDENTIFIER];
                        }
                        for (let control in allData[0]) {
                            if (!rowData[control]) {
                                rowData[control] = null;
                            }
                        }
                        allData.push(rowData);
                    }
                }
            }
            tableControl.tableInstance.setData(allData, false);
        },
        /**
         * Hàm ẩn loader
         */
        hidePreloader() {
            this.readyLoaded = true;
            if (this.$refs.preLoaderView) {
                this.$refs.preLoaderView.hide();
            }
            $('#sym-submit-' + this.keyInstance)
                .find('.page-content')
                .removeClass('d-block');
            $('#sym-submit-' + this.keyInstance)
                .find('.list-page-content')
                .removeClass('d-flex');
            $('#sym-submit-' + this.keyInstance).css({ opacity: '1' });
        },
        // trả về cấu hình mapping giá trị control với biến trong dataflow
        getHomeVariablesDataFlow(allControl, properties) {
            let mapControlToParams = properties.mapParamsDataflow.value;
            let variables = {};
            mapControlToParams.map((mapping) => {
                if (mapping.controlId) {
                    let controlName =
                        allControl[mapping.controlId].properties.name.value;
                    variables[mapping.paramDataflow] =
                        this.sDocumentSubmit.listInputInDocument[
                            controlName
                        ].value;
                }
            });
            return {
                home: {
                    variables: variables
                }
            };
        },
        // hàm lây các giá trị trong control để chạy dataflow
        //'db651d88-8ca0-4d20-9751-6283df1b9776':{ customData:{data:[{test: '1', test: 2}, {test: '2', test: 2}]}}
        getParamsForRunDataFlow(properties) {
            const self = this;
            let mapInputDataflow = properties.mapInputDataflow.value;
            let listInputInDocument = this.sDocumentEditor.allControl;
            let homeVariables = this.getHomeVariablesDataFlow(
                listInputInDocument,
                properties
            );
            let dataParams = {};
            if (mapInputDataflow) {
                Object.keys(mapInputDataflow).map((indexGroupConfig) => {
                    if (mapInputDataflow[indexGroupConfig].node) {
                        dataParams[mapInputDataflow[indexGroupConfig].node] = {
                            customData: {
                                data: []
                            }
                        };
                        let controlId =
                            mapInputDataflow[indexGroupConfig].control;
                        let controlName =
                            listInputInDocument[controlId].properties.name
                                .value;
                        let controlValue =
                            this.sDocumentSubmit.listInputInDocument[
                                controlName
                            ].value;
                        let mapDfControl =
                            mapInputDataflow[indexGroupConfig].mapping;
                        if (listInputInDocument[controlId].type != 'table') {
                            let data = {};
                            mapDfControl.map((map) => {
                                let fieldDataflow = map.fieldDataflow;
                                data[fieldDataflow] = controlValue;
                            });
                            dataParams[
                                mapInputDataflow[indexGroupConfig].node
                            ].customData.data = [data];
                        } else {
                            // tìm những control trong table được gửi dữ liệu
                            let mappingData = {}; //{controlName: dataflowNode, ...}
                            let controlsSelected = [];
                            mapDfControl.map((map) => {
                                if (map.fieldDataflow && map.controlId) {
                                    let controlChildrenName =
                                        listInputInDocument[controlId]
                                            .listFields[map.controlId]
                                            .properties.name.value;
                                    mappingData[controlChildrenName] =
                                        map.fieldDataflow;
                                    controlsSelected.push(controlChildrenName);
                                }
                            });
                            let controlIns =
                                this.sDocumentSubmit.listInputInDocument[
                                    controlName
                                ];
                            let allRow =
                                controlIns.tableInstance.getDataByColumn(
                                    controlsSelected
                                );
                            let filterRow = [];
                            allRow.map((row) => {
                                let newRow = {};
                                Object.keys(row).map((r) => {
                                    newRow[mappingData[r]] = row[r];
                                });
                                filterRow.push(newRow);
                            });
                            dataParams[
                                mapInputDataflow[indexGroupConfig].node
                            ].customData.data = filterRow;
                        }
                    }
                });
            }
            dataParams.home = homeVariables.home;
            return dataParams;
        },
        setWorkflowVariable(after) {
            this.optionalDataBinding = {
                ...this.optionalDataBinding,
                ...after
            };
            if (this.formulasWorker) {
                this.formulasWorker.postMessage({
                    action: 'addWorkflowVariable',
                    data: {
                        keyInstance: this.keyInstance,
                        workflowVariable: this.workflowVariable
                    }
                });
            }

            this.$store.commit('document/addToDocumentSubmitStore', {
                key: 'optionalDataBinding',
                value: this.optionalDataBinding,
                instance: this.keyInstance
            });
        },
        // tạo thêm dòng với kiểu group table có công thức autocomplete trong các control
        handleAddRowInGroupTable(data, controlIns) {
            let tableControl = getControlInstanceFromStore(
                this.keyInstance,
                controlIns.inTable
            );
            data.params = controlIns.row;
            let newData = { ...data };
            let countRow = tableControl.tableInstance.getDisplayedRowCount();
            if (countRow == 2) {
                // trường hợp table chỉ có 2 dòng mặc định thì xóa dòng mặc định rồi mới thêm dòng mới
                tableControl.tableInstance.selectAll();
                tableControl.tableInstance.clearAll();
            }
            tableControl.tableInstance.addListRowGroup(newData);
        },
        // thêm thông tin các giá trị danh sách trả về của input filter
        setDetailInputFilter(data) {
            let controlIns =
                this.sDocumentSubmit.listInputInDocument[data.controlName];
            let detail = {};
            if (data.listSelected.length > 0) {
                let row = Object.keys(data.listSelected[0]);
                row.map((r) => {
                    let newName = data.column.filter((col) => col.field == r)[0]
                        .headerName;
                    detail[r] = newName;
                });
            }
            this.sDocumentSubmit.listInputInDocument[
                data.controlName
            ].listTitleInputFilter = detail;
            this.listControlInputFilters[data.controlName] = data.listSelected;
            this.$set(controlIns, 'inputFiltersDetail', data.listSelected);
        },
        setSelectionInputFilter(controlIns) {
            if (
                !controlIns.inputFiltersDetail ||
                (controlIns.inputFiltersDetail &&
                    controlIns.inputFiltersDetail.length == 0)
            ) {
                // trường hợp chưa lưu giá trị input filter=> lấy giá trị cũ
                let lastValueInput = controlIns.inputValue
                    ? controlIns.inputValue
                    : controlIns.oldValue;
                let filter = [];
                if (!Array.isArray(lastValueInput)) {
                    lastValueInput = lastValueInput.split(',');
                    lastValueInput.map((input) => {
                        if (input != '') {
                            filter.push(input.substring(1, input.length - 1));
                        }
                    });
                }
                this.$refs.inputFilter.listOldValue = filter;
            } else {
                // đã lưu dữ liệu
                if (
                    controlIns.inputFiltersDetail.length > 0 &&
                    this.viewType == 'update'
                ) {
                    if (!controlIns.firstTime) {
                        this.$refs.inputFilter.listOldValueFull =
                            controlIns.inputFiltersDetail;
                        controlIns.firstTime = true;
                    } else {
                        this.$refs.inputFilter.listOldValueFull.length = 0;
                    }
                }
            }
        },
        getDetailInputFilter(controlName) {
            let otherInfo = this.objectOtherInfo;
            let controlIns =
                this.sDocumentSubmit.listInputInDocument[controlName];
            if (
                otherInfo.listInputFilters &&
                otherInfo.listInputFilters[controlName]
            ) {
                if (!controlIns.inputFiltersDetail) {
                    this.listControlInputFilters[controlName] =
                        otherInfo.listInputFilters[controlName];
                    controlIns.inputFiltersDetail =
                        otherInfo.listInputFilters[controlName];
                }
            } else {
                if (
                    !this.sDocumentSubmit.listInputInDocument[controlName]
                        .inputFiltersDetail
                ) {
                    controlIns.inputFiltersDetail = [];
                    this.listControlInputFilters[controlName] = [];
                }
            }
        },
        saveInputFilter(data) {
            let controlIns = getControlInstanceFromStore(
                this.keyInstance,
                data.controlName
            );
            resetImpactedFieldsList(this.keyInstance);
            if (data.value == '') controlIns.oldValue = '';
            if (controlIns.isInputFilter) {
                // kiểu group table có công thức autocomplete
                this.handleAddRowInGroupTable(data, controlIns);
            } else {
                if (!controlIns.inTable) {
                    this.handleInputChangeBySystem(data.controlName, data);
                } else {
                    let tableControl = getControlInstanceFromStore(
                        this.keyInstance,
                        controlIns.inTable
                    );
                    let currentCell =
                        tableControl.tableInstance.getFocusedCell();
                    let currentRow =
                        tableControl.tableInstance.getDisplayedRowAtIndex(
                            currentCell.rowIndex
                        );
                    tableControl.tableInstance.setDataAtCell(
                        currentCell.column.colDef.field,
                        data.value,
                        currentRow.id
                    );
                    tableControl.tableInstance.setFocusedCell(
                        currentCell.rowIndex,
                        currentCell.column.colDef.field
                    );
                }
            }

            this.$refs.symDragPanel.hide();
        },
        searchDataFilter(data) {
            if (this._inactive == true) return;
            let inputValue = [];
            data.listOldValue.map((d) => {
                inputValue.push(d[data.controlName]);
            });
            inputValue.join(',');
            this.sDocumentSubmit.listInputInDocument[
                data.controlName
            ].inputValue = inputValue;
            this.runInputFilterFormulas(data.controlName, data.search);
        },
        /**
         * Sau khi compon dataflow load xong thì cần gán lại html vào control tương ứng
         */
        afterDataFlowMounted(id) {
            for (let index = 0; index < this.listDataFlow.length; index++) {
                const controlDataFlow = this.listDataFlow[index];
                let dataFlowActionEl = controlDataFlow.el
                    .find('.run-dataflow')
                    .detach();
                controlDataFlow.el.find('div').first().addClass('d-none');
                let element = $(
                    this.$refs['dataFlow' + controlDataFlow.id][0].$el
                );
                controlDataFlow.el.append(dataFlowActionEl);
                controlDataFlow.el.append(element.detach());
                controlDataFlow.el
                    .find('.run-dataflow')
                    .css({ display: 'block' });
            }
        },
        handleValueChangeDataflow(data) {
            let dataflowId = data.id;
            let controlName =
                this.getControlDataFlowById(dataflowId).properties.name.value;
            let controlIns = getControlInstanceFromStore(
                this.keyInstance,
                controlName
            );
            // controlIns.value = data.value;
            controlIns.value = data.title;
            this.$refs['dataFlow' + dataflowId][0].selectNodeDataflow({
                id: data.value
            });
        },
        getControlDataFlowById(dataflowId) {
            let dataflow = this.listDataFlow.filter(
                (df) => df.id == dataflowId
            )[0];
            if (dataflow) {
                dataflow = dataflow.el.attr('id');
            }
            let idControl = dataflow;
            return this.sDocumentEditor.allControl[idControl];
        },
        runDataFlow(dataflowId) {
            let control = this.getControlDataFlowById(dataflowId);
            this.currentControlDataflow = control;
            let dataParams = this.getParamsForRunDataFlow(control.properties);
            let id = control.properties.dataFlowId.value.id ? control.properties.dataFlowId.value.id : control.properties.dataFlowId.value
            this.$refs[
                'dataFlow' + id
            ][0].runDataflow(dataParams);
        },
        /**
         * Hàm chạy công thức sau khi chạy xong dataflow
         */
        afterRunDataflow(data) {
            if(this.currentControlDataflow){
                let controlName = this.currentControlDataflow.properties.name.value;
                let controlIns = getControlInstanceFromStore(
                    this.keyInstance,
                    controlName
                );
                let controlEffected = controlIns.getEffectedControl();
                controlIns.tableTempDataflow = data.data.outputDatasetName;
                this.runFormulasControlEffected(controlEffected);                
            }else {
                this.$snotifyError('', this.$t('v2.doc.errInsertDataDataflow'))
            }
        },
        getDataOrgchart(e) {
            let thisCpn = this;
            let aliasControl =
                e.formulaInstance.autocompleteDetectAliasControl();
            let listInput = getListInputInDocument(this.keyInstance);
            let dataInput = e.formulaInstance.getDataInputFormula(listInput, e);
            for (let controlName in dataInput) {
                if (Array.isArray(dataInput[controlName])) {
                    dataInput[controlName] =
                        dataInput[controlName][e.e.rowIndex];
                }
            }
            let dataFromCache = this.getDataAutocompleteFromCache(
                aliasControl,
                dataInput
            );
            if (dataFromCache == false) {
                e.formulaInstance
                    .handleBeforeRunFormulas(dataInput)
                    .then((res) => {
                        thisCpn.setDataForControlAutocomplete(
                            res,
                            aliasControl,
                            e.controlTitle
                        );
                    });
            } else {
                this.$refs.autocompleteInput.setAliasControl(aliasControl);
                this.$refs.autocompleteInput.setData(dataFromCache);
            }
        },
        /**
         * Hàm chạy công thức autocomplete để đổ dữ liệu vào box autucomplete, control select cũng dùng trường hợp này
         */
        getDataForAutocomplete(e, type, aliasControl = '', controlIns) {
            let listInput = getListInputInDocument(this.keyInstance);
            let dataControlAutocompleting = {};
            let formulaIns = null;
            let rowNodeId = e.rowNodeId;
            if (['select', 'combobox'].includes(type)) {
                formulaIns = controlIns.getFormulaInstance('list');
            } else {
                formulaIns = controlIns.getFormulaInstance('autocomplete');
                dataControlAutocompleting[controlIns.name] = e.e.target.value;
                aliasControl = formulaIns.autocompleteDetectAliasControl();
            }
            if (formulaIns) {
                let self = this;
                let dataInput = getDataInputFormula(
                    formulaIns,
                    listInput,
                    this.optionalDataBinding,
                    rowNodeId,
                    dataControlAutocompleting,
                    controlIns.name
                );
                let dataFromCache = false;
                if (e.e.target.value != '') {
                    dataFromCache = this.getDataAutocompleteFromCache(
                        aliasControl,
                        dataInput
                    );
                }
                if (dataFromCache == false) {
                    clearTimeout(self.autocompleteTimer);
                    self.autocompleteTimer = setTimeout(function () {
                        self.formulasWorker.postMessage({
                            action: 'runFormula',
                            data: {
                                formulaInstance: formulaIns,
                                dataInput: dataInput,
                                controlName: aliasControl,
                                rowNodeId: rowNodeId,
                                keyInstance: self.keyInstance
                            }
                        });
                    }, 300);
                } else {
                    this.$refs.autocompleteInput.setAliasControl(aliasControl);
                    this.$refs.autocompleteInput.setData(dataFromCache);
                }
            }
        },

        // hàm lấy data từ cache của control autocomplete
        getDataAutocompleteFromCache(controlName, dataInput) {
            let groupKey = [];
            for (let ctlName in dataInput) {
                groupKey.push(dataInput[ctlName]);
            }
            groupKey = groupKey.join('------');
            if (
                this.sDocumentSubmit.autocompleteData.hasOwnProperty(
                    controlName
                ) &&
                this.sDocumentSubmit.autocompleteData[
                    controlName
                ].header.hasOwnProperty(groupKey) &&
                this.sDocumentSubmit.autocompleteData[
                    controlName
                ].cacheData.hasOwnProperty(groupKey)
            ) {
                return {
                    headers:
                        this.sDocumentSubmit.autocompleteData[controlName]
                            .header[groupKey],
                    dataBody:
                        this.sDocumentSubmit.autocompleteData[controlName]
                            .cacheData[groupKey]
                };
            } else {
                return false;
            }
        },
        /**
         * Hàm bind dữ liệu cho box autocomplete, cho component autocompleteInput
         * và đưa dữ liệu vào cache
         */
        setDataForControlAutocomplete(res, aliasControl, controlTitle = '') {
            let fromSqlite = !res.server;
            let controlAs = {};
            controlAs[aliasControl] = controlTitle;
            if (res.data) {
                let dataTable = {};
                if (fromSqlite) {
                    dataTable = this.handleDataAutoComplete(
                        res.data,
                        fromSqlite,
                        controlAs
                    );
                } else {
                    dataTable = this.handleDataAutoComplete(
                        res.data.data,
                        fromSqlite,
                        controlAs
                    );
                }

                this.$refs.autocompleteInput.setAliasControl(aliasControl);
                this.$refs.autocompleteInput.setData(dataTable);
                if (!controlTitle) {
                    this.$refs.autocompleteInput.hideHeader();
                }
                if (dataTable.hasOwnProperty('headers')) {
                    try {
                        let dataInput = res.data.dataInput;
                        let groupKey = [];
                        for (let controlName in dataInput) {
                            groupKey.push(dataInput[controlName]);
                        }
                        groupKey = groupKey.join('------');
                        let itemData = {};
                        let itemHeader = {};
                        itemData[groupKey] = dataTable.dataBody;
                        itemHeader[groupKey] = dataTable.headers;
                        this.$store.commit('document/cacheDataAutocomplete', {
                            instance: this.keyInstance,
                            controlName: aliasControl,
                            header: itemHeader,
                            cacheData: itemData
                        });
                    } catch (error) {
                        console.log(error, 'errorerror');
                    }
                }
            } else {
                this.$refs.autocompleteInput.setData([]);
            }
        },
        /**
         * Hàm xử lí nhận dữ liệu component autocomplete khi chọn 1 dòng
         */
        afterSelectRowAutoComplete(data) {
            this.$store.commit('document/setAutocompleteValueToText', {
                key: data.value.inputValue,
                value: data.value.inputDislay,
                controlName: data.controlName,
                instance: this.keyInstance
            });
            // th này không phải trong table
            let controlIns = getControlInstanceFromStore(
                this.keyInstance,
                data.controlName
            );
            controlIns.isRunChange = true;
            if (controlIns.inTable == false) {
                this.handleInputChangeBySystem(
                    data.controlName,
                    data.value,
                    true
                );
            } else {
                let tableControl = getControlInstanceFromStore(
                    this.keyInstance,
                    controlIns.inTable
                );
                let currentCell = tableControl.tableInstance.getFocusedCell();
                let currentRow =
                    tableControl.tableInstance.getDisplayedRowAtIndex(
                        currentCell.rowIndex
                    );
                //dòng có cell group row trong group table
                if (currentCell.column.colId == 'ag-Grid-AutoColumn') {
                    tableControl.tableInstance.setDataAtCell(
                        data.controlName,
                        data.value.inputValue,
                        currentRow,
                        true
                    );
                } else {
                    tableControl.tableInstance.setDataAtCell(
                        currentCell.column.colDef.field,
                        data.value.inputValue,
                        currentRow.id
                    );
                }
                tableControl.tableInstance.setFocusedCell(
                    currentCell.rowIndex,
                    currentCell.column.colDef.field
                );
            }
        },

        /**
         * Hàm xử lí sau khi chạy công thức được điền dữ liệu vào input bởi hệ thống
         */
        handleInputChangeBySystem(
            controlName,
            valueControl,
            isRunChange = true
        ) {
            let controlInstance = getControlInstanceFromStore(
                this.keyInstance,
                controlName
            );
            markBinedField(this.keyInstance, controlName);
            if (controlInstance.type == 'inputFilter') {
                if (valueControl != null && typeof valueControl == 'object') {
                    // chạy từ save input filter
                    this.setDetailInputFilter(valueControl);
                    valueControl = valueControl.value;
                } else {
                    this.$set(controlInstance, 'inputFiltersDetail', []);
                }
                setDataInputBeforeChange(this.keyInstance, controlInstance);
            }
            if(controlInstance.type == 'department' && valueControl){
                this.getRoleNameForControlDepartment(controlInstance, valueControl);
            }else {
                controlInstance.setValue(valueControl);
            }
            this.updateListInputInDocument(
                controlName,
                'value',
                controlInstance.value
            );
            // sau khi thay đổi giá trị input thì kiểm tra require control nếu có
            if (isRunChange) {
                this.handleControlInputChange(controlInstance);
            }
        },
        /**
         * Xử lý lưu control xuống worker, chạy công thức sau khi người dùng thay đổi giá trị của control
         */
        handleInputChangeByUser(controlInstance) {
            this.$store.commit('document/addToDocumentSubmitStore', {
                key: 'docStatus',
                value: 'input',
                instance: this.keyInstance
            });
            setDataInputBeforeChange(this.keyInstance, controlInstance);
            if (controlInstance.valueChange) {
                controlInstance.setValue(controlInstance.valueChange);
            }
            let controlToWorker = {
                name: controlInstance.name,
                type: controlInstance.type,
                value: controlInstance.value
            };
            this.formulasWorker.postMessage({
                action: 'updateWorkerStore',
                data: {
                    controlIns: controlToWorker,
                    keyInstance: this.keyInstance,
                    type: 'submit'
                }
            });
            resetImpactedFieldsList(this.keyInstance);
            this.handleControlInputChange(controlInstance);
        },
        /**
         * Hàm  xử lí data sau khi query công thức autocomplete,
         * xử lí data về dạng object cho DataTable của vuetify
         */
        handleDataAutoComplete(data, isFromSQLLite, controlAs) {
            let headers = [];
            let bodyTable = [];
            if (isFromSQLLite) {
                if (data[0]) {
                    for (let i = 0; i < data[0].columns.length; i++) {
                        let item = {
                            value: data[0].columns[i],
                            text: data[0].columns[i]
                        };
                        if (controlAs.hasOwnProperty(data[0].columns[i])) {
                            item.text = controlAs[data[0].columns[i]];
                        }
                        if (data[0].columns[i] == 'column1') {
                            item.text = controlAs[Object.keys(controlAs)[0]];
                        }
                        headers.push(item);
                    }
                    let values = data[0].values;
                    for (let i = 0; i < values.length; i++) {
                        let item = {};
                        for (let j = 0; j < data[0].columns.length; j++) {
                            item[data[0].columns[j]] = values[i][j];
                        }
                        bodyTable.push(item);
                    }
                }
            } else {
                if (data.length > 0) {
                    for (let controlName in data[0]) {
                        let item = { value: controlName, text: controlName };
                        if (controlAs.hasOwnProperty(controlName)) {
                            item.text = controlAs[controlName];
                        }
                        headers.push(item);
                    }
                    data[0]['active'] = true;
                    bodyTable = data;
                }
            }
            return { headers: headers, dataBody: bodyTable };
        },
        // Khadm: load data của document lên để hiển thị và xử lý
        async loadDocumentData() {
            if (this.documentId) {
                // kiểm tra quyền theo action
                let objectTypePermission = this.viewType == 'submit' ? this.$store.state.app.userOperations['document_definition'] : this.$store.state.app.userOperations['document_instance'];
                let hasCreatePermission = true;
                if (!util.auth.isSupportter()) {
                    let objectType = this.viewType == 'submit' ? this.documentId : this.documentId + ':0'
                    let action = this.documentObjectWorkflowObjectId && (this.viewType == 'submit' || this.viewType == 'update') ? this.viewType + '_by_workflow' : this.viewType
                    hasCreatePermission =
                        objectTypePermission &&
                        objectTypePermission[objectType] &&
                        objectTypePermission[objectType][action];
                    if (!hasCreatePermission) {
                        this.isPermission = false
                        this.hidePreloader();
                        return;
                    }
                }
                let thisCpn = this;
                let res = currentDocumentInfor[this.documentId];
                if (res == '' || res == null) {
                    res = await documentApi.detailDocument(this.documentId);
                }
                if (res.status == 200) {
                    currentDocumentInfor[this.documentId] = res;
                    thisCpn.$store.commit('document/addToDocumentSubmitStore', {
                        key: 'documentInfo',
                        value: res.data,
                        instance: thisCpn.keyInstance
                    });
                    let content = res.data.document.content;
                    thisCpn.documentName = res.data.document.name;
                    thisCpn.documentInfo = res.data.document;
                    thisCpn.getTitleObjectFormulas(
                        res.data.document.titleObjectFormulasId
                    );
                    thisCpn.docSize =
                        parseInt(res.data.document.isFullSize) == 1
                            ? '100%'
                            : '21cm';
                    thisCpn.contentDocument = content;
                    if (
                        res.data.document.dataPrepareSubmit != null &&
                        res.data.document.dataPrepareSubmit != ''
                    )
                        thisCpn.preDataSubmit = JSON.parse(
                            res.data.document.dataPrepareSubmit
                        );
                    if (
                        res.data.document.otherInfo != null &&
                        res.data.document.otherInfo != ''
                    )
                        thisCpn.otherInfo = JSON.parse(
                            res.data.document.otherInfo
                        );

                    if (res.data.document.formStyle) {
                        let style = JSON.parse(res.data.document.formStyle);
                        if (!style['globalClass']) {
                            style['globalClass'] =
                                'document-form-style-default';
                        }
                        thisCpn.globalClass[style['globalClass']] = true;
                    } else {
                        thisCpn.globalClass[
                            'document-form-style-default'
                        ] = true;
                    }
                    thisCpn.objectIdentifier =
                        thisCpn.otherInfo.objectIdentifier;
                    thisCpn.dataPivotTable = res.data.pivotConfig;
                    thisCpn.matchingItemsAllTables = res.data.document
                        .matchingItemsConfig
                        ? JSON.parse(res.data.document.matchingItemsConfig)
                        : '';
                    thisCpn.dataGroupTable = res.data.groupConfig;
                    thisCpn.dataDeleteRowTableConfig = getConfigDeleteRowTable(
                        res.data.document.controlInfo,
                        true
                    );
                    // đẩy phần xử lí data control xuống worker
                    thisCpn.formulasWorker.postMessage({
                        action: 'createSQLiteDB',
                        data: { keyInstance: this.keyInstance }
                    });
                    this.currentFields = res.data.fields;
                } else {
                    thisCpn.$snotify({
                        type: 'error',
                        title: res.message
                    });
                }
            }
        },

        /**
         * hàm lấy thông tin của formulas cho title bản ghi
         */
        getTitleObjectFormulas(formulasId) {
            if (formulasId && formulasId != 0) {
                let self = this;
                formulasApi.detailFormulas(formulasId).then((res) => {
                    if (res.status == 200) {
                        self.titleObjectFormula = new Formulas(
                            self.keyInstance,
                            res.data.lastContent,
                            'titleObject'
                        );
                    }
                });
            }
        },

        /**
         * Hàm lấy thông tin của bản ghi trường hợp update
         */
        loadDocumentObject() {
            let thisCpn = this;
            thisCpn.$store.commit('document/addToDocumentSubmitStore', {
                key: 'documentObjectId',
                value: this.docObjId,
                instance: this.keyInstance
            });
            documentApi
                .detailDocumentObject(this.docObjId, { action: 'update' })
                .then((res) => {
                    if (res.status == 200) {
                        thisCpn.isPermission = true;
                        thisCpn.$store.commit(
                            'document/addToDocumentDetailStore',
                            {
                                key: 'allData',
                                value: res.data,
                                instance: thisCpn.keyInstance
                            }
                        );

                        thisCpn.objectOtherInfo = res.data.otherInfo;
                        thisCpn.documentId = res.data.documentId;
                        thisCpn.isDraft = res.data.isDraft;
                        thisCpn.loadDocumentData();
                    } else {
                        if (res.status == 403) {
                            thisCpn.isPermission = false;
                        }
                        thisCpn.hidePreloader();
                        thisCpn.$snotify({
                            type: 'error',
                            title: res.message
                        });
                    }
                })
                .catch((err) => {
                    thisCpn.$snotify({
                        type: 'error',
                        title: thisCpn.$t('v2.doc.errorFromDetailDocObjectApi')
                    });
                })
                .finally(() => {});
        },
        /**
         * Hàm chuyển kích thước view sang full size và ngược lại
         */
        togglePageSize() {
            this.docSize = this.docSize == '21cm' ? '100%' : '21cm';
        },
        /**
         * Khởi tạo các đối tượng control từ html
         * các control được đánh dâu bởi id có frefix: s-contorl-timestamp
         */
        processHtml() {
            $('#sym-submit-' + this.keyInstance)
                .find('.page-content')
                .addClass('d-block');
            $('#sym-submit-' + this.keyInstance)
                .find('.list-page-content')
                .addClass('d-flex');
            var allInputControl = $('#sym-submit-' + this.keyInstance).find(
                '.s-control:not(.bkerp-input-table .s-control)'
            );
            let thisCpn = this;
            let isSetEffectedControl = false;
            let listDataFlow = [];
            let listTableData = {};
            let listTable = {};
            for (let index = 0; index < allInputControl.length; index++) {
                let id = $(allInputControl[index]).attr('id');
                let controlType = $(allInputControl[index]).attr(
                    's-control-type'
                );
                if (this.sDocumentEditor.allControl[id] != undefined) {
                    // ton tai id trong store
                    let field = this.sDocumentEditor.allControl[id];
                    let controlName =
                        allControlNotSetData.includes(controlType) ||
                        controlType == 'tabPage'
                            ? field.type
                            : field.properties.name.value;
                    let isHiddenControl = false;
                    if (
                        this.objectOtherInfo.hiddenControls &&
                        this.objectOtherInfo.hiddenControls.includes(
                            controlName
                        )
                    ) {
                        isHiddenControl = true;
                    }
                    let isReadOnlyControl = false;
                    if (
                        this.objectOtherInfo.readOnlyControls &&
                        this.objectOtherInfo.readOnlyControls[controlName]
                    ) {
                        isReadOnlyControl = true;
                    }
                    this.checkEditableControl(controlName, field);
                    this.checkOverrideFormulas(controlName, field);
                    // this.checkOverrideProperties(controlName, field);
                    let idField = field.id;
                    let valueInput = field.value;
                    if (controlType == 'location' && valueInput) {
                        valueInput = JSON.parse(valueInput);
                    }
                    let prepareData = field.prepareData;
                    if (prepareData) {
                        isSetEffectedControl = true;
                    }
                    if (valueInput == undefined || valueInput == null) {
                        valueInput = '';
                    }
                    if (allControlNotSetData.includes(controlType)) {
                        let control = new ActionControl(
                            idField,
                            $(allInputControl[index]),
                            field,
                            thisCpn.keyInstance
                        );
                        control.init();
                        control.render();
                        control.setEffectedData(prepareData);
                        this.addToListInputInDocument(
                            allControlNotSetData[controlType],
                            control
                        );
                        if (controlType == 'approvalHistory') {
                            this.isShowComment = true;
                            control.addCommentToView(
                                $(this.$refs.commentView.$el).detach()
                            );
                            this.scrollBottom = true;
                        }
                    } else if (controlType == 'tabPage') {
                        let control = new LayoutControl(
                            idField,
                            $(allInputControl[index]),
                            field,
                            thisCpn.keyInstance
                        );
                        control.init();
                        control.render();
                        this.addToListInputInDocument('tabPage', control);
                    } else if (controlType == 'tab') {
                        let control = new TabControl(
                            idField,
                            $(allInputControl[index]),
                            field,
                            thisCpn.keyInstance
                        );
                        control.init();
                        control.render();
                        this.addToListInputInDocument(controlName, control);
                    } else if (controlType == 'page') {
                        let control = new PageControl(
                            idField,
                            $(allInputControl[index]),
                            field,
                            thisCpn.keyInstance
                        );
                        control.init();
                        control.render();
                        this.addToListInputInDocument(controlName, control);
                    } else {
                        let mapColumnType =
                            Util.mapTypeControlToTypeSQLLite(controlType);
                        if (mapColumnType != false) {
                            this.columnsSQLLiteDocument[controlName] =
                                mapColumnType;
                        }
                        field.properties.docName = this.documentName;
                        if (controlType != 'table') {
                            if (controlType == 'dataFlow') {
                                let id = field.properties.dataFlowId.value.id ? field.properties.dataFlowId.value.id : field.properties.dataFlowId.value;
                                let nodes =
                                    field.properties.mapOutputDataflow.value;
                                let formatNodes = [];
                                nodes.map((n) => {
                                    let opt = {
                                        value: n.nodeId,
                                        text: n.title
                                    };
                                    // if (opt.value == valueInput) {
                                    if (opt.text == valueInput) {
                                        opt.isSelected = true;
                                    }
                                    formatNodes.push(opt);
                                });
                                let mapParamsDataflow =
                                    field.properties.mapParamsDataflow.value;
                                $(allInputControl[index])
                                    .find('.run-dataflow')
                                    .removeClass('d-none');
                                listDataFlow.push({
                                    id: id,
                                    controlName: controlName,
                                    el: $(allInputControl[index]),
                                    mapParamsDataflow: mapParamsDataflow,
                                    nodes: formatNodes,
                                    controlTitle: field.properties.title.value,
                                });
                                let control = new LayoutControl(
                                    idField,
                                    $(allInputControl[index]),
                                    field,
                                    thisCpn.keyInstance
                                );
                                if (isHiddenControl) {
                                    control.hidden = true;
                                }
                                control.init();
                                control.setEffectedData(prepareData);
                                this.addToListInputInDocument(
                                    controlName,
                                    control
                                );
                            }
                            // trường hợp những control ở ngoài table dạng input
                            else {
                                let control = new BasicControl(
                                    idField,
                                    $(allInputControl[index]),
                                    field,
                                    thisCpn.keyInstance,
                                    valueInput
                                );
                                if (isHiddenControl) {
                                    control.hidden = true;
                                    control.hideRelatedControlTitle(id);
                                }
                                if (isReadOnlyControl) {
                                    control.controlProperties.isReadOnly.value = true;
                                }
                                control.init();
                                control.setEffectedData(prepareData);
                                this.addToListInputInDocument(
                                    controlName,
                                    control
                                );
                                control.render();
                                if(control.checkProps('isRunFormulaManually')){
                                    this.listControlRunFormulaManually[controlName] = true
                                }
                                if (
                                    field.type == 'documentInstanceIdentifier'
                                ) {
                                    if (
                                        this.objectOtherInfo
                                            .documentInstanceIdentifier &&
                                        this.objectOtherInfo
                                            .documentInstanceIdentifier.length >
                                            0
                                    ) {
                                        let controlCurrentValue =
                                            this.objectOtherInfo.documentInstanceIdentifier.find(
                                                (el) => el[0] == controlName
                                            );
                                        if (controlCurrentValue) {
                                            control.prefixDocInstanceIdentifier =
                                                controlCurrentValue[1];
                                            control.suffixDocInstanceIdentifier =
                                                controlCurrentValue[2];
                                        }
                                    }
                                    if (this.viewType == 'update') {
                                        this.$set(
                                            control,
                                            'originValue',
                                            control.value
                                        );
                                    }
                                    this.listDocumentIdentifierControl[
                                        controlName
                                    ] = control;
                                }
                                if (
                                    field.type == 'department' &&
                                    this.viewType == 'update'
                                ) {
                                    this.setDataForDepartment(
                                        control,
                                        controlName
                                    );
                                }
                                if ( field.type == 'location' && 
                                    control.checkPropsValue(
                                        'typeGetLocation',
                                        'automatically'
                                    )
                                ) {
                                    this.listControlLocationGetDataAutomatic.push(control)
                                    this.isGetControlLocationAutomatically = true
                                }
                            }
                        }
                        //truong hop la control table
                        else {
                            let controlInTable = {};
                            let tableControl = new TableControl(
                                idField,
                                $(allInputControl[index]),
                                field,
                                thisCpn.keyInstance,
                                this.dataPivotTable
                                    ? this.dataPivotTable[controlName]
                                    : {},
                                this.dataGroupTable
                                    ? this.dataGroupTable[controlName]
                                    : {},
                                this.matchingItemsAllTables
                                    ? this.matchingItemsAllTables[controlName]
                                    : {}
                            );
                            if (!util.auth.isSupportter()) {
                                let checkHidden = this.checkPermission(
                                    tableControl.name,
                                    'hide'
                                );
                                if (checkHidden) tableControl.hidden = true;
                                let checkReadOnly = this.checkPermission(
                                    tableControl.name,
                                    'readonly'
                                );
                                if (checkReadOnly) isReadOnlyControl = true;
                                tableControl.userCreate =
                                    this.sDocumentDetail.allData.document_object_user_created_id;
                                tableControl.documentObjectWorkflowObjectId =
                                    this.documentObjectWorkflowObjectId;
                                tableControl.taskAction = this.taskAction;
                            }
                            if (isHiddenControl) {
                                tableControl.hidden = true;
                            }

                            if (isReadOnlyControl) {
                                tableControl.controlProperties.isReadOnly.value = true;
                            }
                            tableControl.setFormulasWorker(
                                thisCpn.formulasWorker
                            );
                            tableControl.setEffectedData(prepareData);
                            if(tableControl.checkProps('isRunFormulaManually')){
                                this.listControlRunFormulaManually[tableControl.name] = true
                            }
                            let tableEle = $(allInputControl[index]);
                            tableEle.find('.s-control').each(function () {
                                let childControlId = $(this).attr('id');
                                let childControlProp =
                                    thisCpn.sDocumentEditor.allControl[id]
                                        .listFields[childControlId];
                                let childControlName =
                                    childControlProp.properties.name.value;
                                childControlProp.properties.inTable =
                                    controlName;
                                childControlProp.properties.docName =
                                    thisCpn.documentName;
                                thisCpn.checkEditableControl(
                                    childControlName,
                                    childControlProp,
                                    tableControl.name
                                );
                                thisCpn.checkOverrideFormulas(
                                    childControlName,
                                    childControlProp
                                );
                                thisCpn.checkOverrideFormulas(
                                    childControlName,
                                    childControlProp
                                );
                                // thisCpn.checkOverrideProperties(
                                //     childControlName,
                                //     childControlProp,
                                // );
                                let childValue = childControlProp.value;
                                let childPrepareData =
                                    childControlProp.prepareData;
                                if (childPrepareData) {
                                    isSetEffectedControl = true;
                                }
                                let idFieldChild = childControlProp.id;
                                let childControl = new BasicControl(
                                    idFieldChild,
                                    $(this),
                                    childControlProp,
                                    thisCpn.keyInstance,
                                    childValue
                                );
                                if (
                                    thisCpn.checkPermission(
                                        childControlName,
                                        'hide'
                                    )
                                ) {
                                    childControl.hidden = true;
                                }
                                if (
                                    thisCpn.checkPermission(
                                        childControlName,
                                        'readonly'
                                    )
                                ) {
                                    if (
                                        childControl.controlProperties
                                            .isReadOnly
                                    )
                                        childControl.controlProperties.isReadOnly.value = true;
                                }
                                if (
                                    thisCpn.objectOtherInfo.hiddenControls &&
                                    thisCpn.objectOtherInfo.hiddenControls.includes(
                                        childControlName
                                    )
                                ) {
                                    childControl.hidden = true;
                                }
                                if (
                                    thisCpn.objectOtherInfo.readOnlyControls &&
                                    thisCpn.objectOtherInfo.readOnlyControls[
                                        childControlName
                                    ]
                                ) {
                                    childControl.controlProperties.isReadOnly.value = true;
                                }
                                if (
                                    childControlProp.type == 'location' &&
                                    childControl.checkPropsValue(
                                        'typeGetLocation',
                                        'automatically'
                                    )
                                ) {
                                    thisCpn.listControlLocationGetDataAutomatic.push(childControl)
                                    thisCpn.isGetControlLocationAutomatically = true
                                }
                                if (
                                    thisCpn.viewType == 'update' &&
                                    childControlProp.type == 'department'
                                ) {
                                    thisCpn.setDataForDepartment(
                                        childControl,
                                        childControlName,
                                        true
                                    );
                                }
                                if(childControl.checkProps('isRunFormulaManually')){
                                    thisCpn.listControlRunFormulaManually[childControlName] = true
                                }
                                childControl.init();
                                childControl.setEffectedData(childPrepareData);
                                thisCpn.addToListInputInDocument(
                                    childControlName,
                                    childControl
                                );
                                controlInTable[childControlName] = childControl;
                            });
                            tableControl.controlInTable = controlInTable;
                            tableControl.renderTable();
                            this.addToListInputInDocument(
                                controlName,
                                tableControl
                            );
                            if (this.viewType !== 'submit') {
                                listTableData[controlName] = valueInput;
                                listTable[controlName] = tableControl;
                            }
                            this.listTable[controlName] = tableControl;
                        }
                    }
                }
            }
            this.setDataForTable(listTableData, listTable);
            this.listDataFlow = listDataFlow;
            this.handleBeforeLoadedDocument();
            this.setHiddenControl();
            if(this.isGetControlLocationAutomatically){
                this.getLocation(this.listControlLocationGetDataAutomatic);
            }
            this.$emit('load-form-success');
        },
        // check permission cho cột trong table với action: readonly, hide
        checkPermission(col, action) {
            let hasAction = false; // được sửa
            if (
                this.$store.state.app.userOperations &&
                this.$store.state.app.userOperations.control
            ) {
                let docId = this.documentId;
                let permissionControl =
                    this.$store.state.app.userOperations.control;
                let control = docId + ':' + col;
                if (
                    permissionControl[control] &&
                    permissionControl[control][action]
                ) {
                    hasAction = true;
                }
            }
            return hasAction;
        },
        // xử lý lấy giá trị prefix và suffix cho control SCT
        setDataForControlDocInstanceIdentifier(controlName) {
            const self = this;
            let control = this.sDocumentSubmit.listInputInDocument[controlName];
            let controlDocumentIdValue = '';
            let numberStart = 0;
            let totalNumber = Number(
                control.controlProperties.totalNumber.value
            );
            let controlInstance = getControlInstanceFromStore(
                this.keyInstance,
                controlName
            );
            let prefixDocInstanceIdentifier =
                control.prefixDocInstanceIdentifier;
            let suffixDocInstanceIdentifier =
                control.suffixDocInstanceIdentifier;
            let data = {
                documentId: this.documentId,
                prefix: prefixDocInstanceIdentifier
                    ? prefixDocInstanceIdentifier
                    : '',
                suffix: suffixDocInstanceIdentifier
                    ? suffixDocInstanceIdentifier
                    : '',
                totalNumber: totalNumber
            };
            documentApi.getCurrentNumberDocumentIdentifier(data).then((res) => {
                if (res.status == 200) {
                    if (!res[0]) {
                        numberStart =
                            control.controlProperties.startNumber.value;
                    } else {
                        numberStart =
                            Number(res[0][Object.keys(res[0])[0]]) + 1;
                    }
                    let stt = self.getSttValue(numberStart, totalNumber);
                    controlDocumentIdValue = data.prefix + stt + data.suffix;
                    this.handleInputChangeBySystem(controlName, controlDocumentIdValue);
                } else {
                    self.$snotifyError(self.$t('v2.doc.error'), self.$t('v2.doc.errorGetDocumentNumber'));
                }
            });
        },
        // lấy số thứ tự của control sct
        getSttValue(numberStart, totalNumber) {
            return String(numberStart).padStart(totalNumber, 0);
        },
        /**
         * Set data cho table sau khi khởi tạo xong hết control
         */
        setDataForTable(listTableData, listTable) {
            for (let tableName in listTable) {
                listTable[tableName].setData(listTableData[tableName]);
            }
        },
        /*
         * Hàm ẩn các control đã được ẩn lúc submit
         */
        setHiddenControl() {
            let listInput = getListInputInDocument(this.keyInstance);
            for (let controlName in listInput) {
                let control = listInput[controlName];
                control.setHiddenControl();
            }
        },
        /**
         * Hàm xử lí tìm các control được coi là root (các control không có đầu vào)
         */
        handleBeforeLoadedDocument() {
            if (this.docObjId == null) {
                this.findRootControl();
            } else {
                // trường hơp update thì ko chạy những công thức root ( ngoài )
                if (
                    this.preDataSubmit != null &&
                    Object.keys(this.preDataSubmit).length > 0
                ) {
                    let impactedFieldsList =
                        this.preDataSubmit.impactedFieldsList;
                    let impactedFieldsListWhenStart =
                        this.preDataSubmit.impactedFieldsListWhenStart;
                    this.pushDataRootToStore(
                        impactedFieldsList,
                        impactedFieldsListWhenStart
                    );
                }
                this.handlerRunRequireFormulas();
                this.handleRunLinkFormulas();
                if (this.isCloneType) {
                    this.handlerRunFormulasDocInstanceIdentifier();
                    this.handlerRunFormulasControlUser();
                    this.handlerRunValidateFormulas();
                }
                this.hidePreloader();
            }
            this.setRootControlRunFormulaManually();
        },
        // xử lý chạy lại công thức control user trong trường hợp clone bản ghi
        handlerRunFormulasControlUser() {
            let allControl = this.sDocumentEditor.allControl;
            Object.keys(allControl).map((controlId) => {
                if (allControl[controlId].type == 'user') {
                    this.handlerBeforeRunFormulasValue(
                        allControl[controlId].formulas.formulas.instance,
                        allControl[controlId].properties.name.value,
                        'formulas'
                    );
                }
            });
        },
        // xử lý chạy lại công thức sct với trường hợp clone bản ghi
        handlerRunFormulasDocInstanceIdentifier() {
            Object.keys(this.listDocumentIdentifierControl).map(
                (controlName) => {
                    let control =
                        this.listDocumentIdentifierControl[controlName];
                    if (
                        control.controlFormulas[
                            'prefixDocInstanceIdentifier'
                        ] &&
                        control.controlFormulas['prefixDocInstanceIdentifier']
                            .instance
                    ) {
                        this.handlerBeforeRunFormulasValue(
                            control.controlFormulas[
                                'prefixDocInstanceIdentifier'
                            ].instance,
                            controlName,
                            'prefixDocInstanceIdentifier',
                            false
                        );
                    }
                    if (
                        control.controlFormulas[
                            'suffixDocInstanceIdentifier'
                        ] &&
                        control.controlFormulas['suffixDocInstanceIdentifier']
                            .instance
                    ) {
                        this.handlerBeforeRunFormulasValue(
                            control.controlFormulas[
                                'suffixDocInstanceIdentifier'
                            ].instance,
                            controlName,
                            'suffixDocInstanceIdentifier',
                            false
                        );
                    }
                }
            );
        },
        // xử lý chạy công thức require khi update bản ghi
        handlerRunRequireFormulas(){
            let listInput = getListInputInDocument(this.keyInstance);
            for (let controlName in listInput) {
                let control = listInput[controlName];
                let controlFormulas = control.controlFormulas;

                for (let formulaType in controlFormulas) {
                    if (formulaType == 'require' && !control.value) {
                        let formulaInstance =
                            controlFormulas[formulaType].instance;
                        if (formulaInstance) {
                            let dataInput = getDataInputFormula(
                                formulaInstance,
                                this.sDocumentSubmit.listInputInDocument,
                                this.optionalDataBinding,
                                'all',
                                {},
                                controlName
                            );
                            this.formulasWorker.postMessage({
                                action: 'runFormula',
                                data: {
                                    formulaInstance: formulaInstance,
                                    dataInput: dataInput,
                                    controlName: controlName,
                                    keyInstance: this.keyInstance
                                }
                            });
                        }
                    }
                }
            }
        },
        /**
         * Ham chạy lại các công thức link
         */
         handleRunLinkFormulas() {
            let listInputInDocument = getListInputInDocument(this.keyInstance);
            for (let controlName in listInputInDocument) {
                let controlIns = listInputInDocument[controlName];
                if (typeof controlIns.getLinkFormula == 'function') {
                    let linkFormula = controlIns.getLinkFormula();
                    if (linkFormula != false) {
                        for (let i = 0; i < linkFormula.length; i++) {
                            let config = linkFormula[i];
                            let formulaInstance = config.instance;
                            if (formulaInstance) {
                                if (controlIns.inTable != false) {
                                    let tableIns = getControlInstanceFromStore(
                                        this.keyInstance,
                                        controlIns.inTable
                                    );
                                    tableIns.tableInstance.handleRunFormulaForControlInTable(
                                        controlIns,
                                        formulaInstance,
                                        'all'
                                    );
                                } else {
                                    this.handlerBeforeRunFormulasValue(
                                        formulaInstance,
                                        controlName,
                                        'linkConfig',
                                        'root'
                                    );
                                }
                            }
                        }
                    }
                }
            }
        },
        // xử lý chạy lại công thức validate với trường hợp clone bản ghi
        handlerRunValidateFormulas(){
            let listFormula = ['validate', 'hidden', 'readOnly'];
            let listInput = getListInputInDocument(this.keyInstance);
            for (let controlName in listInput) {
                let control = listInput[controlName];
                let controlFormulas = control.controlFormulas;

                for (let formulaType in controlFormulas) {
                    if (listFormula.includes(formulaType)) {
                        let formulaInstance =
                            controlFormulas[formulaType].instance;
                        if (formulaInstance) {
                            let dataInput = getDataInputFormula(
                                formulaInstance,
                                this.sDocumentSubmit.listInputInDocument,
                                this.optionalDataBinding,
                                'all',
                                {},
                                controlName
                            );
                            this.formulasWorker.postMessage({
                                action: 'runFormula',
                                data: {
                                    formulaInstance: formulaInstance,
                                    dataInput: dataInput,
                                    controlName: controlName,
                                    keyInstance: this.keyInstance
                                }
                            });
                        }
                    }
                }
            }
        },
        /**
         * Hàm lấy chính xác thứ tự chạy các control
         */
        getControlFormulasFlow() {
            let impactedFieldsList = this.preDataSubmit.impactedFieldsList;
            let newMap = {};
            for (let controlName in impactedFieldsList) {
                newMap[controlName] = [controlName];
                this.getRelated(
                    newMap[controlName],
                    controlName,
                    impactedFieldsList
                );
            }
            return newMap;
        },
        runFormulaManuallyControl(controlName){
            this.$store.commit('document/addToDocumentSubmitStore', {
                key: 'rootChangeFieldName',
                value: controlName,
                instance: this.keyInstance,
            });
            let control = getControlInstanceFromStore(
                    this.keyInstance,
                    controlName
                );
            if(control.controlFormulas.formulas && control.controlFormulas.formulas.instance){
                $('#sym-submit-' + this.keyInstance).find(`[control-name=`+controlName+`]`).find('.document-submit-button-run-formula-manually').addClass('symper-rotating');
                if(control.inTable){
                    let tableControl = getControlInstanceFromStore(
                        this.keyInstance,
                        control.inTable
                    );
                    let typeSelected = 'all';
                    tableControl.tableInstance.handleRunFormulaForControlInTable(
                        control,
                        control.controlFormulas.formulas.instance,
                        typeSelected,
                        null,
                        {},
                        this.isRunningAllFormulaManually
                    );             
                }else {
                    let formulaInstance = control.controlFormulas.formulas.instance
                        let dataInput = getDataInputFormula(
                        formulaInstance,
                        this.sDocumentSubmit.listInputInDocument,
                        this.optionalDataBinding,
                        'all',
                        {},
                        control.name
                    );
                    this.formulasWorker.postMessage({
                        action: 'runFormula',
                        data: {
                            formulaInstance: formulaInstance,
                            dataInput: dataInput,
                            controlName: control.name,
                            keyInstance: this.keyInstance
                        }
                    });
                }
            }else {
                if(this.isRunningAllFormulaManually){
                    // control được tích thuộc tính chạy thủ công nhưng không có nhập công thức giá trị
                    this.listRootControlRunFormulaManually[controlName] = true
                    this.$store.commit('document/addToDocumentSubmitStore', {
                        key: 'listRootControlRunFormulaManually',
                        value: this.listRootControlRunFormulaManually,
                        instance: this.keyInstance
                    });
                    this.runAllFormulaManually();
                }
            }
        },
        runAllFormulaManually(){
            this.$store.commit('document/addToDocumentSubmitStore', {
                key: 'isRunningAllFormulaManually',
                value: true,
                instance: this.keyInstance
            });

            if(this.listDataRootControlRunFormulaManually.length > 0){
                let control = this.listDataRootControlRunFormulaManually.pop();
                this.runFormulaManuallyControl(control);
            }else {
                afterRunRootControlManually(this.listRootControlRunFormulaManually, this.keyInstance);
                this.listDataRootControlRunFormulaManually = Object.keys(this.listRootControlRunFormulaManually);
            }
        },
        // xử lý sau khi chạy thủ công công thức giá trị của 1 control
        afterRunFormulasControlManually(controlName){
            $('#sym-submit-' + this.keyInstance).find(`[control-name=`+controlName+`]`).find('.document-submit-button-run-formula-manually').removeClass('symper-rotating');
        },
        /**
         * đệ quy lấy thứ tự thực hiện chạy công thức của control
         */
        getRelated(list, controlName, impactedFieldsList) {
            let controlEffected = impactedFieldsList[controlName];
            for (let controlEffName in controlEffected) {
                if (list.includes(controlEffName)) {
                    continue;
                }
                let controlEff = getControlInstanceFromStore(
                    this.keyInstance,
                    controlEffName
                );
                let formulaIns = controlEff.getFormulaInstance('formulas');
                if (formulaIns != false) {
                    let formulaInput = formulaIns.getInputControl();
                    let check = false;
                    for (let control in formulaInput) {
                        if (list.includes(control)) {
                            check = true;
                        } else {
                            check = false;
                        }
                    }
                    if (check) {
                        list.push(controlEffName);
                        this.getRelated(
                            list,
                            controlEffName,
                            impactedFieldsList
                        );
                    }
                }
            }
        },
        /**
         * Lưu thông tin liên quan đến luồng chạy công thức và các thông tin về các control root(ko bị ảnh hưởng bởi control nào)
         */

        pushDataRootToStore(impactedFieldsList, impactedFieldsListWhenStart) {
            this.$store.commit('document/addToDocumentSubmitStore', {
                key: 'impactedFieldsList',
                value: impactedFieldsList,
                instance: this.keyInstance
            });
            this.$store.commit('document/addToDocumentSubmitStore', {
                key: 'impactedFieldsListWhenStart',
                value: impactedFieldsListWhenStart,
                instance: this.keyInstance
            });
        },
        /**
         * Sự kiện phát ra khi click vào áp dụng của date time picker
         */
        afterSelectDateTime(data) {
            let controlName = data.inputForcusing;
            let dateTime = data.dateTime;
            this.setDataForDateTimeControl(controlName, dateTime);
        },
        setDataForDateTimeControl(controlName, data) {
            this.$refs.datePicker.closePicker();
            let controlInstance = getControlInstanceFromStore(
                this.keyInstance,
                controlName
            );
            if (controlInstance.inTable == false) {
                this.handleInputChangeBySystem(controlName, data);
            } else {
                let tableControl = getControlInstanceFromStore(
                    this.keyInstance,
                    controlInstance.inTable
                );
                let currentCell = tableControl.tableInstance.getFocusedCell();
                let currentRow =
                    tableControl.tableInstance.getDisplayedRowAtIndex(
                        currentCell.rowIndex
                    );
                if (currentCell.column.colId == 'ag-Grid-AutoColumn') {
                    tableControl.tableInstance.setDataAtCell(
                        controlInstance.name,
                        data,
                        currentRow,
                        true
                    );
                } else {
                    tableControl.tableInstance.setDataAtCell(
                        currentCell.column.colDef.field,
                        data,
                        currentRow.id
                    );
                }
                tableControl.tableInstance.setFocusedCell(
                    currentCell.rowIndex,
                    currentCell.column.colDef.field
                );
            }
        },
        /**
         * Hàm mở sub-form submit
         */
        openSubFormSubmit() {
            this.$refs.symDragPanel.$children[1].$refs.autocompleteInput.hide();
            this.$refs.symDragPanel.show();
        },
        handlerDraftClick() {
            this.isSubmitting = true;
            let thisCpn = this;
            let dataPost = this.getDataPostSubmit();
            dataPost['documentId'] = this.documentId;
            documentApi
                .submitDraftDocument(dataPost)
                .then((res) => {
                    thisCpn.isSubmitting = false;
                    if (res.status == 200) {
                        thisCpn.$snotify({
                            type: 'success',
                            title: thisCpn.$t('v2.doc.submitDragSuccess')
                        });
                        thisCpn.$router.push(
                            '/documents/' +
                                thisCpn.documentId +
                                '/draft-objects'
                        );
                    } else {
                        thisCpn.$snotify({
                            type: 'error',
                            title: res.message
                        });
                    }
                })
                .catch((err) => {
                    console.warn(err);
                    thisCpn.$snotify({
                        type: 'error',
                        title: thisCpn.$t('v2.doc.errorFromSubmitApi')
                    });
                })
                .finally(() => {});
        },
        /**
         * CLick submit doc thì kiểm tra validate
         */
        handlerSubmitDocumentClick(isContinueSubmit = false) {
            this.isContinueSubmit = isContinueSubmit;
            let validateBeforeSubmit = {};
            let listTableRowNodeId = {};
            let listInput = getListInputInDocument(this.keyInstance);
            for (let controlName in listInput) {
                let controlIns = listInput[controlName];
                for (
                    let i = 0;
                    i < controlIns.validateMessageType.length;
                    i++
                ) {
                    if (
                        !listTableRowNodeId[controlIns.inTable] &&
                        controlIns.inTable != false
                    ) {
                        let tableIns = getControlInstanceFromStore(
                            this.keyInstance,
                            controlIns.inTable
                        );
                        listTableRowNodeId[controlIns.inTable] =
                            tableIns.tableInstance.getAllRowNodeId();
                    }
                    const type = controlIns.validateMessageType[i];
                    for (let validateItem in controlIns.valueValidation[type]) {
                        if (controlIns.valueValidation[type]) {
                            let validate =
                                controlIns.valueValidation[type][validateItem];
                            if (
                                validate.isValid &&
                                !validateItem.includes('row-group')
                            ) {
                                if (
                                    controlIns.inTable &&
                                    !listTableRowNodeId[controlIns.inTable]
                                ) {
                                    continue;
                                }
                                if (
                                    controlIns.inTable &&
                                    listTableRowNodeId[controlIns.inTable] &&
                                    !listTableRowNodeId[
                                        controlIns.inTable
                                    ].includes(validateItem)
                                ) {
                                    continue;
                                }
                                if (
                                    controlIns.controlProperties.isHidden
                                        .value == 1
                                ) {
                                    continue;
                                }
                                validateBeforeSubmit[controlName] =
                                    type +
                                    ' - <font color="red">' +
                                    validate.msg +
                                    '</font>';
                            }
                        }
                    }
                }
            }
            if (Object.keys(validateBeforeSubmit).length == 0) {
                if(this.handleRefreshDataBeforeSubmit()){
                    if (this.viewType == 'submit' || this.isCloneType) {
                        this.submitDocument();
                    } else {
                        this.updateDocumentObject();
                    } 
                }
            } else {
                let controlError = $(
                    '#sym-submit-' + this.keyInstance + ' .error'
                );
                let listErr = [];

                $.each(controlError, function (k, v) {
                    let message = $(v).attr('valid');
                    listErr.push(message);
                });
                for (let control in validateBeforeSubmit) {
                    listErr.push(
                        control + ' : ' + validateBeforeSubmit[control]
                    );
                }
                this.$emit('submit-document-error');
                this.listMessageErr = listErr;
                this.$refs.errMessage.showDialog();
            }
        },

        /**
         * lấy data để chạy công thức trên server
         */
        getDataForRunFormulaOnServer() {
            let dataInputFormula = {};
            let listInput = getListInputInDocument(this.keyInstance);
            if (
                this.objectIdentifier &&
                Object.keys(this.objectIdentifier).length > 0
            ) {
                let controlNameIdentifier = this.objectIdentifier['name'];
                let controlInstance = getControlInstanceFromStore(
                    this.keyInstance,
                    controlNameIdentifier
                );
                if (
                    controlInstance != false &&
                    controlInstance.controlFormulas.hasOwnProperty('formulas')
                ) {
                    let formulaInstance =
                        controlInstance.controlFormulas['formulas']['instance'];
                    if (formulaInstance) {
                        let dataInput = getDataInputFormula(
                            formulaInstance,
                            listInput,
                            null,
                            null,
                            {},
                            controlInstance.name
                        );
                        dataInputFormula['dataInputIdentifier'] = dataInput;
                    }
                }
            }

            if (this.titleObjectFormula != null) {
                let dataInput = getDataInputFormula(
                    this.titleObjectFormula,
                    listInput
                );
                dataInputFormula['dataInputTitle'] = dataInput;
            }
            this.startSubmitDocument(dataInputFormula);
        },

        handleRefreshDataBeforeSubmit() {
            this.$store.commit('document/addToDocumentSubmitStore', {
                key: 'docStatus',
                value: 'beforeSubmit',
                instance: this.keyInstance
            });
            if (
                this.otherInfo.hasOwnProperty('refreshControl') &&
                this.otherInfo.refreshControl.length > 0
            ) {
                let refreshControl = this.otherInfo.refreshControl;
                let dataImpactedControlRefresh = {};
                for (let index = 0; index < refreshControl.length; index++) {
                    let controlName = refreshControl[index];
                    let controlInstance = getControlInstanceFromStore(
                        this.keyInstance,
                        controlName
                    );
                    let dataImpactedControl = controlInstance.getEffectedControl();
                    let newMap = {}
                    for (let control in dataImpactedControl) {
                        if ((this.listDocumentIdentifierControl[control] && this.listDocumentIdentifierControl[control].checkProps('isChangeUpdate')) || !this.listDocumentIdentifierControl[control]) {
                            newMap[control] = false;
                        }
                    }
                    dataImpactedControlRefresh[controlName] = newMap;
                }

                this.$store.commit('document/addToDocumentSubmitStore', {
                    key: 'dataImpactedControlRefresh',
                    value: dataImpactedControlRefresh,
                    instance: this.keyInstance
                });
                let checkRun = false;
                for (let index = 0; index < refreshControl.length; index++) {
                    let controlName = refreshControl[index];
                    let controlInstance = getControlInstanceFromStore(
                        this.keyInstance,
                        controlName
                    );
                    if (
                        !controlInstance.controlFormulas.hasOwnProperty(
                            'formulas'
                        )
                    ) {
                        continue;
                    }
                    checkRun = true;
                    let formulas =
                        controlInstance.controlFormulas.formulas.instance;
                    this.handlerBeforeRunFormulasValue(
                        formulas,
                        controlName,
                        'formulas'
                    );
                }
                if (checkRun == false) {
                    return true;
                }
            } else {
                return true;
            }
            return false;
        },
        /**
         * Hàm gọi api submit document
         */
        async submitDocument() {
            this.isSubmitting = true;
            this.getDataForRunFormulaOnServer();
        },
        resetCheckRefreshData() {
            this.$store.commit('document/addToDocumentSubmitStore', {
                key: 'readySubmit',
                value: false,
                instance: this.keyInstance
            });
        },
        // tiếp tục chạy submit với 2 trường hợp: sau khi chọn xóa dòng trống rồi submit hoặc để như cũ và submit
        continueSubmit() {
            let dataPost = this.getDataPostSubmit();
            if (this.dataPost['dataInputFormulas']) {
                dataPost['dataInputFormulas'] =
                    this.dataPost['dataInputFormulas'];
            }
            dataPost['documentId'] = this.documentId;
            if (this.viewType == 'submit' || this.isCloneType) {
                this.callApiSubmit(dataPost);
            } else {
                dataPost = this.dataPost;
                this.sendApiUpdateDocument(dataPost);
            }
        },
        startSubmitDocument(dataInputFormulas = {}) {
            let dataPost = this.getDataPostSubmit();
            dataPost['documentId'] = this.documentId;
            if (Object.keys(dataInputFormulas).length > 0) {
                dataPost['dataInputFormulas'] = dataInputFormulas;
            }
            this.dataPost = dataPost;
            if (this.hasEmptyRow) {
                this.symperDialogType = 'emptyRow';
                this.isShowSymperDialog = true;
            } else {
                this.callApiSubmit(dataPost);
            }
        },
        // xóa dòng trống trong table
        deleteEmptyRow() {
            this.emptyRow.map((row) => {
                let controlName = row.tableName;
                let controlIns =
                    this.sDocumentSubmit.listInputInDocument[controlName];
                let sqlRowId = [];
                row.value.map((cell) => {
                    if (cell.s_table_id_sql_lite) {
                        sqlRowId.push('"' + cell.s_table_id_sql_lite + '"');
                    }
                });
                sqlRowId = sqlRowId.join(',');
                controlIns.tableInstance.deleteRow(row.value, sqlRowId);
            });
            this.isShowSymperDialog = false;
            this.hasEmptyRow = false;
            this.continueSubmit();
        },
        hideSymperDialog() {
            this.isSubmitting = false;
            this.isShowSymperDialog = false;
        },
        // ấn hủy chọn xóa dòng trống trong table và submit luôn
        disproveDeleteRow() {
            this.isShowSymperDialog = false;
            if (this.viewType == 'submit' || this.isCloneType) {
                this.callApiSubmit(this.dataPost);
            } else {
                this.sendApiUpdateDocument(this.dataPost);
            }
        },
        async callApiSubmit(dataPost) {
            let thisCpn = this;
            if (this.appId) {
                dataPost['appId'] = this.appId;
            } else {
                if (
                    this.$route.params.extraData &&
                    this.$route.params.extraData.appId
                ) {
                    dataPost['appId'] = this.$route.params.extraData.appId;
                }
            }
            dataPost['dataInputFormulas'] = JSON.stringify(
                dataPost['dataInputFormulas']
            );
            let hiddenControls = this.getHiddenControls();
            let readOnlyControls = this.getReadOnlyControls();
            let listInputFilters = this.listControlInputFilters;
            let departmentData = this.departmentControl.mapData;
            let documentInstanceIdentifier =
                this.getDocumentInstanceIdentifierControl();
            dataPost['otherData'] = JSON.stringify({
                hiddenControls: hiddenControls,
                readOnlyControls: readOnlyControls,
                documentInstanceIdentifier: documentInstanceIdentifier,
                listInputFilters: listInputFilters,
                departmentData: departmentData
            });
            if (this.awaitGetDataForSubmitFunc) {
                this.awaitGetDataForSubmitFunc('submit', dataPost);
                return;
            }
            documentApi
                .submitDocument(dataPost)
                .then((res) => {
                    if (
                        res.error &&
                        res.error.parent != '' &&
                        res.error.parent != null
                    ) {
                        console.log(res.error, 'err');
                        thisCpn.$snotify({
                            type: 'error',
                            title: res.error.parent
                        });
                    }
                    if (
                        res.error &&
                        res.error.child != '' &&
                        res.error.child != null
                    ) {
                        console.log(res.error, 'err');
                        thisCpn.$snotify({
                            type: 'error',
                            title: res.error.child
                        });
                    }
                    if (res.status == 200) {
                        let dataResponSubmit = res.data;
                        dataResponSubmit[
                            'document_object_user_created_fullname'
                        ] = thisCpn.endUserInfo.id;
                        dataResponSubmit['isContinueSubmit'] =
                            thisCpn.isContinueSubmit;

                        thisCpn.$emit(
                            'submit-document-success',
                            dataResponSubmit
                        );
                        thisCpn.isSubmitting = false;
                        if (thisCpn.showSnackbarSuccess) {
                            thisCpn.$snotify({
                                type: 'success',
                                title: thisCpn.$t('v2.doc.submitDocumentSuccess')
                            });
                        }
                        // nếu có công thức nút submit
                        thisCpn.optionalDataBinding['document_object_id'] =
                            dataResponSubmit.document_object_id;
                        if (
                            thisCpn.sDocumentSubmit.submitFormulas != undefined
                        ) {
                            let dataInput = getDataInputFormula(
                                thisCpn.sDocumentSubmit.submitFormulas,
                                thisCpn.sDocumentSubmit.listInputInDocument,
                                thisCpn.optionalDataBinding,
                                'all'
                            );
                            thisCpn.sDocumentSubmit.submitFormulas.handleBeforeRunFormulas(
                                dataInput
                            );
                        }
                        thisCpn.closeFormulasWorker();
                        // nếu submit từ form sub submit thì ko rediect trang
                        // mà tìm giá trị của control cần được bind lại giá trị từ emit dataResponSubmit
                        if (
                            (thisCpn.$getRouteName() == 'submitDocument' &&
                                thisCpn.$route.params.id ==
                                    thisCpn.documentId) ||
                            (this.isCloneType && !this.isViewPopup)
                        ) {
                            thisCpn.$router.push(
                                '/documents/' + thisCpn.documentId + '/objects'
                            );
                        }
                    } else {
                        thisCpn.$emit('submit-document-error');
                        thisCpn.$snotify({
                            type: 'error',
                            title: res.message
                        });
                        thisCpn.resetCheckRefreshData();
                    }
                })
                .catch((err) => {
                    thisCpn.$emit('submit-document-error');
                    thisCpn.$snotify({
                        type: 'error',
                        title: thisCpn.$t('v2.doc.errorFromSubmitApi')
                    });
                    thisCpn.resetCheckRefreshData();
                    thisCpn.isSubmitting = false;
                })
                .finally(() => {});
        },
        /**
         * Hàm lấy thông tin các control hidden phục vụ cho việc ẩn trong view detail
         */
        getHiddenControls() {
            let listInput = getListInputInDocument(this.keyInstance);
            let listControlHidden = [];
            for (let controlName in listInput) {
                let control = listInput[controlName];
                if (control.hidden) {
                    listControlHidden.push(controlName);
                }
            }
            return listControlHidden;
        },
        /**
         * Hàm lấy danh sách các control ở trạng thái readonly để lưu lại cho update
         */
        getReadOnlyControls() {
            return this.sDocumentSubmit['readOnlyControls'];
        },
        /**
         * Call Api cập nhật bản ghi
         */
        sendApiUpdateDocument(dataPost) {
            const thisCpn = this;
            if (this.awaitGetDataForSubmitFunc) {
                dataPost.documentObjectId = this.docObjId;
                this.awaitGetDataForSubmitFunc('update', dataPost);
                return;
            }
            documentApi
                .updateDocument(this.docObjId, dataPost)
                .then((res) => {
                    thisCpn.$emit('submit-document-success', res.data);
                    thisCpn.isSubmitting = false;
                    if (
                        res.error &&
                        res.error.parent != '' &&
                        res.error.parent != null
                    ) {
                        console.log(res.error, 'err');
                        thisCpn.$snotify({
                            type: 'error',
                            title: res.error.parent
                        });
                    }
                    if (
                        res.error &&
                        res.error.child != '' &&
                        res.error.child != null
                    ) {
                        console.log(res.error, 'err');
                        thisCpn.$snotify({
                            type: 'error',
                            title: res.error.child
                        });
                    }
                    if (res.status == 200) {
                        if (thisCpn.showSnackbarSuccess) {
                            thisCpn.$snotify({
                                type: 'success',
                                title: thisCpn.$t('v2.doc.updateDocumentSuccess')
                            });
                        }
                        if (
                            thisCpn.sDocumentSubmit.updateFormulas != undefined
                        ) {
                            let dataInput = getDataInputFormula(
                                thisCpn.sDocumentSubmit.updateFormulas,
                                thisCpn.sDocumentSubmit.listInputInDocument,
                                thisCpn.optionalDataBinding
                            );
                            thisCpn.sDocumentSubmit.updateFormulas.handleBeforeRunFormulas(
                                dataInput
                            );
                        }
                        thisCpn.closeFormulasWorker();
                        if (
                            thisCpn.$getRouteName() == 'updateDocumentObject' &&
                            !thisCpn.isViewPopup
                        )
                            thisCpn.$router.push(
                                '/documents/' + thisCpn.documentId + '/objects'
                            );
                    } else {
                        thisCpn.$snotify({
                            type: 'error',
                            title: res.message
                        });
                    }
                })
                .catch((err) => {
                    thisCpn.$snotify({
                        type: 'error',
                        title: thisCpn.$t('v2.doc.errorFromUpdateApi')
                    });
                })
                .finally(() => {});
        },
        /**
         * Xử lí datapost trước khi call api update bản ghi
         */
        updateDocumentObject() {
            this.isSubmitting = true;
            let dataPost = this.getDataPostSubmit();
            dataPost['documentId'] = this.documentId;
            if (this.isDraft == 1) {
                dataPost['isDraft'] = true;
            }
            let hiddenControls = this.getHiddenControls();
            let readOnlyControls = this.getReadOnlyControls();
            let documentInstanceIdentifier =
                this.getDocumentInstanceIdentifierControl();
            let departmentData = this.departmentControl.mapData;
            let listInputFilters = this.listControlInputFilters;
            dataPost['otherData'] = JSON.stringify({
                hiddenControls: hiddenControls,
                readOnlyControls: readOnlyControls,
                documentInstanceIdentifier: documentInstanceIdentifier,
                listInputFilters: listInputFilters,
                departmentData: departmentData
            });
            this.dataPost = dataPost;
            if (this.hasEmptyRow) {
                this.symperDialogType = 'emptyRow';
                this.isShowSymperDialog = true;
            } else {
                this.sendApiUpdateDocument(dataPost);
            }
        },

        /**
         * Hàm lấy tất cả giá trị của doc cho submit dạng {field_${id}:value}
         */
        getDataPostSubmit() {
            let listInput = this.sDocumentSubmit.listInputInDocument;
            let newDataPost = {};
            let dataControl = {};
            for (let controlName in listInput) {
                let controlIns = listInput[controlName];
                if (controlIns.inTable != false) {
                    continue;
                }
                if (
                    !controlIns.checkProps('isSaveToDB') &&
                    controlIns.type != 'dataFlow'
                ) {
                    continue;
                }
                if (controlIns.type == 'table') {
                    let emptyRow = controlIns.tableInstance.getRowEmpty();
                    let tableName = controlIns.tableInstance.tableName;
                    this.emptyRow.push({
                        tableName: tableName,
                        value: emptyRow
                    });
                    if (emptyRow.length > 0) {
                        this.hasEmptyRow = true;
                    }
                    let value = controlIns.tableInstance.getDataSubmit(
                        this.dataDeleteRowTableConfig
                    );
                    if (value[controlName] != false) {
                        Object.assign(dataControl, value);
                    }
                } else {
                    if (!listControlNotNameProp.includes(controlIns.type)) {
                        let value = controlIns.value;
                        if (controlIns.type == 'number') {
                            value =
                                controlIns.value === '' ? '' : controlIns.value;
                        } else if (controlIns.type == 'percent') {
                            value =
                                controlIns.value === ''
                                    ? 0
                                    : controlIns.value / 100;
                        } else if (controlIns.type == 'department') {
                            if (controlIns.selectedId) {
                                value = controlIns.selectedId;
                            } else {
                                value = controlIns.value;
                            }
                        } else if (controlIns.type == 'location') {
                            if (value) value = JSON.stringify(controlIns.value);
                        } else if (
                            controlIns.checkEmptyFormulas('autocomplete')
                        ) {
                            if (controlIns.inputValue) {
                                value = controlIns.inputValue;
                            } else {
                                value = controlIns.value;
                            }
                        }
                        dataControl[controlName] = value;
                        if (controlIns.type == 'checkbox') {
                            dataControl[controlName] =
                                value == true || value == '1' ? 1 : 0;
                        }
                        if (controlIns.type == 'fileUpload') {
                            dataControl[controlName] = JSON.stringify(value);
                        }
                        if (
                            controlIns.type == 'richText' &&
                            controlIns.editor
                        ) {
                            dataControl[controlName] = str.decodeHTMLEntities(
                                controlIns.editor.getContent(),
                                false
                            );
                        }
                    }
                }
            }
            // return
            newDataPost['documentObjectWorkflowObjectId'] =
                this.documentObjectWorkflowObjectId;
            newDataPost['documentObjectWorkflowId'] =
                this.documentObjectWorkflowId;
            newDataPost['documentObjectTaskId'] = this.documentObjectTaskId;
            newDataPost['dataControl'] = JSON.stringify(dataControl);
            return newDataPost;
        },

        // hàm kiểm tra xem có control SCT không
        getDocumentInstanceIdentifierControl() {
            let allDocumentInstanceIdentifier = [];
            for (let controlName in this.listDocumentIdentifierControl) {
                let controlIns =
                    this.listDocumentIdentifierControl[controlName];
                if (
                    !controlIns.checkProps('isChangeUpdate') &&
                    this.viewType == 'update' && !this.isCloneType
                ) {
                    continue;
                }
                if (controlIns.value != controlIns.originValue) {
                    let documentInstanceIdentifier = [];
                    let numberStart =
                        controlIns.controlProperties.startNumber.value;
                    let totalNumber = Number(
                        controlIns.controlProperties.totalNumber.value
                    );
                    let prefix = controlIns.prefixDocInstanceIdentifier
                        ? controlIns.prefixDocInstanceIdentifier
                        : '';
                    let suffix = controlIns.suffixDocInstanceIdentifier
                        ? controlIns.suffixDocInstanceIdentifier
                        : '';
                    documentInstanceIdentifier.push(
                        controlName,
                        prefix,
                        suffix,
                        totalNumber,
                        numberStart
                    );
                    allDocumentInstanceIdentifier.push(
                        documentInstanceIdentifier
                    );
                }
            }
            return allDocumentInstanceIdentifier;
        },
        /**
         * Hàm lấy dữ liệu của table dạng colName : ['a',"b","c"]
         */
        getDataTableInput(tableControl) {
            let listInput = this.sDocumentSubmit.listInputInDocument;
            let indexCol = tableControl.tableInstance.colName2Idx;
            let dataTable = {};
            let dataControlInTable = {};
            let columnObjectIdIndex =
                tableControl.tableInstance.getColumnIndexFromControlName(
                    'childObjectId'
                );
            let dataColObjectId =
                tableControl.tableInstance.tableInstance.getDataAtCol(
                    columnObjectIdIndex
                );
            if (tableControl.tableInstance.tableHasRowSum == true)
                dataColObjectId.pop();
            dataControlInTable['child_object_id'] = dataColObjectId;
            for (let i in indexCol) {
                if (!listInput[i].checkProps('isSaveToDB')) {
                    continue;
                }
                let dataCol =
                    tableControl.tableInstance.tableInstance.getDataAtCol(
                        indexCol[i]
                    );
                // cần xóa phần tử dòng cuối dùng là row enter mặc định ko có dữ liệu
                if (tableControl.tableInstance.tableHasRowSum == true)
                    dataCol.pop();
                if (listInput[i].type == 'fileUpload') {
                    dataCol = listInput[i].value;
                }
                if (listInput[i].type == 'number') {
                    for (let index = 0; index < dataCol.length; index++) {
                        const element = dataCol[index];
                        if (isNaN(Number(element))) {
                            dataCol[index] = 0;
                        } else {
                            dataCol[index] = Number(element);
                        }
                    }
                }
                if (listInput[i].type == 'date') {
                    for (let index = 0; index < dataCol.length; index++) {
                        let rowValue = dataCol[index];
                        let f = listInput[i].getDateTimeFormat();
                        if (rowValue != '' && rowValue != null && f != '') {
                            let newValue = this.$moment(rowValue, f).format(
                                'YYYY-MM-DD'
                            );
                            dataCol[index] = newValue;
                        }
                    }
                }
                if (listInput[i].type == 'dateTime') {
                    for (let index = 0; index < dataCol.length; index++) {
                        let rowValue = dataCol[index];
                        let f = listInput[i].getDateTimeFormat();
                        if (rowValue != '' && rowValue != null && f != '') {
                            let newValue = this.$moment(rowValue, f).format(
                                'YYYY-MM-DD HH:mm:ss'
                            );
                            dataCol[index] = newValue;
                        }
                    }
                }
                if (listInput[i].type == 'user') {
                    for (let index = 0; index < dataCol.length; index++) {
                        const element = dataCol[index];
                        if (!/[0-9]/.test(element)) {
                            dataCol[index] = 0;
                        }
                    }
                }
                dataControlInTable[i] = dataCol;
            }
            dataTable[tableControl.name] = dataControlInTable;
            return dataTable;
        },
        /**
         * Sửa control object trong store
         */
        updateListInputInDocument(controlName, key, value) {
            let controlIns = getControlInstanceFromStore(
                this.keyInstance,
                controlName
            );
            let controlToWorker = {
                name: controlName,
                type: controlIns.type,
                value: controlIns.value
            };
            this.formulasWorker.postMessage({
                action: 'updateWorkerStore',
                data: {
                    controlIns: controlToWorker,
                    keyInstance: this.keyInstance,
                    type: 'submit'
                }
            });
            this.$store.commit('document/updateListInputInDocument', {
                controlName: controlName,
                key: key,
                value: value,
                instance: this.keyInstance
            });
        },
        /**
         * Thêm control object vào store
         */
        addToListInputInDocument(name, control) {
            this.$store.commit('document/addToListInputInDocument', {
                name: name,
                control: control,
                instance: this.keyInstance
            });
            let controlToWorker = {
                name: control.name,
                type: control.type,
                value: control.value
            };
            this.formulasWorker.postMessage({
                action: 'updateWorkerStore',
                data: {
                    controlIns: controlToWorker,
                    keyInstance: this.keyInstance,
                    type: 'submit'
                }
            });
        },
        /**
         * chạy công thức input filter
         */
        runInputFilterFormulas(controlName, search = '') {
            let controlInstance =
                this.sDocumentSubmit.listInputInDocument[controlName];
            let allFormulas = controlInstance.controlFormulas;
            if (allFormulas.hasOwnProperty('list')) {
                if (allFormulas['list'].hasOwnProperty('instance')) {
                    let formulaInstance = allFormulas['list'].instance;
                    this.optionalDataBinding = {
                        ...this.optionalDataBinding,
                        ...{ search_value: search }
                    };
                    // if(!controlInstance.isRunFormula){//
                    this.handlerBeforeRunFormulasValue(
                        formulaInstance,
                        controlName,
                        'list',
                        'inputFilter'
                    );
                    // }else{// chạy luôn công thức nếu đã gọi trước rồi
                    //     let res = controlInstance.dataRunFormulas;
                    //     this.handleRunFormulasInputFilter(controlInstance, res)
                    // }
                }
            }
        },

        /**
         * hàm được gọi khi input change, lấy ra các instance của control bị ảnh hưởng và chạy công thức cho các control đó
         * nếu có insideTableInDoc thì công thức từ nội bộ của bảng
         */
        handleControlInputChange(controlInstance) {
            let controlName = controlInstance.name;
            if (controlInstance.checkValidValueLength()) {
                let controlUnique = checkControlPropertyProp(
                    this.keyInstance,
                    controlName,
                    'isDBOnly'
                );
                if (controlUnique != false) {
                    this.handlerBeforeRunFormulasValue(
                        controlUnique.controlFormulas.uniqueDB.instance,
                        controlUnique.name,
                        'uniqueDB'
                    );
                }
                let controlEffected = controlInstance.getEffectedControl();
                let controlHiddenEffected =
                    controlInstance.getEffectedHiddenControl();
                let controlReadonlyEffected =
                    controlInstance.getEffectedReadonlyControl();
                let controlRequireEffected =
                    controlInstance.getEffectedRequireControl();
                let controlLinkEffected = controlInstance.getEffectedLinkControl();
                // let controlDepartmentEffected =
                //     controlInstance.getEffectedDepartmentControl();
                let controlValidateEffected =
                    controlInstance.getEffectedValidateControl();
                let controlMinDateEffected =
                    controlInstance.getEffectedMinDateControl();
                let controlMaxDateEffected =
                    controlInstance.getEffectedMaxDateControl();
                let effectedSuffixDocInstanceIdentifier =
                    controlInstance.geteffectedSuffixDocInstanceIdentifier();
                let effectedPrefixDocInstanceIdentifier =
                    controlInstance.geteffectedPrefixDocInstanceIdentifier();
                let effectedActiveManualLocation =
                    controlInstance.geteffectedActiveManualLocation();
                let effectedActiveAutomaticLocation =
                    controlInstance.geteffectedActiveAutomaticLocation();
                controlRequireEffected[controlName] = true;
                controlHiddenEffected[controlName] = true;
                controlReadonlyEffected[controlName] = true;
                controlValidateEffected[controlName] = true;
                this.runFormulasControlEffected(controlEffected);
                this.runOtherFormulasEffected(controlHiddenEffected, 'hidden');
                this.runOtherFormulasEffected(
                    controlReadonlyEffected,
                    'readOnly'
                );
                // this.runOtherFormulasEffected(
                //     controlDepartmentEffected,
                //     'department',
                // );
                this.runOtherFormulasEffected(
                    controlRequireEffected,
                    'require'
                );
                this.runOtherFormulasEffected(controlLinkEffected,'linkConfig');
                this.runOtherFormulasEffected(
                    controlValidateEffected,
                    'validate'
                );
                this.runOtherFormulasEffected(
                    controlMinDateEffected,
                    'minDate'
                );
                this.runOtherFormulasEffected(
                    controlMaxDateEffected,
                    'maxDate'
                );
                this.runOtherFormulasEffected(
                    effectedPrefixDocInstanceIdentifier,
                    'prefixDocInstanceIdentifier'
                );
                this.runOtherFormulasEffected(
                    effectedSuffixDocInstanceIdentifier,
                    'suffixDocInstanceIdentifier'
                );
                this.runOtherFormulasEffected(
                    effectedActiveManualLocation,
                    'activeManualLocation'
                );
                this.runOtherFormulasEffected(
                    effectedActiveAutomaticLocation,
                    'activeAutomaticLocation'
                );
            }
        },
        /**
         * Hàm xử lí duyêt các control bị ảnh hưởng trong 1 công thức bởi 1 control nào đó và thực hiện chạy các công thức của control đó
         */
        runFormulasControlEffected(controlEffected) {
            if (Object.keys(controlEffected).length > 0) {
                for (let i in controlEffected) {
                    let controlEffectedInstance = getControlInstanceFromStore(this.keyInstance, i);
                    if (checkCanBeBind(this.keyInstance, i) && (!controlEffectedInstance.checkProps('isRunFormulaManually') || this.isRunningAllFormulaManually)) {
                        let allFormulas =
                            controlEffectedInstance.controlFormulas;
                        if (allFormulas.hasOwnProperty('formulas')) {
                            if (
                                allFormulas['formulas'].hasOwnProperty(
                                    'instance'
                                )
                            ) {
                                let formulaInstance =
                                    allFormulas['formulas'].instance;
                                if (formulaInstance.getFormulas() != '') {
                                    this.handlerBeforeRunFormulasValue(
                                        formulaInstance,
                                        i,
                                        'formulas'
                                    );
                                }
                            }
                        }
                    }
                }
            }
        },
        /**
         * Hàm xử lí duyêt các control bị ảnh hưởng trong 1 công thức bởi 1 control nào đó và thực hiện chạy các công thức của control đó
         */
        runOtherFormulasEffected(controlEffected, formulaType) {
            if (Object.keys(controlEffected).length > 0) {
                for (let i in controlEffected) {
                    let controlEffectedInstance =
                        this.sDocumentSubmit.listInputInDocument[i];
                    if (
                        [
                            'prefixDocInstanceIdentifier',
                            'suffixDocInstanceIdentifier'
                        ].includes(formulaType)
                    ) {
                        if (
                            (!checkCanBeBind(this.keyInstance, i, formulaType) ||
                            (!controlEffectedInstance.checkProps(
                                'isChangeUpdate'
                            ) &&
                                this.viewType == 'update' &&
                                !this.isCloneType)) && (!controlEffectedInstance.checkProps('isRunFormulaManually') || this.isRunningAllFormulaManually)
                        ) {
                            continue;
                        }
                    }
                    if (
                        formulaType == 'validate' && controlEffectedInstance.checkProps('isRequired') && !controlEffectedInstance.value
                    ) {
                        continue;
                    }
                    let allFormulas = controlEffectedInstance.controlFormulas;
                    if (allFormulas.hasOwnProperty(formulaType)) {
                        if (formulaType == 'linkConfig') {
                            // nếu có cấu hình công thức link thì cũng chạy các công thức của nó
                            let configData =
                                allFormulas[formulaType].configData;
                            for (let ind = 0; ind < configData.length; ind++) {
                                let config = configData[ind];
                                let formulaInstance = config.instance;
                                this.handlerBeforeRunFormulasValue(
                                    formulaInstance,
                                    i,
                                    formulaType
                                );
                            }
                        } else {
                            if (
                                allFormulas[formulaType].hasOwnProperty(
                                    'instance'
                                )
                            ) {
                                let formulaInstance =
                                    allFormulas[formulaType].instance;
                                if (formulaInstance.getFormulas() != '') {
                                    this.handlerBeforeRunFormulasValue(
                                        formulaInstance,
                                        i,
                                        formulaType
                                    );
                                }
                            }
                        }
                    }
                }
            }
        },
        /**
         * Xử lí call qua formulas object để chạy công thức
         */
        handlerBeforeRunFormulasValue(
            formulaInstance,
            controlName,
            formulaType,
            from = false
        ) {
            const self = this;
            let control = getControlInstanceFromStore(
                this.keyInstance,
                controlName
            );
            let dataInput = getDataInputFormula(
                formulaInstance,
                this.sDocumentSubmit.listInputInDocument,
                this.optionalDataBinding,
                'all',
                {},
                controlName
            );
            if (from == 'inputFilter') {
                dataInput['search_value'] =
                    this.optionalDataBinding['search_value'];
                control.isRunFormula = true;
            }
            if (
                checkDataInputChange(
                    this.sDocumentSubmit.rootChangeFieldName,
                    this.sDocumentSubmit.dataInputBeforeChange,
                    dataInput
                )
            ) {
                if (
                    control.inTable != false &&
                    !control.isInputFilter &&
                    control.type != 'department'
                ) {
                    let tableControl = getControlInstanceFromStore(
                        this.keyInstance,
                        control.inTable
                    );
                    let typeSelected = 'all';
                    if (from == 'inputFilter') {
                        let currentCell =
                            tableControl.tableInstance.getFocusedCell();
                        let rowIndex = currentCell.rowIndex;
                        typeSelected = [rowIndex];
                    }
                    tableControl.tableInstance.handleRunFormulaForControlInTable(
                        control,
                        formulaInstance,
                        typeSelected,
                        null,
                        {
                            search_value:
                                this.optionalDataBinding['search_value']
                        }
                    );
                } else {
                    // check ảnh hưởng dataflow
                    Object.keys(dataInput).map((controlName) => {
                        if (
                            self.sDocumentSubmit.listInputInDocument[
                                controlName
                            ] &&
                            self.sDocumentSubmit.listInputInDocument[
                                controlName
                            ].type == 'dataFlow'
                        ) {
                            dataInput[controlName] =
                                self.sDocumentSubmit.listInputInDocument[
                                    controlName
                                ].tableTempDataflow;
                        }
                    });
                    //nếu control ảnh hưởng
                    this.formulasWorker.postMessage({
                        action: 'runFormula',
                        data: {
                            formulaInstance: formulaInstance,
                            dataInput: dataInput,
                            controlName: controlName,
                            keyInstance: this.keyInstance
                        }
                    });
                }
            } else {
                if (formulaType == 'formulas') {
                    markBinedField(this.keyInstance, controlName);
                    this.handleControlInputChange(
                        getControlInstanceFromStore(
                            this.keyInstance,
                            controlName
                        )
                    );
                }
            }
        },
        /**
         * hàm xử lí hiển thị danh sách cho input filter sau khi chạy công thức input filter
         */
        handleAfterRunFormulasInputFilter(controlInstance, res) {
            controlInstance.dataRunFormulas = res;
            // tích checkbox khi có công thức giá trị hoặc giá trị input filter đã tồn tại
            let check = true;
            if (
                controlInstance.inputValue ||
                controlInstance.oldValue ||
                (res && res.length > 0)
            ) {
                if (!controlInstance.inputValue && !controlInstance.oldValue) {
                    let value = [];
                    res.map((val) => {
                        value.push(val[controlInstance.name]);
                    });
                    controlInstance.inputValue = value.join(',');
                    if (controlInstance.inputValue == '') {
                        check = false;
                    }
                }
                if (check) {
                    this.getDetailInputFilter(controlInstance.name);
                    this.setSelectionInputFilter(controlInstance);
                }
            }

            if (controlInstance.isInputFilter) {
                let tableName = controlInstance.inTable;
                let tableControl = getControlInstanceFromStore(
                    this.keyInstance,
                    tableName
                );
                this.$refs.inputFilter.isForGroupTable = true;
                let controlName = controlInstance.row.node.field;
                let params = controlInstance.row;
                let row = tableControl.tableInstance.getAllDataFieldGroup(
                    params,
                    controlName
                );
                this.$refs.inputFilter.infoGroupTable.rowsGrouped = row;
                this.$refs.inputFilter.infoGroupTable.fieldGrouped =
                    controlName;
            }
            this.$refs.inputFilter.setData(res);
        },

        /**
         *  Hàm xử lí dứ liệu sau khi chạy công thức
         */
        handleAfterRunFormulas(res, controlName, formulaType) {
            let controlInstance = getControlInstanceFromStore(
                this.keyInstance,
                controlName
            );
            let controlId = controlInstance.id;
            let value = minimizeDataAfterRunFormula(res);
            if (
                controlInstance.isInputFilter ||
                (controlInstance.type == 'inputFilter' && formulaType == 'list')
            ) {
                if (res.data && res.data[0] && !res.data.data) {
                    let rows = [];
                    Object.keys(res.data[0].values).map((val) => {
                        let row = {};
                        Object.keys(res.data[0].columns).map((col, colIdx) => {
                            row[res.data[0].columns[colIdx]] =
                                res.data[0].values[val][colIdx];
                        });
                        rows.push(row);
                    });
                    res.data.data = rows;
                }
                this.handleAfterRunFormulasInputFilter(
                    controlInstance,
                    res.data.data
                );
            } else if (formulaType == 'autocomplete' || formulaType == 'list') {
                let titleControl = controlInstance ? controlInstance.title : '';
                this.setDataForControlAutocomplete(
                    res,
                    controlName,
                    titleControl
                );
                return;
            }
            let titleControl = controlInstance ? controlInstance.title : '';
            switch (formulaType) {
                case 'formulas':
                    if (controlInstance.type == 'table') {
                        this.setDataToTable(controlId, res);
                    } else {
                        this.handleInputChangeBySystem(controlName, value);
                    }
                    break;
                case 'prefixDocInstanceIdentifier':
                    this.$set(
                        this.sDocumentSubmit.listInputInDocument[controlName],
                        'prefixDocInstanceIdentifier',
                        value
                    );
                    this.setDataForControlDocInstanceIdentifier(controlName);
                    break;
                case 'suffixDocInstanceIdentifier':
                    this.$set(
                        this.sDocumentSubmit.listInputInDocument[controlName],
                        'suffixDocInstanceIdentifier',
                        value
                    );
                    this.setDataForControlDocInstanceIdentifier(controlName);
                    break;
                case 'autocomplete':
                    this.setDataForControlAutocomplete(
                        res,
                        controlName,
                        titleControl
                    );
                    break;
                case 'list':
                    if (controlInstance.type != 'inputFilter') {
                        this.setDataForControlAutocomplete(
                            res,
                            controlName,
                            titleControl
                        );
                    }
                    break;
                case 'linkConfig':
                    controlInstance.handlerDataAfterRunFormulasLink(
                        value,
                        formulaType
                    );
                    break;
                case 'validate':
                    controlInstance.handlerDataAfterRunFormulasValidate(value);
                    break;
                case 'require':
                    controlInstance.handlerDataAfterRunFormulasRequire(value);
                    break;
                case 'requireChange':
                    controlInstance.handlerDataAfterRunFormulasRequireChange(
                        value
                    );
                    break;
                case 'hidden':
                    controlInstance.handlerDataAfterRunFormulasHidden(value);
                    break;
                case 'readOnly':
                    controlInstance.handlerDataAfterRunFormulasReadonly(value);
                    break;
                case 'uniqueDB':
                    controlInstance.handlerDataAfterRunFormulasUniqueDB(value);
                    break;
                case 'uniqueTable':
                    break;
                case 'deleteAble':
                    controlInstance.tableInstance.setAllowDeleteRowUpdate(
                        value
                    );
                    break;
                case 'groupDpm':
                    this.handleAfterRunGroupDepartment(res, controlInstance);
                    break;
                case 'activeManualLocation':
                    controlInstance.handlerDataAfterRunFormulasActiveManualLocation(value);
                    break;
                case 'activeAutomaticLocation':
                    controlInstance.handlerDataAfterRunFormulasActiveAutomaticLocation(value);
                    break;
                case 'minDate':
                    controlInstance.handlerDataAfterRunFormulasMinDate(value);
                    break;
                case 'maxDate':
                    controlInstance.handlerDataAfterRunFormulasMaxDate(value);
                    break;
                default:
                    break;
            }
        },
        /**
         * Hàm cập nhật dữ liệu cho bảng pivot
         */
        setDataToPivotTable(tableControl, data) {
            if (tableControl.agDataTable) {
                tableControl.agDataTable.setData(data);
            }
        },

        /**
         * Hàm set data cho bảng trong doc sau khi chạy công thức có dữ liệu
         */
        setDataToTable(tableControlId, res) {
            let tableName =
                this.sDocumentEditor.allControl[tableControlId].properties.name
                    .value;
            markBinedField(this.keyInstance, tableName);
            let tableControl = getControlInstanceFromStore(
                this.keyInstance,
                tableName
            );
            if (res.server) {
                let data = res.data.data;
                if (data.length == 0) {
                    tableControl.tableInstance.setData(false);
                    return;
                } else {
                    tableControl.tableInstance.setData(data);
                }
            } else {
                let data = [];
                if (res.data.length > 0) {
                    let columns = res.data[0].columns;
                    let values = res.data[0].values;
                    if (values.length > 0) {
                        for (let index = 0; index < values.length; index++) {
                            let rowData = values[index];
                            let rowObject = {};
                            for (let j = 0; j < rowData.length; j++) {
                                let cell = rowData[j];
                                rowObject[columns[j]] = cell;
                            }
                            data.push(rowObject);
                        }
                    }
                }
                tableControl.tableInstance.setData(data);
            }
        },

        /**
         * Hàm xử lí việc tìm kiếm các root control và chạy công thức cho control đó (lúc khởi tạo doc)
         */
        findRootControl() {
            let impactedFieldsListWhenStart = {};
            let listRootControl = [];
            let listHiddenRootControl = [];
            let impactedFieldsList = {};
            let listLocationRootControl = []
            let listDateRootControl = []
            if (
                this.preDataSubmit != null &&
                Object.keys(this.preDataSubmit).length > 0
            ) {
                impactedFieldsList = this.preDataSubmit.impactedFieldsList;
                impactedFieldsListWhenStart =
                    this.preDataSubmit.impactedFieldsListWhenStart;
                listRootControl = this.preDataSubmit.rootControl;
                listHiddenRootControl = this.preDataSubmit.hiddenRootControl;
                listLocationRootControl = this.preDataSubmit.locationRootControl;
                listDateRootControl = this.preDataSubmit.dateRootControl;
                for (let index = 0; index < listRootControl.length; index++) {
                    const controlName = listRootControl[index];
                    let controlInstance = getControlInstanceFromStore(
                        this.keyInstance,
                        controlName
                    );
                    let controlFormulas = controlInstance.controlFormulas;
                    for (let formulaType in controlFormulas) {
                        if (formulaType == 'linkConfig') {
                            // nếu có cấu hình công thức link thì cũng chạy các công thức của nó
                            // let configData = controlFormulas[formulaType].configData;
                            // for (let i = 0; i < configData.length; i++) {
                            //     let config = configData[i];
                            //     let formulaInstance = config.instance;
                            //     let fType = formulaType+"_"+config.formula.instance;
                            //     if(formulaInstance){
                            //         formulaInstance.type = fType;
                            //         this.handlerBeforeRunFormulasValue(formulaInstance,controlName,fType,'root')
                            //     }
                            // }
                        } else if (
                            !['autocomplete', 'list', 'requireChange'].includes(
                                formulaType
                            )
                        ) {
                            let formulaInstance =
                                controlFormulas[formulaType].instance;
                            if (formulaInstance) {
                                this.handlerBeforeRunFormulasValue(
                                    formulaInstance,
                                    controlName,
                                    formulaType,
                                    'root'
                                );
                            }
                        }
                    }
                }
                if (listHiddenRootControl)
                    this.handleHiddenRootControl(listHiddenRootControl);
                if(listLocationRootControl && listLocationRootControl.length > 0){
                    for (let index = 0; index < listLocationRootControl.length; index++) {
                        const controlName = listLocationRootControl[index];
                        let controlInstance = getControlInstanceFromStore(
                            this.keyInstance,
                            controlName
                        );
                        let controlFormulas = controlInstance.controlFormulas;
                        for (let formulaType in controlFormulas) {
                            if(formulaType == 'activeAutomaticLocation' || formulaType == 'activeManualLocation'){
                                let formulaInstance =
                                    controlFormulas[formulaType].instance;
                                if (formulaInstance) {
                                    this.handlerBeforeRunFormulasValue(
                                        formulaInstance,
                                        controlName,
                                        formulaType,
                                        'root'
                                    );
                                }
                            }
                        }
                    }
                }
                if(listDateRootControl && listDateRootControl.length > 0){
                    for (let index = 0; index < listDateRootControl.length; index++) {
                        const controlName = listDateRootControl[index];
                        let controlInstance = getControlInstanceFromStore(
                            this.keyInstance,
                            controlName
                        );
                        let controlFormulas = controlInstance.controlFormulas;
                        for (let formulaType in controlFormulas) {
                            if(formulaType == 'minDate' || formulaType == 'maxDate'){
                                let formulaInstance =
                                    controlFormulas[formulaType].instance;
                                if (formulaInstance) {
                                    this.handlerBeforeRunFormulasValue(
                                        formulaInstance,
                                        controlName,
                                        formulaType,
                                        'root'
                                    );
                                }
                            }
                        }
                    }
                }
                if (listRootControl.length == 0) {
                    this.$store.commit('document/addToDocumentSubmitStore', {
                        key: 'docStatus',
                        value: 'input',
                        instance: this.keyInstance
                    });
                }
            }
            this.hidePreloader();
            this.pushDataRootToStore(
                impactedFieldsList,
                impactedFieldsListWhenStart
            );
        },
        /**
         * Hàm xử lí việc tìm kiếm các root control được tích chạy thủ công công thức giá trị
         */
        setRootControlRunFormulaManually(){
            this.controlRelationWorker.postMessage({
                action: 'setRootControlRunFormulaManually',
                data: {
                    impactedFieldsList: this.preDataSubmit.impactedFieldsList,
                    listControlRunFormulaManually: this.listControlRunFormulaManually,
                }
            });
        },
        // xử lý chạy công thức ẩn hiện lúc khởi tạo doc
        handleHiddenRootControl(listHiddenRootControl) {
            for (let index = 0; index < listHiddenRootControl.length; index++) {
                const controlName = listHiddenRootControl[index];
                let controlInstance = getControlInstanceFromStore(
                    this.keyInstance,
                    controlName
                );
                let controlFormulas = controlInstance.controlFormulas;
                for (let formulaType in controlFormulas) {
                    if (formulaType == 'hidden') {
                        let formulaInstance =
                            controlFormulas[formulaType].instance;
                        if (formulaInstance) {
                            this.handlerBeforeRunFormulasValue(
                                formulaInstance,
                                controlName,
                                formulaType,
                                'root'
                            );
                        }
                    }
                }
            }
        },
        /**
         *
         */
        goToListDocument() {
            this.drawer = false;
            this.$goToPage(
                '/documents/' + this.documentId + '/objects',
                'Danh sách bản ghi'
            );
        },
        /**
         * Ham call back từ sub form ra compon submit chính và bind giá trị cho control
         */
        submitSubFormSuccess(data) {
            if (!data.isContinueSubmit) {
                this.drawer = false;
            }
            let controlOpenSubform = this.sDocumentSubmit.controlOpenSubform;
            let columnBindingSubForm = controlOpenSubform.columnBindingSubForm;
            let dataBinding = data[columnBindingSubForm];
            controlOpenSubform.setValue(dataBinding);
        },
        resetDataSubmit() {
            let listInputInDocument = getListInputInDocument(this.keyInstance);
            for (let controlName in listInputInDocument) {
                if (listInputInDocument[controlName].type == 'table') {
                    listInputInDocument[controlName].setData(
                        listInputInDocument[controlName].defaultValue
                    );
                    this.updateListInputInDocument(
                        controlName,
                        'value',
                        listInputInDocument[controlName].defaultValue
                    );
                } else if (
                    !listControlNotNameProp.includes(
                        listInputInDocument[controlName].type
                    )
                ) {
                    listInputInDocument[controlName].setValue(
                        listInputInDocument[controlName].defaultValue
                    );
                    this.updateListInputInDocument(
                        controlName,
                        'value',
                        listInputInDocument[controlName].defaultValue
                    );
                }
            }
        },
        /**
         * Hàm kiểm tra xem có tham sô editableControls được truyền vào hay ko
         * nếu có truyền vào thì chỉ được phép nhập liệu trên cac control đó, các control còn lại đánh dấu readonly
         */
        checkEditableControl(controlName, field, tableName = '') {
            if (
                this.editableControls &&
                !this.editableControls.includes(controlName) &&
                field.properties.hasOwnProperty('isReadOnly')
            ) {
                field.properties.isReadOnly.value = true;
            }
            if (
                !_isEmpty(this.matchingItemsAllTables) &&
                this.matchingItemsAllTables[tableName]
            ) {
                let colMatchingItem =
                    this.matchingItemsAllTables[tableName].targetAndResultTable
                        .col;
                let isReadOnly = false;
                colMatchingItem.map((col) => {
                    if (col.controlMapping == controlName) {
                        isReadOnly = true;
                    }
                });
                if (isReadOnly && field.properties.isReadOnly) {
                    field.properties.isReadOnly.value = true;
                }
            }
        },
        /**
         * Hàm kiểm tra có các công thức giá trị được truyền vào để ghi đè hay ko
         * nếu có thì thay thế formulas hiện tại
         */
        checkOverrideFormulas(controlName, field) {
            if (
                Object.keys(this.overrideControls).length > 0 &&
                Object.keys(this.overrideControls).includes(controlName)
            ) {
                if (this.preDataSubmit && this.preDataSubmit.rootControl) {
                    this.preDataSubmit.rootControl.push(controlName);
                } else {
                    this.rootControlFromWorkflow.push(controlName);
                }
                if (!field.formulas.formulas) {
                    field.formulas['formulas'] = {
                        value: {}
                    };
                    field.formulas['formulas']['value'][Date.now()] =
                        this.overrideControls[controlName]['formulas'];
                } else {
                    field.formulas.formulas.value[
                        Object.keys(field.formulas.formulas.value)[0]
                    ] = this.overrideControls[controlName]['formulas'];
                }
            }
        },
        // hàm ghi đè thuộc tính của control
        checkOverrideProperties(controlName, field) {
            if (
                Object.keys(this.overridePropertiesControls).length > 0 &&
                Object.keys(this.overridePropertiesControls).includes(
                    controlName
                )
            ) {
                for (let prop in this.overridePropertiesControls[controlName]) {
                    let propValue =
                        this.overridePropertiesControls[controlName][prop];
                    if (field.properties[prop]) {
                        field.properties[prop].value = propValue;
                    }
                }
            }
        },
        runFormulasOverrideControls() {
            Object.keys(this.overridePropertiesControls).map((controlName) => {
                let controlIns = getControlInstanceFromStore(
                    this.keyInstance,
                    controlName
                );
                if (this.overridePropertiesControls[controlName].require) {
                    controlIns.controlFormulas.require = {
                        instance: new Formulas(
                            this.keyInstance,
                            this.overridePropertiesControls[
                                controlName
                            ].require,
                            'require'
                        )
                    };
                    this.handlerBeforeRunFormulasValue(
                        controlIns.controlFormulas.require.instance,
                        controlName,
                        'require',
                        false
                    );
                }
                if (
                    this.overridePropertiesControls[controlName].requireChange
                ) {
                    controlIns.controlFormulas.requireChange = {
                        instance: new Formulas(
                            this.keyInstance,
                            this.overridePropertiesControls[
                                controlName
                            ].requireChange,
                            'requireChange'
                        )
                    };
                    this.handlerBeforeRunFormulasValue(
                        controlIns.controlFormulas.requireChange.instance,
                        controlName,
                        'requireChange',
                        false
                    );
                }
            });
        },
        // kiểm tra lại giá trị những control có thuộc tính được ghi đè từ workflow
        checkValidateOverrideControls() {
            for (let control in this.overridePropertiesControls) {
                let controlIns = getControlInstanceFromStore(
                    this.keyInstance,
                    control
                );
                if(!this.otherInfo.refreshControl){
                    this.otherInfo.refreshControl = []
                }
                if(this.overridePropertiesControls[control]["isRefreshData"]){
                    this.otherInfo.refreshControl.push(control)
                }
                controlIns.overrideProperties(
                    this.overridePropertiesControls[control]
                );
                if (controlIns.inTable) {
                    let tableControl = getControlInstanceFromStore(
                        this.keyInstance,
                        controlIns.inTable
                    );
                    if (this.overridePropertiesControls[control].isRequired) {
                        controlIns.isRequired = true;
                        tableControl.tableInstance.checkRequireOverrideControls(
                            controlIns
                        );
                    }
                }
            }
        },
        afterFileUpload(fileUpload) {
            let data = fileUpload.data;
            let file = {
                id: data.id,
                name: data.name,
                type: data.type,
                serverPath: data.serverPath,
                size: data.size,
                isMainPicture: false,
                created: data.created,
                userCreated: data.userCreated
            };
            let controlIns = fileUpload.control;
            if (controlIns.inTable != false) {
                // trong table
                let tableControl = getControlInstanceFromStore(
                    this.keyInstance,
                    controlIns.inTable
                );
                let currentCell = controlIns.focusCell;
                let currentRow =
                    tableControl.tableInstance.getDisplayedRowAtIndex(
                        currentCell.rowIndex
                    );
                if (this.$refs.fileUploadPopup)
                    this.$refs.fileUploadPopup.addFileToList(file);
                // this.$refs.fileUploadPopup.addFileToList(file);
                try {
                    let currentData =
                        currentRow.data[
                            this.currentFileControl.controlIns.name
                        ];
                    currentData = currentData ? JSON.parse(currentData) : null;
                    if (!currentData) {
                        currentData = [];
                    }
                    currentData.push(file);
                    tableControl.tableInstance.setDataAtCell(
                        controlIns.name,
                        JSON.stringify(currentData),
                        0
                    );
                } catch (error) {
                    console.warn(error);
                }
            } else {
                if (this.currentFileControl.controlIns.type != 'image') {
                    // control Upload
                    this.currentFileControl.controlIns.setValue(file);
                } else {
                    // control Image
                    this.currentFileControl.controlIns.setValue(
                        file.serverPath
                    );
                }
            }
            this.listUploadControl.allControl = this.getAllControlUpload();
        },

        /**
         * Hàm nhận sự kiên sau khi đóng pop up validate
         */
        afterCloseDialogValidate(type) {
            if (type == 'checkInfinityControl') {
                this.$emit('before-close-submit');
            }
            this.$emit('close-dialog-validate');
        },
        // thêm file upload trong drag panel với table
        afterAddFileClick() {
            this.$refs.uploadAndDrag.openFile();
            // this.$refs.uploadAndDrag.control = data.control;
        },
        afterRemoveAllFiles(control) {
            let controlIns = this.currentFileControl;
            if (controlIns.inTable != false) {
                let currentCell = {};
                let tableControl = getControlInstanceFromStore(
                    this.keyInstance,
                    controlIns.inTable
                );
                currentCell = controlIns.focusCell;
                let currentRow =
                    tableControl.tableInstance.getDisplayedRowAtIndex(
                        currentCell.rowIndex
                    );
                try {
                    tableControl.tableInstance.setDataAtCell(
                        controlIns.name,
                        JSON.stringify([]),
                        currentRow.id
                    );
                } catch (error) {
                    console.warn(error);
                }
            }
            this.listUploadControl.allControl = this.getAllControlUpload();
        },
        afterRemoveFile(file) {
            let controlIns = this.currentFileControl;
            file = file.file;
            this.currentFileControl = controlIns;
            if (controlIns.inTable != false) {
                let tableControl = getControlInstanceFromStore(
                    this.keyInstance,
                    controlIns.inTable
                );
                let currentCell = controlIns.focusCell;
                let currentRow =
                    tableControl.tableInstance.getDisplayedRowAtIndex(
                        currentCell.rowIndex
                    );
                try {
                    let currentData = currentRow.data[controlIns.name];
                    currentData = currentData ? JSON.parse(currentData) : null;
                    let fileRemove = currentData.find((el) => el == file.id);
                    currentData.splice(currentData.indexOf(fileRemove), 1);
                    tableControl.tableInstance.setDataAtCell(
                        controlIns.name,
                        JSON.stringify(currentData),
                        currentRow.id
                    );
                } catch (error) {
                    console.warn(error);
                }
            }
            this.listUploadControl.allControl = this.getAllControlUpload();
        },
        /**
         * reset lại search của input filter sau khi đóng panel
         */
        beforeCloseDragPanel() {
            if (this.dragPopupType != 'fileUpload') {
                this.$refs.inputFilter.search = '';
            }
        },
        getKeyStorage() {
            return (
                this.endUserInfo.id +
                '-' +
                this.documentId +
                '-' +
                this.documentObjectTaskId
            );
        },
        /**
         * Xử lí sự kiện khi load lại trang
         * lưu lại dữ liệu hiện tại của document
         */
        async handlerReload(event) {
            let currentData = await this.getCacheFromIndexDB();
            let data = {};
            let keyStorage = this.getKeyStorage();
            // tạm có dòng này để xóa data ở localstorage trên máy client
            localStorage.removeItem(SUBMIT_DATA_CACHE_INDEX_DB);
            if (currentData) {
                data = JSON.parse(currentData);
            }
            if (!data[keyStorage]) {
                data[keyStorage] = {};
            }
            let dataStorage = this.getDataToLoalStorage();
            let newObject = {};
            if (Object.keys(data[keyStorage]).length > 0) {
                for (let key in data[keyStorage]) {
                    // nếu data cache đã quá 7 ngày thì xóa đi
                    if (
                        data[keyStorage][key].hasOwnProperty('lastAccess') &&
                        data[keyStorage][key]['lastAccess'] - Date.now() <
                            86400 * 1000 * 7
                    ) {
                        newObject[key] = data[keyStorage][key];
                    }
                    if (Object.keys(newObject).length > 15) {
                        break;
                    }
                }
            }
            newObject[this.keyInstance] = {
                dataStorage: dataStorage,
                endUserInfo: this.endUserInfo,
                lastAccess: Date.now()
            };
            data[keyStorage] = newObject;
            let indexedDB = new IndexedDB(SUBMIT_DATA_CACHE_INDEX_DB);
            indexedDB.open(SUBMIT_DATA_CACHE_INDEX_DB, false, false, () => {
                indexedDB.save(JSON.stringify(data), keyStorage);
            });
            // localStorage.setItem(SUBMIT_DATA_CACHE_INDEX_DB,JSON.stringify(data));
        },
        /**
         * Hàm lấy dữ liệu hiện tại của document lưu vào indexdb
         */
        getDataToLoalStorage() {
            let listInput = this.sDocumentSubmit.listInputInDocument;
            let dataControl = {};
            for (let controlName in listInput) {
                let controlIns = listInput[controlName];
                if (controlIns.inTable != false) {
                    continue;
                }
                if (controlIns.type == 'table') {
                    if (controlIns.tableMode == 'Flat') {
                        let value = controlIns.tableInstance.getAllData(true);
                        dataControl[controlName] = value;
                    } else if (controlIns.tableMode == 'Group') {
                        let value =
                            controlIns.tableInstance.getGroupData(false);
                        dataControl[controlName] = value;
                    }
                } else {
                    if (!listControlNotNameProp.includes(controlIns.type)) {
                        let value = controlIns.value;
                        if (
                            controlIns.checkEmptyFormulas('autocomplete') &&
                            controlIns.inputValue
                        ) {
                            value = controlIns.inputValue;
                        }
                        dataControl[controlName] = value;
                        if (controlIns.type == 'checkbox') {
                            dataControl[controlName] =
                                value == true || value == '1' ? 1 : 0;
                        }
                        if (controlIns.type == 'fileUpload') {
                            dataControl[controlName] = JSON.stringify(value);
                        }
                        if (
                            controlIns.type == 'richText' &&
                            controlIns.editor
                        ) {
                            dataControl[controlName] =
                                controlIns.editor.getContent();
                        }
                    }
                }
            }
            return dataControl;
        },

        /**
         * Lấy dữ liệu cache hiện tại của doc theo user id
         */
        async getCacheFromIndexDB() {
            return new Promise((resolve, reject) => {
                let indexedDB = new IndexedDB(SUBMIT_DATA_CACHE_INDEX_DB);
                let keyStorage = this.getKeyStorage();
                indexedDB.open(SUBMIT_DATA_CACHE_INDEX_DB, false, false, async () => {
                    try {
                        let data = await indexedDB.read(keyStorage);
                        resolve(data);
                    } catch (error) {
                        console.error(
                            '[SYMPER] Can not read from indexedDB',
                            error
                        );
                        reject(error);
                    }
                });
            });
        },

        /**
         * Kiểm tra xem có tồn tại lịch sử  dữ liệu đã lưu hay không
         */
        async checkDataFromCacheIndexDB() {
            let currentData = await this.getCacheFromIndexDB();
            if (currentData) {
                let data = JSON.parse(currentData);
                let key = this.getKeyStorage();
                if (data[key] && Object.keys(data[key]).length > 0) {
                    this.confirmLoadFromIndexDB(data);
                }
            }
            return false;
        },

        confirmLoadFromIndexDB(data) {
            let key = this.getKeyStorage();
            if (data[key] && Object.keys(data[key]).length > 0) {
                if (this.allItemRestored.length == 0) {
                    for (let keyInstance in data[key]) {
                        let userInfo = data[key][keyInstance]['endUserInfo'];
                        let dataStorage = data[key][keyInstance]['dataStorage'];
                        let time = this.$moment(keyInstance, 'x').format(
                            'DD-MM-YYYY HH:mm:ss'
                        );
                        let title = this.$t('v2.doc.time') + ': ' + time;
                        let subTitle =
                            this.$t('v2.doc.by') +
                            userInfo.displayName +
                            ', Role: ' +
                            userInfo.currentRole.name;
                        this.allItemRestored.unshift({
                            title: title,
                            subTitle: subTitle,
                            dataStorage: dataStorage,
                            style: { height: '50px', width: '200px' }
                        });
                    }
                    this.allItemRestored[0].activeSb = true;
                    this.afterSelectedItemTablet(this.allItemRestored[0]);
                }
                this.$refs.tabletView.show();
            }
        },
        /**
         * Xử lí hiển thị dữ liệu của các lần lưu lịch sửa sau khi chọn item ở sidebar
         */
        afterSelectedItemTablet(item) {
            let dataStorage = item.dataStorage;
            let listControlOutsideTable = [];
            let listTable = [];
            for (let controlName in dataStorage) {
                let controlIns = getControlInstanceFromStore(
                    this.keyInstance,
                    controlName
                );
                if (controlIns.tableInstance) {
                    let headers = Object.keys(dataStorage[controlName][0]);
                    let columns = [];
                    for (let index = 0; index < headers.length; index++) {
                        let childColname = headers[index];
                        let childControlIns = getControlInstanceFromStore(
                            this.keyInstance,
                            childColname
                        );
                        columns.push(childControlIns.title);
                    }
                    listTable.push({
                        name: controlName,
                        title: controlIns.title,
                        value: dataStorage[controlName],
                        columns: columns
                    });
                } else {
                    listControlOutsideTable.push({
                        name: controlName,
                        title: controlIns.title,
                        value: dataStorage[controlName]
                    });
                }
            }
            this.storageDocumentData = {
                listTable: listTable,
                listControlOutsideTable: listControlOutsideTable
            };
        },
        /**
         * Khôi phục dữ liệu của lịch sử
         */
        restoreRecord() {
            let listTable = this.storageDocumentData.listTable;
            let listControlOutsideTable =
                this.storageDocumentData.listControlOutsideTable;
            for (
                let index = 0;
                index < listControlOutsideTable.length;
                index++
            ) {
                let control = listControlOutsideTable[index];
                let controlIns = getControlInstanceFromStore(
                    this.keyInstance,
                    control.name
                );
                controlIns.setValue(control.value);
            }
            for (let i = 0; i < listTable.length; i++) {
                let table = listTable[i];
                let tableIns = getControlInstanceFromStore(
                    this.keyInstance,
                    table.name
                );
                tableIns.tableInstance.setData(table.value);
            }
            this.$refs.tabletView.hide();
        },
        setTimeWhenCreateTaskInScheduler() {
            for (let key in this.overrideEventScheduler) {
                let control = getControlInstanceFromStore(
                    this.keyInstance,
                    key
                );
                if ( !['submit', 'approvalHistory', 'reset', 'draft'].includes(control.type)) {
                    control.setValue(this.overrideEventScheduler[key]);
                }
            }

        },
        getDataForSubmit() {
            let self = this;
            return new Promise(async (resolve, reject) => {
                self.awaitGetDataForSubmitFunc = function (action, data) {
                    self.awaitGetDataForSubmitFunc = null;
                    resolve({
                        action,
                        data
                    });
                };
                self.handlerSubmitDocumentClick();
            });
        },
        closeFormLink() {
            this.isShowFormLink = false;
        },
    }
};
</script>
<style  scoped>
.sym-form-submit {
    position: relative;
    width: 21cm;
    margin: auto;
}
.sym-form-submit >>> .on-selected {
    border: none !important;
}
.sym-form-submit >>> table:not(.htCore) td,
.sym-form-submit >>> table:not(.htCore),
.sym-form-submit >>> table:not(.htCore) th {
    border: none !important;
}
/* .sym-form-submit >>> .htCore td:nth-last-child(3) {
    border-right: 1px solid #ccc !important;
}
.sym-form-submit >>> .htCore thead tr th:nth-last-child(3) {
    border-right: 1px solid #ccc !important;
} */

.sym-form-submit >>> .handsontable[s-control-type='table'] {
    border-right: 1px solid #ccc;
}
.sym-form-submit >>> .ht_clone_left.handsontable table.htCore {
    border-right: none;
}

#toggle-doc-size {
    position: absolute;
    right: 30px;
    top: 50px;
    padding: 4px 12px;
    font-size: 20px;
    border-radius: 4px;
    background: #fafafa;
    opacity: 1;
    color: #757575;
    transition: ease-in-out 300ms;
}
#toggle-doc-size:hover {
    background: #dddddd;
}
#toggle-doc-size:focus {
    outline: none;
}
/* This is for documentation purposes and will not be needed in your application */
.sym-form-submit >>> .v-speed-dial {
    position: absolute;
}

.sym-form-submit >>> .v-btn--floating {
    position: relative;
}
.wrap-content-submit {
    width: 100%;
    height: calc(100%);
    overflow: hidden;
    background: white;
}
.wrap-content-submit .scroll-content {
    position: relative;
    overflow-x: hidden;
}
.wrap-content-submit .icon {
    font-size: 20px !important;
}
.v-navigation-drawer >>> .wrap-content-submit {
    height: calc(100%);
}
.sub-form-action {
    float: right;
    font-size: 13px;
}
.subfom-action__item {
    margin: 0 8px 0 0;
    padding: 4px 12px;
    border-radius: 4px;
    transition: all ease-in-out 250ms;
    background: var(--symper-background-default);
}
.subfom-action__item:focus {
    outline: none;
}
.subfom-action__item:hover {
    background: var(--symper-background-hover);
}
.subfom-action__item .mdi {
    margin-right: 4px;
}
.v-navigation-drawer >>> .sym-sub-form-submit .sym-form-submit {
    height: calc(100% - 30px) !important;
}
.wrapview-contextmenu {
    padding: 16px;
}
.list-file {
    margin-top: 4px !important;
}
.quick-submit-btn-close {
    font-size: 16px;
    float: right !important;
    border-radius: 50%;
    margin-right: 8px;
    margin-top: 2px;
    padding: 4px;
}
</style>

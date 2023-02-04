<template>
    <div style="overflow: hidden; position: relative" :class="globalClass">
        <Preloader ref="preLoaderView" />
        <div
            class="panel-header"
            v-if="!quickView && !isPrint && !isMinimizeForm"
        >
            <div class="right-action">
                <span
                    class="mr-3 fs-12 d-none"
                    transition="scroll-y-reverse-transition"
                    ref="copyLink"
                    >{{ $t('document.instance.showlist.copied') }}</span
                >
                <v-btn
                    depressed
                    class="show-smartonj-btn-container"
                    @click="loadDataSmartObject"
                    small
                    v-show="isExistSmartObject && !isShowSmartObject"
                    color="F2F2F2"
                >
                    <span class="show-smartonj-btn">{{
                        $t('document.detail.fab.showSmartObj')
                    }}</span>
                </v-btn>
                <v-btn
                    depressed
                    class="show-smartonj-btn-container"
                    @click="hideSmartObject"
                    small
                    :loading="isLoadingSmartObject"
                    v-show="isExistSmartObject && isShowSmartObject"
                    :color="isLoadingSmartObject ? 'F2F2F2' : 'orange'"
                >
                    <span class="show-smartonj-btn" style="color: white">{{
                        $t('document.detail.fab.hideSmartObj')
                    }}</span>
                </v-btn>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon @click="togglePageSize(false)" v-on="on"
                            >mdi-resize</v-icon
                        >
                    </template>
                    <span>{{ $t('document.detail.fab.toggleSize') }}</span>
                </v-tooltip>

                <v-tooltip bottom v-if="showInfoBtn">
                    <template v-slot:activator="{ on }">
                        <v-icon @click="showSideBar" v-on="on"
                            >mdi-information-outline</v-icon
                        >
                    </template>
                    <span>{{ $t('document.detail.fab.otherInfo') }}</span>
                </v-tooltip>
                <v-tooltip bottom v-if="showPrintBtn">
                    <template v-slot:activator="{ on }">
                        <v-icon @click="handleClickPrint" v-on="on"
                            >mdi-printer</v-icon
                        >
                    </template>
                    <span>{{ $t('document.detail.fab.print') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon
                            @click="
                                clickCopyHander()
                            "
                            v-on="on"
                            >mdi-page-next-outline</v-icon
                        >
                    </template>
                    <span>{{
                        $t('document.instance.showlist.copyLink')
                    }}</span> </v-tooltip
                ><v-tooltip bottom v-if="showBtnClose">
                    <template v-slot:activator="{ on }">
                        <v-icon @click="closeDetail" v-on="on"
                            >mdi-close</v-icon
                        >
                    </template>
                    <span>{{ $t('common.close') }}</span>
                </v-tooltip>
            </div>
        </div>
        <div class="panel-header" v-if="showActionQuickView">
            <div class="right-action">
                <span
                    class="mr-3 fs-12 d-none"
                    transition="scroll-y-reverse-transition"
                    ref="copyLink"
                    >{{ $t('document.instance.showlist.copied') }}</span
                >
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            class="btn-edit"
                            color="rgba(0 0 0 / 0.1)"
                            depressed
                            @click="viewExpandObject"
                            v-on="on"
                            >{{ $t('v2.doc.viewExtend') }}
                        </v-btn>
                    </template>
                    <span>{{ $t('document.instance.showlist.newTab') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon
                            @click="
                                clickCopyHander()
                            "
                            v-on="on"
                            >mdi-page-next-outline</v-icon
                        >
                    </template>
                    <span>{{ $t('document.instance.showlist.copyLink') }}</span>
                </v-tooltip>
                <v-tooltip bottom v-if="showBtnClose">
                    <template v-slot:activator="{ on }">
                        <v-icon @click="closeDetail" v-on="on"
                            >mdi-close</v-icon
                        >
                    </template>
                    <span>{{ $t('common.close') }}</span>
                </v-tooltip>
            </div>
        </div>
        <!-- <VuePerfectScrollbar style="height: calc(100% - 30px);" class="content-scroll wrapview-contextmenu"> -->
        <div
            style="height: calc(100% - 30px)"
            class="content-scroll wrapview-contextmenu"
        >
            <div
                class="sym-form-Detail"
                :id="'sym-Detail-' + keyInstance"
                :style="{
                    width: documentSize,
                    height: contentHeight,
                    margin: contentMargin
                }"
            >
                <div
                    v-show="isPermission & !isShowNotFoundScreen"
                    class="content-document"
                    v-html="contentDocument"
                ></div>
                <div
                    v-show="!isPermission"
                    class="mt-4"
                    style="
                        position: absolute;
                        top: 40%;
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
                <NotFoundScreen
                    class="mt-12"
                    v-if="isShowNotFoundScreen"
                    :emptyDataKey="'document-no-record-found'"
                />
                <div
                    class="content-print-document"
                    :style="formSize"
                    v-html="contentPrintDocument"
                ></div>
                <FloattingPopup
                    ref="floattingPopup"
                    :focusingControlName="focusingControlName"
                    :instance="keyInstance"
                />
            </div>
        </div>
        <!-- </VuePerfectScrollbar> -->
        <side-bar-detail
            v-if="!isPrint"
            :isShowSidebar="isShowSidebar"
            ref="sidebarView"
            :keyInstance="keyInstance"
            :sidebarWidth="sidebarWidth"
            :userId="userId"
            :taskId="taskId"
            :createTime="createTime"
            :documentObjectId="docObjId"
            :workflowId="workflowId"
            :showCommentInDoc="showCommentInDoc"
            @after-hide-sidebar="afterHideSidebar"
        />
        <HistoryControl ref="historyView" />
        <!-- <Embbed
            class="embed-data-flow"
            @after-mounted="afterDataFlowMounted"
            v-for="dataFlow in listDataFlow"
            :listNodeDataFlow="dataFlow.nodes"
            :key="dataFlow.id"
            :dataflowId="dataFlow.id"
            :width="'100%'"
            :ref="'dataFlow' + dataFlow.id"
            :view="'detail'"
        /> -->
        <Comment2
            :objectIdentifier="docObjId"
            :objectType="'document-instance'"
            :scroll-bottom="scrollBottom"
            @preview-picture-comment="previewPictureComment"
            ref="commentView"
            v-show="isShowComment"
            :isFocusComment="false"
            @focus-to-comment="focusToComment"
            :taskId="taskId"
            :userIdCreateObject="userId"
        />
        <PreviewFile ref="previewFile" :fileInfor="fileInfor" />
        <PreviewUploadFile
            v-if="!quickView"
            :showHiddenStar="true"
            :isSetMain="false"
            ref="previewUploadFile"
            :width="400"
            :isShowHideDoc="showInfoDoc"
            :listUploadControl="listUploadControl"
            @close="closePreviewFile"
            @select-image="showGallary"
        />
        <LightBox
            :isShowStar="false"
            :isSetMain="false"
            ref="lightbox"
            :media="listImage"
            :show-caption="true"
            :show-light-box="true"
        />
        <SmartObjectViewEndUser
            @highlight-control="setStyleForControl"
            ref="smartObjectViewEndUser"
            :id="documentId"
            :type="'document'"
            v-if="isShowSmartObject && !quickView"
            v-show="!isLoadingSmartObject"
            :allDataDocument="sDocumentDetail.allData"
            :allControlDocument="mapIdControlToDataControl"
            @focus-control="setStyleWhenFocusControl"
            :dataSMO="dataSMO"
            :idControlClicked="idControlClicked"
            :dataCellClicked="dataCellClicked"
            @close-list="hideSmartObject"
            @smart-object-finish-loading-data="showTabSmartObject"
        />
        <v-navigation-drawer
            class="s-drawer"
            fixed
            permanent
            right
            :style="{
                'z-index': '100!important',
                transform: isShowFormLink
                    ? 'translateX(0%)'
                    : 'translateX(100%)',
                width: panelFormLinkWidth + 'px'
            }"
        >
            <div
                v-if="!quickView && isShowFormLink && parrentInstance == 0"
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
                        @change-parent-form-link-width="
                            changeParentFormLinkWidth
                        "
                        :parrentInstance="keyInstance"
                        :isMinimizeForm="true"
                        :docObjInfo="docLinkObjInfo"
                    />
                </div>
            </div>
        </v-navigation-drawer>
    </div>
</template>
<script>
import LightBox from '@/components/common/imageSlideShow/LightBox';
import PreviewUploadFile from '@/components/common/PreviewUploadFile';
import { documentApi } from './../../../api/Document.js';
import './../../../components/document/documentContent.css';
import BasicControl from './../submit/basicControl';
import ActionControl from './../submit/actionControl.js';
import LayoutControl from './../submit/layoutControl';
import {
    getSDocumentSubmitStore,
    getControlInstanceFromStore,
    minimizeDataAfterRunFormula
} from './../common/common';
import SideBarDetail from './SideBarDetail';
import HistoryControl from './HistoryControl';
import FloattingPopup from './../common/FloattingPopup';
import Preloader from './../../../components/common/Preloader';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import ControlRelationWorker from 'worker-loader!@/worker/document/submit/ControlRelation.Worker.js';
import TableControl from '../submit/tableControl1.js';
import FormulasWorker from 'worker-loader!@/worker/document/submit/Formulas.Worker.js';
import { getDataInputFormula } from './../../../components/document/dataControl';
import PreviewFile from '@/components/common/PreviewFile';
import { calculatorPositionBox } from '@/views/document/common/common.js';
import NotFoundScreen from '@/components/common/NotFoundScreen';
import Comment2 from '@/components/common/commentVer2/Comment2.vue';
// import Embbed from '@/components/dataflow/EmbedDataflow';
import { smartObjectApi } from '@/api/smartObject.js';
export default {
    name: 'detailDocument',
    props: {
        // documentObjectId: {
        //     type: Number,
        //     default: 0
        // },
        // nội dung đã được filter của table để in
        contentTableFilterPrint: {
            type: Array,
            default() {
                return [];
            }
        },
        docObjInfo: {
            type: Object,
            default() {
                return {
                    docObjId: '',
                    docSize: '21cm'
                };
            }
        },
        showInfoBtn: {
            type: Boolean,
            default: true
        },
        isPrint: {
            type: Boolean,
            default: false
        },
        showCommentInDoc: {
            type: Boolean,
            default: true
        },
        formId: {
            default: 0
        },
        quickView: {
            type: Boolean,
            default: false
        },
        // show detail giảm thiểu các chức năng, ( chỉ để hiện thị, sử dụng trong link giá trị )
        isMinimizeForm: {
            type: Boolean,
            default: false
        },
        contentHeight: {
            type: String,
            default: 'calc(100% - 30px);'
        },
        parrentInstance: {
            default: 0
        },
        customDataEventRecForScheduler: {
            type: Object
        },
        showPrintBtn: {
            type: Boolean,
            default: true
        },
        showActionQuickView: {
            type: Boolean,
            default: false
        },
        showBtnClose: {
            type: Boolean,
            default: false
        }
    },
    components: {
        // Embbed,
        'side-bar-detail': SideBarDetail,
        HistoryControl,
        Preloader,
        FloattingPopup,
        VuePerfectScrollbar,
        PreviewFile,
        LightBox,
        PreviewUploadFile,
        NotFoundScreen,
        Comment2,
        SmartObjectViewEndUser: () =>
            import('@/../src/views/smartObject/EndUser/SmartObjectViewEndUser')
    },
    computed: {
        routeName() {
            return this.$getRouteName();
        },
        sDocumentEditor() {
            return this.$store.state.document.editor[this.keyInstance];
        },
        sDocumentSubmit() {
            return this.$store.state.document.submit[this.keyInstance];
        },
        sDocumentDetail() {
            return this.$store.state.document.detail[this.keyInstance];
        },
        allUsers() {
            let allUser = this.$store.state.app.allUsers;
            thisCpn.$store.commit('document/addToDocumentSubmitStore', {
                key: 'listUser',
                value: allUser,
                instance: thisCpn.keyInstance
            });
        }
    },
    data() {
        return {
            listDataFlow: [],
            scrollBottom: false,
            showInfoDoc: true,
            listUploadControl: {
                currentControl: {},
                allControl: [],
                inTable: true,
                imgIdx: 0,
                selectedColumn: []
            },
            isOffDoc: false,
            listImage: [],
            controlRelationWorker: null,
            focusingControlName: '',
            contentDocument: null,
            contentPrintDocument: null,
            docObjId: null,
            documentId: null,
            isShowSidebar: false,
            documentSize: null,
            keyInstance: Date.now(),
            contentMargin: 'auto',
            sidebarWidth: 400,
            workflowId: '',
            taskId: '',
            userCreateInfo: '',
            otherInfo: '',
            createTime: '',
            userId: '',
            direction: 'top',
            fab: false,
            fileInfor: {},
            hover: false,
            tabs: null,
            top: false,
            right: true,
            bottom: true,
            left: false,
            transition: 'slide-y-reverse-transition',
            printConfigActive: null,
            formSize: {},
            wrapFormCss: {},
            defaultData: {},
            dataPivotTable: {},
            dataGroupTable: {},
            globalClass: null,
            isShowComment: false,
            formulasWorker: null,
            optionalDataBinding: {},
            isLoadForm: false,
            isPermission: true,
            isShowFormLink: false,
            listTableLoaded: {},
            docLinkObjInfo: {},
            linkTitle: '',
            positionBoxFormLink: { top: 0, left: 0 },
            panelFormLinkWidth: 794,
            isShowNotFoundScreen: false,
            isShowSmartObject: false,
            isLoadingSmartObject: false,
            isExistSmartObject: false,
            mapIdControlToDataControl: {},
            dataSMO: [],
            idControlClicked: '',
            dataCellClicked: {},
            departmentControl: {
                mapData: {}
            },
            objectOtherInfo: {},
            dataClipboard: '',
            listTable: {}
        };
    },
    beforeMount() {
        this.documentSize = '21cm';
        this.globalClass = {
            'wrap-content-detail': true,
            'overscroll-behavior': 'none'
        };
    },
    mounted() {
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
                        for (let controlId in listControlToStore) {
                            thisCpn.$store.commit('document/addControl', {
                                id: controlId,
                                props: listControlToStore[controlId],
                                instance: thisCpn.keyInstance
                            });
                        }
                        thisCpn.processHtml();
                        // thisCpn.controlRelationWorker.terminate();
                        break;
                    default:
                        break;
                }
            }
        );
        /**
         * Lắng nghe sự kiện từ luồng xử lí formulas
         */
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
                    if (controlIns.inTable != false) {
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
                        let value = minimizeDataAfterRunFormula(res);
                        controlIns.handlerDataAfterRunFormulasLink(
                            value,
                            formulaType
                        );
                    }
                    break;
                case 'afterCreateSQLiteDB':
                    if (
                        thisCpn.routeName == 'detailDocument' &&
                        !thisCpn.quickView
                    ) {
                        thisCpn.loadDocumentObject(this.isPrint);
                    }
                    break;
                default:
                    break;
            }
        });
    },
    destroyed() {
        this.isLoadForm = false;
        this.closeFormulasWorker();
        let listTable = this.listTable;
        for (let i in listTable) {
            let table = listTable[i];
            let tableIns = getControlInstanceFromStore(
                this.keyInstance,
                table.name
            );
            tableIns.destroyed();
        }
    },
    created() {
        this.formulasWorker = new FormulasWorker();
        if (!this.isMinimizeForm) {
            this.formulasWorker.postMessage({
                action: 'createSQLiteDB',
                data: { keyInstance: this.keyInstance }
            });
        } else {
            this.loadDocumentObject();
        }
        this.$store.commit('document/setDefaultSubmitStore', {
            instance: this.keyInstance
        });
        this.$store.commit('document/setDefaultDetailStore', {
            instance: this.keyInstance
        });
        this.$store.commit('document/setDefaultEditorStore', {
            instance: this.keyInstance
        });
        if (
            this.$route.params.extraData &&
            this.$route.params.extraData.defaultData
        ) {
            this.defaultData = this.$route.params.extraData.defaultData;
        }
        let thisCpn = this;
        this.$store.commit('document/changeViewType', {
            key: thisCpn.keyInstance,
            value: 'detail'
        });
        if (this.isPrint || this.routeName == 'printDocument') {
            this.$store.commit('document/changeViewType', {
                key: thisCpn.keyInstance,
                value: 'print'
            });
        }
        if (this.parrentInstance == 0) {
            if (this.docObjInfo.docObjId != '') {
                this.docObjId = this.docObjInfo.docObjId;
            } else if (
                this.routeName == 'detailDocument' ||
                this.routeName == 'printDocument'
            ) {
                this.docObjId = this.$route.params.id;
            }
        }

        this.optionalDataBinding['document_object_id'] = this.docObjId;
        this.dataClipboard =
            window.location.origin + '/#/documents/objects/' + this.docObjId;
        this.$evtBus.$on('document-item-control-file-click', (data) => {
            if (thisCpn._inactive == true) return;
            if (thisCpn.keyInstance != data.control.keyInstance) {
                return;
            } else {
                thisCpn.$emit('change-parent-form-link-width', 1185);
            }
            thisCpn.showInfoDoc = false;
            thisCpn.listUploadControl.allControl =
                thisCpn.getAllControlUpload();
            thisCpn.listUploadControl.allControl.map((control) => {
                if (control.name == data.control.name) {
                    thisCpn.listUploadControl.currentControl = control;
                }
            });
            thisCpn.listUploadControl.imgIdx = data.imgIdx;
            if (thisCpn.quickView) {
                thisCpn.showInfoDoc = true;
                thisCpn.$emit('add-upload-panel', {
                    listUploadControl: thisCpn.listUploadControl,
                    isQuickView: true,
                    isSetMain: false
                });
            } else {
                thisCpn.$refs.previewUploadFile.show();
            }
        });
        if (this.isMinimizeForm) {
            return;
        }
        this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
            if (thisCpn._inactive == true) return;
            if (
                $(evt.target).closest('.upload-file-wrapper-outtb').length == 0
            ) {
                $('.list-file').css('background', 'white');
                $('.file-item').css('background', 'unset');
                $('.dropdown-content').removeClass('show-upload-dropdown');
            }
            if (this.$refs.historyView) {
                if ($(evt.target).hasClass('icon-link-control')) {
                    if ($(evt.target).attr('control-in-table')) {
                        this.focusingControlName = $(evt.target)
                            .closest('.info-control-btn')
                            .attr('data-control');
                        var rowObjectLink = $(evt.target)
                            .closest('.info-control-btn')
                            .attr('object_id');
                        this.linkTitle = $(evt.target)
                            .closest('.info-control-btn')
                            .attr('link-title');
                    } else {
                        this.focusingControlName = $(evt.target)
                            .closest('.control-link-button')
                            .siblings()
                            .attr('data-control');
                        var rowObjectLink = $(evt.target)
                            .closest('.control-link-button')
                            .siblings()
                            .attr('object_id');
                        this.linkTitle = $(evt.target)
                            .closest('.control-link-button')
                            .siblings()
                            .attr('link-title');
                    }
                    let objId = rowObjectLink;
                    if (objId) {
                        evt.curTarget = evt.target;
                        this.isShowFormLink = false;
                        this.$refs.sidebarView.hide();
                        this.positionBoxFormLink = calculatorPositionBox(
                            evt,
                            $('#sym-Detail-' + this.keyInstance),
                            { top: 30 }
                        );
                        this.docLinkObjInfo = {
                            docObjId: objId,
                            docSize: '21cm'
                        };
                        setTimeout(() => {
                            thisCpn.isShowFormLink = true;
                        }, 0);
                    }
                } else {
                    if (
                        !$(evt.target).hasClass('v-data-table') &&
                        $(evt.target).closest('.v-data-table').length == 0
                    ) {
                        this.$refs.historyView.hide();
                    }
                    if (
                        !$(evt.target).hasClass('s-floatting-popup') &&
                        $(evt.target).closest('.s-floatting-popup').length == 0
                    ) {
                        this.$refs.floattingPopup.hide();
                    }
                }
            }
            let currentTable = '';
            if ($(evt.target).closest('.wrap-table').length > 0) {
                currentTable = $(evt.target)
                    .closest('.wrap-table')
                    .children()
                    .first();
                currentTable = currentTable.attr('table-name');
            }
            if (currentTable) {
                $('#sym-Detail-' + this.keyInstance)
                    .find('.more-action-table')
                    .not('[table-name=' + currentTable + ']')
                    .removeClass('d-block');
            } else {
                $('#sym-Detail-' + this.keyInstance)
                    .find('.more-action-table.d-block')
                    .removeClass('d-block');
            }
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
                tableInstance.tableMode == 'nomal' ? 'pivot' : 'nomal';
            tableInstance.switchTable();
        });
        this.$evtBus.$on('document-table-ready', (tableName) => {
            if (thisCpn._inactive == true) return;
            thisCpn.listTableLoaded[tableName] = 1;
            if (!Object.values(thisCpn.listTableLoaded).includes(0)) {
                thisCpn.afterAllTableReady();
            }
        });

        /**
         * Sau khi load data cho table thi render pivot table
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
                tableIns.pivotTable.setData(data);
            }
        });
        this.$evtBus.$on('document-submit-show-history-control', (e) => {
            if (this._inactive == true) return;
            let event = e.e;
            let tableName = e.tableName;
            let tableControl = getControlInstanceFromStore(
                this.keyInstance,
                tableName
            );
            SYMPER_APP.$evtBus.$emit('document-submit-show-link-control', {
                e: event,
                controlIns: tableControl
            });
        });
        this.$evtBus.$on('document-click-control-hightlight', (data) => {
            this.dataCellClicked = {};
            this.setStyleWhenUnfocusControl();
            if (data.dataControlInTable) {
                this.dataCellClicked = data.dataControlInTable;
            }
            this.idControlClicked = data.id;
            this.loadDataSmartObject();
        });
    },
    watch: {
        docObjInfo: {
            deep: true,
            immediate: true,
            handler(after) {
                if (after.docObjId) {
                    this.docObjId = after.docObjId;
                    if (after.docSize) {
                        this.documentSize = after.docSize;
                    }

                    if (this.parrentInstance == 0) {
                        this.loadDocumentObject(this.isPrint, true);
                    }
                }
            }
        },
        documentObjectId(after) {
            this.contentPrintDocument = null;
            this.docObjId = after;
            this.loadDocumentObject(this.isPrint, true);
        }
    },
    methods: {
        clickCopyHander(){
            navigator.clipboard.writeText(this.dataClipboard)
            this.copyLinkObject()
        },
        closeDetail() {
            this.$emit('close');
        },
        viewExpandObject() {
            this.docObjInfo.docObjId;
            let url =
                window.location.origin +
                '/#/documents/objects/' +
                this.docObjInfo.docObjId;
            var win = window.open(url, '_blank');
            win.focus();
        },
        async getConfigSmartObject() {
            let res = await smartObjectApi.getSmartObjectByIdObject(
                'document',
                this.documentId
            );
            if (res.status == 200 && res.data) {
                let listControl = [];
                for (let link of res.data) {
                    let isObjectSource = false;
                    if (this.documentId == link.id_object_source) {
                        isObjectSource = true;
                    }
                    let mapIdControlToDataControl = this.customStructControl(
                        this.sDocumentEditor.allControl
                    );
                    let config = JSON.parse(link.config);
                    if (isObjectSource) {
                        var allControlObjectTarget =
                            await this.getAllControlInDoc(
                                link.id_object_target
                            );
                        if (
                            !config.isViewSourceToTarget ||
                            !allControlObjectTarget[link.id_col_target]
                        ) {
                            link.disableLink = true;
                        } else if (
                            link.objectTarget.type.trim() == 'document'
                        ) {
                            link.allControlObjectTarget =
                                allControlObjectTarget;
                            listControl.push(
                                mapIdControlToDataControl[link.id_col_source]
                            );
                        }
                    } else {
                        var allControlObjectSource =
                            await this.getAllControlInDoc(
                                link.id_object_source
                            );
                        if (
                            !config.isViewTargetToSource ||
                            !allControlObjectSource[link.id_col_source]
                        ) {
                            link.disableLink = true;
                        } else if (
                            link.objectSource.type.trim() == 'document'
                        ) {
                            link.allControlObjectSource =
                                allControlObjectSource;
                            listControl.push(
                                mapIdControlToDataControl[link.id_col_target]
                            );
                        }
                    }
                }
                if (listControl.length > 0) {
                    this.setStyleForControl(listControl);
                    this.isExistSmartObject = true;
                }
            }
            this.dataSMO = res.data.filter((link) => !link.disableLink);
        },
        async getAllControlInDoc(documentId) {
            try {
                let res = await documentApi.getAllControl(documentId);
                if (res.status === 200) {
                    let listControl = {};
                    res.data.map((control) => {
                        listControl[control.id] = control;
                    });
                    return listControl;
                }
            } catch (error) {
                console.error(error);
                return false;
            }
        },
        customStructControl(allControlDocument) {
            let mapIdControlToDataControl = {};
            for (let index in allControlDocument) {
                if (allControlDocument[index].type != 'table') {
                    if (
                        ![
                            'submit',
                            'approvalHistory',
                            'reset',
                            'draft'
                        ].includes(allControlDocument[index].type)
                    ) {
                        const element = {
                            id: allControlDocument[index].id,
                            name: allControlDocument[index].properties.name
                                .value,
                            type: allControlDocument[index].type
                        };
                        mapIdControlToDataControl[element.id] = element;
                    }
                } else {
                    for (let tb in allControlDocument[index].listFields) {
                        const element = {
                            id: allControlDocument[index].listFields[tb].id,
                            name: allControlDocument[index].listFields[tb]
                                .properties.name.value,
                            type: allControlDocument[index].listFields[tb].type,
                            inTable: {
                                id: allControlDocument[index].id,
                                name: allControlDocument[index].properties.name
                                    .value,
                                type: allControlDocument[index].type
                            }
                        };
                        mapIdControlToDataControl[element.id] = element;
                    }
                }
            }
            this.mapIdControlToDataControl = mapIdControlToDataControl;
            return mapIdControlToDataControl;
        },
        loadDataSmartObject() {
            this.isShowSmartObject = true;
            this.isLoadingSmartObject = true;
        },
        showTabSmartObject() {
            this.isLoadingSmartObject = false;
            document
                .querySelector('.wrap-content-detail')
                .classList.add('wrap-content-smartobj');
        },
        hideSmartObject() {
            this.idControlClicked = '';
            this.dataCellClicked = {};
            this.isShowSmartObject = false;
            this.setStyleWhenUnfocusControl();
            if (
                document
                    .querySelector('.wrap-content-detail')
                    .classList.contains('wrap-content-smartobj')
            ) {
                document
                    .querySelector('.wrap-content-detail')
                    .classList.remove('wrap-content-smartobj');
            }
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
        showGallary(list) {
            this.listImage = list.listMedia;
            this.$refs.lightbox.showDialog = true;
            this.$refs.lightbox.showImage(list.index);
        },
        // lấy cột dữ liệu của control upload hiện tại và control key
        getColumnKeyAndCurrentUpload(data, tableName, controlName) {
            let columnSelected = [];
            data.columnSelected.map((column) => {
                columnSelected.push(column.name);
            });
            columnSelected.push(controlName);
            return this.getRowDataTableUpload(tableName, columnSelected);
        },
        // lấy các cột được hiển thị trong table

        getKeyControlUpload(configUpload) {
            let name = null;
            configUpload.columnSelected.map((control) => {
                if (control.primary) {
                    name = control.name;
                }
            });
            return name;
        },
        //
        getRowDataTableUpload(tableName, columnSelected) {
            let row = [];
            let allRow = this.sDocumentDetail.allData[tableName];
            if (allRow) {
                allRow.map((node) => {
                    let rowFilted = {};
                    columnSelected.map((column) => {
                        if (Object.keys(node).includes(column)) {
                            rowFilted[column] = node[column];
                        }
                    });
                    row.push(rowFilted);
                });
            }
            return row;
        },
        // lấy dữ liệu theo cột khóa chính upload
        getColumnByColumnKeyUpload(data, tableName) {
            let columnSelected = [];
            data.columnSelected.map((column) => {
                columnSelected.push(column.name);
            });
            return this.getRowDataTableUpload(tableName, columnSelected);
        },

        filterDataColumnTable(allRow, controlName) {
            let newData = [];
            if (allRow.length > 0) {
                allRow.map((row) => {
                    if (row[controlName] != '' && row[controlName]) {
                        let listImage = JSON.parse(row[controlName]);
                        if (listImage.length > 0) {
                            listImage.map((img) => {
                                newData.push(img);
                            });
                        }
                    }
                });
            }
            return newData;
        },
        getAllDataTable(tableName) {
            return getControlInstanceFromStore(
                this.keyInstance,
                tableName
            ).tableInstance.getAllData();
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
                        if (this.sDocumentDetail.allData[controlIns.inTable]) {
                            listImage = this.filterDataColumnTable(
                                this.sDocumentDetail.allData[
                                    controlIns.inTable
                                ],
                                controlName
                            );
                        } else {
                            listImage = [];
                        }
                        dataTable.data = this.getColumnByColumnKeyUpload(
                            configTable,
                            controlIns.inTable
                        );
                        dataTable.controlName = this.getKeyControlUpload(
                            configTable
                        )
                            ? this.getKeyControlUpload(configTable)
                            : controlName;
                        dataTable.allData = this.getColumnKeyAndCurrentUpload(
                            configTable,
                            controlIns.inTable,
                            controlName
                        );
                    } else {
                        if (controlIns.value && controlIns.value.length > 0) {
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
                    // let userUpdate =
                    listUpload.push({
                        name: controlIns.name,
                        value: listImage,
                        title: controlIns.title,
                        lastUserUpdate: controlIns.lastUserUpdate
                            ? controlIns.lastUserUpdate
                            : '',
                        configInTable: configTable,
                        dataTable: dataTable,
                        inTable: controlIns.inTable
                            ? controlIns.inTable
                            : false,
                        created: this.$moment().format('YYYY-MM-DD')
                    });
                }
            }
            return listUpload;
        },
        /**
         * Xử lí call qua formulas object để chạy công thức
         */
        handlerBeforeRunFormulasValue(
            formulaInstance,
            controlName,
            formulaType
        ) {
            let dataInput = getDataInputFormula(
                formulaInstance,
                this.sDocumentSubmit.listInputInDocument,
                this.optionalDataBinding,
                'all'
            );
            let control = getControlInstanceFromStore(
                this.keyInstance,
                controlName
            );
            if (control.inTable != false) {
                let tableControl = getControlInstanceFromStore(
                    this.keyInstance,
                    control.inTable
                );
                tableControl.tableInstance.handleRunFormulaForControlInTable(
                    control,
                    formulaInstance,
                    'all'
                );
            } else {
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
        },
        closeFormulasWorker() {
            this.formulasWorker.postMessage({
                action: 'closeDB',
                data: { keyInstance: this.keyInstance }
            });
            this.formulasWorker.terminate();
        },
        afterHideSidebar() {
            this.$emit('after-hide-sidebar');
        },
        toggleSideBar() {
            this.isShowSidebar = !this.isShowSidebar;
        },
        isShow() {
            return this.isShowSidebar;
        },
        setLayoutFromQuickView(size, margin) {
            this.documentSize = size;
            this.contentMargin = margin;
        },
        // Khadm: load data của document lên để hiển thị và xử lý
        async loadDocumentStruct(documentId, isPrint = false) {
            try {
                if (this.routeName == 'printDocument') {
                    isPrint = true;
                }
                let dataPost = {};
                if (isPrint) {
                    dataPost = { formId: this.formId };
                    if (this.formId == 0) {
                        dataPost.formId = 'active';
                    }
                }
                let docDetailRes = await documentApi.detailDocument(
                    documentId,
                    dataPost
                );
                if (docDetailRes.status == 200) {
                    this.isLoadForm = true;
                    this.$store.commit('document/addToDocumentSubmitStore', {
                        key: 'documentInfo',
                        value: docDetailRes.data,
                        instance: this.keyInstance
                    });
                    this.dataPivotTable = docDetailRes.data.pivotConfig;
                    this.dataGroupTable = docDetailRes.data.groupConfig;
                    let content = docDetailRes.data.document.content;
                    if (!isPrint) {
                        $('.content-print-document').addClass('d-none');
                        $('.content-document').removeClass('d-none');
                        this.contentDocument = content;
                    } else {
                        $('.content-print-document').removeClass('d-none');
                        $('.content-document').addClass('d-none');
                        this.contentPrintDocument = content;
                    }
                    this.documentSize = '21cm';
                    let contentPrintCss = {};
                    contentPrintCss = { margin: 'auto' };
                    if (parseInt(docDetailRes.data.document.isFullSize) == 1) {
                        this.togglePageSize(true);
                    }
                    if (docDetailRes.data.document.formStyle) {
                        let style = JSON.parse(
                            docDetailRes.data.document.formStyle
                        );
                        if (!style['globalClass']) {
                            style['globalClass'] =
                                'document-form-style-default';
                        }
                        this.globalClass[style['globalClass']] = true;
                    } else {
                        this.globalClass['document-form-style-default'] = true;
                    }
                    if (docDetailRes.data.document.formSize) {
                        this.formSize = JSON.parse(
                            docDetailRes.data.document.formSize
                        );
                        if (this.formSize) {
                            this.documentSize = 'auto';
                            if (this.formSize.type == 'A3') {
                                contentPrintCss = {
                                    transform: 'scale(0.84)',
                                    'transform-origin': 'top left'
                                };
                            } else if (this.formSize.type == 'A5') {
                                contentPrintCss = {
                                    transform: 'scale(0.84)',
                                    'transform-origin': 'top left',
                                    margin: 'auto'
                                };
                            }
                            if (this.$getRouteName() == 'printMultiple') {
                                contentPrintCss['transform'] = 'scale(1)';
                            }
                            Object.assign(this.formSize, contentPrintCss);
                        }
                    }

                    this.controlRelationWorker.postMessage({
                        action: 'setDataForPropsControl',
                        data: {
                            fields: docDetailRes.data.fields,
                            viewType: 'detail',
                            allDataDetail: this.sDocumentDetail.allData
                        }
                    });
                }
                this.$emit('after-load-document', docDetailRes.data.document);
            } catch (error) {
                console.error(error, 'errorerror');
            }
        },
        async loadDocumentObject(isPrint = false, isFromSBS = false) {
            if (!isFromSBS) {
                this.contentDocument = '';
            }
            let res = await documentApi.detailDocumentObject(this.docObjId);
            if (res.status == 200) {
                this.isPermission = true;
                this.objectOtherInfo = res.data.otherInfo;
                this.userId = res.data.document_object_user_created_id;
                this.taskId = res.data.document_object_task_id;
                this.createTime = res.data.document_object_create_time;
                this.workflowId = res.data.document_object_workflow_object_id;
                if (this.documentId != res.data.documentId) {
                    this.$refs.preLoaderView && this.$refs.preLoaderView.show();
                    this.isLoadForm = false;
                    this.contentDocument = '';
                }
                this.documentId = res.data.documentId;
                this.userCreateInfo = res.data.userCreateInfo;
                this.otherInfo = res.data.otherInfo;
                let dataToStore = res.data;
                if (this.isPrint) {
                    Object.keys(res.data).map((data) => {
                        if (this.contentTableFilterPrint.length > 0) {
                            this.contentTableFilterPrint.map((con) => {
                                if (con.controlName == data) {
                                    dataToStore[con.controlName] = con.data;
                                }
                            });
                        }
                    });
                }
                if (Object.keys(this.defaultData).length > 0) {
                    dataToStore = this.defaultData;
                    dataToStore.documentId = res.data.documentId;
                }
                this.$store.commit('document/addToDocumentDetailStore', {
                    key: 'allData',
                    value: dataToStore,
                    instance: this.keyInstance
                });
                if (!this.isLoadForm) {
                    this.loadDocumentStruct(res.data.documentId, isPrint);
                } else {
                    this.refreshData(res.data, this.otherInfo);
                    this.$store.commit('document/addToDocumentDetailStore', {
                        key: 'allData',
                        value: res.data,
                        instance: this.keyInstance
                    });
                }
                this.isShowNotFoundScreen = false;
            } else {
                if (res.status == 403) {
                    this.isPermission = false;
                }
                if (this.$refs.preLoaderView) {
                    this.$refs.preLoaderView.hide();
                }
                this.$snotify({
                    type: 'error',
                    title: res.message
                });
                this.isShowNotFoundScreen = true;
            }
        },
        /**
         * refresh data khi chuyển bản ghi của view SBS
         * cần check ẩn hiện control tương ứng với bản ghi
         */
        refreshData(data, otherInfo) {
            let hiddenControls = otherInfo.hiddenControls
                ? otherInfo.hiddenControls
                : [];
            for (let key in data) {
                let controlIns = getControlInstanceFromStore(
                    this.keyInstance,
                    key
                );
                if (controlIns != false) {
                    if (controlIns.type == 'table') {
                        controlIns.tableInstance.setData(data[key], true);
                        if (data[key].length > 0) {
                            let listColumn = Object.keys(data[key][0]);
                            let listHiddenCol = ['s_table_id_sql_lite'];
                            let listVisibleCol = [];
                            for (
                                let index = 0;
                                index < listColumn.length;
                                index++
                            ) {
                                let col = listColumn[index];
                                if (hiddenControls.indexOf(col) !== -1) {
                                    listHiddenCol.push(col);
                                } else {
                                    listVisibleCol.push(col);
                                }
                            }
                            controlIns.tableInstance.setColumnsVisible(
                                listVisibleCol,
                                true
                            );
                            controlIns.tableInstance.setColumnsVisible(
                                listHiddenCol,
                                false
                            );
                        }
                    } else {
                        if (controlIns.type == 'fileUpload') {
                            controlIns.renderFileControl();
                            controlIns.setFileControlValue(data[key], true);
                        }
                        if (controlIns.type == 'department') {
                            this.setDataForDepartment(
                                controlIns,
                                controlIns.name
                            );
                        } else {
                            controlIns.setValue(data[key]);
                        }
                        let isHidden = hiddenControls.includes(key) ? 1 : 0;
                        controlIns.handlerDataAfterRunFormulasHidden(isHidden);
                    }
                }
            }
            this.setUploadControl();
            this.setDataApprovalHistory();
        },
        setDataApprovalHistory() {
            let approvalHistoryControl =
                this.getListInputInDocument()['approvalHistory'];
            approvalHistoryControl.value = this.docObjId;
            approvalHistoryControl.renderApprovalEle();
            this.isShowComment = true;
            approvalHistoryControl.addCommentToView(
                $(this.$refs.commentView.$el).detach()
            );
            this.scrollBottom = !this.scrollBottom;
        },
        /**
         * Đổi kích thước của khung document
         */
        togglePageSize(isFull = false) {
            if (isFull) {
                this.contentMargin = '';
                this.documentSize = 'calc(100%)';
            } else {
                this.contentMargin = this.documentSize == '21cm' ? '' : 'auto';
                this.documentSize =
                    this.documentSize == '21cm' ? 'calc(100%)' : '21cm';
            }
            this.$emit('resize-form-document');
        },
        showSideBar() {
            this.isShowFormLink = false;
            this.$refs.sidebarView.show();
        },
        getListInputInDocument() {
            return getSDocumentSubmitStore(this.keyInstance)
                .listInputInDocument;
        },
        getControlInstance(controlName) {
            return getSDocumentSubmitStore(this.keyInstance)
                .listInputInDocument[controlName];
        },
        addToListInputInDocument(name, control) {
            this.$store.commit('document/addToListInputInDocument', {
                name: name,
                control: control,
                instance: this.keyInstance
            });
        },
        processHtml() {
            let listDataFlow = [];
            var allInputControl = $(
                '#sym-Detail-' + this.keyInstance + ' .content-document'
            ).find('.s-control:not(.bkerp-input-table .s-control)');
            if (this.isPrint) {
                allInputControl = $(
                    '#sym-Detail-' +
                        this.keyInstance +
                        ' .content-print-document'
                ).find('.s-control:not(.bkerp-input-table .s-control)');
            }
            let hasTable = false;
            let thisCpn = this;
            for (let index = 0; index < allInputControl.length; index++) {
                let id = $(allInputControl[index]).attr('id');
                let controlType = $(allInputControl[index]).attr(
                    's-control-type'
                );
                if (controlType == 'dataFlow') {
                    // ẩn control dataflow khi xem chi tiết bản ghi
                    $(allInputControl[index]).addClass('d-none');
                    continue;
                }

                if (this.sDocumentEditor.allControl[id] != undefined) {
                    // ton tai id trong store
                    let idField = this.sDocumentEditor.allControl[id].id;

                    let valueInput = this.sDocumentEditor.allControl[id].value;
                    if (this.sDocumentEditor.allControl[id].properties.name) {
                        var controlName =
                            this.sDocumentEditor.allControl[id].properties.name
                                .value;
                    }
                    if (controlType == 'location' && valueInput) {
                        valueInput = JSON.parse(valueInput);
                    }
                    if (this.customDataEventRecForScheduler) {
                        for (let key in this.customDataEventRecForScheduler) {
                            if (key == controlName) {
                                valueInput =
                                    this.customDataEventRecForScheduler[key];
                            }
                        }
                    }
                    if (
                        controlType == 'submit' ||
                        controlType == 'reset' ||
                        controlType == 'draft'
                    ) {
                        $(allInputControl[index]).remove();
                    } else if (controlType == 'approvalHistory') {
                        let controlName = 'approvalHistory';
                        let control = new ActionControl(
                            idField,
                            $(allInputControl[index]),
                            this.sDocumentEditor.allControl[id],
                            thisCpn.keyInstance,
                            this.docObjId
                        );
                        control.init();
                        control.render();
                        this.isShowComment = true;
                        control.addCommentToView(
                            $(this.$refs.commentView.$el).detach()
                        );
                        this.addToListInputInDocument(controlName, control);
                        this.scrollBottom = true;
                    } else if (controlType == 'tabPage') {
                        let control = new LayoutControl(
                            idField,
                            $(allInputControl[index]),
                            this.sDocumentEditor.allControl[id],
                            thisCpn.keyInstance,
                            this.docObjId
                        );
                        control.init();
                        control.render();
                    } else {
                        let controlName =
                            this.sDocumentEditor.allControl[id].properties.name
                                .value;
                        let isHiddenControl = false;
                        if (
                            this.otherInfo.hiddenControls &&
                            this.otherInfo.hiddenControls.includes(controlName)
                        ) {
                            isHiddenControl = true;
                        }
                        if (controlType != 'table') {
                            if (controlType == 'dataFlow') {
                                let field =
                                    thisCpn.sDocumentEditor.allControl[id];
                                if (field) {
                                    let id = field.properties.dataFlowId.value
                                        .id
                                        ? field.properties.dataFlowId.value.id
                                        : field.properties.dataFlowId.value;
                                    let nodes =
                                        field.properties.mapOutputDataflow
                                            .value;
                                    let formatNodes = [];
                                    nodes.map((n) => {
                                        let opt = {
                                            value: n.nodeId,
                                            text: n.title
                                        };
                                        if (opt.value == valueInput) {
                                            opt.isSelected = true;
                                        }
                                        formatNodes.push(opt);
                                    });
                                    let controlName1 = field.value;
                                    let mapParamsDataflow =
                                        field.properties.mapParamsDataflow
                                            .value;
                                    $(allInputControl[index])
                                        .find('.run-dataflow')
                                        .removeClass('d-none');
                                    listDataFlow.push({
                                        id: id,
                                        controlName: controlName1,
                                        el: $(allInputControl[index]),
                                        mapParamsDataflow: mapParamsDataflow,
                                        nodes: formatNodes
                                    });
                                }
                            }
                            let control = new BasicControl(
                                idField,
                                $(allInputControl[index]),
                                this.sDocumentEditor.allControl[id],
                                thisCpn.keyInstance,
                                valueInput
                            );
                            if (isHiddenControl) {
                                control.hidden = true;
                                control.hideRelatedControlTitle(id);
                            }
                            control.init();
                            this.addToListInputInDocument(controlName, control);
                            control.render();
                            if (
                                this.sDocumentEditor.allControl[id].type ==
                                'department'
                            ) {
                                this.setDataForDepartment(control, controlName);
                            }
                        }
                        //truong hop la control table
                        else {
                            let controlInTable = {};
                            let tableControl = new TableControl(
                                idField,
                                $(allInputControl[index]),
                                this.sDocumentEditor.allControl[id],
                                thisCpn.keyInstance,
                                this.dataPivotTable
                                    ? this.dataPivotTable[controlName]
                                    : {},
                                this.dataGroupTable
                                    ? this.dataGroupTable[controlName]
                                    : {},
                                {},
                                this.isPrint
                            );
                            this.hasTable = true;
                            if (isHiddenControl) {
                                tableControl.hidden = true;
                            }
                            tableControl.setFormulasWorker(
                                thisCpn.formulasWorker
                            );
                            let tableEle = $(allInputControl[index]);
                            tableEle.find('.s-control').each(function () {
                                let childControlId = $(this).attr('id');
                                let childControlProp =
                                    thisCpn.sDocumentEditor.allControl[id]
                                        .listFields[childControlId];
                                let idFieldChild = childControlProp.id;
                                let childControl = new BasicControl(
                                    idFieldChild,
                                    $(this),
                                    childControlProp,
                                    thisCpn.keyInstance
                                );
                                let childControlName =
                                    childControlProp.properties.name.value;
                                if (
                                    thisCpn.otherInfo.hiddenControls &&
                                    thisCpn.otherInfo.hiddenControls.includes(
                                        childControlName
                                    )
                                ) {
                                    childControl.hidden = true;
                                }
                                if (childControlProp.type == 'department') {
                                    thisCpn.setDataForDepartment(
                                        childControl,
                                        childControlName,
                                        true
                                    );
                                }
                                childControl.init();
                                childControl.inTable = controlName;
                                thisCpn.addToListInputInDocument(
                                    childControlName,
                                    childControl
                                );
                                controlInTable[childControlName] = childControl;
                            });
                            this.listTableLoaded[controlName] = 0;
                            tableControl.controlInTable = controlInTable;
                            tableControl.renderTable();
                            this.addToListInputInDocument(
                                controlName,
                                tableControl
                            );
                            tableControl.setData(valueInput);
                            this.listTable[controlName] = tableControl;
                        }
                    }
                }
            }
            if (this.$refs.preLoaderView) {
                this.$refs.preLoaderView.hide();
            }
            this.$emit('after-loaded-component-detail', this.formSize);
            $('.wrap-content-detail').removeAttr('style');
            this.listDataFlow = listDataFlow;
            this.setHiddenControl();
            this.setUploadControl();
            if (!hasTable) {
                this.afterAllTableReady();
            }
            if (!this.quickView && !this.isMinimizeForm) {
                this.getConfigSmartObject();
            }
        },
        setStyleWhenUnfocusControl() {
            $('.s-control').removeClass('highlight-control-focus');
            $('div').removeClass('highlight-control-focus');
        },
        setStyleWhenFocusControl(data) {
            // data = {
            //     id: '7700',
            //     name: 'tb1_ngay1',
            //     type: '',
            //     inTable: {
            //         id: 'abc',
            //         name: 'tb1',
            //         type: 'table',
            //     },
            // };
            if (!data.inTable) {
                let controlIns = getControlInstanceFromStore(
                    this.keyInstance,
                    data.name
                );
                controlIns.highlightFocusControl();
            } else {
                let tableIns = getControlInstanceFromStore(
                    this.keyInstance,
                    data.inTable.name
                );
                tableIns.tableInstance.setStyleFocusHighlight(data.name);
            }
        },
        setStyleForControl(data) {
            // data = [
            //     {
            //         id: '7694',
            //         name: 'ten',
            //         type: 'user',
            //     },
            //     {
            //         id: '7694',
            //         name: 'status',
            //         type: 'user',
            //     },
            //     {
            //         id: '7694',
            //         name: 'phong_ban',
            //         type: 'user',
            //     },
            //     {
            //         id: '7700',
            //         name: 'tb1_ngay1',
            //         type: '',
            //         inTable: {
            //             id: 'abc',
            //             name: 'tb1',
            //             type: 'table',
            //         },
            //     },
            //     {
            //         id: '7700',
            //         name: 'tb1_day',
            //         type: 's',
            //         inTable: {
            //             id: 'abc',
            //             name: 'tb1',
            //             type: 'textInput',
            //         },
            //     },
            // ];
            let dataInTable = data.filter((d) => d.inTable);
            let tableConfig = {};
            dataInTable.map((d) => {
                if (!tableConfig[d.inTable.name]) {
                    tableConfig[d.inTable.name] = {};
                }
                tableConfig[d.inTable.name][d.name] = true;
            });
            data.map((control) => {
                let controlIns = getControlInstanceFromStore(
                    this.keyInstance,
                    control.name
                );
                if (!control.inTable) {
                    controlIns.highlightControls();
                } else {
                    let tableIns = getControlInstanceFromStore(
                        this.keyInstance,
                        control.inTable.name
                    );
                    tableIns.tableInstance.colorForTable =
                        tableConfig[control.inTable.name];
                    tableIns.tableInstance.setStyleHighlight(
                        tableConfig[control.inTable.name]
                    );
                }
            });
        },
        //
        setUploadControl() {
            let allControl = this.getAllControlUpload();
            let nameCurrentAndMainImg = this.findNameAndMainImg(allControl);
            this.listUploadControl.allControl = allControl;
            this.listUploadControl.currentControl = nameCurrentAndMainImg;
            this.listUploadControl.imgIdx = nameCurrentAndMainImg.index;
            this.$set(this.listUploadControl, 'allControl', allControl);
            this.$set(
                this.listUploadControl,
                'currentControl',
                allControl[nameCurrentAndMainImg.control]
            );
            this.$set(
                this.listUploadControl,
                'imgIdx',
                nameCurrentAndMainImg.index
            );
            this.$emit('set-upload-control', {
                isSetMain: false,
                listUploadControl: this.listUploadControl,
                dataTable: []
            });
        },
        // trả về control và ảnh main của control upload
        findNameAndMainImg(allControl) {
            let data = {
                control: 0,
                index: 0
            };
            allControl.map((control, controlIdx) => {
                if (control.value.length > 0) {
                    control.value.map((img, idx) => {
                        if (img.isMainPicture) {
                            (data.control = controlIdx), (data.index = idx);
                        }
                    });
                }
            });
            return data;
        },
        /*
         * Hàm ẩn các control đã được ẩn lúc submit
         */
        setHiddenControl() {
            let listInput = this.getListInputInDocument(this.keyInstance);
            for (let controlName in listInput) {
                let control = listInput[controlName];
                control.setHiddenControl();
            }
        },
        /**
         * Ham chạy lại các công thức link
         */
        handleRunLinkFormula() {
            let listInputInDocument = this.getListInputInDocument();
            for (let controlName in listInputInDocument) {
                let controlIns = listInputInDocument[controlName];
                if (typeof controlIns.getLinkFormula == 'function') {
                    let linkFormula = controlIns.getLinkFormula();
                    if (linkFormula != false) {
                        for (let i = 0; i < linkFormula.length; i++) {
                            let config = linkFormula[i];
                            let formulaInstance = config.instance;
                            let fType = 'linkConfig_' + config.formula.instance;
                            if (formulaInstance) {
                                formulaInstance.type = fType;
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
                                        fType,
                                        'root'
                                    );
                                }
                            }
                        }
                    }
                }
            }
        },
        getColIndexControl(controlEl) {
            let td = controlEl.closest('td');
            let tr = controlEl.closest('tr').css('position', 'relative');
            let tdIndex = td.index();
            return tdIndex;
        },
        async handleClickPrint() {
            let content = [];
            const listInput = this.sDocumentSubmit.listInputInDocument;
            for (let controlName in listInput) {
                let controlIns = listInput[controlName];
                if (controlIns.type == 'table') {
                    let contentFilterTable = getControlInstanceFromStore(
                        this.keyInstance,
                        controlName
                    ).tableInstance.getFilterData();
                    content.push({
                        controlName: controlName,
                        data: contentFilterTable
                    });
                }
            }
            this.$goToPage('/documents/print-multiple', 'In', false, true, {
                listObject: [{ document_object_id: this.docObjId }],
                content: content
            });
        },
        closeFormLink() {
            this.isShowFormLink = false;
        },
        // sau khi render xong hết table thì mới chạy công thức link
        afterAllTableReady() {
            if (!this.quickView) {
                this.handleRunLinkFormula();
            }
        },
        // thu nhỏ chiều rộng của view link khi đóng file preview
        closePreviewFile() {
            this.$emit('change-parent-form-link-width', 794);
        },
        changeParentFormLinkWidth(w) {
            this.panelFormLinkWidth = w;
        },
        copyLinkObject() {
            this.$refs['copyLink'].classList.remove('d-none');
            setTimeout(() => {
                this.$refs['copyLink'].classList.add('d-none');
            }, 1500);
        }
    }
};
</script>
<style>
.wrap-content-smartobj {
    height: calc(100vh - 50vh - 40px) !important;
}
</style>
<style scoped>
.show-smartonj-btn-container {
    width: 90px !important;
    height: 28px !important;
    margin-right: 16px;
    margin-top: 4px;
}
.show-smartonj-btn {
    font-size: 12px;
    line-height: 14px;
    font-family: Roboto;
    font-weight: 400;
}
.sym-form-Detail {
    width: 21cm;
    padding: 16px;
}
.wrap-content-detail {
    position: relative;
    width: 100%;
    height: 95%;
    overflow-y: auto;
    overflow-x: hidden;
}
.sym-form-Detail >>> .on-selected {
    border: none !important;
}
.sym-form-Detail >>> table:not(.htCore):not(.table-print) td,
.sym-form-Detail >>> table:not(.htCore):not(.table-print),
.sym-form-Detail >>> table:not(.htCore):not(.table-print) th {
    border: none !important;
}
.sym-form-Detail >>> .htCore td:nth-last-child(3) {
    border-right: 1px solid #ccc !important;
}
.sym-form-Detail >>> .htCore thead tr th:nth-last-child(3) {
    border-right: 1px solid #ccc !important;
}
.s-control-label {
    background: none !important;
}

#toggle-doc-size-btn {
    position: absolute;
    top: 15px;
    padding: 4px 12px;
    font-size: 20px;
    border-radius: 4px;
    background: #fafafa;
    opacity: 1;
    color: #757575;
    transition: all cubic-bezier(0.4, 0, 0.2, 1) 250ms;
}
#toggle-doc-size-btn:hover {
    background: #dddddd;
}
#toggle-doc-size-btn:focus {
    outline: none;
}
#side-bar-detail-btn {
    position: absolute;
    top: 15px;
    padding: 4px 12px;
    font-size: 20px;
    border-radius: 4px;
    background: #fafafa;
    opacity: 1;
    color: #757575;
    transition: all cubic-bezier(0.4, 0, 0.2, 1) 250ms;
}
#side-bar-detail-btn:hover {
    background: #dddddd;
}
#side-bar-detail-btn:focus {
    outline: none;
}
::v-deep .v-speed-dial {
    position: absolute;
}

.panel-header {
    height: 30px;
    display: flex;
    color: #757575;
}
.panel-header .mdi:hover {
    color: rgba(0, 0, 0 / 0.6);
}
.panel-body {
    height: calc(100vh - 55px);
}
.right-action {
    margin-left: auto;
    font-size: 15px;
}
.right-action >>> .v-icon {
    font-size: 16px !important;
}
.panel-header .mdi {
    cursor: pointer;
    margin-right: 12px;
    transition: all ease-in-out 250ms;
}
.comment-approval-view >>> .v-toolbar__content {
    display: none !important;
}
.detail-form-link {
    height: 100%;
}
.btn-close-form-link {
    font-size: 14px;
    margin-left: auto;
    margin-right: 8px;
    margin-top: 4px;
    padding: 2px 5px;
    cursor: pointer;
    border-radius: 50%;
    transition: all ease-in-out 250ms;
}
.btn-close-form-link:hover {
    background: var(--symper-background-hover);
}
.btn-edit {
    color: black;
    font-size: 12px;
    border-radius: 4px;
    height: 28px !important;
    padding: 0 12px !important;
    margin-right: 5px;
}
</style>

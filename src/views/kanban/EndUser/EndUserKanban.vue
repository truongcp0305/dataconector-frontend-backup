<template>
    <div class="h-100">
        <preloader v-if="!isRenderKanban" style="z-index: 0 !important" />
        <div :style="{ display: isRenderKanban ? 'block' : 'none' }">
            <div
                id="symper-kanban"
                :style="{
                    height: kanbanHeight + 'px!important',
                    width: kanbanWidth + '!important',
                    'margin-top': isAddFilter ? '37px' : ''
                }"
            ></div>
            <KanbanColumn
                v-if="isLoadedData"
                @change-page="changePage"
                :listColumns="listColumns"
                @open-filter-column="openFilterColumn"
                @apply-sort="applySort"
                @refresh-column="refreshColumn"
                :pageActive="pageActive"
                :columnSelected="columnSelected"
                :controlInCard="controlInCard"
            />
            <v-navigation-drawer
                v-show="isOpenFilterColumn"
                absolute
                right
                :style="{
                    width: '250px',
                    'z-index': '1',
                    'overflow-y': 'scroll',
                    height: kanbanHeight + 'px!important',
                    'border-top': '1px solid #eee',
                    'box-shadow': '-2px 0 10px rgba(0, 0, 0, 0.19)'
                }"
                class="sidebar-filter-kanban"
            >
                <ReportSelfFilter
                    v-if="isLoadedData"
                    @close="closeFilterColumn"
                    :report="dataForSelfFilter"
                    :isViewKanban="true"
                    @apply-self-filter="applySelfFilter"
                    :idDoc="idDoc"
                    :columnKanban="controlForColumn"
                    :isFilterAllKanban="isFilterAllKanban"
                />
            </v-navigation-drawer>
        </div>
        <SymperDialogConfirm
            @confirm="deletePopup.confirm()"
            @cancel="deletePopup.cancel()"
            :title="deletePopup.title"
            :content="deletePopup.content"
            :showDialog="deletePopup.show"
        />
    </div>
</template>
<script>
var kanban = require('@/../src/components/kanban/kanban/kanban.js');
var getData = require('@/../src/components/kanban/kanban/data.js');
require('@/../src/components/kanban/kanban/kanban.css');

import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';

import KanbanColumn from '@/../src/views/kanban/EndUser/KanbanColumn';
import ReportSelfFilter from '@/components/dashboard/components/ReportSelfFilter.vue';
import { documentApi } from '@/api/Document.js';
import Preloader from '@/components/common/Preloader';
import KanbanViewEnduser from 'worker-loader!@/worker/kanban/KanbanViewEnduser.Worker.js';
import { util } from '@/plugins/util';
import { appConfigs } from '@/configs.js';

export default {
    components: {
        KanbanColumn,
        ReportSelfFilter,
        Preloader,
        SymperDialogConfirm
    },
    props: {
        idDoc: {
            type: String,
            default: '3035'
        },
        filterKanban: {
            type: Object,
            default() {
                return {};
            }
        },
        instanceKey: {
            default: ''
        },
        keySearch: {
            default: ''
        }
    },
    computed: {
        conditionalFormat() {
            return util
                .cloneDeep(this.$store.state.kanban.conditionalFormat)
                .reverse();
        }
    },
    mounted() {
        const self = this;
        this.$evtBus.$on('kanban-submit-task-done', (data) => {
            self.handleSubmitTaskDone(data);
        });
        this.$evtBus.$on('change-type-flat-kanban', (data) => {
            self.groupFilter = null;
            self.refreshDataKanban();
        });

        this.$evtBus.$on('kanban-close-form-doc', () => {
            self.preventShowView = false;
        });
        this.$evtBus.$on('apply-conditional-format', (conditionalFormat) => {
            this.getConditionalFormat(conditionalFormat);
        });
        this.$evtBus.$on('get-data-kanban', (filter) => {
            self.viewByTreeview(filter);
        });
        window.getCardBefore = (e) => {
            let id = $(e).find('.card-info').attr('kanban-card-id');
            let beforeId = $('[data-drag-item=' + id + ']')
                .first()
                .next()
                .attr('data-drag-item');
            self.beforeId = beforeId;
        };
        window.viewCard = (e) => {
            let checkPermissionView = this.checkHasPermissionByAction('detail');
            if (
                !self.preventShowView &&
                !window.event.ctrlKey &&
                !window.event.metaKey &&
                checkPermissionView
            ) {
                let id = $(e).attr('kanban-card-id');
                let col = self.findCardById(id).column;
                let checkPermissionEdit =
                    self.checkHasPermissionByAction('update');
                this.$evtBus.$emit('kanban-view-card', {
                    id: id,
                    col: col,
                    editPermission: checkPermissionEdit
                });
            }
        };
        window.updateCard = (e) => {
            self.preventShowView = true;
            let id = $(e).attr('kanban-card-id');
            let col = self.findCardById(id).column;
            self.$evtBus.$emit('update-card-kanban', { id: id, col: col });
        };
        window.deleteCard = function (e) {
            self.preventShowView = true;
            let id = $(e).attr('kanban-card-id');
            self.deletePopup.show = true;
            self.deletePopup.content = self.$t('v2.kanban.confirmDeleteCard');
            self.deletePopup.title = self.$t('v2.doc.contentConfirmDelete');
            self.deletePopup.confirm = () => {
                self.deleteDocumentObject(id);
                self.deletePopup.show = false;
                self.preventShowView = false;
            };
            self.deletePopup.cancel = () => {
                self.deletePopup.show = false;
                self.preventShowView = false;
            };
        };
        window.cloneCard = function (e) {
            self.preventShowView = true;
            let id = $(e).attr('kanban-card-id');
            let col = self.findCardById(id).column;
            self.$evtBus.$emit('clone-card-kanban', { id: id, col: col });
        };
        let loopCheckLoadKanban = setInterval(() => {
            if (this.isLoadedData == true) {
                clearInterval(loopCheckLoadKanban);
                if (this.kanbanInstance.api == null) {
                    this.createInstanceKanban();
                }
            }
        }, 500);
        this.containerHeight = util.getComponentSize(this).h - 36;
    },
    data() {
        return {
            displayGroup: true,
            deletePopup: {
                show: false,
                content: '',
                title: '',
                confirm: () => {},
                cancel: () => {
                    this.show = false;
                }
            },
            groupFilter: null,
            beforeId: 0,
            allPermissionState: false, // có tất cả quyền để kéo thả full cột hay k
            preventShowView: false,
            kanbanInstance: '',
            listColumns: [],
            cards: [],
            allColumnId: '', // id cột all column để check phân quyền
            isLoadedData: false,
            isOpenFilterColumn: false,
            columnSelected: '',
            controlInCard: {},
            controlForColumn: '',
            isRenderKanban: false,
            avatarDefault: require('@/../src/assets/image/avatar_default.jpg'),
            dataForSelfFilter: {},
            pageActive: 0, // mục đích reset về page 1 khi reload/ filter
            countTasks: [],
            configColumn: [],
            listDataFilter: [],
            stateFlowConfig: {},
            listFilterSelected: [],
            isAddFilter: false,
            kanbanHeight: '',
            kanbanWidth: '100%',
            containerHeight: '',
            listSelectedCards: [], // các card đang được chọn khi kéo theo group
            mapIdTaskToIdColumn: {},
            listControlInDoc: [],
            kanbanConfig: {},
            filterAllKanban: {},
            isFilterAllKanban: false,
            fileUrl: appConfigs.apiDomain.fileManagement
        };
    },
    watch: {
        isRenderKanban: {
            immediate: true,
            deep: true,
            handler(vl) {
                if (vl) {
                    let kbHeight = this.containerHeight;
                    let heightColumn = document.querySelectorAll(
                        '#symper-kanban .row .column'
                    );
                    if (this.isAddFilter) {
                        this.kanbanHeight = kbHeight - 36;
                        for (let col in heightColumn) {
                            if (col != 'entries') {
                                heightColumn[col].style.height =
                                    kbHeight - 132 + 'px';
                            }
                        }
                    } else this.kanbanHeight = this.containerHeight;
                    this.kanbanWidth = '100%';
                    this.checkWidthKanbanWhenOpenSidebarFilter();
                }
            }
        },
        isAddFilter(vl) {
            if (!vl) {
                this.kanbanHeight = this.containerHeight;
                let heightColumn = document.querySelectorAll(
                    '#symper-kanban .row .column'
                );
                for (let col in heightColumn) {
                    if (col != 'entries') {
                        if (heightColumn[col].style) {
                            heightColumn[col].style.height =
                                this.containerHeight - 96 + 'px';
                        }
                    }
                }
            } else {
                let kbHeight = this.containerHeight;
                let heightColumn = document.querySelectorAll(
                    '#symper-kanban .row .column'
                );
                this.kanbanHeight = kbHeight - 36;
                for (let col in heightColumn) {
                    if (col != 'entries') {
                        if (heightColumn[col].style) {
                            heightColumn[col].style.height =
                                kbHeight - 132 + 'px';
                        }
                    }
                }
            }
        },
        isOpenFilterColumn(vl) {
            this.checkWidthKanbanWhenOpenSidebarFilter();
        }
    },
    methods: {
        handleGroupKanban(filter) {
            this.groupFilter = filter;
            this.refreshDataKanban();
        },
        checkWidthKanbanWhenOpenSidebarFilter() {
            if (this.isOpenFilterColumn) {
                this.kanbanWidth = 'calc(100% - 250px)';
            } else {
                this.kanbanWidth = '100%';
            }
        },
        changeStyleRightForSidebarFilter(right) {
            let sidebarFilter = document.querySelector(
                '.sidebar-filter-kanban'
            );
            sidebarFilter.style.right = right + 'px';
        },
        reRenderCreate() {
            if (this.kanbanInstance) {
                this.kanbanInstance.destructor();
            }
            let loopCheckLoadKanban = setInterval(() => {
                if (this.isLoadedData == true) {
                    clearInterval(loopCheckLoadKanban);
                    this.createInstanceKanban();
                }
            }, 500);
        },
        async refreshDataKanban() {
            this.isRenderKanban = false;
            let columns = this.listColumns;
            await this.getDataKanban();
            this.parseKanban(columns, this.cards);
            this.isRenderKanban = true;
        },
        parseKanban(columns, cards) {
            this.kanbanInstance.parse({
                columns,
                cards
            });
        },
        getConditionalFormat(data) {
            this.refreshDataKanban();
        },
        createInstanceKanban() {
            if (this.kanbanInstance.api == null || this.kanbanInstance == '') {
                const { Kanban, defaultEditorShape } = kanban;
                const { cardShape, editorShape } = getData();
                const columns = this.listColumns;
                let cards = this.cards;
                // biến tạm để render cột nếu card rỗng
                if (cards.length == 0) {
                    cards = [
                        {
                            label: 'test',
                            id: Date.now()
                        }
                    ];
                }
                let cardTemplate = this.getCardTemplate;
                this.kanbanInstance = new Kanban('#symper-kanban', {
                    cards,
                    columns,
                    cardShape,
                    cardTemplate,
                    editorShape: [...defaultEditorShape, ...editorShape]
                });
                this.listenKanbanEvent();
                // thêm vào header từng cột
                let domListHeaderColumns = document.querySelectorAll(
                    '.content .header .column'
                );
                for (let column = 0; column < columns.length; column++) {
                    let columnOption = document.querySelector(
                        '#column-option' + columns[column].key
                    );
                    if (columnOption != null) {
                        domListHeaderColumns[column].appendChild(columnOption);
                    } else {
                        if (
                            this.kanbanInstance != '' ||
                            this.kanbanInstance.api != null
                        ) {
                            this.kanbanInstance.destructor();
                        } else {
                            this.$snotifyError(
                                'err',
                                this.$t('v2.kanban.errorLoadData')
                            );
                            return;
                        }
                    }
                }
                // thêm phân trang
                let domListContentColumns = document.querySelector(
                    '.content-wrapper .content'
                );
                let pagination = document.querySelector('#column-pagination');
                if (domListContentColumns && pagination) {
                    domListContentColumns.appendChild(pagination);
                }
                for (let column = 0; column < columns.length; column++) {
                    let columnPagination = document.querySelector(
                        '#column-pagination' + columns[column].key
                    );
                    if (pagination && columnPagination) {
                        pagination.appendChild(columnPagination);
                    }
                }
                // thêm loading trên từng cột
                let domListContentRow = document.querySelector(
                    '.content-wrapper .content .row'
                );
                let loading = document.querySelector('#column-loading');
                if (domListContentColumns && loading) {
                    domListContentColumns.insertBefore(
                        loading,
                        domListContentRow
                    );
                }
                for (let column = 0; column < columns.length; column++) {
                    let columnLoading = document.querySelector(
                        '#loading-column' + columns[column].key
                    );
                    if (columnLoading) loading.appendChild(columnLoading);
                }

                // thêm thông báo cột không có thẻ nào và loading trên từng cột
                let domListColumns = document.querySelectorAll(
                    '.row .content .column '
                );
                for (let column = 0; column < columns.length; column++) {
                    let message = document.querySelector(
                        '#empty-card' + columns[column].key
                    );
                    if (message) domListColumns[column].appendChild(message);
                }
                this.isRenderKanban = true;
            }
            this.$evtBus.$emit('finish-load-data');
        },
        // xóa bản ghi document
        async deleteDocumentObject(id) {
            const self = this;
            let res = await documentApi.deleteDocumentObject({
                objectIds: JSON.stringify([id])
            });
            if (res.status == 200) {
                self.$snotify({
                    type: 'success',
                    title: self.$t('common.notification.delete_success')
                });
                self.handleWhenDeleteCard(id);
                self.deleteCardKanban(id);
            } else {
                self.$snotify({
                    type: 'error',
                    title: self.$t('common.notification.error')
                });
            }
        },
        // kiểm tra quyền theo các action
        checkHasPermissionByAction(action) {
            let docId = this.idDoc;
            let objectTypePermission =
                this.$store.state.app.userOperations['document_instance'];
            let hasCreatePermission = true;
            if (!util.auth.isSupportter()) {
                hasCreatePermission =
                    objectTypePermission &&
                    objectTypePermission[docId + ':0'] &&
                    objectTypePermission[docId + ':0'][action];
                if (!hasCreatePermission) hasCreatePermission = false;
            }
            return hasCreatePermission;
        },
        // xử lý sau khi xóa thẻ, đẩy thêm thẻ
        handleWhenDeleteCard(id) {
            let currentColumn = this.findCardById(id).column;
            this.listColumns.map((column) => {
                if (column.id == currentColumn) {
                    this.addCardToBottom(column.id);
                    column.sumCard--;
                }
            });
        },
        // lấy id card top của cột đang hiển thị
        getTopCardId(column) {
            if (this.getCardsByColumn(column)[0]) {
                return this.getCardsByColumn(column)[0].id;
            }
        },
        // lấy tất cả thẻ theo column
        getCardsByColumn(column) {
            return this.cards.filter((card) => card.column == column);
        },
        // tìm thẻ theo id
        findCardById(id) {
            return this.cards.filter((card) => card.id == id)[0];
        },
        // xử lý khi add thửa thẻ: delete khi số card lớn hơn 10
        handleRedundantCard(column) {
            if (this.getCardsByColumn(column).length > 10) {
                let bottomCardId = this.getCardsByColumn(column)[10].id;
                this.deleteCardKanban(bottomCardId);
            }
        },
        setCardInfo(
            columnId,
            before = false,
            idParentTask,
            nameParentTask,
            status,
            titleTask,
            datetime,
            duration,
            id,
            idUser,
            column,
            colorConfig
        ) {
            let card = {
                id: id,
                columnId: columnId,
                card: {
                    idParentTask: idParentTask,
                    nameParentTask: nameParentTask,
                    status: status,
                    titleTask: titleTask,
                    datetime: datetime,
                    duration: duration,
                    id: id,
                    idUser: idUser,
                    column: column,
                    colorConfig: colorConfig
                }
            };
            if (before) card.before = before;
            return card;
        },
        getColorConfig() {
            return {
                idParentTask: {
                    color: '',
                    background: ''
                },
                nameParentTask: {
                    color: '',
                    background: ''
                },
                status: {
                    color: '',
                    background: ''
                },
                titleTask: {
                    color: '',
                    background: ''
                },
                datetime: {
                    color: '',
                    background: ''
                },
                duration: {
                    color: '',
                    background: ''
                },
                backgroundAll: ''
            };
        },
        // update label
        updateLabel(columnAfter, columnBefore = false) {
            this.listColumns.map((col, colIdx) => {
                if (col.id == columnAfter) {
                    this.listColumns[colIdx].sumCard =
                        Number(this.listColumns[colIdx].sumCard) + 1;
                }
                if (col.id == columnBefore) {
                    this.listColumns[colIdx].sumCard =
                        Number(this.listColumns[colIdx].sumCard) - 1;
                }
            });
        },
        // xử lý add card sau khi submit task hoàn thành
        handleSubmitTaskDone(data) {
            this.preventShowView = false;
            let colorConfig = this.getColorConfig();
            let idParentTask =
                data[this.controlInCard['mother_card_identifier'].field];
            let nameParentTask =
                data[this.controlInCard['mother_card_title'].field];
            let status = data[this.controlInCard['priority'].field];
            let titleTask = data[this.controlInCard['title'].field];
            let datetime = data[this.controlInCard['date'].field];
            let duration = data[this.controlInCard['time'].field];
            let id = data['document_object_id'];
            let idUser = data[this.controlInCard['user'].field];
            let column = data[this.controlForColumn];
            let before = this.getTopCardId(data[this.controlForColumn]);
            let card = this.setCardInfo(
                column,
                before,
                idParentTask,
                nameParentTask,
                status,
                titleTask,
                datetime,
                duration,
                id,
                idUser,
                column,
                colorConfig
            );
            card.columnId = column;
            card.card.originRowData = data;
            if (data.type == 'create' || data.type == 'clone' ) {
                this.cards.unshift(card.card);
                this.handleRedundantCard(column);
                this.updateColorCard(card);
                this.addCardKanban(card);
            } else {
                this.updateColorCard(card);
                let updateCard = {
                    idParentTask: idParentTask,
                    nameParentTask: nameParentTask,
                    status: status,
                    titleTask: titleTask,
                    datetime: datetime,
                    duration: duration,
                    id: id,
                    idUser: idUser,
                    column: column,
                    colorConfig: colorConfig
                };
                if (before) {
                    updateCard.before = before;
                }
                let colBefore = this.findCardById(updateCard.id).column;
                this.updateCard(updateCard);
                this.updateLabel(updateCard.column, colBefore);
                this.refreshColumn(colBefore);
                this.handleRedundantCard(updateCard.column);
                this.handleFormulasUpdate(colBefore, updateCard.column, data);
            }
            this.resetData();
        },
        handleFormulasUpdate(
            colBefore,
            colAfter,
            data,
            cardId,
            listCardSelected = false
        ) {
            let formulasUpdate = this.checkFormulasUpdate(colBefore, colAfter);
            if (formulasUpdate) {
                this.runFormulasUpdate(
                    formulasUpdate,
                    data,
                    cardId,
                    listCardSelected
                );
            }
        },
        async runFormulasUpdate(
            formulasUpdate,
            data,
            cardId,
            listCardSelected
        ) {
            const self = this;
            let formulas = {
                dataInput: data,
                formulas: formulasUpdate,
                cardId: cardId,
                listCardSelected: listCardSelected
            };
            let res = await runBySymperPromiseWorker(
                this.worker,
                'sendFormular',
                formulas
            );
            if (!res) {
                // this.$snotifyError('error', this.$t('kanban.error.not_excute_formulas_update'))
            } else {
                if (res.length > 0) {
                    res.map((card) => {
                        let currentCard = self.findCardById(
                            card.document_object_id
                        );
                        Object.keys(card).map((control) => {
                            let controlNeedUpdate =
                                self.getControlUpdate(control);
                            if (controlNeedUpdate) {
                                currentCard[controlNeedUpdate] = card[control];
                            }
                        });
                        self.updateCard(currentCard);
                    });
                }
            }
        },
        // lấy control tương ứng
        getControlUpdate(controlName) {
            let field = '';
            const MAP_KEY_CARD = {
                priority: 'status',
                title: 'titleTask',
                date: 'datetime',
                time: 'duration',
                user: 'idUser',
                mother_card_title: 'nameParentTask',
                mother_card_identifier: 'idParentTask'
            };
            Object.keys(this.controlInCard).map((c) => {
                if (this.controlInCard[c].field == controlName) {
                    field = MAP_KEY_CARD[c];
                }
            });
            return field;
        },
        checkFormulasUpdate(colSource, colTarget) {
            let formulas = '';
            Object.keys(this.stateFlowConfig.links).map((link) => {
                let linkInfo = this.stateFlowConfig.links[link];
                let source = this.findValueColumnConfig(linkInfo.source);
                let target = this.findValueColumnConfig(linkInfo.target);
                if (
                    source == colSource &&
                    target == colTarget &&
                    linkInfo.formulas
                ) {
                    formulas = linkInfo.formulas;
                }
            });
            return formulas;
        },
        addCardKanban(data) {
            this.kanbanInstance.addCard(data);
            // unselect card
            let listselectedCards = this.kanbanInstance.getSelection();
            if (listselectedCards != null) {
                this.kanbanInstance.unselectCard({ id: listselectedCards[0] });
            }
        },
        deleteCardKanban(id) {
            this.kanbanInstance.deleteCard({ id: id });
        },
        getMenuCard(idTask) {
            let btnUpdate = '';
            let btnDelete = '';
            let btnClone = ''
            if (this.checkHasPermissionByAction('update')) {
                btnUpdate = `
                <div class="my-1 pa-1 kanban-dropdown-action border-4px edit-task fs-12" style="cursor: pointer;" kanban-card-id="${idTask}"  onclick="updateCard(this)">
                    ${this.$t('kanban.update')}
                </div>`;
            }
            if (this.checkHasPermissionByAction('delete')) {
                btnDelete = `
                    <div class="mb-1 pa-1 kanban-dropdown-action border-4px delete-task fs-12" style="cursor: pointer;" kanban-card-id="${idTask}" onclick="deleteCard(this)">
                        ${this.$t('common.delete')}
                    </div>`;
            }
            if (this.checkHasPermissionByAction('clone')) {
                btnClone = `
                    <div class="mb-1 pa-1 kanban-dropdown-action border-4px fs-12" style="cursor: pointer;" kanban-card-id="${idTask}" onclick="cloneCard(this)">
                        ${this.$t('common.clone')}
                    </div>`;
            }
            if (!btnUpdate && !btnDelete && !btnClone) {
                return '';
            }
            return `
            <div class="dropdown" >
                <button id="menu"
                    type="button" class=" dropbtn v-btn v-btn--flat theme--light">
                    <i class=" mdi mdi-dots-horizontal" style="font-size:15px"></i>
                </button>
                <div id="list-actions" class="dropdown-content border-4px">
                    ${btnUpdate}
                    ${btnDelete}
                    ${btnClone}
                </div>
            </div>
            `;
        },
        getCardTemplate({ cardFields, selected, cardShape }) {
            const {
                idParentTask,
                nameParentTask,
                status,
                titleTask,
                datetime,
                duration,
                colorConfig,
                idUser,
                id,
                column
            } = cardFields;
            let menu = this.getMenuCard(id);
            let domChildrenTask = `
                         <div class="card-info"
                            kanban-card-id="${id}"
                            onclick="viewCard(this)"
                            id="${column}"
                        style="background:white; border-radius:8px;color: black; padding:12px 12px 12px 12px; background: ${colorConfig.backgroundAll}!important;"
                    >
                        <span style="display: flex; justify-content: space-between">
                            <span class="status"
                                style="color: #969696;background: #F2F1F6; color: ${colorConfig.status.color};
                                background: ${colorConfig.status.background};
                                font-weight: ${colorConfig.status.fontWeight};
                                font-style: ${colorConfig.status.fontStyle};
                                text-decoration: ${colorConfig.status.textDecoration};
                                border-radius:100px; padding:2px 8px;font-size:11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; max-width: 270px; line-height: 15px;">
                                ${status}
                            </span>
                            ${menu}

                        </span>
                        <div class="title-task"
                            style="color: ${colorConfig.titleTask.color};
                                    background: ${colorConfig.titleTask.background};
                                    font-weight: ${colorConfig.titleTask.fontWeight};
                                    font-style: ${colorConfig.titleTask.fontStyle};
                                    text-decoration: ${colorConfig.titleTask.textDecoration};
                                    font-size:13px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; min-height: 15px; margin-top: 8px" >
                            ${titleTask}
                        </div>
                        <div class="duration-and-time"
                            style="margin-top:8px; display: flex; justify-content: space-between; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >
                            <div>
                                <img style="width:20px;height:20px; border-radius:12px; float:left; margin: 0px 8px 0px 0px"
                                    src="${this.fileUrl}user-avatar?userId=${idUser}"
                                    onerror="this.src='${this.avatarDefault}'"/>
                                <span style="
                                    color: #969696;
                                    color: ${colorConfig.duration.color};
                                    background: ${colorConfig.duration.background};
                                    font-weight: ${colorConfig.duration.fontWeight};
                                    font-style: ${colorConfig.duration.fontStyle};
                                    text-decoration: ${colorConfig.duration.textDecoration}; font-size:12px;" >
                                ${duration}
                                </span>
                            </div>
                            <div style=" color: #969696; color: ${colorConfig.datetime.color};
                                background: ${colorConfig.datetime.background};
                                font-weight: ${colorConfig.datetime.fontWeight};
                                font-style: ${colorConfig.datetime.fontStyle};
                                text-decoration: ${colorConfig.datetime.textDecoration};
                                font-size:12px; line-height: 20px; width: 86px;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                                display: inline-block;
                                text-align: right;" >
                            ${datetime}
                            </div>
                        </div>
                    </div>
                    `;
            if (idParentTask) {
                return (
                    `
                    <div  onmousedown="getCardBefore(this)" className="custom-card" style="background:#D6E3FF; border-radius:8px; color: black; padding: 6px 4px 4px 4px; ">
                        <div className="name-parent-card" style="padding:0px 8px 4px 8px; font-size:11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; ">
                            <span style="color: ${colorConfig.idParentTask.color}; background: ${colorConfig.idParentTask.background}; font-weight: ${colorConfig.idParentTask.fontWeight}; font-style: ${colorConfig.idParentTask.fontStyle}; text-decoration: ${colorConfig.idParentTask.textDecoration};" >
                            ${idParentTask}
                            </span>
                            &nbsp;-
                            <span style="
                                color: ${colorConfig.nameParentTask.color};
                                background: ${colorConfig.nameParentTask.background};
                                font-weight: ${colorConfig.nameParentTask.fontWeight};
                                font-style: ${colorConfig.nameParentTask.fontStyle};
                                text-decoration: ${colorConfig.nameParentTask.textDecoration};" >
                            ${nameParentTask}
                            </span>
                        </div>
                        ` +
                    domChildrenTask +
                    `
                    </div>
                `
                );
            } else {
                return domChildrenTask;
            }
        },
        async getCards() {
            let self = this;
            this.kanbanConfig = {
                controlForColumn: this.controlForColumn,
                listColumns: this.configColumn,
                controlInCard: this.controlInCard,
                docId: this.idDoc,
                conditionalFormat: this.conditionalFormatConfig,
                allUsers: this.$store.state.app.allUsers
            };

            if (self.keySearch) {
                self.kanbanConfig['keySearch'] = this.keySearch;
            }
            if (self.listDataFilter.length != 0) {
                self.kanbanConfig['filter'] = this.listDataFilter;
            }
            if (self.groupFilter) {
                self.kanbanConfig['groupFilter'] = this.groupFilter;
            }
            if (self.conditionalFormat) {
                self.kanbanConfig.conditionalFormat = [
                    ...self.conditionalFormatConfig,
                    ...self.conditionalFormat
                ];
            }
            let getData = [
                runBySymperPromiseWorker(
                    self.worker,
                    'getTasksForAllColumns',
                    self.kanbanConfig
                ),
                runBySymperPromiseWorker(
                    self.worker,
                    'getCountTaskPerColumn',
                    self.kanbanConfig
                )
            ];
            await Promise.all(getData)
                .then((rsl) => {
                    self.cards = rsl[0];
                    self.countTasks = rsl[1];
                    let mapData = runBySymperPromiseWorker(
                        this.worker,
                        'getMapIdTaskToIdColumn',
                        self.cards
                    );
                    mapData.then((rsl) => {
                        self.mapIdTaskToIdColumn = rsl;
                    });
                })
                .catch((err) => {
                    this.$snotify({
                        type: 'error',
                        title: err.title,
                        message: err.message ? err.message : ''
                    });
                });
        },

        listenKanbanEvent() {
            this.kanbanInstance.api.on('move-card', (data) => {
                let listSelectedCards = this.kanbanInstance.getSelection();
                if (listSelectedCards == null) {
                    listSelectedCards = [];
                }
                if (listSelectedCards.length != 0) {
                    this.listSelectedCards = listSelectedCards;
                    // unselect card
                    listSelectedCards.map((card) => {
                        this.kanbanInstance.unselectCard({ id: card });
                    });
                    this.changeStatusCard(data, listSelectedCards);
                } else {
                    let check = false;
                    this.listSelectedCards.map((card) => {
                        if (card == data.id) {
                            check = true;
                        }
                    });
                    if (!check) {
                        this.changeStatusCard(data);
                    }
                }
            });
            this.kanbanInstance.api.on('select-card', (data) => {
                if (!data.groupMode) {
                    this.kanbanInstance.unselectCard({ id: data.id });
                }
            });
        },
        disableMoveCard() {
            let domKanbans = document.querySelector('#symper-kanban');
            domKanbans.style.pointerEvents = 'none';
        },
        enableMoveCard() {
            let domKanbans = document.querySelector('#symper-kanban');
            domKanbans.style.pointerEvents = 'visible';
        },
        // mở sidebar fiter cho từng cột
        openFilterColumn(idColumn) {
            this.isFilterAllKanban = false;
            this.columnSelected = idColumn;
            this.listColumns.map((col, index) => {
                if (col.id == idColumn) {
                    this.dataForSelfFilter = col.dataFilterColumn;
                }
            });
            this.isOpenFilterColumn = true;
        },
        closeFilterColumn() {
            this.isOpenFilterColumn = false;
        },
        openFilterAllKanban() {
            // lấy lại filter khi đã cấu hình filter trước đó
            let hasFilterAllKanban = false;
            if (this.listFilterSelected.length != 0) {
                for (let colId in this.listFilterSelected) {
                    let groupFilterItem = this.listFilterSelected[colId];
                    for (let key in groupFilterItem) {
                        if (key == 'allColumn') {
                            this.filterAllKanban = util.cloneDeep(
                                groupFilterItem[key].dataFilterColumn
                            );
                            hasFilterAllKanban = true;
                        }
                    }
                }
            }
            if (!hasFilterAllKanban && !this.isAddFilter) {
                this.dataForSelfFilter = {};
                this.isOpenFilterColumn = false;
                this.filterAllKanban = {};
            } else {
                if (JSON.stringify(this.filterAllKanban) == '{}') {
                    let defaultFilterConfig = {
                        hasSelfFilter: true,
                        rawConfigs: {
                            setting: {
                                column: {
                                    selectedColums: []
                                }
                            },
                            style: {
                                title: {
                                    children: {
                                        titleText: {
                                            value: ''
                                        }
                                    }
                                }
                            }
                        },
                        sharedConfigs: {
                            cellId: 'allColumn',
                            data: [],
                            filter: {},
                            selfFilter: {
                                cols: {},
                                applied: false,
                                opening: []
                            },
                            searchKey: ''
                        },
                        viewConfigs: {
                            displayOptions: {}
                        }
                    };
                    for (let control in this.listControlInDoc) {
                        let isControlUser = false;
                        if (this.listControlInDoc[control].type == 'user') {
                            isControlUser = true;
                        }
                        let configFilter = {
                            as: this.listControlInDoc[control].headerName,
                            name: this.listControlInDoc[control].field,
                            type: this.listControlInDoc[control].type,
                            sort: 'none',
                            desInfo: {
                                as: this.listControlInDoc[control].headerName,
                                des: this.listControlInDoc[control].headerName
                            },
                            cond: {
                                type: 'notin',
                                val: ''
                            },
                            isControlUser: isControlUser
                        };
                        if (
                            configFilter.type != 'text' &&
                            configFilter.type != 'date' &&
                            configFilter.type != 'number' &&
                            configFilter.type != 'datetime'
                        ) {
                            configFilter.type = 'text';
                        }
                        defaultFilterConfig.rawConfigs.setting.column.selectedColums.push(
                            configFilter
                        );
                    }
                    this.filterAllKanban = defaultFilterConfig;
                }
                this.dataForSelfFilter = this.filterAllKanban;
                this.isFilterAllKanban = true;
                this.isOpenFilterColumn = true;
            }
        },
        viewByTreeview(data) {
            this.handleGroupKanban(data);
        },
        changePage(vl) {
            // reset biến
            this.pageActive = 0;
            this.columnSelected = vl.index;
            this.getCardsForAColumn(vl.index, vl.page);
        },
        // lấy dữ liệu các thẻ trong 1 cột
        getDataAColumn(idColumn, page = false) {
            this.showOverlayColumn(idColumn);
            let filter = {};
            filter['controlForColumn'] = this.controlForColumn;
            filter['idDoc'] = this.idDoc;
            filter['column'] = idColumn;
            filter['dataForSelfFilter'] = [];
            filter['keySearch'] = this.keySearch;
            for (let ft of this.listDataFilter) {
                for (let colId in ft) {
                    if (colId == 'allColumn') {
                        filter['dataForSelfFilter'].push(
                            ft[colId].dataFilterColumn
                        );
                    } else if (colId == idColumn && colId != 'allColumn') {
                        filter['dataForSelfFilter'].push(
                            ft[colId].dataFilterColumn
                        );
                    }
                }
            }
            if (page) {
                filter['page'] = page;
            }
            if (this.groupFilter) {
                filter.groupFilter = this.groupFilter;
            }

            let workerData = {
                filter,
                controlForColumn: this.controlForColumn,
                listColumns: this.configColumn,
                controlInCard: this.controlInCard,
                docId: this.idDoc,
                conditionalFormat: this.conditionalFormatConfig,
                allUsers: this.$store.state.app.allUsers
            };
            if (this.conditionalFormat) {
                workerData.conditionalFormat = [
                    ...this.conditionalFormatConfig,
                    ...this.conditionalFormat
                ];
            }
            let res = runBySymperPromiseWorker(
                this.worker,
                'getTasksForAColumns',
                workerData
            );
            return res;
        },
        // render lai cac the trong 1 cot
        getCardsForAColumn(idColumn, page = false) {
            let res = this.getDataAColumn(idColumn, page);
            res.then((rsl) => {
                // xóa card
                let deletedCard = [];
                this.cards.map((card, index) => {
                    if (card.column == idColumn) {
                        this.deleteCardKanban(card.id);
                        deletedCard.push(card);
                    }
                });
                this.deleteCards(deletedCard);

                rsl.tasks.map((obj) => {
                    // add card
                    this.addCardKanban({
                        id: obj.id,
                        columnId: obj.column,
                        card: obj
                    });
                    this.cards.push(obj);
                });
                this.listColumns.map((col) => {
                    if (col.id == idColumn) {
                        col.sumCard = rsl.countTask;
                    }
                });
                this.hideOverlayColumn(idColumn);
                let scroll = document.querySelector(
                    'div[data-drop-area=' + idColumn + ']'
                );
                scroll.scrollTop = 0;
                this.resetData();
            });
        },
        updateCard(card) {
            let kanban = this.kanbanInstance;
            this.cards.map((c, cIdx) => {
                if (c.id == card.id) {
                    this.cards[cIdx] = card;
                }
            });
            kanban.updateCard(card);
            this.resetData();
        },
        applySort(idColumn) {
            this.pageActive = 1;
            this.listColumns.map((col, index) => {
                if (col.id == idColumn) {
                    this.dataForSelfFilter = col.dataFilterColumn;
                    let obj = {};
                    obj[idColumn] = col;
                    this.listDataFilter.push(obj);
                }
            });
            this.columnSelected = idColumn;
            this.getCardsForAColumn(idColumn);
            this.$evtBus.$emit('kanban-save-ui-config', this.listDataFilter);
        },
        // custom dữ liệu để filter, sort trên từng cột
        createDataFilterColumn() {
            for (let column = 0; column < this.listColumns.length; column++) {
                // lấy lại filter khi có bộ lọc mặc định
                if (this.listFilterSelected.length != 0) {
                    for (let colId in this.listFilterSelected) {
                        let groupFilterItem = this.listFilterSelected[colId];
                        for (let key in groupFilterItem) {
                            if (this.listColumns[column].id == key) {
                                this.listColumns[column].dataFilterColumn =
                                    util.cloneDeep(
                                        groupFilterItem[key].dataFilterColumn
                                    );
                            }
                        }
                    }
                }
                if (!this.listColumns[column].dataFilterColumn) {
                    let defaultFilterConfig = {
                        hasSelfFilter: true,
                        rawConfigs: {
                            setting: {
                                column: {
                                    selectedColums: []
                                }
                            },
                            style: {
                                title: {
                                    children: {
                                        titleText: {
                                            value: this.listColumns[column]
                                                .label
                                        }
                                    }
                                }
                            }
                        },
                        sharedConfigs: {
                            cellId: this.listColumns[column].id,
                            data: [],
                            filter: {},
                            selfFilter: {
                                cols: {},
                                applied: false,
                                opening: []
                            },
                            searchKey: ''
                        },
                        viewConfigs: {
                            displayOptions: {}
                        }
                    };
                    for (let control in this.listControlInDoc) {
                        let isControlUser = false;
                        if (this.listControlInDoc[control].type == 'user') {
                            isControlUser = true;
                        }
                        let configFilter = {
                            as: this.listControlInDoc[control].headerName,
                            name: this.listControlInDoc[control].field,
                            type: this.listControlInDoc[control].type,
                            sort: 'none',
                            desInfo: {
                                as: this.listControlInDoc[control].headerName,
                                des: this.listControlInDoc[control].headerName
                            },
                            cond: {
                                type: 'notin',
                                val: ''
                            },
                            isControlUser: isControlUser
                        };
                        if (
                            configFilter.type != 'text' &&
                            configFilter.type != 'date' &&
                            configFilter.type != 'number' &&
                            configFilter.type != 'datetime'
                        ) {
                            configFilter.type = 'text';
                        }
                        defaultFilterConfig.rawConfigs.setting.column.selectedColums.push(
                            configFilter
                        );
                    }
                    this.listColumns[column]['dataFilterColumn'] =
                        defaultFilterConfig;
                }
            }
        },
        // xử lý apply filter
        applySelfFilter(idColumn) {
            let self = this;
            this.listColumns.map((col, index) => {
                if (col.id == idColumn) {
                    let obj = {};
                    obj[idColumn] = col;
                    if (self.listDataFilter.length == 0) {
                        self.listDataFilter.push(obj);
                    } else {
                        for (let filter of self.listDataFilter) {
                            for (let colId in filter) {
                                if (colId == idColumn) {
                                    filter = obj;
                                } else {
                                    self.listDataFilter.push(obj);
                                }
                            }
                        }
                    }
                }
            });
            if (idColumn == 'allColumn') {
                let obj = {};
                obj['allColumn'] = {};
                obj['allColumn']['dataFilterColumn'] = this.filterAllKanban;
                if (self.listDataFilter.length == 0) {
                    self.listDataFilter.push(obj);
                } else {
                    for (let filter of self.listDataFilter) {
                        for (let colId in filter) {
                            if (colId == idColumn) {
                                filter = obj;
                            } else {
                                self.listDataFilter.push(obj);
                            }
                        }
                    }
                }
            }
            this.$evtBus.$emit('kanban-save-ui-config', this.listDataFilter);
            if (idColumn != 'allColumn') {
                this.getCardsForAColumn(idColumn);
            } else {
                this.refreshKanban();
            }
        },
        refreshColumn(idColumn) {
            this.columnSelected = idColumn;
            this.changePage({ index: idColumn, page: 1 });
            this.pageActive = 1;
        },
        // tìm giá trị column ứng với target state flow
        findValueColumnConfig(col, defaultCol) {
            // check có all column
            let colId = this.stateFlowConfig.nodes[col].attrs.colId;
            let valueColumn = this.configColumn.filter(
                (col) => col.id == colId
            );
            valueColumn = valueColumn.length > 0 ? valueColumn[0].value : '';
            if (col == this.allColumnId) valueColumn = defaultCol;
            return valueColumn;
        },
        // kiểm tra quyền khi kéo card sang cột khác
        checkPermissionWhenDragCard(valColSource, valColTarget) {
            const self = this;
            let hasPermission = false; // cho kéo k
            let permissions =
                this.$store.state.app.userOperations['stateflow_flow'];
            if (permissions) {
                Object.keys(permissions).map((permissionId) => {
                    if (
                        permissions[permissionId] &&
                        permissions[permissionId].use
                    ) {
                        let allNamePermission = Object.values(
                            self.stateFlowConfig.links
                        );
                        let name = allNamePermission.filter(
                            (per) =>
                                self.idDoc + '_' + per.oldId == permissionId
                        );
                        if (name.length > 0) {
                            let targetId = name[0].target; // đích là cột được kéo
                            let sourceId = name[0].source; //
                            let nameSourceColumn = self.findValueColumnConfig(
                                sourceId,
                                valColSource
                            );
                            let nameTargetColumn = self.findValueColumnConfig(
                                targetId,
                                valColTarget
                            );
                            if (
                                nameTargetColumn == valColTarget &&
                                nameSourceColumn == valColSource
                            )
                                hasPermission = true;
                        }
                    }
                });
            }
            return hasPermission;
        },
        checkOpenFormSubmitWhenDragCard(colSource, colTarget){
            let openForm = false;
            Object.keys(this.stateFlowConfig.links).map((link) => {
                let linkInfo = this.stateFlowConfig.links[link];
                let source = this.findValueColumnConfig(linkInfo.source);
                let target = this.findValueColumnConfig(linkInfo.target);
                if (
                    source == colSource &&
                    target == colTarget &&
                    linkInfo.isShowFormWhenDrag
                ) {
                    openForm = true
                }
            });
            return openForm;
        },
        // xử lý quay thẻ lại cột cũ
        backCardToOldCol(data, col) {
            let oldcard = data;
            oldcard.columnId = col;
            oldcard.card.column = col;
            oldcard.before = this.beforeId;
            delete oldcard.rowId;
            this.deleteCardKanban(data.id);
            this.addCardKanban(oldcard);
        },
        async changeStatusCard(data, listSelectedCards = false) {
            this.disableMoveCard();
            let self = this;
            // xác định trạng thái lúc đầu của card
            let oldStatus = this.mapIdTaskToIdColumn[data.id];
            // gom nhóm các card được kéo theo từng cột
            if (listSelectedCards) {
                var listColumnChangeStatus = {};
                for (let cardSelected of listSelectedCards) {
                    let colId = self.mapIdTaskToIdColumn[cardSelected];
                    if (listColumnChangeStatus[colId]) {
                        listColumnChangeStatus[colId].push(cardSelected);
                    } else {
                        listColumnChangeStatus[colId] = [cardSelected];
                    }
                }
            }
            if (oldStatus != data.columnId) {
                // thay đổi dữ liệu bản ghi khi kéo card sang cột khác
                let config = {
                    controlForColumn: this.controlForColumn,
                    data: data,
                    idDoc: this.idDoc,
                    conditionalFormat: this.conditionalFormatConfig
                };
                if (listSelectedCards) {
                    // xử lý quay lại thẻ khi kéo thẻ từ nhiều cột
                    let checkPermission = true;
                    Object.keys(listColumnChangeStatus).map((status) => {
                        if (
                            status &&
                            !this.allPermissionState &&
                            !this.checkPermissionWhenDragCard(
                                status,
                                data.columnId
                            )
                        ) {
                            // k có quyền
                            this.$snotifyError(
                                '',
                                this.$t('kanban.error.not_permission') + status
                            );
                            this.refreshColumn(status);
                            checkPermission = false;
                        }
                    });
                    if (!checkPermission) {
                        self.listSelectedCards = [];
                        this.enableMoveCard();
                        return;
                    }
                    for (let cardSelected of listSelectedCards) {
                        config.data.id = cardSelected;
                        let updateSuccess = await runBySymperPromiseWorker(
                            this.worker,
                            'updateDocument',
                            config
                        );
                        if (!updateSuccess) {
                            data.id = cardSelected;
                            data.card.id = cardSelected;
                            this.$snotifyError(
                                this.$t('v2.doc.error'),
                                this.$t('v2.kanban.errorWhenChangeStatusTask')
                            );
                            // this.backCardToOldCol(data, oldStatus)
                            this.refreshColumn(oldStatus);
                            listSelectedCards = listSelectedCards.filter(
                                (card) => !cardSelected
                            );
                        } else {
                            this.handleFormulasUpdate(
                                oldStatus,
                                data.columnId,
                                false,
                                data.card.id,
                                listSelectedCards
                            );
                        }
                    }
                    if (listSelectedCards.length != 0) {
                        for (let cardSelected of listSelectedCards) {
                            // thay đổi trạng thái của card theo trạng thái mới
                            this.cards.map((card) => {
                                if (card.id == cardSelected) {
                                    card.column = data.columnId;
                                    // update format cho card
                                    this.updateColorCard({
                                        card: card,
                                        columnId: data.columnId
                                    });
                                }
                            });
                        }
                    } else {
                        this.enableMoveCard();
                        return;
                    }
                } else {
                    if (
                        oldStatus &&
                        !this.allPermissionState &&
                        !this.checkPermissionWhenDragCard(
                            oldStatus,
                            data.columnId
                        )
                    ) {
                        // k có quyền
                        this.$snotifyError(
                            '',
                            this.$t('kanban.error.not_permission') +
                                data.columnId
                        );
                        this.refreshColumn(oldStatus);
                        this.enableMoveCard();
                        return;
                    }
                    if (oldStatus && this.checkOpenFormSubmitWhenDragCard(
                            oldStatus,
                            data.columnId
                        )
                    ) {
                        this.refreshColumn(oldStatus);
                        this.enableMoveCard();
                        this.preventShowView = true;
                        this.$evtBus.$emit('update-card-kanban', { id: data.id, col: oldStatus, newCol: data.columnId, controlName: this.controlForColumn});
                        return;
                    }
                    let updateSuccess = await runBySymperPromiseWorker(
                        this.worker,
                        'updateDocument',
                        config
                    );
                    if (!updateSuccess) {
                        this.$snotifyError(
                            this.$t('v2.doc.error'),
                            this.$t('v2.kanban.errorWhenDragCard')
                        );
                        this.refreshColumn(oldStatus);
                        this.enableMoveCard();
                        return;
                    } else {
                        this.handleFormulasUpdate(
                            oldStatus,
                            data.columnId,
                            false,
                            data.card.id
                        );
                    }
                    // thay đổi trạng thái của card theo trạng thái mới
                    this.cards.map((card) => {
                        if (card.id == data.id) {
                            card.column = data.columnId;
                        }
                    });
                    this.updateColorCard(data);
                }

                // thay đổi giao diện ( tổng số thẻ trong cột )
                this.listColumns.map((column) => {
                    if (listSelectedCards) {
                        if (Object.keys(listColumnChangeStatus).length <= 1) {
                            // add thêm card ở cột cũ nếu phân trang > 10
                            if (column.id == oldStatus && column.sumCard > 10) {
                                let countCards = 0;
                                if (
                                    column.sumCard - 10 <
                                    listSelectedCards.length
                                ) {
                                    countCards = column.sumCard - 10;
                                } else {
                                    countCards = listSelectedCards.length;
                                }
                                this.addCardToBottom(column.id, countCards);
                            }
                            if (column.id == oldStatus) {
                                column.sumCard =
                                    Number(column.sumCard) -
                                    listSelectedCards.length;
                            }
                            if (column.id == data.columnId) {
                                column.sumCard =
                                    Number(column.sumCard) +
                                    listSelectedCards.length;
                            }
                            // xóa card cuối cùng ở cột mới nếu phân trang > 10
                            if (
                                column.id == data.columnId &&
                                column.sumCard > 10
                            ) {
                                let listCardInColumn =
                                    self.kanbanInstance.getAreaCards(
                                        data.columnId
                                    );
                                listSelectedCards.map((card, index) => {
                                    this.deleteCardKanban(
                                        listCardInColumn[
                                            listCardInColumn.length -
                                                listSelectedCards.length +
                                                index
                                        ].id
                                    );
                                    let cardDelete = {
                                        id: listCardInColumn[
                                            listCardInColumn.length -
                                                listSelectedCards.length +
                                                index
                                        ].id
                                    };
                                    this.deleteCards([cardDelete]);
                                });
                            }
                        } else {
                            if (column.id == data.columnId) {
                                column.sumCard += listSelectedCards.length;
                            }
                            // xóa card cuối cùng ở cột mới nếu phân trang > 10
                            if (
                                column.id == data.columnId &&
                                column.sumCard > 10
                            ) {
                                let listCardInColumn =
                                    self.kanbanInstance.getAreaCards(
                                        data.columnId
                                    );
                                listSelectedCards.map((card, index) => {
                                    this.deleteCardKanban(
                                        listCardInColumn[
                                            listCardInColumn.length -
                                                listSelectedCards.length +
                                                index
                                        ].id
                                    );
                                    let cardDelete = {
                                        id: listCardInColumn[
                                            listCardInColumn.length -
                                                listSelectedCards.length +
                                                index
                                        ].id
                                    };
                                    this.deleteCards([cardDelete]);
                                });
                            }
                            for (let oldColumn in listColumnChangeStatus) {
                                // add thêm card ở cột cũ nếu phân trang > 10
                                if (
                                    column.id == oldColumn &&
                                    column.sumCard > 10
                                ) {
                                    this.getCardsForAColumn(oldColumn);
                                }
                                if (column.id == oldColumn) {
                                    column.sumCard -=
                                        listColumnChangeStatus[
                                            oldColumn
                                        ].length;
                                }
                            }
                        }
                    } else {
                        // add thêm card ở cột cũ nếu phân trang > 10
                        if (column.id == oldStatus && column.sumCard > 10) {
                            this.addCardToBottom(column.id);
                        }
                        if (column.id == oldStatus) {
                            column.sumCard--;
                        }
                        if (column.id == data.columnId) {
                            column.sumCard++;
                        }
                        // xóa card cuối cùng ở cột mới nếu phân trang > 10
                        if (column.id == data.columnId && column.sumCard > 10) {
                            let listCardInColumn =
                                this.kanbanInstance.getAreaCards(data.columnId);
                            if (listCardInColumn && listCardInColumn[10]) {
                                this.deleteCardKanban(listCardInColumn[10].id);
                                let card = { id: listCardInColumn[10].id };
                                this.deleteCards([card]);
                            }
                        }
                    }
                });
            }
            this.resetData();
            this.enableMoveCard();
        },
        resetData(){
            let mapData = runBySymperPromiseWorker(
                this.worker,
                'getMapIdTaskToIdColumn',
                this.cards
            );
            mapData.then((rsl) => {
                this.mapIdTaskToIdColumn = rsl;
            });         
        },
        // update giao diện card nếu có trường thông tin trên card trùng với thông tin cột
        updateColorCard(data) {
            let allUsers = this.$store.state.app.allUsers;
            const MAP_KEY_CARD = {
                status: 'priority',
                titleTask: 'title',
                datetime: 'date',
                duration: 'time',
                idUser: 'user',
                nameParentTask: 'mother_card_title',
                idParentTask: 'mother_card_identifier'
            };
            let updateCard = data.card;
            for (let card in this.controlInCard) {
                let keyCard = '';
                for (let key in MAP_KEY_CARD) {
                    if (MAP_KEY_CARD[key] == card) {
                        if (
                            this.controlForColumn ==
                            this.controlInCard[card].field
                        ) {
                            keyCard = key;
                        }
                        if (
                            this.controlInCard[card].type == 'user' &&
                            key != 'idUser'
                        ) {
                            let userName = allUsers.filter(
                                (user) => user.id == data.card[key]
                            );
                            if (userName.length > 0) {
                                data.card[key] = userName[0].displayName;
                            }
                        }
                    }
                }
                if (this.controlForColumn == this.controlInCard[card].field) {
                    updateCard[keyCard] = data.columnId;
                }
            }
            updateCard.originRowData[this.controlForColumn] = data.columnId;
            if (updateCard.colorConfig.backgroundAll) {
                updateCard.colorConfig.backgroundAll = '';
            }
            let resetColor = this.getColorConfig();
            updateCard.colorConfig = util.cloneDeep(resetColor);
            let rsl = this.getNewFormatForACard(updateCard);
            rsl.then((newCard) => {
                this.updateCard(newCard[0]);
            });
        },
        getNewFormatForACard(card) {
            let rsl = runBySymperPromiseWorker(
                this.worker,
                'calcConditionalFormat',
                { tasks: [card], config: this.kanbanConfig }
            );
            return rsl;
        },
        deleteCards(listDeletedCards) {
            listDeletedCards.map((card) => {
                this.cards = this.cards.filter((item) => item.id != card.id);
            });
        },
        // thêm 1 card ở dưới cùng của cột
        async addCardToBottom(idColumn, countCards = false) {
            let res = await this.getDataAColumn(idColumn);
            res = res.tasks;
            this.hideOverlayColumn(idColumn);
            // add nhiều card
            if (countCards) {
                for (let card = 0; card < countCards; card++) {
                    this.addCardKanban({
                        id: res[res.length - countCards + card].id,
                        columnId: res[res.length - countCards + card].column,
                        card: res[res.length - countCards + card]
                    });
                    this.cards.push(res[res.length - countCards + card]);
                }
            } else {
                // add 1 card
                this.addCardKanban({
                    id: res[9].id,
                    columnId: res[9].column,
                    card: res[9]
                });
                this.cards.push(res[9]);
            }
            this.resetData();
        },
        showOverlayColumn(idColumn) {
            this.listColumns.map((column) => {
                if (column.id == idColumn) {
                    column.isLoadingDataColumn = true;
                }
            });
            let domListCards = document.querySelectorAll(
                '.row .content .column .card #' + idColumn + ''
            );
            for (let card = 0; card < domListCards.length; card++) {
                domListCards[card].style.opacity = 0.4;
                domListCards[card].style.pointerEvents = 'none';
            }
        },
        hideOverlayColumn(idColumn) {
            this.listColumns.map((column) => {
                if (column.id == idColumn) {
                    column.isLoadingDataColumn = false;
                }
            });
            let domListCards = document.querySelectorAll(
                '.row .content .column .card #' + idColumn + ''
            );
            for (let card = 0; card < domListCards.length; card++) {
                domListCards[card].style.opacity = 1;
                domListCards[card].style.pointerEvents = 'visible';
            }
        },
        async refreshKanban() {
            this.isRenderKanban = false;
            this.isLoadedData = false;
            await this.getDataKanban();
            this.reRenderCreate();
        },
        customData() {
            let customColumn = [];
            this.configColumn.map((column, key) => {
                customColumn.push({});
                customColumn[key]['label'] = column.name;
                customColumn[key]['id'] = column.value;
                customColumn[key]['key'] = column.id;
                customColumn[key]['sumCard'] = 0;
                this.countTasks.map((col) => {
                    if (col[this.controlForColumn] == column.value) {
                        customColumn[key]['sumCard'] = parseInt(
                            col.document_object_id
                        );
                    }
                });
                customColumn[key]['isLoadingDataColumn'] = false;
            });
            this.listColumns = customColumn;
            this.createDataFilterColumn();
        },
        async searchKanban(vl) {
            if(vl != this.kanbanConfig.keySearch){
                await this.refreshKanban();
            }
        },
        setAllColumnId() {
            Object.keys(this.stateFlowConfig.nodes).map((nodeId) => {
                if (
                    this.stateFlowConfig.nodes[nodeId].attrs.text.text ==
                    'Tất cả cột'
                ) {
                    this.allColumnId = nodeId;
                }
            });
        },
        async getDataKanban() {
            try {
                let getData = [
                    runBySymperPromiseWorker(
                        this.worker,
                        'getKanban',
                        this.idDoc
                    ),
                    runBySymperPromiseWorker(
                        this.worker,
                        'getAllControl',
                        this.idDoc
                    )
                ];
                await Promise.all(getData).then(async (rsl) => {
                    if (rsl[1][rsl[0].data.control_for_column]) {
                        this.controlForColumn =
                            rsl[1][rsl[0].data.control_for_column].field;
                        this.configColumn = JSON.parse(
                            rsl[0].data.column_config
                        );
                        this.controlInCard = JSON.parse(
                            rsl[0].data.card_config
                        );
                        this.$evtBus.$emit(
                            'get-card-kanban',
                            this.controlInCard
                        );
                        this.stateFlowConfig = JSON.parse(
                            rsl[0].data.state_config
                        );
                        this.setAllColumnId();
                        if (
                            JSON.stringify(this.stateFlowConfig.links) == '{}'
                        ) {
                            this.allPermissionState = true;
                        }
                        this.conditionalFormatConfig = JSON.parse(
                            rsl[0].data.conditional_format
                        );
                        // lấy thông tin card
                        await this.getCards();
                        this.listControlInDoc = rsl[1];
                        this.customData();
                        this.isLoadedData = true;
                        this.$evtBus.$emit('get-all-control', rsl[1]);
                    } else {
                        this.isRenderKanban = true;
                        this.$snotifyError(
                            'err',
                            this.$t('v2.kanban.recheckConfig')
                        );
                    }
                });
            } catch (error) {
                this.isRenderKanban = true;
                this.$snotifyError(
                    'err',
                    this.$t('v2.kanban.errorLoadData')
                );
            }
        }
    },
    async created() {
        this.listDataFilter = [
            {
                allColumn: {
                    dataFilterColumn: this.$store.state.document.filterConfig
                }
            }
        ];
        this.$evtBus.$on(
            'showlist-update-report',
            async (instanceKey, typeView) => {
                if (instanceKey == this.instanceKey && typeView == 'kanban') {
                    this.listDataFilter = [
                        {
                            allColumn: {
                                dataFilterColumn:
                                    this.$store.state.document.filterConfig
                            }
                        }
                    ];

                    if (navigator.onLine) {
                        this.isRenderKanban = false;
                        let loopCheckLoadKanban = setInterval(() => {
                            if (this.kanbanInstance) {
                                clearInterval(loopCheckLoadKanban);
                                this.listDataFilter = [
                                    {
                                        allColumn: {
                                            dataFilterColumn:
                                                this.$store.state.document
                                                    .filterConfig
                                        }
                                    }
                                ];
                                this.refreshKanban();
                            }
                        }, 500);
                    } else {
                        this.isRenderKanban = true;
                        if (
                            this.kanbanInstance != '' ||
                            this.kanbanInstance.api != null
                        ) {
                            this.kanbanInstance.destructor();
                        }
                        this.$snotifyError(
                            'err',
                            this.$t('v2.kanban.errorNetwork')
                        );
                        return;
                    }
                }
            }
        );
        this.$evtBus.$on('refresh-kanban', () => {
            if (navigator.onLine) {
                this.refreshKanban();
            } else {
                this.isRenderKanban = true;
                this.$snotifyError(
                    'err',
                    this.$t('v2.kanban.errorNetwork')
                );
                return;
            }
        });
        this.$evtBus.$on('search-kanban', (vl) => {
            this.searchKanban(vl);
        });
        this.$evtBus.$on('config-filter-kanban', (filter) => {
            if (navigator.onLine) {
                if (JSON.stringify(filter) == '{}') {
                    this.listFilterSelected = [];
                    this.refreshKanban();
                    this.dataForSelfFilter = {};
                    this.listDataFilter = [];
                    this.filterAllKanban = {};
                } else {
                    this.isRenderKanban = false;
                    let loopCheckLoadKanban = setInterval(() => {
                        if (this.kanbanInstance) {
                            clearInterval(loopCheckLoadKanban);
                            this.listDataFilter = filter;
                            this.refreshKanban();
                            this.listFilterSelected = filter;
                            this.openFilterAllKanban();
                        }
                    }, 500);
                }
            } else {
                this.isRenderKanban = true;
                if (
                    this.kanbanInstance != '' ||
                    this.kanbanInstance.api != null
                ) {
                    this.kanbanInstance.destructor();
                }
                this.$snotifyError(
                    'err',
                    this.$t('v2.kanban.errorNetwork')
                );
                return;
            }
        });
        this.$evtBus.$on('kanban-add-filter', () => {
            this.isAddFilter = true;
            this.openFilterAllKanban();
        });
        this.$evtBus.$on('show-filter-all-kanban', () => {
            this.openFilterAllKanban();
        });
        this.$evtBus.$on('kanban-cancel-add-filter', () => {
            this.isAddFilter = false;
        });
        if (navigator.onLine) {
            this.worker = new KanbanViewEnduser();
            await this.getDataKanban();
        } else {
            this.isRenderKanban = true;
            this.$snotifyError(
                'err',
                this.$t('v2.kanban.errorNetwork')
            );
        }
    },
    destroyed() {
        this.$evtBus.$off('refresh-kanban');
        this.$evtBus.$off('search-kanban');
        this.$evtBus.$off('config-filter-kanban');
        this.$evtBus.$off('kanban-add-filter');
        this.$evtBus.$off('show-filter-all-kanban');
        this.$evtBus.$off('kanban-cancel-add-filter');
    }
};
</script>
<style scoped>
#symper-kanban {
    height: calc(100vh - 130px);
    user-select: none !important;
}
#symper-kanban >>> .kanban .content-wrapper {
    overflow-y: hidden;
}
#symper-kanban >>> .row .column {
    overflow-y: scroll;
    height: calc(100vh - 224px);
    width: 280px;
    margin-left: 12px;
    min-width: 280px;
    margin-right: 8px;
    padding: 0px 0px 0px 8px;
    background: #f4f5f7;
}
#symper-kanban >>> .row {
    margin-left: 0px;
}
#symper-kanban >>> .content .row .column::-webkit-scrollbar-track {
    background: none !important;
}
#symper-kanban >>> .menu.svelte-7sr7a5 {
    display: none;
}

#symper-kanban >>> .content .header .column .label {
    display: none !important;
}
#symper-kanban >>> .row .content .column .add-card-btn {
    display: none !important;
}
#symper-kanban >>> .kanban .content-wrapper .content {
    position: relative;
}
#symper-kanban >>> .row .content .column .card {
    margin: 0px 0px 8px 0px;
    border: none;
}
#symper-kanban >>> .row .label {
    display: none !important;
}
#symper-kanban >>> .kanban .editor {
    display: none !important;
}
#symper-kanban >>> .content .header .column {
    min-width: 280px;
    width: 280px;
    margin-right: 8px;
    background: #f4f5f7;
}

#symper-kanban >>> .dropbtn {
    border: none;
}
#symper-kanban >>> .dropbtn:hover {
    border: none;
    cursor: pointer;
    border-radius: 25px;
}

#symper-kanban >>> .dropdown {
    position: relative;
    display: inline-block;
    border-radius: 4px;
}

#symper-kanban >>> .dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    padding: 4px;
    background-color: white;
    min-width: 100px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
}

#symper-kanban >>> .dropdown-content div {
    color: black;
    text-decoration: none;
    display: block;
}
#symper-kanban >>> .border-4px {
    border-radius: 4px;
}

#symper-kanban >>> .dropdown-content a:hover {
    background-color: #ddd;
}

#symper-kanban >>> .dropdown:hover .dropdown-content {
    display: block;
}

#symper-kanban >>> .dropdown-content div:hover {
    background-color: #ddd;
}
</style>

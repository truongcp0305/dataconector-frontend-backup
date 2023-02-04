<template>
    <div
        class="w-100 gantt-chart-wrapper d-flex flex-column"
        :id="'symper-gantt-wrapper-' + cellConfigs.sharedConfigs.cellId"
        :class="{
            'baseline-mode':
                cellConfigs.rawConfigs.style.ganttConfig.children.baseline
                    .value == true
        }"
    >
        <div class="w-100 py-2 d-flex justify-content-end">
            <div style="width: 200px" class="mr-2">
                <v-text-field
                    v-on:input="onSearch($event)"
                    class="d-inline-block sym-small-size"
                    single-line
                    append-icon="mdi-magnify"
                    outlined
                    hide-details
                    dense
                    flat
                    label="Search"
                    :placeholder="$t('common.search')"
                    style="width: inherit"
                ></v-text-field>
            </div>
            <v-menu
                content-class="action-create"
                :close-on-content-click="false"
                :close-on-click="closeOnClick"
                v-if="
                    cellConfigs.rawConfigs.fomulasConfig.listDocuments.length >
                    0
                "
                offset-y
            >
                <template v-slot:activator="{ on: on }">
                    <v-btn v-on="on" depressed small class="mr-1">
                        <span>{{ $t('common.createTask') }}</span>
                    </v-btn>
                </template>
                <v-list class="fs-13">
                    <v-list-item
                        v-for="(item, i) in cellConfigs.rawConfigs.fomulasConfig
                            .listDocuments"
                        :key="i"
                        class="single-row"
                    >
                        <div
                            @click.prevent.stop="handleSubmitTask(item)"
                            class="mr-1"
                        >
                            <span>{{ item.id + ' ' + item.title }}</span>
                        </div>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-btn
                class="mr-1"
                @click="changeStatusEdit"
                v-if="!isEdit"
                small
                depressed
            >
                {{ $t('common.edit') }}
            </v-btn>
            <v-menu offset-y v-else-if="isEdit">
                <template v-slot:activator="{ attrs, on }">
                    <v-btn
                        v-bind="attrs"
                        v-on="on"
                        small
                        class="mr-1"
                        depressed
                    >
                        {{ $t('common.save') }}
                        <v-icon small> mdi-menu-down </v-icon>
                    </v-btn>
                </template>
                <div class="bg-white d-flex flex-column date-scale__menu">
                    <div
                        @click="saveGanttConfig"
                        class="py-1 d-flex date-scale__menu__item px-4"
                    >
                        <div class="flex-grow-1 fs-13">
                            {{ $t('common.save') }}
                        </div>
                    </div>
                    <div
                        @click="undoChange"
                        class="py-1 d-flex date-scale__menu__item px-4"
                    >
                        <div class="flex-grow-1 fs-13">
                            {{ $t('common.undo') }}
                        </div>
                    </div>
                </div>
            </v-menu>

            <v-btn class="mr-1" small @click="focusToday" depressed>
                {{ $t('common.today') }}
            </v-btn>
            <v-menu offset-y>
                <template v-slot:activator="{ attrs, on }">
                    <v-btn
                        v-bind="attrs"
                        v-on="on"
                        small
                        class="mr-1"
                        depressed
                    >
                        {{ $t('bi.gantt.zoomLevel.' + currentZoomLevel) }}
                        <v-icon small> mdi-menu-down </v-icon>
                    </v-btn>
                </template>
                <div class="bg-white d-flex flex-column date-scale__menu">
                    <div class="mt-2 mb-1 pl-4 fs-14 font-weight-bold">
                        {{ $t('common.date-scale') }}
                    </div>
                    <div
                        v-for="(item, i) in zoomLevelMenuItem"
                        :key="i"
                        @click="setZoomLevel(item)"
                        class="py-1 d-flex date-scale__menu__item px-4"
                    >
                        <div class="flex-grow-1 fs-13">
                            {{ $t('bi.gantt.zoomLevel.' + item) }}
                        </div>
                        <v-icon
                            small
                            color="green"
                            v-if="currentZoomLevel == item"
                        >
                            mdi-check</v-icon
                        >
                    </div>
                </div>
            </v-menu>
            <v-btn
                class="mr-1"
                v-if="!isView"
                tile
                @click="showPopupConfig"
                icon
                small
                depressed
            >
                <i class="mdi fs-18 mdi-cog-outline"></i>
            </v-btn>
            <div class="d-flex flex-row-reverse w-100">
                <v-tooltip
                    bottom
                    v-for="(item, i) in headerMenuActions"
                    :key="i"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn
                            v-on="on"
                            tile
                            icon
                            @click="handleHeaderActionClick(item)"
                            small
                            depressed
                        >
                            <v-icon small>
                                {{ item.icon }}
                            </v-icon>
                        </v-btn>
                    </template>
                    <span>{{ item.tooltip }}</span>
                </v-tooltip>
            </div>
        </div>

        <Preloader ref="preloader" />
        <div
            class="w-100 flex-grow-1 fs-11 gantt"
            ref="gantt"
            :key="instanceKey"
        ></div>
        <div
            class="symper-table-pagination pl-1 w-100"
            style="height: 25px; margin-top: 5px"
        >
            <Pagination
                :contentSize="'mini'"
                :totalVisible="7"
                :pageSizeOptions="[500, 1000, 2000, 5000]"
                @on-change-page-size="handleSizeChange"
                @on-change-page="handleCurrentPageChange"
                :total="cellConfigs.viewConfigs.displayOptions.totalRowCount"
            >
            </Pagination>
        </div>
        <popup-config-ganttchart ref="configGantt" :cellConfigs="cellConfigs" />
        <popup-submit-task
            ref="popupSubmitTask"
            @gantt-submit-task-done="refreshData"
        />
        <GanttContextMenu
            ref="ganttContextMenu"
            :listAction="listActionContextMenu"
            @context-menu-click="handleContextmenuClick"
        />
        <v-dialog
            v-model="showDialogDelete"
            persistent
            max-width="290"
            style="z-index: 1001"
        >
            <v-card>
                <v-card-title class="headline fs-16">{{
                    $t('v2.dashboard.confirm')
                }}</v-card-title>
                <v-card-text class="fs-13">
                    {{ $t('v2.dashboard.confirmDelete') }}</v-card-text
                >
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="cancelDelete">{{
                        $t('v2.dashboard.cancel')
                    }}</v-btn>
                    <v-btn color="green darken-1" text @click="confirmDelete">{{
                        $t('v2.dashboard.agree')
                    }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <EditDocumentObject
            ref="editDocumentObject"
            :documentObjectId="documentObjectId"
            @submit-success="handleSubmitSuccess"
        />
        <ConfirmDeleteLink
            ref="confirmDeleteLink"
            @confirm-delete="confirmDelete"
        />
        <menu-add-showable-column
            ref="menuAddShowableColumn"
            :instanceKey="instanceKey"
            :cellConfigs="cellConfigs"
            :persionalConfig="configShowableColumns.personal"
            @column-select-change="handleColumnSelectChange"
        />
    </div>
</template>
<script>
import PopupConfigGanttchart from '../PopupConfigGanttchart.vue';
import PopupSubmitTask from '../PopupSubmitTask.vue';
import Pagination from '@/components/common/Pagination.vue';
import EditDocumentObject from '@/components/common/EditDocumentObject.vue';
import { GanttConfigHelper } from '@/components/dashboard/components/helper/GanttChartHelper';
import GanttContextMenu from '@/components/dashboard/components//GanttContextMenu';
import { util } from '@/plugins/util';
import _debounce from 'lodash/debounce';
import GanttchartWorker from 'worker-loader!@/worker/dashboard/ganttchart/Ganttchart.Worker.js';
import ConfirmDeleteLink from '@/components/dashboard/components/helper/ConfirmDeleteLink';
import Preloader from '@/components/common/Preloader';
import MenuAddShowableColumn from '@/components/dashboard/components/helper/MenuAddShowableColumn.vue';
import conditionalHelper from '@/components/dashboard/configPool/treeConditionToJSString';
import { number } from '@/plugins/utilModules/number.js';
import { uiConfigApi } from '@/api/uiConfig';

require('@/plugins/dhtmlx/codebase/dhtmlxgantt');
require('@/plugins/dhtmlx/api');
var mo = conditionalHelper.mo;

(window.handleAddGanttShowableColumn = function (el, event) {
    let thisGanttInstance = util.getClosestVueInstanceFromDom(el, 'gantt');
    thisGanttInstance.showMenuAddColumn(event);
}),
    (gantt = null);
export default {
    name: 'gantt',
    components: {
        PopupConfigGanttchart,
        PopupSubmitTask,
        Pagination,
        GanttContextMenu,
        EditDocumentObject,
        MenuAddShowableColumn,
        ConfirmDeleteLink,
        Preloader
    },
    watch: {
        'cellConfigs.rawConfigs.style.ganttConfig.children.minUnit.value'() {
            this.configZoomLevelMenu();
        },
        'cellConfigs.rawConfigs.style.ganttConfig.children.baseline.value'(
            newValue,
            oldValue
        ) {
            if (newValue != oldValue) {
                this.configBaseline(newValue);
                this.ganttInstance.render();
            }
        },
        'cellConfigs.rawConfigs.setting.gridColumns.selectedColums': {
            deep: true,
            immediate: true,
            handler(newArr, oldArr) {
                if (this.dataLoaded) {
                    this.changeGridColumns();
                }
            }
        },
        'cellConfigs.viewConfigs.displayOptions.dataWorkTime': {
            deep: true,
            handler(newArr, oldArr) {
                if (this.dataLoaded) {
                    this.configWorkTime();
                    this.ganttInstance.render();
                }
            }
        },
        'cellConfigs.rawConfigs.setting.rightSidebarColumns.selectedColums': {
            deep: true,
            handler(newArr, oldArr) {
                if (this.dataLoaded) {
                    this.configRightSidebarColumns();
                    this.ganttInstance.render();
                }
            }
        },
        'cellConfigs.rawConfigs.style.ganttConfig.children.wbsColumns.value'(
            val,
            oldVal
        ) {
            if (val != oldVal) {
                let columns = this.translateGridColumns(val);
                this.ganttInstance.config.columns = columns;
                this.ganttInstance.render();
            }
        },
        'cellConfigs.rawConfigs.style.ganttConfig.children.showDurationMinute.value'(
            val,
            oldVal
        ) {
            if (val != oldVal) {
                let columns = this.translateGridColumns(
                    this.cellConfigs.rawConfigs.style.ganttConfig.children
                        .wbsColumns.value
                );
                this.ganttInstance.config.columns = columns;
                this.ganttInstance.render();
            }
        },
        'cellConfigs.rawConfigs.style.ganttConfig.children.showDurationHour.value'(
            val,
            oldVal
        ) {
            if (val != oldVal) {
                let columns = this.translateGridColumns(
                    this.cellConfigs.rawConfigs.style.ganttConfig.children
                        .wbsColumns.value
                );
                this.ganttInstance.config.columns = columns;
                this.ganttInstance.render();
            }
        },
        'cellConfigs.rawConfigs.style.ganttConfig.children.dragBetweenLevel.value'(
            val,
            oldVal
        ) {
            if (val != oldVal) {
                this.configDrag(val);
                this.ganttInstance.render();
            }
        },
        'cellConfigs.rawConfigs.style.ganttConfig.children.criticalTask.value'(
            val,
            oldVal
        ) {
            if (val != oldVal) {
                this.configCriticalTask(val);
                this.ganttInstance.render();
            }
        },
        'cellConfigs.rawConfigs.style.conditionalFormat.children.conditionalFormatCondition.value'() {
            this.customTaskStyle();
            this.ganttInstance.render();
        },
        'cellConfigs.rawConfigs.style.ganttConfig.children.autoScheduling.value'(
            val,
            oldVal
        ) {
            if (val != oldVal) {
                this.configAutoScheduling(val);
                this.ganttInstance.render();
            }
        },
        'cellConfigs.rawConfigs.style.ganttConfig.children.ganttSkin.value'(
            val,
            oldVal
        ) {
            if (val != oldVal) {
                this.changeSkin(val);
            }
        },
        'cellConfigs.rawConfigs.style.ganttConfig.children.rowHeight.value'(
            val,
            oldVal
        ) {
            if (val != oldVal) {
                this.debounceConfigRowHeight();
                this.ganttInstance.render();
            }
        },
        'cellConfigs.rawConfigs.style.ganttConfig.children.durationUnit.value'(
            val,
            oldVal
        ) {
            if (val != oldVal) {
                this.configDuration(val);
                this.ganttInstance.render();
            }
        },
        'cellConfigs.rawConfigs.style.ganttConfig.children.projectColor.value'(
            val,
            oldVal
        ) {
            this.customTaskStyle();
        }
    },
    props: {
        cellConfigs: {
            default() {
                return {};
            }
        },
        tasks: {
            type: Object,
            default() {
                return { data: [], links: [] };
            }
        },
        isView: {
            default: true
        },
        taskSeleted: {
            type: Object,
            default() {
                return {};
            }
        },
        instanceKey: {
            defaul: ''
        }
    },
    data() {
        return {
            ganttchartWorker: null,
            mappingObjectDefinition: {},
            documentObjectId: null,
            showDialogDelete: false,
            listActionContextMenu: null,
            allChildrenTask: [],
            taskPositionChange: false,
            mappingCondition: {},
            isEdit: false,
            listColumnWidth: {},
            dataLoaded: false,
            mapConditions: {},
            collapseTask: {},
            listItemChange: {},
            loading: false,
            listInstance: {},
            configShowableColumns: {
                default: {},
                personal: {}
            },
            currentZoomLevel: 'minute',
            ganttInstance: null,
            beforeWidth: null,
            showableColumns: {},

            zoomLevelMapping: {
                0: 'minute',
                1: 'hour',
                2: 'day',
                3: 'week',
                4: 'month',
                5: 'year'
            },
            afterWidth: null,
            closeOnClick: true,
            dialogRemove: false,
            showAccountResource: false,
            showResourceTemplate: false,
            selectingTaskId: null,
            firstRender: true,
            selectingLinkId: null,
            deleteType: '',
            listTaskWithIndex: [],
            zoomLevelMenuItem: [],
            zoomLevelMenuItemBase: [
                'minute',
                'hour',
                'day',
                'week',
                'month',
                'year'
            ],
            selectingTask: null,
            options: {},
            highChartKey: 0,
            showSlack: false,
            headerMenuActions: {
                zoomIn: {
                    tooltip: this.$t('v2.dashboard.zoomIn'),
                    icon: 'mdi-plus-circle-outline',
                    action: 'zoomIn'
                },
                zoomOut: {
                    tooltip: this.$t('v2.dashboard.zoomOut'),
                    icon: 'mdi-minus-circle-outline',
                    action: 'zoomOut'
                },
                zoomToFit: {
                    tooltip: this.$t('v2.dashboard.zoomToFit'),
                    icon: 'mdi-image-filter-center-focus',
                    action: 'zoomToFit'
                },

                showFullscreen: {
                    tooltip: this.$t('v2.dashboard.showFullscreen'),
                    icon: 'mdi-arrow-expand',
                    action: 'toggleFullscreen'
                },

                showOfficeHour: {
                    tooltip: this.$t('v2.dashboard.showOfficeHour'),
                    icon: 'mdi-clock-time-eight-outline',
                    action: 'toggleOfficeHour'
                }
            }
        };
    },
    methods: {
        configDuration(val) {
            let gantt = this.ganttInstance;
            gantt.config.scale_height = 20 * 3;
        },
        configCriticalTask(val) {
            let gantt = this.ganttInstance;
            gantt.config.highlight_critical_path = val;
        },
        configDrag(val) {
            this.ganttInstance.config.order_branch = val;
            this.ganttInstance.config.order_branch_free = val;
        },
        configAutoScheduling(val) {
            let gantt = this.ganttInstance;
            gantt.config.auto_scheduling = val;
            gantt.config.auto_scheduling_strict = val;
            gantt.config.auto_scheduling_compatibility = val;
        },
        configBaseline(value) {
            let gantt = this.ganttInstance;
            if (value) {
                GanttConfigHelper.configGanttBaseline(gantt);
            } else {
                gantt.config.task_height =
                    this.cellConfigs.rawConfigs.style.ganttConfig.children
                        .rowHeight.value - 2;
            }
        },
        handleHeaderActionClick(item) {
            if (item.action) {
                this[item.action]();
            }
        },
        showPopupConfig() {
            this.$refs.configGantt.show();
        },
        handleSubmitTask(item) {
            this.$refs.popupSubmitTask.show(item.id);
        },

        toggleOfficeHour() {
            let gantt = this.ganttInstance;
            if (!gantt.ignore_time) {
                gantt.ignore_time = function (date) {
                    return (
                        !gantt.isWorkTime({ date: date, unit: 'hour' }) ||
                        !gantt.isWorkTime(date)
                    );
                };
            } else {
                gantt.ignore_time = null;
            }
            gantt.render();
        },
        toggleFullscreen() {
            let gantt = this.ganttInstance;
            if (!gantt.getState().fullscreen) {
                if (!this.ganttPlaceholderId) {
                    this.ganttPlaceholderId =
                        'symper-gantt-place-holder-' + Date.now();
                    let ganttPlaceholderId = this.ganttPlaceholderId;
                    $(this.$el.parentNode).prepend(
                        `<div id="${ganttPlaceholderId}" style="display:none"></div>`
                    );
                }
                $('#symper-platform-app').after(this.$el);
                $('#symper-main-left-side-bar').css('opacity', '0');
                gantt.expand();
            }

            if (!this.listenToggleExpand) {
                this.listenToggleExpand = true;
                let self = this;
                function onFullScreenChange() {
                    let fullscreenElement =
                        document.fullscreenElement ||
                        document.mozFullScreenElement ||
                        document.webkitFullscreenElement;
                    if (!fullscreenElement) {
                        let ganttPlaceholderId = self.ganttPlaceholderId;

                        $('#' + ganttPlaceholderId).after(self.$el);
                        $('#symper-main-left-side-bar').css('opacity', '1');
                        $(self.$refs.gantt).css(
                            'height',
                            self.cellConfigs.viewConfigs.displayOptions.chart
                                .height -
                                60 +
                                'px'
                        );
                        self.ganttInstance.setSizes();
                    }
                }
                document.addEventListener(
                    'fullscreenchange',
                    onFullScreenChange,
                    false
                );
                document.addEventListener(
                    'webkitfullscreenchange',
                    onFullScreenChange,
                    false
                );
                document.addEventListener(
                    'mozfullscreenchange',
                    onFullScreenChange,
                    false
                );
            }
        },
        toggleOverlay() {
            let gantt = this.ganttInstance;
            var overlayControl = gantt.ext.overlay;
            if (overlayControl.isOverlayVisible(lineOverlay)) {
                gantt.config.readonly = false;
                overlayControl.hideOverlay(lineOverlay);
                gantt.$root.classList.remove('overlay_visible');
            } else {
                gantt.config.readonly = true;
                overlayControl.showOverlay(lineOverlay);
                gantt.$root.classList.add('overlay_visible');
            }
        },
        zoomOut() {
            let gantt = this.ganttInstance;
            gantt.ext.zoom.zoomOut();
            gantt.$zoomToFit = false;
            this.setZoomLevel();
        },
        zoomIn() {
            let gantt = this.ganttInstance;
            gantt.ext.zoom.zoomIn();
            gantt.$zoomToFit = false;
            this.setZoomLevel();
        },
        debounceConfigRowHeight: _debounce(
            function (e) {
                this.configRowHeight();
            },
            500,
            this
        ),
        configRightSidebarColumns() {
            let gantt = this.ganttInstance;
            let allColumns =
                this.cellConfigs.rawConfigs.setting.rightSidebarColumns
                    .selectedColums;

            if (allColumns.length > 0) {
                let secondGridColumns = {
                    columns: []
                };
                let obj = {
                    name: allColumns[0].name,
                    label: allColumns[0].as,
                    align: 'center',
                    resize: true,
                    width: 150
                };
                secondGridColumns.columns.push(obj);
                gantt.config.layout =
                    GanttConfigHelper.layoutWithRightColumns(secondGridColumns);
            } else {
                gantt.config.layout = GanttConfigHelper.ganttLayout;
            }
        },

        configRowHeight() {
            let gantt = this.ganttInstance;
            let value =
                this.cellConfigs.rawConfigs.style.ganttConfig.children.rowHeight
                    .value;
            gantt.config.row_height = value;
            gantt.config.task_height = value - 5;
        },
        changeGridColumns() {
            if (this.ganttInstance) {
                let gantt = this.ganttInstance;
                let value =
                    this.cellConfigs.rawConfigs.style.ganttConfig.children
                        .wbsColumns.value;
                let columns = this.translateGridColumns(value);
                gantt.config.columns = columns;
                gantt.render();
            }
        },
        undoChange() {
            let self = this;
            let stacks = this.ganttInstance.getUndoStack();
            if (stacks.length > 0) {
                stacks.forEach(function (e) {
                    self.ganttInstance.undo();
                });
            }
        },
        refreshTask() {
            this.addMarker();
            this.getObjectDefinition();
            this.ganttInstance.parse(this.$props.tasks);
            this.hideLinkOfCollapseTask();
        },
        initGantt() {
            this.ganttInstance.init(this.$refs.gantt);
        },
        hideLinkOfCollapseTask() {
            this.allChildrenTask = [];
            if (Object.keys(this.collapseTask).length > 0) {
                for (let i in this.collapseTask) {
                    let child = this.ganttInstance.getChildren(i);
                    this.allChildrenTask = this.allChildrenTask.concat(child);
                }
            }
            let self = this;
            if (this.firstRender) {
                setTimeout(() => {
                    self.ganttInstance.render();
                }, 10);
                this.firstRender = false;
            }
            this.ganttInstance.templates.link_class = function (links) {
                if (
                    self.allChildrenTask.length > 0 &&
                    (self.allChildrenTask.includes(links.source) ||
                        self.allChildrenTask.includes(links.target))
                ) {
                    return 'd-none';
                } else {
                    return '';
                }
            };
        },
        handleCurrentPageChange(data) {
            this.cellConfigs.sharedConfigs.currentPage = data.page;
            this.refreshData(false);
        },
        cancelDelete() {
            this.showDialogDelete = false;
        },
        handleSubmitSuccess() {
            this.$snotifySuccess(
                this.$t('v2.dashboard.success'),
                this.$t('v2.dashboard.updateTaskSuccess')
            );
            this.refreshData();
        },
        handleColumnSelectChange(column) {
            let value = !this.configShowableColumns.personal[column]
                ? true
                : !this.configShowableColumns.personal[column];
            this.$set(this.configShowableColumns.personal, column, value);
            let columns = this.translateGridColumns();
            this.ganttInstance.config.columns = columns;
            if (columns.length < 3) {
                this.changeLayoutWidth(columns);
            }
            this.ganttInstance.render();
            this.setPersonalShowableColumn();
        },
        showMenuAddColumn(event) {
            this.$refs.menuAddShowableColumn.show(event);
        },
        confirmDelete() {
            let self = this;
            this.showDialogDelete = false;
            if (this.deleteType == 'delete-task') {
                let defInfor =
                    self.mappingObjectDefinition[
                        self.selectingTask.documentObjectId
                    ];
                this.ganttchartWorker.postMessage({
                    action: 'ganttChartRemoveTask',
                    data: {
                        defInfor: defInfor,
                        documentObjectId: self.selectingTask.documentObjectId
                    }
                });
            } else {
                this.ganttInstance.deleteLink(this.selectingLinkId);
            }
        },
        handleContextmenuClick(action) {
            let self = this;
            if (action == 'delete-link') {
                let linkInfor = this.ganttInstance.getLink(
                    this.selectingLinkId
                );
                this.$refs.confirmDeleteLink.show(linkInfor);
                this.deleteType = action;
            } else {
                this.ganttInstance.eachTask((e) => {
                    if (e.id == self.selectingTaskId) {
                        self.selectingTask = e;
                    }
                });
                if (self.selectingTask && self.selectingTask.documentObjectId) {
                    let defInfor =
                        this.mappingObjectDefinition[
                            self.selectingTask.documentObjectId
                        ];
                    if (defInfor) {
                        if (action == 'edit-task') {
                            let objId = self.selectingTask.documentObjectId;
                            if (defInfor.documentParentId != '0') {
                                objId = defInfor.documentObjectParentId;
                            }
                            self.$set(self, 'documentObjectId', objId);
                            self.$refs.editDocumentObject.show();
                        } else {
                            this.showDialogDelete = true;
                            this.deleteType = action;
                        }
                    }
                } else {
                    this.$snotifyError(
                        '',
                        this.$t('v2.dashboard.emptyIdentification')
                    );
                }
            }
        },

        ganttChartRemoveTaskAfter() {
            this.$snotifySuccess(
                this.$t('v2.dashboard.success'),
                this.$t('v2.dashboard.deleteTaskSuccess')
            );
            this.refreshData();
        },
        refreshData(refreshDataset = true) {
            this.$evtBus.$emit('bi-report-change-display', {
                type: 'data',
                id: this.cellConfigs.sharedConfigs.cellId,
                instanceKey: this.instanceKey,
                serverCache: false,
                refreshDataset: refreshDataset
            });
            this.getObjectDefinition();
        },
        getObjectDefinition() {
            let self = this;
            this.ganttchartWorker.postMessage({
                action: 'getObjectDefinition',
                data: {
                    list: self.$props.tasks.data
                }
            });
        },
        handleGetObjectDefinition(res) {
            if (res.status == 200) {
                this.mappingObjectDefinition = res.data;
            }
        },
        handleSizeChange(data) {
            this.cellConfigs.sharedConfigs.pageSize = data.pageSize;
            this.$evtBus.$emit('bi-report-change-display', {
                type: 'data',
                id: this.cellConfigs.sharedConfigs.cellId,
                instanceKey: this.instanceKey
            });
        },
        onSearch(vl) {
            if (this.delayTimer) {
                clearTimeout(this.delayTimer);
            }
            this.delayTimer = setTimeout(
                (self) => {
                    let arrFilter = {};
                    let cond = {
                        type: 'isall',
                        val: ''
                    };
                    let searchField = ['name', 'assignee', 'gridColumns'];
                    searchField.forEach(function (e) {
                        if (
                            self.cellConfigs.rawConfigs.setting[e]
                                .selectedColums.length > 0
                        ) {
                            for (let j in self.cellConfigs.rawConfigs.setting[e]
                                .selectedColums) {
                                let filterItem = util.cloneDeep(
                                    self.cellConfigs.rawConfigs.setting[e]
                                        .selectedColums[j]
                                );
                                filterItem.cond = cond;
                                arrFilter[filterItem.name] = filterItem;
                            }
                        }
                    });
                    let dataSearch = {
                        keyword: vl,
                        columns: Object.values(arrFilter)
                    };
                    self.cellConfigs.sharedConfigs.searchData = dataSearch;
                    self.$evtBus.$emit('bi-report-change-display', {
                        type: 'data',
                        id: self.cellConfigs.sharedConfigs.cellId,
                        instanceKey: this.instanceKey
                    });
                },
                500,
                this
            );
        },

        changeStatusEdit() {
            this.toggleReadOnly(true);
        },
        toggleReadOnly(value) {
            let gantt = this.ganttInstance;
            this.isEdit = value;
            gantt.config.readonly = !value;
            gantt.render();
            if (value) {
                this.$evtBus.$emit('lock-workspace');
            } else {
                this.$evtBus.$emit('unlock-workspace');
            }
        },
        saveGanttConfig() {
            this.toggleReadOnly(false);
            this.$emit('save-update-gantt', this.listItemChange);
            if (this.taskPositionChange) {
                this.setTaskIndex();
            }
        },
        focusToday() {
            this.ganttInstance.showDate(new Date());
        },
        clearAll() {
            this.ganttInstance.clearAll();
        },
        translateGridColumns(showWbsColumn = false) {
            let self = this;
            let gantt = Gantt.getGanttInstance();
            var hourFormatter = gantt.ext.formatters.durationFormatter({
                enter: 'hour',
                store: 'minute',
                format: 'hour',
                short: true
            });
            let allColumns =
                this.cellConfigs.rawConfigs.setting.gridColumns.selectedColums;
            let translatedColumns = [];
            let displayOptions = this.cellConfigs.viewConfigs.displayOptions;
            allColumns.forEach(function (e) {
                let obj = {
                    name: e.name,
                    label: e.as,
                    align: 'center',
                    resize: true,
                    min_width: 50
                };
                if (self.listColumnWidth[e.name]) {
                    obj.width = self.listColumnWidth[e.name];
                }
                if (e.type == 'number') {
                    obj.template = function (item) {
                        if (item[e.name]) {
                            let n = number.thousandsSeparateAndRound(
                                item[e.name],
                                displayOptions.decimalNumber
                            );
                            return `<div class='w-100 text-right'>${n}</div>`;
                        } else {
                            return '';
                        }
                    };
                }
                if (e.menuOptions && e.menuOptions.editableContent.value) {
                    obj.editor = { type: 'text', map_to: e.name };
                }
                if (self.isView) {
                    if (
                        self.configShowableColumns.default[e.name] ||
                        self.configShowableColumns.personal[e.name]
                    ) {
                        translatedColumns.push(obj);
                    }
                } else {
                    translatedColumns.push(obj);
                }
            });

            if (translatedColumns[0]) {
                translatedColumns[0].tree = true;
                if (
                    this.cellConfigs.rawConfigs.setting.deadline.selectedColums
                        .length > 0
                ) {
                    translatedColumns.unshift({
                        name: 'overdue',
                        label: '',
                        width: 30,
                        template: function (obj) {
                            if (obj.deadline) {
                                var deadline = gantt.date.parseDate(
                                    obj.deadline,
                                    'xml_date'
                                );
                                if (deadline && obj.planned_end > deadline) {
                                    return `<div><i style="color: red" class='mdi mdi-alert-circle-outline'></i></div>`;
                                }
                            }
                            return '<div></div>';
                        }
                    });
                }
            }
            if (showWbsColumn) {
                let self = this;
                translatedColumns.unshift({
                    name: 'wbs',
                    label: this.$t('v2.dashboard.wbs'),
                    width: 35,
                    template: gantt.getWBSCode
                });
            }
            let defaultColumns = [
                {
                    name: 'text',
                    label: this.$t('v2.dashboard.taskName'),
                    resize: true,
                    width: 200,
                    min_width: 50,
                    tree: true
                },
                {
                    name: 'start_date',
                    label: this.$t('v2.dashboard.startTime'),
                    resize: true,
                    align: 'center',
                    width: 200,
                    min_width: 50
                }
            ];
            if (translatedColumns.length == 0) {
                translatedColumns = defaultColumns;
            }
            if (
                this.cellConfigs.rawConfigs.style.ganttConfig.children
                    .showDurationMinute.value
            ) {
                translatedColumns.push({
                    name: 'duration',
                    label: this.$t('v2.dashboard.minutesDuration'),
                    resize: true,
                    width: self.listColumnWidth['duration']
                        ? self.listColumnWidth['duration']
                        : 100,
                    min_width: 50,
                    align: 'center',
                    template: function (task) {
                        return task.duration;
                    }
                });
            }
            if (
                this.cellConfigs.rawConfigs.style.ganttConfig.children
                    .showDurationHour.value
            ) {
                translatedColumns.push({
                    name: 'durationHour',
                    label: this.$t('v2.dashboard.hourDuration'),
                    resize: true,
                    width: self.listColumnWidth['durationHour']
                        ? self.listColumnWidth['durationHour']
                        : 100,
                    min_width: 50,
                    align: 'center',
                    template: function (task) {
                        return hourFormatter.format(task.duration);
                    }
                });
            }
            if (this.isView) {
                let colHeader =
                    '<div class="gantt_grid_head_cell gantt_grid_head_add" onclick="handleAddGanttShowableColumn(this, event)"></div>';
                translatedColumns.push({
                    name: 'buttons',
                    label: colHeader,
                    width: 20
                });
            }
            return translatedColumns;
        },
        convertHour(str) {
            if (/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/.test(str)) {
                str = str.split(' ')[1];
            }
            if (str) {
                let arr = str.split(' ');
                let time = arr[0].split(':');
                time[0] =
                    String(arr[1]).includes('PM') && time[0] != '12'
                        ? parseInt(time[0]) + 12
                        : parseInt(time[0]);
                return time.join(':');
            }
        },
        configWorkTime() {
            let self = this;
            let gantt = this.ganttInstance;
            gantt.config.dynamic_resource_calendars = true;
            gantt.config.resource_property = 'mappingValue';
            let configCalendar = {};
            gantt.config.work_time = true;
            let dataWorkTime =
                this.cellConfigs.viewConfigs.displayOptions.dataWorkTime;
            if (dataWorkTime) {
                // config global worktime
                if (dataWorkTime.global && dataWorkTime.global.length) {
                    dataWorkTime.global.forEach(function (e) {
                        if (
                            e.globalHourStart &&
                            e.globalHourEnd &&
                            e.globalDay &&
                            e.keyMappingGlobal
                        ) {
                            if (!configCalendar[e.keyMappingGlobal]) {
                                configCalendar[e.keyMappingGlobal] = {
                                    worktime: {
                                        days: [],
                                        customWeeks: {}
                                    }
                                };
                            }
                            let startTime = self.convertHour(e.globalHourStart);
                            let endTime = self.convertHour(e.globalHourEnd);
                            let dayValue =
                                parseInt(e.globalDay) == 7
                                    ? 0
                                    : parseInt(e.globalDay);
                            if (
                                !configCalendar[e.keyMappingGlobal].worktime
                                    .days[dayValue]
                            ) {
                                configCalendar[
                                    e.keyMappingGlobal
                                ].worktime.days[dayValue] = [];
                            }
                            if (endTime == '0:00') {
                                endTime = '24:00';
                            }
                            let timeItem = startTime + '-' + endTime;
                            configCalendar[e.keyMappingGlobal].worktime.days[
                                dayValue
                            ].push(timeItem);
                        }
                    });
                }
                //override merge calendar
                if (dataWorkTime.workHour && dataWorkTime.workHour.length) {
                    dataWorkTime.workHour.forEach(function (e) {
                        if (
                            e.keyMappingWorkHour &&
                            e.specificHourStartWorkHour &&
                            e.specificHourEndWorkHour &&
                            e.specificDateWorkHour
                        ) {
                            if (!configCalendar[e.keyMappingWorkHour]) {
                                configCalendar[e.keyMappingWorkHour] = {
                                    worktime: {
                                        customWeeks: {}
                                    }
                                };
                            }
                            let start = self.convertHour(
                                e.specificHourStartWorkHour
                            );
                            let end = self.convertHour(
                                e.specificHourEndWorkHour
                            );
                            if (
                                !configCalendar[e.keyMappingWorkHour].worktime
                                    .customWeeks[e.specificDateWorkHour]
                            ) {
                                let from = new Date(e.specificDateWorkHour);
                                let cloneFrom = util.cloneDeep(from);
                                let to = cloneFrom.setDate(
                                    cloneFrom.getDate() + 1
                                );
                                configCalendar[
                                    e.keyMappingWorkHour
                                ].worktime.customWeeks[e.specificDateWorkHour] =
                                    {
                                        from: from,
                                        to: to,
                                        days: [[start, end], 1, 1, 1, 1, 1, 1]
                                    };
                            } else {
                                configCalendar[
                                    e.keyMappingWorkHour
                                ].worktime.customWeeks[
                                    e.specificDateWorkHour
                                ].days[0].push(start);
                                configCalendar[
                                    e.keyMappingWorkHour
                                ].worktime.customWeeks[
                                    e.specificDateWorkHour
                                ].days[0].push(end);
                            }
                        }
                    });
                }
                if (dataWorkTime.holidays && dataWorkTime.holidays.length > 0) {
                }
                if (dataWorkTime.workDay && dataWorkTime.workDay.length > 0) {
                }
                gantt.templates.timeline_cell_class = function (task, date) {
                    let className = '';
                    let zoomLevel = gantt.ext.zoom.getCurrentLevel();
                    if (zoomLevel > 1) {
                        if (
                            !gantt.isWorkTime({
                                date: date,
                                task: task,
                                unit: 'week'
                            })
                        ) {
                            className = 'no_work_hour';
                        }
                    } else {
                        if (
                            !gantt.isWorkTime({
                                date: date,
                                task: task,
                                unit: 'hour'
                            })
                        ) {
                            className = 'no_work_hour';
                        }
                    }
                    return className;
                };
                if (Object.keys(configCalendar).length) {
                    gantt.config.resource_calendars = {};
                    for (let i in configCalendar) {
                        if (configCalendar[i].worktime.days) {
                            for (let ix = 0; ix < 7; ix++) {
                                if (!configCalendar[i].worktime.days[ix]) {
                                    configCalendar[i].worktime.days[ix] = 0;
                                }
                            }
                        }
                        gantt.config.resource_calendars[i] = gantt.addCalendar(
                            configCalendar[i]
                        );
                    }
                }
            }
        },
        configGantt() {
            let gantt = this.ganttInstance;
            this.listenGanttEvent();
            this.configBaseline(
                this.cellConfigs.rawConfigs.style.ganttConfig.children.baseline
                    .value
            );
            this.configRowHeight();
            this.configRightSidebarColumns();
            gantt.ext.zoom.init(GanttConfigHelper.zoomConfig(gantt));
            gantt.$zoomToFit = false;
            if (this.cellConfigs.viewConfigs.displayOptions.dataWorkTime) {
                this.configWorkTime();
            }
            this.configDuration(
                this.cellConfigs.rawConfigs.style.ganttConfig.children
                    .durationUnit.value
            );
            this.configCriticalTask(
                this.cellConfigs.rawConfigs.style.ganttConfig.children
                    .criticalTask.value
            );
            this.configAutoScheduling(
                this.cellConfigs.rawConfigs.style.ganttConfig.children
                    .autoScheduling.value
            );
            this.configDrag(
                this.cellConfigs.rawConfigs.style.ganttConfig.children
                    .dragBetweenLevel.value
            );
            this.customKeyboard();
            this.customTaskStyle();
        },
        customTaskStyle() {
            // add class css
            let self = this;
            let mappingClass = {};
            self.mappingCondition = {};
            var styleId = 'dynamicGanttStyles';
            var element = document.getElementById(styleId);
            if (!element) {
                element = document.createElement('style');
                element.id = styleId;
                document.querySelector('head').appendChild(element);
            }
            var html = [];
            let conditions =
                this.cellConfigs.rawConfigs.style.conditionalFormat.children
                    .conditionalFormatCondition.value;
            this.mapConditions = {};
            if (conditions.length > 0) {
                for (let conditionIndex in conditions) {
                    for (let i in conditions[conditionIndex]
                        .singleColorConfig) {
                        let condition = conditionalHelper.treeItemToJSCondition(
                            conditions[conditionIndex].singleColorConfig[i]
                                .condition[0],
                            'name'
                        );
                        let style = conditionalHelper.objStyleToHtmlStyle(
                            conditions[conditionIndex].singleColorConfig[i]
                                .style
                        );
                        mappingClass[
                            '.gantt-task-custom-style-' +
                                conditionIndex +
                                '-' +
                                i
                        ] = style;
                        self.mappingCondition[
                            'gantt-task-custom-style-' +
                                conditionIndex +
                                '-' +
                                i
                        ] = condition;
                    }
                }
            }
            if (Object.keys(mappingClass).length > 0) {
                for (let k in mappingClass) {
                    let htmlStyleItem = k + '{';
                    for (let j in mappingClass[k]) {
                        htmlStyleItem += j + ':' + mappingClass[k][j] + ';';
                    }
                    htmlStyleItem += '}';
                    html.push(htmlStyleItem);
                }
            }
            let projectBg =
                this.cellConfigs.rawConfigs.style.ganttConfig.children
                    .projectColor.value;
            html.push(
                '.gantt_task_line.gantt_project{background-color:' +
                    projectBg +
                    '}'
            );
            element.innerHTML = html.join('');
            if (Object.keys(self.mappingCondition).length > 0) {
                this.ganttInstance.templates.task_class = function (
                    start,
                    end,
                    task
                ) {
                    var row = task;
                    let arr = [];
                    if (self.ganttInstance.hasChild(task.id)) {
                        arr.push('task-parent');
                    }
                    if (!task.$open && self.ganttInstance.hasChild(task.id)) {
                        arr.push('task-collapsed');
                    }
                    for (let conditionItem in self.mappingCondition) {
                        let checkCondition = eval(
                            self.mappingCondition[conditionItem]
                        );
                        if (checkCondition) {
                            arr.push(conditionItem);
                        }
                    }
                    if (arr.length > 0) {
                        return arr.join(' ');
                    } else {
                        return true;
                    }
                };
            }
        },
        customKeyboard() {
            let self = this;
            this.ganttInstance.addShortcut(
                'ctrl+z',
                function (e) {
                    self.ganttInstance.undo();
                },
                'gantt'
            );
        },
        addMarker() {
            var dateToStr = this.ganttInstance.date.date_to_str(
                this.ganttInstance.config.task_date
            );
            var today = new Date();
            this.ganttInstance.addMarker({
                start_date: today,
                css: 'today_marker',
                text: this.$t('v2.dashboard.today'),
                title: this.$t('common.today') + ': ' + dateToStr(today)
            });
        },
        zoomToFit() {
            let gantt = this.ganttInstance;
            GanttConfigHelper.zoomToFit(gantt);
            this.setZoomLevel();
        },
        setColumnWidth(columnName, newValue) {
            this.listColumnWidth[columnName] = newValue;
            let obj = {
                widgetIdentifier: this.getWidgetIdentifier() + ':width',
                detail: JSON.stringify(this.listColumnWidth)
            };
            this.ganttchartWorker.postMessage({
                action: 'setColumnWidth',
                data: obj
            });
        },
        setTaskIndex() {
            let obj = {
                widgetIdentifier: this.getWidgetIdentifier() + ':index',
                detail: JSON.stringify(this.listTaskWithIndex)
            };
            this.ganttchartWorker.postMessage({
                action: 'setTaskIndex',
                data: obj
            });
        },
        listenGanttEvent() {
            let gantt = this.ganttInstance;
            let self = this;

            gantt.attachEvent('onAfterLinkDelete', function (id, item) {
                gantt.eachTask(function (task) {
                    if (task.id == item.target) {
                        task.dependency = '';
                        self.listItemChange[task.id] = task;
                    }
                });
            });
            gantt.attachEvent('onBeforeRowDragEnd', function (id) {
                self.listTaskWithIndex = [];
                self.taskPositionChange = true;
                gantt.eachTask(function (task) {
                    self.listTaskWithIndex.push(task.id);
                });
            });

            gantt.attachEvent(
                'onColumnResizeEnd',
                function (index, column, new_width) {
                    self.setColumnWidth(column.name, new_width);

                    return true;
                }
            );
            gantt.attachEvent('onAfterTaskUpdate', function (id, item) {
                self.listItemChange[id] = item;
                return true;
            });

            gantt.attachEvent('onBeforeTaskDrag', function (id, mode, e) {
                if (self.$store.state.app.baInfo.id != 0) {
                    return true;
                } else {
                    let taskInfo = {};
                    gantt.eachTask(function (task) {
                        if (task.id == id) {
                            taskInfo = task;
                        }
                    });
                    let userId = self.$store.state.app.endUserInfo.id;
                    if (taskInfo.owner && taskInfo.owner.includes(userId)) {
                        return true;
                    } else {
                        self.$snotifyError(
                            'error',
                            self.$t('gantt.notDragTask')
                        );
                        return false;
                    }
                }
            });
            gantt.attachEvent(
                'onTaskDrag',
                function (id, mode, task, original) {
                    var state = gantt.getState();
                    var minDate = state.min_date,
                        maxDate = state.max_date;
                    var scaleStep =
                        gantt.date.add(
                            new Date(),
                            state.scale_step,
                            state.scale_unit
                        ) - new Date();

                    var showDate,
                        repaint = false;
                    if (mode == 'resize' || mode == 'move') {
                        if (Math.abs(task.start_date - minDate) < scaleStep) {
                            showDate = task.start_date;
                            repaint = true;
                        } else if (
                            Math.abs(task.end_date - maxDate) < scaleStep
                        ) {
                            showDate = task.end_date;
                            repaint = true;
                        }

                        if (repaint) {
                            gantt.render();
                            gantt.showDate(showDate);
                        }
                    }
                }
            );
            gantt.attachEvent('onTaskLoading', function (task) {
                if (task.planned_start && task.planned_end) {
                    task.planned_start = gantt.date.parseDate(
                        task.planned_start,
                        'xml_date'
                    );
                    let endDate = gantt.date.parseDate(
                        task.planned_end,
                        'xml_date'
                    );
                    task.planned_end = endDate;
                }
                return true;
            });
            gantt.attachEvent('onAfterTaskDrag', function (id) {
                let taskChange = {};
                gantt.eachTask(function (task) {
                    if (task.id == id) {
                        taskChange = task;
                    }
                });
                self.listItemChange[id] = taskChange;
                return true;
            });
            gantt.attachEvent(
                'onAfterAutoSchedule',
                function (id, updatedTasks) {
                    gantt.eachTask(function (task) {
                        if (updatedTasks.includes(task.id)) {
                            self.listItemChange[task.id] = task;
                        }
                    });
                    return true;
                }
            );
            gantt.attachEvent('onTaskClick', function (id, updatedTasks) {
                let task = gantt.getTask(id);
                if (task.$open == true) {
                    self.collapseTask[id] = true;
                } else {
                    if (self.collapseTask[id]) {
                        delete self.collapseTask[id];
                    }
                }
                self.hideLinkOfCollapseTask();
                self.saveExtraGanttConfig();
                return true;
            });
            gantt.attachEvent(
                'onContextMenu',
                function (taskId, linkId, event) {
                    if (taskId) {
                        gantt.selectTask(taskId);
                        self.listActionContextMenu = [
                            {
                                title: this.$t('common.edit'),
                                action: 'edit-task'
                            },
                            {
                                title: this.$t('common.delete'),
                                action: 'delete-task'
                            }
                        ];
                        self.$refs.ganttContextMenu.show(event);
                        self.$set(self, 'selectingTaskId', taskId);
                    }
                    if (linkId) {
                        self.listActionContextMenu = [
                            {
                                title: this.$t('common.deleteLink'),
                                action: 'delete-link'
                            }
                        ];
                        self.$refs.ganttContextMenu.show(event);
                        self.$set(self, 'selectingLinkId', linkId);
                    }
                }
            );
        },
        changeSkin(name) {
            GanttConfigHelper.changeSkin(name);
        },
        printInnerHTML() {
            let scrollEle = document.getElementsByClassName('gantt_ver_scroll');
            let scrollHorEle =
                document.getElementsByClassName('gantt_hor_scroll');
            let originHeight = $('.gantt_layout_cell').height();
            let originWidth = $('.timeline_cell').width();
            if (scrollEle[0]) {
                let value = $(scrollEle[0].children[0]).height();
                $('.gantt_layout_cell').css('height', value + 'px');
            }
            if (scrollHorEle[0]) {
                let valueWidth = $(scrollHorEle[0].children[0]).width();
                $('.timeline_cell').css('width', valueWidth + 'px');
            }
            this.ganttInstance.config.autosize = 'xy';
            this.ganttInstance.render();
            let bodyHtml = this.$refs.gantt.innerHTML;
            util.printDOM(bodyHtml);
            setTimeout(
                (self) => {
                    self.$emit('re-render');
                },
                200,
                this
            );
        },
        async getZoomLevel() {
            let widgetIdentifier = this.getWidgetIdentifier() + ':zoom';
            let res = await uiConfigApi.getUiConfig(widgetIdentifier);
            if (res.status == 200 && res.data.detail) {
                this.ganttInstance.ext.zoom.setLevel(res.data.detail);
                this.currentZoomLevel = res.data.detail;
            }
            this.ganttInstance.showDate(new Date());
        },
        async getExtraGanttConfig() {
            let widgetIdentifier =
                this.getWidgetIdentifier() + ':gantt-extra-config';
            let res = await uiConfigApi.getUiConfig(widgetIdentifier);
            if (res.status == 200) {
                this.collapseTask = JSON.parse(res.data.detail);
            }
        },
        getCollapseData() {
            return this.collapseTask;
        },
        async getColumnWidth() {
            let widgetIdentifier = this.getWidgetIdentifier() + ':width';
            let res = await uiConfigApi.getUiConfig(widgetIdentifier);
            if (res.status == 200) {
                this.listColumnWidth = JSON.parse(res.data.detail);
            } else {
                let colName =
                    this.cellConfigs.rawConfigs.setting.name.selectedColums[0]
                        .name;
                this.listColumnWidth = {
                    [colName]: 250
                };
            }
        },
        setZoomLevel(level = false) {
            let widgetIdentifier = this.getWidgetIdentifier() + ':zoom';
            let zoomLevel;
            if (!level) {
                zoomLevel =
                    this.zoomLevelMapping[
                        this.ganttInstance.ext.zoom.getCurrentLevel()
                    ];
            } else {
                zoomLevel = level;
                this.ganttInstance.ext.zoom.setLevel(zoomLevel);
            }
            this.currentZoomLevel = zoomLevel;
            this.ganttchartWorker.postMessage({
                action: 'setZoomLevel',
                data: {
                    widgetIdentifier: widgetIdentifier,
                    detail: zoomLevel
                }
            });
        },
        getWidgetIdentifier() {
            return this.cellConfigs.sharedConfigs.cellId;
        },
        listenFromWorker() {
            let self = this;
            this.ganttchartWorker.addEventListener('message', function (event) {
                let data = event.data;
                let action = data.action;
                if (self[action]) {
                    self[action](data.data);
                } else {
                    console.error(` action ${action} not found `);
                }
            });
        },
        changeLayoutWidth(columns) {
            let widthLayout = 0;
            columns.forEach(function (e) {
                if (e.width) {
                    widthLayout += e.width;
                }
            });
            this.ganttInstance.config.layout.cols[0].width = widthLayout;
        },
        configZoomLevelMenu() {
            let minUnit =
                this.cellConfigs.rawConfigs.style.ganttConfig.children.minUnit
                    .value;
            let index = this.zoomLevelMenuItemBase.indexOf(minUnit);
            let menuItemClone = util.cloneDeep(this.zoomLevelMenuItemBase);
            this.zoomLevelMenuItem = menuItemClone.slice(index);
        },
        saveExtraGanttConfig() {
            let obj = {
                widgetIdentifier:
                    this.getWidgetIdentifier() + ':gantt-extra-config',
                detail: JSON.stringify(this.collapseTask)
            };
            this.ganttchartWorker.postMessage({
                action: 'saveExtraGanttConfig',
                data: obj
            });
        },
        async getShowableColumn() {
            let personalWidget = this.getWidgetIdentifier() + ':showable';
            let res = await uiConfigApi.getUiConfig(personalWidget);
            let self = this;
            if (res.status == 200) {
                this.configShowableColumns.personal = JSON.parse(
                    res.data.detail
                );
            }
            let cols =
                this.cellConfigs.rawConfigs.setting.gridColumns.selectedColums;
            if (cols.length > 0) {
                cols.forEach(function (e) {
                    if (
                        e.menuOptionsValue &&
                        e.menuOptionsValue.defaultColumn
                    ) {
                        self.configShowableColumns.default[e.name] = true;
                    }
                });
            }
        },
        setPersonalShowableColumn() {
            let obj = {
                widgetIdentifier: this.getWidgetIdentifier() + ':showable',
                detail: JSON.stringify(this.configShowableColumns.personal)
            };
            this.ganttchartWorker.postMessage({
                action: 'setShowableColumns',
                data: obj
            });
        },
        async getUserCustomUI() {
            let promiese = [
                this.getColumnWidth(),
                this.getExtraGanttConfig(),
                this.getShowableColumn()
            ];
            await Promise.all(promiese);
        },
        async getConfigAndInitGantt() {
            await this.getUserCustomUI();
            let configs = GanttConfigHelper.getDefaultConfig();
            this.ganttInstance = Gantt.getGanttInstance(configs);
            this.ganttInstance.plugins({
                // auto_scheduling: true,
                marker: true,
                tooltip: true,
                grouping: true,
                overlay: true,
                fullscreen: true,
                critical_path: true,
                undo: true,
                keyboard_navigation: true
            });
            this.configZoomLevelMenu();
            this.configGantt();

            let columns = this.translateGridColumns(
                this.cellConfigs.rawConfigs.style.ganttConfig.children
                    .wbsColumns.value
            );
            this.ganttInstance.config.columns = columns;
            this.$refs.preloader.hide();
            this.changeLayoutWidth(columns);
            this.initGantt();
            this.getZoomLevel();
            this.listenAndHandleWrapperEvts();
        },
        listenAndHandleWrapperEvts() {
            if (!this.dataLoaded) {
                setTimeout(
                    (self) => {
                        self.dataLoaded = true;
                        let wrapper = document.getElementsByClassName(
                            'gantt-chart-wrapper'
                        );
                        wrapper[0].addEventListener('mouseout', function (e) {
                            if (
                                e.relatedTarget &&
                                e.relatedTarget.className != 'context-menu-item'
                            ) {
                                self.$refs.ganttContextMenu.hide();
                            }
                        });
                        let dashboardWrapper = document.getElementsByClassName(
                            'symper-dashboard-workspace'
                        );
                        dashboardWrapper[0].addEventListener(
                            'mousemove',
                            function (e) {
                                var borders = {
                                    left: self.ganttInstance.$container
                                        .parentNode.offsetLeft,
                                    right:
                                        self.ganttInstance.$container.parentNode
                                            .offsetLeft +
                                        self.ganttInstance.$container
                                            .clientWidth,
                                    top: self.ganttInstance.$container
                                        .parentNode.offsetTop,
                                    bottom:
                                        self.ganttInstance.$container.parentNode
                                            .offsetTop +
                                        self.ganttInstance.$container
                                            .clientHeight
                                };

                                if (
                                    e.clientX <= borders.left ||
                                    e.clientX >= borders.right ||
                                    e.clientY <= borders.top ||
                                    e.clientY >= borders.bottom
                                ) {
                                    self.ganttInstance.ext.tooltips.tooltip.hide();
                                }
                            }
                        );
                    },
                    3000,
                    this
                );
            }
        }
    },
    created() {
        let self = this;
        this.ganttchartWorker = new GanttchartWorker();
        this.listenFromWorker();
        this.getConfigAndInitGantt();
        this.$evtBus.$on('dashboard-resize-report', (data) => {
            if (!self._inactive && data.instanceKey == self.instanceKey) {
                if (
                    data.singleApply &&
                    data.applyCellId != this.cellConfigs.sharedConfigs.cellId
                ) {
                    // Nếu tín hiệu chỉ áp dụng để resize 1 report duy nhất nhưng khác id của report hiện tại thì bỏ qua
                    return;
                }
                self.ganttInstance.setSizes();
            }
        });

        this.$evtBus.$on('symper-app-wrapper-clicked', () => {
            self.ganttInstance.ext.tooltips.tooltip.hide();
        });
    }
};
</script>
<style scoped>
.gantt-chart-wrapper {
    position: relative;
}
.action-gantt {
    position: absolute;
    top: 1px;
    right: 30px;
}
.single-row:hover {
    background: #f5f5f5;
    cursor: pointer;
}
.gantt-chart {
    overflow: hidden !important;
}
text {
    font: 13px Roboto !important;
}
</style>
<style>
@import '/css/dhtmlx/skins/dhtmlxgantt.css';
.highlighted-column {
    background-color: #fff3a1;
}
.today_marker {
    background-color: rgba(255, 0, 0, 0.4);
}
.gantt_task_scale .gantt_scale_cell {
    cursor: default;
}

.gantt_task_scale .gantt_scale_cell.highlighted-column {
    color: #454545;
    font-weight: bold;
}
.symper-baseline {
    position: absolute;
    border-radius: 2px;
    opacity: 0.6;
    margin-top: -7px;
    height: 12px;
    background: #ffd180;
    border: 1px solid rgb(255, 153, 0);
}

/* move task lines upper */
.baseline-mode .gantt_task_line,
.baseline-mode .gantt_line_wrapper {
    margin-top: -9px;
}

.baseline-mode .gantt_side_content {
    margin-bottom: 7px;
}

.baseline-mode .gantt_task_link .gantt_link_arrow {
    margin-top: -12px;
}

.baseline-mode .gantt_side_content.gantt_right {
    bottom: 0;
}
.overdue-indicator {
    width: 18px;
    margin-top: 5px;
    height: 18px;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    border-radius: 17px;
    color: white;
    background: rgb(255, 60, 60);
    line-height: 25px;
    text-align: center;
    font-size: 12px;
}
.resource_marker {
    text-align: center;
}
.resource_marker div {
    width: 28px;
    height: 28px;
    line-height: 29px;
    display: inline-block;

    color: #fff;
    margin: 3px;
}
.resource_marker.workday_ok div {
    border-radius: 15px;
    background: #51c185;
}

.resource_marker.workday_over div {
    border-radius: 3px;
    background: #ff8686;
}

/* .folder_row {
    font-weight: bold;
} */

.highlighted_resource,
.highlighted_resource.odd {
    background-color: rgba(255, 251, 224, 0.6);
}

.resource-controls .gantt_layout_content {
    padding: 7px;
    overflow: hidden;
}
.resource-controls label {
    margin: 0 10px;
    vertical-align: bottom;
    display: inline-block;
    color: #3e3e3e;
    padding: 2px;
    transition: box-shadow 0.2s;
}

.resource-controls label:hover {
    box-shadow: 0 2px rgba(84, 147, 255, 0.42);
}
.gantt_side_content {
    padding-right: 10px !important;
}
.resource-controls label.active,
.resource-controls label.active:hover {
    box-shadow: 0 2px #5493ffae;
    color: #1f1f1f;
}

.resource-controls input {
    vertical-align: top;
}

.gantt_task_cell.week_end {
    background-color: #e8e8e87d;
}

.gantt_task_row.gantt_selected .gantt_task_cell.week_end {
    background-color: #e8e8e87d !important;
}

.group_row,
.group_row.odd,
.gantt_task_row.group_row {
    background-color: rgba(232, 232, 232, 0.6);
}
.gantt_task_cell.no_work_hour {
    background-color: #e8e8e8;
}
.gantt_task_row.gantt_selected .gantt_task_cell.no_work_hour {
    background-color: #e8e8e8;
}

.gantt_task_content {
    text-align: unset;
    padding-left: 8px;
}
.resource_marker.workday_ok div {
    border-radius: 15px;
    background: #51c185;
}

.resource_marker.workday_over div {
    border-radius: 3px;
    background: #ff8686;
}

/* .folder_row {
    font-weight: bold;
} */
.gantt_link_point {
    display: none !important;
}
.highlighted_resource,
.highlighted_resource.odd {
    background-color: rgba(255, 251, 224, 0.6);
}

.resource-controls .gantt_layout_content {
    padding: 7px;
    overflow: hidden;
}
.resource-controls label {
    margin: 0 10px;
    vertical-align: bottom;
    display: inline-block;
    color: #3e3e3e;
    padding: 2px;
    transition: box-shadow 0.2s;
}
.gantt_blank {
    width: 8px !important;
}
.gantt_tree_indent {
    width: 8px !important;
}
.gantt_row,
.gantt_task_row {
    border-bottom: unset !important;
}
.resource-controls label:hover {
    box-shadow: 0 2px rgba(84, 147, 255, 0.42);
}

.resource-controls label.active,
.resource-controls label.active:hover {
    box-shadow: 0 2px #5493ffae;
    color: #1f1f1f;
}
.gantt_tree_content {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}
.gantt_tree_content,
.gantt_scale_cell,
.gantt_side_content,
.gantt_task_content,
.gantt_grid_head_cell {
    font-family: roboto !important;
}
.resource-controls input {
    vertical-align: top;
}

.gantt_task_cell.week_end {
    background-color: #e8e8e87d;
}

.gantt_task_row.gantt_selected .gantt_task_cell.week_end {
    background-color: #e8e8e87d !important;
}
.gantt_resizer_x {
    top: 60px !important;
}
.gantt_line_wrapper {
    z-index: 10000;
}
.group_row,
.group_row.odd,
.gantt_task_row.group_row {
    background-color: rgba(232, 232, 232, 0.6);
}
.gantt_cell {
    justify-content: unset !important;
}
.date-scale__menu {
    width: 150px;
}
.date-scale__menu__item {
    cursor: pointer;
}
.date-scale__menu__item:hover {
    background-color: #f5f5f5;
}
.gantt_folder_open,
.gantt_folder_closed,
.gantt_file {
    display: none;
}
.gantt_row_project {
    font-weight: 500 !important;
}
.gantt-fullscreen {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 30px;
    height: 30px;
    padding: 2px;
    font-size: 32px;
    background: transparent;
    cursor: pointer;
    opacity: 0.5;
    text-align: center;
    -webkit-transition: background-color 0.5s, opacity 0.5s;
    transition: background-color 0.5s, opacity 0.5s;
}
.child_preview {
    box-sizing: border-box;
    margin-top: 2px;
    position: absolute;
    z-index: 1;
    color: white !important;
    text-align: center;
    font-size: 12px;
}
.gantt_task_line.task-collapsed {
    height: 4px;
    opacity: 0.25;
}

.gantt_task_line.gantt_project.task-collapsed .gantt_task_content {
    display: none !important;
}
</style>

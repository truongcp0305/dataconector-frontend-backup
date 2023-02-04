<template>
    <div
        :style="{
            width: contentWidth,
            'margin-left':
                (showGroupScheduler || showGroupKanban) && !isViewShowList
                    ? '270px'
                    : '0'
        }"
        ref="symperListItems"
        class="symper-list-items h-100 w-100 d-flex flex-column pa-2"
    >
        <div v-if="showToolbar" class="d-flex mb-2">
            <slot name="tab-view-smart-object" />
            <div
                :class="{
                    'ml-4': dialogMode == true,
                    'align-items-center flex-grow-1': true
                }"
            >
                <span
                    v-if="
                        showTitle &&
                        !(hideTitleOnSbsView && actionPanel) &&
                        (menuBarViewMode != 'short-mode' &&
                        menuBarViewMode != 'tiny-mode'
                            ? true
                            : autoCompleteWidth > 0
                            ? false
                            : true)
                    "
                    class="ml-1 mt-1 font-weight-bold title-show-list"
                    style="font-size: 18px !important"
                >
                    {{ pageTitle }}
                </span>
            </div>
            <div>
                <v-text-field
                    @change="bindToSearchkey"
                    v-model="searchValue"
                    class="d-inline-block mr-2 sym-small-size"
                    single-line
                    v-if="showSearchBox && !isViewScheduler"
                    :append-icon="$i('input.search')"
                    outlined
                    dense
                    label="Search"
                    :placeholder="$t('common.enter_to_search')"
                    :disabled="hasData == false && timeGetData == 1"
                ></v-text-field>
                <v-btn
                    depressed
                    small
                    class="mr-2"
                    v-if="
                        actionPanel ||
                        menuBarViewMode == 'short-mode' ||
                        menuBarViewMode == 'tiny-mode'
                    "
                    @click="showSearchBox = !showSearchBox"
                >
                    <v-icon class="fs-18" small dark>
                        {{ showSearchBox ? 'mdi-close' : 'mdi-magnify' }}
                    </v-icon>
                </v-btn>
                <v-menu bottom left v-if="menuBarViewMode != 'full-mode'">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            icon
                            tile
                            v-show="
                                actionPanel || menuBarViewMode != 'full-mode'
                            "
                            v-bind="attrs"
                            v-on="on"
                            style="width: 29px; height: 29px; margin: 0px 4px"
                        >
                            <v-icon class="fs-18"> mdi-dots-vertical </v-icon>
                        </v-btn>
                    </template>
                    <v-list
                        class="group-action-list"
                        v-for="(item, id) in listBtn"
                        :key="id"
                        :style="{
                            display:
                                !item.menuShow() || !item.isShowInMenu
                                    ? 'none'
                                    : ''
                        }"
                    >
                        <v-list-item
                            v-show="item.menuShow() && item.isShowInMenu"
                            @click="item.callback"
                        >
                            <v-list-item-icon>
                                <v-icon class="fs-18">{{ item.icon() }}</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ item.name() }}</v-list-item-title
                                >
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-tooltip top v-for="(btn, id) in listBtn" :key="id">
                    <template v-slot:activator="{ on }">
                        <v-btn
                            v-show="btn.show() && btn.if() && !btn.isShowInMenu"
                            v-on="on"
                            depressed
                            small
                            :disabled="btn.disabled()"
                            @click="btn.callback"
                            class="mr-2"
                            :style="btn.style"
                        >
                            <v-icon class="fs-18" dark>{{ btn.icon() }}</v-icon>
                        </v-btn>
                    </template>
                    <span :style="btn.nameStyle">{{ btn.name() }}</span>
                </v-tooltip>
                <v-menu
                    offset-y
                    nudge-bottom="8"
                    :max-width="210"
                    :min-width="210"
                    v-if="!actionPanel"
                >
                    <template v-slot:activator="{ on: menu }">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                                <v-btn
                                    @click="
                                        () => {
                                            isClose = true;
                                            showConfigFilter = true;
                                        }
                                    "
                                    depressed
                                    small
                                    v-if="showFilter"
                                    class="mr-2"
                                    v-on="{ ...tooltip, ...menu }"
                                    :disabled="disableAction"
                                >
                                    <v-icon
                                        dark
                                        class="mr-0 fs-18"
                                        :style="{
                                            color:
                                                applyedFilter.userFilter.some(
                                                    (a) => a
                                                ) ||
                                                applyedFilter.sharedFilter.some(
                                                    (a) => a
                                                )
                                                    ? '#FF8C00!important'
                                                    : 'black'
                                        }"
                                        >mdi-filter-variant</v-icon
                                    >
                                </v-btn>
                            </template>
                            <span
                                class="list-filter-tooltip"
                                v-if="domForFilterToolTip.length > 0"
                            >
                                <div>
                                    <p
                                        v-for="(
                                            name, key
                                        ) in domForFilterToolTip"
                                        :key="key"
                                    >
                                        {{ name }}
                                    </p>
                                </div> </span
                            ><span v-else>
                                <div>{{ $t('common.filter') }}</div>
                            </span>
                        </v-tooltip>
                    </template>
                </v-menu>
                <span
                    v-if="
                        Object.keys(customHeaderBtn).length > 0 &&
                        isViewShowList
                    "
                >
                    <v-tooltip
                        top
                        v-for="(itemBtn, i) in customHeaderBtn"
                        :key="i"
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
                                depressed
                                small
                                @click="customBtnClick(i)"
                                v-on="on"
                                :class="
                                    (itemBtn.class ? itemBtn.class : '') +
                                    ' mr-1'
                                "
                            >
                                <i
                                    :class="'fs-18 mdi ' + itemBtn.icon"
                                    v-if="itemBtn.icon"
                                ></i>
                                <span v-if="itemBtn.title">
                                    {{ itemBtn.title }}
                                </span>
                            </v-btn>
                        </template>
                        <span v-if="itemBtn.tooltip">{{
                            itemBtn.tooltip
                        }}</span>
                    </v-tooltip>
                </span>
                <v-btn
                    depressed
                    small
                    class="mr-2"
                    v-if="isShowButtonClose"
                    @click="$emit('close-list')"
                >
                    <v-icon class="fs-18" dark>mdi-close</v-icon>
                </v-btn>
                <v-btn
                    v-if="Object.keys(customBtn).length != 0"
                    depressed
                    :style="{
                        background: customBtn.style.background,
                        color: customBtn.style.color
                    }"
                    small
                    class="mr-2"
                    @click="$emit('click-custom-btn')"
                >
                    <v-icon class="fs-15" dark>{{ customBtn.icon }} </v-icon>
                    <span class="ml-1">{{ customBtn.name }}</span>
                </v-btn>
            </div>
        </div>
        <slot
            name="tab-view"
            :instanceKey="instanceKey"
            :filterKanban="filterKanban"
            :filterScheduler="filterScheduler"
            :userColumnControl="userColumnControl"
            :searchKey="searchKey"
            :viewModeScheduler="viewModeScheduler"
        />
        <div
            class="d-flex w-100 h-100"
            :style="{
                display: isViewShowList == true ? 'flex' : 'none!important'
            }"
        >
            <VueResizable
                v-if="includesTreeview && typeViewConfigs.selectedTree"
                class="h-100 mr-1"
                :active="['r']"
                :maxWidth="500"
                :minWidth="250"
                @resize:end="handleResizeEnd"
                :width="treeviewWidth"
            >
                <TreeGroupListItems
                    ref="treeGroupListItems"
                    :treeviewWidth="treeviewWidth"
                    :rowData="rowDataForTree"
                    :autoGroupField="autoGroupField"
                    :headerNameTable="headerNameTable"
                    :key="treeGroupListItemsKey"
                    :instanceKey="instanceKey"
                    :selectedRow="selectedRow"
                    :totalObject="totalObjectOnTree"
                    :columnTreeConfig="columnTreeConfig"
                    @on-cell-dbl-click="handleNodeSelected"
                    @tree-change-page-size="handleTreeChangePageSize"
                    @tree-change-page="handleTreeChangePage"
                />
            </VueResizable>

            <div class="d-flex flex-column flex-grow-1">
                <div
                    :class="{
                        'fs-13 symper-custom-table symper-list-item  w-100': true,
                        'clip-text': tableDisplayConfig.value.wrapTextMode == 1,
                        'loosen-row': tableDisplayConfig.value.densityMode == 0,
                        'medium-row': tableDisplayConfig.value.densityMode == 1,
                        'compact-row':
                            tableDisplayConfig.value.densityMode == 2,
                        'list-sbs': alwaysShowActionPanel,
                        'd-flex': includesTreeview == true
                    }"
                >
                    <ag-grid-vue
                        :style="{
                            width: '100%',
                            height: tableHeight + 'px'
                        }"
                        ref="agCompon"
                        class="ag-theme-balham ag-list-items-table"
                        :defaultColDef="defaultColDef"
                        :gridOptions="gridOptions"
                        :getContextMenuItems="getContextMenuItems"
                        :columnDefs="columnDefs"
                        @dragStopped="handleColumnChange()"
                        @columnVisible="handleColumnChange()"
                        @columnPinned="handleColumnChange()"
                        :modules="modules"
                        @rowClicked="handlerRowClicked"
                        @rowSelected="handlerRowSelected"
                        :rowData="rowData"
                        :frameworkComponents="frameworkComponents"
                        :overlayNoRowsTemplate="overlayNoRowsTemplate"
                        @cell-context-menu="cellContextMenu"
                        @cell-mouse-down="cellMouseDown"
                        @cell-mouse-over="cellMouseOver"
                        @grid-ready="onGridReady"
                        @cell-clicked="onCellClicked"
                        @model-updated="onModelUpdate"
                        :class="{
                            'not-found-screen':
                                hasData == false &&
                                (timeGetData == 1 || getDataError)
                        }"
                    >
                    </ag-grid-vue>
                    <NotFoundScreen
                        :emptyDataKey="
                            noPermission || getDataPermissionDenied
                                ? permissionDeniedKey
                                : emptyDataKey
                        "
                        v-if="rowData.length == 0"
                        v-on:setoverlayNoRowsTemplate="setoverlayNoRowsTemplate"
                        ref="notFoundScreen"
                        :style="{
                            display:
                                hideNotFoundScreen == true
                                    ? 'none!important'
                                    : ''
                        }"
                        :key="
                            noPermission || getDataPermissionDenied
                                ? 'noPermission'
                                : 'emptyData'
                        "
                    />
                    <display-config
                        ref="tableDisplayConfig"
                        @change-format="changeFormat"
                        @change-apply="applyConditionFormat"
                        @save-conditional-formatting="
                            saveUpdateConditionalFormat
                        "
                        @save-list-display-config="saveTableDisplayConfig"
                        @change-type-view="handleChangeTypeView"
                        @re-render="reRender"
                        @edit-tree-item="handleEditTreeItem"
                        @save-config-type-view="handleSaveConfigTypeView"
                        :instanceKey="instanceKey"
                        :rowData="rowData"
                        :productList="productList"
                        :conditionalFormat="conditionalFormat"
                        :tableDisplayConfig="tableDisplayConfig"
                        :typeViewConfigs="typeViewConfigs"
                        :containerHeight="containerHeight"
                        :tableColumns="columnDefs"
                        :headerPrefixKeypath="headerPrefixKeypath"
                        :showActionPanelInDisplayConfig="
                            showActionPanelInDisplayConfig
                        "
                        :shareTreeConfig="shareTreeConfig"
                        :shareConditionalFormat="shareConditionalFormat"
                        :listSharedConditionalFormat="
                            listSharedConditionalFormat
                        "
                        :allConditionalFormat="allConditionalFormat"
                        :listSelectedCondition="listSelectedCondition"
                    ></display-config>
                </div>
                <div class="mt-2" ref="bottomBar" v-if="showPagination">
                    <Pagination
                        ref="pagination"
                        :total="totalObject"
                        :totalVisible="7"
                        @on-change-page-size="changePageSize"
                        @on-change-page="changePage"
                    ></Pagination>
                </div>
            </div>
        </div>
        <div v-if="isViewKanban">
            <KanbanEndUserConfig
                ref="kanbanEndUserConfig"
                @change-format="changeFormat"
                @change-apply="applyConditionFormat"
                @save-conditional-formatting="saveUpdateConditionalFormat"
                @re-render="reRender"
                @edit-tree-item="handleEditTreeItem"
                @change-type-view="handleChangeTypeView"
                @save-config-type-view="handleSaveConfigTypeView"
                :rowData="rowData"
                :fieldCards="kanbanConfig.fieldCards"
                :allControlInDoc="kanbanConfig.allControlInDoc"
                :conditionalFormat="kanbanConfig.conditionalFormat"
                :tableDisplayConfig="tableDisplayConfig"
                :typeViewConfigs="kanbanConfig.treeView"
                :listSharedConditionalFormat="
                    kanbanConfig.sharedConditionalFormat
                "
                :containerHeight="containerHeight"
                :tableColumns="columnDefs"
                :headerPrefixKeypath="headerPrefixKeypath"
                :showActionPanelInDisplayConfig="showActionPanelInDisplayConfig"
                :showGroupKanban="showGroupKanban"
                :shareTreeConfig="shareTreeConfig"
                :shareConditionalFormat="shareConditionalFormat"
                :listSelectedCondition="listSelectedConditionKanban"
            />
            <v-navigation-drawer v-model="showGroupKanban" absolute width="270">
                <div class="display-group pa-2 pb- h-100">
                    <div class="header fs-13 fw-430">
                        {{ $t('common.display_group') }}
                    </div>
                    <TreeGroupListItems
                        ref="treeGroupKanban"
                        :paddingBottom="'28px'"
                        :controlUsers="columnTypeUser"
                        :rowData="rowDataForTree"
                        :autoGroupField="autoGroupField"
                        :headerNameTable="headerNameTable"
                        :key="treeGroupListItemsKey"
                        :totalObject="totalObjectOnTree"
                        :columnTreeConfig="columnTreeConfig"
                        @on-cell-dbl-click="handleNodeSelected"
                        @tree-change-page-size="handleTreeChangePageSize"
                        @tree-change-page="handleTreeChangePage"
                    />
                </div>
            </v-navigation-drawer>
        </div>

        <div v-if="!isViewShowList && isViewScheduler">
            <SidebarConfigScheduler
                ref="sidebarConfigScheduler"
                @change-format="changeFormat"
                @change-apply="applyConditionFormat"
                @save-conditional-formatting="saveUpdateConditionalFormat"
                @re-render="reRender"
                @edit-tree-item="handleEditTreeItem"
                @change-type-view="handleChangeTypeView"
                @save-config-type-view="handleSaveConfigTypeView"
                :rowData="rowData"
                :fieldCards="schedulerConfig.fieldCards"
                :conditionalFormat="schedulerConfig.conditionalFormat"
                :listSharedConditionalFormat="
                    schedulerConfig.sharedConditionalFormat
                "
                :tableDisplayConfig="tableDisplayConfig"
                :typeViewConfigs="schedulerConfig.treeView"
                :containerHeight="containerHeight"
                :tableColumns="columnDefs"
                :headerPrefixKeypath="headerPrefixKeypath"
                :showActionPanelInDisplayConfig="showActionPanelInDisplayConfig"
                :showGroupScheduler="showGroupScheduler"
                :shareTreeConfig="shareTreeConfig"
                :shareConditionalFormat="shareConditionalFormat"
                :listSelectedCondition="listSelectedConditionScheduler"
            />
            <v-navigation-drawer
                v-model="showGroupScheduler"
                absolute
                width="270"
            >
                <div class="display-group pa-2 pb- h-100">
                    <div class="header fs-13 fw-430">
                        {{ $t('table.tree_view.display_group') }}
                    </div>
                    <TreeGroupListItems
                        ref="treeGroupScheduler"
                        :paddingBottom="'28px'"
                        :controlUsers="columnTypeUser"
                        :rowData="rowDataForTree"
                        :autoGroupField="autoGroupField"
                        :headerNameTable="headerNameTable"
                        :key="treeGroupListItemsKey"
                        :totalObject="totalObjectOnTree"
                        :columnTreeConfig="columnTreeConfig"
                        @on-cell-dbl-click="handleNodeSelected"
                        @tree-change-page-size="handleTreeChangePageSize"
                        @tree-change-page="handleTreeChangePage"
                    />
                </div>
            </v-navigation-drawer>
        </div>
        <ListItemConfigFilterSideBar
            :instanceKey="instanceKey"
            :getDataUrl="getDataUrl"
            :allColumn="tableFilter.allColumn"
            :computedSelfFilterConfig="tableFilter.computedSelfFilterConfig"
            ref="configfilter"
            v-if="showConfigFilter"
            :idDoc="idDoc"
            :shareFilterPermission="shareFilter"
            :tableDisplayConfig="tableDisplayConfig"
            :userColumnControl="userColumnControl"
            @add-custom-filter="addCustomFilter"
            @config-filter-action="configFilterAction"
            @close-filter-config="closeFilterConfig"
            @apply-filter="applyConfigFilter"
            @apply-column-filter="applyColumnFilter"
            :defaultApplyedFilter="defaultApplyedFilter"
            :applyedFilter="applyedFilter"
            :listFilters="listFilters"
            :listSharedFilter="listSharedFilter"
            :isViewKanban="isViewKanban"
            :columnDefs="colForSelfFilter"
        />
        <component
            :is="actionPanelWrapper"
            :width="actionPanelWidth"
            :max-width="actionPanelWidth"
            v-model="actionPanel"
            :class="{
                'item-smart-obj pa-3 overflow-hidden': isViewSmartObj,
                'pa-3 overflow-hidden': !isViewSmartObj,
                'symper-view-side-by-side': actionPanel
            }"
            absolute
            persistent
            stateless
            content-class="bg-white h-100 overflow-hidden action-panel-content"
            right
            v-show="actionPanel"
            v-if="reComputeActionPanelType != 'drag'"
            :temporary="reComputeActionPanelType == 'temporary'"
            ref="actionPanel"
            style="box-shadow: rgb(0 0 0 / 19%) -10px 0 10px -10px"
        >
            <div
                class="d-flex justify-end close-panel-icon mt-3"
                v-if="showCloseIcon && actionPanelType != 'modal'"
            >
                <v-icon class="fs-18 mr-6" @click="closePanelAction" :size="15"
                    >mdi mdi-close</v-icon
                >
            </div>
            <HeaderForm
                ref="headerForm"
                v-if="!actionPanelHeaderConfig.hideHeaderPopUp"
                :showBtnSave="actionPanelHeaderConfig.showBtnSaveHeader"
                @show-info="$emit('show-info')"
                :showCloseIcon="showCloseIcon"
                :showIconInfo="isViewScheduler ? false : true"
                :nameBtn="actionPanelHeaderConfig.nameBtn"
                :colorBtn="actionPanelHeaderConfig.colorBtn"
                :nameHeader="actionPanelHeaderConfig.nameHeaderPanel"
                :icon="actionPanelHeaderConfig.iconHeaderPanel"
                @save-form="saveDataAction"
                @close-form="closePanelAction"
            />
            <slot name="right-panel-content" :itemData="currentItemDataClone">
            </slot>
        </component>
        <symper-drag-panel
            v-else
            @before-close="handleCloseDragPanel"
            :showPanel="actionPanel"
            :panelData="currentItemDataClone"
            :actionTitle="itemActionTitle"
            :dragPanelWidth="actionPanelWidth"
        >
            <template slot="drag-panel-content" slot-scope="{ panelData }">
                <slot name="right-panel-content" :itemData="panelData"> </slot>
            </template>
        </symper-drag-panel>
        <table-filter
            ref="tableFilter"
            :currentColumn="tableFilter.currentColumn.name"
            :customGetDataForFilter="customGetDataForFilter"
            :columnFilter="tableFilter.currentColumn.colFilter"
            @apply-filter-value="applyFilter"
            @search-autocomplete-items="searchAutocompleteItems"
            :height="containerHeight - 50"
        ></table-filter>
        <SymperDialogConfirm
            @confirm="confirmDeleteInfo.confirm()"
            @cancel="confirmDeleteInfo.cancel()"
            :title="confirmDeleteInfo.title"
            :titleCancelBtn="$t('common.exit')"
            :titleConfirmBtn="$t('common.delete')"
            :content="confirmDeleteInfo.content"
            :showDialog="confirmDeleteInfo.show"
        />

        <LightBox
            :isShowStar="false"
            :isSetMain="false"
            ref="lightbox"
            :media="listImageLightBox"
            :show-caption="true"
            :startAt="avatarIndex"
            :show-light-box="true"
        />
    </div>
</template>
<script>
import Gradient from 'javascript-color-gradient';
import { documentApi } from '@/api/Document.js';
import { AgGridVue } from 'ag-grid-vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import { util } from '@/plugins/util';
import Vue from 'vue';
import Pagination from '@/components/common/Pagination';
import {
    getDefaultFilterConfig,
    getFilterConfigs
} from '@/components/common/customTable/defaultFilterConfig.js';
import CustomHeader from '@/components/common/agDataTable/CustomAgGrid/CustomHeader';
import DisplayConfig from '@/components/common/listItemComponents/DisplayConfig';
import SymperDragPanel from '@/components/common/SymperDragPanel.vue';
import { VDialog, VNavigationDrawer } from 'vuetify/lib';
import TableFilter from '@/components/common/customTable/TableFilter';
import ListItemsWorker from 'worker-loader!@/worker/common/listItems/ListItems.Worker.js';
import { actionHelper } from '@/action/actionHelper';
import CheckBoxRenderer from '@/components/common/agDataTable/CheckBoxRenderer';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
import HeaderForm from '@/components/common/HeaderForm';
import ConfigFilter from './ListItemConfigFilter';
import ListItemConfigFilterSideBar from './ListItemConfigFilterSideBar';
import 'ag-grid-enterprise';
import TreeGroupListItems from '@/components/common/listItemComponents/TreeGroupListItems';
import AddFilter from './ListItemAddFilter';
import CheckBoxRendererListItems from '@/components/common/agDataTable/CheckBoxRendererListItems';
import KanbanEndUserConfig from '@/components/kanban/KanbanEndUserConfig';

let CustomHeaderVue = Vue.extend(CustomHeader);
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import _debounce from 'lodash/debounce';
import LightBox from '@/components/common/imageSlideShow/LightBox';
import VueResizable from 'vue-resizable';
import SidebarConfigScheduler from '@/components/scheduler/SidebarConfigScheduler.vue';
import NotFoundScreen from '@/components/common/NotFoundScreen';
import treeConditionToJSString from '@/components/dashboard/configPool/treeConditionToJSString.js';
var mo = treeConditionToJSString.mo;

var testSelectData = [];
window.tableDropdownClickHandle = function (el, event) {
    event.preventDefault();
    event.stopPropagation();
    let thisListItem = util.getClosestVueInstanceFromDom(el, 'SymperListItem');
    thisListItem.showTableDropdownMenu(
        event.pageX,
        event.pageY,
        $(el).attr('col-name')
    );
};
export default {
    name: 'SymperListItem',
    props: {
        headerByTranslateName: {
            type: Boolean,
            default: true
        },
        idDoc: {
            type: String,
            default: ''
        },
        hasScheduler: {
            type: Boolean
        },
        hasKanban: {
            type: Boolean
        },
        customBtn: {
            type: Object,
            default() {
                return {};
            }
        },
        noPermission: {
            type: Boolean,
            default: false
        },
        isViewSmartObj: {
            type: Boolean,
            default: false
        },
        useCustomUiConfig: {
            type: Boolean,
            default: true
        },
        isShowListDocument: {
            type: Boolean,
            default: false
        },
        customConditionsForFilter: {
            type: Object,
            default() {
                return {};
            }
        },
        customGetDataForFilter: {
            type: Object,
            default() {
                return {};
            }
        },
        showCloseIcon: {
            type: Boolean,
            default: false
        },
        actionPanelHeaderConfig: {
            type: Object,
            default() {
                return {
                    hideHeaderPopUp: true,
                    iconHeaderPanel: '',
                    nameHeaderPanel: '',
                    showBtnSaveHeader: true,
                    colorBtn: 'success',
                    nameBtn: ''
                };
            }
        },
        customContentType: {
            type: Boolean,
            default: false
        },
        showTitle: {
            type: Boolean,
            default: true
        },
        flexMode: {
            type: Boolean,
            default: false
        },
        /**
         * Mặc định context menu chứa các options: remove, view, edit
         */
        useDefaultContext: {
            type: Boolean,
            default: false
        },
        /**
         * Custom thêm các action trong header show list
         */
        customHeaderBtn: {
            type: Object,
            default() {
                return {};
            }
        },
        /**
         * Truyeenf vao row height
         *
         */
        rowHeight: {
            type: Number,
            default: 21
        },
        showDisplayConfig: {
            type: Boolean,
            default: true
        },
        /**
         * flexColumns : true of false, nếu đúng thì colmn sẽ có thêm thược tính flex đê full màn hinh
         * dev created : dungna
         */
        flexColumns: {
            type: Boolean,
            default: false
        },
        /**
         * * Các contextmenu cho các item trong list, có dạng:
         * [
         *      {
         *          name: 'action1' // Tên của context menu để phân biệt với các context menu khác.
         *          text: ' Action 1' // Text hiển thị lên .
         *      }
         * ]
         */
        tableContextMenu: {
            default() {
                return [];
            }
        },
        /**
         * Hàm phục vụ cho việc dev tự định nghĩa data khi gọi API để lấy dữ liệu
         * thay vì sử dụng hàm có sẵn, các tham số truyền vào giống như hàm getOptionForGetList trong defaultFilterConfig
         */
        customDataForApi: {
            type: Function,
            default: null
        },
        showDisplayConfig: {
            type: Boolean,
            default: true
        },
        apiMethod: {
            type: String,
            default: 'GET'
        },
        dialogMode: {
            type: Boolean,
            default: false
        },
        showToolbar: {
            type: Boolean,
            default: true
        },
        useWorkFlowHeader: {
            type: Boolean,
            default: false
        },
        widthContentCustom: {
            type: Number,
            default: 0
        },
        showImportButton: {
            type: Boolean,
            default: false
        },
        overlayMessage: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('v2.showlist.loadingData');
            }
        },
        showFilter: {
            type: Boolean,
            default: true
        },
        showImportHistoryBtn: {
            type: Boolean,
            default: false
        },
        exportLink: {
            type: String,
            default: ''
        },
        widgetIdentifier: {
            type: String,
            default: ''
        },
        showExportButton: {
            type: Boolean,
            default: true
        },
        debounceRowSelectTime: {
            type: Number,
            default: 100
        },
        currentItemData: {
            type: Object,
            default() {
                return {};
            }
        },
        showButtonAdd: {
            type: Boolean,
            default: true
        },
        showActionPanelInDisplayConfig: {
            type: Boolean,
            default: false
        },
        hideTitleOnSbsView: {
            type: Boolean,
            default: false
        },
        /**
         * Prefix cho keypath trong file đa ngôn ngữ để hiển thị header của table
         */
        headerPrefixKeypath: {
            type: String,
            default: ''
        },
        getDataUrl: {
            type: String,
            default: ''
        },
        // Chiều rộng của btn autoComplete
        autoCompleteWidth: {
            type: Number,
            default: 0
        },
        checkedRows: {
            type: Array,
            default() {
                return [];
            }
        },
        getDataFromFilterUrl: {
            type: String,
            default: ''
        },
        // Tiêu đề của trang: Danh sách văn bản, danh sách người dùng ...
        pageTitle: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('v2.showlist.list');
            }
        },
        // Chiều cao của khung chứa danh sách
        containerHeight: {
            type: Number,
            default: 200
        },
        lazyLoad: {
            type: Boolean,
            default: false
        },
        // Chiều rộng của pannel bên phải
        actionPanelWidth: {
            type: [Number, String],
            default: 400
        },
        // Loại hiển thị cho actionPanel - một trong các loại: modal, temporary, elastic, drag, popup
        actionPanelType: {
            type: String,
            default: 'temporary'
        },
        showBtnSave: {
            type: Boolean,
            default: true
        },
        // Các input khi edit hoặc thêm hoặc xem chi tiết một item trong danh sách
        itemInputs: {
            type: Object,
            default() {
                return {};
            }
        },
        itemActionTitle: {
            type: String,
            default: ''
        },
        listItemName: {
            type: String,
            default: 'item'
        },
        isCompactMode: {
            type: Boolean,
            default: false
        },
        /**
         * Dùng Trong trường hợp mà gọi đến một API mà không thể thay đổi định dạng trả về của API đó  theo đúng với định dạng chung của ListItem
         * định dạng:
         * {
         *     reformatData(res){} // Lấy ra các cột cần hiển thị
         * }
         **/
        customAPIResult: {
            type: Object,
            default() {
                return {};
            }
        },
        /**
         * Có sử dụng action panel để add, edit, clone hay ko.
         * Nếu có thì mở action panel( ở bên phải hoặc modal ...)
         * Nếu không thì dev cần xử lý bằng cách: các action dẫn sang một page mới
         */
        useActionPanel: {
            type: Boolean,
            default: true
        },

        /**
         * Chứa các thông tin chung cho các action trong context menu cần định nghĩa
         * có dạng : {
         *      "module": "",
         *      "resource": "",
         *      "scope": "",
         * }
         */
        commonActionProps: {
            type: Object,
            default() {
                return {};
            }
        },

        // biến đánh dấu table đươc quyền edit hay ko
        isTablereadOnly: {
            type: Boolean,
            default: true
        },
        productList: {
            type: Boolean,
            default: false
        },
        /**
         * Thêm điều kiện để quy vấn qua api
         */
        conditionByFormula: {
            type: String
        },
        /**
         * Dữ liệu mặc định cho table
         */
        defaultData: {
            type: Object,
            default() {
                return {
                    listObject: {},
                    columns: {},
                    total: 0
                };
            }
        },
        showPagination: {
            type: Boolean,
            default: true
        },
        autoRefreshTopic: {
            type: String,
            default: ''
        },
        /**
         * đường dẫn từ object chứa response tới key chứa mảng dữ liệu trả về
         * trong trường hợp response trả về không có định dạng đúng với tiêu chuẩn, thì cần cấp đường dẫn này để biết đường lấy mảng dữ liệu
         */
        pathToListObject: {
            type: String,
            default: '.data.listObject'
        },
        // Thêm prop export data ra file theo tên này
        exportFileName: {
            type: String,
            default: 'data'
        },
        isExporting: {
            type: Boolean,
            default: false
        },
        isViewShowList: {
            type: Boolean,
            default: true
        },
        emptyDataKey: {
            type: String,
            default: 'no-data'
        },
        disableButtonAdd: {
            type: Boolean,
            default: false
        },
        isViewKanban: {
            type: Boolean,
            default: false
        },
        isViewScheduler: {
            type: Boolean,
            default: false
        },
        showTabView: {
            type: Boolean,
            default: false
        },
        tabViewObject: {
            type: Number,
            default: 0
        },
        isShowButtonClose: {
            type: Boolean,
            default: false
        }
    },
    created() {
        this.$store.commit('document/setFilterConfig', {});
        const self = this;
        this.$evtBus.$on('showlist-tree-view-clear-filter', (instanceKey) => {
            if (instanceKey == this.instanceKey) {
                this.handleNodeSelected([{ key: 'all', value: 'Tất cả' }]);
            }
        });
        this.$evtBus.$on(
            'showlist-report-self-filter-get-item-filter',
            (instanceKey, colName) => {
                if (instanceKey == this.instanceKey)
                    this.getItemForValueFilterSideBar(colName);
            }
        );
        this.$evtBus.$on(
            'showlist-tree-view-synchronized-filter',
            (synchronized, instanceKey) => {
                if (instanceKey == this.instanceKey) {
                    if (synchronized) {
                        let treeViewFilter = {
                            allColumn: {},
                            currentColumn: {},
                            allColumnInTable: []
                        };
                        Object.keys(this.filteredColumns)
                            .filter((col) => this.filteredColumns[col])
                            .map((col) => {
                                treeViewFilter.allColumn[col] =
                                    this.tableFilter.allColumn[col];
                            });
                        this.treeViewFilter = treeViewFilter;
                        this.needRerenderTreeView = true;
                    } else {
                        if (
                            this.listFilters.length > 0 &&
                            this.filterIdx != -1
                        ) {
                            this.treeViewFilter = this.listFilters[
                                this.filterIdx
                            ].treeViewFilter
                                ? util.cloneDeep(
                                      this.listFilters[this.filterIdx]
                                          .treeViewFilter
                                  )
                                : {
                                      allColumn: {},
                                      currentColumn: {},
                                      allColumnInTable: []
                                  };
                        } else {
                            this.treeViewFilter = {
                                allColumn: {},
                                currentColumn: {},
                                allColumnInTable: []
                            };
                        }
                    }
                    this.needRerenderTreeView = true;
                }
            }
        );
        this.$evtBus.$on('kanban-save-ui-config', (filter) => {
            this.filterKanban = filter;
        });
        this.$evtBus.$on('finish-load-data', (filter) => {
            this.loadingRefresh = false;
        });
        this.$evtBus.$on('scheduler-filter-config', (filter) => {
            this.filterScheduler = filter;
        });
        this.$evtBus.$on('get-all-control', (allControl) => {
            let control = [];
            Object.keys(allControl).map((cardKey) => {
                let card = allControl[cardKey];
                control.push(card);
            });
            self.kanbanConfig.allControlInDoc = control;
            for (let key in allControl) {
                if (allControl[key].type == 'user')
                    self.columnTypeUser[allControl[key].field] = true;
            }
        });
        this.$evtBus.$on('get-card-kanban', (cardField) => {
            let fieldCards = [];
            Object.keys(cardField).map((cardKey) => {
                let card = cardField[cardKey];
                card.name = card.headerName;
                fieldCards.push(card);
            });
            this.kanbanConfig.fieldCards = fieldCards;
        });
        this.$evtBus.$on('get-card-scheduler', (cardField) => {
            let fieldCards = [];
            Object.keys(cardField).map((cardKey) => {
                let card = cardField[cardKey];
                card.name = card.headerName;
                fieldCards.push(card);
            });
            this.schedulerConfig.fieldCards = fieldCards;
        });
        this.$evtBus.$on('save-view-scheduler', (mode) => {
            const self = this;
            if (self.viewModeScheduler != mode) {
                self.viewModeScheduler = mode;
                self.saveUiConfig();
            }
        });
        this.checkSharePermission();
        this.listItemsWorker = new ListItemsWorker();
        if (this.useCustomUiConfig) {
            this.getCustomUIConfig();
        } else {
            self.translateTableFilterConfigs();
        }
        if (this.idDoc != '') {
            this.getUserField();
        }
        this.listItemsWorker.addEventListener('message', function (event) {
            let data = event.data;
            this.getDataError = false;
            switch (data.action) {
                case 'getData':
                    if (data.dataAfter.isExport) {
                        self.handleExportExcel(data.dataAfter);
                    } else {
                        self.handlerGetData(data.dataAfter);
                    }
                    break;
                case 'getDataError':
                    self.handlerGetDataError(data.dataAfter);
                    break;
                case 'customGetData':
                    self.handleCustomGetData(data.dataAfter);
                    break;
                case 'getDataForTree':
                    self.handleGetDataForTree(data.dataAfter);
                    break;
                case 'getItemForValueFilter':
                    self.tableFilter.currentColumn.colFilter.selectItems =
                        data.dataAfter.selectItems;
                    self.$refs.tableFilter.loading = false;
                    break;
                case 'getItemForValueFilterSideBar':
                    self.$evtBus.$emit(
                        'showlist-filtersidebar-change-computedselffilterconfig',
                        self.tableFilter.currentColumn.name,
                        data.dataAfter.selectItems
                    );
                    break;
                case 'setSelectItemForFilter':
                    self.tableFilter.currentColumn.colFilter.selectItems =
                        data.dataAfter.selectItems;
                    break;
                case 'getCustomUIConfig':
                    // this.getData();
                    self.handlerGetCustomUIConfigRes(data.dataAfter);
                    if (self.allConditionalFormatScheduler) {
                        self.$store.commit(
                            'scheduler/setConditionalFormat',
                            self.allConditionalFormatScheduler
                        );
                    }
                    if (self.allConditionalFormatKanban) {
                        self.$store.commit(
                            'kanban/setConditionalFormat',
                            self.allConditionalFormatKanban
                        );
                    }
                    break;
                case 'saveTableDisplayConfig':
                    self.handlerSaveTableDisplayConfigRes(data.dataAfter);
                    break;
                case 'saveTableTypeViewConfig':
                    self.handleSaveTableTypeViewConfigRes(data.dataAfter);
                    break;
                case 'saveUiConfig':
                    self.handleSaveUiConfig(data.dataAfter);
                    this.isNotiSuccess = false;
                    break;
                case 'getTableColumns':
                    data.dataAfter.forEach(function (e) {
                        if (e.cellRenderer) {
                            eval('e.cellRenderer = ' + e.cellRenderer);
                        }
                        if (self.flexMode) {
                            e.flex = 1;
                        }
                        if (e.cellStyle) {
                            eval('e.cellStyle = ' + e.cellStyle);
                        }

                        if (self.headerByTranslateName) {
                            e.headerName = self.prefix
                                ? self.$t(self.prefix + e.field)
                                : e.field;
                        } else {
                            e.headerName = self.prefix
                                ? self.$t(self.prefix + e.headerName)
                                : e.headerName;
                        }

                        if (!e.width) {
                            e.minWidth = 150;
                        }
                        if (self.columnDefsInfo.length > 0) {
                            for (
                                let i = 0;
                                i < self.columnDefsInfo.length - 1;
                                i++
                            ) {
                                if (e.field == self.columnDefsInfo[i].colId) {
                                    e.width = self.columnDefsInfo[i].width;
                                }
                            }
                        }
                    });

                    if (self.conditionalFormat) {
                        if (self.listSelectedCondition.length == 0) {
                            self.listSelectedCondition =
                                self.getListSelectedConditionFormat();
                        }
                        self.columnDefs = self.handleConditionalFormat(
                            data.dataAfter
                        );
                    } else {
                        self.columnDefs = data.dataAfter;
                    }
                    self.columnDefs.map((col) => {
                        col.cellStyle = (e) => {
                            let style = {};
                            if (self.dataFormat[col.field]) {
                                style = self.getStyleForCell(
                                    self.dataFormat[col.field],
                                    col,
                                    e
                                );
                            }
                            return style;
                        };
                    });
                    self.columnDefs.unshift({
                        headerName: '',
                        field: 'checkboxColumn',
                        headerCheckboxSelection: true,
                        checkboxSelection: true,
                        width: 50,
                        hide: !self.hasColumnsChecked,
                        noFilter: true
                    });
                    self.columnDefs.map((ctr) => {
                        if (ctr.type == 'user') {
                            self.columnTypeUser[ctr.field] = true;
                        }
                    });
                    if (self.typeViewConfigs.productList && self.productList) {
                        self.toggleShowAttackFileColumn(
                            self.typeViewConfigs.productList
                        );
                    }
                    self.rowData = self.lazyRowData;
                    self.hideOverlay();
                    self.$emit('data-loaded', self.lazyRowData);
                    self.setSelectedRow();
                    if (self.rowData.length == 0) {
                        self.hasData = false;
                    } else self.hasData = true;
                    setTimeout(() => {
                        self.agApi.redrawRows();
                    }, 200);
                    break;
                default:
                    break;
            }
        });
    },
    mounted() {
        let self = this;
        window.addEventListener(
            'resize',
            _debounce(() => {
                this.reRender();
            }, 300)
        );
        new ResizeObserver((val) => {
            this.menuContainerWidth = val[0].contentRect.width;
            if (
                val[0].contentRect.width >=
                this.numberBtnSatisfyCondition().length * 56 +
                    500 +
                    this.autoCompleteWidth
            ) {
                this.menuBarViewMode = 'full-mode';
            } else if (
                val[0].contentRect.width <
                    this.numberBtnSatisfyCondition().length * 56 +
                        500 +
                        this.autoCompleteWidth &&
                val[0].contentRect.width >= 500 + this.autoCompleteWidth
            ) {
                this.menuBarViewMode = 'auto-mode';
                this.calcBtnShow();
            }
            if (val[0].contentRect.width < 500 + this.autoCompleteWidth) {
                this.$emit('collapsed-menubar', true);
                this.menuBarViewMode != 'short-mode' &&
                this.menuBarViewMode != 'tiny-mode'
                    ? (this.showSearchBox = false)
                    : true;
                this.menuBarViewMode = 'short-mode';
            } else {
                this.$emit('collapsed-menubar', false);
                this.showSearchBox = true;
            }

            if (val[0].contentRect.width - this.autoCompleteWidth - 380 < 0) {
                this.menuBarViewMode = 'tiny-mode';
                this.$emit('collapsed-autocomplete-doc', this.showSearchBox);
            } else {
                this.$emit('collapsed-autocomplete-doc', false);
            }
        }).observe(this.$refs.symperListItems, {
            attributes: true,
            attributeFilter: ['width']
        });
    },
    computed: {
        //thay type từ text thành user đối với các field user, để lấy id user thay vì tên user
        colForSelfFilter() {
            let columnDefs = this.columnDefs
                .filter((col) => col.field != 'checkboxColumn')
                .map((col) => {
                    if (this.userColumnControl.includes(col.field)) {
                        return { ...col, type: 'user' };
                    } else {
                        return { ...col };
                    }
                });
            return columnDefs;
        },
        // lấy các filter được áp dụng, phục vụ tooltip khi hover vào filter icon
        domForFilterToolTip() {
            let applyedFilterName = [];
            this.applyedFilter.userFilter.forEach((status, idx) => {
                if (status) {
                    applyedFilterName.push(this.listFilters[idx].name);
                    return this.listFilters[idx].name;
                }
            });
            this.applyedFilter.sharedFilter.forEach((status, idx) => {
                if (status) {
                    applyedFilterName.push(this.listSharedFilter[idx].name);
                    return this.listSharedFilter[idx].name;
                }
            });
            return applyedFilterName;
        },
        listBtn() {
            let self = this;

            self.calcBtnShow();
            return self.listMenuBtn;
        },

        prefix() {
            let prefix = this.headerPrefixKeypath;
            prefix =
                prefix[prefix.length - 1] == '.' || prefix == ''
                    ? prefix
                    : prefix + '.';
            return prefix;
        },
        alwaysShowActionPanel() {
            return (
                this.checkHasPermission('detail') &&
                this.tableDisplayConfig.value.alwaysShowSidebar
            );
        },
        reComputeActionPanelType() {
            return this.tableDisplayConfig.value.alwaysShowSidebar
                ? 'elastic'
                : this.actionPanelType;
        },
        currentItemDataClone() {
            return util.cloneDeep(this.currentItemData);
        },
        actionTitle() {},
        contentWidth() {
            let compensation = 0;
            if (
                this.actionPanel &&
                this.reComputeActionPanelType == 'elastic'
            ) {
                compensation += this.actionPanelWidth;
            }
            if (
                this.kanbanConfig.treeView.selectedTree &&
                this.isViewKanban &&
                this.kanbanConfig.treeView.tableType == 'treeview'
            ) {
                compensation += 270;
            } else if (
                this.schedulerConfig.treeView.selectedTree &&
                this.isViewScheduler &&
                this.schedulerConfig.treeView.tableType == 'treeview'
            ) {
                compensation += 270;
            }
            if (this.tableDisplayConfig.show) {
                compensation += this.tableDisplayConfig.width;
            } else if (this.showPagination == false) {
                if (this.widthContentCustom > 0) {
                    return this.widthContentCustom + 'px';
                } else {
                }
            } else {
            }

            if (this.showConfigFilter) {
                compensation += window.innerWidth / 5;
            }
            return 'calc(100% - ' + compensation + 'px)';
        },

        tableHeight() {
            let tbHeight = this.containerHeight;
            tbHeight = this.addFilter ? tbHeight - 133 : tbHeight - 89;
            return tbHeight;
        },
        actionPanelWrapper() {
            let mapType = {
                modal: 'v-dialog',
                temporary: 'v-navigation-drawer',
                elastic: 'v-navigation-drawer'
            };
            return mapType[this.reComputeActionPanelType]
                ? mapType[this.reComputeActionPanelType]
                : mapType['temporary'];
        },
        disableAction() {
            return !this.hasData;
        },
        listFilter() {
            return this.listFilters.concat(this.listSharedFilter);
        }
    },
    watch: {
        //đóng bảng display-config khi mở filter
        showConfigFilter(newVal) {
            if (newVal) {
                this.actionPanel = false;
                this.tableDisplayConfig.show = false;
                this.closePanelAction();
            }
            this.$evtBus.$emit('showlist-display-config-open', {
                instanceKey: this.instanceKey,
                isShow: newVal
            });
        },
        //thay đổi tabview, check xem có cần get lại data để đồng bộ bộ lọc hay không
        showSearchBox(val) {
            if (this.menuBarViewMode == 'tiny-mode') {
                this.$emit('collapsed-autocomplete-doc', val);
            }
        },
        tabViewObject() {
            if (!this.isViewShowList) {
                if (this.isViewKanban) {
                    if (this.needGetDataForKanban) {
                        this.$evtBus.$emit(
                            'showlist-update-report',
                            this.instanceKey,
                            'kanban'
                        );
                    }
                    this.needGetDataForKanban = false;
                    this.showGroupScheduler = false;
                    if (this.selectedFilterNameOfKanban == '') {
                        let check = false;
                        this.listFilterKanbans.map((filter) => {
                            if (filter.name == this.selectedFilterName) {
                                check = true;
                            }
                        });
                        if (!check) {
                            this.selectedFilterName = '';
                            this.closeBtnFilter = false;
                        }
                    } else {
                        this.selectedFilterName =
                            this.selectedFilterNameOfKanban;
                        this.closeBtnFilter = true;
                    }
                    this.handleChangeTypeView(
                        this.kanbanConfig.treeView.tableType
                    );
                    if (this.kanbanConfig.treeView.tableType == 'treeview') {
                        if (this.kanbanConfig.treeView.selectedTree) {
                            this.translateTreeConfigToData(
                                this.kanbanConfig.treeView.selectedTree
                            );
                            this.showGroupKanban = true;
                        }
                    }
                    this.$evtBus.$emit('search-kanban', this.searchKey);
                } else if (this.isViewScheduler) {
                    if (this.needGetDataForScheduler) {
                        this.$evtBus.$emit(
                            'showlist-update-report',
                            this.instanceKey,
                            'scheduler'
                        );
                        this.needGetDataForScheduler = false;
                    }
                    this.actionPanel = false;
                    this.showGroupKanban = false;
                    if (this.selectedFilterNameOfScheduler == '') {
                        let check = false;
                        this.listFilterSchedulers.map((filter) => {
                            if (filter.name == this.selectedFilterName) {
                                check = true;
                            }
                        });
                        if (!check) {
                            this.selectedFilterName = '';
                            this.closeBtnFilter = false;
                        }
                    } else {
                        this.selectedFilterName =
                            this.selectedFilterNameOfScheduler;
                        this.closeBtnFilter = true;
                    }
                    this.handleChangeTypeView(
                        this.schedulerConfig.treeView.tableType
                    );
                    if (this.schedulerConfig.treeView.tableType == 'treeview') {
                        if (this.schedulerConfig.treeView.selectedTree) {
                            this.translateTreeConfigToData(
                                this.schedulerConfig.treeView.selectedTree
                            );
                            this.showGroupScheduler = true;
                        }
                    }
                }
            } else {
                if (this.needGetDataForShowlist) {
                    this.getData();
                    this.needGetDataForShowlist = false;
                }
                this.handleChangeTypeView(this.typeViewConfigs.tableType);
                if (this.selectedFilterNameOfShowList == '') {
                    let check = false;
                    this.listFilters.map((filter) => {
                        if (filter.name == this.selectedFilterName) {
                            check = true;
                        }
                    });
                    if (!check) {
                        this.selectedFilterName = '';
                        this.closeBtnFilter = false;
                    }
                } else {
                    this.selectedFilterName = this.selectedFilterNameOfShowList;
                    this.closeBtnFilter = true;
                }
            }
            this.tableDisplayConfig.show = false;
        },
        actionPanel(val) {
            this.$emit('action-panel-change', val);
            if (this.actionPanel == true) {
                this.$emit('open-panel');
                this.searchValue = this.searchKey;
                this.tableDisplayConfig.show = false;
                this.showConfigFilter = false;
            } else {
                this.$emit('close-panel');
                if (this.$refs.headerForm) {
                    this.$refs.headerForm.loading = false;
                }
            }
        },
        'typeViewConfigs.selectedTree'(val, oldVl) {
            this.clearFilterByTreeConfig();
            if (!this.notWatchSelectedTree) {
                this.translateTreeConfigToData(val);
            }
            this.notWatchSelectedTree = false;
        },
        'schedulerConfig.treeView.selectedTree'(val, oldVl) {
            this.clearFilterByTreeConfig();
            if (val && this.schedulerConfig.treeView.tableType == 'treeview') {
                this.showGroupScheduler = true;
            } else {
                if (val == '') {
                    this.$evtBus.$emit('change-type-flat-scheduler');
                }
                this.showGroupScheduler = false;
            }
            this.translateTreeConfigToData(val);
        },
        'schedulerConfig.treeView.tableType'(val, oldVl) {
            if (this.isViewScheduler) {
                this.handleChangeTypeView(val);
                if (val == 'treeview') {
                    if (this.schedulerConfig.treeView.selectedTree) {
                        this.translateTreeConfigToData(
                            this.schedulerConfig.treeView.selectedTree
                        );
                        this.showGroupScheduler = true;
                    }
                } else {
                    this.showGroupScheduler = false;
                    this.$evtBus.$emit('change-type-flat-scheduler');
                }
            }
        },
        'kanbanConfig.treeView.selectedTree'(val, oldVl) {
            this.clearFilterByTreeConfig();
            if (val && this.kanbanConfig.treeView.tableType == 'treeview') {
                this.showGroupKanban = true;
            } else {
                if (val == '') {
                    this.$evtBus.$emit('change-type-flat-kanban');
                }
                this.showGroupKanban = false;
            }
            this.translateTreeConfigToData(val);
        },
        'kanbanConfig.treeView.tableType'(val, oldVl) {
            if (this.isViewKanban) {
                this.handleChangeTypeView(val);
                if (val == 'treeview') {
                    this.translateTreeConfigToData(
                        this.kanbanConfig.treeView.selectedTree
                    );
                    if (this.kanbanConfig.treeView.selectedTree)
                        this.showGroupKanban = true;
                } else {
                    this.showGroupKanban = false;
                    this.$evtBus.$emit('change-type-flat-kanban');
                }
            }
        },
        'typeViewConfigs.tableType'(val, oldVl) {
            if (this.isViewShowList) {
                if (val == 'treeview' && this.typeViewConfigs.selectedTree) {
                    this.handleChangeTypeView(val);
                    this.translateTreeConfigToData(
                        this.typeViewConfigs.selectedTree
                    );
                }
            }
        },
        'typeViewConfigs.productList'(val) {
            this.handleProductListToggle(val);
        },
        'defaultAttachFileColumn.field'(val) {
            if (val != '' && this.productList) {
                this.toggleShowAttackFileColumn(
                    this.typeViewConfigs.productList
                );
            }
        },
        rowData: {
            deep: true,
            immediate: true,
            handler(arr) {
                if (arr.length == 0) {
                    //	this.showNoRowsOverlay()
                }
            }
        },
        getDataUrl() {
            this.page = 1;
            this.searchValue = '';
            this.searchKey = '';
            this.refreshList();
        },
        //đóng filter config khi mở display-config
        'tableDisplayConfig.show'(value) {
            this.$evtBus.$emit('showlist-display-config-open', {
                instanceKey: this.instanceKey,
                isShow: value
            });
            if (value) {
                this.actionPanel = false;
                this.showConfigFilter = false;
            }
            if ((value = false)) {
                this.agApi.sizeColumnsToFit();
            }
        },
        tableContextMenu: {
            deep: true,
            immediate: true,
            handler(arr) {
                this.relistContextmenu();
            }
        },
        'tableDisplayConfig.value.alwaysShowSidebar'(value) {
            if (
                value &&
                !$.isEmptyObject(this.currentItemDataClone) &&
                this.currentItemDataClone.id
            ) {
                this.openactionPanel();
            } else {
                this.closeactionPanel();
            }
        },
        'tableDisplayConfig.value.densityMode'(value) {
            switch (value) {
                case 0:
                    this.setRowHeight(50);
                    break;
                case 1:
                    this.setRowHeight(30);
                    break;
                case 2:
                    this.setRowHeight(21);
                    break;
            }
        },
        'tableDisplayConfig.value.wrapTextMode'(value) {
            this.customRowHeights(value);
        },
        needRerenderTreeView(newVal) {
            if (newVal) {
                this.translateTreeConfigToData(
                    this.typeViewConfigs.selectedTree,
                    true,
                    this.treeViewFilter
                );
                this.needRerenderTreeView = false;
            }
        },
        conditionByFormula(val) {
            this.$emit('change-conditional-formula');
        }
    },
    data() {
        let self = this;
        return {
            permissionDeniedKey: 'permission-denied-list-item',
            getDataPermissionDenied: false,
            columnDefsInfo: [],
            changeForWatch: false,
            dataFormat: [],
            needGetDataForKanban: false,
            needGetDataForScheduler: false,
            needGetDataForShowlist: false,
            reportConfig: {},
            userColumnControl: [],
            defaultApplyedFilter: null,
            menuContainerWidth: 0,
            allConditionalFormat: [],
            allConditionalFormatKanban: [],
            allConditionalFormatScheduler: [],
            shareTreeConfig: false,
            shareFilter: false,
            shareConditionalFormat: false,
            listSharedFilter: [],
            showConfigFilter: false,
            getDataError: false,
            needRerenderTreeView: false,
            treeViewFilter: {},
            selectedRow: {},
            showPopUp: true,
            allUsers: [],
            tabView: 0,
            columnTypeUser: { document_object_user_created_id: true }, // chứa những cột có kiểu là user
            showGroupKanban: false,
            modules: [ClipboardModule, ClientSideRowModelModule],
            listSharedConditionalFormat: [],
            kanbanConfig: {
                conditionalFormat: [],
                treeView: '',
                fieldCards: [],
                allControlInDoc: [],
                treeView: {
                    tableType: 'flat',
                    selectedTree: '',
                    treeData: []
                },
                sharedConditionalFormat: []
            },
            filterIdx: -1,
            applyedFilter: {
                userFilter: [],
                sharedFilter: []
            },
            treeviewWidth: 300,
            listImageLightBox: [],
            listControlUpload: {},
            defaultAttachFileColumn: {
                headerName: self.$t('v2.showlist.attachedImage'),
                field: 'avatarShowList',
                width: 160,
                autoHeight: true,
                key: 'defaultAttachFileColumn'
            },
            columnTreeConfig: [],
            autoGroupField: '',
            headerNameTable: '',
            // typeViewConfigsKanban:{
            //     tableType: 'treeView',
            //     selectedTree: "",
            //     treeData:[]
            // },
            typeViewConfigs: {
                productList: false,
                tableType: 'flat',
                selectedTree: '',
                treeData: [],
                shareTree: []
            },
            searchValue: '',
            treeGroupListItemsKey: 0,
            countColumnResized: 0,
            includesTreeview: false,
            isNotiSuccess: false, // có hoặc không hiển thị thông báo khi lưu thành công
            conditionalFormat: [],
            listSelectedCondition: [], //list cấu hình điều kiện được chọn
            listSelectedConditionKanban: [], //list cấu hình điều kiện được chọn
            listSelectedConditionScheduler: [], //list cấu hình điều kiện được chọn
            listId: [], // chứa list Id của table
            closeBtnFilter: false,
            isUpdateFilter: false,
            isClose: true,
            listFilters: [],
            notiFilter: '',
            conditionIndex: -1,
            deleteFilterIdx: 0,
            selectedFilterName: '',
            listItemsWorker: null,
            deleteItems: [],
            filterMenu: false,
            addFilter: false,
            avatarIndex: 0,
            filterName: '',
            savedTableDisplayConfig: [], // cấu hình hiển thị của table đã được lưu trong db
            showSearchBox: true,
            loadingRefresh: false, // có đang chạy refresh dữ liệu hay ko
            totalObject: 0,
            flagGetData: false,
            pageSize: 50,
            agApi: null,
            frameworkComponents: null,
            allRowChecked: [],
            overlayNoRowsTemplate: null,
            actionPanel: false, // có hiển thị action pannel (create, detail, edit) hay không
            page: 1, // trang hiện tại
            gridOptions: null,
            defaultColDef: null,
            arrContextMenu: [],
            selectedContextItem: null,
            getContextMenuItems(param) {
                self.paramOnContextMenu = param;
                return self.tmpTableContextMenu;
            },
            searchKey: '',

            MedalCellRenderer() {},
            totalObjectOnTree: 0,
            cellAboutSelecting: {}, // cell có nguy cơ được lựa chọn, được set mỗi khi chuột hover qua
            tableDisplayConfig: {
                show: false, // có hiển thị panel cấu hình ko
                width: 350, // Chiều rộng của panel cấu hình
                value: {
                    wrapTextMode: 1,
                    densityMode: 2,
                    alwaysShowSidebar: false
                },
                dragOptions: {
                    animation: 200,
                    group: 'display-column-drag',
                    disabled: false,
                    ghostClass: 'ghost-item'
                },
                drag: false
            },
            hasColumnsChecked: false,
            selectingParams: null,
            treeData: [],
            treePageValue: 1,
            treePageSizeValue: 300,
            mapTreeToRowData: {},
            filteredColumns: {}, // tên các cột đã có filter, dạng {tên cột : true},
            tableFilter: {
                // cấu hình filter của danh sách này
                allColumn: {
                    // cấu hình filter của tất cả các cột trong bảng này dạng {tên cột : cấu hình filter}
                },
                currentColumn: {
                    colFilter: getDefaultFilterConfig(),
                    name: ''
                }
            },
            treeColumnConfig: [],
            availableTreeArray: [],
            columnDefs: [],
            rowData: [],
            rowSelected: [],
            rowDataForTree: [],
            confirmDeleteInfo: {
                title: '',
                content: '',
                cancel() {},
                confirm() {},
                show: false
            },
            schedulerConfig: {
                conditionalFormat: [],
                treeView: '',
                fieldCards: [],
                treeView: {
                    tableType: 'flat',
                    selectedTree: '',
                    treeData: []
                },
                sharedConditionalFormat: []
            },
            showGroupScheduler: false,
            hasData: false,
            timeGetData: 0,
            hideNotFoundScreen: false,
            listFilterKanbans: [],
            filterKanban: {},
            selectedFilterNameOfShowList: '',
            selectedFilterNameOfKanban: '',
            isGetDefaultFilterKanban: true,
            selectedFilterNameOfScheduler: '',
            listFilterSchedulers: [],
            isGetDefaultFilterScheduler: true,
            filterScheduler: {},
            instanceKey: Date.now(),
            menuBarViewMode: 0,
            // autoCompleteWidth:self.autoCompleteWidth,
            listMenuBtn: [
                {
                    tooltipIf: ``,
                    iconStyle: ``,
                    icon: () => {
                        return 'mdi-plus';
                    },
                    nameStyle: ``,
                    name: () => {
                        return self.$t('common.add');
                    },
                    if: () => {
                        return !self.isShowListDocument
                            ? self.checkHasPermission('create')
                            : self.checkShowCreateInDocument();
                    },
                    style: ``,
                    show: () => {
                        return (
                            self.showButtonAdd &&
                            !self.actionPanel &&
                            !self.dialogMode
                        );
                    },
                    disabled: () => {
                        return self.loadingRefresh || self.disableButtonAdd;
                    },
                    callback: self.addItem,
                    menuShow: () => {
                        return self.showButtonAdd;
                    },
                    isShowInMenu: false
                },
                {
                    tooltipIf: ``,
                    iconStyle: ``,
                    icon: () => {
                        return 'mdi-refresh';
                    },
                    nameStyle: ``,
                    name: () => {
                        return self.$t('common.refresh');
                    },
                    if: () => {
                        return !self.isCompactMode && !self.dialogMode;
                    },
                    style: ``,
                    show: () => {
                        return !self.actionPanel;
                    },
                    disabled: () => {
                        return self.loadingRefresh;
                    },
                    callback: self.refreshList,
                    loading: 'loadingRefresh',
                    menuShow: () => {
                        return !self.isCompactMode;
                    },
                    isShowInMenu: false
                },
                {
                    tooltipIf: ``,
                    iconStyle: `color: isExporting ? 'white!important' : ''`,
                    icon: () => {
                        return `mdi-microsoft-excel`;
                    },
                    nameStyle: `
                         {color: isExporting ? 'white' : '' }`,
                    name: () => {
                        return self.$t('common.export_excel');
                    },
                    if: () => {
                        return (
                            !self.isCompactMode &&
                            self.showExportButton &&
                            !self.useShortHeader &&
                            !self.dialogMode &&
                            self.isViewShowList
                        );
                    },
                    style: `{
                                backgroundColor: isExporting ? '#F98E00!important' : ''
                            }`,
                    show: () => {
                        return !self.actionPanel;
                    },
                    disabled: () => {
                        return !self.hasData;
                    },
                    callback: self.exportExcel,
                    menuShow: () => {
                        return !self.isCompactMode && self.showExportButton;
                    },
                    isShowInMenu: false
                },
                {
                    tooltipIf:
                        self.showActionPanelInDisplayConfig &&
                        !self.actionPanel &&
                        self.isViewShowList,
                    iconStyle: ``,
                    icon: () => {
                        return self.alwaysShowActionPanel
                            ? 'mdi-flip-horizontal'
                            : 'mdi-format-list-checkbox';
                    },

                    nameStyle: ``,
                    name: () => {
                        return self.alwaysShowActionPanel
                            ? self.$t('common.not_always_show_sidebar')
                            : self.$t('common.always_show_sidebar');
                    },

                    if: () => {
                        return (
                            self.showActionPanelInDisplayConfig &&
                            !self.actionPanel &&
                            !self.useShortHeader &&
                            self.isViewShowList
                        );
                    },
                    style: ``,
                    show: () => {
                        return true;
                    },
                    disabled: () => {
                        return self.disableAction;
                    },
                    callback: self.changeAlwayShowSBSState,
                    menuShow: () => {
                        return self.showActionPanelInDisplayConfig;
                    },
                    isShowInMenu: false
                },
                {
                    tooltipIf: ``,
                    icon: () => {
                        return `mdi-database-import`;
                    },
                    iconStyle: ``,
                    nameStyle: ``,
                    name: () => {
                        return self.$t('common.import_excel');
                    },
                    if: () => {
                        return (
                            self.showImportButton &&
                            !self.dialogMode &&
                            self.checkHasPermission('import')
                        );
                    },
                    style: ``,
                    show: () => {
                        return !self.actionPanel;
                    },
                    disabled: () => {
                        return false;
                    },
                    callback: self.importExcel,
                    menuShow: () => {
                        return self.showImportButton;
                    },
                    isShowInMenu: false
                },
                {
                    tooltipIf: ``,
                    iconStyle: ``,
                    icon: () => {
                        return `mdi-database-import`;
                    },
                    nameStyle: ``,
                    name: () => {
                        return self.$t('common.import_excel_history');
                    },
                    if: () => {
                        return (
                            self.showImportHistoryBtn &&
                            !self.dialogMode &&
                            !self.useShortHeader
                        );
                    },
                    style: ``,
                    show: () => {
                        return !self.actionPanel;
                    },
                    disabled: () => {
                        return false;
                    },
                    callback: self.showImportHistory,
                    menuShow: () => {
                        return self.showImportHistoryBtn;
                    },
                    isShowInMenu: false
                },

                {
                    tooltipIf: !self.actionPanel,
                    iconStyle: ``,
                    nameStyle: ``,
                    icon: () => {
                        return `mdi-table-cog`;
                    },
                    name: () => {
                        return self.$t('common.setting');
                    },
                    if: () => {
                        return !self.dialogMode && self.showDisplayConfig;
                    },
                    style: ``,
                    show: () => {
                        return true;
                    },
                    disabled: () => {
                        return self.disableAction;
                    },
                    callback: self.openTableDisplayConfigPanel,
                    menuShow: () => {
                        return true;
                    },
                    isShowInMenu: false
                }
            ],
            viewModeScheduler: ''
        };
    },
    components: {
        AgGridVue,
        Pagination,
        SymperDialogConfirm,
        DisplayConfig,
        'add-filter': AddFilter,
        ListItemConfigFilterSideBar,
        'config-filter': ConfigFilter,
        'symper-drag-panel': SymperDragPanel,
        VNavigationDrawer,
        VDialog,
        TableFilter,
        CheckBoxRenderer,
        CheckBoxRendererListItems,
        TreeGroupListItems,
        LightBox,
        VueResizable,
        HeaderForm,
        SidebarConfigScheduler,
        NotFoundScreen,
        KanbanEndUserConfig
    },
    beforeMount() {
        this.defaultColDef = {
            minWidth: 40,
            filter: true,
            suppressMenu: true,
            sortable: true,
            resizable: true,
            wrapText: true,
            autoHeight: true,
            headerComponentParams: {
                filteredColumns: this.filteredColumns
            },
            menuTabs: ['generalMenuTab', 'columnsMenuTab']
        };
        let self = this;
        (this.gridOptions = {
            suppressPropertyNamesCheck: true,
            enableRangeSelection: true,
            getRowStyle: function (params) {
                if (self.conditionForRowStyle) {
                    let style = {};
                    for (let cond of self.conditionForRowStyle) {
                        if (cond.displayMode.type == 'singleColor') {
                            style = Object.assign(
                                style,
                                self.getStyleForSingleColor(cond, params)
                            );
                        } else {
                            style = Object.assign(
                                style,
                                self.getStyleForColorScale(cond, params)
                            );
                        }
                    }
                    return style;
                }
            },
            suppressCopyRowsToClipboard: true,
            rowSelection: 'multiple',
            columnTypes: {
                numeric: {},
                text: {},
                date: {},
                datetime: {}
            },
            overlayLoadingTemplate: this.$t('common.loading'),
            applyColumnDefOrder: true
        }),
            (this.frameworkComponents = {
                agColumnHeader: CustomHeaderVue,
                CheckBoxRendererListitems: CheckBoxRendererListItems
            });
        this.setoverlayNoRowsTemplate();
    },
    methods: {
        saveFail() {
            this.$refs.headerForm.loading = false;
        },
        numberBtnSatisfyCondition() {
            let satisfyShowBtn = [];
            let defaultBtn = this.listMenuBtn;

            for (let i = 0; i < defaultBtn.length; i++) {
                if (
                    defaultBtn[i].if() == true &&
                    defaultBtn[i].show() == true
                ) {
                    satisfyShowBtn.push(i);
                }
            }
            return satisfyShowBtn;
        },
        calcBtnShow() {
            let showBtnNumber = 0;
            let btnSatisfy = this.numberBtnSatisfyCondition();
            if (
                this.menuContainerWidth &&
                this.menuBarViewMode == 'auto-mode'
            ) {
                let btnConteinerWidth =
                    this.menuContainerWidth - (500 + this.autoCompleteWidth);
                if (btnConteinerWidth <= 50) {
                    btnSatisfy.forEach((btn) => {
                        this.listMenuBtn[btn].isShowInMenu = true;
                    });
                } else {
                    this.listMenuBtn.forEach((btn) => {
                        btn.isShowInMenu = false;
                    });
                    showBtnNumber = Math.floor(btnConteinerWidth / 58);
                    for (
                        let i = showBtnNumber;
                        i < this.listMenuBtn.length;
                        i++
                    ) {
                        this.listMenuBtn[i].isShowInMenu = true;
                    }
                }
            }
            if (this.menuBarViewMode == 'full-mode') {
                this.listMenuBtn.forEach((btn) => {
                    btn.isShowInMenu = false;
                });
            }
            if (
                this.menuBarViewMode == 'short-mode' ||
                this.menuBarViewMode == 'tiny-mode'
            ) {
                this.listMenuBtn.forEach((btn) => {
                    btn.isShowInMenu = true;
                });
            }
        },
        handleGetDataForChangeTypeView() {
            this.needGetDataForShowlist = !this.isViewShowList;
            this.needGetDataForKanban = !this.isViewKanban;
            this.needGetDataForScheduler = !this.isViewScheduler;
            if (this.isViewShowList) {
                this.getData();
            } else if (this.isViewKanban) {
                this.$evtBus.$emit(
                    'showlist-update-report',
                    this.instanceKey,
                    'kanban'
                );
            } else if (this.isViewScheduler) {
                this.$evtBus.$emit(
                    'showlist-update-report',
                    this.instanceKey,
                    'scheduler'
                );
            }
        },

        // thay đổi cơ chế sinh ra sharedConfig của filterConfig, thay vì watch, lúc này sẽ gọi hàm khi thay đổi
        translateTableFilterConfigs() {
            let allColumn = {};
            let computedSelfFilterConfig = [];
            let mixApplyFilter = this.applyedFilter.userFilter.concat(
                this.applyedFilter.sharedFilter
            );
            let listAllFilter = this.listFilters.concat(this.listSharedFilter);
            // khi có filter nào đó được áp dụng
            if (mixApplyFilter.some((a) => a)) {
                // lặp qua mixapplyFilter
                mixApplyFilter.map((status, idx) => {
                    // nếu nó được áp dụng
                    if (status) {
                        this.calculateColumnConfig(
                            listAllFilter[idx],
                            allColumn
                        );
                        this.calculateComputedSelfFilterConfig(
                            listAllFilter[idx],
                            computedSelfFilterConfig
                        );
                    }
                });
            }
            this.tableFilter.allColumn = allColumn;
            this.tableFilter.computedSelfFilterConfig =
                computedSelfFilterConfig;
            this.translateFilterConfig();
        },
        calculateColumnConfig(config, allColumn) {
            Object.keys(config.columns).map((col) => {
                //nếu allColumn chưa có trường col
                if (!allColumn.hasOwnProperty(col)) {
                    allColumn[col] = config.columns[col];
                } else {
                    let columnConfig = {
                        searchKey: '',
                        agg: allColumn[col].agg,
                        dataType: allColumn[col].dataType,
                        conditionFilter: {
                            conjunction: 'or',
                            items: []
                        },
                        clickedSelectAll:
                            this.handlerCalculateBooleanFieldForMixFilter(
                                config.columns[col].clickedSelectAll,
                                allColumn[col].clickedSelectAll,
                                true
                            ),
                        sort: this.handlerCalculateFieldForMixFilter(
                            config.columns[col].sort,
                            allColumn[col].sort,
                            ''
                        ),
                        selectAll: this.handlerCalculateFieldForMixFilter(
                            config.columns[col].selectAll,
                            allColumn[col].selectAll,
                            false
                        ),
                        total: this.handlerCalculateFieldForMixFilter(
                            config.columns[col].total,
                            allColumn[col].total,
                            0
                        ),
                        valuesIn: this.handlerCombineObjectFieldForMixFilter(
                            config.columns[col].valuesIn,
                            allColumn[col].valuesIn
                        ),
                        valuesNotIn: this.handlerCombineObjectFieldForMixFilter(
                            config.columns[col].valuesNotIn,
                            allColumn[col].valuesNotIn
                        )
                    };
                    let hasConditional = [
                        ...allColumn[col].conditionFilter.items,
                        ...config.columns[col].conditionFilter.items
                    ].filter((item) => item.type != 'none');
                    if (hasConditional.length == 0) {
                        hasConditional = [
                            { type: 'none', value: '' },
                            { type: 'none', value: '' }
                        ];
                    } else if (hasConditional.length == 1)
                        hasConditional.push({
                            type: 'none',
                            value: ''
                        });
                    columnConfig.conditionFilter.items = hasConditional;
                    allColumn[col] = columnConfig;
                }
            });
        },
        handlerCalculateFieldForMixFilter(
            filterValue,
            columnConfigValue,
            defaultValue
        ) {
            return filterValue == columnConfigValue
                ? columnConfigValue
                : defaultValue;
        },
        handlerCombineObjectFieldForMixFilter(filterValue, columnConfigValue) {
            let valueObject = {};
            Object.keys(filterValue).map((val) => {
                if (filterValue[val]) {
                    valueObject[val] = true;
                }
            });
            Object.keys(columnConfigValue).map((val) => {
                if (columnConfigValue[val]) {
                    valueObject[val] = true;
                }
            });
            return valueObject;
        },
        handlerCalculateBooleanFieldForMixFilter(
            filterValue,
            configValue,
            isAndConjunction
        ) {
            if (isAndConjunction) {
                return filterValue && configValue;
            }
            return filterValue || configValue;
        },
        calculateComputedSelfFilterConfig(config, computedSelfFilterConfig) {
            if (config.computedSelfFilterConfig) {
                config.computedSelfFilterConfig.map(
                    (colComputed, idxComputed) => {
                        if (!computedSelfFilterConfig[idxComputed]) {
                            computedSelfFilterConfig[idxComputed] = colComputed;
                        } else {
                            let computedConfig = {
                                text: '',
                                display: true,
                                col: colComputed.col,
                                config: {
                                    conditionFilter: {
                                        conjunction: 'or',
                                        items: []
                                    },
                                    dataType: colComputed.config.dataType,
                                    dataset: colComputed.config.dataset,
                                    searchKey: '',
                                    searchLocal: false,
                                    sort: '',
                                    total: colComputed.config.total,
                                    selectAll:
                                        this.handlerCalculateBooleanFieldForMixFilter(
                                            colComputed.config.selectAll,
                                            computedSelfFilterConfig[
                                                idxComputed
                                            ].config.selectAll,
                                            true
                                        ),
                                    clickedSelectAll:
                                        this.handlerCalculateBooleanFieldForMixFilter(
                                            colComputed.config.clickedSelectAll,
                                            computedSelfFilterConfig[
                                                idxComputed
                                            ].config.clickedSelectAll,
                                            true
                                        ),
                                    valuesIn:
                                        this.handlerCombineObjectFieldForMixFilter(
                                            colComputed.config.valuesIn,
                                            computedSelfFilterConfig[
                                                idxComputed
                                            ].config.valuesIn
                                        ),
                                    valuesNotIn:
                                        this.handlerCombineObjectFieldForMixFilter(
                                            colComputed.config.valuesNotIn,
                                            computedSelfFilterConfig[
                                                idxComputed
                                            ].config.valuesNotIn
                                        )
                                }
                            };
                            let hasConditional = [
                                ...colComputed.config.conditionFilter.items,
                                ...computedSelfFilterConfig[idxComputed].config
                                    .conditionFilter.items
                            ].filter((item) => item.type != 'none');
                            if (hasConditional.length == 0) {
                                hasConditional = [
                                    { type: 'none', value: '' },
                                    { type: 'none', value: '' }
                                ];
                            } else if (hasConditional.length == 1)
                                hasConditional.push({
                                    type: 'none',
                                    value: ''
                                });
                            computedConfig.config.conditionFilter.items =
                                hasConditional;
                            let fullOptions = util.cloneDeep(
                                colComputed.config.fullOptions
                            );
                            computedSelfFilterConfig[
                                idxComputed
                            ].config.fullOptions.map((option, idxOption) => {
                                if (fullOptions[idxOption]) {
                                    fullOptions[idxOption].checked =
                                        fullOptions[idxOption].checked ||
                                        option.checked;
                                } else {
                                    fullOptions[idxOption] = option;
                                }
                            });
                            computedConfig.config.fullOptions = fullOptions;
                            computedConfig.config.selectItems = fullOptions;
                            computedSelfFilterConfig[idxComputed] =
                                computedConfig;
                            if (fullOptions.length >= 300) {
                                computedConfig.config.searchLocal = false;
                            }
                        }
                    }
                );
            }
        },
        //lấy các trường về user để phục vụ lọc kanban và scheduler, vì, ở kanban và scheduler, các trường user cần lấy id chứ không phải tên
        async getUserField() {
            let allControlRes = await documentApi.getAllControl(this.idDoc);
            this.userColumnControl = allControlRes.data
                .filter((col) => {
                    return col.type == 'user';
                })
                .map((a) => {
                    return a.name;
                });
            this.userColumnControl = this.userColumnControl.concat([
                'document_object_user_created_id',
                'document_object_last_user_update_id'
            ]);
        },
        // sinh ra reportConfig cho Kanban và scheduler, sau đó lưu lên store.
        translateFilterConfig() {
            let filterConfig = {
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
                        cols: { ...this.tableFilter.allColumn },
                        applied: false,
                        opening: []
                    },
                    searchKey: ''
                },
                viewConfigs: {
                    displayOptions: {}
                }
            };
            if (
                this.tableFilter.computedSelfFilterConfig &&
                this.tableFilter.computedSelfFilterConfig.length > 0
            ) {
                filterConfig.sharedConfigs.computedSelfFilterConfig =
                    this.tableFilter.computedSelfFilterConfig;
            }
            this.$store.commit('document/setFilterConfig', filterConfig);
            Object.keys(this.filteredColumns).map((col) => {
                this.filteredColumns[col] = false;
            });
            Object.keys(this.tableFilter.allColumn).map((col) => {
                this.filteredColumns[col] = true;
            });
        },
        saveUpdateConditionalFormat(data) {
            if (this.isViewShowList) {
                if (this.listSelectedCondition.includes(data.key))
                    this.listSelectedCondition.push(
                        this.listSelectedCondition.splice(
                            this.listSelectedCondition.indexOf(data.key),
                            1
                        )[0]
                    );
                else this.listSelectedCondition.push(data.key);
                this.applyAndSortConditionalFormat(
                    this.listSelectedCondition,
                    this.conditionalFormat.indexOf(data),
                    this.conditionalFormat,
                    this.listSharedConditionalFormat
                );
            } else if (this.isViewScheduler) {
                if (this.listSelectedConditionScheduler.includes(data.key))
                    this.listSelectedConditionScheduler.push(
                        this.listSelectedConditionScheduler.splice(
                            this.listSelectedConditionScheduler.indexOf(
                                data.key
                            ),
                            1
                        )[0]
                    );
                else this.listSelectedConditionScheduler.push(data.key);
                this.applyAndSortConditionalFormat(
                    this.listSelectedConditionScheduler,
                    this.schedulerConfig.conditionalFormat.indexOf(data),
                    this.schedulerConfig.conditionalFormat,
                    this.schedulerConfig.sharedConditionalFormat
                );
            } else if (this.isViewKanban) {
                if (this.listSelectedConditionKanban.includes(data.key))
                    this.listSelectedConditionKanban.push(
                        this.listSelectedConditionKanban.splice(
                            this.listSelectedConditionKanban.indexOf(data.key),
                            1
                        )[0]
                    );
                else this.listSelectedConditionKanban.push(data.key);
                this.applyAndSortConditionalFormat(
                    this.listSelectedConditionKanban,
                    this.kanbanConfig.conditionalFormat.indexOf(data),
                    this.kanbanConfig.conditionalFormat,
                    this.kanbanConfig.sharedConditionalFormat
                );
            }
            this.changeAllConditionalFormat();
            if (this.isViewShowList) {
                this.handleChangeCondition();
            }
            this.saveConditionalFormatting();
        },
        checkSharePermission() {
            let userInfo = util.auth.getSavedUserInfo();
            let userType = userInfo.profile.type;
            if (userType == 'ba') {
                this.shareTreeConfig = true;
                this.shareFilter = true;
                this.shareConditionalFormat = true;
            } else {
                let objectTypePermission =
                    this.$store.state.app.userOperations[
                        this.commonActionProps.resource
                    ];
                this.shareTreeConfig = this.sharePermission(
                    'share_tree_config',
                    objectTypePermission
                );
                this.shareFilter = this.sharePermission(
                    'share_filter',
                    objectTypePermission
                );
                this.shareConditionalFormat = this.sharePermission(
                    'share_conditonal_format',
                    objectTypePermission
                );
            }
        },
        //method được gọi khi thêm 1 bộ lọc
        addCustomFilter(data) {
            let allCols = {};
            let cols = util.cloneDeep(data.sharedConfigs.selfFilter.cols);
            let allUsers = this.$store.state.app.allUsers;
            Object.keys(cols).map((colName) => {
                if (!this.userColumnControl.includes(cols[colName].agg)) {
                    allCols[cols[colName].agg] = cols[colName];
                } else {
                    let valuesIn = {};
                    Object.keys(cols[colName].valuesIn).map((id) => {
                        let userName;
                        let user = allUsers.find((data) => {
                            return data.id == id;
                        });
                        if (user) {
                            userName = user.displayName;
                        } else {
                            userName = id;
                        }
                        valuesIn[userName] = true;
                    });
                    allCols[cols[colName].agg] = cols[colName];
                    allCols[cols[colName].agg].valuesIn = valuesIn;
                }
            });
            /*cần thêm 1 trường là uniqueId, để mỗi bộ lọc là duy nhất, hỗ trợ việc set mặc định nhiều bộ lọc
            không thể đặt mặc định dựa trên isDefault vì không thể can thiệp được vào bộ lọc được chia sẻ

            */
            let computedSelfFilterConfig = util.cloneDeep(
                data.sharedConfigs.computedSelfFilterConfig
            );
            computedSelfFilterConfig.map((col) => {
                if (Object.keys(allCols).some((a) => a == col.col.agg)) {
                    let fullOptions = col.config.fullOptions;
                    let selectItems = col.config.selectItems;
                    if (col.config.clickedSelectAll) {
                        col.config.selectItems = fullOptions;
                    } else {
                        fullOptions.map((option) => {
                            let item = selectItems.find(
                                (item) => item.value == option.value
                            );
                            if (item) {
                                option.checked = item.checked;
                            } else {
                                option.checked = false;
                            }
                        });
                        col.config.selectItems = fullOptions;
                    }
                } else {
                    col.config.fullOptions = [];
                    col.config.selectItems = [];
                }
            });
            let customFilter;
            //check nếu là thêm 1 filter
            if (data.idx == this.listFilters.length) {
                customFilter = {
                    uniqueId:
                        this.$store.state.app.endUserInfo.id +
                        data.name +
                        Date.now(),
                    name: data.name,
                    columns: allCols,
                    isShare: false,
                    computedSelfFilterConfig: computedSelfFilterConfig,
                    isDefault: false,
                    treeViewFilter: this.treeViewFilter
                };
                this.$snotifySuccess(this.$t('v2.showlist.addFilterSuccess'));
            } else {
                //đây là trường hợp edit
                customFilter = {
                    uniqueId: this.listFilters[data.idx].uniqueId,
                    name: data.name,
                    columns: allCols,
                    computedSelfFilterConfig: computedSelfFilterConfig,
                    isDefault: false,
                    treeViewFilter: this.treeViewFilter
                };
                this.$snotifySuccess(this.$t('v2.showlist.editFilterSuccess'));
            }
            this.listFilters[data.idx] = customFilter;
            // this.applyedFilter = applyedFilter;
            this.saveUiConfig();
        },
        //apply filter, nhận 1 object chứa userFilter và sharedFilter, là các idx, được gửi từ listItemFilterSideBar
        applyConfigFilter(applyedFilter) {
            this.applyedFilter = util.cloneDeep(applyedFilter);
            this.translateTableFilterConfigs();
            if (this.showConfigFilter) {
                this.$refs.configfilter.createDataFilter();
            }
            this.handleGetDataForChangeTypeView();
        },
        closeFilterConfig() {
            this.showConfigFilter = false;
        },
        //áp dụng lọc nhanh
        applyColumnFilter(config) {
            let allCols = {};
            let cols = util.cloneDeep(config.sharedConfigs.selfFilter.cols);
            let allUsers = this.$store.state.app.allUsers;
            Object.keys(cols).map((colName) => {
                if (!this.userColumnControl.includes(cols[colName].agg)) {
                    allCols[cols[colName].agg] = cols[colName];
                } else {
                    let valuesIn = {};
                    Object.keys(cols[colName].valuesIn).map((id) => {
                        let userName;
                        let user = allUsers.find((data) => {
                            return data.id == id;
                        });
                        if (user) {
                            userName = user.displayName;
                        } else {
                            userName = id;
                        }
                        valuesIn[userName] = true;
                    });
                    allCols[cols[colName].agg] = cols[colName];
                    allCols[cols[colName].agg].valuesIn = valuesIn;
                }
            });
            let computedSelfFilterConfig = util.cloneDeep(
                config.sharedConfigs.computedSelfFilterConfig
                    ? config.sharedConfigs.computedSelfFilterConfig
                    : []
            );
            computedSelfFilterConfig.map((col, idx) => {
                let selectItemValue = {};
                col.config.selectItems.map((a) => {
                    selectItemValue[a.value] = a.checked;
                });
                col.config.fullOptions.map((item) => {
                    item.checked = false;
                    if (Object.keys(selectItemValue).includes(item.value)) {
                        item.checked = selectItemValue[item.value];
                    }
                });
                col.config.selectItems = col.config.fullOptions;
            });

            this.tableFilter.computedSelfFilterConfig =
                computedSelfFilterConfig;
            //config.sharedConfigs.computedSelfFilterConfig;
            this.tableFilter.allColumn = allCols;
            this.$store.commit('document/setFilterConfig', config);
            this.translateFilterConfig();
            this.handleGetDataForChangeTypeView();
        },
        sharePermission(action, objectTypePermission) {
            let hasPermission = false;
            if (!util.auth.isSupportter()) {
                hasPermission =
                    objectTypePermission &&
                    objectTypePermission[
                        this.commonActionProps.parentId + ':0'
                    ] &&
                    objectTypePermission[
                        this.commonActionProps.parentId + ':0'
                    ][action];
            }
            return hasPermission;
        },
        setTabView(index) {
            const self = this;
            if (this.tabView != index) {
                this.tabView = index;
                setTimeout(() => self.saveUiConfig(), 1000);
            }
        },
        clearFilterByTreeConfig() {
            for (let key in this.tableFilter.allColumn) {
                if (this.tableFilter.allColumn[key].addedByTree) {
                    delete this.tableFilter.allColumn[key];
                }
            }
        },
        setoverlayNoRowsTemplate(
            content = this.$t('v2.showlist.noData'),
            sign = 'warning'
        ) {
            let mapSignStyle = {
                info: '',
                warning: 'background: lightgoldenrodyellow;',
                error: 'background-color: #ffd7d7;'
            };
            var htmlNotFoundScreen = this.$refs.notFoundScreen;
            if (htmlNotFoundScreen) {
                htmlNotFoundScreen = htmlNotFoundScreen.$el.outerHTML;
                htmlNotFoundScreen = htmlNotFoundScreen.replace(
                    'display: none !important;',
                    ''
                );
                this.overlayNoRowsTemplate = `<span>${htmlNotFoundScreen}</span>`;
                this.hideNotFoundScreen = true;
                this.agApi.hideOverlay();
                this.agApi.showNoRowsOverlay();
            }
        },
        setPage(p) {
            this.page = p;
            this.$refs.pagination.page = p;
        },
        translateTreeConfigToData(
            key,
            changeKey = true,
            tableFilter = null,
            isFirstCall = false
        ) {
            if (tableFilter == null) {
                tableFilter = {
                    computedSelfFilterConfig: [],
                    allColumn: {},
                    currentColumn: {},
                    allColumnInTable: []
                };
            }
            if (changeKey) {
                this.$set(this, 'treeGroupListItemsKey', Date.now());
            }
            let columnsArr = [];
            let treeConfigs = [];
            let group =
                key && key.split(':').length > 2 ? 'shareTree' : 'treeData';
            if (
                (!this.isViewShowList && this.isViewScheduler) ||
                this.tabView == 2
            ) {
                if (this.schedulerConfig.treeView[group]) {
                    treeConfigs = this.schedulerConfig.treeView[group].filter(
                        function (e) {
                            return e.key == key;
                        }
                    )[0];
                    if (!treeConfigs) {
                        this.showGroupScheduler = false;
                        this.schedulerConfig.treeView.selectedTree = '';
                    }
                } else {
                    this.schedulerConfig.treeView[group] = [];
                }
            } else if (
                (!this.isViewShowList && this.isViewKanban) ||
                this.tabView == 1
            ) {
                if (this.kanbanConfig.treeView[group]) {
                    treeConfigs = this.kanbanConfig.treeView[group].filter(
                        function (e) {
                            return e.key == key;
                        }
                    )[0];
                } else {
                    this.kanbanConfig.treeView[group] = [];
                }
                if (!treeConfigs) {
                    this.showGroupScheduler = false;
                    this.kanbanConfig.treeView.selectedTree = '';
                }
            } else {
                if (!treeConfigs) {
                    this.typeViewConfigs.selectedTree = '';
                    this.includesTreeview = false;
                }
                treeConfigs = this.typeViewConfigs[group].filter(function (e) {
                    return e.key == key;
                })[0];
            }
            this.columnTreeConfig = [];
            if (treeConfigs) {
                for (let i in treeConfigs.children) {
                    if (treeConfigs.children[i].value) {
                        let rowGroupvalue =
                            parseInt(i) < treeConfigs.children.length - 1
                                ? true
                                : false;
                        let obj = {
                            field: treeConfigs.children[i].value,
                            hide: true,
                            rowGroup: rowGroupvalue,
                            cellRendererParams: {
                                suppressDoubleClickExpand: true
                            },
                            type: 'user'
                        };
                        columnsArr.push(treeConfigs.children[i].value);
                        this.columnTreeConfig.push(obj);
                    }
                }
                if (this.columnTreeConfig.length == 1) {
                    // this.columnTreeConfig[0].hide = false;
                    this.columnTreeConfig[0].headerName = treeConfigs.title;
                }
                this.$set(
                    this,
                    'autoGroupField',
                    treeConfigs.children[treeConfigs.children.length - 1].value
                );
                this.$set(this, 'headerNameTable', treeConfigs.title);
                this.getRowDataForTreeConfig(
                    columnsArr,
                    tableFilter,
                    isFirstCall
                );
            }
        },
        closePanelAction() {
            this.actionPanel = false;
            this.$emit('after-close-panel');
        },
        getRowDataForTreeConfig(
            columnsArr,
            tableFilter = null,
            isFirstCall = false
        ) {
            // nếu changeForWatch là false thì không lấy dữ liệu, đến khi lấy được uiconfig thì sẽ set nó thành true trong method 'handlerRestoreTableDisplayConfigRes'
            if (this.changeForWatch) {
                if (tableFilter == null) {
                    tableFilter = {
                        allColumn: {},
                        currentColumn: {},
                        allColumnInTable: []
                    };
                }
                let options = {
                    pageSize: this.treePageSizeValue,
                    getDataMode: 'autocomplete',
                    distinct: false,
                    page: this.treePageValue
                };
                let dataConfig = this.getConfigApiCall(false);
                dataConfig.options = options;
                dataConfig.isTranslateUser = this.isViewShowList ? false : true;
                dataConfig.columns = columnsArr;

                dataConfig.groupBy = columnsArr;
                if (isFirstCall) {
                    Object.keys(this.filteredColumns)
                        .filter((col) => this.filteredColumns[col])
                        .map((col) => {
                            if (columnsArr.indexOf(col) != -1) {
                                tableFilter.allColumn[col] =
                                    this.tableFilter.allColumn[col];
                            }
                        });
                }
                this.treeViewFilter = tableFilter;
                this.listItemsWorker.postMessage({
                    action: 'getDataForTree',
                    data: { dataConfig: dataConfig, tableFilter: tableFilter }
                });
            }
        },

        getSelectedRows() {
            return this.agApi.getSelectedRows();
        },
        setRowChecked() {
            let self = this;
            this.gridOptions.api.forEachNode((node) => {
                let value = self.checkedRows.includes(node.data.id)
                    ? true
                    : false;
                node.setSelected(value);
            });
        },
        /**
         * select lại dòng đã được chọn trước đó nếu có refresh list
         */
        setSelectedRow() {
            let self = this;
            if (this.hasColumnsChecked) {
                this.gridOptions.api.forEachNode((node) => {
                    /**
                     * trường hợp danh sách bản ghi document thì lấy định danh theo document_object_id
                     */
                    if (node.data.document_object_id) {
                        let row = self.rowSelected.find(
                            (el) =>
                                el.document_object_id ==
                                node.data.document_object_id
                        );
                        if (
                            row &&
                            node.data.document_object_id ==
                                row.document_object_id
                        ) {
                        }
                    } else if (node.data.id) {
                        let row = self.rowSelected.find(
                            (el) => el.id == node.data.id
                        );
                        if (row && node.data.id == row.id) {
                            node.setSelected(true);
                        }
                    }
                });
            }
        },
        getRowSelected() {
            return this.rowSelected;
        },
        // lấy ra danh sách cấu hình format được chọn
        getListSelectedConditionFormat() {
            let result = [];
            this.conditionalFormat.map((data, index) => {
                if (data.isSelected) {
                    result.push(data.key);
                }
            });
            return result;
        },
        customBtnClick(i) {
            this.customHeaderBtn[i].callback();
        },

        configFilterAction(data) {
            let self = this;
            let type = data.type;
            switch (type) {
                case 'setDefaultFilter':
                    this.setDefaultFilter(data.filterIdx, data.isUserFilter);
                    break;
                case 'unsetDefaultFilter':
                    this.unsetDefaultFilter(data.filterIdx, data.isUserFilter);
                    break;
                case 'editFilter':
                    // this.editFilter(data.filterIdx);
                    break;
                case 'deleteFilter':
                    this.deleteFilter(data.filterIdx);
                    break;
                case 'shareFilter':
                    self.shareFilterAction(data.filterIdx, data.isUserFilter);
                    break;
                case 'unShareFilter':
                    this.unShareFilterAction(data.filterIdx, data.isUserFilter);
            }
        },
        setSelectedConditional(key, check = true) {
            this.isNotiSuccess = false;
            let data = this.allConditionalFormat;
            data = this.isViewScheduler
                ? this.allConditionalFormatScheduler
                : data;
            data = this.isViewKanban ? this.allConditionalFormatKanban : data;
            data.map((condition, i) => {
                if (condition.key == key) {
                    condition.isSelected = check;
                }
            });
        },
        changeAllConditionalFormat() {
            if (this.isViewShowList) {
                this.allConditionalFormat = this.conditionalFormat.concat(
                    this.listSharedConditionalFormat
                );
            } else if (this.isViewKanban) {
                this.allConditionalFormatKanban =
                    this.kanbanConfig.conditionalFormat.concat(
                        this.kanbanConfig.sharedConditionalFormat
                    );
            } else if (this.isViewScheduler) {
                this.allConditionalFormatScheduler =
                    this.schedulerConfig.conditionalFormat.concat(
                        this.schedulerConfig.sharedConditionalFormat
                    );
            }
        },
        handleChangeCondition() {
            this.gridOptions.columnDefs = this.handleConditionalFormat(
                this.gridOptions.columnDefs
            );
            this.gridOptions.api.redrawRows();
        },
        applyConditionFormat(data) {
            let listSelectedCondition = data.listSelectedCondition,
                index = data.index;
            if (this.isViewShowList) {
                this.applyAndSortConditionalFormat(
                    listSelectedCondition,
                    index,
                    this.conditionalFormat,
                    this.listSharedConditionalFormat
                );
                this.listSelectedCondition = listSelectedCondition;
            } else if (this.isViewScheduler) {
                this.applyAndSortConditionalFormat(
                    listSelectedCondition,
                    index,
                    this.schedulerConfig.conditionalFormat,
                    this.schedulerConfig.sharedConditionalFormat
                );
                this.listSelectedConditionScheduler = listSelectedCondition;
            } else if (this.isViewKanban) {
                this.applyAndSortConditionalFormat(
                    listSelectedCondition,
                    index,
                    this.kanbanConfig.conditionalFormat,
                    this.kanbanConfig.sharedConditionalFormat
                );
                this.listSelectedConditionKanban = listSelectedCondition;
            }
            this.changeAllConditionalFormat();
            if (this.isViewShowList) {
                this.handleChangeCondition();
            }
            this.saveConditionalFormatting();
        },
        applyAndSortConditionalFormat(
            listSelected,
            index,
            conditionalFormat,
            listSharedConditionalFormat
        ) {
            if (
                listSharedConditionalFormat[index] &&
                listSharedConditionalFormat[index].key ==
                    listSelected[listSelected.length - 1]
            ) {
                listSharedConditionalFormat.unshift(
                    listSharedConditionalFormat.splice(index, 1)[0]
                );
            } else if (
                conditionalFormat[index] &&
                conditionalFormat[index].key ==
                    listSelected[listSelected.length - 1]
            ) {
                conditionalFormat.unshift(
                    conditionalFormat.splice(index, 1)[0]
                );
            }
        },
        saveConditionalFormatting() {
            let data = [];
            if (this.isViewScheduler) {
                data = this.allConditionalFormatScheduler;
                this.$store.commit('scheduler/setConditionalFormat', data);
            } else if (this.isViewKanban) {
                data = this.allConditionalFormatKanban;
                this.$store.commit('kanban/setConditionalFormat', data);
            }
            this.$evtBus.$emit('apply-conditional-format', data);
            this.saveUiConfig();
        },
        changeFormat(data) {
            switch (data.type) {
                case 'view':
                    this.editConfigFormat(data.key);
                    break;
                case 'edit':
                    this.editConfigFormat(data.key);
                    break;
                case 'delete':
                    this.deleteConfigFormat(data.index, data.key);
                    this.getData();
                    break;
                case 'disApply':
                    this.disApplyConfigFormat(data.index, data.key);
                    break;
                case 'share':
                    this.shareConfigFormat(data.index, true);
                    break;
                case 'unShare':
                    this.shareConfigFormat(data.index, false);
                    break;
            }
        },
        shareConfigFormat(index, value) {
            this.saveConditionalFormatting();
            this.isNotiSuccess = true;
        },
        disApplyConfigFormat(index, key) {
            let listSelectedCondition = [];
            let list = [];
            if (this.isViewShowList) {
                list = this.listSelectedCondition;
            } else if (this.isViewKanban) {
                list = this.listSelectedConditionKanban;
            } else if (this.isViewScheduler) {
                list = this.listSelectedConditionScheduler;
            }
            list.map((data) => {
                if (data != key) {
                    listSelectedCondition.push(data);
                } else {
                    this.setSelectedConditional(data, false);
                }
            });
            if (this.isViewShowList) {
                this.listSelectedCondition = listSelectedCondition;
            } else if (this.isViewKanban) {
                this.listSelectedConditionKanban = listSelectedCondition;
            } else if (this.isViewScheduler) {
                this.listSelectedConditionScheduler = listSelectedCondition;
            }
            this.handleChangeCondition();
            this.saveConditionalFormatting();
        },
        getStyleForCell(dataFormat, col, e) {
            var style = {};
            for (let key in dataFormat) {
                let format = dataFormat[key];
                if (format.displayMode.type == 'singleColor') {
                    let data = this.getStyleForSingleColor(format, e);
                    style = data == null ? style : data;
                } else {
                    var style = this.getStyleForColorScale(format, e);
                }
            }
            return style;
        },
        getStyleForSingleColor(dataFormat, e) {
            let data = util.cloneDeep(dataFormat);
            var row = e.data;
            let conditionalFormat =
                treeConditionToJSString.treeItemToJSCondition(
                    data.displayMode.singleColor.originCondition,
                    'field'
                );
            if (eval(conditionalFormat)) {
                let format = {
                    color: dataFormat.displayMode.singleColor.fontColor,
                    backgroundColor:
                        dataFormat.displayMode.singleColor.backgroundColor
                };
                if (dataFormat.displayMode.singleColor.underline)
                    format['text-decoration'] = 'underline';
                if (dataFormat.displayMode.singleColor.bold)
                    format['font-weight'] = 'bold';
                if (dataFormat.displayMode.singleColor.italic)
                    format['font-style'] = 'italic';
                return format;
            } else return null;
        },

        getStyleForColorScale(dataFormat, e) {
            let field = dataFormat.displayMode.colorScale.applyColumn.field;
            let configColor = dataFormat.displayMode.colorScale.config;
            let valueTable = e.data[field];
            const minValue = configColor[0].value;
            const maxValue = configColor[2].value;
            const midValue = configColor[1].value;
            const minColor = configColor[0].color;
            const maxColor = configColor[2].color;
            const midPoint = maxValue - minValue + 1;
            const colorGradient = new Gradient();
            let listColor = [];
            if (midValue) {
                listColor = colorGradient
                    .setGradient(minColor, configColor[1].color, maxColor)
                    .setMidpoint(midPoint)
                    .getArray();
            } else {
                listColor = colorGradient
                    .setGradient(minColor, maxColor)
                    .setMidpoint(midPoint)
                    .getArray();
            }
            let distance = valueTable - minValue; // tính khoảng cách giá trị so với phần tử đầu
            return { backgroundColor: listColor[distance] };
        },
        // xử lý format màu trong table
        handleConditionalFormat(data) {
            const self = this;
            let tmpCol = null;
            let conditionForRowStyle = [];
            let mapColumnToConditionalFormatItems = [];
            let length = self.allConditionalFormat.length;
            for (let key = length - 1; key >= 0; key--) {
                let item = self.allConditionalFormat[key];
                if (item.isSelected) {
                    //Nếu áp dụng cho toàn bộ column trong row
                    if (item.tableColumns[0].isSelected) {
                        conditionForRowStyle.push(item);
                    } else {
                        for (let i = 1; i < item.tableColumns.length; i++) {
                            tmpCol = item.tableColumns[i];
                            if (tmpCol.isSelected) {
                                if (
                                    !mapColumnToConditionalFormatItems[
                                        tmpCol.field
                                    ]
                                ) {
                                    mapColumnToConditionalFormatItems[
                                        tmpCol.field
                                    ] = [];
                                }
                                mapColumnToConditionalFormatItems[
                                    tmpCol.field
                                ].push(item);
                            }
                        }
                    }
                }
            }
            this.conditionForRowStyle = conditionForRowStyle;
            this.dataFormat = mapColumnToConditionalFormatItems;
            return data;
        },
        editConfigFormat(index) {
            this.conditionIndex = index;
        },
        deleteConfigFormat(index, key) {
            let self = this;
            let conditionalFomart = this.conditionalFormat;
            conditionalFomart = this.isViewScheduler
                ? this.schedulerConfig.conditionalFormat
                : conditionalFomart;
            conditionalFomart = this.isViewKanban
                ? this.kanbanConfig.conditionalFormat
                : conditionalFomart;
            this.confirmDeleteInfo.show = true;
            this.confirmDeleteInfo.title = this.$t(
                'common.remove_confirm_title'
            );
            this.confirmDeleteInfo.content =
                this.$t('v2.showlist.deleteConditionalFormatConfirmBegin') +
                conditionalFomart[index].nameGroup +
                this.$t('v2.showlist.deleteConditionalFormatConfirmEnd');
            this.confirmDeleteInfo.confirm = () => {
                self.conditionIndex = index;
                self.confirmDeleteInfo.show = false;
                if (self.isViewShowList) {
                    self.conditionalFormat = self.conditionalFormat.filter(
                        (c, i) => i != self.conditionIndex
                    );
                    self.saveConditionalFormatting(self.conditionalFormat);
                    self.getData();
                } else if (this.isViewScheduler) {
                    self.schedulerConfig.conditionalFormat =
                        self.schedulerConfig.conditionalFormat.filter(
                            (c, i) => i != self.conditionIndex
                        );
                } else if (this.isViewKanban) {
                    self.kanbanConfig.conditionalFormat =
                        self.kanbanConfig.conditionalFormat.filter(
                            (c, i) => i != self.conditionIndex
                        );
                }
                self.disApplyConfigFormat(self.conditionIndex, key);
                setTimeout(() => {
                    self.saveUiConfig();
                }, 500);
            };
            this.confirmDeleteInfo.cancel = () => {
                self.confirmDeleteInfo.show = false;
            };
        },
        closeBtnAndRefreshFilter() {
            if (!this.isViewShowList) {
                if (this.isViewKanban) {
                    if (
                        JSON.stringify(this.filterKanban) != '{}' ||
                        this.selectedFilterName != ''
                    ) {
                        this.filterKanban = {};
                        this.$evtBus.$emit(
                            'config-filter-kanban',
                            this.filterKanban
                        );
                    }
                } else if (this.isViewScheduler) {
                    if (
                        JSON.stringify(this.filterScheduler) != '{}' ||
                        this.selectedFilterName != ''
                    ) {
                        this.filterScheduler = {};
                        this.$evtBus.$emit('config-filter-scheduler', {
                            filter: this.filterScheduler
                        });
                    }
                }
            }
            this.filterName = '';
            this.selectedFilterName = '';
            this.closeBtnFilter = false;
            this.isClose = false;
            this.searchValue = '';
            this.filteredColumns = {};
            this.defaultColDef.headerComponentParams.filteredColumns = {};
            this.searchKey = '';
            if (this.isViewShowList) {
                this.selectedFilterNameOfShowList = '';
            } else if (this.isViewKanban) {
                this.selectedFilterNameOfKanban = '';
            } else if (this.isViewScheduler) {
                this.selectedFilterNameOfScheduler = '';
            }

            //set lại trạng thái không filter
            if (this.isViewShowList) {
                this.tableFilter.allColumn = {};
                this.treeViewFilter.allColumn = {};
                this.needRerenderTreeView = true;
                this.getData();
            }
            this.filterIdx = -1;
        },
        // xử lý gán tất cả các biến trước khi gửi data
        saveUiConfig() {
            if (!this.useCustomUiConfig) {
                return;
            }
            let tableConfig = this.getTableDisplayConfigData();
            let data = JSON.parse(tableConfig.detail);
            let dataPost = {};
            dataPost.widgetIdentifier = tableConfig.widgetIdentifier;
            dataPost.tableConfig = data;
            dataPost.tableConfig.tabView = this.tabView;
            dataPost.tableConfig.treeviewWidth = this.treeviewWidth;
            dataPost.tableConfig = JSON.stringify(dataPost.tableConfig);
            dataPost.conditionalFormat = JSON.stringify({
                listSelectedCondition: this.listSelectedCondition,
                listCondition: this.conditionalFormat
            });
            if (this.hasScheduler) {
                dataPost.conditionalFormatScheduler = JSON.stringify({
                    listSelectedCondition: this.listSelectedConditionScheduler,
                    listCondition: this.schedulerConfig.conditionalFormat
                });
                let treeScheduler = {
                    productList: this.schedulerConfig.treeView.productList,
                    tableType: this.schedulerConfig.treeView.tableType,
                    selectedTree: this.schedulerConfig.treeView.selectedTree,
                    treeData: this.schedulerConfig.treeView.treeData,
                    viewModeScheduler: this.viewModeScheduler
                };
                dataPost.treeViewScheduler = JSON.stringify(treeScheduler);
            }
            if (this.hasKanban) {
                dataPost.conditionalFormatKanban = JSON.stringify({
                    listSelectedCondition: this.listSelectedConditionKanban,
                    listCondition: this.kanbanConfig.conditionalFormat
                });
                let treeKanban = {
                    productList: this.kanbanConfig.treeView.productList,
                    tableType: this.kanbanConfig.treeView.tableType,
                    selectedTree: this.kanbanConfig.treeView.selectedTree,
                    treeData: this.kanbanConfig.treeView.treeData
                };
                dataPost.treeViewKanban = JSON.stringify(treeKanban);
            }

            let typeView = {
                productList: this.typeViewConfigs.productList,
                tableType: this.typeViewConfigs.tableType,
                selectedTree: this.typeViewConfigs.selectedTree,
                treeData: this.typeViewConfigs.treeData
            };
            dataPost.treeView = JSON.stringify(typeView);
            dataPost.filter = {
                defaultApplyedFilter: this.defaultApplyedFilter,
                listFilters: this.listFilters
            };
            dataPost.filter = JSON.stringify(dataPost.filter);
            this.listItemsWorker.postMessage({
                action: 'saveUiConfig',
                data: dataPost
            });
            this.isNotiSuccess = false;
        },
        handleColumnChange() {
            if (this.debounceHandleColumnChange) {
                clearTimeout(this.debounceHandleColumnChange);
            }
            let self = this;
            this.debounceHandleColumnChange = setTimeout(() => {
                self.saveUiConfig();
            }, 2000);
        },
        calcfilteredColumns() {
            let rsl = {};
            for (let colName in this.tableFilter.allColumn) {
                this.$set(this.filteredColumns, colName, true);
            }
        },
        shareFilterAction(filterIdx, isUserFilter) {
            if (isUserFilter) {
                let filter = util.cloneDeep(this.listFilters[filterIdx]);
                filter.isShare = true;
                this.$set(this.listFilters, filterIdx, filter);
            }
            this.saveUiConfig();
            this.$snotifySuccess(this.$t('v2.showlist.shareFilterSuccess'));
        },
        unShareFilterAction(filterIdx, isUserFilter) {
            if (isUserFilter) {
                this.$set(this.listFilters[filterIdx], 'isShare', false);
            }
            this.$snotifySuccess(this.$t('v2.showlist.unShareFilterSuccess'));
            this.saveUiConfig();
        },

        setDefaultFilter(filterIdx, isUserFilter) {
            let filterUniqueId = isUserFilter
                ? this.listFilter[filterIdx].uniqueId
                : this.listSharedFilter[filterIdx].uniqueId;
            if (isUserFilter) {
                this.defaultApplyedFilter.userFilter.push(filterUniqueId);
            } else {
                this.defaultApplyedFilter.sharedFilter.push(filterUniqueId);
            }
            this.saveUiConfig();
        },
        unsetDefaultFilter(filterIdx, isUserFilter) {
            let filterUniqueId = isUserFilter
                ? this.listFilter[filterIdx].uniqueId
                : this.listSharedFilter[filterIdx].uniqueId;
            if (isUserFilter) {
                this.defaultApplyedFilter.userFilter.splice(
                    this.defaultApplyedFilter.userFilter.indexOf(
                        filterUniqueId
                    ),
                    1
                );
            } else {
                this.defaultApplyedFilter.sharedFilter.splice(
                    this.defaultApplyedFilter.sharedFilter.indexOf(
                        filterUniqueId
                    ),
                    1
                );
            }
            this.saveUiConfig();
        },
        deleteFilter(filterIdx) {
            let self = this;
            // let filterName = this.listFilter[filterIdx].name;
            this.confirmDeleteInfo.show = true;
            this.confirmDeleteInfo.title = this.$t(
                'v2.showlist.deleteFilterConfirmTitle'
            );
            this.confirmDeleteInfo.content = this.$t(
                'v2.showlist.deleteFilterConfirmContent'
            );
            // 'Xóa bộ lọc ' + filterName + ' khỏi danh sách bộ lọc';

            // let applyedFilter.userFilter = [];

            this.confirmDeleteInfo.confirm = () => {
                let filter = self.listFilters.filter((item, idx) => {
                    return idx != filterIdx;
                });
                self.listFilters = filter;
                // applyedFilter = this.applyedFilter.splice(filterIdx, 1);

                // this.applyConfigFilter(applyedFilter);
                let userFilter = this.applyedFilter.userFilter;
                userFilter.splice(filterIdx, 1);
                // this.applyedFilter.userFilter.splice(filterIdx, 1);
                this.applyedFilter.userFilter = userFilter;
                self.saveUiConfig();
                this.$snotifySuccess(
                    this.$t('v2.showlist.deleteFilterSuccess')
                );
                self.confirmDeleteInfo.show = false;
                this.translateTableFilterConfigs();
                this.handleGetDataForChangeTypeView();
            };
            this.confirmDeleteInfo.cancel = () => {
                self.confirmDeleteInfo.show = false;
            };
        },
        getAllData() {
            return this.rowData;
        },
        customRowHeights(value) {
            if (value == 1) {
                this.gridOptions.rowHeight = this.rowHeight;
            } else {
                this.defaultColDef.autoHeight = true;
                this.defaultColDef.wrapText = true;
            }
            setTimeout(
                (self) => {
                    self.agApi.resetRowHeights();
                },
                10,
                this
            );
        },
        showLoadingOverlay(message = null) {
            if (this.agApi) {
                this.gridOptions.overlayLoadingTemplate = message
                    ? message
                    : this.$t('common.loading');
                this.agApi.showLoadingOverlay();
            }
        },
        handleProductListToggle(val) {
            if (this.productList) {
                this.toggleShowAttackFileColumn(val);
            }
        },
        toggleShowAttackFileColumn(value) {
            if (!this.columnDefs.length) {
                return;
            }
            let needRerender = false;
            if (value) {
                if (this.columnDefs[2].key != 'defaultAttachFileColumn') {
                    this.defaultAttachFileColumn.cellRenderer = function (
                        params
                    ) {
                        if (params.value) {
                            let arr = [];
                            try {
                                arr = JSON.parse(params.value);
                            } catch {}
                            let img = '';
                            if (arr.length > 0) {
                                arr.forEach(function (k) {
                                    if (k.isMainPicture) {
                                        img = `<img style="object-fit: cover" src="${k.serverPath.replace(
                                            'readFile',
                                            'readFileThumbnail'
                                        )}" max-width="100%"  height="75" >`;
                                    }
                                });
                                // nếu không có ảnh nào tích định danh thì hiện ảnh đầu tiên
                                let mainPicture = arr.some(
                                    (img) => img.isMainPicture
                                );
                                if (!mainPicture)
                                    img = `<img style="object-fit: cover" src="${arr[0].serverPath.replace(
                                        'readFile',
                                        'readFileThumbnail'
                                    )}" max-width="100%"  height="75" >`;
                            }
                            return '<span>' + img + '</span>';
                        } else {
                            return '';
                        }
                    };
                    util.insertToArrByIndex(
                        this.columnDefs,
                        2,
                        this.defaultAttachFileColumn
                    );
                } else {
                    this.columnDefs[2].hide = false;
                }
                needRerender = true;
            } else {
                if (this.columnDefs[2].key == 'defaultAttachFileColumn') {
                    this.columnDefs[2].hide = true;
                    needRerender = true;
                }
            }
            if (needRerender) {
                this.agApi.setColumnDefs(this.columnDefs);
                this.gridOptions.columnApi.moveColumn('avatarShowList', 2);
                this.agApi.resetRowHeights();
            }
        },
        showNoRowsOverlay() {
            if (this.agApi) {
                this.agApi.showNoRowsOverlay();
            }
        },
        hideOverlay() {
            this.agApi.hideOverlay();
        },
        cellContextMenu(params) {
            this.changeSelectionRow();
            this.$emit('cell-context-menu', params);
        },
        cellMouseDown(params) {
            this.$emit('after-cell-mouse-down', params);
        },
        changeSelectionRow() {
            let arr = document.getElementsByClassName('ag-row-selected');
            for (let i = 0; i < arr.length; i++) {
                $(arr[i]).removeClass('ag-row-selected');
            }
            if (arr.length > 0) {
                for (let i = 0; i < arr.length; i++) {
                    $(arr[i]).removeClass('ag-row-selected');
                }
            }
            if (document.getElementsByClassName('ag-row-selected').length > 0) {
                $(
                    document.getElementsByClassName('ag-row-selected')[0]
                ).removeClass('ag-row-selected');
            }
            $(document.getElementsByClassName('ag-row-focus')).each(function (
                e
            ) {
                $(document.getElementsByClassName('ag-row-focus')[e]).addClass(
                    'ag-row-selected'
                );
            });
        },
        cellMouseOver(params) {
            this.cellAboutSelecting = params.data;
            if (this.debounceRelistContextmenu) {
                clearTimeout(this.debounceRelistContextmenu);
            }
            this.debounceRelistContextmenu = setTimeout(
                (self) => {
                    self.relistContextmenu();
                },
                100,
                this
            );
            this.$emit('cell-mouse-over', params);
        },
        // hoangnd: thêm cột checkbox
        addCheckBoxColumn() {
            this.hasColumnsChecked = true;
            this.gridOptions.columnApi.setColumnVisible('checkboxColumn', true); //In that case we hide it
        },
        emptyShowList() {
            this.columnDefs = [];
            this.rowData = [];
        },
        removeCheckBoxColumn() {
            this.hasColumnsChecked = false;
            this.gridOptions.columnApi.setColumnVisible(
                'checkboxColumn',
                false
            ); //In that case we hide it
        },
        checkIsSupportter() {
            return util.auth.isSupportter();
        },
        relistContextmenu() {
            if (!this.cellAboutSelecting) {
                return;
            }
            let row = this.cellAboutSelecting;
            let objectType = this.commonActionProps.resource;
            let id = row.id;
            let items = this.tableContextMenu;
            if (!Array.isArray(items)) {
                let parentId = this.commonActionProps.parentId
                    ? this.commonActionProps.parentId
                    : id;
                items = actionHelper.filterAdmittedActions(
                    items,
                    objectType,
                    parentId,
                    id
                );
            }
            let tmpTableContextMenu = this.getItemContextMenu(items);
            this.tmpTableContextMenu =
                this.reduceContextMenuItems(tmpTableContextMenu);
        },
        reduceContextMenuItems(tmpTableContextMenu) {
            let arr = [];
            let self = this;
            for (let i in tmpTableContextMenu.items) {
                let obj = {};
                obj.name = tmpTableContextMenu.items[i].name;
                if (tmpTableContextMenu.items[i].subMenu) {
                    obj.subMenu = tmpTableContextMenu.items[i].subMenu;
                }
                obj.action = () => {
                    let param = self.paramOnContextMenu;
                    let selection = [
                        {
                            start: {
                                col: param.column.colDef.field,
                                row: param.node.rowIndex
                            },
                            end: {
                                col: param.column.colDef.field,
                                row: param.node.rowIndex
                            }
                        }
                    ];
                    tmpTableContextMenu.callback(i, selection);
                };
                obj.cssClasses = ['redFont', 'bold'];
                arr.push(obj);
            }
            arr = arr.length
                ? arr
                : [
                      {
                          action: () => {},
                          cssClasses: ['redFont', 'bold'],
                          name: `<span class='red--text'><i class= 'mdi mdi-cancel mr-1' > </i> ${this.$t(
                              'v2.showlist.notHavePermission'
                          )}</span>`
                      }
                  ];
            return arr;
        },
        exeCallbackOnContextMenu(rowData) {
            let thisCpn = this;
            let menuItem = this.selectedContextItem;
            menuItem[0].callback(util.cloneDeep(rowData), () => {
                thisCpn.getData(false, true);
            });
        },
        setDeleteItemInfo() {
            let self = this;
            this.confirmDeleteInfo.title = this.$t(
                'common.remove_confirm_title'
            );
            this.confirmDeleteInfo.content = this.$t(
                'common.remove_confirm_message',
                { count: this.deleteItems.length }
            );
            this.confirmDeleteInfo.show = true;

            this.confirmDeleteInfo.cancel = () => {
                self.confirmDeleteInfo.show = false;
            };

            this.confirmDeleteInfo.confirm = () => {
                self.exeCallbackOnContextMenu(self.deleteItems);
                setTimeout(() => {
                    self.deleteItems = [];
                }, 200);
                self.confirmDeleteInfo.show = false;
            };
        },
        getItemContextMenu(rawItems) {
            let thisCpn = this;
            let contextMenu = {
                callback: function (key, selection) {
                    let col = selection[0].start.col;
                    let row = selection[0].start.row;

                    let rowData = thisCpn.rowData[row];
                    // let colName = Object.keys(rowData)[col];
                    let callBackOption = thisCpn.tableContextMenu[key];
                    if (callBackOption && callBackOption.multipleSelection) {
                        rowData = [];
                        for (
                            let i = selection[0].start.row;
                            i <= selection[0].end.row;
                            i++
                        ) {
                            rowData.push(thisCpn.rowData[i]);
                        }
                    }
                    /**
                     * Phát sự kiện khi có một hành động đối với một row, hoặc cell.
                     * tham số thứ nhất: row ( index của row đang được chọn)
                     * tham số thứ hai: colName ( Tên của cột (key trong một row) )
                     */
                    // Callback for context menu item
                    let menuItem = rawItems.filter((menu) => {
                        return menu.name == key;
                    });
                    thisCpn.selectedContextItem = menuItem;
                    if (
                        menuItem.length &&
                        menuItem[0].hasOwnProperty('callback')
                    ) {
                        if (key == 'delete' || key == 'remove') {
                            let allRow = [];
                            let allRowRange = thisCpn.agApi.getCellRanges();
                            thisCpn.agApi.forEachNode((node) => {
                                if (
                                    node.rowIndex >=
                                        allRowRange[0].startRow.rowIndex &&
                                    node.rowIndex <=
                                        allRowRange[0].endRow.rowIndex
                                ) {
                                    allRow.push(node.data);
                                }
                            });
                            thisCpn.deleteItems = allRow;
                            thisCpn.setDeleteItemInfo();
                        } else {
                            thisCpn.exeCallbackOnContextMenu(rowData);
                        }
                    }
                },
                items: {}
            };
            if (this.useDefaultContext) {
                contextMenu.items = {
                    remove: {
                        name: this.$t('common.delete')
                    },
                    edit: {
                        name: this.$t('common.edit')
                    },
                    view: {
                        name: this.$t('common.detail')
                    }
                };
            }
            for (let item of rawItems) {
                contextMenu.items[item.name] = {
                    name: item.text
                };
                if (item.subMenu && item.subMenu.length > 0) {
                    contextMenu.items[item.name].subMenu = item.subMenu;
                }
            }
            return contextMenu;
        },
        getListId(listObject) {
            this.listId = [];
            if (listObject) {
                listObject.map((obj) => {
                    this.listId.push(obj.id);
                });
            }
            this.$emit('get-list-id', this.listId);
        },
        handleGetDataForTree(res) {
            const self = this;
            if (res.status == 200) {
                let listObject = res.data.listObject;
                listObject.forEach((a) => {
                    a.all = 'Tất cả';
                    Object.keys(a).map((key) => {
                        if (a[key] == null) {
                            a[key] = '';
                        }
                    });
                });
                this.rowDataForTree = listObject;
                let allUsers = this.$store.state.app.allUsers;
                // check từng dòng, nếu field thuộc control user = > replace tên
                this.rowDataForTree.map((row) => {
                    Object.keys(row).map((field) => {
                        if (self.columnTypeUser[[field]]) {
                            {
                                let userId = row[field];
                                allUsers.map((user) => {
                                    if (user.id == userId) {
                                        row[field] = user.displayName;
                                    }
                                });
                                let fieldId = field + 'Id';
                                row[fieldId] = userId;
                            }
                        }
                    });
                });
                this.totalObjectOnTree = res.data.total;
            }
            if (this.$refs.treeGroupListItems && this.isViewShowList) {
                this.$refs.treeGroupListItems.loading = false;
            }
            if (this.$refs.treeGroupKanban && this.isViewKanban) {
                this.$refs.treeGroupKanban.loading = false;
            }
            if (this.$refs.treeGroupScheduler && this.isViewScheduler) {
                this.$refs.treeGroupScheduler.loading = false;
            }
        },
        handleCustomGetData(data) {
            this.$emit('custom-get-all-data', data.data.listObject);
        },
        listenWorkerMessage() {
            let self = this;
            this.listItemsWorker.addEventListener('message', function (event) {
                let data = event.data;
                let action = data.action;
                if (self[action]) {
                    self[action](data.data);
                } else {
                    console.error(` action ${action} not found `);
                }
            });
        },
        handlerGetDataError(data) {
            if (!this.$route.path.includes('dataflows')) {
                this.$snotifyError(
                    this.$t('v2.showlist.getDataErrTitle'),
                    this.$t('v2.showlist.getDataErrContent')
                );
            }
            this.getDataError = true;
            this.rowData = [];
            this.hasData = false;
            this.setoverlayNoRowsTemplate();
            setTimeout(() => {
                let self = this;
                self.agApi.hideOverlay();
                self.agApi.showNoRowsOverlay();
            }, 1000);
            this.$emit('load-data-error');
        },
        async handlerGetData(data) {
            let self = this;
            if (data.status == 403) {
                this.getDataPermissionDenied = true;
                self.setoverlayNoRowsTemplate(
                    self.$t('v2.showlist.notHaveViewPermission'),
                    'error'
                );
                setTimeout(() => {
                    self.agApi.hideOverlay();
                    self.agApi.showNoRowsOverlay();
                }, 1000);
                return;
            } else this.getDataPermissionDenied = false;
            if (data.data.length == 0) {
                setTimeout(() => {
                    self.agApi.hideOverlay();
                    self.agApi.showNoRowsOverlay();
                }, 1000);
                return;
            }
            if (data.data) {
                this.getListId(data.data.listObject);
            }
            if (self.customAPIResult.reformatData) {
                data = await self.customAPIResult.reformatData(data);
            } else {
                data = data.data;
            }
            this.totalObject = data.total ? parseInt(data.total) : 0;
            let resData = data.listObject ? data.listObject : [];
            if (this.typeViewConfigs.productList && this.productList) {
                util.insertToArrByIndex(
                    data.columns,
                    2,
                    this.defaultAttachFileColumn
                );
            }
            if (Array.isArray(data.columns)) {
                data.columns.forEach(function (e) {
                    if (e.cellRenderer) {
                        e.cellRenderer = e.cellRenderer.toString();
                    }
                    if (e.type == 'fileUpload') {
                        self.listControlUpload[e.name] = true;
                    }
                });
            }

            if (Object.keys(self.listControlUpload).length > 0) {
                resData.forEach(function (e) {
                    let checkMainPicture = false;
                    for (let i in self.listControlUpload) {
                        let dataControlFile = [];
                        try {
                            dataControlFile = JSON.parse(e[i]);
                        } catch (error) {}
                        if (
                            Array.isArray(dataControlFile) &&
                            dataControlFile.length > 0
                        ) {
                            for (let j in dataControlFile) {
                                if (dataControlFile[j].isMainPicture) {
                                    e.avatarShowList = e[i];
                                    self.avatarIndex = parseInt(j);
                                    checkMainPicture = true;
                                    self.defaultAttachFileColumn.replaceForColumn =
                                        i;
                                }
                            }
                        }
                    }
                    // xử lý hiện ảnh nếu không có tích định danh
                    if (!checkMainPicture) {
                        let check = false;
                        Object.keys(self.listControlUpload).map(
                            (controlName) => {
                                if (e[controlName] != null && !check) {
                                    e.avatarShowList = e[controlName];
                                    self.avatarIndex = parseInt(0);
                                    check = true;
                                    self.defaultAttachFileColumn.replaceForColumn =
                                        controlName;
                                }
                            }
                        );
                    }
                });
            }
            if (data.columns) {
                this.listItemsWorker.postMessage({
                    action: 'getTableColumns',
                    data: {
                        column: data.columns,
                        forcedReOrder: false,
                        savedOrderCols: self.savedTableDisplayConfig,
                        filteredColumns: self.filteredColumns
                    }
                });
            }
            self.lazyRowData = resData;
        },
        handlerGetCustomUIConfigRes(data) {
            this.handlerRestoreTableDisplayConfigRes(data);
            if (this.idDoc == '') {
                this.getData();
            }
        },
        handlerRestoreTableDisplayConfigRes(res) {
            let self = this;
            this.treeviewWidth = res.treeviewWidth
                ? res.treeviewWidth
                : this.treeviewWidth;
            if (res.tableDisplayConfig) {
                this.tableDisplayConfig = res.tableDisplayConfig;
            }
            this.savedTableDisplayConfig = res.savedTableDisplayConfig
                ? res.savedTableDisplayConfig
                : [];
            this.columnDefs = res.columnDefs ? res.columnDefs : this.columnDefs;
            this.tabView = this.isViewShowList ? 0 : res.tabView;
            this.$evtBus.$emit('set-tab-view', this.tabView);
            this.typeViewConfigs = res.typeViewConfigs
                ? res.typeViewConfigs
                : this.typeViewConfigs;
            this.typeViewConfigs.shareTree = res.shareTree;
            //check xem selectedTree có còn tồn tại không
            let group =
                this.typeViewConfigs.selectedTree.split(':').length > 2
                    ? 'shareTree'
                    : 'treeData';
            let selectedTreeConfig = this.typeViewConfigs[group].filter(
                (treeConfig) => {
                    return treeConfig.key == this.typeViewConfigs.selectedTree;
                }
            )[0];
            if (!selectedTreeConfig) {
                this.typeViewConfigs.selectedTree = '';
            }
            this.schedulerConfig = res.schedulerConfig;
            this.viewModeScheduler =
                res.schedulerConfig.treeView.viewModeScheduler;
            this.kanbanConfig = res.kanbanConfig;
            // xử lý phần filter
            let applyedFilter = {
                userFilter: [],
                sharedFilter: []
            };
            this.listFilters = res.filter.listFilters;
            this.defaultApplyedFilter = res.filter.defaultApplyedFilter
                ? res.filter.defaultApplyedFilter
                : { userFilter: [], sharedFilter: [] };
            this.listSharedFilter = res.listSharedFilter;
            this.listFilters.map((fil, idx) => {
                if (
                    this.defaultApplyedFilter.userFilter.includes(fil.uniqueId)
                ) {
                    applyedFilter.userFilter.push(true);
                } else {
                    applyedFilter.userFilter.push(false);
                }
            });
            this.listSharedFilter.map((fil, idx) => {
                if (
                    this.defaultApplyedFilter.sharedFilter.includes(
                        fil.uniqueId
                    )
                ) {
                    applyedFilter.sharedFilter.push(true);
                } else {
                    applyedFilter.sharedFilter.push(false);
                }
            });
            this.applyedFilter = applyedFilter;
            this.translateTableFilterConfigs();
            if (this.showConfigFilter) {
                this.$refs.configfilter.createDataFilter();
            }
            this.handleGetDataForChangeTypeView();
            //conditional format showlist
            this.conditionalFormat = res.conditionalFormat;
            this.listSharedConditionalFormat = res.listSharedConditionalFormat;
            this.listSelectedCondition = res.listSelectedCondition;
            this.allConditionalFormat = this.conditionalFormat.concat(
                this.listSharedConditionalFormat
            );

            //conditional format scheduler
            this.listSelectedConditionScheduler =
                res.listSelectedConditionScheduler;
            this.allConditionalFormatScheduler =
                this.schedulerConfig.conditionalFormat.concat(
                    this.schedulerConfig.sharedConditionalFormat
                );
            //conditional format kanban
            this.listSelectedConditionKanban = res.listSelectedConditionKanban;
            this.allConditionalFormatKanban =
                this.kanbanConfig.conditionalFormat.concat(
                    this.kanbanConfig.sharedConditionalFormat
                );
            setTimeout(() => {
                self.changeForWatch = true;

                if (self.isViewShowList) {
                    self.translateTreeConfigToData(
                        self.typeViewConfigs.selectedTree,
                        false,
                        null,
                        true
                    );
                } else if (self.isViewScheduler) {
                    self.translateTreeConfigToData(
                        self.schedulerConfig.treeView.selectedTree,
                        false,
                        null,
                        true
                    );
                } else if (self.isViewKanban) {
                    self.translateTreeConfigToData(
                        self.kanbanConfig.treeView.selectedTree,
                        false,
                        null,
                        true
                    );
                }
            }, 200);
        },
        handlerSaveTableDisplayConfigRes(res) {
            this.savingConfigs = false;
            this.$snotify({
                type: 'success',
                title: this.$t('table.success.save_config')
            });
        },
        handleSaveTableTypeViewConfigRes(res) {
            this.$snotify({
                type: 'success',
                title: this.$t('table.success.save_config')
            });
            this.$evtBus.$emit('save-config-panel', res);
        },
        refreshFilter() {
            this.addFilter = false;
            this.filterName = '';
        },
        handleSaveUiConfig(res) {
            if (res.status == 200) {
                if (this.isNotiSuccess) {
                    this.$snotify({
                        type: 'success',
                        title: this.$t('v2.showlist.saveSuccess')
                    });
                }
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.showlist.error')
                });
            }
            this.refreshFilter();
        },
        reRender() {
            if (this.isViewShowList) {
                this.agApi.redrawRows();
            }
        },
        searchAutocompleteItems(vl) {
            this.tableFilter.currentColumn.colFilter.searchKey = vl;
            this.getItemForValueFilter();
        },
        handleCloseDragPanel() {
            this.actionPanel = false;
        },
        /**
         * Thực hiện filter khi người dùng click vào nút apply của filter
         */
        applyFilter(filter, source = 'filter') {
            this.page = 1;
            let colName = this.tableFilter.currentColumn.name;
            this.$set(this.tableFilter.allColumn, colName, filter);
            let hasFilter = this.checkColumnHasFilter(colName, filter);
            this.$set(this.filteredColumns, colName, hasFilter);
            this.getData(false, false, true);
            if (!hasFilter || source == 'clear-filter') {
                this.$delete(this.tableFilter.allColumn, colName);
            }
        },
        /**
         * Kiểm tra xem một cột trong table có đang áp dụng filter hay ko
         */
        checkColumnHasFilter(colName, filter = false) {
            if (!filter) {
                filter = this.tableFilter.allColumn[colName];
            }
            if (!filter) {
                return false;
            } else {
                if (
                    filter.sort == '' &&
                    $.isEmptyObject(filter.valuesIn) &&
                    $.isEmptyObject(filter.valuesNotIn) &&
                    filter.conditionFilter.items[0].type == 'none' &&
                    filter.searchKey == ''
                ) {
                    return false;
                } else {
                    return true;
                }
            }
        },
        closeactionPanel() {
            this.actionPanel = false;
        },
        openactionPanel() {
            this.actionPanel = true;
        },
        saveDataAction() {
            this.$emit('save-item', {});
        },
        refreshList() {
            this.loadingRefresh = true;
            if (this.isViewShowList) {
                this.getData(false, true);
                this.$emit('refresh-list', {});
                if (this.typeViewConfigs.tableType == 'treeview') {
                    this.translateTreeConfigToData(
                        this.typeViewConfigs.selectedTree
                    );
                }
            } else if (this.isViewScheduler) {
                this.$evtBus.$emit('refresh-scheduler');
            } else if (this.isViewKanban) {
                this.$evtBus.$emit('refresh-kanban');
            }
        },
        showTableDropdownMenu(x, y, colName) {
            if (
                this.$refs.tableFilter.isShowing() &&
                this.tableFilter.currentColumn.name == colName
            ) {
                return;
            }
            var windowWidth = $(window).width() / 1.1;
            if (x > windowWidth) {
                x -= 190;
            }
            let filterDom = $(this.$refs.tableFilter.$el);
            filterDom.css('left', x + 'px').css('top', y + 10 + 'px');
            this.$refs.tableFilter.show();
            let colFilter = this.tableFilter.allColumn[colName];
            if (!colFilter) {
                colFilter = getDefaultFilterConfig();
                this.$set(this.tableFilter.allColumn, colName, colFilter);
            }
            for (let col of this.columnDefs) {
                if (col.field == colName) {
                    colFilter.dataType = col.type;
                    break;
                }
            }
            if (colName == 'avatarShowList') {
                colFilter.replaceForColumn =
                    this.defaultAttachFileColumn.replaceForColumn;
            }
            colFilter.searchKey = '';
            colFilter.resetSearchKey = true;
            this.$set(this.tableFilter, 'currentColumn', {
                name: colName,
                colFilter: colFilter
            });
            if (Object.keys(this.customGetDataForFilter).length == 0) {
                this.setSelectItemForFilter();
            }
            $('#symper-platform-app').append(filterDom[0]);
            this.getItemForValueFilter();
        },
        /**
         * Lấy danh sách các giá trị cần đưa vào danh sách lựa chọn autocomplete từ server nếu chưa có danh sách này
         */
        async setSelectItemForFilter() {
            let colFilter = this.tableFilter.currentColumn.colFilter;
            let self = this;
            if (colFilter.selectItems.length == 0) {
                let textItems = testSelectData;
                this.listItemsWorker.postMessage({
                    action: 'setSelectItemForFilter',
                    data: {
                        textItems: textItems,
                        colFilter: self.tableFilter.currentColumn.colFilter
                    }
                });
            }
        },
        /**
         * Lấy các item phục vụ cho việc lựa chọn trong autocomplete cuar filter
         */
        async getItemForValueFilterSideBar(colName) {
            let self = this;
            let columns = [colName];
            let options = {
                pageSize: 300,
                getDataMode: 'autocomplete',
                distinct: true,
                page: 1
            };
            let dataConfig = this.getConfigApiCall();
            let colFilter = getDefaultFilterConfig();
            dataConfig.tableFilter.currentColumn.name = colName;
            dataConfig.tableFilter.allColumn = {};
            dataConfig.tableFilter.allColumn[colName] = colFilter;
            colFilter.searchKey = '';
            colFilter.resetSearchKey = true;
            dataConfig.options = options;
            dataConfig.columns = columns;
            dataConfig.colFilter = colFilter; //self.tableFilter.currentColumn.colFilter;
            dataConfig = JSON.parse(JSON.stringify(dataConfig));
            this.listItemsWorker.postMessage({
                action: 'getItemForValueFilterSideBar',
                data: {
                    dataConfig,
                    pathToListObject: this.pathToListObject
                }
            });
            // }
        },
        async getItemForValueFilter() {
            let self = this;
            this.$refs.tableFilter.loading = true;
            let columns = [this.tableFilter.currentColumn.name];
            if (this.customGetDataForFilter.hasOwnProperty(columns[0])) {
                let items = await this.customGetDataForFilter[columns[0]](
                    self.tableFilter.currentColumn.colFilter
                );
                let reduceItems = self.createSelectableItems(items);
                self.tableFilter.currentColumn.colFilter.selectItems =
                    reduceItems;
                if (reduceItems.length > 0) {
                    self.tableFilter.currentColumn.colFilter.valuesIn = {};
                    reduceItems.forEach((e) => {
                        if (e.checked) {
                            self.tableFilter.currentColumn.colFilter.valuesIn[
                                e.value
                            ] = true;
                        }
                    });
                }
                self.tableFilter.allColumn[
                    columns[0]
                ].customGetDataForFilter = true;
                self.$refs.tableFilter.loading = false;
            } else {
                let options = {
                    pageSize: 300,
                    getDataMode: 'autocomplete',
                    distinct: true,
                    page: 1
                };
                let dataConfig = this.getConfigApiCall();
                dataConfig.options = options;
                dataConfig.columns = columns;
                dataConfig.colFilter = self.tableFilter.currentColumn.colFilter;
                dataConfig = JSON.parse(JSON.stringify(dataConfig));
                this.listItemsWorker.postMessage({
                    action: 'getItemForValueFilter',
                    data: {
                        dataConfig,
                        pathToListObject: this.pathToListObject
                    }
                });
            }
        },
        createSelectableItems(items) {
            let colFilter = this.tableFilter.currentColumn.colFilter;
            let selectableItems = [];
            if (colFilter.clickedSelectAll) {
                // chọn tất cả
                selectableItems = items.reduce((arr, el) => {
                    let object = {
                        checked: true
                    };
                    if (typeof el == 'object') {
                        object = Object.assign(object, el);
                    } else {
                        object.value = el;
                    }
                    arr.push(object);
                    return arr;
                }, []);
            } else if (colFilter.selectAll) {
                // not in
                selectableItems = items.reduce((arr, el) => {
                    let checkCol = typeof el == 'object' ? el.value : el;
                    let object = {
                        checked: colFilter.valuesNotIn[checkCol] ? false : true
                    };
                    if (typeof el == 'object') {
                        object = Object.assign(object, el);
                    } else {
                        object.value = el;
                    }
                    arr.push(object);
                    return arr;
                }, []);
            } else {
                // in
                selectableItems = items.reduce((arr, el) => {
                    let checkCol = typeof el == 'object' ? el.value : el;
                    let object = {
                        checked: colFilter.valuesIn[checkCol] ? true : false
                    };
                    if (typeof el == 'object') {
                        object = Object.assign(object, el);
                    } else {
                        object.value = el;
                    }
                    arr.push(object);
                    return arr;
                }, []);
            }
            return selectableItems;
        },
        getConfigApiCall(includesTablefilter = true) {
            let self = this;
            let customDataForApi;
            if (self.customDataForApi) {
                customDataForApi = self.customDataForApi(false, false, false);
            }
            let obj = {
                url: self.getDataUrl,
                method: self.apiMethod,
                tableFilter: includesTablefilter
                    ? self.tableFilter
                    : {
                          allColumn: {},
                          currentColumn: {}
                      },
                customDataForApi: customDataForApi,
                routeName: self.$getRouteName(),
                useWorkFlowHeader: self.useWorkFlowHeader,
                searchKey: self.searchKey,
                page: self.page,
                pageSize: self.pageSize,
                conditionByFormula: self.conditionByFormula,
                savedTableDisplayConfig: self.savedTableDisplayConfig,
                customContentType: self.customContentType
            };
            self.columnDefs.forEach(function (e) {
                if (e.cellRenderer) {
                    e.cellRenderer = e.cellRenderer.toString();
                }
                if (e.cellStyle) {
                    e.cellStyle = e.cellStyle.toString();
                }
            });
            obj.columnDefs = self.columnDefs;
            return obj;
        },
        importExcel() {
            this.$emit('import-excel');
        },
        cancelImport() {
            this.$emit('cancel-import');
        },
        exportExcel() {
            let exportUrl = this.exportLink;
            if (!exportUrl) {
                if (this.getDataUrl[this.getDataUrl.length - 1] == '/') {
                    exportUrl = this.getDataUrl + 'export';
                } else {
                    exportUrl = this.getDataUrl + '/export';
                }
            }
            this.getData(false, true, true, false, false, true);
        },
        // Hoangnd: Xử lý export sau khi lấy được config theo bộ lọc của showlist
        async handleExportExcel(data) {
            let exportFile = this.exportFileName;
            if (exportFile == '') {
                exportFile = $(this.$el)
                    .closest('.layout.w-100.justify-center')
                    .find('.title-document-autocomplete')
                    .text();
                exportFile = exportFile.trim();
            }
            delete data.isExport;
            delete data.page;
            delete data.pageSize;
            data.uiKey = this.getWidgetIdentifier();
            this.$emit('export-excel', { data: data, exportFile: exportFile });
        },
        showImportHistory() {
            this.$router.push('/viewHistory');
        },
        changeAlwayShowSBSState() {
            this.tableDisplayConfig.value.alwaysShowSidebar =
                !this.tableDisplayConfig.value.alwaysShowSidebar;
            this.saveUiConfig();
        },
        customBtnclick(i) {
            this.customHeaderBtn[i].callBack();
        },
        checkHasPermission(action) {
            let objectType = this.commonActionProps.resource;
            let key = '0';
            if (objectType == 'document_instance') {
                key = this.commonActionProps.parentId + ':' + 0;
            }
            return actionHelper.checkHasPermission(objectType, action, key);
        },
        checkShowCreateInDocument() {
            let rsl = !this.isCompactMode;
            let docId = this.commonActionProps.parentId;
            let objectTypePermission =
                this.$store.state.app.userOperations['document_definition'];
            let hasCreatePermission = true;
            if (!this.checkIsSupportter()) {
                hasCreatePermission =
                    objectTypePermission &&
                    objectTypePermission[docId] &&
                    (objectTypePermission[docId]['create'] ||
                        objectTypePermission[docId]['submit']);
            }
            return rsl && hasCreatePermission;
        },
        handlerRowClicked(params) {
            this.$emit('row-selected', params.data);
        },
        handleTreeChangePage(vl) {
            this.treePageValue = vl.page;
            if (this.isViewShowList) {
                this.translateTreeConfigToData(
                    this.typeViewConfigs.selectedTree,
                    false
                );
            } else if (this.isViewScheduler) {
                this.translateTreeConfigToData(
                    this.schedulerConfig.treeView.selectedTree,
                    false
                );
            } else if (this.isViewKanban) {
                this.translateTreeConfigToData(
                    this.kanbanConfig.treeView.selectedTree,
                    false
                );
            }
        },
        handleTreeChangePageSize(vl) {
            this.treePageSizeValue = vl.pageSize;
            if (this.isViewShowList) {
                this.translateTreeConfigToData(
                    this.typeViewConfigs.selectedTree,
                    false
                );
            } else if (this.isViewScheduler) {
                this.translateTreeConfigToData(
                    this.schedulerConfig.treeView.selectedTree,
                    false
                );
            } else if (this.isViewKanban) {
                this.translateTreeConfigToData(
                    this.kanbanConfig.treeView.selectedTree,
                    false
                );
            }
        },
        handleResizeEnd(param) {
            this.treeviewWidth = param.width;
            this.saveUiConfig();
        },
        handleNodeSelected(arr) {
            this.tableFilter.currentColumn.name = '';
            // this.tableFilter.allColumn = {};
            let self = this;
            Object.keys(self.tableFilter.allColumn).forEach((key) => {
                if (self.tableFilter.allColumn[key].addedByTree) {
                    delete self.tableFilter.allColumn[key];
                }
            });
            if (arr[arr.length - 1].key !== 'all' || arr.length >= 1) {
                arr.map((key) => {
                    if (key.value == '[ Trống ]') {
                        key.value = '';
                    }
                });
                let keysFilter = arr.map((e) => e.key);
                let colsFilter = {};
                this.columnDefs.forEach((col) => {
                    if (keysFilter.includes(col.field)) {
                        colsFilter[col.field] = col.type;
                    }
                });
                arr.forEach(function (e) {
                    if (!self.tableFilter.allColumn[e.key] && e.key != 'all') {
                        self.tableFilter.allColumn[e.key] = {
                            sort: '',
                            addedByTree: true,
                            dataType: colsFilter[e.key]
                                ? colsFilter[e.key]
                                : 'text',
                            searchKey: '',
                            selectAll: false,
                            total: 0,
                            valuesIn: {
                                [e.value]: true
                            },
                            valuesNotIn: {},
                            conditionFilter: {
                                conjunction: 'and',
                                items: [
                                    {
                                        type: 'none',
                                        value: ''
                                    },
                                    {
                                        type: 'none',
                                        value: ''
                                    }
                                ]
                            }
                        };
                    } else if (
                        self.tableFilter.allColumn[e.key] &&
                        e.key != 'all'
                    ) {
                        if (
                            self.tableFilter.allColumn[
                                e.key
                            ].valuesIn.hasOwnProperty(e.value)
                        ) {
                            self.tableFilter.allColumn[e.key].valuesIn = {};
                            self.tableFilter.allColumn[e.key].valuesIn[
                                e.value
                            ] = true;
                        } else {
                            self.tableFilter.allColumn[e.key].valuesIn = {};
                            // khi click vào 1 treeItems mà không có trong config, ex: asignee được lọc gồm A,B mà treeView click C
                            self.tableFilter.allColumn[e.key].valuesIn[
                                self.instaceKey
                            ] = true;
                        }
                    }
                });
            }
            if (this.isViewShowList) {
                this.getData(false, false, true);
            } else if (this.isViewScheduler) {
                let filter = getFilterConfigs('', this.tableFilter);
                this.$evtBus.$emit('get-data-scheduler', filter);
            } else if (this.isViewKanban) {
                let filter = getFilterConfigs('', this.tableFilter);
                this.$evtBus.$emit('get-data-kanban', filter);
            }
        },
        onCellClicked(params) {
            if (
                params.colDef.key == 'defaultAttachFileColumn' &&
                params.value
            ) {
                this.handleAttackFileClick(params);
            }
            this.selectedRow = params.data;
            this.changeSelectionRow();
            this.$emit('row-selected', params.data);
            this.$emit('cell-selected', params);
        },
        handleAttackFileClick(params) {
            let arr = JSON.parse(params.value);
            if (typeof arr == 'object' && arr.length > 0) {
                let avatarIdex = 0;
                arr.forEach(function (e, i) {
                    e.thumb = e.serverPath;
                    e.src = e.serverPath;
                    if (!e.isMainPicture) {
                        avatarIdex = 0;
                    }
                });
                this.listImageLightBox = arr;
                this.$refs.lightbox.showDialog = true;
                this.$refs.lightbox.showImage(avatarIdex);
            }
        },
        handlerRowSelected(params) {
            let rowData = params.data;
            let key = rowData.document_object_id ? 'document_object_id' : 'id';
            let currentRow = this.rowSelected.find(
                (el) => el[key] == rowData[key]
            );
            if (!currentRow) {
                this.rowSelected.push(rowData);
            } else {
                if (!params.node.selected) {
                    this.rowSelected.splice(
                        this.rowSelected.indexOf(currentRow),
                        1
                    );
                }
            }
            this.$emit('row-selected-change', this.rowSelected);
        },
        clearRowSelected() {
            this.rowSelected = [];
        },
        onSelectionChanged() {
            var selectedRows = this.agApi.getSelectedRows();
            document.querySelector('.ag-row-selected').innerHTML =
                selectedRows.length === 1 ? selectedRows[0].athlete : '';
        },
        onModelUpdate() {},
        onGridReady(params) {
            params.api.sizeColumnsToFit();
            this.agApi = params.api;
            this.agApi.showLoadingOverlay();
            setTimeout(
                (self) => {
                    self.customRowHeights(
                        self.tableDisplayConfig.value.wrapTextMode
                    );
                },
                200,
                this
            );
            this.hideOverlay();
        },
        handleChangeTypeView(data) {
            this.includesTreeview = data == 'treeview' ? true : false;
            if (this.includesTreeview) {
                this.synchronizedTreeView = true;
                if (this.isViewShowList) {
                    this.translateTreeConfigToData(
                        this.typeViewConfigs.selectedTree
                    );
                } else if (this.isViewKanban) {
                    this.translateTreeConfigToData(
                        this.kanbanConfig.treeView.selectedTree
                    );
                } else if (this.isViewScheduler) {
                    this.translateTreeConfigToData(
                        this.schedulerConfig.treeView.selectedTree
                    );
                }
            }
        },
        openTableDisplayConfigPanel() {
            this.tableDisplayConfig.show = !this.tableDisplayConfig.show;
            if (
                !this.isViewShowList &&
                this.isViewScheduler &&
                this.schedulerConfig.treeView.selectedTree &&
                this.schedulerConfig.treeView.tableType == 'treeview'
            ) {
                this.showGroupScheduler = true;
            }
            if (
                !this.isViewShowList &&
                this.kanbanConfig.treeView.selectedTree &&
                this.kanbanConfig.treeView.tableType == 'treeview'
            ) {
                this.showGroupKanban = true;
            }
        },
        bindToSearchkey(vl) {
            if (this.searchKey == vl) {
                return;
            }
            this.searchKey = vl;
            if (this.debounceGetData) {
                clearTimeout(this.debounceGetData);
            }
            this.debounceGetData = setTimeout(
                (self) => {
                    if (this.isViewKanban) {
                        this.$evtBus.$emit('search-kanban', vl);
                        this.needGetDataForShowlist = true;
                    }
                    self.page = 1;
                    if (this.isViewSmartObj) {
                        self.getData(false, true);
                    } else if (this.isViewShowList) {
                        self.getData();
                    }
                },
                300,
                this
            );
        },
        filterList() {
            // Phát sự kiện khi có filter danh sách
            this.$emit('filter-list', {});
        },
        removeItem() {
            // Phát sự kiện khi xóa danh sách các item trong list
            this.$emit('remove-item', []);
        },
        searchAll() {
            // Phát sự kiện khi người dùng gõ vào ô tìm kiếm
            this.$emit('search-all', {});
        },
        isShowSidebar() {
            return this.alwaysShowActionPanel;
        },
        // Hàm trả về các dòng được selected
        getAllRowChecked() {
            return this.allRowChecked;
        },
        removeAllRowChecked() {
            this.allRowChecked = [];
        },
        changePageSize(vl) {
            this.pageSize = vl.pageSize;
            this.showLoadingOverlay();
            this.getData();
            this.$emit('change-page-size', vl.pageSize);
        },
        changePage(vl) {
            this.page = vl.page;
            this.showLoadingOverlay();
            this.getData();
            this.$emit('change-page', vl.page);
        },
        customGetData(page) {
            this.page = page;
            this.pageSize = 1000;
            this.getData(false, false, true, false, true);
        },
        addItem() {
            if (this.useActionPanel && this.isViewScheduler == true) {
                this.$evtBus.$emit('after-open-add-panel-btnaddevent', {});
            } else if (this.useActionPanel) {
                this.actionPanel = true;
                // Phát sự kiện khi click vào nút thêm mới
                this.$emit('after-open-add-panel', {});
            } else this.$emit('on-add-item-clicked', {});
        },
        handleCloseClick() {
            this.$emit('close-popup');
        },
        nextPage(lazyLoad = false) {
            this.page += 1;
            this.getData(false, false, true, lazyLoad);
            this.$emit('change-page', this.page);
        },
        prevPage() {
            if (this.page == 1) {
                return;
            }
            this.page -= 1;
            this.getData();
            this.$emit('change-page', this.page);
        },
        resetDataBeforeRunDataflow() {
            for (let key in this.filteredColumns) {
                this.tableFilter.currentColumn.name = key;
                this.applyFilter(false, 'clear-filter');
                this.filteredColumns[key] = false;
            }
            this.searchValue = '';
            this.searchKey = '';
        },
        getData(
            columns = false,
            cache = false,
            applyFilter = true,
            lazyLoad = false,
            customGetData = false,
            isExport = false
        ) {
            let self = this;
            let dataConfig = this.getConfigApiCall();
            if (isExport) {
                dataConfig.url = this.exportLink;
                dataConfig.isExport = true;
            } else {
                this.showLoadingOverlay();
            }
            dataConfig.configs = {
                columns: columns,
                cache: cache,
                applyFilter: applyFilter
            };
            dataConfig.lazyLoad = lazyLoad;
            dataConfig.customAPIResult = self.customAPIResult.reformatData
                ? self.customAPIResult.reformatData.toString()
                : null;
            dataConfig.filteredColumns = self.filteredColumns;

            dataConfig.tableFilter.customConditionsForFilter =
                this.customConditionsForFilter;
            if (
                Object.keys(dataConfig.tableFilter.customConditionsForFilter)
                    .length > 0
            ) {
                for (let key in dataConfig.tableFilter
                    .customConditionsForFilter) {
                    dataConfig.tableFilter.customConditionsForFilter[key] =
                        dataConfig.tableFilter.customConditionsForFilter[
                            key
                        ].toString();
                }
            }
            // dataConfig.tableFilter.allColumn.
            for (let column in this.treeViewFilter.allColumn) {
                if (this.filteredColumns[column]) {
                    dataConfig.tableFilter.allColumn[column] =
                        this.treeViewFilter.allColumn[column];
                }
            }
            self.columnDefsInfo = this.gridOptions.columnApi.getColumnState();
            if (customGetData) {
                this.listItemsWorker.postMessage({
                    action: 'customGetData',
                    data: dataConfig
                });
            } else {
                this.listItemsWorker.postMessage({
                    action: 'getData',
                    data: dataConfig
                });
            }
            this.timeGetData++;
            this.loadingRefresh = false;
        },
        getCustomUIConfig() {
            this.listItemsWorker.postMessage({
                action: 'getCustomUIConfig',
                data: {
                    widgetIdentifier: this.getWidgetIdentifier(),
                    columnDefs: this.columnDefs
                }
            });
        },
        getWidgetIdentifier() {
            let widgetIdentifier = '';
            if (this.widgetIdentifier) {
                widgetIdentifier = this.widgetIdentifier;
            } else {
                // trường hợp bộ lọc ở trong application
                if (this.$route.name == 'my-applications') {
                    let id = this.$route.params.id;
                    let object = this.$route.meta.sRouteName;
                    widgetIdentifier =
                        this.$route.path + ':' + object + ':' + id;
                } else {
                    widgetIdentifier = this.$route.path;
                }
            }
            widgetIdentifier = widgetIdentifier.replace(/(\/|\?|=)/g, '');
            return widgetIdentifier;
        },
        rerenderTable() {
            if (this.columnDefsInfo.length < 1) {
                this.agApi.sizeColumnsToFit();
            }
        },
        getRouteIdentifier() {
            let widgetIdentifier = this.$route.path;
            widgetIdentifier = widgetIdentifier.replace(/(\/|\?|=)/g, '');
            return widgetIdentifier;
        },
        getTableDisplayConfigData() {
            let configs = util.cloneDeep(this.tableDisplayConfig.value);
            let colDefs = this.gridOptions.columnApi.getColumnState();
            configs.columns = colDefs.map((col) => {
                return {
                    field: col.colId,
                    width: col.width,
                    pinned: col.pinned,
                    hide: col.hide
                };
            });
            this.savedTableDisplayConfig = configs.columns;
            let rsl = {
                widgetIdentifier: this.getWidgetIdentifier(),
                detail: '{}'
            };
            rsl.detail = JSON.stringify(configs);
            return rsl;
        },
        /**
         * Lưu lại cấu hình hiển thị của table
         */
        saveTableDisplayConfig() {
            this.savingConfigs = true;
            this.saveUiConfig();
        },
        handleEditTreeItem() {
            if (this.isViewShowList) {
                this.translateTreeConfigToData(
                    this.typeViewConfigs.selectedTree
                );
            } else if (this.isViewScheduler) {
                this.translateTreeConfigToData(
                    this.schedulerConfig.treeView.selectedTree
                );
            } else if (this.isViewKanban) {
                this.translateTreeConfigToData(
                    this.kanbanConfig.treeView.selectedTree
                );
            }
        },
        handleSaveConfigTypeView(configs, action) {
            if (this.isViewShowList) {
                this.typeViewConfigs = configs;
            } else if (this.isViewKanban) {
                this.kanbanConfig.treeView = configs;
            } else if (this.isViewScheduler) {
                this.schedulerConfig.treeView = configs;
            }
            this.saveUiConfig();
            if (configs.selectedTree == '') {
                this.refreshList();
            }
            if (action == 'share') {
                this.isNotiSuccess = true;
            }
        },
        setRowHeight(height) {
            this.agApi.forEachNode(function (rowNode) {
                rowNode.setRowHeight(height);
            });
            this.agApi.onRowHeightChanged();
        }
    }
};
</script>
<style>
.item-smart-obj.v-navigation-drawer {
    height: 95vh !important;
    top: calc(50vh + 40px - 100vh) !important;

    position: absolute;
    bottom: 0;
}
</style>
<style scoped>
.symper-list-item {
    display: flex;
}
.close-panel-icon {
    margin-bottom: -40px;
    right: 0;
    z-index: 999;
    position: absolute;
    margin-right: 12px;
}
.symper-list-items .ag-list-items-table >>> .ag-row {
    border-top-style: unset !important;
    border-bottom-style: unset !important;
}
.symper-list-items .ag-list-items-table >>> .ag-theme-balham .ag-root-wrapper {
    border: unset !important;
}
.symper-list-items .ag-list-items-table >>> .ag-cell {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.symper-list-items .ag-list-items-table >>> .ag-header {
    border: unset !important;
}
.symper-list-items .ag-list-items-table >>> .ag-cell {
    line-height: unset !important;
}
.symper-list-items .ag-list-items-table >>> .ag-header {
    height: 28px !important;
    min-height: unset !important;
    background-color: #ffffff !important;
    border-bottom: 1px solid lightgray !important;
}
.symper-list-items .ag-list-items-table >>> .ag-header-row {
    height: 24px !important;
}
.symper-list-items .ag-list-items-table >>> .ag-row-selected {
    background-color: #dbe7fe !important;
}

.symper-list-items .ag-list-items-table >>> .ag-row.ag-row-odd {
    background-color: #fbfbfb;
}

.symper-list-items .ag-list-items-table >>> .ag-horizontal-left-spacer {
    overflow: hidden;
}
.symper-list-items .ag-list-items-table >>> .ag-pinned-left-header,
.symper-list-items .ag-list-items-table >>> .ag-pinned-right-header,
.symper-list-items .ag-list-items-table >>> .ag-header-container {
    background-color: #f4f4f4;
}

.symper-list-items .ag-list-items-table >>> .ag-root-wrapper {
    border: none !important;
}

.symper-list-items >>> .clip-text .ag-cell {
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}
.symper-list-items >>> .applied-filter {
    color: #f56634;
    background-color: #ffdfc8;
}
.symper-list-items .ag-list-items-table >>> .ag-menu-option-text {
    line-height: 12px !important;
    padding-left: unset !important;
}
.filter-menu {
    height: 35px !important;
}
.filter-menu:hover,
.add-filter:hover,
.action-filter:hover {
    background: #f5f5f5;
}
.config-filter-icon {
    margin-top: -15px;
}
.not-found-screen >>> .ag-header {
    display: none;
}
/* .v-application .v-tooltip__content {
    background: white !important;
} */
.list-filter-tooltip {
    color: #fb7e00;
}
.v-tooltip__content:has(.list-filter-tooltip) {
    background: white;
    border-radius: 4px;
    box-shadow: 1px 4px 6px rgb(0 0 0 / 20%);
    opacity: 1 !important;
}
</style>

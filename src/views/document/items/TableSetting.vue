<template>
    <v-dialog
        persistent
        v-model="isShowTableSetting"
        :width="tab == 4 ? '100%' : '50%'"
        scrollable
        style="overflow: hidden"
        :retain-focus=false
    >
        <v-card
            :id="'dialog-editor-' + instance"
            :height="tab == 4 ? '90vh' : '600'"
        >
            <v-card-title class="s-card-title d-flex justify-space-between">
                <div
                    style="position: absolute; right: 0; z-index: 1"
                    class="mr-5"
                >
                    <v-btn
                        color="success"
                        small
                        @click="saveTable"
                        class="mr-1"
                    >
                        {{ $t('common.save') }}
                    </v-btn>

                    <v-btn small text @click="hideDialog">
                        <v-icon :size="15">mdi-close</v-icon>
                    </v-btn>
                </div>
                <v-tabs class="s-tabs" v-model="tab" align-with-title>
                    <v-tabs-slider color="orange"></v-tabs-slider>

                    <v-tab v-for="item in items" :key="item">
                        {{ item }}
                    </v-tab>
                </v-tabs>
            </v-card-title>
            <v-card-text>
                <v-tabs-items v-model="tab">
                    <v-tab-item>
                        <div
                            id="setting-control-table"
                            class="setting-control-table"
                        >
                            <div class="content-setting-control-table">
                                <v-data-table
                                    hide-default-footer
                                    :headers="headers"
                                    fixed-header
                                    height="100%"
                                >
                                    <template v-slot:body>
                                        <draggable
                                            :list="listRows"
                                            tag="tbody"
                                            :animation="200"
                                        >
                                            <s-row-table-setting
                                                v-for="row in listRows"
                                                :key="row.key"
                                                :row="row"
                                                @remove-row="removeRow"
                                            />

                                            <!-- the row will go here -->
                                        </draggable>
                                    </template>
                                </v-data-table>
                            </div>
                        </div>
                    </v-tab-item>
                    <v-tab-item>
                        <div class="setting-pivot">
                            <VuePerfectScrollbar
                                style="height: 476px; width: 300px"
                            >
                                <div class="s-title">Control</div>
                                <div class="list-columns">
                                    <draggable
                                        :list="listRowsForPivot"
                                        :animation="200"
                                        group="control-pivot"
                                    >
                                        <div
                                            class="column-item"
                                            v-for="(
                                                item, index
                                            ) in listRowsForPivot"
                                            :data-index="index"
                                            :key="index"
                                        >
                                            {{ item.name }} -- {{ item.title }}
                                        </div>
                                    </draggable>
                                </div>
                            </VuePerfectScrollbar>

                            <div class="detail-pivot-setting">
                                <div class="s-title">Rows</div>
                                <VuePerfectScrollbar class="s-scroll">
                                    <div class="detail-pivot-setting__rows">
                                        <draggable
                                            :list="tablePivotConfig.rows"
                                            :animation="200"
                                            group="control-pivot"
                                            class="h-100"
                                        >
                                            <div
                                                class="column-row-item"
                                                v-for="(
                                                    item, index
                                                ) in tablePivotConfig.rows"
                                                :key="index"
                                            >
                                                {{ item.name }} --
                                                {{ item.title }}
                                                <!-- <span class="mdi mdi-close" @click="deleteItem('rows', index, item)"></span> -->
                                            </div>
                                        </draggable>
                                    </div>
                                </VuePerfectScrollbar>
                                <div class="s-title">Columns</div>
                                <VuePerfectScrollbar class="s-scroll">
                                    <div class="detail-pivot-setting__cols">
                                        <draggable
                                            :list="tablePivotConfig.cols"
                                            :animation="200"
                                            group="control-pivot"
                                            class="h-100"
                                        >
                                            <div
                                                class="column-col-item"
                                                v-for="(
                                                    item, index
                                                ) in tablePivotConfig.cols"
                                                :key="index"
                                            >
                                                {{ item.name }} --
                                                {{ item.title }}
                                                <!-- <span class="mdi mdi-close" @click="deleteItem('cols', index, item)"></span> -->
                                            </div>
                                        </draggable>
                                    </div>
                                </VuePerfectScrollbar>
                                <div class="s-title">Values</div>
                                <VuePerfectScrollbar class="s-scroll">
                                    <div class="detail-pivot-setting__values">
                                        <draggable
                                            :list="tablePivotConfig.values"
                                            :animation="200"
                                            group="control-pivot"
                                            class="h-100"
                                        >
                                            <div
                                                class="column-value-item"
                                                v-for="(
                                                    item, index
                                                ) in tablePivotConfig.values"
                                                :key="index"
                                            >
                                                {{ item.name }} --
                                                {{ item.title }}
                                                <!-- <span class="mdi mdi-close" @click="deleteItem('values', index, item)"></span> -->
                                            </div>
                                        </draggable>
                                    </div>
                                </VuePerfectScrollbar>
                            </div>
                        </div>
                    </v-tab-item>
                    <v-tab-item>
                        <div class="d-flex">
                            <VuePerfectScrollbar
                                style="height: 476px; width: 300px"
                            >
                                <div class="s-title">Control</div>
                                <div class="list-columns">
                                    <draggable
                                        :list="listRowsForGroup"
                                        :animation="200"
                                        group="control-group"
                                    >
                                        <div
                                            class="column-item"
                                            v-for="(
                                                item, index
                                            ) in listRowsForGroup"
                                            :data-index="index"
                                            :key="index"
                                        >
                                            {{ item.name }} -- {{ item.title }}
                                        </div>
                                    </draggable>
                                </div>
                            </VuePerfectScrollbar>
                            <div class="group-config">
                                <div class="s-title">
                                    Rows
                                    <span class="color-grey fw-400">
                                        {{$t('v2.doc.motherToChildSortedTopToBottom')}}
                                    </span>
                                </div>
                                <VuePerfectScrollbar
                                    class="s-scroll"
                                    style="height: 125px"
                                >
                                    <draggable
                                        :list="tableGroupConfig.rows"
                                        :animation="200"
                                        group="control-group"
                                        class="h-100 p-2"
                                    >
                                        <div
                                            class="column-row-item"
                                            v-for="(
                                                item, index
                                            ) in tableGroupConfig.rows"
                                            :key="index"
                                        >
                                            {{ item.name }} -- {{ item.title }}
                                        </div>
                                    </draggable>
                                </VuePerfectScrollbar>
                                <div class="s-title">Columns</div>
                                <VuePerfectScrollbar
                                    class="s-scroll"
                                    style="height: 125px"
                                >
                                    <draggable
                                        :list="tableGroupConfig.cols"
                                        :animation="200"
                                        group="control-group"
                                        class="h-100 p-2"
                                    >
                                        <div
                                            class="column-row-item"
                                            v-for="(
                                                item, index
                                            ) in tableGroupConfig.cols"
                                            :key="index"
                                        >
                                            {{ item.name }} -- {{ item.title }}
                                        </div>
                                    </draggable>
                                </VuePerfectScrollbar>
                                <div class="s-title">Values</div>
                                <VuePerfectScrollbar
                                    class="s-scroll"
                                    style="height: 125px"
                                >
                                    <draggable
                                        :list="tableGroupConfig.values"
                                        :animation="200"
                                        group="control-group"
                                        class="h-100 p-2"
                                    >
                                        <div
                                            class="column-value-item"
                                            v-for="(
                                                item, index
                                            ) in tableGroupConfig.values"
                                            :key="index"
                                        >
                                            {{ item.name }} -- {{ item.title }}
                                        </div>
                                    </draggable>
                                </VuePerfectScrollbar>
                                <div style="margin-top: -10px">
                                    <v-checkbox
                                        v-model="tableGroupConfig.showGroupName"
                                        color="primary"
                                    >
                                        <template v-slot:label>
                                            <span class="fs-12 color-grey"
                                                >{{$t('v2.doc.displayValueInGroupColumn')}}</span
                                            >
                                        </template>
                                    </v-checkbox>
                                </div>
                            </div>
                        </div>
                    </v-tab-item>
                    <v-tab-item>
                        <div
                            id="setting-control-table"
                            class="setting-control-table"
                        >
                            <div class="content-setting-control-table">
                                <div
                                    class="d-flex"
                                    style="padding: 8px"
                                    v-for="item in listItemDeleteConfig"
                                    :key="item.controlName"
                                >
                                    <v-select
                                        :items="listControlName"
                                        return-object
                                        item-text="title"
                                        item-value="name"
                                        :label="$t('v2.doc.selectControl')"
                                        flat
                                        class="sym-small-size sym-style-input"
                                        solo
                                        v-model="item.controlName"
                                    ></v-select>
                                    <v-select
                                        :items="listOperator"
                                        :label="$t('v2.doc.selectConditional')"
                                        class="sym-small-size sym-style-input"
                                        flat
                                        solo
                                        v-model="item.operator"
                                    ></v-select>
                                    <v-text-field
                                        label="Solo"
                                        :placeholder="$t('v2.doc.value')"
                                        class="sym-small-size sym-style-input"
                                        flat
                                        solo
                                        v-model="item.value"
                                    ></v-text-field>
                                    <v-btn
                                        icon
                                        small
                                        color="pink"
                                        @click="afterConfigDeleteRowClick(item)"
                                    >
                                        <v-icon small>mdi-close</v-icon>
                                    </v-btn>
                                </div>
                            </div>
                        </div>
                    </v-tab-item>
                    <v-tab-item>
                        <div class="setting-matching-items">
                            <MatchingItemBA
                                ref="matchingItems"
                                :data="matchingItems"
                                :listControl="listRows"
                                @save="saveMatchingItem"
                                @close="hideDialog"
                            />
                        </div>
                    </v-tab-item>
                </v-tabs-items>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions v-if="tab != 4">
                <v-spacer></v-spacer>
                <v-btn
                    depressed
                    small
                    style="margin-left: 12px"
                    @click="addNewItemDeleteConfig"
                    v-if="tab == 3"
                >
                    {{$t('v2.doc.add')}}
                </v-btn>
                <input
                    v-if="tab == 0"
                    class="prefix-name-control"
                    v-model="prefixName"
                    type="text"
                    :placeholder="$t('v2.doc.controlNamePrefix')"
                />
                <v-btn
                    v-if="tab == 0"
                    color="green darken-1"
                    text
                    left
                    @click="autoGenerateName"
                >
                    {{$t('v2.doc.automaticName')}}
                </v-btn>
                <v-btn
                    v-if="tab == 0"
                    color="green darken-1"
                    text
                    left
                    @click="addNewRow"
                >
                    {{$t('v2.doc.addColumn')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import TableSettingRow from './TableSettingRow.vue';
import MatchingItemBA from './MatchingItemBA.vue';

import draggable from 'vuedraggable';
import { str } from './../../../plugins/utilModules/str.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { util } from '../../../plugins/util';

export default {
    components: {
        's-row-table-setting': TableSettingRow,
        VuePerfectScrollbar,
        MatchingItemBA,
        draggable
    },
    props: {
        defaultRow: {
            type: Array
        },
        instance: {
            type: Number
        },
        defaultTablePivotConfig: {
            type: Object
        },
        defaultTableGroupConfig: {
            type: Object
        },
        dataConfigDeleteRow: {
            type: Array
        },
        dataMatchingItems: {
            type: Object
        }
    },
    watch: {
        defaultRow: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.listRows = vl;
            }
        },
        defaultTablePivotConfig: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                if (Object.keys(vl).length > 0) {
                    this.tablePivotConfig.cols = vl.cols ? vl.cols : [];
                    this.tablePivotConfig.rows = vl.rows ? vl.rows : [];
                    this.tablePivotConfig.values = vl.values ? vl.values : [];
                }
            }
        },
        defaultTableGroupConfig: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                if (Object.keys(vl).length > 0) {
                    this.tableGroupConfig.cols = vl.cols ? vl.cols : [];
                    this.tableGroupConfig.showGroupName = vl.showGroupName
                        ? vl.showGroupName
                        : false;
                    this.tableGroupConfig.rows = vl.rows ? vl.rows : [];
                    this.tableGroupConfig.values = vl.values ? vl.values : [];
                    this.clearDefaultData(vl);
                }
            }
        },
        dataConfigDeleteRow: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                if (vl && vl.length > 0) {
                    this.listItemDeleteConfig = vl;
                }
            }
        },
        dataMatchingItems: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                if (Object.keys(vl).length > 0) {
                    this.matchingItems = util.cloneDeep(vl);
                }
            }
        },
        'tableGroupConfig.cols': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                if (vl.length > 1) {
                    let item = this.tableGroupConfig.cols[1];
                    this.listRowsForGroup.push(item);
                    this.tableGroupConfig.cols.splice(1, 1);
                }
            }
        },
        'tableGroupConfig.values': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                if (vl.length > 1) {
                    let item = this.tableGroupConfig.values[1];
                    this.listRowsForGroup.push(item);
                    this.tableGroupConfig.values.splice(1, 1);
                }
            }
        },
        'tableGroupConfig.rows': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                if (vl.length > 2) {
                    let item = this.tableGroupConfig.rows[2];
                    this.listRowsForGroup.push(item);
                    this.tableGroupConfig.rows.splice(2, 1);
                }
            }
        }
    },
    computed: {
        editorStore() {
            return this.$store.state.document.editor[this.instance];
        }
    },
    data() {
        return {
            matchingItems: {},
            listRows: [],
            listRowsForGroup: [],
            listRowsForPivot: [],
            isShowTableSetting: false,
            prefixName: '',
            tab: null,
            items: [
                this.$t('v2.doc.generalSetting'),
                'Group table',
                this.$t('v2.doc.automaticDeletion'),
                'Matching item'
            ],
            tablePivotConfig: { rows: [], cols: [], values: [] },
            tableGroupConfig: {
                rows: [],
                cols: [],
                values: [],
                showGroupName: false
            },
            isSetDrag: false,
            headers: [
                {
                    text: this.$t('v2.doc.columnInfor'),
                    align: 'start',
                    value: 'columnName'
                },
                { text: this.$t('v2.doc.controlType'), value: 'type' },
                { text: this.$t('v2.doc.controlName'), value: 'name' },
                { text: this.$t('v2.doc.controlTitle'), value: 'title' },
                { text: '', value: '' }
            ],
            listControlName: [],
            listOperator: ['>', '>=', '<', '<=', '=', '!='],
            listItemDeleteConfig: []
        };
    },
    methods: {
        /*
         * Hàm clear các cột trong list cột khi đã được cấu hình vào columns or values or rows
         */
        clearDefaultData(vl) {
            for (let key in vl) {
                for (let i = 0; i < vl[key].length; i++) {
                    let item = vl[key][i];
                    let itemDefault = this.listRowsForGroup.find(
                        (el) => el.name == item.name
                    );
                    if (itemDefault) {
                        let index = this.listRowsForGroup.indexOf(itemDefault);
                        this.listRowsForGroup.splice(index, 1);
                    }
                }
            }
        },
        deleteItem(type, index, item) {
            this.tablePivotConfig[type].splice(index, 1);
            for (let i = 0; i < this.listRows.length; i++) {
                let control = this.listRows[i];
                if (control.key == item.key) {
                    this.listRows[i].disable = false;
                    break;
                }
            }
        },
        /**
         * Hàm tự đông generate tên cho control
         */
        autoGenerateName() {
            for (let index = 0; index < this.listRows.length; index++) {
                let rowData = this.listRows[index];
                let engText =
                    this.prefixName +
                    '_' +
                    str.nonAccentVietnamese(rowData.columnName);
                this.listRows[index].name = engText;
            }
        },
        setListRow(listRows) {
            this.listRows = listRows;
            this.listRowsForGroup = util.cloneDeep(listRows);
            this.listRowsForPivot = util.cloneDeep(listRows);
            this.listRowsForPivot = this.listRowsForPivot.reduce((arr, obj) => {
                arr.push({ name: obj.name, title: obj.title, type: obj.type });
                return arr;
            }, []);
            this.listRowsForGroup = this.listRowsForGroup.reduce((arr, obj) => {
                arr.push({ name: obj.name, title: obj.title, type: obj.type });
                return arr;
            }, []);
            this.listControlName = [];
            for (let index = 0; index < listRows.length; index++) {
                const element = listRows[index];
                this.listControlName.push({
                    name: element.name,
                    title: element.columnName
                });
            }
        },
        showDialog() {
            this.tablePivotConfig = { rows: [], cols: [], values: [] };
            this.isShowTableSetting = true;
        },
        hideDialog() {
            if (this.$refs.matchingItems) {
                this.$emit('show-matching-item-dialog', true);
            } else {
                this.isShowTableSetting = false;
            }
        },
        confirmExitMatchingItems() {
            this.matchingItems = util.cloneDeep(this.dataMatchingItems);
            this.$refs.matchingItems.refreshData();
            this.isShowTableSetting = false;
        },
        addNewRow() {
            this.listRows.push({
                columnName: '',
                name: '',
                type: '',
                title: '',
                key: 's-control-id' + Date.now()
            });
        },
        removeRow(row) {
            this.listRows.splice(
                this.listRows.findIndex((v) => v.key === row.key),
                1
            );
        },

        //call lại sự kiện cho editor để them cột vào control bảng
        saveTable() {
            this.filterRowNotExistType();
            if (this.listRows.length > 0) {
                let dataEmit = { listRows: this.listRows };
                if (
                    this.tablePivotConfig.rows.length > 0 ||
                    this.tablePivotConfig.cols.length > 0 ||
                    this.tablePivotConfig.values.length > 0
                ) {
                    dataEmit['tablePivotConfig'] = this.tablePivotConfig;
                }
                if (
                    this.tableGroupConfig.rows.length > 0 ||
                    this.tableGroupConfig.cols.length > 0
                ) {
                    dataEmit['tableGroupConfig'] = this.tableGroupConfig;
                }
                if (this.listItemDeleteConfig.length > 0) {
                    dataEmit['listItemDeleteConfig'] =
                        this.listItemDeleteConfig;
                }
                if (this.$refs.matchingItems) {
                    if (this.$refs.matchingItems.disableStep1) {
                        this.$snotifyError(
                            '',
                            this.$t('v2.doc.cannotSave') +
                                this.$refs.matchingItems.disableStep1
                        );
                        return;
                    }
                    dataEmit['matchingItemsConfig'] = util.cloneDeep(
                        this.$refs.matchingItems.matchingItemsData
                    );
                }
                this.$emit('after-save-config-table', dataEmit);
            }
            this.listRows = [];
            // this.hideDialog();
            this.isShowTableSetting = false;
        },
        // hàm nào chưa set type thì xóa khỏi list
        filterRowNotExistType() {
            this.listRows = this.listRows.filter((row) => {
                return row.type != '';
            });
        },
        addNewItemDeleteConfig() {
            this.listItemDeleteConfig.push({
                controlName: '',
                operator: '',
                value: ''
            });
        },
        afterConfigDeleteRowClick(item) {
            this.listItemDeleteConfig.splice(
                this.listItemDeleteConfig.indexOf(item),
                1
            );
        },
        saveMatchingItem() {}
    }
};
</script>
<style scoped>
.prefix-name-control {
    padding: 4px 8px;
    background: var(--symper-background-default);
    border-radius: 4px;
}
.s-tabs >>> .v-slide-group__wrapper .v-tab {
    font-size: 12px;
    margin-left: 0 !important;
}
.s-tabs >>> .v-slide-group__wrapper {
    height: 30px;
}
.s-tabs {
    height: 30px;
}
.s-card-title {
    padding-top: 8px !important;
}
.setting-pivot {
    display: flex;
}
.detail-pivot-setting {
    width: calc(100% - 300px);
    height: 425px;
}
.group-config {
    width: calc(100% - 300px);
}
.list-columns {
    font-size: 13px;
}
.column-item,
.column-value-item,
.column-col-item,
.column-row-item {
    cursor: pointer;
    padding: 2px 8px;
    margin: 2px 0;
    border: var(--symper-border);
    border-radius: 4px;
}
.detail-pivot-setting__rows,
.detail-pivot-setting__cols,
.detail-pivot-setting__values {
    height: 100%;
    padding: 4px;
    font-size: 13px;
}
.detail-pivot-setting .s-scroll {
    height: 130px;
    border: var(--symper-border);
    margin: 4px;
    border-radius: 4px;
}
.group-config .s-scroll {
    height: 200px;
    border: var(--symper-border);
    margin: 4px;
    border-radius: 4px;
}
.s-title {
    font-size: 12px;
    font-weight: 500;
    margin-left: 8px;
}
.column-row-item,
.column-col-item,
.column-value-item {
    position: relative;
}
.mdi-close {
    position: absolute;
    right: 0;
    padding: 0 6px;
}
.sym-style-input {
    margin: 0 4px;
    width: 200px;
}
label {
    font-size: 11px !important;
}
</style>

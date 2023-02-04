<template>
    <div class="setting-item">
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <div
                    v-on="on"
                    class="fs-13 ml-1 my-1"
                    :class="{ 'font-weight-bold': highLightTitle }"
                >
                    {{ settingItem.name }}
                </div>
            </template>
            <span>{{
                settingItem.tooltip
                    ? settingItem.tooltip
                    : $t('v2.dashboard.dragToConfig') + settingItem.name
            }}</span>
        </v-tooltip>
        <div class="setting-sub-items">
            <draggable
                group="drop-column"
                :list="settingItem.selectedColums"
                @add="onAddColumn"
                @change="handleChangeColumn"
                class="dragArea list-group"
            >
                <div
                    class="draggable-setting-item d-flex"
                    v-for="(subItem, idx) in settingItem.selectedColums"
                    :key="idx"
                >
                    <div
                        :class="getClassForSelectedColumn(settingItem)"
                        :style="{
                            width: showSelectAxisType(settingItem)
                                ? '85% '
                                : '100%'
                        }"
                        :ref="'wrap' + subItem.name"
                    >
                        <span
                            class="column d-flex flex-grow-1"
                            style="width: calc(100% - 35px)"
                            :style="
                                prependIcons[subItem.name]
                                    ? 'align-items: center'
                                    : ''
                            "
                        >
                            <v-menu top offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <span
                                        :title="
                                            settingTplAgg[subItem.type][
                                                subItem.agg
                                            ].name
                                        "
                                        :ref="'agg' + subItem.name"
                                        v-if="settingItem.hasAgg"
                                        class="agg-func-name"
                                        :class="{
                                            'dont-agg-func-name':
                                                subItem.agg == 'not_agg'
                                        }"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <template
                                            v-if="prependIcons[subItem.name]"
                                        >
                                            <i
                                                style="
                                                    font-size: 17px;
                                                    margin-right: 2px;
                                                "
                                                :class="
                                                    prependIcons[subItem.name]
                                                "
                                            >
                                            </i
                                        ></template>
                                        {{ subItem.agg }}
                                    </span>
                                    <span v-else>
                                        <template
                                            v-if="prependIcons[subItem.name]"
                                        >
                                            <i
                                                style="
                                                    font-size: 17px;
                                                    margin-right: 2px;
                                                "
                                                :class="
                                                    prependIcons[subItem.name]
                                                "
                                            >
                                            </i
                                        ></template>
                                    </span>
                                </template>
                                <v-list>
                                    <v-list-item
                                        v-for="(
                                            action, actName
                                        ) in settingTplAgg[subItem.type]"
                                        :key="actName"
                                        class="list-item-on-menu"
                                        @click="
                                            handleAction({
                                                subItem: subItem,
                                                agg: actName
                                            })
                                        "
                                    >
                                        <v-list-item-title>
                                            {{ action.name }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                            <v-tooltip
                                bottom
                                :key="subItemKey"
                                :style="
                                    prependIcons[subItem.name]
                                        ? 'align-items: center'
                                        : ''
                                "
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-icon
                                        class="ml-1"
                                        small
                                        color="yellow"
                                        v-if="
                                            subItem.menuOptions &&
                                            subItem.menuOptions.defaultColumn &&
                                            subItem.menuOptions.defaultColumn
                                                .value
                                        "
                                    >
                                        mdi-star
                                    </v-icon>
                                    <span
                                        class="column-item-label"
                                        :ref="'cln-label' + subItem.name"
                                        v-show="!subItem.edit"
                                        v-bind="attrs"
                                        @dblclick="
                                            handleAction({
                                                subItem: subItem,
                                                agg: 'rename'
                                            })
                                        "
                                        v-on="on"
                                    >
                                        {{ subItem.as }}
                                    </span>
                                    <template v-if="settingItem.name == 'Rows'">
                                        <i
                                            style="
                                                font-size: 17px;
                                                margin-right: 2px;
                                            "
                                            :class="prependIcons[subItem.name]"
                                        >
                                        </i
                                    ></template>
                                </template>
                                <span>
                                    {{ $t('common.dblclick') }} : <br />
                                    {{
                                        subItem.name + ' - ' + subItem.as
                                    }}</span
                                >
                            </v-tooltip>
                            <input
                                class="rename-column-editor w-100"
                                :ref="'edt' + subItem.name"
                                @keyup.tab="renameColumn(subItem)"
                                @keyup.enter="renameColumn(subItem)"
                                @blur="renameColumn(subItem)"
                                v-model="subItem.as"
                                type="text"
                                v-show="subItem.edit"
                            />
                        </span>
                        <v-tooltip
                            bottom
                            z-index="200"
                            v-if="
                                !availableColumns.includes(
                                    subItem.dataset + '_' + subItem.name
                                )
                            "
                        >
                            <template v-slot:activator="{ on }">
                                <v-icon v-on="on" small color="red">
                                    mdi-information-outline
                                </v-icon>
                            </template>
                            <span>{{
                                $t('v2.dashboard.datasetIsDeleted')
                            }}</span>
                        </v-tooltip>
                        <v-tooltip
                            bottom
                            z-index="200"
                            v-if="
                                subItem.agg == 'not_agg' &&
                                subItem.menuOptions &&
                                subItem.menuOptions.independentLegend &&
                                subItem.menuOptions.independentLegend.value
                            "
                        >
                            <template v-slot:activator="{ on }">
                                <v-icon v-on="on" small color="red">
                                    mdi-information-outline
                                </v-icon>
                            </template>
                            <span>{{
                                $t('v2.dashboard.selectOperatorForColumn')
                            }}</span>
                        </v-tooltip>
                        <v-icon
                            @click="removeColumn(idx)"
                            v-if="!isView"
                            style="margin-right: 4px"
                            class="icon-remove"
                            small
                        >
                            mdi-close
                        </v-icon>
                        <v-menu v-if="subItem.menuOptions" bottom offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <v-icon
                                    v-bind="attrs"
                                    class="mr-1"
                                    small
                                    @click="setCurrentSubItem(subItem)"
                                    v-on="on"
                                    >mdi-dots-horizontal</v-icon
                                >
                            </template>
                            <MenuTpl
                                :allMenuItems="subItem.menuOptions"
                                :selectingSubItem="selectingSubItem"
                                :instanceKey="instanceKey"
                                :reportId="selectedCell.sharedConfigs.cellId"
                                :key="menuTplKey"
                            />
                        </v-menu>
                    </div>
                    <v-menu
                        v-if="showSelectAxisType(settingItem)"
                        bottom
                        offset-y
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                v-bind="attrs"
                                class="icon-show-sery-type ml-2"
                                small
                                v-on="on"
                                >{{ getClassForSeryType(subItem) }}</v-icon
                            >
                        </template>
                        <v-list>
                            <v-list-item
                                v-for="(item, i) in seryTypes"
                                :key="i"
                                class="list-item-on-menu"
                                @click="
                                    handleChangeSeryType({
                                        subItem: subItem,
                                        type: i
                                    })
                                "
                            >
                                <v-list-item-title>
                                    <v-icon small>
                                        {{ item.icon }}
                                    </v-icon>
                                    {{ item.title }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
            </draggable>
            <div style="opacity: 0.5" class="fs-13 ml-2">
                {{ $t('common.inputAddPlaceholder') }}
            </div>
        </div>
    </div>
</template>
<script>
import { util } from '@/plugins/util.js';
import MenuTpl from '@/components/common/MenuTpl';
import _isEmpty from 'lodash/isEmpty';
let seryTypeIcons = {
    line: 'mdi-chart-line',
    area: 'mdi-chart-scatter-plot',
    column: 'mdi-chart-box-outline',
    bar: 'mdi-chart-timeline'
};
export default {
    components: {
        MenuTpl
    },
    props: {
        settingItem: {
            default() {
                return {};
            }
        },
        settingTplAgg: {
            default() {
                return {};
            }
        },
        instanceKey: {
            default: ''
        },
        highLightTitle: {
            type: Boolean,
            default: true
        },
        isView: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            prependIcons: {},
            selectingSubItem: null,
            menuTplKey: 0,
            subItemKey: 0,
            seryTypes: {
                line: {
                    title: this.$t('v2.dashboard.line'),
                    icon: 'mdi-chart-line'
                },
                area: {
                    title: this.$t('v2.dashboard.area'),
                    icon: 'mdi-chart-scatter-plot'
                },
                column: {
                    title: this.$t('v2.dashboard.column'),
                    icon: 'mdi-chart-box-outline'
                },
                bar: {
                    title: this.$t('v2.dashboard.bar'),
                    icon: 'mdi-chart-timeline'
                }
            },
            aggForLastLine: [
                {
                    value: 'sum',
                    label: this.$t('v2.dashboard.sum')
                },
                {
                    value: 'none',
                    label: this.$t('v2.dashboard.none')
                },
                {
                    value: 'avg',
                    label: this.$t('v2.dashboard.average')
                },
                {
                    value: 'min',
                    label: this.$t('v2.dashboard.min')
                },
                {
                    value: 'max',
                    label: this.$t('v2.dashboard.max')
                },
                {
                    value: 'max',
                    label: this.$t('v2.dashboard.max')
                }
            ],
            columnLabelWidth: {}
        };
    },
    created() {
        let self = this;
        for (let col of this.settingItem.selectedColums) {
            this.prependIcons[col.name] = col.prependIcon;
        }
        this.$evtBus.$on('dashboard-compute-prepend-icons', () => {
            for (let col of self.settingItem.selectedColums) {
                let name = col.name;
                this.$set(this.prependIcons, name, col.prependIcon);
            }
        });
        this.$evtBus.$on('dashboard-setting-item-options-clicked', (data) => {
            self.subItemKey = Date.now();
        });
    },
    computed: {
        selectedCell() {
            return this.$store.state.dashboard.allDashboard[this.instanceKey]
                .currentCellConfigs;
        },
        availableColumns() {
            let allColumns = [];
            let allDatasetColumns =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .allDatasetColumns;
            if (Object.keys(allDatasetColumns).length > 0) {
                for (let i in allDatasetColumns) {
                    if (allDatasetColumns[i].columns) {
                        allDatasetColumns[i].columns.forEach(function (e) {
                            allColumns.push(i + '_' + e.name);
                        });
                    }
                }
            }
            return allColumns;
        }
    },
    methods: {
        onAddColumn(newIndex, el) {
            for (let col of this.settingItem.selectedColums) {
                if (col.newClonedColumn) {
                    col.newClonedColumn = false;
                    col.agg = 'not_agg';
                    if (this.settingItem.menuOptions) {
                        let cloneMenuOption = util.cloneDeep(
                            this.settingItem.menuOptions
                        );
                        delete cloneMenuOption.groupBy;
                        if (!_isEmpty(cloneMenuOption)) {
                            this.$set(col, 'menuOptions', cloneMenuOption);
                        }
                    }
                }
            }
        },
        changeColumnSetting(type = 'data') {
            // this.$evtBus.$emit('bi-report-change-columnConfig');
            this.$evtBus.$emit('bi-report-change-display', {
                type: type,
                id: this.selectedCell.sharedConfigs.cellId,
                instanceKey: this.instanceKey,
                fromSetting: true
            });
        },
        changeLastLineColumnAgg(item) {
            let agg = item.agg;
            let column = item.column;
            this.$set(column, 'lastLineAgg', agg.value);
            this.changeColumnSetting('style');
        },
        checkColumnExist(column) {
            return true;
        },
        showAddYAxis() {
            let last = this.settingItem.lastYaxis;
            let rsl = last && 'Y Axis ' + last == this.settingItem.name;
            if (rsl) {
                this.lastYaxisNo = last;
            }
            return rsl;
        },
        getClassForSeryType(column) {
            let iconType = seryTypeIcons['line'];
            if (column.seryType) {
                iconType = seryTypeIcons[column.seryType];
            }
            return iconType;
        },
        handleChangeSeryType(command) {
            this.$set(command.subItem, 'seryType', command.type);
            this.changeColumnSetting('style');
        },
        setCurrentSubItem(item) {
            this.menuTplKey = Date.now();
            this.selectingSubItem = item;
        },
        handleAction(command) {
            let name = command.subItem.name;
            let refs = this.$refs;
            if (command.agg == 'rename') {
                command.subItem.edit = true;
                this.onEditColumn = command.subItem;
                setTimeout(
                    function (refs, name) {
                        refs['edt' + name][0].focus();
                    },
                    100,
                    refs,
                    name
                );
            } else {
                command.subItem.agg = command.agg;
                this.changeColumnSetting('data');
            }
        },
        renameColumn(subItem) {
            this.onEditColumn.edit = false;
            subItem.as = subItem.as.trim().replace(/\s+/, ' ');
            this.changeColumnSetting('data');
        },
        removeColumn(idx) {
            this.settingItem.selectedColums.splice(idx, 1);
            this.$evtBus.$emit(
                'bi-report-change-columnConfig',
                this.instanceKey,
                this.selectedCell.sharedConfigs.cellId
            );
            this.changeColumnSetting('data');
        },
        handleChangeColumn(evt) {
            this.$evtBus.$emit(
                'bi-report-change-columnConfig',
                this.instanceKey,
                this.selectedCell.sharedConfigs.cellId
            );
            setTimeout(
                (self) => {
                    self.changeColumnSetting('data');
                },
                0,
                this
            );
        },
        getClassForSelectedColumn(settingItem) {
            return 'column-item-setting d-flex align-center';
        },
        showSelectAxisType(settingItem) {
            if (
                this.selectedCell.sharedConfigs.type.includes('lineAnd') &&
                settingItem.name.includes(this.$t('v2.dashboard.yAxis'))
            ) {
                return true;
            }
            return false;
        }
    }
};
</script>
<style scoped>
.setting-item >>> .v-input__control {
    min-height: unset !important;
}
.setting-item >>> .v-input__slot {
    box-shadow: unset !important;
    border: 1px solid lightgray !important;
    font-size: 13px !important;
    min-height: unset !important;
}
.setting-item >>> .rename-column-editor .v-input__slot {
    margin-bottom: unset;
}
.setting-item >>> .v-text-field__details {
    display: none !important;
}
.config-settings .setting-item .title {
    padding: 0px 8px;
    font-size: 13px !important;
}
.icon-show-sery-type {
    /* margin-top: -36px !important; */
}
.setting-sub-items {
    margin: -4px 5px 5px 5px;
    padding: 5px 5px;
    border: 1px dashed #eaeaea;
    border-radius: 5px;
}

input.el-input__inner.search-item {
    height: 21px;
    line-height: 21px;
    padding: 0px 10px;
}

.draggable-setting-item .column-item-setting {
    color: #6d6d6d;
    padding: 5px 2px 5px 7px;
    border-radius: 3px;
    background-color: #efefef;
    font-size: 12px;
    cursor: move;
    margin-bottom: 5px;
}

.remove-column {
    padding: 3px;
    position: relative;
    cursor: pointer;
}
.remove-column:hover {
    color: red;
    font-weight: 900;
}
.agg-func-name {
    display: flex;
    align-items: center;
    color: #f58634;
    padding-right: 5px;
    font-size: 10px;
    font-weight: bold;
}
.dont-agg-func-name {
    color: #1976d2 !important;
    padding-right: 5px;
    font-size: 10px;
    font-weight: bold;
}

.rename-column-editor {
    border: none;
    font-size: inherit;
}
.add-more-y-axis:hover {
    color: #409eff;
    border-color: 1px solid #409eff;
    background-color: #ecf5ff;
}
.add-more-y-axis {
    margin: 0px 6px;
    padding: 4px;
    width: calc(100% - 12px);
    color: #c0c4cc;
    background: inherit;
    border: none;
}

.column-item-axis-type .agg-func-name {
    position: relative;
}
.column-item-axis-type {
    /* display: inline-block!important; */
    width: calc(100% - 30px) !important;
    padding-bottom: 0px !important;
}

.y-axis-type:hover {
    background-color: #eaeaea;
}

.y-axis-type {
    border-radius: 4px;
    float: right;
    display: inline-block;
}

.y-axis-type-select-icon {
    padding: 3px;
    cursor: pointer;
    border: 1px solid #c2c2c2;
    border-radius: 3px;
}

.column-item-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    position: relative;
    top: 2px;
}
</style>
<style>
.list-item-on-menu {
    min-height: unset !important;
    padding: 8px 12px !important;
    margin: -6px 2px;
}
.list-item-on-menu .v-list-item__title {
    font-size: 13px !important;
}
</style>

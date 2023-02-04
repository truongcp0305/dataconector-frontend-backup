<template>
    <v-navigation-drawer
        v-model="tableDisplayConfig.show"
        v-show="tableDisplayConfig.show"
        absolute
        class="pa-2 pl-4 list-item-dislay-config overflow-hidden"
        right
        :style="{ width: tableDisplayConfig.width + 'px', 'z-index': '3' }"
    >
        <div>
            <v-icon
                small
                class="close-btn float-right"
                @click="handlerCloseClick"
            >
                mdi-close
            </v-icon>
        </div>
        <v-tabs v-model="tab" color="orange" style="flex-grow: 0">
            <v-tab href="#tab-1" class="tab">
                <span small>{{ $t('common.format_table') }}</span>
            </v-tab>
            <v-tab href="#tab-2" class="tab">
                <span small>TreeView</span>
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab" style="flex-grow: 1" class="h-100 mt-2">
            <v-tab-item
                :key="1"
                :value="'tab-' + 1"
                class="tab-item h-100"
                style="flex-grow: 1"
            >
                <ConditionalFormatting
                    :isConfigCard="true"
                    @change-format="changeFormat"
                    :rowData="rowData"
                    :conditionalFormat="conditionalFormat"
                    :tableColumns="fieldCards"
                    :allControlInDoc="customTableColumnForConfigFormat"
                    @change-apply="changeApply"
                    @save="saveConditionalFormatting"
                    :headerPrefixKeypath="headerPrefixKeypath"
                    :shareConditionalFormat="shareConditionalFormat"
                    :listSharedConditionalFormat="listSharedConditionalFormat"
                    :listSelectedCondition="listSelectedCondition"
                />
            </v-tab-item>
            <v-tab-item
                :key="2"
                :value="'tab-' + 2"
                class="tab-item h-100"
                style="flex-grow: 1"
            >
                <TableGroupConfig
                    :showTitleTree="false"
                    :showFlat="false"
                    :tableColumns="customTableColumnForConfigGroup"
                    :headerPrefixKeypath="headerPrefixKeypath"
                    :configs="typeViewConfigs"
                    @edit-tree-item="handleEditTreeItem"
                    @change-type-view="handleChangeTypeView"
                    @save-config-type-view="handleSaveConfigTypeView"
                    :shareTreeConfig="shareTreeConfig"
                />
            </v-tab-item>
        </v-tabs-items>
    </v-navigation-drawer>
</template>

<script>
import ConditionalFormatting from '@/components/common/listItemComponents/ConditionalFormatting';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import TableGroupConfig from '@/components/common/listItemComponents/TableGroupConfig';
import { util } from '@/plugins/util';
export default {
    components: {
        ConditionalFormatting,
        TableGroupConfig,
        VuePerfectScrollbar
    },
    data() {
        return {
            tab: null,
            savingConfigs: false,
            tableColumnsClone: []
        };
    },
    props: {
        listSelectedCondition: {
            type: Array,
            default() {
                return [];
            }
        },
        conditionalFormat: {
            type: Array,
            default() {
                return [];
            }
        },
        rowData: {
            type: Array,
            default() {
                return [];
            }
        },
        tableDisplayConfig: {
            type: Object,
            default() {
                return {};
            }
        },
        typeViewConfigs: {
            type: [Object, Array],
            default() {
                return {
                    tableType: 'treeView',
                    selectedTree: null,
                    treeData: []
                };
            }
        },
        showActionPanelInDisplayConfig: {
            type: Boolean,
            default: true
        },
        tableColumns: {
            type: Array,
            default() {
                return [];
            }
        },
        fieldCards: {
            type: Array,
            default() {
                return [];
            }
        },
        containerHeight: {
            type: Number,
            default() {
                return 0;
            }
        },
        headerPrefixKeypath: {
            type: String,
            default: ''
        },
        showGroupScheduler: {
            type: Boolean,
            default: false
        },
        listSharedConditionalFormat: {
            type: Array,
            default() {
                return [];
            }
        },
        shareTreeConfig: {
            type: Boolean,
            default: false
        },
        shareConditionalFormat: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        changeFormat(data) {
            this.$emit('change-format', data);
        },
        changeApply(data) {
            this.$emit('change-apply', data);
        },
        saveConditionalFormatting(data) {
            this.$emit('save-conditional-formatting', data);
        },
        handlerCloseClick() {
            this.tableDisplayConfig.show = false;
            this.tab = 'tab-1';
            this.$emit('re-render');
        },
        handleChangeTypeView(data) {
            this.$emit('change-type-view', data);
        },
        handleSaveConfigTypeView(configs, action) {
            this.$emit('save-config-type-view', configs, action);
        },
        handleEditTreeItem(item) {
            this.$emit('edit-tree-item', item);
        }
    },
    computed: {
        customTableColumnForConfigFormat() {
            let listColumn = util.cloneDeep(this.tableColumns);
            listColumn.map((column) => {
                column.name = column.headerName;
                if (column.cellStyle) {
                    delete column.cellStyle;
                }
            });
            listColumn = listColumn.filter(
                (col) => col.field != 'checkboxColumn'
            );
            return listColumn;
        },
        customTableColumnForConfigGroup() {
            let listColumn = util.cloneDeep(this.tableColumns);
            listColumn = listColumn.filter(
                (col) => col.field != 'document_object_id'
            );
            listColumn.map((column) => {
                if (column.cellStyle) {
                    delete column.cellStyle;
                }
            });
            return listColumn;
        }
    }
};
</script>

<style>
.column-drag-pos {
    border: 1px solid lightgray;
    padding-left: 2px;
}
.v-label {
    font-size: 13px !important;
    color: black !important;
}
</style>
<style scoped>
.list-item-dislay-config >>> .v-tabs-bar {
    height: 30px !important;
}
.list-item-dislay-config >>> .v-tab {
    min-width: unset;
    text-transform: none;
    padding: 0 !important;
    margin-right: 14px;
    margin-left: 0 !important;
}
.list-item-dislay-config >>> .v-navigation-drawer__content {
    overflow: hidden;
}
</style>

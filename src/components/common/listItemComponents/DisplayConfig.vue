<template>
    <v-navigation-drawer
        v-model="tableDisplayConfig.show"
        v-show="tableDisplayConfig.show"
        absolute
        class="pa-2 pl-4 list-item-dislay-config overflow-hidden"
        right
        :style="{ width: tableDisplayConfig.width + 'px', 'z-index': '200' }"
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
                <span small>{{ $t('common.setting') }}</span>
            </v-tab>
            <v-tab href="#tab-2" class="tab">
                <span small>{{ $t('common.format_table') }}</span>
            </v-tab>
            <v-tab href="#tab-3" class="tab">
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
                <div class="title">
                    <div
                        class="pb-2 justify-space-between d-flex mt-2"
                        v-if="showActionPanelInDisplayConfig"
                    >
                        <div class="subtitle-2">
                            {{ $t('common.always_show_sidebar') }}
                        </div>
                        <v-switch
                            style="height: 25px"
                            v-model="tableDisplayConfig.value.alwaysShowSidebar"
                            class="float-right pt-0 mt-0"
                        ></v-switch>
                    </div>
                    <div class="pb-2">
                        <div class="subtitle-2">
                            {{ $t('table.wrap_text_mode') }}
                        </div>
                        <div>
                            <v-btn-toggle
                                dense
                                v-model="tableDisplayConfig.value.wrapTextMode"
                                mandatory
                                tile
                                color="amber darken-4"
                                group
                            >
                                <v-btn small>{{
                                    $t('table.wrap_tex_mode.wrap')
                                }}</v-btn>
                                <v-btn small>{{
                                    $t('table.wrap_tex_mode.clip')
                                }}</v-btn>
                            </v-btn-toggle>
                        </div>
                    </div>
                    <div class="pb-2">
                        <div class="subtitle-2">
                            {{ $t('table.display_density') }}
                        </div>
                        <div>
                            <v-btn-toggle
                                dense
                                v-model="tableDisplayConfig.value.densityMode"
                                mandatory
                                tile
                                color="amber darken-4"
                                group
                            >
                                <v-btn small>{{
                                    $t('table.display_density_mode.loosen')
                                }}</v-btn>
                                <v-btn small>{{
                                    $t('table.display_density_mode.medium')
                                }}</v-btn>
                                <v-btn small>{{
                                    $t('table.display_density_mode.compact')
                                }}</v-btn>
                            </v-btn-toggle>
                        </div>
                    </div>
                </div>
                <div class="w-100">
                    <v-btn
                        :loading="savingConfigs"
                        small
                        color="success"
                        @click="saveTableDisplayConfig()"
                        class="float-right"
                    >
                        {{ $t('common.save') }}
                    </v-btn>
                </div>
            </v-tab-item>
            <v-tab-item
                :key="2"
                :value="'tab-' + 2"
                class="tab-item h-100"
                style="flex-grow: 1"
            >
                <ConditionalFormatting
                    @change-format="changeFormat"
                    :rowData="rowData"
                    :conditionalFormat="conditionalFormat"
                    :tableColumns="tableColumns"
                    @change-apply="changeApply"
                    @save="saveConditionalFormatting"
                    :headerPrefixKeypath="headerPrefixKeypath"
                    :shareConditionalFormat="shareConditionalFormat"
                    :listSharedConditionalFormat="listSharedConditionalFormat"
                    :listSelectedCondition="listSelectedCondition"
                />
            </v-tab-item>
            <v-tab-item
                :key="3"
                :value="'tab-' + 3"
                class="tab-item h-100"
                style="flex-grow: 1"
            >
                <TableGroupConfig
                    :instanceKey="instanceKey"
                    :tableColumns="tableColumns"
                    :productList="productList"
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
import draggable from 'vuedraggable';
import ConditionalFormatting from './ConditionalFormatting';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import TableGroupConfig from '@/components/common/listItemComponents/TableGroupConfig';
export default {
    components: {
        draggable,
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
    computed: {},
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
            type: Object,
            default() {
                return {};
            }
        },
        showActionPanelInDisplayConfig: {
            type: Boolean,
            default: true
        },
        productList: {
            type: Boolean,
            default: true
        },
        tableColumns: {
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
        instanceKey: {
            type: [Number, String]
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
        saveTableDisplayConfig() {
            this.$emit('save-list-display-config');
        },
        handlerCloseClick() {
            this.tableDisplayConfig.show = false;
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
    }
};
</script>

<style>
.column-drag-pos[draggable='true'] {
    background-color: #ffe6d2;
}
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

<template>
    <div class="d-flex flex-column table-group-config h-100">
        <div style="height: calc(100% - 80px) !important">
            <div class="d-flex">
                <span class="flex-grow-1 fs-13">
                    {{ $t('table.flat') }}
                </span>
                <v-switch
                    v-model="configs.tableType"
                    value="flat"
                    :color="'var(--symper-color)'"
                    inset
                ></v-switch>
            </div>
            <div class="d-flex" v-if="productList" v-show="false">
                <span class="flex-grow-1">
                    {{ $t('table.product_list') }}
                </span>
                <v-switch
                    v-model="configs.productList"
                    :color="'var(--symper-color)'"
                    inset
                ></v-switch>
            </div>
            <!-- <hr v-if="showTitleTree" /> -->
            <div class="d-flex">
                <span class="flex-grow-1 fs-13">
                    {{ $t('table.tree_view.name') }}
                </span>
                <v-switch
                    v-model="configs.tableType"
                    value="treeview"
                    :color="'var(--symper-color)'"
                    inset
                ></v-switch>
            </div>

            <div
                v-if="configs.tableType == 'treeview'"
                class="d-flex flex-column treeview-config mx-1 px-1 mb-2 w-100"
            >
                <div class="my-treeview">
                    <v-radio-group
                        v-model="configs.selectedTree"
                        style="margin-top: 0 !important"
                    >
                        <span
                            class="fs-13 mb-2 fw-500"
                            style="color: #959595"
                            >{{ $t('v2.showlist.myConfig') }}</span
                        >
                        <v-radio
                            v-for="(item, i) in configs.treeData"
                            :key="item.key"
                            :value="item.key"
                            :color="'var(--symper-color)'"
                            class="ml-2"
                        >
                            <template v-slot:label>
                                <div class="d-flex w-100">
                                    <span class="flex-grow-1">
                                        {{ item.title }}
                                    </span>
                                    <v-menu
                                        offset-y
                                        nudge-left="0"
                                        nudge-top="0"
                                        :close-on-content-click="false"
                                    >
                                        <template
                                            v-slot:activator="{ on: menu }"
                                        >
                                            <v-tooltip bottom>
                                                <template
                                                    v-slot:activator="{ on }"
                                                >
                                                    <v-icon
                                                        class="icon-setting"
                                                        v-on="{
                                                            ...on,
                                                            ...menu
                                                        }"
                                                        @click.prevent.stop
                                                        small
                                                        >mdi-cog-outline</v-icon
                                                    >
                                                </template>
                                                <span>{{
                                                    $t(
                                                        'v2.showlist.setting'
                                                    )
                                                }}</span>
                                            </v-tooltip>
                                        </template>
                                        <v-list
                                            dense
                                            style="padding: 12px 4px !important"
                                        >
                                            <v-list-item
                                                class="action-treeview"
                                                @click="
                                                    updateTreeConfig(
                                                        item,
                                                        i,
                                                        'edit'
                                                    )
                                                "
                                            >
                                                <span class="fs-13">
                                                    {{ $t('common.update') }}
                                                </span>
                                            </v-list-item>
                                            <v-list-item
                                                class="action-treeview"
                                                @click="
                                                    clickShareTreeConfig(
                                                        i,
                                                        true
                                                    )
                                                "
                                                v-if="
                                                    shareTreeConfig &&
                                                    !item.isShare
                                                "
                                            >
                                                <span class="fs-13">
                                                    {{ $t('common.share') }}
                                                </span>
                                            </v-list-item>
                                            <v-list-item
                                                class="action-treeview"
                                                @click="
                                                    clickShareTreeConfig(
                                                        i,
                                                        false
                                                    )
                                                "
                                                v-else-if="
                                                    shareTreeConfig &&
                                                    item.isShare
                                                "
                                            >
                                                <span class="fs-13">
                                                    {{ $t('common.unShare') }}
                                                </span>
                                            </v-list-item>
                                            <v-list-item
                                                class="action-treeview"
                                                @click="
                                                    updateTreeConfig(
                                                        item,
                                                        i,
                                                        'view'
                                                    )
                                                "
                                            >
                                                <span class="fs-13">
                                                    {{ $t('common.view') }}
                                                </span>
                                            </v-list-item>
                                            <v-list-item
                                                class="action-treeview"
                                                @click="removeTreeConfig(i)"
                                            >
                                                <span class="fs-13">
                                                    {{ $t('common.delete') }}
                                                </span>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </div>
                            </template>
                        </v-radio>

                        <span
                            class="fs-13 mb-2 fw-500"
                            style="color: #959595"
                            >{{ $t('v2.showlist.sharedConfig') }}</span
                        >
                        <v-radio
                            v-for="(item, i) in configs.shareTree"
                            :key="item.key"
                            :value="item.key"
                            :color="'var(--symper-color)'"
                            class="ml-2"
                        >
                            <template v-slot:label>
                                <div class="d-flex w-100">
                                    <span class="flex-grow-1">
                                        {{ item.title }}
                                    </span>

                                    <v-menu
                                        offset-y
                                        nudge-left="0"
                                        nudge-top="0"
                                        :close-on-content-click="false"
                                    >
                                        <template
                                            v-slot:activator="{ on: menu }"
                                        >
                                            <v-tooltip bottom>
                                                <template
                                                    v-slot:activator="{ on }"
                                                >
                                                    <v-icon
                                                        class="icon-setting"
                                                        v-on="{
                                                            ...on,
                                                            ...menu
                                                        }"
                                                        @click.prevent.stop
                                                        small
                                                        >mdi-cog-outline</v-icon
                                                    >
                                                </template>
                                                <span>{{
                                                    $t(
                                                        'v2.showlist.setting'
                                                    )
                                                }}</span>
                                            </v-tooltip>
                                        </template>
                                        <v-list
                                            dense
                                            style="padding: 12px 4px !important"
                                        >
                                            <v-list-item
                                                class="action-treeview"
                                                @click="
                                                    updateTreeConfig(
                                                        item,
                                                        i,
                                                        'view'
                                                    )
                                                "
                                            >
                                                <span class="fs-13">
                                                    {{ $t('common.view') }}
                                                </span>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </div>
                            </template>
                        </v-radio>
                    </v-radio-group>
                </div>
            </div>
        </div>
        <div
            class="d-flex justify-center"
            v-if="configs.tableType == 'treeview'"
        >
            <v-btn small @click="addTreeview" class="mr-4 add-tree-view fw-400">
                {{ $t('table.tree_view.add_config') }}
            </v-btn>
        </div>
        <!-- <div class="d-flex flex-row-reverse mt-1">
            <v-btn small color="success" @click="saveTypeViewConfig">
                {{ $t('common.save') }}
            </v-btn>
        </div> -->
        <v-dialog
            v-model="showDialogConfigTree"
            persistent
            width="500"
            content-class="bg-white overflow-hidden "
        >
            <TreeConfig
                ref="dialogTreeConfig"
                :tableColumns="tableColumns"
                :headerPrefixKeypath="headerPrefixKeypath"
                :item="currentItem"
                @config-item="handleItemConfig"
                :action="action"
                :isViewDialog="true"
                @close-dialog="showDialogConfigTree = false"
            />
        </v-dialog>
        <SymperDialogConfirm
            @confirm="confirmDeleteGroup.confirm()"
            @cancel="confirmDeleteGroup.cancel()"
            :title="confirmDeleteGroup.title"
            :content="confirmDeleteGroup.content"
            :showDialog="confirmDeleteGroup.show"
        />
    </div>
</template>

<script>
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
import TreeConfig from '@/components/common/listItemComponents/TreeConfig';
import { util } from '@/plugins/util.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
export default {
    components: {
        VuePerfectScrollbar,
        TreeConfig,
        SymperDialogConfirm
    },
    props: {
        showTitleTree: {
            type: Boolean,
            default: true
        },
        showFlat: {
            type: Boolean,
            default: true
        },
        productList: {
            type: Boolean
        },
        tableColumns: {
            type: Array,
            default() {
                return {};
            }
        },
        headerPrefixKeypath: {
            type: String,
            default: ''
        },
        configs: {
            type: [Object, Array],
            default() {
                return {
                    tableType: null,
                    selectedTree: null,
                    treeData: [],
                    shareTree: []
                };
            }
        },
        instanceKey: {
            type: [Number, String]
        },
        shareTreeConfig: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            currentItem: {},
            currentItemClone: {},
            action: '',
            confirmDeleteGroup: {
                title: this.$t('v2.showlist.confirmDeleteGroupTitle'),
                content: this.$t('v2.showlist.confirmDeleteGroupContent'),
                cancel() {},
                confirm() {},
                show: false
            },
            showDialogConfigTree: false,
        };
    },
    watch: {
        'configs.tableType'(value) {
            if (!value) {
                this.$set(this.configs, 'tableType', 'flat');
            }
            if (value != 'treeview') {
                this.$evtBus.$emit(
                    'showlist-tree-view-clear-filter',
                    this.instanceKey
                );
            }
            this.$emit('change-type-view', this.configs.tableType);
        },
        'configs.selectedTree'() {
            this.$emit('change-type-view', this.configs.tableType);
        },
        configs: {
            deep: true,
            immediate: true,
            handler: function (data) {
                this.saveTypeViewConfig(data);
            }
        }
    },
    methods: {
        clickShareTreeConfig(i, vl) {
            this.configs.treeData[i].isShare = vl;
            this.action = 'share';
        },
        addTreeview() {
            let length = this.configs.treeData.length + 1;
            let calcTree =
                this.configs.treeData.length == 0
                    ? 1
                    : Number(
                          this.configs.treeData[
                              this.configs.treeData.length - 1
                          ].key.split(':')[1]
                      ) + 1;
            this.currentItem = {
                title: this.$t('v2.showlist.treeview') + length,
                key: 'treeview:' + calcTree,
                isShare: false,
                children: [
                    {
                        title: this.$t('v2.showlist.level1'),
                        value: {}
                    }
                ]
            };
            this.action = 'create';
            this.showDialogConfigTree = true
        },
        removeTreeConfig(index) {
            this.confirmDeleteGroup.show = true;
            this.confirmDeleteGroup.confirm = () => {
                this.confirmDeleteGroup.show = false;
                this.confirmRemoveTreeConfig(index);
            };
            this.confirmDeleteGroup.cancel = () => {
                this.cancelRemoveTreeConfig();
            };
        },
        cancelRemoveTreeConfig() {
            this.confirmDeleteGroup.show = false;
        },
        confirmRemoveTreeConfig(index) {
            if (this.configs.treeData[index].key == this.configs.selectedTree) {
                this.configs.selectedTree = '';
                this.$emit('edit-tree-item');
            }
            this.configs.treeData.splice(index, 1);
        },
        updateTreeConfig(data, index, action) {
            this.currentIndex = index;
            this.currentItem = util.cloneDeep(data);
            this.action = action;
            this.showDialogConfigTree = true
        },
        checkDuplicateName(action) {
            let check = false;
            let findDuplicateName = this.configs.treeData.filter(
                (t, tIdx) =>
                    t.title == this.currentItem.title &&
                    tIdx != this.currentIndex
            );
            if (findDuplicateName.length > 0) check = true;
            return check;
        },
        handleItemConfig(item, action) {
            let checkDuplicateName = this.checkDuplicateName(action);
            if (!checkDuplicateName) {
                this.showDialogConfigTree = false
                if (action == 'create') {
                    this.configs.treeData.push(item);
                } else {
                    this.$set(this.configs.treeData, this.currentIndex, item);
                    if (item.key == this.configs.selectedTree) {
                        this.$emit('edit-tree-item', item);
                    }
                }
            } else {
                this.$snotifyError(
                    '',
                    this.$t('v2.showlist.groupNameExisted')
                );
            }
        },
        saveTypeViewConfig(data) {
            this.$emit('save-config-type-view', data, this.action);
            this.action = '';
        }
    }
};
</script>

<style>
.add-new-tree {
    border-bottom: 1px solid #ffffff;
    cursor: pointer;
}
.add-new-tree:hover {
    color: blue;
    border-bottom: 1px solid blue;
}
.tree-item-action:hover {
    cursor: pointer;
    color: #f58634;
}
</style>
<style scoped>
.table-group-config >>> .v-list {
    overflow: unset !important;
}
.table-group-config >>> .v-btn--contained {
    box-shadow: unset !important;
}
.table-group-config >>> .v-messages {
    display: none !important;
}
.table-group-config >>> .v-input--selection-controls {
    margin-top: 12px !important;
    padding-top: unset !important;
}
.table-group-config >>> .action-treeview {
    cursor: pointer !important;
}
.table-group-config >>> .add-tree-view {
    background: rgb(251, 126, 0, 0.9) !important;
    color: white !important;
    width: 50% !important;
}
.table-group-config >>> .add-tree-view:hover {
    background: rgba(251, 126, 0, 1) !important;
}
.table-group-config >>> .v-input--switch--inset .v-input--switch__track,
.v-input--switch--inset .v-input--selection-controls__input {
    width: 36px !important;
}
.table-group-config >>> .v-input--switch__thumb {
    width: 14px !important;
    height: 14px !important;
    top: calc(50% - 9px) !important;
}
.table-group-config >>> .v-input--switch--inset .v-input--switch__track {
    height: 18px !important;
    top: calc(50% - 11px) !important;
    left: -2px;
}
.table-group-config >>> .v-icon.v-icon::after {
    border-radius: 4px !important;
}
.table-group-config >>> .v-icon.v-icon {
    border-radius: 4px !important;
}
.table-group-config >>> .mdi:before,
.mdi-set {
    padding: 1px !important;
}
.table-group-config
    >>> .v-application--is-ltr
    .v-input--switch
    .v-input--selection-controls__ripple {
    left: -17px !important;
}
.table-group-config >>> .v-input--switch .v-input--selection-controls__ripple {
    top: calc(50% - 26px) !important;
}
.table-group-config >>> .icon-setting {
    margin-bottom: 3px !important;
    margin-right: 22px !important;
}
.table-group-config >>> .v-input--switch.v-input--switch--inset {
    margin-top: 18px !important;
}
.table-group-config >>> .v-input--selection-controls__ripple:before {
    content: none;
}

.table-group-config >>> .v-input--is-dirty .v-input--selection-controls__ripple,
.table-group-config >>> .v-input--is-dirty .v-input--switch__thumb {
    transform: translate(18px, 0) !important;
}
.table-group-config
    >>> .v-input.theme--light.v-input--selection-controls.v-input--switch.v-input--switch--inset {
    margin-top: 0 !important;
}
.table-group-config >>> .v-input--selection-controls__ripple {
    left: -30px !important;
}
</style>

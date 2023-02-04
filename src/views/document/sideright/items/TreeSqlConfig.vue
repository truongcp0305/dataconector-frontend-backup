<template>
    <div>
        <v-treeview
            dense
            open-all
            :items="treeData"
            :class="{
                'tree-view': true,
                'mb-2': true,
                'tree-view-doc': !customCss,
                'tree-view-custom': customCss
            }"
            ref="tree"
            style="overflow: hidden; padding-bottom: 8px"
        >
            <template v-slot:append="{ item }">
                <div v-if="!item.condition" class="tree-item-slot">
                    <InputComponent
                        v-model="item.column"
                        :listColumn="
                            isDoubleAutocomplete ? dataLeft : listColumn
                        "
                        :item="item"
                        :itemValue="itemValue"
                        :customAutocomplete="customAutocomplete"
                        :showSubTitle="showSubTitle"
                        :typeShow="isDoubleAutocomplete ? 'name' : 'columnName'"
                        :typeInput="typeInputLeft"
                        @change-input="
                            (data) => {
                                checkType(
                                    data,
                                    item.id,
                                    'column',
                                    treeData[0].children,
                                    typeInputLeft
                                );
                            }
                        "
                        @change="onChangeConfig"
                        :disabled="disabled"
                    />

                    <v-autocomplete
                        v-if="!hideCondition"
                        :disabled="disabled"
                        :style="{
                            'min-width': '40px!important'
                        }"
                        :items="listOperator"
                        @change="onChangeConfig"
                        class="
                            tree__list-operations
                            ml-1
                            mr-1
                            symper-small-autocomplete
                            symper-small-autocomplete-input
                        "
                        item-text="title"
                        v-model="item.operator"
                        :title="item.operator"
                        dense
                        solo
                    >
                    </v-autocomplete>

                    <InputComponent
                        v-if="isDoubleAutocomplete"
                        v-model="item.columnRight"
                        :listColumn="dataRight"
                        :item="item"
                        :customAutocomplete="customAutocomplete"
                        :showSubTitle="showSubTitle"
                        :typeShow="'name'"
                        :typeInput="typeInputRight"
                        :disabled="disabled"
                        @change-input="
                            (data) => {
                                checkType(
                                    data,
                                    item.id,
                                    'columnRight',
                                    treeData[0].children,
                                    typeInputRight
                                );
                            }
                        "
                        @change="onChangeConfig"
                    />
                    <div v-else>
                        <input
                            :disabled="disabled"
                            v-if="!hideCondition"
                            v-model="item.value"
                            @change="onChangeConfig"
                            class="symper-tree-input-value"
                            :style="{ color: disabled ? 'lightgrey' : 'black' }"
                        />
                        <v-icon
                            v-if="!hideCondition && !hideFormula"
                            class="icon-function"
                            @click="showScriptEditor(item)"
                        >
                            mdi-function-variant</v-icon
                        >
                    </div>
                    <i
                        v-show="!disabled"
                        class="
                            mdi mdi-close
                            fs-16
                            btn-delete-item-condition
                            ml-1
                            cursor-pointer
                        "
                        @click="deleteConditionItem(item)"
                    ></i>
                </div>
                <div v-else type="text" class="list-action-treesql">
                    <v-btn
                        v-show="!disabled"
                        light
                        icon
                        style="height: 28px; width: 28px"
                        v-if="!item.root"
                        @click="deleteCondition(item)"
                    >
                        <v-icon style="font-size: 16px"> mdi-close</v-icon>
                    </v-btn>
                    <v-btn
                        :disabled="disabled"
                        light
                        icon
                        style="height: 28px; width: 28px"
                        @click="swapCondition(item)"
                    >
                        <v-icon style="font-size: 16px"
                            >mdi mdi-swap-vertical-bold</v-icon
                        >
                    </v-btn>

                    <v-menu
                        bottom
                        left
                        offset-y
                        transition="slide-y-transition"
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
                                :disabled="disabled"
                                light
                                icon
                                v-on="on"
                                style="height: 28px; width: 28px"
                            >
                                <v-icon style="font-size: 16px"
                                    >mdi mdi-plus</v-icon
                                >
                            </v-btn>
                        </template>

                        <v-list>
                            <v-list-item
                                v-for="(node, i) in allNode"
                                :key="i"
                                style="cursor: pointer; min-height: 25px"
                                @click="addNode(node, item, i)"
                            >
                                <v-list-item-title style="font-size: 13px">{{
                                    node.title
                                }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
            </template>
        </v-treeview>
        <SymperDragPanel
            ref="symDragPanel"
            :dragPanelWidth="dragPanelWidth"
            :dragPanelHeight="450"
            :topPosition="100"
            :leftPosition="500"
            :actionTitle="''"
            :titleIcon="''"
            :styleBody="{ 'overflow-y': 'scroll', width: '100%' }"
            @before-close="closeEditor"
        >
            <template slot="panel-action">
                <v-icon
                    v-if="isDebugMode && !isShowDebugMode"
                    @click="showDebugMode"
                    >mdi-bug-outline</v-icon
                >
                <v-icon v-if="isShowDebugMode" @click="debug"
                    >mdi-play-outline</v-icon
                >
            </template>
            <template slot="drag-panel-content">
                <!-- @blur="handleEditor" -->
                <!-- <submitDocument :isQickSubmit="true" :docId="340" v-if="!isQickSubmit"/> -->
                <FormulaEditor
                    v-model="editorValue"
                    ref="edtFormula"
                    :width="'100%'"
                    :height="'200px'"
                ></FormulaEditor>
            </template>
        </SymperDragPanel>
    </div>
</template>

<script>
import ColumnInfo from '@/components/common/bi/ColumnInfo';
import FormulaEditor from '@/components/formula/editor/FormulaEditor';
import SymperDragPanel from '@/components/common/SymperDragPanel.vue';
import InputComponent from '@/views/document/sideright/items/InputComponent';

export default {
    computed: {
        listOperator() {
            return this.customOperand.length > 0
                ? this.customOperand
                : [
                      '>',
                      '>=',
                      '<',
                      '<=',
                      '=',
                      '!=',
                      '<>',
                      '!>',
                      '!<',
                      'ILIKE',
                      'isblank',
                      'notblank',
                      'in',
                      'notin'
                  ];
        }
    },
    props: {
        listColumn: {
            type: Array
        },
        defaultData: {
            type: Array
        },
        customAutocomplete: {
            type: Boolean,
            default: false
        },
        itemValue: {
            type: String,
            default: 'name'
        },
        customCss: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            defautl: false
        },
        hideCondition: {
            type: Boolean,
            default: false
        },
        showSubTitle: {
            type: Boolean,
            default: false
        },
        isDoubleAutocomplete: {
            type: Boolean,
            default: false
        },
        typeInputLeft: {
            type: String,
            default: 'autocomplete'
        },
        typeInputRight: {
            type: String,
            default: 'autocomplete'
        },
        dataRight: {
            type: Array
        },
        dataLeft: {
            type: Array
        },
        hideFormula: {
            type: Boolean,
            default: false
        },
        customOperand: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    watch: {
        editorValue() {
            let parentId = this.currentItem.parent;
            let parentNode = this.bfs(this.treeData, parentId);
            for (let i = 0; i < parentNode.children.length; i++) {
                if (parentNode.children[i].id == this.currentItem.id) {
                    this.$set(
                        parentNode.children[i],
                        'value',
                        this.editorValue
                    );
                    console.log(this.editorValue);
                }
            }
        },
        defaultData: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                if (vl) {
                    this.treeData = null;
                    this.treeData = vl;
                }
            }
        }
    },
    created() {
        this.treeData = null;
        this.treeData = this.defaultData;
    },
    data() {
        return {
            editorValue: '',
            currentItem: '',
            dragPanelHeight: 400,
            dragPanelWidth: 500,
            currentRow: '',
            isLoading: false,
            isDebugMode: true,
            isShowDebugMode: false,
            treeData: [
                {
                    id: 1,
                    nodeType: 'group',
                    name: 'AND',
                    root: true,
                    condition: true,
                    children: []
                }
            ],
            mapIcon: {
                text: 'mdi-text-box-outline',
                number: 'mdi-format-list-numbered',
                date: 'mdi-clock-time-five-outline'
            },
            allNode: [
                { title: this.$t('v2.dataflow.item'), type: 'item' },
                { title: this.$t('v2.dataflow.group'), type: 'group' }
            ]
        };
    },
    components: {
        ColumnInfo,
        FormulaEditor,
        SymperDragPanel,
        InputComponent
    },
    methods: {
        showDebugMode() {
            this.isShowDebugMode = true;
            this.dragPanelWidth = 900;
            this.dragPanelHeight = 700;
            this.$refs.edtFormula.toggleDebugView();
        },
        hideDebugMode() {
            this.isShowDebugMode = false;
            this.dragPanelWidth = 500;
            this.dragPanelHeight = 400;
            this.$refs.edtFormula.toggleDebugView();
        },
        debug() {
            this.$refs.edtFormula.executeFormulas();
        },
        closeEditor() {
            if (this.isShowDebugMode) {
                this.hideDebugMode();
            }
            this.$refs.symDragPanel.hide();
            this.$emit('close-script-editor');
        },
        showScriptEditor(params) {
            // this.currentRow = params;
            this.$refs.symDragPanel.show();
            this.editorValue = params.value;
            this.currentItem = params;
            this.$emit('show-script-editor');
        },
        addNode(node, item, i) {
            if (node.type == 'item') {
                item.children.push({
                    id: Date.now(),
                    condition: false,
                    name: '',
                    parent: item.id,
                    formulas: '',
                    nodeType: 'item',
                    operator: '='
                });
            } else {
                item.children.push({
                    id: Date.now(),
                    condition: true,
                    name: 'AND',
                    parent: item.id,
                    children: [],
                    nodeType: 'group'
                });
            }
            this.$emit('change-config', {});
        },
        setValueForNode() {},
        /**
         * Thay đổi điều kiện
         */
        swapCondition(item) {
            let value = item.name == 'OR' ? 'AND' : 'OR';
            this.$set(item, 'name', value);
            this.onChangeConfig();
        },
        /**
         * Hàm xóa 1 điều kiện con trong 1 node
         */
        deleteConditionItem(item) {
            this.deleteCondition(item);
        },
        /**
         * Xóa node
         */
        deleteCondition(item) {
            this.$emit('change-config', {});
            let parentId = item.parent;
            let parentNode = this.bfs(this.treeData, parentId);
            for (let i = 0; i < parentNode.children.length; i++) {
                if (parentNode.children[i].id == item.id) {
                    parentNode.children.splice(i, 1);
                }
            }
        },

        bfs(tree, id) {
            var queue = [];
            queue.push(tree[0]);
            while (queue.length !== 0) {
                for (let i = 0; i < queue.length; i++) {
                    var node = queue.shift();
                    if (node.id === id) {
                        return node;
                    }
                    if (node.children) {
                        queue = queue.concat(node.children);
                    }
                }
            }
            return null;
        },
        /**
         * Hàm lấy công thức từ tree validate
         */

        getData(item) {
            let where = '';
            if (!this.isDoubleAutocomplete) {
                let name = item.name;
                let children = item.children;
                if (children.length == 0) {
                    where = 'true';
                } else if (children.length == 1) {
                    let value = children[0].value
                        ? "'" + children[0].value + "'"
                        : "''";
                    where =
                        '(' +
                        children[0].column +
                        ' ' +
                        children[0].operator +
                        ' ' +
                        value +
                        ')';
                } else {
                    for (let index = 0; index < children.length; index++) {
                        const childItem = children[index];
                        let childSql = '';
                        if (childItem.condition) {
                            childSql = '(' + this.getData(childItem) + ')';
                        } else {
                            if (childItem.column && childItem.operator) {
                                let childValue = childItem.value
                                    ? "'" + childItem.value + "'"
                                    : "''";
                                childSql =
                                    '(' +
                                    childItem.column +
                                    ' ' +
                                    childItem.operator +
                                    ' ' +
                                    childValue +
                                    ')';
                            } else {
                                childSql = 'true';
                            }
                        }
                        if (index == children.length - 1) {
                            where += childSql;
                        } else {
                            where += childSql + ' ' + name + ' ';
                        }
                    }
                }
            } else {
                let name = item.name;
                let children = item.children;
                if (children.length == 0) {
                    where = 'true';
                } else if (children.length == 1) {
                    where =
                        '(' +
                        children[0].column +
                        ' ' +
                        children[0].operator +
                        ' ' +
                        children[0].columnRight +
                        ')';
                } else {
                    for (let index = 0; index < children.length; index++) {
                        const childItem = children[index];
                        let childSql = '';
                        if (childItem.condition) {
                            childSql = '(' + this.getData(childItem) + ')';
                        } else {
                            if (childItem.column && childItem.operator) {
                                let childValue = childItem.value
                                    ? "'" + childItem.value + "'"
                                    : "''";
                                childSql =
                                    '(' +
                                    childItem.column +
                                    ' ' +
                                    childItem.operator +
                                    ' ' +
                                    childValue +
                                    ')';
                            } else {
                                childSql = 'true';
                            }
                        }
                        if (index == children.length - 1) {
                            where += childSql;
                        } else {
                            where += childSql + ' ' + name + ' ';
                        }
                    }
                }
            }
            return where;
        },
        getDataChildRen(children, data, currentCondition) {
            let dataCondition = '';
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                if (child.condition) {
                    if (child.children.length > 0) {
                        this.getDataChildRen(child.children, dataCondition);
                    }
                } else {
                    dataCondition += child.formulas + ' ' + currentCondition;
                }
            }
        },
        getTreeData() {
            let where = this.getData(this.treeData[0]);
            return { where: where, treeData: this.treeData };
        },
        onChangeConfig(position = '', dataCol) {
            if (typeof dataCol == 'string') {
            }
            let where = this.getData(this.treeData[0], position);
            this.$emit('change-config', {
                where: where,
                treeData: this.treeData
            });
        },
        checkType(value, id, position, treeData, typeInput) {
            for (let key in treeData) {
                if (
                    treeData[key].nodeType == 'item' &&
                    treeData[key].id == id
                ) {
                    if (typeof value != 'object' && typeInput == 'combobox') {
                        treeData[key][position] = {
                            title: value
                        };
                        break;
                    } else {
                        treeData[key][position] = value;
                        break;
                    }
                } else if (
                    treeData[key].nodeType == 'group' &&
                    treeData[key].children.length > 0
                ) {
                    this.checkType(value, id, position, treeData[key].children);
                }
            }
        }
    }
};
</script>

<style scoped>
.fs-11 {
    font-size: 11px;
}
.v-list-item {
    min-height: unset !important;
    padding: 4px 12px;
}
.v-list-item .v-list-item__title {
    font: 11px !important;
}
.tree-view-doc >>> .v-treeview-node__level {
    display: none;
}
.tree-view-doc >>> .v-treeview-node__root {
    margin-bottom: 4px !important;
    padding-left: 0px !important;
    padding-right: 0px !important;
}
.v-treeview >>> .v-treeview-node__root {
    padding-left: 0px !important;
    padding-right: 0px !important;
}
.tree-view >>> .v-treeview-node__label:hover .list-action-treesql {
    opacity: 1;
}
.tree-view >>> .v-treeview-node__label {
    font-size: 13px !important;
    color: orange !important;
}
.list-action-treesql {
    opacity: 1;
    /* opacity:0; */
}
.list-action-treesql:hover {
    opacity: 1;
}
.tree-view >>> .v-treeview-node__label {
    flex: unset;
}
.tree-view >>> .v-text-field__details {
    display: none;
}
.tree-view >>> .tree-item-slot {
    display: flex;
    margin-top: -8px;
}
.tree-view-custom >>> .tree-item-slot {
    margin-bottom: -14px;
}
.tree-view-custom ::v-deep .v-treeview-node__children {
    /* height: 170px; */
}
.tree-view >>> .tree-item-slot .v-input {
    margin: unset;
}
.tree-view >>> .tree-item-slot .v-input__control {
    min-height: unset !important;
}
.tree-view >>> .tree-item-slot .v-input__control .v-input__slot {
    height: 25px;
    font-size: 11px;
    box-shadow: unset !important;
    border: 1px solid lightgray;
}
.tree__list-columns >>> .v-input__icon,
.tree__list-operations >>> .v-input__icon {
    display: none;
}

.tree__list-columns >>> .v-input__slot {
    width: 130px !important;
}
.tree__list-columns {
    margin-left: -7px !important;
}
.tree__list-operations {
    width: 70px;
}
.tree-view-doc ::v-deep .v-treeview-node__root {
    padding-right: 0 !important;
}
.tree-view-doc
    ::v-deep
    .v-treeview-node__children
    > .v-treeview-node:not(.v-treeview-node--leaf) {
    border: var(--symper-border);
    margin: 0px 2px 8px 12px;
}

.tree-view-doc
    ::v-deep
    .v-treeview-node__children
    > .v-treeview-node:not(.v-treeview-node--leaf)
    .v-treeview-node__root {
    padding-left: 0 !important;
}
.tree-view-doc >>> .v-treeview-node__toggle {
    display: none;
}

.tree-view-custom >>> .v-treeview-node__toggle {
    margin-left: 6px;
    margin-right: -8px;
}
.btn-delete-item-condition {
    opacity: 0;
}
.tree-item-slot:hover .btn-delete-item-condition {
    opacity: 1;
}
.tree-view-custom >>> .v-treeview-node__children {
    margin-left: -4px;
}

.symper-tree-input-value {
    border: 1px solid lightgray;
    border-radius: 4px;
    width: 100%;
    padding-left: 4px;
    padding-right: 4px;
    height: 25px;
    font-size: 12px;
}
.icon-function {
    font-size: 14px;
    margin-left: -20px;
    margin-top: 5px;
    height: 15px;
    background: #fbfbfb !important;
}
.tree-view-doc >>> .v-input__slot {
    background: #fbfbfb !important;
    border: 1px solid #f2f2f2 !important;
}
.v-autocomplete >>> .v-input__slot {
    background: #fbfbfb !important;
}
.symper-tree-input-value {
    background: #fbfbfb !important;
    border: 1px solid #f2f2f2 !important;
}
.condition >>> .v-input__slot {
    width: 305px !important;
}
.tree-view-custom >>> .v-select__selections {
    overflow: hidden;
}
.tree-view-custom >>> .v-autocomplete.v-select.v-input--is-focused input {
    min-width: 100% !important;
}
.tree-view-custom >>> .no-data {
    cursor: pointer;
}
</style>
<style>
.symper-small-autocomplete .v-input__slot {
    padding-left: 4px !important;
    padding-right: 4px !important;
}
</style>
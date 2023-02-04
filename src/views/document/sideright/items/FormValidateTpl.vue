<template>
    <div>
        <v-treeview
            dense
            hoverable
            open-all
            :items="items"
            class="tree-validate"
            style="overflow: hidden; padding-bottom: 8px"
        >
            <template v-slot:append="{ item }">
                <input
                    v-model="item.formulas"
                    v-on:change="handleChangeInput"
                    v-on:focus="openLargeValueEditor($event, item, 'Cong thuc')"
                    class="input-validate"
                    v-if="!item.condition"
                    type="text"
                />
                <div v-else type="text">
                    <v-btn
                        light
                        icon
                        style="height: 28px; width: 28px"
                        v-if="!item.root"
                        @click="deleteCondition(item)"
                    >
                        <v-icon style="font-size: 16px">mdi mdi-close</v-icon>
                    </v-btn>
                    <v-btn
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
                        open-on-hover
                        offset-y
                        transition="slide-y-transition"
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
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
                                v-for="(node, i) in dropAddNode"
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
        <symper-drag-panel
            @before-close="closeLargeFormulaEditor()"
            :showPanel="largeFormulaEditor.open"
            :actionTitle="largeFormulaEditor.data.title"
            :panelData="largeFormulaEditor.data"
        >
            <template slot="drag-panel-content" slot-scope="{ panelData }">
                <formula-editor
                    v-model="panelData.formulas"
                    :formulaValue="panelData.formulas"
                    :width="'100%'"
                    :height="'370px'"
                ></formula-editor>
            </template>
        </symper-drag-panel>
    </div>
</template>
<script>
import SymperDragPanel from './../../../../components/common/SymperDragPanel';
import FormulaEditor from '@/components/formula/editor/FormulaEditor';

export default {
    components: {
        'formula-editor': FormulaEditor,
        'symper-drag-panel': SymperDragPanel,
    },
    props: {
        label: {
            type: String,
            default: '',
        },
    },
    data: () => ({
        items: [
            {
                id: 1,
                name: 'AND',
                root: true,
                condition: true,
                children: [],
            },
        ],
        dropAddNode: [
            { title: 'item', type: 'item' },
            { title: 'group', type: 'group' },
        ],
        largeFormulaEditor: {
            name: '', // tên của input
            open: false, // có mở largeFormulaEditor hay ko
            data: {}, // Dữ liệu của input cần mở lên để edit trong khung lớn,
        },
        currentForcusInput: null,
    }),
    methods: {
        /**
         * Mở drag panel nhập công thức
         */
        openLargeValueEditor(event, inputInfo, name) {
            this.currentForcusInput = inputInfo;
            this.largeFormulaEditor.open = true;
            this.largeFormulaEditor.name = name;
            this.$set(this.largeFormulaEditor, 'data', inputInfo);
        },
        closeLargeFormulaEditor() {
            this.largeFormulaEditor.open = false;
            let info = this.largeFormulaEditor;
            this.currentForcusInput.formulas = info.data.formulas;
            this.largeFormulaEditor.name = '';
        },
        addNode(node, item, i) {
            if (node.type == 'item') {
                item.children.push({
                    id: Date.now(),
                    condition: false,
                    name: '',
                    parent: item.id,
                    formulas: '',
                });
            } else {
                item.children.push({
                    id: Date.now(),
                    condition: true,
                    name: 'AND',
                    parent: item.id,
                    children: [],
                });
            }
        },
        setValueForNode() {},
        /**
         * Thay đổi điều kiện
         */
        swapCondition(item) {
            item.name = item.name == 'OR' ? 'AND' : 'OR';
        },
        /**
         * Xóa node
         */
        deleteCondition(item) {
            let parentId = item.parent;
            let parentNode = this.bfs(this.items, parentId);
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

        getData() {
            console.log(this.items);
            let root = this.items[0];
            let rootCondition = this.items[0].name;
            let firstChildren = this.items[0].children;
            for (let child in firstChildren) {
            }
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
        handleChangeInput() {
            this.getData();
        },
    },
};
</script>

<style scoped>
.input-validate {
    height: 24px;
    background: #f2f2f2;
    border-radius: 4px;
    width: 130px;
    margin-left: -27px !important;
}
</style>
<style>
.tree-validate .v-treeview-node__label {
    flex: unset;
}
</style>

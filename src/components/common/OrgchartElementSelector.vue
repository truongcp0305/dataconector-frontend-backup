<template>
    <div class="orgchart-element-selector" :style="{ height: height }">
        <VuePerfectScrollbar :style="{ height: height }">
            <v-treeview
                v-model="selection"
                class="fs-13"
                activatable
                :items="treeData"
                dense
                selectable
                @input="handleChangeSelectedNode"
                selected-color="#1976d2"
                :disabled="action == 'view' ? true : false"
            >
                <!-- <template v-slot:label="{ item }">
                    <v-checkbox
                        @change="handleChangeSelectedNode(item)"
                        v-if="checkboxMode.includes(item.type)"
                        v-model="item.selected"
                        :label="item.name"
                        dense
                    ></v-checkbox>
                    <span v-else>
                        {{ item.name }}
                    </span>
                </template> -->
            </v-treeview>
        </VuePerfectScrollbar>
    </div>
</template>

<script>
import { util } from '../../plugins/util';
import { orgchartApi } from '@/api/orgchart.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
export default {
    created() {
        this.$store.dispatch('orgchart/getAllOrgchartStruct');
    },
    props: {
        /**
         * Các position (hooặc các department) được lựa chọn, vd: ['orgchart:82:ac-sc-cs','orgchart:82:ac-sc-cs']
         */
        value: {
            type: Array,
            default() {
                return [];
            }
        },
        /**
         * Hiển thị checkbox ở loại node nào trong orgchart: position, department hoặc all (cả hai loại node trên)
         */
        checkboxMode: {
            type: Array,
            default: ['position'] // Hiển thị ô check ở những loại node nào: position, department
        },
        searchKey: {
            type: String,
            default: ''
        },
        height: {
            type: String,
            default: '100%'
        },
        action: {
            type: String,
            default: 'create'
        }
    },
    // watch: {
    //     value: {
    //         deep: true,
    //         immediate: true,
    //         handler(newValue) {
    //             let mapNode = this.$store.state.orgchart.allOrgchartStruct.map;
    //             for (let item of newValue) {
    //                 item = item.slice(11, item.length);
    //                 if (mapNode[item]) {
    //                     mapNode[item].selected = true;
    //                     this.selection.push(mapNode[item].id);
    //                 }
    //             }
    //             this.oldSelection = this.selection;
    //         }
    //     }
    // },
    data() {
        return {
            res: [],
            oldSelection: []
        };
    },
    components: {
        VuePerfectScrollbar
    },
    computed: {
        mapSelectedNode() {
            return this.value.reduce((map, el) => {
                map[el] = true;
                return map;
            }, {});
        },
        selection() {
            let data = [];
            let mapNode = this.$store.state.orgchart.allOrgchartStruct.map;
            for (let item of this.value) {
                item = item.slice(11, item.length);
                if (mapNode[item]) {
                    data.push(mapNode[item].id);
                }
            }
            this.oldSelection = data;
            return data;
        },
        treeData() {
            let tree = this.$store.state.orgchart.allOrgchartStruct.tree;
            for (let key in tree) {
                if (tree[key].children) {
                    this.checkType(tree[key].children);
                }
            }
            if (this.searchKey == '') {
                return tree;
            } else {
                this.res = [];
                let res = this.searchItem(tree, this.searchKey);
                return res;
            }
        }
    },

    methods: {
        checkType(children) {
            let type = this.checkboxMode;
            let key = 0;
            while (key < children.length) {
                if (children[key].type && !type.includes(children[key].type)) {
                    children.splice(key, 1);
                } else {
                    if (children[key].children) {
                        this.checkType(children[key].children);
                    }
                    key++;
                }
            }
        },
        handleChangeSelectedNode(nodeArr) {
            let vl = this.$store.state.orgchart.allOrgchartStruct.map;
            let nodes = [];
            if (this.oldSelection.length < nodeArr.length) {
                for (
                    let key = this.oldSelection.length;
                    key < nodeArr.length;
                    key++
                ) {
                    nodes.push(nodeArr[key]);
                }
            } else {
                this.oldSelection.map((data) => {
                    if (!nodeArr.includes(data)) nodes.push(data);
                });
            }

            for (let i in vl) {
                if (nodes.includes(vl[i].id)) {
                    nodes[nodes.indexOf(vl[i].id)] = vl[i];
                }
            }

            // if (node.selected) {
            //     vl.push(node.identify);
            // } else {
            //     let removeIdx = 0;
            //     for (let i = 0; i < vl.length; i++) {
            //         if (vl[i] == node.identify) {
            //             removeIdx = i;
            //             break;
            //         }
            //     }
            //     vl.splice(removeIdx, 1);
            // }
            this.oldSelection = nodeArr;
            for (let key in nodes) {
                this.$emit('input', vl);
                this.$emit('change-node-selected', nodes[key]);
            }
        },
        searchItem(data, keyWord) {
            let self = this;
            if (data.length > 0) {
                data.forEach(function (e) {
                    if (e.name.toLowerCase().includes(keyWord.toLowerCase())) {
                        if (self.res.includes(e) == false) {
                            self.res.push(e);
                        }
                    }
                    if (e.hasOwnProperty('children')) {
                        self.searchItem(e.children, keyWord);
                    }
                });
            }
            return self.res;
        }
    }
};
</script>

<style scoped>
.orgchart-element-selector >>> .v-treeview-node__label .v-messages {
    display: none;
}
.orgchart-element-selector >>> .v-treeview-node__label .v-input {
    margin-top: unset;
}
.orgchart-element-selector >>> .v-treeview-node__label .v-input__slot label {
    font: 13px roboto;
}
.orgchart-element-selector
    >>> .v-treeview.v-treeview--dense.theme--light
    > .v-treeview-node
    > .v-treeview-node__root
    > .v-treeview-node__checkbox {
    display: none !important;
}
</style>

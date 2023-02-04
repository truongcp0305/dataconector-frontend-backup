<template>
    <div class="w-100 mb-5">
        <div class="w-100">
            <v-menu
                v-for="(item, type) in items"
                :key="type"
                :nudge-top="150"
                :close-on-content-click="false"
            >
                <template v-slot:activator="{ on: menu }">
                    <v-tooltip top>
                        <template v-slot:activator="{ on: tooltip }">
                            <v-btn
                                @click="highlight(type)"
                                x-small
                                text
                                v-on="{ ...menu, ...tooltip }"
                                :class="{
                                    'hight-light':
                                        item.check && item.check != 'color',
                                    'background-orange': item.check == 'color'
                                }"
                                :style="{ color: getColor(item.type) }"
                                :disabled="disabled"
                            >
                                <v-icon size="16" :disabled="disabled">{{
                                    item.icon
                                }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ item.text }}</span>
                    </v-tooltip>
                </template>
                <PickColor
                    v-if="item.type == 'FontColor'"
                    v-model="value.fontColor"
                />
                <PickColor
                    v-if="item.type == 'BackgroundColor'"
                    v-model="value.backgroundColor"
                />
            </v-menu>
        </div>
        <TreeSqlConfig
            class="treeConfig"
            ref="treeConfig"
            @change-config="scrollToBottom"
            :defaultData="treeConfigData"
            :listColumn="tableColumnsForTree"
            :itemValue="'title'"
            :customCss="isConfigCard == true ? true : false"
            :disabled="disabled"
            :hideFormula="true"
        />
    </div>
</template>
<script>
import PickColor from './PickColor';
import TreeSqlConfig from './../../../views/document/sideright/items/TreeSqlConfig';
import { formatOperator } from '@/components/common/conditionalFormat';
export default {
    watch: {},
    components: {
        PickColor,
        TreeSqlConfig
    },
    methods: {
        checkEmtyInputConditional() {
            let check = false;
            let node = this.$refs.treeConfig.treeData[0];
            check = this.checkEmptyValue(node);
            return check;
        },
        checkEmptyValue(node) {
            let check = false;
            if (!node.condition) {
                if (!node.value) {
                    check = true;
                    return check;
                }
            } else if (node.condition) {
                for (let childNode of node.children) {
                    check = this.checkEmptyValue(childNode);
                }
                return check;
            }
        },
        setHightLight() {
            this.items.map((item, idx) => {
                if (this.value[item.type]) {
                    this.items[idx].check = true;
                }
            });
        },
        highlight(actionIdx) {
            const self = this;
            this.items.map((item, i) => {
                if (i == actionIdx && item.check != 'color') {
                    self.items[i].check = !self.items[i].check;
                    self.value[item.type] = item.check;
                }
            });
        },
        getJsScript() {
            this.value.conditionFormat = this.treeItemToJS(
                this.$refs.treeConfig.treeData[0]
            );
            this.value.originCondition = this.$refs.treeConfig.treeData[0];
            this.$emit('change', this.value);
        },
        getHeaderName(nameTable) {
            let headerName = '';
            this.tableColumns.map((t) => {
                if (t.name == nameTable) {
                    headerName = t.headerName;
                }
            });
            return headerName;
        },
        getFieldTb(nameTb) {
            let field = '';
            this.tableColumns.map((t) => {
                if (t.name == nameTb.name) {
                    field = t.field;
                }
            });
            return field;
        },
        // chuyển toán tử về dạng đúng format trong js
        formatOperator(name) {
            return formatOperator(name, this.listOperators);
        },
        // chuyển cây điều kiện sang câu lệnh js
        treeItemToJS(node) {
            if (!node.condition) {
                let field = this.getFieldTb(node.column);
                if (!field) field = 'checkbox';
                let headerName = this.getHeaderName(node.column);
                let conditionName = `e.data.${field}`;
                let column = node.column;
                let value = '"' + node.value + '"';
                let functionName = this.formatOperator(node.operator);
                return ` (${conditionName}${functionName} ${value}) `;
            } else if (node.condition) {
                let arrCond = [];
                for (let childNode of node.children) {
                    let itemCond = this.treeItemToJS(childNode);
                    arrCond.push(itemCond);
                }
                let opr = node.name == 'OR' ? '||' : '&&';
                let cond = arrCond.join(opr);
                return ` (${cond}) `;
            }
        },
        getColor(type) {
            let color = 'black';
            if (type == 'BackgroundColor') {
                color = this.value.backgroundColor;
            }
            if (type == 'FontColor') {
                color = this.value.fontColor;
            }
            return color;
        },
        scrollToBottom() {
            this.$nextTick(function () {
                $('.v-treeview-node__children')[0].scrollTop = $(
                    '.v-treeview-node__children'
                )[0].scrollHeight;
            });
        }
    },
    created() {
        this.tableColumns.map((column, index) => {
            if (index != 0) {
                this.formatTableColumn.push(column);
                this.tableColumnsForTree.push(column);
                if (column.name) {
                    this.tableColumnsForTree[index - 1].title = column.name;
                }
            }
        });
        if (this.isUpdate) {
            let lastTree = [];
            lastTree.push(this.value.originCondition);
            this.treeConfigData = lastTree;
        }
        this.setHightLight();
    },
    props: {
        tableColumns: {
            type: Array,
            default() {
                return [];
            }
        },
        isUpdate: {
            type: Boolean
        },
        value: {
            type: Object,
            default() {
                return {};
            }
        },
        isConfigCard: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            treeData: [],
            // treeConfigData:null,
            treeConfigData: [
                {
                    id: 'root',
                    name: 'AND',
                    root: true,
                    label: 'AND',
                    parent: false,
                    children: [
                        {
                            id: Date.now(),
                            condition: false,
                            name: '',
                            parent: 'root',
                            formulas: '',
                            nodeType: 'item',
                            operator: '='
                        }
                    ],
                    nodeType: 'group',
                    condition: true
                }
            ],
            listOperators: [
                {
                    name: '=',
                    value: '=='
                },
                {
                    name: '<>',
                    value: '!='
                },
                {
                    name: '!>',
                    value: '<='
                }
            ],
            tableColumnsForTree: [],
            formatTableColumn: [],
            items: [
                {
                    check: false,
                    icon: 'mdi-format-italic',
                    text: this.$t('v2.showlist.italic'),
                    type: 'italic'
                },
                {
                    check: false,
                    icon: 'mdi-format-bold',
                    text: this.$t('v2.showlist.bold'),
                    type: 'bold'
                },
                {
                    check: false,
                    icon: 'mdi-format-underline',
                    text: this.$t('v2.showlist.underline'),
                    type: 'underline'
                },
                {
                    check: 'color',
                    icon: 'mdi-format-color-fill',
                    text: this.$t('v2.showlist.backgroundColor'),
                    type: 'BackgroundColor'
                },
                {
                    check: 'color',
                    icon: 'mdi-format-color-text',
                    text: this.$t('v2.showlist.fontColor'),
                    type: 'FontColor'
                }
            ]
        };
    }
};
</script>
<style scoped>
.hight-light {
    background-color: #f5863417;
    color: #f58634 !important;
}
.background-orange {
    background: #f5863417;
}
.treeConfig {
    overflow: scroll;
}
.treeConfig >>> .tree-item-slot {
    margin-top: 10px;
}
.treeConfig >>> .tree__list-columns {
    white-space: nowrap !important;
}
.treeConfig >>> .v-select__selections {
    overflow: hidden;
    max-width: 130px;
}
.treeConfig >>> .v-treeview-node__children {
    overflow: scroll;
    max-height: 61px;
}
</style>

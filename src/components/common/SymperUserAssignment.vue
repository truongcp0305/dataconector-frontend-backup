<template>
    <div class="symper-user-assignment">
        <div
            class="symper-user-assignment-orgchart"
            v-show="activeTab == 'orgchart'"
        >
            <v-combobox
                v-model="value.orgChart"
                :items="allUserAndDepartment"
                :filter="filterItems"
                :hide-no-data="!searchCombo"
                :search-input.sync="searchCombo"
                :item-value="'id'"
                chips
                dense
                flat
                class="select-orgchart"
                multiple
                solo
            >
                <template v-slot:selection="{ attrs, item, select, selected }">
                    <v-chip
                        color="blue-grey lighten-5"
                        close-icon="mdi-close"
                        v-bind="attrs"
                        :input-value="selected"
                        close
                        x-small
                        @click="select"
                        @click:close="removeItem(item)"
                    >
                        <i :class="'mdi  mr-1 ' + itemIconMap[item.type]"></i>
                        {{ item.text }}
                    </v-chip>
                </template>

                <template v-slot:item="{ index, item }">
                    <i
                        style="font-size: 16px"
                        :class="'mdi  mr-1 ' + itemIconMap[item.type]"
                    ></i>
                    <span class="fs-13 py-1">{{ item.text }}</span>
                </template>
            </v-combobox>
        </div>
        <div
            class="symper-user-assignment-script"
            v-show="activeTab == 'script'"
        >
            <formula-editor
                :width="'100%'"
                :height="'80px'"
                ref="formulaEditor"
                v-model="value.formula"
            ></formula-editor>
        </div>
    </div>
</template>

<script>
import FormulaEditor from '@/components/formula/editor/FormulaEditor';

export default {
    data() {
        return {
            searchCombo: null,
            activeTab: 'orgchart',
            itemIconMap: {
                user: 'mdi-account',
                department: 'mdi-office-building',
            },
        };
    },
    props: {
        value: {
            default() {
                return {};
            },
        },
    },
    components: {
        'formula-editor': FormulaEditor,
    },
    computed: {
        allUserAndDepartment() {
            let nodes = [];
            let orgCharts = this.$store.state.app.orgchartNodes;
            for (let id in orgCharts) {
                for (let nodeid in orgCharts[id].children) {
                    let element = orgCharts[id].children[nodeid];
                    nodes.push({
                        text: element.name,
                        id: element.gid,
                        type: 'department',
                    });
                }
            }

            this.$store.state.app.allUsers.forEach((element) => {
                nodes.push({
                    text: element.displayName,
                    id: 'user:' + element.id,
                    type: 'user',
                });
            });
            return nodes;
        },
    },
    methods: {
        getFormulaEditorInstKey() {
            return this.$refs.formulaEditor.instKey;
        },
        autoSetScriptMode() {
            if (this.value.formula.trim()) {
                this.activeTab = 'script';
            }
        },
        setValue(value) {
            this.$refs.formulaEditor.setValue(value.formula);
        },
        removeItem(node) {
            let idx = 0;
            for (let i = 0; i < this.value.orgChart.length; i++) {
                if (this.value.orgChart[i].id == node.id) {
                    idx = i;
                    break;
                }
            }
            this.value.orgChart.splice(idx, 1);
        },
        switchToTab(tab) {
            this.activeTab = tab;
        },
        filterItems(item, queryText, itemText) {
            const hasValue = (val) => (val != null ? val : '');
            const text = item.text;
            const query = hasValue(queryText);
            return (
                text
                    .toString()
                    .toLowerCase()
                    .indexOf(query.toString().toLowerCase()) > -1
            );
        },
    },
    created() {
        this.autoSetScriptMode();
    },
};
</script>

<style>
.symper-user-assignment-orgchart .select-orgchart .v-input__slot {
    padding: 4px 0px 4px 0px !important;
}
</style>

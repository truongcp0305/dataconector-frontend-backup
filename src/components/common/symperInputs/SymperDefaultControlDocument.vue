<template>
    <div>
        <v-list class="pa-0">
            <v-list-item-group v-if="value.length > 0">
                <v-list-item v-for="(item, i) in value" :key="i" class="pa-0">
                    <div class="add-controls">
                        <div style="position: relative">
                            <div style="float: left">
                                <v-icon
                                    @click="removeControl(item)"
                                    style="
                                        float: left;
                                        margin-top: 7px;
                                        margin-left: 15px;
                                    "
                                    small
                                    >mdi-close</v-icon
                                >
                                <v-autocomplete
                                    :items="listControls"
                                    v-model="item.name"
                                    dense
                                    item-text="name"
                                    color="black"
                                    style="
                                        width: 75%;
                                        margin: 0px;
                                        float: left;
                                        padding-left: 9px;
                                    "
                                    @change="handleValueChange"
                                >
                                    <template v-slot:item="data">
                                        <span class="fs-12">{{
                                            data.item.title
                                        }}</span>
                                        <span
                                            class="fs-11 ml-3"
                                            style="color: gray"
                                        >
                                            {{ data.item.name }}
                                        </span>
                                    </template>
                                    <template v-slot:selection="data">
                                        <span
                                            class="fs-12 text-ellipsis"
                                            style="
                                                width: 80%;
                                                display: contents;
                                            "
                                            >{{ data.item.title }}
                                        </span>
                                    </template>
                                </v-autocomplete>
                            </div>

                            <span
                                @click="openLargeValueEditor(item)"
                                style="position: absolute; right: 5px; top: 4px"
                                ><v-icon small>mdi-dock-window</v-icon></span
                            >
                        </div>
                        <div style="clear: both">
                            <formula-editor
                                ref="edtFormula"
                                :width="'100%'"
                                :height="'40px'"
                                v-model="item.value"
                                @change="handleValueChange"
                            ></formula-editor>
                        </div>
                    </div>
                </v-list-item>
            </v-list-item-group>
        </v-list>
        <v-btn class="mt-1" depressed small @click="addControls"> {{$t('v2.doc.add')}} </v-btn>

        <symper-drag-panel
            @before-close="closeLargeFormulaEditor()"
            :showPanel="largeFormulaEditor.open"
            :actionTitle="largeFormulaEditor.data.title"
            :panelData="largeFormulaEditor.data"
            :dragPanelWidth="dragPanelWidth"
            :dragPanelHeight="dragPanelHeight"
            ref="dragPanel"
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
            <template slot="drag-panel-content" slot-scope="{ panelData }">
                <formula-editor
                    @blur="handleLargeFormulaEditorBlur"
                    v-model="panelData.value"
                    ref="edtFormula"
                    :width="'100%'"
                    :height="isShowDebugMode ? '250px' : '365px'"
                    :isDebugView="true"
                    @change="handleValueChange"
                ></formula-editor>
            </template>
        </symper-drag-panel>
    </div>
</template>

<script>
import { documentApi } from '@/api/Document.js';
import FormulaEditor from '@/components/formula/editor/FormulaEditor';
import SymperDragPanel from '@/components/common/SymperDragPanel';

export default {
    components: {
        'formula-editor': FormulaEditor,
        SymperDragPanel,
    },
    data() {
        return {
            propertyDocument: [],
            listTableControlsDocument: [],
            listControls: [],
            largeFormulaEditor: {
                name: '', // tên của input
                open: false, // có mở largeFormulaEditor hay ko
                data: {}, // Dữ liệu của input cần mở lên để edit trong khung lớn,
            },
            dragPanelWidth: 500,
            dragPanelHeight: 400,
            isDebugMode: true,
            isShowDebugMode: false,
        };
    },
    props: {
        docId: {
            default: '',
        },
        value: {
            default() {
                return [];
            },
        },
    },
    watch: {
        docId: {
            deep: true,
            immediate: true,
            handler: function (after, before) {
                this.getControlDocument(after);
            },
        },
    },
    methods: {
        handleValueChange() {
            this.$emit('input', this.value);
        },
        /**
         * hoangnd
         * Hàm mở sang chế độ debug để kiểm tra công thức
         * (syntax, query...)
         */
        showDebugMode() {
            this.isShowDebugMode = true;
            this.dragPanelWidth = 900;
            this.dragPanelHeight = 700;
            this.$refs.edtFormula.toggleDebugView();
        },
        /**
         * hoangnd
         * Ẩn chế độ debug
         */
        hideDebugMode() {
            this.isShowDebugMode = false;
            this.dragPanelWidth = 500;
            this.dragPanelHeight = 400;
            this.$refs.edtFormula.toggleDebugView();
        },
        /**
         * Hàm thực thi query khi ấn debug
         */
        debug() {
            this.$refs.edtFormula.executeFormulas();
        },
        addControls() {
            let item = {};
            item.name = '';
            item.title = '';
            item.value = '';
            this.value.push(item);
            this.handleValueChange();
        },
        removeControl(item) {
            const index = this.value.indexOf(item);
            if (index >= 0) this.value.splice(index, 1);
            this.handleValueChange();
        },
        closeLargeFormulaEditor() {
            if (this.isShowDebugMode) {
                this.hideDebugMode();
            }
            let info = this.largeFormulaEditor;
            setTimeout(
                (self) => {
                    self.largeFormulaEditor.name = '';
                },
                500,
                this,
            );
        },
        handleLargeFormulaEditorBlur() {
            this.hideDragPanel();
            // let name = this.largeFormulaEditor.name;
            // let inputInfo = this.allInputs[name];
            // this.handleInputBlur(inputInfo, name);
        },
        handleInputBlur(inputInfo, name) {
            //this.$emit('input-blur',inputInfo, name);
        },
        openLargeValueEditor(item) {
            let el = this.listControls.find(
                (element) => element.name == item.name,
            );
            if (el) {
                item.title = el.title;
            }
            this.$set(this.largeFormulaEditor, 'data', item);
            this.largeFormulaEditor.name = item.name;
            this.$refs.dragPanel.show();
            this.$refs.edtFormula.onFocus();
        },
        async getControlDocument(docId) {
            const self = this;
            await documentApi
                .detailDocument(docId)
                .then((res) => {
                    if (res.status === 200) {
                        self.propertyDocument = Object.values(res.data.fields);
                        // lưu tên của các property từ API document vào mảng
                        let tableNames = [];
                        let tableTitle = [];
                        for (let i = 0; i < self.propertyDocument.length; i++) {
                            if (this.propertyDocument[i].type === 'table') {
                                tableNames.push(
                                    self.propertyDocument[i].properties.name,
                                );
                                tableTitle.push(
                                    self.propertyDocument[i].properties.title,
                                );
                            }
                        }
                        // khởi tạo mảng lưu các giá trị của table document
                        self.createTable(tableNames, tableTitle);
                    }
                })
                .catch((err) => {
                    console.error('Error get control document', err);
                });
        },
        createTable(tableNames, tableTitle) {
            // general
            let controls = [];
            for (let i = 0; i < this.propertyDocument.length; i++) {
                if (
                    ['submit', 'approvalHistory', 'reset', 'draft'].includes(
                        this.propertyDocument[i].type,
                    )
                ) {
                    continue;
                }
                controls.push({
                    name: this.propertyDocument[i].properties.name,
                    title: this.propertyDocument[i].properties.title,
                    // dataType: this.getDataType(this.propertyDocument[i].type)
                });
            }
            let tables = [
                {
                    controls,
                },
            ];
            // tables
            for (let i = 0; i < tableNames.length; i++) {
                tables.push({
                    title: tableTitle[i],
                    name: tableNames[i],
                    controls: this.findControlsForTable(tableNames[i]),
                });
            }
            this.listTableControlsDocument = tables;
            this.returnListDataControl(tables, tableNames);
        },
        findControlsForTable(nameTable) {
            let controls = [];
            let property = this.propertyDocument.filter(
                (p) => p.listFields && p.properties.name == nameTable,
            );
            for (let i = 0; i < property.length; i++) {
                let list = Object.values(property[i].listFields);
                for (let j = 0; j < list.length; j++) {
                    controls.push({
                        name: list[j].properties.name,
                        title: list[j].properties.title,
                        // dataType: this.getDataType(list[j].type)
                    });
                }
            }
            return controls;
        },
        returnListDataControl(tables, tableNames) {
            this.listControls = [];
            for (let index = 0; index < tables.length; index++) {
                let controls = tables[index].controls;
                if (controls.length > 0) {
                    for (let j = 0; j < controls.length; j++) {
                        let obj = tableNames.find(
                            (element) => element == controls[j].name,
                        );
                        if (!obj) {
                            this.listControls.push(controls[j]);
                        }
                    }
                }
            }
        },
    },
};
</script>

<style scoped>
.add-controls ::v-deep .v-input__slot {
    padding: 0px !important;
    padding-left: 3px !important;
}

.add-controls ::v-deep .v-select__selections {
    display: block;
}
</style>

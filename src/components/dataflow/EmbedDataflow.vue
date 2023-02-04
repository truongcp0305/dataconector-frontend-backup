<template>
    <div
        class="symper-dataflow-embed"
        :style="{
            width: cpnWidth,
            height: isClosePanel ? '34px' : cpnHeight
        }"
    >
        <v-btn icon x-small @click="closeOrOpenPanel" class="expand-panel">
            <v-icon size="15">
                {{ isClosePanel ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
            </v-icon>
        </v-btn>
        <FormTpl
            class="form-input"
            :singleLine="true"
            :labelWidth="'0px'"
            @input-value-changed="handleValueChange"
            :allInputs="allInput"
        />
        <DataflowEditor
            :isAddStencil="false"
            @run-done="handleRunDoneDataflow"
            class="dataflow-editor"
            :hideRunInfoPanel="isClosePanel ? true : false"
            ref="dataflow"
            :action="'view'"
            :viewMode="true"
            :idObject="dataflowId"
            @click-custom-btn="insertDataToControl"
            :customBtn="customBtn"
            :customTitle="controlTitle"
        />
    </div>
</template>

<script>
import FormTpl from '@/components/common/FormTpl.vue';
import DataflowEditor from '@/components/dataflow/DataflowEditor.vue';
export default {
    components: {
        DataflowEditor,
        FormTpl
    },
    props: {
        dataflowId: {
            default: 0
        },
        height: {
            default: '500px'
        },
        width: {
            default: '100%'
        },
        listNodeDataFlow: {
            type: Array,
            default() {
                return [];
            }
        },
        isClosePanel:{
            type: Boolean,
            default:true
        },
        view: {
            default:'submit'
        },
        controlTitle: {
            default: ''
        }
    },
    data() {
        return {
            allInput: {
                dataflow: {
                    height: 24,
                    title: '',
                    dense: true,
                    menuProps: { offsetY: true },
                    type: 'select',
                    value: '',
                    options: this.listNodeDataFlow
                }
            },
            resultRunDataFlow: {}
        };
    },
    watch: {
        listNodeDataFlow: {
            deep: true,
            handler(val) {
                this.allInput.dataflow.options = val;
            }
        }
    },
    created() {
        if (this.listNodeDataFlow.length > 0) {
            this.listNodeDataFlow.map((node) => {
                if (node.isSelected) {
                    this.allInput.dataflow.value = node.value;
                    // this.allInput.dataflow.value = node.text;
                }
            });
        }
    },
    methods: {
        closeOrOpenPanel() {
            this.isClosePanel = !this.isClosePanel;
            if(!this.isClosePanel){
                this.$refs.dataflow.setHeightRunningInfo();
            }
        },
        /**
         * Chạy dataflow với tham số truyền vào là các biến của dataflow đó
         */
        runDataflow(inputData = {}) {
            this.$refs.dataflow.runDataflow(inputData, true);
        },
        selectNodeDataflow(id) {
            this.$refs.dataflow.selectNode(id);
        },
        listenEventsFromIframe() {
            let self = this;
            window.addEventListener('message', function (event) {
                let data = event.data;
                if (data.action == 'insert-data-dataflow-to-control') {
                    self.$emit(
                        'insert-data-dataflow-to-control',
                        data.data ? data.data : {}
                    );
                }
            });
        },
        handleRunDoneDataflow(data) {
            this.resultRunDataFlow = data
        },
        insertDataToControl() {
            this.$emit('insert-data-dataflow-to-control', this.resultRunDataFlow);
        },
        handleValueChange(name, input, data) {
            let title = this.listNodeDataFlow.filter((f) => f.value == data)[0]
                .text;
            this.$emit('handle-value-change', {
                value: data,
                id: this.dataflowId,
                title: title
            });
        }
    },
    mounted() {
        this.listenEventsFromIframe();
        this.$emit('after-mounted')
    },
    computed:{
        customBtn() {
            if(this.view == 'detail'){
                return {
                    icon: 'mdi-checkbox-multiple-marked-outline',
                    name: this.$t('v2.dataflow.recordData'),
                    style: { color: 'white', background: '#FB7E00' },
                    disable: true
                }               
            }else {
                return {
                    icon: 'mdi-checkbox-multiple-marked-outline',
                    name: this.$t('v2.dataflow.recordData'),
                    style: { color: 'white', background: '#FB7E00' }
                }
            }
        },
        cpnWidth() {
            return this.width;
        },
        cpnHeight() {
            return this.height;
        }
    }
};
</script>
<style scoped>
.dataflow-editor >>> .dataflow-sidebar-config {
    display: none;
}
.dataflow-editor >>> .workspace-left-pane {
    width: 100% !important;
}
.dataflow-editor >>> .dataflow-running-info {
    width: 100% !important;
    max-height: 100% !important;
}
.dataflow-editor >>> .btn-run,
.dataflow-editor >>> .btn-edit,
.dataflow-editor >>> .stop-run {
    /* margin-right:40px!important
     */
    display: none !important;
}
.form-input >>> .form-input {
    position: absolute;
    right: 0;
    width: 150px;
    z-index: 10;
    margin-right: 45px;
    padding-top: 2px !important;
}
.insert-data-from-dataflow {
    margin-right: 195px;
    position: absolute;
    right: 0;
    z-index: 10;
    margin-top: 5px;
}
.symper-dataflow-embed >>> .form-input {
    margin-top: 0px!important;
}
.form-input >>> .v-input__control {
    border: 1px solid lightgrey;
}
.form-input >>> .sym-style-input {
    border: none !important;
}
.dataflow-editor >>> .dataflow-toolbar {
    justify-content: flex-end !important;
    padding-right: 40px !important;
}
.dataflow-editor >>> .symper-list-items {
    height: 100px !important;
}
.form-input >>> .v-list-item {
    font-size: 13px !important;
}
.form-input >>> .v-select__selection {
    font-size: 13px !important;
}
.dataflow-editor >>> .selecting-node-name {
    padding-left: 40px !important;
}
.expand-panel {
    float: left !important;
    position: absolute !important;
    left: 11px !important;
    top: 7px !important;
    z-index: 10 !important;
}
.dataflow-editor >>> .tool-bar {
    background: rgba(48, 89, 255, 0.1) !important;
    border-radius: 4px 4px 0px 0px !important;
}
</style>
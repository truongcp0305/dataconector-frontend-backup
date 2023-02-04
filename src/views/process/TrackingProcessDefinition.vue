<template>
    <v-dialog
        v-model="showDialog"
        persistent
        max-width="1000"
        content-class="dialog-call-activity-modeler"
    >
        <div class="w-100" style="height: 570px !important">
            <div
                class="action-diagram-bpmn"
                style="
                    text-align: right;
                    margin-top: 3px;
                    height: 42px;
                    border-bottom: 0.2px solid #777777;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                "
            >
                <span
                    class="fs-13 pl-1"
                    style="
                        float: left;
                        font-size: 15px !important;
                        font-weight: 500;
                    "
                    >{{ dialogName }}</span
                >
                <v-icon class="action-btn" @click="handleClosePopup"
                    >mdi-close</v-icon
                >
            </div>
            <symper-bpmn
                :instanceKey="instanceKey"
                @handle-call-activity-selected="handleCallActivitySelected"
                style="height: 82.3% !important"
                ref="symperBpmn"
                :readOnly="true"
                :diagramXML="diagramXML"
                :customModules="customRender"
            ></symper-bpmn>
            <div style="display: flex; flex-direction: row-reverse">
                <div
                    style="
                        margin-right: 20px;
                        width: 126px;
                        height: 32px;
                        border-radius: 22px;
                        background: rgba(0, 0, 0, 0.6);
                        display: flex;
                        align-content: center;
                        justify-content: space-around;
                    "
                >
                    <v-icon class="action-btn-bottom" @click="handleZoomOut"
                        >mdi-plus-circle-outline</v-icon
                    >
                    <v-icon class="action-btn-bottom" @click="handleZoomIn"
                        >mdi-minus-circle-outline</v-icon
                    >
                    <v-icon class="action-btn-bottom" @click="handleFocus"
                        >mdi-image-filter-center-focus</v-icon
                    >
                </div>
            </div>
        </div>
        <TrackingProcessDefinition
            v-if="derivativeDialog"
            :processDefinitionId="callActivitySelected"
            :showDialog="derivativeDialog"
            @cancel="derivativeDialog = false"
        />
    </v-dialog>
</template>

<script>
import SymperBpmn from './../../components/common/SymperBpmn.vue';
import { defaultXML } from './../../components/process/reformatGetListData';
import bpmneApi from './../../api/BPMNEngine';
import CustomRenderer from '@/components/process/customCanvas/customElements/customRenderer.js';
import customContextPadProvider from '../../components/process/customContextPadForReadOnlyModeler';
export default {
    name: 'TrackingProcessDefinition',
    props: {
        processDefinitionId: {
            type: String,
            default: ''
        },
        showDialog: {
            type: Boolean,
            default: false
        }
    },
    created() {
        let self = this;
        this.$evtBus.$on(
            'show-call-activity-process-instace',
            (instanceKey) => {
                if (instanceKey == this.instanceKey) {
                    self.derivativeDialog = true;
                    $('.modal-diagram').attr('style', 'display:none');
                }
            }
        );
        this.setInstanceXML();
    },
    watch: {
        showDialog(val) {
            if (val) {
                this.setInstanceXML();
            }
        }
    },
    data() {
        return {
            callActivitySelected: '',
            derivativeDialog: false,
            instanceKey: Date.now(),
            diagramXML: defaultXML,
            dialogName: '',
            customRender: [
                {
                    __init__: ['CustomRenderer', 'customContextPad'],
                    CustomRenderer: ['type', CustomRenderer],
                    customContextPad: ['type', customContextPadProvider]
                }
            ],
            runtimeNodeMap: null, // Thông tin chạy của các node trong process instance. có dạng: {idNode : {thông tin}}
            nodeDetailPanel: {
                title: '',
                show: false,
                position: {
                    left: 0,
                    top: 0
                },
                data: {}
            }
        };
    },
    components: {
        'symper-bpmn': SymperBpmn
    },
    computed: {
        stask() {
            return this.$store.state.task;
        }
    },
    methods: {
        handleCallActivitySelected(node, evt) {
            this.callActivitySelected = node.calledElement;
        },
        handleClosePopup() {
            this.$emit('cancel');
        },
        handleFocus() {
            this.$refs.symperBpmn.focus();
        },
        handleZoomIn() {
            this.$refs.symperBpmn.zoomIn();
        },
        handleZoomOut() {
            this.$refs.symperBpmn.zoomOut();
        },
        async setInstanceXML() {
            let res = await bpmneApi.getProcessByProcessKey(
                this.processDefinitionId
            );
            this.dialogName = res.data.name;

            if (res.data.content) {
                this.diagramXML = res.data.content;
            }
            setTimeout(
                (self) => {
                    self.$refs.symperBpmn.focus();
                },
                500,
                this
            );
        }
    }
};
</script>

<style scoped>
.action-diagram-bpmn {
    width: 100%;
    margin-right: 10px;
}
.action-btn {
    cursor: pointer;
    font-size: 20px;
    margin-right: 5px;
}
.symper-bpmn >>> .djs-hit {
    pointer-events: none !important;
}
.action-btn-bottom {
    color: #ffffff !important;
    font-size: 17px !important;
}
</style>
<style>
.dialog-call-activity-modeler {
    z-index: 100000000 !important ;
    background-color: #ffffff !important;
}
</style>

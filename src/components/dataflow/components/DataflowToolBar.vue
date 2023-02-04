<template>
    <div :class="{'w-100 d-flex':true, 'justify-space-between':true}">
        <div
            class="dataflow-tool-bar"
            :style="{
                position: 'absolute',
                bottom: height + 25 + 'px',
                right: isAddStencil?(width + 20 + 'px'):'10px',
                'z-index': 1,
                display: hideRunInfoPanel ? 'none': 'block'
            }"
            :id="isAddStencil "
        >
            <v-tooltip bottom v-for="(item, key) in headerActions" :key="key">
                <template v-slot:activator="{ on }">
                    <v-btn
                        @click="handleHeaderAction(key)"
                        icon
                        small
                        class="ml-2"
                        style="position: relative; top: -1px"
                    >
                        <v-icon size="18" color="#FFFFFF" v-on="on">{{
                            item.icon
                        }}</v-icon>
                    </v-btn>
                </template>
                <span>{{ $t(item.text) }}</span>
            </v-tooltip>
        </div>
        <div :style="{'position': 'relative',
            'left': !isAddStencil ? '48px': '12px', 
            'font-family': 'Roboto',
            'font-style': 'normal',
            'font-size': '13px',
            'color': '#1B1B1B'}
        "
        class="float-left "
        text 
        >
            {{ title }}
        </div>
        <div class="h-100" style="position: relative; top: -1px">
            <v-btn
                :disabled="selectingNode.id == 'home'||isDuplicateName"
                v-if="!disableButtonRun"
                @click="runDataflow"
                color="#F2F2F2"
                small
                depressed
                class="mr-2 btn-run"
            >
            {{$t('v2.dataflow.run')}}
            </v-btn>
            <v-btn
                v-if="disableButtonRun"
                @click="stopRunDataflow"
                color="#F2F2F2"
                small
                depressed
                class="mr-2 stop-run"
            >
            {{$t('v2.dataflow.stopRunning')}}
            </v-btn>
            <v-btn
                color="rgba(97, 196, 84, 1)"
                v-if="action != 'view'"
                @click="saveDataflow"
                :disabled="isDuplicateName"
                depressed
                small
                class="mr-2 btn-fill-white-color"
                :loading="saving"
            >
            {{$t('v2.dataflow.save')}}
            </v-btn>
            <v-btn
                @click="goToEditpage"
                text
                v-if="action == 'view'"
                small
                depressed
                class="mr-2 btn-edit"
            >
                <i class="mdi mdi-lead-pencil mr-1 fs-16"></i>
                {{$t('v2.dataflow.update')}}
            </v-btn>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        saveDataflow() {
            if (this.saving) {
                return;
            }
            this.saving = true;
            this.$emit('save-dataflow');
        },
        restoreSaveBtn() {
            this.saving = false;
        },
        runDataflow() {
            this.$emit('run-dataflow');
        },
        goToEditpage() {
            this.$emit('go-to-edit-page');
        },
        handleHeaderAction(action) {
            this.$emit('action-on-workspace', action);
        },
        stopRunDataflow() {
            this.$emit('stop-run-dataflow');
        }
    },
    data() {
        return {
            saving: false,
            headerActions: {
                zoomOut: {
                    icon: 'mdi-minus-circle-outline',
                    text: 'process.header_bar.zoom_in'
                },
                zoomIn: {
                    icon: 'mdi-plus-circle-outline',
                    text: 'process.header_bar.zoom_out'
                },
                zoomToFit: {
                    icon: 'mdi-image-filter-center-focus',
                    text: 'process.header_bar.focus'
                },
                // saveSVG: {
                //     icon: 'mdi-image-outline',
                //     text: 'process.header_bar.save_svg'
                // }
            }
        };
    },
    computed: {
        getPositionToolbar() {
            return [this.height, this.width];
        },
        selectingNode() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .selectedWidget;
        },
        isDuplicateName(){
            let objDatasetName=this.$store.state.dataflow.allDataflow[this.instanceKey].allWidget.home.datasetNameByNodeId;
            if(objDatasetName){
                let datasetName=Object.keys(objDatasetName)
                let isDuplicateName=false
                datasetName.forEach(name=>{
                    if(objDatasetName[name].length>1){
                        isDuplicateName=true;
                    }
                    
                })
                return isDuplicateName;
            }
            
        }
    },

    props: {
        title:{ 
            default:'',
        },
        isAddStencil: {
            type: Boolean,
            default: true,
        },
        action: {
            default: 'create'
        },
        instanceKey: {
            default: ''
        },
        disableButtonRun: {
            default: false
        },
        height: {
            default: null
        },
        width: {
            default: null
        },
        hideRunInfoPanel: {
            default: false
        }
    }
};
</script>

<style>
.dataflow-tool-bar button:last-child {
    margin-right: 8px;
}
.dataflow-tool-bar {
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 22px;
}
.btn-fill-white-color{
    color:rgba(255, 252, 252, 1)!important;
}
</style>

<template>
    <div class="h-100 content-running-infor">
        <Preloader ref="preLoaderView" />

        
        <v-tabs-items v-model="selectingTab"  class="w-100 h-100 mx-2">
            <v-tab-item :value="0">
                <OutputData
                    ref="showlistData"
                    @data-loaded="handleRunDataflowSuccess"
                    @load-data-error="handleRunDataflowFailed"
                    @click-custom-btn="handleClickCustomBtn"
                    :contentRunningHeight="contentRunningHeight"
                    :instanceKey="instanceKey"
                    :customBtn="customBtn"
                />
            </v-tab-item>
            <v-tab-item :value="1">
                <OutputColumn
                    :contentRunningHeight="contentRunningHeight"
                    :instanceKey="instanceKey"
                />
            </v-tab-item>
            <v-tab-item :value="2">
                <Message class="message-dataflow-run-info" :instanceKey="instanceKey" />
            </v-tab-item>
            <v-tab-item :value="3" v-if="isValidateNode">
                <Invalidate
                    ref="listInvalidateData"
                    :instanceKey="instanceKey"
                    :contentRunningHeight="contentRunningHeight"
                    @data-loaded="handleGetErrDataSuccess"
                    @load-data-error="handleGetErrDataFailed"
                />
            </v-tab-item>
        </v-tabs-items>
        <v-tabs color="rgba(251, 126, 0, 1)"  v-model="selectingTab" class="s-tabs-dataflow-view">
            <v-tab v-for="(item, i) in runningInforTab" :key="i" >
                
                <span>{{ item.title }}</span>
            </v-tab>
        </v-tabs>
        </div>
</template>

<script>
import Message from '@/components/dataflow/components/runningInfo/Message';
import OutputColumn from '@/components/dataflow/components/runningInfo/OutputColumn';
import Invalidate from '@/components/dataflow/components/runningInfo/Invalidate';
import Preloader from '@/components/common/Preloader';
import OutputData from '@/components/dataflow/components/runningInfo/OutputData';
import { util } from '@/plugins/util.js';

export default {
    props: {
        action: {
            default: 'create'
        },
        instanceKey: {
            default: ''
        },
        customBtn: {
            type: Object,
            default() {
                return {};
            }
        },
    },
    components: {
        Message,
        OutputColumn,
        OutputData,
        Preloader,
        Invalidate
    },
    data() {
        return {
            selectingTab: 'outputData',
            containerHeight: 0,
            contentRunningHeight: 0
        };
    },
    computed: {
        isValidateNode() {
            let check =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .selectedWidget.type === 'Validate'
                    ? true
                    : false;
            return check;
        },
        runningInforTab() {
            return {
                outputData: {
                    icon: 'mdi-table-large',
                    title: this.$t('v2.dataflow.outputData')
                },
                outputColumns: {
                    icon: 'mdi-view-column-outline',
                    title: this.$t('v2.dataflow.outputColumns')
                },
                message: {
                    icon: 'mdi-message-outline',
                    title: this.$t('v2.dataflow.message')
                },
                ...(this.isValidateNode && {
                    invalidate: {
                        icon: 'mdi-book-remove-outline',
                        title: this.$t('v2.dataflow.invalidate')
                    }
                })
            };
        }
    },
    mounted() {
        this.calcContainerHeight();
        this.hidePreloader();
        this.reCalcHeight();
    },
    created() {
        this.reCalcHeight();
    },
    methods: {
        handleClickCustomBtn() {
            this.$emit('click-custom-btn');
        },
        handleRunDataflowSuccess(data) {
            this.hidePreloader();
            this.$emit('run-success', data);
        },
        handleGetErrDataSuccess() {
            this.hidePreloader();
            this.$emit('run-success');
        },
        handleRunDataflowFailed() {
            this.hidePreloader();
            this.$emit('run-failed');
        },
        handleGetErrDataFailed() {
            this.hidePreloader();
            this.$emit('run-failed');
        },
        showPreloader() {
            this.$refs.preLoaderView.show();
        },
        hidePreloader() {
            this.$refs.preLoaderView.hide();
        },
        reCalcHeight() {
            this.contentRunningHeight = $(
                document.getElementsByClassName('content-running-infor')
            ).height();
        },
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
        getRunningData(idNode, info) {
            let session = this.session;
            this.$refs.showlistData.getData({
                idNode,
                info,
                session
            });
        }
    }
};
</script>

<style >
.message-dataflow-run-info{
    margin-top: 40px;
}
.theme--light.v-tabs.s-tabs-dataflow-view .v-tab--active:hover::before, .theme--light.v-tabs .v-tab--active::before {
    opacity: 0;
}
.s-tabs-dataflow-view .v-tabs-bar{
    height: 32px;
}
.s-tabs-dataflow-view .v-slide-group__wrapper{
    height:36px;
}
.theme--light.v-tabs.s-tabs-dataflow-view .v-tab:hover::before {
    opacity: 0;
}
.s-tabs-dataflow-view{
    margin-top: 4px;
    position: absolute;
    top:0;
    width: 450px;
}
.s-tabs-dataflow-view .v-tab{
    padding: 0 0 !important;
    margin: 0 8px;
    min-width: 50px;
}
.v-tab {
    
    text-transform: none !important;
}
</style>

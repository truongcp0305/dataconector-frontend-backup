<template>
    <div class="detail-workflow w-100 h-100 d-flex flex-column">
        <Preloader style="z-index: 1" v-show="loadingData" />
        <div class="fs-16 mb-2 fw-430">
            {{ $t('v2.admin.processStatistic') }}
        </div>
        <div class="d-flex" style="height: 50%">
            <div class="modeler-workflow mr-2 w-100 h-100">
                <TrackingProcessDefinition
                    v-if="processDefination && renderBpmn"
                    :procesDefId="processDefination.id"
                    @hide-loading="hideLoading"
                />
            </div>
            <div class="summary-workflow d-flex flex-column">
                <div class="d-flex pt-2">
                    <span class="title-summary">
                        {{ $t('v2.admin.id') }}
                    </span>
                    <span class="value-summary">
                        {{ processDefination.id ? processDefination.id : '' }}
                    </span>
                </div>
                <div class="d-flex pt-2">
                    <span class="title-summary">
                        {{ $t('v2.admin.processName') }}</span
                    >
                    <span class="value-summary">
                        {{
                            processDefination.name ? processDefination.name : ''
                        }}
                    </span>
                </div>
                <div class="d-flex pt-2">
                    <span class="title-summary"
                        >{{ $t('v2.admin.processTitle') }}
                    </span>
                    <span class="value-summary">
                        {{ processDefination.key ? processDefination.key : '' }}
                    </span>
                </div>
                <div class="d-flex pt-2">
                    <span class="title-summary"> {{ $t('common.note') }}</span>
                    <span class="value-summary">
                        {{
                            processDefination.description
                                ? processDefination.description
                                : ''
                        }}
                    </span>
                </div>
                <div class="d-flex pt-2">
                    <span class="title-summary">
                        {{ $t('common.status') }}
                    </span>
                    <span class="value-summary value-summary-status">
                        <v-chip
                            class="ma-2"
                            x-small
                            color="primary"
                            v-if="processDefination.suspended == false"
                            label
                            text-color="white"
                        >
                            {{ $t('v2.admin.work') }}
                        </v-chip>
                        <v-chip
                            class="ma-2"
                            x-small
                            color="orange"
                            v-else
                            label
                            text-color="white"
                        >
                            {{ $t('v2.admin.stop') }}
                        </v-chip>
                    </span>
                </div>
                <div class="d-flex" style="margin-top: 16px">
                    <div style="width: 150px; height: 150px">
                        <canvas id="canvas" width="300" height="300"></canvas>
                    </div>
                    <div
                        v-if="isShowDonutChart"
                        class="description-summary d-flex flex-column"
                    >
                        <div>
                            <v-chip
                                class="ma-2"
                                small
                                color="primary"
                                text-color="white"
                            >
                                n
                            </v-chip>
                            <span>{{ $t('v2.admin.running') }}</span>
                        </div>
                        <div>
                            <v-chip
                                class="ma-2"
                                color="green"
                                text-color="white"
                                small
                            >
                                n
                            </v-chip>
                            <span>{{ $t('common.done') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="list-workflow-instance d-flex flex-column h-100 mt-8">
            <ListProcessInstance
                v-if="setDataSuccess"
                :showSwitchBtn="true"
                :itemData="itemData"
            />
        </div>
    </div>
</template>

<script>
import BPMNEngine from '@/api/BPMNEngine';
import WorkflowAdminWorker from 'worker-loader!@/worker/admin/WorkflowAdmin.Worker.js';
import Preloader from '@/components/common/Preloader';

export default {
    components: {
        ListProcessInstance: () => import('./ListProcessInstance'),
        TrackingProcessDefinition: () =>
            import('@/components/process/TrackingProcessDefinition'),
        Preloader
    },
    data() {
        let self = this;
        return {
            colors: ['#1976D2', '#53B257'],
            showDialog: false,
            disableBtn: true,
            workflowAdminWorker: null,
            isShowDonutChart: false,
            setDataSuccess: false,
            loadingData: true
        };
    },
    props: {
        itemData: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    created() {
        this.workflowAdminWorker = new WorkflowAdminWorker();
        let self = this;
        this.workflowAdminWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'getDetailWorkflow':
                    self.$emit('show-panel');
                    if (Object.keys(data.dataAfter).length > 0) {
                        self.$store.commit(
                            'admin/setProcessDefination',
                            data.dataAfter.processDefination
                        );
                        self.$store.commit(
                            'admin/setProcessId',
                            data.dataAfter.processId
                        );
                        self.$store.commit(
                            'admin/setCurrentTrackingProcess',
                            data.dataAfter.currentTrackingProcess
                        );
                        self.$store.commit(
                            'admin/setCurrentAggregateWorkflow',
                            data.dataAfter.aggregateWorkflow
                        );
                        self.setDataSuccess = true;
                    } else {
                        self.$emit('close-panel');
                        self.$snotifyInfo(
                            '',
                            self.$t('v2.admin.notEnoughInfoOrNotRunning')
                        );
                    }

                    break;
                default:
                    break;
            }
        });
        if (Object.keys(this.itemData).length == 0) {
            this.getDetails();
        } else {
            if (!this.processDefination || !this.processKey) {
                this.getDetails(this.itemData);
            }
        }
    },
    computed: {
        processDefination() {
            return this.$store.state.admin.processDefination;
        },
        processKey() {
            return this.$store.state.admin.processKey;
        },
        sAdmin() {
            return this.$store.state.admin;
        },
        values() {
            return this.$store.state.admin.currentAggregateWorkflow;
        },
        renderBpmn() {
            return this.setDataSuccess &&
                (this.$route.name == 'processList' ||
                    this.$route.name == 'my-applications')
                ? true
                : false;
        }
    },

    methods: {
        async getDetails(data = null) {
            let self = this;
            self.loadingData = true;
            let obj = {};
            if (data == null) {
                let res = await BPMNEngine.getModelData(self.$route.params.id);
                if (
                    res.status == 200 &&
                    res.data &&
                    Object.keys(res.data).length > 0
                ) {
                    obj = res.data;
                }
            } else obj = data;
            self.workflowAdminWorker.postMessage({
                action: 'getDetailWorkflow',
                data: {
                    processKey: obj.processKey
                }
            });
            self.$store.commit('admin/setProcessKey', obj.processKey);
            self.$store.commit('admin/setProcessId', obj.id);
        },
        dmbChart(cx, cy, radius, arcwidth, values, colors, selectedValue) {
            var canvas = document.getElementById('canvas');
            if (canvas) {
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                var tot = 0;
                var accum = 0;
                var PI = Math.PI;
                var PI2 = PI * 2;
                var offset = -PI / 2;
                ctx.lineWidth = arcwidth;
                for (var i = 0; i < values.length; i++) {
                    tot += values[i];
                }
                for (var i = 0; i < values.length; i++) {
                    ctx.beginPath();
                    ctx.arc(
                        cx,
                        cy,
                        radius,
                        offset + PI2 * (accum / tot),
                        offset + PI2 * ((accum + values[i]) / tot)
                    );
                    ctx.strokeStyle = colors[i];
                    ctx.stroke();
                    accum += values[i];
                }
                var innerRadius = radius - arcwidth;
                ctx.beginPath();
                ctx.fillStyle = 'black';
                ctx.font = '30px  roboto ';
                let rightValue = Number(this.sAdmin.sumProcess) > 99 ? 60 : 75;
                ctx.fillText(this.sAdmin.sumProcess, rightValue, 95);
            }
        },
        hideLoading() {
            this.loadingData = false;
        }
    },
    watch: {
        processKey(val) {
            this.tab = 'tab-1';
        },
        values: {
            deep: true,
            immediate: true,
            handler(arr) {
                if (arr.length > 0) {
                    this.isShowDonutChart = true;
                    this.dmbChart(85, 85, 70, 20, arr, this.colors, 0);
                } else {
                    this.isShowDonutChart = false;
                    var canvas = document.getElementById('canvas');
                    if (canvas) {
                        var ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
            }
        }
    }
};
</script>

<style scoped>
.detail-workflow {
    font: 13px roboto;
}
.modeler-workflow {
    width: 650px;
}
.summary-workflow {
    width: 340px;
}
.summary-workflow .value-summary {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 200px;
}
.summary-workflow .title-summary {
    width: 120px;
    font: 13px;
    font-weight: 500;
}
.summary-workflow .value-summary-status {
    margin: -8px;
}
.description-summary {
    margin-top: 45px;
    margin-left: 16px;
}
.modeler-workflow {
    border: 1px solid lightgray;
}
.detail-workflow >>> img.notFoundScreen {
    height: 180px !important;
    margin-top: 16px !important;
}
</style>

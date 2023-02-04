<template>
    <div class="w-100 h-100">
        <v-text-field
            v-on:input="onSearch($event)"
            class="d-inline-block pa-2 sym-small-size"
            single-line
            append-icon="mdi-magnify"
            outlined
            hide-details
            dense
            flat
            :label="$t('common.search')"
            :placeholder="$t('common.search')"
            style="width: inherit"
        ></v-text-field>
        <preloader
            v-if="loadding"
            style="height: 100px !important; width: 185px"
            class="mx-auto"
        />
        <VuePerfectScrollbar
            v-else
            :style="{ height: configHeight - 50 + 'px' }"
        >
            <template>
                <v-expansion-panels
                    :multiple="true"
                    :hover="true"
                    :accordion="true"
                    :focusable="true"
                    :flat="true"
                    v-model="openPanel"
                    class="sym-small-size"
                    style="overflow: hidden"
                >
                    <v-expansion-panel
                        v-for="(groupData, key) in styleConfig"
                        :key="key"
                        v-show="groupData.show"
                    >
                        <v-expansion-panel-header
                            ><span class="fs-13">{{ groupData.label }}</span>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <form-tpl
                                class="s-style-config px-2"
                                :cellId="currentCellConfig.sharedConfigs.cellId"
                                :instanceKey="instanceKey"
                                :allInputs="groupData.children"
                                @input-value-changed="getChangeInput"
                            ></form-tpl>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </template>
        </VuePerfectScrollbar>

        <v-dialog v-model="isShowDialog" max-width="700px" scrollable>
            <v-card>
                <v-card-title>
                    <span class="fs-16">{{
                        $t('v2.dashboard.configColConditionalFormat')
                    }}</span>
                </v-card-title>
                <v-card-text>
                    <div class="w-100">
                        <TableConditionalFormatSetting
                            v-if="selectingConditionFormat"
                            ref="tableConditionalFormatSetting"
                            :config="selectingConditionFormat"
                        />
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="blue darken-1"
                        text
                        class="btn-add"
                        @click="applyConditionSetting"
                    >
                        {{ $t('common.apply') }}
                    </v-btn>
                    <v-btn
                        color="red darken-1"
                        text
                        @click="isShowDialog = false"
                    >
                        {{ $t('common.cancel') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import FormTpl from '@/components/common/FormTpl.vue';
import DashboardStyleConfig from 'worker-loader!@/worker/dashboard/dashboard/DashboardStyleConfig.Worker.js';
import TableConditionalFormatSetting from '@/components/dashboard/components/TableConditionalFormatSetting';
import { util } from '../../../../plugins/util';

export default {
    components: {
        VuePerfectScrollbar,
        FormTpl,
        TableConditionalFormatSetting
    },
    props: {
        instanceKey: {
            default: null
        },
        configHeight: {
            type: Number,
            default: 0
        }
    },
    computed: {
        storeDashboard() {
            return this.$store.state.dashboard;
        },
        currentCellConfig() {
            return this.$store.state.dashboard.allDashboard[this.instanceKey]
                .currentCellConfigs;
        },
        styleConfig() {
            let data =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .currentCellConfigs.rawConfigs.style;
            for (let key in data) {
                data[key].label = this.$t(data[key].label);
                if (data[key].children) {
                    let children = data[key].children;
                    for (let idx in children) {
                        children[idx].title = this.$t(children[idx].title);
                        if (children[idx].hasOwnProperty('options')) {
                            let options = children[idx].options;
                            for (let i in options) {
                                options[i].text = this.$t(options[i].text);
                            }
                        }
                    }
                }
            }
            return data;
        }
    },
    data() {
        return {
            dashboardStyleConfig: null,
            openPanel: [],
            loadding: false,
            isShowDialog: false,
            selectingConditionFormat: null
        };
    },
    methods: {
        onSearch(vl) {
            if (this.delayTimer) {
                clearTimeout(this.delayTimer);
            }
            this.delayTimer = setTimeout(
                (self) => {
                    this.loadding = true;
                    if (!vl) {
                        self.openPanel = [];
                        self.loadding = false;
                    } else {
                        self.setOpenPanelStyleConfig();
                    }
                    self.dashboardStyleConfig.postMessage({
                        action: 'searchStyleConfig',
                        data: {
                            styleConfig: self.styleConfig,
                            vl: vl
                        }
                    });
                },
                300,
                this
            );
        },
        setOpenPanelStyleConfig() {
            this.openPanel = [];
            for (let i = 0; i < Object.keys(this.styleConfig).length; i++) {
                this.openPanel.push(i);
            }
            setTimeout(
                (self) => {
                    self.loadding = false;
                },
                100,
                this
            );
        },
        searchStyleConfigAfter(data) {
            this.styleConfig = data.styleConfig;
        },
        listenFromWorker() {
            let self = this;
            this.dashboardStyleConfig.addEventListener(
                'message',
                function (event) {
                    let data = event.data;
                    let action = data.action;
                    if (self[action]) {
                        self[action](data.data);
                    } else {
                        console.error(` action ${action} not found `);
                    }
                }
            );
        },
        getChangeInput(name, input, value) {
            let self = this;
            if (name == 'conditionalFormatCondition') {
                let condItem = value.condItem;
                let condIndex = value.condIdx;
                let fields =
                    this.currentCellConfig.sharedConfigs.conditionFormatFields;
                let columns = [];
                fields.forEach((element) => {
                    if (
                        self.currentCellConfig.rawConfigs.setting[element]
                            .selectedColums.length > 0
                    ) {
                        columns = columns.concat(
                            self.currentCellConfig.rawConfigs.setting[element]
                                .selectedColums
                        );
                    }
                });
                for (let col of columns) {
                    col.columnName = col.name;
                    col.uid = col.name;
                }
                this.$set(condItem, 'listColumns', columns);
                this.selectingConditionFormat = null;
                this.$set(
                    this,
                    'selectingConditionFormat',
                    util.cloneDeep(condItem)
                );
                this.isShowDialog = true;
                this.condFormatTmpInfo = {
                    condIndex,
                    name: name
                };
                setTimeout(
                    (self) => {
                        self.$refs.tableConditionalFormatSetting.initData();
                    },
                    100,
                    this
                );
            } else {
                if (
                    name == 'countSeriesDisplayValue' &&
                    value >=
                        this.currentCellConfig.viewConfigs.displayOptions
                            .series[0].data.length
                ) {
                    this.$snotifyError(
                        {},

                        this.$t('common.validate-value-config'),

                        this.$t('bi.dashboard.validate-group-series-value')
                    );
                }
                if (
                    [
                        'lessThan',
                        'countSeriesDisplay',
                        'totalSeriesGroup'
                    ].includes(name) &&
                    this.styleConfig.groupSeries
                ) {
                    let groupSeries = this.styleConfig.groupSeries.children;
                    let inputInfoValue = groupSeries[name + 'Value'];
                    inputInfoValue.disabled = !value;
                    if (value) {
                        var allSwitchInput = [
                            'lessThan',
                            'countSeriesDisplay',
                            'totalSeriesGroup'
                        ];

                        allSwitchInput.splice(allSwitchInput.indexOf(name), 1);
                        allSwitchInput.map((inputName) => {
                            if (groupSeries[inputName].value) {
                                groupSeries[inputName].value = false;
                                groupSeries[
                                    inputName + 'Value'
                                ].disabled = true;
                            }
                        });
                    }
                }

                this.$evtBus.$emit('bi-report-change-display', {
                    type: 'style',
                    id: this.currentCellConfig.sharedConfigs.cellId,
                    instanceKey: this.instanceKey,
                    fromSetting: true
                });
            }
        },
        applyConditionSetting() {
            this.$set(
                this.styleConfig.conditionalFormat.children[
                    this.condFormatTmpInfo.name
                ].value,
                this.condFormatTmpInfo.condIndex,
                this.selectingConditionFormat
            );
            this.isShowDialog = false;
            this.$evtBus.$emit('bi-report-change-display', {
                instanceKey: this.instanceKey,
                id: this.currentCellConfig.sharedConfigs.cellId,
                type: 'style',
                fromSetting: true
            });
        },
        removeCondFormatItem(data) {
            let condIndex = data.condIdx;
            this.styleConfig.conditionalFormat.children.conditionalFormatCondition.value.splice(
                condIndex,
                1
            );
        }
    },
    created() {
        let self = this;
        this.dashboardStyleConfig = new DashboardStyleConfig();
        this.listenFromWorker();
        this.$evtBus.$on('dashboard-remove-conditional', (data) => {
            self.removeCondFormatItem(data);
        });
    }
};
</script>

<style scoped>
.s-style-config >>> .v-input--switch .v-input__control {
    padding-left: 10px;
    padding-top: 4px;
}
.s-style-config >>> .v-input--switch .v-input__control .v-input__slot {
    background-color: white !important;
}
.s-style-config >>> .v-select .v-input__control {
    height: 28px;
}
.v-menu__content {
    font-size: 13px;
}
</style>

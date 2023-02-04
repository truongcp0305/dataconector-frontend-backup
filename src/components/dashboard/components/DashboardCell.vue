<template>
    <div
        class="w-100 h-100 border-all symper-dashboard-cell"
        :style="viewAttrs.general"
        @click="selectThisCell"
    >
        <div
            class="w-100 h-100 position-absolute"
            style="opacity: 0.95; background-color: #f5f5f5; z-index: 2"
            v-if="
                cellConfigs.viewConfigs.loadingData &&
                !cellConfigs.viewConfigs.customLoading
            "
        ></div>
        <DashboardCellOptions
            :cell="cellConfigs"
            :instanceKey="instanceKey"
            @view-detail="handleViewDetail"
            @download-excel="handleDownloadExcel"
            @tracing-dataset="handleTracingDataset"
            @print-report="handlePrintReport"
            @toggle-self-filter-panel="handleToggleSelfFilter"
            :isView="isView"
        />
        <div class="w-100 h-100 cell-placeholder" v-if="showIconOnly()">
            <img
                :src="
                    'img/dashboard/report-builder/' +
                    cellConfigs.sharedConfigs.type +
                    '.png'
                "
                height="40px"
                width="40px"
            />
            <div
                class="pt-1 text-center detail-error w-100 text-ellipsis px-1"
                :title="$t('v2.dashboard.clickToViewDetail')"
                v-show="
                    !(
                        cellConfigs.viewConfigs.loadingData &&
                        !cellConfigs.viewConfigs.customLoading
                    )
                "
            >
                <span v-if="needConfigFilter" class="grey--text fs-12">{{
                    $t('v2.dashboard.not_config_data')
                }}</span>
                <span
                    v-else-if="cellConfigs.viewConfigs.error.exist"
                    class="w-100"
                >
                    <v-menu
                        v-if="cellConfigs.viewConfigs.error.exist"
                        bottom
                        offset-y
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <span
                                class="text-decoration-underline grey--text fs-12"
                                v-bind="attrs"
                                style="text-underline-offset: 4px"
                                v-on="on"
                                >{{ $t('v2.dashboard.getDataError') }}</span
                            >
                        </template>

                        <div
                            v-for="(item, key) in cellConfigs.viewConfigs.error
                                .detail"
                            :key="key"
                            class="fs-13 pa-3 border-bottom-1 bg-white"
                            style="width: 300px"
                        >
                            <div class="pb-1 fw-500">
                                {{ item.title }}
                            </div>
                            <div class="pl-4 pr-2">
                                {{ item.detail }}
                            </div>
                        </div>
                    </v-menu>
                </span>
                <span v-else class="grey--text fs-12">{{
                    $t('v2.dashboard.emptyData')
                }}</span>
            </div>
        </div>
        <div class="h-100 w-100" v-else>
            <div
                ref="cellTitle"
                class="symper-cell-title"
                :symper-cell-id="cellConfigs.sharedConfigs.cellId"
                :style="
                    viewAttrs.symperTitle ? viewAttrs.symperTitle.style : {}
                "
            >
                <div
                    class="cell-title-text text-ellipsis d-inline-block pl-1"
                    style="width: calc(100% - 2px)"
                >
                    <span style="cursor: text" v-if="isView">{{
                        viewAttrs.symperTitle.text
                    }}</span>
                    <span
                        v-if="!edditingTitle && !isView"
                        style="cursor: text"
                        @dblclick="editTitleCell"
                    >
                        {{ viewAttrs.symperTitle.text }}
                    </span>
                    <input
                        class="w-100 border-none"
                        v-else-if="!isView"
                        ref="renameTitleInput"
                        @blur="applyTitleChange"
                        @change="applyTitleChange"
                        type="text"
                        v-model="viewAttrs.symperTitle.text"
                    />
                </div>
            </div>
            <component
                :is="reportTag"
                ref="reportCell"
                :isView="isView"
                :action="action"
                :instanceKey="instanceKey"
                :cellConfigs="cellConfigs"
                :selectedItems="selectedItems"
            >
            </component>
        </div>
    </div>
</template>

<script>
import { getDefaultReportConfig } from '@/components/dashboard/configPool/reportConfig.js';
import { autoLoadChartClasses } from '@/components/dashboard/configPool/reportConfig.js';
import DashboardCellOptions from '@/components/dashboard/components/DashboardCellOptions.vue';
import { setMenuOption } from './reportCells/tablePivotHelper';
function autoImportReportCells() {
    var context = require.context(
        '@/components/dashboard/components/reportCells',
        true,
        /\.(vue)$/
    );
    var comps = {};
    let filename = '';
    context.keys().forEach((filePath) => {
        filename = filePath.match(/[^\\/:*?"<>|\r\n]+$/)[0].replace('.vue', '');
        comps[filename] = context(filePath).default;
    });
    return comps;
}
var reportComps = autoImportReportCells();
var chartClasses = autoLoadChartClasses();

export default {
    name: 'DashboardCell',
    created() {
        let self = this;
        this.$evtBus.$on(
            'bi-report-change-columnConfig',
            (instanceKey, cellId) => {
                if (
                    instanceKey == this.instanceKey &&
                    cellId == this.cellConfigs.sharedConfigs.cellId
                ) {
                    if (
                        this.cellConfigs.sharedConfigs.type == 'table' ||
                        this.cellConfigs.sharedConfigs.type == 'pivot'
                    ) {
                        setTimeout(function () {
                            setMenuOption(
                                self.cellConfigs,
                                self.prependIcons,
                                self.cellConfigs.sharedConfigs.type == 'table'
                                    ? 'value'
                                    : 'rows'
                            );
                        }, 0);
                    }
                }
            }
        );
    },

    data() {
        return {
            getDataBySelfFilter: false,
            edditingTitle: false,
            prependIcons: {
                groupBy: 'mdi-file-tree mdi'
            }
        };
    },
    components: {
        ...reportComps,
        DashboardCellOptions
    },
    methods: {
        handleToggleSelfFilter(data) {
            this.$emit('toggle-self-filter-panel', data);
        },
        refreshCell() {
            this.$evtBus.$emit('bi-report-change-display', {
                instanceKey: this.instanceKey,
                id: this.cellConfigs.sharedConfigs.cellId,
                type: 'data',
                serverCache: false
            });
        },
        handleSettingColumnOptionsClicked(data) {
            if (this.$refs.reportCell) {
                if (
                    this.$refs.reportCell.hasOwnProperty(
                        'handleSettingColumnOptionsClicked'
                    )
                ) {
                    this.$refs.reportCell.handleSettingColumnOptionsClicked(
                        data
                    );
                }
            }
        },
        handleTracingDataset(item) {
            this.$emit('tracing-dataset', item);
        },
        handleViewDetail(data) {
            this.$emit('view-detail', data);
        },
        handleDownloadExcel() {
            this.$emit('download-excel');
        },
        handlePrintReport() {
            let headerHTML = this.$refs.cellTitle.outerHTML;
            this.$refs.reportCell.printInnerHTML(headerHTML);
        },
        showIconOnly() {
            let needData =
                Object.keys(this.cellConfigs.rawConfigs.setting).length > 0;
            let data = this.cellConfigs.sharedConfigs.data;
            let emptyData = !data || (data && data.length == 0);
            let allwaysShow =
                this.cellConfigs.sharedConfigs.type == 'filter' &&
                this.cellConfigs.sharedConfigs.getDataTimes > 1;
            const canGetDataWithoutInitConfig = {
                card: true,
                filter: true,
                editor: true
            };
            return (
                (needData && emptyData && !allwaysShow) ||
                (this.needConfigFilter &&
                    !this.getDataBySelfFilter &&
                    !canGetDataWithoutInitConfig[
                        this.cellConfigs.sharedConfigs.type
                    ])
            );
        },
        selectThisCell() {
            this.$store.commit('dashboard/setSelectedCell', {
                id: this.cellConfigs.sharedConfigs.cellId,
                instanceKey: this.instanceKey,
                isMobileLayout: this.isMobileLayout
            });
        },
        applyTitleChange() {
            this.edditingTitle = false;
            let titleConfig = null;
            this.cellConfigs.rawConfigs.style.title.children.titleText.value =
                this.viewAttrs.symperTitle.text;
        },
        editTitleCell() {
            this.edditingTitle = true;
            setTimeout(
                (self) => {
                    $(self.$refs.renameTitleInput).focus();
                },
                0,
                this
            );
        }
    },
    computed: {
        reportTag() {
            let className =
                chartClasses[this.cellConfigs.sharedConfigs.type].name;
            if (reportComps[className]) {
                return className;
            } else {
                return null;
            }
        },
        dashboardConfigs() {
            return this.$store.state.dashboard.allDashboard[this.instanceKey];
        },
        viewAttrs() {
            return this.cellConfigs.viewConfigs.displayOptions;
        }
    },
    props: {
        selectedItems: {
            default() {
                return [];
            }
        },
        needConfigFilter: {
            default: false
        },
        layoutItem: {
            default() {
                return {};
            }
        },
        cellConfigs: {
            default() {
                return getDefaultReportConfig();
            }
        },
        instanceKey: {
            defaul: ''
        },
        isView: {
            default: true
        },
        isMobileLayout: {
            type: Boolean,
            default: false
        },
        action: {
            default: 'create'
        }
    }
};
</script>

<style>
.cell-placeholder img {
    height: 20px;
    position: absolute;
    left: 50%;
    top: 45%;
    transform: translate(-50%, -50%);
    color: #cccccc;
    width: 20px;
    opacity: 0.4;
}

.cell-placeholder .detail-error {
    position: relative;
    top: calc(45% + 7px);
}

.cell-placeholder {
    background-color: #fdfdfd;
}
.cell-comment {
    float: right;
    margin-right: 18px;
}
</style>

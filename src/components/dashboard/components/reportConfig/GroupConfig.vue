<template>
    <div class="group-config">
        <VuePerfectScrollbar
            :style="{ height: height + 'px' }"
            v-if="currentCellConfigs.rawConfigs"
        >
            <v-expansion-panels accordion multiple>
                <v-expansion-panel
                    v-for="(item, i) in currentCellConfigs.rawConfigs.group"
                    :key="i"
                >
                    <v-expansion-panel-header
                        class="px-1 fs-15 font-weight-bold"
                        >{{ item.title }}</v-expansion-panel-header
                    >
                    <v-expansion-panel-content>
                        <cell-config-setting-template
                            :highLightTitle="false"
                            @add-y-axis="addYAxis"
                            class="fs-13"
                            v-for="(
                                childItem, settingName
                            ) in item.translatedItems"
                            :key="settingName"
                            :settingItem="childItem"
                            :instanceKey="instanceKey"
                            :settingTplAgg="settingTplAgg"
                            :isView="isView"
                        >
                        </cell-config-setting-template>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </VuePerfectScrollbar>
    </div>
</template>
<script>
import CellConfigSettingTemplate from '@/components/dashboard/components/reportConfig/CellConfigSettingTemplate';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import settingTplAgg from '@/components/dashboard/configPool/settingTplAgg';

export default {
    components: {
        CellConfigSettingTemplate: CellConfigSettingTemplate,
        VuePerfectScrollbar
    },
    props: {
        instanceKey: {
            type: Number,
            default: 0
        },
        height: {
            type: Number,
            default: 0
        },
        isView: {
            type: Boolean
        }
    },
    methods: {
        addYAxis(newLast) {
            let newYAxis = JSON.parse(JSON.stringify(this.settingItems.yAxis1));
            newYAxis.selectedColums = [];
            newYAxis.num = newLast;
            newYAxis.name = 'Y Axis ' + newLast;

            let tooltips = this.settingItems.tooltips;
            delete this.settingItems.tooltips;
            this.$set(this.settingItems, 'yAxis' + newLast, newYAxis);
            this.$set(this.settingItems, 'tooltips', tooltips);
            for (let name in this.settingItems) {
                if (name.includes('yAxis')) {
                    this.settingItems[name].lastYaxis = newLast;
                }
            }
        }
    },

    data() {
        return {
            cpnType: 'config_setting',
            settingItems: {},
            settingTplAgg: settingTplAgg
        };
    },
    computed: {
        currentCellConfigs() {
            let data =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .currentCellConfigs;
            let group = data.rawConfigs.group;
            for (let key in group) {
                group[key].title = this.$t(group[key].title);
                let translatedItems = group[key].translatedItems;
                for (let idx in translatedItems) {
                    translatedItems[idx].name = this.$t(
                        translatedItems[idx].name
                    );
                }
            }
            return data;
        }
    }
};
</script>
<style scoped>
.group-config >>> .v-expansion-panel-header {
    background-color: unset !important;
    font-size: 13px;
    min-height: unset !important;
    height: 40px;
}
</style>

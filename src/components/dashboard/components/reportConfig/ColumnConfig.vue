<template>
    <div class="config-settings">
        <VuePerfectScrollbar
            :style="{ height: height + 'px' }"
            v-if="currentCellConfigs.rawConfigs"
        >
            <cell-config-setting-template
                @add-y-axis="addYAxis"
                v-for="(item, settingName) in currentCellConfigs.rawConfigs
                    .setting"
                :key="settingName"
                :settingItem="item"
                :instanceKey="instanceKey"
                :settingTplAgg="settingTplAgg"
                :isView="isView"
            >
            </cell-config-setting-template>
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
        },
        translatedTitle(menuOptions) {
            let self = this;
            for (let i in menuOptions) {
                if (menuOptions[i].title.includes('v2.dashboard')) {
                    if (i == 'bottomRowAgg') {
                        menuOptions[i].title = menuOptions[i].title.split(
                            ' '
                        )[1]
                            ? self.$t(menuOptions[i].title.split(' ')[0]) +
                              menuOptions[i].title.split(' ')[1]
                            : self.$t(menuOptions[i].title.split(' ')[0]);
                    } else menuOptions[i].title = self.$t(menuOptions[i].title);
                }
                if (menuOptions[i].prefixTitle)
                    menuOptions[i].prefixTitle = self.$t(
                        menuOptions[i].prefixTitle
                    );
                if (menuOptions[i].hasOwnProperty('subItems')) {
                    let subItems = menuOptions[i].subItems;
                    subItems.forEach(function (item) {
                        item.title = self.$t(item.title);
                    });
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
            for (let key in data.rawConfigs.setting) {
                data.rawConfigs.setting[key].name = this.$t(
                    data.rawConfigs.setting[key].name
                );
                data.rawConfigs.setting[key].tooltip = this.$t(
                    data.rawConfigs.setting[key].tooltip
                );
                let menuOptions = data.rawConfigs.setting[key].menuOptions;
                this.translatedTitle(menuOptions);
                if (data.rawConfigs.setting[key].selectedColums) {
                    let col = data.rawConfigs.setting[key].selectedColums;
                    col.forEach((e) => {
                        this.translatedTitle(e.menuOptions);
                    });
                }
            }
            return data;
        }
    }
};
</script>
<style scoped></style>

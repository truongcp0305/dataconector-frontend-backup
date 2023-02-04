<template>
    <div class="d-flex flex-column">
        <VuePerfectScrollbar
            :style="{ height: height * 0.25 - 20 + 'px' }"
            v-if="currentCellConfigs.rawConfigs"
        >
            <cell-config-setting-template
                v-for="(item, settingName) in currentCellConfigs.rawConfigs
                    .sortOnQuery"
                :key="settingName"
                :settingItem="item"
                :instanceKey="instanceKey"
                :isView="isView"
            >
            </cell-config-setting-template>
        </VuePerfectScrollbar>
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import CellConfigSettingTemplate from '@/components/dashboard/components/reportConfig/CellConfigSettingTemplate';

export default {
    components: {
        VuePerfectScrollbar,
        CellConfigSettingTemplate
    },
    computed: {
        currentCellConfigs() {
            let data =
                this.$store.state.dashboard.allDashboard[this.instanceKey]
                    .currentCellConfigs;
            data.rawConfigs.extra.sortOnQuery.name = this.$t(
                data.rawConfigs.extra.sortOnQuery.name
            );
            let option = data.rawConfigs.extra.sortOnQuery.menuOptions;
            for (let key in option) {
                option[key].title = this.$t(option[key].title);
            }
            return data;
        }
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
    }
};
</script>

<style></style>

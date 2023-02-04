<template>
    <div class="pl-3 pr-3">
        <div style="margin-bottom: -10px" class="filter-base">
            <v-text-field
                size="nano"
                :controls="false"
                class="mr-2 w-45"
                solo
                style="min-width: 50px; max-width: 100px"
                @change="
                    handleChangeFilterValue(cellConfigs.sharedConfigs.cellId)
                "
                :placeholder="$t('common.inputPlaceholder')"
                v-model="sliderDataValue.value[0]"
            >
            </v-text-field>
            <v-text-field
                style="min-width: 50px; max-width: 100px"
                solo
                size="nano"
                :controls="false"
                @change="
                    handleChangeFilterValue(cellConfigs.sharedConfigs.cellId)
                "
                class="w-45"
                :placeholder="$t('common.inputPlaceholder')"
                v-model="sliderDataValue.value[1]"
            >
            </v-text-field>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        clearFilteredValues() {
            this.sliderDataValue.value[0] = this.sliderDataValue.min;
            this.sliderDataValue.value[1] = this.sliderDataValue.max;
        },
    },
    data() {
        return {};
    },
    computed: {
        sliderDataValue() {
            let displayOptions = this.cellConfigs.viewConfigs.displayOptions;
            if (!displayOptions.data.value) {
                return {
                    value: [0, 0],
                    max: 0,
                    min: 0,
                };
            } else {
                return displayOptions.data;
            }
        },
    },
    props: {
        cellConfigs: {
            default() {
                return {};
            },
        },
    },
};
</script>

<style></style>

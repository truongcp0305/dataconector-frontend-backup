<template>
    <div class="fs-13">
        <div v-if="selectionType == 'single'">
            <div
                v-for="(item, idx) in data"
                :key="idx"
                @click="changeSelectRadio(item, idx)"
                class="cursor-pointer w-100"
            >
                <i
                    style="bottom: 5px"
                    :class="{
                        'mdi mr-1 position-relative': true,
                        'mdi-radiobox-blank': !item.symper__selected,
                        'mdi-radiobox-marked': item.symper__selected
                    }"
                ></i>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <span
                            v-on="on"
                            style="
                                width: calc(100% - 20px);
                                display: inline-block;
                                height: 20px;
                            "
                            class="text-ellipsis"
                            >{{ item[selectedCol.as] }}</span
                        >
                    </template>
                    <span>{{ item[selectedCol.as] }}</span>
                </v-tooltip>
            </div>
        </div>
        <div v-else-if="selectionType == 'multiple'">
            <label
                @click="changeSelectItem()"
                :class="{
                    'mb-2': true,
                    'mdi mdi-checkbox-blank-outline': !selectAll,
                    'mdi mdi-checkbox-marked text-success': selectAll
                }"
            >
                <span class="el-checkbox__label pl-2">{{
                    $t('v2.dashboard.Select All ')
                }}</span>
            </label>
            <div v-for="(item, idx) in data" :key="idx" class="cursor-pointer">
                <label
                    @click="changeSelectItem(item)"
                    :class="{
                        'mdi mdi-checkbox-blank-outline':
                            !item.symper__selected,
                        'mdi mdi-checkbox-marked text-success':
                            item.symper__selected
                    }"
                >
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <span
                                v-on="on"
                                :style="{
                                    cursor: 'pointer',
                                    width: 'calc(100% - 15px)',
                                    position: 'relative',
                                    top: '4px',
                                    ...cellView.displayOptions.itemStyle
                                }"
                                class="pl-2 text-ellipsis d-inline-block"
                                >{{ item[selectedCol.as] }}
                            </span>
                        </template>
                        <span>{{ item[selectedCol.as] }}</span>
                    </v-tooltip>
                </label>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    methods: {
        clearFilteredValues() {
            for (let item of this.data) {
                item.symper__selected = false;
            }
            this.cellView.clickedAll = false;
            this.cellView.selectedAll = false;
            this.$set(this.cellView, 'disSelectedValues', {});
            this.$set(this.cellView, 'selectedValues', {});
        },
        setSelectConfigOnClick(isSelect, value, type) {
            let cellView = this.cellView;
            if (type == 'all') {
                cellView.clickedAll = isSelect;
                cellView.selectedAll = isSelect;

                this.selectAll = isSelect;
            } else {
                if (isSelect) {
                    cellView.selectedValues[value] = true;
                    delete cellView.disSelectedValues[value];
                } else {
                    cellView.disSelectedValues[value] = true;
                    delete cellView.selectedValues[value];
                }

                if (
                    Object.keys(cellView.selectedValues).length ==
                    this.data.length
                ) {
                    cellView.selectedAll = true;
                } else {
                    cellView.selectedAll = false;
                }
                this.selectAll = cellView.selectedAll;
            }
        },
        changeSelectRadio(item, idx) {
            if (this.selectingRadioBox >= 0) {
                this.data[this.selectingRadioBox].symper__selected = false;
            }
            item.symper__selected = !item.symper__selected;

            this.cellView.clickedAll = false;
            this.cellView.selectedAll = false;
            this.cellView.disSelectedValues = {};
            this.cellView.selectedValues = {};

            if (item.symper__selected) {
                this.cellView.selectedValues[item[this.selectedCol.as]] = true;
            }

            this.selectingRadioBox = idx;
            this.$emit('change-filter-value', this.cellId);
        },
        changeSelectItem(item = false) {
            let self = this;
            let cellView = this.cellView;
            if (item) {
                item.symper__selected = !item.symper__selected;
                this.setSelectConfigOnClick(
                    item.symper__selected,
                    item[this.selectedCol.as],
                    'item'
                );
            } else {
                this.selectAll = !this.selectAll;
                if (this.selectAll) {
                    this.data.forEach(function (e) {
                        e.symper__selected = true;
                        cellView.selectedValues[e[self.selectedCol.as]] = true;
                    });
                    cellView.disSelectedValues = {};
                } else {
                    for (let item of this.data) {
                        item.symper__selected = false;
                        cellView.disSelectedValues[
                            item[this.selectedCol.as]
                        ] = true;
                    }
                    cellView.selectedValues = {};
                }
                this.setSelectConfigOnClick(this.selectAll, '', 'all');
            }
            this.$emit('change-filter-value', this.cellId);
        }
    },
    props: [
        'data',
        'selectionType',
        'selectedCol',
        'cellId',
        'cellView',
        'styleString'
    ],
    data() {
        return {
            selectAll: false,
            selectingRadioBox: -1
        };
    }
};
</script>

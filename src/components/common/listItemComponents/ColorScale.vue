<template>
    <div>
        <div class="mb-1">{{ $t('v2.showlist.columnGetValue') }}</div>
        <div>
            <v-select
                class="field-selected-column"
                item-value="field"
                item-text="title"
                return-object
                outlined
                :items="formatTableColumn"
                v-model="applyColumn"
            >
            </v-select>
        </div>
        <div style="margin-top: -20px" class="mb-10">
            {{ $t('v2.showlist.preview') }}
            <div style="float: right" class="mt-1 mr-1">
                <div
                    :style="{
                        'background-image':
                            'linear-gradient(to right, ' +
                            value.config[0].color +
                            ',' +
                            value.config[1].color +
                            ',' +
                            value.config[2].color +
                            ')'
                    }"
                    style="
                        width: 150px;
                        border: 1px solid black;
                        height: 20px;
                        background: blue;
                    "
                ></div>
            </div>
        </div>
        <div
            v-for="(item, index) in settingPoint"
            :key="index"
            style="margin-top: -30px"
            class="pl-2 ml-1"
        >
            <div>
                {{ item.name }}
            </div>
            <v-row>
                <v-select
                    class="field-selected-column mr-2"
                    :items="item.lists"
                    outlined
                    v-model="item.type"
                    style="width: 100px !important"
                >
                </v-select>
                <v-text-field
                    outlined
                    class="field-selected-column"
                    dense
                    :disabled="item.disable"
                    v-model="item.value"
                    style="width: 75px !important"
                >
                    ></v-text-field
                >
                <v-menu>
                    <template v-slot:activator="{ on }">
                        <v-btn x-small text v-on="on">
                            <v-icon :style="{ color: item.color }" size="16"
                                >mdi-format-color-fill</v-icon
                            >
                        </v-btn>
                    </template>
                    <PickColor v-model="item.color" />
                </v-menu>
            </v-row>
        </div>
        <div></div>
    </div>
</template>
<script>
import Gradient from 'javascript-color-gradient';
import PickColor from './PickColor';
export default {
    methods: {
        // trường hợp min value và max value với số
        handleMinMaxValue() {
            let maxValue = Math.max(...this.listsValue);
            let minValue = Math.min(...this.listsValue);
            if (
                this.value.config[0].value &&
                typeof Number(this.value.config[0].value) == 'number'
            ) {
                if (this.value.config[0].value < minValue) {
                    this.$snotifyError(
                        this.$t('v2.showlist.error'),
                        this.$t('v2.showlist.canNotEnterValueLessThan') +
                            minValue
                    );
                    return false;
                } else {
                    minValue = Number(this.value.config[0].value);
                }
            }
            if (
                this.value.config[2].value &&
                typeof Number(this.value.config[2].value) == 'number'
            ) {
                if (this.value.config[2].value > maxValue) {
                    this.$snotifyError(
                        this.$t('v2.showlist.error'),
                        this.$t(
                            'v2.showlist.canNotEnterValueGreaterThan'
                        ) + maxValue
                    );
                    return false;
                } else {
                    maxValue = Number(this.value.config[2].value);
                }
            }
            if (minValue > maxValue) {
                this.$snotifyError(
                    this.$t('v2.showlist.error'),
                    this.$t('v2.showlist.valueNotValid')
                );
                return false;
            }
            let midPoint = maxValue - minValue + 1;
            const minColor = this.settingPoint[0].color;
            const midColor = this.settingPoint[1].color;
            const maxColor = this.settingPoint[2].color;
            const colorGradient = new Gradient();
            let listColor = colorGradient
                .setGradient(minColor, maxColor)
                .setMidpoint(midPoint)
                .getArray();
            listColor.map((color, i) => {
                this.dataColumnsAndColor.map((data, j) => {
                    let distance = data.name - minValue; // tính khoảng cách giá trị so với phần tử đầu
                    data.backgroundColor = listColor[distance];
                });
            });
            this.value.listColors = this.dataColumnsAndColor;
            return true;
        },
        setValue() {
            this.formatTableColumn = this.tableColumns.filter(
                (t, i) => i != 0 && t.type == 'numeric'
            );
            this.value.applyColumn =
                this.value.applyColumn == ''
                    ? this.formatTableColumn[0]
                    : this.value.applyColumn;
            this.settingPoint = this.value.config;
            this.applyColumn = this.value.applyColumn;
        }
    },
    watch: {
        applyColumn() {
            let dataColumnsAndColor = [];
            let listsValue = [];
            this.rowData.map((r) => {
                dataColumnsAndColor.push({
                    name: r[this.applyColumn.field],
                    backgroundColor: ''
                }),
                    listsValue.push(r[this.applyColumn.field]);
            });
            this.dataColumnsAndColor = dataColumnsAndColor;
            this.listsValue = listsValue;
            this.value.applyColumn = this.applyColumn;
        }
    },
    props: {
        value: {
            type: Object,
            default() {
                return {};
            }
        },
        isUpdate: {
            type: Boolean
        },
        rowData: {
            type: Array,
            default() {
                return [];
            }
        },
        tableColumns: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    components: {
        PickColor
    },
    created() {
        this.setValue();
    },
    data() {
        return {
            listsValue: [],
            dataColumnsAndColor: [], // lưu dữ liệu gán với mảng màu
            applyColumn: [], // cột được áp dụng
            settingPoint: [],
            listId: [],
            formatTableColumn: []
        };
    }
};
</script>
<style scoped>
.field-selected-column >>> .v-input__slot {
    min-height: 26px !important;
    max-height: 26px !important;
    font-size: 13px;
}
.field-selected-column >>> .v-input__icon {
    margin-top: -15px !important;
}
.single-color >>> .v-select__selections {
    font-size: 13px !important;
}
.hight-light {
    background-color: #f5863417;
    color: #f58634 !important;
}
.background-orange {
    background: #f5863417;
}

.field-selected-column >>> .v-btn:not(.v-btn--round).v-size--x-small {
    padding: 0 2px !important;
    margin-right: 2px !important;
    min-width: 26px !important;
}
.field-selected-column >>> .v-menu__content {
    background: white !important;
    left: 1237 !important;
}
</style>

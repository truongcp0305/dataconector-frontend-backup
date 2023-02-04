<template>
    <v-list class="fs-13 ml-2 mr-0 mb-3">
        <div
            class="col-flex"
            style="margin-bottom: -38px"
            v-for="(table, tableIdx) in tables"
            :key="tableIdx"
        >
            <v-row class="mr-1">
                <v-col class="ellipsis col-md-5 ml-1 pl-1">
                    <v-icon v-if="tables[tableIdx] == tables[0]" size="18"
                        >mdi-file-outline</v-icon
                    >
                    <v-icon v-else size="18" class="ml-3">mdi-table</v-icon>
                    <span class="color-grey fs-13 pl-1">
                        <b class="fw-500"
                            >{{ table.title }}
                            <span
                                v-if="tables[tableIdx] == tables[0]"
                                style="color: red"
                                >*</span
                            >
                            <span>
                                ({{ sumCount(tableIdx, 'document') }})
                            </span>
                        </b>
                    </span>
                </v-col>
                <v-col
                    :class="{ 'col-md-5': showCheckBox, 'mr-2': !showCheckBox }"
                    class="py-0"
                >
                    <v-autocomplete
                        :disabled="disabled"
                        :value="table.sheetMap"
                        @input="(value) => onChangeSheet(tableIdx, value)"
                        class="auto-complete color-normal mt-4 mb-3 fs-13 ml-1"
                        :items="nameSheets"
                        item-text="name"
                        return-object
                        clearable
                        :menu-props="{ 'nudge-top': -10, 'max-width': 300 }"
                    >
                        <template v-slot:item="{ item, on, attrs }">
                            <v-list-item
                                v-show="item.enable"
                                v-on="on"
                                v-bind="attrs"
                            >
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ item.name }}
                                    </v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                    </v-autocomplete>
                </v-col>
            </v-row>
            <v-row
                class="mr-3"
                v-for="(control, controlIdx) in table.controls"
                :key="controlIdx"
                v-if="control.dataType != 'table' && control.title"
            >
                <v-col
                    class="col-md-5 ml-2 pl-3 ellipsis"
                    style="margin-top: -37px"
                >
                    <v-icon class="fs-14 mr-2 color-normal">{{
                        getIcon(control.dataType)
                    }}</v-icon>
                    <v-tooltip right>
                        <template v-slot:activator="{ on }">
                            <span style="color: red">
                                {{ control.isNull ? ' ' : '*' }}
                            </span>
                            <span v-on="on" class="color-normal">
                                {{
                                    control.title ? control.title : control.name
                                }}
                            </span>
                        </template>
                        {{ control.title ? control.title : control.name }}
                    </v-tooltip>
                </v-col>
                <v-col
                    :class="{ 'col-md-5': showCheckBox }"
                    style="margin-top: -37px; margin-left: 2px"
                >
                    <v-autocomplete
                        :disabled="disabled"
                        class="auto-complete color-normal"
                        :items="
                            nameColumnDetail[table.sheetMap.name]
                                ? nameColumnDetail[table.sheetMap.name]
                                : []
                        "
                        item-text="name"
                        return-object
                        :value="control.dataColumn"
                        @input="
                            (value) =>
                                onChangeDetailInfo(tableIdx, controlIdx, value)
                        "
                        clearable
                        :menu-props="{ 'nudge-top': -10, 'max-width': 300 }"
                    >
                        <template v-slot:item="{ item, on, attrs }">
                            <v-list-item
                                v-show="item.enable"
                                v-on="on"
                                v-bind="attrs"
                            >
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ item.name }}
                                    </v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                    </v-autocomplete>
                </v-col>
                <v-btn
                    v-if="showCheckBox"
                    @click="selectKey(tableIdx, controlIdx)"
                    :disabled="disabled"
                    x-small
                    icon
                    text
                    class="mr-2 key"
                    style="margin-top: -27px"
                >
                    <v-icon
                        :style="{
                            color: control.isKeyControl
                                ? 'orange'
                                : 'rgba(0,0,0,0.2)',
                        }"
                        size="15"
                        style=""
                        >mdi mdi-key-variant</v-icon
                    >
                </v-btn>
                <v-checkbox
                    v-if="showCheckBox"
                    color="orange"
                    :disabled="disabled"
                    @click="selectColumn"
                    style="margin-top: -32px"
                    v-model="control.index"
                >
                </v-checkbox>
            </v-row>
        </div>
    </v-list>
</template>
<script>
export default {
    props: [
        'tables',
        'nameSheets',
        'nameColumnDetail',
        'disabled',
        'showCheckBox',
    ],
    data() {
        return {};
    },
    methods: {
        selectKey(tableIdx, controlIdx) {
            this.tables[tableIdx].controls[controlIdx].isKeyControl =
                !this.tables[tableIdx].controls[controlIdx].isKeyControl;
            this.$emit('change-value');
        },
        selectColumn() {
            this.$emit('change-value');
        },
        sumCount(tableIdx, type) {
            let totalAllRow = 0;
            let totalFilledRow = this.tables[tableIdx].controls.filter(
                (p) => p.dataColumn != null,
            ).length;
            let isFilledKey = this.tables[tableIdx].keyColumn
                ? this.tables[tableIdx].keyColumn.enable
                    ? 1
                    : 0
                : 0;
            if (type != 'user') {
                totalAllRow =
                    this.tables[tableIdx].controls.filter(
                        (p) => p.dataType != 'table',
                    ).length + 1;
            } else {
                totalAllRow = this.tables[tableIdx].controls.filter(
                    (p) => p.dataType != 'table',
                ).length;
            }
            return totalFilledRow + isFilledKey + '/' + totalAllRow;
        },
        //Lấy icon theo kiểu dữ liệu
        getIcon(controlType) {
            let typeMap = {
                number: 'mdi-numeric',
                month: 'mdi-numeric',
                percent: 'mdi-numeric',
                date: 'mdi-calendar-month',
                time: 'mdi-clock-outline',
                datetime: 'mdi-calendar-clock',
                fileUpload: 'mdi-alphabetical-variant',
            };
            if (typeMap[controlType]) {
                return typeMap[controlType];
            } else {
                return 'mdi-alphabetical-variant';
            }
        },
        //Sự kiện xảy ra khi thay đổi tên Sheet
        onChangeSheet(tableIdx, value) {
            // 1. Khi select sheet
            if (value) {
                // chuyển giá trị được chọn thành false
                value.enable = false;
                this.tables[tableIdx].keyColumn = null;
                // đẩy giá trị cũ thành true
                if (this.tables[tableIdx].sheetMap) {
                    this.tables[tableIdx].sheetMap.enable = true;
                }
                // kiểm tra những sheet đã tồn tại khi lấy giá trị từ mapping
                for (let i = 0; i < this.nameSheets.length; i++) {
                    if (
                        this.nameSheets[i].name ==
                        this.tables[tableIdx].sheetMap.name
                    ) {
                        this.nameSheets[i].enable = true;
                    }
                }
                this.tables[tableIdx].sheetMap = value;
                // 2. Khi xóa sheet
            } else {
                let name = this.tables[tableIdx].sheetMap.name;
                this.tables[tableIdx].sheetMap.enable = true;
                this.tables[tableIdx].sheetMap = '';
                this.tables[tableIdx].keyColumn = null;
                for (let i = 0; i < this.nameSheets.length; i++) {
                    if (this.nameSheets[i].name == name) {
                        this.nameSheets[i].enable = true;
                    }
                    for (
                        let j = 0;
                        j < this.nameColumnDetail[name].length;
                        j++
                    ) {
                        this.nameColumnDetail[name][j].enable = true;
                    }
                }
            }
            this.tables[tableIdx].controls.forEach((c) => {
                if (c.dataColumn) c.dataColumn.enable = true;
            });
            this.tables[tableIdx].controls = this.tables[tableIdx].controls.map(
                (c) => ({
                    ...c,
                    dataColumn: null,
                }),
            );
            this.$emit('change-value');
        },
        // Sự kiện xảy ra khi thay đổi từng cột thông in trong sheet
        onChangeDetailInfo(tableIdx, controlIdx, value) {
            // trường hợp đổi trực tiếp
            if (value) {
                value.enable = false;
                if (this.tables[tableIdx].controls[controlIdx].dataColumn) {
                    this.tables[tableIdx].controls[
                        controlIdx
                    ].dataColumn.enable = true;
                }
                for (let i = 0; i < this.nameSheets.length; i++) {
                    let arr = this.nameColumnDetail[this.nameSheets[i].name];
                    for (let j = 0; j < arr.length; j++) {
                        if (
                            this.tables[tableIdx].controls[controlIdx]
                                .dataColumn != null
                        ) {
                            if (
                                this.tables[tableIdx].controls[controlIdx]
                                    .dataColumn.name == arr[j].name
                            ) {
                                this.nameColumnDetail[this.nameSheets[i].name][
                                    j
                                ].enable = true;
                            }
                        }
                    }
                }
                this.tables[tableIdx].controls[controlIdx].dataColumn = value;
                // trường hợp khi ấn dấu xóa
            } else {
                this.tables[tableIdx].controls[
                    controlIdx
                ].dataColumn.enable = true;
                for (let i = 0; i < this.nameSheets.length; i++) {
                    let arr = this.nameColumnDetail[this.nameSheets[i].name];
                    for (let j = 0; j < arr.length; j++) {
                        if (
                            this.tables[tableIdx].controls[controlIdx]
                                .dataColumn != null
                        ) {
                            if (
                                this.tables[tableIdx].controls[controlIdx]
                                    .dataColumn.name == arr[j].name
                            ) {
                                this.nameColumnDetail[this.nameSheets[i].name][
                                    j
                                ].enable = true;
                            }
                        }
                    }
                }
                this.tables[tableIdx].controls[controlIdx].dataColumn = null;
            }
            this.$emit('change-value');
        },
    },
};
</script>

<style lang="scss" scoped>
.ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.auto-complete ::v-deep .v-input__slot {
    background-color: #f7f7f7;
    margin-top: -19px;
    border-image: unset !important;
}
.auto-complete ::v-deep .v-label {
    font-size: 13px;
    padding-left: 10px;
}
.auto-complete ::v-deep .v-input__slot:after {
    border-color: transparent !important;
}

.auto-complete ::v-deep .v-input__slot:before {
    border-color: transparent !important;
}

.auto-complete ::v-deep .v-label--active {
    display: none;
}

.auto-complete ::v-deep .v-list {
    width: 385px !important;
}

.auto-complete ::v-deep .v-select__slot {
    height: 25px;
    margin-left: 10px;
    font-size: 13px !important;
}

.auto-complete ::v-deep .v-input__icon {
    padding-bottom: 6px !important;
}

.auto-complete ::v-deep .v-select__slot > input {
    padding-top: 15px;
}

.auto-complete ::v-deep .v-input__icon > button {
    font-size: 14px !important;
}
</style>

<template>
    <div
        class="mt-2 condition-format"
        :style="{ width: isConfigCard ? '445px;' : '250px;' }"
    >
        <div>
            <div>
                <v-icon size="18">mdi-subtitles-outline</v-icon>
                <span class="fs-13"
                    >{{ $t('table.conditionFormat.name_format_group') }}
                    <span class="color-red">*</span></span
                >
            </div>
            <div class="w-100 mt-2">
                <v-text-field
                    class="sym-small-size name"
                    single-line
                    outlined
                    dense
                    v-model="value.nameGroup"
                    :placeholder="$t('table.conditionFormat.input_format_name')"
                    hide-details
                    @input="validateNameFormat"
                    :disabled="disabled"
                ></v-text-field>
                <div class="error-message" v-if="errorNameFormat">
                    <span>{{
                        $t('table.conditionFormat.validate_name_format')
                    }}</span>
                </div>
            </div>
            <div class="mb-1 mt-2 fs-13">
                {{ $t('table.conditionFormat.apply_for') }}
            </div>
            <div
                style="margin-left: 5px; margin-bottom: 5px"
                class="checkbox"
                v-if="isConfigCard"
            >
                <v-checkbox
                    hide-details
                    style="margin-top: 0px"
                    v-model="value.checkboxSelected"
                    :label="$t('table.conditionFormat.background_card')"
                    value="background"
                    dense
                    :disabled="disabled"
                ></v-checkbox>
                <v-checkbox
                    hide-details
                    style="margin-top: 0px"
                    v-model="value.checkboxSelected"
                    label="Control"
                    value="control"
                    dense
                    :disabled="disabled"
                ></v-checkbox>
            </div>
            <div
                style="
                    border: 1px solid lightgrey;
                    overflow: auto;
                    border-radius: 4px;
                "
                :style="{
                    height:
                        colorType == 'singleColor' && !isConfigCard
                            ? '150px'
                            : '100px'
                }"
            >
                <div
                    :class="{ 'apply-for': true, disableColumn: disableColumn }"
                    v-for="(item, key) in formatTableColumns"
                    :key="key"
                    @click="check(key)"
                >
                    <div
                        :style="{
                            color: item.isSelected
                                ? 'orange'
                                : 'rgba(0, 0, 0,0.87)'
                        }"
                        class="mx-2 check"
                    >
                        <v-icon
                            :style="{
                                color: item.isSelected ? 'orange' : 'grey'
                            }"
                            size="18"
                            class="mr-2"
                            :disabled="disabled"
                        >
                            {{ getDataTypeIcon(item.type) }}
                        </v-icon>
                        <span
                            class="fs-13"
                            :class="{ 'disabled-text': disabled }"
                        >
                            {{ item.name }}
                        </span>
                        <v-icon
                            size="16"
                            v-if="item.isSelected"
                            class="color-orange"
                            style="float: right"
                            :disabled="disabled"
                            >mdi-check</v-icon
                        >
                    </div>
                </div>
            </div>
            <div v-if="!isConfigCard" class="mt-2 fs-13">
                {{ $t('table.conditionFormat.display_mode') }}
            </div>
            <div v-else class="mt-2 fs-13">
                {{ $t('table.conditionFormat.display_mode_single_color') }}
            </div>
            <v-row
                style="margin-top: -10px !important"
                class="ml-2"
                v-if="!isConfigCard"
            >
                <v-radio-group v-model="colorType" row :disabled="disabled">
                    <v-radio
                        :label="$t('v2.showlist.singleColor')"
                        value="singleColor"
                    ></v-radio>
                    <v-radio
                        :label="$t('v2.showlist.colorScale')"
                        value="colorScale"
                    ></v-radio>
                </v-radio-group>
            </v-row>
            <div v-if="colorType == 'singleColor'">
                <SingleColor
                    :style="{ marginTop: isConfigCard ? '10px' : '-20px' }"
                    :isUpdate="isUpdate"
                    ref="singleColor"
                    :rowData="rowData"
                    v-model="value.displayMode.singleColor"
                    :tableColumns="columnConfigCondition"
                    :isConfigCard="isConfigCard"
                    :disabled="disabled"
                />
            </div>
            <div style="margin-top: -20px" v-else>
                <ColorScale
                    :isUpdate="isUpdate"
                    :rowData="rowData"
                    ref="colorScale"
                    v-model="value.displayMode.colorScale"
                    :tableColumns="formatTableColumns"
                />
            </div>
            <div
                class="d-flex justify-end"
                :style="{
                    'margin-top': colorType == 'singleColor' ? '-50px' : '-20px'
                }"
            >
                <v-btn text @click="changeToAdd()">
                    {{ $t('common.back') }}
                </v-btn>
                <v-btn
                    depressed
                    color="orange"
                    @click="save()"
                    :disabled="disabled"
                >
                    <span style="color: white">{{ $t('common.apply') }}</span>
                </v-btn>
            </div>
        </div>
    </div>
</template>
<script>
import ColorScale from './ColorScale';
import SingleColor from './SingleColor';

export default {
    components: {
        ColorScale,
        SingleColor
    },
    methods: {
        refreshAll() {
            // this.value.nameGroup = "";
            // this.value.displayMode.singleColor.backgroundColor = '#FFFFFF';
            // this.value.displayMode.singleColor.fontColor = '#000000';
        },
        save() {
            let check = true;
            if (this.colorType == 'singleColor') {
                this.value.displayMode.type = 'singleColor';
                try {
                    this.$refs.singleColor.getJsScript();
                } catch (error) {}
                if (
                    (this.value.tableColumnsJS == '' ||
                        !this.value.tableColumnsJS) &&
                    this.disableColumn == false
                ) {
                    check = false;
                    this.$snotifyError(
                        this.$t('v2.showlist.error'),
                        this.$t('v2.showlist.notSelectColumnFormat')
                    );
                }
                if (this.value.checkboxSelected.length == 0) {
                    check = false;
                    this.$snotifyError(
                        this.$t('v2.showlist.error'),
                        this.$t('v2.showlist.notSelectScope')
                    );
                }
                if (
                    this.value.displayMode.singleColor.conditionFormat ==
                        ' () ' ||
                    this.value.displayMode.singleColor.conditionFormat == '' ||
                    this.checkEmtyInputConditional()
                ) {
                    check = false;
                    this.$snotifyError(
                        this.$t('v2.showlist.error'),
                        this.$t('v2.showlist.notEnterCondition')
                    );
                }
            } else {
                check = this.$refs.colorScale.handleMinMaxValue();
                this.value.displayMode.type = 'colorScale';
            }
            if (this.disableColumn == true) {
                this.value.tableColumns = this.formatTableColumns;
            }
            if (check) {
                if (
                    this.value.nameGroup.trim().length >= 1 &&
                    this.value.nameGroup.trim().length <= 20
                ) {
                    this.value.nameGroup = this.value.nameGroup.trim();
                    this.$emit('change', this.value);
                    this.$emit('save');
                } else
                    this.$snotifyError(
                        'error',
                        this.$t('table.conditionFormat.validate_name_format')
                    );
            }
        },
        checkEmtyInputConditional() {
            let check = false;
            check = this.$refs.singleColor.checkEmtyInputConditional();
            return check;
        },
        changeToAdd() {
            this.$emit('changeToAdd');
        },
        //chuyển cột được chọn thành script js dạng (column.headerName=='table.id'||column.headerName=='table.note')
        formatSelectedColumnToJS() {
            let selectedCols = [];
            this.formatTableColumns.map((t) => {
                if (t.isSelected) {
                    if (t.name != 'All') {
                        selectedCols.push(
                            'column.headerName=="' + t.headerName + '"'
                        );
                    }
                }
            });
            let result = selectedCols.join('||');
            return result;
        },
        check(index) {
            if (!this.disabled) {
                let allChecked = true;
                this.formatTableColumns.map((column, i) => {
                    if (i == index) {
                        this.formatTableColumns[i].isSelected =
                            !this.formatTableColumns[i].isSelected;
                        if (index == 0) {
                            this.checkAll(column.isSelected);
                        }
                        if (this.formatTableColumns[i].isSelected == false) {
                            this.formatTableColumns[0].isSelected = false;
                        }
                    }
                    if (i != 0) {
                        if (this.formatTableColumns[i].isSelected == false) {
                            allChecked = false;
                        }
                    }
                });

                if (allChecked == true) {
                    this.checkAll(allChecked);
                }
                this.value.tableColumnsJS = this.formatSelectedColumnToJS();
                this.value.tableColumns = this.formatTableColumns;
            }
        },
        checkAll(value = true) {
            this.formatTableColumns.map((column) => {
                column.isSelected = value;
            });
        },
        columnTitle(title) {
            let prefix = this.headerPrefixKeypath;
            prefix =
                prefix[prefix.length - 1] == '.' || prefix == ''
                    ? prefix
                    : prefix + '.';
            if (prefix && title != 'All') {
                return this.$t(prefix + title);
            } else {
                return title;
            }
        },
        setTableColumns() {
            if (!this.isUpdate) {
                let tableColumns = [
                    {
                        title: 'All',
                        name: 'All',
                        type: 'all',
                        isSelected: false
                    }
                ];
                if (!this.isConfigCard) {
                    this.tableColumns.map((column) => {
                        if (column != undefined) {
                            tableColumns.push({
                                title: column.headerName,
                                // name:this.columnTitle(column.headerName),
                                name: column.headerName,
                                type: column.type,
                                field: column.field,
                                isSelected: false,
                                headerName: column.headerName
                            });
                        }
                    });
                } else {
                    this.tableColumns.map((column) => {
                        if (column != undefined) {
                            tableColumns.push({
                                title: column.headerName,
                                name: column.headerName,
                                type: column.type,
                                field: column.field,
                                isSelected: false,
                                headerName: column.headerName
                            });
                        }
                    });
                }
                this.formatTableColumns = tableColumns;
                // filter những cột trùng
                let newArray = [];
                this.formatTableColumns.map((col) => {
                    if (newArray.length > 1) {
                        let check = true;
                        newArray.map((a) => {
                            if (a.field == col.field) {
                                check = false;
                            }
                        });
                        if (check) {
                            newArray.push(col);
                        }
                    } else {
                        newArray.push(col);
                    }
                });
                this.formatTableColumns = newArray;
            } else {
                this.formatTableColumns = this.value.tableColumns;
            }
            this.customListColumnConfigCondition();
        },
        customListColumnConfigCondition() {
            if (this.isConfigCard) {
                if (this.allControlInDoc.length != 0) {
                    this.columnConfigCondition = [...this.allControlInDoc];
                    this.columnConfigCondition.unshift({
                        title: 'All',
                        name: 'All',
                        type: 'all',
                        isSelected: false
                    });
                } else {
                    this.columnConfigCondition = this.formatTableColumns;
                }
            } else this.columnConfigCondition = this.formatTableColumns;
        },
        getDataTypeIcon(type) {
            let typeMap = {
                number: 'mdi-numeric',
                month: 'mdi-numeric',
                percent: 'mdi-numeric',
                date: 'mdi-calendar-month',
                time: 'mdi-clock-outline',
                datetime: 'mdi-calendar-clock'
            };
            if (typeMap[type]) {
                return typeMap[type];
            } else {
                return 'mdi-alphabetical-variant';
            }
        },
        validateNameFormat(value) {
            if (value.trim().length >= 1 && value.trim().length <= 20) {
                this.errorNameFormat = false;
            } else this.errorNameFormat = true;
        }
    },
    created() {
        this.setTableColumns();
        if (this.value.displayMode.type == 'colorScale') {
            this.colorType = 'colorScale';
        } else {
            this.colorType = 'singleColor';
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
        },
        headerPrefixKeypath: {
            type: String,
            default: ''
        },
        isConfigCard: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        allControlInDoc: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            colorType: 'singleColor',
            formatTableColumns: [],
            disableColumn: false,
            errorNameFormat: false,
            columnConfigCondition: []
        };
    },
    watch: {
        'value.checkboxSelected': {
            deep: true,
            immediate: true,
            handler(value) {
                if (value.length == 0) {
                    this.disableColumn = true;
                } else if (value.length == 1 && value[0] == 'background') {
                    this.disableColumn = true;
                } else this.disableColumn = false;
            }
        },
        tableColumns() {
            this.setTableColumns();
        }
    }
};
</script>
<style scoped>
.condition-format ::v-deep .v-label {
    margin-top: -5px !important;
}
.check:hover {
    background: #f5f5f5;
}
.name >>> .v-label {
    margin-top: -5px !important;
    color: grey !important;
}
.checkbox >>> .v-label {
    font-size: 13px;
    color: black;
}
/* .condition-format >>> .v-text-field__details {
        display: flex;
        padding: 0px;
        padding-top: 8px;
        margin: 0px;
    } */
.disableColumn {
    pointer-events: none;
    opacity: 0.4;
}
.error-message {
    font-size: 11px;
    color: red;
    margin-top: 2px;
}
.disabled-text {
    color: #9e9e9e !important;
}
.condition-format >>> .v-treeview-node .v-treeview-node__children {
    max-height: unset !important;
}
</style>

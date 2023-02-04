<template>
    <div
        :class="{
            'mt-1 condition-format': true,
            'border-conditional-format': isBorder,
            'h-100': true
        }"
        :style="{
            height: typeFormart != 'config' ? '265px' : '',
            height:
                typeFormart != 'config' && isConfigCardScheduler ? '470px' : ''
        }"
    >
        <AddConditionalFormatting
            v-if="typeFormart != 'config'"
            :listData="listData"
            @change-format="changeFormat"
            @change-apply="changeApply"
            @changeToConfig="changeToConfig()"
            @click="typeFormart = 'config'"
            :isConfigCard="isConfigCard"
            :disable="disable"
            :isConfigCardScheduler="isConfigCardScheduler"
            :shareConditionalFormat="shareConditionalFormat"
            :listSharedConditionalFormat="listSharedConditionalFormat"
            :listSelectedCondition="listSelectedCondition"
        />
        <ConfigConditionalFormatting
            v-else
            @changeToAdd="changeToAdd()"
            v-model="data"
            @save="save()"
            :isUpdate="update"
            :rowData="rowData"
            :conditionalFormat="conditionalFormat"
            :tableColumns="tableColumns"
            :headerPrefixKeypath="headerPrefixKeypath"
            @click="typeFormart = 'config'"
            :isConfigCard="isConfigCard || isConfigCardScheduler ? true : false"
            :disabled="disableConfig"
            :allControlInDoc="allControlInDoc"
        />
    </div>
</template>
<script>
import AddConditionalFormatting from './AddConditionalFormatting';
import ConfigConditionalFormatting from './ConfigConditionalFormatting';
import { util } from '../../../plugins/util';
export default {
    watch: {
        conditionalFormat: {
            deep: true,
            immediate: true,
            handler(value) {
                this.listData = this.conditionalFormat;
            }
        },
        typeFormart: {
            deep: true,
            immediate: true,
            handler(value) {
                if (value != 'config') {
                    this.$emit('add-conditonal-format');
                } else this.$emit('config-conditional-format');
            }
        }
    },
    created() {
        this.listData = this.conditionalFormat;
    },
    props: {
        listSelectedCondition: {
            type: Array,
            default() {
                return [];
            }
        },
        conditionalFormat: {
            type: Array,
            default() {
                return [];
            }
        },
        isBorder: {
            type: Boolean,
            default: false
        },
        rowData: {
            type: Array,
            default() {
                return [];
            }
        },
        value: {
            type: Object,
            default() {
                return {};
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
        disable: {
            type: Boolean,
            default: false
        },
        allControlInDoc: {
            type: Array,
            default() {
                return [];
            }
        },
        isConfigCardScheduler: {
            type: Boolean,
            default: false
        },
        listSharedConditionalFormat: {
            type: Array,
            default() {
                return [];
            }
        },
        shareConditionalFormat: {
            type: Boolean,
            default: false
        },
        allConditionalFormat: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            disableConfig: false,
            update: false,
            typeFormart: 'add',
            data: {
                nameGroup: '',
                isSelected: true,
                isShare: false,
                tableColumns: [],
                tableColumnsJS: '',
                checkboxSelected: ['control'],
                displayMode: {
                    type: 'singleColor',
                    singleColor: {
                        backgroundColor: '',
                        fontColor: '#000000',
                        italic: false,
                        bold: false,
                        fontSize: 13,
                        underline: false,
                        strike: false,
                        conditionFormat: '',
                        originCondition: []
                    },
                    colorScale: {
                        applyColumn: '',
                        config: [
                            {
                                name: this.$t('v2.showlist.minPoint'),
                                value: '',
                                disable: false,
                                type: this.$t('v2.showlist.minValue'),
                                color: '#FF0000',
                                lists: [
                                    this.$t('v2.showlist.minValue'),
                                    this.$t('v2.showlist.number')
                                ]
                            },
                            {
                                name: this.$t('v2.showlist.midPoint'),
                                value: '',
                                disable: false,
                                type: this.$t('v2.showlist.none'),
                                color: '#FF0000',
                                lists: [
                                    this.$t('v2.showlist.none'),
                                    this.$t('v2.showlist.number')
                                ]
                            },
                            {
                                name: this.$t('v2.showlist.maxPoint'),
                                value: '',
                                disable: false,
                                type: this.$t('v2.showlist.maxVlaue'),
                                color: '#FFFF00',
                                lists: [
                                    this.$t('v2.showlist.maxVlaue'),
                                    this.$t('v2.showlist.number')
                                ]
                            }
                        ],
                        listColors: []
                    }
                }
            },
            dataUpdateIdx: 0,

            listData: [],
            nameGroupUpdate: '',
            conditionalFormatUpdate: ''
        };
    },
    components: {
        ConfigConditionalFormatting,
        AddConditionalFormatting
    },
    methods: {
        changeToConfig() {
            this.typeFormart = 'config';
            this.disableConfig = false;
            this.update = false;
        },
        changeToAdd() {
            this.typeFormart = 'add';
            this.data = null;
            this.data = {
                nameGroup: '',
                isSelected: true,
                isShare: false,
                tableColumns: [],
                tableColumnsJS: '',
                checkboxSelected: ['control'],
                displayMode: {
                    type: 'singleColor',
                    singleColor: {
                        backgroundColor: '',
                        fontColor: '#000000',
                        italic: false,
                        bold: false,
                        fontSize: 13,
                        underline: false,
                        strike: false,
                        conditionFormat: '',
                        originCondition: []
                    },
                    colorScale: {
                        applyColumn: '',
                        config: [
                            {
                                name: this.$t('v2.showlist.minPoint'),
                                value: '',
                                disable: false,
                                type: this.$t('v2.showlist.minValue'),
                                color: '#FF0000',
                                lists: [
                                    this.$t('v2.showlist.minValue'),
                                    this.$t('v2.showlist.number')
                                ]
                            },
                            {
                                name: this.$t('v2.showlist.midPoint'),
                                value: '',
                                disable: false,
                                type: this.$t('v2.showlist.none'),
                                color: '#FF0000',
                                lists: [
                                    this.$t('v2.showlist.none'),
                                    this.$t('v2.showlist.number')
                                ]
                            },
                            {
                                name: this.$t('v2.showlist.maxPoint'),
                                value: '',
                                disable: false,
                                type: this.$t('v2.showlist.maxVlaue'),
                                color: '#FFFF00',
                                lists: [
                                    this.$t('v2.showlist.maxVlaue'),
                                    this.$t('v2.showlist.number')
                                ]
                            }
                        ],
                        listColors: []
                    }
                }
            };
            this.listData = this.conditionalFormat;
            this.update = false;
        },
        changeFormat(data) {
            this.$emit('change-format', data);
            if (data.type == 'edit' || data.type == 'view') {
                this.update = true;
                this.typeFormart = 'config';
                let list =
                    this.listData &&
                    this.listData[data.index] &&
                    this.listData[data.index].key == data.key
                        ? this.listData
                        : this.listSharedConditionalFormat;
                this.data = util.cloneDeep(list[data.index]);
                this.dataUpdateIdx = data.index;
                this.nameGroupUpdate = list[data.index].nameGroup;
                this.conditionalFormatUpdate =
                    list[data.index].displayMode.singleColor.conditionFormat;
                this.disableConfig = data.type == 'view' ? true : false;
            } else {
                this.update = false;
            }
        },
        changeApply(data) {
            this.$emit('change-apply', data);
            this.update = false;
        },
        save() {
            let err = false;
            let errUpdate = false;
            for (let conditionalFormat in this.listData) {
                //check trùng điều kiện của TreeSqlConfig, comment lại lỡ sau này dùng
                // if (
                //     this.data.displayMode.singleColor.conditionFormat ==
                //     this.listData[conditionalFormat].displayMode.singleColor
                //         .conditionFormat
                // ) {
                //     if (this.update) {
                //         if (
                //             this.data.displayMode.singleColor.conditionFormat !=
                //             this.conditionalFormatUpdate
                //         ) {
                //             errUpdate = true;
                //             this.$snotify({
                //                 type: 'error',
                //                 title: this.$t(
                //                     'table.conditionFormat.no_apply_format'
                //                 ),
                //                 text:
                //                     this.$t(
                //                         'table.conditionFormat.duplicate_condition_format'
                //                     ) +
                //                     this.listData[conditionalFormat].nameGroup
                //             });
                //         }
                //     } else {
                //         err = true;
                //         this.$snotify({
                //             type: 'error',
                //             title: this.$t(
                //                 'table.conditionFormat.no_apply_format'
                //             ),
                //             text:
                //                 this.$t(
                //                     'table.conditionFormat.duplicate_condition_format'
                //                 ) + this.listData[conditionalFormat].nameGroup
                //         });
                //     }
                // }
                if (
                    this.data.nameGroup ==
                    this.listData[conditionalFormat].nameGroup
                ) {
                    if (this.update) {
                        if (this.data.nameGroup != this.nameGroupUpdate) {
                            errUpdate = true;
                            this.$snotify({
                                type: 'error',
                                title: this.$t(
                                    'table.conditionFormat.no_apply_format'
                                ),
                                text:
                                    this.$t(
                                        'table.conditionFormat.duplicate_name_format'
                                    ) +
                                    this.listData[conditionalFormat].nameGroup
                            });
                        }
                    } else {
                        err = true;
                        this.$snotify({
                            type: 'error',
                            title: this.$t(
                                'table.conditionFormat.no_apply_format'
                            ),
                            text:
                                this.$t(
                                    'table.conditionFormat.duplicate_name_format'
                                ) + this.listData[conditionalFormat].nameGroup
                        });
                    }
                }
            }
            if (this.update == false && err == false) {
                this.data.key = Date.now();
                this.data.isShare = false;
                this.data.isSelected = true;
                this.listData.push(this.data);
                this.$emit('save', this.data);
                this.changeToAdd();
            }
            if (this.update == true && errUpdate == false) {
                this.data.isSelected = true;
                this.listData[this.dataUpdateIdx] = this.data;
                this.$emit('save', this.data);
                this.changeToAdd();
            }
        }
    }
};
</script>
<style scoped>
.border-conditional-format {
    border: 0.2px solid lightgrey;
    border-radius: 4px;
    padding: 12px;
    height: 470px;
}
</style>

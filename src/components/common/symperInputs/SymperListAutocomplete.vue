<template>
    <v-autocomplete
        v-model="myValue"
        :items="myItems"
        :loading="isLoading"
        :search-input.sync="search"
        :disabled="disabled"
        v-bind="properties"
        :no-filter="true"
        :height="multipleSelection ? '' : 28"
        :item-text="textKey"
        :placeholder="!disabled ? placeholder : ''"
        :item-value="valueKey"
        :append-icon="'mdi-chevron-down'"
        :menu-props="{ maxHeight: menuProp.maxHeight }"
        :multiple="multipleSelection"
        @change="applyChangeValue"
        @click="reAssignItems()"
        @keydown="handleSearch"
        class="symper-autocomplete-input"
        :clearable="false"
    >
        <!-- Kiểu 1: mainAndSub -->
        <template class="w-100" v-slot:selection="{ attr, on, item, selected }">
            <div v-if="showSelection" style="width: 100%" class="itemSelected">
                <v-chip
                    v-if="isSelectionChip"
                    :title="item[textKey] ? item[textKey] : item.name"
                    style="height: 22px"
                    v-bind="attr"
                    :close="deleteable ? true : false"
                    :input-value="selected"
                    @click:close="remove(item)"
                    color="grey lighten-3"
                    class="fs-13 w-100 symper-selected-item-autocomplete"
                    v-on="on"
                >
                    <div
                        class="d-inline-block text-ellipsis"
                        v-if="!multiTitle"
                        style="width: calc(100% - 4px)"
                    >
                        <span
                            v-text="item[valueKey]"
                            v-if="showId"
                            class="mr-2 font-weight-medium fs-12"
                        ></span>
                        <span
                            v-text="item[textKey] ? item[textKey] : item.name"
                            class="fs-12"
                        ></span>
                    </div>
                    <div
                        v-else
                        class="d-inline-block text-ellipsis"
                        style="width: calc(100% - 4px)"
                    >
                        <span
                            v-text="item[valueKey]"
                            v-if="showId"
                            class="mr-2 font-weight-medium fs-12"
                        ></span>
                        <span class="fs-12">{{
                            item.name +
                            '-' +
                            removeTextHTML(
                                item[textKey] ? item[textKey] : item.name
                            )
                        }}</span>
                    </div>
                </v-chip>
                <div v-else class="text-ellipsis w-100">
                    <span
                        v-text="item[valueKey]"
                        v-if="showId"
                        class="mr-2 font-weight-medium fs-12"
                    ></span>
                    <span
                        v-text="item[textKey] ? item[textKey] : item.name"
                        class="fs-12"
                    ></span>
                </div>
            </div>
        </template>
        <template v-slot:item="{ item }" class="w-100">
            <div class="pa-2 w-100">
                <div
                    class="
                        d-flex
                        fs-13
                        font-weight-medium
                        w-100
                        autocomplete-item
                    "
                >
                    <span
                        v-text="item[valueKey]"
                        class="mr-2"
                        v-if="showId"
                    ></span>
                    <span v-text="item[nameKey]"></span>
                </div>
                <div class="w-100 fs-12 text--grey w-100">
                    <span v-text="item[textKey]"></span>
                </div>
            </div>
        </template>
        <template v-slot:prepend-item v-if="showSelectAll">
            <div
                class="d-flex justify-start align-center ml-3 fw-500 fs-13"
                @click="selectAll"
            >
                <v-icon
                    class="mr-1"
                    :size="20"
                    :color="myValue.length > 0 ? 'indigo darken-4' : ''"
                    >{{ icon }}</v-icon
                >
                {{ $t('common.all') }}
            </div>
            <v-divider class="mt-2"></v-divider>
        </template>
    </v-autocomplete>
</template>

<script>
import { util } from '../../../plugins/util';
export default {
    props: {
        showSelectAll: {
            type: Boolean,
            default: false
        },

        deleteable: {
            type: Boolean,
            default: false
        },
        menuProp: {
            type: Object,
            default() {
                return {
                    maxHeight: 250
                };
            }
        },
        value: {
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        },
        displayValue: {
            type: String,
            default: 'name'
        },
        items: {
            type: Array,
            default() {
                return [];
            }
        },
        textKey: {
            // key trong object chứa text để hiển thị lên ô input sau khi chọn được giá trị
            type: String,
            default: 'title'
        },
        subInfo: {
            type: String,
            default: 'title'
        },
        showSelection: {
            type: Boolean,
            default: true
        },
        multiTitle: {
            // dạng multi title
            type: Boolean,
            default: false
        },
        valueKey: {
            // key trong object chứa text để giá trị gán cho component
            type: String,
            default: 'id'
        },
        nameKey: {
            // key trong object chứa text để giá trị gán cho component
            type: String,
            default: 'name'
        },
        onSearch: {
            // hàm xử lý khi input
            default: false
        },
        textHTML: {
            // chuỗi html muốn loại bỏ trong dạng multi title
            type: String,
            default: ''
        },
        showId: {
            default: true
        },
        multipleSelection: {
            default: false
        },
        disabled: {
            type: Boolean,
            default: true
        },
        properties: {
            type: Object,
            default() {
                return {
                    chips: true,
                    clearable: true,
                    flat: true,
                    'small-chips': true,
                    'hide-details': true,
                    dense: true,
                    solo: true
                };
            }
        },
        isSelectionChip: {
            default: true
        },
        isEmitOnSearch: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String,
            default: ''
        },
        subInfo: {
            type: String,
            default: 'title'
        }
    },
    created() {
        this.reAssignItems();
    },
    activated() {
        this.reAssignItems();
    },
    computed: {
        itemClone() {
            return util.cloneDeep(this.items);
        },
        icon() {
            if (this.myItems.length == this.myValue.length) {
                return 'mdi-close-box';
            }
            return 'mdi-checkbox-blank-outline';
        }
    },
    watch: {
        items: {
            deep: true,
            immediate: true,
            handler: function (after, before) {
                this.myItems = util.cloneDeep(after);
            }
        },
        value: {
            deep: true,
            immediate: true,
            handler: function (after, before) {
                this.myValue = after;
            }
        }
    },
    data() {
        return {
            isLoading: false,
            search: '',
            myItems: [],
            myValue: '',
            delayTimer: null
        };
    },
    methods: {
        handleSearch() {
            let self = this;
            this.delayTimer = setTimeout(function () {
                let val = self.search ? self.search.trim() : self.search;
                if (val) val = val.toLowerCase();
                if (self.value.id && !self.multipleSelection && val)
                    self.value.id = '';
                if (self.isEmitOnSearch) {
                    self.$emit('symper-autocomplete-search-vl', val);
                }
                if (!self.onSearch) {
                    if (!val) {
                        self.myItems = util.cloneDeep(self.items);
                    } else {
                        let items = [];
                        self.myItems.map((el, idx) => {
                            if (
                                String(el.id).toLowerCase().includes(val) ||
                                String(el.name).toLowerCase().includes(val) ||
                                String(el.title).toLowerCase().includes(val) ||
                                String(el.modelName).toLowerCase().includes(val)
                            ) {
                                items.push(el);
                            }
                        });
                        self.myItems = items;
                    }
                } else {
                    self.onSearch(val, self);
                }
            }, 300);
        },
        selectAll() {
            if (this.myValue.length === this.myItems.length) {
                this.myValue = [];
            } else {
                this.myValue = this.myItems.slice();
            }
            this.applyChangeValue(this.myValue);
        },
        applyChangeValue(vl) {
            this.$emit('input', vl);
            this.$emit('change', {
                // có thêm items là để set lại danh sách các option trong trường hợp load data từ server
                value: vl,
                items: this.myItems
            });
        },
        removeTextHTML(title) {
            // bỏ span trong thẻ textHTML truyền vào
            let firstTitle = title.split(this.textHTML);
            if (firstTitle.length > 0) firstTitle = firstTitle[0];
            return firstTitle;
        },
        remove(item) {
            if (!this.multipleSelection) {
                this.myValue = '';
                this.applyChangeValue(this.myValue);
            } else {
                this.myValue.map((val, valIdx) => {
                    if (val == item.id) {
                        this.myValue.splice(valIdx, 1);
                    }
                });
            }
        },
        reAssignItems() {
            let self = this;
            setTimeout(
                (self) => {
                    if (self.myItems.length == 0) {
                        self.myItems = self.items;
                    }
                },
                600,
                this
            );
        }
    }
};
</script>

<style scoped>
.text-ellipsis {
    color: var(--symper-text-color-default);
}
.v-list-item--active .autocomplete-item {
    color: var(--symper-text-color-default);
}
.symper-autocomplete-input >>> .mdi-close-circle {
    font-size: 16px !important;
    color: grey !important;
}
.symper-autocomplete-input >>> .v-select__selections {
    font-size: 12px !important;
}
.sym-small-size.v-autocomplete >>> .v-input__slot {
    padding: 0px 4px !important;
}
.v-select.v-input--dense .v-chip {
    margin: 1px 0px !important;
}
</style>
<style>
.column-drag-pos[draggable='true'] {
    background-color: #ffe6d2;
}

.symper-selected-item-autocomplete .v-chip__content {
    width: 100%;
}

.symper-selected-item-autocomplete .v-chip__content {
    width: 100%;
}

div.itemSelected + input {
    flex: 0;
    min-width: 0 !important;
}
</style>

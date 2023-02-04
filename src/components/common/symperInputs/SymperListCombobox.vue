<template>
    <v-combobox
        v-model="myValue"
        :items="myItems"
        :loading="isLoading"
        :search-input.sync="search"
        v-bind="properties"
        :no-filter="true"
        :height="multipleSelection ? '' : 28"
        :item-text="textKey"
        :item-value="valueKey"
        :multiple="multipleSelection"
        return-object
        @change="applyChangeValue"
        class="symper-autocomplete-input"
    >
        <!-- Kiểu 1: mainAndSub -->
        <template class="w-100" v-slot:selection="{ attr, on, item, selected }">
            <v-chip
                v-if="isSelectionChip"
                :title="item[textKey] ? item[textKey] : item.name"
                style="height: 22px"
                v-bind="attr"
                :input-value="selected"
                color="grey lighten-3"
                class="fs-13 w-100 mt-1 symper-selected-item-autocomplete"
                v-on="on"
            >
                <div
                    class="d-inline-block text-ellipsis"
                    style="width: calc(100% - 4px)"
                >
                    <span
                        v-text="item[valueKey]"
                        v-if="showId && !showAvatarUser"
                        class="mr-2 font-weight-medium fs-12"
                    ></span>
                    <span
                        v-else-if="showAvatarUser"
                        class="mr-2 font-weight-medium fs-12"
                    >
                        <symperAvatar
                            :size="20"
                            class="user-avatar"
                            :userId="item[valueKey]"
                        />
                    </span>
                    <span
                        v-text="item[textKey] ? item[textKey] : item.name"
                        class="fs-12"
                    ></span>
                </div>
            </v-chip>
            <div v-else class="text-ellipsis">
                <span
                    v-text="item[valueKey]"
                    v-if="showId && !showAvatarUser"
                    class="mr-2 font-weight-medium fs-12"
                ></span>
                <span
                    v-else-if="showAvatarUser"
                    class="mr-2 font-weight-medium fs-12"
                >
                    <symperAvatar
                        :size="20"
                        class="user-avatar"
                        :userId="item[valueKey]"
                    />
                </span>
                <span
                    v-text="item[textKey] ? item[textKey] : item.name"
                    class="fs-12"
                ></span>
            </div>
        </template>
        <template v-slot:item="{ item }" class="w-100">
            <div class="pa-2 w-100">
                <div
                    class="d-flex fs-13 font-weight-medium w-100 autocomplete-item"
                >
                    <span
                        v-text="item[valueKey]"
                        class="mr-2"
                        v-if="showId && !showAvatarUser"
                    ></span>
                    <span
                        v-else-if="showAvatarUser"
                        class="mr-2 font-weight-medium fs-12"
                    >
                        <symperAvatar
                            :size="20"
                            class="user-avatar"
                            :userId="item[valueKey]"
                        />
                    </span>
                    <span v-text="item[nameKey]"></span>
                </div>
                <div class="w-100 fs-12 text--grey w-100">
                    <span v-text="item[textKey]"></span>
                </div>
            </div>
        </template>
    </v-combobox>
</template>

<script>
import { util } from '../../../plugins/util';
import symperAvatar from '@/components/common/SymperAvatar.vue';

export default {
    components: {
        symperAvatar,
    },
    props: {
        value: {
            default: '',
        },
        items: {
            type: Array,
            default() {
                return [];
            },
        },
        textKey: {
            // key trong object chứa text để hiển thị lên ô input sau khi chọn được giá trị
            type: String,
            default: 'title',
        },
        valueKey: {
            // key trong object chứa text để giá trị gán cho component
            type: String,
            default: 'id',
        },
        nameKey: {
            // key trong object chứa text để giá trị gán cho component
            type: String,
            default: 'name',
        },
        onSearch: {
            // hàm xử lý khi input
            default: false,
        },
        showId: {
            default: true,
        },
        /**
         * Trường hợp thông tin user muốn hiển thị avatar thay cho id
         */
        showAvatarUser: {
            default: false,
        },
        multipleSelection: {
            default: false,
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
                    solo: true,
                };
            },
        },
        isSelectionChip: {
            default: true,
        },
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
    },
    watch: {
        items: {
            deep: true,
            immediate: true,
            handler: function (after, before) {
                this.myItems = util.cloneDeep(after);
            },
        },
        value: {
            deep: true,
            immediate: true,
            handler: function (after, before) {
                // if (Object.keys(after) >0) {
                this.myValue = after;
                // }else{
                //     this.myValue = {id:"",name:after,title:after};
                // }
            },
        },
        search() {
            clearTimeout(this.delayTimer);
            let self = this;
            this.delayTimer = setTimeout(function () {
                let val = self.search;
                if (!self.onSearch) {
                    if (!val) {
                        self.myItems = util.cloneDeep(self.items);
                    } else {
                        self.myItems = self.myItems.filter((el, idx) => {
                            if (
                                String(el.id).includes(val) ||
                                String(el.name).includes(val) ||
                                String(el.title).includes(val) ||
                                String(el.modelName).includes(val)
                            ) {
                                return true;
                            }
                            return false;
                        });
                    }
                } else {
                    self.onSearch(val, self);
                }
            }, 300);
        },
    },
    data() {
        return {
            isLoading: false,
            search: '',
            myItems: [],
            myValue: '',
            delayTimer: null,
        };
    },
    methods: {
        applyChangeValue(vl) {
            let item = {};
            if (typeof vl == 'string') {
                item.id = '';
                item.name = vl;
            } else {
                item = vl;
            }

            this.$emit('input', item);
            this.$emit('change', {
                // có thêm items là để set lại danh sách các option trong trường hợp load data từ server
                value: item,
                items: this.myItems,
            });
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
                this,
            );
        },
    },
};
</script>

<style scoped>
.symper-autocomplete-input >>> .v-select__slot .v-input__append-inner {
    display: none;
}
.text-ellipsis {
    color: var(--symper-text-color-default);
}
::v-deep .v-list-item--active .autocomplete-item {
    color: var(--symper-text-color-default);
}
</style>
<style>
.column-drag-pos[draggable='true'] {
    background-color: #ffe6d2;
}

.symper-selected-item-autocomplete .v-chip__content {
    width: 100%;
}
</style>

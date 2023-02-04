<template>
    <div>
        <v-card outlined :style="{height: isViewDialog ? '550px !important': '500px !important', 'border': isViewDialog ? 'none': '0.2px solid lightgrey', 'width': '500px'}">
            <v-card-title v-if="isViewDialog" class="fs-15 d-flex justify-space-between pl-9 pr-4">
                {{ $t('table.tree_view.group_config') }}
                <span class="action pl-2">
                    <v-btn
                        small
                        color="success"
                        @click="applyConfig"
                        :disabled="
                            validateData || validateControl || action == 'view'
                        "
                    >
                        {{ $t('common.save') }}
                    </v-btn>
                    <v-btn
                        small
                        text
                        icon
                        class="ml-1"
                        color="red darken-1"
                        @click="cancel"
                    >
                        <v-icon :size="15" small>mdi-close</v-icon>
                    </v-btn>
                </span>
            </v-card-title>
            <v-card-text class="ml-3">
                <div
                    class="dialog-tree-config overflow-scroll color-black"
                    style="height: 420px"
                >
                    <div class="mb-1 fs-13" v-if="isConfigNameGroup">
                        <span
                            >{{ $t('table.tree_view.name_group')
                            }}<span style="color: red"> *</span></span
                        >
                        <!-- {{$t('table.tree_view.name_group')}} * -->
                    </div>
                    <div style="width: 416px" v-if="isConfigNameGroup">
                        <v-text-field
                            solo
                            :placeholder="$t('table.tree_view.enter_name')"
                            class="name-group-tree"
                            :rules="[rules.max, rules.required, rules.notSpace]"
                            v-model="item.title"
                            :disabled="action == 'view'"
                        ></v-text-field>
                    </div>
                    <div class="my-2 fs-13 mt-6" v-if="isConfigNameGroup">
                        {{ $t('table.tree_view.divide_level') }}
                    </div>
                    <NotFoundScreen :emptyDataKey="'document-tree-mode'" v-if="item.children.length == 0" />
                    <div
                        v-for="(childItem, j) in item.children"
                        :key="j"
                        class="mt-1"
                    >
                        <span class="mb-1 fs-13">
                            {{ $t('table.tree_view.level') }} {{ j + 1 }}
                        </span>
                        <span v-if="!childItem.value" style="color:red; float: right; margin-right: 26px; font-size: 11px;">* {{ $t('validate.required') }}</span>
                        <span v-else-if="childItem.errorDuplicate" style="color:red; float: right; margin-right: 26px; font-size: 11px;">* {{ $t('validate.duplicateData') }}</span>
                        <div class="d-flex">
                            <div :style="{ width: j == 0 && !noLimitTree ? '416px' : '100%' }">
                                <v-autocomplete
                                    solo
                                    flat
                                    outlined
                                    @keydown="validateEmptyValue"
                                    :placeholder="
                                        $t('table.tree_view.select_control')
                                    "
                                    :items="tableColumnsClone"
                                    dense
                                    item-value="field"
                                    item-text="headerName"
                                    v-model="childItem.value"
                                    :disabled="action == 'view'"
                                    append-icon="mdi-chevron-down"
                                    hide-details
                                    @change="validate"
                                >
                                    <template v-slot:item="data">
                                        <div class="fs-13 py-1">
                                            <span class="fw-400">{{
                                                data.item.columnTitle
                                                    ? columnTitle(
                                                            data.item.columnTitle
                                                        )
                                                    : columnTitle(
                                                            data.item.headerName
                                                        )
                                            }}</span>
                                        </div>
                                    </template>
                                    <template v-slot:selection="data">
                                        <div class="fs-13 py-1">
                                            <span class="fw-400">{{
                                                data.item.columnTitle
                                                    ? columnTitle(
                                                            data.item.columnTitle
                                                        )
                                                    : columnTitle(
                                                            data.item.headerName
                                                        )
                                            }}</span>
                                        </div>
                                    </template>
                                </v-autocomplete>
                            </div>
                            <v-btn
                                class="mx-1 mt-1"
                                x-small
                                icon
                                tile
                                v-if="j > 0 || noLimitTree"
                                @click="removeLevel(item.children, childItem)"
                                :disabled="action == 'view'"
                            >
                                <v-icon small color="red"> mdi-close </v-icon>
                            </v-btn>
                        </div>
                    </div>
                </div>
                <v-btn
                    style="width: 416px; background: #fb7e00; color: white"
                    small
                    class="mt-2"
                    @click="addLevel(item)"
                    :disabled="action == 'view'"
                >
                    <v-icon small class="mb-1 mt-1 mr-1"> mdi-plus </v-icon>
                    {{ $t('table.tree_view.add_level') }}
                </v-btn>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { util } from '@/plugins/util';
import NotFoundScreen from '@/components/common/NotFoundScreen';
export default {
    components: {
        NotFoundScreen
    },
    data() {
        return {
            validateControl: true,
            rules: {
                required: (value) => !!value || this.$t('validate.required'),
                max: (v) =>
                    v.length <= 20 ||
                    this.$t('validate.max_number').replace('{number}', 20),
                notSpace: (v) => {
                    if (v.trim() == '' && v.split(' ').length > 0) {
                        return this.$('validate.allSpace');
                    } else {
                        return false;
                    }
                }
            },
        };
    },
    computed: {
        validateData() {
            let flag = false;
            const self = this;
            this.validateControl = false;
            if (this.item.children) {
                this.item.children.forEach(function (e) {
                    if (!e.value || Object.keys(e.value).length == 0) {
                        self.validateControl = true;
                    }
                });
            }
            let checkAllSpace =
                this.item.title &&
                this.item.title.trim() == '' &&
                this.item.title.split(' ').length > 0;
            if (
                this.item.title == '' ||
                (this.item.title && this.item.title.length > 20) ||
                checkAllSpace
            ) {
                flag = true;
            }
            return flag;
        },

        tableColumnsClone() {
            let arr = util.cloneDeep(this.tableColumns);
            arr.shift();
            return arr;
        }
    },
    props: {
        tableColumns: {
            type: Array,
            default() {
                return {};
            }
        },
        headerPrefixKeypath: {
            type: String,
            default: ''
        },
        action: {
            type: String,
            default: ''
        },
        item: {
            type: Object,
            default() {
                return {};
            }
        },
        isViewDialog: {
            type: Boolean,
            default: false
        },
        isConfigNameGroup: {
            type: Boolean,
            default: true            
        },
        noLimitTree: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        validateEmptyValue() {
            const self = this;
            this.validateControl = false;
            if (this.item.children) {
                this.item.children.forEach(function (e) {
                    if (JSON.stringify(e.value) == '{}' || !e.value) {
                        self.validateControl = true;
                    }
                });
            }
            return self.validateControl
        },
        columnTitle(title) {
            let prefix = this.headerPrefixKeypath;
            prefix =
                prefix[prefix.length - 1] == '.' || prefix == ''
                    ? prefix
                    : prefix + '.';
            if (prefix) {
                return this.$t(prefix + title);
            } else {
                return title;
            }
        },
        addLevel(item) {
            // if(item.children.length  == 5){
            // this.$snotify({
            //     type: "info",
            //     title: "Chỉ có thể cấu hình 5 cấp"
            // })
            // }else{
            let length = item.children.length + 1;
            item.children.push({
                title: this.$t('v2.showlist.level') + length,
                value: ''
            });
            // }
        },
        removeLevel(parent, child) {
            parent.splice(parent.indexOf(child), 1);
            this.validate();
        },
        cancel() {
            this.$emit('close-dialog');
        },
        applyConfig() {
            let flag = this.validate();
            if (flag) {
                this.$emit('config-item', this.item, this.action);
            } else {
                this.$snotifyError(
                    '',
                    this.$t('v2.showlist.duplicateData')
                );
            }
        },
        validate() {
            let flag = true;
            let arr = [];
            this.item.children.forEach(function (e) {
                if (arr.includes(e.value)) {
                    e.errorDuplicate = true
                    flag = false;
                    return;
                } else {
                    e.errorDuplicate = false
                    arr.push(e.value);
                }
            });
            return flag;
        }
    }
};
</script>

<style scoped>
.dialog-tree-config .name-group-tree >>> .v-input__slot {
    box-shadow: unset !important;
    border: 1px solid lightgray;
}
.dialog-tree-config >>> .v-input__slot {
    min-height: 32px !important;
}
.dialog-tree-config >>> .v-input__control {
    min-height: unset !important;
    height: 28px !important;
    flex-direction: unset !important;
    margin-bottom: 2px !important;
}
.dialog-tree-config >>> .v-input__slot input {
    font-size: 13px !important;
}

.dialog-tree-config >>> .v-btn--contained {
    box-shadow: unset !important;
}
.name-group-tree >>> .v-input--radio-group .v-messages {
    display: block !important;
}
.name-group-tree >>> .v-text-field__details {
    display: block !important;
}
.name-group-tree >>> .v-messages__message {
    font-size: 11px !important;
    margin-left: -12px;
}
</style>

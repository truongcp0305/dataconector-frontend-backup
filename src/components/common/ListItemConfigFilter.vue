<template>
    <div class="list-filter">
        <v-list dense class="px-0">
            <span
                v-if="
                    action == 'view' &&
                    filter.filter((filter) => !filter.isShared).length > 0
                "
                >{{ $t('v2.showlist.myFilter') }}</span
            >
            <v-list-item
                dense
                class="filter-menu cursor-pointer fs-13 px-0 py-1"
                v-for="(item, key) in filter.filter(
                    (filter) => !filter.isShared
                )"
                v-show="!item.isShared"
                :key="'myFilter' + key"
                style="display: flex; align-items: center"
            >
                <v-list-item-content @click="selectFilter(item.uniqueId)">
                    <v-list-item-title class="col-md-10 fw-400" style="my-auto">
                        <span class="ml-2 filter-menu__item">{{
                            item.name.length < 50
                                ? item.name
                                : item.name.slice(0, 50) + '...'
                        }}</span>
                    </v-list-item-title>
                    <v-list-item-subtitle
                        class="fw-400 ml-5"
                        style="font-size: 9px !important; margin-top: -19px"
                    >
                        <span
                            :style="{
                                opacity:
                                    item.uniqueId == defaultApplyedFilterId
                                        ? 1
                                        : 0
                            }"
                            >{{ $t('common.default') }}</span
                        >
                    </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-icon class="show-icon">
                    <v-menu offset-y nudge-left="-20">
                        <template v-slot:activator="{ on: config }">
                            <i
                                class="mdi mdi-cog-outline config-filter-icon mr-1"
                                v-on="{ ...config }"
                            ></i>
                        </template>
                        <v-list dense>
                            <v-list-item
                                v-if="item.uniqueId != defaultApplyedFilterId"
                                class="action-filter"
                                @click="selectActionFilter(2, item.uniqueId)"
                            >
                                <v-icon style="font-size: 14px !important"
                                    >mdi-check-box-multiple-outline</v-icon
                                >
                                <span class="fs-13">
                                    {{ $t('table.filter.Default') }}
                                </span>
                            </v-list-item>
                            <v-list-item
                                v-else
                                class="action-filter"
                                @click="selectActionFilter(3, item.uniqueId)"
                            >
                                <v-icon style="font-size: 14px !important"
                                    >mdi-check-box-multiple-outline</v-icon
                                >
                                <span class="fs-13">
                                    {{ $t('table.filter.Delete Default') }}
                                </span>
                            </v-list-item>
                            <v-list-item
                                class="action-filter"
                                v-for="(action, keyAction) in actionFilter"
                                :key="keyAction"
                                @click="
                                    selectActionFilter(keyAction, item.uniqueId)
                                "
                            >
                                <span class="fs-13">
                                    {{ action.content }}
                                </span>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-list-item-icon>
            </v-list-item>
            <span>{{ $t('v2.showlist.sharedFilter') }}</span>
            <v-list-item
                dense
                class="filter-menu cursor-pointer fs-13 px-0 py-1"
                v-for="(item, key) in filter.filter(
                    (filter) => filter.isShared
                )"
                v-show="item.isShared"
                :key="'sharedFilter' + key"
                style="display: flex; align-items: center"
            >
                <v-list-item-content @click="selectFilter(item.uniqueId)">
                    <v-list-item-title class="col-md-10 fw-400" style="my-auto">
                        <span class="ml-2 filter-menu__item">{{
                            item.name.length < 50
                                ? item.name
                                : item.name.slice(0, 50) + '...'
                        }}</span>
                    </v-list-item-title>
                    <v-list-item-subtitle
                        class="fw-400 ml-5"
                        style="font-size: 9px !important; margin-top: -19px"
                    >
                        <span
                            :style="{
                                opacity:
                                    item.uniqueId == defaultApplyedFilterId
                                        ? 1
                                        : 0
                            }"
                            >{{ $t('common.default') }}</span
                        >
                    </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-icon class="show-icon">
                    <v-menu offset-y nudge-left="-20">
                        <template v-slot:activator="{ on: config }">
                            <i
                                class="mdi mdi-cog-outline config-filter-icon mr-1"
                                v-on="{ ...config }"
                            ></i>
                        </template>
                        <v-list dense>
                            <v-list-item
                                v-if="
                                    item.uniqueId != defaultApplyedFilterId &&
                                    action == 'view'
                                "
                                class="action-filter"
                                @click="selectActionFilter(2, item.uniqueId)"
                            >
                                <v-icon style="font-size: 14px !important"
                                    >mdi-check-box-multiple-outline</v-icon
                                >
                                <span class="fs-13">
                                    {{ $t('table.filter.Default') }}
                                </span>
                            </v-list-item>
                            <v-list-item
                                v-if="
                                    item.uniqueId == defaultApplyedFilterId &&
                                    action == 'view'
                                "
                                class="action-filter"
                                @click="selectActionFilter(3, item.uniqueId)"
                            >
                                <v-icon style="font-size: 14px !important"
                                    >mdi-check-box-multiple-outline</v-icon
                                >
                                <span class="fs-13">
                                    {{ $t('table.filter.Delete Default') }}
                                </span>
                            </v-list-item>
                            <v-list-item
                                class="action-filter"
                                v-for="(
                                    configAction, keyAction
                                ) in actionFilter"
                                :key="keyAction"
                                v-show="action != 'view'"
                                @click="
                                    selectActionFilter(keyAction, item.uniqueId)
                                "
                            >
                                <!-- <v-icon  class=" mr-1 " style="font-size:14px!important">{{action.icon}}</v-icon> -->
                                <span class="fs-13">
                                    {{ configAction.content }}
                                </span>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-list-item-icon>
            </v-list-item>
            <v-list-item class="w-100 fs-13 add-filter" @click="addFilter()">
                <i
                    style="margin-left: -12px"
                    class="mdi mdi-plus mr-1 color-green"
                ></i>
                <span class="color-green"> {{ $t('common.add') }}</span>
            </v-list-item>
        </v-list>
    </div>
</template>
<script>
export default {
    data() {
        return {
            actionFilter: [
                {
                    icon: 'mdi-lead-pencil',
                    content: this.$t('v2.showlist.edit')
                },
                {
                    icon: 'mdi mdi-close',
                    content: this.$t('v2.showlist.delete')
                }
            ]
        };
    },
    methods: {
        addFilter() {
            this.$emit('add-filter-config');
        },
        selectFilter(uniqueId) {
            let filterIdx;
            this.filter.find((filter, idx) => {
                if (filter.uniqueId == uniqueId) {
                    filterIdx = idx;
                    return true;
                }
            });
            this.$emit('select-filter', filterIdx);
        },
        selectActionFilter(actionIdx, uniqueId) {
            let filterIdx;
            this.filter.forEach((filter, idx) => {
                if (filter.uniqueId == uniqueId) {
                    filterIdx = idx;
                }
            });
            let data = {
                type: '',
                filterIdx: filterIdx
            };
            switch (actionIdx) {
                case 2:
                    data.type = 'setDefaultFilter';
                    break;
                case 3:
                    data.type = 'unsetDefaultFilter';
                    break;
                case 0:
                    data.type = 'editFilter';
                    break;
                case 1:
                    data.type = 'deleteFilter';
                    break;
            }
            this.$emit('config-filter-action', data);
        }
    },
    props: {
        defaultApplyedFilterId: {
            default: ''
        },
        action: {
            default: 'view'
        },
        filter: {
            type: Array,
            default() {
                return [];
            }
        }
    }
};
</script>
<style scoped>
.list-filter {
    background: #ffffff;
    padding: 10px;
}
.filter-menu {
    height: 35px !important;
}
.filter-menu:hover,
.add-filter:hover,
.action-filter:hover {
    background: #f5f5f5;
}
.filter-menu__item {
    cursor: pointer;
}
</style>

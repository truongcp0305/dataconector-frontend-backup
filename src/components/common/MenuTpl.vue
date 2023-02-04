<template>
    <v-list class="menu-tpl-wrapper">
        <v-list-item
            v-for="(item, i) in allMenuItems"
            :key="i"
            class="menu-tpl-item"
            @click="onItemCLick(item, {}, i)"
        >
            <v-list-item-title
                v-if="item.type == 'simple'"
                class="menu-tpl-item__title"
            >
                <v-icon x-small v-if="item.icon">
                    {{ item.icon }}
                </v-icon>
                {{ item.title }}
            </v-list-item-title>
            <v-list-item-title
                v-else-if="item.type == 'simpleWithCheck'"
                class="menu-tpl-item__title"
            >
                <v-icon x-small v-if="item.icon">
                    {{ item.icon }}
                </v-icon>
                <span style="display: flex; justify-content: space-between">
                    {{ item.title }}
                    <v-icon color="success" x-small v-if="item.value">
                        mdi-check
                    </v-icon>
                </span>
            </v-list-item-title>

            <v-list-item-title v-else-if="item.type == 'subMenus'">
                <v-menu offset-x>
                    <template v-slot:activator="{ on, attrs }">
                        <v-list-item-title
                            class="grey-hover py-2 px-3"
                            v-bind="attrs"
                            v-on="on"
                        >
                            {{ item.title }}
                        </v-list-item-title>
                    </template>
                    <v-list>
                        <v-list-item
                            class="px-0"
                            v-for="(subItem, index) in item.subItems"
                            :key="index"
                        >
                            <v-list-item-title
                                @click="
                                    onItemCLick(subItem, { parentItem: item })
                                "
                                class="grey-hover py-2 px-4"
                            >
                                <span class="float-left">{{
                                    subItem.title
                                }}</span>
                                <i
                                    class="float-right mdi mdi-check"
                                    v-if="subItem.checked"
                                ></i>
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-list-item-title>
        </v-list-item>
    </v-list>
</template>

<script>
export default {
    props: {
        allMenuItems: {
            type: Object,
            default() {
                return {};
            }
        },
        isMenuInDashboardConfig: {
            type: Boolean,
            default: true
        },
        instanceKey: {
            default: ''
        },
        reportId: {
            default: ''
        },
        selectingSubItem: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    methods: {
        onItemCLick(item, extra, key) {
            if (this.isMenuInDashboardConfig) {
                if (!extra) {
                    extra = {};
                }
                extra.selectingSubItem = this.selectingSubItem;
                if (!item.notHandle) {
                    this.$evtBus.$emit(
                        'dashboard-setting-item-options-clicked',
                        {
                            event: item.event,
                            instanceKey: this.instanceKey,
                            reportId: this.reportId,
                            data: {
                                item,
                                extra,
                                key: key
                            }
                        }
                    );
                }
            } else {
                this.$emit('on-menu-tpl-item-click', key);
            }
        }
    }
};
</script>

<style>
.menu-tpl-item {
    min-height: unset !important;
    padding: unset !important;
    margin: -6px 2px;
}
.menu-tpl-item :hover {
    cursor: pointer;
    background-color: #f5f5f5;
}
.menu-tpl-item .menu-tpl-item__title {
    padding: 8px 12px;
    font-size: 13px !important;
}
</style>

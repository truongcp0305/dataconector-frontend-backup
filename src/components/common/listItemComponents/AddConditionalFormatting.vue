<template>
    <div class="conditional-format h-100">
        <div
            :style="{
                height: 'calc(100% - 70px) !important',
                overflow: isConfigCard ? 'scroll' : 'unset'
            }"
        >
            <div
                v-if="
                    listData.length == 0 &&
                    listSharedConditionalFormat.length == 0
                "
                class="d-flex"
                style="
                    flex-direction: column;
                    align-items: center;
                    padding-top: 150px;
                    height: calc(100% - 12px) !important;
                "
            >
                <img
                    :src="
                        require('@/../public/img/notFoundScreen/conditional-format.svg')
                    "
                    class="notFoundScreen mb-3"
                />
                <span
                    :style="{
                        marginTop: isConfigCardScheduler ? '180px' : '',
                        'font-size': '13px',
                        display: 'block'
                    }"
                >
                    {{ $t('table.conditionFormat.no_conditional_format') }}
                </span>
            </div>
            <div v-else style="height: calc(100% - 12px) !important">
                <span class="fs-13 d-block fw-500" style="color: #959595">{{
                    $t('v2.showlist.myConditionalFormat')
                }}</span>
                <TransitionGroup tag="ul" name="fade" class="container">
                    <div
                        :key="data.key"
                        style="padding: 0"
                        dense
                        class="center-item"
                        v-for="(data, dataIdx) in listData"
                    >
                        <v-avatar
                            class="mr-3 my-1 ml-1"
                            :style="{
                                background:
                                    data.displayMode.singleColor
                                        .backgroundColor,
                                'background-image': getBackgroundColor(
                                    dataIdx,
                                    listData
                                )
                            }"
                            tile
                            style="
                                margin-left: -12px;
                                border-radius: 4px !important;
                                height: 36px;
                                min-width: 36px;
                                width: 36px;
                            "
                        >
                            <div
                                :style="{
                                    color: data.displayMode.singleColor
                                        .fontColor
                                }"
                            >
                                abc
                            </div>
                        </v-avatar>

                        <span class="fs-13 d-inline-block w-100">{{
                            data.nameGroup
                        }}</span>

                        <v-switch
                            @click="
                                handleAction(
                                    'apply',
                                    dataIdx,
                                    data.isSelected,
                                    listData
                                )
                            "
                            v-model="data.isSelected"
                            :key="data.key"
                            :color="'var(--symper-color)'"
                            class="mr-1 mt-0 pt-0 switch-btn"
                            inset
                        ></v-switch>

                        <v-menu
                            offset-y
                            nudge-left="0"
                            nudge-top="0"
                            :close-on-content-click="false"
                        >
                            <template v-slot:activator="{ on: menu }">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-icon
                                            class="mr-2 icon-setting"
                                            v-on="{ ...on, ...menu }"
                                            @click.prevent.stop
                                            small
                                            >mdi-cog-outline</v-icon
                                        >
                                    </template>
                                    <span>{{
                                        $t('v2.showlist.setting')
                                    }}</span>
                                </v-tooltip>
                            </template>
                            <v-list dense class="pl-1 pr-1">
                                <v-list-item
                                    class="action-treeview"
                                    @click="
                                        handleAction(
                                            'edit',
                                            dataIdx,
                                            null,
                                            listData
                                        )
                                    "
                                >
                                    <span class="fs-13">
                                        {{ $t('common.update') }}
                                    </span>
                                </v-list-item>
                                <v-list-item
                                    class="action-treeview"
                                    @click="
                                        handleAction(
                                            'share',
                                            dataIdx,
                                            null,
                                            listData
                                        )
                                    "
                                    v-if="
                                        shareConditionalFormat && !data.isShare
                                    "
                                >
                                    <span class="fs-13">
                                        {{ $t('common.share') }}
                                    </span>
                                </v-list-item>
                                <v-list-item
                                    class="action-treeview"
                                    @click="
                                        handleAction(
                                            'unShare',
                                            dataIdx,
                                            null,
                                            listData
                                        )
                                    "
                                    v-else-if="
                                        shareConditionalFormat &&
                                        data.isShare == true
                                    "
                                >
                                    <span class="fs-13">
                                        {{ $t('common.unShare') }}
                                    </span>
                                </v-list-item>
                                <v-list-item
                                    class="action-treeview"
                                    @click="
                                        handleAction(
                                            'view',
                                            dataIdx,
                                            null,
                                            listData
                                        )
                                    "
                                >
                                    <span class="fs-13">
                                        {{ $t('common.view') }}
                                    </span>
                                </v-list-item>
                                <v-list-item
                                    class="action-treeview"
                                    @click="
                                        handleAction(
                                            'delete',
                                            dataIdx,
                                            null,
                                            listData
                                        )
                                    "
                                >
                                    <span class="fs-13">
                                        {{ $t('common.delete') }}
                                    </span>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </TransitionGroup>
                <span class="fs-13 d-block fw-500" style="color: #959595">{{
                    $t('v2.showlist.sharedConditionalFormat')
                }}</span>

                <TransitionGroup tag="ul" name="fade" class="container">
                    <div
                        :key="data.key"
                        style="padding: 0"
                        dense
                        class="center-item"
                        v-for="(data, dataIdx) in listSharedConditionalFormat"
                    >
                        <v-avatar
                            class="mr-3 my-1 ml-1"
                            :style="{
                                background:
                                    data.displayMode.singleColor
                                        .backgroundColor,
                                'background-image': getBackgroundColor(
                                    dataIdx,
                                    listSharedConditionalFormat
                                )
                            }"
                            tile
                            style="
                                margin-left: -12px;
                                border-radius: 4px !important;
                                height: 36px;
                                min-width: 36px;
                                width: 36px;
                            "
                        >
                            <div
                                :style="{
                                    color: data.displayMode.singleColor
                                        .fontColor
                                }"
                            >
                                abc
                            </div>
                        </v-avatar>

                        <span class="fs-13 d-inline-block w-100">{{
                            data.nameGroup
                        }}</span>

                        <v-switch
                            @click="
                                handleAction(
                                    'apply',
                                    dataIdx,
                                    data.isSelected,
                                    listSharedConditionalFormat
                                )
                            "
                            v-model="data.isSelected"
                            :key="data.key"
                            :color="'var(--symper-color)'"
                            class="mr-1 mt-0 pt-0 switch-btn"
                            inset
                        ></v-switch>

                        <v-menu offset-y nudge-left="0" nudge-top="0">
                            <template v-slot:activator="{ on: menu }">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-icon
                                            class="mr-2 icon-setting"
                                            v-on="{ ...on, ...menu }"
                                            @click.prevent.stop
                                            small
                                            >mdi-cog-outline</v-icon
                                        >
                                    </template>
                                    <span>{{
                                        $t('v2.showlist.setting')
                                    }}</span>
                                </v-tooltip>
                            </template>
                            <v-list dense class="pl-1 pr-1">
                                <v-list-item
                                    class="action-treeview"
                                    @click="
                                        handleAction(
                                            'view',
                                            dataIdx,
                                            null,
                                            listSharedConditionalFormat
                                        )
                                    "
                                >
                                    <span class="fs-13">
                                        {{ $t('common.view') }}
                                    </span>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </TransitionGroup>
            </div>
        </div>
        <div class="d-flex justify-center">
            <v-btn
                @click="changeToConfig()"
                depressed
                class="fs-13 pa-2 add-conditional-format fw-400"
                style="height: 28px"
                :disabled="disable"
            >
                <span style="color: white">{{
                    $t('table.conditionFormat.add_condition')
                }}</span>
            </v-btn>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        listSelectedCondition: {
            type: Array,
            default() {
                return [];
            }
        },
        listData: {
            type: Array,
            default() {
                return [];
            }
        },
        isConfigCard: {
            type: Boolean,
            default: false
        },
        disable: {
            type: Boolean,
            default: false
        },
        isConfigCardScheduler: {
            type: Boolean,
            default: false
        },
        shareConditionalFormat: {
            type: Boolean,
            default: false
        },
        listSharedConditionalFormat: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    mounted() {
        this.listDataIdSelected = this.listSelectedCondition;
    },
    methods: {
        getBackgroundColor(index, list) {
            let result = '';
            if (list[index].displayMode.type != 'singleColor') {
                let colorMin =
                    list[index].displayMode.colorScale.config[0].color;
                let colorMid =
                    list[index].displayMode.colorScale.config[1].color;
                let colorMax =
                    list[index].displayMode.colorScale.config[2].color;
                if (colorMid == colorMid) {
                    result =
                        'linear-gradient(' + colorMin + ',' + colorMax + ')';
                } else {
                    result =
                        'linear-gradient(' +
                        colorMin +
                        ',' +
                        colorMid +
                        ', ' +
                        colorMax +
                        ')';
                }
            }
            return result;
        },
        setNumber(index) {
            return String(index + 1).padStart(3, '0');
        },
        handleAction(action, dataIdx, value, list) {
            if (action == 'apply' && value == true) {
                // chọn
                this.listDataIdSelected.push(list[dataIdx].key);
                this.$emit('change-apply', {
                    listSelectedCondition: this.listDataIdSelected,
                    index: dataIdx
                });
            } else {
                if (action == 'apply' && value == false) {
                    // bỏ chọn
                    list[dataIdx].isSelected = false;
                    this.listDataIdSelected = this.listDataIdSelected.filter(
                        (i) => i != list[dataIdx].key
                    );
                    action = 'disApply';
                }
                if (action == 'share') {
                    list[dataIdx].isShare = true;
                } else if (action == 'unShare') {
                    list[dataIdx].isShare = false;
                }
                let data = {};
                data = {
                    type: action,
                    key: list[dataIdx].key,
                    index: dataIdx
                };
                this.$emit('change-format', data);
            }
        },
        changeToConfig() {
            this.$emit('changeToConfig');
        },
        checkIsSelected(dataIdxSelected) {
            let check = false;
            if (this.listData[dataIdxSelected].isSelected) {
                check = true;
            }
            this.listDataIdSelected.map((data) => {
                if (data == dataIdxSelected) {
                    check = true;
                }
            });
            return check;
        }
    },
    data() {
        return {
            dataIdxSelected: -1,
            listDataIdSelected: []
        };
    }
};
</script>
<style scoped>
.conditional-format >>> .v-list {
    overflow: unset !important;
}
.conditional-format >>> .v-input--switch--inset .v-input--switch__track,
.v-input--switch--inset .v-input--selection-controls__input {
    width: 36px !important;
}
.conditional-format >>> .v-input--switch__thumb {
    width: 14px !important;
    height: 14px !important;
    top: calc(50% - 9px) !important;
}
.conditional-format >>> .v-input--switch--inset .v-input--switch__track {
    height: 18px !important;
    top: calc(50% - 11px) !important;
    left: -2px;
}
.conditional-format >>> .v-icon.v-icon::after {
    border-radius: 4px !important;
}
.conditional-format >>> .v-icon.v-icon {
    border-radius: 4px !important;
}
.conditional-format >>> .mdi:before,
.mdi-set {
    padding: 1px !important;
}
.conditional-format
    >>> .v-application--is-ltr
    .v-input--switch
    .v-input--selection-controls__ripple {
    left: -17px !important;
}
.conditional-format >>> .v-input--switch .v-input--selection-controls__ripple {
    top: calc(50% - 26px) !important;
}
.conditional-format >>> .add-conditional-format {
    background: rgb(251, 126, 0, 0.9) !important;
    color: white !important;
    width: 50% !important;
}
.conditional-format >>> .add-conditional-format:hover {
    background: rgba(251, 126, 0, 1) !important;
}
.conditional-format >>> .icon-setting {
    margin-bottom: 3px !important;
}
.conditional-format >>> .v-input--switch.v-input--switch--inset {
    margin-top: -1px !important;
}
.conditional-format >>> .v-input--selection-controls__ripple:before {
    content: none;
}
.conditional-format >>> .switch-btn {
    height: 20px;
}
.conditional-format >>> .v-input--is-dirty .v-input--selection-controls__ripple,
.conditional-format >>> .v-input--is-dirty .v-input--switch__thumb {
    transform: translate(18px, 0) !important;
}
.conditional-format >>> .v-list-item {
    transition: all 0.3s ease 0s;
}
.container {
    position: relative;
    padding: 0;
    height: unset !important;
}
.item {
    width: 100%;
    height: 30px;
    background-color: #f3f3f3;
    border: 1px solid #666;
    box-sizing: border-box;
}
.fade-move,
.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: scaleY(0.01) translate(30px, 0);
}
.fade-leave-active {
    position: absolute;
}
</style>
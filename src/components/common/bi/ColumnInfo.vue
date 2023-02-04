<template>
    <div>
        <div
            class="single-row px-4 item-column-dataset justify-space-between"
            @click="handlerColumnClick(infoColumn, $event)"
            :class="{
                'px-4': configPadding == 4,
                'px-3': configPadding == 3,
                'px-2': configPadding == 2,
                'px-1': configPadding == 1,
            }"
        >
            <i
                v-if="infoColumn.calculation == 'measure'"
                style="margin-left: -16px; margin-right: -12px; color: blue"
                class="mdi mdi-calculator fs-13"
            ></i>
            <i
                v-if="infoColumn.calculation == 'customColumn'"
                style="margin-left: -16px; margin-right: -12px; color: blue"
                class="mdi mdi-function-variant fs-13"
            ></i>
            <div
                class="text-ellipsis flex-grow-1"
                :style="{
                    'max-width': infoColumn.calculation ? '43%' : '100%',
                }"
            >
                <v-icon color="#000" class="fs-14 pr-2">{{
                    icon[infoColumn.type]
                }}</v-icon>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <span
                            :title="infoColumn.title"
                            v-on="on"
                            class="mr-2"
                            :class="{ highlight: infoColumn.isSelected }"
                        >
                            {{ infoColumn.title }}</span
                        >
                    </template>
                    <span>{{ infoColumn.title }}</span>
                </v-tooltip>
            </div>
            <div
                class="float-right d-flex"
                style="color: #909399; max-width: 50%"
            >
                <span
                    class="text-ellipsis"
                    :title="
                        infoColumn.name
                            ? infoColumn.name
                            : infoColumn.columnName
                    "
                    >{{
                        infoColumn.name
                            ? infoColumn.name
                            : infoColumn.columnName
                    }}</span
                >
                <v-icon
                    title="Remove"
                    v-if="showIconRemove || infoColumn.calculation"
                    @click.prevent.stop="removeItem(infoColumn)"
                    x-small
                    class="ml-2 mr-1"
                    >mdi-close</v-icon
                >
            </div>
        </div>
    </div>
</template>

<script>
import { DATATYPE_ICONS } from '@/components/dataflow/configPool/dataflowConfig.js';
export default {
    props: {
        infoColumn: {
            type: Object,
            default() {
                return {};
            },
        },
        showIconRemove: {
            type: Boolean,
            default: false,
        },
        configPadding: {
            type: Number,
            default: 4,
        },
    },
    data() {
        return {
            icon: DATATYPE_ICONS,
        };
    },
    methods: {
        removeItem(item) {
            this.$emit('remove-item', item);
        },
        handlerColumnClick(infoColumn, evt) {
            if (infoColumn.calculation) {
                this.$emit('config-caculated-column', infoColumn, evt);
            }
        },
    },
};
</script>

<style scoped>
.single-row:hover {
    background: #f5f5f5;
    cursor: all-scroll;
}
.item-column-dataset {
    display: flex;
    margin-top: 6px;
    font-size: 12px;
}
.highlight {
    color: #f58634;
}
.icon-remove-calculated-column {
    display: none;
}
.item-column-dataset:hover .icon-remove-calculated-column {
    display: inline-block;
}
</style>

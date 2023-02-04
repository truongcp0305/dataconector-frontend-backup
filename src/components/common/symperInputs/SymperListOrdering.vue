<template>
    <draggable
        class="list-group mt-1"
        tag="div"
        v-model="items"
        v-bind="dragOptions"
        @start="dragging = true"
        @end="handleStopDragItem"
    >
        <transition-group
            type="transition"
            :name="!dragging ? 'flip-list' : null"
        >
            <div
                class="fs-13 px-2 py-1 column-drag-pos"
                v-for="item in items"
                :key="item.text"
            >
                <v-icon size="18" class="mr-2" v-if="item.preIcon">{{
                    item.preIcon
                }}</v-icon>
                <span class="fs-13" X>{{ item.text }}</span>
                <v-icon
                    size="18"
                    class="mr-2 float-right"
                    v-if="item.subIcon"
                    >{{ item.subIcon }}</v-icon
                >
            </div>
        </transition-group>
    </draggable>
</template>

<script>
import draggable from 'vuedraggable';
import { util } from '../../../plugins/util';

export default {
    components: {
        draggable,
    },
    props: {
        /**
         * mảng cần sắp xếp, có dạng
         * [
         *      {
         *          text: '',
         *          preIcon: '',
         *          subIcon: ''
         *      }
         * ]
         */
        value: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    watch: {
        value: {
            deep: true,
            handler() {
                this.items = util.cloneDeep(this.value);
            },
        },
    },
    data() {
        return {
            items: [],
            dragging: false,
            dragOptions: {
                animation: 200,
                group: 'list-item-orderring',
                disabled: false,
                ghostClass: 'ghost-item',
            },
        };
    },
    methods: {
        handleStopDragItem() {
            this.dragging = false;
            this.$emit('input', this.items);
        },
    },
    mounted() {
        this.items = util.cloneDeep(this.value);
    },
};
</script>

<style>
.column-drag-pos[draggable='true'] {
    background-color: #ffe6d2;
}
</style>

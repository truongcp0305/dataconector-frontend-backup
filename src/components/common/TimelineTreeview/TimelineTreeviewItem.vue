<template>
    <div
        class="time-line-treeview-item"
        :style="{
            'padding-left': itemIndent + 'px',
            'min-height': minItemHeight + 'px',
        }"
    >
        <div
            class="milestone-marker"
            :style="{
                top: (minItemHeight - 8) / 2 + 'px',
            }"
        ></div>
        <div
            :class="{
                bold: isFolder,
                'single-row': true,
            }"
            @click="toggle"
            @dblclick="makeFolder"
            class="tree-item-content"
            :style="{
                height: minItemHeight + 'px',
                'line-height': minItemHeight + 'px',
            }"
        >
            <slot name="item-content" :itemData="item">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <div
                            @click="selectedItem(item)"
                            v-on="on"
                            class="text-ellipsis"
                        >
                            <v-icon style="font-size: 16px">{{
                                item.icon
                            }}</v-icon>
                            <span class="pl-1" style="color: #000000cc">{{
                                item.name
                            }}</span>
                        </div>
                    </template>
                    <span>{{ item.name }}</span>
                </v-tooltip>
            </slot>
        </div>
        <div
            v-show="isOpen"
            v-if="isFolder"
            :style="{
                'padding-left': '5px',
            }"
        >
            <TimelineTreeviewItem
                :minItemHeight="minItemHeight"
                :itemIndent="itemIndent"
                class="item"
                v-for="(child, index) in item.children"
                :key="index"
                :item="child"
            >
                <template slot="item-content" slot-scope="{ itemData }">
                    <slot name="item-content" :itemData="itemData"></slot>
                </template>
            </TimelineTreeviewItem>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TimelineTreeviewItem',
    props: {
        item: Object,
        itemIndent: {
            type: Number,
            default: 15,
        },
        minItemHeight: {
            type: Number,
            default: 25,
        },
    },
    data: function () {
        return {
            isOpen: true,
        };
    },
    computed: {
        isFolder: function () {
            return this.item.children && this.item.children.length;
        },
    },
    methods: {
        toggle: function () {
            if (this.isFolder) {
                this.isOpen = !this.isOpen;
            }
        },
        makeFolder: function () {
            if (!this.isFolder) {
                this.$emit('make-folder', this.item);
                this.isOpen = true;
            }
        },
        selectedItem(item) {
            this.$evtBus.$emit('selected-item-audit-trail', item);
        },
    },
};
</script>

<style>
.milestone-marker {
    position: absolute;
    width: 8px;
    height: 8px;
    left: -5px;
    border-radius: 50%;
    border: 1px solid #707070;
    background-color: white;
}

.time-line-treeview-item {
    position: relative;
    color: #707070;
    border-left: 3px solid #dddddd;
}

.tree-item-content {
    font-size: 14px;
}
.text-ellipsis:hover {
    cursor: pointer;
}
.single-row:hover {
    background: #f5f5f5;
    cursor: pointer;
}
</style>

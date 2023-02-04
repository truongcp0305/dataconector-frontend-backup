<template>
    <div
        v-show="isShow"
        :position-x="x"
        :position-y="y"
        absolute
        offset-x
        :max-height="200"
        :nudge-width="220"
        :close-on-content-click="false"
        class="menu-list-column"
    >
        <div style="margin: 12px 6px">
            <v-list-item
                v-for="(item, i) in listColumn"
                :key="i"
                @click="chooseItem(item)"
            >
                <img
                    class="icon-control"
                    :src="
                        require('./../../../../../public/img/document' +
                            item.icon)
                    "
                />
                <v-list-item-content>
                    <v-list-item-title>
                        <span>{{ item.title }}</span>
                        <span
                            style="
                                font: 10px roboto;
                                font-weight: 400;
                                padđing-left: 4px;
                            "
                            >{{ item.name }}</span
                        ></v-list-item-title
                    >
                </v-list-item-content>
                <v-icon
                    v-if="listColumnSelected.includes(item)"
                    color="green lighten-1"
                    >mdi-check-outline</v-icon
                >
            </v-list-item>
        </div>
    </div>
</template>

<script>
import { util } from '@/plugins/util.js';
export default {
    data() {
        return {
            x: null,
            y: null,
            isShow: false,
        };
    },
    props: {
        listColumnSelected: {
            type: Array,
        },
        searchKey: {
            type: String,
            default: '',
        },
        listColumn: {
            type: Array,
        },
    },
    methods: {
        chooseItem(item) {
            this.$emit('item-clicked', item);
        },
        show(e) {
            this.isShow = true;
            this.x = e.clientX + 40;
            this.y = e.clientY + 20;
        },
    },
    watch: {
        searchKey(val) {},
    },
};
</script>

<style scoped>
.menu-list-column {
    box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2),
        0px 8px 10px 1px rgba(0, 0, 0, 0.14),
        0px 3px 14px 2px rgba(0, 0, 0, 0.12);
}
.v-menu__content {
    background-color: #ffffff !important;
}
.v-menu__content .v-icon {
    font-size: 10px !important;
}
.v-menu__content .v-avatar {
    height: 12px !important;
    width: 12px !important;
    min-width: unset !important;
}
.v-menu__content .v-list-item__content .v-list-item__title {
    font: 13px roboto;
}

.v-menu__content .v-list-item__action .v-btn {
    width: 12px;
    height: 12px;
}
.v-menu__content .v-list-item {
    min-height: unset;
    height: 30px;
    padding: 0px 4px;
}
.v-menu__content {
    margin-bottom: 20px;
}
.icon-control {
    height: 12px;
    width: 12px;
    margin-right: 8px;
}
</style>

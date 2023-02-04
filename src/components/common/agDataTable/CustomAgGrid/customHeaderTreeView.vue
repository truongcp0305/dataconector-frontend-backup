<template>
    <div class="custom-header-treeView">
        <div>{{ params.displayName }}</div>
        <div class="header-menu-treeview">
            <v-tooltip bottom z-index="200">
                <template v-slot:activator="{ on: tooltip }">
                    <v-icon
                        v-on="{ ...tooltip }"
                        @click="synchronized"
                        class="fs-15 icon"
                        small
                        dark
                        >mdi-rotate-3d-variant</v-icon
                    >
                </template>
                <span>{{ $t('v2.general.syncDataWithRecordList') }}</span>
            </v-tooltip>
            <v-tooltip bottom z-index="200">
                <template v-slot:activator="{ on: tooltip }">
                    <v-icon
                        v-on="{ ...tooltip }"
                        @click="synchronizedOff"
                        class="fs-15 icon"
                        small
                        dark
                        >mdi-reload</v-icon
                    >
                </template>
                <span>{{ $t('v2.general.unSync') }}</span>
            </v-tooltip>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            showListHaveFilter: false
        };
    },
    methods: {
        synchronized() {
            this.$evtBus.$emit(
                'showlist-tree-view-synchronized-filter',
                true,
                this.params.instanceKey
            );
        },
        synchronizedOff() {
            this.$evtBus.$emit(
                'showlist-tree-view-synchronized-filter',
                false,
                this.params.instanceKey
            );
        }
    }
};
</script>
<style>
.custom-header-treeView {
    width: 100%;
    display: flex;
    color: black;
    justify-content: space-between;
    align-items: center;
}
.custom-header-treeView > .header-menu-treeview > .icon {
    border-radius: 7px;
    padding: 7px 13px;
    color: black !important;
}
.custom-header-treeView > .header-menu-treeview > .icon:hover {
    color: #f58634 !important;
    /* background-color: rgba(0, 0, 0, 0) !important; */
}
.custom-header-treeView > .header-menu-treeview > .icon:active {
    background-color: none !important;
}
.custom-header-treeView > button {
}
.custom-header-treeView > button:hover {
    /* background-color: rgba(0, 0, 0, 0) !important; */
}
</style>

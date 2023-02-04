<template>
    <div class="header-ag-grid d-flex w-100">
        <div class="custom-header-label flex-grow-1">
            {{ params.displayName }}
        </div>
        <i
            class="fs-13 mdi mdi-cog-outline mr-1 symper-header-menu-options"
            @click="showMenuOptions"
            ref="menuOptions"
        ></i>
        <i
            style="margin-right: -7px"
            v-if="!params.column.colDef.noFilter"
            :class="{
                'applied-filter': params.filteredColumns[params.column.colId],
                'fs-13 symper-table-dropdown-button mdi mdi-filter-variant symper-filter-button': true,
            }"
            :col-name="params.column.colDef.field"
            ref="filterIcon"
            onclick="tableDropdownClickHandle(this,event)"
        ></i>
    </div>
</template>

<script>
export default {
    methods: {
        showMenuOptions() {
            if(this.$refs.filterIcon){
                this.params.showColumnMenu(this.$refs.filterIcon);
            }
        },
    },
};
</script>

<style>
.header-ag-grid {
    position: relative;
}
.custom-header-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.symper-header-menu-options {
    display: none;
}

.header-ag-grid:hover .symper-header-menu-options {
    display: inline-block;
}
</style>

<template>
    <div :title="item.aliasName" style="position: relative; width: 95%">
        <v-icon x-small>
            {{
                item.type == 'doc'
                    ? 'mdi-file-document-multiple-outline'
                    : 'mdi-database-arrow-right-outline'
            }}
        </v-icon>
        <span class="fs-13 ml-1 mt-1">{{
            item.symperId + ' - ' + item.name
        }}</span>
        
        <v-icon
            @click="handleRemoveItem"
            class="icon-remove-dataset-item"
            v-if="showRemove"
            small
            >mdi-close</v-icon
        >
    </div>
</template>
<script>
export default {
    props: {
        item: {
            default() {
                return {};
            },
        },
        showRemove: {
            default: false,
        },
    },
    components: {},
    methods: {
        handleRemoveItem() {
            this.$emit('remove-item', this.item);
        },
    },
};
</script>
<style>
.icon-remove-dataset-item {
    position: absolute !important;
    right: 0px;
    top: 4px;
}
</style>

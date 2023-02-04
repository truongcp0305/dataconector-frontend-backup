<template>
    <v-autocomplete
        class="sym-select fs-13"
        dense
        flat
        :value="model"
        :items="allColumns"
        :item-text="itemText"
        :item-value="itemValue"
        outlined
        @change="change"
    >
        <template v-slot:item="{ item }">
            <column-info
                class="w-100"
                :infoColumn="item"
                :configPadding="configPadding"
            />
        </template>
    </v-autocomplete>
</template>

<script>
import ColumnInfo from './ColumnInfo.vue';
export default {
    components: {
        ColumnInfo,
    },
    computed: {},
    props: {
        itemText: {
            type: String,
            default: 'title',
        },
        itemValue: {
            type: String,
            default: 'columnName',
        },
        allColumns: {
            type: Array,
            default() {
                return [];
            },
        },
        model: {
            type: String,
            default: '',
        },
        ikey: {
            default: '',
        },
        object: {
            type: Object,
            default() {
                return {};
            },
        },
        configPadding: {
            type: Number,
            default: 4,
        },
    },
    methods: {
        change(vl) {
            let data = {};
            data.ikey = this.ikey;
            data.value = vl;
            data.object = this.object;
            this.$emit('change-value', data);
        },
    },
};
</script>

<style scoped>
.sym-select {
    height: 30px !important;
}
.sym-select >>> .v-input__slot {
    min-height: 20px !important;
    height: 28px;
}
.sym-select >>> .v-input__append-inner {
    margin-top: 3px !important;
}
</style>

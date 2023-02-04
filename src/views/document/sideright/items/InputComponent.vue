<template>
    <div>
        <v-autocomplete
            v-if="typeInput == 'autocomplete'"
            :disabled="disabled"
            :items="listColumn"
            return-object
            :value="value"
            :item-text="itemValue"
            :class="{ condition: hideCondition ? true : false }"
            class="
                tree__list-columns
                symper-small-autocomplete symper-autocomplete-input
            "
            @change="onChangeConfig"
            :itemValue="itemValue"
            dense
            solo
        >
            <template v-slot:item="data">
                <div v-if="!showSubTitle">
                    <ColumnInfo
                        v-if="customAutocomplete"
                        :infoColumn="data.item"
                    />
                    <div class="d-flex" v-else>
                        <span class="fs-13">
                            {{ data.item.title }}
                        </span>
                    </div>
                </div>
                <div v-else>
                    <div class="pa-2 w-100">
                        <div class="w-100 fs-12 text--grey w-100">
                            <span v-html="data.item.title"></span>
                        </div>
                    </div>
                </div>
            </template>
            <template v-slot:selection="data">
                <div
                    v-if="customAutocomplete"
                    class="d-flex"
                    :title="data.item[typeShow] + ' (' + data.item.title + ') '"
                >
                    <span class="fs-13 ml-1">
                        {{ data.item[typeShow] }}
                    </span>
                </div>
                <div v-else>
                    <span class="fs-13">
                        {{ data.item.name ? data.item.name : data.item.title }}
                    </span>
                </div>
            </template>
        </v-autocomplete>

        <v-combobox
            v-if="typeInput == 'combobox'"
            :disabled="disabled"
            :items="listColumn"
            :value="value"
            :item-text="'title'"
            :item-value="'id'"
            @change="onChangeConfig"
            @update:search-input="input"
            dense
            solo
            class="tree__list-columns symper-small-autocomplete"
        >
            <template v-slot:item="{ item }" class="w-100">
                <div class="pa-2 w-100">
                    <div
                        class="
                            d-flex
                            fs-13
                            font-weight-medium
                            w-100
                            autocomplete-item
                        "
                    >
                        <span v-text="item.title" class="mr-2"></span>
                    </div>
                    <div class="w-100 fs-12 text--grey w-100">
                        <span v-text="item.name"></span>
                    </div>
                </div>
            </template>
            <template v-slot:no-data class="w-100">
                <div>
                    <span class="fs-13 pa-2 no-data">
                        {{ $t('smartObject.set_data.before') }}
                        <span class="font-weight-bold">{{
                            '"' + string + '"'
                        }}</span>
                        {{ $t('smartObject.set_data.after') }}
                    </span>
                </div>
            </template>
        </v-combobox>
    </div>
</template>

<script>
import ColumnInfo from '@/components/common/bi/ColumnInfo';
export default {
    components: {
        ColumnInfo
    },
    computed: {
        string() {
            return this.dataCol;
        }
    },
    props: {
        listColumn: {
            type: Array
        },
        value: {
            type: Object
        },
        customAutocomplete: {
            type: Boolean,
            default: false
        },
        item: {
            type: Object
        },
        showSubTitle: {
            type: Boolean,
            default: false
        },
        itemValue: {
            type: String,
            default: 'name'
        },
        hideCondition: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            defautl: false
        },
        typeShow: {
            type: String,
            default: 'columnName'
        },
        typeInput: {
            type: String,
            default: 'autocomplete'
        }
    },
    data() {
        return {
            dataCol: ''
        };
    },
    methods: {
        onChangeConfig(column) {
            if (typeof column == 'string') {
                this.dataCol = column;
            }
            this.$emit('change', column);
            this.$emit('change-input', column);
        },
        input(data) {
            this.dataCol = data;
        }
    }
};
</script>

<style>
</style>
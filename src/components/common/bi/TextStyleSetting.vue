<template>
    <div
        class="d-inline-block symper-text-style-setting d-flex"
        style="width: fit-content"
    >
        <div
            v-for="(item, name) in items"
            :key="name"
            class="mr-1 ml-1 style-item"
        >
            <v-icon
                class="fs-16"
                @click="value[name] = !value[name]"
                :class="value[name] ? ' selected' : ''"
                v-if="item.type == 'check'"
            >
                {{ item.icon }}
            </v-icon>
            <v-text-field
                class="d-inline-block sym-input fs-12"
                single-line
                v-if="item.type == 'number'"
                outlined
                v-model="value[name]"
                hide-details
                type="number"
                dense
                flat
            ></v-text-field>

            <v-menu
                v-if="item.type == 'color'"
                scrollable
                :close-on-content-click="false"
            >
                <template v-slot:activator="{ on: menu }">
                    <v-icon
                        v-on="menu"
                        :style="{
                            'border-bottom': '3px solid ' + value[name],
                        }"
                        @click="showColorSelector($event, name)"
                    >
                        {{ item.icon }}
                    </v-icon>
                </template>
                <PickColor
                    :showButton="true"
                    @input="selectedColor"
                    v-if="isShowPickColor"
                    v-model="value[name]"
                />
            </v-menu>
        </div>
    </div>
</template>

<script>
import PickColor from '../listItemComponents/PickColor.vue';
export default {
    components: { PickColor },
    methods: {
        showColorSelector(e, name) {
            this.keyValue = name;
            this.isShowPickColor = true;
        },
        selectedColor(color) {
            this.value[this.keyValue] = color;
            this.isShowPickColor = false;
        },
    },
    props: {
        value: {
            type: Object,
            default() {
                return {
                    background: '#FFFFFF',
                    fontColor: '#000000',
                    italic: false,
                    bold: false,
                    fontSize: 13,
                    underline: false,
                    strike: false,
                };
            },
        },
    },
    computed: {},
    data() {
        let self = this;
        return {
            keyValue: '',
            isShowPickColor: false,
            items: {
                italic: {
                    type: 'check',
                    icon: 'mdi-format-italic',
                    text: self.$t('v2.bi.italic'),
                },
                bold: {
                    type: 'check',
                    icon: 'mdi-format-bold',
                    text: self.$t('v2.bi.bold'),
                },
                underline: {
                    type: 'check',
                    icon: 'mdi-format-underline',
                    text: self.$t('v2.bi.underLine'),
                },
                strike: {
                    type: 'check',
                    icon: 'mdi-format-strikethrough-variant',
                    text: self.$t('v2.bi.strikeThrough'),
                },
                fontSize: {
                    type: 'number',
                    text: self.$t('v2.bi.fontSize'),
                },
                background: {
                    type: 'color',
                    icon: 'mdi-format-color-fill',
                    text: self.$t('v2.bi.backgroundColor'),
                },
                fontColor: {
                    type: 'color',
                    icon: 'mdi-format-color-highlight',
                    text: self.$t('v2.bi.fontColor'),
                },
            },
        };
    },
};
</script>

<style scoped>
.symper-text-style-setting .style-item {
    margin-right: 1px;
}

.symper-text-style-setting .icon-as-btn {
    font-size: 13px;
}

.symper-text-style-setting .style-item .selected {
    background-color: #f5863417;
    color: #f58634;
}
.sym-input >>> .v-input__control .v-input__slot {
    padding: 2px 4px !important;
    min-height: 20px !important;
    height: 20px !important;
    width: 50px !important;
}
</style>

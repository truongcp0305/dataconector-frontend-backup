<template>
    <div class="px-1">
        <div
            class="color-palette-item"
            v-for="(color, idx) in myValue"
            :key="idx"
        >
            <div
                class="item-color"
                :style="{
                    'background-color': color ? color : '',
                }"
                @click="showPickColor(color, idx)"
            ></div>
            <v-icon @click="removeColorPaletteItem(idx)" class="remove-btn"
                >mdi-close-circle</v-icon
            >
        </div>
        <div class="color-palette-item" style="top: 0px">
            <div
                class="item-color"
                style="display: inline-block; text-align: center"
                @click="addColor"
            >
                <span
                    style="
                        top: 1px;
                        position: absolute;
                        left: 8px;
                        font-size: 16px;
                    "
                    >+</span
                >
            </div>
        </div>
        <v-dialog v-model="isShow" scrollable content-class="dialog-pick-color">
            <div>
                <pick-color
                    :value="colorSelected"
                    :showButton="true"
                    @input="handleSelected"
                />
            </div>
        </v-dialog>
    </div>
</template>

<script>
import PickColor from '@/components/common/listItemComponents/PickColor.vue';
import { util } from '@/plugins/util';

export default {
    components: {
        PickColor,
    },
    watch: {
        value: {
            deep: true,
            immediate: true,
            handler: function (after, before) {
                this.myValue = util.cloneDeep(after);
            },
        },
    },
    props: {
        value: {
            type: Array,
            default: [
                '#333333',
                '#bababa',
                '#01B8AA',
                '#374649',
                '#FD625E',
                '#F2C80F',
                '#5F6B6D',
                '#8AD4EB',
                '#FE9666',
                '#A66999',
                '#73B761',
                '#4A588A',
                '#ECC846',
                '#CD4C46',
            ],
        },
        items: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        return {
            isShow: false,
            myValue: [],
            colorSelected: '',
            indexSelect: -1,
        };
    },
    methods: {
        addColor() {
            this.myValue.push('#000');
            this.$emit('input', this.myValue);
            this.$emit('change', {
                value: this.myValue,
            });
        },
        handleSelected(color) {
            this.isShow = false;
            this.myValue[this.indexSelect] = color;
            this.$emit('input', this.myValue);
            this.$emit('change', {
                value: this.myValue,
            });
        },
        showPickColor(color, index) {
            this.isShow = true;
            this.indexSelect = index;
            this.colorSelected = color;
        },
        removeColorPaletteItem(idx) {
            this.myValue.splice(idx, 1);
            this.$emit('input', this.myValue);
            this.$emit('change', {
                value: this.myValue,
            });
        },
    },
};
</script>

<style scoped>
.color-palette-item {
    position: relative;
    display: inline-block;
    cursor: pointer;
}
.item-color:hover {
    border: 1px solid yellow;
}
.remove-btn {
    display: none;
    position: absolute;
    right: -1px;
    top: -1px;
    color: red;
    font-size: 13px;
    cursor: pointer;
    font-weight: bold;
}
.color-palette-item:hover .remove-btn {
    display: block;
}
.item-color {
    height: 18px;
    width: 18px;
    padding: 0px !important;
    display: inline-block;
    border-radius: 4px;
    margin: 4px;
    border: var(--symper-border);
}
::v-deep .dialog-pick-color {
    width: auto !important;
}
</style>

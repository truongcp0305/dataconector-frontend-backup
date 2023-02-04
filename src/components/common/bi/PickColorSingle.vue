<template>
    <div class="px-1">
        <v-menu top offset-y :close-on-content-click="false">
            <template v-slot:activator="{ on, attrs }">
                <div class="d-flex" v-on="on" v-bind="attrs">
                    <div
                        class="item-color"
                        :style="{
                            'background-color': myValue ? myValue : '',
                        }"
                    ></div>
                    <div>
                        <input
                            style="margin-top: 3px"
                            v-on:input="changeValueInput"
                            :value="myValue"
                            type="text"
                        />
                    </div>
                </div>
            </template>
            <pick-color :value="myValue" @input="handleSelected" />
        </v-menu>
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
            type: String,
            default: '#CD4C46',
        },
    },
    data() {
        return {
            myValue: '',
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
            this.myValue = color;
            this.$emit('input', this.myValue);
            this.$emit('change', {
                value: this.myValue,
            });
        },
        changeValueInput(e) {
            if (this.debounce) {
                clearTimeout(this.debounce);
            }
            this.debounce = setTimeout(
                (self) => {
                    let vl = e.target.value;
                    self.myValue = vl;
                    self.$emit('input', self.myValue);
                    self.$emit('change', {
                        value: self.myValue,
                    });
                },
                300,
                this,
            );
        },
    },
};
</script>

<style scoped>
.item-color {
    /* height: 18px;
    width: 18px; */
    padding: 8px !important;
    display: inline-block;
    border-radius: 4px;
    margin: 4px;
    border: var(--symper-border);
}
::v-deep .dialog-pick-color {
    width: auto !important;
}
.focus-visible {
    border: 1px solid #acacac;
    outline: none;
    padding-left: 2px;
    border-radius: 3px;
}
</style>

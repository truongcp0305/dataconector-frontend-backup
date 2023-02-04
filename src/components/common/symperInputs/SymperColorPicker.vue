<template>
    <div
        class="symper-color-picker sym-small-size"
        :style="{
            width: isNaN(width) ? width : width + 'px',
        }"
    >
        <v-text-field
            v-model="color"
            @change="handleChangeValue"
            hide-details
            class="ma-0 pa-0"
            solo
            flat
            full-width
        >
            <template v-slot:append>
                <v-menu
                    v-model="menu"
                    top
                    nudge-bottom="105"
                    nudge-left="16"
                    :close-on-content-click="false"
                >
                    <template v-slot:activator="{ on }">
                        <div :style="swatchStyle" v-on="on" />
                    </template>
                    <v-card>
                        <v-card-text class="pa-0">
                            <v-color-picker
                                v-model="color"
                                @input="handleChangeValue"
                                flat
                            />
                        </v-card-text>
                    </v-card>
                </v-menu>
            </template>
        </v-text-field>
    </div>
</template>

<script>
export default {
    data() {
        return {
            color: '#1976D2FF',
            menu: false,
        };
    },
    methods: {
        handleChangeValue(value) {
            this.$emit('input', value);
            this.$emit('change', value);
        },
    },
    props: {
        value: {
            type: String,
            default: '#FFFFFF',
        },
        width: {
            default: 120,
        },
    },
    watch: {
        value: {
            immediate: true,
            handler(afterValue) {
                this.color = afterValue;
            },
        },
    },
    computed: {
        swatchStyle() {
            const { color, menu } = this;
            return {
                backgroundColor: color,
                cursor: 'pointer',
                height: '20px',
                width: '20px',
                borderRadius: menu ? '50%' : '4px',
                transition: 'border-radius 200ms ease-in-out',
            };
        },
    },
};
</script>

<style>
.symper-color-picker {
    display: inline-block;
    height: 30px;
}
</style>

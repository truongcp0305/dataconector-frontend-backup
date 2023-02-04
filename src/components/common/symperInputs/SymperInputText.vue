<template>
    <div
        class="symper-input"
        :style="{
            width: width,
        }"
    >
        <input
            v-model="lazyValue"
            class="symper-input-field"
            type="text"
            :style="{
                width: this.icon ? 'calc(100% - 18px)' : '100%',
            }"
        />
        <i :class="'mdi ' + icon" style="fontsize: 16px" v-if="icon"></i>
    </div>
</template>

<script>
export default {
    computed: {
        lazyValue: {
            get() {
                return this.value;
            },
            set(vl) {
                this.$emit('input', vl);
            },
        },
    },
    props: {
        width: {
            type: String,
            default: '100%',
        },
        value: {
            default: '',
        },
        icon: {
            default: '',
        },
    },
};
</script>

<style>
.symper-input {
    display: inline-block;
    padding: 4px 6px;
    height: 28px;
}

.symper-input input {
    border: none;
}
</style>

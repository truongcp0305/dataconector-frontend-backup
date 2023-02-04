<template>
    <v-text-field
        v-model="lazyValue"
        class="symper-small-size"
        :type="show ? 'text' : 'password'"
        :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append="show = !show"
        :label="label"
        solo
        dense
        autocomplete="new-password"
        :placeholder="placeholder"
    ></v-text-field>
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
            }
        }
    },
    data() {
        return {
            show: false
        };
    },
    props: {
        value: {
            default: ''
        },
        label: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        }
    }
};
</script>


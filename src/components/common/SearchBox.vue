<template>
    <div class="symper-search-input">
        <v-text-field
            :id="searchBoxId"
            @input="handleInput"
            @change="handleChange"
            @keypress="handleKeyPress"
            @keydown="handleKeyDown"
            @focus="handleFocus"
            @blur="handleBlur"
            @keydown.enter="handleEnter"
            v-model="lazyValue"
            :disabled="disableBoxSearch"
            :append-icon="$i('input.search')"
            outlined
            dense
            label="Search"
            :placeholder="$t('common.enter_to_search')"
            class="d-inline-block mr-2 sym-small-size"
            single-line
            hint="This field uses counter prop"
            autocomplete="off"
        ></v-text-field>
    </div>
</template>

<script>
import { SYMPER_APP } from '../../main';
export default {
    methods: {
        handleEnter() {
            this.$emit('enter', this.lazyValue);
        },
        handleInput(val) {
            this.$emit('input', this.lazyValue);
        },
        handleChange(val) {
            this.$emit('change', this.lazyValue);
        },
        handleKeyPress(e) {
            if (
                e.code == 'Enter' &&
                (this.lazyValue.trim() != '' || this.searchBlank)
            ) {
                this.$emit('search-input-change', this.lazyValue);
            }
        },
        handleFocus(val) {
            this.$emit('focus', this.lazyValue);
        },

        handleBlur(val) {
            this.$emit('blur', this.lazyValue);
        },
        handleKeyDown(e) {
            this.$emit('key-down', e);
        },
        focus() {
            document.getElementById(this.searchBoxId).focus();
        }
    },
    watch: {
        value() {
            this.lazyValue = this.value;
        }
    },
    created() {
        this.lazyValue = this.value;
    },
    props: {
        searchBoxId: {
            type: String,
            default: 'symper-search-box'
        },
        value: {
            default: ''
        },
        placeholder: {
            default: () => {
                return SYMPER_APP.$t('common.search');
            }
        },
        searchBlank: {
            type: Boolean,
            default: false
        },
        disableBoxSearch: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            lazyValue: ''
        };
    }
};
</script>

<style>
.symper-search-input {
    width: 100%;
    height: 28px;
    vertical-align: middle;
    position: relative;
    border-radius: 4px;
}
.symper-search-input .v-input {
    width: 210px;
}
</style>
